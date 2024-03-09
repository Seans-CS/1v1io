document.addEventListener('DOMContentLoaded', function() {
    document.getElementById('join').addEventListener('click', showJoinInput);
    document.getElementById('joinBtn').addEventListener('click', joinLobby);
});

function showJoinInput() {
    document.getElementById('joinInput').style.display = 'block';
}

function joinLobby() {
    var code = document.getElementById('joinCode').value;
    fetch('/api/lobbies/join', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ code: code })
    })
    .then(response => {
        if (response.ok) {
            window.location.href = `/lobby?code=${encodeURIComponent(code)}`;
        } else {
            return response.json().then(data => {
                alert(data.error || 'An error occurred while joining the lobby');
            });
        }
    })
    .catch(error => {
        console.error('Error joining lobby:', error);
        alert('An error occurred while joining the lobby');
    });
}
