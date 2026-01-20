export interface SearchPreset {
  id: number;
  name: string;
  search: string;
  category?: number | null;
  tag?: number | null;
  createdAt: string;
}

export interface SearchPresetStorage {
  presets: SearchPreset[];
  lastUpdated: string;
}
