"use client";

import { useEffect, useRef } from "react";
import * as THREE from "three";
import type { ChamberPhase } from "@/lib/chamber-machine";

export type SceneHotspot = { x: number; y: number; scale: number; visible: boolean };
export type SceneHotspots = Record<string, SceneHotspot>;

type Props = {
  entryPhase: string;
  selectedId: string | null;
  chamberPhase: ChamberPhase;
  motion: "full" | "reduced" | "off";
  onHotspots: (positions: SceneHotspots) => void;
  onReady: (ready: boolean) => void;
};

type BaySpec = {
  id: string; name: string; x: number; y: number; z: number; width: number; height: number; accent: string;
};
type BayModel = {
  spec: BaySpec; group: THREE.Group; leftDoor: THREE.Group; rightDoor: THREE.Group; light: THREE.PointLight;
  cloud: VaporPuff[]; bars: THREE.Mesh[]; packet?: THREE.Mesh; ball?: THREE.Mesh;
};
type VaporPuff = { sprite: THREE.Sprite; base: THREE.Vector3; seed: number; size: number };
type DoorVaporCloud = { mesh: THREE.Mesh; base: THREE.Vector3; seed: number; size: number };

const baySpecs: BaySpec[] = [
  { id: "xondry", name: "XONDRY", x: -12.1, y: 0.35, z: 0.4, width: 5.9, height: 5.25, accent: "#b275ff" },
  { id: "squadamp", name: "SQUADAMP", x: -8.7, y: 0.45, z: -4.4, width: 5.6, height: 4.65, accent: "#ff9854" },
  { id: "atomlang-evolved-sdk", name: "ATOMLANG", x: -5.25, y: 0.55, z: -9.1, width: 6.0, height: 4.05, accent: "#23d9ff" },
  { id: "raeyl", name: "RAEYL", x: 5.25, y: 0.55, z: -9.1, width: 6.0, height: 4.05, accent: "#af84ff" },
  { id: "realball26", name: "REALBALL 26", x: 8.7, y: 0.45, z: -4.4, width: 5.6, height: 4.65, accent: "#ffad5a" },
  { id: "classified", name: "CLASSIFIED", x: 12.1, y: 0.35, z: 0.4, width: 5.9, height: 5.25, accent: "#ff5269" },
];

function seeded(seed: number) {
  let value = seed >>> 0;
  return () => { value = (value * 1664525 + 1013904223) >>> 0; return value / 4294967296; };
}

function canvasTexture(kind: "rock" | "metal" | "floor" | "smoke", seed: number) {
  const canvas = document.createElement("canvas");
  canvas.width = kind === "smoke" ? 128 : 512;
  canvas.height = kind === "smoke" ? 128 : 512;
  const ctx = canvas.getContext("2d");
  if (!ctx) return new THREE.Texture();
  const rand = seeded(seed);
  if (kind === "smoke") {
    const gradient = ctx.createRadialGradient(64, 64, 3, 64, 64, 64);
    gradient.addColorStop(0, "rgba(245,252,255,.54)");
    gradient.addColorStop(.22, "rgba(206,229,238,.35)");
    gradient.addColorStop(.58, "rgba(126,170,187,.13)");
    gradient.addColorStop(1, "rgba(88,132,150,0)");
    ctx.fillStyle = gradient; ctx.fillRect(0, 0, 128, 128);
  } else {
    ctx.fillStyle = kind === "rock" ? "#30373a" : kind === "metal" ? "#313a40" : "#242d32";
    ctx.fillRect(0, 0, 512, 512);
    for (let i = 0; i < (kind === "rock" ? 15500 : 5400); i++) {
      const x = rand() * 512, y = rand() * 512;
      const alpha = kind === "rock" ? .035 + rand() * .18 : .025 + rand() * .105;
      const tone = kind === "rock" ? [14, 54, 111, 168, 217][Math.floor(rand() * 5)] : rand() > .54 ? 222 : 2;
      ctx.fillStyle = `rgba(${tone},${tone},${tone},${alpha})`;
      const w = kind === "rock" ? .5 + rand() * 8 : .4 + rand() * 5;
      const h = kind === "rock" ? .5 + rand() * 4 : .35 + rand() * 1.5;
      ctx.fillRect(x, y, w, h);
    }
    if (kind === "rock") {
      for (let i = 0; i < 105; i++) {
        const x = rand() * 512, y = rand() * 512;
        ctx.beginPath(); ctx.ellipse(x, y, 18 + rand() * 55, 5 + rand() * 24, rand() * 2, 0, Math.PI * 2);
        const warm = rand() > .74;
        ctx.fillStyle = warm ? `rgba(112,72,48,${.035 + rand() * .045})` : `rgba(${rand() > .5 ? 142 : 0},${rand() > .5 ? 151 : 0},${rand() > .5 ? 157 : 0},${.035 + rand() * .055})`; ctx.fill();
      }
      ctx.strokeStyle = "rgba(3,7,10,.42)"; ctx.lineWidth = 2;
      for (let i = 0; i < 18; i++) {
        const x = rand() * 512, y = rand() * 512;
        ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x + (rand() - .5) * 28, y + 20 + rand() * 70); ctx.lineTo(x + (rand() - .5) * 45, y + 30 + rand() * 110); ctx.stroke();
      }
    } else {
      ctx.strokeStyle = kind === "floor" ? "rgba(178,211,218,.08)" : "rgba(196,215,222,.12)";
      ctx.lineWidth = 1;
      const cell = kind === "floor" ? 128 : 256;
      for (let x = 0; x <= 512; x += cell) { ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, 512); ctx.stroke(); }
      for (let y = 0; y <= 512; y += cell) { ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(512, y); ctx.stroke(); }
      ctx.strokeStyle = "rgba(222,239,243,.14)";
      for (let i = 0; i < 85; i++) {
        const x = rand() * 512, y = rand() * 512;
        ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x + 8 + rand() * 58, y + (rand() - .5) * 2); ctx.stroke();
      }
    }
  }
  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = kind === "smoke" ? THREE.SRGBColorSpace : THREE.SRGBColorSpace;
  texture.wrapS = THREE.RepeatWrapping; texture.wrapT = THREE.RepeatWrapping;
  texture.anisotropy = 4;
  if (kind === "rock") texture.repeat.set(2.5, 1.6);
  if (kind === "floor") texture.repeat.set(3.4, 3.4);
  if (kind === "metal") texture.repeat.set(1.5, 1.5);
  return texture;
}

function radialAlphaTexture() {
  const canvas = document.createElement("canvas"); canvas.width = 256; canvas.height = 128;
  const context = canvas.getContext("2d");
  if (context) {
    const gradient = context.createRadialGradient(128, 64, 4, 128, 64, 128);
    gradient.addColorStop(0, "rgba(255,255,255,.86)"); gradient.addColorStop(.3, "rgba(255,255,255,.54)"); gradient.addColorStop(.72, "rgba(255,255,255,.16)"); gradient.addColorStop(1, "rgba(255,255,255,0)");
    context.fillStyle = gradient; context.fillRect(0, 0, 256, 128);
    context.globalAlpha = .28; context.strokeStyle = "#fff"; context.lineWidth = 1;
    for (let i = 0; i < 36; i++) { const y = 16 + i * 2.7; context.beginPath(); context.moveTo(35 + (i % 4) * 9, y); context.lineTo(80 + (i % 6) * 17, y + ((i % 3) - 1)); context.stroke(); }
  }
  const texture = new THREE.CanvasTexture(canvas); texture.colorSpace = THREE.NoColorSpace; texture.anisotropy = 4; return texture;
}

function softFalloffTexture() {
  const canvas = document.createElement("canvas"); canvas.width = 256; canvas.height = 128;
  const context = canvas.getContext("2d");
  if (context) {
    const gradient = context.createRadialGradient(128, 64, 2, 128, 64, 126);
    gradient.addColorStop(0, "rgba(255,255,255,.78)"); gradient.addColorStop(.24, "rgba(255,255,255,.55)"); gradient.addColorStop(.62, "rgba(255,255,255,.18)"); gradient.addColorStop(1, "rgba(255,255,255,0)");
    context.fillStyle = gradient; context.fillRect(0, 0, 256, 128);
  }
  const texture = new THREE.CanvasTexture(canvas); texture.colorSpace = THREE.NoColorSpace; texture.anisotropy = 4; return texture;
}

function portalLightTexture() {
  const canvas = document.createElement("canvas"); canvas.width = 384; canvas.height = 512;
  const context = canvas.getContext("2d");
  if (context) {
    const gradient = context.createRadialGradient(192, 226, 12, 192, 226, 245);
    gradient.addColorStop(0, "rgba(230,255,255,.92)"); gradient.addColorStop(.16, "rgba(105,237,255,.72)");
    gradient.addColorStop(.48, "rgba(29,157,198,.34)"); gradient.addColorStop(1, "rgba(11,68,94,0)");
    context.fillStyle = gradient; context.fillRect(0, 0, canvas.width, canvas.height);
  }
  const texture = new THREE.CanvasTexture(canvas); texture.colorSpace = THREE.SRGBColorSpace; texture.anisotropy = 4; return texture;
}

function signageTexture(title: string, detail: string, accent: string) {
  const canvas = document.createElement("canvas"); canvas.width = 768; canvas.height = 288;
  const context = canvas.getContext("2d");
  if (context) {
    const gradient = context.createLinearGradient(0, 0, 768, 288);
    gradient.addColorStop(0, "#111a20"); gradient.addColorStop(.52, "#26343b"); gradient.addColorStop(1, "#10161b");
    context.fillStyle = gradient; context.fillRect(0, 0, 768, 288);
    context.strokeStyle = "#8aa0a8"; context.lineWidth = 5; context.strokeRect(8, 8, 752, 272);
    context.fillStyle = accent; context.fillRect(26, 25, 12, 238);
    context.fillStyle = "#dce8eb"; context.font = "700 48px monospace"; context.fillText(title, 62, 110);
    context.fillStyle = "#8da4ad"; context.font = "500 23px monospace"; context.fillText(detail, 64, 163);
    context.fillStyle = accent; context.fillRect(64, 198, 220, 5);
    context.fillStyle = "#6f838b"; context.font = "500 17px monospace"; context.fillText("AUTHORIZED PERSONNEL ONLY  //  JV-01", 64, 242);
    for (const [x, y] of [[24, 24], [744, 24], [24, 264], [744, 264]]) {
      context.fillStyle = "#d7e2e5"; context.beginPath(); context.arc(x, y, 5, 0, Math.PI * 2); context.fill();
    }
  }
  const texture = new THREE.CanvasTexture(canvas); texture.colorSpace = THREE.SRGBColorSpace; texture.anisotropy = 4; return texture;
}

function entryTarget(phase: string) {
  if (phase === "entered") return 1;
  if (phase === "illumination") return .94;
  if (phase === "opening") return .62;
  if (phase === "venting") return .12;
  return .065;
}

function arcShape(inner: number, outer: number, start: number, end: number) {
  const shape = new THREE.Shape();
  const steps = 5;
  shape.moveTo(Math.cos(start) * outer, Math.sin(start) * outer);
  for (let i = 1; i <= steps; i++) { const a = start + (end - start) * i / steps; shape.lineTo(Math.cos(a) * outer, Math.sin(a) * outer); }
  for (let i = steps; i >= 0; i--) { const a = start + (end - start) * i / steps; shape.lineTo(Math.cos(a) * inner, Math.sin(a) * inner); }
  shape.closePath();
  return shape;
}

function halfDisk(radius: number, side: "left" | "right") {
  const shape = new THREE.Shape();
  const start = side === "right" ? -Math.PI / 2 : Math.PI / 2;
  const end = side === "right" ? Math.PI / 2 : Math.PI * 1.5;
  shape.moveTo(0, Math.sin(start) * radius);
  for (let i = 1; i <= 48; i++) { const a = start + (end - start) * i / 48; shape.lineTo(Math.cos(a) * radius, Math.sin(a) * radius); }
  shape.closePath();
  return shape;
}

export function FacilityScene({ entryPhase, selectedId, chamberPhase, motion, onHotspots, onReady }: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const renderRef = useRef<(() => void) | null>(null);
  const propsRef = useRef({ entryPhase, selectedId, chamberPhase, motion });
  useEffect(() => { propsRef.current = { entryPhase, selectedId, chamberPhase, motion }; renderRef.current?.(); }, [entryPhase, selectedId, chamberPhase, motion]);

  useEffect(() => {
    const container = containerRef.current, canvas = canvasRef.current;
    if (!container || !canvas) return;
    let renderer: THREE.WebGLRenderer;
    try {
      renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true, powerPreference: "low-power", stencil: false, depth: true });
    } catch { return; }
    let disposed = false;

    const scene = new THREE.Scene();
    scene.background = new THREE.Color("#071018");
    scene.fog = new THREE.FogExp2("#09151d", 0.015);
    const camera = new THREE.PerspectiveCamera(38, 1, .1, 90);
    camera.position.set(0, 9.2, 23);
    camera.lookAt(0, 4.6, -5.5);
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.08;
    renderer.setClearColor("#071018", 1);

    const textures = new Set<THREE.Texture>();
    const materials = new Set<THREE.Material>();
    const geometry = new Set<THREE.BufferGeometry>();
    const keepMaterial = <T extends THREE.Material>(material: T) => { materials.add(material); const m = material as THREE.Material & { map?: THREE.Texture; bumpMap?: THREE.Texture; roughnessMap?: THREE.Texture }; for (const key of ["map", "bumpMap", "roughnessMap"] as const) if (m[key]) textures.add(m[key]!); return material; };
    const addBox = (parent: THREE.Object3D, size: [number, number, number], position: [number, number, number], material: THREE.Material, bevel = false) => {
      const shape = bevel ? new THREE.BoxGeometry(size[0], size[1], size[2], 1, 1, 1) : new THREE.BoxGeometry(...size);
      geometry.add(shape); const mesh = new THREE.Mesh(shape, material); mesh.position.set(...position); mesh.castShadow = false; mesh.receiveShadow = false; parent.add(mesh); return mesh;
    };
    const addTube = (parent: THREE.Object3D, points: THREE.Vector3[], radius: number, material: THREE.Material, segments = 48) => {
      const curve = new THREE.CatmullRomCurve3(points); const tube = new THREE.TubeGeometry(curve, segments, radius, 7, false); geometry.add(tube); const mesh = new THREE.Mesh(tube, material); parent.add(mesh); return mesh;
    };
    const cylinderBetween = (parent: THREE.Object3D, a: THREE.Vector3, b: THREE.Vector3, radius: number, material: THREE.Material) => {
      const delta = new THREE.Vector3().subVectors(b, a); const meshGeometry = new THREE.CylinderGeometry(radius, radius, delta.length(), 10, 1); geometry.add(meshGeometry);
      const mesh = new THREE.Mesh(meshGeometry, material); mesh.position.copy(a).add(b).multiplyScalar(.5); mesh.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), delta.normalize()); parent.add(mesh); return mesh;
    };
    const rockMap = canvasTexture("rock", 101); const metalMap = canvasTexture("metal", 203); const floorMap = canvasTexture("floor", 307); const smokeMap = canvasTexture("smoke", 409);
    const wetAlpha = radialAlphaTexture(); const shadowAlpha = softFalloffTexture(); const portalMap = portalLightTexture();
    textures.add(rockMap); textures.add(metalMap); textures.add(floorMap); textures.add(smokeMap); textures.add(wetAlpha); textures.add(shadowAlpha); textures.add(portalMap);
    const rockMat = keepMaterial(new THREE.MeshStandardMaterial({ color: "#d4d7d4", map: rockMap, bumpMap: rockMap, bumpScale: .3, roughness: .96, metalness: .04 }));
    const darkRockMat = keepMaterial(new THREE.MeshStandardMaterial({ color: "#9ca5a6", map: rockMap, bumpMap: rockMap, bumpScale: .31, roughness: .97, metalness: .04 }));
    const metalMat = keepMaterial(new THREE.MeshStandardMaterial({ color: "#87969d", map: metalMap, bumpMap: metalMap, bumpScale: .07, roughness: .47, metalness: .78 }));
    const blackMetalMat = keepMaterial(new THREE.MeshStandardMaterial({ color: "#35434c", map: metalMap, bumpMap: metalMap, bumpScale: .09, roughness: .58, metalness: .7 }));
    const floorMat = keepMaterial(new THREE.MeshStandardMaterial({ color: "#465155", map: floorMap, bumpMap: floorMap, bumpScale: .09, roughness: .43, metalness: .55 }));
    const structureMat = keepMaterial(new THREE.MeshStandardMaterial({ color: "#202c34", roughness: .72, metalness: .66 }));
    const darkMat = keepMaterial(new THREE.MeshStandardMaterial({ color: "#071018", roughness: .82, metalness: .25 }));
    const glassMat = keepMaterial(new THREE.MeshPhysicalMaterial({ color: "#142833", roughness: .28, metalness: .32, transmission: .08, transparent: true, opacity: .84, clearcoat: .45, clearcoatRoughness: .28 }));
    const amberMat = keepMaterial(new THREE.MeshStandardMaterial({ color: "#dc8a3b", emissive: "#ff812f", emissiveIntensity: 1.6, roughness: .32, metalness: .2 }));
    const cyanMat = keepMaterial(new THREE.MeshBasicMaterial({ color: "#61f6ff" }));
    const cyanGlowMat = keepMaterial(new THREE.MeshBasicMaterial({ color: "#37eaff", transparent: true, opacity: .36, blending: THREE.AdditiveBlending, depthWrite: false, side: THREE.DoubleSide }));
    const boltMat = keepMaterial(new THREE.MeshStandardMaterial({ color: "#a7b5ba", metalness: .86, roughness: .3 }));

    // Load the generated tile as a real albedo/bump pair; the deterministic canvas map remains the fallback.
    const generatedRock = new THREE.TextureLoader().load("/images/black-site/rough-basalt-01.webp", (albedo) => {
      if (disposed) { albedo.dispose(); return; }
      albedo.colorSpace = THREE.SRGBColorSpace; albedo.wrapS = THREE.RepeatWrapping; albedo.wrapT = THREE.RepeatWrapping; albedo.repeat.set(2.5, 1.6); albedo.anisotropy = Math.min(renderer.capabilities.getMaxAnisotropy(), 8);
      const bump = albedo.clone(); bump.colorSpace = THREE.NoColorSpace; bump.needsUpdate = true; textures.add(bump);
      textures.add(albedo);
      rockMat.map = albedo; rockMat.bumpMap = bump; darkRockMat.map = albedo; darkRockMat.bumpMap = bump;
      rockMat.needsUpdate = true; darkRockMat.needsUpdate = true; canvas.dataset.rockTexture = "ready"; renderRef.current?.();
    }, undefined, () => { if (!disposed) canvas.dataset.rockTexture = "fallback"; });
    textures.add(generatedRock);

    scene.add(new THREE.HemisphereLight("#9bbad1", "#10141a", .82));
    const topLight = new THREE.DirectionalLight("#bad4e1", 1.3); topLight.position.set(-5, 18, 9); scene.add(topLight);
    const warmBack = new THREE.DirectionalLight("#bc7040", .85); warmBack.position.set(16, 7, -11); scene.add(warmBack);
    const coldBack = new THREE.DirectionalLight("#1fa6d4", 1.1); coldBack.position.set(0, 11, -18); scene.add(coldBack);

    // A continuous, camera-facing service tunnel with real depth and a rough, scuffed finish.
    addBox(scene, [44, .58, 56], [0, -.30, -3.5], floorMat);
    addBox(scene, [.95, 15, 57], [-18.4, 7, -3.5], rockMat);
    addBox(scene, [.95, 15, 57], [18.4, 7, -3.5], rockMat);
    // Keep the roof and end wall open around the blast door. A continuous slab here
    // made the animated leaves move in front of a solid wall, so the portal never
    // read as a real opening. The side shoulders and roof wings preserve the cut
    // stone tunnel while exposing a short, lit service passage beyond the door.
    addBox(scene, [11, 1, 43], [-14, 14.1, -5.2], darkRockMat);
    addBox(scene, [11, 1, 43], [14, 14.1, -5.2], darkRockMat);
    addBox(scene, [11.5, 15.2, 1.2], [-13.75, 7.6, -20.4], rockMat);
    addBox(scene, [11.5, 15.2, 1.2], [13.75, 7.6, -20.4], rockMat);
    addBox(scene, [39, 1.1, 1.2], [0, 17.2, -20.4], darkRockMat);
    // The inner service passage gives the open door real depth and a cool spill
    // light, with a distant bulkhead and progressively smaller steel ribs.
    addBox(scene, [16.8, .58, 15], [0, -.3, -28.5], floorMat);
    addBox(scene, [.62, 11.8, 15], [-8.15, 5.9, -28.5], darkRockMat);
    addBox(scene, [.62, 11.8, 15], [8.15, 5.9, -28.5], darkRockMat);
    addBox(scene, [16.4, .62, 15], [0, 12.1, -28.5], darkRockMat);
    addBox(scene, [40, .6, .8], [0, 14.55, -4], metalMat);

    // Broken rock shoulders and mounted area signs interrupt the long, flat service walls.
    const signGeometry = new THREE.PlaneGeometry(4.8, 1.8); geometry.add(signGeometry);
    const leftSignTexture = signageTexture("AREA JV-01", "UNDERGROUND PRODUCT FACILITY", "#ff8b52");
    const rightSignTexture = signageTexture("RESTRICTED ACCESS", "PRODUCT VAULT  //  R&D LABS", "#65ddeb");
    textures.add(leftSignTexture); textures.add(rightSignTexture);
    for (const [side, signTexture] of [[-1, leftSignTexture], [1, rightSignTexture]] as const) {
      const material = keepMaterial(new THREE.MeshStandardMaterial({ map: signTexture, emissive: "#6e8b92", emissiveMap: signTexture, emissiveIntensity: .82, roughness: .82, metalness: .18, side: THREE.DoubleSide }));
      addBox(scene, [5.02, 2.02, .34], [side * 13.5, 10.05, -1.54], blackMetalMat);
      const sign = new THREE.Mesh(signGeometry, material); sign.position.set(side * 13.5, 10.05, -1.34); scene.add(sign);
    }
    for (const [z, radius] of [[-2, 12.1], [-9, 10.7], [-16, 9.55], [-22, 8.45], [-27, 7.5]] as const) {
      const archGeometry = new THREE.TorusGeometry(radius, .32, 9, 84); geometry.add(archGeometry);
      const arch = new THREE.Mesh(archGeometry, z % 2 === 0 ? blackMetalMat : metalMat); arch.position.set(0, .05, z); scene.add(arch);
      const innerArchGeometry = new THREE.TorusGeometry(radius - .5, .075, 6, 84); geometry.add(innerArchGeometry);
      const innerArch = new THREE.Mesh(innerArchGeometry, z % 2 === 0 ? boltMat : darkMat); innerArch.position.set(0, .05, z + .16); scene.add(innerArch);
      for (const side of [-1, 1]) {
        addBox(scene, [.34, .28, 1.0], [side * (radius - 1.25), 1.1, z], amberMat);
        addBox(scene, [.28, .4, .75], [side * (radius - 2.6), radius - .9, z], cyanMat);
      }
    }
    for (const side of [-1, 1]) {
      for (const z of [12, 7, 2, -3, -8, -13]) {
        addBox(scene, [.55, 11.8, .48], [side * 17.72, 6.05, z], blackMetalMat);
        addBox(scene, [.82, .22, 5.0], [side * 17.28, 11.5, z], metalMat);
      }
      const pipeA = new THREE.CatmullRomCurve3([new THREE.Vector3(side * 16.8, 10.9, 17), new THREE.Vector3(side * 16.6, 10.9, 2), new THREE.Vector3(side * 16.2, 11.2, -8), new THREE.Vector3(side * 15.5, 11.7, -18)]);
      const pipeGeo = new THREE.TubeGeometry(pipeA, 72, .18, 10, false); geometry.add(pipeGeo); scene.add(new THREE.Mesh(pipeGeo, metalMat));
      const pipeB = new THREE.CatmullRomCurve3([new THREE.Vector3(side * 15.7, 10.6, 17), new THREE.Vector3(side * 15.5, 10.6, -2), new THREE.Vector3(side * 15.1, 10.9, -12), new THREE.Vector3(side * 14.8, 11.2, -19)]);
      const pipeGeoB = new THREE.TubeGeometry(pipeB, 72, .075, 8, false); geometry.add(pipeGeoB); scene.add(new THREE.Mesh(pipeGeoB, amberMat));
    }
    for (const z of [12, 6, 0, -6, -12]) {
      addBox(scene, [33, .45, .55], [0, 13.15, z], blackMetalMat);
      addBox(scene, [1.4, .11, .38], [0, 12.88, z], amberMat);
    }

    // Long floor rails and local reflection patches converge on the breach.
    const floorRails: [number, string, number][] = [
      [-19, "#26849b", .055], [-14.5, "#43d7e8", .045], [-8.8, "#c58b4e", .04], [-1.45, "#2ab6d3", .05],
      [1.45, "#2ab6d3", .05], [8.8, "#c58b4e", .04], [14.5, "#43d7e8", .045], [19, "#26849b", .055],
    ];
    for (const [frontX, color, radius] of floorRails) {
      const endX = Math.sign(frontX) * (Math.abs(frontX) * .3 + .28);
      const railMat = keepMaterial(new THREE.MeshStandardMaterial({ color, emissive: color, emissiveIntensity: .17, metalness: .38, roughness: .31 }));
      addTube(scene, [new THREE.Vector3(frontX, .055, 23), new THREE.Vector3(frontX * .82, .055, 10), new THREE.Vector3(frontX * .55, .06, -5), new THREE.Vector3(endX, .065, -18)], radius, railMat, 80);
    }
    const floorReflection = keepMaterial(new THREE.MeshBasicMaterial({ color: "#a1eaff", alphaMap: wetAlpha, transparent: true, opacity: .075, depthWrite: false, side: THREE.DoubleSide }));
    for (const [z, width, depth] of [[3.2, .72, 5.4], [-6.5, .58, 3.9], [-14, .44, 2.7]] as const) {
      const reflectionGeo = new THREE.PlaneGeometry(width, depth); geometry.add(reflectionGeo); const reflection = new THREE.Mesh(reflectionGeo, floorReflection); reflection.rotation.x = -Math.PI / 2; reflection.position.set(0, .019, z); scene.add(reflection);
    }
    for (const [x, z, color, width, depth] of [[-8.5, -1.6, "#a970ff", 3.3, 5.2], [8.8, -2.4, "#ff9c56", 3.5, 5.8], [0, -13.2, "#55dcec", 3.8, 5.1]] as const) {
      const reflectionMaterial = keepMaterial(new THREE.MeshBasicMaterial({ color, alphaMap: shadowAlpha, transparent: true, opacity: .095, depthWrite: false, side: THREE.DoubleSide }));
      const patchGeo = new THREE.PlaneGeometry(width, depth); geometry.add(patchGeo); const patch = new THREE.Mesh(patchGeo, reflectionMaterial); patch.rotation.x = -Math.PI / 2; patch.position.set(x, .022, z); scene.add(patch);
    }
    const contactMaterial = keepMaterial(new THREE.MeshBasicMaterial({ color: "#020508", alphaMap: shadowAlpha, transparent: true, opacity: .55, depthWrite: false, side: THREE.DoubleSide }));
    const contactGeo = new THREE.PlaneGeometry(5.3, 2.2); geometry.add(contactGeo);
    for (const spec of baySpecs) { const contact = new THREE.Mesh(contactGeo, contactMaterial); contact.rotation.x = -Math.PI / 2; contact.position.set(spec.x, .015, spec.z + 1.5); scene.add(contact); }
    for (let i = 0; i < 16; i++) {
      const z = 12 - i * 1.72;
      const span = 17 - i * .42;
      addBox(scene, [span * 2, .012, .018], [0, .012, z], keepMaterial(new THREE.MeshBasicMaterial({ color: "#96aeb8", transparent: true, opacity: .045 })));
    }

    // The main pressure door: annular armor segments, fasteners, split leaves, and a narrow breach.
    const doorY = 8.45, doorZ = -17.25, doorRadius = 7.95;
    // No backing disk: the split leaves uncover the passage instead of a black
    // circular plug. The illuminated far bulkhead establishes depth behind it.
    for (let i = 0; i < 32; i++) {
      const start = i * Math.PI * 2 / 32 + .012, end = (i + .91) * Math.PI * 2 / 32;
      const segmentGeo = new THREE.ExtrudeGeometry(arcShape(doorRadius - .13, doorRadius + .77, start, end), { depth: .72, bevelEnabled: true, bevelSegments: 2, bevelThickness: .06, bevelSize: .045, steps: 1 });
      geometry.add(segmentGeo);
      const isHazard = [1, 2, 14, 15].includes(i);
      const segment = new THREE.Mesh(segmentGeo, isHazard ? keepMaterial(new THREE.MeshStandardMaterial({ color: "#c17f3e", map: metalMap, metalness: .6, roughness: .54, emissive: "#b25724", emissiveIntensity: .12 })) : (i % 3 === 0 ? metalMat : blackMetalMat));
      segment.position.set(0, doorY, doorZ); segment.castShadow = false; scene.add(segment);
    }
    for (const radius of [doorRadius + 1.07, doorRadius + .78, doorRadius - .15, doorRadius - .53]) {
      const ringGeometry = new THREE.TorusGeometry(radius, radius === 9.02 ? .22 : .09, 10, 160); geometry.add(ringGeometry);
      const ring = new THREE.Mesh(ringGeometry, radius > 8.8 ? blackMetalMat : metalMat); ring.position.set(0, doorY, doorZ + .6); scene.add(ring);
    }
    const boltGeo = new THREE.SphereGeometry(.105, 10, 8); geometry.add(boltGeo);
    const boltRing = new THREE.InstancedMesh(boltGeo, boltMat, 48);
    const dummy = new THREE.Object3D();
    for (let i = 0; i < 48; i++) {
      const a = Math.PI * 2 * i / 48; dummy.position.set(Math.cos(a) * (doorRadius + .6), doorY + Math.sin(a) * (doorRadius + .6), doorZ + .78); dummy.rotation.set(0, 0, a); dummy.updateMatrix(); boltRing.setMatrixAt(i, dummy.matrix);
    }
    boltRing.instanceMatrix.needsUpdate = true; scene.add(boltRing);
    const breach = new THREE.Mesh(new THREE.PlaneGeometry(.3, 15.6), cyanGlowMat); breach.position.set(0, doorY, doorZ - .03); scene.add(breach);
    const breachCoreMat = keepMaterial(new THREE.MeshBasicMaterial({ color: "#d9ffff", transparent: true, opacity: .95, blending: THREE.AdditiveBlending, depthWrite: false, side: THREE.DoubleSide }));
    const breachCore = new THREE.Mesh(new THREE.PlaneGeometry(.055, 14.2), breachCoreMat); breachCore.position.set(0, doorY, doorZ - .01); scene.add(breachCore);
    const portalMaterial = keepMaterial(new THREE.MeshBasicMaterial({ map: portalMap, color: "#bceeff", transparent: true, opacity: .38, depthWrite: false, side: THREE.DoubleSide }));
    const portalGeo = new THREE.PlaneGeometry(11.4, 14.8); geometry.add(portalGeo);
    const portalPlane = new THREE.Mesh(portalGeo, portalMaterial); portalPlane.position.set(0, doorY, doorZ - .09); scene.add(portalPlane);
    const portalLight = new THREE.PointLight("#45eaff", 48, 24, 1.8); portalLight.position.set(0, doorY, doorZ - 2); scene.add(portalLight);
    const farGlowMaterial = keepMaterial(new THREE.MeshBasicMaterial({ map: portalMap, color: "#a9f8ff", transparent: true, opacity: .66, blending: THREE.AdditiveBlending, depthWrite: false, side: THREE.DoubleSide }));
    const farGlowGeometry = new THREE.PlaneGeometry(8.5, 8.8); geometry.add(farGlowGeometry);
    const farGlow = new THREE.Mesh(farGlowGeometry, farGlowMaterial); farGlow.position.set(0, 3.6, -35.8); scene.add(farGlow);
    const farCoreGeometry = new THREE.PlaneGeometry(4.4, 6.3); geometry.add(farCoreGeometry);
    const farCore = new THREE.Mesh(farCoreGeometry, keepMaterial(new THREE.MeshBasicMaterial({ map: portalMap, color: "#e5fcff", transparent: true, opacity: .76, depthWrite: false, side: THREE.DoubleSide })));
    farCore.position.set(0, 3.5, -35.65); scene.add(farCore);
    for (const side of [-1, 1]) {
      addBox(scene, [.28, 6.4, .42], [side * 2.4, 3.5, -35.35], metalMat);
      addBox(scene, [.1, 5.2, .08], [side * 2.16, 3.5, -35.1], cyanMat);
    }
    addBox(scene, [5, .3, .48], [0, 6.78, -35.35], metalMat);
    addBox(scene, [5, .22, .58], [0, .22, -35.35], structureMat);
    const farLight = new THREE.PointLight("#7feeff", 58, 22, 1.7); farLight.position.set(0, 3.8, -32); scene.add(farLight);
    const leafGeoL = new THREE.ExtrudeGeometry(halfDisk(7.36, "left"), { depth: .66, bevelEnabled: true, bevelSegments: 3, bevelThickness: .09, bevelSize: .055, steps: 1 }); geometry.add(leafGeoL);
    const leafGeoR = new THREE.ExtrudeGeometry(halfDisk(7.36, "right"), { depth: .66, bevelEnabled: true, bevelSegments: 3, bevelThickness: .09, bevelSize: .055, steps: 1 }); geometry.add(leafGeoR);
    const mainLeft = new THREE.Group(), mainRight = new THREE.Group(); mainLeft.position.set(-.10, doorY, doorZ + .35); mainRight.position.set(.10, doorY, doorZ + .35); scene.add(mainLeft, mainRight);
    const mainDoorMat = keepMaterial(new THREE.MeshStandardMaterial({ color: "#61737b", map: metalMap, bumpMap: metalMap, bumpScale: .045, metalness: .77, roughness: .44 }));
    const leftDoor = new THREE.Mesh(leafGeoL, mainDoorMat); const rightDoor = new THREE.Mesh(leafGeoR, mainDoorMat); mainLeft.add(leftDoor); mainRight.add(rightDoor);
    const seamMat = keepMaterial(new THREE.MeshStandardMaterial({ color: "#92a4aa", metalness: .82, roughness: .32 }));
    for (const radius of [2.9, 5.6]) {
      const arcGeoL = new THREE.TorusGeometry(radius, .075, 7, 72, Math.PI); geometry.add(arcGeoL);
      const arcL = new THREE.Mesh(arcGeoL, seamMat); arcL.position.set(0, 0, .7); arcL.rotation.z = Math.PI / 2; mainLeft.add(arcL);
      const arcGeoR = new THREE.TorusGeometry(radius, .075, 7, 72, Math.PI); geometry.add(arcGeoR);
      const arcR = new THREE.Mesh(arcGeoR, seamMat); arcR.position.set(0, 0, .7); arcR.rotation.z = -Math.PI / 2; mainRight.add(arcR);
    }
    for (const sign of [-1, 1]) {
      for (const y of [-4.3, -2.8, -.9, 1, 3, 4.6]) {
        const latch = addBox(sign < 0 ? mainLeft : mainRight, [.26, .46, .2], [sign * .18, y, .78], amberMat);
        latch.rotation.z = sign * .12;
      }
    }

    // Vent plumes sit just in front of the distant door in camera space, so nearer
    // alcove shells do not erase the atmospheric cue while the door is depressurizing.
    const mainVapor: DoorVaporCloud[] = [];
    const vaporGeometry = new THREE.SphereGeometry(1, 18, 12); geometry.add(vaporGeometry);
    for (let i = 0; i < 20; i++) {
      const material = keepMaterial(new THREE.MeshBasicMaterial({ map: smokeMap, color: "#d5e6ea", transparent: true, opacity: 0, depthWrite: false, depthTest: false, side: THREE.DoubleSide }));
      const cloud = new THREE.Mesh(vaporGeometry, material);
      const side = i % 2 === 0 ? -1 : 1; const base = new THREE.Vector3(side * (7.65 + (i % 4) * .24), .3 + (i % 5) * .23, doorZ + 3.8);
      cloud.position.copy(base); cloud.renderOrder = 12; cloud.frustumCulled = false;
      const size = 1.15 + (i % 4) * .35; cloud.scale.set(size * 1.35, size * .42, .32); scene.add(cloud); mainVapor.push({ mesh: cloud, base, seed: i * 1.7, size });
    }

    const bayModels = new Map<string, BayModel>();
    const floorPropMat = keepMaterial(new THREE.MeshStandardMaterial({ color: "#4a565d", map: metalMap, metalness: .67, roughness: .59 }));
    const makeAccentMaterial = (accent: string, intensity = 1.4) => keepMaterial(new THREE.MeshStandardMaterial({ color: accent, emissive: accent, emissiveIntensity: intensity, metalness: .28, roughness: .36 }));
    const smokeSpriteMat = keepMaterial(new THREE.SpriteMaterial({ map: smokeMap, color: "#d9e7ea", transparent: true, opacity: 0, depthWrite: false }));

    const addFrameBeam = (group: THREE.Group, size: [number, number, number], pos: [number, number, number], mat: THREE.Material) => addBox(group, size, pos, mat);
    const addNodeLine = (group: THREE.Group, points: THREE.Vector3[], accent: string, radius = .025) => addTube(group, points, radius, makeAccentMaterial(accent, .8), 28);
    const createBay = (spec: BaySpec): BayModel => {
      const group = new THREE.Group(); group.position.set(spec.x, spec.y, spec.z); group.name = `bay-${spec.id}`; scene.add(group);
      const w = spec.width, h = spec.height, tint = new THREE.Color(spec.accent);
      const trim = makeAccentMaterial(spec.accent, .74);
      addBox(group, [w + .86, h + .72, .92], [0, h / 2, -.3], darkRockMat);
      addBox(group, [w + .34, h + .25, .28], [0, h / 2, .28], darkMat);
      addBox(group, [w - .42, h - .5, .12], [0, h / 2, .48], keepMaterial(new THREE.MeshStandardMaterial({ color: tint, emissive: tint, emissiveIntensity: .08, transparent: true, opacity: .14, roughness: .35, metalness: .25 })));
      addFrameBeam(group, [.43, h + .48, .82], [-w / 2 - .04, h / 2, .56], metalMat);
      addFrameBeam(group, [.43, h + .48, .82], [w / 2 + .04, h / 2, .56], metalMat);
      addFrameBeam(group, [w + .4, .46, .82], [0, h + .04, .56], metalMat);
      addFrameBeam(group, [w + .42, .42, .98], [0, .1, .6], floorPropMat);
      addBox(group, [.085, h - .35, .09], [-w / 2 + .19, h / 2, 1.01], trim);
      addBox(group, [.085, h - .35, .09], [w / 2 - .19, h / 2, 1.01], trim);
      addBox(group, [w - .55, .07, .13], [0, .37, 1.02], trim);
      addBox(group, [w - .72, .1, .28], [0, h - .27, .78], amberMat);
      // Vent louvers, armored corner gussets, and a service plinth make the recess read as built into the wall.
      for (let i = 0; i < 6; i++) addBox(group, [.34, .055, .12], [-.88 + i * .35, h - .48, .91], blackMetalMat);
      for (const side of [-1, 1]) {
        const gusset = addBox(group, [.22, .76, .3], [side * (w / 2 - .25), h - .32, .88], structureMat); gusset.rotation.z = side * .28;
        for (let row = 0; row < 4; row++) addBox(group, [.055, .055, .045], [side * (w / 2 - .04), .72 + row * .3, 1.04], boltMat);
      }
      addBox(group, [w + .75, .27, 1.38], [0, .16, .72], structureMat);
      for (let i = 0; i < 9; i++) addBox(group, [.16, .17, .055], [(i - 4) * .34, .31, 1.31], i % 2 ? amberMat : blackMetalMat);
      const bayLight = new THREE.PointLight(spec.accent, 10, Math.max(7, w * 1.6), 1.65); bayLight.position.set(0, h * .58, 1.7); group.add(bayLight);
      const glowPlaneMat = keepMaterial(new THREE.MeshBasicMaterial({ color: spec.accent, transparent: true, opacity: .07, depthWrite: false, side: THREE.DoubleSide }));
      const glowPlaneGeo = new THREE.PlaneGeometry(w * .88, h * .68); geometry.add(glowPlaneGeo); const glowPlane = new THREE.Mesh(glowPlaneGeo, glowPlaneMat); glowPlane.position.set(0, h * .52, .62); group.add(glowPlane);

      // Each door starts folded back enough to show its authored concept prop, then opens farther on selection.
      const doorGeo = new THREE.BoxGeometry(w * .41, h * .91, .24); geometry.add(doorGeo);
      const doorMat = keepMaterial(new THREE.MeshStandardMaterial({ color: "#495962", map: metalMap, bumpMap: metalMap, bumpScale: .04, metalness: .75, roughness: .47 }));
      const leftDoorGroup = new THREE.Group(), rightDoorGroup = new THREE.Group();
      leftDoorGroup.position.set(-w * .38, h / 2, 1.12); rightDoorGroup.position.set(w * .38, h / 2, 1.12); group.add(leftDoorGroup, rightDoorGroup);
      const leftLeaf = new THREE.Mesh(doorGeo, doorMat), rightLeaf = new THREE.Mesh(doorGeo, doorMat); leftDoorGroup.add(leftLeaf); rightDoorGroup.add(rightLeaf);
      addBox(leftDoorGroup, [.08, h * .78, .06], [w * .16, 0, .17], trim); addBox(rightDoorGroup, [.08, h * .78, .06], [-w * .16, 0, .17], trim);
      addBox(leftDoorGroup, [.22, .12, .16], [w * .22, 0, .2], boltMat); addBox(rightDoorGroup, [.22, .12, .16], [-w * .22, 0, .2], boltMat);

      const bars: THREE.Mesh[] = [];
      let packet: THREE.Mesh | undefined; let ball: THREE.Mesh | undefined;
      const front = 1.1;
      if (spec.id === "xondry") {
        const globeGeo = new THREE.IcosahedronGeometry(.78, 2); geometry.add(globeGeo);
        const globe = new THREE.Mesh(globeGeo, keepMaterial(new THREE.MeshBasicMaterial({ color: spec.accent, wireframe: true, transparent: true, opacity: .76 }))); globe.position.set(0, h * .47, front); group.add(globe);
        for (const [x, y] of [[-w * .31, h * .67], [w * .32, h * .65], [-w * .34, h * .35], [w * .33, h * .35]]) {
          const panel = addBox(group, [w * .23, h * .25, .08], [x, y, front + .34], glassMat);
          const outline = new THREE.EdgesGeometry(panel.geometry); geometry.add(outline); const lines = new THREE.LineSegments(outline, keepMaterial(new THREE.LineBasicMaterial({ color: spec.accent, transparent: true, opacity: .76 }))); lines.position.copy(panel.position); group.add(lines);
          const avatarGeo = new THREE.SphereGeometry(.16, 12, 8); geometry.add(avatarGeo); const avatar = new THREE.Mesh(avatarGeo, makeAccentMaterial(spec.accent, .55)); avatar.position.set(x, y + .08, front + .42); group.add(avatar);
        }
        for (let i = 0; i < 8; i++) {
          const a = i * Math.PI / 4; const p = new THREE.Vector3(Math.cos(a) * 1.15, h * .47 + Math.sin(a) * .72, front + .16);
          addNodeLine(group, [new THREE.Vector3(0, h * .47, front + .1), p], spec.accent, .018);
          const node = new THREE.Mesh(new THREE.SphereGeometry(.075, 8, 6), makeAccentMaterial(spec.accent, .9)); node.position.copy(p); group.add(node);
        }
      } else if (spec.id === "squadamp") {
        addBox(group, [w * .8, h * .22, .1], [0, .65, front], darkMat);
        for (let i = 0; i < 29; i++) {
          const hh = .26 + (Math.abs(Math.sin(i * 1.18) * Math.cos(i * .41)) * h * .43);
          const mat = makeAccentMaterial(i % 4 === 0 ? "#ff72d9" : spec.accent, .72);
          const bar = addBox(group, [.065, hh, .075], [(i - 14) * .105, .72 + hh / 2, front + .09], mat); bars.push(bar);
        }
        for (let i = 0; i < 6; i++) {
          const lamp = addBox(group, [.09, .09, .09], [-w * .36 + i * .29, h * .82, front + .1], i % 2 ? trim : amberMat);
          lamp.rotation.z = (i % 2 ? 1 : -1) * .14;
        }
        addBox(group, [w * .72, .11, .22], [0, .28, front + .1], blackMetalMat);
      } else if (spec.id === "atomlang-evolved-sdk") {
        const endpointGeo = new THREE.IcosahedronGeometry(.43, 1); geometry.add(endpointGeo);
        const leftNode = new THREE.Mesh(endpointGeo, makeAccentMaterial(spec.accent, .85)); const rightNode = new THREE.Mesh(endpointGeo, makeAccentMaterial(spec.accent, .85));
        leftNode.position.set(-w * .28, h * .53, front); rightNode.position.set(w * .28, h * .53, front); group.add(leftNode, rightNode);
        addNodeLine(group, [new THREE.Vector3(-w * .23, h * .53, front), new THREE.Vector3(0, h * .53, front - .12), new THREE.Vector3(w * .23, h * .53, front)], spec.accent, .035);
        const packetGeo = new THREE.BoxGeometry(.42, .36, .24); geometry.add(packetGeo); packet = new THREE.Mesh(packetGeo, keepMaterial(new THREE.MeshStandardMaterial({ color: "#a2f8ff", emissive: spec.accent, emissiveIntensity: 1.4, metalness: .3, roughness: .3 }))); packet.position.set(0, h * .53, front + .05); group.add(packet);
        for (let i = 0; i < 5; i++) addBox(group, [.26, .12, .12], [-.48 + i * .24, h * .53 - .82, front], darkMat);
      } else if (spec.id === "raeyl") {
        const ringGeo = new THREE.TorusGeometry(.48, .105, 12, 42); geometry.add(ringGeo); const bow = new THREE.Mesh(ringGeo, makeAccentMaterial(spec.accent, .95)); bow.position.set(0, h * .61, front + .14); group.add(bow);
        const stem = new THREE.Mesh(new THREE.CylinderGeometry(.12, .12, 1.35, 12), makeAccentMaterial(spec.accent, .9)); stem.position.set(0, h * .4, front + .14); stem.rotation.z = Math.PI / 2; group.add(stem);
        for (const [x, y] of [[-.5, h * .38], [.05, h * .39], [.42, h * .2], [-.43, h * .2]]) {
          const node = new THREE.Mesh(new THREE.IcosahedronGeometry(.18, 1), glassMat); node.position.set(x, y, front + .2); group.add(node);
          addNodeLine(group, [new THREE.Vector3(x, y, front + .12), new THREE.Vector3(0, h * .49, front + .12)], spec.accent, .024);
        }
        addBox(group, [.17, .42, .18], [-.38, h * .38, front + .12], makeAccentMaterial(spec.accent, .8));
        addBox(group, [.17, .32, .18], [.12, h * .38, front + .12], makeAccentMaterial(spec.accent, .8));
      } else if (spec.id === "realball26") {
        const courtMat = keepMaterial(new THREE.MeshStandardMaterial({ color: "#4c3929", roughness: .8, metalness: .12 }));
        addBox(group, [w * .82, .12, 2.2], [0, .28, front - .1], courtMat);
        const courtLine = keepMaterial(new THREE.MeshBasicMaterial({ color: "#e5b877", transparent: true, opacity: .6 }));
        for (const x of [-w * .35, 0, w * .35]) addBox(group, [.035, .025, 2.05], [x, .36, front - .1], courtLine);
        const hoopZ = front + .9;
        const board = addBox(group, [1.15, .72, .08], [w * .27, h * .64, hoopZ], glassMat);
        const boardLineGeo = new THREE.EdgesGeometry(board.geometry); geometry.add(boardLineGeo); const boardEdge = new THREE.LineSegments(boardLineGeo, keepMaterial(new THREE.LineBasicMaterial({ color: "#d8ecf2", transparent: true, opacity: .55 }))); boardEdge.position.copy(board.position); group.add(boardEdge);
        const hoopGeo = new THREE.TorusGeometry(.42, .055, 8, 32); geometry.add(hoopGeo); const hoop = new THREE.Mesh(hoopGeo, amberMat); hoop.rotation.x = Math.PI / 2; hoop.position.set(w * .27, h * .57, hoopZ - .2); group.add(hoop);
        cylinderBetween(group, new THREE.Vector3(w * .27, h * .64, hoopZ + .25), new THREE.Vector3(w * .27, h * .29, hoopZ + .25), .055, metalMat);
        const ballGeo = new THREE.SphereGeometry(.33, 20, 14); geometry.add(ballGeo); ball = new THREE.Mesh(ballGeo, keepMaterial(new THREE.MeshStandardMaterial({ color: "#d57634", roughness: .68, metalness: .05 }))); ball.position.set(-.8, .68, front + .1); group.add(ball);
        const seamMat = keepMaterial(new THREE.MeshBasicMaterial({ color: "#321c12" }));
        for (const angle of [0, Math.PI / 2]) { const seam = new THREE.Mesh(new THREE.TorusGeometry(.332, .012, 5, 40), seamMat); seam.rotation.set(angle, 0, Math.PI / 4); seam.position.copy(ball.position); group.add(seam); }
      } else {
        // The classified chamber remains a sealed steel vault with no interior disclosure.
        const sealed = addBox(group, [w * .56, h * .7, .4], [0, h * .48, front + .45], blackMetalMat);
        const stripeMat = keepMaterial(new THREE.MeshStandardMaterial({ color: "#c94855", map: metalMap, emissive: "#b92438", emissiveIntensity: .25, roughness: .46, metalness: .55 }));
        const stripeGeometry = new THREE.BoxGeometry(w * .62, .16, .1); geometry.add(stripeGeometry);
        for (let i = 0; i < 7; i++) { const stripe = new THREE.Mesh(stripeGeometry, i % 2 ? darkMat : stripeMat); stripe.position.set(0, h * .14 + i * .24, front + .7); stripe.rotation.z = -.35; group.add(stripe); }
        const lockRing = new THREE.Mesh(new THREE.TorusGeometry(.28, .07, 8, 32), stripeMat); lockRing.position.set(0, h * .58, front + .71); group.add(lockRing);
        const lockBody = addBox(group, [.43, .44, .17], [0, h * .45, front + .71], stripeMat); lockBody.position.z += .01;
        const warningGeometry = new THREE.BufferGeometry().setFromPoints([
          new THREE.Vector3(-.62, h * .29, front + .81), new THREE.Vector3(0, h * .54, front + .81), new THREE.Vector3(.62, h * .29, front + .81), new THREE.Vector3(-.62, h * .29, front + .81),
        ]);
        geometry.add(warningGeometry); const warning = new THREE.Line(warningGeometry, keepMaterial(new THREE.LineBasicMaterial({ color: "#f36b73", linewidth: 2 }))); group.add(warning);
        addBox(group, [.055, .34, .055], [0, h * .34, front + .86], stripeMat);
        const punctuation = new THREE.Mesh(new THREE.SphereGeometry(.055, 8, 6), stripeMat); punctuation.position.set(0, h * .255, front + .86); group.add(punctuation);
        sealed.position.z = front + .3;
      }

      const vapor: VaporPuff[] = [];
      for (let i = 0; i < 9; i++) {
        const sprite = new THREE.Sprite(smokeSpriteMat.clone()); materials.add(sprite.material);
        const x = i % 2 === 0 ? -w * .44 : w * .44; const base = new THREE.Vector3(x, .28 + (i % 3) * .1, 1.55 + (i % 3) * .04);
        sprite.position.copy(base); const size = .48 + (i % 4) * .16; sprite.scale.set(size * 1.8, size, 1); (sprite.material as THREE.SpriteMaterial).opacity = .035; group.add(sprite); vapor.push({ sprite, base, seed: i * 2.1, size });
      }
      return { spec, group, leftDoor: leftDoorGroup, rightDoor: rightDoorGroup, light: bayLight, cloud: vapor, bars, packet, ball };
    };
    baySpecs.forEach((spec) => bayModels.set(spec.id, createBay(spec)));

    // Stylized human-scale silhouette anchors the floor perspective without implying a real likeness.
    const figure = new THREE.Group(); figure.position.set(0, 0, 5.3); scene.add(figure);
    const figureShadow = new THREE.Mesh(new THREE.PlaneGeometry(3.1, 1.55), contactMaterial); geometry.add(figureShadow.geometry); figureShadow.rotation.x = -Math.PI / 2; figureShadow.position.set(0, .024, 5.35); scene.add(figureShadow);
    const figureMat = keepMaterial(new THREE.MeshStandardMaterial({ color: "#080d10", metalness: .08, roughness: .82 }));
    const rimMat = keepMaterial(new THREE.MeshStandardMaterial({ color: "#163744", emissive: "#115168", emissiveIntensity: .23, roughness: .62, metalness: .32 }));
    const torsoGeo = new THREE.CapsuleGeometry(.43, 1.05, 6, 14); geometry.add(torsoGeo);
    const torso = new THREE.Mesh(torsoGeo, figureMat); torso.position.set(0, 2.3, 0); torso.rotation.x = -.035; figure.add(torso);
    addBox(figure, [.63, .42, .48], [0, 1.55, 0], figureMat);
    addBox(figure, [.72, 1.05, .3], [0, 2.38, .27], figureMat);
    addBox(figure, [.23, .26, .04], [0, 2.46, .44], rimMat);
    const headGeo = new THREE.SphereGeometry(.34, 20, 14); geometry.add(headGeo); const head = new THREE.Mesh(headGeo, figureMat); head.scale.set(.92, 1.08, .94); head.position.set(0, 3.48, .02); figure.add(head);
    const neckGeo = new THREE.CylinderGeometry(.17, .2, .22, 12); geometry.add(neckGeo); const neck = new THREE.Mesh(neckGeo, figureMat); neck.position.set(0, 3.18, 0); figure.add(neck);
    for (const side of [-1, 1]) {
      const armGeo = new THREE.CapsuleGeometry(.17, .88, 5, 10); geometry.add(armGeo); const arm = new THREE.Mesh(armGeo, figureMat); arm.position.set(side * .62, 2.17, .01); arm.rotation.z = side * -.11; figure.add(arm);
      const legGeo = new THREE.CapsuleGeometry(.205, .86, 5, 12); geometry.add(legGeo); const leg = new THREE.Mesh(legGeo, figureMat); leg.position.set(side * .23, .68, -.015); leg.rotation.z = -side * .035; figure.add(leg);
      const boot = addBox(figure, [.31, .19, .56], [side * .23, .12, .13], darkMat); boot.rotation.y = -.04;
    }

    const bayTargets = new Map<string, THREE.Vector3>();
    for (const model of bayModels.values()) bayTargets.set(model.spec.id, new THREE.Vector3(model.spec.x, model.spec.y + model.spec.height * .87, model.spec.z + 1.3));
    const updateHotspots = () => {
      const rect = container.getBoundingClientRect(); if (!rect.width || !rect.height) return;
      camera.aspect = rect.width / rect.height; camera.updateProjectionMatrix(); scene.updateMatrixWorld(true);
      const map: SceneHotspots = {};
      for (const model of bayModels.values()) {
        const projected = bayTargets.get(model.spec.id)!.clone().project(camera);
        const x = THREE.MathUtils.clamp((projected.x + 1) * .5 * rect.width, 88, Math.max(88, rect.width - 88));
        const y = THREE.MathUtils.clamp((1 - projected.y) * .5 * rect.height, 300, Math.max(300, rect.height - 180));
        map[model.spec.id] = { x, y, scale: THREE.MathUtils.clamp(1.22 - (model.spec.z + 9.1) * .024, .76, 1.08), visible: projected.z > -1 && projected.z < 1 && Math.abs(projected.x) < 1.25 };
      }
      onHotspots(map);
    };

    const resize = () => {
      const width = Math.max(1, container.clientWidth), height = Math.max(1, container.clientHeight);
      const pixelRatio = Math.min(window.devicePixelRatio || 1, width < 768 ? 1.2 : 1.55);
      renderer.setPixelRatio(pixelRatio); renderer.setSize(width, height, false); camera.aspect = width / height; camera.updateProjectionMatrix(); updateHotspots(); cancelAnimationFrame(raf); raf = 0; render();
    };
    let raf = 0, last = performance.now(), elapsed = 0, intersecting = true;
    const mainOpen = { value: .065 };
    const render = () => {
      raf = 0;
      const p = propsRef.current; const dt = Math.min(.5, Math.max(.001, (performance.now() - last) / 1000)); last = performance.now(); elapsed += dt;
      const entryOpenTarget = entryTarget(p.entryPhase);
      mainOpen.value = p.motion === "full" ? THREE.MathUtils.damp(mainOpen.value, entryOpenTarget, 2.7, dt) : entryOpenTarget;
      portalMaterial.opacity = .38 + mainOpen.value * .48;
      cyanGlowMat.opacity = .36 * (1 - mainOpen.value * .88);
      breachCoreMat.opacity = .95 * (1 - mainOpen.value * .96);
      mainLeft.position.x = -.10 - mainOpen.value * 5.9; mainRight.position.x = .10 + mainOpen.value * 5.9;
      mainLeft.rotation.y = -mainOpen.value * .23; mainRight.rotation.y = mainOpen.value * .23;
      portalLight.intensity = p.entryPhase === "locked" || p.entryPhase === "signal" || p.entryPhase === "unlocking" ? 14 : 48;
      const entryVent = p.entryPhase === "venting" || p.entryPhase === "opening";
      mainVapor.forEach((puff) => {
        const strength = p.motion === "full" ? entryVent ? 1 : .38 : 0;
        const mat = puff.mesh.material as THREE.MeshBasicMaterial;
        mat.opacity = strength * (.22 + .16 * (Math.sin(elapsed * 2.8 + puff.seed) + 1));
        puff.mesh.position.set(puff.base.x + Math.sin(elapsed * .43 + puff.seed) * .24, puff.base.y + elapsed % 1.8 * .24, puff.base.z);
        puff.mesh.scale.set(puff.size * (1.05 + (elapsed % 2) * .12), puff.size * (.36 + (elapsed % 2) * .08), .32);
      });
      for (const model of bayModels.values()) {
        const isSelected = p.selectedId === model.spec.id;
        const reveal = isSelected ? p.chamberPhase === "revealed" ? 1 : p.chamberPhase === "opening" ? .72 : p.chamberPhase === "depressurizing" ? .28 : 0 : 0;
      const baseOpen = model.spec.id === "classified" ? 0 : .72;
        const doorOpen = model.spec.id === "classified" && isSelected ? 0 : baseOpen + reveal * (1 - baseOpen);
        const targetLeft = -model.spec.width * (.37 + doorOpen * .18); const targetRight = model.spec.width * (.37 + doorOpen * .18);
        const smoothing = p.motion === "full" ? 3.5 : 100;
        model.leftDoor.position.x = p.motion === "full" ? THREE.MathUtils.damp(model.leftDoor.position.x, targetLeft, smoothing, dt) : targetLeft;
        model.rightDoor.position.x = p.motion === "full" ? THREE.MathUtils.damp(model.rightDoor.position.x, targetRight, smoothing, dt) : targetRight;
        model.leftDoor.rotation.y = -(p.motion === "full" ? THREE.MathUtils.damp(model.leftDoor.rotation.y, .28 + doorOpen * .55, smoothing, dt) : .28 + doorOpen * .55);
        model.rightDoor.rotation.y = p.motion === "full" ? THREE.MathUtils.damp(model.rightDoor.rotation.y, -.28 - doorOpen * .55, smoothing, dt) : -.28 - doorOpen * .55;
        model.light.intensity = isSelected ? 28 + reveal * 42 : 12;
        const venting = p.motion === "full" && isSelected && (p.chamberPhase === "depressurizing" || p.chamberPhase === "opening");
        model.cloud.forEach((puff) => {
          const mat = puff.sprite.material as THREE.SpriteMaterial;
          mat.opacity = p.motion === "full" ? venting ? (.16 + .14 * (Math.sin(elapsed * 3.2 + puff.seed) + 1)) : .035 : 0;
          puff.sprite.position.set(puff.base.x + Math.sin(elapsed * .6 + puff.seed) * .12, puff.base.y + (venting ? (elapsed % 1.4) * .28 : 0), puff.base.z);
        });
        model.bars.forEach((bar, i) => { const base = .4 + Math.abs(Math.sin(i * 1.18) * Math.cos(i * .41)) * .8; bar.scale.y = p.motion === "full" && isSelected ? base * (1 + .16 * Math.sin(elapsed * 4 + i * .65)) : base; });
        if (model.packet) model.packet.position.x = p.motion === "full" && isSelected ? Math.sin(elapsed * 1.8) * model.spec.width * .22 : 0;
        if (model.ball) model.ball.position.y = .52 + (p.motion === "full" && isSelected ? Math.abs(Math.sin(elapsed * 2.2)) * .68 : 0);
      }
      renderer.render(scene, camera);
      canvas.dataset.drawCalls = String(renderer.info.render.calls);
      canvas.dataset.geometries = String(renderer.info.memory.geometries);
      canvas.dataset.textures = String(renderer.info.memory.textures);
      canvas.dataset.vaultOpen = mainOpen.value.toFixed(3);
      canvas.dataset.vaporOpacity = (mainVapor.reduce((sum, puff) => sum + (puff.mesh.material as THREE.MeshBasicMaterial).opacity, 0) / mainVapor.length).toFixed(3);
      const needsAnimation = p.motion === "full" && (p.entryPhase === "signal" || p.entryPhase === "unlocking" || p.entryPhase === "venting" || p.entryPhase === "opening" || p.entryPhase === "illumination" || Math.abs(mainOpen.value - entryOpenTarget) > .008 || Boolean(p.selectedId && p.chamberPhase !== "sealed"));
      if (needsAnimation && intersecting && !document.hidden) raf = requestAnimationFrame(render);
    };
    renderRef.current = () => {
      const p = propsRef.current;
      const needsAnimation = p.motion === "full" && (p.entryPhase === "signal" || p.entryPhase === "unlocking" || p.entryPhase === "venting" || p.entryPhase === "opening" || p.entryPhase === "illumination" || Math.abs(mainOpen.value - entryTarget(p.entryPhase)) > .008 || Boolean(p.selectedId && p.chamberPhase !== "sealed"));
      if (needsAnimation) { if (!raf && intersecting && !document.hidden) raf = requestAnimationFrame(render); }
      else { cancelAnimationFrame(raf); raf = 0; render(); }
    };
    const observer = new ResizeObserver(resize); observer.observe(container);
    const intersection = new IntersectionObserver((entries) => { intersecting = Boolean(entries[0]?.isIntersecting); if (intersecting) renderRef.current?.(); else { cancelAnimationFrame(raf); raf = 0; } }); intersection.observe(container);
    const onVisibility = () => { if (document.hidden) { cancelAnimationFrame(raf); raf = 0; } else renderRef.current?.(); };
    const onLost = (event: Event) => { event.preventDefault(); container.classList.remove("scene-ready"); onReady(false); cancelAnimationFrame(raf); raf = 0; };
    const onRestored = () => { container.classList.add("scene-ready"); onReady(true); renderRef.current?.(); };
    document.addEventListener("visibilitychange", onVisibility); canvas.addEventListener("webglcontextlost", onLost); canvas.addEventListener("webglcontextrestored", onRestored);
    resize();
    const readyTimer = window.setTimeout(() => { if (!container.isConnected) return; container.classList.add("scene-ready"); onReady(true); }, 0);

    return () => {
      disposed = true;
      window.clearTimeout(readyTimer); cancelAnimationFrame(raf); observer.disconnect(); intersection.disconnect(); document.removeEventListener("visibilitychange", onVisibility);
      canvas.removeEventListener("webglcontextlost", onLost); canvas.removeEventListener("webglcontextrestored", onRestored); renderRef.current = null;
      container.classList.remove("scene-ready");
      onReady(false);
      geometry.forEach((item) => item.dispose()); materials.forEach((item) => item.dispose()); textures.forEach((item) => item.dispose()); renderer.dispose(); renderer.forceContextLoss();
    };
  }, [onHotspots, onReady]);

  return <div ref={containerRef} className="scene-viewport" aria-hidden="true"><canvas ref={canvasRef} className="scene-canvas" aria-hidden="true" /></div>;
}
