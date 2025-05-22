'use client';

import { SearchProvider, SearchInput, SearchResults, FilterPanel } from 'indx-intrface';

export function SearchClient({ dataset }: { dataset: string }) {
  const url = process.env.NEXT_PUBLIC_INDX_URL!;
  const email = process.env.NEXT_PUBLIC_INDX_EMAIL!;
  const password = process.env.NEXT_PUBLIC_INDX_PASSWORD!;
  return (
    <SearchProvider url={url} email={email} password={password} dataset={dataset}>
      <SearchUI />
    </SearchProvider>
  );
}

function SearchUI() {
  return (
    <div style={{ padding: '2rem' }}>
      <SearchInput
        placeholder="Search..."
        className="search-input"
        style={{ padding: '0.5rem', width: '100%', maxWidth: '300px' }}
      />
      <FilterPanel field="speed" filterType="range" displayType='slider' />
      <FilterPanel field="speed" filterType="value" />
      <SearchResults
        fields={['name', 'type1', 'type2', 'hp', 'speed']}
        customLabels={{
          name: '',
          type1: 'Primary Type: ',
          type2: 'Secondary Type: ',
          hp: 'HP: ',
          speed: 'Speed: '
        }}
      />
    </div> 
  );
}