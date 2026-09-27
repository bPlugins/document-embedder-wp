/**
 * One-click header palettes.
 *
 * Each preset writes the three values the header actually paints with, so
 * picking one can never leave white text on a white bar. Anything else in the
 * Header panel is left alone.
 */
export const HEADER_PRESETS = [
  { label: 'Ink',    bgColor: '#0f1f1b', title: '#ffffff', description: '#b9ccc4' },
  { label: 'Teal',   bgColor: '#0f766e', title: '#ffffff', description: '#cfe7e4' },
  { label: 'Lime',   bgColor: '#a3e635', title: '#1a2e05', description: '#3f5209' },
  { label: 'Paper',  bgColor: '#f8fbfa', title: '#0f1f1b', description: '#5b7369' },
  { label: 'None',   bgColor: 'transparent', title: '#0f1f1b', description: '#5b7369' },
];

export const HEADER_PRESET_PATHS = {
  bgColor: 'settings.styles.header.bgColor',
  title: 'settings.styles.header.title.color',
  description: 'settings.styles.header.description.color',
};
