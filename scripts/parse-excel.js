const XLSX = require('xlsx');
const path = require('path');
const fs = require('fs');

const filePath = path.join(__dirname, '../prod-yapilacaklar/QUEEN WAFFLE MENÜ.xlsx');
const workbook = XLSX.readFile(filePath);

const result = {};

workbook.SheetNames.forEach(sheetName => {
  const sheet = workbook.Sheets[sheetName];
  const data = XLSX.utils.sheet_to_json(sheet, { header: 1 });
  // Filter out empty rows
  result[sheetName] = data.filter(row => row.length > 0);
});

// Write to JSON file
fs.writeFileSync(
  path.join(__dirname, 'menu-data.json'),
  JSON.stringify(result, null, 2),
  'utf8'
);

console.log('Saved to scripts/menu-data.json');
console.log('Total rows per sheet:');
Object.keys(result).forEach(sheet => {
  console.log(`  ${sheet}: ${result[sheet].length} rows`);
});
