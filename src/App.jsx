// src/App.jsx
import React, { useState, useEffect } from 'react';
import NoteForm from './components/NoteForm';
import NoteList from './components/NoteList';
import './App.css'; // Behalte oder passe die CSS-Datei an

function App() {
  const [notes, setNotes] = useState(() => {
    // Versuche, Notizen aus dem LocalStorage zu laden
    const savedNotes = localStorage.getItem('react-docker-notes');
    return savedNotes ? JSON.parse(savedNotes) : [];
  });

  // Speichere Notizen im LocalStorage, wenn sie sich ändern
  useEffect(() => {
    localStorage.setItem('react-docker-notes', JSON.stringify(notes));
  }, [notes]); // Dieser Effekt läuft, wenn sich 'notes' ändert

  const addNote = (noteText) => {
    setNotes([...notes, noteText]); // Füge neue Notiz am Ende hinzu
  };

  const deleteNote = (indexToDelete) => {
    setNotes(notes.filter((_, index) => index !== indexToDelete)); // Erstelle neues Array ohne das Element am indexToDelete
  };

  return (
    <div className="App">
      <h1>Mini Notizblock</h1>
      <NoteForm onAddNote={addNote} />
      {notes.length > 0 ? (
        <NoteList notes={notes} onDeleteNote={deleteNote} />
      ) : (
        <p>Noch keine Notizen vorhanden.</p>
      )}
    </div>
  );
}

export default App;