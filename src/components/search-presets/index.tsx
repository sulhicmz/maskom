'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { getPresets, removePreset, updatePreset, presetNameExists } from '@/utils/searchPresetStorage';
import { validatePresetName } from '@/utils/searchPresetValidation';
import { SearchPreset } from '@/types/search';
import PageBuilder from '@/components/common/PageBuilder';
import { tagsById } from '@/data/BlogTagData';
import { blogCategoryById } from '@/data/BlogCategoryData';

export default function SearchPresetsPage() {
  const [presets, setPresets] = useState<SearchPreset[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingPreset, setEditingPreset] = useState<SearchPreset | null>(null);
  const [editName, setEditName] = useState('');
  const [editErrors, setEditErrors] = useState<string[]>([]);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    loadPresets();
  }, []);

  const loadPresets = () => {
    setLoading(true);
    const savedPresets = getPresets();
    setPresets(savedPresets);
    setLoading(false);
  };

  const handleDeletePreset = (presetId: number) => {
    if (confirm('Apakah Anda yakin ingin menghapus preset ini?')) {
      removePreset(presetId);
      loadPresets();
    }
  };

  const handleEditStart = (preset: SearchPreset) => {
    setEditingPreset(preset);
    setEditName(preset.name);
    setEditErrors([]);
  };

  const handleEditCancel = () => {
    setEditingPreset(null);
    setEditName('');
    setEditErrors([]);
  };

  const handleEditSave = () => {
    if (!editingPreset) return;

    const validation = validatePresetName(editName);
    
    if (!validation.valid) {
      setEditErrors(validation.errors);
      return;
    }

    if (presetNameExists(editName, editingPreset.id)) {
      setEditErrors(['Nama preset sudah ada']);
      return;
    }

    setIsSaving(true);

    try {
      updatePreset(editingPreset.id, { name: editName.trim() });
      loadPresets();
      handleEditCancel();
    } finally {
      setIsSaving(false);
    }
  };

  const handleApplyPreset = (preset: SearchPreset) => {
    const params = new URLSearchParams();
    
    if (preset.search) {
      params.set('search', preset.search);
    }
    if (preset.category) {
      params.set('category', preset.category.toString());
    }
    if (preset.tag) {
      params.set('tag', preset.tag.toString());
    }

    window.location.href = `/blog?${params.toString()}`;
  };

  if (loading) {
    return (
      <PageBuilder
        title="Preset Pencarian"
        subTitle="Kelola filter pencarian tersimpan"
        content={
          <div className="text-center py-5">
            <div className="spinner-border text-primary" role="status">
              <span className="visually-hidden">Loading...</span>
            </div>
          </div>
        }
      />
    );
  }

  if (presets.length === 0) {
    return (
      <PageBuilder
        title="Preset Pencarian"
        subTitle="Kelola filter pencarian tersimpan"
        content={
          <div className="container py-5 text-center">
            <div className="alert alert-info mt-4">
              <i className="flaticon-bookmark me-2" aria-hidden="true" />
              Belum ada preset tersimpan
            </div>
            <p className="mb-3">Simpan filter pencarian untuk akses cepat nanti</p>
            <Link href="/blog" className="btn btn-primary">
              <i className="flaticon-arrow-right me-1" aria-hidden="true" />
              Ke Blog
            </Link>
          </div>
        }
      />
    );
  }

  return (
    <PageBuilder
      title="Preset Pencarian"
      subTitle={`${presets.length} preset tersimpan`}
      content={
        <div className="container py-5">
          <div className="row mt-4">
            {presets.map((preset) => (
              <div key={preset.id} className="col-md-6 col-lg-4 mb-4">
                <div className="card h-100 preset-card">
                  <div className="card-body">
                    {editingPreset?.id === preset.id ? (
                      <div className="preset-edit-form">
                        <label htmlFor={`preset-name-${preset.id}`} className="form-label">
                          Nama Preset <span className="required">*</span>
                        </label>
                        <input
                          id={`preset-name-${preset.id}`}
                          type="text"
                          value={editName}
                          onChange={(e) => {
                            setEditName(e.target.value);
                            if (editErrors.length > 0) setEditErrors([]);
                          }}
                          placeholder="Nama preset (3-30 karakter)"
                          maxLength={30}
                          disabled={isSaving}
                          aria-invalid={editErrors.length > 0}
                          aria-describedby={editErrors.length > 0 ? `preset-error-${preset.id}` : undefined}
                        />
                        {editErrors.length > 0 && (
                          <div 
                            id={`preset-error-${preset.id}`} 
                            className="error-message" 
                            role="alert" 
                            aria-live="polite"
                          >
                            {editErrors.map((error, index) => (
                              <p key={index}>{error}</p>
                            ))}
                          </div>
                        )}
                        <div className="preset-edit-actions mt-3">
                          <button
                            onClick={handleEditCancel}
                            className="btn btn-outline-secondary me-2"
                            disabled={isSaving}
                            type="button"
                          >
                            <i className="flaticon-close me-1" aria-hidden="true" />
                            Batal
                          </button>
                          <button
                            onClick={handleEditSave}
                            className="btn btn-primary"
                            disabled={isSaving || editName.trim().length === 0}
                            type="submit"
                          >
                            {isSaving ? 'Menyimpan...' : 'Simpan'}
                          </button>
                        </div>
                      </div>
                    ) : (
                      <>
                        <h5 className="card-title">{preset.name}</h5>
                        <div className="preset-filters mb-3">
                          {preset.search && (
                            <div className="preset-filter-item">
                              <i className="flaticon-search me-1" aria-hidden="true" />
                              <span>Pencarian:</span>
                              <strong>&quot;{preset.search}&quot;</strong>
                            </div>
                          )}
                          {preset.category && (
                            <div className="preset-filter-item">
                              <i className="flaticon-folder me-1" aria-hidden="true" />
                              <span>Kategori:</span>
                              <strong>{blogCategoryById.get(preset.category)?.name || preset.category}</strong>
                            </div>
                          )}
                          {preset.tag && (
                            <div className="preset-filter-item">
                              <i className="flaticon-price-tag me-1" aria-hidden="true" />
                              <span>Tag:</span>
                              <strong>{tagsById.get(preset.tag)?.name || preset.tag}</strong>
                            </div>
                          )}
                        </div>
                        <p className="text-muted small mb-3">
                          <i className="flaticon-clock me-1" aria-hidden="true" />
                          Dibuat: {new Date(preset.createdAt).toLocaleDateString('id-ID')}
                        </p>
                        <div className="preset-actions">
                          <button
                            onClick={() => handleApplyPreset(preset)}
                            className="btn btn-primary btn-sm flex-grow-1 me-2"
                            aria-label={`Terapkan preset: ${preset.name}`}
                            type="button"
                          >
                            <i className="flaticon-search me-1" aria-hidden="true" />
                            Terapkan
                          </button>
                          <button
                            onClick={() => handleEditStart(preset)}
                            className="btn btn-outline-secondary btn-sm me-2"
                            aria-label={`Edit preset: ${preset.name}`}
                            type="button"
                          >
                            <i className="flaticon-edit me-1" aria-hidden="true" />
                            Edit
                          </button>
                          <button
                            onClick={() => handleDeletePreset(preset.id)}
                            className="btn btn-outline-danger btn-sm"
                            aria-label={`Hapus preset: ${preset.name}`}
                            type="button"
                          >
                            <i className="flaticon-delete me-1" aria-hidden="true" />
                            Hapus
                          </button>
                        </div>
                      </>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      }
    />
  );
}
