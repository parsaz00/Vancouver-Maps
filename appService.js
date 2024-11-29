const oracledb = require('oracledb');
const loadEnvFile = require('./utils/envUtil');
const { connect } = require('./appController');
const envVariables = loadEnvFile('./.env');

// Database configuration setup. Ensure your .env file has the required database credentials.
const dbConfig = {
    user: envVariables.ORACLE_USER,
    password: envVariables.ORACLE_PASS,
    connectString: `${envVariables.ORACLE_HOST}:${envVariables.ORACLE_PORT}/${envVariables.ORACLE_DBNAME}`,
    poolMin: 2,
    poolMax: 10,
    poolIncrement: 2,
    poolTimeout: 60
};

// initialize connection pool
async function initializeConnectionPool() {
    try {
        await oracledb.createPool(dbConfig);
        console.log('Connection pool started');
    } catch (err) {
        console.error('Initialization error: ' + err.message);
    }
}

async function closePoolAndExit() {
    console.log('\nTerminating');
    try {
        await oracledb.getPool().close(10); // 10 seconds grace period for connections to finish
        console.log('Pool closed');
        process.exit(0);
    } catch (err) {
        console.error(err.message);
        process.exit(1);
    }
}

initializeConnectionPool();

process
    .once('SIGTERM', closePoolAndExit)
    .once('SIGINT', closePoolAndExit);


// ----------------------------------------------------------
// Wrapper to manage OracleDB actions, simplifying connection handling.
async function withOracleDB(action) {
    let connection;
    try {
        connection = await oracledb.getConnection(); // Gets a connection from the default pool 
        return await action(connection);
    } catch (err) {
        console.error(err);
        throw err;
    } finally {
        if (connection) {
            try {
                await connection.close();
            } catch (err) {
                console.error(err);
            }
        }
    }
}


// ----------------------------------------------------------
// Core functions for database operations
// Modify these functions, especially the SQL queries, based on your project's requirements and design.
async function testOracleConnection() {
    return await withOracleDB(async (connection) => {
        return true;
    }).catch(() => {
        return false;
    });
}

async function fetchDemotableFromDb() {
    return await withOracleDB(async (connection) => {
        const result = await connection.execute('SELECT * FROM DEMOTABLE');
        return result.rows;
    }).catch(() => {
        return [];
    });
}

async function initiateDemotable() {
    return await withOracleDB(async (connection) => {
        try {
            await connection.execute(`DROP TABLE DEMOTABLE`);
        } catch(err) {
            console.log('Table might not exist, proceeding to create...');
        }

        const result = await connection.execute(`
            CREATE TABLE DEMOTABLE (
                id NUMBER PRIMARY KEY,
                name VARCHAR2(20)
            )
        `);
        return true;
    }).catch(() => {
        return false;
    });
}

async function insertDemotable(id, name) {
    return await withOracleDB(async (connection) => {
        const result = await connection.execute(
            `INSERT INTO DEMOTABLE (id, name) VALUES (:id, :name)`,
            [id, name],
            { autoCommit: true }
        );

        return result.rowsAffected && result.rowsAffected > 0;
    }).catch(() => {
        return false;
    });
}

async function updateNameDemotable(oldName, newName) {
    return await withOracleDB(async (connection) => {
        const result = await connection.execute(
            `UPDATE DEMOTABLE SET name=:newName where name=:oldName`,
            [newName, oldName],
            { autoCommit: true }
        );

        return result.rowsAffected && result.rowsAffected > 0;
    }).catch(() => {
        return false;
    });
}

async function countDemotable() {
    return await withOracleDB(async (connection) => {
        const result = await connection.execute('SELECT Count(*) FROM DEMOTABLE');
        return result.rows[0][0];
    }).catch(() => {
        return -1;
    });
}

// ----------------------------------------------------------
// Functions for our 10 query implementations

/** 
 * 2.1.1 Insert
 * Inserts data into a table while ensuring foreign key constraints hold.
 * If a violation occurs, the operation will fail
 * 
 * @async 
 * @function insertWithForeignKeyCheck
 * @param {string} tableName - Name of the table to insert into
 * @param {Array<string>} columns - Columns for the insert 
 * @param {Array<any>} values - Values corresponding to the columns
 * @returns {Promise<Array<Object>>} A promise to resolve an array of place 
*/
async function insertWithForeignKeyCheck(tableName, columns, values) {
    return await withOracleDB(async (connection) => {
        try {
            const columnsList = columns.join(', ');
            const placeholders = columns.map((col, index) => {
                // If the column is "ReviewDate", apply TO_DATE with 'DD-MON-YYYY'
                if (col === 'ReviewDate') {
                    return `TO_DATE(:${index + 1}, 'DD-MON-YYYY')`;
                }
                return `:${index + 1}`;
            }).join(', ');

            console.log('Inserting values:', { tableName, columns, values });
            const sql = `INSERT INTO ${tableName} (${columnsList}) VALUES (${placeholders})`;

            const result = await connection.execute(sql, values, { autoCommit: true });

            if (result.rowsAffected && result.rowsAffected > 0) {
                return { success: true, message: 'Record inserted successfully.' };
            } else {
                return { success: false, message: 'Insertion failed.' };
            }
        } catch (error) {
            console.error('Error in insertWithForeignKeyCheck:', error);
            if (error.errorNum === 2291) { // ORA-02291: foreign key constraint violation
                return {
                    success: false,
                    message: `Foreign key constraint violated. Ensure referenced values exist.`,
                };
            } else if (error.errorNum === 1) { // ORA-00001: unique constraint violation
                if(tableName == 'Reviews') {
                    return {
                        success: false,
                        message: `Titles must be unique!`,
                    };
                }
                return {
                    success: false,
                    message: `Unique constraint violated. Record with this primary key may already exist.`,
                };
            } else {
                return {
                    success: false,
                    message: `An unexpected error occurred: ${error.message}`,
                };
            }
        }
    });
}

/**
 * 2.1.2 Update
 * Updates the message of a review in the Reviews table.
 * 
 * @async
 * @function updateReview
 * @param {number} userID - The ID of the user who wrote the review
 * @param {string} name - The name of the reviewed entity
 * @param {string} address - The address of the reviewed entity
 * @param {number} newValue - The new value for the review
 * @param {string} newMessage - The new message for the review
 * @returns {Promise<number>} A promise resolving to the number of rows updated
 */
async function updateReview(userID, name, address, newValue, newMessage, newTitle, newDate) {
    return await withOracleDB(async (connection) => {
        console.log("Updating review for userID:", userID, "name:", name, "address:", address);

        const result = await connection.execute(
            `UPDATE Reviews
             SET Message = :newMessage,
                 Rating = :newValue,
                 Title = :newTitle,
                 ReviewDate = TO_DATE(:newDate, 'YYYY-MM-DD')
             WHERE UserID = :userID AND Name = :name AND Address = :address`,
            {
                userID,
                name,
                address,
                newValue,
                newMessage,
                newTitle,
                newDate
            },
            { autoCommit: true }
        );
        return result.rowsAffected;
    });
}

/**
 * 2.1.3 Delete
 * Deletes a review from the Reviews table using UserID, Name, and Address.
 * 
 * @async
 * @function deleteReview
 * @param {number} userID - The ID of the user who wrote the review.
 * @param {string} name - The name of the place associated with the review.
 * @param {string} address - The address of the place associated with the review.
 * @returns {Promise<number>} A promise to the number of rows deleted.
 */
async function deleteReview(userID, name, address) {
    return await withOracleDB(async (connection) => {
        console.log("Deleting review for UserID:", userID, "Name:", name, "Address:", address);
        const result = await connection.execute(
            `DELETE FROM Reviews
             WHERE UserID = :userID AND Name = :name AND Address = :address`,
            {
                userID: userID,
                name: name,
                address: address
            },
            { autoCommit: true }
        );
        return result.rowsAffected;
    });
}

/**
 * 2.1.3 Delete
 * Deletes a review from the Notifications table using NotifID (added to achieve on-delete cascade requirement)
 * 
 * @async
 * @function deleteReview
 * @param {number} userID - The ID of the notification to be deleted
 * @returns {Promise<number>} A promise to the number of rows deleted.
 */
async function deleteNotification(notifID) {
    return await withOracleDB(async (connection) => {
        try {
            const sql = `DELETE FROM Notification WHERE NotifID = :notifID`;
            const binds = { notifID };

            const result = await connection.execute(sql, binds, { autoCommit: true });

            console.log(`Rows affected: ${result.rowsAffected}`);
            return result.rowsAffected; // Returns number of rows deleted
        } catch (error) {
            console.error(`Database error: ${error.message}`);
            throw error; // Rethrow to be handled in the router
        }
    });
}

/** 
 * 2.1.4 Selection
 * Select records from the Place table based on user input.
 * The format of user input is “cats = true AND colour = brindled OR colour = snowshoe”
 * as mentioned in the additional notes in 2.1.4
 * 
 * Parsing Logic for no direct implementation of user input into the WHERE query is in the appController
 * 
 * @async 
 * @function selectingPlace 
 * @param {string} condition - The WHERE clause condition that was created via the router in appController.js
 * @returns {Promise<Array<Object>>} A promise to resolve an array to the object
 */

async function selectingPlace(condition) {
    return await withOracleDB(async (connection) => {
        const query = `SELECT * FROM Place WHERE ${condition}`;
        console.log('Executing query to select a place:', query);

        const result = await connection.execute(query);
        console.log("Successful query", result.rows);

        return result.rows;
    }).catch((err) => {
        console.error('Error in selectingPlace:', err);
        throw err;
    });
}

/** 
 * 2.1.5 Projection 
 * Description - Projects attributes from all the places
 * @async 
 * @function projectFromPlace
 * @param {Array<string>} selectedAttributes - Attributes of the table to select 
 * @returns {Promise<Array<Object>>} A promise to resolve an array of place 
 * @throws {Error} Throw an invalid attribute that is included in our selectedAttributes
*/
async function projectFromPlace(selectedAttributes) {
    return await withOracleDB(async (connection) => {
        const validAttributes = ['Name', 'Address', 'Phone', 'OpeningTime', 'ClosingTime', 'Description', 'StopID'];
        selectedAttributes.forEach(attr => {
            if (!validAttributes.includes(attr)) {
                throw new Error(`Invalid attribute: ${attr}`);
            }
        });
        const columns = selectedAttributes.join(', ');

        const result = await connection.execute(`SELECT ${columns} FROM Place`);
        const mappedResult = result.rows.map(row => {
            const rowObject = {};
            selectedAttributes.forEach((attr, index) => {
                rowObject[attr] = row[index];
            });
            return rowObject;
        });

        console.log("Successful query", mappedResult);
        return mappedResult;
    }).catch((err) => {
        console.error('Error in projectFromPlace:', err);
        throw err;
    });
}

/**
 * 2.1.6 JOIN
 * Find all events occuring at a Place
 * 
 * @aync 
 * @function getEventsAtPlace
 * @param {string} placeName - Name of place 
 * @param {string} placeADdress - Address of place 
 * @returns {Promise<Array<Object>>} - A promise to resolve an array of the event
 */
async function getEventsAtPlace(placeName, placeAddress) {
    return await withOracleDB(async (connection) => {
        console.log("Executing join query to obtain all events occuring in a place: ", placeName, placeAddress);
        const result = await connection.execute(
            `SELECT p.Name, p.Address, e.EventID, e.Title, e.EventDate, e.Description
             FROM Place p
             JOIN Event e ON p.Name = e.Name AND p.Address = e.Address
             WHERE p.Name = :placeName AND p.Address = :placeAddress`,
            [placeName, placeAddress] // binds placeName and placeAddress to query parameters
        );
        console.log("Query executed successfully:", result.rows);
        return result.rows;
    })
}

/**
 * Retrieves notifications for a specific user by performing a join query
 *
 * @async
 * @function getUserNotifications
 * @param {number} userId - Gets the userID
 * @returns {Promise<Array<Object>>} A promise that resolves to an array of notification promises
 */
async function getUserNotifications(userId) {
    return await withOracleDB(async (connection) => {
        console.log("Executing join query for notifications...");
        const result = await connection.execute(
            `SELECT u.UserID, u.Email, n.Time, n.Message
             FROM Users u
             JOIN Receives r ON u.UserID = r.UserID
             JOIN Notification n ON r.NotifID = n.NotifID
             WHERE u.UserID = :userId`,
            [userId] // binds userId to :userId in the query
        );
        console.log("Query executed successfully:", result.rows);
        return result.rows;
    });
}


/**
 * 2.1.7 Aggregation with Group By
 * Get the average rating of each event
 * 
 * @async 
 * @function getAverageEventRatingPerPlace
 * @returns {Promise<Array<Object>>} A promise to resolve an array of the object
 */
async function getAverageEventRatingPerPlace() {
    return await withOracleDB(async (connection) => {
        console.log("Executing aggregation query for average event rating per place");
        const query = `
            SELECT e.Name, e.Address, AVG(e.Rating) AS average_rating
            FROM Event e
            GROUP BY e.Name, e.Address
            HAVING AVG(e.Rating) IS NOT NULL
        `;
        const result = await connection.execute(query);
        console.log("Query executed successfully:", result.rows);
        return result.rows;
    });
}

/** 
 * 2.1.8 Aggregation with Having 
 * Retrieves cuisines with an average rating above a specified threshold 
 * 
 * @async 
 * @function getCuisinesAboveThreshold
 * @param {number} threshold - Minimum average rating threshold
 * @returns {Promise<Array<Object>>} A promise to resolve an array to the object
 */
async function getCuisinesAboveThreshold(threshold) {
    return await withOracleDB(async (connection) => {
        console.log("Executing query to obtain cuisines with average rating above threshold:", threshold);

        const query = `
            SELECT r.Cuisine, AVG(rv.Rating) AS AverageRating
            FROM Restaurant r
            JOIN Reviews rv ON r.Name = rv.Name AND r.Address = rv.Address
            GROUP BY r.Cuisine
            HAVING AVG(rv.Rating) >= :threshold
        `;
        try {
            const result = await connection.execute(
                query,
                { threshold },
                { outFormat: oracledb.OUT_FORMAT_OBJECT }
            );
            console.log("Query executed successfully:", result.rows);
            return result.rows.map(row => ({
                Cuisine: row.CUISINE,
                AverageRating: row.AVERAGERATING
            }));
        } catch (error) {
            console.error("Error executing getCuisinesAboveThreshold:", error);
            throw error;
        }
    });
}

/** 
 * 2.1.9 Nested Group by
 * Retrieves the highest average rating for each place type using a nested group by query
 * 
 * @async 
 * @function getHighestAverageRatingRestaurant
 * @returns {Promise<Array<Object>>} A promise to resolve an array to the object
 */
async function getHighestAverageRatingRestaurant() {
    return await withOracleDB(async (connection) => {
        console.log("Fetching the restaurant with the highest average rating");
        try {
            const result = await connection.execute(
                `SELECT p.Name, p.Address, AVG(r.Rating) AS AvgRating
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
                 ORDER BY p.Name`
            );

            console.log("Query executed successfully");
            console.log('Raw Results from Database:', result);

            if (result.rows.length === 0) {
                console.log('No top-rated restaurants found.');
                return [];
            }
            return result.rows.map(row => ({
                Name: row[0],
                Address: row[1],
                AverageRating: row[2],
            }));
        } catch (error) {
            console.error('Error executing query for top-rated restaurants:', error);
            throw error;
        }
    });
}

/**
 * 2.1.10 Divison 
 * Retrieves the places that have been reviewed by all users in the database
 * @async
 * @function getPlacesReviewedByAll
 * @returns {Promise<Array<Object>>} A promise to an array of objects, where each object contains the name and address of a place reviewed by all users.
 */
async function getPlacesReviewedByAll() {
    return await withOracleDB(async (connection) => {
        const query = `
            SELECT P.Name, P.Address
            FROM Place P
            WHERE NOT EXISTS (
                SELECT U.UserID
                FROM Users U
                WHERE NOT EXISTS (
                    SELECT R.Name, R.Address
                    FROM Reviews R
                    WHERE R.Name = P.Name
                    AND R.Address = P.Address
                    AND R.UserID = U.UserID
                )
            )
        `;
        console.log("Executing division query");
        const result = await connection.execute(query);
        console.log("Results of query: ", result);
        return result.rows.map(row => ({
            Name: row[0],
            Address: row[1]
        }));
    });
}

// ----------------------------------------------------------
// Utility functions for our webapp 

/**
 * Fetch events happening after a certain date
 * @async
 * @function fetchEventsAfterDate
 * @param {string} date A date to fetch events after 
 * @returns {Promise<Array<Object>>} A promise to an array of objects
 */
async function fetchEventsAfterDate(date) {
    return await withOracleDB(async (connection) => {
        const result = await connection.execute(
            `SELECT EventID, Title, EventDate, Description, Name, Address 
             FROM Event 
             WHERE EventDate >= :currentDate 
             ORDER BY EventDate ASC`,
            [date] // Bind the current date to the query
        );
        return result.rows;
    });
}

/**
 * Function to retrieve the giftcards owned by a user 
 * Gets them based on UserId
 * 
 * @async 
 * @function getUserGiftCards
 * @param {number} userId - fetch userId
 * @returns {Promise<Array<Object>} A promise for each array of gift cards
 */
async function getUserGiftCards(userId) {
    return await withOracleDB(async (connection) => {
        console.log("Executing join query to obtain giftcards owned by User: ", userId);
        const result = await connection.execute(
            `SELECT u.UserID, u.Email, gc.GCID, gc.Value, gc.Franchise
             FROM Users u
             JOIN GiftCard gc ON u.UserID = gc.UserID
             WHERE u.UserID = :userId`,
            [userId],
            { outFormat: oracledb.OUT_FORMAT_OBJECT }
        );
        console.log("Query executed successfully:", result.rows);
        return result.rows;
    })
}

/**
 * Fetches available gift cards
 * @async
 * @function fetchAvailableGiftCards
 * @returns {Promise<Array<Object>>} A promise to an array of objects
 */
async function fetchAvailableGiftCards() {
    return await withOracleDB(async (connection) => {
        const result = await connection.execute(
            `SELECT g.GCID, g.VALUE, g.FRANCHISE, p.POINTS
             FROM GiftCard g
             JOIN GCPoints p ON g.VALUE = p.VALUE
             WHERE g.USERID IS NULL`,
            [],
            { outFormat: oracledb.OUT_FORMAT_OBJECT }
        );
        return result.rows;
    });
}

/**
 * Redeems a gift card
 * @param {number} userId 
 * @param {number} giftCardId 
 * @returns the number of rows affected
 */
async function redeemGiftCard(userId, giftCardId) {
    return await withOracleDB(async (connection) => {
        await connection.execute(`SAVEPOINT redeemGiftCard`);

        try {
            const cardResult = await connection.execute(
                `SELECT g.VALUE, p.POINTS
                 FROM GiftCard g
                 JOIN GCPoints p ON g.VALUE = p.VALUE
                 WHERE g.GCID = :giftCardId AND g.USERID IS NULL`,
                [giftCardId],
                { outFormat: oracledb.OUT_FORMAT_OBJECT }
            );

            if (!cardResult.rows.length) {
                return { success: false, message: 'Gift card not available or already redeemed.' };
            }

            const { POINTS } = cardResult.rows[0];
            const userResult = await connection.execute(
                `SELECT POINTS FROM Users WHERE USERID = :userId`,
                [userId],
                { outFormat: oracledb.OUT_FORMAT_OBJECT }
            );

            if (!userResult.rows.length) {
                return { success: false, message: 'User not found.' };
            }

            const userPoints = userResult.rows[0].POINTS;
            if (userPoints < POINTS) {
                return {
                    success: false,
                    message: `Insufficient points to redeem the gift card. You need ${POINTS - userPoints} more points.`,
                };
            }

            const userUpdateResult = await connection.execute(
                `UPDATE Users SET POINTS = POINTS - :points WHERE USERID = :userId`,
                [POINTS, userId],
                { autoCommit: false }
            );

            const giftCardUpdateResult = await connection.execute(
                `UPDATE GiftCard SET USERID = :userId WHERE GCID = :giftCardId`,
                [userId, giftCardId],
                { autoCommit: false }
            );

            if (giftCardUpdateResult.rowsAffected === 0) {
                throw new Error('Failed to update gift card.');
            }

            await connection.commit();

            return {
                success: true,
                message: 'Gift card redeemed successfully.',
                rowsUpdated: userUpdateResult.rowsAffected + giftCardUpdateResult.rowsAffected,
            };
        } catch (error) {
            await connection.execute(`ROLLBACK TO SAVEPOINT redeemGiftCard`);
            throw error;
        }
    });
}

/**
 * Function to retrieve the travel passes owned by a user 
 * Gets them based on UserId
 * 
 * @async 
 * @function getUserTravelPass
 * @param {number} userId - fetch userId
 * @returns {Promise<Array<Object>} A promise for each array of tavel passes
 */
async function getUserTravelPass(userId) {
    return await withOracleDB(async (connection) => {
        console.log("Executing join query to obtain giftcards owned by User: ", userId);
        const result = await connection.execute(
            `SELECT u.UserID, u.Email, tp.PassID, tp.Name, tp.Cost, tp.StartDate, tp.EndDate 
             FROM Users u
             JOIN TravelPass tp ON u.UserID = tp.UserID
             WHERE u.UserID = :userId`,
            [userId],
            { outFormat: oracledb.OUT_FORMAT_OBJECT }
        );
        console.log("Query executed successfully:", result.rows);
        return result.rows;
    })
}

/**
 * Fetches all available travel passes (unassigned to any user)
 * @async
 * @function fetchAvailableTravelPasses
 * @returns {Promise<Array<Object>>} A promise that resolves to the list of available transit passes
 */
async function fetchAvailableTravelPasses() {
    return await withOracleDB(async (connection) => {
        console.log('Fetching available travel passes');
        const result = await connection.execute(
            `SELECT tp.PassID, tp.Name, tp.Cost, tp.StartDate, tp.EndDate
             FROM TravelPass tp
             WHERE tp.UserID IS NULL`,
            [],
            { outFormat: oracledb.OUT_FORMAT_OBJECT }
        );
        console.log('Available travel passes fetched successfully:', result.rows);
        return result.rows;
    });
}



/**
 * Find events before a specific date
 * 
 * @aync 
 * @function fetchEventsBeforeDate
 * @param {string} Date - Fetch events before this date
 * @returns {Promise<Array<Object>>} - A promise to resolve an array of the event
 */
async function fetchEventsBeforeDate(date) {
    return await withOracleDB(async (connection) => {
        const result = await connection.execute(
            `SELECT EventID, Title, EventDate, Description, Name, Address 
             FROM Event 
             WHERE EventDate < :currentDate 
             ORDER BY EventDate DESC`,
            [date] // Bind the current date to the query
        );
        return result.rows;
    });
}

/**
 * Add an event into our event table
 * 
 * @aync 
 * @function addEvent
 * @param {string} eventData - Add an event to our webapp
 * @returns {Promise<Array<Object>>} - A promise to resolve an array of the event
 */
async function addEvent(eventData) {
    const { title, date, description, name, address } = eventData;

    return await withOracleDB(async (connection) => {
        try {
            // Fetch the maximum EventID and calculate the next ID
            const result = await connection.execute(`SELECT NVL(MAX(EventID), 0) + 1 AS NextEventID FROM Event`);
            const nextEventID = result.rows[0][0];

            // Insert the new event
            const insertResult = await connection.execute(
                `INSERT INTO Event (EventID, Title, EventDate, Description, Name, Address) 
                 VALUES (:eventID, :title, TO_DATE(:eventDate, 'YYYY-MM-DD'), :description, :name, :address)`,
                {
                    eventID: nextEventID,
                    title,
                    eventDate: date,
                    description,
                    name,
                    address
                },
                { autoCommit: true }
            );

            if (insertResult.rowsAffected > 0) {
                return { success: true };
            } else {
                return { success: false, message: 'Failed to insert event' };
            }
        } catch (error) {
            console.error('Error adding event:', error);

            if (error.errorNum === 2291) {
                return { success: false, message: 'Foreign key constraint violation. Ensure place exists.' };
            } else {
                throw error;
            }
        }
    });
}

/**
 * Fetches user reviews by user ID.
 * 
 * @async
 * @function getReviewsByUser
 * @param {string} userId - The ID of the user whose reviews are being fetched
 * @returns {Promise<Array<Object>>} Resolves an array of review containing name, address, review date, rating, message, and title.
 */
async function getReviewsByUser(userId) {
    return await withOracleDB(async (connection) => {
        const result = await connection.execute(
            `SELECT Name, Address, ReviewDate, Rating, Message, Title
            FROM Reviews
            WHERE UserID = :userId
            ORDER BY ReviewDate DESC`,
           [userId]
       );
       return result.rows;
    });
}

/**
 * Fetches all places.
 * 
 * @async
 * @function getAllPlaces
 * @returns {Promise<Array<Object>>} Resolves to an place objects of names and places
 */
async function getAllPlaces() {
    return await withOracleDB(async (connection) => {
        const result = await connection.execute(
            `SELECT Name, Address FROM Place ORDER BY Name`
        );
        return result.rows.map((row) => ({
            Name: row[0],
            Address: row[1],
        }));
    });
}

/**
 * Fetches all restaurants
 * 
 * @async
 * @function getAllRestaurants
 * @returns {Promise<Array<Object>>} Resolves restaurant objects containing name and address
 */
async function getAllRestaurants() {
    return await withOracleDB(async (connection) => {
        const result = await connection.execute(
            `SELECT Name, Address FROM Restaurant ORDER BY Name`
        );
        const mappedRows = result.rows.map(row => ({
            Name: row[0],
            Address: row[1]
        }));

        return mappedRows;
    });
}

/**
 * Fetches user reviews and all places
 * 
 * @async
 * @function getReviewsAndPlaces
 * @param {number} userId - ID of the user whose reviews are being fetched
 * @returns {Promise<Object>} Resolves to an object containing two arrays
 */
async function getReviewsAndPlaces(userId) {
    return await withOracleDB(async (connection) => {
        try {
            // Execute the reviews query
            const reviewsResult = await connection.execute(
                `SELECT Name, Address, ReviewDate, Rating, Message
                 FROM Reviews
                 WHERE UserID = :userId
                 ORDER BY ReviewDate DESC`,
                [userId]
            );

            // Execute the places query
            const placesResult = await connection.execute(
                `SELECT Name, Address FROM Place ORDER BY Name`
            );

            // Return combined results
            return {
                reviews: reviewsResult.rows,
                places: placesResult.rows.map((row) => ({
                    name: row[0],
                    address: row[1],
                })),
            };
        } catch (error) {
            console.error("Error in getReviewsAndPlaces:", error);
            throw error; // Bubble up error
        }
    });
}

/**
 * Fetches all notifications a user ID
 * 
 * @async
 * @function getAllNotifications
 * @param {string} userId - The ID of the user notifications
 * @returns {Promise<Array<Object>>} Resolves to an array of notifications
 */
async function getAllNotifications(userId) {
    return await withOracleDB(async (connection) => {
        const query = `
            SELECT n.NotifID, n.Message, NULL AS Type, 'Notification' AS Source
            FROM Notification n
            WHERE n.NotifID NOT IN (SELECT NotifID FROM Alert UNION SELECT NotifID FROM Promotion)
            
            UNION ALL
            
            SELECT n.NotifID, n.Message, a.Type, 'Alert' AS Source
            FROM Notification n
            JOIN Alert a ON n.NotifID = a.NotifID
            
            UNION ALL
            
            SELECT n.NotifID, n.Message, NULL AS Type, 'Promotion' AS Source
            FROM Notification n
            JOIN Promotion p ON n.NotifID = p.NotifID
        `;
        const result = await connection.execute(query);
        return result.rows.map(row => ({
            NotifID: row[0],
            Message: row[1],
            Type: row[2],
            Source: row[3],
        }));
    });
}


module.exports = {
    testOracleConnection,
    fetchDemotableFromDb,
    initiateDemotable,
    getAllPlaces, 
    insertDemotable, 
    updateNameDemotable, 
    countDemotable,
    getUserGiftCards,
    getReviewsByUser,
    getEventsAtPlace,
    getAverageEventRatingPerPlace,
    insertWithForeignKeyCheck,
    getReviewsAndPlaces,
    projectFromPlace,
    getCuisinesAboveThreshold,
    selectingPlace,
    withOracleDB,
    getUserNotifications,
    deleteReview,
    updateReview,
    getHighestAverageRatingRestaurant,
    fetchEventsAfterDate,
    fetchEventsBeforeDate,
    addEvent,
    getAllRestaurants,
    fetchAvailableGiftCards,
    redeemGiftCard,
    getAllNotifications,
    getUserTravelPass,
    fetchAvailableTravelPasses,
    getPlacesReviewedByAll,
    deleteNotification
};
