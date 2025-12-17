
import { Checkbox } from '@indxsearch/systm';
import styles from './page.module.css';

export default function CheckboxPage() {
  return (
    <main className={styles.main}>
      <div className={styles.section}>
        <h1 className={styles.title}>Checkbox</h1>
        <p className={styles.desc}>Checkbox input component with label and score support</p>
      </div>

      <div className={styles.section}>
        <h2 className={styles.heading}>Basic</h2>
        <div className={styles.column}>
          <Checkbox label="Unchecked" />
          <Checkbox label="Checked" defaultChecked />
        </div>
      </div>

      <div className={styles.section}>
        <h2 className={styles.heading}>With Score</h2>
        <div className={styles.column}>
          <Checkbox label="Option 1" score="120" />
          <Checkbox label="Option 2" score="45" defaultChecked />
          <Checkbox label="Option 3" score="8" />
        </div>
      </div>

      <div className={styles.section}>
        <h2 className={styles.heading}>Disabled State</h2>
        <div className={styles.column}>
          <Checkbox label="Disabled" disabled />
          <Checkbox label="Disabled Checked" disabled defaultChecked />
        </div>
      </div>

      <div className={styles.section}>
        <h2 className={styles.heading}>Without Label</h2>
        <div className={styles.column}>
          <Checkbox aria-label="Unchecked checkbox" />
          <Checkbox aria-label="Checked checkbox" defaultChecked />
        </div>
      </div>
    </main>
  );
}
