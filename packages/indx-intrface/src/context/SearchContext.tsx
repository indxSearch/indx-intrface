import React, { createContext, useContext, useState, useCallback, useEffect, useRef } from 'react';
import type { CoverageSetup } from '@indxsearch/indx-types';
import { useIndxAuth } from './useIndxAuth';
import { useSearchExecution } from './useSearchExecution';

// Internal type with all CoverageSetup properties required (SearchContext always provides defaults)
export type RequiredCoverageSetup = Required<CoverageSetup>;

export interface SearchSettings {
  maxNumberOfRecordsToReturn: number;
  coverageDepth: number;
  enableCoverage: boolean;
  removeDuplicates: boolean;
  coverageSetup: RequiredCoverageSetup;
  minimumScore: number;
  showScore: boolean;
  placeholderText: string;
}

export interface SearchResult {
  document: any; // The actual document
  documentKey: number; // The document key
  score: number; // The search score
}

export interface SearchState {
  query: string; // The current search query text entered by the user
  results: SearchResult[] | null; // The array of search results, or null if no search has been performed yet
  isLoading: boolean; // Whether a search is currently in progress
  resultsSuppressed?: boolean; // Whether results should be hidden (e.g. when query is empty and allowEmptySearch is false)
  facetDebounceDelayMillis?: number; // The delay in milliseconds before performing a faceted search after typing stops
  error?: string; // Any error message that occurred during the last search
  facets?: any | null; // The current facet counts and values for each facetable field
  filterableFields: string[]; // List of fields that can be used for filtering
  facetableFields: string[]; // List of fields that can be used for faceting
  sortableFields: string[]; // List of fields that can be used for sorting results
  filters: Record<string, string[]>; // Current active filters, mapping field names to arrays of selected values
  rangeFilters: Record<string, { min: number; max: number }>; // Current active range filters, mapping field names to min/max values
  facetStats?: Record<string, { min: number; max: number }>; // Current facet statistics (min/max values) for numeric fields, updated with each search
  rangeBounds: Record<string, { min: number; max: number }>; // Range bounds for numeric fields, updated when query or auth data changes
  sortBy?: string; // The field currently being used to sort results
  sortAscending?: boolean; // Whether the current sort is ascending (true) or descending (false)
  searchSettings: SearchSettings;
  truncationIndex?: number;
  totalDocumentCount?: number; // Total number of documents in the dataset
}

export interface SearchContextType {
  state: SearchState; // The current search state containing all search-related data
  isFetchingInitial: boolean; // Whether the initial data (fields, facets) is still being loaded
  allowEmptySearch: boolean; // Whether empty searches are allowed
  url: string;
  dataset: string;
  authenticatedFetch: (url: string, options?: RequestInit) => Promise<Response>;
  setQuery: (query: string) => void; // Updates the search query text
  toggleFilter: (field: string, value: string) => void; // Toggles a value filter on/off for a given field
  setRangeFilter: (field: string, min: number, max: number) => void; // Sets min/max values for a range filter
  resetFilters: () => void; // Clears all active filters and range filters
  resetSingleFilter: (field: string, value: string, isUserAction?: boolean) => void; // Removes a specific value from a value filter
  resetRangeFilter: (field: string, isUserAction?: boolean) => void; // Removes a range filter for a field
  setSort: (field: string | null, ascending: boolean) => void; // Sets the sort field and direction
  setDebounceDelay?: (ms: number) => void; // Optional: Updates the debounce delay for faceted searches
  setSearchSettings: (settings: Partial<SearchSettings>) => void;
  fetchMoreResults: (newMax: number) => void; // Fetches more results by increasing maxNumberOfRecordsToReturn
}

// Create the search context
const SearchContext = createContext<SearchContextType | undefined>(undefined);

// SearchProvider component that manages the search state and provides the search context
export const SearchProvider: React.FC<{
  children: React.ReactNode;
  email?: string;
  password?: string;
  url: string;
  dataset: string;
  allowEmptySearch?: boolean;
  maxResults?: number;
  facetDebounceDelayMillis?: number;
  enableFacets?: boolean;
  coverageDepth?: number;
  removeDuplicates?: boolean;
  enableCoverage?: boolean;
  initialCoverageSetup?: Partial<CoverageSetup>;
  enableDebugLogs?: boolean;
  preAuthenticatedToken?: string; // Optional: if provided, skips login and uses this token
}> = ({
  children,
  email,
  password,
  url,
  dataset,
  allowEmptySearch = false,
  maxResults = 10,
  facetDebounceDelayMillis = 500, // debounce faceted searches only
  enableFacets = true,
  coverageDepth = 500,
  removeDuplicates = true,
  enableCoverage = true,
  initialCoverageSetup = {},
  enableDebugLogs = false,
  preAuthenticatedToken,
}) => {
  const filtersChangedByUser = useRef(false);
  const shouldFetchMore = useRef(false);

  const [state, setState] = useState<SearchState>({
    query: '',
    results: null,
    isLoading: false,
    resultsSuppressed: !allowEmptySearch,
    facetDebounceDelayMillis,
    filterableFields: [],
    facetableFields: [],
    sortableFields: [],
    filters: {},
    rangeFilters: {},
    facetStats: {},
    rangeBounds: {},
    searchSettings: {
      maxNumberOfRecordsToReturn: maxResults,
      coverageDepth,
      enableCoverage,
      removeDuplicates,
      minimumScore: 0,
      showScore: true,
      placeholderText: 'Type to search',
      coverageSetup: {
        // Default values matching Swagger specification
        coverWholeQuery: true,
        coverWholeWords: true,
        coverFuzzyWords: true,
        coverJoinedWords: true,
        coverPrefixSuffix: true,
        truncate: true,
        includePatternMatches: true,
        minWordSize: 2,
        levenshteinMaxWordSize: 20,
        truncateWordHitLimit: 1,
        truncateWordHitTolerance: 0,
        truncationScore: 65024,
        ...initialCoverageSetup, // Allow prop-based override
      },
    },
  });

  useEffect(() => {
    if (enableDebugLogs) {
      console.log("SearchContext mounted on client");
    }
  }, [enableDebugLogs]);

  useEffect(() => {
    setState(prev => ({
      ...prev,
      facetDebounceDelayMillis,
    }));
  }, [facetDebounceDelayMillis]);

  const [facetsEnabled] = useState(enableFacets);

  const auth = useIndxAuth({ email, password, url, dataset, preAuthenticatedToken, enableDebugLogs });

  // Authenticated fetch wrapper
  const authenticatedFetch = useCallback((url: string, options: RequestInit = {}) => {
    if (!auth.token) {
      throw new Error('No authentication token available');
    }
    return fetch(url, {
      ...options,
      headers: {
        ...options.headers,
        'Authorization': `Bearer ${auth.token}`,
      },
      credentials: 'include',
    });
  }, [auth.token]);

  useSearchExecution({
    state,
    setState,
    authenticatedFetch,
    auth,
    url,
    dataset,
    allowEmptySearch,
    facetsEnabled,
    enableDebugLogs,
    filtersChangedByUser,
    shouldFetchMore,
  });

  // Function to update the search query text
  const setQuery = useCallback((query: string) => {
    filtersChangedByUser.current = false; // Query change clears filters, not a user filter action
    setState(prev => {
      // Preserve empty filter references to avoid triggering filter effect unnecessarily
      const hasFilters = Object.keys(prev.filters).length > 0;
      const hasRangeFilters = Object.keys(prev.rangeFilters).length > 0;

      return {
        ...prev,
        query,
        filters: hasFilters ? {} : prev.filters,
        rangeFilters: hasRangeFilters ? {} : prev.rangeFilters,
        searchSettings: {
          ...prev.searchSettings,
          maxNumberOfRecordsToReturn: maxResults,
        },
      };
    });
  }, [maxResults]);

  // Function to update the debounce delay for faceted searches
  const setDebounceDelay = useCallback((ms: number) => {
    setState(prev => ({
      ...prev,
      facetDebounceDelayMillis: ms,
    }));
  }, []);

  const setSearchSettings = useCallback((settings: Partial<SearchSettings>) => {
    setState(prev => {
      const newSettings = { ...prev.searchSettings, ...settings };

      // Preserve coverageSetup reference if not explicitly provided
      if (!settings.coverageSetup) {
        newSettings.coverageSetup = prev.searchSettings.coverageSetup;
      } else {
        // Merge with existing when provided
        newSettings.coverageSetup = {
          ...prev.searchSettings.coverageSetup,
          ...settings.coverageSetup,
        };
      }

      return {
        ...prev,
        searchSettings: newSettings,
      };
    });
  }, []);

  const fetchMoreResults = useCallback((newMax: number) => {
    shouldFetchMore.current = true;
    setState(prev => ({
      ...prev,
      searchSettings: {
        ...prev.searchSettings,
        maxNumberOfRecordsToReturn: newMax,
      },
    }));
  }, []);

  // Function to toggle a value filter on/off for a given field
  const toggleFilter = useCallback((field: string, value: string) => {
    filtersChangedByUser.current = true; // User explicitly toggled a filter
    setState(prev => {
      const updatedFilters = { ...prev.filters };
      const currentValues = updatedFilters[field] || [];
      const newValues = currentValues.includes(value)
        ? currentValues.filter(v => v !== value)
        : [...currentValues, value];

      if (newValues.length) {
        updatedFilters[field] = newValues;
      } else {
        delete updatedFilters[field];
      }

      return {
        ...prev,
        filters: updatedFilters,
      };
    });
  }, []);

  // Function to set min/max values for a range filter
  const setRangeFilter = useCallback((field: string, min: number, max: number) => {
    filtersChangedByUser.current = true; // User explicitly set a range filter
    setState(prev => ({
      ...prev,
      rangeFilters: {
        ...prev.rangeFilters,
        [field]: { min, max },
      },
    }));
  }, []);

  // Function to clear all active filters and range filters
  const resetFilters = useCallback(() => {
    filtersChangedByUser.current = true; // User explicitly reset all filters
    setState(prev => ({
      ...prev,
      filters: {},
      rangeFilters: {},
    }));
  }, []);

  const resetSingleFilter = useCallback((field: string, value: string, isUserAction: boolean = true) => {
    if (isUserAction) filtersChangedByUser.current = true;
    setState(prev => {
      const updatedFilters = { ...prev.filters };
      const newValues = (updatedFilters[field] || []).filter(v => v !== value);
      if (newValues.length > 0) {
        updatedFilters[field] = newValues;
      } else {
        delete updatedFilters[field];
      }
      return { ...prev, filters: updatedFilters };
    });
  }, []);

  const resetRangeFilter = useCallback((field: string, isUserAction: boolean = true) => {
    if (isUserAction) filtersChangedByUser.current = true;
    setState(prev => {
      const updatedRangeFilters = { ...prev.rangeFilters };
      delete updatedRangeFilters[field];
      return { ...prev, rangeFilters: updatedRangeFilters };
    });
  }, []);

  // Function to set the sort field and direction
  const setSort = useCallback((field: string | null, ascending: boolean) => {
    setState(prev => ({
      ...prev,
      sortBy: field || undefined,
      sortAscending: field ? ascending : undefined,
    }));
  }, []);

  return (
    <SearchContext.Provider
      value={{
        state,
        isFetchingInitial: auth.isFetchingInitial,
        allowEmptySearch,
        url,
        dataset,
        authenticatedFetch,
        setQuery,
        toggleFilter,
        setRangeFilter,
        resetFilters,
        resetSingleFilter,
        resetRangeFilter,
        setSort,
        setDebounceDelay,
        setSearchSettings,
        fetchMoreResults
      }}
    >
      {children}
    </SearchContext.Provider>
  );
};

export const useSearchContext = () => {
  const context = useContext(SearchContext);
  if (!context) {
    throw new Error('useSearchContext must be used within a SearchProvider');
  }
  return context;
};