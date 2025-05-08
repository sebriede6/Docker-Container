import React from "react";

function NoteList({ notes, onDeleteNote }) {
  return (
    <ul style={{ listStyle: "none", padding: 0 }}>
      {notes.map(
        (
          note, 
        ) => (
          <li
            key={note.id}
            style={{
              marginBottom: "0.5rem",
              border: "1px solid #ccc",
              padding: "0.5rem",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <span>{note.text}</span> {/* Zeige note.text an */}
            <button
              onClick={() => onDeleteNote(note.id)}
              style={{
                padding: "0.2rem 0.5rem",
                backgroundColor: "#FF0000",
                border: "none",
                cursor: "pointer",
              }}
            >
              Löschen
            </button>
          </li>
        ),
      )}
    </ul>
  );
}

export default NoteList;
