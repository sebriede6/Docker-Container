const path = require("node:path");

const PORT = process.env.PORT || 3000;

const DATA_DIR = path.join(__dirname, "..", "..", "data");
const DATA_FILE = path.join(DATA_DIR, "notes.json");

module.exports = {
  PORT,
  DATA_DIR,
  DATA_FILE,
};
