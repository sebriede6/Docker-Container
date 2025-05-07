import React, { useState } from "react";

function NoteForm({ onAddNote }) {
  const [noteText, setNoteText] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    if (noteText.trim()) {
      onAddNote(noteText);
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
      />
      <button type="submit" style={{ padding: "0.5rem" }}>
        Hinzufügen
      </button>
    </form>
  );
}

export default NoteForm;
