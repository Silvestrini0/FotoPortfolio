const fs = require('fs');
const path = require('path');

const imgDir = path.join(__dirname, 'img');
const albums = [];
const others = [];

fs.readdirSync(imgDir).forEach(dir => {
  const dirPath = path.join(imgDir, dir);
  if (!fs.statSync(dirPath).isDirectory()) return;

  const photos = fs.readdirSync(dirPath)
    .filter(f => f.toLowerCase().endsWith('.webp'))
    .sort();

  if (photos.length === 0) return;

  if (/^\d{2}-\d{2}-\d{4}$/.test(dir)) {
    const [d, m, y] = dir.split('-');
    albums.push({ date: `${y}-${m}-${d}`, label: dir, photos });
  } else {
    others.push({ date: dir, label: dir, photos });
  }
});

albums.sort((a, b) => b.date.localeCompare(a.date));

const all = albums.concat(others);
const output = 'const albums = ' + JSON.stringify(all.map(a => ({
  date: a.label,
  photos: a.photos
})), null, 2) + ';\n';

fs.writeFileSync(path.join(__dirname, 'photos.js'), output);
console.log(`✓ photos.js generato con ${all.length} album (${all.reduce((s, a) => s + a.photos.length, 0)} foto)`);
console.log(all.map(a => `  ${a.label} → ${a.photos.length} foto`).join('\n'));
