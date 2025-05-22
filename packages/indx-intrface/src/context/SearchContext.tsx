import React, { createContext, useContext, useState, useCallback } from 'react';

export interface SearchState {
  query: string;
  results: any[] | null;
  isLoading: boolean;
  error?: string;
  facets?: any | null;
  filterableFields?: string[];
  facetableFields?: string[];
  filters: Record<string, string[]>;
  rangeFilters: Record<string, { min: number; max: number }>;
  facetStats?: Record<string, { min: number; max: number }>;
  rangeBounds?: Record<string, { min: number; max: number }>;
}

export interface SearchContextType {
  state: SearchState;
  setQuery: (query: string) => void;
  toggleFilter: (field: string, value: string) => void;
  setRangeFilter: (field: string, min: number, max: number) => void;
}

const SearchContext = createContext<SearchContextType | undefined>(undefined);

export const SearchProvider: React.FC<{ children: React.ReactNode; email: string; password: string; url: string; dataset: string }> = ({ children, email, password, url, dataset }) => {
  const [state, setState] = useState<SearchState>({
    query: '',
    results: null,
    isLoading: false,
    filters: {},
    rangeFilters: {},
    facetStats: {},
  });
  const [initialFacetStats, setInitialFacetStats] = useState<Record<string, { min: number; max: number }>>({});
  const [fixedFacetStats, setFixedFacetStats] = useState<Record<string, { min: number; max: number }>>({});
  const [lastQueryText, setLastQueryText] = useState<string>('');
  const [rangeBounds, setRangeBounds] = useState<Record<string, { min: number; max: number }>>({});
  const [lastValueFilters, setLastValueFilters] = useState<Record<string, string[]>>({});

  const setRangeFilter = useCallback((field: string, min: number, max: number) => {
    console.log(`setRangeFilter for field: ${field}, min: ${min}, max: ${max}`);
    setState(prev => ({
      ...prev,
      rangeFilters: {
        ...prev.rangeFilters,
        [field]: { min, max },
      }
    }));
  }, []);

  const [token, setToken] = useState<string | null>(null);

  const [showFacets] = useState(true);

  const [filterableFields, setFilterableFields] = useState<string[]>([]);
  const [facetableFields, setFacetableFields] = useState<string[]>([]);

  const setQuery = useCallback((query: string) => {
    setState(prev => ({
      ...prev,
      query,
      filters: {}, // reset value filters
      rangeFilters: {}, // reset range filters
    }));
  }, []);

  const toggleFilter = useCallback((field: string, value: string) => {
    setState(prev => {
      const currentValues = prev.filters?.[field] || [];
      const updatedValues = currentValues.includes(value)
        ? currentValues.filter(v => v !== value)
        : [...currentValues, value];
      return {
        ...prev,
        filters: {
          ...prev.filters,
          [field]: updatedValues,
        }
      };
    });
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
          AndMode: true,
        }),
      });

      if (!response.ok) {
        const err = await response.json();
        console.error('CombineFilters failed:', err);
        throw new Error('CombineFilters failed');
      }

      current = await response.json();
      // Add logging to inspect the output of the CombineFilters call
      console.log('Intermediate combined filter result:', current);
    }

    return current;
  }

  const search = useCallback(async () => {
    if (!token) return;

    console.log('Triggering search...');

    setState(prev => ({ ...prev, isLoading: true }));

    try {
      let filterProxy: any = null;

      const filterEntries = Object.entries(state.filters ?? {});
      // For each field, create a value filter for each value; flatten all into a single array
      const valueFilterResponsesNested: any[][] = await Promise.all(
        filterEntries.map(async ([field, values]) => {
          return await Promise.all(
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
          );
        })
      );
      const valueFilterResponses = valueFilterResponsesNested.flat();

      // Range filter logic
      const rangeFilterEntries = Object.entries(state.rangeFilters ?? {});
      console.log('Applying range filters:', JSON.stringify(state.rangeFilters, null, 2));
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

      // Combine value and range filters, validating filter objects
      const allFilters = [...valueFilterResponses, ...rangeFilterResponses].filter(
        f => f && typeof f.hashString === 'string'
      );

      // Debug log to verify filters being passed into combineFilters
      console.log('🧪 All filters being combined:', JSON.stringify(allFilters, null, 2));

      if (allFilters.length === 0) {
        console.log('No valid filters found.');
      }

      filterProxy = await combineFilters(allFilters, url, dataset, token);

      // Log filterProxy before search
      console.log('Sending search filterProxy:', filterProxy);

      const searchResponse = await fetch(`${url}/api/Search/${dataset}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          text: state.query,
          maxNumberOfRecordsToReturn: 10,
          ...(filterProxy ? { filter: filterProxy } : {}),
          ...(showFacets ? { enableFacets: true } : {}),
        }),
      });
      console.log('Final search body:', {
        text: state.query,
        filter: filterProxy,
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

      // Calculate facetStats for this search
      let newFacetStats: Record<string, { min: number; max: number }> = {};
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

      // Determine if query has changed
      const queryChanged = state.query !== lastQueryText;
      const valueFiltersChanged = JSON.stringify(state.filters) !== JSON.stringify(lastValueFilters);

      let mergedFacetStats: Record<string, { min: number; max: number }>;

      if (queryChanged) {
        // When query changes, update fixedFacetStats and lastQueryText
        mergedFacetStats = { ...initialFacetStats, ...newFacetStats };
        setFixedFacetStats(mergedFacetStats);
        setLastQueryText(state.query);
      } else {
        // Always use fixedFacetStats if query hasn't changed
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

      setState(prev => ({
        ...prev,
        results: documents,
        facets: searchData.facets || null,
        facetStats: mergedFacetStats,
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
  }, [state.query, state.filters, state.rangeFilters, token, showFacets, url, dataset, initialFacetStats, fixedFacetStats, lastQueryText, lastValueFilters, rangeBounds]);

  React.useEffect(() => {
    if (state.query.trim()) {
      search();
    } else {
      setState(prev => ({ ...prev, results: null }));
    }
  }, [state.query, state.filters, state.rangeFilters, search]);

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

        // fetch filterable and facetable fields
        const [filterableRes, facetableRes] = await Promise.all([
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
        ]);

        const filterable = await filterableRes.json();
        const facetable = await facetableRes.json();

        setFilterableFields(filterable || []);
        setFacetableFields(facetable || []);

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
            rangeBounds,
          },
          setQuery,
          toggleFilter,
          setRangeFilter,
        }}
      >
        {children}
      </SearchContext.Provider>
      {state.facets && typeof state.facets === 'object' && (
        <>
          {Object.entries(state.facets).map(([facetName, values]) => {
            if (!Array.isArray(values)) return null;
            return (
              <div key={facetName}>
                <strong>{facetName}</strong>
                <ul>
                  {values.map((v, i) => (
                    <li key={i}>
                      {v.key}: {v.value}
                    </li>
                  ))}
                </ul>
              </div>
            );
          })}
        </>
      )}
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