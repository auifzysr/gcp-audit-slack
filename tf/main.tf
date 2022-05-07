provider "google" {
  project = var.project_id
  region  = var.region
  zone    = var.zone
}

locals {
  resource_name = "${var.resource_name_prefix}-${var.env}"
}

data "google_project" "project" {
}

resource "google_project_service" "eventarc" {
  project = data.google_project.project.id
  service = "eventarc.googleapis.com"
}

resource "google_eventarc_trigger" "trigger-audit" {
  name     = local.resource_name
  location = var.region

  matching_criteria {
    attribute = "type"
    value     = "google.cloud.pubsub.topic.v1.messagePublished"
  }
  destination {
    cloud_run_service {
      service = "pubsub-slack"
      region  = var.region
    }
  }

  depends_on = [
    google_project_service.eventarc
  ]
}
