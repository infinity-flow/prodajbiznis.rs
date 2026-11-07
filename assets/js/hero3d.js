/* ==========================================================
   Hero 3D (Three.js): ruka + prodavnica / novčić
   Puni 3D predmeti sa studijskim svetlom i senkama.
   Prodavnica (PRODAJ) i novčić (KUPI) padaju u dlan,
   sinhronizovano sa rečju u naslovu (događaj "hero:phase").
   ========================================================== */
import * as THREE from "three";
import { RoomEnvironment } from "../vendor/addons/RoomEnvironment.js";
import HAND from "./hero3d-hand.js";

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
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.0;
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  const canvas = renderer.domElement;
  canvas.className = "hero-canvas";
  canvas.setAttribute("aria-hidden", "true");
  stage.appendChild(canvas);

  const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const scene = new THREE.Scene();
  const pmrem = new THREE.PMREMGenerator(renderer);
  scene.environment = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;
  scene.environmentIntensity = 0.85;

  const camera = new THREE.PerspectiveCamera(28, 1, 0.1, 100);
  const root = new THREE.Group();
  scene.add(root);

  // ---------- Svetlo ----------
  const key = new THREE.DirectionalLight(0xffffff, 2.2);
  key.position.set(-2.5, 6, 4);
  key.castShadow = true;
  key.shadow.mapSize.set(1024, 1024);
  key.shadow.camera.left = -3; key.shadow.camera.right = 3;
  key.shadow.camera.top = 3; key.shadow.camera.bottom = -3;
  key.shadow.camera.near = 1; key.shadow.camera.far = 15;
  key.shadow.radius = 6;
  key.shadow.bias = -0.0015;
  scene.add(key);
  const rim = new THREE.DirectionalLight(0xffffff, 0.8);
  rim.position.set(3, 2, -3);
  scene.add(rim);

  // ---------- Materijali (crno-belo) ----------
  const M = {
    skin: new THREE.MeshStandardMaterial({ color: 0xe9e9e4, roughness: 0.55, metalness: 0 }),
    sleeve: new THREE.MeshStandardMaterial({ color: 0x141414, roughness: 0.6, metalness: 0.05 }),
    black: new THREE.MeshStandardMaterial({ color: 0x121212, roughness: 0.35, metalness: 0.15 }),
    white: new THREE.MeshStandardMaterial({ color: 0xf4f4f1, roughness: 0.6, metalness: 0 }),
    glass: new THREE.MeshStandardMaterial({ color: 0x0c0c0c, roughness: 0.08, metalness: 0.6 }),
    coin: new THREE.MeshStandardMaterial({ color: 0x1a1a1a, roughness: 0.22, metalness: 0.9 }),
    coinFace: new THREE.MeshStandardMaterial({ color: 0x222222, roughness: 0.35, metalness: 0.85 }),
  };
  const fadeMats = new Map(); // icon -> [materials] (za prozirnost)

  function shadowAll(obj, cast = true, receive = true) {
    obj.traverse((o) => { if (o.isMesh) { o.castShadow = cast; o.receiveShadow = receive; } });
  }

  // ---------- Ruka: ispunjena silueta, izvučena u debljinu ----------
  const hand = new THREE.Group();
  {
    const s = new THREE.Shape(HAND.shape.map(([x, y]) => new THREE.Vector2(x, y)));
    const depth = 0.9;
    const g = new THREE.ExtrudeGeometry(s, {
      depth, steps: 1, curveSegments: 16,
      bevelEnabled: true, bevelThickness: 0.16, bevelSize: 0.1, bevelSegments: 6,
    });
    g.translate(0, 0, -depth / 2);
    g.computeVertexNormals();
    const m = new THREE.Mesh(g, M.skin);
    hand.add(m);
    // linije prstiju iz ikonice, utisnute na obe strane dlana
    const faceZ = depth / 2 + 0.16;
    for (const line of HAND.inner || []) {
      const pts = line.map(([x, y]) => new THREE.Vector3(x, y, 0));
      const curve = pts.length > 2 ? new THREE.CatmullRomCurve3(pts, false, "centripetal") : new THREE.LineCurve3(pts[0], pts[1]);
      const tg = new THREE.TubeGeometry(curve, pts.length * 10, 0.022, 8, false);
      for (const side of [1, -1]) {
        const tm = new THREE.Mesh(tg, M.black);
        tm.position.z = side * (faceZ - 0.01);
        hand.add(tm);
      }
    }
    // rukav
    const w = HAND.wrist;
    const sh = (w.y1 - w.y0) + 0.18;
    const sleeve = new THREE.Mesh(roundBox(0.7, sh, depth + 0.42, 0.1), M.sleeve);
    sleeve.position.set(w.x - 0.3, (w.y0 + w.y1) / 2, 0);
    hand.add(sleeve);
    shadowAll(hand, true, true);
  }
  // ruka je nagnuta tako da se dlan vidi odozgo
  hand.rotation.x = -0.18;
  root.add(hand);

  // ---------- Novčić ----------
  const coin = new THREE.Group();
  {
    const r = 0.62, t = 0.16;
    const body = new THREE.Mesh(new THREE.CylinderGeometry(r, r, t, 96, 1), M.coin);
    body.rotation.x = Math.PI / 2;
    const inner = new THREE.Group();
    inner.add(body);
    // recke po ivici
    const ridgeG = new THREE.BoxGeometry(0.018, t * 0.86, 0.03);
    const ridges = new THREE.InstancedMesh(ridgeG, M.coin, 72);
    const d = new THREE.Object3D();
    for (let i = 0; i < 72; i++) {
      const a = (i / 72) * Math.PI * 2;
      d.position.set(Math.cos(a) * (r + 0.008), Math.sin(a) * (r + 0.008), 0);
      d.rotation.set(Math.PI / 2, 0, 0);
      d.rotateOnWorldAxis(new THREE.Vector3(0, 0, 1), a);
      d.updateMatrix();
      ridges.setMatrixAt(i, d.matrix);
    }
    inner.add(ridges);
    // obod i broj "1" na obe strane
    const digit = digitOne();
    for (const side of [1, -1]) {
      const ring = new THREE.Mesh(new THREE.TorusGeometry(r - 0.07, 0.03, 12, 96), M.coinFace);
      ring.position.z = side * (t / 2);
      inner.add(ring);
      const g = new THREE.ExtrudeGeometry(digit, { depth: 0.035, bevelEnabled: true, bevelThickness: 0.015, bevelSize: 0.012, bevelSegments: 3, curveSegments: 10 });
      const m = new THREE.Mesh(g, M.coinFace);
      m.position.z = side * (t / 2);
      if (side < 0) m.rotation.y = Math.PI;
      inner.add(m);
    }
    inner.position.y = r; // pivot na dnu
    coin.add(inner);
    shadowAll(coin, true, false);
    coin.userData.height = r * 2;
  }

  // ---------- Prodavnica ----------
  const shop = new THREE.Group();
  {
    const W = 1.3, D = 0.78, wallH = 0.66, baseH = 0.08;
    const add = (mesh, x, y, z) => { mesh.position.set(x, y, z); shop.add(mesh); return mesh; };
    add(new THREE.Mesh(roundBox(W + 0.16, baseH, D + 0.14, 0.03), M.black), 0, baseH / 2, 0);
    add(new THREE.Mesh(roundBox(W, wallH, D, 0.03), M.white), 0, baseH + wallH / 2, 0);
    // vrata, izlog, kvaka
    const fz = D / 2 + 0.006;
    add(new THREE.Mesh(roundBox(0.3, 0.46, 0.03, 0.01), M.black), -0.36, baseH + 0.23, fz);
    add(new THREE.Mesh(new THREE.SphereGeometry(0.022, 12, 8), M.white), -0.28, baseH + 0.24, fz + 0.025);
    add(new THREE.Mesh(roundBox(0.58, 0.28, 0.03, 0.01), M.glass), 0.2, baseH + 0.38, fz);
    add(new THREE.Mesh(roundBox(0.62, 0.035, 0.08, 0.01), M.black), 0.2, baseH + 0.22, fz + 0.02);
    // krov
    const roofY = baseH + wallH + 0.13;
    add(new THREE.Mesh(roundBox(W + 0.12, 0.1, D + 0.04, 0.03), M.black), 0, roofY + 0.05, -0.02);
    // tenda: kose pruge + lukovi
    const stripes = 6, sw = (W + 0.12) / stripes, slope = 0.42, len = 0.42;
    for (let i = 0; i < stripes; i++) {
      const mat = i % 2 ? M.white : M.black;
      const x = -(W + 0.12) / 2 + sw * (i + 0.5);
      const st = new THREE.Mesh(roundBox(sw + 0.002, 0.03, len, 0.008), mat);
      st.rotation.x = slope;
      add(st, x, roofY - Math.sin(slope) * len / 2 + 0.02, D / 2 + Math.cos(slope) * len / 2 - 0.08);
      const semi = new THREE.Shape();
      semi.moveTo(-sw / 2, 0);
      semi.absarc(0, 0, sw / 2, Math.PI, Math.PI * 2, false);
      semi.lineTo(-sw / 2, 0);
      const scG = new THREE.ExtrudeGeometry(semi, { depth: 0.03, bevelEnabled: true, bevelThickness: 0.006, bevelSize: 0.006, bevelSegments: 2, curveSegments: 16 });
      const ex = D / 2 + Math.cos(slope) * len - 0.08;
      const ey = roofY - Math.sin(slope) * len + 0.02;
      add(new THREE.Mesh(scG, mat), x, ey, ex - 0.03);
    }
    shadowAll(shop, true, true);
    shop.userData.height = roofY + 0.1;
  }

  const icons = [shop, coin]; // 0 = PRODAJ, 1 = KUPI
  for (const ic of icons) {
    root.add(ic);
    const mats = new Set();
    ic.traverse((o) => { if (o.isMesh) mats.add(o.material); });
    // svaki predmet dobija svoje kopije materijala da bi mogao da bledi
    const clones = new Map();
    ic.traverse((o) => {
      if (!o.isMesh) return;
      if (!clones.has(o.material)) { const c = o.material.clone(); c.transparent = true; clones.set(o.material, c); }
      o.material = clones.get(o.material);
    });
    fadeMats.set(ic, [...clones.values()]);
  }

  // ---------- Pozicije: dlan (zrak naniže na ruku) ----------
  const palmX = 0.05;
  root.updateMatrixWorld(true);
  const ray = new THREE.Raycaster(new THREE.Vector3(palmX, 5, 0), new THREE.Vector3(0, -1, 0));
  const hit = ray.intersectObject(hand, true)[0];
  const restY = hit ? hit.point.y : 0;
  const base = { x: palmX, y: restY, z: 0.05 };
  shop.scale.setScalar(1.08);
  coin.scale.setScalar(0.95);

  // ---------- Stanje ----------
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
    for (const m of fadeMats.get(ic)) {
      m.opacity = o;
      m.depthWrite = o > 0.98;
    }
  }

  function show(idx) {
    if (idx === current) return;
    const prev = icons[current];
    current = idx;
    const next = icons[idx];
    if (prev) { const s = st.get(prev); s.mode = "leaving"; s.t = 0; }
    const s = st.get(next);
    Object.assign(s, {
      mode: reduce ? "rest" : "waiting",
      delay: prev ? 0.3 : 0.15,
      y: reduce ? 0 : view.top - base.y + 0.2,
      v: 0, t: 0, squash: 0, squashV: 0, landed: false,
      spin: next === coin ? Math.PI * 2 * 3 : 0,
      tilt: next === shop ? -0.32 : 0,
      opacity: reduce ? 1 : 0,
    });
    next.visible = true;
    setOpacity(next, s.opacity);
  }

  // ---------- Kamera ----------
  const VIEW = { left: -2.85, right: 2.35, bottom: -0.95, top: 1.75 };
  const view = { top: VIEW.top };
  const CAM_TILT = 0.2; // kamera malo odozgo
  function resize() {
    const r = stage.getBoundingClientRect();
    const w = Math.max(1, Math.round(r.width));
    const h = Math.max(1, Math.round(r.height));
    renderer.setSize(w, h, false);
    camera.aspect = w / h;
    const needW = VIEW.right - VIEW.left;
    const needH = VIEW.top - VIEW.bottom;
    const visH = Math.max(needH, needW / camera.aspect);
    const visW = visH * camera.aspect;
    const dist = visH / 2 / Math.tan(THREE.MathUtils.degToRad(camera.fov / 2)) * 1.02;
    const cx = VIEW.right - visW / 2;
    const cy = VIEW.bottom + visH / 2;
    camera.position.set(cx, cy + Math.sin(CAM_TILT) * dist, Math.cos(CAM_TILT) * dist);
    camera.lookAt(cx, cy, 0);
    camera.updateProjectionMatrix();
    view.top = cy + visH / 2;
  }

  // ---------- Animacija ----------
  const G = 24;
  const clock = new THREE.Clock();
  let running = false;
  let elapsed = 0;

  function step(dt) {
    elapsed += dt;
    mouse.sx += (mouse.x - mouse.sx) * Math.min(1, dt * 3);
    mouse.sy += (mouse.y - mouse.sy) * Math.min(1, dt * 3);
    root.rotation.y = mouse.sx * 0.22 + Math.sin(elapsed * 0.35) * 0.05;
    root.rotation.x = mouse.sy * 0.08;

    const k = 70, c = 9;
    handSpring.v += (-k * handSpring.y - c * handSpring.v) * dt;
    handSpring.y += handSpring.v * dt;
    handSpring.rv += (-k * handSpring.r - c * handSpring.rv) * dt;
    handSpring.r += handSpring.rv * dt;
    const breathe = Math.sin(elapsed * 1.1) * 0.012;
    hand.position.y = handSpring.y + breathe;
    hand.rotation.z = handSpring.r;

    for (const ic of icons) {
      const s = st.get(ic);
      if (s.mode === "hidden") continue;

      if (s.mode === "waiting") { s.delay -= dt; if (s.delay <= 0) s.mode = "falling"; }

      if (s.mode === "falling") {
        s.opacity = Math.min(1, s.opacity + dt * 5);
        s.v -= G * dt;
        s.y += s.v * dt;
        if (ic === coin) s.spin *= Math.pow(0.12, dt);
        if (s.y <= 0) {
          s.y = 0;
          const impact = -s.v;
          if (!s.landed) { handSpring.v -= impact * 0.1; handSpring.rv -= impact * 0.01; s.landed = true; }
          s.squashV += impact * 0.06;
          if (impact > 2.2) s.v = impact * 0.3;
          else { s.v = 0; s.mode = "rest"; s.t = 0; }
        }
      }

      if (s.mode === "rest") {
        s.opacity = Math.min(1, s.opacity + dt * 5);
        s.t += dt;
        s.spin *= Math.pow(0.02, dt);
        s.y = Math.sin(s.t * 1.7) * 0.03 * Math.min(1, s.t);
      }

      if (s.mode === "leaving") {
        s.t += dt;
        const p = Math.min(1, s.t / 0.38);
        const e = p * p;
        s.y += dt * (0.6 + e * 6);
        s.opacity = 1 - e;
        if (p >= 1) { s.mode = "hidden"; ic.visible = false; }
      }

      s.tilt += (0 - s.tilt) * Math.min(1, dt * (s.landed ? 9 : 1.5));
      s.squashV += (-120 * s.squash - 12 * s.squashV) * dt;
      s.squash += s.squashV * dt;
      const sq = THREE.MathUtils.clamp(s.squash, -0.12, 0.18);
      const sc = ic === shop ? 1.08 : 0.95;
      ic.position.set(base.x, base.y + hand.position.y + s.y, base.z);
      ic.scale.set(sc * (1 + sq * 0.6), sc * (1 - sq), sc * (1 + sq * 0.6));
      const idle = s.mode === "rest" ? Math.sin(s.t * 0.8) * 0.45 : 0;
      ic.rotation.y = s.spin + idle + (ic === shop ? -0.35 : 0);
      ic.rotation.z = s.tilt;
      setOpacity(ic, s.opacity);
    }
  }

  function frame() {
    if (!running) return;
    // podkoraci: animacija ide u stvarnom vremenu i kad je frejmrejt nizak
    let dt = Math.min(clock.getDelta(), 0.25);
    while (dt > 0) { const h = Math.min(dt, 1 / 60); step(h); dt -= h; }
    renderer.render(scene, camera);
    requestAnimationFrame(frame);
  }
  function start() { if (running) return; running = true; clock.getDelta(); requestAnimationFrame(frame); }
  function stop() { running = false; }

  resize();
  new ResizeObserver(resize).observe(stage);

  window.addEventListener("hero:phase", (e) => show(e.detail.index));
  const words = [...document.querySelectorAll("[data-rotator] .rw")];
  show(Math.max(0, words.findIndex((w) => w.classList.contains("is-active"))));

  window.addEventListener("pointermove", (e) => {
    mouse.x = (e.clientX / window.innerWidth) * 2 - 1;
    mouse.y = (e.clientY / window.innerHeight) * 2 - 1;
  }, { passive: true });

  new IntersectionObserver((en) => {
    en.forEach((x) => (x.isIntersecting && !document.hidden ? start() : stop()));
  }).observe(stage);
  document.addEventListener("visibilitychange", () => {
    if (document.hidden) stop();
    else if (stage.getBoundingClientRect().bottom > 0) start();
  });

  stage.classList.add("is-3d");
  start();
}

/* Kutija sa zaobljenim ivicama (izvučen zaobljen pravougaonik) */
function roundBox(w, h, d, r) {
  r = Math.min(r, w / 2, h / 2, d / 2);
  const s = new THREE.Shape();
  const x = -w / 2 + r, y = -h / 2 + r, ww = w - 2 * r, hh = h - 2 * r;
  s.moveTo(x, y - r);
  s.lineTo(x + ww, y - r);
  s.quadraticCurveTo(x + ww + r, y - r, x + ww + r, y);
  s.lineTo(x + ww + r, y + hh);
  s.quadraticCurveTo(x + ww + r, y + hh + r, x + ww, y + hh + r);
  s.lineTo(x, y + hh + r);
  s.quadraticCurveTo(x - r, y + hh + r, x - r, y + hh);
  s.lineTo(x - r, y);
  s.quadraticCurveTo(x - r, y - r, x, y - r);
  const g = new THREE.ExtrudeGeometry(s, { depth: d - 2 * r, bevelEnabled: true, bevelThickness: r, bevelSize: r * 0.6, bevelSegments: 3, curveSegments: 6 });
  g.translate(0, 0, -(d - 2 * r) / 2);
  g.computeVertexNormals();
  return g;
}

/* Broj "1" za novčić */
function digitOne() {
  const s = new THREE.Shape();
  s.moveTo(-0.13, -0.27);
  s.lineTo(0.13, -0.27);
  s.lineTo(0.13, -0.19);
  s.lineTo(0.05, -0.19);
  s.lineTo(0.05, 0.28);
  s.lineTo(-0.02, 0.28);
  s.quadraticCurveTo(-0.06, 0.2, -0.15, 0.17);
  s.lineTo(-0.15, 0.1);
  s.quadraticCurveTo(-0.09, 0.11, -0.04, 0.15);
  s.lineTo(-0.04, -0.19);
  s.lineTo(-0.13, -0.19);
  s.closePath();
  return s;
}
