# See infrastructure/environments/staging/main.tf for the full module-layout
# explanation - this file wires the same modules with production sizing:
# Multi-AZ RDS, one NAT gateway per AZ, and ECS autoscaling enabled.

terraform {
  required_version = ">= 1.5.0"

  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.0"
    }
  }

  # See ../../backend.tf.example - copy it in here once the remote state
  # bucket/lock table exist. Production state should never be local-only.
}

provider "aws" {
  region = var.aws_region

  default_tags {
    tags = {
      Project     = var.project
      Environment = var.environment
      ManagedBy   = "terraform"
    }
  }
}

locals {
  tags = {
    Project     = var.project
    Environment = var.environment
  }
}

module "vpc" {
  source = "../../modules/vpc"

  project              = var.project
  environment          = var.environment
  vpc_cidr             = var.vpc_cidr
  azs                  = var.azs
  public_subnet_cidrs  = var.public_subnet_cidrs
  private_subnet_cidrs = var.private_subnet_cidrs

  # One NAT per AZ - a shared single NAT would make egress (and therefore
  # every outbound Anthropic/OpenFoodFacts call) an AZ-failure single point
  # of failure in production.
  single_nat_gateway = false

  tags = local.tags
}

module "ecs_backend" {
  source = "../../modules/ecs"

  project     = var.project
  environment = var.environment
  vpc_id      = module.vpc.vpc_id

  public_subnet_ids  = module.vpc.public_subnet_ids
  private_subnet_ids = module.vpc.private_subnet_ids

  create_cluster                     = true
  create_alb                         = true
  create_service_discovery_namespace = true
  certificate_arn                    = var.certificate_arn

  service_name      = "backend"
  public            = true
  container_image   = var.backend_image
  container_port    = 3000
  health_check_path = "/api/v1/health"
  cpu               = var.backend_cpu
  memory            = var.backend_memory
  desired_count     = var.backend_desired_count

  enable_autoscaling       = true
  autoscaling_min_capacity = var.backend_desired_count
  autoscaling_max_capacity = var.backend_autoscaling_max_capacity

  environment_variables = {
    NODE_ENV       = "production"
    AI_SERVICE_URL = "http://ai-service.${var.environment}.${var.project}.internal:8000"
  }

  secrets = {
    DB_CREDENTIALS_SECRET_ARN = module.secrets.db_credentials_secret_arn
    JWT_SECRET_ARN            = module.secrets.jwt_secret_arn
  }

  tags = local.tags
}

module "ecs_ai_service" {
  source = "../../modules/ecs"

  project     = var.project
  environment = var.environment
  vpc_id      = module.vpc.vpc_id

  private_subnet_ids = module.vpc.private_subnet_ids

  create_cluster                          = false
  existing_cluster_id                     = module.ecs_backend.cluster_id
  create_alb                              = false
  existing_alb_listener_arn               = module.ecs_backend.alb_listener_arn
  create_service_discovery_namespace      = false
  existing_service_discovery_namespace_id = module.ecs_backend.service_discovery_namespace_id

  service_name      = "ai-service"
  public            = false
  container_image   = var.ai_service_image
  container_port    = 8000
  health_check_path = "/health"
  cpu               = var.ai_service_cpu
  memory            = var.ai_service_memory
  desired_count     = var.ai_service_desired_count

  enable_autoscaling       = true
  autoscaling_min_capacity = var.ai_service_desired_count
  autoscaling_max_capacity = var.ai_service_autoscaling_max_capacity

  additional_ingress_security_group_ids = [module.ecs_backend.service_security_group_id]

  environment_variables = {
    ENVIRONMENT = "production"
  }

  secrets = {
    ANTHROPIC_API_KEY = module.secrets.ai_provider_keys_secret_arn
  }

  tags = local.tags
}

module "rds" {
  source = "../../modules/rds"

  project     = var.project
  environment = var.environment

  vpc_id                     = module.vpc.vpc_id
  private_subnet_ids         = module.vpc.private_subnet_ids
  allowed_security_group_ids = [module.ecs_backend.service_security_group_id]

  instance_class  = var.rds_instance_class
  master_username = var.db_master_username
  master_password = var.db_master_password

  # Multi-AZ only in production - the extra standby-replica cost isn't
  # justified for staging, where a brief failover gap is acceptable.
  multi_az = true

  deletion_protection          = true
  skip_final_snapshot          = false
  performance_insights_enabled = true

  tags = local.tags
}

module "elasticache" {
  source = "../../modules/elasticache"

  project     = var.project
  environment = var.environment

  vpc_id                     = module.vpc.vpc_id
  private_subnet_ids         = module.vpc.private_subnet_ids
  allowed_security_group_ids = [module.ecs_backend.service_security_group_id, module.ecs_ai_service.service_security_group_id]

  node_type = var.redis_node_type

  # Primary + replica so a node failure triggers automatic failover instead
  # of taking down rollup caching / BullMQ / rate limiting in production.
  num_cache_clusters         = 2
  automatic_failover_enabled = true

  tags = local.tags
}

module "s3" {
  source = "../../modules/s3"

  project     = var.project
  environment = var.environment
  bucket_name = var.meal_images_bucket_name

  tags = local.tags
}

module "secrets" {
  source = "../../modules/secrets"

  project     = var.project
  environment = var.environment

  db_username       = var.db_master_username
  db_password       = var.db_master_password
  anthropic_api_key = var.anthropic_api_key

  recovery_window_in_days = 30

  tags = local.tags
}

module "cloudfront" {
  source = "../../modules/cloudfront"

  project     = var.project
  environment = var.environment
  enabled     = var.enable_cloudfront
  origin_domain_name = module.ecs_backend.alb_dns_name

  tags = local.tags
}
