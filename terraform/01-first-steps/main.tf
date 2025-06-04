resource "docker_container" "simple_nginx_container" {
  name  = var.container_name
  image = "nginx:1.27-alpine"
  ports {
    internal = 80
    external = var.external_port
  }
  provisioner "local-exec" {
    when    = create 
    command = <<EOT
      echo "Waiting for container ${self.name} (${self.id}) to be ready..."
      sleep 5
      docker exec ${self.id} sh -c 'echo "${var.nginx_html_content}" > /usr/share/nginx/html/index.html'
      echo "index.html updated in container ${self.name}"
    EOT
  }
}