import styles from './FilterPanelBase.module.css';
import { ReactNode } from 'react';

type Props = {
  children: ReactNode;
  className?: string;
  activeFilter?: boolean
};

export function FilterPanelBase({ children, activeFilter, className }: Props) {
  return (
    <div className={`${styles.container} ${activeFilter ? styles.activeFilter : ''} ${className || ''}`}>
      {children}
    </div>
  );
}
