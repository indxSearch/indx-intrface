# Changelog

All notable changes to @indxsearch/intrface will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [2.1.1] - 2026-01-21

### Fixed
- **CRITICAL**: Fixed missing TypeScript declaration files (.d.ts) in published package
  - v2.1.0 was published without declaration files, causing TypeScript compilation errors
  - All type definitions are now properly included in the npm package

## [2.1.0] - 2026-01-21

### Added
- Added dependency on `@indxsearch/indx-types` for centralized API type definitions
- Added `RequiredCoverageSetup` type for internal use (all properties guaranteed present)
- Added new CoverageSetup properties: `truncateWordHitLimit`, `truncateWordHitTolerance`, `includePatternMatches`
- Added "Include Pattern Matches" toggle to SearchSettingsPanel

### Fixed
- **BREAKING FIX**: Fixed `SystemStatus.state` → `systemStatus.systemState` to match actual API response
- **BREAKING FIX**: Fixed `SearchResult.documentKey` type from `string` to `number` (Int32) to match API
- Fixed SystemState enum usage with proper numeric comparisons
- Updated CoverageSetup defaults to match IndxCloudApi v1.0.2 specification
- Fixed `truncationScore` default value: 254 → 255

### Changed
- **BREAKING**: Updated CoverageSetup interface to match IndxCloudApi v1.0.2
  - Removed obsolete properties: `coverageMinWordHitsAbs`, `coverageMinWordHitsRelative`, `coverageLcsErrorToleranceRelativeq`, `coverageQLimitForErrorTolerance`
  - These properties no longer exist in the API specification
- Updated SearchSettingsPanel UI to reflect new CoverageSetup parameters
- Removed `truncationScore` input from SearchSettingsPanel UI (still sent to API with default value)
- Now imports `CoverageSetup` and `ScoreEntry` types from `@indxsearch/indx-types`
- Imports `SystemState` enum as value (not just type) for runtime comparisons

### Technical Details
This release aligns `@indxsearch/intrface` with the official IndxCloudApi v1.0.2 Swagger specification. The breaking changes fix discrepancies between the package and the actual API that could cause runtime errors or unexpected behavior.

### Migration Guide
If upgrading from 2.0.x:

1. **SystemStatus access**: Change `statusData.state` to `statusData.systemState`
2. **DocumentKey**: If you're manipulating `documentKey` values, they are now numbers instead of strings
3. **CoverageSetup**: Remove any usage of the deleted properties listed above

### Compatibility
- Requires IndxCloudApi v1.0.2
- Requires `@indxsearch/indx-types` ^1.0.0
- React ^19.0.0
- React DOM ^19.0.0

## [2.0.1] - 2026-01-16

### Fixed
- Fixed search firing 3 times per keystroke instead of 2 (immediate + debounced)
- Fixed reset filters not triggering new search when user clicks "Reset" button
- Fixed filter effect race conditions with automatic range filter cleanups
- Fixed range filter panel automatically triggering searches when cleaning up full-range filters

### Changed
- Added optional `isUserAction` parameter to `resetSingleFilter` method to distinguish between user-initiated actions and automatic code cleanups
- Optimized `coverageSetup` reference preservation in `setSearchSettings` to prevent unnecessary re-renders
- Removed verbose `useMemo` dependencies for `coverageSetup` (replaced with stable reference approach)

### Technical Details
The root cause of the 3-search bug was `RangeFilterPanel` automatically calling `resetSingleFilter` after every search to clean up full-range filters. This was setting the `filtersChangedByUser` flag, causing the filter effect to fire an extra search. The fix distinguishes between user-initiated resets (should trigger search) and automatic cleanups (should not trigger search).

### Compatibility
- Requires IndxCloudApi 1.0.0
- React ^19.0.0
- React DOM ^19.0.0

## [2.0.0] - [Previous Date]

### Added
- Initial public release with major architectural improvements
- Full TypeScript support
- Comprehensive authentication system (bearer token + email/password)
- Error boundary component with fallback UI
- Active filters panel for displaying and managing applied filters
- Range filter panel for numeric filtering
- Value filter panel with checkbox and button display modes
- Sort by panel with dropdown and radio display modes
- Debounced faceted search with optimized performance
- Real-time facet counts and aggregations
- Mobile-responsive design

### Compatibility
- Requires IndxCloudApi 1.0.0
- React ^19.0.0
- React DOM ^19.0.0

---

## How to Update

To update to the latest version:

```bash
npm install @indxsearch/intrface@latest
```

Or with a specific version:

```bash
npm install @indxsearch/intrface@2.1.0
```
