let authenticated = false;
let countdownInterval = null;

function authenticate() {
  const code = document.getElementById("accessCode").value;
  if (code === "launch123") {
    authenticated = true;
    document.getElementById("authStatus").textContent = "UNLOCKED";
    document.getElementById("authStatus").style.color = "#00ff88";
    document.querySelector(".controls").style.display = "block";
    document.querySelector(".status").style.display = "block";
    document.querySelector(".log").style.display = "block";
  } else {
    alert("Invalid code.");
  }
}

function launchMissile() {
  if (!authenticated) return alert("Access denied.");
  const armed = document.getElementById("armToggle").checked;
  if (!armed) return alert("System not armed.");

  const lat = document.getElementById("lat").value;
  const lon = document.getElementById("lon").value;
  if (!lat || !lon) return alert("Enter valid coordinates.");

  const missileType = document.getElementById("missileType").value;

  document.getElementById("armedStatus").textContent = "true";
  document.getElementById("lastAction").textContent = "LAUNCH";
  document.getElementById("timestamp").textContent = new Date().toLocaleString();

  logMission("LAUNCH", missileType, lat, lon);
  startCountdown(missileType, lat, lon);
}

function abortMission() {
  clearInterval(countdownInterval);
  document.getElementById("armedStatus").textContent = "false";
  document.getElementById("lastAction").textContent = "ABORT";
  document.getElementById("timestamp").textContent = new Date().toLocaleString();
  document.getElementById("launchAnimation").innerHTML = "";
  const lat = document.getElementById("lat").value;
  const lon = document.getElementById("lon").value;
  logMission("ABORT", "", lat, lon);
}

function startCountdown(missileType, lat, lon) {
  let timeLeft = 10;
  const anim = document.getElementById("launchAnimation");
  anim.innerHTML = `<p>Countdown initiated for ${missileType} missile...</p><p id="countdown">${timeLeft}</p>`;

  countdownInterval = setInterval(() => {
    timeLeft--;
    document.getElementById("countdown").textContent = timeLeft;
    if (timeLeft <= 0) {
      clearInterval(countdownInterval);
      executeLaunch(missileType, lat, lon);
    }
  }, 1000);
}

function executeLaunch(missileType, lat, lon) {
  const anim = document.getElementById("launchAnimation");
  anim.innerHTML = `
    <p>🚀 ${missileType} missile launched to:<br><strong>${lat}, ${lon}</strong></p>
    <div class="flash-bar"></div>
    <p>💥 Impact simulated. Mission complete.</p>
  `;
}

function logMission(action, type, lat, lon) {
  const log = document.getElementById("missionLog");
  const entry = document.createElement("li");
  entry.textContent = `${new Date().toLocaleString()} — ${action} ${type ? type : ""} → ${lat}, ${lon}`;
  log.prepend(entry);
}
