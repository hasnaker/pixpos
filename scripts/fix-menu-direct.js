const fs = require('fs');
const path = require('path');

const API_BASE = 'http://localhost:3001/api';

// Excel'den gelen veriler
const menuData = JSON.parse(fs.readFileSync(path.join(__dirname, 'menu-data.json'), 'utf8'));
const excelRows = menuData.Sayfa1.slice(1);

// Kategorileri ve ürünleri grupla
const categoryProducts = {};
excelRows.forEach(row => {
  const [category, productName, price, description] = row;
  if (!category || !productName) return;
  
  if (!categoryProducts[category]) {
    categoryProducts[category] = [];
  }
  categoryProducts[category].push({
    name: productName.trim(),
    price: parseFloat(price) || 0,
    description: description?.trim() || null
  });
});

async function fetchJSON(url) {
  const res = await fetch(url);
  return res.json();
}

async function updateProduct(id, data) {
  const res = await fetch(`${API_BASE}/products/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  });
  if (!res.ok) {
    const text = await res.text();
    console.log(`  ❌ Hata: ${res.status} - ${text.substring(0, 100)}`);
    return null;
  }
  return res.json();
}

// Normalize string for comparison
function normalize(str) {
  return str
    .toLowerCase()
    .trim()
    .replace(/\s+/g, ' ')
    .replace(/ı/g, 'i')
    .replace(/ğ/g, 'g')
    .replace(/ü/g, 'u')
    .replace(/ş/g, 's')
    .replace(/ö/g, 'o')
    .replace(/ç/g, 'c');
}

async function main() {
  // Kategorileri al
  const menus = await fetchJSON(`${API_BASE}/menus`);
  const categoryMap = {};
  
  menus.forEach(menu => {
    menu.categories.forEach(cat => {
      categoryMap[cat.name] = cat.id;
    });
  });
  
  console.log('Kategoriler:', Object.keys(categoryMap).length);
  
  // Ürünleri al
  const products = await fetchJSON(`${API_BASE}/products`);
  console.log('Toplam ürün:', products.length);
  
  let updated = 0;
  let errors = [];
  
  for (const excelCategory of Object.keys(categoryProducts)) {
    const targetCategoryId = categoryMap[excelCategory];
    
    if (!targetCategoryId) {
      console.log(`❌ Kategori bulunamadı: ${excelCategory}`);
      continue;
    }
    
    for (const excelProduct of categoryProducts[excelCategory]) {
      const normalizedExcel = normalize(excelProduct.name);
      
      // Ürünü bul
      const dbProduct = products.find(p => {
        const normalizedDb = normalize(p.name);
        
        // Exact match
        if (normalizedDb === normalizedExcel) return true;
        
        // Partial match
        if (normalizedDb.includes(normalizedExcel) || normalizedExcel.includes(normalizedDb)) return true;
        
        // Special cases
        if (excelProduct.name.toLowerCase().includes('kids') && p.name.toLowerCase().includes('kids')) {
          if (excelProduct.name.toLowerCase().includes('mavi') && p.name.toLowerCase().includes('mavi')) return true;
          if (excelProduct.name.toLowerCase().includes('pembe') && p.name.toLowerCase().includes('pembe')) return true;
        }
        
        return false;
      });
      
      if (dbProduct && dbProduct.categoryId !== targetCategoryId) {
        console.log(`📦 ${dbProduct.name} -> ${excelCategory}`);
        
        const result = await updateProduct(dbProduct.id, {
          categoryId: targetCategoryId,
          price: excelProduct.price
        });
        
        if (result) {
          updated++;
          // Remove from products array to avoid duplicate matches
          const idx = products.indexOf(dbProduct);
          if (idx > -1) products.splice(idx, 1);
        }
      }
    }
  }
  
  console.log(`\n✅ ${updated} ürün güncellendi`);
}

main().catch(console.error);
