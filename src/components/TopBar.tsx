import { EditorActions } from "./EditorActions";
import type { AppMode } from "../types";

type TopBarProps = {
  variant?: "tool" | "page";
  mode?: AppMode;
  hasImage?: boolean;
  isExporting?: boolean;
  onUploadClick?: () => void;
  onSetMode?: (mode: "paint" | "preview") => void;
  onExport?: () => void;
};

export function TopBar({
  variant = "tool",
  mode,
  hasImage = false,
  isExporting = false,
  onUploadClick,
  onSetMode,
  onExport,
}: TopBarProps) {
  const activeSection = getActiveSection();

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
        <a className={activeSection === "home" ? "active" : ""} href="/">
          Start
        </a>
        <div className="nav-dropdown">
          <button
            className={activeSection === "faq" ? "active" : ""}
            type="button"
            aria-haspopup="true"
          >
            FAQ
          </button>
          <div className="nav-menu" role="menu">
            <a href="/what-is-purupuru-maker/" role="menuitem">
              What is purupuru maker?
            </a>
            <a href="/how-to-use-purupuru-maker/" role="menuitem">
              How to use purupuru maker?
            </a>
            <a href="/are-my-images-uploaded/" role="menuitem">
              Are my images uploaded?
            </a>
          </div>
        </div>
        <div className="nav-dropdown">
          <button
            className={activeSection === "terms" ? "active" : ""}
            type="button"
            aria-haspopup="true"
          >
            Terms
          </button>
          <div className="nav-menu" role="menu">
            <a href="/terms.html" role="menuitem">
              Terms
            </a>
            <a href="/privacy.html" role="menuitem">
              Privacy
            </a>
          </div>
        </div>
      </nav>

      {variant === "tool" && mode && onUploadClick && onSetMode && onExport && (
        <EditorActions
          mode={mode}
          hasImage={hasImage}
          isExporting={isExporting}
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
