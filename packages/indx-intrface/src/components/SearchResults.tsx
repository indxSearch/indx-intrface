import React from 'react';
import { useSearchContext } from '../context/SearchContext';

export interface SearchResultsProps {
  fields?: string[];
  customLabels?: Record<string, string>;
}

export const SearchResults: React.FC<SearchResultsProps> = ({ fields, customLabels }) => {
  const { state: { results } } = useSearchContext();

  if (!results || results.length === 0) {
    return <p>No results found.</p>;
  }

  return (
    <div>
      {results.map((item, index) => {
        let parsed: Record<string, any>;
        try {
          parsed = typeof item === 'string' ? JSON.parse(item) : item;
        } catch {
          return (
            <div key={index}>
              <p>Invalid JSON</p>
            </div>
          );
        }

        const displayData = fields?.length
          ? fields.reduce((obj, key) => {
              if (key in parsed) obj[key] = parsed[key];
              return obj;
            }, {} as Record<string, any>)
          : parsed;

        return (
          <div key={index}>
            <ul>
              {Object.entries(displayData).map(([key, value]) => {
                const label = customLabels?.[key];
                return (
                  <li key={key}>
                    {label === '' ? '' : (label ?? `${key}: `)}
                    {String(value)}
                  </li>
                );
              })}
            </ul>
          </div>
        );
      })}
    </div>
  );
};