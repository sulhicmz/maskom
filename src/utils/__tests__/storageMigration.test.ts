import { StorageMigration, createMigration, Migration } from '../storageMigration';

describe('StorageMigration', () => {
  describe('StorageMigration class', () => {
    const migrations: Migration[] = [
      {
        version: '1.0.0',
        description: 'Initial version',
        up: (data: any) => data,
      },
      {
        version: '1.1.0',
        description: 'Add new field',
        up: (data: any) => ({
          ...data,
          newField: 'default',
        }),
        down: (data: any) => {
          const { newField: _newField, ...rest } = data;
          return rest;
        },
      },
      {
        version: '2.0.0',
        description: 'Major version change',
        up: (data: any) => ({
          ...data,
          version: 2,
        }),
        down: (data: any) => {
          const { version: _version, ...rest } = data;
          return rest;
        },
      },
    ];

    let migration: StorageMigration;

    beforeEach(() => {
      localStorage.clear();
      migration = createMigration({
        storageKey: 'test_storage',
        currentVersion: '2.0.0',
        migrations,
        logMigrations: false,
      });
    });

    afterEach(() => {
      localStorage.clear();
    });

    describe('migrate', () => {
      it('should migrate data from 0.0.0 to 2.0.0', () => {
        const initialData = { id: 'test', name: 'Test' };
        const result = migration.migrate(initialData);

        expect(result.success).toBe(true);
        expect(result.migrated).toBe(true);
        expect(result.fromVersion).toBe('0.0.0');
        expect(result.toVersion).toBe('2.0.0');
      });

      it('should apply all migrations in order', () => {
        const initialData = { id: 'test', name: 'Test' };
        migration.migrate(initialData);

        const history = JSON.parse(localStorage.getItem('maskom_migration_history') || '[]');
        const entry = history.find((h: any) => h.storageKey === 'test_storage');

        expect(entry.migrations).toEqual(['1.0.0', '1.1.0', '2.0.0']);
      });

      it('should not migrate if already at current version', () => {
        const initialData = { id: 'test', name: 'Test', version: 2, newField: 'default' };
        const result = migration.migrate(initialData);

        expect(result.success).toBe(true);
        expect(result.migrated).toBe(false);
      });

      it('should handle migration errors gracefully', () => {
        const brokenMigration = createMigration({
          storageKey: 'broken_storage',
          currentVersion: '2.0.0',
          migrations: [
            {
              version: '1.0.0',
              description: 'Broken migration',
              up: () => {
                throw new Error('Migration failed');
              },
            },
          ],
          logMigrations: false,
        });

        const result = brokenMigration.migrate({ id: 'test' });

        expect(result.success).toBe(false);
        expect(result.migrated).toBe(false);
        expect(result.error).toBeDefined();
      });
    });

    describe('rollback', () => {
      beforeEach(() => {
        const initialData = { id: 'test', name: 'Test' };
        migration.migrate(initialData);
      });

      it('should rollback from 2.0.0 to 1.0.0', () => {
        const currentData = { id: 'test', name: 'Test', version: 2, newField: 'default' };
        const result = migration.rollback(currentData, '1.0.0');

        expect(result.success).toBe(true);
        expect(result.migrated).toBe(true);
        expect(result.fromVersion).toBe('2.0.0');
        expect(result.toVersion).toBe('1.0.0');
      });

      it('should not rollback if at target version', () => {
        const currentData = { id: 'test', name: 'Test' };
        const result = migration.rollback(currentData, '2.0.0');

        expect(result.success).toBe(true);
        expect(result.migrated).toBe(false);
      });

      it('should fail rollback for missing down function', () => {
        const noDownMigration = createMigration({
          storageKey: 'no_down_storage',
          currentVersion: '1.0.0',
          migrations: [
            {
              version: '1.0.0',
              description: 'No down function',
              up: (data: any) => data,
            },
          ],
          logMigrations: false,
        });

        const result = noDownMigration.rollback({ id: 'test' }, '0.0.0');

        expect(result.success).toBe(false);
        expect(result.error).toContain('does not support rollback');
      });
    });

    describe('getCurrentVersion', () => {
      it('should return the current version', () => {
        expect(migration.getCurrentVersion()).toBe('2.0.0');
      });
    });

    describe('resetHistory', () => {
      it('should clear migration history for storage key', () => {
        const initialData = { id: 'test', name: 'Test' };
        migration.migrate(initialData);

        migration.resetHistory();

        const history = JSON.parse(localStorage.getItem('maskom_migration_history') || '[]');
        const entry = history.find((h: any) => h.storageKey === 'test_storage');

        expect(entry).toBeUndefined();
      });
    });

    describe('version comparison', () => {
      it('should migrate in correct version order', () => {
        const initialData = { id: 'test', name: 'Test' };
        migration.migrate(initialData);
        
        const history = JSON.parse(localStorage.getItem('maskom_migration_history') || '[]');
        const entry = history.find((h: any) => h.storageKey === 'test_storage');

        expect(entry.migrations).toEqual(['1.0.0', '1.1.0', '2.0.0']);
      });
    });

    describe('createMigration helper', () => {
      it('should create a new StorageMigration instance', () => {
        const migration = createMigration({
          storageKey: 'test_storage',
          currentVersion: '1.0.0',
          migrations,
        });

        expect(migration).toBeInstanceOf(StorageMigration);
      });
    });
  });
});
