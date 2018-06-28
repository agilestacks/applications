output "endpoint" {
  value = "${module.repo_s3.website_endpoint}"
}

output "domain" {
  value = "${module.repo_r53.fqdn}"
}

output "s3_origin_domain" {
  value = "${module.repo_s3.website_domain}"
}
