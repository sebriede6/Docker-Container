Frage 1: Was ist die Rolle des provider Blocks in deiner Konfiguration? Warum ist er notwendig?

Der provider "docker" {} Block in provider.tf konfiguriert den spezifischen "Docker"-Provider. Er teilt Terraform mit, wie es mit der Docker API interagieren soll (z.B. unter welcher Adresse der Docker Daemon erreichbar ist.)
Er ist notwendig, weil Terraform eine plugin-basierte Architektur hat. Für jede Art von Infrastruktur (AWS, Azure, Docker, Kubernetes etc.) gibt es einen eigenen Provider. Dieser Provider stellt die Implementierung bereit, um die definierten Ressourcen (docker_image, docker_container) über die jeweilige API zu erstellen, zu lesen, zu aktualisieren und zu löschen. Ohne den konfigurierten Provider wüsste Terraform nicht, wie es mit Docker sprechen soll.

Frage 2: Was ist die Rolle des resource Blocks? Was repräsentiert er im Vergleich zu einem provider?

Der resource Block (z.B. resource "docker_image" "nginx_image" {}) definiert ein einzelnes Infrastrukturobjekt, das Terraform verwalten soll. Im Beispiel sind das ein Docker-Image und ein Docker-Container. Jeder resource Block beschreibt ein spezifisches Element mit seinen Attributen (wie name, image).
Im Vergleich dazu ist der provider die Schnittstelle oder das "Werkzeug", das Terraform verwendet, um diese resource-Objekte in der realen Infrastruktur (hier Docker) zu manipulieren. Der Provider "versteht" die API von Docker, während die Ressource nur beschreibt, was erstellt werden soll.

Frage 3: Wie hast du in deiner Konfiguration eine implizite Abhängigkeit zwischen der docker_container Ressource und der docker_image Ressource erstellt? Warum ist es wichtig, dass Terraform diese Abhängigkeit versteht?

In meiner main.tf habe ich die Abhängigkeit in der docker_container.simple_nginx_container Ressource durch die Zeile image = docker_image.nginx_image.image_id erstellt. Hier referenziert das image-Argument des Containers direkt das Attribut image_id der docker_image.nginx_image-Ressource.
Es ist wichtig, dass Terraform diese Abhängigkeit versteht, damit es die Ressourcen in der korrekten Reihenfolge erstellt. In diesem Fall muss zuerst das Docker-Image (docker_image.nginx_image) vorhanden sein (entweder lokal existieren oder von Docker Hub gezogen werden), bevor ein Container (docker_container.simple_nginx_container) basierend auf diesem Image gestartet werden kann. Terraform erkennt diese implizite Abhängigkeit und stellt sicher, dass die docker_image-Aktion abgeschlossen ist, bevor es mit der docker_container-Aktion beginnt. Bei Zerstörung würde es die Reihenfolge umkehren.

Frage 4: Was genau bewirkt der Befehl terraform init, wenn du ihn zum ersten Mal in einem Verzeichnis ausführst?

Wenn terraform init zum ersten Mal ausgeführt wird, tut es hauptsächlich Folgendes:
Provider-Download: Es liest die required_providers-Blöcke in den .tf-Dateien (in meinem Fall in provider.tf für den kreuzwerker/docker-Provider).
Es lädt die spezifizierten Provider-Plugins von der Terraform Registry (oder der angegebenen Quelle) herunter und speichert sie lokal im Unterverzeichnis .terraform/plugins/.
Backend-Initialisierung: Wenn ein Backend konfiguriert wäre (für die Speicherung des State-Files, hier nicht der Fall), würde es dieses initialisieren.
Modul-Installation: Wenn Module verwendet würden, würde es diese herunterladen.
Lock-Datei erstellen: Es erstellt oder aktualisiert die .terraform.lock.hcl-Datei, die die exakten Versionen der verwendeten Provider festschreibt, um konsistente Builds über verschiedene Umgebungen hinweg zu gewährleisten.
Im Grunde bereitet terraform init das Arbeitsverzeichnis für die weitere Terraform-Nutzung vor, indem es alle notwendigen externen Abhängigkeiten (hauptsächlich Provider) herunterlädt.

Frage 5: Was genau zeigt der Output von terraform plan an? Welche Informationen liefert er, bevor du die Infrastruktur tatsächlich erstellst?

Der Output von terraform plan zeigt einen Ausführungsplan. Dieser Plan ist eine Vorschau der Aktionen, die Terraform durchführen würde, um den aktuellen Zustand der Infrastruktur an den in den .tf-Dateien definierten gewünschten Zustand anzupassen.
Es wird empfohlen, diesen Plan mit der Option -out zu speichern und dann terraform apply mit der Plandatei auszuführen, um sicherzustellen, dass genau die geplanten Aktionen umgesetzt werden und keine unerwarteten Änderungen aufgrund von zwischenzeitlichen Veränderungen der Konfiguration oder Infrastruktur erfolgen.
Bevor Infrastruktur tatsächlich erstellt (oder geändert/zerstört) wird, liefert terraform plan folgende Informationen:
Zu erstellende Ressourcen (+): Welche neuen Infrastrukturobjekte angelegt werden, mit all ihren konfigurierten Attributen.
Zu ändernde Ressourcen (~): Welche existierenden Objekte modifiziert werden und welche Attribute sich ändern.
Zu zerstörende Ressourcen (-): Welche existierenden Objekte entfernt werden.
Eine Zusammenfassung am Ende, die angibt, wie viele Ressourcen hinzugefügt, geändert oder zerstört werden (z.B. Plan: 2 to add, 0 to change, 0 to destroy.).
Dies ermöglicht es mir, die geplanten Änderungen genau zu überprüfen und sicherzustellen, dass sie meinen Erwartungen entsprechen, bevor ich sie mit terraform apply tatsächlich ausführe. Es ist ein wichtiger Sicherheitsschritt, um unbeabsichtigte Änderungen an der Infrastruktur zu vermeiden.
