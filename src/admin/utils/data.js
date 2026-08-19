const slug = 'document-emberdder';
const webSlug = 'document-embedder';

export const gutenbergTabIcon = (
    <svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='currentColor' strokeWidth={2} strokeLinecap='round' strokeLinejoin='round'>
        <rect x='3' y='3' width='7' height='7' rx='1' />
        <rect x='14' y='3' width='7' height='7' rx='1' />
        <rect x='3' y='14' width='7' height='7' rx='1' />
        <rect x='14' y='14' width='7' height='7' rx='1' />
    </svg>
);

export const shortcodeTabIcon = (
    <svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='currentColor' strokeWidth={2} strokeLinecap='round' strokeLinejoin='round'>
        <polyline points='16 18 22 12 16 6' />
        <polyline points='8 6 2 12 8 18' />
    </svg>
);

export const quickEmbedTabIcon = (
    <svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='currentColor' strokeWidth={2} strokeLinecap='round' strokeLinejoin='round'>
        <path d='M10 13a5 5 0 007.54.54l3-3a5 5 0 00-7.07-7.07l-1.72 1.71' />
        <path d='M14 11a5 5 0 00-7.54-.54l-3 3a5 5 0 007.07 7.07l1.71-1.71' />
    </svg>
);

export const dashboardInfo = (info) => {
  const { version, isPremium, hasPro, adminUrl = '', pluginUrl = '', licenseActiveNonce } = info;

  const proSuffix = isPremium ? ' Pro' : '';

  return {
    name: `Document Embedder${proSuffix}`,
    description: `Document Embedder${proSuffix} -  Embed PDFs, Word, Excel, PowerPoint, and other files in WordPress using Google Drive viewer, with support for local and cloud sources.The new Document Library helps you organize, search, and display documents in customizable layouts using shortcode or Gutenberg blocks.`,
    slug,
    version,
    isPremium,
    hasPro,
    adminUrl,
    displayOurPlugins: true,
    media: {
      logo: `https://ps.w.org/${slug}/assets/icon-128x128.png`,
      banner: `https://ps.w.org/${slug}/assets/banner-772x250.png`,
      // Overview banner on Welcome — the first screen after install. Shipped with the
      // plugin so it always loads, and drawn to the 3:2 slot the dashboard reserves.
      thumbnail: pluginUrl
        ? `${pluginUrl}assets/img/overview.svg`
        : `https://bplugins.com/wp-content/themes/b-technologies/assets/images/products/${webSlug}.png`,
      // Shipped with the plugin: the remote product shot for this slug does not exist,
      // which left the Pro block on Welcome and Demos with a broken image.
      proThumbnail: pluginUrl
        ? `${pluginUrl}assets/img/pro-features.svg`
        : `https://bplugins.com/wp-content/themes/b-technologies/assets/images/products/${webSlug}-pro.png`,
      // video: 'https://www.youtube.com/watch?v=milYZrqLJsE',
      // isYoutube: true
    },
    pages: {
      org: `https://wordpress.org/plugins/${slug}/`,
      landing: `https://bplugins.com/products/document-embedder/`,
      docs: `https://bplugins.com/docs/${webSlug}/getting-started/`,
      pricing: `https://bplugins.com/products/${webSlug}/pricing`,
    },
    freemius: {
      product_id: '19862',
      plan_id: '32956',
      public_key: 'pk_f769b99599446975f5e64d7a6ffbc',
    },
    licenseActiveNonce,
    changelogs: [
      {
        version: "2.3.0 - 19 August 2026",
        list: [
          "**New:** Complete overhaul of the Access and Security settings module, delivering advanced protection controls with an intuitive interface for all users.",
          "**New:** Interactive Overlays settings introduced to seamlessly place annotations, links, and actionable elements directly on your documents.",
          "**New:** Real-time Live Preview capability integrated into the Classic Editor, allowing instant visualization of document embeds before publishing.",
          "**Update:** Enhanced clarity across all settings by revising and optimizing informative note fields throughout the plugin.",
          "**Update:** Added two new dedicated utility metaboxes to the Classic Editor sidebox for streamlined document configuration.",
          "**Update:** Refreshed the Pro feature list modal to accurately reflect the latest premium capabilities and enhancements.",
          "**Fix:** Integrated a high-performance Custom PDF viewer into the Document Library module, completely resolving intermittent loading failures caused by the default Google Viewer."
        ]
      },
      {
        version: "2.2.1 - 22 July 2026",
        list: [
          "**New:** View PDFs in Full-Screen Mode for a more comfortable reading experience.",
          "**New:** Pages now load only when needed, making large documents open faster.",
          "**New:** Added a backup viewer that automatically works if the Google Viewer is unavailable.",
          "**New:** Open documents in a Lightbox Popup without leaving the current page.",
          "**New:** Lazy Loading support improves page speed by loading documents only when they come into view.",
          "**New:** Enjoy an interactive 3D FlipBook reading experience.",
          "**New:** Added a 2D FlipBook mode for browsers that don't support 3D effects.",
          "**New:** Display documents in a SlideShow-style viewer for easy page navigation.",
          "**New:** Faster document loading with partial page loading, so readers don't have to wait for the entire document to load.",
          "**New:** Refactored the plugin for improved stability, better performance, enhanced security, and a smoother overall experience."
        ]
      },
      {
        version: "2.2.0 - 21 June 2026",
        list: [
          "**New:** Added brand new Custom PDF.js Viewer option, enabling high-performance local rendering for PDF files.",
          "**New:** Fully redesigned responsive document block architecture, engineered with modular layout blocks and premium modern aesthetics.",
          "**Update:** Unified shortcode rendering engine under the block's reactive component system, optimizing memory usage and ensuring 100% style and behavior alignment.",
          "**Update:** Restructured admin dashboard and metadata options into intuitive, clean functional categories for a seamless management experience.",
          "**Improved:** Automated cloud integration workflows with adaptive viewer modes (Default vs Custom PDF) based on document file types and origin.",
          "**Improved:** Cleaned up deprecated PHP functions and decoupled legacy controller layers for cleaner, safer, and faster processing."
        ]
      },
      {
        version: "2.1.2 - 1 June 2026",
        list: [
          "**Improved:** Removed legacy and unused DocumentEmbedder files to optimize codebase and performance.",
          "**Improved:** Regenerated Composer autoloader files to remove obsolete class definitions."
        ]
      },
      {
        version: "2.1.1 - 23 May 2026",
        list: [
          "**Improved:** Refactored the entire plugin codebase for better organization and maintainability.",
          "**Improved:** Removed unused code and optimized plugin structure for cleaner performance.",
          "**Fixed:** Resolved existing bugs and stability issues across the plugin.",
          "**Security:** Enhanced overall security and improved code quality for a safer document embedding experience."
        ]
      },
      {
        version: "2.1.0 - 16 April 2026",
        list: [
          "**New:** Complete download feature suite — email gate (lead capture), per-IP download limits, download tracking counter, access restrictions by login status and user role, and a Leads Dashboard with search, date filters, CSV export, and bulk delete.",
          "**Update:** Filename display moved to the toolbar for the standard viewer.",
          "**Update:** Shortcode generator UI redesigned for easier copy-paste workflow.",
        ],
      },
      {
        version: "2.0.6 - 2 March 2026",
        list: [
          "**Update:** Improved overall user experience with a cleaner, more intuitive interface.",
          "**Update:** Refactored internal codebase for better readability, maintainability, and performance.",
          "**Fix:** Resolved all known UI and functionality issues across the plugin.",
          "**Fix:** Removed unused and legacy code to reduce clutter and improve stability.",
        ],
      },
      {
        version: "2.0.4 - 24 January 2026",
        list: [
          "Fixed Issues - download button and view button styles issue, Vulnerability issue.",
        ],
      },
      {
        version: "2.0.2 - 11 November 2025",
        list: ["Update dashboard and freemius sdk"],
      },
      {
        version: "2.0.0 - 11 September, 2025",
        list: [
          "Add Document Library",
          "Fixed Document Embedder Issues",
          "Move Document Embedder to Freemius",
        ],
      },
      {
        version: "1.8.9 – 14 May, 2025",
        list: [
          "Improved: Security",
          "Fixed: Function _load_textdomain_just_in_time was called incorrectly",
        ],
      },
      {
        version: "1.8.8 – 25 Jan, 2025",
        list: ["Fixed: Redirect to rest_no_route"],
      },
      {
        version: "1.8.7 – 1 July, 2024",
        list: ["Added: Loader until PDF load"],
      },
      {
        version: "1.8.6 – 9 March, 2024",
        list: ["Fixed: Blinking always"],
      },
      {
        version: "1.8.5 – 25 Feb, 2024",
        list: ["Fixed: Deprecated error messages"],
      },
      {
        version: "1.8.3 – 20/11/2022",
        list: ["Add ‘Help’ page", "Remove ‘Developer’ and ‘How to use’ page"],
      },
      {
        version: "1.8.3 – 02/11/2022",
        list: ["Remove metabox"],
      },
      {
        version: "1.8.2",
        list: ["Generated pot file"],
      },
      {
        version: "1.8.1",
        list: [
          "Solved Document load issue (Document will always load)",
          "Option to disable download button",
        ],
      },
      {
        version: "1.7.1",
        list: ["Fixed security issue"],
      },
      {
        version: "1.4",
        list: [
          "Fix Ooops… You forgot to Select a document Warning",
          "Fixed Block Editor issue",
        ],
      },
      {
        version: "1.3",
        list: ["Fix Js issue and make compatible with WordPress 5.5"],
      },
      {
        version: "1.2",
        list: ["Gutenberg Block Support"],
      },
      {
        version: "1.1",
        list: ["Fix Position issue", "Improved Performance"],
      },
      {
        version: "1.0",
        list: ["Initial Release"],
      },
    ],
    // Kept in step with the Pro teaser card on the document edit screen
    // (BPLDE_Document_Embedder::render_pro_teaser_metabox), so every surface
    // that sells Pro names the same six things.
    proFeatures: [
      "Email-gated downloads",
      "Interactive overlays on any page",
      "Print, copy and right-click protection",
      "Access limited by user role",
      "Google Drive and Dropbox embeds",
      "Toolbar themes, zoom and lightbox"
    ],
    startButton: {
      label: 'Start Now',
      url: `${adminUrl}post-new.php?post_type=ppt_viewer`,
    }
  }
}

export const demoInfo = {
  allInOneLabel: 'See All Demos',
  allInOneLink: "https://documentembedder.com/demo/document-embedder-all-demos/",
  demos: [
    {
      icon: <svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' width='24' height='24' aria-hidden='true'><rect x='3' y='3' width='14' height='18' rx='2' fill='#E33' /><path d='M17 3v6h4' fill='#E33' /><text x='6.5' y='15.2' fontSize='6.5' fontFamily='Arial, Helvetica, sans-serif' fill='#fff' fontWeight='700'>PDF</text></svg>,
      title: "PDF Document (Embed Any PDF File)",
      description:
        "Display PDF reports, brochures, menus, or manuals directly inside your website using a smooth built in viewer.",
      type: "iframe",
      url: "https://documentembedder.com/demo/321/",
    },
    {
      icon: <svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' width='24' height='24' aria-hidden='true'><rect x='2' y='4' width='20' height='16' rx='2' fill='#2B66C9' /><text x='5' y='15.5' fontSize='6.5' fontFamily='Arial, Helvetica, sans-serif' fill='#fff' fontWeight='700'>W</text></svg>,
      title: "Word Document (.doc, .docx, .docm, .dotx, .dotm)",
      description:
        "Embed resumes, contracts, proposals, or templates seamlessly without forcing users to download the file.",
      type: "iframe",
      url: "https://documentembedder.com/demo/word-document/",
    },
    {
      icon: <svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' width='24' height='24' aria-hidden='true'><rect x='3' y='3' width='18' height='18' rx='2' fill='#1D9A3A' /><path d='M6 7h12v2H6z' fill='rgba(255,255,255,0.9)' /><text x='7' y='17' fontSize='6.5' fontFamily='Arial, Helvetica, sans-serif' fill='#fff' fontWeight='700'>X</text></svg>,
      title: "Excel Sheets (.xls, .xlsx)",
      description:
        "Show interactive data tables, pricing charts, or schedules directly from Excel spreadsheets.",
      type: "iframe",
      url: "https://documentembedder.com/demo/exel-sheets/",
    },
    {
      icon: <svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' width='24' height='24' aria-hidden='true'><rect x='3' y='4' width='18' height='14' rx='2' fill='#E07024' /><rect x='5' y='6' width='10' height='3' rx='1' fill='rgba(255,255,255,0.95)' /><rect x='5' y='11' width='14' height='5' rx='1' fill='rgba(255,255,255,0.95)' /></svg>,
      title: "PowerPoint / Presentations (.ppt / .pptx)",
      description:
        "Embed engaging presentations, lectures, and pitch decks beautifully in your pages or posts.",
      type: "iframe",
      url: "https://documentembedder.com/demo/powerpoint-document/",
    },
    {
      icon: <svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' width='24' height='24' aria-hidden='true'><rect x='2' y='3' width='20' height='18' rx='2' fill='#8C8C8C' /><circle cx='8.5' cy='9.5' r='2.2' fill='#fff' /><path d='M4 17l5-6 6 8H4z' fill='#fff' /></svg>,
      title: "Images & Media",
      description:
        "Embed JPG, PNG, SVG, or video files for quick visual previews inside your posts or landing pages.",
      type: "iframe",
      url: "https://documentembedder.com/demo/images-media-document/",
    },
    {
      icon: <svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' width='24' height='24' aria-hidden='true'><path d='M5 12c0-2.8 2.2-5 5-5 .6 0 1.2.1 1.8.3C12.8 6 13.9 5 15.2 5 17.7 5 19.8 7.1 19.8 9.6 19.8 10 19.8 10.4 19.7 10.8 21.1 11.3 22 12.7 22 14.4 22 16.8 19.8 19 17.4 19H6.5C4.1 19 2 16.8 2 14.4 2 12.1 3.6 10.2 5.9 9.9 5.4 9.4 5 8.7 5 8z' fill='#4B9AE2' /></svg>,
      title: "Embed Document From Google Drive & Dropbox",
      description:
        "Easily embed files directly from Google Drive or Dropbox without manually uploading them to your site.",
      type: "iframe",
      url: "https://documentembedder.com/demo/embed-document-from-google-drive/",
    },
    {
      icon: <svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' width='24' height='24' aria-hidden='true'><rect x='2' y='4' width='20' height='16' rx='2' fill='#2B66C9' /><text x='5' y='15.5' fontSize='6.5' fontFamily='Arial, Helvetica, sans-serif' fill='#fff' fontWeight='700'>W</text></svg>,
      title: "Document Library",
      description:
        "Showcase multiple documents in a single place like a library.",
      type: "iframe",
      url: "https://documentembedder.com/demo/document-library/",
    }
  ]
}

export const pricingInfo = {
  logo: `https://ps.w.org/${slug}/assets/icon-128x128.png`, // Optional
  pluginId: 19862,
  planId: 32956,
  licenses: [
    1,
    3,
    null
  ],
  button: {
    label: 'Buy Now ➜'
  },
  featured: {
    selected: 3, // choose from licenses item
  }
}

export const welcomeInfo = (adminUrl) => ({
  keywords: ['PDF Embedder', 'Excel Viewer', 'Word Embedder', 'Gutenberg Block', 'Shortcode', 'Document Library'],
  keywordsLabel: 'Features',
  gettingStarted: {
    tabs: [
      {
        key: 'gutenberg',
        label: 'Gutenberg',
        icon: gutenbergTabIcon,
        steps: [
          {
            num: 1,
            title: 'Insert the Block',
            body: 'Click <strong>+</strong> in the Gutenberg editor and search for <strong>Document Embed</strong>.',
            link: { url: `${adminUrl}post-new.php`, label: 'Open Editor' }
          },
          {
            num: 2,
            title: 'Select File',
            body: 'Choose an existing document from your Media Library or upload a new one inside the block.'
          },
          {
            num: 3,
            title: 'Publish & Preview',
            body: 'Configure options, viewer modes, download settings, and dimensions in the block sidebar, then hit <strong>Publish</strong>.'
          }
        ]
      },
      {
        key: 'shortcode',
        label: 'Shortcode',
        icon: shortcodeTabIcon,
        steps: [
          {
            num: 1,
            title: 'Create Document',
            body: 'Go to <strong>Document Embedder › Add New</strong> to create a new Document post.',
            link: { url: `${adminUrl}post-new.php?post_type=ppt_viewer`, label: 'Add New' }
          },
          {
            num: 2,
            title: 'Upload & Save',
            body: 'Upload your file, select viewer type (Default, Custom PDF, Google Drive etc.), configure options, and click <strong>Publish</strong>.'
          },
          {
            num: 3,
            title: 'Copy Shortcode',
            body: 'Copy the generated shortcode like <code>[doc id="POST_ID"]</code> from the list or metabox sidebar.'
          },
          {
            num: 4,
            title: 'Paste Anywhere',
            body: 'Paste the copied shortcode into any page, post, widget, or layout.'
          }
        ]
      },
      {
        key: 'library',
        label: 'Document Library',
        icon: quickEmbedTabIcon,
        steps: [
          {
            num: 1,
            title: 'Create Library',
            body: 'Go to <strong>Document Embedder › Add New Library</strong> to create a new document library collection.',
            link: { url: `${adminUrl}post-new.php?post_type=document_library`, label: 'Add Library' }
          },
          {
            num: 2,
            title: 'Add Documents',
            body: 'Add the desired documents to your library, configure column layouts, filter panels, and search tools, and click <strong>Publish</strong>.'
          },
          {
            num: 3,
            title: 'Deploy Library',
            body: 'Copy the library shortcode like <code>[document_library id="POST_ID"]</code> and paste it into any page.'
          }
        ]
      }
    ]
  }
});
