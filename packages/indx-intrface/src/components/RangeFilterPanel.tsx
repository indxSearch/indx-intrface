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
    state: { rangeFilters, rangeBounds, facetStats, query },
    setRangeFilter,
    resetSingleFilter,
    allowEmptySearch
  } = useSearchContext();

  // 1) Query-specific bounds (updates only when query text changes)
  const queryBounds = rangeBounds?.[field] ?? { min: expectedMin, max: expectedMax };
  const queryMin = queryBounds.min;
  const queryMax = queryBounds.max;

  // 2) Live data bounds (reflects all active filters, used for active region visualization)
  const liveDataBounds = facetStats?.[field] ?? queryBounds;
  const liveDataMin = liveDataBounds.min;
  const liveDataMax = liveDataBounds.max;

  // 3) If query bounds are equal, disable slider (no range to filter)
  const isDisabled = queryMin === queryMax;

  // 4) Get intended values from rangeFilters (user's choice, or undefined if unset)
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
    // First timeout for invalid state (300ms)
    const invalidTimer = setTimeout(() => {
      setIsMinInvalid(!isValidMin);
      setIsMaxInvalid(!isValidMax);
    }, 300);

    // Second timeout for filter update (500ms)
    const filterTimer = setTimeout(() => {
      if (isValidMin && isValidMax) {
        if (finalMin === queryMin && finalMax === queryMax) {
          // Slider at full query bounds, no filtering needed
          resetSingleFilter(field);
        } else {
          // Store as intended values (these will be sent to API)
          setRangeFilter(field, finalMin, finalMax);
        }
      }
    }, 500);

    // Cleanup both timeouts
    return () => {
      clearTimeout(invalidTimer);
      clearTimeout(filterTimer);
    };
  }, [finalMin, finalMax, isValidMin, isValidMax, queryMin, queryMax, field, resetSingleFilter, setRangeFilter]);

  // ─────────────────────────────────────────────────────────────────────────────
  // 7) Sync sliderValue with display values when they change
  //    This happens when: intended values change, query bounds change, or field changes
  React.useEffect(() => {
    setSliderValue([displayMin, displayMax]);
  }, [displayMin, displayMax, field]);

  // ─────────────────────────────────────────────────────────────────────────────
  // 7) Drag handlers (only update local thumb position until let‐go)
  const handleSliderChange = React.useCallback((values: number[]) => {
    if (isDisabled) return;
    setSliderValue([values[0], values[1]]);
  }, [isDisabled]);

  const handleSliderCommit = React.useCallback((values: number[]) => {
    if (isDisabled) return;
    setSliderValue([values[0], values[1]]);
  }, [isDisabled]);

  // 8) Manual number‐input handlers (all within [globalMin, globalMax])
  const handleMinChange = React.useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    if (isDisabled) return;
    const value = Number(e.target.value);
    if (!isNaN(value)) {
      setSliderValue([value, sliderValue[1]]);
    }
  }, [isDisabled, sliderValue[1]]);

  const handleMaxChange = React.useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    if (isDisabled) return;
    const value = Number(e.target.value);
    if (!isNaN(value)) {
      setSliderValue([sliderValue[0], value]);
    }
  }, [isDisabled, sliderValue[0]]);

  const handleMinBlur = React.useCallback(() => {
    const value = sliderValue[0];
    const clampedValue = Math.max(queryMin, Math.min(queryMax, value));
    // Only update if the value is within valid range
    if (clampedValue >= queryMin && clampedValue < sliderValue[1]) {
      setSliderValue([clampedValue, sliderValue[1]]);
    } else {
      // Reset to last valid value
      setSliderValue([queryMin, sliderValue[1]]);
    }
  }, [sliderValue, queryMin, queryMax]);

  const handleMaxBlur = React.useCallback(() => {
    const value = sliderValue[1];
    const clampedValue = Math.max(queryMin, Math.min(queryMax, value));
    // Only update if the value is within valid range
    if (clampedValue <= queryMax && clampedValue > sliderValue[0]) {
      setSliderValue([sliderValue[0], clampedValue]);
    } else {
      // Reset to last valid value
      setSliderValue([sliderValue[0], queryMax]);
    }
  }, [sliderValue, queryMin, queryMax]);

  // Don't show if query is empty and allowEmptySearch is false
  // (Must come after all hooks to follow Rules of Hooks)
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
            min={queryMin}
            max={queryMax}
            value={[finalMin, finalMax]}
            isRange
            onChange={(vals: number | number[]) => handleSliderChange(vals as [number, number])}
            onFinalChange={(vals: number | number[]) => handleSliderCommit(vals as [number, number])}
            disabled={isDisabled}
            activeMin={liveDataMin}
            activeMax={liveDataMax}
            isFaceted={isFaceted}
            highlightFaceted={isSelfActive}
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
            type="number"
            value={sliderValue[0]}
            min={queryMin}
            max={sliderValue[1] - 1}
            onChange={handleMinChange}
            onBlur={handleMinBlur}
            disabled={isDisabled}
            isValid={!isMinInvalid}
          />
          <InputField
            type="number"
            value={sliderValue[1]}
            min={sliderValue[0] + 1}
            max={queryMax}
            onChange={handleMaxChange}
            onBlur={handleMaxBlur}
            disabled={isDisabled}
            isValid={!isMaxInvalid}
          />
        </div>
      </FilterPanelBase>
    );
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // 11) Fallback: two number inputs
  return (
    <FilterPanelBase title={label}>
      <div style={{ display: 'flex', gap: '10px', alignItems: 'flex-start' }}>
        <InputField
          label="Min:"
          type="number"
          value={sliderValue[0]}
          min={queryMin}
          max={sliderValue[1] - 1}
          onChange={handleMinChange}
          onBlur={handleMinBlur}
          disabled={isDisabled}
          isValid={!isMinInvalid}
        />
        <InputField
          label="Max:"
          type="number"
          value={sliderValue[1]}
          min={sliderValue[0] + 1}
          max={queryMax}
          onChange={handleMaxChange}
          onBlur={handleMaxBlur}
          disabled={isDisabled}
          isValid={!isMaxInvalid}
        />
      </div>
      {isDisabled && (
        <div className={styles.disabledMessage}>
          No adjustable range (all results have the same value: {queryMin}).
        </div>
      )}
    </FilterPanelBase>
  );
};
