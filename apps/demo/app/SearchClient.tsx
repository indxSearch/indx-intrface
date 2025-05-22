'use client';

import { SearchProvider, useSearch, SearchInput, SearchResults } from 'indx-intrface';

export function SearchClient({ email, password }: { email: string; password: string }) {
  return (
    <SearchProvider email={email} password={password}>
      <SearchUI />
    </SearchProvider>
  );
}

function SearchUI() {
  const { isLoading, results, facets } = useSearch().state;

  return (
    <div style={{ padding: '2rem' }}>
      <SearchInput
        placeholder="Search..."
        className="search-input"
        style={{ padding: '0.5rem', width: '100%', maxWidth: '300px' }}
      />
      {isLoading && <p>Loading...</p>}
      <SearchResults
        fields={['name', 'type1', 'type2', 'hp']}
        customLabels={{
          name: '',
          type1: 'Primary Type: ',
          type2: 'Secondary Type: ',
          hp: 'HP: ',
        }}
      />
      {/* 
      {facets && typeof facets === 'object' && (
        <div style={{ marginTop: '2rem' }}>
          <h3>Facets</h3>
          {Object.entries(facets).map(([facetName, values]) => {
            if (!Array.isArray(values)) return null;
            return (
              <div key={facetName}>
                <strong>{facetName}</strong>
                <ul>
                  {values.map((v: any, i: number) => (
                    <li key={i}>
                      {v.key}: {v.value}
                    </li>
                  ))}
                </ul>
              </div>
            );
          })}
        </div>
      )} */}
    </div> 
  );
}