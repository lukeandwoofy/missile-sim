// Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyCTBoT8wTKSvIrbG6RgNlvqLlWPZ_lKDUg",
  authDomain: "missile-sim-842ce.firebaseapp.com",
  projectId: "missile-sim-842ce",
  storageBucket: "missile-sim-842ce.appspot.com",
  messagingSenderId: "234662986434",
  appId: "1:234662986434:web:e31d19755a02e09d43315b",
  measurementId: "G-TP2TJZHFFZ"
};

firebase.initializeApp(firebaseConfig);
const db = firebase.database();
let currentUser = null;
let currentName = null;
let currentRole = null;
let countdownInterval = null;

// Sign Up
function signUp() {
  const name = document.getElementById("signupName").value;
  const email = document.getElementById("signupEmail").value;
  const password = document.getElementById("signupPassword").value;

  if (!name || !email || !password) {
    alert("Please fill in all fields.");
    return;
  }

  firebase.auth().createUserWithEmailAndPassword(email, password)
    .then(userCredential => {
      currentUser = userCredential.user;
      const uid = currentUser.uid;
      currentName = name;
      db.ref("users/" + uid).set({ name });
      document.getElementById("userInfo").innerText = `Welcome, ${name}`;
      showPanels();
    })
    .catch(error => {
      console.error("Sign-up error:", error);
      alert(error.message);
    });
}

// Log In
function logIn() {
  const email = document.getElementById("loginEmail").value;
  const password = document.getElementById("loginPassword").value;

  if (!email || !password) {
    alert("Please enter both email and password.");
    return;
  }

  firebase.auth().signInWithEmailAndPassword(email, password)
    .then(userCredential => {
      currentUser = userCredential.user;
      const uid = currentUser.uid;
      db.ref("users/" + uid).once("value").then(snapshot => {
        currentName = snapshot.val()?.name || "Commander";
        document.getElementById("userInfo").innerText = `Welcome, ${currentName}`;
        showPanels();
      });
    })
    .catch(error => {
      console.error("Login error:", error);
      alert(error.message);
    });
}

// Show UI panels
function showPanels() {
  document.querySelector(".role").style.display = "block";
  document.querySelector(".controls").style.display = "block";
  document.querySelector(".status").style.display = "block";
  document.querySelector(".log").style.display = "block";
  document.querySelector(".chat").style.display = "block";
}

// Set role
function setRole() {
  currentRole = document.getElementById("roleSelect").value;
  document.getElementById("roleDisplay").innerText = `Role: ${currentRole}`;
}

// Launch missile
function launchMissile() {
  const armed = document.getElementById("armToggle").checked;
  const lat = document.getElementById("lat").value;
  const lon = document.getElementById("lon").value;
  const type = document.getElementById("missileType").value;

  if (!armed) {
    alert("System not armed!");
    return;
  }

  if (!lat || !lon) {
    alert("Enter valid coordinates.");
    return;
  }

  const timestamp = new Date().toLocaleString();
  const logEntry = `${timestamp} - ${currentRole} ${currentName} launched ${type} missile at (${lat}, ${lon})`;

  updateStatus("LAUNCH", armed, timestamp);
  addToLog(logEntry);
  triggerCountdown(type, lat, lon);

  db.ref("log").push({ entry: logEntry });
}

// Abort mission
function abortMission() {
  clearInterval(countdownInterval);
  const timestamp = new Date().toLocaleString();
  const logEntry = `${timestamp} - ${currentRole} ${currentName} aborted mission`;

  updateStatus("ABORT", false, timestamp);
  addToLog(logEntry);
  document.getElementById("launchAnimation").innerHTML = "";

  db.ref("log").push({ entry: logEntry });
}

// Update status panel
function updateStatus(action, armed, timestamp) {
  document.getElementById("armedStatus").innerText = armed;
  document.getElementById("lastAction").innerText = action;
  document.getElementById("timestamp").innerText = timestamp;
}

// Add to mission log
function addToLog(text) {
  const li = document.createElement("li");
  li.innerText = text;
  document.getElementById("missionLog").appendChild(li);
}

// Countdown and launch animation
function triggerCountdown(type, lat, lon) {
  let timeLeft = 10;
  const anim = document.getElementById("launchAnimation");
  anim.innerHTML = `<p>Countdown initiated for ${type} missile...</p><p id="countdown">${timeLeft}</p>`;

  countdownInterval = setInterval(() => {
    timeLeft--;
    document.getElementById("countdown").textContent = timeLeft;
    if (timeLeft <= 0) {
      clearInterval(countdownInterval);
      executeLaunch(type, lat, lon);
    }
  }, 1000);
}

function executeLaunch(type, lat, lon) {
  const anim = document.getElementById("launchAnimation");
  anim.innerHTML = `
    <p>🚀 ${type} missile launched to:<br><strong>${lat}, ${lon}</strong></p>
    <div class="flash-bar"></div>
    <p>💥 Impact simulated. Mission complete.</p>
  `;
}

// Send chat message
function sendMessage() {
  const msg = document.getElementById("messageInput").value;
  if (!msg.trim()) return;

  const timestamp = new Date().toLocaleTimeString();
  const message = `${timestamp} - ${currentRole} ${currentName}: ${msg}`;

  db.ref("chat").push({ message });
  document.getElementById("messageInput").value = "";
}

// Listen for chat updates
db.ref("chat").on("child_added", snapshot => {
  const msg = snapshot.val().message;
  const div = document.createElement("div");
  div.innerText = msg;
  document.getElementById("messages").appendChild(div);
});

// Load mission log on startup
db.ref("log").on("child_added", snapshot => {
  const entry = snapshot.val().entry;
  addToLog(entry);
});
