import L from "leaflet";

export function fishDivIcon(size, weightKg) {
  const px = Math.round(size);
  const fill = weightKg > 80 ? "#fbbf24" : "#38bdf8";
  return L.divIcon({
    className: "thalassa-marker",
    iconSize: [px, px],
    iconAnchor: [px / 2, px / 2],
    html: `<div class="thalassa-pin" style="width:${px}px;height:${px}px;filter:drop-shadow(0 0 7px ${fill}aa)">
      <svg viewBox="0 0 24 24" width="${px}" height="${px}" fill="${fill}" aria-hidden="true">
        <path d="M2.8 12.1c3.8-6.2 8.2-7.4 13.4-5.1 1.4.6 3.1 2 5.2 2.1-1.1 1.1-1.3 2.6 0 4.1-2.1.2-3.9 1.6-5.3 2.2-5.1 2.2-9.4 1.1-13.3-3.3z"/>
        <path d="M4.2 12.2l-2.4 3.4c1.6-.2 2.7-.8 3.4-1.8z" opacity="0.85"/>
        <circle cx="8.1" cy="11.1" r="1.15" fill="#071018"/>
      </svg>
    </div>`,
  });
}

export function dnaDivIcon(size) {
  const px = Math.round(size);
  return L.divIcon({
    className: "thalassa-marker",
    iconSize: [px, px],
    iconAnchor: [px / 2, px / 2],
    html: `<div class="thalassa-pin" style="width:${px}px;height:${px}px;filter:drop-shadow(0 0 8px #d946ef99)">
      <svg viewBox="0 0 24 24" width="${px}" height="${px}" fill="none" aria-hidden="true">
        <path d="M8 2.8c4.2 3.2 4.2 15.2 8 18.4" stroke="#e879f9" stroke-width="1.7"/>
        <path d="M16 2.8c-4.2 3.2-4.2 15.2-8 18.4" stroke="#a78bfa" stroke-width="1.7"/>
        <path d="M8.6 6.6h6.8M8 9.4h8M7.8 12h8.4M8 14.6h8M8.6 17.4h6.8" stroke="#f5d0fe" stroke-width="1.35" stroke-linecap="round"/>
      </svg>
    </div>`,
  });
}

export function catchIconSize(weightKg) {
  return Math.min(44, Math.max(20, 16 + Math.sqrt(Number(weightKg) || 0) * 2.4));
}
