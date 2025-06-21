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
    showToast("Match or player data missing!", "danger");
    return;
  }

  state.maxBalls = matchData.overs * 6;

  const savedState = localStorage.getItem("cricsnap-scoreboard");
  if (savedState) {
    state = JSON.parse(savedState);
  } else {
    setupBattingSelection();
  }

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
  showToast(`Out!`, "danger");

  const wicketKey = state.battingTeam === "team1" ? "team1Wickets" : "team2Wickets";
  const ballKey = state.battingTeam === "team1" ? "team1Balls" : "team2Balls";

  const maxWickets = playersData[state.battingTeam].length - 1;

  if (state[wicketKey] >= maxWickets) return;

  state[wicketKey] += 1;
  state[ballKey] += 1;

  if (state[wicketKey] >= maxWickets) {
    showToast("All Out!", "warning");
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
    showToast("Innings over! Switching teams.", "info");
  } else {
    showToast("Match complete!", "success");
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
    ${matchData.team1}: ${team1Display} \n ${matchData.team2}: ${team2Display}
    \n Batting: ${matchData[state.battingTeam] || "?"}
  `;
  document.getElementById("scoreDisplay").innerText = scoreText;

  const targetDiv = document.getElementById("targetDisplay");
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
      showToast(`Match Over`, "secondary");
    }
  } else {
    targetDiv.innerText = "";
  }
}

function checkWinCondition() {
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
    showToast(`${matchData[secondBattingTeam]} won the match!`, "success");
    return;
  }

  if (secondWickets >= maxWickets || secondBalls >= state.maxBalls) {
    if (secondScore < target) {
      showToast(`${matchData[firstBattingTeam]} won the match!`, "success");
    } else {
      showToast(`Match tied!`, "secondary");
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
  window.location.href = "index.html";
}

function showToast(message, type = "info") {
  const toastContainer = document.getElementById("toastContainer");

  const toastId = `toast-${Date.now()}`;
  const toastHtml = `
    <div id="${toastId}" class="toast align-items-center text-white bg-${type} border-0 mb-2" role="alert" aria-live="assertive" aria-atomic="true">
      <div class="d-flex">
        <div class="toast-body">
          ${message}
        </div>
        <button type="button" class="btn-close btn-close-white me-2 m-auto" data-bs-dismiss="toast" aria-label="Close"></button>
      </div>
    </div>
  `;

  toastContainer.insertAdjacentHTML("beforeend", toastHtml);

  const toastElement = document.getElementById(toastId);
  const bsToast = new bootstrap.Toast(toastElement, { delay: 3000 });
  bsToast.show();

  toastElement.addEventListener("hidden.bs.toast", () => toastElement.remove());
}
