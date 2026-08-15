output "bucket_id" {
  value = aws_s3_bucket.meal_images.id
}

output "bucket_arn" {
  value = aws_s3_bucket.meal_images.arn
}

output "kms_key_arn" {
  value = aws_kms_key.meal_images.arn
}
