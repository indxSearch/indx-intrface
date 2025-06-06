// packages/systm/src/components/Slider.tsx

import React from 'react';
import { Range } from 'react-range';

type SingleValue = number;
type RangeValue = [number, number];

interface BaseSliderProps {
  min: number;
  max: number;
  step?: number;
  disabled?: boolean;
  className?: string;            // optional wrapper class
  activeMin?: number;            // new: live‐range lower bound
  activeMax?: number;            // new: live‐range upper bound
  onChange: (val: SingleValue | RangeValue) => void;
  onFinalChange?: (val: SingleValue | RangeValue) => void;
}

type SliderProps =
  | (BaseSliderProps & { value: SingleValue; isRange?: false })
  | (BaseSliderProps & { value: RangeValue; isRange: true });

export const Slider: React.FC<SliderProps> = (props) => {
  const {
    min,
    max,
    step = 1,
    disabled = false,
    className,
    activeMin,
    activeMax,
    onChange,
    onFinalChange,
  } = props as BaseSliderProps;

  // Helper to render the “live‐hits” overlay if both activeMin/activeMax are defined
  const renderLiveOverlay = () => {
    if (
      typeof activeMin === 'number' &&
      typeof activeMax === 'number' &&
      max > min
    ) {
      // Compute percentages relative to [min, max]
      const leftPct = ((activeMin - min) / (max - min)) * 100;
      const widthPct = ((activeMax - activeMin) / (max - min)) * 100;

      return (
        <div
          style={{
            position: 'absolute',
            left: `${leftPct}%`,
            width: `${widthPct}%`,
            height: '100%',
            background: '#000',
            zIndex: 1,
            pointerEvents: 'none',
            borderRadius: '4px',
          }}
        />
      );
    }
    return null;
  };

  if ('isRange' in props && props.isRange) {
    // ─────────── Two‐thumb “range” mode ───────────
    const valuePair = props.value as RangeValue;

    return (
      <div className={className}>
        <Range
          step={step}
          min={min}
          max={max}
          values={valuePair}
          onChange={(vals) => onChange(vals as RangeValue)}
          onFinalChange={(vals) => onFinalChange?.(vals as RangeValue)}
          disabled={disabled}
          renderTrack={({ props: trackProps, children }) => (
            <div
              {...trackProps}
              style={{
                ...trackProps.style,
                height: '4px',
                width: '100%',
                background: '#eee',
                borderRadius: '4px',
                position: 'relative',
              }}
            >
              {/* Live‐range overlay (if provided) */}
              {renderLiveOverlay()}

              {children}
            </div>
          )}
          renderThumb={({ props: thumbProps }) => (
            <div
              {...thumbProps}
              style={{
                ...thumbProps.style,
                height: '18px',
                width: '18px',
                backgroundColor: disabled ? '#ccc' : '#fff',
                borderRadius: '50%',
                border: '3px solid #000',
                boxShadow: '0 2px 8px rgba(0,0,0,0.12)',
                cursor: disabled ? 'not-allowed' : 'grab',
                zIndex: 100,
              }}
            />
          )}
        />
      </div>
    );
  } else {
    // ─────────── Single‐thumb “value” mode ───────────
    const singleValue = props.value as SingleValue;

    return (
      <div className={className}>
        <Range
          step={step}
          min={min}
          max={max}
          values={[singleValue]}
          onChange={(vals) => onChange(vals[0] as SingleValue)}
          onFinalChange={(vals) =>
            onFinalChange?.(vals[0] as SingleValue)
          }
          disabled={disabled}
          renderTrack={({ props: trackProps, children }) => (
            <div
              {...trackProps}
              style={{
                ...trackProps.style,
                height: '4px',
                width: '100%',
                background: '#eee',
                borderRadius: '4px',
                position: 'relative',
              }}
            >
              {/* Live‐range overlay (if provided) */}
              {renderLiveOverlay()}

              {children}
            </div>
          )}
          renderThumb={({ props: thumbProps }) => (
            <div
              {...thumbProps}
              style={{
                ...thumbProps.style,
                height: '18px',
                width: '18px',
                backgroundColor: disabled ? '#ccc' : '#fff',
                borderRadius: '50%',
                border: '3px solid #000',
                boxShadow: '0 2px 8px rgba(0,0,0,0.12)',
                cursor: disabled ? 'not-allowed' : 'grab',
                zIndex: 100,
              }}
            />
          )}
        />
      </div>
    );
  }
};
