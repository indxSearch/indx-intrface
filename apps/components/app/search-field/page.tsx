'use client';

import { SearchField } from '@indxsearch/systm';
import styles from './page.module.css';

export default function SearchFieldPage() {
  return (
    <main className={styles.main}>
      <div className={styles.section}>
        <h1 className={styles.title}>SearchField</h1>
        <p className={styles.desc}>Search input field with icon and multiple size variants</p>
      </div>

      <div className={styles.section}>
        <h2 className={styles.heading}>Sizes</h2>
        <div className={styles.column}>
          <SearchField inputSize="micro" placeholder="Micro search..." />
          <SearchField inputSize="default" placeholder="Default search..." />
          <SearchField inputSize="large" placeholder="Large search..." />
        </div>
      </div>

      <div className={styles.section}>
        <h2 className={styles.heading}>With Label</h2>
        <div className={styles.column}>
          <SearchField label="Search" placeholder="Enter search term..." />
        </div>
      </div>

      <div className={styles.section}>
        <h2 className={styles.heading}>States</h2>
        <div className={styles.column}>
          <SearchField inputState="default" placeholder="Default state" />
          <SearchField inputState="focus" placeholder="Focus state" showFocusBorder />
          <SearchField inputState="filtered" placeholder="Filtered state" defaultValue="query" />
        </div>
      </div>

      <div className={styles.section}>
        <h2 className={styles.heading}>Without Search Icon</h2>
        <div className={styles.column}>
          <SearchField showSearchIcon={false} placeholder="No icon..." />
        </div>
      </div>

      <div className={styles.section}>
        <h2 className={styles.heading}>Error State</h2>
        <div className={styles.column}>
          <SearchField label="Search" error="Search query is too short" defaultValue="ab" />
        </div>
      </div>

      <div className={styles.section}>
        <h2 className={styles.heading}>Disabled State</h2>
        <div className={styles.column}>
          <SearchField disabled placeholder="Disabled..." />
        </div>
      </div>
    </main>
  );
}
