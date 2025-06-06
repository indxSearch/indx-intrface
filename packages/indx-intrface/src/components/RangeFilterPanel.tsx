import React from 'react';
import { Range } from 'react-range';
import { useSearchContext } from '../context/SearchContext';
import { InputField, FilterPanelBase } from '@indxsearch/systm';

export interface RangeFilterPanelProps {
  field: string;
  label?: string;
  expectedMin?: number;
  expectedMax?: number;
  displayType?: 'slider' | 'input';
}

export const RangeFilterPanel: React.FC<RangeFilterPanelProps> = ({
  field,
  label,
  expectedMin = 0,
  expectedMax = 1000,
  displayType = 'input',
}) => {
  const {
    state: { rangeFilters, rangeBounds, facetStats },
    setRangeFilter,
  } = useSearchContext();

  // 1) Global bounds (only on new query)
  const globalMin = rangeBounds?.[field]?.min ?? expectedMin;
  const globalMax = rangeBounds?.[field]?.max ?? expectedMax;

  // 2) Live (filtered) bounds under all active filters (incl. value‐filter on this field)
  const liveMin = facetStats?.[field]?.min ?? globalMin;
  const liveMax = facetStats?.[field]?.max ?? globalMax;

  // 3) If liveMin===liveMax, disable/hide slider
  const isDisabled = liveMin === liveMax;

  // 4) The “official” thumbs from context, or fallback to global
  const ctxMin = rangeFilters?.[field]?.min ?? globalMin;
  const ctxMax = rangeFilters?.[field]?.max ?? globalMax;

  // 5) Local sliderValue (thumb positions). Initialize once to [ctxMin, ctxMax].
  //    After that, we never overwrite it unless the user drags.
  const [sliderValue, setSliderValue] = React.useState<[number, number]>([
    ctxMin,
    ctxMax,
  ]);

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
  const handleSliderChange = (values: number[]) => {
    if (isDisabled) return;
    setSliderValue([values[0], values[1]]);
  };
  const handleSliderCommit = (values: number[]) => {
    if (isDisabled) return;
    let [m, M] = values;
    // Clamp into [globalMin, globalMax] on commit
    m = Math.max(globalMin, Math.min(globalMax, m));
    M = Math.max(globalMin, Math.min(globalMax, M));
    setSliderValue([m, M]);
    setRangeFilter(field, m, M);
  };

  // ─────────────────────────────────────────────────────────────────────────────
  // 8) Manual number‐input handlers (all within [globalMin,globalMax])
  const handleMinChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (isDisabled) return;
    const value = Number(e.target.value);
    if (!isNaN(value) && value < sliderValue[1] && value >= globalMin) {
      setSliderValue([value, sliderValue[1]]);
      setRangeFilter(field, value, sliderValue[1]);
    }
  };
  const handleMaxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (isDisabled) return;
    const value = Number(e.target.value);
    if (!isNaN(value) && value > sliderValue[0] && value <= globalMax) {
      setSliderValue([sliderValue[0], value]);
      setRangeFilter(field, sliderValue[0], value);
    }
  };

  // ─────────────────────────────────────────────────────────────────────────────
  // 9) If no real span under live filters, show message
  // if (displayType === 'slider' && isDisabled) {
  //   return (
  //     <FilterPanelBase title={label}>
  //       <div>
  //         No adjustable range (all results have the same value:{' '}
  //         <strong>{liveMin}</strong>).
  //       </div>
  //     </FilterPanelBase>
  //   );
  // }

  // ─────────────────────────────────────────────────────────────────────────────
  // 10) Render slider (thumbs at `sliderValue`, rail always covers [globalMin→globalMax])
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
            disabled={isDisabled}
            renderTrack={({ props, children }) => (
              <div
                {...props}
                style={{
                  ...props.style,
                  height: '4px',
                  width: '100%',
                  background: '#eee', // full global track
                  borderRadius: '4px',
                  position: 'relative',
                  zIndex: 0,
                }}
              >
                {/* Blue overlay for “live” hits (liveMin→liveMax) */}
                <div
                  style={{
                    position: 'absolute',
                    left: `${((liveMin - globalMin) / (globalMax - globalMin)) * 100}%`,
                    width: `${((liveMax - liveMin) / (globalMax - globalMin)) * 100}%`,
                    height: '100%',
                    background: '#000',
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
                    height: '18px',
                    width: '18px',
                    backgroundColor: '#fff',
                    borderRadius: '50%',
                    border: '3px solid #000',
                    boxShadow: '0 2px 8px rgba(0,0,0,0.12)',
                    opacity: isDisabled ? 0.5 : 1,
                    cursor: isDisabled ? 'not-allowed' : 'grab',
                    zIndex: 100
                  }}
                />
              );
            }}
          />
          {/* <div
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
          </div> */}
        </div>
        <div style={{ display: 'flex', flex: 'flex-grow', gap: '10px', alignItems: 'flex-start', justifyContent: 'space-between' }}>
          <InputField
            type="number"
            value={sliderValue[0]}
            min={globalMin}
            max={sliderValue[1] - 1}
            onChange={handleMinChange}
            disabled={isDisabled}
          />
          <InputField
            type="number"
            value={sliderValue[1]}
            min={sliderValue[0] + 1}
            max={globalMax}
            onChange={handleMaxChange}
            disabled={isDisabled}
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
          disabled={isDisabled}
        />
        <InputField
          label="Max:"
          type="number"
          value={sliderValue[1]}
          min={sliderValue[0] + 1}
          max={globalMax}
          onChange={handleMaxChange}
          disabled={isDisabled}
        />
      </div>
      {isDisabled && (
        <div style={{ color: '#d32f2f', fontSize: '0.85rem', marginTop: '6px' }}>
          No adjustable range (all results have the same value: {liveMin}).
        </div>
      )}
    </FilterPanelBase>
  );
};
