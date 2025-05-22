import React from 'react';

interface SearchState {
    query: string;
    results: any[] | null;
    isLoading: boolean;
    error?: string;
    facets?: any | null;
}
interface SearchContextType {
    state: SearchState;
    setQuery: (query: string) => void;
}
declare const SearchProvider: React.FC<{
    children: React.ReactNode;
    email: string;
    password: string;
    url: string;
    dataset: string;
}>;
declare const useSearchContext: () => SearchContextType;

interface SearchInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
}
declare const SearchInput: React.FC<SearchInputProps>;

interface SearchResultsProps {
    fields?: string[];
    customLabels?: Record<string, string>;
}
declare const SearchResults: React.FC<SearchResultsProps>;

export { SearchInput, SearchProvider, SearchResults, useSearchContext as useSearch };
