import { SystemState } from './enums';
import { ProcessErrorCount, ProcessError } from './errors';

export interface LicenseInfo {
  licensed: boolean;
  validLicense: boolean;
  documentLimit: number;
  documentLimitExceeded: boolean;
  expirationDate: string;
  licensedTo?: string | null;
  type?: string | null;
  description?: string | null;
  licenseFileName?: string | null;
}

export interface SystemStatus {
  systemState: SystemState;
  documentCount: number;
  searchCounter: number;
  secondsToIndex: number;
  invalidDataSetName: boolean;
  invalidState: boolean;
  invalidArgument: boolean;
  tooLongClientText: boolean;
  tooLongSearchText: boolean;
  unknownConfigurationError: boolean;
  licenseInfo: LicenseInfo;
  recoverableErrors?: ProcessErrorCount[] | null;
  unrecoverableErrors?: ProcessError[] | null;
  errorMessage?: string | null;
  version?: string | null;
  timeOfInstanceCreation: string;
  timeOfLastIndexBuild: string;
}
