// Authentication JavaScript
document.addEventListener('DOMContentLoaded', function() {
    const loginForm = document.getElementById('loginForm');
    const registerForm = document.getElementById('registerForm');
    if (loginForm) loginForm.addEventListener('submit', handleLogin);
    if (registerForm) registerForm.addEventListener('submit', handleRegister);
    checkAuthStatus();
});

function handleLogin(e) {
    e.preventDefault();
    const email = document.getElementById('loginEmail').value;
    const password = document.getElementById('loginPassword').value;
    if (!email || !password) { showNotification('Please fill in all fields', 'error'); return; }
    const user = { id: Date.now(), email, name: email.split('@')[0], createdAt: new Date().toISOString() };
    localStorage.setItem('eternalRestUser', JSON.stringify(user));
    showNotification('Login successful! Redirecting...', 'success');
    const authModal = document.getElementById('authModal');
    if (authModal) authModal.classList.remove('active');
    setTimeout(() => window.location.href = 'dashboard.html', 1500);
}

function handleRegister(e) {
    e.preventDefault();
    const name = document.getElementById('registerName').value;
    const email = document.getElementById('registerEmail').value;
    const password = document.getElementById('registerPassword').value;
    const confirmPassword = document.getElementById('confirmPassword').value;
    if (!name || !email || !password || !confirmPassword) { showNotification('Please fill in all fields', 'error'); return; }
    if (password !== confirmPassword) { showNotification('Passwords do not match', 'error'); return; }
    if (password.length < 6) { showNotification('Password must be at least 6 characters', 'error'); return; }
    const user = { id: Date.now(), name, email, createdAt: new Date().toISOString() };
    localStorage.setItem('eternalRestUser', JSON.stringify(user));
    showNotification('Registration successful! Redirecting...', 'success');
    const authModal = document.getElementById('authModal');
    if (authModal) authModal.classList.remove('active');
    e.target.reset();
    setTimeout(() => window.location.href = 'dashboard.html', 1500);
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
