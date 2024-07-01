document.addEventListener('DOMContentLoaded', function() {
    const usernameForm = document.getElementById('usernameForm');

    usernameForm.addEventListener('submit', function(event) {
        event.preventDefault(); // Prevent default form submission behavior
        
        const usernameInput = document.getElementById('user-name');
        const username = usernameInput.value.trim();

        if (username) {
            localStorage.setItem('username', username); // Store the username in localStorage
            console.log('Username saved:', username); // Log the saved username
            alert('Username saved successfully!');
            usernameInput.value = ''; // Clear the input box after successful username storage
        } else {
            alert('Please enter a valid username.');
        }
    });
});
