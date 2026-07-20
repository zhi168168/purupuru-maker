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
import { getLocaleFromPath, stripLocalePrefix, type Locale, uiText } from "../i18n";
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
  const locale = getLocaleFromPath(window.location.pathname);
  const faqPage = getFaqPage(locale);
  if (faqPage) return <FaqPage page={faqPage} locale={locale} />;

  return <ToolApp locale={locale} />;
}

function ToolApp({ locale }: { locale: Locale }) {
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
  const timelineStartRef = useRef<number | null>(null);
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
      if (timelineStartRef.current === null) {
        timelineStartRef.current = now / 1000;
      }
      const elapsed = now / 1000 - timelineStartRef.current;
      updateMeshPhysics(mesh, elapsed, dt, motion);
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
    if (nextMode === "preview") {
      timelineStartRef.current = null;
      lastFrameRef.current = null;
      if (mesh) resetMeshMotion(mesh);
    }
    setMode(nextMode);
  }

  function handleMotionChange(nextMotion: MotionSettings) {
    setMotion(nextMotion);
    timelineStartRef.current = null;
    lastFrameRef.current = null;
    if (mesh && (mode === "preview" || mode === "exporting")) {
      resetMeshMotion(mesh);
    }
  }

  function handleExportSettingsChange(nextSettings: ExportSettings) {
    setExportSettings(nextSettings);
    setMotion((currentMotion) => ({
      ...currentMotion,
      envelope: {
        ...currentMotion.envelope,
        keyframes: currentMotion.envelope.keyframes.map((keyframe) => ({
          ...keyframe,
          time: Math.min(keyframe.time, nextSettings.durationSeconds),
        })),
      },
    }));
  }

  async function startExport() {
    if (!renderCanvas || !image) return;
    setError(null);
    timelineStartRef.current = null;
    lastFrameRef.current = null;
    if (mesh) resetMeshMotion(mesh);
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
          exportDurationSeconds={exportSettings.durationSeconds}
          onChange={handleMotionChange}
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
        locale={locale}
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
          emptyUploadLabel={uiText[locale].emptyUpload}
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
        onChange={handleExportSettingsChange}
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

const faqPages: Record<Locale, Record<string, FaqPageContent>> = {
  en: {
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
          "Switch to Preview mode and tune strength, speed, spring, damping, and Motion over time. Use Loop for constant wobble, Settle to fade the motion back to still, or Custom keyframes to set wobble percentage at specific seconds.",
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
  },
  ja: {
    "/what-is-purupuru-maker": {
      title: "purupuru makerとは？",
      description:
        "purupuru makerは、静止画からやわらかいぷるぷる風アニメーションを作れる、無料のブラウザベース画像揺れメーカーです。",
      sections: [
        {
          title: "名前の由来",
          body:
            "purupuru makerの名前は、日本のWeb文化やキャラクター画像、アバター、ステッカー、ミームで使われる、ぷるぷるした揺れ表現から来ています。このツールはその表現に着想を得た、独立したブラウザベースの編集ツールです。",
        },
        {
          title: "主な機能",
          body:
            "PNG、JPEG、WebP画像をアップロードし、動かしたい部分にモーションマスクを描き、強さやタイミングを調整してリアルタイムで確認できます。完成したアニメーションはMP4またはGIFとして書き出せます。",
        },
        {
          title: "基本の流れ",
          body:
            "土台になる部分は安定させたまま、髪、リボン、袖、耳、ステッカー、小物などの柔らかい部分を塗り、自然に弾むようにモーションを調整します。",
        },
      ],
    },
    "/how-to-use-purupuru-maker": {
      title: "purupuru makerの使い方",
      description:
        "purupuru makerを使うと、静止画をブラウザ上でぷるぷる風の揺れアニメーションにできます。",
      sections: [
        {
          title: "1. 画像をアップロード",
          body:
            "エディター画面でPNG、JPEG、WebP画像をアップロードします。キャラクター画像、ステッカー、アバターなど、柔らかく動かしたい部分がはっきりしている画像に向いています。",
        },
        {
          title: "2. ブラシの太さを選ぶ",
          body:
            "ブラシサイズでストロークの太さを調整します。細いブラシは輪郭の調整に向き、太いブラシは髪や服など広い範囲を素早く塗るときに便利です。",
        },
        {
          title: "3. 動かす範囲を塗る",
          body:
            "Paintモードで髪、袖、リボン、耳、小物など、揺らしたい部分を塗ります。塗っていない部分は比較的安定したままになります。",
        },
        {
          title: "4. 揺れを調整",
          body:
            "PreviewモードでStrength、Speed、Spring、Damping、Motion over timeを調整します。Loopは一定の揺れ、Settleは揺れをだんだん静止へ戻す動き、Customは秒数ごとにWobble %を指定するキーフレームです。",
        },
        {
          title: "5. アニメーションを書き出す",
          body:
            "プレビューが自然に見えたら、MP4またはGIFとして書き出します。ブラウザのCanvas録画はChrome、Edge、Safariで比較的安定して動作します。",
        },
      ],
    },
    "/are-my-images-uploaded": {
      title: "画像はアップロードされますか？",
      description:
        "purupuru makerでは、画像の読み込み、マスク描画、プレビュー、書き出しはブラウザ内でローカルに処理されます。",
      sections: [
        {
          title: "短い答え",
          body:
            "いいえ。エディターは、画像の読み込み、モーションマスクの描画、揺れのプレビュー、MP4またはGIFの書き出しをブラウザ内で処理する設計です。",
        },
        {
          title: "ローカルに残るもの",
          body:
            "選択した画像ファイル、描いたマスク、プレビューCanvas、書き出したメディアは、お使いの端末上のブラウザAPIで扱われます。アプリのコードが画像内容をpurupuru makerのサーバーへ送信することはありません。",
        },
        {
          title: "通常のWebアクセスで発生する情報",
          body:
            "多くのWebサイトと同じように、ホスティング層ではIPアドレス、ユーザーエージェント、アクセスURL、時刻などの標準的なリクエスト情報を受け取る場合があります。その通信に、編集している画像の内容は含まれません。",
        },
      ],
    },
  },
  ko: {
    "/what-is-purupuru-maker": {
      title: "purupuru maker란?",
      description:
        "purupuru maker는 정지 이미지를 부드러운 젤리 느낌의 흔들림 애니메이션으로 만들 수 있는 무료 브라우저 기반 이미지 wobble 도구입니다.",
      sections: [
        {
          title: "아이디어의 출처",
          body:
            "purupuru maker라는 이름은 캐릭터 아트, 아바타, 스티커, 밈 등에서 쓰이는 말랑한 purupuru 스타일 흔들림 효과에서 왔습니다. purupuru maker는 그 표현에서 영감을 받은 독립적인 브라우저 기반 도구입니다.",
        },
        {
          title: "주요 기능",
          body:
            "PNG, JPEG, WebP 이미지를 업로드하고 움직일 영역에 모션 마스크를 칠한 뒤, 흔들림의 세기와 타이밍을 조정해 실시간으로 미리 볼 수 있습니다. 결과는 짧은 MP4 또는 GIF 애니메이션으로 내보낼 수 있습니다.",
        },
        {
          title: "기본 작업 흐름",
          body:
            "이미지의 중심이 되는 부분은 안정적으로 두고, 머리카락, 리본, 소매, 귀, 스티커, 액세서리처럼 부드럽게 움직일 디테일을 칠한 뒤 자연스럽게 튀는 느낌이 나도록 모션을 조정합니다.",
        },
      ],
    },
    "/how-to-use-purupuru-maker": {
      title: "purupuru maker 사용 방법",
      description:
        "purupuru maker를 사용하면 정지 이미지를 브라우저에서 purupuru 스타일의 흔들림 애니메이션으로 만들 수 있습니다.",
      sections: [
        {
          title: "1. 이미지 업로드",
          body:
            "에디터 화면에서 PNG, JPEG 또는 WebP 이미지를 업로드하세요. 캐릭터 아트, 스티커, 아바타처럼 움직일 부위가 분명한 이미지가 잘 어울립니다.",
        },
        {
          title: "2. 브러시 두께 선택",
          body:
            "브러시 크기로 칠할 선의 폭을 정합니다. 얇은 브러시는 가장자리를 정교하게 다듬을 때 좋고, 두꺼운 브러시는 머리카락이나 옷처럼 넓은 영역을 빠르게 칠할 때 좋습니다.",
        },
        {
          title: "3. 움직일 영역 칠하기",
          body:
            "Paint 모드에서 머리카락, 소매, 리본, 귀, 액세서리처럼 흔들리게 만들고 싶은 부분을 칠합니다. 칠하지 않은 영역은 더 안정적으로 유지됩니다.",
        },
        {
          title: "4. 흔들림 조정",
          body:
            "Preview 모드에서 Strength, Speed, Spring, Damping, Motion over time을 조정합니다. Loop는 일정한 흔들림, Settle은 흔들림이 점점 멈추는 움직임, Custom은 특정 초마다 Wobble %를 지정하는 키프레임입니다.",
        },
        {
          title: "5. 애니메이션 내보내기",
          body:
            "미리보기 결과가 마음에 들면 MP4 또는 GIF로 내보내세요. 브라우저 Canvas 녹화는 Chrome, Edge, Safari에서 대체로 가장 안정적입니다.",
        },
      ],
    },
    "/are-my-images-uploaded": {
      title: "이미지가 업로드되나요?",
      description:
        "purupuru maker는 이미지 불러오기, 마스크 칠하기, 미리보기, 내보내기를 브라우저 안에서 로컬로 처리합니다.",
      sections: [
        {
          title: "짧은 답변",
          body:
            "아니요. 에디터는 이미지 불러오기, 모션 마스크 칠하기, wobble 미리보기, MP4 또는 GIF 내보내기를 브라우저 안에서 처리하도록 설계되어 있습니다.",
        },
        {
          title: "로컬에 남는 것",
          body:
            "선택한 이미지 파일, 칠한 마스크, 미리보기 Canvas, 내보낸 미디어는 기기의 브라우저 API로 처리됩니다. 앱 코드가 이미지 내용을 purupuru maker 서버로 보내지 않습니다.",
        },
        {
          title: "일반적인 웹 요청 정보",
          body:
            "대부분의 웹사이트처럼 호스팅 계층은 IP 주소, 사용자 에이전트, 요청 URL, 요청 시간 같은 표준 요청 정보를 받을 수 있습니다. 이 기술적인 트래픽에는 편집 중인 이미지 내용이 포함되지 않습니다.",
        },
      ],
    },
  },
  "zh-Hant": {
    "/what-is-purupuru-maker": {
      title: "purupuru maker 是什麼？",
      description:
        "purupuru maker 是一款免費的瀏覽器圖片晃動工具，可以把靜態圖片做成柔軟的 purupuru 風格動畫。",
      sections: [
        {
          title: "名稱來源",
          body:
            "這個名稱來自常見於日本網路文化、角色圖、頭像、貼圖與迷因中的 purupuru 風格晃動效果。purupuru maker 是一款受這種效果啟發的獨立瀏覽器工具。",
        },
        {
          title: "主要功能",
          body:
            "purupuru maker 可讓你上傳 PNG、JPEG 或 WebP 圖片，繪製要晃動的動作遮罩，調整晃動強度與時間， 即時預覽結果，並匯出短版 MP4 或 GIF 動畫。",
        },
        {
          title: "基本流程",
          body:
            "保留圖片中需要穩定的基底，只在頭髮、緞帶、袖子、耳朵、貼圖或配件等柔軟細節上繪製遮罩，再調整動作，讓畫面有彈性但不過度變形。",
        },
      ],
    },
    "/how-to-use-purupuru-maker": {
      title: "如何使用 purupuru maker",
      description:
        "使用 purupuru maker，可以直接在瀏覽器中把靜態圖片變成 purupuru 風格的晃動動畫。",
      sections: [
        {
          title: "1. 上傳圖片",
          body:
            "在編輯器中上傳 PNG、JPEG 或 WebP 圖片。角色圖、貼圖、頭像，以及柔軟細節明確的圖片通常最適合。",
        },
        {
          title: "2. 選擇筆刷粗細",
          body:
            "使用筆刷大小控制筆觸寬度。較細的筆刷適合精修邊緣，較粗的筆刷則適合快速塗抹頭髮、衣服或其他大範圍區域。",
        },
        {
          title: "3. 繪製要晃動的區域",
          body:
            "在 Paint 模式中塗抹要晃動的部分，例如頭髮、袖子、緞帶、耳朵或配件。未塗抹的區域會保持較穩定。",
        },
        {
          title: "4. 調整晃動",
          body:
            "切換到 Preview 模式，調整 Strength、Speed、Spring、Damping 與 Motion over time。Loop 會保持固定晃動，Settle 會讓晃動逐漸回到靜止，Custom 可用關鍵影格在指定秒數設定 Wobble %。",
        },
        {
          title: "5. 匯出動畫",
          body:
            "預覽效果滿意後，可匯出為 MP4 影片或 GIF 動畫。Chrome、Edge 和 Safari 通常對瀏覽器 Canvas 錄製支援較穩定。",
        },
      ],
    },
    "/are-my-images-uploaded": {
      title: "我的圖片會被上傳嗎？",
      description:
        "purupuru maker 的圖片載入、遮罩繪製、預覽與匯出都在你的瀏覽器中本機處理。",
      sections: [
        {
          title: "簡短回答",
          body:
            "不會。這個編輯器的設計是讓圖片載入、動作遮罩繪製、晃動預覽，以及 MP4 或 GIF 匯出都在瀏覽器中完成。",
        },
        {
          title: "哪些內容保留在本機",
          body:
            "你選擇的圖片檔、繪製的遮罩、預覽 Canvas 和匯出的媒體，都是由你裝置上的瀏覽器 API 處理。應用程式程式碼不會把圖片內容傳送到 purupuru maker 伺服器。",
        },
        {
          title: "網站請求仍可能包含的資訊",
          body:
            "和大多數網站一樣，主機服務可能會收到 IP 位址、使用者代理、請求網址與請求時間等標準請求資訊。這些技術流量不包含你正在編輯的圖片內容。",
        },
      ],
    },
  },
};

function getFaqPage(locale: Locale) {
  const path = normalizePath(stripLocalePrefix(window.location.pathname));
  return faqPages[locale][path] ?? null;
}

function normalizePath(path: string) {
  return path.length > 1 && path.endsWith("/") ? path.slice(0, -1) : path;
}

function FaqPage({ page, locale }: { page: FaqPageContent; locale: Locale }) {
  useEffect(() => {
    document.title = `${page.title} - purupuru maker FAQ`;
    const description = document.querySelector<HTMLMetaElement>('meta[name="description"]');
    if (description) description.content = page.description;
  }, [page]);

  return (
    <div className="app-shell info-shell">
      <TopBar variant="page" locale={locale} />
      <main className="info-page">
        <p className="info-kicker">{uiText[locale].infoKicker}</p>
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
