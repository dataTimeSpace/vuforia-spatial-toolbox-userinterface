import EntraIDManager from './EntraIDManager.js';

// Initialize the EntraIDManager with your specific config
const entraIDManager = new EntraIDManager(
    '50a76ed0-a7d9-4160-9cb8-cd110a1e8995', // These are *not* confidential. OAuth 2.0 and OpenID Connect protocols assume the client ID is not confidential
    'b19d325b-538e-4cbd-82db-c5ef56d1c0c7', // Tenant IDs are often shared in URLs and are not considered confidential information
    'http://localhost:8081/src/oauth/entra/redirect.html', //window.location.href //'https://your-domain.com/auth/callback'
);

// This function will handle the redirect and authentication flow
window.onload = function() {
    entraIDManager.initialize()
        .then(() => {
            // After successful login, redirect the user back to the original session URL
            entraIDManager.handleRedirect();
        })
        .catch(error => {
            console.error("Error during the OAuth redirect flow:", error);
        });
};
