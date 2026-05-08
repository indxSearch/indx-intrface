import React from 'react';
import { useSearchContext } from '../context/SearchContext';
import { Slider, InputField, FilterPanelBase } from '@indxsearch/systm';
import styles from './RangeFilterPanel.module.css';

export interface RangeFilterPanelProps {
  field: string;
  label?: string;
  displayType?: 'slider' | 'input';
  expectedMin?: number;
  expectedMax?: number;
  collapsible?: boolean; // If filter panel should be able to be collapsed
  startCollapsed?: boolean; // If filter should display as collapsed from init
}

export const RangeFilterPanel: React.FC<RangeFilterPanelProps> = ({
  field,
  label,
  expectedMin = 0,
  expectedMax = 1000,
  displayType = 'input',
  collapsible = true,
  startCollapsed = false
}) => {
  const {
    state: { rangeFilters, rangeBounds, facetStats, query, facetDebounceDelayMillis },
    setRangeFilter,
    resetRangeFilter,
    allowEmptySearch,
    isFetchingInitial
  } = useSearchContext();

  // 1) Query-specific bounds (updates only when query text changes)
  const hasRealBounds = rangeBounds?.[field] !== undefined;
  const queryBounds = rangeBounds?.[field] ?? { min: expectedMin, max: expectedMax };
  const queryMin = queryBounds.min;
  const queryMax = queryBounds.max;

  // 2) Live data bounds (reflects all active filters, used for active region visualization)
  const liveDataBounds = facetStats?.[field] ?? queryBounds;
  const liveDataMin = liveDataBounds.min;
  const liveDataMax = liveDataBounds.max;

  // 3) If query bounds are equal, disable slider (no range to filter)
  // Only disable if we have real bounds data (not just defaults)
  const isDisabled = hasRealBounds && queryMin === queryMax;

  // 4) Create artificial range for display when disabled (react-range can't handle min === max)
  // Use expectedMin/expectedMax to create a valid range for visual display only
  const displayQueryMin = isDisabled ? expectedMin : queryMin;
  const displayQueryMax = isDisabled ? expectedMax : queryMax;

  // 5) Get intended values from rangeFilters (user's choice, or undefined if unset)
  const intended = rangeFilters?.[field];

  // 5) Display values: use intended if set, otherwise default to query bounds (full range)
  const displayMin = intended ? intended.min : queryMin;
  const displayMax = intended ? intended.max : queryMax;

  // Check if user has set a filter on this field
  const isSelfActive = intended !== undefined;
  // Show as faceted if live data bounds differ from query bounds (other filters affecting this field)
  const isFaceted = liveDataMin !== queryMin || liveDataMax !== queryMax;

  // 6) Local sliderValue (thumb positions). Initialize to display values.
  const [sliderValue, setSliderValue] = React.useState<[number, number]>([
    displayMin,
    displayMax,
  ]);

  // Track if values are invalid with a delay
  const [isMinInvalid, setIsMinInvalid] = React.useState(false);
  const [isMaxInvalid, setIsMaxInvalid] = React.useState(false);

  // Memoize clamped values calculation (clamp to query bounds, not live data bounds)
  const { finalMin, finalMax, isValidMin, isValidMax } = React.useMemo(() => {
    const [min, max] = sliderValue;
    const clampedMin = Math.max(queryMin, Math.min(queryMax, min));
    const clampedMax = Math.max(queryMin, Math.min(queryMax, max));
    const finalMin = Math.min(clampedMin, clampedMax);
    const finalMax = Math.max(clampedMin, clampedMax);
    const isValidMin = finalMin >= queryMin && finalMin < finalMax;
    const isValidMax = finalMax <= queryMax && finalMax > finalMin;

    return { finalMin, finalMax, isValidMin, isValidMax };
  }, [sliderValue, queryMin, queryMax]);

  // Combined debounced effect for invalid state and filter updates
  React.useEffect(() => {
    // Don't validate when disabled to prevent red flash during transitions
    if (isDisabled) {
      return;
    }

    // Don't validate when at full range (prevents flash when resetting to defaults)
    const atFullRange = sliderValue[0] === queryMin && sliderValue[1] === queryMax;
    if (atFullRange) {
      setIsMinInvalid(false);
      setIsMaxInvalid(false);
      return;
    }

    // Use facetDebounceDelayMillis from SearchContext, default to 500ms
    const debounceDelay = facetDebounceDelayMillis ?? 500;

    // First timeout for invalid state (300ms)
    const invalidTimer = setTimeout(() => {
      setIsMinInvalid(!isValidMin);
      setIsMaxInvalid(!isValidMax);
    }, 300);

    // Second timeout for filter update (uses configurable delay)
    const filterTimer = setTimeout(() => {
      if (isValidMin && isValidMax) {
        if (finalMin === queryMin && finalMax === queryMax) {
          // Slider at full query bounds, no filtering needed (not a user action)
          resetRangeFilter(field, false);
        } else {
          // Store as intended values (these will be sent to API)
          setRangeFilter(field, finalMin, finalMax);
        }
      }
    }, debounceDelay);

    // Cleanup both timeouts
    return () => {
      clearTimeout(invalidTimer);
      clearTimeout(filterTimer);
    };
  }, [finalMin, finalMax, isValidMin, isValidMax, queryMin, queryMax, field, resetRangeFilter, setRangeFilter, facetDebounceDelayMillis, isDisabled]);

  // ─────────────────────────────────────────────────────────────────────────────
  // 7) Sync sliderValue with display values when they change
  //    This happens when: intended values change, query bounds change, or field changes
  React.useEffect(() => {
    setSliderValue([displayMin, displayMax]);
    // Clear invalid state when bounds change to prevent red flash
    setIsMinInvalid(false);
    setIsMaxInvalid(false);
  }, [displayMin, displayMax, field]);

  // ─────────────────────────────────────────────────────────────────────────────
  // 7) Drag handlers (only update local thumb position until let‐go)
  // Clamp min to [queryMin, liveDataMax] and max to [liveDataMin, queryMax]
  const handleSliderChange = React.useCallback((values: number[]) => {
    if (isDisabled) return;
    const clampedMin = Math.max(queryMin, Math.min(liveDataMax, values[0]));
    const clampedMax = Math.max(liveDataMin, Math.min(queryMax, values[1]));
    setSliderValue([clampedMin, clampedMax]);
  }, [isDisabled, queryMin, queryMax, liveDataMin, liveDataMax]);

  const handleSliderCommit = React.useCallback((values: number[]) => {
    if (isDisabled) return;
    const clampedMin = Math.max(queryMin, Math.min(liveDataMax, values[0]));
    const clampedMax = Math.max(liveDataMin, Math.min(queryMax, values[1]));

    // If dragged to full range, immediately clear the filter (IS a user action)
    if (clampedMin === queryMin && clampedMax === queryMax) {
      setSliderValue([queryMin, queryMax]);
      resetRangeFilter(field, true);
    } else {
      setSliderValue([clampedMin, clampedMax]);
    }
  }, [isDisabled, queryMin, queryMax, liveDataMin, liveDataMax, field, resetRangeFilter]);

  // 8) Manual number‐input handlers
  // Min can't exceed liveDataMax (can't filter above what exists)
  // Max can't be below liveDataMin (can't filter below what exists)
  const handleMinChange = React.useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    if (isDisabled) return;
    const value = Number(e.target.value);
    if (!isNaN(value)) {
      // Clamp to [queryMin, liveDataMax]
      const clampedValue = Math.max(queryMin, Math.min(liveDataMax, value));
      setSliderValue([clampedValue, sliderValue[1]]);
    }
  }, [isDisabled, sliderValue, queryMin, liveDataMax]);

  const handleMaxChange = React.useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    if (isDisabled) return;
    const value = Number(e.target.value);
    if (!isNaN(value)) {
      // Clamp to [liveDataMin, queryMax]
      const clampedValue = Math.max(liveDataMin, Math.min(queryMax, value));
      setSliderValue([sliderValue[0], clampedValue]);
    }
  }, [isDisabled, sliderValue, liveDataMin, queryMax]);

  const handleMinBlur = React.useCallback(() => {
    const value = sliderValue[0];
    // Clamp to [queryMin, liveDataMax] and ensure it's less than max
    const clampedValue = Math.max(queryMin, Math.min(liveDataMax, value));
    if (clampedValue < sliderValue[1]) {
      setSliderValue([clampedValue, sliderValue[1]]);
    } else {
      // Reset to queryMin if invalid
      setSliderValue([queryMin, sliderValue[1]]);
    }
  }, [sliderValue, queryMin, liveDataMax]);

  const handleMaxBlur = React.useCallback(() => {
    const value = sliderValue[1];
    // Clamp to [liveDataMin, queryMax] and ensure it's greater than min
    const clampedValue = Math.max(liveDataMin, Math.min(queryMax, value));
    if (clampedValue > sliderValue[0]) {
      setSliderValue([sliderValue[0], clampedValue]);
    } else {
      // Reset to queryMax if invalid
      setSliderValue([sliderValue[0], queryMax]);
    }
  }, [sliderValue, liveDataMin, queryMax]);

  // Don't show until data is loaded
  // (Must come after all hooks to follow Rules of Hooks)
  if (isFetchingInitial) {
    return null;
  }

  // Don't show if query is empty and allowEmptySearch is false
  if (!allowEmptySearch && !query) {
    return null;
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // 9) Render slider (rail at query bounds, active region shows live data bounds)
  if (displayType === 'slider') {
    return (
      <FilterPanelBase title={label} collapsed={startCollapsed} collapsible={collapsible}>
        {isDisabled && (
          <div className={styles.disabledMessage}>
            No adjustable range (all results have the same value: {queryMin}).
          </div>
        )}
        <div style={{ padding: '10px 10px 20px 10px' }}>
          <Slider
            min={displayQueryMin}
            max={displayQueryMax}
            value={isDisabled ? [displayQueryMin, displayQueryMax] : [finalMin, finalMax]}
            isRange
            onChange={(vals: number | number[]) => handleSliderChange(vals as [number, number])}
            onFinalChange={(vals: number | number[]) => handleSliderCommit(vals as [number, number])}
            disabled={isDisabled}
            activeMin={liveDataMin}
            activeMax={liveDataMax}
            isFaceted={isFaceted}
            highlightFaceted={isSelfActive}
            aria-label={label || `Filter by ${field}`}
          />
        </div>
        <div
          style={{
            display: 'flex',
            flex: 'flex-grow',
            gap: '10px',
            alignItems: 'flex-start',
            justifyContent: 'space-between',
          }}
        >
          <InputField
            label="Min:"
            type="number"
            value={isDisabled ? queryMin : sliderValue[0]}
            min={queryMin}
            max={Math.min(liveDataMax, sliderValue[1] - 1)}
            onChange={handleMinChange}
            onBlur={handleMinBlur}
            disabled={isDisabled}
            isValid={isDisabled || !isMinInvalid}
          />
          <InputField
            label="Max:"
            type="number"
            value={isDisabled ? queryMax : sliderValue[1]}
            min={Math.max(liveDataMin, sliderValue[0] + 1)}
            max={queryMax}
            onChange={handleMaxChange}
            onBlur={handleMaxBlur}
            disabled={isDisabled}
            isValid={isDisabled || !isMaxInvalid}
          />
        </div>
      </FilterPanelBase>
    );
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // 11) Fallback: two number inputs
  return (
    <FilterPanelBase title={label}>
      {isDisabled && (
        <div className={styles.disabledMessage}>
          No adjustable range (all results have the same value: {queryMin}).
        </div>
      )}
      <div style={{ display: 'flex', gap: '10px', alignItems: 'flex-start' }}>
        <InputField
          label="Min:"
          type="number"
          value={isDisabled ? queryMin : sliderValue[0]}
          min={queryMin}
          max={Math.min(liveDataMax, sliderValue[1] - 1)}
          onChange={handleMinChange}
          onBlur={handleMinBlur}
          disabled={isDisabled}
          isValid={isDisabled || !isMinInvalid}
        />
        <InputField
          label="Max:"
          type="number"
          value={isDisabled ? queryMax : sliderValue[1]}
          min={Math.max(liveDataMin, sliderValue[0] + 1)}
          max={queryMax}
          onChange={handleMaxChange}
          onBlur={handleMaxBlur}
          disabled={isDisabled}
          isValid={isDisabled || !isMaxInvalid}
        />
      </div>
    </FilterPanelBase>
  );
};
