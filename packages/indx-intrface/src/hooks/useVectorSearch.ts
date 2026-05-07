import { useState, useCallback } from 'react';
import { useSearchContext } from '../context/SearchContext';
import type { FilterProxy } from '@indxsearch/indx-types';

export interface EmbeddingResult {
  document: any;
  documentKey: number;
  score: number;
}

export interface UseVectorSearchOptions {
  fieldName: string;
  maxResults?: number;
  filter?: FilterProxy | null;
  timeoutMs?: number;
}

export function useVectorSearch(
  embeddingFn: (text: string) => Promise<number[]>,
  options: UseVectorSearchOptions
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
        fieldName: options.fieldName,
        vector,
        maxResults: options.maxResults ?? 10,
      };
      if (options.filter) body.filter = options.filter;

      const response = await authenticatedFetch(`${url}/api/VectorSearch/${dataset}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });

      if (!response.ok) throw new Error(`VectorSearch failed: ${response.status}`);

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
      setError(err instanceof Error ? err.message : 'Vector search failed');
      setResults(null);
    } finally {
      setIsLoading(false);
    }
  }, [embeddingFn, options.fieldName, options.maxResults, options.filter, url, dataset, authenticatedFetch]);

  return { results, isLoading, error, search };
}
