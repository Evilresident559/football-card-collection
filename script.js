/*
  This script loads card data from cards.json and renders the appropriate
  cards based on the selected category. It also handles navigation link
  activation and sets the current year in the footer.
*/

let cards = [];
let cardsSection =
  typeof document !== 'undefined'
    ? document.getElementById('cards-section')
    : null;
let navLinks;
let imageModal;
let modalImage;
let isZoomed = false;
let isDragging = false;
let dragStartX = 0;
let dragStartY = 0;
let translateX = 0;
let translateY = 0;

function resetZoom() {
  isZoomed = false;
  isDragging = false;
  translateX = 0;
  translateY = 0;
  if (modalImage) {
    modalImage.classList.remove('zoomed');
    modalImage.style.transform = '';
    modalImage.style.cursor = 'zoom-in';
  }
}

// Display cards based on selected category
function displayCards(category) {
  if (!cardsSection) return;

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
    const details = [];
    if (card.player) details.push(`<h3>${card.player}</h3>`);
    if (card.year) details.push(`<p><strong>Year:</strong> ${card.year}</p>`);
    if (card.condition)
      details.push(`<p><strong>Condition:</strong> ${card.condition}</p>`);
    if (card.market_value)
      details.push(`<p><strong>Market Value:</strong> ${card.market_value}</p>`);

    const detailsHtml =
      details.length > 0
        ? `<div class="card-details">${details.join('')}</div>`
        : '';

    cardElem.innerHTML = `
      <img src="${card.image_path}" alt="${[card.player, card.year]
        .filter(Boolean)
        .join(' ')}" />
      ${detailsHtml}
    `;
    cardsSection.appendChild(cardElem);

    // Add click handler to enlarge image if modal elements exist
    if (imageModal && modalImage) {
      const img = cardElem.querySelector('img');
      img.addEventListener('click', () => {
        modalImage.src = img.src;
        modalImage.classList.remove('zoomed');
        imageModal.classList.add('show');
      });
    }
  });
}

// Utility setters for testing
function setCards(data) {
  cards = data;
}

function setCardsSection(section) {
  cardsSection = section;
}

if (typeof document !== 'undefined') {
  document.addEventListener('DOMContentLoaded', () => {
    cardsSection = document.getElementById('cards-section');
    navLinks = document.querySelectorAll('.nav-link');
    imageModal = document.getElementById('image-modal');
    modalImage = document.getElementById('modal-image');

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
    resetZoom();
  });

  // Toggle zoom on modal image
  modalImage.addEventListener('click', event => {
    event.stopPropagation();
    if (isDragging) {
      isDragging = false;
      return;
    }

    if (!isZoomed) {
      isZoomed = true;
      modalImage.classList.add('zoomed');
      modalImage.style.transform = 'translate(0px, 0px) scale(2)';
      modalImage.style.cursor = 'grab';
    } else {
      resetZoom();
    }
  });

  // Drag to pan when zoomed (mouse)
  modalImage.addEventListener('mousedown', e => {
    if (!isZoomed) return;
    isDragging = true;
    dragStartX = e.clientX - translateX;
    dragStartY = e.clientY - translateY;
    modalImage.style.cursor = 'grabbing';
  });

  window.addEventListener('mousemove', e => {
    if (!isDragging) return;
    translateX = e.clientX - dragStartX;
    translateY = e.clientY - dragStartY;
    modalImage.style.transform = `translate(${translateX}px, ${translateY}px) scale(2)`;
  });

  window.addEventListener('mouseup', () => {
    if (!isDragging) return;
    isDragging = false;
    modalImage.style.cursor = 'grab';
  });

  // Drag to pan when zoomed (touch)
  modalImage.addEventListener('touchstart', e => {
    if (!isZoomed) return;
    const touch = e.touches[0];
    isDragging = true;
    dragStartX = touch.clientX - translateX;
    dragStartY = touch.clientY - translateY;
  });

  modalImage.addEventListener('touchmove', e => {
    if (!isDragging) return;
    const touch = e.touches[0];
    translateX = touch.clientX - dragStartX;
    translateY = touch.clientY - dragStartY;
    modalImage.style.transform = `translate(${translateX}px, ${translateY}px) scale(2)`;
    e.preventDefault();
  });

  modalImage.addEventListener('touchend', () => {
    isDragging = false;
  });
});
}

if (typeof module !== 'undefined') {
  module.exports = { displayCards, setCards, setCardsSection };
}
