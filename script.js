// Состояние игры
let score = 0;
let clickPower = 1;
let autoClickPower = 0;
let costUpgradeClick = 10;
let costAutoclicker = 50;
let clickUpgradeStep = 1;  // шаг улучшения растёт после каждой покупки
let autoUpgradeStep = 1;
let buffMultiplier = 1;
let isRewardShown = false;

let goldenHideTimer = null;
let buffResetTimer = null;

const REWARD_SCORE = 5000;
const SAVE_KEY = 'clickerSave';

// Элементы страницы
const scoreDisplay = document.getElementById('score');
const mainBtn = document.getElementById('main-click-btn');
const btnUpgradeClick = document.getElementById('btn-upgrade-click');
const btnAutoclicker = document.getElementById('btn-autoclicker');
const costUpgradeClickDisplay = document.getElementById('cost-upgrade-click');
const costAutoclickerDisplay = document.getElementById('cost-autoclicker');
const stepUpgradeClickDisplay = document.getElementById('step-upgrade-click');
const stepAutoclickerDisplay = document.getElementById('step-autoclicker');
const btnReset = document.getElementById('btn-reset');
const goldenCookie = document.getElementById('golden-cookie');
const rewardModal = document.getElementById('reward-modal');
const btnCloseModal = document.getElementById('btn-close-modal');

// Сохранение в браузере
function saveGame() {
    const data = {
        score, clickPower, autoClickPower,
        costUpgradeClick, costAutoclicker,
        clickUpgradeStep, autoUpgradeStep, isRewardShown
    };
    localStorage.setItem(SAVE_KEY, JSON.stringify(data));
}

function loadGame() {
    const saved = localStorage.getItem(SAVE_KEY);
    if (!saved) return;

    const d = JSON.parse(saved);
    score = Number(d.score) || 0;
    clickPower = Number(d.clickPower) || 1;
    autoClickPower = Number(d.autoClickPower) || 0;
    costUpgradeClick = Number(d.costUpgradeClick) || 10;
    costAutoclicker = Number(d.costAutoclicker) || 50;
    clickUpgradeStep = Number(d.clickUpgradeStep) || 1;
    autoUpgradeStep = Number(d.autoUpgradeStep) || 1;
    isRewardShown = Boolean(d.isRewardShown);
}

// Интерфейс
function updateInterface() {
    scoreDisplay.textContent = Math.floor(score);
    costUpgradeClickDisplay.textContent = costUpgradeClick;
    costAutoclickerDisplay.textContent = costAutoclicker;
    stepUpgradeClickDisplay.textContent = clickUpgradeStep;
    stepAutoclickerDisplay.textContent = autoUpgradeStep;

    btnUpgradeClick.disabled = score < costUpgradeClick;
    btnAutoclicker.disabled = score < costAutoclicker;

    if (buffMultiplier > 1) {
        mainBtn.textContent = `КЛИК! (x${buffMultiplier})`;
        mainBtn.style.backgroundColor = '#f1c40f';
    } else {
        mainBtn.textContent = 'КЛИК!';
        mainBtn.style.backgroundColor = '#e67e22';
    }

    if (score >= REWARD_SCORE && !isRewardShown) {
        isRewardShown = true;
        rewardModal.classList.remove('hidden');
    }
}

function createFloatingNumber(e, value) {
    const n = document.createElement('div');
    n.className = 'floating-number';
    n.textContent = '+' + value;
    n.style.left = e.clientX + 'px';
    n.style.top = e.clientY + 'px';
    document.body.appendChild(n);
    setTimeout(() => n.remove(), 1000);
}

// Кнопки
mainBtn.addEventListener('click', (e) => {
    const added = clickPower * buffMultiplier;
    score += added;
    createFloatingNumber(e, added);
    updateInterface();
});

btnUpgradeClick.addEventListener('click', () => {
    if (score < costUpgradeClick) return;
    score -= costUpgradeClick;
    clickPower += clickUpgradeStep;
    clickUpgradeStep++;
    costUpgradeClick = Math.floor(costUpgradeClick * 1.8);
    updateInterface();
});

btnAutoclicker.addEventListener('click', () => {
    if (score < costAutoclicker) return;
    score -= costAutoclicker;
    autoClickPower += autoUpgradeStep;
    autoUpgradeStep++;
    costAutoclicker = Math.floor(costAutoclicker * 1.8);
    updateInterface();
});

btnReset.addEventListener('click', () => {
    if (!confirm('Сбросить весь прогресс и достижения?')) return;
    localStorage.removeItem(SAVE_KEY);
    location.reload();
});

btnCloseModal.addEventListener('click', () => {
    rewardModal.classList.add('hidden');
});

// Золотая печенька: на 10 секунд удваивает силу клика
function spawnGoldenCookie() {
    if (!goldenCookie.classList.contains('hidden')) return;

    goldenCookie.style.left = Math.random() * (window.innerWidth - 100) + 'px';
    goldenCookie.style.top = Math.random() * (window.innerHeight - 100) + 'px';
    goldenCookie.classList.remove('hidden');

    clearTimeout(goldenHideTimer);
    goldenHideTimer = setTimeout(() => goldenCookie.classList.add('hidden'), 5000);
}

goldenCookie.addEventListener('click', () => {
    goldenCookie.classList.add('hidden');
    clearTimeout(goldenHideTimer);

    buffMultiplier *= 2;
    updateInterface();

    clearTimeout(buffResetTimer);
    buffResetTimer = setTimeout(() => {
        buffMultiplier = 1;
        updateInterface();
    }, 10000);
});

setInterval(() => {
    if (Math.random() > 0.6) spawnGoldenCookie();
}, 7000);

// Автокликер и автосохранение раз в секунду
setInterval(() => {
    score += autoClickPower;
    updateInterface();
    saveGame();
}, 1000);

loadGame();
updateInterface();
