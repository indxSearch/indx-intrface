import { FilterProxy } from './filters';
import { BoostProxy } from './boost';

export interface CoverageSetup {
  coverWholeQuery?: boolean;
  coverWholeWords?: boolean;
  coverFuzzyWords?: boolean;
  coverJoinedWords?: boolean;
  coverPrefixSuffix?: boolean;
  levenshteinMaxWordSize?: number;
  minWordSize?: number;
  truncate?: boolean;
  includePatternMatches?: boolean;
  truncationScore?: number;
  coverageMinWordHitsAbs?: number;
  coverageMinWordHitsRelative?: number;
  coverageQLimitForErrorTolerance?: number;
  coverageLcsErrorToleranceRelativeq?: number;
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
