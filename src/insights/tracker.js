/**
 * Document Insights tracker.
 *
 * Only enqueued on pages whose markup carries a signed key, and it reports only against
 * those keys, so the browser can never invent a document the server did not issue.
 */
const config = window.bpldeInsights || {};

const BATCH = 20;
const SEEN_MS = 1000;
const IDLE_MS = 5000;
const MIN_DWELL_MS = 1000;
const DWELL_CAP_MS = 30 * 60 * 1000;
const THRESHOLDS = Array.from({ length: 21 }, (_, i) => i / 20);
const EMBED = ".bplde-document-embed-frontend[data-bplde-doc]";

const isEditorOrPreview = () =>
  /[?&](bplde_preview|elementor-preview|preview)=/.test(
    window.location.search,
  ) ||
  document.body.classList.contains("wp-admin") ||
  document.body.classList.contains("elementor-editor-active") ||
  navigator.webdriver === true;

// One id per page load. Validated by the server but not stored in this version.
const session = (() => {
  const bytes = new Uint8Array(8);
  window.crypto.getRandomValues(bytes);
  return Array.from(bytes, (b) => b.toString(16).padStart(2, "0")).join("");
})();

let queue = [];
let idleTimer = 0;

const send = (events) => {
  const body = JSON.stringify({ session, events });

  try {
    if (
      navigator.sendBeacon &&
      navigator.sendBeacon(
        config.url,
        new Blob([body], { type: "application/json" }),
      )
    ) {
      return;
    }
  } catch (e) {
    // fall through to fetch
  }

  try {
    fetch(config.url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body,
      keepalive: true,
      credentials: "same-origin",
    }).catch(() => {});
  } catch (e) {
    // Counting must never break the page.
  }
};

const flush = () => {
  clearTimeout(idleTimer);
  idleTimer = 0;
  while (queue.length) {
    send(queue.splice(0, BATCH));
  }
};

const push = (el, type, extra = {}, immediate = false) => {
  queue.push({
    doc: el.getAttribute("data-bplde-doc"),
    sig: el.getAttribute("data-bplde-sig"),
    origin: parseInt(el.getAttribute("data-bplde-origin") || "0", 10) || 0,
    type,
    ...extra,
  });

  if (immediate || queue.length >= BATCH) {
    flush();
  } else if (!idleTimer) {
    idleTimer = setTimeout(flush, IDLE_MS);
  }
};

/* Views and time on screen ------------------------------------------------------------ */

const embeds = new Map();

// Half of the embed, or half of the window for an embed taller than the window, so a
// full-height viewer still counts.
const isHalfVisible = (entry) => {
  const shown = entry.intersectionRect.height;
  return (
    entry.isIntersecting &&
    shown > 0 &&
    (shown / entry.boundingClientRect.height >= 0.5 ||
      shown / window.innerHeight >= 0.5)
  );
};

// Moves the running clock into the total, and restarts it only while the embed is on
// screen in a visible tab.
const tick = (state) => {
  const now = performance.now();
  if (state.since) {
    state.dwell += now - state.since;
    state.since = 0;
  }
  if (state.onScreen && document.visibilityState === "visible") {
    state.since = now;
  }
};

let observer = null;

const onIntersect = (entries) => {
  entries.forEach((entry) => {
    const state = embeds.get(entry.target);
    if (!state) return;

    state.onScreen = isHalfVisible(entry);
    tick(state);

    if (state.onScreen && !state.viewed && !state.viewTimer) {
      state.viewTimer = setTimeout(() => {
        state.viewTimer = 0;
        if (state.onScreen && document.visibilityState === "visible") {
          state.viewed = true;
          push(state.wrapper, "view");
        }
      }, SEEN_MS);
    } else if (!state.onScreen && state.viewTimer) {
      clearTimeout(state.viewTimer);
      state.viewTimer = 0;
    }
  });
};

// The viewer mounts asynchronously (and lazily, when lazy loading is on). In a lightbox
// the document is only on screen while the lightbox is open, so that is what is observed.
const resolveTarget = (wrapper) => {
  const container = wrapper.querySelector(".ppv_container");
  if (!container) return null;
  return (
    (container.hasAttribute("data-lightbox") &&
      container.querySelector(".bplde-lightbox")) ||
    container
  );
};

const pending = new Set();

const scan = () => {
  document.querySelectorAll(EMBED).forEach((wrapper) => {
    if (!wrapper.hasAttribute("data-bplde-tracked")) {
      wrapper.setAttribute("data-bplde-tracked", "");
      pending.add(wrapper);
    }
  });

  pending.forEach((wrapper) => {
    const target = resolveTarget(wrapper);
    if (!target) return;
    pending.delete(wrapper);
    embeds.set(target, {
      wrapper,
      onScreen: false,
      viewed: false,
      viewTimer: 0,
      since: 0,
      dwell: 0,
      sent: 0,
    });
    observer.observe(target);
  });
};

const queueDwell = () => {
  embeds.forEach((state) => {
    tick(state);
    const amount = Math.min(Math.round(state.dwell), DWELL_CAP_MS - state.sent);
    if (state.viewed && amount >= MIN_DWELL_MS) {
      queue.push({
        doc: state.wrapper.getAttribute("data-bplde-doc"),
        sig: state.wrapper.getAttribute("data-bplde-sig"),
        type: "dwell",
        value: amount,
      });
      state.sent += amount;
      state.dwell = 0;
    }
  });
};

const leave = () => {
  queueDwell();
  flush();
};

/* Clicks -------------------------------------------------------------------------------- */

// Capture phase, so a viewer handler that stops propagation cannot hide the click.
const onClick = (event) => {
  const target = event.target instanceof Element ? event.target : null;
  const holder = target && target.closest("[data-bplde-doc]");
  if (!holder) return;

  // A Document Library download control: a direct link no server endpoint sees.
  if (!holder.matches(EMBED)) {
    push(holder, "download", {}, true);
    return;
  }

  if (target.closest(".ppv_fullscreen_bttn")) {
    push(holder, "fullscreen", {}, true);
  } else if (
    target.closest(".ppv_download_bttn") &&
    (holder.hasAttribute("data-bplde-dl") ||
      target.closest(".ppv-preview-unavailable"))
  ) {
    push(holder, "download", {}, true);
  }
};

const start = () => {
  if (
    !config.url ||
    isEditorOrPreview() ||
    typeof IntersectionObserver === "undefined"
  )
    return;

  observer = new IntersectionObserver(onIntersect, { threshold: THRESHOLDS });
  scan();

  let scheduled = false;
  new MutationObserver(() => {
    if (scheduled) return;
    scheduled = true;
    requestAnimationFrame(() => {
      scheduled = false;
      scan();
    });
  }).observe(document.body, { childList: true, subtree: true });

  document.addEventListener("click", onClick, true);
  document.addEventListener("visibilitychange", () => {
    embeds.forEach(tick);
    if (document.visibilityState === "hidden") leave();
  });
  window.addEventListener("pagehide", leave);
};

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", start);
} else {
  start();
}
