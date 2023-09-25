import { MigrationInterface, QueryRunner } from 'typeorm';

export class UpdateOrder1704888508265 implements MigrationInterface {
  name = 'UpdateOrder1704888508265';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE \`orders\` ADD \`street_address\` varchar(500) NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE \`orders\` ADD \`address\` varchar(300) NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE \`orders\` ADD \`zipcode\` varchar(200) NOT NULL`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE \`orders\` DROP COLUMN \`zipcode\``);
    await queryRunner.query(`ALTER TABLE \`orders\` DROP COLUMN \`address\``);
    await queryRunner.query(
      `ALTER TABLE \`orders\` DROP COLUMN \`street_address\``,
    );
  }
}
