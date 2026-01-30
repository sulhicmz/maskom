import { OfflineAction, OFFLINE_ACTIONS_KEY, DEFAULT_BACKGROUND_SYNC_CONFIG, BACKGROUND_SYNC_CONFIG_KEY } from '@/types/pwa';

let syncConfig = DEFAULT_BACKGROUND_SYNC_CONFIG;

function loadSyncConfig() {
  try {
    const stored = localStorage?.getItem(BACKGROUND_SYNC_CONFIG_KEY);
    if (stored) {
      syncConfig = { ...DEFAULT_BACKGROUND_SYNC_CONFIG, ...JSON.parse(stored) };
    }
  } catch (error) {
    console.error('[Background Sync] Failed to load config:', error);
  }
}

function saveSyncConfig() {
  try {
    localStorage?.setItem(BACKGROUND_SYNC_CONFIG_KEY, JSON.stringify(syncConfig));
  } catch (error) {
    console.error('[Background Sync] Failed to save config:', error);
  }
}

function getOfflineActions(): OfflineAction[] {
  try {
    const stored = localStorage?.getItem(OFFLINE_ACTIONS_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch (error) {
    console.error('[Background Sync] Failed to load actions:', error);
    return [];
  }
}

function saveOfflineActions(actions: OfflineAction[]) {
  try {
    localStorage?.setItem(OFFLINE_ACTIONS_KEY, JSON.stringify(actions));
  } catch (error) {
    console.error('[Background Sync] Failed to save actions:', error);
  }
}

export function addOfflineAction(action: Omit<OfflineAction, 'id' | 'timestamp' | 'retries' | 'status'>): OfflineAction {
  loadSyncConfig();
  const actions = getOfflineActions();
  
  const newAction: OfflineAction = {
    ...action,
    id: `action_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    timestamp: Date.now(),
    retries: 0,
    status: 'pending',
  };
  
  actions.push(newAction);
  saveOfflineActions(actions);
  
  return newAction;
}

export function removeOfflineAction(actionId: string): boolean {
  const actions = getOfflineActions();
  const filteredActions = actions.filter(a => a.id !== actionId);
  
  if (filteredActions.length !== actions.length) {
    saveOfflineActions(filteredActions);
    return true;
  }
  
  return false;
}

export function updateOfflineActionStatus(actionId: string, status: OfflineAction['status']): boolean {
  const actions = getOfflineActions();
  const action = actions.find(a => a.id === actionId);
  
  if (action) {
    action.status = status;
    saveOfflineActions(actions);
    return true;
  }
  
  return false;
}

export function incrementOfflineActionRetries(actionId: string): boolean {
  const actions = getOfflineActions();
  const action = actions.find(a => a.id === actionId);
  
  if (action) {
    action.retries += 1;
    saveOfflineActions(actions);
    return true;
  }
  
  return false;
}

export function clearOfflineActions(): void {
  localStorage?.removeItem(OFFLINE_ACTIONS_KEY);
}

export async function syncOfflineActions(): Promise<{ succeeded: number; failed: number }> {
  if (typeof navigator === 'undefined' || !navigator.onLine) {
    return { succeeded: 0, failed: 0 };
  }

  loadSyncConfig();
  const actions = getOfflineActions();
  const pendingActions = actions.filter(a => a.status === 'pending');
  
  let succeeded = 0;
  let failed = 0;
  
  for (const action of pendingActions) {
    const shouldRetry = action.retries < syncConfig.maxRetries;
    
    if (!shouldRetry) {
      updateOfflineActionStatus(action.id, 'failed');
      failed++;
      continue;
    }
    
    try {
      const success = await executeOfflineAction(action);
      
      if (success) {
        removeOfflineAction(action.id);
        succeeded++;
      } else {
        incrementOfflineActionRetries(action.id);
        failed++;
      }
    } catch (error) {
      console.error(`[Background Sync] Failed to execute action ${action.id}:`, error);
      incrementOfflineActionRetries(action.id);
      failed++;
    }
    
    await new Promise(resolve => setTimeout(resolve, syncConfig.retryDelay));
  }
  
  return { succeeded, failed };
}

async function executeOfflineAction(action: OfflineAction): Promise<boolean> {
  switch (action.type) {
    case 'form_submission':
      return await executeFormSubmission(action);
    case 'bookmark':
      return await executeBookmarkAction(action);
    case 'comment':
      return await executeCommentAction(action);
    case 'like':
      return await executeLikeAction(action);
    default:
      console.warn('[Background Sync] Unknown action type:', action.type);
      return false;
  }
}

async function executeFormSubmission(action: OfflineAction): Promise<boolean> {
  try {
    const response = await fetch(action.url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(action.data),
    });
    
    return response.ok;
  } catch (error) {
    console.error('[Background Sync] Form submission failed:', error);
    return false;
  }
}

async function executeBookmarkAction(action: OfflineAction): Promise<boolean> {
  try {
    const response = await fetch(action.url, {
      method: action.data ? 'POST' : 'DELETE',
      headers: {
        'Content-Type': 'application/json',
      },
      body: action.data ? JSON.stringify(action.data) : undefined,
    });
    
    return response.ok;
  } catch (error) {
    console.error('[Background Sync] Bookmark action failed:', error);
    return false;
  }
}

async function executeCommentAction(action: OfflineAction): Promise<boolean> {
  try {
    const response = await fetch(action.url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(action.data),
    });
    
    return response.ok;
  } catch (error) {
    console.error('[Background Sync] Comment action failed:', error);
    return false;
  }
}

async function executeLikeAction(action: OfflineAction): Promise<boolean> {
  try {
    const response = await fetch(action.url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(action.data),
    });
    
    return response.ok;
  } catch (error) {
    console.error('[Background Sync] Like action failed:', error);
    return false;
  }
}

export function getSyncConfig() {
  loadSyncConfig();
  return { ...syncConfig };
}

export function updateSyncConfig(config: Partial<typeof DEFAULT_BACKGROUND_SYNC_CONFIG>): void {
  loadSyncConfig();
  syncConfig = { ...syncConfig, ...config };
  saveSyncConfig();
}

export function getPendingActionCount(): number {
  const actions = getOfflineActions();
  return actions.filter(a => a.status === 'pending').length;
}
