// Dashboard JavaScript
document.addEventListener('DOMContentLoaded', function() {
    // Check if user is logged in
    const user = localStorage.getItem('eternalRestUser');
    if (!user) {
        window.location.href = 'index.html';
        return;
    }
    
    // Initialize dashboard
    initDashboard();
});

function initDashboard() {
    // Parse user data
    const user = JSON.parse(localStorage.getItem('eternalRestUser'));
    
    // Update user info in sidebar
    document.getElementById('userName').textContent = user.name || 'User Name';
    document.getElementById('userEmail').textContent = user.email || 'user@example.com';
    
    // Setup event listeners
    setupDashboardEvents();
    
    // Load memorials
    loadMemorials();
    
    // Initialize map
    initMap();
    
    // Load services
    loadServices();
    
    // Load visits
    loadVisits();
}

function setupDashboardEvents() {
    // Navigation menu toggle
    const menuToggle = document.getElementById('menuToggle');
    const navMenu = document.querySelector('.nav-menu');
    
    if (menuToggle) {
        menuToggle.addEventListener('click', () => {
            navMenu.classList.toggle('active');
        });
    }
    
    // Sidebar navigation
    const navItems = document.querySelectorAll('.nav-item');
    navItems.forEach(item => {
        item.addEventListener('click', (e) => {
            e.preventDefault();
            const section = item.getAttribute('data-section');
            
            // Update active nav item
            navItems.forEach(nav => nav.classList.remove('active'));
            item.classList.add('active');
            
            // Show corresponding section
            switchSection(section);
        });
    });
    
    // Logout button
    const logoutBtn = document.getElementById('logoutBtn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', (e) => {
            e.preventDefault();
            localStorage.removeItem('eternalRestUser');
            window.location.href = 'index.html';
        });
    }
    
    // Add memorial buttons
    const addMemorialBtns = document.querySelectorAll('#addMemorialBtn, #addNewMemorialBtn, #addFirstMemorialBtn');
    addMemorialBtns.forEach(btn => {
        if (btn) {
            btn.addEventListener('click', () => {
                openModal('memorial');
            });
        }
    });
    
    // Add memorial modal (reusing from main app)
    const memorialForm = document.getElementById('memorialForm');
    if (memorialForm) {
        memorialForm.addEventListener('submit', handleMemorialSubmit);
    }
    
    const closeModal = document.getElementById('closeModal');
    if (closeModal) {
        closeModal.addEventListener('click', closeAllModals);
    }
    
    const cancelMemorial = document.getElementById('cancelMemorial');
    if (cancelMemorial) {
        cancelMemorial.addEventListener('click', closeAllModals);
    }
    
    // Get current location button
    const getCurrentLocationBtn = document.getElementById('getCurrentLocation');
    if (getCurrentLocationBtn) {
        getCurrentLocationBtn.addEventListener('click', getCurrentLocation);
    }
    
    // Service booking
    const bookServiceBtns = document.querySelectorAll('#bookServiceBtn, #bookFirstServiceBtn');
    bookServiceBtns.forEach(btn => {
        if (btn) {
            btn.addEventListener('click', () => {
                openModal('service');
                populateMemorialsForService();
            });
        }
    });
    
    const serviceForm = document.getElementById('serviceForm');
    if (serviceForm) {
        serviceForm.addEventListener('submit', handleServiceSubmit);
    }
    
    const closeServiceModal = document.getElementById('closeServiceModal');
    if (closeServiceModal) {
        closeServiceModal.addEventListener('click', () => {
            document.getElementById('serviceModal').classList.remove('active');
        });
    }
    
    const cancelService = document.getElementById('cancelService');
    if (cancelService) {
        cancelService.addEventListener('click', () => {
            document.getElementById('serviceModal').classList.remove('active');
        });
    }
    
    // Service category filtering
    const serviceCategories = document.querySelectorAll('.service-category');
    serviceCategories.forEach(category => {
        category.addEventListener('click', () => {
            const categoryType = category.getAttribute('data-category');
            filterServices(categoryType);
        });
    });
    
    // Visit logging
    const logVisitBtns = document.querySelectorAll('#logVisitBtn, #logFirstVisitBtn');
    logVisitBtns.forEach(btn => {
        if (btn) {
            btn.addEventListener('click', () => {
                // In a real app, this would open a visit logging modal
                showNotification('Visit logging feature would open here in the full application', 'info');
            });
        }
    });
    
    // Profile form
    const profileForm = document.getElementById('profileForm');
    if (profileForm) {
        profileForm.addEventListener('submit', (e) => {
            e.preventDefault();
            showNotification('Profile updated successfully', 'success');
        });
    }
    
    // Password form
    const passwordForm = document.getElementById('passwordForm');
    if (passwordForm) {
        passwordForm.addEventListener('submit', (e) => {
            e.preventDefault();
            showNotification('Password changed successfully', 'success');
            passwordForm.reset();
        });
    }
    
    // Map controls
    const zoomInBtn = document.getElementById('zoomInBtn');
    if (zoomInBtn) {
        zoomInBtn.addEventListener('click', () => {
            if (window.dashboardMap) {
                window.dashboardMap.zoomIn();
            }
        });
    }
    
    const zoomOutBtn = document.getElementById('zoomOutBtn');
    if (zoomOutBtn) {
        zoomOutBtn.addEventListener('click', () => {
            if (window.dashboardMap) {
                window.dashboardMap.zoomOut();
            }
        });
    }
    
    const locateMeBtn = document.getElementById('locateMeBtn');
    if (locateMeBtn) {
        locateMeBtn.addEventListener('click', locateUserOnMap);
    }
    
    // Close modal when clicking outside
    window.addEventListener('click', (e) => {
        if (e.target.classList.contains('modal')) {
            closeAllModals();
        }
    });
}

function switchSection(sectionId) {
    // Hide all sections
    const sections = document.querySelectorAll('.dashboard-section');
    sections.forEach(section => {
        section.classList.remove('active');
    });
    
    // Show selected section
    const targetSection = document.getElementById(`${sectionId}Section`);
    if (targetSection) {
        targetSection.classList.add('active');
    }
    
    // Update map size if switching to map section
    if (sectionId === 'map' && window.dashboardMap) {
        setTimeout(() => {
            window.dashboardMap.invalidateSize();
            updateMapWithMemorials();
        }, 300);
    }
}

function loadMemorials() {
    const memorialsList = document.getElementById('memorialsList');
    if (!memorialsList) return;
    
    // Get memorials from localStorage
    const memorials = JSON.parse(localStorage.getItem('eternalRestMemorials') || '[]');
    
    // Clear current list
    memorialsList.innerHTML = '';
    
    if (memorials.length === 0) {
        // Show empty state
        memorialsList.innerHTML = `
            <div class="empty-state">
                <i class="fas fa-monument"></i>
                <h3>No Memorials Yet</h3>
                <p>Add your first memorial to get started.</p>
                <button class="btn-primary" id="addFirstMemorialBtn">Add Your First Memorial</button>
            </div>
        `;
        
        // Re-add event listener to the new button
        document.getElementById('addFirstMemorialBtn').addEventListener('click', () => {
            openModal('memorial');
        });
        
        return;
    }
    
    // Create memorial cards
    memorials.forEach(memorial => {
        const memorialCard = createMemorialCard(memorial);
        memorialsList.appendChild(memorialCard);
    });
    
    // Also update map memorials list
    updateMapMemorialsList(memorials);
}

function createMemorialCard(memorial) {
    const card = document.createElement('div');
    card.className = 'memorial-card';
    card.dataset.id = memorial.id;
    
    // Format date
    let dateDisplay = 'Date not specified';
    if (memorial.date) {
        const date = new Date(memorial.date);
        dateDisplay = date.toLocaleDateString('en-US', { 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric' 
        });
    }
    
    card.innerHTML = `
        <div class="memorial-header">
            <div class="memorial-name">${memorial.name} ${memorial.surname}</div>
            <div class="memorial-date">${dateDisplay}</div>
        </div>
        <div class="memorial-body">
            <div class="memorial-location">
                <i class="fas fa-map-marker-alt"></i> 
                ${memorial.location || 'Location not specified'}
            </div>
            ${memorial.message ? `<div class="memorial-message">"${memorial.message}"</div>` : ''}
            <div class="memorial-actions">
                <button class="btn-secondary" onclick="viewMemorialOnMap(${memorial.id})">
                    <i class="fas fa-map"></i> View on Map
                </button>
                <button class="btn-primary" onclick="editMemorial(${memorial.id})">
                    <i class="fas fa-edit"></i> Edit
                </button>
            </div>
        </div>
    `;
    
    return card;
}

function updateMapMemorialsList(memorials) {
    const mapMemorialsList = document.getElementById('mapMemorialsList');
    if (!mapMemorialsList) return;
    
    // Clear current list
    mapMemorialsList.innerHTML = '';
    
    if (memorials.length === 0) {
        mapMemorialsList.innerHTML = '<p>No memorials to display on map.</p>';
        return;
    }
    
    // Create memorial items for map sidebar
    memorials.forEach(memorial => {
        if (memorial.coordinates) {
            const item = document.createElement('div');
            item.className = 'map-memorial-item';
            item.dataset.id = memorial.id;
            item.innerHTML = `
                <div class="map-memorial-name">${memorial.name} ${memorial.surname}</div>
                <div class="map-memorial-location">${memorial.location || 'No location details'}</div>
            `;
            
            item.addEventListener('click', () => {
                viewMemorialOnMap(memorial.id);
            });
            
            mapMemorialsList.appendChild(item);
        }
    });
}

function initMap() {
    const mapContainer = document.getElementById('dashboardMap');
    if (!mapContainer) return;
    
    try {
        // Create map centered on a default location
        const map = L.map('dashboardMap').setView([40.7128, -74.0060], 10);
        window.dashboardMap = map;
        
        // Add tile layer
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '© OpenStreetMap contributors'
        }).addTo(map);
        
        // Update map with memorials
        updateMapWithMemorials();
    } catch (error) {
        console.log("Map initialization failed:", error);
        mapContainer.innerHTML = '<div class="empty-state"><p>Map could not be loaded. Please try again later.</p></div>';
    }
}

function updateMapWithMemorials() {
    if (!window.dashboardMap) return;
    
    // Clear existing markers
    if (window.memorialMarkers) {
        window.memorialMarkers.forEach(marker => marker.remove());
    }
    
    window.memorialMarkers = [];
    
    // Get memorials from localStorage
    const memorials = JSON.parse(localStorage.getItem('eternalRestMemorials') || '[]');
    
    // Add markers for memorials with coordinates
    memorials.forEach(memorial => {
        if (memorial.coordinates && memorial.coordinates.lat && memorial.coordinates.lng) {
            const marker = L.marker([memorial.coordinates.lat, memorial.coordinates.lng])
                .addTo(window.dashboardMap)
                .bindPopup(`<b>${memorial.name} ${memorial.surname}</b><br>${memorial.location || ''}`);
            
            marker.memorialId = memorial.id;
            window.memorialMarkers.push(marker);
        }
    });
    
    // Fit bounds to show all markers if there are any
    if (window.memorialMarkers.length > 0) {
        const markerGroup = L.featureGroup(window.memorialMarkers);
        window.dashboardMap.fitBounds(markerGroup.getBounds().pad(0.1));
    }
}

function viewMemorialOnMap(memorialId) {
    // Switch to map section
    switchSection('map');
    
    // Find the memorial
    const memorials = JSON.parse(localStorage.getItem('eternalRestMemorials') || '[]');
    const memorial = memorials.find(m => m.id === memorialId);
    
    if (!memorial || !memorial.coordinates) {
        showNotification('This memorial does not have location data', 'error');
        return;
    }
    
    // Pan and zoom to the memorial
    if (window.dashboardMap) {
        window.dashboardMap.setView([memorial.coordinates.lat, memorial.coordinates.lng], 15);
        
        // Open the popup for this memorial
        const marker = window.memorialMarkers.find(m => m.memorialId === memorialId);
        if (marker) {
            marker.openPopup();
        }
    }
}

function locateUserOnMap() {
    if (!navigator.geolocation) {
        showNotification('Geolocation is not supported by your browser', 'error');
        return;
    }
    
    // Show loading state
    const button = document.getElementById('locateMeBtn');
    const originalText = button.innerHTML;
    button.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Locating...';
    button.disabled = true;
    
    navigator.geolocation.getCurrentPosition(
        (position) => {
            // Success
            const lat = position.coords.latitude;
            const lng = position.coords.longitude;
            
            // Center map on user's location
            if (window.dashboardMap) {
                window.dashboardMap.setView([lat, lng], 14);
                
                // Add a marker for user's location
                if (window.userLocationMarker) {
                    window.userLocationMarker.remove();
                }
                
                window.userLocationMarker = L.marker([lat, lng])
                    .addTo(window.dashboardMap)
                    .bindPopup('Your current location')
                    .openPopup();
                
                // Make the marker blue
                window.userLocationMarker.setIcon(
                    L.icon({
                        iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-blue.png',
                        shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
                        iconSize: [25, 41],
                        iconAnchor: [12, 41],
                        popupAnchor: [1, -34],
                        shadowSize: [41, 41]
                    })
                );
            }
            
            // Reset button
            button.innerHTML = originalText;
            button.disabled = false;
        },
        (error) => {
            // Error
            console.error("Error getting location:", error);
            
            // Reset button
            button.innerHTML = originalText;
            button.disabled = false;
            
            // Show error message
            showNotification('Unable to retrieve your location', 'error');
        }
    );
}

function loadServices() {
    const servicesList = document.getElementById('servicesList');
    if (!servicesList) return;
    
    // In a real app, this would come from an API
    // For demo, we'll create some sample services
    const sampleServices = [
        {
            id: 1,
            type: 'maintenance',
            name: 'Regular Plot Maintenance',
            memorial: 'John Smith',
            date: '2023-10-15',
            frequency: 'monthly',
            status: 'scheduled'
        },
        {
            id: 2,
            type: 'flowers',
            name: 'Flower Placement',
            memorial: 'Mary Johnson',
            date: '2023-10-10',
            frequency: 'weekly',
            status: 'completed'
        },
        {
            id: 3,
            type: 'visits',
            name: 'Confirmed Visit',
            memorial: 'Robert Williams',
            date: '2023-10-05',
            frequency: 'once',
            status: 'scheduled'
        }
    ];
    
    // Get services from localStorage or use sample data
    let services = JSON.parse(localStorage.getItem('eternalRestServices'));
    if (!services || services.length === 0) {
        services = sampleServices;
        localStorage.setItem('eternalRestServices', JSON.stringify(services));
    }
    
    // Clear current list
    servicesList.innerHTML = '';
    
    if (services.length === 0) {
        // Show empty state
        servicesList.innerHTML = `
            <div class="empty-state">
                <i class="fas fa-concierge-bell"></i>
                <h3>No Services Booked</h3>
                <p>Book your first service to ensure proper care of memorial sites.</p>
                <button class="btn-primary" id="bookFirstServiceBtn">Book a Service</button>
            </div>
        `;
        
        // Re-add event listener
        document.getElementById('bookFirstServiceBtn').addEventListener('click', () => {
            openModal('service');
            populateMemorialsForService();
        });
        
        return;
    }
    
    // Create service items
    services.forEach(service => {
        const serviceItem = createServiceItem(service);
        servicesList.appendChild(serviceItem);
    });
}

function createServiceItem(service) {
    const item = document.createElement('div');
    item.className = 'service-item';
    item.dataset.type = service.type;
    
    // Format date
    const date = new Date(service.date);
    const formattedDate = date.toLocaleDateString('en-US', { 
        month: 'short', 
        day: 'numeric',
        year: 'numeric'
    });
    
    // Status class
    const statusClass = `status-${service.status}`;
    
    item.innerHTML = `
        <div class="service-info">
            <h4>${service.name}</h4>
            <div class="service-details">
                <span><i class="fas fa-monument"></i> ${service.memorial}</span>
                <span><i class="fas fa-calendar"></i> ${formattedDate}</span>
                <span><i class="fas fa-redo"></i> ${service.frequency}</span>
            </div>
        </div>
        <div class="service-status ${statusClass}">${service.status}</div>
    `;
    
    return item;
}

function filterServices(category) {
    // Update active category
    const categories = document.querySelectorAll('.service-category');
    categories.forEach(cat => {
        cat.classList.remove('active');
        if (cat.getAttribute('data-category') === category) {
            cat.classList.add('active');
        }
    });
    
    // Show/hide services based on category
    const serviceItems = document.querySelectorAll('.service-item');
    serviceItems.forEach(item => {
        if (category === 'all' || item.dataset.type === category) {
            item.style.display = 'flex';
        } else {
            item.style.display = 'none';
        }
    });
}

function populateMemorialsForService() {
    const memorialSelect = document.getElementById('serviceMemorial');
    if (!memorialSelect) return;
    
    // Clear existing options except the first one
    while (memorialSelect.options.length > 1) {
        memorialSelect.remove(1);
    }
    
    // Get memorials from localStorage
    const memorials = JSON.parse(localStorage.getItem('eternalRestMemorials') || '[]');
    
    // Add options for each memorial
    memorials.forEach(memorial => {
        const option = document.createElement('option');
        option.value = memorial.id;
        option.textContent = `${memorial.name} ${memorial.surname} - ${memorial.location || 'No location'}`;
        memorialSelect.appendChild(option);
    });
}

function handleServiceSubmit(e) {
    e.preventDefault();
    
    // Get form data
    const serviceType = document.getElementById('serviceType').value;
    const memorialId = parseInt(document.getElementById('serviceMemorial').value);
    const serviceDate = document.getElementById('serviceDate').value;
    const frequency = document.getElementById('serviceFrequency').value;
    const notes = document.getElementById('serviceNotes').value;
    
    // Basic validation
    if (!serviceType || !memorialId || !serviceDate) {
        showNotification('Please fill in all required fields', 'error');
        return;
    }
    
    // Get memorial name
    const memorials = JSON.parse(localStorage.getItem('eternalRestMemorials') || '[]');
    const memorial = memorials.find(m => m.id === memorialId);
    if (!memorial) {
        showNotification('Selected memorial not found', 'error');
        return;
    }
    
    // Create service object
    const service = {
        id: Date.now(),
        type: serviceType,
        name: document.getElementById('serviceType').options[document.getElementById('serviceType').selectedIndex].text,
        memorial: `${memorial.name} ${memorial.surname}`,
        date: serviceDate,
        frequency: frequency,
        notes: notes,
        status: 'scheduled',
        createdAt: new Date().toISOString()
    };
    
    // Get existing services
    let services = JSON.parse(localStorage.getItem('eternalRestServices') || '[]');
    
    // Add new service
    services.push(service);
    
    // Save back to localStorage
    localStorage.setItem('eternalRestServices', JSON.stringify(services));
    
    // Show success message
    showNotification(`Service booked successfully for ${memorial.name} ${memorial.surname}!`, 'success');
    
    // Close modal
    document.getElementById('serviceModal').classList.remove('active');
    
    // Reset form
    e.target.reset();
    
    // Reload services list
    loadServices();
}

function loadVisits() {
    const visitsList = document.getElementById('visitsList');
    if (!visitsList) return;
    
    // In a real app, this would come from an API
    // For demo, we'll create some sample visits
    const sampleVisits = [
        {
            id: 1,
            memorial: 'John Smith',
            date: '2023-10-01',
            notes: 'Placed fresh flowers and cleaned the headstone',
            photos: []
        },
        {
            id: 2,
            memorial: 'Mary Johnson',
            date: '2023-09-15',
            notes: 'Visited with family members',
            photos: []
        }
    ];
    
    // Get visits from localStorage or use sample data
    let visits = JSON.parse(localStorage.getItem('eternalRestVisits'));
    if (!visits || visits.length === 0) {
        visits = sampleVisits;
        localStorage.setItem('eternalRestVisits', JSON.stringify(visits));
    }
    
    // Clear current list
    visitsList.innerHTML = '';
    
    if (visits.length === 0) {
        // Show empty state
        visitsList.innerHTML = `
            <div class="empty-state">
                <i class="fas fa-check-circle"></i>
                <h3>No Visits Logged</h3>
                <p>Log your first visit to a memorial site to keep track of your visits.</p>
                <button class="btn-primary" id="logFirstVisitBtn">Log Your First Visit</button>
            </div>
        `;
        
        // Re-add event listener
        document.getElementById('logFirstVisitBtn').addEventListener('click', () => {
            // In a real app, this would open a visit logging modal
            showNotification('Visit logging feature would open here in the full application', 'info');
        });
        
        return;
    }
    
    // Create visit items
    visits.forEach(visit => {
        const visitItem = createVisitItem(visit);
        visitsList.appendChild(visitItem);
    });
}

function createVisitItem(visit) {
    const item = document.createElement('div');
    item.className = 'visit-item';
    
    // Parse date
    const date = new Date(visit.date);
    const day = date.getDate();
    const month = date.toLocaleDateString('en-US', { month: 'short' });
    const year = date.getFullYear();
    
    // Format date string
    const dateString = date.toLocaleDateString('en-US', { 
        month: 'long', 
        day: 'numeric',
        year: 'numeric'
    });
    
    item.innerHTML = `
        <div class="visit-date">
            <div class="visit-day">${day}</div>
            <div class="visit-month">${month} ${year}</div>
        </div>
        <div class="visit-details">
            <div class="visit-memorial">${visit.memorial}</div>
            <div class="visit-notes">${visit.notes}</div>
            <div class="visit-date">Visited on ${dateString}</div>
            ${visit.photos && visit.photos.length > 0 ? 
                `<div class="visit-photos">
                    ${visit.photos.map(photo => `<div class="visit-photo" style="background-image: url('${photo}')"></div>`).join('')}
                </div>` : ''
            }
        </div>
    `;
    
    return item;
}

function openModal(modalType) {
    closeAllModals();
    
    if (modalType === 'memorial') {
        document.getElementById('addMemorialModal').classList.add('active');
    } else if (modalType === 'service') {
        document.getElementById('serviceModal').classList.add('active');
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

// Reuse functions from main app
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
    
    // Reload memorials list and map
    loadMemorials();
    updateMapWithMemorials();
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
    
    // Add styles if not already present
    if (!document.getElementById('notification-styles')) {
        const style = document.createElement('style');
        style.id = 'notification-styles';
        style.textContent = `
            .notification {
                position: fixed;
                top: 20px;
                right: 20px;
                background-color: #d1ecf1;
                color: #0c5460;
                padding: 15px 20px;
                border-radius: 5px;
                box-shadow: 0 4px 12px rgba(0,0,0,0.15);
                display: flex;
                align-items: center;
                gap: 10px;
                z-index: 3000;
                max-width: 400px;
                animation: slideIn 0.3s ease;
            }
            .notification-success {
                background-color: #d4edda;
                color: #155724;
            }
            .notification-error {
                background-color: #f8d7da;
                color: #721c24;
            }
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
}

// Placeholder functions for memorial actions
function editMemorial(memorialId) {
    showNotification(`Edit memorial feature would open here. Memorial ID: ${memorialId}`, 'info');
}

function deleteMemorial(memorialId) {
    if (confirm('Are you sure you want to delete this memorial?')) {
        // Get memorials from localStorage
        let memorials = JSON.parse(localStorage.getItem('eternalRestMemorials') || '[]');
        
        // Remove the memorial
        memorials = memorials.filter(m => m.id !== memorialId);
        
        // Save back to localStorage
        localStorage.setItem('eternalRestMemorials', JSON.stringify(memorials));
        
        // Show success message
        showNotification('Memorial deleted successfully', 'success');
        
        // Reload memorials list and map
        loadMemorials();
        updateMapWithMemorials();
    }
}
// Add this function to get auth header
function getAuthHeader() {
    const token = localStorage.getItem('token');
    return {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
    };
}

// Update loadMemorials function
async function loadMemorials() {
    const token = localStorage.getItem('token');
    if (!token) {
        window.location.href = 'index.html';
        return;
    }
    
    try {
        const response = await fetch(`${API_URL}/memorials`, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        
        const data = await response.json();
        
        if (data.success) {
            // Render memorials from data.data
            renderMemorials(data.data);
        } else {
            showNotification('Error loading memorials', 'error');
        }
    } catch (error) {
        console.error('Error:', error);
        showNotification('Error connecting to server', 'error');
    }
}