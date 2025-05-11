// DOM Elements
const gameSelection = document.getElementById('gameSelection');
const waitingRoom = document.getElementById('waitingRoom');
const matchScreen = document.getElementById('matchScreen');
const gameOrder = document.getElementById('gameOrder');
const startMatchBtn = document.getElementById('startMatch');
const gameItems = document.querySelectorAll('.game-item');
const currentGameName = document.getElementById('currentGameName');
const progressList = document.querySelector('.progress-list');

// Game state
let selectedGames = [];
const MAX_GAMES = 5;
let currentGameIndex = 0;
let scores = {
    host: 0,
    opponent: 0
};
let isHost = false;
let playerName = '';
let opponentName = '';

// Initialize based on URL parameters
window.onload = function() {
    const urlParams = new URLSearchParams(window.location.search);
    const mode = urlParams.get('mode');
    const code = urlParams.get('code');
    
    // Get player name from localStorage
    playerName = localStorage.getItem('playerName') || 'Player';
    
    if (mode === 'create') {
        isHost = true;
        const lobbyCode = generateLobbyCode();
        showWaitingRoom(lobbyCode);
    } else if (mode === 'join' && code) {
        isHost = false;
        showWaitingRoom(code);
    } else {
        // Quick play mode
        isHost = true;
        const lobbyCode = generateLobbyCode();
        showWaitingRoom(lobbyCode);
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

// Show waiting room
function showWaitingRoom(lobbyCode) {
    waitingRoom.classList.remove('hidden');
    
    // Update lobby code display
    const codeDisplay = waitingRoom.querySelector('.lobby-code-display');
    codeDisplay.textContent = lobbyCode;
    
    // Update player list
    const hostName = waitingRoom.querySelector('.player.host .player-name');
    hostName.textContent = playerName;
    
    // Simulate opponent joining (in real app, this would be handled by server)
    setTimeout(() => {
        if (!isHost) {
            showGameSelection();
        }
    }, 2000);
}

// Show game selection screen
function showGameSelection() {
    waitingRoom.classList.add('hidden');
    gameSelection.classList.remove('hidden');
}

// Handle game selection
gameItems.forEach(item => {
    item.addEventListener('click', () => {
        const game = item.dataset.game;
        
        if (selectedGames.includes(game)) {
            // Remove game if already selected
            selectedGames = selectedGames.filter(g => g !== game);
        } else if (selectedGames.length < MAX_GAMES) {
            // Add game if not at max
            selectedGames.push(game);
        }

        updateGameOrder();
        updateStartButton();
    });
});

// Update the game order display
function updateGameOrder() {
    gameOrder.innerHTML = '';
    selectedGames.forEach((game, index) => {
        const gameItem = document.createElement('div');
        gameItem.className = 'game-item';
        gameItem.innerHTML = `
            <span>${index + 1}. ${game.charAt(0).toUpperCase() + game.slice(1)}</span>
        `;
        gameOrder.appendChild(gameItem);
    });
}

// Update start button state
function updateStartButton() {
    startMatchBtn.disabled = selectedGames.length !== MAX_GAMES;
}

// Start the match
startMatchBtn.addEventListener('click', () => {
    if (selectedGames.length === MAX_GAMES) {
        showMatchScreen();
    }
});

// Show match screen
function showMatchScreen() {
    gameSelection.classList.add('hidden');
    matchScreen.classList.remove('hidden');
    
    // Initialize score board
    updateScoreBoard();
    
    // Initialize game progress
    updateGameProgress();
    
    // Start first game
    startGame(0);
}

// Update score board
function updateScoreBoard() {
    const hostScore = matchScreen.querySelector('.player-score.host .score');
    const opponentScore = matchScreen.querySelector('.player-score.opponent .score');
    const hostName = matchScreen.querySelector('.player-score.host .player-name');
    const opponentName = matchScreen.querySelector('.player-score.opponent .player-name');
    
    hostScore.textContent = scores.host;
    opponentScore.textContent = scores.opponent;
    hostName.textContent = playerName;
    opponentName.textContent = 'Opponent';
}

// Update game progress
function updateGameProgress() {
    progressList.innerHTML = '';
    selectedGames.forEach((game, index) => {
        const progressItem = document.createElement('div');
        progressItem.className = 'progress-item';
        if (index < currentGameIndex) {
            progressItem.classList.add('completed');
        }
        progressItem.textContent = `${index + 1}. ${game}`;
        progressList.appendChild(progressItem);
    });
}

// Start a specific game
function startGame(index) {
    currentGameIndex = index;
    const game = selectedGames[index];
    currentGameName.textContent = game.charAt(0).toUpperCase() + game.slice(1);
    
    // Here you would load the actual game
    const gameContainer = matchScreen.querySelector('.game-container');
    gameContainer.innerHTML = `<p>Loading ${game}...</p>`;
    
    // Simulate game completion (in real app, this would be handled by the game)
    setTimeout(() => {
        const winner = Math.random() > 0.5 ? 'host' : 'opponent';
        endGame(winner);
    }, 3000);
}

// End current game
function endGame(winner) {
    scores[winner]++;
    updateScoreBoard();
    updateGameProgress();
    
    // Check if match is over
    if (scores.host >= 3 || scores.opponent >= 3) {
        endMatch();
    } else {
        // Start next game
        startGame(currentGameIndex + 1);
    }
}

// End match
function endMatch() {
    const winner = scores.host >= 3 ? 'host' : 'opponent';
    const gameContainer = matchScreen.querySelector('.game-container');
    gameContainer.innerHTML = `
        <div class="match-result">
            <h2>Match Over!</h2>
            <p>${winner === 'host' ? playerName : 'Opponent'} wins the match!</p>
            <button class="btn primary" onclick="location.href='menu.html'">Back to Menu</button>
        </div>
    `;
}

// Add some visual feedback for selected games
gameItems.forEach(item => {
    item.addEventListener('mouseover', () => {
        if (!selectedGames.includes(item.dataset.game) && selectedGames.length < MAX_GAMES) {
            item.style.transform = 'translateY(-5px)';
        }
    });

    item.addEventListener('mouseout', () => {
        if (!selectedGames.includes(item.dataset.game)) {
            item.style.transform = 'translateY(0)';
        }
    });
});

// Copy lobby code to clipboard
function copyLobbyCode() {
    const codeDisplay = document.querySelector('.lobby-code-display');
    const code = codeDisplay.textContent;
    
    navigator.clipboard.writeText(code).then(() => {
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