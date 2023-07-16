import * as dotenv from 'dotenv';
import { DataSource } from 'typeorm';

dotenv.config();

let migrationsRun: boolean;

switch (process.env.NODE_ENV) {
  case 'development':
    migrationsRun = false;
    break;
  case 'test':
    migrationsRun = true;
    break;
  case 'production':
    migrationsRun = true;
    break;
  default:
    migrationsRun = false;
}

export const dataSource = new DataSource({
  type: 'mysql',
  host: process.env.DB_HOST,
  port: Number(process.env.DB_PORT),
  username: process.env.DB_USERNAME,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_DATABASE,
  entities:
    process.env.NODE_ENV === 'development' || 'production'
      ? [__dirname + '/../**/*.entity.js']
      : [__dirname + '/../**/*.entity.ts'],
  migrations: [__dirname + '/src/database/migrations/*{.ts,.js}'],
  migrationsRun: migrationsRun,
  synchronize: false,
});
