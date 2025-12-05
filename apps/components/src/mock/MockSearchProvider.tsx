
import React, { createContext, useContext, useState, ReactNode } from 'react';

// Mock search context type matching the real useSearchContext
type MockSearchContextType = {
  state: {
    query: string;
    results: any[] | null;
    isLoading: boolean;
    error: string | null;
    resultsSuppressed: boolean;
    filters: Record<string, string[]>;
    rangeFilters: Record<string, { min: number; max: number }>;
    sortBy: string | null;
    sortAscending: boolean;
    facets: Record<string, Array<{ key: string; value: number }>>;
    facetStats: Record<string, { min: number; max: number }>;
    filterableFields: string[];
    facetableFields: string[];
    sortableFields: string[];
  };
  setQuery: (query: string) => void;
  toggleFilter: (field: string, value: string) => void;
  setFilter: (field: string, values: string[]) => void;
  setRangeFilter: (field: string, min: number, max: number) => void;
  resetFilters: () => void;
  resetSingleFilter: (field: string, value?: string) => void;
  setSort: (field: string | null, ascending: boolean) => void;
  isFetchingInitial: boolean;
  allowEmptySearch: boolean;
  rangeBounds: Record<string, { min: number; max: number }>;
};

const MockSearchContext = createContext<MockSearchContextType | undefined>(undefined);

export function useMockSearchContext() {
  const context = useContext(MockSearchContext);
  if (!context) {
    throw new Error('useMockSearchContext must be used within MockSearchProvider');
  }
  return context;
}

// Export as useSearchContext for compatibility with intrface components
export const useSearchContext = useMockSearchContext;

// Generate dummy facet data
const generateFacets = () => ({
  type: [
    { key: 'water', value: 45 },
    { key: 'fire', value: 32 },
    { key: 'grass', value: 28 },
    { key: 'electric', value: 15 },
    { key: 'psychic', value: 12 },
    { key: 'dragon', value: 8 },
  ],
  rarity: [
    { key: 'common', value: 85 },
    { key: 'uncommon', value: 42 },
    { key: 'rare', value: 18 },
    { key: 'legendary', value: 5 },
  ],
  generation: [
    { key: '1', value: 151 },
    { key: '2', value: 100 },
    { key: '3', value: 135 },
    { key: '4', value: 107 },
  ],
});

export function MockSearchProvider({ children }: { children: ReactNode }) {
  const [query, setQuery] = useState('pikachu');
  const [filters, setFilters] = useState<Record<string, string[]>>({});
  const [rangeFilters, setRangeFiltersState] = useState<Record<string, { min: number; max: number }>>({});
  const [sortBy, setSortBy] = useState<string | null>(null);
  const [sortAscending, setSortAscending] = useState(true);

  const toggleFilter = (field: string, value: string) => {
    setFilters((prev) => {
      const currentValues = prev[field] || [];
      const isSelected = currentValues.includes(value);

      if (isSelected) {
        const newValues = currentValues.filter((v) => v !== value);
        if (newValues.length === 0) {
          const { [field]: _, ...rest } = prev;
          return rest;
        }
        return { ...prev, [field]: newValues };
      } else {
        return { ...prev, [field]: [...currentValues, value] };
      }
    });
  };

  const setFilter = (field: string, values: string[]) => {
    setFilters((prev) => {
      if (values.length === 0) {
        const { [field]: _, ...rest } = prev;
        return rest;
      }
      return { ...prev, [field]: values };
    });
  };

  const setRangeFilter = (field: string, min: number, max: number) => {
    setRangeFiltersState((prev) => ({
      ...prev,
      [field]: { min, max },
    }));
  };

  const resetFilters = () => {
    setFilters({});
    setRangeFiltersState({});
  };

  const resetSingleFilter = (field: string, value?: string) => {
    if (value !== undefined) {
      toggleFilter(field, value);
    } else {
      setRangeFiltersState((prev) => {
        const { [field]: _, ...rest } = prev;
        return rest;
      });
    }
  };

  const setSort = (field: string | null, ascending: boolean) => {
    setSortBy(field);
    setSortAscending(ascending);
  };

  const value: MockSearchContextType = {
    state: {
      query,
      results: null,
      isLoading: false,
      error: null,
      resultsSuppressed: false,
      filters,
      rangeFilters,
      sortBy,
      sortAscending,
      facets: generateFacets(),
      facetStats: {
        hp: { min: 10, max: 250 },
        attack: { min: 5, max: 190 },
        defense: { min: 5, max: 230 },
        speed: { min: 5, max: 200 },
      },
      filterableFields: ['type', 'rarity', 'generation', 'hp', 'attack', 'defense', 'speed'],
      facetableFields: ['type', 'rarity', 'generation', 'hp', 'attack', 'defense', 'speed'],
      sortableFields: ['name', 'hp', 'attack', 'defense', 'speed'],
    },
    setQuery,
    toggleFilter,
    setFilter,
    setRangeFilter,
    resetFilters,
    resetSingleFilter,
    setSort,
    isFetchingInitial: false,
    allowEmptySearch: true,
    rangeBounds: {
      hp: { min: 10, max: 250 },
      attack: { min: 5, max: 190 },
      defense: { min: 5, max: 230 },
      speed: { min: 5, max: 200 },
    },
  };

  return (
    <MockSearchContext.Provider value={value}>
      {children}
    </MockSearchContext.Provider>
  );
}
