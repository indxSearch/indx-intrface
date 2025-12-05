
import { useState, useEffect } from 'react';
import { Slider, InputField, FilterPanelBase } from '@indxsearch/systm';
import styles from './page.module.css';

export default function RangeFilterPanelPage() {
  const [mounted, setMounted] = useState(false);
  const [hpRange, setHpRange] = useState<[number, number]>([50, 200]);
  const [attackRange, setAttackRange] = useState<[number, number]>([20, 150]);
  const [defenseMin, setDefenseMin] = useState(10);
  const [defenseMax, setDefenseMax] = useState(180);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <main className={styles.main}>
        <div className={styles.section}>
          <h1 className={styles.title}>RangeFilterPanel</h1>
          <p className={styles.desc}>Numeric range filter with slider</p>
        </div>
      </main>
    );
  }

  return (
    <main className={styles.main}>
      <div className={styles.section}>
        <h1 className={styles.title}>RangeFilterPanel</h1>
        <p className={styles.desc}>Numeric range filter with slider and input fields</p>
        <p className={styles.note}>
          Note: These demos show the UI patterns. The actual RangeFilterPanel component
          requires SearchProvider context and integrates with search state.
        </p>
      </div>

      <div className={styles.grid}>
        <div className={styles.demo}>
          <h2 className={styles.heading}>HP Range (Slider)</h2>
          <FilterPanelBase title="HP">
            <div style={{ padding: '10px 10px 20px 10px' }}>
              <Slider
                min={0}
                max={300}
                value={hpRange}
                isRange
                onChange={(val) => setHpRange(val as [number, number])}
              />
            </div>
            <div style={{ display: 'flex', gap: '10px' }}>
              <InputField
                type="number"
                value={hpRange[0]}
                min={0}
                max={hpRange[1] - 1}
                onChange={(e) => setHpRange([Number(e.target.value), hpRange[1]])}
              />
              <InputField
                type="number"
                value={hpRange[1]}
                min={hpRange[0] + 1}
                max={300}
                onChange={(e) => setHpRange([hpRange[0], Number(e.target.value)])}
              />
            </div>
          </FilterPanelBase>
          <pre className={styles.state}>
            {hpRange[0]} - {hpRange[1]}
          </pre>
        </div>

        <div className={styles.demo}>
          <h2 className={styles.heading}>Attack Range (Slider)</h2>
          <FilterPanelBase title="Attack">
            <div style={{ padding: '10px 10px 20px 10px' }}>
              <Slider
                min={0}
                max={200}
                value={attackRange}
                isRange
                onChange={(val) => setAttackRange(val as [number, number])}
              />
            </div>
            <div style={{ display: 'flex', gap: '10px' }}>
              <InputField
                type="number"
                value={attackRange[0]}
                min={0}
                max={attackRange[1] - 1}
                onChange={(e) => setAttackRange([Number(e.target.value), attackRange[1]])}
              />
              <InputField
                type="number"
                value={attackRange[1]}
                min={attackRange[0] + 1}
                max={200}
                onChange={(e) => setAttackRange([attackRange[0], Number(e.target.value)])}
              />
            </div>
          </FilterPanelBase>
          <pre className={styles.state}>
            {attackRange[0]} - {attackRange[1]}
          </pre>
        </div>

        <div className={styles.demo}>
          <h2 className={styles.heading}>Defense (Input Only)</h2>
          <FilterPanelBase title="Defense">
            <div style={{ display: 'flex', gap: '10px' }}>
              <InputField
                label="Min:"
                type="number"
                value={defenseMin}
                min={0}
                max={defenseMax - 1}
                onChange={(e) => setDefenseMin(Number(e.target.value))}
              />
              <InputField
                label="Max:"
                type="number"
                value={defenseMax}
                min={defenseMin + 1}
                max={250}
                onChange={(e) => setDefenseMax(Number(e.target.value))}
              />
            </div>
          </FilterPanelBase>
          <pre className={styles.state}>
            {defenseMin} - {defenseMax}
          </pre>
        </div>

        <div className={styles.demo}>
          <h2 className={styles.heading}>With Active Range</h2>
          <FilterPanelBase title="Speed">
            <div style={{ padding: '10px 10px 20px 10px' }}>
              <Slider
                min={0}
                max={200}
                value={[30, 170]}
                isRange
                activeMin={50}
                activeMax={150}
                isFaceted
                onChange={() => {}}
              />
            </div>
            <p style={{ fontSize: 'var(--text-sm)', color: 'var(--lv4)', marginTop: '1rem' }}>
              Shows active data range (50-150) within selected range (30-170)
            </p>
          </FilterPanelBase>
        </div>
      </div>
    </main>
  );
}
