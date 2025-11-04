// Script para inicializar la base de datos MySQL
// Este script se ejecuta automáticamente al iniciar admin-service
const mysql = require('mysql2/promise');
const fs = require('fs');

const DB_SSL = process.env.DB_SSL === 'true';
const DB_SSL_CA_PATH = process.env.DB_SSL_CA_PATH;

const ssl = DB_SSL
  ? (DB_SSL_CA_PATH && fs.existsSync(DB_SSL_CA_PATH)
      ? { ca: fs.readFileSync(DB_SSL_CA_PATH), rejectUnauthorized: true }
      : { rejectUnauthorized: false })
  : undefined;

async function initDatabase() {
  let connection;
  try {
    connection = await mysql.createConnection({
      host: process.env.DB_HOST || 'localhost',
      port: Number(process.env.DB_PORT || 3306),
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || '',
      database: process.env.DB_NAME || 'hospitalservice',
      ssl: ssl,
      multipleStatements: true,
      connectTimeout: 60000 // 60 segundos timeout (mysql2 usa connectTimeout, no timeout)
    });

    console.log('✅ Conectado a MySQL. Verificando/creando tablas...');

    // Nota: El esquema real se crea manualmente o desde init-mysql-schema-real.sql
    // Este script solo verifica la conexión
    const initSQL = `
      USE ${process.env.DB_NAME || 'hospitalservice'};
      
      -- Solo verificar que las tablas existan (se crean desde script externo)
      SHOW TABLES;

      CREATE TABLE IF NOT EXISTS users (
        id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
        email VARCHAR(255) UNIQUE NOT NULL,
        name VARCHAR(100) NOT NULL,
        role VARCHAR(20) NOT NULL CHECK (role IN ('admin', 'medico', 'paciente')),
        is_active BOOLEAN DEFAULT TRUE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS pacientes (
        id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
        nombre VARCHAR(50) NOT NULL,
        apellido VARCHAR(50) NOT NULL,
        email VARCHAR(255) UNIQUE NOT NULL,
        telefono VARCHAR(15),
        fecha_nacimiento DATE NOT NULL,
        genero VARCHAR(10) NOT NULL CHECK (genero IN ('M', 'F', 'OTRO')),
        direccion TEXT,
        is_active BOOLEAN DEFAULT TRUE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS consultas (
        id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
        paciente_id VARCHAR(36) NOT NULL,
        medico_id VARCHAR(36) NOT NULL,
        fecha TIMESTAMP NOT NULL,
        motivo VARCHAR(200) NOT NULL,
        sintomas TEXT,
        diagnostico TEXT,
        tratamiento TEXT,
        observaciones TEXT,
        proxima_cita TIMESTAMP,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (paciente_id) REFERENCES pacientes(id) ON DELETE CASCADE,
        FOREIGN KEY (medico_id) REFERENCES users(id) ON DELETE CASCADE
      );

      CREATE TABLE IF NOT EXISTS citas (
        id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
        paciente_id VARCHAR(36) NOT NULL,
        medico_id VARCHAR(36) NOT NULL,
        fecha DATE NOT NULL,
        hora TIME NOT NULL,
        motivo VARCHAR(200) NOT NULL,
        estado VARCHAR(20) DEFAULT 'programada' CHECK (estado IN ('programada', 'confirmada', 'cancelada', 'completada')),
        observaciones TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (paciente_id) REFERENCES pacientes(id) ON DELETE CASCADE,
        FOREIGN KEY (medico_id) REFERENCES users(id) ON DELETE CASCADE
      );

      CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
      CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);
      CREATE INDEX IF NOT EXISTS idx_pacientes_email ON pacientes(email);
      CREATE INDEX IF NOT EXISTS idx_consultas_paciente_id ON consultas(paciente_id);
      CREATE INDEX IF NOT EXISTS idx_consultas_medico_id ON consultas(medico_id);
      CREATE INDEX IF NOT EXISTS idx_consultas_fecha ON consultas(fecha);
      CREATE INDEX IF NOT EXISTS idx_citas_paciente_id ON citas(paciente_id);
      CREATE INDEX IF NOT EXISTS idx_citas_medico_id ON citas(medico_id);
      CREATE INDEX IF NOT EXISTS idx_citas_fecha ON citas(fecha);
      CREATE INDEX IF NOT EXISTS idx_citas_estado ON citas(estado);
    `;

    await connection.query(initSQL);
    console.log('✅ Tablas verificadas/creadas exitosamente');

  } catch (error) {
    console.error('❌ Error al inicializar base de datos:', error.message);
    // No lanzamos el error para que el servicio pueda seguir intentando
  } finally {
    if (connection) {
      await connection.end();
    }
  }
}

module.exports = { initDatabase };

