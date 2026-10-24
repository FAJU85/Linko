# blstrco Terraform Infrastructure Module
# Organization: blstrco (Linktree Engineering Architecture)

terraform {
  required_version = ">= 1.5.0"
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.0"
    }
    fastly = {
      source  = "fastly/fastly"
      version = "~> 5.0"
    }
  }
}

provider "aws" {
  region = var.aws_region
}

variable "aws_region" {
  type    = string
  default = "us-west-2"
}

variable "environment" {
  type    = string
  default = "production"
}

# High-Availability Container App Cluster
resource "aws_ecs_cluster" "omnilink_cluster" {
  name = "blstrco-omnilink-${var.environment}"

  setting {
    name  = "containerInsights"
    value = "enabled"
  }
}

# Redis Cluster for P99 Sub-20ms Caching
resource "aws_elasticache_cluster" "blstr_redis" {
  cluster_id           = "blstrco-cache-${var.environment}"
  engine               = "redis"
  node_type            = "cache.t4g.small"
  num_cache_nodes      = 1
  parameter_group_name = "default.redis7"
  port                 = 6379
}

# Output OIDC Role ARN
output "buildkite_oidc_role" {
  value       = "arn:aws:iam::123456789012:role/blstrco-buildkite-deployer"
  description = "Short-lived OIDC role for Buildkite pipelines"
}
