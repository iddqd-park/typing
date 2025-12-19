const WORDS = [
    "국룰", "오마카세", "수제", "오픈런", "호캉스", "소확행", "꿀팁", "성지순례",
    "인생샷", "챌린지", "한정판", "콜라보", "인생템", "럭셔리", "감성", "핫플",
    "팝업", "바디프로필", "글램핑", "오운완", "브이로그", "벼락거지", "어메니티",
    "돈쭐", "꾸안꾸", "내돈내산", "뷰맛집", "영앤리치", "스몰웨딩", "브라이덜샤워",
    "태교여행", "하객룩", "얼죽아", "먹킷리스트", "하차감", "스몰럭셔리", "초품아",
    "영끌", "갓생", "왓츠인마이백", "가심비", "워라밸", "상급지", "불멍",
    "경리단길", "망리단길", "송리단길", "황리단길", "행리단길",
    "골린이", "주린이", "헬린이", "캠린이",
    "홈마카세", "한우카세", "이모카세",
    "스세권", "붕세권", "숲세권", "학세권", "몰세권",
    "이모슐랭", "돈슐랭", "면슐랭", "빵슐랭",
    "빵지순례", "반려식물", "반려돌", "반려가전"
];

const Game = {
    activeWords: [], // { id, word, element, x, y, speed }
    score: 0,
    isPlaying: false,
    spawnTimer: null,
    gameLoop: null,
    spawnRate: 1500, // ms
    fallSpeedBase: 1.0, // pixels per frame (approx)
    lastTime: 0,
    containerHeight: 0,
    groundY: 0,

    // Audio Context
    audioCtx: null,

    init: function () {
        this.cacheDOM();
        this.bindEvents();
        this.resize();
        window.addEventListener('resize', () => this.resize());
    },

    cacheDOM: function () {
        this.$container = $('#game-container');
        this.$input = $('#word-input');
        this.$score = $('#score');
        this.$finalScore = $('#final-score');
        this.$startScreen = $('#start-screen');
        this.$gameOverScreen = $('#game-over-screen');
        this.$ground = $('#ground-line');
    },

    bindEvents: function () {
        $('#btn-start').on('click', () => this.startGame());
        $('#btn-restart').on('click', () => {
            this.$gameOverScreen.removeClass('d-flex').addClass('d-none');
            this.startGame();
        });

        this.$input.on('input', (e) => {
            const val = this.$input.val().trim();
            // Optional: checking on every input could be interesting for partial matches or "combos"
            // But requirement says "Enter" isn't explicitly mentioned, but usually typing games clear on match immediately or on enter.
            // Let's try immediate match first.
            this.checkInput(val);
        });

        // Prevent form submit if wrapped in form, or just enter key behavior
        this.$input.on('keydown', (e) => {
            if (e.key === 'Enter') {
                // If enter is pressed and no match, clear input and maybe penalty?
                // For now just clear input to let user retry fast
                const val = this.$input.val().trim();
                if (!this.checkMatch(val)) {
                    this.playBeep(150, 'sawtooth', 0.1); // Error buzzer
                    this.shakeInput();
                }
                this.$input.val('');
            }
        });
    },

    resize: function () {
        this.containerHeight = this.$container.height();
        this.groundY = this.containerHeight; // Words die when they hit bottom of container
        // Actually, ground line is visual, let's match it.
        // CSS defines #game-container height as 80%. 
        // We will treat the bottom of #game-container as the death line.
    },

    initAudio: function () {
        if (!this.audioCtx) {
            this.audioCtx = new (window.AudioContext || window.webkitAudioContext)();
        }
        if (this.audioCtx.state === 'suspended') {
            this.audioCtx.resume();
        }
    },

    playBeep: function (freq = 440, type = 'sine', duration = 0.1) {
        if (!this.audioCtx) return;

        const osc = this.audioCtx.createOscillator();
        const gain = this.audioCtx.createGain();

        osc.type = type;
        osc.frequency.setValueAtTime(freq, this.audioCtx.currentTime);

        gain.gain.setValueAtTime(0.1, this.audioCtx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, this.audioCtx.currentTime + duration);

        osc.connect(gain);
        gain.connect(this.audioCtx.destination);

        osc.start();
        osc.stop(this.audioCtx.currentTime + duration);
    },

    startGame: function () {
        this.initAudio();
        this.isPlaying = true;
        this.score = 0;
        this.activeWords = [];
        this.$container.empty();
        this.$score.text(0);
        this.$startScreen.addClass('d-none').removeClass('d-flex');
        this.$input.val('').focus();

        this.spawnRate = 2000;
        this.fallSpeedBase = 1.0;

        this.lastTime = performance.now();
        this.startLoops();
    },

    startLoops: function () {
        // Spawn Loop
        const spawnParams = () => {
            if (!this.isPlaying) return;
            this.spawnWord();
            // Accelerate game over time
            if (this.spawnRate > 500) this.spawnRate -= 20;
            if (this.fallSpeedBase < 5.0) this.fallSpeedBase += 0.02;

            this.spawnTimer = setTimeout(spawnParams, this.spawnRate);
        };
        spawnParams();

        // Animation Loop
        const animLoop = (time) => {
            if (!this.isPlaying) return;
            const delta = time - this.lastTime;
            this.lastTime = time;

            this.update(delta);
            this.gameLoop = requestAnimationFrame(animLoop);
        };
        this.gameLoop = requestAnimationFrame(animLoop);
    },

    spawnWord: function () {
        const wordText = WORDS[Math.floor(Math.random() * WORDS.length)];
        const wordId = Date.now() + Math.random();

        // Random X position (10% to 90%)
        const xPos = 10 + Math.random() * 80;

        const $el = $('<div>')
            .addClass('word-entity')
            .text(wordText)
            .css({ left: xPos + '%', top: '-30px' });

        this.$container.append($el);

        this.activeWords.push({
            id: wordId,
            word: wordText,
            element: $el,
            x: xPos,
            y: -30,
            speed: this.fallSpeedBase * (0.8 + Math.random() * 0.4) // slight speed variance
        });
    },

    update: function (delta) { // delta is elapsed ms since last frame
        // Approx 60fps normalization
        // If delta is 16ms, factor is 1. If delta is 32ms, factor is 2.
        const factor = delta / 16.0;

        for (let i = this.activeWords.length - 1; i >= 0; i--) {
            let entity = this.activeWords[i];
            entity.y += entity.speed * factor;
            entity.element.css('top', entity.y + 'px');

            // Collision Check
            if (entity.y > this.containerHeight) {
                this.gameOver();
            }
        }
    },

    checkInput: function (val) {
        if (!val) return;

        // Find exact match
        const index = this.activeWords.findIndex(w => w.word === val);
        if (index !== -1) {
            // Match found!
            this.destroyWord(index);
            this.$input.val(''); // Clear input automatically on valid match
        }
    },

    checkMatch: function (val) {
        // For enter key usage - double check if there's a match I missed or just return false
        return this.activeWords.some(w => w.word === val);
    },

    destroyWord: function (index) {
        const entity = this.activeWords[index];
        const $el = entity.element;

        // Visuals
        this.createExplosion(entity.x, entity.y, entity.word);
        $el.remove();

        // Data
        this.activeWords.splice(index, 1);

        // Score
        this.score += 10;
        this.$score.text(this.score);

        // Sound
        this.playBeep(600 + Math.random() * 200, 'sine', 0.1);
        this.playBeep(1200, 'triangle', 0.05); // High pitch pop
    },

    createExplosion: function (x, y, text) {
        const $exp = $('<div>')
            .addClass('explosion')
            .text(text) // Or 'POP!'
            .css({
                left: x + '%',
                top: y + 'px',
                color: '#ffff00'
            });
        this.$container.append($exp);
        setTimeout(() => $exp.remove(), 500);
    },

    shakeInput: function () {
        this.$input.addClass('bg-danger');
        setTimeout(() => this.$input.removeClass('bg-danger'), 200);
    },

    gameOver: function () {
        this.isPlaying = false;
        cancelAnimationFrame(this.gameLoop);
        clearTimeout(this.spawnTimer);

        this.activeWords.forEach(w => w.element.remove());
        this.activeWords = [];

        this.$finalScore.text(this.score);
        this.$gameOverScreen.removeClass('d-none').addClass('d-flex');

        // Sad sound
        this.playBeep(200, 'sawtooth', 0.5);
    }
};

$(document).ready(() => {
    Game.init();
});
