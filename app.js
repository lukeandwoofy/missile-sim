let authenticated = false;

function authenticate() {
  const code = document.getElementById("accessCode").value;
  if (code === "launch123") {
    authenticated = true;
    document.getElementById("authStatus").textContent = "UNLOCKED";
    document.getElementById("authStatus").style.color = "#00ff88";
    document.querySelector(".controls").style.display = "block";
    document.querySelector(".status").style.display = "block";
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

  document.getElementById("armedStatus").textContent = "true";
  document.getElementById("lastAction").textContent = "LAUNCH";
  document.getElementById("timestamp").textContent = new Date().toLocaleString();

  animateLaunch(lat, lon);
}

function abortMission() {
  document.getElementById("armedStatus").textContent = "false";
  document.getElementById("lastAction").textContent = "ABORT";
  document.getElementById("timestamp").textContent = new Date().toLocaleString();
  document.getElementById("launchAnimation").innerHTML = "";
}

function animateLaunch(lat, lon) {
  const anim = document.getElementById("launchAnimation");
  anim.innerHTML = `
    <p>🚀 Missile launched to coordinates:<br><strong>${lat}, ${lon}</strong></p>
    <div class="flash-bar"></div>
    <p>💥 Impact simulated. Mission complete.</p>
  `;
}
