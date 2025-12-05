
import { Button } from '@indxsearch/systm';
import { Check, ArrowRight, ArrowLeft, Plus, Search } from '@indxsearch/pixl';
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
          <Button variant="ghost">Ghost</Button>
        </div>
      </div>

      <div className={styles.section}>
        <h2 className={styles.heading}>Sizes</h2>
        <div className={styles.row}>
          <Button size="micro" variant="primary">Micro</Button>
          <Button size="default" variant="primary">Default</Button>
          <Button size="large" variant="primary">Large</Button>
        </div>
      </div>

      <div className={styles.section}>
        <h2 className={styles.heading}>Disabled State</h2>
        <div className={styles.row}>
          <Button variant="primary" disabled>Disabled Primary</Button>
          <Button variant="secondary" disabled>Disabled Secondary</Button>
          <Button variant="ghost" disabled>Disabled Ghost</Button>
        </div>
      </div>

      <div className={styles.section}>
        <h2 className={styles.heading}>All Combinations</h2>
        <div className={styles.row}>
          <Button size="micro" variant="primary">Micro Primary</Button>
          <Button size="default" variant="primary">Default Primary</Button>
          <Button size="large" variant="primary">Large Primary</Button>
        </div>
        <div className={styles.row}>
          <Button size="micro" variant="secondary">Micro Secondary</Button>
          <Button size="default" variant="secondary">Default Secondary</Button>
          <Button size="large" variant="secondary">Large Secondary</Button>
        </div>
        <div className={styles.row}>
          <Button size="micro" variant="ghost">Micro Ghost</Button>
          <Button size="default" variant="ghost">Default Ghost</Button>
          <Button size="large" variant="ghost">Large Ghost</Button>
        </div>
      </div>

      <div className={styles.section}>
        <h2 className={styles.heading}>With Left Icons</h2>
        <div className={styles.row}>
          <Button size="micro" variant="primary" iconLeft={<Search />}>Add</Button>
          <Button size="default" variant="primary" iconLeft={<Search />}>Search</Button>
          <Button size="large" variant="primary" iconLeft={<Check />}>Confirm</Button>
        </div>
        <div className={styles.row}>
          <Button size="micro" variant="secondary" iconLeft={<Plus />}>Add</Button>
          <Button size="default" variant="secondary" iconLeft={<Search />}>Search</Button>
          <Button size="large" variant="secondary" iconLeft={<Check />}>Confirm</Button>
        </div>
      </div>

      <div className={styles.section}>
        <h2 className={styles.heading}>With Right Icons</h2>
        <div className={styles.row}>
          <Button size="micro" variant="primary" iconRight={<ArrowRight />}>Next</Button>
          <Button size="default" variant="primary" iconRight={<ArrowRight />}>Continue</Button>
          <Button size="large" variant="primary" iconRight={<ArrowRight />}>Proceed</Button>
        </div>
        <div className={styles.row}>
          <Button size="micro" variant="ghost" iconRight={<ArrowRight />}>Next</Button>
          <Button size="default" variant="ghost" iconRight={<ArrowRight />}>Continue</Button>
          <Button size="large" variant="ghost" iconRight={<ArrowRight />}>Proceed</Button>
        </div>
      </div>

      <div className={styles.section}>
        <h2 className={styles.heading}>With Both Icons</h2>
        <div className={styles.row}>
          <Button size="micro" variant="primary" iconLeft={<ArrowLeft />} iconRight={<ArrowRight />}>Navigate</Button>
          <Button size="default" variant="secondary" iconLeft={<ArrowLeft />} iconRight={<ArrowRight />}>Navigate</Button>
          <Button size="large" variant="ghost" iconLeft={<ArrowLeft />} iconRight={<ArrowRight />}>Navigate</Button>
        </div>
      </div>
    </main>
  );
}
