
import { Base } from '@indxsearch/systm';
import styles from './page.module.css';

export default function BasePage() {
  return (
    <main className={styles.main}>
      <div className={styles.section}>
        <h1 className={styles.title}>Base</h1>
        <p className={styles.desc}>Base container component for consistent styling</p>
      </div>

      <div className={styles.section}>
        <h2 className={styles.heading}>Basic Usage</h2>
        <Base>
          <p className={styles.content}>
            This is a Base container component.
            It provides a consistent background and styling for content.
          </p>
        </Base>
      </div>

      <div className={styles.section}>
        <h2 className={styles.heading}>With Rich Content</h2>
        <Base>
          <div className={styles.richContent}>
            <h3>Container Title</h3>
            <p>Base can contain any React children, making it a versatile container component.</p>
            <ul>
              <li>Flexible content support</li>
              <li>Clean, consistent styling</li>
              <li>Responsive design</li>
            </ul>
          </div>
        </Base>
      </div>

      <div className={styles.section}>
        <h2 className={styles.heading}>Multiple Containers</h2>
        <div className={styles.grid}>
          <Base>
            <div className={styles.card}>
              <h4>Card 1</h4>
              <p>Container example</p>
            </div>
          </Base>
          <Base>
            <div className={styles.card}>
              <h4>Card 2</h4>
              <p>Container example</p>
            </div>
          </Base>
          <Base>
            <div className={styles.card}>
              <h4>Card 3</h4>
              <p>Container example</p>
            </div>
          </Base>
        </div>
      </div>
    </main>
  );
}
