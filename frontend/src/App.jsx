import React, { useState, useEffect } from 'react';
import NoteForm from './components/NoteForm';
import NoteList from './components/NoteList'; // Verwendet jetzt NoteItem intern
import { getNotes, addNote, updateNote, deleteNote } from './apiClient'; // API-Funktionen
import './App.css';

const API_BASE_URL = '/api';

function App() {
  const [notes, setNotes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    setLoading(true);
    setError(null);
    // Verwende die importierte Funktion
    getNotes()
      .then((response) => {
        // Axios gibt Daten in response.data zurück
        setNotes(Array.isArray(response.data) ? response.data : []);
      })
      .catch((err) => {
        console.error('Fehler beim Laden der Notizen:', err);
        setError('Fehler beim Laden der Notizen vom Backend.');
        setNotes([]);
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  const handleAddNote = (noteText) => {
    setError(null);
    // Verwende die importierte Funktion
    addNote(noteText)
      .then((response) => {
        setNotes((prevNotes) => [...prevNotes, response.data || response]);
      })
      .catch((err) => {
        console.error('Fehler beim Hinzufügen der Notiz:', err);
        setError('Fehler beim Hinzufügen der Notiz.');
      });
  };

  // Umbenannt von handleEditNote und ruft updateNote auf
  const handleUpdateNote = (idToUpdate, newText) => {
    setError(null);
    // Verwende die importierte Funktion
    updateNote(idToUpdate, newText)
      .then((response) => {
        setNotes((prevNotes) =>
          prevNotes.map((note) =>
            note.id === idToUpdate ? (response.data || response) : note
          )
        );
      })
      .catch((err) => {
        console.error('Fehler beim Aktualisieren der Notiz:', err);
        setError('Fehler beim Aktualisieren der Notiz.');
      });
  };

  const handleDeleteNote = (idToDelete) => {
    setError(null);
    // Verwende die importierte Funktion
    deleteNote(idToDelete)
      .then(() => {
        setNotes((prevNotes) =>
          prevNotes.filter((note) => note.id !== idToDelete)
        );
      })
      .catch((err) => {
        console.error('Fehler beim Löschen der Notiz:', err);
        setError('Fehler beim Löschen der Notiz.');
      });
  };

  return (
    <div className="App">
      <h1>Mini Notizblock (Full-Stack)</h1>
      <NoteForm onAddNote={handleAddNote} />

      {loading && <p>Lade Notizen...</p>}
      {error && <p style={{ color: 'red' }}>{error}</p>}

      {!loading && !error && (
        // Übergib handleUpdateNote als onUpdateNote Prop
        <NoteList
          notes={notes}
          onDeleteNote={handleDeleteNote}
          onUpdateNote={handleUpdateNote}
        />
      )}
      {!loading && !error && notes.length === 0 && (
        <p style={{ marginTop: '1em', fontStyle: 'italic' }}>
          Keine Notizen vorhanden. Füge eine hinzu!
        </p>
      )}
    </div>
  );
}

export default App;