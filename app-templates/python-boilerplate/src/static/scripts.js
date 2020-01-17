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

function addKeywordClassNames(keywordNode, ...classNames) {
  keywordNode.classList.add(...classNames);
}
function removeKeywordClassNames(keywordNode, ...classNames) {
  keywordNode.classList.remove(...classNames);
}

async function updateKeyword(keywordNode) {
    // switch keyword color
    removeKeywordClassNames(keywordNode, ...KEYWORD_COLOR_CLASSES);
    addKeywordClassNames(keywordNode, sample(KEYWORD_COLOR_CLASSES));

    // trigger keyword is loading
    addKeywordClassNames(keywordNode, LOADING_KEYWORD_CLASS);

    const word = await nextWord();
    keywordNode.textContent = word;

    // stop keyword is loading
    removeKeywordClassNames(keywordNode, LOADING_KEYWORD_CLASS);

    // make keyword flash
    addKeywordClassNames(keywordNode, FLASH_KEYWORD_CLASS);
    setTimeout(() => {
      removeKeywordClassNames(keywordNode, FLASH_KEYWORD_CLASS);
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
}, false);
