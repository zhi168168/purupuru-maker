export function supportsWebgl() {
  const canvas = document.createElement("canvas");
  return Boolean(
    canvas.getContext("webgl2") ||
      canvas.getContext("webgl") ||
      canvas.getContext("experimental-webgl"),
  );
}

export function getSupportedMp4MimeType() {
  if (!("MediaRecorder" in window)) return null;

  const types = [
    "video/mp4;codecs=avc1.42E01E",
    "video/mp4;codecs=avc1.4D401E",
    "video/mp4;codecs=h264",
    "video/mp4",
  ];

  return types.find((type) => MediaRecorder.isTypeSupported(type)) ?? null;
}

export function isExportFormatSupported(format: "mp4" | "gif") {
  if (format === "gif") return true;
  return Boolean(getSupportedMp4MimeType());
}
