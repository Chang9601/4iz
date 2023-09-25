import { ConfigService } from '@nestjs/config';
import * as dotenv from 'dotenv';
import { DataSource } from 'typeorm';

// ConfigService를 사용하기 전에 환경 변수를 져오기 위해 dotenv 패키지를 사용한다.
dotenv.config();

const configService = new ConfigService();

export default new DataSource({
  type: 'mysql',
  host: configService.get<string>('DB_HOST'),
  port: parseInt(configService.get<string>('DB_PORT') as string),
  username: configService.get<string>('DB_USERNAME'),
  password: configService.get<string>('DB_PASSWORD'),
  database: configService.get<string>('DB_DATABASE'),
  // 환경에 따른 파일을 선택한다.
  entities:
    configService.get<string>('NODE_ENV') === 'development' ||
    configService.get<string>('NODE_ENV') === 'production'
      ? [__dirname + '/./dist/**/*.entity.js']
      : [__dirname + '/./src/**/*.entity.ts'],
  // 마이그레이션을 실행하려면 migrations에 마이그레이션 파일을 추가한다.
  migrations: [__dirname + '/./src/databases/migrations/*.ts'],
  // 애플리케이션을 시작할 때마다 마이그레이션을 실행한다.
  migrationsRun:
    configService.get<string>('NODE_ENV') === 'development' ? false : true,
  synchronize: false,
});
