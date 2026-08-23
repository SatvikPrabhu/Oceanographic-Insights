import { useEffect, useRef } from "react";

export default function OceanRippleCanvas() {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animationFrameId;
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    const ripples = [];
    const maxRipples = 60;

    let lastMousePos = { x: -100, y: -100 };
    let lastSpawnTime = 0;

    function handleResize() {
      if (!canvas) return;
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    }

    window.addEventListener("resize", handleResize);

    function addRipple(x, y, power = 1) {
      if (ripples.length >= maxRipples) {
        ripples.shift();
      }

      // Add a multi-ring ripple wave
      ripples.push({
        x,
        y,
        radius: 4,
        maxRadius: Math.min(width, height) * 0.22 * power + 40,
        speed: 1.8 + power * 1.4,
        alpha: 0.7 * Math.min(power, 1.2),
        decay: 0.008 + (1 / (power + 1)) * 0.006,
        rings: [
          { offset: 0, weight: 2.2 },
          { offset: 12, weight: 1.6 },
          { offset: 24, weight: 1.0 },
        ],
        hue: 185 + Math.random() * 25, // cyan to teal range
      });
    }

    function handleMouseMove(e) {
      const now = performance.now();
      const dx = e.clientX - lastMousePos.x;
      const dy = e.clientY - lastMousePos.y;
      const dist = Math.sqrt(dx * dx + dy * dy);

      // Spawn ripples based on distance moved and throttle slightly
      if (dist > 15 && now - lastSpawnTime > 40) {
        const speed = Math.min(dist / 20, 2.5);
        addRipple(e.clientX, e.clientY, speed);
        lastMousePos = { x: e.clientX, y: e.clientY };
        lastSpawnTime = now;
      }
    }

    function handleTouchMove(e) {
      if (e.touches.length > 0) {
        const touch = e.touches[0];
        addRipple(touch.clientX, touch.clientY, 1.4);
      }
    }

    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("touchmove", handleTouchMove);

    // Occasional ambient natural swell ripples
    let lastAmbientSpawn = 0;

    function animate(time) {
      ctx.clearRect(0, 0, width, height);

      // Ambient ripple every 2.5 seconds
      if (time - lastAmbientSpawn > 2500) {
        const ax = Math.random() * width;
        const ay = Math.random() * height;
        addRipple(ax, ay, 0.8);
        lastAmbientSpawn = time;
      }

      // Update and render active ripples
      for (let i = ripples.length - 1; i >= 0; i--) {
        const r = ripples[i];
        r.radius += r.speed;
        r.alpha -= r.decay;

        if (r.alpha <= 0 || r.radius >= r.maxRadius) {
          ripples.splice(i, 1);
          continue;
        }

        // Draw multiple wave crests for realistic wave refraction
        r.rings.forEach((ring) => {
          const currentRadius = r.radius - ring.offset;
          if (currentRadius <= 0) return;

          const ringAlpha = Math.max(0, r.alpha * (1 - currentRadius / r.maxRadius));

          // Outer wave refraction glow
          ctx.beginPath();
          ctx.arc(r.x, r.y, currentRadius, 0, Math.PI * 2);
          ctx.strokeStyle = `hsla(${r.hue}, 90%, 65%, ${ringAlpha * 0.75})`;
          ctx.lineWidth = ring.weight * 2.5;
          ctx.stroke();

          // Bright inner caustic highlight line
          ctx.beginPath();
          ctx.arc(r.x, r.y, currentRadius, 0, Math.PI * 2);
          ctx.strokeStyle = `hsla(${r.hue + 10}, 100%, 85%, ${ringAlpha * 0.95})`;
          ctx.lineWidth = Math.max(0.8, ring.weight * 0.8);
          ctx.stroke();
        });
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
      className="pointer-events-none fixed inset-0 z-[1] h-full w-full mix-blend-screen opacity-90"
    />
  );
}
