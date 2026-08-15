variable "project" {
  type = string
}

variable "environment" {
  type = string
}

variable "vpc_id" {
  type = string
}

variable "public_subnet_ids" {
  type    = list(string)
  default = []
}

variable "private_subnet_ids" {
  type = list(string)
}

# --- Cluster / ALB / service-discovery sharing -----------------------------
# The ECS cluster, ALB, and Cloud Map namespace are per-environment singletons.
# The first module call (the backend, which is publicly reachable) creates
# them; subsequent calls (ai-service, internal-only) pass the outputs back in
# instead of re-creating them.

variable "create_cluster" {
  type    = bool
  default = false
}

variable "existing_cluster_id" {
  type    = string
  default = null
}

variable "create_alb" {
  description = "Only the public-facing service (backend) needs an ALB; ai-service is called internally and does not"
  type        = bool
  default     = false
}

variable "existing_alb_listener_arn" {
  type    = string
  default = null
}

variable "certificate_arn" {
  description = "ACM cert for the HTTPS listener; required only when create_alb = true"
  type        = string
  default     = null
}

variable "create_service_discovery_namespace" {
  type    = bool
  default = false
}

variable "existing_service_discovery_namespace_id" {
  type    = string
  default = null
}

# --- Per-service configuration ---------------------------------------------

variable "service_name" {
  description = "e.g. \"backend\" or \"ai-service\" - used to name the task def, service, log group, target group"
  type        = string
}

variable "public" {
  description = "true = register with the ALB (backend); false = Cloud Map service discovery only (ai-service)"
  type        = bool
  default     = false
}

variable "container_image" {
  type = string
}

variable "container_port" {
  type = number
}

variable "health_check_path" {
  type    = string
  default = "/health"
}

variable "cpu" {
  type    = number
  default = 256
}

variable "memory" {
  type    = number
  default = 512
}

variable "desired_count" {
  type    = number
  default = 1
}

variable "environment_variables" {
  description = "Plain (non-secret) container env vars"
  type        = map(string)
  default     = {}
}

variable "secrets" {
  description = "Map of container env var name -> Secrets Manager ARN, injected at task launch and never written to the image or repo"
  type        = map(string)
  default     = {}
}

variable "log_retention_days" {
  type    = number
  default = 30
}

variable "enable_autoscaling" {
  description = "Production runs autoscaling on CPU/memory; staging's fixed desired_count is enough for a small team's load"
  type        = bool
  default     = false
}

variable "autoscaling_min_capacity" {
  type    = number
  default = 1
}

variable "autoscaling_max_capacity" {
  type    = number
  default = 4
}

variable "autoscaling_cpu_target" {
  type    = number
  default = 60
}

variable "path_pattern" {
  description = "ALB listener rule path pattern for this service, only used when public = true"
  type        = string
  default     = "/*"
}

variable "listener_rule_priority" {
  type    = number
  default = 100
}

variable "additional_ingress_security_group_ids" {
  description = "Extra security groups allowed to reach this service on container_port (e.g. the backend's SG, for ai-service)"
  type        = list(string)
  default     = []
}

variable "tags" {
  type    = map(string)
  default = {}
}
