terraform {
  required_version = ">= 0.11.3"
  backend          "s3"             {}
}

locals {
  role_name = "${format("%s_%s","role",var.name)}"
  policy_name = "${format("%s_%s","policy",var.name)}"
}

provider "aws" {
  version    = "1.41.0"
  alias      = "target"
  access_key = "${var.target_aws_access_key}"
  secret_key = "${var.target_aws_secret_key}"
  token      = "${var.target_aws_session_token}"

  assume_role {
    role_arn    = "${var.assume_role_arn}"
    external_id = "${var.external_id}"
  }

  region = "${var.client_aws_region}"
}

data "aws_caller_identity" "current" {}

resource "aws_iam_role_policy" "application" {
  provider = "aws.target"
  name     = "${substr(local.policy_name, 0, min(length(local.policy_name), 31))}"
  role     = "${aws_iam_role.application.id}"

  policy = "${var.policy}"
}

resource "aws_iam_role" "application" {
  provider             = "aws.target"
  name                 = "${substr(local.role_name, 0, min(length(local.role_name), 31))}"
  max_session_duration = 7200

  assume_role_policy = <<EOF
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Sid": "",
      "Effect": "Allow",
      "Principal": {
        "AWS": "${data.aws_caller_identity.current.account_id}"
      },
      "Action": "sts:AssumeRole"
    }
  ]
}
EOF
}
