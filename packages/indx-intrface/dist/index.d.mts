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
}>;
declare const useSearchContext: () => SearchContextType;

export { SearchProvider, useSearchContext as useSearch };
