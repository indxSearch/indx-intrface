
import { useState, useEffect } from 'react';
import { Button, Checkbox, FilterPanelBase, Slider } from '@indxsearch/systm';
import { X_or_error } from '@indxsearch/pixl';
import styles from './page.module.css';

const pokemonTypes = [
  { key: 'water', value: 45 },
  { key: 'fire', value: 32 },
  { key: 'grass', value: 28 },
  { key: 'electric', value: 15 },
];

const rarities = [
  { key: 'common', value: 85 },
  { key: 'uncommon', value: 42 },
  { key: 'rare', value: 18 },
  { key: 'legendary', value: 5 },
];

export default function ActiveFiltersPanelPage() {
  const [mounted, setMounted] = useState(false);
  const [selectedTypes, setSelectedTypes] = useState<string[]>([]);
  const [selectedRarities, setSelectedRarities] = useState<string[]>([]);
  const [hpRange, setHpRange] = useState<[number, number] | null>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  const toggleType = (type: string) => {
    setSelectedTypes(prev =>
      prev.includes(type) ? prev.filter(t => t !== type) : [...prev, type]
    );
  };

  const toggleRarity = (rarity: string) => {
    setSelectedRarities(prev =>
      prev.includes(rarity) ? prev.filter(r => r !== rarity) : [...prev, rarity]
    );
  };

  const removeType = (type: string) => {
    setSelectedTypes(prev => prev.filter(t => t !== type));
  };

  const removeRarity = (rarity: string) => {
    setSelectedRarities(prev => prev.filter(r => r !== rarity));
  };

  const removeHpRange = () => {
    setHpRange(null);
  };

  const resetAll = () => {
    setSelectedTypes([]);
    setSelectedRarities([]);
    setHpRange(null);
  };

  const hasFilters = selectedTypes.length > 0 || selectedRarities.length > 0 || hpRange !== null;

  if (!mounted) {
    return (
      <main className={styles.main}>
        <div className={styles.section}>
          <h1 className={styles.title}>ActiveFiltersPanel</h1>
          <p className={styles.desc}>Display active filter chips with dismiss buttons</p>
        </div>
      </main>
    );
  }

  return (
    <main className={styles.main}>
      <div className={styles.section}>
        <h1 className={styles.title}>ActiveFiltersPanel</h1>
        <p className={styles.desc}>Displays active filter chips with dismiss buttons. Try selecting filters below to see them appear.</p>
        <p className={styles.note}>
          Note: This demo shows the UI pattern. The actual ActiveFiltersPanel component
          requires SearchProvider context and integrates with search state.
        </p>
      </div>

      {hasFilters && (
        <div className={styles.activeFiltersContainer}>
          <FilterPanelBase title="Active filters" collapsible={false}>
            <ul className={styles.chipList}>
              {selectedTypes.map((type) => (
                <li key={type}>
                  <Button
                    onClick={() => removeType(type)}
                    iconRight={<X_or_error />}
                    variant='primary'
                    size='micro'
                  >
                    type: {type}
                  </Button>
                </li>
              ))}
              {selectedRarities.map((rarity) => (
                <li key={rarity}>
                  <Button
                    onClick={() => removeRarity(rarity)}
                    iconRight={<X_or_error />}
                    variant='primary'
                    size='micro'
                  >
                    rarity: {rarity}
                  </Button>
                </li>
              ))}
              {hpRange && (
                <li>
                  <Button
                    onClick={removeHpRange}
                    iconRight={<X_or_error />}
                    variant='primary'
                    size='micro'
                  >
                    hp: {hpRange[0]} – {hpRange[1]}
                  </Button>
                </li>
              )}
              <li>
                <Button
                  onClick={resetAll}
                  size='micro'
                  variant='ghost'
                >
                  Reset
                </Button>
              </li>
            </ul>
          </FilterPanelBase>
        </div>
      )}

      <div className={styles.divider} />

      <div className={styles.filtersSection}>
        <h2 className={styles.heading}>Apply Filters</h2>
        <div className={styles.grid}>
          <FilterPanelBase title="Pokemon Type">
            <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
              {pokemonTypes.map(({ key, value }) => (
                <li key={key} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                  <Checkbox
                    label={key}
                    score=""
                    checked={selectedTypes.includes(key)}
                    onChange={() => toggleType(key)}
                  />
                  <span style={{ fontSize: 'var(--text-sm)', color: 'var(--lv4)' }}>{value}</span>
                </li>
              ))}
            </ul>
          </FilterPanelBase>

          <FilterPanelBase title="Rarity">
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '0.5rem' }}>
              {rarities.map(({ key, value }) => (
                <Button
                  key={key}
                  variant={selectedRarities.includes(key) ? 'primary' : 'secondary'}
                  onClick={() => toggleRarity(key)}
                  size="micro"
                >
                  {key} ({value})
                </Button>
              ))}
            </div>
          </FilterPanelBase>

          <FilterPanelBase title="HP Range">
            <div style={{ padding: '10px 10px 20px 10px' }}>
              <Slider
                min={0}
                max={300}
                value={hpRange || [0, 300]}
                isRange
                onChange={(val) => setHpRange(val as [number, number])}
              />
            </div>
            <p style={{ fontSize: 'var(--text-sm)', color: 'var(--lv4)', textAlign: 'center' }}>
              {hpRange ? `${hpRange[0]} - ${hpRange[1]}` : '0 - 300 (no filter)'}
            </p>
          </FilterPanelBase>
        </div>
      </div>
    </main>
  );
}
