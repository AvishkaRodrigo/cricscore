document.addEventListener('DOMContentLoaded', () => {
  // Load team names
  const matchData = JSON.parse(localStorage.getItem('cricSnapMatchInfo')) || {};
  document.getElementById('team1-name').innerText = matchData.team1 || "Team 1";
  document.getElementById('team2-name').innerText = matchData.team2 || "Team 2";
});

let playerCounts = { team1: 0, team2: 0 };

function addPlayer(team) {
  const tableBody = document.querySelector(`#${team}-table tbody`);
  playerCounts[team] += 1;

  const row = document.createElement('tr');
  row.innerHTML = `
    <td>${playerCounts[team]}</td>
    <td><input type="text" class="form-control" placeholder="Player Name" required></td>
  `;
  tableBody.appendChild(row);
}

function validatePlayers() {
  const team1Inputs = document.querySelectorAll('#team1-table tbody input');
  const team2Inputs = document.querySelectorAll('#team2-table tbody input');

  if (team1Inputs.length !== team2Inputs.length) {
    const proceed = confirm("Number of players is not equal. Do you still want to continue?");
    if (!proceed) return;
  }

  const team1Players = Array.from(team1Inputs).map(input => input.value.trim()).filter(Boolean);
  const team2Players = Array.from(team2Inputs).map(input => input.value.trim()).filter(Boolean);

  if (team1Players.length < team1Inputs.length || team2Players.length < team2Inputs.length) {
    alert("Please fill all player names.");
    return;
  }

  localStorage.setItem('cricsnap-players', JSON.stringify({
    team1: team1Players,
    team2: team2Players
  }));

  alert("Players saved successfully!");
  // window.location.href = 'scoreboard.html';
}
