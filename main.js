// Videos from @oliviergburri and @ogburri (Mediamax Productions)
const videos = [
  { id: "LJefRF0cIwg", title: "Silence — 20 Year Anniversary Remaster", year: 2025, cat: "film", channel: "Mediamax" },
  { id: "siSyglaPrvA", title: "Hybris 4K (musique de Moby)", year: 2016, cat: "film", channel: "Olivier G. Burri" },
  { id: "V8UISiZhLe8", title: "Fichtl's Lied — remake 4K", year: 2016, cat: "film", channel: "Olivier G. Burri" },
  { id: "vSsUWqNi9S8", title: "Silence II — Teaser", year: 2026, cat: "film", channel: "Mediamax" },
  { id: "Q-HdE8g_xGc", title: "Le caméléon et la Submariner", year: 2026, cat: "vfx", channel: "Mediamax" },
  { id: "2dHRf-ZJvxg", title: "IVV Scène 23 — La rançon (WIP)", year: 2026, cat: "vfx", channel: "Mediamax" },
  { id: "5GodAChg-ls", title: "GoPro lancée dans l'espace — édition anniversaire", year: 2026, cat: "vfx", channel: "Mediamax" },
  { id: "oFLwiEZMrdY", title: "Vacuum Robot Cat", year: 2026, cat: "vfx", channel: "Mediamax" },
  { id: "pw-N6OE5cpQ", title: "Blender Boat", year: 2025, cat: "vfx", channel: "Mediamax" },
  { id: "khWwsM-qQzs", title: "DaVinci Resolve 18 — Surface Tracker", year: 2022, cat: "vfx", channel: "Mediamax" },
  { id: "mnz-Gm3vIMA", title: "The Cat and the DJI Mavic 4 Pro", year: 2025, cat: "aerial", channel: "Olivier G. Burri" },
  { id: "D_QYOdzoQe4", title: "DJI Mavic Pro Crash", year: 2017, cat: "aerial", channel: "Olivier G. Burri" },
  { id: "k2hUmBZ1Oxo", title: "iPhone 6S+ — images aériennes 4K", year: 2016, cat: "aerial", channel: "Olivier G. Burri" },
  { id: "AvbfTBo6CYM", title: "Le rig ultime pour Blackmagic Cinema Camera 6K", year: 2025, cat: "gear", channel: "Mediamax" },
  { id: "RylOnxkElhc", title: "Tilta Khronos — test complet pour iPhone 15 Pro", year: 2024, cat: "gear", channel: "Mediamax" },
  { id: "lTzuAUj-kJs", title: "Tilta Nucleus Nano II — Force test", year: 2023, cat: "gear", channel: "Mediamax" },
  { id: "PfecIFC_h4A", title: "Blackmagic URSA Mini Pro 12K", year: 2020, cat: "gear", channel: "Olivier G. Burri" },
  { id: "YX-CU9Q8Pxs", title: "RED Scarlet Rig « Red or Dead »", year: 2015, cat: "gear", channel: "Olivier G. Burri" },
];

const labels = { film: "Film", vfx: "VFX", aerial: "Aérien", gear: "Matériel" };
const grid = document.getElementById("grid");

grid.innerHTML = videos.map(v => `
  <button class="card" data-cat="${v.cat}" data-play="${v.id}" data-title="${v.title}">
    <div class="thumb">
      <img src="https://i.ytimg.com/vi/${v.id}/hqdefault.jpg" alt="" loading="lazy">
      <span class="play">▶</span>
    </div>
    <div class="meta">
      <span class="badge">${labels[v.cat]}</span>
      <h3>${v.title}</h3>
      <p>${v.year} · ${v.channel}</p>
    </div>
  </button>`).join("");

// Filters
document.querySelectorAll(".chip").forEach(chip => {
  chip.addEventListener("click", () => {
    document.querySelectorAll(".chip").forEach(c => c.classList.toggle("active", c === chip));
    const f = chip.dataset.filter;
    grid.querySelectorAll(".card").forEach(card => {
      card.hidden = f !== "all" && card.dataset.cat !== f;
    });
  });
});

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
const closePlayer = () => { dialog.close(); };
dialog.querySelector(".close").addEventListener("click", closePlayer);
dialog.addEventListener("click", e => { if (e.target === dialog) closePlayer(); });
dialog.addEventListener("close", () => { frame.src = ""; });

document.getElementById("year").textContent = new Date().getFullYear();
