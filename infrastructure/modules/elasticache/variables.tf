variable "project" {
  type = string
}

variable "environment" {
  type = string
}

variable "vpc_id" {
  type = string
}

variable "private_subnet_ids" {
  type = list(string)
}

variable "allowed_security_group_ids" {
  description = "Security groups (ECS task SGs) permitted to reach Redis on 6379"
  type        = list(string)
}

variable "node_type" {
  type    = string
  default = "cache.t4g.micro"
}

variable "engine_version" {
  type    = string
  default = "7.1"
}

variable "num_cache_clusters" {
  description = "1 = single node (staging), 2+ = primary + replica for automatic failover (production)"
  type        = number
  default     = 1
}

variable "automatic_failover_enabled" {
  description = "Requires num_cache_clusters >= 2; false for staging's single-node setup"
  type        = bool
  default     = false
}

variable "tags" {
  type    = map(string)
  default = {}
}
