// Videos from @oliviergburri and @ogburri (Mediamax Productions)
// featured: shown large, first in the grid
const videos = [
  { id: "Q-HdE8g_xGc", title: "Le caméléon et la Submariner", year: 2026, cat: "vfx", channel: "Mediamax", featured: true },
  { id: "2dHRf-ZJvxg", title: "IVV, scène 23 « La rançon » (en cours)", year: 2026, cat: "vfx", channel: "Mediamax", featured: true },
  { id: "vSsUWqNi9S8", title: "Silence II, teaser", year: 2026, cat: "film", channel: "Mediamax", featured: true },
  { id: "LJefRF0cIwg", title: "Silence, remaster du 20e anniversaire", year: 2025, cat: "film", channel: "Mediamax", featured: true },
  { id: "siSyglaPrvA", title: "Hybris (musique de Moby)", year: 2016, cat: "film", channel: "Olivier G. Burri", featured: true },
  { id: "V8UISiZhLe8", title: "Fichtl's Lied, remake 4K", year: 2016, cat: "film", channel: "Olivier G. Burri", featured: true },
  { id: "oFLwiEZMrdY", title: "Le chat et le robot aspirateur", year: 2026, cat: "vfx", channel: "Mediamax" },
  { id: "5GodAChg-ls", title: "Une GoPro lancée dans l'espace retombe sur Terre", year: 2026, cat: "vfx", channel: "Mediamax" },
  { id: "pw-N6OE5cpQ", title: "Un bateau dans Blender", year: 2025, cat: "vfx", channel: "Mediamax" },
  { id: "khWwsM-qQzs", title: "Le Surface Tracker de DaVinci Resolve 18", year: 2022, cat: "vfx", channel: "Mediamax" },
  { id: "mnz-Gm3vIMA", title: "Le chat et le DJI Mavic 4 Pro", year: 2025, cat: "aerial", channel: "Olivier G. Burri" },
  { id: "D_QYOdzoQe4", title: "Crash d'un DJI Mavic Pro", year: 2017, cat: "aerial", channel: "Olivier G. Burri" },
  { id: "k2hUmBZ1Oxo", title: "Images aériennes 4K à l'iPhone 6S+", year: 2016, cat: "aerial", channel: "Olivier G. Burri" },
  { id: "AvbfTBo6CYM", title: "Le rig ultime pour la Blackmagic Cinema Camera 6K", year: 2025, cat: "gear", channel: "Mediamax" },
  { id: "RylOnxkElhc", title: "Faut-il acheter le Tilta Khronos ?", year: 2024, cat: "gear", channel: "Mediamax" },
  { id: "lTzuAUj-kJs", title: "Tilta Nucleus Nano II, test de force", year: 2023, cat: "gear", channel: "Mediamax" },
  { id: "PfecIFC_h4A", title: "Blackmagic URSA Mini Pro 12K", year: 2020, cat: "gear", channel: "Olivier G. Burri" },
  { id: "YX-CU9Q8Pxs", title: "Rig RED Scarlet « Red or Dead »", year: 2015, cat: "gear", channel: "Olivier G. Burri" },
];

const labels = { film: "Film", vfx: "VFX", aerial: "Aérien", gear: "Matériel et tutos" };
const playIcon = '<svg class="icon" viewBox="0 0 24 24" aria-hidden="true"><path d="M8 5.5v13l10.5-6.5z"/></svg>';
const INITIAL_COUNT = 9; // cards shown under "Tout" before "voir plus"

const escapeHtml = s => s.replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));

// Featured first, then newest first
const ordered = [...videos].sort((a, b) => (b.featured === true) - (a.featured === true) || b.year - a.year);

const grid = document.getElementById("grid");
grid.innerHTML = ordered.map(v => {
  const t = escapeHtml(v.title);
  return `
  <article class="card${v.featured ? " featured" : ""}" data-cat="${v.cat}">
    <div class="thumb">
      <img src="https://i.ytimg.com/vi/${v.id}/hqdefault.jpg" alt="" loading="lazy" width="480" height="360">
      <span class="play-disc" aria-hidden="true">${playIcon}</span>
    </div>
    <div class="meta">
      <span class="badge">${labels[v.cat]}</span>
      <h3><button class="card-link" type="button" data-play="${v.id}" data-title="${t}" aria-haspopup="dialog">${t}</button></h3>
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
  const matching = cards.filter(c => filter === "all" || c.dataset.cat === filter);
  const limit = filter === "all" && !expanded ? INITIAL_COUNT : Infinity;
  cards.forEach(c => { c.hidden = true; });
  matching.forEach((c, i) => { c.hidden = i >= limit; });
  const hiddenCount = matching.length - Math.min(matching.length, limit);
  more.hidden = hiddenCount === 0;
  more.textContent = `Voir les ${hiddenCount} autres vidéos`;
  status.textContent = `${matching.length} vidéo${matching.length > 1 ? "s" : ""}`;
}

document.querySelectorAll(".chip").forEach(chip => {
  chip.addEventListener("click", () => {
    document.querySelectorAll(".chip").forEach(c => c.setAttribute("aria-pressed", String(c === chip)));
    filter = chip.dataset.filter;
    render();
  });
});
more.addEventListener("click", () => {
  const firstNew = cards.find(c => c.hidden && (filter === "all" || c.dataset.cat === filter));
  expanded = true;
  render();
  firstNew?.querySelector(".card-link").focus();
});
render();

// Video player (privacy-enhanced embeds, loaded only on click)
const dialog = document.getElementById("player");
const frame = document.getElementById("player-frame");
document.addEventListener("click", e => {
  const el = e.target.closest("[data-play]");
  if (!el) return;
  frame.src = `https://www.youtube-nocookie.com/embed/${el.dataset.play}?autoplay=1&rel=0`;
  document.getElementById("player-title").textContent = el.dataset.title || "";
  dialog.showModal();
});
dialog.querySelector(".close").addEventListener("click", () => dialog.close());
dialog.addEventListener("click", e => { if (e.target === dialog) dialog.close(); });
// removeAttribute rather than src = "" (which would load this page inside the iframe)
dialog.addEventListener("close", () => { frame.removeAttribute("src"); });

document.getElementById("year").textContent = new Date().getFullYear();
