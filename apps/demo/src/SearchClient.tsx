import React, { useEffect, useState, useRef } from 'react';
import '@indxsearch/intrface/styles.css';
import styles from './SearchClient.module.css';
import { Indx, Sliders_horizontal } from '@indxsearch/pixl';
import {
  useSearchContext,
  SearchInput,
  SearchResults,
  SearchProvider
} from '@indxsearch/intrface';
import { Base, Button, Popover } from '@indxsearch/systm';
import { HybridDemo } from './HybridDemo';

type SearchClientProps = {
  dataset: string;
  fields: string[];
  renderResult: (item: any) => React.ReactNode;
  filters: React.ReactNode;
  showFilters?: boolean;
  activeTab?: 'text' | 'hybrid';
};

export function SearchClient({
  dataset,
  fields,
  renderResult,
  filters,
  showFilters = true,
  activeTab = 'text',
}: SearchClientProps) {
  const url = import.meta.env.VITE_INDX_URL;
  const token = import.meta.env.VITE_INDX_TOKEN;

  return (
    <SearchProvider
      url={url}
      dataset={dataset}
      preAuthenticatedToken={token}
      allowEmptySearch={true}
      enableFacets={true}
      maxResults={30}
      facetDebounceDelayMillis={100}
      enableDebugLogs={true}
    >
      {activeTab === 'text' ? (
        <SearchLayout
          fields={fields}
          renderResult={renderResult}
          filters={filters}
          showFilters={showFilters}
        />
      ) : (
        <HybridDemo />
      )}
    </SearchProvider>
  );
}

function SearchLayout({
  fields,
  renderResult,
  filters,
  showFilters
}: {
  fields: string[];
  renderResult: (item: any) => React.ReactNode;
  filters: React.ReactNode;
  showFilters: boolean;
}) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [showFilterButton, setShowFilterButton] = useState(false);
  const [filtersOpen, setFiltersOpen] = useState(false);

  const { state } = useSearchContext();
  const { filters: activeFilters, rangeFilters } = state;

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
