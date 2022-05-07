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

resource "google_cloud_run_service" "audit-slack" {
  name     = local.resource_name
  location = var.region

  metadata {
    annotations = {
      "run.googleapis.com/launch-stage"  = "BETA"
      "run.googleapis.com/ingress"       = "all"
      "autoscaling.knative.dev/maxScale" = "1"
    }
  }
  template {
    spec {
      containers {
        image = "gcr.io/${data.google_project.project.project_id}/${local.resource_name}:init"
        env {
          name  = "SLACK_TOKEN"
          value = var.slack_token
        }
        env {
          name  = "SLACK_CHANNEL"
          value = var.slack_channel
        }
        resources {
          limits = {
            memory = "128Mi"
            cpu    = "100m"
          }
        }
      }
      container_concurrency = 1
      timeout_seconds       = 60
    }
  }

  autogenerate_revision_name = true

  traffic {
    percent         = 100
    latest_revision = true
  }

  timeouts {
    create = "2m"
    update = "2m"
    delete = "2m"
  }
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

resource "google_cloudbuild_trigger" "audit-slack" {
  name        = local.resource_name
  description = "build and deploy ${local.resource_name}"
  trigger_template {
    branch_name = var.env
    repo_name   = "gcp-audit-slack"
  }

  substitutions = {
    _SLACK_TOKEN   = var.slack_token
    _SLACK_CHANNEL = var.slack_channel
  }

  included_files = ["src/**"]

  filename = "cloudbuild.yaml"
}
