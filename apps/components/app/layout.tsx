import type { Metadata } from 'next'
import './globals.css'
import '@indxsearch/systm/styles.css'
import '@indxsearch/intrface/styles.css'
import { ThemeProvider } from './ThemeProvider'
import { Header } from './components/Header'

export const metadata: Metadata = {
  title: 'INDX Component Viewer',
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
        <ThemeProvider>
          <Header />
          {children}
        </ThemeProvider>
      </body>
    </html>
  )
}
