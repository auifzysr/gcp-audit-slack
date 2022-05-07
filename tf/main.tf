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

resource "google_service_account" "trigger-audit" {
  account_id   = local.resource_name
  display_name = local.resource_name
}

resource "google_project_iam_binding" "trigger-audit" {
  project = data.google_project.project.project_id
  role    = "roles/eventarc.eventReceiver"
  members = [
    "serviceAccount:${google_service_account.trigger-audit.email}"
  ]

  depends_on = [
    google_service_account.trigger-audit
  ]
}

# TODO: restrict to specific service
resource "google_project_iam_binding" "invoke-cloudrun" {
  project = data.google_project.project.project_id
  role    = "roles/run.invoker"
  members = [
    "serviceAccount:${google_service_account.trigger-audit.email}"
  ]

  depends_on = [
    google_service_account.trigger-audit
  ]
}

resource "google_eventarc_trigger" "trigger-audit" {
  name     = local.resource_name
  location = var.region

  matching_criteria {
    attribute = "type"
    value     = "google.cloud.audit.log.v1.written"
  }
  matching_criteria {
    attribute = "serviceName"
    value     = "storage.googleapis.com"
  }
  matching_criteria {
    attribute = "methodName"
    value     = "storage.buckets.list"
  }
  destination {
    cloud_run_service {
      service = "pubsub-slack-dev"
      region  = var.region
    }
  }
  service_account = google_service_account.trigger-audit.email

  depends_on = [
    google_project_service.eventarc,
    google_service_account.trigger-audit
  ]
}
