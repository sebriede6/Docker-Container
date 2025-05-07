const fs = require('node:fs');
const { DATA_DIR, DATA_FILE } = require('../config'); // Importiere aus unserer Config

const ensureDataDirExists = async () => {
  try {
    await fs.promises.access(DATA_DIR);
  } catch (error) {
    if (error.code === 'ENOENT') {
      console.log(`Datenverzeichnis ${DATA_DIR} nicht gefunden. Erstelle es...`);
      try {
        await fs.promises.mkdir(DATA_DIR, { recursive: true });
        console.log(`Datenverzeichnis ${DATA_DIR} erfolgreich erstellt.`);
      } catch (mkdirError) {
        console.error(`Fehler beim Erstellen des Datenverzeichnisses ${DATA_DIR}:`, mkdirError);
        throw mkdirError;
      }
    } else {
      console.error(`Unerwarteter Fehler beim Zugriff auf ${DATA_DIR}:`, error);
      throw error;
    }
  }
};

const loadNotes = async () => { // Umbenannt von loadNotesFromFile
  await ensureDataDirExists();
  try {
    await fs.promises.access(DATA_FILE);
    const fileData = await fs.promises.readFile(DATA_FILE, 'utf-8');
    console.log(`Notizen erfolgreich aus ${DATA_FILE} geladen.`);
    return JSON.parse(fileData);
  } catch (error) {
    if (error.code === 'ENOENT') {
      console.log(`${DATA_FILE} nicht gefunden. Initialisiere mit leeren Notizen.`);
      return [];
    }
    console.error(`Fehler beim Laden der Notizen aus ${DATA_FILE}:`, error);
    return [];
  }
};

const saveNotes = async (notesToSave) => { // Umbenannt von saveNotesToFile
  await ensureDataDirExists();
  try {
    await fs.promises.writeFile(DATA_FILE, JSON.stringify(notesToSave, null, 2), 'utf-8');
    console.log(`Notizen erfolgreich in ${DATA_FILE} gespeichert.`);
  } catch (error) {
    console.error(`Fehler beim Speichern der Notizen in ${DATA_FILE}:`, error);
    throw error; 
  }
};

module.exports = {
  loadNotes,
  saveNotes,
};