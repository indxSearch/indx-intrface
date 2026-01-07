# Indx Interface

**A complete React UI kit for building search interfaces with Indx.** Everything you need to add full-text search, faceted filtering, and dynamic results to your React application.

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

---

**📖 [View Full Documentation →](./packages/indx-intrface/README.md)**

Complete API reference, examples, authentication methods, troubleshooting, and more.

---

## Part of the Indx Search Ecosystem

This library is designed to work with the **Indx Search** platform:

- **[IndxCloudApi](https://github.com/indxSearch/IndxCloudApi)** - Fast search server with fuzzy matching, facets, and aggregations
- **[IndxCloudLoader](https://github.com/indxSearch/IndxCloudLoader)** - C# desktop app for loading JSON datasets
- **indx-intrface** (this repo) - React UI components for building search interfaces

**Compatibility:** This version is compatible with **IndxCloudApi v1.0**.

## Repository Structure

This is a monorepo containing multiple packages:

| Package | Description | License | npm |
|---------|-------------|---------|-----|
| **[@indxsearch/intrface](./packages/indx-intrface)** | Search UI components (featured above) | Apache-2.0 | `npm i @indxsearch/intrface` |
| **[@indxsearch/systm](./packages/indx-systm)** | Design system with tokens, UI components, patterns, cursors | [Custom¹](#licensing) | `npm i @indxsearch/systm` |

**¹ See [Licensing](#licensing) below**

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

## Additional Resources

- **[Getting Started Guide](./GETTING_STARTED.md)** - Step-by-step tutorial for first-time setup
- **[API Guide](./INDX_API_GUIDE.md)** - IndxCloudApi server API documentation

---

**Built by [Indx Search](https://indx.co)** • [Documentation](https://docs.indx.co) • [GitHub](https://github.com/indxSearch)
