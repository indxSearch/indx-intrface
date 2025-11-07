# @indxsearch/intrface

A powerful, flexible React search UI library for INDX Search API.

## Features

- 🔍 **Full-text search** with fuzzy matching and typo tolerance
- 🎯 **Faceted filtering** - Value filters (exact match) and range filters (numeric)
- 📊 **Real-time facet counts** - Dynamic aggregations that update with search
- 📱 **Mobile-responsive** - Built-in responsive design
- ⚡ **Debounced searches** - Optimized performance
- 🎨 **Customizable rendering** - Full control over result display
- 🔒 **Secure authentication** - Token-based authentication

## Installation

```bash
npm install @indxsearch/intrface @indxsearch/systm @indxsearch/pixl
```

## Quick Start

### 1. Get Your Authentication Token

Before you can use the search interface, you need to get an authentication token from your INDX server.

**Get a token using this command:**

```bash
curl -X POST 'https://your-indx-server.com/api/Login?userEmail=your@email.com&userPassWord=yourpassword' \
  -H 'accept: */*' \
  -d ''
```

**Response:**
```json
{"token":"eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."}
```

Copy the token value from the response. This is what you'll use to authenticate your app.

**For local development:**
```bash
curl -X POST 'http://localhost:38171/api/Login?userEmail=your@email.com&userPassWord=yourpassword' \
  -H 'accept: */*' \
  -d ''
```

### 2. Set Up Environment Variables

Create a `.env.local` file in your project root:

```bash
# INDX Server Configuration
NEXT_PUBLIC_INDX_URL=https://your-indx-server.com

# Authentication Token
NEXT_PUBLIC_INDX_TOKEN=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**For local development:**
```bash
NEXT_PUBLIC_INDX_URL=http://localhost:38171
NEXT_PUBLIC_INDX_TOKEN=your-token-here
```

**Security Notes:**
- Never commit `.env.local` to version control
- Store tokens securely in environment variables
- Tokens can expire - get a fresh token using the Login API when needed

### 3. Import Styles

Import the CSS file in your app entry point:

```typescript
import '@indxsearch/intrface/styles.css';
```

### 4. Basic Implementation

```typescript
'use client';
import { SearchProvider, SearchInput, SearchResults } from '@indxsearch/intrface';

export default function SearchPage() {
  return (
    <SearchProvider
      url={process.env.NEXT_PUBLIC_INDX_URL!}
      dataset="products" // Specify dataset name directly
      token={process.env.NEXT_PUBLIC_INDX_TOKEN!}
    >
      <SearchInput placeholder="Search products..." />

      <SearchResults
        fields={['name', 'description', 'category']}
        resultsPerPage={10}
      >
        {(item) => (
          <div>
            <h3>{item.name}</h3>
            <p>{item.description}</p>
          </div>
        )}
      </SearchResults>
    </SearchProvider>
  );
}
```

**Using different datasets on different pages:**

```typescript
// products page
<SearchProvider url={url} dataset="products" token={token}>
  {/* ... */}
</SearchProvider>

// articles page
<SearchProvider url={url} dataset="articles" token={token}>
  {/* ... */}
</SearchProvider>
```

## Authentication

The library uses token-based authentication. Get your token using the Login API endpoint:

```bash
curl -X POST 'https://your-indx-server.com/api/Login?userEmail=your@email.com&userPassWord=yourpassword' \
  -H 'accept: */*' \
  -d ''
```

**Response:**
```json
{"token":"eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."}
```

Then use the token in your SearchProvider:

```typescript
<SearchProvider
  url="https://your-indx-server.com"
  dataset="products"
  token={process.env.NEXT_PUBLIC_INDX_TOKEN!}
>
  {/* Your search UI */}
</SearchProvider>
```

**Token Management:**
- Tokens can expire - when you get a 401 error, request a new token
- Store tokens securely in environment variables
- Never commit tokens to version control

## Error Handling

The library includes comprehensive error handling with helpful console messages:

### Automatic Error Detection

The SearchProvider automatically validates:
- ✅ Token format (JWT structure)
- ✅ Dataset existence and status
- ✅ Dataset readiness (indexing complete)
- ✅ Empty dataset warnings
- ✅ Network connectivity

All errors include:
- Clear error messages
- Specific problem identification
- Actionable fix suggestions
- Example commands to resolve issues

### Error Boundary (Optional)

Wrap your search interface with `SearchErrorBoundary` for graceful error handling:

```typescript
import { SearchErrorBoundary, SearchProvider } from '@indxsearch/intrface';

<SearchErrorBoundary>
  <SearchProvider url={url} dataset={dataset} token={token}>
    {/* Your search UI */}
  </SearchProvider>
</SearchErrorBoundary>
```

**Custom error UI:**
```typescript
<SearchErrorBoundary
  fallback={(error, reset) => (
    <div>
      <h2>Search Error</h2>
      <p>{error.message}</p>
      <button onClick={reset}>Try Again</button>
    </div>
  )}
>
  <SearchProvider {...props}>
    {children}
  </SearchProvider>
</SearchErrorBoundary>
```

### Console Error Messages

All errors show in the browser console with emoji indicators:
- ✅ = Success
- 🔍 = Checking something
- ⚠️ = Warning (non-critical)
- ❌ = Error (needs fixing)
- 💡 = Helpful suggestion

**Example:**
```
[Auth] ❌ Dataset "products" not found (404)
[Auth] 💡 Available datasets can be checked with: curl -X GET ...
[Auth] 💡 Make sure you spelled the dataset name correctly
```

## Adding Filters

### Value Filters (Exact Match)

```typescript
import { ValueFilterPanel } from '@indxsearch/intrface';

<SearchProvider {...authProps}>
  <SearchInput />

  {/* Simple checkbox list */}
  <ValueFilterPanel
    field="category"
    label="Category"
  />

  {/* Button-style filters */}
  <ValueFilterPanel
    field="brand"
    label="Brand"
    displayType="button"
    layout="grid"
  />

  <SearchResults {...resultsProps}>
    {renderItem}
  </SearchResults>
</SearchProvider>
```

### Range Filters (Numeric)

```typescript
import { RangeFilterPanel } from '@indxsearch/intrface';

<RangeFilterPanel
  field="price"
  label="Price Range"
  min={0}
  max={1000}
/>
```

### Active Filters Display

```typescript
import { ActiveFiltersPanel } from '@indxsearch/intrface';

<ActiveFiltersPanel />
```

## Full Example with Filters

```typescript
'use client';
import {
  SearchProvider,
  SearchInput,
  SearchResults,
  ValueFilterPanel,
  RangeFilterPanel,
  ActiveFiltersPanel,
  SortByPanel,
} from '@indxsearch/intrface';

export default function AdvancedSearch() {
  return (
    <SearchProvider
      url={process.env.NEXT_PUBLIC_INDX_URL!}
      dataset="products" // Specify your dataset name
      token={process.env.NEXT_PUBLIC_INDX_TOKEN!}
      allowEmptySearch={true}
      enableFacets={true}
      maxResults={20}
    >
      <div style={{ display: 'flex', gap: '2rem' }}>
        {/* Sidebar with filters */}
        <aside style={{ width: '250px' }}>
          <ActiveFiltersPanel />
          <SortByPanel displayType="radio" />
          <ValueFilterPanel field="category" label="Category" />
          <ValueFilterPanel field="brand" label="Brand" displayType="button" />
          <RangeFilterPanel field="price" label="Price" />
        </aside>

        {/* Main content */}
        <main style={{ flex: 1 }}>
          <SearchInput placeholder="Search products..." showFocus={true} />

          <SearchResults
            fields={['name', 'description', 'price', 'category', 'brand']}
            resultsPerPage={20}
          >
            {(item) => (
              <div style={{ padding: '1rem', borderBottom: '1px solid #eee' }}>
                <h3>{item.name}</h3>
                <p>{item.description}</p>
                <div>
                  <strong>${item.price}</strong> • {item.category}
                </div>
              </div>
            )}
          </SearchResults>
        </main>
      </div>
    </SearchProvider>
  );
}
```

## API Reference

### SearchProvider Props

| Prop | Type | Required | Default | Description |
|------|------|----------|---------|-------------|
| `url` | `string` | ✅ | - | INDX server URL |
| `dataset` | `string` | ✅ | - | Dataset name |
| `token` | `string` | ✅ | - | Authentication token |
| `allowEmptySearch` | `boolean` | ❌ | `false` | Show results without query |
| `enableFacets` | `boolean` | ❌ | `true` | Enable faceted search |
| `maxResults` | `number` | ❌ | `10` | Max results per search |
| `facetDebounceDelayMillis` | `number` | ❌ | `500` | Debounce delay for facet updates |
| `coverageDepth` | `number` | ❌ | `500` | Search depth for fuzzy matching |
| `removeDuplicates` | `boolean` | ❌ | `false` | Remove duplicate results |

### SearchInput Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `placeholder` | `string` | `'Search...'` | Input placeholder text |
| `showClear` | `boolean` | `true` | Show clear button |
| `showFocus` | `boolean` | `false` | Show focus ring |
| `inputSize` | `'small' \| 'default' \| 'large'` | `'default'` | Input size |

### SearchResults Props

| Prop | Type | Required | Description |
|------|------|----------|-------------|
| `fields` | `string[]` | ✅ | Document fields to fetch |
| `resultsPerPage` | `number` | ✅ | Results per page |
| `children` | `(item: any) => ReactNode` | ✅ | Render function for each result |

### ValueFilterPanel Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `field` | `string` | ✅ | Field name to filter on |
| `label` | `string` | ❌ | Display label |
| `displayType` | `'checkbox' \| 'button'` | `'checkbox'` | Filter UI style |
| `layout` | `'list' \| 'grid'` | `'list'` | Layout style |
| `limit` | `number` | `undefined` | Max filters to show |
| `startCollapsed` | `boolean` | `false` | Start collapsed |
| `showCount` | `boolean` | `true` | Show facet counts |

### RangeFilterPanel Props

| Prop | Type | Required | Description |
|------|------|----------|-------------|
| `field` | `string` | ✅ | Field name to filter on |
| `label` | `string` | ❌ | Display label |
| `min` | `number` | ❌ | Minimum value |
| `max` | `number` | ❌ | Maximum value |

## Troubleshooting

### "Authentication required" error

**Problem:** No valid authentication provided

**Solution:** Ensure you provide either:
- A valid token via `token` prop, OR
- Email and password via `email` and `password` props

### "401 Unauthorized" errors

**Problem:** Invalid or expired token

**Solutions:**
1. Generate a new token from your INDX dashboard
2. Use email/password authentication instead
3. Verify your credentials are correct

### "Failed to fetch" errors

**Problem:** Cannot connect to INDX server

**Solutions:**
1. Verify the server URL is correct
2. Check if the server is running (for local: `http://localhost:38171`)
3. Ensure CORS is configured on the server
4. Check browser console for detailed error

### Results not showing

**Problem:** Empty results even with data

**Solutions:**
1. Verify dataset name is correct
2. Check if dataset is indexed (use GetStatus endpoint)
3. Ensure fields are configured as indexable/facetable
4. Try `allowEmptySearch={true}` to see all results

### Filters not working

**Problem:** Filters don't update results

**Solutions:**
1. Ensure fields are configured as filterable/facetable in your dataset
2. Check browser console for errors
3. Verify field names match your dataset

## Examples

### Example 1: E-commerce Search

```typescript
<SearchProvider url={url} dataset="products" token={token}>
  <div className="search-page">
    <SearchInput placeholder="Search products..." />

    <div className="filters">
      <ValueFilterPanel field="category" label="Category" />
      <ValueFilterPanel field="brand" label="Brand" displayType="button" />
      <RangeFilterPanel field="price" label="Price" min={0} max={1000} />
      <ValueFilterPanel field="inStock" label="In Stock" />
    </div>

    <SearchResults fields={['name', 'price', 'image']} resultsPerPage={24}>
      {(product) => (
        <ProductCard
          name={product.name}
          price={product.price}
          image={product.image}
        />
      )}
    </SearchResults>
  </div>
</SearchProvider>
```

### Example 2: Document Search

```typescript
<SearchProvider url={url} dataset="documents" token={token}>
  <SearchInput placeholder="Search documents..." />

  <ValueFilterPanel field="docType" label="Type" />
  <ValueFilterPanel field="author" label="Author" />

  <SearchResults fields={['title', 'content', 'date']} resultsPerPage={10}>
    {(doc) => (
      <article>
        <h2>{doc.title}</h2>
        <p>{doc.content.substring(0, 200)}...</p>
        <small>{new Date(doc.date).toLocaleDateString()}</small>
      </article>
    )}
  </SearchResults>
</SearchProvider>
```

## Support

- **Documentation:** [docs.indx.co](https://docs.indx.co)
