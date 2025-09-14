// Katakana data with comprehensive character set
const katakanaData = {
    // Vowels
    'ア': 'a', 'イ': 'i', 'ウ': 'u', 'エ': 'e', 'オ': 'o',
    // K series
    'カ': 'ka', 'キ': 'ki', 'ク': 'ku', 'ケ': 'ke', 'コ': 'ko',
    // S series
    'サ': 'sa', 'シ': 'shi', 'ス': 'su', 'セ': 'se', 'ソ': 'so',
    // T series
    'タ': 'ta', 'チ': 'chi', 'ツ': 'tsu', 'テ': 'te', 'ト': 'to',
    // N series
    'ナ': 'na', 'ニ': 'ni', 'ヌ': 'nu', 'ネ': 'ne', 'ノ': 'no',
    // H series
    'ハ': 'ha', 'ヒ': 'hi', 'フ': 'fu', 'ヘ': 'he', 'ホ': 'ho',
    // M series
    'マ': 'ma', 'ミ': 'mi', 'ム': 'mu', 'メ': 'me', 'モ': 'mo',
    // Y series
    'ヤ': 'ya', 'ユ': 'yu', 'ヨ': 'yo',
    // R series
    'ラ': 'ra', 'リ': 'ri', 'ル': 'ru', 'レ': 're', 'ロ': 'ro',
    // W series and N
    'ワ': 'wa', 'ヲ': 'wo', 'ン': 'n'
};

// Names data with katakana conversions
const namesData = {
    'Michael': { romanji: 'Maikeru', katakana: 'マイケル' },
    'Izzul': { romanji: 'Izzuru', katakana: 'イッズル' },
    'Hizkia': { romanji: 'Hizukia', katakana: 'ヒズキア' },
    'Fadel': { romanji: 'Faderu', katakana: 'ファデル' }
};

// Table structure for systematic learning
const tableStructure = {
    '': ['a', 'i', 'u', 'e', 'o'],
    'k': ['ka', 'ki', 'ku', 'ke', 'ko'],
    's': ['sa', 'shi', 'su', 'se', 'so'],
    't': ['ta', 'chi', 'tsu', 'te', 'to'],
    'n': ['na', 'ni', 'nu', 'ne', 'no'],
    'h': ['ha', 'hi', 'fu', 'he', 'ho'],
    'm': ['ma', 'mi', 'mu', 'me', 'mo'],
    'y': ['ya', '', 'yu', '', 'yo'],
    'r': ['ra', 'ri', 'ru', 're', 'ro'],
    'w': ['wa', '', '', '', 'wo'],
    'special': ['n']
};

// Achievement system
const achievements = [
    { id: 'first_card', title: 'First Steps', desc: 'Flip your first card', icon: '🌟', earned: false },
    { id: 'card_master', title: 'Card Master', desc: 'Study all 46 characters', icon: '🏆', earned: false },
    { id: 'quiz_rookie', title: 'Quiz Rookie', desc: 'Complete your first quiz', icon: '🎯', earned: false },
    { id: 'name_expert', title: 'Name Expert', desc: 'Perfect score on names quiz', icon: '👨‍🎓', earned: false },
    { id: 'speed_demon', title: 'Speed Demon', desc: 'Answer 10 questions in 30 seconds', icon: '⚡', earned: false },
    { id: 'perfectionist', title: 'Perfectionist', desc: 'Get 100% accuracy in mixed quiz', icon: '💎', earned: false }
];

// Global state management
let currentSection = 'home';
let studiedCards = new Set();
let totalQuizzes = 0;
let correctAnswers = 0;
let totalScore = 0;
let currentQuiz = null;
let quizStartTime = 0;

// Initialize the application
document.addEventListener('DOMContentLoaded', function() {
    initializeApp();
    loadProgress();
    updateProgressDisplay();
});

function initializeApp() {
    generateKatakanaCards();
    generateKatakanaTable();
    initializeAchievements();
    showSection('home');
}

// Navigation system
function showSection(sectionName) {
    // Update navigation
    document.querySelectorAll('.nav-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    event?.target?.classList.add('active');
    
    // Update sections
    document.querySelectorAll('.section').forEach(section => {
        section.classList.remove('active');
    });
    document.getElementById(sectionName).classList.add('active');
    
    currentSection = sectionName;
    
    // Section-specific updates
    if (sectionName === 'progress') {
        updateProgressDisplay();
    }
}

// Card system implementation
function generateKatakanaCards() {
    const container = document.getElementById('katakanaCards');
    container.innerHTML = '';
    
    Object.entries(katakanaData).forEach(([katakana, romanji]) => {
        const card = createKatakanaCard(katakana, romanji);
        container.appendChild(card);
    });
}

function createKatakanaCard(katakana, romanji) {
    const card = document.createElement('div');
    card.className = 'katakana-card';
    card.setAttribute('data-series', getSeriesFromRomanji(romanji));
    
    card.innerHTML = `
        <div class="card-front">
            <div class="katakana-char">${katakana}</div>
            <div class="romanji-char">${romanji}</div>
        </div>
        <div class="card-back">
            <div class="katakana-char">${katakana}</div>
            <div class="romanji-char">${romanji}</div>
        </div>
    `;
    
    card.addEventListener('click', () => {
        card.classList.toggle('flipped');
        studiedCards.add(katakana);
        checkAchievement('first_card');
        if (studiedCards.size === Object.keys(katakanaData).length) {
            checkAchievement('card_master');
        }
        updateProgressDisplay();
        saveProgress();
    });
    
    return card;
}

function getSeriesFromRomanji(romanji) {
    if (['a', 'i', 'u', 'e', 'o'].includes(romanji)) return 'vowels';
    if (romanji.startsWith('k')) return 'ka';
    if (romanji.startsWith('s')) return 'sa';
    if (romanji.startsWith('t')) return 'ta';
    if (romanji.startsWith('n') && romanji !== 'n') return 'na';
    if (romanji.startsWith('h')) return 'ha';
    if (romanji.startsWith('m')) return 'ma';
    if (romanji.startsWith('y')) return 'ya';
    if (romanji.startsWith('r')) return 'ra';
    if (romanji.startsWith('w')) return 'wa';
    return 'other';
}

function shuffleCards() {
    const container = document.getElementById('katakanaCards');
    const cards = Array.from(container.children);
    
    // Shuffle array
    for (let i = cards.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [cards[i], cards[j]] = [cards[j], cards[i]];
    }
    
    // Re-append shuffled cards
    cards.forEach(card => container.appendChild(card));
}

function resetCards() {
    document.querySelectorAll('.katakana-card').forEach(card => {
        card.classList.remove('flipped');
    });
}

function filterCards() {
    const filter = document.getElementById('cardFilter').value;
    const cards = document.querySelectorAll('.katakana-card');
    
    cards.forEach(card => {
        const series = card.getAttribute('data-series');
        if (filter === 'all' || series === filter) {
            card.style.display = 'block';
        } else {
            card.style.display = 'none';
        }
    });
}

// Table generation for systematic reference
function generateKatakanaTable() {
    const tableBody = document.getElementById('katakanaTable');
    
    Object.entries(tableStructure).forEach(([rowLabel, sounds]) => {
        if (rowLabel === 'special') {
            // Handle special case for 'n'
            const row = document.createElement('tr');
            row.innerHTML = `<th>n</th><td colspan="5">
                <span class="table-cell-katakana">ン</span>
                <span class="table-cell-romanji">n</span>
            </td>`;
            tableBody.appendChild(row);
            return;
        }
        
        const row = document.createElement('tr');
        let rowHTML = `<th>${rowLabel}</th>`;
        
        sounds.forEach(sound => {
            if (sound === '') {
                rowHTML += '<td></td>';
            } else {
                const katakana = findKatakanaByRomanji(sound);
                rowHTML += `<td>
                    <span class="table-cell-katakana">${katakana}</span>
                    <span class="table-cell-romanji">${sound}</span>
                </td>`;
            }
        });
        
        row.innerHTML = rowHTML;
        tableBody.appendChild(row);
    });
}

function findKatakanaByRomanji(romanji) {
    return Object.keys(katakanaData).find(key => katakanaData[key] === romanji) || '';
}

// Quiz system implementation
function startQuiz(mode) {
    currentQuiz = {
        mode: mode,
        questions: generateQuizQuestions(mode, 10),
        currentQuestion: 0,
        score: 0,
        answered: false
    };
    
    quizStartTime = Date.now();
    document.getElementById('quizContainer').classList.remove('hidden');
    document.querySelector('.quiz-modes').classList.add('hidden');
    
    showQuestion();
}

function generateQuizQuestions(mode, count) {
    const questions = [];
    
    for (let i = 0; i < count; i++) {
        let question;
        
        switch (mode) {
            case 'names':
                question = generateNameQuestion();
                break;
            case 'katakana-to-romanji':
                question = generateKatakanaToRomanjiQuestion();
                break;
            case 'romanji-to-katakana':
                question = generateRomanjiToKatakanaQuestion();
                break;
            case 'mixed':
                const modes = ['names', 'katakana-to-romanji', 'romanji-to-katakana'];
                const randomMode = modes[Math.floor(Math.random() * modes.length)];
                question = generateQuizQuestions(randomMode, 1)[0];
                break;
        }
        
        questions.push(question);
    }
    
    return questions;
}

function generateNameQuestion() {
    const names = Object.keys(namesData);
    const correctName = names[Math.floor(Math.random() * names.length)];
    const correctAnswer = namesData[correctName].katakana;
    
    // Generate wrong answers from other names
    const wrongAnswers = names
        .filter(name => name !== correctName)
        .map(name => namesData[name].katakana)
        .slice(0, 3);
    
    const options = shuffleArray([correctAnswer, ...wrongAnswers]);
    
    return {
        question: `How do you write "${correctName}" in katakana?`,
        options: options,
        correct: correctAnswer,
        type: 'names'
    };
}

function generateKatakanaToRomanjiQuestion() {
    const katakanaChars = Object.keys(katakanaData);
    const correctKatakana = katakanaChars[Math.floor(Math.random() * katakanaChars.length)];
    const correctAnswer = katakanaData[correctKatakana];
    
    // Generate wrong answers
    const wrongAnswers = Object.values(katakanaData)
        .filter(romanji => romanji !== correctAnswer)
        .sort(() => 0.5 - Math.random())
        .slice(0, 3);
    
    const options = shuffleArray([correctAnswer, ...wrongAnswers]);
    
    return {
        question: `What is the romanji for "${correctKatakana}"?`,
        options: options,
        correct: correctAnswer,
        type: 'katakana-to-romanji'
    };
}

function generateRomanjiToKatakanaQuestion() {
    const romanjiSounds = Object.values(katakanaData);
    const correctRomanji = romanjiSounds[Math.floor(Math.random() * romanjiSounds.length)];
    const correctAnswer = findKatakanaByRomanji(correctRomanji);
    
    // Generate wrong answers
    const wrongAnswers = Object.keys(katakanaData)
        .filter(katakana => katakana !== correctAnswer)
        .sort(() => 0.5 - Math.random())
        .slice(0, 3);
    
    const options = shuffleArray([correctAnswer, ...wrongAnswers]);
    
    return {
        question: `What is the katakana for "${correctRomanji}"?`,
        options: options,
        correct: correctAnswer,
        type: 'romanji-to-katakana'
    };
}

function shuffleArray(array) {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
}

function showQuestion() {
    const question = currentQuiz.questions[currentQuiz.currentQuestion];
    
    document.getElementById('quizMode').textContent = currentQuiz.mode.replace('-', ' → ').toUpperCase();
    document.getElementById('questionCounter').textContent = `${currentQuiz.currentQuestion + 1}/${currentQuiz.questions.length}`;
    document.getElementById('currentScore').textContent = currentQuiz.score;
    document.getElementById('questionText').textContent = question.question;
    
    const optionsContainer = document.getElementById('answerOptions');
    optionsContainer.innerHTML = '';
    
    question.options.forEach(option => {
        const button = document.createElement('button');
        button.className = 'answer-option';
        button.textContent = option;
        button.addEventListener('click', () => selectAnswer(option, question.correct));
        optionsContainer.appendChild(button);
    });
    
    document.getElementById('feedback').classList.add('hidden');
    document.getElementById('nextQuestion').classList.add('hidden');
    currentQuiz.answered = false;
}

function selectAnswer(selected, correct) {
    if (currentQuiz.answered) return;
    
    currentQuiz.answered = true;
    const isCorrect = selected === correct;
    
    // Update statistics
    totalQuizzes++;
    if (isCorrect) {
        correctAnswers++;
        currentQuiz.score += 10;
        totalScore += 10;
    }
    
    // Visual feedback
    document.querySelectorAll('.answer-option').forEach(option => {
        option.classList.add('disabled');
        if (option.textContent === correct) {
            option.classList.add('correct');
        } else if (option.textContent === selected && !isCorrect) {
            option.classList.add('incorrect');
        }
    });
    
    // Show feedback
    const feedback = document.getElementById('feedback');
    feedback.className = `feedback ${isCorrect ? 'correct' : 'incorrect'}`;
    feedback.textContent = isCorrect ? '正解！ Correct!' : `間違い！ Incorrect. The answer is: ${correct}`;
    feedback.classList.remove('hidden');
    
    document.getElementById('nextQuestion').classList.remove('hidden');
    document.getElementById('currentScore').textContent = currentQuiz.score;
    
    // Check for achievements
    if (currentQuiz.currentQuestion === 0) {
        checkAchievement('quiz_rookie');
    }
    
    // Check speed achievement
    const timeElapsed = (Date.now() - quizStartTime) / 1000;
    if (currentQuiz.currentQuestion === 9 && timeElapsed <= 30) {
        checkAchievement('speed_demon');
    }
    
    updateProgressDisplay();
    saveProgress();
}

function nextQuestion() {
    currentQuiz.currentQuestion++;
    
    if (currentQuiz.currentQuestion >= currentQuiz.questions.length) {
        endQuiz();
        return;
    }
    
    showQuestion();
}

function endQuiz() {
    const accuracy = totalQuizzes > 0 ? Math.round((correctAnswers / totalQuizzes) * 100) : 0;
    
    // Check achievements
    if (currentQuiz.mode === 'names' && currentQuiz.score === currentQuiz.questions.length * 10) {
        checkAchievement('name_expert');
    }
    
    if (currentQuiz.mode === 'mixed' && accuracy === 100) {
        checkAchievement('perfectionist');
    }
    
    document.getElementById('quizContainer').classList.add('hidden');
    document.querySelector('.quiz-modes').classList.remove('hidden');
    
    currentQuiz = null;
    updateProgressDisplay();
    saveProgress();
    
    // Show completion message
    alert(`Quiz completed!\nFinal Score: ${currentQuiz?.score || 0}\nAccuracy: ${accuracy}%`);
}

// Achievement system
function initializeAchievements() {
    const container = document.getElementById('achievementsGrid');
    container.innerHTML = '';
    
    achievements.forEach(achievement => {
        const card = document.createElement('div');
        card.className = `achievement-card ${achievement.earned ? 'earned' : ''}`;
        card.innerHTML = `
            <div class="achievement-icon">${achievement.icon}</div>
            <div class="achievement-title">${achievement.title}</div>
            <div class="achievement-desc">${achievement.desc}</div>
        `;
        container.appendChild(card);
    });
}

function checkAchievement(achievementId) {
    const achievement = achievements.find(a => a.id === achievementId);
    if (achievement && !achievement.earned) {
        achievement.earned = true;
        initializeAchievements();
        
        // Show achievement notification
        setTimeout(() => {
            alert(`🎉 Achievement Unlocked: ${achievement.title}!\n${achievement.desc}`);
        }, 500);
    }
}

// Progress tracking
function updateProgressDisplay() {
    // Cards progress
    const cardsStudied = studiedCards.size;
    const totalCards = Object.keys(katakanaData).length;
    const cardsPercentage = Math.round((cardsStudied / totalCards) * 100);
    
    document.getElementById('cardsProgress').style.width = `${cardsPercentage}%`;
    document.getElementById('cardsCount').textContent = `${cardsStudied}/${totalCards}`;
    
    // Accuracy
    const accuracy = totalQuizzes > 0 ? Math.round((correctAnswers / totalQuizzes) * 100) : 0;
    document.getElementById('accuracyText').textContent = `${accuracy}%`;
    document.getElementById('accuracyCircle').style.background = 
        `conic-gradient(#F97316 ${accuracy * 3.6}deg, #E5E7EB ${accuracy * 3.6}deg)`;
    
    // Total score
    document.getElementById('totalScore').textContent = totalScore;
}

// Data persistence
function saveProgress() {
    const progressData = {
        studiedCards: Array.from(studiedCards),
        totalQuizzes,
        correctAnswers,
        totalScore,
        achievements: achievements.map(a => ({ id: a.id, earned: a.earned }))
    };
    
    localStorage.setItem('katakanaProgress', JSON.stringify(progressData));
}

function loadProgress() {
    const saved = localStorage.getItem('katakanaProgress');
    if (!saved) return;
    
    try {
        const data = JSON.parse(saved);
        
        studiedCards = new Set(data.studiedCards || []);
        totalQuizzes = data.totalQuizzes || 0;
        correctAnswers = data.correctAnswers || 0;
        totalScore = data.totalScore || 0;
        
        if (data.achievements) {
            data.achievements.forEach(savedAchievement => {
                const achievement = achievements.find(a => a.id === savedAchievement.id);
                if (achievement) {
                    achievement.earned = savedAchievement.earned;
                }
            });
        }
        
        initializeAchievements();
    } catch (error) {
        console.error('Error loading progress:', error);
    }
}

function resetProgress() {
    if (confirm('Are you sure you want to reset all progress? This cannot be undone.')) {
        studiedCards.clear();
        totalQuizzes = 0;
        correctAnswers = 0;
        totalScore = 0;
        
        achievements.forEach(achievement => {
            achievement.earned = false;
        });
        
        localStorage.removeItem('katakanaProgress');
        updateProgressDisplay();
        initializeAchievements();
        resetCards();
        
        alert('Progress has been reset successfully!');
    }
}