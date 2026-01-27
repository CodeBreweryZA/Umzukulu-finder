// Main Application JavaScript
document.addEventListener('DOMContentLoaded', function() {
    // Initialize the app
    initApp();
});

function initApp() {
    // Setup event listeners
    setupEventListeners();
    
    // Initialize mock map on homepage
    initMockMap();
    
    // Check if user is already logged in
    checkAuthStatus();
    
    // Check if PWA can be installed
    setupPWAInstall();
}

function setupEventListeners() {
    // Navigation menu toggle
    const menuToggle = document.getElementById('menuToggle');
    const navMenu = document.querySelector('.nav-menu');
    
    if (menuToggle) {
        menuToggle.addEventListener('click', () => {
            navMenu.classList.toggle('active');
        });
    }
    
    // Search tabs
    const searchTabs = document.querySelectorAll('.search-tab');
    searchTabs.forEach(tab => {
        tab.addEventListener('click', () => {
            const tabId = tab.getAttribute('data-tab');
            switchSearchTab(tabId);
        });
    });
    
    // Auth tabs
    const authTabs = document.querySelectorAll('.auth-tab');
    authTabs.forEach(tab => {
        tab.addEventListener('click', () => {
            const tabId = tab.getAttribute('data-tab');
            switchAuthTab(tabId);
        });
    });
    
    // Modal triggers
    const loginBtn = document.getElementById('loginBtn');
    const registerBtn = document.getElementById('registerBtn');
    const addMemorialBtn = document.getElementById('addMemorialBtn');
    const searchNowBtn = document.getElementById('searchNowBtn');
    const closeModal = document.getElementById('closeModal');
    const cancelMemorial = document.getElementById('cancelMemorial');
    
    // Auth modal
    if (loginBtn) {
        loginBtn.addEventListener('click', (e) => {
            e.preventDefault();
            openModal('auth');
            switchAuthTab('login');
        });
    }
    
    if (registerBtn) {
        registerBtn.addEventListener('click', (e) => {
            e.preventDefault();
            openModal('auth');
            switchAuthTab('register');
        });
    }
    
    // Memorial modal
    if (addMemorialBtn) {
        addMemorialBtn.addEventListener('click', (e) => {
            e.preventDefault();
            openModal('memorial');
        });
    }
    
    if (searchNowBtn) {
        searchNowBtn.addEventListener('click', (e) => {
            e.preventDefault();
            document.getElementById('searchSection').scrollIntoView({behavior: 'smooth'});
        });
    }
    
    // Close modal buttons
    if (closeModal) {
        closeModal.addEventListener('click', closeAllModals);
    }
    
    if (cancelMemorial) {
        cancelMemorial.addEventListener('click', closeAllModals);
    }
    
    // Close modal when clicking outside
    window.addEventListener('click', (e) => {
        if (e.target.classList.contains('modal')) {
            closeAllModals();
        }
    });
    
    // Memorial form submission
    const memorialForm = document.getElementById('memorialForm');
    if (memorialForm) {
        memorialForm.addEventListener('submit', handleMemorialSubmit);
    }
    
    // Get current location button
    const getCurrentLocationBtn = document.getElementById('getCurrentLocation');
    if (getCurrentLocationBtn) {
        getCurrentLocationBtn.addEventListener('click', getCurrentLocation);
    }
    
    // Use current location for search
    const useCurrentLocationBtn = document.getElementById('useCurrentLocation');
    if (useCurrentLocationBtn) {
        useCurrentLocationBtn.addEventListener('click', getCurrentLocationForSearch);
    }
    
    // Search buttons
    const searchByNameBtn = document.getElementById('searchByName');
    if (searchByNameBtn) {
        searchByNameBtn.addEventListener('click', handleSearchByName);
    }
    
    const searchByLocationBtn = document.getElementById('searchByLocation');
    if (searchByLocationBtn) {
        searchByLocationBtn.addEventListener('click', handleSearchByLocation);
    }
    
    // Install app button
    const installAppBtn = document.getElementById('installAppBtn');
    if (installAppBtn) {
        installAppBtn.addEventListener('click', installPWA);
    }
}

function switchSearchTab(tabId) {
    // Update active tab button
    const tabButtons = document.querySelectorAll('.search-tab');
    tabButtons.forEach(button => {
        button.classList.remove('active');
        if (button.getAttribute('data-tab') === tabId) {
            button.classList.add('active');
        }
    });
    
    // Show active tab content
    const tabContents = document.querySelectorAll('.tab-content');
    tabContents.forEach(content => {
        content.classList.remove('active');
        if (content.id === `${tabId}Tab`) {
            content.classList.add('active');
        }
    });
}

function switchAuthTab(tabId) {
    // Update active tab button
    const tabButtons = document.querySelectorAll('.auth-tab');
    tabButtons.forEach(button => {
        button.classList.remove('active');
        if (button.getAttribute('data-tab') === tabId) {
            button.classList.add('active');
        }
    });
    
    // Show active tab content
    const tabContents = document.querySelectorAll('.tab-content');
    tabContents.forEach(content => {
        content.classList.remove('active');
        if (content.id === `${tabId}Tab`) {
            content.classList.add('active');
        }
    });
}

function openModal(modalType) {
    closeAllModals();
    
    if (modalType === 'auth') {
        document.getElementById('authModal').classList.add('active');
    } else if (modalType === 'memorial') {
        document.getElementById('addMemorialModal').classList.add('active');
    }
    
    document.body.style.overflow = 'hidden';
}

function closeAllModals() {
    const modals = document.querySelectorAll('.modal');
    modals.forEach(modal => {
        modal.classList.remove('active');
    });
    
    document.body.style.overflow = 'auto';
}

function initMockMap() {
    const mockupMap = document.getElementById('mockupMap');
    if (!mockupMap) return;
    
    // Create a simple mock map using Leaflet
    try {
        const map = L.map(mockupMap).setView([40.7128, -74.0060], 13);
        
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '© OpenStreetMap contributors'
        }).addTo(map);
        
        // Add a sample marker
        L.marker([40.7128, -74.0060]).addTo(map)
            .bindPopup('Sample Memorial Location')
            .openPopup();
    } catch (error) {
        console.log("Map initialization failed:", error);
        // Fallback: Just show a static map image
        mockupMap.style.backgroundImage = 'url("https://via.placeholder.com/400x500/2c5530/ffffff?text=Map+Preview")';
        mockupMap.style.backgroundSize = 'cover';
        mockupMap.style.backgroundPosition = 'center';
    }
}

function getCurrentLocation() {
    if (!navigator.geolocation) {
        alert("Geolocation is not supported by your browser");
        return;
    }
    
    // Show loading state
    const button = document.getElementById('getCurrentLocation');
    const originalText = button.innerHTML;
    button.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Getting Location...';
    button.disabled = true;
    
    navigator.geolocation.getCurrentPosition(
        (position) => {
            // Success
            const lat = position.coords.latitude;
            const lng = position.coords.longitude;
            
            // Fill in the coordinates
            document.getElementById('memorialLat').value = lat.toFixed(6);
            document.getElementById('memorialLng').value = lng.toFixed(6);
            
            // Reset button
            button.innerHTML = originalText;
            button.disabled = false;
            
            // Show success message
            showNotification('Location obtained successfully!', 'success');
        },
        (error) => {
            // Error
            console.error("Error getting location:", error);
            
            // Reset button
            button.innerHTML = originalText;
            button.disabled = false;
            
            // Show error message
            let errorMessage = "Unable to retrieve your location. ";
            switch(error.code) {
                case error.PERMISSION_DENIED:
                    errorMessage += "Permission denied.";
                    break;
                case error.POSITION_UNAVAILABLE:
                    errorMessage += "Position unavailable.";
                    break;
                case error.TIMEOUT:
                    errorMessage += "Request timed out.";
                    break;
                default:
                    errorMessage += "Unknown error.";
            }
            
            showNotification(errorMessage, 'error');
        }
    );
}

function getCurrentLocationForSearch() {
    if (!navigator.geolocation) {
        alert("Geolocation is not supported by your browser");
        return;
    }
    
    // Show loading state
    const button = document.getElementById('useCurrentLocation');
    const originalText = button.innerHTML;
    button.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Getting Location...';
    button.disabled = true;
    
    navigator.geolocation.getCurrentPosition(
        (position) => {
            // Success
            const lat = position.coords.latitude;
            const lng = position.coords.longitude;
            
            // Fill in the coordinates
            document.getElementById('locationInput').value = `Lat: ${lat.toFixed(4)}, Lng: ${lng.toFixed(4)}`;
            
            // Reset button
            button.innerHTML = originalText;
            button.disabled = false;
            
            // Show success message
            showNotification('Location obtained successfully!', 'success');
        },
        (error) => {
            // Error
            console.error("Error getting location:", error);
            
            // Reset button
            button.innerHTML = originalText;
            button.disabled = false;
            
            // Show error message
            showNotification('Unable to retrieve your location. Please enter coordinates manually.', 'error');
        }
    );
}

function handleMemorialSubmit(e) {
    e.preventDefault();
    
    // Get form data
    const name = document.getElementById('memorialName').value;
    const surname = document.getElementById('memorialSurname').value;
    const date = document.getElementById('dateOfPassing').value;
    const message = document.getElementById('memorialMessage').value;
    const location = document.getElementById('memorialLocation').value;
    const lat = document.getElementById('memorialLat').value;
    const lng = document.getElementById('memorialLng').value;
    
    // Basic validation
    if (!name || !surname) {
        showNotification('Name and surname are required', 'error');
        return;
    }
    
    if ((lat && !lng) || (!lat && lng)) {
        showNotification('Please provide both latitude and longitude, or leave both empty', 'error');
        return;
    }
    
    // Create memorial object
    const memorial = {
        id: Date.now(),
        name,
        surname,
        date,
        message,
        location,
        coordinates: lat && lng ? { lat: parseFloat(lat), lng: parseFloat(lng) } : null,
        createdAt: new Date().toISOString()
    };
    
    // In a real app, you would send this to your backend
    // For now, we'll store it in localStorage and show a success message
    
    // Get existing memorials from localStorage
    let memorials = JSON.parse(localStorage.getItem('eternalRestMemorials') || '[]');
    
    // Add new memorial
    memorials.push(memorial);
    
    // Save back to localStorage
    localStorage.setItem('eternalRestMemorials', JSON.stringify(memorials));
    
    // Show success message
    showNotification(`Memorial for ${name} ${surname} has been saved successfully!`, 'success');
    
    // Close modal
    closeAllModals();
    
    // Reset form
    e.target.reset();
    
    // If user is logged in, redirect to dashboard
    if (localStorage.getItem('eternalRestUser')) {
        setTimeout(() => {
            window.location.href = 'dashboard.html';
        }, 1500);
    }
}

function handleSearchByName() {
    const name = document.getElementById('deceasedName').value;
    const surname = document.getElementById('surname').value;
    
    if (!name && !surname) {
        showNotification('Please enter at least a name or surname to search', 'error');
        return;
    }
    
    // Show loading state
    const button = document.getElementById('searchByName');
    const originalText = button.innerHTML;
    button.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Searching...';
    button.disabled = true;
    
    // Simulate search delay
    setTimeout(() => {
        // Reset button
        button.innerHTML = originalText;
        button.disabled = false;
        
        // In a real app, you would make an API call here
        // For demo, we'll show a message
        showNotification(`Searching for memorials with name: ${name} ${surname}. This would show results in a real application.`, 'info');
    }, 1000);
}

function handleSearchByLocation() {
    const location = document.getElementById('locationInput').value;
    
    if (!location) {
        showNotification('Please enter a location to search', 'error');
        return;
    }
    
    // Show loading state
    const button = document.getElementById('searchByLocation');
    const originalText = button.innerHTML;
    button.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Searching...';
    button.disabled = true;
    
    // Simulate search delay
    setTimeout(() => {
        // Reset button
        button.innerHTML = originalText;
        button.disabled = false;
        
        // In a real app, you would make an API call here
        // For demo, we'll show a message
        showNotification(`Searching for memorials near: ${location}. This would show results in a real application.`, 'info');
    }, 1000);
}

function showNotification(message, type = 'info') {
    // Remove any existing notification
    const existingNotification = document.querySelector('.notification');
    if (existingNotification) {
        existingNotification.remove();
    }
    
    // Create notification element
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    
    // Set icon based on type
    let icon = 'info-circle';
    if (type === 'success') icon = 'check-circle';
    if (type === 'error') icon = 'exclamation-circle';
    
    notification.innerHTML = `
        <i class="fas fa-${icon}"></i>
        <span>${message}</span>
        <button class="notification-close">&times;</button>
    `;
    
    // Add to page
    document.body.appendChild(notification);
    
    // Add styles
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background-color: ${type === 'success' ? '#d4edda' : type === 'error' ? '#f8d7da' : '#d1ecf1'};
        color: ${type === 'success' ? '#155724' : type === 'error' ? '#721c24' : '#0c5460'};
        padding: 15px 20px;
        border-radius: 5px;
        box-shadow: 0 4px 12px rgba(0,0,0,0.15);
        display: flex;
        align-items: center;
        gap: 10px;
        z-index: 3000;
        max-width: 400px;
        animation: slideIn 0.3s ease;
    `;
    
    // Add close button event
    const closeBtn = notification.querySelector('.notification-close');
    closeBtn.addEventListener('click', () => {
        notification.style.animation = 'slideOut 0.3s ease';
        setTimeout(() => notification.remove(), 300);
    });
    
    // Auto-remove after 5 seconds
    setTimeout(() => {
        if (notification.parentNode) {
            notification.style.animation = 'slideOut 0.3s ease';
            setTimeout(() => notification.remove(), 300);
        }
    }, 5000);
    
    // Add animation keyframes
    if (!document.getElementById('notification-styles')) {
        const style = document.createElement('style');
        style.id = 'notification-styles';
        style.textContent = `
            @keyframes slideIn {
                from { transform: translateX(100%); opacity: 0; }
                to { transform: translateX(0); opacity: 1; }
            }
            @keyframes slideOut {
                from { transform: translateX(0); opacity: 1; }
                to { transform: translateX(100%); opacity: 0; }
            }
            .notification-close {
                background: none;
                border: none;
                font-size: 1.5rem;
                cursor: pointer;
                margin-left: auto;
                color: inherit;
            }
        `;
        document.head.appendChild(style);
    }
}

function checkAuthStatus() {
    const user = localStorage.getItem('eternalRestUser');
    if (user) {
        // User is logged in
        const loginBtn = document.getElementById('loginBtn');
        const registerBtn = document.getElementById('registerBtn');
        
        if (loginBtn) loginBtn.textContent = 'Dashboard';
        if (registerBtn) registerBtn.textContent = 'Logout';
        
        // Update event listeners for logged in state
        if (loginBtn) {
            loginBtn.addEventListener('click', (e) => {
                e.preventDefault();
                window.location.href = 'dashboard.html';
            });
        }
        
        if (registerBtn) {
            registerBtn.addEventListener('click', (e) => {
                e.preventDefault();
                localStorage.removeItem('eternalRestUser');
                window.location.reload();
            });
        }
    }
}

function setupPWAInstall() {
    let deferredPrompt;
    
    window.addEventListener('beforeinstallprompt', (e) => {
        // Prevent the mini-infobar from appearing on mobile
        e.preventDefault();
        // Stash the event so it can be triggered later
        deferredPrompt = e;
        // Update UI to notify the user they can install the PWA
        const installBtn = document.getElementById('installAppBtn');
        if (installBtn) {
            installBtn.style.display = 'block';
        }
    });
    
    window.deferredPrompt = deferredPrompt;
}

function installPWA() {
    if (window.deferredPrompt) {
        window.deferredPrompt.prompt();
        
        window.deferredPrompt.userChoice.then((choiceResult) => {
            if (choiceResult.outcome === 'accepted') {
                console.log('User accepted the install prompt');
                showNotification('App installed successfully!', 'success');
            } else {
                console.log('User dismissed the install prompt');
            }
            window.deferredPrompt = null;
        });
    }
}