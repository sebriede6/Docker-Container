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
Konsistenz: Ein Docker-Container packt deine Anwendung zusammen mit ihrer gesamten Laufzeitumgebung (in diesem Fall Nginx und dessen Konfiguration) in ein Paket (das Image). Dieses Image läuft garantiert auf jedem System gleich, auf dem Docker installiert ist (dein Laptop, Server eines Kollegen, Cloud-Server). Ein "lokaler Build" (npm run build) erzeugt zwar die dist-Dateien, aber wie diese dann ausgeführt werden (welcher Webserver? welche Version? welche Konfiguration?), hängt von der lokalen Umgebung ab. Das führt oft zum "It works on my machine"-Problem.
Portabilität: Das Docker-Image kann einfach geteilt und überall bereitgestellt werden, wo Docker läuft.
Isolation: Die Anwendung im Container läuft isoliert vom Host-System und anderen Containern. Das verhindert Konflikte zwischen verschiedenen Anwendungen oder Abhängigkeiten.
Deployment & Skalierbarkeit: Container vereinfachen den Deployment-Prozess erheblich und machen es leicht, die Anwendung zu skalieren, indem einfach mehrere Instanzen des Containers gestartet werden.
