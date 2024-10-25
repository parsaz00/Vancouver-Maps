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

### Task Breakdown
Overview:
Our timeline has four major parts: (1) Writing SQL queries (2) Creating an API to integrate backend (queries) with front end (REACT app). (3) Create GUI and integrate API into it (4) Debugging/Testing/Bugger space

The task breakdown is as follows:

Parsa:
(1) 2.1.1 INSERT
(2) 2.1.6 Join
(3) 2.1.7 Aggregation with GROUP BY

Ethan:
(1) 2.1.8 Aggregation with HAVING
(2) 2.1.5 Projection
(3) 2.1.4 Selection

Matthew:
(1) 2.1.3 DELETE
(2) 2.1.2 UPDATE
(3) 2.1.9 Nested aggregation with GROUP BY


GROUP TASKS:
Implementing the API to connect our backend (our database) with our front end (GUI). Each group member will specifically develop the necessary API calls for their above QUERIES


GUI: As we approach the building GUI phase, we will have a better understanding of specific tasks. For now, we have left it so that each team member will be working on it together


### Deadlines:

Novemeber 5th: Group members have finished their individual queries and tests them 

November 15: Group members have created the necessary API parts for their above written queries

Novemeber 22: GUI and API integration are finished 

The remaining time until the deadline is left as a buffer period, and a period to continue testing.
### Enjoy!
