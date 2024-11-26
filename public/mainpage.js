// mainPage.js

async function searchPlaces() {
    const inputString = document.getElementById('searchInput').value;
    const searchResultsDiv = document.getElementById('searchResults');
    searchResultsDiv.innerHTML = ''; // Clear previous results

    if (!inputString) {
        searchResultsDiv.innerHTML = '<p>Please enter a search query (e.g., name = Stanley Park)</p>';
        return;
    }

    const response = await fetch(`/selectingPlace?inputString=${encodeURIComponent(inputString)}`);
    const data = await response.json();

    if (data.success && data.data.length > 0) {
        const ul = document.createElement('ul');

        for (let i = 0; i < data.data.length; i++) {
            const place = data.data[i]; // access data 
            const li = document.createElement('li'); // create new list 
            li.textContent = `Name: ${place[0]}, Address: ${place[1]}`; 
            ul.appendChild(li); // append 
        }

        searchResultsDiv.appendChild(ul);
    } else {
        searchResultsDiv.innerHTML = '<p>No places found.</p>';
    }
}

async function fetchUpcomingEvents() {
    try {
        const response = await fetch('/events');
        const { upcomingEvents } = await response.json();

        const upcomingList = document.getElementById('upcomingEventsList');
        upcomingList.innerHTML = ''; // Clear previous events

        if (upcomingEvents.length > 0) {
            upcomingEvents.forEach(event => {
                const li = document.createElement('li');
                li.innerHTML = `
                    <div class="event-item">
                        <div class="event-title">${event[1]}</div>
                        <div class="event-date">${new Date(event[2]).toLocaleDateString()} at ${event[4]}</div>
                        <div class="event-description">${event[3]}</div>
                    </div>
                `;
                upcomingList.appendChild(li);
            });
        } else {
            upcomingList.innerHTML = '<li>No upcoming events.</li>';
        }
    } catch (error) {
        console.error('Error fetching events:', error);
    }
}

async function handleLogout() {
    console.log("Logout button clicked");
    window.location.href = "index.html";
}

// Initialize functions on page load
window.onload = function() {
    fetchUpcomingEvents();

    const logoutButton = document.getElementById("logoutButton");
    if (logoutButton) {
        logoutButton.addEventListener("click", handleLogout);
    }
};
