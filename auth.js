/* =========================================
   VAULT OS - AUTHENTICATION MODULE
   Complete PIN Security + Google OAuth System
   Version: 3.0.0
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
        this.oauthCheckInterval = null;
        
        // Admin PIN (can be changed in settings)
        this.adminPin = '0000'; // Default admin PIN
        
        // Initialize
        this.init();
    }
    
    init() {
        VAULT_CONFIG.log('Auth module initializing...', null, 'info');
        
        // Load saved session
        this.loadSession();
        
        // Load admin PIN from storage
        this.loadAdminPin();
        
        // Setup event listeners
        this.setupEventListeners();
        
        // Check if already authenticated
        if (this.isLoggedIn()) {
            this.startApp();
        }
        
        VAULT_CONFIG.log('Auth module initialized', null, 'success');
    }
    
    setupEventListeners() {
        // PIN pad buttons
        document.querySelectorAll('.num-btn[data-num]').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const num = e.target.dataset.num || e.target.closest('[data-num]').dataset.num;
                if (num) this.addToPinBuffer(num);
            });
        });
        
        // Clear button
        const clearBtn = document.querySelector('.btn-clear');
        if (clearBtn) {
            clearBtn.addEventListener('click', () => this.clearPinBuffer());
        }
        
        // Submit button
        const submitBtn = document.querySelector('.btn-submit');
        if (submitBtn) {
            submitBtn.addEventListener('click', () => this.validatePin());
        }
        
        // Keyboard support for PIN
        document.addEventListener('keydown', (e) => {
            const pinScreen = document.getElementById('pin-screen');
            if (!pinScreen || pinScreen.classList.contains('hidden')) return;
            
            if (e.key >= '0' && e.key <= '9') {
                this.addToPinBuffer(e.key);
            } else if (e.key === 'Backspace' || e.key === 'Delete') {
                this.removeFromPinBuffer();
            } else if (e.key === 'Enter' || e.key === ' ') {
                this.validatePin();
            } else if (e.key === 'Escape') {
                this.clearPinBuffer();
            }
        });
        
        // Google Drive connection
        const authDriveBtn = document.getElementById('authorize-drive');
        if (authDriveBtn) {
            authDriveBtn.addEventListener('click', () => this.startGoogleOAuth());
        }
        
        // Retry connection
        const retryBtn = document.getElementById('retry-connection');
        if (retryBtn) {
            retryBtn.addEventListener('click', () => this.retryConnection());
        }
        
        // Cancel connection
        const cancelBtn = document.getElementById('cancel-connection');
        if (cancelBtn) {
            cancelBtn.addEventListener('click', () => this.cancelConnection());
        }
        
        // Logout button
        const logoutBtn = document.getElementById('logout-btn');
        if (logoutBtn) {
            logoutBtn.addEventListener('click', () => this.logout());
        }
        
        // Close drive modal
        const closeDriveBtn = document.getElementById('close-drive-modal');
        if (closeDriveBtn) {
            closeDriveBtn.addEventListener('click', () => {
                document.getElementById('drive-connect-modal')?.classList.add('hidden');
            });
        }
        
        // Profile dropdown
        const userProfile = document.getElementById('user-profile');
        if (userProfile) {
            userProfile.addEventListener('click', (e) => {
                e.stopPropagation();
                this.toggleProfileDropdown();
            });
        }
        
        // Close dropdown when clicking outside
        document.addEventListener('click', () => {
            this.hideProfileDropdown();
        });
        
        // View profile
        const viewProfile = document.getElementById('view-profile');
        if (viewProfile) {
            viewProfile.addEventListener('click', () => this.showUserProfile());
        }
        
        // Account settings
        const accountSettings = document.getElementById('account-settings');
        if (accountSettings) {
            accountSettings.addEventListener('click', () => this.showAccountSettings());
        }
        
        // Connect drive from empty state
        const connectEmptyBtn = document.getElementById('connect-empty-drive');
        if (connectEmptyBtn) {
            connectEmptyBtn.addEventListener('click', () => this.showDriveModal());
        }
        
        // Change PIN from settings
        const changePinBtn = document.getElementById('change-pin-btn');
        if (changePinBtn) {
            changePinBtn.addEventListener('click', () => this.showPinChangeModal());
        }
        
        // Save PIN change
        const savePinBtn = document.getElementById('save-pin-change');
        if (savePinBtn) {
            savePinBtn.addEventListener('click', () => this.processPinChange());
        }
        
        // Cancel PIN change
        const cancelPinBtn = document.getElementById('cancel-pin-change');
        if (cancelPinBtn) {
            cancelPinBtn.addEventListener('click', () => this.hidePinChangeModal());
        }
        
        // PIN change modal keyboard
        document.addEventListener('keydown', (e) => {
            const pinModal = document.getElementById('pin-change-modal');
            if (!pinModal || pinModal.classList.contains('hidden')) return;
            
            if (e.key === 'Escape') {
                this.hidePinChangeModal();
            }
        });
        
        VAULT_CONFIG.log('Auth event listeners setup complete', null, 'debug');
    }
    
    // ==================== PIN MANAGEMENT ====================
    
    addToPinBuffer(num) {
        if (this.pinBuffer.length < VAULT_CONFIG.app.pinLength) {
            this.pinBuffer += num;
            this.updatePinDisplay();
            
            // Auto-submit when PIN length reached
            if (this.pinBuffer.length === VAULT_CONFIG.app.pinLength) {
                setTimeout(() => this.validatePin(), 100);
            }
        }
    }
    
    removeFromPinBuffer() {
        if (this.pinBuffer.length > 0) {
            this.pinBuffer = this.pinBuffer.slice(0, -1);
            this.updatePinDisplay();
        }
    }
    
    clearPinBuffer() {
        this.pinBuffer = '';
        this.updatePinDisplay();
        this.hidePinError();
    }
    
    updatePinDisplay() {
        const pinInput = document.getElementById('pin-input');
        if (pinInput) {
            // Show dots for entered numbers
            const display = '•'.repeat(this.pinBuffer.length);
            pinInput.value = display;
            
            // Add shake animation when full
            if (this.pinBuffer.length === VAULT_CONFIG.app.pinLength) {
                pinInput.style.animation = 'none';
                setTimeout(() => {
                    pinInput.style.animation = 'shake 0.3s ease-in-out';
                }, 10);
            }
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
        if (this.pinBuffer.length !== VAULT_CONFIG.app.pinLength) {
            this.showPinError(`Enter ${VAULT_CONFIG.app.pinLength} digit PIN`);
            return false;
        }
        
        // Get saved PINs
        const savedUserPin = localStorage.getItem(VAULT_CONFIG.storage.pinHash) || VAULT_CONFIG.app.defaultPin;
        const savedAdminPin = localStorage.getItem('vault_admin_pin') || this.adminPin;
        
        VAULT_CONFIG.log('Validating PIN attempt', { 
            entered: this.pinBuffer, 
            savedUserPin: savedUserPin.substring(0, 2) + '**',
            savedAdminPin: savedAdminPin.substring(0, 2) + '**' 
        }, 'debug');
        
        // Check if it's admin PIN
        if (this.pinBuffer === savedAdminPin) {
            VAULT_CONFIG.log('Admin PIN verified', null, 'success');
            this.onAdminLoginSuccess();
            return true;
        }
        
        // Check if it's user PIN
        if (this.pinBuffer === savedUserPin) {
            this.hidePinError();
            this.loginAttempts = 0;
            this.onUserLoginSuccess();
            return true;
        }
        
        // Wrong PIN
        this.loginAttempts++;
        VAULT_CONFIG.log(`Wrong PIN attempt ${this.loginAttempts}`, null, 'warn');
        
        if (this.loginAttempts >= VAULT_CONFIG.app.maxLoginAttempts) {
            this.showPinError('Too many attempts. Please wait 5 minutes.');
            this.disablePinPad();
            
            setTimeout(() => {
                this.enablePinPad();
                this.loginAttempts = 0;
                this.clearPinBuffer();
                this.showPinError('You can try again now.');
            }, 5 * 60 * 1000);
        } else {
            const remaining = VAULT_CONFIG.app.maxLoginAttempts - this.loginAttempts;
            this.showPinError(`Wrong PIN. ${remaining} attempts remaining.`);
            
            // Clear buffer after wrong attempt
            this.pinBuffer = '';
            this.updatePinDisplay();
            
            // Shake animation
            const pinInput = document.getElementById('pin-input');
            if (pinInput) {
                pinInput.style.animation = 'none';
                setTimeout(() => {
                    pinInput.style.animation = 'shake 0.5s ease-in-out';
                }, 10);
            }
        }
        return false;
    }
    
    disablePinPad() {
        document.querySelectorAll('.num-btn').forEach(btn => {
            btn.disabled = true;
            btn.classList.add('disabled');
        });
    }
    
    enablePinPad() {
        document.querySelectorAll('.num-btn').forEach(btn => {
            btn.disabled = false;
            btn.classList.remove('disabled');
        });
    }
    
    onUserLoginSuccess() {
        VAULT_CONFIG.log('User PIN verified successfully', null, 'success');
        
        // Hide PIN screen
        const pinScreen = document.getElementById('pin-screen');
        if (pinScreen) pinScreen.classList.add('hidden');
        
        // Check if we have an existing session
        if (this.isLoggedIn() && this.accessToken) {
            this.startApp();
            this.showToast('Welcome back!', 'success');
        } else {
            // Show Google Drive connection modal
            this.showDriveModal();
        }
    }
    
    onAdminLoginSuccess() {
        VAULT_CONFIG.log('Admin PIN verified successfully', null, 'success');
        
        // Hide PIN screen
        document.getElementById('pin-screen')?.classList.add('hidden');
        
        // Show admin interface or redirect to admin app
        this.showAdminInterface();
    }
    
    showAdminInterface() {
        // For now, just show a message and redirect to normal app
        this.showToast('Admin access granted', 'success');
        
        // You can redirect to admin.html or show admin controls
        setTimeout(() => {
            if (this.isLoggedIn() && this.accessToken) {
                this.startApp();
            } else {
                this.showDriveModal();
            }
        }, 1000);
    }
    
    loadAdminPin() {
        try {
            const savedAdminPin = localStorage.getItem('vault_admin_pin');
            if (savedAdminPin) {
                this.adminPin = savedAdminPin;
            }
        } catch (error) {
            VAULT_CONFIG.error('Failed to load admin PIN:', error);
        }
    }
    
    // ==================== PIN CHANGE FUNCTIONALITY ====================
    
    showPinChangeModal() {
        const modal = document.getElementById('pin-change-modal');
        if (modal) {
            modal.classList.remove('hidden');
            
            // Clear inputs
            document.getElementById('current-pin-input').value = '';
            document.getElementById('new-pin-input').value = '';
            document.getElementById('confirm-pin-input').value = '';
            
            // Hide error
            document.getElementById('pin-change-error')?.classList.add('hidden');
            
            // Focus on current PIN
            setTimeout(() => {
                document.getElementById('current-pin-input')?.focus();
            }, 100);
        }
    }
    
    hidePinChangeModal() {
        document.getElementById('pin-change-modal')?.classList.add('hidden');
    }
    
    processPinChange() {
        const currentPin = document.getElementById('current-pin-input').value;
        const newPin = document.getElementById('new-pin-input').value;
        const confirmPin = document.getElementById('confirm-pin-input').value;
        const errorElement = document.getElementById('pin-change-error');
        
        // Validate inputs
        if (!currentPin || !newPin || !confirmPin) {
            this.showPinChangeError('Please fill in all fields');
            return;
        }
        
        if (newPin.length !== VAULT_CONFIG.app.pinLength) {
            this.showPinChangeError(`PIN must be ${VAULT_CONFIG.app.pinLength} digits`);
            return;
        }
        
        if (!/^\d+$/.test(newPin)) {
            this.showPinChangeError('PIN must contain only numbers');
            return;
        }
        
        if (newPin !== confirmPin) {
            this.showPinChangeError('New PINs do not match');
            return;
        }
        
        // Verify current PIN
        const savedPin = localStorage.getItem(VAULT_CONFIG.storage.pinHash) || VAULT_CONFIG.app.defaultPin;
        if (currentPin !== savedPin) {
            this.showPinChangeError('Current PIN is incorrect');
            return;
        }
        
        // Save new PIN
        try {
            localStorage.setItem(VAULT_CONFIG.storage.pinHash, newPin);
            
            // Clear inputs
            document.getElementById('current-pin-input').value = '';
            document.getElementById('new-pin-input').value = '';
            document.getElementById('confirm-pin-input').value = '';
            
            // Hide modal
            this.hidePinChangeModal();
            
            // Show success
            this.showToast('PIN changed successfully', 'success');
            
            VAULT_CONFIG.log('PIN changed successfully', null, 'success');
            
        } catch (error) {
            VAULT_CONFIG.error('Failed to save PIN:', error);
            this.showPinChangeError('Failed to save PIN. Please try again.');
        }
    }
    
    showPinChangeError(message) {
        const errorElement = document.getElementById('pin-change-error');
        if (errorElement) {
            errorElement.textContent = message;
            errorElement.classList.remove('hidden');
        }
    }
    
    // ==================== GOOGLE OAUTH ====================
    
    async startGoogleOAuth() {
        try {
            VAULT_CONFIG.log('Starting Google OAuth...', null, 'info');
            
            // Update UI
            this.updateOAuthStep(2);
            
            // Get OAuth URL
            const authUrl = VAULT_CONFIG.getOAuthUrl();
            
            VAULT_CONFIG.log('OAuth URL generated', authUrl.substring(0, 100) + '...', 'debug');
            
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
            VAULT_CONFIG.error('OAuth start error:', error);
            this.showToast('Failed to start OAuth. Please try again.', 'error');
            this.updateOAuthStep(1);
        }
    }
    
    setupOAuthListener() {
        // Clear any existing interval
        if (this.oauthCheckInterval) {
            clearInterval(this.oauthCheckInterval);
        }
        
        // Check for token in URL hash
        this.checkUrlForToken();
        
        // Also check popup periodically
        this.oauthCheckInterval = setInterval(() => {
            try {
                if (!this.oauthPopup || this.oauthPopup.closed) {
                    clearInterval(this.oauthCheckInterval);
                    this.updateOAuthStep(1);
                    return;
                }
                
                // Try to detect if popup has redirected
                const popupUrl = this.oauthPopup.location.href;
                if (popupUrl.includes('access_token') || popupUrl.includes('error')) {
                    clearInterval(this.oauthCheckInterval);
                    this.oauthPopup.close();
                    this.oauthPopup = null;
                    
                    // Extract token from URL
                    this.extractTokenFromUrl(popupUrl);
                }
            } catch (error) {
                // Cross-origin error, ignore
            }
        }, 500);
    }
    
    checkUrlForToken() {
        const hash = window.location.hash.substring(1);
        if (hash.includes('access_token')) {
            this.extractTokenFromHash(hash);
            // Clean URL
            window.history.replaceState(null, null, window.location.pathname);
        }
    }
    
    extractTokenFromHash(hash) {
        try {
            const params = new URLSearchParams(hash);
            const accessToken = params.get('access_token');
            const tokenType = params.get('token_type');
            const expiresIn = params.get('expires_in');
            const error = params.get('error');
            
            if (error) {
                throw new Error(`OAuth error: ${error}`);
            }
            
            if (accessToken) {
                this.handleOAuthSuccess(accessToken, tokenType, expiresIn);
            }
        } catch (error) {
            VAULT_CONFIG.error('Token extraction error:', error);
            this.showToast('Authentication failed. Please try again.', 'error');
            this.updateOAuthStep(1);
        }
    }
    
    extractTokenFromUrl(url) {
        try {
            const hashMatch = url.match(/#(.*)/);
            if (hashMatch) {
                this.extractTokenFromHash(hashMatch[1]);
            }
        } catch (error) {
            VAULT_CONFIG.error('URL token extraction error:', error);
        }
    }
    
    async handleOAuthSuccess(accessToken, tokenType, expiresIn) {
        try {
            VAULT_CONFIG.log('OAuth successful, processing token...', null, 'info');
            
            // Store access token
            this.accessToken = accessToken;
            
            // Get user info
            this.user = await this.getUserInfo();
            VAULT_CONFIG.log('User info retrieved:', this.user.email, 'success');
            
            // Get storage info
            this.storageInfo = await this.getRealStorageInfo();
            
            // Save session
            this.saveSession();
            
            // Update UI
            this.updateOAuthStep(3);
            this.updateConnectionStatus();
            this.updateUserUI();
            
            // Update storage display
            this.updateRealStorageUI();
            
            // Start initial sync
            await this.startInitialSync();
            
            // Show success
            this.showToast('Google Drive connected successfully!', 'success');
            
            // Close modal and start app
            setTimeout(() => {
                this.hideDriveModal();
                this.startApp();
            }, 1500);
            
        } catch (error) {
            VAULT_CONFIG.error('OAuth success processing error:', error);
            this.showToast('Failed to complete setup. Please try again.', 'error');
            this.updateOAuthStep(1);
        }
    }
    
    async getUserInfo() {
        try {
            const response = await fetch(VAULT_CONFIG.api.oauth.userinfo, {
                headers: {
                    'Authorization': `Bearer ${this.accessToken}`,
                    'Accept': 'application/json'
                }
            });
            
            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: ${await response.text()}`);
            }
            
            const userData = await response.json();
            
            return {
                id: userData.sub,
                name: userData.name,
                email: userData.email,
                picture: userData.picture,
                locale: userData.locale,
                verified: userData.email_verified
            };
            
        } catch (error) {
            VAULT_CONFIG.error('Get user info error:', error);
            throw error;
        }
    }
    
    async getRealStorageInfo() {
        try {
            const response = await fetch(`${VAULT_CONFIG.api.drive.about}?fields=storageQuota`, {
                headers: {
                    'Authorization': `Bearer ${this.accessToken}`,
                    'Accept': 'application/json'
                }
            });
            
            if (!response.ok) {
                // Return default values if API fails
                return this.getDefaultStorageInfo();
            }
            
            const data = await response.json();
            
            const total = parseInt(data.storageQuota.limit) || 0;
            const used = parseInt(data.storageQuota.usage) || 0;
            
            return {
                total: total,
                used: used,
                free: total > 0 ? total - used : 0,
                percentage: total > 0 ? (used / total) * 100 : 0,
                isUnlimited: total === 0,
                lastUpdated: Date.now()
            };
            
        } catch (error) {
            VAULT_CONFIG.error('Get storage info error:', error);
            return this.getDefaultStorageInfo();
        }
    }
    
    getDefaultStorageInfo() {
        return {
            total: 15 * 1024 * 1024 * 1024,
            used: 0,
            free: 15 * 1024 * 1024 * 1024,
            percentage: 0,
            isUnlimited: false,
            lastUpdated: Date.now()
        };
    }
    
    async startInitialSync() {
        try {
            // Update sync progress
            this.updateSyncProgress(0, 'Checking storage...');
            
            // Cache storage info
            localStorage.setItem(VAULT_CONFIG.storage.storageCache, JSON.stringify({
                ...this.storageInfo,
                timestamp: Date.now()
            }));
            
            // Update sync progress
            this.updateSyncProgress(50, 'Setting up sync...');
            
            // Initialize Drive module if available
            if (window.Drive) {
                await Drive.loadFiles();
            }
            
            // Update sync progress
            this.updateSyncProgress(100, 'Sync complete');
            
            // Update last sync time
            localStorage.setItem(VAULT_CONFIG.storage.lastSync, Date.now().toString());
            
            return true;
            
        } catch (error) {
            VAULT_CONFIG.error('Initial sync error:', error);
            this.showToast('Sync failed. Please try again.', 'error');
            return false;
        }
    }
    
    // ==================== UI UPDATES ====================
    
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
    
    updateSyncProgress(percent, message) {
        const progressFill = document.querySelector('.progress-fill');
        const progressText = document.querySelector('.progress-text');
        
        if (progressFill) progressFill.style.width = `${percent}%`;
        if (progressText) progressText.textContent = message;
    }
    
    updateConnectionStatus() {
        const statusText = document.getElementById('drive-status-text');
        const statusDot = document.getElementById('drive-status-dot');
        
        if (statusText && statusDot) {
            if (this.accessToken && this.user) {
                statusText.textContent = `Drive: ${this.user.email}`;
                statusDot.classList.add('connected');
            } else {
                statusText.textContent = 'Drive: Disconnected';
                statusDot.classList.remove('connected');
            }
        }
    }
    
    updateRealStorageUI() {
        if (!this.storageInfo) return;
        
        const usedGB = (this.storageInfo.used / (1024 * 1024 * 1024)).toFixed(2);
        const totalGB = this.storageInfo.isUnlimited ? 'Unlimited' : (this.storageInfo.total / (1024 * 1024 * 1024)).toFixed(2);
        const percent = this.storageInfo.percentage;
        
        // Update sidebar storage
        const storageText = document.getElementById('sidebar-storage-text');
        if (storageText) {
            if (this.storageInfo.isUnlimited) {
                storageText.textContent = `${usedGB}GB used (Unlimited)`;
            } else {
                storageText.textContent = `${usedGB}GB of ${totalGB}GB used`;
            }
        }
        
        // Update storage progress bar
        const storageFill = document.getElementById('sidebar-storage-fill');
        if (storageFill) {
            if (this.storageInfo.isUnlimited) {
                storageFill.style.width = '10%';
                storageFill.style.backgroundColor = '#00ff9d';
            } else {
                storageFill.style.width = `${percent}%`;
                
                // Color coding
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
            
            // Update drive status text
            const driveStatus = document.getElementById('drive-connection-status-text');
            if (driveStatus) {
                const usedGB = (this.storageInfo?.used / (1024 * 1024 * 1024)).toFixed(2);
                driveStatus.textContent = `Connected as ${this.user.email} (${usedGB}GB used)`;
            }
        }
    }
    
    generateAvatar(name) {
        const colors = ['#00f3ff', '#7000ff', '#ff0055', '#00ff9d', '#ffdd59'];
        const color = colors[name?.length % colors.length] || '#00f3ff';
        const initials = name ? name.split(' ').map(n => n[0]).join('').toUpperCase().substring(0, 2) : 'VA';
        
        return `data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><circle cx="50" cy="50" r="45" fill="${color}"/><text x="50" y="65" text-anchor="middle" font-size="40" fill="white" font-family="Arial, sans-serif">${initials}</text></svg>`;
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
        document.getElementById('settings-modal')?.classList.remove('hidden');
        this.hideProfileDropdown();
    }
    
    // ==================== SESSION MANAGEMENT ====================
    
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
            
            this.isAuthenticated = true;
            
            VAULT_CONFIG.log('Session saved', { user: this.user.email }, 'success');
            
        } catch (error) {
            VAULT_CONFIG.error('Save session error:', error);
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
                    
                    VAULT_CONFIG.log('Session loaded', { user: this.user?.email }, 'success');
                    return true;
                } else {
                    // Session expired, clear it
                    VAULT_CONFIG.log('Session expired', null, 'warn');
                    this.clearSession();
                }
            }
            
        } catch (error) {
            VAULT_CONFIG.error('Load session error:', error);
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
        VAULT_CONFIG.log('Session expired', null, 'warn');
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
        
        if (this.sessionTimer) {
            clearTimeout(this.sessionTimer);
            this.sessionTimer = null;
        }
        
        if (this.oauthCheckInterval) {
            clearInterval(this.oauthCheckInterval);
            this.oauthCheckInterval = null;
        }
        
        if (this.oauthPopup) {
            this.oauthPopup.close();
            this.oauthPopup = null;
        }
    }
    
    // ==================== APP FLOW ====================
    
    showDriveModal() {
        const modal = document.getElementById('drive-connect-modal');
        if (modal) {
            modal.classList.remove('hidden');
            this.updateConnectionStatus();
        }
    }
    
    hideDriveModal() {
        const modal = document.getElementById('drive-connect-modal');
        if (modal) {
            modal.classList.add('hidden');
        }
    }
    
    retryConnection() {
        this.clearPinBuffer();
        this.hidePinError();
        this.showDriveModal();
    }
    
    cancelConnection() {
        this.hideDriveModal();
        document.getElementById('pin-screen')?.classList.remove('hidden');
    }
    
    startApp() {
        const appInterface = document.getElementById('app-interface');
        if (appInterface) {
            appInterface.classList.remove('hidden');
        }
        
        // Update UI
        this.updateUserUI();
        this.updateConnectionStatus();
        
        // Start file loading
        if (window.Drive) {
            setTimeout(() => {
                Drive.loadFiles();
            }, 500);
        }
        
        // Start auto-sync if enabled
        if (window.Drive && VAULT_CONFIG.app.autoSync) {
            setTimeout(() => {
                Drive.startAutoSync();
            }, 1000);
        }
        
        VAULT_CONFIG.log('App started successfully', { user: this.user?.email }, 'success');
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
                document.getElementById('app-interface')?.classList.add('hidden');
                
                // Close all modals
                document.querySelectorAll('.modal').forEach(modal => {
                    modal.classList.add('hidden');
                });
                
                // Show PIN screen
                document.getElementById('pin-screen')?.classList.remove('hidden');
                
                // Show success message
                this.showToast('Logged out successfully.', 'success');
                
                VAULT_CONFIG.log('User logged out', null, 'info');
                
            } catch (error) {
                VAULT_CONFIG.error('Logout error:', error);
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
            VAULT_CONFIG.error('Revoke token error:', error);
        }
    }
    
    // ==================== PUBLIC METHODS ====================
    
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
    
    // ==================== TOAST NOTIFICATIONS ====================
    
    showToast(message, type = 'info') {
        // Use App's showToast if available
        if (window.App && window.App.showToast) {
            window.App.showToast(message, type);
            return;
        }
        
        // Fallback toast
        const toast = document.createElement('div');
        toast.className = `toast ${type}`;
        toast.innerHTML = `
            <i class="fas fa-${this.getToastIcon(type)}"></i>
            <span>${message}</span>
            <button class="toast-close"><i class="fas fa-times"></i></button>
        `;
        
        const container = document.getElementById('toast-container');
        if (container) {
            container.appendChild(toast);
            
            // Auto remove
            const duration = type === 'success' ? 3000 : 5000;
            setTimeout(() => {
                if (toast.parentNode) {
                    toast.style.opacity = '0';
                    setTimeout(() => toast.remove(), 300);
                }
            }, duration);
            
            // Close button
            toast.querySelector('.toast-close').addEventListener('click', () => {
                toast.style.opacity = '0';
                setTimeout(() => toast.remove(), 300);
            });
        }
    }
    
    getToastIcon(type) {
        switch(type) {
            case 'success': return 'check-circle';
            case 'error': return 'exclamation-circle';
            case 'warning': return 'exclamation-triangle';
            default: return 'info-circle';
        }
    }
}

// Create global Auth instance
window.Auth = new AuthManager();

// Export for module systems
if (typeof module !== 'undefined' && module.exports) {
    module.exports = AuthManager;
}

