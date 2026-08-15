output "alb_dns_name" {
  value = module.ecs_backend.alb_dns_name
}

output "rds_endpoint" {
  value = module.rds.db_endpoint
}

output "redis_endpoint" {
  value = module.elasticache.primary_endpoint_address
}

output "meal_images_bucket" {
  value = module.s3.bucket_id
}

output "cloudfront_domain_name" {
  value = module.cloudfront.distribution_domain_name
}
