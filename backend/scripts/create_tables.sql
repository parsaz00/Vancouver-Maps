-- Boys before running @create_tables.sql run these BELOW. Please add the relevant drop statements whenever you create a table. 
-- We won't need this once we are finalized on our all our table creation statements and create it for good

-- TO DROP ALL TABLES RUN COMMAND @drop_all_tables.sql


-- DROP TABLE TransitStop CASCADE CONSTRAINTS;
-- DROP TABLE Place CASCADE CONSTRAINTS;
-- DROP TABLE Users CASCADE CONSTRAINTS;
-- DROP TABLE EmailName CASCADE CONSTRAINTS;
-- DROP TABLE GiftCard CASCADE CONSTRAINTS;
-- DROP TABLE GCPoints CASCADE CONSTRAINTS;
-- DROP TABLE FriendsWith CASCADE CONSTRAINTS;
-- DROP TABLE TravelPass CASCADE CONSTRAINTS;
-- DROP TABLE Includes CASCADE CONSTRAINTS;
-- DROP TABLE RetailBusiness CASCADE CONSTRAINTS;
-- DROP TABLE Restaurant CASCADE CONSTRAINTS;
-- DROP TABLE Reviews CASCADE CONSTRAINTS;
-- DROP TABLE Event CASCADE CONSTRAINTS;
-- DROP TABLE Notification CASCADE CONSTRAINTS;
-- DROP TABLE Promotion CASCADE CONSTRAINTS;
-- DROP TABLE Alert CASCADE CONSTRAINTS;
-- DROP TABLE Receives CASCADE CONSTRAINTS;

-- Tif you want to check your created tables : SELECT table_name FROM user_tables;


CREATE TABLE TransitStop (
    StopID INT PRIMARY KEY,
    Type VARCHAR(50),
    Latitude DECIMAL(9, 6),
    Longitude DECIMAL(9, 6),
    CHECK (Latitude BETWEEN -90 AND 90),
    CHECK (Longitude BETWEEN -180 AND 180)
    );

CREATE TABLE Place (
    Name VARCHAR(100),
    Address VARCHAR(200),
    Phone VARCHAR(15),
    OpeningTime VARCHAR2(8),
    ClosingTime VARCHAR2(8),
    Description VARCHAR(255),
    StopID INT NOT NULL,
    PRIMARY KEY (Name, Address),
    FOREIGN KEY (StopID) REFERENCES TransitStop(StopID) ON DELETE CASCADE,
    CHECK (ClosingTime > OpeningTime)
);

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

CREATE TABLE GiftCard (
    GCID INT PRIMARY KEY,
    Value DECIMAL(10, 2) CHECK (Value >= 0),
    Franchise VARCHAR(100),
    UserID INT,
    FOREIGN KEY (UserID) REFERENCES Users(UserID)
);

CREATE TABLE GCPoints (
    Value DECIMAL(10, 2) PRIMARY KEY,
    Points INT
);

CREATE TABLE FriendsWith (
    UserID1 INT,
    UserID2 INT,
    PRIMARY KEY (UserID1, UserID2),
    FOREIGN KEY (UserID1) REFERENCES Users(UserID) ON DELETE CASCADE,
    FOREIGN KEY (UserID2) REFERENCES Users(UserID) ON DELETE CASCADE,
    CHECK (UserID1 <> UserID2)
);

CREATE TABLE TravelPass (
    PassID INT PRIMARY KEY,
    Name VARCHAR(100),
    Cost DECIMAL(10, 2) CHECK (Cost >= 0),
    StartDate DATE,
    EndDate DATE,
    UserID INT,
    FOREIGN KEY (UserID) REFERENCES Users(UserID),
    CHECK (EndDate > StartDate)
);

CREATE TABLE Includes (
    PassID INT,
    Name VARCHAR(100),
    Address VARCHAR(200),
    PRIMARY KEY (PassID, Name, Address),
    FOREIGN KEY (PassID) REFERENCES TravelPass(PassID) ON DELETE CASCADE,
    FOREIGN KEY (Name, Address) REFERENCES Place(Name, Address) ON DELETE CASCADE
);

CREATE TABLE RetailBusiness (
    Name VARCHAR(100),
    Address VARCHAR(200),
    Industry VARCHAR(100),
    PriceRange VARCHAR(10),
    PRIMARY KEY (Name, Address),
    FOREIGN KEY (Name, Address) REFERENCES Place(Name, Address) ON DELETE CASCADE
);

CREATE TABLE Restaurant (
    Name VARCHAR(100),
    Address VARCHAR(200),
    Cuisine VARCHAR(100),
    Capacity INT CHECK (Capacity > 0),
    PRIMARY KEY (Name, Address),
    FOREIGN KEY (Name, Address) REFERENCES Place(Name, Address) ON DELETE CASCADE
);

CREATE TABLE Reviews (
    UserID INT,
    Name VARCHAR(100),
    Address VARCHAR(200),
    ReviewDate DATE,
    Rating INT CHECK (Rating BETWEEN 1 AND 5),
    Message VARCHAR(255),
    Title VARCHAR(100) UNIQUE,
    PRIMARY KEY (UserID, Name, Address),
    FOREIGN KEY (UserID) REFERENCES Users(UserID),
    FOREIGN KEY (Name, Address) REFERENCES Place(Name, Address)
);

CREATE TABLE Event (
    EventID INT PRIMARY KEY,
    Name VARCHAR(100) NOT NULL,
    Address VARCHAR(200) NOT NULL,
    Title VARCHAR(100),
    EventDate DATE,
    Rating INT CHECK (Rating BETWEEN 1 AND 5),
    Description VARCHAR(255),
    FOREIGN KEY (Name, Address) REFERENCES Place(Name, Address) ON DELETE CASCADE
);

CREATE TABLE Notification (
    NotifID INT PRIMARY KEY,
    Address VARCHAR(200),
    Time TIMESTAMP NOT NULL,
    Message VARCHAR(255)
);

CREATE TABLE Promotion (
    NotifID INT PRIMARY KEY,
    Company VARCHAR(100),
    StartDate DATE,
    EndDate DATE,
    FOREIGN KEY (NotifID) REFERENCES Notification(NotifID) ON DELETE CASCADE,
    CHECK (EndDate > StartDate)
);

CREATE TABLE Alert (
    NotifID INT PRIMARY KEY,
    Type VARCHAR(100),
    FOREIGN KEY (NotifID) REFERENCES Notification(NotifID) ON DELETE CASCADE
);

CREATE TABLE Receives (
    UserID INT,
    NotifID INT,
    PRIMARY KEY (UserID, NotifID),
    FOREIGN KEY (UserID) REFERENCES Users(UserID) ON DELETE CASCADE,
    FOREIGN KEY (NotifID) REFERENCES Notification(NotifID) ON DELETE CASCADE
);
