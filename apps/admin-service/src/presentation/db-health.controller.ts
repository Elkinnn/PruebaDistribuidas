import { Controller, Get } from '@nestjs/common';
import { DataSource } from 'typeorm';

@Controller('db')
export class DbHealthController {
  constructor(private readonly dataSource: DataSource) {}

  @Get('health')
  async health() {
    try {
      await this.dataSource.query('SELECT 1');
      return { ok: true, db: 'up' };
    } catch (e) {
      return { ok: false, db: 'down', error: (e as Error).message };
    }
  }
}
