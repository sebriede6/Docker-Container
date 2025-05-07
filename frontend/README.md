Was wird genau im Image gespeichert – Quellcode oder Build-Ergebnis?
Antwort: Im Docker-Image wird das Build-Ergebnis gespeichert.

Welche Rolle spielt nginx in diesem Kontext?
Antwort: Nginx fungiert als Webserver.

Warum wird der Entwicklungsmodus (npm run dev) nicht für den Produktivbetrieb genutzt?
Antwort: Der Entwicklungsmodus ist nicht optimiert, enthält Entwicklungswerkzeuge und ist potenziell unsicherer.
Erklärung:
Performance/Optimierung: npm run dev (oder vite dev) startet einen Entwicklungsserver. Dieser ist darauf ausgelegt, schnelle Code-Änderungen zu ermöglichen (Hot Module Replacement - HMR). Er optimiert die Dateigrößen nicht (keine Minifizierung, kein Tree-Shaking wie im Build), was zu langsameren Ladezeiten führt.
Entwicklungswerkzeuge: Der Dev-Server enthält zusätzliche Werkzeuge und Debugging-Informationen, die im Produktivbetrieb unnötig sind und die Anwendung verlangsamen oder sogar Sicherheitslücken offenlegen könnten (z. B. Source Maps).
Stabilität/Ressourcen: Der Entwicklungsserver ist nicht für den stabilen Betrieb unter Last ausgelegt. Der Build-Prozess (npm run build) erzeugt hingegen optimierte, eigenständige Dateien, die von einem robusten Webserver wie Nginx effizient ausgeliefert werden können, ohne dass Node.js oder der Vite-Server laufen müssen.

Was ist der Vorteil eines Containers gegenüber einem „lokalen Build“?
Antwort: Container bieten Konsistenz, Portabilität, Isolation und Skalierbarkeit.
Erklärung:
Konsistenz: Ein Docker-Container packt die Anwendung zusammen mit ihrer gesamten Laufzeitumgebung (in diesem Fall Nginx und dessen Konfiguration) in ein Paket (das Image). Dieses Image läuft garantiert auf jedem System gleich, auf dem Docker installiert ist (Server eines Kollegen, Cloud-Server). Ein "lokaler Build" (npm run build) erzeugt zwar die dist-Dateien, aber wie diese dann ausgeführt werden (welcher Webserver? welche Version? welche Konfiguration?), hängt von der lokalen Umgebung ab. Das führt oft zum "It works on my machine"-Problem.
Portabilität: Das Docker-Image kann einfach geteilt und überall bereitgestellt werden, wo Docker läuft.
Isolation: Die Anwendung im Container läuft isoliert vom Host-System und anderen Containern. Das verhindert Konflikte zwischen verschiedenen Anwendungen oder Abhängigkeiten.
Deployment & Skalierbarkeit: Container vereinfachen den Deployment-Prozess erheblich und machen es leicht, die Anwendung zu skalieren, indem einfach mehrere Instanzen des Containers gestartet werden.

Was ist der Hauptvorteil eines Multi-Stage Builds (wie in deinem Dockerfile implementiert) gegenüber einem einfachen Dockerfile, das alle Schritte in einer einzigen Stage ausführt?
Der Hauptvorteil ist die Reduzierung der Größe des finalen Images und die Erhöhung der Sicherheit. In der ersten "Builder"-Stage werden alle notwendigen Werkzeuge (Node.js, npm) und Abhängigkeiten (node_modules) sowie der Quellcode verwendet, um die Anwendung zu bauen. Die zweite, finale "Runtime"-Stage kopiert nur das Ergebnis dieses Builds (die statischen Dateien aus dist) in ein schlankes Server-Image (Nginx). Alle Build-Werkzeuge, der Quellcode und die riesigen node_modules aus der ersten Stage werden verworfen und sind im finalen Image nicht enthalten. Ein einfaches Dockerfile würde all diese Build-Abhängigkeiten im finalen Image belassen, was es unnötig groß macht und potenzielle Angriffsflächen bietet.
Warum ist der node_modules Ordner nicht im finalen Nginx Image enthalten, obwohl er für den Build-Prozess im ersten Stage notwendig war? Erkläre, wie der Multi-Stage Build dies ermöglicht.
Der node_modules Ordner ist nur in der ersten "Builder"-Stage vorhanden, weil er dort mittels npm ci installiert wird, um den Build (npm run build) durchführen zu können. Der Multi-Stage Build ermöglicht die Trennung, indem die zweite Stage (FROM nginx:alpine) eine komplett neue, saubere Image-Basis startet. Der Befehl COPY --from=builder /app/dist /usr/share/nginx/html kopiert dann selektiv nur den Inhalt des /app/dist-Ordners aus der abgeschlossenen Builder-Stage in die neue Runtime-Stage. Alles andere aus der Builder-Stage, einschließlich node_modules, wird ignoriert und verworfen.
Beschreibe, wie das Docker-Layer-Caching bei diesem Multi-Stage Build genutzt wird, insbesondere im Zusammenhang mit dem COPY package*.json Schritt.
Docker baut Images in Schichten (Layers), wobei jeder Befehl im Dockerfile (wie COPY, RUN) potenziell einen neuen Layer erzeugt. Wenn Docker ein Image baut, prüft es für jeden Schritt, ob sich die beteiligten Dateien oder der Befehl selbst seit dem letzten Build geändert haben. Wenn nicht, kann Docker den gecachten Layer aus einem vorherigen Build wiederverwenden, was den Build-Prozess erheblich beschleunigt.
Im Multi-Stage Build wird dies clever genutzt:
COPY package.json package-lock.json ./: Dieser Schritt wird als Erstes nach WORKDIR ausgeführt. Solange sich package.json oder package-lock.json nicht ändern, wird dieser Layer (und der darauf folgende RUN npm ci Layer) aus dem Cache genommen.
RUN npm ci: Dieser (oft zeitaufwändige) Schritt wird nur dann ausgeführt, wenn sich die package*.json-Dateien im vorherigen Schritt geändert haben.
COPY . .: Dieser Schritt kopiert den restlichen Quellcode. Wenn sich nur der Quellcode ändert, aber nicht die Abhängigkeiten, werden die Layer für COPY package\*.json und RUN npm ci aus dem Cache verwendet, und nur COPY . . und RUN npm run build müssen neu ausgeführt werden.
Diese Reihenfolge optimiert das Caching, da die selten geänderten Abhängigkeitsdefinitionen vor dem häufiger geänderten Quellcode kopiert werden.
Rolle des Webservers und der Anwendung:
Was wird genau im finalen Image gespeichert – der gesamte Quellcode, die Build-Abhängigkeiten oder das reine Build-Ergebnis (statische Dateien)? Erkläre den Unterschied zur ersten Stage.
Im finalen Image (der zweiten Stage) wird nur das reine Build-Ergebnis (die optimierten, statischen HTML-, CSS- und JavaScript-Dateien aus dem dist-Ordner) zusammen mit dem Nginx-Webserver und seiner Konfiguration gespeichert.
Im Unterschied dazu enthielt die erste Stage ("builder") den gesamten Quellcode, die Build-Abhängigkeiten (node_modules), das Node.js-Laufzeitsystem und npm, also alles, was zum Erstellen des Build-Ergebnisses notwendig war.
Welche Rolle spielt der Webserver (Nginx) in diesem Kontext der Containerisierung deiner React-Anwendung? Warum ist eine spezielle Konfiguration für SPAs (wie React) auf einem Webserver oft notwendig?
Der Webserver (Nginx) spielt die Rolle des Auslieferers. Seine Aufgabe ist es, die statischen Build-Artefakte (HTML, CSS, JS) über HTTP an den Browser des Benutzers zu senden, wenn dieser die URL der Anwendung aufruft.
Eine spezielle Konfiguration (wie die try_files $uri $uri/ /index.html; Direktive in nginx.conf) ist für Single-Page-Applications (SPAs) oft notwendig, weil das Routing in SPAs primär client-seitig (im Browser durch JavaScript/React Router) geschieht. Wenn ein Benutzer direkt eine Unterseite wie http://deine-app.com/benutzer/profil aufruft, kennt der Server diesen Pfad /benutzer/profil nicht als eigene Datei oder Verzeichnis. Ohne spezielle Konfiguration würde der Server einen 404 (Not Found) Fehler zurückgeben. Die Konfiguration weist Nginx an, bei solchen Anfragen immer die index.html auszuliefern. Die index.html lädt dann das React-JavaScript, welches die URL analysiert und die korrekte Ansicht (/benutzer/profil) rendert.
Warum wird der Entwicklungsmodus (npm run dev) nicht für den Produktivbetrieb im Container genutzt?
Der Entwicklungsmodus (npm run dev / vite dev) ist aus mehreren Gründen ungeeignet für die Produktion:
Performance: Enthält unoptimierten Code, Debugging-Hilfen und keine Code-Minimierung/-Bündelung, was zu langsameren Ladezeiten führt.
Features: Beinhaltet Hot Module Replacement (HMR) und andere Entwicklungs-Features, die in Produktion unnötig sind und Ressourcen verbrauchen.
Sicherheit: Der Dev-Server kann detailliertere Fehlermeldungen ausgeben und ist nicht für den Betrieb unter Last oder Angriffsversuchen ausgelegt.
Build nicht erstellt: Der Dev-Server arbeitet direkt mit dem Quellcode und erstellt keinen optimierten dist-Ordner, der von einem Produktions-Webserver wie Nginx ausgeliefert werden könnte.
Containerisierung und Betrieb:
Was ist der Hauptvorteil der Containerisierung deiner React-Anwendung mit Docker (basierend auf dem Multi-Stage Build) im Vergleich zur Auslieferung der statischen Dateien durch einen "lokalen Build" auf dem Server ohne Container? Nenne mindestens zwei Vorteile.
Portabilität/Konsistenz: Der Container bündelt die Anwendung (statische Dateien) und ihre Laufzeitumgebung (Nginx mit spezifischer Konfiguration). Er läuft auf jedem System mit Docker exakt gleich, unabhängig vom Host-Betriebssystem oder installierter Software. Ein "lokaler Build" erfordert, dass auf dem Zielserver bereits ein passender Webserver (wie Nginx) korrekt installiert und konfiguriert ist, was zu "Works on my machine"-Problemen führen kann.
Reproduzierbarkeit/Isolation: Das Dockerfile definiert exakt, wie die Produktionsumgebung gebaut wird. Jeder Build erzeugt dasselbe Ergebnis. Container laufen isoliert voneinander und vom Host-System, was Konflikte zwischen Anwendungen oder Abhängigkeiten vermeidet. Bei einem lokalen Build können Konfigurationen des Servers oder andere laufende Anwendungen die Auslieferung beeinflussen.
(Weitere Vorteile: Einfacheres Deployment, Skalierbarkeit, definierte Abhängigkeiten)
Erkläre die Funktion des HEALTHCHECK in deinem Dockerfile und warum er für die spätere Orchestrierung (z.B. in Docker Swarm oder Kubernetes) von Bedeutung ist.
Der HEALTHCHECK-Befehl definiert, wie Docker periodisch überprüfen kann, ob der Hauptprozess innerhalb des Containers nicht nur läuft, sondern auch korrekt funktioniert und Anfragen beantworten kann. In unserem Fall prüft wget, ob der Nginx-Server auf Port 80 erfolgreich antwortet.
Für Orchestrierungswerkzeuge wie Kubernetes oder Docker Swarm ist dies entscheidend. Sie nutzen den Health Status, um:
Automatische Reparaturen: Einen Container als "unhealthy" zu erkennen und ihn automatisch neu zu starten.
Load Balancing: Anfragen nur an "healthy" Container weiterzuleiten und "unhealthy" Container temporär aus dem Load Balancer zu entfernen.
Rolling Updates: Sicherzustellen, dass neue Container-Versionen erst dann Traffic erhalten, wenn sie als "healthy" markiert sind, um Updates ohne Ausfallzeit zu ermöglichen.
Vergleiche die Aufgaben von .gitignore und .dockerignore in deinem Projekt. Welche Datei beeinflusst den Git-Verlauf und welche den Docker Build-Kontext?
.gitignore: Diese Datei weist das Versionskontrollsystem Git an, welche Dateien oder Verzeichnisse ignoriert werden sollen. Sie beeinflusst, was bei git add hinzugefügt wird und somit nicht im Git-Repository (im Git-Verlauf) landet. Typische Beispiele sind node_modules, Build-Artefakte (dist), Log-Dateien oder lokale Konfigurationsdateien (.env).
.dockerignore: Diese Datei weist den Docker-Daemon an, welche Dateien oder Verzeichnisse beim Ausführen von docker build ignoriert werden sollen, wenn der Build-Kontext (normalerweise das aktuelle Verzeichnis .) an den Daemon gesendet wird. Sie beeinflusst, welche Dateien für den Build-Prozess innerhalb von Docker verfügbar sind. Sie verhindert das Senden großer oder unnötiger Dateien an den Daemon, was den Build beschleunigt und die Image-Größe potenziell reduziert. Oft gibt es Überschneidungen mit .gitignore (z.B. node_modules, .git), aber .dockerignore kann auch Docker-spezifische Dateien (Dockerfile selbst) ausschließen.
Kurz: .gitignore beeinflusst den Git-Verlauf, .dockerignore beeinflusst den Docker Build-Kontext.
