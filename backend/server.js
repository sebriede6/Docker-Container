import app, { PORT } from './src/app.js';

import { testConnection } from './src/db/index.js';
import { logger } from './src/utils/logger.js';



const startServer = async () => {
  try {
    logger.info('Attempting to connect to database...');
    await testConnection(); 
    logger.info('Database connection verified.');

    logger.info('--- Database Configuration (from ENV) ---');
    logger.info('DB_HOST:', { value: process.env.DB_HOST || 'N/A' });
    logger.info('DB_PORT:', { value: process.env.DB_PORT || 'N/A' });
    logger.info('DB_USER:', { value: process.env.DB_USER || 'N/A' });
    logger.info('DB_NAME:', { value: process.env.DB_NAME || 'N/A' });
    logger.info('DB_PASSWORD:', { value: process.env.DB_PASSWORD ? '[REDACTED]' : 'N/A' });
    logger.info('-------------------------------------------');

    app.listen(PORT, '0.0.0.0', () => {
      logger.info(`Backend API läuft auf Port ${PORT}`);
      logger.info(`Verbunden mit PostgreSQL Datenbank: ${process.env.DB_NAME}@${process.env.DB_HOST}:${process.env.DB_PORT}`);
    });
  } catch (error) {
    
    logger.error("Kritischer Fehler beim Starten des Servers (DB-Verbindung fehlgeschlagen?). Server wird beendet.", { error: error.message });
    process.exit(1); 
  }
};

startServer();