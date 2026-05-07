import { FilterProxy } from './filters';

export interface VectorQueryProxy {
  fieldName?: string | null;
  vector?: number[] | null;
  maxResults?: number;
  filter?: FilterProxy | null;
}

export interface HybridQueryProxy {
  text?: string | null;
  maxNumberOfRecordsToReturn?: number;
  filter?: FilterProxy | null;
  timeOutLimitMilliseconds?: number;
  embeddingField?: string | null;
  vector?: number[] | null;
  alpha?: number;
}

export interface EmbeddingResultEntry {
  documentKey: number;
  score: number;
}
