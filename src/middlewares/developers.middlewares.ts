import { NextFunction, Request, Response } from "express";
import { QueryConfig, QueryResult } from "pg";
import { iNewDeveloperResponse } from "../interfaces/developers.interfaces";
import { client } from "../database";

export const developerExists = async (
  request: Request,
  response: Response,
  next: NextFunction
): Promise<Response | void> => {
  const id: number = +request.params.id;

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

