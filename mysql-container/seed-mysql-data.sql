-- Script de datos de ejemplo para MySQL
-- Insertar datos de prueba en la base de datos

-- Insertar usuarios de ejemplo
INSERT IGNORE INTO users (id, email, name, role, is_active) VALUES
(UUID(), 'admin@example.com', 'Administrador', 'admin', TRUE),
(UUID(), 'medico@example.com', 'Dr. Juan Pérez', 'medico', TRUE),
(UUID(), 'medico2@example.com', 'Dra. María García', 'medico', TRUE);

-- Insertar pacientes de ejemplo
INSERT IGNORE INTO pacientes (id, nombre, apellido, email, telefono, fecha_nacimiento, genero, direccion) VALUES
(UUID(), 'Juan', 'Pérez', 'juan.perez@email.com', '555-0101', '1985-03-15', 'M', 'Calle Principal 123'),
(UUID(), 'María', 'García', 'maria.garcia@email.com', '555-0102', '1990-07-22', 'F', 'Avenida Central 456'),
(UUID(), 'Carlos', 'López', 'carlos.lopez@email.com', '555-0103', '1978-11-08', 'M', 'Plaza Mayor 789'),
(UUID(), 'Ana', 'Martínez', 'ana.martinez@email.com', '555-0104', '1992-05-12', 'F', 'Calle Secundaria 321'),
(UUID(), 'Luis', 'Rodríguez', 'luis.rodriguez@email.com', '555-0105', '1988-09-30', 'M', 'Boulevard Norte 654');

-- Insertar consultas de ejemplo (necesitamos IDs reales)
-- Nota: Estos ejemplos asumen que ya existen usuarios y pacientes
INSERT IGNORE INTO consultas (id, paciente_id, medico_id, fecha, motivo, sintomas, diagnostico, tratamiento, observaciones)
SELECT 
    UUID(),
    (SELECT id FROM pacientes WHERE email = 'juan.perez@email.com' LIMIT 1),
    (SELECT id FROM users WHERE email = 'medico@example.com' LIMIT 1),
    DATE_SUB(NOW(), INTERVAL 1 DAY),
    'Control cardiológico',
    'Dolor en el pecho',
    'Angina de pecho',
    'Reposo y medicación',
    'Paciente estable'
WHERE EXISTS (SELECT 1 FROM pacientes WHERE email = 'juan.perez@email.com')
AND EXISTS (SELECT 1 FROM users WHERE email = 'medico@example.com');

INSERT IGNORE INTO consultas (id, paciente_id, medico_id, fecha, motivo, sintomas, diagnostico, tratamiento, observaciones)
SELECT 
    UUID(),
    (SELECT id FROM pacientes WHERE email = 'maria.garcia@email.com' LIMIT 1),
    (SELECT id FROM users WHERE email = 'medico@example.com' LIMIT 1),
    DATE_SUB(NOW(), INTERVAL 2 DAY),
    'Consulta general',
    'Fiebre y malestar',
    'Gripe común',
    'Reposo y líquidos',
    'Seguimiento en 3 días'
WHERE EXISTS (SELECT 1 FROM pacientes WHERE email = 'maria.garcia@email.com')
AND EXISTS (SELECT 1 FROM users WHERE email = 'medico@example.com');

-- Insertar citas de ejemplo
INSERT IGNORE INTO citas (id, paciente_id, medico_id, fecha, hora, motivo, estado, observaciones)
SELECT 
    UUID(),
    (SELECT id FROM pacientes WHERE email = 'juan.perez@email.com' LIMIT 1),
    (SELECT id FROM users WHERE email = 'medico@example.com' LIMIT 1),
    CURDATE(),
    '09:00:00',
    'Control cardiológico',
    'programada',
    'Primera consulta'
WHERE EXISTS (SELECT 1 FROM pacientes WHERE email = 'juan.perez@email.com')
AND EXISTS (SELECT 1 FROM users WHERE email = 'medico@example.com');

INSERT IGNORE INTO citas (id, paciente_id, medico_id, fecha, hora, motivo, estado, observaciones)
SELECT 
    UUID(),
    (SELECT id FROM pacientes WHERE email = 'maria.garcia@email.com' LIMIT 1),
    (SELECT id FROM users WHERE email = 'medico@example.com' LIMIT 1),
    CURDATE(),
    '10:30:00',
    'Consulta general',
    'programada',
    'Seguimiento'
WHERE EXISTS (SELECT 1 FROM pacientes WHERE email = 'maria.garcia@email.com')
AND EXISTS (SELECT 1 FROM users WHERE email = 'medico@example.com');


