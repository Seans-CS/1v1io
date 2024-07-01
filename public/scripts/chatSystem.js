document.addEventListener('DOMContentLoaded', function() {
    const lobbyCode = window.location.search.split('=')[1]; // Extract the lobby code from the URL
    const socket = io(); // Connect to the server

    // Notify the server that the user has joined the lobby
    socket.emit('join lobby', lobbyCode);

    // Select chat-related DOM elements
    const chatMessages = document.querySelector('.ChatMessages');
    const chatInput = document.getElementById('ChatInput');
    const sendButton = document.getElementById('sendButton');

    // Function to prepend a new message to the chat area
    function prependMessage(message) {
        const messageElement = document.createElement('div');
        messageElement.setAttribute('class', 'ChatMessage'); // Add class to the message element
        messageElement.setAttribute('id', 'ChatMessageId'); // Add class to the message element
        messageElement.textContent = message;
        chatMessages.insertBefore(messageElement, chatMessages.firstChild); // Insert message at the top
        messageElement.scrollIntoView({ behavior: 'smooth', block: 'end' });
    }

    // Event listener for pressing Enter key in the chat input field
    chatInput.addEventListener('keypress', function(event) {
        if (event.key === 'Enter') {
            sendMessage();
        }
    });

    // Function to send a message
    function sendMessage() {
        const message = chatInput.value.trim();
        if (message !== '') {
            socket.emit('chat message', { message }); // Emit the message to the server without specifying the user's name
            chatInput.value = ''; // Clear the input field
        }
    }

    // Event listener for the send button click
    sendButton.addEventListener('click', sendMessage);

   // Event listener for receiving messages from the server
socket.on('chat message', function(data) {
    const { userId, message } = data;
    const username = localStorage.getItem('username'); // Retrieve the username from localStorage
    const messageWithUsername = `${username}: ${message}`; // Concatenate the username with the message
    prependMessage(messageWithUsername);
});
    // Event listener for handling WebSocket connection errors
    socket.on('connect_error', function(error) {
        console.error('WebSocket connection error:', error);
    });

    // Event listener for handling WebSocket disconnections
    socket.on('disconnect', function(reason) {
        console.log('WebSocket disconnected:', reason);
    });
});
