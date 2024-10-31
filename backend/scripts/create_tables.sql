-- Boys before running @create_tables.sql run these
-- DROP TABLE Users CASCADE CONSTRAINTS;
-- DROP TABLE EmailName CASCADE CONSTRAINTS;
-- DROP TABLE TransitStop CASCADE CONSTRAINTS;

-- Tif you want to check your created tables : SELECT table_name FROM user_tables;


CREATE TABLE Users (
    UserID INT PRIMARY KEY,
    Phone VARCHAR(15) UNIQUE,
    Email VARCHAR(100) UNIQUE NOT NULL,
    Points INT
);

CREATE TABLE EmailName (
    Email VARCHAR(100) PRIMARY KEY,
    Name VARCHAR(100)
);

CREATE TABLE TransitStop (
    StopID INT PRIMARY KEY,
    Type VARCHAR(50),
    Latitude DECIMAL(9, 6),
    Longitude DECIMAL(9, 6),
    CHECK (Latitude BETWEEN -90 AND 90),
    CHECK (Longitude BETWEEN -180 AND 180)
);

