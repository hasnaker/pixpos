const http = require('http');
const menuData = require('./menu-data.json');

// Excel'den kategori-ürün eşleşmelerini çıkar
const excelProducts = {};
const rows = menuData.Sayfa1.slice(1); // Header'ı atla

rows.forEach(row => {
  const category = row[0];
  const productName = row[1];
  if (category && productName) {
    if (!excelProducts[category]) {
      excelProducts[category] = [];
    }
    excelProducts[category].push(productName.trim());
  }
});

console.log('Excel kategorileri:');
Object.keys(excelProducts).forEach(cat => {
  console.log(`  ${cat}: ${excelProducts[cat].length} ürün`);
});

// API'den kategorileri al
function fetchCategories() {
  return new Promise((resolve, reject) => {
    http.get('http://localhost:3001/api/categories', (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => resolve(JSON.parse(data)));
    }).on('error', reject);
  });
}

// API'den ürünleri al
function fetchProducts() {
  return new Promise((resolve, reject) => {
    http.get('http://localhost:3001/api/products', (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => resolve(JSON.parse(data)));
    }).on('error', reject);
  });
}

// Ürünü güncelle
function updateProduct(id, categoryId) {
  return new Promise((resolve, reject) => {
    const req = http.request({
      hostname: 'localhost',
      port: 3001,
      path: `/api/products/${id}`,
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' }
    }, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        if (res.statusCode === 200) {
          resolve(JSON.parse(data));
        } else {
          reject(new Error(`HTTP ${res.statusCode}: ${data}`));
        }
      });
    });
    req.on('error', reject);
    req.write(JSON.stringify({ categoryId }));
    req.end();
  });
}

// İsim normalize et
function normalize(name) {
  return name
    .toLowerCase()
    .replace(/ı/g, 'i')
    .replace(/ğ/g, 'g')
    .replace(/ü/g, 'u')
    .replace(/ş/g, 's')
    .replace(/ö/g, 'o')
    .replace(/ç/g, 'c')
    .replace(/\s+/g, ' ')
    .trim();
}

async function main() {
  const categories = await fetchCategories();
  const products = await fetchProducts();
  
  console.log(`\nDB'de ${products.length} ürün, ${categories.length} kategori var\n`);
  
  // Kategori isim -> ID map
  const categoryMap = {};
  categories.forEach(c => {
    categoryMap[c.name] = c.id;
    categoryMap[normalize(c.name)] = c.id;
  });
  
  // Excel ürün ismi -> kategori map
  const productToCategory = {};
  Object.keys(excelProducts).forEach(catName => {
    excelProducts[catName].forEach(prodName => {
      productToCategory[normalize(prodName)] = catName;
    });
  });
  
  let updated = 0;
  let notFound = [];
  let wrongCategory = [];
  
  for (const product of products) {
    const normalizedName = normalize(product.name);
    const excelCategory = productToCategory[normalizedName];
    
    if (!excelCategory) {
      notFound.push(product.name);
      continue;
    }
    
    const targetCategoryId = categoryMap[excelCategory];
    if (!targetCategoryId) {
      console.log(`Kategori bulunamadı: ${excelCategory}`);
      continue;
    }
    
    const currentCategory = product.category?.name;
    if (currentCategory !== excelCategory) {
      wrongCategory.push({
        name: product.name,
        current: currentCategory,
        target: excelCategory
      });
      
      try {
        await updateProduct(product.id, targetCategoryId);
        console.log(`✓ ${product.name}: ${currentCategory} -> ${excelCategory}`);
        updated++;
      } catch (err) {
        console.log(`✗ ${product.name}: ${err.message}`);
      }
    }
  }
  
  console.log(`\n=== SONUÇ ===`);
  console.log(`Güncellenen: ${updated}`);
  console.log(`Excel'de bulunamayan: ${notFound.length}`);
  
  if (notFound.length > 0) {
    console.log('\nExcel\'de olmayan ürünler:');
    notFound.forEach(n => console.log(`  - ${n}`));
  }
}

main().catch(console.error);
