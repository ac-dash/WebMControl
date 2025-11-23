let map;
let clientMarkers = {};

function initMap() {
    map = L.map('map').setView([0, 0], 2);
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
    }).addTo(map);
}

async function addClientToMap(client) {
    try {
        const response = await fetch(`http://ip-api.com/json/${client.ip}`);
        const geo = await response.json();
        if (geo.status === 'success') {
            const lat = geo.lat;
            const lon = geo.lon;
            const marker = L.marker([lat, lon]).addTo(map);
            marker.bindPopup(`
                <b>${client.id}</b><br>
                Status: ${client.status}<br>
                <div onmouseover="showClientDetails('${client.id}')" onmouseleave="hideClientDetails()">
                    Hover for details
                    <div id="clientDetails_${client.id}" style="display: none;">
                        User: ${client.username}<br>
                        IP: ${client.ip}<br>
                        Activity: ${client.activity}
                    </div>
                </div>
            `);
            marker.on('click', () => showClientOptions(client.id));
            clientMarkers[client.id] = marker;
        }
    } catch (error) {
        console.error('Geolocation error:', error);
    }
}

function showClientDetails(clientId) {
    document.getElementById(`clientDetails_${clientId}`).style.display = 'block';
}

function hideClientDetails() {
    document.querySelectorAll('[id^="clientDetails_"]').forEach(el => el.style.display = 'none');
}

function showClientOptions(clientId) {
    currentClientId = clientId;
    document.getElementById('clientOptions').style.display = 'flex';
}

document.addEventListener('DOMContentLoaded', initMap);
