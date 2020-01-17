const LOADING_KEYWORD_CLASS = 'asi-teaser-keyword-loading';
const FLASH_KEYWORD_CLASS = 'asi-teaser-keyword-flash';

const KEYWORD_COLOR_CLASSES = [
    'asi-teaser-keyword-orange',
    'asi-teaser-keyword-red',
    'asi-teaser-keyword-blue',
    'asi-teaser-keyword-green'
];

const KEYWORDS_URL = '/gimme/1';

const MAX_HISTORY_LENGTH = 7;

function random(maxValue) {
    return Math.floor(Math.random() * (maxValue + 1));
}

function sample(values) {
    return values[random(values.length - 1)];
}

async function getRandomWord() {
    const response = await fetch(KEYWORDS_URL);
    const {data: [word]} = await response.json();
    return word;
}

const keywordsHistory = [];

async function nextWord() {
    while (true) {
        const word = await getRandomWord();
        if (!keywordsHistory.includes(word)) {
            keywordsHistory.unshift(word);
            keywordsHistory.splice(MAX_HISTORY_LENGTH, keywordsHistory.length);

            return word;
        }
    }
}

async function updateKeyword(keywordNode) {

    keywordNode.classList.remove(...KEYWORD_COLOR_CLASSES);
    keywordNode.classList.add(LOADING_KEYWORD_CLASS, sample(KEYWORD_COLOR_CLASSES));

    const word = await nextWord();
    keywordNode.textContent = word;
    keywordNode.classList.remove(LOADING_KEYWORD_CLASS);
    keywordNode.classList.add(FLASH_KEYWORD_CLASS);

    setTimeout(() => {
        keywordNode.classList.remove(FLASH_KEYWORD_CLASS);
    }, 100);
};

function updateKeywords() {
    const keywordCandidates = document.querySelectorAll(
        `.asi-teaser-keyword:not(.${LOADING_KEYWORD_CLASS}):not(.${FLASH_KEYWORD_CLASS})`);
    const {
        length
    } = keywordCandidates;
    if (length) {
        const keywordIndex = random(length - 1);
        updateKeyword(keywordCandidates[keywordIndex]);
    }
}
document.body.addEventListener('mouseover', event => {
    if (event.target.matches('.asi-tile')) {
        updateKeywords();
    }
}, false)
