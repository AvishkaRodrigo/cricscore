document.addEventListener('DOMContentLoaded', () => {
  const matchData = JSON.parse(localStorage.getItem('cricsnap-matchInfo')) || {};
  document.getElementById('team1-name').innerText = matchData.team1 || "Team 1";
  document.getElementById('team2-name').innerText = matchData.team2 || "Team 2";

  // Add one default row to each team
  addPlayer('team1', true);
  addPlayer('team2', true);
});

let playerCounts = { team1: 0, team2: 0 };

function addPlayer(team, isInitial = false) {
  const tableBody = document.querySelector(`#${team}-table tbody`);
  playerCounts[team] += 1;

  const row = document.createElement('tr');
  row.innerHTML = `
    <td>${playerCounts[team]}</td>
    <td><input type="text" class="form-control" placeholder="Player Name"></td>
  `;
  tableBody.appendChild(row);
}

function showToast(message, type = "danger") {
  const toastEl = document.getElementById('playerToast');
  const toastBody = document.getElementById('toast-message');

  toastBody.innerText = message;
  toastEl.className = `toast align-items-center text-bg-${type} border-0`;

  const toast = new bootstrap.Toast(toastEl);
  toast.show();
}

function validatePlayers() {
  const team1Inputs = document.querySelectorAll('#team1-table tbody input');
  const team2Inputs = document.querySelectorAll('#team2-table tbody input');

  const team1Players = Array.from(team1Inputs).map(input => input.value.trim());
  const team2Players = Array.from(team2Inputs).map(input => input.value.trim());

  const validTeam1 = team1Players.filter(name => name !== "");
  const validTeam2 = team2Players.filter(name => name !== "");

  // Rule 1: No players at all
  if (validTeam1.length === 0 && validTeam2.length === 0) {
    showToast("At least one player is required to continue.");
    return;
  }

  // Rule 2: Empty player fields exist
  if (team1Players.includes("") || team2Players.includes("")) {
    showToast("Please fill all player name fields.");
    return;
  }

  // Rule 3: Unequal players
  if (validTeam1.length !== validTeam2.length) {
    showToast("Teams must have the same number of players.");
    return;
  }

  // All good — store and proceed
  localStorage.setItem('cricsnap-players', JSON.stringify({
    team1: validTeam1,
    team2: validTeam2
  }));

  showToast("Player details saved successfully!", "success");

  setTimeout(() => window.location.href = "scoreboard.html", 1500);
}
