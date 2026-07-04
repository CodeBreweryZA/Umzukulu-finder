// Map functionality for Umzukulu^Finder
function initMap() {
    const mapContainer = document.getElementById('dashboardMap');
    if (!mapContainer) return;
    try {
        const map = L.map('dashboardMap').setView([40.7128, -74.0060], 10);
        window.dashboardMap = map;
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '© OpenStreetMap contributors'
        }).addTo(map);
        updateMapWithMemorials();
    } catch (error) {
        console.log("Map initialization failed:", error);
        mapContainer.innerHTML = '<div class="empty-state"><p>Map could not be loaded.</p></div>';
    }
}

function updateMapWithMemorials() {
    if (!window.dashboardMap) return;
    if (window.memorialMarkers) window.memorialMarkers.forEach(m => m.remove());
    window.memorialMarkers = [];
    const memorials = JSON.parse(localStorage.getItem('eternalRestMemorials') || '[]');
    memorials.forEach(memorial => {
        if (memorial.coordinates && memorial.coordinates.lat && memorial.coordinates.lng) {
            const marker = L.marker([memorial.coordinates.lat, memorial.coordinates.lng])
                .addTo(window.dashboardMap)
                .bindPopup('<b>' + memorial.name + ' ' + memorial.surname + '</b><br>' + (memorial.location || ''));
            marker.memorialId = memorial.id;
            window.memorialMarkers.push(marker);
        }
    });
    if (window.memorialMarkers.length > 0) {
        window.dashboardMap.fitBounds(L.featureGroup(window.memorialMarkers).getBounds().pad(0.1));
    }
}

function viewMemorialOnMap(memorialId) {
    const section = document.querySelector('[data-section="map"]');
    if (section) section.click();
    const memorials = JSON.parse(localStorage.getItem('eternalRestMemorials') || '[]');
    const memorial = memorials.find(m => m.id === memorialId);
    if (!memorial || !memorial.coordinates) { showNotification('No location data for this memorial', 'error'); return; }
    if (window.dashboardMap) {
        window.dashboardMap.setView([memorial.coordinates.lat, memorial.coordinates.lng], 15);
        const marker = window.memorialMarkers.find(m => m.memorialId === memorialId);
        if (marker) marker.openPopup();
    }
}

function locateUserOnMap() {
    if (!navigator.geolocation) { showNotification('Geolocation not supported', 'error'); return; }
    navigator.geolocation.getCurrentPosition(
        (position) => {
            const lat = position.coords.latitude, lng = position.coords.longitude;
            if (window.dashboardMap) {
                window.dashboardMap.setView([lat, lng], 14);
                if (window.userLocationMarker) window.userLocationMarker.remove();
                window.userLocationMarker = L.marker([lat, lng]).addTo(window.dashboardMap)
                    .bindPopup('Your location').openPopup();
            }
        },
        () => showNotification('Could not get location', 'error')
    );
}
