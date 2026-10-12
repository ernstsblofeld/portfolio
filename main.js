// Work shown on the page (gear tests and tutorials live on the YouTube channel instead).
// Order of the first five is the owner's pick. lead: wide first card; featured: two-up after it.
// cat: one category or several (Hybris is both a film and VFX work)
// hd: best YouTube thumbnail that exists for this video (Hybris has no maxres)
// pillar: vertical video letterboxed inside a 16:9 thumbnail; crop: zoom that hides a black frame burnt into the thumbnail
const videos = [
  { id: "siSyglaPrvA", title: "Hybris 4K (musique de Moby)", year: 2016, cat: ["film", "vfx"], channel: "Olivier G. Burri", lead: true, hd: "sddefault" },
  { id: "LJefRF0cIwg", title: "Silence, version remasterisée", year: 2025, cat: "film", channel: "Mediamax", featured: true, crop: 1.07 },
  { id: "c9H8vKGcMl8", title: "Impromptu", year: 2016, cat: "film", channel: "Olivier G. Burri", featured: true },
  { id: "iWc9tmUiN9c", title: "Regrub Burger", year: 2015, cat: "film", channel: "Olivier G. Burri", featured: true },
  { id: "4IVdDhjkAe8", title: "Mister Phil (Nikon Film Festival 2014)", year: 2014, cat: "film", channel: "Olivier G. Burri", featured: true },
  { id: "nmOSfHQw7yU", title: "Une GoPro lancée dans l'espace retombe sur Terre", year: 2014, cat: "vfx", channel: "Mediamax" }, // 77 000+ vues, la plus vue des deux chaînes
  { id: "Q-HdE8g_xGc", title: "Le caméléon et la Submariner", year: 2026, cat: "vfx", channel: "Mediamax", pillar: true, vertical: true },
  { id: "oFLwiEZMrdY", title: "Le chat et le robot aspirateur", year: 2026, cat: "vfx", channel: "Mediamax" },
  { id: "5GodAChg-ls", title: "Une GoPro lancée dans l'espace retombe sur Terre, édition anniversaire", year: 2026, cat: "vfx", channel: "Mediamax" },
  { id: "vSsUWqNi9S8", title: "Silence II, teaser", year: 2026, cat: "film", channel: "Mediamax" },
  { id: "V8UISiZhLe8", title: "Fichtl's Lied, remake 4K", year: 2016, cat: "film", channel: "Olivier G. Burri" },
];

const labels = { film: "Film", vfx: "VFX" };
const cats = v => [].concat(v.cat);
const playIcon = '<svg class="icon" viewBox="0 0 24 24" aria-hidden="true"><path d="M8 5.5v13l10.5-6.5z"/></svg>';
const small = matchMedia("(max-width: 760px)");
const initialCount = () => (small.matches ? 6 : 8); // cards shown under "Tout" before "voir plus": the five picks + the GoPro on phones, + one full 3-up row on desktop

const escapeHtml = s => s.replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
// French typography: no-break space before : ? ! » and after «
const frType = s => s.replace(/ ([:?!»])/g, "\u00a0$1").replace(/« /g, "«\u00a0");
const thumbSrcset = v => {
  const base = `https://i.ytimg.com/vi/${v.id}/`;
  // mq is true 16:9; sd/maxres are letterboxed or 16:9, object-fit: cover crops either way.
  // sd is declared 760w (it is 640) so 2x phones (~680 px needed) take it instead of the 1280 px maxres
  return `${base}mqdefault.jpg 320w, ${base}sddefault.jpg 760w` + (v.hd === "sddefault" ? "" : `, ${base}maxresdefault.jpg 1280w`);
};

const grid = document.getElementById("grid");
grid.innerHTML = videos.map(v => {
  const t = frType(escapeHtml(v.title));
  const kind = v.lead ? " lead" : v.featured ? " featured" : "";
  const sizes = v.lead ? "(max-width: 760px) 100vw, 800px" : v.featured ? "(max-width: 760px) 100vw, (max-width: 1000px) 50vw, 600px" : "(max-width: 760px) 100vw, (max-width: 1000px) 50vw, 400px";
  return `
  <article class="card${kind}" data-cat="${cats(v).join(" ")}">
    <div class="thumb${v.pillar ? " pillar" : ""}"${v.pillar ? ` style="--fill:url(https://i.ytimg.com/vi/${v.id}/mqdefault.jpg)"` : ""}>
      <img src="https://i.ytimg.com/vi/${v.id}/mqdefault.jpg" srcset="${thumbSrcset(v)}" sizes="${sizes}" alt="" loading="lazy" width="320" height="180"${v.crop ? ` style="scale:${v.crop}"` : ""}>
      <span class="play-disc" aria-hidden="true">${playIcon}</span>
    </div>
    <div class="meta">
      <span class="badge">${cats(v).map(c => labels[c]).join(" et ")}</span>
      <h3><button class="card-link" type="button" data-play="${v.id}" data-title="${t}"${v.vertical ? " data-vertical" : ""} aria-haspopup="dialog" aria-label="Lire la vidéo\u00a0: ${t}">${t}</button></h3>
      <p><span>${v.year}</span><span>${v.channel}</span></p>
    </div>
  </article>`;
}).join("");

// Filters + progressive disclosure
const cards = [...grid.querySelectorAll(".card")];
const status = document.getElementById("grid-status");
const more = document.getElementById("more");
let filter = "all";
let expanded = false;

function render() {
  const matching = cards.filter(c => filter === "all" || c.dataset.cat.split(" ").includes(filter));
  const limit = filter === "all" && !expanded ? initialCount() : Infinity;
  cards.forEach(c => { c.hidden = true; });
  matching.forEach((c, i) => { c.hidden = i >= limit; });
  const hiddenCount = matching.length - Math.min(matching.length, limit);
  more.hidden = hiddenCount === 0;
  more.textContent = `Voir les ${hiddenCount} autres vidéos`;
  const shown = matching.length - hiddenCount;
  const total = `${matching.length} vidéo${matching.length > 1 ? "s" : ""}`;
  status.textContent = hiddenCount ? `${shown} sur ${total}` : total;
}

document.querySelectorAll(".chip").forEach(chip => {
  chip.addEventListener("click", () => {
    document.querySelectorAll(".chip").forEach(c => c.setAttribute("aria-pressed", String(c === chip)));
    filter = chip.dataset.filter;
    render();
  });
});
more.addEventListener("click", () => {
  const firstNew = cards.find(c => c.hidden && (filter === "all" || c.dataset.cat.split(" ").includes(filter)));
  expanded = true;
  render();
  firstNew?.querySelector(".card-link").focus();
});
small.addEventListener("change", render);
render();

// Video player (privacy-enhanced embeds, loaded only on click)
const dialog = document.getElementById("player");
const frame = document.getElementById("player-frame");
const ratio = document.getElementById("player-ratio");
const ytLink = document.getElementById("player-yt");
document.addEventListener("click", e => {
  const el = e.target.closest("[data-play]");
  if (!el) return;
  const id = el.dataset.play;
  const title = el.dataset.title || "";
  // thumbnail behind the iframe while it loads, or if the embed is blocked
  ratio.style.backgroundImage = `url(https://i.ytimg.com/vi/${id}/hqdefault.jpg)`;
  ratio.classList.toggle("vertical", el.hasAttribute("data-vertical"));
  frame.title = `Lecteur vidéo : ${title}`;
  frame.src = `https://www.youtube-nocookie.com/embed/${id}?autoplay=1&rel=0`;
  ytLink.href = `https://www.youtube.com/watch?v=${id}`;
  document.getElementById("player-title").textContent = frType(title);
  dialog.showModal();
});
dialog.querySelector(".close").addEventListener("click", () => dialog.close());
dialog.addEventListener("click", e => { if (e.target === dialog) dialog.close(); });
// removeAttribute rather than src = "" (which would load this page inside the iframe)
dialog.addEventListener("close", () => { frame.removeAttribute("src"); });

// Hero background clip: skipped when the device asks for less motion or less data (the poster stays).
// Small screens get the light encode (~440 KB instead of 1.8 MB).
const heroVideo = document.getElementById("hero-video");
const heroToggle = document.getElementById("hero-toggle");
const reduceMotion = matchMedia("(prefers-reduced-motion: reduce)").matches;
const conn = navigator.connection;
const saveData = conn && (conn.saveData || /2g|3g/.test(conn.effectiveType || ""));
if (!reduceMotion && !saveData) {
  heroVideo.src = small.matches ? heroVideo.dataset.srcSmall : heroVideo.dataset.src;
  let userPaused = false;
  const syncToggle = () => {
    heroToggle.classList.toggle("paused", heroVideo.paused);
    heroToggle.querySelector(".toggle-label").textContent = heroVideo.paused ? "Relancer le fond vidéo" : "Mettre en pause le fond vidéo";
  };
  heroVideo.addEventListener("play", () => { heroToggle.hidden = false; syncToggle(); });
  heroVideo.addEventListener("pause", syncToggle);
  heroVideo.play().catch(() => {});
  heroToggle.addEventListener("click", () => {
    userPaused = !heroVideo.paused;
    userPaused ? heroVideo.pause() : heroVideo.play();
  });
  // Save battery: pause while the hero is off screen, resume unless the visitor paused it
  new IntersectionObserver(([entry]) => {
    if (!entry.isIntersecting) heroVideo.pause();
    else if (!userPaused) heroVideo.play().catch(() => {});
  }).observe(heroVideo);
}

// Nav: mark the section currently in view
const navLinks = [...document.querySelectorAll(".nav nav a")];
const sectionObserver = new IntersectionObserver(entries => {
  entries.forEach(e => {
    if (!e.isIntersecting) return;
    navLinks.forEach(a => a.setAttribute("aria-current", String(a.hash === `#${e.target.id}`)));
  });
}, { rootMargin: "-45% 0px -50% 0px" });
navLinks.forEach(a => { const sec = document.querySelector(a.hash); if (sec) sectionObserver.observe(sec); });

document.getElementById("year").textContent = new Date().getFullYear();
