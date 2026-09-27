// Defaults for local Settings
export const defaultValues = {
  title: "Document Library Title",
  settings: {
    header: {
      isDisplayHeader: true,
      title: "Document Library",
      description: "The default subtitle text for my Document Library.",
      textAlign: "left",
    },
    documentLibrary: {
      docItems: [],
      docsViewPerRow: 3,
      rowGap: 20,
      bgColor: "transparent",
      padding: {
        top: "20px",
        bottom: "0px",
        left: "0px",
        right: "0px",
      },
      toolbarBox: {
        isDisplayToolbar: true,
        isDisplayFilterType: true,
        isDisplaySearchBox: true,
        isDisplaySortBy: true,
        padding: {
          top: "0px",
          bottom: "0px",
          left: "0px",
          right: "0px",
        },
        bgColor: "transparent",
      },
      documentBox: {
        options: {
          displaySize: true,
          displayDate: true,
          displayAuthor: true,
          displayDescription: true,
          displayIcon: true,
        },
        fileNameColor: { normal: "#000000", hover: "#0f766e" },
        sizeColor: { normal: "#000000", hover: "#0f766e" },
        dateColor: { normal: "#000000", hover: "#0f766e" },
        bgColor: { normal: "#fff", hover: "#fff" },
        iconColor: { normal: "#000000", hover: "#0f766e" },
        downloadButton: {
          isDisplay: true,
          isText: true,
          text: "Download",
          bgColor: { normal: "#0f766e", hover: "#0b5a54" },
          textColor: { normal: "#ffffff", hover: "#ffffff" },
        },
        viewButton: {
          isDisplay: true,
          isText: true,
          text: "View",
          bgColor: { normal: "#0f766e", hover: "#0b5a54" },
          textColor: { normal: "#ffffff", hover: "#ffffff" },
          typo: {},
        },
        border: {
          normal: {
            top: { color: "#0f766e", style: "solid", width: "1px" },
            right: { color: "#0f766e", style: "solid", width: "1px" },
            bottom: { color: "#0f766e", style: "solid", width: "1px" },
            left: { color: "#0f766e", style: "solid", width: "1px" },
          },
          hover: {
            top: { color: "#0f766e", style: "solid", width: "1px" },
            right: { color: "#0f766e", style: "solid", width: "1px" },
            bottom: { color: "#0f766e", style: "solid", width: "1px" },
            left: { color: "#0f766e", style: "solid", width: "1px" },
          },
        },
        borderRadius: 10,
        padding: {
          top: "20px",
          bottom: "20px",
          left: "20px",
          right: "20px",
        },
      },
    },
    styles: {
      header: {
        bgColor: "#0f1f1b",
        title: {
          typo: {
            fontFamily: "Roboto",
            fontSize: { desktop: 25, tablet: 16, mobile: 16 },
            fontStyle: "normal",
            fontWeight: "500",
            fontUnit: "px",
            letterSpace: "5.2px",
            lineHeight: "1.7",
            textDecoration: "none",
            textTransform: "none",
          },
          color: "#ffffff",
        },
        description: {
          typo: {
            fontSize: { desktop: 18, tablet: 16, mobile: 16 },
            fontWeight: 100,
          },
          color: "#ffffff",
        },
        padding: {
          top: "10px",
          bottom: "10px",
          left: "10px",
          right: "10px",
        },
      },
    },
  },
};

export function normalizeKeys(saved, reference) {
  // If saved is an empty array but the reference is an object, convert it to an empty object
  if (Array.isArray(saved) && saved.length === 0 && reference && !Array.isArray(reference) && typeof reference === 'object') {
    saved = {};
  }
  
  if (typeof reference !== 'object' || reference === null) {
    return saved !== undefined ? saved : reference;
  }
  
  if (Array.isArray(reference)) {
    if (!Array.isArray(saved)) {
      return reference;
    }
    return saved.map(item => normalizeKeys(item, reference[0]));
  }
  
  if (typeof saved !== 'object' || saved === null) {
    // If saved is not an object (e.g. undefined/null) but reference is, clone/return reference
    return JSON.parse(JSON.stringify(reference));
  }
  
  const normalized = {};
  const refKeys = Object.keys(reference);
  
  // First, map all saved keys to normalized keys based on case-insensitive match with reference keys
  const savedNormalized = {};
  for (const [key, value] of Object.entries(saved)) {
    const matchedKey = refKeys.find(
      (refKey) => refKey.toLowerCase() === key.toLowerCase()
    ) || key;
    savedNormalized[matchedKey] = value;
  }
  
  // Now, populate all reference keys, merging saved values if they exist
  for (const key of refKeys) {
    const savedVal = savedNormalized[key];
    const refVal = reference[key];
    normalized[key] = normalizeKeys(savedVal, refVal);
  }
  
  // Also keep any keys in saved that are NOT in reference
  for (const [key, value] of Object.entries(savedNormalized)) {
    if (!refKeys.includes(key)) {
      normalized[key] = value;
    }
  }
  
  return normalized;
}

