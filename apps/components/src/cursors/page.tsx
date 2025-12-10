import styles from './page.module.css';

export default function CursorsPage() {
  return (
    <div className={styles.container}>
      <h1>Custom Cursors</h1>
      <p>Hover over the elements below to see the custom cursors in action.</p>

      <section className={styles.section}>
        <h2>Arrow (Default)</h2>
        <div className={styles.demo}>
          <div className={styles.box}>
            <p>Hover over this box to see the default arrow cursor.</p>
          </div>
        </div>
      </section>

      <section className={styles.section}>
        <h2>Text / I-beam</h2>
        <div className={styles.demo}>
          <div className={styles.box}>
            <p>This is a paragraph with selectable text. Hover to see the I-beam cursor.</p>
            <input type="text" placeholder="Text input with I-beam cursor" />
            <textarea placeholder="Textarea with I-beam cursor" rows={3}></textarea>
          </div>
        </div>
      </section>

      <section className={styles.section}>
        <h2>Pointer (Hand)</h2>
        <div className={styles.demo}>
          <div className={styles.box}>
            <button>Button with pointer cursor</button>
            <a href="#" onClick={(e) => e.preventDefault()}>Link with pointer cursor</a>
            <div className="cursor-pointer" style={{ padding: '10px', border: '1px solid var(--lv3)', borderRadius: 'var(--radius)', marginTop: '10px' }}>
              Custom element with .cursor-pointer class
            </div>
          </div>
        </div>
      </section>

      <section className={styles.section}>
        <h2>Resize (Column)</h2>
        <div className={styles.demo}>
          <div className={styles.box}>
            <div className="cursor-resize-col" style={{ padding: '20px', border: '2px dashed var(--lv3)', borderRadius: 'var(--radius)', textAlign: 'center' }}>
              Hover here to see the column resize cursor
            </div>
            <p style={{ marginTop: '10px', fontSize: '14px', color: 'var(--lv6)' }}>
              This cursor is used on slider handles and table column dividers
            </p>
          </div>
        </div>
      </section>

      <section className={styles.section}>
        <h2>Resize (Horizontal & Vertical)</h2>
        <div className={styles.demo}>
          <div className={styles.box}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
              <div className="cursor-resize-ew" style={{ padding: '20px', border: '2px dashed var(--lv3)', borderRadius: 'var(--radius)', textAlign: 'center' }}>
                EW resize (↔)
              </div>
              <div className="cursor-resize-ns" style={{ padding: '20px', border: '2px dashed var(--lv3)', borderRadius: 'var(--radius)', textAlign: 'center' }}>
                NS resize (↕)
              </div>
            </div>
            <p style={{ marginTop: '10px', fontSize: '14px', color: 'var(--lv6)' }}>
              General purpose horizontal and vertical resize cursors
            </p>
          </div>
        </div>
      </section>

      <section className={styles.section}>
        <h2>Resize (Diagonal)</h2>
        <div className={styles.demo}>
          <div className={styles.box}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
              <div className="cursor-resize-nwse" style={{ padding: '20px', border: '2px dashed var(--lv3)', borderRadius: 'var(--radius)', textAlign: 'center' }}>
                NW-SE resize (↖↘)
              </div>
              <div className="cursor-resize-nesw" style={{ padding: '20px', border: '2px dashed var(--lv3)', borderRadius: 'var(--radius)', textAlign: 'center' }}>
                NE-SW resize (↗↙)
              </div>
            </div>
            <p style={{ marginTop: '10px', fontSize: '14px', color: 'var(--lv6)' }}>
              These cursors are used for corner resize handles
            </p>
          </div>
        </div>
      </section>

      <section className={styles.section}>
        <h2>Move</h2>
        <div className={styles.demo}>
          <div className={styles.box}>
            <div className="cursor-move" style={{ padding: '20px', border: '2px solid var(--lv3)', borderRadius: 'var(--radius)', textAlign: 'center' }}>
              Hover here to see the move cursor
            </div>
            <p style={{ marginTop: '10px', fontSize: '14px', color: 'var(--lv6)' }}>
              This cursor indicates draggable elements
            </p>
          </div>
        </div>
      </section>

      <section className={styles.section}>
        <h2>Crosshair</h2>
        <div className={styles.demo}>
          <div className={styles.box}>
            <div className="cursor-crosshair" style={{ padding: '20px', border: '2px solid var(--lv3)', borderRadius: 'var(--radius)', textAlign: 'center' }}>
              Hover here to see the crosshair cursor
            </div>
            <p style={{ marginTop: '10px', fontSize: '14px', color: 'var(--lv6)' }}>
              This cursor is used for precise selection
            </p>
          </div>
        </div>
      </section>

      <section className={styles.section}>
        <h2>Help</h2>
        <div className={styles.demo}>
          <div className={styles.box}>
            <div className="cursor-help" style={{ padding: '20px', border: '2px solid var(--lv3)', borderRadius: 'var(--radius)', textAlign: 'center' }}>
              Hover here to see the help cursor
            </div>
            <p style={{ marginTop: '10px', fontSize: '14px', color: 'var(--lv6)' }}>
              This cursor indicates help or info is available
            </p>
          </div>
        </div>
      </section>

      <section className={styles.section}>
        <h2>Wait</h2>
        <div className={styles.demo}>
          <div className={styles.box}>
            <div className="cursor-wait" style={{ padding: '20px', border: '2px solid var(--lv3)', borderRadius: 'var(--radius)', textAlign: 'center' }}>
              Hover here to see the wait cursor
            </div>
            <p style={{ marginTop: '10px', fontSize: '14px', color: 'var(--lv6)' }}>
              This cursor indicates a loading or processing state
            </p>
          </div>
        </div>
      </section>

      <section className={styles.section}>
        <h2>Not Allowed (Disabled)</h2>
        <div className={styles.demo}>
          <div className={styles.box}>
            <button disabled>Disabled button</button>
            <input type="text" placeholder="Disabled input" disabled />
            <div className="cursor-not-allowed" style={{ padding: '10px', border: '1px solid var(--lv3)', borderRadius: 'var(--radius)', marginTop: '10px', opacity: 0.5 }}>
              Custom element with .cursor-not-allowed class
            </div>
          </div>
        </div>
      </section>

      <section className={styles.section}>
        <h2>Dark Mode</h2>
        <div className={styles.demo}>
          <div className={styles.box}>
            <p>Toggle your system dark mode to see cursor colors change automatically.</p>
            <p style={{ fontSize: '14px', color: 'var(--lv6)', marginTop: '10px' }}>
              Light mode cursors use dark fills, dark mode cursors use light fills.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
