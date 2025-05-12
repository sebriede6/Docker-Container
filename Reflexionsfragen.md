
---

## Reflexionsfragen (Docker Compose)

### Was sind die Hauptvorteile der Nutzung von Docker Compose, um alle Services (Frontend, Backend, Datenbank) gemeinsam zu definieren und zu starten, verglichen mit dem manuellen Starten jedes Containers mit `docker run`?

Die Nutzung von Docker Compose bietet mehrere entscheidende Vorteile gegenüber dem manuellen Starten einzelner Container mit `docker run`:

1.  **Deklarative Konfiguration:** Alle Services, Netzwerke, Volumes und deren Konfigurationen (Ports, Umgebungsvariablen, Abhängigkeiten etc.) werden in einer einzigen `docker-compose.yml`-Datei definiert. Dies macht das Setup reproduzierbar, versionierbar (mit Git) und leicht verständlich.
2.  **Vereinfachtes Management:** Mit einem einzigen Befehl (`docker compose up`) kann der gesamte Anwendungs-Stack gestartet werden. Ebenso können alle Services mit `docker compose down` gestoppt und entfernt werden. Das manuelle Starten jedes Containers mit langen `docker run`-Befehlen ist fehleranfällig und mühsam.
3.  **Netzwerk-Orchestrierung:** Docker Compose erstellt automatisch ein dediziertes Netzwerk für die definierten Services, wodurch diese sich über ihre Service-Namen einfach erreichen können (Service Discovery). Dies manuell mit `docker network create` und `--network` in jedem `docker run`-Befehl zu konfigurieren, ist komplexer.
4.  **Abhängigkeitsmanagement (`depends_on`):** Man kann Startreihenfolgen und Abhängigkeiten zwischen Services definieren (z.B. dass das Backend erst startet, wenn die Datenbank "healthy" ist). Dies ist mit einzelnen `docker run`-Befehlen nicht direkt möglich.
5.  **Einfache Skalierung (für zustandslose Dienste):** Mit `docker compose up --scale <service_name>=<anzahl>` können Instanzen eines Services einfach skaliert werden (obwohl dies für komplexere Szenarien oft durch Orchestrierungswerkzeuge wie Kubernetes ergänzt wird).
6.  **Lesbarkeit und Wartbarkeit:** Die `docker-compose.yml` dient als zentrale Dokumentation der Infrastruktur der Anwendung.

### Beschreibe, wie die Zugangsdaten zur PostgreSQL-Datenbank in dieser Aufgabe an den Backend-Container übergeben werden. Welchen Mechanismus nutzt Docker Compose dafür und in welchem Abschnitt der `docker-compose.yml` wird dies konfiguriert?

Die Zugangsdaten zur PostgreSQL-Datenbank werden in dieser Aufgabe über **Umgebungsvariablen** an den Backend-Container übergeben.

Docker Compose nutzt dafür den `environment`-Schlüssel innerhalb der Service-Definition in der `docker-compose.yml`.

**Abschnitt in `docker-compose.yml` für den `backend`-Service:**

```yaml
services:
  # ...
  backend:
    # ...
    environment:
      DB_HOST: database       # Hostname des Datenbank-Services
      DB_PORT: 5432           # Interner Port der Datenbank
      DB_USER: ${DB_USER:-myuser} # Wert aus .env-Datei oder Default 'myuser'
      DB_PASSWORD: ${DB_PASSWORD:-mypassword} # Wert aus .env-Datei oder Default 'mypassword'
      DB_NAME: ${DB_NAME:-mydatabase}   # Wert aus .env-Datei oder Default 'mydatabase'
      # ... andere Umgebungsvariablen
    # ...
```

Docker Compose liest die Werte für `DB_USER`, `DB_PASSWORD` und `DB_NAME` (und andere mit `${VARIABLE:-default}` Syntax) vorzugsweise aus einer `.env`-Datei im selben Verzeichnis wie die `docker-compose.yml` oder verwendet die angegebenen Default-Werte, falls die Variablen in der `.env`-Datei nicht definiert sind. Diese werden dann als Umgebungsvariablen innerhalb des Backend-Containers gesetzt, wo die Node.js-Anwendung sie mit `process.env.DB_USER` etc. auslesen kann.

### Warum ist es eine Best Practice, sensible Daten wie Datenbank-Passwörter als Umgebungsvariablen an Container zu übergeben, anstatt sie direkt in den Code oder das Dockerfile zu schreiben?

1.  **Sicherheit:** Das Hardcodieren von Passwörtern oder API-Schlüsseln im Quellcode oder Dockerfile macht diese für jeden sichtbar, der Zugriff auf das Repository oder das Docker-Image hat. Dies ist ein erhebliches Sicherheitsrisiko. Umgebungsvariablen erlauben es, diese sensiblen Daten außerhalb des Codes und des Images zu verwalten.
2.  **Konfigurierbarkeit:** Die gleichen Docker-Images können in verschiedenen Umgebungen (Entwicklung, Test, Produktion) mit unterschiedlichen Zugangsdaten verwendet werden, ohne den Code oder das Image neu bauen zu müssen. Die Konfiguration erfolgt zur Laufzeit durch Setzen der entsprechenden Umgebungsvariablen.
3.  **Trennung von Code und Konfiguration (12-Factor App Prinzip III):** Code sollte von der Konfiguration getrennt sein. Umgebungsvariablen sind der empfohlene Weg, um Konfigurationen zu injizieren, die sich zwischen Deployments ändern.
4.  **Vermeidung von versehentlichem Commit:** Wenn Passwörter im Code stehen, können sie leicht versehentlich in ein öffentliches Git-Repository committet werden. Umgebungsvariablen (oft aus `.env`-Dateien geladen, die in `.gitignore` stehen) verhindern dies.

### Warum ist es wichtig, das Datenbank-Passwort, selbst wenn es als Umgebungsvariable im Container verfügbar ist, nicht auf die Konsole zu loggen?

1.  **Sicherheitsrisiko durch Log-Aggregation:** In Produktionsumgebungen werden Logs oft zentral gesammelt, gespeichert und analysiert (z.B. in Systemen wie ELK Stack, Splunk, CloudWatch Logs). Wenn Passwörter im Klartext in den Logs stehen, sind sie für jeden einsehbar, der Zugriff auf diese Log-Systeme hat. Dies erweitert den Kreis potenzieller Angreifer oder unbeabsichtigter Enthüllungen erheblich.
2.  **Debugging und Support:** Wenn Logs geteilt werden (z.B. für Support-Zwecke oder beim Debugging mit Kollegen), würden sensible Passwörter unnötigerweise offengelegt.
3.  **Compliance und Datenschutz:** Viele Datenschutzrichtlinien und Sicherheitsstandards (z.B. DSGVO, PCI DSS) verbieten die Speicherung oder Anzeige von sensiblen Zugangsdaten im Klartext in Logs.
4.  **Unbeabsichtigte Persistenz:** Logs werden oft über längere Zeiträume gespeichert. Ein einmal geloggtes Passwort bleibt dort potenziell lange sichtbar, selbst wenn das Passwort im System bereits geändert wurde.

Stattdessen sollte man Platzhalter wie `[REDACTED]` oder `*****` loggen, um zu bestätigen, dass die Variable gesetzt wurde, ohne den eigentlichen Wert preiszugeben.

### Wie kommuniziert der Backend-Container theoretisch mit dem Datenbank-Container in diesem Compose-Setup (wenn die Verbindung später aufgebaut wird)? Nenne den Hostnamen und Port, den das Backend verwenden würde.

In dem gegebenen Docker Compose Setup würde der Backend-Container mit dem Datenbank-Container wie folgt kommunizieren:

*   **Hostname:** `database`
*   **Port:** `5432`

**Erklärung:**
Docker Compose erstellt ein Standard-Netzwerk für alle in der `docker-compose.yml`-Datei definierten Services. Innerhalb dieses Netzwerks können sich die Services über ihre **Service-Namen** als Hostnamen erreichen.

In der `docker-compose.yml` ist der Datenbank-Service wie folgt benannt:
```yaml
services:
  database: # <-- Dies ist der Service-Name
    # ...
```
Und im Backend-Service wird die Umgebungsvariable `DB_HOST` auf diesen Service-Namen gesetzt:
```yaml
services:
  # ...
  backend:
    # ...
    environment:
      DB_HOST: database
      DB_PORT: 5432
    # ...
```
Der Port `5432` ist der Standardport, auf dem PostgreSQL innerhalb seines Containers lauscht (definiert durch `expose: - "5432"` im `database`-Service und als Standard im Postgres-Image). Die Node.js-Anwendung im Backend würde also versuchen, eine Verbindung zu `database:5432` aufzubauen.

### Warum wird in diesem Setup das `ports` Mapping für den Backend-Service in der `docker-compose.yml` optional (oder weggelassen), während das `expose` Feld wichtig ist?

*   **`expose: - "3000"` (oder der Wert von `BACKEND_PORT`):**
    *   **Zweck:** `expose` deklariert, dass der Container auf dem angegebenen Port *innerhalb des Docker-Netzwerks* lauscht. Es macht den Port für andere Container im selben Netzwerk zugänglich (z.B. damit der Nginx-Proxy im Frontend-Container den Backend-Service auf Port 3000 erreichen kann).
    *   **Wichtigkeit:** Es ist wichtig für die Kommunikation *zwischen Containern*. Es ist auch eine Form der Dokumentation, welche Ports der Service intern verwendet.

*   **`ports: - "8081:3000"` (für das Backend):**
    *   **Zweck:** `ports` erstellt ein Port-Mapping vom **Host-Rechner** zum Container. In diesem Beispiel würde Port `8081` des Hosts auf Port `3000` des Backend-Containers weitergeleitet werden.
    *   **Optionalität in diesem Setup:** Da das Frontend (der primäre Nutzer der Backend-API) über den Nginx-Reverse-Proxy im selben Docker-Netzwerk auf das Backend zugreift (Nginx kontaktiert `backend:3000` oder `backend_api_service:3000` intern), ist ein direktes Mapping des Backend-Ports zum Host für die normale Funktion der Anwendung **nicht notwendig**. Der Browser des Benutzers kommuniziert nur mit dem Frontend-Container auf Port 8080.
    *   Es wird optional, weil es hauptsächlich für **direktes Debugging oder Testen** des Backend-API vom Host-Rechner aus (z.B. mit Postman oder `curl` direkt an `http://localhost:8081/api/...`) nützlich sein kann. Für den produktiven Fluss der Anwendung über das Frontend ist es nicht erforderlich.

Im Gegensatz dazu ist das `ports: - "8080:80"` für den `frontend`-Service **essenziell**, da der Benutzer über seinen Browser auf dem Host-Rechner auf Port 8080 zugreifen muss, um die Anwendung überhaupt zu erreichen.

---

### Reflexionsfragen

1.  **Welche Anpassungen waren im Backend-Code (spezifisch im Service Layer) notwendig, um von der File-basierten Persistenz auf die Datenbank-Persistenz umzusteigen?**

    Der Service Layer musste grundlegend überarbeitet werden. Der vorherige Service (`fileService.js`), der das `node:fs`-Modul zum Lesen und Schreiben einer JSON-Datei verwendete, wurde durch einen neuen Service (`noteDbService.js`) ersetzt. Dieser neue Service importiert stattdessen einen Datenbank-Connection-Pool (`pg.Pool`). Jede Funktion (z.B. `getAllNotes`, `getNoteById`, `createNote`, `updateNoteById`, `deleteNoteById`) wurde umgeschrieben, um SQL-Abfragen mittels `pool.query()` auszuführen. Dabei wurden die Logik zur Dateimanipulation durch entsprechende SQL-Befehle (`SELECT`, `INSERT`, `UPDATE`, `DELETE`) ersetzt. Die Fehlerbehandlung wurde angepasst, um Datenbankfehler abzufangen, und die Rückgabewerte wurden modifiziert, um die Ergebnisse der Datenbankabfragen (`result.rows`) zu liefern. Es wurde auch darauf geachtet, die Spaltennamen aus der Datenbank (`text_content`) über SQL-Aliase (`AS text`) an die vom Frontend erwarteten Feldnamen anzupassen.

2.  **Warum ist die Nutzung eines Connection Pools (`pg.Pool`) eine Best Practice, wenn deine API viele Datenbankabfragen verarbeiten muss, verglichen mit einer einzelnen `pg.Client`-Instanz?**

    Die Nutzung eines Connection Pools (`pg.Pool`) ist eine Best Practice aus mehreren Gründen:
    *   **Performance:** Das Herstellen einer Datenbankverbindung ist ein zeit- und ressourcenintensiver Vorgang. Ein Pool hält eine konfigurierbare Anzahl von Verbindungen offen und bereit. Wenn eine Anfrage eine DB-Operation benötigt, leiht sie sich eine bestehende Verbindung aus dem Pool, anstatt eine neue aufzubauen. Nach Abschluss der Operation wird die Verbindung an den Pool zurückgegeben und kann von der nächsten Anfrage wiederverwendet werden. Dies reduziert die Latenz erheblich.
    *   **Ressourcenmanagement:** Datenbankserver können nur eine begrenzte Anzahl gleichzeitiger Verbindungen verwalten. Ein Pool begrenzt die maximale Anzahl der Verbindungen, die die Anwendung zur Datenbank öffnet, und verhindert so eine Überlastung des Datenbankservers.
    *   **Effizienz:** Das ständige Öffnen und Schließen von Verbindungen (wie es bei der Verwendung einer neuen `pg.Client`-Instanz pro Anfrage passieren könnte) verbraucht unnötig CPU-Zeit und Speicher auf beiden Seiten (Anwendung und Datenbank). Ein Pool minimiert diesen Overhead.
    *   **Robustheit:** Der Pool kann Verbindungen verwalten, fehlerhafte Verbindungen erkennen und entfernen und sicherstellen, dass Verbindungen korrekt wieder freigegeben werden.

3.  **Erkläre anhand eines Beispiels aus deinem Code, wie du SQL Injection bei einer Abfrage, die Benutzereingaben verwendet (z.B. beim Abrufen eines Items nach ID oder beim Erstellen eines Items), vermieden hast. Warum ist dies wichtig?**

    SQL Injection wurde durch die Verwendung von **parametrisierten Abfragen** (Prepared Statements) vermieden. Ein Beispiel ist die Funktion `createNote` im `noteDbService.js`:

    ```javascript
    const createNote = async (text) => {
      const sql = 'INSERT INTO notes (text_content) VALUES ($1) RETURNING id, text_content AS text, created_at, updated_at';
      const values = [text]; // Benutzereingabe im Array
      try {
        const result = await pool.query(sql, values); // Werte werden getrennt übergeben
        // ...
        return result.rows[0];
      } catch (err) {
        // ...
      }
    };
    ```

    Hier wird der vom Benutzer bereitgestellte `text` nicht direkt in den SQL-String eingefügt. Stattdessen wird im SQL-String ein Platzhalter (`$1`) verwendet. Der eigentliche Wert (`text`) wird separat in einem Array (`values`) an die `pool.query()`-Methode übergeben. Der `pg`-Datenbanktreiber sorgt dafür, dass dieser Wert sicher als Datenparameter an die Datenbank gesendet wird und *nicht* als Teil des SQL-Befehls interpretiert wird.

    **Wichtigkeit:** Dies ist entscheidend, um SQL Injection zu verhindern. Wenn Benutzereingaben direkt in SQL-Strings konkateniert würden (z.B. `VALUES ('${text}')`), könnte ein Angreifer schadhaften SQL-Code einschleusen (z.B. `'); DROP TABLE notes; --`). Parametrisierte Abfragen stellen sicher, dass die Eingabe immer als Datenwert behandelt wird, wodurch solche Angriffe unmöglich werden und die Datenintegrität und Sicherheit der Anwendung gewährleistet ist.

4.  **Beschreibe den manuellen Prozess, den du in dieser Aufgabe durchgeführt hast, um das initiale Datenbank-Schema zu erstellen. Welche Nachteile siehst du bei diesem manuellen Prozess, wenn sich das Schema in Zukunft ändern würde oder wenn du in einem Team arbeitest?**

    Der manuelle Prozess zur Erstellung des Schemas umfasste folgende Schritte:
    1.  Erstellen einer SQL-Datei (`backend/sql/initial_schema.sql`) mit den `CREATE TABLE`- und `CREATE TRIGGER/FUNCTION`-Befehlen.
    2.  Starten des PostgreSQL-Datenbankcontainers über Docker Compose (`docker compose up -d database`).
    3.  Warten, bis der Container läuft und als "healthy" gemeldet wird (`docker compose ps`).
    4.  Ausführen des SQL-Skripts innerhalb des laufenden Containers mithilfe des `docker exec`-Befehls und des `psql`-Kommandozeilen-Clients: `docker exec -i postgres_db_service psql -U <db_user> -d <db_name> < backend/sql/initial_schema.sql`.

    **Nachteile dieses manuellen Prozesses:**
    *   **Fehleranfälligkeit:** Manuelle Schritte können leicht vergessen, in der falschen Reihenfolge oder mit Tippfehlern ausgeführt werden.
    *   **Mangelnde Wiederholbarkeit und Konsistenz:** Es ist schwierig sicherzustellen, dass jeder Entwickler oder jede Umgebung exakt denselben Schema-Stand hat.
    *   **Schlechte Skalierbarkeit:** Bei häufigen Schemaänderungen oder komplexeren Schemata wird der manuelle Prozess unübersichtlich und zeitaufwendig.
    *   **Keine Versionierung des Schema-Zustands:** Obwohl die `.sql`-Datei versioniert werden kann, gibt es keine automatische Nachverfolgung, welcher Stand des Schemas aktuell in der Datenbank angewendet ist.
    *   **Schwierige Zusammenarbeit im Team:** Jedes Teammitglied muss die Schema-Updates manuell durchführen und koordinieren, was zu Inkonsistenzen führen kann.
    *   **Nicht für CI/CD geeignet:** Manuelle Schritte sind ein Hindernis für automatisierte Deployment-Pipelines.
    *   **Kein einfacher Rollback-Mechanismus:** Wenn ein Schema-Update fehlschlägt oder fehlerhaft ist, gibt es keinen einfachen, standardisierten Weg, zur vorherigen Version zurückzukehren.

5.  **Wie hast du in diesem Setup sichergestellt, dass die Datenbank läuft und (wahrscheinlich) bereit ist, bevor dein Backend-Service startet?**

    Die Sicherstellung erfolgte auf zwei Ebenen:
    1.  **Docker Compose `depends_on`:** In der `docker-compose.yml` wurde für den `backend`-Service eine Abhängigkeit zum `database`-Service mit der Bedingung `condition: service_healthy` definiert. Dies weist Docker Compose an, den Start des `backend`-Containers zu verzögern, bis der `database`-Container nicht nur läuft, sondern auch sein Healthcheck (definiert als `pg_isready`) erfolgreich ist. Dies gibt eine hohe Wahrscheinlichkeit, dass die Datenbank bereit ist, Verbindungen anzunehmen.
    2.  **Aktive Verbindungskontrolle beim Serverstart:** Im `backend/server.js` wird beim Start die Funktion `testConnection` (aus `backend/src/db/index.js`) aufgerufen. Diese Funktion versucht explizit, eine Verbindung aus dem Pool zu erhalten und eine einfache Testabfrage (`SELECT NOW()`) an die Datenbank zu senden. Schlägt dieser Verbindungsversuch oder die Testabfrage fehl, wird ein Fehler geworfen, der den Start des Backend-Servers verhindert (`process.exit(1)`). Dies stellt sicher, dass das Backend nicht startet, wenn es keine funktionierende Verbindung zur Datenbank herstellen kann.