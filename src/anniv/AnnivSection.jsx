import { useEffect, useRef, useState } from "react";
import FadeLine from "../FadeLine";
import BloomField from "./BloomField";
import { PerchedBird, Hoverer, Swallow } from "./Birds";
import { MEMORIES } from "./sprites";
import { annivIntro, annivChapters, annivClosing } from "../content";
import paper from "../assets/anniv/paper.webp";
import "./anniv.css";

const ROMAN = ["I", "II", "III", "IV", "V", "VI", "VII", "VIII", "IX", "X"];
const START = new Date(2025, 0, 28);
const PERCHERS = ["robin", "bluetit", "goldfinch", "sparrow"];
const HERO_ORIGIN = [0.5, 0.95];
const FINALE_ORIGIN = [0.5, 1];
const SKY_AREA = [0.05, 0.05, 0.85, 0.4];
const LOW_AREA = [0.05, 0.35, 0.85, 0.45];

// khung ảnh trống chỉ hiện khi xem trước (?xem-truoc), để trang không lộ chỗ trống
const PREVIEW = typeof window !== "undefined" && /xem-truoc/.test(window.location.search + window.location.hash);

function daysTogether() {
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  return Math.round((today - START) / 86400000);
}

const renderLines = (lines, prefix) =>
  lines.map((l, i) => <FadeLine key={`${prefix}-${i}`} text={l.text} size={l.size} special={l.special} rainbow={l.rainbow} />);

function DrawingProgress({ value }) {
  const step = value < 34 ? 1 : value < 80 ? 2 : 3;
  const label = ["Phác thảo nét chì…", "Tô màu từng cánh hoa…", "Đan nét chì chéo, gân hoa & lông vũ…"][step - 1];
  return (
    <div className={`drawing-progress ${value >= 100 ? "done" : ""}`} aria-hidden="true">
      <span className="dp-dot" />
      <span className="dp-label">Bước {step}/3: {label}</span>
      <span className="dp-pct">{value}%</span>
    </div>
  );
}

function HeroGarden() {
  const [progress, setProgress] = useState(0);
  return (
    <div className="anniv-hero-garden">
      <DrawingProgress value={progress} />
      <div className="field-box hero-field">
        <BloomField layout="meadow" count={260} mobileCount={140} seed={28} origin={HERO_ORIGIN} onProgress={setProgress} />
        <Swallow top="6%" size={96} duration={17} />
        <Swallow top="16%" size={70} duration={22} delay={-9} reverse />
        <Hoverer kind="humming" size={74} area={SKY_AREA} />
        <Hoverer kind="humming" size={60} area={LOW_AREA} tempo={1.3} />
        <Hoverer kind="blue" butterfly size={46} area={LOW_AREA} />
        <Hoverer kind="rose" butterfly size={40} area={SKY_AREA} tempo={1.2} />
        <Hoverer kind="lemon" butterfly size={38} area={LOW_AREA} tempo={0.9} />
        <p className="field-hint">rê tay hoặc chạm vào vườn hoa</p>
      </div>
    </div>
  );
}

function Plate({ index, photo, caption }) {
  const flip = index % 2 === 1;
  if (!photo && !PREVIEW) return null;
  return (
    <figure className={`plate-wrap ${flip ? "flip" : ""}`}>
      <div className="field-box plate-back">
        <BloomField layout="frame" count={60} mobileCount={36} seed={100 + index * 7} burst={false} />
      </div>
      <div className="plate">
        <div className="plate-head">
          <span>FLORA &amp; AMOR ILLUSTRATA</span>
          <span>FIG. {ROMAN[index]} — TAB. {index + 1}</span>
        </div>
        <div className="plate-photo">
          {photo ? <img src={photo} alt={caption} loading="lazy" /> : <div className="plate-empty">Ảnh {index + 1}</div>}
          <span className="corner tl" /><span className="corner tr" /><span className="corner bl" /><span className="corner br" />
        </div>
        <figcaption>
          <em>Memoria {ROMAN[index]}</em>
          <span>{caption}</span>
        </figcaption>
        <PerchedBird kind={PERCHERS[index % PERCHERS.length]} left={flip ? "62%" : "18%"} size={78} flip={flip} delay={index * 300} />
      </div>
      <div className="field-box plate-front">
        <BloomField layout="strip" count={22} mobileCount={14} seed={300 + index * 11} burst={false} />
      </div>
    </figure>
  );
}

export default function AnnivSection() {
  const ref = useRef(null);
  const days = daysTogether();

  // đặt biến --paper để mọi phần dùng chung giấy cũ
  useEffect(() => {
    ref.current.style.setProperty("--paper", `url(${paper})`);
  }, []);

  return (
    <section ref={ref} className="anniv">
      <div className="anniv-sheet">
        <header className="anniv-title-plate" id="ky-niem">
          <div className="plate-head">
            <span>FLORA &amp; AMOR ILLUSTRATA</span>
            <span>FIG. XXI — TAB. {days}</span>
          </div>
          <p className="anniv-kicker">Kỷ niệm của Đông &amp; Tiên</p>
          <h2 className="anniv-title">Một năm chín tháng</h2>
          <p className="anniv-dates">28 · 01 · 2025 &nbsp;—&nbsp; 28 · 10 · 2026</p>
          <p className="anniv-days">
            <strong>{days}</strong> ngày thương nhau
          </p>
          <p className="anniv-latin">Ad amorem delineavit et coloravit manu propria</p>
          <div className="stamp" aria-hidden="true">
            <span>MUSEUM AMORIS</span>
            <b>ANNO 2025</b>
            <span>Đ · T</span>
          </div>
        </header>

        <HeroGarden />

        <article className="anniv-letter letter">{renderLines(annivIntro, "ai")}</article>

        {annivChapters.map((ch, i) => (
          <div key={i} className="chapter">
            <Plate index={i} photo={MEMORIES[i]} caption={ch.caption} />
            <article className="anniv-letter letter">{renderLines(ch.lines, `ch${i}`)}</article>
          </div>
        ))}

        <div className="anniv-finale">
          <article className="anniv-letter letter">
            {renderLines(annivClosing, "ac")}
            <div className="anniv-sign">
              <p>Của Tiên,</p>
              <p className="name">Đông</p>
              <p className="date">28 - 10 - 2026</p>
            </div>
          </article>
          <div className="field-box finale-field">
            <BloomField layout="meadow" count={200} mobileCount={110} seed={2810} origin={FINALE_ORIGIN} />
            <Swallow top="8%" size={84} duration={19} delay={-4} />
            <Hoverer kind="humming" size={66} area={SKY_AREA} />
            <Hoverer kind="peach" butterfly size={42} area={LOW_AREA} />
          </div>
        </div>
      </div>
    </section>
  );
}
