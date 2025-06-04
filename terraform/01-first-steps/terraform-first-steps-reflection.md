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

04.06.2025

Reflexion: Terraform Workflow, Variablen & Outputs

1. Was hat der Befehl terraform apply getan, als du ihn zum ersten Mal mit deiner initialen Konfiguration (ohne Variablen) ausgeführt hast?

Als ich terraform apply zum ersten Mal mit meiner initialen Konfiguration (die eine docker_image Ressource für Nginx und eine docker_container Ressource, die dieses Image verwendet, sowie ein Port-Mapping auf localhost:8080 definierte) ausgeführt habe, hat Terraform folgende Aktionen durchgeführt:
Plan erneut angezeigt: Zuerst wurde mir der Ausführungsplan, den terraform plan zuvor generiert hatte, noch einmal zur Bestätigung angezeigt. Dieser Plan zeigte, dass zwei neue Ressourcen erstellt werden sollten: das Docker-Image (falls es nicht lokal vorhanden war, wurde es von Docker Hub gezogen) und der Docker-Container.
Bestätigung angefordert: Terraform fragte interaktiv Do you want to perform these actions?. Ich musste mit yes bestätigen.
Ressourcen erstellt: Nach meiner Bestätigung begann Terraform, die Ressourcen tatsächlich zu erstellen:
Es stellte sicher, dass das nginx:1.27-alpine Image lokal verfügbar war (Pull von Docker Hub, falls nötig).
Es startete einen neuen Docker-Container basierend auf diesem Image mit dem Namen my-first-tf-nginx-container und dem Port-Mapping 8080:80.
State aktualisiert: Parallel zur Erstellung der Ressourcen hat Terraform seinen Zustand in der Datei terraform.tfstate aktualisiert, um festzuhalten, welche Ressourcen es jetzt verwaltet und wie deren aktueller Zustand ist.
Erfolgsmeldung: Am Ende gab Terraform eine Meldung aus, die sinngemäß lautete Apply complete! Resources: 2 added, 0 changed, 0 destroyed., was den erfolgreichen Abschluss der Aktionen bestätigte.

2. Was ist mit dem Terraform State (terraform.tfstate) passiert, nachdem du terraform apply und terraform destroy ausgeführt hast?

Nach terraform apply:
Die Datei terraform.tfstate wurde von Terraform erstellt oder aktualisiert. Diese Datei ist entscheidend, da sie den aktuellen Zustand der von Terraform verwalteten Infrastruktur speichert. Nachdem apply erfolgreich war, enthielt terraform.tfstate detaillierte Informationen über die erstellten Ressourcen, also mein docker_image.nginx_image und meinen docker_container.simple_nginx_container, inklusive ihrer IDs, Attribute und Abhängigkeiten. Terraform nutzt diesen State, um zukünftige Pläne zu erstellen (was muss geändert werden, um den gewünschten Zustand zu erreichen?) und um zu wissen, welche Ressourcen es bei einem destroy entfernen muss.
Nach terraform destroy:
Nachdem terraform destroy erfolgreich ausgeführt wurde und die Ressourcen (der Docker-Container) entfernt waren, wurde die terraform.tfstate-Datei ebenfalls aktualisiert. Sie enthielt nun keine Informationen mehr über die zerstörten Ressourcen oder wurde geleert (abhängig davon, ob noch andere, nicht zerstörte Ressourcen von Terraform verwaltet würden). Im Wesentlichen spiegelt sie wider, dass Terraform aktuell keine Infrastruktur mehr für diese Konfiguration verwaltet. Wenn alle Ressourcen entfernt wurden, kann der State auch leer sein oder nur noch Metadaten enthalten.


3. Wie haben die Variablen (variable {}, var.) deine Konfiguration flexibler und wiederverwendbarer gemacht, verglichen mit der initialen Konfiguration (ohne Variablen)?

Die Einführung von Variablen (variable "..." {} in variables.tf und ihre Verwendung mit var.<variablenname> in main.tf) hat meine Terraform-Konfiguration erheblich flexibler und wiederverwendbarer gemacht:
Flexibilität: Anstatt Werte wie den Container-Namen (my-flex-nginx-container-default), den externen Port oder den HTML-Inhalt fest in der main.tf zu hardcoden, konnte ich diese Werte nun zur Laufzeit (beim plan oder apply) ändern, ohne die Kernlogik meiner Ressourcendefinitionen anzufassen. Ich konnte verschiedene Konfigurationen (z.B. für Test- vs. Default-Szenarien) leicht durch unterschiedliche Variablenwerte realisieren.
Wiederverwendbarkeit: Die main.tf ist jetzt generischer. Sie beschreibt, dass ein Docker-Container mit einem bestimmten Image und Ports erstellt wird, aber die spezifischen Details (Name, Portnummer, Inhalt) kommen von außen. Dieselbe main.tf könnte so in verschiedenen Kontexten mit unterschiedlichen *.tfvars-Dateien oder CLI-Argumenten verwendet werden, um leicht variierende Instanzen derselben Grundinfrastruktur zu erstellen, ohne den Code duplizieren zu müssen.
Zentralisierte Konfiguration: Wichtige konfigurierbare Aspekte sind nun in variables.tf (mit Defaults) und *.tfvars-Dateien ausgelagert. Das macht es übersichtlicher und einfacher, Anpassungen vorzunehmen, als wenn man Werte direkt in den Ressourcendefinitionen suchen und ändern müsste.
Dokumentation: Der variable-Block erlaubt description-Felder, was die Konfiguration selbst dokumentierender macht – es ist klarer, welche Werte angepasst werden können und welchen Zweck sie haben.
Im Vergleich zur initialen Konfiguration, bei der jede Änderung eine direkte Modifikation der main.tf erforderte, ist die Konfiguration mit Variablen deutlich mächtiger und besser für die Verwaltung unterschiedlicher Umgebungen oder für die Weitergabe an andere Benutzer geeignet.


4. Auf welche drei Arten hast du Werte an deine Input Variablen übergeben? Beschreibe kurz die Methode und ihre Priorität.

Ich habe Werte an meine Input-Variablen auf folgende drei Arten übergeben, mit folgender Priorität (höchste zuerst):
Über die Kommandozeile (-var Flag):
Methode: Beim Ausführen von terraform apply (oder plan) habe ich das -var Flag verwendet, z.B. -var="container_name=my-cli-override-container".
Priorität: Höchste. Werte, die über -var gesetzt werden, überschreiben Werte aus .tfvars-Dateien und auch die default-Werte aus der variables.tf. Dies ist nützlich für einmalige Überschreibungen oder für CI/CD-Pipelines.
Über eine .tfvars-Datei (-var-file Flag):
Methode: Ich habe eine Datei namens test.tfvars erstellt, in der ich Variablenwerte definiert habe (z.B. external_port = 8888). Diese Datei wurde dann mit terraform apply -var-file="test.tfvars" geladen.
Priorität: Mittlere. Werte aus einer per -var-file angegebenen Datei überschreiben die default-Werte aus der variables.tf. Wenn mehrere -var-file-Argumente verwendet werden, werden sie in der angegebenen Reihenfolge geladen, wobei spätere Dateien frühere überschreiben können.
Über default-Werte in der variables.tf-Datei:
Methode: In der variables.tf habe ich für einige Variablen default-Werte definiert, z.B. default = "my-flex-nginx-container-default" für container_name.
Priorität: Niedrigste. Diese Default-Werte werden nur verwendet, wenn die Variable weder über die Kommandozeile (-var) noch über eine .tfvars-Datei einen Wert erhält. Sie dienen als Fallback oder für Werte, die selten geändert werden müssen.
Die Reihenfolge der Auswertung ist also: CLI-Flags (-var) > .tfvars-Dateien (-var-file) > default-Werte in variables.tf.

5. Was zeigen die Outputs (output {}, terraform output) an, nachdem du apply ausgeführt hast? Wofür sind sie nützlich?

Nachdem terraform apply erfolgreich ausgeführt wurde, hat Terraform am Ende der Ausgabe die Werte angezeigt, die ich in meiner outputs.tf-Datei definiert hatte. Zum Beispiel:
Outputs:

container_external_port_output = 8888
container_id_output = "abcdef123456..." 
container_ip_address_output = "172.17.0.2" 
container_name_output = "my-cli-override-container" 
html_content_used_output = "<h1>Test Umgebung via TFVARS!</h1><p>Dieser Inhalt kommt aus der test.tfvars Datei.</p><p>Container: my-cli-override-container</p><p>Port: 8888</p>"
Use code with caution.
(Die genauen Werte hängen vom letzten apply-Lauf ab).
Man kann diese definierten Outputs auch jederzeit später mit dem Befehl terraform output (zeigt alle Outputs) oder terraform output <output_name> (zeigt einen spezifischen Output) abrufen.
Wofür sind Outputs nützlich?
Outputs sind sehr nützlich, um wichtige Informationen über die erstellte Infrastruktur leicht zugänglich zu machen:
Information für Benutzer: Sie können dem Benutzer, der Terraform ausführt, wichtige Daten wie IP-Adressen, DNS-Namen, Container-IDs oder generierte Passwörter anzeigen, die für den Zugriff auf oder die weitere Konfiguration der Infrastruktur benötigt werden. In meinem Fall konnte ich so leicht den externen Port und den Namen des Containers sehen.
Weitergabe an andere Systeme/Terraform-Konfigurationen: Outputs eines Terraform-Moduls oder einer Konfiguration können als Inputs für andere Terraform-Konfigurationen dienen (z.B. über Remote States). Dies ermöglicht den Aufbau komplexer, modularer Infrastrukturen.
Automatisierung: Skripte oder CI/CD-Pipelines können terraform output -json verwenden, um Output-Werte in einem maschinenlesbaren Format zu erhalten und für nachfolgende Schritte zu nutzen.
Bestätigung und Dokumentation: Sie dienen als schnelle Bestätigung, dass bestimmte Ressourcen mit den erwarteten Attributen erstellt wurden und dokumentieren wichtige Endpunkte oder Kennungen.


6. Wie hast du den Inhalt der Variable nginx_html_content in die index.html Datei im laufenden Docker Container bekommen? Welche Terraform-Funktion (Provisioner) wurde dafür genutzt?

Um den Inhalt der Variable nginx_html_content dynamisch in die index.html-Datei innerhalb des laufenden Docker-Containers zu schreiben, habe ich einen provisioner "local-exec" innerhalb meiner docker_container-Ressource in main.tf verwendet.
Die Konfiguration sah so aus:
resource "docker_container" "simple_nginx_container" {
  # ... andere Argumente ...
  provisioner "local-exec" {
    when    = create 
    command = <<EOT
      sleep 5 # Einfache Wartezeit
      docker exec ${self.id} sh -c 'echo "${var.nginx_html_content}" > /usr/share/nginx/html/index.html'
      echo "index.html updated in container ${self.name}"
    EOT
  }
}
Use code with caution.
Terraform
Wie es funktioniert:
Der provisioner "local-exec" führt nach der Erstellung der Ressource (hier des Docker-Containers, aufgrund von when = create) einen Befehl auf der Maschine aus, auf der terraform apply läuft (also meinem lokalen Rechner).
Der command ist ein Shell-Skript (Here-Document-Syntax <<EOT ... EOT).
Der entscheidende Befehl ist docker exec ${self.id} sh -c 'echo "${var.nginx_html_content}" > /usr/share/nginx/html/index.html'.
docker exec: Führt einen Befehl in einem laufenden Container aus.
${self.id}: Dies ist eine Terraform-Interpolation, die zur Laufzeit durch die ID des gerade erstellten simple_nginx_container ersetzt wird.
sh -c '...': Führt den nachfolgenden String als Shell-Befehl im Container aus.
echo "${var.nginx_html_content}": Gibt den Inhalt der Terraform-Variable nginx_html_content aus. Die äußeren einfachen Anführungszeichen sind für sh -c, die inneren doppelten Anführungszeichen für echo, damit der mehrzeilige HTML-String korrekt behandelt wird.
> /usr/share/nginx/html/index.html: Leitet die Ausgabe von echo in die Datei index.html im Nginx-Webroot-Verzeichnis im Container um und überschreibt deren Inhalt.
Dies ist eine Methode, um dynamische Inhalte oder Konfigurationen zur Laufzeit in einen Container zu bringen, nachdem er erstellt wurde. Es ist wichtig zu beachten, dass Provisioner als letztes Mittel betrachtet werden sollten, da sie die Komplexität erhöhen und nicht immer idempotent sind. Besser wäre es oft, Inhalte über Docker Volumes oder beim Image-Bau bereitzustellen, aber für dieses Beispiel demonstriert es eine mächtige Fähigkeit von Terraform.
