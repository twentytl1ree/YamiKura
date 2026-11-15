function pixelAvatarPalette(seed) {
  const palettes = [
    ["#ff5d73", "#ffb14e"],
    ["#4ecbff", "#8f6bff"],
    ["#73e37c", "#ffe14e"],
    ["#ff6bd6", "#6ae3a8"]
  ];
  return palettes[seed % palettes.length];
}

function hashString(str) {
  let h = 0;
  for (let i = 0; i < str.length; i++) {
    h = (h * 31 + str.charCodeAt(i)) >>> 0;
  }
  return h;
}

// Pixel-art logo (a little smiley), drawn 1px per cell and scaled up with CSS.
function drawPixelMark(canvas) {
  const rows = [
    "..KKKKK..",
    ".KYYYYYK.",
    "KYYYYYYYK",
    "KYKYYYKYK",
    "KYYYYYYYK",
    "KYKYYYKYK",
    "KYYKKKYYK",
    ".KYYYYYK.",
    "..KKKKK.."
  ];
  const colors = { K: "#16141c", Y: "#ffd84a" };
  canvas.width = 11;
  canvas.height = 11;
  const ctx = canvas.getContext("2d");
  ctx.clearRect(0, 0, 11, 11);
  rows.forEach((row, y) => {
    for (let x = 0; x < row.length; x++) {
      if (colors[row[x]]) {
        ctx.fillStyle = colors[row[x]];
        ctx.fillRect(x + 1, y + 1, 1, 1);
      }
    }
  });
}

function drawPixelAvatar(canvas, name) {
  if (name === "pixelboard-mark") { drawPixelMark(canvas); return; }
  const size = 5;
  const scale = canvas.width / size;
  const ctx = canvas.getContext("2d");
  const seed = hashString(name || "anon");
  const [fg, bg] = pixelAvatarPalette(seed);
  ctx.fillStyle = bg;
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  ctx.fillStyle = fg;
  let bits = seed;
  const half = Math.ceil(size / 2);
  for (let y = 0; y < size; y++) {
    for (let x = 0; x < half; x++) {
      bits = (bits * 1103515245 + 12345) >>> 0;
      if (bits % 2 === 0) {
        ctx.fillRect(x * scale, y * scale, scale, scale);
        ctx.fillRect((size - 1 - x) * scale, y * scale, scale, scale);
      }
    }
  }
}
