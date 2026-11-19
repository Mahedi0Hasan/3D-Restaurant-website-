"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { ContactShadows, Environment, Float, Lightformer } from "@react-three/drei";
import * as THREE from "three";
import Burger from "./Burger";
import { seeded } from "@/lib/rand";

type Ptr = React.MutableRefObject<{ x: number; y: number }>;

export interface SceneQuality {
  low: boolean;
  reduced: boolean;
}

/* ---------- soft round sprite + smoke textures (generated, no network) ---------- */

function useEmberTexture() {
  return useMemo(() => {
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
}

function useSmokeTexture() {
  return useMemo(() => {
    const size = 256;
    const c = document.createElement("canvas");
    c.width = c.height = size;
    const ctx = c.getContext("2d")!;
    const rnd = seeded(7);
    // overlapping soft blobs = wispy, irregular puff
    for (let i = 0; i < 26; i++) {
      const x = size / 2 + (rnd() - 0.5) * size * 0.45;
      const y = size / 2 + (rnd() - 0.5) * size * 0.45;
      const r = size * (0.12 + rnd() * 0.22);
      const g = ctx.createRadialGradient(x, y, 0, x, y, r);
      g.addColorStop(0, "rgba(255,255,255,0.32)");
      g.addColorStop(1, "rgba(255,255,255,0)");
      ctx.fillStyle = g;
      ctx.fillRect(0, 0, size, size);
    }
    // fade the edges so no square shows
    const mask = ctx.createRadialGradient(size / 2, size / 2, size * 0.2, size / 2, size / 2, size / 2);
    mask.addColorStop(0, "rgba(0,0,0,1)");
    mask.addColorStop(1, "rgba(0,0,0,0)");
    ctx.globalCompositeOperation = "destination-in";
    ctx.fillStyle = mask;
    ctx.fillRect(0, 0, size, size);
    const t = new THREE.CanvasTexture(c);
    t.colorSpace = THREE.SRGBColorSpace;
    return t;
  }, []);
}

/* ---------- Embers ---------- */

function Embers({ count }: { count: number }) {
  const ref = useRef<THREE.Points>(null);
  const texture = useEmberTexture();
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

/* ---------- Ambient smoke: slow drifting billboards ---------- */

function Smoke({ count, offsetX }: { count: number; offsetX: number }) {
  const texture = useSmokeTexture();
  const group = useRef<THREE.Group>(null);
  const puffs = useMemo(() => {
    const rnd = seeded(31);
    return Array.from({ length: count }, (_, i) => ({
      x: (rnd() - 0.5) * 7,
      y: -2.6 + rnd() * 5,
      z: -2.5 + rnd() * 2.2,
      scale: 2.8 + rnd() * 3,
      speed: 0.08 + rnd() * 0.12,
      spin: (rnd() - 0.5) * 0.08,
      phase: rnd() * Math.PI * 2,
      opacity: 0.22 + rnd() * 0.16,
      warm: i % 3 === 0,
    }));
  }, [count]);

  useFrame((state, delta) => {
    const g = group.current;
    if (!g) return;
    const t = state.clock.elapsedTime;
    g.children.forEach((child, i) => {
      const p = puffs[i];
      const m = child as THREE.Mesh;
      m.position.y += p.speed * delta;
      m.position.x = p.x + Math.sin(t * 0.15 + p.phase) * 0.6;
      m.rotation.z += p.spin * delta;
      // fade in at the bottom, out at the top
      const life = THREE.MathUtils.clamp((m.position.y + 2.8) / 5.6, 0, 1);
      (m.material as THREE.MeshBasicMaterial).opacity = p.opacity * Math.sin(life * Math.PI);
      if (m.position.y > 2.8) m.position.y = -2.8;
    });
  });

  return (
    <group ref={group} position={[offsetX, 0, 0]}>
      {puffs.map((p, i) => (
        <mesh key={i} position={[p.x, p.y, p.z]} scale={p.scale} rotation-z={p.phase}>
          <planeGeometry args={[1, 1]} />
          <meshBasicMaterial
            map={texture}
            transparent
            depthWrite={false}
            opacity={p.opacity}
            color={p.warm ? "#ffb27a" : "#c9b8a6"}
          />
        </mesh>
      ))}
    </group>
  );
}

/* ---------- Floating ingredients orbiting the burger ---------- */

function FloatingBits({ pointer, wide }: { pointer: Ptr; wide: boolean }) {
  const ref = useRef<THREE.Group>(null);
  const mats = useMemo(
    () => ({
      tomato: new THREE.MeshPhysicalMaterial({ color: "#d63a1f", roughness: 0.25, clearcoat: 1 }),
      lettuce: new THREE.MeshStandardMaterial({ color: "#6dbb3c", roughness: 0.6, side: THREE.DoubleSide }),
      fry: new THREE.MeshStandardMaterial({ color: "#f2b544", roughness: 0.55 }),
      onion: new THREE.MeshPhysicalMaterial({ color: "#b3478f", roughness: 0.3, clearcoat: 0.8 }),
      seed: new THREE.MeshStandardMaterial({ color: "#f7e7c4", roughness: 0.5 }),
    }),
    []
  );
  const leaf = useMemo(() => {
    const g = new THREE.CircleGeometry(0.42, 32);
    const pos = g.attributes.position as THREE.BufferAttribute;
    for (let i = 0; i < pos.count; i++) {
      const x = pos.getX(i);
      const y = pos.getY(i);
      const r = Math.hypot(x, y);
      pos.setZ(i, Math.sin(Math.atan2(y, x) * 7) * 0.05 * (r / 0.42) + r * r * 0.25);
    }
    g.computeVertexNormals();
    return g;
  }, []);

  useFrame((_, delta) => {
    const g = ref.current;
    if (!g) return;
    // deeper parallax than the burger for a layered feel
    g.position.x = THREE.MathUtils.damp(g.position.x, pointer.current.x * 0.35, 2, delta);
    g.position.y = THREE.MathUtils.damp(g.position.y, pointer.current.y * 0.2, 2, delta);
  });

  // [position, rotation, kind, scale, speed]
  const bits: [number[], number[], keyof typeof mats | "leaf", number, number][] = wide
    ? [
        [[-1.45, 1.55, -0.9], [0.9, 0.3, 0.2], "tomato", 0.2, 1.4],
        [[2.15, 1.35, -1.2], [0.4, 0.8, 0.6], "leaf", 0.75, 1.1],
        [[-1.55, -1.45, -0.4], [0.3, 0.2, 1.1], "fry", 0.6, 1.7],
        [[2.0, -1.25, 0.5], [1.2, 0.1, 0.4], "onion", 0.2, 1.3],
        [[0.7, 2.25, -1.6], [0.2, 0.4, 0.9], "fry", 0.55, 1.5],
      ]
    : [
        [[1.05, 0.75, -1.2], [0.9, 0.3, 0.2], "tomato", 0.14, 1.4],
        [[-1.05, -0.35, -0.8], [0.4, 0.8, 0.6], "fry", 0.4, 1.6],
      ];

  return (
    <group ref={ref}>
      {bits.map(([p, r, kind, s, speed], i) => (
        <Float key={i} speed={speed} rotationIntensity={1.2} floatIntensity={1.4}>
          <group position={p as [number, number, number]} rotation={r as [number, number, number]} scale={s}>
            {kind === "tomato" && (
              <mesh material={mats.tomato}>
                <cylinderGeometry args={[1, 1, 0.16, 40]} />
              </mesh>
            )}
            {kind === "onion" && (
              <mesh material={mats.onion}>
                <torusGeometry args={[1, 0.12, 12, 48]} />
              </mesh>
            )}
            {kind === "fry" && (
              <mesh material={mats.fry}>
                <boxGeometry args={[0.13, 0.95, 0.13]} />
              </mesh>
            )}
            {kind === "leaf" && <mesh geometry={leaf} material={mats.lettuce} />}
          </group>
        </Float>
      ))}
    </group>
  );
}

/* ---------- Fire-flicker key light ---------- */

function FlickerLight() {
  const ref = useRef<THREE.PointLight>(null);
  useFrame((state) => {
    const t = state.clock.elapsedTime;
    if (ref.current) {
      ref.current.intensity = 55 + Math.sin(t * 7.3) * 6 + Math.sin(t * 13.1) * 4 + Math.sin(t * 2.1) * 8;
    }
  });
  return <pointLight ref={ref} position={[-4, -0.5, 2.5]} intensity={60} color="#ff6a14" distance={14} />;
}

/** Positions children at the same anchor the burger uses (right side on desktop). */
function BurgerAnchor({ y = 0, children }: { y?: number; children: React.ReactNode }) {
  const { viewport, size } = useThree();
  const wide = size.width >= 1024;
  return <group position={[wide ? viewport.width * 0.2 : 0, wide ? y : y + 1.2, 0]}>{children}</group>;
}

function Rig({ pointer }: { pointer: Ptr }) {
  useFrame((state, delta) => {
    const cam = state.camera;
    cam.position.x = THREE.MathUtils.damp(cam.position.x, pointer.current.x * 0.4, 2, delta);
    cam.position.y = THREE.MathUtils.damp(cam.position.y, 1.2 + pointer.current.y * 0.25, 2, delta);
    cam.lookAt(0, 0.2, 0);
  });
  return null;
}

export default function HeroScene({
  progress,
  quality,
}: {
  progress: React.MutableRefObject<number>;
  quality: SceneQuality;
}) {
  const wrap = useRef<HTMLDivElement>(null);
  const pointer = useRef({ x: 0, y: 0 });
  const [visible, setVisible] = useState(true);
  const [wide, setWide] = useState(true);

  useEffect(() => {
    const onMove = (e: PointerEvent) => {
      if (e.pointerType === "touch") return;
      pointer.current.x = (e.clientX / window.innerWidth) * 2 - 1;
      pointer.current.y = -((e.clientY / window.innerHeight) * 2 - 1);
    };
    const onResize = () => setWide(window.innerWidth >= 1024);
    onResize();
    window.addEventListener("pointermove", onMove, { passive: true });
    window.addEventListener("resize", onResize);
    const io = new IntersectionObserver(([entry]) => setVisible(entry.isIntersecting), { threshold: 0 });
    if (wrap.current) io.observe(wrap.current);
    return () => {
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("resize", onResize);
      io.disconnect();
    };
  }, []);

  const { low, reduced } = quality;

  return (
    <div ref={wrap} className="absolute inset-0">
      <Canvas
        frameloop={reduced ? "demand" : visible ? "always" : "never"}
        dpr={low ? [1, 1.5] : [1, 1.75]}
        camera={{ position: [0, 1.2, 8], fov: 35 }}
        gl={{ antialias: true, alpha: true, powerPreference: "high-performance" }}
        shadows={low ? false : "percentage"}
      >
        <ambientLight intensity={0.22} />
        <spotLight
          position={[4, 7, 4]}
          angle={0.5}
          penumbra={0.8}
          intensity={170}
          color="#ffc58a"
          castShadow={!low}
          shadow-mapSize={[1024, 1024]}
        />
        <FlickerLight />
        <pointLight position={[3, -1, -3]} intensity={55} color="#d9a54a" />
        {/* cool-warm rim light from behind for a cinematic edge */}
        <directionalLight position={[-2, 3, -6]} intensity={2.2} color="#ffd29a" />

        {!low && (
          <BurgerAnchor>
            <Smoke count={wide ? 9 : 5} offsetX={0} />
          </BurgerAnchor>
        )}

        <Float speed={reduced ? 0 : 1.6} rotationIntensity={0.15} floatIntensity={0.6}>
          <Burger progress={progress} pointer={pointer} />
        </Float>

        {!reduced && (
          <BurgerAnchor y={-0.2}>
            <FloatingBits pointer={pointer} wide={wide} />
          </BurgerAnchor>
        )}

        <ContactShadows position={[0, -1.7, 0]} opacity={0.6} scale={14} blur={2.6} far={4} color="#000" frames={low ? 1 : Infinity} />
        {!reduced && <Embers count={low ? 110 : 240} />}
        {!reduced && <Rig pointer={pointer} />}

        <Environment resolution={low ? 64 : 128}>
          <Lightformer form="rect" intensity={2.5} color="#ffb070" position={[3, 3, 3]} scale={[4, 2, 1]} />
          <Lightformer form="rect" intensity={1.5} color="#ff7a1a" position={[-4, 1, 1]} scale={[2, 4, 1]} />
          <Lightformer form="ring" intensity={1.2} color="#f0cf8a" position={[0, 4, -4]} scale={3} />
        </Environment>
      </Canvas>
    </div>
  );
}
