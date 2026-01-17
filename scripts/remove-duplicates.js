const http = require('http');

function fetchProducts() {
  return new Promise((resolve, reject) => {
    http.get('http://localhost:3001/api/products', (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => resolve(JSON.parse(data)));
    }).on('error', reject);
  });
}

function deleteProduct(id) {
  return new Promise((resolve, reject) => {
    const req = http.request({
      hostname: 'localhost',
      port: 3001,
      path: `/api/products/${id}`,
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
  const products = await fetchProducts();
  
  // İsme göre grupla
  const byName = {};
  products.forEach(p => {
    if (!byName[p.name]) byName[p.name] = [];
    byName[p.name].push(p);
  });
  
  let deleted = 0;
  
  for (const [name, items] of Object.entries(byName)) {
    if (items.length > 1) {
      // Görseli olan varsa onu tut, yoksa ilkini tut
      const withImage = items.find(i => i.image);
      const toKeep = withImage || items[0];
      
      for (const item of items) {
        if (item.id !== toKeep.id) {
          const status = await deleteProduct(item.id);
          console.log(`Silindi: ${name} (${item.id.slice(0,8)}) - Status: ${status}`);
          deleted++;
        }
      }
    }
  }
  
  console.log(`\nToplam ${deleted} duplicate silindi.`);
}

main().catch(console.error);
