export const CATEGORY_OPTIONS = ['Driver', 'Iron', 'Woods', 'Putters', 'Apparel', 'Accessories', 'Others'];

export const formatPriceLabel = (price) => {
  if (typeof price === 'number' && Number.isFinite(price)) {
    return `₱${price.toLocaleString()}`;
  }

  if (typeof price === 'string') {
    const numeric = Number(price.replace(/[^\d.]/g, ''));
    if (!Number.isNaN(numeric) && Number.isFinite(numeric) && numeric > 0) {
      return `₱${numeric.toLocaleString()}`;
    }
  }

  return `₱${price || '0'}`;
};

export const extractPhotos = (photos) => {
  if (Array.isArray(photos)) {
    return photos;
  }
  if (typeof photos === 'string') {
    try {
      const parsed = JSON.parse(photos);
      return Array.isArray(parsed) ? parsed : [];
    } catch (err) {
      return [];
    }
  }
  return [];
};

const mapCategoryKey = (value = '') => {
  const normalized = value?.toString().trim().toLowerCase();
  if (!normalized) return 'others';
  if (normalized.includes('driver')) return 'driver';
  if (normalized.includes('iron')) return 'iron';
  if (normalized.includes('wood')) return 'woods';
  if (normalized.includes('putter')) return 'putters';
  if (normalized.includes('apparel') || normalized.includes('clothing')) return 'apparel';
  if (normalized.includes('accessor')) return 'accessories';
  return 'others';
};

export const doesListingMatchCategory = (listingCategory, targetCategory) => {
  const listingKey = mapCategoryKey(listingCategory);
  const targetKey = mapCategoryKey(targetCategory);
  if (targetKey === 'others') {
    return !['driver', 'iron', 'woods', 'putters', 'apparel', 'accessories'].includes(listingKey);
  }
  return listingKey === targetKey;
};

export const normalizeCategoryParam = (category) => {
  if (CATEGORY_OPTIONS.includes(category)) {
    return category;
  }
  const mapped = mapCategoryKey(category);
  const matched = CATEGORY_OPTIONS.find(
    (option) => mapCategoryKey(option) === mapped
  );
  return matched || CATEGORY_OPTIONS[0];
};


