// Quiz system for Katakana learning

class QuizSystem {
    constructor() {
        this.currentQuiz = null;
        this.currentQuestion = 0;
        this.questions = [];
        this.answers = [];
        this.score = 0;
        this.startTime = null;
        this.timeSpent = 0;
        this.quizType = '';
        
        this.init();
    }

    /**
     * Initialize quiz system
     */
    init() {
        this.setupEventListeners();
    }

    /**
     * Setup event listeners for quiz functionality
     */
    setupEventListeners() {
        // Quiz submit button
        const submitBtn = DOM.select('#quiz-submit');
        submitBtn?.addEventListener('click', () => this.submitAnswer());

        // Next question button
        const nextBtn = DOM.select('#quiz-next');
        nextBtn?.addEventListener('click', () => this.nextQuestion());

        // Quit quiz button
        const quitBtn = DOM.select('#quit-quiz');
        quitBtn?.addEventListener('click', () => this.quitQuiz());

        // Results buttons
        const retakeBtn = DOM.select('#retake-quiz');
        const backBtn = DOM.select('#back-to-quiz-menu');
        
        retakeBtn?.addEventListener('click', () => this.retakeQuiz());
        backBtn?.addEventListener('click', () => this.backToQuizMenu());

        // Keyboard navigation
        document.addEventListener('keydown', (e) => {
            if (window.katakanaApp?.currentTab !== 'quiz') return;
            if (!this.currentQuiz) return;

            if (e.key === 'Enter') {
                e.preventDefault();
                const submitBtn = DOM.select('#quiz-submit');
                const nextBtn = DOM.select('#quiz-next');
                
                if (submitBtn && !DOM.hasClass(submitBtn, 'hidden')) {
                    this.submitAnswer();
                } else if (nextBtn && !DOM.hasClass(nextBtn, 'hidden')) {
                    this.nextQuestion();
                }
            }
        });
    }

    /**
     * Start a specific quiz type
     */
    startQuiz(quizType) {
        this.quizType = quizType;
        this.currentQuestion = 0;
        this.answers = [];
        this.score = 0;
        this.startTime = Date.now();

        // Generate questions based on quiz type
        switch (quizType) {
            case 'name-conversion':
                this.generateNameConversionQuiz();
                break;
            case 'multiple-choice':
                this.generateMultipleChoiceQuiz();
                break;
            case 'matching':
                this.generateMatchingGame();
                break;
            case 'fill-blanks':
                this.generateFillBlanksQuiz();
                break;
            case 'progressive':
                this.generateProgressiveQuiz();
                break;
            default:
                console.error('Unknown quiz type:', quizType);
                return;
        }

        this.currentQuiz = quizType;
        this.showQuizInterface();
        this.displayQuestion();
    }

    /**
     * Generate name conversion quiz questions
     */
    generateNameConversionQuiz() {
        const shuffledNames = shuffleArray([...NAME_CONVERSIONS]);
        this.questions = shuffledNames.slice(0, 10).map(name => ({
            type: 'name-conversion',
            question: `Convert "${name.english}" to Katakana:`,
            answer: name.katakana,
            options: this.generateKatakanaOptions(name.katakana),
            explanation: `${name.english} → ${name.katakana} (${name.romanji})`
        }));
    }

    /**
     * Generate multiple choice quiz questions
     */
    generateMultipleChoiceQuiz() {
        const shuffledChars = shuffleArray([...KATAKANA_DATA]);
        this.questions = shuffledChars.slice(0, 15).map(char => {
            const showKatakana = Math.random() < 0.5;
            
            if (showKatakana) {
                return {
                    type: 'multiple-choice',
                    question: `What is the romanji for "${char.katakana}"?`,
                    answer: char.romanji,
                    options: this.generateRomanjiOptions(char.romanji),
                    explanation: `${char.katakana} → ${char.romanji}`
                };
            } else {
                return {
                    type: 'multiple-choice',
                    question: `What is the katakana for "${char.romanji}"?`,
                    answer: char.katakana,
                    options: this.generateKatakanaCharOptions(char.katakana),
                    explanation: `${char.romanji} → ${char.katakana}`
                };
            }
        });
    }

    /**
     * Generate matching game questions
     */
    generateMatchingGame() {
        const selectedChars = getRandomElements(KATAKANA_DATA, 8);
        
        this.questions = [{
            type: 'matching',
            question: 'Match the katakana characters with their romanji:',
            characters: selectedChars,
            matches: new Map(),
            completed: false
        }];
    }

    /**
     * Generate fill in the blanks quiz
     */
    generateFillBlanksQuiz() {
        const shuffledWords = shuffleArray([...KATAKANA_WORDS]);
        
        this.questions = shuffledWords.slice(0, 8).map(wordData => {
            const wordChars = [...wordData.word];
            const blankedWord = wordChars.map((char, index) => 
                wordData.blanks.includes(index) ? '_' : char
            ).join('');

            const missingChars = wordData.blanks.map(index => wordChars[index]);
            
            return {
                type: 'fill-blanks',
                question: `Complete the word: ${blankedWord}`,
                hint: `Meaning: ${wordData.meaning}`,
                answer: missingChars,
                blanks: wordData.blanks,
                word: wordData.word,
                options: this.generateFillBlankOptions(missingChars)
            };
        });
    }

    /**
     * Generate progressive difficulty quiz
     */
    generateProgressiveQuiz() {
        // Start with user's current level based on learned characters
        const learnedCount = window.katakanaApp?.learnedCharacters.size || 0;
        let currentLevel = 1;
        
        if (learnedCount >= 40) currentLevel = 5;
        else if (learnedCount >= 30) currentLevel = 4;
        else if (learnedCount >= 20) currentLevel = 3;
        else if (learnedCount >= 10) currentLevel = 2;

        const levelData = DIFFICULTY_LEVELS[currentLevel - 1];
        const availableChars = KATAKANA_DATA.filter(char => 
            levelData.categories.includes(char.category)
        );

        const shuffledChars = shuffleArray(availableChars);
        this.questions = shuffledChars.slice(0, levelData.questionCount).map(char => ({
            type: 'progressive',
            level: currentLevel,
            question: `What is the romanji for "${char.katakana}"?`,
            answer: char.romanji,
            options: this.generateRomanjiOptions(char.romanji),
            explanation: `${char.katakana} → ${char.romanji}`,
            character: char
        }));
    }

    /**
     * Generate katakana options for multiple choice
     */
    generateKatakanaOptions(correctAnswer) {
        const options = [correctAnswer];
        const otherOptions = NAME_CONVERSIONS
            .filter(name => name.katakana !== correctAnswer)
            .map(name => name.katakana);
        
        const shuffledOthers = shuffleArray(otherOptions);
        options.push(...shuffledOthers.slice(0, 3));
        
        return shuffleArray(options);
    }

    /**
     * Generate romanji options for multiple choice
     */
    generateRomanjiOptions(correctAnswer) {
        const options = [correctAnswer];
        const otherOptions = KATAKANA_DATA
            .filter(char => char.romanji !== correctAnswer)
            .map(char => char.romanji);
        
        const shuffledOthers = shuffleArray(otherOptions);
        options.push(...shuffledOthers.slice(0, 3));
        
        return shuffleArray(options);
    }

    /**
     * Generate katakana character options
     */
    generateKatakanaCharOptions(correctAnswer) {
        const options = [correctAnswer];
        const otherOptions = KATAKANA_DATA
            .filter(char => char.katakana !== correctAnswer)
            .map(char => char.katakana);
        
        const shuffledOthers = shuffleArray(otherOptions);
        options.push(...shuffledOthers.slice(0, 3));
        
        return shuffleArray(options);
    }

    /**
     * Generate options for fill in the blanks
     */
    generateFillBlankOptions(correctAnswers) {
        const allChars = KATAKANA_DATA.map(char => char.katakana);
        const incorrectOptions = shuffleArray(
            allChars.filter(char => !correctAnswers.includes(char))
        ).slice(0, 6);
        
        return shuffleArray([...correctAnswers, ...incorrectOptions]);
    }

    /**
     * Show quiz interface
     */
    showQuizInterface() {
        const quizModes = DOM.select('.quiz-modes');
        const quizInterface = DOM.select('#quiz-interface');
        const quizResults = DOM.select('#quiz-results');

        DOM.addClass(quizModes, 'hidden');
        DOM.removeClass(quizInterface, 'hidden');
        DOM.addClass(quizResults, 'hidden');

        // Set quiz title
        const titles = {
            'name-conversion': 'Name Conversion Quiz',
            'multiple-choice': 'Multiple Choice Quiz',
            'matching': 'Matching Game',
            'fill-blanks': 'Fill in the Blanks',
            'progressive': 'Progressive Quiz'
        };

        const titleElement = DOM.select('#quiz-title');
        if (titleElement) {
            titleElement.textContent = titles[this.quizType] || 'Quiz';
        }
    }

    /**
     * Display current question
     */
    displayQuestion() {
        const question = this.questions[this.currentQuestion];
        const content = DOM.select('#quiz-content');
        const submitBtn = DOM.select('#quiz-submit');
        const nextBtn = DOM.select('#quiz-next');
        const feedback = DOM.select('#quiz-feedback');

        if (!question || !content) return;

        // Clear previous content
        content.innerHTML = '';
        DOM.removeClass(submitBtn, 'hidden');
        DOM.addClass(nextBtn, 'hidden');
        DOM.addClass(feedback, 'hidden');

        // Update progress
        this.updateProgress();

        // Render question based on type
        switch (question.type) {
            case 'name-conversion':
            case 'multiple-choice':
            case 'progressive':
                this.renderMultipleChoiceQuestion(question);
                break;
            case 'matching':
                this.renderMatchingQuestion(question);
                break;
            case 'fill-blanks':
                this.renderFillBlanksQuestion(question);
                break;
        }
    }

    /**
     * Render multiple choice question
     */
    renderMultipleChoiceQuestion(question) {
        const content = DOM.select('#quiz-content');
        
        const questionEl = DOM.create('div', 
            { className: 'quiz-question' }, 
            question.question
        );

        const optionsEl = DOM.create('div', { className: 'quiz-options' });

        question.options.forEach((option, index) => {
            const optionEl = DOM.create('div', {
                className: 'quiz-option',
                onclick: () => this.selectOption(index),
                dataset: { index: index }
            }, option);

            optionsEl.appendChild(optionEl);
        });

        content.appendChild(questionEl);
        content.appendChild(optionsEl);
    }

    /**
     * Render matching question
     */
    renderMatchingQuestion(question) {
        const content = DOM.select('#quiz-content');
        
        const questionEl = DOM.create('div', 
            { className: 'quiz-question' }, 
            question.question
        );

        const gameContainer = DOM.create('div', { className: 'matching-game' });
        
        const katakanaColumn = DOM.create('div', { className: 'matching-column' });
        const romanjiColumn = DOM.create('div', { className: 'matching-column' });

        const shuffledRomanji = shuffleArray(question.characters.map(char => char.romanji));

        question.characters.forEach((char, index) => {
            const katakanaEl = DOM.create('div', {
                className: 'matching-item',
                dataset: { katakana: char.katakana, index: index },
                onclick: () => this.selectMatchingItem('katakana', char.katakana)
            }, char.katakana);

            katakanaColumn.appendChild(katakanaEl);
        });

        shuffledRomanji.forEach((romanji, index) => {
            const romanjiEl = DOM.create('div', {
                className: 'matching-item',
                dataset: { romanji: romanji, index: index },
                onclick: () => this.selectMatchingItem('romanji', romanji)
            }, romanji);

            romanjiColumn.appendChild(romanjiEl);
        });

        gameContainer.appendChild(katakanaColumn);
        gameContainer.appendChild(romanjiColumn);

        content.appendChild(questionEl);
        content.appendChild(gameContainer);

        // Add matching game styles
        this.addMatchingStyles();
    }

    /**
     * Render fill in the blanks question
     */
    renderFillBlanksQuestion(question) {
        const content = DOM.select('#quiz-content');
        
        const questionEl = DOM.create('div', 
            { className: 'quiz-question' }, 
            question.question
        );

        if (question.hint) {
            const hintEl = DOM.create('div', 
                { className: 'quiz-hint' }, 
                question.hint
            );
            questionEl.appendChild(hintEl);
        }

        const blanksContainer = DOM.create('div', { className: 'fill-blanks-container' });
        
        // Create dropzones for missing characters
        question.blanks.forEach((blankIndex, index) => {
            const dropzone = DOM.create('div', {
                className: 'blank-dropzone',
                dataset: { index: index },
                ondrop: (e) => this.dropCharacter(e, index),
                ondragover: (e) => e.preventDefault()
            }, '___');

            blanksContainer.appendChild(dropzone);
        });

        const optionsContainer = DOM.create('div', { className: 'fill-blank-options' });
        
        question.options.forEach((option, index) => {
            const optionEl = DOM.create('div', {
                className: 'fill-blank-option',
                draggable: true,
                dataset: { character: option },
                ondragstart: (e) => this.dragCharacter(e, option),
                onclick: () => this.selectFillBlankOption(option)
            }, option);

            optionsContainer.appendChild(optionEl);
        });

        content.appendChild(questionEl);
        content.appendChild(blanksContainer);
        content.appendChild(optionsContainer);

        this.selectedBlanks = new Array(question.blanks.length).fill(null);
    }

    /**
     * Select an option in multiple choice
     */
    selectOption(index) {
        const options = DOM.selectAll('.quiz-option');
        options.forEach(option => DOM.removeClass(option, 'selected'));
        
        const selectedOption = options[index];
        if (selectedOption) {
            DOM.addClass(selectedOption, 'selected');
        }
    }

    /**
     * Select matching item
     */
    selectMatchingItem(type, value) {
        const item = DOM.select(`[data-${type}="${value}"]`);
        if (!item) return;

        if (DOM.hasClass(item, 'selected')) {
            DOM.removeClass(item, 'selected');
            this.selectedMatchingItem = null;
        } else {
            // Clear other selections
            DOM.selectAll('.matching-item.selected').forEach(el => 
                DOM.removeClass(el, 'selected')
            );
            
            DOM.addClass(item, 'selected');
            this.selectedMatchingItem = { type, value, element: item };
        }

        // Check for match
        this.checkMatch();
    }

    /**
     * Check for matching pair
     */
    checkMatch() {
        if (!this.selectedMatchingItem) return;

        const selectedItems = DOM.selectAll('.matching-item.selected');
        if (selectedItems.length === 2) {
            const katakanaItem = DOM.select('.matching-item.selected[data-katakana]');
            const romanjiItem = DOM.select('.matching-item.selected[data-romanji]');

            if (katakanaItem && romanjiItem) {
                const katakana = katakanaItem.dataset.katakana;
                const romanji = romanjiItem.dataset.romanji;

                // Find the character data to check if match is correct
                const character = this.questions[this.currentQuestion].characters
                    .find(char => char.katakana === katakana);

                if (character && character.romanji === romanji) {
                    // Correct match
                    DOM.addClass(katakanaItem, 'matched');
                    DOM.addClass(romanjiItem, 'matched');
                    DOM.removeClass(katakanaItem, 'selected');
                    DOM.removeClass(romanjiItem, 'selected');
                    
                    this.questions[this.currentQuestion].matches.set(katakana, romanji);
                    
                    // Check if all matches are complete
                    if (this.questions[this.currentQuestion].matches.size === 
                        this.questions[this.currentQuestion].characters.length) {
                        this.questions[this.currentQuestion].completed = true;
                    }
                } else {
                    // Incorrect match
                    DOM.addClass(katakanaItem, 'incorrect');
                    DOM.addClass(romanjiItem, 'incorrect');
                    
                    setTimeout(() => {
                        DOM.removeClass(katakanaItem, 'selected', 'incorrect');
                        DOM.removeClass(romanjiItem, 'selected', 'incorrect');
                    }, 1000);
                }
            }

            this.selectedMatchingItem = null;
        }
    }

    /**
     * Handle drag and drop for fill blanks
     */
    dragCharacter(e, character) {
        e.dataTransfer.setData('text/plain', character);
    }

    dropCharacter(e, index) {
        e.preventDefault();
        const character = e.dataTransfer.getData('text/plain');
        this.placeFillBlankCharacter(character, index);
    }

    /**
     * Select fill blank option (for touch/click)
     */
    selectFillBlankOption(character) {
        if (this.selectedBlankIndex !== null) {
            this.placeFillBlankCharacter(character, this.selectedBlankIndex);
            this.selectedBlankIndex = null;
            
            // Remove selection from dropzones
            DOM.selectAll('.blank-dropzone.selected').forEach(el => 
                DOM.removeClass(el, 'selected')
            );
        } else {
            // Select first empty dropzone
            const emptyDropzone = DOM.select('.blank-dropzone:not(.filled)');
            if (emptyDropzone) {
                const index = parseInt(emptyDropzone.dataset.index);
                this.placeFillBlankCharacter(character, index);
            }
        }
    }

    /**
     * Place character in fill blank
     */
    placeFillBlankCharacter(character, index) {
        const dropzone = DOM.select(`[data-index="${index}"]`);
        if (!dropzone) return;

        dropzone.textContent = character;
        DOM.addClass(dropzone, 'filled');
        this.selectedBlanks[index] = character;

        // Hide the used option
        const option = DOM.select(`[data-character="${character}"]`);
        if (option) {
            DOM.addClass(option, 'used');
        }
    }

    /**
     * Submit current answer
     */
    submitAnswer() {
        const question = this.questions[this.currentQuestion];
        let userAnswer = null;
        let isCorrect = false;

        switch (question.type) {
            case 'name-conversion':
            case 'multiple-choice':
            case 'progressive':
                const selectedOption = DOM.select('.quiz-option.selected');
                if (!selectedOption) {
                    alert('Please select an answer.');
                    return;
                }
                userAnswer = selectedOption.textContent;
                isCorrect = userAnswer === question.answer;
                break;

            case 'matching':
                userAnswer = question.matches;
                isCorrect = question.completed;
                break;

            case 'fill-blanks':
                userAnswer = this.selectedBlanks;
                isCorrect = JSON.stringify(userAnswer) === JSON.stringify(question.answer);
                break;
        }

        // Record answer
        this.answers.push({
            question: question,
            userAnswer: userAnswer,
            correct: isCorrect
        });

        if (isCorrect) {
            this.score++;
        }

        // Show feedback
        this.showAnswerFeedback(isCorrect, question);
    }

    /**
     * Show feedback for submitted answer
     */
    showAnswerFeedback(isCorrect, question) {
        const feedback = DOM.select('#quiz-feedback');
        const submitBtn = DOM.select('#quiz-submit');
        const nextBtn = DOM.select('#quiz-next');

        DOM.addClass(submitBtn, 'hidden');
        DOM.removeClass(nextBtn, 'hidden');
        DOM.removeClass(feedback, 'hidden');

        if (isCorrect) {
            DOM.removeClass(feedback, 'incorrect');
            DOM.addClass(feedback, 'correct');
            feedback.innerHTML = '<strong>Correct!</strong> ' + (question.explanation || '');
        } else {
            DOM.removeClass(feedback, 'correct');
            DOM.addClass(feedback, 'incorrect');
            feedback.innerHTML = '<strong>Incorrect.</strong> ' + (question.explanation || '');
        }

        // Highlight correct/incorrect options
        this.highlightAnswers(isCorrect, question);
    }

    /**
     * Highlight correct and incorrect answers
     */
    highlightAnswers(isCorrect, question) {
        switch (question.type) {
            case 'name-conversion':
            case 'multiple-choice':
            case 'progressive':
                const options = DOM.selectAll('.quiz-option');
                options.forEach(option => {
                    if (option.textContent === question.answer) {
                        DOM.addClass(option, 'correct');
                    } else if (DOM.hasClass(option, 'selected') && !isCorrect) {
                        DOM.addClass(option, 'incorrect');
                    }
                });
                break;
        }
    }

    /**
     * Move to next question or show results
     */
    nextQuestion() {
        this.currentQuestion++;
        
        if (this.currentQuestion >= this.questions.length) {
            this.showResults();
        } else {
            this.displayQuestion();
        }
    }

    /**
     * Update progress display
     */
    updateProgress() {
        const questionCount = DOM.select('#quiz-question-count');
        const progressFill = DOM.select('#quiz-progress-fill');

        if (questionCount) {
            questionCount.textContent = `${this.currentQuestion + 1} / ${this.questions.length}`;
        }

        if (progressFill) {
            const percentage = ((this.currentQuestion + 1) / this.questions.length) * 100;
            progressFill.style.width = `${percentage}%`;
        }
    }

    /**
     * Show quiz results
     */
    showResults() {
        const quizInterface = DOM.select('#quiz-interface');
        const quizResults = DOM.select('#quiz-results');
        
        DOM.addClass(quizInterface, 'hidden');
        DOM.removeClass(quizResults, 'hidden');

        // Calculate results
        this.timeSpent = Math.floor((Date.now() - this.startTime) / 1000);
        const percentage = calculatePercentage(this.score, this.questions.length);

        // Update result displays
        const finalScore = DOM.select('#final-score');
        const correctCount = DOM.select('#correct-count');
        const quizTime = DOM.select('#quiz-time');

        if (finalScore) finalScore.textContent = `${percentage}%`;
        if (correctCount) correctCount.textContent = `${this.score} / ${this.questions.length}`;
        if (quizTime) quizTime.textContent = formatTime(this.timeSpent);

        // Emit quiz completion event
        globalEvents.emit('quizCompleted', percentage, this.timeSpent);

        // Log activity
        if (window.katakanaApp) {
            window.katakanaApp.logActivity(`Completed ${this.quizType} quiz: ${percentage}%`);
        }

        this.currentQuiz = null;
    }

    /**
     * Quit current quiz
     */
    quitQuiz() {
        if (confirm('Are you sure you want to quit this quiz? Your progress will be lost.')) {
            this.backToQuizMenu();
        }
    }

    /**
     * Retake the same quiz
     */
    retakeQuiz() {
        this.startQuiz(this.quizType);
    }

    /**
     * Return to quiz selection menu
     */
    backToQuizMenu() {
        const quizModes = DOM.select('.quiz-modes');
        const quizInterface = DOM.select('#quiz-interface');
        const quizResults = DOM.select('#quiz-results');

        DOM.removeClass(quizModes, 'hidden');
        DOM.addClass(quizInterface, 'hidden');
        DOM.addClass(quizResults, 'hidden');

        this.currentQuiz = null;
    }

    /**
     * Add CSS styles for matching game
     */
    addMatchingStyles() {
        const styles = `
            .matching-game {
                display: grid;
                grid-template-columns: 1fr 1fr;
                gap: 2rem;
                margin-top: 2rem;
            }

            .matching-column {
                display: flex;
                flex-direction: column;
                gap: 1rem;
            }

            .matching-item {
                padding: 1rem;
                background-color: var(--surface-color);
                border: 2px solid var(--border-color);
                border-radius: var(--border-radius);
                text-align: center;
                cursor: pointer;
                transition: var(--transition);
                font-size: 1.2rem;
                font-weight: 600;
            }

            .matching-item:hover {
                border-color: var(--primary-color);
                transform: translateY(-2px);
            }

            .matching-item.selected {
                border-color: var(--primary-color);
                background-color: rgba(79, 70, 229, 0.1);
            }

            .matching-item.matched {
                border-color: var(--success-color);
                background-color: rgba(16, 185, 129, 0.2);
                cursor: default;
            }

            .matching-item.incorrect {
                border-color: var(--danger-color);
                background-color: rgba(239, 68, 68, 0.2);
            }

            .fill-blanks-container {
                display: flex;
                gap: 1rem;
                justify-content: center;
                margin: 2rem 0;
                flex-wrap: wrap;
            }

            .blank-dropzone {
                min-width: 60px;
                height: 60px;
                border: 2px dashed var(--border-color);
                border-radius: var(--border-radius);
                display: flex;
                align-items: center;
                justify-content: center;
                font-size: 1.5rem;
                font-weight: 700;
                cursor: pointer;
                transition: var(--transition);
            }

            .blank-dropzone:hover,
            .blank-dropzone.selected {
                border-color: var(--primary-color);
                background-color: rgba(79, 70, 229, 0.1);
            }

            .blank-dropzone.filled {
                border-style: solid;
                border-color: var(--success-color);
                background-color: rgba(16, 185, 129, 0.1);
            }

            .fill-blank-options {
                display: grid;
                grid-template-columns: repeat(auto-fit, minmax(80px, 1fr));
                gap: 1rem;
                margin-top: 2rem;
            }

            .fill-blank-option {
                padding: 0.75rem;
                background-color: var(--surface-color);
                border: 2px solid var(--border-color);
                border-radius: var(--border-radius);
                text-align: center;
                cursor: pointer;
                font-size: 1.2rem;
                font-weight: 600;
                transition: var(--transition);
            }

            .fill-blank-option:hover {
                border-color: var(--primary-color);
                transform: translateY(-2px);
            }

            .fill-blank-option.used {
                opacity: 0.5;
                cursor: default;
                pointer-events: none;
            }

            .quiz-hint {
                font-style: italic;
                color: var(--text-secondary);
                margin-top: 0.5rem;
                font-size: 0.9rem;
            }

            @media (max-width: 768px) {
                .matching-game {
                    grid-template-columns: 1fr;
                }

                .fill-blanks-container {
                    flex-direction: column;
                    align-items: center;
                }

                .fill-blank-options {
                    grid-template-columns: repeat(auto-fit, minmax(60px, 1fr));
                }
            }
        `;

        if (!document.querySelector('#matching-styles')) {
            const styleElement = DOM.create('style', { id: 'matching-styles' });
            styleElement.textContent = styles;
            document.head.appendChild(styleElement);
        }
    }
}

// Global function to start quiz (used by quiz cards)
function startQuiz(quizType) {
    if (window.quizSystem) {
        window.quizSystem.startQuiz(quizType);
    }
}

// Initialize quiz system when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.quizSystem = new QuizSystem();
});