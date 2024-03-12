const imageUrls = [
    'public/assets/testTanks.png',
    'public/assets/testTanks.png',
    'public/assets/testTanks.png',
    'public/assets/testTanks.png',
    'public/assets/testTanks.png',
    'public/assets/testTanks.png',
    'public/assets/testTanks.png',
    'public/assets/testTanks.png',
    'public/assets/testTanks.png',
    'public/assets/testTanks.png',
    'public/assets/testTanks.png',
    'public/assets/testTanks.png',
    'public/assets/testTanks.png',
    'public/assets/testTanks.png',
    'public/assets/testTanks.png',
    'public/assets/testTanks.png'
];

const grid = document.querySelector('.GameArea .grid');

imageUrls.forEach(imageUrl => {
    const imgContainer = document.createElement('div');
    const img = document.createElement('img');
    img.src = imageUrl;
    img.classList.add('grid-image');
    
    // Add click event listener to each image container
    imgContainer.addEventListener('click', function() {
        if (img.classList.contains('grayed')) {
            // If image is already grayed out, remove grayed class and check mark
            img.classList.remove('grayed');
            const checkmark = this.querySelector('.checkmark');
            
        } else {
            // If image is not grayed out, add grayed class and check mark
            img.classList.add('grayed');
            const checkmark = document.createElement('div');
        }
    });

    imgContainer.appendChild(img);
    grid.appendChild(imgContainer);
});
