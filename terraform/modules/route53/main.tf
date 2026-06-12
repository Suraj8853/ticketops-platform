data "aws_route53_zone" "main" {
  name         = var.domain_name
  private_zone = false
}

resource "aws_route53_record" "ticketops" {
  zone_id = data.aws_route53_zone.main.id
  name = "${var.subdomain_name}.${var.domain_name}"
  type = "CNAME"
  ttl = 300
  records = [var.alb_dns_name]
}