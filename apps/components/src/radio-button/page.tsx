
import { RadioButton } from '@indxsearch/systm';
import { useState } from 'react';
import styles from './page.module.css';

export default function RadioButtonPage() {
  const [selected, setSelected] = useState('option1');
  const [selectedSize, setSelectedSize] = useState('medium');

  return (
    <main className={styles.main}>
      <div className={styles.section}>
        <h1 className={styles.title}>RadioButton</h1>
        <p className={styles.desc}>Radio button input for selecting a single option from a group</p>
      </div>

      <div className={styles.section}>
        <h2 className={styles.heading}>Basic Group</h2>
        <div className={styles.column}>
          <RadioButton
            id="radio1"
            name="basic"
            value="option1"
            label="Option 1"
            checked={selected === 'option1'}
            onChange={(e) => setSelected(e.target.value)}
          />
          <RadioButton
            id="radio2"
            name="basic"
            value="option2"
            label="Option 2"
            checked={selected === 'option2'}
            onChange={(e) => setSelected(e.target.value)}
          />
          <RadioButton
            id="radio3"
            name="basic"
            value="option3"
            label="Option 3"
            checked={selected === 'option3'}
            onChange={(e) => setSelected(e.target.value)}
          />
        </div>
      </div>

      <div className={styles.section}>
        <h2 className={styles.heading}>Size Selection</h2>
        <div className={styles.column}>
          <RadioButton
            id="size-small"
            name="size"
            value="small"
            label="Small"
            checked={selectedSize === 'small'}
            onChange={(e) => setSelectedSize(e.target.value)}
          />
          <RadioButton
            id="size-medium"
            name="size"
            value="medium"
            label="Medium"
            checked={selectedSize === 'medium'}
            onChange={(e) => setSelectedSize(e.target.value)}
          />
          <RadioButton
            id="size-large"
            name="size"
            value="large"
            label="Large"
            checked={selectedSize === 'large'}
            onChange={(e) => setSelectedSize(e.target.value)}
          />
        </div>
      </div>

      <div className={styles.section}>
        <h2 className={styles.heading}>Disabled State</h2>
        <div className={styles.column}>
          <RadioButton
            id="disabled1"
            name="disabled"
            value="disabled1"
            label="Disabled Unchecked"
            checked={false}
            onChange={() => {}}
            disabled
          />
          <RadioButton
            id="disabled2"
            name="disabled"
            value="disabled2"
            label="Disabled Checked"
            checked={true}
            onChange={() => {}}
            disabled
          />
        </div>
      </div>
    </main>
  );
}
