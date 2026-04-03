export interface NormalizedResult {
  title: string;
  companyName: string;
  location: string;
  remoteMode?: string;
  opportunityType?: string;
  sourceUrl: string;
  sourceProvider: string;
  snippet: string;
  postedDate?: string;
  confidence?: number;
  rawProviderPayload?: unknown;
}
