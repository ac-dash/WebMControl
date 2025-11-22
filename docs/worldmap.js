let map;

function initMap() {
    map = L.map('worldMap').setView([0, 0], 2);
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
    }).addTo(map);
}

function updateMap(ip) {
    fetch(`http://ip-api.com/json/${ip}`)
        .then(response => response.json())
        .then(data => {
            if (data.status === 'success') {
                const lat = data.lat;
                const lon = data.lon;
                map.setView([lat, lon], 5);
                L.marker([lat, lon]).addTo(map)
                    .bindPopup(`Client Location: ${data.city || 'Unknown'}, ${data.country || 'Unknown'}`)
                    .openPopup();
            } else {
                console.log("Geolocation data unavailable.");
            }
        })
        .catch(error => console.error("Error fetching geolocation:", error));
}