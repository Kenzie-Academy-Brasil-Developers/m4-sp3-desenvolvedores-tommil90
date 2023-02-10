export type tProjectRequestRequiredKeys =
  | "name"
  | "description"
  | "estimatedTime"
  | "repository"
  | "startDate"
  | "developerId";

export interface iProjectRequest {
  name: string;
  description: string;
  estimatedTime: string;
  repository: string;
  startDate: Date;
  developerId: number;
}

export interface iProjectResponse extends iProjectRequest {
  id: number;
  endDate: Date | null;
}

export interface iTecnology {
  id: number;
  name: string;
}

export interface iProject extends iProjectResponse {
    technologyID: number;
    technologyName: string;
}

export interface iProjectsTecnologies {
    id: number;
    addedIn: Date;
    projectId: number;
    tecnologyId: number | null
}

