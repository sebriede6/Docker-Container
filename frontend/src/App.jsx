import React, { useState, useEffect } from 'react';
import NoteForm from './components/NoteForm';
import NoteList from './components/NoteList';
import { getNotes, addNote, deleteNote } from './apiClient'; 
import './App.css';

function App() {
  const [notes, setNotes] = useState([]); 
  const [loading, setLoading] = useState(true); 
  const [error, setError] = useState(null); 


  useEffect(() => {
    setLoading(true);
    setError(null);
    getNotes()
      .then(response => {
        // Axios: response.data; Fetch: direkt die Daten
        setNotes(response.data || response);
      })
      .catch(err => {
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
      .then(response => {

        setNotes([...notes, response.data || response]); 
      })
      .catch(err => {
        console.error("Fehler beim Hinzufügen der Notiz:", err);
        setError("Fehler beim Hinzufügen der Notiz.");
      });
  };

  const handleDeleteNote = (idToDelete) => {
    setError(null);
    deleteNote(idToDelete)
      .then(() => {
        setNotes(notes.filter((note) => note.id !== idToDelete)); // Filtere die gelöschte Notiz raus
      })
      .catch(err => {
        console.error("Fehler beim Löschen der Notiz:", err);
        setError("Fehler beim Löschen der Notiz.");
      });
  };

  return (
    <div className="App">
      <h1>Mini Notizblock (Full-Stack)</h1>
      <NoteForm onAddNote={handleAddNote} />

      {loading && <p>Lade Notizen...</p>}
      {error && <p style={{ color: 'red' }}>{error}</p>}

      {!loading && !error && notes.length > 0 ? (
        
        <NoteList notes={notes} onDeleteNote={handleDeleteNote} />
      ) : null}
       {!loading && !error && notes.length === 0 && <p>Keine Notizen vom Backend geladen.</p>}

    </div>
  );
}

export default App;