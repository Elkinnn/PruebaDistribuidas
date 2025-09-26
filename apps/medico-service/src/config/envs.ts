import 'dotenv/config';
import { get } from 'env-var';
import path from 'path';

// Cargar variables de entorno desde el archivo .env en la raíz del proyecto
require('dotenv').config({ path: path.resolve(__dirname, '../../.env') });


export const envs = {
    PORT: get('PORT').required().asPortNumber(),
    MYSQL_DB: get('MYSQL_DB').required().asString(),
    MYSQL_PORT: get('MYSQL_PORT').required().asPortNumber(), 
    MYSQL_USER: get('MYSQL_USER').required().asString(), 
    MYSQL_PASSWORD: get('MYSQL_PASSWORD').asString(),
    JWT_SECRET: get('JWT_SECRET').required().asString(),
}