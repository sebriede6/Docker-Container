
```markdown
# React Docker Notizblock App (Full-Stack: Lokal, Swarm, Kubernetes & Helm)

Dies ist eine Full-Stack Notizblock-Anwendung, die mit React (Frontend) und Node.js/Express (Backend) erstellt wurde. Die Anwendung wurde für verschiedene Deployment-Szenarien konfiguriert: lokale Entwicklung mit Docker Compose, verteiltes Deployment auf Docker Swarm und Paketierung als **Helm Chart** für die Bereitstellung auf Kubernetes.

Die Kernanwendung (Notizblock) beinhaltet:
*   Ein Frontend, das mit Vite gebaut und von Nginx als Webserver und Reverse Proxy ausgeliefert wird.
*   Ein Backend, das eine REST-API für Notizen bereitstellt und Daten persistent in einer **PostgreSQL-Datenbank** speichert.
*   Eine PostgreSQL-Datenbank als dedizierter Service, integriert als Subchart in der Helm-Konfiguration.
*   Integrierte, aussagekräftige Healthchecks für Datenbank und Backend zur Sicherstellung der Diensteverfügbarkeit.

Zusätzlich wurden grundlegende Kubernetes-Konzepte (Deployment, Service, Ingress, Rolling Update, Rollback) anhand von Beispielanwendungen demonstriert.

## Projektstruktur

```text
.
├── .dockerignore
├── .env                  
├── .gitignore
├── README.md             
├── docker-stack.yml      
├── docker-compose.yml    
├── sql_schema_and_queries.md 
├── Reflexionsfragen.md   
│
├── assets/               
│   └── ...
│
├── backend/              
│   # ... (Backend-Struktur wie zuvor)
│
├── frontend/             
│   
│
├── helm-charts/
│   └── notizblock-app-chart/ # Helm Chart für die Notizblock-Anwendung
│      
│
├── kubernetes/
│   ├── 01-intro/
│   │   ├── k8s-intro-reflection.md
│   │   └── Screenshot_kubectl_get_nodes.png
│   ├── 02-deployment-service/
│   │   # ... (Dateien zur K8s Deployment/Service Aufgabe mit Nginx)
│   │   └── k8s-deployment-reflection.md
│   └── 03-ingress/
│       # ... (Dateien zur K8s Ingress Aufgabe)
│       └── k8s-ingress-reflection.md
│
└── terraform/
    └── 01-first-steps/
        ├── main.tf                             
        ├── provider.tf                         
        ├── terraform-first-steps-reflection.md 
        └── assets/                             
            ├── Screenshot_terraform_init.png
            └── Screenshot_terraform_plan.png
```

## Screenshots

*  Funktionierende Anwendung im Browser (CRUD):
    [![Anwendung läuft](assets)](assets)


## Features der Notizblock-Anwendung

*   Vollständige CRUD-Operationen für Notizen.
*   Statusumschaltung für Notizen (Erledigt/Offen).
*   Persistente Datenspeicherung in PostgreSQL.
*   Sichere API durch parametrisierte Abfragen und Eingabevalidierung.
*   Containerisierung mit Docker.
*   Orchestrierung mit Docker Compose (lokal), Docker Swarm (verteilt) und **Paketierung als Helm Chart für Kubernetes**.
*   Node Affinity im Swarm.
*   Frontend mit Nginx Reverse Proxy.
*   Robuste Fehlerbehandlung und aussagekräftige Healthchecks.
*   Frontend-Features: Light/Dark-Mode, Suche, Filter, Sortierung und "Fliegender Notizzettel".

## Voraussetzungen

*   Docker & Docker Compose
*   `kubectl` Kommandozeilen-Tool
*   **Helm CLI** (`helm version`)
*   Ein lokales Kubernetes-Cluster (z.B. Kubernetes in Docker Desktop, Minikube, Kind)
*   Multipass (optional, für Swarm-Setup)
*   Git
*   Ein Docker Hub Account 

## Lokales Setup der Notizblock-Anwendung (Docker Compose)

Für die lokale Entwicklung kann der Notizblock-Stack mit der `docker-compose.yml` Datei gestartet werden.

1.  **Repository klonen und navigieren:**
    ```bash
    git clone https://github.com/sebriede6/Docker-Container
    cd Docker-Container
    ```
2.  **`.env`-Datei erstellen:**
    Erstelle eine `.env`-Datei im Projektwurzelverzeichnis mit Inhalt wie:
    ```env
    DB_USER=myuser
    DB_PASSWORD= 
    DB_NAME=notizblockdb
    BACKEND_PORT=3000
    LOG_LEVEL=debug
    ```
3.  **Datenbankschema erstellen:**
    ```bash
    docker compose up -d database
    # Warten bis DB healthy (prüfe mit: docker compose ps)
    docker exec -i postgres_db_service psql -U ${DB_USER:-myuser} -d ${DB_NAME:-notizblockdb} < backend/sql/initial_schema.sql
    docker exec -i postgres_db_service psql -U ${DB_USER:-myuser} -d ${DB_NAME:-notizblockdb} < backend/sql/update_schema_add_completed.sql
    ```
4.  **Stack starten:**
    ```bash
    docker compose up --build -d
    ```
    Die Notizblock-Anwendung ist unter `http://localhost:8080` erreichbar.

---

---

## Deployment der Notizblock-Anwendung mit Helm auf Kubernetes

Dieser Abschnitt beschreibt, wie die gesamte Full-Stack Notizblock-Anwendung als Helm Chart paketiert und auf einem lokalen Kubernetes-Cluster (z.B. Docker Desktop Kubernetes) installiert, aktualisiert und deinstalliert wird. Das PostgreSQL Subchart von Bitnami wird als Abhängigkeit für die Datenbank genutzt.

### 1. Vorbereitung

*   **Lokales Kubernetes-Cluster:** Stelle sicher, dass dein lokales K8s-Cluster läuft und `kubectl` darauf zugreift (`kubectl config use-context docker-desktop`).
*   **Helm CLI:** Muss installiert sein (`helm version`).
*   **Notizblock-App Images:** Die Docker Images für dein Frontend (`DEIN_DOCKERHUB_BENUTZERNAME/mein-notizblock-frontend:latest`) und Backend (`DEIN_DOCKERHUB_BENUTZERNAME/mein-notizblock-backend:latest`) müssen in einer erreichbaren Registry (z.B. Docker Hub) verfügbar sein. Ersetze `DEIN_DOCKERHUB_BENUTZERNAME` entsprechend.

### 2. Helm Chart Struktur und Konfiguration

Das Helm Chart für diese Anwendung befindet sich im Verzeichnis `helm-charts/notizblock-app-chart/` und enthält:
*   **`Chart.yaml`**: Definiert das Chart und seine Abhängigkeit zum Bitnami PostgreSQL Chart (Alias `database`).
*   **`values.yaml`**
*   **`templates/`**: Kubernetes Manifest-Templates für Backend, Frontend, Ingress und Secrets.
*   **`charts/`**: Enthält das heruntergeladene PostgreSQL Subchart nach `helm dependency update`.

### 3. Chart als Release installieren

1.  **Navigiere in das Wurzelverzeichnis des Charts:** `cd helm-charts/notizblock-app-chart`
2.  **Abhängigkeiten aktualisieren:** `helm dependency update`
3.  **Chart installieren (ersetze Platzhalter):**
    ```bash
    helm install notizblock-release ./ \
        --namespace default \
        --set frontend.image.repository=DEIN_DOCKERHUB_BENUTZERNAME/mein-notizblock-frontend \
        --set backend.image.repository=DEIN_DOCKERHUB_BENUTZERNAME/mein-notizblock-backend \
        --set database.auth.password='DEIN_SICHERES_DB_PASSWORT' \
        --set ingress.host='notizblock.local' \
        --set ingress.className='nginx' 
    ```

### 4. Initialen Release überprüfen

1.  **Status und Ressourcen:**
    ```bash
    helm list -n default
    kubectl get all,pvc,secret -n default -l app.kubernetes.io/instance=notizblock-release
    ```
    Warte, bis Pods `Running`/`Ready` und PVC `Bound` sind.
2.  **Datenbankschema erstellen (nach Erstinstallation):**
    *   Finde den PostgreSQL-Pod-Namen (z.B. `notizblock-release-database-postgresql-0`) mit:
        `kubectl get pods -n default -l app.kubernetes.io/instance=notizblock-release,app.kubernetes.io/name=postgresql`
    *   Kopiere SQL-Skripte in den Pod (Pfad relativ zum Chart-Verzeichnis):
        ```bash
        kubectl cp ../../backend/sql/initial_schema.sql <POSTGRES_POD_NAME>:/tmp/initial_schema.sql -n default
        kubectl cp ../../backend/sql/update_schema_add_completed.sql <POSTGRES_POD_NAME>:/tmp/update_schema_add_completed.sql -n default
        ```
    *   Führe Skripte aus (ersetze User/DB-Name mit Werten aus `values.yaml` unter `database.auth`, z.B. `notiz_user`, `notizblock_db`):
        ```bash
        kubectl exec -it <POSTGRES_POD_NAME> -n default -- psql -U notiz_user -d notizblock_db -f /tmp/initial_schema.sql
        kubectl exec -it <POSTGRES_POD_NAME> -n default -- psql -U notiz_user -d notizblock_db -f /tmp/update_schema_add_completed.sql
        ```
3.  **Lokale Hosts-Datei anpassen:** Füge `127.0.0.1 notizblock.local` hinzu und leere den DNS-Cache.
4.  **Browser-Test:** Öffne `http://notizblock.local/`.

### 5. Release aktualisieren (Beispiel)
```bash
helm upgrade notizblock-release ./ \
    --namespace default \
    --reuse-values \
    --set frontend.replicaCount=2 \ 
    --set database.auth.password='DEIN_SICHERES_DB_PASSWORT' 
```

### 6. Release deinstallieren
```bash
helm uninstall notizblock-release --namespace default

```

### 7. Aufräumen (Hosts-Datei)
Entferne den `notizblock.local`-Eintrag.

---

## Terraform: Infrastructure as Code - Erste Schritte & Flexibilisierung

Diese Aufgabe diente der Einführung in Infrastructure as Code (IaC) mit Terraform. Es wurde eine einfache Terraform-Konfiguration entwickelt, um den Docker-Provider zu nutzen, einen Nginx-Container zu erstellen und dessen Inhalt dynamisch über Variablen zu steuern. Der grundlegende Terraform-Workflow (`init`, `plan`, `apply`, `destroy`) sowie die Verwendung von Input-Variablen und Outputs wurden praktisch angewendet.

### Terraform-Konfiguration und Dateien

Die Terraform-Konfigurationsdateien für diese Aufgabe befinden sich im Verzeichnis `terraform/01-first-steps/` und umfassen:

*   **`provider.tf`**: Definiert den `kreuzwerker/docker`-Provider und konfiguriert ihn für die Interaktion mit dem lokalen Docker-Daemon.
*   **`main.tf`**: Enthält die Ressourcendefinition für einen `docker_container` (Nginx). Der Containername, der exponierte Host-Port und der Inhalt der `index.html` im Container werden über Variablen gesteuert. Ein `local-exec` Provisioner wird verwendet, um die `index.html` dynamisch im Container zu erstellen.
*   **`variables.tf`**: Definiert die Input-Variablen:
    *   `container_name`: Name des Docker-Containers (Typ: `string`, mit Default-Wert).
    *   `external_port`: Externer Host-Port, der auf den internen Port 80 des Containers gemappt wird (Typ: `number`).
    *   `nginx_html_content`: Der HTML-Inhalt für die `index.html`-Seite des Nginx-Containers (Typ: `string`, mit Default-Wert, der andere Variablen interpoliert).
*   **`outputs.tf`**: Definiert Outputs, um Informationen über die erstellten Ressourcen nach einem `terraform apply` anzuzeigen, wie z.B. den Containernamen, die Container-ID und den verwendeten externen Port.
*   **`test.tfvars`**: Eine Beispieldatei zur Demonstration der Variablenübergabe. **Hinweis:** In einem realen Projekt würden `.tfvars`-Dateien mit sensiblen Daten nicht in die Versionskontrolle eingecheckt, sondern über `.gitignore` ausgeschlossen. Für diese Übung enthält `test.tfvars` nur nicht-sensible Beispielwerte.

### Terraform Workflow Ausführung

Die folgenden Schritte beschreiben den vollständigen Workflow im Verzeichnis `terraform/01-first-steps/`:

1.  **Initialisierung (`terraform init`):**
    Dieser Befehl wird einmalig pro neuem Arbeitsverzeichnis oder nach Änderungen an den Provider-Anforderungen ausgeführt. Er lädt die notwendigen Provider-Plugins herunter (hier den Docker-Provider) und initialisiert das Backend (standardmäßig lokal).
    ```bash
    cd terraform/01-first-steps/
    terraform init
    ```
    *Erfolgreicher Output sollte "Terraform has been successfully initialized!" anzeigen.*

2.  **Planerstellung (`terraform plan`):**
    Dieser Befehl erstellt einen Ausführungsplan. Er zeigt, welche Aktionen Terraform durchführen würde, um den in den `.tf`-Dateien definierten Zustand zu erreichen, ohne tatsächlich Änderungen vorzunehmen.
    *   **Plan mit Default-Werten:**
        ```bash
        terraform plan
        ```
    *   **Plan mit Werten aus einer `.tfvars`-Datei:**
        ```bash
        terraform plan -var-file="test.tfvars"
        ```
    *Erwarteter Output zeigt, welche Ressourcen erstellt (`+`), geändert (`~`) oder zerstört (`-`) würden.*

3.  **Anwendung der Änderungen (`terraform apply`):**
    Dieser Befehl wendet die im Plan gezeigten Änderungen auf die Infrastruktur an.
    *   **Apply mit Werten aus einer `.tfvars`-Datei:**
        ```bash
        terraform apply -var-file="test.tfvars"
        ```
        Terraform zeigt erneut den Plan und fragt interaktiv nach Bestätigung (`yes`). Nach erfolgreicher Ausführung werden die definierten Output-Werte angezeigt.
    *   **Apply mit Überschreibung durch CLI-Variable:**
        Variablen, die per `-var` auf der Kommandozeile übergeben werden, haben höhere Priorität als Werte aus `.tfvars`-Dateien oder Defaults.
        ```bash
        terraform apply -var-file="test.tfvars" -var="container_name=mein-cli-container"
        ```
    *   **Apply mit Default-Werten (wenn keine `.tfvars`-Datei oder CLI-Variablen für spezifische Werte angegeben werden):**
        Wenn z.B. `container_name` aus `test.tfvars` entfernt wird, wird der Default-Wert aus `variables.tf` verwendet.
        ```bash
        terraform apply # (Wenn test.tfvars z.B. nur external_port definiert)
        ```

4.  **Überprüfung der erstellten Ressourcen:**
    *   Mit Docker-Befehlen: `docker ps` (um den laufenden Container zu sehen).
    *   Im Browser: `http://localhost:<external_port>` (z.B. `http://localhost:8888`, wenn `external_port` in `test.tfvars` auf `8888` gesetzt wurde). Die Seite sollte den Inhalt aus `var.nginx_html_content` anzeigen.

5.  **Anzeigen der Outputs:**
    Nach einem erfolgreichen `apply` oder jederzeit später:
    ```bash
    terraform output # Zeigt alle definierten Outputs
    terraform output container_name_output # Zeigt einen spezifischen Output
    ```

6.  **Zerstören der Infrastruktur (`terraform destroy`):**
    Dieser Befehl entfernt alle von Terraform in dieser Konfiguration erstellten Ressourcen.
    ```bash
    terraform destroy -var-file="test.tfvars" # Oder mit den passenden Variablen, die den aktuellen Zustand repräsentieren
    ```
    Bestätigung mit `yes` ist erforderlich.


**Die detaillierten Reflexionsantworten zu dieser Terraform-Aufgabe befinden sich in:**
(`terraform/01-first-steps/terraform-first-steps-reflection.md`)*

---

---

---

## SQL Recap & Datenmodell

Eine theoretische Ausarbeitung eines relationalen Datenbankmodells befindet sich in der Datei `sql_schema_and_queries.md`. Die für die Notizblock-Anwendung verwendeten Schemata sind `backend/sql/initial_schema.sql` und `backend/sql/update_schema_add_completed.sql`.

## Code-Qualität und Konventionen

*   **Sicherheit:** Parametrisierte Abfragen im Backend, grundlegende Eingabevalidierung. Sensible Daten werden über Umgebungsvariablen oder Helm-Mechanismen verwaltet.
*   **Module:** ES-Module im Backend, komponentenbasiertes Frontend.
*   **.gitignore / .dockerignore:** Konfiguriert, um unnötige Dateien und sensible Informationen auszuschließen.

*  Desweiteren habe ich diese Anwendung in einem Cluster auf Azure deployed. Erreichbar unter dieser IP: http://131.189.216.129/
```



