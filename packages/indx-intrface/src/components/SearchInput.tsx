import React from 'react';
import { useSearchContext } from '../context/SearchContext';

export interface SearchInputProps extends React.InputHTMLAttributes<HTMLInputElement> {}

export const SearchInput: React.FC<SearchInputProps> = ({
  className,
  placeholder = 'Search...',
  autoFocus = false,
  onKeyDown,
  ...rest
}) => {
  const { state: { query }, setQuery } = useSearchContext();

  return (
    <input
      type="text"
      value={query}
      onChange={e => setQuery(e.target.value)}
      placeholder={placeholder}
      autoFocus={autoFocus}
      onKeyDown={onKeyDown}
      className={className}
      {...rest}
    />
  );
};