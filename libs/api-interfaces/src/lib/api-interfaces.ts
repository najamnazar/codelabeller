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