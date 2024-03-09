const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const { v4: uuidv4 } = require('uuid');

const app = express();
const server = http.createServer(app);
const io = socketIo(server);

app.use(express.static('public'));
app.use(express.json());
app.set('view engine', 'ejs');
app.use('/public', express.static('public'));
// Data store for lobbies
let lobbies = {};

// Function to check if a lobby with the given code exists
function lobbyExists(code) {
  return lobbies.hasOwnProperty(code);
}

/// POST route for joining a lobby
app.post('/api/lobbies/join', (req, res) => {
  const { code } = req.body;

  // Check if the code meets the criteria for a valid lobby code
  if (code.length !== 6 || !lobbyExists(code)) {
    // Respond with an error if the code is invalid or the lobby doesn't exist
    res.status(404).json({ error: 'Invalid lobby code' });
    return;
  }

  // Redirect the user to the lobby page
  res.redirect(`/lobby?code=${encodeURIComponent(code)}`);
});

// POST route for creating a lobby
app.post('/api/lobbies/create', (req, res) => {
  const { lobbyName, gameType, isPrivate } = req.body;

  // If lobby code provided, check if the lobby already exists
  if (req.body.code && lobbyExists(req.body.code)) {
    res.status(400).json({ error: 'Lobby code already exists' });
    return;
  }

  // Generate a unique 6-digit alphanumeric lobby code
  let lobbyCode;
  do {
    lobbyCode = generateRandomCode(6);
  } while (lobbyExists(lobbyCode)); // Ensure the generated code is unique

  // Store lobby information
  const lobby = {
      lobbyName,
      gameType,
      isPrivate,
      players: [] 
  };

  lobbies[lobbyCode] = lobby;

  // Respond with the generated lobby code
  res.json({ lobbyCode });
});

// Function to generate a random alphanumeric string of a specified length
function generateRandomCode(length) {
    let result = '';
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    const charactersLength = characters.length;
    for (let i = 0; i < length; i++) {
        result += characters.charAt(Math.floor(Math.random() * charactersLength));
    }
    return result;
}

// Get Routes
app.get('/', (req, res) => {
  res.redirect('/home');
});

app.get('/home', (req, res) => {
  res.render('home');
});

app.get('/lobby', (req, res) => {
  res.render('lobby', { lobbies });
});

app.get('/game', (req, res) => {
  res.render('testGameLayout');
});

// Socket Connection
io.on('connection', (socket) => {
  console.log('A user connected');

  socket.on('disconnect', () => {
    console.log('User disconnected');
  });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
