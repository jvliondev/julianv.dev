"use client";

import dynamic from "next/dynamic";
import Link from "next/link";
import { useCallback, useEffect, useMemo, useReducer, useRef, useState } from "react";
import { chamberReducer, initialChamberState } from "@/lib/chamber-machine";
import { projects } from "@/data/projects";
import { FacilitySceneFallback } from "@/components/FacilitySceneFallback";
import type { SceneHotspots } from "@/components/FacilityScene";

const FacilityScene = dynamic(() => import("@/components/FacilityScene").then((module) => module.FacilityScene), { ssr: false });
type Motion = "full" | "reduced" | "off";
type Mode = "experience" | "professional" | "auto";
type EntryPhase = "locked" | "signal" | "unlocking" | "venting" | "opening" | "illumination" | "entered";

const fallbackHotspots: Record<string, { left: string; top: string; scale: number }> = {
  xondry: { left: "10%", top: "61%", scale: 1.08 },
  squadamp: { left: "28%", top: "61%", scale: .97 },
  "atomlang-evolved-sdk": { left: "40%", top: "61%", scale: .88 },
  raeyl: { left: "60%", top: "61%", scale: .88 },
  realball26: { left: "72%", top: "61%", scale: .97 },
  classified: { left: "90%", top: "61%", scale: 1.08 },
};

export function Facility({ compact = false }: { compact?: boolean }) {
  const [state, dispatch] = useReducer(chamberReducer, initialChamberState);
  const [entered, setEntered] = useState(compact);
  const [entryPhase, setEntryPhase] = useState<EntryPhase>(compact ? "entered" : "locked");
  // Server markup defaults to the complete, link-driven product index so the
  // site remains useful when client JavaScript or WebGL is unavailable.
  const [mode, setMode] = useState<Mode>("professional");
  const [motion, setMotion] = useState<Motion>("full");
  const [hotspots, setHotspots] = useState<SceneHotspots>({});
  const [sceneReady, setSceneReady] = useState(false);
  const lastTrigger = useRef<HTMLButtonElement | null>(null);
  const stateRef = useRef(state);
  const selected = useMemo(() => projects.find((project) => project.id === state.id), [state.id]);
  const setScenePositions = useCallback((positions: SceneHotspots) => setHotspots(positions), []);
  const onSceneReady = useCallback((ready: boolean) => setSceneReady(ready), []);

  const skipEntry = useCallback(() => {
    setEntered(true); setEntryPhase("entered");
  }, []);
  const beginEntry = useCallback(() => {
    if (motion !== "full") { skipEntry(); return; }
    setEntered(false); setEntryPhase("signal");
  }, [motion, skipEntry]);

  useEffect(() => {
    const reduced = matchMedia("(prefers-reduced-motion: reduce)").matches;
    const small = matchMedia("(max-width: 767px)").matches;
    const memory = (navigator as Navigator & { deviceMemory?: number }).deviceMemory ?? 8;
    const lowPower = navigator.hardwareConcurrency <= 4 || memory <= 4;
    const savedMode = sessionStorage.getItem("jv-mode");
    const savedMotion = sessionStorage.getItem("jv-motion");
    const initialHash = location.hash.match(/^#bay=([^&]+)/)?.[1];
    const timer = window.setTimeout(() => {
      setMode(initialHash ? "experience" : savedMode === "experience" || savedMode === "professional" ? savedMode : reduced || small || lowPower ? "professional" : "experience");
      setMotion(savedMotion === "full" || savedMotion === "reduced" || savedMotion === "off" ? savedMotion : reduced ? "off" : small ? "reduced" : "full");
      if (initialHash && projects.some((project) => project.id === initialHash)) { setEntered(true); setEntryPhase("entered"); dispatch({ type: "SELECT", id: initialHash }); }
    }, 0);
    return () => window.clearTimeout(timer);
  }, []);

  useEffect(() => { stateRef.current = state; }, [state]);
  useEffect(() => { sessionStorage.setItem("jv-mode", mode); sessionStorage.setItem("jv-motion", motion); }, [mode, motion]);
  useEffect(() => {
    if (entryPhase === "locked" || entryPhase === "entered" || motion !== "full") return;
    const phaseDuration: Partial<Record<EntryPhase, number>> = { signal: 180, unlocking: 300, venting: 260, opening: 1160, illumination: 700 };
    const next: Partial<Record<EntryPhase, EntryPhase>> = { signal: "unlocking", unlocking: "venting", venting: "opening", opening: "illumination", illumination: "entered" };
    const timer = window.setTimeout(() => {
      const following = next[entryPhase]; if (!following) return;
      setEntryPhase(following); if (following === "entered") setEntered(true);
    }, phaseDuration[entryPhase] ?? 0);
    return () => window.clearTimeout(timer);
  }, [entryPhase, motion]);

  useEffect(() => {
    if (!state.id || state.phase === "revealed" || state.phase === "closing") return;
    if (motion !== "full") { dispatch({ type: "SKIP" }); return; }
    const next = state.phase === "unlocking" ? "BOLTS_DONE" : state.phase === "depressurizing" ? "VENT_DONE" : "DOOR_DONE";
    const delay = state.phase === "unlocking" ? 430 : state.phase === "depressurizing" ? 650 : 940;
    const timer = window.setTimeout(() => dispatch({ type: next }), delay);
    return () => window.clearTimeout(timer);
  }, [state.id, state.phase, state.token, motion]);

  const closeFromHistory = useCallback(() => {
    if (location.hash.startsWith("#bay=") && history.state?.chamber === stateRef.current.id) history.back();
    else { history.replaceState({}, "", location.pathname + location.search); dispatch({ type: "CLOSE" }); }
  }, []);
  useEffect(() => {
    const syncFromHistory = () => {
      const id = location.hash.match(/^#bay=([^&]+)/)?.[1];
      if (id && projects.some((project) => project.id === id)) dispatch({ type: "SELECT", id });
      else if (stateRef.current.id) dispatch({ type: "CLOSE" });
    };
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape" && stateRef.current.id && !(event.target instanceof HTMLInputElement) && !(event.target instanceof HTMLTextAreaElement)) { event.preventDefault(); closeFromHistory(); }
    };
    addEventListener("keydown", onKey); addEventListener("popstate", syncFromHistory);
    return () => { removeEventListener("keydown", onKey); removeEventListener("popstate", syncFromHistory); };
  }, [closeFromHistory]);

  useEffect(() => {
    if (state.phase !== "closing") return;
    const timer = window.setTimeout(() => { dispatch({ type: "CLOSED" }); lastTrigger.current?.focus(); }, motion === "full" ? 520 : 0);
    return () => window.clearTimeout(timer);
  }, [state.phase, state.token, motion]);

  const choose = (id: string, button: HTMLButtonElement) => {
    if (stateRef.current.id === id && stateRef.current.phase !== "closing") return;
    lastTrigger.current = button; history.pushState({ chamber: id }, "", `#bay=${id}`); dispatch({ type: "SELECT", id });
  };
  const close = () => closeFromHistory();
  const changeMode = (value: Exclude<Mode, "auto">) => {
    setMode(value);
    if (value === "professional") { setSceneReady(false); setEntryPhase("entered"); setEntered(true); }
  };
  const changeMotion = (value: Motion) => {
    setMotion(value);
    if (value !== "full") { setEntryPhase("entered"); setEntered(true); if (stateRef.current.id) dispatch({ type: "SKIP" }); }
  };
  const activate = (projectId: string, button: HTMLButtonElement) => choose(projectId, button);

  return <div className={`facility-modes mode-${mode} ${compact ? "facility-modes-compact" : ""}`}>
    <section className="professional-fallback" aria-labelledby="professional-title" hidden={mode === "experience"}>
      <div className="mode-bar"><span>Professional Mode</span><button onClick={() => changeMode("experience")}>Switch to Experience</button></div>
      {compact ? <h2 id="professional-title">Product dossiers</h2> : <h1 id="professional-title">Product dossiers</h1>}
      <p>Fast, motion-free access to the work.</p>
      <div className="pro-grid">{projects.map((project) => <article key={project.id} style={{ "--accent": project.accent } as React.CSSProperties}>
        <span className="status">{project.status}</span><h2>{project.name}</h2><p>{project.summary}</p><Link href={`/work/${project.id}`}>Open dossier <span aria-hidden="true">→</span></Link>
      </article>)}</div>
    </section>

    <section className={`facility-stage ${compact ? "is-compact" : ""} ${entered ? "is-entered" : ""} entry-${entryPhase} ${selected ? "has-reveal" : ""} ${sceneReady && mode === "experience" ? "scene-online" : ""}`} hidden={mode === "professional"} aria-label="Facility JV-01 interactive product corridor" aria-busy={!entered || Boolean(selected && state.phase !== "revealed" && state.phase !== "error")}>
      <FacilitySceneFallback open={entryPhase === "entered" || entryPhase === "illumination"}/>
      {mode === "experience" && <FacilityScene entryPhase={entryPhase} selectedId={state.id} chamberPhase={state.phase} motion={motion} onHotspots={setScenePositions} onReady={onSceneReady} />}
      <div className={`facility-ui ${sceneReady && mode === "experience" ? "webgl-active" : ""}`}>
        <div className="scene-toolbar">
          <span className="scene-mode-label">{mode === "experience" ? "EXPERIENCE MODE" : "FACILITY JV-01"}</span>
          <div><button onClick={() => changeMode("professional")}>Professional Mode</button><label>Motion <select value={motion} onChange={(event) => changeMotion(event.target.value as Motion)}><option value="full">Full</option><option value="reduced">Reduced</option><option value="off">Off</option></select></label></div>
        </div>

        {!compact && <div className="scene-title">
          <span className="eyebrow">FACILITY JV-01 // PRODUCT LAB</span>
          <h1>WELCOME TO<br/>THE BLACK SITE</h1>
          <p>Where ambitious ideas become engineered realities.</p>
          <div className="hero-actions">
            {entryPhase === "locked" ? <button className="entry-button" onClick={beginEntry}>Enter the Facility <span aria-hidden="true">›</span></button> : !entered ? <button className="entry-button" onClick={skipEntry}>Skip entry sequence</button> : <button className="entry-button" onClick={() => changeMode("professional")}>Browse Products</button>}
            <Link className="hero-secondary" href="/work">View Mission Dossiers</Link>
          </div>
        </div>}

        <div className="scene-hotspots" role="group" aria-label="Six research bays">
          {projects.map((project) => {
            const live = hotspots[project.id]; const fallback = fallbackHotspots[project.id];
            const style: React.CSSProperties & { "--hotspot-scale": number } = live
              ? { left: `${live.x}px`, top: `${live.y}px`, "--hotspot-scale": live.scale }
              : { left: fallback.left, top: fallback.top, "--hotspot-scale": fallback.scale };
            return <button key={project.id} ref={state.id === project.id ? lastTrigger : undefined} className={`scene-hotspot ${selected?.id === project.id ? "is-selected" : ""}`} style={{ ...style, "--accent": project.accent } as React.CSSProperties} aria-expanded={selected?.id === project.id} aria-controls={selected?.id === project.id ? "mission-reveal" : undefined} onClick={(event) => activate(project.id, event.currentTarget)}>
              <span className="hotspot-signal" aria-hidden="true"><i/></span><span className="hotspot-copy"><strong>{project.shortName}</strong><small>{project.status}</small></span>
            </button>;
          })}
        </div>

        {entered && !selected && <div className="corridor-hint" aria-hidden="true"><span>SELECT A BAY</span><i/>OPEN DOSSIER</div>}

        {!compact && <div className="access-deck">
          <nav className="access-paths" aria-label="Access paths"><span className="access-heading">ACCESS PATHS</span>
            <div><button onClick={() => { if (!entered) beginEntry(); else document.querySelector<HTMLButtonElement>(".scene-hotspot")?.focus(); }}><span aria-hidden="true">↗</span>Enter Facility</button>
              <Link href="/work"><span aria-hidden="true">▤</span>Browse Products</Link>
              <Link href="/work"><span aria-hidden="true">▣</span>Open Dossiers</Link>
              <Link href="/contact"><span aria-hidden="true">➤</span>Contact</Link></div>
          </nav>
          <Link className="featured-dossier" href="/work/xondry" aria-label="Featured dossier: Xondry, public website">
            <span className="featured-art" aria-hidden="true"><i/><b/><em/><span/></span>
            <span className="featured-copy"><span>FEATURED DOSSIER: <strong>XONDRY</strong></span><small>A home for AI creatives to showcase what they build, discover projects, connect, and gain recognition.</small></span>
            <span className="featured-status">PUBLIC WEBSITE</span><span className="featured-arrow" aria-hidden="true">›</span>
          </Link>
        </div>}

        {selected && <aside id="mission-reveal" className="reveal-panel" role="dialog" aria-modal="false" aria-labelledby="reveal-title" style={{ "--accent": selected.accent } as React.CSSProperties}>
          <button className="close" onClick={close} aria-label={`Close ${selected.name} reveal`}>×</button>
          <span className="phase-label" aria-live="polite">{state.phase === "revealed" ? "DOSSIER READY" : state.phase.toUpperCase()}</span><span className="status">{selected.status}</span><h2 id="reveal-title">{selected.name}</h2>
          {state.phase === "revealed" ? <><p>{selected.summary}</p><div className="panel-actions"><Link className="primary button" href={`/work/${selected.id}`}>Open dossier</Link><button onClick={close}>Return to corridor</button></div></> : <><p>Mechanical sequence in progress.</p><button className="skip-effects" onClick={() => dispatch({ type: "SKIP" })}>Skip effects</button></>}
        </aside>}
        <p className="sr-only" aria-live="polite">{selected ? `${selected.name}: ${state.phase}` : "No chamber selected"}</p>
      </div>
    </section>
  </div>;
}
