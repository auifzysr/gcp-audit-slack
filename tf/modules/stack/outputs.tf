output "eventarc-sa" {
  value = google_service_account.trigger-audit.id
}

output "trigger" {
  value = google_eventarc_trigger.trigger-audit.id
}

output "service" {
  value = google_cloud_run_service.audit-slack.id
}

output "build" {
  value = google_cloudbuild_trigger.audit-slack.id
}
