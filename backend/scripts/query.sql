SELECT *
FROM (
    SELECT p.Name, p.Address, AVG(r.Rating) AS AvgRating
    FROM Place p
    JOIN Restaurant res ON p.Name = res.Name AND p.Address = res.Address
    JOIN Reviews r ON p.Name = r.Name AND p.Address = r.Address
    GROUP BY p.Name, p.Address
    HAVING AVG(r.Rating) = (
        SELECT MAX(AvgRating)
        FROM (
            SELECT AVG(r.Rating) AS AvgRating
            FROM Place p
            JOIN Restaurant res ON p.Name = res.Name AND p.Address = res.Address
            JOIN Reviews r ON p.Name = r.Name AND p.Address = r.Address
            GROUP BY p.Name, p.Address
        )
    )
    ORDER BY p.Name
)
WHERE ROWNUM = 1;
