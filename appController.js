const express = require('express');
const appService = require('./appService');
const { events } = require('oracledb');
const { withOracleDB } = require('./appService');
const { sanitization } = require('./utils');
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
 * 
 * @route POST /insert
 * @description Inserts record into the table
 * @param {Request} req - Contains tableName, columns, and values 
 * @param {Response} res - Returns success or failure status.
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

/**
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

/**
 * @route GET /user-giftcards
 * @description Fetches gift cards owned by a user
 * @param {Request} req - Contains userId in the query
 * @param {Response} res - Returns the user's gift cards
 */
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

/**
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
 * @route PUT /reviews
 * @description Updates a review's value and message
 * @param {Request} req - Contains userID, name, address, newValue, and newMessage in the body
 * @param {Response} res - Returns success or failure status
 */
router.put('/reviews', async (req, res) => {
    const { userID, name, address, newValue, newMessage } = req.body;

    // Validate input parameters
    if (!userID || !name || !address || newValue === undefined || !newMessage) {
        return res.status(400).json({
            success: false,
            message: "userID, name, address, newValue, and newMessage are required"
        });
    }

    try {
        const rowsUpdated = await appService.updateReview(userID, name, address, newValue, newMessage);

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

// Fetch the reviews made by User with userId
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

// Fetch all places
router.get('/places', async (req, res) => {
    try {
        const places = await appService.getAllPlaces();
        res.status(200).json({ success: true, data: places });
    } catch (error) {
        console.error('Error fetching places:', error);
        res.status(500).json({ success: false, message: 'Failed to fetch places.' });
    }
});

// Fetch all restaurants
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

// Reviews and places
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

router.get('/all-notifications', async (req, res) => {
    try {
        const notifications = await appService.getAllNotifications();
        res.status(200).json({ success: true, data: notifications });
    } catch (error) {
        console.error('Error fetching notifications:', error);
        res.status(500).json({ success: false, message: 'Failed to fetch notifications' });
    }
});



