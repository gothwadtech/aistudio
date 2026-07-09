export interface VercelProject {
  id: string;
  name: string;
  targets?: {
    production?: {
      url: string;
    }
  };
  link?: string;
  updatedAt: number;
}

export interface NetlifySite {
  id: string;
  name: string;
  url: string;
  updated_at: string;
}

export interface SupabaseTable {
  name: string;
  description: string;
}
