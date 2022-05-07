locals {
  env = "dev"
}

provider "google" {
  project = var.project_id
}

module "stack" {
  source               = "../../modules/stack"
  project_id           = var.project_id
  env                  = local.env
  resource_name_prefix = var.resource_name_prefix
  slack_token          = var.slack_token
  slack_channel        = var.slack_channel
}
