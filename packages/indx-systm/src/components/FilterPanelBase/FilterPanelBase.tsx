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
  const titleId = React.useId();

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
        collapsible ? (
          <button
            type="button"
            className={styles.header}
            onClick={handleToggle}
            aria-label={`${title}: ${expanded ? 'Collapse panel' : 'Expand panel'}`}
            aria-expanded={expanded}
            aria-controls={titleId}
          >
            <div className={styles.title}>
              {title}
            </div>
            <span aria-hidden="true">
              {expanded
                ? <Minus color="var(--lv5)" size={14} />
                : <Plus  color="var(--lv5)" size={14} />
              }
            </span>
          </button>
        ) : (
          <div className={styles.header}>
            <div className={styles.title}>
              {title}
            </div>
          </div>
        )
      )}

      {(!collapsible || expanded) && (
        <div id={titleId} className={styles.body} role="region" aria-label={title || 'Filter panel content'}>
          {children}
        </div>
      )}
    </div>
  );
}
