type AuthenticatedFetch = (url: string, options?: RequestInit) => Promise<Response>;

async function combineAll(
  filters: any[],
  url: string,
  dataset: string,
  authenticatedFetch: AuthenticatedFetch
): Promise<any> {
  if (filters.length === 0) return null;
  if (filters.length === 1) return filters[0];

  let current = filters[0];
  for (let i = 1; i < filters.length; i++) {
    const response = await authenticatedFetch(`${url}/api/CombineFilters/${dataset}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ a: current, b: filters[i], useAndOperation: true }),
    });
    if (!response.ok) {
      const err = await response.json();
      console.error('CombineFilters failed:', err);
      throw new Error('CombineFilters failed');
    }
    current = await response.json();
  }
  return current;
}

export async function buildFilterProxy(
  filters: Record<string, string[]>,
  rangeFilters: Record<string, { min: number; max: number }>,
  url: string,
  dataset: string,
  authenticatedFetch: AuthenticatedFetch
): Promise<any> {
  const filterEntries = Object.entries(filters ?? {});
  const rangeFilterEntries = Object.entries(rangeFilters ?? {});

  const [valueFilterResponsesNested, rangeFilterResponses] = await Promise.all([
    Promise.all(
      filterEntries.map(([field, values]) =>
        Promise.all(
          values.map(value =>
            authenticatedFetch(`${url}/api/CreateValueFilter/${dataset}`, {
              method: 'PUT',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ fieldName: field, value }),
            }).then(res => res.json())
          )
        )
      )
    ),
    Promise.all(
      rangeFilterEntries.map(([field, { min, max }]) =>
        authenticatedFetch(`${url}/api/CreateRangeFilter/${dataset}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ fieldName: field, lowerLimit: min, upperLimit: max }),
        }).then(res => res.json())
      )
    ),
  ]);

  const allFilters = [...valueFilterResponsesNested.flat(), ...rangeFilterResponses].filter(
    f => f && typeof f.hashString === 'string'
  );

  return combineAll(allFilters, url, dataset, authenticatedFetch);
}
