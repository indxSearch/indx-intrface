import React, { createContext, useContext, useState, useCallback, useMemo, useEffect, useRef } from 'react';

export interface SearchSettings {
  maxNumberOfRecordsToReturn: number;
  coverageDepth: number;
  enableCoverage: boolean;
  removeDuplicates: boolean;
  coverageSetup: CoverageSetup;
  minimumScore: number;
  showScore: boolean;
  placeholderText: string;
}

export interface CoverageSetup {
  levenshteinMaxWordSize: number;
  minWordSize: number;
  coverageMinWordHitsAbs: number;
  coverageMinWordHitsRelative: number;
  coverageQLimitForErrorTolerance: number;
  coverageLcsErrorToleranceRelativeq: number;
  coverWholeQuery: boolean;
  coverWholeWords: boolean;
  coverFuzzyWords: boolean;
  coverJoinedWords: boolean;
  coverPrefixSuffix: boolean;
  truncate: boolean;
}

export interface SearchResult {
  document: any; // The actual document
  documentKey: string; // The document key
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
  filterableFields?: string[]; // List of fields that can be used for filtering
  facetableFields?: string[]; // List of fields that can be used for faceting
  sortableFields?: string[]; // List of fields that can be used for sorting results
  filters: Record<string, string[]>; // Current active filters, mapping field names to arrays of selected values
  rangeFilters: Record<string, { min: number; max: number }>; // Current active range filters, mapping field names to min/max values
  facetStats?: Record<string, { min: number; max: number }>; // Current facet statistics (min/max values) for numeric fields, updated with each search
  rangeBounds?: Record<string, { min: number; max: number }>; // Initial range bounds for numeric fields, only updated when query changes
  sortBy?: string; // The field currently being used to sort results
  sortAscending?: boolean; // Whether the current sort is ascending (true) or descending (false)
  searchSettings: SearchSettings;
}

export interface SearchContextType {
  state: SearchState; // The current search state containing all search-related data
  isFetchingInitial: boolean; // Whether the initial data (fields, facets) is still being loaded
  setQuery: (query: string) => void; // Updates the search query text
  toggleFilter: (field: string, value: string) => void; // Toggles a value filter on/off for a given field
  setRangeFilter: (field: string, min: number, max: number) => void; // Sets min/max values for a range filter
  resetFilters: () => void; // Clears all active filters and range filters
  resetSingleFilter: (field: string, value?: string) => void; // Resets a specific value filter or range filter
  setSort: (field: string | null, ascending: boolean) => void; // Sets the sort field and direction
  setDebounceDelay?: (ms: number) => void; // Optional: Updates the debounce delay for faceted searches
  setSearchSettings: (settings: Partial<SearchSettings>) => void;
}

// Create the search context
const SearchContext = createContext<SearchContextType | undefined>(undefined);

// Debounce function to prevent excessive calls to the search API
function debounce<F extends (...args: any[]) => void>(fn: F, delay: number) {
  let timer: ReturnType<typeof setTimeout>;
  const debounced = (...args: Parameters<F>) => {
    clearTimeout(timer);
    timer = setTimeout(() => fn(...args), delay);
  };
  debounced.cancel = () => clearTimeout(timer);
  return debounced;
}

// SearchProvider component that manages the search state and provides the search context
export const SearchProvider: React.FC<{
  children: React.ReactNode;
  email: string;
  password: string;
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
}> = ({
  children,
  email,
  password,
  url,
  dataset,
  allowEmptySearch = false,
  maxResults = 10,
  facetDebounceDelayMillis = 200, // debounce faceted searches only
  enableFacets = true,
  coverageDepth = 500,
  removeDuplicates = true,
  enableCoverage = true,
  initialCoverageSetup = {},
}) => {
  const latestRequestId = useRef(0); // Track the latest search request to prevent race conditions
  const [state, setState] = useState<SearchState>({
    query: '',
    results: null,
    isLoading: false,
    facetDebounceDelayMillis,
    filters: {},
    rangeFilters: {},
    facetStats: {},
    searchSettings: {
      maxNumberOfRecordsToReturn: maxResults,
      coverageDepth,
      enableCoverage,
      removeDuplicates,
      minimumScore: 0,
      showScore: true,
      placeholderText: 'Type to search',
      coverageSetup: {
        // ALL DEFAULT VALUES
        levenshteinMaxWordSize: 20,
        minWordSize: 2,
        coverageMinWordHitsAbs: 1,
        coverageMinWordHitsRelative: 0,
        coverageQLimitForErrorTolerance: 5,
        coverageLcsErrorToleranceRelativeq: 0.2,
        coverWholeQuery: true,
        coverWholeWords: true,
        coverFuzzyWords: true,
        coverJoinedWords: true,
        coverPrefixSuffix: true,
        truncate: true,
        ...initialCoverageSetup, // Allow prop-based override
      },
    },
  });

  useEffect(() => {
    setState(prev => ({
      ...prev,
      facetDebounceDelayMillis,
    }));
  }, [facetDebounceDelayMillis]);

  // State variables for managing the search process
  const [token, setToken] = useState<string | null>(null); // The authentication token for API requests
  const [facetsEnabled] = useState(enableFacets); // Whether faceting is enabled
  const [filterableFields, setFilterableFields] = useState<string[]>([]); // List of fields that can be used for filtering
  const [facetableFields, setFacetableFields] = useState<string[]>([]); // List of fields that can be used for faceting
  const [sortableFields, setSortableFields] = useState<string[]>([]); // List of fields that can be used for sorting results
  const [isFetchingInitial, setIsFetchingInitial] = useState(true); // Whether the initial data (fields, facets) is still being loaded
  const [initialFacetStats, setInitialFacetStats] = useState<Record<string, { min: number; max: number }>>({}); // Initial facet statistics (min/max values) for numeric fields
  const [initialFacetKeys, setInitialFacetKeys] = useState<Record<string, string[]>>({}); // Initial facet keys for non-coverage fields
  const [fixedFacetStats, setFixedFacetStats] = useState<Record<string, { min: number; max: number }>>({}); // Fixed facet statistics (min/max values) for numeric fields
  const [lastQueryText, setLastQueryText] = useState<string>(''); // The last query text entered by the user
  const [rangeBounds, setRangeBounds] = useState<Record<string, { min: number; max: number }>>({}); // Initial range bounds for numeric fields, only updated when query changes

  // Cache for initial blank search data
  const initialBlankSearchData = useRef<{
    facets: any;
    facetStats: Record<string, { min: number; max: number }>;
    facetKeys: Record<string, string[]>;
  } | null>(null);

  // Function to update the search query text
  const setQuery = useCallback((query: string) => {
    setState(prev => ({
      ...prev,
      query,
      filters: {},
      rangeFilters: {},
    }));
  }, []);

  // Function to update the debounce delay for faceted searches
  const setDebounceDelay = useCallback((ms: number) => {
    setState(prev => ({
      ...prev,
      facetDebounceDelayMillis: ms,
    }));
  }, []);

  const setSearchSettings = useCallback((settings: Partial<SearchSettings>) => {
    setState(prev => ({
      ...prev,
      searchSettings: {
        ...prev.searchSettings,
        ...settings,
        coverageSetup: {
          ...prev.searchSettings.coverageSetup,
          ...(settings.coverageSetup || {}),
        },
      },
    }));
  }, []);

  // Function to toggle a value filter on/off for a given field
  const toggleFilter = useCallback((field: string, value: string) => {
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
    setState(prev => ({
      ...prev,
      filters: {},
      rangeFilters: {},
    }));
  }, []);

  // Function to reset a specific value filter or range filter
  const resetSingleFilter = useCallback((field: string, value?: string) => {
    setState(prev => {
      const updatedFilters = { ...prev.filters };
      const updatedRangeFilters = { ...prev.rangeFilters };

      if (value !== undefined) {
        const currentValues = updatedFilters[field] || [];
        const newValues = currentValues.filter(v => v !== value);
        if (newValues.length > 0) {
          updatedFilters[field] = newValues;
        } else {
          delete updatedFilters[field];
        }
      } else {
        delete updatedRangeFilters[field];
      }

      return {
        ...prev,
        filters: updatedFilters,
        rangeFilters: updatedRangeFilters,
      };
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

  // Function to combine multiple filters into a single filter proxy
  async function combineFilters(filters: any[], url: string, dataset: string, token: string): Promise<any> {
    if (filters.length === 0) return null;
    if (filters.length === 1) return filters[0];

    let current = filters[0]; // Start with the first filter
    for (let i = 1; i < filters.length; i++) { // Iterate through the remaining filters
      const response = await fetch(`${url}/api/CombineFilters/${dataset}`, { // Combine the current filter with the next filter
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ A: current, B: filters[i], useAndOperation: true }),
      });
      if (!response.ok) { // If the response is not ok, throw an error
        const err = await response.json(); // Get the error message
        console.error('CombineFilters failed:', err); // Log the error
        throw new Error('CombineFilters failed'); // Throw an error
      }
      current = await response.json(); // Update the current filter with the combined filter
    }
    return current; // Return the final combined filter
  }

  // Function to perform the actual search
  const performSearch = useCallback(
    async ({ enableFacets }: { enableFacets: boolean }) => {
      if (!token) return;
      const currentRequestId = ++latestRequestId.current;
      setState(prev => ({ ...prev, isLoading: true }));

      try {
        // 1) Build value‐filter proxies
        const filterEntries = Object.entries(state.filters ?? {});
        const valueFilterResponsesNested: any[][] = await Promise.all(
          filterEntries.map(async ([field, values]) => 
            Promise.all(
              values.map(value =>
                fetch(`${url}/api/CreateValueFilter/${dataset}`, { 
                  method: 'PUT',
                  headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`,
                  },
                  body: JSON.stringify({ FieldName: field, Value: value }),
                }).then(res => res.json())
              )
            )
          )
        );
        const valueFilterResponses = valueFilterResponsesNested.flat();

        // 2) Build range‐filter proxies
        const rangeFilterEntries = Object.entries(state.rangeFilters ?? {});
        const rangeFilterResponses: any[] = await Promise.all(
          rangeFilterEntries.map(([field, { min, max }]) =>
            fetch(`${url}/api/CreateRangeFilter/${dataset}`, {
              method: 'PUT',
              headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`,
              },
              body: JSON.stringify({ FieldName: field, LowerLimit: min, UpperLimit: max }),
            }).then(res => res.json())
          )
        );

        // 3) Combine all filters into one proxy
        const allFilters = [...valueFilterResponses, ...rangeFilterResponses].filter(
          f => f && typeof f.hashString === 'string'
        );
        const filterProxy = await combineFilters(allFilters, url, dataset, token);

        // 4) Determine if we should fetch results
        const shouldFetchResults = allowEmptySearch || state.query.trim() !== '';
        const searchBody = {
          text: state.query,
          // maxNumberOfRecordsToReturn: shouldFetchResults ? maxResults : 0,
          maxNumberOfRecordsToReturn: shouldFetchResults ? state.searchSettings.maxNumberOfRecordsToReturn : 0,
          ...(filterProxy ? { filter: filterProxy } : {}),
          ...(enableFacets ? { enableFacets: true } : {}),
          ...(state.sortBy ? { sortBy: state.sortBy } : {}),
          ...(state.sortAscending !== undefined ? { sortAscending: state.sortAscending } : {}),
          enableCoverage: state.searchSettings.enableCoverage,
          removeDuplicates: state.searchSettings.removeDuplicates,
          coverageDepth: state.searchSettings.coverageDepth,
          coverageSetup: state.searchSettings.coverageSetup
        };

        // 5) Execute the search
        const searchResponse = await fetch(`${url}/api/Search/${dataset}`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
          },
          body: JSON.stringify(searchBody),
        });
        const searchData = await searchResponse.json();

        // 6) Fetch actual documents if needed
        const records = searchData.records || [];
        const keys = records.map((record: any) => record.documentKey);
        const scores = records.map((record: any) => record.score);

        let combinedResults: any[] = [];
        if (shouldFetchResults && keys.length > 0) {
          const jsonResponse = await fetch(`${url}/api/GetJson/${dataset}`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${token}`,
            },
            body: JSON.stringify(keys),
          });
          const documentsData = await jsonResponse.json();

          // Combine document + key + score
          combinedResults = documentsData.map((doc: any, idx: number) => ({
            document: doc,
            documentKey: keys[idx],
            score: scores[idx],
          }));
        }

        // 7) Build new facetStats (live min/max under all filters)
        let newFacetStats: Record<string, { min: number; max: number }> = {}; 
        if (enableFacets && searchData.facets) {
          for (const [field, values] of Object.entries(searchData.facets)) {
            if (Array.isArray(values) && values.length > 0) {
              const numericValues = (values as any[])
                .map(v => Number(v.key))
                .filter((v: number) => !isNaN(v));
              if (numericValues.length > 0) {
                newFacetStats[field] = {
                  min: Math.min(...numericValues),
                  max: Math.max(...numericValues),
                };
              }
            }
          }
        }

        // 8) Determine if query changed
        const queryChanged = state.query !== lastQueryText;

        // 9) Merge facetStats (old vs new) for display purposes
        let mergedFacetStats = state.facetStats ?? {};
        if (queryChanged) {
          mergedFacetStats = { ...initialFacetStats, ...newFacetStats };
          setFixedFacetStats(mergedFacetStats);
          setLastQueryText(state.query);
        } else {
          mergedFacetStats = { ...fixedFacetStats, ...newFacetStats };
        }

        // 10) Update rangeBounds only if the query text changed
        if (queryChanged) {
          const updatedBounds = { ...rangeBounds };
          for (const [field, stats] of Object.entries(newFacetStats)) {
            updatedBounds[field] = stats;
          }
          setRangeBounds(updatedBounds);
        }

        // 11) Prepare displayFacets (for non‐coverage fields if needed)
        let displayFacets: any = searchData.facets;
        if (enableFacets && (!displayFacets || Object.keys(displayFacets).length === 0)) {
          displayFacets = {};
          for (const [field, keys] of Object.entries(initialFacetKeys)) {
            displayFacets[field] = (keys as string[]).map(key => ({ key, value: null }));
          }
        }

        // 12) Final state update
        if (currentRequestId !== latestRequestId.current) {
          return; // A newer request has been made — ignore this one
        }
        const filteredResults = combinedResults.filter(result => {
          const query = state.query.trim();

          if (query === '') {
            return true;  // Accept facet hits (no query)
          }

          if (query.length === 1) {
            return true;  // Accept short single-character queries
          }

          return result.score >= state.searchSettings.minimumScore;  // Apply minimum score for longer queries
        });
        setState(prev => ({
          ...prev,
          results: filteredResults,
          resultsSuppressed: !shouldFetchResults,
          ...(enableFacets
            ? {
                facets: displayFacets,
                facetStats: mergedFacetStats,
              }
            : {}),
          isLoading: false,
        }));
      } catch (error) {
        console.error('Search failed:', error);
        if (currentRequestId !== latestRequestId.current) {
          return; // A newer request has been made — ignore this one
        }
        setState(prev => ({
          ...prev,
          results: null,
          isLoading: false,
          resultsSuppressed: false,
        }));
      }
    },
    [
      state.query,
      state.filters,
      state.rangeFilters,
      state.sortBy,
      state.sortAscending,
      token,
      url,
      dataset,
      maxResults,
      initialFacetStats,
      fixedFacetStats,
      lastQueryText,
      rangeBounds,
      initialFacetKeys,
    ]
  );


  // Function to perform a basic search (no facets)
  const searchBasic = useCallback(() => { 
    performSearch({ enableFacets: false });
  }, [performSearch]);

  // Function to perform a search with facets
  const searchWithFacets = useMemo(
    () => debounce(() => performSearch({ enableFacets: true }), state.facetDebounceDelayMillis ?? 500),
    [performSearch, state.facetDebounceDelayMillis]
  );

  // Effect for query changes - immediate results, debounced facets
  useEffect(() => {
    const trimmedQuery = state.query.trim();
    const isFirstLoad = lastQueryText === '' && trimmedQuery === '';
    const isEmptySearch = trimmedQuery === '' && allowEmptySearch;

    if (isFirstLoad || isEmptySearch) { 
      searchWithFacets.cancel?.(); 
      performSearch({ enableFacets: facetsEnabled });
    } else {
      if (facetsEnabled) {
        searchBasic();  // Immediate results
        searchWithFacets();  // Debounced facets
      } else {
        performSearch({ enableFacets: false });
      }
    }

    return () => {
      searchWithFacets.cancel?.();
    };
  }, [state.query, allowEmptySearch, lastQueryText, searchBasic, searchWithFacets, performSearch, facetsEnabled]);

  // Effect for filter changes - immediate search with facets
  useEffect(() => {
    // Only trigger on actual filter changes, not query changes
    if (facetsEnabled && state.query === lastQueryText) {
      performSearch({ enableFacets: true });  // Immediate results + facets
    }
  }, [state.filters, state.rangeFilters, facetsEnabled, performSearch, state.query, lastQueryText]);

  useEffect(() => {
    const login = async () => {
      try {
        if (!email || !password) {
          throw new Error('Missing email or password in props');
        }

        const response = await fetch(
          `${url}/api/Login?userEmail=${encodeURIComponent(email)}&userPassWord=${encodeURIComponent(password)}`,
          {
            method: 'POST',
            headers: { accept: '*/*' },
            body: '',
          }
        );
        const data = await response.json();
        setToken(data.token);

        // Fetch filterable, facetable, sortable fields
        const [filterableRes, facetableRes, sortableRes] = await Promise.all([
          fetch(`${url}/api/GetFilterableFields/${dataset}`, {
            method: 'GET',
            headers: { accept: 'text/plain', Authorization: `Bearer ${data.token}` },
          }),
          fetch(`${url}/api/GetFacetableFields/${dataset}`, {
            method: 'GET',
            headers: { accept: 'text/plain', Authorization: `Bearer ${data.token}` },
          }),
          fetch(`${url}/api/GetSortableFields/${dataset}`, {
            method: 'GET',
            headers: { accept: 'text/plain', Authorization: `Bearer ${data.token}` },
          }),
        ]);
        const filterable = await filterableRes.json();
        const facetable = await facetableRes.json();
        const sortable = await sortableRes.json();
        setFilterableFields(filterable || []);
        setFacetableFields(facetable || []);
        setSortableFields(sortable || []);

        // Run initial blank search (no query, no filters) to get global bounds
        const blankSearchResponse = await fetch(`${url}/api/Search/${dataset}`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${data.token}`,
          },
          body: JSON.stringify({ text: '', maxNumberOfRecordsToReturn: 0, enableFacets: true }),
        });
        const blankSearchData = await blankSearchResponse.json();

        // Build initial facet stats from blank search
        const newFacetStats: Record<string, { min: number; max: number }> = {};
        if (blankSearchData.facets) {
          for (const [field, values] of Object.entries(blankSearchData.facets)) {
            if (Array.isArray(values) && values.length > 0) {
              const numericValues = (values as any[])
                .map(v => Number(v.key))
                .filter((v: number) => !isNaN(v));
              if (numericValues.length > 0) {
                newFacetStats[field] = {
                  min: Math.min(...numericValues),
                  max: Math.max(...numericValues),
                };
              }
            }
          }
        }

        // Extract facet keys for non-coverage fallback
        const extractedFacetKeys: Record<string, string[]> = {};
        if (blankSearchData.facets) {
          for (const [field, values] of Object.entries(blankSearchData.facets)) {
            if (Array.isArray(values)) {
              extractedFacetKeys[field] = (values as any[]).map(v => v.key);
            }
          }
        }

        // Cache the initial blank search data
        initialBlankSearchData.current = {
          facets: blankSearchData.facets,
          facetStats: newFacetStats,
          facetKeys: extractedFacetKeys
        };

        setInitialFacetStats(newFacetStats);
        setInitialFacetKeys(extractedFacetKeys);
        setRangeBounds(newFacetStats);
        setState(prev => ({
          ...prev,
          facetStats: newFacetStats,
        }));
      } catch (err) {
        console.error('Login failed:', err);
      } finally {
        setIsFetchingInitial(false);
      }
    };

    login();
  }, [email, password, url, dataset]);

  return (
    <SearchContext.Provider
      value={{
        state: {
          ...state,
          filterableFields,
          facetableFields,
          sortableFields,
          rangeBounds,
        },
        isFetchingInitial,
        setQuery,
        toggleFilter,
        setRangeFilter,
        resetFilters,
        resetSingleFilter,
        setSort,
        setDebounceDelay,
        setSearchSettings
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