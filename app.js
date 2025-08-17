// Initialize Firebase
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
const db = firebase.database();

// Global state
let currentUser = null;
let currentRole = null;

// Google Sign-In
document.getElementById("loginBtn").addEventListener("click", () => {
  const provider = new firebase.auth.GoogleAuthProvider();
  firebase.auth().signInWithPopup(provider)
    .then(result => {
      currentUser = result.user;
      document.getElementById("userInfo").innerText = `Welcome, ${currentUser.displayName}`;
      showPanels();
    })
    .catch(error => {
      console.error("Sign-in error:", error);
      alert("Sign-in failed. Check console for details.");
    });
});

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
  const logEntry = `${timestamp} - ${currentRole} ${currentUser.displayName} launched ${type} missile at (${lat}, ${lon})`;

  updateStatus("LAUNCH", armed, timestamp);
  addToLog(logEntry);
  triggerAnimation();

  db.ref("log").push({ entry: logEntry });
}

// Abort mission
function abortMission() {
  const timestamp = new Date().toLocaleString();
  const logEntry = `${timestamp} - ${currentRole} ${currentUser.displayName} aborted mission`;

  updateStatus("ABORT", false, timestamp);
  addToLog(logEntry);

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

// Trigger launch animation
function triggerAnimation() {
  const anim = document.getElementById("launchAnimation");
  anim.innerText = "🚀 Missile Launched!";
  anim.style.color = "red";
  anim.style.fontSize = "24px";
  setTimeout(() => {
    anim.innerText = "";
  }, 3000);
}

// Send chat message
function sendMessage() {
  const msg = document.getElementById("messageInput").value;
  if (!msg.trim()) return;

  const timestamp = new Date().toLocaleTimeString();
  const message = `${timestamp} - ${currentRole} ${currentUser.displayName}: ${msg}`;

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
