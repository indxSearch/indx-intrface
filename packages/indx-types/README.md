# @indxsearch/indx-types

TypeScript type definitions for **IndxCloudApi v1.0.2**. This package provides complete, strongly-typed interfaces for search queries, filters, boosts, results, and system status based on the official [Swagger specification](https://cloud.indx.co/swagger/v1/swagger.json).

## Installation

```bash
npm install @indxsearch/indx-types
```

## Features

- Complete TypeScript type definitions for IndxCloudApi v1.0.2
- Zero runtime dependencies (types-only package)
- Matches official Swagger API specification exactly
- Full IntelliSense support in VS Code and other IDEs
- Supports both ESM and CommonJS

## Version Compatibility

This package (`@indxsearch/indx-types` v1.0.0) provides types for **IndxCloudApi v1.0.2**. The types are generated directly from the Swagger specification to ensure accuracy and completeness.

## Usage

### Basic Query

```typescript
import type { CloudQuery, Result } from '@indxsearch/indx-types';

const query: CloudQuery = {
  text: 'search term',
  maxNumberOfRecordsToReturn: 10,
  enableCoverage: true,
  coverageDepth: 3
};

// Use with your API client
const result: Result = await apiClient.search(query);
```

### Filters

```typescript
import type {
  RangeFilterProxy,
  ValueFilterProxy,
  CombinedFilterProxy
} from '@indxsearch/indx-types';

// Range filter
const rangeFilter: RangeFilterProxy = {
  fieldName: 'price',
  lowerLimit: 10,
  upperLimit: 100
};

// Value filter
const valueFilter: ValueFilterProxy = {
  fieldName: 'category',
  value: 'electronics'
};

// Combined filter
const combinedFilter: CombinedFilterProxy = {
  a: rangeFilter,
  b: valueFilter,
  useAndOperation: true
};
```

### Boosts

```typescript
import type { BoostProxy, BoostStrength } from '@indxsearch/indx-types';

const boost: BoostProxy = {
  boostStrength: BoostStrength.High,
  filterProxy: {
    hashString: 'filter-hash'
  }
};

const query: CloudQuery = {
  text: 'search term',
  enableBoost: true,
  boosts: [boost]
};
```

### Coverage Setup

```typescript
import type { CoverageSetup, CloudQuery } from '@indxsearch/indx-types';

const coverageSetup: CoverageSetup = {
  coverWholeQuery: true,
  coverWholeWords: true,
  coverFuzzyWords: true,
  minWordSize: 3,
  levenshteinMaxWordSize: 20,
  truncate: true,
  truncationScore: 255
};

const query: CloudQuery = {
  text: 'search term',
  enableCoverage: true,
  coverageSetup
};
```

### System Status

```typescript
import type { SystemStatus, SystemState } from '@indxsearch/indx-types';

const status: SystemStatus = await apiClient.getStatus();

if (status.systemState === SystemState.Ready) {
  console.log('System is ready');
  console.log(`Documents indexed: ${status.documentCount}`);
}
```

## API Reference

### Types

#### Query Types
- `CloudQuery` - Main search query interface
- `CoverageSetup` - Coverage configuration options

#### Filter Types
- `FilterProxy` - Base filter interface
- `RangeFilterProxy` - Numeric range filter
- `ValueFilterProxy` - Value-based filter
- `CombinedFilterProxy` - Combined filter with AND/OR operations

#### Result Types
- `Result` - Search result interface
- `ScoreEntry` - Individual result entry with score

#### Boost Types
- `BoostProxy` - Search result boost configuration

#### Status Types
- `SystemStatus` - System status and health information
- `LicenseInfo` - License validation details

#### Authentication
- `LoginInfo` - Login credentials interface

### Enums

#### SystemState
- `Hibernated = -1`
- `Created = 0`
- `Loading = 1`
- `Loaded = 2`
- `Indexing = 3`
- `Ready = 4`
- `Error = 255`

#### BoostStrength
- `Low = 1`
- `Medium = 2`
- `High = 3`

## TypeScript Configuration

This package is designed to work seamlessly with TypeScript. Add it to your `tsconfig.json`:

```json
{
  "compilerOptions": {
    "types": ["@indxsearch/indx-types"]
  }
}
```

For monorepo development with path mapping:

```json
{
  "compilerOptions": {
    "paths": {
      "@indxsearch/indx-types": ["../indx-types/src"]
    }
  }
}
```

## Related Packages

- [@indxsearch/intrface](https://www.npmjs.com/package/@indxsearch/intrface) - React search UI components
- [@indxsearch/systm](https://www.npmjs.com/package/@indxsearch/systm) - Core search system
- [@indxsearch/pixl](https://www.npmjs.com/package/@indxsearch/pixl) - UI component library

## Documentation

- [Swagger API Specification](https://cloud.indx.co/swagger/v1/swagger.json)
- [IndxCloudApi Documentation](https://cloud.indx.co/swagger)

## License

Apache-2.0

## Contributing

This package is part of the [indx-intrface](https://github.com/indxSearch/indx-intrface) monorepo. See the main repository for contribution guidelines.
