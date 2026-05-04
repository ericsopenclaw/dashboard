// Focus Flow - Ambient Timer for Deep Work

class FocusFlow {
    constructor() {
        // Timer state
        this.totalSeconds = 25 * 60;
        this.remainingSeconds = this.totalSeconds;
        this.isRunning = false;
        this.timerInterval = null;
        
        // Audio context for generating ambient sounds
        this.audioContext = null;
        this.activeSounds = new Map();
        
        // Stats
        this.stats = this.loadStats();
        
        // DOM elements
        this.elements = {
            minutes: document.getElementById('minutes'),
            seconds: document.getElementById('seconds'),
            startBtn: document.getElementById('startBtn'),
            pauseBtn: document.getElementById('pauseBtn'),
            resetBtn: document.getElementById('resetBtn'),
            progress: document.querySelector('.timer-progress'),
            timerRing: document.querySelector('.timer-ring'),
            presets: document.querySelectorAll('.preset'),
            soundCards: document.querySelectorAll('.sound-card'),
            notification: document.getElementById('notificationSound'),
            sessionsCompleted: document.getElementById('sessionsCompleted'),
            totalMinutes: document.getElementById('totalMinutes'),
            currentStreak: document.getElementById('currentStreak')
        };
        
        // Circle circumference for progress
        this.circumference = 2 * Math.PI * 90;
        this.elements.progress.style.strokeDasharray = this.circumference;
        
        this.init();
    }
    
    init() {
        this.bindEvents();
        this.updateDisplay();
        this.updateStats();
        this.checkStreak();
    }
    
    bindEvents() {
        // Timer controls
        this.elements.startBtn.addEventListener('click', () => this.start());
        this.elements.pauseBtn.addEventListener('click', () => this.pause());
        this.elements.resetBtn.addEventListener('click', () => this.reset());
        
        // Presets
        this.elements.presets.forEach(preset => {
            preset.addEventListener('click', () => {
                const minutes = parseInt(preset.dataset.minutes);
                this.setDuration(minutes);
                
                // Update active state
                this.elements.presets.forEach(p => p.classList.remove('active'));
                preset.classList.add('active');
            });
        });
        
        // Sound cards
        this.elements.soundCards.forEach(card => {
            card.addEventListener('click', (e) => {
                // Don't toggle if clicking on slider
                if (e.target.classList.contains('volume-slider')) return;
                this.toggleSound(card);
            });
            
            const slider = card.querySelector('.volume-slider');
            slider.addEventListener('input', (e) => {
                e.stopPropagation();
                this.updateVolume(card, e.target.value);
            });
        });
        
        // Keyboard shortcuts
        document.addEventListener('keydown', (e) => {
            if (e.code === 'Space') {
                e.preventDefault();
                this.isRunning ? this.pause() : this.start();
            } else if (e.code === 'KeyR') {
                this.reset();
            }
        });
        
        // Visibility change - pause sounds when tab is hidden (optional)
        document.addEventListener('visibilitychange', () => {
            // Keep timer running in background, just manage audio context
            if (document.hidden && this.audioContext) {
                // Sounds continue - this is actually desired for a focus app
            }
        });
    }
    
    setDuration(minutes) {
        if (this.isRunning) return;
        
        this.totalSeconds = minutes * 60;
        this.remainingSeconds = this.totalSeconds;
        this.updateDisplay();
    }
    
    start() {
        if (this.isRunning) return;
        
        this.isRunning = true;
        document.body.classList.add('timer-running');
        
        this.elements.startBtn.disabled = true;
        this.elements.pauseBtn.disabled = false;
        
        this.timerInterval = setInterval(() => this.tick(), 1000);
    }
    
    pause() {
        if (!this.isRunning) return;
        
        this.isRunning = false;
        document.body.classList.remove('timer-running');
        
        this.elements.startBtn.disabled = false;
        this.elements.pauseBtn.disabled = true;
        
        clearInterval(this.timerInterval);
    }
    
    reset() {
        this.pause();
        this.remainingSeconds = this.totalSeconds;
        this.updateDisplay();
        this.elements.timerRing.classList.remove('completed');
    }
    
    tick() {
        if (this.remainingSeconds > 0) {
            this.remainingSeconds--;
            this.updateDisplay();
        } else {
            this.complete();
        }
    }
    
    complete() {
        this.pause();
        this.elements.timerRing.classList.add('completed');
        
        // Play notification
        this.playNotification();
        
        // Update stats
        const minutesCompleted = Math.round(this.totalSeconds / 60);
        this.stats.sessionsToday++;
        this.stats.minutesToday += minutesCompleted;
        this.stats.lastSessionDate = new Date().toDateString();
        this.saveStats();
        this.updateStats();
        
        // Browser notification
        this.showBrowserNotification();
        
        // Reset for next session
        setTimeout(() => {
            this.reset();
        }, 3000);
    }
    
    updateDisplay() {
        const mins = Math.floor(this.remainingSeconds / 60);
        const secs = this.remainingSeconds % 60;
        
        this.elements.minutes.textContent = mins.toString().padStart(2, '0');
        this.elements.seconds.textContent = secs.toString().padStart(2, '0');
        
        // Update progress ring
        const progress = (this.totalSeconds - this.remainingSeconds) / this.totalSeconds;
        const offset = this.circumference * (1 - progress);
        this.elements.progress.style.strokeDashoffset = offset;
        
        // Update page title
        document.title = `${mins}:${secs.toString().padStart(2, '0')} - Focus Flow`;
    }
    
    // ===== Ambient Sound System =====
    
    initAudioContext() {
        if (!this.audioContext) {
            this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
        }
        if (this.audioContext.state === 'suspended') {
            this.audioContext.resume();
        }
    }
    
    toggleSound(card) {
        this.initAudioContext();
        
        const soundType = card.dataset.sound;
        const slider = card.querySelector('.volume-slider');
        const volume = slider.value / 100;
        
        if (card.classList.contains('active')) {
            // Stop sound
            this.stopSound(soundType);
            card.classList.remove('active');
        } else {
            // Start sound
            this.startSound(soundType, volume);
            card.classList.add('active');
        }
    }
    
    startSound(type, volume) {
        const ctx = this.audioContext;
        const soundConfig = this.getSoundConfig(type);
        
        // Create nodes
        const gainNode = ctx.createGain();
        gainNode.gain.value = volume * 0.5; // Scale down overall volume
        gainNode.connect(ctx.destination);
        
        // Generate the sound based on type
        const sources = [];
        
        if (soundConfig.noise) {
            // Create noise-based sounds
            const bufferSize = 2 * ctx.sampleRate;
            const noiseBuffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
            const output = noiseBuffer.getChannelData(0);
            
            for (let i = 0; i < bufferSize; i++) {
                output[i] = Math.random() * 2 - 1;
            }
            
            const noiseNode = ctx.createBufferSource();
            noiseNode.buffer = noiseBuffer;
            noiseNode.loop = true;
            
            // Apply filter for different sound characters
            const filter = ctx.createBiquadFilter();
            filter.type = soundConfig.filterType || 'lowpass';
            filter.frequency.value = soundConfig.filterFreq || 1000;
            filter.Q.value = soundConfig.filterQ || 1;
            
            noiseNode.connect(filter);
            filter.connect(gainNode);
            noiseNode.start();
            
            sources.push(noiseNode);
        }
        
        if (soundConfig.oscillators) {
            // Create oscillator-based sounds (for things like wind, fire crackling)
            soundConfig.oscillators.forEach(osc => {
                const oscillator = ctx.createOscillator();
                oscillator.type = osc.type || 'sine';
                oscillator.frequency.value = osc.freq || 100;
                
                const oscGain = ctx.createGain();
                oscGain.gain.value = osc.volume || 0.1;
                
                // Add LFO for natural variation
                if (osc.lfo) {
                    const lfo = ctx.createOscillator();
                    const lfoGain = ctx.createGain();
                    lfo.frequency.value = osc.lfo.rate || 0.5;
                    lfoGain.gain.value = osc.lfo.depth || 50;
                    lfo.connect(lfoGain);
                    lfoGain.connect(oscillator.frequency);
                    lfo.start();
                    sources.push(lfo);
                }
                
                oscillator.connect(oscGain);
                oscGain.connect(gainNode);
                oscillator.start();
                
                sources.push(oscillator);
            });
        }
        
        // Store for later control
        this.activeSounds.set(type, {
            gainNode,
            sources,
            volume
        });
    }
    
    stopSound(type) {
        const sound = this.activeSounds.get(type);
        if (sound) {
            // Fade out
            const now = this.audioContext.currentTime;
            sound.gainNode.gain.linearRampToValueAtTime(0, now + 0.3);
            
            // Stop sources after fade
            setTimeout(() => {
                sound.sources.forEach(source => {
                    try {
                        source.stop();
                    } catch (e) {
                        // Source may already be stopped
                    }
                });
            }, 400);
            
            this.activeSounds.delete(type);
        }
    }
    
    updateVolume(card, value) {
        const type = card.dataset.sound;
        const sound = this.activeSounds.get(type);
        
        if (sound) {
            sound.volume = value / 100;
            sound.gainNode.gain.value = sound.volume * 0.5;
        }
    }
    
    getSoundConfig(type) {
        const configs = {
            rain: {
                noise: true,
                filterType: 'lowpass',
                filterFreq: 2000,
                filterQ: 0.5
            },
            thunder: {
                noise: true,
                filterType: 'lowpass',
                filterFreq: 400,
                filterQ: 2,
                oscillators: [
                    { type: 'sine', freq: 50, volume: 0.15, lfo: { rate: 0.1, depth: 30 } }
                ]
            },
            forest: {
                noise: true,
                filterType: 'bandpass',
                filterFreq: 3000,
                filterQ: 0.8,
                oscillators: [
                    { type: 'sine', freq: 1200, volume: 0.02, lfo: { rate: 3, depth: 400 } },
                    { type: 'sine', freq: 2400, volume: 0.01, lfo: { rate: 4, depth: 600 } }
                ]
            },
            ocean: {
                noise: true,
                filterType: 'lowpass',
                filterFreq: 800,
                filterQ: 1,
                oscillators: [
                    { type: 'sine', freq: 0.15, volume: 0.3, lfo: { rate: 0.08, depth: 0.05 } }
                ]
            },
            fire: {
                noise: true,
                filterType: 'bandpass',
                filterFreq: 500,
                filterQ: 0.5,
                oscillators: [
                    { type: 'sawtooth', freq: 80, volume: 0.03, lfo: { rate: 8, depth: 40 } }
                ]
            },
            cafe: {
                noise: true,
                filterType: 'bandpass',
                filterFreq: 1500,
                filterQ: 0.3,
                oscillators: [
                    { type: 'sine', freq: 300, volume: 0.02, lfo: { rate: 0.5, depth: 100 } }
                ]
            },
            wind: {
                noise: true,
                filterType: 'lowpass',
                filterFreq: 600,
                filterQ: 2,
                oscillators: [
                    { type: 'sine', freq: 150, volume: 0.1, lfo: { rate: 0.2, depth: 80 } }
                ]
            },
            birds: {
                noise: true,
                filterType: 'highpass',
                filterFreq: 2000,
                filterQ: 0.5,
                oscillators: [
                    { type: 'sine', freq: 2000, volume: 0.03, lfo: { rate: 6, depth: 800 } },
                    { type: 'sine', freq: 3000, volume: 0.02, lfo: { rate: 8, depth: 1000 } }
                ]
            }
        };
        
        return configs[type] || configs.rain;
    }
    
    // ===== Notifications =====
    
    playNotification() {
        try {
            this.elements.notification.currentTime = 0;
            this.elements.notification.play();
        } catch (e) {
            console.log('Could not play notification sound');
        }
    }
    
    showBrowserNotification() {
        if ('Notification' in window && Notification.permission === 'granted') {
            new Notification('Focus Session Complete! 🎉', {
                body: `Great work! You focused for ${Math.round(this.totalSeconds / 60)} minutes.`,
                icon: 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><text y=".9em" font-size="90">🎧</text></svg>'
            });
        } else if ('Notification' in window && Notification.permission !== 'denied') {
            Notification.requestPermission();
        }
    }
    
    // ===== Stats =====
    
    loadStats() {
        const saved = localStorage.getItem('focusflow-stats');
        const today = new Date().toDateString();
        
        if (saved) {
            const stats = JSON.parse(saved);
            // Reset daily stats if it's a new day
            if (stats.lastSessionDate !== today) {
                stats.sessionsToday = 0;
                stats.minutesToday = 0;
            }
            return stats;
        }
        
        return {
            sessionsToday: 0,
            minutesToday: 0,
            streak: 0,
            lastSessionDate: null
        };
    }
    
    saveStats() {
        localStorage.setItem('focusflow-stats', JSON.stringify(this.stats));
    }
    
    updateStats() {
        this.elements.sessionsCompleted.textContent = this.stats.sessionsToday;
        this.elements.totalMinutes.textContent = this.stats.minutesToday;
        this.elements.currentStreak.textContent = this.stats.streak;
    }
    
    checkStreak() {
        const today = new Date();
        const yesterday = new Date(today);
        yesterday.setDate(yesterday.getDate() - 1);
        
        if (this.stats.lastSessionDate === yesterday.toDateString()) {
            // Continued streak from yesterday
            if (this.stats.sessionsToday === 0) {
                // New day, streak continues
            }
        } else if (this.stats.lastSessionDate === today.toDateString()) {
            // Same day, streak maintained
        } else if (this.stats.lastSessionDate) {
            // Streak broken
            this.stats.streak = 0;
        }
        
        // Increment streak when first session of day completes
        if (this.stats.sessionsToday === 0 && this.stats.lastSessionDate !== today.toDateString()) {
            // Will increment on first completion
        }
        
        // If first session of a new day, increment streak
        if (this.stats.sessionsToday > 0 && this.stats.lastSessionDate === today.toDateString()) {
            const lastDate = new Date(this.stats.lastSessionDate);
            const diffDays = Math.floor((today - lastDate) / (1000 * 60 * 60 * 24));
            
            if (diffDays === 0 && !this.stats.streakUpdatedToday) {
                this.stats.streak++;
                this.stats.streakUpdatedToday = true;
                this.saveStats();
            }
        }
        
        this.updateStats();
    }
}

// Initialize app when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    window.focusFlow = new FocusFlow();
    
    // Request notification permission on first interaction
    document.body.addEventListener('click', () => {
        if ('Notification' in window && Notification.permission === 'default') {
            Notification.requestPermission();
        }
    }, { once: true });
});
