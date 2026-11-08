import sharp from "sharp";
import { mkdir, writeFile } from "node:fs/promises";
import { resolve } from "node:path";

const root = resolve("public/blacksite");
const source = resolve(root, "source");
const art = resolve(root, "art");
await mkdir(art, { recursive: true });

const chambers = [
  { id: "xondry", source: "xondry_source.png", insert: { left: 28, top: 172, width: 245, height: 250 }, aperture: { x: 18, y: 452, width: 250, height: 192, polygon: [[0, 5], [100, 0], [97, 100], [4, 100]] }, shutter: { left: 34, top: 472, width: 226, height: 155 }, openingPolygon: [[6, 0], [94, 0], [100, 9], [100, 91], [95, 100], [5, 100], [0, 91], [0, 9]], surfacePolygon: [[8, 20], [92, 20], [100, 28], [100, 79], [94, 91], [83, 98], [17, 98], [6, 91], [0, 79], [0, 28]], smokeFlowAngle: -58 },
  { id: "squadamp", source: "squadamp_source.png", insert: { left: 20, top: 153, width: 218, height: 174 }, aperture: { x: 310, y: 493, width: 181, height: 145, polygon: [[0, 2], [100, 0], [95, 100], [3, 100]] }, shutter: { left: 329, top: 505, width: 143, height: 127 }, openingPolygon: [[10, 0], [90, 0], [100, 14], [100, 89], [92, 100], [8, 100], [0, 89], [0, 14]], surfacePolygon: [[8, 16], [92, 16], [100, 24], [100, 82], [94, 93], [88, 100], [5, 100], [0, 91], [0, 25]], smokeFlowAngle: -66 },
  { id: "atomlang-evolved-sdk", source: "atomlang_source.png", insert: { left: 15, top: 185, width: 205, height: 132 }, aperture: { x: 508, y: 493, width: 170, height: 147, polygon: [[2, 0], [98, 1], [100, 100], [4, 100]] }, shutter: { left: 519, top: 507, width: 146, height: 124 }, openingPolygon: [[5, 0], [95, 0], [100, 8], [100, 93], [95, 100], [5, 100], [0, 93], [0, 8]], surfacePolygon: [[4, 4], [96, 4], [100, 11], [100, 87], [94, 96], [6, 96], [0, 88], [0, 12]], smokeFlowAngle: -78 },
  { id: "raeyl", source: "raeyl_source.png", insert: { left: 21, top: 168, width: 205, height: 153 }, aperture: { x: 1007, y: 491, width: 173, height: 146, polygon: [[2, 0], [98, 0], [100, 100], [4, 100]] }, shutter: { left: 1012, top: 507, width: 145, height: 124 }, openingPolygon: [[5, 0], [95, 0], [100, 9], [100, 93], [95, 100], [5, 100], [0, 93], [0, 9]], surfacePolygon: [[7, 8], [93, 8], [100, 16], [100, 84], [94, 95], [6, 95], [0, 84], [0, 16]], smokeFlowAngle: -102 },
  { id: "realball26", source: "realball26_source.png", insert: { left: 18, top: 171, width: 222, height: 180 }, aperture: { x: 1215, y: 484, width: 181, height: 154, polygon: [[1, 2], [98, 0], [100, 100], [5, 100]] }, shutter: { left: 1227, top: 500, width: 150, height: 132 }, openingPolygon: [[7, 0], [93, 0], [100, 11], [100, 90], [93, 100], [7, 100], [0, 90], [0, 11]], surfacePolygon: [[4, 4], [96, 4], [100, 12], [100, 88], [94, 96], [6, 96], [0, 88], [0, 12]], smokeFlowAngle: -120 },
  { id: "classified", source: "classified_source.png", insert: { left: 20, top: 213, width: 242, height: 215 }, aperture: { x: 1443, y: 449, width: 216, height: 194, polygon: [[3, 0], [100, 1], [98, 100], [3, 100]] }, shutter: { left: 1458, top: 462, width: 197, height: 166 }, openingPolygon: [[5, 0], [95, 0], [100, 12], [100, 91], [94, 100], [6, 100], [0, 91], [0, 12]], surfacePolygon: [[12, 12], [88, 12], [98, 21], [98, 83], [90, 96], [10, 96], [2, 84], [2, 21]], smokeFlowAngle: -136 },
];

const backgroundLights = [
  { id: "vault-beacon", x: 808, y: 48, width: 58, height: 54, color: "#52efff", mode: "pulse", delay: "0s" },
  { id: "arch-warning-left", x: 482, y: 165, width: 54, height: 55, color: "#ff354e", mode: "flash", delay: ".2s" },
  { id: "arch-warning-right", x: 1135, y: 165, width: 54, height: 55, color: "#ff354e", mode: "flash", delay: "1.7s" },
  { id: "outer-cyan-left", x: 105, y: 252, width: 78, height: 44, color: "#38e6ff", mode: "pulse", delay: ".7s" },
  { id: "outer-cyan-right", x: 1488, y: 252, width: 78, height: 44, color: "#38e6ff", mode: "pulse", delay: "2.1s" },
  { id: "inner-cyan-left", x: 330, y: 326, width: 75, height: 42, color: "#36e5ff", mode: "flicker", delay: "1.2s" },
  { id: "inner-cyan-right", x: 1268, y: 326, width: 75, height: 42, color: "#36e5ff", mode: "flicker", delay: ".4s" },
  { id: "amber-beacon-left", x: 273, y: 352, width: 50, height: 66, color: "#ff9c42", mode: "flash", delay: "1s" },
  { id: "amber-beacon-right", x: 1349, y: 352, width: 50, height: 66, color: "#ff9c42", mode: "flash", delay: "2.4s" },
  { id: "inner-amber-left", x: 481, y: 408, width: 44, height: 53, color: "#ff963e", mode: "pulse", delay: "1.8s" },
  { id: "inner-amber-right", x: 1147, y: 408, width: 44, height: 53, color: "#ff963e", mode: "pulse", delay: ".5s" },
  { id: "violet-bay-left", x: 12, y: 300, width: 48, height: 42, color: "#d174ff", mode: "flicker", delay: ".9s" },
  { id: "violet-bay-right", x: 1612, y: 300, width: 48, height: 42, color: "#d174ff", mode: "flicker", delay: "2.2s" },
  { id: "walkway-left-0", x: 422, y: 746, width: 69, height: 37, color: "#ff3b4f", mode: "sequence", sequenceDelay: "0s" },
  { id: "walkway-right-0", x: 1181, y: 746, width: 69, height: 37, color: "#ff3b4f", mode: "sequence", sequenceDelay: "0s" },
  { id: "walkway-left-1", x: 565, y: 702, width: 44, height: 26, color: "#ff3b4f", mode: "sequence", sequenceDelay: ".45s" },
  { id: "walkway-right-1", x: 1063, y: 702, width: 44, height: 26, color: "#ff3b4f", mode: "sequence", sequenceDelay: ".45s" },
  { id: "walkway-left-2", x: 648, y: 679, width: 25, height: 17, color: "#ff3b4f", mode: "sequence", sequenceDelay: ".9s" },
  { id: "walkway-right-2", x: 999, y: 679, width: 25, height: 17, color: "#ff3b4f", mode: "sequence", sequenceDelay: ".9s" },
  { id: "walkway-left-3", x: 694, y: 626, width: 23, height: 29, color: "#ff3b4f", mode: "sequence", sequenceDelay: "1.35s" },
  { id: "walkway-right-3", x: 964, y: 626, width: 26, height: 29, color: "#ff3b4f", mode: "sequence", sequenceDelay: "1.35s" },
];

function smokeVents(shutter, corridorAngle) {
  const { left, top, width, height } = shutter;
  const centerX = left + width / 2;
  const makeVent = (id, x, y, widthScale, heightScale, angle, delay, opacity, loopDelay, duration) => ({
    id,
    x: Math.round(x),
    y: Math.round(y),
    width: Math.round(width * widthScale),
    height: Math.round(height * heightScale),
    angle,
    delay,
    opacity,
    loopDelay,
    duration,
  });
  return [
    makeVent("top-left", left + width * 0.27, top + 2, 0.43, 0.38, corridorAngle + 10, ".06s", 0.45, "-.45s", "2.7s"),
    makeVent("top-center", centerX, top, 0.55, 0.46, corridorAngle, "0s", 0.62, "-1.15s", "3.2s"),
    makeVent("top-right", left + width * 0.73, top + 2, 0.43, 0.38, corridorAngle - 10, ".1s", 0.45, "-.8s", "2.5s"),
    makeVent("side-left", left + 1, top + height * 0.45, 0.42, 0.32, -148, ".16s", 0.4, "-1.5s", "3.5s"),
    makeVent("side-right", left + width - 1, top + height * 0.45, 0.42, 0.32, -32, ".21s", 0.4, "-.25s", "3.8s"),
    makeVent("threshold", centerX, top + height - 1, 0.47, 0.42, corridorAngle - 3, ".28s", 0.42, "-.95s", "3.1s"),
  ];
}

function apertureFeatherMask(width, height, polygon, featherX, featherY) {
  const points = polygon.map(([x, y]) => [x * width / 100, y * height / 100]);
  const mask = Buffer.alloc(width * height * 4, 255);
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const px = x + 0.5;
      const py = y + 0.5;
      let inside = false;
      let normalizedEdgeDistance = Number.POSITIVE_INFINITY;
      for (let index = 0; index < points.length; index++) {
        const [ax, ay] = points[index];
        const [bx, by] = points[(index + 1) % points.length];
        const dx = bx - ax;
        const dy = by - ay;
        const length = Math.hypot(dx, dy);
        const lengthSquared = length * length;
        const projection = Math.max(0, Math.min(1, ((px - ax) * dx + (py - ay) * dy) / lengthSquared));
        const edgeDistance = Math.hypot(px - ax - projection * dx, py - ay - projection * dy);
        const edgeFeather = featherX * Math.abs(dy) / length + featherY * Math.abs(dx) / length;
        normalizedEdgeDistance = Math.min(normalizedEdgeDistance, edgeDistance / edgeFeather);
        if ((ay > py) !== (by > py) && px < ((bx - ax) * (py - ay)) / (by - ay) + ax) inside = !inside;
      }
      const progress = inside ? Math.max(0, Math.min(1, normalizedEdgeDistance)) : 0;
      const smooth = progress * progress * (3 - 2 * progress);
      mask[(y * width + x) * 4 + 3] = Math.round(smooth * 255);
    }
  }
  return mask;
}

function smoothstep(edge0, edge1, value) {
  const progress = Math.max(0, Math.min(1, (value - edge0) / (edge1 - edge0)));
  return progress * progress * (3 - 2 * progress);
}

function emissivePass(rgb, apertureMask, width, height) {
  const output = Buffer.alloc(width * height * 4);
  for (let pixel = 0; pixel < width * height; pixel++) {
    const sourceOffset = pixel * 3;
    const outputOffset = pixel * 4;
    const red = rgb[sourceOffset];
    const green = rgb[sourceOffset + 1];
    const blue = rgb[sourceOffset + 2];
    const brightest = Math.max(red, green, blue);
    const darkest = Math.min(red, green, blue);
    const luminance = red * 0.2126 + green * 0.7152 + blue * 0.0722;
    const saturation = brightest === 0 ? 0 : (brightest - darkest) / brightest;
    const emission = smoothstep(126, 238, luminance) * (0.58 + 0.42 * Math.min(1, saturation * 1.8));
    output[outputOffset] = Math.min(255, Math.round(red * 1.24));
    output[outputOffset + 1] = Math.min(255, Math.round(green * 1.24));
    output[outputOffset + 2] = Math.min(255, Math.round(blue * 1.24));
    output[outputOffset + 3] = Math.round(emission * apertureMask[pixel * 4 + 3]);
  }
  return output;
}

function environmentEmissivePass(rgb, luminance, localLuminance, width, height) {
  const output = Buffer.alloc(width * height * 4);
  for (let pixel = 0; pixel < width * height; pixel++) {
    const sourceOffset = pixel * 3;
    const outputOffset = pixel * 4;
    const red = rgb[sourceOffset];
    const green = rgb[sourceOffset + 1];
    const blue = rgb[sourceOffset + 2];
    const brightest = Math.max(red, green, blue);
    const darkest = Math.min(red, green, blue);
    const saturation = brightest === 0 ? 0 : (brightest - darkest) / brightest;
    const localContrast = Math.max(0, luminance[pixel] - localLuminance[pixel]);
    const highlight = smoothstep(35, 110, localContrast) * smoothstep(52, 120, luminance[pixel]);
    const emission = highlight * (0.55 + 0.45 * saturation);
    output[outputOffset] = Math.min(255, Math.round(red * 1.3));
    output[outputOffset + 1] = Math.min(255, Math.round(green * 1.3));
    output[outputOffset + 2] = Math.min(255, Math.round(blue * 1.3));
    output[outputOffset + 3] = Math.round(emission * 255);
  }
  return output;
}

const environmentPath = resolve(source, "environment_plate_smokefree.png");
const environmentWidth = 1672;
const environmentHeight = 941;
const environmentRaw = await sharp(environmentPath)
  .resize(environmentWidth, environmentHeight, { fit: "fill" })
  .removeAlpha().raw().toBuffer();
const [environmentLuminance, environmentLocalLuminance] = await Promise.all([
  sharp(environmentPath).resize(environmentWidth, environmentHeight, { fit: "fill" }).greyscale().raw().toBuffer(),
  sharp(environmentPath).resize(environmentWidth, environmentHeight, { fit: "fill" }).greyscale().blur(11).raw().toBuffer(),
]);
const environmentEmission = environmentEmissivePass(environmentRaw, environmentLuminance, environmentLocalLuminance, environmentWidth, environmentHeight);
await sharp(environmentPath)
  .resize(environmentWidth, environmentHeight, { fit: "fill" }).webp({ quality: 89, effort: 6 })
  .toFile(resolve(art, "environment-plate.webp"));
await sharp(environmentEmission, { raw: { width: environmentWidth, height: environmentHeight, channels: 4 } })
  .webp({ lossless: true, effort: 6 }).toFile(resolve(art, "environment-emissive.webp"));
for (const light of backgroundLights) {
  const emitter = await sharp(environmentEmission, { raw: { width: environmentWidth, height: environmentHeight, channels: 4 } })
    .extract({ left: light.x, top: light.y, width: light.width, height: light.height })
    .raw().toBuffer();
  if (light.mode === "sequence") {
    for (let pixel = 0; pixel < emitter.length; pixel += 4) {
      const alpha = emitter[pixel + 3];
      emitter[pixel] = 255;
      emitter[pixel + 1] = 30 + Math.round(alpha * 0.12);
      emitter[pixel + 2] = 42 + Math.round(alpha * 0.12);
      emitter[pixel + 3] = Math.min(255, Math.round(alpha * 1.28));
    }
  }
  await sharp(emitter, { raw: { width: light.width, height: light.height, channels: 4 } })
    .webp({ lossless: true, effort: 6 })
    .toFile(resolve(art, `background-light-${light.id}.webp`));
}
await sharp(resolve(source, "closed_doors_plate.png"))
  .resize(1672, 941, { fit: "fill" }).webp({ quality: 91, effort: 6 })
  .toFile(resolve(art, "closed-doors-reference.webp"));
await sharp(resolve(source, "steam-plume-generated.png"))
  .resize(960, 640, { fit: "inside" }).webp({ quality: 88, alphaQuality: 95, effort: 6 })
  .toFile(resolve(art, "steam-plume.webp"));

for (const chamber of chambers) {
  const exhibitWidth = 640;
  const exhibitHeight = Math.round(exhibitWidth * chamber.aperture.height / chamber.aperture.width);
  // Keep the insert behind the real doorway lip. A short mask feather prevents
  // antialias seams; the foreground frame supplies the architecture and occlusion.
  const opening = { left: chamber.shutter.left, top: chamber.shutter.top, width: chamber.shutter.width, height: chamber.shutter.height, polygon: chamber.openingPolygon };
  const openingInAperture = opening.polygon.map(([x, y]) => [
    ((opening.left + opening.width * x / 100 - chamber.aperture.x) / chamber.aperture.width) * 100,
    ((opening.top + opening.height * y / 100 - chamber.aperture.y) / chamber.aperture.height) * 100,
  ]);
  const edgeFeatherX = Math.max(1, Math.round(exhibitWidth * 4 / chamber.aperture.width));
  const edgeFeatherY = Math.max(1, Math.round(exhibitHeight * 4 / chamber.aperture.height));
  const apertureMask = apertureFeatherMask(exhibitWidth, exhibitHeight, openingInAperture, edgeFeatherX, edgeFeatherY);
  const sourceSurfaceMask = apertureFeatherMask(exhibitWidth, exhibitHeight, chamber.surfacePolygon, edgeFeatherX, edgeFeatherY);
  const exhibitMask = Buffer.from(apertureMask);
  for (let offset = 3; offset < exhibitMask.length; offset += 4) {
    exhibitMask[offset] = Math.round(apertureMask[offset] * sourceSurfaceMask[offset] / 255);
  }
  const resizedArtwork = sharp(resolve(source, "chambers", chamber.source))
    .extract(chamber.insert).resize(exhibitWidth, exhibitHeight, { fit: "cover", position: "centre" });
  const exhibitRgb = await resizedArtwork.clone().removeAlpha().raw().toBuffer();
  await resizedArtwork.clone().ensureAlpha()
    .composite([{ input: exhibitMask, raw: { width: exhibitWidth, height: exhibitHeight, channels: 4 }, blend: "dest-in" }])
    .webp({ quality: 94, alphaQuality: 100, effort: 6 }).toFile(resolve(art, `${chamber.id}-exhibit.webp`));
  await sharp(emissivePass(exhibitRgb, exhibitMask, exhibitWidth, exhibitHeight), {
    raw: { width: exhibitWidth, height: exhibitHeight, channels: 4 },
  }).webp({ quality: 96, alphaQuality: 100, effort: 6 })
    .toFile(resolve(art, `${chamber.id}-emissive.webp`));

  const { aperture } = chamber;
  const padX = Math.max(10, Math.round(aperture.width * 0.055));
  const padY = Math.max(9, Math.round(aperture.height * 0.05));
  const frame = { left: aperture.x - padX, top: aperture.y - padY, width: aperture.width + padX * 2, height: aperture.height + padY * 2 };
  const center = { x: opening.left + opening.width / 2, y: opening.top + opening.height / 2 };
  const frameLipInset = 1.5;
  const shrink = 1 - frameLipInset / (Math.min(opening.width, opening.height) / 2);
  const frameHole = opening.polygon.map(([px, py]) => {
    const x = center.x + (opening.left + opening.width * px / 100 - center.x) * shrink - frame.left;
    const y = center.y + (opening.top + opening.height * py / 100 - center.y) * shrink - frame.top;
    return `${x.toFixed(2)},${y.toFixed(2)}`;
  }).join(" ");
  const frameMask = Buffer.from(`<svg width="${frame.width}" height="${frame.height}" viewBox="0 0 ${frame.width} ${frame.height}"><defs><mask id="opening"><rect width="100%" height="100%" fill="white"/><polygon points="${frameHole}" fill="black"/></mask></defs><rect width="100%" height="100%" fill="white" mask="url(#opening)"/></svg>`);
  await sharp(resolve(art, "environment-plate.webp"))
    .extract(frame)
    .composite([{ input: frameMask, blend: "dest-in" }])
    .webp({ lossless: true, effort: 6 })
    .toFile(resolve(art, `${chamber.id}-frame-occluder.webp`));

  const { left, top, width, height } = chamber.shutter;
  const leafWidth = Math.ceil(width / 2);
  for (const side of ["left", "right"]) {
    const isLeft = side === "left";
    const x = left + (isLeft ? 0 : width - leafWidth);
    const w = leafWidth;
    const inset = Math.max(2, Math.round(width * 0.018));
    const seam = isLeft ? w : 0;
    const edge = isLeft ? 0 : w;
    const mask = Buffer.from(`<svg width="${w}" height="${height}" viewBox="0 0 ${w} ${height}"><path fill="white" d="M ${isLeft ? 0 : inset} 0 L ${isLeft ? w : w} 0 L ${isLeft ? w : w} ${height} L ${isLeft ? 0 : inset} ${height} Z"/><path fill="white" d="M ${isLeft ? 0 : inset} 0 L ${isLeft ? w : seam} 0 L ${isLeft ? w : seam} ${height} L ${isLeft ? 0 : inset} ${height} Z"/></svg>`);
    await sharp(resolve(source, "closed_doors_plate.png"))
      .extract({ left: x, top, width: w, height })
      .composite([{ input: mask, blend: "dest-in" }])
      .webp({ quality: 93, effort: 6, alphaQuality: 100 })
      .toFile(resolve(art, `${chamber.id}-shutter-${side}.webp`));
    void edge;
  }
}

const manifest = {
  version: 2,
  coordinateSpace: { width: 1672, height: 941, fit: "cover", origin: "top-left" },
  source: "/blacksite/source/reference_original.png",
  environmentPlate: "/blacksite/art/environment-plate.webp",
  closedDoorSource: "/blacksite/art/closed-doors-reference.webp",
  effects: {
    steamPlume: "/blacksite/art/steam-plume.webp",
    steamLoop: "/blacksite/art/steam-loop.webp",
    environmentEmissive: "/blacksite/art/environment-emissive.webp",
  },
  backgroundLights: backgroundLights.map((light) => ({
    ...light,
    asset: `/blacksite/art/background-light-${light.id}.webp`,
  })),
  note: "Coordinates map to the 1672x941 artboard; all visual layers use one cover transform. The inner artwork and animated shutters share a shaped doorway mask; an alpha-cut foreground frame restores the original structural supports over both. Smoke uses six independently sized, angled and staggered emitters at the shutter top seal, side gaps, and threshold, using a transparent animated WebP.",
  chambers: chambers.map(({ id, aperture, shutter, openingPolygon, smokeFlowAngle }) => {
    const padX = Math.max(10, Math.round(aperture.width * 0.055));
    const padY = Math.max(9, Math.round(aperture.height * 0.05));
    return {
    id,
    aperture,
    opening: { left: shutter.left, top: shutter.top, width: shutter.width, height: shutter.height, polygon: openingPolygon },
    frame: {
      left: aperture.x - padX,
      top: aperture.y - padY,
      width: aperture.width + padX * 2,
      height: aperture.height + padY * 2,
      asset: `/blacksite/art/${id}-frame-occluder.webp`,
    },
    shutter: {
      ...shutter,
      leftAsset: `/blacksite/art/${id}-shutter-left.webp`,
      rightAsset: `/blacksite/art/${id}-shutter-right.webp`,
    },
    exhibit: `/blacksite/art/${id}-exhibit.webp`,
    emissive: `/blacksite/art/${id}-emissive.webp`,
    ventAnchor: { x: aperture.x + aperture.width / 2, y: aperture.y + 6 },
    smokeFlowAngle,
    vents: smokeVents(shutter, smokeFlowAngle),
    };
  }),
};
await writeFile(resolve(root, "manifest.json"), `${JSON.stringify(manifest, null, 2)}\n`);
process.stdout.write(`Prepared ${chambers.length} chamber inserts, ${chambers.length} frame occluders, ${chambers.length * 2} shutter leaves, ${backgroundLights.length} background light emitters, steam, and scene plates in ${art}\n`);
