const { displayCards, setCards, setCardsSection } = require('./script');

describe('displayCards', () => {
  let cardsSection;

  beforeEach(() => {
    document.body.innerHTML = '<section id="cards-section"></section>';
    cardsSection = document.getElementById('cards-section');
    setCardsSection(cardsSection);
    setCards([
      {
        category: 'rookie',
        player: 'Player 1',
        year: 2023,
        condition: 'Mint',
        market_value: '$100',
        image_path: 'rookie.jpg'
      },
      {
        category: 'veteran',
        player: 'Player 2',
        year: 2022,
        condition: 'Good',
        market_value: '$50',
        image_path: 'veteran.jpg'
      }
    ]);
  });

  test("renders only rookie cards", () => {
    displayCards('rookie');
    const cards = cardsSection.querySelectorAll('.card');
    expect(cards.length).toBe(1);
    expect(cards[0].querySelector('h3').textContent).toBe('Player 1');
  });

  test("shows message when category is empty or unknown", () => {
    displayCards('legend');
    expect(cardsSection.textContent).toBe('No cards available in this category.');

    displayCards('');
    expect(cardsSection.textContent).toBe('No cards available in this category.');
  });
});
