export const BLACKSITE_ARTBOARD = { width: 1672, height: 941 } as const;

export type StageTransform = {
  scale: number;
  offsetX: number;
  offsetY: number;
  width: number;
  height: number;
};

/** A single cover transform maps every image layer, anchor, and control from the source artboard. */
export function computeStageTransform(viewportWidth: number, viewportHeight: number): StageTransform {
  const width = Math.max(0, viewportWidth);
  const height = Math.max(0, viewportHeight);
  const scale = width === 0 || height === 0
    ? 0
    : Math.max(width / BLACKSITE_ARTBOARD.width, height / BLACKSITE_ARTBOARD.height);
  const scaledWidth = BLACKSITE_ARTBOARD.width * scale;
  const scaledHeight = BLACKSITE_ARTBOARD.height * scale;
  return {
    scale,
    width: scaledWidth,
    height: scaledHeight,
    offsetX: (width - scaledWidth) / 2,
    offsetY: (height - scaledHeight) / 2,
  };
}

export function mapArtboardPoint(x: number, y: number, transform: StageTransform) {
  return { x: x * transform.scale + transform.offsetX, y: y * transform.scale + transform.offsetY };
}
