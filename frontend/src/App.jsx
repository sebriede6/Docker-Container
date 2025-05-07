// frontend/src/App.jsx
import React, { useState, useEffect } from "react";
import NoteForm from "./components/NoteForm";
import NoteList from "./components/NoteList";
import { getNotes, addNote, deleteNote } from "./apiClient";
import "./App.css";

const ALWAYS_VISIBLE_TEST_NOTE = { id: "always-visible-test", text: "Dies ist eine immer sichtbare Testnotiz (nur Frontend)." };

function App() {
  const [notesFromBackend, setNotesFromBackend] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    setLoading(true);
    setError(null);
    getNotes()
      .then((response) => {
        setNotesFromBackend(response.data || response);
      })
      .catch((err) => {
        console.error("Fehler beim Laden der Notizen:", err);
        setError("Fehler beim Laden der Notizen vom Backend.");
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  const handleAddNote = (noteText) => {
    setError(null);
    addNote(noteText)
      .then((response) => {
        setNotesFromBackend(prevNotes => [...prevNotes, response.data || response]);
      })
      .catch((err) => {
        console.error("Fehler beim Hinzufügen der Notiz:", err);
        setError("Fehler beim Hinzufügen der Notiz.");
      });
  };

  const handleDeleteNote = (idToDelete) => {
    if (idToDelete === ALWAYS_VISIBLE_TEST_NOTE.id) {
      console.warn("Die immer sichtbare Testnotiz kann nicht gelöscht werden.");
      return;
    }
    setError(null);
    deleteNote(idToDelete)
      .then(() => {
        setNotesFromBackend(prevNotes => prevNotes.filter((note) => note.id !== idToDelete));
      })
      .catch((err) => {
        console.error("Fehler beim Löschen der Notiz:", err);
        setError("Fehler beim Löschen der Notiz.");
      });
  };

  const notesToDisplay = [ALWAYS_VISIBLE_TEST_NOTE, ...notesFromBackend];

  return (
    <div className="App">
      <h1>Mini Notizblock (Full-Stack)</h1>
      <NoteForm onAddNote={handleAddNote} />

      {loading && <p>Lade Notizen...</p>}
      {error && <p style={{ color: "red" }}>{error}</p>}

      {!loading && !error && (
        <NoteList notes={notesToDisplay} onDeleteNote={handleDeleteNote} />
      )}
      {!loading && !error && notesFromBackend.length === 0 && notesToDisplay.length > 0 && (
         <p style={{marginTop: "1em", fontStyle: "italic"}}>Keine weiteren Notizen vom Backend geladen.</p>
      )}
       {!loading && error && notesToDisplay.length > 0 && (
        <>
          <NoteList notes={[ALWAYS_VISIBLE_TEST_NOTE]} onDeleteNote={handleDeleteNote} />
          <p style={{marginTop: "1em", fontStyle: "italic"}}>Backend-Notizen konnten nicht geladen werden.</p>
        </>
      )}
    </div>
  );
}

export default App;