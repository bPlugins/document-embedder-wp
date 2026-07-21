// eslint-disable-next-line no-unused-vars
import { createRoot } from "react-dom";

import Viewer from "./components/Common/Viewer";
import "./style.scss";

// Actually mount a single embed container. Extracted so both the immediate and the
// lazy (IntersectionObserver) paths run the exact same code.
const mountEmbed = (block) => {
  // Defensive: never double-mount (immediate + IO paths, or repeated init() calls).
  if (block.hasAttribute('data-bplde-initialized')) {
     return;
  }

  let attributesData = block.dataset.attributes;
  if (!attributesData) {
      const attrEl = block.querySelector("[data-attributes]");
      if (attrEl) attributesData = attrEl.dataset.attributes;
  }

  if (!attributesData) {
      return;
  }

  block.setAttribute('data-bplde-initialized', 'true');

  try {
      const attributes = JSON.parse(attributesData);

      let userData = {};
      if (block.dataset.user) {
          userData = JSON.parse(block.dataset.user);
      }

      const pluginUrl = block.dataset.pluginUrl || "";
      const postId = parseInt(block.dataset.postId || 0, 10);

      const root = createRoot(block);
      root.render(
        <Viewer
          attributes={attributes}
          userData={userData}
          pluginUrl={pluginUrl}
          postId={postId}
          id={block.id}
        />
      );
  } catch (e) {
      console.error("Failed to initialize Document Embed block:", e);
  }
};

const init = (container = document) => {
  const blocks = container.querySelectorAll(".bplde-document-embed-frontend");

  blocks.forEach((block) => {
    if (block.hasAttribute('data-bplde-initialized')) {
       return;
    }

    // Peek at attributes just to decide immediate vs. lazy mount. mountEmbed re-parses;
    // if this fails, fall back to immediate mount so nothing silently disappears.
    let lazyLoad = false;
    try {
        const raw = block.dataset.attributes || (block.querySelector("[data-attributes]")?.dataset.attributes);
        if (raw) {
            const attrs = JSON.parse(raw);
            lazyLoad = attrs?.performance?.lazyLoad === true;
        }
    } catch (e) {
        lazyLoad = false;
    }

    if (!lazyLoad || typeof IntersectionObserver === "undefined") {
        mountEmbed(block); // existing behavior, unchanged
        return;
    }

    // Lazy: mount only once it scrolls near the viewport. One-shot, per-instance observer.
    const observer = new IntersectionObserver((entries, obs) => {
        entries.forEach((entry) => {
            if (entry.isIntersecting) {
                mountEmbed(entry.target);
                obs.unobserve(entry.target);
            }
        });
    }, { rootMargin: "200px" });

    observer.observe(block);
  });
};

// Start initialization
if (document.readyState === 'complete' || document.readyState === 'interactive') {
    init();
}

document.addEventListener("DOMContentLoaded", () => {
    init();
});

// Elementor Support
const runElementor = () => {
    if (window.elementorFrontend && window.elementorFrontend.hooks) {
        window.elementorFrontend.hooks.addAction('frontend/element_ready/global', ($scope) => {
            init($scope[0]);
        });
        return true;
    }
    return false;
};

// Robust Elementor hook registration
let elementorRetryCount = 0;
const setupElementor = () => {
    if (runElementor()) return;
    
    if (elementorRetryCount < 20) { // Retry for 10 seconds
        elementorRetryCount++;
        setTimeout(setupElementor, 500);
    }
};

setupElementor();

if (typeof jQuery !== 'undefined') {
    jQuery(window).on('elementor/frontend/init', runElementor);
}
