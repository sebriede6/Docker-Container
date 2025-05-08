import React from 'react';
import NoteItem from './NoteItem'; // Importiere die neue Komponente

// Die onEditNote Prop wird jetzt zur onUpdateNote
function NoteList({ notes, onDeleteNote, onUpdateNote }) {
  if (!Array.isArray(notes)) {
    console.warn("NoteList erhielt 'notes' nicht als Array:", notes);
    return <p>Notizdaten sind nicht im korrekten Format.</p>;
  }

  return (
    <ul style={{ listStyle: 'none', padding: 0 }}>
      {notes.map((note) => (
        // Rendere für jede Notiz eine NoteItem Komponente
        <NoteItem
          key={note.id}
          note={note}
          onDelete={onDeleteNote} // onDeleteNote wird weitergegeben
          onUpdate={onUpdateNote} // onUpdateNote wird weitergegeben
        />
      ))}
    </ul>
  );
}

export default NoteList;