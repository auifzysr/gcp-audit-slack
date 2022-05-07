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

variable "env" {
  description = "Environment"
  type        = string
  default     = "dev"
}

variable "resource_name_prefix" {
  description = "Resource name prefix"
  type        = string
  default     = "audit-slack"
}
