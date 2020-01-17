const LOADING_KEYWORD_CLASS = 'asi-teaser-keyword-loading';
const FLASH_KEYWORD_CLASS = 'asi-teaser-keyword-flash';

const KEYWORD_COLOR_CLASSES = [
    'asi-teaser-keyword-orange',
    'asi-teaser-keyword-red',
    'asi-teaser-keyword-blue',
    'asi-teaser-keyword-green'
];

function random(maxValue) {
  return Math.floor(Math.random() * (maxValue + 1));
}

function sample(values) {
    return values[random(values.length - 1)];
}

const tags = [
    'helm', 'kustomize', 'kubernetes', 'aws', 'gcp', 'azure', 'terraform', 'docker', 'shell', 'vault', 'istio'
];

async function getRandomWord() {
  await new Promise(resolve => setTimeout(resolve, 100 + random(700)));
  return tags[random(tags.length - 1)];
}

const keywordsHistory = [];
const MAX_HISTORY_LENGTH = 7;

async function nextWord() {
  while(true) {
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
  const keywordCandidates = document.querySelectorAll(`.asi-teaser-keyword:not(.${LOADING_KEYWORD_CLASS}):not(.${FLASH_KEYWORD_CLASS})`);
  const {length} = keywordCandidates;
  if (length) {
    const keywordIndex = random(length - 1);
    updateKeyword(keywordCandidates[keywordIndex]);
  }
}
document.body.addEventListener('mouseover', event => {
  // console.log(event.target);
  if (event.target.matches('.asi-tile')) {
    updateKeywords();
  }
}, false)
