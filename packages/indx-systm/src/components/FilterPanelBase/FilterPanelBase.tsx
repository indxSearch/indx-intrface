import styles from './FilterPanelBase.module.css';
import { ReactNode } from 'react';

type Props = {
  children: ReactNode;
  className?: string;
};

export function FilterPanelBase({ children, className }: Props) {
  return (
    <div className={`${styles.container} ${className || ''}`}>
      {children}
    </div>
  );
}
