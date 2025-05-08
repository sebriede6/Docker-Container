import React, { useState } from 'react';

function NoteItem({ note, onDelete, onUpdate }) {
  const [isEditing, setIsEditing] = useState(false);
  const [editText, setEditText] = useState(note.text);

  const handleUpdate = () => {
    if (editText.trim() && editText.trim() !== note.text) {
      onUpdate(note.id, editText.trim());
    }
    setIsEditing(false); // Bearbeitungsmodus beenden
  };

  const handleCancelEdit = () => {
    setEditText(note.text); // Text zurücksetzen
    setIsEditing(false);
  };

  return (
    <li
      style={{
        marginBottom: '0.5rem',
        border: '1px solid #ccc',
        padding: '0.5rem',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
      }}
    >
      {isEditing ? (
        // Ansicht im Bearbeitungsmodus
        <>
          <input
            type="text"
            value={editText}
            onChange={(e) => setEditText(e.target.value)}
            style={{ flexGrow: 1, marginRight: '0.5rem' }}
            autoFocus 
          />
          <button
            onClick={handleUpdate}
            style={{ marginRight: '0.5rem', backgroundColor: '#008000' /* Hellgrün */ }}
          >
            Speichern
          </button>
          <button
            onClick={handleCancelEdit}
            style={{ backgroundColor: '#1F2937' /* Hellgrau */ }}
          >
            Abbrechen
          </button>
        </>
      ) : (
        
        <>
          <span>{note.text}</span>
          <div>
            <button
              onClick={() => setIsEditing(true)} 
              style={{
                padding: '0.2rem 0.5rem',
                backgroundColor: '#1F2937',
                border: 'none',
                cursor: 'pointer',
                marginRight: '0.5rem',
                color: '#000',
              }}
            >
              Bearbeiten
            </button>
            <button
              onClick={() => onDelete(note.id)}
              style={{
                padding: '0.2rem 0.5rem',
                backgroundColor: '#FF0000',
                border: 'none',
                cursor: 'pointer',
              }}
            >
              Löschen
            </button>
          </div>
        </>
      )}
    </li>
  );
}

export default NoteItem;