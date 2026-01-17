#!/usr/bin/env node
/**
 * Migrate product images from DB (base64) to S3
 * Then update DB with CloudFront URLs
 */

const { Client } = require('pg');
const { S3Client, PutObjectCommand } = require('@aws-sdk/client-s3');
const crypto = require('crypto');

const S3_BUCKET = 'pixpos-assets-986906625644';
const S3_REGION = 'eu-central-1';
const CLOUDFRONT_DOMAIN = 'dh8ksnk9abt8f.cloudfront.net';

// Production DB
const dbConfig = {
  host: 'mega-pos-db.crowkq8ykqeo.eu-central-1.rds.amazonaws.com',
  port: 5432,
  database: 'megapos',
  user: 'megapos_user',
  password: 'MegaPos2026Prod!Hsd',
  ssl: { rejectUnauthorized: false }
};

const s3Client = new S3Client({ region: S3_REGION });

async function migrateImages() {
  const client = new Client(dbConfig);
  
  try {
    await client.connect();
    console.log('✅ DB connected');

    // Get products with base64 images
    const result = await client.query(`
      SELECT id, name, image_url 
      FROM products 
      WHERE image_url IS NOT NULL 
        AND image_url LIKE 'data:image%'
    `);

    console.log(`📦 Found ${result.rows.length} products with base64 images`);

    let migrated = 0;
    let failed = 0;

    for (const product of result.rows) {
      try {
        const base64Data = product.image_url;
        
        // Parse base64
        const matches = base64Data.match(/^data:image\/(\w+);base64,(.+)$/);
        if (!matches) {
          console.log(`⚠️ Invalid base64 format: ${product.name}`);
          failed++;
          continue;
        }

        const [, imageType, base64Content] = matches;
        const buffer = Buffer.from(base64Content, 'base64');
        
        // Generate unique filename
        const hash = crypto.createHash('md5').update(product.id).digest('hex').slice(0, 8);
        const filename = `products/${hash}-${product.id}.${imageType}`;

        // Upload to S3
        await s3Client.send(new PutObjectCommand({
          Bucket: S3_BUCKET,
          Key: filename,
          Body: buffer,
          ContentType: `image/${imageType}`,
          CacheControl: 'max-age=31536000' // 1 year cache
        }));

        // Update DB with CloudFront URL
        const cdnUrl = `https://${CLOUDFRONT_DOMAIN}/${filename}`;
        await client.query(
          'UPDATE products SET image_url = $1 WHERE id = $2',
          [cdnUrl, product.id]
        );

        console.log(`✅ ${product.name} → ${cdnUrl}`);
        migrated++;

      } catch (err) {
        console.error(`❌ Failed: ${product.name}`, err.message);
        failed++;
      }
    }

    console.log('\n📊 Migration complete:');
    console.log(`   ✅ Migrated: ${migrated}`);
    console.log(`   ❌ Failed: ${failed}`);

  } catch (err) {
    console.error('❌ Error:', err);
  } finally {
    await client.end();
  }
}

migrateImages();
