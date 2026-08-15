variable "aws_region" {
  type    = string
  default = "ap-south-1"
}

variable "environment" {
  type    = string
  default = "staging"
}

variable "project" {
  type    = string
  default = "fitness-platform"
}

variable "vpc_cidr" {
  type    = string
  default = "10.10.0.0/16"
}

variable "azs" {
  type    = list(string)
  default = ["ap-south-1a", "ap-south-1b"]
}

variable "public_subnet_cidrs" {
  type    = list(string)
  default = ["10.10.0.0/24", "10.10.1.0/24"]
}

variable "private_subnet_cidrs" {
  type    = list(string)
  default = ["10.10.10.0/24", "10.10.11.0/24"]
}

variable "certificate_arn" {
  description = "ACM certificate ARN for the staging ALB HTTPS listener - issue out-of-band before applying"
  type        = string
}

variable "meal_images_bucket_name" {
  description = "Must be globally unique - e.g. fitness-platform-staging-meal-images-<account-id>"
  type        = string
}

variable "db_master_username" {
  type      = string
  sensitive = true
  default   = "fitness_app"
}

variable "db_master_password" {
  type      = string
  sensitive = true
}

variable "anthropic_api_key" {
  type      = string
  sensitive = true
  default   = "REPLACE_ME"
}

variable "backend_image" {
  description = "Full ECR image URI, e.g. <account-id>.dkr.ecr.ap-south-1.amazonaws.com/fitness-platform-backend:latest"
  type        = string
}

variable "ai_service_image" {
  description = "Full ECR image URI for the ai-service"
  type        = string
}

variable "rds_instance_class" {
  type    = string
  default = "db.t4g.micro"
}

variable "redis_node_type" {
  type    = string
  default = "cache.t4g.micro"
}

variable "backend_cpu" {
  type    = number
  default = 256
}

variable "backend_memory" {
  type    = number
  default = 512
}

variable "backend_desired_count" {
  type    = number
  default = 1
}

variable "ai_service_cpu" {
  type    = number
  default = 512
}

variable "ai_service_memory" {
  type    = number
  default = 1024
}

variable "ai_service_desired_count" {
  type    = number
  default = 1
}
