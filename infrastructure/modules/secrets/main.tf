locals {
  name_prefix = "${var.project}-${var.environment}"
}

# One JSON secret per logical credential set (rather than one giant blob) so
# ECS task definitions can grant least-privilege access per-secret via
# valueFrom ARNs, and rotation of one credential doesn't touch the others.
resource "aws_secretsmanager_secret" "db_credentials" {
  name                    = "${local.name_prefix}/db-credentials"
  recovery_window_in_days = var.recovery_window_in_days

  tags = merge(var.tags, {
    Name = "${local.name_prefix}-db-credentials"
  })
}

resource "aws_secretsmanager_secret_version" "db_credentials" {
  secret_id = aws_secretsmanager_secret.db_credentials.id
  secret_string = jsonencode({
    username = var.db_username
    password = var.db_password
  })
}

resource "aws_secretsmanager_secret" "jwt" {
  name                    = "${local.name_prefix}/jwt-keys"
  recovery_window_in_days = var.recovery_window_in_days

  tags = merge(var.tags, {
    Name = "${local.name_prefix}-jwt-keys"
  })
}

resource "aws_secretsmanager_secret_version" "jwt" {
  secret_id = aws_secretsmanager_secret.jwt.id
  secret_string = jsonencode({
    private_key = var.jwt_private_key
  })

  lifecycle {
    ignore_changes = [secret_string]
  }
}

# AI provider keys are rotated/rolled independently of app deploys, so this
# secret is intentionally seeded with a placeholder and updated out-of-band
# (console, CLI, or a separate secrets-rotation pipeline) rather than via
# `terraform apply` re-writing it on every run.
resource "aws_secretsmanager_secret" "ai_provider_keys" {
  name                    = "${local.name_prefix}/ai-provider-keys"
  recovery_window_in_days = var.recovery_window_in_days

  tags = merge(var.tags, {
    Name = "${local.name_prefix}-ai-provider-keys"
  })
}

resource "aws_secretsmanager_secret_version" "ai_provider_keys" {
  secret_id = aws_secretsmanager_secret.ai_provider_keys.id
  secret_string = jsonencode({
    ANTHROPIC_API_KEY = var.anthropic_api_key
  })

  lifecycle {
    ignore_changes = [secret_string]
  }
}
