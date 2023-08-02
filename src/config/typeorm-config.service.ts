import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import type { TypeOrmModuleOptions } from '@nestjs/typeorm';

@Injectable()
export class TypeOrmConfigService {
  constructor(private configService: ConfigService) {}

  get isDevelopment(): boolean {
    return this.nodeEnv === 'development';
  }

  get isProduction(): boolean {
    return this.nodeEnv === 'production';
  }

  get isTest(): boolean {
    return this.nodeEnv === 'test';
  }

  private getNumber(key: string): number {
    const value = this.get(key);

    try {
      return Number(value);
    } catch {
      throw new Error(key + ' environment variable is not a number');
    }
  }

  private getString(key: string): string {
    const value = this.get(key);

    return value.replace(/\\n/g, '\n');
  }

  get nodeEnv(): string {
    return this.getString('NODE_ENV');
  }

  get mysqlConfig(): TypeOrmModuleOptions {
    return {
      type: 'mysql',
      host: this.getString('DB_HOST'),
      port: +this.getNumber('DB_PORT'),
      username: this.getString('DB_USERNAME'),
      password: this.getString('DB_PASSWORD'),
      database: this.getString('DB_DATABASE'),
      entities:
        this.nodeEnv === 'development' || this.nodeEnv === 'production'
          ? [__dirname + '/../**/*.entity.js']
          : [__dirname + '/../**/*.entity.ts'],
      migrations: [__dirname + '/../database/migrations/**/*{.ts,.js}'],
      migrationsTableName: 'migrations',
    };
  }

  private get(key: string): string {
    const value = this.configService.get<string>(key);

    if (!value) {
      throw new Error(`environment variable ${key} not set`);
    }

    return value;
  }
}
