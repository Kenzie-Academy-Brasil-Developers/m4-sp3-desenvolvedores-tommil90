import { Request, Response } from "express";
import { QueryConfig, QueryResult } from "pg";
import format from "pg-format";
import { client } from "../database";
import {
  iDeveloperInfosRequest,
  iDeveloperInfosResponse,
  iNewDeveloperRequest,
  iNewDeveloperResponse,
  tDeveloperInfosRequiredKeys,
  tListById,
  tNewDeveloperRequiredKeys,
  tProjectListbyDeveloper,
} from "../interfaces/developers.interfaces";

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

  const validateBody: iNewDeveloperRequest = {
    name: name,
    email: email,
  };

  return validateBody;
};

const validateInfos = (data: any): iDeveloperInfosRequest => {
  const keyList: string[] = Object.keys(data);
  const requeriredKeys: tDeveloperInfosRequiredKeys[] = [
    "developerSince",
    "preferredOS",
  ];

  const hasRequeriredKeys: boolean = requeriredKeys.every((key: string) =>
    keyList.includes(key)
  );
  console.log(hasRequeriredKeys);
  if (!hasRequeriredKeys) {
    const joinedKeys: string = requeriredKeys.join(", ");
    throw new Error(`Requerired keys are ${joinedKeys}.`);
  }

  const { developerSince, preferredOS }: iDeveloperInfosRequest = data;

  const validateBody: iDeveloperInfosRequest = {
    developerSince: developerSince,
    preferredOS: preferredOS,
  };

  return validateBody;
};

const validateDataUpdate = (data: any): Partial<iNewDeveloperRequest> => {
  const keyList: string[] = Object.keys(data);
  const requeriredKeys: tNewDeveloperRequiredKeys[] = ["name", "email"];

  const arrBoleans = keyList.map((key: string) => {
    return requeriredKeys[0] === key || requeriredKeys[1] === key;
  });

  const hasRequeriredKeys: boolean = arrBoleans.includes(false);

  if (hasRequeriredKeys) {
    const joinedKeys: string = requeriredKeys.join(", ");
    throw new Error(`Some keys for updating are ${joinedKeys}.`);
  }

  const { name, email }: any = data;
  let validateData: Partial<iNewDeveloperRequest> = {};

  if (name) {
    validateData = { ...validateData, name };
  }

  if (email) {
    validateData = { ...validateData, email };
  }

  return validateData;
};

const validateInfosUpdate = (data: any): Partial<iDeveloperInfosRequest> => {
  const keyList: string[] = Object.keys(data);
  const requeriredKeys: tDeveloperInfosRequiredKeys[] = [
    "developerSince",
    "preferredOS",
  ];

  const arrBoleans = keyList.map((key: string) => {
    return requeriredKeys[0] === key || requeriredKeys[1] === key;
  });

  const hasRequeriredKeys: boolean = arrBoleans.includes(false);

  if (hasRequeriredKeys) {
    const joinedKeys: string = requeriredKeys.join(", ");
    throw new Error(`Some keys for updating are ${joinedKeys}.`);
  }

  const { developerSince, preferredOS }: any = data;
  let validateData: Partial<iDeveloperInfosRequest> = {};

  if (developerSince) {
    validateData = { ...validateData, developerSince };
  }

  if (preferredOS) {
    validateData = { ...validateData, preferredOS };
  }

  return validateData;
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

    let queryConfig: QueryConfig = {
      text: queryString,
      values: [validateBody.email],
    };

    let queryResult: QueryResult<iNewDeveloperResponse> = await client.query(
      queryConfig
    );

    if (Number(queryResult.rows[0].count) > 0) {
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
    const infosDeveloper: iDeveloperInfosRequest = validateInfos(request.body);

    let queryString: string = `
    INSERT INTO 
      developer_infos("developerSince", "preferredOS", "developerId")
    VALUES
      ($1, $2, $3 )
    RETURNING *;  
  `;

    let queryConfig: QueryConfig = {
      text: queryString,
      values: [
        infosDeveloper.developerSince,
        infosDeveloper.preferredOS,
        developerId,
      ],
    };

    const queryResult: QueryResult<iDeveloperInfosResponse> =
      await client.query(queryConfig);
    const idInfo = queryResult.rows[0].id

    queryString =`
    UPDATE
      developers
    SET
      "developerInfoId" = $1
    WHERE
      id = $2
    RETURNING *;
  `

    queryConfig = {
      text: queryString,
      values: [idInfo, developerId],
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

export const updateDeveloperInfo = async (
  request: Request,
  response: Response
): Promise<Response> => {
  try {
    const developerId: number = parseInt(request.params.id);
    let infosDeveloper: Partial<iDeveloperInfosRequest> = validateInfosUpdate(
      request.body
    );

    let queryString: string = `
    
    SELECT 
      "developerInfoId"
    FROM
      "developers"
    WHERE 
      id = $1;
  `;

    let queryConfig: QueryConfig = {
      text: queryString,
      values: [developerId],
    };

    const queryResultGetIdInfo: QueryResult<iNewDeveloperResponse> =
      await client.query(queryConfig);
    const developerInfoId = queryResultGetIdInfo.rows[0].developerInfoId;

    queryString = format(
      `
    UPDATE
      developer_infos
    SET(%I) = ROW(%L)
    WHERE
      id = $1
    RETURNING *;
    `,
      Object.keys(infosDeveloper),
      Object.values(infosDeveloper)
    );

    queryConfig = {
      text: queryString,
      values: [developerInfoId],
    };

    const queryResultUpdateInfo: QueryResult<iDeveloperInfosResponse> =
      await client.query(queryConfig);


    return response.status(200).json(queryResultUpdateInfo.rows[0]);
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
  const queryString: string = `
  SELECT
      d.*,
      di."developerSince",
      di."preferredOS"
  FROM 
      developers d
  LEFT JOIN
      developer_infos di 
  ON
      d."developerInfoId" = di."id";
      `;

  const queryResult: QueryResult<tListById> = await client.query(queryString);

  return response.status(201).json(queryResult.rows);
};

export const listDeveloperByID = async (
  request: Request,
  response: Response
): Promise<Response> => {
  const developerId: number = parseInt(request.params.id);

  const queryString: string = `
    SELECT
        d.*,
        di."developerSince",
        di."preferredOS"
    FROM 
        developers d
    LEFT JOIN
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
};

export const updateDeveloper = async (
  request: Request,
  response: Response
): Promise<Response> => {
  const id = request.params.id;
  const infoUpdate = validateDataUpdate(request.body);

  console.log(infoUpdate);

  const queryString = format(
    `
  UPDATE
    developers  
  SET(%I) = ROW(%L)
  WHERE
    id = $1
  RETURNING *;
  `,
    Object.keys(infoUpdate),
    Object.values(infoUpdate)
  );

  const queryConfig: QueryConfig = {
    text: queryString,
    values: [id],
  };

  const queryResult: QueryResult<iDeveloperInfosResponse> = await client.query(
    queryConfig
  );

  return response.status(200).json(queryResult.rows[0]);
};

export const deleteDeveloper = async (
  request: Request,
  response: Response
): Promise<Response> => {
  const id: string = request.params.id;
  const queryString: string = `
        DELETE FROM
          developers
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

export const projectsListByDeveloper = async (
  request: Request,
  response: Response
): Promise<Response> => {
  const developerId: number = parseInt(request.params.id);

  const queryString: string = `
  SELECT
      d."id",
      d."name",
      d."email",
      d."developerInfoId", 
      di."developerSince",
      di."preferredOS",
      p."id",
      p."name",
      p.description,
      p."estimatedTime",
      p.repository,
      p."startDate",
      p."endDate",
      p."developerId",
      t."id" AS "technologyID",
      t."name" AS "technologyName" 
  FROM 
      projects_technologies pt 
  FULL JOIN
      projects p 
  ON
      p.id = pt."projectId"
  FULL JOIN
      technologies t 
  ON
      pt."tecnologyId" = t.id
  JOIN 
      developers d 
  ON 
      d.id = p."developerId"
  LEFT JOIN 
      developer_infos di 
  ON 
      d."developerInfoId" = di.id 
  WHERE
      d.id  = $1;
        `;

  const queryConfig: QueryConfig = {
    text: queryString,
    values: [developerId],
  };

  const queryResult: QueryResult<tProjectListbyDeveloper> = await client.query(
    queryConfig
  );

  return response.status(201).json(queryResult.rows);
};
