import { useEffect, useMemo, useRef, useState } from "react";
import { ExportDialog } from "../components/ExportDialog";
import { MotionControls } from "../components/MotionControls";
import { PaintControls } from "../components/PaintControls";
import { StatusBar } from "../components/StatusBar";
import { TopBar } from "../components/TopBar";
import { Workspace } from "../components/Workspace";
import { exportGif } from "../export/exportGif";
import { exportMp4MediaRecorder, type ExportController } from "../export/exportMediaRecorder";
import { downloadBlob } from "../export/downloadBlob";
import { loadImage } from "../image/loadImage";
import { clearMotionMask, createMotionMask } from "../mask/MaskCanvas";
import { createGridMesh } from "../mesh/createGridMesh";
import { resetMeshMotion, updateMeshPhysics } from "../mesh/physics";
import { sampleWeights } from "../mesh/sampleWeights";
import { ThreeWobbleRenderer } from "../render/ThreeWobbleRenderer";
import type {
  AppMode,
  BrushSettings,
  DeformMesh,
  ExportProgress,
  ExportSettings,
  LoadedImage,
  MotionMask,
  MotionSettings,
} from "../types";
import { isExportFormatSupported, supportsWebgl } from "../utils/browserSupport";
import { defaultBrush, defaultExportSettings, defaultMotion } from "./appState";

export function App() {
  const faqPage = getFaqPage();
  if (faqPage) return <FaqPage page={faqPage} />;

  return <ToolApp />;
}

function ToolApp() {
  const [mode, setMode] = useState<AppMode>("empty");
  const [image, setImage] = useState<LoadedImage | null>(null);
  const [mask, setMask] = useState<MotionMask | null>(null);
  const [mesh, setMesh] = useState<DeformMesh | null>(null);
  const [brush, setBrush] = useState<BrushSettings>(defaultBrush);
  const [motion, setMotion] = useState<MotionSettings>(defaultMotion);
  const [exportSettings, setExportSettings] =
    useState<ExportSettings>(defaultExportSettings);
  const [error, setError] = useState<string | null>(null);
  const [maskVersion, setMaskVersion] = useState(0);
  const [sampledMaskVersion, setSampledMaskVersion] = useState(-1);
  const [renderCanvas, setRenderCanvas] = useState<HTMLCanvasElement | null>(null);
  const [exportDialogOpen, setExportDialogOpen] = useState(false);
  const [exportProgress, setExportProgress] = useState<ExportProgress | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const rendererRef = useRef<ThreeWobbleRenderer | null>(null);
  const latestImageRef = useRef<LoadedImage | null>(null);
  const animationRef = useRef<number | null>(null);
  const lastFrameRef = useRef<number | null>(null);
  const exportControllerRef = useRef<ExportController | null>(null);

  const isExporting = mode === "exporting";
  const canExport = Boolean(
    image && renderCanvas && isExportFormatSupported(exportSettings.format),
  );
  const exportSupportMessage =
    image && renderCanvas && !isExportFormatSupported(exportSettings.format)
      ? "MP4 export is not supported in this browser. Choose GIF instead."
      : undefined;

  useEffect(() => {
    if (!supportsWebgl()) {
      setError("WebGL is unavailable in this browser. Please try latest Chrome or Edge.");
    }
  }, []);

  useEffect(() => {
    if (!image || !mask || !mesh) return;
    if ((mode === "preview" || mode === "exporting") && sampledMaskVersion !== maskVersion) {
      sampleWeights(mesh, mask);
      resetMeshMotion(mesh);
      rendererRef.current?.updateVertices(mesh);
      setSampledMaskVersion(maskVersion);
    }
  }, [image, mask, maskVersion, mesh, mode, sampledMaskVersion]);

  useEffect(() => {
    if (!mesh || !rendererRef.current || (mode !== "preview" && mode !== "exporting")) {
      if (animationRef.current !== null) {
        cancelAnimationFrame(animationRef.current);
        animationRef.current = null;
      }
      lastFrameRef.current = null;
      return;
    }

    const renderer = rendererRef.current;
    const tick = (now: number) => {
      const last = lastFrameRef.current ?? now;
      const dt = (now - last) / 1000;
      lastFrameRef.current = now;
      updateMeshPhysics(mesh, now / 1000, dt, motion);
      renderer.updateVertices(mesh);
      renderer.render();
      animationRef.current = requestAnimationFrame(tick);
    };

    animationRef.current = requestAnimationFrame(tick);
    return () => {
      if (animationRef.current !== null) {
        cancelAnimationFrame(animationRef.current);
        animationRef.current = null;
      }
    };
  }, [mesh, mode, motion]);

  useEffect(() => {
    latestImageRef.current = image;
  }, [image]);

  useEffect(() => {
    return () => {
      rendererRef.current?.destroy();
      const objectUrl = latestImageRef.current?.objectUrl;
      if (objectUrl) URL.revokeObjectURL(objectUrl);
    };
  }, []);

  async function handleFile(file: File) {
    setError(null);
    setExportProgress(null);

    try {
      const nextImage = await loadImage(file);
      const nextMask = createMotionMask(nextImage.width, nextImage.height);
      const nextMesh = createGridMesh(nextImage.width, nextImage.height);

      rendererRef.current?.destroy();
      const renderer = new ThreeWobbleRenderer();
      renderer.setImage(nextImage);
      renderer.setMesh(nextMesh);
      renderer.render();
      rendererRef.current = renderer;

      if (image?.objectUrl) URL.revokeObjectURL(image.objectUrl);
      setImage(nextImage);
      setMask(nextMask);
      setMesh(nextMesh);
      setMode("paint");
      setMaskVersion(nextMask.version);
      setSampledMaskVersion(-1);
      setRenderCanvas(renderer.getCanvas());
      setExportSettings({
        ...defaultExportSettings,
        width: nextImage.width,
        height: nextImage.height,
      });
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : "Image loading failed.");
    }
  }

  function handleClearMask() {
    if (!mask) return;
    clearMotionMask(mask);
    setMaskVersion(mask.version);
    setSampledMaskVersion(-1);
  }

  function handleMaskChanged() {
    if (!mask) return;
    setMaskVersion(mask.version);
    setSampledMaskVersion(-1);
  }

  function handleSetMode(nextMode: "paint" | "preview") {
    if (!image) return;
    setError(null);
    setMode(nextMode);
  }

  async function startExport() {
    if (!renderCanvas || !image) return;
    setError(null);
    setMode("exporting");
    setExportProgress({ progress: 0, label: "Preparing export..." });

    try {
      const handleProgress = (formatLabel: string) => (progress: number) => {
        setExportProgress({
          progress,
          label: `Exporting ${formatLabel} ${Math.round(progress * 100)}%`,
        });
      };
      const controller =
        exportSettings.format === "gif"
          ? exportGif(renderCanvas, exportSettings, handleProgress("GIF"))
          : exportMp4MediaRecorder(renderCanvas, exportSettings, handleProgress("MP4"));
      exportControllerRef.current = controller;
      const blob = await controller.done;
      setExportProgress({ progress: 1, label: "Export complete" });
      downloadBlob(
        blob,
        `${fileBaseName(image.fileName)}-purupuru-maker.${exportSettings.format}`,
      );
      setExportDialogOpen(false);
      setMode("preview");
      window.setTimeout(() => setExportProgress(null), 1200);
    } catch (exportError) {
      const message =
        exportError instanceof Error ? exportError.message : "Export failed.";
      setError(
        message === "Export cancelled."
          ? "Export cancelled. You can adjust settings and try again."
          : message,
      );
      setMode("preview");
      setExportProgress(null);
    } finally {
      exportControllerRef.current = null;
    }
  }

  function cancelExport() {
    exportControllerRef.current?.cancel();
  }

  const leftPanel = useMemo(() => {
    if (mode === "preview" || mode === "exporting") {
      return (
        <MotionControls
          motion={motion}
          disabled={!image || isExporting}
          onChange={setMotion}
        />
      );
    }

    return (
      <PaintControls
        brush={brush}
        disabled={!image || isExporting}
        onChange={setBrush}
        onClear={handleClearMask}
      />
    );
  }, [brush, image, isExporting, mode, motion]);

  return (
    <div className="app-shell">
      <TopBar
        mode={mode}
        hasImage={Boolean(image)}
        isExporting={isExporting}
        onUploadClick={() => fileInputRef.current?.click()}
        onSetMode={handleSetMode}
        onExport={() => {
          setExportDialogOpen(true);
          if (mode !== "preview") setMode("preview");
        }}
      />

      <input
        ref={fileInputRef}
        className="visually-hidden"
        type="file"
        accept="image/png,image/jpeg,image/webp"
        onChange={(event) => {
          const file = event.target.files?.[0];
          if (file) handleFile(file);
          event.currentTarget.value = "";
        }}
      />

      <div className="main-layout">
        <aside className="sidebar">{leftPanel}</aside>
        <Workspace
          mode={mode}
          image={image}
          mask={mask}
          mesh={mesh}
          brush={brush}
          renderCanvas={renderCanvas}
          disabled={isExporting}
          maskVersion={maskVersion}
          onMaskChanged={handleMaskChanged}
          onUploadClick={() => fileInputRef.current?.click()}
          onDropFile={handleFile}
        />
      </div>

      <StatusBar image={image} error={error} progress={exportProgress} />

      <ExportDialog
        open={exportDialogOpen}
        settings={exportSettings}
        progress={exportProgress}
        canExport={canExport}
        supportMessage={exportSupportMessage}
        onChange={setExportSettings}
        onClose={() => setExportDialogOpen(false)}
        onStart={startExport}
        onCancel={cancelExport}
      />
    </div>
  );
}

function fileBaseName(fileName: string) {
  const lastDot = fileName.lastIndexOf(".");
  return lastDot > 0 ? fileName.slice(0, lastDot) : fileName;
}

type FaqPageContent = {
  title: string;
  description: string;
  sections: Array<{
    title: string;
    body: string;
  }>;
};

const faqPages: Record<string, FaqPageContent> = {
  "/what-is-purupuru-maker": {
    title: "What is purupuru maker?",
    description:
      "purupuru maker is a free browser-based image wobble maker for creating soft purupuru-style animations from still pictures.",
    sections: [
      {
        title: "Where the idea comes from",
        body:
          "The name comes from the purupuru-style wobble effect often used in Japanese web culture, character art, avatars, stickers, memes, and soft image edits. purupuru maker is an independent browser-based tool inspired by that effect.",
      },
      {
        title: "Main features",
        body:
          "purupuru maker lets you upload a PNG, JPEG, or WebP image, paint a motion mask over the parts that should move, adjust the wobble strength and timing, preview the result in real time, and export a short MP4 or GIF animation.",
      },
      {
        title: "Main workflow",
        body:
          "The basic workflow is simple: keep the important base of the image steady, paint flexible details like hair, ribbons, sleeves, ears, stickers, or accessories, then tune the motion until it feels bouncy without looking distorted.",
      },
    ],
  },
  "/how-to-use-purupuru-maker": {
    title: "How to use purupuru maker",
    description:
      "Use purupuru maker to turn a still image into a purupuru-style wobble animation directly in your browser.",
    sections: [
      {
        title: "1. Upload an image",
        body:
          "Start on the editor screen and upload a PNG, JPEG, or WebP image. Character art, stickers, avatars, and images with clear soft details usually work best in purupuru maker.",
      },
      {
        title: "2. Choose brush thickness",
        body:
          "Use the brush-size control to choose how wide your strokes should be. A thinner brush gives more precise edges, while a thicker brush is faster for large hair, clothing, or sticker areas.",
      },
      {
        title: "3. Paint the moving area",
        body:
          "Use Paint mode to brush over the parts that should wobble, such as hair, sleeves, ribbons, ears, or accessories. Unpainted areas stay steadier.",
      },
      {
        title: "4. Adjust the wobble",
        body:
          "Switch to Preview mode and tune strength, speed, spring, and damping. Start with a small amount of motion, then increase it until the image feels lively without warping too much.",
      },
      {
        title: "5. Export the animation",
        body:
          "When the preview looks right, export the result as an MP4 video or GIF animation. Chrome, Edge, and Safari usually provide the smoothest support for browser canvas recording.",
      },
    ],
  },
  "/are-my-images-uploaded": {
    title: "Are my images uploaded to purupuru maker?",
    description:
      "purupuru maker processes uploaded images locally in your browser for mask painting, preview, and export.",
    sections: [
      {
        title: "Short answer",
        body:
          "No. The editor is designed so image loading, motion-mask painting, wobble preview, and MP4 or GIF export happen locally in your browser.",
      },
      {
        title: "What stays local",
        body:
          "The selected image file, painted mask, preview canvas, and exported media are handled by browser APIs on your device. They are not sent to a purupuru maker server by the app code.",
      },
      {
        title: "What a website request can still include",
        body:
          "Like most websites, the hosting layer may receive standard request information such as IP address, user agent, requested URL, and request time. That technical traffic does not include the image content you edit.",
      },
    ],
  },
};

function getFaqPage() {
  const path = normalizePath(window.location.pathname);
  return faqPages[path] ?? null;
}

function normalizePath(path: string) {
  return path.length > 1 && path.endsWith("/") ? path.slice(0, -1) : path;
}

function FaqPage({ page }: { page: FaqPageContent }) {
  useEffect(() => {
    document.title = `${page.title} - purupuru maker FAQ`;
    const description = document.querySelector<HTMLMetaElement>('meta[name="description"]');
    if (description) description.content = page.description;
  }, [page]);

  return (
    <div className="app-shell info-shell">
      <TopBar variant="page" />
      <main className="info-page">
        <p className="info-kicker">FAQ</p>
        <h1>{page.title}</h1>
        <p className="info-lead">{page.description}</p>
        <div className="info-sections">
          {page.sections.map((section) => (
            <section key={section.title}>
              <h2>{section.title}</h2>
              <p>{section.body}</p>
            </section>
          ))}
        </div>
      </main>
    </div>
  );
}
