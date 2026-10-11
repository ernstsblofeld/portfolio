// Redirects www.mediamax.ch to mediamax.ch, otherwise serves the static site
export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    if (url.hostname === "www.mediamax.ch") {
      url.hostname = "mediamax.ch";
      return Response.redirect(url.toString(), 301);
    }
    return env.ASSETS.fetch(request);
  },
};
