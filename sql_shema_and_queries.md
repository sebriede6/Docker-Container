```markdown
# SQL Recap: Datenmodell und Abfragen für Notizblock-Anwendung

## 1. Kontext der Anwendung

Die Anwendung ist ein einfacher Notizblock. Die API ermöglicht das Erstellen, Anzeigen (alle und einzeln), Aktualisieren und Löschen von Notizen. Jede Notiz besteht aus einer ID und einem Textinhalt. Zeitstempel für Erstellung und letzte Änderung werden ebenfalls modelliert und gespeichert.

**Datenstruktur:**
*   **Notiz (Note):** Speichert die Kerninformationen einer Notiz.

## 2. Implementiertes Datenmodell (PostgreSQL Schema)

Das Schema fokussiert sich auf die Speicherung der Notizen in der PostgreSQL-Datenbank, wie in `backend/sql/initial_schema.sql` definiert und manuell angewendet.

### SQL DDL: Tabelle `notes` erstellen (Auszug aus `initial_schema.sql`)

```sql
CREATE TABLE IF NOT EXISTS notes (
    id SERIAL PRIMARY KEY,
    text_content TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Trigger zum automatischen Aktualisieren von updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
   NEW.updated_at = NOW();
   RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_notes_updated_at
BEFORE UPDATE ON notes
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

```
*Hinweis: `SERIAL` ist ein PostgreSQL-spezifischer Typ, der automatisch eine Sequenz erstellt und die `id` bei jedem Einfügen inkrementiert. `TIMESTAMP WITH TIME ZONE` speichert Zeitpunkte inklusive Zeitzoneninformation.*

**Tabellenbeschreibung: `notes`**

| Spaltenname    | Datentyp                  | Schlüssel/Einschränkungen                         | Beschreibung                     |
|----------------|---------------------------|---------------------------------------------------|----------------------------------|
| `id`           | `INTEGER` (`SERIAL`)      | `PRIMARY KEY`                                     | Eindeutige ID der Notiz          |
| `text_content` | `TEXT`                    | `NOT NULL`                                        | Inhalt der Notiz                 |
| `created_at`   | `TIMESTAMP WITH TIME ZONE`| `NOT NULL`, `DEFAULT CURRENT_TIMESTAMP`           | Zeitpunkt der Erstellung         |
| `updated_at`   | `TIMESTAMP WITH TIME ZONE`| `NOT NULL`, `DEFAULT CURRENT_TIMESTAMP`           | Zeitpunkt der letzten Änderung   |

**Primärschlüssel `id` Begründung:**
Die Spalte `id` ist als Primärschlüssel geeignet, da `SERIAL` für jede Notiz automatisch einen eindeutigen, numerischen Wert sicherstellt. Dieser Wert ist stabil und eignet sich perfekt zur eindeutigen Identifizierung jeder Zeile.

## 3. Grundlegende SQL-Abfragen (CRUD) für `notes` (wie im Service implementiert)

Diese SQL-Abfragen entsprechen den Funktionalitäten, die aktuell im Backend-Service (`noteDbService.js`) mit dem `pg`-Treiber und PostgreSQL implementiert sind. Sie verwenden `$n`-Platzhalter für parametrisierte Abfragen.

### CREATE (Einfügen einer neuen Notiz)
Entspricht dem `POST /api/notes` Endpunkt.
```sql
INSERT INTO notes (text_content)
VALUES ($1)
RETURNING id, text_content AS text, created_at, updated_at;
```
*(Der Platzhalter `$1` wird durch den Notiztext aus dem Request Body ersetzt. `RETURNING` gibt die neu erstellte Zeile zurück, wobei `text_content` als `text` für die API umbenannt wird.)*

### READ (Lesen von Notizen)

*   **Alle Notizen abrufen:**
    Entspricht dem `GET /api/notes` Endpunkt.
    ```sql
    SELECT id, text_content AS text, created_at, updated_at FROM notes ORDER BY created_at DESC;
    ```
    *(`text_content` wird als `text` für die API umbenannt.)*
*   **Einzelne Notiz nach ID abrufen:**
    Entspricht dem `GET /api/notes/:id` Endpunkt.
    ```sql
    SELECT id, text_content AS text, created_at, updated_at FROM notes WHERE id = $1;
    ```
    *(Der Platzhalter `$1` wird durch die ID aus dem URL-Parameter ersetzt. `text_content` wird als `text` umbenannt.)*

### UPDATE (Aktualisieren einer Notiz)
Entspricht dem `PUT /api/notes/:id` Endpunkt.
```sql
UPDATE notes
SET text_content = $1
WHERE id = $2
RETURNING id, text_content AS text, created_at, updated_at;
```
*(Der Platzhalter `$1` wird durch den neuen Text ersetzt, `$2` durch die ID. `updated_at` wird durch den Datenbank-Trigger automatisch aktualisiert. `RETURNING` gibt die geänderte Zeile zurück, wobei `text_content` als `text` umbenannt wird.)*

### DELETE (Löschen einer Notiz)
Entspricht dem `DELETE /api/notes/:id` Endpunkt.
```sql
DELETE FROM notes WHERE id = $1 RETURNING id;
```
*(Der Platzhalter `$1` wird durch die ID aus dem URL-Parameter ersetzt. `RETURNING id` gibt die ID der gelöschten Zeile zurück, um den Erfolg zu bestätigen.)*

## 4. Reflexionsfragen

### Warum ist die Speicherung von Anwendungsdaten in einer strukturierten Datenbank [...] besser als die einfache Speicherung in einer JSON-Datei [...]. Nenne mindestens drei Vorteile.

1.  **Datenintegrität und -konsistenz:** [...]
2.  **Effiziente Abfragen und Indizierung:** [...]
3.  **Nebenläufigkeit und Transaktionssicherheit (ACID):** [...]

### Was ist der Hauptzweck eines Primärschlüssels in einer Tabelle, und wie hast du dieses Konzept in deinem Entwurf umgesetzt?

Der Hauptzweck eines Primärschlüssels ist es, jede Zeile (jeden Datensatz) in einer Tabelle **eindeutig** zu identifizieren. [...]
In meinem Entwurf für die `notes`-Tabelle habe ich die Spalte `id` als `SERIAL PRIMARY KEY` definiert. `SERIAL` stellt sicher, dass jede neue Notiz automatisch eine neue, eindeutige und numerische ID erhält.

### (Falls du einen Fremdschlüssel entworfen hast): Was ist der Zweck eines Fremdschlüssels, und welche Beziehung modelliert dein Fremdschlüssel?

In diesem Entwurf wurde **kein Fremdschlüssel** verwendet [...].

### Wie würden die API-Endpunkte deiner Backend-Anwendung [...] theoretisch auf die von dir formulierten SQL-Abfragen abgebildet werden? Welche Art von Abfrage [...] würde jeder Endpunkt typischerweise ausführen?

Bezogen auf die implementierten Endpunkte unter `/api/notes`:

*   **`GET /api/notes`:** Führt eine `SELECT`-Abfrage aus, um alle Zeilen aus der `notes`-Tabelle abzurufen.
*   **`GET /api/notes/:id`:** Führt eine `SELECT`-Abfrage mit einer `WHERE id = $1`-Klausel aus.
*   **`POST /api/notes`:** Führt eine `INSERT`-Abfrage mit den Daten aus dem Request Body aus.
*   **`PUT /api/notes/:id`:** Führt eine `UPDATE`-Abfrage aus, um die Zeile mit der spezifischen `id` zu aktualisieren.
*   **`DELETE /api/notes/:id`:** Führt eine `DELETE`-Abfrage aus, um die Zeile mit der spezifischen `id` zu entfernen.

### Warum ist die Nutzung einer Datenbank für persistente Daten wichtig im Kontext von containerisierten Anwendungen und DevOps?

1.  **Entkopplung von Zustand und Laufzeit:** [...]
2.  **Konsistenter Datenzugriff bei Skalierung:** [...]
3.  **Zuverlässige Backups und Wiederherstellung:** [...]

```