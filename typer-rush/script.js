// Text data
const texts = {
    quotes: {
        easy: [
            "The only way to do great work is to love what you do.",
            "Life is what happens when you are busy making other plans.",
            "The future belongs to those who believe in the beauty of their dreams.",
            "It is during our darkest moments that we must focus to see the light.",
            "The best time to plant a tree was twenty years ago. The second best time is now.",
            "Your time is limited so do not waste it living someone else life.",
            "The only impossible journey is the one you never begin.",
            "In the middle of every difficulty lies opportunity.",
            "Success is not final failure is not fatal it is the courage to continue that counts.",
            "Believe you can and you are halfway there."
        ],
        medium: [
            "The greatest glory in living lies not in never falling, but in rising every time we fall. The way to get started is to quit talking and begin doing.",
            "If you look at what you have in life, you will always have more. If you look at what you do not have in life, you will never have enough.",
            "The purpose of our lives is to be happy. Get busy living or get busy dying. You only live once, but if you do it right, once is enough.",
            "Many of life's failures are people who did not realize how close they were to success when they gave up. The only thing we have to fear is fear itself.",
            "In the end, it is not the years in your life that count. It is the life in your years. Stay hungry, stay foolish, and never stop exploring."
        ],
        hard: [
            "Twenty years from now you will be more disappointed by the things that you didn't do than by the ones you did do. So throw off the bowlines. Sail away from the safe harbor. Catch the trade winds in your sails. Explore. Dream. Discover.",
            "It is not the critic who counts; not the man who points out how the strong man stumbles, or where the doer of deeds could have done them better. The credit belongs to the man who is actually in the arena, whose face is marred by dust and sweat and blood.",
            "The most difficult thing is the decision to act, the rest is merely tenacity. The fears are paper tigers. You can do anything you decide to do. You can act to change and control your life; and the procedure, the process is its own reward."
        ]
    },
    code: {
        easy: [
            "const name = 'World'; console.log('Hello, ' + name);",
            "function add(a, b) { return a + b; } add(2, 3);",
            "let count = 0; for (let i = 0; i < 10; i++) { count++; }",
            "const arr = [1, 2, 3]; arr.map(x => x * 2);",
            "if (isValid) { doSomething(); } else { handleError(); }"
        ],
        medium: [
            "const fetchData = async (url) => { const response = await fetch(url); return response.json(); };",
            "class Person { constructor(name) { this.name = name; } greet() { return `Hello, ${this.name}`; } }",
            "const debounce = (fn, delay) => { let timeout; return (...args) => { clearTimeout(timeout); timeout = setTimeout(() => fn(...args), delay); }; };",
            "const unique = arr => [...new Set(arr)]; const flat = arr => arr.reduce((acc, val) => acc.concat(val), []);",
            "const deepClone = obj => JSON.parse(JSON.stringify(obj)); const merge = (...objs) => Object.assign({}, ...objs);"
        ],
        hard: [
            "const memoize = fn => { const cache = new Map(); return (...args) => { const key = JSON.stringify(args); if (cache.has(key)) return cache.get(key); const result = fn(...args); cache.set(key, result); return result; }; };",
            "const pipe = (...fns) => initial => fns.reduce((acc, fn) => fn(acc), initial); const compose = (...fns) => initial => fns.reduceRight((acc, fn) => fn(acc), initial);",
            "const throttle = (fn, limit) => { let inThrottle; return function(...args) { if (!inThrottle) { fn.apply(this, args); inThrottle = true; setTimeout(() => inThrottle = false, limit); } }; };"
        ]
    },
    words: {
        easy: [
            "apple banana orange grape lemon peach mango cherry berry plum melon kiwi pear fig date",
            "house tree road lake sun moon star rain snow wind cloud river mountain forest beach",
            "happy smile laugh play dance sing jump run walk swim read write draw paint think",
            "book phone table chair desk lamp door window floor wall roof garden flower grass leaf"
        ],
        medium: [
            "adventure beautiful creative wonderful fantastic amazing incredible outstanding excellent marvelous spectacular extraordinary remarkable sensational",
            "accomplish achievement ambition aspiration determination dedication motivation inspiration imagination innovation revolution evolution transformation celebration",
            "butterfly umbrella chocolate hamburger basketball photography dictionary calculator temperature refrigerator microscope photography architecture"
        ],
        hard: [
            "extraordinary accomplishment superintendent revolutionary acknowledgement metamorphosis pharmaceutical autobiographical chronological archaeological anthropological",
            "miscellaneous conscientiously uncharacteristically incomprehensibility counterproductive disproportionately inconsequentially unquestionably simultaneously",
            "entrepreneurship multidimensional internationalization telecommunications experimentation industrialization professionalism decentralization"
        ]
    }
};

const achievements = [
    { id: 'first', emoji: '🎯', name: 'First Test', desc: 'Complete your first test', check: (stats) => true },
    { id: 'speed30', emoji: '🚀', name: 'Getting Started', desc: 'Reach 30 WPM', check: (stats) => stats.wpm >= 30 },
    { id: 'speed50', emoji: '⚡', name: 'Fast Fingers', desc: 'Reach 50 WPM', check: (stats) => stats.wpm >= 50 },
    { id: 'speed70', emoji: '🔥', name: 'Speed Demon', desc: 'Reach 70 WPM', check: (stats) => stats.wpm >= 70 },
    { id: 'speed100', emoji: '💎', name: 'Diamond Hands', desc: 'Reach 100 WPM', check: (stats) => stats.wpm >= 100 },
    { id: 'perfect', emoji: '✨', name: 'Perfectionist', desc: '100% accuracy', check: (stats) => stats.accuracy === 100 },
    { id: 'accurate95', emoji: '🎯', name: 'Sharpshooter', desc: '95%+ accuracy', check: (stats) => stats.accuracy >= 95 },
    { id: 'marathon', emoji: '🏃', name: 'Marathon', desc: 'Complete 120s test', check: (stats, settings) => settings.duration === 120 },
    { id: 'coder', emoji: '💻', name: 'Code Master', desc: 'Complete a code test', check: (stats, settings) => settings.category === 'code' },
    { id: 'hard', emoji: '🏆', name: 'Challenger', desc: 'Complete a hard test', check: (stats, settings) => settings.difficulty === 'hard' }
];

// State
let state = {
    isRunning: false,
    timeLeft: 60,
    duration: 60,
    difficulty: 'easy',
    category: 'quotes',
    currentText: '',
    typedChars: 0,
    correctChars: 0,
    errors: 0,
    startTime: null,
    timerInterval: null,
    keyHeatmap: {}
};

// DOM Elements
const elements = {
    wpm: document.getElementById('wpm'),
    accuracy: document.getElementById('accuracy'),
    timer: document.getElementById('timer'),
    textDisplay: document.getElementById('textDisplay'),
    inputField: document.getElementById('inputField'),
    startBtn: document.getElementById('startBtn'),
    restartBtn: document.getElementById('restartBtn'),
    progress: document.getElementById('progress'),
    keyboard: document.getElementById('keyboard'),
    settings: document.getElementById('settings'),
    bestWpm: document.getElementById('bestWpm'),
    achievements: document.getElementById('achievements'),
    resultsModal: document.getElementById('resultsModal'),
    finalWpm: document.getElementById('finalWpm'),
    finalAccuracy: document.getElementById('finalAccuracy'),
    finalChars: document.getElementById('finalChars'),
    finalErrors: document.getElementById('finalErrors'),
    resultMessage: document.getElementById('resultMessage'),
    newRecord: document.getElementById('newRecord'),
    earnedBadges: document.getElementById('earnedBadges'),
    closeModal: document.getElementById('closeModal'),
    particles: document.getElementById('particles')
};

// Initialize
function init() {
    loadBestWpm();
    loadAchievements();
    setupEventListeners();
    renderAchievements();
}

function loadBestWpm() {
    const best = localStorage.getItem('typerRush_bestWpm');
    if (best) {
        elements.bestWpm.textContent = best;
    }
}

function loadAchievements() {
    const saved = localStorage.getItem('typerRush_achievements');
    return saved ? JSON.parse(saved) : [];
}

function saveAchievement(id) {
    const saved = loadAchievements();
    if (!saved.includes(id)) {
        saved.push(id);
        localStorage.setItem('typerRush_achievements', JSON.stringify(saved));
    }
}

function renderAchievements() {
    const unlocked = loadAchievements();
    elements.achievements.innerHTML = achievements.map(a => `
        <div class="badge ${unlocked.includes(a.id) ? 'unlocked' : 'locked'}" title="${a.desc}">
            ${a.emoji} ${a.name}
        </div>
    `).join('');
}

function setupEventListeners() {
    // Settings buttons
    document.querySelectorAll('.btn-option[data-duration]').forEach(btn => {
        btn.addEventListener('click', () => {
            document.querySelectorAll('.btn-option[data-duration]').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            state.duration = parseInt(btn.dataset.duration);
            state.timeLeft = state.duration;
            elements.timer.textContent = state.timeLeft;
        });
    });

    document.querySelectorAll('.btn-option[data-difficulty]').forEach(btn => {
        btn.addEventListener('click', () => {
            document.querySelectorAll('.btn-option[data-difficulty]').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            state.difficulty = btn.dataset.difficulty;
        });
    });

    document.querySelectorAll('.btn-option[data-category]').forEach(btn => {
        btn.addEventListener('click', () => {
            document.querySelectorAll('.btn-option[data-category]').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            state.category = btn.dataset.category;
        });
    });

    // Control buttons
    elements.startBtn.addEventListener('click', startTest);
    elements.restartBtn.addEventListener('click', resetTest);
    elements.closeModal.addEventListener('click', () => {
        elements.resultsModal.classList.remove('show');
        resetTest();
    });

    // Input handling
    elements.inputField.addEventListener('input', handleInput);
    
    // Keyboard visualization
    document.addEventListener('keydown', (e) => {
        if (!state.isRunning) return;
        const key = e.key.toLowerCase();
        highlightKey(key);
        trackKeyHeat(key);
        createParticle(e);
    });

    document.addEventListener('keyup', (e) => {
        const key = e.key.toLowerCase();
        unhighlightKey(key);
    });
}

function startTest() {
    const textArray = texts[state.category][state.difficulty];
    state.currentText = textArray[Math.floor(Math.random() * textArray.length)];
    
    // Reset state
    state.isRunning = true;
    state.timeLeft = state.duration;
    state.typedChars = 0;
    state.correctChars = 0;
    state.errors = 0;
    state.startTime = Date.now();
    state.keyHeatmap = {};

    // Update UI
    renderText();
    elements.inputField.disabled = false;
    elements.inputField.value = '';
    elements.inputField.focus();
    elements.startBtn.style.display = 'none';
    elements.restartBtn.style.display = 'inline-block';
    elements.settings.style.pointerEvents = 'none';
    elements.settings.style.opacity = '0.5';
    elements.keyboard.classList.add('active');
    elements.progress.style.width = '0%';

    // Start timer
    state.timerInterval = setInterval(updateTimer, 1000);
    requestAnimationFrame(updateStats);
}

function renderText() {
    elements.textDisplay.innerHTML = state.currentText.split('').map((char, i) => {
        let className = 'char';
        if (i === 0) className += ' current';
        return `<span class="${className}" data-index="${i}">${char}</span>`;
    }).join('');
}

function handleInput(e) {
    if (!state.isRunning) return;

    const typed = e.target.value;
    const chars = elements.textDisplay.querySelectorAll('.char');

    state.typedChars = typed.length;
    state.correctChars = 0;
    state.errors = 0;

    chars.forEach((char, i) => {
        char.classList.remove('correct', 'incorrect', 'current');
        
        if (i < typed.length) {
            if (typed[i] === state.currentText[i]) {
                char.classList.add('correct');
                state.correctChars++;
            } else {
                char.classList.add('incorrect');
                state.errors++;
            }
        } else if (i === typed.length) {
            char.classList.add('current');
        }
    });

    // Update progress
    const progress = (typed.length / state.currentText.length) * 100;
    elements.progress.style.width = `${Math.min(progress, 100)}%`;

    // Check if completed
    if (typed.length >= state.currentText.length) {
        endTest();
    }
}

function updateTimer() {
    state.timeLeft--;
    elements.timer.textContent = state.timeLeft;

    if (state.timeLeft <= 0) {
        endTest();
    }
}

function updateStats() {
    if (!state.isRunning) return;

    const elapsedMinutes = (Date.now() - state.startTime) / 60000;
    const wpm = elapsedMinutes > 0 ? Math.round((state.correctChars / 5) / elapsedMinutes) : 0;
    const accuracy = state.typedChars > 0 ? Math.round((state.correctChars / state.typedChars) * 100) : 100;

    elements.wpm.textContent = wpm;
    elements.accuracy.textContent = accuracy;

    requestAnimationFrame(updateStats);
}

function endTest() {
    state.isRunning = false;
    clearInterval(state.timerInterval);
    elements.inputField.disabled = true;
    elements.keyboard.classList.remove('active');

    const elapsedMinutes = (Date.now() - state.startTime) / 60000;
    const finalWpm = Math.round((state.correctChars / 5) / elapsedMinutes);
    const finalAccuracy = state.typedChars > 0 ? Math.round((state.correctChars / state.typedChars) * 100) : 100;

    // Check for personal best
    const currentBest = parseInt(localStorage.getItem('typerRush_bestWpm') || '0');
    const isNewRecord = finalWpm > currentBest;
    
    if (isNewRecord) {
        localStorage.setItem('typerRush_bestWpm', finalWpm.toString());
        elements.bestWpm.textContent = finalWpm;
    }

    // Check achievements
    const stats = { wpm: finalWpm, accuracy: finalAccuracy };
    const settings = { duration: state.duration, difficulty: state.difficulty, category: state.category };
    const newBadges = [];
    
    achievements.forEach(a => {
        if (a.check(stats, settings) && !loadAchievements().includes(a.id)) {
            saveAchievement(a.id);
            newBadges.push(a);
        }
    });

    // Show results
    elements.finalWpm.textContent = finalWpm;
    elements.finalAccuracy.textContent = `${finalAccuracy}%`;
    elements.finalChars.textContent = state.typedChars;
    elements.finalErrors.textContent = state.errors;
    elements.newRecord.style.display = isNewRecord ? 'block' : 'none';
    
    // Set message based on performance
    const messages = [
        { min: 0, msg: "Keep practicing! You're building your foundation. 💪" },
        { min: 20, msg: "Nice effort! With practice, you'll improve quickly. 🌱" },
        { min: 30, msg: "Good job! You're getting the hang of it. 👍" },
        { min: 40, msg: "Well done! You're above average. Keep it up! 🎯" },
        { min: 50, msg: "Impressive! Your typing skills are solid. ⚡" },
        { min: 60, msg: "Excellent! You're a fast typer! 🔥" },
        { min: 80, msg: "Amazing! Professional-level typing! 🚀" },
        { min: 100, msg: "Incredible! You're a typing legend! 💎" }
    ];
    
    const message = messages.reverse().find(m => finalWpm >= m.min).msg;
    elements.resultMessage.textContent = message;

    // Show earned badges
    elements.earnedBadges.innerHTML = newBadges.map(b => `
        <div class="badge unlocked">
            ${b.emoji} ${b.name}
        </div>
    `).join('');

    elements.resultsModal.classList.add('show');
    renderAchievements();
    updateKeyHeatmap();
}

function resetTest() {
    clearInterval(state.timerInterval);
    state.isRunning = false;
    state.timeLeft = state.duration;
    state.typedChars = 0;
    state.correctChars = 0;
    state.errors = 0;

    elements.timer.textContent = state.timeLeft;
    elements.wpm.textContent = '0';
    elements.accuracy.textContent = '100';
    elements.textDisplay.innerHTML = '<span class="placeholder">Click Start to begin your typing test!</span>';
    elements.inputField.value = '';
    elements.inputField.disabled = true;
    elements.startBtn.style.display = 'inline-block';
    elements.restartBtn.style.display = 'none';
    elements.settings.style.pointerEvents = 'auto';
    elements.settings.style.opacity = '1';
    elements.progress.style.width = '0%';
    
    // Reset heatmap
    document.querySelectorAll('.key').forEach(key => {
        key.classList.remove('heat-1', 'heat-2', 'heat-3', 'heat-4', 'heat-5');
    });
}

function highlightKey(key) {
    const keyEl = document.querySelector(`.key[data-key="${key}"]`);
    if (keyEl) keyEl.classList.add('pressed');
}

function unhighlightKey(key) {
    const keyEl = document.querySelector(`.key[data-key="${key}"]`);
    if (keyEl) keyEl.classList.remove('pressed');
}

function trackKeyHeat(key) {
    state.keyHeatmap[key] = (state.keyHeatmap[key] || 0) + 1;
}

function updateKeyHeatmap() {
    const maxHeat = Math.max(...Object.values(state.keyHeatmap), 1);
    
    Object.entries(state.keyHeatmap).forEach(([key, count]) => {
        const keyEl = document.querySelector(`.key[data-key="${key}"]`);
        if (keyEl) {
            const heatLevel = Math.ceil((count / maxHeat) * 5);
            keyEl.classList.add(`heat-${heatLevel}`);
        }
    });
}

function createParticle(e) {
    const particle = document.createElement('div');
    particle.className = 'particle';
    particle.style.left = `${Math.random() * window.innerWidth}px`;
    particle.style.top = `${window.innerHeight - 200}px`;
    particle.style.background = `hsl(${Math.random() * 60 + 170}, 100%, 60%)`;
    elements.particles.appendChild(particle);
    
    setTimeout(() => particle.remove(), 3000);
}

// Start
init();
