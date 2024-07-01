function createLobby() {
    const username = localStorage.getItem('username');

    if (!username) {
        alert('Please enter your username first.');
        return;
    }

    fetch('/api/lobbies/create', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            lobbyName: 'New Lobby', // Adjust as needed
            gameType: '1v1', // Adjust as needed
            isPrivate: false, // Adjust as needed
            username: username // Include the username
        })
    })
    .then(response => {
        if (!response.ok) {
            throw new Error('Failed to create lobby. Server responded with ' + response.status);
        }
        return response.json();
    })
    .then(data => {
        console.log('Response from server:', data); // Log the response data for debugging
        if (data && data.lobbyCode) {
            // Redirect to the lobby page with the lobby code and username appended to the URL
            window.location.href = `/lobby?code=${encodeURIComponent(data.lobbyCode)}}`;
        } else {
            alert('Failed to create lobby. Invalid response from server.');
        }
    })
    .catch(error => {
        console.error('Error creating lobby:', error);
        alert('An error occurred while creating the lobby. Please try again later.');
    });
}

document.getElementById('create').addEventListener('click', createLobby);
