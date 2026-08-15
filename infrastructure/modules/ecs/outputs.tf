output "cluster_id" {
  value = local.cluster_id
}

output "alb_listener_arn" {
  value = local.alb_listener_arn
}

output "alb_dns_name" {
  value = var.create_alb ? aws_lb.this[0].dns_name : null
}

output "alb_security_group_id" {
  value = var.create_alb ? aws_security_group.alb[0].id : null
}

output "service_discovery_namespace_id" {
  value = local.service_discovery_namespace_id
}

output "service_security_group_id" {
  value = aws_security_group.service.id
}

output "service_name" {
  value = aws_ecs_service.this.name
}

output "task_role_arn" {
  value = aws_iam_role.task.arn
}

output "execution_role_arn" {
  value = aws_iam_role.execution.arn
}
