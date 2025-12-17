
import { ToggleSwitch } from '@indxsearch/systm';
import { useState } from 'react';
import styles from './page.module.css';

export default function ToggleSwitchPage() {
  const [toggle1, setToggle1] = useState(false);
  const [toggle2, setToggle2] = useState(true);
  const [toggle3, setToggle3] = useState(false);

  return (
    <main className={styles.main}>
      <div className={styles.section}>
        <h1 className={styles.title}>ToggleSwitch</h1>
        <p className={styles.desc}>Toggle switch input for binary on/off states</p>
      </div>

      <div className={styles.section}>
        <h2 className={styles.heading}>Basic</h2>
        <div className={styles.column}>
          <ToggleSwitch
            aria-label="Toggle option 1"
            checked={toggle1}
            onChange={setToggle1}
          />
          <ToggleSwitch
            aria-label="Toggle option 2"
            checked={toggle2}
            onChange={setToggle2}
          />
        </div>
      </div>

      <div className={styles.section}>
        <h2 className={styles.heading}>With Labels</h2>
        <div className={styles.column}>
          <ToggleSwitch
            label="Enable notifications"
            checked={toggle1}
            onChange={setToggle1}
          />
          <ToggleSwitch
            label="Dark mode"
            checked={toggle2}
            onChange={setToggle2}
          />
          <ToggleSwitch
            label="Auto-save"
            checked={toggle3}
            onChange={setToggle3}
          />
        </div>
      </div>

      <div className={styles.section}>
        <h2 className={styles.heading}>Disabled State</h2>
        <div className={styles.column}>
          <ToggleSwitch
            label="Disabled Off"
            checked={false}
            onChange={() => {}}
            disabled
          />
          <ToggleSwitch
            label="Disabled On"
            checked={true}
            onChange={() => {}}
            disabled
          />
        </div>
      </div>
    </main>
  );
}
