
import React from 'react';

function NoteList({ notes, onDeleteNote }) {
  return (
    <ul style={{ listStyle: 'none', padding: 0 }}>
      {notes.map((note, index) => (
        <li key={index} style={{ marginBottom: '0.5rem', border: '1px solid #ccc', padding: '0.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span>{note}</span>
          <button onClick={() => onDeleteNote(index)} style={{ padding: '0.2rem 0.5rem', backgroundColor: '#ffdddd', border: 'none', cursor: 'pointer' }}>
            Löschen
          </button>
        </li>
      ))}
    </ul>
  );
}

export default NoteList;