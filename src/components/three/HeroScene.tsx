"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { ContactShadows, Environment, Float, Lightformer } from "@react-three/drei";
import * as THREE from "three";
import Burger from "./Burger";
import { seeded } from "@/lib/rand";

function Embers({ count = 260 }: { count?: number }) {
  const ref = useRef<THREE.Points>(null);
  const { positions, speeds } = useMemo(() => {
    const rnd = seeded(1986);
    const positions = new Float32Array(count * 3);
    const speeds = new Float32Array(count);
    for (let i = 0; i < count; i++) {
      positions[i * 3] = (rnd() - 0.5) * 16;
      positions[i * 3 + 1] = (rnd() - 0.5) * 10;
      positions[i * 3 + 2] = (rnd() - 0.5) * 6 - 1;
      speeds[i] = 0.2 + rnd() * 0.6;
    }
    return { positions, speeds };
  }, [count]);

  const texture = useMemo(() => {
    const c = document.createElement("canvas");
    c.width = c.height = 64;
    const ctx = c.getContext("2d")!;
    const g = ctx.createRadialGradient(32, 32, 0, 32, 32, 32);
    g.addColorStop(0, "rgba(255,230,180,1)");
    g.addColorStop(0.3, "rgba(255,150,50,0.8)");
    g.addColorStop(1, "rgba(255,90,0,0)");
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, 64, 64);
    return new THREE.CanvasTexture(c);
  }, []);

  useFrame((state, delta) => {
    const p = ref.current;
    if (!p) return;
    const arr = p.geometry.attributes.position.array as Float32Array;
    const t = state.clock.elapsedTime;
    for (let i = 0; i < count; i++) {
      arr[i * 3 + 1] += speeds[i] * delta;
      arr[i * 3] += Math.sin(t * 0.8 + i) * 0.002;
      if (arr[i * 3 + 1] > 5) arr[i * 3 + 1] = -5;
    }
    p.geometry.attributes.position.needsUpdate = true;
  });

  return (
    <points ref={ref}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
      </bufferGeometry>
      <pointsMaterial
        map={texture}
        size={0.09}
        sizeAttenuation
        transparent
        depthWrite={false}
        blending={THREE.AdditiveBlending}
        color="#ffb066"
      />
    </points>
  );
}

function Rig({ pointer }: { pointer: React.MutableRefObject<{ x: number; y: number }> }) {
  useFrame((state, delta) => {
    const cam = state.camera;
    cam.position.x = THREE.MathUtils.damp(cam.position.x, pointer.current.x * 0.4, 2, delta);
    cam.position.y = THREE.MathUtils.damp(cam.position.y, 1.2 + pointer.current.y * 0.25, 2, delta);
    cam.lookAt(0, 0.2, 0);
  });
  return null;
}

export default function HeroScene({ progress }: { progress: React.MutableRefObject<number> }) {
  const wrap = useRef<HTMLDivElement>(null);
  const pointer = useRef({ x: 0, y: 0 });
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const onMove = (e: PointerEvent) => {
      pointer.current.x = (e.clientX / window.innerWidth) * 2 - 1;
      pointer.current.y = -((e.clientY / window.innerHeight) * 2 - 1);
    };
    window.addEventListener("pointermove", onMove, { passive: true });
    const io = new IntersectionObserver(([entry]) => setVisible(entry.isIntersecting), {
      threshold: 0,
    });
    if (wrap.current) io.observe(wrap.current);
    return () => {
      window.removeEventListener("pointermove", onMove);
      io.disconnect();
    };
  }, []);

  return (
    <div ref={wrap} className="absolute inset-0">
      <Canvas
        frameloop={visible ? "always" : "never"}
        dpr={[1, 1.75]}
        camera={{ position: [0, 1.2, 8], fov: 35 }}
        gl={{ antialias: true, alpha: true, powerPreference: "high-performance" }}
        shadows="percentage"
      >
        <ambientLight intensity={0.25} />
        <spotLight
          position={[4, 7, 4]}
          angle={0.5}
          penumbra={0.8}
          intensity={160}
          color="#ffc58a"
          castShadow
          shadow-mapSize={[1024, 1024]}
        />
        <pointLight position={[-5, 1, 2]} intensity={60} color="#ff7a1a" />
        <pointLight position={[3, -1, -3]} intensity={50} color="#d9a54a" />
        <directionalLight position={[0, 3, -5]} intensity={1.6} color="#ffd29a" />

        <Float speed={1.6} rotationIntensity={0.15} floatIntensity={0.6}>
          <Burger progress={progress} pointer={pointer} />
        </Float>

        <ContactShadows position={[0, -1.7, 0]} opacity={0.6} scale={14} blur={2.6} far={4} color="#000" />
        <Embers />
        <Rig pointer={pointer} />

        <Environment resolution={128}>
          <Lightformer form="rect" intensity={2.5} color="#ffb070" position={[3, 3, 3]} scale={[4, 2, 1]} />
          <Lightformer form="rect" intensity={1.5} color="#ff7a1a" position={[-4, 1, 1]} scale={[2, 4, 1]} />
          <Lightformer form="ring" intensity={1.2} color="#f0cf8a" position={[0, 4, -4]} scale={3} />
        </Environment>
      </Canvas>
    </div>
  );
}
