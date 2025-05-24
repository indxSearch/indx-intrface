// import Range from 'react-range';
import React from 'react';
import { useSearchContext } from '../context/SearchContext';

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
    state: { rangeFilters, rangeBounds },
    setRangeFilter,
  } = useSearchContext();

  const actualMin = rangeBounds?.[field]?.min ?? 0;
  const actualMax = rangeBounds?.[field]?.max ?? 1000;

  const currentMin = rangeFilters?.[field]?.min ?? actualMin;
  const currentMax = rangeFilters?.[field]?.max ?? actualMax;

  const handleRangeChange = (values: number[]) => {
    const [min, max] = values;
    if (!isNaN(min) && !isNaN(max) && min <= max) {
      if (min !== actualMin || max !== actualMax) {
        setRangeFilter(field, min, max);
      } else {
        setRangeFilter(field, actualMin, actualMax); // reset to full bounds
      }
    }
  };

  // if (displayType === 'slider') {
  //   return (
  //     <fieldset>
  //       <legend>{label || field}</legend>
  //       <div style={{ padding: '1rem 0' }}>
  //         <Range
  //           step={1}
  //           min={actualMin}
  //           max={actualMax}
  //           values={[currentMin, currentMax]}
  //           onChange={handleRangeChange}
  //           renderTrack={({ props, children }) => (
  //             <div
  //               {...props}
  //               style={{
  //                 ...props.style,
  //                 height: '6px',
  //                 width: '100%',
  //                 backgroundColor: '#ccc',
  //               }}
  //             >
  //               {children}
  //             </div>
  //           )}
  //           renderThumb={({ props, index }) => {
  //             const { key, ...rest } = props;
  //             return (
  //               <div
  //                 key={key}
  //                 {...rest}
  //                 style={{
  //                   ...props.style,
  //                   height: '20px',
  //                   width: '20px',
  //                   backgroundColor: '#999',
  //                   borderRadius: '50%',
  //                 }}
  //               />
  //             );
  //           }}
  //         />
  //         <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem' }}>
  //           <span>{Number(currentMin)}</span>
  //           <span>{Number(currentMax)}</span>
  //         </div>
  //       </div>
  //     </fieldset>
  //   );
  // }

  const handleMinChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const input = e.target.value;
    if (input === '') return;
    const value = Number(input);
    if (!isNaN(value) && value <= currentMax) {
      setRangeFilter(field, value, currentMax);
    }
  };

  const handleMaxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const input = e.target.value;
    if (input === '') return;
    const value = Number(input);
    if (!isNaN(value) && value >= currentMin) {
      setRangeFilter(field, currentMin, value);
    }
  };

  return (
    <fieldset>
      <legend>{label || field}</legend>
      <label>
        Min:
        <input
          type="number"
          value={currentMin}
          onChange={handleMinChange}
        />
      </label>
      <label>
        Max:
        <input
          type="number"
          value={currentMax}
          onChange={handleMaxChange}
        />
      </label>
    </fieldset>
  );
};
