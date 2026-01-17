"use client"

import { useState, useEffect, useRef, useCallback } from 'react';
import { AutoSaveConfig, DraftData } from '@/types/data';

const DEFAULT_AUTO_SAVE_INTERVAL = 30000;
const DEFAULT_DEBOUNCE_MS = 1000;

export interface UseAutoSaveReturn<T = Record<string, unknown>> {
   isAutoSaving: boolean;
   lastSavedAt: Date | null;
   saveDraft: () => void;
   clearDraft: () => void;
   restoreDraft: () => T | null;
   hasDraft: boolean;
}

export function useAutoSave<T extends object>(
   config: AutoSaveConfig<T>
): UseAutoSaveReturn<T> {
   const {
      formId,
      data,
      onSave,
      onRestore,
      autoSaveInterval = DEFAULT_AUTO_SAVE_INTERVAL,
      debounceMs = DEFAULT_DEBOUNCE_MS,
      enabled = true
   } = config;

   const [isAutoSaving, setIsAutoSaving] = useState(false);
   const [lastSavedAt, setLastSavedAt] = useState<Date | null>(null);
   const [hasDraft, setHasDraft] = useState(false);

   const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null);
   const intervalRef = useRef<NodeJS.Timeout | null>(null);

   const getStorageKey = useCallback(() => `draft_${formId}`, [formId]);

   const loadDraft = useCallback((): T | null => {
      if (typeof window === 'undefined') return null;

      try {
         const storageKey = getStorageKey();
         const stored = localStorage.getItem(storageKey);
         if (stored) {
            const draft: DraftData<T> = JSON.parse(stored);
            return draft.data;
         }
      } catch (error) {
         console.error(`Failed to load draft for ${formId}:`, error);
      }
      return null;
   }, [formId, getStorageKey]);

   const saveDraftInternal = useCallback(async (draftData: T): Promise<void> => {
      if (typeof window === 'undefined') return;

      setIsAutoSaving(true);

      try {
         const draft: DraftData<T> = {
            data: draftData,
            savedAt: new Date().toISOString(),
            formId
         };

         const storageKey = getStorageKey();
         localStorage.setItem(storageKey, JSON.stringify(draft));
         setLastSavedAt(new Date());
         setHasDraft(true);

         await onSave?.(draftData);
      } catch (error) {
         console.error(`Failed to save draft for ${formId}:`, error);
      } finally {
         setIsAutoSaving(false);
      }
   }, [formId, onSave, getStorageKey]);

   useEffect(() => {
      if (!enabled) return;

      const handler = setTimeout(() => {
         saveDraftInternal(data);
      }, debounceMs);

      saveTimeoutRef.current = handler;

      return () => {
         if (saveTimeoutRef.current) {
            clearTimeout(saveTimeoutRef.current);
         }
      };
   }, [data, debounceMs, enabled, saveDraftInternal]);

   useEffect(() => {
      const draft = loadDraft();
      setHasDraft(draft !== null);
      if (draft && onRestore) {
         onRestore(draft);
      }
   }, [loadDraft, onRestore]);

   useEffect(() => {
      if (!enabled) return;

      const interval = setInterval(() => {
         saveDraftInternal(data);
      }, autoSaveInterval);

      intervalRef.current = interval;

      return () => {
         if (intervalRef.current) {
            clearInterval(intervalRef.current);
         }
      };
   }, [data, autoSaveInterval, enabled, saveDraftInternal]);

   const saveDraft = useCallback(() => {
      saveDraftInternal(data);
   }, [data, saveDraftInternal]);

   const clearDraft = useCallback(() => {
      if (typeof window === 'undefined') return;

      try {
         const storageKey = getStorageKey();
         localStorage.removeItem(storageKey);
         setLastSavedAt(null);
         setHasDraft(false);
      } catch (error) {
         console.error(`Failed to clear draft for ${formId}:`, error);
      }
   }, [formId, getStorageKey]);

   const restoreDraft = useCallback((): T | null => {
      return loadDraft();
   }, [loadDraft]);

   useEffect(() => {
      return () => {
         if (saveTimeoutRef.current) {
            clearTimeout(saveTimeoutRef.current);
         }
         if (intervalRef.current) {
            clearInterval(intervalRef.current);
         }
      };
   }, []);

   return {
      isAutoSaving,
      lastSavedAt,
      saveDraft,
      clearDraft,
      restoreDraft,
      hasDraft
   };
}