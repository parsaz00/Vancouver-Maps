-- Formatting (grabbed from chat gpt) to make output more clean
-- Set column formatting for readability
COLUMN UserID FORMAT 9999;
COLUMN Email FORMAT A30;
COLUMN PlaceName FORMAT A20;
COLUMN Address FORMAT A30;
COLUMN Rating FORMAT 9;
COLUMN Message FORMAT A40;
COLUMN AverageRating FORMAT 9.99;


-- PARSA QUERIES: insert is done in the test data
-- Query for join 
-- Find users and their reviews for places
SELECT u.UserID, u.Email, p.Name AS PlaceName, p.Address, r.Rating, r.Message
FROM Users u
JOIN Reviews r ON u.UserID = r.UserID
JOIN Place p ON r.Name = p.Name AND r.Address = p.Address;

-- Aggregation with GROUP BY
-- Calculate the average rating for each place
SELECT p.Name AS PlaceName, p.Address, AVG(r.Rating) AS AverageRating
FROM Place p
JOIN Reviews r ON p.Name = r.Name AND p.Address = r.Address
GROUP BY p.Name, p.Address;
