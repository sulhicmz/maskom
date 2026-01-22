'use client';

import React, { useState } from 'react';
import { addPreset, getPresetCount, presetNameExists } from '@/utils/searchPresetStorage';
import { validatePresetName } from '@/utils/searchPresetValidation';
import type { BlogFilterCriteria } from '@/utils/blogFilters';

export interface SavePresetButtonProps {
  filterCriteria: BlogFilterCriteria;
  onPresetSaved?: (presetName: string) => void;
  buttonClassName?: string;
}

export default function SavePresetButton({
  filterCriteria,
  onPresetSaved,
  buttonClassName = ''
}: SavePresetButtonProps) {
  const [showModal, setShowModal] = useState(false);
  const [presetName, setPresetName] = useState('');
  const [errors, setErrors] = useState<string[]>([]);
  const [isSaving, setIsSaving] = useState(false);
  const [mounted, setMounted] = useState(false);

  React.useEffect(() => {
    setMounted(true);
  }, []);

  const handleSavePreset = () => {
    const validation = validatePresetName(presetName);
    
    if (!validation.valid) {
      setErrors(validation.errors);
      return;
    }

    if (presetNameExists(presetName)) {
      setErrors(['Preset name already exists']);
      return;
    }

    setIsSaving(true);

    try {
      const preset = addPreset({
        name: presetName.trim(),
        search: filterCriteria.searchQuery || '',
        category: filterCriteria.categoryId,
        tag: filterCriteria.tagId
      });

      if (preset) {
        onPresetSaved?.(preset.name);
        setPresetName('');
        setErrors([]);
        setShowModal(false);
      } else {
        setErrors(['Maximum preset limit reached (10 presets)']);
      }
    } finally {
      setIsSaving(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      setShowModal(false);
      setPresetName('');
      setErrors([]);
    }
  };

  if (!mounted || !filterCriteria.searchQuery && !filterCriteria.categoryId && !filterCriteria.tagId) {
    return null;
  }

  return (
    <>
      <button
        className={buttonClassName}
        onClick={() => setShowModal(true)}
        aria-label="Simpan filter sebagai preset"
        type="button"
      >
        <i className="flaticon-bookmark" aria-hidden="true"></i>
        Simpan Filter
      </button>

      {showModal && (
        <div
          className="modal-overlay"
          role="dialog"
          aria-modal="true"
          aria-labelledby="preset-modal-title"
          onKeyDown={handleKeyPress}
        >
          <div className="modal-content">
            <div className="modal-header">
              <h3 id="preset-modal-title">Simpan Sebagai Preset</h3>
              <button
                onClick={() => {
                  setShowModal(false);
                  setPresetName('');
                  setErrors([]);
                }}
                aria-label="Tutup"
                type="button"
              >
                <i className="flaticon-close" aria-hidden="true"></i>
              </button>
            </div>
            <div className="modal-body">
              <div className="form-group">
                <label htmlFor="preset-name-input">
                  Nama Preset <span className="required">*</span>
                </label>
                <input
                  id="preset-name-input"
                  type="text"
                  value={presetName}
                  onChange={(e) => {
                    setPresetName(e.target.value);
                    if (errors.length > 0) setErrors([]);
                  }}
                  placeholder="Masukkan nama preset (3-30 karakter)"
                  maxLength={30}
                  disabled={isSaving}
                  aria-invalid={errors.length > 0}
                  aria-describedby={errors.length > 0 ? 'preset-name-error' : undefined}
                />
                {errors.length > 0 && (
                  <div 
                    id="preset-name-error" 
                    className="error-message" 
                    role="alert" 
                    aria-live="polite"
                  >
                    {errors.map((error, index) => (
                      <p key={index}>{error}</p>
                    ))}
                  </div>
                )}
                <small className="help-text">
                  Jumlah preset saat ini: {getPresetCount()} / 10
                </small>
              </div>
              <div className="preset-preview">
                <p><strong>Filter yang akan disimpan:</strong></p>
                <ul>
                  {filterCriteria.searchQuery && (
                    <li>Pencarian: &quot;{filterCriteria.searchQuery}&quot;</li>
                  )}
                  {filterCriteria.categoryId && (
                    <li>Kategori ID: {filterCriteria.categoryId}</li>
                  )}
                  {filterCriteria.tagId && (
                    <li>Tag ID: {filterCriteria.tagId}</li>
                  )}
                </ul>
              </div>
            </div>
            <div className="modal-footer">
              <button
                onClick={() => {
                  setShowModal(false);
                  setPresetName('');
                  setErrors([]);
                }}
                className="btn-cancel"
                disabled={isSaving}
                type="button"
              >
                Batal
              </button>
              <button
                onClick={handleSavePreset}
                className="btn-primary"
                disabled={isSaving || presetName.trim().length === 0}
                type="submit"
              >
                {isSaving ? 'Menyimpan...' : 'Simpan Preset'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
