
---

```markdown
# Full-Stack Notizblock Anwendung mit Docker, Netzwerk & Reverse Proxy

Dies ist eine Full-Stack-Webanwendung, bestehend aus einem React-Frontend und einer Node.js/Express-API als Backend. Beide Komponenten sind separat containerisiert. Die Kommunikation zwischen Frontend und Backend erfolgt über ein dediziertes Docker-Netzwerk, wobei Nginx im Frontend-Container als Reverse Proxy für API-Aufrufe dient.

Das Backend speichert die Notizdaten persistent in einer Datei (`notes.json`) innerhalb eines Docker Volumes (`my-backend-data`), um sicherzustellen, dass die Daten auch nach Neustarts oder Neuerstellungen des Backend-Containers erhalten bleiben.

## Projektstruktur

```
react-docker-notizblock/
├── README.md                 # Diese Datei
├── assets/                   # Enthält Screenshots für die Dokumentation
│   ├── Screenshot_App_API_Call.png  # (Beispielname, bitte anpassen)
│   ├── Screenshot_Docker_Netzwerk.png # (Beispielname, bitte anpassen)
│   ├── Screenshot_Persistenz_Vorher.png # (Beispielname, bitte anpassen)
│   └── Screenshot_Persistenz_Nachher.png# (Beispielname, bitte anpassen)
├── backend/
│   ├── .dockerignore
│   ├── Dockerfile
│   ├── package.json
│   ├── package-lock.json
│   ├── server.js             # Startpunkt des Backends
│   ├── data/                 # (Dieses Verzeichnis ist für das Volume-Mapping gedacht,
│   │                         #  wird aber durch das benannte Volume ersetzt/gemanagt)
│   └── src/
│       ├── app.js
│       ├── config/
│       │   └── index.js      # (Annahme: config.js heißt jetzt index.js im config-Ordner)
│       ├── controllers/
│       │   └── noteController.js
│       ├── routes/
│       │   └── noteRoutes.js
│       └── services/
│           └── fileService.js
├── frontend/
│   ├── .dockerignore
│   ├── .env                  # (Sollte in .gitignore sein, falls es Geheimnisse enthält)
│   ├── .env.local            # (Sollte in .gitignore sein)
│   ├── .gitignore            # Frontend-spezifisches .gitignore
│   ├── Dockerfile
│   ├── eslint.config.js
│   ├── index.html
│   ├── nginx.conf            # Benutzerdefinierte Nginx-Konfiguration für den Reverse Proxy
│   ├── package.json
│   ├── package-lock.json
│   ├── README.md             # (Optional: Frontend-spezifische Readme)
│   ├── vite.config.js
│   └── src/
│       ├── apiClient.js
│       ├── App.css
│       ├── App.jsx
│       ├── index.css
│       ├── main.jsx
│       └── components/
│           ├── NoteForm.jsx
│           └── NoteList.jsx
└── .gitignore                # Globales .gitignore im Wurzelverzeichnis
```


## Persistenz im Backend

Das Backend speichert Notizdaten in der Datei `/app/data/notes.json` innerhalb seines Containers. Um diese Daten persistent zu machen, wird ein **benanntes Docker Volume** (`my-backend-data`) verwendet. Dieses Volume wird von Docker verwaltet und stellt sicher, dass die Daten erhalten bleiben, auch wenn der Backend-Container gestoppt, entfernt oder neu erstellt wird. Beim Starten des Backend-Containers wird dieses Volume in den Pfad `/app/data` im Container gemountet.

## Nginx Reverse Proxy im Frontend

Das Frontend (eine React Single Page Application) wird von einem Nginx-Webserver ausgeliefert, der im Frontend-Docker-Container läuft. Nginx dient hier zusätzlich als **Reverse Proxy** für API-Anfragen:

*   **Zweck:**
    *   Das Frontend, das im Browser des Benutzers unter `http://localhost:8080` läuft, sendet API-Anfragen an relative Pfade (z.B. `/api/notes`).
    *   Nginx fängt diese Anfragen ab und leitet sie an den Backend-Service (`http://backend-service:3000/api/notes`) im internen Docker-Netzwerk weiter.
    *   Dies vermeidet CORS-Probleme und entkoppelt die vom Browser verwendete URL von der internen Netzwerkadresse des Backends.
*   **Konfiguration:**
    *   Die Datei `frontend/nginx.conf` enthält eine `location /api/`-Direktive.
    *   Die `proxy_pass`-Direktive ist auf `http://backend-service:3000;` gesetzt. `backend-service` ist der Name des Backend-Containers im gemeinsamen Docker-Netzwerk.

## Anwendung bauen und starten (mit Docker Netzwerk & Reverse Proxy)

Stelle sicher, dass Docker auf deinem System installiert ist und läuft.

### 1. Docker Netzwerk erstellen

Ein dediziertes Bridge-Netzwerk ermöglicht die Kommunikation zwischen den Containern über ihre Namen.
```bash
docker network create mein-app-netzwerk
```

### 2. Backend bauen und starten

**Image bauen:**
```bash
cd backend
docker build -t my-backend-api:network-proxy .
cd ..
```

**Container starten:**
Der Backend-Container wird mit dem Netzwerk verbunden, erhält einen Namen, nutzt das persistente Volume und optional wird ein Host-Port für direktes Debugging gemappt.
```bash
docker run -d \
  --name backend-service \
  --network mein-app-netzwerk \
  -v my-backend-data:/app/data \
  -p 8081:3000 \
  my-backend-api:network-proxy
```
*(Hinweis: Das Port-Mapping `-p 8081:3000` ist für dieses Setup optional, da die Kommunikation primär über Nginx im Frontend-Container laufen soll. Es kann aber zum direkten Testen der API nützlich sein.)*

### 3. Frontend bauen und starten

**Image bauen:**
Das Build-Argument `VITE_API_URL` wird auf den relativen Pfad `/api` gesetzt, den Nginx als Proxy-Basis verwendet. Dein JavaScript-Code (`apiClient.js`) ist bereits so angepasst, dass er diesen relativen Pfad nutzt.
```bash
cd frontend
docker build --build-arg VITE_API_URL=/api -t my-frontend-app:network-proxy .
cd ..
```

**Container starten:**
Der Frontend-Container wird ebenfalls mit dem Netzwerk verbunden und sein Nginx-Port (80) auf den Host-Port 8080 gemappt.
```bash
docker run -d \
  --name frontend-app \
  --network mein-app-netzwerk \
  -p 8080:80 \
  my-frontend-app:network-proxy
```

### 4. Anwendung im Browser aufrufen

Öffne deinen Webbrowser und navigiere zu:
`http://localhost:8080`

Du solltest nun die Notizblock-Anwendung sehen. API-Aufrufe gehen an `http://localhost:8080/api/...` und werden von Nginx an das Backend weitergeleitet.


1.  **Weg einer API-Anfrage:**
    Browser (auf `localhost:8080`) -> sendet Anfrage an `http://localhost:8080/api/notes` -> Host leitet Anfrage an Port 8080 weiter -> Frontend-Container (`frontend-app`) auf Port 80 (Nginx) -> Nginx's `location /api/`-Block fängt die Anfrage ab -> Nginx leitet die Anfrage per `proxy_pass` an `http://backend-service:3000/api/notes` (oder den entsprechenden internen Pfad, je nach `proxy_pass` Konfiguration) über das Docker-Netzwerk `mein-app-netzwerk` -> Backend-Container (`backend-service`) empfängt Anfrage auf Port 3000 -> Backend verarbeitet Anfrage und sendet Antwort zurück.

2.  **Auflösung von `backend-service:3000`:**
    Der Browser läuft auf dem Host-System (oder einem anderen Rechner) und hat keine Kenntnis vom internen DNS-System des Docker-Netzwerks `mein-app-netzwerk`. Docker stellt jedoch für Container innerhalb desselben benutzerdefinierten Netzwerks einen internen DNS-Service bereit, der die Namen der anderen Container im Netzwerk (hier `backend-service`) zu ihren internen IP-Adressen auflösen kann. Nginx im `frontend-app`-Container kann daher `backend-service` auflösen.

3.  **Rolle der Nginx-Konfiguration:**
    Die benutzerdefinierte Nginx-Konfiguration (`frontend/nginx.conf`) implementiert das Reverse-Proxy-Muster. Der relevante `location /api/`-Block fängt alle Anfragen ab, die mit `/api/` beginnen. Anstatt zu versuchen, diese als statische Dateien auszuliefern, leitet er (`proxy_pass`) sie an den angegebenen Backend-Service (`http://backend-service:3000`) weiter. Er fungiert als Vermittler, der Anfragen vom extern erreichbaren Frontend an das intern laufende Backend weitergibt.

4.  **Änderung von `VITE_API_URL`:**
    *   **Vorherige Aufgabe (direkte Kommunikation über Host-Ports):** `VITE_API_URL` war z.B. `http://localhost:8081/api`. Der Browser musste das Backend direkt über einen gemappten Host-Port erreichen.
    *   **Aktuelle Aufgabe (Reverse Proxy):** `VITE_API_URL` wurde zu `/api` geändert. Der JavaScript-Code im Browser (`apiClient.js`) wurde angepasst, um diesen relativen Pfad zu verwenden. Die Anfragen gehen an denselben Host und Port wie das Frontend selbst (z.B. `http://localhost:8080/api/...`). Nginx im Frontend-Container fängt diesen Pfad ab und leitet ihn intern an das Backend weiter. Der eigentliche Hostname und Port des Backends ist für den Browser nicht mehr direkt relevant.

5.  **Vorteile des Reverse Proxy Musters:**
    *   **CORS-Vermeidung:** Da alle Anfragen vom Browser an denselben Ursprung (Host und Port, z.B. `localhost:8080`) gehen, treten keine Cross-Origin Resource Sharing (CORS) Probleme auf, die sonst auftreten würden, wenn der Browser von `localhost:8080` direkt auf `localhost:8081` zugreifen würde.
    *   **Vereinfachte URL-Struktur:** Der Benutzer und das Frontend sehen eine einheitliche URL-Basis.
    *   **Zentraler Eingangspunkt:** Nginx kann als zentraler Punkt für SSL-Terminierung, Load Balancing (bei mehreren Backend-Instanzen), Caching, Request-Filterung oder -Modifikation dienen.
    *   **Sicherheit:** Das Backend muss nicht direkt über einen Host-Port nach außen exponiert werden; nur der Frontend-Proxy ist direkt erreichbar.
    *   **Entkopplung:** Die interne Netzwerkstruktur und die Ports der Backend-Dienste können geändert werden, ohne dass das Frontend oder der Browser davon betroffen sind, solange die Proxy-Konfiguration angepasst wird.
```

---

![Screenshot](assets/Screenshot%202025-05-06%20163255.png)