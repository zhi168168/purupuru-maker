import { useEffect, useMemo, useRef, useState } from "react";
import type { AppMode, BrushSettings, DeformMesh, LoadedImage, MotionMask } from "../types";
import { drawBrushStroke } from "../mask/brush";
import { getContainPlacement, pointerToImage, type ImagePlacement } from "../utils/pointerToImage";

type WorkspaceProps = {
  mode: AppMode;
  image: LoadedImage | null;
  mask: MotionMask | null;
  mesh: DeformMesh | null;
  brush: BrushSettings;
  renderCanvas: HTMLCanvasElement | null;
  disabled: boolean;
  emptyUploadLabel: string;
  maskVersion: number;
  onMaskChanged: () => void;
  onUploadClick: () => void;
  onDropFile: (file: File) => void;
};

export function Workspace({
  mode,
  image,
  mask,
  brush,
  renderCanvas,
  disabled,
  emptyUploadLabel,
  maskVersion,
  onMaskChanged,
  onUploadClick,
  onDropFile,
}: WorkspaceProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const imageCanvasRef = useRef<HTMLCanvasElement>(null);
  const overlayCanvasRef = useRef<HTMLCanvasElement>(null);
  const renderLayerRef = useRef<HTMLDivElement>(null);
  const lastPointRef = useRef<{ x: number; y: number } | null>(null);
  const [size, setSize] = useState({ width: 1, height: 1 });
  const [isDraggingOver, setIsDraggingOver] = useState(false);
  const [overlayVersion, setOverlayVersion] = useState(0);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;
    const observer = new ResizeObserver(([entry]) => {
      setSize({
        width: entry.contentRect.width,
        height: entry.contentRect.height,
      });
    });
    observer.observe(container);
    return () => observer.disconnect();
  }, []);

  const placement = useMemo<ImagePlacement | null>(() => {
    if (!image) return null;
    return getContainPlacement(size.width, size.height, image.width, image.height);
  }, [image, size.height, size.width]);

  useEffect(() => {
    if (!image || !placement) return;
    const canvas = imageCanvasRef.current;
    if (!canvas) return;
    canvas.width = image.width;
    canvas.height = image.height;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.clearRect(0, 0, image.width, image.height);
    ctx.drawImage(image.bitmap, 0, 0, image.width, image.height);
  }, [image, placement]);

  useEffect(() => {
    if (!mask || !overlayCanvasRef.current) return;
    const canvas = overlayCanvasRef.current;
    canvas.width = mask.width;
    canvas.height = mask.height;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(mask.canvas, 0, 0);
    ctx.globalCompositeOperation = "source-in";
    ctx.fillStyle = "rgba(34, 196, 166, 0.62)";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.globalCompositeOperation = "source-over";
  }, [mask, maskVersion, overlayVersion]);

  useEffect(() => {
    const layer = renderLayerRef.current;
    if (!layer || !renderCanvas) return;
    layer.appendChild(renderCanvas);
    return () => {
      renderCanvas.remove();
    };
  }, [renderCanvas]);

  const canvasStyle = placement
    ? {
        left: `${placement.left}px`,
        top: `${placement.top}px`,
        width: `${placement.width}px`,
        height: `${placement.height}px`,
      }
    : undefined;

  function getPoint(event: React.PointerEvent<HTMLDivElement>) {
    if (!image || !placement || !containerRef.current) return null;
    return pointerToImage(
      event.clientX,
      event.clientY,
      containerRef.current,
      placement,
      image.width,
      image.height,
    );
  }

  function handlePointerDown(event: React.PointerEvent<HTMLDivElement>) {
    if (disabled || mode !== "paint" || !mask) return;
    const point = getPoint(event);
    if (!point?.inside) return;
    event.currentTarget.setPointerCapture(event.pointerId);
    drawBrushStroke(mask, null, point, brush);
    lastPointRef.current = point;
    setOverlayVersion(mask.version);
    onMaskChanged();
  }

  function handlePointerMove(event: React.PointerEvent<HTMLDivElement>) {
    if (disabled || mode !== "paint" || !mask || !lastPointRef.current) return;
    const point = getPoint(event);
    if (!point?.inside) return;
    drawBrushStroke(mask, lastPointRef.current, point, brush);
    lastPointRef.current = point;
    setOverlayVersion(mask.version);
    onMaskChanged();
  }

  function endStroke(event: React.PointerEvent<HTMLDivElement>) {
    lastPointRef.current = null;
    if (event.currentTarget.hasPointerCapture(event.pointerId)) {
      event.currentTarget.releasePointerCapture(event.pointerId);
    }
  }

  return (
    <main
      ref={containerRef}
      className={`workspace ${isDraggingOver ? "dragging" : ""}`}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={endStroke}
      onPointerCancel={endStroke}
      onDragOver={(event) => {
        event.preventDefault();
        setIsDraggingOver(true);
      }}
      onDragLeave={() => setIsDraggingOver(false)}
      onDrop={(event) => {
        event.preventDefault();
        setIsDraggingOver(false);
        const file = event.dataTransfer.files?.[0];
        if (file) onDropFile(file);
      }}
    >
      {!image && (
        <button type="button" className="empty-state" onClick={onUploadClick}>
          <span>{emptyUploadLabel}</span>
        </button>
      )}

      {image && placement && (
        <>
          <canvas ref={imageCanvasRef} className="image-canvas" style={canvasStyle} />
          <div
            ref={renderLayerRef}
            className={`render-layer ${mode === "preview" || mode === "exporting" ? "visible" : ""}`}
            style={canvasStyle}
          />
          <canvas
            ref={overlayCanvasRef}
            className={`mask-overlay ${mode === "paint" ? "visible" : ""}`}
            style={canvasStyle}
          />
          {mode === "paint" && (
            <div
              className="brush-cursor"
              aria-hidden="true"
              style={{
                width: `${brush.size * placement.scale}px`,
                height: `${brush.size * placement.scale}px`,
              }}
            />
          )}
        </>
      )}
    </main>
  );
}
