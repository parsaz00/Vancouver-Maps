/*
 * These functions below are for various webpage functionalities. 
 * Each function serves to process data on the frontend:
 *      - Before sending requests to the backend.
 *      - After receiving responses from the backend.
 * 
 * To tailor them to your specific needs,
 * adjust or expand these functions to match both your 
 *   backend endpoints 
 * and 
 *   HTML structure.
 * 
 */


// This function checks the database connection and updates its status on the frontend.
// async function checkDbConnection() {
//     const statusElem = document.getElementById('dbStatus');
//     const loadingGifElem = document.getElementById('loadingGif');

//     const response = await fetch('/check-db-connection', {
//         method: "GET"
//     });

//     // Hide the loading GIF once the response is received.
//     loadingGifElem.style.display = 'none';
//     // Display the statusElem's text in the placeholder.
//     statusElem.style.display = 'inline';

//     response.text()
//     .then((text) => {
//         statusElem.textContent = text;
//     })
//     .catch((error) => {
//         statusElem.textContent = 'connection timed out';  // Adjust error handling if required.
//     });
// }

async function checkDbConnection() {
    const statusElem = document.getElementById('dbStatus');
    const loadingGifElem = document.getElementById('loadingGif');

    try {
        const response = await fetch('/check-db-connection', { method: "GET" });
        const text = await response.text();
        console.log('Database connection response:', text);
        loadingGifElem.style.display = 'none';
        statusElem.style.display = 'inline';
        statusElem.textContent = text;
    } catch (error) {
        console.error('Error checking DB connection:', error);
        statusElem.textContent = 'connection timed out';
    }
}


// Fetches data from the demotable and displays it.
async function fetchAndDisplayUsers() {
    const tableElement = document.getElementById('demotable');
    const tableBody = tableElement.querySelector('tbody');

    const response = await fetch('/demotable', {
        method: 'GET'
    });

    const responseData = await response.json();
    const demotableContent = responseData.data;

    // Always clear old, already fetched data before new fetching process.
    if (tableBody) {
        tableBody.innerHTML = '';
    }

    demotableContent.forEach(user => {
        const row = tableBody.insertRow();
        user.forEach((field, index) => {
            const cell = row.insertCell(index);
            cell.textContent = field;
        });
    });
}

// This function resets or initializes the demotable.
async function resetDemotable() {
    const response = await fetch("/initiate-demotable", {
        method: 'POST'
    });
    const responseData = await response.json();

    if (responseData.success) {
        const messageElement = document.getElementById('resetResultMsg');
        messageElement.textContent = "demotable initiated successfully!";
        fetchTableData();
    } else {
        alert("Error initiating table!");
    }
}

// Inserts new records into the demotable.
async function insertDemotable(event) {
    event.preventDefault();

    const idValue = document.getElementById('insertId').value;
    const nameValue = document.getElementById('insertName').value;

    const response = await fetch('/insert-demotable', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            id: idValue,
            name: nameValue
        })
    });

    const responseData = await response.json();
    const messageElement = document.getElementById('insertResultMsg');

    if (responseData.success) {
        messageElement.textContent = "Data inserted successfully!";
        fetchTableData();
    } else {
        messageElement.textContent = "Error inserting data!";
    }
}

// Updates names in the demotable.
async function updateNameDemotable(event) {
    event.preventDefault();

    const oldNameValue = document.getElementById('updateOldName').value;
    const newNameValue = document.getElementById('updateNewName').value;

    const response = await fetch('/update-name-demotable', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            oldName: oldNameValue,
            newName: newNameValue
        })
    });

    const responseData = await response.json();
    const messageElement = document.getElementById('updateNameResultMsg');

    if (responseData.success) {
        messageElement.textContent = "Name updated successfully!";
        fetchTableData();
    } else {
        messageElement.textContent = "Error updating name!";
    }
}

// Counts rows in the demotable.
// Modify the function accordingly if using different aggregate functions or procedures.
async function countDemotable() {
    const response = await fetch("/count-demotable", {
        method: 'GET'
    });

    const responseData = await response.json();
    const messageElement = document.getElementById('countResultMsg');

    if (responseData.success) {
        const tupleCount = responseData.count;
        messageElement.textContent = `The number of tuples in demotable: ${tupleCount}`;
    } else {
        alert("Error in count demotable!");
    }
}

// Function to handle signup functionality -- Parsa
async function signupUser(event) {
    event.preventDefault();

    const userId = document.getElementById('signupUserId').value;
    const phone = document.getElementById('signupPhone').value;
    const email = document.getElementById('signupEmail').value;
    const points = document.getElementById('signupPoints').value;

    const response = await fetch('/insert', {
        method: 'POST', 
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            tableName: "Users",
            columns: ["UserID", "Phone", "Email", "Points"],
            values: [userId, phone, email, points]
        })
    });

    const responseData = await response.json();
    const messageElement = document.getElementById('signupResultMsg');

    if (responseData.success) {
        messageElement.textContent = "Signup successful, welcome to the app!";
    } else {
        messageElement.textContent = `Signup failed: ${responseData.message}`;
    }
}

// async function loginUser(event) {
//     event.preventDefault();

//     const email = document.getElementById('loginEmail').value;
//     const phone = document.getElementById('loginPhone').value;

//     // Have to make sure at least one field (phone or email) is filled
//     if (!email && !phone) {
//         const messageElement = document.getElementById('loginResultMsg');
//         messageElement.textContent = "Please enter either your email or phone number used to signup!";
//         return;
//     }

//     const queryParams = email ? `email=${email}` : `phone=${phone}`;
//     const response = await fetch(`/login?${queryParams}`, {
//         method: 'GET'
//     });

//     const responseData = await response.json();
//     const messageElement = document.getElementById('loginResultMsg');

//     if (responseData.success) {
//         messageElement.textContent = "Login was successful, redirecting you to the app bang!";
//         // actually redirect them 
//         window.location.href = "mainApp.html";
//     } else {
//         messageElement.textContent = `Login failed: ${responseData.message}`;
//     }
// }
async function loginUser(event) {
    event.preventDefault();

    const email = document.getElementById('loginEmail').value;
    const phone = document.getElementById('loginPhone').value;

    if (!email && !phone) {
        const messageElement = document.getElementById('loginResultMsg');
        messageElement.textContent = "Please enter either your email or phone number used to signup!";
        return;
    }

    const queryParams = email ? `email=${email}` : `phone=${phone}`;
    const response = await fetch(`/login?${queryParams}`, {
        method: 'GET'
    });

    const responseData = await response.json();
    const messageElement = document.getElementById('loginResultMsg');

    if (responseData.success) {
        const userId = responseData.data[0][0]; // Assuming the first column in the response is UserID
        localStorage.setItem('userId', userId); // Store the UserID
        messageElement.textContent = "Login was successful, redirecting you to the app!";
        window.location.href = "mainApp.html";
    } else {
        messageElement.textContent = `Login failed: ${responseData.message}`;
    }
}


async function fetchEvents() {
    try {
        const response = await fetch('/events');
        const { upcomingEvents, pastEvents } = await response.json();

        const upcomingList = document.getElementById('upcomingEventsList');
        const pastList = document.getElementById('pastEventsList');

        upcomingList.innerHTML = '';
        pastList.innerHTML = '';

        upcomingEvents.forEach(event => {
            const li = document.createElement('li');
            li.textContent = `${event[1]} on ${event[2]} at ${event[4]}`;
            upcomingList.appendChild(li);
        });

        pastEvents.forEach(event => {
            const li = document.createElement('li');
            li.textContent = `${event[1]} on ${event[2]} at ${event[4]}`;
            pastList.appendChild(li);
        });
    } catch (error) {
        console.error('Error fetching events:', error);
    }
}

async function addEvent(event) {
    event.preventDefault();
    const title = document.getElementById('eventTitle').value;
    const date = document.getElementById('eventDate').value;
    const description = document.getElementById('eventDescription').value;
    const name = document.getElementById('eventName').value;
    const address = document.getElementById('eventAddress').value;

    try {
        const response = await fetch('/add-event', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ title, date, description, name, address }),
        });

        const result = await response.json();
        if (result.success) {
            alert('Event added successfully!');
            fetchEvents();
        } else {
            alert(result.message || 'Failed to add event.');
        }
    } catch (error) {
        console.error('Error adding event:', error);
    }
}

async function handleLogout() {
    console.log("Logout button clicked");
    window.location.href = "index.html";
}


// async function fetchReviewsAndPlaces() {
//     const userId = localStorage.getItem('userId');
//     if (!userId) {
//         console.error('UserID not found in localStorage. Please ensure the user is logged in.');
//         return;
//     }

//     try {
//         const response = await fetch(`/reviews-and-places?userId=${userId}`);
//         const result = await response.json();

//         if (result.success) {
//             // Display Reviews
//             const reviewsContainer = document.getElementById('reviewsContainer');
//             reviewsContainer.innerHTML = '';
//             if (result.reviews.length > 0) {
//                 result.reviews.forEach(([name, address, reviewDate, rating, message]) => {
//                     const reviewCard = document.createElement('div');
//                     reviewCard.className = 'card';
//                     reviewCard.innerHTML = `
//                         <h3>${name} (${address})</h3>
//                         <p><strong>Date:</strong> ${new Date(reviewDate).toLocaleDateString()}</p>
//                         <p><strong>Rating:</strong> ${rating}/5</p>
//                         <p><strong>Review:</strong> ${message || 'No message provided.'}</p>
//                     `;
//                     reviewsContainer.appendChild(reviewCard);
//                 });
//             } else {
//                 reviewsContainer.innerHTML = '<p>No reviews found.</p>';
//             }

//             // Populate Places Dropdown
//             const placeSelect = document.getElementById('placeSelect');
//             placeSelect.innerHTML = '';
//             result.places.forEach((place) => {
//                 const option = document.createElement('option');
//                 option.value = `${place.name},${place.address}`;
//                 option.textContent = `${place.name} (${place.address})`;
//                 placeSelect.appendChild(option);
//             });
//         } else {
//             alert(result.message || 'Failed to fetch data.');
//         }
//     } catch (error) {
//         console.error('Error fetching reviews and places:', error);
//     }
// }

async function fetchReviewsAndPlacesSequentially() {
    const userId = localStorage.getItem('userId');
    if (!userId) {
        console.error('UserID not found in localStorage.');
        return;
    }

    try {
        // Fetch reviews first
        const reviewsResponse = await fetch(`/user-reviews?userId=${userId}`);
        const reviewsData = await reviewsResponse.json();

        if (reviewsData.success) {
            const reviewsContainer = document.getElementById('reviewsContainer');
            reviewsContainer.innerHTML = '';
            reviewsData.data.forEach(([name, address, reviewDate, rating, message]) => {
                const reviewCard = document.createElement('div');
                reviewCard.className = 'card';
                reviewCard.innerHTML = `
                    <h3>${name} (${address})</h3>
                    <p><strong>Date:</strong> ${new Date(reviewDate).toLocaleDateString()}</p>
                    <p><strong>Rating:</strong> ${rating}/5</p>
                    <p><strong>Review:</strong> ${message || 'No message provided.'}</p>
                `;
                reviewsContainer.appendChild(reviewCard);
            });
        }

        // Fetch places next
        const placesResponse = await fetch('/places');
        const placesData = await placesResponse.json();

        if (placesData.success) {
            const placeSelect = document.getElementById('placeSelect');
            placeSelect.innerHTML = '';
            placesData.data.forEach((place) => {
                const option = document.createElement('option');
                option.value = `${place.name},${place.address}`;
                option.textContent = `${place.name} (${place.address})`;
                placeSelect.appendChild(option);
            });
        }
    } catch (error) {
        console.error('Error fetching reviews or places:', error);
    }
}



// // Fetching user reviews
// async function fetchUserReviews() {
//     const userId = localStorage.getItem('userId'); // Retrieve the logged-in user's ID

//     if (!userId) {
//         console.error('UserID not found in localStorage. Please ensure the user is logged in.');
//         return;
//     }

//     try {
//         const response = await fetch(`/user-reviews?userId=${userId}`);
//         const result = await response.json();

//         const reviewsContainer = document.getElementById('reviewsContainer');
//         reviewsContainer.innerHTML = ''; // Clear existing content

//         if (result.success && result.data.length > 0) {
//             result.data.forEach(([name, address, reviewDate, rating, message]) => {
//                 const reviewCard = document.createElement('div');
//                 reviewCard.className = 'card';
//                 reviewCard.innerHTML = `
//                     <h3>${name} (${address})</h3>
//                     <p><strong>Date:</strong> ${new Date(reviewDate).toLocaleDateString()}</p>
//                     <p><strong>Rating:</strong> ${rating}/5</p>
//                     <p><strong>Review:</strong> ${message || 'No message provided.'}</p>
//                 `;
//                 reviewsContainer.appendChild(reviewCard);
//             });
//         } else {
//             reviewsContainer.innerHTML = '<p>No reviews found.</p>';
//         }
//     } catch (error) {
//         console.error('Error fetching user reviews:', error);
//     }
// }

// async function fetchPlaces() {
//     try {
//         const response = await fetch('/places');
//         const result = await response.json();
//         const placeSelect = document.getElementById('placeSelect');

//         if (result.success && result.data.length > 0) {
//             result.data.forEach((place) => {
//                 const option = document.createElement('option');
//                 option.value = `${place.name},${place.address}`;
//                 option.textContent = `${place.name} (${place.address})`;
//                 placeSelect.appendChild(option);
//             });
//         } else {
//             const noOption = document.createElement('option');
//             noOption.textContent = 'No places available';
//             placeSelect.appendChild(noOption);
//         }
//     } catch (error) {
//         console.error('Error fetching places:', error);
//     }
// }

// async function addReview(event) {
//     event.preventDefault();

//     const placeSelect = document.getElementById('placeSelect').value;
//     const [name, address] = placeSelect.split(',');
//     let reviewDate = document.getElementById('reviewDate').value;
//     const rating = document.getElementById('rating').value;
//     const message = document.getElementById('message').value;
//     const userId = localStorage.getItem('userId');

//     // Ensure inputs are valid
//     if (!name || !address || !userId || !reviewDate || !rating) {
//         alert('Invalid input. Please ensure all fields are filled out correctly.');
//         return;
//     }

//     // Validate and ensure the date format is YYYY-MM-DD
//     const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
//     if (!dateRegex.test(reviewDate)) {
//         alert('Invalid date format. Please use YYYY-MM-DD.');
//         return;
//     }

//     console.log({
//         userId, 
//         name, 
//         address, 
//         reviewDate, 
//         rating, 
//         message
//     });
    
//     try {
//         // Send data to the backend
//         const response = await fetch('/insert', {
//             method: 'POST',
//             headers: { 'Content-Type': 'application/json' },
//             body: JSON.stringify({
//                 tableName: 'Reviews',
//                 columns: ['UserID', 'Name', 'Address', 'ReviewDate', 'Rating', 'Message'],
//                 values: [userId, name, address, reviewDate, rating, message],
//             }),
//         });

//         const result = await response.json();
//         if (result.success) {
//             alert('Review added successfully!');
//             fetchUserReviews(); // Refresh reviews
//         } else {
//             alert(result.message || 'Failed to add review.');
//         }
//     } catch (error) {
//         console.error('Error adding review:', error);
//     }
// }

async function addReview(event) {
    event.preventDefault();

    const placeSelect = document.getElementById('placeSelect').value;
    const [name, address] = placeSelect.split(',');
    let reviewDate = document.getElementById('reviewDate').value;
    const rating = document.getElementById('rating').value;
    const message = document.getElementById('message').value;
    const userId = localStorage.getItem('userId');

    // Ensure inputs are valid
    if (!name || !address || !userId || !reviewDate || !rating) {
        alert('Invalid input. Please ensure all fields are filled out correctly.');
        return;
    }

    // Convert date to DD-MON-YYYY format
    const date = new Date(reviewDate);
    const months = ["JAN", "FEB", "MAR", "APR", "MAY", "JUN", "JUL", "AUG", "SEP", "OCT", "NOV", "DEC"];
    reviewDate = `${date.getDate().toString().padStart(2, '0')}-${months[date.getMonth()]}-${date.getFullYear()}`;

    console.log({
        userId,
        name,
        address,
        reviewDate,
        rating,
        message,
    });

    try {
        // Send data to the backend
        const response = await fetch('/insert', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                tableName: 'Reviews',
                columns: ['UserID', 'Name', 'Address', 'ReviewDate', 'Rating', 'Message'],
                values: [userId, name, address, reviewDate, rating, message],
            }),
        });

        const result = await response.json();
        if (result.success) {
            alert('Review added successfully!');
            fetchUserReviews(); // Refresh reviews
        } else {
            alert(result.message || 'Failed to add review.');
        }
    } catch (error) {
        console.error('Error adding review:', error);
    }
}






// ---------------------------------------------------------------
// Initializes the webpage functionalities.
// Add or remove event listeners based on the desired functionalities.
// window.onload = function() {
//     checkDbConnection();
//     fetchTableData();
//     document.getElementById('signupForm').addEventListener('submit', signupUser);
//     document.getElementById('loginForm').addEventListener('submit', loginUser);
//     document.getElementById("resetDemotable").addEventListener("click", resetDemotable);
//     document.getElementById("insertDemotable").addEventListener("submit", insertDemotable);
//     document.getElementById("updataNameDemotable").addEventListener("submit", updateNameDemotable);
//     document.getElementById("countDemotable").addEventListener("click", countDemotable);
// };

window.onload = function() {
    checkDbConnection();
    fetchEvents();
    // fetchUserReviews();
    // fetchPlaces();
    fetchReviewsAndPlacesSequentially();

    const addReviewForm = document.getElementById('addReviewForm');
    if (addReviewForm) {
        addReviewForm.addEventListener('submit', addReview);
    } else {
        console.error("Add Review form not found.");
    }

    // Attach event listeners only if the corresponding elements exist
    const signupForm = document.getElementById('signupForm');
    if (signupForm) {
        signupForm.addEventListener('submit', signupUser);
    }

    const loginForm = document.getElementById('loginForm');
    if (loginForm) {
        loginForm.addEventListener('submit', loginUser);
    }

    const resetButton = document.getElementById("resetDemotable");
    if (resetButton) {
        resetButton.addEventListener("click", resetDemotable);
    }

    const insertDemotableForm = document.getElementById("insertDemotable");
    if (insertDemotableForm) {
        insertDemotableForm.addEventListener("submit", insertDemotable);
    }

    const updateNameForm = document.getElementById("updataNameDemotable");
    if (updateNameForm) {
        updateNameForm.addEventListener("submit", updateNameDemotable);
    }

    const countButton = document.getElementById("countDemotable");
    if (countButton) {
        countButton.addEventListener("click", countDemotable);
    }

    const logoutButton = document.getElementById("logoutButton");
    if (logoutButton) {
        console.log("Adding event listener to logout button...");
        logoutButton.addEventListener("click", handleLogout);
    } else {
        console.log("Logout button not found.");
    }
    
    const addEventForm = document.getElementById('addEventForm');
    if (addEventForm) {
        addEventForm.addEventListener('submit', addEvent);
    }

    const backToMainButton = document.getElementById("backToMainButton");
    if (backToMainButton) {
    backToMainButton.addEventListener("click", () => {
        window.location.href = "mainApp.html"; // Redirect to main page
    });
}

    // Fetch table data only if the demotable exists
    fetchTableData();
};


// General function to refresh the displayed table data. 
// You can invoke this after any table-modifying operation to keep consistency.
function fetchTableData() {
    const tableElement = document.getElementById('demotable');
    if (tableElement) {
        fetchAndDisplayUsers();
    }
}


