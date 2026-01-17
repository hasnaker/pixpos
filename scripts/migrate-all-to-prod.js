const https = require('https');
const http = require('http');

const LOCAL_API = 'http://localhost:3001';
const PROD_IP = '3.64.134.129';
const PROD_HOST = 'api.pixpos.cloud';

const agent = new https.Agent({ rejectUnauthorized: false });

async function fetchLocal(endpoint) {
  return new Promise((resolve, reject) => {
    http.get(`${LOCAL_API}${endpoint}`, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try { resolve(JSON.parse(data)); }
        catch { resolve([]); }
      });
    }).on('error', reject);
  });
}

async function postProd(endpoint, body) {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: PROD_IP,
      port: 443,
      path: endpoint,
      method: 'POST',
      headers: { 'Host': PROD_HOST, 'Content-Type': 'application/json' },
      agent
    };
    const req = https.request(options, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try { resolve(JSON.parse(data)); }
        catch { resolve(data); }
      });
    });
    req.on('error', reject);
    req.write(JSON.stringify(body));
    req.end();
  });
}

async function migrate() {
  console.log('🚀 Tüm veriler aktarılıyor...\n');
  
  // 1. Zonlar
  console.log('📍 Zonlar...');
  const zones = await fetchLocal('/api/zones');
  const zoneMap = {};
  for (const z of zones) {
    const newZ = await postProd('/api/zones', {
      name: z.name, floor: z.floor, sortOrder: z.sortOrder || 0
    });
    if (newZ.id) { zoneMap[z.id] = newZ.id; console.log(`   ✅ ${z.name}`); }
  }
  
  // 2. Masalar
  console.log('\n🪑 Masalar...');
  const tables = await fetchLocal('/api/tables');
  let tableCount = 0;
  for (const t of tables) {
    const newT = await postProd('/api/tables', {
      name: t.name,
      number: t.number,
      capacity: t.capacity || 4,
      zoneId: zoneMap[t.zoneId] || null,
      status: 'available'
    });
    if (newT.id) { tableCount++; process.stdout.write('.'); }
  }
  console.log(`\n   ${tableCount} masa eklendi`);
  
  // 3. Kullanıcılar
  console.log('\n👤 Kullanıcılar...');
  const users = await fetchLocal('/api/users');
  for (const u of users) {
    const newU = await postProd('/api/users', {
      name: u.name,
      pin: u.pin,
      role: u.role || 'waiter'
    });
    if (newU.id) console.log(`   ✅ ${u.name} (${u.role})`);
  }
  
  // 4. Yazıcılar
  console.log('\n🖨️ Yazıcılar...');
  const printers = await fetchLocal('/api/printers');
  for (const p of printers) {
    const newP = await postProd('/api/printers', {
      name: p.name,
      type: p.type,
      connectionType: p.connectionType,
      ipAddress: p.ipAddress,
      port: p.port,
      isActive: p.isActive
    });
    if (newP.id) console.log(`   ✅ ${p.name}`);
  }
  
  console.log('\n✅ Migration tamamlandı!');
}

migrate().catch(console.error);
