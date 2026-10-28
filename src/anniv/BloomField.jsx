import { useEffect, useRef } from "react";
import { FLOWERS, FOLIAGE, loadImage } from "./sprites";

// Bộ sinh số ngẫu nhiên có seed để vườn lần nào mở cũng giống nhau
function seeded(seed) {
  return () => {
    seed |= 0;
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const SPECIES = Object.keys(FLOWERS);
const PETAL_COLORS = ["#e8566d", "#f4a2b6", "#d9446a", "#f2c65a", "#8f7ccf", "#7fa6e8", "#ef7a3a", "#f6d3dd", "#c74a7c"];
const easeOutBack = (t) => 1 + 2.2 * Math.pow(t - 1, 3) + 1.2 * Math.pow(t - 1, 2);
const clamp01 = (v) => Math.max(0, Math.min(1, v));

// Bố cục: mảng { x, y (đáy, 0..1), h (tỉ lệ chiều cao canvas), sprite, depth }
function meadow(r, n) {
  const out = [];
  for (let i = 0; i < n; i++) {
    const depth = r(); // 0 = xa, 1 = gần
    const foliage = r() < 0.22;
    out.push({
      x: r() * 1.08 - 0.04,
      y: 0.3 + depth * 0.76,
      h: (0.2 + depth * 0.48) * (foliage ? 0.75 : 1) * (0.85 + r() * 0.3),
      depth,
      foliage,
    });
  }
  return out;
}
function frame(r, n) {
  // hoa mọc quanh khung ảnh: dày ở đáy, thưa dần lên hai bên
  const out = [];
  for (let i = 0; i < n; i++) {
    const side = r();
    let x, y, h;
    if (side < 0.55) { x = r(); y = 0.9 + r() * 0.12; h = 0.25 + r() * 0.35; }
    else { const left = side < 0.78; x = left ? r() * 0.16 : 0.84 + r() * 0.16; y = 0.45 + r() * 0.55; h = 0.22 + r() * 0.3; }
    out.push({ x, y, h, depth: r(), foliage: r() < 0.25 });
  }
  return out;
}
function strip(r, n) {
  const out = [];
  for (let i = 0; i < n; i++) {
    // hai đầu cao hơn, giữa thấp để không che chú thích của tấm ảnh
    const x = r() * 1.04 - 0.02, edge = Math.abs(x - 0.5) * 2;
    out.push({ x, y: 1 + r() * 0.05, h: (0.3 + r() * 0.3) * (0.55 + edge * 0.9), depth: 0.5 + r() * 0.5, foliage: r() < 0.5 });
  }
  return out;
}
const LAYOUTS = { meadow, frame, strip };
const BOTTOM_CENTER = [0.5, 1];

export default function BloomField({ layout = "meadow", count = 160, mobileCount, seed = 1, origin = BOTTOM_CENTER, burst = true, className = "", onProgress }) {
  const wrapRef = useRef(null);
  const canvasRef = useRef(null);

  useEffect(() => {
    const wrap = wrapRef.current;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const r = seeded(seed);
    const small = window.innerWidth < 700;
    const n = small && mobileCount ? mobileCount : count;
    const plants = LAYOUTS[layout](r, n).map((p) => {
      let spr;
      if (p.foliage && FOLIAGE.length) spr = FOLIAGE[Math.floor(r() * FOLIAGE.length)];
      else { const list = FLOWERS[SPECIES[Math.floor(r() * SPECIES.length)]]; spr = list[Math.floor(r() * list.length)]; }
      const dx = p.x - origin[0], dy = p.y - origin[1];
      return {
        ...p,
        spr,
        flip: r() < 0.5,
        phase: r() * 6.28,
        speed: 0.0011 + r() * 0.0009,
        amp: 0.035 + r() * 0.03,
        delay: Math.hypot(dx * 1.4, dy) * 1700 + r() * 380,
        push: 0,
        pushT: 0,
        bounce: 0,
      };
    });
    plants.sort((a, b) => a.y - b.y);

    let W = 0, H = 0, dpr = 1, raf = 0, start = 0, visible = false, running = false, lastProgress = -1;
    const imgs = new Map();
    const particles = [];
    const pointer = { x: -1e4, y: -1e4, vx: 0 };

    function resize() {
      dpr = Math.min(window.devicePixelRatio || 1, small ? 1.5 : 1.75);
      W = wrap.clientWidth; H = wrap.clientHeight;
      canvas.width = Math.round(W * dpr); canvas.height = Math.round(H * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    }

    function spawnBurst(x, y, k, power = 1) {
      for (let i = 0; i < k; i++) {
        const a = -Math.PI / 2 + (Math.random() - 0.5) * Math.PI * 1.6, v = (2 + Math.random() * 7) * power;
        particles.push({ x, y, vx: Math.cos(a) * v, vy: Math.sin(a) * v, rot: Math.random() * 6.28, vr: (Math.random() - 0.5) * 0.3, life: 1, size: 4 + Math.random() * 6, color: PETAL_COLORS[Math.floor(Math.random() * PETAL_COLORS.length)] });
      }
    }

    function draw(now) {
      raf = 0;
      if (!running) return;
      const t = now - start;
      ctx.clearRect(0, 0, W, H);
      // màn hình hẹp: hoa nhỏ lại theo bề ngang để vẫn thấy cả vườn
      const S = layout === "meadow" ? Math.min(H, W * 1.15) : H;
      let done = 0;
      for (const p of plants) {
        const pair = imgs.get(p.spr.color), sk = imgs.get(p.spr.sketch);
        if (!pair) continue;
        const life = reduce ? 1e9 : t - p.delay;
        if (life <= 0) continue;
        const grow = reduce ? 1 : easeOutBack(clamp01(life / 900));
        const sketchReveal = reduce ? 1 : clamp01(life / 650);
        const colorA = reduce ? 1 : clamp01((life - 450) / 900);
        if (colorA >= 1) done++;
        const h = p.h * S, w = h * (pair.width / pair.height);
        const bx = p.x * W, by = p.y * H;
        // gió: lắc nhẹ + cơn gió lướt từ trái sang phải
        const gust = Math.pow(Math.max(0, Math.sin(now * 0.00055 - p.x * 2.2)), 6) * 0.11;
        // tay rê qua: ngả ra rồi bật về như lò xo
        const headY = by - h * 0.75;
        const d = Math.hypot(bx - pointer.x, headY - pointer.y), rad = Math.max(70, h * 0.6);
        p.pushT = d < rad ? (bx > pointer.x ? 1 : -1) * (1 - d / rad) * 0.38 + pointer.vx * 0.004 : 0;
        p.push += (p.pushT - p.push) * 0.12;
        p.bounce *= 0.93;
        const sway = Math.sin(now * p.speed + p.phase) * p.amp + gust + p.push + Math.sin(now * 0.02) * p.bounce;
        ctx.save();
        ctx.translate(bx, by);
        ctx.rotate(sway);
        ctx.scale((p.flip ? -1 : 1) * grow, grow * (1 + p.bounce * 0.2));
        ctx.globalAlpha = 0.72 + p.depth * 0.28;
        if (colorA < 1 && sk) {
          ctx.save();
          ctx.beginPath(); ctx.rect(-w, -h * sketchReveal, w * 2, h * sketchReveal); ctx.clip();
          ctx.drawImage(sk, -w / 2, -h, w, h);
          ctx.restore();
        }
        if (colorA > 0) {
          ctx.globalAlpha *= colorA;
          ctx.drawImage(pair, -w / 2, -h, w, h);
        }
        ctx.restore();
      }
      // cánh hoa bay
      for (let i = particles.length - 1; i >= 0; i--) {
        const q = particles[i];
        q.vy += 0.12; q.vx *= 0.99; q.x += q.vx; q.y += q.vy; q.rot += q.vr; q.life -= 0.008;
        if (q.life <= 0 || q.y > H + 20) { particles.splice(i, 1); continue; }
        ctx.save(); ctx.translate(q.x, q.y); ctx.rotate(q.rot);
        ctx.globalAlpha = Math.min(1, q.life * 1.5) * 0.85;
        ctx.fillStyle = q.color;
        ctx.beginPath(); ctx.ellipse(0, 0, q.size, q.size * 0.55, 0, 0, 6.283); ctx.fill();
        ctx.strokeStyle = "rgba(90,60,50,0.35)"; ctx.lineWidth = 0.6; ctx.stroke();
        ctx.restore();
      }
      pointer.vx *= 0.85;
      const prog = Math.round((done / plants.length) * 100);
      if (onProgress && prog !== lastProgress) { lastProgress = prog; onProgress(prog); }
      raf = requestAnimationFrame(draw);
    }

    function play() {
      if (running) return;
      running = true;
      if (!start) {
        start = performance.now();
        if (burst && !reduce) {
          setTimeout(() => spawnBurst(origin[0] * W, origin[1] * H - H * 0.15, small ? 60 : 120, small ? 1 : 1.4), 250);
          setTimeout(() => spawnBurst(origin[0] * W, origin[1] * H - H * 0.25, small ? 40 : 80, 1.2), 900);
        }
      }
      raf = requestAnimationFrame(draw);
    }
    function pause() {
      running = false;
      cancelAnimationFrame(raf);
    }

    // tải sprite rồi mới cho nở
    const urls = new Set();
    plants.forEach((p) => { urls.add(p.spr.color); if (p.spr.sketch) urls.add(p.spr.sketch); });
    let alive = true;
    Promise.all([...urls].map((u) => loadImage(u).then((img) => img && imgs.set(u, img)))).then(() => {
      if (alive && visible) play();
    });

    const io = new IntersectionObserver(([e]) => {
      visible = e.isIntersecting;
      if (visible && imgs.size) play();
      else if (!visible) pause();
    }, { threshold: 0.3 });
    io.observe(wrap);

    function local(e) {
      const rc = canvas.getBoundingClientRect();
      return [e.clientX - rc.left, e.clientY - rc.top];
    }
    function onMove(e) {
      const [x, y] = local(e);
      pointer.vx = x - pointer.x > 200 ? 0 : x - pointer.x;
      pointer.x = x; pointer.y = y;
    }
    function onLeave() { pointer.x = -1e4; pointer.y = -1e4; }
    function onDown(e) {
      const [x, y] = local(e);
      spawnBurst(x, y, 18, 0.6);
      for (const p of plants) {
        const d = Math.hypot(p.x * W - x, p.y * H - p.h * H * 0.75 - y);
        if (d < 110) p.bounce = 0.12 * (1 - d / 110);
      }
    }
    resize();
    const ro = new ResizeObserver(resize);
    ro.observe(wrap);
    wrap.addEventListener("pointermove", onMove);
    wrap.addEventListener("pointerleave", onLeave);
    wrap.addEventListener("pointerdown", onDown);
    return () => {
      alive = false;
      pause();
      io.disconnect();
      ro.disconnect();
      wrap.removeEventListener("pointermove", onMove);
      wrap.removeEventListener("pointerleave", onLeave);
      wrap.removeEventListener("pointerdown", onDown);
    };
  }, [layout, count, mobileCount, seed, origin, burst, onProgress]);

  return (
    <div ref={wrapRef} className={`bloom-field ${className}`}>
      <canvas ref={canvasRef} aria-hidden="true" />
    </div>
  );
}
