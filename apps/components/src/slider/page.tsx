
import { Slider } from '@indxsearch/systm';
import { useState, useEffect } from 'react';
import styles from './page.module.css';

export default function SliderPage() {
  const [mounted, setMounted] = useState(false);
  const [singleValue, setSingleValue] = useState(50);
  const [rangeValue, setRangeValue] = useState<[number, number]>([25, 75]);
  const [liveRangeValue, setLiveRangeValue] = useState<[number, number]>([30, 80]);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <main className={styles.main}>
        <div className={styles.section}>
          <h1 className={styles.title}>Slider</h1>
          <p className={styles.desc}>Range slider component with single and dual thumb modes</p>
        </div>
      </main>
    );
  }

  return (
    <main className={styles.main}>
      <div className={styles.section}>
        <h1 className={styles.title}>Slider</h1>
        <p className={styles.desc}>Range slider component with single and dual thumb modes</p>
      </div>

      <div className={styles.section}>
        <h2 className={styles.heading}>Single Value</h2>
        <div className={styles.sliderContainer}>
          <Slider
            aria-label="Single value slider"
            min={0}
            max={100}
            value={singleValue}
            onChange={(val) => setSingleValue(val as number)}
          />
          <p className={styles.valueDisplay}>Value: {singleValue}</p>
        </div>
      </div>

      <div className={styles.section}>
        <h2 className={styles.heading}>Range (Two Thumbs)</h2>
        <div className={styles.sliderContainer}>
          <Slider
            aria-label="Range slider"
            min={0}
            max={100}
            value={rangeValue}
            isRange
            onChange={(val) => setRangeValue(val as [number, number])}
          />
          <p className={styles.valueDisplay}>Range: {rangeValue[0]} - {rangeValue[1]}</p>
        </div>
      </div>

      <div className={styles.section}>
        <h2 className={styles.heading}>With Step</h2>
        <div className={styles.sliderContainer}>
          <Slider
            aria-label="Slider with step"
            min={0}
            max={100}
            step={10}
            value={singleValue}
            onChange={(val) => setSingleValue(val as number)}
          />
          <p className={styles.valueDisplay}>Value: {singleValue} (step: 10)</p>
        </div>
      </div>

      <div className={styles.section}>
        <h2 className={styles.heading}>With Live Range Overlay</h2>
        <div className={styles.sliderContainer}>
          <Slider
            aria-label="Slider with live range overlay"
            min={0}
            max={100}
            value={liveRangeValue}
            isRange
            activeMin={40}
            activeMax={70}
            onChange={(val) => setLiveRangeValue(val as [number, number])}
          />
          <p className={styles.valueDisplay}>
            Range: {liveRangeValue[0]} - {liveRangeValue[1]} (active: 40-70)
          </p>
        </div>
      </div>

      <div className={styles.section}>
        <h2 className={styles.heading}>Faceted Range</h2>
        <div className={styles.sliderContainer}>
          <Slider
            aria-label="Faceted range slider"
            min={0}
            max={100}
            value={[20, 90]}
            isRange
            isFaceted
            activeMin={30}
            activeMax={85}
            onChange={() => {}}
          />
          <p className={styles.valueDisplay}>Range: 20 - 90 (faceted with active: 30-85)</p>
        </div>
      </div>

      <div className={styles.section}>
        <h2 className={styles.heading}>Disabled State</h2>
        <div className={styles.sliderContainer}>
          <Slider
            aria-label="Disabled slider"
            min={0}
            max={100}
            value={50}
            disabled
            onChange={() => {}}
          />
          <p className={styles.valueDisplay}>Value: 50 (disabled)</p>
        </div>
      </div>
    </main>
  );
}
