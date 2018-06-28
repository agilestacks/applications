output "endpoint" {
  value = "${module.s3.website_endpoint}"
}

output "domain" {
  value = "${module.r53.fqdn}"
}

output "s3_origin_domain" {
  value = "${module.s3.website_domain}"
}
