resource "aws_eks_cluster" "main" {
  name = "${var.project}-${var.env}-cluster"
  vpc_config {
    subnet_ids = concat(var.public_subnets_ids,var.private_subnets_ids)
    endpoint_private_access = true
    endpoint_public_access = true
  }
  role_arn = var.eks_cluster_role_arn

  tags = {
    Name = "${var.project}-${var.env}-cluster"
  }
}

resource "aws_eks_node_group" "main" {
  node_role_arn = var.eks_node_role_arn
  cluster_name = aws_eks_cluster.main.name
  subnet_ids = var.private_subnets_ids
  instance_types = [var.node_instance_type]
  scaling_config {
    min_size = var.node_min_size
    max_size = var.node_max_size
    desired_size = var.node_desired_size
  }
  update_config {
    max_unavailable = 1
  }
  tags = {
    Name = "${var.project}-${var.env}-node-group"
    "k8s.io/cluster-autoscaler/enabled" = "true"
    "k8s.io/cluster-autoscaler/ticketops-dev-cluster" = "owned"
  }

  depends_on = [aws_eks_addon.vpc_cni]

}

resource "aws_eks_addon" "coredns" {
  cluster_name = aws_eks_cluster.main.name
  addon_name = "coredns"
  depends_on = [aws_eks_cluster.main ]
}

resource "aws_eks_addon" "kube_proxy" {
  cluster_name = aws_eks_cluster.main.name
  addon_name = "kube-proxy"
 depends_on = [aws_eks_cluster.main ]
}

resource "aws_eks_addon" "vpc_cni" {
  cluster_name = aws_eks_cluster.main.name
  addon_name = "vpc-cni"
   depends_on = [aws_eks_cluster.main ]
}