import React, { useEffect, useRef } from 'react';

interface Node {
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
  baseAlpha: number;
}

interface CourierPacket {
  fromNode: number;
  toNode: number;
  progress: number; // 0 to 1
  speed: number;
}

export const AnimatedLogisticsBackground: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    // Number of logistical nodes based on screen size
    const nodeCount = Math.floor(Math.min(width, 1600) / 28);
    const nodes: Node[] = [];
    const packets: CourierPacket[] = [];
    const maxDistance = 140;

    for (let i = 0; i < nodeCount; i++) {
      nodes.push({
        x: Math.random() * width,
        y: Math.random() * height,
        vx: (Math.random() - 0.5) * 0.45,
        vy: (Math.random() - 0.5) * 0.45,
        radius: Math.random() * 2 + 1.2,
        baseAlpha: Math.random() * 0.5 + 0.3,
      });
    }

    // Spawn courier package delivery pulses along route lines
    const maybeSpawnPacket = (i: number, j: number) => {
      if (packets.length > 25) return;
      if (Math.random() < 0.008) {
        packets.push({
          fromNode: i,
          toNode: j,
          progress: 0,
          speed: 0.006 + Math.random() * 0.008,
        });
      }
    };

    let mouseX = -9999;
    let mouseY = -9999;

    const handleMouseMove = (e: MouseEvent) => {
      mouseX = e.clientX;
      mouseY = e.clientY;
    };

    const handleResize = () => {
      if (!canvas) return;
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };

    window.addEventListener('mousemove', handleMouseMove, { passive: true });
    window.addEventListener('resize', handleResize);

    const render = () => {
      ctx.clearRect(0, 0, width, height);

      // 1. Update and draw nodes
      for (let i = 0; i < nodes.length; i++) {
        const node = nodes[i];
        node.x += node.vx;
        node.y += node.vy;

        // Bounce on borders with soft padding
        if (node.x < 0 || node.x > width) node.vx *= -1;
        if (node.y < 0 || node.y > height) node.vy *= -1;

        // Subtle mouse repulsion for interactivity
        const dxMouse = node.x - mouseX;
        const dyMouse = node.y - mouseY;
        const distMouse = Math.hypot(dxMouse, dyMouse);
        if (distMouse < 100) {
          node.x += (dxMouse / distMouse) * 0.6;
          node.y += (dyMouse / distMouse) * 0.6;
        }

        // Draw node (courier dispatch hub / waypoint)
        ctx.beginPath();
        ctx.arc(node.x, node.y, node.radius, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(239, 68, 68, ${node.baseAlpha * 0.8})`; // Red 500
        ctx.shadowColor = 'rgba(239, 68, 68, 0.6)';
        ctx.shadowBlur = 6;
        ctx.fill();
        ctx.shadowBlur = 0;
      }

      // 2. Draw connections (delivery routes)
      for (let i = 0; i < nodes.length; i++) {
        for (let j = i + 1; j < nodes.length; j++) {
          const dx = nodes[i].x - nodes[j].x;
          const dy = nodes[i].y - nodes[j].y;
          const dist = Math.hypot(dx, dy);

          if (dist < maxDistance) {
            const alpha = (1 - dist / maxDistance) * 0.22;
            ctx.beginPath();
            ctx.moveTo(nodes[i].x, nodes[i].y);
            ctx.lineTo(nodes[j].x, nodes[j].y);
            ctx.strokeStyle = `rgba(244, 63, 94, ${alpha})`; // Rose 500
            ctx.lineWidth = 0.85;
            ctx.stroke();

            // Chance to send a packet across this connection
            maybeSpawnPacket(i, j);
          }
        }
      }

      // 3. Draw & update active courier package pulses
      for (let p = packets.length - 1; p >= 0; p--) {
        const pkt = packets[p];
        pkt.progress += pkt.speed;

        const from = nodes[pkt.fromNode];
        const to = nodes[pkt.toNode];

        if (!from || !to || pkt.progress >= 1) {
          packets.splice(p, 1);
          continue;
        }

        const currX = from.x + (to.x - from.x) * pkt.progress;
        const currY = from.y + (to.y - from.y) * pkt.progress;

        // Glowing packet dot
        ctx.beginPath();
        ctx.arc(currX, currY, 2.5, 0, Math.PI * 2);
        ctx.fillStyle = '#ffffff';
        ctx.shadowColor = '#f43f5e';
        ctx.shadowBlur = 10;
        ctx.fill();
        ctx.shadowBlur = 0;
      }

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  return (
    <div
      aria-hidden="true"
      className="pointer-events-none fixed inset-0 z-0 overflow-hidden bg-slate-950"
    >
      {/* Subtle modern cyber-grid background */}
      <div 
        className="absolute inset-0 opacity-[0.035]"
        style={{
          backgroundImage: `radial-gradient(rgba(255, 255, 255, 0.8) 1px, transparent 1px)`,
          backgroundSize: '32px 32px'
        }}
      />

      {/* Floating ambient radial color glows */}
      <div className="absolute -top-32 -left-32 w-[550px] h-[550px] bg-red-600/10 rounded-full blur-[140px] animate-pulse pointer-events-none" />
      <div className="absolute top-1/3 -right-40 w-[600px] h-[600px] bg-rose-600/10 rounded-full blur-[160px] pointer-events-none" />
      <div className="absolute -bottom-40 left-1/4 w-[650px] h-[650px] bg-red-950/20 rounded-full blur-[150px] pointer-events-none" />

      {/* Real-time Logistics Network Canvas */}
      <canvas
        ref={canvasRef}
        className="absolute inset-0 w-full h-full block"
      />
    </div>
  );
};

export default AnimatedLogisticsBackground;
