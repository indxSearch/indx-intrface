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

  const Tag: React.FC<{ children: React.ReactNode }> = ({ children }) => (
    <span>{children}</span>
  );

  return (
    <div className={theme} style={{ padding: '30px', width: '100%', display: 'flex', justifyContent: 'center' }}>
      <div style={{ width: '60%', paddingRight: '1rem', marginBottom: '30px' }}>
        <div style={{ marginBottom: '30px', padding: '5px' }}>
          <SearchInput
            // inputSize='large'
            placeholder="Type to search"
            className="search-input"
            style={{ padding: '0.5rem', width: '100%' }}
          />
        </div>

        <SearchResults
          fields={[
            'name',
            'is_legendary',
            'type1',
            'type2',
            'hp',
            'speed',
            'attack',
            'abilities'
          ]}
        >
          {(item: Record<string, any>) => {
            const {
              name,
              is_legendary,
              type1,
              type2,
              hp,
              speed,
              attack,
              abilities
            } = item;

            return (
              <div>
                <h2>
                  {name} {is_legendary ? '✨' : ''}  {type1 && <Tag>{type1}</Tag>} {type2 && <Tag>{type2}</Tag>}
                </h2>

                {Array.isArray(abilities) && abilities.length > 0 && (
                  <div>
                    Abilities:{' '}
                    {abilities.map((ability: string, idx: number) => (
                      <Tag key={`${ability}-${idx}`}>{ability}</Tag>
                    ))}
                  </div>
                )}

                <div>
                  Stats:{' '}
                  {typeof hp === 'number' && <Tag>HP: {hp}</Tag>}
                  {typeof speed === 'number' && <Tag>Speed: {speed}</Tag>}
                  {typeof attack === 'number' && <Tag>Attack: {attack}</Tag>}
                </div>
              </div>
            );
          }}
        </SearchResults>

      </div>

      <div style={{ width: '30%', maxWidth: '400px' }}>

        <ActiveFiltersPanel />
        <SortByPanel displayType='radio' collapsible={false} />
        <SortByPanel startCollapsed={true}/>
        <RangeFilterPanel label="Speed" field="speed" displayType="input" />
        <ValueFilterPanel label="Primary type" layout='grid' field="type1" preserveBlankFacetState={true} preserveBlankFacetStateOrder={false} sortFacetsBy='alphabetical' displayType='button' />
        <ValueFilterPanel label="Secondary type" field="type2" startCollapsed={true} displayType='button' layout='grid' showCount={false} sortFacetsBy='alphabetical' />
        <ValueFilterPanel label="Legendary ✨" field="is_legendary" preserveBlankFacetState={true} displayType='toggle' />
        <ValueFilterPanel label="Speed" field="speed" displayType='button' preserveBlankFacetStateOrder={false} sortFacetsBy='numeric' collapsible={false}/>
        <ValueFilterPanel label="Attack" field="attack" layout='grid' startCollapsed={true} showCount={true} />
        <ValueFilterPanel label="HP" startCollapsed={true} field="hp" />
     
      </div>
    </div>
  );
}