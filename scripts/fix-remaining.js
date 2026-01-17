const API_BASE = 'http://localhost:3001/api';

// Manuel eşleştirmeler - DB'deki isim -> Excel kategorisi
const manualMappings = {
  // Çocuk Menü
  'Çilekli Milkshake': 'Çocuk Menü',
  
  // Kutu İçecekler
  'Cappy Atom Karışık Meyve Nektarı': 'Kutu İçecekler',
  'Cappy Şeftali Nektarı': 'Kutu İçecekler',
  'Cappy Bahçe Meyve Nektarı': 'Kutu İçecekler',
  'Fuse Tea Ananas İçecek': 'Kutu İçecekler',
  'Fuse Tea Limon Nektarlı İçecek': 'Kutu İçecekler',
  'Fuse Tea Şeftali Nektarlı İçecek': 'Kutu İçecekler',
  'Red Bull': 'Kutu İçecekler',
  
  // Sıcak İçecekler
  'Süt': 'Sıcak İçecekler',
  
  // Çay & Bitki Çayı
  'İnce Belli Çay': 'Çay & Bitki Çayı',
  
  // Sıcak Dünya Kahveleri
  'Cappuccino': 'Sıcak Dünya Kahveleri',
  
  // Türk Kahveleri
  'Dibek Kahvesi': 'Türk Kahveleri',
  'Menengiç Kahvesi': 'Türk Kahveleri',
  
  // Soğuk Dünya Kahveleri
  'Ice Coffe Frappe': 'Soğuk Dünya Kahveleri',
  'Ice White Chocolate Mocha': 'Soğuk Dünya Kahveleri',
  'Ice Mocha': 'Soğuk Dünya Kahveleri',
  'Ice Americano': 'Soğuk Dünya Kahveleri',
  'Ice Latte': 'Soğuk Dünya Kahveleri',
  
  // Frozen
  'Çilekli Frozen': 'Frozen',
  'Karadutlu Frozen': 'Frozen',
  'Ananaslı Frozen': 'Frozen',
  'Karpuzlu Frozen': 'Frozen',
  'Orman Meyveli Frozen': 'Frozen',
  
  // MilkShake
  'Vanilyalı Milkshake': 'MilkShake',
  
  // Queen Kokteyl
  'Karadut Limon Kokteyl': 'Queen Kokteyl',
  'Hibiskus Kokteyl': 'Queen Kokteyl',
  'Mango Şeftali Kokteyl': 'Queen Kokteyl',
  'Limonlu Hibiskus Kokteyl': 'Queen Kokteyl',
  'Karadutlu Limonlu Kokteyl': 'Queen Kokteyl',
  'Limonlu Hibuskuslu Kokteyl': 'Queen Kokteyl',
  'Hibuskuslu Kokteyl': 'Queen Kokteyl',
  
  // Taze Sıkma
  'Nar Portakal': 'Taze Sıkma',
  'Nar Suyu': 'Taze Sıkma',
  
  // Krepler
  'Queen Sushi': 'Krepler',
  
  // Waffle
  'Wafflecı Sen Ol': 'Waffle',
  'Happy Birth Day Waffle': 'Waffle',
  
  // Pastalar
  'Mild Flavor Pasta': 'Pastalar',
  'Yeşil Tutku': 'Pastalar',
  'Flavor Dance - 2 Kişilik': 'Pastalar',
  'Flavor Dance - 1 Kişilik': 'Pastalar',
};

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
  return res.json();
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
  
  // Ürünleri al
  const products = await fetchJSON(`${API_BASE}/products`);
  
  // Harikalarımız kategorisindeki ürünleri bul
  const harikalarId = categoryMap['Harikalarımız'];
  const harikalar = products.filter(p => p.categoryId === harikalarId);
  
  console.log(`Harikalarımız'da ${harikalar.length} ürün var`);
  
  let updated = 0;
  
  for (const product of harikalar) {
    const targetCategory = manualMappings[product.name];
    
    if (targetCategory) {
      const targetCategoryId = categoryMap[targetCategory];
      
      if (targetCategoryId) {
        console.log(`📦 ${product.name} -> ${targetCategory}`);
        await updateProduct(product.id, {
          categoryId: targetCategoryId
        });
        updated++;
      }
    }
  }
  
  console.log(`\n✅ ${updated} ürün güncellendi`);
  
  // Kalan ürünleri listele
  const remaining = harikalar.filter(p => !manualMappings[p.name]);
  if (remaining.length > 0) {
    console.log(`\n⚠️ Kalan ${remaining.length} ürün:`);
    remaining.forEach(p => console.log(`  - ${p.name}`));
  }
}

main().catch(console.error);
