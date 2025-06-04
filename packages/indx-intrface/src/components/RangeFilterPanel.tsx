import React from 'react';
import { Range } from 'react-range';
import { useSearchContext } from '../context/SearchContext';
import { InputField, FilterPanelBase } from '@indxsearch/systm';

export interface RangeFilterPanelProps {
  field: string;
  label?: string;
  displayType?: 'slider' | 'input';
}

export const RangeFilterPanel: React.FC<RangeFilterPanelProps> = ({
  field,
  label,
  displayType = 'input',
}) => {
  const {
    state: { rangeFilters, rangeBounds, facetStats, filters },
    setRangeFilter,
  } = useSearchContext();

  // Check if any non-range filters are active
  const hasOtherFilters =
    (filters && Object.keys(filters).length > 0) ||
    (rangeFilters &&
      Object.entries(rangeFilters).some(
        ([key, _]) => key !== field // any other field has a range filter
      )
    );

  // If only this range filter is set, treat as "unfiltered"
  const useFilteredBounds = hasOtherFilters;

  // Global (historic) min/max for full slider bar
  const globalMin = rangeBounds?.[field]?.min ?? 0;
  const globalMax = rangeBounds?.[field]?.max ?? 1000;

  // Current (faceted/filtered) min/max for restricting handles
  const filteredMin = facetStats?.[field]?.min ?? globalMin;
  const filteredMax = facetStats?.[field]?.max ?? globalMax;

  // What should be the allowed min/max for handles?
  const allowedMin = useFilteredBounds ? filteredMin : globalMin;
  const allowedMax = useFilteredBounds ? filteredMax : globalMax;

  const currentMin = rangeFilters?.[field]?.min ?? allowedMin;
  const currentMax = rangeFilters?.[field]?.max ?? allowedMax;


  // Local slider state for smoother UI updates
  const [sliderValue, setSliderValue] = React.useState<[number, number]>([currentMin, currentMax]);

  // Sync local state with external changes
  React.useEffect(() => {
    setSliderValue([currentMin, currentMax]);
  }, [currentMin, currentMax, allowedMin, allowedMax]);

  // Clamp slider to available range on move
  const handleSliderChange = (values: number[]) => {
    const [min, max] = values;
    const clampedMin = Math.max(allowedMin, Math.min(allowedMax, min));
    const clampedMax = Math.max(allowedMin, Math.min(allowedMax, max));
    setSliderValue([clampedMin, clampedMax]);
  };

  // Commit on mouse up / drag end
  const handleSliderCommit = (values: number[]) => {
    const [min, max] = values;
    setRangeFilter(field, min, max);
  };

  // Handle number input (manual min/max entry)
  const handleMinChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = Number(e.target.value);
    if (!isNaN(value) && value <= currentMax && value >= allowedMin) {
      setRangeFilter(field, value, currentMax);
    }
  };

  const handleMaxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = Number(e.target.value);
    if (!isNaN(value) && value >= currentMin && value <= allowedMax) {
      setRangeFilter(field, currentMin, value);
    }
  };

  if (displayType === 'slider') {
    return (
      <FilterPanelBase title={label}>
        <div style={{ padding: '1rem 0' }}>
          <Range
            step={1}
            min={globalMin}
            max={globalMax}
            values={sliderValue}
            onChange={handleSliderChange}
            onFinalChange={handleSliderCommit}
            renderTrack={({ props, children }) => (
              <div
                {...props}
                style={{
                  ...props.style,
                  height: '8px',
                  width: '100%',
                  background: '#eee', // global track (full range)
                  borderRadius: '4px',
                  position: 'relative',
                }}
              >
                {/* Overlay: filtered/active range */}
                <div
                  style={{
                    position: 'absolute',
                    left: `${((allowedMin - globalMin) / (globalMax - globalMin)) * 100}%`,
                    width: `${((allowedMax - allowedMin) / (globalMax - globalMin)) * 100}%`,
                    height: '100%',
                    background: '#b0d4ff',
                    zIndex: 1,
                    pointerEvents: 'none',
                    borderRadius: '4px',
                  }}
                />
                {children}
              </div>
            )}
            renderThumb={({ props }) => {
              const { key, ...restProps } = props;
              return (
                <div
                  key={key}
                  {...restProps}
                  style={{
                    ...restProps.style,
                    height: '20px',
                    width: '20px',
                    backgroundColor: '#1976d2',
                    borderRadius: '50%',
                    border: '2px solid #fff',
                    boxShadow: '0 2px 8px rgba(0,0,0,0.12)',
                  }}
                />
              );
            }}
          />
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', marginTop: '6px' }}>
            <span>
              {allowedMin}
              <small style={{ color: '#888', marginLeft: 4 }}>
                (min {globalMin})
              </small>
            </span>
            <span>
              {allowedMax}
              <small style={{ color: '#888', marginLeft: 4 }}>
                (max {globalMax})
              </small>
            </span>
          </div>
        </div>
      </FilterPanelBase>
    );
  }

  // Fallback to number input fields
  return (
    <FilterPanelBase title={label}>
      <div style={{ display: 'flex', gap: '10px', alignItems: 'flex-start' }}>
        <InputField
          label="Min:"
          type="number"
          value={currentMin}
          min={allowedMin}
          max={currentMax}
          onChange={handleMinChange}
        />
        <InputField
          label="Max:"
          type="number"
          value={currentMax}
          min={currentMin}
          max={allowedMax}
          onChange={handleMaxChange}
        />
      </div>
    </FilterPanelBase>
  );
};
