const { app, initializeApp } = require('./src/app');
const { PORT, DATA_FILE } = require('./src/config');
const winston = require('winston');


const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info', 
  format: winston.format.combine(
    winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
    winston.format.errors({ stack: true }), 
    winston.format.splat(),
    winston.format.json() 
  ),
  defaultMeta: { service: 'backend-api' }, 
  transports: [
    new winston.transports.Console({
      format: winston.format.combine(
        winston.format.colorize(), 
        winston.format.simple() 
      )
    })
  ],
});

const startServer = async () => {
  try {
    logger.info('Attempting to initialize application data...');
    await initializeApp(); 
    logger.info('Application data initialized successfully.');

    logger.info('--- Database Configuration (from ENV) ---');
    logger.info('DB_HOST:', { value: process.env.DB_HOST || 'N/A' });
    logger.info('DB_PORT:', { value: process.env.DB_PORT || 'N/A' });
    logger.info('DB_USER:', { value: process.env.DB_USER || 'N/A' });
    logger.info('DB_NAME:', { value: process.env.DB_NAME || 'N/A' });
    logger.info('DB_PASSWORD:', { value: process.env.DB_PASSWORD ? '[REDACTED]' : 'N/A' });
    logger.info('-------------------------------------------');

    app.listen(PORT, '0.0.0.0', () => {
      logger.info(`Backend API läuft auf Port ${PORT}`);
      logger.info(`Daten werden in/aus ${DATA_FILE} gelesen/geschrieben (Dateipersistenz).`);
      logger.info(`(Hinweis: Datenbankverbindung ist in dieser Aufgabe noch nicht implementiert.)`);
    });
  } catch (error) {
    logger.error("Kritischer Fehler beim Starten des Servers:", error);
    process.exit(1);
  }
};

startServer();