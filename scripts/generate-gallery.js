// scripts/generate-gallery.js
// Ejecutar en: vercel.json -> buildCommand: "node scripts/generate-gallery.js"
// No requiere dependencias externas - parsea frontmatter manualmente

const fs = require('fs');
const path = require('path');

const CONTENT_DIR = path.join(__dirname, '../content/gallery');
const OUTPUT_FILE = path.join(__dirname, '../public/gallery.json');

function parseFrontmatter(content) {
  const match = content.match(/^---\n([\s\S]*?)\n---/);
  if (!match) return { data: {}, content: content };
  
  const fm = match[1];
  const data = {};
  fm.split('\n').forEach(line => {
    const [key, ...val] = line.split(':');
    if (key && val.length) {
      data[key.trim()] = val.join(':').trim().replace(/^["']|["']$/g, '');
    }
  });
  const body = content.slice(match[0].length).trim();
  return { data, content: body };
}

function main() {
  if (!fs.existsSync(CONTENT_DIR)) {
    console.log('No content/gallery dir, writing empty array');
    fs.writeFileSync(OUTPUT_FILE, '[]');
    return;
  }

  const files = fs.readdirSync(CONTENT_DIR).filter(f => f.endsWith('.md'));
  const items = files.map(file => {
    const full = fs.readFileSync(path.join(CONTENT_DIR, file), 'utf-8');
    const {data, content} = parseFrontmatter(full);
    return {
      slug: file.replace('.md', ''),
      title: data.title || 'Sin título',
      date: data.date ? new Date(data.date).toLocaleDateString('es-ES') : '',
      image: data.image || '',
      description: content.trim(),
      rawDate: data.date || ''
    };
  });

  // Ordenar por fecha desc
  items.sort((a, b) => new Date(b.rawDate) - new Date(a.rawDate));

  fs.writeFileSync(OUTPUT_FILE, JSON.stringify(items, null, 2));
  console.log(`Generated gallery.json with ${items.length} items`);
}

main();
