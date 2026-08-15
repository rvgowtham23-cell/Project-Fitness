variable "project" {
  type = string
}

variable "environment" {
  type = string
}

variable "vpc_cidr" {
  type    = string
  default = "10.0.0.0/16"
}

variable "azs" {
  description = "Availability zones to spread subnets across"
  type        = list(string)
}

variable "public_subnet_cidrs" {
  type = list(string)
}

variable "private_subnet_cidrs" {
  type = list(string)
}

variable "single_nat_gateway" {
  description = "One shared NAT gateway instead of one per AZ - cost tradeoff acceptable for staging, not for production HA"
  type        = bool
  default     = true
}

variable "tags" {
  type    = map(string)
  default = {}
}
