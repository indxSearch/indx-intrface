'use client';
import React, { useEffect, useState } from 'react';
import '@indxsearch/intrface/styles.css';
import styles from './SearchClient.module.css';
import { Indx, Spark } from '@indxsearch/pixl';
import { Base } from '@indxsearch/systm';
import { SearchProvider, SearchInput, SearchResults, RangeFilterPanel, ValueFilterPanel, ActiveFiltersPanel, SortByPanel } from '@indxsearch/intrface';

export function SearchClient({ dataset }: { dataset: string }) {
  const url = process.env.NEXT_PUBLIC_INDX_URL!;
  const email = process.env.NEXT_PUBLIC_INDX_EMAIL!;
  const password = process.env.NEXT_PUBLIC_INDX_PASSWORD!;
  return (
    <SearchProvider url={url} email={email} password={password} dataset={dataset} allowEmptySearch={true} enableFacets={true} maxResults={20} debounceDelayMillis={250}>
      <SearchUI dataset={dataset} showFilters={true} />
    </SearchProvider>
  );
}

function SearchUI({ dataset, showFilters = true }: { dataset: string, showFilters?: boolean }) {
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
    <div className={theme}>
      <div className={styles.wrapper}>
        <Base className={styles.component}>
          <div className={styles.header}>
            <SearchInput
              placeholder="Type to search"
              className={styles.searchInput}
            />
            <div id={styles.meta}>
              <div className={styles.metafields}>
                <div className={styles.description}>INDX SEARCH SYSTEM</div>
                <div className={styles.metainfo}>Dataset: {dataset}</div>
              </div>
              <Indx size={35} color="var(--icon-color)"/>
            </div>
          </div>
          <div className={styles.body}>
            <div className={styles.results}>
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
                      <h2 style={{display: 'flex', alignItems: 'center', gap: '10px'}}>
                        {name} {is_legendary ? <Spark color='gold' size={14}/> : ''}  {type1 && <Tag>{type1}</Tag>} {type2 && <Tag>{type2}</Tag>}
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

            {showFilters && (
              <div className={styles.filters}>
                <ActiveFiltersPanel />
                <SortByPanel displayType='radio' collapsible={false} />
                <SortByPanel startCollapsed={true}/>
                <ValueFilterPanel label="Primary type" layout='grid' field="type1" preserveBlankFacetState={true} preserveBlankFacetStateOrder={false} displayType='button' limit={30} />
                <ValueFilterPanel label="Secondary type" field="type2" startCollapsed={true} displayType='button' layout='grid' />
                <ValueFilterPanel label="Legendary" field="is_legendary" preserveBlankFacetState={true} displayType='toggle' />
                <RangeFilterPanel label="Speed" field="speed" displayType="slider" expectedMin={5} expectedMax={180} />
                <RangeFilterPanel label="Attack" field="attack" displayType='slider' startCollapsed={true} />
                {/* <RangeFilterPanel label="Speed" field="speed" displayType="input" /> */}
                <RangeFilterPanel label="HP" field="hp" displayType="slider" startCollapsed={true} />
                <ValueFilterPanel label="Speed" field="speed" displayType='button' preserveBlankFacetStateOrder={false} sortFacetsBy='numeric' startCollapsed={true}/>
                <ValueFilterPanel label="Attack" field="attack" layout='grid' startCollapsed={true} showCount={true} />
                <ValueFilterPanel label="HP" startCollapsed={true} field="hp" />
              </div> 
            )}
          </div> {/* END BODY */}
        </Base> {/* END COMPONENT */}
      </div> {/* END WRAPPER */}
    </div>
  );
}