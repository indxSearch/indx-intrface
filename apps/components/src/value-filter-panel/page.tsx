
import { useState } from 'react';
import { Checkbox, Button, FilterPanelBase } from '@indxsearch/systm';
import styles from './page.module.css';

const pokemonTypes = [
  { key: 'water', value: 45 },
  { key: 'fire', value: 32 },
  { key: 'grass', value: 28 },
  { key: 'electric', value: 15 },
  { key: 'psychic', value: 12 },
  { key: 'dragon', value: 8 },
];

const rarities = [
  { key: 'common', value: 85 },
  { key: 'uncommon', value: 42 },
  { key: 'rare', value: 18 },
  { key: 'legendary', value: 5 },
];

export default function ValueFilterPanelPage() {
  const [selectedTypes, setSelectedTypes] = useState<string[]>([]);
  const [selectedRarities, setSelectedRarities] = useState<string[]>([]);

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

  return (
    <main className={styles.main}>
      <div className={styles.section}>
        <h1 className={styles.title}>ValueFilterPanel</h1>
        <p className={styles.desc}>Faceted value filter panel with checkboxes, buttons, and toggles</p>
        <p className={styles.note}>
          Note: These demos show the UI patterns. The actual ValueFilterPanel component
          requires SearchProvider context and integrates with search state.
        </p>
      </div>

      <div className={styles.grid}>
        <div className={styles.demo}>
          <h2 className={styles.heading}>Checkbox List</h2>
          <FilterPanelBase title="Pokemon Type">
            <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
              {pokemonTypes.map(({ key, value }) => (
                <li key={key} style={{ marginBottom: '0.5rem' }}>
                  <Checkbox
                    label={key}
                    score={value.toString()}
                    checked={selectedTypes.includes(key)}
                    onChange={() => toggleType(key)}
                  />
                </li>
              ))}
            </ul>
          </FilterPanelBase>
          <pre className={styles.state}>
            Active: {JSON.stringify(selectedTypes, null, 2)}
          </pre>
        </div>

        <div className={styles.demo}>
          <h2 className={styles.heading}>Button Grid</h2>
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
          <pre className={styles.state}>
            Active: {JSON.stringify(selectedRarities, null, 2)}
          </pre>
        </div>

        <div className={styles.demo}>
          <h2 className={styles.heading}>With Show More</h2>
          <FilterPanelBase title="Pokemon Type">
            <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
              {pokemonTypes.slice(0, 3).map(({ key, value }) => (
                <li key={key} style={{ marginBottom: '0.5rem' }}>
                  <Checkbox
                    label={key}
                    score={value.toString()}
                    checked={selectedTypes.includes(key)}
                    onChange={() => toggleType(key)}
                  />
                </li>
              ))}
              <li style={{ marginTop: '0.5rem' }}>
                <Button variant="ghost" size="micro">
                  Show 3 more
                </Button>
              </li>
            </ul>
          </FilterPanelBase>
        </div>

        <div className={styles.demo}>
          <h2 className={styles.heading}>Without Counts</h2>
          <FilterPanelBase title="Rarity">
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '0.5rem' }}>
              {rarities.map(({ key }) => (
                <Button
                  key={key}
                  variant={selectedRarities.includes(key) ? 'primary' : 'secondary'}
                  onClick={() => toggleRarity(key)}
                  size="micro"
                >
                  {key}
                </Button>
              ))}
            </div>
          </FilterPanelBase>
        </div>

        <div className={styles.demo}>
          <h2 className={styles.heading}>Collapsible</h2>
          <FilterPanelBase title="Rarity (Collapsed)" collapsible={true} collapsed={true}>
            <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
              {rarities.map(({ key, value }) => (
                <li key={key} style={{ marginBottom: '0.5rem' }}>
                  <Checkbox
                    label={key}
                    score={value.toString()}
                    checked={selectedRarities.includes(key)}
                    onChange={() => toggleRarity(key)}
                  />
                </li>
              ))}
            </ul>
          </FilterPanelBase>
        </div>
      </div>
    </main>
  );
}
