(() => {
  const source = document.currentScript?.src;
  if (!source) return;

  const parameters = new URL(source).searchParams;
  const callbackName = parameters.get("callback") || "__freyaReactions";
  if (!/^[a-z_$][\w$]*(?:\.[a-z_$][\w$]*)*$/i.test(callbackName)) return;

  const parts = callbackName.split(".");
  let context = window;

  for (const part of parts.slice(0, -1)) {
    context = context?.[part];
  }

  const callback = context?.[parts.at(-1)];
  if (typeof callback !== "function") return;

  const data = {
    items: ["♡", "✦", "☾", "☆", "…", "♪"],
    source: "freya-marks",
  };
  const value = parameters.get("value") === "origin" ? window.origin : data;

  callback.call(context, value);
})();
