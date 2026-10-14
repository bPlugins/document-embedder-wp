/**
 * Page-turn settings for the Flipbook viewer (the `flipbook` block attribute) and their
 * translation into dFlip options. Every rule about which settings reach dFlip lives here.
 *
 * The Pro page-turn settings (hard cover, sound, auto play, page mode, speed, colours) are not
 * part of this plugin, so dFlip keeps its own defaults for them.
 */

export const FLIPBOOK_STYLES = ["3d", "soft", "flat"];

export const FLIPBOOK_DEFAULTS = {
  style: "3d",
  mobile2D: true,
};

/**
 * What a flipbook saved before Flip Style existed actually renders: dFlip's own default, the
 * WebGL 3D book, on phones too.
 */
const LEGACY_FLIPBOOK = {
  style: "3d",
  mobile2D: false,
};

const hasStyle = (flipbook) => !!(flipbook && typeof flipbook === "object" && FLIPBOOK_STYLES.includes(flipbook.style));

/**
 * The settings as they apply to this flipbook, for the editor controls. A flipbook without a
 * style shows the legacy values, so the controls never misrepresent how it looks.
 */
export const normalizeFlipbook = (flipbook) => {
  const fb = flipbook && typeof flipbook === "object" ? flipbook : {};
  return hasStyle(fb) ? { ...FLIPBOOK_DEFAULTS, ...fb } : { ...FLIPBOOK_DEFAULTS, ...fb, ...LEGACY_FLIPBOOK };
};

/**
 * The browser facts the mapping depends on. Read at init time, after dFlip has loaded.
 */
export const getFlipbookEnvironment = () => {
  const matches = (query) => !!(window.matchMedia && window.matchMedia(query).matches);
  const dflipUtils = window.DFLIP?.utils || {};
  return {
    isMobile: dflipUtils.isMobile === true || matches("(pointer: coarse) and (max-width: 767px)"),
    reducedMotion: matches("(prefers-reduced-motion: reduce)"),
    webgl: dflipUtils.hasWebgl !== false,
  };
};

/**
 * dFlip options for the flipbook settings, to be spread over the viewer's base options. A
 * flipbook without a style gets nothing, so it keeps exactly the options it had before the
 * setting existed.
 *
 * @param {Object} flipbook  The `flipbook` attribute (may be empty or missing).
 * @param {Object} env       { isMobile, reducedMotion, webgl }
 * @return {Object} dFlip options to merge.
 */
export const getFlipbookOptions = (flipbook, { isMobile = false, reducedMotion = false, webgl = true } = {}) => {
  if (!hasStyle(flipbook)) return {};

  const fb = normalizeFlipbook(flipbook);
  let style = fb.style;

  // dFlip falls back to its 2D renderer by itself when WebGL is missing; downgrading here as well
  // keeps the choice in one place.
  if (style === "3d" && (!webgl || (fb.mobile2D && isMobile))) style = "soft";
  // Visitors who ask the OS for reduced motion get the plain flat page turn.
  if (reducedMotion) style = "flat";

  return {
    is3D: style === "3d",
    flipbookHardPages: style === "flat" ? "all" : "none",
  };
};
