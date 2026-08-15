variable "aws_region" {
  type    = string
  default = "ap-south-1"
}

variable "environment" {
  type    = string
  default = "production"
}

variable "project" {
  type    = string
  default = "fitness-platform"
}

variable "vpc_cidr" {
  type    = string
  default = "10.20.0.0/16"
}

variable "azs" {
  type    = list(string)
  default = ["ap-south-1a", "ap-south-1b"]
}

variable "public_subnet_cidrs" {
  type    = list(string)
  default = ["10.20.0.0/24", "10.20.1.0/24"]
}

variable "private_subnet_cidrs" {
  type    = list(string)
  default = ["10.20.10.0/24", "10.20.11.0/24"]
}

variable "certificate_arn" {
  description = "ACM certificate ARN for the production ALB HTTPS listener - issue out-of-band before applying"
  type        = string
}

variable "meal_images_bucket_name" {
  description = "Must be globally unique - e.g. fitness-platform-production-meal-images-<account-id>"
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
}

variable "backend_image" {
  type = string
}

variable "ai_service_image" {
  type = string
}

variable "rds_instance_class" {
  type    = string
  default = "db.t4g.medium"
}

variable "redis_node_type" {
  type    = string
  default = "cache.t4g.small"
}

variable "backend_cpu" {
  type    = number
  default = 512
}

variable "backend_memory" {
  type    = number
  default = 1024
}

variable "backend_desired_count" {
  type    = number
  default = 2
}

variable "backend_autoscaling_max_capacity" {
  type    = number
  default = 6
}

variable "ai_service_cpu" {
  type    = number
  default = 1024
}

variable "ai_service_memory" {
  type    = number
  default = 2048
}

variable "ai_service_desired_count" {
  type    = number
  default = 2
}

variable "ai_service_autoscaling_max_capacity" {
  type    = number
  default = 6
}

variable "enable_cloudfront" {
  description = "Deferred for MVP - flip on once static/CDN-cacheable traffic justifies it"
  type        = bool
  default     = false
}
