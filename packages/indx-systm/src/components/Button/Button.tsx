import React from 'react';
import styles from './Button.module.css';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode;
}

export const Button = ({ children, className = '', ...props }: ButtonProps) => {
  return (
    <button className={`${styles.button} ${className}`} {...props}>
      {children}
    </button>
  );
};
