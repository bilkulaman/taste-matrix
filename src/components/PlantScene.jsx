// components/PlantScene.jsx
// Procedural bonsai matching the Virella reference:
//   – compact size (fits ~55% of viewport)
//   – twisted trunk, 5 branches splaying outward
//   – instanced leaves clustered at branch TIPS (not filled crown)
//   – pale-lilac flower spheres at tips
//   – rough square stone BLOCK pedestal (box, not cylinder)
//   – violet rim light from behind

import { Suspense, useRef, useMemo, useEffect, useState, useCallback } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import * as THREE from 'three'

// ─── Helpers ─────────────────────────────────────────────────────────────────

function lerp(a, b, t) { return a + (b - a) * t }

function makeSeeded(seed) {
  let s = seed
  return () => { s = (s * 16807) % 2147483647; return (s - 1) / 2147483646 }
}

function springLerp(cur, tgt, k) { return cur + (tgt - cur) * k }

// ─── Trunk ────────────────────────────────────────────────────────────────────
// Matches reference: twists left-right as it rises, thicker at base

function Trunk() {
  const geo = useMemo(() => {
    const pts = [
      new THREE.Vector3( 0.00,  0.00,  0.00),
      new THREE.Vector3( 0.06,  0.22,  0.02),
      new THREE.Vector3(-0.05,  0.45,  0.03),
      new THREE.Vector3( 0.08,  0.68,  0.00),
      new THREE.Vector3(-0.04,  0.88,  0.02),
      new THREE.Vector3( 0.03,  1.05,  0.01),
    ]
    const curve = new THREE.CatmullRomCurve3(pts)
    // Taper from base to tip
    const radii = (u) => lerp(0.075, 0.025, u)
    const segments = 28
    const geo = new THREE.TubeGeometry(curve, segments, 0, 7, false)
    // Manual radius taper via positions
    const pos = geo.attributes.position
    const totalRings = segments + 1
    const vertsPerRing = 8
    for (let ring = 0; ring < totalRings; ring++) {
      const t = ring / segments
      const r = lerp(0.075, 0.025, t)
      const center = curve.getPoint(t)
      // Find vertices in this ring and scale them outward from center
      for (let v = 0; v < vertsPerRing; v++) {
        const idx = ring * vertsPerRing + v
        if (idx >= pos.count) continue
        const x = pos.getX(idx)
        const y = pos.getY(idx)
        const z = pos.getZ(idx)
        // Push outward from trunk center
        const dx = x - center.x
        const dz = z - center.z
        const len = Math.sqrt(dx * dx + dz * dz) || 1
        pos.setX(idx, center.x + (dx / len) * r)
        pos.setY(idx, y)
        pos.setZ(idx, center.z + (dz / len) * r)
      }
    }
    pos.needsUpdate = true
    geo.computeVertexNormals()
    return geo
  }, [])

  return (
    <mesh geometry={geo} castShadow>
      <meshStandardMaterial color="#6b3d1e" roughness={0.95} metalness={0} />
    </mesh>
  )
}

// ─── Branch ───────────────────────────────────────────────────────────────────

function Branch({ start, mid, end, radius }) {
  const geo = useMemo(() => {
    const curve = new THREE.CatmullRomCurve3([start, mid, end])
    return new THREE.TubeGeometry(curve, 10, radius, 6, false)
  }, [start, mid, end, radius])

  return (
    <mesh geometry={geo} castShadow>
      <meshStandardMaterial color="#7a4a28" roughness={0.93} metalness={0} />
    </mesh>
  )
}

// ─── Instanced Leaves (clustered at branch tips only) ────────────────────────

function LeafCluster({ center, count, spread = 0.22 }) {
  const meshRef = useRef()
  const dummy   = useMemo(() => new THREE.Object3D(), [])
  const time    = useRef(0)

  // Store base positions for sway
  const bases = useRef([])

  const geo = useMemo(() => new THREE.PlaneGeometry(0.10, 0.16), [])

  useEffect(() => {
    if (!meshRef.current) return
    const r = makeSeeded(center.x * 100 + center.y * 37)
    bases.current = []
    for (let i = 0; i < count; i++) {
      const p = {
        x: center.x + (r() - 0.5) * spread * 2,
        y: center.y + (r() - 0.5) * spread,
        z: center.z + (r() - 0.5) * spread * 2,
        rx: (r() - 0.5) * 1.0,
        ry: r() * Math.PI * 2,
        rz: (r() - 0.5) * 0.8,
        s:  0.6 + r() * 0.7,
      }
      bases.current.push(p)
      dummy.position.set(p.x, p.y, p.z)
      dummy.rotation.set(p.rx, p.ry, p.rz)
      dummy.scale.setScalar(p.s)
      dummy.updateMatrix()
      meshRef.current.setMatrixAt(i, dummy.matrix)
    }
    meshRef.current.instanceMatrix.needsUpdate = true
  }, [center, count, spread, dummy])

  useFrame((_, delta) => {
    if (!meshRef.current || !bases.current.length) return
    time.current += delta
    const t = time.current
    for (let i = 0; i < count; i++) {
      const b = bases.current[i]
      if (!b) continue
      dummy.position.set(
        b.x,
        b.y + Math.sin(t * 1.2 + i * 0.5) * 0.012,
        b.z,
      )
      dummy.rotation.set(
        b.rx + Math.sin(t * 0.9 + i * 0.6) * 0.07,
        b.ry,
        b.rz + Math.sin(t * 1.4 + i * 0.8) * 0.06,
      )
      dummy.scale.setScalar(b.s)
      dummy.updateMatrix()
      meshRef.current.setMatrixAt(i, dummy.matrix)
    }
    meshRef.current.instanceMatrix.needsUpdate = true
  })

  return (
    <instancedMesh ref={meshRef} args={[geo, null, count]} castShadow>
      <meshStandardMaterial
        color="#2e7d32"
        emissive="#1b5e20"
        emissiveIntensity={0.12}
        roughness={0.85}
        metalness={0}
        side={THREE.DoubleSide}
      />
    </instancedMesh>
  )
}

// ─── Flower at tip ────────────────────────────────────────────────────────────

function FlowerCluster({ center, count = 3 }) {
  const r = makeSeeded(center.x * 71 + center.z * 53)
  const positions = Array.from({ length: count }, () => [
    center.x + (r() - 0.5) * 0.12,
    center.y + r() * 0.08,
    center.z + (r() - 0.5) * 0.12,
  ])

  return (
    <group>
      {positions.map((p, i) => (
        <mesh key={i} position={p} castShadow>
          <sphereGeometry args={[0.028, 6, 6]} />
          <meshStandardMaterial
            color="#e8dff5"
            emissive="#b39ddb"
            emissiveIntensity={0.45}
            roughness={0.4}
          />
        </mesh>
      ))}
    </group>
  )
}

// ─── Stone Block Pedestal (square, like reference) ───────────────────────────

function Pedestal() {
  return (
    <group position={[0, -0.22, 0]}>
      {/* Main block */}
      <mesh castShadow receiveShadow>
        <boxGeometry args={[0.62, 0.38, 0.62]} />
        <meshStandardMaterial color="#a89880" roughness={0.98} metalness={0} />
      </mesh>
      {/* Slight lip at top */}
      <mesh position={[0, 0.20, 0]} castShadow>
        <boxGeometry args={[0.65, 0.04, 0.65]} />
        <meshStandardMaterial color="#9e8c7a" roughness={0.99} metalness={0} />
      </mesh>
    </group>
  )
}

// ─── Full Bonsai Group ───────────────────────────────────────────────────────

// Branch definitions: start (from trunk), spread direction, end tip
const BRANCH_DEFS = [
  // left-lower
  { attachY: 0.48, dir: new THREE.Vector3(-1, 0.18, 0.15), len: 0.46, r: 0.020 },
  // right-lower
  { attachY: 0.58, dir: new THREE.Vector3( 1, 0.22, -0.10), len: 0.44, r: 0.020 },
  // left-mid
  { attachY: 0.72, dir: new THREE.Vector3(-0.85, 0.28, -0.15), len: 0.42, r: 0.016 },
  // right-mid
  { attachY: 0.82, dir: new THREE.Vector3( 0.80, 0.30, 0.12), len: 0.40, r: 0.016 },
  // upper-back
  { attachY: 0.96, dir: new THREE.Vector3(-0.2, 0.45, -0.5), len: 0.35, r: 0.013 },
]

function buildBranch(def, trunkCurve) {
  const t = def.attachY / 1.05  // normalise to curve param
  const attach = trunkCurve.getPoint(Math.min(t, 1))
  const tip = attach.clone().addScaledVector(def.dir.clone().normalize(), def.len)
  const mid = new THREE.Vector3(
    lerp(attach.x, tip.x, 0.5) + def.dir.x * 0.06,
    lerp(attach.y, tip.y, 0.45),
    lerp(attach.z, tip.z, 0.5) + def.dir.z * 0.06,
  )
  return { attach, mid, tip, radius: def.r }
}

function PlantGroup({ isMobile, scrollY, mouseXTarget, mouseYTarget, introProgress, prefersReduced }) {
  const groupRef = useRef()
  const time = useRef(0)
  const smoothX = useRef(0)
  const smoothY = useRef(0)
  const smoothScrollY = useRef(0)

  // Build trunk curve (same pts as Trunk geometry)
  const trunkCurve = useMemo(() => new THREE.CatmullRomCurve3([
    new THREE.Vector3( 0.00, 0.00, 0.00),
    new THREE.Vector3( 0.06, 0.22, 0.02),
    new THREE.Vector3(-0.05, 0.45, 0.03),
    new THREE.Vector3( 0.08, 0.68, 0.00),
    new THREE.Vector3(-0.04, 0.88, 0.02),
    new THREE.Vector3( 0.03, 1.05, 0.01),
  ]), [])

  const branches = useMemo(() => BRANCH_DEFS.map(def => buildBranch(def, trunkCurve)), [trunkCurve])

  // Leaf counts per cluster (fewer on mobile)
  const LEAF_COUNT = isMobile ? 18 : 28

  useFrame((_, delta) => {
    if (!groupRef.current) return
    time.current += delta

    smoothX.current = springLerp(smoothX.current, mouseXTarget, 0.06)
    smoothY.current = springLerp(smoothY.current, mouseYTarget, 0.06)
    smoothScrollY.current = springLerp(smoothScrollY.current, scrollY, 0.08)

    const introScale = prefersReduced ? 1 : lerp(0.6, 1, Math.min(introProgress, 1))
    const autoRot    = prefersReduced ? 0 : (time.current / 24) * Math.PI * 2
    const floatY     = prefersReduced ? 0 : Math.sin((time.current / 6) * Math.PI * 2) * 0.05

    const scrollNorm  = Math.min(smoothScrollY.current / 600, 1)
    const scrollRot   = prefersReduced ? 0 : scrollNorm * (120 * Math.PI / 180)
    const scrollScale = prefersReduced ? 1 : lerp(1, 0.85, scrollNorm)
    const scrollMoveY = prefersReduced ? 0 : scrollNorm * 0.4

    const tiltX = (prefersReduced || isMobile) ? 0 : smoothY.current * (8 * Math.PI / 180)
    const tiltZ = (prefersReduced || isMobile) ? 0 : -smoothX.current * (8 * Math.PI / 180)

    groupRef.current.rotation.y = autoRot + scrollRot
    groupRef.current.rotation.x = tiltX
    groupRef.current.rotation.z = tiltZ
    groupRef.current.position.y = floatY + scrollMoveY
    groupRef.current.scale.setScalar(introScale * scrollScale)
  })

  return (
    <group ref={groupRef}>
      <Pedestal />
      <Trunk />
      {branches.map((b, i) => (
        <Branch key={i} start={b.attach} mid={b.mid} end={b.tip} radius={b.radius} />
      ))}
      {branches.map((b, i) => (
        <LeafCluster
          key={`leaves-${i}`}
          center={b.tip}
          count={LEAF_COUNT}
          spread={0.20}
        />
      ))}
      {/* Extra crown leaves at very top of trunk */}
      <LeafCluster
        center={new THREE.Vector3(0.03, 1.12, 0.01)}
        count={isMobile ? 14 : 22}
        spread={0.16}
      />
      {/* Flowers at each branch tip */}
      {branches.map((b, i) => (
        <FlowerCluster key={`flowers-${i}`} center={b.tip} count={4} />
      ))}
    </group>
  )
}

// ─── Lights ───────────────────────────────────────────────────────────────────

function SceneLights() {
  return (
    <>
      <ambientLight intensity={0.30} />
      {/* Key: soft warm from upper-left */}
      <directionalLight position={[1.5, 3, 2]} intensity={1.1} color="#fff5e0" castShadow />
      {/* Violet rim from behind — creates the purple halo */}
      <pointLight position={[0, 1.5, -2.2]} intensity={2.0} color="#7c3aed" />
      {/* Subtle purple fill from below (glow bleed) */}
      <pointLight position={[0, -0.5, 0.8]} intensity={0.5} color="#6d28d9" />
    </>
  )
}

// ─── Fallbacks ────────────────────────────────────────────────────────────────

function CanvasShimmer() {
  return (
    <div className="w-full h-full flex items-center justify-center">
      <div
        className="w-40 h-64 rounded-xl animate-pulse"
        style={{ background: 'linear-gradient(160deg, #0d0d1a, #1a0d2e, #0d0d1a)' }}
      />
    </div>
  )
}

function NoWebGLFallback() {
  return (
    <div className="w-full h-full flex items-center justify-center">
      <div
        className="w-48 h-64 rounded-xl flex items-end justify-center pb-6"
        style={{ background: 'radial-gradient(ellipse at 50% 60%, #3b0764 0%, #000 70%)' }}
      >
        <span style={{ color: '#8a8a93', fontSize: 12 }}>3D plant (WebGL unavailable)</span>
      </div>
    </div>
  )
}

// ─── Public export ────────────────────────────────────────────────────────────

export default function PlantScene({ scrollY = 0, introProgress = 0 }) {
  const isMobile = typeof window !== 'undefined' && window.innerWidth < 768
  const prefersReduced = typeof window !== 'undefined'
    && window.matchMedia('(prefers-reduced-motion: reduce)').matches

  const [mouseXTarget, setMouseXTarget] = useState(0)
  const [mouseYTarget, setMouseYTarget] = useState(0)
  const [webGLFailed, setWebGLFailed]   = useState(false)

  useEffect(() => {
    try {
      const c = document.createElement('canvas')
      const gl = c.getContext('webgl') || c.getContext('experimental-webgl')
      if (!gl) setWebGLFailed(true)
    } catch { setWebGLFailed(true) }
  }, [])

  const handleMouseMove = useCallback((e) => {
    if (isMobile || prefersReduced) return
    const { left, top, width, height } = e.currentTarget.getBoundingClientRect()
    setMouseXTarget((e.clientX - left - width  / 2) / (width  / 2))
    setMouseYTarget((e.clientY - top  - height / 2) / (height / 2))
  }, [isMobile, prefersReduced])

  const handleMouseLeave = useCallback(() => {
    setMouseXTarget(0)
    setMouseYTarget(0)
  }, [])

  if (webGLFailed) return <NoWebGLFallback />

  return (
    <div
      className="w-full h-full"
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      aria-hidden="true"
    >
      <Suspense fallback={<CanvasShimmer />}>
        {/*
          Camera pulled back to z=5.5 and fov=36 so the bonsai
          fills ~55% of the viewport — matching the reference frames.
        */}
        <Canvas
          dpr={[1, 2]}
          gl={{ alpha: true, antialias: true }}
          camera={{ position: [0, 0.55, 5.5], fov: 36 }}
          shadows
          style={{ background: 'transparent' }}
        >
          <SceneLights />
          <PlantGroup
            isMobile={isMobile}
            scrollY={scrollY}
            mouseXTarget={mouseXTarget}
            mouseYTarget={mouseYTarget}
            introProgress={introProgress}
            prefersReduced={prefersReduced}
          />
        </Canvas>
      </Suspense>
    </div>
  )
}
