import { EditorActions } from "./EditorActions";
import type { AppMode } from "../types";
import { localizePath, type Locale, uiText } from "../i18n";

type TopBarProps = {
  variant?: "tool" | "page";
  mode?: AppMode;
  locale?: Locale;
  hasImage?: boolean;
  isExporting?: boolean;
  onUploadClick?: () => void;
  onSetMode?: (mode: "paint" | "preview") => void;
  onExport?: () => void;
};

export function TopBar({
  variant = "tool",
  mode,
  locale = "en",
  hasImage = false,
  isExporting = false,
  onUploadClick,
  onSetMode,
  onExport,
}: TopBarProps) {
  const activeSection = getActiveSection();
  const labels = uiText[locale];

  return (
    <header className="topbar">
      <div className="brand">
        <img
          className="brand-icon"
          src="/purupurumaker-wobble-maker-icon.png"
          alt="purupuru maker wobble maker icon"
        />
        <span>purupuru maker</span>
      </div>

      <nav className="site-nav" aria-label="Primary navigation">
        <a className={activeSection === "home" ? "active" : ""} href={localizePath("/", locale)}>
          {labels.navStart}
        </a>
        <div className="nav-dropdown">
          <button
            className={activeSection === "faq" ? "active" : ""}
            type="button"
            aria-haspopup="true"
          >
            {labels.navFaq}
          </button>
          <div className="nav-menu" role="menu">
            <a href={localizePath("/what-is-purupuru-maker/", locale)} role="menuitem">
              {labels.faqWhat}
            </a>
            <a href={localizePath("/how-to-use-purupuru-maker/", locale)} role="menuitem">
              {labels.faqHow}
            </a>
            <a href={localizePath("/are-my-images-uploaded/", locale)} role="menuitem">
              {labels.faqImages}
            </a>
          </div>
        </div>
        <div className="nav-dropdown">
          <button
            className={activeSection === "terms" ? "active" : ""}
            type="button"
            aria-haspopup="true"
          >
            {labels.navTerms}
          </button>
          <div className="nav-menu" role="menu">
            <a href="/terms.html" role="menuitem">
              {labels.terms}
            </a>
            <a href="/privacy.html" role="menuitem">
              {labels.privacy}
            </a>
          </div>
        </div>
      </nav>

      {variant === "tool" && mode && onUploadClick && onSetMode && onExport && (
        <EditorActions
          mode={mode}
          hasImage={hasImage}
          isExporting={isExporting}
          locale={locale}
          labels={labels}
          onUploadClick={onUploadClick}
          onSetMode={onSetMode}
          onExport={onExport}
        />
      )}
    </header>
  );
}

function getActiveSection() {
  const path = window.location.pathname;
  if (
    path.includes("/what-is-purupuru-maker") ||
    path.includes("/how-to-use-purupuru-maker") ||
    path.includes("/are-my-images-uploaded")
  ) {
    return "faq";
  }
  if (path.endsWith("/terms.html") || path.endsWith("/privacy.html")) {
    return "terms";
  }
  return "home";
}
