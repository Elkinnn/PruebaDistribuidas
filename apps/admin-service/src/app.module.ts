// Este archivo es parte de main.ts que NO se usa actualmente
// El admin-service usa Express (index.js) como punto de entrada principal
// Este módulo NestJS se mantiene para compatibilidad futura
// 
// Para instalar dependencias faltantes, ejecutar:
// npm install @nestjs/common@^10.0.0 @nestjs/core@^10.0.0

// @ts-ignore - Dependencias no instaladas localmente pero presentes en Docker
import { Module } from '@nestjs/common';
// @ts-ignore
import { ConfigModule, ConfigService } from '@nestjs/config';
// @ts-ignore
import { TypeOrmModule } from '@nestjs/typeorm';
import { ormconfig } from './infrastructure/config/ormconfig';
import { DbHealthController } from './presentation/db-health.controller';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    TypeOrmModule.forRootAsync({
      inject: [ConfigService],
      useFactory: ormconfig,
    }),
  ],
  controllers: [DbHealthController],
})
export class AppModule {}
