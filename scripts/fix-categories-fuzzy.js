const http = require('http');
const menuData = require('./menu-data.json');

// Excel'den kategori-ürün eşleşmelerini çıkar
const excelProducts = {};
const rows = menuData.Sayfa1.slice(1);

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

// API fonksiyonları
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
        if (res.statusCode === 200) resolve(JSON.parse(data));
        else reject(new Error(`HTTP ${res.statusCode}`));
      });
    });
    req.on('error', reject);
    req.write(JSON.stringify({ categoryId }));
    req.end();
  });
}

// Manuel eşleştirmeler - DB ismi -> Excel ismi
const manualMappings = {
  // Çocuk Menü
  'Çilekli MilkShake': 'Kids Çilekli Milkshake',
  'Solucan Jelly': 'Solucan Jelly Mavi',
  'LOL Menü - W Girl': 'Lol Menü',
  'Sütlü Dip Çikolata Kids Waffle': 'Kids Waffle Mavi',
  'Kids Waffle': 'Kids Waffle Pembe',
  'Çilekli Milkshake': 'Kids Çilekli Milkshake',
  'Kakaolu Süt': 'Kids Kakaolu süt',
  
  // Kutu İçecekler
  'Beypazarı Limon Meyveli Soda': 'Meyveli Soda',
  'Beypazarı Soda Doğal Maden Suyu': 'Soda',
  'Cappy Atom Karışık Meyve Nektarı': 'Cappy ve Çeşitleri',
  'Cappy Şeftali Nektarı': 'Cappy ve Çeşitleri',
  'Cappy Bahçe Meyve Nektarı': 'Cappy ve Çeşitleri',
  'Fuse Tea Ananas İçecek': 'Fusetea ve Çeşitleri',
  'Fuse Tea Limon Nektarlı İçecek': 'Fusetea ve Çeşitleri',
  'Fuse Tea Şeftali Nektarlı İçecek': 'Fusetea ve Çeşitleri',
  'Red Bull': 'Redbull',
  'Coca Cola': 'Cola',
  
  // Çay & Bitki Çayı
  'İnce Belli Çay': 'Çay ',
  'Nane Limon': 'Nane Limon Çayı',
  'Ihlamur': 'Ihlamur Çayı',
  'Yeşil Çay': 'Yeşil Çayı',
  
  // Kahveler
  'Cappuccino': 'Capucino',
  'Dibek Kahvesi': 'Dibek Türk Kahvesi',
  'Menengiç Kahvesi': 'Menengiç Türk Kahvesi',
  'Guatemala Filtre Kahve': 'Guatemala',
  'Kenya Filtre Kahve': 'Kenya',
  'Fransız Vanilya Filtre Kahve': 'Fransız Vanilya',
  
  // Soğuk Kahveler
  'Ice Coffe Frappe': 'İce Coffee Frappe',
  'Ice White Chocolate Mocha': 'İce White Chocolate Mocha',
  'Ice Mocha': 'İce Mocha',
  'Ice Americano': 'İce Americano',
  'Ice Latte': 'İce Latte',
  
  // Kokteyl
  'Nane Limon Mojito': 'Mojito ',
  'Karadutlu Limonlu Kokteyl': 'Karadut-Limon Kokteyl',
  'Limonlu Hibuskuslu Kokteyl': 'Limonlu-Hibiskuslu Kokteyl',
  'Aurora Kokteyl': 'Aurora',
  'Mango Şeftali Kokteyl': 'Manga Şeftali Kokteyl',
  'Hibuskuslu Kokteyl': 'Hibiskuslu Kokteyl',
  
  // Frozen
  'Çilekli Frozen': 'Çilek Frozen',
  'Karadutlu Frozen': 'Karadut Frozen',
  'Ananaslı Frozen': 'Ananas Frozen',
  'Karpuzlu Frozen': 'Karpuz Frozen',
  
  // MilkShake
  'Vanilyalı Milkshake': 'Vanilya MilkShake',
  
  // Taze Sıkma
  'Portakal Nar Suyu': 'NarPortakal',
  
  // Dondurma
  'Külah Dondurma': 'Külah Dondurma Çeşitleri',
  
  // Waffle
  'Happy Birth Day Waffle': 'Happy Birthday Waffle',
  
  // Pastalar
  'Mild Flavor Pasta': 'Mild Flawor Pasta',
  'Yeşil Tutku': 'Passion Verte',
  'Flavor Dance - 2 Kişilik': 'Flavor Dance Çift',
  'Flavor Dance - 1 Kişilik': 'Flavor Dance Tek',
};

// Excel ürün ismi -> kategori map
const productToCategory = {};
Object.keys(excelProducts).forEach(catName => {
  excelProducts[catName].forEach(prodName => {
    productToCategory[prodName] = catName;
    productToCategory[prodName.toLowerCase()] = catName;
    productToCategory[prodName.trim()] = catName;
  });
});

async function main() {
  const categories = await fetchCategories();
  const products = await fetchProducts();
  
  // Kategori isim -> ID map
  const categoryMap = {};
  categories.forEach(c => {
    categoryMap[c.name] = c.id;
  });
  
  let updated = 0;
  let notFound = [];
  
  for (const product of products) {
    // Önce manuel mapping'e bak
    let excelName = manualMappings[product.name];
    let targetCategory = excelName ? productToCategory[excelName] : null;
    
    // Manuel mapping yoksa direkt isimle dene
    if (!targetCategory) {
      targetCategory = productToCategory[product.name] || productToCategory[product.name.toLowerCase()];
    }
    
    if (!targetCategory) {
      notFound.push(product.name);
      continue;
    }
    
    const targetCategoryId = categoryMap[targetCategory];
    if (!targetCategoryId) {
      console.log(`Kategori bulunamadı: ${targetCategory}`);
      continue;
    }
    
    const currentCategory = product.category?.name;
    if (currentCategory !== targetCategory) {
      try {
        await updateProduct(product.id, targetCategoryId);
        console.log(`✓ ${product.name}: ${currentCategory} -> ${targetCategory}`);
        updated++;
      } catch (err) {
        console.log(`✗ ${product.name}: ${err.message}`);
      }
    }
  }
  
  console.log(`\n=== SONUÇ ===`);
  console.log(`Güncellenen: ${updated}`);
  console.log(`Bulunamayan: ${notFound.length}`);
  
  if (notFound.length > 0) {
    console.log('\nHala eşleşmeyen ürünler:');
    notFound.forEach(n => console.log(`  - ${n}`));
  }
}

main().catch(console.error);
