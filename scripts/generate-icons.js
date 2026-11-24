import fs from 'fs';
import path from 'path';
import zlib from 'zlib';

function createPNG(width, height, drawFn) {
  // RGBA buffer
  const buffer = Buffer.alloc(width * height * 4);
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const idx = (y * width + x) * 4;
      const [r, g, b, a] = drawFn(x, y, width, height);
      buffer[idx] = r;
      buffer[idx + 1] = g;
      buffer[idx + 2] = b;
      buffer[idx + 3] = a;
    }
  }

  // PNG filter byte (0 = None) per scanline
  const scanlineLength = width * 4 + 1;
  const rawData = Buffer.alloc(height * scanlineLength);
  for (let y = 0; y < height; y++) {
    rawData[y * scanlineLength] = 0; // Filter: None
    buffer.copy(rawData, y * scanlineLength + 1, y * width * 4, (y + 1) * width * 4);
  }

  const deflated = zlib.deflateSync(rawData);

  // PNG Signature
  const signature = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);

  // IHDR chunk
  const ihdrData = Buffer.alloc(13);
  ihdrData.writeUInt32BE(width, 0);
  ihdrData.writeUInt32BE(height, 4);
  ihdrData[8] = 8; // Bit depth: 8
  ihdrData[9] = 6; // Color type: RGBA (6)
  ihdrData[10] = 0; // Compression: Deflate
  ihdrData[11] = 0; // Filter: Standard
  ihdrData[12] = 0; // Interlace: None

  const ihdrChunk = createChunk('IHDR', ihdrData);
  const idatChunk = createChunk('IDAT', deflated);
  const iendChunk = createChunk('IEND', Buffer.alloc(0));

  return Buffer.concat([signature, ihdrChunk, idatChunk, iendChunk]);
}

function crc32(buf) {
  let table = [];
  for (let i = 0; i < 256; i++) {
    let c = i;
    for (let k = 0; k < 8; k++) {
      c = (c & 1) ? (0xedb88320 ^ (c >>> 1)) : (c >>> 1);
    }
    table[i] = c;
  }

  let crc = 0xffffffff;
  for (let i = 0; i < buf.length; i++) {
    crc = (crc >>> 8) ^ table[(crc ^ buf[i]) & 0xff];
  }
  return (crc ^ 0xffffffff) >>> 0;
}

function createChunk(type, data) {
  const length = data.length;
  const chunk = Buffer.alloc(4 + 4 + length + 4);
  chunk.writeUInt32BE(length, 0);
  chunk.write(type, 4);
  data.copy(chunk, 8);
  const typeAndData = chunk.subarray(4, 8 + length);
  const crc = crc32(typeAndData);
  chunk.writeUInt32BE(crc, 8 + length);
  return chunk;
}

// Draw LostFind Icon: Deep Navy-Indigo gradient background with rounded shield/box and bright cyan/orange magnifying glass & search beacon
function drawLostFindIcon(x, y, w, h) {
  const cx = w / 2;
  const cy = h / 2;
  const radius = Math.min(w, h) * 0.44;

  const dx = x - cx;
  const dy = y - cy;
  const dist = Math.sqrt(dx * dx + dy * dy);

  // Rounded squircle container
  const cornerR = w * 0.22;
  const inset = w * 0.05;
  const innerW = w - inset * 2;
  const innerH = h - inset * 2;

  // Check if inside squircle
  const qx = Math.max(Math.abs(x - cx) - (innerW / 2 - cornerR), 0);
  const qy = Math.max(Math.abs(y - cy) - (innerH / 2 - cornerR), 0);
  const sqDist = Math.sqrt(qx * qx + qy * qy);

  if (sqDist > cornerR) {
    return [0, 0, 0, 0]; // Transparent outside
  }

  // Background Gradient (Deep Indigo to Modern Tech Teal)
  const gradT = (x + y) / (w + h);
  let bgR = Math.round(15 + gradT * (14 - 15));
  let bgG = Math.round(23 + gradT * (116 - 23));
  let bgB = Math.round(42 + gradT * (144 - 42));

  // Outer border glow
  if (sqDist > cornerR - 3) {
    return [56, 189, 248, 240];
  }

  // Draw Magnifying Glass (Search) + Box (Find)
  // Magnifying lens center
  const lx = cx - w * 0.08;
  const ly = cy - h * 0.08;
  const lDist = Math.sqrt((x - lx) * (x - lx) + (y - ly) * (y - ly));
  const lRadius = w * 0.22;
  const lThickness = w * 0.045;

  // Lens ring
  if (Math.abs(lDist - lRadius) < lThickness / 2) {
    return [56, 189, 248, 255]; // Bright cyan
  }

  // Center pin/dot inside lens
  if (lDist < w * 0.08) {
    return [249, 115, 22, 255]; // Lost item alert orange
  }

  // Handle of magnifying glass
  const hx1 = lx + lRadius * 0.707;
  const hy1 = ly + lRadius * 0.707;
  const hx2 = lx + lRadius * 1.65;
  const hy2 = ly + lRadius * 1.65;

  // Distance from point (x,y) to segment (hx1,hy1)-(hx2,hy2)
  const px = hx2 - hx1;
  const py = hy2 - hy1;
  const lenSq = px * px + py * py;
  const u = Math.max(0, Math.min(1, ((x - hx1) * px + (y - hy1) * py) / lenSq));
  const projX = hx1 + u * px;
  const projY = hy1 + u * py;
  const handleDist = Math.sqrt((x - projX) * (x - projX) + (y - projY) * (y - projY));

  if (handleDist < w * 0.035) {
    return [56, 189, 248, 255]; // Cyan handle
  }

  // Little checkmark / beacon inside lens
  if (lDist < lRadius) {
    // slight translucent fill
    return [Math.min(255, bgR + 15), Math.min(255, bgG + 35), Math.min(255, bgB + 55), 255];
  }

  return [bgR, bgG, bgB, 255];
}

const publicDir = path.resolve('public');
if (!fs.existsSync(publicDir)) {
  fs.mkdirSync(publicDir, { recursive: true });
}

// Generate 192x192
const png192 = createPNG(192, 192, drawLostFindIcon);
fs.writeFileSync(path.join(publicDir, 'icon-192.png'), png192);

// Generate 512x512
const png512 = createPNG(512, 512, drawLostFindIcon);
fs.writeFileSync(path.join(publicDir, 'icon-512.png'), png512);

// Generate logo.png (256x256)
const logo = createPNG(256, 256, drawLostFindIcon);
fs.writeFileSync(path.join(publicDir, 'logo.png'), logo);

console.log('Icons generated successfully in public/');
