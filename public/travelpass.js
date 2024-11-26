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
            const listItem = document.createElement('li');
            listItem.className = 'travelpass-item';
            listItem.innerHTML = `
                <span>\$${pass.COST} - ${pass.NAME}</span>
                <span>${pass.STARTDATE} to ${pass.ENDDATE}</span>
            `;
            myTravelPassList.appendChild(listItem);
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
            const listItem = document.createElement('li');
            listItem.className = 'travelpass-item';
            listItem.innerHTML = `
                <span>\$${pass.COST} - ${pass.NAME}</span>
                <span>${pass.STARTDATE} to ${pass.ENDDATE}</span>
                <button class="redeem-button" data-passid="${pass.PASSID}">Redeem</button>
            `;
            travelPassList.appendChild(listItem);
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

document.addEventListener('DOMContentLoaded', () => {
    fetchAndDisplayMyTravelPasses();
    fetchAndDisplayTravelPasses();
});
