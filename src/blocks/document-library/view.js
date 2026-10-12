import { createRoot } from "react-dom/client";
import "./style.scss";
import "./Skeleton.scss";
import FrontendDocLibrary from "./Components/Frontend/FrontendDocLibrary";

const init = (container = document) => {
  const documentLibraryBlockEls = container.querySelectorAll(
    ".wp-block-bpldl-document-library"
  );

  documentLibraryBlockEls.forEach((documentLibraryBlockEl) => {
    // Never double-mount: DOMContentLoaded and the Elementor hook can both reach the same block.
    if (documentLibraryBlockEl.hasAttribute("data-bpldl-initialized")) {
      return;
    }
    documentLibraryBlockEl.setAttribute("data-bpldl-initialized", "true");

    const postData = JSON.parse(documentLibraryBlockEl.dataset.postData);

    createRoot(documentLibraryBlockEl).render(
      <>
        <FrontendDocLibrary
          attributes={postData}
          id={documentLibraryBlockEl.id}
        />
      </>
    );

    documentLibraryBlockEl?.removeAttribute("data-postData");
  });
};

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", () => init());
} else {
  init();
}

// Elementor renders widgets after page load (and re-renders them on every edit in the
// editor), so mount whatever each newly ready element contains.
const runElementor = () => {
  if (window.elementorFrontend && window.elementorFrontend.hooks) {
    window.elementorFrontend.hooks.addAction("frontend/element_ready/global", ($scope) => {
      init($scope[0]);
    });
    return true;
  }
  return false;
};

let elementorHooked = false;
let elementorRetryCount = 0;
const setupElementor = () => {
  if (elementorHooked) return;
  if (runElementor()) {
    elementorHooked = true;
    return;
  }
  if (elementorRetryCount < 20) {
    elementorRetryCount++;
    setTimeout(setupElementor, 500);
  }
};

setupElementor();

if (typeof jQuery !== "undefined") {
  jQuery(window).on("elementor/frontend/init", setupElementor);
}
