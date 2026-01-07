# Indx Interface

**Build powerful search interfaces in minutes.** React components for full-text search, faceted filtering, and dynamic results powered by the INDX Search API.

```typescript
<SearchProvider url={url} email={email} password={password} dataset="products">
  <SearchInput placeholder="Search products..." />

  <ValueFilterPanel field="category" label="Category" />
  <RangeFilterPanel field="price" label="Price" min={0} max={1000} />

  <SearchResults fields={['name', 'price']} resultsPerPage={20}>
    {(item) => <ProductCard {...item} />}
  </SearchResults>
</SearchProvider>
```

## Why Indx Interface?

- **Just Works** - Drop in components, connect to your IndxCloudApi server, done
- **Real-time Facets** - Dynamic filter counts that update as users search
- **Fuzzy Search** - Handles typos and finds relevant results automatically
- **Fully Customizable** - Use our styles or bring your own
- **Type Safe** - Built with TypeScript for great DX

## Quick Start

```bash
npm install @indxsearch/intrface @indxsearch/systm @indxsearch/pixl
```

```typescript
import { SearchProvider, SearchInput, SearchResults } from '@indxsearch/intrface';
import '@indxsearch/intrface/styles.css';

function App() {
  return (
    <SearchProvider
      url="https://your-indx-server.com"
      email="your@email.com"
      password="yourpassword"
      dataset="products"
    >
      <SearchInput />
      <SearchResults fields={['name', 'description']} resultsPerPage={10}>
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

**That's it.** You now have a working search interface with fuzzy matching, debouncing, and automatic authentication.

## Features

### Core Search
- Full-text search with typo tolerance
- Debounced search (optimized performance)
- Empty search support (browse all results)
- Custom result rendering

### Filtering
- **Value Filters** - Checkbox or button-style facets with counts
- **Range Filters** - Numeric sliders for prices, dates, etc.
- **Active Filters** - Chip-based display of applied filters
- **Sort Options** - Configurable sorting with radio or dropdown

### Developer Experience
- Automatic authentication (bearer token or email/password)
- Comprehensive error messages with fix suggestions
- TypeScript support with full type safety
- React 19 compatible

## Part of the Indx Search Ecosystem

This library is designed to work with the **Indx Search** platform:

- **[IndxCloudApi](https://github.com/indxSearch/IndxCloudApi)** - Fast search server with fuzzy matching, facets, and aggregations
- **[IndxCloudLoader](https://github.com/indxSearch/IndxCloudLoader)** - C# desktop app for loading JSON datasets
- **indx-intrface** (this repo) - React UI components for building search interfaces

**Compatibility:** This version is compatible with **IndxCloudApi v1.0**.

## Documentation

- **[Getting Started Guide](./GETTING_STARTED.md)** - Step-by-step setup tutorial
- **[Full API Reference](./packages/indx-intrface/README.md)** - Complete component documentation
- **[API Guide](./INDX_API_GUIDE.md)** - INDX server API documentation

## Repository Structure

This is a monorepo containing multiple packages:

| Package | Description | License | npm |
|---------|-------------|---------|-----|
| **[@indxsearch/intrface](./packages/indx-intrface)** | Search UI components (featured above) | Apache-2.0 | `npm i @indxsearch/intrface` |
| **[@indxsearch/systm](./packages/indx-systm)** | Design system with tokens, UI components, patterns, cursors | [Custom¹](#licensing) | `npm i @indxsearch/systm` |

**¹ See [Licensing](#licensing) below**

## Examples

### E-commerce Search

```typescript
<SearchProvider
  url={url}
  email={email}
  password={password}
  dataset="products"
>
  <div className="search-page">
    <SearchInput placeholder="Search products..." />

    <aside className="filters">
      <ActiveFiltersPanel />
      <ValueFilterPanel field="category" label="Category" />
      <ValueFilterPanel field="brand" label="Brand" displayType="button" />
      <RangeFilterPanel field="price" label="Price" min={0} max={1000} />
    </aside>

    <main>
      <SortByPanel />
      <SearchResults fields={['name', 'price', 'image']} resultsPerPage={24}>
        {(product) => <ProductCard {...product} />}
      </SearchResults>
    </main>
  </div>
</SearchProvider>
```

### Document Search

```typescript
<SearchProvider
  url={url}
  email={email}
  password={password}
  dataset="docs"
>
  <SearchInput placeholder="Search documentation..." />

  <ValueFilterPanel field="category" label="Category" />
  <ValueFilterPanel field="tags" label="Tags" displayType="button" layout="grid" />

  <SearchResults fields={['title', 'content', 'url']} resultsPerPage={10}>
    {(doc) => (
      <article>
        <h2><a href={doc.url}>{doc.title}</a></h2>
        <p>{doc.content.substring(0, 200)}...</p>
      </article>
    )}
  </SearchResults>
</SearchProvider>
```

## Authentication

Two methods supported:

**Bearer Token (Production)**
```typescript
<SearchProvider
  url={url}
  preAuthenticatedToken={token}
  dataset="products"
>
```

**Email/Password (Development)**
```typescript
<SearchProvider
  url={url}
  email={email}
  password={password}
  dataset="products"
>
```

Authentication happens automatically. Just provide credentials and start searching.

## Licensing

This repository uses **multiple licenses**:

- **@indxsearch/intrface** - Apache License 2.0
  - ✅ Free for commercial use
  - ✅ Modify and redistribute
  - ✅ Use in your products

- **@indxsearch/systm** - Indx Design System License
  - ✅ Free for non-commercial use
  - ✅ Personal projects, education, open source
  - ❌ Cannot resell or use in competing commercial products
  - 📧 [Contact us](mailto:post@indx.co) for commercial licensing

**See [LICENSES.md](./LICENSES.md) for full details.**

## Demo Apps

This repo includes demo applications:

- **`apps/components`** - Component showcase and examples
- **`apps/demo`** - Full search interface demo

Run locally:
```bash
npm install
npm run dev
```

---

**Built by [Indx Search](https://indx.co)** • [Documentation](https://docs.indx.co) • [GitHub](https://github.com/indxSearch)
