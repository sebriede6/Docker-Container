import React, { useState } from 'react';

function NoteItem({ note, onDelete, onUpdate }) {
  const [isEditing, setIsEditing] = useState(false);
  const [editText, setEditText] = useState(note.text);

  const handleUpdate = () => {
    if (editText.trim() && editText.trim() !== note.text) {
      onUpdate(note.id, editText.trim());
    }
    setIsEditing(false);
  };

  const handleCancelEdit = () => {
    setEditText(note.text);
    setIsEditing(false);
  };

  return (
    <li
      style={{
        backgroundColor: '#3a3a3a',
        marginBottom: '0.5rem',
        border: '1px solid #ccc',
        padding: '0.75rem 1rem',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        borderRadius: '4px',
        wordBreak: 'break-word'
      }}
    >
      {isEditing ? (
        <>
          <input
            type="text"
            value={editText}
            onChange={(e) => setEditText(e.target.value)}
            style={{
              flexGrow: 1,
              marginRight: '0.5rem',
              padding: '0.4rem 0.6rem',
              border: '1px solid #ccc',
              borderRadius: '4px',
              backgroundColor: '#fff',
              color: '#213547'
            }}
            autoFocus
          />
          <div>
            <button
              onClick={handleUpdate}
              style={{
                marginRight: '0.5rem',
                backgroundColor: '#48bb78',
                border: 'none',
                padding: '0.3rem 0.8rem',
                borderRadius: '4px',
                cursor: 'pointer',
                color: '#fff'
              }}
            >
              Speichern
            </button>
            <button
              onClick={handleCancelEdit}
              style={{
                backgroundColor: '#718096',
                border: 'none',
                padding: '0.3rem 0.8rem',
                borderRadius: '4px',
                cursor: 'pointer',
                color: '#fff'
              }}
            >
              Abbrechen
            </button>
          </div>
        </>
      ) : (
        <>
          <span style={{ flexGrow: 1, marginRight: '1rem' }}>{note.text}</span>
          <div>
            <button
              onClick={() => setIsEditing(true)}
              style={{
                padding: '0.3rem 0.8rem',
                backgroundColor: '#4a5568',
                border: 'none',
                cursor: 'pointer',
                marginRight: '0.5rem',
                color: '#ffffff',
                borderRadius: '4px'
              }}
            >
              Bearbeiten
            </button>
            <button
              onClick={() => onDelete(note.id)}
              style={{
                padding: '0.3rem 0.8rem',
                backgroundColor: '#e53e3e',
                border: 'none',
                cursor: 'pointer',
                color: '#ffffff',
                borderRadius: '4px'
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
