"use client";

import Image from "next/image";
import Link from "next/link";
import { useCallback, useEffect, useMemo, useReducer, useRef, useState, useSyncExternalStore } from "react";
import { chamberReducer, initialChamberState } from "@/lib/chamber-machine";
import { projects } from "@/data/projects";
import { BlacksiteExperience } from "@/components/BlacksiteExperience";

type Motion = "full" | "reduced" | "off";
type EntryPhase = "locked" | "signal" | "unlocking" | "venting" | "opening" | "illumination" | "entered";

function subscribeToMotionChanges(onChange: () => void) {
  const reduced = window.matchMedia("(prefers-reduced-motion: reduce)");
  const small = window.matchMedia("(max-width: 767px)");
  reduced.addEventListener("change", onChange);
  small.addEventListener("change", onChange);
  return () => {
    reduced.removeEventListener("change", onChange);
    small.removeEventListener("change", onChange);
  };
}

function getMotionPreference(): Motion {
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return "off";
  return window.matchMedia("(max-width: 767px)").matches ? "reduced" : "full";
}

export function Facility() {
  const [state, dispatch] = useReducer(chamberReducer, initialChamberState);
  const [entered, setEntered] = useState(false);
  const [entryPhase, setEntryPhase] = useState<EntryPhase>("locked");
  const motion = useSyncExternalStore(subscribeToMotionChanges, getMotionPreference, () => "full" as Motion);
  const lastTrigger = useRef<HTMLButtonElement | null>(null);
  const initialSelectionTimer = useRef<number | null>(null);
  const stateRef = useRef(state);
  const selected = useMemo(() => projects.find((project) => project.id === state.id), [state.id]);
  const revealPanelSide = selected && ["raeyl", "realball26", "classified"].includes(selected.id) ? "left" : "right";
  const selectedHasLiveSite = Boolean(selected?.external);
  const overviewImage = selected?.id === "xondry" ? "/images/projects/xondry-live.jpg" : selected?.artwork;
  const overviewImageAlt = selected?.id === "xondry"
    ? "Screenshot of the live Xondry AI creator discovery website."
    : selected?.artworkAlt;

  const skipEntry = useCallback(() => {
    setEntered(true);
    setEntryPhase("entered");
  }, []);
  const beginEntry = useCallback(() => {
    if (motion !== "full") { skipEntry(); return; }
    setEntered(false);
    setEntryPhase("signal");
  }, [motion, skipEntry]);

  useEffect(() => {
    const initialHash = location.hash.match(/^#bay=([^&]+)/)?.[1];
    if (initialHash && projects.some((project) => project.id === initialHash)) {
      const timer = window.setTimeout(() => {
        initialSelectionTimer.current = null;
        setEntered(true);
        setEntryPhase("entered");
        dispatch({ type: "SELECT", id: initialHash });
      }, 0);
      initialSelectionTimer.current = timer;
      return () => {
        window.clearTimeout(timer);
        initialSelectionTimer.current = null;
      };
    }
  }, []);

  useEffect(() => { stateRef.current = state; }, [state]);
  useEffect(() => {
    const resetHome = () => {
      dispatch({ type: "CANCEL" });
      setEntryPhase("locked");
      setEntered(false);
    };
    window.addEventListener("jv:home-navigation", resetHome);
    return () => window.removeEventListener("jv:home-navigation", resetHome);
  }, []);
  useEffect(() => {
    if (entryPhase === "locked" || entryPhase === "entered" || motion !== "full") return;
    const phaseDuration: Partial<Record<EntryPhase, number>> = { signal: 180, unlocking: 300, venting: 260, opening: 1160, illumination: 700 };
    const next: Partial<Record<EntryPhase, EntryPhase>> = { signal: "unlocking", unlocking: "venting", venting: "opening", opening: "illumination", illumination: "entered" };
    const timer = window.setTimeout(() => {
      const following = next[entryPhase];
      if (!following) return;
      setEntryPhase(following);
      if (following === "entered") setEntered(true);
    }, phaseDuration[entryPhase] ?? 0);
    return () => window.clearTimeout(timer);
  }, [entryPhase, motion]);

  useEffect(() => {
    if (!state.id || state.phase === "revealed" || state.phase === "closing" || state.phase === "error") return;
    if (motion !== "full") { dispatch({ type: "SKIP" }); return; }
    const next = state.phase === "unlocking" ? "BOLTS_DONE" : state.phase === "depressurizing" ? "VENT_DONE" : state.phase === "opening" ? "DOOR_DONE" : "DISSIPATE_DONE";
    const delay = state.phase === "unlocking" ? 1850 : state.phase === "depressurizing" ? 5250 : state.phase === "opening" ? 2700 : 2500;
    const timer = window.setTimeout(() => dispatch({ type: next }), delay);
    return () => window.clearTimeout(timer);
  }, [state.id, state.phase, state.token, motion]);

  const closeFromHistory = useCallback(() => {
    if (location.hash.startsWith("#bay=") && history.state?.chamber === stateRef.current.id && history.state?.chamberEntry === true) history.back();
    else { history.replaceState({}, "", location.pathname + location.search); dispatch({ type: "CLOSE" }); }
  }, []);
  useEffect(() => {
    const syncFromHistory = () => {
      const id = location.hash.match(/^#bay=([^&]+)/)?.[1];
      if (id && projects.some((project) => project.id === id)) dispatch({ type: "SELECT", id });
      else if (stateRef.current.id) dispatch({ type: "CLOSE" });
    };
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape" && stateRef.current.id && !(event.target instanceof HTMLInputElement) && !(event.target instanceof HTMLTextAreaElement)) {
        event.preventDefault();
        closeFromHistory();
      }
    };
    addEventListener("keydown", onKey);
    addEventListener("popstate", syncFromHistory);
    return () => { removeEventListener("keydown", onKey); removeEventListener("popstate", syncFromHistory); };
  }, [closeFromHistory]);

  useEffect(() => {
    if (state.phase !== "closing") return;
    const timer = window.setTimeout(() => {
      dispatch({ type: "CLOSED" });
      lastTrigger.current?.focus();
    }, motion === "full" ? 520 : 0);
    return () => window.clearTimeout(timer);
  }, [state.phase, state.token, motion]);

  const choose = (id: string, button: HTMLButtonElement) => {
    if (stateRef.current.id === id && stateRef.current.phase !== "closing") return;
    if (initialSelectionTimer.current !== null) {
      window.clearTimeout(initialSelectionTimer.current);
      initialSelectionTimer.current = null;
    }
    lastTrigger.current = button;
    const hasActiveChamber = Boolean(stateRef.current.id || location.hash.match(/^#bay=[^&]+/));
    const canReturnToCorridor = history.state?.chamberEntry === true;
    if (hasActiveChamber) history.replaceState({ chamber: id, chamberEntry: canReturnToCorridor }, "", `#bay=${id}`);
    else history.pushState({ chamber: id, chamberEntry: true }, "", `#bay=${id}`);
    dispatch({ type: "SELECT", id });
  };
  const close = () => closeFromHistory();
  const activate = (projectId: string, button: HTMLButtonElement) => choose(projectId, button);

  return <section className={`facility-stage ${entered ? "is-entered" : ""} entry-${entryPhase} ${selected ? "has-reveal" : ""} scene-online`} aria-label="Facility JV-01 interactive project chambers" aria-busy={!entered || Boolean(selected && !["revealed", "error"].includes(state.phase))}>
    <BlacksiteExperience selectedId={state.id} phase={state.phase} entryPhase={entryPhase} motion={motion} onActivate={activate} onClose={close} onSkip={() => dispatch({ type: "SKIP" })}/>
    <div className="facility-ui">
      <div className="scene-title">
        <span className="eyebrow">FACILITY JV-01 // PRODUCT LAB</span>
        <h1>WELCOME TO<br/>THE BLACK SITE</h1>
        <p>Where ambitious ideas become engineered realities.</p>
        <div className="hero-actions">
          {entryPhase === "locked" ? <button className="entry-button" onClick={beginEntry}>Enter the Facility <span aria-hidden="true">›</span></button> : !entered ? <button className="entry-button" onClick={skipEntry}>Skip entry sequence</button> : null}
        </div>
      </div>

      <div className="access-deck">
        <nav className="access-paths" aria-label="Access paths">
          <span className="access-heading">ACCESS PATHS</span>
          <div><Link href="/work">Browse Work</Link><Link href="/contact">Contact</Link></div>
        </nav>
      <Link className="featured-project" href="/work/xondry" aria-label="Featured project: Xondry, public website">
          <span className="featured-art" aria-hidden="true"><Image src="/blacksite/art/xondry-exhibit.webp" alt="" fill sizes="110px" unoptimized /></span>
          <span className="featured-copy"><span>FEATURED PROJECT: <strong>XONDRY</strong></span><small>A home for AI creatives to showcase what they build, discover projects, connect, and gain recognition.</small></span>
          <span className="featured-status">PUBLIC WEBSITE</span><span className="featured-arrow" aria-hidden="true">›</span>
        </Link>
      </div>

      {selected && state.phase === "revealed" && overviewImage && <aside id="project-reveal" className={`reveal-panel reveal-panel-${revealPanelSide} is-ready`} role="dialog" aria-modal="false" aria-labelledby="project-reveal-title" style={{ "--accent": selected.accent } as React.CSSProperties}>
        <button className="close" onClick={close} aria-label={`Close ${selected.name} project panel`}>×</button>
        <div className={`project-overview-visual ${selectedHasLiveSite ? "is-live-site" : "is-concept-visual"}`}>
          <Image className="project-overview-image" src={overviewImage} alt={overviewImageAlt ?? "Project visual"} fill sizes="(min-width: 1101px) 220px, 40vw" unoptimized draggable={false}/>
          <span className="project-overview-visual-label">{selectedHasLiveSite ? "WEBSITE CAPTURE // NOV 2026" : "PRODUCT // CONCEPT VISUAL"}</span>
          {selected?.external && <a className="project-overview-live-link" href={selected.external.href} target="_blank" rel="noreferrer">Open live site <span aria-hidden="true">↗</span></a>}
        </div>
        <div className="project-overview-copy">
          <span className="phase-label">FACILITY JV-01 // PROJECT OVERVIEW</span>
          <span className="status">{selected.status}</span>
          <h2 id="project-reveal-title">{selected.name}</h2>
          <span className="project-overview-category">{selected.category}</span>
          <p>{selected.summary}</p>
          <div className="project-overview-role"><span>PRODUCT ROLE</span><p>{selected.role}</p></div>
          <div className="project-overview-focus"><span>PRODUCT FOCUS</span><ul>{selected.decisions.slice(0, 2).map((decision) => <li key={decision}>{decision}</li>)}</ul></div>
          <div className="panel-actions"><Link className="primary button" href={`/work/${selected.id}`}>Read case study</Link><button onClick={close}>Return to corridor</button></div>
        </div>
      </aside>}
      <p className="sr-only" aria-live="polite">{selected ? `${selected.name}: ${state.phase}` : "No chamber selected"}</p>
    </div>
  </section>;
}
