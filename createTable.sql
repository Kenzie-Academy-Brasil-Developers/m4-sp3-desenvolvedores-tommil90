CREATE DATABASE m4_sp3_developers;

CREATE TABLE IF NOT EXISTS developers(
	"id" SERIAL PRIMARY KEY,
	"name" VARCHAR(50) NOT NULL,
	"email" VARCHAR(50) UNIQUE NOT NULL,
	"infoId" INTEGER DEFAULT NULL
);


INSERT INTO
	developers("name", "email")
VALUES
	('exemplo', 'ddddd@mail.com');

SELECT
	*
FROM
	developers;



CREATE TYPE "OS" AS ENUM('Windows', 'Linux', 'MacOS');

CREATE TABLE IF NOT EXISTS developer_infos(
	"id" SERIAL PRIMARY KEY,
	"infoDeveloperSince" DATE NOT NULL,
	"preferredOS" "OS" NOT NULL
);

INSERT INTO
	developer_infos("infoDeveloperSince", "preferredOS")
VALUES
	('1990-09-09', 'MacOS');

SELECT
	*
FROM
	developer_infos;


CREATE TABLE IF NOT EXISTS projects(
	"id" SERIAL PRIMARY KEY,
	"name" VARCHAR(50) NOT NULL,
	"description" TEXT NOT NULL,
	"estimatedTime" VARCHAR(20) NOT NULL,
	"repository" VARCHAR (120) NOT NULL,
	"startDate" DATE NOT NULL,
	"endDate" DATE DEFAULT NULL
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



	
