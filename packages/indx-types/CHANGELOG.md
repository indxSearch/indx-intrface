# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.0.0] - 2026-01-21

### Added
- Initial release of `@indxsearch/indx-types`
- Complete TypeScript type definitions for IndxCloudApi v1.0.2
- `CoverageSetup` interface with all current properties
- `CloudQuery` interface for search requests
- `Result` and `ScoreEntry` interfaces for search responses
- `FilterProxy`, `RangeFilterProxy`, `ValueFilterProxy`, `CombinedFilterProxy` for filtering
- `BoostProxy` interface for search result boosting
- `SystemStatus` and `LicenseInfo` interfaces for system health
- `LoginInfo` interface for authentication
- `SystemState` enum (Hibernated, Created, Loading, Loaded, Indexing, Ready, Error)
- `BoostStrength` enum (Low, Medium, High)
- `StringInt32KeyValuePair` utility type
- Zero runtime dependencies (types-only package)
- Full ESM and CommonJS support
- Comprehensive README with usage examples
- Apache 2.0 license

### Technical Details
- Based on official Swagger specification from https://cloud.indx.co/swagger/v1/swagger.json
- All properties correctly typed with optional modifiers matching API spec
- `documentKey` correctly typed as `number` (Int32)
- `truncationScore` default value: 255 (byte)
- `systemState` properly uses `SystemState` enum
