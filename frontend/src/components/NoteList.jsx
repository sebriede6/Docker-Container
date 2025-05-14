import React from 'react';
import NoteItem from './NoteItem';

function NoteList({ notes, onDeleteNote, onUpdateNote, onToggleComplete }) { 
  if (!Array.isArray(notes)) {
    console.warn("NoteList erhielt 'notes' nicht als Array:", notes);
    return <p>Notizdaten sind nicht im korrekten Format.</p>;
  }

  return (
    <ul style={{ listStyle: 'none', padding: 0 }}>
      {notes.map((note) => (
        <NoteItem
          key={note.id}
          note={note}
          onDelete={onDeleteNote}
          onUpdate={onUpdateNote}
          onToggle={onToggleComplete} 
        />
      ))}
    </ul>
  );
}

export default NoteList;