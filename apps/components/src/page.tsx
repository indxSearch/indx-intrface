import { Link } from 'react-router-dom';
import styles from './page.module.css';

export default function Home() {
  const systmComponents = [
    { name: 'Button', path: '/button', desc: 'Customizable button with variants' },
    { name: 'Checkbox', path: '/checkbox', desc: 'Checkbox input component' },
    { name: 'InputField', path: '/input-field', desc: 'Text input field' },
    { name: 'RadioButton', path: '/radio-button', desc: 'Radio button input' },
    { name: 'SearchField', path: '/search-field', desc: 'Search input with icon' },
    { name: 'Select', path: '/select', desc: 'Radix UI select dropdown' },
    { name: 'Slider', path: '/slider', desc: 'Range slider component' },
    { name: 'ToggleSwitch', path: '/toggle-switch', desc: 'Toggle switch input' },
    { name: 'Popover', path: '/popover', desc: 'Radix UI popover component' },
    { name: 'Table', path: '/table', desc: 'Composable table component system' },
    { name: 'Base', path: '/base', desc: 'Base container component' },
    { name: 'FilterPanelBase', path: '/filter-panel-base', desc: 'Filter panel container' },
  ]

  const intrfaceComponents = [
    { name: 'SearchInput', path: '/search-input', desc: 'Search input with query state' },
    { name: 'ValueFilterPanel', path: '/value-filter-panel', desc: 'Faceted value filter panel' },
    { name: 'RangeFilterPanel', path: '/range-filter-panel', desc: 'Numeric range filter slider' },
    { name: 'SortByPanel', path: '/sort-by-panel', desc: 'Sort options panel' },
    { name: 'ActiveFiltersPanel', path: '/active-filters-panel', desc: 'Active filter chips' },
  ]

  return (
    <main className={styles.main}>
      <div className={styles.hero}>
        <h1 className={styles.title}>Component Library</h1>
        <p className={styles.subtitle}>
          Browse and test components from @indxsearch/systm and @indxsearch/intrface
        </p>
      </div>

      <div style={{ marginBottom: '2rem' }}>
        <h2 className={styles.sectionTitle}>Pixl Icons</h2>
        <p className={styles.sectionDesc}>Icon library with 212 icons</p>
      </div>

      <div className={styles.grid}>
        <Link to="/icons" className={styles.card}>
          <h3 className={styles.cardTitle}>Icon Gallery</h3>
          <p className={styles.cardDesc}>Browse all available icons with size preview</p>
        </Link>
      </div>

      <div style={{ marginTop: '4rem', marginBottom: '2rem' }}>
        <h2 className={styles.sectionTitle}>Systm Components</h2>
        <p className={styles.sectionDesc}>Base UI components for building interfaces</p>
      </div>

      <div className={styles.grid}>
        {systmComponents.map((component) => (
          <Link
            key={component.path}
            to={component.path}
            className={styles.card}
          >
            <h3 className={styles.cardTitle}>{component.name}</h3>
            <p className={styles.cardDesc}>{component.desc}</p>
          </Link>
        ))}
      </div>

      <div style={{ marginTop: '4rem', marginBottom: '2rem' }}>
        <h2 className={styles.sectionTitle}>Intrface Components</h2>
        <p className={styles.sectionDesc}>Search interface components with context integration</p>
      </div>

      <div className={styles.grid}>
        {intrfaceComponents.map((component) => (
          <Link
            key={component.path}
            to={component.path}
            className={styles.card}
          >
            <h3 className={styles.cardTitle}>{component.name}</h3>
            <p className={styles.cardDesc}>{component.desc}</p>
          </Link>
        ))}
      </div>
    </main>
  )
}
