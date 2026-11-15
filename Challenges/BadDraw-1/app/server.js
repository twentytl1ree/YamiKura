const http = require("http");
const fs = require("fs");
const path = require("path");
const crypto = require("crypto");
const { URL } = require("url");

const PORT = process.env.PORT || 5050;
const PUBLIC_DIR = path.join(__dirname, "public");
const GRID_SIZE = 16;
const PALETTE = [
  "#0d0f18", "#f7f3e8", "#ff5d73", "#ffb14e",
  "#ffe14e", "#73e37c", "#4ecbff", "#8f6bff",
  "#ff6bd6", "#5a6079"
];

const users = new Map();
const tokens = new Map();
const drawings = [];

function hashPassword(password, salt) {
  return crypto.createHash("sha256").update(salt + ":" + password).digest("hex");
}

function createUser(username, password) {
  const salt = crypto.randomBytes(8).toString("hex");
  users.set(username, { salt, hash: hashPassword(password, salt) });
}

function makeFlatGrid(colorIndex) {
  return new Array(GRID_SIZE * GRID_SIZE).fill(colorIndex);
}

function seedDrawing(title, author, pattern) {
  drawings.push({
    id: crypto.randomBytes(6).toString("hex"),
    title,
    author,
    grid: pattern,
    createdAt: Date.now() - Math.floor(Math.random() * 1000 * 60 * 60 * 24)
  });
}

(function seed() {
  createUser("alice", "alice123");
  createUser("bob", "bob123");

  const heart = makeFlatGrid(0);
  const heartCells = [
    [3,2],[4,2],[6,2],[7,2],
    [2,3],[5,3],[8,3],
    [2,4],[9,4],
    [3,5],[8,5],
    [4,6],[7,6],
    [5,7],[6,7]
  ];
  heartCells.forEach(([x, y]) => { heart[y * GRID_SIZE + x] = 2; });
  seedDrawing("pixel heart", "alice", heart);

  const wave = makeFlatGrid(0);
  for (let y = 10; y < 14; y++) {
    for (let x = 0; x < GRID_SIZE; x++) {
      if ((x + y) % 4 < 2) wave[y * GRID_SIZE + x] = 6;
    }
  }
  seedDrawing("ocean strip", "bob", wave);
})();

function send(res, status, headers, body) {
  res.writeHead(status, headers);
  res.end(body);
}

function sendJSON(res, status, data) {
  send(res, status, { "Content-Type": "application/json; charset=utf-8" }, JSON.stringify(data));
}

function sendFile(res, filePath, contentType) {
  fs.readFile(filePath, (err, data) => {
    if (err) {
      sendJSON(res, 404, { error: "not found" });
      return;
    }
    send(res, 200, { "Content-Type": contentType }, data);
  });
}

function readBody(req, limit = 1024 * 256) {
  return new Promise((resolve, reject) => {
    let size = 0;
    const chunks = [];
    req.on("data", (chunk) => {
      size += chunk.length;
      if (size > limit) {
        reject(new Error("payload too large"));
        req.destroy();
        return;
      }
      chunks.push(chunk);
    });
    req.on("end", () => {
      if (chunks.length === 0) {
        resolve({});
        return;
      }
      try {
        resolve(JSON.parse(Buffer.concat(chunks).toString("utf-8")));
      } catch (e) {
        reject(new Error("invalid json"));
      }
    });
    req.on("error", reject);
  });
}

function authenticate(req) {
  const header = req.headers["authorization"] || "";
  const match = header.match(/^Bearer\s+(.+)$/i);
  if (!match) return null;
  const token = match[1].trim();
  return tokens.has(token) ? tokens.get(token) : null;
}

function isValidGrid(grid) {
  if (!Array.isArray(grid)) return false;
  if (grid.length !== GRID_SIZE * GRID_SIZE) return false;
  return grid.every((cell) => Number.isInteger(cell) && cell >= 0 && cell < PALETTE.length);
}

const routes = {
  "GET /": (req, res) => {
    send(res, 302, { Location: "/login" }, "");
  },
  "GET /login": (req, res) => sendFile(res, path.join(PUBLIC_DIR, "login.html"), "text/html; charset=utf-8"),
  "GET /feed": (req, res) => sendFile(res, path.join(PUBLIC_DIR, "feed.html"), "text/html; charset=utf-8"),
  "GET /draw": (req, res) => sendFile(res, path.join(PUBLIC_DIR, "editor.html"), "text/html; charset=utf-8"),
  "GET /editor": (req, res) => sendFile(res, path.join(PUBLIC_DIR, "editor.html"), "text/html; charset=utf-8"),
  "GET /script.js": (req, res) => sendFile(res, path.join(PUBLIC_DIR, "script.js"), "application/javascript; charset=utf-8"),
  "GET /styles.css": (req, res) => sendFile(res, path.join(PUBLIC_DIR, "styles.css"), "text/css; charset=utf-8"),
  "GET /pixel-avatar.js": (req, res) => sendFile(res, path.join(PUBLIC_DIR, "pixel-avatar.js"), "application/javascript; charset=utf-8"),

  "POST /api/register": async (req, res) => {
    let body;
    try {
      body = await readBody(req);
    } catch (e) {
      sendJSON(res, 400, { error: "bad request" });
      return;
    }
    const { username, password } = body || {};
    if (typeof username !== "string" || typeof password !== "string") {
      sendJSON(res, 400, { error: "username and password are required" });
      return;
    }
    if (!/^[a-zA-Z0-9_]{3,20}$/.test(username)) {
      sendJSON(res, 400, { error: "invalid username" });
      return;
    }
    if (password.length < 4) {
      sendJSON(res, 400, { error: "password too short" });
      return;
    }
    if (users.has(username)) {
      sendJSON(res, 409, { error: "username already taken" });
      return;
    }
    createUser(username, password);
    const token = crypto.randomBytes(32).toString("hex");
    tokens.set(token, username);
    sendJSON(res, 201, { accessToken: token, username });
  },

  "POST /api/login": async (req, res) => {
    let body;
    try {
      body = await readBody(req);
    } catch (e) {
      sendJSON(res, 400, { error: "bad request" });
      return;
    }
    const { username, password } = body || {};
    const user = typeof username === "string" ? users.get(username) : null;
    if (!user || typeof password !== "string" || hashPassword(password, user.salt) !== user.hash) {
      sendJSON(res, 401, { error: "invalid credentials" });
      return;
    }
    const token = crypto.randomBytes(32).toString("hex");
    tokens.set(token, username);
    sendJSON(res, 200, { accessToken: token, username });
  },

  "GET /api/me": (req, res) => {
    const username = authenticate(req);
    if (!username) {
      sendJSON(res, 401, { error: "unauthorized" });
      return;
    }
    sendJSON(res, 200, { username });
  },

  "GET /api/drawings": (req, res) => {
    const username = authenticate(req);
    if (!username) {
      sendJSON(res, 401, { error: "unauthorized" });
      return;
    }
    const sorted = [...drawings].sort((a, b) => b.createdAt - a.createdAt);
    sendJSON(res, 200, { drawings: sorted, palette: PALETTE, gridSize: GRID_SIZE });
  },

  "POST /api/drawings": async (req, res) => {
    const username = authenticate(req);
    if (!username) {
      sendJSON(res, 401, { error: "unauthorized" });
      return;
    }
    let body;
    try {
      body = await readBody(req);
    } catch (e) {
      sendJSON(res, 400, { error: "bad request" });
      return;
    }
    const { title, grid } = body || {};
    if (typeof title !== "string" || !title.trim() || title.length > 40) {
      sendJSON(res, 400, { error: "invalid title" });
      return;
    }
    if (!isValidGrid(grid)) {
      sendJSON(res, 400, { error: "invalid grid" });
      return;
    }
    const drawing = {
      id: crypto.randomBytes(6).toString("hex"),
      title: title.trim(),
      author: username,
      grid,
      createdAt: Date.now()
    };
    drawings.push(drawing);
    sendJSON(res, 201, { drawing });
  }
};

const server = http.createServer(async (req, res) => {
  const url = new URL(req.url, `http://${req.headers.host}`);
  const key = `${req.method} ${url.pathname}`;
  const fontMatch = req.method === "GET" && url.pathname.match(/^\/fonts\/([A-Za-z0-9-]+\.woff)$/);
  if (fontMatch) {
    sendFile(res, path.join(PUBLIC_DIR, "fonts", fontMatch[1]), "font/woff");
    return;
  }
  const handler = routes[key];
  if (!handler) {
    sendJSON(res, 404, { error: "not found" });
    return;
  }
  try {
    await handler(req, res);
  } catch (e) {
    sendJSON(res, 500, { error: "internal error" });
  }
});

server.listen(PORT, () => {
  console.log(`BadDraw 1 listening on ${PORT}`);
});
