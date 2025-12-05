
import { useState } from 'react';
import { Popover, Button } from '@indxsearch/systm';
import styles from './page.module.css';

export default function PopoverPage() {
  const [open1, setOpen1] = useState(false);
  const [open2, setOpen2] = useState(false);

  return (
    <main className={styles.main}>
      <div className={styles.section}>
        <h1 className={styles.title}>Popover</h1>
        <p className={styles.desc}>Radix UI Popover component with custom styling</p>
      </div>

      <div className={styles.section}>
        <h2 className={styles.heading}>Basic</h2>
        <div className={styles.demo}>
          <Popover
            trigger={<Button variant="secondary">Open Popover</Button>}
            open={open1}
            onOpenChange={setOpen1}
          >
            <div className={styles.content}>
              <h3>Popover Title</h3>
              <p>This is some content inside the popover.</p>
              <Button size="micro" onClick={() => setOpen1(false)}>Close</Button>
            </div>
          </Popover>
        </div>
      </div>

      <div className={styles.section}>
        <h2 className={styles.heading}>With Custom Width</h2>
        <div className={styles.demo}>
          <Popover
            trigger={<Button variant="secondary">Open Wide Popover</Button>}
            open={open2}
            onOpenChange={setOpen2}
            className={styles.widePopover}
          >
            <div className={styles.content}>
              <h3>Wide Popover</h3>
              <p>This popover has a custom width applied via className.</p>
              <p>You can put any content here, including forms, lists, or other components.</p>
              <Button size="micro" onClick={() => setOpen2(false)}>Close</Button>
            </div>
          </Popover>
        </div>
      </div>

      <div className={styles.section}>
        <h2 className={styles.heading}>Different Alignments</h2>
        <div className={styles.demoRow}>
          <Popover
            trigger={<Button variant="secondary">Align Start</Button>}
            align="start"
          >
            <div className={styles.content}>
              <p>Aligned to start</p>
            </div>
          </Popover>

          <Popover
            trigger={<Button variant="secondary">Align Center</Button>}
            align="center"
          >
            <div className={styles.content}>
              <p>Aligned to center</p>
            </div>
          </Popover>

          <Popover
            trigger={<Button variant="secondary">Align End</Button>}
            align="end"
          >
            <div className={styles.content}>
              <p>Aligned to end</p>
            </div>
          </Popover>
        </div>
      </div>

      <div className={styles.section}>
        <h2 className={styles.heading}>Different Sides</h2>
        <div className={styles.demoGrid}>
          <Popover
            trigger={<Button variant="secondary">Top</Button>}
            side="top"
          >
            <div className={styles.content}>
              <p>Opens on top</p>
            </div>
          </Popover>

          <Popover
            trigger={<Button variant="secondary">Right</Button>}
            side="right"
          >
            <div className={styles.content}>
              <p>Opens on right</p>
            </div>
          </Popover>

          <Popover
            trigger={<Button variant="secondary">Bottom</Button>}
            side="bottom"
          >
            <div className={styles.content}>
              <p>Opens on bottom</p>
            </div>
          </Popover>

          <Popover
            trigger={<Button variant="secondary">Left</Button>}
            side="left"
          >
            <div className={styles.content}>
              <p>Opens on left</p>
            </div>
          </Popover>
        </div>
      </div>
    </main>
  );
}
