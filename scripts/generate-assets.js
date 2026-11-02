const fs = require('fs');
const path = require('path');
const zlib = require('zlib');

const dir = path.join(__dirname, '..', 'public', 'images', 'products');
if (!fs.existsSync(dir)) {
  fs.mkdirSync(dir, { recursive: true });
}

// Generate valid binary PNG file
function createPng(w, h, r, g, b, accentR, accentG, accentB) {
  const crcTable = [];
  for (let n = 0; n < 256; n++) {
    let c = n;
    for (let k = 0; k < 8; k++) c = (c & 1) ? (0xedb88320 ^ (c >>> 1)) : (c >>> 1);
    crcTable[n] = c;
  }
  function crc(buf) {
    let c = 0xffffffff;
    for (let i = 0; i < buf.length; i++) c = crcTable[(c ^ buf[i]) & 0xff] ^ (c >>> 8);
    return (c ^ 0xffffffff) >>> 0;
  }
  function chunk(type, data) {
    const len = Buffer.alloc(4); len.writeUInt32BE(data.length);
    const t = Buffer.from(type, 'ascii');
    const c = Buffer.alloc(4); c.writeUInt32BE(crc(Buffer.concat([t, data])));
    return Buffer.concat([len, t, data, c]);
  }

  const sig = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(w, 0); ihdr.writeUInt32BE(h, 4);
  ihdr[8] = 8; ihdr[9] = 6; ihdr[10] = 0; ihdr[11] = 0; ihdr[12] = 0;

  const raw = Buffer.alloc(h * (w * 4 + 1));
  const cx = w / 2;
  const cy = h / 2;

  for (let y = 0; y < h; y++) {
    const rowOffset = y * (w * 4 + 1);
    raw[rowOffset] = 0; // Filter: None

    for (let x = 0; x < w; x++) {
      const p = rowOffset + 1 + x * 4;

      // Draw background light tint
      let pr = 240, pg = 249, pb = 255, pa = 255;

      // Circle background
      const dist = Math.hypot(x - cx, y - cy);
      if (dist < 110) {
        pr = 224; pg = 242; pb = 254;
      }

      // Gallon / Bottle Body
      const inNeck = x >= cx - 20 && x <= cx + 20 && y >= cy - 80 && y <= cy - 50;
      const inCap = x >= cx - 25 && x <= cx + 25 && y >= cy - 95 && y < cy - 80;
      const inBody = x >= cx - 55 && x <= cx + 55 && y >= cy - 50 && y <= cy + 70;

      if (inCap) {
        pr = 2; pg = 132; pb = 199; // Cap blue
      } else if (inNeck) {
        pr = accentR; pg = accentG; pb = accentB;
      } else if (inBody) {
        // Gradient shading
        const shade = (x - (cx - 55)) / 110;
        pr = Math.floor(r * (0.8 + 0.4 * shade));
        pg = Math.floor(g * (0.8 + 0.4 * shade));
        pb = Math.floor(b * (0.8 + 0.4 * shade));

        // Highlight stripe
        if (x >= cx - 35 && x <= cx - 25) {
          pr = Math.min(255, pr + 40);
          pg = Math.min(255, pg + 40);
          pb = Math.min(255, pb + 40);
        }
      }

      raw[p] = pr;
      raw[p + 1] = pg;
      raw[p + 2] = pb;
      raw[p + 3] = pa;
    }
  }

  const idat = zlib.deflateSync(raw);
  return Buffer.concat([sig, chunk('IHDR', ihdr), chunk('IDAT', idat), chunk('IEND', Buffer.alloc(0))]);
}

const items = [
  { file: 'round-gallon.png', r: 14, g: 165, b: 233, ar: 2, ag: 132, ab: 199 },
  { file: 'mineral-gallon.png', r: 16, g: 185, b: 129, ar: 5, ag: 150, ab: 105 },
  { file: 'alkaline-gallon.png', r: 99, g: 102, b: 241, ar: 79, ag: 70, ab: 229 },
  { file: 'square-gallon.png', r: 2, g: 132, b: 199, ar: 3, ag: 105, ab: 161 },
  { file: '10l-jug.png', r: 56, g: 189, b: 248, ar: 2, ag: 132, ab: 199 },
  { file: '5l-bottle.png', r: 125, g: 211, b: 252, ar: 2, ag: 132, ab: 199 },
  { file: '500ml-pack.png', r: 59, g: 130, b: 246, ar: 37, ag: 99, ab: 235 },
  { file: '350ml-pack.png', r: 96, g: 165, b: 250, ar: 59, ag: 130, ab: 246 },
  { file: 'pump.png', r: 148, g: 163, b: 184, ar: 71, ag: 85, ab: 105 },
  { file: 'stand.png', r: 100, g: 116, b: 139, ar: 51, ag: 65, ab: 85 },
];

for (const it of items) {
  const pngBuf = createPng(240, 240, it.r, it.g, it.b, it.ar, it.ag, it.ab);
  fs.writeFileSync(path.join(dir, it.file), pngBuf);
}

console.log('✅ Generated 10 valid binary PNG image assets in public/images/products');
