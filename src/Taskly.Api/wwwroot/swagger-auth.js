// Auto-authenticate with test user in Swagger
window.addEventListener('load', function() {
    setTimeout(function() {
        // Auto-login function
        async function autoAuthenticate() {
            try {
                // Get the test token
                const response = await fetch('/api/test/token');
                if (response.ok) {
                    const token = await response.text();
                    const cleanToken = token.replace(/"/g, ''); // Remove quotes
                    
                    // Set the authorization header in Swagger UI
                    if (window.ui) {
                        window.ui.authActions.authorize({
                            Bearer: {
                                name: "Bearer",
                                schema: {
                                    type: "http",
                                    scheme: "bearer"
                                },
                                value: cleanToken
                            }
                        });
                        
                        console.log('✅ Auto-authenticated with Bearer token');
                        
                        // Show success message
                        const authBtn = document.querySelector('.btn.authorize');
                        if (authBtn) {
                            authBtn.style.backgroundColor = '#49cc90';
                            authBtn.style.borderColor = '#49cc90';
                            authBtn.innerHTML = '🔓 Auto-Authenticated';
                        }
                    }
                }
            } catch (error) {
                console.log('❌ Auto-authentication failed:', error);
            }
        }
        
        // Wait for Swagger UI to load completely
        const checkSwaggerLoaded = setInterval(() => {
            if (window.ui && window.ui.authActions) {
                clearInterval(checkSwaggerLoaded);
                autoAuthenticate();
            }
        }, 100);
        
    }, 1000);
});

