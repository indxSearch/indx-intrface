import styles from './FilterPanelBase.module.css';
import { ReactNode } from 'react';

type Props = {
  title?: string;
  children: ReactNode;
  className?: string;
  activeFilter?: boolean;
};

export function FilterPanelBase({
  title,
  children,
  activeFilter = false,
  className = '',
}: Props) {
  return (
    <div
      className={[
        styles.container,
        activeFilter ? styles.activeFilter : '',
        className,
      ]
        .filter(Boolean)
        .join(' ')}
    >
      {title && <h3 className={styles.title}>{title}</h3>}
      {children}
    </div>
  );
}
