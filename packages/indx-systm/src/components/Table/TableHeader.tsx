import React from 'react'
import styles from './Table.module.css'

interface TableHeaderProps {
  children: React.ReactNode
}

export function TableHeader({ children }: TableHeaderProps) {
  // Convert children to th elements with proper scope
  const headerCells = React.Children.map(children, (child) => {
    if (React.isValidElement(child) && child.type === 'td') {
      // If it's a td, convert to th with scope
      return <th scope="col" {...(child.props as React.HTMLAttributes<HTMLTableCellElement>)} />;
    }
    // If it's already a th or another element, render as-is
    return child;
  });

  return (
    <thead>
      <tr className={styles.headerRow}>
        {headerCells}
      </tr>
    </thead>
  )
}
