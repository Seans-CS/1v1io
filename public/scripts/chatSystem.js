document.addEventListener('DOMContentLoaded', function() {
    const lobbyCode = window.location.search.split('=')[1]; // Extract the lobby code from the URL
    const socket = io(); // Connect to the server

    // Notify the server that the user has joined the lobby
    socket.emit('join lobby', lobbyCode);

    // Select chat-related DOM elements
    const chatMessages = document.querySelector('.ChatMessages');
    const chatInput = document.getElementById('ChatInput');
    const sendButton = document.getElementById('sendButton');

    // Function to append a new message to the chat area
    function appendMessage(message) {
        const messageElement = document.createElement('div');
        messageElement.setAttribute('id', 'ChatMessageId');
        messageElement.textContent = message;
        chatMessages.appendChild(messageElement);
    }

    // Event listener for the send button click
    sendButton.addEventListener('click', function() {
        const message = chatInput.value.trim();
        if (message !== '') {
            socket.emit('chat message', { message }); // Emit the message to the server without specifying the user's name
            chatInput.value = ''; // Clear the input field
        }
    });

    // Event listener for receiving messages from the server
    socket.on('chat message', function(data) {
        const { userId, message } = data;
        const messageWithUserId = `${userId}: ${message}`; // Concatenate the user's ID with the message
        appendMessage(messageWithUserId);
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
