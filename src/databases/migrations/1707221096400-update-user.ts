import { MigrationInterface, QueryRunner } from 'typeorm';

export class UpdateUser1707221096400 implements MigrationInterface {
  name = 'UpdateUser1707221096400';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE \`users\` ADD \`oauth_provider\` varchar(100) NOT NULL DEFAULT 'none'`,
    );
    await queryRunner.query(
      `ALTER TABLE \`users\` ADD \`oauth_provider_id\` varchar(300) NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE \`users\` ADD \`oauth_provider_refresh_token\` varchar(500) NULL`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE \`users\` DROP COLUMN \`oauth_provider_refresh_token\``,
    );
    await queryRunner.query(
      `ALTER TABLE \`users\` DROP COLUMN \`oauth_provider_id\``,
    );
    await queryRunner.query(
      `ALTER TABLE \`users\` DROP COLUMN \`oauth_provider\``,
    );
  }
}
