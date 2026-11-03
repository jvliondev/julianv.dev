"use client";
import Link from "next/link";
import { useEffect, useMemo, useReducer, useRef, useState } from "react";
import { chamberReducer, initialChamberState } from "@/lib/chamber-machine";
import { projects } from "@/data/projects";

type Motion = "full" | "reduced" | "off";
export function Facility({ compact = false }: { compact?: boolean }) {
  const [state, dispatch] = useReducer(chamberReducer, initialChamberState);
  const [entered, setEntered] = useState(compact); const [entryPhase, setEntryPhase] = useState<"locked" | "unlocking" | "venting" | "opening" | "entered">(compact ? "entered" : "locked");
  const [mode, setMode] = useState<"experience" | "professional" | "auto">("auto");
  const [motion, setMotion] = useState<Motion>("full"); const lastTrigger = useRef<HTMLButtonElement | null>(null);
  const stateRef = useRef(state);
  const selected = useMemo(() => projects.find((p) => p.id === state.id), [state.id]);
  useEffect(() => {
    const reduced = matchMedia("(prefers-reduced-motion: reduce)").matches;
    const small = matchMedia("(max-width: 767px)").matches;
    const memory = (navigator as Navigator & { deviceMemory?: number }).deviceMemory ?? 8;
    const lowPower = navigator.hardwareConcurrency <= 4 || memory <= 4;
    const savedMode = sessionStorage.getItem("jv-mode") as "experience" | "professional" | null;
    const savedMotion = sessionStorage.getItem("jv-motion") as Motion | null;
    const initialHash = location.hash.match(/^#bay=([^&]+)/)?.[1];
    const timer = window.setTimeout(() => {
      setMode(initialHash ? "experience" : savedMode ?? (reduced || small || lowPower ? "professional" : "experience"));
      setMotion(savedMotion ?? (reduced ? "off" : small ? "reduced" : "full"));
      if (initialHash && projects.some((project) => project.id === initialHash)) { setEntered(true); setEntryPhase("entered"); dispatch({ type: "SELECT", id: initialHash }); }
    }, 0);
    return () => clearTimeout(timer);
  }, []);
  useEffect(() => { stateRef.current = state; }, [state]);
  useEffect(() => { sessionStorage.setItem("jv-mode", mode); sessionStorage.setItem("jv-motion", motion); }, [mode, motion]);
  useEffect(() => {
    if (entryPhase === "locked" || entryPhase === "entered") return;
    const next = entryPhase === "unlocking" ? "venting" : entryPhase === "venting" ? "opening" : "entered";
    const delay = entryPhase === "unlocking" ? 420 : entryPhase === "venting" ? 550 : 850;
    const timer = window.setTimeout(() => { setEntryPhase(next); if (next === "entered") setEntered(true); }, motion === "full" ? delay : motion === "reduced" ? 90 : 0);
    return () => clearTimeout(timer);
  }, [entryPhase, motion]);
  useEffect(() => {
    if (!state.id || state.phase === "revealed" || state.phase === "closing") return;
    if (motion === "off") { dispatch({ type: "SKIP" }); return; }
    const factor = motion === "reduced" ? .1 : 1;
    const next = state.phase === "unlocking" ? "BOLTS_DONE" : state.phase === "depressurizing" ? "VENT_DONE" : "DOOR_DONE";
    const delay = state.phase === "unlocking" ? 380 : state.phase === "depressurizing" ? 480 : 700;
    const timer = window.setTimeout(() => dispatch({ type: next }), delay * factor);
    return () => clearTimeout(timer);
  }, [state.id, state.phase, state.token, motion]);
  useEffect(() => {
    if (state.phase !== "closing") return;
    const timer = window.setTimeout(() => { dispatch({ type: "CLOSED" }); lastTrigger.current?.focus(); }, motion === "full" ? 360 : 0);
    return () => clearTimeout(timer);
  }, [state.phase, state.token, motion]);
  useEffect(() => {
    const syncFromHistory = () => {
      const id = location.hash.match(/^#bay=([^&]+)/)?.[1];
      if (id && projects.some((project) => project.id === id)) dispatch({ type: "SELECT", id });
      else if (stateRef.current.id) dispatch({ type: "CLOSE" });
    };
    const onKey = (event: KeyboardEvent) => { if (event.key === "Escape" && stateRef.current.id) { event.preventDefault(); closeFromHistory(); } };
    const closeFromHistory = () => {
      if (location.hash.startsWith("#bay=") && history.state?.chamber === stateRef.current.id) history.back();
      else { history.replaceState({}, "", location.pathname + location.search); dispatch({ type: "CLOSE" }); }
    };
    addEventListener("keydown", onKey); addEventListener("popstate", syncFromHistory);
    return () => { removeEventListener("keydown", onKey); removeEventListener("popstate", syncFromHistory); };
  }, []);
  const choose = (id: string, button: HTMLButtonElement) => { lastTrigger.current = button; history.pushState({ chamber: id }, "", `#bay=${id}`); dispatch({ type: "SELECT", id }); };
  const close = () => {
    if (location.hash.startsWith("#bay=") && history.state?.chamber === state.id) history.back();
    else { history.replaceState({}, "", location.pathname + location.search); dispatch({ type: "CLOSE" }); }
  };
  const beginEntry = () => { if (motion === "off") { setEntered(true); setEntryPhase("entered"); } else setEntryPhase("unlocking"); };
  const skipEntry = () => { setEntered(true); setEntryPhase("entered"); };
  const changeMotion = (value: Motion) => { setMotion(value); if (value === "off" && entryPhase !== "locked") skipEntry(); };
  const changeMode = (value: "experience" | "professional") => { setMode(value); if (value === "professional" && entryPhase !== "locked") skipEntry(); };
  return <div className={`facility-modes mode-${mode}`}>
  <section className="professional-fallback" aria-labelledby="professional-title" hidden={mode === "experience"}>
    <div className="mode-bar"><span>Professional Mode</span><button onClick={() => setMode("experience")}>Switch to Experience</button></div>
    {compact ? <h2 id="professional-title">Product dossiers</h2> : <h1 id="professional-title">Product dossiers</h1>}<p>Fast, motion-free access to the work.</p>
    <div className="pro-grid">{projects.map((p) => <article key={p.id} style={{"--accent": p.accent} as React.CSSProperties}><span className="status">{p.status}</span><h2>{p.name}</h2><p>{p.summary}</p><Link href={`/work/${p.id}`}>Open dossier <span aria-hidden>→</span></Link></article>)}</div>
  </section>
  <section className={`facility ${entered ? "is-entered" : ""} entry-${entryPhase} phase-${state.phase}`} hidden={mode === "professional"} aria-label="Interactive product facility" aria-busy={entryPhase !== "locked" && entryPhase !== "entered" || state.phase !== "sealed" && state.phase !== "revealed" && state.phase !== "error"}>
    <div className="mode-bar"><span>Experience Mode</span><div><button onClick={() => changeMode("professional")}>Professional Mode</button><label>Motion <select value={motion} onChange={(e) => changeMotion(e.target.value as Motion)}><option value="full">Full</option><option value="reduced">Reduced</option><option value="off">Off</option></select></label></div></div>
    {!entered && <div className={`entrance-copy ${entryPhase !== "locked" ? "in-sequence" : ""}`}><span className="eyebrow">FACILITY JV-01 // PRODUCT LAB</span><h1>WELCOME TO<br />THE BLACK SITE</h1><p>Where ambitious ideas become engineered realities.</p><div className="hero-actions">{entryPhase === "locked" ? <button className="primary" onClick={beginEntry}>Enter the Facility</button> : <button className="primary" onClick={skipEntry}>Skip entry sequence</button>}<Link className="button" href="/work">Browse Products</Link></div></div>}
    <div className="world" aria-hidden="true"><div className="ceiling"><i/><i/><i/></div><div className="portal"><div className="portal-ring ring-a"/><div className="portal-ring ring-b"/><span className="portal-bolt bolt-a"/><span className="portal-bolt bolt-b"/><span className="portal-bolt bolt-c"/><span className="portal-bolt bolt-d"/><span className="portal-vent vent-a"/><span className="portal-vent vent-b"/><span className="portal-leaf leaf-a"/><span className="portal-leaf leaf-b"/><div className="portal-seam"/><div className="portal-light"/><span>JV—01</span></div><div className="floor"><i/><i/><i/></div></div>
    <div className="bay-grid" role="group" aria-label="Research bays">{projects.map((p, index) => <button key={p.id} ref={state.id === p.id ? lastTrigger : undefined} className={`bay bay-${index + 1} motif-${p.motif} ${state.id === p.id ? "active" : ""}`} style={{"--accent": p.accent} as React.CSSProperties} aria-expanded={state.id === p.id} onClick={(e) => choose(p.id, e.currentTarget)}>
      <span className="bay-lock"><i/><i/><i/></span><span className="bay-visual"><i/><i/><i/><span className="chamber-door door-a"/><span className="chamber-door door-b"/></span><strong>{p.shortName}</strong><small>{p.category}</small><em>{p.status}</em>
    </button>)}</div>
    {entered && !state.id && <div className="facility-guide"><span>SELECT A RESEARCH BAY</span><p>Six products. Six distinct systems.</p></div>}
    {selected && <div className="reveal-panel" role="dialog" aria-modal="false" aria-labelledby="reveal-title" style={{"--accent": selected.accent} as React.CSSProperties}>
      <button className="close" onClick={close} aria-label={`Close ${selected.name} reveal`}>×</button><span className="phase-label" aria-live="polite">{state.phase}</span><span className="status">{selected.status}</span><h2 id="reveal-title">{selected.name}</h2>
      {state.phase === "revealed" ? <><p>{selected.summary}</p><div className="panel-actions"><Link className="primary button" href={`/work/${selected.id}`}>Open dossier</Link><button onClick={close}>Return to corridor</button></div></> : <><div className="sequence"><i/><i/><i/><i/></div><p>Mechanical sequence in progress.</p><button onClick={() => dispatch({ type: "SKIP" })}>Skip effects</button></>}
    </div>}
    <p className="sr-only" aria-live="polite">{selected ? `${selected.name}: ${state.phase}` : "No chamber selected"}</p>
  </section>
  </div>;
}
