import React from 'react';

interface SearchState {
    query: string;
    results: any[] | null;
    isLoading: boolean;
    error?: string;
    facets?: any | null;
    filterableFields?: string[];
    facetableFields?: string[];
    sortableFields?: string[];
    filters: Record<string, string[]>;
    rangeFilters: Record<string, {
        min: number;
        max: number;
    }>;
    facetStats?: Record<string, {
        min: number;
        max: number;
    }>;
    rangeBounds?: Record<string, {
        min: number;
        max: number;
    }>;
}
interface SearchContextType {
    state: SearchState;
    setQuery: (query: string) => void;
    toggleFilter: (field: string, value: string) => void;
    setRangeFilter: (field: string, min: number, max: number) => void;
}
declare const SearchProvider: React.FC<{
    children: React.ReactNode;
    email: string;
    password: string;
    url: string;
    dataset: string;
    allowEmptySearch?: boolean;
    maxResults?: number;
}>;
declare const useSearchContext: () => SearchContextType;

interface SearchInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
    onKeyDown?: React.KeyboardEventHandler<HTMLInputElement>;
}
declare const SearchInput: React.FC<SearchInputProps>;

interface SearchResultsProps {
    fields?: string[];
    customLabels?: Record<string, string>;
}
declare const SearchResults: React.FC<SearchResultsProps>;

interface RangeFilterPanelProps {
    field: string;
    label?: string;
    displayType?: 'slider' | 'input';
}
declare const RangeFilterPanel: React.FC<RangeFilterPanelProps>;

interface ValueFilterPanelProps {
    field: string;
    label?: string;
    preserveBlankFacetState?: boolean;
}
declare const ValueFilterPanel: React.FC<ValueFilterPanelProps>;

export { RangeFilterPanel, SearchInput, SearchProvider, SearchResults, ValueFilterPanel, useSearchContext as useSearch };
