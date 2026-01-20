import { StringInt32KeyValuePair } from './common';

export interface ScoreEntry {
  documentKey: number;
  score: number;
}

export interface Result {
  records?: ScoreEntry[] | null;
  facets?: { [key: string]: StringInt32KeyValuePair[] } | null;
  didTimeOut: boolean;
  truncationIndex: number;
  truncationScore: number;
}
