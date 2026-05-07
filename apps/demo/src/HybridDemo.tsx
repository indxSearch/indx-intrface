import React, { useState } from 'react';
import { useHybridSearch, useVectorSearch } from '@indxsearch/intrface';
import { InputField, Button } from '@indxsearch/systm';

// Replace with a real embedding function for actual testing.
// This mock generates a random 384-dim vector so the full code path runs.
const mockEmbeddingFn = async (_text: string): Promise<number[]> =>
  Array.from({ length: 384 }, () => Math.random() * 2 - 1);

const EMBEDDING_FIELD = 'embedding'; // change to match your dataset's embedded field

export function HybridDemo() {
  const [query, setQuery] = useState('');

  const hybrid = useHybridSearch(mockEmbeddingFn, {
    fieldName: EMBEDDING_FIELD,
    alpha: 0.5,
    maxResults: 10,
  });

  const vector = useVectorSearch(mockEmbeddingFn, {
    fieldName: EMBEDDING_FIELD,
    maxResults: 10,
  });

  const handleHybrid = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) hybrid.search(query);
  };

  const handleVector = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) vector.search(query);
  };

  return (
    <div style={{ padding: '2rem', maxWidth: '800px', margin: '0 auto' }}>
      <h2 style={{ marginBottom: '1rem', color: 'var(--lv8)' }}>Vector / Hybrid Search</h2>
      <p style={{ marginBottom: '1.5rem', color: 'var(--lv5)', fontSize: '0.875rem' }}>
        Using mock 384-dim embeddings. Replace <code>mockEmbeddingFn</code> with a real embedding API.
        Requires the dataset to have an <code>{EMBEDDING_FIELD}</code> field indexed.
      </p>

      <form style={{ display: 'flex', gap: '0.5rem', marginBottom: '1rem' }}>
        <InputField
          value={query}
          onChange={e => setQuery(e.target.value)}
          placeholder="Enter search query…"
          style={{ flex: 1 }}
        />
        <Button variant="primary" onClick={handleHybrid} disabled={hybrid.isLoading || !query.trim()}>
          Hybrid
        </Button>
        <Button variant="secondary" onClick={handleVector} disabled={vector.isLoading || !query.trim()}>
          Vector
        </Button>
      </form>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
        <Section
          title={`Hybrid (alpha=0.5)`}
          isLoading={hybrid.isLoading}
          error={hybrid.error}
          results={hybrid.results}
        />
        <Section
          title="Vector (ANN)"
          isLoading={vector.isLoading}
          error={vector.error}
          results={vector.results}
        />
      </div>
    </div>
  );
}

function Section({ title, isLoading, error, results }: {
  title: string;
  isLoading: boolean;
  error?: string;
  results: Array<{ document: any; documentKey: number; score: number }> | null;
}) {
  return (
    <div>
      <h3 style={{ marginBottom: '0.75rem', color: 'var(--lv7)', fontSize: '0.9rem' }}>{title}</h3>
      {isLoading && <div style={{ color: 'var(--lv5)' }}>Searching…</div>}
      {error && (
        <div style={{ color: 'var(--error, #e55)', fontSize: '0.8rem', padding: '0.5rem', background: 'var(--lv1)', borderRadius: '4px' }}>
          {error}
        </div>
      )}
      {results && results.length === 0 && (
        <div style={{ color: 'var(--lv5)', fontSize: '0.85rem' }}>No results</div>
      )}
      {results && results.map(r => (
        <div key={r.documentKey} style={{ marginBottom: '0.75rem', padding: '0.75rem', background: 'var(--lv1)', borderRadius: '6px' }}>
          <div style={{ fontSize: '0.75rem', color: 'var(--lv5)', marginBottom: '0.25rem' }}>
            key: {r.documentKey} · score: {r.score.toFixed(4)}
          </div>
          <div style={{ fontSize: '0.85rem', color: 'var(--lv8)' }}>
            {r.document?.name ?? JSON.stringify(r.document).slice(0, 80)}
          </div>
        </div>
      ))}
    </div>
  );
}
