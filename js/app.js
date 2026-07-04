// Main Application JavaScript
document.addEventListener('DOMContentLoaded', function() {
    initApp();
});

function initApp() {
    setupEventListeners();
    initMockMap();
    checkAuthStatus();
    setupPWAInstall();
}

function setupEventListeners() {
    const menuToggle = document.getElementById('menuToggle');
    const navMenu = document.querySelector('.nav-menu');
    if (menuToggle) menuToggle.addEventListener('click', () => navMenu.classList.toggle('active'));

    document.querySelectorAll('.search-tab').forEach(tab => {
        tab.addEventListener('click', () => switchSearchTab(tab.getAttribute('data-tab')));
    });
    document.querySelectorAll('.auth-tab').forEach(tab => {
        tab.addEventListener('click', () => switchAuthTab(tab.getAttribute('data-tab')));
    });

    const loginBtn = document.getElementById('loginBtn');
    const registerBtn = document.getElementById('registerBtn');
    const addMemorialBtn = document.getElementById('addMemorialBtn');
    const searchNowBtn = document.getElementById('searchNowBtn');
    const closeModal = document.getElementById('closeModal');
    const cancelMemorial = document.getElementById('cancelMemorial');

    if (loginBtn) loginBtn.addEventListener('click', (e) => { e.preventDefault(); openModal('auth'); switchAuthTab('login'); });
    if (registerBtn) registerBtn.addEventListener('click', (e) => { e.preventDefault(); openModal('auth'); switchAuthTab('register'); });
    if (addMemorialBtn) addMemorialBtn.addEventListener('click', (e) => { e.preventDefault(); openModal('memorial'); });
    if (searchNowBtn) searchNowBtn.addEventListener('click', (e) => { e.preventDefault(); document.getElementById('searchSection').scrollIntoView({behavior: 'smooth'}); });
    if (closeModal) closeModal.addEventListener('click', closeAllModals);
    if (cancelMemorial) cancelMemorial.addEventListener('click', closeAllModals);

    window.addEventListener('click', (e) => { if (e.target.classList.contains('modal')) closeAllModals(); });

    const memorialForm = document.getElementById('memorialForm');
    if (memorialForm) memorialForm.addEventListener('submit', handleMemorialSubmit);

    const getCurrentLocationBtn = document.getElementById('getCurrentLocation');
    if (getCurrentLocationBtn) getCurrentLocationBtn.addEventListener('click', getCurrentLocation);
    const useCurrentLocationBtn = document.getElementById('useCurrentLocation');
    if (useCurrentLocationBtn) useCurrentLocationBtn.addEventListener('click', getCurrentLocationForSearch);

    const searchByNameBtn = document.getElementById('searchByName');
    if (searchByNameBtn) searchByNameBtn.addEventListener('click', handleSearchByName);
    const searchByLocationBtn = document.getElementById('searchByLocation');
    if (searchByLocationBtn) searchByLocationBtn.addEventListener('click', handleSearchByLocation);

    const installAppBtn = document.getElementById('installAppBtn');
    if (installAppBtn) installAppBtn.addEventListener('click', installPWA);
}

function switchSearchTab(tabId) {
    document.querySelectorAll('.search-tab').forEach(b => b.classList.remove('active'));
    document.querySelector('.search-tab[data-tab="' + tabId + '"]').classList.add('active');
    document.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active'));
    document.getElementById(tabId + 'Tab').classList.add('active');
}

function switchAuthTab(tabId) {
    document.querySelectorAll('.auth-tab').forEach(b => b.classList.remove('active'));
    document.querySelector('.auth-tab[data-tab="' + tabId + '"]').classList.add('active');
    document.getElementById(tabId + 'Tab').classList.add('active');
    document.querySelectorAll('.auth-modal .tab-content').forEach(c => c.classList.remove('active'));
    document.getElementById(tabId + 'Tab').classList.add('active');
}

function openModal(modalType) {
    closeAllModals();
    if (modalType === 'auth') document.getElementById('authModal').classList.add('active');
    else if (modalType === 'memorial') document.getElementById('addMemorialModal').classList.add('active');
    document.body.style.overflow = 'hidden';
}

function closeAllModals() {
    document.querySelectorAll('.modal').forEach(m => m.classList.remove('active'));
    document.body.style.overflow = 'auto';
}

function initMockMap() {
    const mockupMap = document.getElementById('mockupMap');
    if (!mockupMap) return;
    try {
        const map = L.map(mockupMap).setView([-25.7479, 28.2293], 13);
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', { attribution: '© OpenStreetMap' }).addTo(map);
        L.marker([-25.7479, 28.2293]).addTo(map).bindPopup('Sample Memorial').openPopup();
    } catch(e) {
        mockupMap.style.background = '#2c5530';
        mockupMap.innerHTML = '<div style="color:white;text-align:center;padding-top:40%;">Map Preview</div>';
    }
}

function getCurrentLocation() {
    if (!navigator.geolocation) { alert('Geolocation not supported'); return; }
    const btn = document.getElementById('getCurrentLocation');
    btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Getting...';
    btn.disabled = true;
    navigator.geolocation.getCurrentPosition(
        (p) => {
            document.getElementById('memorialLat').value = p.coords.latitude.toFixed(6);
            document.getElementById('memorialLng').value = p.coords.longitude.toFixed(6);
            btn.innerHTML = '<i class="fas fa-location-dot"></i> Use Current Location';
            btn.disabled = false;
            showNotification('Location obtained!', 'success');
        },
        () => {
            btn.innerHTML = '<i class="fas fa-location-dot"></i> Use Current Location';
            btn.disabled = false;
            showNotification('Could not get location', 'error');
        }
    );
}

function getCurrentLocationForSearch() {
    if (!navigator.geolocation) { alert('Geolocation not supported'); return; }
    const btn = document.getElementById('useCurrentLocation');
    btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Getting...';
    btn.disabled = true;
    navigator.geolocation.getCurrentPosition(
        (p) => {
            document.getElementById('locationInput').value = 'Lat: ' + p.coords.latitude.toFixed(4) + ', Lng: ' + p.coords.longitude.toFixed(4);
            btn.innerHTML = '<i class="fas fa-location-dot"></i> Use My Location';
            btn.disabled = false;
        },
        () => {
            btn.innerHTML = '<i class="fas fa-location-dot"></i> Use My Location';
            btn.disabled = false;
            showNotification('Could not get location', 'error');
        }
    );
}

function handleMemorialSubmit(e) {
    e.preventDefault();
    const name = document.getElementById('memorialName').value;
    const surname = document.getElementById('memorialSurname').value;
    const date = document.getElementById('dateOfPassing').value;
    const message = document.getElementById('memorialMessage').value;
    const location = document.getElementById('memorialLocation').value;
    const lat = document.getElementById('memorialLat').value;
    const lng = document.getElementById('memorialLng').value;

    if (!name || !surname) { showNotification('Name and surname required', 'error'); return; }
    if ((lat && !lng) || (!lat && lng)) { showNotification('Provide both coordinates or leave empty', 'error'); return; }

    const memorial = { id: Date.now(), name, surname, date, message, location, coordinates: lat && lng ? { lat: parseFloat(lat), lng: parseFloat(lng) } : null, createdAt: new Date().toISOString() };
    let memorials = JSON.parse(localStorage.getItem('eternalRestMemorials') || '[]');
    memorials.push(memorial);
    localStorage.setItem('eternalRestMemorials', JSON.stringify(memorials));
    showNotification('Memorial for ' + name + ' ' + surname + ' saved!', 'success');
    closeAllModals();
    e.target.reset();
    if (localStorage.getItem('eternalRestUser')) {
        setTimeout(() => window.location.href = 'dashboard.html', 1500);
    }
}

function handleSearchByName() {
    const name = document.getElementById('deceasedName').value;
    const surname = document.getElementById('surname').value;
    if (!name && !surname) { showNotification('Enter a name to search', 'error'); return; }
    const memorials = JSON.parse(localStorage.getItem('eternalRestMemorials') || '[]');
    const results = memorials.filter(m =>
        (!name || m.name.toLowerCase().includes(name.toLowerCase())) &&
        (!surname || m.surname.toLowerCase().includes(surname.toLowerCase()))
    );
    if (results.length === 0) showNotification('No memorials found', 'info');
    else showNotification('Found ' + results.length + ' memorial(s)', 'success');
}

function handleSearchByLocation() {
    const loc = document.getElementById('locationInput').value;
    if (!loc) { showNotification('Enter a location', 'error'); return; }
    const memorials = JSON.parse(localStorage.getItem('eternalRestMemorials') || '[]');
    const results = memorials.filter(m => m.location && m.location.toLowerCase().includes(loc.toLowerCase()));
    if (results.length === 0) showNotification('No memorials found near this location', 'info');
    else showNotification('Found ' + results.length + ' memorial(s) near this location', 'success');
}

function showNotification(message, type) {
    const existing = document.querySelector('.notification');
    if (existing) existing.remove();

    const n = document.createElement('div');
    n.className = 'notification notification-' + type;
    const icon = type === 'success' ? 'check-circle' : type === 'error' ? 'exclamation-circle' : 'info-circle';
    n.innerHTML = '<i class="fas fa-' + icon + '"></i><span>' + message + '</span><button class="notification-close">&times;</button>';
    n.style.cssText = 'position:fixed;top:20px;right:20px;padding:15px 20px;border-radius:5px;box-shadow:0 4px 12px rgba(0,0,0,0.15);display:flex;align-items:center;gap:10px;z-index:3000;max-width:400px;animation:slideIn 0.3s ease;background:' + (type === 'success' ? '#d4edda' : type === 'error' ? '#f8d7da' : '#d1ecf1') + ';color:' + (type === 'success' ? '#155724' : type === 'error' ? '#721c24' : '#0c5460') + ';';
    document.body.appendChild(n);
    n.querySelector('.notification-close').addEventListener('click', () => { n.style.animation = 'slideOut 0.3s ease'; setTimeout(() => n.remove(), 300); });
    setTimeout(() => { if (n.parentNode) { n.style.animation = 'slideOut 0.3s ease'; setTimeout(() => n.remove(), 300); } }, 5000);

    if (!document.getElementById('notification-styles')) {
        const s = document.createElement('style'); s.id = 'notification-styles';
        s.textContent = '@keyframes slideIn { from { transform: translateX(100%); opacity: 0; } to { transform: translateX(0); opacity: 1; } } @keyframes slideOut { from { transform: translateX(0); opacity: 1; } to { transform: translateX(100%); opacity: 0; } } .notification-close { background: none; border: none; font-size: 1.5rem; cursor: pointer; margin-left: auto; color: inherit; }';
        document.head.appendChild(s);
    }
}

function checkAuthStatus() {
    const user = localStorage.getItem('eternalRestUser');
    if (user) {
        const loginBtn = document.getElementById('loginBtn');
        const registerBtn = document.getElementById('registerBtn');
        if (loginBtn) { loginBtn.textContent = 'Dashboard'; loginBtn.onclick = (e) => { e.preventDefault(); window.location.href = 'dashboard.html'; }; }
        if (registerBtn) { registerBtn.textContent = 'Logout'; registerBtn.onclick = (e) => { e.preventDefault(); localStorage.removeItem('eternalRestUser'); window.location.reload(); }; }
    }
}

function setupPWAInstall() {
    let deferredPrompt;
    window.addEventListener('beforeinstallprompt', (e) => { e.preventDefault(); deferredPrompt = e; const btn = document.getElementById('installAppBtn'); if (btn) btn.style.display = 'block'; });
    window.deferredPrompt = deferredPrompt;
}

function installPWA() {
    if (window.deferredPrompt) {
        window.deferredPrompt.prompt();
        window.deferredPrompt.userChoice.then((c) => { if (c.outcome === 'accepted') showNotification('App installed!', 'success'); window.deferredPrompt = null; });
    }
}
