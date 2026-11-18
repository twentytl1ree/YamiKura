function LabQuery(selector) {
  if (!(this instanceof LabQuery)) return new LabQuery(selector);
  this.el = typeof selector === 'string' ? document.querySelector(selector) : selector;
}

LabQuery.prototype.html = function (value) {
  if (value === undefined) return this.el ? this.el.innerHTML : undefined;
  if (!this.el) return this;
  const tpl = document.createElement('template');
  tpl.innerHTML = String(value);
  const frag = tpl.content;
  const scripts = Array.from(frag.querySelectorAll('script'));
  scripts.forEach((s) => s.remove());
  this.el.innerHTML = '';
  this.el.appendChild(frag);
  scripts.forEach((old) => {
    const fresh = document.createElement('script');
    Array.from(old.attributes).forEach((a) => fresh.setAttribute(a.name, a.value));
    if (!old.src) fresh.textContent = old.textContent;
    this.el.appendChild(fresh);
  });
  return this;
};

window.$ = LabQuery;

function getParam(name) {
  return new URLSearchParams(window.location.search).get(name);
}

function renderEntry() {
  const entry = getParam('entry');
  const output = $('#log-output');
  if (entry === null) {
    output.html('<p class="muted">23番から情報を掘り起こすか、あるいは尋ねなさい。</p>');
    return;
  }
  output.html('<p class="log-line">' + decodeURIComponent(entry) + '</p>');
}

function wireForm() {
  const form = document.getElementById('tryit-form');
  const input = document.getElementById('tryit-input');
  if (!form || !input) return;
  const existing = getParam('entry');
  if (existing !== null) input.value = decodeURIComponent(existing);
  form.addEventListener('submit', function (e) {
    e.preventDefault();
    const base = window.location.origin + window.location.pathname;
    const value = input.value;
    window.location.href = value === '' ? base : base + '?deploy=' + encodeURIComponent(value);
  });
}

function startDivergenceMeter() {
  const target = document.getElementById('log-output');
  if (!target) return;
  const check = () => {
    const strayTopLevel = target.querySelector(':scope > *:not(p.log-line):not(p.muted)');
    const line = target.querySelector('p.log-line');
    const strayChild = line && line.children.length > 0;
    if (strayTopLevel || strayChild) {
      announceWin();
      observer.disconnect();
    }
  };
  const observer = new MutationObserver(check);
  observer.observe(target, { childList: true, subtree: true });
  check();
}


document.addEventListener('DOMContentLoaded', function () {
  renderEntry();
  wireForm();
  startDivergenceMeter();
});

