import React, { createContext, useContext, useState, useCallback, useMemo, useEffect, useRef } from 'react';

export interface SearchState {
  query: string; // The current search query text entered by the user
  results: any[] | null; // The array of search results, or null if no search has been performed yet
  isLoading: boolean; // Whether a search is currently in progress
  resultsSuppressed?: boolean; // Whether results should be hidden (e.g. when query is empty and allowEmptySearch is false)
  debounceDelayMillis?: number; // The delay in milliseconds before performing a faceted search after typing stops
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
  debounceDelayMillis?: number;
  enableFacets?: boolean;
}> = ({
  children,
  email,
  password,
  url,
  dataset,
  allowEmptySearch = false,
  maxResults = 10,
  debounceDelayMillis = 300, // debounce faceted searches only
  enableFacets = true,
}) => {
  const [state, setState] = useState<SearchState>({
    query: '',
    results: null,
    isLoading: false,
    debounceDelayMillis,
    filters: {},
    rangeFilters: {},
    facetStats: {},
  });

  useEffect(() => {
    setState(prev => ({
      ...prev,
      debounceDelayMillis,
    }));
  }, [debounceDelayMillis]);

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
      debounceDelayMillis: ms,
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
      if (!token) return; // If the token is not set, return
      setState(prev => ({ ...prev, isLoading: true })); // Set the loading state to true

      try {
        // 1) Build value‐filter proxies
        const filterEntries = Object.entries(state.filters ?? {}); // Get the filter entries from the state
        const valueFilterResponsesNested: any[][] = await Promise.all( // Create an array of value filter responses
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
        )
        const valueFilterResponses = valueFilterResponsesNested.flat(); // Flatten the array of value filter responses

        // 2) Build range‐filter proxies
        const rangeFilterEntries = Object.entries(state.rangeFilters ?? {}); // Get the range filter entries from the state
        const rangeFilterResponses: any[] = await Promise.all( // Create an array of range filter responses
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
        const shouldFetchResults = allowEmptySearch || state.query.trim() !== ''; // If the query is empty and allowEmptySearch is false, do not fetch results
        const searchBody: any = { // The body of the search request
          text: state.query, // The search query text
          maxNumberOfRecordsToReturn: shouldFetchResults ? maxResults : 0, // The maximum number of records to return
          ...(filterProxy ? { filter: filterProxy } : {}), // The filter proxy
          ...(enableFacets ? { enableFacets: true } : {}), // Whether faceting is enabled
          ...(state.sortBy ? { sortBy: state.sortBy } : {}), // The field to sort by
          ...(state.sortAscending !== undefined ? { sortAscending: state.sortAscending } : {}), // The sort direction
          // Lots of more options possible here, but we'll keep it simple for now
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
        const searchData = await searchResponse.json(); // The search data

        // 6) Fetch actual documents if needed
        const keys = (searchData.records || []).map((record: any) => record.documentKey); // The keys of the documents to fetch
        let documents: any[] = []; // The documents
        if (shouldFetchResults && keys.length > 0) { // If the documents should be fetched and there are keys
          const jsonResponse = await fetch(`${url}/api/GetJson/${dataset}`, { // Fetch the documents
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${token}`,
            },
            body: JSON.stringify(keys),
          });
          documents = await jsonResponse.json(); // The documents
        }

        // 7) Build new facetStats (live min/max under all filters)
        let newFacetStats: Record<string, { min: number; max: number }> = {}; 
        if (enableFacets && searchData.facets) { // If faceting is enabled and there are facets
          for (const [field, values] of Object.entries(searchData.facets)) { // Iterate through the facets
            if (Array.isArray(values) && values.length > 0) { // If the values are an array and there are values
              const numericValues = (values as any[]) // Convert the values to numbers
                .map(v => Number(v.key)) // Convert the values to numbers
                .filter((v: number) => !isNaN(v)); // Filter out any non-numeric values
              if (numericValues.length > 0) { // If there are numeric values
                newFacetStats[field] = { // Update the facet stats
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
          // On brand‐new query, restart from the initial blank‐search stats
          mergedFacetStats = { ...initialFacetStats, ...newFacetStats }; 
          setFixedFacetStats(mergedFacetStats); // Set the fixed facet stats. These will be used to display the initial facet stats for non-coverage hits (large typos)
          setLastQueryText(state.query); // Set the last query text. This is used to determine if the query has changed
        } else {
          // Otherwise, overlay new stats on top of existing fixed stats. This is used to display the updated facet stats for coverage hits (near-exact matches)
          mergedFacetStats = { ...fixedFacetStats, ...newFacetStats };
        }

        // 10) Update rangeBounds only if the query text changed
        if (queryChanged) {
          const updatedBounds = { ...rangeBounds }; // Create a new range bounds object
          for (const [field, stats] of Object.entries(newFacetStats)) { // Iterate through the new facet stats
            updatedBounds[field] = stats; // Update the range bounds
          }
          setRangeBounds(updatedBounds); // Set the range bounds
        }

        // 11) Prepare displayFacets (for non‐coverage fields if needed)
        let displayFacets: any = searchData.facets; // The facets to display
        if (enableFacets && (!displayFacets || Object.keys(displayFacets).length === 0)) { // If faceting is enabled and there are no facets
          displayFacets = {}; // Create a new facets object
          for (const [field, keys] of Object.entries(initialFacetKeys)) { // Iterate through the initial facet keys
            displayFacets[field] = (keys as string[]).map(key => ({ key, value: null }));
          }
        }

        // 12) Final state update
        setState(prev => ({
          ...prev,
          results: documents,
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
        setState(prev => ({
          ...prev,
          results: null,
          isLoading: false,
          resultsSuppressed: false,
        }));
      }
    },
    [
      state.query, // The current search query text entered by the user
      state.filters, // The current active filters
      state.rangeFilters, // The current active range filters
      state.sortBy, // The field currently being used to sort results
      state.sortAscending, // Whether the current sort is ascending (true) or descending (false)
      token, // The authentication token for API requests
      url, // The URL of the search API
      dataset, // The dataset to search
      maxResults, // The maximum number of records to return
      initialFacetStats, // The initial facet stats (min/max values) for numeric fields
      fixedFacetStats, // The fixed facet stats (min/max values) for numeric fields
      lastQueryText, // The last query text entered by the user
      rangeBounds, // The initial range bounds for numeric fields, only updated when query changes
      initialFacetKeys, // The initial facet keys for non-coverage fields
    ]
  );

  // Function to perform a basic search (no facets)
  const searchBasic = useCallback(() => { 
    performSearch({ enableFacets: false }); // Perform a basic search (no facets)
  }, [performSearch]);

  // Function to perform a search with facets
  const searchWithFacets = useMemo(
    () => debounce(() => performSearch({ enableFacets: true }), state.debounceDelayMillis ?? 50), // Debounce the search with facets
    [performSearch, state.debounceDelayMillis]
  );

  // Effect for query changes - immediate results, debounced facets
  useEffect(() => {
    const trimmedQuery = state.query.trim(); // Trim the query text
    const isFirstLoad = lastQueryText === '' && trimmedQuery === ''; // If the query is empty and the last query text is empty
    const isEmptySearch = trimmedQuery === '' && allowEmptySearch; // If the query is empty and allowEmptySearch is false

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