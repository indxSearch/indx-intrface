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
    <div style={{ padding: '2rem', width: '100%', display: 'flex' }}>
      <div style={{ width: '60%', paddingRight: '1rem' }}>
        <SearchInput
          placeholder="Search..."
          className="search-input"
          style={{ padding: '0.5rem', width: '100%', maxWidth: '300px' }}
        />
        <SearchResults
          fields={['name', 'type1', 'type2', 'hp', 'speed', 'attack']}
          customLabels={{
            name: '',
            type1: 'Primary Type: ',
            type2: 'Secondary Type: ',
            hp: 'HP: ',
            speed: 'Speed: ',
            attack: 'Attack: '
          }}
        />
      </div>
      <div style={{ width: '40%' }}>
        {/* <FilterPanel label="speed" field="speed" filterType="range" displayType="slider" /> */}
        <FilterPanel label="speed" field="speed" filterType="value" displayType="checkbox" />
        <FilterPanel label="attack" field="attack" filterType="value" displayType="checkbox" />
        <FilterPanel label="hp" field="hp" filterType="value" displayType="checkbox" />
        <FilterPanel label="primary type" field="type1" filterType="value" displayType="checkbox" />
      </div>
    </div>
  );
}