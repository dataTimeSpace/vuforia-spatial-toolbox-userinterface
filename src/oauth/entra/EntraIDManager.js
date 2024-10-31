class EntraIDManager {
    constructor(clientId, tenantId, redirectUri) {
        // MSAL.js configuration
        this.msalConfig = {
            auth: {
                clientId: clientId,
                authority: `https://login.microsoftonline.com/${tenantId}`,
                redirectUri: redirectUri, // Dynamic redirect URI you set in the portal
            },
            cache: {
                cacheLocation: 'localStorage',
                storeAuthStateInCookie: true
            }
        };

        this.msalInstance = new msal.PublicClientApplication(this.msalConfig);
        this.listeners = {
            loginSuccess: [],
            loginFailure: []
        };
    }

    // Initialize the MSAL instance, handle login, and process login responses
    initialize() {
        return new Promise((resolve, reject) => {

            this.storeNetworkIdAndSecret();

            // // const edgeServer = this.isCloud(window.location) ? window.location.origin + this.getToolboxEdgeBasePath() : ((realityEditor.network.useHTTPS ? 'https' : 'http') + `://${object.ip}:${object.port}`);
            // http://localhost:8081/src/oauth/entra/redirect.html
            // const nonce = this.generateNonce();
            // let state = JSON.stringify({
            //     // For knowing which server to use for OAuth requests
            //     edgeServer: null, //edgeServer,
            //     // For redirecting back to toolbox after server gets token, special case for local server redirect on new scan page to prevent being redirected to the new scan page
            //     toolboxUrl: this.isLocalServer(window.location) ? this.getLocalJoinUrl() : window.location.href,
            //     // For associating received token with tool
            //     // frameName: frameName
            // });
            // // OAuth state parameter is specifically for nonces, NOT application state
            // localStorage.setItem('activeOAuthNonce', nonce);
            // localStorage.setItem('activeOAuthState', state);

            this.msalInstance.handleRedirectPromise()
                .then((response) => {
                    if (response && response.account) {
                        const username = response.account.username;
                        this._notifyListeners('loginSuccess', { username });
                        resolve(username);
                    } else {
                        // Check if there's already a signed-in user
                        const accounts = this.msalInstance.getAllAccounts();
                        if (accounts.length > 0) {
                            const username = accounts[0].username;
                            this._notifyListeners('loginSuccess', { username });
                            resolve(username);
                        } else {
                            // If no logged-in user, reject
                            reject("No user logged in");
                        }
                    }
                })
                .catch(error => {
                    this._notifyListeners('loginFailure', error);
                    reject(error);
                });
        });
    }

    // Store the current session URL and trigger login
    login() {
        const redirectUrl = window.location.href;  // Save the current session URL
        localStorage.setItem('redirectUrl', redirectUrl);  // Store in localStorage

        this.msalInstance.loginRedirect({
            scopes: ["user.read"],
        });
    }

    // Method to check the login status and return username if logged in
    checkLoginStatus() {
        const accounts = this.msalInstance.getAllAccounts();
        if (accounts.length > 0) {
            return accounts[0].username;
        } else {
            return null;
        }
    }

    // Handle the redirect back to the original session URL
    handleRedirect() {
        const redirectUrl = localStorage.getItem('redirectUrl');
        localStorage.removeItem('redirectUrl');  // Clean up the stored URL

        if (redirectUrl) {
            window.location.href = redirectUrl;  // Redirect back to the original session link
        } else {
            console.log("No redirect URL found.");
        }
    }

    // Add listeners for login success or failure
    on(event, callback) {
        if (this.listeners[event]) {
            this.listeners[event].push(callback);
        }
    }

    // Notify listeners of login events
    _notifyListeners(event, data) {
        if (this.listeners[event]) {
            this.listeners[event].forEach(callback => callback(data));
        }
    }

    generateNonce() {
        let nonce = "";
        let characters = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
        for (let i = 0; i < 32; i++) {
            nonce += characters.charAt(Math.floor(Math.random() * characters.length));
        }
        return nonce;
    }

    isLocalServer (location) {
        return location.port === "49368";
    }

    /**
     * Transforms deepLink=newScan URLs into a join URL, makes no changes to deepLink=joinScan URLs
     * @return {string}
     */
    getLocalJoinUrl() {
        const queryParams = new URLSearchParams(window.location.search);
        queryParams.set('deepLink', 'joinScan');
        queryParams.set('toolboxWorldId', realityEditor.sceneGraph.getWorldId());
        return `${window.location.origin}${window.location.pathname}?${queryParams.toString()}`;
    }

    isCloud(location) {
        try {
            location = new URL(location);
        } catch (e) {
            console.error(`Passed a non-fully-formed URL to isCloud: ${location}`);
            return false;
        }
        return !location.port || location.port === "443";
    }

    getToolboxEdgeBasePath() {
        const windowPath = window.location.pathname;
        return '/' + windowPath.split('/').slice(2,6).join('/') + '/i/whud7837yhd'; // => (/stable dropped when connecting to edge-server rather than ui) /n/networkId/s/networkSecret
    }

    storeNetworkIdAndSecret() {
        const windowPath = window.location.pathname;
        const pathFragments = windowPath.split('/'); // => '', 'stable', 'n', 'networkId', 's', 'networkSecret', ''
        const networkId = pathFragments[3];
        const networkSecret = pathFragments[5];
        localStorage.setItem('networkId', networkId);
        localStorage.setItem('networkSecret', networkSecret);
    }
}

export default EntraIDManager;
