"""Turn REPORT.md into a self-contained REPORT.html (stand-in for `msw report`). Tables stack as cards below 640 px.

Usage: python3 md2html.py REPORT.md REPORT.html
Handles only what the report uses: headings, paragraphs, lists (images inside items),
tables, fenced code, inline code, bold, italics. Screenshots are embedded as JPEG, 720 px wide.
"""
import base64, html, io, os, re, sys
from PIL import Image

src, out = sys.argv[1], sys.argv[2]
base = os.path.dirname(os.path.abspath(src))
lines = open(src, encoding='utf-8').read().split('\n')
IMG = re.compile(r'!\[([^\]]*)\]\(([^)]+)\)')


def embed(alt, path):
    im = Image.open(os.path.join(base, path)).convert('RGB')
    if im.width > 720:
        im = im.resize((720, round(im.height * 720 / im.width)), Image.LANCZOS)
    buf = io.BytesIO(); im.save(buf, 'JPEG', quality=72, optimize=True)
    data = base64.b64encode(buf.getvalue()).decode()
    return (f'<figure><img loading="lazy" alt="{html.escape(alt)}" src="data:image/jpeg;base64,{data}">'
            f'<figcaption>{inl(alt)} <code>{html.escape(path)}</code></figcaption></figure>')


def inl(s):
    figs = [embed(m.group(1), m.group(2)) for m in IMG.finditer(s)]
    s = IMG.sub('', s).rstrip()
    s = html.escape(s, quote=False)
    s = re.sub(r'`([^`]+)`', r'<code>\1</code>', s)
    s = re.sub(r'\*\*([^*]+)\*\*', r'<strong>\1</strong>', s)
    s = re.sub(r'(?<![\w*])\*([^*]+)\*(?![\w*])', r'<em>\1</em>', s)
    return s + ''.join(figs)


o = []; i = 0
while i < len(lines):
    l = lines[i]
    if not l.strip(): i += 1; continue
    if l.startswith('```'):
        j = i + 1
        while not lines[j].startswith('```'): j += 1
        o.append('<pre><code>' + html.escape('\n'.join(lines[i + 1:j])) + '</code></pre>'); i = j + 1; continue
    if l.startswith('#'):
        n = len(l) - len(l.lstrip('#')); o.append(f'<h{n}>{inl(l[n:].strip())}</h{n}>'); i += 1; continue
    if l.startswith('|'):
        rows = []
        while i < len(lines) and lines[i].startswith('|'): rows.append(lines[i]); i += 1
        cells = lambda r: [c.strip() for c in r.strip().strip('|').split('|')]
        t = ['<div class="tw"><table><thead><tr>' + ''.join(f'<th>{inl(c)}</th>' for c in cells(rows[0])) + '</tr></thead><tbody>']
        heads = [re.sub(r'[*`]', '', c) for c in cells(rows[0])]
        for r in rows[2:]: t.append('<tr>' + ''.join(f'<td data-label="{html.escape(h)}">{inl(c)}</td>' for h, c in zip(heads, cells(r))) + '</tr>')
        o.append(''.join(t) + '</tbody></table></div>'); continue
    m = re.match(r'(- |\d+\. )', l)
    if m:
        tag = 'ol' if m.group(1)[0].isdigit() else 'ul'; items = []
        while i < len(lines) and (re.match(r'(- |\d+\. )', lines[i]) or (lines[i].startswith('  ') and lines[i].strip())):
            if re.match(r'(- |\d+\. )', lines[i]): items.append(re.sub(r'^(- |\d+\. )', '', lines[i]))
            else: items[-1] += '\n' + lines[i].strip()
            i += 1
            # a blank line followed by another item keeps the list going
            if i + 1 < len(lines) and not lines[i].strip() and re.match(r'(- |\d+\. )', lines[i + 1]): i += 1
        o.append(f'<{tag}>' + ''.join('<li>' + ' '.join(inl(p) for p in x.split('\n')) + '</li>' for x in items) + f'</{tag}>'); continue
    para = []
    while i < len(lines) and lines[i].strip() and not lines[i].startswith(('#', '|', '- ', '```')): para.append(lines[i]); i += 1
    o.append('<p>' + inl(' '.join(para)) + '</p>')

css = """:root{color-scheme:light dark;--bg:#fff;--fg:#1b1b1b;--mut:#f2f2f2;--line:#d0d0d0}
@media (prefers-color-scheme:dark){:root{--bg:#141414;--fg:#e8e8e8;--mut:#222;--line:#444}}
*{box-sizing:border-box}body{margin:0;background:var(--bg);color:var(--fg);font:16px/1.55 system-ui,-apple-system,Segoe UI,Roboto,sans-serif}
main{max-width:52rem;margin:0 auto;padding:1rem}h1{font-size:1.5rem;line-height:1.25}h2{font-size:1.2rem;margin-top:2rem}h3{font-size:1.05rem}
code{background:var(--mut);padding:0 .25em;border-radius:3px;font-size:.9em;overflow-wrap:anywhere}
pre{background:var(--mut);padding:.6rem;overflow-x:auto;font-size:.8rem}pre code{background:none;padding:0;overflow-wrap:normal}
.tw{overflow-x:auto}table{border-collapse:collapse;width:100%;font-size:.9rem}th,td{border:1px solid var(--line);padding:.4rem;text-align:left;vertical-align:top}
th{background:var(--mut)}img{display:block;max-width:100%;height:auto;border:1px solid var(--line)}figure{margin:.6rem 0}figcaption{font-size:.8rem}
ol,ul{padding-left:1.3rem}li{margin:.6rem 0}
@media (max-width:640px){table,tbody,tr,td{display:block;width:100%}thead{display:none}tr{border:1px solid var(--line);margin:.6rem 0;padding:.3rem}
td{border:none;padding:.2rem .3rem}td:empty{display:none}td::before{content:attr(data-label);display:block;font-weight:600;font-size:.8rem}}"""
title = re.sub(r'^#+\s*', '', lines[0])
open(out, 'w', encoding='utf-8').write(
    f'<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">'
    f'<title>{html.escape(title)}</title><style>{css}</style></head><body><main>' + '\n'.join(o) + '</main></body></html>\n')
