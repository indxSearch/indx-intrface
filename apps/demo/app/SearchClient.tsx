// apps/demo/app/SearchClient.tsx
'use client';

import { SearchProvider, useSearch } from 'indx-intrface';

export function SearchClient({ email, password }: { email: string; password: string }) {
  return (
    <SearchProvider email={email} password={password}>
      <SearchUI />
    </SearchProvider>
  );
}

function SearchUI() {
  const { state: { query, isLoading, results, facets }, setQuery } = useSearch();

  return (
    <div style={{ padding: '2rem' }}>
      <input
        type="text"
        value={query}
        onChange={e => setQuery(e.target.value)}
        placeholder="Search..."
        style={{ padding: '0.5rem', width: '100%', maxWidth: '300px' }}
      />
      {isLoading && <p>Loading...</p>}
      {results && (
        <ul>
          {results.map((doc: any, index: number) => (
            <li key={index}>{doc.title || JSON.stringify(doc)}</li>
          ))}
        </ul>
      )}
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
      )}
    </div>
  );
}