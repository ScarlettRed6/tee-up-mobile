import { useEffect, useMemo, useRef, useState } from 'react';
import { Search, X } from 'lucide-react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import {
  filterBrandEntries,
  getDefaultBrandPickerFilter,
} from '../constants/golfEquipmentBrands';
import './BrandPickerModal.css';

const FILTER_CHIPS = [
  { key: 'all', label: 'All' },
  { key: 'clubs', label: 'Clubs' },
  { key: 'balls', label: 'Balls' },
  { key: 'apparel', label: 'Apparel' },
  { key: 'gear', label: 'Bags & gear' },
];

/**
 * Searchable brand picker for the sell form (no Radix — simple overlay).
 */
export default function BrandPickerModal({
  open,
  onOpenChange,
  listingCategory,
  value,
  onSelect,
}) {
  const searchRef = useRef(null);
  const [query, setQuery] = useState('');
  const [filterKey, setFilterKey] = useState(() => getDefaultBrandPickerFilter(listingCategory || ''));
  const [showCustom, setShowCustom] = useState(false);
  const [customDraft, setCustomDraft] = useState('');

  useEffect(() => {
    if (!open) return;
    setQuery('');
    setFilterKey(getDefaultBrandPickerFilter(listingCategory || ''));
    setShowCustom(false);
    setCustomDraft('');
    const t = requestAnimationFrame(() => searchRef.current?.focus?.());
    return () => cancelAnimationFrame(t);
  }, [open, listingCategory]);

  useEffect(() => {
    if (!open) return;
    const down = (e) => {
      if (e.key === 'Escape') onOpenChange(false);
    };
    document.addEventListener('keydown', down);
    return () => document.removeEventListener('keydown', down);
  }, [open, onOpenChange]);

  const filtered = useMemo(() => filterBrandEntries(query, filterKey), [query, filterKey]);

  if (!open) return null;

  const choose = (name) => {
    onSelect(name.trim());
    onOpenChange(false);
  };

  const submitCustom = () => {
    const t = customDraft.trim();
    if (t.length < 2) return;
    choose(t);
  };

  return (
    <div
      className="brand-picker-overlay"
      role="presentation"
      onClick={() => onOpenChange(false)}
    >
      <div
        role="dialog"
        aria-labelledby="brand-picker-title"
        aria-modal="true"
        className="brand-picker-modal"
        onClick={(e) => e.stopPropagation()}
      >
        <header className="brand-picker-header">
          <h2 id="brand-picker-title" className="brand-picker-title">
            Choose brand
          </h2>
          <button
            type="button"
            className="brand-picker-close"
            aria-label="Close"
            onClick={() => onOpenChange(false)}
          >
            <X className="h-5 w-5" aria-hidden strokeWidth={2} />
          </button>
        </header>

        <p className="brand-picker-help">
          Search a curated list of golf brands and manufacturers to keep spelling consistent.
          {listingCategory ? (
            <span className="brand-picker-category-hint">
              {' '}
              The default tab fits <strong>{listingCategory}</strong>; switch anytime.
            </span>
          ) : (
            <span> Use the chips to narrow clubs, balls, apparel, or bags and gear.</span>
          )}
        </p>

        <div className="brand-picker-chips" role="tablist" aria-label="Brand type">
          {FILTER_CHIPS.map(({ key, label }) => (
            <button
              key={key}
              type="button"
              role="tab"
              aria-selected={filterKey === key}
              className={`brand-picker-chip ${filterKey === key ? 'brand-picker-chip-active' : ''}`}
              onClick={() => setFilterKey(key)}
            >
              {label}
            </button>
          ))}
        </div>

        <div className="brand-picker-search-row">
          <Search className="brand-picker-search-icon" aria-hidden strokeWidth={2} />
          <Input
            ref={searchRef}
            type="search"
            placeholder="Search e.g. Titleist, FootJoy…"
            className="brand-picker-search-input"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </div>

        {value ? (
          <p className="brand-picker-current">
            Current:&nbsp;<strong>{value}</strong>
          </p>
        ) : null}

        <div className="brand-picker-scroll" tabIndex={-1}>
          {filtered.length === 0 ? (
            <p className="brand-picker-empty">No matches. Try another filter tab or search term.</p>
          ) : (
            <ul className="brand-picker-list">
              {filtered.map((entry) => (
                <li key={entry.name}>
                  <button
                    type="button"
                    className={`brand-picker-row ${value === entry.name ? 'brand-picker-row-selected' : ''}`}
                    onClick={() => choose(entry.name)}
                  >
                    {entry.name}
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="brand-picker-footer">
          {!showCustom ? (
            <button
              type="button"
              className="brand-picker-not-listed"
              onClick={() => {
                setShowCustom(true);
                setCustomDraft(value && filtered.length === 0 ? value : '');
              }}
            >
              Brand not listed — type it manually
            </button>
          ) : (
            <div className="brand-picker-custom-box">
              <label className="brand-picker-custom-label" htmlFor="brand-picker-custom-input">
                Custom brand
              </label>
              <div className="brand-picker-custom-row">
                <Input
                  id="brand-picker-custom-input"
                  placeholder="Exact spelling you want on the listing"
                  value={customDraft}
                  onChange={(e) => setCustomDraft(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') submitCustom();
                  }}
                />
                <Button type="button" onClick={submitCustom} disabled={customDraft.trim().length < 2}>
                  Use brand
                </Button>
              </div>
              <button
                type="button"
                className="brand-picker-back"
                onClick={() => {
                  setShowCustom(false);
                  setCustomDraft('');
                }}
              >
                Back to list
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
