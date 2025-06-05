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
    state: { rangeFilters, rangeBounds, facetStats },
    setRangeFilter,
  } = useSearchContext();

  // 1) Determine the global min/max for this field.
  //    (from rangeBounds, which only updates on query changes)
  const globalMin = rangeBounds?.[field]?.min ?? 0;
  const globalMax = rangeBounds?.[field]?.max ?? 1000;

  // 2) Determine the “live” min/max under all current filters,
  //    including this field’s own range. Used to draw the blue overlay.
  const liveMin = facetStats?.[field]?.min ?? globalMin;
  const liveMax = facetStats?.[field]?.max ?? globalMax;

  // 3) Determine the current slider thumbs—either the user’s explicit range,
  //    or if none exists, default to [globalMin, globalMax].
  const currentMin = rangeFilters?.[field]?.min ?? globalMin;
  const currentMax = rangeFilters?.[field]?.max ?? globalMax;

  // 4) Keep a local copy of thumbs for smooth dragging.
  const [sliderValue, setSliderValue] = React.useState<[number, number]>([
    currentMin,
    currentMax,
  ]);

  React.useEffect(() => {
    setSliderValue([currentMin, currentMax]);
  }, [currentMin, currentMax]);

  // 5) Handle dragging: let thumbnails move anywhere in [globalMin, globalMax]
  const handleSliderChange = (values: number[]) => {
    setSliderValue([values[0], values[1]]);
  };

  const handleSliderCommit = (values: number[]) => {
    setRangeFilter(field, values[0], values[1]);
  };

  // 6) Handle manual number input edits:
  const handleMinChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = Number(e.target.value);
    if (!isNaN(value) && value <= sliderValue[1] && value >= globalMin) {
      setRangeFilter(field, value, sliderValue[1]);
    }
  };
  const handleMaxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = Number(e.target.value);
    if (!isNaN(value) && value >= sliderValue[0] && value <= globalMax) {
      setRangeFilter(field, sliderValue[0], value);
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
                  background: '#eee', // full global range
                  borderRadius: '4px',
                  position: 'relative',
                }}
              >
                {/* Blue overlay for live hits (liveMin → liveMax) */}
                <div
                  style={{
                    position: 'absolute',
                    left: `${((liveMin - globalMin) / (globalMax - globalMin)) * 100}%`,
                    width: `${((liveMax - liveMin) / (globalMax - globalMin)) * 100}%`,
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
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              fontSize: '0.85rem',
              marginTop: '6px',
            }}
          >
            <span>
              {liveMin}
              <small style={{ color: '#888', marginLeft: 4 }}>
                (min {globalMin})
              </small>
            </span>
            <span>
              {liveMax}
              <small style={{ color: '#888', marginLeft: 4 }}>
                (max {globalMax})
              </small>
            </span>
          </div>
        </div>
      </FilterPanelBase>
    );
  }

  // Fallback to numeric inputs
  return (
    <FilterPanelBase title={label}>
      <div style={{ display: 'flex', gap: '10px', alignItems: 'flex-start' }}>
        <InputField
          label="Min:"
          type="number"
          value={sliderValue[0]}
          min={globalMin}
          max={sliderValue[1]}
          onChange={handleMinChange}
        />
        <InputField
          label="Max:"
          type="number"
          value={sliderValue[1]}
          min={sliderValue[0]}
          max={globalMax}
          onChange={handleMaxChange}
        />
      </div>
    </FilterPanelBase>
  );
};