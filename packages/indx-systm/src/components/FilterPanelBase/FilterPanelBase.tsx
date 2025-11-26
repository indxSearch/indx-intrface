import React, { useState, useEffect, ReactNode } from 'react';
import styles from './FilterPanelBase.module.css';
import { Plus, Minus } from '@indxsearch/pixl';

type Props = {
  title?: string;
  children: ReactNode;
  className?: string;
  collapsible?: boolean;
  collapsed?: boolean;
};

export function FilterPanelBase({
  title,
  children,
  className = '',
  collapsible = true,
  collapsed = false,
}: Props) {
  const [expanded, setExpanded] = useState(() => !collapsed);

  useEffect(() => {
    if (collapsible) {
      setExpanded(!collapsed);
    }
  }, [collapsed, collapsible]);

  const handleToggle = () => {
    if (collapsible) setExpanded((e) => !e);
  };

  return (
    <div
      className={`${styles.container} ${className}`}
    >
      {title && (
        <div
          className={styles.header}
          onClick={handleToggle}
          aria-label={expanded ? 'Collapse panel' : 'Expand panel'}
          style={{ cursor: collapsible ? 'pointer' : 'default' }}
        >
          <h3 className={styles.title}>
            {title}
          </h3>
          {collapsible && (
            expanded
              ? <Minus color="var(--icon-color)" size={14} />
              : <Plus  color="var(--icon-color)" size={14} />
          )}
        </div>
      )}

      {(!collapsible || expanded) && (
        <div className={styles.body}>
          {children}
        </div>
      )}
    </div>
  );
}
