const ALLOWED_TAGS = new Set([
  "p",
  "br",
  "h2",
  "h3",
  "strong",
  "b",
  "em",
  "i",
  "ul",
  "ol",
  "li",
  "blockquote",
  "a",
]);

function appendSafeNode(source: Node, target: Node) {
  if (source.nodeType === Node.TEXT_NODE) {
    target.appendChild(document.createTextNode(source.textContent ?? ""));
    return;
  }

  if (!(source instanceof HTMLElement)) return;

  const tagName = source.tagName.toLowerCase();
  if (!ALLOWED_TAGS.has(tagName)) {
    source.childNodes.forEach((child) => appendSafeNode(child, target));
    return;
  }

  const safeElement = document.createElement(tagName);
  if (tagName === "a") {
    const href = source.getAttribute("href")?.trim() ?? "";
    if (/^(https?:|mailto:)/i.test(href)) {
      safeElement.setAttribute("href", href);
      safeElement.setAttribute("rel", "noopener noreferrer");
      if (/^https?:/i.test(href)) {
        safeElement.setAttribute("target", "_blank");
      }
    }
  }

  source.childNodes.forEach((child) => appendSafeNode(child, safeElement));
  target.appendChild(safeElement);
}

export function sanitizeBlogHtml(value: string) {
  const parsed = new DOMParser().parseFromString(value, "text/html");
  const safeRoot = document.createElement("div");
  parsed.body.childNodes.forEach((node) => appendSafeNode(node, safeRoot));
  return safeRoot.innerHTML;
}
