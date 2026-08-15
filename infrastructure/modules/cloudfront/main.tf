locals {
  name_prefix = "${var.project}-${var.environment}"
}

resource "aws_cloudfront_distribution" "this" {
  count   = var.enabled ? 1 : 0
  enabled = true
  comment = "${local.name_prefix} distribution"

  origin {
    domain_name = var.origin_domain_name
    origin_id   = "${local.name_prefix}-origin"

    custom_origin_config {
      http_port              = 80
      https_port             = 443
      origin_protocol_policy = "https-only"
      origin_ssl_protocols   = ["TLSv1.2"]
    }
  }

  default_cache_behavior {
    allowed_methods        = ["GET", "HEAD", "OPTIONS"]
    cached_methods         = ["GET", "HEAD"]
    target_origin_id       = "${local.name_prefix}-origin"
    viewer_protocol_policy = "redirect-to-https"

    forwarded_values {
      query_string = true
      cookies {
        forward = "none"
      }
    }
  }

  restrictions {
    geo_restriction {
      restriction_type = "none"
    }
  }

  viewer_certificate {
    cloudfront_default_certificate = true
  }

  price_class = var.price_class

  tags = merge(var.tags, {
    Name = "${local.name_prefix}-cdn"
  })
}
