import { useState } from "react";
import GalaxyBackground from "./GalaxyBackground";
import FadeLine from "./FadeLine";
import BirthdaySection from "./BirthdaySection";
import BackgroundMusic from "./BackgroundMusic";
import SpringSection from "./spring/SpringSection";
import CloudTransition from "./spring/CloudTransition";
import { letter, letter2 } from "./content";
import "./App.css";

export default function App() {
  const [cloudPhase, setCloudPhase] = useState("idle");

  // bấm mục 20/10: bay xuyên qua đám mây rồi hiện ra giữa trời nắng
  function flyToSpring(e) {
    e.preventDefault();
    if (cloudPhase !== "idle") return;
    const jump = () => {
      const el = document.getElementById("hoa-20-10");
      window.scrollTo({ top: el.getBoundingClientRect().top + window.scrollY, behavior: "instant" });
      history.replaceState(null, "", "#hoa-20-10");
    };
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      jump();
      return;
    }
    setCloudPhase("in");
    setTimeout(() => {
      jump();
      setCloudPhase("out");
    }, 1250);
    setTimeout(() => setCloudPhase("idle"), 2600);
  }

  return (
    <div className="app">
      <GalaxyBackground />
      <div className="overlay" />
      <BackgroundMusic />

      <header className="hero">
        <h1 className="hero-title">Gửi Tiên,</h1>
        <p className="hero-sub">một lá thư giữa những vì sao</p>

        <nav className="toc" aria-label="Mục lục">
          <p className="toc-heading">Mục lục</p>
          <ol>
            <li><a href="#thu-1"><span className="toc-num">I</span>Lá thư gửi Tiên</a></li>
            <li><a href="#thu-2"><span className="toc-num">II</span>Tiên không một mình đâu</a></li>
            <li><a href="#sinh-nhat"><span className="toc-num">III</span>Chúc mừng sinh nhật · 3/10</a></li>
            <li><a href="#hoa-20-10" onClick={flyToSpring}><span className="toc-num">IV</span>Vườn hoa 20/10</a></li>
          </ol>
        </nav>
        <div className="scroll-hint">cuộn xuống để đọc ↓</div>
      </header>

      <main className="letter" id="thu-1">
        {letter.map((line, i) => (
          <FadeLine key={i} text={line.text} size={line.size} special={line.special} />
        ))}
      </main>

      <div className="divider" aria-hidden="true">✦</div>

      <main className="letter" id="thu-2">
        {letter2.map((line, i) => (
          <FadeLine key={`l2-${i}`} text={line.text} size={line.size} special={line.special} />
        ))}
      </main>

      <div className="divider" aria-hidden="true">✦</div>

      <BirthdaySection />

      <footer className="signature">
        <p>— Đông</p>
      </footer>

      <SpringSection />
      <CloudTransition phase={cloudPhase} />
    </div>
  );
}
