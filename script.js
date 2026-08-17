(function () {
  "use strict";

  var totalQuestions = 10;
  var currentQuestion = 1;
  var score = 0;
  var correctCount = 0;
  var streak = 0;
  var bestStreak = 0;
  var selectedOperation = "+";
  var correctAnswer = 0;
  var currentA = 0;
  var currentB = 0;
  var currentOperator = "+";
  var locked = false;

  var scoreEl = document.getElementById("score");
  var correctCountEl = document.getElementById("correctCount");
  var streakEl = document.getElementById("streak");
  var bestStreakEl = document.getElementById("bestStreak");
  var questionCounterEl = document.getElementById("questionCounter");
  var progressBarEl = document.getElementById("progressBar");
  var number1El = document.getElementById("number1");
  var number2El = document.getElementById("number2");
  var operatorEl = document.getElementById("operator");
  var answerEl = document.getElementById("answer");
  var feedbackEl = document.getElementById("feedback");
  var speechEl = document.getElementById("speech");
  var levelEl = document.getElementById("level");
  var answerForm = document.getElementById("answerForm");
  var hintButton = document.getElementById("hintButton");
  var newGameButton = document.getElementById("newGameButton");
  var playAgainButton = document.getElementById("playAgainButton");
  var finishModal = document.getElementById("finishModal");
  var finishText = document.getElementById("finishText");
  var celebrationEl = document.getElementById("celebration");
  var operationButtons = document.querySelectorAll(".operation");

  function randomInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }

  function getRange() {
    var level = parseInt(levelEl.value, 10);

    if (level === 1) {
      return { min: 1, max: 10 };
    }

    if (level === 2) {
      return { min: 2, max: 30 };
    }

    return { min: 3, max: 60 };
  }

  function chooseOperation() {
    var operations = ["+", "-", "*", "/"];

    if (selectedOperation === "mix") {
      return operations[randomInt(0, operations.length - 1)];
    }

    return selectedOperation;
  }

  function generateQuestion() {
    var range = getRange();
    var operation = chooseOperation();
    var a = randomInt(range.min, range.max);
    var b = randomInt(range.min, range.max);

    if (operation === "-") {
      if (b > a) {
        var temp = a;
        a = b;
        b = temp;
      }
      correctAnswer = a - b;
    }

    if (operation === "+") {
      correctAnswer = a + b;
    }

    if (operation === "*") {
      var level = parseInt(levelEl.value, 10);
      var tableMax = level === 1 ? 5 : level === 2 ? 10 : 12;
      a = randomInt(1, tableMax);
      b = randomInt(1, tableMax);
      correctAnswer = a * b;
    }

    if (operation === "/") {
      var divisorMax = parseInt(levelEl.value, 10) === 1 ? 5 : 10;
      b = randomInt(1, divisorMax);
      correctAnswer = randomInt(1, divisorMax);
      a = b * correctAnswer;
    }

    currentA = a;
    currentB = b;
    currentOperator = operation;

    number1El.textContent = a;
    number2El.textContent = b;
    operatorEl.textContent = operation === "*" ? "×" : operation === "/" ? "÷" : operation;

    questionCounterEl.textContent = "Questão " + currentQuestion + " de " + totalQuestions;
    progressBarEl.style.width = ((currentQuestion - 1) / totalQuestions * 100) + "%";
    feedbackEl.textContent = "";
    feedbackEl.className = "feedback";
    answerEl.value = "";
    answerEl.focus();
    locked = false;
  }

  function updateStats() {
    scoreEl.textContent = score;
    correctCountEl.textContent = correctCount;
    streakEl.textContent = streak + " 🔥";
    bestStreakEl.textContent = bestStreak;
  }

  function celebrate() {
    var colors = ["#7357e8", "#55a8f8", "#ffd667", "#37b987", "#ef6472"];
    var i;

    for (i = 0; i < 24; i += 1) {
      var piece = document.createElement("span");
      piece.className = "confetti";
      piece.style.left = randomInt(5, 95) + "%";
      piece.style.background = colors[randomInt(0, colors.length - 1)];
      piece.style.animationDelay = (Math.random() * 0.25) + "s";
      celebrationEl.appendChild(piece);

      window.setTimeout((function (element) {
        return function () {
          if (element.parentNode) {
            element.parentNode.removeChild(element);
          }
        };
      }(piece)), 1600);
    }
  }

  function finishGame() {
    progressBarEl.style.width = "100%";

    var message;

    if (correctCount === 10) {
      message = "Perfeito! Você acertou todas as questões e conquistou " + score + " estrelas.";
    } else if (correctCount >= 7) {
      message = "Muito bem! Você acertou " + correctCount + " de " + totalQuestions + " questões e conquistou " + score + " estrelas.";
    } else {
      message = "Você acertou " + correctCount + " de " + totalQuestions + " questões. Continue praticando!";
    }

    finishText.textContent = message;
    finishModal.classList.remove("hidden");
  }

  function nextQuestion() {
    if (currentQuestion >= totalQuestions) {
      finishGame();
      return;
    }

    currentQuestion += 1;
    generateQuestion();
  }

  function checkAnswer(event) {
    event.preventDefault();

    if (locked) {
      return;
    }

    var userAnswer = parseInt(answerEl.value, 10);

    if (isNaN(userAnswer)) {
      feedbackEl.textContent = "Digite um número para responder.";
      feedbackEl.className = "feedback wrong";
      return;
    }

    locked = true;

    if (userAnswer === correctAnswer) {
      score += 10;
      correctCount += 1;
      streak += 1;

      if (streak > bestStreak) {
        bestStreak = streak;
      }

      feedbackEl.textContent = "Muito bem! Resposta correta! ⭐";
      feedbackEl.className = "feedback correct";
      speechEl.textContent = streak >= 3 ? "Que sequência incrível!" : "Mandou bem!";
      celebrate();
    } else {
      streak = 0;
      feedbackEl.textContent = "Quase! A resposta era " + correctAnswer + ".";
      feedbackEl.className = "feedback wrong";
      speechEl.textContent = "Errar também faz parte de aprender!";
    }

    updateStats();
    window.setTimeout(nextQuestion, 1150);
  }

  function showHint() {
    var hint = "";

    if (currentOperator === "+") {
      hint = "Dica: comece em " + currentA + " e conte mais " + currentB + ".";
    } else if (currentOperator === "-") {
      hint = "Dica: imagine " + currentA + " objetos e retire " + currentB + ".";
    } else if (currentOperator === "*") {
      hint = "Dica: " + currentA + " × " + currentB + " é somar " + currentA + " por " + currentB + " vezes.";
    } else {
      hint = "Dica: pense: qual número vezes " + currentB + " dá " + currentA + "?";
    }

    feedbackEl.textContent = hint;
    feedbackEl.className = "feedback";
    speechEl.textContent = "A dica pode ajudar!";
  }

  function resetGame() {
    currentQuestion = 1;
    score = 0;
    correctCount = 0;
    streak = 0;
    bestStreak = 0;
    finishModal.classList.add("hidden");
    updateStats();
    speechEl.textContent = "Você consegue!";
    generateQuestion();
  }

  function setOperation(button) {
    var i;

    selectedOperation = button.getAttribute("data-operation");

    for (i = 0; i < operationButtons.length; i += 1) {
      operationButtons[i].classList.remove("active");
      operationButtons[i].setAttribute("aria-pressed", "false");
    }

    button.classList.add("active");
    button.setAttribute("aria-pressed", "true");
    resetGame();
  }

  var i;

  for (i = 0; i < operationButtons.length; i += 1) {
    operationButtons[i].addEventListener("click", (function (button) {
      return function () {
        setOperation(button);
      };
    }(operationButtons[i])));
  }

  answerForm.addEventListener("submit", checkAnswer);
  hintButton.addEventListener("click", showHint);
  newGameButton.addEventListener("click", resetGame);
  playAgainButton.addEventListener("click", resetGame);
  levelEl.addEventListener("change", resetGame);

  updateStats();
  generateQuestion();
}());
