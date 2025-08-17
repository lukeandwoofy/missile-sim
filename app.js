let authenticated = false;
let selectedLat = null;
let selectedLon = null;
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
    initMap();
  } else {
    alert("Invalid code.");
  }
}

function initMap() {
  const map = L.map('map').setView([20, 0], 2);
  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: 'Map data © OpenStreetMap contributors'
  }).addTo(map);

  map.on('click', function(e) {
    selectedLat = e.latlng.lat.toFixed(6);
    selectedLon = e.latlng.lng.toFixed(6);
    document.getElementById("selectedCoords").textContent = `${selectedLat}, ${selectedLon}`;
  });
}

function launchMissile() {
  if (!authenticated) return alert("Access denied.");
  const armed = document.getElementById("armToggle").checked;
  if (!armed) return alert("System not armed.");
  if (!selectedLat || !selectedLon) return alert("Select target coordinates.");

  const missileType = document.getElementById("missileType").value;

  document.getElementById("armedStatus").textContent = "true";
  document.getElementById("lastAction").textContent = "LAUNCH";
  document.getElementById("timestamp").textContent = new Date().toLocaleString();

  logMission("LAUNCH", missileType, selectedLat, selectedLon);
  startCountdown(missileType);
}

function abortMission() {
  clearInterval(countdownInterval);
  document.getElementById("armedStatus").textContent = "false";
  document.getElementById("lastAction").textContent = "ABORT";
  document.getElementById("timestamp").textContent = new Date().toLocaleString();
  document.getElementById("launchAnimation").innerHTML = "";
  logMission("ABORT", "", selectedLat, selectedLon);
}

function startCountdown(missileType) {
  let timeLeft = 10;
  const anim = document.getElementById("launchAnimation");
  anim.innerHTML = `<p>Countdown initiated for ${missileType} missile...</p><p id="countdown">${timeLeft}</p>`;

  countdownInterval = setInterval(() => {
    timeLeft--;
    document.getElementById("countdown").textContent = timeLeft;
    if (timeLeft <= 0) {
      clearInterval(countdownInterval);
      executeLaunch(missileType);
    }
  }, 1000);
}

function executeLaunch(missileType) {
  const anim = document.getElementById("launchAnimation");
  anim.innerHTML = `
    <p>🚀 ${missileType} missile launched to:<br><strong>${selectedLat}, ${selectedLon}</strong></p>
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
