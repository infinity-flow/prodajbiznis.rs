/* ==========================================================
   Hero 3D: ruka + prodavnica / novčić (Three.js)
   Prodavnica (PRODAJ) i novčić (KUPI) padaju u dlan,
   sinhronizovano sa rečju u naslovu (događaj "hero:phase").
   ========================================================== */
import * as THREE from "../vendor/three.module.min.js";
import LINES from "./hero3d-lines.js";

const stage = document.querySelector("[data-scene]");
if (stage) init(stage);

function init(stage) {
  let renderer;
  try {
    renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: "low-power" });
  } catch (e) {
    return; // bez WebGL-a ostaje 2D verzija
  }
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
  renderer.setClearColor(0x000000, 0);
  const canvas = renderer.domElement;
  canvas.className = "hero-canvas";
  canvas.setAttribute("aria-hidden", "true");
  stage.appendChild(canvas);

  const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(30, 1, 0.1, 100);
  const root = new THREE.Group();
  scene.add(root);

  // ---------- Bounds of the composition (world units) ----------
  const VIEW = { left: -2.45, right: 2.4, bottom: -1.8, top: 1.82 };

  // ---------- Build line objects ----------
  const FRONT = 0x0a0a0a;
  const BACK = 0xc4c4c4;
  let lineRadius = 0.012;
  const objects = {};

  function makeObject(name, depth) {
    const data = LINES[name];
    const group = new THREE.Group();
    const front = new THREE.MeshBasicMaterial({ color: FRONT, transparent: true });
    const back = new THREE.MeshBasicMaterial({ color: BACK, transparent: true });
    group.userData = { data, depth, front, back };
    group.position.set(data.pivot[0], data.pivot[1], 0);
    root.add(group);
    objects[name] = group;
    return group;
  }

  function buildGeometry(group) {
    // obriši staru geometriju (kad se promeni veličina)
    for (let i = group.children.length - 1; i >= 0; i--) {
      const m = group.children[i];
      m.geometry.dispose();
      group.remove(m);
    }
    const { data, depth, front, back } = group.userData;
    for (const line of data.lines) {
      const pts = line.map(([x, y]) => new THREE.Vector3(x, y, 0));
      if (pts.length < 2) continue;
      const curve = pts.length === 2
        ? new THREE.LineCurve3(pts[0], pts[1])
        : new THREE.CatmullRomCurve3(pts, false, "centripetal", 0.5);
      const seg = Math.max(4, pts.length * 8);
      const gFront = new THREE.TubeGeometry(curve, seg, lineRadius, 6, false);
      const gBack = new THREE.TubeGeometry(curve, seg, lineRadius * 0.75, 5, false);
      const mf = new THREE.Mesh(gFront, front);
      const mb = new THREE.Mesh(gBack, back);
      mf.position.z = depth / 2;
      mb.position.z = -depth / 2;
      mb.renderOrder = 0;
      mf.renderOrder = 1;
      group.add(mb, mf);
    }
  }

  const hand = makeObject("hand", 0.16);
  const shop = makeObject("shop", 0.32);
  const coin = makeObject("coin", 0.14);
  const icons = [shop, coin]; // 0 = PRODAJ, 1 = KUPI

  // ---------- State ----------
  const base = { shop: shop.position.clone(), coin: coin.position.clone(), hand: hand.position.clone() };
  const st = new Map();
  for (const ic of icons) {
    st.set(ic, { mode: "hidden", y: 0, v: 0, t: 0, delay: 0, squash: 0, squashV: 0, spin: 0, tilt: 0, opacity: 0, landed: false });
    setOpacity(ic, 0);
    ic.visible = false;
  }
  const handSpring = { y: 0, v: 0, r: 0, rv: 0 };
  const mouse = { x: 0, y: 0, sx: 0, sy: 0 };
  let current = -1;

  function setOpacity(ic, o) {
    ic.userData.front.opacity = o;
    ic.userData.back.opacity = o;
  }

  function show(idx) {
    if (idx === current) return;
    const prev = icons[current];
    current = idx;
    const next = icons[idx];
    if (prev) {
      const s = st.get(prev);
      s.mode = "leaving"; s.t = 0;
    }
    const s = st.get(next);
    Object.assign(s, {
      mode: reduce ? "rest" : "waiting",
      delay: prev ? 0.3 : 0.15,
      y: reduce ? 0 : fallHeight(next),
      v: 0, t: 0, squash: 0, squashV: 0, landed: false,
      spin: next === coin ? Math.PI * 2 * 3 : 0,
      tilt: next === shop ? -0.35 : 0,
      opacity: reduce ? 1 : 0,
    });
    next.visible = true;
    setOpacity(next, s.opacity);
  }

  function fallHeight(ic) {
    // početak tačno iznad vidljivog dela scene
    return view.top - ic.position.y + 0.15;
  }

  // ---------- Layout / camera ----------
  const view = { w: 1, h: 1, top: VIEW.top };
  function resize() {
    const r = stage.getBoundingClientRect();
    const w = Math.max(1, Math.round(r.width));
    const h = Math.max(1, Math.round(r.height));
    renderer.setSize(w, h, false);
    camera.aspect = w / h;
    // uklopi kompoziciju: širina i visina, poravnato desno i dole
    const needW = VIEW.right - VIEW.left;
    const needH = VIEW.top - VIEW.bottom;
    const visH = Math.max(needH, needW / camera.aspect);
    const visW = visH * camera.aspect;
    const dist = visH / 2 / Math.tan(THREE.MathUtils.degToRad(camera.fov / 2));
    const cx = VIEW.right - visW / 2;
    const cy = VIEW.bottom + visH / 2;
    camera.position.set(cx, cy, dist);
    camera.lookAt(cx, cy, 0);
    camera.updateProjectionMatrix();
    view.w = visW; view.h = visH; view.top = cy + visH / 2;
    // debljina linije ~2px na ekranu, kao obris slova
    const pxPerUnit = h / visH;
    const want = 1.15 / pxPerUnit;
    if (Math.abs(want - lineRadius) / lineRadius > 0.08 || !hand.children.length) {
      lineRadius = want;
      [hand, shop, coin].forEach(buildGeometry);
    }
  }

  // ---------- Animation ----------
  const G = 26;
  const clock = new THREE.Clock();
  let running = false;
  let elapsed = 0;

  function step(dt) {
    elapsed += dt;
    // miš: blago naginjanje cele scene
    mouse.sx += (mouse.x - mouse.sx) * Math.min(1, dt * 3);
    mouse.sy += (mouse.y - mouse.sy) * Math.min(1, dt * 3);
    root.rotation.y = mouse.sx * 0.28 + Math.sin(elapsed * 0.35) * 0.06;
    root.rotation.x = -mouse.sy * 0.12;

    // ruka: opruga + lagano disanje
    const k = 70, c = 9;
    handSpring.v += (-k * handSpring.y - c * handSpring.v) * dt;
    handSpring.y += handSpring.v * dt;
    handSpring.rv += (-k * handSpring.r - c * handSpring.rv) * dt;
    handSpring.r += handSpring.rv * dt;
    hand.position.y = base.hand.y + handSpring.y + Math.sin(elapsed * 1.1) * 0.012;
    hand.rotation.z = handSpring.r;
    hand.rotation.y = Math.sin(elapsed * 0.5) * 0.1;

    for (const ic of icons) {
      const s = st.get(ic);
      const b = ic === shop ? base.shop : base.coin;
      if (s.mode === "hidden") continue;

      if (s.mode === "waiting") {
        s.delay -= dt;
        if (s.delay <= 0) s.mode = "falling";
      }

      if (s.mode === "falling") {
        s.opacity = Math.min(1, s.opacity + dt * 5);
        s.v -= G * dt;
        s.y += s.v * dt;
        if (ic === coin) s.spin *= Math.pow(0.12, dt); // okret se usporava
        if (s.y <= 0) {
          s.y = 0;
          const impact = -s.v;
          if (!s.landed) {
            // prvi udar: ruka "uhvati"
            handSpring.v -= impact * 0.11;
            handSpring.rv += impact * 0.012;
            s.landed = true;
          }
          s.squashV += impact * 0.06;
          if (impact > 2.2) s.v = impact * 0.32;
          else { s.v = 0; s.mode = "rest"; s.t = 0; }
        }
      }

      if (s.mode === "rest") {
        s.opacity = Math.min(1, s.opacity + dt * 5);
        s.t += dt;
        s.spin *= Math.pow(0.02, dt);
        s.y = Math.sin(s.t * 1.7) * 0.035 * Math.min(1, s.t);
      }

      if (s.mode === "leaving") {
        s.t += dt;
        const p = Math.min(1, s.t / 0.38);
        const e = p * p;
        s.y += dt * (0.6 + e * 6);
        s.opacity = 1 - e;
        if (p >= 1) { s.mode = "hidden"; ic.visible = false; }
      }

      // nagib prodavnice se vraća, sabijanje kao opruga
      s.tilt += (0 - s.tilt) * Math.min(1, dt * (s.landed ? 9 : 1.5));
      s.squashV += (-120 * s.squash - 12 * s.squashV) * dt;
      s.squash += s.squashV * dt;
      const sq = THREE.MathUtils.clamp(s.squash, -0.12, 0.18);

      ic.position.set(b.x, b.y + s.y, 0);
      ic.scale.set(1 + sq * 0.6, 1 - sq, 1 + sq * 0.6);
      const idle = s.mode === "rest" ? Math.sin(s.t * 0.8) * 0.38 : 0;
      ic.rotation.y = s.spin + idle;
      ic.rotation.z = s.tilt;
      setOpacity(ic, s.opacity);
    }
  }

  function frame() {
    if (!running) return;
    const dt = Math.min(clock.getDelta(), 1 / 30);
    step(dt);
    renderer.render(scene, camera);
    requestAnimationFrame(frame);
  }
  function start() {
    if (running) return;
    running = true;
    clock.getDelta();
    requestAnimationFrame(frame);
  }
  function stop() { running = false; }

  // ---------- Wiring ----------
  resize();
  new ResizeObserver(resize).observe(stage);

  window.addEventListener("hero:phase", (e) => show(e.detail.index));
  // trenutna reč u naslovu
  const words = [...document.querySelectorAll("[data-rotator] .rw")];
  const activeIdx = Math.max(0, words.findIndex((w) => w.classList.contains("is-active")));
  show(activeIdx);

  window.addEventListener("pointermove", (e) => {
    mouse.x = (e.clientX / window.innerWidth) * 2 - 1;
    mouse.y = (e.clientY / window.innerHeight) * 2 - 1;
  }, { passive: true });

  const io = new IntersectionObserver((en) => {
    en.forEach((x) => (x.isIntersecting && !document.hidden ? start() : stop()));
  });
  io.observe(stage);
  document.addEventListener("visibilitychange", () => {
    if (document.hidden) stop();
    else if (stage.getBoundingClientRect().bottom > 0) start();
  });

  stage.classList.add("is-3d");
  start();
}
