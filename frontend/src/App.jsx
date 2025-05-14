import React, { useState, useEffect } from 'react';
import NoteForm from './components/NoteForm';
import NoteList from './components/NoteList';
import ThemeSwitcher from './components/ThemeSwitcher';
import FlyingNote from './components/FlyingNote';
import { getNotes, addNote, updateNote, deleteNote, toggleNoteCompleted } from './apiClient';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import './App.css';

function App() {
  const [notes, setNotes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [sortOrder, setSortOrder] = useState('newest');
  const [flyingNoteData, setFlyingNoteData] = useState(null);

  useEffect(() => {
    setLoading(true);
    getNotes()
      .then((response) => {
        setNotes(Array.isArray(response.data) ? response.data : []);
      })
      .catch((err) => {
        console.error('Fehler beim Laden der Notizen:', err);
        toast.error("Fehler beim Laden der Notizen!");
        setNotes([]);
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  const handleAddNote = (noteText, startPos) => {
    addNote(noteText)
      .then((response) => {
        const newNote = response.data;
        setNotes((prevNotes) => [...prevNotes, newNote]);
        toast.success("Notiz hinzugefügt!");
        setFlyingNoteData({ id: Date.now(), text: newNote.text, startPos: startPos });
      })
      .catch((err) => {
        console.error('Fehler beim Hinzufügen:', err);
        toast.error("Fehler beim Hinzufügen der Notiz.");
      });
  };

  const handleUpdateNote = (idToUpdate, newText) => {
    updateNote(idToUpdate, newText)
      .then((response) => {
        const updatedNote = response.data;
        setNotes((prevNotes) =>
          prevNotes.map((note) => (note.id === idToUpdate ? updatedNote : note))
        );
        toast.info("Notiz aktualisiert!");
        setFlyingNoteData({ id: Date.now(), text: updatedNote.text, startPos: null });
      })
      .catch((err) => {
        console.error('Fehler beim Aktualisieren:', err);
        toast.error("Fehler beim Aktualisieren der Notiz.");
      });
  };

  const handleDeleteNote = (idToDelete) => {
    deleteNote(idToDelete)
      .then(() => {
        setNotes((prevNotes) => prevNotes.filter((note) => note.id !== idToDelete));
        toast.warn("Notiz gelöscht.");
      })
      .catch((err) => {
        console.error('Fehler beim Löschen:', err);
        toast.error("Fehler beim Löschen der Notiz.");
      });
  };

  const handleToggleComplete = (idToToggle) => {
    toggleNoteCompleted(idToToggle)
      .then((response) => {
        setNotes((prevNotes) =>
          prevNotes.map((note) => (note.id === idToToggle ? response.data : note))
        );
      })
      .catch((err) => {
        console.error('Fehler beim Umschalten:', err);
        toast.error("Fehler beim Ändern des Status.");
      });
  };

  const handleFlyingNoteAnimationComplete = () => {
    setFlyingNoteData(null);
  };

  const processedNotes = notes
    .filter(note =>
      note.text.toLowerCase().includes(searchTerm.toLowerCase())
    )
    .filter(note => {
      if (filterStatus === 'completed') return note.completed;
      if (filterStatus === 'open') return !note.completed;
      return true;
    })
    .sort((a, b) => {
      switch (sortOrder) {
        case 'oldest':
          return new Date(a.created_at) - new Date(b.created_at);
        case 'az':
          return a.text.localeCompare(b.text, undefined, { sensitivity: 'base' });
        case 'za':
          return b.text.localeCompare(a.text, undefined, { sensitivity: 'base' });
        case 'newest':
        default:
          return new Date(b.created_at) - new Date(a.created_at);
      }
    });

  return (
    <div className="App">
      <ThemeSwitcher />
      <ToastContainer
          position="top-right"
          autoClose={3000}
          hideProgressBar={false}
          newestOnTop={false}
          closeOnClick
          rtl={false}
          pauseOnFocusLoss
          draggable
          pauseOnHover
          theme="colored"
      />

      {flyingNoteData && (
        <FlyingNote
          key={flyingNoteData.id}
          text={flyingNoteData.text}
          startPosition={flyingNoteData.startPos}
          onAnimationComplete={handleFlyingNoteAnimationComplete}
        />
      )}

      <h1>Mini Notizblock</h1>
      <NoteForm onAddNote={handleAddNote} />
      <div style={{ margin: '1rem 0' }}>
        <input
          type="search"
          placeholder="Notizen durchsuchen..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          style={{ padding: '0.5rem', minWidth: '300px', marginRight: '1rem' }}
          className="themed-input"
        />
      </div>
      <div style={{ margin: '1rem 0', display: 'flex', gap: '1rem', alignItems: 'center', flexWrap: 'wrap' }}>
        <div>
          <span>Filtern: </span>
          <button
            className={`filter-button ${filterStatus === 'all' ? 'active' : ''}`}
            onClick={() => setFilterStatus('all')}
          >
            Alle
          </button>
          <button
            className={`filter-button ${filterStatus === 'open' ? 'active' : ''}`}
            onClick={() => setFilterStatus('open')}
          >
            Offen
          </button>
          <button
            className={`filter-button ${filterStatus === 'completed' ? 'active' : ''}`}
            onClick={() => setFilterStatus('completed')}
          >
            Erledigt
          </button>
        </div>
        <div>
          <span>Sortieren: </span>
          <select value={sortOrder} onChange={(e) => setSortOrder(e.target.value)} style={{ padding: '0.4rem' }} className="themed-select">
            <option value="newest">Neueste zuerst</option>
            <option value="oldest">Älteste zuerst</option>
            <option value="az">A-Z</option>
            <option value="za">Z-A</option>
          </select>
        </div>
      </div>
      {loading && <p>Lade Notizen...</p>}
      {!loading && (
        <NoteList
          notes={processedNotes}
          onDeleteNote={handleDeleteNote}
          onUpdateNote={handleUpdateNote}
          onToggleComplete={handleToggleComplete}
        />
      )}
      {!loading && processedNotes.length === 0 && notes.length > 0 && (
         <p style={{ marginTop: '1em', fontStyle: 'italic' }}>
           Keine Notizen für die aktuellen Filter/Suchkriterien gefunden.
         </p>
      )}
      {!loading && notes.length === 0 && (
        <p style={{ marginTop: '1em', fontStyle: 'italic' }}>
          Keine Notizen vorhanden. Füge eine hinzu!
        </p>
      )}
    </div>
  );
}

export default App;