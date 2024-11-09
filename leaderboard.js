// leaderboard.js

document.addEventListener('DOMContentLoaded', () => {
    const leaderboardTableBody = document.querySelector('#leaderboard-table tbody');
    const backButton = document.getElementById('back-button');
    const leaderboardModeButtonsContainer = document.getElementById('leaderboard-mode-buttons');
  
    let leaderboard = JSON.parse(localStorage.getItem('leaderboard')) || [];
  
    // Define all possible modes
    const allModes = ['produce', 'everything', 'non-produce', 'picture-mode', 'mixed-mode'];
  
    // Create mode buttons
    allModes.forEach((mode, index) => {
      const button = document.createElement('button');
      button.classList.add('leaderboard-mode-button');
      if (index === 0) button.classList.add('active');
      button.setAttribute('data-mode', mode);
      button.textContent = getModeLabel(mode);
      leaderboardModeButtonsContainer.appendChild(button);
    });
  
    let currentMode = allModes[0]; // Default mode
  
    const modeButtons = document.querySelectorAll('.leaderboard-mode-button');
  
    modeButtons.forEach(button => {
      button.addEventListener('click', () => {
        // Remove 'active' class from all buttons
        modeButtons.forEach(btn => btn.classList.remove('active'));
        // Add 'active' class to clicked button
        button.classList.add('active');
        currentMode = button.getAttribute('data-mode');
        displayLeaderboard();
      });
    });
  
    function getModeLabel(mode) {
      switch (mode) {
        case 'produce':
          return 'Produce Only';
        case 'everything':
          return 'Everything';
        case 'non-produce':
          return 'Non-Produce Items';
        case 'picture-mode':
          return 'Picture Mode';
        case 'mixed-mode':
          return 'Mixed Mode';
        default:
          return 'Unknown Mode';
      }
    }
  
    function displayLeaderboard() {
      // Clear existing rows
      leaderboardTableBody.innerHTML = '';
  
      // Filter leaderboard entries by mode
      const filteredLeaderboard = leaderboard.filter(entry => entry.mode === currentMode);
  
      if (filteredLeaderboard.length === 0) {
        const noDataMessage = document.createElement('tr');
        const noDataCell = document.createElement('td');
        noDataCell.colSpan = 3;
        noDataCell.textContent = 'No leaderboard data available for this mode.';
        noDataCell.style.textAlign = 'center';
        noDataMessage.appendChild(noDataCell);
        leaderboardTableBody.appendChild(noDataMessage);
      } else {
        // Sort entries by score
        filteredLeaderboard.sort((a, b) => b.score - a.score);
        // Populate the leaderboard table
        filteredLeaderboard.forEach((entry, index) => {
          const row = document.createElement('tr');
  
          const rankCell = document.createElement('td');
          rankCell.textContent = index + 1;
          row.appendChild(rankCell);
  
          const usernameCell = document.createElement('td');
          usernameCell.textContent = entry.username;
          row.appendChild(usernameCell);
  
          const scoreCell = document.createElement('td');
          scoreCell.textContent = entry.score;
          row.appendChild(scoreCell);
  
          leaderboardTableBody.appendChild(row);
        });
      }
    }
  
    // Initialize the leaderboard display
    displayLeaderboard();
  
    // Back to Quiz button
    backButton.addEventListener('click', () => {
      window.location.href = 'index.html';
    });
  });
  