// ===== EDIT THIS FILE =====
window.CONFIG = {
  title: "Max Batch Scramble",
  teams: ["Team 1", "Team 2", "Team 3", "Team 4"],   // rename anytime
  pars: [4,5,3,4,4,3,4,4,5,4,4,3,5,4,5,4,3,4],       // 18 holes, par 72

  // Optional real phone alerts (free, via the ntfy app). Pick a long random topic, e.g. "maxbatch-7f3k9q2x".
  // Leave "" to turn off.
  ntfyTopic: "",

  // Paste your Firebase web config here (see SETUP.md step 3). Leave databaseURL "" for local test mode.
  firebase: {
  apiKey: "AIzaSyCuUB8kKzW0uoRuvDQFTpdkzyuCzWEwGAs",
  authDomain: "max-batch.firebaseapp.com",
  databaseURL: "https://max-batch-default-rtdb.firebaseio.com",
  projectId: "max-batch",
  storageBucket: "max-batch.firebasestorage.app",
  messagingSenderId: "454878593778",
  appId: "1:454878593778:web:7a699cc6a3651f5235066b",
  measurementId: "G-V4CTGZ301L"
  }
};
