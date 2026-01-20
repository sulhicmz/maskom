import { 
  addPreset, 
  updatePreset, 
  removePreset, 
  getPresets, 
  getPresetById, 
  presetNameExists, 
  getPresetCount, 
  clearPresets 
} from '../searchPresetStorage';

describe('searchPresetStorage', () => {
  beforeEach(() => {
    clearPresets();
  });

  afterEach(() => {
    clearPresets();
  });

  describe('addPreset', () => {
    it('should add a new preset', () => {
      const preset = addPreset({
        name: 'Tech Articles',
        search: 'technology',
        category: 1,
        tag: 5
      });

      expect(preset).not.toBeNull();
      expect(preset?.id).toBeGreaterThan(0);
      expect(preset?.name).toBe('Tech Articles');
      expect(preset?.search).toBe('technology');
      expect(preset?.category).toBe(1);
      expect(preset?.tag).toBe(5);
      expect(preset?.createdAt).toBeDefined();
    });

    it('should add preset with only search query', () => {
      const preset = addPreset({
        name: 'Search Only',
        search: 'javascript'
      });

      expect(preset).not.toBeNull();
      expect(preset?.search).toBe('javascript');
      expect(preset?.category).toBeUndefined();
      expect(preset?.tag).toBeUndefined();
    });

    it('should return null when max presets reached', () => {
      for (let i = 0; i < 10; i++) {
        addPreset({
          name: `Preset ${i}`,
          search: `search${i}`
        });
      }

      const result = addPreset({
        name: 'Exceeds Limit',
        search: 'test'
      });

      expect(result).toBeNull();
    });

    it('should assign unique IDs to presets', () => {
      const preset1 = addPreset({
        name: 'First',
        search: 'search1'
      });

      const preset2 = addPreset({
        name: 'Second',
        search: 'search2'
      });

      expect(preset1?.id).toBe(1);
      expect(preset2?.id).toBe(2);
    });
  });

  describe('updatePreset', () => {
    it('should update existing preset', () => {
      const preset = addPreset({
        name: 'Original Name',
        search: 'original'
      });

      const updated = updatePreset(preset!.id, {
        name: 'Updated Name',
        search: 'updated'
      });

      expect(updated).not.toBeNull();
      expect(updated?.id).toBe(preset!.id);
      expect(updated?.name).toBe('Updated Name');
      expect(updated?.search).toBe('updated');
    });

    it('should return null for non-existent preset', () => {
      const result = updatePreset(999, {
        name: 'Update',
        search: 'test'
      });

      expect(result).toBeNull();
    });

    it('should preserve original ID when updating', () => {
      const preset = addPreset({
        name: 'Test',
        search: 'test'
      });

      const updated = updatePreset(preset!.id, {
        name: 'New Name'
      });

      expect(updated?.id).toBe(preset!.id);
    });
  });

  describe('removePreset', () => {
    it('should remove existing preset', () => {
      const preset = addPreset({
        name: 'To Remove',
        search: 'remove'
      });

      const result = removePreset(preset!.id);

      expect(result).toBe(true);
      expect(getPresets()).toHaveLength(0);
    });

    it('should return false for non-existent preset', () => {
      const result = removePreset(999);

      expect(result).toBe(false);
    });

    it('should only remove the specified preset', () => {
      const preset1 = addPreset({
        name: 'Keep 1',
        search: 'keep1'
      });

      const preset2 = addPreset({
        name: 'Remove',
        search: 'remove'
      });

      const preset3 = addPreset({
        name: 'Keep 2',
        search: 'keep2'
      });

      removePreset(preset2!.id);

      const remaining = getPresets();
      expect(remaining).toHaveLength(2);
      expect(remaining.find(p => p.id === preset1!.id)).toBeDefined();
      expect(remaining.find(p => p.id === preset3!.id)).toBeDefined();
    });
  });

  describe('getPresets', () => {
    it('should return empty array when no presets', () => {
      const presets = getPresets();

      expect(presets).toEqual([]);
    });

    it('should return all presets sorted by creation date (newest first)', () => {
      addPreset({
        name: 'First',
        search: 'first'
      });

      setTimeout(() => {
        addPreset({
          name: 'Second',
          search: 'second'
        });

        const presets = getPresets();

        expect(presets).toHaveLength(2);
        expect(presets[0].name).toBe('Second');
        expect(presets[1].name).toBe('First');
      }, 10);
    });
  });

  describe('getPresetById', () => {
    it('should return preset by ID', () => {
      const preset = addPreset({
        name: 'Find Me',
        search: 'find'
      });

      const found = getPresetById(preset!.id);

      expect(found).toBeDefined();
      expect(found?.name).toBe('Find Me');
    });

    it('should return undefined for non-existent ID', () => {
      const found = getPresetById(999);

      expect(found).toBeUndefined();
    });
  });

  describe('presetNameExists', () => {
    it('should return true for existing name', () => {
      addPreset({
        name: 'Existing',
        search: 'test'
      });

      const exists = presetNameExists('Existing');

      expect(exists).toBe(true);
    });

    it('should return false for non-existing name', () => {
      const exists = presetNameExists('Non-existing');

      expect(exists).toBe(false);
    });

    it('should be case-insensitive', () => {
      addPreset({
        name: 'Test Preset',
        search: 'test'
      });

      expect(presetNameExists('test preset')).toBe(true);
      expect(presetNameExists('TEST PRESET')).toBe(true);
    });

    it('should exclude preset ID when checking', () => {
      const preset = addPreset({
        name: 'Update Test',
        search: 'test'
      });

      const exists = presetNameExists('Update Test', preset!.id);

      expect(exists).toBe(false);
    });
  });

  describe('getPresetCount', () => {
    it('should return 0 when no presets', () => {
      const count = getPresetCount();

      expect(count).toBe(0);
    });

    it('should return correct count', () => {
      addPreset({
        name: 'Preset 1',
        search: 'search1'
      });

      addPreset({
        name: 'Preset 2',
        search: 'search2'
      });

      addPreset({
        name: 'Preset 3',
        search: 'search3'
      });

      const count = getPresetCount();

      expect(count).toBe(3);
    });
  });

  describe('clearPresets', () => {
    it('should clear all presets', () => {
      addPreset({
        name: 'Preset 1',
        search: 'search1'
      });

      addPreset({
        name: 'Preset 2',
        search: 'search2'
      });

      clearPresets();

      expect(getPresets()).toHaveLength(0);
      expect(getPresetCount()).toBe(0);
    });
  });

  describe('SSR Compatibility', () => {
    it('should not throw error when window is undefined', () => {
      const originalWindow = global.window;

      delete (global as any).window;

      expect(() => {
        getPresets();
        addPreset({
          name: 'Test',
          search: 'test'
        });
      }).not.toThrow();

      global.window = originalWindow;
    });
  });
});
