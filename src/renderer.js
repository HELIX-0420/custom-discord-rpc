const { ipcRenderer } = require("electron");

// === Custom Update UI ===
ipcRenderer.on("update-available", () => {
  const overlay = document.getElementById("updateOverlay");
  if (overlay) overlay.style.display = "flex";
});

ipcRenderer.on("update-ready", () => {
  const updateNowBtn = document.getElementById("updateNowBtn");
  if (updateNowBtn) {
    updateNowBtn.innerText = "Restart & Update";
    updateNowBtn.onclick = () => {
      console.log("🖱️ [RENDERER] Restart & Update clicked");
      ipcRenderer.send("restart-to-update");
    };
    updateNowBtn.style.display = "inline-block";
  }
});

ipcRenderer.on("update-progress", (event, progress) => {
  const progressBar = document.getElementById("updateProgress");
  const progressText = document.getElementById("progressText");

  if (progressBar && progress.percent) {
    const value = Math.floor(progress.percent);
    progressBar.value = value;
    if (progressText) progressText.innerText = `${value}%`;
  }
});

ipcRenderer.on("update-error", (event, error) => {
  alert("Updater failed: " + error);
  console.error("Updater error:", error);
});

function beginUpdate() {
  const overlay = document.getElementById("updateOverlay");
  if (!overlay) return;

  const title = document.getElementById("updateTitle");
  const updateNowBtn = document.getElementById("updateNowBtn");
  const skipBtn = document.getElementById("skipBtn");

  if (title) title.style.display = "none";
  if (updateNowBtn) updateNowBtn.style.display = "none";
  if (skipBtn) skipBtn.style.display = "none";

  const progressBar = document.getElementById("updateProgress");
  const progressText = document.getElementById("progressText");

  if (progressBar) progressBar.style.display = "block";
  if (progressText) progressText.style.display = "block";

  ipcRenderer.send("start-update-download");
}

function hideUpdateOverlay() {
  const overlay = document.getElementById("updateOverlay");
  if (overlay) overlay.style.display = "none";
};

window.addEventListener("DOMContentLoaded", () => {
// === Live Preview Elements ===
const previewAppName = document.getElementById("previewAppName");
const previewLine1 = document.getElementById("previewLine1");
const previewLine2 = document.getElementById("previewLine2");
const previewType = document.getElementById("previewType");
const previewBigIcon = document.querySelector(".rpc-icon");
const previewSmallIcon = document.querySelector(".rpc-smallicon");
const previewTime = document.getElementById("previewTime");
const rpcButtonsContainer = document.getElementById("rpc-buttons-container");

// === Inputs ===
const inputAppId = document.getElementById("appId");
const inputAppName = document.getElementById("rpcAppName");
const inputLine1 = document.getElementById("rpcLine1");
const inputLine2 = document.getElementById("rpcLine2");
const inputMission = document.getElementById("rpcMission");
const inputBigImage = document.querySelectorAll("#imageUrl")[0];
const inputSmallImage = document.querySelectorAll("#imageUrl")[1];
const inputRpcType = document.getElementById("rpcType");
const minPlayersInput = document.getElementById("minPlayers");
const maxPlayersInput = document.getElementById("maxPlayers");

// Buttons
const button1Label = document.getElementById("button1Label");
const button1Url = document.getElementById("button1Url");
const button2Label = document.getElementById("button2Label");
const button2Url = document.getElementById("button2Url");

// Connect & Disconnect Buttons
const connectButton = document.getElementById("connectButton");
const disconnectButton = document.getElementById("disconnectButton");

// Utility
function safeHtml(text) {
  return text.replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

// Inline Status Display
const inlineStatus = document.createElement("span");
inlineStatus.id = "inlineStatus";
inlineStatus.style.marginLeft = "8px";
inlineStatus.style.color = "#aaa";
inlineStatus.style.fontStyle = "italic";
previewTime.after(inlineStatus);

// Update Inline Status
function updateInlineStatus() {
  const text = inputLine2.value.trim();
  const min = parseInt(minPlayersInput.value);
  const max = parseInt(maxPlayersInput.value);
  const hasMin = !isNaN(min) && min > 0;
  const hasMax = !isNaN(max) && max > 0;

  let playerText = "";
  if (hasMin && hasMax) playerText = ` (${min} of ${max})`;
  else if (hasMin) playerText = ` (${min} of 0)`;
  else if (hasMax) playerText = ` (0 of ${max})`;

  if ((hasMin || hasMax) && text) {
    previewLine2.style.display = "none";
    inlineStatus.innerHTML = `<i class="fa-solid fa-user-group"></i> ${safeHtml(text)}${playerText}`;
  } else {
    previewLine2.textContent = safeHtml(text);
    previewLine2.style.display = text ? "block" : "none";
    inlineStatus.textContent = "";
  }
}

ipcRenderer.on('update-available', () => {
  showUpdateOverlay(); // you’ll make this
});

ipcRenderer.on('update-ready', () => {
  document.getElementById('updateNowBtn').innerText = "Restart & Update";
  document.getElementById('updateNowBtn').onclick = () => {
    ipcRenderer.send('restart-to-update');
  };
});

function beginUpdate() {
  ipcRenderer.send('start-update-download');
  document.getElementById('updateNowBtn').innerText = "Downloading...";
}

function showUpdateOverlay() {
  document.getElementById('updateOverlay').style.display = 'flex';
}

function hideUpdateOverlay() {
  document.getElementById('updateOverlay').style.display = 'none';
}

// Preview Update Handlers
inputAppName.addEventListener("input", () => {
  previewAppName.textContent = safeHtml(inputAppName.value) || "App name";
});
inputLine1.addEventListener("input", () => {
  const text = inputLine1.value.trim();
  previewLine1.textContent = safeHtml(text);
  previewLine1.style.display = text ? "block" : "none";
});
inputLine2.addEventListener("input", updateInlineStatus);
minPlayersInput.addEventListener("input", updateInlineStatus);
maxPlayersInput.addEventListener("input", updateInlineStatus);
inputBigImage.addEventListener("input", () => {
  previewBigIcon.src = inputBigImage.value.trim() || "https://biq.cloud/wp-content/uploads/2021/02/283-content-management-systems-CMS.gif";
});
inputSmallImage.addEventListener("input", () => {
  const url = inputSmallImage.value.trim();
  previewSmallIcon.src = url || "https://media0.giphy.com/media/llQMjpdCwjdrVGzz1d/200w.gif";
  previewSmallIcon.style.display = url ? "block" : "none";
});
function updateRpcTypeUI() {
  const type = inputRpcType.value;
  previewType.textContent = type || "Preview";
  const show = type === "Playing";
  document.getElementById("minPlayersContainer").style.display = show ? "block" : "none";
  document.getElementById("maxPlayersContainer").style.display = show ? "block" : "none";
}

inputRpcType.addEventListener("change", updateRpcTypeUI);
// updateRpcTypeUI(); // 👈 Run once at start

// Update Buttons
function updateButtons() {
  rpcButtonsContainer.innerHTML = "";

  const b1Text = button1Label.value.trim();
  const b1Url = button1Url.value.trim();
  const b2Text = button2Label.value.trim();
  const b2Url = button2Url.value.trim();

  if (b1Text) {
    const btn1 = document.createElement("a");
    btn1.href = b1Url || "#";
    btn1.textContent = b1Text;
    btn1.className = "rpc-buttons";
    btn1.target = b1Url ? "_blank" : "_self";
    btn1.style.display = "block";
    btn1.style.marginBottom = "8px";
    rpcButtonsContainer.appendChild(btn1);
  }

  if (b2Text) {
    const btn2 = document.createElement("a");
    btn2.href = b2Url || "#";
    btn2.textContent = b2Text;
    btn2.className = "rpc-buttons";
    btn2.target = b2Url ? "_blank" : "_self";
    btn2.style.display = "block";
    rpcButtonsContainer.appendChild(btn2);
  }
}
[button1Label, button1Url, button2Label, button2Url].forEach(input => input.addEventListener("input", updateButtons));

// DOM Loaded
window.addEventListener("DOMContentLoaded", () => {
  previewSmallIcon.style.display = inputSmallImage.value.trim() ? "block" : "none";
  inputRpcType.dispatchEvent(new Event("change"));
  updateInlineStatus();
  updateButtons();
});

// Timestamp Logic
const timestampModeSelect = document.getElementById("timestampMode");
let timerInterval;
function setTimeWithDice(text) {
  previewTime.innerHTML = `<i class="fa-solid fa-dice-five" style="margin-right:6px;"></i> ${text}`;
}
function formatElapsedTime(seconds) {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins}:${secs.toString().padStart(2, '0')}`;
}
function getLocalTime() {
  return new Date().toLocaleTimeString();
}
timestampModeSelect.addEventListener("change", () => {
  if (timerInterval) clearInterval(timerInterval);
  const mode = timestampModeSelect.value;
  if (mode === "none") {
    let elapsed = 0;
    setTimeWithDice("0:00");
    timerInterval = setInterval(() => {
      elapsed++;
      setTimeWithDice(formatElapsedTime(elapsed));
    }, 1000);
  } else if (mode === "local") {
    setTimeWithDice(getLocalTime());
    timerInterval = setInterval(() => {
      setTimeWithDice(getLocalTime());
    }, 1000);
  } else {
    previewTime.textContent = "";
  }
});
timestampModeSelect.dispatchEvent(new Event("change"));

// Discord Login
const loginButton = document.getElementById("loginWithDiscord");
if (loginButton) {
  loginButton.addEventListener("click", () => {

    const authUrl = `https://discord.com/oauth2/authorize?client_id=854081780327252011&redirect_uri=http://localhost:5173/callback&response_type=code&scope=identify`;
    window.open(authUrl, "_blank", "width=500,height=700");

  });
}

const badgeIcons = {
  [1 << 0]: "https://static.wikia.nocookie.net/discord/images/8/8b/Discord-staff.png/revision/latest?cb=20221111200951", // Staff
  [1 << 1]: "htthttps://upload.wikimedia.org/wikipedia/commons/thumb/5/52/Discord_Partnership_Badge.svg/1200px-Discord_Partnership_Badge.svg.png", // Partner
  [1 << 2]: "https://img.icons8.com/?size=512&id=h6eKoXSRNFgA&format=png", // HypeSquad Events
  [1 << 3]: "https://static.wikia.nocookie.net/discord/images/0/08/Bug_hunter_badge.png/revision/latest?cb=20210611054806", // Bug Hunter Level 1
  [1 << 6]: "https://static.wikia.nocookie.net/zarena/images/1/1a/Discord_bravery.png/revision/latest?cb=20210131043839", // House Bravery
  [1 << 7]: "https://cdn3.emoji.gg/emojis/2480-hypesquad-brilliance.png", // House Brilliance
  [1 << 8]: "https://cdhttps://cdn3.emoji.gg/emojis/balance.png", // House Balance
  [1 << 9]: "https://img.icons8.com/?size=512&id=oCHhGw76VSOh&format=png", // Early Supporter
  [1 << 10]: "https://cdn3.emoji.gg/emojis/7011-active-developer-badge.png", // Team User
  [1 << 12]: "https://cdn3.emoji.gg/emojis/7011-active-developer-badge.png", // System
  [1 << 14]: "https://img.icons8.com/?size=512&id=efZLx2wJQTPk&format=png", // Bug Hunter Level 2
  [1 << 17]: "https://upload.wikimedia.org/wikipedia/commons/c/c4/7088-early-verified-bot-developer.png", // Verified Bot Developer
  [1 << 18]: "https://cdn3.emoji.gg/emojis/2047-certifiedmoderator.png", // Certified Moderator
  [1 << 19]: "https://cdn3.emoji.gg/emojis/7011-active-developer-badge.png", // Bot HTTP Interactions
  [1 << 22]: "https://cdn3.emoji.gg/emojis/7011-active-developer-badge.png", // Active Developer
  [1 << 40]: "https://cdn3.emoji.gg/emojis/66366-completed-a-quest.png",
  [1 << 41]: "https://cdn3.emoji.gg/emojis/4896-orginiallyknownas-badge.png"
};

function renderUserBadges(flags) {
  const container = document.getElementById("previewDiscordBadges");
  container.innerHTML = ""; // clear
  Object.keys(badgeIcons).forEach(flag => {
    if (flags & flag) {
      const img = document.createElement("img");
      img.src = badgeIcons[flag];
      img.alt = "badge";
      img.className = "discord-badge";
      img.style.height = "20px";
      img.style.marginRight = "4px";
      container.appendChild(img);
    }
  });
}

// Discord Profile Listener
ipcRenderer.on("auth-code", (event, code) => {
  console.log("Received Discord auth code:", code);
  ipcRenderer.send("exchange-token", code);
});
ipcRenderer.on("discord-profile", (event, profile) => {
  console.log("Discord user profile received:", profile);
  if (!profile) return;
  renderUserBadges(profile.flags);
  document.getElementById("previewDiscordUsername").textContent = profile.username;
  document.getElementById("previewDiscordDisplayName").textContent = profile.displayName;
  document.getElementById("previewDiscordAvatar").src = profile.avatarUrl || "https://cdn.discordapp.com/embed/avatars/0.png";
  document.getElementById("previewDiscordBio").textContent = profile.bio || "";
  const banner = document.getElementById("previewDiscordBanner");
  if (banner) {
    banner.src = profile.bannerUrl || "";
    banner.style.display = profile.bannerUrl ? "block" : "none";
  }
});

// Connect RPC
connectButton?.addEventListener("click", () => {
  console.log("Connect button clicked");

  const applicationId = inputAppId?.value?.trim();
  if (!applicationId) return alert("Please enter your Application ID!");

  const minRaw = minPlayersInput.value.trim();
  const maxRaw = maxPlayersInput.value.trim();
  const min = minRaw ? Number(minRaw) : undefined;
  const max = maxRaw ? Number(maxRaw) : undefined;

  const data = {
    appId: applicationId,
    line1: inputLine1.value.trim(),
    line2: inputLine2.value.trim(),
    bigImage: inputBigImage.value.trim(),
    smallImage: inputSmallImage.value.trim(),
    timestamp: document.querySelector('input[name="timestamp"]:checked')?.value || '',
    buttons: [],
    minPlayers: min,
    maxPlayers: max
  };

  if (button1Label.value.trim() && button1Url.value.trim()) {
    data.buttons.push({ label: button1Label.value.trim(), url: button1Url.value.trim() });
  }
  if (button2Label.value.trim() && button2Url.value.trim()) {
    data.buttons.push({ label: button2Label.value.trim(), url: button2Url.value.trim() });
  }

  ipcRenderer.send("connect-rpc", data);
});

// Disconnect RPC
  disconnectButton?.addEventListener("click", () => {
    console.log("Disconnect button clicked");
    ipcRenderer.send("disconnect-rpc");
  });

  window.addEventListener("message", (event) => {
    const code = event.data;
    console.log("OAuth code received from popup:", code);
    ipcRenderer.send("exchange-token", code);
  });

});
