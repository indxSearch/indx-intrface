// SearchResults.tsx
import React from 'react';
import styles from './SearchResults.module.css';
import { useSearchContext } from '../context/SearchContext';
import { Indx } from '@indxsearch/pixl';

export interface SearchResultsProps {
  fields?: string[];
  children: (item: Record<string, any>) => React.ReactNode;
}

export const SearchResults: React.FC<SearchResultsProps> = ({ fields, children }) => {
  const {
    state: { results, resultsSuppressed, searchSettings },
    isFetchingInitial,
  } = useSearchContext();

  if (isFetchingInitial) return null;
  if (resultsSuppressed) {
    return <div className={styles.placeholder}><Indx size={350} color="var(--icon-color)"/></div>;
  }
  if (!results || results.length === 0) {
    return <div className={styles.invalid}><p>No results found.</p></div>;
  }

  return (
    <div className={styles.container}>
      {results.map((result, idx) => {
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
  );
};