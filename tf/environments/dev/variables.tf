variable "region" {
  description = "GCP region"
  type        = string
  default     = "asia-northeast1"
}

variable "zone" {
  description = "GCP zone"
  type        = string
  default     = "asia-northeast1-a"
}

variable "project_id" {
  description = "GCP project ID"
  type        = string
}

variable "resource_name_prefix" {
  description = "Resource name prefix"
  type        = string
  default     = "audit-slack"
}

variable "slack_token" {
  description = "Slack token"
  type        = string
}

variable "slack_channel" {
  description = "Slack channel"
  type        = string
}
