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

# Task Breakdown
Overview:
Our timeline has four major parts: (1) Writing SQL queries (2) Creating an API to integrate backend (queries) with front end (REACT app). (3) Create GUI and integrate API into it (4) Debugging/Testing/Bugger space

The task breakdown is as follows:

Timeline:
## Queries done by November 5th (Broken down below):

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


## API done by November 15th 
This task will require colloboration as needed. For individual tasks:
Parsa implement HTTPS protocols for the following:
(1) 2.1.1 INSERT
(2) 2.1.6 Join
(3) 2.1.7 Aggregation with GROUP BY

Ethan implement HTTPS protocols for the following:
(1) 2.1.8 Aggregation with HAVING
(2) 2.1.5 Projection
(3) 2.1.4 Selection

Matthew implement HTTPS protocols for the following:
(1) 2.1.3 DELETE
(2) 2.1.2 UPDATE
(3) 2.1.9 Nested aggregation with GROUP BY

## Group: Once individual parts are finished, meet and test integration of entire API together. 

## GUI and API integration November 22nd

## Group task: Meet and design front end concept by November 17th 

Parsa implement front-end/GUI features that demonstrate the following capabilities:
(1) 2.1.1 INSERT
(2) 2.1.6 Join
(3) 2.1.7 Aggregation with GROUP BY

Ethan implement front-end/GUI features that demonstrate the following capabilities:
(1) 2.1.8 Aggregation with HAVING
(2) 2.1.5 Projection
(3) 2.1.4 Selection

Matthew implement front-end/GUI features that demonstrate the following capabilities:
(1) 2.1.3 DELETE
(2) 2.1.2 UPDATE
(3) 2.1.9 Nested aggregation with GROUP BY


Group work: Throughout we will be holding re-occuring standups to evaluate if any of our above features can be worked on in conjunction between multiple team members. For example, if group decides to create a drop down selection to chose whether you want to add (INSERT) or delete (DELETE) something, Matthew and Parsa would design this feature together. 


### Deadlines Summary:

**Novemeber 5th:** Group members have finished their individual queries and tests them 

**November 15th:** Group members have created the necessary API parts for their above written queries

**Novemeber 22th:** GUI and API integration are finished 

The remaining time until the deadline is left as a buffer period, and a period to continue testing.

## Potential Challenges:
1. Knowing the tech stack: Potential bottleneck for task completition if group memeber does not have a appropriate understand of the tech stack to be used: JS, OracleDB and REACT. To counterattack this, group has comitted to finish tutorials 5, 6 and 7 as soon as possible, to leave buffer time to get extra practice and help as needed.
2. Midterms and other deadlines: The team has left adequate time for each task and has committed to working on the project a minimum of 30 minutes a day starting from October 28th. This will ensure that each team member is making progress each day. Further we have allocated a 1 week buffer before the deadline to account for extraneous circumstances that may impede progress
3. Group member accountability. To address that all members are doing an equal amount of work, we will be meeting three times a week for a "standup" following traditional scrum methodologies where we will highlight what we have worked on since the last meeting, what we are currently working on, and any roadbloacks that we are facing.


### Enjoy!
