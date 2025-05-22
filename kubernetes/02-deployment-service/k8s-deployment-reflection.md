
---

## Reflexion: Deployment, Service, Rolling Update & Rollback

#### 1. Warum ist ein Deployment in Kubernetes nicht einfach nur eine etwas andere Version von `docker run` mit `--restart=always`?
Ein Kubernetes Deployment ist mehr als ein `docker run --restart=always`. Während `docker run` einen einzelnen Container auf einer spezifischen Maschine startet und `--restart=always` lediglich sicherstellt, dass dieser eine Container bei einem Absturz von Docker neu gestartet wird, definiert ein Kubernetes `Deployment` einen gewünschten Zustand für eine Anwendung. Ich deklariere beispielsweise, dass drei Instanzen meines Webservers mit einer bestimmten Version laufen sollen. Das Deployment sorgt nicht nur für den initialen Start dieser Instanzen (als Pods), sondern überwacht sie kontinuierlich. Es stellt sicher, dass die deklarierte Anzahl an Replikaten stets verfügbar ist, auch bei Node-Ausfällen oder Pod-Abstürzen, indem es bei Bedarf neue Pods startet. Darüber hinaus verwaltet ein Deployment kontrollierte Updates auf neue Anwendungsversionen mittels Rolling Updates und ermöglicht einfache Rollbacks zur vorherigen Version. Es agiert als intelligenter Manager für den Lebenszyklus meiner Anwendungsinstanzen, weit über die einfache Neustartfunktion eines einzelnen Containers hinaus.

#### 2. Was tut das Deployment, wenn ein Pod plötzlich verschwindet – und warum ist das nicht einfach nur Magie?
Wenn ein Pod, der von einem Deployment verwaltet wird, unerwartet verschwindet (z.B. durch einen Node-Ausfall oder einen internen Fehler im Pod, der zu dessen Beendigung führt), greift der Selbstheilungsmechanismus von Kubernetes. Das ist keine Magie, sondern das Ergebnis eines kontinuierlichen Abgleichs zwischen dem deklarierten *gewünschten Zustand* und dem *tatsächlichen Zustand* im Cluster, durchgeführt vom zuständigen Controller der Kubernetes Control Plane.

Das Deployment hat die Anweisung, eine bestimmte Anzahl von Replikaten eines Pod-Templates laufen zu lassen. Der Controller stellt fest, dass die aktuelle Anzahl der laufenden, gesunden Pods niedriger ist als die gewünschte Anzahl. Daraufhin initiiert er die Erstellung eines neuen Pods, um die Lücke zu füllen und den deklarierten Zustand wiederherzustellen. Dieser neue Pod wird dann vom Scheduler auf einem geeigneten, verfügbaren Node im Cluster platziert. Dieser Prozess, bekannt als "Reconciliation Loop", ist ein Kernprinzip von Kubernetes.

#### 3. Was konntest du beim Rolling Update mit `kubectl get pods -w` beobachten – und wie wird hier sichergestellt, dass es keinen kompletten Ausfall gibt?
Während des Rolling Updates meiner Nginx-Anwendung von Version 1 auf Version 2, das ich mit `kubectl apply -f nginx-deployment.yaml` (nach Änderung des Image-Tags) auslöste, konnte ich den Prozess mit `kubectl get pods -l app=nginx-example -w` live verfolgen.

Ich beobachtete, dass Kubernetes nicht alle Pods der alten Version gleichzeitig beendete. Stattdessen wurde der Update-Prozess schrittweise durchgeführt:
1.  Ein neuer Pod mit dem Image der Version 2 wurde gestartet. Sein Status wechselte von `Pending` zu `ContainerCreating` und schließlich zu `Running`.
2.  Erst nachdem dieser neue Pod als `Ready` (betriebsbereit) gemeldet wurde, wurde einer der bestehenden Pods mit Version 1 in den `Terminating`-Status versetzt und schließlich beendet.
3.  Dieser Vorgang wiederholte sich – neuer Pod startet und wird bereit, alter Pod wird beendet – bis alle Replikate auf die Version 2 aktualisiert waren.

Ein kompletter Ausfall wird hierdurch vermieden, da Kubernetes durch die Standardstrategie des Rolling Updates (`RollingUpdate`) sicherstellt, dass während des gesamten Update-Vorgangs immer eine Mindestanzahl an funktionierenden Pods (eine Mischung aus alter und neuer Version) verfügbar bleibt, um Anfragen zu bedienen. Neue Pods müssen erst ihren Readiness-Check bestehen, bevor alte Pods heruntergefahren werden, was die Aufrechterhaltung der Anwendungsverfügbarkeit gewährleistet.

#### 4. Wie sorgt der Kubernetes-Service dafür, dass dein Browser-Ping (über NodePort) den richtigen Pod trifft – selbst wenn sich gerade ein Update vollzieht?
Der Kubernetes `Service` (in meinem Fall `nginx-app-service` vom Typ `NodePort`) fungiert als stabile Abstraktionsschicht und interner Load Balancer vor meinen Pods. Er ist nicht direkt an spezifische Pod-Instanzen gebunden, sondern verwendet einen **Label-Selektor** (z.B. `app: nginx-example`), um dynamisch eine Liste von Endpunkten zu erstellen, die auf alle Pods zeigen, die dieses Label tragen und als `Ready` (gesund und bereit, Anfragen anzunehmen) gelten.

Wenn eine Anfrage von meinem Browser über den NodePort auf einem der Cluster-Nodes eintrifft, wird diese vom `kube-proxy`-Dienst auf dem Node (oder einem vergleichbaren Load-Balancing-Mechanismus) an den Cluster-internen `Service` weitergeleitet. Der `Service` verteilt die Anfrage dann an einen der aktuell verfügbaren und als `Ready` markierten Pods, die seinem Label-Selektor entsprechen.

Während eines Rolling Updates ändert sich die Menge der Pods, die dem Selektor entsprechen und `Ready` sind:
*   Alte Pods (Version 1), die noch laufen und `Ready` sind, bleiben Ziele für den Service.
*   Neue Pods (Version 2), die gestartet werden und den `Ready`-Status erreichen, werden ebenfalls zu Zielen.
*   Alte Pods, die gerade beendet werden (`Terminating`), werden aus der Liste der gültigen Endpunkte des Service entfernt.
Somit leitet der Service Anfragen immer nur an die Pods weiter, die gerade aktiv und betriebsbereit sind, unabhängig davon, ob sie zur alten oder neuen Version gehören (solange sie das passende Label tragen und `Ready` sind). Dies gewährleistet die kontinuierliche Erreichbarkeit der Anwendung.

#### 5. In der Deployment-YAML: Welche Angaben betreffen die Pod-Vorlage, und welche regeln das Verhalten des Deployments (z.B. Skalierung, Strategie)?

In der `nginx-deployment.yaml` lassen sich die Angaben klar trennen:

1.  **Pod-Vorlage (`spec.template`):** Dieser gesamte verschachtelte Block definiert die Blaupause für jeden einzelnen Pod, den das Deployment erstellen und verwalten soll.
    *   `spec.template.metadata.labels`: Definiert die Labels, die jedem Pod zugewiesen werden (z.B. `app: nginx-example`).
    *   `spec.template.spec.containers`: Beschreibt die Container innerhalb des Pods, einschließlich:
        *   `name`: Name des Containers.
        *   `image`: Das zu verwendende Docker-Image.
        *   `ports`: Die Ports, die der Container exponiert (z.B. `containerPort: 80`).

2.  **Deployment-Verhalten (außerhalb von `spec.template`, aber innerhalb von `spec`):** Diese Angaben steuern, wie das Deployment selbst agiert und die Pods verwaltet.
    *   `spec.replicas`: Legt die gewünschte Anzahl an laufenden Pod-Instanzen fest (z.B. `replicas: 3`) und steuert somit die Skalierung.
    *   `spec.selector`: Definiert, welche Pods (basierend auf ihren Labels) zu diesem Deployment gehören und von ihm verwaltet werden. Es muss mit den Labels in `spec.template.metadata.labels` übereinstimmen.
    *   `spec.strategy` (optional, oft mit Defaults): Bestimmt die Strategie für Updates (z.B. `type: RollingUpdate` mit Parametern wie `maxUnavailable` und `maxSurge`).

Zusammengefasst ist `spec.template` das "Was" (die Pod-Definition), während die anderen Teile von `spec` das "Wie viele" und "Wie aktualisiert" (das Managementverhalten des Deployments) regeln.

#### 6. Was passiert mit den Pods, wenn du das Deployment löschst – und warum ist das Verhalten logisch?

Wenn ich ein Kubernetes `Deployment` lösche (mit `kubectl delete deployment nginx-app-deployment`), werden auch alle Pods, die von diesem Deployment erstellt und verwaltet wurden, automatisch beendet und gelöscht.

Dieses Verhalten ist logisch, da das `Deployment` den *gewünschten Zustand* meiner Anwendung im Cluster repräsentiert – es sagt Kubernetes: "Sorge dafür, dass X Instanzen meiner Anwendung basierend auf dieser Pod-Vorlage laufen." Die Pods sind die konkreten Instanziierungen dieses gewünschten Zustands.

Wenn ich das `Deployment` entferne, signalisiere ich Kubernetes, dass dieser gewünschte Zustand nicht mehr länger aufrechterhalten werden soll. Folglich ist es die logische Konsequenz, dass Kubernetes auch die Ressourcen (die Pods) entfernt, die ausschließlich zur Erfüllung dieses nicht mehr existierenden gewünschten Zustands dienten. Die Pods "gehören" zum Deployment; ohne das übergeordnete Management-Objekt, das ihre Existenz und Anzahl vorschreibt, gibt es für sie keinen Grund mehr, im Cluster zu verbleiben. Kubernetes räumt somit die nicht mehr benötigten Ressourcen auf, um den neuen Gesamtzustand (keine Instanzen dieser Anwendung mehr) herzustellen.

---