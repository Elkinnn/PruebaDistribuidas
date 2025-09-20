-- Script de datos de ejemplo para desarrollo
-- Este script inserta datos de prueba en la base de datos

-- Insertar usuarios de ejemplo
INSERT INTO users (email, name, role, is_active) VALUES
('admin@example.com', 'Administrador', 'admin', TRUE),
('medico@example.com', 'Dr. Juan Pérez', 'medico', TRUE),
('medico2@example.com', 'Dra. María García', 'medico', TRUE)
ON CONFLICT (email) DO NOTHING;

-- Insertar pacientes de ejemplo
INSERT INTO pacientes (nombre, apellido, email, telefono, fecha_nacimiento, genero, direccion) VALUES
('Juan', 'Pérez', 'juan.perez@email.com', '555-0101', '1985-03-15', 'M', 'Calle Principal 123'),
('María', 'García', 'maria.garcia@email.com', '555-0102', '1990-07-22', 'F', 'Avenida Central 456'),
('Carlos', 'López', 'carlos.lopez@email.com', '555-0103', '1978-11-08', 'M', 'Plaza Mayor 789'),
('Ana', 'Martínez', 'ana.martinez@email.com', '555-0104', '1992-05-12', 'F', 'Calle Secundaria 321'),
('Luis', 'Rodríguez', 'luis.rodriguez@email.com', '555-0105', '1988-09-30', 'M', 'Boulevard Norte 654')
ON CONFLICT (email) DO NOTHING;

-- Obtener IDs para las relaciones
DO $$
DECLARE
    admin_id UUID;
    medico_id UUID;
    paciente1_id UUID;
    paciente2_id UUID;
    paciente3_id UUID;
BEGIN
    -- Obtener IDs de usuarios
    SELECT id INTO admin_id FROM users WHERE email = 'admin@example.com';
    SELECT id INTO medico_id FROM users WHERE email = 'medico@example.com';
    
    -- Obtener IDs de pacientes
    SELECT id INTO paciente1_id FROM pacientes WHERE email = 'juan.perez@email.com';
    SELECT id INTO paciente2_id FROM pacientes WHERE email = 'maria.garcia@email.com';
    SELECT id INTO paciente3_id FROM pacientes WHERE email = 'carlos.lopez@email.com';

    -- Insertar consultas de ejemplo
    INSERT INTO consultas (paciente_id, medico_id, fecha, motivo, sintomas, diagnostico, tratamiento, observaciones) VALUES
    (paciente1_id, medico_id, CURRENT_TIMESTAMP - INTERVAL '1 day', 'Control cardiológico', 'Dolor en el pecho', 'Angina de pecho', 'Reposo y medicación', 'Paciente estable'),
    (paciente2_id, medico_id, CURRENT_TIMESTAMP - INTERVAL '2 days', 'Consulta general', 'Fiebre y malestar', 'Gripe común', 'Reposo y líquidos', 'Seguimiento en 3 días'),
    (paciente3_id, medico_id, CURRENT_TIMESTAMP - INTERVAL '3 days', 'Revisión de rutina', 'Sin síntomas', 'Estado saludable', 'Mantener hábitos saludables', 'Próxima revisión en 6 meses')
    ON CONFLICT DO NOTHING;

    -- Insertar citas de ejemplo
    INSERT INTO citas (paciente_id, medico_id, fecha, hora, motivo, estado, observaciones) VALUES
    (paciente1_id, medico_id, CURRENT_DATE, '09:00', 'Control cardiológico', 'programada', 'Primera consulta'),
    (paciente2_id, medico_id, CURRENT_DATE, '10:30', 'Consulta general', 'programada', 'Seguimiento'),
    (paciente3_id, medico_id, CURRENT_DATE + INTERVAL '1 day', '11:15', 'Revisión de rutina', 'programada', 'Revisión anual'),
    (paciente1_id, medico_id, CURRENT_DATE + INTERVAL '1 day', '14:00', 'Control de seguimiento', 'programada', 'Segunda consulta'),
    (paciente2_id, medico_id, CURRENT_DATE + INTERVAL '2 days', '15:30', 'Consulta de seguimiento', 'programada', 'Control post-tratamiento')
    ON CONFLICT DO NOTHING;
END $$;
