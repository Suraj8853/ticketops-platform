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

