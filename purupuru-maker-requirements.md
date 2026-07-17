# Purupuru Maker-Like Image Wobble Tool Requirements

## 1. Project Goal

Build a browser-based image wobble animation tool inspired by Purupuru Maker-like products.

Users should be able to upload a still image, paint the parts that should move, preview a wobble/bounce animation, tune motion parameters, and export the result as a short animation file.

The implementation must be original. Do not copy competitor source code, UI copy, visual design, brand assets, or product name. Competitor products may only be used as functional references.

## 2. Target Users

- Illustrators who want to add simple motion to a static illustration.
- Social media creators who want quick animated stickers, memes, avatars, or fan art.
- Non-technical users who expect the tool to work in the browser without installing software.

## 3. Core Product Scope

### MVP Scope

The first usable version must include:

- Upload one still image.
- Display the image in an editor workspace.
- Paint a motion mask on top of the image.
- Erase painted mask areas.
- Adjust brush size.
- Adjust brush strength.
- Reset the whole mask.
- Preview a real-time wobble animation.
- Adjust wobble strength, speed, spring, and damping.
- Export a WebM animation locally in the browser.
- Show progress while exporting.
- Never upload the user's image to a server.

### Post-MVP Scope

Add after MVP is stable:

- MP4 export.
- GIF export.
- Undo and redo for mask edits.
- Presets such as soft wobble, bouncy, jelly, heartbeat, shake, and swing.
- Mobile touch support.
- Pin/freeze brush to mark areas that should not move.
- Image downscaling for large files.
- Multi-language UI.
- Project save/load using JSON.
- Device motion support on mobile.

## 4. Recommended Tech Stack

Use this stack unless there is a strong reason to choose otherwise:

- Frontend framework: React + TypeScript + Vite.
- Rendering: PixiJS preferred, Three.js acceptable.
- Mask editing: HTML Canvas 2D.
- Animation loop: `requestAnimationFrame`.
- Video export MVP: `HTMLCanvasElement.captureStream()` + `MediaRecorder`.
- Advanced export later: WebCodecs `VideoEncoder` for MP4/WebM and a GIF encoder library for GIF.

### Why PixiJS Is Recommended

PixiJS provides textured mesh rendering with less setup than raw WebGL. The desired effect is a 2D image texture mapped onto a deformable grid, which fits PixiJS well.

Use Three.js only if the team is already more comfortable with Three.js. In Three.js, use a textured `PlaneGeometry` with many segments and update vertex positions each frame.

Avoid pure Canvas 2D for the final renderer. It is possible but harder to make smooth, fast, and visually clean because triangle texture mapping and edge seams become difficult.

## 5. Page Structure

The app should have one primary tool screen, not a marketing-first landing page.

### Desktop Layout

- Top bar:
  - App name.
  - Upload/replace image button.
  - Mode switch: Paint / Preview.
  - Export button.
- Left panel:
  - Brush controls in Paint mode.
  - Motion controls in Preview mode.
- Center workspace:
  - Image canvas/editor.
  - Mask overlay in Paint mode.
  - Animated preview in Preview mode.
- Bottom/status area:
  - Current image size.
  - Export progress.
  - Error messages.

### Mobile Layout

- Top compact toolbar.
- Full-width workspace.
- Bottom sheet or bottom toolbar for controls.
- Large touch-friendly buttons.

## 6. User Flows

### 6.1 Upload Image

1. User clicks upload or drags a file into the workspace.
2. App validates the file.
3. App decodes the image.
4. App optionally downscales large images.
5. App creates:
   - Display image.
   - Render texture.
   - Empty mask.
   - Mesh data.
6. App switches to Paint mode.

Acceptance criteria:

- Accept PNG, JPEG, and WebP still images.
- Reject unsupported file types with a clear message.
- Reject animated images in MVP unless the app explicitly supports them later.
- Reject files larger than the configured max size.
- The uploaded image is not sent to any server.

Recommended limits:

- Max input file size: 30 MB for MVP.
- Max working image dimension: 1600 px on the longest side.
- Max export dimension: default same as working image, capped at 1600 px longest side in MVP.

### 6.2 Paint Motion Area

1. User selects Paint mode.
2. User drags on the image.
3. App paints into a hidden mask canvas.
4. App displays a colored overlay where mask alpha is greater than zero.
5. User can change brush size and strength.
6. User can erase.
7. User can clear the mask.

Acceptance criteria:

- Painting follows the pointer accurately at any zoom level.
- Brush strokes are continuous, not dotted.
- Mask strength accumulates smoothly.
- Eraser reduces or removes mask strength.
- Overlay does not permanently modify the original image.

### 6.3 Preview Wobble

1. User switches to Preview mode.
2. App converts the mask into per-vertex weights.
3. App starts the animation loop.
4. Mesh vertices move based on spring physics.
5. User changes parameters and sees the result immediately.

Acceptance criteria:

- Unpainted areas should barely move or stay still.
- Painted areas should wobble smoothly.
- Motion should remain bounded and not explode.
- Animation should stay above 30 FPS on a normal laptop for images up to 1600 px.

### 6.4 Export Animation

1. User clicks Export.
2. User selects format, duration, FPS, and size.
3. App renders frames locally.
4. App shows progress.
5. App downloads the generated file.

MVP export:

- Format: WebM.
- Duration: 2-5 seconds.
- FPS: 30.

Post-MVP export:

- MP4 using WebCodecs where supported.
- GIF using a GIF encoder.
- Browser capability fallback if a format is unsupported.

Acceptance criteria:

- Exported animation matches the preview closely.
- Export does not freeze the UI for long periods.
- Export progress updates at least once every 500 ms.
- User can cancel export.

## 7. Functional Requirements

### 7.1 Image Loader

Responsibilities:

- Read selected file.
- Validate MIME type and size.
- Decode image.
- Apply EXIF orientation for JPEG when possible.
- Downscale if image is too large.
- Return a normalized `LoadedImage`.

Type:

```ts
type LoadedImage = {
  id: string;
  fileName: string;
  mimeType: string;
  width: number;
  height: number;
  originalWidth: number;
  originalHeight: number;
  bitmap: ImageBitmap | HTMLImageElement;
  objectUrl?: string;
};
```

Implementation notes:

- Prefer `createImageBitmap(file, { imageOrientation: "from-image" })` where supported.
- If downscaling, draw into a temporary canvas and export a new bitmap.
- Revoke object URLs when no longer needed.

### 7.2 Mask Editor

The mask is a grayscale alpha map matching the working image dimensions.

Use a hidden canvas:

```ts
type MotionMask = {
  width: number;
  height: number;
  canvas: HTMLCanvasElement;
  ctx: CanvasRenderingContext2D;
  version: number;
};
```

Mask pixel meaning:

- Alpha or red channel `0`: no motion.
- Alpha or red channel `255`: full motion.
- Values between `1` and `254`: partial motion.

Brush settings:

```ts
type BrushSettings = {
  mode: "paint" | "erase";
  size: number;      // default 48, min 4, max 240
  strength: number;  // default 0.8, min 0.05, max 1
  hardness: number;  // default 0.65, min 0, max 1
};
```

Painting algorithm:

1. Convert pointer screen coordinate to image coordinate.
2. Draw a soft radial brush into the mask canvas.
3. For Paint mode, increase mask strength.
4. For Erase mode, decrease mask strength.
5. Increment `mask.version`.

Simple MVP implementation:

- Use `ctx.globalCompositeOperation = "source-over"` for paint.
- Use `ctx.globalAlpha = strength`.
- Use radial gradient for soft brush.
- Use `destination-out` for erase.

Better implementation:

- Read affected pixels.
- Apply `newValue = max(oldValue, brushValue * strength)` for paint.
- Apply `newValue = oldValue * (1 - brushValue * strength)` for erase.
- This avoids opacity stacking surprises.

### 7.3 Undo/Redo

MVP can skip undo/redo.

Post-MVP implementation:

- Store mask snapshots after each completed stroke.
- Do not snapshot every pointer move.
- Keep last 30 snapshots.
- Each snapshot can be:
  - Full `ImageData` for simplicity.
  - Or compressed dirty rectangles for performance.

Type:

```ts
type MaskHistory = {
  undoStack: ImageData[];
  redoStack: ImageData[];
  maxEntries: number;
};
```

### 7.4 Mesh Generator

Generate a rectangular grid over the image.

Recommended defaults:

- Desktop: 50 columns x 50 rows.
- Mobile: 36 columns x 36 rows.
- Low performance mode: 28 columns x 28 rows.

Type:

```ts
type MeshVertex = {
  baseX: number;
  baseY: number;
  x: number;
  y: number;
  u: number;
  v: number;
  weight: number;
  phase: number;
  velocityX: number;
  velocityY: number;
  offsetX: number;
  offsetY: number;
};

type DeformMesh = {
  cols: number;
  rows: number;
  vertices: MeshVertex[];
  indices: number[];
};
```

Generation steps:

1. Loop `row` from `0` to `rows`.
2. Loop `col` from `0` to `cols`.
3. Compute:
   - `x = col / cols * imageWidth`
   - `y = row / rows * imageHeight`
   - `u = col / cols`
   - `v = row / rows`
4. Build two triangles for each cell.
5. Assign stable random `phase` per vertex.

Index generation:

```ts
for (let row = 0; row < rows; row++) {
  for (let col = 0; col < cols; col++) {
    const a = row * (cols + 1) + col;
    const b = a + 1;
    const c = a + (cols + 1);
    const d = c + 1;
    indices.push(a, c, b);
    indices.push(b, c, d);
  }
}
```

### 7.5 Mask-to-Vertex Weight Sampling

Whenever the mask changes or the image changes, compute each vertex weight.

Basic sampling:

```ts
weight = maskPixelAlphaAt(vertex.baseX, vertex.baseY) / 255;
```

Better sampling:

- Average a small area around the vertex.
- Radius should be half the mesh cell size.
- This reduces jagged motion.

Edge safety:

- Reduce weight near the image boundary to avoid image corners drifting.

```ts
const edgeDistance = Math.min(x, y, width - x, height - y);
const edgeFade = clamp(edgeDistance / 40, 0, 1);
finalWeight = maskWeight * edgeFade;
```

Optional smoothing:

- Apply a small blur to the mask before sampling.
- Or smooth weights by averaging neighboring vertex weights once or twice.

### 7.6 Motion Model

The wobble should feel like a soft spring.

Motion settings:

```ts
type MotionSettings = {
  strength: number;       // default 36 px, min 0, max 160
  speed: number;          // default 1.2, min 0.1, max 5
  spring: number;         // default 45, min 5, max 160
  damping: number;        // default 10, min 1, max 40
  randomness: number;     // default 0.25, min 0, max 1
  direction: "both" | "x" | "y";
};
```

Spring integration:

```ts
function updateVertex(vertex, time, dt, settings) {
  const w = vertex.weight;
  if (w <= 0.001) {
    vertex.offsetX = 0;
    vertex.offsetY = 0;
    vertex.velocityX = 0;
    vertex.velocityY = 0;
    vertex.x = vertex.baseX;
    vertex.y = vertex.baseY;
    return;
  }

  const phase = vertex.phase;
  const t = time * settings.speed + phase;

  const autoX = Math.sin(t * 2.1) * settings.strength;
  const autoY = Math.cos(t * 1.7) * settings.strength;

  const targetX = settings.direction === "y" ? 0 : autoX * w;
  const targetY = settings.direction === "x" ? 0 : autoY * w;

  const forceX = (targetX - vertex.offsetX) * settings.spring;
  const forceY = (targetY - vertex.offsetY) * settings.spring;

  vertex.velocityX += forceX * dt;
  vertex.velocityY += forceY * dt;

  vertex.velocityX *= Math.exp(-settings.damping * dt);
  vertex.velocityY *= Math.exp(-settings.damping * dt);

  vertex.offsetX += vertex.velocityX * dt;
  vertex.offsetY += vertex.velocityY * dt;

  vertex.x = vertex.baseX + vertex.offsetX * w;
  vertex.y = vertex.baseY + vertex.offsetY * w;
}
```

Important:

- Clamp `dt` to avoid instability after tab switching.

```ts
dt = Math.min(dt, 1 / 30);
```

- Clamp maximum offset to prevent exploding.

```ts
const maxOffset = settings.strength * 1.5;
vertex.offsetX = clamp(vertex.offsetX, -maxOffset, maxOffset);
vertex.offsetY = clamp(vertex.offsetY, -maxOffset, maxOffset);
```

### 7.7 Drag Interaction in Preview Mode

Optional for MVP, recommended soon after.

Flow:

1. User drags over the image in Preview mode.
2. Convert pointer movement to a force vector.
3. Apply stronger force to vertices near the pointer.
4. Vertices spring back when released.

Type:

```ts
type DragForce = {
  active: boolean;
  x: number;
  y: number;
  deltaX: number;
  deltaY: number;
  radius: number;
  strength: number;
};
```

Force falloff:

```ts
const distance = hypot(vertex.baseX - drag.x, vertex.baseY - drag.y);
const local = clamp(1 - distance / drag.radius, 0, 1);
const force = local * local * vertex.weight * drag.strength;
```

### 7.8 Renderer

Renderer responsibilities:

- Create a textured mesh from the uploaded image.
- Update vertex positions every frame.
- Render to a visible canvas.
- Provide access to the canvas for export.

Renderer API:

```ts
type WobbleRenderer = {
  mount(container: HTMLElement): void;
  setImage(image: LoadedImage): void;
  setMesh(mesh: DeformMesh): void;
  updateVertices(mesh: DeformMesh): void;
  render(): void;
  getCanvas(): HTMLCanvasElement;
  resize(width: number, height: number): void;
  destroy(): void;
};
```

PixiJS implementation notes:

- Use a custom mesh or `MeshPlane`.
- Store vertex positions in a typed array.
- Update geometry buffers each frame.
- Use the uploaded image as texture.
- Set canvas size to match the working image, then CSS-scale it to the workspace.

Three.js implementation notes:

- Use orthographic camera.
- Use `PlaneGeometry(width, height, cols, rows)`.
- Apply texture material.
- Update `position` attribute each frame.
- Mark `geometry.attributes.position.needsUpdate = true`.

### 7.9 Exporter

MVP WebM exporter:

```ts
type ExportSettings = {
  format: "webm";
  durationSeconds: number; // default 3
  fps: number;             // default 30
  width: number;
  height: number;
  bitrate: number;         // default 4_000_000
};
```

Implementation option A: `captureStream()` + `MediaRecorder`

1. Get renderer canvas.
2. Call `canvas.captureStream(fps)`.
3. Create `MediaRecorder(stream, { mimeType: "video/webm" })`.
4. Start recording.
5. Run animation for `durationSeconds`.
6. Stop recorder.
7. Combine chunks into Blob.
8. Download Blob.

Pros:

- Simple.
- Good for MVP.

Cons:

- Less deterministic.
- Browser support varies.
- Harder to render faster than real time.

Implementation option B: frame-by-frame WebCodecs

Use after MVP for better control.

1. Render each frame at fixed timestamp.
2. Create `VideoFrame` from canvas.
3. Encode using `VideoEncoder`.
4. Mux into WebM or MP4.

Pros:

- Deterministic.
- Better for MP4.

Cons:

- More complex.
- Requires browser capability checks.

### 7.10 Project State

Central app state:

```ts
type AppMode = "empty" | "paint" | "preview" | "exporting";

type AppState = {
  mode: AppMode;
  image: LoadedImage | null;
  mask: MotionMask | null;
  mesh: DeformMesh | null;
  brush: BrushSettings;
  motion: MotionSettings;
  exportSettings: ExportSettings;
  error: string | null;
  exportProgress: number | null;
};
```

State rules:

- If no image exists, Paint and Preview controls are disabled.
- Replacing image resets mask, mesh, preview state, and export progress.
- Changing mask increments `mask.version`.
- Preview mode recomputes vertex weights if `mask.version` changed.
- Export mode locks editing until export completes or is cancelled.

## 8. Non-Functional Requirements

### 8.1 Privacy

- All image processing must happen in the browser.
- Do not upload images, masks, or exported videos to a server.
- Analytics, if used, must not include file names, image dimensions tied to identity, or user content.

### 8.2 Performance

Minimum targets:

- Paint interaction latency under 50 ms.
- Preview animation above 30 FPS for 1200 px images on common laptops.
- WebM export for a 3-second 30 FPS animation completes in under 30 seconds on a common laptop.

Performance techniques:

- Cap working image size.
- Use typed arrays for vertex data.
- Recompute mask weights only when mask changes.
- Use lower mesh density on mobile.
- Avoid reading full canvas pixel data every frame.
- Keep renderer running only in Preview mode or during export.

### 8.3 Browser Support

Target:

- Latest Chrome.
- Latest Edge.
- Latest Firefox.
- Latest Safari where possible.

MVP priority:

- Chrome and Edge first because `MediaRecorder`, WebM, and WebCodecs support are better.

Fallbacks:

- If WebM recording is unsupported, disable export and show a message.
- If WebGL is unavailable, show a clear unsupported-browser message.

### 8.4 Accessibility

- Buttons must have visible labels or accessible labels.
- Sliders must have labels and numeric values.
- Keyboard users must be able to upload, switch modes, clear mask, and export.
- Canvas-only interactions should have basic keyboard alternatives where practical.

### 8.5 Error Handling

Required errors:

- Unsupported image type.
- File too large.
- Image decode failed.
- WebGL unavailable.
- Export format unsupported.
- Export failed.
- Export cancelled.

Each error should include:

- What happened.
- What the user can do next.

## 9. Suggested File Structure

If building as a React/Vite app:

```text
src/
  app/
    App.tsx
    appState.ts
  components/
    TopBar.tsx
    Workspace.tsx
    PaintControls.tsx
    MotionControls.tsx
    ExportDialog.tsx
    StatusBar.tsx
  image/
    loadImage.ts
    downscaleImage.ts
  mask/
    MaskCanvas.ts
    brush.ts
    maskSampling.ts
    maskHistory.ts
  mesh/
    createGridMesh.ts
    sampleWeights.ts
    physics.ts
  render/
    WobbleRenderer.ts
    PixiWobbleRenderer.ts
  export/
    exportWebmMediaRecorder.ts
    exportWebCodecs.ts
    downloadBlob.ts
  utils/
    clamp.ts
    pointerToImage.ts
    browserSupport.ts
```

## 10. Implementation Milestones

### Milestone 1: Static Editor Shell

Deliver:

- React app shell.
- Upload button.
- Empty workspace.
- Left controls panel.
- Mode switch.

Done when:

- App runs locally.
- User can select a file.
- Uploaded image appears in the workspace.

### Milestone 2: Mask Painting

Deliver:

- Mask canvas.
- Paint brush.
- Eraser.
- Brush size slider.
- Brush strength slider.
- Clear mask button.
- Colored overlay.

Done when:

- User can visibly paint and erase motion areas.
- Mask aligns with the image at all workspace sizes.

### Milestone 3: Mesh Preview

Deliver:

- Grid mesh generation.
- Mask-to-weight sampling.
- WebGL renderer.
- Basic spring wobble animation.
- Motion parameter sliders.

Done when:

- Painted areas wobble.
- Unpainted areas remain stable.
- Sliders update the animation live.

### Milestone 4: Export WebM

Deliver:

- Export dialog.
- Duration/FPS controls.
- WebM recording.
- Progress display.
- Download file.

Done when:

- User can export a 3-second WebM.
- Result matches preview closely.

### Milestone 5: Polish and Reliability

Deliver:

- Error states.
- Loading states.
- Mobile layout.
- Performance caps.
- Browser support checks.
- Basic test coverage.

Done when:

- App handles common bad inputs gracefully.
- App remains usable on desktop and mobile widths.

## 11. Testing Plan

### Manual Test Cases

Upload:

- Upload PNG.
- Upload JPG.
- Upload WebP.
- Upload unsupported file.
- Upload file larger than max size.
- Replace image after painting.

Painting:

- Paint with small brush.
- Paint with large brush.
- Paint with low strength.
- Paint with high strength.
- Erase partially.
- Clear mask.
- Paint after zooming/resizing workspace.

Preview:

- Preview with empty mask.
- Preview with small painted area.
- Preview with large painted area.
- Test extreme strength.
- Test extreme speed.
- Switch Paint/Preview repeatedly.

Export:

- Export default WebM.
- Cancel export.
- Export after changing duration.
- Try export in unsupported browser or forced unsupported mode.

Performance:

- Test 800 px image.
- Test 1600 px image.
- Test dense mask.
- Test mobile viewport.

### Automated Tests

Unit tests:

- `clamp`
- `createGridMesh`
- mesh indices correctness
- mask coordinate conversion
- mask weight sampling
- physics update stability

Integration tests:

- Upload image creates mask and mesh.
- Painting increments mask version.
- Preview recomputes weights after mask change.
- Exporter returns Blob in supported browser mock.

## 12. Acceptance Criteria for MVP

The MVP is complete only when all items below are true:

- User can upload one image.
- User can paint and erase motion areas.
- User can preview wobble animation.
- Motion is localized to painted areas.
- User can tune strength, speed, spring, and damping.
- User can export WebM locally.
- No user image data is sent to a server.
- App shows useful errors for invalid files and unsupported export.
- App works on latest Chrome desktop.
- Code is organized into image, mask, mesh, render, and export modules.

## 13. Implementation Risks

### Risk: Wobble Looks Ugly or Rigid

Cause:

- Mesh density too low.
- Mask edge too sharp.
- All vertices move in the same phase.

Mitigation:

- Increase mesh density.
- Blur/smooth mask weights.
- Add per-vertex phase.
- Add neighboring weight smoothing.

### Risk: Animation Explodes

Cause:

- Spring values too high.
- `dt` too large after tab inactivity.
- No offset clamp.

Mitigation:

- Clamp `dt`.
- Clamp offsets.
- Use stable default parameters.

### Risk: Export Differs From Preview

Cause:

- Export uses real-time recording and frame timing drifts.

Mitigation:

- For MVP, accept slight differences.
- Later implement deterministic frame-by-frame WebCodecs export.

### Risk: Mobile Performance Is Poor

Cause:

- Large images and dense mesh.

Mitigation:

- Downscale image.
- Lower mesh density.
- Reduce export size.
- Pause preview when controls are open if needed.

## 14. Suggested Default Values

Image:

- Max file size: 30 MB.
- Max working longest side: 1600 px.

Mesh:

- Desktop: 50 x 50 cells.
- Mobile: 36 x 36 cells.

Brush:

- Size: 48 px.
- Strength: 0.8.
- Hardness: 0.65.

Motion:

- Strength: 36 px.
- Speed: 1.2.
- Spring: 45.
- Damping: 10.
- Randomness: 0.25.
- Direction: both.

Export:

- Format: WebM.
- Duration: 3 seconds.
- FPS: 30.
- Bitrate: 4 Mbps.

## 15. Developer Notes

- Keep the original image, mask canvas, and render canvas separate.
- Do not mutate original image pixels.
- Do not read mask pixel data every animation frame.
- Recompute vertex weights only after mask changes.
- Keep all canvas coordinate conversions in one utility.
- Prefer explicit TypeScript types for every module boundary.
- Add browser capability checks before showing export formats.
- Use clear user messages instead of silent failures.

## 16. Legal and Product Boundaries

Allowed:

- Recreate the broad workflow: upload, paint, wobble, export.
- Use public documentation for browser APIs.
- Use open-source libraries according to their licenses.
- Design an original UI and original brand.

Not allowed:

- Copy competitor source code.
- Copy competitor UI layout exactly.
- Copy competitor text, icons, samples, or branding.
- Claim compatibility or affiliation with another product unless permission exists.

Recommended product naming:

- Use the product name "purupuru maker" consistently across the website.
