import React from 'react';
import { useSearchContext } from '../context/SearchContext';
import { SearchField, Button } from '@indxsearch/systm';
import type { InputSize } from '@indxsearch/systm';

export interface SearchInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  inputSize?: InputSize; // Optional prop with valid values
  showClear?: boolean;
  showFocus?: boolean;
}

export const SearchInput: React.FC<SearchInputProps> = ({ 
  className,
  placeholder = 'Type to search',
  autoFocus = false,
  inputSize = 'default',
  showClear = true,
  showFocus = false,
  ...rest
}) => {
  const { state: { query, filters, rangeFilters }, setQuery } = useSearchContext();
  const hasFilters = Object.keys(filters).length > 0 || Object.keys(rangeFilters).length > 0;
  const hasValue = query.length > 0;
  
  return (
    <SearchField
      type="text"
      value={query}
      onChange={e => setQuery(e.target.value)}
      placeholder={placeholder}
      autoFocus={autoFocus}
      className={className}
      showSearchIcon={true}
      inputSize={inputSize}
      showFocusBorder={showFocus}
      inputState={hasFilters ? 'filtered' : 'default'}
      {...rest}
    >
      {showClear && hasValue && (
        <Button
          variant="ghost"
          size="micro"
          onClick={() => setQuery('')}
        >
          Clear
        </Button>
      )}
    </SearchField>
  );
};
