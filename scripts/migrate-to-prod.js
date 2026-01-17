const https = require('https');
const http = require('http');

const LOCAL_API = 'http://localhost:3001';
const PROD_API = 'https://3.64.134.129';
const PROD_HOST = 'api.pixpos.cloud';

const agent = new https.Agent({ rejectUnauthorized: false });

async function fetchLocal(endpoint) {
  return new Promise((resolve, reject) => {
    http.get(`${LOCAL_API}${endpoint}`, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => resolve(JSON.parse(data)));
    }).on('error', reject);
  });
}

async function postProd(endpoint, body) {
  return new Promise((resolve, reject) => {
    const url = new URL(`${PROD_API}${endpoint}`);
    const options = {
      hostname: url.hostname,
      port: 443,
      path: url.pathname,
      method: 'POST',
      headers: {
        'Host': PROD_HOST,
        'Content-Type': 'application/json'
      },
      agent
    };
    
    const req = https.request(options, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          resolve(JSON.parse(data));
        } catch {
          resolve(data);
        }
      });
    });
    req.on('error', reject);
    req.write(JSON.stringify(body));
    req.end();
  });
}

async function migrate() {
  console.log('🚀 Migration başlıyor...\n');
  
  // 1. Kategorileri al
  console.log('📂 Kategoriler alınıyor...');
  const categories = await fetchLocal('/api/categories');
  console.log(`   ${categories.length} kategori bulundu`);
  
  // 2. Ürünleri al
  console.log('📦 Ürünler alınıyor...');
  const products = await fetchLocal('/api/products');
  console.log(`   ${products.length} ürün bulundu`);
  
  // 3. Kategori ID mapping
  const categoryMap = {};
  
  // 4. Kategorileri ekle
  console.log('\n📂 Kategoriler ekleniyor...');
  for (const cat of categories) {
    const newCat = await postProd('/api/categories', {
      name: cat.name,
      sortOrder: cat.sortOrder || 0,
      isActive: cat.isActive
    });
    if (newCat.id) {
      categoryMap[cat.id] = newCat.id;
      console.log(`   ✅ ${cat.name}`);
    } else {
      console.log(`   ❌ ${cat.name}: ${JSON.stringify(newCat)}`);
    }
  }
  
  // 5. Ürünleri ekle
  console.log('\n📦 Ürünler ekleniyor...');
  let success = 0, failed = 0;
  for (const prod of products) {
    const newCatId = categoryMap[prod.categoryId];
    if (!newCatId) {
      console.log(`   ⚠️ ${prod.name}: kategori bulunamadı`);
      failed++;
      continue;
    }
    
    const newProd = await postProd('/api/products', {
      name: prod.name,
      price: parseFloat(prod.price),
      categoryId: newCatId,
      description: prod.description,
      imageUrl: prod.imageUrl,
      isActive: prod.isActive,
      sortOrder: prod.sortOrder || 0
    });
    
    if (newProd.id) {
      success++;
      process.stdout.write('.');
    } else {
      failed++;
      console.log(`\n   ❌ ${prod.name}: ${JSON.stringify(newProd)}`);
    }
  }
  
  console.log(`\n\n✅ Migration tamamlandı!`);
  console.log(`   Kategoriler: ${Object.keys(categoryMap).length}`);
  console.log(`   Ürünler: ${success} başarılı, ${failed} başarısız`);
}

migrate().catch(console.error);
