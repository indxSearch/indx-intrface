
import { FilterPanelBase, Checkbox } from '@indxsearch/systm';
import styles from './page.module.css';

export default function FilterPanelBasePage() {
  return (
    <main className={styles.main}>
      <div className={styles.section}>
        <h1 className={styles.title}>FilterPanelBase</h1>
        <p className={styles.desc}>Collapsible filter panel container with header and content area</p>
      </div>

      <div className={styles.section}>
        <h2 className={styles.heading}>Basic Panel</h2>
        <div className={styles.panelWrapper}>
          <FilterPanelBase title="Filter Options">
            <div className={styles.panelContent}>
              <p>This is the content inside the filter panel.</p>
              <p>It can contain any React children.</p>
            </div>
          </FilterPanelBase>
        </div>
      </div>

      <div className={styles.section}>
        <h2 className={styles.heading}>With Checkboxes</h2>
        <div className={styles.panelWrapper}>
          <FilterPanelBase title="Categories">
            <div className={styles.checkboxList}>
              <Checkbox label="Electronics" score="145" />
              <Checkbox label="Clothing" score="89" />
              <Checkbox label="Home & Garden" score="67" />
              <Checkbox label="Sports" score="34" />
            </div>
          </FilterPanelBase>
        </div>
      </div>

      <div className={styles.section}>
        <h2 className={styles.heading}>Initially Collapsed</h2>
        <div className={styles.panelWrapper}>
          <FilterPanelBase title="Advanced Filters" collapsed>
            <div className={styles.panelContent}>
              <p>This panel starts collapsed. Click the header to expand.</p>
            </div>
          </FilterPanelBase>
        </div>
      </div>

      <div className={styles.section}>
        <h2 className={styles.heading}>Non-Collapsible</h2>
        <div className={styles.panelWrapper}>
          <FilterPanelBase title="Required Filters" collapsible={false}>
            <div className={styles.panelContent}>
              <p>This panel cannot be collapsed.</p>
            </div>
          </FilterPanelBase>
        </div>
      </div>

      <div className={styles.section}>
        <h2 className={styles.heading}>Without Title</h2>
        <div className={styles.panelWrapper}>
          <FilterPanelBase>
            <div className={styles.panelContent}>
              <p>This panel has no title header.</p>
            </div>
          </FilterPanelBase>
        </div>
      </div>

      <div className={styles.section}>
        <h2 className={styles.heading}>Multiple Panels</h2>
        <div className={styles.panelStack}>
          <FilterPanelBase title="Brand">
            <div className={styles.checkboxList}>
              <Checkbox label="Apple" score="89" defaultChecked />
              <Checkbox label="Samsung" score="67" />
              <Checkbox label="Sony" score="45" />
            </div>
          </FilterPanelBase>

          <FilterPanelBase title="Color">
            <div className={styles.checkboxList}>
              <Checkbox label="Black" score="120" />
              <Checkbox label="White" score="98" />
              <Checkbox label="Blue" score="76" />
            </div>
          </FilterPanelBase>

          <FilterPanelBase title="Size">
            <div className={styles.checkboxList}>
              <Checkbox label="Small" score="45" />
              <Checkbox label="Medium" score="78" />
              <Checkbox label="Large" score="56" />
            </div>
          </FilterPanelBase>
        </div>
      </div>
    </main>
  );
}
