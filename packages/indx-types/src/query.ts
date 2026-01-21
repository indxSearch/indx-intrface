import { FilterProxy } from './filters';
import { BoostProxy } from './boost';

export interface CoverageSetup {
  coverWholeQuery?: boolean;
  coverWholeWords?: boolean;
  coverFuzzyWords?: boolean;
  coverJoinedWords?: boolean;
  coverPrefixSuffix?: boolean;
  truncate?: boolean;
  includePatternMatches?: boolean;
  minWordSize?: number;
  levenshteinMaxWordSize?: number;
  truncateWordHitLimit?: number;
  truncateWordHitTolerance?: number;
  truncationScore?: number;
}

export interface CloudQuery {
  text?: string | null;
  maxNumberOfRecordsToReturn?: number;
  enableCoverage?: boolean;
  coverageDepth?: number;
  coverageSetup?: CoverageSetup | null;
  enableFacets?: boolean;
  enableBoost?: boolean;
  removeDuplicates?: boolean;
  sortAscending?: boolean;
  sortBy?: string | null;
  timeOutLimitMilliseconds?: number;
  filter?: FilterProxy | null;
  boosts?: BoostProxy[] | null;
  logPrefix?: string | null;
}
