```markdown
# React Docker Notizblock App (Full-Stack auf Docker Swarm)

Dies ist eine Full-Stack Notizblock-Anwendung, die mit React (Frontend) und Node.js/Express (Backend) erstellt wurde. Die gesamte Anwendung wird mit Docker Compose für die lokale Entwicklung und mit **Docker Swarm für ein verteiltes Deployment** orchestriert. Sie beinhaltet:
*   Ein Frontend, das mit Vite gebaut und von Nginx als Webserver und Reverse Proxy ausgeliefert wird.
*   Ein Backend, das eine REST-API für Notizen bereitstellt und Daten persistent in einer **PostgreSQL-Datenbank** speichert.
*   Eine PostgreSQL-Datenbank als dedizierter Service.
*   Integrierte, aussagekräftige Healthchecks für Datenbank und Backend zur Sicherstellung der Diensteverfügbarkeit und Robustheit der Anwendung.
*   Deployment auf einem Docker Swarm Cluster mit spezifischer **Node-Platzierung** für jeden Dienst (Frontend auf einem Worker mit Label `role=frontend`, Backend auf einem Worker mit Label `role=backend`, Datenbank auf einem Worker mit Label `role=database`).

## Projektstruktur

```text
.
├── .dockerignore
├── .env                  
├── .gitignore
├── README.md             
├── docker-stack.yml      
├── docker-compose.yml    
├── sql_schema_and_queries.md # Theoretische SQL Ausarbeitung
│
├── backend/
│   ├── .dockerignore
│   ├── Dockerfile
│   ├── package-lock.json
│   ├── package.json
│   ├── server.js
│   ├── sql/                  
│   │   ├── initial_schema.sql 
│   │   └── update_schema_add_completed.sql
│   └── src/
│       ├── app.js
│       ├── config/
│       │   └── index.js
│       ├── controllers/
│       │   └── noteController.js
│       ├── db/                 
│       │   └── index.js        
│       ├── routes/
│       │   └── noteRoutes.js
│       ├── services/
│       │   └── noteDbService.js 
│       └── utils/              
│           └── logger.js       
│
└── frontend/
    ├── .dockerignore
    ├── Dockerfile
    ├── index.html
    ├── nginx.conf            # Nginx Konfiguration für Frontend und Proxy
    ├── package-lock.json
    ├── package.json
    ├── vite.config.js
    ├── public/
    │   └── vite.svg
    └── src/
        ├── App.css
        ├── App.jsx
        ├── index.css
        ├── main.jsx
        ├── apiClient.js
        └── components/
            ├── NoteForm.jsx
            ├── NoteItem.jsx
            ├── NoteList.jsx
            ├── ThemeSwitcher.jsx
            ├── ThemeSwitcher.css
            ├── FlyingNote.jsx
            └── FlyingNote.css
```

## Screenshots

*   Funktionierende Anwendung im Browser (CRUD):
    [![Anwendung läuft](assets)](assets)

## Features

*   Notizen anzeigen (Read), Neue Notizen hinzufügen (Create), Bestehende Notizen bearbeiten (Update), Notizen löschen (Delete).
*   Status von Notizen umschalten (Erledigt/Offen).
*   Backend-Datenpersistenz mittels **PostgreSQL-Datenbank** (über Docker Volume, auch im Swarm-Kontext).
*   Datenbankverbindung mit `pg` Treiber und **Connection Pooling**.
*   **Sichere API** durch parametrisierte SQL-Abfragen und grundlegende Eingabevalidierung im Backend.
*   Vollständig containerisiert mit Docker.
*   Orchestrierung mit Docker Compose (für lokale Entwicklung) und **Docker Swarm** (für verteiltes Deployment).
*   **Node Affinity im Swarm:** Gezielte Platzierung von Frontend, Backend und Datenbank auf separaten, gelabelten Worker Nodes.
*   Frontend mit Nginx Reverse Proxy für API-Aufrufe an das Backend.
*   **Robuste Fehlerbehandlung**: Das Backend stürzt bei DB-Verbindungsproblemen nicht ab. Das Frontend zeigt bei Backend-Fehlern nutzerfreundliche Meldungen.
*   Umfassendes Logging wichtiger Ereignisse, DB-Verbindungsstatus und Fehler.
*   **Aussagekräftige Healthchecks** für Datenbank- und Backend-Dienst, die die tatsächliche Funktionsfähigkeit (inkl. DB-Verbindung für das Backend) prüfen und im Swarm-Kontext den Dienstzustand korrekt widerspiegeln.
*   Manueller Light/Dark-Mode Umschalter mit Persistenz im `localStorage`.
*   Visueller Effekt "Fliegender Notizzettel" beim Speichern von Notizen.
*   Client-seitige Such-, Filter- und Sortierfunktionen für Notizen.

## Voraussetzungen

*   Docker & Docker Compose (für lokale Entwicklung und Image-Builds)
*   Multipass (oder eine andere Methode, um mehrere Linux VMs für das Swarm Cluster zu erstellen, z.B. 1 Manager, 3 Worker)
*   Git
*   Ein Docker Hub Account (oder eine andere Docker Registry), um die Anwendungs-Images zu pushen.

## Lokales Setup und Start mit Docker Compose (für Entwicklung)

Für die lokale Entwicklung kann der Stack mit der `docker-compose.yml` Datei gestartet werden.

1.  **Repository klonen und navigieren:**
    ```bash
    git clone https://github.com/sebriede6/Docker-Container.git 
    cd Docker-Container 
    ```
2.  **`.env`-Datei erstellen:**
    Erstelle eine `.env`-Datei im Projektwurzelverzeichnis mit folgendem Inhalt (passe die Werte bei Bedarf an):
    ```env
    # .env (Beispielinhalt für lokale Entwicklung)
    DB_USER=myuser
    DB_PASSWORD=supersecretpassword 
    DB_NAME=notizblockdb
    BACKEND_PORT=3000
    LOG_LEVEL=debug
    ```
3.  **Datenbankschema erstellen (einmalig für lokales Volume):**
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
    Die Anwendung ist unter `http://localhost:8080` erreichbar.

---

## Deployment auf Docker Swarm Cluster

Dieser Abschnitt beschreibt, wie die Anwendung auf einem vorbereiteten Docker Swarm Cluster deployed wird, wobei die Dienste auf spezifisch gelabelten Worker-Nodes platziert werden.

### 1. Docker Swarm Cluster einrichten (Beispiel mit Multipass VMs)

1.  **VMs erstellen:** Erstelle vier Multipass VMs (z.B. `manager`, `worker1`, `worker2`, `worker3`).
2.  **Docker installieren:** Installiere Docker auf allen vier VMs.
3.  **Swarm initialisieren:** Auf der `manager`-VM (ersetze `<MANAGER_IP>` mit der IP der Manager-VM, die von anderen VMs erreichbar ist):
    ```bash
    docker swarm init --advertise-addr <MANAGER_IP>
    ```
    Kopiere den ausgegebenen `docker swarm join ...` Befehl.
4.  **Worker Nodes beitreten lassen:** Führe den kopierten Join-Befehl auf `worker1`, `worker2` und `worker3` aus.
5.  **Worker Nodes labeln:** Auf der `manager`-VM. Diese Labels werden für die Placement Constraints in der `docker-stack.yml` verwendet.
    ```bash
    docker node update --label-add role=frontend worker1
    docker node update --label-add role=backend worker2
    docker node update --label-add role=database worker3
    # Überprüfen mit: docker node ls -q | xargs docker node inspect -f '{{ .Description.Hostname }}: {{ .Spec.Labels }}'
    ```

### 2. Anwendungs-Images vorbereiten und pushen

1.  **Images bauen:** Stelle sicher, dass die Dockerfiles aktuell sind (`backend/Dockerfile` muss `curl` für den Healthcheck enthalten). Ersetze `DEIN_DOCKERHUB_BENUTZERNAME` mit deinem Docker Hub Benutzernamen.
    ```bash
    # Im Projektwurzelverzeichnis ausführen
    docker build -t DEIN_DOCKERHUB_BENUTZERNAME/mein-notizblock-backend:latest ./backend
    docker build -t DEIN_DOCKERHUB_BENUTZERNAME/mein-notizblock-frontend:latest --build-arg VITE_API_URL=/api ./frontend
    ```
2.  **Einloggen und Pushen zu Docker Hub:**
    ```bash
    docker login
    docker push DEIN_DOCKERHUB_BENUTZERNAME/mein-notizblock-backend:latest
    docker push DEIN_DOCKERHUB_BENUTZERNAME/mein-notizblock-frontend:latest
    ```

### 3. Stack Datei (`docker-stack.yml`) vorbereiten und auf den Manager kopieren

Die `docker-stack.yml` Datei (im Projektwurzelverzeichnis) ist für das Swarm-Deployment konfiguriert. Sie enthält `deploy` Sektionen mit `placement.constraints`, um die Dienste auf den gelabelten Nodes zu platzieren, und verweist auf die zuvor gepushten Images.
Kopiere die `docker-stack.yml` auf den Swarm Manager (z.B. nach `/home/ubuntu/docker-stack.yml`).

### 4. Umgebungsvariablen auf dem Manager setzen (entscheidend!)

Bevor der Stack deployed wird, müssen die notwendigen Umgebungsvariablen (insbesondere `DB_PASSWORD`, da in der `docker-stack.yml` kein Defaultwert dafür vorgesehen ist) auf dem Swarm Manager in der aktuellen Shell-Sitzung gesetzt werden:
```bash

export DB_USER="myuser"                 
export DB_PASSWORD="DEIN_PASSWORT_HIER_EINTRAGEN" 
export DB_NAME="notizblockdb"           
export BACKEND_PORT="3000"              
export LOG_LEVEL="info"                 
```

### 5. Datenbank-Schema im Swarm-DB-Container erstellen (einmalig pro neuem DB-Volume)

Da der Datenbankdienst im Swarm mit einem Volume (`postgres_data_swarm`) auf dem zugewiesenen Worker-Node (z.B. `worker3`) startet, muss das Schema einmalig angewendet werden, falls das Volume neu oder leer ist:
1.  Kopiere die SQL-Skripte (`backend/sql/initial_schema.sql` und `backend/sql/update_schema_add_completed.sql`) auf den Node, auf dem der Datenbank-Task laufen wird (z.B. `worker3`, in ein Verzeichnis wie `/home/ubuntu/`).
2.  Nachdem der Stack deployed wurde (nächster Schritt) und der `notizapp_database`-Task auf dem Worker läuft, finde dessen Container-ID (mit `docker ps` auf dem entsprechenden Worker-Node).
3.  Führe auf dem Worker-Node, auf dem die Datenbank läuft, aus (Pfade und die zuvor exportierten Credentials für `DB_USER` und `DB_NAME` verwenden):
    ```bash
    # Auf dem Worker-Node, wo die DB läuft (z.B. worker3)
    docker exec -i <DB_CONTAINER_ID> psql -U myuser -d notizblockdb < /home/ubuntu/initial_schema.sql
    docker exec -i <DB_CONTAINER_ID> psql -U myuser -d notizblockdb < /home/ubuntu/update_schema_add_completed.sql
    ```

### 6. Stack auf Swarm deployen

Führe auf dem Swarm Manager im Verzeichnis mit der `docker-stack.yml` aus:
```bash

docker stack rm notizapp 

docker stack deploy -c docker-stack.yml notizapp
```

## Verifizierung des Deployments auf Docker Swarm

Nach dem Deployment des Stacks (`notizapp`) können folgende Schritte zur Verifizierung durchgeführt werden:

1.  **Gesamtstatus der Dienste im Stack prüfen:**
    Auf dem Swarm Manager:
    ```bash
    docker stack services notizapp
    ```
    **Erwartetes Ergebnis:** Alle Dienste (`notizapp_database`, `notizapp_backend`, `notizapp_frontend`) sollten in der Spalte `REPLICAS` den Wert `1/1` anzeigen, was bedeutet, dass die gewünschte Anzahl von Instanzen läuft.

2.  **Korrekte Platzierung der Dienste und Task-Zustand prüfen:**
    Führe für jeden Dienst auf dem Swarm Manager aus:
    ```bash
    docker service ps notizapp_database
    docker service ps notizapp_backend
    docker service ps notizapp_frontend
    ```
    **Erwartetes Ergebnis:**
    *   **`NODE` Spalte:** Zeigt den korrekten Worker-Node gemäß den `placement.constraints` an (`worker3` für DB, `worker2` für Backend, `worker1` für Frontend, basierend auf den Labels `role=database`, `role=backend`, `role=frontend`).
    *   **`CURRENT STATE` Spalte:** Sollte `Running ...` anzeigen. Für `database` und `backend` impliziert ein stabiler `Running`-Status nach der `start_period` einen erfolgreichen Healthcheck (dies wird durch die Backend-Logs weiter bestätigt).

3.  **Zugriff auf die Anwendung und E2E-Funktionalität testen:**
    *   Ermittle die IP-Adresse eines beliebigen Nodes im Swarm Cluster (z.B. die IP von `worker1`, auf dem das Frontend läuft, via `multipass info worker1` oder `docker node inspect worker1 --pretty | grep Addr`).
    *   Öffne im Browser deines Host-Rechners: `http://<IP_DES_SWARM_NODES>`.
    *   **Teste alle CRUD-Operationen** (Erstellen, Anzeigen, Bearbeiten, Löschen von Notizen, Status umschalten) und andere Frontend-Features (Suche, Filter, Sortierung, Theme-Switcher, Fliegender Notizzettel).
    *   **Erwartetes Ergebnis:** Die Anwendung ist voll funktionsfähig. Alle Änderungen sind persistent.

4.  **Logs der Dienste einsehen:**
    Greife auf die Logs der einzelnen Dienste auf dem Swarm Manager zu, um das Verhalten und mögliche Fehler zu analysieren:
    ```bash
    docker service logs notizapp_database
    docker service logs notizapp_backend
    docker service logs notizapp_frontend 
    ```
    **Interpretation:**
    *   **Backend-Logs:** Sollten erfolgreiche Datenbankverbindungen, API-Anfragen und periodische Aufrufe des `/health`-Endpunkts (mit erfolgreicher DB-Prüfung) zeigen.
    *   **Frontend-Logs (Nginx):** Zeigen eingehende HTTP-Anfragen und die vom Backend (via Proxy) erhaltenen Statuscodes.

5.  **Robustheit gegen simulierte Fehler verifizieren (Beispiel: Datenbankausfall):**
    *   **a) Datenbank-Dienst stoppen** (simuliert durch Skalierung auf 0 Replicas):
        ```bash
        # Auf dem manager VM
        docker service scale notizapp_database=0
        ```
    *   **b) Verhalten beobachten:**
        *   `docker service ps notizapp_backend` sollte nach kurzer Zeit zeigen, dass der Backend-Task fehlschlägt oder der Dienst als `0/1` mit Fehlern bei den Tasks angezeigt wird, da der Healthcheck die DB nicht mehr erreicht.
        *   Versuche im Browser, auf die Anwendung zuzugreifen oder Daten zu laden/speichern. Das Frontend sollte eine nutzerfreundliche Fehlermeldung (z.B. via Toastify) anzeigen.
        *   Die Backend-Logs sollten Fehler bei der Datenbankverbindung im `/health`-Endpunkt und bei regulären Anfragen zeigen.
    *   **c) Datenbank-Dienst wieder starten:**
        ```bash
        # Auf dem manager VM
        docker service scale notizapp_database=1
        ```
    *   **d) Wiederherstellung prüfen:** Nach kurzer Zeit sollten `notizapp_database` und `notizapp_backend` wieder `REPLICAS 1/1` und `Running` Tasks aufweisen. Die Anwendung im Browser sollte nach einem Neuladen wieder voll funktionsfähig sein.

Durch diese Verifizierungsschritte wird die erfolgreiche und robuste Bereitstellung des Stacks auf dem Docker Swarm Cluster nachgewiesen.

## Wichtige Services und Ports (im Swarm Kontext)

*   **Frontend (Nginx):** Erreichbar über Port 80 auf der IP-Adresse **jedes beliebigen Nodes** im Swarm Cluster (dank Swarm Routing Mesh). Leitet API-Anfragen (`/api/*`) an den `backend`-Service weiter.
*   **Backend (Node.js API):** Lauscht intern im Swarm Overlay-Netzwerk auf dem konfigurierten Port (z.B. 3000). Erreichbar für das Frontend über den Service-Namen `backend`.
*   **Datenbank (PostgreSQL):** Lauscht intern im Swarm Overlay-Netzwerk auf Port 5432. Erreichbar für das Backend über den Service-Namen `database`.

## Logs anzeigen (im Swarm Kontext)

*   Logs eines spezifischen Dienstes im Stack: `docker service logs notizapp_<dienstname>` (z.B. `docker service logs notizapp_backend`)

## Anwendung im Swarm stoppen/entfernen

*   Stack entfernen (löscht alle Dienste, Netzwerke des Stacks):
    ```bash
    # Auf dem manager VM
    docker stack rm notizapp
    ```
*   Um auch das benannte Swarm-Volume `postgres_data_swarm` zu entfernen (ACHTUNG: Alle Notizdaten gehen verloren!), muss dies auf dem Node geschehen, auf dem es erstellt wurde (z.B. `worker3`), oder über Docker Volume Management Befehle.

## SQL Recap & Datenmodell

Eine theoretische Ausarbeitung eines relationalen Datenbankmodells befindet sich in der Datei `sql_schema_and_queries.md`. Die **tatsächlichen Schemata**, die für diese Aufgabe manuell angewendet werden, befinden sich in `backend/sql/initial_schema.sql` und `backend/sql/update_schema_add_completed.sql`.

## Code-Qualität und Konventionen

*   **Sicherheit:** Es werden parametrisierte Abfragen im Backend verwendet, um SQL Injection zu verhindern. Es erfolgt eine grundlegende Validierung von Eingabedaten.
*   **Module:** Das Backend verwendet ES-Module (`import`/`export`). Das Frontend ist komponentenbasiert aufgebaut.
*   **.gitignore / .dockerignore:** Diese Dateien sind konfiguriert, um unnötige Dateien und sensible Informationen (wie `.env` für die lokale Entwicklung) von der Versionskontrolle bzw. dem Docker-Build-Kontext auszuschließen.
```