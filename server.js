const express = require('express');
const osUtils = require('os-utils');
const http = require('http');
const socketIo = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = socketIo(server);

app.use(express.static('public'));
app.set('view engine', 'ejs');


//Get Routes
app.get('/', (req, res) => {
  res.redirect('/home');
});

app.get('/home', (req, res) => {
  res.render('home');
});

app.get('/lobby', (req, res) => {
    res.render('lobby');
  });

  app.get('/game', (req, res) => {
    res.render('testGameLayout');
  });




//Socket Connecion
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
