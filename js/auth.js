// Login and Register Form Handlers
document.addEventListener("DOMContentLoaded", () => {
    
    // Login is temporarily unavailable.
    const loginForm = document.querySelector('#login form');
    if (loginForm) {
        loginForm.addEventListener('submit', (e) => {
            e.preventDefault();
            showAlert('warning', 'Login is coming soon. Please use Register for now.');
        });
    }
    
    // Register Form Handler
    const registerForm = document.querySelector('#register form');
    if (registerForm) {
        registerForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            
            const formData = new FormData(registerForm);
            const submitBtn = registerForm.querySelector('button[type="submit"]');
            const originalText = submitBtn.textContent;
            
            // Client-side validation
            const password = formData.get('password');
            const confirmPassword = formData.get('confirm_password');
            
            if (password !== confirmPassword) {
                showAlert('danger', 'Passwords do not match');
                return;
            }
            
            if (password.length < 8) {
                showAlert('danger', 'Password must be at least 8 characters');
                return;
            }
            
            // Disable button and show loading
            submitBtn.disabled = true;
            submitBtn.innerHTML = '<span class="spinner-border spinner-border-sm me-2"></span>Registering...';
            
            try {
                const response = await fetch('../backend/auth/register.php', {
                    method: 'POST',
                    body: formData
                });
                
                const result = await response.json();
                
                if (result.success) {
                    showAlert('success', result.message);
                    registerForm.reset();
                    
                    // Switch to login tab
                    if (result.switch_tab === 'login') {
                        setTimeout(() => {
                            const loginTab = document.querySelector('#login-tab');
                            if (loginTab) loginTab.click();
                        }, 1500);
                    }
                } else {
                    showAlert('danger', result.message);
                }
                
                submitBtn.disabled = false;
                submitBtn.textContent = originalText;
                
            } catch (error) {
                showAlert('danger', 'An error occurred. Please try again.');
                submitBtn.disabled = false;
                submitBtn.textContent = originalText;
            }
        });
    }
    
    // Helper function to show alerts
    function showAlert(type, message) {
        // Remove existing alerts
        const existingAlerts = document.querySelectorAll('.auth-alert');
        existingAlerts.forEach(alert => alert.remove());
        
        // Create new alert
        const alertDiv = document.createElement('div');
        alertDiv.className = `alert alert-${type} alert-dismissible fade show auth-alert`;
        alertDiv.setAttribute('role', 'alert');
        alertDiv.innerHTML = `
            ${message}
            <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
        `;
        
        // Insert alert at the top of the active tab
        const activeTab = document.querySelector('.tab-pane.active');
        if (activeTab) {
            activeTab.insertBefore(alertDiv, activeTab.firstChild);
        }
        
        // Auto-dismiss after 5 seconds
        setTimeout(() => {
            alertDiv.classList.remove('show');
            setTimeout(() => alertDiv.remove(), 150);
        }, 5000);
    }
});
 