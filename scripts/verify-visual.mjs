import sharp from 'sharp';
import assert from 'node:assert/strict';
import { mkdir, writeFile } from 'node:fs/promises';

await mkdir('output/qa', { recursive: true });
const paths = {
  original: 'output/imagegen/portfolio-concept-20261005.png',
  revised: 'public/assets/portfolio-hero.png',
  browser: 'output/qa/desktop-rest.jpg',
};
const original = await sharp(paths.original).removeAlpha().raw().toBuffer({ resolveWithObject: true });
const revised = await sharp(paths.revised).removeAlpha().raw().toBuffer({ resolveWithObject: true });
assert.equal(original.info.width, 1672);
assert.equal(original.info.height, 941);
assert.deepEqual(revised.info, original.info);
let changedPixels = 0, outsideCapChanges = 0;
let bounds = { left: 1672, top: 941, right: 0, bottom: 0 };
for (let y = 0; y < 941; y++) for (let x = 0; x < 1672; x++) {
  const i = (y * 1672 + x) * 3;
  if (original.data[i] === revised.data[i] && original.data[i + 1] === revised.data[i + 1] && original.data[i + 2] === revised.data[i + 2]) continue;
  changedPixels++;
  if (x < 1183 || x > 1315 || y < 75 || y > 199) outsideCapChanges++;
  bounds.left = Math.min(bounds.left, x); bounds.right = Math.max(bounds.right, x);
  bounds.top = Math.min(bounds.top, y); bounds.bottom = Math.max(bounds.bottom, y);
}
assert.equal(outsideCapChanges, 0, 'The image edit changed pixels outside the cap repair.');
assert.ok(changedPixels > 0, 'The cap repair was not applied.');

const browserMeta = await sharp(paths.browser).metadata();
const normalizedBrowser = await sharp(paths.browser).resize(1672, 941, { fit: 'fill' }).png().toBuffer();
const reference = await sharp(paths.revised).png().toBuffer();
await sharp({ create: { width: 3344, height: 941, channels: 3, background: '#101010' } })
  .composite([{ input: reference, left: 0, top: 0 }, { input: normalizedBrowser, left: 1672, top: 0 }])
  .png().toFile('output/qa/desktop-comparison.png');
for (const [name, crop] of Object.entries({ typography: { left: 35, top: 180, width: 795, height: 470 }, cap: { left: 1155, top: 55, width: 195, height: 175 } })) {
  const a = await sharp(paths.revised).extract(crop).png().toBuffer();
  const b = await sharp(normalizedBrowser).extract(crop).png().toBuffer();
  await sharp({ create: { width: crop.width * 2, height: crop.height, channels: 3, background: '#101010' } })
    .composite([{ input: a, left: 0, top: 0 }, { input: b, left: crop.width, top: 0 }])
    .png().toFile(`output/qa/${name}-comparison.png`);
}
const report = {
  referenceSize: { width: 1672, height: 941 },
  changedPixels, outsideCapChanges, changedBounds: bounds,
  originalPixelsPreservedOutsideCap: '100%',
  browserCapture: { format: browserMeta.format, width: browserMeta.width, height: browserMeta.height },
  captureNote: 'The in-app browser exports a lossy JPEG and rounds the fractional viewport to 1671 pixels. It is visual comparison evidence, not a lossless pixel equality assertion.',
};
await writeFile('output/qa/visual-metrics.json', JSON.stringify(report, null, 2));
console.log(JSON.stringify(report, null, 2));
