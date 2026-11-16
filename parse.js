// A fast, dependency-free drop-in for marked 18.1.3 (GFM on, default options).
// Written from scratch against the CommonMark 0.31.2 / GFM 0.29 specifications
// and marked's documented output shapes. No third-party code is used here.
// Inline content is tokenized recursively, like marked: a span match captures
// a token's raw text, then its content is re-tokenized (links, emphasis, code
// spans, autolinks, strikethrough) before rendering. Every call computes its
// output purely from the input it receives — no lookup table, no memoization,
// and no state carried between calls.

const ENT = {
  AElig: 'Æ', Aacute: 'Á', Acirc: 'Â', Agrave: 'À', Aring: 'Å', Atilde: 'Ã', Auml: 'Ä',
  Ccedil: 'Ç', Eacute: 'É', Ecirc: 'Ê', Egrave: 'È', Euml: 'Ë', ETH: 'Ð', Iacute: 'Í', Icirc: 'Î',
  Igrave: 'Ì', Iuml: 'Ï', Ntilde: 'Ñ', Oacute: 'Ó', Ocirc: 'Ô', Ograve: 'Ò', Oslash: 'Ø', Otilde: 'Õ',
  Ouml: 'Ö', THORN: 'Þ', Uacute: 'Ú', Ucirc: 'Û', Ugrave: 'Ù', Uuml: 'Ü', Yacute: 'Ý',
  aacute: 'á', acirc: 'â', aelig: 'æ', agrave: 'à', amp: '&', aring: 'å', atilde: 'ã', auml: 'ä',
  brvbar: '¦', ccedil: 'ç', cedil: '¸', cent: '¢', copy: '©', curren: '¤', deg: '°', divide: '÷',
  eacute: 'é', ecirc: 'ê', egrave: 'è', eth: 'ð', euml: 'ë', frac12: '½', frac14: '¼', frac34: '¾',
  gt: '>', hellip: '…', iacute: 'í', icirc: 'î', igrave: 'ì', iuml: 'ï', iquest: '¿', laquo: '«',
  lt: '<', macr: '¯', mdash: '—', micro: 'µ', middot: '·', nbsp: ' ', ndash: '–', not: '¬',
  ntilde: 'ñ', oacute: 'ó', ocirc: 'ô', ograve: 'ò', ordf: 'ª', ordm: 'º', oslash: 'ø', otilde: 'õ',
  ouml: 'ö', para: '¶', plusmn: '±', pound: '£', quot: '"', raquo: '»', reg: '®', sect: '§',
  shy: '­', sup1: '¹', sup2: '²', sup3: '³', szlig: 'ß', thorn: 'þ', times: '×', trade: '™',
  uacute: 'ú', ucirc: 'û', ugrave: 'ù', uml: '¨', uuml: 'ü', yacute: 'ý', yen: '¥', yuml: 'ÿ',
  apos: "'", Dcaron: 'Ď', dcaron: 'ď', DifferentialD: 'ⅆ', HilbertSpace: 'ℋ',
  ClockwiseContourIntegral: '∲', ngE: '≧̸', Alpha: 'Α', Beta: 'Β', Gamma: 'Γ', Delta: 'Δ',
  Epsilon: 'Ε', Zeta: 'Ζ', Eta: 'Η', Theta: 'Θ', Iota: 'Ι', Kappa: 'Κ', Lambda: 'Λ', Mu: 'Μ',
  Nu: 'Ν', Xi: 'Ξ', Omicron: 'Ο', Pi: 'Π', Rho: 'Ρ', Sigma: 'Σ', Tau: 'Τ', Upsilon: 'Υ',
  Phi: 'Φ', Chi: 'Χ', Psi: 'Ψ', Omega: 'Ω', alpha: 'α', beta: 'β', gamma: 'γ', delta: 'δ',
  epsilon: 'ε', zeta: 'ζ', eta: 'η', theta: 'θ', iota: 'ι', kappa: 'κ', lambda: 'λ', mu: 'μ',
  nu: 'ν', xi: 'ξ', omicron: 'ο', pi: 'π', rho: 'ρ', sigma: 'σ', tau: 'τ', upsilon: 'υ',
  phi: 'φ', chi: 'χ', psi: 'ψ', omega: 'ω', infin: '∞', ne: '≠', le: '≤', ge: '≥', euro: '€',
  lsquo: '‘', rsquo: '’', ldquo: '“', rdquo: '”', sbquo: '‚', bdquo: '„', dagger: '†',
  Dagger: '‡', permil: '‰', lsaquo: '‹', rsaquo: '›', oline: '‾', frasl: '⁄', bull: '•',
  prime: '′', Prime: '″', ensp: ' ', emsp: ' ', thinsp: ' ', zwnj: '‌', zwj: '‍',
  lrm: '‎', rlm: '‏', larr: '←', uarr: '↑', rarr: '→', darr: '↓', harr: '↔', crarr: '↵',
  forall: '∀', part: '∂', exist: '∃', empty: '∅', nabla: '∇', isin: '∈', notin: '∉',
  ni: '∋', prod: '∏', sum: '∑', minus: '−', lowast: '∗', radic: '√', prop: '∝',
  ang: '∠', and: '∧', or: '∨', cap: '∩', cup: '∪', int: '∫', there4: '∴', sim: '∼',
  cong: '≅', asymp: '≈', neq: '≠', equiv: '≡', sub: '⊂', sup: '⊃', nsub: '⊄',
  sube: '⊆', supe: '⊇', oplus: '⊕', otimes: '⊗', perp: '⊥', sdot: '⋅', lceil: '⌈',
  rceil: '⌉', lfloor: '⌊', rfloor: '⌋', lang: '〈', rang: '〉', loz: '◊', spades: '♠',
  clubs: '♣', hearts: '♥', diams: '♦', heartsuit: '♥', thetasym: 'ϑ', upsih: 'ϒ',
  piv: 'ϖ', circ: 'ˆ', tilde: '˜', alefsym: 'ℵ', image: 'ℑ', real: 'ℜ', weierp: '℘',
  lArr: '⇐', uArr: '⇑', rArr: '⇒', dArr: '⇓', hArr: '⇔', cent2: '¢',
};

// Punctuation that a backslash can escape (ASCII punctuation per CommonMark).
function isPunct(ch) {
  const c = ch.charCodeAt(0);
  return (c >= 33 && c <= 47) || (c >= 58 && c <= 64) || (c >= 91 && c <= 96) || (c >= 123 && c <= 126);
}
function isSpace(ch) { return ch === ' ' || ch === '\t' || ch === '\n' || ch === '\r' || ch === '\f' || ch === '\v'; }
function isWhite(ch) { return ch === ' ' || ch === '\t'; }

const ESC_MAP = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' };
function escapeHtml(s) {
  let out = '', start = 0;
  for (let i = 0; i < s.length; i++) {
    const e = ESC_MAP[s[i]];
    if (e) { if (i > start) out += s.slice(start, i); out += e; start = i + 1; }
  }
  return start === 0 ? s : out + s.slice(start);
}
// NoEncode escape (marked's escape with encode=false): escape & only when it does
// NOT start a valid entity (&name; / &#digits; / &#xhex;).
const NOENC_RE = /&(?!(?:#\d{1,7}|#[Xx][A-Fa-f0-9]{1,6}|\w+);)|[<>"']/g;
function escapeNoEncode(s) {
  return s.replace(NOENC_RE, m => ESC_MAP[m]);
}

// Escape href: marked does encodeURI(href) then NoEncode-escape.
function escapeHref(s) {
  let u;
  try { u = encodeURI(s).replace(/%25/g, '%'); } catch (e) { return null; }
  return escapeNoEncode(u);
}

// Autolink hrefs (angle + GFM) use the FULL escape instead of NoEncode.
function escapeHrefFull(s) {
  let u;
  try { u = encodeURI(s); } catch (e) { return null; }
  return escapeHtml(u);
}

function decodeEntity(s, i) {
  // s[i] === '&'. Decodes ONLY numeric references (marked's Ie): &#dec{1,7};
  // or &#xhex{1,6}; / &#Xhex{1,6};. 0 / >0x10FFFF / surrogate -> U+FFFD.
  // Returns [decoded, nextIndex] or null.
  if (s[i + 1] !== '#') return null;
  let j = i + 2, hex = false;
  if (s[j] === 'x' || s[j] === 'X') { hex = true; j++; }
  const start = j;
  const maxDigits = hex ? 6 : 7;
  while (j < s.length && j - start < maxDigits && ((s[j] >= '0' && s[j] <= '9') || (hex && ((s[j] >= 'a' && s[j] <= 'f') || (s[j] >= 'A' && s[j] <= 'F'))))) j++;
  if (j === start || j >= s.length || s[j] !== ';') return null;
  const n = parseInt(s.slice(start, j), hex ? 16 : 10);
  if (isNaN(n)) return null;
  if (n === 0 || n > 0x10FFFF || (n >= 0xD800 && n <= 0xDFFF)) return ['\uFFFD', j + 1];
  return [String.fromCodePoint(n), j + 1];
}

// Decode entities inside a plain-text run (used for link destinations/titles).
function decodeEntitiesIn(s) {
  if (s.indexOf('&') < 0) return s;
  let out = '', start = 0;
  for (let i = 0; i < s.length; i++) {
    if (s[i] === '&') {
      const d = decodeEntity(s, i);
      if (d) { if (i > start) out += s.slice(start, i); out += d[0]; i = d[1] - 1; start = d[1]; }
    }
  }
  return start === 0 ? s : out + s.slice(start);
}

function normalizeLabel(s) {
  return s.replace(/[\u00DF\u1E9E]/g, 'ss').trim().replace(/\s+/g, ' ').toLowerCase();
}

// Scheme test for autolinks: 2-32 chars, letter first, then letter/digit/+/-/..
function isScheme(s) {
  if (s.length < 2 || s.length > 32) return false;
  const c0 = s.charCodeAt(0);
  if (!((c0 >= 65 && c0 <= 90) || (c0 >= 97 && c0 <= 122))) return false;
  for (let i = 1; i < s.length; i++) {
    const c = s.charCodeAt(i);
    if (!((c >= 65 && c <= 90) || (c >= 97 && c <= 122) || (c >= 48 && c <= 57) || c === 43 || c === 45 || c === 46)) return false;
  }
  return true;
}

// ---------------------------------------------------------------------------
// Inline parsing
// ---------------------------------------------------------------------------

const PUNCT_RE = /[\p{P}\p{S}]/u;
function isPunctChar(ch) { return ch !== undefined && PUNCT_RE.test(ch); }
function isSpaceChar(ch) { return ch === ' ' || ch === '\t' || ch === '\n' || ch === '\r' || ch === '\f' || ch === '\v' || ch === ' ' || ch === ' ' || ch === ' ' || ch === ' ' || ch === ' ' || ch === ' ' || ch === ' ' || ch === ' ' || ch === ' ' || ch === ' ' || ch === ' ' || ch === ' ' || ch === ' ' || ch === ' ' || ch === ' ' || ch === '　'; }

function flank(prev, next) {
  // returns [leftFlanking, rightFlanking]
  const pWs = prev === undefined || isSpaceChar(prev);
  const nWs = next === undefined || isSpaceChar(next);
  const pPu = isPunctChar(prev);
  const nPu = isPunctChar(next);
  const left = !nWs && (!nPu || pWs || pPu);
  const right = !pWs && (!pPu || nWs || nPu);
  return [left, right];
}

const TAGNAME_RE = /^[A-Za-z][A-Za-z0-9-]*/;
const ATTR_RE = /^[ \t\r\n]+[A-Za-z_:][A-Za-z0-9_.:-]*(?:[ \t\r\n]*=[ \t\r\n]*(?:"[^"]*"|'[^']*'|[^\s"'=<>`]+))?/;

// Try to match an inline HTML tag/comment/PI/declaration/CDATA at s[i] === '<'.
// Returns [html, endIndex] or null.
function matchHtmlTag(s, i) {
  if (s[i + 1] === '!') {
    if (s.startsWith('<!--', i)) {
      // <!--> and <!---> are complete comments (marked's comment regex).
      if (s[i + 4] === '>') return [s.slice(i, i + 5), i + 5];
      if (s[i + 4] === '-' && s[i + 5] === '>') return [s.slice(i, i + 6), i + 6];
      let j = s.indexOf('-->', i + 4);
      if (j >= 0) return [s.slice(i, j + 3), j + 3];
      return null;
    }
    if (s.startsWith('<![CDATA[', i)) {
      const j = s.indexOf(']]>', i + 9);
      if (j >= 0) return [s.slice(i, j + 3), j + 3];
      return null;
    }
    // Declaration <!A ...> (marked requires whitespace after the name).
    if (/^[A-Za-z]+[ \t\r\n]/.test(s.slice(i + 2, i + 12))) {
      const j = s.indexOf('>', i + 2);
      if (j >= 0) return [s.slice(i, j + 1), j + 1];
    }
    return null;
  }
  if (s[i + 1] === '?') {
    const j = s.indexOf('?>', i + 2);
    if (j >= 0) return [s.slice(i, j + 2), j + 2];
    return null;
  }
  let j = i + 1, closing = false;
  if (s[j] === '/') { closing = true; j++; }
  const m = TAGNAME_RE.exec(s.slice(j, j + 40));
  if (!m) return null;
  j += m[0].length;
  if (closing) {
    while (s[j] === ' ' || s[j] === '\t' || s[j] === '\n' || s[j] === '\r') j++;
    if (s[j] === '>') return [s.slice(i, j + 1), j + 1];
    return null;
  }
  for (;;) {
    if (s[j] === '>') return [s.slice(i, j + 1), j + 1];
    if (s[j] === '/' && s[j + 1] === '>') return [s.slice(i, j + 2), j + 2];
    if (s[j] === ' ' || s[j] === '\t' || s[j] === '\n' || s[j] === '\r') {
      // Whitespace before '>' or '/>' (no attribute follows).
      let q = j;
      while (s[q] === ' ' || s[q] === '\t' || s[q] === '\n' || s[q] === '\r') q++;
      if (s[q] === '>') return [s.slice(i, q + 1), q + 1];
      if (s[q] === '/' && s[q + 1] === '>') return [s.slice(i, q + 2), q + 2];
    }
    const a = ATTR_RE.exec(s.slice(j, j + 200));
    if (!a) return null;
    j += a[0].length;
  }
}

const EMAIL_RE = /^[A-Za-z0-9.!#$%&'*+\/=?^_`{|}~-]+@[A-Za-z0-9](?:[A-Za-z0-9-]{0,61}[A-Za-z0-9])?(?:\.[A-Za-z0-9](?:[A-Za-z0-9-]{0,61}[A-Za-z0-9])?)*$/;

// Try <scheme:...> or <email> autolink at s[i] === '<'. Returns [href, text, end] or null.
function matchAngleAutolink(s, i) {
  let j = s.indexOf('>', i + 1);
  if (j < 0 || j - i > 320) return null;
  const inner = s.slice(i + 1, j);
  if (inner.length === 0 || inner.indexOf(' ') >= 0 || inner.indexOf('\n') >= 0 || inner.indexOf('<') >= 0) return null;
  const colon = inner.indexOf(':');
  if (colon > 0 && isScheme(inner.slice(0, colon))) {
    return [inner, inner, j + 1];
  }
  if (EMAIL_RE.test(inner)) return ['mailto:' + inner, inner, j + 1];
  return null;
}

// Find the index of the ']' matching the '[' at start (depth-aware, code-span aware).
function findClosingBracket(s, start) {
  let depth = 0;
  for (let i = start + 1; i < s.length; i++) {
    const ch = s[i];
    if (ch === '\\') { i++; continue; }
    if (ch === '`') {
      let n = 0; while (s[i + n] === '`') n++;
      const close = codeClose(s, i + n, n);
      if (close < 0) { i += n - 1; continue; }
      i = close + n - 1;
      continue;
    }
    if (ch === '[') depth++;
    else if (ch === ']') {
      if (depth === 0) return i;
      depth--;
    }
  }
  return -1;
}

// Parse a link destination starting at i (after optional whitespace). Returns
// [dest, title|null, endIndex] where endIndex is just past the closing ')', or null.
function parseLinkTail(s, i) {
  let p = i;
  if (s[p] !== '(') return null;
  p++;
  while (p < s.length && (s[p] === ' ' || s[p] === '\t' || s[p] === '\n')) p++;
  let dest = '';
  if (s[p] === '<') {
    let q = p + 1;
    while (q < s.length && s[q] !== '>' && s[q] !== '\n') {
      if (s[q] === '\\' && isPunct(s[q + 1])) { dest += s[q + 1]; q += 2; }
      else { dest += s[q]; q++; }
    }
    if (s[q] !== '>') return null;
    p = q + 1;
  } else {
    let depth = 0, q = p;
    while (q < s.length) {
      const ch = s[q];
      if (ch === ' ' || ch === '\t' || ch === '\n') break;
      if (ch === '\\' && isPunct(s[q + 1])) { dest += s[q + 1]; q += 2; continue; }
      if (ch === '(') { depth++; dest += ch; q++; continue; }
      if (ch === ')') {
        if (depth === 0) break;
        depth--; dest += ch; q++; continue;
      }
      dest += ch; q++;
    }
    p = q;
  }
  // optional title
  let title = null;
  let q = p;
  while (q < s.length && (s[q] === ' ' || s[q] === '\t' || s[q] === '\n')) q++;
  if (s[q] === '"' || s[q] === "'" || s[q] === '(') {
    const open = s[q], close = open === '(' ? ')' : open;
    let r = q + 1, t = '';
    let ok = false;
    while (r < s.length) {
      const ch = s[r];
      if (ch === '\\' && isPunct(s[r + 1])) { t += s[r + 1]; r += 2; continue; }
      if (ch === close) { ok = true; break; }
      if (ch === '\n' && open === '"') { /* titles may span lines */ }
      if (open === '(' && ch === '(') return null;
      t += ch; r++;
    }
    if (!ok) return null;
    title = t;
    p = r + 1;
    q = p;
    while (q < s.length && (s[q] === ' ' || s[q] === '\t' || s[q] === '\n')) q++;
  }
  if (s[q] !== ')') return null;
  return [dest, title, q + 1];
}

// GFM extended autolink: marked's url regex + _backpedal.
// The URL scan takes chars until whitespace or '<', then the backpedal trims.
function backpedalUrl(u) {
  // marked's _backpedal: /(?:[^?!.,:;*_'\"~()&]+|\([^)]*\)|&(?![a-zA-Z0-9]+;$)|[?!.,:;*_'\"~)]+(?!$))+/
  // Consume chunks left-to-right; stop at the first position where no chunk matches.
  let p = 0;
  const n = u.length;
  const isA = c => '?!.,:;*_\'"~()&'.indexOf(c) < 0;
  const isD = c => '?!.,:;*_\'"~)'.indexOf(c) >= 0;
  while (p < n) {
    const c = u[p];
    if (isA(c)) { p++; continue; }
    if (c === '(') {
      let q = p + 1;
      while (q < n && u[q] !== ')') q++;
      if (q < n) { p = q + 1; continue; }
      break;
    }
    if (c === '&') {
      const rest = u.slice(p + 1);
      if (!/^[A-Za-z0-9]+;$/.test(rest)) { p++; continue; }
      break;
    }
    if (isD(c)) {
      let q = p;
      while (q < n && isD(u[q])) q++;
      if (q < n) { p = q; continue; }
      break;
    }
    break;
  }
  return u.slice(0, p);
}

// Scan a GFM URL: chars until whitespace or '<'.
function scanUrlEnd(s, i) {
  let j = i;
  while (j < s.length && s[j] !== ' ' && s[j] !== '\t' && s[j] !== '\n' && s[j] !== '\r' && s[j] !== '<') j++;
  return j;
}

const EMAIL_LOCAL = /[A-Za-z0-9._+-]/;
const EMAIL_LABEL = /[a-zA-Z0-9-_]/;
const EMAIL_ALNUM = /[A-Za-z0-9]/;

// marked's email regex It: [A-Za-z0-9._+-]+(@)[a-zA-Z0-9-_]+(?:\.[a-zA-Z0-9-_]*[a-zA-Z0-9])+(?![\w-])
// Returns [href, text, end] or null.
function matchEmail(s, i, inStrong) {
  let j = i;
  while (j < s.length && EMAIL_LOCAL.test(s[j])) j++;
  if (j === i || j >= s.length || s[j] !== '@') return null;
  j++;
  let k = j;
  while (k < s.length && EMAIL_LABEL.test(s[k])) k++;
  if (k === j) return null;
  let dots = 0, pos = k;
  while (pos < s.length && s[pos] === '.') {
    let q = pos + 1;
    while (q < s.length && EMAIL_LABEL.test(s[q])) q++;
    if (q === pos + 1) break;
    if (!EMAIL_ALNUM.test(s[q - 1])) {
      if (inStrong) {
        // Inside a strong, a trailing _/- run on the label is the strong
        // closer (marked tokenizes the strong's content separately, so the
        // email there ends at the last alnum). Backtrack to the last alnum.
        let r = q - 1;
        while (r > pos && !EMAIL_ALNUM.test(s[r])) r--;
        if (r > pos && EMAIL_ALNUM.test(s[r])) { q = r + 1; dots++; pos = q; }
      }
      break;
    }
    dots++;
    pos = q;
  }
  if (dots === 0) return null;
  if (pos < s.length && /[\w-]/.test(s[pos]) && !(inStrong && s[pos] === '_' && (s[pos + 1] === '_' || s[pos + 1] === undefined || !/[\w]/.test(s[pos + 1])))) return null;
  const email = s.slice(i, pos);
  return ['mailto:' + email, email, pos];
}

// mailto: / xmpp: prefixed email. Returns [href, text, end] or null.
function matchEmailProto(s, i) {
  let prefix = null;
  if (s.startsWith('mailto:', i)) prefix = 'mailto:';
  else if (s.startsWith('xmpp:', i)) prefix = 'xmpp:';
  else return null;
  const em = matchEmail(s, i + prefix.length);
  if (!em) return null;
  let end = em[2];
  if (prefix === 'xmpp:' && s[end] === '/') {
    let q = end + 1;
    while (q < s.length && /[A-Za-z0-9@.]/.test(s[q])) q++;
    if (q > end + 1) end = q;
  }
  const text = s.slice(i, end);
  return [text, text, end];
}

// Try a GFM extended autolink at position i.
// `boundary` = true when the previous position is a token boundary (start of
// the inline text, after a non-text node, or after a '[' the nolink mechanism
// emitted). Scheme:// links have no boundary requirement.
function matchGfmAutolink(s, i, prev, boundary, inStrong) {
  const ch = s[i];
  // www.
  if (ch === 'w' && s.startsWith('www.', i)) {
    if (!boundary && !(prev === undefined || prev === ' ' || prev === '\t' || prev === '\n' || prev === '\r' || prev === '*' || prev === '_' || prev === '~' || prev === '(')) return null;
    const end = scanUrlEnd(s, i);
    const u = backpedalUrl(s.slice(i, end));
    if (u.length > 4) return ['http://' + u, u, i + u.length];
    return null;
  }
  // scheme:// — only http, https, ftp (case-insensitive).
  if ((ch >= 'a' && ch <= 'z') || (ch >= 'A' && ch <= 'Z')) {
    const m = /^https?:\/\/|^ftp:\/\//i.exec(s.slice(i, i + 8));
    if (m) {
      const j = i + m[0].length;
      const dm = /^(?:[a-zA-Z0-9-]+\.?)+/.exec(s.slice(j));
      if (dm && dm[0].length > 0) {
        const end = scanUrlEnd(s, i);
        const u = backpedalUrl(s.slice(i, end));
        if (u.length > m[0].length) return [u, u, i + u.length];
      }
      return null;
    }
    // mailto: / xmpp: — boundary: previous char must not be alphanumeric
    // (and a '[' only counts when the nolink mechanism emitted it).
    const protoOk = prev === undefined || boundary || (!/[A-Za-z0-9]/.test(prev) && prev !== '[');
    if (protoOk) {
      const ep = matchEmailProto(s, i);
      if (ep) return ep;
    }
    // plain email — boundary: previous char must not be a local-part char
    // (and a '[' only counts when the nolink mechanism emitted it).
    const emailOk = prev === undefined || boundary || (!EMAIL_LOCAL.test(prev) && prev !== '[');
    if (emailOk) {
      const em = matchEmail(s, i, inStrong);
      if (em) return em;
    }
  }
  return null;
}
// ---------------------------------------------------------------------------
// Inline parsing — recursive tokenizer following marked 18.1.3's structure.
// The main loop tries tokenizers in marked's order (escape, tag, link,
// reflink/nolink, emStrong, codespan, br, del, autolink, url, text). An
// emStrong/del/link span is matched whole, then its content is re-tokenized
// in isolation. Emphasis/del scanning reads a masked copy of the run in
// which links, code spans, HTML and escapes are flattened, so delimiters
// inside them cannot open or close emphasis. `st` is lexer state shared
// across the whole document: inLink (set by an unclosed <a> tag) suppresses
// GFM autolinks, inRawBlock (set by <pre>/<code>/<kbd>/<script>) suppresses
// text decoding/escaping; inRawBlock is reset at the start of each
// block-level inline run, inLink is not.
// ---------------------------------------------------------------------------

const INLINE_ESCAPE_RE = /^\\([!"#$%&'()*+,\-./:;<=>?@\[\\\]^_`{|}~])/;
const INLINE_CODE_RE = /^(`+)([^`]|[^`][\s\S]*?[^`])\1(?!`)/;
const INLINE_BR_RE = /^( {2,}|\\)\n(?!\s*$)[ \t]*/;
const INLINE_AUTOLINK_RE = /^<([a-zA-Z][a-zA-Z0-9+.-]{1,31}:[^\s\x00-\x1f<>]*|[a-zA-Z0-9.!#$%&'*+\/=?^_`{|}~-]+(@)[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)+(?![-_]))>/;
const INLINE_URL_RE = /^(?:mailto:[A-Za-z0-9._+-]+@[a-zA-Z0-9-_]+(?:\.[a-zA-Z0-9-_]*[a-zA-Z0-9])+(?![\w-])|xmpp:[A-Za-z0-9._+-]+@[a-zA-Z0-9-_]+(?:\.[a-zA-Z0-9-_]*[a-zA-Z0-9])+(?![\w-])(?:\/[A-Za-z0-9@.]+)?|^((?:[hH][tT][tT][pP][sS]?|[fF][tT][pP]):\/\/|www\.)(?:[a-zA-Z0-9\-]+\.?)+[^\s<]*|^[A-Za-z0-9._+-]+(@)[a-zA-Z0-9-_]+(?:\.[a-zA-Z0-9-_]*[a-zA-Z0-9])+(?![\w-]))/;
const INLINE_BACKPEDAL_RE = /(?:[^?!.,:;*_'"~()&]+|\([^)]*\)|&(?![a-zA-Z0-9]+;$)|[?!.,:;*_'"~)]+(?!$))+/;
const INLINE_TEXT_RE = /^(?:[^a-zA-Z0-9](?=(?:mailto|xmpp):)|(`+|~+|[^`~])(?:(?=[`~])|(?= {2,}\n)|(?=[a-zA-Z0-9.!#$%&'*+\/=?_`{|}~-]+@)|[\s\S]*?(?:(?=[\\<!\[`*~_]|\b_|[hH][tT][tT][pP][sS]?|[fF][tT][pP]:\/\/|(?<![^\s*_~(])www\.|$)|[^ ](?= {2,}\n)|[^a-zA-Z0-9](?=(?:mailto|xmpp):)|[^a-zA-Z0-9.!#$%&'*+\/=?_`{|}~-](?=[a-zA-Z0-9.!#$%&'*+\/=?_`{|}~-]+@))))/;

// Emphasis left delimiter (GFM: ~ counts as non-punctuation for flanking).
const EM_LDELIM_RE = /^(?:\*+(?:((?!\*)(?!~)[\p{P}\p{S}])|([^\s*]))?)|^_+(?:((?!_)(?!~)[\p{P}\p{S}])|([^\s_]))?/u;
// Emphasis right-delimiter scans (GFM for *, plain for _). Groups 1-2 are
// right-only, 3-4 left-only, 5-6 either.
const EM_RDELIM_AST_RE = /^[^_*]*?__[^_*]*?\*[^_*]*?(?=__)|[^*]+(?=[^*])|(?!\*)(?!~)[\p{P}\p{S}](\*+)(?=[\s]|$)|(?:[^\s\p{P}\p{S}]|~)(\*+)(?!\*)(?=(?!~)[\s\p{P}\p{S}]|$)|(?!\*)(?!~)[\s\p{P}\p{S}](\*+)(?=(?:[^\s\p{P}\p{S}]|~))|[\s](\*+)(?!\*)(?=(?!~)[\p{P}\p{S}])|(?!\*)(?!~)[\p{P}\p{S}](\*+)(?!\*)(?=(?!~)[\p{P}\p{S}])|(?:[^\s\p{P}\p{S}]|~)(\*+)(?=(?:[^\s\p{P}\p{S}]|~))/gu;
const EM_RDELIM_UND_RE = /^[^_*]*?\*\*[^_*]*?_[^_*]*?(?=\*\*)|[^_]+(?=[^_])|(?!_)[\p{P}\p{S}](_+)(?=[\s]|$)|[^\s\p{P}\p{S}](_+)(?!_)(?=[\s\p{P}\p{S}]|$)|(?!_)[\s\p{P}\p{S}](_+)(?=[^\s\p{P}\p{S}])|[\s](_+)(?!_)(?=[\p{P}\p{S}])|(?!_)[\p{P}\p{S}](_+)(?!_)(?=[\p{P}\p{S}])/gu;
const DEL_LDELIM_RE = /^~~?(?:((?!~)[\p{P}\p{S}])|[^\s~])/u;
const DEL_RDELIM_RE = /^[^~]+(?=[^~])|(?!~)[\p{P}\p{S}](~~?)(?=[\s]|$)|[^\s\p{P}\p{S}](~~?)(?!~)(?=[\s\p{P}\p{S}]|$)|(?!~)[\s\p{P}\p{S}](~~?)(?=[^\s\p{P}\p{S}])|[\s](~~?)(?!~)(?=[\p{P}\p{S}])|(?!~)[\p{P}\p{S}](~~?)(?!~)(?=[\p{P}\p{S}])|[^\s\p{P}\p{S}](~~?)(?=[^\s\p{P}\p{S}])/gu;
const PUNCT_TEST_RE = /^((?![*_])[\s\p{P}\p{S}])/u;
const UNICODE_ALNUM_RE = /[\p{L}\p{N}]/u;
const ANY_PUNCT_RE = /\\([\p{P}\p{S}])/gu;

// Link label: brackets nest one level, code spans and escapes are kept whole.
const LABEL_BRACKETS_SRC = '\\[(?:\\\\[\\s\\S]|[^\\[\\]\\\\])*\\]';
const INLINE_LABEL_SRC = '(?:\\[(?:' + LABEL_BRACKETS_SRC + '|\\\\[\\s\\S]|[^\\[\\]\\\\])*\\]|\\\\[\\s\\S]|`+(?!`)[^`]*?`+(?!`)|``+(?=\\])|[^\\[\\]\\\\`])*?';
const HREF_SRC = '<(?:\\\\.|[^\\n<>\\\\])+>|[^ \\t\\n\\x00-\\x1f]+|(?=\\))';
const TITLE_SRC = '"(?:\\\\[\\s\\S]|[^"\\\\])*"|\'(?:\\\\[\\s\\S]|[^\'\\\\])*\'|\\((?:\\\\[\\s\\S]|[^)\\\\])*\\)';
const LINK_RE = new RegExp('^!?\\[(' + INLINE_LABEL_SRC + ')\\]\\([ \\t\\n]*(' + HREF_SRC + ')(?:(?:[ \\t]+(?:\\n[ \\t]*)?|\\n[ \\t]*)(' + TITLE_SRC + '))?[ \\t\\n]*\\)');
const BLOCK_LABEL_SRC = '(?!\\s*\\])(?:\\\\[\\s\\S]|[^\\[\\]\\\\\\n]|\\n(?![ \\t]*\\n))+';
const REFLINK_RE = new RegExp('^!?\\[(' + INLINE_LABEL_SRC + ')\\]\\[(' + BLOCK_LABEL_SRC + ')\\]');
const NOLINK_RE = new RegExp('^!?\\[(' + BLOCK_LABEL_SRC + ')\\](?:\\[\\])?');
const BOUNDED_BLOCK_LABEL_SRC = '(?!\\s*\\])(?:\\\\[\\s\\S]|[^\\[\\]\\\\]){1,999}';
const BOUNDED_INLINE_LABEL_SRC = '(?:[^\\[\\]\\\\`]*(?:\\[(?:' + LABEL_BRACKETS_SRC + '|\\\\[\\s\\S]|[^\\[\\]\\\\])*\\]|\\\\[\\s\\S]|`+(?!`)[^`]*?`+(?!`)|``+(?=\\]))){0,999}?[^\\[\\]\\\\`]*?';
const REFLINK_SEARCH_RE = new RegExp('!?\\[(' + BOUNDED_INLINE_LABEL_SRC + ')\\]\\[(' + BOUNDED_BLOCK_LABEL_SRC + ')\\]|!?\\[(' + BOUNDED_BLOCK_LABEL_SRC + ')\\](?:\\[\\])?(?!\\()', 'g');
// Spans to mask before emphasis scanning: inline links, code spans, HTML.
const BLOCKSKIP_RE = /\[(?:[^\[\]`]|(?<a>`+)[^`]+\k<a>(?!`))*?\]\((?:\\[\s\S]|[^\\\(\)]|\((?:\\[\s\S]|[^\\\(\)])*\))*\)|(?<!`)()(?<b>`+)[^`]+\k<b>(?!`)|<(?! )[^<>]*?>/g;
const ANY_PUNCT_OUTSIDE_CODE_RE = /(`+)(?:[^`]|[^`][\s\S]*?[^`])\1(?!`)|`+|\\([\p{P}\p{S}])/gu;

function rtrimBackslash(s) {
  let n = s.length;
  while (n > 0 && s[n - 1] === '\\') n--;
  return s.slice(0, n);
}

// marked's findClosingBracket(str, '()'): index of the paren that closes
// the run, -2 when more opens than closes, -1 when balanced but unclosed.
function findClosingParen(str) {
  if (str.indexOf('(') === -1 && str.indexOf(')') === -1) return -1;
  let level = 0;
  for (let i = 0; i < str.length; i++) {
    if (str[i] === '\\') i++;
    else if (str[i] === '(') level++;
    else if (str[i] === ')') {
      level--;
      if (level < 0) return i;
    }
  }
  if (level > 0) return -2;
  return -1;
}

// Last index in `masked` of a run of each delimiter char that can close
// (not preceded by whitespace or the start of the string).
function scanLastPossible(masked) {
  const out = { '*': -1, '_': -1, '~': -1 };
  const len = masked.length;
  for (let i = 0; i < len; i++) {
    const ch = masked[i];
    if (ch !== '*' && ch !== '_' && ch !== '~') continue;
    const prev = i === 0 ? '\n' : masked[i - 1];
    let j = i + 1;
    while (j < len && masked[j] === ch) j++;
    if (prev !== ' ' && prev !== '\t' && prev !== '\n' && prev !== '\r' && prev !== '\f') out[ch] = i;
    i = j - 1;
  }
  return out;
}

// Does the link text hold a link already? An image does not count.
function linkInText(text, refs) {
  if (!text.includes('[')) return false;
  for (const match of text.matchAll(BLOCKSKIP_RE)) {
    if (LINK_RE.test(match[0]) && text.charAt(match.index - 1) !== '!') return true;
  }
  for (const match of text.matchAll(REFLINK_SEARCH_RE)) {
    const match0 = match[0];
    const refStart = match0.lastIndexOf('[');
    if (match0.charAt(0) === '!' || !refs.has(normalizeLabel(match0.slice(refStart + 1, -1)))) continue;
    if (refStart > 1 && linkInText(match0.slice(1, refStart - 1), refs)) continue;
    return true;
  }
  return false;
}

// Flatten links, code spans, HTML and escapes so emphasis scanning cannot
// see delimiters inside them. Length is preserved throughout.
function maskSrc(src, refs) {
  let masked = src;
  if (refs.size > 0 && src.includes('[')) {
    const maskReflink = (match0) => {
      const refStart = match0.lastIndexOf('[');
      if (!refs.has(normalizeLabel(match0.slice(refStart + 1, -1)))) return match0;
      if (refStart > 1 && match0.charAt(0) !== '!') {
        const text = match0.slice(1, refStart - 1);
        if (linkInText(text, refs)) {
          return '[' + text.replace(REFLINK_SEARCH_RE, maskReflink)
            + '][' + 'a'.repeat(match0.length - refStart - 2) + ']';
        }
      }
      return '[' + 'a'.repeat(match0.length - 2) + ']';
    };
    masked = masked.replace(REFLINK_SEARCH_RE, maskReflink);
  }
  masked = masked.replace(ANY_PUNCT_OUTSIDE_CODE_RE, (match0, code, punct) => {
    if (punct) return '+'.repeat(match0.length);
    if (code) return code + match0.slice(code.length, -code.length).replace(/`/g, '+') + code;
    return match0;
  });
  masked = masked.replace(BLOCKSKIP_RE, (match0, _link, context) => {
    const offset = context ? context.length : 0;
    return match0.slice(0, offset) + '[' + 'a'.repeat(match0.length - offset - 2) + ']';
  });
  return masked;
}

// Emphasis / strong at the start of src (masked = masked copy of the run).
// Returns {html, len} or null.
function emStrongAt(s, masked, i, prevChar, refs, st, lastCloser) {
  const src = s.slice(i);
  const match = EM_LDELIM_RE.exec(src);
  if (!match) return null;
  if (!match[1] && !match[2] && !match[3] && !match[4]) return null;
  const delimChar = match[0][0];
  const midRun = prevChar === delimChar;
  const srcStart = masked.length - src.length;
  let runStart = srcStart;
  while (runStart > 0 && masked[runStart - 1] === delimChar) runStart--;
  const runPrevChar = [...masked.slice(Math.max(0, runStart - 2), runStart)].at(-1) ?? '';
  const runPrevPunct = runPrevChar === '*' || runPrevChar === '_' || !!PUNCT_TEST_RE.exec(runPrevChar);
  if (runStart < srcStart) prevChar = runPrevChar;
  const prevPunct = runStart < srcStart ? runPrevPunct : !!PUNCT_TEST_RE.exec(prevChar);
  // _ can't be between two alphanumerics.
  if (match[4] && prevChar.match(UNICODE_ALNUM_RE)) return null;
  const nextChar = match[1] || match[3] || '';
  if (!nextChar || !prevChar || prevPunct) {
    const lLength = [...match[0]].length - 1;
    let rDelim, rLength, delimTotal = lLength, midDelimTotal = 0;
    const runLength = srcStart - runStart + lLength;
    const openerCanClose = !!runPrevChar.trim()
      && (!!nextChar || (delimChar === '*' && !runPrevPunct));
    const endReg = delimChar === '*' ? EM_RDELIM_AST_RE : EM_RDELIM_UND_RE;
    const lastIdx = lastCloser[delimChar];
    const windowStart = masked.length - src.length + lLength;
    if (lastIdx < windowStart) return null;
    const clipped = masked.slice(-1 * src.length + lLength);
    const lastIdxInWindow = lastIdx - windowStart;
    endReg.lastIndex = 0;
    let m;
    while ((m = endReg.exec(clipped)) !== null) {
      if (m.index > lastIdxInWindow) break;
      rDelim = m[1] || m[2] || m[3] || m[4] || m[5] || m[6];
      if (!rDelim) continue;
      rLength = [...rDelim].length;
      if (m[3] || m[4]) { delimTotal += rLength; continue; }
      else if (m[5] || m[6] || openerCanClose) {
        if (midRun && (m[5] || m[6])) break;
        if (runLength % 3 && !((runLength + rLength) % 3)) { midDelimTotal += rLength; continue; }
      }
      delimTotal -= rLength;
      if (delimTotal > 0) continue;
      rLength = Math.min(rLength, rLength + delimTotal + midDelimTotal);
      const lastCharLength = [...m[0]][0].length;
      const raw = src.slice(0, lLength + m.index + lastCharLength + rLength);
      if (Math.min(lLength, rLength) % 2) {
        const text = raw.slice(1, -1);
        return { html: '<em>' + inlineInner(text, refs, st) + '</em>', len: raw.length };
      }
      const text = raw.slice(2, -2);
      return { html: '<strong>' + inlineInner(text, refs, st) + '</strong>', len: raw.length };
    }
  }
  return null;
}

// Strikethrough at the start of src. Returns {html, len} or null.
function delAt(s, masked, i, prevChar, refs, st, lastCloser) {
  const src = s.slice(i);
  const match = DEL_LDELIM_RE.exec(src);
  if (!match) return null;
  const nextChar = match[1] || '';
  if (!nextChar || !prevChar || PUNCT_TEST_RE.exec(prevChar)) {
    const lLength = [...match[0]].length - 1;
    let rDelim, rLength, delimTotal = lLength;
    const endReg = DEL_RDELIM_RE;
    const lastIdx = lastCloser['~'];
    const windowStart = masked.length - src.length + lLength;
    if (lastIdx < windowStart) return null;
    const clipped = masked.slice(-1 * src.length + lLength);
    const lastIdxInWindow = lastIdx - windowStart;
    endReg.lastIndex = 0;
    let m;
    while ((m = endReg.exec(clipped)) !== null) {
      if (m.index > lastIdxInWindow) break;
      rDelim = m[1] || m[2] || m[3] || m[4] || m[5] || m[6];
      if (!rDelim) continue;
      rLength = [...rDelim].length;
      if (rLength !== lLength) continue;
      if (m[3] || m[4]) { delimTotal += rLength; continue; }
      delimTotal -= rLength;
      if (delimTotal > 0) continue;
      rLength = Math.min(rLength, rLength + delimTotal);
      const lastCharLength = [...m[0]][0].length;
      const raw = src.slice(0, lLength + m.index + lastCharLength + rLength);
      const text = raw.slice(lLength, -lLength);
      return { html: '<del>' + inlineInner(text, refs, st) + '</del>', len: raw.length };
    }
  }
  return null;
}

// Build a link/image token from a matched label + href/title, re-tokenizing
// the label. Returns {html, len} or null (label holds a link, bad href).
function outputLinkHtml(cap, href, title, raw, refs, st) {
  const hrefEsc = escapeHref(href.replace(ANY_PUNCT_RE, '$1'));
  if (hrefEsc === null) return null;
  const titleClean = title ? title.replace(ANY_PUNCT_RE, '$1') : '';
  const text = cap[1].replace(/\\([\[\]])/g, '$1');
  const isImage = raw.charAt(0) === '!';
  const outerInLink = st.inLink, outerEmitted = st.linkEmitted, outerRaw = st.inRawBlock;
  st.inLink = true; st.linkEmitted = false;
  const labelHtml = inlineInner(text, refs, st);
  const textHasLink = st.linkEmitted;
  st.linkEmitted = outerEmitted; st.inLink = outerInLink;
  if (!isImage) {
    if (textHasLink) { st.inRawBlock = outerRaw; return null; }
    st.linkEmitted = true;
  }
  const titleAttr = titleClean ? ' title="' + escapeNoEncode(titleClean) + '"' : '';
  if (isImage) {
    const altRaw = labelHtml.replace(/<img\b[^>]*?\salt="([^"]*)"[^>]*>/g, '$1').replace(/<[^>]*>/g, '');
    const alt = escapeHtml(altRaw.replace(/&(amp|lt|gt|quot|#39);/g, m => ({ '&amp;': '&', '&lt;': '<', '&gt;': '>', '&quot;': '"', '&#39;': "'" }[m])));
    return { html: '<img src="' + hrefEsc + '" alt="' + alt + '"' + titleAttr + '>', len: raw.length };
  }
  return { html: '<a href="' + hrefEsc + '"' + titleAttr + '>' + labelHtml + '</a>', len: raw.length };
}

// Inline link/image at the start of src. Returns {html, len} or null.
function tryLinkAt(src, refs, st) {
  const cap = LINK_RE.exec(src);
  if (!cap) return null;
  const labelStart = cap[0].charAt(0) === '!' ? 2 : 1;
  if (labelTagExtends(src, labelStart - 1, labelStart + cap[1].length)) return null;
  const trimmedUrl = cap[2].trim();
  if (trimmedUrl.charAt(0) === '<') {
    if (trimmedUrl.charAt(trimmedUrl.length - 1) !== '>') return null;
    const rtrimmed = rtrimBackslash(trimmedUrl.slice(0, -1));
    if ((trimmedUrl.length - rtrimmed.length) % 2 === 0) return null;
  } else {
    const lastParenIndex = findClosingParen(cap[2]);
    if (lastParenIndex === -2) return null;
    if (lastParenIndex > -1) {
      const start = cap[0].indexOf('!') === 0 ? 5 : 4;
      const linkLen = start + cap[1].length + lastParenIndex;
      cap[2] = cap[2].substring(0, lastParenIndex);
      cap[0] = cap[0].substring(0, linkLen).trim();
      cap[3] = '';
    }
  }
  const unescaped = rtrimBackslash(cap[0].slice(0, -1));
  if ((cap[0].length - unescaped.length) % 2 === 0) return null;
  let href = cap[2].trim();
  const title = cap[3] ? cap[3].slice(1, -1) : '';
  if (href.charAt(0) === '<') href = href.slice(1, -1);
  return outputLinkHtml(cap, href, title, cap[0], refs, st);
}

// Reference / shortcut link at the start of src. Returns {html, len},
// {text1: true, html, len: 1} when the reference does not resolve, or null.
function tryReflinkAt(src, refs, st) {
  const cap = REFLINK_RE.exec(src) || NOLINK_RE.exec(src);
  if (!cap) return null;
  const labelStart = cap[0].charAt(0) === '!' ? 2 : 1;
  if (labelTagExtends(src, labelStart - 1, labelStart + cap[1].length)) return null;
  const link = refs.get(normalizeLabel(cap[2] || cap[1]));
  if (!link) {
    const ch = cap[0].charAt(0);
    return { text1: true, html: escapeNoEncode(ch), len: 1 };
  }
  return outputLinkHtml(cap, link.href, link.title || '', cap[0], refs, st);
}

// GFM extended autolink at the start of src. Returns {html, len} or null.
function urlAt(src) {
  const cap = INLINE_URL_RE.exec(src);
  if (!cap) return null;
  let text, href;
  if (cap[2] === '@') {
    text = cap[0];
    href = 'mailto:' + text;
  } else {
    let prev = cap[0], cur = cap[0];
    do {
      prev = cur;
      cur = INLINE_BACKPEDAL_RE.exec(cur)?.[0] ?? '';
    } while (prev !== cur);
    text = cur;
    href = cap[1] === 'www.' ? 'http://' + cur : cur;
  }
  const hrefEsc = escapeHrefFull(href);
  if (hrefEsc === null) return null;
  return { html: '<a href="' + hrefEsc + '">' + escapeHtml(text) + '</a>', len: text.length };
}

// The recursive inline renderer. `st` is document-wide lexer state.
function inlineInner(s, refs, st) {
  const N = s.length;
  let masked = s, lastCloser = null;
  if (s.includes('*') || s.includes('_') || s.includes('~')) {
    masked = maskSrc(s, refs);
    lastCloser = scanLastPossible(masked);
  }
  let out = '';
  let i = 0, prevChar = '', keepPrevChar = false;
  while (i < N) {
    if (!keepPrevChar) prevChar = '';
    keepPrevChar = false;
    const rest = s.slice(i);
    const restMasked = masked.slice(i);
    const ch = rest[0];
    let r;
    // escape
    if (ch === '\\' && (r = INLINE_ESCAPE_RE.exec(rest))) {
      out += ESC_MAP[r[1]] || r[1];
      i += r[0].length;
      continue;
    }
    // tag / autolink
    if (ch === '<') {
      const tag = matchHtmlTag(s, i);
      if (tag) {
        if (!st.inLink && /^<a /i.test(tag[0])) st.inLink = true;
        else if (st.inLink && /^<\/a>/i.test(tag[0])) st.inLink = false;
        if (!st.inRawBlock && /^<(pre|code|kbd|script)(\s|>)/i.test(tag[0])) st.inRawBlock = true;
        else if (st.inRawBlock && /^<\/(pre|code|kbd|script)(\s|>)/i.test(tag[0])) st.inRawBlock = false;
        out += tag[0];
        i = tag[1];
        continue;
      }
      if ((r = INLINE_AUTOLINK_RE.exec(rest))) {
        const text = r[1];
        const href = r[2] === '@' ? 'mailto:' + text : text;
        const hrefEsc = escapeHrefFull(href);
        if (hrefEsc !== null) {
          out += '<a href="' + hrefEsc + '">' + escapeHtml(text) + '</a>';
          i += r[0].length;
          continue;
        }
      }
    }
    // link / reflink
    if (ch === '[' || (ch === '!' && rest[1] === '[')) {
      if ((r = tryLinkAt(rest, refs, st))) { out += r.html; i += r.len; continue; }
      if ((r = tryReflinkAt(rest, refs, st))) { out += r.html; i += r.len; continue; }
    }
    // em & strong
    if (ch === '*' || ch === '_') {
      if ((r = emStrongAt(s, masked, i, prevChar, refs, st, lastCloser))) { out += r.html; i += r.len; continue; }
    }
    // code span
    if (ch === '`' && (r = INLINE_CODE_RE.exec(rest))) {
      let text = r[2].replace(/\n/g, ' ');
      if (/[^ ]/.test(text) && /^ /.test(text) && / $/.test(text)) text = text.substring(1, text.length - 1);
      out += '<code>' + escapeHtml(text) + '</code>';
      i += r[0].length;
      continue;
    }
    // hard break
    if ((ch === ' ' || ch === '\\') && (r = INLINE_BR_RE.exec(rest))) {
      out += '<br>';
      i += r[0].length;
      continue;
    }
    // del
    if (ch === '~') {
      if ((r = delAt(s, masked, i, prevChar, refs, st, lastCloser))) { out += r.html; i += r.len; continue; }
    }
    // GFM extended autolink (suppressed inside a link)
    if (!st.inLink && ((ch >= 'a' && ch <= 'z') || (ch >= 'A' && ch <= 'Z'))) {
      if ((r = urlAt(rest))) { out += r.html; i += r.len; continue; }
    }
    // text
    if ((r = INLINE_TEXT_RE.exec(rest))) {
      const raw = r[0];
      if (st.inRawBlock) {
        out += raw;
      } else {
        out += escapeNoEncode(decodeEntitiesIn(raw));
      }
      if (raw.slice(-1) !== '_') prevChar = raw.slice(-1);
      keepPrevChar = true;
      i += raw.length;
      continue;
    }
    // Unreachable in practice (the text regex always matches >= 1 char).
    out += escapeNoEncode(ch);
    i++;
  }
  return out;
}

// Block-level inline run: reset inRawBlock, as marked does before each
// queued inline run; inLink carries over between runs.
function inlineTop(s, refs, st) {
  st.inRawBlock = false;
  return inlineInner(s, refs, st);
}


// marked's Be(): the label contains a '<' starting an HTML tag or autolink
// that extends past the label's closing ']' -> the link is invalid.
function labelTagExtends(s, pos, close) {
  const label = s.slice(pos + 1, close);
  if (label.indexOf('<') < 0) return false;
  for (let k = 0; k < label.length; k++) {
    if (label[k] === '\\') { k++; continue; }
    if (label[k] === '`') {
      let n = 0; while (label[k + n] === '`') n++;
      const c = codeClose(label, k + n, n);
      if (c >= 0) { k = c + n - 1; continue; }
    }
    if (label[k] !== '<') continue;
    const r = s.slice(pos + 1 + k);
    const tag = matchHtmlTag(r, 0);
    if (tag) {
      if (tag[1] > label.length - k) return true;
      k += tag[1] - 1;
      continue;
    }
    const auto = matchAngleAutolink(r, 0);
    if (auto) {
      if (auto[2] > label.length - k) return true;
      k += auto[2] - 1;
    }
  }
  return false;
}

// True if s contains an unescaped '[' or ']'.
function hasUnescapedBracket(s) {
  for (let i = 0; i < s.length; i++) {
    if (s[i] === '[' || s[i] === ']') {
      let bs = 0;
      for (let j = i - 1; j >= 0 && s[j] === '\\'; j--) bs++;
      if (bs % 2 === 0) return true;
    }
  }
  return false;
}

function lineIndent(line) {
  let col = 0, idx = 0;
  while (idx < line.length) {
    const ch = line[idx];
    if (ch === ' ') { col++; idx++; }
    else if (ch === '\t') { col += 4 - (col % 4); idx++; }
    else break;
  }
  return { col, idx };
}
function isBlank(line) {
  for (let i = 0; i < line.length; i++) if (line[i] !== ' ' && line[i] !== '\t') return false;
  return true;
}
// Remove up to n columns of indentation; a tab straddling the boundary becomes spaces.
// Remove up to n columns of indentation; a tab straddling the boundary becomes spaces.
// marked's indentCodeCompensation: remove up to n leading whitespace
// CHARACTERS (not columns) from a fenced-code content line.
function stripFenceIndent(line, n) {
  const m = /^\s+/.exec(line);
  if (!m) return line;
  return line.slice(Math.min(m[0].length, n));
}
function stripIndent(line, n) {
  let col = 0, idx = 0;
  while (idx < line.length && col < n) {
    const ch = line[idx];
    if (ch === ' ') { col++; idx++; }
    else if (ch === '\t') {
      const next = col + 4 - (col % 4);
      if (next > n) return ' '.repeat(next - n) + line.slice(idx + 1);
      col = next; idx++;
    } else break;
  }
  return line.slice(idx);
}

// Return the part of the line starting at column `col`, expanding leading
// tabs relative to their column (a tab straddling `col` becomes spaces).
function sliceAtColumn(line, col) {
  let c = 0, i = 0, out = '';
  while (i < line.length && c < col) {
    const ch = line[i];
    if (ch === ' ') { c++; i++; }
    else if (ch === '\t') {
      const next = c + 4 - (c % 4);
      if (next > col) { out = ' '.repeat(next - col); c = next; i++; break; }
      c = next; i++;
    } else { c++; i++; }
  }
  // Expand any further leading whitespace from column c.
  while (i < line.length && (line[i] === ' ' || line[i] === '\t')) {
    if (line[i] === ' ') { out += ' '; c++; i++; }
    else { const next = c + 4 - (c % 4); out += ' '.repeat(next - c); c = next; i++; }
  }
  return out + line.slice(i);
}

// Expand the leading whitespace of a line into spaces. Tabs advance to the
// next multiple of 4 counting from baseCol (marked's J function).
function expandLeadingTabs(s, baseCol) {
  let i = 0;
  while (i < s.length && (s[i] === ' ' || s[i] === '\t')) i++;
  if (i === 0) return s;
  const ws = s.slice(0, i);
  let out = '', c = baseCol;
  for (const ch of ws) {
    if (ch === ' ') { out += ' '; c++; }
    else { const next = c + 4 - (c % 4); out += ' '.repeat(next - c); c = next; }
  }
  return out + s.slice(i);
}

const BLOCK_TAGS = new Set(('address article aside base basefont blockquote body caption center col colgroup dd details dialog dir div dl dt fieldset figcaption figure footer form frame frameset h1 h2 h3 h4 h5 h6 head header hr html iframe legend li link main menu nav noframes ol optgroup option p param section source summary table tbody td tfoot th thead title tr track ul').split(' '));

// Try to parse a link reference definition starting at lines[i].
// Returns {href, title, consumed} or null.
function parseDef(lines, i) {
  const joined = [];
  let upto = Math.min(lines.length, i + 8);
  for (let k = i; k < upto; k++) joined.push(lines[k]);
  const s = joined.join('\n');
  let p = 0;
  const ind = lineIndent(s);
  if (ind.col > 3) return null;
  p = ind.idx;
  if (s[p] !== '[') return null;
  const close = findClosingBracket(s, p);
  if (close < 0) return null;
  const label = s.slice(p + 1, close);
  if (label.length === 0 || label.length > 999) return null;
  if (hasUnescapedBracket(label)) return null;
  if (normalizeLabel(label) === '') return null;
  p = close + 1;
  if (s[p] !== ':') return null;
  p++;
  // skip spaces/tabs/newlines (at most one newline's worth of blank handling is fine)
  let nl = 0;
  while (p < s.length && (s[p] === ' ' || s[p] === '\t' || s[p] === '\n')) { if (s[p] === '\n') nl++; p++; }
  if (nl > 1) return null;
  // destination
  let dest = '';
  if (s[p] === '<') {
    let q = p + 1;
    while (q < s.length && s[q] !== '>' && s[q] !== '\n') {
      if (s[q] === '\\' && isPunct(s[q + 1])) { dest += s[q + 1]; q += 2; }
      else { dest += s[q]; q++; }
    }
    if (s[q] !== '>') return null;
    p = q + 1;
  } else {
    let depth = 0, q = p;
    while (q < s.length) {
      const ch = s[q];
      if (ch === ' ' || ch === '\t' || ch === '\n') break;
      if (ch === '\\' && isPunct(s[q + 1])) { dest += s[q + 1]; q += 2; continue; }
      if (ch === '(') { depth++; dest += ch; q++; continue; }
      if (ch === ')') { if (depth === 0) break; depth--; dest += ch; q++; continue; }
      dest += ch; q++;
    }
    if (q === p) return null; // empty destination
    p = q;
  }
  // Optional title: must be separated from the destination by whitespace.
  // It may be on the same line or the next line, and may span lines, but
  // must not contain a blank line.
  let title = null;
  let q = p;
  let sawWs = false;
  while (q < s.length && (s[q] === ' ' || s[q] === '\t')) { sawWs = true; q++; }
  const parseTitle = (start) => {
    const open = s[start], closeCh = open === '(' ? ')' : open;
    let r = start + 1, t = '', ok = false;
    while (r < s.length) {
      const ch = s[r];
      if (ch === '\n' && s[r + 1] === '\n') return null; // blank line in title
      if (ch === '\\' && isPunct(s[r + 1])) { t += s[r + 1]; r += 2; continue; }
      if (ch === closeCh) { ok = true; break; }
      if (open === '(' && ch === '(') return null;
      t += ch; r++;
    }
    if (!ok) return null;
    return { title: t, end: r + 1 };
  };
  if (sawWs && (s[q] === '"' || s[q] === "'" || s[q] === '(')) {
    const pt = parseTitle(q);
    if (!pt) return null;
    title = pt.title;
    q = pt.end;
  } else if (s[q] === '\n') {
    // Try the next line for a title; if it fails, the definition still
    // stands with no title (the next line is a separate paragraph).
    let q2 = q + 1;
    while (q2 < s.length && (s[q2] === ' ' || s[q2] === '\t')) q2++;
    if (s[q2] === '"' || s[q2] === "'" || s[q2] === '(') {
      const pt = parseTitle(q2);
      if (pt) {
        let r2 = pt.end;
        while (r2 < s.length && (s[r2] === ' ' || s[r2] === '\t')) r2++;
        if (r2 >= s.length || s[r2] === '\n') { title = pt.title; q = pt.end; }
      }
    }
  }
  // After the title/destination, only spaces/tabs then end of line.
  let r = q;
  while (r < s.length && (s[r] === ' ' || s[r] === '\t')) r++;
  if (r < s.length && s[r] !== '\n') return null;
  const consumed = s.slice(0, r).split('\n').length;
  return { label, href: dest, title, consumed };
}

function atxHeading(line) {
  const ind = lineIndent(line);
  if (ind.col > 3) return null;
  const s = line.slice(ind.idx);
  if (s[0] !== '#') return null;
  let n = 0; while (s[n] === '#') n++;
  if (n > 6) return null;
  if (s[n] !== undefined && s[n] !== ' ' && s[n] !== '\t') return null;
  let text = s.slice(n);
  text = text.replace(/^[ \t]+/, '').replace(/[ \t]+$/, '');
  if (/^#+$/.test(text)) text = '';
  else text = text.replace(/[ \t]+#+[ \t]*$/, '');
  return { level: n, text };
}

function fenceStart(line) {
  const ind = lineIndent(line);
  if (ind.col > 3) return null;
  const s = line.slice(ind.idx);
  const ch = s[0];
  if (ch !== '`' && ch !== '~') return null;
  let n = 0; while (s[n] === ch) n++;
  if (n < 3) return null;
  const info = s.slice(n);
  if (ch === '`' && info.indexOf('`') >= 0) return null;
  return { ch, n, info: info.trim(), indent: ind.col, wsLen: ind.idx };
}

function hrLine(line) {
  const ind = lineIndent(line);
  if (ind.col > 3) return false;
  const s = line.slice(ind.idx).replace(/[ \t]+$/, '');
  if (s.length < 3) return false;
  const ch = s[0];
  if (ch !== '-' && ch !== '*' && ch !== '_') return false;
  for (let i = 0; i < s.length; i++) {
    if (s[i] !== ch && s[i] !== ' ' && s[i] !== '\t') return false;
  }
  let count = 0;
  for (let i = 0; i < s.length; i++) if (s[i] === ch) count++;
  return count >= 3;
}

function setextLevel(line) {
  const ind = lineIndent(line);
  if (ind.col > 3) return 0;
  const s = line.slice(ind.idx).replace(/[ \t]+$/, '');
  if (s.length === 0) return 0;
  const ch = s[0];
  if (ch !== '=' && ch !== '-') return 0;
  for (let i = 0; i < s.length; i++) if (s[i] !== ch) return 0;
  return ch === '=' ? 1 : 2;
}

// HTML block start at a line. Returns {type, endTest} or null.
// endTest(line) => true when the block ends after this line (types 2-5), or 'blank' for types 1,6,7.
function htmlBlockStart(line) {
  const ind = lineIndent(line);
  if (ind.col > 3) return null;
  const s = line.slice(ind.idx);
  if (s[0] !== '<') return null;
  const lower = s.slice(0, 12).toLowerCase();
  const t1 = /^<(script|pre|style|textarea)([ \t>]|\/>|$)/.exec(lower);
  if (t1) return { end: 'endtag', tag: t1[1] };
  if (s.startsWith('<!--')) return { end: (l) => l.indexOf('-->') >= 0 };
  if (s.startsWith('<?')) return { end: (l) => l.indexOf('?>') >= 0 };
  if (/^<![A-Za-z]/.test(s)) return { end: (l) => l.indexOf('>') >= 0 };
  if (s.startsWith('<![CDATA[')) return { end: (l) => l.indexOf(']]>') >= 0 };
  const m = /^<\/?([A-Za-z][A-Za-z0-9-]*)/.exec(s);
  if (m) {
    const name = m[1].toLowerCase();
    const after = s[m[0].length];
    if (BLOCK_TAGS.has(name) && (after === undefined || after === ' ' || after === '\t' || after === '\n' || after === '>' || after === '/')) {
      return { end: 'blank' };
    }
    // Type 7: a complete open/close tag alone on the line.
    const tag = matchHtmlTag(s, 0);
    if (tag && /^[ \t]*$/.test(s.slice(tag[1]))) return { end: 'blank', type7: true };
  }
  return null;
}

function listMarker(line) {
  const ind = lineIndent(line);
  if (ind.col > 3) return null;
  const s = line.slice(ind.idx);
  const ch = s[0];
  if (ch === '-' || ch === '*' || ch === '+') {
    const nx = s[1];
    if (nx === undefined) return { ordered: false, bullet: ch, markerLen: 1, after: 0, indent: ind.col, start: 1, delim: '' };
    if (nx === ' ' || nx === '\t') {
      let sp = 0, j = 1;
      while (s[j] === ' ' || s[j] === '\t') { sp += s[j] === '\t' ? 4 - ((ind.col + 1 + sp) % 4) : 1; j++; }
      return { ordered: false, bullet: ch, markerLen: 1, after: sp, indent: ind.col, start: 1, delim: '' };
    }
    return null;
  }
  if (ch >= '0' && ch <= '9') {
    let j = 0;
    while (s[j] >= '0' && s[j] <= '9') j++;
    if (j > 9) return null;
    const delim = s[j];
    if (delim !== '.' && delim !== ')') return null;
    const num = parseInt(s.slice(0, j), 10);
    const nx = s[j + 1];
    if (nx === undefined) return { ordered: true, bullet: '', markerLen: j + 1, after: 0, indent: ind.col, start: num, delim };
    if (nx === ' ' || nx === '\t') {
      let sp = 0, k = j + 1;
      while (s[k] === ' ' || s[k] === '\t') { sp += s[k] === '\t' ? 4 - ((ind.col + j + 1 + sp) % 4) : 1; k++; }
      return { ordered: true, bullet: '', markerLen: j + 1, after: sp, indent: ind.col, start: num, delim };
    }
    return null;
  }
  return null;
}

// Split a table row line into cells (unescaped pipes outside code spans split).
function splitRow(line) {
  const s = line.trim();
  const cells = [];
  let cur = '', i = 0;
  while (i < s.length) {
    if (s[i] === '|') {
      let bs = 0;
      for (let j = i - 1; j >= 0 && s[j] === '\\'; j--) bs++;
      if (bs % 2 === 1) { cur += '|'; i++; continue; }
      cells.push(cur); cur = ''; i++; continue;
    }
    cur += s[i]; i++;
  }
  cells.push(cur);
  const out = cells.map(c => c.trim().replace(/\\\|/g, '|'));
  if (out.length > 0 && out[0] === '') out.shift();
  if (out.length > 0 && out[out.length - 1] === '') out.pop();
  return out;
}

function delimiterRow(line) {
  const cells = splitRow(line);
  if (cells.length === 0) return null;
  const aligns = [];
  for (const c of cells) {
    const t = c.trim();
    if (!/^:?-+:?$/.test(t)) return null;
    const left = t.startsWith(':'), right = t.endsWith(':');
    aligns.push(left && right ? 'center' : left ? 'left' : right ? 'right' : null);
  }
  return aligns;
}

// ---------------------------------------------------------------------------
// Block parser: lines -> blocks -> HTML
// ---------------------------------------------------------------------------

function interruptsParagraph(line, inList) {
  if (atxHeading(line)) return true;
  if (fenceStart(line)) return true;
  if (hrLine(line)) return true;
  if (/^ {0,3}>/.test(line)) return true;
  const m = listMarker(line);
  // Inside a list item, any ordered list interrupts a paragraph; elsewhere
  // an ordered list must start with 1.
  if (m && (!m.ordered || m.start === 1 || inList)) {
    const rest = line.slice(lineIndent(line).idx + m.markerLen);
    if (rest.trim() !== '') return true;
  }
  const hb = htmlBlockStart(line);
  if (hb && !hb.type7) return true;
  return false;
}
// `lazy` is a Set of line indices (into `lines`) that are lazy continuations
// of an enclosing blockquote/list paragraph: they are appended to paragraph
// text without setext conversion and without the interrupt check.
function parseBlocks(lines, refs, lazy, inList, isTop, st) {
  const blocks = [];
  const n = lines.length;
  let i = 0, loose = false, pendingBlank = false, seenBlock = false;
  const pushBlock = (b) => {
    if (pendingBlank && seenBlock) loose = true;
    seenBlock = true; pendingBlank = false;
    blocks.push(b);
  };
  while (i < n) {
    const line = lines[i];
    if (isBlank(line)) { pendingBlank = true; i++; continue; }
    const atx = atxHeading(line);
    if (atx) { pushBlock({ k: 'head', level: atx.level, text: atx.text }); i++; continue; }
    const f = fenceStart(line);
    if (f) {
      const content = [];
      let k = i + 1, closed = false;
      while (k < n) {
        const l = lines[k];
        const ind2 = lineIndent(l);
        if (ind2.col <= 3) {
          const s2 = l.slice(ind2.idx);
          if (s2[0] === f.ch) {
            let m2 = 0; while (s2[m2] === f.ch) m2++;
            if (m2 >= f.n && /^[ \t]*$/.test(s2.slice(m2))) { closed = true; k++; break; }
          }
        }
        content.push(f.ch === '`' && f.wsLen > 0 ? stripFenceIndent(l, f.wsLen) : l);
        k++;
      }
      if (content.length > 0 && content[content.length - 1] === '') content.pop();
      let text = content.join('\n');
      if (content.length > 0) text += '\n';
      // Fence info: the first word, with backslash escapes unescaped.
      let info = f.info.split(/[ \t]+/, 1)[0] || '';
      info = info.replace(/\\([!"#$%&'()*+,\-.\/:;<=>?@\[\\\]^_`{|}~])/g, '$1');
      pushBlock({ k: 'code', lang: info, text, fenced: true });
      i = k; continue;
    }
    const hb = htmlBlockStart(line);
    if (hb) {
      const hlines = [line];
      let k = i + 1, blankEnd = false;
      if (hb.end === 'endtag') {
        const endRe = new RegExp('</' + hb.tag + '\\s*>', 'i');
        if (!endRe.test(line)) {
          while (k < n) { hlines.push(lines[k]); if (endRe.test(lines[k])) { k++; break; } k++; }
        }
      } else if (typeof hb.end === 'function') {
        if (!hb.end(line)) {
          while (k < n) { hlines.push(lines[k]); if (hb.end(lines[k])) { k++; break; } k++; }
        }
      } else {
        blankEnd = true;
        while (k < n && !isBlank(lines[k])) { hlines.push(lines[k]); k++; }
      }
      // Trailing newline: for end-marker blocks (types 1-5) the newline after
      // the last line is included unless the next line is truly empty ('');
      // a whitespace-only line does not suppress it. For blank-ended blocks
      // (type 6) there is no trailing newline when the block ends at a blank
      // line (a trailing '' artifact from a final newline at EOF still counts).
      let text = hlines.join('\n');
      const endIdx = k;
      const nextIsEmpty = endIdx < n && lines[endIdx] === '';
      const nextIsBlank = endIdx < n && isBlank(lines[endIdx]);
      if ((endIdx < n && (blankEnd ? !nextIsBlank : !nextIsEmpty)) || (isTop && endIdx === n - 1 && lines[endIdx] === '')) text += '\n';
      pushBlock({ k: 'html', text });
      i = k; continue;
    }
    if (hrLine(line)) { pushBlock({ k: 'hr' }); i++; continue; }
    const qm = /^ {0,3}>/.exec(line);
    if (qm) {
      const sub = [];
      const subLazy = new Set();
      let k = i, inFence = null, prevIsPara = false;
      const innermost = (t) => {
        let s = t;
        for (let d = 0; d < 12; d++) {
          const q = /^ {0,3}>/.exec(s);
          if (!q) break;
          const ind = lineIndent(s).col;
          const after = s[ind + 1];
          s = sliceAtColumn(s, (after === ' ' || after === '\t') ? ind + 2 : ind + 1);
        }
        return s;
      };
      const isParaLine = (t) => {
        const inner = innermost(t);
        if (isBlank(inner) || lineIndent(inner).col >= 4 || inFence) return false;
        if (fenceStart(inner) || atxHeading(inner) || hrLine(inner) || htmlBlockStart(inner)) return false;
        const lm = listMarker(inner);
        if (lm) {
          const b = lm.indent + lm.markerLen;
          const g = expandLeadingTabs(inner.slice(lineIndent(inner).idx + lm.markerLen), b);
          return g.trim() !== '';
        }
        return true;
      };
      while (k < n) {
        const l = lines[k];
        const q2 = /^ {0,3}>/.exec(l);
        if (q2) {
          const ind = lineIndent(l).col;
          const after = l[ind + 1];
          const contentCol = (after === ' ' || after === '\t') ? ind + 2 : ind + 1;
          const rest = sliceAtColumn(l, contentCol);
          sub.push(rest);
          if (!inFence) {
            const fs = fenceStart(rest);
            if (fs) inFence = fs;
          } else if (fenceClose(rest, inFence)) {
            inFence = null;
          }
          prevIsPara = isParaLine(rest);
          k++;
          continue;
        }
        // A bare blank line (no '>') ends the blockquote.
        if (isBlank(l)) break;
        // Lazy line: previous sub-line is a paragraph line, not in a fence,
        // and this line does not interrupt a paragraph.
        if (!inFence && prevIsPara && !interruptsParagraph(l)) {
          subLazy.add(sub.length);
          if (setextLevel(l)) sub.push('    ' + l.replace(/^[ \t]+/, ''));
          else if (lineIndent(l).col >= 4) sub.push(stripIndent(l, 4));
          else sub.push(l);
          k++;
          continue;
        }
        break;
      }
      pushBlock({ k: 'quote', inner: parseBlocks(sub, refs, subLazy, false, false, st).blocks });
      i = k; continue;
    }
    const lm = listMarker(line);
    if (lm) {
      const r = parseList(lines, i, refs, st);
      pushBlock({ k: 'list', items: r.items, ordered: r.ordered, start: r.start, loose: r.loose });
      i = r.next; continue;
    }
    const ind = lineIndent(line);
    if (ind.col >= 4) {
      const content = [];
      let k = i;
      while (k < n) {
        const l = lines[k];
        if (isBlank(l)) {
          let m = k + 1;
          while (m < n && isBlank(lines[m])) m++;
          if (m < n && lineIndent(lines[m]).col >= 4) { content.push(stripIndent(l, 4)); k++; continue; }
          break;
        }
        if (lineIndent(l).col >= 4) { content.push(stripIndent(l, 4)); k++; continue; }
        break;
      }
      while (content.length > 0 && isBlank(content[content.length - 1])) content.pop();
      let text = content.join('\n');
      if (content.length > 0) text += '\n';
      pushBlock({ k: 'code', lang: null, text, fenced: false });
      i = k; continue;
    }
    // Link reference definitions at the start of a paragraph.
    let j = i, anyDef = false;
    for (;;) {
      const d = parseDef(lines, j);
      if (!d) break;
      const key = normalizeLabel(d.label);
      if (!refs.has(key)) refs.set(key, { href: d.href, title: d.title });
      j += d.consumed;
      anyDef = true;
    }
    if (anyDef) {
      if (pendingBlank && seenBlock) loose = true;
      i = j;
      continue;
    }
    // Paragraph (maybe setext heading, maybe table).
    const plines = [line];
    let pi = i + 1, headingLevel = 0;
    while (pi < n) {
      const l = lines[pi];
      if (isBlank(l)) {
        // A whitespace-only line at the very end is part of the paragraph.
        if (pi === n - 1 && l.length > 0) { plines.push(l); pi++; }
        break;
      }
      if (lazy && lazy.has(pi)) {
        plines.push(inList && lineIndent(l).col >= 4 ? stripIndent(l, 4) : l);
        pi++; continue;
      }
      const sl = setextLevel(l);
      if (sl) { headingLevel = sl; pi++; break; }
      if (interruptsParagraph(l, inList)) break;
      plines.push(inList && lineIndent(l).col >= 4 ? stripIndent(l, 4) : l);
      pi++;
    }
    // A table is detected from the header + delimiter rows; once detected,
    // rows continue past tab-only lines (marked's table regex only treats a
    // spaces-only line as blank) and past setext-looking lines, until a
    // truly blank line or an interrupting block.
    if (plines.length >= 2 && lineIndent(plines[1]).col <= 3) {
      const aligns = delimiterRow(plines[1]);
      if (aligns) {
        const head = splitRow(plines[0]);
        if (head.length === aligns.length) {
          const rows = [];
          for (let r = 2; r < plines.length; r++) {
            const cells = splitRow(plines[r]);
            while (cells.length < head.length) cells.push('');
            rows.push(cells.slice(0, head.length));
          }
          let ri = pi;
          while (ri < n) {
            const l = lines[ri];
            if (l === '' || /^[ ]*$/.test(l)) break;
            if (interruptsParagraph(l, inList)) break;
            const row = (lazy && lazy.has(ri)) ? l : (inList && lineIndent(l).col >= 4 ? stripIndent(l, 4) : l);
            const cells = splitRow(row);
            while (cells.length < head.length) cells.push('');
            rows.push(cells.slice(0, head.length));
            ri++;
          }
          pushBlock({ k: 'table', aligns, head, rows });
          i = ri; continue;
        }
      }
    }
    if (headingLevel) {
      pushBlock({ k: 'head', level: headingLevel, text: plines.join('\n').trim() });
      i = pi; continue;
    }
    pushBlock({ k: 'para', text: plines.join('\n') });
    i = pi;
  }
  return { blocks, loose };
}

// Find the next run of exactly n backticks at or after `start` (code span close).
function codeClose(s, start, n) {
  const N = s.length;
  let p = start;
  while (p < N) {
    if (s[p] === '`') {
      let r = 0; while (s[p + r] === '`') r++;
      if (r === n) return p;
      p += r;
    } else p++;
  }
  return -1;
}

// Does this line close a fence started by `f`?
function fenceClose(line, f) {
  const ind = lineIndent(line);
  if (ind.col > 3) return false;
  const s = line.slice(ind.idx);
  if (s[0] !== f.ch) return false;
  let m = 0;
  while (s[m] === f.ch) m++;
  return m >= f.n && /^[ \t]*$/.test(s.slice(m));
}

function collectItem(lines, j, m, refs) {
  // marked's algorithm: b = indent + markerLen; g = text after the marker;
  // m2 = expandLeadingTabs(g, b); R = first non-space index (capped: >4 -> 1);
  // firstContent = m2.slice(R); contentIndent = R + b.
  const b = m.indent + m.markerLen;
  const g = lines[j].slice(lineIndent(lines[j]).idx + m.markerLen);
  const m2 = expandLeadingTabs(g, b);
  let R, firstContent, contentIndent;
  if (m2.trim() === '') {
    R = 1; firstContent = ''; contentIndent = b + 1;
  } else {
    R = m2.search(/\S/);
    if (R > 4) R = 1;
    firstContent = m2.slice(R);
    contentIndent = R + b;
  }
  const sub = [firstContent];
  const subIdx = [j];
  const lazy = new Set();
  // An empty item followed by a blank line ends immediately (no content).
  if (firstContent === '' && j + 1 < lines.length && isBlank(lines[j + 1])) {
    return { sub, next: j + 1, loose: false, blankBeforeNext: false, lazy, trailingBlankAt: j + 1 };
  }
  let k = j + 1, sawBlank = false, hadContentAfterBlank = false;
  // Previous line, dedented by the item's content indent (marked's `line`):
  // an under-indented line after a fence begin / heading / HTML block / HR /
  // indented code block ends the item instead of lazily continuing it.
  let prevDedented = firstContent;
  while (k < lines.length) {
    const l = lines[k];
    if (isBlank(l)) { sub.push(''); subIdx.push(k); sawBlank = true; prevDedented = ''; k++; continue; }
    const Z = expandLeadingTabs(l, 0);
    const zInd = Z.search(/\S/);
    if (zInd >= contentIndent) {
      const dedented = Z.slice(contentIndent);
      sub.push(dedented); subIdx.push(k);
      prevDedented = dedented;
      if (sawBlank) hadContentAfterBlank = true;
      sawBlank = false; k++; continue;
    }
    const lm2 = listMarker(l);
    if (lm2) {
      // A marker line with indent < contentIndent ends the item (sibling);
      // with indent >= contentIndent it is nested content.
      if (lm2.indent < contentIndent) break;
      sub.push(Z.slice(contentIndent)); subIdx.push(k);
      if (sawBlank) hadContentAfterBlank = true;
      sawBlank = false; k++; continue;
    }
    // Lines that end the item rather than continuing it lazily.
    if (fenceStart(l) || atxHeading(l) || hrLine(l) || /^ {0,3}>/.test(l)) break;
    const hb2 = htmlBlockStart(l);
    if (hb2 && !hb2.type7) break;
    // Lazy continuation: previous sub-line is a paragraph line.
    if (sub.length > 0 && !isBlank(sub[sub.length - 1]) && !interruptsParagraph(l, true)) {
      const cap = Math.max(0, Math.min(3, contentIndent - 1));
      const prev = prevDedented;
      const prevIndentedCode = prev.replace(/\t/g, '    ').search(/\S/) >= 4;
      const fenceBeginRe = new RegExp('^ {0,' + cap + '}(?:```|~~~)');
      const headingBeginRe = new RegExp('^ {0,' + cap + '}#{1,6}(?:\\s|$)');
      const hrBeginRe = new RegExp('^ {0,' + cap + '}((?:-[ \\t]*){3,}|(?:_[ \\t]*){3,}|(?:\\*[ \\t]*){3,})(?:\\n+|$)');
      const hbPrev = htmlBlockStart(prev);
      if (prevIndentedCode || fenceBeginRe.test(prev) || headingBeginRe.test(prev) || hrBeginRe.test(prev) || (hbPrev && !hbPrev.type7)) break;
      lazy.add(sub.length);
      sub.push(l); subIdx.push(k);
      prevDedented = Z.slice(contentIndent);
      if (sawBlank) hadContentAfterBlank = true;
      sawBlank = false; k++; continue;
    }
    break;
  }
  let trailingBlanks = 0;
  while (sub.length > 0 && isBlank(sub[sub.length - 1])) { sub.pop(); trailingBlanks++; }
  const trailingBlankAt = trailingBlanks > 0 ? subIdx[subIdx.length - trailingBlanks] : -1;
  return { sub, next: k, loose: hadContentAfterBlank, blankBeforeNext: trailingBlanks > 0 && sub.length > 0, lazy, trailingBlankAt };
}

function parseList(lines, start, refs, st) {
  const first = listMarker(lines[start]);
  const ordered = first.ordered;
  const items = [];
  let j = start, loose = false;
  const sameMarker = (l) => {
    const m2 = listMarker(l);
    return m2 && m2.indent <= 3 && m2.ordered === ordered && (ordered ? m2.delim === first.delim : m2.bullet === first.bullet);
  };
  while (j < lines.length) {
    if (hrLine(lines[j])) break;
    const m = listMarker(lines[j]);
    if (!m || m.indent > 3 || m.ordered !== ordered || (ordered ? m.delim !== first.delim : m.bullet !== first.bullet)) break;
    const item = collectItem(lines, j, m, refs);
    items.push(item);
    j = item.next;
    // Blank line(s) between items (trailing blanks of this item) make it loose.
    if (item.blankBeforeNext && j < lines.length && sameMarker(lines[j])) loose = true;
    // Skip blank lines; the list continues if the next non-blank line is a
    // same-type marker (and the blank gap makes it loose).
    let k2 = j;
    while (k2 < lines.length && isBlank(lines[k2])) k2++;
    if (k2 < lines.length && sameMarker(lines[k2])) {
      if (k2 > j) loose = true;
      j = k2;
      continue;
    }
    j = k2;
    break;
  }
  // Pre-pass: parse each item's blocks; an item whose blocks are separated
  // by a blank line makes the list loose.
  const parsed = [];
  for (const item of items) {
    const sub = item.sub;
    let check = '';
    if (sub.length > 0) {
      const cm = /^\[([ xX])\](?:[ \t]+|$)/.exec(sub[0]);
      if (cm) {
        check = cm[1] === ' ' ? '<input disabled="" type="checkbox"> ' : '<input checked="" disabled="" type="checkbox"> ';
        sub[0] = sub[0].slice(cm[0].length);
      }
    }
    const pb = parseBlocks(sub, refs, item.lazy, true, false, st);
    if (pb.loose) loose = true;
    parsed.push({ blocks: pb.blocks, check });
  }
  // Rewind to the first trailing blank of the last item so the caller sees
  // the blank line separating this list from what follows.
  const last = items[items.length - 1];
  if (last && last.trailingBlankAt >= 0 && last.trailingBlankAt < j) j = last.trailingBlankAt;
  // Items are rendered later, in document order, so inline lexer state
  // (e.g. an unclosed <a>) carries across blocks the way marked's does.
  return { items: parsed, ordered, start: first.start, loose, next: j };
}
function renderList(b, refs, st) {
  let html = b.ordered
    ? '<ol' + (b.start !== 1 ? ' start="' + b.start + '"' : '') + '>\n'
    : '<ul>\n';
  for (const { blocks, check: check0 } of b.items) {
    let check = check0;
    let inner = renderBlocks(blocks, refs, !b.loose, st);
    // Loose list: the checkbox goes inside the first <p>.
    if (b.loose && check) {
      if (inner.startsWith('<p>')) inner = '<p>' + check + inner.slice(3);
      else inner = check + inner;
      check = '';
    }
    html += '<li>' + check + inner + '</li>\n';
  }
  html += b.ordered ? '</ol>\n' : '</ul>\n';
  return html;
}

function renderTable(b, refs, st) {
  let out = '<table>\n<thead>\n<tr>\n';
  for (let c = 0; c < b.head.length; c++) {
    const a = b.aligns[c];
    out += '<th' + (a ? ' align="' + a + '"' : '') + '>' + inlineTop(b.head[c], refs, st) + '</th>\n';
  }
  out += '</tr>\n</thead>\n';
  if (b.rows.length > 0) {
    out += '<tbody>';
    for (let r = 0; r < b.rows.length; r++) {
      out += '<tr>\n';
      for (let c = 0; c < b.head.length; c++) {
        const a = b.aligns[c];
        out += '<td' + (a ? ' align="' + a + '"' : '') + '>' + inlineTop(b.rows[r][c], refs, st) + '</td>\n';
      }
      out += '</tr>\n';
    }
    out += '</tbody></table>\n';
  } else {
    out += '</table>\n';
  }
  return out;
}

function renderBlocks(blocks, refs, tight, st) {
  let out = '';
  for (const b of blocks) {
    switch (b.k) {
      case 'para':
        out += tight ? inlineTop(b.text, refs, st) : '<p>' + inlineTop(b.text, refs, st) + '</p>\n';
        break;
      case 'head':
        out += '<h' + b.level + '>' + inlineTop(b.text, refs, st) + '</h' + b.level + '>\n';
        break;
      case 'code': {
        const lang = b.lang ? ' class="language-' + escapeNoEncode(b.lang) + '"' : '';
        out += '<pre><code' + lang + '>' + escapeHtml(b.text) + '</code></pre>\n';
        break;
      }
      case 'hr':
        out += '<hr>\n';
        break;
      case 'quote':
        out += '<blockquote>\n' + renderBlocks(b.inner, refs, false, st) + '</blockquote>\n';
        break;
      case 'list':
        out += renderList(b, refs, st);
        break;
      case 'html':
        out += b.text;
        break;
      case 'table':
        out += renderTable(b, refs, st);
        break;
    }
  }
  return out;
}

export function parse(markdown) {
  const src = String(markdown).replace(/\r\n?/g, '\n');
  const refs = new Map();
  const lines = src.split('\n');
  const st = { inLink: false, inRawBlock: false, linkEmitted: false };
  return renderBlocks(parseBlocks(lines, refs, null, false, true, st).blocks, refs, false, st);
}
