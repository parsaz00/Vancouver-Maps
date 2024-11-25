async function fetchAndDisplayMyGiftCards() {
    const myGiftCardList = document.getElementById('myGiftCardList');
    const userId = localStorage.getItem('userId'); 

    if (!userId) {
        alert('You must be logged in to view your gift cards.');
        return;
    }

    try {
        const response = await fetch(`/user-giftcards?userId=${userId}`, {
            method: 'GET',
            headers: { 'Content-Type': 'application/json' },
        });

        const data = await response.json();
        console.log("data: ", data);

        if (!data.success) {
            throw new Error(data.message || 'Failed to fetch your gift cards.');
        }
        myGiftCardList.innerHTML = '';

        data.data.forEach((card) => {
            const listItem = document.createElement('li');
            listItem.className = 'giftcard-item';
            listItem.innerHTML = `
                <span>\$${card.VALUE} ${card.FRANCHISE}</span>
            `;
            myGiftCardList.appendChild(listItem);
        });
    } catch (error) {
        console.error('Error fetching and displaying user gift cards:', error);
    }
}

async function fetchAndDisplayGiftCards() {
    const giftCardList = document.getElementById('giftCardList');

    try {
        const response = await fetch('/giftcards', {
            method: 'GET',
            headers: { 'Content-Type': 'application/json' },
        });

        const data = await response.json();
        console.log("data: ", data);

        if (!data.success) {
            throw new Error(data.message || 'Failed to fetch gift cards.');
        }
        giftCardList.innerHTML = '';

        data.data.forEach((card) => {
            const listItem = document.createElement('li');
            listItem.className = 'giftcard-item';
            listItem.innerHTML = `
                <span>\$${card.VALUE} ${card.FRANCHISE}</span>
                <span class="points">${card.POINTS} Points</span>
                <button class="redeem-button" data-gcid="${card.GCID}">Redeem</button>
            `;
            giftCardList.appendChild(listItem);
        });

        document.querySelectorAll('.redeem-button').forEach((button) => {
            button.addEventListener('click', handleRedeemButtonClick);
        });
    } catch (error) {
        console.error('Error fetching and displaying gift cards:', error);
    }
}

function handleRedeemButtonClick(event) {
    const button = event.target;
    const giftCardId = button.dataset.gcid;
    redeemGiftCard(giftCardId);
}

async function redeemGiftCard(giftCardId) {
    const userId = localStorage.getItem('userId');

    try {
        const response = await fetch('/redeem', {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ userId, giftCardId }),
        });

        const result = await response.json();

        if (result.success) {
            alert(result.message);
            fetchAndDisplayGiftCards();
        } else {
            alert(result.message);
        }
    } catch (error) {
        console.error('Error redeeming gift card:', error);
        alert('An error occurred while redeeming the gift card.');
    }
}

document.addEventListener('DOMContentLoaded', () => {
    fetchAndDisplayMyGiftCards();
    fetchAndDisplayGiftCards();
});