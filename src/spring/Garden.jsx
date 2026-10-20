import { useEffect, useMemo, useRef, useState } from "react";
import Flower, { FlowerDefs } from "./Flower";
import { PALETTE } from "./palette";
import { ROSES, DAISIES, TULIPS } from "./heads";

// Bộ sinh số ngẫu nhiên có seed để vườn hoa lần nào mở cũng giống nhau
function seeded(seed) {
  return () => {
    seed |= 0;
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

// hồng nhiều lớp và cúc họa mi là chính, thêm tulip và điểm xuyết cúc mâm xôi
function pickType(r) {
  const v = r();
  if (v < 0.48) return "rose";
  if (v < 0.78) return "daisy";
  if (v < 0.96) return "tulip";
  return "mum";
}

// Mỗi lớp: số bông, chiều cao (% vườn), vị trí đáy (%)
const LAYERS = [
  { name: "far", count: 56, h: [12, 17], bottom: [42, 56], seed: 11 },
  { name: "back", count: 40, h: [19, 26], bottom: [26, 42], seed: 17 },
  { name: "mid", count: 32, h: [28, 38], bottom: [4, 24], seed: 23 },
  { name: "hero", count: 1, h: [60, 60], bottom: [-4, -4], seed: 5 },
  { name: "near", count: 10, h: [62, 84], bottom: [-26, -12], seed: 37 },
];

const GROW_BASE = { far: 0, back: 0.2, mid: 0.4, hero: 0.6, near: 0.8 };

function makeFlowers({ count, h, bottom, seed, name }) {
  const r = seeded(seed);
  return Array.from({ length: count }, (_, i) => {
    const type = name === "hero" ? "rose" : pickType(r);
    const list = PALETTE[type] || [];
    const color = list[Math.floor(r() * list.length)];
    let img;
    if (type === "rose") img = name === "hero" ? ROSES[16] : ROSES[Math.floor(r() * ROSES.length)];
    if (type === "daisy") img = DAISIES[Math.floor(r() * DAISIES.length)];
    if (type === "tulip") img = TULIPS[Math.floor(r() * TULIPS.length)];
    let x = ((i + r() * 0.9) / count) * 100;
    if (name === "near") x = i % 2 === 0 ? r() * 22 - 6 : 84 + r() * 22 - 6;
    if (name === "hero") x = 50;
    // cúc họa mi nhỏ hơn hồng một chút
    const hh = (h[0] + r() * (h[1] - h[0])) * (type === "daisy" ? 0.85 : 1);
    return {
      id: `${name}-${i}`,
      type,
      color,
      img,
      x: x - hh / 4,
      h: hh,
      bottom: bottom[0] + r() * (bottom[1] - bottom[0]),
      lean: r() * 12 - 6,
      grow: r() * 1.2 + GROW_BASE[name],
      sway: 3.2 + r() * 2.4,
      swayDelay: -r() * 5,
      // cơn gió thổi từ trái sang phải: hoa bên trái nghiêng trước
      gustDelay: (x / 100) * 1.6 + r() * 0.3,
    };
  });
}

const BURST_COLORS = ["#f7a1b5", "#ffd6a5", "#ee6a8c", "#ffffff", "#cbb4f3", "#b5e3a1", "#98c6f0"];

export default function Garden() {
  const ref = useRef(null);
  const [inView, setInView] = useState(false);
  const [bursts, setBursts] = useState([]);
  const layers = useMemo(() => LAYERS.map((l) => ({ ...l, flowers: makeFlowers(l) })), []);

  // hoa mọc lên khi vườn hiện ra
  useEffect(() => {
    const el = ref.current;
    const obs = new IntersectionObserver(
      ([e]) => {
        if (e.isIntersecting) {
          setInView(true);
          obs.disconnect();
        }
      },
      { threshold: 0.2 }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  // cuộn: thị sai giữa các lớp + đổi điểm lấy nét từ xa tới gần
  useEffect(() => {
    const el = ref.current;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    let raf = 0;
    function update() {
      raf = 0;
      const rect = el.getBoundingClientRect();
      const vh = window.innerHeight;
      const t = Math.min(1, Math.max(0, (vh - rect.top) / (vh + rect.height)));
      el.style.setProperty("--p", (t * 2 - 1).toFixed(3));
      if (!reduce) {
        const blur = (focus, k) => Math.min(6, Math.abs(t - focus) * k).toFixed(2) + "px";
        el.style.setProperty("--blur-far", blur(0.25, 8));
        el.style.setProperty("--blur-back", blur(0.4, 6));
        el.style.setProperty("--blur-mid", blur(0.55, 5));
        el.style.setProperty("--blur-near", blur(0.8, 9));
      }
    }
    const onScroll = () => {
      if (!raf) raf = requestAnimationFrame(update);
    };
    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, []);

  // rê tay / ngón tay qua vườn: hoa gần đó ngả ra như bị gió từ tay thổi
  useEffect(() => {
    const el = ref.current;
    const flowers = [...el.querySelectorAll(".flower.touchable")];
    let raf = 0;
    let last = null;
    let prevX = null;
    const bent = new Set();

    function apply() {
      raf = 0;
      if (!last) return;
      const { x, y } = last;
      const dir = prevX == null ? 0 : Math.sign(x - prevX);
      prevX = x;
      for (const f of flowers) {
        const r = f.getBoundingClientRect();
        const dx = r.left + r.width / 2 - x;
        const dist = Math.hypot(dx, r.top + r.height * 0.25 - y);
        const radius = Math.max(90, r.width * 1.6);
        if (dist < radius) {
          const k = 1 - dist / radius;
          const push = (dx >= 0 ? 1 : -1) * 16 * k + dir * 6 * k;
          f.style.setProperty("--push", `${push.toFixed(1)}deg`);
          bent.add(f);
        } else if (bent.has(f)) {
          f.style.setProperty("--push", "0deg");
          bent.delete(f);
        }
      }
    }
    function onMove(e) {
      const rect = el.getBoundingClientRect();
      el.style.setProperty("--mx", (((e.clientX - rect.left) / rect.width) * 2 - 1).toFixed(3));
      last = { x: e.clientX, y: e.clientY };
      if (!raf) raf = requestAnimationFrame(apply);
    }
    function onLeave() {
      last = null;
      prevX = null;
      bent.forEach((f) => f.style.setProperty("--push", "0deg"));
      bent.clear();
    }
    el.addEventListener("pointermove", onMove);
    el.addEventListener("pointerleave", onLeave);
    el.addEventListener("pointerup", onLeave);
    el.addEventListener("pointercancel", onLeave);
    return () => {
      cancelAnimationFrame(raf);
      el.removeEventListener("pointermove", onMove);
      el.removeEventListener("pointerleave", onLeave);
      el.removeEventListener("pointerup", onLeave);
      el.removeEventListener("pointercancel", onLeave);
    };
  }, []);

  // chạm: bông được chạm nảy lên + tung một chùm cánh hoa
  function burst(e) {
    const flower = e.target.closest(".flower.touchable");
    if (flower) {
      flower.classList.remove("tapped");
      void flower.offsetWidth;
      flower.classList.add("tapped");
      setTimeout(() => flower.classList.remove("tapped"), 900);
    }
    const rect = ref.current.getBoundingClientRect();
    const id = Date.now() + Math.random();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const pieces = Array.from({ length: 14 }, (_, i) => {
      const a = (i / 14) * Math.PI * 2 + Math.random() * 0.4;
      const d = 40 + Math.random() * 70;
      return {
        dx: Math.cos(a) * d,
        dy: Math.sin(a) * d - 30,
        rot: Math.random() * 360,
        color: BURST_COLORS[i % BURST_COLORS.length],
      };
    });
    setBursts((b) => [...b, { id, x, y, pieces }]);
    setTimeout(() => setBursts((b) => b.filter((p) => p.id !== id)), 1200);
  }

  return (
    <div ref={ref} className={`garden ${inView ? "in-view" : ""}`} onPointerDown={burst}>
      <FlowerDefs />
      <svg className="hills" viewBox="0 0 1440 400" preserveAspectRatio="none" aria-hidden="true">
        <path d="M0 210 Q240 120 480 190 T960 170 T1440 180 V400 H0Z" fill="#c4e8ad" />
        <path d="M0 260 Q300 190 620 250 T1200 230 T1440 240 V400 H0Z" fill="#a5d98f" />
        <path d="M0 320 Q360 260 760 310 T1440 300 V400 H0Z" fill="#86c975" />
      </svg>

      {layers.map((layer) => (
        <div key={layer.name} className={`garden-layer layer-${layer.name}`}>
          {layer.flowers.map((f) => (
            <div
              key={f.id}
              className={`flower flower-${f.type} ${layer.name === "far" ? "" : "touchable"}`}
              style={{
                left: `${f.x}%`,
                bottom: `${f.bottom}%`,
                height: `calc(${f.h}% * var(--fs))`,
                "--grow": `${f.grow}s`,
                "--sway": `${f.sway}s`,
                "--sway-delay": `${f.swayDelay}s`,
                "--gust-delay": `${f.gustDelay}s`,
              }}
            >
              <div className="flower-gust">
                <div className="flower-push">
                  <div className="flower-sway">
                    <Flower type={f.type} color={f.color} lean={f.lean} img={f.img} />
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      ))}

      <div className="bokeh" aria-hidden="true">
        {Array.from({ length: 12 }, (_, i) => (
          <span key={i} style={{ "--i": i }} />
        ))}
      </div>

      <div className="butterflies" aria-hidden="true">
        {["#ff8fab", "#ffd23f", "#9b8cff"].map((c, i) => (
          <div key={c} className={`butterfly butterfly-${i}`} style={{ "--wing": c }}>
            <svg viewBox="0 0 40 30">
              <g className="wing wing-l">
                <path d="M20 15 Q6 -2 2 8 Q0 18 20 15Z" />
                <path d="M20 16 Q8 30 4 24 Q4 18 20 16Z" />
              </g>
              <g className="wing wing-r">
                <path d="M20 15 Q34 -2 38 8 Q40 18 20 15Z" />
                <path d="M20 16 Q32 30 36 24 Q36 18 20 16Z" />
              </g>
              <rect x="19" y="8" width="2" height="16" rx="1" fill="#3a2a2a" />
            </svg>
          </div>
        ))}
      </div>

      {bursts.map((b) => (
        <div key={b.id} className="burst" style={{ left: b.x, top: b.y }} aria-hidden="true">
          {b.pieces.map((p, i) => (
            <span
              key={i}
              style={{ "--dx": `${p.dx}px`, "--dy": `${p.dy}px`, "--rot": `${p.rot}deg`, background: p.color }}
            />
          ))}
        </div>
      ))}

      <p className="garden-hint">rê tay hoặc chạm vào hoa thử xem</p>
    </div>
  );
}
