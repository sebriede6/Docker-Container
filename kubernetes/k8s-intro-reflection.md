# Welche Methode hast du zum Aufsetzen deines lokalen Kubernetes Clusters gewählt (Docker Desktop, Minikube, Kind) und warum?

Ich habe Docker Desktop verwendet, um mein lokales Kubernetes Cluster aufzusetzen. Der Hauptgrund dafür war die einfache Integration und der geringe Konfigurationsaufwand. Da Docker Desktop bereits auf meinem System installiert und für die Containerisierung meiner Anwendung genutzt wird, bot es sich an, die eingebaute Kubernetes-Funktionalität mit nur einem Klick in den Einstellungen zu aktivieren. Dies ersparte mir die separate Installation und Konfiguration eines Tools wie Minikube oder Kind für diese einführende Aufgabe.

# Beschreibe in eigenen Worten, was die Control Plane eines Kubernetes Clusters ist und welche Kernrolle sie hat (ohne spezifische Komponenten wie etcd, Scheduler etc. im Detail zu nennen).

Die Control Plane ist das 'Gehirn' eines Kubernetes Clusters. Ihre Kernrolle ist es, den gesamten Cluster zu verwalten und zu steuern. Sie trifft globale Entscheidungen über den Cluster (z.B. wo Anwendungen laufen sollen), überwacht den Zustand der Anwendungen und des Clusters und reagiert auf Ereignisse oder Änderungen. Sie stellt sicher, dass der gewünschte Zustand der Anwendungen (den ich deklariere) auch tatsächlich im Cluster umgesetzt und aufrechterhalten wird.

# Was ist die Rolle eines Worker Node in einem Kubernetes Cluster?

Ein Worker Node ist eine Maschine (physisch oder virtuell) im Kubernetes Cluster, auf der die eigentlichen Anwendungen, also meine Container, ausgeführt werden. Die Worker Nodes stellen die Rechenleistung, den Speicher und die Netzwerkressourcen bereit, die meine Anwendungen zum Laufen benötigen. Sie erhalten Anweisungen von der Control Plane, welche Container sie starten, stoppen oder verwalten sollen, und führen diese dann aus.

# Der Befehl kubectl ist das Kommandozeilen-Tool zur Interaktion mit Kubernetes. Mit welchem zentralen Bestandteil der Kubernetes Architektur spricht kubectl direkt, wenn du einen Befehl absetzt?

Wenn ich einen kubectl-Befehl absetze, spricht kubectl direkt mit dem Kubernetes API-Server. Der Api Server ist die zentrale Schnittstelle und das Frontend der Controle Plane. Alle Interaktionen mit dem Cluster, sei es von mir über kubectl oder von anderen Komponenten des Clusters, laufen über diesen API Server.

# Wie hast du praktisch überprüft, dass kubectl erfolgreich eine Verbindung zu deinem lokalen Cluster herstellen konnte? Welche Befehle hast du dafür genutzt, und was hast du als erfolgreiche Ausgabe erwartet?

Ich habe die erfolgreiche Verbindung von kubectl zu meinem lokalen Cluster mit mehreren Befehlen überprüft:
kubectl config current-context: Ich erwartete hier die Ausgabe docker-desktop, was bestätigte, dass kubectl auf mein von Docker Desktop verwaltetes Cluster konfiguriert ist.
kubectl get nodes: Hier erwartete ich eine Liste der Nodes meines Clusters. Für Docker Desktop war das ein Node namens docker-desktop mit dem Status Ready. Dies zeigte, dass kubectl Informationen über die Cluster-Infrastruktur abrufen kann.
kubectl cluster-info: Dieser Befehl sollte mir die Adresse des Kubernetes API Servers (Control Plane) und anderer Cluster-Dienste anzeigen. Eine erfolgreiche Ausgabe bestätigte, dass die grundlegende Kommunikation mit dem Cluster-Management funktionierte.
Die Tatsache, dass diese Befehle ohne Verbindungsfehler sinnvolle Informationen über das Cluster zurücklieferten, war der praktische Beweis für die erfolgreiche Verbindung.

# Basierend auf dem Theorieteil: Erkläre kurz die Kernidee der deklarativen Philosophie von Kubernetes.

Die Kernidee der deklarativen Philosophie von Kubernetes ist, dass ich als Benutzer beschreibe, welchen gewünschten Zustand meine Anwendung oder mein System im Cluster haben soll (z.B. 'Ich möchte, dass drei Instanzen meiner Webanwendung laufen und über einen bestimmten Port erreichbar sind'). Ich sage Kubernetes also was ich will, aber nicht im Detail wie es diesen Zustand erreichen soll. Kubernetes (genauer gesagt die Control Plane) ist dann dafür verantwortlich, kontinuierlich daran zu arbeiten, diesen deklarierten gewünschten Zustand herzustellen und aufrechtzuerhalten. Wenn der aktuelle Zustand vom gewünschten Zustand abweicht (z.B. eine Instanz stürzt ab), ergreift Kubernetes automatisch Maßnahmen, um den gewünschten Zustand wiederherzustellen (z.B. eine neue Instanz starten). Das steht im Gegensatz zu einem imperativen Ansatz, bei dem ich jeden einzelnen Schritt befehlen müsste.