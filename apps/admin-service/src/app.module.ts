import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
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
