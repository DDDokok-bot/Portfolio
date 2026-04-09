const data = [
  {
    top:" ",
    bottom:"HOME PAGE",
    meta:"0 - Home",
    bg:"#4ba372"
  },
  {
    top:"Arcade Air Battle",
    bottom:"State-Based Gameplay · p5.js · Boss Phase Logic",
    meta:"1 - Interaction Design",
    bg:"#6394d4"
  },
  {
    top:"Interactive Fish Pond",
    bottom:"Behavior Simulation · p5.js · Responsive Interaction",
    meta:"2 - Interaction Design",
    bg:"#62b5ce"
  },
  {
    top:"Interactive Sky",
    bottom:"Time Shift · p5.js · Responsive Interaction",
    meta:"3 - Interaction Design",
    bg:"#e0a969"
  },
  {
    top:"Mechanical Flower",
    bottom:"Light-Responsive · Arduino + Python · 3D Printing",
    meta:"4 - Physical Computing",
    bg:"#706e75"
  },
  {
    top:"Forkcast",
    bottom:"Dish-Focused Discovery · HTML · CSS · JavaScript",
    meta:"5 - UIUX Design",
    bg:"#b8736a"
  },
  {
    top:"TIMORA",
    bottom:"Academic Planning App · Figma · UI Design",
    meta:"6 - UIUX Design",
    bg:"#fad9b9"
  },
  {
    top:"Fridge Voice Assistant",
    bottom:"Voice Interaction · ProtoPie · UI Design",
    meta:"7 - UIUX Design",
    bg:"#7dad71"
  },
  {
    top:"Personal Sound Map",
    bottom:"Spatial Navigation · Unity · Gaussian Splatting",
    meta:"8 -  Interactive Prototyping",
    bg:"#d6b187"
  },
  {
    top:"Split-Screen Racing",
    bottom:"Gaming Logic · Unity · Level Design",
    meta:"9 - Interactive Prototyping",
    bg:"#eea771"
  },
  {
    top:"Duck Puzzle Adventure",
    bottom:"Puzzle Logic · Unity · Level Design",
    meta:"10 - Interactive Prototyping",
    bg:"#8fa66d"
  }
];

const stamps = [...document.querySelectorAll(".stamp")];
const world = document.getElementById("world");
const titleTop = document.getElementById("title-top");
const titleBottom = document.getElementById("title-bottom");
const meta = document.getElementById("meta");
const stage = document.querySelector(".stage");

const transition = document.getElementById("transition");
const transitionImg = document.getElementById("transitionImg");

const N = data.length;

const INPUT_SENS = 0.0012;
const IDLE_SNAP_MS = 80;
const SNAP_LERP = 0.12;
const MOVE_LERP = 0.35;

function clamp(n,min,max){ return Math.max(min,Math.min(max,n)); }
function lerp(a,b,t){ return a+(b-a)*t; }
function mod(n,m){ return ((n % m) + m) % m; }

function restartAnim(el, className){
  el.classList.remove(className);
  void el.offsetWidth;
  el.classList.add(className);
}

function setBackground(color){
  document.documentElement.style.setProperty("--bg", color);
  document.body.style.background = color;
  if (stage) stage.style.background = color;
}

function updateUI(i){
  const d = data[i];
  titleTop.textContent = d.top;
  titleBottom.textContent = d.bottom;
  meta.textContent = d.meta;

  restartAnim(titleTop, "title-in-top");
  restartAnim(titleBottom, "title-in-bottom");

  setBackground(d.bg);
}

function getOffsets(){
  const w = window.innerWidth;
  const h = window.innerHeight;

  if (w <= 640) {
    return {
      dx: w * 0.34,
      dy: h * 0.24
    };
  }

  if (w <= 900) {
    return {
      dx: w * 0.38,
      dy: h * 0.28
    };
  }

  return {
    dx: w * 0.44,
    dy: h * 0.34
  };
}

function shortestDelta(idx, pw){
  return mod((idx - pw) + N/2, N) - N/2;
}

function applyLayout(pValue){
  const {dx,dy} = getOffsets();
  const pw = mod(pValue, N);

  world.style.transform = `translate(0px,0px)`;

  stamps.forEach((el, idx) => {
    const d = shortestDelta(idx, pw);
    const dist = Math.abs(d);

    if (dist > 1.05) {
      el.style.transform = `
        translate(0px, 0px)
        translate(-50%, -50%)
        scale(0.6)
      `;
      el.style.opacity = 0;
      el.style.pointerEvents = "none";
      el.style.zIndex = 0;
      el.style.filter = "blur(0px)";
      el.classList.remove("is-focus");
      return;
    }

    const w = window.innerWidth;
    const isPhone = w <= 640;
    const isTablet = w <= 900;

    let x = d * dx;
    let y = d * dy;
    let scale = 1;
    let opacity = 1;
    let blur = 0;
    let rotate = 0;
    let z = 1;

    if (dist < 0.28) {
      scale = isPhone ? 0.96 : isTablet ? 1.02 : 1.16;
      opacity = 1;
      blur = 0;
      rotate = 0;
      z = 30;
      el.classList.add("is-focus");
    } else {
      scale = isPhone ? 0.62 : isTablet ? 0.68 : 0.74;
      opacity = isPhone ? 0.22 : 0.34;
      blur = isPhone ? 0.4 : 0.8;
      rotate = isPhone ? d * 1.2 : d * 2.2;
      z = 10;
      el.classList.remove("is-focus");
    }

    el.style.transform = `
      translate(${x}px, ${y}px)
      translate(-50%, -50%)
      scale(${scale})
      rotate(${rotate}deg)
    `;
    el.style.opacity = opacity;
    el.style.pointerEvents = "auto";
    el.style.zIndex = z;
    el.style.filter = `blur(${blur}px)`;
  });
}

let isTransitioning = false;
let pos = 0;
let posRender = 0;
let lastInputAt = 0;
let lastShownIndex = -1;

function onWheel(e){
  if (isTransitioning) return;
  e.preventDefault();

  const dy = e.deltaY;
  pos += dy * INPUT_SENS;
  lastInputAt = performance.now();
}
window.addEventListener("wheel", onWheel, { passive:false });

function animateToFullscreen(fromRect, imgSrc, done){
  isTransitioning = true;

  transition.classList.add("is-on");
  transitionImg.src = imgSrc;

  transitionImg.style.transition = "none";
  transitionImg.style.left = `${fromRect.left}px`;
  transitionImg.style.top = `${fromRect.top}px`;
  transitionImg.style.width = `${fromRect.width}px`;
  transitionImg.style.height = `${fromRect.height}px`;
  transitionImg.style.borderRadius = `10px`;
  transitionImg.style.opacity = `1`;

  requestAnimationFrame(() => {
    const dur = 520;
    transitionImg.style.transition = `
      left ${dur}ms cubic-bezier(0.12,0.9,0.2,1),
      top ${dur}ms cubic-bezier(0.12,0.9,0.2,1),
      width ${dur}ms cubic-bezier(0.12,0.9,0.2,1),
      height ${dur}ms cubic-bezier(0.12,0.9,0.2,1),
      border-radius ${dur}ms cubic-bezier(0.12,0.9,0.2,1),
      opacity ${dur}ms ease
    `;
    transitionImg.style.left = `0px`;
    transitionImg.style.top = `0px`;
    transitionImg.style.width = `${window.innerWidth}px`;
    transitionImg.style.height = `${window.innerHeight}px`;
    transitionImg.style.borderRadius = `0px`;
    transitionImg.style.opacity = `1`;

    setTimeout(() => done?.(), dur + 40);
  });
}

function animateFromRectToRect(fromRect, toRect, imgSrc, fromOpacity = 1, done){
  isTransitioning = true;

  transition.classList.add("is-on");
  transitionImg.src = imgSrc;

  transitionImg.style.transition = "none";
  transitionImg.style.left = `${fromRect.left}px`;
  transitionImg.style.top = `${fromRect.top}px`;
  transitionImg.style.width = `${fromRect.width}px`;
  transitionImg.style.height = `${fromRect.height}px`;
  transitionImg.style.borderRadius = `${fromRect.borderRadius ?? 0}px`;
  transitionImg.style.opacity = `${fromOpacity}`;

  requestAnimationFrame(() => {
    const dur = 420;
    transitionImg.style.transition = `
      left ${dur}ms cubic-bezier(0.12,0.9,0.2,1),
      top ${dur}ms cubic-bezier(0.12,0.9,0.2,1),
      width ${dur}ms cubic-bezier(0.12,0.9,0.2,1),
      height ${dur}ms cubic-bezier(0.12,0.9,0.2,1),
      border-radius ${dur}ms cubic-bezier(0.12,0.9,0.2,1),
      opacity ${dur}ms ease
    `;
    transitionImg.style.left = `${toRect.left}px`;
    transitionImg.style.top = `${toRect.top}px`;
    transitionImg.style.width = `${toRect.width}px`;
    transitionImg.style.height = `${toRect.height}px`;
    transitionImg.style.borderRadius = `10px`;
    transitionImg.style.opacity = `1`;

    setTimeout(() => done?.(), dur + 40);
  });
}

function animateFromFullscreenToRect(toRect, imgSrc, done){
  animateFromRectToRect(
    {
      left: 0,
      top: 0,
      width: window.innerWidth,
      height: window.innerHeight,
      borderRadius: 0
    },
    toRect,
    imgSrc,
    1,
    done
  );
}

function getStampRectByIdx(idx){
  const el = stamps[idx];
  if (!el) return null;
  const inner = el.querySelector(".stamp__inner");
  return (inner || el).getBoundingClientRect();
}

function onStampClick(e){
  if (isTransitioning) return;

  const stamp = e.currentTarget;
  const workUrl = stamp.getAttribute("data-work");
  if (!workUrl) return;

  const idx = Number(stamp.getAttribute("data-idx") || "0");
  const img = stamp.querySelector("img");
  if (!img) return;

  pos = idx;
  posRender = idx;
  lastInputAt = performance.now();
  applyLayout(posRender);

  lastShownIndex = mod(idx, N);
  updateUI(lastShownIndex);

  const rect = (stamp.querySelector(".stamp__inner") || stamp).getBoundingClientRect();
  const imgSrc = img.currentSrc || img.src;

  sessionStorage.setItem("TRANSITION_TO", JSON.stringify({ idx, imgSrc }));

  animateToFullscreen(rect, imgSrc, () => {
    window.location.href = workUrl;
  });
}
stamps.forEach(st => st.addEventListener("click", onStampClick));

function tryPlayReturnTransition(){
  const raw = sessionStorage.getItem("TRANSITION_BACK");
  if (!raw) return false;

  let payload = null;
  try { payload = JSON.parse(raw); } catch {}
  sessionStorage.removeItem("TRANSITION_BACK");
  if (!payload) return false;

  const idx = Number(payload.idx || 0);
  const imgSrc = payload.imgSrc || "";
  const fromRect = payload.fromRect || null;
  if (!imgSrc) return false;

  pos = idx;
  posRender = idx;
  lastInputAt = performance.now();

  lastShownIndex = mod(idx, N);
  updateUI(lastShownIndex);
  applyLayout(posRender);

  requestAnimationFrame(() => {
    requestAnimationFrame(() => {
      const toRect = getStampRectByIdx(idx);
      if (!toRect) {
        isTransitioning = false;
        return;
      }

      if (fromRect) {
        animateFromRectToRect(
          fromRect,
          toRect,
          imgSrc,
          fromRect.opacity ?? 1,
          () => {
            transition.classList.remove("is-on");
            transitionImg.style.transition = "none";
            isTransitioning = false;
          }
        );
      } else {
        animateFromFullscreenToRect(toRect, imgSrc, () => {
          transition.classList.remove("is-on");
          transitionImg.style.transition = "none";
          isTransitioning = false;
        });
      }
    });
  });

  return true;
}

function tryPlayHomeEntry(){
  const raw = sessionStorage.getItem("TRANSITION_HOME");
  if (!raw) return false;

  let payload = null;
  try { payload = JSON.parse(raw); } catch {}
  sessionStorage.removeItem("TRANSITION_HOME");
  if (!payload) return false;

  const idx = Number(payload.idx || 0);
  const imgSrc = payload.imgSrc || "";
  if (!imgSrc) return false;

  pos = idx;
  posRender = idx;
  lastInputAt = performance.now();

  lastShownIndex = mod(idx, N);
  updateUI(lastShownIndex);
  applyLayout(posRender);

  isTransitioning = true;
  transition.classList.add("is-on");
  transitionImg.src = imgSrc;

  transitionImg.style.transition = "none";
  transitionImg.style.left = `0px`;
  transitionImg.style.top = `0px`;
  transitionImg.style.width = `${window.innerWidth}px`;
  transitionImg.style.height = `${window.innerHeight}px`;
  transitionImg.style.borderRadius = `0px`;
  transitionImg.style.opacity = `1`;

  requestAnimationFrame(() => {
    requestAnimationFrame(() => {
      const toRect = getStampRectByIdx(idx);
      if (!toRect) {
        transition.classList.remove("is-on");
        isTransitioning = false;
        return;
      }

      animateFromFullscreenToRect(toRect, imgSrc, () => {
        transition.classList.remove("is-on");
        transitionImg.style.transition = "none";
        isTransitioning = false;
      });
    });
  });

  return true;
}

function tick(){
  const now = performance.now();
  const idle = (now - lastInputAt) > IDLE_SNAP_MS;

  if (!isTransitioning) {
    if (idle) {
      const snap = Math.round(pos);
      pos = lerp(pos, snap, SNAP_LERP);
    }
    posRender = lerp(posRender, pos, MOVE_LERP);
  }

  applyLayout(posRender);

  const idx = mod(Math.round(pos), N);
  if (idx !== lastShownIndex) {
    lastShownIndex = idx;
    updateUI(idx);
  }

  requestAnimationFrame(tick);
}

requestAnimationFrame(() => {
  pos = 0;
  posRender = 0;
  lastInputAt = performance.now();

  lastShownIndex = 0;
  updateUI(0);
  applyLayout(posRender);

  const didHome = tryPlayHomeEntry();
  if (!didHome) tryPlayReturnTransition();

  requestAnimationFrame(tick);
});

window.addEventListener("resize", () => {
  applyLayout(posRender);
});
