import * as dotenv from 'dotenv';
import { DataSource } from 'typeorm';

dotenv.config();

let database: string;
let migrationsRun: boolean;

switch (process.env.NODE_ENV) {
  case 'development':
    database = '4iz_refactoring_dev';
    migrationsRun = false;
    break;
  case 'test':
    database = '4iz_refactoring_test';
    migrationsRun = true;
    break;
  case 'production':
    database = '4iz_refactoring_prod';
    migrationsRun = true;
    break;
  default:
    database = '';
    migrationsRun = false;
}

export const dataSource = new DataSource({
  type: 'mysql',
  host: process.env.DB_HOST,
  port: Number(process.env.DB_PORT),
  username: process.env.DB_USERNAME,
  password: process.env.DB_PASSWORD,
  database: database,
  entities:
    process.env.NODE_ENV === 'development' || 'production'
      ? [__dirname + '/../**/*.entity.js']
      : [__dirname + '/../**/*.entity.ts'],
  migrations: [__dirname + '/src/database/migrations/*{.ts,.js}'],
  migrationsRun: migrationsRun,
  synchronize: false,
});
