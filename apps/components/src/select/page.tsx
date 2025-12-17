
import { useState } from 'react';
import { Select } from '@indxsearch/systm';
import styles from './page.module.css';

const fruitOptions = [
  { label: 'Apple', value: 'apple' },
  { label: 'Banana', value: 'banana' },
  { label: 'Orange', value: 'orange' },
  { label: 'Mango', value: 'mango' },
  { label: 'Strawberry', value: 'strawberry' },
];

const sortOptions = [
  { label: 'Name (A-Z)', value: 'name-asc' },
  { label: 'Name (Z-A)', value: 'name-desc' },
  { label: 'Price (Low to High)', value: 'price-asc' },
  { label: 'Price (High to Low)', value: 'price-desc' },
  { label: 'Date (Newest)', value: 'date-desc' },
  { label: 'Date (Oldest)', value: 'date-asc' },
];

export default function SelectPage() {
  const [fruit, setFruit] = useState('apple');
  const [sort, setSort] = useState('name-asc');
  const [controlled, setControlled] = useState('');

  return (
    <main className={styles.main}>
      <div className={styles.section}>
        <h1 className={styles.title}>Select</h1>
        <p className={styles.desc}>Radix UI Select component with custom styling</p>
      </div>

      <div className={styles.section}>
        <h2 className={styles.heading}>Basic</h2>
        <div className={styles.column}>
          <Select
            aria-label="Choose a fruit"
            value={fruit}
            onValueChange={setFruit}
            options={fruitOptions}
            placeholder="Choose a fruit..."
          />
          <div className={styles.info}>Selected: {fruit}</div>
        </div>
      </div>

      <div className={styles.section}>
        <h2 className={styles.heading}>Sort Options</h2>
        <div className={styles.column}>
          <Select
            aria-label="Sort by"
            value={sort}
            onValueChange={setSort}
            options={sortOptions}
            placeholder="Sort by..."
          />
          <div className={styles.info}>Selected: {sort}</div>
        </div>
      </div>

      <div className={styles.section}>
        <h2 className={styles.heading}>With Placeholder</h2>
        <div className={styles.column}>
          <Select
            aria-label="Select an option"
            value={controlled}
            onValueChange={setControlled}
            options={fruitOptions}
            placeholder="Select an option..."
          />
          <div className={styles.info}>
            Selected: {controlled || '(none)'}
          </div>
        </div>
      </div>

      <div className={styles.section}>
        <h2 className={styles.heading}>Disabled State</h2>
        <div className={styles.column}>
          <Select
            aria-label="Disabled select"
            value="banana"
            onValueChange={() => {}}
            options={fruitOptions}
            disabled
          />
        </div>
      </div>

      <div className={styles.section}>
        <h2 className={styles.heading}>Different Widths</h2>
        <div className={styles.column}>
          <Select
            aria-label="Small select"
            value={fruit}
            onValueChange={setFruit}
            options={fruitOptions}
            className={styles.smallSelect}
          />
          <Select
            aria-label="Large select"
            value={sort}
            onValueChange={setSort}
            options={sortOptions}
            className={styles.largeSelect}
          />
        </div>
      </div>
    </main>
  );
}
