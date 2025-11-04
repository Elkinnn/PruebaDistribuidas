import 'reflect-metadata';
import { NestFactory } from '@nestjs/core';
import { DataSource } from 'typeorm';
import { AppModule } from './app.module';
import { initDatabase } from './infrastructure/persistence/init-db';

async function bootstrap() {
  // Inicializar base de datos antes de crear la app
  await initDatabase();
  
  const app = await NestFactory.create(AppModule);

  const PORT = Number(process.env.PORT ?? 3001);
  const dataSource = app.get(DataSource, { strict: false });

  const server = await app.listen(PORT, '0.0.0.0');
  console.log(`AdminService escuchando en ${PORT}`);

  const shutdown = async (signal: NodeJS.Signals) => {
    console.log(`Recibido ${signal}, cerrando AdminService con gracia...`);
    try {
      await app.close();
    } catch (error) {
      console.error('Error al cerrar la aplicación Nest:', error);
    }

    if (dataSource?.isInitialized) {
      try {
        await dataSource.destroy();
      } catch (error) {
        console.error('Error al cerrar la conexión de TypeORM:', error);
      }
    }

    server.close(() => process.exit(0));
  };

  ['SIGTERM', 'SIGINT'].forEach((signal) => {
    process.on(signal, () => {
      void shutdown(signal as NodeJS.Signals);
    });
  });
}

bootstrap().catch((error) => {
  console.error('Error al iniciar AdminService:', error);
  process.exit(1);
});
