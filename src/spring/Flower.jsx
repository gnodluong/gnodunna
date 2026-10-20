// Hoa trong vườn: hồng, cúc họa mi, tulip dùng ảnh dựng sẵn; cúc mâm xôi vẽ SVG tô bóng.
// viewBox 100 x 200: bông ở trên (tâm ~ 50,40), thân chạy xuống đáy.
// Gradient dùng chung nằm trong <FlowerDefs />, render một lần cho cả trang.
import { PALETTE } from "./palette";


function mix(hex, target, amount) {
  const n = parseInt(hex.slice(1), 16);
  const t = parseInt(target.slice(1), 16);
  const ch = (s) => Math.round(((n >> s) & 255) * (1 - amount) + ((t >> s) & 255) * amount);
  return `rgb(${ch(16)},${ch(8)},${ch(0)})`;
}
const light = (c, a) => mix(c, "#ffffff", a);
const dark = (c, a) => mix(c, "#1a0610", a);
const id = (c) => c.slice(1);

function ColorDefs({ c }) {
  const k = id(c);
  return (
    <>
      {/* cánh cúc mâm xôi: gốc đậm, đầu cánh sáng */}
      <linearGradient id={`dp-${k}`} x1="0" y1="1" x2="0" y2="0">
        <stop offset="0" stopColor={dark(c, 0.35)} />
        <stop offset="0.35" stopColor={c} />
        <stop offset="1" stopColor={light(c, 0.3)} />
      </linearGradient>
    </>
  );
}

export function FlowerDefs() {
  const colors = new Set([
    ...PALETTE.mum,
  ]);
  return (
    <svg width="0" height="0" style={{ position: "absolute" }} aria-hidden="true">
      <defs>
        {[...colors].map((c) => (
          <ColorDefs key={c} c={c} />
        ))}
        <linearGradient id="stem-g" gradientUnits="userSpaceOnUse" x1="45" y1="0" x2="55" y2="0">
          <stop offset="0" stopColor="#25591f" />
          <stop offset="0.45" stopColor="#6cbf55" />
          <stop offset="1" stopColor="#2a6624" />
        </linearGradient>
        <linearGradient id="leaf-g" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#7fcf62" />
          <stop offset="0.5" stopColor="#3f9a3a" />
          <stop offset="1" stopColor="#1f5e22" />
        </linearGradient>
        <linearGradient id="sepal-g" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#3d8b37" />
          <stop offset="1" stopColor="#245a20" />
        </linearGradient>
        <radialGradient id="shine" cx="50%" cy="50%" r="50%">
          <stop offset="0" stopColor="#fff" stopOpacity="0.55" />
          <stop offset="1" stopColor="#fff" stopOpacity="0" />
        </radialGradient>
      </defs>
    </svg>
  );
}

function Stem({ lean, tulip }) {
  const mx = 50 + lean;
  return (
    <g>
      <path d={`M50 64 Q${mx} 130 50 200`} stroke="url(#stem-g)" strokeWidth="4.2" fill="none" strokeLinecap="round" />
      {tulip && (
        <>
          {/* lá tulip to, dài, ôm lấy thân */}
          <path d="M50 200 C26 170 18 120 30 78 C38 118 46 158 56 200Z" fill="url(#leaf-g)" />
          <path d="M48 200 C74 176 84 140 78 104 C68 140 58 170 44 200Z" fill="url(#leaf-g)" opacity="0.92" />
          <path d="M49 196 C34 160 30 120 31 84" stroke="#c9efb4" strokeOpacity="0.5" strokeWidth="0.8" fill="none" />
        </>
      )}
      {!tulip && (
      <>
      <g transform={`translate(${50 + lean * 0.55} 128) rotate(-38)`}>
        <path d="M0 0 C10 -10 30 -12 44 -4 C30 6 12 8 0 0Z" fill="url(#leaf-g)" />
        <path d="M2 -0.5 C16 -5 30 -5 42 -4" stroke="#bfe8a8" strokeOpacity="0.55" strokeWidth="0.8" fill="none" />
      </g>
      <g transform={`translate(${50 + lean * 0.3} 158) rotate(205)`}>
        <path d="M0 0 C10 -9 28 -11 40 -3 C28 6 12 7 0 0Z" fill="url(#leaf-g)" />
        <path d="M2 -0.5 C14 -4 27 -4 38 -3" stroke="#bfe8a8" strokeOpacity="0.5" strokeWidth="0.8" fill="none" />
      </g>
      </>
      )}
    </g>
  );
}

const dPetal = (len, w) =>
  `M0 0 C${-w} ${-len * 0.25} ${-w * 1.1} ${-len * 0.8} ${-w * 0.35} ${-len} Q0 ${-len * 1.05} ${w * 0.35} ${-len} C${w * 1.1} ${-len * 0.8} ${w} ${-len * 0.25} 0 0Z`;

function Mum({ c }) {
  const k = id(c);
  const rings = [
    [22, 22, 2.6, 0, 0.9],
    [20, 18, 2.8, 8, 0.95],
    [16, 14, 3, 3, 1],
    [12, 10, 3, 12, 1],
    [8, 6, 2.6, 5, 1],
  ];
  return (
    <g transform="translate(50 40) scale(1 0.86)"><g className="head">
      {rings.map(([n, len, w, off, o]) =>
        Array.from({ length: n }, (_, i) => (
          <path
            key={`${len}-${i}`}
            d={dPetal(len, w)}
            fill={`url(#dp-${k})`}
            opacity={o}
            stroke={dark(c, 0.3)}
            strokeOpacity="0.25"
            strokeWidth="0.3"
            transform={`rotate(${(360 / n) * i + off})`}
          />
        ))
      )}
      <circle r="3" fill={dark(c, 0.3)} />
      <ellipse cx="-5" cy="-8" rx="6" ry="4" fill="url(#shine)" />
    </g></g>
  );
}

export default function Flower({ type, color, lean = 0, img }) {
  if (type !== "mum") {
    return (
      <>
        <svg viewBox="0 0 100 200" className="flower-svg" aria-hidden="true">
          <Stem lean={lean} tulip={type === "tulip"} />
          {type === "rose" && [-55, 0, 55].map((a) => (
            <path key={a} d="M0 0 C-4 6 -2 16 0 20 C2 16 4 6 0 0Z" fill="url(#sepal-g)" transform={`translate(50 50) rotate(${a + 180})`} />
          ))}
        </svg>
        <img className={`head ${type}-head`} src={img} alt="" draggable="false" />
      </>
    );
  }
  return (
    <svg viewBox="0 0 100 200" className="flower-svg" aria-hidden="true">
      <Stem lean={lean} />
      <Mum c={color} />
    </svg>
  );
}
