export type Locale = "en" | "ja" | "ko" | "zh-Hant";

export type LocaleConfig = {
  code: Locale;
  label: string;
  prefix: string;
  htmlLang: string;
};

export const locales: LocaleConfig[] = [
  { code: "en", label: "English", prefix: "", htmlLang: "en" },
  { code: "ja", label: "日本語", prefix: "/ja", htmlLang: "ja" },
  { code: "ko", label: "한국어", prefix: "/ko", htmlLang: "ko" },
  { code: "zh-Hant", label: "繁體中文", prefix: "/zh-Hant", htmlLang: "zh-Hant" },
];

export const defaultLocale: Locale = "en";

export function getLocaleFromPath(pathname: string): Locale {
  if (pathname === "/ja" || pathname.startsWith("/ja/")) return "ja";
  if (pathname === "/ko" || pathname.startsWith("/ko/")) return "ko";
  if (pathname === "/zh-Hant" || pathname.startsWith("/zh-Hant/")) return "zh-Hant";
  return defaultLocale;
}

export function stripLocalePrefix(pathname: string) {
  const locale = getLocaleFromPath(pathname);
  const prefix = getLocaleConfig(locale).prefix;
  if (!prefix) return pathname;
  const stripped = pathname.slice(prefix.length);
  return stripped || "/";
}

export function localizePath(path: string, locale: Locale) {
  const prefix = getLocaleConfig(locale).prefix;
  if (path === "/") return prefix ? `${prefix}/` : "/";
  if (path.startsWith("/")) return `${prefix}${path}`;
  return `${prefix}/${path}`;
}

export function getLocaleConfig(locale: Locale) {
  return locales.find((item) => item.code === locale) ?? locales[0];
}

export function getLocalizedCurrentPath(targetLocale: Locale) {
  const normalizedPath = stripLocalePrefix(window.location.pathname);
  return localizePath(normalizedPath, targetLocale);
}

export const uiText: Record<
  Locale,
  {
    navStart: string;
    navFaq: string;
    navTerms: string;
    faqWhat: string;
    faqHow: string;
    faqImages: string;
    terms: string;
    privacy: string;
    upload: string;
    replace: string;
    paint: string;
    preview: string;
    export: string;
    emptyUpload: string;
    infoKicker: string;
  }
> = {
  en: {
    navStart: "Start",
    navFaq: "FAQ",
    navTerms: "Terms",
    faqWhat: "What is purupuru maker?",
    faqHow: "How to use purupuru maker?",
    faqImages: "Are my images uploaded?",
    terms: "Terms",
    privacy: "Privacy",
    upload: "Upload",
    replace: "Replace",
    paint: "Paint",
    preview: "Preview",
    export: "Export",
    emptyUpload: "Upload a PNG, JPEG, or WebP image",
    infoKicker: "FAQ",
  },
  ja: {
    navStart: "開始",
    navFaq: "FAQ",
    navTerms: "利用規約",
    faqWhat: "purupuru makerとは？",
    faqHow: "purupuru makerの使い方",
    faqImages: "画像はアップロードされますか？",
    terms: "利用規約",
    privacy: "プライバシー",
    upload: "アップロード",
    replace: "差し替え",
    paint: "ペイント",
    preview: "プレビュー",
    export: "書き出し",
    emptyUpload: "PNG、JPEG、WebP画像をアップロード",
    infoKicker: "FAQ",
  },
  ko: {
    navStart: "시작",
    navFaq: "FAQ",
    navTerms: "약관",
    faqWhat: "purupuru maker란?",
    faqHow: "purupuru maker 사용 방법",
    faqImages: "이미지가 업로드되나요?",
    terms: "이용약관",
    privacy: "개인정보",
    upload: "업로드",
    replace: "교체",
    paint: "칠하기",
    preview: "미리보기",
    export: "내보내기",
    emptyUpload: "PNG, JPEG 또는 WebP 이미지를 업로드하세요",
    infoKicker: "FAQ",
  },
  "zh-Hant": {
    navStart: "開始",
    navFaq: "FAQ",
    navTerms: "條款",
    faqWhat: "purupuru maker 是什麼？",
    faqHow: "如何使用 purupuru maker？",
    faqImages: "我的圖片會被上傳嗎？",
    terms: "服務條款",
    privacy: "隱私權",
    upload: "上傳",
    replace: "替換",
    paint: "繪製",
    preview: "預覽",
    export: "匯出",
    emptyUpload: "上傳 PNG、JPEG 或 WebP 圖片",
    infoKicker: "FAQ",
  },
};
