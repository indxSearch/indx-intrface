'use client';
import React, { useEffect, useState, useRef } from 'react';
import '@indxsearch/intrface/styles.css';
import styles from './SearchClient.module.css';
import { Indx, Spark, Sliders_horizontal } from '@indxsearch/pixl';
import { SearchProvider, useSearchContext, SearchInput, SearchResults, RangeFilterPanel, ValueFilterPanel, ActiveFiltersPanel, SortByPanel, SearchSettingsPanel } from '@indxsearch/intrface';
import { Base, Button } from '@indxsearch/systm';

export function SearchClient({ dataset }: { dataset: string }) {
  const url = process.env.NEXT_PUBLIC_INDX_URL!;
  const email = process.env.NEXT_PUBLIC_INDX_EMAIL!;
  const password = process.env.NEXT_PUBLIC_INDX_PASSWORD!;
  return (
    <SearchProvider url={url} email={email} password={password} dataset={dataset} allowEmptySearch={true} enableFacets={true} maxResults={10} facetDebounceDelayMillis={100}>
      <SearchUI dataset={dataset} showFilters={true} />
    </SearchProvider>
  );
}

type Fields = {
  name: string;
  is_legendary?: boolean;
  type1?: string;
  type2?: string;
  hp?: number;
  speed?: number;
  attack?: number;
  abilities?: string[];
};

const Tag: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <span>{children}</span>
);

function Results() {
  return (
    <>
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
        {(item: Fields) => {
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
    </>
  )
}

function Filters() {
  return (
    <>
      <ActiveFiltersPanel />
      <SortByPanel displayType="radio" />
      <SortByPanel startCollapsed={true} />
      <ValueFilterPanel label="Primary type" layout="grid" field="type1" preserveBlankFacetState={true} preserveBlankFacetStateOrder={false} displayType="button" limit={30} />
      <ValueFilterPanel label="Secondary type" field="type2" startCollapsed={true} displayType="button" layout="grid" />
      <ValueFilterPanel label="Legendary" field="is_legendary" preserveBlankFacetState={true} displayType="toggle" />
      <RangeFilterPanel label="Speed" field="speed" displayType="slider" expectedMin={5} expectedMax={180} />
      <RangeFilterPanel label="Attack" field="attack" displayType="slider" startCollapsed={true} />
      <RangeFilterPanel label="HP" field="hp" displayType="slider" startCollapsed={true} />
      <ValueFilterPanel label="Speed" field="speed" displayType="button" preserveBlankFacetStateOrder={false} sortFacetsBy="numeric" startCollapsed={true} />
      <ValueFilterPanel label="Attack" field="attack" layout="grid" startCollapsed={true} showCount={true} />
      <ValueFilterPanel label="HP" startCollapsed={true} field="hp" />
      <SearchSettingsPanel />
    </>
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

  /* CONTAINER QUERY */
  const containerRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLDivElement>(null);
  const [showFilterButton, setShowFilterButton] = useState(false);
  const [filtersVisible, setFiltersVisible] = useState(false);
  const { state: { filters, rangeFilters } } = useSearchContext();
  const hasFilters = Object.keys(filters).length > 0 || Object.keys(rangeFilters).length > 0;

  useEffect(() => {
    if (!containerRef.current) return;

    const observer = new ResizeObserver(entries => {
      for (let entry of entries) {
        const width = entry.contentRect.width;
        const isNarrow = width <= 800;
        setShowFilterButton(isNarrow);

        if (!isNarrow && filtersVisible) {
          setFiltersVisible(false);
        }
      }
    });

    observer.observe(containerRef.current);
    return () => observer.disconnect();
  }, [filtersVisible]);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        filtersVisible &&
        buttonRef.current &&
        !buttonRef.current.contains(event.target as Node)
      ) {
        setFiltersVisible(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [filtersVisible]);


  return (
    <div className={theme}>
      <div className={styles.wrapper} ref={containerRef}>
        <Base className={styles.component}>
          <div className={styles.header}>
            <SearchInput
              showFocus={true}
              className={styles.searchInput}
            />
            <div id={styles.meta}>
              <div className={styles.metafields}>
                <div className={styles.description}>INDX SEARCH SYSTEM</div>
                <div className={styles.metainfo}>Dataset: {dataset}</div>
              </div>
              <div ref={buttonRef} className={styles.filterButtonWrapper} style={{ position: 'relative', marginRight: '20px' }}>
                {showFilterButton && (
                  <Button 
                    variant={hasFilters ? 'active' : 'tertiary'}
                    iconRight={<Sliders_horizontal/>}
                    size='micro'
                    onClick={() => setFiltersVisible(prev => !prev)}
                  >
                    Filters
                  </Button>
                )}
                <div 
                  className={styles.floatingFilters} 
                  style={{ display: filtersVisible ? 'block' : 'none' }}
                >
                  <Base>
                    <div className={styles.scrollFilters}>
                      <Filters />
                    </div>
                  </Base>
                </div>
              </div>
              <Indx size={35} color="var(--icon-color)"/>
            </div>
          </div>
          <div className={styles.body}>
            <div className={styles.results}>
              <Results/>
            </div>

            {showFilters && (
              <div className={styles.filters}>
                <Filters/>
              </div> 
            )}
          </div> {/* END BODY */}
        </Base> {/* END COMPONENT */}
      </div> {/* END WRAPPER */}
    </div>
  );
}