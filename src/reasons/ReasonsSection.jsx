import { useEffect, useRef, useState } from "react";
import { FLOWERS } from "../anniv/sprites";
import { reasons } from "./reasons";
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
      <div className="reasons-end">
        <p>Còn nữa, Đông ghi tiếp sau.</p>
        <p className="love">Thương Tiên nhiều lắm.</p>
      </div>
    </section>
  );
}
