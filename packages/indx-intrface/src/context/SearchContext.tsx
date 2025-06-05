import React, { createContext, useContext, useState, useCallback, useMemo, useEffect } from 'react';

export interface SearchState {
  query: string;
  results: any[] | null;
  isLoading: boolean;
  resultsSuppressed?: boolean;
  debounceDelayMillis?: number;
  error?: string;
  facets?: any | null;
  filterableFields?: string[];
  facetableFields?: string[];
  sortableFields?: string[]; // Optional: list of fields that can be used for sorting
  filters: Record<string, string[]>;
  rangeFilters: Record<string, { min: number; max: number }>;
  facetStats?: Record<string, { min: number; max: number }>; // live
  rangeBounds?: Record<string, { min: number; max: number }>; // init only, updated on query changes only
  sortBy?: string;
  sortAscending?: boolean;
}

export interface SearchContextType {
  state: SearchState;
  isFetchingInitial: boolean;
  setQuery: (query: string) => void;
  toggleFilter: (field: string, value: string) => void;
  setRangeFilter: (field: string, min: number, max: number) => void;
  resetFilters: () => void;
  resetSingleFilter: (field: string, value?: string) => void;
  setSort: (field: string | null, ascending: boolean) => void;
  setDebounceDelay?: (ms: number) => void;
}

const SearchContext = createContext<SearchContextType | undefined>(undefined);

function debounce<F extends (...args: any[]) => void>(fn: F, delay: number) {
  let timer: ReturnType<typeof setTimeout>;
  const debounced = (...args: Parameters<F>) => {
    clearTimeout(timer);
    timer = setTimeout(() => fn(...args), delay);
  };
  debounced.cancel = () => clearTimeout(timer);
  return debounced;
}

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
  debounceDelayMillis = 100,
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

  const [token, setToken] = useState<string | null>(null);
  const [facetsEnabled] = useState(enableFacets);
  const [filterableFields, setFilterableFields] = useState<string[]>([]);
  const [facetableFields, setFacetableFields] = useState<string[]>([]);
  const [sortableFields, setSortableFields] = useState<string[]>([]);
  const [isFetchingInitial, setIsFetchingInitial] = useState(true);
  const [initialFacetStats, setInitialFacetStats] = useState<Record<string, { min: number; max: number }>>({});
  const [initialFacetKeys, setInitialFacetKeys] = useState<Record<string, string[]>>({});
  const [fixedFacetStats, setFixedFacetStats] = useState<Record<string, { min: number; max: number }>>({});
  const [lastQueryText, setLastQueryText] = useState<string>('');
  const [rangeBounds, setRangeBounds] = useState<Record<string, { min: number; max: number }>>({});

  const setQuery = useCallback((query: string) => {
    setState(prev => ({
      ...prev,
      query,
      filters: {},
      rangeFilters: {},
    }));
  }, []);

  const setDebounceDelay = useCallback((ms: number) => {
    setState(prev => ({
      ...prev,
      debounceDelayMillis: ms,
    }));
  }, []);

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

  const setRangeFilter = useCallback((field: string, min: number, max: number) => {
    setState(prev => ({
      ...prev,
      rangeFilters: {
        ...prev.rangeFilters,
        [field]: { min, max },
      },
    }));
  }, []);

  const resetFilters = useCallback(() => {
    setState(prev => ({
      ...prev,
      filters: {},
      rangeFilters: {},
    }));
  }, []);

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

  const setSort = useCallback((field: string | null, ascending: boolean) => {
    setState(prev => ({
      ...prev,
      sortBy: field || undefined,
      sortAscending: field ? ascending : undefined,
    }));
  }, []);

  async function combineFilters(filters: any[], url: string, dataset: string, token: string): Promise<any> {
    if (filters.length === 0) return null;
    if (filters.length === 1) return filters[0];

    let current = filters[0];
    for (let i = 1; i < filters.length; i++) {
      const response = await fetch(`${url}/api/CombineFilters/${dataset}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ A: current, B: filters[i], useAndOperation: true }),
      });
      if (!response.ok) {
        const err = await response.json();
        console.error('CombineFilters failed:', err);
        throw new Error('CombineFilters failed');
      }
      current = await response.json();
    }
    return current;
  }

  const performSearch = useCallback(
    async ({ enableFacets }: { enableFacets: boolean }) => {
      if (!token) return;
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
        )
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
        const searchBody: any = {
          text: state.query,
          maxNumberOfRecordsToReturn: shouldFetchResults ? maxResults : 0,
          ...(filterProxy ? { filter: filterProxy } : {}),
          ...(enableFacets ? { enableFacets: true } : {}),
          ...(state.sortBy ? { sortBy: state.sortBy } : {}),
          ...(state.sortAscending !== undefined ? { sortAscending: state.sortAscending } : {}),
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
        const keys = (searchData.records || []).map((record: any) => record.documentKey);
        let documents: any[] = [];
        if (shouldFetchResults && keys.length > 0) {
          const jsonResponse = await fetch(`${url}/api/GetJson/${dataset}`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${token}`,
            },
            body: JSON.stringify(keys),
          });
          documents = await jsonResponse.json();
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
          // On brand‐new query, restart from the initial blank‐search stats
          mergedFacetStats = { ...initialFacetStats, ...newFacetStats };
          setFixedFacetStats(mergedFacetStats);
          setLastQueryText(state.query);
        } else {
          // Otherwise, overlay new stats on top of existing fixed stats
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

  const searchBasic = useCallback(() => {
    performSearch({ enableFacets: false });
  }, [performSearch]);

  const searchWithFacets = useMemo(
    () => debounce(() => performSearch({ enableFacets: true }), state.debounceDelayMillis ?? 50),
    [performSearch, state.debounceDelayMillis]
  );

  useEffect(() => {
    const trimmedQuery = state.query.trim();
    const isFirstLoad = lastQueryText === '' && trimmedQuery === '';
    const isEmptySearch = trimmedQuery === '' && allowEmptySearch;

    if (isFirstLoad || isEmptySearch) {
      searchWithFacets.cancel?.();
      performSearch({ enableFacets: facetsEnabled });
    } else {
      if (facetsEnabled) {
        searchBasic();
        searchWithFacets();
      } else {
        performSearch({ enableFacets: false });
      }
    }

    return () => {
      searchWithFacets.cancel?.();
    };
  }, [
    state.query,
    state.filters,
    state.rangeFilters,
    allowEmptySearch,
    lastQueryText,
    searchBasic,
    searchWithFacets,
    performSearch,
    facetsEnabled,
  ]);

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

        setInitialFacetStats(newFacetStats);

        // Extract facet keys for non-coverage fallback (if needed)
        const extractedFacetKeys: Record<string, string[]> = {};
        if (blankSearchData.facets) {
          for (const [field, values] of Object.entries(blankSearchData.facets)) {
            if (Array.isArray(values)) {
              extractedFacetKeys[field] = (values as any[]).map(v => v.key);
            }
          }
        }
        setInitialFacetKeys(extractedFacetKeys);

        // Set initial global rangeBounds and facetStats
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