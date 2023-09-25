import { MigrationInterface, QueryRunner } from 'typeorm';

export class UpdateUser1705740751935 implements MigrationInterface {
  name = 'UpdateUser1705740751935';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE \`users\` CHANGE \`roles\` \`roles\` enum ('user', 'manager', 'admin') NOT NULL DEFAULT 'user'`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE \`users\` CHANGE \`roles\` \`roles\` enum ('USER', 'MANAGER', 'ADMIN') NOT NULL DEFAULT 'USER'`,
    );
  }
}
