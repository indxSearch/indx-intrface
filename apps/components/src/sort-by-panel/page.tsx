
import { useState } from 'react';
import { RadioButton, FilterPanelBase, Select } from '@indxsearch/systm';
import styles from './page.module.css';

const sortOptions = [
  { label: 'name (asc)', value: 'name:asc' },
  { label: 'name (desc)', value: 'name:desc' },
  { label: 'hp (asc)', value: 'hp:asc' },
  { label: 'hp (desc)', value: 'hp:desc' },
  { label: 'attack (asc)', value: 'attack:asc' },
  { label: 'attack (desc)', value: 'attack:desc' },
];

export default function SortByPanelPage() {
  const [dropdownSort, setDropdownSort] = useState('');
  const [radioSort, setRadioSort] = useState('');

  return (
    <main className={styles.main}>
      <div className={styles.section}>
        <h1 className={styles.title}>SortByPanel</h1>
        <p className={styles.desc}>Sort options panel with dropdown or radio buttons</p>
        <p className={styles.note}>
          Note: These demos show the UI patterns. The actual SortByPanel component
          requires SearchProvider context and integrates with search state.
        </p>
      </div>

      <div className={styles.grid}>
        <div className={styles.demo}>
          <h2 className={styles.heading}>Dropdown</h2>
          <FilterPanelBase title="Sort by">
            <Select
              value={dropdownSort}
              onValueChange={setDropdownSort}
              options={sortOptions}
              placeholder="Select sorting..."
            />
          </FilterPanelBase>
          <pre className={styles.state}>
            {dropdownSort || 'No sorting'}
          </pre>
        </div>

        <div className={styles.demo}>
          <h2 className={styles.heading}>Radio Buttons</h2>
          <FilterPanelBase title="Sort by">
            <div className={styles.radioGroup}>
              <RadioButton
                id="sort-none"
                name="sort-by"
                value=""
                label="None"
                checked={radioSort === ''}
                onChange={(e) => setRadioSort(e.target.value)}
              />
              {sortOptions.map((opt) => (
                <RadioButton
                  key={opt.value}
                  id={`sort-${opt.value}`}
                  name="sort-by"
                  value={opt.value}
                  label={opt.label}
                  checked={radioSort === opt.value}
                  onChange={(e) => setRadioSort(e.target.value)}
                />
              ))}
            </div>
          </FilterPanelBase>
          <pre className={styles.state}>
            {radioSort || 'No sorting'}
          </pre>
        </div>

        <div className={styles.demo}>
          <h2 className={styles.heading}>Collapsible</h2>
          <FilterPanelBase title="Sort by" collapsible={true} collapsed={true}>
            <Select
              value={dropdownSort}
              onValueChange={setDropdownSort}
              options={sortOptions}
              placeholder="Select sorting..."
            />
          </FilterPanelBase>
        </div>
      </div>
    </main>
  );
}
