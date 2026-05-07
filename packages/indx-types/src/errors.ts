export enum JsonErrorType {
  None = 0,
  InvalidJson = 1,
  MissingField = 2,
  InvalidValue = 3,
  DuplicateKey = 4,
  Sanitized = 5,
  Other = 6
}

export interface ParseResult {
  token?: string | null;
  progressPercent: number;
  recordIndex: number;
  isEndOfStream: boolean;
  errorType: JsonErrorType;
  errorMessage?: string | null;
  bytePositionInLine?: number | null;
  jsonPath?: string | null;
  wasSanitized: boolean;
  originalToken?: string | null;
}

export interface ProcessError {
  source?: string | null;
  message?: string | null;
  parseError?: ParseResult | null;
}

export interface ProcessErrorCount {
  error?: ProcessError | null;
  count: number;
}
