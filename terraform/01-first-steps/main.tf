resource "docker_image" "nginx_image" {
  name         = "nginx:1.27-alpine" # Spezifischere Version als nur :latest
  keep_locally = false # Optional: Entfernt das Image lokal, wenn die Ressource zerstört wird
}

resource "docker_container" "simple_nginx_container" {
  name  = "my-first-tf-nginx-container"
  image = docker_image.nginx_image.image_id # Referenziert das Image über seine ID
  ports {
    internal = 80
    # external = 8088 # Optional: Wenn du einen Port zum Host mappen willst
  }
}