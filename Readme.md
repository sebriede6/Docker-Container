```markdown
# React Docker Notizblock App (Full-Stack mit Docker Compose & PostgreSQL)

Dies ist eine Full-Stack Notizblock-Anwendung, die mit React (Frontend) und Node.js/Express (Backend) erstellt wurde. Die gesamte Anwendung wird mit Docker Compose orchestriert und beinhaltet:
*   Ein Frontend, das mit Vite gebaut und von Nginx als Webserver und Reverse Proxy ausgeliefert wird.
*   Ein Backend, das eine REST-API für Notizen bereitstellt und Daten persistent in einer **PostgreSQL-Datenbank** speichert.
*   Eine PostgreSQL-Datenbank als dedizierter Service.
*   Integrierte Healthchecks für Datenbank und Backend zur Sicherstellung der Diensteverfügbarkeit.

## Projektstruktur

```text
.
├── .dockerignore
├── .env                  
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
    ├── nginx.conf
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

**Aktuelle Screenshots (mit Datenbank-Persistenz und funktionierenden CRUD-Operationen):**

*   Funktionierende Anwendung im Browser (CRUD):
    [![Anwendung läuft](assets)](assets)



## Features

*   Notizen anzeigen (Read)
*   Neue Notizen hinzufügen (Create)
*   Bestehende Notizen bearbeiten (Update)
*   Notizen löschen (Delete)
*   Status von Notizen umschalten (Erledigt/Offen)
*   Backend-Datenpersistenz mittels **PostgreSQL-Datenbank** (über Docker Volume).
*   Datenbankverbindung mit `pg` Treiber und **Connection Pooling**.
*   **Sichere API** durch parametrisierte SQL-Abfragen (Schutz vor SQL Injection).
*   Vollständig containerisiert mit Docker: Frontend, Backend, Datenbank.
*   Orchestrierung mit Docker Compose.
*   Frontend mit Nginx Reverse Proxy für API-Aufrufe an das Backend.
*   Logging wichtiger Ereignisse und DB-Verbindungsstatus.
*   **Aussagekräftige Healthchecks** für Datenbank- und Backend-Dienst, konfiguriert in `docker-compose.yml`.
*   Manueller Light/Dark-Mode Umschalter mit Persistenz im `localStorage`.
*   Visueller Effekt "Fliegender Notizzettel" beim Speichern von Notizen.
*   Client-seitige Such-, Filter- und Sortierfunktionen für Notizen.

## Voraussetzungen

*   Docker
*   Docker Compose (ist Teil von Docker Desktop)
*   Git

## Setup und Start mit Docker Compose

1.  **Repository klonen:**
    ```bash
    git clone https://github.com/sebriede6/Docker-Container.git
    cd <projekt-name>
    ```
2.  **(Optional, aber empfohlen) Umgebungsvariablen konfigurieren:**
    Erstelle eine Datei namens `.env` im Wurzelverzeichnis des Projekts (auf derselben Ebene wie `docker-compose.yml`).
    ```env
    # .env (Beispielinhalt)
    DB_USER=selbst ausdenken
    DB_PASSWORD=selbst ausdenken
    DB_NAME=selbst ausdenken
    BACKEND_PORT=selbst ausdenken
    LOG_LEVEL=debug

    dann natürlich die datenbank darauf zuschneiden.
    ```
    **Wichtig:** Die `.env`-Datei ist in `.gitignore` aufgeführt, um sensible Daten zu schützen.

3.  **Datenbank-Schema manuell erstellen (Einmalig):**
    *   **a) Nur Datenbank starten:**
        ```bash
        docker compose up -d database
        ```
    *   **b) Warten, bis DB bereit ist (`(healthy)` Status):**
        ```bash
        docker compose ps
        ```
    *   **c) Schema anwenden:** Zuerst das initiale Schema, dann das Update-Schema.
        ```bash
        docker exec -i postgres_db_service psql -U ${DB_USER:-myuser} -d ${DB_NAME:-notizblockdb} < backend/sql/initial_schema.sql
        docker exec -i postgres_db_service psql -U ${DB_USER:-myuser} -d ${DB_NAME:-notizblockdb} < backend/sql/update_schema_add_completed.sql
        ```
        *(Bei Erfolg sollten keine Fehler, sondern Meldungen wie CREATE TABLE, ALTER TABLE etc. erscheinen).*

4.  **Gesamte Anwendung bauen und starten:**
    Führe im Wurzelverzeichnis des Projekts folgenden Befehl aus:
    ```bash
    docker compose up --build -d
    ```
    *   `--build`: Baut die Images bei Code-Änderungen neu.
    *   `-d`: Startet die Container im Hintergrund.

## Finaler Zustand des Stacks und Verifizierung

Der finale Zustand des Stacks umfasst ein voll funktionsfähiges Full-Stack-System, bestehend aus einem React-Frontend, einem Node.js/Express-Backend und einer PostgreSQL-Datenbank, alles orchestriert durch Docker Compose. Alle Dienste sind containerisiert.

*   **Datenbank-Persistenz:** Das Backend speichert alle Notizdaten persistent in der PostgreSQL-Datenbank. Die Daten bleiben auch nach einem Neustart der Container (oder des gesamten Stacks, sofern das Datenbank-Volume nicht explizit gelöscht wird) erhalten.
*   **CRUD-Operationen:** Alle vier CRUD-Operationen (Create, Read, Update, Delete) sowie das Umschalten des "completed"-Status für Notizen sind vollständig implementiert und funktionieren Ende-zu-Ende vom Frontend über das Backend bis zur Datenbank.
*   **Healthchecks:**
    *   Der **PostgreSQL-Dienst** (`database`) verfügt über einen Healthcheck, der mittels `pg_isready` prüft, ob der Datenbankserver bereit ist, Verbindungen anzunehmen.
    *   Der **Backend-Dienst** (`backend`) hat einen Healthcheck, der über `curl` einen speziellen `/health`-Endpunkt aufruft. Dieser Endpunkt prüft intern zusätzlich die Konnektivität zur Datenbank, bevor er einen Erfolgsstatus zurückmeldet.
    *   Die `docker-compose.yml` nutzt `depends_on` mit der `service_healthy`-Bedingung, um sicherzustellen, dass das Backend erst startet, wenn die Datenbank als "healthy" gemeldet wird, und das Frontend erst, wenn das Backend "healthy" ist.

**Verifizierung des Stacks:**

1.  **Stack starten:**
    Führe im Wurzelverzeichnis des Projekts den Befehl aus:
    ```bash
    docker compose up --build -d
    ```
    Warte einige Momente (ca. 45-60 Sekunden), bis alle Dienste initialisiert sind und die Healthchecks greifen.

2.  **Healthcheck-Status überprüfen:**
    Öffne ein Terminal und führe folgenden Befehl aus:
    ```bash
    docker compose ps
    ```
    In der Ausgabe sollten die Dienste `postgres_db_service` und `backend_api_service` (bzw. der Service-Name `backend`, falls `container_name` nicht für die `ps`-Ausgabe primär ist) in der `STATUS`-Spalte den Zusatz `(healthy)` aufweisen. Dies bestätigt, dass die Healthchecks erfolgreich sind.

3.  **Ende-zu-Ende Funktionalität (CRUD) testen:**
    *   Öffne deinen Webbrowser und navigiere zu `http://localhost:8080`.
    *   **Create:** Füge eine oder mehrere neue Notizen über das Formular hinzu. Überprüfe, ob sie in der Liste erscheinen und der "fliegende Notizzettel"-Effekt ausgelöst wird.
    *   **Read:** Verifiziere, dass alle hinzugefügten Notizen korrekt angezeigt werden. Lade die Seite neu, um sicherzustellen, dass die Daten vom Backend geladen werden. Teste die Such-, Filter- und Sortierfunktionen.
    *   **Update:** Bearbeite den Text einer bestehenden Notiz und speichere die Änderung. Markiere eine Notiz als "erledigt" über die Checkbox. Überprüfe, ob die Änderungen korrekt dargestellt werden und ggf. der "fliegende Notizzettel"-Effekt beim Speichern ausgelöst wird.
    *   **Delete:** Lösche eine Notiz. Sie sollte aus der Liste verschwinden.
    *   **Persistenz-Test:**
        1.  Füge einige Notizen hinzu oder ändere bestehende.
        2.  Stoppe und starte die Datenbank und das Backend neu:
            ```bash
            docker compose restart database backend
            ```
        3.  Lade die Anwendung im Browser (`http://localhost:8080`) neu. Die zuvor erstellten/geänderten Notizen müssen weiterhin vorhanden und korrekt sein.
    *   **Theme-Switcher:** Teste den Light/Dark-Mode Umschalter. Die Einstellung sollte auch nach einem Neuladen der Seite erhalten bleiben.

4.  **(Optional) Direkter Datenbankzugriff:**
    Verbinde dich mit einem Datenbank-Tool (z.B. DBeaver, pgAdmin) mit der PostgreSQL-Datenbank über den gemappten Port (standardmäßig `localhost:5433`, Benutzer `myuser`, Passwort `supersecretpassword`, Datenbank `notizblockdb`) und inspiziere den Inhalt der `notes`-Tabelle, um die Daten direkt zu verifizieren.

## Wichtige Services und Ports

*   **Frontend (Nginx):** Erreichbar unter `http://localhost:8080`. Leitet API-Anfragen (`/api/*`) an das Backend weiter.
*   **Backend (Node.js API):** Lauscht intern im Docker-Netzwerk auf Port 3000 (oder dem Wert von `BACKEND_PORT`). Verbindet sich mit dem `database`-Service für Datenoperationen.
*   **Datenbank (PostgreSQL):** Lauscht intern auf Port 5432. Ist optional auf Host-Port `5433` gemappt für direkten Zugriff mit DB-Tools. Speichert Daten im benannten Volume `postgres_data`.

## Logs anzeigen

*   Logs aller Services: `docker compose logs`
*   Logs des Backends: `docker compose logs backend` (zeigt DB-Verbindungsversuche, API-Anfragen, Healthcheck-Aufrufe etc.)
*   Logs des Frontends (Nginx): `docker compose logs frontend`
*   Logs der Datenbank: `docker compose logs database`
*   Live-Verfolgung (z.B. Backend): `docker compose logs -f backend`

## Anwendung stoppen

*   Container stoppen: `docker compose stop`
*   Container stoppen & entfernen (Daten im DB-Volume bleiben erhalten): `docker compose down`
*   Container stoppen, entfernen & **DB-Volume löschen** (ACHTUNG: Alle Notizdaten gehen verloren!): `docker compose down -v`

## SQL Recap & Datenmodell

Eine theoretische Ausarbeitung eines relationalen Datenbankmodells befindet sich in der Datei `sql_schema_and_queries.md`. Die **tatsächlichen Schemata**, die für diese Aufgabe manuell angewendet werden, befinden sich in `backend/sql/initial_schema.sql` und `backend/sql/update_schema_add_completed.sql`.

## Code-Qualität und Konventionen

*   **Sicherheit:** Es werden parametrisierte Abfragen im Backend verwendet, um SQL Injection zu verhindern.
*   **Module:** Das Backend verwendet ES-Module (`import`/`export`). Das Frontend ist komponentenbasiert aufgebaut.
*   **.gitignore / .dockerignore:** Diese Dateien sind konfiguriert, um unnötige Dateien und sensible Informationen (wie `.env`) von der Versionskontrolle bzw. dem Docker-Build-Kontext auszuschließen.
```