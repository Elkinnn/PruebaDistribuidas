-- Script de inicialización REAL para MySQL
-- Basado en el esquema funcional proporcionado

-- Usar la base de datos hospitalservice (ya creada por variables de entorno)
USE hospitalservice;

-- Tabla usuario (sin FK a medico aún, se agregará después)
CREATE TABLE IF NOT EXISTS usuario (
    id INT(11) NOT NULL AUTO_INCREMENT,
    email VARCHAR(150) NOT NULL,
    password TEXT NOT NULL,
    rol ENUM('ADMIN_GLOBAL','MEDICO') NOT NULL,
    medicoId INT(11) DEFAULT NULL,
    activo TINYINT(1) NOT NULL DEFAULT 1,
    PRIMARY KEY (id),
    UNIQUE KEY uk_usuario_email (email),
    UNIQUE KEY uk_usuario_medico (medicoId)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- Tabla hospital
CREATE TABLE IF NOT EXISTS hospital (
    id INT(11) NOT NULL AUTO_INCREMENT,
    nombre VARCHAR(150) NOT NULL,
    direccion TEXT DEFAULT NULL,
    telefono VARCHAR(50) DEFAULT NULL,
    activo TINYINT(1) NOT NULL DEFAULT 1,
    PRIMARY KEY (id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- Tabla especialidad
CREATE TABLE IF NOT EXISTS especialidad (
    id INT(11) NOT NULL AUTO_INCREMENT,
    nombre VARCHAR(100) NOT NULL,
    descripcion TEXT DEFAULT NULL,
    PRIMARY KEY (id),
    UNIQUE KEY uk_especialidad_nombre (nombre)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- Tabla hospitalespecialidad
CREATE TABLE IF NOT EXISTS hospitalespecialidad (
    id INT(11) NOT NULL AUTO_INCREMENT,
    hospitalId INT(11) NOT NULL,
    especialidadId INT(11) NOT NULL,
    PRIMARY KEY (id),
    UNIQUE KEY uk_hosp_esp (hospitalId, especialidadId),
    KEY fk_he_especialidad (especialidadId),
    CONSTRAINT fk_he_hospital FOREIGN KEY (hospitalId) REFERENCES hospital(id) ON DELETE CASCADE,
    CONSTRAINT fk_he_especialidad FOREIGN KEY (especialidadId) REFERENCES especialidad(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- Tabla medico
CREATE TABLE IF NOT EXISTS medico (
    id INT(11) NOT NULL AUTO_INCREMENT,
    hospitalId INT(11) NOT NULL,
    nombres VARCHAR(100) NOT NULL,
    apellidos VARCHAR(100) NOT NULL,
    email VARCHAR(150) NOT NULL,
    activo TINYINT(1) NOT NULL DEFAULT 1,
    PRIMARY KEY (id),
    UNIQUE KEY uk_medico_hospital_email (hospitalId, email),
    CONSTRAINT fk_medico_hospital FOREIGN KEY (hospitalId) REFERENCES hospital(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- Tabla medicoespecialidad
CREATE TABLE IF NOT EXISTS medicoespecialidad (
    id INT(11) NOT NULL AUTO_INCREMENT,
    medicoId INT(11) NOT NULL,
    especialidadId INT(11) NOT NULL,
    PRIMARY KEY (id),
    UNIQUE KEY uk_med_esp (medicoId, especialidadId),
    KEY fk_me_especialidad (especialidadId),
    CONSTRAINT fk_me_medico FOREIGN KEY (medicoId) REFERENCES medico(id) ON DELETE CASCADE,
    CONSTRAINT fk_me_especialidad FOREIGN KEY (especialidadId) REFERENCES especialidad(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- Tabla paciente
CREATE TABLE IF NOT EXISTS paciente (
    id INT(11) NOT NULL AUTO_INCREMENT,
    hospitalId INT(11) NOT NULL,
    nombres VARCHAR(100) NOT NULL,
    apellidos VARCHAR(100) NOT NULL,
    fechaNacimiento DATE DEFAULT NULL,
    sexo ENUM('MASCULINO','FEMENINO','OTRO') DEFAULT NULL,
    telefono VARCHAR(50) DEFAULT NULL,
    email VARCHAR(150) DEFAULT NULL,
    documento VARCHAR(50) DEFAULT NULL,
    activo TINYINT(1) NOT NULL DEFAULT 1,
    PRIMARY KEY (id),
    UNIQUE KEY uk_paciente_hosp_doc (hospitalId, documento),
    UNIQUE KEY uk_paciente_hosp_email (hospitalId, email),
    UNIQUE KEY uk_paciente_hosp_tel (hospitalId, telefono),
    CONSTRAINT fk_paciente_hospital FOREIGN KEY (hospitalId) REFERENCES hospital(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- Tabla empleado
CREATE TABLE IF NOT EXISTS empleado (
    id INT(11) NOT NULL AUTO_INCREMENT,
    hospitalId INT(11) NOT NULL,
    nombres VARCHAR(100) NOT NULL,
    apellidos VARCHAR(100) NOT NULL,
    tipo ENUM('LIMPIEZA','SEGURIDAD','RECEPCION','ADMINISTRATIVO','OTRO') NOT NULL,
    email VARCHAR(150) DEFAULT NULL,
    telefono VARCHAR(50) DEFAULT NULL,
    activo TINYINT(1) NOT NULL DEFAULT 1,
    PRIMARY KEY (id),
    KEY fk_empleado_hospital (hospitalId),
    CONSTRAINT fk_empleado_hospital FOREIGN KEY (hospitalId) REFERENCES hospital(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- Tabla cita (singular, no plural)
CREATE TABLE IF NOT EXISTS cita (
    id INT(11) NOT NULL AUTO_INCREMENT,
    hospitalId INT(11) NOT NULL,
    medicoId INT(11) NOT NULL,
    pacienteId INT(11) DEFAULT NULL,
    pacienteNombre VARCHAR(255) DEFAULT NULL,
    pacienteTelefono VARCHAR(50) DEFAULT NULL,
    pacienteEmail VARCHAR(150) DEFAULT NULL,
    motivo TEXT NOT NULL,
    fechaInicio DATETIME NOT NULL,
    fechaFin DATETIME NOT NULL,
    estado ENUM('PROGRAMADA','CANCELADA','ATENDIDA') NOT NULL DEFAULT 'PROGRAMADA',
    creadaPorId INT(11) DEFAULT NULL,
    actualizadaPorId INT(11) DEFAULT NULL,
    createdAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updatedAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    KEY fk_cita_medico (medicoId),
    KEY fk_cita_paciente (pacienteId),
    KEY fk_cita_creada_por (creadaPorId),
    KEY fk_cita_actualizada_por (actualizadaPorId),
    KEY idx_cita_hospital_medico_fecha (hospitalId, medicoId, fechaInicio, fechaFin),
    CONSTRAINT fk_cita_hospital FOREIGN KEY (hospitalId) REFERENCES hospital(id) ON DELETE CASCADE,
    CONSTRAINT fk_cita_medico FOREIGN KEY (medicoId) REFERENCES medico(id) ON DELETE CASCADE,
    CONSTRAINT fk_cita_paciente FOREIGN KEY (pacienteId) REFERENCES paciente(id) ON DELETE SET NULL,
    CONSTRAINT fk_cita_creada_por FOREIGN KEY (creadaPorId) REFERENCES usuario(id) ON DELETE SET NULL,
    CONSTRAINT fk_cita_actualizada_por FOREIGN KEY (actualizadaPorId) REFERENCES usuario(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- Agregar FK de usuario a medico (después de crear medico)
ALTER TABLE usuario 
    ADD CONSTRAINT fk_usuario_medico 
    FOREIGN KEY (medicoId) REFERENCES medico(id) ON DELETE SET NULL;

