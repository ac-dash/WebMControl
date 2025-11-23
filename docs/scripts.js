// scripts.js for WebMControl GUI
// Handles login, task submission, theme switching, and API interactions with GitHub

const GITHUB_TOKEN = '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';
const REPO_NAME = 'ac-dash/WebMControl-Data';

// Function to attempt login by fetching accounts.json from GitHub
async function attemptLogin() {
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;
    const url = `https://api.github.com/repos/${REPO_NAME}/contents/data/accounts.json`;

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
        // Decode base64 content from GitHub API response
        const decodedContent = atob(data.content.replace(/\n/g, ''));
        const accounts = JSON.parse(decodedContent);
        // Check if user exists with matching credentials
        const user = accounts.users.find(u => u.username === username && u.password === password);
        if (user) {
            // Successful login
            document.getElementById('loginModal').style.display = 'none';
            document.getElementById('mainContent').style.display = 'block';
            alert('Login successful');
        } else {
            alert('Invalid username or password');
        }
    } catch (error) {
        console.error('Login error:', error);
        alert('Failed to login. Check connection or credentials.');
    }
}

// Function to submit a task (placeholder for task management functionality)
async function submitTask() {
    const clientId = document.getElementById('clientId').value;
    const taskData = document.getElementById('taskData').value;
    const url = `https://api.github.com/repos/${REPO_NAME}/contents/data/tasks.json`;

    if (!clientId || !taskData) {
        alert('Please fill in all fields');
        return;
    }

    try {
        // Fetch existing tasks to append new task (simplified for demo)
        const response = await fetch(url, {
            headers: {
                'Authorization': `token ${GITHUB_TOKEN}`,
                'Accept': 'application/vnd.github.v3+json'
            }
        });
        if (!response.ok) {
            throw new Error(`Failed to fetch tasks: ${response.status}`);
        }
        const data = await response.json();
        const decodedContent = atob(data.content.replace(/\n/g, ''));
        let tasks = JSON.parse(decodedContent);
        tasks.tasks.push({ clientId, taskData, status: 'pending', timestamp: new Date().toISOString() });

        // Encode back to base64 for updating file (simplified; real update would use PUT with SHA)
        console.log('Task added locally:', tasks);
        alert('Task submitted (demo mode - real update requires SHA and PUT request)');
        // Note: Actual file update logic requires getting file SHA and using PUT endpoint, omitted for brevity
    } catch (error) {
        console.error('Task submission error:', error);
        alert('Failed to submit task.');
    }
}

// Function to load uploaded files from uploads/ directory via GitHub API
async function loadUploadedFiles() {
    const uploadsList = document.getElementById('uploadsList');
    const url = `https://api.github.com/repos/${REPO_NAME}/contents/results`;

    uploadsList.innerHTML = '<p>Loading files...</p>';
    try {
        const response = await fetch(url, {
            headers: {
                'Authorization': `token ${GITHUB_TOKEN}`,
                'Accept': 'application/vnd.github.v3+json'
            }
        });
        if (!response.ok) {
            throw new Error(`Failed to fetch uploads: ${response.status}`);
        }
        const files = await response.json();
        if (files.length === 0) {
            uploadsList.innerHTML = '<p>No files found in uploads directory.</p>';
            return;
        }
        uploadsList.innerHTML = '';
        files.forEach(file => {
            const li = document.createElement('li');
            li.innerHTML = `<a href="${file.download_url}" target="_blank">${file.name}</a>`;
            uploadsList.appendChild(li);
        });
    } catch (error) {
        console.error('Error loading uploads:', error);
        uploadsList.innerHTML = '<p>Failed to load uploaded files.</p>';
    }
}

// Function to toggle between light and dark themes
function toggleTheme() {
    const body = document.body;
    const themeIcon = document.getElementById('themeIcon');
    if (body.classList.contains('dark-theme')) {
        body.classList.remove('dark-theme');
        body.classList.add('light-theme');
        themeIcon.textContent = '🌙';
    } else {
        body.classList.remove('light-theme');
        body.classList.add('dark-theme');
        themeIcon.textContent = '☀️';
    }
}

// Event listener for login button (assumes button exists in HTML)
document.addEventListener('DOMContentLoaded', () => {
    // Show login modal on page load
    document.getElementById('loginModal').style.display = 'block';
    document.getElementById('mainContent').style.display = 'none';

    // Attach event listeners (replace with actual button IDs from your HTML)
    const loginButton = document.querySelector('#loginModal button');
    if (loginButton) {
        loginButton.onclick = attemptLogin;
    }
    const themeButton = document.getElementById('themeToggle');
    if (themeButton) {
        themeButton.onclick = toggleTheme;
    }
    const taskSubmitButton = document.querySelector('#taskForm button');
    if (taskSubmitButton) {
        taskSubmitButton.onclick = submitTask;
    }

    // Load uploaded files if section exists
    if (document.getElementById('uploadsList')) {
        loadUploadedFiles();
    }
});

// Handle Enter key for login
document.getElementById('password').addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        attemptLogin();
    }
});
