const detail = document.getElementById("detail");
const detailBg = document.getElementById("detailBg");
const detailHero = document.getElementById("detailHero");
const btnBack = document.getElementById("btnBack");

let idx = 0;
let imgSrc = "";
let ticking = false;
let isLeaving = false;

try {
  const raw = sessionStorage.getItem("TRANSITION_TO");
  if (raw) {
    const p = JSON.parse(raw);
    idx = Number(p.idx || 0);
    imgSrc = p.imgSrc || "";
  }
} catch {}

if (imgSrc) {
  detailBg.src = imgSrc;
}

function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}

function updateDetailScrollState() {
  const scrollTop = window.scrollY || window.pageYOffset || 0;
  const heroHeight = detailHero ? detailHero.offsetHeight : window.innerHeight;
  const progress = clamp(scrollTop / (heroHeight * 0.95), 0, 1);
  detail.style.setProperty("--detail-progress", progress.toFixed(4));
}

function requestScrollUpdate() {
  if (ticking) return;

  ticking = true;
  requestAnimationFrame(() => {
    updateDetailScrollState();
    ticking = false;
  });
}

window.addEventListener("scroll", requestScrollUpdate, { passive: true });
window.addEventListener("resize", requestScrollUpdate);

updateDetailScrollState();

btnBack.addEventListener("click", () => {
  if (isLeaving) return;
  isLeaving = true;

  detail.classList.add("is-exit");

  const realSrc = detailBg.currentSrc || detailBg.src;

  sessionStorage.setItem("TRANSITION_BACK", JSON.stringify({
    idx,
    imgSrc: realSrc
  }));

  setTimeout(() => {
    window.location.href = "home.html";
  }, 220);
});
