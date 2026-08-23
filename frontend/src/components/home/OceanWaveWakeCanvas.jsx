import { useEffect, useRef } from "react";

// Pre-defined wave archetypes for natural variety
const WAVE_TYPES = ["swell", "v-wake", "ridge", "foam-surge"];

export default function OceanWaveWakeCanvas() {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animationFrameId;
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    const waves = [];
    const MAX_WAVES = 20;

    let lastX = null;
    let lastY = null;
    let lastSpawnTime = 0;

    function handleResize() {
      if (!canvas) return;
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    }

    window.addEventListener("resize", handleResize);

    function spawnRandomWave(x, y, dx, dy) {
      const dist = Math.hypot(dx, dy);
      if (dist < 4) return;

      const moveAngle = Math.atan2(dy, dx);
      const backAngle = moveAngle + Math.PI; // Pushed in the opposite direction
      const pushSpeed = Math.min(dist * 0.22, 4.2);

      if (waves.length >= MAX_WAVES) {
        waves.shift();
      }

      // Randomly pick a realistic wave archetype
      const type = WAVE_TYPES[Math.floor(Math.random() * WAVE_TYPES.length)];

      // Random wave shape parameters for natural organic variation
      const wave = {
        type,
        x: x - dx * 0.35,
        y: y - dy * 0.35,
        vx: Math.cos(backAngle) * (pushSpeed + 1.2),
        vy: Math.sin(backAngle) * (pushSpeed + 1.2),
        backAngle,
        width: 22 + Math.random() * 16 + dist * 0.4,
        widthGrowth: 1.4 + Math.random() * 0.8,
        depth: 8 + Math.random() * 8,
        depthGrowth: 0.8 + Math.random() * 0.6,
        wobble: (Math.random() - 0.5) * 12,
        curvature: 0.7 + Math.random() * 0.6,
        alpha: 0.85,
        decay: 0.024 + Math.random() * 0.006, // Same fast expiry to prevent lag (~0.6-0.7s)
        lineWidth: 1.8 + Math.min(dist * 0.06, 2.0),
        // Micro foam droplets for foam-surge type
        droplets:
          type === "foam-surge"
            ? Array.from({ length: 4 }, () => ({
                offsetAngle: (Math.random() - 0.5) * 0.8,
                dist: Math.random() * 12 + 6,
                speed: 1.0 + Math.random() * 1.5,
                size: Math.random() * 2 + 1.2,
              }))
            : [],
      };

      waves.push(wave);
    }

    function handleMouseMove(e) {
      const now = performance.now();
      if (now - lastSpawnTime < 38) return;

      if (lastX !== null && lastY !== null) {
        const dx = e.clientX - lastX;
        const dy = e.clientY - lastY;
        if (Math.hypot(dx, dy) > 10) {
          spawnRandomWave(e.clientX, e.clientY, dx, dy);
          lastSpawnTime = now;
        }
      }

      lastX = e.clientX;
      lastY = e.clientY;
    }

    function handleTouchMove(e) {
      if (e.touches.length > 0) {
        const touch = e.touches[0];
        const now = performance.now();
        if (now - lastSpawnTime < 38) return;

        if (lastX !== null && lastY !== null) {
          const dx = touch.clientX - lastX;
          const dy = touch.clientY - lastY;
          if (Math.hypot(dx, dy) > 10) {
            spawnRandomWave(touch.clientX, touch.clientY, dx, dy);
            lastSpawnTime = now;
          }
        }

        lastX = touch.clientX;
        lastY = touch.clientY;
      }
    }

    window.addEventListener("mousemove", handleMouseMove, { passive: true });
    window.addEventListener("touchmove", handleTouchMove, { passive: true });

    function drawWaveShape(w) {
      const cosB = Math.cos(w.backAngle);
      const sinB = Math.sin(w.backAngle);
      // Perpendicular unit vector
      const perpX = -sinB;
      const perpY = cosB;

      const halfW = w.width * 0.5;
      const depthOffset = w.depth * w.curvature;

      if (w.type === "v-wake") {
        // --- Archetype 1: V-Wake Twin Bow Waves ---
        const flare = 0.55;
        const armLen = w.width * 0.65;

        // Left wing
        const lEndX = w.x + Math.cos(w.backAngle - flare) * armLen;
        const lEndY = w.y + Math.sin(w.backAngle - flare) * armLen;
        // Right wing
        const rEndX = w.x + Math.cos(w.backAngle + flare) * armLen;
        const rEndY = w.y + Math.sin(w.backAngle + flare) * armLen;

        ctx.beginPath();
        ctx.moveTo(lEndX, lEndY);
        ctx.quadraticCurveTo(w.x, w.y, rEndX, rEndY);

        ctx.strokeStyle = `rgba(34, 211, 238, ${w.alpha * 0.45})`;
        ctx.lineWidth = w.lineWidth * 2.2;
        ctx.lineCap = "round";
        ctx.stroke();

        ctx.beginPath();
        ctx.moveTo(lEndX, lEndY);
        ctx.quadraticCurveTo(w.x, w.y, rEndX, rEndY);

        ctx.strokeStyle = `rgba(224, 242, 254, ${w.alpha * 0.9})`;
        ctx.lineWidth = Math.max(1, w.lineWidth * 0.75);
        ctx.stroke();
      } else if (w.type === "ridge") {
        // --- Archetype 2: Multi-Tiered Ripple Ridge ---
        for (let tier = 0; tier < 2; tier++) {
          const tierOffset = tier * 6;
          const tierAlpha = w.alpha * (tier === 0 ? 0.9 : 0.45);
          const p0x = w.x - perpX * halfW;
          const p0y = w.y - perpY * halfW;
          const p1x = w.x + perpX * halfW;
          const p1y = w.y + perpY * halfW;
          const midX = w.x + cosB * (depthOffset + tierOffset) + perpX * w.wobble;
          const midY = w.y + sinB * (depthOffset + tierOffset) + perpY * w.wobble;

          ctx.beginPath();
          ctx.moveTo(p0x, p0y);
          ctx.quadraticCurveTo(midX, midY, p1x, p1y);

          ctx.strokeStyle =
            tier === 0
              ? `rgba(224, 242, 254, ${tierAlpha})`
              : `rgba(45, 212, 191, ${tierAlpha})`;
          ctx.lineWidth = tier === 0 ? w.lineWidth : w.lineWidth * 1.6;
          ctx.lineCap = "round";
          ctx.stroke();
        }
      } else if (w.type === "foam-surge") {
        // --- Archetype 3: Pushed Wave Crest with Foam Micro-Droplets ---
        const p0x = w.x - perpX * halfW;
        const p0y = w.y - perpY * halfW;
        const p1x = w.x + perpX * halfW;
        const p1y = w.y + perpY * halfW;
        const ctrlX = w.x + cosB * depthOffset;
        const ctrlY = w.y + sinB * depthOffset;

        ctx.beginPath();
        ctx.moveTo(p0x, p0y);
        ctx.quadraticCurveTo(ctrlX, ctrlY, p1x, p1y);
        ctx.strokeStyle = `rgba(34, 211, 238, ${w.alpha * 0.4})`;
        ctx.lineWidth = w.lineWidth * 2.4;
        ctx.lineCap = "round";
        ctx.stroke();

        ctx.beginPath();
        ctx.moveTo(p0x, p0y);
        ctx.quadraticCurveTo(ctrlX, ctrlY, p1x, p1y);
        ctx.strokeStyle = `rgba(240, 253, 250, ${w.alpha * 0.95})`;
        ctx.lineWidth = Math.max(1, w.lineWidth * 0.8);
        ctx.stroke();

        // Foam droplets streaming behind
        w.droplets.forEach((d) => {
          const dx = w.x + Math.cos(w.backAngle + d.offsetAngle) * (depthOffset + d.dist);
          const dy = w.y + Math.sin(w.backAngle + d.offsetAngle) * (depthOffset + d.dist);
          ctx.beginPath();
          ctx.arc(dx, dy, d.size, 0, Math.PI * 2);
          ctx.fillStyle = `rgba(224, 242, 254, ${w.alpha * 0.8})`;
          ctx.fill();
        });
      } else {
        // --- Archetype 4: Organic Undulating Swell (S-Curved Bezier) ---
        const p0x = w.x - perpX * halfW;
        const p0y = w.y - perpY * halfW;
        const p1x = w.x + perpX * halfW;
        const p1y = w.y + perpY * halfW;

        const c1x = w.x - perpX * (halfW * 0.4) + cosB * (depthOffset * 1.2) + perpX * w.wobble;
        const c1y = w.y - perpY * (halfW * 0.4) + sinB * (depthOffset * 1.2) + perpY * w.wobble;
        const c2x = w.x + perpX * (halfW * 0.4) + cosB * (depthOffset * 0.8) - perpX * w.wobble;
        const c2y = w.y + perpY * (halfW * 0.4) + sinB * (depthOffset * 0.8) - perpY * w.wobble;

        // Outer cyan swell glow
        ctx.beginPath();
        ctx.moveTo(p0x, p0y);
        ctx.bezierCurveTo(c1x, c1y, c2x, c2y, p1x, p1y);
        ctx.strokeStyle = `rgba(34, 211, 238, ${w.alpha * 0.45})`;
        ctx.lineWidth = w.lineWidth * 2.2;
        ctx.lineCap = "round";
        ctx.stroke();

        // Inner white crest line
        ctx.beginPath();
        ctx.moveTo(p0x, p0y);
        ctx.bezierCurveTo(c1x, c1y, c2x, c2y, p1x, p1y);
        ctx.strokeStyle = `rgba(224, 242, 254, ${w.alpha * 0.9})`;
        ctx.lineWidth = Math.max(1, w.lineWidth * 0.75);
        ctx.stroke();
      }
    }

    function animate() {
      ctx.clearRect(0, 0, width, height);

      for (let i = waves.length - 1; i >= 0; i--) {
        const w = waves[i];
        w.x += w.vx;
        w.y += w.vy;
        w.vx *= 0.96; // water friction
        w.vy *= 0.96;
        w.width += w.widthGrowth;
        w.depth += w.depthGrowth;
        w.alpha -= w.decay;

        if (w.alpha <= 0) {
          waves.splice(i, 1);
          continue;
        }

        drawWaveShape(w);
      }

      animationFrameId = requestAnimationFrame(animate);
    }

    animationFrameId = requestAnimationFrame(animate);

    return () => {
      window.removeEventListener("resize", handleResize);
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("touchmove", handleTouchMove);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="pointer-events-none fixed inset-0 z-[2] h-full w-full mix-blend-screen"
    />
  );
}
