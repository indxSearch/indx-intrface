
import { InputField } from '@indxsearch/systm';
import styles from './page.module.css';

export default function InputFieldPage() {
  return (
    <main className={styles.main}>
      <div className={styles.section}>
        <h1 className={styles.title}>InputField</h1>
        <p className={styles.desc}>Text input field with label, error states, and validation</p>
      </div>

      <div className={styles.section}>
        <h2 className={styles.heading}>Basic</h2>
        <div className={styles.column}>
          <InputField placeholder="Enter text..." />
          <InputField label="With Label" placeholder="Enter text..." />
        </div>
      </div>

      <div className={styles.section}>
        <h2 className={styles.heading}>With Values</h2>
        <div className={styles.column}>
          <InputField label="Username" defaultValue="johndoe" />
          <InputField label="Email" defaultValue="john@example.com" type="email" />
        </div>
      </div>

      <div className={styles.section}>
        <h2 className={styles.heading}>Error State</h2>
        <div className={styles.column}>
          <InputField label="Email" error="Invalid email format" defaultValue="invalid-email" />
          <InputField label="Password" error="Password is required" type="password" />
        </div>
      </div>

      <div className={styles.section}>
        <h2 className={styles.heading}>Invalid State</h2>
        <div className={styles.column}>
          <InputField label="Username" isValid={false} defaultValue="invalid" />
        </div>
      </div>

      <div className={styles.section}>
        <h2 className={styles.heading}>Disabled State</h2>
        <div className={styles.column}>
          <InputField label="Disabled" disabled placeholder="Cannot edit..." />
          <InputField label="Disabled with Value" disabled defaultValue="Read only" />
        </div>
      </div>
    </main>
  );
}
