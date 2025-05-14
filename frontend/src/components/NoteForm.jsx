import React, { useState, useRef } from "react";

function NoteForm({ onAddNote }) {
  const [noteText, setNoteText] = useState("");
  const addButtonRef = useRef(null);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (noteText.trim()) {
      let startPosition = null;
      if (addButtonRef.current) {
        const rect = addButtonRef.current.getBoundingClientRect();
        startPosition = {
          x: rect.left + rect.width / 2,
          y: rect.top + rect.height / 2,
        };
      }
      onAddNote(noteText, startPosition);
      setNoteText("");
    }
  };

  return (
    <form onSubmit={handleSubmit} style={{ marginBottom: "1rem" }}>
      <input
        type="text"
        value={noteText}
        onChange={(e) => setNoteText(e.target.value)}
        placeholder="Neue Notiz eingeben..."
        style={{ marginRight: "0.5rem", padding: "0.5rem" }}
        className="themed-input"
      />
      <button
        type="submit"
        ref={addButtonRef}
        style={{ padding: "0.5rem" }}
      >
        Hinzufügen
      </button>
    </form>
  );
}

export default NoteForm;