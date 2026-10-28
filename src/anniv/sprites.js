// Sprite vẽ chì màu dựng sẵn: mỗi bông có bản phác chì (-sk) và bản tô màu
const flowerFiles = import.meta.glob("../assets/anniv/flowers/*.webp", { eager: true, import: "default" });
const birdFiles = import.meta.glob("../assets/anniv/birds/*.webp", { eager: true, import: "default" });
const memoryFiles = import.meta.glob("../assets/memories/*.{jpg,jpeg,png,webp,JPG,JPEG,PNG}", { eager: true, import: "default" });

const name = (k) => k.split("/").pop().replace(/\.\w+$/, "");

// { rose: [{ color, sketch }], ... } và FOLIAGE tương tự
export const FLOWERS = {};
export const FOLIAGE = [];
for (const [k, url] of Object.entries(flowerFiles)) {
  const n = name(k);
  if (n.endsWith("-sk")) continue;
  const sketch = flowerFiles[k.replace(/\.webp$/, "-sk.webp")];
  if (n.startsWith("foliage-")) FOLIAGE.push({ color: url, sketch });
  else (FLOWERS[n.split("-")[0]] ||= []).push({ color: url, sketch });
}

export const BIRD = {};
for (const [k, url] of Object.entries(birdFiles)) {
  const n = name(k);
  const [part, id] = n.split("-");
  BIRD[id] ||= {};
  BIRD[id][part] = url;
}

// Ảnh kỷ niệm: đặt file 01.jpg … 10.jpg vào src/assets/memories là tự hiện
export const MEMORIES = Object.keys(memoryFiles)
  .sort()
  .map((k) => memoryFiles[k]);

// tải ảnh một lần, dùng chung cho mọi canvas
const cache = new Map();
export function loadImage(url) {
  if (!cache.has(url)) {
    cache.set(
      url,
      new Promise((res) => {
        const img = new Image();
        img.onload = () => res(img);
        img.onerror = () => res(null);
        img.src = url;
      })
    );
  }
  return cache.get(url);
}
