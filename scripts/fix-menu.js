const fs = require('fs');
const path = require('path');

const API_BASE = 'http://localhost:3001/api';

// Excel'den gelen veriler
const menuData = JSON.parse(fs.readFileSync(path.join(__dirname, 'menu-data.json'), 'utf8'));
const excelRows = menuData.Sayfa1.slice(1); // Header'ı atla

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

console.log('Excel kategorileri:');
Object.keys(categoryProducts).forEach(cat => {
  console.log(`  ${cat}: ${categoryProducts[cat].length} ürün`);
});

async function fetchJSON(url) {
  const res = await fetch(url);
  return res.json();
}

async function postJSON(url, data) {
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  });
  return res.json();
}

async function patchJSON(url, data) {
  const res = await fetch(url, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  });
  return res.json();
}

async function main() {
  // 1. Mevcut menüleri al
  const menus = await fetchJSON(`${API_BASE}/menus`);
  const anaMenu = menus.find(m => m.name === 'Ana Menü');
  const cocukMenu = menus.find(m => m.name === 'Çocuk Menüsü');
  
  if (!anaMenu) {
    console.error('Ana Menü bulunamadı!');
    return;
  }
  
  console.log('\nAna Menü ID:', anaMenu.id);
  console.log('Çocuk Menüsü ID:', cocukMenu?.id);
  
  // 2. Mevcut kategorileri al
  const existingCategories = {};
  anaMenu.categories.forEach(c => {
    existingCategories[c.name] = c.id;
  });
  if (cocukMenu) {
    cocukMenu.categories.forEach(c => {
      existingCategories[c.name] = c.id;
    });
  }
  
  console.log('\nMevcut kategoriler:', Object.keys(existingCategories));
  
  // 3. Eksik kategorileri oluştur
  const categoryMap = {}; // Excel kategori adı -> DB kategori ID
  
  for (const excelCategory of Object.keys(categoryProducts)) {
    // Çocuk Menü kategorisi Çocuk Menüsü'ne gitmeli
    const targetMenuId = excelCategory === 'Çocuk Menü' ? cocukMenu?.id : anaMenu.id;
    
    // Mevcut kategori var mı kontrol et
    let categoryId = existingCategories[excelCategory];
    
    if (!categoryId) {
      // Kategori yok, oluştur
      console.log(`\nKategori oluşturuluyor: ${excelCategory}`);
      const newCat = await postJSON(`${API_BASE}/categories`, {
        name: excelCategory,
        menuId: targetMenuId,
        isActive: true,
        sortOrder: 0
      });
      categoryId = newCat.id;
      console.log(`  -> ID: ${categoryId}`);
    }
    
    categoryMap[excelCategory] = categoryId;
  }
  
  console.log('\nKategori eşleştirmeleri:', categoryMap);
  
  // 4. Mevcut ürünleri al
  const products = await fetchJSON(`${API_BASE}/products`);
  console.log(`\nToplam ${products.length} ürün bulundu`);
  
  // 5. Ürünleri eşleştir ve güncelle
  let updated = 0;
  let notFound = [];
  
  for (const excelCategory of Object.keys(categoryProducts)) {
    const targetCategoryId = categoryMap[excelCategory];
    
    for (const excelProduct of categoryProducts[excelCategory]) {
      // Ürünü bul (isim eşleştirmesi)
      const dbProduct = products.find(p => {
        const pName = p.name.toLowerCase().trim();
        const eName = excelProduct.name.toLowerCase().trim();
        return pName === eName || 
               pName.includes(eName) || 
               eName.includes(pName) ||
               // Özel eşleştirmeler
               (eName === 'kids waffle mavi' && pName.includes('kids waffle') && pName.includes('mavi')) ||
               (eName === 'kids waffle pembe' && pName.includes('kids waffle') && pName.includes('pembe'));
      });
      
      if (dbProduct) {
        // Ürünü güncelle (sadece kategori ve fiyat, görsel dokunma!)
        if (dbProduct.categoryId !== targetCategoryId) {
          console.log(`  Taşınıyor: ${dbProduct.name} -> ${excelCategory}`);
          await patchJSON(`${API_BASE}/products/${dbProduct.id}`, {
            categoryId: targetCategoryId,
            price: excelProduct.price,
            description: excelProduct.description || dbProduct.description
          });
          updated++;
        }
      } else {
        notFound.push(`${excelCategory}: ${excelProduct.name}`);
      }
    }
  }
  
  console.log(`\n✅ ${updated} ürün güncellendi`);
  
  if (notFound.length > 0) {
    console.log(`\n⚠️ Eşleşmeyen ürünler (${notFound.length}):`);
    notFound.forEach(p => console.log(`  - ${p}`));
  }
}

main().catch(console.error);
