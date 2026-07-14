const fs = require('fs');
const path = require('path');
const sourceDb = path.join(__dirname, 'db.base64');
const destDb = path.join(__dirname, 'data/dev.db');
const marker = path.join(__dirname, 'data/migrated_base64.marker');
if (process.env.DATABASE_URL && fs.existsSync(sourceDb) && !fs.existsSync(marker)) {
  console.log('MIGRATION: Decoding and copying localhost database to live volume...');
  if (!fs.existsSync(path.dirname(destDb))) fs.mkdirSync(path.dirname(destDb), { recursive: true });
  const base64Data = fs.readFileSync(sourceDb, 'utf8');
  const buffer = Buffer.from(base64Data, 'base64');
  fs.writeFileSync(destDb, buffer);
  fs.writeFileSync(marker, 'done');
  console.log('MIGRATION: Successfully uploaded localhost database from Base64!');
}
