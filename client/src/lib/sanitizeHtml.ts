/** Tags kept as they are; any other tag is dropped but its content stays (so `<font>`, `<section>` ... just disappear). */
const ALLOWED = new Set([
  'p', 'br', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'ul', 'ol', 'li', 'strong', 'b', 'em', 'i', 'u', 'sub', 'sup', 'a', 'span', 'div', 'blockquote',
  'table', 'thead', 'tbody', 'tr', 'th', 'td',
]);

/** Tags removed together with their content. */
const DROPPED = new Set(['script', 'style', 'iframe', 'object', 'embed', 'link', 'meta', 'noscript', 'template', 'svg', 'math', 'form', 'input', 'button', 'textarea', 'select']);

const SAFE_HREF = /^(https?:|mailto:|\/|#)/i;

function clean(parent: Node) {
  for (const child of Array.from(parent.childNodes)) {
    if (child.nodeType === Node.TEXT_NODE) continue;
    if (child.nodeType !== Node.ELEMENT_NODE) {
      parent.removeChild(child);
      continue;
    }
    const element = child as HTMLElement;
    const tag = element.tagName.toLowerCase();
    if (DROPPED.has(tag)) {
      element.remove();
      continue;
    }
    clean(element);
    if (!ALLOWED.has(tag)) {
      element.replaceWith(...Array.from(element.childNodes));
      continue;
    }
    for (const attribute of Array.from(element.attributes)) {
      const name = attribute.name.toLowerCase();
      const keep = (tag === 'a' && name === 'href' && SAFE_HREF.test(attribute.value.trim())) || ((tag === 'td' || tag === 'th') && (name === 'colspan' || name === 'rowspan'));
      if (!keep) element.removeAttribute(attribute.name);
    }
    if (tag === 'a') {
      element.setAttribute('target', '_blank');
      element.setAttribute('rel', 'noopener noreferrer');
    }
  }
}

/** Editor HTML from the API -> safe HTML: only basic text / list / table tags, no scripts, no event handlers, no styles, only http(s)/mailto links. */
export function sanitizeHtml(html: string): string {
  const body = new DOMParser().parseFromString(html, 'text/html').body;
  clean(body);
  return body.innerHTML;
}

/** Plain text -> HTML text (for building markup from API strings). */
export const escapeHtml = (value: string) => value.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
