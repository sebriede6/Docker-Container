# Full-Stack Notizblock Anwendung mit Docker

Dies ist eine Full-Stack-Webanwendung, bestehend aus einem React-Frontend und einer Node.js/Express-API als Backend. Beide Komponenten sind separat containerisiert und können unabhängig voneinander gebaut und gestartet werden. Die Kommunikation zwischen Frontend und Backend erfolgt über HTTP-Requests.

Das Backend speichert die Notizdaten persistent in einer Datei (`notes.json`) innerhalb eines Docker Volumes, um sicherzustellen, dass die Daten auch nach Neustarts oder Neuerstellungen des Backend-Containers erhalten bleiben.

## Projektstruktur

```
react-docker-notizblock/
├── Readme.md
├── assets/
│   ├── Screenshot 2025-05-06 163255.png
│   ├── Screenshot 2025-05-06 164123.png
│   ├── Screenshot 2025-05-06 164307.png
│   ├── Screenshot 2025-05-06 164829.png
│   ├── Screenshot 2025-05-06 165202.png
│   ├── Screenshot 2025-05-06 165245.png
│   ├── Screenshot 2025-05-06 165328.png
│   └── Screenshot 2025-05-06 165524.png
├── backend/
│   ├── Dockerfile
│   ├── package.json
│   ├── server.js
│   └── data/
├── frontend/
│   ├── Dockerfile
│   ├── eslint.config.js
│   ├── index.html
│   ├── nginx.conf
│   ├── package.json
│   ├── README.md
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
```

## Anwendung bauen und starten

Sicherstellen, dass Docker auf deinem System installiert ist und läuft.

### 1. Backend bauen und starten (mit Datenpersistenz)

Das Backend speichert seine Daten in einem benannten Docker Volume.

**Image bauen:**

Navigiere in das `backend`-Verzeichnis und baue das Image. Ersetze `persistence-0.1.0` ggf. durch deine gewünschte Version.

```bash
cd backend
docker build -t my-backend-api:persistence-0.1.0 .
cd ..
```

**Container starten:**

Der folgende Befehl startet den Backend-Container, mappt Port `8081` deines Hosts auf Port `3000` im Container und verwendet ein benanntes Volume namens `my-backend-data` für die Persistenz der Anwendungsdaten im Containerpfad `/app/data`.

```bash
docker run -d \
  -p 8081:3000 \
  --name my-backend-persistent \
  -v my-backend-data:/app/data \
  my-backend-api:persistence-0.1.0
```

### 2. Frontend bauen und starten

**Image bauen:**

Navigiere in das `frontend`-Verzeichnis und baue das Image. Das Build-Argument `VITE_API_URL` muss auf die Adresse und den Port zeigen, unter dem das Backend vom Browser aus erreichbar ist. Ersetze `0.1.0` ggf. durch deine gewünschte Version.

```bash
cd frontend
docker build --build-arg VITE_API_URL=http://localhost:8081/api -t my-frontend-app:0.1.0 .
cd ..
```

**Container starten:**

Der folgende Befehl startet den Frontend-Container und mappt Port `8080` deines Hosts auf Port `80` im Container.

```bash
# Stoppe und entferne ggf. einen vorherigen Frontend-Container
docker stop my-frontend
docker rm my-frontend

# Starte den neuen Frontend-Container
docker run -d -p 8080:80 --name my-frontend my-frontend-app:0.1.0
```

### 3. Anwendung im Browser aufrufen

Öffne deinen Webbrowser und navigiere zu:

`http://localhost:8080`

Du solltest nun die Notizblock-Anwendung sehen, die mit dem Backend auf `http://localhost:8081/api` kommuniziert. Daten, die du hinzufügst, werden persistent gespeichert.

## Datenpersistenz im Backend: Wahl des Volume-Typs

Für die Persistenz der Backend-Daten (der `notes.json`-Datei) habe ich **Benanntes Docker Volume** (Named Volume) gewählt.

**Entscheidung und Begründung:**

ich habe mich für ein benanntes Volume (`my-backend-data`) anstelle eines Bind Mounts entschieden, aus folgenden Gründen:

1.  **Datenisolierung und Management durch Docker:**
    *   Benannte Volumes werden vollständig von Docker verwaltet. Der genaue Speicherort auf dem Host-Dateisystem ist für die Anwendung irrelevant und wird von Docker gehandhabt. Dies ist die sauberste Methode für reine Anwendungsdaten, da es das Host-System und das Projektverzeichnis frei von Laufzeitdaten hält.
2.  **Portabilität:**
    *   Benannte Volumes sind nicht an eine spezifische Verzeichnisstruktur auf dem Host gebunden. Dies macht die Anwendung und ihre Daten leichter zwischen verschiedenen Entwicklungsumgebungen oder Servern übertragbar, da man sich nicht um die Existenz oder die korrekten Pfade auf dem Host kümmern muss.
3.  **Docker-Best-Practice für Anwendungsdaten:**
    *   Für Daten, die von der Anwendung im Container generiert und modifiziert werden und deren Lebenszyklus unabhängig vom Container sein soll (wie unsere Notizen-Datenbank), sind benannte Volumes oft die empfohlene Lösung von Docker.
4.  **Performance:**
    *   Auf einigen Betriebssystemen (insbesondere macOS und Windows, die Docker in einer VM ausführen) können benannte Volumes performanter sein als Bind Mounts, da Docker den Speicherzugriff optimieren kann.
5.  **Einfache Docker-CLI-Verwaltung:**
    *   Benannte Volumes lassen sich einfach über Docker-Befehle erstellen (`docker volume create ...`), auflisten (`docker volume ls`), inspizieren (`docker volume inspect ...`) und entfernen (`docker volume rm ...`).

**Vergleich zu Bind Mounts für diesen Anwendungsfall:**

*   **Bind Mounts** würden den Inhalt eines Verzeichnisses auf dem Host-Rechner direkt in den Container spiegeln.
    *   **Vorteil:** Einfacher direkter Zugriff auf die `notes.json` vom Host-Dateisystem aus, was während der Entwicklung zum Debuggen nützlich sein *könnte*.
    *   **Nachteile:**
        *   **Stärkere Kopplung an den Host:** Die Anwendung wäre vom Vorhandensein und der Struktur des Host-Verzeichnisses abhängig.
        *   **Weniger Portabilität:** Das Verschieben der Anwendung auf ein anderes System erfordert, dass der Host-Pfad dort ebenfalls existiert oder angepasst wird.
        *   **Potenzielle Berechtigungsprobleme:** Es kann zu Konflikten mit Benutzer-IDs (UID/GID) zwischen dem Host und dem Container kommen.
        *   **Weniger "sauber":** Anwendungsdaten würden sich mit dem Projektcode oder anderen Host-Dateien vermischen, wenn man keinen dedizierten externen Ordner verwendet.

Für die Entwicklung des *Quellcodes* selbst sind Bind Mounts oft sehr nützlich (z.B. für Hot-Reloading). Für die *persistenten Daten* der laufenden Anwendung, wie in diesem Fall, bieten benannte Volumes jedoch eine robustere und besser verwaltbare Lösung im Docker-System.

## Screenshots

![Screenshot](assets/Screenshot%202025-05-06%20163255.png)
