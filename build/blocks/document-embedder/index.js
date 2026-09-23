/******/ (() => { // webpackBootstrap
/******/ 	"use strict";
/******/ 	var __webpack_modules__ = ({

/***/ "./src/blocks/document-embedder/DocumentSelect.js":
/*!********************************************************!*\
  !*** ./src/blocks/document-embedder/DocumentSelect.js ***!
  \********************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   POST_TYPE: () => (/* binding */ POST_TYPE),
/* harmony export */   "default": () => (__WEBPACK_DEFAULT_EXPORT__)
/* harmony export */ });
/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! react */ "react");
/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(react__WEBPACK_IMPORTED_MODULE_0__);
/* harmony import */ var _wordpress_components__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! @wordpress/components */ "@wordpress/components");
/* harmony import */ var _wordpress_components__WEBPACK_IMPORTED_MODULE_1___default = /*#__PURE__*/__webpack_require__.n(_wordpress_components__WEBPACK_IMPORTED_MODULE_1__);
/* harmony import */ var _wordpress_data__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! @wordpress/data */ "@wordpress/data");
/* harmony import */ var _wordpress_data__WEBPACK_IMPORTED_MODULE_2___default = /*#__PURE__*/__webpack_require__.n(_wordpress_data__WEBPACK_IMPORTED_MODULE_2__);
/* harmony import */ var _wordpress_core_data__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! @wordpress/core-data */ "@wordpress/core-data");
/* harmony import */ var _wordpress_core_data__WEBPACK_IMPORTED_MODULE_3___default = /*#__PURE__*/__webpack_require__.n(_wordpress_core_data__WEBPACK_IMPORTED_MODULE_3__);
/* harmony import */ var _wordpress_element__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! @wordpress/element */ "@wordpress/element");
/* harmony import */ var _wordpress_element__WEBPACK_IMPORTED_MODULE_4___default = /*#__PURE__*/__webpack_require__.n(_wordpress_element__WEBPACK_IMPORTED_MODULE_4__);
/* harmony import */ var _wordpress_i18n__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! @wordpress/i18n */ "@wordpress/i18n");
/* harmony import */ var _wordpress_i18n__WEBPACK_IMPORTED_MODULE_5___default = /*#__PURE__*/__webpack_require__.n(_wordpress_i18n__WEBPACK_IMPORTED_MODULE_5__);
/* harmony import */ var _wordpress_html_entities__WEBPACK_IMPORTED_MODULE_6__ = __webpack_require__(/*! @wordpress/html-entities */ "@wordpress/html-entities");
/* harmony import */ var _wordpress_html_entities__WEBPACK_IMPORTED_MODULE_6___default = /*#__PURE__*/__webpack_require__.n(_wordpress_html_entities__WEBPACK_IMPORTED_MODULE_6__);

/**
 * Document picker for the Saved Document block.
 *
 * The list is fetched with the typed search term rather than a fixed slice of the
 * documents, so a site with more documents than one page still finds every one of
 * them. The document already selected is fetched on its own and merged in: without
 * that, a selection outside the current page of results would render as a blank
 * field and look lost.
 */







const POST_TYPE = 'ppt_viewer';
const PER_PAGE = 20;
const titleOf = (doc, fallbackId) => {
  var _ref, _doc$title$rendered;
  const raw = (_ref = (_doc$title$rendered = doc?.title?.rendered) !== null && _doc$title$rendered !== void 0 ? _doc$title$rendered : doc?.title) !== null && _ref !== void 0 ? _ref : '';
  const title = (0,_wordpress_html_entities__WEBPACK_IMPORTED_MODULE_6__.decodeEntities)(raw).trim();

  /* translators: %d: document ID. */
  return title || (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_5__.sprintf)((0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_5__.__)('Document #%d', 'document-emberdder'), fallbackId);
};
const DocumentSelect = ({
  value,
  onChange,
  label,
  help,
  className
}) => {
  const [search, setSearch] = (0,_wordpress_element__WEBPACK_IMPORTED_MODULE_4__.useState)('');
  const query = (0,_wordpress_element__WEBPACK_IMPORTED_MODULE_4__.useMemo)(() => ({
    per_page: PER_PAGE,
    orderby: 'title',
    order: 'asc',
    _fields: 'id,title',
    ...(search ? {
      search
    } : {})
  }), [search]);
  const {
    docs,
    isLoading,
    current
  } = (0,_wordpress_data__WEBPACK_IMPORTED_MODULE_2__.useSelect)(select => {
    const {
      getEntityRecords,
      getEntityRecord,
      isResolving
    } = select(_wordpress_core_data__WEBPACK_IMPORTED_MODULE_3__.store);
    return {
      docs: getEntityRecords('postType', POST_TYPE, query),
      isLoading: isResolving('getEntityRecords', ['postType', POST_TYPE, query]),
      current: value ? getEntityRecord('postType', POST_TYPE, value) : null
    };
  }, [query, value]);
  const options = (0,_wordpress_element__WEBPACK_IMPORTED_MODULE_4__.useMemo)(() => {
    const list = (docs || []).map(doc => ({
      value: String(doc.id),
      label: titleOf(doc, doc.id)
    }));

    // Keep the current selection selectable even when the search has filtered it out.
    if (value && !list.some(option => option.value === String(value))) {
      list.unshift({
        value: String(value),
        label: titleOf(current, value)
      });
    }
    return list;
  }, [docs, current, value]);
  const hasNoDocuments = !isLoading && !search && options.length === 0;
  return (0,react__WEBPACK_IMPORTED_MODULE_0__.createElement)("div", {
    className: className
  }, (0,react__WEBPACK_IMPORTED_MODULE_0__.createElement)(_wordpress_components__WEBPACK_IMPORTED_MODULE_1__.ComboboxControl, {
    __next40pxDefaultSize: true,
    __nextHasNoMarginBottom: true,
    label: label !== null && label !== void 0 ? label : (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_5__.__)('Select a document', 'document-emberdder'),
    help: help !== null && help !== void 0 ? help : hasNoDocuments ? (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_5__.__)('No documents yet. Create one under Document Embedder first.', 'document-emberdder') : (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_5__.__)('Start typing to search your documents.', 'document-emberdder'),
    value: value ? String(value) : null,
    options: options,
    onFilterValueChange: setSearch,
    onChange: next => onChange(parseInt(next, 10) || 0),
    placeholder: (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_5__.__)('Search documents…', 'document-emberdder'),
    allowReset: true
  }), isLoading && (0,react__WEBPACK_IMPORTED_MODULE_0__.createElement)("p", {
    className: "bplde-saved-doc__loading"
  }, (0,react__WEBPACK_IMPORTED_MODULE_0__.createElement)(_wordpress_components__WEBPACK_IMPORTED_MODULE_1__.Spinner, null), (0,react__WEBPACK_IMPORTED_MODULE_0__.createElement)("span", null, (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_5__.__)('Loading documents…', 'document-emberdder'))));
};
/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (DocumentSelect);

/***/ }),

/***/ "./src/blocks/document-embedder/Edit.js":
/*!**********************************************!*\
  !*** ./src/blocks/document-embedder/Edit.js ***!
  \**********************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (__WEBPACK_DEFAULT_EXPORT__)
/* harmony export */ });
/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! react */ "react");
/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(react__WEBPACK_IMPORTED_MODULE_0__);
/* harmony import */ var _wordpress_block_editor__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! @wordpress/block-editor */ "@wordpress/block-editor");
/* harmony import */ var _wordpress_block_editor__WEBPACK_IMPORTED_MODULE_1___default = /*#__PURE__*/__webpack_require__.n(_wordpress_block_editor__WEBPACK_IMPORTED_MODULE_1__);
/* harmony import */ var _wordpress_components__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! @wordpress/components */ "@wordpress/components");
/* harmony import */ var _wordpress_components__WEBPACK_IMPORTED_MODULE_2___default = /*#__PURE__*/__webpack_require__.n(_wordpress_components__WEBPACK_IMPORTED_MODULE_2__);
/* harmony import */ var _wordpress_element__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! @wordpress/element */ "@wordpress/element");
/* harmony import */ var _wordpress_element__WEBPACK_IMPORTED_MODULE_3___default = /*#__PURE__*/__webpack_require__.n(_wordpress_element__WEBPACK_IMPORTED_MODULE_3__);
/* harmony import */ var _wordpress_i18n__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! @wordpress/i18n */ "@wordpress/i18n");
/* harmony import */ var _wordpress_i18n__WEBPACK_IMPORTED_MODULE_4___default = /*#__PURE__*/__webpack_require__.n(_wordpress_i18n__WEBPACK_IMPORTED_MODULE_4__);
/* harmony import */ var _wordpress_api_fetch__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! @wordpress/api-fetch */ "@wordpress/api-fetch");
/* harmony import */ var _wordpress_api_fetch__WEBPACK_IMPORTED_MODULE_5___default = /*#__PURE__*/__webpack_require__.n(_wordpress_api_fetch__WEBPACK_IMPORTED_MODULE_5__);
/* harmony import */ var _DocumentSelect__WEBPACK_IMPORTED_MODULE_6__ = __webpack_require__(/*! ./DocumentSelect */ "./src/blocks/document-embedder/DocumentSelect.js");
/* harmony import */ var _settings__WEBPACK_IMPORTED_MODULE_7__ = __webpack_require__(/*! ./settings */ "./src/blocks/document-embedder/settings.js");

/**
 * Saved Document — editor view.
 *
 * The preview is the plugin's own renderer, loaded from the same nonce-guarded
 * preview route the document edit screen uses, so the block shows what a visitor
 * gets: the selected viewer engine, the toolbar and the saved dimensions. The
 * route reports its rendered height back over postMessage, which is what sizes
 * the frame here.
 */








const DOC_ICON = (0,react__WEBPACK_IMPORTED_MODULE_0__.createElement)("svg", {
  xmlns: "http://www.w3.org/2000/svg",
  viewBox: "0 0 24 24",
  width: "24",
  height: "24",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: "1.8",
  strokeLinecap: "round",
  strokeLinejoin: "round",
  "aria-hidden": "true"
}, (0,react__WEBPACK_IMPORTED_MODULE_0__.createElement)("path", {
  d: "M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"
}), (0,react__WEBPACK_IMPORTED_MODULE_0__.createElement)("polyline", {
  points: "14 2 14 8 20 8"
}), (0,react__WEBPACK_IMPORTED_MODULE_0__.createElement)("line", {
  x1: "16",
  y1: "13",
  x2: "8",
  y2: "13"
}), (0,react__WEBPACK_IMPORTED_MODULE_0__.createElement)("line", {
  x1: "16",
  y1: "17",
  x2: "8",
  y2: "17"
}));
const MIN_HEIGHT = 240;
const MAX_HEIGHT = 1400;
const Edit = ({
  attributes,
  setAttributes
}) => {
  const {
    selected,
    data: legacy
  } = attributes;

  // Content saved before the block stored the id in `selected` kept it here.
  const docId = selected || parseInt(legacy?.tringle_text, 10) || 0;
  const [isPicking, setIsPicking] = (0,_wordpress_element__WEBPACK_IMPORTED_MODULE_3__.useState)(false);
  const [previewUrl, setPreviewUrl] = (0,_wordpress_element__WEBPACK_IMPORTED_MODULE_3__.useState)('');
  const [error, setError] = (0,_wordpress_element__WEBPACK_IMPORTED_MODULE_3__.useState)('');
  const [height, setHeight] = (0,_wordpress_element__WEBPACK_IMPORTED_MODULE_3__.useState)(MIN_HEIGHT);
  const frameRef = (0,_wordpress_element__WEBPACK_IMPORTED_MODULE_3__.useRef)(null);

  // Carry a legacy id forward once, so render.php and the sidebar agree on one source.
  (0,_wordpress_element__WEBPACK_IMPORTED_MODULE_3__.useEffect)(() => {
    if (!selected && docId) {
      setAttributes({
        selected: docId
      });
    }
  }, []);
  const selectDocument = (0,_wordpress_element__WEBPACK_IMPORTED_MODULE_3__.useCallback)(next => {
    setAttributes({
      selected: next
    });
    setIsPicking(false);
  }, [setAttributes]);
  (0,_wordpress_element__WEBPACK_IMPORTED_MODULE_3__.useEffect)(() => {
    if (!docId) {
      setPreviewUrl('');
      setError('');
      return undefined;
    }
    let cancelled = false;
    setPreviewUrl('');
    setError('');
    setHeight(MIN_HEIGHT);
    _wordpress_api_fetch__WEBPACK_IMPORTED_MODULE_5___default()({
      path: `/docembedder/v1/preview-url/${docId}`
    }).then(response => {
      if (!cancelled) {
        setPreviewUrl(response?.url || '');
      }
    }).catch(err => {
      if (!cancelled) {
        setError(err?.message || (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_4__.__)('This document could not be previewed.', 'document-emberdder'));
      }
    });
    return () => {
      cancelled = true;
    };
  }, [docId]);

  // The preview page posts its rendered height; match on the frame that sent it so
  // several blocks on one page do not resize each other.
  (0,_wordpress_element__WEBPACK_IMPORTED_MODULE_3__.useEffect)(() => {
    const onMessage = event => {
      if (!frameRef.current || event.source !== frameRef.current.contentWindow) {
        return;
      }
      if (event.data?.type !== 'bplde-preview-height') {
        return;
      }
      const reported = parseInt(event.data.height, 10);
      if (reported > 0) {
        setHeight(Math.min(Math.max(reported, MIN_HEIGHT), MAX_HEIGHT));
      }
    };
    window.addEventListener('message', onMessage);
    return () => window.removeEventListener('message', onMessage);
  }, []);
  const blockProps = (0,_wordpress_block_editor__WEBPACK_IMPORTED_MODULE_1__.useBlockProps)({
    className: 'bplde-saved-doc'
  });
  if (!docId || isPicking) {
    return (0,react__WEBPACK_IMPORTED_MODULE_0__.createElement)("div", {
      ...blockProps
    }, (0,react__WEBPACK_IMPORTED_MODULE_0__.createElement)(_wordpress_components__WEBPACK_IMPORTED_MODULE_2__.Placeholder, {
      icon: DOC_ICON,
      label: (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_4__.__)('Saved Document', 'document-emberdder'),
      instructions: (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_4__.__)('Choose a document you already created. Its viewer, toolbar and size settings come with it.', 'document-emberdder'),
      className: "bplde-saved-doc__placeholder"
    }, (0,react__WEBPACK_IMPORTED_MODULE_0__.createElement)(_DocumentSelect__WEBPACK_IMPORTED_MODULE_6__["default"], {
      className: "bplde-saved-doc__picker",
      value: docId,
      onChange: selectDocument,
      label: null
    }), (0,react__WEBPACK_IMPORTED_MODULE_0__.createElement)("div", {
      className: "bplde-saved-doc__placeholder-actions"
    }, (0,react__WEBPACK_IMPORTED_MODULE_0__.createElement)(_wordpress_components__WEBPACK_IMPORTED_MODULE_2__.Button, {
      variant: "link",
      href: "post-new.php?post_type=ppt_viewer",
      target: "_blank",
      rel: "noreferrer"
    }, (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_4__.__)('Create a new document', 'document-emberdder')), isPicking && !!docId && (0,react__WEBPACK_IMPORTED_MODULE_0__.createElement)(_wordpress_components__WEBPACK_IMPORTED_MODULE_2__.Button, {
      variant: "tertiary",
      onClick: () => setIsPicking(false)
    }, (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_4__.__)('Cancel', 'document-emberdder')))));
  }
  return (0,react__WEBPACK_IMPORTED_MODULE_0__.createElement)(react__WEBPACK_IMPORTED_MODULE_0__.Fragment, null, (0,react__WEBPACK_IMPORTED_MODULE_0__.createElement)(_settings__WEBPACK_IMPORTED_MODULE_7__["default"], {
    docId: docId,
    onSelect: selectDocument
  }), (0,react__WEBPACK_IMPORTED_MODULE_0__.createElement)(_wordpress_block_editor__WEBPACK_IMPORTED_MODULE_1__.BlockControls, null, (0,react__WEBPACK_IMPORTED_MODULE_0__.createElement)(_wordpress_components__WEBPACK_IMPORTED_MODULE_2__.ToolbarGroup, null, (0,react__WEBPACK_IMPORTED_MODULE_0__.createElement)(_wordpress_components__WEBPACK_IMPORTED_MODULE_2__.ToolbarButton, {
    onClick: () => setIsPicking(true)
  }, (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_4__.__)('Change document', 'document-emberdder')))), (0,react__WEBPACK_IMPORTED_MODULE_0__.createElement)("div", {
    ...blockProps
  }, error && (0,react__WEBPACK_IMPORTED_MODULE_0__.createElement)(_wordpress_components__WEBPACK_IMPORTED_MODULE_2__.Notice, {
    status: "warning",
    isDismissible: false
  }, error), !error && !previewUrl && (0,react__WEBPACK_IMPORTED_MODULE_0__.createElement)("div", {
    className: "bplde-saved-doc__loading bplde-saved-doc__loading--stage"
  }, (0,react__WEBPACK_IMPORTED_MODULE_0__.createElement)(_wordpress_components__WEBPACK_IMPORTED_MODULE_2__.Spinner, null), (0,react__WEBPACK_IMPORTED_MODULE_0__.createElement)("span", null, (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_4__.__)('Loading preview…', 'document-emberdder'))), !error && !!previewUrl && (0,react__WEBPACK_IMPORTED_MODULE_0__.createElement)(_wordpress_components__WEBPACK_IMPORTED_MODULE_2__.Disabled, null, (0,react__WEBPACK_IMPORTED_MODULE_0__.createElement)("iframe", {
    ref: frameRef,
    className: "bplde-saved-doc__frame",
    src: previewUrl,
    title: (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_4__.__)('Document preview', 'document-emberdder'),
    style: {
      height: `${height}px`
    }
  }))));
};
/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (Edit);

/***/ }),

/***/ "./src/blocks/document-embedder/block.json":
/*!*************************************************!*\
  !*** ./src/blocks/document-embedder/block.json ***!
  \*************************************************/
/***/ ((module) => {

module.exports = /*#__PURE__*/JSON.parse('{"$schema":"https://schemas.wp.org/trunk/block.json","apiVersion":3,"name":"meta-box/document-embedder","title":"Saved Document","category":"common","icon":"media-document","description":"Place a document you already created under Document Embedder. Pick it from the list and it renders with the settings saved on that document.","keywords":["document","saved","embed","pdf","docx","xlsx","viewer","library"],"textdomain":"document-emberdder","supports":{"html":false,"align":["wide","full"]},"attributes":{"selected":{"type":"number","default":0},"data":{"type":"object"}},"example":{"attributes":{"selected":0,"data":{}}},"editorScript":["file:./index.js"],"editorStyle":"file:./index.css","render":"file:./render.php"}');

/***/ }),

/***/ "./src/blocks/document-embedder/editor.scss":
/*!**************************************************!*\
  !*** ./src/blocks/document-embedder/editor.scss ***!
  \**************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
// extracted by mini-css-extract-plugin


/***/ }),

/***/ "./src/blocks/document-embedder/settings.js":
/*!**************************************************!*\
  !*** ./src/blocks/document-embedder/settings.js ***!
  \**************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (__WEBPACK_DEFAULT_EXPORT__)
/* harmony export */ });
/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! react */ "react");
/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(react__WEBPACK_IMPORTED_MODULE_0__);
/* harmony import */ var _wordpress_components__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! @wordpress/components */ "@wordpress/components");
/* harmony import */ var _wordpress_components__WEBPACK_IMPORTED_MODULE_1___default = /*#__PURE__*/__webpack_require__.n(_wordpress_components__WEBPACK_IMPORTED_MODULE_1__);
/* harmony import */ var _wordpress_block_editor__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! @wordpress/block-editor */ "@wordpress/block-editor");
/* harmony import */ var _wordpress_block_editor__WEBPACK_IMPORTED_MODULE_2___default = /*#__PURE__*/__webpack_require__.n(_wordpress_block_editor__WEBPACK_IMPORTED_MODULE_2__);
/* harmony import */ var _wordpress_i18n__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! @wordpress/i18n */ "@wordpress/i18n");
/* harmony import */ var _wordpress_i18n__WEBPACK_IMPORTED_MODULE_3___default = /*#__PURE__*/__webpack_require__.n(_wordpress_i18n__WEBPACK_IMPORTED_MODULE_3__);
/* harmony import */ var _DocumentSelect__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! ./DocumentSelect */ "./src/blocks/document-embedder/DocumentSelect.js");






/**
 * The sidebar mirrors the picker shown in the block body, so a document can be
 * swapped from either place once one is chosen.
 */
const Settings = ({
  docId,
  onSelect
}) => (0,react__WEBPACK_IMPORTED_MODULE_0__.createElement)(_wordpress_block_editor__WEBPACK_IMPORTED_MODULE_2__.InspectorControls, null, (0,react__WEBPACK_IMPORTED_MODULE_0__.createElement)(_wordpress_components__WEBPACK_IMPORTED_MODULE_1__.PanelBody, {
  title: (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_3__.__)('Document', 'document-emberdder'),
  initialOpen: true
}, (0,react__WEBPACK_IMPORTED_MODULE_0__.createElement)(_DocumentSelect__WEBPACK_IMPORTED_MODULE_4__["default"], {
  value: docId,
  onChange: onSelect
}), (0,react__WEBPACK_IMPORTED_MODULE_0__.createElement)("p", {
  className: "bplde-saved-doc__hint"
}, (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_3__.__)('Layout, viewer, toolbar and download options come from the document itself.', 'document-emberdder')), !!docId && (0,react__WEBPACK_IMPORTED_MODULE_0__.createElement)(_wordpress_components__WEBPACK_IMPORTED_MODULE_1__.ExternalLink, {
  href: `post.php?post=${docId}&action=edit`
}, (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_3__.__)('Edit this document', 'document-emberdder'))));
/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (Settings);

/***/ }),

/***/ "@wordpress/api-fetch":
/*!**********************************!*\
  !*** external ["wp","apiFetch"] ***!
  \**********************************/
/***/ ((module) => {

module.exports = window["wp"]["apiFetch"];

/***/ }),

/***/ "@wordpress/block-editor":
/*!*************************************!*\
  !*** external ["wp","blockEditor"] ***!
  \*************************************/
/***/ ((module) => {

module.exports = window["wp"]["blockEditor"];

/***/ }),

/***/ "@wordpress/blocks":
/*!********************************!*\
  !*** external ["wp","blocks"] ***!
  \********************************/
/***/ ((module) => {

module.exports = window["wp"]["blocks"];

/***/ }),

/***/ "@wordpress/components":
/*!************************************!*\
  !*** external ["wp","components"] ***!
  \************************************/
/***/ ((module) => {

module.exports = window["wp"]["components"];

/***/ }),

/***/ "@wordpress/core-data":
/*!**********************************!*\
  !*** external ["wp","coreData"] ***!
  \**********************************/
/***/ ((module) => {

module.exports = window["wp"]["coreData"];

/***/ }),

/***/ "@wordpress/data":
/*!******************************!*\
  !*** external ["wp","data"] ***!
  \******************************/
/***/ ((module) => {

module.exports = window["wp"]["data"];

/***/ }),

/***/ "@wordpress/element":
/*!*********************************!*\
  !*** external ["wp","element"] ***!
  \*********************************/
/***/ ((module) => {

module.exports = window["wp"]["element"];

/***/ }),

/***/ "@wordpress/html-entities":
/*!**************************************!*\
  !*** external ["wp","htmlEntities"] ***!
  \**************************************/
/***/ ((module) => {

module.exports = window["wp"]["htmlEntities"];

/***/ }),

/***/ "@wordpress/i18n":
/*!******************************!*\
  !*** external ["wp","i18n"] ***!
  \******************************/
/***/ ((module) => {

module.exports = window["wp"]["i18n"];

/***/ }),

/***/ "react":
/*!************************!*\
  !*** external "React" ***!
  \************************/
/***/ ((module) => {

module.exports = window["React"];

/***/ })

/******/ 	});
/************************************************************************/
/******/ 	// The module cache
/******/ 	var __webpack_module_cache__ = {};
/******/ 	
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/ 		// Check if module is in cache
/******/ 		var cachedModule = __webpack_module_cache__[moduleId];
/******/ 		if (cachedModule !== undefined) {
/******/ 			return cachedModule.exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = __webpack_module_cache__[moduleId] = {
/******/ 			// no module.id needed
/******/ 			// no module.loaded needed
/******/ 			exports: {}
/******/ 		};
/******/ 	
/******/ 		// Execute the module function
/******/ 		__webpack_modules__[moduleId](module, module.exports, __webpack_require__);
/******/ 	
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/ 	
/************************************************************************/
/******/ 	/* webpack/runtime/compat get default export */
/******/ 	(() => {
/******/ 		// getDefaultExport function for compatibility with non-harmony modules
/******/ 		__webpack_require__.n = (module) => {
/******/ 			var getter = module && module.__esModule ?
/******/ 				() => (module['default']) :
/******/ 				() => (module);
/******/ 			__webpack_require__.d(getter, { a: getter });
/******/ 			return getter;
/******/ 		};
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/define property getters */
/******/ 	(() => {
/******/ 		// define getter functions for harmony exports
/******/ 		__webpack_require__.d = (exports, definition) => {
/******/ 			for(var key in definition) {
/******/ 				if(__webpack_require__.o(definition, key) && !__webpack_require__.o(exports, key)) {
/******/ 					Object.defineProperty(exports, key, { enumerable: true, get: definition[key] });
/******/ 				}
/******/ 			}
/******/ 		};
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/hasOwnProperty shorthand */
/******/ 	(() => {
/******/ 		__webpack_require__.o = (obj, prop) => (Object.prototype.hasOwnProperty.call(obj, prop))
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/make namespace object */
/******/ 	(() => {
/******/ 		// define __esModule on exports
/******/ 		__webpack_require__.r = (exports) => {
/******/ 			if(typeof Symbol !== 'undefined' && Symbol.toStringTag) {
/******/ 				Object.defineProperty(exports, Symbol.toStringTag, { value: 'Module' });
/******/ 			}
/******/ 			Object.defineProperty(exports, '__esModule', { value: true });
/******/ 		};
/******/ 	})();
/******/ 	
/************************************************************************/
var __webpack_exports__ = {};
// This entry needs to be wrapped in an IIFE because it needs to be isolated against other modules in the chunk.
(() => {
/*!***********************************************!*\
  !*** ./src/blocks/document-embedder/index.js ***!
  \***********************************************/
__webpack_require__.r(__webpack_exports__);
/* harmony import */ var _wordpress_blocks__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! @wordpress/blocks */ "@wordpress/blocks");
/* harmony import */ var _wordpress_blocks__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(_wordpress_blocks__WEBPACK_IMPORTED_MODULE_0__);
/* harmony import */ var _Edit__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./Edit */ "./src/blocks/document-embedder/Edit.js");
/* harmony import */ var _editor_scss__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ./editor.scss */ "./src/blocks/document-embedder/editor.scss");
/* harmony import */ var _block_json__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ./block.json */ "./src/blocks/document-embedder/block.json");




(0,_wordpress_blocks__WEBPACK_IMPORTED_MODULE_0__.registerBlockType)(_block_json__WEBPACK_IMPORTED_MODULE_3__, {
  edit: _Edit__WEBPACK_IMPORTED_MODULE_1__["default"],
  save: () => null
});
})();

/******/ })()
;
//# sourceMappingURL=index.js.map