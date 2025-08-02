/*
  This script loads card data from cards.json and renders the appropriate
  cards based on the selected category. It also handles navigation link
  activation and sets the current year in the footer.
*/

document.addEventListener('DOMContentLoaded', () => {
  const cardsSection = document.getElementById('cards-section');
  const navLinks = document.querySelectorAll('.nav-link');
  const imageModal = document.getElementById('image-modal');
  const modalImage = document.getElementById('modal-image');
  let cards = [];

  // Fetch card data from the JSON file
  fetch('cards.json')
    .then(response => {
      if (!response.ok) {
        throw new Error('Network response was not ok');
      }
      return response.json();
    })
    .then(data => {
      cards = data;
      displayCards('home');
    })
    .catch(err => {
      console.error('Error loading cards:', err);
      cardsSection.innerHTML = '<p>Unable to load card data.</p>';
    });

  // Display cards based on selected category
  function displayCards(category) {
    // Clear previous content
    cardsSection.innerHTML = '';

    // Determine which cards to show
    let filtered;
    if (category === 'home') {
      filtered = cards;
    } else {
      filtered = cards.filter(card => card.category === category);
    }

    // Show message if no cards are available
    if (filtered.length === 0) {
      const message = document.createElement('p');
      message.textContent = 'No cards available in this category.';
      cardsSection.appendChild(message);
      return;
    }

    // Render each card
    filtered.forEach(card => {
      const cardElem = document.createElement('div');
      cardElem.classList.add('card');
      cardElem.innerHTML = `
        <img src="${card.image_path}" alt="${card.player} ${card.year}" />
        <div class="card-details">
          <h3>${card.player}</h3>
          <p><strong>Year:</strong> ${card.year}</p>
          <p><strong>Condition:</strong> ${card.condition}</p>
          <p><strong>Market Value:</strong> ${card.market_value}</p>
        </div>
      `;
      cardsSection.appendChild(cardElem);

      // Add click handler to enlarge image
      const img = cardElem.querySelector('img');
      img.addEventListener('click', () => {
        modalImage.src = img.src;
        modalImage.classList.remove('zoomed');
        imageModal.classList.add('show');
      });
    });
  }

  // Handle navigation link clicks
  navLinks.forEach(link => {
    link.addEventListener('click', event => {
      event.preventDefault();
      const category = link.getAttribute('data-category');

      // Update active class on navigation links
      navLinks.forEach(l => l.classList.remove('active'));
      link.classList.add('active');

      // Display cards for the selected category
      displayCards(category);
    });
  });

  // Set the current year in the footer
  document.getElementById('current-year').textContent = new Date().getFullYear();

  // Close modal when clicked outside image
  imageModal.addEventListener('click', () => {
    imageModal.classList.remove('show');
  });

  // Toggle zoom on modal image
  modalImage.addEventListener('click', event => {
    event.stopPropagation();
    modalImage.classList.toggle('zoomed');
  });
});
