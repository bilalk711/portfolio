import sharp from 'sharp';
import assert from 'node:assert/strict';
import { mkdir, writeFile } from 'node:fs/promises';

await mkdir('output/qa/v3',{recursive:true});
const original='output/imagegen/portfolio-v2-background-original.png';
const artwork='public/assets/portfolio-hero-v2-4k.png';
const implementation='output/qa/v3/hero-final.jpg';
const metadata=await sharp(artwork).metadata();
assert.equal(metadata.width,3840,'Artwork must be a 4K UHD export.');
assert.equal(metadata.height,2160,'Artwork must be 2160 pixels tall.');
assert.equal(metadata.format,'png','The downloadable artwork must be lossless PNG.');
const native=await sharp(original).metadata();
const capture=await sharp(implementation).metadata();
assert.ok(capture.width>=1900&&capture.width<=1920,'Desktop capture must cover the 1920px viewport content area.');assert.equal(capture.height,1080);
const width=capture.width;
const optimized=await sharp('public/assets/portfolio-hero-v2-4k.webp').metadata();
assert.equal(optimized.width,3840);assert.equal(optimized.height,2160);
const reference=await sharp('output/qa/v2/desktop-1920.jpg').resize(width,1080,{fit:'fill'}).png().toBuffer();
const rendered=await sharp(implementation).png().toBuffer();
await sharp({create:{width:width*2,height:1080,channels:3,background:'#101010'}})
  .composite([{input:reference,left:0,top:0},{input:rendered,left:width,top:0}]).png().toFile('output/qa/v3/comparison.png');
const background=await sharp(artwork).resize(width,1080,{fit:'cover'}).png().toBuffer();
const crop={left:1030,top:130,width:700,height:750};
const portraitA=await sharp(background).extract(crop).png().toBuffer();
const portraitB=await sharp(rendered).extract(crop).png().toBuffer();
await sharp({create:{width:1400,height:750,channels:3,background:'#101010'}})
  .composite([{input:portraitA,left:0,top:0},{input:portraitB,left:700,top:0}]).png().toFile('output/qa/v3/portrait-comparison.png');
const report={
  output:{path:artwork,width:metadata.width,height:metadata.height,format:metadata.format},
  generatorSource:{path:original,width:native.width,height:native.height},
  resolutionMethod:'Built-in image generator produced 1672 x 941. Exported to 3840 x 2160 using Lanczos3 resampling; not native 4K generation.',
  browserCapture:{path:implementation,width:capture.width,height:capture.height,format:capture.format},
  optimizedWebAsset:{path:'public/assets/portfolio-hero-v2-4k.webp',width:optimized.width,height:optimized.height},
  approvedDifferences:['Resume-based client introduction','Five-second circuit reveal','Matching pointer cursor','Four inline case studies','Ambient projected geometry'],
};
await writeFile('output/qa/v3/asset-metrics.json',JSON.stringify(report,null,2));
console.log(JSON.stringify(report,null,2));
