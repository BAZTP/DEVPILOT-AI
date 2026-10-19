-- Script de inicialización de PostgreSQL para DevPilot AI
-- Este script se ejecuta al crear el contenedor por primera vez

-- Extensiones útiles
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";  -- Para búsqueda de texto eficiente

-- La base de datos y el usuario ya son creados por las variables de entorno de Docker
-- Aquí se puede agregar configuración adicional si es necesaria

COMMENT ON DATABASE devpilot_db IS 'Base de datos principal de DevPilot AI';
