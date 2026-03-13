const fs = require('fs');
const path = require('path');
const svgstore = require('svgstore');
const { optimize } = require('svgo');

const INPUT_DIR = path.resolve(__dirname, '../src/icons/raw');
const OUTPUT_FILE = path.resolve(__dirname, '../public/icons/categories/sprite.svg');

const sprites = svgstore({
  inline: false,
});

fs.readdirSync(INPUT_DIR).forEach((file) => {
  if (!file.endsWith('.svg')) return;

  const iconId = path.basename(file, '.svg');
  const filePath = path.join(INPUT_DIR, file);
  const svgContent = fs.readFileSync(filePath, 'utf8');

  const optimized = optimize(svgContent, {
    multipass: true,
    plugins: [
      'removeDimensions',
      'removeStyleElement',
      {
        name: 'removeAttrs',
        params: { attrs: '(stroke|fill)' },
      },
      {
        name: 'addAttributesToSVGElement',
        params: {
          attributes: [
            { fill: 'currentColor' },
            { stroke: 'currentColor' },
          ],
        },
      },
    ],
  });

  sprites.add(iconId, optimized.data);
});

fs.mkdirSync(path.dirname(OUTPUT_FILE), { recursive: true });
fs.writeFileSync(OUTPUT_FILE, sprites.toString());

console.log('✅ SVG sprite generated:', OUTPUT_FILE);
