import { TypeOrmModuleOptions } from '@nestjs/typeorm';
import * as fs from 'fs';

export const ormconfig = (): TypeOrmModuleOptions => ({
  type: 'mysql',
  host: process.env.DB_HOST,
  port: Number(process.env.DB_PORT),
  username: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  autoLoadEntities: true,
  synchronize: false, // ⚠️ no poner true en producción
  ssl: shouldUseSSL() ? {
    rejectUnauthorized: true,
    ...(process.env.DB_SSL_CA_PATH ? { ca: fs.readFileSync(process.env.DB_SSL_CA_PATH) } : {})
  } : undefined,
});

const shouldUseSSL = () => {
  const value = process.env.DB_SSL;
  if (value === undefined) {
    return false;
  }
  return ['true', '1', 'yes'].includes(value.toLowerCase());
};
