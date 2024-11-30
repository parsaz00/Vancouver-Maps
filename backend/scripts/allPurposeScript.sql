-- Run with @allPurposeScript.sql

-- Drop tables to allow the script to be run multiple times
BEGIN
    EXECUTE IMMEDIATE 'DROP TABLE Receives CASCADE CONSTRAINTS';
    EXECUTE IMMEDIATE 'DROP TABLE Alert CASCADE CONSTRAINTS';
    EXECUTE IMMEDIATE 'DROP TABLE Promotion CASCADE CONSTRAINTS';
    EXECUTE IMMEDIATE 'DROP TABLE Notification CASCADE CONSTRAINTS';
    EXECUTE IMMEDIATE 'DROP TABLE Event CASCADE CONSTRAINTS';
    EXECUTE IMMEDIATE 'DROP TABLE Reviews CASCADE CONSTRAINTS';
    EXECUTE IMMEDIATE 'DROP TABLE Restaurant CASCADE CONSTRAINTS';
    EXECUTE IMMEDIATE 'DROP TABLE RetailBusiness CASCADE CONSTRAINTS';
    EXECUTE IMMEDIATE 'DROP TABLE Includes CASCADE CONSTRAINTS';
    EXECUTE IMMEDIATE 'DROP TABLE TravelPass CASCADE CONSTRAINTS';
    EXECUTE IMMEDIATE 'DROP TABLE GCPoints CASCADE CONSTRAINTS';
    EXECUTE IMMEDIATE 'DROP TABLE GiftCard CASCADE CONSTRAINTS';
    EXECUTE IMMEDIATE 'DROP TABLE EmailName CASCADE CONSTRAINTS';
    EXECUTE IMMEDIATE 'DROP TABLE Users CASCADE CONSTRAINTS';
    EXECUTE IMMEDIATE 'DROP TABLE Place CASCADE CONSTRAINTS';
    EXECUTE IMMEDIATE 'DROP TABLE TransitStop CASCADE CONSTRAINTS';
EXCEPTION
    WHEN OTHERS THEN NULL;
END;
/

-- Create tables
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
    StopID INT,
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
    Name VARCHAR(100),
    Address VARCHAR(200),
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

-- Insert data 
INSERT INTO Users (UserID, Phone, Email, Points) 
VALUES (1, '6049703783', 'parsaz@shaw.ca', 100);

-- For Users:

INSERT INTO USERS (UserID, Phone, Email, Points) 
VALUES (2, '0987654321', 'bob@example.com', 150);

INSERT INTO USERS (UserID, Phone, Email, Points) 
VALUES (3, '1112223333', 'charlie@example.com', 200);

INSERT INTO USERS (UserID, Phone, Email, Points) 
VALUES (4, '4445556666', 'dave@example.com', 250);

INSERT INTO USERS (UserID, Phone, Email, Points) 
VALUES (5, '7778889999', 'eve@example.com', 300);

INSERT INTO USERS (UserID, Phone, Email, Points) 
VALUES (6, '1234567890', 'hello@gmail.com', 350);

INSERT INTO USERS (UserID, Phone, Email, Points) 
VALUES (7, '5678901234', 'noway@gmail.com', 400);

INSERT INTO USERS (UserID, Phone, Email, Points) 
VALUES (8, '9876543210', 'why@outlook.com', 500);

INSERT INTO USERS (UserID, Phone, Email, Points) 
VALUES (9, '1122334455', 'cpsc304@ubc.ca', 450);

INSERT INTO USERS (UserID, Phone, Email, Points) 
VALUES (10, '2233445566', 'big@example.com', 600);

--Users' Names
INSERT INTO EmailName (Email, Name) 
VALUES ('parsaz@shaw.ca', 'Parsa');

INSERT INTO EmailName (Email, Name) 
VALUES ('bob@example.com', 'Bob Smith');

INSERT INTO EmailName (Email, Name) 
VALUES ('charlie@example.com', 'Charlie Adams');

INSERT INTO EmailName (Email, Name) 
VALUES ('dave@example.com', 'Dave Williams');

INSERT INTO EmailName (Email, Name) 
VALUES ('eve@example.com', 'Eve Thompson');

INSERT INTO EmailName (Email, Name) 
VALUES ('hello@gmail.com', 'Bob Jim');

INSERT INTO EmailName (Email, Name) 
VALUES ('noway@gmail.com', 'Cookie Monster');

INSERT INTO EmailName (Email, Name) 
VALUES ('why@outlook.com', 'Big Bird');

INSERT INTO EmailName (Email, Name) 
VALUES ('cpsc304@ubc.ca', 'Bob Dylan');

INSERT INTO EmailName (Email, Name) 
VALUES ('big@example.com', 'Freddy Mercury');

-- Insert for TransitStop
INSERT INTO TransitStop (StopID, Type, Latitude, Longitude) 
VALUES (1, 'Bus', 40.712776, -74.005974);

INSERT INTO TransitStop (StopID, Type, Latitude, Longitude)
VALUES (2, 'Bus', 34.052235, -118.243683);

INSERT INTO TransitStop (StopID, Type, Latitude, Longitude) 
VALUES (3, 'SkyTrain', 51.507351, -0.127758);

INSERT INTO TransitStop (StopID, Type, Latitude, Longitude) 
VALUES (4, 'SkyTrain', 48.856613, 2.352222);

INSERT INTO TransitStop (StopID, Type, Latitude, Longitude)
VALUES (5, 'SeaBus', -33.868820, 151.209296);

INSERT INTO TransitStop (StopID, Type, Latitude, Longitude) 
VALUES (6, 'Ferry', 49.282730, -123.120735);

INSERT INTO TransitStop (StopID, Type, Latitude, Longitude) 
VALUES (7, 'Train', 49.195138, -123.176478);

INSERT INTO TransitStop (StopID, Type, Latitude, Longitude) 
VALUES (8, 'Bus', 49.164686, -123.143936);

INSERT INTO TransitStop (StopID, Type, Latitude, Longitude) 
VALUES (9, 'SkyTrain', 49.211642, -123.115207);

INSERT INTO TransitStop (StopID, Type, Latitude, Longitude) 
VALUES (10, 'SeaBus', 49.309056, -123.082818);

-- Insert for Place
INSERT INTO Place (Name, Address, Phone, OpeningTime, ClosingTime, Description, StopID)
VALUES ('Stanley Park', 'Vancouver, BC V6G 1Z4', '(604) 123-4567', '08:00:00', '20:00:00', 'A large park with scenic views and trails.', 1);

INSERT INTO Place (Name, Address, Phone, OpeningTime, ClosingTime, Description, StopID)
VALUES ('Granville Island Public Market', '1669 Johnston St, Vancouver, BC V6H 3R9', '(604) 987-6543', '09:00:00', '18:00:00', 'A popular market offering fresh food, arts, and crafts.', 2);

INSERT INTO Place (Name, Address, Phone, OpeningTime, ClosingTime, Description, StopID)
VALUES ('Vancouver Aquarium', '845 Avison Way, Vancouver, BC V6G 3E2', '(604) 876-1234', '10:00:00', '17:00:00', 'Marine life exhibitions.', 3);

INSERT INTO Place (Name, Address, Phone, OpeningTime, ClosingTime, Description, StopID)
VALUES ('Science World', '1455 Quebec St, Vancouver, BC V6A 3Z7', '(604) 888-8888', '10:00:00', '18:00:00', 'Interactive science exhibits for all ages.', 4);

INSERT INTO Place (Name, Address, Phone, OpeningTime, ClosingTime, Description, StopID)
VALUES ('Capilano Suspension Bridge', '3735 Capilano Rd, North Vancouver, BC V7R 4J1', '(604) 654-3210', '09:00:00', '19:00:00', 'A long suspension bridge offering forest views.', 5);

INSERT INTO Place (Name, Address, Phone, OpeningTime, ClosingTime, Description, StopID)
VALUES ('Hills of Kerrisdale', '2125 W 41st Ave, Vancouver, BC V6M 1Z6', '(604) 266-9177', '10:00:00', '18:00:00', 'A boutique clothing store in the Kerrisdale shopping district.', 5);

INSERT INTO Place (Name, Address, Phone, OpeningTime, ClosingTime, Description, StopID)
VALUES ('Aritzia', '1100 Robson St, Vancouver, BC V6E 1B2', '(604) 684-3251', '10:00:00', '21:00:00', 'A popular womens fashion boutique known for trendy styles.', 4);

INSERT INTO Place (Name, Address, Phone, OpeningTime, ClosingTime, Description, StopID)
VALUES ('MEC Vancouver', '111 2nd Ave E, Vancouver, BC V5T 1B4', '(604) 872-7858', '10:00:00', '20:00:00', 'A co-op outdoor gear store offering clothing and equipment for hiking, camping, and more.', 3);

INSERT INTO Place (Name, Address, Phone, OpeningTime, ClosingTime, Description, StopID)
VALUES ('Lululemon', '970 Robson St, Vancouver, BC V6Z 2E7', '(604) 681-3118', '10:00:00', '21:00:00', 'A popular athletic wear company.', 4);

INSERT INTO Place (Name, Address, Phone, OpeningTime, ClosingTime, Description, StopID)
VALUES ('Vancouver Pen Shop', '512 W Hastings St, Vancouver, BC V6B 1L5', '(604) 681-1612', '10:00:00', '17:00:00', 'A specialty shop offering luxury pens and writing instruments.', 2);

INSERT INTO Place (Name, Address, Phone, OpeningTime, ClosingTime, Description, StopID)
VALUES ('Vijs', '3106 Cambie St, Vancouver, BC V5Z 2W2', '(604) 736-6664', '17:00:00', '22:00:00', 'Famous for its modern Indian cuisine and no-reservation policy.', 1);

INSERT INTO Place (Name, Address, Phone, OpeningTime, ClosingTime, Description, StopID)
VALUES ('Miku', '200 Granville St #70, Vancouver, BC V6C 1S4', '(604) 568-3900', '11:30:00', '22:00:00', 'High-end Japanese restaurant specializing in aburi sushi.', 2);

INSERT INTO Place (Name, Address, Phone, OpeningTime, ClosingTime, Description, StopID)
VALUES ('Hawksworth Restaurant', '801 W Georgia St, Vancouver, BC V6C 1P7', '(604) 673-7000', '11:30:00', '23:00:00', 'Elegant fine dining with a focus on contemporary Canadian cuisine.', 3);

INSERT INTO Place (Name, Address, Phone, OpeningTime, ClosingTime, Description, StopID)
VALUES ('Medina Cafe', '780 Richards St, Vancouver, BC V6B 3A4', '(604) 879-3114', '08:00:00', '15:00:00', 'Popular brunch spot known for waffles and Mediterranean-inspired dishes.', 4);

INSERT INTO Place (Name, Address, Phone, OpeningTime, ClosingTime, Description, StopID)
VALUES ('Blue Water Cafe', '1095 Hamilton St, Vancouver, BC V6B 5T4', '(604) 688-8078', '17:00:00', '23:00:00', 'A top seafood restaurant located in the heart of Yaletown.', 5);

INSERT INTO Place (Name, Address, Phone, OpeningTime, ClosingTime, Description, StopID)
VALUES ('Grouse Mountain', '6400 Nancy Greene Way, North Vancouver, BC V7R 4K9', '(604) 555-1234', '09:00:00', '20:00:00', 'A popular mountain resort offering skiing, hiking, and scenic views.', 3);

INSERT INTO Place (Name, Address, Phone, OpeningTime, ClosingTime, Description, StopID)
VALUES ('Museum of Vancouver', '1100 Chestnut St, Vancouver, BC V6J 3J9', '(604) 555-5678', '10:00:00', '17:00:00', 'A museum showcasing the history of Vancouver and its culture.', 5);

INSERT INTO Place (Name, Address, Phone, OpeningTime, ClosingTime, Description, StopID)
VALUES ('Queen Elizabeth Park', '4600 Cambie St, Vancouver, BC V5Z 2Z1', '(604) 555-8901', '08:00:00', '21:00:00', 'A nice park in the middle of the city', 6);

INSERT INTO Place (Name, Address, Phone, OpeningTime, ClosingTime, Description, StopID)
VALUES ('Kitsilano Beach', '1499 Arbutus St, Vancouver, BC V6J 5N2', '(604) 555-7890', '06:00:00', '22:00:00', 'A nice beach around.', 7);

INSERT INTO Place (Name, Address, Phone, OpeningTime, ClosingTime, Description, StopID)
VALUES ('Canada Place', '999 Canada Pl, Vancouver, BC V6C 3E1', '(604) 555-6789', '09:00:00', '20:00:00', 'Iconic event space.', 8);

INSERT INTO Place (Name, Address, Phone, OpeningTime, ClosingTime, Description, StopID)
VALUES ('Pacific Centre', '701 W Georgia St, Vancouver, BC V7Y 1G5', '(604) 555-5678', '10:00:00', '21:00:00', 'Large shopping mall downtown.', 9);

INSERT INTO Place (Name, Address, Phone, OpeningTime, ClosingTime, Description, StopID)
VALUES ('VanDusen Botanical Garden', '5151 Oak St, Vancouver, BC V6M 4H1', '(604) 555-4567', '09:00:00', '17:00:00', 'Expansive and interesting garden with seasonal events.', 10);

INSERT INTO Place (Name, Address, Phone, OpeningTime, ClosingTime, Description, StopID)
VALUES ('Glowbal', '590 W Georgia St, Vancouver, BC V6E 1A3', '(604) 555-2345', '11:00:00', '23:00:00', 'Nice modern dining experience.', 7);

INSERT INTO Place (Name, Address, Phone, OpeningTime, ClosingTime, Description, StopID)
VALUES ('Black+Blue', '1032 Alberni St, Vancouver, BC V6E 1A3', '(604) 555-4567', '12:00:00', '23:00:00', 'Highly rated steakhouse.', 8);

INSERT INTO Place (Name, Address, Phone, OpeningTime, ClosingTime, Description, StopID)
VALUES ('Joe Fortes', '777 Thurlow St, Vancouver, BC V6E 3V5', '(604) 555-6789', '11:30:00', '22:00:00', 'Famous seafood restaurant.', 9);

INSERT INTO Place (Name, Address, Phone, OpeningTime, ClosingTime, Description, StopID)
VALUES ('Chambar', '568 Beatty St, Vancouver, BC V6B 2L3', '(604) 555-9876', '08:00:00', '22:00:00', 'Belgian-inspired cuisine.', 6);

INSERT INTO Place (Name, Address, Phone, OpeningTime, ClosingTime, Description, StopID)
VALUES ('Tacofino', '15 W Cordova St, Vancouver, BC V6B 1C8', '(604) 555-1234', '11:00:00', '22:00:00', 'Laid-back Mexican dining.', 7);

INSERT INTO Place (Name, Address, Phone, OpeningTime, ClosingTime, Description, StopID)
VALUES ('Roots', '779 Granville St, Vancouver, BC V6Z 1E4', '(604) 555-2341', '10:00:00', '21:00:00', 'Iconic Canadian clothing store', 6);

INSERT INTO Place (Name, Address, Phone, OpeningTime, ClosingTime, Description, StopID)
VALUES ('Indigo', '1033 Robson St, Vancouver, BC V6E 1A9', '(604) 555-3412', '10:00:00', '21:00:00', 'Books and lifestyle products.', 8);

INSERT INTO Place (Name, Address, Phone, OpeningTime, ClosingTime, Description, StopID)
VALUES ('Holt Renfrew', '737 Dunsmuir St, Vancouver, BC V7Y 1E4', '(604) 555-4561', '11:00:00', '20:00:00', 'High-end luxury retailer.', 9);

INSERT INTO Place (Name, Address, Phone, OpeningTime, ClosingTime, Description, StopID)
VALUES ('Apple Store', '701 W Georgia St, Vancouver, BC V7Y 1G5', '(604) 555-5671', '10:00:00', '21:00:00', 'Tech and iPhones.', 10);

INSERT INTO Place (Name, Address, Phone, OpeningTime, ClosingTime, Description, StopID)
VALUES ('The Body Shop', '750 W Pender St, Vancouver, BC V6C 1G8', '(604) 555-6781', '10:00:00', '19:00:00', 'Cosmetics and skincare.', 7);

INSERT INTO Place (Name, Address, Phone, OpeningTime, ClosingTime, Description, StopID)
VALUES ('iDen and QuanJuDe Beijing Duck House', '2808 Cambie St., Vancouver, V5Z 2V5, Canada', NULL, '17:00:00', '22:00:00', 'Known for their superlatively crispy and juicy duck, as well as other delicacies like birds nest, sea cucumber, and whole king crab.', 7);

INSERT INTO Place (Name, Address, Phone, OpeningTime, ClosingTime, Description, StopID)
VALUES ('Okeya Kyujiro', '1038 Mainland St., Vancouver, V6B 2T4, Canada', NULL, '17:30:00', '21:30:00', 'Memorable omakase experience featuring hyper-seasonal fish, bamboo leaf carving, and dishes like chawanmushi with crab and wagashi.', 8);

INSERT INTO Place (Name, Address, Phone, OpeningTime, ClosingTime, Description, StopID)
VALUES ('AnnaLena', '1809 W. 1st Ave., Vancouver, V6J 5B8, Canada', NULL, '17:00:00', '23:00:00', 'Offers polished dining with seasonally inspired tasting menus and exceptional wine pairings.', 9);

INSERT INTO Place (Name, Address, Phone, OpeningTime, ClosingTime, Description, StopID)
VALUES ('Butchart Gardens', '800 Benvenuto Ave, Brentwood Bay, BC V8M 1J8', '(250) 652-5256', '09:00:00', '17:00:00', 'A stunning collection of floral displays and gardens.', 2);

INSERT INTO Place (Name, Address, Phone, OpeningTime, ClosingTime, Description, StopID)
VALUES ('Victoria Butterfly Gardens', '1461 Benvenuto Ave, Brentwood Bay, BC V8M 1J5', '(250) 544-0472', '10:00:00', '16:00:00', 'A tropical rainforest experience with butterflies and exotic plants.', 3);

INSERT INTO Place (Name, Address, Phone, OpeningTime, ClosingTime, Description, StopID)
VALUES ('English Bay Beach', 'Beach Ave, Vancouver, BC V6C 3E2', '(604) 555-7890', '06:00:00', '22:00:00', 'A popular beach with scenic waterfront views and activities.', 4);

INSERT INTO Place (Name, Address, Phone, OpeningTime, ClosingTime, Description, StopID)
VALUES ('Jericho Beach', '3941 Point Grey Rd, Vancouver, BC V6R 1B5', '(604) 555-6789', '06:00:00', '21:00:00', 'A sandy beach with stunning views of the mountains.', 5);

INSERT INTO Place (Name, Address, Phone, OpeningTime, ClosingTime, Description, StopID)
VALUES ('Lynn Canyon Park', '3663 Park Rd, North Vancouver, BC V7J 3G3', '(604) 555-2345', '08:00:00', '18:00:00', 'A park with trails, waterfalls, and a suspension bridge.', 9);

INSERT INTO Place (Name, Address, Phone, OpeningTime, ClosingTime, Description, StopID)
VALUES ('Okanagan Valley Wine Tours', 'Kelowna, BC V1V 2Y6', '(250) 555-1234', '10:00:00', '17:00:00', 'Explore wineries and taste local wines in the Okanagan Valley.', 10);

INSERT INTO Place (Name, Address, Phone, OpeningTime, ClosingTime, Description, StopID)
VALUES ('Summerhill Pyramid Winery', '4870 Chute Lake Rd, Kelowna, BC V1W 4M3', '(250) 555-5678', '11:00:00', '18:00:00', 'An organic winery with stunning views and a unique pyramid structure.', 6);

-- RetailBusiness
INSERT INTO RetailBusiness (Name, Address, Industry, PriceRange)
VALUES ('Hills of Kerrisdale', '2125 W 41st Ave, Vancouver, BC V6M 1Z6', 'Clothing Boutique', '$$$');

INSERT INTO RetailBusiness (Name, Address, Industry, PriceRange)
VALUES ('Aritzia', '1100 Robson St, Vancouver, BC V6E 1B2', 'Fashion Retail', '$$$');

INSERT INTO RetailBusiness (Name, Address, Industry, PriceRange)
VALUES ('MEC Vancouver', '111 2nd Ave E, Vancouver, BC V5T 1B4', 'Outdoor Gear', '$$');

INSERT INTO RetailBusiness (Name, Address, Industry, PriceRange)
VALUES ('Lululemon', '970 Robson St, Vancouver, BC V6Z 2E7', 'Athletic Wear', '$$$');

INSERT INTO RetailBusiness (Name, Address, Industry, PriceRange)
VALUES ('Vancouver Pen Shop', '512 W Hastings St, Vancouver, BC V6B 1L5', 'Specialty Retail', '$$$');

INSERT INTO RetailBusiness (Name, Address, Industry, PriceRange)
VALUES ('Roots', '779 Granville St, Vancouver, BC V6Z 1E4', 'Clothing', '$$');

INSERT INTO RetailBusiness (Name, Address, Industry, PriceRange)
VALUES ('Indigo', '1033 Robson St, Vancouver, BC V6E 1A9', 'Books', '$$');

INSERT INTO RetailBusiness (Name, Address, Industry, PriceRange)
VALUES ('Holt Renfrew', '737 Dunsmuir St, Vancouver, BC V7Y 1E4', 'Luxury Retail', '$$$$');

INSERT INTO RetailBusiness (Name, Address, Industry, PriceRange)
VALUES ('Apple Store', '701 W Georgia St, Vancouver, BC V7Y 1G5', 'Electronics', '$$$');

INSERT INTO RetailBusiness (Name, Address, Industry, PriceRange)
VALUES ('The Body Shop', '750 W Pender St, Vancouver, BC V6C 1G8', 'Cosmetics', '$');

-- Restaurant
INSERT INTO Restaurant (Name, Address, Cuisine, Capacity)
VALUES ('Vijs', '3106 Cambie St, Vancouver, BC V5Z 2W2', 'Indian', 100);

INSERT INTO Restaurant (Name, Address, Cuisine, Capacity)
VALUES ('Miku', '200 Granville St #70, Vancouver, BC V6C 1S4', 'Japanese', 150);

INSERT INTO Restaurant (Name, Address, Cuisine, Capacity)
VALUES ('Hawksworth Restaurant', '801 W Georgia St, Vancouver, BC V6C 1P7', 'Canadian', 120);

INSERT INTO Restaurant (Name, Address, Cuisine, Capacity)
VALUES ('Medina Cafe', '780 Richards St, Vancouver, BC V6B 3A4', 'Mediterranean', 60);

INSERT INTO Restaurant (Name, Address, Cuisine, Capacity)
VALUES ('Blue Water Cafe', '1095 Hamilton St, Vancouver, BC V6B 5T4', 'Seafood', 180);

INSERT INTO Restaurant (Name, Address, Cuisine, Capacity)
VALUES ('Glowbal', '590 W Georgia St, Vancouver, BC V6E 1A3', 'Contemporary', 200);

INSERT INTO Restaurant (Name, Address, Cuisine, Capacity)
VALUES ('Black+Blue', '1032 Alberni St, Vancouver, BC V6E 1A3', 'Steakhouse', 180);

INSERT INTO Restaurant (Name, Address, Cuisine, Capacity)
VALUES ('Joe Fortes', '777 Thurlow St, Vancouver, BC V6E 3V5', 'Seafood', 150);

INSERT INTO Restaurant (Name, Address, Cuisine, Capacity)
VALUES ('Chambar', '568 Beatty St, Vancouver, BC V6B 2L3', 'Belgian', 120);

INSERT INTO Restaurant (Name, Address, Cuisine, Capacity)
VALUES ('Tacofino', '15 W Cordova St, Vancouver, BC V6B 1C8', 'Mexican', 80);

INSERT INTO Restaurant (Name, Address, Cuisine, Capacity)
VALUES 
('iDen and QuanJuDe Beijing Duck House', '2808 Cambie St., Vancouver, V5Z 2V5, Canada', 'Chinese', 80);

INSERT INTO Restaurant (Name, Address, Cuisine, Capacity)
VALUES 
('Okeya Kyujiro', '1038 Mainland St., Vancouver, V6B 2T4, Canada', 'Japanese', 20);

INSERT INTO Restaurant (Name, Address, Cuisine, Capacity)
VALUES 
('AnnaLena', '1809 W. 1st Ave., Vancouver, V6J 5B8, Canada', 'Contemporary', 60);

-- Event
INSERT INTO Event (EventID, Name, Address, Title, EventDate, Rating, Description)
VALUES (1, 'Stanley Park', 'Vancouver, BC V6G 1Z4', 'Light Show', TO_DATE('2024-12-01', 'YYYY-MM-DD'), 5, 'A magical light show at the park.');

-- Event
INSERT INTO Event (EventID, Name, Address, Title, EventDate, Rating, Description)
VALUES (6, 'Stanley Park', 'Vancouver, BC V6G 1Z4', 'Rave Concert', TO_DATE('2024-12-02', 'YYYY-MM-DD'), 2, 'Come see your favourite DJs perform');

-- Event
INSERT INTO Event (EventID, Name, Address, Title, EventDate, Rating, Description)
VALUES (7, 'Stanley Park', 'Vancouver, BC V6G 1Z4', 'Bird Watching', TO_DATE('2024-12-05', 'YYYY-MM-DD'), 1, 'Come join us to find birds');

INSERT INTO Event (EventID, Name, Address, Title, EventDate, Rating, Description)
VALUES(2, 'Granville Island Public Market', '1669 Johnston St, Vancouver, BC V6H 3R9', 'Christmas Market', TO_DATE('2024-12-15', 'YYYY-MM-DD'), 4, 'Holiday-themed market.');

INSERT INTO Event (EventID, Name, Address, Title, EventDate, Rating, Description)
VALUES(3, 'Vancouver Aquarium', '845 Avison Way, Vancouver, BC V6G 3E2', 'Shark Week', TO_DATE('2024-11-10', 'YYYY-MM-DD'), 5, 'Special exhibits on sharks.');

INSERT INTO Event (EventID, Name, Address, Title, EventDate, Rating, Description)
VALUES(4, 'Science World', '1455 Quebec St, Vancouver, BC V6A 3Z7', 'New Tech Expo', TO_DATE('2024-11-01', 'YYYY-MM-DD'), 4, 'Showcasing latest technology.');

INSERT INTO Event (EventID, Name, Address, Title, EventDate, Rating, Description)
VALUES(5, 'Capilano Suspension Bridge', '3735 Capilano Rd, North Vancouver, BC V7R 4J1', 'Bridge Illumination', TO_DATE('2024-12-20', 'YYYY-MM-DD'), 5, 'The bridge is lit with thousands of lights.');

INSERT INTO Event (EventID, Name, Address, Title, EventDate, Rating, Description)
VALUES (12, 'Queen Elizabeth Park', '4600 Cambie St, Vancouver, BC V5Z 2Z1', 'Jazz Concert', TO_DATE('2024-12-05', 'YYYY-MM-DD'), 5, 'Live jazz!!');

INSERT INTO Event (EventID, Name, Address, Title, EventDate, Rating, Description)
VALUES (11, 'Kitsilano Beach', '1499 Arbutus St, Vancouver, BC V6J 5N2', 'Beach Volleyball Tournament', TO_DATE('2024-08-15', 'YYYY-MM-DD'), 4, 'Annual national volleyball competition');

INSERT INTO Event (EventID, Name, Address, Title, EventDate, Rating, Description)
VALUES (15, 'Canada Place', '999 Canada Pl, Vancouver, BC V6C 3E1', 'Fireworks Festival', TO_DATE('2024-07-01', 'YYYY-MM-DD'), 5, 'Spectacular Canada Day fireworks.');

INSERT INTO Event (EventID, Name, Address, Title, EventDate, Rating, Description)
VALUES (19, 'Pacific Centre', '701 W Georgia St, Vancouver, BC V7Y 1G5', 'Fashion Show', TO_DATE('2024-11-20', 'YYYY-MM-DD'), 4, 'Showcasing latest trends in Vancouver!');

INSERT INTO Event (EventID, Name, Address, Title, EventDate, Rating, Description)
VALUES (20, 'VanDusen Botanical Garden', '5151 Oak St, Vancouver, BC V6M 4H1', 'Garden Lights', TO_DATE('2024-12-20', 'YYYY-MM-DD'), 5, 'Holiday light display.');


--Reviews
INSERT INTO Reviews (UserID, Name, Address, ReviewDate, Rating, Message, Title)
VALUES (1, 'Granville Island Public Market', '1669 Johnston St, Vancouver, BC V6H 3R9', TO_DATE('2024-10-01', 'YYYY-MM-DD'), 5, 'Amazing and beautiful location. Food is fantastic.', 'Granville Island Rocks');

INSERT INTO Reviews (UserID, Name, Address, ReviewDate, Rating, Message, Title)
VALUES (9, 'Granville Island Public Market', '1669 Johnston St, Vancouver, BC V6H 3R9', TO_DATE('2024-12-01', 'YYYY-MM-DD'), 5, 'Amazing variety of fresh foods.', 'Food Paradise');

INSERT INTO Reviews (UserID, Name, Address, ReviewDate, Rating, Message, Title)
VALUES (10, 'Granville Island Public Market', '1669 Johnston St, Vancouver, BC V6H 3R9', TO_DATE('2024-12-05', 'YYYY-MM-DD'), 4, 'Great atmosphere but parking is tough.', 'Parking Woes');

INSERT INTO Reviews (UserID, Name, Address, ReviewDate, Rating, Message, Title)
VALUES (1, 'Vancouver Pen Shop', '512 W Hastings St, Vancouver, BC V6B 1L5', TO_DATE('2024-10-01', 'YYYY-MM-DD'), 3, 'I bought some awesome red pens', 'Great pens');

INSERT INTO Reviews (UserID, Name, Address, ReviewDate, Rating, Message, Title)
VALUES (2, 'Vancouver Pen Shop', '512 W Hastings St, Vancouver, BC V6B 1L5', TO_DATE('2024-11-01', 'YYYY-MM-DD'), 2, 'I bought some awesome blue pens', 'Ok pens');

INSERT INTO Reviews (UserID, Name, Address, ReviewDate, Rating, Message, Title)
VALUES (3, 'Vancouver Pen Shop', '512 W Hastings St, Vancouver, BC V6B 1L5', TO_DATE('2024-12-01', 'YYYY-MM-DD'), 4, 'I bought some awesome black pens', 'Awesome pens');

INSERT INTO Reviews (UserID, Name, Address, ReviewDate, Rating, Message, Title)
VALUES (4, 'Vancouver Pen Shop', '512 W Hastings St, Vancouver, BC V6B 1L5', TO_DATE('2024-01-01', 'YYYY-MM-DD'), 2, 'I bought some awesome yellow pens', 'Decent pens');

INSERT INTO Reviews (UserID, Name, Address, ReviewDate, Rating, Message, Title)
VALUES (5, 'Vancouver Pen Shop', '512 W Hastings St, Vancouver, BC V6B 1L5', TO_DATE('2024-02-01', 'YYYY-MM-DD'), 5, 'I bought some awesome green pens', 'Life Changing pens');

INSERT INTO Reviews (UserID, Name, Address, ReviewDate, Rating, Message, Title)
VALUES (2, 'Stanley Park', 'Vancouver, BC V6G 1Z4', TO_DATE('2024-10-01', 'YYYY-MM-DD'), 3, 'It was an average experience.', 'It''s a Park');

INSERT INTO Reviews (UserID, Name, Address, ReviewDate, Rating, Message, Title)
VALUES (3, 'Stanley Park', 'Vancouver, BC V6G 1Z4', TO_DATE('2024-10-01', 'YYYY-MM-DD'), 4, 'I had a lot of fun, but it is quite big.', 'Legs were Hurting');

INSERT INTO Reviews (UserID, Name, Address, ReviewDate, Rating, Message, Title)
VALUES (4, 'Stanley Park', 'Vancouver, BC V6G 1Z4', TO_DATE('2024-10-01', 'YYYY-MM-DD'), 3, 'Meh it is ight i guess',  'Meh');

INSERT INTO Reviews (UserID, Name, Address, ReviewDate, Rating, Message, Title)
VALUES (5, 'Stanley Park', 'Vancouver, BC V6G 1Z4', TO_DATE('2024-10-01', 'YYYY-MM-DD'), 1, 'Did not have fun, a bear chased me and ate my dog',  'Danger, do not go');

INSERT INTO Reviews (UserID, Name, Address, ReviewDate, Rating, Message, Title)
VALUES (1, 'Stanley Park', 'Vancouver, BC V6G 1Z4', TO_DATE('2024-10-01', 'YYYY-MM-DD'), 5, 'Beautiful park with amazing views and trails.', 'Great Park');

INSERT INTO Reviews (UserID, Name, Address, ReviewDate, Rating, Message, Title)
VALUES (6, 'Stanley Park', 'Vancouver, BC V6G 1Z4', TO_DATE('2024-11-01', 'YYYY-MM-DD'), 5, 'Great for a family picnic.', 'Picnic Perfect');

INSERT INTO Reviews (UserID, Name, Address, ReviewDate, Rating, Message, Title)
VALUES (7, 'Stanley Park', 'Vancouver, BC V6G 1Z4', TO_DATE('2024-11-05', 'YYYY-MM-DD'), 4, 'Lots of wildlife and trails.', 'Nature at Its Best');

INSERT INTO Reviews (UserID, Name, Address, ReviewDate, Rating, Message, Title)
VALUES (8, 'Stanley Park', 'Vancouver, BC V6G 1Z4', TO_DATE('2024-11-10', 'YYYY-MM-DD'), 3, 'A bit crowded but nice views.', 'Crowded but Nice');

INSERT INTO Reviews (UserID, Name, Address, ReviewDate, Rating, Message, Title)
VALUES (3, 'Science World', '1455 Quebec St, Vancouver, BC V6A 3Z7', TO_DATE('2024-10-20', 'YYYY-MM-DD'), 5, 'Incredible exhibits and activities.', 'Science Rocks');

INSERT INTO Reviews (UserID, Name, Address, ReviewDate, Rating, Message, Title)
VALUES (4, 'Science World', '1455 Quebec St, Vancouver, BC V6A 3Z7', TO_DATE('2024-11-15', 'YYYY-MM-DD'), 3, 'Nice place but a bit expensive.', 'Overpriced Fun');

INSERT INTO Reviews (UserID, Name, Address, ReviewDate, Rating, Message, Title)
VALUES (1, 'Miku', '200 Granville St #70, Vancouver, BC V6C 1S4', TO_DATE('2024-09-28', 'YYYY-MM-DD'), 4, 'Delicious sushi, though a bit pricey.', 'Yummyy!');

INSERT INTO Reviews (UserID, Name, Address, ReviewDate, Rating, Message, Title)
VALUES (2, 'Miku', '200 Granville St #70, Vancouver, BC V6C 1S4', TO_DATE('2024-09-28', 'YYYY-MM-DD'), 2, 'Sushi was not good at all, frozen', 'I did not like it');

INSERT INTO Reviews (UserID, Name, Address, ReviewDate, Rating, Message, Title)
VALUES (3, 'Miku', '200 Granville St #70, Vancouver, BC V6C 1S4', TO_DATE('2024-09-28', 'YYYY-MM-DD'), 1, 'It gave us food poisoning', 'DO NOT GO under any circumstances');

INSERT INTO Reviews (UserID, Name, Address, ReviewDate, Rating, Message, Title)
VALUES (4, 'Miku', '200 Granville St #70, Vancouver, BC V6C 1S4', TO_DATE('2024-09-28', 'YYYY-MM-DD'), 5, 'Sushi was bomb man, recommend this to anyone', 'This is fire yo');

INSERT INTO Reviews (UserID, Name, Address, ReviewDate, Rating, Message, Title)
VALUES (5, 'Miku', '200 Granville St #70, Vancouver, BC V6C 1S4', TO_DATE('2024-09-28', 'YYYY-MM-DD'), 4, 'Great sushi', 'Good place to go');

INSERT INTO Reviews (UserID, Name, Address, ReviewDate, Rating, Message, Title)
VALUES (3, 'Vijs', '3106 Cambie St, Vancouver, BC V5Z 2W2', TO_DATE('2024-09-30', 'YYYY-MM-DD'), 5, 'The best Indian food I have ever tasted!', 'Delicious');

INSERT INTO Reviews (UserID, Name, Address, ReviewDate, Rating, Message, Title)
VALUES (5, 'Vijs', '3106 Cambie St, Vancouver, BC V5Z 2W2', TO_DATE('2024-09-30', 'YYYY-MM-DD'), 5, 'Amazing Indian cuisine!', 'A True Gem');

INSERT INTO Reviews (UserID, Name, Address, ReviewDate, Rating, Message, Title)
VALUES (6, 'Miku', '200 Granville St #70, Vancouver, BC V6C 1S4', TO_DATE('2024-09-28', 'YYYY-MM-DD'), 4, 'Fantastic sushi and ambiance.', 'Sushi Heaven');

INSERT INTO Reviews (UserID, Name, Address, ReviewDate, Rating, Message, Title)
VALUES (7, 'Hawksworth Restaurant', '801 W Georgia St, Vancouver, BC V6C 1P7', TO_DATE('2024-10-12', 'YYYY-MM-DD'), 5, 'Elegant dining experience.', 'Fine Dining Excellence');

INSERT INTO Reviews (UserID, Name, Address, ReviewDate, Rating, Message, Title)
VALUES (8, 'Medina Cafe', '780 Richards St, Vancouver, BC V6B 3A4', TO_DATE('2024-10-02', 'YYYY-MM-DD'), 4, 'Delicious waffles and coffee.', 'Waffle Wonder');

INSERT INTO Reviews (UserID, Name, Address, ReviewDate, Rating, Message, Title)
VALUES (9, 'Blue Water Cafe', '1095 Hamilton St, Vancouver, BC V6B 5T4', TO_DATE('2024-09-25', 'YYYY-MM-DD'), 5, 'Best seafood in town.', 'Seafood Bliss');

INSERT INTO Reviews (UserID, Name, Address, ReviewDate, Rating, Message, Title)
VALUES (4, 'Blue Water Cafe', '1095 Hamilton St, Vancouver, BC V6B 5T4', TO_DATE('2024-09-25', 'YYYY-MM-DD'), 4, 'Amazing seafood and great atmosphere.', 'Good Food!');

INSERT INTO Reviews (UserID, Name, Address, ReviewDate, Rating, Message, Title)
VALUES (5, 'Medina Cafe', '780 Richards St, Vancouver, BC V6B 3A4', TO_DATE('2024-10-02', 'YYYY-MM-DD'), 5, 'Best brunch in Vancouver, their waffles are outstanding!', 'Best in VanCity');

INSERT INTO Reviews (UserID, Name, Address, ReviewDate, Rating, Message, Title)
VALUES (10, 'Roots', '779 Granville St, Vancouver, BC V6Z 1E4', TO_DATE('2024-11-01', 'YYYY-MM-DD'), 4, 'Good selection of Canadian wear.', 'Canadian Cool');

INSERT INTO Reviews (UserID, Name, Address, ReviewDate, Rating, Message, Title)
VALUES (1, 'Indigo', '1033 Robson St, Vancouver, BC V6E 1A9', TO_DATE('2024-11-05', 'YYYY-MM-DD'), 5, 'Best place for book lovers.', 'Books Galore');

INSERT INTO Reviews (UserID, Name, Address, ReviewDate, Rating, Message, Title)
VALUES (2, 'Holt Renfrew', '737 Dunsmuir St, Vancouver, BC V7Y 1E4', TO_DATE('2024-11-10', 'YYYY-MM-DD'), 3, 'Too pricey for my taste.', 'Luxury Overload');

INSERT INTO Reviews (UserID, Name, Address, ReviewDate, Rating, Message, Title)
VALUES (3, 'Apple Store', '701 W Georgia St, Vancouver, BC V7Y 1G5', TO_DATE('2024-11-15', 'YYYY-MM-DD'), 4, 'Great service but crowded.', 'Apple Frenzy');

INSERT INTO Reviews (UserID, Name, Address, ReviewDate, Rating, Message, Title)
VALUES (4, 'The Body Shop', '750 W Pender St, Vancouver, BC V6C 1G8', TO_DATE('2024-12-01', 'YYYY-MM-DD'), 5, 'Love their natural products.', 'Natural Beauty');

INSERT INTO Reviews (UserID, Name, Address, ReviewDate, Rating, Message, Title)
VALUES (1, 'Vancouver Aquarium', '845 Avison Way, Vancouver, BC V6G 3E2', TO_DATE('2024-10-10', 'YYYY-MM-DD'), 5, 'Loved the dolphin show!', 'Dolphin Delight');

INSERT INTO Reviews (UserID, Name, Address, ReviewDate, Rating, Message, Title)
VALUES (2, 'Vancouver Aquarium', '845 Avison Way, Vancouver, BC V6G 3E2', TO_DATE('2024-11-12', 'YYYY-MM-DD'), 4, 'Educational and fun for kids.', 'Great for Kids');

INSERT INTO Reviews (UserID, Name, Address, ReviewDate, Rating, Message, Title)
VALUES (1, 'iDen and QuanJuDe Beijing Duck House', '2808 Cambie St., Vancouver, V5Z 2V5, Canada', TO_DATE('2024-11-01', 'YYYY-MM-DD'), 5, 'The crispy duck is phenomenal, and the atmosphere is luxurious yet welcoming. Highly recommend!', 'Best Duck in Town');

INSERT INTO Reviews (UserID, Name, Address, ReviewDate, Rating, Message, Title)
VALUES (2, 'iDen and QuanJuDe Beijing Duck House', '2808 Cambie St., Vancouver, V5Z 2V5, Canada', TO_DATE('2024-11-15', 'YYYY-MM-DD'), 5, 'Every dish was a masterpiece! From the signature duck to the delicate abalone broth, everything exceeded expectations.', 'A Culinary Delight');

INSERT INTO Reviews (UserID, Name, Address, ReviewDate, Rating, Message, Title)
VALUES (3, 'Okeya Kyujiro', '1038 Mainland St., Vancouver, V6B 2T4, Canada', TO_DATE('2024-10-20', 'YYYY-MM-DD'), 5, 'An unforgettable omakase experience! The chefs are artists, and the ambiance is magical.', 'A True Omakase Experience'),

INSERT INTO Reviews (UserID, Name, Address, ReviewDate, Rating, Message, Title)
VALUES(4, 'Okeya Kyujiro', '1038 Mainland St., Vancouver, V6B 2T4, Canada', TO_DATE('2024-11-10', 'YYYY-MM-DD'), 5, 'Every detail was perfection. The uni petals and wagashi were absolute highlights of the night!', 'Perfect from Start to Finish');

INSERT INTO Reviews (UserID, Name, Address, ReviewDate, Rating, Message, Title)
VALUES (5, 'AnnaLena', '1809 W. 1st Ave., Vancouver, V6J 5B8, Canada', TO_DATE('2024-09-25', 'YYYY-MM-DD'), 5, 'The tasting menu is divine, with creative and flavorful dishes that rival the best in the world.', 'Refined and Delicious'),

INSERT INTO Reviews (UserID, Name, Address, ReviewDate, Rating, Message, Title)
VALUES (6, 'AnnaLena', '1809 W. 1st Ave., Vancouver, V6J 5B8, Canada', TO_DATE('2024-11-05', 'YYYY-MM-DD'), 5, 'Absolutely loved the attention to detail and the wine pairings. A must-visit for food lovers.', 'Exceptional Dining Experience');

INSERT INTO Reviews (UserID, Name, Address, ReviewDate, Rating, Message, Title)
VALUES (5, 'Tacofino', '15 W Cordova St, Vancouver, BC V6B 1C8', TO_DATE('2024-10-02', 'YYYY-MM-DD'), 1, 'Tacos gave me good poisoining, beware', 'Go at your own risk, tacos suck');

INSERT INTO Reviews (UserID, Name, Address, ReviewDate, Rating, Message, Title)
VALUES (1, 'Tacofino', '15 W Cordova St, Vancouver, BC V6B 1C8', TO_DATE('2024-10-02', 'YYYY-MM-DD'), 4, 'TThey have a great taco tuesday deal', 'Great tacos');

INSERT INTO Reviews (UserID, Name, Address, ReviewDate, Rating, Message, Title)
VALUES (2, 'Okeya Kyujiro', '1038 Mainland St., Vancouver, V6B 2T4, Canada', TO_DATE('2024-10-02', 'YYYY-MM-DD'), 4, 'Some of the best food I have had', 'Awesome japanese spot');

INSERT INTO Reviews (UserID, Name, Address, ReviewDate, Rating, Message, Title)
VALUES (3, 'Okeya Kyujiro', '1038 Mainland St., Vancouver, V6B 2T4, Canada', TO_DATE('2024-10-02', 'YYYY-MM-DD'), 5, 'Some of the best food I have had wow', 'Awesome amazing japanese spot');

-- Notification
INSERT INTO Notification (NotifID, Time, Message)
VALUES (1, TO_TIMESTAMP('2024-11-01 10:00:00', 'YYYY-MM-DD HH24:MI:SS'), 'New event: Light Show at Stanley Park');

INSERT INTO Notification (NotifID, Time, Message)
VALUES (2, TO_TIMESTAMP('2024-11-15 08:30:00', 'YYYY-MM-DD HH24:MI:SS'), 'Promotion: 20% off on Christmas Market tickets');

INSERT INTO Notification (NotifID, Time, Message)
VALUES (3, TO_TIMESTAMP('2024-11-05 09:00:00', 'YYYY-MM-DD HH24:MI:SS'), 'Shark Week is back at Vancouver Aquarium');

INSERT INTO Notification (NotifID, Time, Message)
VALUES (4, TO_TIMESTAMP('2024-11-20 12:00:00', 'YYYY-MM-DD HH24:MI:SS'), 'Check out the New Tech Expo at Science World');

INSERT INTO Notification (NotifID, Time, Message)
VALUES (5, TO_TIMESTAMP('2024-11-25 07:45:00', 'YYYY-MM-DD HH24:MI:SS'), 'Capilano Bridge Illumination tickets are available.');


-- Promotion
INSERT INTO Promotion (NotifID, Company, StartDate, EndDate)
VALUES(1, 'Stanley Park Society', TO_DATE('2024-11-01', 'YYYY-MM-DD'), TO_DATE('2024-12-01', 'YYYY-MM-DD'));

INSERT INTO Promotion (NotifID, Company, StartDate, EndDate)
VALUES (2, 'Granville Island', TO_DATE('2024-11-15', 'YYYY-MM-DD'), TO_DATE('2024-12-20', 'YYYY-MM-DD'));

INSERT INTO Promotion (NotifID, Company, StartDate, EndDate)
VALUES(3, 'Vancouver Aquarium', TO_DATE('2024-11-10', 'YYYY-MM-DD'), TO_DATE('2024-12-10', 'YYYY-MM-DD'));

INSERT INTO Promotion (NotifID, Company, StartDate, EndDate)
VALUES(4, 'Science World', TO_DATE('2024-11-01', 'YYYY-MM-DD'), TO_DATE('2024-11-30', 'YYYY-MM-DD'));

INSERT INTO Promotion (NotifID, Company, StartDate, EndDate)
VALUES(5, 'Capilano Suspension Bridge', TO_DATE('2024-12-01', 'YYYY-MM-DD'), TO_DATE('2024-12-31', 'YYYY-MM-DD'));

-- Alert
INSERT INTO Alert (NotifID, Type)
VALUES(1, 'Reminder');

INSERT INTO Alert (NotifID, Type)
VALUES(2, 'Promotion');

INSERT INTO Alert (NotifID, Type)
VALUES(3, 'Event Announcement');

INSERT INTO Alert (NotifID, Type)
VALUES(4, 'Event Update');

INSERT INTO Alert (NotifID, Type)
VALUES(5, 'Special Offer');

-- Receives
INSERT INTO Receives (UserID, NotifID)
VALUES(1, 1);

INSERT INTO Receives (UserID, NotifID)
VALUES(2, 2);

INSERT INTO Receives (UserID, NotifID)
VALUES(3, 3);

INSERT INTO Receives (UserID, NotifID)
VALUES(4, 4);

INSERT INTO Receives (UserID, NotifID)
VALUES(5, 5);

--Gift Cards
INSERT INTO GiftCard (GCID, Value, Franchise, UserID) 
VALUES (101, 50.00, 'Amazon', 1);

INSERT INTO GiftCard (GCID, Value, Franchise, UserID) 
VALUES (102, 100.00, 'Starbucks', 2);

INSERT INTO GiftCard (GCID, Value, Franchise, UserID) 
VALUES (103, 25.00, 'Walmart', 3);

INSERT INTO GiftCard (GCID, Value, Franchise, UserID) 
VALUES (104, 75.00, 'Best Buy', 4);

INSERT INTO GiftCard (GCID, Value, Franchise, UserID) 
VALUES (105, 150.00, 'Target', 5);

INSERT INTO GiftCard (GCID, Value, Franchise, UserID) 
VALUES (21, 50.00, 'Amazon', NULL);

INSERT INTO GiftCard (GCID, Value, Franchise, UserID) 
VALUES (22, 100.00, 'Starbucks', NULL);

INSERT INTO GiftCard (GCID, Value, Franchise, UserID) 
VALUES (23, 25.00, 'Walmart', NULL);

INSERT INTO GiftCard (GCID, Value, Franchise, UserID) 
VALUES (24, 75.00, 'Best Buy', NULL);

INSERT INTO GiftCard (GCID, Value, Franchise, UserID) 
VALUES (25, 150.00, 'Target', 1);

--Gift Card Points Values
INSERT INTO GCPoints (Value, Points) 
VALUES (50.00, 100);

INSERT INTO GCPoints (Value, Points) 
VALUES (100.00, 200);

INSERT INTO GCPoints (Value, Points) 
VALUES (25.00, 50);

INSERT INTO GCPoints (Value, Points) 
VALUES (75.00, 150);

INSERT INTO GCPoints (Value, Points) 
VALUES (150.00, 300);

--Travel Pass
INSERT INTO TravelPass (PassID, Name, Cost, StartDate, EndDate, UserID) 
VALUES (1, 'City Explorer', 120.00, TO_DATE('2024-10-01', 'YYYY-MM-DD'), TO_DATE('2024-10-07', 'YYYY-MM-DD'), 1);

INSERT INTO TravelPass (PassID, Name, Cost, StartDate, EndDate, UserID) 
VALUES (2, 'Outdoor Fun', 250.00, TO_DATE('2024-11-05', 'YYYY-MM-DD'), TO_DATE('2024-11-12', 'YYYY-MM-DD'), 2);

INSERT INTO TravelPass (PassID, Name, Cost, StartDate, EndDate, UserID) 
VALUES (3, 'Mountain Adventure', 300.00, TO_DATE('2024-12-01', 'YYYY-MM-DD'), TO_DATE('2024-12-10', 'YYYY-MM-DD'), 3);

INSERT INTO TravelPass (PassID, Name, Cost, StartDate, EndDate, UserID) 
VALUES (4, 'History Enthusiast', 180.00, TO_DATE('2024-09-20', 'YYYY-MM-DD'), TO_DATE('2024-09-28', 'YYYY-MM-DD'), 4);

INSERT INTO TravelPass (PassID, Name, Cost, StartDate, EndDate, UserID) 
VALUES (5, 'Cultural Experience', 150.00, TO_DATE('2024-10-15', 'YYYY-MM-DD'), TO_DATE('2024-10-22', 'YYYY-MM-DD'), 5);

INSERT INTO TravelPass (PassID, Name, Cost, StartDate, EndDate, UserID) 
VALUES (6, 'Island Getaway', 200.00, TO_DATE('2024-08-01', 'YYYY-MM-DD'), TO_DATE('2024-08-07', 'YYYY-MM-DD'), NULL);

INSERT INTO TravelPass (PassID, Name, Cost, StartDate, EndDate, UserID) 
VALUES (7, 'Beachside Bliss', 180.00, TO_DATE('2024-07-10', 'YYYY-MM-DD'), TO_DATE('2024-07-15', 'YYYY-MM-DD'), NULL);

INSERT INTO TravelPass (PassID, Name, Cost, StartDate, EndDate, UserID) 
VALUES (8, 'Culinary Delight', 220.00, TO_DATE('2024-10-25', 'YYYY-MM-DD'), TO_DATE('2024-10-30', 'YYYY-MM-DD'), NULL);

INSERT INTO TravelPass (PassID, Name, Cost, StartDate, EndDate, UserID) 
VALUES (9, 'Adventure Trail', 270.00, TO_DATE('2024-11-15', 'YYYY-MM-DD'), TO_DATE('2024-11-20', 'YYYY-MM-DD'), NULL);

INSERT INTO TravelPass (PassID, Name, Cost, StartDate, EndDate, UserID) 
VALUES (10, 'Wine and Dine', 240.00, TO_DATE('2024-09-05', 'YYYY-MM-DD'), TO_DATE('2024-09-10', 'YYYY-MM-DD'), NULL);

--Travel Pass Inclusions
INSERT INTO Includes (PassID, Name, Address) 
VALUES (4, 'Vancouver Aquarium', '845 Avison Way, Vancouver, BC V6G 3E2');

INSERT INTO Includes (PassID, Name, Address) 
VALUES (3, 'Grouse Mountain', '6400 Nancy Greene Way, North Vancouver, BC V7R 4K9');

INSERT INTO Includes (PassID, Name, Address) 
VALUES (1, 'Science World', '1455 Quebec St, Vancouver, BC V6A 3Z7');

INSERT INTO Includes (PassID, Name, Address) 
VALUES (2, 'Capilano Suspension Bridge', '3735 Capilano Rd, North Vancouver, BC V7R 4J1');

INSERT INTO Includes (PassID, Name, Address) 
VALUES (5, 'Museum of Vancouver', '1100 Chestnut St, Vancouver, BC V6J 3J9');

-- INSERT INTO Includes (PassID, Name, Address) 
-- VALUES (6, 'Butchart Gardens', '800 Benvenuto Ave, Brentwood Bay, BC V8M 1J8');

-- INSERT INTO Includes (PassID, Name, Address) 
-- VALUES (6, 'Victoria Butterfly Gardens', '1461 Benvenuto Ave, Brentwood Bay, BC V8M 1J5');

-- INSERT INTO Includes (PassID, Name, Address) 
-- VALUES (7, 'English Bay Beach', 'Beach Ave, Vancouver, BC V6C 3E2');

-- INSERT INTO Includes (PassID, Name, Address) 
-- VALUES (7, 'Jericho Beach', '3941 Point Grey Rd, Vancouver, BC V6R 1B5');

INSERT INTO Includes (PassID, Name, Address) 
VALUES (8, 'Granville Island Public Market', '1669 Johnston St, Vancouver, BC V6H 3R9');

INSERT INTO Includes (PassID, Name, Address) 
VALUES (9, 'Lynn Canyon Park', '3663 Park Rd, North Vancouver, BC V7J 3G3');

INSERT INTO Includes (PassID, Name, Address) 
VALUES (10, 'Okanagan Valley Wine Tours', 'Kelowna, BC V1V 2Y6');

INSERT INTO Includes (PassID, Name, Address) 
VALUES (10, 'Summerhill Pyramid Winery', '4870 Chute Lake Rd, Kelowna, BC V1W 4M3');

SET DEFINE OFF;

-- Commit all changes to make them visible
COMMIT;

