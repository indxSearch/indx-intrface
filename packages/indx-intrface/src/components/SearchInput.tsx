import React from 'react';
import { useSearchContext } from '../context/SearchContext';
import { SearchField } from '@indxsearch/systm';
import type { InputSize } from '@indxsearch/systm';

export interface SearchInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  inputSize?: InputSize; // Optional prop with valid values
}

export const SearchInput: React.FC<SearchInputProps> = ({ 
  className,
  placeholder = 'Type to search',
  autoFocus = false,
  inputSize = 'default',
  ...rest
}) => {
  const { state: { query, filters, rangeFilters }, setQuery } = useSearchContext();
  const hasFilters = Object.keys(filters).length > 0 || Object.keys(rangeFilters).length > 0;
  return (
    <SearchField
      type="text"
      value={query}
      onChange={e => setQuery(e.target.value)}
      placeholder={placeholder}
      autoFocus={autoFocus}
      className={className}
      showSearchIcon = {true}
      inputSize = {inputSize}
      inputState={hasFilters ? 'filtered' : 'default'}
      {...rest}
    />
  );
};
