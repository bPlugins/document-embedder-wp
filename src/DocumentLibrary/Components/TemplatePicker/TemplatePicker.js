import { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { Check, Lock, X } from 'lucide-react';
import { LIBRARY_TEMPLATES } from '../../Utils/options';
import './TemplatePicker.scss';

// Table and Folder are Pro layouts. The free plugin can't render them, so they
// are shown in the picker for people to discover but can never be picked:
// clicking one opens the upgrade popup instead.
const PRO_TEMPLATES = ['table', 'folder'];
const PICKER_TEMPLATES = [...LIBRARY_TEMPLATES, ...PRO_TEMPLATES];

export const getTemplateMeta = () => ({
  grid: {
    name: 'Grid',
    description: 'Cards in columns. Gives each file visual weight.',
    best: 'Brochures, media kits, download pages',
  },
  list: {
    name: 'List',
    description: 'One file per row with details and buttons. Easy to scan.',
    best: 'Policies, forms, resource pages',
  },
  table: {
    name: 'Table',
    description: 'Sortable columns, like a spreadsheet. Built for big libraries.',
    best: 'Reports, archives, 50+ files',
  },
  folder: {
    name: 'Folder',
    description: 'Files grouped into folders that visitors open one at a time.',
    best: 'Intranets, client portals, courses',
  },
});

/** Small drawings of each layout for the picker cards. */
const Thumb = ({ template }) => {
  switch (template) {
    case 'list':
      return (
        <span className="bpldl-thumb bpldl-thumb--list" aria-hidden="true">
          {Array.from({ length: 4 }, (_, i) => (
            <span key={i} className="bpldl-thumb__row">
              <i /> <b /> <em />
            </span>
          ))}
        </span>
      );
    case 'table':
      return (
        <span className="bpldl-thumb bpldl-thumb--table" aria-hidden="true">
          <span className="bpldl-thumb__row is-head"><b /><b /><b /></span>
          {Array.from({ length: 5 }, (_, i) => (
            <span key={i} className="bpldl-thumb__row"><b /><b /><b /></span>
          ))}
        </span>
      );
    case 'folder':
      return (
        <span className="bpldl-thumb bpldl-thumb--folder" aria-hidden="true">
          {Array.from({ length: 5 }, (_, i) => <span key={i} className="bpldl-thumb__folder" />)}
        </span>
      );
    default:
      return (
        <span className="bpldl-thumb bpldl-thumb--grid" aria-hidden="true">
          {Array.from({ length: 6 }, (_, i) => <span key={i} className="bpldl-thumb__card" />)}
        </span>
      );
  }
};

/**
 * "Choose a layout for your library". Opens on Add New, and again from the
 * layout button in the title bar. Closing it without choosing keeps the
 * current layout (Grid for a new library), so it never blocks anyone.
 */
const TemplatePicker = ({ open, mode = 'new', current = 'grid', onConfirm, onClose, onLocked = () => {} }) => {
  const [selected, setSelected] = useState(current);
  const cardRefs = useRef({});
  const meta = getTemplateMeta();

  useEffect(() => {
    if (open) setSelected(current);
  }, [open, current]);

  useEffect(() => {
    if (open) cardRefs.current[selected]?.focus();
  }, [open, selected]);

  useEffect(() => {
    if (!open) return undefined;
    const onKey = (e) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [open, onClose]);

  if (!open) return null;

  const isLocked = (t) => PRO_TEMPLATES.includes(t);
  const name = meta[selected].name;

  let confirmText;
  if (mode === 'change') {
    confirmText = selected === current ? `Keep ${name}` : `Switch to ${name}`;
  } else {
    confirmText = `Use ${name}`;
  }

  // Arrow keys move between the layouts that can actually be picked.
  const onCardKey = (e) => {
    const forward = e.key === 'ArrowRight' || e.key === 'ArrowDown';
    const back = e.key === 'ArrowLeft' || e.key === 'ArrowUp';
    if (!forward && !back) return;
    e.preventDefault();
    const i = LIBRARY_TEMPLATES.indexOf(selected) + (forward ? 1 : -1);
    setSelected(LIBRARY_TEMPLATES[(i + LIBRARY_TEMPLATES.length) % LIBRARY_TEMPLATES.length]);
  };

  // Portalled to <body>: inside the editor root the overlay is clipped by
  // WP admin's layout and leaves the admin menu uncovered.
  return createPortal(
    <div id="bpldl-picker-root" className="bpldl-picker-overlay" onMouseDown={(e) => e.target === e.currentTarget && onClose()}>
      <div className="bpldl-picker" role="dialog" aria-modal="true" aria-labelledby="bpldl-picker-title">
        <button type="button" className="bpldl-picker__close" onClick={onClose} aria-label="Close">
          <X />
        </button>

        <div className="bpldl-picker__head">
          <h2 id="bpldl-picker-title">
            {mode === 'change' ? 'Change library layout' : 'Choose a layout for your library'}
          </h2>
          <p>
            {mode === 'change'
              ? 'Your files, header, toolbar and colours carry over. Each layout keeps its own settings, so you can switch back.'
              : 'Pick how visitors will see your documents. You can change this any time.'}
          </p>
        </div>

        <div className="bpldl-picker__grid" role="radiogroup" aria-label="Layouts">
          {PICKER_TEMPLATES.map((t) => {
            const isSelected = selected === t;
            const locked = isLocked(t);
            return (
              <button
                type="button"
                key={t}
                ref={(el) => { cardRefs.current[t] = el; }}
                role="radio"
                aria-checked={isSelected}
                aria-disabled={locked || undefined}
                title={locked ? `${meta[t].name} is available in Pro` : undefined}
                tabIndex={isSelected ? 0 : -1}
                className={`bpldl-picker__card${isSelected ? ' is-selected' : ''}${locked ? ' is-locked' : ''}`}
                onClick={() => (locked ? onLocked(t) : setSelected(t))}
                onDoubleClick={() => { if (!locked) onConfirm(t); }}
                onKeyDown={onCardKey}
              >
                {isSelected && <span className="bpldl-picker__tick" aria-hidden="true"><Check /></span>}
                {t === 'grid' && <span className="bpldl-picker__badge is-default">Default</span>}
                {locked && (
                  <span className="bpldl-picker__badge is-pro">
                    <Lock aria-hidden="true" />
                    Pro
                  </span>
                )}
                <Thumb template={t} />
                <span className="bpldl-picker__name">{meta[t].name}</span>
                <span className="bpldl-picker__desc">{meta[t].description}</span>
                <span className="bpldl-picker__best">Best for: {meta[t].best}</span>
              </button>
            );
          })}
        </div>

        <p className="bpldl-picker__upsell">
          <Lock aria-hidden="true" />
          Table and Folder layouts are available in Pro. Click one to see what you get.
        </p>

        <div className="bpldl-picker__foot">
          <span className="bpldl-picker__hint">
            {mode === 'change'
              ? 'Nothing changes on your site until you press Save.'
              : 'Not sure? Grid is how libraries have always looked.'}
          </span>
          <div className="bpldl-picker__actions">
            <button type="button" className="bpldl-picker__btn" onClick={onClose}>
              Cancel
            </button>
            <button type="button" className="bpldl-picker__btn is-primary" onClick={() => onConfirm(selected)}>
              {confirmText}
            </button>
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
};

export default TemplatePicker;
