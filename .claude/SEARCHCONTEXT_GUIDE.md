# SearchContext Guide

## Overview

SearchContext is the central state management system for the INDX search interface. It handles authentication, search execution, filter management, and facet statistics.

## Core Responsibilities

1. **Authentication**: Login and token management
2. **Search Execution**: Immediate and debounced searches
3. **State Management**: Query, filters, results, facets
4. **Bounds Tracking**: Query bounds and live data bounds
5. **Filter Operations**: Add, remove, toggle filters

## State Structure

```typescript
interface SearchState {
  // Search
  query: string;
  results: SearchResult[] | null;
  isLoading: boolean;
  error: string | null;
  resultsSuppressed: boolean;

  // Filtering
  filters: Record<string, string[]>;           // Value filters
  rangeFilters: Record<string, {min, max}>;    // Range filters
  sortBy: string;
  sortAscending: boolean;

  // Facets & Bounds
  facets: Record<string, FacetValue[]>;        // Current facet values
  facetStats: Record<string, {min, max}>;      // Live data bounds

  // Settings
  searchSettings: SearchSettings;
  facetDebounceDelayMillis: number;
}
```

## Additional State (Outside Main State)

```typescript
// Fields
filterableFields: string[];
facetableFields: string[];
sortableFields: string[];

// Bounds tracking
rangeBounds: Record<string, {min, max}>;     // Query-specific bounds
lastQueryText: string;                        // Last processed query
lastRangeBoundsQuery: string;                 // Last query that updated bounds

// Initialization
isFetchingInitial: boolean;
initialFacetStats: Record<string, {min, max}>;
initialFacetKeys: Record<string, string[]>;
```

## Search Flow

### Initial Load

1. Component mounts
2. Authentication effect runs:
   - Login with email/password
   - Get session token
   - Fetch filterable/facetable/sortable fields
   - Run blank search for global bounds
   - Set `isFetchingInitial = false`
3. Initial search effect runs:
   - Waits for `!isFetchingInitial && token`
   - Performs blank search with facets
   - Sets `hasInitialized = true`

### Query Change

1. User types in SearchInput
2. `setQuery()` called → updates `state.query`
3. Query change effect triggers:
   - Skip if empty and `!allowEmptySearch`
   - Mark `hasInitialized = true`
   - Call `searchBasic()` (immediate, no facets)
   - Call `searchWithFacets()` (debounced 500ms, with facets)
4. Search completes:
   - If query changed: update `lastQueryText` and `rangeBounds`
   - Always update `facetStats`

### Filter Change

1. User clicks value filter or adjusts range filter
2. `toggleFilter()` or `setRangeFilter()` called
3. Filter change effect triggers:
   - Skip if `!hasInitialized`
   - Perform immediate faceted search
4. Results and `facetStats` update

## Key Functions

### Search Functions

```typescript
// Core search function
performSearch({ enableFacets: boolean }): Promise<void>
  - Builds filter proxies
  - Combines filters with AND logic
  - Makes API call
  - Updates state with results
  - Updates facetStats if enableFacets
  - Updates rangeBounds if query changed

// Immediate search (no facets)
searchBasic(): void
  - Calls performSearchRef.current({ enableFacets: false })
  - Stable function (no dependencies)

// Debounced search (with facets)
searchWithFacets(): void
  - Debounced by facetDebounceDelayMillis (default 500ms)
  - Uses ref-based debounce (searchWithFacetsDebounced.current)
  - Calls performSearchRef.current({ enableFacets: true })
  - Stable function with proper cleanup on unmount
  - Cancels pending searches when query changes
```

### Filter Functions

```typescript
// Value filters
toggleFilter(field: string, value: string): void
  - Adds or removes value from filters[field]
  - Removes field entirely if no values left

setFilter(field: string, values: string[]): void
  - Replaces all values for a field

// Range filters
setRangeFilter(field: string, min: number, max: number): void
  - Sets intended min/max for a field
  - Stored as-is (not clamped)

// Reset
resetFilters(): void
  - Clears all filters and rangeFilters

resetSingleFilter(field: string, value?: string): void
  - If value provided: remove from value filters
  - If no value: remove range filter
```

### Query Functions

```typescript
setQuery(query: string): void
  - Updates state.query
  - Resets all filters (both value and range)
```

## Performance Optimizations

### Stable Function References

```typescript
const performSearchRef = useRef<Function>();

useEffect(() => {
  performSearchRef.current = performSearch;
}, [performSearch]);

const searchBasic = useCallback(() => {
  performSearchRef.current?.({ enableFacets: false });
}, []); // No dependencies = stable
```

**Why**: Prevents effect from re-running when performSearch recreates

### Primitive Dependencies

```typescript
// Extract primitives from objects
const settingsMaxResults = state.searchSettings.maxNumberOfRecordsToReturn;
const settingsEnableCoverage = state.searchSettings.enableCoverage;

// Use in dependencies
useEffect(() => {
  // ...
}, [settingsMaxResults, settingsEnableCoverage]);
```

**Why**: Object references change every render, primitives don't

### Memoized Objects

```typescript
const settingsCoverageSetup = useMemo(
  () => state.searchSettings.coverageSetup,
  [
    state.searchSettings.coverageSetup.levenshteinMaxWordSize,
    state.searchSettings.coverageSetup.minWordSize,
    // ... all fields
  ]
);
```

**Why**: Returns same object reference unless fields actually change

## Effects

### Authentication Effect

**Runs**: Once on mount
**Triggers**: Component mount
**Does**:
- Login to get token
- Fetch field lists
- Run blank search for bounds
- Set `isFetchingInitial = false`

### Initial Search Effect

**Runs**: When auth completes
**Triggers**: `isFetchingInitial` → false, `token` exists
**Does**:
- Only runs if `allowEmptySearch` is true
- Performs initial search with facets
- Sets `hasInitialized = true`

### Query Change Effect

**Runs**: When query changes
**Triggers**: `state.query` changes
**Dependencies**: `[state.query, allowEmptySearch, searchBasic, searchWithFacets, facetsEnabled]`
**Does**:
- Skip if no token yet (wait for initial search effect)
- Skip if empty and not allowed
- Set `hasInitialized = true` when user types
- Call searchBasic() (immediate, no facets)
- Call searchWithFacets() (debounced 500ms, with facets)

### Filter Change Effect

**Runs**: When filters change
**Triggers**: `state.filters` or `state.rangeFilters` changes
**Dependencies**: `[state.filters, state.rangeFilters]`
**Does**:
- Skip if `!hasInitialized` or `!token`
- Skip if no filters are actually set (optimization)
- Perform immediate faceted search

### Sort Change Effect

**Runs**: When sort parameters change
**Triggers**: `sortBy` or `sortAscending` changes
**Dependencies**: `[sortBy, sortAscending]`
**Does**:
- Skip if `!hasInitialized` or `!token`
- Skip if query is empty and `!allowEmptySearch`
- Perform immediate faceted search

## Bounds Management

### Query Bounds (`rangeBounds`)

**Updates**: Only when query text changes
**Used for**: Slider rail (min/max extent)
**Logic**:
```typescript
const queryChanged = state.query !== lastQueryText;
const rangeBoundsNeedsUpdate = state.query !== lastRangeBoundsQuery;

if (rangeBoundsNeedsUpdate && enableFacets) {
  const updatedBounds = { ...rangeBounds };
  for (const [field, stats] of Object.entries(newFacetStats)) {
    updatedBounds[field] = stats;
  }
  setRangeBounds(updatedBounds);
  setLastRangeBoundsQuery(state.query);
}
```

### Live Data Bounds (`facetStats`)

**Updates**: Every search (with or without facets)
**Used for**: Active region visualization
**Logic**:
```typescript
setState(prev => ({
  ...prev,
  facetStats: newFacetStats,
}));
```

## API Integration

### Filter Proxy Pattern

INDX uses a proxy-based filtering system:

1. **Create Value Filter**:
   ```typescript
   PUT /api/CreateValueFilter/{dataset}
   Body: { FieldName: "type1", Value: "water" }
   Returns: { hashString: "abc123..." }
   ```

2. **Create Range Filter**:
   ```typescript
   PUT /api/CreateRangeFilter/{dataset}
   Body: { FieldName: "speed", LowerLimit: 10, UpperLimit: 90 }
   Returns: { hashString: "def456..." }
   ```

3. **Combine Filters**:
   ```typescript
   POST /api/CombineFilters/{dataset}
   Body: { hashStrings: ["abc123...", "def456..."] }
   Returns: { hashString: "combined789..." }
   ```

4. **Search with Filter**:
   ```typescript
   POST /api/Search/{dataset}
   Body: {
     text: "pokemon",
     filterProxy: "combined789...",
     enableFacets: true
   }
   ```

### Authenticated Fetch

```typescript
const authenticatedFetch = useCallback((url: string, options: RequestInit = {}) => {
  if (!token) throw new Error('No authentication token');
  return fetch(url, {
    ...options,
    headers: {
      ...options.headers,
      'Authorization': `Bearer ${token}`,
    },
  });
}, [token]);
```

## Context Provider

```typescript
<SearchProvider
  url="https://indx.server.com"
  email="user@example.com"
  password="password"
  dataset="my-dataset"
  allowEmptySearch={true}
  enableFacets={true}
  maxResults={30}
  facetDebounceDelayMillis={500}
>
  <SearchLayout />
</SearchProvider>
```

## Hook Usage

```typescript
const {
  state: { query, results, filters, rangeFilters, facetStats },
  setQuery,
  toggleFilter,
  setRangeFilter,
  resetFilters,
  resetSingleFilter,
  isFetchingInitial,
  allowEmptySearch,
} = useSearchContext();
```

## Common Patterns

### Conditional Rendering

```typescript
// Don't show until initialized
if (isFetchingInitial) return <Loading />;

// Don't show if empty query not allowed
if (!allowEmptySearch && !query) return null;
```

### Filter Display

```typescript
// Check if field has active filters
const isActive = filters[field]?.length > 0;

// Check if range filter is set
const hasRangeFilter = rangeFilters[field] !== undefined;
```

### Facet Access

```typescript
// Get facet values for a field
const facetValues = state.facets?.[field] || [];

// Get live bounds for a field
const { min, max } = state.facetStats?.[field] || { min: 0, max: 100 };
```

## Debugging

### Enable Logging

SearchContext includes extensive console logging:
- `[Auth]` - Authentication flow
- `[Search]` - Search operations
- `[performSearch]` - Request details

### Common Issues

**Infinite search loop**:
- Check dependency arrays in effects
- Ensure not recreating functions unnecessarily
- Use refs for latest values

**Filters not working**:
- Check `hasInitialized` is true
- Verify `allowEmptySearch` setting
- Check filter change effect is running

**Bounds not updating**:
- Verify query text actually changed
- Check `lastRangeBoundsQuery` vs `state.query`
- Ensure facets are enabled

---

**Last Updated**: 2025-11-28
**Contributors**: Anders, Claude
