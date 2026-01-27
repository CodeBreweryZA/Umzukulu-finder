// Contact Page JavaScript
document.addEventListener('DOMContentLoaded', function() {
    initContactPage();
});

function initContactPage() {
    // Setup event listeners
    setupContactEvents();
    
    // Initialize FAQ functionality
    initFAQ();
    
    // Check auth status
    checkAuthStatus();
}

function setupContactEvents() {
    // Navigation menu toggle
    const menuToggle = document.getElementById('menuToggle');
    const navMenu = document.querySelector('.nav-menu');
    
    if (menuToggle) {
        menuToggle.addEventListener('click', () => {
            navMenu.classList.toggle('active');
        });
    }
    
    // Contact form submission
    const contactForm = document.getElementById('contactForm');
    if (contactForm) {
        contactForm.addEventListener('submit', handleContactSubmit);
    }
    
    // Close modal buttons
    const closeModalBtns = document.querySelectorAll('.close-modal, #closeSuccessModal');
    closeModalBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            document.getElementById('contactSuccessModal').classList.remove('active');
        });
    });
    
    // Close modal when clicking outside
    window.addEventListener('click', (e) => {
        if (e.target.classList.contains('modal')) {
            document.getElementById('contactSuccessModal').classList.remove('active');
        }
    });
    
    // Generate reference number for form submission
    generateReferenceNumber();
}

function initFAQ() {
    const faqQuestions = document.querySelectorAll('.faq-question');
    
    faqQuestions.forEach(question => {
        question.addEventListener('click', () => {
            const faqItem = question.parentElement;
            faqItem.classList.toggle('active');
        });
    });
}

function generateReferenceNumber() {
    // Generate a unique reference number
    const date = new Date();
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
    
    const refNumber = `ETR-${year}${month}${day}-${random}`;
    
    // Update reference number in modal
    const refElement = document.getElementById('referenceNumber');
    if (refElement) {
        refElement.textContent = refNumber;
    }
    
    return refNumber;
}

function handleContactSubmit(e) {
    e.preventDefault();
    
    // Get form data
    const formData = {
        name: document.getElementById('contactName').value,
        email: document.getElementById('contactEmail').value,
        phone: document.getElementById('contactPhone').value || 'Not provided',
        subject: document.getElementById('contactSubject').value,
        message: document.getElementById('contactMessage').value,
        urgency: document.querySelector('input[name="urgency"]:checked').value,
        newsletter: document.getElementById('contactNewsletter').checked,
        timestamp: new Date().toISOString(),
        reference: generateReferenceNumber()
    };
    
    // Validate form
    if (!formData.name || !formData.email || !formData.subject || !formData.message) {
        showNotification('Please fill in all required fields', 'error');
        return;
    }
    
    // Set expected response time based on urgency
    let responseTime = 'Within 24 hours';
    switch(formData.urgency) {
        case 'low':
            responseTime = 'Within 48 hours';
            break;
        case 'high':
            responseTime = 'Within 6 hours';
            break;
    }
    
    // Update modal with response time
    const responseElement = document.getElementById('responseTime');
    if (responseElement) {
        responseElement.textContent = responseTime;
    }
    
    // In a real application, you would send this data to your backend
    // For now, we'll simulate sending and show success modal
    
    // Simulate API call delay
    const submitBtn = e.target.querySelector('button[type="submit"]');
    const originalText = submitBtn.innerHTML;
    submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Sending...';
    submitBtn.disabled = true;
    
    setTimeout(() => {
        // Reset button
        submitBtn.innerHTML = originalText;
        submitBtn.disabled = false;
        
        // Show success modal
        document.getElementById('contactSuccessModal').classList.add('active');
        
        // In a real app, you would send the data to your server:
        // Example:
        // fetch('/api/contact', {
        //     method: 'POST',
        //     headers: {
        //         'Content-Type': 'application/json',
        //     },
        //     body: JSON.stringify(formData)
        // })
        // .then(response => response.json())
        // .then(data => {
        //     if (data.success) {
        //         document.getElementById('contactSuccessModal').classList.add('active');
        //         e.target.reset();
        //     } else {
        //         showNotification(data.error || 'Failed to send message', 'error');
        //     }
        // })
        // .catch(error => {
        //     console.error('Error:', error);
        //     showNotification('Error sending message', 'error');
        // });
        
        // Reset form
        e.target.reset();
        
        // Log the form data (for debugging)
        console.log('Contact form submitted:', formData);
        
        // Store in localStorage for demo purposes
        let contacts = JSON.parse(localStorage.getItem('eternalRestContacts') || '[]');
        contacts.push(formData);
        localStorage.setItem('eternalRestContacts', JSON.stringify(contacts));
        
    }, 1500);
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

function checkAuthStatus() {
    const token = localStorage.getItem('token') || localStorage.getItem('eternalRestUser');
    
    if (token) {
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
                localStorage.removeItem('token');
                localStorage.removeItem('eternalRestUser');
                localStorage.removeItem('user');
                window.location.reload();
            });
        }
    }
}