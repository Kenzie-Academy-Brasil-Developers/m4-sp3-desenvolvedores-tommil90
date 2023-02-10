import { iProject } from "./projects.interfaces";

export type tNewDeveloperRequiredKeys = 'name' | 'email';
export type tDeveloperInfosRequiredKeys = 'developerSince' | 'preferredOS';

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
    developerSince: Date| null;
    preferredOS: 'Windows' | 'Linux' | 'MacOS' | null;

}

export interface iDeveloperInfosResponse extends iDeveloperInfosRequest{
    id: number
    developerId: number;
}

export type tListById = iNewDeveloperResponse & Omit<iDeveloperInfosResponse, 'id'>

export type tProjectListbyDeveloper = tListById &  iProject

