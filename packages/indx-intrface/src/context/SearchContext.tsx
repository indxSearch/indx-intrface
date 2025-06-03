import React, { createContext, useContext, useState, useCallback, useMemo, useEffect } from 'react';

export interface SearchState {
  query: string;
  results: any[] | null;
  isLoading: boolean;
  debounceDelayMillis?: number;
  error?: string;
  facets?: any | null;
  filterableFields?: string[];
  facetableFields?: string[];
  sortableFields?: string[]; // Optional: list of fields that can be used for sorting
  filters: Record<string, string[]>;
  rangeFilters: Record<string, { min: number; max: number }>;
  facetStats?: Record<string, { min: number; max: number }>; // live
  rangeBounds?: Record<string, { min: number; max: number }>; // init only
  sortBy?: string;
  sortAscending?: boolean;
}

export interface SearchContextType {
  state: SearchState;
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
  debounceDelayMillis = 100 ,
  enableFacets = true
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

  const [token, setToken] = useState<string | null>(null); // Holds the authentication token after login
  const [facetsEnabled] = useState(enableFacets);; // Controls whether to enable facets in the search query (currently always true)
  const [filterableFields, setFilterableFields] = useState<string[]>([]); // Stores list of fields that can be used for value filtering
  const [facetableFields, setFacetableFields] = useState<string[]>([]); // Stores list of fields that can return facet histograms
  const [sortableFields, setSortableFields] = useState<string[]>([]); // Stores list of fields that can be used for sorting

  const [initialFacetStats, setInitialFacetStats] = useState<Record<string, { min: number; max: number }>>({}); // Stores min/max values for each faceted field from the initial blank search
  const [initialFacetKeys, setInitialFacetKeys] = useState<Record<string, string[]>>({}); // Stores list of facet keys (strings) from the initial blank search. Used later for non-coverage hits
  const [fixedFacetStats, setFixedFacetStats] = useState<Record<string, { min: number; max: number }>>({}); // Tracks fixed facet stats that remain stable until query changes
  const [lastQueryText, setLastQueryText] = useState<string>(''); // Caches the previous query string to detect changes
  const [rangeBounds, setRangeBounds] = useState<Record<string, { min: number; max: number }>>({}); // Remembers range slider bounds from the initial or recent searches
  const [lastValueFilters, setLastValueFilters] = useState<Record<string, string[]>>({}); // Stores previous value filters to detect when they change

  const setQuery = useCallback((query: string) => {
    setState(prev => ({
      ...prev,
      query,
      filters: {}, // reset value filters
      rangeFilters: {}, // reset range filters
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
      // clone the filters map
      const updatedFilters = { ...prev.filters };
      const currentValues = updatedFilters[field] || [];

      // add or remove the value
      const newValues = currentValues.includes(value)
        ? currentValues.filter(v => v !== value)
        : [...currentValues, value];

      if (newValues.length) {
        // still have some selected values → keep the key
        updatedFilters[field] = newValues;
      } else {
        // array is now empty → drop the key entirely
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
      }
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
        body: JSON.stringify({
          A: current,
          B: filters[i],
          useAndOperation: true
        }),
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

  const performSearch = useCallback(async ({ enableFacets }: { enableFacets: boolean }) => {
    if (!token) return;
    setState(prev => ({ ...prev, isLoading: true }));

    try {
      let filterProxy: any = null;

      const filterEntries = Object.entries(state.filters ?? {});
      const valueFilterResponsesNested: any[][] = await Promise.all(
        filterEntries.map(async ([field, values]) =>
          await Promise.all(
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

      const allFilters = [...valueFilterResponses, ...rangeFilterResponses].filter(
        f => f && typeof f.hashString === 'string'
      );
      filterProxy = await combineFilters(allFilters, url, dataset, token);

      const searchBody = {
        text: state.query,
        maxNumberOfRecordsToReturn: maxResults,
        ...(filterProxy ? { filter: filterProxy } : {}),
        ...(enableFacets ? { enableFacets: true } : {}),
        ...(state.sortBy ? { sortBy: state.sortBy } : {}),
        ...(state.sortAscending !== undefined ? { sortAscending: state.sortAscending } : {}),
      };

      const searchResponse = await fetch(`${url}/api/Search/${dataset}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(searchBody),
      });

      const searchData = await searchResponse.json();
      const keys = (searchData.records || []).map((record: any) => record.documentKey);

      const jsonResponse = await fetch(`${url}/api/GetJson/${dataset}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(keys),
      });

      const documents = await jsonResponse.json();

      // Only process facet data if enabled
      let newFacetStats: Record<string, { min: number; max: number }> = {};
      let mergedFacetStats = state.facetStats ?? {};
      let displayFacets: any = undefined;

      if (enableFacets) {
        if (searchData.facets) {
          for (const [field, values] of Object.entries(searchData.facets)) {
            if (Array.isArray(values) && values.length > 0) {
              const numericValues = values
                .map((v: any) => Number(v.key))
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

        const queryChanged = state.query !== lastQueryText;
        const valueFiltersChanged = JSON.stringify(state.filters) !== JSON.stringify(lastValueFilters);

        if (queryChanged) {
          mergedFacetStats = { ...initialFacetStats, ...newFacetStats };
          setFixedFacetStats(mergedFacetStats);
          setLastQueryText(state.query);
        } else {
          mergedFacetStats = { ...fixedFacetStats, ...newFacetStats };
        }

        if (queryChanged || valueFiltersChanged) {
          const updatedBounds = { ...rangeBounds };
          for (const [field, stats] of Object.entries(newFacetStats)) {
            updatedBounds[field] = stats;
          }
          setRangeBounds(updatedBounds);
          setLastValueFilters(state.filters);
        }

        const currentFacets = searchData.facets;
        displayFacets = currentFacets;

        if (!currentFacets || Object.keys(currentFacets).length === 0) {
          displayFacets = {};
          for (const [field, keys] of Object.entries(initialFacetKeys)) {
            displayFacets[field] = keys.map(key => ({ key, value: null }));
          }
        }
      }

      // Final state update
      setState(prev => ({
        ...prev,
        results: documents,
        ...(enableFacets ? {
          facets: displayFacets,
          facetStats: mergedFacetStats,
        } : {}),
        isLoading: false,
      }));

    } catch (error) {
      console.error('Search failed:', error);
      setState(prev => ({
        ...prev,
        results: null,
        isLoading: false,
      }));
    }
  }, [
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
    lastValueFilters,
    rangeBounds,
    initialFacetKeys
  ]);
  
  const searchBasic = useCallback(() => {
    performSearch({ enableFacets: false });
  }, [performSearch]);

  const searchWithFacets = useMemo(
    () => debounce(() => performSearch({ enableFacets: true }), state.debounceDelayMillis ?? 50),
    [performSearch, state.debounceDelayMillis]
  );

  const setSort = useCallback((field: string | null, ascending: boolean) => {
    setState(prev => ({
      ...prev,
      sortBy: field || undefined,
      sortAscending: field ? ascending : undefined,
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
  ]);

  React.useEffect(() => {
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

        // fetch filterable, facetable and sortable fields
        const [filterableRes, facetableRes, sortableRes] = await Promise.all([
          fetch(`${url}/api/GetFilterableFields/${dataset}`, {
            method: 'GET',
            headers: {
              'accept': 'text/plain',
              'Authorization': `Bearer ${data.token}`,
            },
          }),
          fetch(`${url}/api/GetFacetableFields/${dataset}`, {
            method: 'GET',
            headers: {
              'accept': 'text/plain',
              'Authorization': `Bearer ${data.token}`,
            },
          }),
          fetch(`${url}/api/GetSortableFields/${dataset}`, {
            method: 'GET',
            headers: {
              'accept': 'text/plain',
              'Authorization': `Bearer ${data.token}`,
            },
          }),
        ]);

        const filterable = await filterableRes.json();
        const facetable = await facetableRes.json();
        const sortable = await sortableRes.json();

        setFilterableFields(filterable || []);
        setFacetableFields(facetable || []);
        setSortableFields(sortable || []);

        const blankSearchResponse = await fetch(`${url}/api/Search/${dataset}`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${data.token}`,
          },
          body: JSON.stringify({
            text: '',
            maxNumberOfRecordsToReturn: 0,
            enableFacets: true,
            ...(state.sortBy ? { sortBy: state.sortBy } : {}),
            ...(state.sortAscending !== undefined ? { sortAscending: state.sortAscending } : {}),
          }),
        });

        const blankSearchData = await blankSearchResponse.json();
        const newFacetStats: Record<string, { min: number; max: number }> = {};

        if (blankSearchData.facets) {
          for (const [field, values] of Object.entries(blankSearchData.facets)) {
            if (Array.isArray(values) && values.length > 0) {
              const numericValues = values
                .map((v: any) => Number(v.key))
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
        const extractedFacetKeys: Record<string, string[]> = {};
        if (blankSearchData.facets) {
          for (const [field, values] of Object.entries(blankSearchData.facets)) {
            if (Array.isArray(values)) {
              extractedFacetKeys[field] = values.map((v: any) => v.key);
            }
          }
        }
        setInitialFacetKeys(extractedFacetKeys);

        setRangeBounds(newFacetStats);
        setState(prev => ({
          ...prev,
          facetStats: newFacetStats,
        }));
      } catch (err) {
        console.error('Login failed:', err);
      }
    };

    login();
  }, [email, password, url, dataset]);

  return (
    <>
      <SearchContext.Provider
        value={{
          state: {
            ...state,
            filterableFields,
            facetableFields,
            sortableFields,
            rangeBounds,
          },
          setQuery,
          toggleFilter,
          setRangeFilter,
          resetFilters,
          resetSingleFilter,
          setSort,
          setDebounceDelay
        }}
      >
        {children}
      </SearchContext.Provider>
    </>
  );
};

export const useSearchContext = () => {
  const context = useContext(SearchContext);
  if (!context) {
    throw new Error('useSearchContext must be used within a SearchProvider');
  }
  return context;
};