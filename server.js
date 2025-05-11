const express = require('express');
const app = express();
const http = require('http').createServer(app);
const io = require('socket.io')(http);
const path = require('path');

// Serve static files
app.use(express.static(path.join(__dirname, 'public')));

// Store active lobbies and players
const lobbyData = {
    lobbies: new Map(),
    players: new Map(),
    lastUpdate: Date.now()
};

// Store disconnected players temporarily
const disconnectedPlayers = new Map();

// Debug function to log lobby state
function logLobbyState() {
    console.log('\n=== Current Lobby State ===');
    console.log('Active Lobbies:', Array.from(lobbyData.lobbies.keys()));
    for (const [code, lobby] of lobbyData.lobbies) {
        console.log(`\nLobby ${code}:`);
        console.log('- Host:', lobby.host);
        console.log('- Opponent:', lobby.opponent);
        console.log('- Status:', lobby.status);
        console.log('- Created:', new Date(lobby.createdAt).toISOString());
    }
    console.log('\nActive Players:', Array.from(lobbyData.players.keys()));
    for (const [id, player] of lobbyData.players) {
        console.log(`\nPlayer ${id}:`);
        console.log('- Name:', player.name);
        console.log('- Lobby:', player.lobbyId);
    }
    console.log('\nDisconnected Players:', Array.from(disconnectedPlayers.keys()));
    console.log('\n========================\n');
}

// Clean up stale lobbies every minute
setInterval(() => {
    const now = Date.now();
    let removedCount = 0;
    for (const [code, lobby] of lobbyData.lobbies) {
        // Remove lobbies older than 5 minutes or empty lobbies
        if (now - lobby.createdAt > 5 * 60 * 1000 || (!lobby.host && !lobby.opponent)) {
            console.log(`Removing stale lobby ${code}`);
            if (lobby.host) {
                io.to(lobby.host).emit('lobbyExpired');
            }
            if (lobby.opponent) {
                io.to(lobby.opponent).emit('lobbyExpired');
            }
            lobbyData.lobbies.delete(code);
            removedCount++;
        }
    }
    if (removedCount > 0) {
        console.log(`Removed ${removedCount} stale lobbies`);
        logLobbyState();
    }
    lobbyData.lastUpdate = now;
}, 60 * 1000); // Check every minute

// Socket.IO connection handling
io.on('connection', (socket) => {
    console.log(`\nUser connected: ${socket.id}`);
    logLobbyState();

    // Handle reconnection
    socket.on('reconnect', () => {
        console.log(`\nUser reconnected: ${socket.id}`);
        const player = lobbyData.players.get(socket.id) || disconnectedPlayers.get(socket.id);
        if (player) {
            console.log(`Restoring player ${player.name} (${socket.id})`);
            if (player.lobbyId) {
                const lobby = lobbyData.lobbies.get(player.lobbyId);
                if (lobby) {
                    // Join the lobby room
                    socket.join(player.lobbyId);
                    
                    if (socket.id === lobby.host) {
                        lobby.host = socket.id;
                    } else if (socket.id === lobby.opponent) {
                        lobby.opponent = socket.id;
                    }
                    console.log(`Restored player to lobby ${player.lobbyId}`);
                    
                    // Send current lobby state to reconnected player
                    const hostPlayer = lobbyData.players.get(lobby.host);
                    const opponentPlayer = lobby.opponent ? lobbyData.players.get(lobby.opponent) : null;
                    
                    socket.emit('lobbyState', {
                        host: {
                            id: lobby.host,
                            name: hostPlayer?.name
                        },
                        opponent: opponentPlayer ? {
                            id: lobby.opponent,
                            name: opponentPlayer.name
                        } : null,
                        status: lobby.status
                    });

                    // Notify other player about reconnection
                    if (socket.id === lobby.host && lobby.opponent) {
                        io.to(lobby.opponent).emit('opponentJoined', {
                            opponentName: hostPlayer.name,
                            opponentId: socket.id,
                            isHost: true
                        });
                    } else if (socket.id === lobby.opponent) {
                        io.to(lobby.host).emit('opponentJoined', {
                            opponentName: opponentPlayer.name,
                            opponentId: socket.id,
                            isHost: false
                        });
                    }
                } else {
                    console.log(`Lobby ${player.lobbyId} not found during reconnection`);
                }
            }
            // Move player back to active players
            if (disconnectedPlayers.has(socket.id)) {
                lobbyData.players.set(socket.id, player);
                disconnectedPlayers.delete(socket.id);
            }
        }
        logLobbyState();
    });

    // Handle player joining
    socket.on('playerJoin', ({ playerName }, callback) => {
        console.log(`\nPlayer join attempt: ${playerName} (${socket.id})`);
        
        // Check if player already exists
        if (lobbyData.players.has(socket.id)) {
            console.log(`Player ${playerName} (${socket.id}) already exists`);
            callback({ error: 'Player already exists' });
            return;
        }

        // Check if player was disconnected
        if (disconnectedPlayers.has(socket.id)) {
            const player = disconnectedPlayers.get(socket.id);
            console.log(`Restoring disconnected player ${playerName} (${socket.id})`);
            lobbyData.players.set(socket.id, player);
            disconnectedPlayers.delete(socket.id);
            callback({ success: true, playerId: socket.id });
            return;
        }

        console.log(`Player ${playerName} (${socket.id}) joined successfully`);
        lobbyData.players.set(socket.id, {
            name: playerName,
            lobbyId: null
        });
        callback({ success: true, playerId: socket.id });
        logLobbyState();
    });

    // Handle lobby creation
    socket.on('createLobby', (callback) => {
        console.log(`\nLobby creation attempt by ${socket.id}`);
        const player = lobbyData.players.get(socket.id);
        if (!player) {
            console.log(`Player ${socket.id} not found when creating lobby`);
            callback({ error: 'Player not found' });
            return;
        }

        const lobbyCode = generateLobbyCode();
        const lobby = {
            code: lobbyCode,
            host: socket.id,
            opponent: null,
            status: 'waiting',
            games: [],
            createdAt: Date.now()
        };
        
        console.log(`Creating lobby ${lobbyCode} for host ${player.name} (${socket.id})`);
        lobbyData.lobbies.set(lobbyCode, lobby);
        player.lobbyId = lobbyCode;
        
        // Join the socket room before sending the response
        socket.join(lobbyCode);
        
        // Send the response after joining the room
        callback({ success: true, lobbyCode });
        logLobbyState();
    });

    // Handle joining lobby
    socket.on('joinLobby', ({ lobbyCode }, callback) => {
        const player = lobbyData.players.get(socket.id);
        if (!player) {
            console.log(`\nPlayer ${socket.id} not found when joining lobby`);
            callback({ error: 'Player not found' });
            return;
        }

        console.log(`\nJoin lobby attempt: ${player.name} (${socket.id}) -> ${lobbyCode}`);
        console.log('Active lobbies:', Array.from(lobbyData.lobbies.keys()));
        
        const lobby = lobbyData.lobbies.get(lobbyCode);
        
        if (!lobby) {
            console.log(`Lobby ${lobbyCode} not found`);
            callback({ error: 'Lobby not found' });
            return;
        }
        
        if (lobby.opponent) {
            console.log(`Lobby ${lobbyCode} is full`);
            callback({ error: 'Lobby is full' });
            return;
        }

        if (lobby.host === socket.id) {
            console.log(`Player ${player.name} (${socket.id}) is already the host`);
            callback({ error: 'You are already the host of this lobby' });
            return;
        }

        // Check if host is still connected
        const hostSocket = io.sockets.sockets.get(lobby.host);
        if (!hostSocket) {
            console.log(`Host of lobby ${lobbyCode} is not connected`);
            callback({ error: 'Host is no longer connected' });
            return;
        }

        console.log(`Player ${player.name} (${socket.id}) joining lobby ${lobbyCode}`);
        
        // Update lobby state
        lobby.opponent = socket.id;
        player.lobbyId = lobbyCode;
        
        // Join the socket room before sending events
        socket.join(lobbyCode);
        
        // Get player information
        const hostPlayer = lobbyData.players.get(lobby.host);
        const opponentPlayer = player;
        
        // Send to host
        hostSocket.emit('opponentJoined', {
            opponentName: opponentPlayer.name,
            opponentId: socket.id,
            isHost: false
        });
        
        // Send to opponent
        socket.emit('opponentJoined', {
            opponentName: hostPlayer.name,
            opponentId: lobby.host,
            isHost: true
        });
        
        // Send current lobby state to both players
        const lobbyState = {
            host: {
                id: lobby.host,
                name: hostPlayer.name
            },
            opponent: {
                id: socket.id,
                name: opponentPlayer.name
            },
            status: lobby.status
        };
        
        // Use to() instead of emit() to ensure both players receive the state
        io.to(lobbyCode).emit('lobbyState', lobbyState);
        
        callback({ success: true });
        logLobbyState();
    });

    // Handle game selection
    socket.on('selectGames', ({ games }, callback) => {
        const player = lobbyData.players.get(socket.id);
        if (!player || !player.lobbyId) {
            console.log(`\nGame selection failed: Player or lobby not found for ${socket.id}`);
            callback({ error: 'Player or lobby not found' });
            return;
        }

        const lobby = lobbyData.lobbies.get(player.lobbyId);
        if (!lobby) {
            console.log(`\nGame selection failed: Lobby ${player.lobbyId} not found`);
            callback({ error: 'Lobby not found' });
            return;
        }

        console.log(`\nGame selection by ${player.name} (${socket.id}) in lobby ${player.lobbyId}`);
        if (socket.id === lobby.host) {
            lobby.hostGames = games;
        } else {
            lobby.opponentGames = games;
        }

        // If both players have selected games, start the match
        if (lobby.hostGames && lobby.opponentGames) {
            console.log(`Starting match in lobby ${player.lobbyId}`);
            io.to(lobby.lobbyId).emit('matchStart', {
                hostGames: lobby.hostGames,
                opponentGames: lobby.opponentGames
            });
        }

        callback({ success: true });
        logLobbyState();
    });

    // Handle disconnection
    socket.on('disconnect', () => {
        console.log(`\nUser disconnected: ${socket.id}`);
        const player = lobbyData.players.get(socket.id);
        if (player) {
            // Store player data for potential reconnection
            disconnectedPlayers.set(socket.id, player);
            
            if (player.lobbyId) {
                const lobby = lobbyData.lobbies.get(player.lobbyId);
                if (lobby) {
                    if (socket.id === lobby.host) {
                        console.log(`Host disconnected from lobby ${player.lobbyId}`);
                        if (lobby.opponent) {
                            io.to(lobby.opponent).emit('hostDisconnected');
                            // Give host 30 seconds to reconnect before removing lobby
                            setTimeout(() => {
                                if (!lobbyData.players.has(socket.id)) {
                                    console.log(`Removing lobby ${player.lobbyId} after host timeout`);
                                    lobbyData.lobbies.delete(player.lobbyId);
                                }
                            }, 30000);
                        } else {
                            // If no opponent, remove lobby immediately
                            lobbyData.lobbies.delete(player.lobbyId);
                        }
                    } else if (socket.id === lobby.opponent) {
                        console.log(`Opponent disconnected from lobby ${player.lobbyId}`);
                        io.to(lobby.host).emit('opponentDisconnected');
                        // Remove opponent immediately
                        lobby.opponent = null;
                        // Update lobby state for remaining players
                        io.to(lobby.code).emit('lobbyState', {
                            host: {
                                id: lobby.host,
                                name: lobbyData.players.get(lobby.host)?.name
                            },
                            opponent: null,
                            status: lobby.status
                        });
                    }
                }
            }
            // Remove from active players but keep in disconnected
            lobbyData.players.delete(socket.id);
        }
        logLobbyState();
    });
});

// Generate a random lobby code
function generateLobbyCode() {
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let code;
    do {
        code = '';
        for (let i = 0; i < 6; i++) {
            code += characters.charAt(Math.floor(Math.random() * characters.length));
        }
    } while (lobbyData.lobbies.has(code));
    console.log(`Generated new lobby code: ${code}`);
    return code;
}

const PORT = process.env.PORT || 3000;
http.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
    console.log('Waiting for connections...');
}); 