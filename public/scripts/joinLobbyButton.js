document.addEventListener('DOMContentLoaded', function() {
    document.getElementById('join').addEventListener('click', showJoinInput);
    document.getElementById('joinBtn').addEventListener('click', joinLobby);
});

function showJoinInput() {
    document.getElementById('joinInput').style.display = 'block';
}

function joinLobby() {
    var code = document.getElementById('joinCode').value;
    if (code.trim() !== '') {
        window.location.href = '/game?code=' + encodeURIComponent(code);
    } else {
        alert('Please enter a code');
    }
}


