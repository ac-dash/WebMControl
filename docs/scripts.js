const GITHUB_TOKEN = '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'; // Updated by setup.py
const REPO_NAME = 'ac-dash/WebMControl-Data';
let currentClientId = null;
let currentUser = null;

// Login function with error handling
async function attemptLogin() {
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;
    const url = `https://corsproxy.io/?https://api.github.com/repos/${REPO_NAME}/data/accounts.json`;

    try {
        const response = await fetch(url, {
            headers: {
                'Authorization': `token ${GITHUB_TOKEN}`,
                'Accept': 'application/vnd.github.v3+json'
            }
        });
        if (!response.ok) {
            throw new Error(`API request failed with status ${response.status}`);
        }
        const data = await response.json();
        if (!data.content) {
            throw new Error('No content field in API response');
        }
        const decodedContent = atob(data.content.replace(/\n/g, ''));
        const accounts = JSON.parse(decodedContent);
        const user = accounts.users.find(u => u.username === username && u.password === password);
        if (user) {
            currentUser = user;
            document.getElementById('loginModal').style.display = 'none';
            document.getElementById('mainContent').style.display = 'block';
            logAccountActivity(username, 'login');
            loadClients();
            alert('Login successful');
        } else {
            alert('Invalid username or password');
        }
    } catch (error) {
        console.error('Login error:', error);
        alert('Failed to login. Check connection or credentials.');
    }
}

// Load clients for map and list
async function loadClients() {
    const url = `https://corsproxy.io/?https://api.github.com/repos/${REPO_NAME}/data/clients.json`;
    try {
        const response = await fetch(url, {
            headers: { 'Authorization': `token ${GITHUB_TOKEN}`, 'Accept': 'application/vnd.github.v3+json' }
        });
        if (!response.ok) throw new Error('Failed to load clients');
        const files = await response.json();
        const clientsList = document.getElementById('clientsList');
        clientsList.innerHTML = '';
        files.forEach(async file => {
            const clientResponse = await fetch(file.download_url);
            const client = await clientResponse.json();
            addClientToMap(client);
            clientsList.innerHTML += `<li>${client.id} - ${client.status} (IP: ${client.ip})</li>`;
        });
    } catch (error) {
        console.error('Error loading clients:', error);
    }
}

// Theme toggle
function toggleTheme() {
    const body = document.body;
    const themeIcon = document.getElementById('themeIcon');
    const themeLink = document.getElementById('theme');
    if (body.classList.contains('dark-theme')) {
        body.classList.remove('dark-theme');
        body.classList.add('light-theme');
        themeIcon.textContent = '🌙';
        themeLink.href = 'assets/themes/white_grey.css';
    } else {
        body.classList.remove('light-theme');
        body.classList.add('dark-theme');
        themeIcon.textContent = '☀️';
        themeLink.href = 'assets/themes/black_lightgrey.css';
    }
}

// Show specific tab
function showTab(tabId) {
    document.querySelectorAll('.tab-content').forEach(tab => tab.style.display = 'none');
    document.getElementById(tabId + 'Tab').style.display = 'block';
    if (tabId === 'accounts') loadAccounts();
}

// Load accounts for management
async function loadAccounts() {
    const url = `https://corsproxy.io/?https://api.github.com/repos/${REPO_NAME}/data/accounts.json`;
    try {
        const response = await fetch(url, {
            headers: { 'Authorization': `token ${GITHUB_TOKEN}`, 'Accept': 'application/vnd.github.v3+json' }
        });
        const data = await response.json();
        const decodedContent = atob(data.content.replace(/\n/g, ''));
        const accounts = JSON.parse(decodedContent);
        const accountsList = document.getElementById('accountsList');
        accountsList.innerHTML = '';
        accounts.users.forEach(user => {
            accountsList.innerHTML += `<li>${user.username} (${user.role}) <button onclick="deleteAccount('${user.username}')">Delete</button></li>`;
        });
    } catch (error) {
        console.error('Error loading accounts:', error);
    }
}

// Add account
function addAccount() {
    const username = prompt('Enter new username:');
    const password = prompt('Enter new password:');
    const role = prompt('Enter role (admin/visitor):');
    if (username && password && role) {
        updateAccounts({ username, password, role });
    }
}

// Client command execution
function executeClientCommand(command) {
    if (currentUser.role !== 'admin') {
        alert('Only admins can execute commands.');
        return;
    }
    let params = {};
    if (['cmd', 'shell', 'msg', 'tts'].includes(command)) {
        params.value = prompt(`Enter ${command} input:`);
    }
    sendCommandToClient(currentClientId, command, params);
    document.getElementById('clientOptions').style.display = 'none';
}

// Event listeners
document.addEventListener('DOMContentLoaded', () => {
    document.getElementById('loginModal').style.display = 'block';
    document.getElementById('mainContent').style.display = 'none';
    const loginButton = document.querySelector('#loginModal button');
    if (loginButton) loginButton.onclick = attemptLogin;
    const passwordInput = document.getElementById('password');
    if (passwordInput) {
        passwordInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') attemptLogin();
        });
    }
});




