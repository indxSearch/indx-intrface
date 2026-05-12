import { http, HttpResponse } from 'msw';
import { DOCUMENTS, FACETS, SEARCH_RESPONSE } from './fixtures';

const BASE = 'http://localhost';
const DS = 'test';

export const handlers = [
  // Auth
  http.post(`${BASE}/api/Login`, () =>
    HttpResponse.json({ token: 'test-token' })),

  http.put(`${BASE}/api/CreateOrOpen/${DS}/:timeout`, () =>
    HttpResponse.json({})),

  http.get(`${BASE}/api/GetStatus/${DS}`, () =>
    HttpResponse.json({ systemState: 4 /* Ready */, documentCount: 100 })),

  // Field metadata
  http.get(`${BASE}/api/GetFilterableFields/${DS}`, () =>
    HttpResponse.json(['price', 'category'])),

  http.get(`${BASE}/api/GetFacetableFields/${DS}`, () =>
    HttpResponse.json(['price', 'category'])),

  http.get(`${BASE}/api/GetSortableFields/${DS}`, () =>
    HttpResponse.json(['price', 'title'])),

  // Search — returns facets always so rangeBounds / facetStats tests work
  http.post(`${BASE}/api/Search/${DS}`, () =>
    HttpResponse.json(SEARCH_RESPONSE)),

  // Document fetch
  http.post(`${BASE}/api/GetJson/${DS}`, () =>
    HttpResponse.json(DOCUMENTS)),

  // Filter proxy builders
  http.put(`${BASE}/api/CreateValueFilter/${DS}`, () =>
    HttpResponse.json({ hashString: 'vf-1' })),

  http.put(`${BASE}/api/CreateRangeFilter/${DS}`, () =>
    HttpResponse.json({ hashString: 'rf-1' })),

  http.put(`${BASE}/api/CombineFilters/${DS}`, () =>
    HttpResponse.json({ hashString: 'combined-1' })),
];
