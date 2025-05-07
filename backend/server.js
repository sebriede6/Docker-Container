const { app, initializeApp, PORT } = require("./src/app");
const { DATA_FILE } = require("./src/config");

const start = async () => {
  try {
    await initializeApp();

    app.listen(PORT, () => {
      console.log(`Backend API läuft auf http://localhost:${PORT}`);
      console.log(`Daten werden in/aus ${DATA_FILE} gelesen/geschrieben.`);
    });
  } catch (error) {
    console.error("Kritischer Fehler beim Starten des Servers:", error);
    process.exit(1);
  }
};

start();
