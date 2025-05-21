import React, { createContext, useContext, useState, useCallback } from 'react';

export interface SearchState {
  query: string;
  results: any[] | null;
  isLoading: boolean;
  error?: string;
  facets?: any | null;
}

export interface SearchContextType {
  state: SearchState;
  setQuery: (query: string) => void;
}

const SearchContext = createContext<SearchContextType | undefined>(undefined);

export const SearchProvider: React.FC<{ children: React.ReactNode; email: string; password: string }> = ({ children, email, password }) => {
  const [state, setState] = useState<SearchState>({
    query: '',
    results: null,
    isLoading: false,
  });

  const [token, setToken] = useState<string | null>(null);

  const [showFacets] = useState(true);

  const setQuery = useCallback((query: string) => {
    setState(prev => ({ ...prev, query }));
  }, []);

  const search = useCallback(async () => {
    if (!token) return;

    setState(prev => ({ ...prev, isLoading: true }));

    try {
      const searchResponse = await fetch('http://localhost:38171/api/Search/pokedex', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          text: state.query,
          maxNumberOfRecordsToReturn: 10,
          ...(showFacets ? { enableFacets: true } : {})
        }),
      });

      const searchData = await searchResponse.json();

      const keys = (searchData.records || []).map((record: any) => record.documentKey);

      const jsonResponse = await fetch('http://localhost:38171/api/GetJson/pokedex', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(keys),
      });

      const documents = await jsonResponse.json();

      setState(prev => ({
        ...prev,
        results: documents,
        facets: searchData.facets || null,
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
  }, [state.query, token, showFacets]);

  React.useEffect(() => {
    if (state.query.trim()) {
      search();
    } else {
      setState(prev => ({ ...prev, results: null }));
    }
  }, [state.query, search]);

  React.useEffect(() => {
    const login = async () => {
      try {
        if (!email || !password) {
          throw new Error('Missing email or password in props');
        }

        const response = await fetch(
          `http://localhost:38171/api/Login?userEmail=${encodeURIComponent(email)}&userPassWord=${encodeURIComponent(password)}`,
          {
            method: 'POST',
            headers: { accept: '*/*' },
            body: '',
          }
        );

        const data = await response.json();
        console.log('Token:', data.token);
        setToken(data.token);
      } catch (err) {
        console.error('Login failed:', err);
      }
    };

    login();
  }, [email, password]);

  return (
    <>
      <SearchContext.Provider
        value={{
          state,
          setQuery,
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