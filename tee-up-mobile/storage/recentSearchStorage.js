import AsyncStorage from '@react-native-async-storage/async-storage';

const MAX_RECENT_SEARCHES = 5;
const STORAGE_PREFIX = 'teeup_recent_searches_';

const buildStorageKey = (userId) => `${STORAGE_PREFIX}${userId}`;

const normalizeList = (list = []) => (Array.isArray(list) ? list : []);

export async function getRecentSearches(userId) {
  if (!userId) return [];
  try {
    const raw = await AsyncStorage.getItem(buildStorageKey(userId));
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return normalizeList(parsed);
  } catch (error) {
    console.error('Failed to load recent searches', error);
    return [];
  }
}

async function saveRecentSearches(userId, searches) {
  if (!userId) return;
  try {
    await AsyncStorage.setItem(
      buildStorageKey(userId),
      JSON.stringify(normalizeList(searches).slice(0, MAX_RECENT_SEARCHES))
    );
  } catch (error) {
    console.error('Failed to save recent searches', error);
  }
}

export async function addRecentSearch(userId, term) {
  if (!userId || !term) return [];
  const trimmed = term.trim();
  if (!trimmed.length) return [];

  const existing = await getRecentSearches(userId);
  const filtered = existing.filter(
    (item) => item.toLowerCase() !== trimmed.toLowerCase()
  );
  const updated = [trimmed, ...filtered].slice(0, MAX_RECENT_SEARCHES);
  await saveRecentSearches(userId, updated);
  return updated;
}

export async function removeRecentSearch(userId, term) {
  if (!userId) return [];
  const existing = await getRecentSearches(userId);
  const updated = existing.filter((item) => item !== term);
  await saveRecentSearches(userId, updated);
  return updated;
}

export async function clearRecentSearches(userId) {
  if (!userId) return [];
  try {
    await AsyncStorage.removeItem(buildStorageKey(userId));
  } catch (error) {
    console.error('Failed to clear recent searches', error);
  }
  return [];
}


