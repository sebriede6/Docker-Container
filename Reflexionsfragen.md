
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