const https = require('https');
const fs = require('fs');

const agent = new https.Agent({ rejectUnauthorized: false });

async function del(endpoint) {
  return new Promise(resolve => {
    const req = https.request({
      hostname: '3.64.134.129',
      port: 443,
      path: endpoint,
      method: 'DELETE',
      headers: { 'Host': 'api.pixpos.cloud' },
      agent
    }, res => {
      let d = '';
      res.on('data', c => d += c);
      res.on('end', () => resolve(d));
    });
    req.on('error', () => resolve('error'));
    req.end();
  });
}

async function get(endpoint) {
  return new Promise(resolve => {
    https.get({
      hostname: '3.64.134.129',
      port: 443,
      path: endpoint,
      headers: { 'Host': 'api.pixpos.cloud' },
      agent
    }, res => {
      let d = '';
      res.on('data', c => d += c);
      res.on('end', () => resolve(JSON.parse(d)));
    }).on('error', () => resolve([]));
  });
}

async function main() {
  console.log('🧹 Duplicate temizliği başlıyor...\n');

  // 1. Kategorileri al
  console.log('📂 Kategoriler alınıyor...');
  const cats = await get('/api/categories');
  console.log(`   ${cats.length} kategori bulundu`);

  // Group by name
  const byName = {};
  cats.forEach(c => {
    if (!byName[c.name]) byName[c.name] = [];
    byName[c.name].push(c);
  });

  // Find duplicates (keep oldest)
  const catsToDelete = [];
  Object.entries(byName).forEach(([name, arr]) => {
    if (arr.length > 1) {
      arr.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
      arr.slice(1).forEach(c => catsToDelete.push({ id: c.id, name: c.name }));
    }
  });

  console.log(`   ${catsToDelete.length} duplicate kategori silinecek\n`);

  // 2. Ürünleri al
  console.log('📦 Ürünler alınıyor...');
  const products = await get('/api/products');
  console.log(`   ${products.length} ürün bulundu`);

  // Group by name
  const prodByName = {};
  products.forEach(p => {
    if (!prodByName[p.name]) prodByName[p.name] = [];
    prodByName[p.name].push(p);
  });

  // Find duplicates
  const prodsToDelete = [];
  Object.entries(prodByName).forEach(([name, arr]) => {
    if (arr.length > 1) {
      arr.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
      arr.slice(1).forEach(p => prodsToDelete.push({ id: p.id, name: p.name }));
    }
  });

  console.log(`   ${prodsToDelete.length} duplicate ürün silinecek\n`);

  // 3. Önce ürünleri sil
  console.log('🗑️ Duplicate ürünler siliniyor...');
  let deleted = 0;
  for (const p of prodsToDelete) {
    await del(`/api/products/${p.id}`);
    deleted++;
    if (deleted % 10 === 0) process.stdout.write('.');
  }
  console.log(`\n   ${deleted} ürün silindi\n`);

  // 4. Sonra kategorileri sil
  console.log('🗑️ Duplicate kategoriler siliniyor...');
  deleted = 0;
  for (const c of catsToDelete) {
    await del(`/api/categories/${c.id}`);
    deleted++;
    process.stdout.write('.');
  }
  console.log(`\n   ${deleted} kategori silindi\n`);

  console.log('✅ Temizlik tamamlandı!');
}

main().catch(console.error);
