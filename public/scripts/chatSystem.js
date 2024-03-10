const socket = io();

function sendMessage() {
    const message = document.getElementById('ChatInput').value;
    const userName = "User"; // Replace "User" with the actual user's name or identifier
    socket.emit('chat message', { userName, message });
    document.getElementById('ChatInput').value = '';
}

socket.on('chat message', (data) => {
    const { userName, message } = data;
    const chatMessages = document.querySelector('.ChatMessages');
    const messageElement = document.createElement('div');
    messageElement.innerText = `[${userName}] ${message}`;
    chatMessages.appendChild(messageElement);
});

document.addEventListener('DOMContentLoaded', function() {
    const chatInput = document.getElementById('ChatInput');
    if (chatInput) {
        chatInput.addEventListener('keydown', (event) => {
            if (event.key === 'Enter') {
                sendMessage();
            }
        });
    } else {
        console.error('Element with ID "ChatInput" not found.');
    }
});

document.addEventListener('DOMContentLoaded', function() {
    const sendButton = document.getElementById('sendButton');
    if (sendButton) {
        sendButton.addEventListener('click', sendMessage);
    } else {
        console.error('Element with ID "sendButton" not found.');
    }
});
