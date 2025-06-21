document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('match-setup-form');

  form.addEventListener('submit', function (e) {
    e.preventDefault();

    const team1 = document.getElementById('t1-name').value.trim();
    const team2 = document.getElementById('t2-name').value.trim();
    const overs = document.getElementById('overs').value.trim();

    if (!team1 || !team2 || !overs) {
      return; // Form-level validation already in place
    }

    const matchData = {
      team1,
      team2,
      overs: parseInt(overs)
    };

    localStorage.setItem('cricsnap-matchInfo', JSON.stringify(matchData));

    // Show toast
    const toastEl = document.getElementById('matchToast');
    const toast = new bootstrap.Toast(toastEl);
    toast.show();

    // Redirect after 2 seconds
    setTimeout(() => {
      window.location.href = 'players_details.html';
    }, 2000);
  });
});
