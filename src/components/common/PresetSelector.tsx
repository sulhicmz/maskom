'use client';

import React, { useState, useEffect } from 'react';
import { getPresets } from '@/utils/searchPresetStorage';
import type { BlogFilterCriteria } from '@/utils/blogFilters';
import type { SearchPreset } from '@/types/search';

export interface PresetSelectorProps {
  onPresetSelect: (criteria: BlogFilterCriteria) => void;
  onPresetDelete?: (presetId: number) => void;
  buttonClassName?: string;
}

export default function PresetSelector({
  onPresetSelect,
  onPresetDelete,
  buttonClassName = ''
}: PresetSelectorProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [presets, setPresets] = useState<SearchPreset[]>([]);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    loadPresets();
  }, []);

  const loadPresets = () => {
    const loadedPresets = getPresets();
    setPresets(loadedPresets);
  };

  const handlePresetClick = (preset: SearchPreset) => {
    onPresetSelect({
      searchQuery: preset.search,
      categoryId: preset.category,
      tagId: preset.tag
    });
    setIsOpen(false);
  };

  const handleDeletePreset = (e: React.MouseEvent, presetId: number) => {
    e.stopPropagation();
    onPresetDelete?.(presetId);
    loadPresets();
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      setIsOpen(false);
    }
  };

  if (!mounted) {
    return null;
  }

  return (
    <div className={`preset-selector ${isOpen ? 'open' : ''}`}>
      <button
        className={buttonClassName}
        onClick={() => setIsOpen(!isOpen)}
        aria-expanded={isOpen}
        aria-haspopup="listbox"
        aria-label="Pilih preset pencarian"
        type="button"
      >
        <i className="flaticon-bookmark" aria-hidden="true"></i>
        Preset
        <i className={`flaticon-arrow-down ${isOpen ? 'rotate' : ''}`} aria-hidden="true"></i>
      </button>

      {isOpen && (
        <div 
          className="preset-dropdown" 
          role="listbox" 
          onKeyPress={handleKeyPress}
        >
          {presets.length === 0 ? (
            <div className="preset-dropdown-empty">
              <p>Belum ada preset tersimpan</p>
              <small>Simpan filter untuk akses cepat nanti</small>
            </div>
          ) : (
            <ul className="preset-dropdown-list">
              {presets.map((preset) => (
                <li 
                  key={preset.id} 
                  role="option"
                  aria-selected="false"
                  className="preset-dropdown-item"
                >
                  <button
                    onClick={() => handlePresetClick(preset)}
                    className="preset-dropdown-btn"
                    aria-label={`Terapkan preset: ${preset.name}`}
                    type="button"
                  >
                    <div className="preset-info">
                      <span className="preset-name">{preset.name}</span>
                      <small className="preset-details">
                        {preset.search && `Pencarian: "${preset.search}"`}
                        {preset.search && (preset.category || preset.tag) && ' • '}
                        {preset.category && `Kategori: ${preset.category}`}
                        {preset.category && preset.tag && ' • '}
                        {preset.tag && `Tag: ${preset.tag}`}
                      </small>
                    </div>
                  </button>
                  {onPresetDelete && (
                    <button
                      onClick={(e) => handleDeletePreset(e, preset.id)}
                      className="preset-delete-btn"
                      aria-label={`Hapus preset: ${preset.name}`}
                      type="button"
                    >
                      <i className="flaticon-close" aria-hidden="true"></i>
                    </button>
                  )}
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}
