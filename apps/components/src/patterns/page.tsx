import styles from './page.module.css';

export default function PatternsPage() {
  return (
    <main className={styles.main}>
      <div className={styles.section}>
        <h1 className={styles.title}>Patterns</h1>
        <p className={styles.desc}>SVG patterns available as CSS custom properties</p>
      </div>

      <div className={styles.section}>
        <h2 className={styles.heading}>Checkerboard 2x2</h2>
        <p className={styles.variableCode}>--pattern-checkerboard-light / --pattern-checkerboard-dark</p>
        <div className={styles.patternGrid}>
          <div className={styles.patternDemo}>
            <div className={`${styles.patternBox} ${styles.checkerboard}`} />
            <p className={styles.patternLabel}>2px size</p>
          </div>
        </div>
      </div>

      <div className={styles.section}>
        <h2 className={styles.heading}>Checkerboard Spaced (1x1 squares)</h2>
        <p className={styles.desc}>Spaced checkerboard patterns with 1x1 squares and variable spacing</p>
        <div className={styles.patternGrid}>
          <div className={styles.patternDemo}>
            <div className={`${styles.patternBox} ${styles.checkerboardSpaced4}`} />
            <p className={styles.patternLabel}>1px spacing</p>
            <p className={styles.variableCode}>--pattern-checkerboard-spaced-4</p>
          </div>
          <div className={styles.patternDemo}>
            <div className={`${styles.patternBox} ${styles.checkerboardSpaced6}`} />
            <p className={styles.patternLabel}>2px spacing</p>
            <p className={styles.variableCode}>--pattern-checkerboard-spaced-6</p>
          </div>
          <div className={styles.patternDemo}>
            <div className={`${styles.patternBox} ${styles.checkerboardSpaced8}`} />
            <p className={styles.patternLabel}>3px spacing</p>
            <p className={styles.variableCode}>--pattern-checkerboard-spaced-8</p>
          </div>
          <div className={styles.patternDemo}>
            <div className={`${styles.patternBox} ${styles.checkerboardSpaced10}`} />
            <p className={styles.patternLabel}>4px spacing</p>
            <p className={styles.variableCode}>--pattern-checkerboard-spaced-10</p>
          </div>
        </div>
      </div>

      <div className={styles.section}>
        <h2 className={styles.heading}>Grid 6x6</h2>
        <p className={styles.variableCode}>--pattern-grid-6-light / --pattern-grid-6-dark</p>
        <div className={styles.patternGrid}>
          <div className={styles.patternDemo}>
            <div className={`${styles.patternBox} ${styles.grid6}`} />
            <p className={styles.patternLabel}>6px size</p>
          </div>
        </div>
      </div>

      <div className={styles.section}>
        <h2 className={styles.heading}>Grid 12x12</h2>
        <p className={styles.variableCode}>--pattern-grid-12-light / --pattern-grid-12-dark</p>
        <div className={styles.patternGrid}>
          <div className={styles.patternDemo}>
            <div className={`${styles.patternBox} ${styles.grid12}`} />
            <p className={styles.patternLabel}>12px size</p>
          </div>
        </div>
      </div>

      <div className={styles.section}>
        <h2 className={styles.heading}>Grid 24x24</h2>
        <p className={styles.variableCode}>--pattern-grid-24-light / --pattern-grid-24-dark</p>
        <div className={styles.patternGrid}>
          <div className={styles.patternDemo}>
            <div className={`${styles.patternBox} ${styles.grid24}`} />
            <p className={styles.patternLabel}>24px size</p>
          </div>
        </div>
      </div>

      <div className={styles.section}>
        <h2 className={styles.heading}>Usage Example</h2>
        <pre className={styles.codeBlock}>{`.element {
  background-image: var(--pattern-checkerboard-light);
  background-repeat: repeat;
  background-size: 2px 2px;
}

@media (prefers-color-scheme: dark) {
  .element {
    background-image: var(--pattern-checkerboard-dark);
  }
}`}</pre>
      </div>
    </main>
  );
}
