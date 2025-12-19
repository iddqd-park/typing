const WORDS = [
    { word: "국룰", desc: "국민 룰 (보편적 규칙)" },
    { word: "오마카세", desc: "주방장 특선 요리" },
    { word: "수제", desc: "손으로 직접 만듦" },
    { word: "오픈런", desc: "개점 전 대기 질주" },
    { word: "호캉스", desc: "호텔 배캉스" },
    { word: "소확행", desc: "소소하지만 확실한 행복" },
    { word: "꿀팁", desc: "유용한 정보" },
    { word: "성지순례", desc: "인기 장소 방문" },
    { word: "인생샷", desc: "인생 최고의 사진" },
    { word: "챌린지", desc: "도전 및 참여 유행" },
    { word: "한정판", desc: "제한된 수량 판매" },
    { word: "콜라보", desc: "브랜드간 협업" },
    { word: "인생템", desc: "인생 최고의 아이템" },
    { word: "럭셔리", desc: "호화로운 사치" },
    { word: "감성", desc: "분위기 있는 느낌" },
    { word: "핫플", desc: "핫 플레이스 (인기 장소)" },
    { word: "팝업", desc: "단기간 운영 매장" },
    { word: "바디프로필", desc: "운동 후 몸매 사진" },
    { word: "글램핑", desc: "화려한 캠핑" },
    { word: "오운완", desc: "오늘 운동 완료" },
    { word: "브이로그", desc: "비디오+블로그 일상" },
    { word: "벼락거지", desc: "자산 격차 상대적 박탈감" },
    { word: "어메니티", desc: "호텔 편의 용품" },
    { word: "돈쭐", desc: "돈으로 혼내주기 (구매 응원)" },
    { word: "꾸안꾸", desc: "꾸민 듯 안 꾸민 듯" },
    { word: "내돈내산", desc: "내 돈 주고 내가 산" },
    { word: "뷰맛집", desc: "경치가 좋은 곳" },
    { word: "영앤리치", desc: "젊고 부유함" },
    { word: "스몰웨딩", desc: "소규모 결혼식" },
    { word: "브라이덜샤워", desc: "신부 파티" },
    { word: "태교여행", desc: "출산 전 여행" },
    { word: "하객룩", desc: "결혼식 하객 복장" },
    { word: "얼죽아", desc: "얼어 죽어도 아이스 아메리카노" },
    { word: "먹킷리스트", desc: "맛집 버킷리스트" },
    { word: "하차감", desc: "차에서 내릴 때의 시선" },
    { word: "스몰럭셔리", desc: "작은 사치품" },
    { word: "초품아", desc: "초등학교를 품은 아파트" },
    { word: "영끌", desc: "영혼까지 끌어모아 대출" },
    { word: "갓생", desc: "부지런하고 모범적인 삶" },
    { word: "왓츠인마이백", desc: "가방 속 소지품 공개" },
    { word: "가심비", desc: "가격 대비 심리적 만족" },
    { word: "워라밸", desc: "일과 삶의 균형" },
    { word: "상급지", desc: "부동산 상위 입지" },
    { word: "불멍", desc: "불 보며 멍때리기" },
    { word: "경리단길", desc: "이태원 명소 거리" },
    { word: "망리단길", desc: "망원동 거리" },
    { word: "송리단길", desc: "송파구 거리" },
    { word: "황리단길", desc: "경주 명소 거리" },
    { word: "행리단길", desc: "수원 행궁동 거리" },
    { word: "골린이", desc: "골프 초보" },
    { word: "주린이", desc: "주식 초보" },
    { word: "헬린이", desc: "헬스 초보" },
    { word: "캠린이", desc: "캠핑 초보" },
    { word: "홈마카세", desc: "집에서 즐기는 오마카세" },
    { word: "한우카세", desc: "한우 코스 요리" },
    { word: "이모카세", desc: "이모님 맘대로 안주" },
    { word: "스세권", desc: "스타벅스 인근" },
    { word: "붕세권", desc: "붕어빵 인근" },
    { word: "숲세권", desc: "숲 인근" },
    { word: "학세권", desc: "학원/학교 인근" },
    { word: "몰세권", desc: "쇼핑몰 인근" },
    { word: "이모슐랭", desc: "이모님 손맛 맛집" },
    { word: "돈슐랭", desc: "돈까스 맛집" },
    { word: "면슐랭", desc: "면요리 맛집" },
    { word: "빵슐랭", desc: "맛있는 빵집" },
    { word: "빵지순례", desc: "유명 빵집 순례" },
    { word: "반려식물", desc: "애착을 갖고 기르는 식물" },
    { word: "반려돌", desc: "애완 돌멩이" },
    { word: "반려가전", desc: "애착 가전제품" }
];

const Game = {
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
        this.$comboDisplay = $('#combo-display');
        this.$comboCount = $('#combo-count');
        this.$finalScore = $('#final-score');
        this.$resultComment = $('#result-comment');
        this.$startScreen = $('#start-screen');
        this.$gameOverScreen = $('#game-over-screen');
    },

    bindEvents: function () {
        $('#btn-start').on('click', () => this.startGame());
        $('#btn-restart').on('click', () => {
            this.$gameOverScreen.removeClass('d-flex').addClass('d-none');
            this.startGame();
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

        this.spawnRate = 2000;
        this.fallSpeedBase = 1.0;
        this.lastTime = performance.now();
        this.startLoops();
    },

    startLoops: function () {
        const spawnParams = () => {
            if (!this.isPlaying) return;
            this.spawnWord();
            if (this.spawnRate > 400) this.spawnRate -= 30; // Faster ramp up
            if (this.fallSpeedBase < 6.0) this.fallSpeedBase += 0.03;
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
        const wordObj = WORDS[Math.floor(Math.random() * WORDS.length)];
        const xPos = 5 + Math.random() * 80;
        const $el = $('<div>')
            .addClass('word-entity')
            .text(wordObj.word)
            .css({ left: xPos + '%', top: '-50px' });
        this.$container.append($el);
        this.activeWords.push({
            id: Date.now() + Math.random(),
            word: wordObj.word,
            desc: wordObj.desc,
            element: $el,
            x: xPos,
            y: -50,
            speed: this.fallSpeedBase * (0.9 + Math.random() * 0.4)
        });
    },

    update: function (delta) {
        const factor = delta / 16.0;
        for (let i = this.activeWords.length - 1; i >= 0; i--) {
            let entity = this.activeWords[i];
            entity.y += entity.speed * factor;
            entity.element.css('top', entity.y + 'px');
            if (entity.y > this.containerHeight) this.gameOver();
        }
    },

    checkInput: function (val) {
        if (!val) return;
        const index = this.activeWords.findIndex(w => w.word === val);
        if (index !== -1) {
            this.destroyWord(index);
            this.$input.val('');
        }
    },

    checkMatch: function (val) { return this.activeWords.some(w => w.word === val); },

    destroyWord: function (index) {
        const entity = this.activeWords[index];
        this.createExplosion(entity.x, entity.y, entity);
        this.spawnParticles(entity.x, entity.y); // VFX
        entity.element.remove();
        this.activeWords.splice(index, 1);

        this.combo++;
        this.score += 10 + (this.combo * 2); // Combo bonus
        this.updateScore();
        this.updateCombo();

        // Satisfying SFX
        this.playBeep(400 + (this.combo * 50), 'square', 0.1); // Pitch rises with combo
    },

    resetCombo: function () {
        if (this.combo > 5) {
            // Combo break sound
            this.playBeep(150, 'sawtooth', 0.3);
        }
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
        $exp.append($('<div>').addClass('exp-word').text(entity.word));
        $exp.append($('<div>').addClass('exp-desc').text(entity.desc));
        this.$container.append($exp);
        setTimeout(() => $exp.remove(), 1200);
    },

    spawnParticles: function (xPercent, yPx) {
        // Convert % to px for particle origin (rough approx)
        const xPx = (xPercent / 100) * this.$container.width();

        for (let i = 0; i < 15; i++) {
            const angle = Math.random() * Math.PI * 2;
            const velocity = 2 + Math.random() * 4;
            const tx = Math.cos(angle) * 50 * velocity;
            const ty = Math.sin(angle) * 50 * velocity;

            const $p = $('<div>').addClass('particle').css({
                left: xPx + 'px',
                top: yPx + 'px',
                background: Math.random() > 0.5 ? '#00ffff' : '#ff00ff' // Neon colors
            });

            this.$container.append($p);

            // Animate using Web Animations API or CSS transition
            $p.animate({
                left: `+=${tx}px`,
                top: `+=${ty}px`,
                opacity: 0
            }, 600, 'linear', function () { $(this).remove(); });
        }
    },

    shakeInput: function () {
        this.$input.parent().addClass('shake-anim'); // Add shake to wrapper usually
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

        // Witty comment
        let comment = "아직... 트렌드를 모르시네요.";
        if (this.score > 2000) comment = "인싸의 자질이 보입니다.";
        if (this.score > 5000) comment = "혹시... SNS 중독?";
        if (this.score > 10000) comment = "트렌드 그 자체이시군요!";

        this.$resultComment.text(comment);
        this.$gameOverScreen.removeClass('d-none').addClass('d-flex');

        this.playBeep(100, 'sawtooth', 1.0);
    }
};

$(document).ready(() => {
    Game.init();
});
