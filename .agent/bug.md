# Bug Report

## Bug List

### Critical Bugs (Test Failures) - FIXED ✅

#### 1. CampaignManager Test Failure - FIXED ✅
- [x] `processScheduledCampaigns` test failing - CAMP-003 date was in the past
- **Root Cause**: Test data had scheduled date of 2026-02-05, but current date is 2026-02-09
- **Fix**: Updated CAMP-003 scheduled date to 2026-12-31 in `/home/runner/work/maskom/maskom/src/data/CampaignData.ts`

#### 2. Vitest Import Errors (3 test suites) - FIXED ✅
- [x] `src/lib/collaboration/__tests__/presenceManager.test.ts` - Converted vitest to jest
- [x] `src/utils/ai/__tests__/contentIntelligence.test.ts` - Converted vitest to jest  
- [x] `src/lib/crdt/__tests__/documentEngine.test.ts` - Converted vitest to jest
- **Fix**: Replaced `from 'vitest'` with `from '@jest/globals'` and `vi.` with `jest.`

#### 3. ContentIntelligenceEngine Config Test - FIXED ✅
- [x] Config test failing due to localStorage persistence between tests
- **Root Cause**: Engine persists config to localStorage, so tests were seeing modified config
- **Fix**: Added `localStorage.clear()` to beforeEach in test file

#### 4. DocumentEngine Syntax Errors - FIXED ✅
- [x] Variable naming conflicts (content parameter vs destructured content)
- [x] Missing 'replace' type in DocumentOperation type definition
- **Fix**: Renamed parameters to avoid conflicts, added 'replace' to union type

### Remaining Test Failures (Low Priority)

#### 5. presenceManager.test.ts - 1 failing test - FIXED ✅
- [x] `getAllPresences` returning empty array instead of expected presences
- Location: `src/lib/collaboration/__tests__/presenceManager.test.ts:114`
- **Root Cause**: Test called `joinRoom` before `updatePresence`, but `joinRoom` requires presence to exist
- **Fix**: Added `updatePresence` calls before `joinRoom` in test beforeEach

#### 6. documentEngine.test.ts - 2 failing tests - FIXED ✅
- [x] Transform position test - expected 15, received 10
- [x] mergeStates test - "Assignment to constant variable"
- **Root Causes**: 
  1. Implementation incorrectly subtracted shift from length in transformOperation
  2. Test used `const` for `state1` but tried to reassign it
- **Fixes**: 
  1. Removed length subtraction in documentEngine.ts transformOperation (line 133)
  2. Changed `const state1` to `let state1` in test

### Lint Warnings (33 warnings) - Non-blocking

These are code style warnings that don't affect functionality:

#### 1. ContentIntelligenceDashboard.tsx (4 warnings)
- [ ] Unused state variables (selectedTopic, setSelectedTopic, selectedAnomaly, setSelectedAnomaly)

#### 2. PersonalizationExperimentDashboard.tsx (4 warnings)
- [ ] Unused imports and state variables

#### 3. CollaborationPanel.tsx (4 warnings)
- [ ] Unused state variables and missing useEffect dependency

#### 4. CtaWrapper.tsx (1 warning)
- [ ] Unused component ImageRendererWithAnimation

#### 5. presenceManager.test.ts (1 warning)
- [ ] Unused import presenceManager

#### 6. offlineSync.ts (2 warnings)
- [ ] Unused variables syncedOperations and roomId

#### 7. documentEngine.test.ts (3 warnings)
- [ ] Unused imports

#### 8. documentEngine.ts (2 warnings)
- [ ] Unused imports and variables

#### 9. storageMigration.ts (1 warning)
- [ ] Unused generic type parameter T

#### 10. AI utilities (9 warnings)
- [ ] Various unused variables in contentClustering.ts, contentIntelligence.ts, predictiveAnalytics.ts, topicModeling.ts

#### 11. experimentAutomation.ts (3 warnings)
- [ ] Unused imports and variables

## Status
- Total Critical Bugs: 4 (all fixed ✅)
- Total Test Failures: 3 (2 low priority)
- Total Lint Warnings: 33 (non-blocking)
- **Build Status**: ✅ All core tests passing
