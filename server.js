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

let lobbies = {};

function lobbyExists(code) {
  return lobbies.hasOwnProperty(code);
}

app.post('/api/lobbies/join', (req, res) => {
  const { code } = req.body;

  if (code.length !== 6 || !lobbyExists(code)) {
    res.status(404).json({ error: 'Invalid lobby code' });
    return;
  }

  res.redirect(`/lobby?code=${encodeURIComponent(code)}`);
});

app.post('/api/lobbies/create', (req, res) => {
  const { lobbyName, gameType, isPrivate } = req.body;

  if (req.body.code && lobbyExists(req.body.code)) {
    res.status(400).json({ error: 'Lobby code already exists' });
    return;
  }

  let lobbyCode;
  do {
    lobbyCode = generateRandomCode(6);
  } while (lobbyExists(lobbyCode));

  const lobby = {
      lobbyName,
      gameType,
      isPrivate,
      players: [] 
  };

  lobbies[lobbyCode] = lobby;

  res.json({ lobbyCode });
});

function generateRandomCode(length) {
    let result = '';
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    const charactersLength = characters.length;
    for (let i = 0; i < length; i++) {
        result += characters.charAt(Math.floor(Math.random() * charactersLength));
    }
    return result;
}

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

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

// WebSocket connection handling
io.on('connection', (socket) => {
  console.log(`A user connected with ID: ${socket.id}`); // Log the user's Socket.IO ID

  socket.on('disconnect', () => {
    console.log(`User disconnected with ID: ${socket.id}`);
  });

  socket.on('join lobby', (lobbyCode) => {
    socket.join(lobbyCode); // Join the room identified by the lobbyCode
    console.log(`User with ID ${socket.id} joined lobby: ${lobbyCode}`);

    socket.on('chat message', (data) => {
      const { message } = data;
      io.to(lobbyCode).emit('chat message', { userId: socket.id, message }); // Broadcast the message along with the user's ID to users in the same lobby
    });
  });
});




