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
  truncationIndex?: number;
}

export interface SearchContextType {
  state: SearchState; // The current search state containing all search-related data
  isFetchingInitial: boolean; // Whether the initial data (fields, facets) is still being loaded
  allowEmptySearch: boolean; // Whether empty searches are allowed
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
  const latestRequestId = useRef(0); // Track the latest search request to prevent race conditions
  const performSearchRef = useRef<((options: { enableFacets: boolean }) => Promise<void>) | undefined>(undefined); // Stable ref to latest performSearch
  const hasInitialized = useRef(false); // Track if initial search has completed
  const filterEffectHasRun = useRef(false); // Track if filter effect has run at least once
  const [state, setState] = useState<SearchState>({
    query: '',
    results: null,
    isLoading: false,
    resultsSuppressed: !allowEmptySearch, // Show placeholder if empty search not allowed
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

  // State variables for managing the search process
  const [token, setToken] = useState<string | null>(null); // The authentication token for API requests
  const [facetsEnabled] = useState(enableFacets); // Whether faceting is enabled

  // Authenticated fetch wrapper - mimics C# HttpClient with default Bearer token
  const authenticatedFetch = useCallback((url: string, options: RequestInit = {}) => {
    if (!token) {
      throw new Error('No authentication token available');
    }
    return fetch(url, {
      ...options,
      headers: {
        ...options.headers,
        'Authorization': `Bearer ${token}`,
      },
      credentials: 'include',
    });
  }, [token]);
  const [filterableFields, setFilterableFields] = useState<string[]>([]); // List of fields that can be used for filtering
  const [facetableFields, setFacetableFields] = useState<string[]>([]); // List of fields that can be used for faceting
  const [sortableFields, setSortableFields] = useState<string[]>([]); // List of fields that can be used for sorting results
  const [isFetchingInitial, setIsFetchingInitial] = useState(true); // Whether the initial data (fields, facets) is still being loaded
  const [initialFacetStats, setInitialFacetStats] = useState<Record<string, { min: number; max: number }>>({}); // Initial facet statistics (min/max values) for numeric fields
  const [initialFacetKeys, setInitialFacetKeys] = useState<Record<string, string[]>>({}); // Initial facet keys for non-coverage fields
  const [fixedFacetStats, setFixedFacetStats] = useState<Record<string, { min: number; max: number }>>({}); // Fixed facet statistics (min/max values) for numeric fields
  const [lastQueryText, setLastQueryText] = useState<string>(''); // The last query text entered by the user
  const [lastRangeBoundsQuery, setLastRangeBoundsQuery] = useState<string>(''); // The last query text that updated rangeBounds
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
  const combineFilters = useCallback(async (filters: any[], url: string, dataset: string): Promise<any> => {
    if (filters.length === 0) return null;
    if (filters.length === 1) return filters[0];

    let current = filters[0]; // Start with the first filter
    for (let i = 1; i < filters.length; i++) { // Iterate through the remaining filters
      const response = await authenticatedFetch(`${url}/api/CombineFilters/${dataset}`, { // Combine the current filter with the next filter
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
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
  }, [authenticatedFetch]);

  // Extract searchSettings values to avoid object reference issues
  const settingsMaxResults = state.searchSettings.maxNumberOfRecordsToReturn;
  const settingsEnableCoverage = state.searchSettings.enableCoverage;
  const settingsRemoveDuplicates = state.searchSettings.removeDuplicates;
  const settingsCoverageDepth = state.searchSettings.coverageDepth;
  const settingsMinimumScore = state.searchSettings.minimumScore;

  // Extract sort values to avoid object reference issues
  const sortBy = state.sortBy;
  const sortAscending = state.sortAscending;

  // Memoize coverageSetup to prevent unnecessary re-renders
  const settingsCoverageSetup = useMemo(() => state.searchSettings.coverageSetup, [
    state.searchSettings.coverageSetup.levenshteinMaxWordSize,
    state.searchSettings.coverageSetup.minWordSize,
    state.searchSettings.coverageSetup.coverageMinWordHitsAbs,
    state.searchSettings.coverageSetup.coverageMinWordHitsRelative,
    state.searchSettings.coverageSetup.coverageQLimitForErrorTolerance,
    state.searchSettings.coverageSetup.coverageLcsErrorToleranceRelativeq,
    state.searchSettings.coverageSetup.coverWholeQuery,
    state.searchSettings.coverageSetup.coverWholeWords,
    state.searchSettings.coverageSetup.coverFuzzyWords,
    state.searchSettings.coverageSetup.coverJoinedWords,
    state.searchSettings.coverageSetup.coverPrefixSuffix,
    state.searchSettings.coverageSetup.truncate,
  ]);

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
                authenticatedFetch(`${url}/api/CreateValueFilter/${dataset}`, {
                  method: 'PUT',
                  headers: {
                    'Content-Type': 'application/json',
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
            authenticatedFetch(`${url}/api/CreateRangeFilter/${dataset}`, {
              method: 'PUT',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({ FieldName: field, LowerLimit: min, UpperLimit: max }),
            }).then(res => res.json())
          )
        );

        // 3) Combine all filters into one proxy
        const allFilters = [...valueFilterResponses, ...rangeFilterResponses].filter(
          f => f && typeof f.hashString === 'string'
        );
        const filterProxy = await combineFilters(allFilters, url, dataset);

        // 4) Determine if we should fetch results
        const shouldFetchResults = allowEmptySearch || state.query.trim() !== '';
        const searchBody = {
          text: state.query,
          maxNumberOfRecordsToReturn: shouldFetchResults ? settingsMaxResults : 0,
          enableFacets,
          ...(filterProxy ? { filter: filterProxy } : {}),
          ...(sortBy ? { sortBy: sortBy } : {}),
          ...(sortAscending !== undefined ? { sortAscending: sortAscending } : {}),
          enableCoverage: settingsEnableCoverage,
          removeDuplicates: settingsRemoveDuplicates,
          coverageDepth: settingsCoverageDepth,
          coverageSetup: settingsCoverageSetup
        };

        if (enableDebugLogs) {
          console.log('[performSearch] request body:', JSON.stringify(searchBody, null, 2));
        }

        // 5) Execute the search
        const searchResponse = await authenticatedFetch(`${url}/api/Search/${dataset}`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(searchBody),
        });
        const searchData = await searchResponse.json();
        const truncationIndex = searchData.truncationIndex ?? -1;

        // 6) Fetch actual documents if needed
        const records = searchData.records || [];
        const keys = records.map((record: any) => record.documentKey);
        const scores = records.map((record: any) => record.score);

        let combinedResults: any[] = [];
        if (shouldFetchResults && keys.length > 0) {
          const jsonResponse = await authenticatedFetch(`${url}/api/GetJson/${dataset}`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
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
        const rangeBoundsNeedsUpdate = state.query !== lastRangeBoundsQuery;

        // 9) Merge facetStats (old vs new) for display purposes
        let mergedFacetStats = state.facetStats ?? {};
        if (queryChanged) {
          mergedFacetStats = { ...initialFacetStats, ...newFacetStats };
          setFixedFacetStats(mergedFacetStats);
          setLastQueryText(state.query);
        } else {
          mergedFacetStats = { ...fixedFacetStats, ...newFacetStats };
        }

        // 10) Update rangeBounds only if query changed AND we have facets AND rangeBounds hasn't been updated yet
        if (rangeBoundsNeedsUpdate && enableFacets) {
          const updatedBounds = { ...rangeBounds };
          for (const [field, stats] of Object.entries(newFacetStats)) {
            updatedBounds[field] = stats;
          }
          setRangeBounds(updatedBounds);
          setLastRangeBoundsQuery(state.query);
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

          return result.score >= settingsMinimumScore;  // Apply minimum score for longer queries
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
          truncationIndex,
        }));
      } catch (error) {
        console.error('[Search] ❌ Search failed:', error);

        // Provide helpful error messages
        if (error instanceof TypeError && error.message.includes('fetch')) {
          console.error('[Search] ❌ Network error - cannot reach INDX server');
          console.error('[Search] 💡 Check if server is running at:', url);
        } else if (error instanceof Error) {
          if (error.message.includes('401')) {
            console.error('[Search] ❌ Authentication failed');
            console.error('[Search] 💡 Your token may have expired. Get a fresh token with:');
            console.error('[Search] 💡 curl -X POST "' + url + '/api/Login" -H "Content-Type: application/json" -d \'{"userEmail":"your@email.com","userPassWord":"yourpassword"}\'');
          } else if (error.message.includes('404')) {
            console.error('[Search] ❌ Dataset not found');
            console.error('[Search] 💡 Check that dataset "' + dataset + '" exists');
          } else {
            console.error('[Search] 💡 Error:', error.message);
          }
        }

        if (currentRequestId !== latestRequestId.current) {
          return; // A newer request has been made — ignore this one
        }
        setState(prev => ({
          ...prev,
          results: null,
          isLoading: false,
          resultsSuppressed: false,
          error: error instanceof Error ? error.message : 'Search failed',
        }));
      }
    },
    [
      state.query,
      state.filters,
      state.rangeFilters,
      sortBy,
      sortAscending,
      settingsMaxResults,
      settingsEnableCoverage,
      settingsRemoveDuplicates,
      settingsCoverageDepth,
      settingsCoverageSetup,
      settingsMinimumScore,
      authenticatedFetch,
      combineFilters,
      url,
      dataset,
      allowEmptySearch,
      token,
    ]
  );

  // Update the ref whenever performSearch changes
  useEffect(() => {
    performSearchRef.current = performSearch;
  }, [performSearch]);

  // Function to perform a basic search (no facets) - stable, doesn't depend on performSearch
  const searchBasic = useCallback(() => {
    if (enableDebugLogs) {
      console.log('Search fired');
    }
    performSearchRef.current?.({ enableFacets: false });
  }, []); // Don't include enableDebugLogs - we just need to check it, not recreate the callback

  // Function to perform a search with facets - stable debounced function
  const searchWithFacetsDebounced = useRef<ReturnType<typeof debounce> | null>(null);

// Create/update debounced function when delay changes
useEffect(() => {
  // Cancel any pending calls from the old debounced function
  searchWithFacetsDebounced.current?.cancel();

  // Create new debounced function
  searchWithFacetsDebounced.current = debounce(() => {
    if (enableDebugLogs) {
      console.log('Debounced searchWithFacets fired');
    }
    performSearchRef.current?.({ enableFacets: true });
  }, state.facetDebounceDelayMillis ?? 500);

  return () => {
    searchWithFacetsDebounced.current?.cancel();
  };
}, [state.facetDebounceDelayMillis]); // Don't include enableDebugLogs - only recreate when delay changes

const searchWithFacets = useCallback(() => {
  searchWithFacetsDebounced.current?.();
}, []);

  // Effect for initial blank search after authentication completes
  useEffect(() => {
    if (!isFetchingInitial && token && !hasInitialized.current) {
      // Only perform initial search if allowEmptySearch is true
      if (allowEmptySearch) {
        performSearchRef.current?.({ enableFacets: facetsEnabled });
      }
      hasInitialized.current = true;
    }
  }, [isFetchingInitial, token, allowEmptySearch, facetsEnabled]); // Trigger after auth completes

  // Effect for query changes - immediate results, debounced facets
  useEffect(() => {
    // Skip if no token yet (wait for initial search effect to handle first search)
    if (!token) return;

    // Skip if not initialized yet (initial search effect will handle first search)
    if (!hasInitialized.current) return;

    const trimmedQuery = state.query.trim();
    const isEmptySearch = trimmedQuery === '' && allowEmptySearch;
    const shouldSkipEmptySearch = trimmedQuery === '' && !allowEmptySearch;

    // Skip search if query is empty and allowEmptySearch is false
    if (shouldSkipEmptySearch) {
      // Set resultsSuppressed to show placeholder instead of results
      // Only update if state actually needs to change to avoid infinite loops
      if (!state.resultsSuppressed) {
        setState(prev => ({
          ...prev,
          resultsSuppressed: true,
        }));
      }
      return;
    }

    if (isEmptySearch) {
      searchWithFacetsDebounced.current?.cancel();
      performSearchRef.current?.({ enableFacets: facetsEnabled });
    } else {
      if (facetsEnabled) {
        // Immediate search without facets
        if (enableDebugLogs) {
          console.log('Search fired');
        }
        performSearchRef.current?.({ enableFacets: false });

        // Debounced search with facets
        searchWithFacetsDebounced.current?.();
      } else {
        performSearchRef.current?.({ enableFacets: false });
      }
    }

    return () => {
      searchWithFacetsDebounced.current?.cancel();
    };
  }, [state.query, allowEmptySearch, facetsEnabled]); // Removed searchBasic and searchWithFacets

  // Effect for filter changes - immediate search with facets
  useEffect(() => {
    // Skip if this is before initialization completes or no token yet
    if (!hasInitialized.current || !token) return;

    // Skip on first run (let initialization complete first)
    if (!filterEffectHasRun.current) {
      filterEffectHasRun.current = true;
      if (enableDebugLogs) {
        console.log('[Filter effect] First run, skipping');
      }
      return;
    }

    // Skip if query changed (query effect will handle the search)
    if (state.query !== lastQueryText) {
      if (enableDebugLogs) {
        console.log('[Filter effect] Skipping because query changed');
      }
      return;
    }

    // Don't search if query is empty and allowEmptySearch is false
    const trimmedQuery = state.query.trim();
    const shouldSkipSearch = !allowEmptySearch && trimmedQuery === '';

    if (facetsEnabled && !shouldSkipSearch) {
      if (enableDebugLogs) {
        console.log('[Filter effect] Firing search');
      }
      performSearchRef.current?.({ enableFacets: true });
    }
  }, [state.filters, state.rangeFilters]);

  // Effect for sort changes - immediate search with facets
  useEffect(() => {
    // Skip if this is before initialization completes or no token yet
    if (!hasInitialized.current || !token) return;

    // Don't search if query is empty and allowEmptySearch is false
    const trimmedQuery = state.query.trim();
    const shouldSkipSearch = !allowEmptySearch && trimmedQuery === '';

    if (facetsEnabled && !shouldSkipSearch) {
      performSearchRef.current?.({ enableFacets: true });
    }
  }, [sortBy, sortAscending]);

  useEffect(() => {
    const authenticate = async () => {
      try {
        let sessionToken: string;

        // If pre-authenticated token is provided, skip login but still open dataset
        if (preAuthenticatedToken) {
          if (enableDebugLogs) {
            console.log('[Auth] ✅ Using pre-authenticated token');
          }
          sessionToken = preAuthenticatedToken;
        } else {
          // Standard authentication flow - validate required credentials
          if (!email || !password) {
            console.error('[Auth] ❌ Missing credentials');
            if (!email) {
              console.error('[Auth] ❌ Missing email');
              console.error('[Auth] 💡 Pass email="your@email.com" to SearchProvider');
            }
            if (!password) {
              console.error('[Auth] ❌ Missing password');
              console.error('[Auth] 💡 Pass password="yourpassword" to SearchProvider');
            }
            throw new Error('Email and password are required. Check console for instructions.');
          }

          if (!url) {
            console.error('[Auth] ❌ Missing INDX server URL');
            console.error('[Auth] 💡 Add NEXT_PUBLIC_INDX_URL to your .env.local file');
            throw new Error('INDX server URL is required. Check console for instructions.');
          }

          if (!dataset) {
            console.error('[Auth] ❌ Missing dataset name');
            console.error('[Auth] 💡 Pass dataset="your-dataset-name" to SearchProvider');
            throw new Error('Dataset name is required. Check console for instructions.');
          }

          // STEP 1: Call Login endpoint to get fresh session token
          if (enableDebugLogs) {
            console.log('[Auth] 🔐 Logging in to get session token...');
          }
          const loginRes = await fetch(`${url}/api/Login`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              accept: '*/*'
            },
            credentials: 'include',
            body: JSON.stringify({
              userEmail: email,
              userPassWord: password
            })
          });

          if (!loginRes.ok) {
            console.error('[Auth] ❌ Login failed:', loginRes.status, await loginRes.text());
            throw new Error('Login failed. Check your email and password.');
          }

          const loginData = await loginRes.json();
          sessionToken = loginData.token;

          if (!sessionToken) {
            console.error('[Auth] ❌ No token received from login response');
            throw new Error('No token received from login.');
          }

          if (enableDebugLogs) {
            console.log('[Auth] ✅ Login successful, bearer token received (length:', sessionToken.length, ')');
          }
        }

        // STEP 2: Call CreateOrOpen to establish dataset session (for both auth paths)
        if (enableDebugLogs) {
          console.log('[Auth] 🔓 Opening dataset session...');
        }
        const createOrOpenRes = await fetch(`${url}/api/CreateOrOpen/${dataset}/400`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${sessionToken}`
          },
          body: '""'
        });

        if (!createOrOpenRes.ok) {
          console.error('[Auth] ❌ CreateOrOpen failed:', createOrOpenRes.status, await createOrOpenRes.text());
          throw new Error('Failed to open dataset session.');
        }

        setToken(sessionToken); // Store the JWT token for subsequent calls

        if (enableDebugLogs) {
          console.log('[Auth] ✅ Dataset session established');
        }

        // Fetch filterable, facetable, sortable fields
        const authFetch = (fetchUrl: string) => fetch(fetchUrl, {
          method: 'GET',
          headers: {
            accept: 'text/plain',
            'Authorization': `Bearer ${sessionToken}`
          },
          credentials: 'include',
        });

        // VALIDATION 3: Check dataset status first
        if (enableDebugLogs) {
          console.log('[Auth] 🔍 Checking dataset status...');
        }
        const statusRes = await authFetch(`${url}/api/GetStatus/${dataset}`);

        if (!statusRes.ok) {
          if (statusRes.status === 401) {
            console.error('[Auth] ❌ Authentication failed (401 Unauthorized)');
            console.error('[Auth] 💡 Your token may be expired or invalid');
            console.error('[Auth] 💡 Get a fresh token with: curl -X POST "' + url + '/api/Login" -H "Content-Type: application/json" -d \'{"userEmail":"your@email.com","userPassWord":"yourpassword"}\'');
            throw new Error('Authentication failed (401). Token may be expired. Check console for instructions.');
          } else if (statusRes.status === 404) {
            console.error('[Auth] ❌ Dataset "' + dataset + '" not found (404)');
            console.error('[Auth] 💡 Available datasets can be checked with: curl -X GET "' + url + '/api/GetUserDataSets" -H "Authorization: Bearer YOUR_TOKEN"');
            console.error('[Auth] 💡 Make sure you spelled the dataset name correctly');
            throw new Error('Dataset "' + dataset + '" not found. Check console for instructions.');
          } else {
            const errorText = await statusRes.text();
            console.error('[Auth] ❌ Failed to get dataset status:', statusRes.status, errorText);
            console.error('[Auth] 💡 Check if your INDX server is running at:', url);
            throw new Error('Failed to connect to INDX server. Check console for details.');
          }
        }

        const statusData = await statusRes.json();
        if (enableDebugLogs) {
          console.log('[Auth] 📊 Dataset status:', statusData);
        }

        // Check if dataset is ready (if state field exists)
        if (statusData.state && statusData.state !== 'Ready') {
          console.warn('[Auth] ⚠️ Dataset is not ready yet. Current state:', statusData.state);
          console.warn('[Auth] 💡 Wait for indexing to complete before searching');
        }

        // Check if dataset is empty (use documentCount field from API)
        const recordCount = statusData.documentCount ?? statusData.numberOfRecords ?? 0;
        if (recordCount === 0) {
          console.warn('[Auth] ⚠️ Dataset "' + dataset + '" is empty (0 records)');
          console.warn('[Auth] 💡 Add documents to your dataset before searching');
          console.warn('[Auth] 💡 Search will work but return no results');
        } else if (enableDebugLogs) {
          console.log('[Auth] ✅ Dataset has', recordCount, 'records');
        }

        const [filterableRes, facetableRes, sortableRes] = await Promise.all([
          authFetch(`${url}/api/GetFilterableFields/${dataset}`),
          authFetch(`${url}/api/GetFacetableFields/${dataset}`),
          authFetch(`${url}/api/GetSortableFields/${dataset}`),
        ]);

        if (!filterableRes.ok) {
          console.error('[Auth] ❌ GetFilterableFields failed:', filterableRes.status, await filterableRes.text());
          throw new Error('Failed to get filterable fields. Check console for details.');
        }
        if (!facetableRes.ok) {
          console.error('[Auth] ❌ GetFacetableFields failed:', facetableRes.status, await facetableRes.text());
          throw new Error('Failed to get facetable fields. Check console for details.');
        }
        if (!sortableRes.ok) {
          console.error('[Auth] ❌ GetSortableFields failed:', sortableRes.status, await sortableRes.text());
          throw new Error('Failed to get sortable fields. Check console for details.');
        }

        const filterable = await filterableRes.json().catch(err => {
          console.error('Failed to parse GetFilterableFields response:', err);
          return [];
        });
        const facetable = await facetableRes.json().catch(err => {
          console.error('Failed to parse GetFacetableFields response:', err);
          return [];
        });
        const sortable = await sortableRes.json().catch(err => {
          console.error('Failed to parse GetSortableFields response:', err);
          return [];
        });
        setFilterableFields(filterable || []);
        setFacetableFields(facetable || []);
        setSortableFields(sortable || []);

        // Run initial blank search (no query, no filters) to get global bounds
        let blankSearchData: any = { facets: {} };
        try {
          const blankSearchResponse = await fetch(`${url}/api/Search/${dataset}`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${sessionToken}`,
            },
            credentials: 'include',
            body: JSON.stringify({ text: '', maxNumberOfRecordsToReturn: 0, enableFacets: true }),
          });

          if (blankSearchResponse.ok) {
            blankSearchData = await blankSearchResponse.json().catch(err => {
              console.warn('Failed to parse blank search response:', err);
              return { facets: {} };
            });
          } else {
            console.warn('Blank search failed:', blankSearchResponse.status, blankSearchResponse.statusText);
            console.warn('Continuing without initial facet data - facets will be populated after first search');
          }
        } catch (err) {
          console.warn('Blank search error:', err);
          console.warn('Continuing without initial facet data - facets will be populated after first search');
        }

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

        if (enableDebugLogs) {
          console.log('[Auth] ✅ Initialization complete');
        }
      } catch (err) {
        console.error('[Auth] ❌ Initialization failed:', err);

        // Provide helpful error messages based on error type
        if (err instanceof Error) {
          // Already has helpful message from our validations
          console.error('[Auth] 💡 Error:', err.message);
        } else if (typeof err === 'object' && err !== null && 'message' in err) {
          console.error('[Auth] 💡 Error:', (err as any).message);
        }

        // Check for common network errors
        if (err instanceof TypeError && err.message.includes('fetch')) {
          console.error('[Auth] ❌ Network error - cannot connect to INDX server');
          console.error('[Auth] 💡 Check if the server is running at:', url);
          console.error('[Auth] 💡 Check your NEXT_PUBLIC_INDX_URL in .env.local');
          console.error('[Auth] 💡 For local development, it should be: http://localhost:5001');
        }

        // Re-throw to prevent the component from rendering with bad state
        throw err;
      } finally {
        setIsFetchingInitial(false);
      }
    };

    authenticate();
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
        allowEmptySearch,
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