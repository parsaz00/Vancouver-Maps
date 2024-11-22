async function searchPlaces() {
    // Trime resutls a second time but it's ok
    const inputString = document.getElementById('searchInput').value.trim();
    const resultsList = document.getElementById('resultsList');

    const response = await fetch(`/selectingPlace?inputString=${encodeURIComponent(inputString)}`);
    const data = await response.json();

    // clear our search
    resultsList.innerHTML = '';

    if (data.success && data.data.length > 0) {
        console.log('Search Results:', data.data);

            // populate search
        data.data.forEach(item => {
            const listItem = document.createElement('li');
            listItem.innerHTML = `
                <span>${item.name || 'No Name Available'}</span>
                <button onclick="viewDetails('${item.id}')">View</button>
            `;
            resultsList.appendChild(listItem);
        });
    } else {
        alert('No results found');
    }

}
