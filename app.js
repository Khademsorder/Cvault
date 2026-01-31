/* =========================================
   VAULT OS - MAIN APPLICATION MODULE
   Application Orchestration & Initialization
   ========================================= */

class VaultApp {
    constructor() {
        this.modules = {
            config: null,
            auth: null,
            drive: null,
            media: null,
            ui: null
        };
        
        this.isInitialized = false;
        this.isLoading = false;
        this.appState = {
            isOnline: navigator.onLine,
            isAuthenticated: false,
            hasDriveAccess: false,
            currentFolder: null,
            selectedFiles: [],
            viewMode: 'grid',
            theme: 'cyber'
        };
        
        // Initialize
        this.init();
    }
    
    async init() {
        try {
            this.isLoading = true;
            
            // Show app loading state
            this.showLoadingState();
            
            // Initialize modules in proper order
            await this.initializeModules();
            
            // Setup event listeners
            this.setupEventListeners();
            
            // Check authentication state
            await this.checkAuthState();
            
            // Load initial data
            await this.loadInitialData();
            
            // Update UI
            this.updateAppUI();
            
            // Start background services
            this.startBackgroundServices();
            
            this.isInitialized = true;
            this.isLoading = false;
            
            // Hide loading state
            this.hideLoadingState();
            
            // Show welcome message if first time
            this.showWelcomeMessage();
            
            console.log('✅ Vault OS initialized successfully');
            
        } catch (error) {
            console.error('❌ App initialization error:', error);
            this.showCriticalError('Failed to initialize application');
        }
    }
    
    async initializeModules() {
        try {
            console.log('🔄 Initializing modules...');
            
            // Wait for config to be available
            await this.waitForConfig();
            
            // Initialize Auth module
            if (typeof Auth !== 'undefined') {
                this.modules.auth = Auth;
                console.log('✅ Auth module initialized');
            } else {
                throw new Error('Auth module not found');
            }
            
            // Initialize UI module
            if (typeof UI !== 'undefined') {
                this.modules.ui = UI;
                console.log('✅ UI module initialized');
            } else {
                throw new Error('UI module not found');
            }
            
            // Initialize Drive module (depends on Auth)
            if (typeof Drive !== 'undefined') {
                this.modules.drive = Drive;
                console.log('✅ Drive module initialized');
            } else {
                throw new Error('Drive module not found');
            }
            
            // Initialize Media module
            if (typeof MediaViewer !== 'undefined') {
                this.modules.media = MediaViewer;
                console.log('✅ Media module initialized');
            } else {
                throw new Error('Media module not found');
            }
            
            // Store config reference
            this.modules.config = window.VAULT_CONFIG;
            console.log('✅ Config module loaded');
            
            return true;
            
        } catch (error) {
            console.error('Module initialization error:', error);
            throw error;
        }
    }
    
    waitForConfig() {
        return new Promise((resolve, reject) => {
            let attempts = 0;
            const maxAttempts = 50; // 5 seconds
            
            const checkConfig = () => {
                attempts++;
                
                if (typeof window.VAULT_CONFIG !== 'undefined') {
                    resolve();
                } else if (attempts >= maxAttempts) {
                    reject(new Error('Configuration timeout'));
                } else {
                    setTimeout(checkConfig, 100);
                }
            };
            
            checkConfig();
        });
    }
    
    async checkAuthState() {
        try {
            if (!this.modules.auth) {
                throw new Error('Auth module not available');
            }
            
            const isLoggedIn = this.modules.auth.isLoggedIn();
            const hasDriveAccess = this.modules.auth.hasDriveAccess();
            
            this.appState.isAuthenticated = isLoggedIn;
            this.appState.hasDriveAccess = hasDriveAccess;
            
            // Update UI based on auth state
            if (isLoggedIn) {
                console.log('🔐 User is authenticated');
            } else {
                console.log('🔓 User not authenticated');
            }
            
            return { isLoggedIn, hasDriveAccess };
            
        } catch (error) {
            console.error('Check auth state error:', error);
            this.appState.isAuthenticated = false;
            this.appState.hasDriveAccess = false;
            return { isLoggedIn: false, hasDriveAccess: false };
        }
    }
    
    async loadInitialData() {
        try {
            // If user is authenticated, load their data
            if (this.appState.isAuthenticated && this.modules.drive) {
                console.log('📂 Loading initial files...');
                
                // Load files from Drive
                await this.modules.drive.loadFiles();
                
                // Update storage info
                await this.updateStorageInfo();
                
                // Update file counts
                this.updateFileCounts();
            }
            
            // Load user preferences
            await this.loadUserPreferences();
            
            return true;
            
        } catch (error) {
            console.error('Load initial data error:', error);
            return false;
        }
    }
    
    async updateStorageInfo() {
        try {
            if (this.modules.auth && this.modules.auth.hasDriveAccess()) {
                const storageInfo = await this.modules.auth.refreshStorageInfo();
                
                if (storageInfo) {
                    // Update UI storage display
                    if (this.modules.ui) {
                        this.modules.ui.updateStorageUI();
                    }
                    
                    // Update Drive module storage info
                    if (this.modules.drive) {
                        this.modules.drive.realStorageInfo = storageInfo;
                    }
                    
                    return storageInfo;
                }
            }
        } catch (error) {
            console.error('Update storage info error:', error);
        }
        return null;
    }
    
    updateFileCounts() {
        try {
            if (!this.modules.drive) return;
            
            const files = this.modules.drive.getFiles();
            const counts = {
                total: files.length,
                images: files.filter(f => f.type === 'image').length,
                videos: files.filter(f => f.type === 'video').length,
                audio: files.filter(f => f.type === 'audio').length,
                documents: files.filter(f => f.type === 'document').length,
                folders: files.filter(f => f.isFolder).length
            };
            
            // Update UI if needed
            return counts;
            
        } catch (error) {
            console.error('Update file counts error:', error);
            return null;
        }
    }
    
    async loadUserPreferences() {
        try {
            // Load saved settings
            const settings = this.getSavedSettings();
            
            // Apply theme
            if (settings.theme && this.modules.ui) {
                this.modules.ui.theme = settings.theme;
                this.appState.theme = settings.theme;
                this.modules.ui.applyTheme(settings.theme);
            }
            
            // Apply view mode
            if (settings.defaultView && this.modules.ui) {
                this.appState.viewMode = settings.defaultView;
                this.modules.ui.switchView(settings.defaultView);
            }
            
            return settings;
            
        } catch (error) {
            console.error('Load user preferences error:', error);
            return this.getDefaultSettings();
        }
    }
    
    getSavedSettings() {
        try {
            const settingsJson = localStorage.getItem(VAULT_CONFIG.storage.appSettings);
            
            if (settingsJson) {
                return JSON.parse(settingsJson);
            }
            
        } catch (error) {
            console.error('Get saved settings error:', error);
        }
        
        return this.getDefaultSettings();
    }
    
    getDefaultSettings() {
        return {
            darkMode: true,
            defaultView: 'grid',
            upgradedVideo: true,
            upgradedImage: true,
            upgradedPDF: true,
            upgradedZIP: true,
            autoSync: true,
            mobileSync: false,
            lowPowerSync: false,
            autoLockTime: '15',
            theme: 'cyber'
        };
    }
    
    setupEventListeners() {
        // Online/Offline detection
        window.addEventListener('online', () => {
            this.appState.isOnline = true;
            this.handleOnlineStatusChange(true);
        });
        
        window.addEventListener('offline', () => {
            this.appState.isOnline = false;
            this.handleOnlineStatusChange(false);
        });
        
        // Storage change detection
        window.addEventListener('storage', (e) => {
            this.handleStorageChange(e);
        });
        
        // Before unload
        window.addEventListener('beforeunload', (e) => {
            this.handleBeforeUnload(e);
        });
        
        // Visibility change
        document.addEventListener('visibilitychange', () => {
            this.handleVisibilityChange();
        });
        
        // Keyboard shortcuts
        document.addEventListener('keydown', (e) => {
            this.handleKeyboardShortcuts(e);
        });
        
        // Global click handler
        document.addEventListener('click', (e) => {
            this.handleGlobalClick(e);
        });
        
        // Error handling
        window.addEventListener('error', (e) => {
            this.handleGlobalError(e);
        });
        
        window.addEventListener('unhandledrejection', (e) => {
            this.handlePromiseRejection(e);
        });
    }
    
    handleOnlineStatusChange(isOnline) {
        if (isOnline) {
            console.log('🌐 App is online');
            this.showToast('Back online', 'success');
            
            // Sync data if authenticated
            if (this.appState.isAuthenticated && this.modules.drive) {
                setTimeout(() => {
                    this.modules.drive.syncFiles();
                }, 1000);
            }
        } else {
            console.log('⚠️ App is offline');
            this.showToast('You are offline', 'warning');
        }
    }
    
    handleStorageChange(event) {
        // Handle localStorage changes from other tabs
        if (event.key === VAULT_CONFIG.storage.userSession) {
            // Session changed, check auth
            this.checkAuthState();
        } else if (event.key === VAULT_CONFIG.storage.appSettings) {
            // Settings changed, reload preferences
            this.loadUserPreferences();
        }
    }
    
    handleBeforeUnload(event) {
        // Save current state
        this.saveAppState();
        
        // Stop background services
        this.stopBackgroundServices();
        
        // Show confirmation for unsaved changes if needed
        // event.returnValue = 'You have unsaved changes. Are you sure you want to leave?';
    }
    
    handleVisibilityChange() {
        if (document.hidden) {
            // App is in background
            this.appState.isInBackground = true;
        } else {
            // App is in foreground
            this.appState.isInBackground = false;
            
            // Refresh data if needed
            if (this.appState.isAuthenticated) {
                this.refreshAppData();
            }
        }
    }
    
    handleKeyboardShortcuts(event) {
        // Only process if not in input field
        if (event.target.tagName === 'INPUT' || 
            event.target.tagName === 'TEXTAREA' ||
            event.target.isContentEditable) {
            return;
        }
        
        // Ctrl/Cmd + key combinations
        if (event.ctrlKey || event.metaKey) {
            switch (event.key.toLowerCase()) {
                case 'f':
                    event.preventDefault();
                    this.focusSearch();
                    break;
                    
                case 'n':
                    event.preventDefault();
                    this.createNewFolder();
                    break;
                    
                case 'u':
                    event.preventDefault();
                    this.triggerUpload();
                    break;
                    
                case 'd':
                    event.preventDefault();
                    this.downloadSelected();
                    break;
                    
                case 'a':
                    event.preventDefault();
                    this.selectAllFiles();
                    break;
                    
                case 's':
                    event.preventDefault();
                    this.toggleView();
                    break;
                    
                case ',':
                case ';':
                    event.preventDefault();
                    this.openSettings();
                    break;
                    
                case 'l':
                    event.preventDefault();
                    this.logout();
                    break;
            }
        }
        
        // Function keys
        switch (event.key) {
            case 'F1':
                event.preventDefault();
                this.showHelp();
                break;
                
            case 'F5':
                event.preventDefault();
                this.refreshAppData();
                break;
                
            case 'Escape':
                // Handled by individual modules
                break;
        }
    }
    
    handleGlobalClick(event) {
        // Track analytics or handle global clicks if needed
    }
    
    handleGlobalError(event) {
        console.error('Global error:', event.error);
        
        // Don't show error for known issues
        if (event.error && event.error.message) {
            const ignoredErrors = [
                'ResizeObserver',
                'webkitRequestFullscreen',
                'mozRequestFullScreen',
                'msRequestFullscreen'
            ];
            
            if (ignoredErrors.some(term => event.error.message.includes(term))) {
                return;
            }
        }
        
        // Show user-friendly error
        this.showToast('An error occurred. Please try again.', 'error');
    }
    
    handlePromiseRejection(event) {
        console.error('Unhandled promise rejection:', event.reason);
        this.showToast('An unexpected error occurred.', 'error');
    }
    
    startBackgroundServices() {
        // Start auto-sync if enabled
        if (this.modules.drive && this.appState.isAuthenticated) {
            const settings = this.getSavedSettings();
            if (settings.autoSync) {
                this.modules.drive.startAutoSync();
                console.log('🔄 Auto-sync started');
            }
        }
        
        // Start periodic storage updates
        this.startStorageUpdateInterval();
        
        // Start session monitoring
        this.startSessionMonitor();
    }
    
    stopBackgroundServices() {
        // Stop auto-sync
        if (this.modules.drive) {
            this.modules.drive.stopAutoSync();
        }
        
        // Clear all intervals
        this.clearAllIntervals();
    }
    
    startStorageUpdateInterval() {
        // Update storage info every 5 minutes
        this.storageInterval = setInterval(() => {
            if (this.appState.isAuthenticated) {
                this.updateStorageInfo();
            }
        }, 5 * 60 * 1000);
    }
    
    startSessionMonitor() {
        // Monitor session every minute
        this.sessionInterval = setInterval(() => {
            if (this.appState.isAuthenticated) {
                this.checkSession();
            }
        }, 60 * 1000);
    }
    
    clearAllIntervals() {
        if (this.storageInterval) {
            clearInterval(this.storageInterval);
            this.storageInterval = null;
        }
        
        if (this.sessionInterval) {
            clearInterval(this.sessionInterval);
            this.sessionInterval = null;
        }
    }
    
    async checkSession() {
        try {
            if (!this.modules.auth) return;
            
            const sessionJson = localStorage.getItem(VAULT_CONFIG.storage.userSession);
            if (!sessionJson) return;
            
            const session = JSON.parse(sessionJson);
            
            // Check if session is about to expire (5 minutes warning)
            const timeLeft = session.expiresAt - Date.now();
            const fiveMinutes = 5 * 60 * 1000;
            
            if (timeLeft > 0 && timeLeft < fiveMinutes) {
                // Show session expiry warning
                this.showToast('Your session will expire soon. Please save your work.', 'warning');
            }
            
        } catch (error) {
            console.error('Check session error:', error);
        }
    }
    
    updateAppUI() {
        // Update based on authentication state
        if (this.appState.isAuthenticated) {
            this.showAuthenticatedUI();
        } else {
            this.showUnauthenticatedUI();
        }
        
        // Update online/offline indicator
        this.updateOnlineStatusUI();
        
        // Update storage display
        this.updateStorageDisplay();
    }
    
    showAuthenticatedUI() {
        // Show main app interface
        document.getElementById('app-interface')?.classList.remove('hidden');
        
        // Hide PIN screen
        document.getElementById('pin-screen')?.classList.add('hidden');
        
        // Hide drive connection modal
        document.getElementById('drive-connect-modal')?.classList.add('hidden');
        
        // Update user info
        if (this.modules.auth && this.modules.auth.user) {
            this.updateUserInfoUI();
        }
    }
    
    showUnauthenticatedUI() {
        // Show PIN screen
        document.getElementById('pin-screen')?.classList.remove('hidden');
        
        // Hide main app interface
        document.getElementById('app-interface')?.classList.add('hidden');
    }
    
    updateOnlineStatusUI() {
        const onlineIndicator = document.getElementById('online-status');
        if (!onlineIndicator) return;
        
        if (this.appState.isOnline) {
            onlineIndicator.innerHTML = '<i class="fas fa-wifi"></i> Online';
            onlineIndicator.className = 'online-status online';
        } else {
            onlineIndicator.innerHTML = '<i class="fas fa-wifi-slash"></i> Offline';
            onlineIndicator.className = 'online-status offline';
        }
    }
    
    updateStorageDisplay() {
        if (!this.modules.drive || !this.modules.drive.realStorageInfo) return;
        
        const storageInfo = this.modules.drive.realStorageInfo;
        const usedGB = (storageInfo.used / (1024 * 1024 * 1024)).toFixed(2);
        const totalGB = storageInfo.total > 0 
            ? (storageInfo.total / (1024 * 1024 * 1024)).toFixed(2)
            : 'Unlimited';
        
        // Update storage widget
        const storageWidget = document.querySelector('.storage-widget');
        if (storageWidget) {
            const progressFill = storageWidget.querySelector('.progress-fill');
            const storageText = storageWidget.querySelector('.storage-text');
            
            if (progressFill) {
                if (totalGB === 'Unlimited') {
                    progressFill.style.width = '10%';
                    progressFill.style.backgroundColor = '#00ff9d';
                } else {
                    const percent = storageInfo.percentage || 0;
                    progressFill.style.width = `${percent}%`;
                    
                    // Color coding
                    if (percent > 90) progressFill.style.backgroundColor = '#ff4757';
                    else if (percent > 75) progressFill.style.backgroundColor = '#ffa502';
                    else if (percent > 50) progressFill.style.backgroundColor = '#ffdd59';
                    else progressFill.style.backgroundColor = 'var(--primary)';
                }
            }
            
            if (storageText) {
                if (totalGB === 'Unlimited') {
                    storageText.textContent = `${usedGB}GB used (Unlimited)`;
                } else {
                    storageText.textContent = `${usedGB}GB of ${totalGB}GB used`;
                }
            }
        }
    }
    
    updateUserInfoUI() {
        if (!this.modules.auth || !this.modules.auth.user) return;
        
        const user = this.modules.auth.user;
        
        // Update avatar
        const avatar = document.getElementById('user-avatar');
        if (avatar) {
            avatar.src = user.picture || this.generateDefaultAvatar(user.name);
            avatar.alt = user.name;
        }
        
        // Update email in drive status
        const driveStatusText = document.getElementById('drive-status-text');
        if (driveStatusText) {
            driveStatusText.textContent = `Drive: ${user.email}`;
        }
    }
    
    generateDefaultAvatar(name) {
        const colors = ['#00f3ff', '#7000ff', '#ff0055', '#00ff9d', '#ffdd59'];
        const color = colors[name.length % colors.length];
        const initials = name.split(' ').map(n => n[0]).join('').toUpperCase().substring(0, 2);
        
        return `data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><circle cx="50" cy="50" r="45" fill="${color}"/><text x="50" y="65" text-anchor="middle" font-size="40" fill="white" font-family="Arial">${initials}</text></svg>`;
    }
    
    showLoadingState() {
        // Create or show loading overlay
        let loadingOverlay = document.getElementById('app-loading');
        
        if (!loadingOverlay) {
            loadingOverlay = document.createElement('div');
            loadingOverlay.id = 'app-loading';
            loadingOverlay.className = 'app-loading';
            loadingOverlay.innerHTML = `
                <div class="loading-content">
                    <div class="loading-logo">
                        <i class="fas fa-shield-alt"></i>
                        <div class="logo-text">VAULT</div>
                    </div>
                    <div class="loading-spinner"></div>
                    <p class="loading-text">Initializing Vault OS...</p>
                    <div class="loading-progress">
                        <div class="progress-bar">
                            <div class="progress-fill"></div>
                        </div>
                    </div>
                </div>
            `;
            document.body.appendChild(loadingOverlay);
        } else {
            loadingOverlay.classList.remove('hidden');
        }
    }
    
    hideLoadingState() {
        const loadingOverlay = document.getElementById('app-loading');
        if (loadingOverlay) {
            loadingOverlay.classList.add('hidden');
            setTimeout(() => {
                loadingOverlay.remove();
            }, 500);
        }
    }
    
    showCriticalError(message) {
        const errorOverlay = document.createElement('div');
        errorOverlay.id = 'critical-error';
        errorOverlay.className = 'critical-error';
        errorOverlay.innerHTML = `
            <div class="error-content">
                <div class="error-icon">
                    <i class="fas fa-exclamation-triangle"></i>
                </div>
                <h2>Critical Error</h2>
                <p>${message}</p>
                <div class="error-actions">
                    <button class="btn-primary" id="retry-init">
                        <i class="fas fa-redo"></i> Retry
                    </button>
                    <button class="btn-secondary" id="reset-app">
                        <i class="fas fa-trash"></i> Reset App
                    </button>
                </div>
            </div>
        `;
        
        document.body.innerHTML = '';
        document.body.appendChild(errorOverlay);
        
        // Add event listeners
        document.getElementById('retry-init').addEventListener('click', () => {
            location.reload();
        });
        
        document.getElementById('reset-app').addEventListener('click', () => {
            if (confirm('This will clear all app data. Are you sure?')) {
                localStorage.clear();
                location.reload();
            }
        });
    }
    
    showWelcomeMessage() {
        const hasSeenWelcome = localStorage.getItem('vault_welcome_seen');
        
        if (!hasSeenWelcome) {
            setTimeout(() => {
                this.showToast('Welcome to Vault OS Ultimate!', 'success');
                localStorage.setItem('vault_welcome_seen', 'true');
            }, 1000);
        }
    }
    
    saveAppState() {
        try {
            const state = {
                currentFolder: this.appState.currentFolder,
                selectedFiles: this.appState.selectedFiles,
                viewMode: this.appState.viewMode,
                theme: this.appState.theme,
                timestamp: Date.now()
            };
            
            localStorage.setItem('vault_app_state', JSON.stringify(state));
            
        } catch (error) {
            console.error('Save app state error:', error);
        }
    }
    
    loadAppState() {
        try {
            const stateJson = localStorage.getItem('vault_app_state');
            
            if (stateJson) {
                const state = JSON.parse(stateJson);
                this.appState.currentFolder = state.currentFolder;
                this.appState.selectedFiles = state.selectedFiles;
                this.appState.viewMode = state.viewMode;
                this.appState.theme = state.theme;
                return state;
            }
            
        } catch (error) {
            console.error('Load app state error:', error);
        }
        return null;
    }
    
    // Keyboard Shortcut Implementations
    focusSearch() {
        const searchInput = document.getElementById('search-input');
        if (searchInput) {
            searchInput.focus();
            searchInput.select();
        }
    }
    
    createNewFolder() {
        if (this.modules.drive) {
            this.modules.drive.createFolder();
        }
    }
    
    triggerUpload() {
        document.getElementById('file-input').click();
    }
    
    downloadSelected() {
        if (this.modules.drive) {
            this.modules.drive.downloadSelected();
        }
    }
    
    selectAllFiles() {
        if (this.modules.drive) {
            const files = this.modules.drive.getFiles();
            const selectedFiles = this.modules.drive.selectedFiles;
            
            // If all are selected, clear selection
            if (selectedFiles.size === files.length) {
                this.modules.drive.clearSelection();
            } else {
                // Select all files
                files.forEach(file => {
                    this.modules.drive.selectedFiles.add(file.id);
                });
                this.modules.drive.updateSelection();
            }
        }
    }
    
    toggleView() {
        if (this.modules.ui) {
            const newView = this.appState.viewMode === 'grid' ? 'list' : 'grid';
            this.modules.ui.switchView(newView);
            this.appState.viewMode = newView;
        }
    }
    
    openSettings() {
        if (this.modules.ui) {
            this.modules.ui.openSettingsModal();
        }
    }
    
    logout() {
        if (this.modules.auth) {
            this.modules.auth.logout();
        }
    }
    
    showHelp() {
        alert(`Vault OS Keyboard Shortcuts:
        
        Ctrl+F  - Focus search
        Ctrl+N  - New folder
        Ctrl+U  - Upload files
        Ctrl+D  - Download selected
        Ctrl+A  - Select all
        Ctrl+S  - Toggle view
        Ctrl+,  - Open settings
        Ctrl+L  - Logout
        
        F1      - This help
        F5      - Refresh data
        Esc     - Close modals
        
        Double-click files to open
        Ctrl+Click for multi-select`);
    }
    
    async refreshAppData() {
        try {
            this.showToast('Refreshing data...', 'info');
            
            // Refresh auth state
            await this.checkAuthState();
            
            // Refresh files if authenticated
            if (this.appState.isAuthenticated && this.modules.drive) {
                await this.modules.drive.loadFiles();
                await this.updateStorageInfo();
            }
            
            // Update UI
            this.updateAppUI();
            
            this.showToast('Data refreshed', 'success');
            
        } catch (error) {
            console.error('Refresh app data error:', error);
            this.showToast('Refresh failed', 'error');
        }
    }
    
    // Public API Methods
    getModule(moduleName) {
        return this.modules[moduleName];
    }
    
    getAppState() {
        return { ...this.appState };
    }
    
    setAppState(newState) {
        this.appState = { ...this.appState, ...newState };
        this.updateAppUI();
    }
    
    async refresh() {
        return this.refreshAppData();
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
            
            // Auto remove after appropriate time
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
    
    // Analytics and Performance
    trackEvent(eventName, data = {}) {
        // Simple event tracking for debugging/analytics
        const event = {
            name: eventName,
            data: data,
            timestamp: Date.now(),
            user: this.modules.auth?.user?.id || 'anonymous',
            session: this.modules.auth?.accessToken ? 'authenticated' : 'anonymous'
        };
        
        console.log('📊 Event:', event);
        
        // Store events in localStorage (limited to last 100)
        try {
            const events = JSON.parse(localStorage.getItem('vault_events') || '[]');
            events.push(event);
            
            // Keep only last 100 events
            if (events.length > 100) {
                events.shift();
            }
            
            localStorage.setItem('vault_events', JSON.stringify(events));
        } catch (error) {
            console.error('Track event error:', error);
        }
    }
    
    // Performance monitoring
    startPerformanceMonitoring() {
        if ('performance' in window) {
            this.performanceEntries = [];
            
            const observer = new PerformanceObserver((list) => {
                for (const entry of list.getEntries()) {
                    this.performanceEntries.push(entry);
                    
                    // Log long tasks
                    if (entry.entryType === 'longtask' && entry.duration > 50) {
                        console.warn('Long task detected:', entry);
                    }
                }
            });
            
            observer.observe({ entryTypes: ['longtask', 'paint', 'measure'] });
        }
    }
}

// Initialize the app when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    // Create global app instance
    window.VaultApp = new VaultApp();
    
    // Make app available globally
    window.App = window.VaultApp;
    
    // Track page load performance
    if ('performance' in window) {
        const loadTime = performance.timing.loadEventEnd - performance.timing.navigationStart;
        console.log(`📈 Page load time: ${loadTime}ms`);
    }
});

// Handle service worker registration for PWA
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('/sw.js').then(registration => {
            console.log('✅ ServiceWorker registered:', registration);
        }).catch(error => {
            console.error('❌ ServiceWorker registration failed:', error);
        });
    });
}

// Handle install prompt for PWA
let deferredPrompt;
window.addEventListener('beforeinstallprompt', (e) => {
    // Prevent Chrome 67 and earlier from automatically showing the prompt
    e.preventDefault();
    
    // Stash the event so it can be triggered later
    deferredPrompt = e;
    
    // Show install button or notification
    console.log('📱 PWA install available');
    
    // You can show an install button here
    // showInstallPromotion();
});

// Export the app class for module systems
if (typeof module !== 'undefined' && module.exports) {
    module.exports = VaultApp;
}

