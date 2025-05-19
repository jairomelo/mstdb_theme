const heroImages = [
    '/media/rutas_project1.webp',
    '/media/rutas_project2.webp',
    '/media/rutas_project3.webp',
    '/media/rutas_project4.webp'
];

async function setRandomHeroImage(heroSectionElement) {
    const randomIndex = Math.floor(Math.random() * heroImages.length);
    const selectedImage = heroImages[randomIndex];
    
    if (heroSectionElement) {
        heroSectionElement.style.backgroundImage = `url('${selectedImage}')`;
    }
}

export { setRandomHeroImage };