# Scaffolded-but-optional for MVP (architecture doc section D) - the web dashboard
# is server-rendered Next.js and the mobile app talks straight to the ALB, so
# CDN caching isn't on the MVP critical path. Wire this up when static asset
# volume or global latency actually justifies it.

variable "project" {
  type = string
}

variable "environment" {
  type = string
}

variable "enabled" {
  type    = bool
  default = false
}

variable "origin_domain_name" {
  description = "e.g. the ALB DNS name or an S3 static site endpoint"
  type        = string
  default     = ""
}

variable "price_class" {
  type    = string
  default = "PriceClass_100"
}

variable "tags" {
  type    = map(string)
  default = {}
}
