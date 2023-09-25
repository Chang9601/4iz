import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import type {
  TypeOrmModuleOptions,
  TypeOrmOptionsFactory,
} from '@nestjs/typeorm';
import { SqlQueryLogger } from '../databases/loggers/sql-query-logger';

@Injectable()
export class TypeOrmConfigService implements TypeOrmOptionsFactory {
  constructor(private readonly configService: ConfigService) {}

  async createTypeOrmOptions(): Promise<TypeOrmModuleOptions> {
    return {
      type: 'mysql',
      host: this.getEnv('DB_HOST'),
      port: parseInt(this.getEnv('DB_PORT')),
      username: this.getEnv('DB_USERNAME'),
      password: this.getEnv('DB_PASSWORD'),
      database: this.getEnv('DB_DATABASE'),
      entities:
        this.getEnv('NODE_ENV') === 'development' ||
        this.getEnv('NODE_ENV') === 'production'
          ? [__dirname + '/../**/*.entity.js']
          : [__dirname + '/../**/*.entity.ts'],
      logger: new SqlQueryLogger(),
    };
  }

  private getEnv(key: string) {
    const value = this.configService.get<string>(key);

    if (!value) {
      throw new Error(`환경 변수 ${key}가 설정되지 않음.`);
    }

    return value;
  }
}
