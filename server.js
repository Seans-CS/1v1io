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

// Data store for lobbies
let lobbies = [];

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

// POST route for creating a lobby
app.post('/api/lobbies/create', (req, res) => {
  const { lobbyName, gameType, isPrivate } = req.body;

  // Generate a unique 6-digit alphanumeric lobby code
  const lobbyCode = generateRandomCode(6);

  // Store lobby information
  const lobby = {
      lobbyCode,
      lobbyName,
      gameType,
      isPrivate,
      players: [] 
  };

  lobbies.push(lobby);

  // Respond with the generated lobby code
  res.json({ lobbyCode });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
