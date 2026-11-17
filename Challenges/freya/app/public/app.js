const editor = document.querySelector("#note-editor");
const makeLink = document.querySelector("#make-link");
const clearButton = document.querySelector("#clear-button");
const reactionButton = document.querySelector("#reaction-button");
const reactionMenu = document.querySelector("#reaction-menu");
const characterCount = document.querySelector("#character-count");
const editorStatus = document.querySelector("#editor-status");
const resultSection = document.querySelector("#result-section");
const generatedLink = document.querySelector("#generated-link");
const copyLink = document.querySelector("#copy-link");
const openLink = document.querySelector("#open-link");
const copyStatus = document.querySelector("#copy-status");
const notePreview = document.querySelector("#note-preview");
const formattingButtons = [...document.querySelectorAll("[data-command]")];

let savedRange = null;

function encodeBase64(value) {
  const bytes = new TextEncoder().encode(value);
  let binary = "";
  const chunkSize = 0x8000;

  for (let index = 0; index < bytes.length; index += chunkSize) {
    binary += String.fromCharCode(...bytes.subarray(index, index + chunkSize));
  }
  return btoa(binary);
}

function updateCount() {
  const length = editor.textContent.length;
  characterCount.textContent = `${length} / 2000`;
  characterCount.classList.toggle("limit", length > 2000);
}

function rememberSelection() {
  const selection = getSelection();
  if (!selection.rangeCount || !editor.contains(selection.anchorNode)) return;
  savedRange = selection.getRangeAt(0).cloneRange();
}

function restoreSelection() {
  if (!savedRange) {
    editor.focus();
    return;
  }
  const selection = getSelection();
  selection.removeAllRanges();
  selection.addRange(savedRange);
}

function format(command) {
  restoreSelection();
  const selection = getSelection();
  if (!selection.rangeCount) return;

  const range = selection.getRangeAt(0);
  if (range.collapsed || !editor.contains(range.commonAncestorContainer)) {
    editor.focus();
    return;
  }

  const tags = {
    bold: "strong",
    italic: "em",
    underline: "u",
  };
  const wrapper = document.createElement(tags[command]);
  wrapper.append(range.extractContents());
  range.insertNode(wrapper);

  const formattedRange = document.createRange();
  formattedRange.selectNodeContents(wrapper);
  selection.removeAllRanges();
  selection.addRange(formattedRange);
  rememberSelection();
  updateToolbar();
  updateCount();
}

function updateToolbar() {
  const selection = getSelection();
  const anchor = selection.anchorNode;
  const element = anchor instanceof Element ? anchor : anchor?.parentElement;
  const tags = { bold: "strong", italic: "em", underline: "u" };

  formattingButtons.forEach((button) => {
    const wrapper = element?.closest(tags[button.dataset.command]);
    button.classList.toggle("active", Boolean(wrapper && editor.contains(wrapper)));
  });
}

function insertReaction(reaction) {
  restoreSelection();
  document.execCommand("insertText", false, reaction);
  reactionMenu.hidden = true;
  reactionButton.setAttribute("aria-expanded", "false");
  rememberSelection();
  updateCount();
}

function renderReactions(data) {
  reactionMenu.replaceChildren();
  data.items.forEach((reaction) => {
    const button = document.createElement("button");
    button.type = "button";
    button.textContent = reaction;
    button.addEventListener("mousedown", (event) => event.preventDefault());
    button.addEventListener("click", () => insertReaction(reaction));
    reactionMenu.append(button);
  });
  reactionMenu.hidden = false;
  reactionButton.setAttribute("aria-expanded", "true");
}

window.__freyaReactions = renderReactions;

function loadReactions() {
  if (reactionMenu.children.length > 0) {
    const opening = reactionMenu.hidden;
    reactionMenu.hidden = !opening;
    reactionButton.setAttribute("aria-expanded", String(opening));
    return;
  }

  const script = document.createElement("script");
  script.src = `/reactions.js?callback=${encodeURIComponent("__freyaReactions")}`;
  script.addEventListener("error", () => {
    editorStatus.textContent = "Could not load reactions.";
  });
  document.head.append(script);
}

function generateLink() {
  const text = editor.textContent.trim();
  if (!text) {
    editorStatus.textContent = "Carve something before binding a rune.";
    editor.focus();
    return;
  }
  if (text.length > 2000) {
    editorStatus.textContent = "Keep your rune under 2,000 characters.";
    return;
  }

  const html = editor.innerHTML;
  const encoded = encodeBase64(html);
  const url = `${location.origin}/n/?d=${encodeURIComponent(encoded)}`;

  generatedLink.value = url;
  openLink.href = url;
  notePreview.innerHTML = html;
  resultSection.hidden = false;
  editorStatus.textContent = "";
  copyStatus.textContent = "";
  resultSection.scrollIntoView({ behavior: "smooth", block: "start" });
}

async function copyGeneratedLink() {
  try {
    await navigator.clipboard.writeText(generatedLink.value);
    copyStatus.textContent = "Copied to clipboard.";
  } catch {
    generatedLink.select();
    document.execCommand("copy");
    copyStatus.textContent = "Copied to clipboard.";
  }
}

formattingButtons.forEach((button) => {
  button.addEventListener("mousedown", (event) => event.preventDefault());
  button.addEventListener("click", () => format(button.dataset.command));
});

editor.addEventListener("input", updateCount);
editor.addEventListener("paste", (event) => {
  event.preventDefault();
  const text = event.clipboardData?.getData("text/plain") || "";
  document.execCommand("insertText", false, text);
});
editor.addEventListener("keyup", () => {
  rememberSelection();
  updateToolbar();
});
editor.addEventListener("mouseup", () => {
  rememberSelection();
  updateToolbar();
});
editor.addEventListener("keydown", (event) => {
  if ((event.metaKey || event.ctrlKey) && event.key === "Enter") {
    event.preventDefault();
    generateLink();
  }
});

reactionButton.addEventListener("mousedown", (event) => event.preventDefault());
reactionButton.addEventListener("click", loadReactions);
clearButton.addEventListener("click", () => {
  editor.replaceChildren();
  resultSection.hidden = true;
  editorStatus.textContent = "";
  updateCount();
  editor.focus();
});
makeLink.addEventListener("click", generateLink);
copyLink.addEventListener("click", copyGeneratedLink);

document.addEventListener("selectionchange", rememberSelection);
updateCount();
