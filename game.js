
let questions = [];
let current = 0;
let score = 0;
let mode = 'practice';

async function startMode(m) {
  mode = m;
  document.getElementById('menu').style.display = 'none';
  questions = await fetch('questions.json').then(res => res.json());
  if (mode === 'test') {
    questions = questions.sort(() => 0.5 - Math.random()).slice(0, 50);
  } else {
    questions = questions.sort(() => 0.5 - Math.random());
  }
  document.getElementById('game').style.display = 'block';
  renderQuestion();
  updateCheckpoint();
}

function renderQuestion() {
  const q = questions[current];
  document.getElementById('question').innerText = q.question;
  const optionsDiv = document.getElementById('options');
  optionsDiv.innerHTML = '';
  q.options.forEach((opt, idx) => {
    const btn = document.createElement('button');
    btn.className = 'option-btn';
    btn.innerText = opt;
    btn.onclick = () => checkAnswer(idx);
    optionsDiv.appendChild(btn);
  });
  document.getElementById('explanation').innerText = '';
  document.getElementById('nextBtn').style.display = 'none';
}

function checkAnswer(index) {
  const q = questions[current];
  const correct = q.answer;
  const expl = q.explanation || '';
  if (index === correct) {
    score++;
    document.getElementById('explanation').innerText = '✅ Correct! ' + expl;
  } else {
    document.getElementById('explanation').innerText = '❌ Incorrect. ' + expl;
  }
  Array.from(document.getElementById('options').children).forEach((btn, idx) => {
    btn.disabled = true;
    btn.style.background = idx === correct ? '#c8e6c9' : (idx === index ? '#ffcdd2' : '#eee');
  });
  document.getElementById('nextBtn').style.display = 'inline-block';
}

function nextQuestion() {
  current++;
  if (current >= questions.length || (mode === 'blitz' && score >= 20)) {
    document.getElementById('game').style.display = 'none';
    document.getElementById('summary').style.display = 'block';
    document.getElementById('score').innerText = `You scored ${score} out of ${questions.length}`;
  } else {
    renderQuestion();
  updateCheckpoint();
  }
}


// Dark mode toggle
function toggleDarkMode() {
  document.body.classList.toggle("dark");
}

// Insert dark mode button
const themeBtn = document.createElement("button");
themeBtn.innerText = "🌓 Toggle Dark Mode";
themeBtn.className = "button";
themeBtn.style.position = "fixed";
themeBtn.style.top = "10px";
themeBtn.style.right = "10px";
themeBtn.onclick = toggleDarkMode;
document.body.appendChild(themeBtn);

// Play sound effects
const correctSound = new Audio("https://www.soundjay.com/buttons/sounds/button-3.mp3");
const wrongSound = new Audio("https://www.soundjay.com/buttons/sounds/button-10.mp3");

// Truck progress bar update
function updateTruckProgress() {
  const truck = document.getElementById("truck");
  if (!truck) return;
  const progress = (current + 1) / questions.length;
  truck.style.left = `${progress * 100}%`;
}


// Extract all categories from questions
let categories = [];
function getCategories() {
  const set = new Set();
  questions.forEach(q => {
    if (q.category) set.add(q.category);
  });
  categories = Array.from(set).sort();
}

// Show category selection menu
function showCategoryMenu() {
  document.getElementById('menu').style.display = 'none';
  const catDiv = document.createElement('div');
  catDiv.id = "category-menu";
  catDiv.innerHTML = "<h2>Choose a Category</h2>";
  categories.forEach(cat => {
    const btn = document.createElement('button');
    btn.className = 'button';
    btn.innerText = cat;
    btn.onclick = () => startCategory(cat);
    catDiv.appendChild(btn);
  });
  document.body.appendChild(catDiv);
}

function startCategory(category) {
  document.getElementById('category-menu').remove();
  mode = 'category';
  filtered = questions.filter(q => q.category === category);
  filtered = filtered.sort(() => 0.5 - Math.random());
  questions = filtered;
  current = 0;
  score = 0;
  document.getElementById('game').style.display = 'block';
  renderQuestion();
  updateCheckpoint();
}

function startCategoryMode() {
  fetch('questions.json')
    .then(res => res.json())
    .then(data => {
      questions = data;
      getCategories();
      showCategoryMenu();
    });
}


// Insert a back button
function createBackButton(targetId = 'menu') {
  const backBtn = document.createElement('button');
  backBtn.innerText = "🔙 Back";
  backBtn.className = "button";
  backBtn.style.marginTop = "1em";
  backBtn.onclick = () => {
    document.getElementById('game').style.display = 'none';
    document.getElementById('summary').style.display = 'none';
    if (document.getElementById('category-menu')) {
      document.getElementById('category-menu').remove();
    }
    document.getElementById(targetId).style.display = 'block';
  };
  return backBtn;
}

// Add to game and category UI
function appendBackToGame() {
  const backBtn = createBackButton();
  document.getElementById('game').appendChild(backBtn);
}

function showCategoryMenu() {
  document.getElementById('menu').style.display = 'none';
  const catDiv = document.createElement('div');
  catDiv.id = "category-menu";
  catDiv.innerHTML = "<h2>Choose a Category</h2>";
  categories.forEach(cat => {
    const btn = document.createElement('button');
    btn.className = 'button';
    btn.innerText = cat;
    btn.onclick = () => startCategory(cat);
    catDiv.appendChild(btn);
  });
  const backBtn = createBackButton();
  catDiv.appendChild(backBtn);
  document.body.appendChild(catDiv);
}


let missedQuestions = [];

function checkAnswer(index) {
  const q = questions[current];
  const correct = q.answer;
  const expl = q.explanation || '';
  if (index === correct) {
    score++;
    document.getElementById('explanation').innerText = '✅ Correct! ' + expl;
  } else {
    missedQuestions.push(q);
    document.getElementById('explanation').innerText = '❌ Incorrect. ' + expl;
  }
  Array.from(document.getElementById('options').children).forEach((btn, idx) => {
    btn.disabled = true;
    btn.style.background = idx === correct ? '#c8e6c9' : (idx === index ? '#ffcdd2' : '#eee');
  });
  document.getElementById('nextBtn').style.display = 'inline-block';
}

function showSummary() {
  document.getElementById('game').style.display = 'none';
  document.getElementById('summary').style.display = 'block';
  document.getElementById('score').innerText = `You scored ${score} out of ${questions.length}`;

  if (missedQuestions.length > 0) {
    const reviewBtn = document.createElement('button');
    reviewBtn.innerText = "🔁 Review Missed Questions";
    reviewBtn.className = "button";
    reviewBtn.onclick = () => {
      questions = missedQuestions;
      missedQuestions = [];
      current = 0;
      score = 0;
      document.getElementById('summary').style.display = 'none';
      document.getElementById('game').style.display = 'block';
      renderQuestion();
  updateCheckpoint();
    };
    document.getElementById('summary').appendChild(reviewBtn);
  }
}

// Hook into nextQuestion to call showSummary
function nextQuestion() {
  current++;
  if (current >= questions.length || (mode === 'blitz' && score >= 20)) {
    showSummary();
  } else {
    renderQuestion();
  updateCheckpoint();
  }
}


const checkpoints = [
  "Los Angeles", "Phoenix", "Albuquerque", "Amarillo", "Oklahoma City",
  "St. Louis", "Indianapolis", "Columbus", "Pittsburgh", "New York"
];

function updateCheckpoint() {
  const progress = (current + 1) / questions.length;
  const index = Math.floor(progress * checkpoints.length);
  const city = checkpoints[Math.min(index, checkpoints.length - 1)];
  document.getElementById('checkpoint').innerText = `🚦 Next Stop: ${city}`;
}
