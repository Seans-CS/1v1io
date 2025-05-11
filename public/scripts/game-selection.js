// DOM Elements
const gameOrder = document.getElementById('gameOrder');
const startMatchBtn = document.getElementById('startMatch');
const gameItems = document.querySelectorAll('.game-item');

// Game state
let selectedGames = [];
const MAX_GAMES = 5;

// Initialize
window.onload = function() {
    // Get lobby info from localStorage
    const lobbyCode = localStorage.getItem('lobbyCode');
    const isHost = localStorage.getItem('isHost') === 'true';
    
    if (!lobbyCode) {
        // Redirect to menu if no lobby code
        location.href = 'menu.html';
        return;
    }
}

// Handle game selection
gameItems.forEach(item => {
    item.addEventListener('click', () => {
        const game = item.dataset.game;
        
        if (selectedGames.includes(game)) {
            // Remove game if already selected
            selectedGames = selectedGames.filter(g => g !== game);
            item.classList.remove('selected');
        } else if (selectedGames.length < MAX_GAMES) {
            // Add game if not at max
            selectedGames.push(game);
            item.classList.add('selected');
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
        // Save selected games to localStorage
        localStorage.setItem('selectedGames', JSON.stringify(selectedGames));
        // Redirect to match page
        location.href = 'match.html';
    }
});

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