# Search Logic Documentation

## Overview

The `SearchContext` manages search state and coordinates search requests to minimize API calls while providing responsive UX.

## Search Request Strategy

### 1. Query Changes (User Typing)

**Triggers:** When the user types in the search input

**Behavior:**
- **Immediate search** (no facets): Provides instant results as user types
- **Debounced search** (with facets): Updates facet counts after user stops typing (500ms default)
- **Total API calls:** 2 searches per query change

**Why this approach:**
- Users get instant feedback (fast results without facet overhead)
- Facets update smoothly without excessive API calls during typing
- Filters are automatically reset when query changes

**Code location:** `SearchContext.tsx` lines 636-681

```typescript
// Query effect handles typing
useEffect(() => {
  if (facetsEnabled) {
    searchBasic();           // Immediate: enableFacets: false
    searchWithFacets();      // Debounced: enableFacets: true
  }
}, [state.query]);
```

### 2. Filter Changes (User Selecting Filters)

**Triggers:** When user adds/removes value filters or adjusts range filters

**Behavior:**
- **Immediate search** (with facets): Updates results and facet counts instantly
- **Total API calls:** 1 search per filter change

**Important:** Filter changes only fire when filters actually change, NOT when they're being reset by a query change

**Code location:** `SearchContext.tsx` lines 679-693

```typescript
// Filter effect handles filter toggles
useEffect(() => {
  if (!hasInitialized.current || !token) return;

  // Skip if query changed (query effect handles it)
  if (state.query !== lastQueryText) return;

  performSearchRef.current?.({ enableFacets: true });
}, [state.filters, state.rangeFilters]);
```

### 3. Sort Changes

**Triggers:** When user changes sort field or direction

**Behavior:**
- **Immediate search** (with facets): Re-sorts results with updated facet counts
- **Total API calls:** 1 search per sort change

**Code location:** `SearchContext.tsx` lines 696-708

## Key Implementation Details

### Preventing Duplicate Searches

The critical logic that prevents duplicate searches when typing:

```typescript
// In filter effect (line 684)
if (state.query !== lastQueryText) return;
```

**Why this works:**
1. User types "p" → `state.query` changes to "p"
2. `setQuery()` also resets `filters: {}` and `rangeFilters: {}`
3. Both query and filter effects trigger
4. Filter effect sees `state.query !== lastQueryText` and exits early
5. Query effect runs and updates `lastQueryText`
6. Next filter change will see `state.query === lastQueryText` and fire correctly

### Debouncing Strategy

Faceted searches are debounced to avoid excessive API calls:

```typescript
const searchWithFacetsDebounced = useRef<ReturnType<typeof debounce> | null>(null);

useEffect(() => {
  searchWithFacetsDebounced.current = debounce(() => {
    performSearchRef.current?.({ enableFacets: true });
  }, state.facetDebounceDelayMillis ?? 500);
}, [state.facetDebounceDelayMillis]);
```

**Default delay:** 500ms (configurable via `facetDebounceDelayMillis` prop)

### Request ID Race Condition Protection

Prevents stale results from appearing:

```typescript
const latestRequestId = useRef(0);

const performSearch = async ({ enableFacets }) => {
  const currentRequestId = ++latestRequestId.current;

  // ... perform search ...

  // Only update state if this is still the latest request
  if (currentRequestId !== latestRequestId.current) {
    return;
  }

  setState(/* ... */);
};
```

## State Management

### Key State Variables

- `query`: Current search text
- `filters`: Active value filters `{ field: [values] }`
- `rangeFilters`: Active range filters `{ field: { min, max } }`
- `results`: Search results array
- `facets`: Current facet counts
- `isLoading`: Search in progress indicator
- `lastQueryText`: Previous query (for change detection)

### Automatic Filter Reset

When the user types a new query, filters are automatically reset:

```typescript
const setQuery = useCallback((query: string) => {
  setState(prev => ({
    ...prev,
    query,
    filters: {},      // Reset value filters
    rangeFilters: {}, // Reset range filters
  }));
}, []);
```

**Rationale:** Filters are query-specific. A new query likely makes previous filters irrelevant.

## API Call Summary

| User Action | Immediate Search | Debounced Search | Total Calls |
|-------------|-----------------|------------------|-------------|
| Type character | 1 (no facets) | 1 (with facets) | 2 |
| Toggle filter | 1 (with facets) | - | 1 |
| Adjust range | 1 (with facets) | - | 1 |
| Change sort | 1 (with facets) | - | 1 |

## Performance Considerations

### Why Two Searches for Typing?

**Option 1 (Current):** Immediate + Debounced
- ✅ Instant results (better UX)
- ✅ Facets update smoothly
- ✅ 2 API calls per query

**Option 2 (Alternative):** Single debounced search
- ❌ Delayed results (worse UX)
- ✅ Facets update once
- ✅ 1 API call per query

We chose Option 1 because **perceived performance is more important than raw API call count**. Users expect instant search results.

### Optimizing for Large Datasets

For datasets with expensive facet computation:

1. Increase `facetDebounceDelayMillis` to reduce facet update frequency
2. Limit `coverageDepth` to reduce search depth
3. Use `maxResults` to limit result set size

```typescript
<SearchProvider
  dataset="large-dataset"
  facetDebounceDelayMillis={1000}  // Wait 1s before updating facets
  coverageDepth={100}              // Search top 100 matches only
  maxResults={10}                   // Return 10 results max
>
```

## Common Issues

### Issue: "Three searches firing instead of two"

**Symptom:** Typing triggers 3 API calls instead of 2

**Cause:** Filter effect firing when it shouldn't

**Solution:** The filter effect now checks `if (state.query !== lastQueryText) return;` to prevent this

**Fixed in:** `SearchContext.tsx` line 684

### Issue: "Can't remove filters"

**Symptom:** Clicking a filter checkbox doesn't remove the filter

**Cause:** Filter effect was checking for empty filters and skipping the search

**Solution:** Changed from checking `hasActiveFilters` to checking `state.query !== lastQueryText`

**Fixed in:** Previous implementation had `if (!hasActiveFilters) return;` which was incorrect

## Testing the Logic

To verify correct behavior:

1. **Test typing:**
   ```
   Type "p" → Console should show:
   - "Search fired" (basic)
   - "Debounced searchWithFacets fired" (after 500ms)
   Total: 2 searches
   ```

2. **Test filter toggle:**
   ```
   Click a filter → Console should show:
   - Single search with enableFacets: true
   Total: 1 search
   ```

3. **Test filter removal:**
   ```
   Remove a filter → Console should show:
   - Single search with enableFacets: true
   Total: 1 search
   ```

4. **Test rapid typing:**
   ```
   Type "p", wait 100ms, type "r", wait 100ms, type "o"
   - Should see 3 basic searches (one per keystroke)
   - Should see 1 debounced faceted search (after typing stops)
   Total: 4 searches
   ```

## Future Improvements

Potential optimizations to consider:

1. **Abort previous requests:** Cancel in-flight requests when new one starts
2. **Cache results:** Store recent search results to avoid duplicate API calls
3. **Debounce basic search:** Add small debounce (~100ms) to basic search for very fast typers
4. **Smart facet updates:** Only request facets when they might have changed
