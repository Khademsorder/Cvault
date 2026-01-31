/* =========================================
   VAULT OS - AUTHENTICATION MODULE
   PIN Security & Google OAuth with Real Storage
   ========================================= */

class AuthManager {
    constructor() {
        this.accessToken = null;
        this.user = null;
        this.storageInfo = null;
        this.pinBuffer = '';
        this.loginAttempts = 0;
        this.isAuthenticated = false;
        this.sessionTimer = null;
        this.oauthPopup = null;
        
        // Initialize
        this.init();
    }
    
    init() {
        // Load saved session
        this.loadSession();
        
        // Setup event listeners
        this.setupEventListeners();
    }
    
    setupEventListeners() {
        // PIN pad buttons
        document.querySelectorAll('.num-btn[data-num]').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const num = e.target.dataset.num;
                this.addToPinBuffer(num);
            });
        });
        
        // Clear button
        document.querySelector('.btn-clear')?.addEventListener('click', () => {
            this.clearPinBuffer();
        });
        
        // Submit button
        document.querySelector('.btn-submit')?.addEventListener('click', () => {
            this.validatePin();
        });
        
        // Keyboard support for PIN
        document.addEventListener('keydown', (e) => {
            if (e.key >= '0' && e.key <= '9') {
                this.addToPinBuffer(e.key);
            } else if (e.key === 'Backspace') {
                this.removeFromPinBuffer();
            } else if (e.key === 'Enter') {
                this.validatePin();
            }
        });
        
        // Google Drive connection
        document.getElementById('authorize-drive')?.addEventListener('click', () => {
            this.startGoogleOAuth();
        });
        
        // Retry connection
        document.getElementById('retry-connection')?.addEventListener('click', () => {
            this.retryConnection();
        });
        
        // Cancel connection
        document.getElementById('cancel-connection')?.addEventListener('click', () => {
            this.cancelConnection();
        });
        
        // Logout
        document.getElementById('logout-btn')?.addEventListener('click', () => {
            this.logout();
        });
        
        // Close drive modal
        document.getElementById('close-drive-modal')?.addEventListener('click', () => {
            document.getElementById('drive-connect-modal').classList.add('hidden');
        });
        
        // Close upload progress
        document.getElementById('close-upload-progress')?.addEventListener('click', () => {
            document.getElementById('upload-progress-modal').classList.add('hidden');
        });
        
        // Close media viewer
        document.getElementById('close-media')?.addEventListener('click', () => {
            document.getElementById('media-modal').classList.add('hidden');
        });
        
        // Profile dropdown
        document.getElementById('user-profile')?.addEventListener('click', (e) => {
            e.stopPropagation();
            this.toggleProfileDropdown();
        });
        
        // Close dropdown when clicking outside
        document.addEventListener('click', () => {
            this.hideProfileDropdown();
        });
        
        // View profile
        document.getElementById('view-profile')?.addEventListener('click', () => {
            this.showUserProfile();
        });
        
        // Account settings
        document.getElementById('account-settings')?.addEventListener('click', () => {
            this.showAccountSettings();
        });
        
        // Connect drive from empty state
        document.getElementById('connect-empty-drive')?.addEventListener('click', () => {
            this.showDriveModal();
        });
    }
    
    addToPinBuffer(num) {
        if (this.pinBuffer.length < VAULT_CONFIG.app.pinLength) {
            this.pinBuffer += num;
            this.updatePinDisplay();
        }
    }
    
    removeFromPinBuffer() {
        this.pinBuffer = this.pinBuffer.slice(0, -1);
        this.updatePinDisplay();
    }
    
    clearPinBuffer() {
        this.pinBuffer = '';
        this.updatePinDisplay();
        this.hidePinError();
    }
    
    updatePinDisplay() {
        const pinInput = document.getElementById('pin-input');
        if (pinInput) {
            pinInput.value = '•'.repeat(this.pinBuffer.length);
        }
    }
    
    showPinError(message) {
        const errorElement = document.getElementById('pin-error');
        if (errorElement) {
            errorElement.textContent = message;
            errorElement.classList.remove('hidden');
            
            // Shake animation
            errorElement.style.animation = 'none';
            setTimeout(() => {
                errorElement.style.animation = 'shake 0.5s ease-in-out';
            }, 10);
        }
    }
    
    hidePinError() {
        const errorElement = document.getElementById('pin-error');
        if (errorElement) {
            errorElement.classList.add('hidden');
        }
    }
    
    validatePin() {
        const savedPin = localStorage.getItem(VAULT_CONFIG.storage.pinHash) || VAULT_CONFIG.app.defaultPin;
        
        if (this.pinBuffer === savedPin) {
            // PIN correct
            this.hidePinError();
            this.loginAttempts = 0;
            this.onPinSuccess();
            return true;
        } else {
            // Wrong PIN
            this.loginAttempts++;
            
            if (this.loginAttempts >= VAULT_CONFIG.app.maxLoginAttempts) {
                this.showPinError('Too many attempts. Please wait 5 minutes.');
                this.disablePinPad();
                setTimeout(() => {
                    this.enablePinPad();
                    this.loginAttempts = 0;
                    this.clearPinBuffer();
                }, 5 * 60 * 1000);
            } else {
                const remaining = VAULT_CONFIG.app.maxLoginAttempts - this.loginAttempts;
                this.showPinError(`Wrong PIN. ${remaining} attempts remaining.`);
                this.pinBuffer = '';
                this.updatePinDisplay();
            }
            return false;
        }
    }
    
    disablePinPad() {
        document.querySelectorAll('.num-btn').forEach(btn => {
            btn.disabled = true;
            btn.style.opacity = '0.5';
            btn.style.cursor = 'not-allowed';
        });
    }
    
    enablePinPad() {
        document.querySelectorAll('.num-btn').forEach(btn => {
            btn.disabled = false;
            btn.style.opacity = '1';
            btn.style.cursor = 'pointer';
        });
    }
    
    onPinSuccess() {
        // Hide PIN screen
        document.getElementById('pin-screen').classList.add('hidden');
        
        // Check if we have an existing session
        if (this.isLoggedIn() && this.accessToken) {
            this.startApp();
            this.showSuccess('Welcome back!');
        } else {
            // Show Google Drive connection modal
            this.showDriveModal();
        }
    }
    
    showDriveModal() {
        const modal = document.getElementById('drive-connect-modal');
        if (modal) {
            modal.classList.remove('hidden');
            this.updateConnectionStatus();
        }
    }
    
    updateConnectionStatus() {
        const statusText = document.getElementById('drive-status-text');
        const statusDot = document.getElementById('drive-status-dot');
        const dropdownConnection = document.getElementById('dropdown-connection');
        
        if (this.accessToken && this.user) {
            statusText.textContent = `Drive: ${this.user.email}`;
            statusDot.classList.add('connected');
            if (dropdownConnection) dropdownConnection.textContent = 'Connected';
        } else {
            statusText.textContent = 'Drive: Disconnected';
            statusDot.classList.remove('connected');
            if (dropdownConnection) dropdownConnection.textContent = 'Disconnected';
        }
    }
    
    async startGoogleOAuth() {
        try {
            // Update UI
            this.updateOAuthStep(2);
            
            // Create OAuth URL
            const redirectUri = window.location.origin;
            const state = Math.random().toString(36).substring(2);
            sessionStorage.setItem('oauth_state', state);
            
            const authUrl = VAULT_CONFIG.getOAuthUrl(redirectUri, state);
            
            // Open OAuth popup
            const width = 500;
            const height = 600;
            const left = (window.screen.width - width) / 2;
            const top = (window.screen.height - height) / 2;
            
            this.oauthPopup = window.open(
                authUrl,
                'Google OAuth',
                `width=${width},height=${height},left=${left},top=${top},resizable=yes,scrollbars=yes,status=no`
            );
            
            if (!this.oauthPopup) {
                throw new Error('Popup blocked. Please allow popups for this site.');
            }
            
            // Listen for OAuth callback
            this.setupOAuthListener();
            
        } catch (error) {
            console.error('OAuth error:', error);
            this.showError('Failed to start OAuth. Please try again.');
            this.updateOAuthStep(1);
        }
    }
    
    setupOAuthListener() {
        // Listen for message from popup (if using postMessage)
        window.addEventListener('message', this.handleOAuthMessage.bind(this), false);
        
        // Fallback: check popup URL periodically
        this.oauthCheckInterval = setInterval(() => {
            try {
                if (!this.oauthPopup || this.oauthPopup.closed) {
                    clearInterval(this.oauthCheckInterval);
                    this.updateOAuthStep(1);
                    return;
                }
                
                const popupUrl = this.oauthPopup.location.href;
                
                if (popupUrl.includes(window.location.origin)) {
                    // Popup redirected back to our app
                    clearInterval(this.oauthCheckInterval);
                    this.oauthPopup.close();
                    this.oauthPopup = null;
                    
                    // Parse URL hash
                    const hash = new URL(popupUrl).hash.substring(1);
                    const params = new URLSearchParams(hash);
                    
                    const accessToken = params.get('access_token');
                    const tokenType = params.get('token_type');
                    const expiresIn = params.get('expires_in');
                    const state = params.get('state');
                    
                    // Verify state
                    const savedState = sessionStorage.getItem('oauth_state');
                    if (state !== savedState) {
                        throw new Error('Invalid state parameter');
                    }
                    
                    // Process token
                    this.handleOAuthSuccess(accessToken, tokenType, expiresIn);
                }
            } catch (error) {
                // Cross-origin error, ignore
            }
        }, 100);
    }
    
    handleOAuthMessage(event) {
        if (event.origin !== window.location.origin) return;
        
        if (event.data.type === 'oauth_token') {
            const { access_token, token_type, expires_in, state } = event.data;
            
            // Verify state
            const savedState = sessionStorage.getItem('oauth_state');
            if (state !== savedState) {
                throw new Error('Invalid state parameter');
            }
            
            this.handleOAuthSuccess(access_token, token_type, expires_in);
            
            if (this.oauthPopup) {
                this.oauthPopup.close();
                this.oauthPopup = null;
            }
        }
    }
    
    async handleOAuthSuccess(accessToken, tokenType, expiresIn) {
        try {
            // Store access token
            this.accessToken = accessToken;
            
            // Get user info and storage info
            const [userInfo, storageInfo] = await Promise.all([
                this.getUserInfo(),
                this.getRealStorageInfo()
            ]);
            
            this.user = userInfo;
            this.storageInfo = storageInfo;
            
            // Save session
            this.saveSession();
            
            // Update UI
            this.updateOAuthStep(3);
            this.updateConnectionStatus();
            this.updateUserUI();
            
            // Update storage display
            this.updateRealStorageUI();
            
            // Start sync
            await this.startInitialSync();
            
            // Show success message
            this.showSuccess('Google Drive connected successfully!');
            
            // Close modal after delay
            setTimeout(() => {
                this.hideDriveModal();
                this.startApp();
            }, 2000);
            
        } catch (error) {
            console.error('OAuth success error:', error);
            this.showError('Failed to complete OAuth. Please try again.');
            this.updateOAuthStep(1);
        }
    }
    
    async getUserInfo() {
        try {
            const response = await fetch(VAULT_CONFIG.api.oauth.userinfo, {
                headers: {
                    'Authorization': `Bearer ${this.accessToken}`
                }
            });
            
            if (!response.ok) {
                throw new Error('Failed to get user info');
            }
            
            const userData = await response.json();
            
            return {
                id: userData.sub,
                name: userData.name,
                email: userData.email,
                picture: userData.picture,
                locale: userData.locale,
                verified: userData.email_verified,
                storageQuota: null // Will be filled by storage info
            };
            
        } catch (error) {
            console.error('Get user info error:', error);
            throw error;
        }
    }
    
    async getRealStorageInfo() {
        try {
            const response = await fetch(`${VAULT_CONFIG.api.drive.about}?fields=storageQuota,user`, {
                headers: {
                    'Authorization': `Bearer ${this.accessToken}`
                }
            });
            
            if (!response.ok) {
                throw new Error('Failed to get storage info');
            }
            
            const data = await response.json();
            
            // Parse real Google Drive storage
            const total = parseInt(data.storageQuota.limit) || 0;
            const used = parseInt(data.storageQuota.usage) || 0;
            const usedInDrive = parseInt(data.storageQuota.usageInDrive) || 0;
            const usedInTrash = parseInt(data.storageQuota.usageInTrash) || 0;
            
            return {
                total: total,
                used: used,
                usedInDrive: usedInDrive,
                usedInTrash: usedInTrash,
                free: total > 0 ? total - used : 0,
                percentage: total > 0 ? (used / total) * 100 : 0,
                isUnlimited: total === 0 || total >= 1e15, // Google Drive Unlimited
                lastUpdated: Date.now()
            };
            
        } catch (error) {
            console.error('Get real storage info error:', error);
            // Return default values if API fails
            return {
                total: 15 * 1024 * 1024 * 1024, // 15GB fallback
                used: 0,
                usedInDrive: 0,
                usedInTrash: 0,
                free: 15 * 1024 * 1024 * 1024,
                percentage: 0,
                isUnlimited: false,
                lastUpdated: Date.now()
            };
        }
    }
    
    updateRealStorageUI() {
        if (!this.storageInfo) return;
        
        const usedGB = (this.storageInfo.used / (1024 * 1024 * 1024)).toFixed(2);
        const totalGB = this.storageInfo.total > 0 
            ? (this.storageInfo.total / (1024 * 1024 * 1024)).toFixed(2)
            : 'Unlimited';
        
        const percent = this.storageInfo.percentage;
        
        // Update sidebar storage
        const storageText = document.getElementById('sidebar-storage-text');
        if (storageText) {
            storageText.textContent = totalGB === 'Unlimited' 
                ? `${usedGB}GB used (Unlimited)`
                : `${usedGB}GB of ${totalGB}GB used`;
        }
        
        // Update storage progress bar
        const storageFill = document.getElementById('sidebar-storage-fill');
        if (storageFill) {
            if (totalGB === 'Unlimited') {
                storageFill.style.width = '10%'; // Show minimal for unlimited
                storageFill.style.backgroundColor = '#00ff9d';
            } else {
                storageFill.style.width = `${percent}%`;
                
                // Color coding based on usage
                if (percent > 90) {
                    storageFill.style.backgroundColor = '#ff4757';
                } else if (percent > 75) {
                    storageFill.style.backgroundColor = '#ffa502';
                } else if (percent > 50) {
                    storageFill.style.backgroundColor = '#ffdd59';
                } else {
                    storageFill.style.backgroundColor = 'var(--primary)';
                }
            }
        }
        
        // Update storage in settings
        const driveStatus = document.getElementById('drive-connection-status-text');
        if (driveStatus && this.user) {
            driveStatus.textContent = `Connected as ${this.user.email} (${usedGB}GB used)`;
        }
    }
    
    updateOAuthStep(step) {
        // Update step indicators
        document.querySelectorAll('.connection-steps .step').forEach((stepEl, index) => {
            const stepNumber = parseInt(stepEl.dataset.step);
            
            if (stepNumber <= step) {
                stepEl.classList.add('active');
            } else {
                stepEl.classList.remove('active');
            }
        });
        
        // Update progress bar
        const progressFill = document.querySelector('.progress-fill');
        if (progressFill) {
            const progress = (step / 3) * 100;
            progressFill.style.width = `${progress}%`;
            
            const progressText = document.querySelector('.progress-text');
            if (progressText) {
                const texts = ['Preparing...', 'Authorizing...', 'Syncing...', 'Complete'];
                progressText.textContent = texts[step - 1] || 'Complete';
            }
        }
    }
    
    async startInitialSync() {
        try {
            // Update sync progress
            this.updateSyncProgress(0, 'Checking storage...');
            
            // Get fresh storage info
            this.storageInfo = await this.getRealStorageInfo();
            this.updateRealStorageUI();
            
            // Update sync progress
            this.updateSyncProgress(30, 'Loading files...');
            
            // Cache user info
            localStorage.setItem(VAULT_CONFIG.storage.userProfile, JSON.stringify(this.user));
            localStorage.setItem(VAULT_CONFIG.storage.storageCache, JSON.stringify({
                ...this.storageInfo,
                timestamp: Date.now()
            }));
            
            // Update sync progress
            this.updateSyncProgress(70, 'Setting up sync...');
            
            // Initialize Drive module
            if (window.Drive) {
                await Drive.loadFiles();
            }
            
            // Update sync progress
            this.updateSyncProgress(100, 'Sync complete');
            
            // Update last sync time
            localStorage.setItem(VAULT_CONFIG.storage.lastSync, Date.now().toString());
            
            return true;
            
        } catch (error) {
            console.error('Initial sync error:', error);
            this.showError('Sync failed. Please try again.');
            return false;
        }
    }
    
    updateSyncProgress(percent, message) {
        const progressFill = document.querySelector('.progress-fill');
        const progressText = document.querySelector('.progress-text');
        
        if (progressFill) progressFill.style.width = `${percent}%`;
        if (progressText) progressText.textContent = message;
        
        // Update status indicators
        if (percent >= 100) {
            document.getElementById('sync-status').textContent = 'Complete';
            document.getElementById('dropdown-last-sync').textContent = 'Just now';
            document.getElementById('sync-text').textContent = 'Synced';
            document.getElementById('sync-time').textContent = 'Just now';
        }
    }
    
    saveSession() {
        try {
            const session = {
                accessToken: this.accessToken,
                user: this.user,
                storageInfo: this.storageInfo,
                timestamp: Date.now(),
                expiresAt: Date.now() + VAULT_CONFIG.app.sessionTimeout
            };
            
            localStorage.setItem(VAULT_CONFIG.storage.userSession, JSON.stringify(session));
            localStorage.setItem(VAULT_CONFIG.storage.accessToken, this.accessToken);
            
            // Start session timer
            this.startSessionTimer();
            
        } catch (error) {
            console.error('Save session error:', error);
        }
    }
    
    loadSession() {
        try {
            const sessionJson = localStorage.getItem(VAULT_CONFIG.storage.userSession);
            
            if (sessionJson) {
                const session = JSON.parse(sessionJson);
                
                // Check if session is expired
                if (session.expiresAt > Date.now()) {
                    this.accessToken = session.accessToken;
                    this.user = session.user;
                    this.storageInfo = session.storageInfo;
                    this.isAuthenticated = true;
                    
                    // Start session timer
                    this.startSessionTimer();
                    
                    console.log('Session loaded:', this.user?.name);
                    return true;
                } else {
                    // Session expired, clear it
                    this.clearSession();
                }
            }
            
        } catch (error) {
            console.error('Load session error:', error);
        }
        
        return false;
    }
    
    startSessionTimer() {
        // Clear existing timer
        if (this.sessionTimer) {
            clearTimeout(this.sessionTimer);
        }
        
        // Set new timer for session expiry
        const timeLeft = VAULT_CONFIG.app.sessionTimeout;
        this.sessionTimer = setTimeout(() => {
            this.sessionExpired();
        }, timeLeft);
    }
    
    sessionExpired() {
        this.showToast('Your session has expired. Please login again.', 'warning');
        this.logout();
    }
    
    clearSession() {
        this.accessToken = null;
        this.user = null;
        this.storageInfo = null;
        this.isAuthenticated = false;
        
        localStorage.removeItem(VAULT_CONFIG.storage.userSession);
        localStorage.removeItem(VAULT_CONFIG.storage.accessToken);
        sessionStorage.removeItem('oauth_state');
        
        if (this.sessionTimer) {
            clearTimeout(this.sessionTimer);
            this.sessionTimer = null;
        }
        
        if (this.oauthCheckInterval) {
            clearInterval(this.oauthCheckInterval);
            this.oauthCheckInterval = null;
        }
    }
    
    retryConnection() {
        this.clearPinBuffer();
        this.hidePinError();
        this.showDriveModal();
    }
    
    cancelConnection() {
        this.hideDriveModal();
        document.getElementById('pin-screen').classList.remove('hidden');
    }
    
    hideDriveModal() {
        const modal = document.getElementById('drive-connect-modal');
        if (modal) {
            modal.classList.add('hidden');
        }
    }
    
    startApp() {
        document.getElementById('app-interface').classList.remove('hidden');
        
        // Update UI
        this.updateUserUI();
        this.updateConnectionStatus();
        
        // Start file loading
        if (window.Drive) {
            Drive.loadFiles();
        }
        
        // Start auto-sync if enabled
        if (VAULT_CONFIG.app.autoSync && window.Drive) {
            Drive.startAutoSync();
        }
    }
    
    updateUserUI() {
        if (this.user) {
            // Update avatar
            const avatar = document.getElementById('user-avatar');
            if (avatar) {
                if (this.user.picture) {
                    avatar.src = this.user.picture;
                    avatar.onerror = () => {
                        avatar.src = this.generateAvatar(this.user.name);
                    };
                } else {
                    avatar.src = this.generateAvatar(this.user.name);
                }
                avatar.alt = this.user.name;
            }
        }
    }
    
    generateAvatar(name) {
        const colors = ['#00f3ff', '#7000ff', '#ff0055', '#00ff9d', '#ffdd59'];
        const color = colors[name.length % colors.length];
        const initials = name.split(' ').map(n => n[0]).join('').toUpperCase().substring(0, 2);
        
        return `data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><circle cx="50" cy="50" r="45" fill="${color}"/><text x="50" y="60" text-anchor="middle" font-size="40" fill="white" font-family="Arial, sans-serif">${initials}</text></svg>`;
    }
    
    toggleProfileDropdown() {
        const dropdown = document.getElementById('profile-dropdown');
        if (dropdown) {
            dropdown.classList.toggle('hidden');
        }
    }
    
    hideProfileDropdown() {
        const dropdown = document.getElementById('profile-dropdown');
        if (dropdown) {
            dropdown.classList.add('hidden');
        }
    }
    
    showUserProfile() {
        if (this.user) {
            alert(`User Profile:\n\nName: ${this.user.name}\nEmail: ${this.user.email}\nStorage: ${this.storageInfo ? ((this.storageInfo.used/(1024*1024*1024)).toFixed(2)) : '0'}GB used`);
        }
        this.hideProfileDropdown();
    }
    
    showAccountSettings() {
        document.getElementById('settings-modal').classList.remove('hidden');
        this.hideProfileDropdown();
    }
    
    async logout() {
        if (confirm('Are you sure you want to logout?')) {
            try {
                // Revoke Google token if available
                if (this.accessToken) {
                    await this.revokeToken();
                }
                
                // Clear session
                this.clearSession();
                
                // Clear PIN buffer
                this.clearPinBuffer();
                
                // Stop any sync intervals
                if (window.Drive) {
                    Drive.stopAutoSync();
                }
                
                // Hide app interface
                document.getElementById('app-interface').classList.add('hidden');
                
                // Close all modals
                document.querySelectorAll('.modal').forEach(modal => {
                    modal.classList.add('hidden');
                });
                
                // Show PIN screen
                document.getElementById('pin-screen').classList.remove('hidden');
                
                // Show success message
                this.showToast('Logged out successfully.', 'success');
                
            } catch (error) {
                console.error('Logout error:', error);
                this.showToast('Logout failed. Please try again.', 'error');
            }
        }
    }
    
    async revokeToken() {
        try {
            await fetch(VAULT_CONFIG.api.oauth.revoke, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded'
                },
                body: `token=${this.accessToken}`
            });
        } catch (error) {
            console.error('Revoke token error:', error);
        }
    }
    
    async changePin(oldPin, newPin, confirmPin) {
        try {
            const savedPin = localStorage.getItem(VAULT_CONFIG.storage.pinHash) || VAULT_CONFIG.app.defaultPin;
            
            if (oldPin !== savedPin) {
                throw new Error('Current PIN is incorrect');
            }
            
            if (newPin.length !== VAULT_CONFIG.app.pinLength) {
                throw new Error(`PIN must be ${VAULT_CONFIG.app.pinLength} digits`);
            }
            
            if (!/^\d+$/.test(newPin)) {
                throw new Error('PIN must contain only numbers');
            }
            
            if (newPin !== confirmPin) {
                throw new Error('PINs do not match');
            }
            
            // Save new PIN
            localStorage.setItem(VAULT_CONFIG.storage.pinHash, newPin);
            
            return true;
            
        } catch (error) {
            console.error('Change PIN error:', error);
            throw error;
        }
    }
    
    showToast(message, type = 'info') {
        const toast = document.createElement('div');
        toast.className = `toast ${type}`;
        toast.innerHTML = `
            <i class="fas fa-${type === 'success' ? 'check-circle' : type === 'error' ? 'exclamation-circle' : 'info-circle'}"></i>
            <span>${message}</span>
            <button class="toast-close"><i class="fas fa-times"></i></button>
        `;
        
        const container = document.getElementById('toast-container');
        if (container) {
            container.appendChild(toast);
            
            // Auto remove after 5 seconds
            setTimeout(() => {
                if (toast.parentNode) {
                    toast.style.opacity = '0';
                    setTimeout(() => toast.remove(), 300);
                }
            }, 5000);
            
            // Close button
            toast.querySelector('.toast-close').addEventListener('click', () => {
                toast.style.opacity = '0';
                setTimeout(() => toast.remove(), 300);
            });
        }
    }
    
    showError(message) {
        this.showToast(message, 'error');
    }
    
    showSuccess(message) {
        this.showToast(message, 'success');
    }
    
    // Public methods
    getAccessToken() {
        return this.accessToken;
    }
    
    getUser() {
        return this.user;
    }
    
    getStorageInfo() {
        return this.storageInfo;
    }
    
    isLoggedIn() {
        return this.isAuthenticated && this.accessToken !== null;
    }
    
    hasDriveAccess() {
        return this.isLoggedIn() && this.accessToken !== null;
    }
    
    refreshStorageInfo() {
        if (this.accessToken) {
            return this.getRealStorageInfo().then(info => {
                this.storageInfo = info;
                this.updateRealStorageUI();
                return info;
            });
        }
        return Promise.resolve(null);
    }
}

// Create global Auth instance
window.Auth = new AuthManager();

