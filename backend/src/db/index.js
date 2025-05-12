import pg from 'pg';
import { logger } from '../utils/logger.js'; 

const { Pool } = pg;

const pool = new Pool({
  host: process.env.DB_HOST || 'database',
  port: process.env.DB_PORT ? parseInt(process.env.DB_PORT, 10) : 5432,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,

});

pool.on('connect', (client) => {
  logger.info('DB Pool: New client connected');
});

pool.on('acquire', (client) => {
    logger.debug('DB Pool: Client acquired');
});

pool.on('remove', (client) => {
    logger.info('DB Pool: Client removed');
  });

pool.on('error', (err, client) => {
  logger.error('DB Pool: Unexpected error on idle client', { error: err.message, stack: err.stack });

});


const testConnection = async () => {
    let client = null;
    try {
        client = await pool.connect();
        logger.info('Successfully connected to the database.');
        await client.query('SELECT NOW()'); 
        logger.info('Database test query successful.');
    } catch (error) {
        logger.error('Failed to connect to the database or test query failed.', {
            error: error.message,
            stack: error.stack,
            db_host: process.env.DB_HOST,
            db_port: process.env.DB_PORT,
            db_user: process.env.DB_USER,
            db_name: process.env.DB_NAME,
        });
       
        throw error;
    } finally {
        if (client) {
            client.release(); 
        }
    }
};


export default pool;
export { testConnection };