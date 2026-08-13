/******/ (() => { // webpackBootstrap
/******/ 	"use strict";
/******/ 	var __webpack_modules__ = ({

/***/ "./src/blocks/kahf-banner-k27f/Edit.js":
/*!*********************************************!*\
  !*** ./src/blocks/kahf-banner-k27f/Edit.js ***!
  \*********************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (__WEBPACK_DEFAULT_EXPORT__)
/* harmony export */ });
/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! react */ "react");
/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(react__WEBPACK_IMPORTED_MODULE_0__);
/* harmony import */ var _settings__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./settings */ "./src/blocks/kahf-banner-k27f/settings.js");

const {
  Fragment
} = wp.element;
const {
  withSelect
} = wp.data;
const {
  compose
} = wp.compose;

const Edit = props => {
  // return false;
  const {
    attributes,
    docs
  } = props;
  const {
    postName
  } = attributes;
  // const [data, setData] = useState();
  // let id = 0;
  // const regax = postName.match(/\[doc id='?(\d+)'?\]/);
  // if (typeof regax[1] == "undefined") {
  //   id = 0;
  // }
  // id = regax[1];
  // useEffect(() => {
  //   if (!selected) {
  //     setAttributes({ selected: parseInt(tringle_text) });
  //   }
  // }, []);

  // if (!data) {
  //   jQuery.get(ppvBlocks?.siteUrl + "/wp-json/doc/v1/single/" + id, function (res) {
  //     setData(res);
  //   });
  // }
  let selectBox;
  let selected = "";
  if (docs) {
    selectBox = docs.map(item => {
      if (postName === `[doc id=${item?.id}]`) {
        selected = item?.title?.rendered;
      }
      return {
        label: item?.title?.rendered,
        value: `[doc id=${item?.id}]`
      };
    });
    selectBox = [{
      label: "Select",
      value: null
    }, ...selectBox];
  }

  // const base_url = "//docs.google.com/gview?embedded=true&url=";

  return (0,react__WEBPACK_IMPORTED_MODULE_0__.createElement)(Fragment, null, (0,react__WEBPACK_IMPORTED_MODULE_0__.createElement)(_settings__WEBPACK_IMPORTED_MODULE_1__["default"], {
    props: props
  }), (0,react__WEBPACK_IMPORTED_MODULE_0__.createElement)("h3", {
    style: {
      background: "#fff",
      padding: "2px 10px"
    }
  }, " ", !selected && "Select a document", " ", selected));
};
/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (compose([withSelect(select => {
  const docs = select("core").getEntityRecords("postType", "ppt_viewer", {
    per_page: 100
  });
  return {
    docs
  };
})])(Edit));

/***/ }),

/***/ "./src/blocks/kahf-banner-k27f/Save.js":
/*!*********************************************!*\
  !*** ./src/blocks/kahf-banner-k27f/Save.js ***!
  \*********************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (__WEBPACK_DEFAULT_EXPORT__)
/* harmony export */ });
const Save = props => {
  const {
    attributes
  } = props;
  const {
    postName
  } = attributes;
  return postName;
};
/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (Save);

/***/ }),

/***/ "./src/blocks/kahf-banner-k27f/attributes.js":
/*!***************************************************!*\
  !*** ./src/blocks/kahf-banner-k27f/attributes.js ***!
  \***************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (__WEBPACK_DEFAULT_EXPORT__)
/* harmony export */ });
const attributes = {
  postName: {
    type: "string",
    source: "html"
  }
};
/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (attributes);

/***/ }),

/***/ "./src/blocks/kahf-banner-k27f/index.js":
/*!**********************************************!*\
  !*** ./src/blocks/kahf-banner-k27f/index.js ***!
  \**********************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony import */ var _attributes__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./attributes */ "./src/blocks/kahf-banner-k27f/attributes.js");
/* harmony import */ var _Edit__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./Edit */ "./src/blocks/kahf-banner-k27f/Edit.js");
/* harmony import */ var _Save__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ./Save */ "./src/blocks/kahf-banner-k27f/Save.js");



const {
  __
} = wp.i18n;
const {
  registerBlockType
} = wp.blocks;
// import Edit from "./Edit";
registerBlockType("kahf-kit/kahf-banner-k27f", {
  title: __("Documenter Embedder", "ppv"),
  icon: "media-document",
  category: "common",
  keywords: [__("Documenter Embedder", "ppv"), __("Document", "ppv")],
  //   supports: {
  //     align: ["wide", "full"],
  //   },
  attributes: _attributes__WEBPACK_IMPORTED_MODULE_0__["default"],
  parent: ["lsdkf/lsdkfjlsd"],
  // invalid parent due to disable for new users but it will work for old users;
  getEditWrapperProps: () => {},
  edit: _Edit__WEBPACK_IMPORTED_MODULE_1__["default"],
  save: _Save__WEBPACK_IMPORTED_MODULE_2__["default"],
  example: {
    attributes: true
  }
});

/***/ }),

/***/ "./src/blocks/kahf-banner-k27f/settings.js":
/*!*************************************************!*\
  !*** ./src/blocks/kahf-banner-k27f/settings.js ***!
  \*************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (__WEBPACK_DEFAULT_EXPORT__)
/* harmony export */ });
/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! react */ "react");
/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(react__WEBPACK_IMPORTED_MODULE_0__);

const {
  Panel,
  PanelBody,
  SelectControl
} = wp.components;
const {
  InspectorControls
} = wp.blockEditor;
const {
  withSelect
} = wp.data;
const {
  compose
} = wp.compose;
const Settings = props => {
  const {
    props: {
      attributes,
      setAttributes
    },
    docs
  } = props;
  const {
    postName
  } = attributes;
  let selectBox;
  if (docs) {
    selectBox = docs.map(item => {
      return {
        label: item?.title?.rendered,
        value: `[doc id=${item?.id}]`
      };
    });
    selectBox = [{
      label: "Select",
      value: null
    }, ...selectBox];
  }
  return (0,react__WEBPACK_IMPORTED_MODULE_0__.createElement)(InspectorControls, {
    style: {
      marginBottom: "40px"
    }
  }, (0,react__WEBPACK_IMPORTED_MODULE_0__.createElement)(Panel, null, (0,react__WEBPACK_IMPORTED_MODULE_0__.createElement)(PanelBody, null, (0,react__WEBPACK_IMPORTED_MODULE_0__.createElement)(SelectControl, {
    label: "Size",
    value: postName,
    options: selectBox,
    onChange: postName => setAttributes({
      postName
    })
  }))));
};
/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (compose([withSelect(select => {
  const docs = select("core").getEntityRecords("postType", "ppt_viewer", {
    per_page: 100
  });
  return {
    docs
  };
})])(Settings));

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
/*!******************************!*\
  !*** ./src/blocks/editor.js ***!
  \******************************/
__webpack_require__.r(__webpack_exports__);
/* harmony import */ var _kahf_banner_k27f__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./kahf-banner-k27f */ "./src/blocks/kahf-banner-k27f/index.js");

})();

/******/ })()
;
//# sourceMappingURL=editor.js.map