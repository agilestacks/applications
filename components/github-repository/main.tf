terraform {
  required_version = ">= 0.9.3"
  backend "s3" {}
}

provider "github" {
  token        = "${var.github_token}"
  organization = "${var.github_organization}"
}

resource "github_repository" "default" {
  name        = "${var.repository_name}"
  description = "${var.repository_description}"

  private = false
}
