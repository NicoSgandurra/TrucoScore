const state = {
    nosotros: 0,
    ellos: 0,
    nosotrosName: 'NOSOTROS',
    ellosName: 'ELLOS',
    maxScore: 30, // Default
    gameStarted: false
};

const elements = {
    nosotros: {
        area: document.getElementById('nosotros-area'),
        score: document.getElementById('score-nosotros'),
        dots: document.getElementById('dots-nosotros'),
        status: document.getElementById('nosotros-status'),
        name: document.getElementById('name-nosotros')
    },
    ellos: {
        area: document.getElementById('ellos-area'),
        score: document.getElementById('score-ellos'),
        dots: document.getElementById('dots-ellos'),
        status: document.getElementById('ellos-status'),
        name: document.getElementById('name-ellos')
    },
    resetBtn: document.getElementById('reset-btn'),

    // Modals
    setupModal: document.getElementById('setup-modal'),
    winnerModal: document.getElementById('winner-modal'),
    resetModal: document.getElementById('reset-modal'),

    winnerText: document.getElementById('winner-team'),
    newGameBtn: document.getElementById('new-game-btn'),
    modeBtns: document.querySelectorAll('.mode-btn'),

    // Reset Modal Buttons
    cancelResetBtn: document.getElementById('cancel-reset-btn'),
    confirmResetBtn: document.getElementById('confirm-reset-btn')
};

// Simple Audio Synth
const audioCtx = new (window.AudioContext || window.webkitAudioContext)();

function playTone(freq = 600, type = 'sine', duration = 0.05) {
    if (audioCtx.state === 'suspended') audioCtx.resume();

    const osc = audioCtx.createOscillator();
    const gainNode = audioCtx.createGain();

    osc.type = type;
    osc.frequency.setValueAtTime(freq, audioCtx.currentTime);

    gainNode.gain.setValueAtTime(0.1, audioCtx.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + duration);

    osc.connect(gainNode);
    gainNode.connect(audioCtx.destination);

    osc.start();
    osc.stop(audioCtx.currentTime + duration);
}

function playClickSound(type = 'add') {
    if (type === 'add') {
        playTone(300, 'triangle', 0.05); // "Tac" low
    } else {
        // "Double Tac" for remove
        playTone(200, 'triangle', 0.05);
        setTimeout(() => playTone(150, 'triangle', 0.05), 100);
    }
}

function init() {
    loadState();

    if (!state.gameStarted) {
        showSetup(false);
    } else {
        render();
        elements.setupModal.classList.add('hidden');
    }

    elements.modeBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            const limit = parseInt(btn.dataset.limit);
            startGame(limit);
        });
    });

    elements.resetBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        toggleResetModal(true);
    });

    elements.cancelResetBtn.addEventListener('click', () => {
        toggleResetModal(false);
    });

    elements.confirmResetBtn.addEventListener('click', () => {
        toggleResetModal(false);
        showSetup(true);
    });

    elements.newGameBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        console.log('New Game Clicked'); // Debug
        showSetup(true);
    });

    setupInteraction(elements.nosotros.area, 'nosotros');
    setupInteraction(elements.ellos.area, 'ellos');

    setupNameEditing('nosotros');
    setupNameEditing('ellos');
}

function loadState() {
    try {
        const saved = localStorage.getItem('trucoState');
        if (saved) {
            const parsed = JSON.parse(saved);
            Object.assign(state, parsed);
        }
    } catch (e) {
        console.error('Error loading state', e);
    }
}

function saveState() {
    localStorage.setItem('trucoState', JSON.stringify(state));
}

function toggleResetModal(show) {
    if (show) {
        elements.resetModal.classList.remove('hidden', 'pointer-events-none');
        requestAnimationFrame(() => elements.resetModal.classList.remove('opacity-0'));
    } else {
        elements.resetModal.classList.add('opacity-0', 'pointer-events-none');
        setTimeout(() => elements.resetModal.classList.add('hidden'), 200);
    }
}

function showSetup(resetNames = false) {
    state.gameStarted = false;

    if (resetNames) {
        state.nosotrosName = 'NOSOTROS';
        state.ellosName = 'ELLOS';
    }

    saveState();

    elements.setupModal.classList.remove('hidden');

    // Immediate Hide for Winner Modal
    elements.winnerModal.classList.add('hidden', 'pointer-events-none', 'opacity-0');
    elements.winnerModal.classList.remove('flex');

    elements.resetModal.classList.add('hidden', 'opacity-0', 'pointer-events-none');

    updateScore('nosotros', 0, true);
    updateScore('ellos', 0, true);
    render();
}

function startGame(limit) {
    // Resume audio context on first user interaction if suspended
    if (audioCtx.state === 'suspended') audioCtx.resume();

    state.maxScore = limit;
    state.gameStarted = true;
    saveState();

    elements.setupModal.classList.add('hidden');

    updateScore('nosotros', 0, true);
    updateScore('ellos', 0, true);

    render();
}

function setupInteraction(element, team) {
    let preventClick = false;
    let pressTimer = null;
    let repeatInterval = null;
    const LONG_PRESS_DURATION = 500; // Slightly faster to beat native menu
    const REPEAT_INTERVAL_DURATION = 300;

    const cancelPress = () => {
        if (pressTimer) {
            clearTimeout(pressTimer);
            pressTimer = null;
        }
        if (repeatInterval) {
            clearInterval(repeatInterval);
            repeatInterval = null;
        }
    };

    const subtract = () => {
        updateScore(team, state[team] - 1);
        if (navigator.vibrate) navigator.vibrate([50]);
        playClickSound('sub');
    };

    const startPress = (e) => {
        if (elements[team].name.contains(e.target)) return;
        if (!state.gameStarted) return;

        if (pressTimer || repeatInterval) return;

        pressTimer = setTimeout(() => {
            preventClick = true;
            subtract();
            repeatInterval = setInterval(subtract, REPEAT_INTERVAL_DURATION);
        }, LONG_PRESS_DURATION);
    };

    // TOUCH & MOUSE DOWN -> Start Timer
    element.addEventListener('touchstart', startPress, { passive: true });
    element.addEventListener('mousedown', startPress);

    // CANCEL EVENTS -> Stop Timer
    element.addEventListener('touchend', cancelPress);
    element.addEventListener('mouseup', cancelPress);
    element.addEventListener('mouseleave', cancelPress);
    element.addEventListener('touchcancel', cancelPress); // Safety

    // CLICK -> Add point
    element.addEventListener('click', (e) => {
        if (elements[team].name.contains(e.target)) return;
        if (!state.gameStarted) return;

        if (preventClick) {
            preventClick = false;
            return;
        }

        updateScore(team, state[team] + 1);
        if (navigator.vibrate) navigator.vibrate(50);
        playClickSound('add');
    });

    // CONTEXT MENU
    element.addEventListener('contextmenu', (e) => {
        e.preventDefault();
        if (elements[team].name.contains(e.target)) return;
        if (!state.gameStarted) return;

        // If REPEAT loop is already running, we are good.
        if (preventClick) return;

        // If contextmenu fired BEFORE our timer (common on Android):
        // We cancel the pending start timer and manually ENTER the loop.
        if (pressTimer) {
            clearTimeout(pressTimer);
            pressTimer = null;
        }

        preventClick = true;
        subtract();
        repeatInterval = setInterval(subtract, REPEAT_INTERVAL_DURATION);
    });
}

function setupNameEditing(team) {
    const el = elements[team].name;
    el.contentEditable = true;
    el.spellcheck = false;

    el.addEventListener('focus', () => {
        const range = document.createRange();
        range.selectNodeContents(el);
        const sel = window.getSelection();
        sel.removeAllRanges();
        sel.addRange(range);
    });

    el.addEventListener('blur', () => {
        const text = el.textContent.trim().toUpperCase();
        state[`${team}Name`] = text || (team === 'nosotros' ? 'NOSOTROS' : 'ELLOS');
        saveState();
        render();
    });

    el.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            el.blur();
        }
    });
}

function updateScore(team, newVal, force = false) {
    if (!force && !state.gameStarted) return;

    if (newVal < 0) newVal = 0;
    if (newVal > state.maxScore) newVal = state.maxScore;

    if (newVal === state[team] && !force) return;

    state[team] = newVal;
    saveState();

    if (!force) {
        const scoreEl = elements[team].score;
        scoreEl.classList.remove('pop-anim');
        void scoreEl.offsetWidth;
        scoreEl.classList.add('pop-anim');
    }

    renderTeam(team);
    checkWin();
}

function checkWin() {
    if (state.nosotros >= state.maxScore) showWinner(state.nosotrosName);
    else if (state.ellos >= state.maxScore) showWinner(state.ellosName);
}

function showWinner(winnerName) {
    state.gameStarted = false;
    saveState();

    elements.winnerText.textContent = winnerName;
    elements.winnerModal.classList.remove('hidden', 'pointer-events-none', 'opacity-0');
    elements.winnerModal.classList.add('flex');

    // Ensure it's visible immediately
    elements.winnerModal.style.pointerEvents = 'auto'; // Force style just in case

    if (navigator.vibrate) navigator.vibrate([100, 50, 100, 50, 100]);
}

function render() {
    renderTeam('nosotros');
    renderTeam('ellos');
}

function renderTeam(team) {
    elements[team].score.textContent = state[team];

    if (document.activeElement !== elements[team].name) {
        elements[team].name.textContent = state[`${team}Name`];
    }

    const statusEl = elements[team].status;
    if (state.maxScore === 30) {
        statusEl.classList.remove('hidden');
        if (state[team] >= 15) {
            statusEl.textContent = 'Buenas';
            statusEl.classList.add('text-slate-800');
            statusEl.classList.remove('text-slate-700/40');
        } else {
            statusEl.textContent = 'Malas';
            statusEl.classList.remove('text-slate-800');
            statusEl.classList.add('text-slate-700/40');
        }
    } else {
        statusEl.classList.add('hidden');
    }

    const dotsContainer = elements[team].dots;
    dotsContainer.innerHTML = '';

    const score = state[team];
    let pointsRemaining = score;

    while (pointsRemaining > 0) {
        let n = Math.min(pointsRemaining, 5);
        dotsContainer.appendChild(createDiceGroup(n));
        pointsRemaining -= n;
    }
}

function createDiceGroup(filledCount) {
    const group = document.createElement('div');
    group.className = 'dot-group';

    for (let i = 1; i <= 5; i++) {
        const dot = document.createElement('div');
        dot.className = 'dot';
        if (i <= filledCount) {
            dot.classList.add('active');
        }
        group.appendChild(dot);
    }
    return group;
}

init();
