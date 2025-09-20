-- Script de limpieza de la base de datos
-- Este script elimina todos los datos de las tablas

-- Deshabilitar restricciones de clave foránea temporalmente
SET session_replication_role = replica;

-- Eliminar datos de todas las tablas
TRUNCATE TABLE citas CASCADE;
TRUNCATE TABLE consultas CASCADE;
TRUNCATE TABLE pacientes CASCADE;
TRUNCATE TABLE users CASCADE;

-- Rehabilitar restricciones de clave foránea
SET session_replication_role = DEFAULT;

-- Reiniciar secuencias si existen
-- (No aplicable para UUID, pero útil para IDs autoincrementales)

-- Mostrar mensaje de confirmación
SELECT 'Base de datos limpiada exitosamente' AS mensaje;
