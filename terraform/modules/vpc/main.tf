resource "aws_vpc" "main" {
  cidr_block = var.vpc_cidr
  enable_dns_hostnames = true
  enable_dns_support = true
  tags = {
    Name = "${var.project}-${var.env}-vpc"
  }
}

resource "aws_internet_gateway" "main" {
  vpc_id = aws_vpc.main.id
  tags = {
     Name = "${var.project}-${var.env}-igw"
  }
}

resource "aws_subnet" "public" {
  vpc_id = aws_vpc.main.id
  count = length(var.availablity_zones)
  cidr_block = var.public_subnet_cidrs[count.index]
  availability_zone = var.availablity_zones[count.index]
  map_public_ip_on_launch = true

  tags = {
    Name = "${var.project}-${var.env}-public-${var.availablity_zones[count.index]}"
     "kubernetes.io/role/elb" = "1"
     "kubernetes.io/cluster/${var.project}-${var.env}-cluster" = "shared"
  }
}

resource "aws_subnet" "private" {
   
    count = length(var.availablity_zones)
     vpc_id = aws_vpc.main.id
     cidr_block = var.private_subnet_cidr[count.index]
     availability_zone = var.availablity_zones[count.index]

     tags = {
       Name = "${var.project}-${var.env}-private-${var.availablity_zones[count.index]}"
        "kubernetes.io/role/internal-elb" = "1"
        "kubernetes.io/cluster/${var.project}-${var.env}-cluster" = "shared"
     }
  
}

resource "aws_eip" "nat" {
  domain = "vpc"
   tags = {
      Name = "${var.project}-${var.env}-nat-eip"
  }
  depends_on = [aws_internet_gateway.main ]
}

resource "aws_nat_gateway" "main" {
  allocation_id = aws_eip.nat.id
  subnet_id = aws_subnet.public[0].id

  tags = {
      Name = "${var.project}-${var.env}-nat"
  }
  depends_on = [ aws_internet_gateway.main ]
}


resource "aws_route_table" "public" {
    vpc_id = aws_vpc.main.id
  route {
    cidr_block = "0.0.0.0/0"
    gateway_id = aws_internet_gateway.main.id
  }
  tags = {
    Name = "${var.project}-${var.env}-public-rt"
  }
}

resource "aws_route_table" "private" {
  vpc_id = aws_vpc.main.id
  route {
    cidr_block = "0.0.0.0/0"
    nat_gateway_id   = aws_nat_gateway.main.id
  }
   tags = {
    Name = "${var.project}-${var.env}-private-rt"
  }
}

resource "aws_route_table_association" "public" {
 count = length(var.public_subnet_cidrs)
  route_table_id = aws_route_table.public.id
  subnet_id = aws_subnet.public[count.index].id
}

resource "aws_route_table_association" "private" {
    count = length(var.private_subnet_cidr)
    route_table_id = aws_route_table.private.id
    subnet_id = aws_subnet.private[count.index].id
  
}


# ECR VPC Endpoints - allows Kyverno and EKS nodes to pull images without NAT
resource "aws_vpc_endpoint" "ecr_api" {
  vpc_id              = aws_vpc.main.id
  service_name        = "com.amazonaws.${var.aws_region}.ecr.api"
  vpc_endpoint_type   = "Interface"
  subnet_ids          = aws_subnet.private[*].id
  security_group_ids  = [aws_security_group.vpc_endpoints.id]
  private_dns_enabled = true

  tags = {
    Name = "${var.project}-${var.env}-ecr-api-endpoint"
  }
}

resource "aws_vpc_endpoint" "ecr_dkr" {
  vpc_id              = aws_vpc.main.id
  service_name        = "com.amazonaws.${var.aws_region}.ecr.dkr"
  vpc_endpoint_type   = "Interface"
  subnet_ids          = aws_subnet.private[*].id
  security_group_ids  = [aws_security_group.vpc_endpoints.id]
  private_dns_enabled = true

  tags = {
    Name = "${var.project}-${var.env}-ecr-dkr-endpoint"
  }
}

resource "aws_vpc_endpoint" "s3" {
  vpc_id            = aws_vpc.main.id
  service_name      = "com.amazonaws.${var.aws_region}.s3"
  vpc_endpoint_type = "Gateway"
  route_table_ids   = [aws_route_table.private.id]

  tags = {
    Name = "${var.project}-${var.env}-s3-endpoint"
  }
}

resource "aws_security_group" "vpc_endpoints" {
  name        = "${var.project}-${var.env}-vpc-endpoints-sg"
  description = "Security group for VPC endpoints"
  vpc_id      = aws_vpc.main.id

  ingress {
    from_port   = 443
    to_port     = 443
    protocol    = "tcp"
    cidr_blocks = [var.vpc_cidr]
  }

  tags = {
    Name = "${var.project}-${var.env}-vpc-endpoints-sg"
  }
}
