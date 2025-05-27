import React from 'react';
import { useSearchContext } from '../context/SearchContext';
import { SearchField } from '@indxsearch/systm';

export interface SearchInputProps extends React.InputHTMLAttributes<HTMLInputElement> {}

export const SearchInput: React.FC<SearchInputProps> = ({
  className,
  placeholder = 'Search...',
  autoFocus = false,
  ...rest
}) => {
  const { state: { query }, setQuery } = useSearchContext();

  return (
    <SearchField
      type="text"
      value={query}
      onChange={e => setQuery(e.target.value)}
      placeholder={placeholder}
      autoFocus={autoFocus}
      className={className}
      showSearchIcon = {true}
      inputSize = 'large'
      {...rest}
    />
  );
};
