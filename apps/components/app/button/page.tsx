'use client';

import { Button } from '@indxsearch/systm';
import styles from './page.module.css';

export default function ButtonPage() {
  return (
    <main className={styles.main}>
      <div className={styles.section}>
        <h1 className={styles.title}>Button</h1>
        <p className={styles.desc}>Customizable button component with multiple variants and sizes</p>
      </div>

      <div className={styles.section}>
        <h2 className={styles.heading}>Variants</h2>
        <div className={styles.row}>
          <Button variant="primary">Primary</Button>
          <Button variant="secondary">Secondary</Button>
          <Button variant="tertiary">Tertiary</Button>
          <Button variant="active">Active</Button>
          <Button variant="ghost">Ghost</Button>
        </div>
      </div>

      <div className={styles.section}>
        <h2 className={styles.heading}>Sizes</h2>
        <div className={styles.row}>
          <Button size="micro">Micro</Button>
          <Button size="default">Default</Button>
          <Button size="large">Large</Button>
        </div>
      </div>

      <div className={styles.section}>
        <h2 className={styles.heading}>Disabled State</h2>
        <div className={styles.row}>
          <Button disabled>Disabled</Button>
          <Button variant="secondary" disabled>Disabled Secondary</Button>
        </div>
      </div>

      <div className={styles.section}>
        <h2 className={styles.heading}>Combined</h2>
        <div className={styles.row}>
          <Button variant="primary" size="micro">Micro Primary</Button>
          <Button variant="secondary" size="large">Large Secondary</Button>
          <Button variant="tertiary">Tertiary Default</Button>
        </div>
      </div>
    </main>
  );
}
