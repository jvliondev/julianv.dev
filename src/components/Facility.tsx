"use client";

import Image from "next/image";
import Link from "next/link";
import { useCallback, useEffect, useMemo, useReducer, useRef, useState, useSyncExternalStore } from "react";
import { chamberReducer, initialChamberState } from "@/lib/chamber-machine";
import { chamberProjects, projects } from "@/data/projects";
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
  const overviewHeadingRef = useRef<HTMLHeadingElement | null>(null);
  const sceneHeadingRef = useRef<HTMLHeadingElement | null>(null);
  const initialSelectionTimer = useRef<number | null>(null);
  const stateRef = useRef(state);
  const selected = useMemo(() => chamberProjects.find((project) => project.id === state.id), [state.id]);
  const featuredProject = projects.find((project) => project.id === "xondry");
  const revealPanelSide = selected && ["raeyl", "realball26", "classified"].includes(selected.id) ? "left" : "right";
  const selectedHasLiveSite = Boolean(selected?.external);
  const overviewImage = selected?.snapshot?.src ?? selected?.artwork;
  const overviewImageAlt = selected?.snapshot?.alt ?? selected?.artworkAlt;
  const overviewImageKind = selected?.snapshot ? `is-${selected.snapshot.kind}` : "is-concept-visual";

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
    if (initialHash && chamberProjects.some((project) => project.id === initialHash)) {
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
    if (state.phase === "revealed") overviewHeadingRef.current?.focus();
  }, [selected?.id, state.phase]);
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
      if (id && chamberProjects.some((project) => project.id === id)) dispatch({ type: "SELECT", id });
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
      if (lastTrigger.current) lastTrigger.current.focus();
      else sceneHeadingRef.current?.focus();
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
        <h1 ref={sceneHeadingRef} tabIndex={-1}>WELCOME TO<br/>THE BLACK SITE</h1>
        <p>Where ambitious ideas become engineered realities.</p>
        {!selected && <p className="scene-help">Choose a chamber to open its project overview, or browse all work.</p>}
        <div className="hero-actions">
          {entryPhase === "locked" ? <button className="entry-button" onClick={beginEntry}>Enter the Facility <span aria-hidden="true">›</span></button> : !entered ? <button className="entry-button" onClick={skipEntry}>Skip entry sequence</button> : null}
        </div>
      </div>

      {!selected && <div className="access-deck">
        <nav className="access-paths" aria-label="Access paths">
          <span className="access-heading">ACCESS PATHS</span>
          <div><Link href="/work">Browse Work</Link><Link href="/contact">Contact</Link></div>
        </nav>
      <Link className="featured-project" href="/work/xondry" aria-label={`Featured project: ${featuredProject?.name}, ${featuredProject?.status.toLowerCase()}`}>
          <span className="featured-art" aria-hidden="true"><Image src={featuredProject?.snapshot?.src ?? "/blacksite/art/xondry-exhibit.webp"} alt="" fill sizes="110px" unoptimized /></span>
          <span className="featured-copy"><span>FEATURED PROJECT: <strong>XONDRY</strong></span><small>{featuredProject?.summary}</small></span>
          <span className="featured-status">{featuredProject?.status}</span><span className="featured-arrow" aria-hidden="true">›</span>
        </Link>
      </div>}

      {selected && state.phase === "revealed" && overviewImage && <aside id="project-reveal" className={`reveal-panel reveal-panel-${revealPanelSide} is-ready`} role="dialog" aria-modal="false" aria-labelledby="project-reveal-title" aria-describedby="project-reveal-summary" style={{ "--accent": selected.accent } as React.CSSProperties}>
        <button className="close" onClick={close} aria-label={`Close ${selected.name} project panel`}>×</button>
        <div className={`project-overview-visual ${overviewImageKind} ${selectedHasLiveSite ? "is-live-site" : ""}`}>
          <Image className="project-overview-image" src={overviewImage} alt={overviewImageAlt ?? "Project visual"} fill sizes="(min-width: 1101px) 460px, (min-width: 761px) 40vw, 100vw" unoptimized draggable={false}/>
          <span className="project-overview-visual-label">{selected?.snapshot?.label ?? "PRODUCT // CONCEPT VISUAL"}</span>
        </div>
        <div className="project-overview-copy">
          <span className="phase-label">FACILITY JV-01 // PROJECT OVERVIEW</span>
          <span className="status">{selected.status}</span>
          <h2 id="project-reveal-title" ref={overviewHeadingRef} tabIndex={-1}>{selected.name}</h2>
          <span className="project-overview-category">{selected.category}</span>
          <p id="project-reveal-summary">{selected.summary}</p>
          <div className="project-overview-audience"><span>BUILT FOR</span><p>{selected.audience}</p></div>
          <div className="project-overview-role"><span>PRODUCT ROLE</span><p>{selected.role}</p></div>
          <div className="project-overview-focus"><span>DESIGN FOCUS</span><ul>{selected.decisions.slice(0, 2).map((decision) => <li key={decision}>{decision}</li>)}</ul></div>
          <div className="panel-actions">
            <Link className="primary button" href={`/work/${selected.id}`}>Read full case study</Link>
            {selected.external && <a className="button" href={selected.external.href} target="_blank" rel="noreferrer" aria-label="Visit live project (opens in a new tab)">Visit live project <span aria-hidden="true">↗</span></a>}
            <button onClick={close}>Return to chambers</button>
          </div>
        </div>
      </aside>}
      <p className="sr-only" aria-live="polite">{selected ? `${selected.name}: ${state.phase}` : "No chamber selected"}</p>
    </div>
  </section>;
}
