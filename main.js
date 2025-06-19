document.addEventListener('DOMContentLoaded', function () {
  const form = document.querySelector('form');

  form.addEventListener('submit', function (e) {
    e.preventDefault(); // Prevent page reload

    const team1 = document.getElementById('t1-name').value.trim();
    const team2 = document.getElementById('t2-name').value.trim();
    const overs = document.getElementById('overs').value.trim();

    // Basic validation
    if (!team1 || !team2 || !overs) {
      alert("Please fill in all fields.");
      return;
    }

    // Store in localStorage
    const matchInfo = {
      team1,
      team2,
      overs: parseFloat(overs)
    };

    console.log("Match Info:", matchInfo); // Debugging line to check match info

    localStorage.setItem('cricsnap-matchInfo', JSON.stringify(matchInfo));

    // Redirect or notify
    alert("Match setup saved!");
    // Optionally redirect to another page:
    // window.location.href = "scoreboard.html";
  });
});
