import { QueryRunner, Logger as TypeOrmLogger } from 'typeorm';
import { Logger } from '@nestjs/common';

export class SqlQueryLogger implements TypeOrmLogger {
  private readonly logger = new Logger('SQL');

  logQuery(
    query: string,
    parameters?: any[] | undefined,
    _?: QueryRunner | undefined,
  ) {
    this.logger.log(
      `\nquery=${query}\nparameters=${JSON.stringify(parameters)}`,
    );
  }

  logQueryError(
    error: string | Error,
    query: string,
    parameters?: any[] | undefined,
    _?: QueryRunner | undefined,
  ) {
    this.logger.error(
      `\nerror=${error}\nquery=${query}\nparameters=${JSON.stringify(
        parameters,
      )}`,
    );
  }

  logQuerySlow(
    time: number,
    query: string,
    parameters?: any[] | undefined,
    _?: QueryRunner | undefined,
  ) {
    this.logger.warn(
      `\ntime=${time}\nquery=${query}\nparameters=${JSON.stringify(
        parameters,
      )}`,
    );
  }

  logSchemaBuild(message: string, _?: QueryRunner | undefined) {
    this.logger.log(message);
  }

  logMigration(message: string, _?: QueryRunner | undefined) {
    this.logger.log(message);
  }

  log(
    level: 'log' | 'info' | 'warn',
    message: any,
    _?: QueryRunner | undefined,
  ) {
    switch (level) {
      case 'log':
        return this.logger.log(message);
      case 'info':
        return this.logger.debug(message);
      case 'warn':
        return this.logger.warn(message);
    }
  }
}
