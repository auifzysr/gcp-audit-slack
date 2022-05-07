# gcp-audit-slack
notify events on audit log via Eventarc to slack

## works on
- Node.js v16.15.0
- Terraform v1.1.9

## setup

```sh
# login to GCP project
gcloud auth login
gcloud config set project PROJECT_ID

# create repository
gcloud source repos create gcp-slack-audit
git remote add csr ssh://USER_EMAIL@source.developers.google.com:2022/p/PROJECT_ID/r/gcp-audit-slack
git push csr main

# build initial docker image (dev)
gcloud auth configure-docker
docker build -t gcr.io/PROJECT_ID/audit-slack-dev:init .
docker push gcr.io/PROJECT_ID/audit-slack-dev:init

# deploy CD pipeline
cd tf
terraform init
terraform plan -var-file=terraform.tfvars
terraform apply -var-file=terraform.tfvars
```
