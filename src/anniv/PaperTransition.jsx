import paper from "../assets/anniv/paper.webp";

// Tờ giấy cũ lan ra từ chỗ chạm, một bông hồng tự phác nét chì, rồi mở ra vườn hoa
export default function PaperTransition({ phase, x = 50, y = 50 }) {
  if (phase === "idle") return null;
  return (
    <div
      className={`paper-transition ${phase}`}
      style={{ "--cx": `${x}%`, "--cy": `${y}%`, backgroundImage: `url(${paper})` }}
      aria-hidden="true"
    >
      <svg className="pt-sketch" viewBox="0 0 200 260">
        <path className="s1" d="M100 96 c-6 -4 -2 -12 6 -10 c10 2 10 16 -2 18 c-14 2 -20 -14 -10 -22 c12 -10 32 -2 30 16 c-2 20 -30 26 -42 10 c-12 -16 0 -40 22 -40 c24 0 40 22 30 44 c-10 22 -46 28 -62 6" />
        <path className="s2" d="M58 92 c-14 -22 4 -48 26 -50 M142 92 c14 -22 -4 -48 -26 -50 M60 104 c-10 18 4 36 22 40 M140 104 c10 18 -4 36 -22 40" />
        <path className="s3" d="M100 140 C96 180 104 210 100 250 M100 190 c-18 -10 -36 -6 -46 4 c14 10 32 8 46 -4 M101 214 c18 -10 34 -6 44 4 c-14 10 -30 8 -44 -4" />
      </svg>
      <p className="pt-caption">FLORA &amp; AMOR ILLUSTRATA</p>
    </div>
  );
}
