import type { Metadata } from 'next'
import Link from 'next/link'
import './globals.css'
import '@indxsearch/systm/styles.css'
import '@indxsearch/intrface/styles.css'

export const metadata: Metadata = {
  title: 'Indx Component Viewer',
  description: 'Component library viewer for @indxsearch/systm and @indxsearch/intrface',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>
        <header style={{ padding: '1rem 2rem', borderBottom: '1px solid var(--lv3)' }}>
          <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
            <Link href="/" style={{ textDecoration: 'none', color: 'inherit', font: 'var(--text-xl)' }}>
              indx-intrface
            </Link>
          </div>
        </header>
        {children}
      </body>
    </html>
  )
}
