-- Insert into Users table
INSERT INTO Users (UserID, Phone, Email, Points)
VALUES (1, '123-456-7890', 'user1@example.com', 100);

-- Insert into TransitStop table
INSERT INTO TransitStop (StopID, Type, Latitude, Longitude)
VALUES (1, 'Bus Stop', 49.2827, -123.1207);

-- Insert into Place table
INSERT INTO Place (Name, Address, Phone, OpeningTime, ClosingTime, Description, StopID)
VALUES ('Cafe', '123 Main St', '123-456-7891', '08:00', '22:00', 'A cozy cafe', 1);

-- Insert into Reviews table
INSERT INTO Reviews (UserID, Name, Address, ReviewDate, Rating, Message)
VALUES (1, 'Cafe', '123 Main St', TO_DATE('2024-11-01', 'YYYY-MM-DD'), 5, 'Great coffee and ambiance!');
