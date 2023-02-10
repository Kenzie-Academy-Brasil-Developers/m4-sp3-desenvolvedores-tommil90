import { NextFunction, Request, Response } from "express";
import { QueryConfig, QueryResult } from "pg";
import { client } from "../database";
import { iNewDeveloperResponse } from "../interfaces/developers.interfaces";
import {
  iProjectRequest,
  tProjectRequestRequiredKeys,
} from "../interfaces/projects.interfaces";

function isValidDate(date: string): boolean {
  const dateRegex1 = /^\d{4}-\d{2}-\d{2}$/;
  const dateRegex2 = /^\d{2}-\d{2}-\d{4}$/;
  return dateRegex1.test(date) || dateRegex2.test(date);
}

export const verifyDataReqProject = async (
  request: Request,
  response: Response,
  next: NextFunction
): Promise<Response | void> => {
  try {
    const keyList: string[] = Object.keys(request.body);
    const requeriredKeys: tProjectRequestRequiredKeys[] = [
      "name",
      "description",
      "developerId",
      "estimatedTime",
      "repository",
      "startDate",
    ];

    let hasRequeriredKeys: boolean = requeriredKeys.every((key: string) =>
      keyList.includes(key)
    );

    if (!hasRequeriredKeys) {
      const joinedKeys: string = requeriredKeys.join(", ");
      throw new Error(`Requerired keys: ${joinedKeys}.`);
    }

    const {
      name,
      description,
      estimatedTime,
      repository,
      startDate,
      developerId,
    } = request.body;

    if (typeof developerId !== "number") {
      throw new Error(`developerId needs to be a number`);
    }

    if (!isValidDate(startDate)) {
      throw new Error(
        `value needs to be a string in the following format: "YYYY-MM-DD" or "DD-MM-YYYY" `
      );
    }

    if (typeof name !== "string") {
      throw new Error(`developerId needs to be a string`);
    }

    if (typeof description !== "string") {
      throw new Error(`description needs to be a string`);
    }

    if (typeof estimatedTime !== "string") {
      throw new Error(`estimatedTime needs to be a string`);
    }

    if (typeof repository !== "string") {
      throw new Error(`repository needs to be a string`);
    }

    request.validatedProjectRequest = {
      name,
      description,
      estimatedTime,
      repository,
      startDate,
      developerId,
    };

    return next();
  } catch (error) {
    if (error instanceof Error) {
      return response.status(400).json({ message: error.message });
    }

    console.log(error);
    return response.status(500).json({ message: error });
  }
};

export const verifyDataUpdateReqProject = async (
  request: Request,
  response: Response,
  next: NextFunction
): Promise<Response | void> => {
  try {
    const keyList: string[] = Object.keys(request.body);
    const requeriredKeys: tProjectRequestRequiredKeys[] = [
      "name",
      "description",
      "developerId",
      "estimatedTime",
      "repository",
      "startDate",
    ];

    let hasRequeriredKeys: boolean = requeriredKeys.some((key: string) =>
      keyList.includes(key)
    );

    if (!hasRequeriredKeys) {
      const joinedKeys: string = requeriredKeys.join(", ");
      throw new Error(`Requerired some the following keys: ${joinedKeys}.`);
    }

    const {
      name,
      description,
      estimatedTime,
      repository,
      startDate,
      developerId,
    } = request.body;

    let validatedBody: Partial<iProjectRequest> = {};

    if (developerId) {
      if (typeof developerId !== "number") {
        throw new Error(`developerId needs to be a number`);
      }
      validatedBody = { ...validatedBody, developerId };
    }

    if (startDate) {
      if (!isValidDate(startDate)) {
        throw new Error(
          `value needs to be a string in the following format: "YYYY-MM-DD" or "DD-MM-YYYY" `
        );
      }
      validatedBody = { ...validatedBody, startDate };
    }

    if (name) {
      if (typeof name !== "string") {
        throw new Error(`name needs to be a number`);
      }
      validatedBody = { ...validatedBody, name };
    }

    if (description) {
      if (typeof description !== "string") {
        throw new Error(`description needs to be a number`);
      }
      validatedBody = { ...validatedBody, description };
    }

    if (estimatedTime) {
      if (typeof estimatedTime !== "string") {
        throw new Error(`estimatedTime needs to be a number`);
      }
      validatedBody = { ...validatedBody, estimatedTime };
    }

    if (repository) {
      if (typeof repository !== "string") {
        throw new Error(`repository needs to be a number`);
      }
      validatedBody = { ...validatedBody, repository };
    }
 
    request.validatedUpdateProjectRequest = validatedBody;

    return next();
  } catch (error) {
    if (error instanceof Error) {
      return response.status(400).json({ message: error.message });
    }

    console.log(error);
    return response.status(500).json({ message: error });
  }
};

export const developerInProjectExists = async (
  request: Request,
  response: Response,
  next: NextFunction
): Promise<Response | void> => {
  const id: number = request.body.developerId;

  if(request.method === "PATCH" && !id){
    return next()
  }

  const queryString: string = `
        SELECT
            COUNT(*)
        FROM
            developers
        WHERE 
            id = $1;
    `;
  const queryConfig: QueryConfig = {
    text: queryString,
    values: [id],
  };

  const queryResult: QueryResult<iNewDeveloperResponse> = await client.query(
    queryConfig
  );

  if (Number(queryResult.rows[0].count) > 0) {
    return next();
  }

  return response.status(404).json({
    message: "Developer not exists!",
  });
};

export const verifyProjectExists = async (
  request: Request,
  response: Response,
  next: NextFunction
): Promise<Response | void> => {
  const id: number = +request.params.id;

  const queryString: string = `
        SELECT
            COUNT(*)
        FROM
            projects
        WHERE 
            id = $1;
    `;
  const queryConfig: QueryConfig = {
    text: queryString,
    values: [id],
  };

  const queryResult: QueryResult<iNewDeveloperResponse> = await client.query(
    queryConfig
  );

  if (Number(queryResult.rows[0].count) > 0) {
    return next();
  }

  return response.status(404).json({
    message: "Project not exists!",
  });
};


