const oracledb = require('oracledb');
const loadEnvFile = require('./utils/envUtil');
const { connect } = require('./appController');



const envVariables = loadEnvFile('./.env');

// Database configuration setup. Ensure your .env file has the required database credentials.
const dbConfig = {
    user: envVariables.ORACLE_USER,
    password: envVariables.ORACLE_PASS,
    connectString: `${envVariables.ORACLE_HOST}:${envVariables.ORACLE_PORT}/${envVariables.ORACLE_DBNAME}`,
    poolMin: 1,
    poolMax: 3,
    poolIncrement: 1,
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
//             // Construct the column list and placeholder list for the SQL statement
//             const columnsList = columns.join(', ');
//             const placeholders = columns.map((_, index) => `:${index + 1}`).join(', ');

//             // Dynamic SQL INSERT statement 
//             const sql = `INSERT INTO ${tableName} (${columnsList}) VALUES (${placeholders})`;

//             // Execute statement with the provided vals
//             const result = await connection.execute(sql, values, { autoCommit: false});

//             // Check if insert was successful 
//             if (result.rowsAffected && result.rowsAffected > 0) {
//                 await connection.commit();
//                 return { success: true, message: 'Record inserted successfully.' };
//             } else {
//                 return { success: false, message: 'Insertion failed.' };
//             }
//         } catch (error) {
//             if (error.errorNum === 2291) { // ORA-02291: integrity constraint (foreign key constraint) violated
//                 return {
//                     success: false,
//                     message: `Foreign key constraint violated. Please make sure referenced values exist.`,
//                 };
//             }
//             console.error('Error in insertWithForeignKeyCheck: ', error);
//             throw error;
//         }
//     });
// }

async function insertWithForeignKeyCheck(tableName, columns, values) {
    return await withOracleDB(async (connection) => {
        try {
            const columnsList = columns.join(', ');
            const placeholders = columns.map((_, index) => `:${index + 1}`).join(', ');
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

// Dynamic join
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
 * Function to retrieve the giftcards owned by a user 
 * Gets them based on UserId
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
 * Find all events occuring at a Place, example of join
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
 * Query to get average rating of events at each place
 * To support 2.1.7
 */
async function getAverageEventRatingPerPlace() {
    return await withOracleDB(async (connection) => {
        console.log("Executing aggregation query for average event rating per place");
        const result = await connection.execute(
            `SELECT e.Name, e.Address, AVG(e.Rating) AS average_rating
            FROM Event e
            GROUP BY e.Name, e.Address`
       );
       console.log("Query executed successfully: ", result.rows);
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




module.exports = {
    testOracleConnection,
    fetchDemotableFromDb,
    initiateDemotable, 
    insertDemotable, 
    updateNameDemotable, 
    countDemotable,
    getUserGiftCards,
    getEventsAtPlace,
    getAverageEventRatingPerPlace,
    insertWithForeignKeyCheck,
    withOracleDB,
    getUserNotifications,
    fetchEventsAfterDate,
    fetchEventsBeforeDate,
    addEvent
};