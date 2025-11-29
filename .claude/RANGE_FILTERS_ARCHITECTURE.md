# Range Filters Architecture

## Overview

This document describes the range filter system implemented in the INDX interface, including the "intended values" pattern, search performance optimizations, and filter interaction design.

## Core Concepts

### Three-Layer Bounds System

The range filter system uses three distinct sets of bounds:

1. **Query Bounds** (`rangeBounds`)
   - Updates ONLY when query text changes
   - Represents the full range of values for the current search query
   - Used as the slider rail (min/max extent)
   - Example: Searching "pokemon" might show speed range 10-180

2. **Live Data Bounds** (`facetStats`)
   - Updates with EVERY filter change (value filters + range filters)
   - Represents the actual data range after all active filters
   - Used for the active region visualization (colored overlay)
   - Example: After filtering to water type, speed range might be 50-80

3. **Intended Values** (`rangeFilters`)
   - User's explicit filter selection
   - Stored as-is, never clamped
   - Sent directly to the API
   - Persists when other filters narrow the data
   - Example: User sets 10-90, gets stored as {min: 10, max: 90}

### Intended Values Pattern

The key innovation is separating "what the user wants" from "what's currently visible":

**Scenario:**
1. User searches "pokemon" → bounds are 10-180
2. User sets range filter to 10-90 → stored as intended {min: 10, max: 90}
3. User applies water type filter → live data narrows to 50-80
4. **Slider shows**: Rail at 10-180, active region at 50-80, thumbs at 10-90
5. User removes water filter → live data returns to 10-180
6. **Result**: Range filter automatically restores to 10-90 (the intended values)

**Benefits:**
- Users don't lose their filter choices when exploring
- Clear visual feedback about data availability
- No confusion about what's filtered vs what's available

## Search Performance

### Dual Search Strategy

Every query change triggers two searches:

1. **Immediate Basic Search** (no facets)
   - Fires instantly on keystroke
   - Shows results immediately
   - No facet statistics
   - Fast response time

2. **Debounced Faceted Search** (with facets)
   - Fires 500ms after typing stops (configurable)
   - Updates facet statistics and bounds
   - Provides filter options
   - More expensive but complete

**Implementation:**
- Uses stable function references via `useRef` to maintain debounce timer
- `hasInitialized` ref prevents premature filter searches
- Separate effects for query changes vs filter changes

### Key Optimizations

1. **Stable Function References**
   ```typescript
   const performSearchRef = useRef<...>();
   const searchBasic = useCallback(() => {
     performSearchRef.current?.({ enableFacets: false });
   }, []); // No dependencies = stable
   ```

2. **Primitive Dependencies**
   ```typescript
   // Extract primitives from objects to prevent re-renders
   const settingsMaxResults = state.searchSettings.maxNumberOfRecordsToReturn;
   const settingsEnableCoverage = state.searchSettings.enableCoverage;
   // Use in dependencies instead of whole object
   ```

3. **Memoized Objects**
   ```typescript
   const settingsCoverageSetup = useMemo(
     () => state.searchSettings.coverageSetup,
     [/* individual fields */]
   );
   ```

## Preventing Invalid States

### Constraint System

To prevent creating filters with no results, we enforce:

- **Min thumb**: Can be set from `queryMin` to `liveDataMax`
  - Can't go above what currently exists
  - Example: With live data 50-80, min can't exceed 80

- **Max thumb**: Can be set from `liveDataMin` to `queryMax`
  - Can't go below what currently exists
  - Example: With live data 50-80, max can't be below 50

**Implementation in RangeFilterPanel:**

```typescript
// Drag handler
const handleSliderChange = (values: number[]) => {
  const clampedMin = Math.max(queryMin, Math.min(liveDataMax, values[0]));
  const clampedMax = Math.max(liveDataMin, Math.min(queryMax, values[1]));
  setSliderValue([clampedMin, clampedMax]);
};

// Input fields
<InputField
  min={queryMin}
  max={Math.min(liveDataMax, sliderValue[1] - 1)}
  // ... min input
/>
<InputField
  min={Math.max(liveDataMin, sliderValue[0] + 1)}
  max={queryMax}
  // ... max input
/>
```

## Component Architecture

### SearchContext.tsx

**Responsibilities:**
- Manages global search state
- Handles authentication
- Performs API calls
- Tracks bounds (query and live)
- Provides search functions

**Key State:**
```typescript
{
  query: string;                                    // Current search text
  results: SearchResult[] | null;                   // Search results
  filters: Record<string, string[]>;                // Value filters
  rangeFilters: Record<string, {min: number, max: number}>; // Range filters
  facetStats: Record<string, {min: number, max: number}>;   // Live bounds
  rangeBounds: Record<string, {min: number, max: number}>;  // Query bounds
}
```

**Search Flow:**
1. User types → query changes
2. `searchBasic()` fires immediately
3. `searchWithFacets()` debounced (500ms)
4. On completion:
   - Update `lastQueryText` if query changed
   - Update `rangeBounds` if query changed
   - Always update `facetStats`

### RangeFilterPanel.tsx

**Responsibilities:**
- Renders slider UI
- Manages local slider state
- Enforces constraints
- Debounces filter updates (500ms)

**Key Logic:**
```typescript
// Display values (what thumbs show)
const displayMin = intended ? intended.min : queryMin;
const displayMax = intended ? intended.max : queryMax;

// Visual indicators
const isSelfActive = intended !== undefined;
const isFaceted = liveDataMin !== queryMin || liveDataMax !== queryMax;
```

**Slider Props:**
```typescript
<Slider
  min={queryMin}              // Rail start
  max={queryMax}              // Rail end
  value={[finalMin, finalMax]} // Thumb positions
  activeMin={liveDataMin}     // Active region start
  activeMax={liveDataMax}     // Active region end
  isFaceted={isFaceted}       // Show colored overlay
/>
```

## Filter Interactions

### Value Filter Click

1. User clicks value filter button
2. `toggleFilter()` updates `state.filters`
3. Filter change effect triggers
4. `performSearch({ enableFacets: true })` runs
5. API returns new `facetStats` (live bounds)
6. Range filter slider updates active region
7. **Range filter thumbs stay at intended values**

### Range Filter Adjustment

1. User drags slider thumb
2. Local `sliderValue` updates (immediate visual feedback)
3. After 500ms debounce:
   - Check if values equal query bounds → reset filter
   - Otherwise → store as intended values
4. Filter change effect triggers
5. New search with updated range filter
6. Slider stays at user's choice

### Filter Reset

1. User clicks X on active filter
2. `resetSingleFilter()` removes from state
3. Filter change effect triggers
4. New search without that filter
5. Results and bounds update

## File Locations

- **SearchContext**: `/packages/indx-intrface/src/context/SearchContext.tsx`
- **RangeFilterPanel**: `/packages/indx-intrface/src/components/RangeFilterPanel.tsx`
- **Slider**: `/packages/indx-systm/src/components/Slider/Slider.tsx`
- **ActiveFiltersPanel**: `/packages/indx-intrface/src/components/ActiveFiltersPanel.tsx`

## Known Behaviors

### Initialization
- Initial blank search fires after authentication completes
- Uses `hasInitialized` ref to prevent premature filter searches
- `isFetchingInitial` state tracks authentication status

### React StrictMode
- Development mode causes double-invocation
- Effects run twice in dev, once in production
- Ref-based tracking prevents duplicate searches

### Debouncing
- Range filters: 500ms debounce for filter application
- Faceted search: 500ms debounce after typing stops
- Separate timers don't interfere

## Future Considerations

- Could add visual warning for ranges outside live data
- Could add "anticipatory filtering" mode
- Could persist intended values to URL/localStorage
- Could add animation when bounds change

---

**Last Updated**: 2025-11-27
**Contributors**: Anders, Claude
