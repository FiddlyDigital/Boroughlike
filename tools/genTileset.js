/*
 * Reproducible tileset generator for Boroughlike.
 *
 * Reads public/assets/images/dungeon.png, preserves the original hand-authored
 * tiles (floor, doors, stairs, fountain, spike pit), and (re)generates the
 * procedural biome tiles:
 *   - 16 dungeon wall blob tiles      (rows 2-5,  cols 0-3)  grey brick
 *   - 16 canyon wall blob tiles       (rows 10-13, cols 0-3) sandstone
 *   - 16 cave wall blob tiles         (rows 14-17, cols 0-3) dark rock
 *   - cactus [4,2], oasis [4,3], cave floor [4,4]
 * The sheet is expanded from 80x160 (5x10) to 80x288 (5x18) to fit the new
 * wall blobs; existing rows 0-9 are copied over untouched.
 *
 * Run:  node tools/genTileset.js
 */
const fs = require("fs"), zlib = require("zlib");
const PATH = __dirname + "/../public/assets/images/dungeon.png";

// ---------- PNG decode ----------
function decode(buf) {
  let p = 8, idat = [];
  const W = buf.readUInt32BE(16), H = buf.readUInt32BE(20);
  while (p < buf.length) { const l = buf.readUInt32BE(p); const t = buf.toString("ascii", p+4, p+8); if (t === "IDAT") idat.push(buf.slice(p+8, p+8+l)); if (t === "IEND") break; p += 12 + l; }
  const raw = zlib.inflateSync(Buffer.concat(idat)); const ch = 4, st = W*ch; const img = Buffer.alloc(W*H*ch); let pr = Buffer.alloc(st);
  for (let y = 0; y < H; y++) { const ft = raw[y*(st+1)]; const ln = raw.slice(y*(st+1)+1, y*(st+1)+1+st); const cu = Buffer.alloc(st);
    for (let i = 0; i < st; i++) { const a = i>=ch?cu[i-ch]:0, b = pr[i], c = i>=ch?pr[i-ch]:0; let v = ln[i];
      if (ft===1) v=(v+a)&255; else if (ft===2) v=(v+b)&255; else if (ft===3) v=(v+((a+b)>>1))&255; else if (ft===4){const pa=Math.abs(b-c),pb=Math.abs(a-c),pc=Math.abs(a+b-2*c);let p2=(pa<=pb&&pa<=pc)?a:(pb<=pc?b:c);v=(v+p2)&255;} cu[i]=v; }
    cu.copy(img, y*st); pr = cu; }
  return { W, H, img };
}
// ---------- PNG encode ----------
function encode(W, H, img) {
  function chunk(ty,d){const L=Buffer.alloc(4);L.writeUInt32BE(d.length);const t=Buffer.from(ty);const cb=Buffer.concat([t,d]);let crc=~0;for(let i=0;i<cb.length;i++){crc^=cb[i];for(let k=0;k<8;k++)crc=(crc>>>1)^(0xEDB88320&-(crc&1));}crc=~crc>>>0;const c=Buffer.alloc(4);c.writeUInt32BE(crc>>>0);return Buffer.concat([L,t,d,c]);}
  const sig=Buffer.from([137,80,78,71,13,10,26,10]);const ih=Buffer.alloc(13);ih.writeUInt32BE(W,0);ih.writeUInt32BE(H,4);ih[8]=8;ih[9]=6;
  const ro=Buffer.alloc(H*(W*4+1));for(let y=0;y<H;y++){ro[y*(W*4+1)]=0;img.copy(ro,y*(W*4+1)+1,y*W*4,(y+1)*W*4);}
  return Buffer.concat([sig,chunk("IHDR",ih),chunk("IDAT",zlib.deflateSync(ro,{level:9})),chunk("IEND",Buffer.alloc(0))]);
}

// ---------- load + expand canvas ----------
const src = decode(fs.readFileSync(PATH));
const W = src.W;                 // 80
const OLD_H = src.H;             // 160
const H = 18 * 16;               // 288 (add 8 rows)
const img = Buffer.alloc(W * H * 4, 0);
src.img.copy(img, 0);            // preserve existing rows 0-9

function sample(cx, cy, tx, ty) { const x=cx*16+tx, y=cy*16+ty, i=(y*W+x)*4; return [img[i],img[i+1],img[i+2]]; }
function set(cx, cy, tx, ty, col) { const x=cx*16+tx, y=cy*16+ty, i=(y*W+x)*4; img[i]=col[0]; img[i+1]=col[1]; img[i+2]=col[2]; img[i+3]=255; }
function getc(cx, cy, tx, ty) { const x=cx*16+tx, y=cy*16+ty, i=(y*W+x)*4; return [img[i],img[i+1],img[i+2]]; }
function eq(a,b){return a[0]===b[0]&&a[1]===b[1]&&a[2]===b[2];}
function mulberry32(a){return function(){a|=0;a=(a+0x6D2B79F5)|0;let t=Math.imul(a^(a>>>15),1|a);t=(t+Math.imul(t^(t>>>7),61|t))^t;return((t^(t>>>14))>>>0)/4294967296;};}

// ---------- wall blob generator ----------
// palette: {BODY, MORTAR, DARK, LIGHT, CAP, WORN_D, WORN_L, CRACK, MOSS, MOSS_D}
function makeWallDrawer(pal) {
  function brick(tx, ty) {
    const course = Math.floor(ty/4), offset = (course%2)*4;
    if (ty%4===0) return pal.MORTAR;
    if (((tx+offset)%8)===0) return pal.MORTAR;
    if (ty%4===1) return pal.LIGHT;
    return pal.BODY;
  }
  return function drawWall(cx, cy, cT, cB, cL, cR) {
    for (let ty=0; ty<16; ty++) for (let tx=0; tx<16; tx++) set(cx, cy, tx, ty, brick(tx,ty));
    if (!cT) for (let tx=0; tx<16; tx++) { set(cx,cy,tx,0,pal.DARK); set(cx,cy,tx,1,pal.CAP); set(cx,cy,tx,2,pal.CAP); }
    if (!cB) for (let tx=0; tx<16; tx++) { set(cx,cy,tx,15,pal.DARK); set(cx,cy,tx,14,pal.MORTAR); }
    if (!cL) for (let ty=0; ty<16; ty++) { set(cx,cy,0,ty,pal.DARK); set(cx,cy,1,ty,pal.MORTAR); }
    if (!cR) for (let ty=0; ty<16; ty++) { set(cx,cy,15,ty,pal.DARK); set(cx,cy,14,ty,pal.MORTAR); }
    // ---- subtle detail pass (interior only, brick pixels only) ----
    const rng = mulberry32((cx*928371+cy*1237)>>>0);
    const isBrick = (tx,ty) => { const c=getc(cx,cy,tx,ty); return eq(c,pal.BODY)||eq(c,pal.LIGHT)||eq(c,pal.MORTAR); };
    // worn brick tone per brick cell
    for (let by=0; by<4; by++) for (let bx=0; bx<2; bx++) {
      const r = rng(); if (r > 0.32) continue;
      const tone = r < 0.18 ? pal.WORN_D : pal.WORN_L;
      for (let ty=2; ty<14; ty++) for (let tx=2; tx<14; tx++) {
        if (Math.floor(tx/8)===bx && Math.floor(ty/4)===by && eq(getc(cx,cy,tx,ty),pal.BODY)) set(cx,cy,tx,ty,tone);
      }
    }
    // hairline cracks
    const nCracks = rng() < 0.45 ? 1 : 0;
    for (let k=0;k<nCracks;k++){ let x=3+Math.floor(rng()*10), y=4+Math.floor(rng()*8); const len=2+Math.floor(rng()*3);
      for (let s=0;s<len;s++){ if (x>1&&x<14&&y>1&&y<14&&isBrick(x,y)) set(cx,cy,x,y,pal.CRACK); y+=1; x+=rng()<0.5?0:(rng()<0.5?-1:1); } }
    // moss specks (low in the tile)
    if (rng() < 0.4) { const mx=3+Math.floor(rng()*9), my=9+Math.floor(rng()*4);
      for (const [dx,dy] of [[0,0],[1,0],[0,1],[1,1]]) { if (rng()<0.7 && isBrick(mx+dx,my+dy)) set(cx,cy,mx+dx,my+dy, rng()<0.5?pal.MOSS:pal.MOSS_D); } }
  };
}

// suffix<->cell mapping (matches spriteIndices WALL_CELLS); dungeon at base rows, biomes offset.
const WALL_CELLS = { "":[0,2],"L":[1,2],"R":[2,2],"LR":[3,2],"T":[0,3],"B":[1,3],"TB":[2,3],"LT":[3,3],"RT":[0,4],"LRT":[1,4],"LB":[2,4],"RB":[3,4],"LRB":[0,5],"LTB":[1,5],"RTB":[2,5],"LRTB":[3,5] };
function genWallSet(pal, rowOffset) {
  const draw = makeWallDrawer(pal);
  for (const [suffix, pos] of Object.entries(WALL_CELLS)) {
    const cT=suffix.includes("T"), cB=suffix.includes("B"), cL=suffix.includes("L"), cR=suffix.includes("R");
    draw(pos[0], pos[1] + rowOffset, cT, cB, cL, cR);
  }
}

const DUNGEON = { BODY:[139,155,180], MORTAR:[82,96,124], DARK:[39,43,68], LIGHT:[192,203,220], CAP:[233,233,233], WORN_D:[120,135,160], WORN_L:[164,178,200], CRACK:[64,72,100], MOSS:[96,120,84], MOSS_D:[72,94,62] };
const CANYON  = { BODY:[188,138,88], MORTAR:[150,100,58], DARK:[86,52,30], LIGHT:[214,172,116], CAP:[236,204,150], WORN_D:[168,120,74], WORN_L:[208,164,110], CRACK:[92,58,34], MOSS:[120,132,70], MOSS_D:[96,108,54] };
const CAVE    = { BODY:[92,86,100], MORTAR:[58,54,66], DARK:[26,24,34], LIGHT:[126,120,134], CAP:[150,146,160], WORN_D:[76,72,86], WORN_L:[112,106,122], CRACK:[24,22,32], MOSS:[86,104,78], MOSS_D:[62,80,58] };

genWallSet(DUNGEON, 0);   // rows 2-5
genWallSet(CANYON, 8);    // rows 10-13
genWallSet(CAVE, 12);     // rows 14-17

// ---------- feature tiles (col 4) ----------
// sandy base sampled from the existing Floor tile [0,6]
const SAND = sample(0, 6, 8, 8);
const SAND_D = SAND.map(v => Math.max(0, v-28));
const SAND_L = SAND.map(v => Math.min(255, v+18));
function fillCell(cx, cy, col) { for (let ty=0;ty<16;ty++) for (let tx=0;tx<16;tx++) set(cx,cy,tx,ty,col); }

// Cactus [4,2] : sand background + green saguaro
fillCell(4, 2, SAND);
{ const rng=mulberry32(55); for (let ty=0;ty<16;ty++) for (let tx=0;tx<16;tx++){ if (rng()<0.10) set(4,2,tx,ty, rng()<0.5?SAND_D:SAND_L); } }
const CAC=[74,132,66], CAC_D=[52,104,50], CAC_L=[110,168,92];
function vbar(cx,cy,x,y0,y1,w){ for(let y=y0;y<=y1;y++) for(let dx=0;dx<w;dx++){ set(cx,cy,x+dx,y, dx===0?CAC_L:(dx===w-1?CAC_D:CAC)); } }
function hbar(cx,cy,x0,x1,y,h){ for(let x=x0;x<=x1;x++) for(let dy=0;dy<h;dy++){ set(cx,cy,x,y+dy, dy===0?CAC_L:CAC); } }
vbar(4,2, 7, 2, 14, 3);        // main stem
hbar(4,2, 4, 6, 7, 2); vbar(4,2, 4, 5, 8, 2);   // left arm
hbar(4,2, 10, 12, 5, 2); vbar(4,2, 11, 4, 6, 2); // right arm
set(4,2,7,2,CAC_L); set(4,2,8,2,CAC_L);

// Oasis [4,3] : water, passable decor
const WAT=[64,120,168], WAT_D=[46,96,142], WAT_L=[110,170,214], WSAND=[210,180,120];
fillCell(4, 3, WAT);
{ const rng=mulberry32(88);
  for (let ty=0;ty<16;ty++) for (let tx=0;tx<16;tx++){ const r=rng(); if (r<0.14) set(4,3,tx,ty,WAT_L); else if (r<0.24) set(4,3,tx,ty,WAT_D); }
  for (let tx=0;tx<16;tx++){ set(4,3,tx,0,WSAND); set(4,3,tx,15,WSAND); set(4,3,0,tx,WSAND); set(4,3,15,tx,WSAND); } // sandy rim
}

// Cave floor [4,4] : dark rocky floor
const CF=[70,66,78], CF_D=[52,48,60], CF_L=[92,88,100];
fillCell(4, 4, CF);
{ const rng=mulberry32(133); for (let ty=0;ty<16;ty++) for (let tx=0;tx<16;tx++){ const r=rng(); if (r<0.16) set(4,4,tx,ty,CF_D); else if (r<0.26) set(4,4,tx,ty,CF_L); } }

fs.writeFileSync(PATH, encode(W, H, img));
console.log("Tileset written: " + W + "x" + H + " (was " + W + "x" + OLD_H + ")");
console.log("  dungeon walls rows 2-5, canyon rows 10-13, cave rows 14-17");
console.log("  cactus [4,2], oasis [4,3], cave floor [4,4]");
