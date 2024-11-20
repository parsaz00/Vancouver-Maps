// const express = require('express');
// const appController = require('./appController');

// // Load environment variables from .env file
// // Ensure your .env file has the required database credentials.
// const loadEnvFile = require('./utils/envUtil');
// const envVariables = loadEnvFile('./.env');

// const app = express();
// const PORT = envVariables.PORT || 65534;  // Adjust the PORT if needed (e.g., if you encounter a "port already occupied" error)

// // Middleware setup
// app.use(express.static('public'));  // Serve static files from the 'public' directory
// app.use(express.json());             // Parse incoming JSON payloads

// // If you prefer some other file as default page other than 'index.html',
// //      you can adjust and use the bellow line of code to
// //      route to send 'DEFAULT_FILE_NAME.html' as default for root URL
// // app.get('/', (req, res) => {
// //     res.sendFile(__dirname + '/public/DEFAULT_FILE_NAME.html');
// // });


// // mount the router
// app.use('/', appController);


// // ----------------------------------------------------------
// // Starting the server
// app.listen(PORT, () => {
//     console.log(`Server running at http://localhost:${PORT}/`);
// });

const express = require('express');
const appController = require('./appController');
const loadEnvFile = require('./utils/envUtil');
const envVariables = loadEnvFile('./.env');

// Initialize app
const app = express();
const PORT = envVariables.PORT || 65535;

// Middleware
app.use(express.static('public'));  // Serve static files from 'public' directory
app.use(express.json());            // Parse incoming JSON payloads

// Serve index.html as the default page
app.get('/', (req, res) => {
    res.sendFile(__dirname + '/public/index.html');
});

// Route for dynamic page serving (optional)
app.get('/page/:pageName', (req, res) => {
    const pageName = req.params.pageName;
    res.sendFile(__dirname + `/public/${pageName}.html`);
});

// Mount the router
app.use('/', appController);

// Start the server
app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}/`);
});
