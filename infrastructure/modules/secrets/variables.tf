variable "project" {
  type = string
}

variable "environment" {
  type = string
}

variable "db_username" {
  type      = string
  sensitive = true
}

variable "db_password" {
  description = "Set via TF_VAR_db_password env var or a tfvars file excluded from version control - never committed"
  type        = string
  sensitive   = true
}

variable "jwt_private_key" {
  description = "RS256 private key (PEM), generated out-of-band and supplied at apply time"
  type        = string
  sensitive   = true
  default     = ""
}

variable "anthropic_api_key" {
  description = "Placeholder - real value is set via `aws secretsmanager put-secret-value` or a secure pipeline variable, never in tfvars committed to git"
  type        = string
  sensitive   = true
  default     = "REPLACE_ME"
}

variable "recovery_window_in_days" {
  description = "0 allows immediate deletion for staging iteration; production should keep AWS's recovery window"
  type        = number
  default     = 7
}

variable "tags" {
  type    = map(string)
  default = {}
}
