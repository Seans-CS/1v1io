function generateRandomCode(length) {
    let result = '';
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    const charactersLength = characters.length;
    for (let i = 0; i < length; i++) {
        result += characters.charAt(Math.floor(Math.random() * charactersLength));
    }
    return result;
}

// Generate a unique 6-digit alphanumeric lobby code
const lobbyCode = generateRandomCode(6);

        
        // Function to create lobby code
        function createLobby() {
            // Make POST request to create a lobby
            fetch('/api/lobbies/create', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    lobbyName: 'Your Lobby Name', // Provide a name for the lobby
                    gameType: 'Your Game Type',   // Provide the type of game
                    isPrivate: true // Set to true if it's a private lobby, false otherwise
                })
            })
            .then(response => response.json())
            .then(data => {
                // Redirect to the lobby page with the generated lobby code
                window.location.href = '/lobby?lobbyCode=' + data.lobbyCode;
            })
            .catch(error => {
                console.error('Error creating lobby:', error);
                // Handle error
            });
        }
        