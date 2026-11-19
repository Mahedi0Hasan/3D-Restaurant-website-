"use client";

import { useMemo, useRef, useState } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";
import { seeded } from "@/lib/rand";

const rnd = seeded(42);

/* ---------- Procedural geometry helpers ---------- */

function bottomBunGeometry() {
  const pts: THREE.Vector2[] = [];
  const R = 1.52;
  pts.push(new THREE.Vector2(0, 0));
  pts.push(new THREE.Vector2(R - 0.15, 0));
  for (let i = 0; i <= 10; i++) {
    const a = -Math.PI / 2 + (i / 10) * Math.PI;
    pts.push(new THREE.Vector2(R - 0.15 + Math.cos(a) * 0.22, 0.22 + Math.sin(a) * 0.22));
  }
  pts.push(new THREE.Vector2(0, 0.44));
  return new THREE.LatheGeometry(pts, 72);
}

function topBunGeometry() {
  const pts: THREE.Vector2[] = [];
  const a = 1.58;
  const b = 1.1;
  pts.push(new THREE.Vector2(0, -0.04));
  pts.push(new THREE.Vector2(a - 0.1, -0.04));
  for (let i = 0; i <= 32; i++) {
    // from the rim (phi = 0) up to the crown (phi = PI/2)
    const phi = (i / 32) * (Math.PI / 2);
    // slightly flattened dome with a soft "muffin" bulge near the rim
    const bulge = 1 + 0.03 * Math.sin((i / 32) * Math.PI);
    pts.push(new THREE.Vector2(Math.max(0, a * Math.cos(phi) * bulge), b * Math.sin(phi)));
  }
  return new THREE.LatheGeometry(pts, 96);
}

function pattyGeometry() {
  const g = new THREE.CylinderGeometry(1.56, 1.6, 0.38, 96, 6);
  const pos = g.attributes.position as THREE.BufferAttribute;
  const v = new THREE.Vector3();
  for (let i = 0; i < pos.count; i++) {
    v.fromBufferAttribute(pos, i);
    const r = Math.hypot(v.x, v.z);
    const theta = Math.atan2(v.z, v.x);
    const n =
      Math.sin(theta * 9 + v.y * 6) * 0.025 +
      Math.sin(theta * 23) * 0.015 +
      (rnd() - 0.5) * 0.03;
    if (r > 0.01) {
      const k = (r + n) / r;
      v.x *= k;
      v.z *= k;
    }
    v.y += (rnd() - 0.5) * 0.02;
    pos.setXYZ(i, v.x, v.y, v.z);
  }
  g.computeVertexNormals();
  return g;
}

function cheeseGeometry() {
  const g = new THREE.PlaneGeometry(3.15, 3.15, 40, 40);
  g.rotateX(-Math.PI / 2);
  g.rotateY(Math.PI / 4);
  const pos = g.attributes.position as THREE.BufferAttribute;
  for (let i = 0; i < pos.count; i++) {
    const x = pos.getX(i);
    const z = pos.getZ(i);
    const r = Math.hypot(x, z);
    let y = 0;
    if (r > 1.4) y -= Math.pow(r - 1.4, 1.6) * 0.55;
    y += Math.sin(x * 3) * 0.01;
    pos.setY(i, y);
  }
  g.computeVertexNormals();
  return g;
}

function lettuceGeometry() {
  const g = new THREE.RingGeometry(0.1, 1.85, 160, 8);
  g.rotateX(-Math.PI / 2);
  const pos = g.attributes.position as THREE.BufferAttribute;
  for (let i = 0; i < pos.count; i++) {
    const x = pos.getX(i);
    const z = pos.getZ(i);
    const r = Math.hypot(x, z);
    const t = Math.atan2(z, x);
    const edge = Math.pow(r / 1.85, 3);
    let y = Math.sin(t * 15) * 0.12 * edge + Math.sin(t * 7 + 1.3) * 0.05 * edge;
    if (r > 1.5) y -= (r - 1.5) * 0.35;
    pos.setY(i, y);
  }
  g.computeVertexNormals();
  return g;
}

function makeSeeds(count: number) {
  const a = 1.58;
  const b = 1.1;
  const mats: THREE.Matrix4[] = [];
  const q = new THREE.Quaternion();
  const up = new THREE.Vector3(0, 1, 0);
  const spin = new THREE.Quaternion();
  for (let i = 0; i < count; i++) {
    const phi = 0.12 + rnd() * 1.0; // from the top
    const theta = rnd() * Math.PI * 2;
    const p = new THREE.Vector3(
      a * Math.sin(phi) * Math.cos(theta),
      b * Math.cos(phi),
      a * Math.sin(phi) * Math.sin(theta)
    );
    const n = new THREE.Vector3(p.x / (a * a), p.y / (b * b), p.z / (a * a)).normalize();
    p.addScaledVector(n, 0.012);
    q.setFromUnitVectors(up, n);
    spin.setFromAxisAngle(n, rnd() * Math.PI);
    q.premultiply(spin);
    const m = new THREE.Matrix4().compose(p, q, new THREE.Vector3(0.05, 0.022, 0.095));
    mats.push(m);
  }
  return mats;
}

/* ---------- Burger ---------- */

export interface BurgerProps {
  progress: React.MutableRefObject<number>;
  pointer: React.MutableRefObject<{ x: number; y: number }>;
}

export default function Burger({ progress, pointer }: BurgerProps) {
  const group = useRef<THREE.Group>(null);
  const layers = useRef<(THREE.Object3D | null)[]>([]);
  const seedsRef = useRef<THREE.InstancedMesh>(null);
  const [exploded, setExploded] = useState(false);
  const [hovered, setHovered] = useState(false);
  const explode = useRef(0);
  const { viewport, size } = useThree();

  const geo = useMemo(
    () => ({
      bottom: bottomBunGeometry(),
      top: topBunGeometry(),
      patty: pattyGeometry(),
      cheese: cheeseGeometry(),
      lettuce: lettuceGeometry(),
      tomato: new THREE.CylinderGeometry(1.38, 1.38, 0.1, 64),
      onion: new THREE.TorusGeometry(1.05, 0.05, 12, 64),
      seed: new THREE.SphereGeometry(1, 10, 8),
    }),
    []
  );

  const seedMatrices = useMemo(() => makeSeeds(140), []);

  const mats = useMemo(
    () => ({
      bun: new THREE.MeshPhysicalMaterial({
        color: "#c9792f",
        roughness: 0.55,
        clearcoat: 0.6,
        clearcoatRoughness: 0.45,
        sheen: 0.4,
        sheenColor: new THREE.Color("#ffb347"),
      }),
      bunBottom: new THREE.MeshStandardMaterial({ color: "#d48a3e", roughness: 0.75 }),
      patty: new THREE.MeshStandardMaterial({ color: "#3a1d10", roughness: 0.92, metalness: 0.05 }),
      cheese: new THREE.MeshPhysicalMaterial({
        color: "#ffb21f",
        roughness: 0.35,
        clearcoat: 0.4,
        side: THREE.DoubleSide,
        emissive: "#ff7a00",
        emissiveIntensity: 0.08,
      }),
      lettuce: new THREE.MeshStandardMaterial({ color: "#6dbb3c", roughness: 0.6, side: THREE.DoubleSide }),
      tomato: new THREE.MeshPhysicalMaterial({ color: "#d63a1f", roughness: 0.25, clearcoat: 1 }),
      onion: new THREE.MeshPhysicalMaterial({ color: "#b3478f", roughness: 0.3, clearcoat: 0.8 }),
      seed: new THREE.MeshStandardMaterial({ color: "#f7e7c4", roughness: 0.5 }),
    }),
    []
  );

  // stacking: [baseY, explodeFactor]
  const stack: [number, number][] = [
    [0, 0], // bottom bun
    [0.63, 1], // patty
    [0.84, 2], // cheese
    [0.9, 3], // lettuce
    [1.0, 4], // tomato
    [1.08, 4.6], // onion
    [1.12, 5.6], // top bun
  ];

  useFrame((state, delta) => {
    const g = group.current;
    if (!g) return;
    const t = state.clock.elapsedTime;
    const target = Math.max(exploded ? 1 : 0, Math.min(1, progress.current * 1.6));
    explode.current = THREE.MathUtils.damp(explode.current, target, 4, delta);

    layers.current.forEach((l, i) => {
      if (!l) return;
      const [base, f] = stack[i];
      l.position.y = base + explode.current * f * 0.42;
      l.rotation.y = explode.current * Math.sin(i * 1.7) * 0.35;
    });

    // Idle spin + pointer parallax
    const spin = t * 0.25 + (hovered ? 0.2 : 0);
    g.rotation.y = THREE.MathUtils.damp(g.rotation.y, spin + pointer.current.x * 0.6, 3, delta);
    g.rotation.x = THREE.MathUtils.damp(g.rotation.x, 0.32 + pointer.current.y * 0.25, 3, delta);

    // keep the exploded stack centred in frame
    g.position.y = -explode.current * 1.25;

    const s = THREE.MathUtils.damp(g.scale.x, (hovered ? 1.05 : 1) * (1 - explode.current * 0.12), 5, delta);
    g.scale.setScalar(s);
  });

  // Responsive placement: right side on desktop, centred higher on mobile
  const isWide = size.width >= 1024;
  const x = isWide ? viewport.width * 0.2 : 0;
  const y = isWide ? -0.4 : 1.2;
  const scale = isWide ? 0.74 : Math.min(0.62, viewport.width / 6.4);

  return (
    <group position={[x, y, 0]} scale={scale}>
      <group
        ref={group}
        rotation-x={0.32}
        onClick={(e) => {
          e.stopPropagation();
          setExploded((v) => !v);
        }}
        onPointerOver={(e) => {
          e.stopPropagation();
          setHovered(true);
          document.body.style.cursor = "pointer";
        }}
        onPointerOut={() => {
          setHovered(false);
          document.body.style.cursor = "";
        }}
      >
        <mesh ref={(m) => { layers.current[0] = m; }} geometry={geo.bottom} material={mats.bunBottom} castShadow />
        <mesh ref={(m) => { layers.current[1] = m; }} geometry={geo.patty} material={mats.patty} castShadow />
        <mesh ref={(m) => { layers.current[2] = m; }} geometry={geo.cheese} material={mats.cheese} castShadow />
        <mesh ref={(m) => { layers.current[3] = m; }} geometry={geo.lettuce} material={mats.lettuce} castShadow />
        <mesh ref={(m) => { layers.current[4] = m; }} geometry={geo.tomato} material={mats.tomato} castShadow />
        <group ref={(m) => { layers.current[5] = m; }}>
          <mesh geometry={geo.onion} material={mats.onion} rotation-x={Math.PI / 2} position={[0.25, 0, -0.1]} />
          <mesh geometry={geo.onion} material={mats.onion} rotation-x={Math.PI / 2} position={[-0.3, 0.02, 0.2]} scale={0.8} />
        </group>
        <group ref={(m) => { layers.current[6] = m; }}>
          <mesh geometry={geo.top} material={mats.bun} castShadow />
          <instancedMesh
            ref={(m) => {
              seedsRef.current = m;
              if (m) {
                seedMatrices.forEach((mat, i) => m.setMatrixAt(i, mat));
                m.instanceMatrix.needsUpdate = true;
              }
            }}
            args={[geo.seed, mats.seed, seedMatrices.length]}
          />
        </group>
      </group>
    </group>
  );
}
