locals {
  name_prefix = "${var.project}-${var.environment}"

  cluster_id                     = var.create_cluster ? aws_ecs_cluster.this[0].id : var.existing_cluster_id
  alb_listener_arn               = var.create_alb ? aws_lb_listener.https[0].arn : var.existing_alb_listener_arn
  service_discovery_namespace_id = var.create_service_discovery_namespace ? aws_service_discovery_private_dns_namespace.this[0].id : var.existing_service_discovery_namespace_id

  # ALB and target group names are hard-capped at 32 chars by AWS itself, and
  # IAM role names at 64 (name_prefix additionally reserves ~26 chars for
  # Terraform's own uniqueness suffix) - "${project}-${environment}-${service}"
  # alone can exceed both once real project/env names are in play, so
  # anything AWS length-limits gets a short, collision-resistant hashed form
  # instead of the fully descriptive name_prefix.
  short_id       = substr(md5("${var.project}-${var.environment}-${var.service_name}"), 0, 8)
  alb_name       = substr("${var.project}-${var.environment}-alb", 0, 32)
  target_group_name = substr("${substr(var.service_name, 0, 20)}-${local.short_id}", 0, 32)
  iam_prefix     = "${substr(var.service_name, 0, 15)}-${local.short_id}-"
}

# ---------------------------------------------------------------------------
# Cluster (created once - by the first/public service call)
# ---------------------------------------------------------------------------

resource "aws_ecs_cluster" "this" {
  count = var.create_cluster ? 1 : 0
  name  = "${local.name_prefix}-cluster"

  setting {
    name  = "containerInsights"
    value = "enabled"
  }

  tags = merge(var.tags, {
    Name = "${local.name_prefix}-cluster"
  })
}

# ---------------------------------------------------------------------------
# ALB (created once, public subnets - only the backend needs a public entry
# point; ai-service is reached over Cloud Map inside the VPC)
# ---------------------------------------------------------------------------

resource "aws_security_group" "alb" {
  count       = var.create_alb ? 1 : 0
  name_prefix = "${local.name_prefix}-alb-"
  description = "Internet-facing ALB - HTTPS only"
  vpc_id      = var.vpc_id

  ingress {
    from_port   = 443
    to_port     = 443
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }

  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }

  tags = merge(var.tags, {
    Name = "${local.name_prefix}-alb-sg"
  })

  lifecycle {
    create_before_destroy = true
  }
}

resource "aws_lb" "this" {
  count              = var.create_alb ? 1 : 0
  name               = local.alb_name
  internal           = false
  load_balancer_type = "application"
  security_groups    = [aws_security_group.alb[0].id]
  subnets            = var.public_subnet_ids

  tags = merge(var.tags, {
    Name = "${local.name_prefix}-alb"
  })
}

resource "aws_lb_listener" "https" {
  count             = var.create_alb ? 1 : 0
  load_balancer_arn = aws_lb.this[0].arn
  port              = 443
  protocol          = "HTTPS"
  ssl_policy        = "ELBSecurityPolicy-TLS13-1-2-2021-06"
  certificate_arn   = var.certificate_arn

  default_action {
    type = "fixed-response"

    fixed_response {
      content_type = "text/plain"
      message_body = "not found"
      status_code  = "404"
    }
  }
}

# Plain HTTP just redirects to HTTPS - the API never serves unencrypted traffic.
resource "aws_lb_listener" "http_redirect" {
  count             = var.create_alb ? 1 : 0
  load_balancer_arn = aws_lb.this[0].arn
  port              = 80
  protocol          = "HTTP"

  default_action {
    type = "redirect"

    redirect {
      port        = "443"
      protocol    = "HTTPS"
      status_code = "HTTP_301"
    }
  }
}

# ---------------------------------------------------------------------------
# Cloud Map namespace (created once) - lets the backend call ai-service by a
# stable internal DNS name without going through the public ALB.
# ---------------------------------------------------------------------------

resource "aws_service_discovery_private_dns_namespace" "this" {
  count = var.create_service_discovery_namespace ? 1 : 0
  name  = "${var.environment}.${var.project}.internal"
  vpc   = var.vpc_id

  tags = var.tags
}

resource "aws_service_discovery_service" "this" {
  count = var.public ? 0 : 1
  name  = var.service_name

  dns_config {
    namespace_id = local.service_discovery_namespace_id

    dns_records {
      ttl  = 10
      type = "A"
    }
  }

  health_check_custom_config {
    failure_threshold = 1
  }
}

# ---------------------------------------------------------------------------
# Per-service resources: task definition, service, target group / discovery,
# IAM roles, security group, logs, autoscaling.
# ---------------------------------------------------------------------------

resource "aws_cloudwatch_log_group" "this" {
  name              = "/ecs/${local.name_prefix}-${var.service_name}"
  retention_in_days = var.log_retention_days

  tags = var.tags
}

resource "aws_security_group" "service" {
  name_prefix = "${local.name_prefix}-${var.service_name}-"
  description = "ECS task SG for ${var.service_name}"
  vpc_id      = var.vpc_id

  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }

  tags = merge(var.tags, {
    Name = "${local.name_prefix}-${var.service_name}-sg"
  })

  lifecycle {
    create_before_destroy = true
  }
}

resource "aws_security_group_rule" "from_alb" {
  count                    = var.public ? 1 : 0
  type                     = "ingress"
  from_port                = var.container_port
  to_port                  = var.container_port
  protocol                 = "tcp"
  security_group_id        = aws_security_group.service.id
  source_security_group_id = aws_security_group.alb[0].id
}

resource "aws_security_group_rule" "from_additional" {
  for_each                 = toset(var.additional_ingress_security_group_ids)
  type                     = "ingress"
  from_port                = var.container_port
  to_port                  = var.container_port
  protocol                 = "tcp"
  security_group_id        = aws_security_group.service.id
  source_security_group_id = each.value
}

resource "aws_lb_target_group" "this" {
  count       = var.public ? 1 : 0
  name        = local.target_group_name
  port        = var.container_port
  protocol    = "HTTP"
  vpc_id      = var.vpc_id
  target_type = "ip"

  health_check {
    path                = var.health_check_path
    healthy_threshold   = 2
    unhealthy_threshold = 3
    interval            = 30
    timeout             = 5
    matcher             = "200-399"
  }

  deregistration_delay = 30

  tags = var.tags
}

resource "aws_lb_listener_rule" "this" {
  count        = var.public ? 1 : 0
  listener_arn = local.alb_listener_arn
  priority     = var.listener_rule_priority

  action {
    type             = "forward"
    target_group_arn = aws_lb_target_group.this[0].arn
  }

  condition {
    path_pattern {
      values = [var.path_pattern]
    }
  }
}

data "aws_iam_policy_document" "task_assume" {
  statement {
    actions = ["sts:AssumeRole"]
    principals {
      type        = "Service"
      identifiers = ["ecs-tasks.amazonaws.com"]
    }
  }
}

resource "aws_iam_role" "execution" {
  name_prefix        = "${local.iam_prefix}exec-"
  assume_role_policy = data.aws_iam_policy_document.task_assume.json
  tags               = var.tags
}

resource "aws_iam_role_policy_attachment" "execution_managed" {
  role       = aws_iam_role.execution.name
  policy_arn = "arn:aws:iam::aws:policy/service-role/AmazonECSTaskExecutionRolePolicy"
}

# Execution role only needs read access to the specific secrets this task
# uses - not blanket Secrets Manager access - to keep blast radius small if a
# task definition is ever compromised.
data "aws_iam_policy_document" "execution_secrets" {
  count = length(var.secrets) > 0 ? 1 : 0

  statement {
    actions   = ["secretsmanager:GetSecretValue"]
    resources = values(var.secrets)
  }
}

resource "aws_iam_role_policy" "execution_secrets" {
  count  = length(var.secrets) > 0 ? 1 : 0
  name   = "${local.name_prefix}-${var.service_name}-secrets"
  role   = aws_iam_role.execution.id
  policy = data.aws_iam_policy_document.execution_secrets[0].json
}

resource "aws_iam_role" "task" {
  name_prefix        = "${local.iam_prefix}task-"
  assume_role_policy = data.aws_iam_policy_document.task_assume.json
  tags               = var.tags
}

resource "aws_ecs_task_definition" "this" {
  family                   = "${local.name_prefix}-${var.service_name}"
  requires_compatibilities = ["FARGATE"]
  network_mode             = "awsvpc"
  cpu                      = var.cpu
  memory                   = var.memory
  execution_role_arn       = aws_iam_role.execution.arn
  task_role_arn            = aws_iam_role.task.arn

  container_definitions = jsonencode([
    {
      name      = var.service_name
      image     = var.container_image
      essential = true
      portMappings = [
        {
          containerPort = var.container_port
          protocol      = "tcp"
        }
      ]
      environment = [
        for k, v in var.environment_variables : { name = k, value = v }
      ]
      secrets = [
        for k, arn in var.secrets : { name = k, valueFrom = arn }
      ]
      logConfiguration = {
        logDriver = "awslogs"
        options = {
          "awslogs-group"         = aws_cloudwatch_log_group.this.name
          "awslogs-region"        = data.aws_region.current.name
          "awslogs-stream-prefix" = var.service_name
        }
      }
    }
  ])

  tags = var.tags
}

data "aws_region" "current" {}

resource "aws_ecs_service" "this" {
  name            = "${local.name_prefix}-${var.service_name}"
  cluster         = local.cluster_id
  task_definition = aws_ecs_task_definition.this.arn
  desired_count   = var.desired_count
  launch_type     = "FARGATE"

  network_configuration {
    subnets         = var.private_subnet_ids
    security_groups = [aws_security_group.service.id]
    # Private subnets only - ECS tasks never need a public IP; outbound calls
    # (Anthropic API, OpenFoodFacts, etc.) go through the NAT gateway.
    assign_public_ip = false
  }

  dynamic "load_balancer" {
    for_each = var.public ? [1] : []
    content {
      target_group_arn = aws_lb_target_group.this[0].arn
      container_name   = var.service_name
      container_port   = var.container_port
    }
  }

  dynamic "service_registries" {
    for_each = var.public ? [] : [1]
    content {
      registry_arn = aws_service_discovery_service.this[0].arn
    }
  }

  deployment_minimum_healthy_percent = 100
  deployment_maximum_percent         = 200

  lifecycle {
    ignore_changes = [desired_count]
  }

  depends_on = [aws_lb_listener_rule.this]

  tags = var.tags
}

resource "aws_appautoscaling_target" "this" {
  count              = var.enable_autoscaling ? 1 : 0
  max_capacity       = var.autoscaling_max_capacity
  min_capacity       = var.autoscaling_min_capacity
  resource_id        = "service/${local.cluster_id}/${aws_ecs_service.this.name}"
  scalable_dimension = "ecs:service:DesiredCount"
  service_namespace  = "ecs"
}

resource "aws_appautoscaling_policy" "cpu" {
  count              = var.enable_autoscaling ? 1 : 0
  name               = "${local.name_prefix}-${var.service_name}-cpu-target"
  policy_type        = "TargetTrackingScaling"
  resource_id        = aws_appautoscaling_target.this[0].resource_id
  scalable_dimension = aws_appautoscaling_target.this[0].scalable_dimension
  service_namespace  = aws_appautoscaling_target.this[0].service_namespace

  target_tracking_scaling_policy_configuration {
    predefined_metric_specification {
      predefined_metric_type = "ECSServiceAverageCPUUtilization"
    }
    target_value       = var.autoscaling_cpu_target
    scale_in_cooldown  = 120
    scale_out_cooldown = 60
  }
}
