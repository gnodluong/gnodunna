import { useEffect, useRef, useState } from "react";

const START = new Date(2025, 0, 28);

function diff(now) {
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const days = Math.round((today - START) / 86400000);
  let y = today.getFullYear() - START.getFullYear();
  let m = today.getMonth() - START.getMonth();
  let d = today.getDate() - START.getDate();
  if (d < 0) {
    m -= 1;
    d += new Date(today.getFullYear(), today.getMonth(), 0).getDate();
  }
  if (m < 0) {
    y -= 1;
    m += 12;
  }
  return { days, y, m, d };
}

// Bộ đếm số ngày bên nhau từ 28/1/2025, chạy số khi cuộn tới
export default function DaysTogether() {
  const ref = useRef(null);
  const { days, y, m, d } = diff(new Date());
  const [shown, setShown] = useState(0);
  const [done, setDone] = useState(false);

  useEffect(() => {
    const el = ref.current;
    let raf;
    const obs = new IntersectionObserver(
      ([e]) => {
        if (!e.isIntersecting) return;
        obs.disconnect();
        const t0 = performance.now();
        const dur = 2200;
        const tick = (t) => {
          const k = Math.min(1, (t - t0) / dur);
          setShown(Math.round(days * (1 - Math.pow(1 - k, 4))));
          if (k < 1) raf = requestAnimationFrame(tick);
          else setDone(true);
        };
        raf = requestAnimationFrame(tick);
      },
      { threshold: 0.5 }
    );
    obs.observe(el);
    return () => {
      obs.disconnect();
      cancelAnimationFrame(raf);
    };
  }, [days]);

  const parts = [y && `${y} năm`, m && `${m} tháng`, d && `${d} ngày`].filter(Boolean);

  return (
    <div ref={ref} className={`days-together ${done ? "done" : ""}`}>
      <p className="dt-from">28 · 01 · 2025</p>
      <p className="dt-arrow">tới hôm nay là</p>
      <p className="dt-number">
        {shown}
        <span> ngày</span>
      </p>
      <p className="dt-parts">{parts.join(" · ")}</p>
      <p className="dt-note">tụi mình thương nhau rồi đó</p>
    </div>
  );
}
