variable "project" {
  type = string
}

variable "environment" {
  type = string
}

variable "bucket_name" {
  description = "Globally-unique bucket name (e.g. include account id or a random suffix at call site)"
  type        = string
}

variable "meal_image_retention_days" {
  description = "Days before raw meal-photo originals transition to cheaper storage; set higher/lower per environment"
  type        = number
  default     = 90
}

variable "meal_image_expiration_days" {
  description = "Days before meal-photo originals are deleted outright, 0 to disable expiration"
  type        = number
  default     = 0
}

variable "tags" {
  type    = map(string)
  default = {}
}
