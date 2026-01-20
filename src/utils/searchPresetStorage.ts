import { SearchPreset, SearchPresetStorage } from '@/types/search';

const STORAGE_KEY = 'maskom_search_presets';
const MAX_PRESETS = 10;

function getStorageData(): SearchPresetStorage {
  if (typeof window === 'undefined') {
    return { presets: [], lastUpdated: new Date().toISOString() };
  }

  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      const data: SearchPresetStorage = JSON.parse(stored);
      return data;
    }
  } catch (error) {
    console.error('Error reading search presets from storage:', error);
  }

  return { presets: [], lastUpdated: new Date().toISOString() };
}

function setStorageData(data: SearchPresetStorage): void {
  if (typeof window === 'undefined') {
    return;
  }

  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch (error) {
    console.error('Error saving search presets to storage:', error);
  }
}

function getNextId(presets: SearchPreset[]): number {
  if (presets.length === 0) return 1;
  return Math.max(...presets.map(p => p.id)) + 1;
}

export function addPreset(
  preset: Omit<SearchPreset, 'id' | 'createdAt'>
): SearchPreset | null {
  const storageData = getStorageData();

  if (storageData.presets.length >= MAX_PRESETS) {
    return null;
  }

  const id = getNextId(storageData.presets);
  const newPreset: SearchPreset = {
    ...preset,
    id,
    createdAt: new Date().toISOString()
  };

  storageData.presets.push(newPreset);
  storageData.lastUpdated = new Date().toISOString();
  setStorageData(storageData);

  return newPreset;
}

export function updatePreset(
  id: number,
  updates: Partial<SearchPreset>
): SearchPreset | null {
  const storageData = getStorageData();
  const presetIndex = storageData.presets.findIndex(p => p.id === id);

  if (presetIndex === -1) {
    return null;
  }

  const updatedPreset: SearchPreset = {
    ...storageData.presets[presetIndex],
    ...updates,
    id
  };

  storageData.presets[presetIndex] = updatedPreset;
  storageData.lastUpdated = new Date().toISOString();
  setStorageData(storageData);

  return updatedPreset;
}

export function removePreset(id: number): boolean {
  const storageData = getStorageData();
  const initialLength = storageData.presets.length;
  storageData.presets = storageData.presets.filter(p => p.id !== id);

  if (storageData.presets.length < initialLength) {
    storageData.lastUpdated = new Date().toISOString();
    setStorageData(storageData);
    return true;
  }

  return false;
}

export function getPresets(): SearchPreset[] {
  const storageData = getStorageData();
  return storageData.presets.sort((a, b) =>
    new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );
}

export function getPresetById(id: number): SearchPreset | undefined {
  const storageData = getStorageData();
  return storageData.presets.find(p => p.id === id);
}

export function presetNameExists(name: string, excludeId?: number): boolean {
  const storageData = getStorageData();
  return storageData.presets.some(p =>
    p.name.toLowerCase() === name.toLowerCase() && p.id !== excludeId
  );
}

export function getPresetCount(): number {
  return getStorageData().presets.length;
}

export function clearPresets(): void {
  const storageData: SearchPresetStorage = {
    presets: [],
    lastUpdated: new Date().toISOString()
  };
  setStorageData(storageData);
}
