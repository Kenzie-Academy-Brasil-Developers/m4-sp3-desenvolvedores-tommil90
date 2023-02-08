import { Request, Response } from "express";
import { QueryConfig, QueryResult } from "pg";
import format from "pg-format";
import { client } from "../database";
import {
  iDeveloperInfosResponse,
  iNewDeveloperRequest,
  iNewDeveloperResponse,
  tListById,
  tNewDeveloperRequiredKeys,
} from "../interfaces";

const validateData = (data: any): iNewDeveloperRequest => {
  const keyList: string[] = Object.keys(data);
  const requeriredKeys: tNewDeveloperRequiredKeys[] = ["name", "email"];

  const hasRequeriredKeys: boolean = requeriredKeys.every((key: string) =>
    keyList.includes(key)
  );

  if (!hasRequeriredKeys) {
    const joinedKeys: string = requeriredKeys.join(", ");
    throw new Error(`Requerired keys are ${joinedKeys}.`);
  }

  const { name, email } = data;

  const validateBody = {
    name: name,
    email: email,
  };

  return validateBody;
};

export const statusOk = (request: Request, response: Response): Response => {
  return response.status(200).send("está OK");
};

export const createDeveloper = async (
  request: Request,
  response: Response
): Promise<Response> => {
  try {
    const validateBody = validateData(request.body);

    let queryString: string = `
    SELECT
    COUNT(*)
      FROM
    developers
      WHERE 
    "email" = $1;
      `;

    const queryConfig: QueryConfig = {
      text: queryString,
      values: [validateBody.email],
    };

    let queryResult: QueryResult<iNewDeveloperResponse> = await client.query(
      queryConfig
    );

    if (Number(queryResult.rows[0].count)> 0) {
      return response.status(409).json({
        message: "Email already exists.!",
      });
    }

    queryString = format(
      `
            INSERT INTO
                developers(%I)
            VALUES
                (%L)
            RETURNING *;
        `,
      Object.keys(validateBody),
      Object.values(validateBody)
    );

    queryResult = await client.query(queryString);

    const newDeveloper: iNewDeveloperResponse = queryResult.rows[0];

    return response.status(201).json(newDeveloper);
  } catch (error) {
    if (error instanceof Error) {
      return response.status(400).json({ message: error.message });
    }

    console.log(error);
    return response.status(500).json({ message: error });
  }
};

export const createDeveloperInfo = async (
  request: Request,
  response: Response
): Promise<Response> => {
  try {
    const developerId: number = parseInt(request.params.id);

    let queryString: string = format(
      `
            INSERT INTO
                developer_infos(%I)
            VALUES
                (%L)
            RETURNING *;
        `,
      Object.keys(request.body),
      Object.values(request.body)
    );

    let queryResult: QueryResult<iDeveloperInfosResponse> = await client.query(
      queryString
    );

    queryString = `
        UPDATE
            developers
        SET
            "developerInfoId" = $1
        WHERE
            id = $2
        RETURNING *;
    `;

    const queryConfig: QueryConfig = {
      text: queryString,
      values: [queryResult.rows[0].id, developerId],
    };

    await client.query(queryConfig);

    return response.status(201).json(queryResult.rows[0]);
  } catch (error) {
    if (error instanceof Error) {
      return response.status(400).json({ message: error.message });
    }

    console.log(error);
    return response.status(500).json({ message: error });
  }
};

export const listDevelopers = async (
  request: Request,
  response: Response
): Promise<Response> => {
  try {
    const developerId: number = parseInt(request.params.id);

    let queryString: string = format(
      `
              INSERT INTO
                  developer_infos(%I)
              VALUES
                  (%L)
              RETURNING *;
          `,
      Object.keys(request.body),
      Object.values(request.body)
    );

    let queryResult: QueryResult<iDeveloperInfosResponse> = await client.query(
      queryString
    );

    queryString = `
          UPDATE
              developers
          SET
              "developerInfoId" = $1
          WHERE
              id = $2
          RETURNING *;
      `;

    const queryConfig: QueryConfig = {
      text: queryString,
      values: [queryResult.rows[0].id, developerId],
    };

    await client.query(queryConfig);

    return response.status(201).json(queryResult.rows[0]);
  } catch (error) {
    if (error instanceof Error) {
      return response.status(400).json({ message: error.message });
    }

    console.log(error);
    return response.status(500).json({ message: error });
  }
};

export const listDeveloperByID = async (
  request: Request,
  response: Response
): Promise<Response> => {
  try {
    const developerId: number = parseInt(request.params.id);

    const queryString: string = `
      SELECT
          d.*,
          di."developerSince",
          di."preferredOS"
      FROM 
          developers d
      JOIN
          developer_infos di ON d."developerInfoId" = di."id"
      WHERE 
          d."id" = $1;
          `;

    const queryConfig: QueryConfig = {
      text: queryString,
      values: [developerId],
    };

    const queryResult: QueryResult<tListById> = await client.query(queryConfig);

    return response.status(201).json(queryResult.rows[0]);
  } catch (error) {
    if (error instanceof Error) {
      return response.status(400).json({ message: error.message });
    }

    console.log(error);
    return response.status(500).json({ message: error });
  }
};
