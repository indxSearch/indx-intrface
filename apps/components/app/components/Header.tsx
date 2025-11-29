'use client';

import Link from 'next/link';
import { useTheme } from '../ThemeProvider';
import { Button } from '@indxsearch/systm';

export function Header() {
  const { theme, toggleTheme } = useTheme();

  return (
    <header style={{ padding: '1rem 2rem', borderBottom: '1px solid var(--lv4)' }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Link href="/" style={{ textDecoration: 'none', color: 'inherit' }}>
          <h2 style={{ font: 'var(--text-xl)' }}>INDX Systm</h2>
        </Link>

        <Button
          size="default"
          variant="secondary"
          onClick={toggleTheme}
        >
          {theme === 'light' ? 'Dark' : 'Light'}
        </Button>
      </div>
    </header>
  );
}
