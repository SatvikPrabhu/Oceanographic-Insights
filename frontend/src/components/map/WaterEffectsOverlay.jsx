import { useEffect, useRef, useState } from "react";

const MAX_RIPPLES = 40;

function BoatGlyph() {
  return (
    <svg viewBox="0 0 24 24" width="24" height="24" aria-hidden="true">
      <path
        d="M12 2.2c.5 0 1.1.3 1.6.9l4.2 5.6c.9 1.2 1.5 2.6 1.5 4.1v4.4c0 1.3-1.4 2.2-2.9 2.2H7.6c-1.5 0-2.9-.9-2.9-2.2V12.8c0-1.5.6-2.9 1.5-4.1L10.4 3.1c.5-.6 1.1-.9 1.6-.9z"
        fill="#38bdf8"
        stroke="#082f49"
        strokeWidth="1.1"
      />
      <path d="M9.1 9.2h5.8l-.7 3.4H9.8z" fill="#0e7490" />
      <rect x="10.2" y="6.1" width="3.6" height="3.2" rx="0.5" fill="#e0f2fe" />
      <path d="M12 3.4v2.2" stroke="#082f49" strokeWidth="1.2" strokeLinecap="round" />
      <circle cx="12" cy="3.2" r="0.7" fill="#fbbf24" />
      <path d="M8.4 17.6h7.2" stroke="#082f49" strokeWidth="1" strokeLinecap="round" opacity="0.55" />
    </svg>
  );
}

export default function WaterEffectsOverlay({ enabled, containerRef }) {
  const canvasRef = useRef(null);
  const rafRef = useRef(0);
  const ripplesRef = useRef([]);
  const prevRef = useRef(null);
  const angleRef = useRef(0);
  const [boat, setBoat] = useState({ x: 0, y: 0, angle: 0, visible: false });
  const styleTagRef = useRef(null);

  useEffect(() => {
    // Remove existing style tag if present
    if (styleTagRef.current) {
      styleTagRef.current.remove();
      styleTagRef.current = null;
    }

    const style = document.createElement("style");
    style.setAttribute("data-boat-cursor", "true");
    
    if (enabled) {
      // Use higher specificity and !important to override Leaflet's cursor
      style.textContent = `
        .ocean-map-boat .leaflet-container,
        .ocean-map-boat .leaflet-container *,
        .ocean-map-boat .leaflet-interactive,
        .ocean-map-boat .mapboxgl-canvas,
        .leaflet-container.leaflet-boat-cursor,
        .leaflet-container.leaflet-boat-cursor * {
          cursor: none !important;
        }
      `;
    } else {
      style.textContent = `
        .ocean-map-boat-off .leaflet-container,
        .ocean-map-boat-off .leaflet-grab {
          cursor: grab !important;
        }
      `;
    }
    
    document.head.appendChild(style);
    styleTagRef.current = style;

    return () => {
      if (styleTagRef.current) {
        styleTagRef.current.remove();
        styleTagRef.current = null;
      }
    };
  }, [enabled]);

  useEffect(() => {
    const canvas = canvasRef.current;
    const host = containerRef?.current;
    if (!canvas || !host) return undefined;
    const ctx = canvas.getContext("2d");

    const syncSize = () => {
      const rect = host.getBoundingClientRect();
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = Math.max(1, Math.floor(rect.width * dpr));
      canvas.height = Math.max(1, Math.floor(rect.height * dpr));
      canvas.style.width = `${rect.width}px`;
      canvas.style.height = `${rect.height}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };

    const stopLoop = () => {
      cancelAnimationFrame(rafRef.current);
      rafRef.current = 0;
    };

    const draw = () => {
      if (!enabled) {
        stopLoop();
        return;
      }
      const rect = host.getBoundingClientRect();
      ctx.clearRect(0, 0, rect.width, rect.height);

      ripplesRef.current = ripplesRef.current.filter((ripple) => {
        ripple.radius += 0.8;
        ripple.alpha -= 0.015;
        if (ripple.alpha <= 0 || ripple.radius > 28) return false;
        ctx.beginPath();
        ctx.arc(ripple.x, ripple.y, ripple.radius, 0, Math.PI * 2);
        ctx.strokeStyle = `rgba(56, 189, 248, ${ripple.alpha})`;
        ctx.lineWidth = 1.4;
        ctx.stroke();
        return true;
      });

      rafRef.current = requestAnimationFrame(draw);
    };

    const localPoint = (event) => {
      const rect = host.getBoundingClientRect();
      return {
        x: event.clientX - rect.left,
        y: event.clientY - rect.top,
        inside:
          event.clientX >= rect.left &&
          event.clientX <= rect.right &&
          event.clientY >= rect.top &&
          event.clientY <= rect.bottom,
      };
    };

    const overToggle = (event) => Boolean(event.target?.closest?.(".ocean-fx-toggle"));

    const onPointerMove = (event) => {
      if (!enabled) return;
      const { x, y, inside } = localPoint(event);
      if (!inside) {
        prevRef.current = null;
        setBoat((prev) => (prev.visible ? { ...prev, visible: false } : prev));
        return;
      }

      const prev = prevRef.current;
      if (prev) {
        const deltaX = x - prev.x;
        const deltaY = y - prev.y;
        if (deltaX * deltaX + deltaY * deltaY > 1) {
          angleRef.current = Math.atan2(deltaY, deltaX) * (180 / Math.PI) + 90;
        }
      }
      prevRef.current = { x, y };

      const hideBoat = overToggle(event);
      setBoat({ x, y, angle: angleRef.current, visible: !hideBoat });

      if (hideBoat) return;

      ripplesRef.current.push({ x, y, radius: 2, alpha: 0.25 });
      if (ripplesRef.current.length > MAX_RIPPLES) {
        ripplesRef.current.splice(0, ripplesRef.current.length - MAX_RIPPLES);
      }
    };

    const onLeave = (event) => {
      if (event.relatedTarget && host.contains(event.relatedTarget)) return;
      prevRef.current = null;
      setBoat((prev) => ({ ...prev, visible: false }));
    };

    syncSize();
    const observer = new ResizeObserver(syncSize);
    observer.observe(host);

    if (enabled) {
      rafRef.current = requestAnimationFrame(draw);
      window.addEventListener("pointermove", onPointerMove, { passive: true });
      host.addEventListener("pointermove", onPointerMove, { passive: true });
      host.addEventListener("mouseleave", onLeave);
    } else {
      stopLoop();
      ripplesRef.current = [];
      ctx.setTransform(1, 0, 0, 1, 0, 0);
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      setBoat((prev) => ({ ...prev, visible: false }));
    }

    return () => {
      stopLoop();
      observer.disconnect();
      host.removeEventListener("pointermove", onPointerMove);
      window.removeEventListener("pointermove", onPointerMove);
      host.removeEventListener("mouseleave", onLeave);
    };
  }, [enabled, containerRef]);

  return (
    <>
      <canvas
        ref={canvasRef}
        className="pointer-events-none absolute inset-0"
        style={{ zIndex: 20 }}
        aria-hidden="true"
      />
      {enabled && boat.visible && (
        <div
          className="pointer-events-none"
          style={{
            position: "absolute",
            left: boat.x,
            top: boat.y,
            zIndex: 9999,
            width: 24,
            height: 24,
            transform: `translate(-50%, -50%) rotate(${boat.angle}deg)`,
            filter: "drop-shadow(0 0 4px rgba(56,189,248,0.55))",
            willChange: "transform, left, top",
          }}
        >
          <BoatGlyph />
        </div>
      )}
    </>
  );
}
