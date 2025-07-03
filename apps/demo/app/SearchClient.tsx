'use client';
import React, { useEffect, useState, useRef } from 'react';
import '@indxsearch/intrface/styles.css';
import styles from './SearchClient.module.css';
import { Indx, Sliders_horizontal } from '@indxsearch/pixl';
import {
  SearchProvider,
  useSearchContext,
  SearchInput,
  SearchResults
} from '@indxsearch/intrface';
import { Base, Button } from '@indxsearch/systm';

type SearchClientProps = {
  dataset: string;
  fields: string[];
  renderResult: (item: any) => React.ReactNode;
  filters: React.ReactNode;
  showFilters?: boolean;
};

export function SearchClient({
  dataset,
  fields,
  renderResult,
  filters,
  showFilters = true
}: SearchClientProps) {
  const url = process.env.NEXT_PUBLIC_INDX_URL!;
  const email = process.env.NEXT_PUBLIC_INDX_EMAIL!;
  const password = process.env.NEXT_PUBLIC_INDX_PASSWORD!;

  return (
    <SearchProvider
      url={url}
      email={email}
      password={password}
      dataset={dataset}
      allowEmptySearch={true}
      enableFacets={true}
      maxResults={10}
      facetDebounceDelayMillis={200}
    >
      <SearchLayout
        dataset={dataset}
        fields={fields}
        renderResult={renderResult}
        filters={filters}
        showFilters={showFilters}
      />
    </SearchProvider>
  );
}

function SearchLayout({
  dataset,
  fields,
  renderResult,
  filters,
  showFilters
}: {
  dataset: string;
  fields: string[];
  renderResult: (item: any) => React.ReactNode;
  filters: React.ReactNode;
  showFilters: boolean;
}) {
  const [theme, setTheme] = useState<'light' | 'dark'>('light');
  const containerRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLDivElement>(null);
  const [showFilterButton, setShowFilterButton] = useState(false);
  const [filtersVisible, setFiltersVisible] = useState(false);

  const { state } = useSearchContext();
  const { filters: activeFilters, rangeFilters, query, facets } = state;

  const hasFilters =
    Object.keys(activeFilters).length > 0 ||
    Object.keys(rangeFilters).length > 0;

  // THEME
  useEffect(() => {
    const systemDark = window.matchMedia('(prefers-color-scheme: dark)');
    const updateTheme = () => {
      setTheme(systemDark.matches ? 'dark' : 'light');
    };
    updateTheme();
    systemDark.addEventListener('change', updateTheme);
    return () => systemDark.removeEventListener('change', updateTheme);
  }, []);

  // RESIZE HANDLER
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

  // CLICK OUTSIDE HANDLER
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

  // DEBUG LOGGING
  useEffect(() => {
    console.log('[SearchLayout] Faceted search results updated', {
      timestamp: new Date().toISOString(),
      query,
      facets
    });
  }, [facets]);

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
                    iconRight={<Sliders_horizontal />}
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
                  <Base type='outlined'>
                    <div className={styles.scrollFilters}>
                      {filters}
                    </div>
                  </Base>
                </div>
              </div>
              <Indx size={35} color="var(--icon-color)" />
            </div>
          </div>
          <div className={styles.body}>
            <div className={styles.results}>
              <SearchResults fields={fields}>
                {renderResult}
              </SearchResults>
            </div>
            {showFilters && (
              <div className={styles.filters}>
                {filters}
              </div>
            )}
          </div>
        </Base>
      </div>
    </div>
  );
}
