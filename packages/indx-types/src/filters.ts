export interface FilterProxy {
  hashString?: string | null;
}

export interface RangeFilterProxy {
  fieldName: string;
  lowerLimit: number;
  upperLimit: number;
}

export interface ValueFilterProxy {
  fieldName: string;
  value?: any | null;
}

export interface CombinedFilterProxy {
  a: FilterProxy;
  b: FilterProxy;
  useAndOperation: boolean;
}

export interface UpdateFieldProxy {
  fieldName?: string | null;
  value?: any | null;
}

export interface FilterFieldUpdateProxy {
  filter?: FilterProxy | null;
  fieldName?: string | null;
  value?: any | null;
}
