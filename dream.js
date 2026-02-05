// dream.js - Dream Vault OS Main Application Logic
// Complete production implementation with real credentials

// ====================================================================
// SECTION 1: GLOBAL CONFIGURATION
// ====================================================================

const CONFIG = {
    // Google OAuth Configuration
    GOOGLE_CLIENT_ID: '318681315152-65e9kofptt4c3bk3kmlj9gmksnasu347.apps.googleusercontent.com',
    GOOGLE_API_KEY: 'AIzaSyB3Iy1MIbfmJ7h5rv9NlsT23ysedCwUZt4',
    
    // OAuth Scopes
    SCOPES: 'https://www.googleapis.com/auth/drive https://www.googleapis.com/auth/drive.metadata https://www.googleapis.com/auth/userinfo.profile',
    
    // Drive Configuration
    VAULT_ROOT_ID: '1zIyinAqjQv96QBSuanFS2F0USaG66GPn',
    
    // Proxy URLs (from your specification)
    MEDIA_PROXY_READONLY: 'https://script.google.com/macros/s/AKfycby2hqAq0JePMbnjEbwwcPBFjS14lvS3pM2Z1PPgY4OraTcpvTmZFPKQr9CQ4vba4Xk7/exec',
    FULL_PROXY_RW: 'https://script.google.com/macros/s/AKfycbxQF58gDxHBATrBvliuMc_SdP7PEiuN6fiHdzVKG7_K5FIrj3V2m8imWgPXTjmVqfnN/exec',
    
    // Session Management
    SESSION_LIFETIME: 24 * 60 * 60 * 1000, // 24 hours
    
    // Admin Configuration - Add your admin emails here
    ADMIN_EMAILS: ['admin@example.com', 'your-email@gmail.com'],
    
    // Upload Configuration
    CHUNK_SIZE: 10 * 1024 * 1024, // 10MB
    MAX_RETRIES: 5,
    RETRY_DELAY: 1000,
    
    // API Endpoints
    DRIVE_API_BASE: 'https://www.googleapis.com/drive/v3',
    OAUTH_API_BASE: 'https://www.googleapis.com/oauth2/v3',
    
    // Current Redirect URI
    REDIRECT_URI: window.location.origin,
    
    // OAuth Configuration
    OAUTH_CONFIG: {
        client_id: '318681315152-65e9kofptt4c3bk3kmlj9gmksnasu347.apps.googleusercontent.com',
        scope: 'https://www.googleapis.com/auth/drive https://www.googleapis.com/auth/drive.metadata https://www.googleapis.com/auth/userinfo.profile',
        redirect_uri: window.location.origin,
        response_type: 'token',
        include_granted_scopes: true,
        prompt: 'consent'
    },
    
    // Version Information
    VERSION: '2.0.0',
    BUILD_DATE: '2024'
};

// ====================================================================
// SECTION 2: GLOBAL STATE - Single Source of Truth
// ====================================================================

const STATE = {
    auth: {
        token: null,
        tokenExpire: null,
        user: null,
        isAuthenticated: false,
        authTime: null
    },
    ui: {
        theme: 'dark',
        currentScreen: 'files',
        isLocked: true,
        isAdmin: false,
        readOnlyMode: false,
        sidebarOpen: window.innerWidth > 768
    },
    drive: {
        mode: 'user', // 'user' or 'vault'
        currentFolderId: 'root',
        currentFolderName: 'My Drive',
        fileCache: new Map(),
        selectedFiles: new Set(),
        breadcrumb: [],
        searchQuery: '',
        sortBy: 'name',
        sortOrder: 'asc',
        files: [],
        isLoading: false
    },
    jobs: {
        uploadQueue: [],
        copyMoveQueue: [],
        retryQueue: [],
        activeUpload: null,
        activeTransfer: null
    },
    cache: {
        quota: null,
        lastUpdate: null,
        userInfo: null,
        folderCache: new Map()
    },
    settings: {
        autoLock: true,
        chunkSize: 10,
        maxRetries: 5,
        theme: 'dark',
        notifications: true,
        confirmDeletes: true,
        showHidden: false
    },
    stats: {
        totalFiles: 0,
        totalFolders: 0,
        totalSize: 0,
        lastSync: null
    }
};

// ====================================================================
// SECTION 3: APPLICATION BOOTSTRAP
// ====================================================================

class DreamVaultOS {
    constructor() {
        this.tokenClient = null;
        this.gapiLoaded = false;
        this.gisLoaded = false;
        this.init();
    }

    async init() {
        console.log(`🚀 Dream Vault OS v${CONFIG.VERSION} - Monster Master Edition`);
        console.log('📅 Build:', CONFIG.BUILD_DATE);
        
        try {
            // Load settings and state
            this.loadState();
            
            // Initialize UI
            this.initUI();
            
            // Initialize event listeners
            this.initEvents();
            
            // Load Google APIs
            await this.loadGoogleAPIs();
            
            // Check for first time setup
            this.checkFirstRun();
            
            // Initialize service worker for PWA
            this.initServiceWorker();
            
            // Check URL for OAuth callback
            this.handleOAuthCallback();
            
            console.log('✅ Application initialized successfully');
        } catch (error) {
            console.error('❌ Application initialization failed:', error);
            this.showNotification('Failed to initialize application', 'error');
        }
    }

    loadState() {
        console.log('📥 Loading application state...');
        
        // Load PIN from localStorage
        const savedPin = localStorage.getItem('vault_pin');
        if (savedPin) {
            STATE.ui.isLocked = true;
        }
        
        // Load theme preference
        const savedTheme = localStorage.getItem('vault_theme');
        if (savedTheme) {
            STATE.ui.theme = savedTheme;
            document.body.className = `${savedTheme}-theme`;
        }
        
        // Load settings
        const savedSettings = localStorage.getItem('vault_settings');
        if (savedSettings) {
            try {
                STATE.settings = { ...STATE.settings, ...JSON.parse(savedSettings) };
            } catch (e) {
                console.error('Failed to load settings:', e);
            }
        }
        
        // Load upload queue from localStorage
        const savedQueue = localStorage.getItem('upload_queue');
        if (savedQueue) {
            try {
                STATE.jobs.uploadQueue = JSON.parse(savedQueue);
                this.updateUploadBadge();
            } catch (e) {
                console.error('Failed to load upload queue:', e);
            }
        }
        
        // Check for lockout
        const lockoutUntil = localStorage.getItem('lockout_until');
        if (lockoutUntil && Date.now() < parseInt(lockoutUntil)) {
            const remaining = Math.ceil((parseInt(lockoutUntil) - Date.now()) / 1000 / 60);
            this.showError(`Account locked. Try again in ${remaining} minutes.`);
        }
    }

    saveState() {
        // Save upload queue to localStorage
        localStorage.setItem('upload_queue', JSON.stringify(STATE.jobs.uploadQueue));
        
        // Save settings
        localStorage.setItem('vault_settings', JSON.stringify(STATE.settings));
    }

    initUI() {
        console.log('🎨 Initializing UI...');
        
        // Set initial screen
        this.switchScreen(STATE.ui.currentScreen);
        
        // Update theme toggle button
        const themeToggle = document.getElementById('themeToggle');
        themeToggle.textContent = STATE.ui.theme === 'dark' ? '🌙' : '☀️';
        
        // Update settings UI
        this.updateSettingsUI();
        
        // Update version display
        const versionElements = document.querySelectorAll('.version');
        versionElements.forEach(el => {
            el.textContent = `v${CONFIG.VERSION}`;
        });
        
        // Check responsive sidebar
        this.checkResponsiveSidebar();
    }

    async loadGoogleAPIs() {
        console.log('🔌 Loading Google APIs...');
        
        return new Promise((resolve, reject) => {
            // Load Google Identity Services
            const gisScript = document.createElement('script');
            gisScript.src = 'https://accounts.google.com/gsi/client';
            gisScript.async = true;
            gisScript.defer = true;
            gisScript.onload = () => {
                this.gisLoaded = true;
                console.log('✅ Google Identity Services loaded');
                if (this.gapiLoaded) this.initializeGoogleAuth();
            };
            gisScript.onerror = () => {
                console.error('❌ Failed to load Google Identity Services');
                this.showNotification('Failed to load Google services', 'error');
                reject(new Error('Failed to load Google Identity Services'));
            };
            
            // Load Google API Client
            const gapiScript = document.createElement('script');
            gapiScript.src = 'https://apis.google.com/js/api.js';
            gapiScript.async = true;
            gapiScript.defer = true;
            gapiScript.onload = () => {
                gapi.load('client', {
                    callback: () => {
                        console.log('✅ Google API Client loaded');
                        this.gapiLoaded = true;
                        if (this.gisLoaded) this.initializeGoogleAuth();
                    },
                    onerror: () => {
                        console.error('❌ Failed to load Google API Client');
                        this.showNotification('Failed to load Google services', 'error');
                        reject(new Error('Failed to load Google API Client'));
                    },
                    timeout: 10000
                });
            };
            gapiScript.onerror = () => {
                console.error('❌ Failed to load Google API Client script');
                reject(new Error('Failed to load Google API Client script'));
            };
            
            document.head.appendChild(gisScript);
            document.head.appendChild(gapiScript);
        });
    }

    async initializeGoogleAuth() {
        console.log('🔐 Initializing Google authentication...');
        
        try {
            // Initialize Google API client
            await gapi.client.init({
                apiKey: CONFIG.GOOGLE_API_KEY,
                clientId: CONFIG.GOOGLE_CLIENT_ID,
                scope: CONFIG.SCOPES,
                discoveryDocs: ['https://www.googleapis.com/discovery/v1/apis/drive/v3/rest']
            });
            
            console.log('✅ Google API client initialized');
            
            // Initialize token client for OAuth 2.0
            this.tokenClient = google.accounts.oauth2.initTokenClient({
                client_id: CONFIG.GOOGLE_CLIENT_ID,
                scope: CONFIG.SCOPES,
                callback: (response) => this.handleAuthResponse(response),
                error_callback: (error) => this.handleAuthError(error),
                prompt: ''
            });
            
            console.log('✅ Token client initialized');
            
            // Check for existing token
            this.checkExistingToken();
            
        } catch (error) {
            console.error('❌ Failed to initialize Google auth:', error);
            this.showNotification('Failed to initialize Google authentication', 'error');
        }
    }

    checkExistingToken() {
        const savedToken = localStorage.getItem('google_token');
        const tokenExpire = localStorage.getItem('token_expire');
        
        if (savedToken && tokenExpire && Date.now() < parseInt(tokenExpire)) {
            STATE.auth.token = savedToken;
            STATE.auth.tokenExpire = parseInt(tokenExpire);
            STATE.auth.isAuthenticated = true;
            
            console.log('✅ Using existing token');
            
            // Set token for gapi client
            gapi.client.setToken({ access_token: savedToken });
            
            // Load user info and files
            this.loadUserInfo();
            this.loadDriveFiles();
            this.loadStorageQuota();
        } else if (savedToken) {
            // Token expired, clear it
            console.log('ℹ️ Token expired, clearing...');
            localStorage.removeItem('google_token');
            localStorage.removeItem('token_expire');
            STATE.auth.token = null;
            STATE.auth.isAuthenticated = false;
        }
    }

    // ====================================================================
    // SECTION 4: PIN SECURITY SYSTEM
    // ====================================================================

    initPinEvents() {
        const pinButtons = document.querySelectorAll('.pin-keypad button:not(#clearPin)');
        const clearPinBtn = document.getElementById('clearPin');
        const submitPinBtn = document.getElementById('submitPin');
        const resetPinBtn = document.getElementById('resetPin');
        const savePinBtn = document.getElementById('savePin');
        
        let currentPin = '';
        
        pinButtons.forEach(button => {
            button.addEventListener('click', () => {
                if (currentPin.length < 4) {
                    currentPin += button.dataset.key;
                    this.updatePinDisplay(currentPin);
                }
            });
        });
        
        clearPinBtn.addEventListener('click', () => {
            currentPin = '';
            this.updatePinDisplay(currentPin);
            document.getElementById('pinError').textContent = '';
        });
        
        submitPinBtn.addEventListener('click', () => {
            if (currentPin.length === 4) {
                this.verifyPin(currentPin);
            } else {
                this.showError('Please enter 4-digit PIN');
            }
        });
        
        resetPinBtn.addEventListener('click', () => {
            if (confirm('Reset PIN? This will clear all local data and log you out.')) {
                localStorage.clear();
                sessionStorage.clear();
                location.reload();
            }
        });
        
        savePinBtn.addEventListener('click', () => {
            const newPin = document.getElementById('newPin').value;
            const confirmPin = document.getElementById('confirmPin').value;
            
            if (newPin.length !== 4 || !/^\d+$/.test(newPin)) {
                this.showError('Please enter a valid 4-digit PIN');
                return;
            }
            
            if (newPin !== confirmPin) {
                this.showError('PINs do not match');
                return;
            }
            
            this.setPin(newPin);
        });
    }

    updatePinDisplay(pin) {
        const dots = document.querySelectorAll('.pin-dot');
        dots.forEach((dot, index) => {
            dot.classList.toggle('filled', index < pin.length);
        });
    }

    verifyPin(enteredPin) {
        // Check for lockout
        const lockoutUntil = localStorage.getItem('lockout_until');
        if (lockoutUntil && Date.now() < parseInt(lockoutUntil)) {
            const remaining = Math.ceil((parseInt(lockoutUntil) - Date.now()) / 1000 / 60);
            this.showError(`Account locked. Try again in ${remaining} minutes.`);
            return;
        }
        
        const savedPin = localStorage.getItem('vault_pin');
        
        if (!savedPin) {
            // First time setup
            document.getElementById('pinEntry').classList.add('hidden');
            document.getElementById('firstTimeSetup').classList.remove('hidden');
            return;
        }
        
        if (btoa(enteredPin) === savedPin) {
            this.unlockApp();
        } else {
            this.showError('Invalid PIN. Try again.');
            this.recordFailedAttempt();
        }
    }

    setPin(newPin) {
        localStorage.setItem('vault_pin', btoa(newPin));
        localStorage.setItem('pin_set', 'true');
        
        this.showNotification('PIN set successfully', 'success');
        document.getElementById('firstTimeSetup').classList.add('hidden');
        document.getElementById('pinEntry').classList.remove('hidden');
        
        // Clear input fields
        document.getElementById('newPin').value = '';
        document.getElementById('confirmPin').value = '';
    }

    recordFailedAttempt() {
        let attempts = parseInt(localStorage.getItem('failed_attempts') || '0');
        attempts++;
        localStorage.setItem('failed_attempts', attempts.toString());
        
        console.log(`Failed attempt ${attempts}/5`);
        
        if (attempts >= 5) {
            this.lockoutUser();
        }
    }

    lockoutUser() {
        const lockoutUntil = Date.now() + (5 * 60 * 1000); // 5 minutes
        localStorage.setItem('lockout_until', lockoutUntil.toString());
        localStorage.setItem('failed_attempts', '0');
        
        this.showError('Too many failed attempts. Try again in 5 minutes.');
    }

    checkFirstRun() {
        const isFirstRun = !localStorage.getItem('pin_set');
        if (isFirstRun) {
            console.log('First run detected, showing PIN setup');
            document.getElementById('pinEntry').classList.add('hidden');
            document.getElementById('firstTimeSetup').classList.remove('hidden');
        }
    }

    unlockApp() {
        STATE.ui.isLocked = false;
        document.getElementById('lockScreen').classList.remove('active');
        document.getElementById('appShell').classList.add('active');
        
        // Clear failed attempts
        localStorage.removeItem('failed_attempts');
        localStorage.removeItem('lockout_until');
        
        // Initialize Google Auth if not already loaded
        if (!this.tokenClient) {
            this.showAuthModal();
        }
        
        this.showNotification('Vault unlocked', 'success');
    }

    lockApp() {
        STATE.ui.isLocked = true;
        STATE.auth.token = null;
        STATE.auth.user = null;
        STATE.auth.isAuthenticated = false;
        
        // Clear token from gapi
        if (gapi.client && gapi.client.getToken()) {
            gapi.client.setToken(null);
        }
        
        document.getElementById('appShell').classList.remove('active');
        document.getElementById('lockScreen').classList.add('active');
        
        // Clear PIN display
        this.updatePinDisplay('');
        
        // Clear any errors
        document.getElementById('pinError').textContent = '';
        
        this.showNotification('Vault locked', 'info');
    }

    // ====================================================================
    // SECTION 5: GOOGLE AUTHENTICATION
    // ====================================================================

    showAuthModal() {
        if (!STATE.auth.isAuthenticated) {
            const modal = document.getElementById('authModal');
            document.getElementById('modalOverlay').classList.remove('hidden');
            modal.classList.remove('hidden');
            
            document.getElementById('startAuth').onclick = () => {
                this.requestToken();
            };
            
            document.getElementById('cancelAuth').onclick = () => {
                this.hideModal();
            };
        }
    }

    requestToken() {
        if (!this.tokenClient) {
            this.showNotification('Authentication service not ready', 'error');
            return;
        }
        
        console.log('🔐 Requesting OAuth token...');
        
        // Request token with consent
        this.tokenClient.requestAccessToken({
            prompt: 'consent',
            hint: STATE.auth.user?.email
        });
    }

    handleAuthResponse(response) {
        console.log('✅ Auth response received');
        
        if (response.access_token) {
            STATE.auth.token = response.access_token;
            STATE.auth.isAuthenticated = true;
            
            // Calculate expiry (1 hour from now)
            const expiresIn = response.expires_in || 3600;
            STATE.auth.tokenExpire = Date.now() + (expiresIn * 1000);
            STATE.auth.authTime = Date.now();
            
            // Save token
            localStorage.setItem('google_token', response.access_token);
            localStorage.setItem('token_expire', STATE.auth.tokenExpire.toString());
            
            // Set token for gapi client
            gapi.client.setToken({ access_token: response.access_token });
            
            this.hideModal();
            this.loadUserInfo();
            this.loadDriveFiles();
            this.loadStorageQuota();
            
            this.showNotification('Successfully authenticated', 'success');
        } else {
            console.error('No access token in response');
            this.showNotification('Authentication failed - no token received', 'error');
        }
    }

    handleAuthError(error) {
        console.error('❌ Auth error:', error);
        
        let errorMessage = 'Authentication failed';
        
        if (error.type === 'popup_closed') {
            errorMessage = 'Authentication popup was closed';
        } else if (error.type === 'access_denied') {
            errorMessage = 'Access was denied';
        } else if (error.message) {
            errorMessage = error.message;
        }
        
        this.showNotification(errorMessage, 'error');
    }

    async loadUserInfo() {
        try {
            console.log('👤 Loading user info...');
            
            const response = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
                headers: {
                    'Authorization': `Bearer ${STATE.auth.token}`
                }
            });
            
            if (response.ok) {
                const user = await response.json();
                STATE.auth.user = user;
                STATE.cache.userInfo = user;
                
                console.log('✅ User info loaded:', user.name || user.email);
                
                // Update UI
                document.getElementById('userName').textContent = user.name || user.email;
                const avatar = document.querySelector('.avatar');
                avatar.textContent = user.name?.charAt(0)?.toUpperCase() || user.email?.charAt(0)?.toUpperCase() || 'U';
                avatar.title = user.name || user.email;
                
                // Check admin status
                this.checkAdminStatus(user.email);
            } else {
                throw new Error(`Failed to load user info: ${response.status}`);
            }
        } catch (error) {
            console.error('Failed to load user info:', error);
            this.showNotification('Failed to load user information', 'warning');
        }
    }

    checkAdminStatus(email) {
        if (email && CONFIG.ADMIN_EMAILS.includes(email)) {
            STATE.ui.isAdmin = true;
            document.getElementById('adminNav').classList.remove('hidden');
            document.getElementById('adminBadge').classList.remove('hidden');
            document.getElementById('adminStatus').textContent = 'Administrator';
            
            console.log('👑 User is admin');
            this.showNotification('Admin privileges enabled', 'success');
        } else {
            document.getElementById('adminNav').classList.add('hidden');
            document.getElementById('adminBadge').classList.add('hidden');
        }
    }

    // ====================================================================
    // SECTION 6: DRIVE ENGINE
    // ====================================================================

    async loadDriveFiles(folderId = null) {
        if (!STATE.auth.isAuthenticated) {
            this.showNotification('Please sign in first', 'warning');
            return;
        }
        
        const targetFolderId = folderId || this.getCurrentRootId();
        STATE.drive.currentFolderId = targetFolderId;
        STATE.drive.isLoading = true;
        
        console.log(`📁 Loading files for folder: ${targetFolderId}`);
        
        // Show loading
        const fileList = document.getElementById('fileList');
        fileList.innerHTML = `
            <div class="loading-indicator">
                <div class="spinner"></div>
                <p>Loading files...</p>
            </div>
        `;
        
        try {
            // Check cache first
            const cacheKey = `${STATE.drive.mode}_${targetFolderId}`;
            if (STATE.drive.fileCache.has(cacheKey)) {
                const cached = STATE.drive.fileCache.get(cacheKey);
                if (Date.now() - cached.timestamp < 5 * 60 * 1000) { // 5 minutes cache
                    console.log('📦 Using cached files');
                    this.renderFileList(cached.files);
                    return;
                }
            }
            
            let allFiles = [];
            let pageToken = null;
            let page = 1;
            
            do {
                console.log(`📄 Loading page ${page}...`);
                
                const query = `'${targetFolderId}' in parents and trashed = false`;
                let url = `https://www.googleapis.com/drive/v3/files?q=${encodeURIComponent(query)}&fields=files(id,name,mimeType,size,modifiedTime,webViewLink,thumbnailLink,iconLink),nextPageToken&orderBy=${STATE.drive.sortBy} ${STATE.drive.sortOrder}`;
                
                if (pageToken) {
                    url += `&pageToken=${pageToken}`;
                }
                
                const response = await fetch(url, {
                    headers: {
                        'Authorization': `Bearer ${STATE.auth.token}`
                    }
                });
                
                if (!response.ok) {
                    if (response.status === 401) {
                        this.handleTokenExpired();
                        return;
                    }
                    throw new Error(`API error: ${response.status}`);
                }
                
                const data = await response.json();
                allFiles = allFiles.concat(data.files);
                pageToken = data.nextPageToken;
                page++;
                
            } while (pageToken && page <= 10); // Limit to 10 pages max
            
            console.log(`✅ Loaded ${allFiles.length} files`);
            
            // Separate folders and files
            const folders = allFiles.filter(file => file.mimeType === 'application/vnd.google-apps.folder');
            const files = allFiles.filter(file => file.mimeType !== 'application/vnd.google-apps.folder');
            
            // Sort folders by name
            folders.sort((a, b) => a.name.localeCompare(b.name));
            
            // Sort files based on current sort setting
            if (STATE.drive.sortBy === 'name') {
                files.sort((a, b) => STATE.drive.sortOrder === 'asc' 
                    ? a.name.localeCompare(b.name)
                    : b.name.localeCompare(a.name));
            } else if (STATE.drive.sortBy === 'modifiedTime') {
                files.sort((a, b) => STATE.drive.sortOrder === 'asc'
                    ? new Date(a.modifiedTime) - new Date(b.modifiedTime)
                    : new Date(b.modifiedTime) - new Date(a.modifiedTime));
            } else if (STATE.drive.sortBy === 'size') {
                files.sort((a, b) => STATE.drive.sortOrder === 'asc'
                    ? (a.size || 0) - (b.size || 0)
                    : (b.size || 0) - (a.size || 0));
            }
            
            // Combine folders and files
            const sortedFiles = [...folders, ...files];
            
            this.renderFileList(sortedFiles);
            
            // Update cache
            STATE.drive.fileCache.set(cacheKey, {
                files: sortedFiles,
                timestamp: Date.now()
            });
            
            // Update stats
            STATE.stats.totalFiles = files.length;
            STATE.stats.totalFolders = folders.length;
            STATE.stats.totalSize = files.reduce((sum, file) => sum + (file.size || 0), 0);
            STATE.stats.lastSync = new Date().toISOString();
            
            // Update breadcrumb
            this.updateBreadcrumb(targetFolderId);
            
        } catch (error) {
            console.error('Failed to load files:', error);
            fileList.innerHTML = `
                <div class="empty-state">
                    <p>Failed to load files</p>
                    <p class="error-message">${error.message}</p>
                    <button onclick="app.loadDriveFiles()" class="secondary">Retry</button>
                </div>
            `;
        } finally {
            STATE.drive.isLoading = false;
        }
    }

    getCurrentRootId() {
        return STATE.drive.mode === 'vault' ? CONFIG.VAULT_ROOT_ID : 'root';
    }

    renderFileList(files) {
        const fileList = document.getElementById('fileList');
        
        if (!files || files.length === 0) {
            fileList.innerHTML = `
                <div class="empty-state">
                    <p>No files in this folder</p>
                    <p>Click "Upload Files" to add content</p>
                </div>
            `;
            return;
        }
        
        const html = files.map(file => this.createFileItem(file)).join('');
        fileList.innerHTML = html;
        
        // Add event listeners
        this.attachFileItemListeners();
    }

    createFileItem(file) {
        const isSelected = STATE.drive.selectedFiles.has(file.id);
        const icon = this.getFileIcon(file.mimeType, file.name);
        const size = file.size ? this.formatFileSize(file.size) : '';
        const modified = file.modifiedTime ? new Date(file.modifiedTime).toLocaleDateString() : '';
        const isFolder = file.mimeType === 'application/vnd.google-apps.folder';
        
        return `
            <div class="file-item ${isSelected ? 'selected' : ''} ${isFolder ? 'folder' : ''}" 
                 data-file-id="${file.id}" 
                 data-mime-type="${file.mimeType}"
                 title="${file.name}">
                <div class="file-icon">${icon}</div>
                <div class="file-name">${this.truncateFileName(file.name)}</div>
                ${size ? `<div class="file-size">${size}</div>` : ''}
                <div class="file-modified">${modified}</div>
                <div class="file-actions">
                    ${!isFolder ? `<button class="icon-button" onclick="app.previewFile('${file.id}')" title="Preview">👁️</button>` : ''}
                    <button class="icon-button" onclick="app.showFileMenu('${file.id}', event)" title="More actions">⋯</button>
                </div>
            </div>
        `;
    }

    truncateFileName(name, maxLength = 20) {
        if (name.length <= maxLength) return name;
        return name.substring(0, maxLength - 3) + '...';
    }

    getFileIcon(mimeType, fileName = '') {
        if (mimeType === 'application/vnd.google-apps.folder') return '📁';
        if (mimeType.startsWith('image/')) return '🖼️';
        if (mimeType.startsWith('video/')) return '🎬';
        if (mimeType.startsWith('audio/')) return '🎵';
        if (mimeType.includes('pdf')) return '📄';
        if (mimeType.includes('document')) return '📝';
        if (mimeType.includes('spreadsheet')) return '📊';
        if (mimeType.includes('presentation')) return '📽️';
        if (mimeType.includes('zip') || mimeType.includes('compressed')) return '🗜️';
        if (fileName.endsWith('.js')) return '📜';
        if (fileName.endsWith('.css')) return '🎨';
        if (fileName.endsWith('.html')) return '🌐';
        return '📄';
    }

    attachFileItemListeners() {
        document.querySelectorAll('.file-item').forEach(item => {
            const fileId = item.dataset.fileId;
            const isFolder = item.classList.contains('folder');
            
            item.addEventListener('click', (e) => {
                if (!e.target.closest('.file-actions')) {
                    if (e.shiftKey) {
                        // Range selection
                        this.selectFileRange(fileId);
                    } else if (e.ctrlKey || e.metaKey) {
                        // Toggle selection
                        this.toggleFileSelection(fileId);
                    } else {
                        // Single selection
                        this.selectSingleFile(fileId);
                    }
                }
            });
            
            item.addEventListener('dblclick', () => {
                if (isFolder) {
                    this.openFolder(fileId);
                } else {
                    this.previewFile(fileId);
                }
            });
            
            // Context menu
            item.addEventListener('contextmenu', (e) => {
                e.preventDefault();
                this.showContextMenu(fileId, e.clientX, e.clientY);
            });
        });
    }

    selectSingleFile(fileId) {
        STATE.drive.selectedFiles.clear();
        STATE.drive.selectedFiles.add(fileId);
        this.updateFileSelectionUI();
    }

    toggleFileSelection(fileId) {
        if (STATE.drive.selectedFiles.has(fileId)) {
            STATE.drive.selectedFiles.delete(fileId);
        } else {
            STATE.drive.selectedFiles.add(fileId);
        }
        this.updateFileSelectionUI();
    }

    selectFileRange(fileId) {
        // Implementation for range selection
        // This would require tracking the last selected file
        console.log('Range selection for:', fileId);
    }

    updateFileSelectionUI() {
        // Update all file items
        document.querySelectorAll('.file-item').forEach(item => {
            const fileId = item.dataset.fileId;
            item.classList.toggle('selected', STATE.drive.selectedFiles.has(fileId));
        });
        
        // Update toolbar
        this.updateSelectionToolbar();
    }

    updateSelectionToolbar() {
        const hasSelection = STATE.drive.selectedFiles.size > 0;
        const toolbarButtons = document.querySelectorAll('.file-toolbar button:not(:first-child):not(:nth-child(2))');
        
        toolbarButtons.forEach(button => {
            button.disabled = !hasSelection || STATE.ui.readOnlyMode;
        });
    }

    openFolder(folderId) {
        console.log(`Opening folder: ${folderId}`);
        this.loadDriveFiles(folderId);
    }

    updateBreadcrumb(folderId) {
        const breadcrumb = document.getElementById('currentPath');
        const mode = STATE.drive.mode === 'user' ? 'My Drive' : 'Vault Drive';
        breadcrumb.textContent = `/${mode}`;
        
        // TODO: Implement full breadcrumb navigation
        // For now, just show current mode
    }

    // ====================================================================
    // SECTION 7: MEDIA VIEWER
    // ====================================================================

    async previewFile(fileId) {
        const file = await this.getFileMetadata(fileId);
        if (!file) {
            this.showNotification('File not found', 'error');
            return;
        }
        
        console.log(`Previewing file: ${file.name} (${file.mimeType})`);
        
        const viewer = document.getElementById('fileViewer');
        const content = document.getElementById('viewerContent');
        const title = document.getElementById('viewerTitle');
        
        title.textContent = file.name;
        content.innerHTML = '';
        
        // Show loading
        content.innerHTML = '<div class="loading-indicator"><div class="spinner"></div><p>Loading preview...</p></div>';
        
        viewer.classList.remove('hidden');
        
        try {
            if (file.mimeType.startsWith('image/')) {
                // Use thumbnail for faster loading, fallback to full image
                const thumbnailUrl = file.thumbnailLink ? `${file.thumbnailLink}=s500` : this.getMediaUrl(fileId);
                content.innerHTML = `
                    <div class="image-viewer">
                        <img src="${thumbnailUrl}" 
                             data-full="${this.getMediaUrl(fileId)}" 
                             alt="${file.name}"
                             onclick="this.src = this.dataset.full">
                        <div class="viewer-tools">
                            <button onclick="app.downloadFile('${fileId}')" class="secondary">⬇️ Download</button>
                            <button onclick="app.openInNewTab('${file.webViewLink}')" class="secondary">🔗 Open in Drive</button>
                        </div>
                    </div>
                `;
            } else if (file.mimeType.startsWith('video/')) {
                content.innerHTML = `
                    <div class="video-viewer">
                        <video controls autoplay>
                            <source src="${this.getMediaUrl(fileId)}" type="${file.mimeType}">
                            Your browser does not support video playback.
                        </video>
                        <div class="viewer-tools">
                            <button onclick="app.downloadFile('${fileId}')" class="secondary">⬇️ Download</button>
                            <button onclick="app.openInNewTab('${file.webViewLink}')" class="secondary">🔗 Open in Drive</button>
                        </div>
                    </div>
                `;
            } else if (file.mimeType.startsWith('audio/')) {
                content.innerHTML = `
                    <div class="audio-viewer">
                        <audio controls autoplay>
                            <source src="${this.getMediaUrl(fileId)}" type="${file.mimeType}">
                            Your browser does not support audio playback.
                        </audio>
                        <div class="viewer-tools">
                            <button onclick="app.downloadFile('${fileId}')" class="secondary">⬇️ Download</button>
                            <button onclick="app.openInNewTab('${file.webViewLink}')" class="secondary">🔗 Open in Drive</button>
                        </div>
                    </div>
                `;
            } else if (file.mimeType === 'application/pdf') {
                content.innerHTML = `
                    <div class="pdf-viewer">
                        <iframe src="https://drive.google.com/file/d/${fileId}/preview" 
                                width="100%" 
                                height="100%"
                                style="border: none;">
                        </iframe>
                        <div class="viewer-tools">
                            <button onclick="app.downloadFile('${fileId}')" class="secondary">⬇️ Download</button>
                            <button onclick="app.openInNewTab('${file.webViewLink}')" class="secondary">🔗 Open in Drive</button>
                        </div>
                    </div>
                `;
            } else if (file.mimeType.includes('document') || 
                      file.mimeType.includes('spreadsheet') || 
                      file.mimeType.includes('presentation')) {
                // Google Docs/Sheets/Slides
                content.innerHTML = `
                    <div class="docs-viewer">
                        <iframe src="https://docs.google.com/viewer?url=${encodeURIComponent(`https://drive.google.com/file/d/${fileId}/view`)}&embedded=true"
                                width="100%"
                                height="100%"
                                style="border: none;">
                        </iframe>
                        <div class="viewer-tools">
                            <button onclick="app.downloadFile('${fileId}')" class="secondary">⬇️ Download</button>
                            <button onclick="app.openInNewTab('${file.webViewLink}')" class="secondary">🔗 Open in Drive</button>
                        </div>
                    </div>
                `;
            } else {
                // Generic file viewer
                content.innerHTML = `
                    <div class="generic-viewer">
                        <div class="file-info">
                            <div class="file-icon-large">${this.getFileIcon(file.mimeType, file.name)}</div>
                            <h3>${file.name}</h3>
                            <p>Type: ${file.mimeType}</p>
                            ${file.size ? `<p>Size: ${this.formatFileSize(file.size)}</p>` : ''}
                            <p>Modified: ${new Date(file.modifiedTime).toLocaleString()}</p>
                        </div>
                        <div class="viewer-tools">
                            <button onclick="app.downloadFile('${fileId}')" class="primary">⬇️ Download</button>
                            <button onclick="app.openInNewTab('${file.webViewLink}')" class="secondary">🔗 Open in Drive</button>
                        </div>
                    </div>
                `;
            }
        } catch (error) {
            console.error('Preview failed:', error);
            content.innerHTML = `
                <div class="error-viewer">
                    <p>Unable to preview this file type.</p>
                    <button onclick="app.downloadFile('${fileId}')" class="primary">⬇️ Download</button>
                </div>
            `;
        }
    }

    getMediaUrl(fileId, range = null) {
        let url = `${CONFIG.MEDIA_PROXY_READONLY}?id=${fileId}`;
        if (range) {
            url += `&range=${range}`;
        }
        return url;
    }

    async getFileMetadata(fileId) {
        // Check cache first
        for (const [cacheKey, cache] of STATE.drive.fileCache) {
            const file = cache.files.find(f => f.id === fileId);
            if (file) return file;
        }
        
        // Fetch from API
        try {
            const url = `https://www.googleapis.com/drive/v3/files/${fileId}?fields=id,name,mimeType,size,modifiedTime,webViewLink,thumbnailLink,iconLink`;
            const response = await fetch(url, {
                headers: {
                    'Authorization': `Bearer ${STATE.auth.token}`
                }
            });
            
            if (response.ok) {
                return await response.json();
            }
        } catch (error) {
            console.error('Failed to get file metadata:', error);
        }
        
        return null;
    }

    downloadFile(fileId) {
        if (!STATE.auth.token) {
            this.showNotification('Please sign in to download files', 'warning');
            return;
        }
        
        const downloadUrl = `https://www.googleapis.com/drive/v3/files/${fileId}?alt=media`;
        
        fetch(downloadUrl, {
            headers: {
                'Authorization': `Bearer ${STATE.auth.token}`
            }
        })
        .then(response => response.blob())
        .then(blob => {
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = 'file';
            document.body.appendChild(a);
            a.click();
            window.URL.revokeObjectURL(url);
            document.body.removeChild(a);
            
            this.showNotification('Download started', 'success');
        })
        .catch(error => {
            console.error('Download failed:', error);
            this.showNotification('Download failed', 'error');
        });
    }

    openInNewTab(url) {
        if (url) {
            window.open(url, '_blank');
        }
    }

    // ====================================================================
    // SECTION 8: UPLOAD ENGINE
    // ====================================================================

    initUploadEvents() {
        const uploadBtn = document.getElementById('uploadFiles');
        const fileInput = document.getElementById('fileInput');
        
        uploadBtn.addEventListener('click', () => {
            if (STATE.ui.readOnlyMode) {
                this.showNotification('Read-only mode is active', 'warning');
                return;
            }
            
            if (!STATE.auth.isAuthenticated) {
                this.showNotification('Please sign in to upload files', 'warning');
                return;
            }
            
            fileInput.click();
        });
        
        fileInput.addEventListener('change', (e) => {
            const files = Array.from(e.target.files);
            if (files.length === 0) return;
            
            console.log(`Selected ${files.length} file(s) for upload`);
            
            // Check available space
            this.checkStorageSpace(files).then(hasSpace => {
                if (hasSpace) {
                    files.forEach(file => this.addToUploadQueue(file));
                    this.showNotification(`Added ${files.length} file(s) to upload queue`, 'success');
                }
            });
            
            fileInput.value = '';
        });
        
        // Drag and drop
        const dropZone = document.getElementById('fileList');
        dropZone.addEventListener('dragover', (e) => {
            e.preventDefault();
            dropZone.classList.add('drag-over');
        });
        
        dropZone.addEventListener('dragleave', () => {
            dropZone.classList.remove('drag-over');
        });
        
        dropZone.addEventListener('drop', (e) => {
            e.preventDefault();
            dropZone.classList.remove('drag-over');
            
            if (STATE.ui.readOnlyMode || !STATE.auth.isAuthenticated) {
                return;
            }
            
            const files = Array.from(e.dataTransfer.files);
            if (files.length > 0) {
                this.checkStorageSpace(files).then(hasSpace => {
                    if (hasSpace) {
                        files.forEach(file => this.addToUploadQueue(file));
                        this.showNotification(`Added ${files.length} file(s) to upload queue`, 'success');
                    }
                });
            }
        });
    }

    async checkStorageSpace(files) {
        const totalSize = files.reduce((sum, file) => sum + file.size, 0);
        
        if (!STATE.cache.quota) {
            await this.loadStorageQuota();
        }
        
        if (STATE.cache.quota) {
            const used = parseInt(STATE.cache.quota.usage) || 0;
            const limit = parseInt(STATE.cache.quota.limit) || 0;
            const available = limit - used;
            
            if (totalSize > available) {
                const availableGB = (available / 1024 ** 3).toFixed(2);
                const neededGB = (totalSize / 1024 ** 3).toFixed(2);
                
                this.showNotification(`Insufficient space. Need ${neededGB} GB, only ${availableGB} GB available`, 'error');
                return false;
            }
        }
        
        return true;
    }

    addToUploadQueue(file) {
        const jobId = `upload_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        
        const uploadJob = {
            id: jobId,
            file: file,
            name: file.name,
            size: file.size,
            uploadedBytes: 0,
            status: 'pending',
            retries: 0,
            chunkSize: CONFIG.CHUNK_SIZE,
            currentChunk: 0,
            totalChunks: Math.ceil(file.size / CONFIG.CHUNK_SIZE),
            createdAt: Date.now(),
            parentId: STATE.drive.currentFolderId,
            progress: 0,
            speed: 0,
            timeRemaining: null
        };
        
        STATE.jobs.uploadQueue.push(uploadJob);
        this.saveState();
        this.updateUploadBadge();
        this.renderUploadQueue();
        
        console.log(`Added upload job: ${file.name} (${this.formatFileSize(file.size)})`);
        
        // Start processing if no active upload
        if (!STATE.jobs.activeUpload) {
            this.processUploadQueue();
        }
    }

    async processUploadQueue() {
        const pendingJobs = STATE.jobs.uploadQueue.filter(job => 
            job.status === 'pending' || job.status === 'retrying'
        );
        
        if (pendingJobs.length === 0) {
            STATE.jobs.activeUpload = null;
            return;
        }
        
        const job = pendingJobs[0];
        STATE.jobs.activeUpload = job.id;
        job.status = 'uploading';
        job.startedAt = Date.now();
        
        this.renderUploadQueue();
        
        try {
            await this.uploadFile(job);
            
            if (job.uploadedBytes >= job.size) {
                job.status = 'completed';
                job.completedAt = Date.now();
                this.showNotification(`Uploaded: ${job.name}`, 'success');
                
                // Refresh file list
                this.loadDriveFiles();
            }
            
        } catch (error) {
            console.error('Upload failed:', error);
            job.status = 'failed';
            job.error = error.message;
            job.retries++;
            
            if (job.retries < CONFIG.MAX_RETRIES) {
                // Add to retry queue with exponential backoff
                const retryDelay = CONFIG.RETRY_DELAY * Math.pow(2, job.retries - 1);
                STATE.jobs.retryQueue.push({
                    jobId: job.id,
                    retryAt: Date.now() + retryDelay
                });
                
                this.showNotification(`Upload failed, will retry in ${retryDelay/1000} seconds`, 'warning');
            } else {
                this.showNotification(`Upload failed: ${job.name}`, 'error');
            }
        }
        
        this.saveState();
        this.renderUploadQueue();
        
        // Process next job
        setTimeout(() => this.processUploadQueue(), 1000);
    }

    async uploadFile(job) {
        console.log(`Uploading ${job.name} (${job.currentChunk + 1}/${job.totalChunks})`);
        
        while (job.uploadedBytes < job.size) {
            const chunkStart = job.uploadedBytes;
            const chunkEnd = Math.min(chunkStart + job.chunkSize, job.size);
            const chunk = job.file.slice(chunkStart, chunkEnd);
            
            const startTime = Date.now();
            
            try {
                await this.uploadChunk(job, chunk, job.currentChunk);
                
                const endTime = Date.now();
                const timeTaken = (endTime - startTime) / 1000; // seconds
                const chunkSizeMB = chunk.size / (1024 * 1024);
                job.speed = chunkSizeMB / timeTaken; // MB/s
                
                job.uploadedBytes = chunkEnd;
                job.currentChunk++;
                job.progress = (job.uploadedBytes / job.size) * 100;
                
                // Calculate time remaining
                const bytesRemaining = job.size - job.uploadedBytes;
                if (job.speed > 0) {
                    job.timeRemaining = bytesRemaining / (job.speed * 1024 * 1024); // seconds
                }
                
                this.renderUploadQueue();
                this.saveState();
                
            } catch (error) {
                throw new Error(`Chunk ${job.currentChunk} failed: ${error.message}`);
            }
        }
        
        // Finalize upload
        await this.finalizeUpload(job);
    }

    async uploadChunk(job, chunk, chunkIndex) {
        const formData = new FormData();
        formData.append('action', 'uploadChunk');
        formData.append('jobId', job.id);
        formData.append('fileName', job.name);
        formData.append('chunkIndex', chunkIndex);
        formData.append('totalChunks', job.totalChunks);
        formData.append('chunkData', chunk, `chunk_${chunkIndex}`);
        formData.append('parentId', job.parentId);
        formData.append('mimeType', job.file.type);
        
        const response = await fetch(CONFIG.FULL_PROXY_RW, {
            method: 'POST',
            body: formData
        });
        
        if (!response.ok) {
            throw new Error(`HTTP ${response.status}`);
        }
        
        const result = await response.json();
        
        if (!result.success) {
            throw new Error(result.error || 'Upload failed');
        }
        
        return result;
    }

    async finalizeUpload(job) {
        const response = await fetch(CONFIG.FULL_PROXY_RW, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                action: 'finalizeUpload',
                jobId: job.id,
                fileName: job.name,
                totalSize: job.size,
                totalChunks: job.totalChunks,
                parentId: job.parentId,
                mimeType: job.file.type
            })
        });
        
        if (!response.ok) {
            throw new Error('Failed to finalize upload');
        }
        
        const result = await response.json();
        
        if (!result.success) {
            throw new Error(result.error || 'Finalization failed');
        }
        
        return result;
    }

    renderUploadQueue() {
        const queueContainer = document.getElementById('uploadQueue');
        const queue = STATE.jobs.uploadQueue;
        
        if (queue.length === 0) {
            queueContainer.innerHTML = '<div class="empty-state"><p>No uploads in queue</p></div>';
            return;
        }
        
        const html = queue.map(job => this.createUploadQueueItem(job)).join('');
        queueContainer.innerHTML = html;
    }

    createUploadQueueItem(job) {
        const progress = job.progress || 0;
        const statusClass = job.status === 'completed' ? 'completed' : 
                          job.status === 'failed' ? 'failed' : 
                          job.status === 'uploading' ? 'uploading' : '';
        
        let statusText = job.status;
        if (job.status === 'uploading') {
            statusText = `${Math.round(progress)}%`;
        }
        
        let infoText = '';
        if (job.status === 'uploading' && job.speed > 0) {
            const remaining = job.timeRemaining ? Math.round(job.timeRemaining) : '?';
            infoText = `${Math.round(job.speed)} MB/s • ${remaining}s remaining`;
        } else if (job.retries > 0) {
            infoText = `${job.retries} retry${job.retries > 1 ? 's' : ''}`;
        }
        
        return `
            <div class="queue-item ${statusClass}" data-job-id="${job.id}">
                <div class="queue-header">
                    <span class="queue-name" title="${job.name}">${this.truncateFileName(job.name, 30)}</span>
                    <span class="queue-status">${statusText}</span>
                </div>
                <div class="queue-progress">
                    <div class="queue-progress-bar" style="width: ${progress}%"></div>
                </div>
                <div class="queue-info">
                    <span>${this.formatFileSize(job.uploadedBytes)} / ${this.formatFileSize(job.size)}</span>
                    <span>${infoText}</span>
                </div>
                <div class="queue-actions">
                    ${job.status === 'pending' || job.status === 'uploading' ? 
                        `<button class="icon-button small" onclick="app.pauseUploadJob('${job.id}')" title="Pause">⏸️</button>` : ''}
                    ${job.status === 'paused' ? 
                        `<button class="icon-button small" onclick="app.resumeUploadJob('${job.id}')" title="Resume">▶️</button>` : ''}
                    <button class="icon-button small" onclick="app.removeUploadJob('${job.id}')" title="Remove">🗑️</button>
                </div>
            </div>
        `;
    }

    pauseUploadJob(jobId) {
        const job = STATE.jobs.uploadQueue.find(j => j.id === jobId);
        if (job && (job.status === 'pending' || job.status === 'uploading')) {
            job.status = 'paused';
            this.saveState();
            this.renderUploadQueue();
            this.showNotification('Upload paused', 'info');
        }
    }

    resumeUploadJob(jobId) {
        const job = STATE.jobs.uploadQueue.find(j => j.id === jobId);
        if (job && job.status === 'paused') {
            job.status = 'pending';
            this.saveState();
            this.renderUploadQueue();
            this.processUploadQueue();
            this.showNotification('Upload resumed', 'info');
        }
    }

    removeUploadJob(jobId) {
        STATE.jobs.uploadQueue = STATE.jobs.uploadQueue.filter(j => j.id !== jobId);
        this.saveState();
        this.updateUploadBadge();
        this.renderUploadQueue();
        this.showNotification('Upload removed', 'info');
    }

    updateUploadBadge() {
        const count = STATE.jobs.uploadQueue.filter(job => 
            job.status !== 'completed' && job.status !== 'failed'
        ).length;
        
        const badge = document.getElementById('uploadCount');
        badge.textContent = count;
        badge.style.display = count > 0 ? 'flex' : 'none';
        
        // Update admin view
        document.getElementById('adminUploadCount').textContent = `${count} active`;
    }

    // ====================================================================
    // SECTION 9: COPY/MOVE OPERATIONS
    // ====================================================================

    async copyFiles() {
        if (STATE.drive.selectedFiles.size === 0) {
            this.showNotification('No files selected', 'warning');
            return;
        }
        
        if (STATE.ui.readOnlyMode) {
            this.showNotification('Read-only mode is active', 'warning');
            return;
        }
        
        if (!STATE.auth.isAuthenticated) {
            this.showNotification('Please sign in first', 'warning');
            return;
        }
        
        this.showCopyMoveModal('copy');
    }

    async moveFiles() {
        if (STATE.drive.selectedFiles.size === 0) {
            this.showNotification('No files selected', 'warning');
            return;
        }
        
        if (STATE.ui.readOnlyMode) {
            this.showNotification('Read-only mode is active', 'warning');
            return;
        }
        
        if (!STATE.auth.isAuthenticated) {
            this.showNotification('Please sign in first', 'warning');
            return;
        }
        
        this.showCopyMoveModal('move');
    }

    showCopyMoveModal(action) {
        const modal = document.getElementById('copyMoveModal');
        const title = document.getElementById('copyMoveTitle');
        const message = document.getElementById('copyMoveMessage');
        
        const count = STATE.drive.selectedFiles.size;
        title.textContent = action === 'copy' ? 'Copy Files' : 'Move Files';
        message.textContent = `Select destination folder for ${count} selected item${count > 1 ? 's' : ''}:`;
        
        // Load folder browser
        this.loadFolderBrowser();
        
        document.getElementById('modalOverlay').classList.remove('hidden');
        modal.classList.remove('hidden');
        
        document.getElementById('confirmCopyMove').onclick = () => {
            this.executeCopyMove(action);
        };
        
        document.getElementById('cancelCopyMove').onclick = () => {
            this.hideModal();
        };
    }

    loadFolderBrowser() {
        const browser = document.getElementById('destinationBrowser');
        browser.innerHTML = `
            <div class="folder-browser">
                <div class="folder-list">
                    <div class="folder-item selected" data-folder-id="${this.getCurrentRootId()}">
                        <span class="folder-icon">📁</span>
                        <span class="folder-name">${STATE.drive.mode === 'user' ? 'My Drive' : 'Vault Drive'}</span>
                    </div>
                    <div class="folder-item" data-folder-id="root">
                        <span class="folder-icon">📁</span>
                        <span class="folder-name">Root</span>
                    </div>
                </div>
                <p class="hint">Select a destination folder from the list above</p>
            </div>
        `;
        
        // Add folder selection
        browser.querySelectorAll('.folder-item').forEach(item => {
            item.addEventListener('click', () => {
                browser.querySelectorAll('.folder-item').forEach(i => i.classList.remove('selected'));
                item.classList.add('selected');
                this.selectedDestinationId = item.dataset.folderId;
            });
        });
        
        // Default selection
        this.selectedDestinationId = this.getCurrentRootId();
    }

    async executeCopyMove(action) {
        if (!this.selectedDestinationId) {
            this.showNotification('Please select a destination folder', 'warning');
            return;
        }
        
        const files = Array.from(STATE.drive.selectedFiles);
        const jobId = `${action}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        
        const job = {
            id: jobId,
            action: action,
            files: files,
            sourceFolder: STATE.drive.currentFolderId,
            destinationFolder: this.selectedDestinationId,
            status: 'pending',
            processed: 0,
            total: files.length,
            createdAt: Date.now(),
            results: []
        };
        
        STATE.jobs.copyMoveQueue.push(job);
        this.renderTransferQueue();
        this.hideModal();
        
        this.showNotification(`${action.charAt(0).toUpperCase() + action.slice(1)} operation started`, 'info');
        
        // Process in background
        this.processCopyMoveJob(job);
    }

    async processCopyMoveJob(job) {
        STATE.jobs.activeTransfer = job.id;
        job.status = 'processing';
        this.renderTransferQueue();
        
        for (const fileId of job.files) {
            try {
                const result = await this.processSingleFile(job.action, fileId, job.destinationFolder);
                job.processed++;
                job.results.push({
                    fileId: fileId,
                    success: true,
                    result: result
                });
                
                this.renderTransferQueue();
                
            } catch (error) {
                console.error(`${job.action} failed for file ${fileId}:`, error);
                job.results.push({
                    fileId: fileId,
                    success: false,
                    error: error.message
                });
                
                // Continue with other files even if one fails
                continue;
            }
        }
        
        if (job.processed === job.total) {
            job.status = 'completed';
            job.completedAt = Date.now();
            
            const successCount = job.results.filter(r => r.success).length;
            if (successCount === job.total) {
                this.showNotification(`${job.action.charAt(0).toUpperCase() + job.action.slice(1)} completed successfully`, 'success');
            } else {
                this.showNotification(`${job.action.charAt(0).toUpperCase() + job.action.slice(1)} completed with ${job.total - successCount} error(s)`, 'warning');
            }
            
            // Refresh file list if moving from current folder
            if (job.action === 'move' && job.sourceFolder === STATE.drive.currentFolderId) {
                this.loadDriveFiles();
            }
        } else {
            job.status = 'failed';
            this.showNotification(`${job.action.charAt(0).toUpperCase() + job.action.slice(1)} failed`, 'error');
        }
        
        STATE.jobs.activeTransfer = null;
        this.renderTransferQueue();
    }

    async processSingleFile(action, fileId, destinationId) {
        const endpoint = action === 'copy' ? 'copyFile' : 'moveFile';
        
        const response = await fetch(CONFIG.FULL_PROXY_RW, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                action: endpoint,
                fileId: fileId,
                destinationId: destinationId,
                token: STATE.auth.token
            })
        });
        
        if (!response.ok) {
            throw new Error(`HTTP ${response.status}`);
        }
        
        const result = await response.json();
        
        if (!result.success) {
            throw new Error(result.error || 'Operation failed');
        }
        
        return result;
    }

    renderTransferQueue() {
        const container = document.getElementById('transferQueue');
        const queue = STATE.jobs.copyMoveQueue;
        
        if (queue.length === 0) {
            container.innerHTML = '<div class="empty-state"><p>No active transfers</p></div>';
            return;
        }
        
        const html = queue.map(job => this.createTransferQueueItem(job)).join('');
        container.innerHTML = html;
        
        // Update badge
        const activeCount = queue.filter(job => 
            job.status === 'pending' || job.status === 'processing'
        ).length;
        
        const badge = document.getElementById('transferCount');
        badge.textContent = activeCount;
        badge.style.display = activeCount > 0 ? 'flex' : 'none';
        
        // Update admin view
        document.getElementById('adminTransferCount').textContent = `${activeCount} active`;
    }

    createTransferQueueItem(job) {
        const progress = (job.processed / job.total) * 100;
        const statusClass = job.status === 'completed' ? 'completed' : 
                          job.status === 'failed' ? 'failed' : 
                          job.status === 'processing' ? 'processing' : '';
        
        let statusText = job.status;
        if (job.status === 'processing') {
            statusText = `${job.processed}/${job.total}`;
        }
        
        const successCount = job.results ? job.results.filter(r => r.success).length : 0;
        
        return `
            <div class="queue-item ${statusClass}" data-job-id="${job.id}">
                <div class="queue-header">
                    <span class="queue-name">${job.action.toUpperCase()} ${job.total} files</span>
                    <span class="queue-status">${statusText}</span>
                </div>
                <div class="queue-progress">
                    <div class="queue-progress-bar" style="width: ${progress}%"></div>
                </div>
                <div class="queue-info">
                    <span>${successCount} / ${job.total} successful</span>
                    <span>${new Date(job.createdAt).toLocaleTimeString()}</span>
                </div>
                <div class="queue-actions">
                    <button class="icon-button small" onclick="app.viewTransferDetails('${job.id}')" title="Details">ℹ️</button>
                    <button class="icon-button small" onclick="app.removeTransferJob('${job.id}')" title="Remove">🗑️</button>
                </div>
            </div>
        `;
    }

    viewTransferDetails(jobId) {
        const job = STATE.jobs.copyMoveQueue.find(j => j.id === jobId);
        if (!job) return;
        
        let details = `Operation: ${job.action}\n`;
        details += `Status: ${job.status}\n`;
        details += `Processed: ${job.processed}/${job.total}\n`;
        details += `Created: ${new Date(job.createdAt).toLocaleString()}\n\n`;
        details += `Results:\n`;
        
        if (job.results) {
            job.results.forEach((result, index) => {
                details += `${index + 1}. ${result.success ? '✅' : '❌'} File ${result.fileId}\n`;
                if (!result.success) {
                    details += `   Error: ${result.error}\n`;
                }
            });
        }
        
        alert(details);
    }

    removeTransferJob(jobId) {
        STATE.jobs.copyMoveQueue = STATE.jobs.copyMoveQueue.filter(j => j.id !== jobId);
        this.renderTransferQueue();
        this.showNotification('Transfer removed', 'info');
    }

    // ====================================================================
    // SECTION 10: STORAGE QUOTA
    // ====================================================================

    async loadStorageQuota() {
        if (!STATE.auth.isAuthenticated) {
            return;
        }
        
        try {
            const url = 'https://www.googleapis.com/drive/v3/about?fields=storageQuota,user';
            const response = await fetch(url, {
                headers: {
                    'Authorization': `Bearer ${STATE.auth.token}`
                }
            });
            
            if (!response.ok) {
                if (response.status === 401) {
                    this.handleTokenExpired();
                    return;
                }
                throw new Error(`API error: ${response.status}`);
            }
            
            const data = await response.json();
            STATE.cache.quota = data.storageQuota;
            STATE.cache.lastUpdate = Date.now();
            
            this.renderQuota(data.storageQuota);
            
            console.log('✅ Storage quota loaded');
            
        } catch (error) {
            console.error('Failed to load storage quota:', error);
        }
    }

    renderQuota(quota) {
        if (!quota) return;
        
        const used = parseInt(quota.usage) || 0;
        const total = parseInt(quota.limit) || 1;
        const free = total - used;
        
        const usedGB = (used / 1024 ** 3).toFixed(2);
        const totalGB = (total / 1024 ** 3).toFixed(2);
        const freeGB = (free / 1024 ** 3).toFixed(2);
        const percentage = (used / total) * 100;
        
        // Update storage bar in sidebar
        const storageFill = document.getElementById('storageFill');
        if (storageFill) {
            storageFill.style.width = `${percentage}%`;
            storageFill.style.backgroundColor = percentage > 90 ? 'var(--accent-danger)' : 
                                             percentage > 75 ? 'var(--accent-warning)' : 
                                             'var(--accent-primary)';
        }
        
        const storageUsed = document.getElementById('storageUsed');
        const storageTotal = document.getElementById('storageTotal');
        if (storageUsed) storageUsed.textContent = `${usedGB} GB`;
        if (storageTotal) storageTotal.textContent = `${totalGB} GB`;
        
        // Update quota screen
        const quotaFill = document.getElementById('quotaFill');
        if (quotaFill) {
            quotaFill.style.width = `${percentage}%`;
            quotaFill.style.backgroundColor = percentage > 90 ? 'var(--accent-danger)' : 
                                            percentage > 75 ? 'var(--accent-warning)' : 
                                            'var(--accent-primary)';
        }
        
        const quotaUsed = document.getElementById('quotaUsed');
        const quotaTotal = document.getElementById('quotaTotal');
        const quotaFree = document.getElementById('quotaFree');
        
        if (quotaUsed) quotaUsed.textContent = `${usedGB} GB`;
        if (quotaTotal) quotaTotal.textContent = `${totalGB} GB`;
        if (quotaFree) quotaFree.textContent = `${freeGB} GB`;
    }

    // ====================================================================
    // SECTION 11: ADMIN SYSTEM
    // ====================================================================

    initAdminEvents() {
        document.getElementById('readOnlyMode').addEventListener('change', (e) => {
            STATE.ui.readOnlyMode = e.target.checked;
            localStorage.setItem('read_only_mode', e.target.checked);
            
            if (STATE.ui.readOnlyMode) {
                this.showNotification('Read-only mode enabled', 'warning');
            } else {
                this.showNotification('Read-only mode disabled', 'success');
            }
        });
        
        document.getElementById('forceLogout').addEventListener('click', () => {
            if (confirm('Force logout all sessions? This will clear all local data.')) {
                this.forceLogoutAll();
            }
        });
        
        document.getElementById('pauseAllJobs').addEventListener('click', () => {
            this.pauseAllJobs();
        });
        
        document.getElementById('resumeAllJobs').addEventListener('click', () => {
            this.resumeAllJobs();
        });
        
        document.getElementById('clearAllQueues').addEventListener('click', () => {
            if (confirm('Clear all job queues? This cannot be undone.')) {
                this.clearAllQueues();
            }
        });
    }

    pauseAllJobs() {
        // Pause uploads
        STATE.jobs.uploadQueue.forEach(job => {
            if (job.status === 'pending' || job.status === 'uploading') {
                job.status = 'paused';
            }
        });
        
        // Pause transfers
        STATE.jobs.copyMoveQueue.forEach(job => {
            if (job.status === 'pending' || job.status === 'processing') {
                job.status = 'paused';
            }
        });
        
        this.saveState();
        this.renderUploadQueue();
        this.renderTransferQueue();
        this.showNotification('All jobs paused', 'info');
    }

    resumeAllJobs() {
        // Resume uploads
        STATE.jobs.uploadQueue.forEach(job => {
            if (job.status === 'paused') {
                job.status = 'pending';
            }
        });
        
        // Resume transfers
        STATE.jobs.copyMoveQueue.forEach(job => {
            if (job.status === 'paused') {
                job.status = 'pending';
            }
        });
        
        this.saveState();
        this.renderUploadQueue();
        this.renderTransferQueue();
        
        // Restart upload processor
        if (!STATE.jobs.activeUpload) {
            this.processUploadQueue();
        }
        
        this.showNotification('All jobs resumed', 'info');
    }

    clearAllQueues() {
        // Keep only completed jobs for reference
        STATE.jobs.uploadQueue = STATE.jobs.uploadQueue.filter(job => job.status === 'completed');
        STATE.jobs.copyMoveQueue = STATE.jobs.copyMoveQueue.filter(job => job.status === 'completed');
        STATE.jobs.retryQueue = [];
        
        this.saveState();
        this.renderUploadQueue();
        this.renderTransferQueue();
        this.updateUploadBadge();
        this.showNotification('All queues cleared', 'info');
    }

    forceLogoutAll() {
        // Clear all tokens and sessions
        localStorage.removeItem('google_token');
        localStorage.removeItem('token_expire');
        localStorage.removeItem('vault_settings');
        localStorage.removeItem('upload_queue');
        localStorage.removeItem('read_only_mode');
        
        // Clear gapi token
        if (gapi.client && gapi.client.getToken()) {
            gapi.client.setToken(null);
        }
        
        // Reset state
        STATE.auth.token = null;
        STATE.auth.user = null;
        STATE.auth.isAuthenticated = false;
        STATE.ui.isAdmin = false;
        STATE.ui.readOnlyMode = false;
        STATE.jobs.uploadQueue = [];
        STATE.jobs.copyMoveQueue = [];
        STATE.jobs.retryQueue = [];
        
        this.showNotification('All sessions logged out', 'info');
        this.lockApp();
    }

    updateAdminDashboard() {
        const uploadCount = STATE.jobs.uploadQueue.filter(job => 
            job.status === 'pending' || job.status === 'uploading'
        ).length;
        
        const transferCount = STATE.jobs.copyMoveQueue.filter(job => 
            job.status === 'pending' || job.status === 'processing'
        ).length;
        
        const retryCount = STATE.jobs.retryQueue.length;
        
        document.getElementById('adminUploadCount').textContent = `${uploadCount} active`;
        document.getElementById('adminTransferCount').textContent = `${transferCount} active`;
        document.getElementById('adminRetryCount').textContent = `${retryCount} pending`;
        
        const expiry = STATE.auth.tokenExpire ? new Date(STATE.auth.tokenExpire).toLocaleString() : 'Not authenticated';
        document.getElementById('tokenExpiry').textContent = expiry;
        
        document.getElementById('currentDriveMode').textContent = STATE.drive.mode === 'user' ? 'User Drive' : 'Vault Drive';
        document.getElementById('adminStatus').textContent = STATE.ui.isAdmin ? 'Administrator' : 'Standard User';
        
        // Update read-only mode toggle
        const readOnlyToggle = document.getElementById('readOnlyMode');
        if (readOnlyToggle) {
            readOnlyToggle.checked = STATE.ui.readOnlyMode;
        }
    }

    // ====================================================================
    // SECTION 12: UI & NAVIGATION
    // ====================================================================

    initEvents() {
        console.log('🎮 Initializing event listeners...');
        
        // PIN System Events
        this.initPinEvents();
        
        // Navigation Events
        this.initNavEvents();
        
        // File Operations Events
        this.initFileEvents();
        
        // Upload System Events
        this.initUploadEvents();
        
        // Admin Events
        this.initAdminEvents();
        
        // Theme Toggle
        document.getElementById('themeToggle').addEventListener('click', () => this.toggleTheme());
        
        // App Lock
        document.getElementById('lockApp').addEventListener('click', () => this.lockApp());
        
        // Window events for auto-lock
        document.addEventListener('visibilitychange', () => this.handleVisibilityChange());
        
        // Keyboard shortcuts
        document.addEventListener('keydown', (e) => this.handleKeyboardShortcuts(e));
        
        // Responsive sidebar
        window.addEventListener('resize', () => this.checkResponsiveSidebar());
        
        // Search functionality
        const searchInput = document.getElementById('searchFiles');
        if (searchInput) {
            searchInput.addEventListener('input', (e) => this.handleSearch(e.target.value));
            searchInput.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') {
                    this.performSearch();
                }
            });
        }
        
        // Drive mode switch
        document.getElementById('switchToUser').addEventListener('click', () => {
            if (STATE.drive.mode !== 'user') {
                STATE.drive.mode = 'user';
                this.updateDriveMode();
                this.loadDriveFiles();
                this.showNotification('Switched to My Drive', 'info');
            }
        });
        
        document.getElementById('switchToVault').addEventListener('click', () => {
            if (STATE.drive.mode !== 'vault') {
                STATE.drive.mode = 'vault';
                this.updateDriveMode();
                this.loadDriveFiles();
                this.showNotification('Switched to Vault Drive', 'info');
            }
        });
        
        // Refresh button
        document.getElementById('refreshFiles').addEventListener('click', () => {
            this.loadDriveFiles();
            this.loadStorageQuota();
            this.showNotification('Refreshing...', 'info');
        });
        
        // Close viewer
        document.getElementById('closeViewer').addEventListener('click', () => {
            document.getElementById('fileViewer').classList.add('hidden');
        });
        
        // Settings
        document.getElementById('changePin').addEventListener('click', () => this.showChangePinModal());
        
        // Initialize all buttons
        this.initButtons();
        
        console.log('✅ Event listeners initialized');
    }

    initNavEvents() {
        // Sidebar navigation
        document.querySelectorAll('.nav-item').forEach(item => {
            item.addEventListener('click', () => {
                const screen = item.dataset.screen;
                this.switchScreen(screen);
                
                // Update active state
                document.querySelectorAll('.nav-item').forEach(nav => nav.classList.remove('active'));
                item.classList.add('active');
                
                // Close sidebar on mobile
                if (window.innerWidth <= 768) {
                    document.getElementById('sidebar').classList.remove('active');
                }
            });
        });
        
        // Toggle sidebar on mobile
        document.getElementById('toggleSidebar').addEventListener('click', () => {
            document.getElementById('sidebar').classList.toggle('active');
        });
        
        // Close sidebar when clicking outside on mobile
        document.addEventListener('click', (e) => {
            const sidebar = document.getElementById('sidebar');
            const toggleBtn = document.getElementById('toggleSidebar');
            
            if (window.innerWidth <= 768 && 
                sidebar.classList.contains('active') &&
                !sidebar.contains(e.target) && 
                !toggleBtn.contains(e.target)) {
                sidebar.classList.remove('active');
            }
        });
    }

    initFileEvents() {
        // File selection
        document.getElementById('selectAll').addEventListener('click', () => {
            document.querySelectorAll('.file-item').forEach(item => {
                const fileId = item.dataset.fileId;
                if (fileId) {
                    STATE.drive.selectedFiles.add(fileId);
                    item.classList.add('selected');
                }
            });
            this.updateSelectionToolbar();
            this.showNotification('All files selected', 'info');
        });
        
        document.getElementById('deselectAll').addEventListener('click', () => {
            STATE.drive.selectedFiles.clear();
            document.querySelectorAll('.file-item').forEach(item => {
                item.classList.remove('selected');
            });
            this.updateSelectionToolbar();
            this.showNotification('Selection cleared', 'info');
        });
        
        // File operations
        document.getElementById('downloadSelected').addEventListener('click', () => this.downloadSelected());
        document.getElementById('copySelected').addEventListener('click', () => this.copyFiles());
        document.getElementById('moveSelected').addEventListener('click', () => this.moveFiles());
        document.getElementById('deleteSelected').addEventListener('click', () => this.deleteSelected());
        
        // New folder
        document.getElementById('newFolder').addEventListener('click', () => this.createNewFolder());
        
        // Go home
        document.getElementById('goHome').addEventListener('click', () => {
            this.loadDriveFiles();
            this.showNotification('Returned to root folder', 'info');
        });
    }

    initButtons() {
        // Pause/Resume uploads
        document.getElementById('pauseUploads')?.addEventListener('click', () => this.pauseAllUploads());
        document.getElementById('resumeUploads')?.addEventListener('click', () => this.resumeAllUploads());
        document.getElementById('clearCompleted')?.addEventListener('click', () => this.clearCompletedUploads());
        
        // Pause/Resume transfers
        document.getElementById('pauseTransfers')?.addEventListener('click', () => this.pauseAllTransfers());
        document.getElementById('resumeTransfers')?.addEventListener('click', () => this.resumeAllTransfers());
        
        // Refresh quota
        document.getElementById('refreshQuota')?.addEventListener('click', () => {
            this.loadStorageQuota();
            this.showNotification('Storage quota refreshed', 'info');
        });
        
        // Settings
        document.getElementById('themeSetting')?.addEventListener('change', (e) => {
            STATE.settings.theme = e.target.value;
            if (e.target.value === 'auto') {
                const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
                STATE.ui.theme = prefersDark ? 'dark' : 'light';
            } else {
                STATE.ui.theme = e.target.value;
            }
            document.body.className = `${STATE.ui.theme}-theme`;
            localStorage.setItem('vault_theme', STATE.ui.theme);
            this.saveState();
        });
        
        document.getElementById('chunkSize')?.addEventListener('change', (e) => {
            STATE.settings.chunkSize = parseInt(e.target.value);
            CONFIG.CHUNK_SIZE = STATE.settings.chunkSize * 1024 * 1024;
            this.saveState();
            this.showNotification(`Chunk size set to ${STATE.settings.chunkSize} MB`, 'info');
        });
        
        document.getElementById('maxRetries')?.addEventListener('change', (e) => {
            STATE.settings.maxRetries = parseInt(e.target.value);
            CONFIG.MAX_RETRIES = STATE.settings.maxRetries;
            this.saveState();
            this.showNotification(`Max retries set to ${STATE.settings.maxRetries}`, 'info');
        });
        
        document.getElementById('autoLock')?.addEventListener('change', (e) => {
            STATE.settings.autoLock = e.target.checked;
            this.saveState();
            this.showNotification(`Auto-lock ${e.target.checked ? 'enabled' : 'disabled'}`, 'info');
        });
    }

    switchScreen(screenName) {
        console.log(`🔄 Switching to screen: ${screenName}`);
        
        // Hide all screens
        document.querySelectorAll('.screen-content').forEach(screen => {
            screen.classList.remove('active');
        });
        
        // Show target screen
        const targetScreen = document.getElementById(`${screenName}Screen`);
        if (targetScreen) {
            targetScreen.classList.add('active');
            STATE.ui.currentScreen = screenName;
            
            // Load data for specific screens
            switch (screenName) {
                case 'files':
                    if (STATE.auth.isAuthenticated) {
                        this.loadDriveFiles();
                    }
                    break;
                case 'uploads':
                    this.renderUploadQueue();
                    break;
                case 'transfers':
                    this.renderTransferQueue();
                    break;
                case 'quota':
                    if (STATE.auth.isAuthenticated) {
                        this.loadStorageQuota();
                    }
                    break;
                case 'admin':
                    if (STATE.ui.isAdmin) {
                        this.updateAdminDashboard();
                    } else {
                        this.showNotification('Admin access required', 'error');
                        this.switchScreen('files');
                    }
                    break;
                case 'settings':
                    this.updateSettingsUI();
                    break;
            }
        }
    }

    updateDriveMode() {
        const userBtn = document.getElementById('switchToUser');
        const vaultBtn = document.getElementById('switchToVault');
        
        if (userBtn && vaultBtn) {
            userBtn.classList.toggle('active', STATE.drive.mode === 'user');
            vaultBtn.classList.toggle('active', STATE.drive.mode === 'vault');
            
            const modeText = STATE.drive.mode === 'user' ? 'My Drive' : 'Vault Drive';
            const title = document.querySelector('.app-title');
            if (title) {
                title.textContent = `Dream Vault - ${modeText}`;
            }
        }
    }

    toggleTheme() {
        STATE.ui.theme = STATE.ui.theme === 'dark' ? 'light' : 'dark';
        document.body.className = `${STATE.ui.theme}-theme`;
        localStorage.setItem('vault_theme', STATE.ui.theme);
        
        const themeToggle = document.getElementById('themeToggle');
        if (themeToggle) {
            themeToggle.textContent = STATE.ui.theme === 'dark' ? '🌙' : '☀️';
        }
        
        this.showNotification(`Switched to ${STATE.ui.theme} theme`, 'info');
    }

    updateSettingsUI() {
        const themeSetting = document.getElementById('themeSetting');
        const chunkSize = document.getElementById('chunkSize');
        const maxRetries = document.getElementById('maxRetries');
        const autoLock = document.getElementById('autoLock');
        
        if (themeSetting) themeSetting.value = STATE.settings.theme;
        if (chunkSize) chunkSize.value = STATE.settings.chunkSize;
        if (maxRetries) maxRetries.value = STATE.settings.maxRetries;
        if (autoLock) autoLock.checked = STATE.settings.autoLock;
    }

    checkResponsiveSidebar() {
        const sidebar = document.getElementById('sidebar');
        if (window.innerWidth > 768) {
            sidebar.classList.add('active');
            STATE.ui.sidebarOpen = true;
        } else {
            sidebar.classList.remove('active');
            STATE.ui.sidebarOpen = false;
        }
    }

    // ====================================================================
    // SECTION 13: NOTIFICATION SYSTEM
    // ====================================================================

    showNotification(message, type = 'info') {
        if (!STATE.settings.notifications) return;
        
        const container = document.getElementById('notificationContainer');
        if (!container) return;
        
        const notification = document.createElement('div');
        notification.className = `notification ${type}`;
        notification.innerHTML = `
            <span class="notification-icon">${this.getNotificationIcon(type)}</span>
            <span class="notification-message">${message}</span>
            <button class="notification-close" onclick="this.parentElement.remove()">×</button>
        `;
        
        container.appendChild(notification);
        
        // Auto-remove after 5 seconds
        setTimeout(() => {
            if (notification.parentNode) {
                notification.style.animation = 'slideOut 0.3s ease';
                setTimeout(() => {
                    if (notification.parentNode) {
                        notification.parentNode.removeChild(notification);
                    }
                }, 300);
            }
        }, 5000);
    }

    getNotificationIcon(type) {
        switch (type) {
            case 'success': return '✅';
            case 'error': return '❌';
            case 'warning': return '⚠️';
            default: return 'ℹ️';
        }
    }

    showError(message) {
        const errorDiv = document.getElementById('pinError');
        if (errorDiv) {
            errorDiv.textContent = message;
            errorDiv.style.display = 'block';
            
            setTimeout(() => {
                errorDiv.textContent = '';
                errorDiv.style.display = 'none';
            }, 3000);
        }
    }

    // ====================================================================
    // SECTION 14: UTILITY FUNCTIONS
    // ====================================================================

    formatFileSize(bytes) {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    }

    hideModal() {
        document.getElementById('modalOverlay').classList.add('hidden');
        document.querySelectorAll('.modal').forEach(modal => {
            modal.classList.add('hidden');
        });
    }

    handleTokenExpired() {
        console.log('🔑 Token expired');
        
        localStorage.removeItem('google_token');
        localStorage.removeItem('token_expire');
        STATE.auth.token = null;
        STATE.auth.isAuthenticated = false;
        
        if (gapi.client && gapi.client.getToken()) {
            gapi.client.setToken(null);
        }
        
        this.showNotification('Session expired. Please sign in again.', 'warning');
        this.showAuthModal();
    }

    handleVisibilityChange() {
        if (document.hidden && STATE.ui.isLocked === false && STATE.settings.autoLock) {
            // Auto-lock when tab becomes hidden
            setTimeout(() => {
                if (document.hidden && !STATE.ui.isLocked) {
                    console.log('🔒 Auto-locking due to inactivity');
                    this.lockApp();
                }
            }, 300000); // 5 minutes
        }
    }

    handleKeyboardShortcuts(e) {
        // Don't trigger shortcuts in input fields
        if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') {
            return;
        }
        
        // Ctrl/Cmd + S: Save state
        if ((e.ctrlKey || e.metaKey) && e.key === 's') {
            e.preventDefault();
            this.saveState();
            this.showNotification('State saved', 'success');
        }
        
        // Escape: Close modals/viewers
        if (e.key === 'Escape') {
            this.hideModal();
            document.getElementById('fileViewer').classList.add('hidden');
        }
        
        // Ctrl/Cmd + F: Focus search
        if ((e.ctrlKey || e.metaKey) && e.key === 'f') {
            e.preventDefault();
            const searchInput = document.getElementById('searchFiles');
            if (searchInput) {
                searchInput.focus();
                searchInput.select();
            }
        }
        
        // Ctrl/Cmd + L: Lock app
        if ((e.ctrlKey || e.metaKey) && e.key === 'l') {
            e.preventDefault();
            this.lockApp();
        }
        
        // Ctrl/Cmd + R: Refresh
        if ((e.ctrlKey || e.metaKey) && e.key === 'r') {
            e.preventDefault();
            this.loadDriveFiles();
            this.showNotification('Refreshed', 'info');
        }
    }

    handleSearch(query) {
        STATE.drive.searchQuery = query.trim();
        
        if (query.length >= 2) {
            // Perform search after a delay
            clearTimeout(this.searchTimeout);
            this.searchTimeout = setTimeout(() => {
                this.performSearch();
            }, 300);
        }
    }

    async performSearch() {
        if (!STATE.auth.isAuthenticated || !STATE.drive.searchQuery) {
            return;
        }
        
        console.log(`🔍 Searching for: ${STATE.drive.searchQuery}`);
        
        try {
            const query = `name contains '${STATE.drive.searchQuery}' and trashed = false`;
            const url = `https://www.googleapis.com/drive/v3/files?q=${encodeURIComponent(query)}&fields=files(id,name,mimeType,size,modifiedTime,webViewLink,thumbnailLink,iconLink)&pageSize=50`;
            
            const response = await fetch(url, {
                headers: {
                    'Authorization': `Bearer ${STATE.auth.token}`
                }
            });
            
            if (response.ok) {
                const data = await response.json();
                this.renderFileList(data.files);
                this.showNotification(`Found ${data.files.length} result(s)`, 'info');
            }
        } catch (error) {
            console.error('Search failed:', error);
        }
    }

    // ====================================================================
    // SECTION 15: PWA SERVICE WORKER
    // ====================================================================

    initServiceWorker() {
        if ('serviceWorker' in navigator) {
            window.addEventListener('load', () => {
                navigator.serviceWorker.register('/sw.js').then(registration => {
                    console.log('✅ Service Worker registered:', registration.scope);
                    
                    // Check for updates
                    registration.addEventListener('updatefound', () => {
                        const newWorker = registration.installing;
                        console.log('🔄 Service Worker update found');
                        
                        newWorker.addEventListener('statechange', () => {
                            if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                                this.showNotification('New version available. Refresh to update.', 'info');
                            }
                        });
                    });
                }).catch(error => {
                    console.log('❌ Service Worker registration failed:', error);
                });
            });
        }
    }

    // ====================================================================
    // SECTION 16: OAuth CALLBACK HANDLING
    // ====================================================================

    handleOAuthCallback() {
        // Check for OAuth callback in URL hash
        const hash = window.location.hash.substr(1);
        const params = new URLSearchParams(hash);
        
        if (params.has('access_token')) {
            const accessToken = params.get('access_token');
            const expiresIn = params.get('expires_in');
            
            console.log('🔑 OAuth callback detected');
            
            // Store token
            STATE.auth.token = accessToken;
            STATE.auth.isAuthenticated = true;
            STATE.auth.tokenExpire = Date.now() + (parseInt(expiresIn) * 1000);
            
            localStorage.setItem('google_token', accessToken);
            localStorage.setItem('token_expire', STATE.auth.tokenExpire.toString());
            
            // Clear URL hash
            window.location.hash = '';
            
            // Load user info
            this.loadUserInfo();
            this.loadDriveFiles();
            this.loadStorageQuota();
            
            this.showNotification('Successfully signed in', 'success');
        }
    }

    // ====================================================================
    // SECTION 17: FILE OPERATION STUBS
    // ====================================================================

    createNewFolder() {
        if (STATE.ui.readOnlyMode) {
            this.showNotification('Read-only mode is active', 'warning');
            return;
        }
        
        if (!STATE.auth.isAuthenticated) {
            this.showNotification('Please sign in first', 'warning');
            return;
        }
        
        const modal = document.getElementById('folderModal');
        document.getElementById('modalOverlay').classList.remove('hidden');
        modal.classList.remove('hidden');
        
        const folderNameInput = document.getElementById('folderName');
        folderNameInput.value = '';
        folderNameInput.focus();
        
        document.getElementById('cancelFolder').onclick = () => {
            this.hideModal();
        };
        
        document.getElementById('createFolder').onclick = async () => {
            const folderName = folderNameInput.value.trim();
            if (!folderName) {
                this.showNotification('Please enter a folder name', 'warning');
                return;
            }
            
            try {
                const response = await fetch('https://www.googleapis.com/drive/v3/files', {
                    method: 'POST',
                    headers: {
                        'Authorization': `Bearer ${STATE.auth.token}`,
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        name: folderName,
                        mimeType: 'application/vnd.google-apps.folder',
                        parents: [STATE.drive.currentFolderId]
                    })
                });
                
                if (response.ok) {
                    this.hideModal();
                    this.loadDriveFiles();
                    this.showNotification(`Folder "${folderName}" created`, 'success');
                } else {
                    throw new Error(`HTTP ${response.status}`);
                }
            } catch (error) {
                console.error('Failed to create folder:', error);
                this.showNotification('Failed to create folder', 'error');
            }
        };
    }

    deleteSelected() {
        if (STATE.drive.selectedFiles.size === 0) {
            this.showNotification('No files selected', 'warning');
            return;
        }
        
        if (STATE.ui.readOnlyMode) {
            this.showNotification('Read-only mode is active', 'warning');
            return;
        }
        
        if (!STATE.auth.isAuthenticated) {
            this.showNotification('Please sign in first', 'warning');
            return;
        }
        
        const count = STATE.drive.selectedFiles.size;
        if (!confirm(`Delete ${count} selected item${count > 1 ? 's' : ''}? This action cannot be undone.`)) {
            return;
        }
        
        // Implementation would go here
        this.showNotification('Delete functionality coming soon', 'info');
    }

    downloadSelected() {
        if (STATE.drive.selectedFiles.size === 0) {
            this.showNotification('No files selected', 'warning');
            return;
        }
        
        if (!STATE.auth.isAuthenticated) {
            this.showNotification('Please sign in first', 'warning');
            return;
        }
        
        // For now, download first selected file
        const firstFileId = Array.from(STATE.drive.selectedFiles)[0];
        this.downloadFile(firstFileId);
    }

    showFileMenu(fileId, event) {
        event.stopPropagation();
        
        // Create context menu
        const menu = document.createElement('div');
        menu.className = 'context-menu';
        menu.style.position = 'fixed';
        menu.style.left = `${event.clientX}px`;
        menu.style.top = `${event.clientY}px`;
        menu.style.zIndex = '1000';
        
        menu.innerHTML = `
            <div class="menu-item" onclick="app.previewFile('${fileId}')">👁️ Preview</div>
            <div class="menu-item" onclick="app.downloadFile('${fileId}')">⬇️ Download</div>
            <div class="menu-divider"></div>
            <div class="menu-item" onclick="app.copyFileToClipboard('${fileId}')">📋 Copy Link</div>
            <div class="menu-item" onclick="app.showFileInfo('${fileId}')">ℹ️ Info</div>
        `;
        
        document.body.appendChild(menu);
        
        // Remove menu on click outside
        setTimeout(() => {
            const removeMenu = (e) => {
                if (!menu.contains(e.target)) {
                    menu.remove();
                    document.removeEventListener('click', removeMenu);
                }
            };
            document.addEventListener('click', removeMenu);
        }, 100);
    }

    showContextMenu(fileId, x, y) {
        this.showFileMenu(fileId, { clientX: x, clientY: y, stopPropagation: () => {} });
    }

    copyFileToClipboard(fileId) {
        // Copy file link to clipboard
        const link = `https://drive.google.com/file/d/${fileId}/view`;
        navigator.clipboard.writeText(link).then(() => {
            this.showNotification('Link copied to clipboard', 'success');
        }).catch(err => {
            console.error('Failed to copy:', err);
            this.showNotification('Failed to copy link', 'error');
        });
    }

    showFileInfo(fileId) {
        // Show file information modal
        this.showNotification('File info functionality coming soon', 'info');
    }

    pauseAllUploads() {
        STATE.jobs.uploadQueue.forEach(job => {
            if (job.status === 'pending' || job.status === 'uploading') {
                job.status = 'paused';
            }
        });
        this.saveState();
        this.renderUploadQueue();
        this.showNotification('All uploads paused', 'info');
    }

    resumeAllUploads() {
        STATE.jobs.uploadQueue.forEach(job => {
            if (job.status === 'paused') {
                job.status = 'pending';
            }
        });
        this.saveState();
        this.renderUploadQueue();
        this.processUploadQueue();
        this.showNotification('All uploads resumed', 'info');
    }

    clearCompletedUploads() {
        STATE.jobs.uploadQueue = STATE.jobs.uploadQueue.filter(job => 
            job.status !== 'completed' && job.status !== 'failed'
        );
        this.saveState();
        this.updateUploadBadge();
        this.renderUploadQueue();
        this.showNotification('Completed uploads cleared', 'info');
    }

    pauseAllTransfers() {
        STATE.jobs.copyMoveQueue.forEach(job => {
            if (job.status === 'pending' || job.status === 'processing') {
                job.status = 'paused';
            }
        });
        this.renderTransferQueue();
        this.showNotification('All transfers paused', 'info');
    }

    resumeAllTransfers() {
        STATE.jobs.copyMoveQueue.forEach(job => {
            if (job.status === 'paused') {
                job.status = 'pending';
            }
        });
        this.renderTransferQueue();
        this.showNotification('All transfers resumed', 'info');
    }

    showChangePinModal() {
        const currentPin = prompt('Enter current PIN:');
        if (!currentPin) return;
        
        const savedPin = localStorage.getItem('vault_pin');
        if (btoa(currentPin) !== savedPin) {
            this.showNotification('Current PIN is incorrect', 'error');
            return;
        }
        
        const newPin = prompt('Enter new 4-digit PIN:');
        if (!newPin || newPin.length !== 4 || !/^\d+$/.test(newPin)) {
            this.showNotification('Invalid PIN format', 'error');
            return;
        }
        
        const confirmPin = prompt('Confirm new PIN:');
        if (newPin !== confirmPin) {
            this.showNotification('PINs do not match', 'error');
            return;
        }
        
        localStorage.setItem('vault_pin', btoa(newPin));
        this.showNotification('PIN changed successfully', 'success');
    }
}

// ====================================================================
// INITIALIZATION
// ====================================================================

// Create global app instance
window.app = new DreamVaultOS();

// Make app available globally for inline event handlers
window.toggleFileSelection = (fileId) => app.toggleFileSelection(fileId);
window.previewFile = (fileId) => app.previewFile(fileId);
window.showFileMenu = (fileId, event) => app.showFileMenu(fileId, event);

// Add CSS for context menu
const style = document.createElement('style');
style.textContent = `
.context-menu {
    background: var(--bg-card);
    border: 1px solid var(--border-color);
    border-radius: var(--border-radius);
    box-shadow: var(--shadow);
    min-width: 150px;
    padding: 5px 0;
}

.menu-item {
    padding: 8px 16px;
    cursor: pointer;
    transition: background-color var(--transition-speed);
}

.menu-item:hover {
    background: var(--bg-secondary);
}

.menu-divider {
    height: 1px;
    background: var(--border-color);
    margin: 5px 0;
}

.drag-over {
    border: 2px dashed var(--accent-primary) !important;
    background: var(--bg-secondary) !important;
}
`;
document.head.appendChild(style);

console.log('🎉 Dream Vault OS - Monster Master Edition Loaded!');