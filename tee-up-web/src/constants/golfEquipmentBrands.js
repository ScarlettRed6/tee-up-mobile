/**
 * Curated brands for TeeUp listings (clubs, apparel, balls, bags, accessories).
 * Used by the sell flow so buyers see consistent spelling; "Other — not listed"
 * opens a typed fallback for uncommon brands.
 */
export const BRAND_GROUPS = /** @type {const} */ (['clubs', 'apparel', 'accessories', 'balls', 'bags']);

/**
 * @typedef {'clubs' | 'apparel' | 'accessories' | 'balls' | 'bags'} BrandGroup
 * @typedef {{ name: string, groups: BrandGroup[] }} BrandEntry
 */

/** @type {BrandEntry[]} */
export const GOLF_BRAND_ENTRIES = [
  // Club OEMs & putter / wedge builders
  { name: 'Adams Golf', groups: ['clubs'] },
  { name: 'Ben Hogan', groups: ['clubs'] },
  { name: 'Bettinardi', groups: ['clubs'] },
  { name: 'Bridgestone', groups: ['clubs', 'balls'] },
  { name: 'Callaway', groups: ['clubs', 'balls', 'apparel', 'bags'] },
  { name: 'Cleveland Golf', groups: ['clubs'] },
  { name: 'Cobra', groups: ['clubs', 'apparel'] },
  { name: 'Dunlop', groups: ['balls', 'clubs'] },
  { name: 'Edel Golf', groups: ['clubs'] },
  { name: 'Evnroll', groups: ['clubs'] },
  { name: 'Founders Club', groups: ['clubs'] },
  { name: 'Haywood Golf', groups: ['clubs'] },
  { name: 'Honma', groups: ['clubs'] },
  { name: 'Intech', groups: ['clubs'] },
  { name: 'Kirkland Signature', groups: ['balls', 'clubs'] },
  { name: 'L.A.B. Golf', groups: ['clubs'] },
  { name: 'Lynx Golf', groups: ['clubs'] },
  { name: 'MacGregor', groups: ['clubs'] },
  { name: 'Maxfli', groups: ['balls', 'clubs'] },
  { name: 'Miura', groups: ['clubs'] },
  { name: 'Mizuno', groups: ['clubs', 'apparel', 'balls'] },
  { name: 'Nike Golf', groups: ['clubs', 'balls', 'apparel'] },
  { name: 'Odyssey', groups: ['clubs'] },
  { name: 'OnCore Golf', groups: ['balls'] },
  { name: 'Orlimar', groups: ['clubs'] },
  { name: 'PING', groups: ['clubs', 'bags', 'apparel'] },
  { name: 'Pinemeadow', groups: ['clubs'] },
  { name: 'PowerBilt', groups: ['clubs'] },
  { name: 'PXG', groups: ['clubs', 'apparel', 'bags'] },
  { name: 'Ram Golf', groups: ['clubs'] },
  { name: 'Robin Golf', groups: ['clubs'] },
  { name: 'Rife', groups: ['clubs'] },
  { name: 'Scotty Cameron', groups: ['clubs'] },
  { name: 'SeeMore Putters', groups: ['clubs'] },
  { name: 'Snell Golf', groups: ['balls'] },
  { name: 'Srixon', groups: ['clubs', 'balls', 'bags'] },
  { name: 'Stix Golf', groups: ['clubs'] },
  { name: 'Sub 70 Golf', groups: ['clubs'] },
  { name: 'TaylorMade', groups: ['clubs', 'balls', 'bags', 'apparel'] },
  { name: 'Titleist', groups: ['clubs', 'balls', 'bags', 'apparel'] },
  { name: 'Tommy Armour', groups: ['clubs'] },
  { name: 'Top Flite', groups: ['balls', 'clubs'] },
  { name: 'Tour Edge', groups: ['clubs'] },
  { name: 'Toulon Design', groups: ['clubs'] },
  { name: 'Vice Golf', groups: ['balls', 'clubs'] },
  { name: 'Volvik', groups: ['balls'] },
  { name: 'Vokey Design', groups: ['clubs'] },
  { name: 'Wilson Staff', groups: ['clubs', 'balls', 'bags'] },
  { name: 'Wilson Sporting Goods', groups: ['clubs', 'balls'] },
  { name: 'XXIO', groups: ['clubs', 'balls'] },
  { name: 'Yamaha Golf', groups: ['clubs'] },
  { name: 'Yes! Golf', groups: ['clubs'] },
  // Apparel / footwear
  { name: 'adidas Golf', groups: ['apparel'] },
  { name: 'Ashworth Golf', groups: ['apparel'] },
  { name: 'FootJoy', groups: ['apparel'] },
  { name: 'Galvin Green', groups: ['apparel'] },
  { name: 'G/Fore', groups: ['apparel'] },
  { name: 'J.Lindeberg', groups: ['apparel'] },
  { name: 'PGA Tour Apparel', groups: ['apparel'] },
  { name: 'Peter Millar', groups: ['apparel'] },
  { name: 'PUMA Golf', groups: ['apparel'] },
  { name: 'Ralph Lauren Polo Golf', groups: ['apparel'] },
  { name: 'TravisMathew', groups: ['apparel'] },
  { name: 'Under Armour Golf', groups: ['apparel'] },
  { name: 'Sun Mountain Golf', groups: ['apparel', 'bags'] },
  // Bags, grips, carts, launch / rangefinder brands often resold
  { name: 'Bag Boy', groups: ['bags', 'accessories'] },
  { name: 'Bushnell Golf', groups: ['accessories'] },
  { name: 'Caddytek', groups: ['accessories', 'bags'] },
  { name: 'Champ Spikes', groups: ['accessories'] },
  { name: 'Club Glove', groups: ['bags', 'accessories'] },
  { name: 'Clicgear', groups: ['bags', 'accessories'] },
  { name: 'FlightScope', groups: ['accessories'] },
  { name: 'Garmin Golf', groups: ['accessories'] },
  { name: 'Golf Pride', groups: ['accessories', 'clubs'] },
  { name: 'Grip Master', groups: ['accessories'] },
  { name: 'Iomic', groups: ['accessories'] },
  { name: 'JumboMax', groups: ['accessories', 'clubs'] },
  { name: 'Lamkin Grips', groups: ['accessories', 'clubs'] },
  { name: 'Motocaddy', groups: ['bags', 'accessories'] },
  { name: 'Ogio', groups: ['bags', 'accessories'] },
  { name: 'Rovic', groups: ['bags'] },
  { name: 'SkyTrak', groups: ['accessories'] },
  { name: 'SuperStroke', groups: ['accessories', 'clubs'] },
  { name: 'Voice Caddie', groups: ['accessories'] },
];

const sortedUnique = [...GOLF_BRAND_ENTRIES].sort((a, b) =>
  a.name.localeCompare(b.name, undefined, { sensitivity: 'base' })
);

/** Alphabetically sorted brand names (deduped by name, first wins). */
export const GOLF_BRAND_NAMES = Array.from(
  new Map(sortedUnique.map((e) => [e.name.toLowerCase(), e.name])).values()
);

/**
 * Default brand-tab filter from TeeUp listing category (sell form).
 * @param {string} category
 * @returns {BrandGroup | 'all'}
 */
export function getDefaultBrandGroupForCategory(category) {
  switch (category) {
    case 'Driver':
    case 'Woods':
    case 'Iron':
    case 'Putters':
      return 'clubs';
    case 'Apparel':
      return 'apparel';
    case 'Accessories':
      return 'accessories';
    default:
      return 'all';
  }
}

/**
 * Listing category → sensible default chip in brand picker modal.
 */
export function getDefaultBrandPickerFilter(category) {
  const g = getDefaultBrandGroupForCategory(category);
  if (g === 'accessories') return 'gear';
  return g === 'clubs' ? 'clubs' : g === 'apparel' ? 'apparel' : g === 'balls' ? 'balls' : 'all';
}

/** @typedef {BrandGroup | 'all' | 'gear'} BrandPickerFilter */

/**
 * @param {string} query
 * @param {BrandPickerFilter} filterKey gear = bags + accessories
 */
export function filterBrandEntries(query, filterKey) {
  const q = query.trim().toLowerCase();
  return GOLF_BRAND_ENTRIES.filter((entry) => {
    if (filterKey === 'gear') {
      if (!entry.groups.some((gr) => gr === 'accessories' || gr === 'bags')) return false;
    } else if (filterKey !== 'all' && !entry.groups.includes(filterKey)) return false;
    if (!q) return true;
    return entry.name.toLowerCase().includes(q);
  }).sort((a, b) => a.name.localeCompare(b.name, undefined, { sensitivity: 'base' }));
}
