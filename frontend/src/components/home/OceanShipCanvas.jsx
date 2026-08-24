import { useEffect, useRef } from "react";
import shipImgSrc from "../../assets/ship/ship_n.png";

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

    // Preload single high-resolution research vessel sprite
    const shipImg = new Image();
    shipImg.src = shipImgSrc;

    // Ship state
    const ship = {
      x: width * 0.5,
      y: height * 0.65,
      targetX: width * 0.5,
      targetY: height * 0.65,
      angle: -Math.PI / 2, // start pointing North (-Y)
      speed: 0,
      maxSpeed: 1.8,
      size: 72, // Ship rendering size
    };

    // Wake and bow wave particles
    const wakes = [];
    const MAX_WAKES = 45;
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

    // Helper: shortest angular distance around [-PI, PI]
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
        // Continuous smooth rotation towards target cursor
        const targetAngle = Math.atan2(dy, dx);
        const diff = angleDiff(ship.angle, targetAngle);
        ship.angle += diff * 0.085;

        // Accelerate smoothly based on distance
        const targetSpeed = Math.min(dist * 0.03, ship.maxSpeed);
        ship.speed += (targetSpeed - ship.speed) * 0.04;

        // Move forward along current heading
        ship.x += Math.cos(ship.angle) * ship.speed;
        ship.y += Math.sin(ship.angle) * ship.speed;

        // Spawn wakes when cruising
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

      // Gentle floating bobbing and roll when on water
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

      // --- 3. Render Ship with Smooth 360° Canvas Rotation ---
      ctx.save();
      ctx.translate(ship.x, ship.y + bobbing);

      // Rotate canvas to exact continuous heading (sprite default orientation points North / -Y)
      const rotationRad = ship.angle + Math.PI / 2 + rollAngle;
      ctx.rotate(rotationRad);

      // Subtle water shadow under the vessel hull
      ctx.beginPath();
      ctx.ellipse(3, 6, ship.size * 0.24, ship.size * 0.44, 0, 0, Math.PI * 2);
      ctx.fillStyle = "rgba(2, 11, 20, 0.45)";
      ctx.fill();

      // Draw the single high-res vessel sprite
      if (shipImg && shipImg.complete && shipImg.naturalWidth > 0) {
        const drawSize = ship.size;
        ctx.drawImage(shipImg, -drawSize / 2, -drawSize / 2, drawSize, drawSize);
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
