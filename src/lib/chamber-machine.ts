export type ChamberPhase = "sealed" | "unlocking" | "depressurizing" | "opening" | "dissipating" | "revealed" | "closing" | "error";
export type ChamberState = { id: string | null; phase: ChamberPhase; token: number };
export type ChamberEvent =
  | { type: "SELECT"; id: string } | { type: "BOLTS_DONE" } | { type: "VENT_DONE" }
  | { type: "DOOR_DONE" } | { type: "DISSIPATE_DONE" } | { type: "CLOSE" } | { type: "CLOSED" }
  | { type: "SKIP" } | { type: "CANCEL" } | { type: "ERROR" };

export const initialChamberState: ChamberState = { id: null, phase: "sealed", token: 0 };
export function chamberReducer(state: ChamberState, event: ChamberEvent): ChamberState {
  if (event.type === "CANCEL") return { ...initialChamberState, token: state.token + 1 };
  if (event.type === "ERROR") return { ...state, phase: "error" };
  if (event.type === "SELECT") {
    if (state.id === event.id && !["sealed", "error"].includes(state.phase)) return state;
    return { id: event.id, phase: "unlocking", token: state.token + 1 };
  }
  if (event.type === "SKIP" && state.id) return { ...state, phase: "revealed", token: state.token + 1 };
  if (event.type === "CLOSE" && state.id) return { ...state, phase: "closing", token: state.token + 1 };
  if (event.type === "CLOSED" && state.phase === "closing") return { ...initialChamberState, token: state.token + 1 };
  if (event.type === "BOLTS_DONE" && state.phase === "unlocking") return { ...state, phase: "depressurizing" };
  if (event.type === "VENT_DONE" && state.phase === "depressurizing") return { ...state, phase: "opening" };
  if (event.type === "DOOR_DONE" && state.phase === "opening") return { ...state, phase: "dissipating" };
  if (event.type === "DISSIPATE_DONE" && state.phase === "dissipating") return { ...state, phase: "revealed" };
  return state;
}
