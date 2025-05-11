// DOM Elements
const waitingRoom = document.getElementById('waitingRoom');
const codeDisplay = document.querySelector('.lobby-code-display');
const hostName = document.querySelector('.player.host .player-name');
const opponentName = document.querySelector('.player.opponent .player-name');
const opponentStatus = document.querySelector('.player.opponent .player-status');

// Game state
let isHost = false;
let playerName = '';
let lobbyCode = '';

// Initialize
window.onload = function() {
    const urlParams = new URLSearchParams(window.location.search);
    const mode = urlParams.get('mode');
    const code = urlParams.get('code');
    
    // Get player name from localStorage
    playerName = localStorage.getItem('playerName') || 'Player';
    
    if (mode === 'create') {
        isHost = true;
        lobbyCode = generateLobbyCode();
    } else if (mode === 'join' && code) {
        isHost = false;
        lobbyCode = code;
    } else {
        // Quick play mode
        isHost = true;
        lobbyCode = generateLobbyCode();
    }

    // Save lobby info to localStorage
    localStorage.setItem('lobbyCode', lobbyCode);
    localStorage.setItem('isHost', isHost);
    
    // Update UI
    updateLobbyUI();
    
    // Start checking for opponent
    if (isHost) {
        checkForOpponent();
    } else {
        // Simulate joining as opponent
        setTimeout(() => {
            location.href = 'game-selection.html';
        }, 2000);
    }
}

// Generate a random lobby code
function generateLobbyCode() {
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let code = '';
    for (let i = 0; i < 6; i++) {
        code += characters.charAt(Math.floor(Math.random() * characters.length));
    }
    return code;
}

// Update lobby UI
function updateLobbyUI() {
    codeDisplay.textContent = lobbyCode;
    hostName.textContent = playerName;
}

// Copy lobby code to clipboard
function copyLobbyCode() {
    navigator.clipboard.writeText(lobbyCode).then(() => {
        const copyBtn = document.querySelector('.copy-code');
        const originalText = copyBtn.innerHTML;
        copyBtn.innerHTML = '<span class="copy-icon">✓</span> Copied!';
        
        setTimeout(() => {
            copyBtn.innerHTML = originalText;
        }, 2000);
    }).catch(err => {
        console.error('Failed to copy code:', err);
    });
}

// Check for opponent (in real app, this would be handled by server)
function checkForOpponent() {
    // Simulate opponent joining after 5 seconds
    setTimeout(() => {
        opponentName.textContent = 'Opponent';
        opponentStatus.textContent = 'Ready';
        opponentStatus.style.animation = 'none';
        
        // Redirect to game selection after a short delay
        setTimeout(() => {
            location.href = 'game-selection.html';
        }, 1000);
    }, 5000);
} 