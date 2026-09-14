export const USERS = Object.freeze({
  J2ZrXMP0wj: "4",
  Tst5rLb7Ae: "Frank",
  f4XPSqhTJD: "Herold",
  "9MOvJJGRc7": "Kropp",
  gsvweXC8cB: "Magne",
  M2tgVaUDrK: "Martin",
  qhEI1lwqDq: "Ole Tom",
  rZGKuHEAnw: "Steinar",
  hOGUL3Ijh5: "Stig",
  ifP5y9KtfJ: "TC",
  tjwXHGA8b8: "Tedd"
});

export const STATIC_LOCATIONS = Object.freeze({
  bjDUdO1y15: { userID: "Hotell", Platform: "Static", Timestamp: "2026-07-04 10:10:10", Location: "50.052312560225346, 19.917011600564315" },
  livqXKjvUQ: { userID: "Butcher Grill", Platform: "Static", Timestamp: "2026-07-04 10:10:10", Location: "50.06008256071363, 19.937353473971022" },
  yJ2R5TxfRA: { userID: "Chopin Hall", Platform: "Static", Timestamp: "2026-07-04 10:10:10", Location: "50.053139215413964, 19.937353475639696" },
  "4mfykAkXdh": { userID: "Saltgruver", Platform: "Static", Timestamp: "2026-07-04 10:10:10", Location: "49.98453352281953, 20.054083210160986" },
  b1sR8OHdGM: { userID: "Big Gun", Platform: "Static", Timestamp: "2026-07-04 10:10:10", Location: "50.0253557878794, 19.864912375686774" },
  gTyS7E0bd8: { userID: "Flyplass", Platform: "Static", Timestamp: "2026-07-04 10:10:10", Location: "50.081347188044134, 19.78594814351061" }
});

export function parseLocation(value) {
  if (typeof value !== "string") return null;
  const match = value.trim().match(/^(-?\d+(?:\.\d+)?)\s*,\s*(-?\d+(?:\.\d+)?)$/);
  if (!match) return null;
  const lat = Number(match[1]);
  const lng = Number(match[2]);
  if (!Number.isFinite(lat) || !Number.isFinite(lng) || lat < -90 || lat > 90 || lng < -180 || lng > 180) return null;
  return { lat, lng };
}

export function parseTimestamp(value) {
  if (typeof value !== "string") return null;
  const match = value.match(/^(\d{4})-(\d{2})-(\d{2}) (\d{2}):(\d{2}):(\d{2})$/);
  if (!match) return null;
  const [, y, m, d, h, min, s] = match.map(Number);
  const result = new Date(y, m - 1, d, h, min, s);
  if (result.getFullYear() !== y || result.getMonth() !== m - 1 || result.getDate() !== d || result.getHours() !== h || result.getMinutes() !== min || result.getSeconds() !== s) return null;
  return result;
}

export function formatTimestamp(date = new Date()) {
  const pad = value => String(value).padStart(2, "0");
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())} ${pad(date.getHours())}:${pad(date.getMinutes())}:${pad(date.getSeconds())}`;
}

export function freshnessClass(timestamp, now = new Date()) {
  const date = parseTimestamp(timestamp);
  if (!date) return "stale";
  const minutes = Math.max(0, (now.getTime() - date.getTime()) / 60000);
  if (minutes <= 20) return "fresh";
  if (minutes <= 45) return "aging";
  return "stale";
}

export function googleMapsUrl(lat, lng) {
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${lat},${lng}`)}`;
}

export function detectPlatform(userAgent = "", platform = "", maxTouchPoints = 0) {
  if (/android/i.test(userAgent)) return "Android";
  if (/iPad|iPhone|iPod/i.test(userAgent) || (platform === "MacIntel" && maxTouchPoints > 1)) return "IOS";
  return "Ukjent";
}

export function accuracyLabel(meters) {
  return Number.isFinite(meters) && meters <= 100 ? "Fine" : "Coarse";
}

function overlapArea(a, b) {
  const width = Math.max(0, Math.min(a.right, b.right) - Math.max(a.left, b.left));
  const height = Math.max(0, Math.min(a.bottom, b.bottom) - Math.max(a.top, b.top));
  return width * height;
}

export function layoutLabels(items, viewportWidth, viewportHeight) {
  const margin = 4;
  const horizontalGap = 18;
  const verticalGap = 4;
  const occupied = [];
  const markerBoxes = items.map(item => ({
    left: item.x - 13,
    right: item.x + 13,
    top: item.y - 25,
    bottom: item.y + 3
  }));

  return items.map((item, index) => {
    const maxSlot = Math.ceil(items.length / 2) + 2;
    const slots = [0];
    for (let slot = 1; slot <= maxSlot; slot += 1) slots.push(-slot, slot);
    const directions = index % 2 === 0 ? [1, -1] : [-1, 1];
    let best = null;

    for (const slot of slots) {
      for (const direction of directions) {
        const rawLeft = direction > 0 ? item.x + horizontalGap : item.x - horizontalGap - item.width;
        const rawTop = item.y - item.height / 2 + slot * (item.height + verticalGap);
        const left = Math.max(margin, Math.min(rawLeft, viewportWidth - item.width - margin));
        const top = Math.max(margin, Math.min(rawTop, viewportHeight - item.height - margin));
        const rect = { left, top, right: left + item.width, bottom: top + item.height };
        const overlap = [...markerBoxes, ...occupied].reduce((sum, other) => sum + overlapArea(rect, other), 0);
        const edgeX = left >= item.x ? left : left + item.width;
        const edgeY = Math.max(top + 3, Math.min(item.y, top + item.height - 3));
        const distance = Math.hypot(edgeX - item.x, edgeY - item.y);
        const score = overlap * 1000 + Math.abs(rawLeft - left) * 100 + Math.abs(rawTop - top) * 100 + distance;
        if (!best || score < best.score) best = { left, top, edgeX, edgeY, rect, score };
        if (score < 100) break;
      }
      if (best?.score < 100) break;
    }

    occupied.push(best.rect);
    return { left: best.left, top: best.top, edgeX: best.edgeX, edgeY: best.edgeY };
  });
}
