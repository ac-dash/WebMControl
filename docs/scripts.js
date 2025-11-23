const PAT = "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";
const DATA_REPO = "ac-dash/WebMControl-Data";
const BASE_URL = `https://api.github.com/repos/${DATA_REPO}`;
const HEADERS = {
    "Authorization": `token ${PAT}`,
    "Accept": "application/vnd.github.v3+json",
    "Content-Type": "application/json"
};
let ENCRYPTION_KEY = "ifyouscaredgetthefuckoutthepit";
let cipher = null; // Placeholder for encryption library, adapt as needed
let currentUser = null;

// Initialize page
window.onload = () => {
    checkLoginStatus();
};

// Check if user is logged in
function checkLoginStatus() {
    const savedUser = localStorage.getItem("currentUser");
    if (savedUser) {
        currentUser = JSON.parse(savedUser);
        document.getElementById("loggedInUser").textContent = `User: ${currentUser.username}`;
        showMainContent();
        fetchClients();
        initMap();
        setInterval(fetchClients, 60000);
        fetchUploads();
    } else {
        document.getElementById("loginModal").style.display = "block";
    }
}

// Attempt login
async function attemptLogin() {
    const username = document.getElementById("username").value;
    const password = document.getElementById("password").value;
    const errorMsg = document.getElementById("loginError");
    try {
        const response = await fetch(`${BASE_URL}/contents/data/accounts.json`, { headers: HEADERS });
        const data = await response.json();
        const content = atob(data.content.replace(/\n/g, "")); // Placeholder, replace with decryption
        const accounts = JSON.parse(content).users;
        const user = accounts.find(acc => acc.username === username && acc.password === password);
        if (user) {
            currentUser = user;
            localStorage.setItem("currentUser", JSON.stringify(user));
            document.getElementById("loginModal").style.display = "none";
            document.getElementById("loggedInUser").textContent = `User: ${username}`;
            showMainContent();
            fetchClients();
            initMap();
            setInterval(fetchClients, 60000);
            fetchUploads();
        } else {
            errorMsg.textContent = "Invalid username or password.";
        }
    } catch (error) {
        console.error("Login error:", error);
        errorMsg.textContent = "Failed to authenticate. Check console for details.";
    }
}

// Show main content after login
function showMainContent() {
    document.getElementById("mainHeader").style.display = "block";
    document.getElementById("mainContainer").style.display = "flex";
}

// Logout
function logout() {
    localStorage.removeItem("currentUser");
    currentUser = null;
    document.getElementById("mainHeader").style.display = "none";
    document.getElementById("mainContainer").style.display = "none";
    document.getElementById("loginModal").style.display = "block";
    document.getElementById("username").value = "";
    document.getElementById("password").value = "";
    document.getElementById("loginError").textContent = "";
}

// Fetch connected systems
async function fetchClients() {
    if (!currentUser) return;
    try {
        const response = await fetch(`${BASE_URL}/contents/clients`, { headers: HEADERS });
        const data = await response.json();
        const clientList = document.getElementById("clientList");
        clientList.innerHTML = "";
        data.forEach(client => {
            const li = document.createElement("li");
            li.textContent = client.name.replace(".json", "");
            li.onclick = () => loadClientDetails(client.name.replace(".json", ""));
            clientList.appendChild(li);
        });
        if (data.length > 0) {
            document.getElementById("dingSound").play().catch(e => console.log("Audio error:", e));
        }
    } catch (error) {
        console.error("Error fetching clients:", error);
    }
}

// Load system details
async function loadClientDetails(hostname) {
    try {
        const response = await fetch(`${BASE_URL}/contents/clients/${hostname}.json`, { headers: HEADERS });
        const data = await response.json();
        const content = atob(data.content.replace(/\n/g, "")); // Placeholder, replace with decryption
        const clientData = JSON.parse(content);
        document.getElementById("clientDetails").innerHTML = `
            <h3>${hostname}</h3>
            <p>Username: ${clientData.username}</p>
            <p>IP: ${clientData.ip}</p>
            <p>Status: ${clientData.status}</p>
        `;
        fetchResults(hostname);
        updateMap(clientData.ip);
    } catch (error) {
        console.error("Error loading client details:", error);
    }
}

// Fetch task results
async function fetchResults(hostname) {
    try {
        const response = await fetch(`${BASE_URL}/contents/results`, { headers: HEADERS });
        const data = await response.json();
        const results = data.filter(file => file.name.includes(hostname));
        const resultsDiv = document.getElementById("taskResults");
        resultsDiv.innerHTML = "";
        results.slice(-10).forEach(async result => {
            const resultResponse = await fetch(result.download_url, { headers: HEADERS });
            const content = await resultResponse.text();
            const p = document.createElement("p");
            p.textContent = `${result.name}: ${content.substring(0, 100)}...`;
            resultsDiv.appendChild(p);
        });
    } catch (error) {
        console.error("Error fetching results:", error);
    }
}

// Fetch uploaded files
async function fetchUploads() {
    try {
        const response = await fetch(`${BASE_URL}/contents/results`, { headers: HEADERS });
        const data = await response.json();
        const uploadsList = document.getElementById("uploadsList");
        uploadsList.innerHTML = "";
        data.forEach(file => {
            const li = document.createElement("li");
            li.innerHTML = `<a href="${file.download_url}" target="_blank">${file.name}</a>`;
            uploadsList.appendChild(li);
        });
    } catch (error) {
        console.error("Error fetching uploads:", error);
    }
}

// Submit task
async function submitTask() {
    const hostname = document.getElementById("clientDetails").textContent.split("\n")[0].split(":")[1]?.trim() || "";
    if (!hostname) {
        alert("Select a system first!");
        return;
    }
    const action = document.getElementById("taskAction").value;
    const paramsText = document.getElementById("taskParams").value || "{}";
    let params;
    try {
        params = JSON.parse(paramsText);
    } catch {
        alert("Invalid JSON for parameters!");
        return;
    }
    const task = { action, params, timestamp: new Date().toISOString() };
    try {
        const tasksResponse = await fetch(`${BASE_URL}/contents/management/tasks.json`, { headers: HEADERS });
        const tasksData = await tasksResponse.json();
        let tasks = JSON.parse(atob(tasksData.content.replace(/\n/g, "")));
        if (!tasks[hostname]) tasks[hostname] = [];
        tasks[hostname].push(task);
        const encryptedTasks = btoa(JSON.stringify(tasks)); // Placeholder, replace with encryption
        await fetch(`${BASE_URL}/contents/management/tasks.json`, {
            method: "PUT",
            headers: HEADERS,
            body: JSON.stringify({
                message: `Add task for ${hostname}`,
                content: encryptedTasks,
                sha: tasksData.sha
            })
        });
        alert("Task submitted successfully!");
    } catch (error) {
        console.error("Error submitting task:", error);
        alert("Failed to submit task.");
    }
}

// Theme switcher
function switchTheme() {
    const theme = document.getElementById("themeSelect").value;
    document.getElementById("theme").href = `assets/themes/${theme}.css`;

}

