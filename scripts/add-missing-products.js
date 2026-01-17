const fs = require('fs');
const path = require('path');

const API_BASE = 'http://localhost:3001/api';

// Eşleşmeyen ürünler
const missingProducts = [
  { category: 'Pastalar', name: 'Flavor Dance Tek', price: 330, description: 'Waffle Ve Pancake Hamuru,Çikolatalı Ve Red Velvet Pasta,Muz,Çilek,Ananas,Sütlü-Beyaz Çikolata' },
  { category: 'Pastalar', name: 'Flavor Dance Çift', price: 600, description: 'Waffle Ve Pancake Hamuru,Çikolatalı Ve Red Velvet Pasta,Muz,Çilek,Ananas,Sütlü-Beyaz Çikolata' },
  { category: 'Pastalar', name: 'Passion Verte', price: 330, description: 'Antep Fıstıklı Kek,Queenin Special Kreması,Çilek,Toz Antep,Queenin Çikolatası' },
  { category: 'Pastalar', name: 'Mild Flawor Pasta', price: 360, description: 'Muz, Çilek, Queen\'in Speciali, Antep Fıstıklı Krema, Queen\'in Çikolatası' },
  { category: 'Waffle', name: 'Happy Birthday Waffle', price: 600, description: '3 Kat Waffle Hamuru, Sütlü-Bitter-Beyaz dip sos, Muz, Ananas, Çilek, Kivi, Pirinç Patlağı, Top Granül' },
  { category: 'Waffle', name: 'Waffleci Sen Ol', price: 370, description: 'Kendin Seç(İsteğe Göre)' },
  { category: 'Sıcak Dünya Kahveleri', name: 'Capucino', price: 140, description: null },
  { category: 'Taze Sıkma', name: 'NarPortakal', price: 130, description: null },
  { category: 'Soğuk Dünya Kahveleri', name: 'İce Coffee Frappe', price: 150, description: 'Buzlu kahve frappe' },
  { category: 'Queen Kokteyl', name: 'Karadut-Limon Kokteyl', price: 150, description: null },
  { category: 'Queen Kokteyl', name: 'Hibiskuslu Kokteyl', price: 140, description: 'Hibiskus içerikli antioksidanlar, antosiyaninler ve polifenoller içerir.' },
  { category: 'Queen Kokteyl', name: 'Manga Şeftali Kokteyl', price: 150, description: 'Mango ve şeftali içerikli ferahlatıcı kokteyl' },
  { category: 'Queen Kokteyl', name: 'Limonlu-Hibiskuslu Kokteyl', price: 140, description: null },
  { category: 'MilkShake', name: 'Çilekli MilkShake', price: 150, description: null },
  { category: 'MilkShake', name: 'Vanilya MilkShake', price: 150, description: 'Vanilya ile hazırlanmış milkshake, çilek sosu ve krema ile' },
  { category: 'Frozen', name: 'Karpuz Frozen', price: 150, description: 'Karpuzlu soğuk içecek' },
  { category: 'Frozen', name: 'Karadut Frozen', price: 150, description: 'Karadut ile hazırlanmış frozen içecek' },
  { category: 'Frozen', name: 'Ananas Frozen', price: 150, description: 'Ananaslı soğuk içecek' },
  { category: 'Frozen', name: 'Çilek Frozen', price: 150, description: 'Çilek ile hazırlanmış frozen içecek' },
  { category: 'Kutu İçecekler', name: 'Fusetea ve Çeşitleri', price: 80, description: null },
  { category: 'Kutu İçecekler', name: 'Cappy ve Çeşitleri', price: 80, description: null },
  { category: 'Kutu İçecekler', name: 'Redbull', price: 110, description: null },
];

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

async function main() {
  // Kategorileri al
  const menus = await fetchJSON(`${API_BASE}/menus`);
  const categories = {};
  
  menus.forEach(menu => {
    menu.categories.forEach(cat => {
      categories[cat.name] = cat.id;
    });
  });
  
  console.log('Mevcut kategoriler:', Object.keys(categories));
  
  let added = 0;
  
  for (const product of missingProducts) {
    const categoryId = categories[product.category];
    
    if (!categoryId) {
      console.log(`❌ Kategori bulunamadı: ${product.category}`);
      continue;
    }
    
    console.log(`➕ Ekleniyor: ${product.name} -> ${product.category}`);
    
    await postJSON(`${API_BASE}/products`, {
      name: product.name,
      price: product.price,
      description: product.description,
      categoryId: categoryId,
      isActive: true,
      sortOrder: 0
    });
    
    added++;
  }
  
  console.log(`\n✅ ${added} yeni ürün eklendi`);
}

main().catch(console.error);
