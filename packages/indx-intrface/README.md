# @indxsearch/intrface

A powerful, flexible React search UI library for INDX Search API.

## Features

- 🔍 **Full-text search** with fuzzy matching and typo tolerance
- 🎯 **Faceted filtering** - Value filters (exact match) and range filters (numeric)
- 📊 **Real-time facet counts** - Dynamic aggregations that update with search
- 📱 **Mobile-responsive** - Built-in responsive design
- ⚡ **Debounced searches** - Optimized performance
- 🎨 **Customizable rendering** - Full control over result display
- 🔒 **Secure authentication** - Session-based authentication with automatic login

## Compatibility

| Package | Version |
|---------|---------|
| **IndxCloudApi** | `1.0.0` |
| **React** | `^19.0.0` |
| **React DOM** | `^19.0.0` |
| **Node.js** | `>=16.0.0` |

> **Note:** This library is designed specifically for IndxCloudApi version 1.0.0. Different API versions may have incompatible changes.

## Installation

```bash
npm install @indxsearch/intrface @indxsearch/systm @indxsearch/pixl
```

## Quick Start

### 1. Set Up Environment Variables

Create a `.env.local` file in your project root:

**Option A: Using Bearer Token (Recommended for Production)**
```bash
VITE_INDX_URL=https://your-indx-server.com
VITE_INDX_TOKEN=your-jwt-bearer-token-here
```

**Option B: Using Email/Password (Quick Start)**
```bash
VITE_INDX_URL=https://your-indx-server.com
VITE_INDX_EMAIL=your@email.com
VITE_INDX_PASSWORD=yourpassword
```

**For local development:**
```bash
VITE_INDX_URL=http://localhost:5001
# Then add either token or email/password as shown above
```

**Security Notes:**
- Never commit `.env.local` to version control
- Store credentials/tokens securely in environment variables
- For production deployments, prefer bearer token authentication

### 2. Import Styles

Import the CSS file in your app entry point:

```typescript
import '@indxsearch/intrface/styles.css';
```

### 3. Basic Implementation

```typescript
import { SearchProvider, SearchInput, SearchResults } from '@indxsearch/intrface';

export default function SearchPage() {
  return (
    <SearchProvider
      url={import.meta.env.VITE_INDX_URL}
      email={import.meta.env.VITE_INDX_EMAIL}
      password={import.meta.env.VITE_INDX_PASSWORD}
      dataset="products"
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
<SearchProvider url={url} email={email} password={password} dataset="products">
  {/* ... */}
</SearchProvider>

// articles page
<SearchProvider url={url} email={email} password={password} dataset="articles">
  {/* ... */}
</SearchProvider>
```

## Authentication

The library supports **two authentication methods**: bearer token and email/password login.

### Method 1: Bearer Token (Recommended for Production)

Use a pre-authenticated JWT bearer token. This is ideal when you have a backend that generates tokens for your users.

**Environment setup:**
```bash
VITE_INDX_URL=https://your-indx-server.com
VITE_INDX_TOKEN=your-jwt-bearer-token-here
```

**Usage:**
```typescript
<SearchProvider
  url={import.meta.env.VITE_INDX_URL}
  preAuthenticatedToken={import.meta.env.VITE_INDX_TOKEN}
  dataset="products"
>
  {/* Your search UI */}
</SearchProvider>
```

**When to use:**
- ✅ Production applications with backend authentication
- ✅ When you have existing token infrastructure
- ✅ For better security (tokens can have expiration, limited scope)
- ✅ When you want to avoid storing passwords client-side

### Method 2: Email/Password (Quick Start & Development)

Automatically logs in when the app initializes using email and password.

**Environment setup:**
```bash
VITE_INDX_URL=https://your-indx-server.com
VITE_INDX_EMAIL=your@email.com
VITE_INDX_PASSWORD=yourpassword
```

**Usage:**
```typescript
<SearchProvider
  url={import.meta.env.VITE_INDX_URL}
  email={import.meta.env.VITE_INDX_EMAIL}
  password={import.meta.env.VITE_INDX_PASSWORD}
  dataset="products"
>
  {/* Your search UI */}
</SearchProvider>
```

**How it works:**
1. You provide email and password to `SearchProvider`
2. On mount, the library automatically calls the Login API endpoint
3. A fresh session token is obtained and used for all subsequent requests
4. No manual token management required

**When to use:**
- ✅ Quick prototyping and development
- ✅ Demo applications
- ✅ When you don't have token infrastructure yet

**Security Best Practices:**
- Store credentials/tokens in environment variables (`.env.local`)
- Never commit `.env.local` to version control
- Use secure HTTPS connections in production
- For production, prefer bearer token authentication

## Error Handling

The library includes comprehensive error handling with helpful console messages:

### Automatic Error Detection

The SearchProvider automatically validates:
- ✅ Authentication (bearer token or email/password)
- ✅ Login success and token retrieval (when using email/password)
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
  <SearchProvider url={url} email={email} password={password} dataset={dataset}>
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
  <SearchProvider url={url} email={email} password={password} dataset={dataset}>
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
      url={import.meta.env.VITE_INDX_URL}
      email={import.meta.env.VITE_INDX_EMAIL}
      password={import.meta.env.VITE_INDX_PASSWORD}
      dataset="products"
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
| `preAuthenticatedToken` | `string` | ⚠️ | - | Bearer token for authentication (either this OR email/password) |
| `email` | `string` | ⚠️ | - | User email for authentication (either this OR token) |
| `password` | `string` | ⚠️ | - | User password for authentication (either this OR token) |
| `dataset` | `string` | ✅ | - | Dataset name |
| `allowEmptySearch` | `boolean` | ❌ | `false` | Show results without query |
| `enableFacets` | `boolean` | ❌ | `true` | Enable faceted search |
| `maxResults` | `number` | ❌ | `10` | Max results per search |
| `facetDebounceDelayMillis` | `number` | ❌ | `500` | Debounce delay for facet updates |
| `coverageDepth` | `number` | ❌ | `500` | Search depth for fuzzy matching |
| `removeDuplicates` | `boolean` | ❌ | `false` | Remove duplicate results |
| `enableDebugLogs` | `boolean` | ❌ | `false` | Enable detailed console logging |

### SearchInput Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `placeholder` | `string` | `'Search...'` | Input placeholder text |
| `showClear` | `boolean` | `true` | Show clear button |
| `showFocus` | `boolean` | `false` | Show focus ring |
| `inputSize` | `'micro' \| 'default'` | `'default'` | Input size |

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

### "Login failed" error

**Problem:** Authentication credentials are invalid

**Solutions:**
1. Verify your email and password are correct
2. Check that the credentials match your INDX account
3. Ensure the INDX server URL is correct
4. Check browser console for detailed error messages

### "401 Unauthorized" errors

**Problem:** Authentication failed or token is invalid

**Solutions:**
1. **If using bearer token:** Verify the token is valid and not expired. Generate a new token if needed.
2. **If using email/password:** Refresh the page to get a new session token (automatic login)
3. Check that the token/credentials are correctly set in your environment variables
4. Verify the server is running and accessible
5. Check server logs for authentication issues

### "Failed to fetch" errors

**Problem:** Cannot connect to INDX server

**Solutions:**
1. Verify the server URL is correct
2. Check if the server is running (for local: `http://localhost:5001`)
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
<SearchProvider url={url} email={email} password={password} dataset="products">
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
<SearchProvider url={url} email={email} password={password} dataset="documents">
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
