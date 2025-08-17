const firebaseConfig = {
  apiKey: "AIzaSyCTBoT8wTKSvIrbG6RgNlvqLlWPZ_lKDUg",
  authDomain: "missile-sim-842ce.firebaseapp.com",
  projectId: "missile-sim-842ce",
  storageBucket: "missile-sim-842ce.firebasestorage.app",
  messagingSenderId: "234662986434",
  appId: "1:234662986434:web:e31d19755a02e09d43315b",
  measurementId: "G-TP2TJZHFFZ"
};


firebase.initializeApp(firebaseConfig);
const auth = firebase.auth();
const db = firebase.database();

let countdownInterval = null;
let currentUser = null;

document.getElementById("loginBtn").onclick = () => {
  const provider = new firebase.auth.GoogleAuthProvider();
  auth.signInWithPopup(provider).then(result => {
    currentUser = result.user;
    document.getElementById("userInfo").innerText = `Welcome, ${currentUser.displayName}`;
    document.querySelector(".controls").style.display = "block";
    document.querySelector(".status").style.display = "block";
    document.querySelector(".log").style.display = "block";
    document.querySelector(".chat").style.display = "block";
    document.querySelector(".role").style.display = "block";
    loadRole();
  });
};

function setRole() {
  const role = document.getElementById("roleSelect").value;
  db.ref("roles/" + currentUser.uid).set({ role });
  document.getElementById("roleDisplay").innerText = `Role: ${role}`;
}

function loadRole() {
  db.ref("roles/" + currentUser.uid).once("value").then(snapshot => {
    const role = snapshot.val()?.role;
    if (role) {
      document.getElementById("roleDisplay").innerText = `Role: ${role}`;
    }
  });
}

function launchMissile() {
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
  anim.innerHTML = `<p>Countdown initiated for ${missileType} missile...</p><p
