import { useEffect, useRef } from "react";
import FadeLine from "../FadeLine";
import Garden from "./Garden";
import DaysTogether from "./DaysTogether";
import { springBefore, springAfter } from "../content";
import { CLOUDS, WISPS } from "./clouds";
import "./spring.css";

const PETAL_COLORS = ["#ff8fab", "#ffc2d4", "#ff4d6d", "#fff0f3", "#ffd35a", "#d7b8ff"];

function Petals() {
  return (
    <div className="petals" aria-hidden="true">
      {Array.from({ length: 22 }, (_, i) => (
        <span
          key={i}
          style={{
            left: `${(i * 37) % 100}%`,
            background: PETAL_COLORS[i % PETAL_COLORS.length],
            animationDuration: `${9 + ((i * 7) % 8)}s, ${2.5 + (i % 4) * 0.6}s`,
            animationDelay: `${-((i * 13) % 15)}s, ${-(i % 5) * 0.4}s`,
            "--size": `${8 + ((i * 5) % 9)}px`,
            "--drift": `${((i * 29) % 120) - 60}px`,
          }}
        />
      ))}
    </div>
  );
}

// Các cụm mây trong dải mây: hàng trên nhỏ và thưa, hàng dưới to và dày đặc
const BANK = Array.from({ length: 19 }, (_, i) => {
  const row = i < 6 ? 0 : i < 12 ? 1 : 2;
  const n = row === 2 ? 7 : 6;
  const k = row === 0 ? i : row === 1 ? i - 6 : i - 12;
  const jitter = ((i * 37) % 10) / 10;
  return {
    src: CLOUDS[(i * 5) % CLOUDS.length],
    x: (k / (n - 1)) * 110 - 5 + (row === 1 ? 8 : 0) + jitter * 5,
    y: [34, 55, 78][row] + ((i * 13) % 7) - 3,
    w: [34, 52, 70][row] + jitter * 14,
    flip: i % 2 === 1,
    dur: 16 + ((i * 7) % 12),
    delay: -((i * 3) % 12),
    row,
  };
});

const renderLines = (lines, prefix) =>
  lines.map((l, i) => (
    <FadeLine key={`${prefix}-${i}`} text={l.text} size={l.size} special={l.special} rainbow={l.rainbow} />
  ));

export default function SpringSection() {
  const ref = useRef(null);

  // chỉ cho cánh hoa rơi khi đang ở trong phần trời nắng
  useEffect(() => {
    const el = ref.current;
    const obs = new IntersectionObserver(([e]) => el.classList.toggle("petals-on", e.isIntersecting), {
      threshold: 0,
    });
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  return (
    <section className="spring">
      <div className="cloud-bank" aria-hidden="true">
        <div className="bank-clouds">
        {BANK.map((c, i) => (
          <img
            key={i}
            src={c.src}
            alt=""
            className={`bank-cloud row-${c.row}`}
            style={{
              left: `${c.x}%`,
              top: `${c.y}%`,
              width: `${c.w}vmax`,
              "--flip": c.flip ? -1 : 1,
              animationDuration: `${c.dur}s`,
              animationDelay: `${c.delay}s`,
            }}
          />
        ))}
        </div>
      </div>

      <div ref={ref} className="spring-body">

      <div className="sky" id="hoa-20-10">
        <div className="sky-wisps" aria-hidden="true" style={{ backgroundImage: `url(${WISPS})` }} />
        <div className="sky-wisps far" aria-hidden="true" style={{ backgroundImage: `url(${WISPS})` }} />
        <div className="sun" aria-hidden="true" />
        <div className="sky-clouds" aria-hidden="true">
          {[2, 4, 0, 5].map((c, i) => (
            <img key={i} src={CLOUDS[c]} alt="" />
          ))}
        </div>
        <p className="spring-date">20 · 10</p>
        <h2 className="spring-title">
          Gửi cô gái
          <span>của Đông</span>
        </h2>
        <p className="spring-sub">một vườn hoa nho nhỏ, nở riêng cho Tiên</p>
      </div>

      <Garden />

      <div className="meadow">
        <article className="spring-card letter">
          {renderLines(springBefore, "sb")}
          <DaysTogether />
          {renderLines(springAfter, "sa")}
          <p className="spring-sign">Đông</p>
        </article>
      </div>

        <Petals />
      </div>
    </section>
  );
}
