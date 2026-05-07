import { useState, useCallback } from 'react';
import { useSearchContext } from '../context/SearchContext';
import type { FilterProxy } from '@indxsearch/indx-types';
import type { EmbeddingResult } from './useVectorSearch';

export interface UseHybridSearchOptions {
  fieldName: string;
  alpha?: number;
  maxResults?: number;
  filter?: FilterProxy | null;
  timeoutMs?: number;
}

export function useHybridSearch(
  embeddingFn: (text: string) => Promise<number[]>,
  options: UseHybridSearchOptions
) {
  const { url, dataset, authenticatedFetch } = useSearchContext();
  const [results, setResults] = useState<EmbeddingResult[] | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | undefined>(undefined);

  const search = useCallback(async (text: string) => {
    setIsLoading(true);
    setError(undefined);
    try {
      const vector = await embeddingFn(text);

      const body: Record<string, unknown> = {
        text,
        embeddingField: options.fieldName,
        vector,
        maxNumberOfRecordsToReturn: options.maxResults ?? 10,
        alpha: options.alpha ?? 0.5,
      };
      if (options.filter) body.filter = options.filter;
      if (options.timeoutMs) body.timeOutLimitMilliseconds = options.timeoutMs;

      const response = await authenticatedFetch(`${url}/api/HybridSearch/${dataset}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });

      if (!response.ok) throw new Error(`HybridSearch failed: ${response.status}`);

      const entries: Array<{ documentKey: number; score: number }> = await response.json();
      if (entries.length === 0) {
        setResults([]);
        return;
      }

      const keys = entries.map(e => e.documentKey);
      const jsonResponse = await authenticatedFetch(`${url}/api/GetJson/${dataset}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(keys),
      });

      if (!jsonResponse.ok) throw new Error(`GetJson failed: ${jsonResponse.status}`);
      const documents: any[] = await jsonResponse.json();

      setResults(documents.map((doc, idx) => ({
        document: doc,
        documentKey: keys[idx],
        score: entries[idx].score,
      })));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Hybrid search failed');
      setResults(null);
    } finally {
      setIsLoading(false);
    }
  }, [embeddingFn, options.fieldName, options.alpha, options.maxResults, options.filter, options.timeoutMs, url, dataset, authenticatedFetch]);

  return { results, isLoading, error, search };
}
