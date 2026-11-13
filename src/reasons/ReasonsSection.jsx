import { useEffect, useRef, useState } from "react";
import { FLOWERS } from "../anniv/sprites";
import { reasons, hundred } from "./reasons";
import paper from "../assets/anniv/paper.webp";
import "./reasons.css";

// Một tấm nhãn tiêu bản thực vật: số thứ tự, bông hoa ép, lý do
function Specimen({ r, i }) {
  const ref = useRef(null);
  const [seen, setSeen] = useState(false);
  useEffect(() => {
    const io = new IntersectionObserver(([e]) => {
      if (e.isIntersecting) { setSeen(true); io.disconnect(); }
    }, { threshold: 0.25 });
    io.observe(ref.current);
    return () => io.disconnect();
  }, []);
  const list = FLOWERS[r.flower] || [];
  const img = list[i % Math.max(1, list.length)]?.color;
  return (
    <li ref={ref} className={`specimen ${seen ? "in" : ""}`} style={{ "--i": i % 2 }}>
      <span className="spec-no">N° {String(i + 1).padStart(2, "0")}</span>
      {img && <img className="spec-flower" src={img} alt="" loading="lazy" />}
      <div className="spec-body">
        <h3>{r.title}</h3>
        <p>{r.text}</p>
      </div>
    </li>
  );
}

const BULLETS = ["rose", "cosmos", "forgetmenot", "daisy", "sweetpea", "tulip", "peony", "anemone"];
const STEP = 20;

// 100 điều Đông thương ở Tiên: trang giấy kẻ dòng, mở dần từng đợt
function Hundred() {
  const [shown, setShown] = useState(STEP);
  const list = hundred.slice(0, -1);
  const last = hundred[hundred.length - 1];
  return (
    <div className="hundred">
      <div className="plate-head">
        <span>CENTUM CAUSAE</span>
        <span>{Math.min(shown, list.length)}/100</span>
      </div>
      <h3 className="hundred-title">100 điều Đông thương ở Tiên</h3>
      <ol className="hundred-list">
        {list.slice(0, shown).map((t, i) => {
          const f = FLOWERS[BULLETS[i % BULLETS.length]] || [];
          return (
            <li key={i} style={{ "--d": `${(i % STEP) * 40}ms` }}>
              <span className="h-no">{i + 1}</span>
              {f[0] && <img src={f[(i >> 3) % f.length].color} alt="" loading="lazy" />}
              <span className="h-text">{t}</span>
            </li>
          );
        })}
      </ol>
      {shown < list.length ? (
        <button type="button" className="hundred-more" onClick={() => setShown((n) => n + STEP)}>
          Xem thêm {Math.min(STEP, list.length - shown)} điều nữa nè
        </button>
      ) : (
        <p className="hundred-last">
          <span className="h-no big">100</span>
          {last}
        </p>
      )}
    </div>
  );
}

export default function ReasonsSection() {
  return (
    <section className="reasons" id="ly-do" style={{ "--paper": `url(${paper})` }}>
      <header className="reasons-head">
        <div className="plate-head">
          <span>HERBARIUM AMORIS</span>
          <span>13 · 11 · 2026</span>
        </div>
        <p className="reasons-kicker">Ghi chép từ sổ tay của Tiên</p>
        <h2>Những lý do Đông ghiền Tiên</h2>
        <p className="reasons-sub">Đông đọc hết sổ của Tiên rồi, ghi lại mấy cái làm Đông ghiền nè.</p>
      </header>
      <ol className="specimens">
        {reasons.map((r, i) => (
          <Specimen key={i} r={r} i={i} />
        ))}
      </ol>
      <Hundred />
      <div className="reasons-end">
        <p>Còn nữa, Đông ghi tiếp sau.</p>
        <p className="love">Thương Tiên nhiều lắm.</p>
      </div>
    </section>
  );
}
