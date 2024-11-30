const express = require('express');
const appService = require('./appService');
const { events } = require('oracledb');
const { withOracleDB } = require('./appService');
const { insertSanitization, sanitization } = require('./utils');
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

// ----------------------------------------------------------
// Routes for our 10 queries 

/**
 * 2.1.1 Insert
 * Accept a request from client that specifies table name, cols, and values 
 * Validate input to ensure correct format
 * Call insertWithForeignKeyCheck fun in appService.js to perform actual insert operation
 * Return success or failure to client based on outcome of insert
 * 
 * @route POST /insert
 * @description Inserts record into the table
 * @param {Request} req - Contains tableName, columns, and values 
 * @param {Response} res - Returns success or failure status.
 */
router.post('/insert', async (req, res) => {
    const { tableName, columns, values } = req.body;

    if (!insertSanitization(tableName)) {
        return res.status(400).json({ success: false, message: 'Invalid tableName format.' });
    }
    for (const column of columns) {
        if (!insertSanitization(column)) {
            return res.status(400).json({ success: false, message: `Invalid column name detected: ${column}` });
        }
    }
    for (const value of values) {
        if (!insertSanitization(value)) {
            return res.status(400).json({ success: false, message: `Invalid value detected: ${value}` });
        }
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

/**
 * 2.1.2 Update 
 * Updates user reivew values and message from the webapp
 * 
 * @route PUT /reviews
 * @description Updates a review's value and message
 * @param {Request} req - Contains userID, name, address, newValue, newMessage, newTitle, and newDate in the body
 * @param {Response} res - Returns success or failure status
 */
router.put('/reviews', async (req, res) => {
    const { userID, name, address, newValue, newMessage, newTitle, newDate } = req.body;
    
    if (!userID || !name || !address || newValue === undefined || !newMessage || !newTitle || !newDate) {
        return res.status(400).json({
            success: false,
            message: "userID, name, address, newValue, newMessage, newTitle, and newDate are required"
        });
    }

    try {
        const rowsUpdated = await appService.updateReview(userID, name, address, newValue, newMessage, newTitle, newDate);

        if (rowsUpdated > 0) {
            return res.status(200).json({
                success: true,
                message: 'Review updated successfully'
            });
        } else {
            return res.status(404).json({
                success: false,
                message: 'Review not found or not authorized to update'
            });
        }
    } catch (error) {
        console.error('Error updating review:', error);
        return res.status(500).json({
            success: false,
            message: 'Failed to update review'
        });
    }
});

/**
 * 2.1.3 Delete
 * Deletes reviews from the reviews table
 * 
 * @route DELETE /reviews
 * @description Deletes a review by UserID, Name, and Address.
 * @param {Request} req - Contains UserID, Name, and Address in the body.
 * @param {Response} res - Returns success or failure status.
 */
router.delete('/reviews', async (req, res) => {
    const { userID, name, address } = req.body;
    if (!userID || !name || !address) {
        return res.status(400).json({ success: false, message: "UserID, Name, and Address are required." });
    }

    try {
        const rowsDeleted = await appService.deleteReview(userID, name, address);
        if (rowsDeleted > 0) {
            res.status(200).json({ success: true, message: 'Review deleted successfully.' });
        } else {
            res.status(404).json({ success: false, message: 'Review not found or not authorized to delete.' });
        }
    } catch (error) {
        console.error('Error deleting review:', error);
        res.status(500).json({ success: false, message: 'Failed to delete review.' });
    }
});

/**
 * Extra delete on notifications to achieve on-delete-cascade
 * 
 * @route DELETE /notifications
 * @description Deletes a review by notifID
 * @param {Request} req - Contains notifID
 * @param {Response} res - Returns success or failure status.
 */
router.delete('/notifications', async (req, res) => { 
    const { notifID } = req.body;

    // Validate notifID
    if (!notifID) {
        console.error("Notification ID not provided.");
        return res.status(400).json({ success: false, message: "Notification ID is required." });
    }

    try {
        console.log(`Attempting to delete notification with ID: ${notifID}`);
        const rowsDeleted = await appService.deleteNotification(notifID);

        if (rowsDeleted > 0) {
            console.log(`Notification with ID: ${notifID} successfully deleted.`);
            res.status(200).json({ success: true, message: 'Notification deleted successfully.' });
        } else {
            console.warn(`Notification with ID: ${notifID} not found.`);
            res.status(404).json({ success: false, message: 'Notification not found.' });
        }
    } catch (error) {
        console.error('Error occurred while deleting notification:', error.message);
        res.status(500).json({ success: false, message: 'Failed to delete notification.' });
    }
});

/**
 * 2.1.4 Selection
 * Selects a particular place given a user input
 * 
 * @route GET /selectingPlace
 * @description Fetches places based on a dynamic condition
 * @param {Request} req - Contains inputString in the query
 * @param {Response} res - Returns places matching the condition
 */
router.get('/selectingPlace', async (req, res) => {
    const { inputString } = req.query;
    console.log('input: ', inputString);
    if (!inputString) {
        console.log('no input');
        return res.status(400).json({ success: false, message: "An input is required" });
    }
    if (!sanitization(inputString)) {
        console.log('bad input');
        return res.status(400).json({ success: false, message: 'Invalid input do not include special characters' });
    }
    const trimmed = inputString.trim();
    const tokenizedInput = trimmed.split(" ");
    const operators = ["=", "<", ">", "<=", ">=", "<>"];
    const tokenOutput = [];

    for (let i = 0; i < tokenizedInput.length; i++) {
        let token = tokenizedInput[i];
        if (token.toLowerCase() === "and" || token.toLowerCase() === "or") {
            // tor AND / OR
            tokenOutput.push(token.toUpperCase());
        } else if (operators.includes(token)) {
            // for operators
            tokenOutput.push(token);
        } else if (i > 0 && operators.includes(tokenizedInput[i - 1])) {
            // value after an operator
            let value = token;

            // collect spaces like 'Stanley Park'
            while (i + 1 < tokenizedInput.length && !operators.includes(tokenizedInput[i + 1]) &&
            tokenizedInput[i + 1].toLowerCase() !== "and" && tokenizedInput[i + 1].toLowerCase() !== "or") {
                //must increment this way
                value += " " + tokenizedInput[++i];
            }
            //I WANT TO CAPITALIZE MADE THAT OOPSEY WHEN MAKING SEARCH BAR
            // Citation from where I learned how to capitalize: https://stackoverflow.com/questions/1026069/how-do-i-make-the-first-letter-of-a-string-uppercase-in-javascript
            let words = value.split(" ");
            for (let i = 0; i < words.length; i++) {
                let word = words[i];
                words[i] = word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
            }
            value = words.join(" ");

            // integer check for < > etc
            if (/^\d+$/.test(value)) {
                tokenOutput.push(value);
            } else {
                // double quotes were not working sooo try single in this instance
                value = `'${value.replace(/'/g, "''")}'`;
                tokenOutput.push(value);
            }
        } else {
            // push key
            tokenOutput.push(token);
        }
    }

    const cleaned_string = tokenOutput.join(" ");
    console.log('Cleaned query string:', cleaned_string);

    try {
        const places = await appService.selectingPlace(cleaned_string);
        res.status(200).json({ success: true, data: places });
    } catch (error) {
        console.error('Error fetching places:', error);
        res.status(500).json({ success: false, message: 'Failed to fetch places' });
    }
});

/**
 * 2.1.5 Projection
 * Projects attributes from a particular place
 * 
 * @route GET /projectFromPlace
 * @description Projects attributes from the Place table
 * @param {Request} req - Contains attributes in the query
 * @param {Response} res - Returns the projection result
 */
router.get('/projectFromPlace', async (req, res) => {
    const { attributes } = req.query;
    if(!attributes){
        return res.status(400).json({ success: false, message: "attributes are required" });
    }

    const listAttributes = attributes.split(",");
    try {
        const projectionResult = await appService.projectFromPlace(listAttributes);
        res.status(200).json({ success: true, data: projectionResult });
    } catch (error) {
        console.error('Error in /project-place:', error);
        res.status(500).json({ success: false, message: 'Failed to execute projection' });
    }
});

/**
 * 2.1.6 Join 
 * Retrieve events occuring at a specific place
 * @route GET /place-events
 * @description Retrieves events at a specific place
 * @param {Request} req - Contains placeName and placeAddress in the query
 * @param {Response} res - Returns events for the place
 */
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


/**
 * 2.1.7 Aggregation with Group By
 * Get the average rating of events that occur at a specific place
 * @route GET /average-event-rating
 * @description Fetches average event ratings for each place
 * @param {Request} req
 * @param {Response} res - Returns average ratings
 */
router.get('/average-event-rating', async (req, res) => {
    try {
        const ratings = await appService.getAverageEventRatingPerPlace();
        res.status(200).json({ success: true, data: ratings });
    } catch (error) {
        console.error('Error fetching average event rating:', error);
        res.status(500).json({ success: false, message: 'Failed to fetch average event ratings'});
    }
});


/**
 * 2.1.8 Aggregation with Having 
 * Retrieves cuisines with an average rating above a specified threshold 
 * 
 * @route GET /getCuisinesAboveThreshold
 * @description Retrieves cuisines with ratings above a threshold
 * @param {Request} req - Contains threshold in the query
 * @param {Response} res - Returns cuisines exceeding the threshold
 */
router.get('/getCuisinesAboveThreshold', async (req, res) => {
    const { threshold } = req.query;
    if(!threshold){
        return res.status(400).json({ success: false, message: "threshold are required" });
    }
    const numberThreshold = parseFloat(threshold)
    try {
        const projectionResult = await appService.getCuisinesAboveThreshold(numberThreshold);
        res.status(200).json({ success: true, data: projectionResult });
    } catch (error) {
        console.error('Error in /cusines-above-threshold:', error);
        res.status(500).json({ success: false, message: 'Failed to execute aggregation query' });
    }
});

/**
 * 2.1.9 Nested aggregation with Group By
 * Retrieves the highest average rating for each place type using a nested group by query
 * 
 * @route GET /highest-average-rating
 * @description Fetches the highest average of the restaurants
 * @param {Request} req
 * @param {Response} res - Returns highest average ratings
 */
router.get('/highest-average-rating-restaurant', async (req, res) => {
    try {
        const data = await appService.getHighestAverageRatingRestaurant();
        res.status(200).json({ success: true, data: data });
    } catch (error) {
        console.error('Error fetching data:', error);
        res.status(500).json({ success: false, message: 'Failed to fetch data' });
    }
});

/**
 * 2.1.10 Division 
 * Retrieves the places that have been reviewed by all users in the database
 * 
 * @route GET /places-reviewed-by-all
 * @description Fetches places that have been reviewed by EVERY user
 * @param {Request} req
 * @param {Response} res - Returns places that have been reviewed by all users
 */
router.get('/places-reviewed-by-all', async (req, res) => {
    try {
        const reviewedPlaces = await appService.getPlacesReviewedByAll();
        res.status(200).json({ success: true, data: reviewedPlaces });
    } catch (error) {
        console.error('Error fetching reviewed places:', error);
        res.status(500).json({ success: false, message: 'Failed to fetch reviewed places.' });
    }
});

/** * 
 * @route GET /user-notifications
 * @description Fetches notifications for a user
 * @param {Request} req - Contains userId in the query
 * @param {Response} res - Returns the user's notifications
 */
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


// ----------------------------------------------------------
// Routes for our utility functions

/**
 * @route GET /user-giftcards
 * @description Fetches gift cards owned by a user
 * @param {Request} req - Contains userId in the query
 * @param {Response} res - Returns the user's gift cards
 */
router.get('/user-giftcards', async (req, res) => {
    const { userId } = req.query;

    if (!userId) {
        return res.status(400).json({ success: false, message: 'UserId is required' });
    }

    try {
        const giftCards = await appService.getUserGiftCards(userId);
        res.status(200).json({ success: true, data: giftCards });
    } catch (error) {
        console.error('Error fetching giftcards:', error);
        res.status(500).json({ success:false, message: 'Failed to fetch gift cards' });
    }
});

/**
 * @route GET /giftcards
 * @description Fetches giftcards 
 * @param {Request} req - Contains userId in the query
 * @param {Response} res - Returns the user's gift cards
 */
router.get('/giftcards', async (req, res) => {
    try {
        const giftCards = await appService.fetchAvailableGiftCards();
        res.json({ success: true, data: giftCards });
    } catch (error) {
        console.error('Error fetching gift cards:', error);
        res.status(500).json({ success: false, message: error.message });
    }
});

/**
 * @route PUT /giftcards
 * @description Inserts giftcards into the table
 * @param {Request} req - Contains tableName, columns, and values 
 * @param {Response} res - Returns success or failure status.
 */
router.put('/redeem', async (req, res) => {
    const { userId, giftCardId } = req.body;

    try {
        const result = await appService.redeemGiftCard(userId, giftCardId);
        if (!result.success) {
            return res.status(400).json({
                success: false,
                message: result.message,
            });
        }

        return res.status(200).json({
            success: true,
            message: result.message,
            rowsUpdated: result.rowsUpdated,
        });
    } catch (error) {
        console.error('Error redeeming gift card:', error);
        return res.status(500).json({
            success: false,
            message: 'Failed to redeem gift card.',
        });
    }
});

module.exports = router;

/**
 * @route GET /login
 * @description Fetches login
 * @param {Request} req
 * @param {Response} res - Returns login
 */
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

/**
 * Fetch all events (upcoming and past)
 * @route GET /events
 * @description Fetches all events
 * @param {Request} req
 * @param {Response} res - Returns events
 */
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

/**
 * Add a new event
 * @route POST /add-event
 * @description Add a new event
 * @param {Request} req
 * @param {Response} res - Returns events
 */
router.post('/add-event', async (req, res) => {
    const { title, date, description, name, address } = req.body;

    if (!title || !date || !name || !address) {
        return res.status(400).json({ error: 'Missing required fields: title, date, name, address' });
    }

    const inputs = { title, date, description, name, address };
    for (const [key, value] of Object.entries(inputs)) {
        if (value && !insertSanitization(value)) {
            return res.status(400).json({
                error: `Invalid characters detected in the field: ${key}`,
            });
        }
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

/**
 * @route GET /user-reviews
 * @description Fetch the reviews made by User with userId
 * @param {Request} req
 * @param {Response} res - Returns reviews
 */
router.get('/user-reviews', async (req,res) => {
    const { userId } = req.query;
    
    if(!userId) {
        return res.status(400).json({ success: false, message: 'UserID is required' });
    }

    try {
        const reviews = await appService.getReviewsByUser(userId);
        res.status(200).json({ success: true, data: reviews });
    } catch(error) {
        console.error("Error fetching reviews: ", error);
        res.status(500).json({ success: false, message: 'Failed to fetch reviews, please contact administrator' });
    }
});

/**
 * @route GET /places
 * @description Fetch places
 * @param {Request} req
 * @param {Response} res - Returns place
 */
router.get('/places', async (req, res) => {
    try {
        const places = await appService.getAllPlaces();
        res.status(200).json({ success: true, data: places });
    } catch (error) {
        console.error('Error fetching places:', error);
        res.status(500).json({ success: false, message: 'Failed to fetch places.' });
    }
});

/**
 * @route GET /restaurants
 * @description Fetch restaurants
 * @param {Request} req
 * @param {Response} res - Returns restaurant
 */
router.get('/restaurants', async (req, res) => {
    try {
        const restaurants = await appService.getAllRestaurants();
        console.log('Sending Response:', { success: true, data: restaurants });
        res.status(200).json({ success: true, data: restaurants });
    } catch (error) {
        console.error('Error fetching restaurants:', error);
        res.status(500).json({ success: false, message: 'Failed to fetch restaurants.' });
    }
});

/**
 * @route GET /reviews-and-places
 * @description Fetch places and reviews
 * @param {Request} req
 * @param {Response} res - Returns place and reviews
 */
router.get('/reviews-and-places', async (req, res) => {
    const { userId } = req.query;

    if (!userId) {
        return res.status(400).json({ success: false, message: 'UserID is required' });
    }

    try {
        const reviewsAndPlaces = await appService.getReviewsAndPlaces(userId);
        res.status(200).json({ success: true, ...reviewsAndPlaces });
    } catch (error) {
        console.error('Error fetching reviews and places:', error);
        res.status(500).json({ success: false, message: 'Failed to fetch reviews and places.' });
    }
});

/**
 * @route GET /all-notifications
 * @description Fetches all notifications
 * @param {Request} req
 * @param {Response} res - Returns notifications
 */
router.get('/all-notifications', async (req, res) => {
    try {
        const notifications = await appService.getAllNotifications();
        res.status(200).json({ success: true, data: notifications });
    } catch (error) {
        console.error('Error fetching notifications:', error);
        res.status(500).json({ success: false, message: 'Failed to fetch notifications' });
    }
});


/**
 * @route GET /user-travelpasses
 * @description Fetches travel passes owned by a user
 * @param {Request} req - Contains userId in the query
 * @param {Response} res - Returns the user's travel passes
 */
router.get('/user-travelpasses', async (req, res) => {
    const { userId } = req.query;

    if (!userId) {
        return res.status(400).json({ success: false, message: 'UserId is required' });
    }

    try {
        const travelPass = await appService.getUserTravelPass(userId);
        res.status(200).json({ success: true, data: travelPass });
    } catch (error) {
        console.error('Error fetching giftcards:', error);
        res.status(500).json({ success:false, message: 'Failed to fetch gift cards' });
    }
});

/**
 * @route GET /travelpasses
 * @description Fetches travel passes
 * @param {Request} req - Contains userId in the query
 * @param {Response} res - Returns the travel passes
 */
router.get('/travelpasses', async (req, res) => {
    try {
        const travelPass = await appService.fetchAvailableTravelPasses();
        res.json({ success: true, data: travelPass });
    } catch (error) {
        console.error('Error fetching gift cards:', error);
        res.status(500).json({ success: false, message: error.message });
    }
});

/**
 * @route PUT /buy-travelpasss
 * @description makes the travelpass the user's
 * @param {Request} req - Contains userID and passID
 * @param {Response} res - Returns success or failure status.
 */
router.put('/buy-travelpass', async (req, res) => {
    const { userId, passID } = req.body;

    try {
        const result = await appService.buyTravelPass(userId, passID);
        if (!result.success) {
            return res.status(400).json({
                success: false,
                message: result.message,
            });
        }

        return res.status(200).json({
            success: true,
            message: result.message,
            rowsUpdated: result.rowsUpdated,
        });
    } catch (error) {
        console.error('Error redeeming travel pass:', error);
        return res.status(500).json({
            success: false,
            message: 'Failed to redeem travel pass.',
        });
    }
});
