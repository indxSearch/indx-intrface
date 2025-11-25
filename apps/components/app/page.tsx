import Link from 'next/link'
import styles from './page.module.css'

export default function Home() {
  const components = [
    { name: 'Button', path: '/button', desc: 'Customizable button with variants' },
    { name: 'Checkbox', path: '/checkbox', desc: 'Checkbox input component' },
    { name: 'InputField', path: '/input-field', desc: 'Text input field' },
    { name: 'RadioButton', path: '/radio-button', desc: 'Radio button input' },
    { name: 'SearchField', path: '/search-field', desc: 'Search input with icon' },
    { name: 'Slider', path: '/slider', desc: 'Range slider component' },
    { name: 'ToggleSwitch', path: '/toggle-switch', desc: 'Toggle switch input' },
    { name: 'Base', path: '/base', desc: 'Base container component' },
    { name: 'FilterPanelBase', path: '/filter-panel-base', desc: 'Filter panel container' },
  ]

  return (
    <main className={styles.main}>
      <div className={styles.hero}>
        <h1 className={styles.title}>Component Library</h1>
        <p className={styles.subtitle}>
          Browse and test all components from @indxsearch/systm
        </p>
      </div>

      <div className={styles.grid}>
        {components.map((component) => (
          <Link
            key={component.path}
            href={component.path}
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
