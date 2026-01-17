import { MigrationInterface, QueryRunner } from 'typeorm';

export class InitialSchema1736780400000 implements MigrationInterface {
  name = 'InitialSchema1736780400000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // Categories table
    await queryRunner.query(`
      CREATE TABLE "categories" (
        "id" uuid NOT NULL DEFAULT gen_random_uuid(),
        "name" varchar(100) NOT NULL,
        "sort_order" int NOT NULL DEFAULT 0,
        "is_active" boolean NOT NULL DEFAULT true,
        "created_at" TIMESTAMP NOT NULL DEFAULT now(),
        "updated_at" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "PK_categories" PRIMARY KEY ("id")
      )
    `);

    // Products table
    await queryRunner.query(`
      CREATE TABLE "products" (
        "id" uuid NOT NULL DEFAULT gen_random_uuid(),
        "category_id" uuid NOT NULL,
        "name" varchar(200) NOT NULL,
        "price" decimal(10,2) NOT NULL,
        "image_url" varchar(500),
        "description" text,
        "is_active" boolean NOT NULL DEFAULT true,
        "sort_order" int NOT NULL DEFAULT 0,
        "created_at" TIMESTAMP NOT NULL DEFAULT now(),
        "updated_at" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "PK_products" PRIMARY KEY ("id"),
        CONSTRAINT "FK_products_category" FOREIGN KEY ("category_id") 
          REFERENCES "categories"("id") ON DELETE RESTRICT
      )
    `);

    // Tables table
    await queryRunner.query(`
      CREATE TABLE "tables" (
        "id" uuid NOT NULL DEFAULT gen_random_uuid(),
        "name" varchar(50) NOT NULL,
        "capacity" int NOT NULL DEFAULT 4,
        "status" varchar(20) NOT NULL DEFAULT 'empty',
        "sort_order" int NOT NULL DEFAULT 0,
        "is_active" boolean NOT NULL DEFAULT true,
        "created_at" TIMESTAMP NOT NULL DEFAULT now(),
        "updated_at" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "PK_tables" PRIMARY KEY ("id")
      )
    `);

    // Orders table
    await queryRunner.query(`
      CREATE TABLE "orders" (
        "id" uuid NOT NULL DEFAULT gen_random_uuid(),
        "table_id" uuid NOT NULL,
        "order_number" varchar(20) NOT NULL,
        "status" varchar(20) NOT NULL DEFAULT 'open',
        "total_amount" decimal(10,2) NOT NULL DEFAULT 0,
        "notes" text,
        "created_at" TIMESTAMP NOT NULL DEFAULT now(),
        "updated_at" TIMESTAMP NOT NULL DEFAULT now(),
        "closed_at" TIMESTAMP,
        CONSTRAINT "PK_orders" PRIMARY KEY ("id"),
        CONSTRAINT "FK_orders_table" FOREIGN KEY ("table_id") 
          REFERENCES "tables"("id") ON DELETE RESTRICT
      )
    `);

    // Order items table
    await queryRunner.query(`
      CREATE TABLE "order_items" (
        "id" uuid NOT NULL DEFAULT gen_random_uuid(),
        "order_id" uuid NOT NULL,
        "product_id" uuid NOT NULL,
        "product_name" varchar(200) NOT NULL,
        "quantity" int NOT NULL DEFAULT 1,
        "unit_price" decimal(10,2) NOT NULL,
        "total_price" decimal(10,2) NOT NULL,
        "notes" text,
        "status" varchar(20) NOT NULL DEFAULT 'pending',
        "created_at" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "PK_order_items" PRIMARY KEY ("id"),
        CONSTRAINT "FK_order_items_order" FOREIGN KEY ("order_id") 
          REFERENCES "orders"("id") ON DELETE CASCADE,
        CONSTRAINT "FK_order_items_product" FOREIGN KEY ("product_id") 
          REFERENCES "products"("id") ON DELETE RESTRICT
      )
    `);

    // Payments table
    await queryRunner.query(`
      CREATE TABLE "payments" (
        "id" uuid NOT NULL DEFAULT gen_random_uuid(),
        "order_id" uuid NOT NULL,
        "amount" decimal(10,2) NOT NULL,
        "payment_method" varchar(20) NOT NULL,
        "created_at" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "PK_payments" PRIMARY KEY ("id"),
        CONSTRAINT "FK_payments_order" FOREIGN KEY ("order_id") 
          REFERENCES "orders"("id") ON DELETE RESTRICT
      )
    `);

    // Printers table
    await queryRunner.query(`
      CREATE TABLE "printers" (
        "id" uuid NOT NULL DEFAULT gen_random_uuid(),
        "name" varchar(100) NOT NULL,
        "type" varchar(20) NOT NULL,
        "connection_type" varchar(20) NOT NULL,
        "ip_address" varchar(50),
        "port" int NOT NULL DEFAULT 9100,
        "is_active" boolean NOT NULL DEFAULT true,
        "created_at" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "PK_printers" PRIMARY KEY ("id")
      )
    `);

    // Settings table
    await queryRunner.query(`
      CREATE TABLE "settings" (
        "id" uuid NOT NULL DEFAULT gen_random_uuid(),
        "key" varchar(100) NOT NULL,
        "value" text,
        "updated_at" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "PK_settings" PRIMARY KEY ("id"),
        CONSTRAINT "UQ_settings_key" UNIQUE ("key")
      )
    `);

    // Create indexes
    await queryRunner.query(`CREATE INDEX "IDX_products_category" ON "products" ("category_id")`);
    await queryRunner.query(`CREATE INDEX "IDX_orders_table" ON "orders" ("table_id")`);
    await queryRunner.query(`CREATE INDEX "IDX_orders_status" ON "orders" ("status")`);
    await queryRunner.query(`CREATE INDEX "IDX_order_items_order" ON "order_items" ("order_id")`);
    await queryRunner.query(`CREATE INDEX "IDX_payments_order" ON "payments" ("order_id")`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP INDEX "IDX_payments_order"`);
    await queryRunner.query(`DROP INDEX "IDX_order_items_order"`);
    await queryRunner.query(`DROP INDEX "IDX_orders_status"`);
    await queryRunner.query(`DROP INDEX "IDX_orders_table"`);
    await queryRunner.query(`DROP INDEX "IDX_products_category"`);
    await queryRunner.query(`DROP TABLE "settings"`);
    await queryRunner.query(`DROP TABLE "printers"`);
    await queryRunner.query(`DROP TABLE "payments"`);
    await queryRunner.query(`DROP TABLE "order_items"`);
    await queryRunner.query(`DROP TABLE "orders"`);
    await queryRunner.query(`DROP TABLE "tables"`);
    await queryRunner.query(`DROP TABLE "products"`);
    await queryRunner.query(`DROP TABLE "categories"`);
  }
}
