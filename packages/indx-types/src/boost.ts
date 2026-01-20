import { BoostStrength } from './enums';
import { FilterProxy } from './filters';

export interface BoostProxy {
  boostStrength: BoostStrength;
  filterProxy: FilterProxy;
}
