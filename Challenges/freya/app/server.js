const express = require("express");
const path = require("path");

const app = express();
const PORT = Number(process.env.PORT) || 2000;
const PUBLIC_DIR = path.join(__dirname, "public");

// Strict policy for the note page. Inline and external scripts are blocked;
// only same-origin scripts load, which is what makes /reactions.js the
// intended gadget.
const NOTE_CSP = [
  "default-src 'none'",
  "script-src 'self'",
  "style-src 'self'",
  "img-src 'self' data:",
  "connect-src 'none'",
  "font-src 'none'",
  "object-src 'none'",
  "base-uri 'none'",
  "form-action 'none'",
].join("; ");

const INVALID_NOTE =
  '<p class="invalid-note">This rune is damaged and cannot be read.</p>';

// Server-side port of the former note-renderer.js: validate and base64-decode
// the `d` parameter into the HTML that gets injected into the note page.
function renderNoteBody(encoded) {
  if (!encoded || encoded.length > 16_384) return INVALID_NOTE;

  const normalized = encoded.replace(/\s/g, "+");
  if (!/^[a-z0-9+/]*={0,2}$/i.test(normalized) || normalized.length % 4 !== 0) {
    return INVALID_NOTE;
  }

  try {
    return Buffer.from(normalized, "base64").toString("utf8");
  } catch {
    return INVALID_NOTE;
  }
}

function notePage(bodyHtml) {
  return `<!doctype html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>Freya</title>
  <link rel="icon" href="/favicon.svg">
  <link rel="stylesheet" href="/note.css">
</head>
<body>
  <main class="note-shell">
    <header>
      <a href="/" aria-label="Carve a new message"><span>F</span> FREYA</a>
      <p>BOUND RUNE / READ ONLY</p>
    </header>

    <article class="paper">
      <div class="tape" aria-hidden="true"></div>
      <p class="label">WORDS CARRIED TO YOU</p>
      <div class="note-body">${bodyHtml}</div>
      <footer>
        <span>Bound by Freya</span>
        <a href="/">Carve your own \u2197</a>
      </footer>
    </article>
  </main>
</body>
</html>`;
}

app.get(["/n", "/n/"], (req, res) => {
  const body = renderNoteBody(req.query.d);
  res.set("Content-Security-Policy", NOTE_CSP);
  res.type("html").send(notePage(body));
});

app.use(express.static(PUBLIC_DIR, { extensions: ["html"] }));

app.listen(PORT, () => {
  console.log(`Freya frontend listening on ${PORT}`);
});
