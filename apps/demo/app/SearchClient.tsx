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
import { Base, Button, Popover } from '@indxsearch/systm';

type SearchClientProps = {
  dataset: string;
  fields: string[];
  renderResult: (item: any) => React.ReactNode;
  filters: React.ReactNode;
  showFilters?: boolean;
  email?: string;
  password?: string;
};

export function SearchClient({
  dataset,
  fields,
  renderResult,
  filters,
  showFilters = true,
  email,
  password
}: SearchClientProps) {
  const url = process.env.NEXT_PUBLIC_INDX_URL!;
  const envEmail = process.env.NEXT_PUBLIC_INDX_EMAIL!;
  const envPassword = process.env.NEXT_PUBLIC_INDX_PASSWORD!;

  // Use credentials from props or environment variables
  const authEmail = email || envEmail;
  const authPassword = password || envPassword;

  return (
    <SearchProvider
      url={url}
      email={authEmail}
      password={authPassword}
      dataset={dataset}
      allowEmptySearch={true}
      enableFacets={true}
      maxResults={30}
      facetDebounceDelayMillis={100}
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
  const containerRef = useRef<HTMLDivElement>(null);
  const [showFilterButton, setShowFilterButton] = useState(false);
  const [filtersOpen, setFiltersOpen] = useState(false);

  const { state } = useSearchContext();
  const { filters: activeFilters, rangeFilters, query, facets } = state;

  const hasFilters =
    Object.keys(activeFilters).length > 0 ||
    Object.keys(rangeFilters).length > 0;

  // RESIZE HANDLER
  useEffect(() => {
    if (!containerRef.current) return;

    const observer = new ResizeObserver(entries => {
      for (let entry of entries) {
        const width = entry.contentRect.width;
        const isNarrow = width <= 800;
        setShowFilterButton(isNarrow);

        if (!isNarrow && filtersOpen) {
          setFiltersOpen(false);
        }
      }
    });

    observer.observe(containerRef.current);
    return () => observer.disconnect();
  }, [filtersOpen]);

  return (
    <div>
      <div className={styles.wrapper} ref={containerRef}>
        <Base className={styles.component}>
          <div className={styles.mainContent}>
            <div className={styles.header}>
              <SearchInput
                showFocus={false}
                className={styles.searchInput}
              />
              <div id={styles.meta}>
                {showFilterButton && (
                  <div style={{ marginRight: '10px' }}>
                    <Popover
                      trigger={
                        <Button
                          variant={hasFilters ? 'primary' : 'secondary'}
                          iconRight={<Sliders_horizontal />}
                          size='micro'
                        >
                          Filters
                        </Button>
                      }
                      open={filtersOpen}
                      onOpenChange={setFiltersOpen}
                      align="end"
                      sideOffset={5}
                      className={styles.popoverContent}
                    >
                      <div className={styles.scrollFilters}>
                        {filters}
                      </div>
                    </Popover>
                  </div>
                )}
                <span className={styles.logo}>
                  <Indx size={28} color="var(--lv4)" />
                </span>
              </div>
            </div>
            <div className={styles.body}>
              <SearchResults fields={fields} resultsPerPage={10}>
                {renderResult}
              </SearchResults>
            </div>
          </div>
          {showFilters && (
            <div className={styles.filtersColumn}>
              {filters}
            </div>
          )}
        </Base>
      </div>
    </div>
  );
}
