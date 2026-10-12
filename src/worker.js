// Redirects every other hostname (www, workers.dev) to mediamax.ch, otherwise serves the static site
const CANONICAL_HOST = "mediamax.ch";

export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    if (url.hostname !== CANONICAL_HOST) {
      url.hostname = CANONICAL_HOST;
      return Response.redirect(url.toString(), 301);
    }
    const response = await env.ASSETS.fetch(request);
    const range = request.headers.get("Range");
    if (range && response.status === 200 && url.pathname.startsWith("/media/")) {
      return rangeResponse(response, range);
    }
    return response;
  },
};

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
