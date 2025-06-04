variable "container_name" {
  type        = string
  description = "Name of the Docker container"
  default     = "my-flex-nginx-container-default"
}

variable "external_port" {
  type        = number
  description = "External port to map to the container's internal port 80"
}

variable "nginx_html_content" {
  type        = string
  description = "HTML content for the Nginx index.html page"
  default     = "<h1>Hello from Terraform Default!</h1><p>Container: my-flex-nginx-container-default</p><p>Served via port: 8080</p>"
}