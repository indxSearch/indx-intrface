
import { useState } from 'react';
import { SearchField } from '@indxsearch/systm';
import styles from './page.module.css';

export default function SearchInputPage() {
  const [query, setQuery] = useState('pikachu');
  const [query2, setQuery2] = useState('');
  const [query3, setQuery3] = useState('charizard');

  return (
    <main className={styles.main}>
      <div className={styles.section}>
        <h1 className={styles.title}>SearchInput</h1>
        <p className={styles.desc}>Search input component - demonstrated with SearchField from systm</p>
        <p className={styles.note}>
          Note: The actual SearchInput from intrface requires SearchProvider context.
          This demo uses SearchField to show the same UI pattern.
        </p>
      </div>

      <div className={styles.section}>
        <h2 className={styles.heading}>Default</h2>
        <div className={styles.demo}>
          <SearchField
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search..."
          />
          <p className={styles.info}>Current query: "{query}"</p>
        </div>
      </div>

      <div className={styles.section}>
        <h2 className={styles.heading}>Empty State</h2>
        <div className={styles.demo}>
          <SearchField
            value={query2}
            onChange={(e) => setQuery2(e.target.value)}
            placeholder="Start typing to search..."
          />
          <p className={styles.info}>Current query: "{query2}"</p>
        </div>
      </div>

      <div className={styles.section}>
        <h2 className={styles.heading}>With Different Value</h2>
        <div className={styles.demo}>
          <SearchField
            value={query3}
            onChange={(e) => setQuery3(e.target.value)}
            placeholder="Search Pokemon..."
          />
          <p className={styles.info}>Current query: "{query3}"</p>
        </div>
      </div>
    </main>
  );
}
