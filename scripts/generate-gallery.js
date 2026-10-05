// scripts/generate-gallery.js
// Ejecutar en: vercel.json -> buildCommand: "node scripts/generate-gallery.js"
// Galería deshabilitada - devuelve array vacío

const fs = require('fs');
const path = require('path');

const OUTPUT_FILE = path.join(__dirname, '../public/gallery.json');

function main() {
  // Galería eliminada - escribir array vacío
  fs.writeFileSync(OUTPUT_FILE, '[]');
  console.log('Galería deshabilitada - gallery.json vacío generado');
}

main();
