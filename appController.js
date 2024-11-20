const express = require('express');
const appService = require('./appService');
const { events } = require('oracledb');
const { withOracleDB } = require('./appService');

const router = express.Router();

// ----------------------------------------------------------
// API endpoints
// Modify or extend these routes based on your project's needs.
router.get('/check-db-connection', async (req, res) => {
    const isConnect = await appService.testOracleConnection();
    if (isConnect) {
        res.send('connected');
    } else {
        res.send('unable to connect');
    }
});

router.get('/demotable', async (req, res) => {
    const tableContent = await appService.fetchDemotableFromDb();
    res.json({data: tableContent});
});

router.post("/initiate-demotable", async (req, res) => {
    const initiateResult = await appService.initiateDemotable();
    if (initiateResult) {
        res.json({ success: true });
    } else {
        res.status(500).json({ success: false });
    }
});

router.post("/insert-demotable", async (req, res) => {
    const { id, name } = req.body;
    const insertResult = await appService.insertDemotable(id, name);
    if (insertResult) {
        res.json({ success: true });
    } else {
        res.status(500).json({ success: false });
    }
});

router.post("/update-name-demotable", async (req, res) => {
    const { oldName, newName } = req.body;
    const updateResult = await appService.updateNameDemotable(oldName, newName);
    if (updateResult) {
        res.json({ success: true });
    } else {
        res.status(500).json({ success: false });
    }
});

router.get('/count-demotable', async (req, res) => {
    const tableCount = await appService.countDemotable();
    if (tableCount >= 0) {
        res.json({ 
            success: true,  
            count: tableCount
        });
    } else {
        res.status(500).json({ 
            success: false, 
            count: tableCount
        });
    }
});

/**
 * Accept a request from client that specifies table name, cols, and values 
 * Validate input to ensure correct format
 * Call insertWithForeignKeyCheck fun in appService.js to perform actual insert operation
 * Return success or failure to client based on outcome of insert
 */
router.post('/insert', async (req, res) => {
    const { tableName, columns, values } = req.body;

    // Basic validation of input 
    if (!tableName || !Array.isArray(columns) || !Array.isArray(values)) {
        return res.status(400).json({ success: false, message: 'Invalid input format. Ensure that tableName, columns, and values are provided in the correct format.' });
    }
    if (columns.length !== values.length) {
        return res.status(400).json({ success: false, message: 'The number of columns and values must match.' });
    }

    try {
        // Call insert func in appService.js
        const result = await appService.insertWithForeignKeyCheck(tableName, columns, values);
        if (result.success) {
            res.status(200).json(result); // Success response
        } else {
            res.status(400).json(result); // Failure response due to foreign key or other constraint violation
        }
    } catch (error) {
        console.error('Insert operation failed: ', error);
        res.status(500).json({ success: false, message: 'An error occurred while inserting the record.' });
    }
});

// getUserNotifications
router.get('/user-notifications', async (req, res) => {
    const { userId } = req.query;

    if (!userId) {
        return res.status(400).json({ success: false, message: 'UserID is required' });
    }

    try {
        const notifications = await appService.getUserNotifications(userId);
        res.status(200).json({ sucess: true, data: notifications });
    } catch (error) {
        console.error('Error fetching notifications:', error);
        res.status(500).json({ success: false, message: 'Failed to fetch notifications' });
    }
});

// Get giftards for user with id === UserId
router.get('/user-giftcards', async (req, res) => {
    const { userId} = req.query;

    if (!userId) {
        return res.status(400).json({ success: false, message: 'UserId is required' });
    }

    try {
        const giftCards = await appService.getUserGiftCards(userId);
        res.status(200).json({ success: true, data: giftCards });
    } catch (error) {
        console.error('Error fetching giftcards:', error);
        res.status(500).json({ success:false, message: 'Failed to fetch notifications' });
    }
});

// Get all events occuring at a place
router.get('/place-events', async (req, res) => {
    const { placeName, placeAddress} = req.query;

    if (!placeName || !placeAddress) {
        return res.status(400).json({ success: false, message: "placeAddress and placeName is required" });
    }

    try {
        const events = await appService.getEventsAtPlace(placeName, placeAddress);
        res.status(200).json({ success: true, data: events });
    } catch (error) {
        console.error('Error fetching events: ', error);
        res.status(500).json({ success:false, message: 'Failed to fetch notifications' });
    }
});

// Get average rating of events occuring at a place
router.get('/average-event-rating', async (req, res) => {
    try {
        const ratings = await appService.getAverageEventRatingPerPlace();
        res.status(200).json({ success: true, data: ratings });
    } catch (error) {
        console.error('Error fetching average event rating:', error);
        res.status(500).json({ success: false, message: 'Failed to fetch average event ratings'});
    }
});

module.exports = router;

// Login endpoint 
router.get('/login', async (req, res) => {
    const { email, phone } = req.query;

    if (!email && !phone) {
        return res.status(400).json({ success: false, message: "Email or phone number is required" });
    }

    try {
        const query = email
            ? `SELECT * FROM Users WHERE Email = :email`
            : `SELECT * FROM Users WHERE Phone = :phone`;

        const value = email || phone;

        const result = await withOracleDB(async (connection) => {
            return await connection.execute(query, [value]);
        });

        if (result.rows.length > 0) {
            res.status(200).json({ success: true, data: result.rows });
        } else {
            res.status(404).json({ success: false, message: "User not found" });
        }
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ success: false, message: "Login failed" });
    }
});

// Fetch all events (upcoming and past)
router.get('/events', async (req, res) => {
    const currentDate = new Date();

    try {
        const upcomingEvents = await appService.fetchEventsAfterDate(currentDate);
        const pastEvents = await appService.fetchEventsBeforeDate(currentDate);

        res.json({ upcomingEvents, pastEvents });
    } catch (error) {
        console.error('Error fetching events:', error);
        res.status(500).json({ error: 'Failed to fetch events' });
    }
});

// Add a new event
router.post('/add-event', async (req, res) => {
    const { title, date, description, name, address } = req.body;

    if (!title || !date || !name || !address) {
        return res.status(400).json({ error: 'Missing required fields: title, date, name, address' });
    }

    try {
        const result = await appService.addEvent({ title, date, description, name, address });

        if (result.success) {
            res.json({ success: true, message: 'Event added successfully!' });
        } else {
            res.status(400).json({ success: false, message: result.message });
        }
    } catch (error) {
        console.error('Error adding event:', error);
        res.status(500).json({ error: 'Failed to add event' });
    }
});

