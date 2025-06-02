'use client';
import React, { useEffect, useState } from 'react';
import '@indxsearch/intrface/styles.css';
import { SearchProvider, SearchInput, SearchResults, RangeFilterPanel, ValueFilterPanel, ActiveFiltersPanel, SortByPanel } from '@indxsearch/intrface';

export function SearchClient({ dataset }: { dataset: string }) {
  const url = process.env.NEXT_PUBLIC_INDX_URL!;
  const email = process.env.NEXT_PUBLIC_INDX_EMAIL!;
  const password = process.env.NEXT_PUBLIC_INDX_PASSWORD!;
  return (
    <SearchProvider url={url} email={email} password={password} dataset={dataset} allowEmptySearch={true} maxResults={20}>
      <SearchUI />
    </SearchProvider>
  );
}

function SearchUI() {

  /* SYSTEM THEME */
  const [theme, setTheme] = useState<'light' | 'dark'>('light');
  useEffect(() => {
    const systemDark = window.matchMedia('(prefers-color-scheme: dark)');
    const updateTheme = () => {
      setTheme(systemDark.matches ? 'dark' : 'light');
    };
    updateTheme(); // set initially
    systemDark.addEventListener('change', updateTheme);
    return () => {
      systemDark.removeEventListener('change', updateTheme);
    };
  }, []);

  return (
    <div className={theme} style={{ padding: '30px', width: '100%', display: 'flex', justifyContent: 'center' }}>
      <div style={{ width: '40%', paddingRight: '1rem', marginBottom: '30px' }}>
        <div style={{ marginBottom: '30px' }}>
        <SearchInput
          // inputSize='large'
          placeholder="Type to search"
          className="search-input"
          style={{ padding: '0.5rem', width: '100%', maxWidth: '600px' }}
        />
        </div>
        <SearchResults
          fields={['name', 'is_legendary', 'type1', 'type2', 'hp', 'speed', 'attack', 'abilities']}
          customLabels={{
            name: '',
            is_legendary: 'Legendary: ',
            type1: 'Primary Type: ',
            type2: 'Secondary Type: ',
            hp: 'HP: ',
            speed: 'Speed: ',
            attack: 'Attack: ',
            abilities: 'Abilities: '
          }}
        />
      </div>
      <div style={{ width: '30%', maxWidth: '400px' }}>
        <ActiveFiltersPanel />
        <SortByPanel displayType='radio' collapsible={false} />
        <SortByPanel startCollapsed={true}/>
        <RangeFilterPanel label="Speed" field="speed" displayType="input" />
        <ValueFilterPanel label="Primary type" layout='grid' field="type1" preserveBlankFacetState={true} displayType='button' />
        <ValueFilterPanel label="Legendary" field="is_legendary" preserveBlankFacetState={true} displayType='toggle' />
        <ValueFilterPanel label="Speed" field="speed" displayType='button' collapsible={false}/>
        <ValueFilterPanel label="Attack" field="attack" layout='grid' startCollapsed={true} />
        <ValueFilterPanel label="HP" startCollapsed={true} field="hp" />
      </div>
    </div>
  );
}