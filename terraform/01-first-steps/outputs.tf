output "container_name_output" {
  description = "The name of the created Docker container."
  value       = docker_container.simple_nginx_container.name
}

output "container_id_output" {
  description = "The ID of the created Docker container."
  value       = docker_container.simple_nginx_container.id
}

output "container_external_port_output" {
  description = "The external port of the container."
  value       = docker_container.simple_nginx_container.ports[0].external
}

output "html_content_used_output" {
  description = "The HTML content that was intended for the Nginx index page."
  value       = var.nginx_html_content
}