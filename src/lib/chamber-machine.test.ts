import { describe, expect, it } from "vitest";
import { chamberReducer, initialChamberState } from "./chamber-machine";

describe("chamber state machine", () => {
  it("follows the ordered reveal and closes back to sealed", () => {
    let state = chamberReducer(initialChamberState, { type: "SELECT", id: "xondry" });
    expect(state.phase).toBe("unlocking");
    state = chamberReducer(state, { type: "VENT_DONE" });
    expect(state.phase).toBe("unlocking");
    state = chamberReducer(state, { type: "BOLTS_DONE" });
    expect(state.phase).toBe("depressurizing");
    state = chamberReducer(state, { type: "VENT_DONE" });
    expect(state.phase).toBe("opening");
    state = chamberReducer(state, { type: "DOOR_DONE" });
    expect(state.phase).toBe("dissipating");
    state = chamberReducer(state, { type: "DISSIPATE_DONE" });
    expect(state.phase).toBe("revealed");
    state = chamberReducer(state, { type: "CLOSE" });
    expect(state.phase).toBe("closing");
    state = chamberReducer(state, { type: "CLOSED" });
    expect(state).toMatchObject({ id: null, phase: "sealed" });
  });

  it("allows only one active product and ignores stale transition completions", () => {
    const first = chamberReducer(initialChamberState, { type: "SELECT", id: "xondry" });
    const second = chamberReducer(first, { type: "SELECT", id: "raeyl" });
    expect(second).toMatchObject({ id: "raeyl", phase: "unlocking" });
    expect(chamberReducer(second, { type: "DOOR_DONE" })).toEqual(second);
  });

  it("skip reveals immediately; cancel invalidates current effects", () => {
    const selected = chamberReducer(initialChamberState, { type: "SELECT", id: "atomlang-evolved-sdk" });
    const revealed = chamberReducer(selected, { type: "SKIP" });
    expect(revealed.phase).toBe("revealed");
    const cancelled = chamberReducer(revealed, { type: "CANCEL" });
    expect(cancelled).toMatchObject({ id: null, phase: "sealed" });
    expect(cancelled.token).toBeGreaterThan(revealed.token);
  });
});
