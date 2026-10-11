// Redirects every other hostname (www, workers.dev) to mediamax.ch, otherwise serves the static site
const CANONICAL_HOST = "mediamax.ch";

export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    if (url.hostname !== CANONICAL_HOST) {
      url.hostname = CANONICAL_HOST;
      return Response.redirect(url.toString(), 301);
    }
    return env.ASSETS.fetch(request);
  },
};
