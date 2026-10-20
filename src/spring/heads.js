// Ảnh đầu hoa dựng sẵn: hồng nhiều lớp cánh (pastel), cúc họa mi và tulip
const roseFiles = import.meta.glob("../assets/roses/*.webp", { eager: true, import: "default" });
const daisyFiles = import.meta.glob("../assets/daisies/*.webp", { eager: true, import: "default" });
const tulipFiles = import.meta.glob("../assets/tulips/*.webp", { eager: true, import: "default" });

const list = (files) =>
  Object.keys(files)
    .sort()
    .map((k) => files[k]);

export const ROSES = list(roseFiles);
export const DAISIES = list(daisyFiles);
export const TULIPS = list(tulipFiles);
