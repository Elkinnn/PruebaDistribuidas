import { Controller, Get, HttpException, HttpStatus } from '@nestjs/common';
import { DataSource } from 'typeorm';

@Controller('db')
export class DbHealthController {
  constructor(private readonly dataSource: DataSource) {}

  @Get()
  status() {
    return { ok: true, db: 'ready' };
  }

  @Get('health')
  async health() {
    try {
      await this.dataSource.query('SELECT 1');
      return { ok: true, db: 'up' };
    } catch (e) {
      return { ok: false, db: 'down', error: (e as Error).message };
    }
  }

  @Get('ready')
  async ready() {
    try {
      await this.dataSource.query('SELECT 1');
      return { ok: true, db: 'ready' };
    } catch (error) {
      throw new HttpException(
        {
          ok: false,
          db: 'unavailable',
          error: (error as Error).message,
        },
        HttpStatus.SERVICE_UNAVAILABLE,
      );
    }
  }
}
