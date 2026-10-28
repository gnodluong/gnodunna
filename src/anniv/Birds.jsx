import { useEffect, useRef } from "react";
import { BIRD } from "./sprites";

const DEFAULT_AREA = [0.05, 0.1, 0.9, 0.6];

// Chim đậu: thở nhẹ, nghiêng đầu, thỉnh thoảng vỗ cánh và nhảy qua lại trên mép khung
export function PerchedBird({ kind = "robin", left = "20%", size = 84, range = 0.5, flip = false, delay = 0 }) {
  const ref = useRef(null);
  useEffect(() => {
    const el = ref.current;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduce) return;
    let x = 0, dir = flip ? -1 : 1, timer;
    const host = el.parentElement;
    function hop() {
      const span = host.clientWidth * range;
      const step = (40 + Math.random() * 70) * (Math.random() < 0.35 ? -1 : 1) * dir;
      let nx = x + step;
      if (Math.abs(nx) > span / 2) { dir *= -1; nx = x - step; }
      dir = nx > x ? 1 : -1;
      x = nx;
      el.style.setProperty("--hx", `${x}px`);
      el.style.setProperty("--face", dir);
      el.classList.remove("hop"); void el.offsetWidth; el.classList.add("hop");
      if (Math.random() < 0.5) setTimeout(() => { el.classList.remove("flick"); void el.offsetWidth; el.classList.add("flick"); }, 600);
      timer = setTimeout(hop, 2600 + Math.random() * 3800);
    }
    timer = setTimeout(hop, 1500 + delay);
    return () => clearTimeout(timer);
  }, [range, flip, delay]);
  const b = BIRD[kind];
  return (
    <div ref={ref} className={`bird perched bird-${kind}`} style={{ left, width: size, "--face": flip ? -1 : 1 }} aria-hidden="true">
      <div className="bird-inner">
        <img className="bird-body" src={b.bird} alt="" draggable="false" />
        <img className="bird-wing" src={b.wing} alt="" draggable="false" />
      </div>
    </div>
  );
}

// Chim ruồi / bướm: bay lượn tới chỗ ngẫu nhiên trong khung chứa
export function Hoverer({ kind = "humming", size = 70, butterfly = false, area = DEFAULT_AREA, tempo = 1 }) {
  const ref = useRef(null);
  useEffect(() => {
    const el = ref.current;
    const host = el.parentElement;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    let timer, px = 0;
    function go() {
      const W = host.clientWidth, H = host.clientHeight;
      const x = (area[0] + Math.random() * area[2]) * W, y = (area[1] + Math.random() * area[3]) * H;
      el.style.setProperty("--face", x >= px ? 1 : -1);
      el.style.transform = `translate(${x}px, ${y}px)`;
      px = x;
      timer = setTimeout(go, (butterfly ? 3200 : 2300) * tempo + Math.random() * 2200);
    }
    if (!reduce) go(); else el.style.transform = `translate(${area[0] * host.clientWidth}px, ${area[1] * host.clientHeight}px)`;
    return () => clearTimeout(timer);
  }, [area, butterfly, tempo]);
  if (butterfly) {
    const src = BIRD[kind]?.butterfly;
    return (
      <div ref={ref} className="hoverer butterfly-sprite" style={{ width: size }} aria-hidden="true">
        <div className="bf-inner">
          <img className="bf-wing bf-l" src={src} alt="" draggable="false" />
          <img className="bf-wing bf-r" src={src} alt="" draggable="false" />
        </div>
      </div>
    );
  }
  const b = BIRD[kind];
  return (
    <div ref={ref} className={`hoverer bird bird-${kind}`} style={{ width: size }} aria-hidden="true">
      <div className="bird-inner">
        <img className="bird-wing wing-back" src={b.wing} alt="" draggable="false" />
        <img className="bird-body" src={b.bird} alt="" draggable="false" />
        <img className="bird-wing" src={b.wing} alt="" draggable="false" />
      </div>
    </div>
  );
}

// Én bay ngang trời theo đường lượn sóng
export function Swallow({ top = "10%", size = 90, duration = 16, delay = 0, reverse = false }) {
  const b = BIRD.swallow;
  return (
    <div
      className={`swallow ${reverse ? "rev" : ""}`}
      style={{ top, width: size, animationDuration: `${duration}s`, animationDelay: `${delay}s` }}
      aria-hidden="true"
    >
      <div className="bird bird-swallow">
        <div className="bird-inner">
          <img className="bird-wing wing-back" src={b.wing} alt="" draggable="false" />
          <img className="bird-body" src={b.bird} alt="" draggable="false" />
          <img className="bird-wing" src={b.wing} alt="" draggable="false" />
        </div>
      </div>
    </div>
  );
}
