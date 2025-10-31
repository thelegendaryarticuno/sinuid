"use client";
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { Html, OrbitControls, useTexture } from '@react-three/drei';
import { useEffect, useMemo, useRef } from 'react';
import * as THREE from 'three';
import QRCode from 'qrcode';

function useCardTexture({ name, qrUrl }) {
  return useMemo(() => {
    const canvas = document.createElement('canvas');
    canvas.width = 1024; // high res for crisp text
    canvas.height = 1600;
    const ctx = canvas.getContext('2d');

    // Background: dark gradient
    const grad = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
    grad.addColorStop(0, '#0b0b0f');
    grad.addColorStop(1, '#0f1116');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Subtle diagonal lines
    ctx.strokeStyle = 'rgba(255,255,255,0.06)';
    ctx.lineWidth = 1;
    for (let i = -canvas.height; i < canvas.width; i += 16) {
      ctx.beginPath();
      ctx.moveTo(i, 0);
      ctx.lineTo(i + canvas.height, canvas.height);
      ctx.stroke();
    }

    // Header text
    ctx.fillStyle = '#e5e7eb';
    ctx.font = '28px system-ui, -apple-system, Segoe UI, Roboto';
    ctx.fillText('CYBERNETIC SOLUTIONS', 64, 96);
    const dateStr = new Date().toLocaleDateString(undefined, { day: '2-digit', month: 'short', year: '2-digit' }).replace(/ /g,' / ');
    ctx.fillText(dateStr, 64, 136);
    ctx.fillText('NEW YORK', canvas.width - 280, 96);

    // Name and title
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 64px system-ui, -apple-system, Segoe UI, Roboto';
    ctx.fillText((name || 'NAME').toUpperCase(), 64, 1060);
    ctx.fillStyle = '#d1d5db';
    ctx.font = '28px system-ui, -apple-system, Segoe UI, Roboto';
    ctx.fillText('SYSTEM ARCHITECT', 64, 1110);

    // Footer line
    ctx.strokeStyle = 'rgba(255,255,255,0.6)';
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.moveTo(64, 1260);
    ctx.lineTo(canvas.width - 64, 1260);
    ctx.stroke();

    // Footer meta
    ctx.fillStyle = '#e5e7eb';
    ctx.font = '26px system-ui, -apple-system, Segoe UI, Roboto';
    ctx.fillText('EMPLOYEE ID: 7890', 64, 1380);
    ctx.fillText('ACCESS LEVEL: ALPHA', 64, 1430);

    // QR
    const drawQR = async () => {
      try {
        const dataUrl = await QRCode.toDataURL(qrUrl || 'https://example.com');
        const img = new Image();
        img.onload = () => {
          const size = 220;
          ctx.drawImage(img, canvas.width - size - 96, 120, size, size);
        };
        img.src = dataUrl;
      } catch (e) {
        // ignore
      }
    };
    drawQR();

    return canvas;
  }, [name, qrUrl]);
}

function CardMesh({ name, url }) {
  const canvas = useCardTexture({ name, qrUrl: url });
  const texture = useMemo(() => new THREE.CanvasTexture(canvas), [canvas]);
  useEffect(() => { texture.needsUpdate = true; }, [texture]);

  const meshRef = useRef();
  useFrame((state, delta) => {
    if (meshRef.current) meshRef.current.rotation.y += delta * 0.1;
  });

  return (
    <group>
      <mesh ref={meshRef} castShadow>
        {/* ID card aspect ratio ~ 2:3; scale to nice size */}
        <planeGeometry args={[2.0, 3.2, 1, 1]} />
        <meshStandardMaterial map={texture} roughness={0.6} metalness={0.1} />
      </mesh>
    </group>
  );
}

function Background() {
  // Tiled logo texture
  const tex = useTexture('/withoutext.png');
  const { viewport } = useThree();
  useEffect(() => {
    if (tex) {
      tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
      tex.repeat.set(3, 3);
      tex.needsUpdate = true;
    }
  }, [tex]);
  return (
    <mesh position={[0, 0, -1]}>
      <planeGeometry args={[viewport.width * 1.2, viewport.height * 1.2]} />
      <meshBasicMaterial map={tex} color={'#0a0c10'} opacity={0.08} transparent />
    </mesh>
  );
}

export default function IDCardCanvas({ name, url }) {
  return (
    <div className="w-full h-[70vh] rounded-xl overflow-hidden bg-black">
      <Canvas shadows camera={{ position: [0, 0, 5], fov: 40 }}>
        <ambientLight intensity={0.6} />
        <directionalLight position={[2, 2, 3]} intensity={1.4} castShadow />
        <Background />
        <CardMesh name={name} url={url} />
        <OrbitControls enablePan={false} minDistance={4} maxDistance={8} />
        <Html position={[0, -2, 0]} center>
          <div className="text-center text-zinc-300 text-sm opacity-80">
            Drag to rotate • Scroll to zoom
          </div>
        </Html>
      </Canvas>
    </div>
  );
}
