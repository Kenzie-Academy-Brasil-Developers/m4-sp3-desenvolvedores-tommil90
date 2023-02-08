export type tNewDeveloperRequiredKeys = 'name' | 'email';

export interface iNewDeveloperRequest {
    name: string;
    email: string;
}

export interface iNewDeveloperResponse extends iNewDeveloperRequest {
    count?: string;
    id: number;
    developerInfoId: number | null;
}

export interface iDeveloperInfosRequest {
    infoDeveloperSince: Date;
    preferredOS: 'Windows' | 'Linux' | 'MacOS';
}

export interface iDeveloperInfosResponse extends iDeveloperInfosRequest{
    id: number
}

export type tListById = iNewDeveloperResponse & Omit<iDeveloperInfosResponse, 'id'>