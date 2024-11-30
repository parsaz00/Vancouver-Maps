// Similar code for giftcards.js but adjusted for travelpass for all functions 
async function fetchAndDisplayMyTravelPasses() {
    const myTravelPassList = document.getElementById('myTravelPassList');
    const userId = localStorage.getItem('userId');

    if (!userId) {
        alert('You must be logged in to view your travel passes.');
        return;
    }

    try {
        const response = await fetch(`/user-travelpasses?userId=${userId}`, {
            method: 'GET',
            headers: { 'Content-Type': 'application/json' },
        });

        const data = await response.json();
        console.log("data: ", data);

        if (!data.success) {
            throw new Error(data.message || 'Failed to fetch your travel passes.');
        }

        myTravelPassList.innerHTML = '';

        data.data.forEach((pass) => {
            const card = document.createElement('div');
            card.className = 'travel-pass-card';
            card.innerHTML = `
                <h3>${pass.NAME}</h3>
                <p class="cost">$${pass.COST}</p>
                <p class="date-range">${formatDate(pass.STARTDATE)} - ${formatDate(pass.ENDDATE)}</p>
            `;
            myTravelPassList.appendChild(card);
        });
    } catch (error) {
        console.error('Error fetching and displaying user travel passes:', error);
    }
}


async function fetchAndDisplayTravelPasses() {
    const travelPassList = document.getElementById('travelPassList');

    try {
        const response = await fetch('/travelpasses', {
            method: 'GET',
            headers: { 'Content-Type': 'application/json' },
        });

        const data = await response.json();
        console.log("data: ", data);

        if (!data.success) {
            throw new Error(data.message || 'Failed to fetch travel passes.');
        }

        travelPassList.innerHTML = '';

        data.data.forEach((pass) => {
            const card = document.createElement('div');
            card.className = 'travel-pass-card';
            card.innerHTML = `
                <h3>${pass.NAME}</h3>
                <p class="cost">$${pass.COST}</p>
                <p class="date-range">${formatDate(pass.STARTDATE)} - ${formatDate(pass.ENDDATE)}</p>
                <button class="redeem-button" data-passid="${pass.PASSID}">Buy</button>
            `;
            travelPassList.appendChild(card);
        });

        document.querySelectorAll('.redeem-button').forEach((button) => {
            button.addEventListener('click', handleRedeemButtonClick);
        });
    } catch (error) {
        console.error('Error fetching and displaying travel passes:', error);
    }
}

function handleRedeemButtonClick(event) {
    const button = event.target;
    const travelPassId = button.dataset.passid;
    buyTravelPass(travelPassId);
}

async function buyTravelPass(passID) {
    const userId = localStorage.getItem('userId');

    try {
        const response = await fetch('/buy-travelpass', {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ userId, passID }),
        });

        const result = await response.json();

        if (result.success) {
            alert(result.message);
            fetchAndDisplayTravelPasses();
            fetchAndDisplayMyTravelPasses();
        } else {
            alert(result.message);
        }
    } catch (error) {
        console.error('Error buying travel pass:', error);
        alert('An error occurred while buygin the travel pass.');
    }
}
//fixing formatting of the travelpass
// citation on how I did it https://stackoverflow.com/questions/3552461/how-do-i-format-a-date-in-javascript
function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString(); 
}


document.addEventListener('DOMContentLoaded', () => {
    fetchAndDisplayMyTravelPasses();
    fetchAndDisplayTravelPasses();
});
