const Game = {
    currentPackage: null,
    activeWords: [],
    score: 0,
    combo: 0,
    isPlaying: false,
    spawnTimer: null,
    gameLoop: null,
    spawnRate: 1500,
    fallSpeedBase: 1.0,
    lastTime: 0,
    containerHeight: 0,
    containerWidth: 0,
    audioCtx: null,
    nextSpawnIndex: 0,

    init: function () {
        this.cacheDOM();
        this.bindEvents();
        this.renderStageList();
        this.resize();
        window.addEventListener('resize', () => this.resize());
    },

    cacheDOM: function () {
        this.$container = $('#game-container');
        this.$input = $('#word-input');
        this.$score = $('#score');
        this.$comboDisplay = $('#combo-display');
        this.$comboCount = $('#combo-count');
        this.$finalScore = $('#final-score');
        this.$resultComment = $('#result-comment');

        this.$stageSelectScreen = $('#stage-select-screen');
        this.$stageList = $('#stage-list');

        this.$startScreen = $('#start-screen');
        this.$selectedTitle = $('#selected-stage-title');
        this.$selectedDesc = $('#selected-stage-desc');

        this.$gameOverScreen = $('#game-over-screen');
        this.$stageName = $('#stage-name');
    },

    renderStageList: function () {
        this.$stageList.empty();
        Object.keys(PACKAGES).forEach(key => {
            const pkg = PACKAGES[key];
            const $card = $(`
                <div class="stage-card" data-key="${key}">
                    <div class="stage-badge">${pkg.badge}</div>
                    <h3>${pkg.title}</h3>
                    <p>${pkg.description}</p>
                </div>
            `);
            $card.on('click', () => this.selectStage(key));
            this.$stageList.append($card);
        });
    },

    selectStage: function (key) {
        this.currentPackage = PACKAGES[key];

        this.$stageSelectScreen.addClass('d-none').removeClass('d-flex');
        this.$startScreen.removeClass('d-none').addClass('d-flex');

        this.$selectedTitle.text(this.currentPackage.title);
        this.$selectedDesc.text(this.currentPackage.description);
        this.$stageName.text(this.currentPackage.title);

        this.fallSpeedBase = this.currentPackage.config.baseSpeed;
    },

    bindEvents: function () {
        $('#btn-start').on('click', () => this.startGame());
        $('#btn-back').on('click', () => {
            this.$startScreen.addClass('d-none').removeClass('d-flex');
            this.$stageSelectScreen.removeClass('d-none').addClass('d-flex');
        });

        $('#btn-restart').on('click', () => {
            this.$gameOverScreen.removeClass('d-flex').addClass('d-none');
            this.startGame();
        });

        $('#btn-home').on('click', () => {
            this.$gameOverScreen.removeClass('d-flex').addClass('d-none');
            this.$stageSelectScreen.removeClass('d-none').addClass('d-flex');
        });

        this.$input.on('input', (e) => this.checkInput(this.$input.val().trim()));
        this.$input.on('keydown', (e) => {
            if (e.key === 'Enter') {
                const val = this.$input.val().trim();
                if (!this.checkMatch(val)) {
                    this.resetCombo();
                    this.playBeep(100, 'sawtooth', 0.2);
                    this.shakeInput();
                }
                this.$input.val('');
            } else if (e.key === 'Escape') {
                this.$input.val('');
            }
        });
    },

    resize: function () {
        this.containerHeight = this.$container.height();
        this.containerWidth = this.$container.width();
    },

    initAudio: function () {
        if (!this.audioCtx) this.audioCtx = new (window.AudioContext || window.webkitAudioContext)();
        if (this.audioCtx.state === 'suspended') this.audioCtx.resume();
    },

    playBeep: function (freq, type = 'sine', duration = 0.1) {
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
        this.combo = 0;
        this.activeWords = [];
        this.$container.empty();
        this.updateScore();
        this.updateCombo();
        this.$startScreen.addClass('d-none').removeClass('d-flex');
        this.$input.val('').focus();

        // Load initial spawn rate from config, default to 2000
        this.spawnRate = this.currentPackage.config.spawnInterval || 2000;
        this.fallSpeedBase = this.currentPackage.config.baseSpeed;
        this.nextSpawnIndex = 0;

        this.lastTime = performance.now();
        this.startLoops();
    },

    startLoops: function () {
        const spawnParams = () => {
            if (!this.isPlaying) return;
            this.spawnWord();

            // Difficulty Progression: Speed up falling, reduce spawn time
            // Cap minimum spawn rate based on initial density (don't get too dense for long text)
            let minRate = 400;
            if ((this.currentPackage.config.spawnInterval || 2000) > 3000) {
                 minRate = 2000; // Keep heavy text packages relatively sparse
            }

            if (this.spawnRate > minRate) this.spawnRate -= 20;
            
            // Accelerate falling speed
            if (this.fallSpeedBase < 8.0) this.fallSpeedBase += 0.05;

            this.spawnTimer = setTimeout(spawnParams, this.spawnRate);
        };
        spawnParams();

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
        const dataArr = this.currentPackage.data;
        let wordObj;

        if (this.currentPackage.config.spawnOrder === 'sequential') {
            if (this.nextSpawnIndex >= dataArr.length) {
                this.nextSpawnIndex = 0;
            }
            wordObj = dataArr[this.nextSpawnIndex];
            this.nextSpawnIndex++;
        } else {
            wordObj = dataArr[Math.floor(Math.random() * dataArr.length)];
        }

        let xPos;
        if (wordObj.word.length > 30) {
            // Very long: small variance around center
            xPos = 40 + Math.random() * 20; // 40% ~ 60%
        } else if (wordObj.word.length > 20) {
            // Long: medium variance
            xPos = 30 + Math.random() * 40; // 30% ~ 70%
        } else {
            // Normal
            xPos = 10 + Math.random() * 80; // 10% ~ 90%
        }

        const $el = $('<div>')
            .addClass('word-entity')
            .text(wordObj.word)
            .css({ left: xPos + '%', top: '-100px' }); // Start above screen

        if (wordObj.word.length > 30) {
            $el.addClass('very-long-text');
        } else if (wordObj.word.length > 10) {
            $el.addClass('long-text');
        }

        this.$container.append($el);

        // --- Calculate Dimension for Physics ---
        // Force Reflow to get width? Or estimate?
        // Let's assume browser renders it. 
        // Note: 'transform: translateX(-50%)' is used in CSS.
        // So actual Left edge is xPos% - width/2.

        const pxWidth = $el.outerWidth();
        const pxHeight = $el.outerHeight();
        const widthPercent = (pxWidth / this.containerWidth) * 100;
        const heightPercent = (pxHeight / this.containerHeight) * 100;

        // Store entity
        this.activeWords.push({
            id: Date.now() + Math.random(),
            word: wordObj.word,
            desc: wordObj.desc,
            element: $el,
            x: xPos, // This is center X in % because of translateX(-50%)
            y: -20, // Initial Y percent (approx)
            yPx: -100, // Actual px for logic
            width: widthPercent,
            height: heightPercent,
            pxWidth: pxWidth,
            pxHeight: pxHeight,
            speed: this.fallSpeedBase * (0.9 + Math.random() * 0.2)
        });
    },

    // --- Physics Engine ---
    resolveCollisions: function () {
        if (this.activeWords.length < 2) return;

        // Update pixel positions first (Center X/Y)
        this.activeWords.forEach(w => {
            w.centerX = (w.x / 100) * this.containerWidth;
            w.centerY = w.yPx + (w.pxHeight / 2);
        });

        for (let i = 0; i < this.activeWords.length; i++) {
            for (let j = i + 1; j < this.activeWords.length; j++) {
                const a = this.activeWords[i];
                const b = this.activeWords[j];

                // Box A
                const aLeft = a.centerX - (a.pxWidth / 2);
                const aRight = a.centerX + (a.pxWidth / 2);
                const aTop = a.yPx;
                const aBottom = a.yPx + a.pxHeight;

                // Box B
                const bLeft = b.centerX - (b.pxWidth / 2);
                const bRight = b.centerX + (b.pxWidth / 2);
                const bTop = b.yPx;
                const bBottom = b.yPx + b.pxHeight;

                // Check overlap
                const overlapX = Math.min(aRight, bRight) - Math.max(aLeft, bLeft);
                const overlapY = Math.min(aBottom, bBottom) - Math.max(aTop, bTop);

                if (overlapX > 0 && overlapY > 0) {
                    // Collision!
                    // Determine push vector
                    let dx = b.centerX - a.centerX;
                    let dy = b.centerY - a.centerY;

                    // Normalize
                    let dist = Math.sqrt(dx * dx + dy * dy);
                    if (dist === 0) { dx = 0; dy = 1; dist = 1; }

                    const ndx = dx / dist;
                    const ndy = dy / dist;

                    const pushStrength = 3.0;

                    // Apple Force
                    const xPushPct = ((ndx * pushStrength) / this.containerWidth) * 100;
                    a.x -= xPushPct;
                    b.x += xPushPct;

                    const yPush = ndy * pushStrength;

                    a.yPx -= yPush;
                    b.yPx += yPush;
                }
            }
        }
    },

    update: function (delta) {
        const factor = delta / 16.0;

        // 1. Move Y
        for (let i = this.activeWords.length - 1; i >= 0; i--) {
            let entity = this.activeWords[i];

            // Convert speed to pixels roughly
            // 60FPS: speed is pixels/frame approx? No, speed * factor.
            // Let's assume speed is pixels/frame for now logic or adjust.
            // Previous logic: 'top' += speed * factor.
            // entity.y was pixels.

            entity.yPx += entity.speed * factor;

            if (entity.yPx > this.containerHeight) {
                this.gameOver();
                return;
            }
        }

        // 2. Resolve Collisions (Update X)
        this.resolveCollisions();

        // 3. Render & Boundary Check
        for (let i = 0; i < this.activeWords.length; i++) {
            let entity = this.activeWords[i];

            // Boundary Constraint (0 to 100%)
            // Since x is Center %, we need to ensure edges stay in.
            const halfWidthPct = (entity.pxWidth / 2 / this.containerWidth) * 100;

            if (entity.x < halfWidthPct) entity.x = halfWidthPct;
            if (entity.x > 100 - halfWidthPct) entity.x = 100 - halfWidthPct;

            entity.element.css({
                'top': entity.yPx + 'px',
                'left': entity.x + '%'
            });
        }
    },

    checkInput: function (val) {
        if (!val) return;
        const cleanInput = val.replace(/\s+/g, '');
        const index = this.activeWords.findIndex(w => w.word.replace(/\s+/g, '') === cleanInput);
        if (index !== -1) {
            this.destroyWord(index);
            this.$input.val('');
        }
    },

    checkMatch: function (val) {
        const cleanInput = val.replace(/\s+/g, '');
        return this.activeWords.some(w => w.word.replace(/\s+/g, '') === cleanInput);
    },

    destroyWord: function (index) {
        const entity = this.activeWords[index];
        this.createExplosion(entity.x, entity.yPx, entity); // Use yPx for explosion
        this.spawnParticles(entity.x, entity.yPx);
        entity.element.remove();
        this.activeWords.splice(index, 1);

        this.combo++;

        const base = 10;
        const scale = this.currentPackage.config.scoreScale;
        const lengthBonus = Math.max(1, entity.word.length * 0.5);
        const points = Math.floor((base * scale * lengthBonus) + (this.combo * 5));

        this.score += points;
        this.updateScore();
        this.updateCombo();

        this.playBeep(400 + (Math.min(this.combo, 20) * 50), 'square', 0.1);
    },

    resetCombo: function () {
        if (this.combo > 5) this.playBeep(150, 'sawtooth', 0.3);
        this.combo = 0;
        this.updateCombo();
    },

    updateScore: function () {
        this.$score.text(this.score.toLocaleString().padStart(6, '0'));
    },

    updateCombo: function () {
        this.$comboCount.text(this.combo);
        if (this.combo > 1) {
            this.$comboDisplay.removeClass('d-none').addClass('d-block');
        } else {
            this.$comboDisplay.removeClass('d-block').addClass('d-none');
        }
    },

    createExplosion: function (x, y, entity) {
        const $exp = $('<div>').addClass('explosion').css({ left: x + '%', top: y + 'px' });

        let wordClass = 'exp-word';
        if (entity.word.length > 20) wordClass += ' fs-6';
        else if (entity.word.length > 8) wordClass += ' fs-3';

        $exp.append($('<div>').addClass(wordClass).text(entity.word));
        $exp.append($('<div>').addClass('exp-desc').text(entity.desc));
        this.$container.append($exp);
        setTimeout(() => $exp.remove(), 1200);
    },

    spawnParticles: function (xPercent, yPx) {
        const xPx = (xPercent / 100) * this.$container.width();
        for (let i = 0; i < 15; i++) {
            const angle = Math.random() * Math.PI * 2;
            const velocity = 2 + Math.random() * 4;
            $('<div class="particle"></div>').css({
                left: xPx + 'px', top: yPx + 'px',
                background: Math.random() > 0.5 ? '#00ffff' : '#ff00ff'
            }).appendTo(this.$container).animate({
                left: `+=${Math.cos(angle) * 50 * velocity}px`,
                top: `+=${Math.sin(angle) * 50 * velocity}px`,
                opacity: 0
            }, 600, 'linear', function () { $(this).remove(); });
        }
    },

    shakeInput: function () {
        this.$input.parent().addClass('shake-anim');
        this.$input.addClass('bg-danger');
        setTimeout(() => {
            this.$input.removeClass('bg-danger');
            this.$input.parent().removeClass('shake-anim');
        }, 200);
    },

    gameOver: function () {
        this.isPlaying = false;
        cancelAnimationFrame(this.gameLoop);
        clearTimeout(this.spawnTimer);
        this.activeWords.forEach(w => w.element.remove());
        this.activeWords = [];

        this.$finalScore.text(this.score.toLocaleString());

        let comment = "더 노력하십시오.";
        if (this.score > 5000) comment = "훌륭한 키보드 워리어!";
        if (this.score > 20000) comment = "당신은 이미 전설입니다.";

        this.$resultComment.text(comment);
        this.$gameOverScreen.removeClass('d-none').addClass('d-flex');

        this.playBeep(100, 'sawtooth', 1.0);
    }
};

$(document).ready(() => Game.init());
