import { useState } from 'react';

interface UseTabsOptions {
  defaultTab?: number;
  tabCount?: number;
  enableKeyboardNavigation?: boolean;
}

export function useTabs(options: UseTabsOptions = {}) {
  const {
    defaultTab = 0,
    tabCount = 2,
    enableKeyboardNavigation = true
  } = options;

  const [activeTab, setActiveTab] = useState(defaultTab);

  const handleTabClick = (index: number) => {
    setActiveTab(index);
  };

  const handleKeyDown = (event: React.KeyboardEvent<HTMLButtonElement>, index: number) => {
    if (!enableKeyboardNavigation) return;

    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      handleTabClick(index);
    }
    if (event.key === 'ArrowRight') {
      event.preventDefault();
      handleTabClick((index + 1) % tabCount);
    }
    if (event.key === 'ArrowLeft') {
      event.preventDefault();
      handleTabClick((index - 1 + tabCount) % tabCount);
    }
  };

  return {
    activeTab,
    setActiveTab,
    handleTabClick,
    handleKeyDown
  };
}
