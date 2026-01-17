const { Client } = require('pg');

async function migrate() {
  const client = new Client({
    host: 'localhost',
    port: 5432,
    user: 'postgres',
    password: 'postgres',
    database: 'megapos',
  });

  await client.connect();
  console.log('DB bağlantısı OK');

  const COCUK_TATLILARI = '990c1a16-7942-48bc-821e-60d8ddb3cc31';
  const COCUK_ICECEKLERI = '9c1e843f-31f2-440a-a242-da12b38341d4';

  // Çocuk Tatlıları'na taşınacaklar
  const tatlilar = [
    '6fd94794-5d2b-41eb-aef8-10c90189acb7', // Kids Waffle
    '4c84f341-67f0-4f33-98da-32f2dcee6dc1', // Sütlü Dip Çikolata Kids Waffle
    'fda9c762-19a9-457a-a069-b6f7d43e609e', // Solucan Jelly 1
    'a161db4f-bbcb-4bf9-ad62-14bf69bf9598', // Solucan Jelly 2
  ];

  // Çocuk İçecekleri'ne taşınacaklar
  const icecekler = [
    '36bdebc6-33ee-4b89-bbf6-f0808e8c582d', // Çikolatalı Milkshake
    '0d926e5e-d79e-49d1-bc73-c3467c5d68bb', // Çilekli Milkshake
    'b3cbf7f7-5df7-4706-9a09-cc14d06e8511', // Muzlu Milkshake
    '35b94374-35c7-4c37-a701-1ed284cd67fe', // Kakaolu Süt
    'a9b87e41-4ada-48a7-8597-2cd4cbcbc144', // Süt
    '7a160828-86d6-4ca1-890f-ad8639e9375e', // Limonata
    '773be3c0-98be-4d9d-99a8-5bd096f2e835', // Nar Suyu
    '59c48e3b-a34f-421c-9aaa-c6f1024dce39', // Portakal Suyu
    'c47caea4-8797-4aba-9fa6-bdf675cbb360', // Maskot Su
  ];

  // Tatlıları taşı
  const r1 = await client.query(
    `UPDATE products SET category_id = $1 WHERE id = ANY($2::uuid[])`,
    [COCUK_TATLILARI, tatlilar]
  );
  console.log(`Çocuk Tatlıları: ${r1.rowCount} ürün taşındı`);

  // İçecekleri taşı
  const r2 = await client.query(
    `UPDATE products SET category_id = $1 WHERE id = ANY($2::uuid[])`,
    [COCUK_ICECEKLERI, icecekler]
  );
  console.log(`Çocuk İçecekleri: ${r2.rowCount} ürün taşındı`);

  await client.end();
  console.log('Tamamlandı!');
}

migrate().catch(console.error);
