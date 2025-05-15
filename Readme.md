```markdown
# React Docker Notizblock App (Full-Stack mit Docker Compose & PostgreSQL)

Dies ist eine Full-Stack Notizblock-Anwendung, die mit React (Frontend) und Node.js/Express (Backend) erstellt wurde. Die gesamte Anwendung wird mit Docker Compose orchestriert und beinhaltet:
*   Ein Frontend, das mit Vite gebaut und von Nginx als Webserver und Reverse Proxy ausgeliefert wird.
*   Ein Backend, das eine REST-API für Notizen bereitstellt und Daten persistent in einer **PostgreSQL-Datenbank** speichert.
*   Eine PostgreSQL-Datenbank als dedizierter Service.
*   Integrierte Healthchecks für Datenbank und Backend zur Sicherstellung der Diensteverfügbarkeit und Robustheit der Anwendung.

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

**Aktuelle Screenshots (healthy, unhealthy):**

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
*   **Sichere API** durch parametrisierte SQL-Abfragen (Schutz vor SQL Injection) und grundlegende Eingabevalidierung im Backend.
*   Vollständig containerisiert mit Docker: Frontend, Backend, Datenbank.
*   Orchestrierung mit Docker Compose.
*   Frontend mit Nginx Reverse Proxy für API-Aufrufe an das Backend.
*   **Robuste Fehlerbehandlung**: Das Backend stürzt bei DB-Verbindungsproblemen nicht ab und gibt sinnvolle Fehlercodes zurück. Das Frontend zeigt bei Backend-Fehlern nutzerfreundliche Meldungen an.
*   Umfassendes Logging wichtiger Ereignisse, DB-Verbindungsstatus und Fehler.
*   **Aussagekräftige Healthchecks** für Datenbank- und Backend-Dienst, die die tatsächliche Funktionsfähigkeit (inkl. DB-Verbindung für das Backend) prüfen.
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
    cd Docker-Container # Oder der Name deines Projektordners
    ```
2.  **(Empfohlen) Umgebungsvariablen konfigurieren:**
    Erstelle eine Datei namens `.env` im Wurzelverzeichnis des Projekts (auf derselben Ebene wie `docker-compose.yml`).
    ```env
    # .env (Beispielinhalt - passe dies an deine Bedürfnisse an)
    DB_USER=jo
    DB_PASSWORD=jo
    DB_NAME=jo
    BACKEND_PORT=3000
    LOG_LEVEL=debug
    ```
    **Wichtig:** Die `.env`-Datei ist in `.gitignore` aufgeführt, um sensible Daten zu schützen. Ohne gesetztes `DB_PASSWORD` in der `.env` Datei wird die Datenbankverbindung fehlschlagen.

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

## Finaler, robuster Zustand des Stacks und umgesetzte Stabilitätsmaßnahmen

Der aktuelle Stack stellt eine robuste Full-Stack-Anwendung dar, die für einen stabileren Betrieb, auch unter widrigen Umständen, ausgelegt ist. Die wichtigsten Stabilitätsmaßnahmen umfassen:

*   **Persistente Datenspeicherung:** Alle Notizdaten werden zuverlässig in der PostgreSQL-Datenbank gespeichert und bleiben über Neustarts der Anwendung hinweg erhalten (solange das Docker Volume `postgres_data` nicht gelöscht wird).
*   **Vollständige CRUD-Funktionalität:** Alle Kernoperationen zum Erstellen, Lesen, Aktualisieren und Löschen von Notizen sind implementiert und funktionieren Ende-zu-Ende.
*   **Robuste Fehlerbehandlung im Backend:**
    *   Das Backend fängt Fehler bei Datenbankoperationen ab und stürzt nicht ab. Stattdessen werden über einen zentralen Fehlerhandler HTTP-Statuscodes (z.B. 500) an den Client gesendet.
    *   Grundlegende Eingabevalidierung (z.B. für leere Notiztexte) ist implementiert und führt zu HTTP 400-Fehlern mit entsprechenden Meldungen.
*   **Fehlertolerantes Frontend:**
    *   Das React-Frontend fängt Fehler, die vom Backend kommen (z.B. 500, 503, 400), in seinen API-Aufrufen ab.
    *   Anstatt abzustürzen oder eine leere Seite anzuzeigen, werden dem Benutzer über `react-toastify` verständliche Fehlermeldungen angezeigt (z.B. "Notizen konnten nicht geladen werden. Bitte versuchen Sie es später erneut.").
*   **Aussagekräftige Healthchecks:**
    *   Der **PostgreSQL-Dienst** nutzt `pg_isready`, um seine Bereitschaft zur Annahme von Verbindungen zu signalisieren.
    *   Der **Backend-Dienst** hat einen `/health`-Endpunkt, der nicht nur die Lauffähigkeit des Node.js-Prozesses prüft, sondern auch aktiv eine Testverbindung/-abfrage zur Datenbank herstellt. Nur wenn beides erfolgreich ist, meldet der Dienst `healthy`. Dies stellt sicher, dass das Backend wirklich funktionsfähig ist.
    *   Die `docker-compose.yml` nutzt `depends_on` mit der `service_healthy`-Bedingung, um eine korrekte Startreihenfolge der voneinander abhängigen Dienste zu gewährleisten.
*   **Umfassendes Logging:** Wichtige Ereignisse, Fehler (mit Stacktraces), Datenbankinteraktionen und Healthcheck-Aufrufe werden im Backend geloggt, was die Diagnose von Problemen erheblich erleichtert.

## Verifizierung des robusten Stacks

Um die Stabilität und korrekte Fehlerbehandlung des Stacks zu verifizieren, führe folgende Schritte aus:

1.  **Stack starten:**
    Stelle sicher, dass das Projekt geklont, die `.env` Datei (insbesondere `DB_PASSWORD`) konfiguriert und das Datenbankschema (wie oben beschrieben) manuell erstellt wurde. Starte dann den Stack:
    ```bash
    docker compose up --build -d
    ```
    Warte etwa 45-60 Sekunden, damit alle Dienste vollständig initialisieren und die Healthchecks ihre ersten Prüfungen durchführen können.

2.  **Healthcheck-Status überprüfen:**
    Führe in einem Terminal im Projektverzeichnis aus:
    ```bash
    docker compose ps
    ```
    **Erwartetes Ergebnis:** In der `STATUS`-Spalte sollten sowohl `postgres_db_service` als auch `backend_api_service` (der Containername für den `backend`-Service) den Zusatz `(healthy)` anzeigen. Die `frontend_web_app` sollte `running` oder `Up` anzeigen.
    *   **Interpretation:** Ein `(healthy)`-Status für das Backend bedeutet, dass der Node.js-Server läuft UND die Verbindung zur PostgreSQL-Datenbank erfolgreich über den `/health`-Endpunkt getestet wurde.

3.  **Ende-zu-Ende Funktionalität (CRUD) im Normalbetrieb testen:**
    *   Öffne `http://localhost:8080` im Browser.
    *   Führe alle CRUD-Operationen durch: Erstelle Notizen, bearbeite sie, markiere sie als erledigt/offen, lösche sie. Teste auch die Such-, Filter- und Sortierfunktionen sowie den Theme-Switcher.
    *   **Erwartetes Ergebnis:** Alle Operationen funktionieren wie erwartet. Die Änderungen sind persistent.

4.  **Robustheit gegen Datenbankausfall testen:**
    *   **a) Datenbank stoppen:**
        ```bash
        docker compose stop database
        ```
    *   **b) Backend-Healthcheck beobachten:**
        Führe nach ca. 20-30 Sekunden erneut `docker compose ps` aus.
        **Erwartetes Ergebnis:** Der `backend_api_service` sollte jetzt den Status `(unhealthy)` haben.
        Die Backend-Logs (`docker compose logs backend`) sollten Fehler wie `Healthcheck: Datenbankverbindung fehlgeschlagen im /health Endpoint {"error":"getaddrinfo ENOTFOUND database", ...}` zeigen.
    *   **c) Frontend-Verhalten prüfen:**
        Versuche im Browser, die Notizen neu zu laden oder eine neue Notiz zu erstellen.
        **Erwartetes Ergebnis:** Das Frontend sollte nicht abstürzen. Stattdessen sollte eine Fehlermeldung (z.B. via Toastify) erscheinen, die sinngemäß lautet "Fehler beim Laden/Speichern der Notizen. Bitte versuchen Sie es später erneut." Die Nginx-Logs (`docker compose logs frontend`) zeigen möglicherweise einen 50x-Fehler für die `/api/notes`-Anfragen.
    *   **d) Datenbank wieder starten:**
        ```bash
        docker compose start database
        ```
    *   **e) Wiederherstellung beobachten:**
        Führe nach einiger Zeit (ca. 30-60 Sekunden) erneut `docker compose ps` aus.
        **Erwartetes Ergebnis:** Sowohl `database` als auch `backend_api_service` sollten wieder `(healthy)` sein.
        Die Backend-Logs sollten wieder erfolgreiche Healthcheck-Aufrufe zeigen.
        Das Frontend sollte nach einem Neuladen der Seite oder beim nächsten API-Aufruf wieder normal funktionieren und die Daten korrekt anzeigen/verarbeiten.

5.  **Robustheit gegen ungültige Anfragen testen:**
    *   Versuche im Frontend, eine Notiz ohne Text zu erstellen (falls die UI dies zulässt, ansonsten ist dies ein guter Test für direkte API-Aufrufe).
    *   Oder sende eine ungültige Anfrage mit `curl` (aus einem Host-Terminal):
        ```bash
        curl -X POST -H "Content-Type: application/json" -d '{}' http://localhost:8080/api/notes
        ```
    *   **Erwartetes Ergebnis:** Das Backend sollte mit einem HTTP `400 Bad Request` antworten. Die Frontend-Logs (Nginx) zeigen den `400`-Status. Die Backend-Logs (`docker compose logs backend`) sollten eine Warnung wie `Controller: Ungültiger Text in createNote - Text fehlt oder ist leer ...` anzeigen. Das Frontend (falls der Fehler dort ausgelöst wurde) sollte eine entsprechende Fehlermeldung anzeigen. Die Anwendung darf nicht abstürzen.

6.  **Logs einsehen und interpretieren:**
    *   **Backend-Logs:** `docker compose logs backend` oder `docker compose logs -f backend` (für Live-Verfolgung). Achte auf Startmeldungen, Datenbankverbindungsstatus, Aufrufe der API-Routen, Healthcheck-Meldungen und insbesondere auf Fehlermeldungen (mit Stacktraces), die während der Fehler-Simulationen auftreten.
    *   **Frontend-Logs (Nginx):** `docker compose logs frontend`. Zeigt eingehende HTTP-Anfragen an den Nginx-Server und die von Nginx an den Client gesendeten Statuscodes (z.B. 200, 400, 500, 503).
    *   **Datenbank-Logs:** `docker compose logs database`. Nützlich, um zu sehen, ob die Datenbank korrekt startet oder Verbindungsversuche erhält.

Durch diese Verifizierungsschritte kann die implementierte Robustheit und Fehlerbehandlung des Stacks nachgewiesen werden.

## Wichtige Services und Ports

*   **Frontend (Nginx):** Erreichbar unter `http://localhost:8080`. Leitet API-Anfragen (`/api/*`) an das Backend weiter.
*   **Backend (Node.js API):** Lauscht intern im Docker-Netzwerk auf Port 3000 (oder dem Wert von `BACKEND_PORT`). Verbindet sich mit dem `database`-Service für Datenoperationen.
*   **Datenbank (PostgreSQL):** Lauscht intern auf Port 5432. Ist optional auf Host-Port `5433` gemappt für direkten Zugriff mit DB-Tools. Speichert Daten im benannten Volume `postgres_data`.

## Logs anzeigen

*   Logs aller Services: `docker compose logs`
*   Logs des Backends: `docker compose logs backend`
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

*   **Sicherheit:** Es werden parametrisierte Abfragen im Backend verwendet, um SQL Injection zu verhindern. Es erfolgt eine grundlegende Validierung von Eingabedaten.
*   **Module:** Das Backend verwendet ES-Module (`import`/`export`). Das Frontend ist komponentenbasiert aufgebaut.
*   **.gitignore / .dockerignore:** Diese Dateien sind konfiguriert, um unnötige Dateien und sensible Informationen (wie `.env`) von der Versionskontrolle bzw. dem Docker-Build-Kontext auszuschließen.
```