resource "docker_image" "nginx_image" {
  name         = "nginx:1.27-alpine" 
  keep_locally = false 
}

resource "docker_container" "simple_nginx_container" {
  name  = "my-first-tf-nginx-container"
  image = docker_image.nginx_image.image_id 
  ports {
    internal = 80
    
  }
}
