const fs = require('node:fs');
const { DATA_DIR, DATA_FILE } = require('../config');

const ensureDataDirExists = async () => {
  try {
    await fs.promises.access(DATA_DIR);
  } catch (error) {
    if (error.code === 'ENOENT') {
      try {
        await fs.promises.mkdir(DATA_DIR, { recursive: true });
      } catch (mkdirError) {
        console.error(`Error creating data directory ${DATA_DIR}:`, mkdirError);
        throw mkdirError;
      }
    } else {
      console.error(`Unexpected error accessing ${DATA_DIR}:`, error);
      throw error;
    }
  }
};

const loadNotes = async () => {
  await ensureDataDirExists();
  try {
    await fs.promises.access(DATA_FILE);
    const fileData = await fs.promises.readFile(DATA_FILE, 'utf-8');
    return JSON.parse(fileData);
  } catch (error) {
    if (error.code === 'ENOENT') {
      return [];
    }
    console.error(`Error loading notes from ${DATA_FILE}:`, error);
    return [];
  }
};

const saveNotes = async (notesToSave) => {
  await ensureDataDirExists();
  try {
    await fs.promises.writeFile(DATA_FILE, JSON.stringify(notesToSave, null, 2), 'utf-8');
  } catch (error) {
    console.error(`Error saving notes to ${DATA_FILE}:`, error);
    throw error;
  }
};

module.exports = {
  loadNotes,
  saveNotes,
};