import { request, Request, Response } from "express";
import { QueryConfig, QueryResult } from "pg";
import format from "pg-format";
import { client } from "../database";
import {
  iProjectRequest,
  iProjectResponse,
  iProject,
  iTecnology,
  iProjectsTecnologies,
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

  // queryString = `
  // INSERT INTO 
  //   projects_technologies("addedIn", "projectId")
  // VALUES
  //   ($1, $2);     
  // `;

  // const queryConfig: QueryConfig = {
  //   text: queryString,
  //   values: [date.toLocaleDateString(), queryResult.rows[0].id],
  // };
  // await client.query(queryConfig);
    console.log(queryResult)
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
  FULL JOIN
    projects p  
  ON
    p.id = pt."projectId"
  LEFT JOIN
    technologies t 
  ON
    pt."tecnologyId" = t.id; 
    `;

  const queryResult: QueryResult<iProject> = await client.query(queryString);

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
    technologies t 
  ON
    pt."tecnologyId" = t.id
  FULL JOIN
    projects p  
  ON
    p.id = pt."projectId"
  WHERE
  	p.id = $1;
      `;

  const queryConfig: QueryConfig = {
    text: queryString,
    values: [id],
  };

  const queryResult: QueryResult<iProject> = await client.query(queryConfig);

  if (queryResult.rows.length < 1) {
    return response.status(404).json({ message: "Project not found." });
  }
  return response.status(200).json(queryResult.rows);
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

export const AddNewTech = async (
  request: Request,
  response: Response
): Promise<Response> => {
  try {
    const idProject: number = +request.params.id;
    const keys: string[] = Object.keys(request.body);
    const hasRequeriredKey: boolean = keys.includes("name");

    if (!hasRequeriredKey) {
      throw new Error(`Requerired key is ${"name"}`);
    }

    const optionsValues: string[] = [
      "JavaScript",
      "Python",
      "React",
      "Express.js",
      "HTML",
      "CSS",
      "Django",
      "PostgreSQL",
      "MongoDB",
    ];

    const { name } = request.body;
    const hasRequeriredValue: boolean = optionsValues.includes(name);

    if (!hasRequeriredValue) {
      throw new Error(
        `Technology not supported, Options: ${optionsValues.join(", ")}`
      );
    }

    let queryString: string = `
    SELECT "id"
    FROM technologies
    WHERE name = $1;
    `;
    let queryConfig: QueryConfig = {
      text: queryString,
      values: [name],
    };

    const queryResultTech: QueryResult<iTecnology> = await client.query(
      queryConfig
    );

    const idTech = queryResultTech.rows[0].id;
    let date = new Date();

    queryString = `
     INSERT INTO
       projects_technologies
         ("addedIn", "projectId", "tecnologyId")
     VALUES
         ($1, $2, $3)
     RETURNING *;
     `;

    queryConfig = {
      text: queryString,
      values: [date.toLocaleDateString(), idProject, idTech],
    };

    const queryResultProjectTech: QueryResult<iProjectsTecnologies> =
      await client.query(queryConfig);
    const projectTech: iProjectsTecnologies = queryResultProjectTech.rows[0];

    queryString = `
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
         pt."id" = $1;
       `;

    queryConfig = {
      text: queryString,
      values: [projectTech.id],
    };

    const queryResult: QueryResult<iProject> = await client.query(queryConfig);

    return response.status(201).json(queryResult.rows[0]);
  } catch (error) {
    if (error instanceof Error) {
      return response.status(400).json({ message: error.message });
    }

    console.log(error);
    return response.status(500).json({ message: error });
  }
};

export const deleteTech = async (
  request: Request,
  response: Response
): Promise<Response> => {
  try {
    const idProject: number = +request.params.id;
    const name: string = request.params.name;

    const optionsValues: string[] = [
      "JavaScript",
      "Python",
      "React",
      "Express.js",
      "HTML",
      "CSS",
      "Django",
      "PostgreSQL",
      "MongoDB",
    ];

    const hasRequeriredName: boolean = optionsValues.includes(name);

    if (!hasRequeriredName) {
      throw new Error(
        `Technology not supported, Options: ${optionsValues.join(", ")}`
      );
    }

    let queryString: string = `
    SELECT "id"
    FROM technologies
    WHERE name = $1;
    `;
    let queryConfig: QueryConfig = {
      text: queryString,
      values: [name],
    };

    const queryResultTech: QueryResult<iTecnology> = await client.query(
      queryConfig
    );

    const idTech = queryResultTech.rows[0].id;

    queryString = format(`
    SELECT
      id
    FROM
      projects_technologies pt
    WHERE
      pt."tecnologyId" = $1
    AND
      pt."projectId" = $2;
         `);

    queryConfig = {
      text: queryString,
      values: [idTech, idProject],
    };

    const queryResult: QueryResult<iProjectsTecnologies> = await client.query(
      queryConfig
    );

    if (!queryResult.rows[0]) {
      return response
        .status(404)
        .json({ message: `Project with tech ${name} not exist` });
    }

    const idsForDelete: number[] = queryResult.rows.map((e) => e.id);

    idsForDelete.forEach(async (id) => {
      const queryString: string = `
        DELETE FROM
          projects_technologies
        WHERE
          id = $1;
      `;
      const queryConfig: QueryConfig = {
        text: queryString,
        values: [id],
      };
      await client.query(queryConfig);
    });

    return response.status(204).send();
  } catch (error) {
    if (error instanceof Error) {
      return response.status(400).json({ message: error.message });
    }

    console.log(error);
    return response.status(500).json({ message: error });
  }
};
