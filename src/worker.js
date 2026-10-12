// Redirects every other hostname (www, workers.dev) to mediamax.ch, otherwise serves the static site
const CANONICAL_HOST = "mediamax.ch";

export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    if (url.hostname !== CANONICAL_HOST) {
      url.hostname = CANONICAL_HOST;
      return Response.redirect(url.toString(), 301);
    }
    // The bare domain picks a language version: /fr/, /en/, /de/ or /it/
    if (url.pathname === "/" || url.pathname === "/index.html") {
      const lang = pickLanguage(request);
      return new Response(null, {
        status: 302,
        headers: { Location: `/${lang}/${url.search}`, Vary: "Accept-Language, Cookie", "Cache-Control": "no-store" },
      });
    }
    const response = await env.ASSETS.fetch(request);
    const range = request.headers.get("Range");
    if (range && response.status === 200 && url.pathname.startsWith("/media/")) {
      return rangeResponse(response, range);
    }
    return response;
  },
};

const LANGS = ["fr", "en", "de", "it"];
// Countries whose visitors read French, German or Italian when their browser asks for none of our languages
const COUNTRY_LANG = { FR: "fr", BE: "fr", LU: "fr", MC: "fr", CH: "fr", DE: "de", AT: "de", LI: "de", IT: "it", SM: "it", VA: "it" };

// 1. the visitor's own choice (cookie set by the language switch)
// 2. the browser's preferred languages, in order of preference
// 3. the visitor's country (Cloudflare geolocation)
// 4. English
function pickLanguage(request) {
  const saved = /(?:^|;\s*)lang=(fr|en|de|it)\b/.exec(request.headers.get("Cookie") || "");
  if (saved) return saved[1];
  const accepted = (request.headers.get("Accept-Language") || "")
    .split(",")
    .map(part => {
      const [tag, ...params] = part.trim().split(";");
      const q = params.map(p => p.trim()).find(p => p.startsWith("q="));
      const base = tag.slice(0, 2).toLowerCase();
      // Swiss German (gsw) and Romansh (rm) readers get the German version
      return { base: { gs: "de", rm: "de" }[base] || base, q: q ? parseFloat(q.slice(2)) || 0 : 1 };
    })
    .filter(l => l.q > 0)
    .sort((a, b) => b.q - a.q);
  const match = accepted.find(l => LANGS.includes(l.base));
  if (match) return match.base;
  return COUNTRY_LANG[request.cf?.country] || "en";
}

// Safari only plays <video> when the server answers byte-range requests with 206 Partial Content;
// the assets binding returns the whole file, so slice it here (media files are small).
async function rangeResponse(response, range) {
  const body = await response.arrayBuffer();
  const size = body.byteLength;
  const match = /^bytes=(\d*)-(\d*)$/.exec(range.trim());
  let start, end;
  if (match && match[1] !== "") {
    start = Number(match[1]);
    end = match[2] !== "" ? Math.min(Number(match[2]), size - 1) : size - 1;
  } else if (match && match[2] !== "") {
    start = Math.max(size - Number(match[2]), 0); // suffix range: last N bytes
    end = size - 1;
  }
  const headers = new Headers(response.headers);
  headers.set("Accept-Ranges", "bytes");
  if (start === undefined || start > end || start >= size) {
    headers.set("Content-Range", `bytes */${size}`);
    headers.delete("Content-Length");
    return new Response(null, { status: 416, headers });
  }
  headers.set("Content-Range", `bytes ${start}-${end}/${size}`);
  headers.set("Content-Length", String(end - start + 1));
  return new Response(body.slice(start, end + 1), { status: 206, headers });
}
