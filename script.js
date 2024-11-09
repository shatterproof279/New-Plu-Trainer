// script.js

document.addEventListener('DOMContentLoaded', () => {
  let allPluCodes = [];
  let questionPool = [];
  let wrongAnswers = [];
  let currentQuestionIndex = 0;
  let score = 0;
  let comboCount = 0;
  let totalQuestions = 0;
  let timer;
  let timeLeft;
  const maxTime = 15; // Maximum time per question in seconds
  let timerEnabled = true;
  let quizMode = '';
  let answerMode = '';
  let currentUser = '';
  let inputField; // Declare inputField globally

  // DOM Elements
  const usernameSection = document.getElementById('username-section');
  const usernameInput = document.getElementById('username-input');
  const startButton = document.getElementById('start-button');
  const modeSelection = document.getElementById('mode-selection');
  const modeButtonsContainer = document.getElementById('mode-buttons-container');
  const answerModeButtons = document.querySelectorAll('.answer-mode-button');
  const beginQuizButton = document.getElementById('begin-quiz-button');
  const timerToggle = document.getElementById('timer-toggle');
  const timerStatus = document.getElementById('timer-status');
  const quizInterface = document.getElementById('quiz-interface');
  const quizContainer = document.getElementById('quiz-container');
  const scoreDisplay = document.getElementById('score-display');
  const comboDisplay = document.getElementById('combo-display');
  const timerDisplay = document.getElementById('timer-display');
  const progressDisplay = document.getElementById('progress-display');
  const pauseButton = document.getElementById('pause-button');
  const resetButton = document.getElementById('reset-button');
  const exitButton = document.getElementById('exit-button');
  const skipButton = document.getElementById('skip-button');
  const pauseOverlay = document.getElementById('pause-overlay');
  const resumeButton = document.getElementById('resume-button');
  const feedbackOverlay = document.getElementById('feedback-overlay');
  const feedbackHeader = document.getElementById('feedback-header');
  const feedbackText = document.getElementById('feedback-text');
  const continueButton = document.getElementById('continue-button');
  const userDisplay = document.getElementById('user-display');
  const changeUserButton = document.getElementById('change-user-button');
  const leaderboardMenuButton = document.getElementById('leaderboard-menu-button');

  // Custom Modal Elements
  const customModal = document.getElementById('custom-modal');
  const modalMessage = document.getElementById('modal-message');
  const modalConfirmButton = document.getElementById('modal-confirm-button');
  const modalCancelButton = document.getElementById('modal-cancel-button');

  // Check if username is stored
  if (localStorage.getItem('pluUsername')) {
    currentUser = localStorage.getItem('pluUsername');
    userDisplay.textContent = `Logged in as ${currentUser}`;
    changeUserButton.style.display = 'inline-block';
    modeSelection.style.display = 'block';
  } else {
    usernameSection.style.display = 'block';
  }

  // Fetch PLU Codes
  fetch('data/plu-codes.json')
    .then(response => response.json())
    .then(data => {
      allPluCodes = data;
      initializeModeButtons();
    })
    .catch(error => console.error('Error fetching PLU codes:', error));

  // Initialize Mode Buttons
  function initializeModeButtons() {
    // Check if there are images available
    fetchImagesList().then(imagesList => {
      const modes = [
        { mode: 'produce', label: 'Produce Only' },
        { mode: 'everything', label: 'Everything' },
        { mode: 'non-produce', label: 'Non-Produce Items' },
        { mode: 'problem-questions', label: 'Problem Questions' },
      ];

      // Only add Picture Mode if images are available
      const pictureModeItems = allPluCodes.filter(item => imagesList.includes(item.item));
      if (pictureModeItems.length > 0) {
        modes.push({ mode: 'picture-mode', label: 'Picture Mode' });
        modes.push({ mode: 'mixed-mode', label: 'Mixed Mode' });
      }

      modes.forEach(({ mode, label }) => {
        const button = document.createElement('button');
        button.classList.add('mode-button');
        button.setAttribute('data-mode', mode);
        button.innerHTML = `<span>${label}</span>`;
        modeButtonsContainer.appendChild(button);
      });

      // Re-select mode buttons after dynamically adding them
      const modeButtons = document.querySelectorAll('.mode-button');
      modeButtons.forEach(button => {
        button.addEventListener('click', () => {
          // Remove 'active' class from all mode buttons
          modeButtons.forEach(btn => btn.classList.remove('active'));
          // Add 'active' class to the clicked button
          button.classList.add('active');
          quizMode = button.getAttribute('data-mode');
          modeSelected = true;
          checkStartConditions();
        });
      });
    });
  }

  // Fetch list of available images
  function fetchImagesList() {
    return new Promise((resolve) => {
      // Simulate fetching images from the images folder
      fetch('data/images-list.json')
        .then(response => response.json())
        .then(imagesList => {
          resolve(imagesList);
        })
        .catch(error => {
          console.error('Error fetching images list:', error);
          resolve([]); // Resolve with an empty array if there's an error
        });
    });
  }

  // Start Button Click Event
  startButton.addEventListener('click', () => {
    const username = usernameInput.value.trim();
    if (username === '') {
      showModal('Please enter your username.');
    } else {
      currentUser = username;
      localStorage.setItem('pluUsername', currentUser);
      usernameSection.style.display = 'none';
      userDisplay.textContent = `Logged in as ${currentUser}`;
      changeUserButton.style.display = 'inline-block';
      modeSelection.style.display = 'block';
    }
  });

  // Change User Button Event Listener
  changeUserButton.addEventListener('click', () => {
    showModal('Are you sure you want to change user?', true, (confirmed) => {
      if (confirmed) {
        localStorage.removeItem('pluUsername');
        currentUser = '';
        userDisplay.textContent = '';
        changeUserButton.style.display = 'none';
        // Hide other sections
        modeSelection.style.display = 'none';
        quizInterface.style.display = 'none';
        // Reset mode selections
        const modeButtons = document.querySelectorAll('.mode-button');
        modeButtons.forEach(btn => btn.classList.remove('active'));
        answerModeButtons.forEach(btn => btn.classList.remove('active'));
        beginQuizButton.disabled = true;
        quizMode = '';
        answerMode = '';
        modeSelected = false;
        answerModeSelected = false;
        // Show username input
        usernameSection.style.display = 'block';
      }
    });
  });

  // Leaderboard Menu Button
  leaderboardMenuButton.addEventListener('click', () => {
    window.location.href = 'leaderboard.html';
  });

  // Mode Selection
  let modeSelected = false;
  let answerModeSelected = false;

  answerModeButtons.forEach(button => {
    button.addEventListener('click', () => {
      // Remove 'active' class from all answer mode buttons
      answerModeButtons.forEach(btn => btn.classList.remove('active'));
      // Add 'active' class to the clicked button
      button.classList.add('active');
      answerMode = button.getAttribute('data-answer-mode');
      answerModeSelected = true;
      checkStartConditions();
    });
  });

  // Timer Toggle Event Listener
  timerToggle.addEventListener('change', () => {
    timerEnabled = timerToggle.checked;
    timerStatus.textContent = timerEnabled ? 'Timer On' : 'Timer Off';
  });

  // Begin Quiz Button
  beginQuizButton.addEventListener('click', () => {
    if (modeSelected && answerModeSelected) {
      modeSelection.style.display = 'none';
      quizInterface.style.display = 'block';
      startQuiz();
    } else {
      showModal('Please select both quiz mode and answer mode.');
    }
  });

  function checkStartConditions() {
    if (modeSelected && answerModeSelected) {
      beginQuizButton.disabled = false;
    } else {
      beginQuizButton.disabled = true;
    }
  }

  function startQuiz() {
    // Initialize variables
    questionPool = filterQuestionsByMode();
    questionPool = shuffleArray(questionPool);
    totalQuestions = questionPool.length;
    currentQuestionIndex = 0;
    score = 0;
    comboCount = 0;
    wrongAnswers = [];
    updateScoreDisplay();
    updateComboDisplay();
    loadQuestion();
  }

  function filterQuestionsByMode() {
    if (quizMode === 'produce') {
      return allPluCodes.filter(item => item.category === 'Produce');
    } else if (quizMode === 'non-produce') {
      return allPluCodes.filter(item => item.category !== 'Produce');
    } else if (quizMode === 'problem-questions') {
      // Retrieve missed questions from localStorage
      let missedQuestions = JSON.parse(localStorage.getItem('missedQuestions')) || [];
      if (missedQuestions.length === 0) {
        showModal('No problem questions available. Starting with all questions.');
        return [...allPluCodes];
      }
      return missedQuestions;
    } else if (quizMode === 'picture-mode' || quizMode === 'mixed-mode') {
      // Only include items with available images
      return allPluCodes.filter(item => imageExists(item.item));
    } else {
      return [...allPluCodes];
    }
  }

  function imageExists(itemName) {
    // Check if image exists in the imagesList
    return imagesList.includes(itemName);
  }

  let imagesList = [];

  // Fetch the list of available images
  fetchImagesList().then(list => {
    imagesList = list;
  });

  function loadQuestion() {
    // Remove previous keydown event listener if any
    if (quizContainer.keyPressListener) {
      document.removeEventListener('keydown', quizContainer.keyPressListener);
      quizContainer.keyPressListener = null;
    }

    // Check if we've gone through all questions
    if (currentQuestionIndex >= questionPool.length) {
      // Quiz is complete
      endQuiz();
      return;
    }

    // Reset the container
    quizContainer.innerHTML = '';
    // Reset timer
    clearInterval(timer);
    timeLeft = maxTime;
    updateTimerDisplay();
    if (timerEnabled) {
      timerDisplay.style.display = 'block';
    } else {
      timerDisplay.style.display = 'none';
    }

    const currentQuestion = questionPool[currentQuestionIndex];

    // Update progress
    updateProgressDisplay();

    // Decide whether to use text or image for the question
    let useImage = false;

    if (quizMode === 'picture-mode') {
      useImage = true;
    } else if (quizMode === 'mixed-mode') {
      useImage = imageExists(currentQuestion.item) && Math.random() < 0.5;
    }

    // Display the question
    if (useImage) {
      const imageElement = document.createElement('img');
      imageElement.id = 'question-image';
      imageElement.alt = currentQuestion.item;
      imageElement.src = `images/${currentQuestion.item}.jpg`;
      imageElement.onerror = () => {
        imageElement.src = `images/${currentQuestion.item}.png`;
      };
      quizContainer.appendChild(imageElement);

      const questionElement = document.createElement('p');
      questionElement.textContent = answerMode === 'multiple-choice' ?
        `What is the PLU code for this item?` :
        `Enter the PLU code for this item:`;
      quizContainer.appendChild(questionElement);

    } else {
      const questionElement = document.createElement('p');
      questionElement.textContent = answerMode === 'multiple-choice' ?
        `What is the PLU code for ${currentQuestion.item}?` :
        `Enter the PLU code for ${currentQuestion.item}:`;
      quizContainer.appendChild(questionElement);
    }

    if (answerMode === 'multiple-choice') {
      // Generate options
      const options = generateOptions(currentQuestion);
      let optionButtons = [];
      options.forEach((option, index) => {
        const button = document.createElement('button');
        button.classList.add('option');
        button.textContent = `${index + 1}. ${option.code}`;
        button.setAttribute('data-index', index + 1); // 1-based index
        button.addEventListener('click', () => {
          if (!isPaused) {
            checkAnswer(option.code, currentQuestion, button);
          }
        });
        quizContainer.appendChild(button);
        optionButtons.push(button);
      });

      // Add keydown event listener for 1-4 keys
      function handleKeyPress(event) {
        if (!isPaused && feedbackOverlay.style.display === 'none') {
          const key = event.key;
          if (key >= '1' && key <= '4') {
            const idx = parseInt(key) - 1; // Convert to 0-based index
            if (optionButtons[idx]) {
              optionButtons[idx].click();
            }
          }
        }
      }

      document.addEventListener('keydown', handleKeyPress);

      // Store the event listener so we can remove it later
      quizContainer.keyPressListener = handleKeyPress;

    } else {
      // Create input field for typing the answer
      inputField = document.createElement('input'); // Declare inputField globally
      inputField.type = 'tel';
      inputField.id = 'answer-input';
      inputField.placeholder = 'Enter PLU Code';
      inputField.autocomplete = 'off';
      inputField.pattern = '\\d*';
      inputField.inputMode = 'numeric';
      quizContainer.appendChild(inputField);

      // On-screen Keypad
      const keypad = document.createElement('div');
      keypad.id = 'keypad';
      const keys = ['1','2','3','4','5','6','7','8','9','0','⌫','Enter'];
      keys.forEach(key => {
        const keyButton = document.createElement('button');
        keyButton.classList.add('keypad-button');
        keyButton.textContent = key;
        keyButton.addEventListener('click', () => {
          if (key === '⌫') {
            inputField.value = inputField.value.slice(0, -1);
          } else if (key === 'Enter') {
            submitAnswer();
          } else {
            inputField.value += key;
          }
          inputField.focus();
        });
        keypad.appendChild(keyButton);
      });
      quizContainer.appendChild(keypad);

      // Allow pressing Enter key to submit
      inputField.addEventListener('keyup', (event) => {
        if (event.key === 'Enter' && feedbackOverlay.style.display === 'none') {
          submitAnswer();
        }
      });

      // Function to submit answer
      function submitAnswer() {
        if (!isPaused && feedbackOverlay.style.display === 'none') {
          const userAnswer = inputField.value.trim();
          checkAnswer(userAnswer, currentQuestion);
        }
      }

      // Set focus to input field
      inputField.focus();
    }

    // Start the timer
    if (timerEnabled) {
      timer = setInterval(() => {
        if (!isPaused) {
          timeLeft--;
          updateTimerDisplay();
          if (timeLeft <= 0) {
            clearInterval(timer);
            feedback(false, currentQuestion, true);
          }
        }
      }, 1000);
    }
  }

  function checkAnswer(userAnswer, currentQuestion, selectedButton = null) {
    clearInterval(timer);
    // Remove leading zeros for comparison
    const formattedUserAnswer = userAnswer.replace(/^0+/, '');
    const formattedCorrectAnswer = currentQuestion.code.replace(/^0+/, '');
    const isCorrect = formattedUserAnswer === formattedCorrectAnswer;
    feedback(isCorrect, currentQuestion, false, selectedButton);
  }

  function feedback(isCorrect, currentQuestion, timeOut, selectedButton = null) {
    if (isCorrect) {
      comboCount++;
      // Increment score with combo bonus
      score += calculateScore(timeLeft, comboCount);
      updateScoreDisplay();
      updateComboDisplay();
      // Remove from missed questions if present
      removeMissedQuestion(currentQuestion);
      if (selectedButton) {
        selectedButton.classList.add('correct');
        setTimeout(() => {
          // Automatically proceed to the next question
          currentQuestionIndex++;
          loadQuestion();
        }, 500);
      } else {
        // Automatically proceed to the next question
        currentQuestionIndex++;
        loadQuestion();
      }
    } else {
      // Disable input field to prevent further input
      if (inputField) {
        inputField.disabled = true;
      }
      // Display feedback overlay for incorrect answers
      if (selectedButton) {
        selectedButton.classList.add('incorrect');
      }
      setTimeout(() => {
        feedbackOverlay.style.display = 'block';
        feedbackHeader.textContent = 'Incorrect!';
        feedbackHeader.style.color = '#F44336';
        if (timeOut) {
          feedbackText.textContent = `Time's up! The correct code for ${currentQuestion.item} is ${currentQuestion.code}.`;
        } else {
          feedbackText.textContent = `The correct code for ${currentQuestion.item} is ${currentQuestion.code}.`;
        }
        // Add to wrong answers to revisit later
        wrongAnswers.push(currentQuestion);
        // Save the missed question
        saveMissedQuestion(currentQuestion);
        // Reset combo count
        comboCount = 0;
        updateScoreDisplay();
        updateComboDisplay();
      }, 500);
    }
  }

  function saveMissedQuestion(question) {
    let missedQuestions = JSON.parse(localStorage.getItem('missedQuestions')) || [];
    // Avoid duplicates
    if (!missedQuestions.some(q => q.code === question.code)) {
      missedQuestions.push(question);
      localStorage.setItem('missedQuestions', JSON.stringify(missedQuestions));
    }
  }

  function removeMissedQuestion(question) {
    let missedQuestions = JSON.parse(localStorage.getItem('missedQuestions')) || [];
    missedQuestions = missedQuestions.filter(q => q.code !== question.code);
    localStorage.setItem('missedQuestions', JSON.stringify(missedQuestions));
  }

  function calculateScore(timeLeft, comboCount) {
    // Example scoring formula with combo bonus
    let baseScore = 10;
    if (timerEnabled) {
      baseScore += timeLeft; // Bonus for time left
    }
    baseScore += comboCount * 5; // Combo bonus
    return baseScore;
  }

  function updateScoreDisplay() {
    scoreDisplay.textContent = `Score: ${score}`;
  }

  function updateComboDisplay() {
    comboDisplay.textContent = `Combo: ${comboCount}`;
  }

  function updateTimerDisplay() {
    timerDisplay.textContent = `Time Left: ${timeLeft}s`;
  }

  function updateProgressDisplay() {
    const total = totalQuestions;
    const current = currentQuestionIndex + 1;
    progressDisplay.textContent = `Question ${current} of ${total}`;
  }

  function generateOptions(currentQuestion) {
    const optionsSet = new Set();
    optionsSet.add(currentQuestion);

    while (optionsSet.size < 4) {
      const randomOption = allPluCodes[Math.floor(Math.random() * allPluCodes.length)];
      optionsSet.add(randomOption);
    }

    const optionsArray = Array.from(optionsSet);
    return shuffleArray(optionsArray);
  }

  function shuffleArray(array) {
    return array.sort(() => Math.random() - 0.5);
  }

  function endQuiz() {
    // Remove keydown event listener if any
    if (quizContainer.keyPressListener) {
      document.removeEventListener('keydown', quizContainer.keyPressListener);
      quizContainer.keyPressListener = null;
    }

    // Display final score
    quizContainer.innerHTML = '';
    timerDisplay.textContent = '';
    progressDisplay.textContent = '';
    comboDisplay.textContent = '';

    const finalMessage = document.createElement('p');
    finalMessage.textContent = `Quiz Complete! Your final score is ${score}.`;
    finalMessage.style.fontSize = '24px';
    finalMessage.style.textAlign = 'center';
    quizContainer.appendChild(finalMessage);

    // Update leaderboard (exclude problem-questions mode)
    if (quizMode !== 'problem-questions') {
      let leaderboard = JSON.parse(localStorage.getItem('leaderboard')) || [];
      leaderboard.push({ username: currentUser, score: score, mode: quizMode });
      localStorage.setItem('leaderboard', JSON.stringify(leaderboard));
    }

    // Option to restart the quiz
    const restartButton = document.createElement('button');
    restartButton.textContent = 'Restart Quiz';
    restartButton.className = 'option';
    quizContainer.appendChild(restartButton);

    // Option to exit to main menu
    const exitButtonEnd = document.createElement('button');
    exitButtonEnd.textContent = 'Exit to Main Menu';
    exitButtonEnd.className = 'option';
    quizContainer.appendChild(exitButtonEnd);

    // Option to view leaderboard
    const leaderboardButton = document.createElement('button');
    leaderboardButton.textContent = 'View Leaderboard';
    leaderboardButton.className = 'option';
    quizContainer.appendChild(leaderboardButton);

    restartButton.addEventListener('click', () => {
      startQuiz();
    });

    exitButtonEnd.addEventListener('click', () => {
      // Reset and go back to start screen
      resetToStartScreen();
    });

    leaderboardButton.addEventListener('click', () => {
      window.location.href = 'leaderboard.html';
    });
  }

  function resetToStartScreen() {
    // Reset variables
    questionPool = [];
    wrongAnswers = [];
    currentQuestionIndex = 0;
    score = 0;
    comboCount = 0;
    clearInterval(timer);
    isPaused = false;
    modeSelected = false;
    answerModeSelected = false;
    quizMode = '';
    answerMode = '';

    // Remove keydown event listener if any
    if (quizContainer.keyPressListener) {
      document.removeEventListener('keydown', quizContainer.keyPressListener);
      quizContainer.keyPressListener = null;
    }

    // Hide quiz interface and show mode selection
    quizInterface.style.display = 'none';
    modeSelection.style.display = 'block';
    const modeButtons = document.querySelectorAll('.mode-button');
    modeButtons.forEach(btn => {
      btn.classList.remove('active');
    });
    answerModeButtons.forEach(btn => {
      btn.classList.remove('active');
    });
    beginQuizButton.disabled = true;
  }

  // Control Buttons
  let isPaused = false;

  pauseButton.addEventListener('click', () => {
    if (!isPaused) {
      if (timerEnabled) {
        clearInterval(timer);
      }
      isPaused = true;
      pauseButton.disabled = true; // Disable pause button
      pauseOverlay.style.display = 'block';
    }
  });

  resumeButton.addEventListener('click', () => {
    if (timerEnabled) {
      timer = setInterval(() => {
        if (!isPaused) {
          timeLeft--;
          updateTimerDisplay();
          if (timeLeft <= 0) {
            clearInterval(timer);
            feedback(false, questionPool[currentQuestionIndex], true);
          }
        }
      }, 1000);
    }
    isPaused = false;
    pauseButton.disabled = false; // Re-enable pause button
    pauseOverlay.style.display = 'none';
  });

  resetButton.addEventListener('click', () => {
    showModal('Are you sure you want to reset the quiz?', true, (confirmed) => {
      if (confirmed) {
        startQuiz();
      }
    });
  });

  exitButton.addEventListener('click', () => {
    showModal('Are you sure you want to exit the quiz?', true, (confirmed) => {
      if (confirmed) {
        resetToStartScreen();
      }
    });
  });

  // Skip Button
  skipButton.addEventListener('click', () => {
    clearInterval(timer);
    // Treat skipped question as incorrect and add to wrong answers
    const currentQuestion = questionPool[currentQuestionIndex];
    wrongAnswers.push(currentQuestion);
    saveMissedQuestion(currentQuestion);
    comboCount = 0;
    updateComboDisplay();
    currentQuestionIndex++;
    loadQuestion();
  });

  // Add event listener for keydown events
  document.addEventListener('keydown', (event) => {
    if (feedbackOverlay.style.display === 'block' && event.key === 'Enter') {
      event.preventDefault();
      continueButton.click();
    }
  });

  continueButton.addEventListener('click', () => {
    feedbackOverlay.style.display = 'none';
    currentQuestionIndex++;
    loadQuestion();
  });

  // Custom Modal Functions
  function showModal(message, isConfirm = false, callback = null) {
    modalMessage.textContent = message;

    if (isConfirm) {
      modalCancelButton.style.display = 'inline-block';
    } else {
      modalCancelButton.style.display = 'none';
    }

    customModal.style.display = 'block';

    // Remove previous event listeners
    modalConfirmButton.onclick = null;
    modalCancelButton.onclick = null;

    modalConfirmButton.onclick = () => {
      customModal.style.display = 'none';
      if (callback) callback(true);
    };

    modalCancelButton.onclick = () => {
      customModal.style.display = 'none';
      if (callback) callback(false);
    };
  }
});
// script.js

document.addEventListener('DOMContentLoaded', () => {
  // (All previous code remains the same up to the 'feedback' function)

  function feedback(isCorrect, currentQuestion, timeOut, selectedButton = null) {
    if (isCorrect) {
      // Play correct sound
      document.getElementById('correct-sound').play();

      comboCount++;
      // Increment score with combo bonus
      score += calculateScore(timeLeft, comboCount);
      updateScoreDisplay();
      updateComboDisplay();
      // Remove from missed questions if present
      removeMissedQuestion(currentQuestion);
      if (selectedButton) {
        selectedButton.classList.add('correct');
        setTimeout(() => {
          // Automatically proceed to the next question
          currentQuestionIndex++;
          loadQuestion();
        }, 500);
      } else {
        // Automatically proceed to the next question
        currentQuestionIndex++;
        loadQuestion();
      }
    } else {
      // Play incorrect sound
      document.getElementById('incorrect-sound').play();

      // Disable input field to prevent further input
      if (inputField) {
        inputField.disabled = true;
      }
      // Display feedback overlay for incorrect answers
      if (selectedButton) {
        selectedButton.classList.add('incorrect');
      }
      setTimeout(() => {
        feedbackOverlay.style.display = 'block';
        feedbackHeader.textContent = 'Incorrect!';
        feedbackHeader.style.color = '#F44336';
        if (timeOut) {
          feedbackText.textContent = `Time's up! The correct code for ${currentQuestion.item} is ${currentQuestion.code}.`;
        } else {
          feedbackText.textContent = `The correct code for ${currentQuestion.item} is ${currentQuestion.code}.`;
        }
        // Add to wrong answers to revisit later
        wrongAnswers.push(currentQuestion);
        // Save the missed question
        saveMissedQuestion(currentQuestion);
        // Reset combo count
        comboCount = 0;
        updateScoreDisplay();
        updateComboDisplay();
      }, 500);
    }
    // Update progress bar
    updateProgressBar();
  }

  // Update progress bar
  function updateProgressBar() {
    const progressBar = document.getElementById('progress-bar');
    const progressPercent = ((currentQuestionIndex + 1) / totalQuestions) * 100;
    progressBar.style.width = `${progressPercent}%`;
  }

  function endQuiz() {
    // (Previous code remains the same)

    // Display Achievements
    displayAchievements();

    // If there are wrong answers, offer to review them
    if (wrongAnswers.length > 0) {
      const reviewButton = document.createElement('button');
      reviewButton.textContent = 'Review Incorrect Answers';
      reviewButton.className = 'option';
      quizContainer.appendChild(reviewButton);

      reviewButton.addEventListener('click', () => {
        reviewIncorrectAnswers();
      });
    }
  }

  // Display Achievements
  function displayAchievements() {
    const achievements = [];
    if (score >= 100) {
      achievements.push('Score Over 100');
    }
    if (comboCount >= 5) {
      achievements.push('Combo Master (Combo of 5)');
    }
    // Add more achievements as desired

    if (achievements.length > 0) {
      const achievementsHeader = document.createElement('h2');
      achievementsHeader.textContent = 'Achievements Earned!';
      quizContainer.appendChild(achievementsHeader);

      const achievementsList = document.createElement('ul');
      achievements.forEach(ach => {
        const achItem = document.createElement('li');
        achItem.textContent = ach;
        achievementsList.appendChild(achItem);
      });
      quizContainer.appendChild(achievementsList);
    }
  }

  // Review Incorrect Answers
  function reviewIncorrectAnswers() {
    quizContainer.innerHTML = '';
    const reviewHeader = document.createElement('h2');
    reviewHeader.textContent = 'Review Incorrect Answers';
    quizContainer.appendChild(reviewHeader);

    wrongAnswers.forEach(question => {
      const questionItem = document.createElement('div');
      questionItem.classList.add('review-item');
      questionItem.innerHTML = `<p>Item: ${question.item}</p><p>Correct PLU Code: ${question.code}</p>`;
      quizContainer.appendChild(questionItem);
    });

    // Option to go back to main menu
    const backButton = document.createElement('button');
    backButton.textContent = 'Back to Main Menu';
    backButton.className = 'option';
    quizContainer.appendChild(backButton);

    backButton.addEventListener('click', () => {
      resetToStartScreen();
    });
  }

  // (Rest of the code remains unchanged)
});
