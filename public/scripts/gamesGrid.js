
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
    'public/assets/testTanks.png',
    
];


const grid = document.querySelector('.GameArea .grid');

imageUrls.forEach(imageUrl => {
    const img = document.createElement('img');
    
    img.src = imageUrl;
    
    img.classList.add('grid-image');

    grid.appendChild(img);
});
