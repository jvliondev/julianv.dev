"use client";

import Image from "next/image";
import { useEffect, useMemo, useRef, useState } from "react";
import { projects } from "@/data/projects";
import type { ChamberPhase } from "@/lib/chamber-machine";
import { computeStageTransform, mapArtboardPoint } from "@/lib/blacksite-stage";
import assetManifest from "../../public/blacksite/manifest.json";

type ChamberAsset = (typeof assetManifest.chambers)[number];
type CameraFrame = { at: number; id: string; x: number; y: number; zoom: number; radiusX: number; radiusY: number; stop?: boolean };
type Props = {
  selectedId: string | null;
  phase: ChamberPhase;
  entryPhase: string;
  motion: "full" | "reduced" | "off";
  onActivate: (id: string, button: HTMLButtonElement) => void;
  onClose: () => void;
  onSkip: () => void;
};

function polygon(points: number[][]) {
  return `polygon(${points.map(([x, y]) => `${x}% ${y}%`).join(",")})`;
}

function sampleCameraPath(frames: CameraFrame[], elapsed: number) {
  if (elapsed <= frames[0].at) return frames[0];
  const last = frames.length - 1;
  if (elapsed >= frames[last].at) return frames[last];
  const nextIndex = frames.findIndex((frame, index) => index > 0 && frame.at >= elapsed);
  const fromIndex = nextIndex - 1;
  const from = frames[fromIndex];
  const to = frames[nextIndex];
  const duration = to.at - from.at;
  const t = (elapsed - from.at) / duration;
  const t2 = t * t;
  const t3 = t2 * t;
  const mix = (key: "x" | "y" | "zoom" | "radiusX" | "radiusY") => {
    const previous = frames[Math.max(0, fromIndex - 1)];
    const following = frames[Math.min(last, nextIndex + 1)];
    const slopeAt = (index: number, value: CameraFrame, before: CameraFrame, after: CameraFrame) => {
      if (value.stop) return 0;
      if (index === 0) return (after[key] - value[key]) / (after.at - value.at);
      if (index === last) return (value[key] - before[key]) / (value.at - before.at);
      return (after[key] - before[key]) / (after.at - before.at);
    };
    const tangentFrom = slopeAt(fromIndex, from, previous, to) * duration;
    const tangentTo = slopeAt(nextIndex, to, from, following) * duration;
    return (2 * t3 - 3 * t2 + 1) * from[key]
      + (t3 - 2 * t2 + t) * tangentFrom
      + (-2 * t3 + 3 * t2) * to[key]
      + (t3 - t2) * tangentTo;
  };
  return {
    at: elapsed,
    id: t < 1 ? from.id : to.id,
    x: mix("x"),
    y: mix("y"),
    zoom: mix("zoom"),
    radiusX: mix("radiusX"),
    radiusY: mix("radiusY"),
  };
}

export function BlacksiteExperience({ selectedId, phase, entryPhase, motion, onActivate, onClose, onSkip }: Props) {
  const viewport = useRef<HTMLDivElement>(null);
  const cameraRef = useRef<HTMLDivElement>(null);
  const focusRef = useRef<HTMLDivElement>(null);
  const terminalRef = useRef<HTMLElement>(null);
  const cameraTimeline = useRef<{ id: string | null; startAt: number; frame: number | null }>({ id: null, startAt: 0, frame: null });
  const [size, setSize] = useState({ width: 0, height: 0 });
  const [alignmentDebug, setAlignmentDebug] = useState(false);
  const stageTransform = useMemo(() => computeStageTransform(size.width, size.height), [size]);
  const mobileSelected = projects.find((project) => project.id === selectedId);
  const mobileSelectedAsset = mobileSelected
    ? assetManifest.chambers.find((item: ChamberAsset) => item.id === mobileSelected.id) as ChamberAsset
    : null;

  useEffect(() => {
    if (!viewport.current) return;
    const element = viewport.current;
    const update = () => setSize({ width: element.clientWidth, height: element.clientHeight });
    update();
    if (typeof ResizeObserver === "undefined") {
      addEventListener("resize", update);
      return () => removeEventListener("resize", update);
    }
    const observer = new ResizeObserver(update);
    observer.observe(element);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (process.env.NODE_ENV !== "development") return;
    const timer = window.setTimeout(() => {
      setAlignmentDebug(new URLSearchParams(window.location.search).get("blacksiteDebug") === "1");
    }, 0);
    return () => window.clearTimeout(timer);
  }, []);

  const artboardStyle: React.CSSProperties = {
    width: assetManifest.coordinateSpace.width,
    height: assetManifest.coordinateSpace.height,
    transform: `translate3d(${stageTransform.offsetX}px, ${stageTransform.offsetY}px, 0) scale(${stageTransform.scale})`,
  } as React.CSSProperties;

  const selectedPhase = selectedId ? phase : "sealed";
  const cameraIsMoving = motion === "full" && Boolean(selectedId) && ["unlocking", "depressurizing", "opening", "dissipating"].includes(phase);
  const activeProject = projects.find((project) => project.id === selectedId);
  const focusedAsset = selectedId
    ? assetManifest.chambers.find((item: ChamberAsset) => item.id === selectedId)
    : null;
  const focusedOpening = focusedAsset
    ? focusedAsset.opening ?? {
      left: focusedAsset.aperture.x,
      top: focusedAsset.aperture.y,
      width: focusedAsset.aperture.width,
      height: focusedAsset.aperture.height,
      polygon: focusedAsset.aperture.polygon,
    }
    : null;
  const cameraZoom = 1;
  const cameraStyle = { transform: "translate3d(0,0,0) scale(1)" } as React.CSSProperties;
  const focusStyle = selectedId ? {
    "--spotlight-x": "836px",
    "--spotlight-y": "470px",
    "--spotlight-radius-x": "470px",
    "--spotlight-radius-y": "310px",
  } as React.CSSProperties : undefined;
  const totalScale = stageTransform.scale * cameraZoom;
  const terminalPhase = phase === "unlocking" || phase === "depressurizing" || phase === "opening" || phase === "dissipating";
  const terminalWidth = 320;
  const terminalHeight = 130;
  const terminalPosition = activeProject && focusedAsset && terminalPhase && totalScale > 0 ? (() => {
    const isLeftSideChamber = focusedOpening!.left + focusedOpening!.width / 2 < assetManifest.coordinateSpace.width / 2;
    const gap = 16 / totalScale;
    return {
      left: isLeftSideChamber
        ? focusedOpening!.left + focusedOpening!.width + gap
        : focusedOpening!.left - (terminalWidth / totalScale) - gap,
      top: Math.max(12 / totalScale, focusedOpening!.top - (terminalHeight / totalScale) - gap),
      counterScale: 1 / totalScale,
    };
  })() : null;
  const terminalCopy: Partial<Record<ChamberPhase, { label: string; detail: string; step: number }>> = {
    unlocking: { label: "ACCESS AUTHORIZED", detail: "Mag locks releasing", step: 1 },
    depressurizing: { label: "CHAMBER VENTING", detail: "Atmosphere drawn to extraction ports", step: 2 },
    opening: { label: "BLAST DOOR CYCLE", detail: "Hydraulic shutters retracting", step: 3 },
    dissipating: { label: "ATMOSPHERE CLEARING", detail: "Vapor thinning · dossier indexing", step: 4 },
  };
  const terminalStatus = terminalCopy[phase];
  const terminalSide = selectedId && ["raeyl", "realball26", "classified"].includes(selectedId) ? "left" : "right";
  const terminalStyle = terminalPosition && activeProject ? {
    left: terminalPosition.left,
    top: terminalPosition.top,
    "--terminal-counter-scale": terminalPosition.counterScale,
    "--accent": activeProject.accent,
  } as React.CSSProperties : undefined;

  useEffect(() => {
    const camera = cameraRef.current;
    const focus = focusRef.current;
    const artboard = camera?.parentElement;
    const timeline = cameraTimeline.current;
    if (timeline.frame !== null) cancelAnimationFrame(timeline.frame);
    timeline.frame = null;

    if (!camera || !focus || !selectedId || !focusedOpening || motion !== "full" || phase === "closing") {
      camera?.classList.remove("is-tracking");
      artboard?.classList.remove("is-camera-tracking");
      if (!selectedId || motion !== "full" || phase === "closing") {
        timeline.id = null;
        if (camera) {
          camera.style.transform = "translate3d(0,0,0) scale(1)";
          camera.dataset.cameraWaypoint = "corridor";
          camera.dataset.cameraZoom = "1";
        }
      }
      return;
    }

    if (timeline.id !== selectedId) {
      timeline.id = selectedId;
      timeline.startAt = performance.now();
    }

    const centerX = focusedOpening.left + focusedOpening.width / 2;
    const centerY = focusedOpening.top + focusedOpening.height / 2;
    const chamberRadiusX = Math.round(Math.max(190, focusedOpening.width * 1.1));
    const chamberRadiusY = Math.round(Math.max(155, focusedOpening.height * 1.15));
    const frames: CameraFrame[] = [
      { at: 0, id: "corridor", x: 836, y: 470, zoom: 1, radiusX: 470, radiusY: 310, stop: true },
      { at: 400, id: "walkway-front", x: 836, y: 765, zoom: 1.015, radiusX: 310, radiusY: 190 },
      { at: 850, id: "walkway-mid-1", x: 836, y: 715, zoom: 1.03, radiusX: 270, radiusY: 170 },
      { at: 1300, id: "walkway-mid-2", x: 836, y: 688, zoom: 1.045, radiusX: 240, radiusY: 155 },
      { at: 1750, id: "walkway-gate-approach", x: 836, y: 641, zoom: 1.06, radiusX: 250, radiusY: 165 },
      { at: 2550, id: "gate-approach", x: 836, y: 450, zoom: 1.075, radiusX: 470, radiusY: 310 },
      { at: 3350, id: "gate", x: 836, y: 310, zoom: 1.09, radiusX: 470, radiusY: 310 },
      { at: 4150, id: "warning-lights", x: 836, y: 168, zoom: 1.11, radiusX: 430, radiusY: 205 },
      { at: 4700, id: "warning-lights-hold", x: 836, y: 168, zoom: 1.11, radiusX: 430, radiusY: 205, stop: true },
      { at: 6600, id: "chamber", x: centerX, y: centerY, zoom: 1.2, radiusX: Math.max(170, Math.round(focusedOpening.width * .88)), radiusY: Math.max(140, Math.round(focusedOpening.height * .96)), stop: true },
      { at: 9800, id: "doors-open", x: centerX, y: centerY, zoom: 1.2, radiusX: Math.max(170, Math.round(focusedOpening.width * .88)), radiusY: Math.max(140, Math.round(focusedOpening.height * .96)), stop: true },
      { at: 10100, id: "pullback", x: centerX, y: centerY, zoom: 1.2, radiusX: chamberRadiusX, radiusY: chamberRadiusY, stop: true },
      { at: 12300, id: "corridor", x: 836, y: 470, zoom: 1, radiusX: 470, radiusY: 310, stop: true },
    ];

    camera.classList.add("is-tracking");
    artboard?.classList.add("is-camera-tracking");
    const tick = (now: number) => {
      const elapsed = now - timeline.startAt;
      const frame = sampleCameraPath(frames, elapsed);
      const point = mapArtboardPoint(frame.x, frame.y, stageTransform);
      const translateX = frame.zoom === 1 ? 0 : size.width / 2 - point.x * frame.zoom;
      const translateY = frame.zoom === 1 ? 0 : size.height / 2 - point.y * frame.zoom;
      camera.style.transform = `translate3d(${translateX}px,${translateY}px,0) scale(${frame.zoom})`;
      camera.dataset.cameraWaypoint = frame.id;
      camera.dataset.cameraZoom = frame.zoom.toFixed(3);
      focus.style.setProperty("--spotlight-x", `${frame.x}px`);
      focus.style.setProperty("--spotlight-y", `${frame.y}px`);
      focus.style.setProperty("--spotlight-radius-x", `${frame.radiusX}px`);
      focus.style.setProperty("--spotlight-radius-y", `${frame.radiusY}px`);

      const terminal = terminalRef.current;
      if (terminal && activeProject && stageTransform.scale > 0) {
        const totalScale = stageTransform.scale * frame.zoom;
        const gap = 16 / totalScale;
        const isLeftSideChamber = centerX < assetManifest.coordinateSpace.width / 2;
        terminal.style.left = `${isLeftSideChamber ? focusedOpening.left + focusedOpening.width + gap : focusedOpening.left - (terminalWidth / totalScale) - gap}px`;
        terminal.style.top = `${Math.max(12 / totalScale, focusedOpening.top - (terminalHeight / totalScale) - gap)}px`;
        terminal.style.setProperty("--terminal-counter-scale", String(1 / totalScale));
      }

      if (elapsed < frames[frames.length - 1].at) timeline.frame = requestAnimationFrame(tick);
      else {
        timeline.frame = null;
        camera.classList.remove("is-tracking");
        artboard?.classList.remove("is-camera-tracking");
      }
    };
    tick(performance.now());
    return () => { if (timeline.frame !== null) cancelAnimationFrame(timeline.frame); };
  }, [selectedId, phase, motion, focusedOpening, activeProject, size.width, size.height, stageTransform, terminalWidth, terminalHeight]);

  return <>
    <div ref={viewport} className={`blacksite-viewport ${cameraIsMoving ? "is-panning" : ""}`} data-scene-ready={stageTransform.scale > 0}>
      {stageTransform.scale > 0 && <div ref={cameraRef} className="blacksite-camera" style={cameraStyle} data-camera-zoom={cameraZoom} data-camera-waypoint="corridor">
      <div className={`blacksite-artboard phase-${selectedPhase} entry-${entryPhase} motion-${motion}`} style={artboardStyle} data-selected={selectedId ?? "none"} data-entry-phase={entryPhase}>
        <Image className="blacksite-environment" src={assetManifest.environmentPlate} alt="" width={1672} height={941} loading="eager" fetchPriority="high" unoptimized draggable={false}/>
        <div className="blacksite-atmosphere" aria-hidden="true"/>
        <div className="blacksite-environment-light-system" aria-hidden="true">
          <Image className="blacksite-environment-emissive blacksite-environment-glow" src={assetManifest.effects.environmentEmissive} alt="" width={1672} height={941} unoptimized draggable={false}/>
          <Image className="blacksite-environment-emissive blacksite-environment-core" src={assetManifest.effects.environmentEmissive} alt="" width={1672} height={941} unoptimized draggable={false}/>
          {assetManifest.backgroundLights.map((light) => <span
            key={light.id}
            className={`blacksite-background-light-unit mode-${light.mode}`}
            data-emitter={light.id}
            style={{
              left: light.x,
              top: light.y,
              width: light.width,
              height: light.height,
              "--emitter-color": light.color,
              "--emitter-delay": light.delay,
              "--sequence-delay": light.sequenceDelay ?? "0s",
              "--gate-sequence-delay": light.id === "arch-warning-right" ? ".2s" : "0s",
            } as React.CSSProperties}
          >
            {light.mode === "sequence" && <i className="blacksite-background-dimmer" style={{ maskImage: `url(${light.asset})`, WebkitMaskImage: `url(${light.asset})` }}/>}
            {light.mode !== "sequence" && <i className="blacksite-background-aura"/>}
            <Image className="blacksite-background-emitter" src={light.asset} alt="" fill sizes="100px" unoptimized draggable={false}/>
          </span>)}
        </div>
        <div ref={focusRef} className="blacksite-cinematic-focus" style={focusStyle} data-focus-project={selectedId ?? "none"} aria-hidden="true"/>
        {alignmentDebug && <svg className="blacksite-alignment-debug" viewBox="0 0 1672 941" preserveAspectRatio="none" aria-hidden="true">
          <path d="M 0 0 H 1672 M 0 0 V 941" fill="none" stroke="#f8fbff" strokeDasharray="8 6" strokeWidth="2"/>
          {projects.map((project) => {
            const asset = assetManifest.chambers.find((item: ChamberAsset) => item.id === project.id) as ChamberAsset;
            const opening = asset.opening ?? { left: asset.aperture.x, top: asset.aperture.y, width: asset.aperture.width, height: asset.aperture.height, polygon: asset.aperture.polygon };
            const points = opening.polygon.map(([x, y]) => `${opening.left + opening.width * x / 100},${opening.top + opening.height * y / 100}`).join(" ");
            return <g key={project.id}>
              <rect x={opening.left} y={opening.top} width={opening.width} height={opening.height} fill="none" stroke="#f8fbff" strokeDasharray="5 4" strokeWidth="1"/>
              <polygon points={points} fill={project.accent} fillOpacity=".14" stroke={project.accent} strokeWidth="3"/>
              <circle cx={asset.ventAnchor.x} cy={asset.ventAnchor.y} r="6" fill="#fff" stroke={project.accent} strokeWidth="4"/>
              <text x={asset.aperture.x + 5} y={asset.aperture.y - 7} fill="#fff" stroke="#061018" strokeWidth="4" paintOrder="stroke" fontFamily="monospace" fontSize="16">{project.shortName} | z2 exhibit / z5 shutter / z8 control</text>
            </g>;
          })}
        </svg>}
        {projects.map((project) => {
          const asset = assetManifest.chambers.find((item: ChamberAsset) => item.id === project.id) as ChamberAsset;
          const { aperture, shutter } = asset;
          const opening = asset.opening ?? { left: aperture.x, top: aperture.y, width: aperture.width, height: aperture.height, polygon: aperture.polygon };
          const active = selectedId === project.id;
          const chamberImageVisible = active && ["opening", "dissipating", "revealed", "error"].includes(phase);
          const steamActive = active && (phase === "opening" || phase === "dissipating") && motion !== "off";
          const isClassified = project.id === "classified";
          const accent = project.accent;
          const customStyle = {
            left: aperture.x,
            top: aperture.y,
            width: aperture.width,
            height: aperture.height,
            clipPath: polygon(aperture.polygon),
            "--accent": accent,
          } as React.CSSProperties;
          const openingStyle = {
            left: opening.left,
            top: opening.top,
            width: opening.width,
            height: opening.height,
            clipPath: polygon(opening.polygon),
            "--accent": accent,
          } as React.CSSProperties;
          const artworkStyle = {
            left: aperture.x,
            top: aperture.y,
            width: aperture.width,
            height: aperture.height,
            "--accent": accent,
          } as React.CSSProperties;
          const lightSpillStyle = {
            left: aperture.x,
            top: aperture.y,
            width: aperture.width,
            height: aperture.height,
            "--accent": accent,
          } as React.CSSProperties;
          const frameStyle = {
            left: asset.frame.left,
            top: asset.frame.top,
            width: asset.frame.width,
            height: asset.frame.height,
          } as React.CSSProperties;
          const steamStyle = (vent: ChamberAsset["vents"][number]) => ({
            left: vent.x - vent.width * 0.04,
            top: vent.y - vent.height * 0.5,
            width: vent.width,
            height: vent.height,
            transform: `rotate(${vent.angle}deg)`,
            transformOrigin: "4% 50%",
            "--accent": accent,
            "--smoke-delay": vent.delay,
            "--smoke-opacity": vent.opacity,
            "--smoke-loop-delay": vent.loopDelay,
            "--smoke-drift-duration": vent.duration,
          } as React.CSSProperties);
          const leafStyle = {
            left: shutter.left,
            top: shutter.top,
            width: shutter.width / 2,
            height: shutter.height,
            transformOrigin: "0% 50%",
            "--travel": "-7%",
            "--turn": "76deg",
          } as React.CSSProperties;
          const rightLeafStyle = {
            ...leafStyle,
            left: shutter.left + shutter.width / 2,
            transformOrigin: "100% 50%",
            "--travel": "7%",
            "--turn": "-76deg",
          } as React.CSSProperties;
          const doorPerspectiveStyle = {
            "--door-perspective-origin": `${shutter.left + shutter.width / 2}px ${shutter.top + shutter.height / 2}px`,
          } as React.CSSProperties;

          return <div className={`blacksite-bay ${active ? "is-active" : ""} ${isClassified ? "is-classified" : ""}`} key={project.id} data-bay={project.id} data-phase={active ? phase : "sealed"} data-door-state={chamberImageVisible ? "open" : "closed"} style={doorPerspectiveStyle}>
            <div className="blacksite-exhibit" style={artworkStyle} aria-hidden="true">
              <Image className="blacksite-exhibit-image" src={asset.exhibit} alt="" fill sizes="(min-width: 761px) 18vw, 0px" unoptimized draggable={false}/>
            </div>
            <div className={`blacksite-light-spill ${active && chamberImageVisible ? "is-lit" : ""}`} style={lightSpillStyle} aria-hidden="true">
              <Image className="blacksite-emissive-image" src={asset.emissive} alt="" fill sizes="(min-width: 761px) 18vw, 0px" unoptimized draggable={false}/>
            </div>
            <div className={`blacksite-emissive-core ${active && chamberImageVisible ? "is-lit" : ""}`} style={artworkStyle} aria-hidden="true">
              <Image className="blacksite-emissive-image" src={asset.emissive} alt="" fill sizes="(min-width: 761px) 18vw, 0px" unoptimized draggable={false}/>
            </div>
            {!chamberImageVisible && <div className="blacksite-seal" style={openingStyle} aria-hidden="true"/>}
            <div className="blacksite-seam" style={{ left: shutter.left + shutter.width / 2, top: shutter.top, height: shutter.height, "--accent": accent } as React.CSSProperties} aria-hidden="true"/>
            <div className="blacksite-door-leaf door-left" style={leafStyle} aria-hidden="true">
              <Image className="blacksite-door-face" src={shutter.leftAsset} alt="" fill sizes="(min-width: 761px) 8vw, 0px" unoptimized draggable={false}/>
            </div>
            <div className="blacksite-door-leaf door-right" style={rightLeafStyle} aria-hidden="true">
              <Image className="blacksite-door-face" src={shutter.rightAsset} alt="" fill sizes="(min-width: 761px) 8vw, 0px" unoptimized draggable={false}/>
            </div>
            <Image className="blacksite-frame-occluder" src={asset.frame.asset} alt="" width={asset.frame.width} height={asset.frame.height} unoptimized draggable={false} style={frameStyle}/>
            {steamActive && asset.vents.map((vent) => <div key={`${project.id}-${vent.id}`} className="blacksite-steam" data-vent={vent.id} style={steamStyle(vent)} aria-hidden="true">
              {motion === "full" ? <Image className="steam-cloud steam-cloud-animation" src={assetManifest.effects.steamLoop} alt="" fill sizes="(min-width: 761px) 16vw, 0px" unoptimized draggable={false}/> : <Image className="steam-cloud steam-cloud-poster" src={assetManifest.effects.steamPlume} alt="" fill sizes="(min-width: 761px) 16vw, 0px" unoptimized draggable={false}/>}
            </div>)}
            <button
              type="button"
              className="scene-hotspot blacksite-hotspot"
              style={customStyle}
              aria-label={`Open ${project.name} project. ${project.status}.`}
              aria-expanded={active}
              aria-controls={active && phase !== "closing" ? "project-reveal" : undefined}
              onClick={(event) => onActivate(project.id, event.currentTarget)}
            ><span className="sr-only">{project.name}: {project.status}. Open project.</span></button>
          </div>;
        })}
        {activeProject && terminalPosition && terminalStatus && terminalStyle && <aside
          ref={terminalRef}
          id="project-reveal"
          className={`blacksite-terminal reveal-panel-${terminalSide} is-progress`}
          role="dialog"
          aria-modal="false"
          aria-labelledby="project-terminal-title"
          data-terminal-phase={phase}
          style={terminalStyle}
        >
          <div className="terminal-shell">
            <header className="terminal-topline">
              <span className="terminal-channel"><i aria-hidden="true"/> JV-01 <b>/</b> CHAMBER LINK</span>
              <span className="terminal-live"><i aria-hidden="true"/> LIVE</span>
              <button className="terminal-close" type="button" onClick={onClose} aria-label={`Close ${activeProject.name} sequence`}>×</button>
            </header>
            <div className="terminal-readout">
              <div className="terminal-project-line"><span>PROJECT CHANNEL</span><span>{String(terminalStatus.step).padStart(2, "0")} <i>/</i> 04</span></div>
              <h2 id="project-terminal-title" aria-live="polite">{activeProject.name}</h2>
              <div className="terminal-phase-line"><strong aria-live="polite">{terminalStatus.label}</strong><span>{terminalStatus.detail}</span></div>
              <div className="terminal-progress" role="img" aria-label={`Chamber sequence: step ${terminalStatus.step} of 4`}>
                {[1, 2, 3, 4].map((step) => <i key={step} className={step <= terminalStatus.step ? "is-complete" : ""}/>) }
              </div>
            </div>
            <button className="terminal-skip" type="button" onClick={onSkip}>Skip effects <span aria-hidden="true">↗</span></button>
          </div>
        </aside>}
        <span className="blacksite-vault-seam" aria-hidden="true"/>
        <span className="blacksite-vault-vent" aria-hidden="true"><i/><i/><i/></span>
        <span className="blacksite-light-column" aria-hidden="true"/>
      </div>
      </div>}
    </div>
    <div className="blacksite-mobile-selector" role="group" aria-label="Choose a project chamber">
      <p>SELECT A CHAMBER</p>
      <div>{projects.map((project) => <button
        key={project.id}
        type="button"
        className={`blacksite-mobile-choice ${selectedId === project.id ? "is-active" : ""}`}
        aria-label={`Open ${project.name} project. ${project.status}.`}
        aria-expanded={selectedId === project.id}
        onClick={(event) => onActivate(project.id, event.currentTarget)}
      ><span className="blacksite-mobile-thumb"><Image src={(assetManifest.chambers.find((item: ChamberAsset) => item.id === project.id) as ChamberAsset).exhibit} alt="" fill sizes="52px" unoptimized/></span><span><strong>{project.shortName}</strong><small>{project.status}</small></span><b aria-hidden="true">›</b></button>)}</div>
      {mobileSelected && mobileSelectedAsset && <div className="blacksite-mobile-selected-exhibit" style={{ "--accent": mobileSelected.accent } as React.CSSProperties}>
        <Image src={mobileSelectedAsset.exhibit} alt="" fill sizes="(max-width: 760px) 90vw, 0px" unoptimized/>
        <span>{mobileSelected.name} exhibit</span>
      </div>}
    </div>
  </>;
}
