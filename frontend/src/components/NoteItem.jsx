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
            autoFocus // Fokussiere das Input-Feld direkt
          />
          <button
            onClick={handleUpdate}
            style={{ marginRight: '0.5rem', backgroundColor: '#90EE90' /* Hellgrün */ }}
          >
            Speichern
          </button>
          <button
            onClick={handleCancelEdit}
            style={{ backgroundColor: '#D3D3D3' /* Hellgrau */ }}
          >
            Abbrechen
          </button>
        </>
      ) : (
        // Ansicht im Anzeigemodus
        <>
          <span>{note.text}</span>
          <div>
            <button
              onClick={() => setIsEditing(true)} // Starte Bearbeitungsmodus
              style={{
                padding: '0.2rem 0.5rem',
                backgroundColor: '#FFFF00',
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