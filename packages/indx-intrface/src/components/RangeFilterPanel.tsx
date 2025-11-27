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

  // 1) Global bounds (only on new query)
  const globalMin = rangeBounds?.[field]?.min ?? expectedMin;
  const globalMax = rangeBounds?.[field]?.max ?? expectedMax;

  // 2) Live (filtered) bounds under all active filters (incl. value‐filter on this field)
  const liveMin = facetStats?.[field]?.min ?? globalMin;
  const liveMax = facetStats?.[field]?.max ?? globalMax;

  // 3) If liveMin === liveMax, disable/hide slider
  const isDisabled = liveMin === liveMax;

  // 4) The "official" thumbs from context, or fallback to global
  const ctxMin = rangeFilters?.[field]?.min ?? globalMin;
  const ctxMax = rangeFilters?.[field]?.max ?? globalMax;

  // Check if the range is faceted (live bounds differ from global bounds)
  const isFaceted = liveMin !== globalMin || liveMax !== globalMax;
  const isSelfActive = ctxMin !== globalMin || ctxMax !== globalMax;

  // 5) Local sliderValue (thumb positions). Initialize once to [ctxMin, ctxMax].
  //    After that, we never overwrite it unless the user drags.
  const [sliderValue, setSliderValue] = React.useState<[number, number]>([
    ctxMin,
    ctxMax,
  ]);

  // Track if values are invalid with a delay
  const [isMinInvalid, setIsMinInvalid] = React.useState(false);
  const [isMaxInvalid, setIsMaxInvalid] = React.useState(false);

  // Memoize clamped values calculation
  const { finalMin, finalMax, isValidMin, isValidMax } = React.useMemo(() => {
    const [min, max] = sliderValue;
    const clampedMin = Math.max(globalMin, Math.min(globalMax, min));
    const clampedMax = Math.max(globalMin, Math.min(globalMax, max));
    const finalMin = Math.min(clampedMin, clampedMax);
    const finalMax = Math.max(clampedMin, clampedMax);
    const isValidMin = finalMin >= globalMin && finalMin < finalMax;
    const isValidMax = finalMax <= globalMax && finalMax > finalMin;

    return { finalMin, finalMax, isValidMin, isValidMax };
  }, [sliderValue, globalMin, globalMax]);

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
        if (finalMin === globalMin && finalMax === globalMax) {
          resetSingleFilter(field);
        } else {
          setRangeFilter(field, finalMin, finalMax);
        }
      }
    }, 500);

    // Cleanup both timeouts
    return () => {
      clearTimeout(invalidTimer);
      clearTimeout(filterTimer);
    };
  }, [finalMin, finalMax, isValidMin, isValidMax, globalMin, globalMax, field]);

  // ─────────────────────────────────────────────────────────────────────────────
  // 6) If context had a saved rangeFilter (ctxMin/ctxMax), sync ONCE on mount or when
  //    'field' changes. BUT do not respond to bound‐changes.
  React.useEffect(() => {
    setSliderValue([ctxMin, ctxMax]);
    // Intentionally _not_ depending on globalMin/globalMax or liveMin/liveMax,
    // so changing bounds won't shift the thumbs.
  }, [ctxMin, ctxMax, field]);

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
    const clampedValue = Math.max(globalMin, Math.min(globalMax, value));
    // Only update if the value is within valid range
    if (clampedValue >= globalMin && clampedValue < sliderValue[1]) {
      setSliderValue([clampedValue, sliderValue[1]]);
    } else {
      // Reset to last valid value
      setSliderValue([globalMin, sliderValue[1]]);
    }
  }, [sliderValue, globalMin, globalMax]);

  const handleMaxBlur = React.useCallback(() => {
    const value = sliderValue[1];
    const clampedValue = Math.max(globalMin, Math.min(globalMax, value));
    // Only update if the value is within valid range
    if (clampedValue <= globalMax && clampedValue > sliderValue[0]) {
      setSliderValue([sliderValue[0], clampedValue]);
    } else {
      // Reset to last valid value
      setSliderValue([sliderValue[0], globalMax]);
    }
  }, [sliderValue, globalMin, globalMax]);

  // Don't show if query is empty and allowEmptySearch is false
  // (Must come after all hooks to follow Rules of Hooks)
  if (!allowEmptySearch && !query) {
    return null;
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // 9) Render slider (thumbs at `sliderValue`, rail always covers [globalMin→globalMax])
  if (displayType === 'slider') {
    return (
      <FilterPanelBase title={label} collapsed={startCollapsed} collapsible={collapsible}>
        {isDisabled && (
          <div className={styles.disabledMessage}>
            No adjustable range (all results have the same value: {liveMin}).
          </div>
        )}
        <div style={{ padding: '10px 10px 20px 10px' }}>
          <Slider
            min={globalMin}
            max={globalMax}
            value={[finalMin, finalMax]}
            isRange
            onChange={(vals: number | number[]) => handleSliderChange(vals as [number, number])}
            onFinalChange={(vals: number | number[]) => handleSliderCommit(vals as [number, number])}
            disabled={isDisabled}
            activeMin={liveMin}
            activeMax={liveMax}
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
            min={globalMin}
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
            max={globalMax}
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
          min={globalMin}
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
          max={globalMax}
          onChange={handleMaxChange}
          onBlur={handleMaxBlur}
          disabled={isDisabled}
          isValid={!isMaxInvalid}
        />
      </div>
      {isDisabled && (
        <div className={styles.disabledMessage}>
          No adjustable range (all results have the same value: {liveMin}).
        </div>
      )}
    </FilterPanelBase>
  );
};
