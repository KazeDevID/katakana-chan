// Writing practice system for Katakana learning

class WritingPractice {
    constructor() {
        this.canvas = null;
        this.guideCanvas = null;
        this.ctx = null;
        this.guideCtx = null;
        this.isDrawing = false;
        this.currentCharacter = null;
        this.showGuide = false;
        this.strokes = [];
        this.currentStroke = [];
        this.lastPosition = { x: 0, y: 0 };
        
        this.init();
    }

    /**
     * Initialize writing practice system
     */
    init() {
        this.setupCanvas();
        this.setupEventListeners();
        this.populateCharacterSelect();
        this.setDefaultCharacter();
    }

    /**
     * Initialize the writing practice (called when tab is opened)
     */
    initialize() {
        if (this.canvas && this.guideCanvas) {
            this.resizeCanvas();
        }
    }

    /**
     * Setup canvas elements
     */
    setupCanvas() {
        this.canvas = DOM.select('#practice-canvas');
        this.guideCanvas = DOM.select('#guide-canvas');
        
        if (!this.canvas || !this.guideCanvas) {
            console.error('Canvas elements not found');
            return;
        }

        this.ctx = this.canvas.getContext('2d');
        this.guideCtx = this.guideCanvas.getContext('2d');

        // Set canvas style
        this.ctx.strokeStyle = '#4f46e5';
        this.ctx.lineWidth = 3;
        this.ctx.lineCap = 'round';
        this.ctx.lineJoin = 'round';

        this.guideCtx.strokeStyle = '#9ca3af';
        this.guideCtx.lineWidth = 2;
        this.guideCtx.lineCap = 'round';
        this.guideCtx.lineJoin = 'round';

        this.resizeCanvas();
    }

    /**
     * Resize canvas to fit container
     */
    resizeCanvas() {
        if (!this.canvas || !this.guideCanvas) return;

        const container = this.canvas.parentElement;
        const rect = container.getBoundingClientRect();
        const size = Math.min(rect.width, 400);

        this.canvas.width = size;
        this.canvas.height = size;
        this.guideCanvas.width = size;
        this.guideCanvas.height = size;

        // Redraw guide if character is selected
        if (this.currentCharacter && this.showGuide) {
            this.drawGuideCharacter();
        }
    }

    /**
     * Setup event listeners
     */
    setupEventListeners() {
        // Character selection
        const characterSelect = DOM.select('#writing-character');
        characterSelect?.addEventListener('change', (e) => {
            const katakana = e.target.value;
            this.setCharacter(katakana);
        });

        // Control buttons
        const clearBtn = DOM.select('#clear-canvas');
        const guideBtn = DOM.select('#show-guide');
        
        clearBtn?.addEventListener('click', () => this.clearCanvas());
        guideBtn?.addEventListener('click', () => this.toggleGuide());

        // Canvas drawing events
        if (this.canvas) {
            // Mouse events
            this.canvas.addEventListener('mousedown', (e) => this.startDrawing(e));
            this.canvas.addEventListener('mousemove', (e) => this.draw(e));
            this.canvas.addEventListener('mouseup', () => this.stopDrawing());
            this.canvas.addEventListener('mouseout', () => this.stopDrawing());

            // Touch events
            this.canvas.addEventListener('touchstart', (e) => {
                e.preventDefault();
                this.startDrawing(e.touches[0]);
            });

            this.canvas.addEventListener('touchmove', (e) => {
                e.preventDefault();
                this.draw(e.touches[0]);
            });

            this.canvas.addEventListener('touchend', (e) => {
                e.preventDefault();
                this.stopDrawing();
            });

            // Prevent scrolling when touching the canvas
            this.canvas.addEventListener('touchstart', (e) => e.preventDefault());
            this.canvas.addEventListener('touchmove', (e) => e.preventDefault());
        }

        // Window resize
        window.addEventListener('resize', debounce(() => {
            this.resizeCanvas();
        }, 250));
    }

    /**
     * Populate character selection dropdown
     */
    populateCharacterSelect() {
        const select = DOM.select('#writing-character');
        if (!select) return;

        // Clear existing options except the first one
        select.innerHTML = '<option value="">Select Character</option>';

        // Group characters by category
        const categorizedChars = {};
        KATAKANA_DATA.forEach(char => {
            const categoryName = CATEGORIES[char.category]?.name || char.category;
            if (!categorizedChars[categoryName]) {
                categorizedChars[categoryName] = [];
            }
            categorizedChars[categoryName].push(char);
        });

        // Add options grouped by category
        Object.entries(categorizedChars).forEach(([categoryName, chars]) => {
            const optgroup = DOM.create('optgroup', { label: categoryName });
            
            chars.forEach(char => {
                const option = DOM.create('option', { value: char.katakana });
                option.textContent = `${char.katakana} (${char.romanji})`;
                optgroup.appendChild(option);
            });
            
            select.appendChild(optgroup);
        });
    }

    /**
     * Set default character for practice
     */
    setDefaultCharacter() {
        this.setCharacter('ア'); // Start with 'A'
    }

    /**
     * Set current character for practice
     */
    setCharacter(katakana) {
        if (!katakana) {
            this.currentCharacter = null;
            this.updateReferenceDisplay();
            this.clearCanvas();
            this.updateFeedback('Select a character to start practicing!');
            return;
        }

        this.currentCharacter = KATAKANA_DATA.find(char => char.katakana === katakana);
        
        if (this.currentCharacter) {
            this.updateReferenceDisplay();
            this.clearCanvas();
            
            if (this.showGuide) {
                this.drawGuideCharacter();
            }
            
            this.updateFeedback(`Practice writing ${this.currentCharacter.katakana} (${this.currentCharacter.romanji}). Draw on the canvas!`);
            
            // Update character select if not already selected
            const select = DOM.select('#writing-character');
            if (select && select.value !== katakana) {
                select.value = katakana;
            }
        }
    }

    /**
     * Update reference character display
     */
    updateReferenceDisplay() {
        const refChar = DOM.select('#reference-char');
        const refRomanji = DOM.select('#reference-romanji');

        if (this.currentCharacter) {
            if (refChar) refChar.textContent = this.currentCharacter.katakana;
            if (refRomanji) refRomanji.textContent = this.currentCharacter.romanji;
        } else {
            if (refChar) refChar.textContent = '?';
            if (refRomanji) refRomanji.textContent = '';
        }
    }

    /**
     * Get drawing position from event
     */
    getDrawingPosition(e) {
        const rect = this.canvas.getBoundingClientRect();
        const scaleX = this.canvas.width / rect.width;
        const scaleY = this.canvas.height / rect.height;

        return {
            x: (e.clientX - rect.left) * scaleX,
            y: (e.clientY - rect.top) * scaleY
        };
    }

    /**
     * Start drawing
     */
    startDrawing(e) {
        if (!this.currentCharacter) return;

        this.isDrawing = true;
        this.lastPosition = this.getDrawingPosition(e);
        this.currentStroke = [this.lastPosition];

        // Begin path
        this.ctx.beginPath();
        this.ctx.moveTo(this.lastPosition.x, this.lastPosition.y);
    }

    /**
     * Draw stroke
     */
    draw(e) {
        if (!this.isDrawing || !this.currentCharacter) return;

        const position = this.getDrawingPosition(e);
        
        // Draw line
        this.ctx.lineTo(position.x, position.y);
        this.ctx.stroke();

        // Add to current stroke
        this.currentStroke.push(position);
        this.lastPosition = position;
    }

    /**
     * Stop drawing
     */
    stopDrawing() {
        if (!this.isDrawing) return;

        this.isDrawing = false;
        
        if (this.currentStroke.length > 0) {
            this.strokes.push([...this.currentStroke]);
            this.currentStroke = [];
            
            // Provide feedback after stroke completion
            this.evaluateDrawing();
        }
    }

    /**
     * Clear the canvas
     */
    clearCanvas() {
        if (this.ctx) {
            this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        }
        
        this.strokes = [];
        this.currentStroke = [];
        this.updateFeedback(this.currentCharacter ? 
            `Canvas cleared. Practice ${this.currentCharacter.katakana} again!` : 
            'Select a character to start practicing!'
        );
    }

    /**
     * Toggle guide display
     */
    toggleGuide() {
        this.showGuide = !this.showGuide;
        const guideBtn = DOM.select('#show-guide');
        
        if (this.showGuide) {
            if (guideBtn) guideBtn.textContent = 'Hide Guide';
            this.drawGuideCharacter();
        } else {
            if (guideBtn) guideBtn.textContent = 'Show Guide';
            this.clearGuideCanvas();
        }
    }

    /**
     * Draw guide character on guide canvas
     */
    drawGuideCharacter() {
        if (!this.currentCharacter || !this.guideCtx) return;

        this.clearGuideCanvas();

        // Scale strokes to fit canvas
        const scaleX = this.guideCanvas.width / 200; // Original stroke coordinates are based on 200x200
        const scaleY = this.guideCanvas.height / 200;

        this.currentCharacter.strokes.forEach(stroke => {
            this.guideCtx.beginPath();
            this.guideCtx.moveTo(stroke[0] * scaleX, stroke[1] * scaleY);
            this.guideCtx.lineTo(stroke[2] * scaleX, stroke[3] * scaleY);
            this.guideCtx.stroke();
        });

        // Draw stroke order numbers
        this.currentCharacter.strokes.forEach((stroke, index) => {
            const x = stroke[0] * scaleX;
            const y = stroke[1] * scaleY;
            
            this.guideCtx.fillStyle = '#ef4444';
            this.guideCtx.font = '14px bold sans-serif';
            this.guideCtx.textAlign = 'center';
            this.guideCtx.fillText((index + 1).toString(), x, y - 5);
        });

        this.guideCtx.fillStyle = '#9ca3af'; // Reset fill style
    }

    /**
     * Clear guide canvas
     */
    clearGuideCanvas() {
        if (this.guideCtx) {
            this.guideCtx.clearRect(0, 0, this.guideCanvas.width, this.guideCanvas.height);
        }
    }

    /**
     * Evaluate user's drawing (simple feedback)
     */
    evaluateDrawing() {
        if (!this.currentCharacter || this.strokes.length === 0) return;

        const expectedStrokes = this.currentCharacter.strokes.length;
        const userStrokes = this.strokes.length;

        let feedback = '';

        if (userStrokes === 1 && expectedStrokes > 1) {
            feedback = 'Good start! Keep going - this character needs more strokes.';
        } else if (userStrokes < expectedStrokes) {
            feedback = `Good progress! You need ${expectedStrokes - userStrokes} more stroke${expectedStrokes - userStrokes > 1 ? 's' : ''}.`;
        } else if (userStrokes === expectedStrokes) {
            feedback = 'Great! You completed all the strokes. Try writing it again for practice.';
            
            // Mark character as practiced
            this.markCharacterPracticed();
        } else {
            feedback = `You've drawn ${userStrokes} strokes, but ${this.currentCharacter.katakana} typically uses ${expectedStrokes} strokes.`;
        }

        this.updateFeedback(feedback);
    }

    /**
     * Mark character as practiced
     */
    markCharacterPracticed() {
        if (!this.currentCharacter) return;

        // Add to learned characters if not already there
        if (window.katakanaApp) {
            globalEvents.emit('characterLearned', this.currentCharacter.katakana);
            window.katakanaApp.logActivity(`Practiced writing ${this.currentCharacter.katakana}`);
        }
    }

    /**
     * Update feedback display
     */
    updateFeedback(text) {
        const feedback = DOM.select('#writing-feedback-text');
        if (feedback) {
            feedback.textContent = text;
        }
    }

    /**
     * Get practice statistics
     */
    getStats() {
        const practicedChars = Storage.get('practicedCharacters', []);
        return {
            total: KATAKANA_DATA.length,
            practiced: practicedChars.length,
            remaining: KATAKANA_DATA.length - practicedChars.length,
            progress: calculatePercentage(practicedChars.length, KATAKANA_DATA.length)
        };
    }

    /**
     * Export drawing as image (future feature)
     */
    exportDrawing() {
        if (!this.canvas) return null;
        return this.canvas.toDataURL('image/png');
    }

    /**
     * Load drawing from image data (future feature)
     */
    loadDrawing(imageData) {
        if (!this.ctx || !imageData) return;

        const img = new Image();
        img.onload = () => {
            this.clearCanvas();
            this.ctx.drawImage(img, 0, 0);
        };
        img.src = imageData;
    }
}

// Initialize writing practice when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.writingPractice = new WritingPractice();
});

// Add CSS styles for writing practice
const writingStyles = `
    .practice-canvas-container {
        position: relative;
        background: #fff;
        border-radius: var(--border-radius);
    }

    [data-theme="dark"] .practice-canvas-container {
        background: var(--surface-color);
    }

    #practice-canvas {
        background: transparent;
        cursor: crosshair;
        border-radius: var(--border-radius);
    }

    #guide-canvas {
        opacity: 0.3;
        pointer-events: none;
    }

    .writing-area {
        align-items: start;
    }

    .reference-character {
        position: sticky;
        top: 2rem;
    }

    .writing-feedback {
        font-weight: 500;
        color: var(--text-primary);
    }

    @media (max-width: 768px) {
        .writing-area {
            gap: 1rem;
        }

        .practice-canvas-container {
            width: 100%;
            max-width: 300px;
            margin: 0 auto;
        }

        #practice-canvas,
        #guide-canvas {
            width: 100% !important;
            height: auto !important;
            max-width: 300px;
        }

        .reference-character {
            position: static;
            margin: 0 auto;
            max-width: 200px;
        }
    }

    /* Touch-friendly styles */
    @media (hover: none) and (pointer: coarse) {
        #practice-canvas {
            cursor: default;
        }
        
        .practice-canvas-container {
            touch-action: none;
        }
    }
`;

// Inject writing practice styles
const writingStyleSheet = document.createElement('style');
writingStyleSheet.textContent = writingStyles;
document.head.appendChild(writingStyleSheet);