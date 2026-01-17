import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddIsFeaturedToProduct1737020000000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // Check if column exists
    const hasColumn = await queryRunner.query(`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name = 'products' AND column_name = 'is_featured'
    `);

    if (hasColumn.length === 0) {
      await queryRunner.query(`
        ALTER TABLE products 
        ADD COLUMN is_featured BOOLEAN DEFAULT false
      `);
    }
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE products 
      DROP COLUMN IF EXISTS is_featured
    `);
  }
}
