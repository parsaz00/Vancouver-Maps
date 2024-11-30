// Similar code for giftcards.js but adjusted for travelpass 
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
                <button class="redeem-button" data-passid="${pass.PASSID}">Redeem</button>
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
    redeemTravelPass(travelPassId);
}

async function redeemTravelPass(travelPassId) {
    const userId = localStorage.getItem('userId');

    try {
        const response = await fetch('/redeem-travelpass', {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ userId, travelPassId }),
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
        console.error('Error redeeming travel pass:', error);
        alert('An error occurred while redeeming the travel pass.');
    }
}
//fixing formatting of the travelpass
function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString(); 
}


document.addEventListener('DOMContentLoaded', () => {
    fetchAndDisplayMyTravelPasses();
    fetchAndDisplayTravelPasses();
});
