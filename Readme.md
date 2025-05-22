```markdown
# React Docker Notizblock App (Full-Stack: Lokal, Swarm & Kubernetes)

Dies ist eine Full-Stack Notizblock-Anwendung, die mit React (Frontend) und Node.js/Express (Backend) erstellt wurde. Die Anwendung wurde für verschiedene Deployment-Szenarien konfiguriert: lokale Entwicklung mit Docker Compose, verteiltes Deployment auf Docker Swarm und die Demonstration grundlegender Kubernetes-Konzepte mit einer Beispielanwendung.

Die Kernanwendung (Notizblock) beinhaltet:
*   Ein Frontend, das mit Vite gebaut und von Nginx als Webserver und Reverse Proxy ausgeliefert wird.
*   Ein Backend, das eine REST-API für Notizen bereitstellt und Daten persistent in einer **PostgreSQL-Datenbank** speichert.
*   Eine PostgreSQL-Datenbank als dedizierter Service.
*   Integrierte, aussagekräftige Healthchecks für Datenbank und Backend zur Sicherstellung der Diensteverfügbarkeit.

Zusätzlich wurden Kubernetes-Konzepte wie Deployments, Services, Rolling Updates und Rollbacks anhand einer Nginx-Beispielanwendung auf einem lokalen Kubernetes-Cluster (Docker Desktop) demonstriert.

## Projektstruktur

```text
.
├── .dockerignore
├── .env                  # Lokale Umgebungsvariablen (nicht versioniert)
├── .gitignore
├── README.md             # Diese Datei
├── docker-stack.yml      # Für AKS
├── docker-compose.yml    # Für lokale Entwicklung der Notizblock-App
├── sql_schema_and_queries.md # Theoretische SQL Ausarbeitung
│
├── backend/              # Backend der Notizblock-App
│   ├── Dockerfile
│   ├── package.json
│   ├── server.js
│   ├── sql/                  
│   │   ├── initial_schema.sql 
│   │   └── update_schema_add_completed.sql
│   └── src/
│       # ... (Backend Quellcode)
│
├── frontend/             # Frontend der Notizblock-App
│   ├── Dockerfile
│   ├── nginx.conf
│   ├── package.json
│   ├── vite.config.js
│   └── src/
│       # ... (Frontend Quellcode und Komponenten)
│
└── kubernetes/
    ├── 01-intro/
    │   ├── k8s-intro-reflection.md   # Reflexion zur Kubernetes Einführung
    │   └── [Screenshot_kubectl_get_nodes.png] # Beispiel-Screenshot K8s Nachweis
    └── 02-deployment-service/
        ├── nginx-app-v1/         # Nginx Beispielanwendung Version 1
        │   ├── Dockerfile
        │   └── index.html
        ├── nginx-app-v2/         # Nginx Beispielanwendung Version 2
        │   ├── Dockerfile
        │   └── index.html
        ├── nginx-deployment.yaml # K8s Deployment für Nginx-Beispiel
        ├── nginx-service.yaml    # K8s Service für Nginx-Beispiel
        └── k8s-deployment-reflection.md # Reflexion K8s Deployment Aufgabe
```

## Screenshots

*   Funktionierende Anwendung im Browser (CRUD):
    [![Anwendung läuft](assets)](assets)

## Features der Notizblock-Anwendung

*   Vollständige CRUD-Operationen für Notizen.
*   Statusumschaltung für Notizen (Erledigt/Offen).
*   Persistente Datenspeicherung in PostgreSQL.
*   Sichere API durch parametrisierte Abfragen und Eingabevalidierung.
*   Containerisierung mit Docker.
*   Orchestrierung mit Docker Compose (lokal) und Docker Swarm (verteilt) inklusive Node Affinity.
*   Robuste Fehlerbehandlung und aussagekräftige Healthchecks.
*   Frontend mit Nginx Reverse Proxy, Light/Dark-Mode, Suche, Filter, Sortierung und visuellen Effekten.

## Voraussetzungen

*   Docker & Docker Compose
*   `kubectl` Kommandozeilen-Tool
*   Multipass (für Swarm-Setup) oder ein lokales Kubernetes-Cluster-Tool (z.B. Kubernetes in Docker Desktop, Minikube, Kind)
*   Git
*   Ein Docker Hub Account (oder eine andere Container Registry)

## Lokales Setup der Notizblock-Anwendung (Docker Compose)

Für die lokale Entwicklung kann der Notizblock-Stack mit der `docker-compose.yml` Datei gestartet werden.

1.  **Repository klonen und navigieren:**
    ```bash
    git clone https://github.com/sebriede6/Docker-Container.git 
    cd Docker-Container 
    ```
2.  **`.env`-Datei erstellen:**
    Erstelle eine `.env`-Datei im Projektwurzelverzeichnis (siehe `env.example` falls vorhanden) mit Inhalt wie:
    ```env
    DB_USER=myuser
    DB_PASSWORD=secret 
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

## Deployment der Notizblock-Anwendung auf Docker Swarm Cluster

Dieser Abschnitt beschreibt, wie die Notizblock-Anwendung auf einem vorbereiteten Docker Swarm Cluster deployed wird, wobei die Dienste auf spezifisch gelabelten Worker-Nodes platziert werden. Die detaillierte Anleitung inklusive Setup des Swarms, Image-Build/Push, Konfiguration der `docker-stack.yml` und Verifizierungsschritten befindet sich in der [Reflexionsfragen.md](Reflexionsfragen.md) (oder einer separaten Datei, die du für die Swarm-Reflexionen verwendest).

**Kurzübersicht der Schritte:**
1.  Docker Swarm Cluster mit Multipass VMs einrichten (1 Manager, 3 Worker).
2.  Worker Nodes labeln (`role=frontend`, `role=backend`, `role=database`).
3.  Notizblock Frontend- und Backend-Images bauen und zu Docker Hub pushen.
4.  `docker-stack.yml` vorbereiten/kopieren und Umgebungsvariablen auf dem Manager setzen.
5.  Datenbankschema im Swarm-DB-Container erstellen.
6.  Stack mit `docker stack deploy -c docker-stack.yml notizapp` deployen.
7.  Verifizierung mittels `docker stack services`, `docker service ps`, Logs und Testen der Anwendung über eine Node-IP.

---

## Kubernetes: Deployment, Service, Rolling Update & Rollback (Nginx Beispielanwendung)

Diese Aufgabe demonstriert grundlegende Kubernetes-Konzepte (Deployment, Service, Rolling Update, Rollback) anhand einer einfachen Nginx-Anwendung auf einem lokalen Kubernetes-Cluster (z.B. aktiviert in Docker Desktop).

**Ziel:** Eine Nginx-Anwendung deployen, über einen NodePort-Service zugänglich machen, ein Update auf eine neue Version durchführen und anschließend einen Rollback zur vorherigen Version demonstrieren.

### Vorbereitung der Nginx-Images

Zwei Versionen einer einfachen Nginx-Seite (`nginx-app-v1` und `nginx-app-v2` mit unterschiedlichen `index.html` Dateien) wurden erstellt. Die Dockerfiles befinden sich in:
*   `kubernetes/02-deployment-service/nginx-app-v1/Dockerfile`
*   `kubernetes/02-deployment-service/nginx-app-v2/Dockerfile`

Diese Images müssen gebaut und zu einer Registry gepusht werden (ersetze `DEIN_DOCKERHUB_BENUTZERNAME`):
```bash

docker build -t DEIN_DOCKERHUB_BENUTZERNAME/nginx-example:v1 ./kubernetes/02-deployment-service/nginx-app-v1
docker build -t DEIN_DOCKERHUB_BENUTZERNAME/nginx-example:v2 ./kubernetes/02-deployment-service/nginx-app-v2
docker login 
docker push DEIN_DOCKERHUB_BENUTZERNAME/nginx-example:v1
docker push DEIN_DOCKERHUB_BENUTZERNAME/nginx-example:v2
```

### Kubernetes Manifeste und Deployment

Die Kubernetes Manifest-Dateien für das Deployment und den Service der Nginx-Anwendung befinden sich in `kubernetes/02-deployment-service/`:
*   `nginx-deployment.yaml`
*   `nginx-service.yaml`

**Anleitung zum Deployen und Testen (Kurzform):**

1.  **Kontext sicherstellen:** `kubectl config use-context docker-desktop` (oder dein lokaler Cluster-Kontext).
2.  **Deployment anwenden:**
    Passe in `nginx-deployment.yaml` den Image-Pfad (`image: DEIN_DOCKERHUB_BENUTZERNAME/nginx-example:v1`) an.
    ```bash
    kubectl apply -f kubernetes/02-deployment-service/nginx-deployment.yaml
    kubectl apply -f kubernetes/02-deployment-service/nginx-service.yaml
    ```
3.  **Überprüfen und Zugriff:**
    ```bash
    kubectl get deployment nginx-app-deployment
    kubectl get pods -l app=nginx-example
    kubectl get service nginx-app-service 
    ```
    Öffne im Browser `http://localhost:<NodePort>`. Version 1 der Nginx-Seite sollte sichtbar sein.
4.  **Rolling Update auf Version 2:**
    *   Ändere in `nginx-deployment.yaml` das Image auf `:v2`.
    *   `kubectl apply -f kubernetes/02-deployment-service/nginx-deployment.yaml`
    *   Beobachte mit `kubectl rollout status deployment/nginx-app-deployment`.
    *   Nach Erfolg: Browser neu laden. Version 2 sollte sichtbar sein.
5.  **Rollback auf Version 1:**
    *   `kubectl rollout undo deployment/nginx-app-deployment`
    *   Nach Erfolg: Browser neu laden. Version 1 sollte wieder sichtbar sein.
6.  **Aufräumen:**
    ```bash
    kubectl delete -f kubernetes/02-deployment-service/nginx-deployment.yaml -f kubernetes/02-deployment-service/nginx-service.yaml
    ```

**Die detaillierten Reflexionsantworten zu dieser Kubernetes-Deployment-Aufgabe befinden sich in:**
[kubernetes/02-deployment-service/k8s-deployment-reflection.md](kubernetes/02-deployment-service/k8s-deployment-reflection.md)

---


# Deployen in einem AKS

Desweiteren habe ich diese Anwendung bereits in einem Kubernetes Cluster auf Azure deployed.

---
