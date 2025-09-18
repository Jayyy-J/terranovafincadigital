-- backend/db/init.sql
-- Este script crea la estructura inicial de nuestra base de datos.

-- Activa la extensión pgcrypto, necesaria para generar UUIDs.
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Tabla para almacenar la información de los usuarios (clientes)
CREATE TABLE users (
    user_id UUID PRIMARY KEY DEFAULT gen_random_uuid(), -- ID único para cada usuario
    email VARCHAR(255) UNIQUE NOT NULL, -- Email del usuario, debe ser único
    password_hash VARCHAR(255) NOT NULL, -- La contraseña encriptada
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP, -- Fecha de creación de la cuenta
    subscription_status VARCHAR(50) DEFAULT 'inactive' -- Estado de la suscripción (ej: active, inactive, past_due)
);

-- Tabla para almacenar la información de las fincas de los usuarios
-- Un usuario puede tener múltiples fincas en el futuro.
CREATE TABLE farms (
    farm_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(user_id), -- Enlaza la finca a un usuario
    farm_name VARCHAR(255) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Tabla para almacenar la información de los animales
CREATE TABLE animals (
    animal_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    farm_id UUID NOT NULL REFERENCES farms(farm_id), -- Enlaza el animal a una finca
    animal_code VARCHAR(100) NOT NULL, -- Código o identificador del animal (ej: "001")
    breed VARCHAR(100), -- Raza
    birth_date DATE, -- Fecha de nacimiento
    weight_kg DECIMAL(7, 2), -- Peso en kilogramos (ej: 450.75)
    lineage TEXT, -- Información sobre su descendencia
    photo_url VARCHAR(255), -- URL de la foto del animal
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    -- Asegura que el código de un animal sea único dentro de una misma finca
    UNIQUE(farm_id, animal_code)
);

-- Tabla para almacenar la información de los lotes de cultivo
CREATE TABLE lots (
    lot_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    farm_id UUID NOT NULL REFERENCES farms(farm_id), -- Enlaza el lote a una finca
    lot_name VARCHAR(100) NOT NULL, -- Nombre o código del lote (ej: "Lote Norte")
    area_hectares DECIMAL(10, 4), -- Área del lote en hectáreas
    crop_type VARCHAR(100), -- Tipo de cultivo
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(farm_id, lot_name)
);