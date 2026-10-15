// Icons for the document sources, shared by the sidebar panel and the empty-block picker.

export const GoogleDriveIcon = ({ size = 16 }) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width={size} height={size} fill="currentColor" style={{ flexShrink: 0 }} aria-hidden="true">
    <path d="M7.71 3.5h8.58l6.83 11.83h-8.58z" fill="#FFC107" />
    <path d="M16.29 15.33H2.62L6 20.67h13.67z" fill="#00E676" />
    <path d="M9.42 15.33L2.62 3.5 6 9.33l6.83 11.34z" fill="#2979FF" />
  </svg>
);

export const DropboxIcon = ({ size = 16 }) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width={size} height={size} fill="#0061FE" style={{ flexShrink: 0 }} aria-hidden="true">
    <path d="M12.012 1.5L4.851 6.136l7.161 4.673 7.16-4.673L12.012 1.5zm-7.161 9.42l7.161 4.636 7.16-4.636 4.828 3.125-11.988 7.455-11.988-7.455 4.827-3.125zm0 1.93l-4.827 3.125L12.012 23.5l11.988-7.513-4.828-3.125-7.16 4.636-7.161-4.636z" />
  </svg>
);

export const BoxIcon = ({ size = 16 }) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width={size} height={size} style={{ flexShrink: 0 }} aria-hidden="true">
    <rect width="24" height="24" rx="5" fill="#0061D5" />
    <g fill="none" stroke="#fff" strokeWidth="1.9" strokeLinecap="round">
      <path d="M3.6 7.4v8.1" />
      <circle cx="6.4" cy="13.1" r="2.5" />
      <circle cx="12.6" cy="13.1" r="2.5" />
      <path d="M16.6 10.6l4 5M20.6 10.6l-4 5" />
    </g>
  </svg>
);

export const UploadIcon = ({ size = 16 }) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width={size} height={size} fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }} aria-hidden="true">
    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
    <polyline points="17 8 12 3 7 8" />
    <line x1="12" y1="3" x2="12" y2="15" />
  </svg>
);

export const LinkIcon = ({ size = 16 }) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width={size} height={size} fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }} aria-hidden="true">
    <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
    <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
  </svg>
);

export const DocumentIcon = ({ size = 16 }) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width={size} height={size} fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }} aria-hidden="true">
    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
    <polyline points="14 2 14 8 20 8" />
    <line x1="16" y1="13" x2="8" y2="13" />
    <line x1="16" y1="17" x2="8" y2="17" />
  </svg>
);
