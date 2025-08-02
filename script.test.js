const { displayCards, setCards, setCardsSection } = require('./script');

describe('displayCards', () => {
  let cardsSection;

  beforeEach(() => {
    global.document = {
      createElement: tag => ({
        tagName: tag,
        classList: { add() {} },
        innerHTML: '',
        textContent: '',
        children: [],
        appendChild(child) {
          this.children.push(child);
        },
        querySelector(selector) {
          if (selector === 'h3') {
            const match = this.innerHTML.match(/<h3>([^<]*)<\/h3>/);
            if (match) return { textContent: match[1] };
          }
          if (selector === '.card-details') {
            return this.innerHTML.includes('class="card-details"') ? {} : null;
          }
          if (selector === 'img') {
            const match = this.innerHTML.match(/<img[^>]*src="([^"]*)"[^>]*>/);
            if (match)
              return {
                getAttribute: attr => (attr === 'src' ? match[1] : null),
                addEventListener: () => {}
              };
          }
          return null;
        }
      })
    };

    cardsSection = {
      _innerHTML: '',
      children: [],
      textContent: '',
      set innerHTML(val) {
        this._innerHTML = val;
        if (val === '') this.children = [];
      },
      get innerHTML() {
        return this._innerHTML;
      },
      appendChild(child) {
        this.children.push(child);
        if (child.textContent) this.textContent = child.textContent;
      },
      querySelectorAll(selector) {
        if (selector === '.card') return this.children;
        return [];
      },
      querySelector(selector) {
        if (selector === '.card') return this.children[0] || null;
        return null;
      }
    };
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

  test('renders image only when details are missing', () => {
    setCards([
      { category: 'rookie', image_path: 'image_only.jpg' }
    ]);
    displayCards('rookie');
    const card = cardsSection.querySelector('.card');
    expect(card).not.toBeNull();
    expect(card.querySelector('img').getAttribute('src')).toBe('image_only.jpg');
    expect(card.querySelector('.card-details')).toBeNull();
  });
});

describe('image modal', () => {
  test('pressing Escape closes the modal', () => {
    const listeners = {};
    const imageModal = {
      classList: {
        classes: new Set(['show']),
        add(cls) {
          this.classes.add(cls);
        },
        remove(cls) {
          this.classes.delete(cls);
        },
        contains(cls) {
          return this.classes.has(cls);
        }
      },
      addEventListener: () => {}
    };
    const modalImage = {
      addEventListener: () => {},
      classList: { remove: () => {} },
      style: {}
    };

    global.document = {
      addEventListener: (event, handler) => {
        listeners[event] = handler;
      },
      getElementById: id => {
        if (id === 'cards-section') return { innerHTML: '', appendChild: () => {} };
        if (id === 'image-modal') return imageModal;
        if (id === 'modal-image') return modalImage;
        if (id === 'current-year') return { textContent: '' };
        return null;
      },
      querySelectorAll: () => [],
      createElement: () => ({
        classList: { add: () => {} },
        innerHTML: '',
        appendChild: () => {},
        querySelector: () => null
      })
    };
    global.window = { addEventListener: () => {} };
    global.fetch = () => Promise.resolve({ ok: true, json: () => Promise.resolve([]) });

    jest.resetModules();
    require('./script');
    listeners['DOMContentLoaded']();

    expect(imageModal.classList.contains('show')).toBe(true);
    listeners['keydown']({ key: 'Escape' });
    expect(imageModal.classList.contains('show')).toBe(false);
  });
});
