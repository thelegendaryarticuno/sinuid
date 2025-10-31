"use client";
import { Canvas, useThree } from '@react-three/fiber';
import { useTexture } from '@react-three/drei';
import { useEffect, useMemo, useRef, useState } from 'react';
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

    // Watermark logo in the middle (blend)
    const drawLogo = () => {
      const img = new Image();
      img.onload = () => {
        const targetW = 760; // slightly larger for stronger presence
        const scale = targetW / img.width;
        const w = targetW;
        const h = img.height * scale;
        const x = (canvas.width - w) / 2; // centered
        const y = 520 - h / 2;
        ctx.save();
        // Use the logo's actual colors (no tint). Adjust only opacity for blending.
        ctx.globalAlpha = 0.38; // visible but not overpowering
        ctx.drawImage(img, x, y, w, h);
        ctx.restore();
      };
      img.src = '/withoutext.png';
    };
    drawLogo();

    // Name (bottom-left)
    ctx.fillStyle = '#e5e7eb';
    ctx.font = '700 68px system-ui, -apple-system, Segoe UI, Roboto';
    const label = (name || 'NAME').toUpperCase();
    ctx.fillText(label, 64, 1180);

    // Thin separator line
    ctx.strokeStyle = 'rgba(229,231,235,0.5)';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(64, 1260);
    ctx.lineTo(canvas.width - 64, 1260);
    ctx.stroke();

    // QR - High Quality
    const drawQR = async () => {
      try {
        const dataUrl = await QRCode.toDataURL(qrUrl || 'https://example.com', {
          width: 512,
          margin: 1,
          errorCorrectionLevel: 'H',
          color: {
            dark: '#000000',
            light: '#FFFFFF'
          }
        });
        const img = new Image();
        img.onload = () => {
          const size = 280; // Larger, higher quality QR code
          ctx.drawImage(img, canvas.width - size - 80, 100, size, size);
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

function QRCodeModal({ isOpen, onClose, qrUrl }) {
  const [qrDataUrl, setQrDataUrl] = useState('');

  useEffect(() => {
    if (isOpen && qrUrl) {
      QRCode.toDataURL(qrUrl, {
        width: 512,
        margin: 2,
        errorCorrectionLevel: 'H',
        color: {
          dark: '#000000',
          light: '#FFFFFF'
        }
      }).then(setQrDataUrl).catch(console.error);
    }
  }, [isOpen, qrUrl]);

  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-fadeIn"
      onClick={onClose}
    >
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" />
      
      {/* Modal Content */}
      <div 
        className="relative bg-white rounded-3xl shadow-2xl max-w-md w-full p-8 animate-scaleIn"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 w-10 h-10 flex items-center justify-center rounded-full bg-gray-100 hover:bg-gray-200 transition-colors"
          aria-label="Close"
        >
          <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        {/* Title */}
        <h2 className="text-2xl font-bold text-gray-900 mb-2 text-center">Scan QR Code</h2>
        <p className="text-gray-600 text-center mb-6 text-sm">Position your camera to scan</p>

        {/* QR Code */}
        <div className="bg-white p-6 rounded-2xl border-4 border-gray-100 shadow-inner">
          {qrDataUrl ? (
            <img 
              src={qrDataUrl} 
              alt="QR Code" 
              className="w-full h-auto"
            />
          ) : (
            <div className="w-full aspect-square bg-gray-100 rounded-xl animate-pulse" />
          )}
        </div>

        {/* Help Text */}
        <p className="text-xs text-gray-500 text-center mt-4">
          Tap outside to close
        </p>
      </div>
    </div>
  );
}

function CardMesh({ name, url }) {
  const canvas = useCardTexture({ name, qrUrl: url });
  const texture = useMemo(() => new THREE.CanvasTexture(canvas), [canvas]);
  useEffect(() => { texture.needsUpdate = true; }, [texture]);

  const meshRef = useRef();

  // Cinematic animation with mouse parallax
  useEffect(() => {
    let animationId;
    let mouseX = 0;
    let mouseY = 0;
    
    const handleMouseMove = (e) => {
      mouseX = (e.clientX / window.innerWidth) * 2 - 1;
      mouseY = -(e.clientY / window.innerHeight) * 2 + 1;
    };

    window.addEventListener('mousemove', handleMouseMove);

    const animate = () => {
      if (meshRef.current) {
        const time = Date.now() * 0.0005;
        
        // Smooth floating animation
        meshRef.current.position.y = Math.sin(time) * 0.1;
        
        // Cinematic rotation with mouse parallax
        meshRef.current.rotation.y = Math.sin(time * 0.5) * 0.3 + mouseX * 0.3;
        meshRef.current.rotation.x = Math.cos(time * 0.3) * 0.1 + mouseY * 0.2;
        meshRef.current.rotation.z = Math.sin(time * 0.2) * 0.05;
      }
      animationId = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      if (animationId) {
        cancelAnimationFrame(animationId);
      }
    };
  }, []);

  return (
    <group>
      <mesh ref={meshRef} castShadow receiveShadow>
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
  const [isQRModalOpen, setIsQRModalOpen] = useState(false);

  return (
    <>
      <div className="relative w-full">
        {/* Canvas Container - Responsive height */}
        <div className="w-full h-[50vh] sm:h-[60vh] md:h-[70vh] lg:h-[75vh] rounded-2xl overflow-hidden bg-black shadow-2xl">
          <Canvas shadows camera={{ position: [0, 0, 5], fov: 40 }}>
            <ambientLight intensity={0.6} />
            <directionalLight position={[2, 2, 3]} intensity={1.4} castShadow />
            <Background />
            <CardMesh name={name} url={url} />
          </Canvas>
        </div>

        {/* Floating Glassmorphism Button */}
        <button
          onClick={() => setIsQRModalOpen(true)}
          className="absolute bottom-4 left-1/2 -translate-x-1/2 
                     flex items-center gap-3 px-6 py-3.5 
                     bg-white/10 backdrop-blur-xl
                     border border-white/20 
                     rounded-full shadow-2xl
                     hover:bg-white/20 hover:border-white/30
                     active:scale-95
                     transition-all duration-300
                     text-white font-medium text-sm sm:text-base
                     group"
          aria-label="View QR Code"
        >
          {/* QR Icon */}
          <svg 
            className="w-5 h-5 sm:w-6 sm:h-6 group-hover:scale-110 transition-transform" 
            fill="none" 
            stroke="currentColor" 
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z" />
          </svg>
          <span className="hidden sm:inline">View QR Code</span>
          <span className="sm:hidden">Scan</span>
        </button>
      </div>

      {/* QR Code Modal */}
      <QRCodeModal 
        isOpen={isQRModalOpen} 
        onClose={() => setIsQRModalOpen(false)} 
        qrUrl={url} 
      />
    </>
  );
}
