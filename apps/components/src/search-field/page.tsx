
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
          <SearchField id="search-micro" name="search-micro" inputSize="micro" placeholder="Micro search..." />
          <SearchField id="search-default" name="search-default" inputSize="default" placeholder="Default search..." />
        </div>
      </div>

      <div className={styles.section}>
        <h2 className={styles.heading}>With Label</h2>
        <div className={styles.column}>
          <SearchField id="search-labeled" name="search-labeled" label="Search" placeholder="Enter search term..." />
        </div>
      </div>

      <div className={styles.section}>
        <h2 className={styles.heading}>With Focus Border</h2>
        <div className={styles.column}>
          <SearchField id="search-focus-border" name="search-focus-border" placeholder="Focus to see border" showFocusBorder />
        </div>
      </div>

      <div className={styles.section}>
        <h2 className={styles.heading}>Disabled State</h2>
        <div className={styles.column}>
          <SearchField id="search-disabled" name="search-disabled" disabled placeholder="Disabled..." />
        </div>
      </div>
    </main>
  );
}
