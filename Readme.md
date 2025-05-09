
---

```markdown
# React Docker Notizblock App (Full-Stack mit Docker Compose)

Dies ist eine Full-Stack Notizblock-Anwendung, die mit React (Frontend) und Node.js/Express (Backend) erstellt wurde. Die gesamte Anwendung wird mit Docker Compose orchestriert und beinhaltet:
*   Ein Frontend, das mit Vite gebaut und von Nginx als Webserver und Reverse Proxy ausgeliefert wird.
*   Ein Backend, das eine REST-API für Notizen bereitstellt und Daten persistent in einer JSON-Datei speichert.
*   Eine PostgreSQL-Datenbank für zukünftige Erweiterungen (momentan noch nicht aktiv vom Backend genutzt, aber die Zugangsdaten werden geloggt).

## Projektstruktur

```
.
├── .dockerignore
├── .env                # (LOKAL, NICHT IN GIT!)
├── .gitignore
├── README.md
├── docker-compose.yml
├── sql_schema_and_queries.md
│
├── backend/
│   ├── .dockerignore
│   ├── Dockerfile
│   ├── package-lock.json
│   ├── package.json
│   ├── server.js
│   ├── data/           # (Automatisch erstellt)
│   └── src/
│       ├── app.js
│       ├── config/
│       │   └── index.js
│       ├── controllers/
│       │   └── noteController.js
│       ├── routes/
│       │   └── noteRoutes.js
│       └── services/
│           └── fileService.js
│
└── frontend/
    ├── .dockerignore
    ├── Dockerfile
    ├── index.html
    ├── nginx.conf
    ├── package-lock.json
    ├── package.json
    ├── tailwind.config.js # (Falls verwendet)
    ├── vite.config.js
    ├── public/
    │   └── vite.svg
    └── src/
        ├── App.css
        ├── App.jsx
        ├── index.css
        ├── main.jsx
        └── components/
            ├── NoteForm.jsx
            ├── NoteItem.jsx
            └── NoteList.jsx
## Screenshots

Ein Vorschau-Screenshot ist unten eingebettet. Klicke auf das Bild, um alle Screenshots in einem neuen Tab zu öffnen.

[![Vorschau-Screenshot](assets/Screenshot%202025-05-07%20162916.png)](assets/)


## Features

*   Notizen anzeigen
*   Neue Notizen hinzufügen
*   Bestehende Notizen bearbeiten (inline)
*   Notizen löschen
*   Backend-Datenpersistenz mittels JSON-Datei (über Docker Volume gemountet)
*   Vollständig containerisiert mit Docker: Frontend, Backend, Datenbank.
*   Orchestrierung mit Docker Compose.
*   Frontend mit Nginx Reverse Proxy für API-Aufrufe an das Backend.
*   Logging von (Dummy-)Datenbank-Umgebungsvariablen im Backend beim Start.

## Voraussetzungen

*   Docker
*   Docker Compose (ist Teil von Docker Desktop)
*   Node.js und npm (nur für lokale Entwicklung ohne Docker)
*   Git

## Setup und Start mit Docker Compose

1.  **Repository klonen:**
    ```bash
    git clone <dein-repository-url>
    cd <projekt-name>
    ```
2.  **(Optional, aber empfohlen) Umgebungsvariablen konfigurieren:**
    Erstelle eine Datei namens `.env` im Wurzelverzeichnis des Projekts (auf derselben Ebene wie `docker-compose.yml`). Docker Compose liest diese Datei automatisch.
    Füge folgenden Inhalt ein und passe die Werte bei Bedarf an:
    ```env
    # .env (Beispielinhalt)
    DB_USER=myuser
    DB_PASSWORD=supersecretpassword
    DB_NAME=notizblockdb
    BACKEND_PORT=3000
    # LOG_LEVEL=debug # Optional, um das Loglevel des Backends zu steuern
    ```
    **Wichtig:** Stelle sicher, dass die `.env`-Datei in deiner `.gitignore`-Datei aufgeführt ist, um zu verhindern, dass sensible Daten in Git committet werden.

3.  **Anwendung mit Docker Compose bauen und starten:**
    Führe im Wurzelverzeichnis des Projekts (wo die `docker-compose.yml` liegt) folgenden Befehl aus:
    ```bash
    docker compose up --build -d
    ```
    *   `--build`: Baut die Images neu, falls Änderungen in den Dockerfiles oder im Code-Kontext vorliegen.
    *   `-d`: Startet die Container im Detached-Modus (im Hintergrund).

4.  **Status überprüfen:**
    Nach kurzer Zeit (besonders die Datenbank benötigt einen Moment zum Initialisieren), überprüfe den Status:
    ```bash
    docker compose ps
    ```
    Alle Services (frontend, backend, database) sollten als `Up` oder `running` angezeigt werden. Der `database`-Service sollte zudem `(healthy)` im Status anzeigen, falls der Healthcheck wie in der Vorlage definiert ist.

5.  **Anwendung im Browser aufrufen:**
    Öffne deinen Webbrowser und gehe zu `http://localhost:8080`.

## Wichtige Services und Ports

*   **Frontend (Nginx):** Erreichbar unter `http://localhost:8080` (Host-Port 8080 gemappt auf Container-Port 80).
*   **Backend (Node.js API):** Lauscht intern im Docker-Netzwerk auf Port 3000 (oder dem Wert von `BACKEND_PORT`). API-Aufrufe vom Frontend erfolgen über den Nginx-Proxy auf dem Pfad `/api`. Für direktes Debugging ist kein Host-Port standardmäßig gemappt (kann bei Bedarf in `docker-compose.yml` hinzugefügt werden).
*   **Datenbank (PostgreSQL):** Lauscht intern im Docker-Netzwerk auf Port 5432. Ist optional auf Host-Port `5433` gemappt (siehe `docker-compose.yml`) für direkten Zugriff mit DB-Tools.

## Logs anzeigen

*   Logs aller Services:
    ```bash
    docker compose logs
    ```
*   Logs eines spezifischen Services (z.B. Backend):
    ```bash
    docker compose logs backend
    ```
*   Logs eines Services live verfolgen:
    ```bash
    docker compose logs -f backend
    ```

## Anwendung stoppen

*   Um die Container zu stoppen:
    ```bash
    docker compose stop
    ```
*   Um die Container zu stoppen und zu entfernen (Netzwerke bleiben bestehen, benannte Volumes auch):
    ```bash
    docker compose down
    ```
*   Um die Container zu stoppen, zu entfernen UND alle benannten Volumes zu löschen, die in der `docker-compose.yml` definiert sind (ACHTUNG: Datenverlust!):
    ```bash
    docker compose down -v
    ```

## SQL Recap & Datenmodell

Eine theoretische Ausarbeitung eines relationalen Datenbankmodells (Schema-Definition mit `CREATE TABLE` und CRUD-SQL-Abfragen), das thematisch zur Anwendung passt, befindet sich in der Datei `sql_schema_and_queries.md`.

---
```

