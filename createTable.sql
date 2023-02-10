CREATE DATABASE m4_sp3_developers;

CREATE TABLE IF NOT EXISTS developers(
	"id" SERIAL PRIMARY KEY,
	"name" VARCHAR(50) NOT NULL,
	"email" VARCHAR(50) UNIQUE NOT NULL,
	"developerInfoId" INTEGER DEFAULT NULL, 
	FOREIGN KEY ("developerInfoId") REFERENCES developer_infos("id") ON DELETE CASCADE
);



CREATE TYPE "OS" AS ENUM('Windows', 'Linux', 'MacOS');

CREATE TABLE IF NOT EXISTS developer_infos(
	"id" SERIAL PRIMARY KEY,
	"developerSince" DATE DEFAULT NULL,
	"preferredOS" "OS" DEFAULT NULL
);


CREATE TABLE IF NOT EXISTS projects(
	"id" SERIAL PRIMARY KEY,
	"name" VARCHAR(50) NOT NULL,
	"description" TEXT NOT NULL,
	"estimatedTime" VARCHAR(20) NOT NULL,
	"repository" VARCHAR (120) NOT NULL,
	"startDate" DATE NOT NULL,
	"endDate" DATE DEFAULT NULL,
	"developerId" INTEGER DEFAULT NULL, 
	FOREIGN KEY ("developerId") REFERENCES developers("id") ON DELETE CASCADE
);


CREATE TABLE IF NOT EXISTS technologies(
	"id" SERIAL PRIMARY KEY,
	"name" VARCHAR(30) NOT NULL
);

INSERT INTO
	technologies("name")
VALUES
	('JavaScript'),
	('Python'),
	('React'),
	('Express.js'),
	('HTML'),
	('CSS'),
	('Django'),
	('PostgreSQL'),
	('MongoDB');

SELECT
	*
FROM
	technologies;



CREATE TABLE IF NOT EXISTS projects_technologies(
	"id" SERIAL PRIMARY KEY,
	"addedIn" DATE NOT NULL
);


ALTER TABLE projects_technologies 
ADD COLUMN "tecnologyId" INTEGER NOT NULL;
ALTER TABLE projects_technologies 
ADD FOREIGN KEY ("tecnologyId") REFERENCES technologies("id") ON DELETE RESTRICT;

ALTER TABLE projects_technologies 
ADD COLUMN "projectId" INTEGER NOT NULL;
ALTER TABLE projects_technologies 
ADD FOREIGN KEY ("projectId") REFERENCES projects("id") ON DELETE CASCADE;
	
