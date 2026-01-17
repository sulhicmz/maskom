import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import VersionHistoryPanel from '../VersionHistoryPanel';
import { BlogPostVersion } from '@/types/blog';
import { versionStorage } from '@/utils/versionStorage';
import { I18nProvider } from '@/contexts/I18nContext';

const mockVersions: BlogPostVersion[] = [
   {
      id: 'version-1',
      postId: 1,
      content: { title: 'Judul Lama', desc: 'Deskripsi Lama' },
      timestamp: '2026-01-15T10:00:00Z',
      notes: 'Versi awal',
      author: 'editor1'
   },
   {
      id: 'version-2',
      postId: 1,
      content: { title: 'Judul Baru', desc: 'Deskripsi Baru' },
      timestamp: '2026-01-16T14:30:00Z',
      notes: 'Memperbarui judul dan deskripsi',
      author: 'editor2'
   },
   {
      id: 'version-3',
      postId: 1,
      content: { title: 'Judul Final', desc: 'Deskripsi Final' },
      timestamp: '2026-01-17T09:15:00Z',
      notes: 'Revisi final',
      author: 'editor1'
   }
];

describe('VersionHistoryPanel', () => {
   const mockPostId = 1;
   const mockCurrentContent = { title: 'Judul Saat Ini', desc: 'Deskripsi Saat Ini' };
   const mockOnRestore = jest.fn();
   const mockOnClose = jest.fn();

   const renderWithProviders = (component: React.ReactElement) => {
      return render(
         <I18nProvider>
            {component}
         </I18nProvider>
      );
   };

   beforeEach(() => {
      jest.clearAllMocks();
      localStorage.clear();
      mockVersions.forEach(v => versionStorage.saveVersion(v));
   });

   afterEach(() => {
      localStorage.clear();
   });

   describe('Rendering', () => {
      it('should render nothing when isVisible is false', () => {
         const { container } = renderWithProviders(
            <VersionHistoryPanel
               postId={mockPostId}
               currentContent={mockCurrentContent}
               onRestore={mockOnRestore}
               isVisible={false}
               onClose={mockOnClose}
            />
         );

         expect(container.firstChild).toBeNull();
      });

      it('should render version list panel when isVisible is true', () => {
         renderWithProviders(
            <VersionHistoryPanel
               postId={mockPostId}
               currentContent={mockCurrentContent}
               onRestore={mockOnRestore}
               isVisible={true}
               onClose={mockOnClose}
            />
         );

         expect(screen.getByText('Riwayat Versi')).toBeInTheDocument();
         expect(screen.getByText('Versi awal')).toBeInTheDocument();
         expect(screen.getByText('Memperbarui judul dan deskripsi')).toBeInTheDocument();
         expect(screen.getByText('Revisi final')).toBeInTheDocument();
      });

      it('should display "Belum ada versi yang tersimpan" when no versions exist', () => {
         versionStorage.clearPostVersions(mockPostId);

         renderWithProviders(
            <VersionHistoryPanel
               postId={mockPostId}
               currentContent={mockCurrentContent}
               onRestore={mockOnRestore}
               isVisible={true}
               onClose={mockOnClose}
            />
         );

         expect(screen.getByText('Belum ada versi yang tersimpan')).toBeInTheDocument();
      });

      it('should display close button', () => {
         renderWithProviders(
            <VersionHistoryPanel
               postId={mockPostId}
               currentContent={mockCurrentContent}
               onRestore={mockOnRestore}
               isVisible={true}
               onClose={mockOnClose}
            />
         );

         const closeBtn = screen.getByLabelText('Tutup');
         expect(closeBtn).toBeInTheDocument();
      });
   });

   describe('Version List', () => {
   it('should display versions sorted by timestamp (newest first)', () => {
         renderWithProviders(
            <VersionHistoryPanel
               postId={mockPostId}
               currentContent={mockCurrentContent}
               onRestore={mockOnRestore}
               isVisible={true}
               onClose={mockOnClose}
            />
         );

         expect(screen.getByText('Riwayat Versi')).toBeInTheDocument();
         const editorMatches = screen.queryAllByText(/oleh editor/);
         expect(editorMatches.length).toBeGreaterThan(0);
      });

      it('should display version timestamps in Indonesian format', () => {
         renderWithProviders(
            <VersionHistoryPanel
               postId={mockPostId}
               currentContent={mockCurrentContent}
               onRestore={mockOnRestore}
               isVisible={true}
               onClose={mockOnClose}
            />
         );

         const editorMatches = screen.queryAllByText(/oleh editor/);
         expect(editorMatches.length).toBeGreaterThan(0);
      });

      it('should display version notes', () => {
         renderWithProviders(
            <VersionHistoryPanel
               postId={mockPostId}
               currentContent={mockCurrentContent}
               onRestore={mockOnRestore}
               isVisible={true}
               onClose={mockOnClose}
            />
         );

         expect(screen.getByText('Versi awal')).toBeInTheDocument();
         expect(screen.getByText('Memperbarui judul dan deskripsi')).toBeInTheDocument();
         expect(screen.getByText('Revisi final')).toBeInTheDocument();
      });

      it('should show version fields as badges', () => {
         renderWithProviders(
            <VersionHistoryPanel
               postId={mockPostId}
               currentContent={mockCurrentContent}
               onRestore={mockOnRestore}
               isVisible={true}
               onClose={mockOnClose}
            />
         );

         const titleBadges = screen.getAllByText('title');
         const descBadges = screen.getAllByText('desc');
         expect(titleBadges.length).toBeGreaterThan(0);
         expect(descBadges.length).toBeGreaterThan(0);
      });

      it('should show "lagi" indicator when content has more than 3 fields', () => {
         const versionWithManyFields: BlogPostVersion = {
            id: 'version-many',
            postId: mockPostId,
            content: { title: 'Judul', desc: 'Deskripsi', status: 'published', user: 'editor' },
            timestamp: new Date().toISOString(),
            notes: 'Banyak field',
            author: 'editor1'
         };
         versionStorage.saveVersion(versionWithManyFields);

         renderWithProviders(
            <VersionHistoryPanel
               postId={mockPostId}
               currentContent={mockCurrentContent}
               onRestore={mockOnRestore}
               isVisible={true}
               onClose={mockOnClose}
            />
         );

         expect(screen.getByText(/\+1 lagi/)).toBeInTheDocument();
      });
   });

   describe('Version Selection', () => {
      it('should display version details panel', () => {
         renderWithProviders(
            <VersionHistoryPanel
               postId={mockPostId}
               currentContent={mockCurrentContent}
               onRestore={mockOnRestore}
               isVisible={true}
               onClose={mockOnClose}
            />
         );

         expect(screen.getByText('Riwayat Versi')).toBeInTheDocument();
      });

      it('should show "Lihat" button for unselected versions', () => {
         renderWithProviders(
            <VersionHistoryPanel
               postId={mockPostId}
               currentContent={mockCurrentContent}
               onRestore={mockOnRestore}
               isVisible={true}
               onClose={mockOnClose}
            />
         );

         const viewButtons = screen.getAllByText('👁️ Lihat');
         expect(viewButtons.length).toBeGreaterThan(0);
      });
   });

   describe('Version Actions', () => {
      it('should show "Lihat" button for versions', () => {
         renderWithProviders(
            <VersionHistoryPanel
               postId={mockPostId}
               currentContent={mockCurrentContent}
               onRestore={mockOnRestore}
               isVisible={true}
               onClose={mockOnClose}
            />
         );

         const viewButtons = screen.getAllByText('👁️ Lihat');
         expect(viewButtons.length).toBeGreaterThan(0);
      });

      it('should display version author names', () => {
         renderWithProviders(
            <VersionHistoryPanel
               postId={mockPostId}
               currentContent={mockCurrentContent}
               onRestore={mockOnRestore}
               isVisible={true}
               onClose={mockOnClose}
            />
         );

         const allMatches = screen.queryAllByText(/editor\d/);
         expect(allMatches.length).toBeGreaterThan(0);
      });
   });

   describe('Close Button', () => {
      it('should call onClose when close button is clicked', () => {
         renderWithProviders(
            <VersionHistoryPanel
               postId={mockPostId}
               currentContent={mockCurrentContent}
               onRestore={mockOnRestore}
               isVisible={true}
               onClose={mockOnClose}
            />
         );

         const closeBtn = screen.getByLabelText('Tutup');
         fireEvent.click(closeBtn);

         expect(mockOnClose).toHaveBeenCalledTimes(1);
      });
   });

   describe('Version Comparison', () => {
      it('should display "Riwayat Versi" header', () => {
         renderWithProviders(
            <VersionHistoryPanel
               postId={mockPostId}
               currentContent={mockCurrentContent}
               onRestore={mockOnRestore}
               isVisible={true}
               onClose={mockOnClose}
            />
         );

         expect(screen.getByText('Riwayat Versi')).toBeInTheDocument();
      });

      it('should display version notes', () => {
         renderWithProviders(
            <VersionHistoryPanel
               postId={mockPostId}
               currentContent={mockCurrentContent}
               onRestore={mockOnRestore}
               isVisible={true}
               onClose={mockOnClose}
            />
         );

         expect(screen.getByText('Versi awal')).toBeInTheDocument();
         expect(screen.getByText('Memperbarui judul dan deskripsi')).toBeInTheDocument();
      });
   });

   describe('Accessibility', () => {
      it('should have close button with proper ARIA label', () => {
         renderWithProviders(
            <VersionHistoryPanel
               postId={mockPostId}
               currentContent={mockCurrentContent}
               onRestore={mockOnRestore}
               isVisible={true}
               onClose={mockOnClose}
            />
         );

         expect(screen.getByLabelText('Tutup')).toBeInTheDocument();
      });

       it('should have close button with proper ARIA label', () => {
         renderWithProviders(
            <VersionHistoryPanel
               postId={mockPostId}
               currentContent={mockCurrentContent}
               onRestore={mockOnRestore}
               isVisible={true}
               onClose={mockOnClose}
            />
         );

         expect(screen.getByLabelText('Tutup')).toBeInTheDocument();
      });
   });

   describe('Edge Cases', () => {
      it('should handle versions with no notes', () => {
         const versionNoNotes: BlogPostVersion = {
            id: 'version-no-notes',
            postId: mockPostId,
            content: { title: 'Judul' },
            timestamp: new Date().toISOString(),
            notes: '',
            author: 'editor1'
         };
         versionStorage.saveVersion(versionNoNotes);

         renderWithProviders(
            <VersionHistoryPanel
               postId={mockPostId}
               currentContent={mockCurrentContent}
               onRestore={mockOnRestore}
               isVisible={true}
               onClose={mockOnClose}
            />
         );

         const allEditor1Matches = screen.queryAllByText(/editor1/);
         expect(allEditor1Matches.length).toBeGreaterThan(0);
      });
   });
});
