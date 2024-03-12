// Function to navigate to a specific URL
function navigate(url) {
    window.location.href = url;
}

// Function to create a lobby
function createLobby() {
    fetch('/api/lobbies/create', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            lobbyName: 'New Lobby', // Adjust as needed
            gameType: '1v1', // Adjust as needed
            isPrivate: false // Adjust as needed
        })
    })
    .then(response => response.json())
    .then(data => {
        // Redirect to the lobby page with the lobby code appended to the URL
        window.location.href = `/lobby?code=${encodeURIComponent(data.lobbyCode)}`;
    })
    .catch(error => {
        console.error('Error creating lobby:', error);
    });
}

