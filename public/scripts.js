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
            reviewsData.data.forEach(([name, address, reviewDate, rating, message, title]) => {
                const reviewCard = document.createElement('div');
                reviewCard.className = 'card';

                reviewCard.innerHTML = `
                    <h3>${name} (${address})</h3>
                    <p><strong>Title:</strong> ${title}</p>
                    <p><strong>Date:</strong> ${new Date(reviewDate).toLocaleDateString()}</p>
                    <p><strong>Rating:</strong> ${rating}/5</p>
                    <p><strong>Review:</strong> <span class="review-message">${message || 'No message provided.'}</span></p>
                    <button class="delete-btn" data-user-id="${userId}" data-name="${name}" data-address="${address}">Delete</button>
                    <button class="update-btn" data-user-id="${userId}" data-name="${name}" data-address="${address}">Update</button>
                `;

                reviewsContainer.appendChild(reviewCard);
            });

            document.querySelectorAll('.delete-btn').forEach(button => {
                button.addEventListener('click', async (event) => {
                    const userId = event.target.getAttribute('data-user-id');
                    const name = event.target.getAttribute('data-name');
                    const address = event.target.getAttribute('data-address');

                    if (confirm('Are you sure you want to delete this review?')) {
                        try {
                            const deleteResponse = await fetch(`/reviews`, {
                                method: 'DELETE',
                                headers: { 'Content-Type': 'application/json' },
                                body: JSON.stringify({ userID: userId, name, address }),
                            });

                            if (!deleteResponse.ok) {
                                console.error('Failed to delete review:', deleteResponse.statusText);
                                alert('Error: Unable to delete the review.');
                                return;
                            }

                            const deleteData = await deleteResponse.json();
                            if (deleteData.success) {
                                alert('Successfully deleted review!');
                                fetchReviewsAndPlacesSequentially();
                            } else {
                                alert(`Failed to delete the review: ${deleteData.message}`);
                            }
                        } catch (error) {
                            console.error('Error deleting review:', error);
                        }
                    }
                });
            });

            document.querySelectorAll('.update-btn').forEach(button => {
                button.addEventListener('click', (event) => {
                    const userId = event.target.getAttribute('data-user-id');
                    const name = event.target.getAttribute('data-name');
                    const address = event.target.getAttribute('data-address');
                    const card = event.target.parentElement;

                    const messageElement = card.querySelector('.review-message');
                    const originalMessage = messageElement.textContent;
                    const ratingElement = card.querySelector('p:nth-child(4)').textContent;
                    const originalRating = parseInt(ratingElement.match(/\d+/)[0], 10);
                    const reviewDateElement = card.querySelector('p:nth-child(3)').textContent;
                    const originalReviewDate = new Date(reviewDateElement.match(/Date:\s(.+)/)[1]).toISOString().split('T')[0];
                    const titleElement = card.querySelector('p:nth-child(2)').textContent;
                    const originalTitle = titleElement.match(/Title:\s(.+)/)[1];;

                    card.innerHTML = `
                        <h3>${name} (${address})</h3>
                        <label for="title">Title:</label>
                        <textarea id="title" name="title" rows="1">${originalTitle}</textarea>
                        <label for="reviewDate">Date:</label>
                        <input type="date" id="reviewDate" name="reviewDate" value="${originalReviewDate}">
                        <p><strong>Rating (1-5):</strong></p>
                        <input type="number" class="update-rating" value="${originalRating}" min="1" max="5" />
                        <p><strong>Message:</strong></p>
                        <textarea class="update-textarea">${originalMessage}</textarea>
                        <button class="save-btn" data-user-id="${userId}" data-name="${name}" data-address="${address}">Save</button>
                        <button class="cancel-btn">Cancel</button>
                    `;

                    const saveButton = card.querySelector('.save-btn');
                    const cancelButton = card.querySelector('.cancel-btn');

                    saveButton.addEventListener('click', async () => {
                        const updatedMessage = card.querySelector('.update-textarea').value;
                        const updatedRating = parseInt(card.querySelector('.update-rating').value, 10);
                        const updatedTitle = card.querySelector('#title').value;
                        const updatedDate = card.querySelector('#reviewDate').value;
            
                        if (!updatedMessage || !updatedTitle || !updatedDate || isNaN(updatedRating) || updatedRating < 1 || updatedRating > 5) {
                            alert('Please provide valid inputs for all fields.');
                            return;
                        }
            
                        try {
                            const updateResponse = await fetch(`/reviews`, {
                                method: 'PUT',
                                headers: { 'Content-Type': 'application/json' },
                                body: JSON.stringify({
                                    userID: userId,
                                    name,
                                    address,
                                    newValue: updatedRating,
                                    newMessage: updatedMessage,
                                    newTitle: updatedTitle,
                                    newDate: updatedDate,
                                }),
                            });

                            if (!updateResponse.ok) {
                                console.error('Failed to update review:', updateResponse.statusText);
                                alert('Error: Unable to update the review.');
                                return;
                            }

                            const updateData = await updateResponse.json();
                            if (updateData.success) {
                                alert('Successfully updated review!');
                                fetchReviewsAndPlacesSequentially();
                            } else {
                                alert(`Failed to update the review: ${updateData.message}`);
                            }
                        } catch (error) {
                            console.error('Error updating review:', error);
                        }
                    });

                    cancelButton.addEventListener('click', () => {
                        fetchReviewsAndPlacesSequentially();
                    });
                });
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
                option.value = `${place.Name},${place.Address}`;
                option.textContent = `${place.Name} (${place.Address})`;
                placeSelect.appendChild(option);
            });
        }
    } catch (error) {
        console.error('Error fetching reviews or places:', error);
    }
}

async function addReview(event) {
    event.preventDefault();

    const placeSelect = document.getElementById('placeSelect').value;
    const parts = placeSelect.split(',');
    const name = parts[0];
    const address = parts.slice(1).join(',').trim();
    let reviewDate = document.getElementById('reviewDate').value;
    const title = document.getElementById('title').value;
    const rating = document.getElementById('rating').value;
    const message = document.getElementById('message').value;
    const userId = localStorage.getItem('userId');

    // Ensure inputs are valid
    if (!name || !address || !userId || !reviewDate || !rating || !title) {
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
        title,
    });

    try {
        // Send data to the backend
        const response = await fetch('/insert', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                tableName: 'Reviews',
                columns: ['UserID', 'Name', 'Address', 'ReviewDate', 'Rating', 'Message', 'Title'],
                values: [userId, name, address, reviewDate, rating, message, title],
            }),
        });

        const result = await response.json();
        if (result.success) {
            alert('Review added successfully!');
            fetchReviewsAndPlacesSequentially(); // Refresh reviews
        } else {
            alert(result.message || 'Failed to add review.');
        }
    } catch (error) {
        console.error('Error adding review:', error);
    }
}

// Fetch places from the backend and display them
async function fetchAndDisplayPlaces(attributes = []) {
    const placesList = document.getElementById('placesList');
    placesList.innerHTML = ''; // Clear the list

    try {
        let url = '/places';
        if (attributes.length > 0) {
            url = `/projectFromPlace?attributes=${attributes.join(',')}`; // Custom query endpoint
        }

        const response = await fetch(url, { method: 'GET' });
        const data = await response.json();
        console.log('Fetched Data:', data);

        if (data.success) {
            data.data.forEach(place => {
                const listItem = document.createElement('li');
                listItem.classList.add('place-card');
                
                let content = '';
                const attributes = ['Name', 'Address', 'Phone', 'OpeningTime', 'ClosingTime', 'Description', 'StopID'];
                attributes.forEach(attr => {
                    if (place[attr]) {
                        const formattedAttr = attr.replace(/([a-z])([A-Z])/g, '$1 $2');
                        content += `<p><strong>${formattedAttr}:</strong> ${place[attr]}</p>`;
                    }
                });
                if (content) {
                    listItem.innerHTML = content;
                    document.getElementById('placesList').appendChild(listItem);
                }
            });                                 
        } else {
            alert(`Failed to fetch places: ${data.message}`);
        }
    } catch (error) {
        console.error('Error fetching places:', error);
        alert('An error occurred while fetching places.');
    }
}

// Call the function when the page loads
if (window.location.pathname.endsWith('places.html')) {
    fetchAndDisplayPlaces();
}
if (window.location.pathname.endsWith('event.html')) {
    populatePlaceSelector();
}


// Populate the place selector dropdown
async function populatePlaceSelector() {
    const placeSelector = document.getElementById("placeSelector");

    try {
        const response = await fetch('/places');
        const result = await response.json();

        if (result.success) {
            placeSelector.innerHTML = ""; // Clear previous options

            // Populate dropdown with place options
            result.data.forEach(({ Name, Address }) => {
                const option = document.createElement("option");
                option.value = `${Name},${Address}`;
                option.textContent = `${Name} (${Address})`;
                placeSelector.appendChild(option);
            });
        } else {
            console.error("Failed to fetch places:", result.message);
        }
    } catch (error) {
        console.error("Error fetching places:", error);
    }
}

// Fetch and display events for the selected place
async function fetchAndDisplayEventsForPlace(event) {
    event.preventDefault();

    const placeSelector = document.getElementById("placeSelector");
    const eventsList = document.getElementById("eventsList");

    // const [placeName, placeAddress] = 
    const parts = placeSelector.value.split(",");
    const placeName = parts[0];
    const placeAddress = parts.slice(1).join(',').trim();

    try {
        const response = await fetch(`/place-events?placeName=${encodeURIComponent(placeName)}&placeAddress=${encodeURIComponent(placeAddress)}`);
        const result = await response.json();

        if (result.success) {
            eventsList.innerHTML = ""; // Clear previous events

            if (result.data.length > 0) {
                result.data.forEach(([_, __, eventID, title, eventDate, description]) => {
                    const listItem = document.createElement("li");
                    listItem.innerHTML = `
                        <div class="event-item">
                            <h3>${title}</h3>
                            <span class="event-date">${new Date(eventDate).toLocaleDateString()}</span>
                            <p class="event-description">${description}</p>
                        </div>
                    `;
                    eventsList.appendChild(listItem);
                });
            } else {
                eventsList.innerHTML = "<li>No events found for this place.</li>";
            }
        } else {
            eventsList.innerHTML = `<li>Error fetching events: ${result.message}</li>`;
        }
    } catch (error) {
        console.error("Error fetching events:", error);
        eventsList.innerHTML = "<li>Failed to fetch events.</li>";
    }
}

// Fetch average ratings for each place and update the UI
async function fetchAndDisplayAverageRatings() {
    const placesList = document.getElementById('placesList');

    try {
        // Fetch average ratings
        const response = await fetch('/average-event-rating');
        const result = await response.json();

        if (result.success) {
            // Clear the current places list
            placesList.innerHTML = '';

            // Map the ratings data for easier lookup
            const ratingsMap = new Map(
                result.data.map(([name, address, averageRating]) => [
                    `${name} (${address})`,
                    averageRating.toFixed(1), // Format to 1 decimal
                ])
            );

            // Rebuild the places list with ratings
            result.data.forEach(([name, address, averageRating]) => {
                const listItem = document.createElement('li');
                listItem.innerHTML = `
                    <strong>${name}</strong> (${address})<br>
                    Average Rating: ${averageRating.toFixed(1)}/5
                `;
                placesList.appendChild(listItem);
            });
        } else {
            placesList.innerHTML = '<li>Error fetching ratings.</li>';
        }
    } catch (error) {
        console.error('Error fetching average ratings:', error);
        placesList.innerHTML = '<li>Failed to fetch ratings. Please try again later.</li>';
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
    if (window.location.pathname.endsWith('notifications.html')) {
        fetchAndDisplayNotifications();
    }

    // Attach event listener to the events form
    const eventsForm = document.getElementById("eventsForm");
    if (eventsForm) {
    eventsForm.addEventListener("submit", fetchAndDisplayEventsForPlace);
    }


    const addReviewForm = document.getElementById('addReviewForm');
    if (addReviewForm) {
        addReviewForm.addEventListener('submit', addReview);
    } else {
        console.log("Add Review form not found.");
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

// Fetch average ratings for each place and display them
async function fetchAndDisplayPlacesWithRatings() {
    const placesList = document.getElementById("placesList");

    try {
        const response = await fetch("/average-event-rating");
        const result = await response.json();

        if (result.success) {
            // Clear the current places list
            placesList.innerHTML = "";

            // Display places with their average ratings
            result.data.forEach(([name, address, averageRating]) => {
                const listItem = document.createElement("li");
                listItem.innerHTML = `
                    <span>${name} (${address})</span>
                    <span class="rating">Average Rating: ${averageRating.toFixed(1)}/5</span>
                `;
                placesList.appendChild(listItem);
            });
            console.log("finished");
        } else {
            placesList.innerHTML = "<li>Error fetching ratings.</li>";
        }
    } catch (error) {
        console.error("Error fetching average ratings:", error);
        placesList.innerHTML = "<li>Failed to fetch ratings. Please try again later.</li>";
    }
}

const showPlacesButton = document.getElementById("showPlacesButton");
if (showPlacesButton) {
    showPlacesButton.addEventListener("click", () => {
        const titleElement = document.querySelector(".places-container h2");
        titleElement.textContent = "Places in Vancouver";
        fetchAndDisplayPlaces();
    });
}

// Attach event listener to the button
const showRatingsButton = document.getElementById("showRatingsButton");
if (showRatingsButton) {
    showRatingsButton.addEventListener("click", () => {
        const titleElement = document.querySelector(".places-container h2");
        titleElement.textContent = "Average Rating of Events for Each Place";
        fetchAndDisplayPlacesWithRatings();
    });
}

document.getElementById('executeQueryButton').addEventListener('click', (e) => {
    const titleElement = document.querySelector(".places-container h2");
    titleElement.textContent = "Places in Vancouver";
    e.preventDefault();

    const selectedAttributes = Array.from(
        document.querySelectorAll('#attributesForm input[name="attribute"]:checked')
    ).map(input => input.value);

    if (selectedAttributes.length === 0) {
        alert('Please select at least one attribute.');
        return;
    }

    fetchAndDisplayPlaces(selectedAttributes);
});

async function displayCuisinesWithThreshold(threshold) {
    const placesList = document.getElementById("placesList");

    try {
        const response = await fetch(`/getCuisinesAboveThreshold?threshold=${encodeURIComponent(threshold)}`);
        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }

        const result = await response.json();
        console.log('result: ', result);

        if (result.success) {
            placesList.innerHTML = "";
            /** Adding Filter Buttons */
            const filterContainer = document.createElement("div");
            filterContainer.classList.add("filter-buttons");
            const resetFilterButton = document.createElement("button");
            resetFilterButton.textContent = "Reset Restaurants";
            resetFilterButton.classList.add("show-ratings-btn");
            resetFilterButton.addEventListener("click", () => {
                fetchAndDisplayRestaurants();
            });
            filterContainer.appendChild(resetFilterButton);
            placesList.appendChild(filterContainer);

            /** Displaying the Cuisines */
            result.data.forEach(({ Cuisine, AverageRating }) => {
                const listItem = document.createElement("li");
                listItem.innerHTML = `
                    <span>${Cuisine}</span>
                    <span class="rating">Average Rating: ${AverageRating.toFixed(1)}/5</span>
                `;
                
                placesList.appendChild(listItem);
            });
        } else {
            placesList.innerHTML = "<li>Error fetching cuisines.</li>";
        }
    } catch (error) {
        console.error('Error fetching Cuisines:', error);
        placesList.innerHTML = "<li>Failed to fetch Cuisines. Please try again later.</li>";
    }
}

async function displayTopRatedRestaurants() {
    const placesList = document.getElementById("placesList");

    try {
        const response = await fetch("/highest-average-rating-restaurant");
        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }

        const result = await response.json();

        if (result.success) {
            placesList.innerHTML = "";
            /** adding filter buttons */
            const filterContainer = document.createElement("div");
            filterContainer.classList.add("filter-buttons");
            const resetFilterButton = document.createElement("button");
            resetFilterButton.textContent = "Reset Restaurants";
            resetFilterButton.classList.add("show-ratings-btn");
            resetFilterButton.addEventListener("click", () => {
                fetchAndDisplayRestaurants();
            });
            filterContainer.appendChild(resetFilterButton);
            placesList.appendChild(filterContainer);

            /** Displaying the Restaurants */
            result.data.forEach(({ Name, Address, AverageRating }) => {
                const listItem = document.createElement("li");
                listItem.innerHTML = `
                    <span>${Name} (${Address}):</span>
                    <span class="rating">Average Rating: ${AverageRating.toFixed(1)}/5</span>
                `;
                
                placesList.appendChild(listItem);
            });
        } else {
            placesList.innerHTML = "<li>Error fetching restaurants.</li>";
        }
    } catch (error) {
        console.error('Error fetching top-rated restaurant:', error);
        placesList.innerHTML = "<li>Failed to fetch restaurants. Please try again later.</li>";
    }
}

async function fetchAndDisplayRestaurants() {
    const placesList = document.getElementById("placesList");

    try {
        const response = await fetch("/restaurants");
        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }

        const result = await response.json();

        if (result.success) {
            placesList.innerHTML = "";
            /** adding filter buttons */
            const sliderLabel = document.createElement("label");
            sliderLabel.textContent = "Cuisine Threshold Rating: ";
            sliderLabel.htmlFor = "ratingSlider";

            const ratingSlider = document.createElement("input");
            ratingSlider.type = "range";
            ratingSlider.id = "ratingSlider";
            ratingSlider.min = "0";
            ratingSlider.max = "5";
            ratingSlider.step = "0.1";
            ratingSlider.value = "3";

            const sliderValue = document.createElement("span");
            sliderValue.textContent = "3";
            ratingSlider.addEventListener("input", () => {
                sliderValue.textContent = ratingSlider.value;
            });

            const applyThresholdButton = document.createElement("button");
            applyThresholdButton.textContent = "Apply Threshold";
            applyThresholdButton.classList.add("show-ratings-btn");
            applyThresholdButton.addEventListener("click", () => {
                const threshold = parseFloat(ratingSlider.value);
                displayCuisinesWithThreshold(threshold);
            });
            const filterContainer = document.createElement("div");
            filterContainer.classList.add("filter-buttons");
            const filterHighReviewsButton = document.createElement("button");
            filterHighReviewsButton.textContent = "Show Top Rated";
            filterHighReviewsButton.classList.add("show-ratings-btn");
            filterHighReviewsButton.addEventListener("click", () => {
                displayTopRatedRestaurants();
            });

            const resetFilterButton = document.createElement("button");
            resetFilterButton.textContent = "Reset Restaurants";
            resetFilterButton.classList.add("show-ratings-btn");
            resetFilterButton.addEventListener("click", () => {
                fetchAndDisplayRestaurants();
            });
            filterContainer.appendChild(sliderLabel);
            filterContainer.appendChild(ratingSlider);
            filterContainer.appendChild(sliderValue);
            filterContainer.appendChild(applyThresholdButton);
            filterContainer.appendChild(filterHighReviewsButton);
            filterContainer.appendChild(resetFilterButton);
            placesList.appendChild(filterContainer);

            /** Displaying the Restaurants */
            result.data.forEach(({ Name, Address }) => {
                const listItem = document.createElement("li");
                listItem.innerHTML = `<span>${Name} (${Address})</span>`;
                placesList.appendChild(listItem);
            });
        } else {
            placesList.innerHTML = "<li>Error fetching restaurants.</li>";
        }
    } catch (error) {
        console.error("Error fetching restaurants:", error);
        placesList.innerHTML = "<li>Failed to fetch restaurants. Please try again later.</li>";
    }
}

const showRestaurantsButton = document.getElementById("showRestaurantsButton");
if (showRestaurantsButton) {
    showRestaurantsButton.addEventListener("click", () => {
        const titleElement = document.querySelector(".places-container h2");
        titleElement.textContent = "Restaurants";
        fetchAndDisplayRestaurants();
    });
}

async function fetchAndDisplayNotifications() {
    const notificationsList = document.getElementById('notificationsList');
    notificationsList.innerHTML = '<li>Loading...</li>';

    try {
        const response = await fetch('/all-notifications');
        const { success, data } = await response.json();

        if (success) {
            notificationsList.innerHTML = ''; // Clear the loading text
            data.forEach(({ NotifID, Message, Type, Source }) => {
                const li = document.createElement('li');
                li.innerHTML = `
                    <span>
                        <strong>${Source}</strong>: ${Message} 
                        ${Type ? `(Type: ${Type})` : ''}
                    </span>
                `;
                notificationsList.appendChild(li);
            });
        } else {
            notificationsList.innerHTML = '<li>Error fetching notifications.</li>';
        }
    } catch (error) {
        console.error('Error fetching notifications:', error);
        notificationsList.innerHTML = '<li>Failed to fetch notifications.</li>';
    }
}

document.getElementById('findReviewedPlacesButton').addEventListener('click', async () => {
    const placesList = document.getElementById('placesList');
    placesList.innerHTML = '<li>Loading...</li>';

    try {
        const response = await fetch('/places-reviewed-by-all');
        const result = await response.json();

        if (result.success) {
            placesList.innerHTML = '';
            result.data.forEach(({ Name, Address }) => {
                const listItem = document.createElement('li');
                listItem.innerHTML = `${Name} (${Address})`;
                placesList.appendChild(listItem);
            });
        } else {
            placesList.innerHTML = '<li>Error fetching reviewed places.</li>';
        }
    } catch (error) {
        console.error('Error fetching reviewed places:', error);
        placesList.innerHTML = '<li>Failed to fetch reviewed places.</li>';
    }
});


