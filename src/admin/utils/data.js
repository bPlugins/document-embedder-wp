const slug = 'document-emberdder';
const webSlug = 'document-embedder';

export const dashboardInfo = (info) => {
  const { version, isPremium, hasPro, licenseActiveNonce } = info;

  const proSuffix = isPremium ? ' Pro' : '';

  return {
    name: `Document Embedder${proSuffix}`,
    description: `Document Embedder${proSuffix} -  Embed PDFs, Word, Excel, PowerPoint, and other files in WordPress using Google Drive viewer, with support for local and cloud sources.The new Document Library helps you organize, search, and display documents in customizable layouts using shortcode or Gutenberg blocks.`,
    slug,
    version,
    isPremium,
    hasPro,
    displayOurPlugins: true,
    media: {
      logo: `https://ps.w.org/${slug}/assets/icon-128x128.png`,
      banner: `https://ps.w.org/${slug}/assets/banner-772x250.png`,
      thumbnail: `https://bplugins.com/wp-content/themes/b-technologies/assets/images/products/${webSlug}.png`,
      proThumbnail: `https://bplugins.com/wp-content/themes/b-technologies/assets/images/products/${webSlug}-pro.png`,
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
        version: "2.1.1 - 20 May 2026",
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
    proFeatures: [
      "Lead Capture (Email Gate): Turn docs into lead magnets",
      "Advanced Download Control: Roles and IP limits",
      "Dropbox & Google Drive: Direct cloud integration",
      "Beautiful Lightbox View: Open docs in a premium popup",
      "Document Loading Icon: Professional loading experience",
      "Disable Popout: Keep visitors on your site longer",
      "Unlimited Library: Create massive doc collections",
      "Priority Support: Expert help whenever you need it"
    ],
    startButton: {
      label: 'Start Now',
      url: `wp-admin/post-new.php?post_type=ppt_viewer`,
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
