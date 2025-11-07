# INDX Search API - Implementation Guide

## Project Overview

This is a React/TypeScript search interface library (`@indxsearch/intrface`) that provides components for interacting with the INDX Search API. The library is built as a monorepo with workspace packages and a demo application.

### Repository Structure

```
indx-intrface/
├── apps/
│   └── demo/              # Next.js demo application
├── packages/
│   ├── indx-intrface/     # Main search components library
│   │   └── src/
│   │       └── context/
│   │           └── SearchContext.tsx  # Core API integration
│   └── [other packages]
```

## INDX Search API

### Base Architecture

The INDX Search API is a .NET/C# backend service that provides full-text search with faceting, filtering, and advanced search features.

**API Base Route:** `/api`

### Authentication Pattern

#### C# Pattern (Server)
```csharp
HttpClient client = new();
var token = Login(client);  // Configures HttpClient with default Bearer token
// All subsequent calls automatically include Bearer token
```

#### TypeScript Pattern (Client)
```typescript
// 1. Login once - get token
const response = await fetch(`${url}/api/Login?userEmail=${email}&userPassWord=${password}`);
const data = await response.json();
const token = data.token;

// 2. Create authenticated fetch wrapper
const authenticatedFetch = (url, options) => fetch(url, {
  ...options,
  headers: {
    ...options.headers,
    'Authorization': `Bearer ${token}`
  }
});

// 3. Use for all subsequent API calls
```

**Key Insight:** Only Login requires no auth. All other endpoints require Bearer token.

## API Endpoints

### Authentication

#### Login
- **Endpoint:** `POST /api/Login?userEmail={email}&userPassWord={password}`
- **Auth Required:** No
- **Returns:** `{ token: string }`
- **Purpose:** Obtain JWT Bearer token for subsequent requests

### Dataset Management

#### CreateOrOpen
- **Endpoint:** `PUT /api/CreateOrOpen/{dataSetName}/{configuration}`
- **Auth Required:** Yes
- **Body:** Empty string
- **Purpose:** Create a new dataset or open an existing one
- **Configuration:** Numeric value (e.g., 400)

#### DeleteDataSet
- **Endpoint:** `DELETE /api/DeleteDataSet/{dataSetName}`
- **Auth Required:** Yes
- **Purpose:** Permanently delete a dataset

#### GetUserDataSets
- **Endpoint:** `GET /api/GetUserDataSets`
- **Auth Required:** Yes
- **Returns:** `string[]` - Array of dataset names
- **Purpose:** List all datasets owned by the authenticated user

#### GetStatus
- **Endpoint:** `GET /api/GetStatus/{dataSetName}`
- **Auth Required:** Yes
- **Returns:** `SystemStatus` object
- **Purpose:** Check dataset state (indexing progress, readiness, etc.)

### Data Loading & Analysis

#### AnalyzeStream
- **Endpoint:** `POST /api/AnalyzeStream/{dataSetName}`
- **Auth Required:** Yes
- **Body:** Stream (text/plain)
- **Purpose:** Analyze JSON structure from a stream to discover fields

#### AnalyzeString
- **Endpoint:** `POST /api/AnalyzeString/{dataSetName}`
- **Auth Required:** Yes
- **Body:** String (text/plain)
- **Purpose:** Analyze JSON structure from a string

#### LoadStream
- **Endpoint:** `PUT /api/LoadStream/{dataSetName}`
- **Auth Required:** Yes
- **Body:** Stream (text/plain)
- **Purpose:** Load JSON documents from a stream

#### LoadString
- **Endpoint:** `PUT /api/LoadString/{dataSetName}`
- **Auth Required:** Yes
- **Body:** String (text/plain)
- **Purpose:** Load JSON documents from a string

### Field Configuration

#### GetAllFields
- **Endpoint:** `GET /api/GetAllFields/{dataSetName}`
- **Auth Required:** Yes
- **Returns:** `string[]`

#### GetIndexableFields
- **Endpoint:** `GET /api/GetIndexableFields/{dataSetName}`
- **Auth Required:** Yes
- **Returns:** Array of field configurations

#### SetIndexableFields
- **Endpoint:** `PUT /api/SetIndexableFields/{dataSetName}`
- **Auth Required:** Yes
- **Body:** `Array<[fieldName: string, weight: number]>`
- **Example:** `[["name", 100], ["type1", 50]]`

#### GetFilterableFields
- **Endpoint:** `GET /api/GetFilterableFields/{dataSetName}`
- **Auth Required:** Yes
- **Returns:** `string[]`

#### SetFilterableFields
- **Endpoint:** `PUT /api/SetFilterableFields/{dataSetName}`
- **Auth Required:** Yes
- **Body:** `string[]` - Array of field names

#### GetFacetableFields
- **Endpoint:** `GET /api/GetFacetableFields/{dataSetName}`
- **Auth Required:** Yes
- **Returns:** `string[]`

#### SetFacetableFields
- **Endpoint:** `PUT /api/SetFacetableFields/{dataSetName}`
- **Auth Required:** Yes
- **Body:** `string[]` - Array of field names

#### GetSortableFields
- **Endpoint:** `GET /api/GetSortableFields/{dataSetName}`
- **Auth Required:** Yes
- **Returns:** `string[]`

#### SetSortableFields
- **Endpoint:** `PUT /api/SetSortableFields/{dataSetName}`
- **Auth Required:** Yes
- **Body:** `string[]` - Array of field names

#### ClearFieldSettings
- **Endpoint:** `PUT /api/ClearFieldSettings/{dataSetName}`
- **Auth Required:** Yes
- **Body:** `string[]` - Array of field names
- **Purpose:** Reset all field properties (indexable, sortable, facetable, filterable) to false

### Indexing

#### IndexDataSet
- **Endpoint:** `GET /api/IndexDataSet/{dataSetName}`
- **Auth Required:** Yes
- **Purpose:** Start indexing process (runs asynchronously)
- **Note:** Use GetStatus to monitor progress

### Search & Filtering

#### Search
- **Endpoint:** `POST /api/Search/{dataSetName}`
- **Auth Required:** Yes
- **Body:** SearchQuery object
```typescript
{
  text: string;
  maxNumberOfRecordsToReturn: number;
  enableFacets: boolean;
  filter?: FilterProxy;
  sortBy?: string;
  sortAscending?: boolean;
  enableCoverage?: boolean;
  removeDuplicates?: boolean;
  coverageDepth?: number;
  coverageSetup?: CoverageSetup;
}
```
- **Returns:**
```typescript
{
  records: Array<{documentKey: number, score: number}>;
  facets?: Record<string, Array<{key: string, value: number}>>;
  truncationIndex?: number;
}
```

#### GetJson
- **Endpoint:** `POST /api/GetJson/{dataSetName}`
- **Auth Required:** Yes
- **Body:** `number[]` - Array of document keys
- **Returns:** `string[]` - Array of JSON document strings
- **Purpose:** Retrieve full documents by their keys

#### CreateValueFilter
- **Endpoint:** `PUT /api/CreateValueFilter/{dataSetName}`
- **Auth Required:** Yes
- **Body:** `{ FieldName: string, Value: any }`
- **Returns:** `FilterProxy` object with `hashString`
- **Purpose:** Create a filter for exact value matching

#### CreateRangeFilter
- **Endpoint:** `PUT /api/CreateRangeFilter/{dataSetName}`
- **Auth Required:** Yes
- **Body:** `{ FieldName: string, LowerLimit: number, UpperLimit: number }`
- **Returns:** `FilterProxy` object with `hashString`
- **Purpose:** Create a filter for numeric ranges

#### CombineFilters
- **Endpoint:** `PUT /api/CombineFilters/{dataSetName}`
- **Auth Required:** Yes
- **Body:** `{ A: FilterProxy, B: FilterProxy, useAndOperation: boolean }`
- **Returns:** Combined `FilterProxy` object
- **Purpose:** Combine two filters with AND/OR logic

#### CreateBoost
- **Endpoint:** `PUT /api/CreateBoost/{dataSetName}`
- **Auth Required:** Yes
- **Body:** `{ FilterProxy: FilterProxy, BoostStrength: number }`
- **Returns:** `BoostProxy` object
- **Purpose:** Create a boost configuration to prioritize matching documents

## Common Workflows

### 1. Setup New Dataset

```typescript
// 1. Login
const loginRes = await fetch(`${url}/api/Login?userEmail=${email}&userPassWord=${password}`, {
  method: 'POST',
  body: ''
});
const { token } = await loginRes.json();

// 2. Create/Open dataset
await authenticatedFetch(`${url}/api/CreateOrOpen/${dataset}/400`, {
  method: 'PUT',
  body: JSON.stringify('')
});

// 3. Analyze data structure
await authenticatedFetch(`${url}/api/AnalyzeStream/${dataset}`, {
  method: 'POST',
  headers: { 'Content-Type': 'text/plain' },
  body: fileStream
});

// 4. Configure fields
await authenticatedFetch(`${url}/api/SetIndexableFields/${dataset}`, {
  method: 'PUT',
  body: JSON.stringify([["name", 100], ["description", 50]])
});

await authenticatedFetch(`${url}/api/SetFilterableFields/${dataset}`, {
  method: 'PUT',
  body: JSON.stringify(["category", "price"])
});

await authenticatedFetch(`${url}/api/SetFacetableFields/${dataset}`, {
  method: 'PUT',
  body: JSON.stringify(["category", "brand"])
});

// 5. Load data
await authenticatedFetch(`${url}/api/LoadStream/${dataset}`, {
  method: 'PUT',
  headers: { 'Content-Type': 'text/plain' },
  body: dataStream
});

// 6. Index
await authenticatedFetch(`${url}/api/IndexDataSet/${dataset}`, {
  method: 'GET'
});

// 7. Monitor progress
let status;
do {
  const res = await authenticatedFetch(`${url}/api/GetStatus/${dataset}`);
  status = await res.json();
  await delay(200);
} while (status.systemState !== 'Ready');
```

### 2. Search with Filters

```typescript
// 1. Create filters
const filter1Res = await authenticatedFetch(`${url}/api/CreateValueFilter/${dataset}`, {
  method: 'PUT',
  body: JSON.stringify({ FieldName: "category", Value: "electronics" })
});
const filter1 = await filter1Res.json();

const filter2Res = await authenticatedFetch(`${url}/api/CreateRangeFilter/${dataset}`, {
  method: 'PUT',
  body: JSON.stringify({ FieldName: "price", LowerLimit: 0, UpperLimit: 100 })
});
const filter2 = await filter2Res.json();

// 2. Combine filters
const combinedRes = await authenticatedFetch(`${url}/api/CombineFilters/${dataset}`, {
  method: 'PUT',
  body: JSON.stringify({ A: filter1, B: filter2, useAndOperation: true })
});
const combinedFilter = await combinedRes.json();

// 3. Search
const searchRes = await authenticatedFetch(`${url}/api/Search/${dataset}`, {
  method: 'POST',
  body: JSON.stringify({
    text: "laptop",
    maxNumberOfRecordsToReturn: 20,
    enableFacets: true,
    filter: combinedFilter
  })
});
const searchData = await searchRes.json();

// 4. Get full documents
const keys = searchData.records.map(r => r.documentKey);
const docsRes = await authenticatedFetch(`${url}/api/GetJson/${dataset}`, {
  method: 'POST',
  body: JSON.stringify(keys)
});
const documents = await docsRes.json();
```

## Important Notes

### Authentication
- **CRITICAL:** All endpoints except Login require Bearer token
- Token is JWT-based and returned from Login endpoint
- Include token as `Authorization: Bearer {token}` header

### CORS
- API server must have CORS configured to allow requests from your frontend origin
- Common localhost ports: 3000 (Next.js), 38171 (API server)

### Error Handling
- Initial blank search may fail (500) if dataset not fully ready - handle gracefully
- Field configuration endpoints may return empty arrays if dataset not analyzed
- Always check response.ok before parsing JSON

### Performance
- Faceted searches are debounced in the UI (default 500ms)
- Use coverage settings to control search depth vs. speed
- Consider disabling facets for large result sets if not needed

### Search Features
- **Coverage:** Advanced fuzzy matching, typo tolerance
- **Facets:** Aggregated counts/stats for filterable fields
- **Filters:** Value filters (exact match) and range filters (numeric)
- **Boosts:** Priority weighting for specific filter matches
- **Duplicates:** Can be removed based on content similarity

## SearchContext Implementation

The `SearchContext.tsx` file in `packages/indx-intrface/src/context/` implements this API as a React Context provider with the following pattern:

1. **Login on mount** - Authenticates and stores token
2. **Fetch field configurations** - Gets filterable/facetable/sortable fields
3. **Create authenticatedFetch wrapper** - Automatically includes Bearer token
4. **Provide search state and methods** - Exposes search, filtering, sorting to components
5. **Handle loading and error states** - Graceful degradation for API failures

### Key Exports
- `SearchProvider` - Context provider component
- `useSearchContext` - Hook to access search state and methods
- `SearchInput` - Search input component
- `SearchResults` - Results display component
- Various filter panel components

## Environment Setup

### Required Environment Variables (.env.local)
```bash
NEXT_PUBLIC_INDX_URL=http://localhost:38171
NEXT_PUBLIC_INDX_EMAIL=your-email@example.com
NEXT_PUBLIC_INDX_PASSWORD=your-password
```

### Running the Project
```bash
# Install dependencies
npm install

# Build the intrface package
cd packages/indx-intrface
npm run build

# Run demo app
cd ../../apps/demo
npm run dev
```

## Troubleshooting

### "Failed to fetch" errors
- Check API server is running on correct port
- Verify CORS is configured on server
- Ensure Bearer token is being sent in requests
- Check browser console for exact error details

### "401 Unauthorized"
- Token may be expired or invalid
- Verify login credentials are correct
- Check token is being included in Authorization header

### "500 Internal Server Error"
- Dataset may not be fully indexed
- Check dataset exists with GetUserDataSets
- Verify field configurations are set correctly
- Check server logs for specific error

### Blank search fails
- This is expected behavior if dataset not ready
- Gracefully handled in SearchContext
- Facets will populate after first real search
