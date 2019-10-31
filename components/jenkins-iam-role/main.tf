terraform {
  required_version = ">= 0.11.3"
  backend          "s3"             {}
}

provider "aws" {
  version = "1.41.0"
}

data "aws_caller_identity" "current" {}

resource "aws_iam_role" "jenkins" {
  name = "${substr("role_"+var.name, 0, min(length(var.name), 31))}"

  assume_role_policy = <<EOF
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Sid": "",
      "Effect": "Allow",
      "Principal": {
        "AWS": "*"
      },
      "Action": "sts:AssumeRole"
    }
  ]
}
EOF
}

resource "aws_iam_role_policy" "jenkins" {
  name = "${substr("policy_"+var.name, 0, min(length(var.name), 31))}"
  role = "${aws_iam_role.jenkins.id}"

  policy = <<EOF
{
    "Version": "2012-10-17",
    "Statement": [
        {
            "Effect": "Allow",
            "Action": [
                "ecr:*",
                "s3:*"
            ],
            "Resource": "*"
        }
    ]
}
EOF
}
