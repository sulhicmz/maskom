"use client"

import { memo } from 'react';

interface AutoSaveIndicatorProps {
   lastSavedAt: Date | null;
   isAutoSaving: boolean;
   className?: string;
}

const formatTimeAgo = (date: Date): string => {
   const now = new Date();
   const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

   if (diffInSeconds < 60) {
      return 'baru saja';
   } else if (diffInSeconds < 3600) {
      const minutes = Math.floor(diffInSeconds / 60);
      return `${minutes} menit yang lalu`;
   } else if (diffInSeconds < 86400) {
      const hours = Math.floor(diffInSeconds / 3600);
      return `${hours} jam yang lalu`;
   } else {
      const days = Math.floor(diffInSeconds / 86400);
      return `${days} hari yang lalu`;
   }
};

const AutoSaveIndicator = memo(({ lastSavedAt, isAutoSaving, className = '' }: AutoSaveIndicatorProps) => {
   if (!lastSavedAt && !isAutoSaving) {
      return null;
   }

   return (
      <div className={`auto-save-indicator ${className}`} role="status" aria-live="polite">
         {isAutoSaving ? (
            <span className="auto-save-status auto-save-saving">
               <span className="auto-save-icon" aria-hidden="true">💾</span>
               <span>Menyimpan...</span>
            </span>
         ) : lastSavedAt ? (
            <span className="auto-save-status auto-save-saved">
               <span className="auto-save-icon" aria-hidden="true">✓</span>
               <span>Disimpan {formatTimeAgo(lastSavedAt)}</span>
            </span>
         ) : null}
      </div>
   );
});

AutoSaveIndicator.displayName = 'AutoSaveIndicator';

export default AutoSaveIndicator;