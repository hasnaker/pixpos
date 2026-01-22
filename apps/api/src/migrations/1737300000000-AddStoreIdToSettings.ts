import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddStoreIdToSettings1737300000000 implements MigrationInterface {
  name = 'AddStoreIdToSettings1737300000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // Drop the old unique constraint on key
    await queryRunner.query(`
      ALTER TABLE "settings" DROP CONSTRAINT IF EXISTS "UQ_settings_key"
    `);
    await queryRunner.query(`
      ALTER TABLE "settings" DROP CONSTRAINT IF EXISTS "settings_key_key"
    `);
    
    // Add store_id column
    await queryRunner.query(`
      ALTER TABLE "settings" ADD COLUMN IF NOT EXISTS "store_id" uuid
    `);
    
    // Add foreign key constraint
    await queryRunner.query(`
      ALTER TABLE "settings" 
      ADD CONSTRAINT "FK_settings_store" 
      FOREIGN KEY ("store_id") REFERENCES "stores"("id") ON DELETE CASCADE
    `);
    
    // Create unique index on store_id + key
    await queryRunner.query(`
      CREATE UNIQUE INDEX IF NOT EXISTS "IDX_settings_store_key" ON "settings" ("store_id", "key")
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Drop the new index
    await queryRunner.query(`DROP INDEX IF EXISTS "IDX_settings_store_key"`);
    
    // Drop foreign key
    await queryRunner.query(`
      ALTER TABLE "settings" DROP CONSTRAINT IF EXISTS "FK_settings_store"
    `);
    
    // Drop store_id column
    await queryRunner.query(`ALTER TABLE "settings" DROP COLUMN IF EXISTS "store_id"`);
    
    // Restore unique constraint on key
    await queryRunner.query(`
      ALTER TABLE "settings" ADD CONSTRAINT "UQ_settings_key" UNIQUE ("key")
    `);
  }
}
