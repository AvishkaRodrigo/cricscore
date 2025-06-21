let matchData, playersData;
let state = {
  battingTeam: null,
  team1Score: 0,
  team2Score: 0,
  team1Balls: 0,
  team2Balls: 0,
  team1Wickets: 0,
  team2Wickets: 0,
  maxBalls: 0,
  currentInning: 1
};

document.addEventListener("DOMContentLoaded", () => {
  matchData = JSON.parse(localStorage.getItem("cricsnap-matchInfo"));
  playersData = JSON.parse(localStorage.getItem("cricsnap-players"));

  if (!matchData || !playersData) {
    alert("Match or player data missing!");
    return;
  }

  state.maxBalls = matchData.overs * 6;

  const savedState = localStorage.getItem("cricsnap-scoreboard");
  if (savedState) {
    state = JSON.parse(savedState);
  } else {
    setupBattingSelection();
  }

  // generateRunButtons();
  updateScoreDisplay();
});

function setupBattingSelection() {
  const modalBody = document.getElementById("batting-team-options");
  modalBody.innerHTML = `
    <button class="btn btn-dark m-2" onclick="selectBattingTeam('team1')">${matchData.team1}</button>
    <button class="btn btn-dark m-2" onclick="selectBattingTeam('team2')">${matchData.team2}</button>
  `;
  new bootstrap.Modal(document.getElementById("battingModal")).show();
}

function selectBattingTeam(team) {
  state.battingTeam = team;
  state.currentInning = 1;
  saveState();
  bootstrap.Modal.getInstance(document.getElementById("battingModal")).hide();
  updateScoreDisplay();
}

  // function generateRunButtons() {
  //   const runButtons = document.getElementById("run-buttons");
  //   for (let i = 0; i <= 7; i++) {
  //     const btn = document.createElement("button");
  //     btn.className = "btn btn-primary mx-1";
  //     btn.innerText = i;
  //     btn.onclick = () => addRun(i);
  //     runButtons.appendChild(btn);
  //   }
  // }

function addRun(runs) {
  if (!state.battingTeam) return;

  const scoreKey = state.battingTeam === "team1" ? "team1Score" : "team2Score";
  const ballKey = state.battingTeam === "team1" ? "team1Balls" : "team2Balls";

  state[scoreKey] += runs;
  state[ballKey] += 1;

  checkInningEnd();
  saveState();
  updateScoreDisplay();
  checkWinCondition();
}

function addExtra(type) {
  if (!state.battingTeam) return;
  const scoreKey = state.battingTeam === "team1" ? "team1Score" : "team2Score";
  state[scoreKey] += 1;
  saveState();
  updateScoreDisplay();
  checkWinCondition();
}

function addWicket() {
  if (!state.battingTeam) return;

  const wicketKey = state.battingTeam === "team1" ? "team1Wickets" : "team2Wickets";
  const ballKey = state.battingTeam === "team1" ? "team1Balls" : "team2Balls";

  const maxWickets = playersData[state.battingTeam].length - 1;

  if (state[wicketKey] >= maxWickets) return;

  state[wicketKey] += 1;
  state[ballKey] += 1;

  // Check for All Out
  if (state[wicketKey] >= maxWickets) {
    alert("All Out!");
    handleInningChange();
    return;
  }

  checkInningEnd();
  saveState();
  updateScoreDisplay();
  checkWinCondition();
}


function checkInningEnd() {
  const ballKey = state.battingTeam === "team1" ? "team1Balls" : "team2Balls";
  if (state[ballKey] >= state.maxBalls) {
    handleInningChange();
  }
}

function handleInningChange() {
  if (state.currentInning === 1) {
    state.battingTeam = state.battingTeam === "team1" ? "team2" : "team1";
    state.currentInning = 2;
    alert("Innings over! Switching teams.");
  } else {
    alert("Match complete!");
  }
  saveState();
  updateScoreDisplay();
}

function updateScoreDisplay() {
  const overs1 = `${Math.floor(state.team1Balls / 6)}.${state.team1Balls % 6}`;
  const overs2 = `${Math.floor(state.team2Balls / 6)}.${state.team2Balls % 6}`;

  const team1Display = `${state.team1Wickets}/${state.team1Score} (${overs1})`;
  const team2Display = `${state.team2Wickets}/${state.team2Score} (${overs2})`;
  const scoreText = `
    ${matchData.team1}: ${team1Display} | ${matchData.team2}: ${team2Display}
    | Batting: ${matchData[state.battingTeam] || "?"}
  `;
  document.getElementById("scoreDisplay").innerText = scoreText;

  // === Target Info for 2nd Innings ===
  const targetDiv = document.getElementById("targetDisplay");
  if (state.currentInning === 2) {
    if (state.currentInning === 2) {
  const firstBattingTeam = state.battingTeam === "team1" ? "team2" : "team1";
  const secondBattingTeam = state.battingTeam;

  const firstScore = state[firstBattingTeam + "Score"];
  const secondScore = state[secondBattingTeam + "Score"];
  const secondBalls = state[secondBattingTeam + "Balls"];

  const target = firstScore + 1;
  const ballsRemaining = state.maxBalls - secondBalls;
  const runsNeeded = target - secondScore;

  if (runsNeeded > 0 && ballsRemaining > 0) {
    targetDiv.innerText = `Target: Need ${runsNeeded} run${runsNeeded > 1 ? 's' : ''} in ${ballsRemaining} ball${ballsRemaining > 1 ? 's' : ''}`;
  } else if (runsNeeded <= 0) {
    targetDiv.innerText = `🎉 ${matchData[secondBattingTeam]} won the match!`;
  } else {
    targetDiv.innerText = `⚠️ Match Over`;
  }
} else {
  targetDiv.innerText = "";
}

  } else {
    targetDiv.innerText = ""; // Clear during first innings
  }
}

function checkWinCondition() {
  // Only evaluate win when second innings is in progress
  if (state.currentInning !== 2) return;

  const firstBattingTeam = state.battingTeam === "team1" ? "team2" : "team1";
  const secondBattingTeam = state.battingTeam;

  const firstScore = state[firstBattingTeam + "Score"];
  const secondScore = state[secondBattingTeam + "Score"];
  const secondBalls = state[secondBattingTeam + "Balls"];
  const secondWickets = state[secondBattingTeam + "Wickets"];
  const maxWickets = playersData[secondBattingTeam].length - 1;

  const target = firstScore + 1;

  if (secondScore >= target) {
    alert(`${matchData[secondBattingTeam]} won the match!`);
    return;
  }

  if (secondWickets >= maxWickets || secondBalls >= state.maxBalls) {
    if (secondScore < target - 1) {
      alert(`${matchData[firstBattingTeam]} won the match!`);
    } else {
      alert(`Match tied!`);
    }
  }
}



function saveState() {
  localStorage.setItem("cricsnap-scoreboard", JSON.stringify(state));
}
function resetGame() {
  localStorage.removeItem("cricsnap-scoreboard");
  localStorage.removeItem("cricsnap-players");
  localStorage.removeItem("cricsnap-matchInfo");
  window.location.href = "index.html"
}
