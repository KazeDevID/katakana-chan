// Main application logic for Katakana learning app

class KatakanaApp {
    constructor() {
        this.currentTab = 'home';
        this.searchQuery = '';
        this.selectedCategory = 'all';
        this.learnedCharacters = new Set();
        this.bookmarkedCharacters = new Set();
        this.practiceTime = 0;
        this.quizScores = [];
        this.studyStreak = 0;
        this.theme = 'light';
        
        this.init();
    }

    /**
     * Initialize the application
     */
    init() {
        this.loadUserData();
        this.setupEventListeners();
        this.setupTheme();
        this.renderKatakanaTable();
        this.updateStats();
        this.startPracticeTimer();
        
        console.log('Katakana learning app initialized');
    }

    /**
     * Load user data from localStorage
     */
    loadUserData() {
        this.learnedCharacters = new Set(Storage.get('learnedCharacters', []));
        this.bookmarkedCharacters = new Set(Storage.get('bookmarkedCharacters', []));
        this.practiceTime = Storage.get('practiceTime', 0);
        this.quizScores = Storage.get('quizScores', []);
        this.studyStreak = Storage.get('studyStreak', 0);
        this.theme = Storage.get('theme', 'light');
        
        // Update last study date for streak calculation
        const today = new Date().toDateString();
        const lastStudyDate = Storage.get('lastStudyDate', '');
        
        if (lastStudyDate === today) {
            // Already studied today, keep current streak
        } else {
            const yesterday = new Date();
            yesterday.setDate(yesterday.getDate() - 1);
            
            if (lastStudyDate === yesterday.toDateString()) {
                // Studied yesterday, increment streak
                this.studyStreak++;
            } else if (lastStudyDate !== '') {
                // Missed a day, reset streak
                this.studyStreak = 1;
            }
            
            Storage.set('lastStudyDate', today);
            Storage.set('studyStreak', this.studyStreak);
        }
    }

    /**
     * Save user data to localStorage
     */
    saveUserData() {
        Storage.set('learnedCharacters', Array.from(this.learnedCharacters));
        Storage.set('bookmarkedCharacters', Array.from(this.bookmarkedCharacters));
        Storage.set('practiceTime', this.practiceTime);
        Storage.set('quizScores', this.quizScores);
        Storage.set('studyStreak', this.studyStreak);
        Storage.set('theme', this.theme);
    }

    /**
     * Setup event listeners
     */
    setupEventListeners() {
        // Navigation
        DOM.selectAll('.nav-link').forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                const tab = link.dataset.tab;
                this.switchTab(tab);
            });
        });

        // Mobile menu toggle
        const hamburger = DOM.select('#hamburger');
        const navMenu = DOM.select('.nav-menu');
        hamburger?.addEventListener('click', () => {
            DOM.toggleClass(navMenu, 'active');
        });

        // Theme toggle
        const themeToggle = DOM.select('#theme-toggle');
        themeToggle?.addEventListener('click', () => {
            this.toggleTheme();
        });

        // Search and filter
        const searchInput = DOM.select('#search-input');
        const categoryFilter = DOM.select('#category-filter');
        
        searchInput?.addEventListener('input', debounce((e) => {
            this.searchQuery = e.target.value.toLowerCase();
            this.renderKatakanaTable();
        }, 300));

        categoryFilter?.addEventListener('change', (e) => {
            this.selectedCategory = e.target.value;
            this.renderKatakanaTable();
        });

        // Modal
        this.setupModal();

        // Progress reset
        const resetProgress = DOM.select('#reset-progress');
        resetProgress?.addEventListener('click', () => {
            if (confirm('Are you sure you want to reset all progress? This cannot be undone.')) {
                this.resetProgress();
            }
        });

        // Global events
        globalEvents.on('characterLearned', (character) => {
            this.learnedCharacters.add(character);
            this.saveUserData();
            this.updateStats();
        });

        globalEvents.on('characterBookmarked', (character, bookmarked) => {
            if (bookmarked) {
                this.bookmarkedCharacters.add(character);
            } else {
                this.bookmarkedCharacters.delete(character);
            }
            this.saveUserData();
            this.renderKatakanaTable();
            this.updateBookmarkedCharacters();
        });

        globalEvents.on('quizCompleted', (score, timeSpent) => {
            this.quizScores.push(score);
            this.practiceTime += timeSpent;
            this.saveUserData();
            this.updateStats();
            this.logActivity(`Completed quiz with ${score}% score`);
        });
    }

    /**
     * Setup modal functionality
     */
    setupModal() {
        const modal = DOM.select('#character-modal');
        const closeBtn = DOM.select('.close');
        
        closeBtn?.addEventListener('click', () => {
            DOM.removeClass(modal, 'show');
        });

        modal?.addEventListener('click', (e) => {
            if (e.target === modal) {
                DOM.removeClass(modal, 'show');
            }
        });

        // Escape key to close modal
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && DOM.hasClass(modal, 'show')) {
                DOM.removeClass(modal, 'show');
            }
        });
    }

    /**
     * Setup theme functionality
     */
    setupTheme() {
        const themeToggle = DOM.select('#theme-toggle');
        
        if (this.theme === 'dark') {
            document.body.dataset.theme = 'dark';
            themeToggle.textContent = '☀️';
        } else {
            document.body.dataset.theme = 'light';
            themeToggle.textContent = '🌙';
        }
    }

    /**
     * Toggle between light and dark theme
     */
    toggleTheme() {
        const themeToggle = DOM.select('#theme-toggle');
        
        if (this.theme === 'light') {
            this.theme = 'dark';
            document.body.dataset.theme = 'dark';
            themeToggle.textContent = '☀️';
        } else {
            this.theme = 'light';
            document.body.dataset.theme = 'light';
            themeToggle.textContent = '🌙';
        }
        
        this.saveUserData();
    }

    /**
     * Switch between tabs
     */
    switchTab(tabName) {
        // Update navigation
        DOM.selectAll('.nav-link').forEach(link => {
            DOM.removeClass(link, 'active');
            if (link.dataset.tab === tabName) {
                DOM.addClass(link, 'active');
            }
        });

        // Update tab content
        DOM.selectAll('.tab-content').forEach(content => {
            DOM.removeClass(content, 'active');
        });

        const targetTab = DOM.select(`#${tabName}`);
        if (targetTab) {
            DOM.addClass(targetTab, 'active');
            this.currentTab = tabName;
        }

        // Initialize tab-specific functionality
        this.initializeTabContent(tabName);
    }

    /**
     * Initialize content for specific tab
     */
    initializeTabContent(tabName) {
        switch (tabName) {
            case 'table':
                this.renderKatakanaTable();
                break;
            case 'progress':
                this.updateProgressTab();
                break;
            case 'writing':
                if (window.writingPractice) {
                    window.writingPractice.initialize();
                }
                break;
        }
    }

    /**
     * Render the katakana table
     */
    renderKatakanaTable() {
        const grid = DOM.select('#katakana-grid');
        if (!grid) return;

        // Clear existing content
        grid.innerHTML = '';

        // Filter characters based on search and category
        let filteredCharacters = KATAKANA_DATA;

        if (this.selectedCategory !== 'all') {
            filteredCharacters = filteredCharacters.filter(char => 
                char.category === this.selectedCategory
            );
        }

        if (this.searchQuery) {
            filteredCharacters = filteredCharacters.filter(char =>
                char.katakana.includes(this.searchQuery) ||
                char.romanji.toLowerCase().includes(this.searchQuery)
            );
        }

        // Render character cards
        filteredCharacters.forEach(character => {
            const card = this.createCharacterCard(character);
            grid.appendChild(card);
        });

        // Show no results message if filtered list is empty
        if (filteredCharacters.length === 0) {
            const noResults = DOM.create('div', 
                { className: 'no-results text-center' },
                DOM.create('p', {}, 'No characters found matching your criteria.')
            );
            grid.appendChild(noResults);
        }
    }

    /**
     * Create a character card element
     */
    createCharacterCard(character) {
        const isLearned = this.learnedCharacters.has(character.katakana);
        const isBookmarked = this.bookmarkedCharacters.has(character.katakana);

        const card = DOM.create('div', {
            className: `katakana-character ${isLearned ? 'learned' : ''} ${isBookmarked ? 'bookmarked' : ''}`,
            onclick: () => this.showCharacterModal(character)
        });

        const characterEl = DOM.create('div', 
            { className: 'character' }, 
            character.katakana
        );

        const romanjiEl = DOM.create('div', 
            { className: 'romanji' }, 
            character.romanji
        );

        card.appendChild(characterEl);
        card.appendChild(romanjiEl);

        if (isBookmarked) {
            const bookmark = DOM.create('div', 
                { className: 'bookmark-indicator' }, 
                '⭐'
            );
            card.appendChild(bookmark);
        }

        return card;
    }

    /**
     * Show character detail modal
     */
    showCharacterModal(character) {
        const modal = DOM.select('#character-modal');
        const modalCharacter = DOM.select('#modal-character');
        const modalRomanji = DOM.select('#modal-romanji');
        const bookmarkBtn = DOM.select('#bookmark-btn');
        const strokeBtn = DOM.select('#show-stroke');

        modalCharacter.textContent = character.katakana;
        modalRomanji.textContent = character.romanji;

        const isBookmarked = this.bookmarkedCharacters.has(character.katakana);
        bookmarkBtn.textContent = isBookmarked ? '⭐' : '☆';
        bookmarkBtn.style.color = isBookmarked ? '#f59e0b' : '#6b7280';

        // Bookmark toggle
        bookmarkBtn.onclick = () => {
            const nowBookmarked = !this.bookmarkedCharacters.has(character.katakana);
            globalEvents.emit('characterBookmarked', character.katakana, nowBookmarked);
            bookmarkBtn.textContent = nowBookmarked ? '⭐' : '☆';
            bookmarkBtn.style.color = nowBookmarked ? '#f59e0b' : '#6b7280';
        };

        // Stroke order display
        strokeBtn.onclick = () => {
            this.drawStrokeOrder(character);
            globalEvents.emit('characterLearned', character.katakana);
        };

        DOM.addClass(modal, 'show');
    }

    /**
     * Draw stroke order on canvas
     */
    drawStrokeOrder(character) {
        const canvas = DOM.select('#stroke-canvas');
        const ctx = canvas.getContext('2d');
        
        // Clear canvas
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        
        // Set stroke style
        ctx.strokeStyle = '#4f46e5';
        ctx.lineWidth = 3;
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';

        // Draw character strokes with animation
        let strokeIndex = 0;
        const drawNextStroke = () => {
            if (strokeIndex < character.strokes.length) {
                const stroke = character.strokes[strokeIndex];
                
                ctx.beginPath();
                ctx.moveTo(stroke[0], stroke[1]);
                ctx.lineTo(stroke[2], stroke[3]);
                ctx.stroke();
                
                strokeIndex++;
                setTimeout(drawNextStroke, 500);
            }
        };

        drawNextStroke();
    }

    /**
     * Update statistics display
     */
    updateStats() {
        // Home page stats
        const learnedCount = DOM.select('#learned-count');
        const quizScore = DOM.select('#quiz-score');
        const practiceTimeEl = DOM.select('#practice-time');

        if (learnedCount) {
            learnedCount.textContent = this.learnedCharacters.size;
        }

        if (quizScore) {
            const avgScore = this.quizScores.length > 0 
                ? Math.round(this.quizScores.reduce((a, b) => a + b, 0) / this.quizScores.length)
                : 0;
            quizScore.textContent = `${avgScore}%`;
        }

        if (practiceTimeEl) {
            practiceTimeEl.textContent = Math.floor(this.practiceTime / 60);
        }
    }

    /**
     * Update progress tab content
     */
    updateProgressTab() {
        this.updateOverallProgress();
        this.updateProgressStats();
        this.updateBookmarkedCharacters();
        this.updateActivityLog();
    }

    /**
     * Update overall progress circle
     */
    updateOverallProgress() {
        const progressBar = DOM.select('#overall-progress');
        const progressText = DOM.select('#overall-progress-text');

        if (!progressBar || !progressText) return;

        const totalCharacters = KATAKANA_DATA.length;
        const learnedCount = this.learnedCharacters.size;
        const percentage = calculatePercentage(learnedCount, totalCharacters);

        // Update circular progress
        const circumference = 2 * Math.PI * 45; // radius = 45
        const offset = circumference - (percentage / 100 * circumference);
        progressBar.style.strokeDashoffset = offset;

        progressText.textContent = `${percentage}%`;
    }

    /**
     * Update progress statistics
     */
    updateProgressStats() {
        const masteredCharacters = DOM.select('#mastered-characters');
        const quizAverage = DOM.select('#quiz-average');
        const studyStreak = DOM.select('#study-streak');

        if (masteredCharacters) {
            masteredCharacters.textContent = `${this.learnedCharacters.size} / ${KATAKANA_DATA.length}`;
        }

        if (quizAverage) {
            const avgScore = this.quizScores.length > 0 
                ? Math.round(this.quizScores.reduce((a, b) => a + b, 0) / this.quizScores.length)
                : 0;
            quizAverage.textContent = `${avgScore}%`;
        }

        if (studyStreak) {
            studyStreak.textContent = `${this.studyStreak} days`;
        }
    }

    /**
     * Update bookmarked characters display
     */
    updateBookmarkedCharacters() {
        const bookmarkedList = DOM.select('#bookmarked-list');
        if (!bookmarkedList) return;

        bookmarkedList.innerHTML = '';

        if (this.bookmarkedCharacters.size === 0) {
            const emptyMessage = DOM.create('p', 
                { className: 'text-center' }, 
                'No bookmarked characters yet. Click the star icon on any character to bookmark it.'
            );
            bookmarkedList.appendChild(emptyMessage);
            return;
        }

        Array.from(this.bookmarkedCharacters).forEach(katakana => {
            const character = KATAKANA_DATA.find(char => char.katakana === katakana);
            if (!character) return;

            const bookmarkItem = DOM.create('div', {
                className: 'bookmark-item',
                onclick: () => this.showCharacterModal(character)
            });

            const characterEl = DOM.create('div', 
                { className: 'character' }, 
                character.katakana
            );

            const romanjiEl = DOM.create('div', 
                { className: 'romanji' }, 
                character.romanji
            );

            bookmarkItem.appendChild(characterEl);
            bookmarkItem.appendChild(romanjiEl);
            bookmarkedList.appendChild(bookmarkItem);
        });
    }

    /**
     * Update activity log
     */
    updateActivityLog() {
        const activityLog = DOM.select('#activity-log');
        if (!activityLog) return;

        const activities = Storage.get('activities', []);
        activityLog.innerHTML = '';

        if (activities.length === 0) {
            const emptyMessage = DOM.create('div', 
                { className: 'activity-item' },
                DOM.create('span', { className: 'activity-text' }, 'Start learning to see your activity here!'),
                DOM.create('span', { className: 'activity-time' }, '')
            );
            activityLog.appendChild(emptyMessage);
            return;
        }

        activities.slice(-10).reverse().forEach(activity => {
            const activityItem = DOM.create('div', { className: 'activity-item' });
            
            const activityText = DOM.create('span', 
                { className: 'activity-text' }, 
                activity.text
            );

            const activityTime = DOM.create('span', 
                { className: 'activity-time' }, 
                activity.time
            );

            activityItem.appendChild(activityText);
            activityItem.appendChild(activityTime);
            activityLog.appendChild(activityItem);
        });
    }

    /**
     * Log user activity
     */
    logActivity(text) {
        const activities = Storage.get('activities', []);
        const now = new Date();
        const timeString = now.toLocaleTimeString([], { 
            hour: '2-digit', 
            minute: '2-digit' 
        });

        activities.push({
            text,
            time: timeString,
            timestamp: now.getTime()
        });

        // Keep only last 50 activities
        if (activities.length > 50) {
            activities.splice(0, activities.length - 50);
        }

        Storage.set('activities', activities);
    }

    /**
     * Start practice time tracking
     */
    startPracticeTimer() {
        setInterval(() => {
            this.practiceTime++;
            this.saveUserData();
        }, 60000); // Update every minute
    }

    /**
     * Reset all progress
     */
    resetProgress() {
        this.learnedCharacters.clear();
        this.bookmarkedCharacters.clear();
        this.practiceTime = 0;
        this.quizScores = [];
        this.studyStreak = 0;

        // Clear localStorage
        Storage.remove('learnedCharacters');
        Storage.remove('bookmarkedCharacters');
        Storage.remove('practiceTime');
        Storage.remove('quizScores');
        Storage.remove('studyStreak');
        Storage.remove('activities');
        Storage.remove('lastStudyDate');

        // Update UI
        this.updateStats();
        this.renderKatakanaTable();
        this.updateProgressTab();

        this.logActivity('Reset all progress');
        
        alert('Progress reset successfully!');
    }
}

// Global function to switch tabs (used by buttons)
function switchTab(tabName) {
    if (window.katakanaApp) {
        window.katakanaApp.switchTab(tabName);
    }
}

// Initialize the app when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.katakanaApp = new KatakanaApp();
});