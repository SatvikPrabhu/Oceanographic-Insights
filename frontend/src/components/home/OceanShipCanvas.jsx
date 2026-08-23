import { useEffect, useRef } from "react";
import shipN from "../../assets/ship/ship_n.png";
import shipNE from "../../assets/ship/ship_ne.png";
import shipE from "../../assets/ship/ship_e.png";
import shipSE from "../../assets/ship/ship_se.png";
import shipS from "../../assets/ship/ship_s.png";
import shipSW from "../../assets/ship/ship_sw.png";
import shipW from "../../assets/ship/ship_w.png";
import shipNW from "../../assets/ship/ship_nw.png";

const SPRITE_MAP = {
  n: shipN,
  ne: shipNE,
  e: shipE,
  se: shipSE,
  s: shipS,
  sw: shipSW,
  w: shipW,
  nw: shipNW,
};

export default function OceanShipCanvas() {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animationFrameId;
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    // Preload all 8-directional ship sprites
    const loadedImages = {};
    Object.entries(SPRITE_MAP).forEach(([dir, src]) => {
      const img = new Image();
      img.src = src;
      loadedImages[dir] = img;
    });

    // Ship state
    const ship = {
      x: width * 0.5,
      y: height * 0.65,
      targetX: width * 0.5,
      targetY: height * 0.65,
      angle: -Math.PI / 2, // start pointing North
      speed: 0,
      maxSpeed: 4.8,
      size: 72, // Ship rendering size
    };

    // Wake and bow wave particles
    const wakes = [];
    const MAX_WAKES = 40;

    let lastWakeTime = 0;

    function handleResize() {
      if (!canvas) return;
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    }

    function handlePointerMove(e) {
      ship.targetX = e.clientX;
      ship.targetY = e.clientY;
    }

    function handleTouchMove(e) {
      if (e.touches.length > 0) {
        ship.targetX = e.touches[0].clientX;
        ship.targetY = e.touches[0].clientY;
      }
    }

    window.addEventListener("resize", handleResize);
    window.addEventListener("mousemove", handlePointerMove, { passive: true });
    window.addEventListener("touchmove", handleTouchMove, { passive: true });

    // Determine the 8-directional sprite key from an angle (radians)
    function getDirectionKey(angle) {
      // Normalize angle to [0, 2PI]
      let deg = ((angle * 180) / Math.PI + 90) % 360;
      if (deg < 0) deg += 360;

      if (deg >= 337.5 || deg < 22.5) return "n";
      if (deg >= 22.5 && deg < 67.5) return "ne";
      if (deg >= 67.5 && deg < 112.5) return "e";
      if (deg >= 112.5 && deg < 157.5) return "se";
      if (deg >= 157.5 && deg < 202.5) return "s";
      if (deg >= 202.5 && deg < 247.5) return "sw";
      if (deg >= 247.5 && deg < 292.5) return "w";
      return "nw";
    }

    // Helper: shortest angle difference
    function angleDiff(a, b) {
      let diff = (b - a) % (Math.PI * 2);
      if (diff < -Math.PI) diff += Math.PI * 2;
      if (diff > Math.PI) diff -= Math.PI * 2;
      return diff;
    }

    function spawnShipWakes(shipX, shipY, heading, speed) {
      if (wakes.length >= MAX_WAKES) wakes.shift();

      const sternX = shipX - Math.cos(heading) * 32;
      const sternY = shipY - Math.sin(heading) * 32;
      const backAngle = heading + Math.PI;

      // 1. Stern Propeller Wake Foam
      wakes.push({
        type: "stern",
        x: sternX + (Math.random() - 0.5) * 6,
        y: sternY + (Math.random() - 0.5) * 6,
        vx: Math.cos(backAngle) * (speed * 0.4 + 1.2),
        vy: Math.sin(backAngle) * (speed * 0.4 + 1.2),
        radius: 4,
        maxRadius: 18 + speed * 2,
        alpha: 0.8,
        decay: 0.024,
      });

      // 2. Twin Bow V-Wake Waves (left & right)
      if (speed > 1.2) {
        const bowX = shipX + Math.cos(heading) * 22;
        const bowY = shipY + Math.sin(heading) * 22;

        [-0.7, 0.7].forEach((sideAngle) => {
          if (wakes.length >= MAX_WAKES) wakes.shift();
          const armAngle = backAngle + sideAngle;
          wakes.push({
            type: "bow",
            x: bowX,
            y: bowY,
            vx: Math.cos(armAngle) * (speed * 0.5 + 1.0),
            vy: Math.sin(armAngle) * (speed * 0.5 + 1.0),
            radius: 3,
            maxRadius: 24 + speed * 2.5,
            alpha: 0.7,
            decay: 0.022,
          });
        });
      }
    }

    function animate(now) {
      ctx.clearRect(0, 0, width, height);

      // --- 1. Update Ship Physics ---
      const dx = ship.targetX - ship.x;
      const dy = ship.targetY - ship.y;
      const dist = Math.hypot(dx, dy);

      if (dist > 18) {
        // Turn smoothly towards target
        const targetAngle = Math.atan2(dy, dx);
        const diff = angleDiff(ship.angle, targetAngle);
        ship.angle += diff * 0.08;

        // Accelerate smoothly
        const targetSpeed = Math.min(dist * 0.06, ship.maxSpeed);
        ship.speed += (targetSpeed - ship.speed) * 0.08;

        // Move forward along current heading
        ship.x += Math.cos(ship.angle) * ship.speed;
        ship.y += Math.sin(ship.angle) * ship.speed;

        // Spawn wakes when moving
        if (now - lastWakeTime > 45 && ship.speed > 0.6) {
          spawnShipWakes(ship.x, ship.y, ship.angle, ship.speed);
          lastWakeTime = now;
        }
      } else {
        // Idle decelerate
        ship.speed *= 0.92;
        ship.x += Math.cos(ship.angle) * ship.speed;
        ship.y += Math.sin(ship.angle) * ship.speed;
      }

      // Gentle floating bobbing when idle
      const bobbing = Math.sin(now * 0.0025) * 1.5;
      const rollAngle = Math.sin(now * 0.002) * 0.03;

      // --- 2. Render Wake Waves ---
      for (let i = wakes.length - 1; i >= 0; i--) {
        const w = wakes[i];
        w.x += w.vx;
        w.y += w.vy;
        w.vx *= 0.96;
        w.vy *= 0.96;
        w.radius += 0.6;
        w.alpha -= w.decay;

        if (w.alpha <= 0 || w.radius >= w.maxRadius) {
          wakes.splice(i, 1);
          continue;
        }

        ctx.beginPath();
        ctx.arc(w.x, w.y, w.radius, 0, Math.PI * 2);
        if (w.type === "stern") {
          ctx.fillStyle = `rgba(224, 242, 254, ${w.alpha * 0.75})`;
          ctx.fill();
        } else {
          ctx.strokeStyle = `rgba(34, 211, 238, ${w.alpha * 0.6})`;
          ctx.lineWidth = 2;
          ctx.stroke();
        }
      }

      // --- 3. Render Ship with Directional Sprite ---
      const dirKey = getDirectionKey(ship.angle);
      const spriteImg = loadedImages[dirKey] || loadedImages["n"];

      ctx.save();
      ctx.translate(ship.x, ship.y + bobbing);

      // Subtle water shadow under the vessel
      ctx.beginPath();
      ctx.ellipse(4, 8, ship.size * 0.28, ship.size * 0.45, ship.angle + Math.PI / 2, 0, Math.PI * 2);
      ctx.fillStyle = "rgba(2, 11, 20, 0.45)";
      ctx.fill();

      // Draw the directional ship sprite
      if (spriteImg && spriteImg.complete && spriteImg.naturalWidth > 0) {
        const drawSize = ship.size;
        ctx.drawImage(spriteImg, -drawSize / 2, -drawSize / 2, drawSize, drawSize);
      }

      ctx.restore();

      animationFrameId = requestAnimationFrame(animate);
    }

    animationFrameId = requestAnimationFrame(animate);

    return () => {
      window.removeEventListener("resize", handleResize);
      window.removeEventListener("mousemove", handlePointerMove);
      window.removeEventListener("touchmove", handleTouchMove);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="pointer-events-none fixed inset-0 z-[2] h-full w-full"
    />
  );
}
