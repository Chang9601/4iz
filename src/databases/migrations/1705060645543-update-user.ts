import { MigrationInterface, QueryRunner } from 'typeorm';

export class UpdateUser1705060645543 implements MigrationInterface {
  name = 'UpdateUser1705060645543';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE \`users\` DROP COLUMN \`age\``);
    await queryRunner.query(`ALTER TABLE \`users\` DROP COLUMN \`job\``);
    await queryRunner.query(
      `ALTER TABLE \`users\` CHANGE \`roles\` \`roles\` enum ('USER', 'MANAGER', 'ADMIN') NOT NULL DEFAULT 'USER'`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE \`users\` CHANGE \`roles\` \`roles\` enum ('USER', 'MANAGER', 'ADMIN') NOT NULL DEFAULT 'USER'`,
    );
    await queryRunner.query(
      `ALTER TABLE \`users\` ADD \`job\` varchar(255) NOT NULL`,
    );
    await queryRunner.query(`ALTER TABLE \`users\` ADD \`age\` int NOT NULL`);
  }
}
