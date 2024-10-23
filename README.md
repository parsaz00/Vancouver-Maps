# VancouverMaps 
## Project Description
Our application focuses on community engagement, local exploration, and tourism. This project will help users discover Vancouver’s hidden gems of lesser-known foods, events, and recreation activities encouraging users to explore the whole extent of Vancouver. By providing references like costs, reviews, and transit options, this application will be a city exploration tool that highlights community experiences. 

## Development Stack 
The project will use the department-provided **Oracle database** for storing and managing data related to users, locations, events, and transactions. The application will be developed with **JavaScript (Node.js)** and **React.js**.

## ER Diagram 
Our ER Diagram for this project is the following: <br/>
![Screenshot 2024-10-23 at 4 13 33 PM](https://github.students.cs.ubc.ca/CPSC304-2024W-T1/project_d0l9u_p7m3b_y7n9r/assets/29139/4ef8768c-6a9f-4d94-a1e3-919a0af3c7b9)

## SQL DDL Example 
Here is an example of one of our DDL tables for this project. Below represents our place entity:
```sql
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
```
## Insert Statement 
Here is an insert statement for this table:
``` sql
INSERT INTO Place (Name, Address, Phone, OpeningTime, ClosingTime, Description, StopID)
VALUES ('Capilano Suspension Bridge', '3735 Capilano Rd, North Vancouver, BC V7R 4J1', '(604) 654-3210', '09:00:00', '19:00:00', 'A long suspension bridge offering forest views.', 5);
```

### Enjoy!
