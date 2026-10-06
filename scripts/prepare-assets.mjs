import sharp from 'sharp';
import { mkdir, readFile, writeFile } from 'node:fs/promises';

const sourcePath = 'output/imagegen/portfolio-concept-20261005.png';
const patchPath = 'output/imagegen/cap-edited.png';
await mkdir('public/assets', { recursive: true });
const source = await sharp(sourcePath).ensureAlpha().raw().toBuffer({ resolveWithObject: true });
const patch = await sharp(patchPath).resize(420, 290, { fit: 'fill' }).ensureAlpha().raw().toBuffer();

// Composite ONLY the image-tool-generated repair around the embroidery.
// The source remains byte-for-byte identical everywhere outside this mask.
const polygon = [[238,55],[282,64],[345,111],[365,153],[352,177],[331,179],[272,137],[233,94]];
function inside(x, y) {
  let result = false;
  for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i++) {
    const [xi, yi] = polygon[i], [xj, yj] = polygon[j];
    if (((yi > y) !== (yj > y)) && x < (xj - xi) * (y - yi) / (yj - yi) + xi) result = !result;
  }
  return result;
}
function distance(x, y, a, b) {
  const dx = b[0] - a[0], dy = b[1] - a[1];
  const t = Math.max(0, Math.min(1, ((x - a[0]) * dx + (y - a[1]) * dy) / (dx * dx + dy * dy)));
  return Math.hypot(x - a[0] - t * dx, y - a[1] - t * dy);
}
for (let y = 0; y < 290; y++) for (let x = 0; x < 420; x++) {
  if (!inside(x, y)) continue;
  const edge = Math.min(...polygon.map((p, i) => distance(x, y, p, polygon[(i + 1) % polygon.length])));
  const alpha = Math.min(1, edge / 7);
  const src = ((y + 20) * source.info.width + x + 950) * 4;
  const dst = (y * 420 + x) * 4;
  for (let c = 0; c < 3; c++) source.data[src + c] = Math.round(source.data[src + c] * (1 - alpha) + patch[dst + c] * alpha);
}
await sharp(source.data, { raw: source.info }).png().toFile('public/assets/portfolio-hero.png');
await sharp('public/assets/portfolio-hero.png').extract({ left: 898, top: 75, width: 680, height: 796 }).png().toFile('public/assets/portfolio-portrait.png');
await writeFile('output/imagegen/asset-edit.json', JSON.stringify({ original: sourcePath, generatedPatch: patchPath, output: 'public/assets/portfolio-hero.png', crop: { x: 950, y: 20, width: 420, height: 290 }, maskPolygon: polygon, featherPixels: 7 }, null, 2));
console.log('Saved exact source composition with the tool-generated cap repair.');
