import { request, Request, Response } from "express";
import { QueryConfig, QueryResult } from "pg";
import format from "pg-format";
import { client } from "../database";
import {
  iProjectRequest,
  iProjectResponse,
  iProject,
} from "../interfaces/projects.interfaces";

export const createProject = async (
  request: Request,
  response: Response
): Promise<Response> => {
  const newProject: iProjectRequest = request.validatedProjectRequest;
  let date = new Date();

  let queryString: string = format(
    `
    INSERT INTO
        projects
        (%I)
    VALUES
        (%L)
    RETURNING *;    
    `,
    Object.keys(newProject),
    Object.values(newProject)
  );

  const queryResult: QueryResult<iProjectResponse> = await client.query(
    queryString
  );

  queryString = `
  INSERT INTO 
    projects_technologies("addedIn", "projectId")
  VALUES
    ($1, $2);     
  `;

  const queryConfig: QueryConfig = {
    text: queryString,
    values: [date.toLocaleDateString(), queryResult.rows[0].id],
  };
  await client.query(queryConfig);

  return response.status(201).json(queryResult.rows[0]);
};

export const projectsList = async (
  request: Request,
  response: Response
): Promise<Response> => {
  const queryString: string = `
  SELECT
    p."id", p."name", p.description, p."estimatedTime", p.repository, p."startDate", p."endDate", p."developerId", t."id" AS "technologyID", t."name" AS "technologyName" 
  FROM 
    projects_technologies pt 
  LEFT JOIN
    projects p  
  ON
    p.id = pt."projectId"
  LEFT JOIN
    technologies t 
  ON
    pt."tecnologyId" = t.id; 
    `;

  const queryResult: QueryResult<iProject> = await client.query(
    queryString
  );

  return response.status(200).json(queryResult.rows);
};

export const projectListbyId = async (
  request: Request,
  response: Response
): Promise<Response> => {
  const id = request.params.id;
  const queryString: string = `
    SELECT
        p."id", p."name", p.description, p."estimatedTime", p.repository, p."startDate", p."endDate", p."developerId", t."id" AS "technologyID", t."name" AS "technologyName" 
    FROM 
        projects_technologies pt 
    LEFT JOIN
        projects p 
    ON
        p.id = pt."projectId"
    LEFT JOIN
        technologies t 
    ON
        pt."tecnologyId" = t.id
    WHERE
        pt."projectId" = $1;
      `;

  const queryConfig: QueryConfig = {
    text: queryString,
    values: [id],
  };

  const queryResult: QueryResult<iProject> = await client.query(
    queryConfig
  );

  if (queryResult.rows.length < 1) {
    return response.status(404).json({ message: "Project not found." });
  }
  return response.status(200).json(queryResult.rows[0]);
};

export const updateProject = async (
  request: Request,
  response: Response
): Promise<Response> => {
  const id: number = +request.params.id;
  const validatedData: Partial<iProjectRequest> =
    request.validatedUpdateProjectRequest;

  const queryString = format(
    `
    UPDATE
      projects
    SET(%I) = ROW(%L)
    WHERE
      id = $1
    RETURNING *;
    `,
    Object.keys(validatedData),
    Object.values(validatedData)
  );

  const queryConfig = {
    text: queryString,
    values: [id],
  };

  const queryResult: QueryResult<iProjectResponse> = await client.query(
    queryConfig
  );
  return response.status(200).json(queryResult.rows[0]);
};

export const deleteProject = async (
  request: Request,
  response: Response
): Promise<Response> => {
  const id: string = request.params.id;
  const queryString: string = `
        DELETE FROM
          projects
        WHERE
          id = $1;
      `;
  const queryConfig: QueryConfig = {
    text: queryString,
    values: [id],
  };
  await client.query(queryConfig);

  return response.status(204).send();
};

