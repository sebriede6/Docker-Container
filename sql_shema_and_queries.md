```markdown
# SQL Recap: Datenmodell und Abfragen für Notizblock-Anwendung

## 1. Kontext der Anwendung

Die Anwendung ist ein einfacher Notizblock. Die API ermöglicht das Erstellen, Anzeigen (alle und einzeln), Aktualisieren und Löschen von Notizen. Jede Notiz besteht aus einer ID und einem Textinhalt. Zeitstempel für Erstellung und letzte Änderung werden ebenfalls modelliert.

**Datenstruktur:**
*   **Notiz (Note):** Speichert die Kerninformationen einer Notiz.

## 2. Entworfenes Datenmodell (Schema)

Das Schema fokussiert sich auf die Speicherung der Notizen, basierend auf der implementierten Funktionalität der API.

### SQL DDL: Tabelle `notes` erstellen

```sql
CREATE TABLE notes (
    note_id INTEGER PRIMARY KEY AUTOINCREMENT,
    text_content TEXT NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP -- In vielen DBs kann ON UPDATE CURRENT_TIMESTAMP genutzt werden
);
```
*Hinweis: `AUTOINCREMENT` ist spezifisch für SQLite. Andere Datenbanken verwenden `SERIAL` (PostgreSQL) oder `IDENTITY`. Die automatische Aktualisierung von `updated_at` ist ebenfalls datenbankspezifisch.*

**Tabellenbeschreibung: `notes`**

| Spaltenname    | Datentyp         | Schlüssel/Einschränkungen                         | Beschreibung                     |
|----------------|------------------|---------------------------------------------------|----------------------------------|
| `note_id`      | `INTEGER`        | `PRIMARY KEY`, `AUTOINCREMENT`                    | Eindeutige ID der Notiz          |
| `text_content` | `TEXT`           | `NOT NULL`                                        | Inhalt der Notiz                 |
| `created_at`   | `TIMESTAMP`      | `NOT NULL`, `DEFAULT CURRENT_TIMESTAMP`           | Zeitpunkt der Erstellung         |
| `updated_at`   | `TIMESTAMP`      | `NOT NULL`, `DEFAULT CURRENT_TIMESTAMP`           | Zeitpunkt der letzten Änderung   |

**Primärschlüssel `note_id` Begründung:**
Die Spalte `note_id` ist als Primärschlüssel geeignet, da `AUTOINCREMENT` (oder das DB-Äquivalent) für jede Notiz einen eindeutigen, numerischen Wert sicherstellt. Dieser Wert ist stabil und eignet sich perfekt zur eindeutigen Identifizierung jeder Zeile.

## 3. Grundlegende SQL-Abfragen (CRUD) für `notes`

Diese SQL-Abfragen entsprechen den Funktionalitäten der implementierten Backend-API.

### CREATE (Einfügen einer neuen Notiz)
Entspricht dem `POST /api/notes` Endpunkt.
```sql
INSERT INTO notes (text_content)
VALUES (?);
```
*(Der Platzhalter `?` wird durch den Notiztext aus dem Request Body ersetzt. Die Datenbank setzt `note_id`, `created_at`, `updated_at` gemäß Definition.)*

### READ (Lesen von Notizen)

*   **Alle Notizen abrufen:**
    Entspricht dem `GET /api/notes` Endpunkt.
    ```sql
    SELECT note_id, text_content, created_at, updated_at FROM notes ORDER BY created_at DESC;
    ```
*   **Einzelne Notiz nach ID abrufen:**
    Entspricht dem `GET /api/notes/:id` Endpunkt.
    ```sql
    SELECT note_id, text_content, created_at, updated_at FROM notes WHERE note_id = ?;
    ```
    *(Der Platzhalter `?` wird durch die ID aus dem URL-Parameter ersetzt.)*

### UPDATE (Aktualisieren einer Notiz)
Entspricht dem `PUT /api/notes/:id` Endpunkt.
```sql
UPDATE notes
SET text_content = ?, updated_at = CURRENT_TIMESTAMP
WHERE note_id = ?;
```
*(Der erste Platzhalter `?` wird durch den neuen Text aus dem Request Body ersetzt, der zweite durch die ID aus dem URL-Parameter. `updated_at` wird explizit gesetzt.)*

### DELETE (Löschen einer Notiz)
Entspricht dem `DELETE /api/notes/:id` Endpunkt.
```sql
DELETE FROM notes WHERE note_id = ?;
```
*(Der Platzhalter `?` wird durch die ID aus dem URL-Parameter ersetzt.)*

## 4. Reflexionsfragen

### Warum ist die Speicherung von Anwendungsdaten in einer strukturierten Datenbank (mit Tabellen, Spalten, Datentypen, Schlüsseln) besser als die einfache Speicherung in einer JSON-Datei auf dem Dateisystem, wie wir sie in der vorherigen Aufgabe umgesetzt haben? Nenne mindestens drei Vorteile.

1.  **Datenintegrität und -konsistenz:** Datenbanken erzwingen Datenstrukturen durch definierte Datentypen und Constraints (z.B. `NOT NULL`, `PRIMARY KEY`). Dies stellt sicher, dass die Daten eine bestimmte Struktur und Qualität haben. Eine JSON-Datei bietet diese Mechanismen nicht von Haus aus; die Konsistenz müsste komplett in der Anwendungslogik sichergestellt werden, was fehleranfällig ist.
2.  **Effiziente Abfragen und Indizierung:** SQL erlaubt mächtige und flexible Abfragen, um Daten zu filtern, zu sortieren und zu aggregieren. Datenbank-Indizes beschleunigen diese Abfragen dramatisch, insbesondere bei großen Datenmengen. Eine JSON-Datei müsste meist komplett geladen und durchsucht werden, was sehr ineffizient ist.
3.  **Nebenläufigkeit und Transaktionssicherheit (ACID):** Datenbanken können gleichzeitige Zugriffe von mehreren Prozessen oder Benutzern sicher verwalten (Concurrency Control). Transaktionen garantieren, dass zusammengehörige Änderungen entweder ganz oder gar nicht durchgeführt werden, was Datenkonsistenz auch bei Fehlern oder parallelen Zugriffen sicherstellt. Eine einfache Datei bietet diese Garantien nicht.

### Was ist der Hauptzweck eines Primärschlüssels in einer Tabelle, und wie hast du dieses Konzept in deinem Entwurf umgesetzt?

Der Hauptzweck eines Primärschlüssels ist es, jede Zeile (jeden Datensatz) in einer Tabelle **eindeutig** zu identifizieren. Er verhindert Duplikate und dient als stabiler Referenzpunkt für Datenmanipulationen (UPDATE, DELETE) und für Beziehungen zwischen Tabellen.
In meinem Entwurf für die `notes`-Tabelle habe ich die Spalte `note_id` als `PRIMARY KEY` definiert. Durch die Verwendung von `AUTOINCREMENT` wird sichergestellt, dass jede neue Notiz automatisch eine neue, eindeutige und numerische ID erhält.

### (Falls du einen Fremdschlüssel entworfen hast): Was ist der Zweck eines Fremdschlüssels, und welche Beziehung modelliert dein Fremdschlüssel?

In diesem Entwurf wurde **kein Fremdschlüssel** verwendet, da die Anwendung keine Beziehung zu anderen Entitäten (wie Benutzern) modelliert.

### Wie würden die API-Endpunkte deiner Backend-Anwendung [...] theoretisch auf die von dir formulierten SQL-Abfragen abgebildet werden? Welche Art von Abfrage [...] würde jeder Endpunkt typischerweise ausführen?

Bezogen auf die implementierten Endpunkte unter `/api/notes`:

*   **`GET /api/notes`:** Führt eine `SELECT`-Abfrage aus, um alle Zeilen aus der `notes`-Tabelle abzurufen.
*   **`GET /api/notes/:id`:** Führt eine `SELECT`-Abfrage mit einer `WHERE`-Klausel aus, um die Zeile mit der spezifischen `note_id` zu finden.
*   **`POST /api/notes`:** Führt eine `INSERT`-Abfrage aus, um eine neue Zeile mit den Daten aus dem Request Body in die `notes`-Tabelle einzufügen.
*   **`PUT /api/notes/:id`:** Führt eine `UPDATE`-Abfrage aus, um die Spalten der Zeile mit der spezifischen `note_id` mit den Daten aus dem Request Body zu aktualisieren.
*   **`DELETE /api/notes/:id`:** Führt eine `DELETE`-Abfrage aus, um die Zeile mit der spezifischen `note_id` aus der `notes`-Tabelle zu entfernen.

### Warum ist die Nutzung einer Datenbank für persistente Daten wichtig im Kontext von containerisierten Anwendungen und DevOps?

1.  **Entkopplung von Zustand und Laufzeit:** Container sollten zustandslos sein. Datenbanken (oft selbst containerisiert mit persistenten Volumes) speichern den Zustand (Daten) unabhängig vom Lebenszyklus der Anwendungscontainer, was Updates, Neustarts und Skalierung ohne Datenverlust ermöglicht.
2.  **Konsistenter Datenzugriff bei Skalierung:** Mehrere Instanzen eines Anwendungscontainers benötigen Zugriff auf denselben zentralen Datenspeicher, den eine Datenbank bietet.
3.  **Zuverlässige Backups und Wiederherstellung:** Datenbanken haben etablierte Mechanismen für Backup und Recovery, die für den zuverlässigen Betrieb (DevOps) essenziell sind.

```

