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

// async function insertWithForeignKeyCheck(tableName, columns, values) {
//     return await withOracleDB(async (connection) => {
//         try {
//             const columnsList = columns.join(', ');
//             const placeholders = columns.map((_, index) => `:${index + 1}`).join(', ');
//             console.log('Inserting values:', { tableName, columns, values });
//             const sql = `INSERT INTO ${tableName} (${columnsList}) VALUES (${placeholders})`;

//             const result = await connection.execute(sql, values, { autoCommit: true });

//             if (result.rowsAffected && result.rowsAffected > 0) {
//                 return { success: true, message: 'Record inserted successfully.' };
//             } else {
//                 return { success: false, message: 'Insertion failed.' };
//             }
//         } catch (error) {
//             console.error('Error in insertWithForeignKeyCheck:', error);
//             if (error.errorNum === 2291) { // ORA-02291: foreign key constraint violation
//                 return {
//                     success: false,
//                     message: `Foreign key constraint violated. Ensure referenced values exist.`,
//                 };
//             } else if (error.errorNum === 1) { // ORA-00001: unique constraint violation
//                 return {
//                     success: false,
//                     message: `Unique constraint violated. Record with this primary key may already exist.`,
//                 };
//             } else {
//                 return {
//                     success: false,
//                     message: `An unexpected error occurred: ${error.message}`,
//                 };
//             }
//         }
//     });
// }

/** 
 * 2.1.1 Insert
 * Description - Inserts a table and checks for foreign key constraints
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
 * 2.1.6 Join
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
 * Description - Function to retrieve the giftcards owned by a user 
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
            [userId] // binds userId to :userId in the quer
        );
        console.log("Query executed successfully:", result.rows);
        return result.rows;
    })
}

/**
 * Find all events occuring at a Place, example of join --> WILL USE THIS FOR MY DYNAMIC JOIN FOR NOW, IF I HAVE TIME I WILL SUPPOPRT OTHER ONES
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
        let column = "";
        for (let i = 0; i < selectedAttributes.length; i++) {
            if (!validAttributes.includes(selectedAttributes[i])) {
                throw new Error(`Invalid attribute: ${selectedAttributes[i]}`);
            }
            column += selectedAttributes[i];
            if (i < selectedAttributes.length - 1) {
                column += ", ";
            }
        }

        const result = await connection.execute(
            `SELECT ${column} FROM Place`
        );
        console.log("Successful query", result.rows);

        return result.rows;
    }).catch((err) => {
        console.error('Error in projectFromPlace:', err);
        throw err;
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
        `;
        const result = await connection.execute(query);
        console.log("Query executed successfully:", result.rows);
        return result.rows;
    });
}

/** 
 * 2.1.8 Aggregation with Having 
 * Description - Retrieves cuisines with an average rating above a specified threshold 
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
            HAVING AVG(rv.Rating) > :threshold
        `;
        const result = await connection.execute(query, { threshold });
        console.log("Query executed successfully:", result.rows);
        return result.rows;
    });
}

/** 
 * 2.1.6 Selection
 * Description - Select records from the Place table based on a condition
 * Parsing Logic and Where clause created via the app controller
 * 
 * @async 
 * @function selectingPlace 
 * @param {string} condition - The WHERE clause condition that was created via appController
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
 * 2.1.3 Delete
 * Description - Delete a review from the Reviews table using UserID, Name, and Address.
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
async function updateReview(userID, name, address, newValue, newMessage) {
    return await withOracleDB(async (connection) => {
        console.log("Updating review message for userID:", userID, "name:", name, "address:", address);
        const result = await connection.execute(
            `UPDATE Reviews
             SET Message = :newMessage, Value = :newValue
             WHERE UserID = :userID AND Name = :name AND Address = :address`,
            {
                userID,
                name,
                address,
                newValue,
                newMessage
            },
            { autoCommit: true }
        );
        return result.rowsAffected;
    });
}

/** 
 * 2.1.9 Nested Group by
 * Description - Retrieves the highest average rating for each place type using a nested group 
 * by query
 * 
 * @async 
 * @function getHighestAverageRatingRestaurant
 * @returns {Promise<Array<Object>>} A promise to the number of rows needed to be deleted
 */
/*
2.1.9 Nested Group By
**/
async function getHighestAverageRatingRestaurant() {
    return await withOracleDB(async (connection) => {
        console.log("Fetching highest average rating per place type");
        const result = await connection.execute(
            `SELECT *
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
             WHERE ROWNUM = 1;`
        );
        console.log("Query executed successfully");
        return result.rows;
    });
}

// Fetch events happening after a certain date
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

// Fetch events happening before a certain date
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

// Fetch user reviews for userId
async function getReviewsByUser(userId) {
    return await withOracleDB(async (connection) => {
        const result = await connection.execute(
            `SELECT Name, Address, ReviewDate, Rating, Message
            FROM Reviews
            WHERE UserID = :userId
            ORDER BY ReviewDate DESC`,
           [userId]
       );
       return result.rows;
    });
}

async function getAllPlaces() {
    return await withOracleDB(async (connection) => {
        const result = await connection.execute(
            `SELECT Name, Address FROM Place ORDER BY Name`
        );
        return result.rows.map((row) => ({
            name: row[0],
            address: row[1],
        }));
    });
}

// async function getReviewsAndPlaces(userId) {
//     return await withOracleDB(async (connection) => {
//         const reviewsQuery = `
//             SELECT Name, Address, ReviewDate, Rating, Message
//             FROM Reviews
//             WHERE UserID = :userId
//             ORDER BY ReviewDate DESC
//         `;
//         const placesQuery = `SELECT Name, Address FROM Place ORDER BY Name`;

//         const [reviewsResult, placesResult] = await Promise.all([
//             connection.execute(reviewsQuery, [userId]),
//             connection.execute(placesQuery)
//         ]);

//         return {
//             reviews: reviewsResult.rows,
//             places: placesResult.rows.map((row) => ({
//                 name: row[0],
//                 address: row[1],
//             })),
//         };
//     });
// }
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
    addEvent
};
