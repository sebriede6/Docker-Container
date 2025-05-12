import React, { useState } from 'react';
import './NoteItem.css'; 

function NoteItem({ note, onDelete, onUpdate, onToggle }) { // onToggle als Prop empfangen
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

  const handleCheckboxChange = () => {
    onToggle(note.id); // Rufe den Handler aus App.jsx auf
  };

  const textClassName = `note-item-text ${note.completed ? 'completed' : ''}`;

  return (
    <li className="note-item">
      {isEditing ? (
        <>
          <input
            type="text"
            value={editText}
            onChange={(e) => setEditText(e.target.value)}
            className="note-item-edit-input"
            autoFocus
          />
          <div className="note-item-actions">
             <button
               onClick={handleUpdate}
               className="note-item-button save"
             >
               Speichern
             </button>
             <button
               onClick={handleCancelEdit}
               className="note-item-button cancel"
             >
               Abbrechen
             </button>
          </div>
        </>
      ) : (
        <>
          <input
            type="checkbox"
            checked={note.completed}
            onChange={handleCheckboxChange}
            style={{ marginRight: '0.75rem', cursor: 'pointer' }} // Style für die Checkbox
          />
          <span className={textClassName}>{note.text}</span>
           <div className="note-item-actions">
            <button
              onClick={() => setIsEditing(true)}
              className="note-item-button edit"
            >
              Bearbeiten
            </button>
            <button
              onClick={() => onDelete(note.id)}
              className="note-item-button delete"
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