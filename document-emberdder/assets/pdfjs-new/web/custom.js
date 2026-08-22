function parseURLParams(url) {
  var queryStart = url.indexOf("?") + 1,
    queryEnd = url.indexOf("#") + 1 || url.length + 1,
    query = url.slice(queryStart, queryEnd - 1),
    pairs = query.replace(/\+/g, " ").split("&"),
    parms = {},
    i,
    n,
    v,
    nv;

  if (query === url || query === "") return {};

  for (i = 0; i < pairs.length; i++) {
    nv = pairs[i].split("=", 2);
    n = decodeURIComponent(nv[0]);
    v = decodeURIComponent(nv[1]);

    // eslint-disable-next-line no-prototype-builtins
    if (!parms.hasOwnProperty(n)) parms[n] = [];
    parms[n] = nv.length === 2 ? v : null;
  }
  return parms;
}

// Intercept window.PDFViewerApplicationOptions definition to set options early
let optionsInstance;
Object.defineProperty(window, "PDFViewerApplicationOptions", {
  get() {
    return optionsInstance;
  },
  set(value) {
    optionsInstance = value;
    if (optionsInstance && typeof optionsInstance.setAll === "function") {
      const parseURL = parseURLParams(location.href);
      var annotationModeVal = parseURL.annotationMode !== undefined ? parseInt(parseURL.annotationMode) : 1;
      var externalLinkTargetVal = parseURL.openLinksInNewTab === "1" ? 2 : 4;
      optionsInstance.setAll({
        cMapUrl: "cmaps/",
        cMapPacked: true,
        standardFontDataUrl: "standard_fonts/",
        annotationMode: annotationModeVal,
        externalLinkTarget: externalLinkTargetVal,
      });
    }
  },
  configurable: true,
});

document.addEventListener("DOMContentLoaded", function () {
  const parseURL = parseURLParams(location.href);

  // Set values on pdfLinkService once it initializes
  const linkServiceInterval = setInterval(() => {
    if (window.PDFViewerApplication && window.PDFViewerApplication.pdfLinkService) {
      clearInterval(linkServiceInterval);
      var externalLinkTargetVal = parseURL.openLinksInNewTab === "1" ? 2 : 4;
      window.PDFViewerApplication.pdfLinkService.externalLinkTarget = externalLinkTargetVal;
    }
  }, 50);

  // Full-Screen (Presentation Mode) button — custom PDF viewer only, opt-in via &fullscreenBtn=1.
  // pdf.js ships a Presentation Mode button, but (1) it lives inside the Tools (secondary) menu,
  // and (2) pdf.js adds the `hidden` class + skips init when the Fullscreen API is unavailable
  // (which requires the embedding iframe to carry allowfullscreen). The iframe now sets that, so
  // here we just un-hide the button and lift it onto the main toolbar so it's actually visible.
  if (parseURL.fullscreenBtn === "1") {
    const fsInterval = setInterval(() => {
      if (window.PDFViewerApplication && window.PDFViewerApplication.pdfViewer) {
        clearInterval(fsInterval);
        const presentationBtn = document.getElementById("presentationMode");
        const toolbarRight = document.getElementById("toolbarViewerRight");
        const secondaryToggle = document.getElementById("secondaryToolbarToggle");
        if (presentationBtn) {
          presentationBtn.classList.remove("hidden");
          // Drop the "labeled" style so it renders icon-only like the other main-toolbar buttons.
          presentationBtn.classList.remove("labeled");
          // Moving the DOM node preserves pdf.js's click handler bound to this element.
          if (toolbarRight && secondaryToggle) {
            toolbarRight.insertBefore(presentationBtn, secondaryToggle);
          }
        }
      }
    }, 50);
  }

  // On-Demand page rendering queue — custom PDF viewer only, opt-in via &onDemandRender=1.
  // Keeps only pages within RENDER_WINDOW of the current page rendered; pdf.js re-renders
  // evicted pages automatically when they scroll back into view. Additive: does nothing unless enabled.
  if (parseURL.onDemandRender === "1") {
    const renderInterval = setInterval(() => {
      if (window.PDFViewerApplication && window.PDFViewerApplication.pdfViewer && window.PDFViewerApplication.eventBus) {
        clearInterval(renderInterval);
        const viewer = window.PDFViewerApplication.pdfViewer;
        const RENDER_WINDOW = 2; // pages ahead/behind to keep rendered

        window.PDFViewerApplication.eventBus.on("pagechanging", (evt) => {
          const current = evt.pageNumber;
          (viewer._pages || []).forEach((pageView, idx) => {
            const pageNum = idx + 1;
            const withinWindow = Math.abs(pageNum - current) <= RENDER_WINDOW;
            if (!withinWindow && pageView && pageView.renderingState === 3 /* FINISHED */) {
              pageView.reset(); // frees canvas memory, pdf.js re-renders on scroll-back
            }
          });
        });
      }
    }, 50);
  }

  // Open-in-new-tab (full-screen in a new browser tab) button — custom PDF viewer only, opt-in via &newTabBtn=1.
  // Opens the current viewer URL as a top-level tab, where the PDF fills the whole window.
  if (parseURL.newTabBtn === "1") {
    const ntInterval = setInterval(() => {
      if (window.PDFViewerApplication && window.PDFViewerApplication.pdfViewer) {
        clearInterval(ntInterval);
        const toolbarRight = document.getElementById("toolbarViewerRight");
        const secondaryToggle = document.getElementById("secondaryToolbarToggle");
        if (toolbarRight && secondaryToggle && !document.getElementById("bpldeNewTabButton")) {
          const btn = document.createElement("button");
          btn.id = "bpldeNewTabButton";
          btn.type = "button";
          btn.className = "toolbarButton";
          btn.title = "Open in New Tab";
          btn.setAttribute("aria-label", "Open in New Tab");
          btn.innerHTML =
            '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path><polyline points="15 3 21 3 21 9"></polyline><line x1="10" y1="14" x2="21" y2="3"></line></svg>';
          btn.addEventListener("click", () => {
            const target = new URL(location.href);
            // Drop the flag so the new tab doesn't re-show this button.
            target.searchParams.delete("newTabBtn");
            window.open(target.href, "_blank", "noopener");
          });
          toolbarRight.insertBefore(btn, secondaryToggle);
        }
      }
    }, 50);
  }

  // const pdfjsHistory = JSON.parse(window.localStorage.getItem("pdfjs.history"))?.files.find((item) => item.fingerprint === window.PDFViewerApplication?.store?.file?.fingerprint);
  const openFile = document.getElementById("openFile");
  const sidebarToggle = document.getElementById("sidebarToggleButton");
  const print = document.getElementById("printButton");
  const download = document.getElementById("downloadButton");
  const secondaryOpenFile = document.getElementById("secondaryOpenFile");
  const secondaryPrint = document.getElementById("secondaryPrint");
  const secondaryDownload = document.getElementById("secondaryDownload");
  // const viewerContainer = document.getElementById("viewerContainer");
  // const outerContainer = document.getElementById("outerContainer");
  // const toolbar = document.querySelector(".toolbar");
  const presentationMode = document.querySelectorAll(".presentationMode");
  // const pdfViewer = document.querySelector(".pdfViewer");
  // const scrollHorizontalButton = document.getElementById("scrollHorizontal");
  // const scrollVerticalButton = document.getElementById("scrollVertical");
  const documentProperties = document.getElementById("documentPropertiesDialog");
  const editorModeButtons = document.getElementById("editorModeButtons");

  let css = "";
  if (parseURL?.raw) {
    css = `:root{--scrollbar-bg-color:transparent;} body {background:transparent} .toolbar {display: none} .bottombar {display: none} .pdfViewer .page {border-image: url()} #viewerContainer{top:0} `;
    // pdfjsHistory.files[0].sidebarView = 0;
  }
  if (parseURL?.hrscroll) {
    css += ".bottombar{display: none;}";
  }

  // "Open in new tab" button — suppress the default toolbarButton icon square and size our inline SVG.
  if (parseURL?.newTabBtn === "1") {
    css += "#bpldeNewTabButton::before{display:none !important;} #bpldeNewTabButton{cursor:pointer;} #bpldeNewTabButton svg{width:var(--icon-size, 16px);height:var(--icon-size, 16px);display:block;}";
  }

  if (parseURL?.toolbar_theme) {
    const theme = parseURL.toolbar_theme;
    const bgColor = parseURL.toolbar_bg_color || "#343434";
    const textColor = parseURL.toolbar_text_color || "#ffffff";

    if (theme === "light") {
      css += `
        :root {
          --toolbar-bg-color: #f8fafc !important;
          --sidebar-toolbar-bg-color: #f8fafc !important;
          --main-color: #0f172a !important;
          --toolbar-icon-bg-color: #0f172a !important;
          --toolbar-icon-hover-bg-color: #000000 !important;
          --toggled-btn-color: #000000 !important;
        }
        #toolbarContainer, #findbar, #secondaryToolbar {
          background-color: #f8fafc !important;
          border-bottom: 1px solid #e2e8f0 !important;
          color: #0f172a !important;
        }
        .toolbarField, .toolbarLabel, #numPages {
          color: #0f172a !important;
        }
        .toolbarField {
          background-color: #e2e8f0 !important;
          color: #0f172a !important;
          border: 1px solid #cbd5e1 !important;
        }
        .splitToolbarButtonSeparator {
          background-color: #cbd5e1 !important;
        }
      `;
    } else if (theme === "dark") {
      css += `
        :root {
          --toolbar-bg-color: #343434 !important;
          --sidebar-toolbar-bg-color: #343434 !important;
          --main-color: #ffffff !important;
          --toolbar-icon-bg-color: #ffffff !important;
          --toolbar-icon-hover-bg-color: #ffffff !important;
          --toggled-btn-color: #ffffff !important;
        }
        #toolbarContainer, #findbar, #secondaryToolbar {
          background-color: #343434 !important;
          border-bottom: 1px solid #444444 !important;
          color: #ffffff !important;
        }
        .toolbarField, .toolbarLabel, #numPages {
          color: #ffffff !important;
        }
        .toolbarField {
          background-color: #444444 !important;
          color: #ffffff !important;
          border: 1px solid #555555 !important;
        }
        .splitToolbarButtonSeparator {
          background-color: #555555 !important;
        }
      `;
    } else if (theme === "custom") {
      css += `
        :root {
          --toolbar-bg-color: ${bgColor} !important;
          --sidebar-toolbar-bg-color: ${bgColor} !important;
          --main-color: ${textColor} !important;
          --toolbar-icon-bg-color: ${textColor} !important;
          --toolbar-icon-hover-bg-color: ${textColor} !important;
          --toggled-btn-color: ${textColor} !important;
        }
        #toolbarContainer, #findbar, #secondaryToolbar {
          background-color: ${bgColor} !important;
          border-bottom: 1px solid ${bgColor} !important;
          color: ${textColor} !important;
        }
        .toolbarField, .toolbarLabel, #numPages {
          color: ${textColor} !important;
        }
        .toolbarField {
          background-color: rgba(0, 0, 0, 0.1) !important;
          color: ${textColor} !important;
          border: 1px solid rgba(255, 255, 255, 0.2) !important;
        }
        .splitToolbarButtonSeparator {
          background-color: ${textColor} !important;
          opacity: 0.3 !important;
        }
      `;
    }
  }

  const style = document.createElement("style");
  style.innerHTML = css;
  document.querySelector("head").appendChild(style);

  setInterval(() => {
    const canvases = document.querySelectorAll(".canvasWrapper canvas");
    canvases.forEach((canvas) => {
      canvas.toDataURL = () => console.warn("no cheating!");
      canvas.getContext = () => console.warn("no cheating!");
    });
  }, 3000);

  if (sidebarToggle) {
    const shouldOpen = parseURL.open === "true";
    const interval = setInterval(() => {
      if (window.PDFViewerApplication.pdfSidebar.isInitialEventDispatched) {
        if (shouldOpen) {
          window.PDFViewerApplication.pdfSidebar.open();
        } else {
          window.PDFViewerApplication.pdfSidebar.close();
        }
        clearInterval(interval);
      }
    }, 300);
  }

  if (openFile && parseURL?.open) {
    openFile.style.display = "none";
  }

  // rmove print button
  if (parseURL?.stdono != "vera") {
    window.print = () => {
      console.warn("Print disabled!");
    };
    print?.parentNode.removeChild(print);
    secondaryPrint?.parentNode.removeChild(secondaryPrint);
  }

  // remove right sidebar toolbar
  if (parseURL?.isHideRightToolbar === "true" && editorModeButtons) {

    editorModeButtons.parentNode.removeChild(editorModeButtons);
  }


  if (download && parseURL?.nobaki != "vera") {
    window.addEventListener("selectstart", function (e) {
      e.preventDefault();
      console.warn("Content selection disabled!");
    });

    setTimeout(() => {
      documentProperties?.parentNode.removeChild(documentProperties);
    }, 1000);
    download?.parentNode.removeChild(download);
    secondaryDownload?.parentNode.removeChild(secondaryDownload);
  }

  if (secondaryOpenFile && parseURL?.open) {
    secondaryOpenFile.style.display = "none";
  }

  if (presentationMode && parseURL?.fullscreen != "1" && parseURL?.fullscreenBtn != "1") {
    Object.values(presentationMode).map((item) => {
      item.style.display = "none";
    });
    // presentationMode.style.display = "none";
  }

  if (location.href.includes("blob:")) {
    download?.parentNode?.removeChild(download);
    secondaryDownload?.parentNode?.removeChild(secondaryDownload);
  }

  //sidebar toggle
  if (sidebarToggle && parseURL?.side != "true") {
    sidebarToggle.style.display = "none";
  }

  //raw css

  const interval = setInterval(() => {
    if (window.PDFViewerApplication.store?.fingerprint) {
      // PDF loaded - clear interval
      clearInterval(interval);

      // change scroll behavior
      setTimeout(() => {
        if (parseURL?.hrscroll === "vera") {
          window.PDFViewerApplication.appConfig.secondaryToolbar.scrollHorizontalButton.click();
        } else {
          window.PDFViewerApplication.appConfig.secondaryToolbar.scrollVerticalButton.click();
        }

        // update zoom level
        if (parseURL.z) {
          window.PDFViewerApplication.pdfViewer.currentScaleValue = parseURL.z ? parseURL.z : "auto";
        }
      }, 100);
    }
  }, 100);

  const disableKey = (e) => {
    if (((e.ctrlKey || e.metaKey) && e.key === "s") || e.key === "F12") {
      e.preventDefault();
      e.stopPropagation();
      alert("Saving is disabled on this page");
      return false;
    } else {
      return true;
    }
  };

  document.addEventListener("keydown", disableKey);
  window.addEventListener("keydown", disableKey);
  document.addEventListener("contextmenu", function (e) {
    e.preventDefault();
  });

  // Listen for PDF.js errors
  const errorInterval = setInterval(() => {
    if (window.PDFViewerApplication && window.PDFViewerApplication.eventBus) {
      clearInterval(errorInterval);

      // Listen for document load errors
      window.PDFViewerApplication.eventBus._on("documenterror", (e) => {
        window.parent.postMessage({
          type: "PDFP_ERROR",
          message: e.message || "An error occurred while loading the PDF."
        }, "*");
      });

      // Listen for other silent failures if possible
      window.PDFViewerApplication.eventBus._on("pagerendererror", (e) => {
        console.error("PDF.js render error:", e);
      });
    }
  }, 500);

  // window.localStorage.setItem('pdfjs.history', JSON.stringify(pdfjsHistory));
});
