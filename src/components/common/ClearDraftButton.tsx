"use client"

import { memo } from 'react';

interface ClearDraftButtonProps {
   hasDraft: boolean;
   onClearDraft: () => void;
   className?: string;
   disabled?: boolean;
}

const ClearDraftButton = memo(({ hasDraft, onClearDraft, className = '', disabled = false }: ClearDraftButtonProps) => {
   const handleClick = () => {
      if (hasDraft && confirm('Apakah Anda yakin ingin menghapus draft ini?')) {
         onClearDraft();
      }
   };

   return (
      <button
         type="button"
         onClick={handleClick}
         disabled={!hasDraft || disabled}
         className={`clear-draft-btn ${className}`}
         aria-label="Hapus draft"
         title="Hapus draft yang tersimpan"
      >
         🗑️ Hapus Draft
      </button>
   );
});

ClearDraftButton.displayName = 'ClearDraftButton';

export default ClearDraftButton;