// packages/systm/src/components/Slider.tsx
import styles from './Slider.module.css';
import React from 'react';
import { Range } from 'react-range';

type SingleValue = number;
type RangeValue = [number, number];

interface BaseSliderProps {
  min: number;
  max: number;
  step?: number;
  disabled?: boolean;
  className?: string;    // optional wrapper class
  activeMin?: number;    // live-range lower bound
  activeMax?: number;    // live-range upper bound
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

  if ('isRange' in props && props.isRange) {
    // ─────────── Two-thumb “range” mode ───────────
    const valuePair = props.value as RangeValue;
    const [v0, v1] = valuePair;

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
          renderTrack={({ props: trackProps, children }) => {
            // pull key off trackProps so we don't spread it
            const { key, ...restTrackProps } = (trackProps as any);

            // Compute percentages for the "selected" segment (between thumbs)
            // and for the "live" overlay (activeMin to activeMax).
            const span = max - min;
            const selectedLeftPct = ((v0 - min) / span) * 100;
            const selectedWidthPct = ((v1 - v0) / span) * 100;

            let liveLeftPct = 0;
            let liveWidthPct = 0;
            const hasLiveOverlay =
              typeof activeMin === 'number' &&
              typeof activeMax === 'number' &&
              activeMax > activeMin &&
              max > min;

            if (hasLiveOverlay) {
              liveLeftPct = ((activeMin! - min) / span) * 100;
              liveWidthPct = ((activeMax! - activeMin!) / span) * 100;
            }

            return (
              <div
                key={key}
                {...restTrackProps}
                className={styles.basetrack}
                style={{
                  ...restTrackProps.style,
                  position: 'relative',
                  height: '4px',
                  width: '100%',
                  background: '#eee', // Base track (z=0)
                  borderRadius: '4px',
                }}
              >
                {/* ─── Selected-range track ─── */}
                <div
                  className={styles.selectedtrack}
                  style={{
                    position: 'absolute',
                    left: `${selectedLeftPct}%`,
                    width: `${selectedWidthPct}%`,
                    height: '100%',
                    background: '#999', // your chosen color
                    zIndex: 1,
                    pointerEvents: 'none',
                    borderRadius: '4px',
                  }}
                />

                {/* ─── Live-overlay track ─── */}
                {hasLiveOverlay && (
                  <div
                    className={styles.livetrack}
                    style={{
                      position: 'absolute',
                      left: `${liveLeftPct}%`,
                      width: `${liveWidthPct}%`,
                      height: '100%',
                      background: '#000',
                      zIndex: 2,
                      pointerEvents: 'none',
                      borderRadius: '4px',
                    }}
                  />
                )}

                {children /* thumbs */}
              </div>
            );
          }}
          renderThumb={({ props: thumbProps }) => {
            const { key, ...restThumbProps } = (thumbProps as any);
            return (
              <div
                key={key}
                {...restThumbProps}
                className={styles.thumbs}
                style={{
                  ...restThumbProps.style,
                  height: '18px',
                  width: '18px',
                  backgroundColor: disabled ? '#ccc' : '#fff',
                  borderRadius: '50%',
                  border: '3px solid #000',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.12)',
                  cursor: disabled ? 'not-allowed' : 'grab',
                  zIndex: 3,
                }}
              />
            );
          }}
        />
      </div>
    );
  } else {
    // ─────────── Single-thumb “value” mode ───────────
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
          renderTrack={({ props: trackProps, children }) => {
            const { key, ...restTrackProps } = (trackProps as any);

            // Compute live overlay if given
            const span = max - min;
            let liveLeftPct = 0;
            let liveWidthPct = 0;
            const hasLiveOverlay =
              typeof activeMin === 'number' &&
              typeof activeMax === 'number' &&
              activeMax > activeMin &&
              max > min;

            if (hasLiveOverlay) {
              liveLeftPct = ((activeMin! - min) / span) * 100;
              liveWidthPct = ((activeMax! - activeMin!) / span) * 100;
            }

            return (
              <div
                key={key}
                {...restTrackProps}
                style={{
                  ...restTrackProps.style,
                  position: 'relative',
                  height: '4px',
                  width: '100%',
                  background: '#eee',
                  borderRadius: '4px',
                }}
              >
                {/* ─── Live-overlay track ─── */}
                {hasLiveOverlay && (
                  <div
                    style={{
                      position: 'absolute',
                      left: `${liveLeftPct}%`,
                      width: `${liveWidthPct}%`,
                      height: '100%',
                      background: '#000',
                      zIndex: 2,
                      pointerEvents: 'none',
                      borderRadius: '4px',
                    }}
                  />
                )}

                {children /* single thumb (z=3) */}
              </div>
            );
          }}
          renderThumb={({ props: thumbProps }) => {
            const { key, ...restThumbProps } = (thumbProps as any);
            return (
              <div
                key={key}
                {...restThumbProps}
                style={{
                  ...restThumbProps.style,
                  height: '18px',
                  width: '18px',
                  backgroundColor: disabled ? '#ccc' : '#fff',
                  borderRadius: '50%',
                  border: '3px solid #000',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.12)',
                  cursor: disabled ? 'not-allowed' : 'grab',
                  zIndex: 3,
                }}
              />
            );
          }}
        />
      </div>
    );
  }
};
