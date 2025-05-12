import fs from 'node:fs/promises';
import { DATA_DIR, DATA_FILE } from '../config/index.js';

const ensureDataDirExists = async () => {
  try {
    await fs.access(DATA_DIR);
  } catch (error) {
    if (error.code === 'ENOENT') {
      try {
        await fs.mkdir(DATA_DIR, { recursive: true });
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
    await fs.access(DATA_FILE);
    const fileData = await fs.readFile(DATA_FILE, 'utf-8');
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
    await fs.writeFile(DATA_FILE, JSON.stringify(notesToSave, null, 2), 'utf-8');
  } catch (error) {
    console.error(`Error saving notes to ${DATA_FILE}:`, error);
    throw error;
  }
};

export { loadNotes, saveNotes };