# -----------------------------------------------------------------------------
# infrastructure/ layout (see repo root docs/architecture-plan.md section D for the
# full stack rationale):
#
#   modules/vpc          - VPC, public/private subnets, NAT, route tables
#   modules/ecs          - ECS cluster + ALB (created once) and a reusable
#                          Fargate service/task-definition unit, called once
#                          per app (backend = public, ai-service = internal
#                          via Cloud Map)
#   modules/rds          - Postgres instance, subnet group, security group
#   modules/elasticache  - Redis replication group
#   modules/s3           - Private, SSE-KMS meal-image bucket + lifecycle
#   modules/secrets      - Secrets Manager entries (DB creds, JWT key,
#                          ANTHROPIC_API_KEY) - no plaintext values in git
#   modules/cloudfront   - Optional CDN, disabled by default (not needed for
#                          MVP - see module comment)
#
#   environments/staging     - this file: smaller sizing, single NAT, no
#                              Multi-AZ, no autoscaling
#   environments/production  - Multi-AZ RDS, per-AZ NAT, ECS autoscaling
#
# Both environments wire the same modules together with different variable
# values (infrastructure/environments/*/variables.tf) - no module logic
# forks between environments.
# -----------------------------------------------------------------------------

terraform {
  required_version = ">= 1.5.0"

  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.0"
    }
  }

  # See ../../backend.tf.example - remote state is not wired up yet because
  # no state bucket/lock table exists. Copy that file to backend.tf here once
  # they've been provisioned.
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
  single_nat_gateway   = true
  tags                 = local.tags
}

module "ecs_backend" {
  source = "../../modules/ecs"

  project     = var.project
  environment = var.environment
  vpc_id      = module.vpc.vpc_id

  public_subnet_ids   = module.vpc.public_subnet_ids
  private_subnet_ids  = module.vpc.private_subnet_ids

  create_cluster                     = true
  create_alb                         = true
  create_service_discovery_namespace = true
  certificate_arn                    = var.certificate_arn

  service_name       = "backend"
  public             = true
  container_image    = var.backend_image
  container_port     = 3000
  health_check_path  = "/api/v1/health"
  cpu                = var.backend_cpu
  memory             = var.backend_memory
  desired_count      = var.backend_desired_count
  enable_autoscaling = false

  environment_variables = {
    NODE_ENV     = "staging"
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

  create_cluster                     = false
  existing_cluster_id                = module.ecs_backend.cluster_id
  create_alb                         = false
  existing_alb_listener_arn          = module.ecs_backend.alb_listener_arn
  create_service_discovery_namespace = false
  existing_service_discovery_namespace_id = module.ecs_backend.service_discovery_namespace_id

  service_name       = "ai-service"
  public             = false
  container_image    = var.ai_service_image
  container_port     = 8000
  health_check_path  = "/health"
  cpu                = var.ai_service_cpu
  memory             = var.ai_service_memory
  desired_count      = var.ai_service_desired_count
  enable_autoscaling = false

  # Only the backend's task SG may call the AI service - it is never
  # reachable from the public internet or from the ALB.
  additional_ingress_security_group_ids = [module.ecs_backend.service_security_group_id]

  environment_variables = {
    ENVIRONMENT = "staging"
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
  multi_az        = false
  master_username = var.db_master_username
  master_password = var.db_master_password

  deletion_protection  = false
  skip_final_snapshot  = true

  tags = local.tags
}

module "elasticache" {
  source = "../../modules/elasticache"

  project     = var.project
  environment = var.environment

  vpc_id                     = module.vpc.vpc_id
  private_subnet_ids         = module.vpc.private_subnet_ids
  allowed_security_group_ids = [module.ecs_backend.service_security_group_id, module.ecs_ai_service.service_security_group_id]

  node_type                  = var.redis_node_type
  num_cache_clusters         = 1
  automatic_failover_enabled = false

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

  recovery_window_in_days = 0

  tags = local.tags
}

# Disabled for staging - see modules/cloudfront/variables.tf.
module "cloudfront" {
  source = "../../modules/cloudfront"

  project     = var.project
  environment = var.environment
  enabled     = false

  tags = local.tags
}
