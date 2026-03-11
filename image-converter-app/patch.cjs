const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'src', 'core', 'i18n.js');
let content = fs.readFileSync(filePath, 'utf8');

const replacements = [
  ["nav_more_tools: 'More Tools',", "nav_more_tools: 'More Tools',\n    filter:{all:'All',optimize:'Optimize',edit:'Edit',convert:'Convert'},"],
  ["nav_more_tools:\"Plus d'outils\",", "nav_more_tools:\"Plus d'outils\",\n    filter:{all:'Tout',optimize:'Optimiser',edit:'Éditer',convert:'Convertir'},"],
  ["nav_more_tools:'Más herramientas',", "nav_more_tools:'Más herramientas',\n    filter:{all:'Todo',optimize:'Optimizar',edit:'Editar',convert:'Convertir'},"],
  ["nav_more_tools:'Mais ferramentas',", "nav_more_tools:'Mais ferramentas',\n    filter:{all:'Tudo',optimize:'Otimizar',edit:'Editar',convert:'Converter'},"],
  ["nav_more_tools:'Mehr Tools',", "nav_more_tools:'Mehr Tools',\n    filter:{all:'Alle',optimize:'Optimieren',edit:'Bearbeiten',convert:'Konvertieren'},"],
  ["nav_more_tools:'المزيد من الأدوات',", "nav_more_tools:'المزيد من الأدوات',\n    filter:{all:'الكل',optimize:'تحسين',edit:'تحرير',convert:'تحويل'},"],
];

let count = 0;
for (const [find, replace] of replacements) {
  if (content.includes(find)) {
    content = content.replace(find, replace);
    count++;
    console.log(`✅ Patched: ${find.substring(0, 40)}...`);
  } else {
    console.log(`⚠️  NOT FOUND: ${find.substring(0, 40)}...`);
  }
}

fs.writeFileSync(filePath, content, 'utf8');
console.log(`\nDone! ${count}/6 patches applied.`);