const http = require('http');

function fetchCategories() {
  return new Promise((resolve, reject) => {
    http.get('http://localhost:3001/api/categories', (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => resolve(JSON.parse(data)));
    }).on('error', reject);
  });
}

function fetchProducts() {
  return new Promise((resolve, reject) => {
    http.get('http://localhost:3001/api/products', (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => resolve(JSON.parse(data)));
    }).on('error', reject);
  });
}

function deleteCategory(id) {
  return new Promise((resolve, reject) => {
    const req = http.request({
      hostname: 'localhost',
      port: 3001,
      path: `/api/categories/${id}`,
      method: 'DELETE'
    }, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => resolve(res.statusCode));
    });
    req.on('error', reject);
    req.end();
  });
}

async function main() {
  const categories = await fetchCategories();
  const products = await fetchProducts();
  
  // Kullanılan kategori ID'lerini bul
  const usedCatIds = new Set();
  products.forEach(p => {
    if (p.category?.id) usedCatIds.add(p.category.id);
  });
  
  console.log(`${categories.length} kategori, ${usedCatIds.size} tanesi kullanılıyor\n`);
  
  let deleted = 0;
  for (const cat of categories) {
    if (!usedCatIds.has(cat.id)) {
      const status = await deleteCategory(cat.id);
      console.log(`Silindi: ${cat.name} - Status: ${status}`);
      deleted++;
    }
  }
  
  console.log(`\n${deleted} boş kategori silindi.`);
}

main().catch(console.error);
