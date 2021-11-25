export interface AppConfigResponse {
  cid: string;
  apiHost: string;
  apiPrefix: string;
}

export interface FileStatus {
  isAssigned: boolean;
  canSubmit: boolean;
  hasSubmitted: boolean;
}

export interface FileResponseSubmissionCheck {
  status: boolean;
  message: string;
}

export interface DemoAccount {
  givenName: string;
  familyName: string;
  email: string;
}

export interface DemoAccountToken {
  token: string;
}

export interface DemoAccountCheck{
  exists: boolean;
}