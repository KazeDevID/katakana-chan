// Utility functions for the Katakana learning app

/**
 * Shuffle an array randomly
 * @param {Array} array - Array to shuffle
 * @returns {Array} - Shuffled array
 */
function shuffleArray(array) {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
}

/**
 * Get random element from array
 * @param {Array} array - Array to pick from
 * @returns {*} - Random element
 */
function getRandomElement(array) {
    return array[Math.floor(Math.random() * array.length)];
}

/**
 * Get multiple random elements from array
 * @param {Array} array - Array to pick from
 * @param {number} count - Number of elements to pick
 * @returns {Array} - Array of random elements
 */
function getRandomElements(array, count) {
    const shuffled = shuffleArray(array);
    return shuffled.slice(0, Math.min(count, array.length));
}

/**
 * Format time in seconds to readable format
 * @param {number} seconds - Time in seconds
 * @returns {string} - Formatted time
 */
function formatTime(seconds) {
    if (seconds < 60) {
        return `${seconds}s`;
    } else if (seconds < 3600) {
        const minutes = Math.floor(seconds / 60);
        const remainingSeconds = seconds % 60;
        return `${minutes}m ${remainingSeconds}s`;
    } else {
        const hours = Math.floor(seconds / 3600);
        const minutes = Math.floor((seconds % 3600) / 60);
        return `${hours}h ${minutes}m`;
    }
}

/**
 * Calculate percentage
 * @param {number} part - Part value
 * @param {number} total - Total value
 * @returns {number} - Percentage (0-100)
 */
function calculatePercentage(part, total) {
    if (total === 0) return 0;
    return Math.round((part / total) * 100);
}

/**
 * Debounce function calls
 * @param {Function} func - Function to debounce
 * @param {number} wait - Wait time in milliseconds
 * @returns {Function} - Debounced function
 */
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

/**
 * Local storage helpers
 */
const Storage = {
    /**
     * Get item from localStorage with JSON parsing
     * @param {string} key - Storage key
     * @param {*} defaultValue - Default value if not found
     * @returns {*} - Parsed value or default
     */
    get(key, defaultValue = null) {
        try {
            const item = localStorage.getItem(key);
            return item ? JSON.parse(item) : defaultValue;
        } catch (error) {
            console.warn(`Error parsing localStorage item ${key}:`, error);
            return defaultValue;
        }
    },

    /**
     * Set item in localStorage with JSON stringification
     * @param {string} key - Storage key
     * @param {*} value - Value to store
     */
    set(key, value) {
        try {
            localStorage.setItem(key, JSON.stringify(value));
        } catch (error) {
            console.warn(`Error setting localStorage item ${key}:`, error);
        }
    },

    /**
     * Remove item from localStorage
     * @param {string} key - Storage key
     */
    remove(key) {
        localStorage.removeItem(key);
    },

    /**
     * Clear all localStorage
     */
    clear() {
        localStorage.clear();
    }
};

/**
 * Event emitter for loose coupling between modules
 */
class EventEmitter {
    constructor() {
        this.events = {};
    }

    /**
     * Subscribe to an event
     * @param {string} event - Event name
     * @param {Function} callback - Callback function
     */
    on(event, callback) {
        if (!this.events[event]) {
            this.events[event] = [];
        }
        this.events[event].push(callback);
    }

    /**
     * Unsubscribe from an event
     * @param {string} event - Event name
     * @param {Function} callback - Callback function
     */
    off(event, callback) {
        if (!this.events[event]) return;
        this.events[event] = this.events[event].filter(cb => cb !== callback);
    }

    /**
     * Emit an event
     * @param {string} event - Event name
     * @param {...*} args - Arguments to pass to callbacks
     */
    emit(event, ...args) {
        if (!this.events[event]) return;
        this.events[event].forEach(callback => callback(...args));
    }
}

/**
 * Create a global event emitter instance
 */
const globalEvents = new EventEmitter();

/**
 * DOM utilities
 */
const DOM = {
    /**
     * Query selector with optional parent element
     * @param {string} selector - CSS selector
     * @param {Element} parent - Parent element (optional)
     * @returns {Element|null} - Found element
     */
    select(selector, parent = document) {
        return parent.querySelector(selector);
    },

    /**
     * Query selector all with optional parent element
     * @param {string} selector - CSS selector
     * @param {Element} parent - Parent element (optional)
     * @returns {NodeList} - Found elements
     */
    selectAll(selector, parent = document) {
        return parent.querySelectorAll(selector);
    },

    /**
     * Create element with attributes and children
     * @param {string} tag - HTML tag name
     * @param {Object} attributes - Element attributes
     * @param {...(string|Element)} children - Child elements or text
     * @returns {Element} - Created element
     */
    create(tag, attributes = {}, ...children) {
        const element = document.createElement(tag);
        
        Object.entries(attributes).forEach(([key, value]) => {
            if (key === 'className') {
                element.className = value;
            } else if (key === 'dataset') {
                Object.entries(value).forEach(([dataKey, dataValue]) => {
                    element.dataset[dataKey] = dataValue;
                });
            } else if (key.startsWith('on')) {
                element.addEventListener(key.slice(2).toLowerCase(), value);
            } else {
                element.setAttribute(key, value);
            }
        });
        
        children.forEach(child => {
            if (typeof child === 'string') {
                element.appendChild(document.createTextNode(child));
            } else if (child instanceof Element) {
                element.appendChild(child);
            }
        });
        
        return element;
    },

    /**
     * Add CSS classes to element
     * @param {Element} element - Target element
     * @param {...string} classes - Classes to add
     */
    addClass(element, ...classes) {
        element.classList.add(...classes);
    },

    /**
     * Remove CSS classes from element
     * @param {Element} element - Target element
     * @param {...string} classes - Classes to remove
     */
    removeClass(element, ...classes) {
        element.classList.remove(...classes);
    },

    /**
     * Toggle CSS classes on element
     * @param {Element} element - Target element
     * @param {...string} classes - Classes to toggle
     */
    toggleClass(element, ...classes) {
        classes.forEach(className => element.classList.toggle(className));
    },

    /**
     * Check if element has CSS class
     * @param {Element} element - Target element
     * @param {string} className - Class to check
     * @returns {boolean} - Whether element has class
     */
    hasClass(element, className) {
        return element.classList.contains(className);
    }
};

/**
 * Animation utilities
 */
const Animation = {
    /**
     * Fade in element
     * @param {Element} element - Element to fade in
     * @param {number} duration - Animation duration in ms
     */
    fadeIn(element, duration = 300) {
        element.style.opacity = '0';
        element.style.display = 'block';
        
        const start = Date.now();
        const fade = () => {
            const elapsed = Date.now() - start;
            const progress = Math.min(elapsed / duration, 1);
            
            element.style.opacity = progress;
            
            if (progress < 1) {
                requestAnimationFrame(fade);
            }
        };
        
        requestAnimationFrame(fade);
    },

    /**
     * Fade out element
     * @param {Element} element - Element to fade out
     * @param {number} duration - Animation duration in ms
     */
    fadeOut(element, duration = 300) {
        const start = Date.now();
        const initialOpacity = parseFloat(getComputedStyle(element).opacity);
        
        const fade = () => {
            const elapsed = Date.now() - start;
            const progress = Math.min(elapsed / duration, 1);
            
            element.style.opacity = initialOpacity * (1 - progress);
            
            if (progress < 1) {
                requestAnimationFrame(fade);
            } else {
                element.style.display = 'none';
            }
        };
        
        requestAnimationFrame(fade);
    },

    /**
     * Slide element up
     * @param {Element} element - Element to slide
     * @param {number} duration - Animation duration in ms
     */
    slideUp(element, duration = 300) {
        const height = element.offsetHeight;
        element.style.overflow = 'hidden';
        element.style.transition = `height ${duration}ms ease`;
        element.style.height = '0px';
        
        setTimeout(() => {
            element.style.display = 'none';
            element.style.height = '';
            element.style.transition = '';
            element.style.overflow = '';
        }, duration);
    },

    /**
     * Slide element down
     * @param {Element} element - Element to slide
     * @param {number} duration - Animation duration in ms
     */
    slideDown(element, duration = 300) {
        element.style.display = 'block';
        element.style.height = '0px';
        element.style.overflow = 'hidden';
        
        const height = element.scrollHeight;
        element.style.transition = `height ${duration}ms ease`;
        element.style.height = height + 'px';
        
        setTimeout(() => {
            element.style.height = '';
            element.style.transition = '';
            element.style.overflow = '';
        }, duration);
    }
};

/**
 * Validation utilities
 */
const Validator = {
    /**
     * Check if value is empty
     * @param {*} value - Value to check
     * @returns {boolean} - Whether value is empty
     */
    isEmpty(value) {
        return value === null || value === undefined || value === '' || 
               (Array.isArray(value) && value.length === 0) ||
               (typeof value === 'object' && Object.keys(value).length === 0);
    },

    /**
     * Check if string is valid email
     * @param {string} email - Email to validate
     * @returns {boolean} - Whether email is valid
     */
    isEmail(email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    },

    /**
     * Check if value is numeric
     * @param {*} value - Value to check
     * @returns {boolean} - Whether value is numeric
     */
    isNumeric(value) {
        return !isNaN(value) && isFinite(value);
    }
};

// Export utilities if in Node.js environment
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        shuffleArray,
        getRandomElement,
        getRandomElements,
        formatTime,
        calculatePercentage,
        debounce,
        Storage,
        EventEmitter,
        globalEvents,
        DOM,
        Animation,
        Validator
    };
}