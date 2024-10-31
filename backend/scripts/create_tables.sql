CREATE TABLE Users (
    user_id NUMBER PRIMARY KEY,
    username VARCHAR(50) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    password VARCHAR(100) NOT NULL,
    created_at DATE DEFAULT SYSDATE 
);

CREATE TABLE Locations (
    location_id NUMBER PRIMARY KEY,
    name VARCHAR2(100) NOT NULL,
    description VARCHAR2(500),
    address VARCHAR2(200),
    city VARCHAR2(50) DEFAULT 'Vancouver',
    postal_code VARCHAR2(10),
    created_at DATE DEFAULT SYSDATE
);

