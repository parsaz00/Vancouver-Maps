/* Prob have to make this dynamic somehow */
SELECT rest.Name, rest.Address 
FROM Restaurant rest 
INNER JOIN /* Not all restaurants are places */
    Places p ON rest.Name = p.Name AND rest.Address = p.Address
LEFT JOIN 
    Reviews r ON r.Name = rest.Name AND r.Address = rest.Address
WHERE Cuisine = 'Chinese'
GROUP BY 
    rest.Name 
HAVING 
    AVG(r.Rating) > 3



