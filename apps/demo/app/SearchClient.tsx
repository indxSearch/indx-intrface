'use client';

import { SearchProvider, SearchInput, SearchResults, RangeFilterPanel, ValueFilterPanel } from 'indx-intrface';

export function SearchClient({ dataset }: { dataset: string }) {
  const url = process.env.NEXT_PUBLIC_INDX_URL!;
  const email = process.env.NEXT_PUBLIC_INDX_EMAIL!;
  const password = process.env.NEXT_PUBLIC_INDX_PASSWORD!;
  return (
    <SearchProvider url={url} email={email} password={password} dataset={dataset} allowEmptySearch={true}>
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
          fields={['name', 'type1', 'type2', 'hp', 'speed', 'attack', 'abilities']}
          customLabels={{
            name: '',
            type1: 'Primary Type: ',
            type2: 'Secondary Type: ',
            hp: 'HP: ',
            speed: 'Speed: ',
            attack: 'Attack: ',
            abilities: 'Abilities: '
          }}
        />
      </div>
      <div style={{ width: '40%' }}>
        <RangeFilterPanel label="speed" field="speed" displayType="input" />
        <ValueFilterPanel label="primary type" field="type1" preserveBlankFacetState={true} />
        <ValueFilterPanel label="speed" field="speed" />
        <ValueFilterPanel label="attack" field="attack" />
        <ValueFilterPanel label="hp" field="hp" />
      </div>
    </div>
  );
}