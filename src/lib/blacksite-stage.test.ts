import { describe, expect, it } from "vitest";
import { BLACKSITE_ARTBOARD, computeStageTransform, mapArtboardPoint } from "./blacksite-stage";

describe("black site artboard mapping", () => {
  it("maps the full approved frame without offsets at the reference viewport", () => {
    const transform = computeStageTransform(1672, 941);
    expect(transform).toMatchObject({ scale: 1, offsetX: 0, offsetY: 0, width: 1672, height: 941 });
    expect(mapArtboardPoint(836, 470.5, transform)).toEqual({ x: 836, y: 470.5 });
  });

  it.each([[1440, 900], [1920, 1080], [390, 844], [360, 800]])(
    "uses one centered cover transform for all overlays at %ix%i",
    (width, height) => {
      const transform = computeStageTransform(width, height);
      expect(transform.scale).toBe(Math.max(width / BLACKSITE_ARTBOARD.width, height / BLACKSITE_ARTBOARD.height));
      expect(transform.width).toBeCloseTo(BLACKSITE_ARTBOARD.width * transform.scale);
      expect(transform.height).toBeCloseTo(BLACKSITE_ARTBOARD.height * transform.scale);
      expect(transform.offsetX + transform.width / 2).toBeCloseTo(width / 2);
      expect(transform.offsetY + transform.height / 2).toBeCloseTo(height / 2);
      const mapped = mapArtboardPoint(1000, 500, transform);
      expect(mapped.x).toBeCloseTo(1000 * transform.scale + transform.offsetX);
      expect(mapped.y).toBeCloseTo(500 * transform.scale + transform.offsetY);
    },
  );

  it("returns a safe empty transform before layout is measured", () => {
    expect(computeStageTransform(0, 0)).toMatchObject({ scale: 0, offsetX: 0, offsetY: 0, width: 0, height: 0 });
  });
});
