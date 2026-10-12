"""Build the three language versions of the site.

    python3 tools/build_i18n.py

Reads i18n/page.html (the single template) and i18n/strings.json (FR / EN / DE copy)
and writes fr/index.html, en/index.html, de/index.html, plus the root index.html,
which only redirects (the Cloudflare worker normally answers "/" before it is served).
Bump CSS_V / JS_V when style.css / main.js change, so browsers drop their cached copy.
"""
import json
import pathlib
import re

CSS_V = "17"
JS_V = "15"
LANGS = ["fr", "en", "de"]

root = pathlib.Path(__file__).resolve().parent.parent
template = (root / "i18n" / "page.html").read_text(encoding="utf-8")
strings = json.loads((root / "i18n" / "strings.json").read_text(encoding="utf-8"))

for lang in LANGS:
    values = dict(strings[lang], lang=lang, css_v=CSS_V, js_v=JS_V)
    for other in LANGS:
        values[f"cur_{other}"] = ' aria-current="page"' if other == lang else ""
        values[f"sel_{other}"] = " selected" if other == lang else ""
    page = re.sub(r"\{\{(\w+)\}\}", lambda m: values[m.group(1)], template)
    out = root / lang / "index.html"
    out.parent.mkdir(exist_ok=True)
    out.write_text(page, encoding="utf-8")
    print("wrote", out.relative_to(root))

# Root: fallback redirect for local previews (production redirects in src/worker.js)
(root / "index.html").write_text("""<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>Mediamax Productions</title>
  <link rel="icon" href="/favicon.svg" type="image/svg+xml">
  <link rel="alternate" hreflang="fr" href="https://mediamax.ch/fr/">
  <link rel="alternate" hreflang="en" href="https://mediamax.ch/en/">
  <link rel="alternate" hreflang="de" href="https://mediamax.ch/de/">
  <link rel="alternate" hreflang="x-default" href="https://mediamax.ch/">
  <meta name="theme-color" content="#0c0c0d">
  <style>body{background:#0c0c0d;color:#f2efe9;font:16px system-ui,sans-serif;display:grid;place-items:center;min-height:100vh;margin:0}a{color:inherit;margin:0 .5em}</style>
  <script>
    // Same rule as the worker: saved choice, then browser languages, else English
    (function () {
      var langs = ["fr", "en", "de"];
      var saved = (document.cookie.match(/(?:^|; )lang=(fr|en|de)/) || [])[1];
      var pick = saved || (navigator.languages || [navigator.language || ""])
        .map(function (l) { return l.slice(0, 2).toLowerCase(); })
        .filter(function (l) { return langs.indexOf(l) >= 0; })[0] || "en";
      location.replace("/" + pick + "/" + location.hash);
    })();
  </script>
</head>
<body>
  <p><a href="/fr/" lang="fr">Français</a> <a href="/en/" lang="en">English</a> <a href="/de/" lang="de">Deutsch</a></p>
</body>
</html>
""", encoding="utf-8")
print("wrote index.html (redirect)")
