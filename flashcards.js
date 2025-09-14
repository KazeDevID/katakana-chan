// Flashcard system for Katakana learning

class FlashcardSystem {
    constructor() {
        this.currentIndex = 0;
        this.cards = [...KATAKANA_DATA];
        this.mode = 'katakana-to-romanji';
        this.isFlipped = false;
        this.studiedCards = new Set();
        this.knownCards = new Set();
        this.needStudyCards = new Set();
        
        this.init();
    }

    /**
     * Initialize flashcard system
     */
    init() {
        this.loadFlashcardData();
        this.setupEventListeners();
        this.shuffleCards();
        this.updateCard();
        this.updateCounter();
    }

    /**
     * Load flashcard data from localStorage
     */
    loadFlashcardData() {
        this.studiedCards = new Set(Storage.get('studiedCards', []));
        this.knownCards = new Set(Storage.get('knownCards', []));
        this.needStudyCards = new Set(Storage.get('needStudyCards', []));
    }

    /**
     * Save flashcard data to localStorage
     */
    saveFlashcardData() {
        Storage.set('studiedCards', Array.from(this.studiedCards));
        Storage.set('knownCards', Array.from(this.knownCards));
        Storage.set('needStudyCards', Array.from(this.needStudyCards));
    }

    /**
     * Setup event listeners for flashcard controls
     */
    setupEventListeners() {
        // Mode selector
        const modeSelector = DOM.select('#flashcard-mode');
        modeSelector?.addEventListener('change', (e) => {
            this.mode = e.target.value;
            this.updateCard();
        });

        // Shuffle button
        const shuffleBtn = DOM.select('#shuffle-cards');
        shuffleBtn?.addEventListener('click', () => {
            this.shuffleCards();
            this.currentIndex = 0;
            this.updateCard();
            this.updateCounter();
        });

        // Navigation buttons
        const prevBtn = DOM.select('#prev-card');
        const nextBtn = DOM.select('#next-card');
        
        prevBtn?.addEventListener('click', () => this.previousCard());
        nextBtn?.addEventListener('click', () => this.nextCard());

        // Flip button
        const flipBtn = DOM.select('#flip-card');
        flipBtn?.addEventListener('click', () => this.flipCard());

        // Knowledge tracking buttons
        const knowBtn = DOM.select('#know-card');
        const studyBtn = DOM.select('#study-card');
        
        knowBtn?.addEventListener('click', () => this.markAsKnown());
        studyBtn?.addEventListener('click', () => this.markForStudy());

        // Keyboard navigation
        document.addEventListener('keydown', (e) => {
            if (window.katakanaApp?.currentTab !== 'flashcards') return;

            switch (e.key) {
                case 'ArrowLeft':
                    e.preventDefault();
                    this.previousCard();
                    break;
                case 'ArrowRight':
                    e.preventDefault();
                    this.nextCard();
                    break;
                case ' ':
                case 'Enter':
                    e.preventDefault();
                    this.flipCard();
                    break;
                case 'k':
                    e.preventDefault();
                    this.markAsKnown();
                    break;
                case 's':
                    e.preventDefault();
                    this.markForStudy();
                    break;
            }
        });

        // Click on card to flip
        const flashcard = DOM.select('#flashcard');
        flashcard?.addEventListener('click', () => this.flipCard());
    }

    /**
     * Shuffle the cards array
     */
    shuffleCards() {
        this.cards = shuffleArray([...KATAKANA_DATA]);
        
        // Prioritize cards marked for study
        if (this.needStudyCards.size > 0) {
            const studyCards = this.cards.filter(card => 
                this.needStudyCards.has(card.katakana)
            );
            const otherCards = this.cards.filter(card => 
                !this.needStudyCards.has(card.katakana)
            );
            
            this.cards = [...shuffleArray(studyCards), ...shuffleArray(otherCards)];
        }
    }

    /**
     * Get the content for front and back of current card based on mode
     */
    getCardContent() {
        const currentCard = this.cards[this.currentIndex];
        if (!currentCard) return { front: '', back: '' };

        switch (this.mode) {
            case 'katakana-to-romanji':
                return {
                    front: currentCard.katakana,
                    back: currentCard.romanji
                };
            case 'romanji-to-katakana':
                return {
                    front: currentCard.romanji,
                    back: currentCard.katakana
                };
            case 'mixed':
                // Randomly decide which direction
                const showKatakana = Math.random() < 0.5;
                return showKatakana ? {
                    front: currentCard.katakana,
                    back: currentCard.romanji
                } : {
                    front: currentCard.romanji,
                    back: currentCard.katakana
                };
            default:
                return {
                    front: currentCard.katakana,
                    back: currentCard.romanji
                };
        }
    }

    /**
     * Update the current card display
     */
    updateCard() {
        const frontContent = DOM.select('#card-front');
        const backContent = DOM.select('#card-back');
        const flashcard = DOM.select('#flashcard');

        const { front, back } = this.getCardContent();
        
        if (frontContent && backContent) {
            frontContent.textContent = front;
            backContent.textContent = back;
        }

        // Reset flip state
        this.isFlipped = false;
        DOM.removeClass(flashcard, 'flipped');

        // Update card status indicators
        this.updateCardStatus();
    }

    /**
     * Update visual indicators for card status
     */
    updateCardStatus() {
        const flashcard = DOM.select('#flashcard');
        const currentCard = this.cards[this.currentIndex];
        
        if (!flashcard || !currentCard) return;

        // Remove existing status classes
        DOM.removeClass(flashcard, 'known', 'need-study', 'studied');

        // Add appropriate status class
        if (this.knownCards.has(currentCard.katakana)) {
            DOM.addClass(flashcard, 'known');
        } else if (this.needStudyCards.has(currentCard.katakana)) {
            DOM.addClass(flashcard, 'need-study');
        } else if (this.studiedCards.has(currentCard.katakana)) {
            DOM.addClass(flashcard, 'studied');
        }
    }

    /**
     * Flip the current card
     */
    flipCard() {
        const flashcard = DOM.select('#flashcard');
        if (!flashcard) return;

        this.isFlipped = !this.isFlipped;
        DOM.toggleClass(flashcard, 'flipped');

        // Mark as studied when flipped to back
        if (this.isFlipped) {
            const currentCard = this.cards[this.currentIndex];
            if (currentCard) {
                this.studiedCards.add(currentCard.katakana);
                this.saveFlashcardData();
            }
        }
    }

    /**
     * Go to previous card
     */
    previousCard() {
        if (this.currentIndex > 0) {
            this.currentIndex--;
        } else {
            this.currentIndex = this.cards.length - 1;
        }
        
        this.updateCard();
        this.updateCounter();
    }

    /**
     * Go to next card
     */
    nextCard() {
        if (this.currentIndex < this.cards.length - 1) {
            this.currentIndex++;
        } else {
            this.currentIndex = 0;
        }
        
        this.updateCard();
        this.updateCounter();
    }

    /**
     * Mark current card as known
     */
    markAsKnown() {
        const currentCard = this.cards[this.currentIndex];
        if (!currentCard) return;

        this.knownCards.add(currentCard.katakana);
        this.needStudyCards.delete(currentCard.katakana);
        this.studiedCards.add(currentCard.katakana);
        
        // Emit event for main app to track learned characters
        globalEvents.emit('characterLearned', currentCard.katakana);
        
        this.saveFlashcardData();
        this.updateCardStatus();
        
        // Auto-advance to next card after a short delay
        setTimeout(() => {
            this.nextCard();
        }, 500);

        // Log activity
        if (window.katakanaApp) {
            window.katakanaApp.logActivity(`Marked ${currentCard.katakana} as known`);
        }
    }

    /**
     * Mark current card for more study
     */
    markForStudy() {
        const currentCard = this.cards[this.currentIndex];
        if (!currentCard) return;

        this.needStudyCards.add(currentCard.katakana);
        this.knownCards.delete(currentCard.katakana);
        this.studiedCards.add(currentCard.katakana);
        
        this.saveFlashcardData();
        this.updateCardStatus();
        
        // Auto-advance to next card after a short delay
        setTimeout(() => {
            this.nextCard();
        }, 500);

        // Log activity
        if (window.katakanaApp) {
            window.katakanaApp.logActivity(`Marked ${currentCard.katakana} for more study`);
        }
    }

    /**
     * Update the card counter display
     */
    updateCounter() {
        const counter = DOM.select('#card-counter');
        if (counter) {
            counter.textContent = `${this.currentIndex + 1} / ${this.cards.length}`;
        }
    }

    /**
     * Get flashcard statistics
     */
    getStats() {
        return {
            total: this.cards.length,
            studied: this.studiedCards.size,
            known: this.knownCards.size,
            needStudy: this.needStudyCards.size,
            studyProgress: calculatePercentage(this.studiedCards.size, this.cards.length),
            knownProgress: calculatePercentage(this.knownCards.size, this.cards.length)
        };
    }

    /**
     * Reset all flashcard progress
     */
    resetProgress() {
        this.studiedCards.clear();
        this.knownCards.clear();
        this.needStudyCards.clear();
        
        Storage.remove('studiedCards');
        Storage.remove('knownCards');
        Storage.remove('needStudyCards');
        
        this.updateCardStatus();
    }

    /**
     * Filter cards based on criteria
     */
    filterCards(criteria) {
        let filteredCards = [...KATAKANA_DATA];

        switch (criteria) {
            case 'known':
                filteredCards = filteredCards.filter(card => 
                    this.knownCards.has(card.katakana)
                );
                break;
            case 'unknown':
                filteredCards = filteredCards.filter(card => 
                    !this.knownCards.has(card.katakana)
                );
                break;
            case 'need-study':
                filteredCards = filteredCards.filter(card => 
                    this.needStudyCards.has(card.katakana)
                );
                break;
            case 'not-studied':
                filteredCards = filteredCards.filter(card => 
                    !this.studiedCards.has(card.katakana)
                );
                break;
            default:
                // Return all cards
                break;
        }

        this.cards = shuffleArray(filteredCards);
        this.currentIndex = 0;
        this.updateCard();
        this.updateCounter();
    }
}

// Initialize flashcard system when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    // Wait for the main app to initialize first
    setTimeout(() => {
        window.flashcardSystem = new FlashcardSystem();
    }, 100);
});

// Add CSS for card status indicators
const flashcardStyles = `
    .flashcard.known .flashcard-inner {
        box-shadow: 0 0 0 3px var(--success-color);
    }

    .flashcard.need-study .flashcard-inner {
        box-shadow: 0 0 0 3px var(--warning-color);
    }

    .flashcard.studied .flashcard-inner {
        box-shadow: 0 0 0 3px var(--primary-color);
    }

    .flashcard-front {
        cursor: pointer;
    }

    .flashcard-back {
        cursor: pointer;
    }

    @media (max-width: 768px) {
        .flashcard-controls {
            flex-direction: column;
            gap: 1rem;
        }

        .flashcard-actions {
            flex-direction: column;
        }
    }
`;

// Inject flashcard-specific styles
const styleSheet = document.createElement('style');
styleSheet.textContent = flashcardStyles;
document.head.appendChild(styleSheet);