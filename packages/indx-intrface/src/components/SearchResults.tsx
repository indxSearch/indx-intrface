// SearchResults.tsx
import React, { useState, useEffect, useRef } from 'react';
import styles from './SearchResults.module.css';
import { useSearchContext } from '../context/SearchContext';
import { Indx } from '@indxsearch/pixl';
import { Button } from '@indxsearch/systm';

export interface SearchResultsProps {
  fields?: string[];
  resultsPerPage?: number;
  children: (item: Record<string, any>) => React.ReactNode;
}

export const SearchResults: React.FC<SearchResultsProps> = ({ fields, resultsPerPage, children }) => {
  const {
    state: { results, resultsSuppressed, searchSettings, truncationIndex, query },
    isFetchingInitial,
    fetchMoreResults,
  } = useSearchContext();

  const pageSize = resultsPerPage ?? 30;
  const [visibleCount, setVisibleCount] = useState(pageSize);
  const previousResultsLength = useRef<number>(0);
  const previousQuery = useRef<string>('');

  useEffect(() => {
    // Reset visibleCount if:
    // 1. Results went to null (loading state)
    // 2. Results shrunk (new search with fewer results)
    // 3. Query changed (new search)
    const queryChanged = query !== previousQuery.current;

    if (!results || (results.length < previousResultsLength.current) || queryChanged) {
      setVisibleCount(pageSize);
    }

    previousResultsLength.current = results?.length ?? 0;
    previousQuery.current = query;
  }, [results, pageSize, query]);

  const canLoadMore = results && results.length > visibleCount;

  const handleLoadMore = () => {
    const newVisibleCount = visibleCount + pageSize;
    setVisibleCount(newVisibleCount);

    // Check if we need to fetch more results from the server
    // Fetch if: we're about to show all cached results AND there might be more available
    if (results && newVisibleCount >= results.length) {
      // Check if there are potentially more results (truncationIndex > current results or undefined/-1)
      const mightHaveMore = !truncationIndex || truncationIndex === -1 || truncationIndex > results.length;

      if (mightHaveMore) {
        fetchMoreResults(results.length + pageSize);
      }
    }
  };

  if (isFetchingInitial || resultsSuppressed || results === null) {
    return <div className={styles.placeholder}><Indx size={200} color="var(--lv5)"/></div>;
  }
  if (results.length === 0) {
    return <div className={styles.invalid}><p>No results found.</p></div>;
  }

  return (
    <>
      <div className={styles.container}>
        {(results ?? []).slice(0, visibleCount).map((result, idx) => {
          const rawItem = result.document;
          const score = result.score;
          let parsed: Record<string, any>;
          try {
            parsed = typeof rawItem === 'string' ? JSON.parse(rawItem) : rawItem;
          } catch {
            return (
              <div key={idx} className={styles.invalid}>
                <p>Invalid JSON</p>
              </div>
            );
          }

          // 1) Build displayData by whitelisting `fields` (if given), or use entire object.
          let displayData: Record<string, any>;
          if (fields && fields.length > 0) {
            displayData = {};
            for (const key of fields) {
              if (key in parsed) {
                displayData[key] = parsed[key];
              }
            }
          } else {
            displayData = { ...parsed };
          }

          // 2) Strip array‐like strings into real string[]
          for (const key in displayData) {
            const val = displayData[key];
            if (typeof val === 'string' && val.startsWith('[') && val.endsWith(']')) {
              const inner = val.replace(/^\[|\]$/g, '');
              const arr = inner
                .split(',')
                .map(s => s.trim().replace(/^'|'$/g, ''))
                .filter(s => s.length > 0);
              displayData[key] = arr;
            }
          }

          // 3) Pass the transformed displayData into the render‐prop
          return (
            <div key={idx} className={styles.row}>
              <div className={styles.indexNumber}>{idx}</div>
              {children(displayData)}
              {searchSettings.showScore && (
                <div className={styles.scoreNumber}>{score}</div>
              )}
            </div>
          );
        })}
      </div>
      {canLoadMore && (
        <div style={{ textAlign: 'center', marginTop: '20px' }}>
          <Button
            variant="secondary"
            size="micro"
            onClick={handleLoadMore}
          >
            {(() => {
              const isEmptySearch = query.trim() === '';

              // For empty searches, just show "Load more" without count
              if (isEmptySearch) {
                return 'Load more';
              }

              // For text searches, show pagination with truncationIndex
              if (truncationIndex !== -1 && truncationIndex !== undefined && truncationIndex > 0) {
                return `Load results ${visibleCount + 1}-${Math.min(visibleCount + pageSize, results.length, truncationIndex)} of ${truncationIndex}`;
              }

              return 'Load more';
            })()}
          </Button>
        </div>
      )}
    </>
  );
};