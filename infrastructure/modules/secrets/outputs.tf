output "db_credentials_secret_arn" {
  value = aws_secretsmanager_secret.db_credentials.arn
}

output "jwt_secret_arn" {
  value = aws_secretsmanager_secret.jwt.arn
}

output "ai_provider_keys_secret_arn" {
  value = aws_secretsmanager_secret.ai_provider_keys.arn
}
