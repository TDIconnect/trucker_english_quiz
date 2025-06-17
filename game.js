
// Trucker English Challenge - Fullscreen UI Adaptation (with game logic functions)
let questions = [];
let filteredQuestions = [];
let currentQuestion = 0;
let score = 0;
let testMode = false;
let blitzMode = false;
let testSet = [];
let timerInterval;
let blitzInterval;
let startTime;
let blitzTime = 60;

const correctSound = new Audio("https://www.soundjay.com/buttons/sounds/button-3.mp3");
const wrongSound = new Audio("https://www.soundjay.com/buttons/sounds/button-10.mp3");

const checkpoints = ["Los Angeles", "Phoenix", "Denver", "Kansas City", "Chicago", "Columbus", "Pittsburgh", "New York"];

function loadQuestions() {
  return fetch("questions.json")
    .then((res) => res.json())
    .then((data) => {
      questions = data;
    });
}

function startTest() {
  testMode = true;
  blitzMode = false;
  score = 0;
  currentQuestion = 0;
  testSet = questions.sort(() => 0.5 - Math.random()).slice(0, 50);
  startTime = Date.now();
  renderQuestion();
}

function startPractice() {
  testMode = false;
  blitzMode = false;
  score = 0;
  currentQuestion = 0;
  filteredQuestions = [...questions].sort(() => 0.5 - Math.random());
  startTime = Date.now();
  renderQuestion();
}

function startBlitz() {
  testMode = false;
  blitzMode = true;
  score = 0;
  currentQuestion = 0;
  filteredQuestions = [...questions].sort(() => 0.5 - Math.random());
  blitzTime = 60;
  startTime = Date.now();
  document.getElementById("blitz-timer").style.display = "block";
  blitzInterval = setInterval(() => {
    blitzTime--;
    document.getElementById("blitz-timer").innerText = `⏱ ${blitzTime}s left`;
    if (blitzTime <= 0) {
      clearInterval(blitzInterval);
      showFinalScore();
    }
  }, 1000);
  renderQuestion();
}

function renderQuestion() {
  const q = testMode ? testSet[currentQuestion] : filteredQuestions[currentQuestion];
  document.getElementById("question").innerText = `❓ ${q.question}`;
  updateCheckpoint();
  for (let i = 0; i < 4; i++) {
    const btn = document.getElementById(`opt${i}`);
    btn.innerText = q.options[i];
    btn.onclick = () => checkAnswer(i);
    btn.disabled = false;
    btn.style.backgroundColor = "";
  }
  document.getElementById("next").style.display = testMode ? "inline-block" : "none";
  document.getElementById("finish").style.display = testMode && currentQuestion === 49 ? "inline-block" : "none";
}

function checkAnswer(index) {
  const q = testMode ? testSet[currentQuestion] : filteredQuestions[currentQuestion];
  const isCorrect = index === q.answer;
  if (isCorrect) {
    score++;
    correctSound.play();
  } else {
    wrongSound.play();
  }
  for (let i = 0; i < 4; i++) {
    const btn = document.getElementById(`opt${i}`);
    btn.disabled = true;
    btn.style.backgroundColor = i === q.answer ? "#c8e6c9" : (i === index ? "#ffcdd2" : "");
  }
  document.getElementById("explanation").innerText = q.explanation || "";
  if (!testMode && !blitzMode) {
    setTimeout(() => {
      currentQuestion++;
      if (currentQuestion < filteredQuestions.length) renderQuestion();
    }, 1000);
  }
}

function nextQuestion() {
  currentQuestion++;
  renderQuestion();
}

function showFinalScore() {
  clearInterval(blitzInterval);
  const container = document.getElementById("game-container") || document.body;
  container.innerHTML = `<h2>🎉 Final Score: ${score}</h2>`;
}
