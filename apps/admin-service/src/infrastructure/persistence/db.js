// Pool de MySQL para reusar conexiones
const mysql = require('mysql2/promise');
const fs = require('fs');

const DB_SSL = process.env.DB_SSL === 'true';
const DB_SSL_CA_PATH = process.env.DB_SSL_CA_PATH;

const ssl = DB_SSL
  ? (DB_SSL_CA_PATH && fs.existsSync(DB_SSL_CA_PATH)
      ? { ca: fs.readFileSync(DB_SSL_CA_PATH), rejectUnauthorized: true }
      : { rejectUnauthorized: false }) // Permitir certificados auto-firmados
  : undefined;

const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  port: Number(process.env.DB_PORT || 3306),
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'hospitalservice',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  namedPlaceholders: true,
  ssl
});

module.exports = { pool };
