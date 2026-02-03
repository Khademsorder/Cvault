// ==================== VAULT OS v4.0 - PRODUCTION READY ====================
// ALL SYSTEMS INTEGRATED: Google Drive, Firebase, IndexDB, Media Proxy, Chunk Upload

// ==================== CONFIGURATION ====================
const CONFIG = {
    // Google OAuth
    googleOAuth: {
        clientId: "318681315152-65e9kofptt4c3bk3kmlj9gmksnasu347.apps.googleusercontent.com",
        scope: "https://www.googleapis.com/auth/drive.file https://www.googleapis.com/auth/drive.readonly https://www.googleapis.com/auth/drive.metadata.readonly",
        redirectURI: window.location.origin + window.location.pathname,
        authEndpoint: "https://accounts.google.com/o/oauth2/v2/auth",
        tokenInfoEndpoint: "https://oauth2.googleapis.com/tokeninfo"
    },
    
    // Google Drive
    drive: {
        apiVersion: "v3",
        rootFolderId: "1zIyinAqjQv96QBSuanFS2F0USaG66GPn",
        uploadEndpoint: "https://www.googleapis.com/upload/drive/v3/files",
        aboutEndpoint: "https://www.googleapis.com/drive/v3/about",
        chunkSize: 5 * 1024 * 1024, // 5MB chunks
        maxFileSize: 10 * 1024 * 1024 * 1024 // 10GB
    },
    
    // Firebase
    firebase: {
        apiKey: "AIzaSyB3Iy1MIbfmJ7h5rv9NlsT23ysedCwUZt4",
        authDomain: "encrypted-vault-4683d.firebaseapp.com",
        projectId: "encrypted-vault-4683d",
        storageBucket: "encrypted-vault-4683d.appspot.com",
        messagingSenderId: "851257263743",
        appId: "1:851257263743:web:e0d16606bd06f692f5e14a",
        databaseURL: "https://encrypted-vault-4683d-default-rtdb.firebaseio.com"
    },
    
    // Media Proxies
    mediaProxies: {
        readOnly: "https://script.google.com/macros/s/AKfycby2hqAq0JePMbnjEbwwcPBFjS14lvS3pM2Z1PPgY4OraTcpvTmZFPKQr9CQ4vba4Xk7/exec",
        fullAccess: "https://script.google.com/macros/s/AKfycbxQF58gDxHBATrBvliuMc_SdP7PEiuN6fiHdzVKG7_K5FIrj3V2m8imWgPXTjmVqfnN/exec"
    },
    
    // Security
    security: {
        pinLength: 4,
        maxAttempts: 5,
        lockoutMinutes: 5,
        sessionHours: 24,
        tokenRefreshMinutes: 50
    },
    
    // App Settings
    app: {
        maxConcurrentUploads: 2,
        thumbnailSize: 200,
        cacheTTL: 24 * 60 * 60 * 1000, // 24 hours
        offlineCacheLimit: 100 * 1024 * 1024 // 100MB
    }
};

// ==================== GLOBAL STATE ====================
const state = {
    // Authentication
    authStatus: 'locked', // locked | unlocked | google_connected
    pinHash: localStorage.getItem('vault_pin_hash'),
    pinAttempts: parseInt(localStorage.getItem('pin_attempts')) || 0,
    lockoutUntil: parseInt(localStorage.getItem('lockout_until')) || null,
    sessionStart: parseInt(localStorage.getItem('session_start')) || null,
    
    // Google
    accessToken: localStorage.getItem('drive_access_token'),
    tokenExpiry: parseInt(localStorage.getItem('token_expiry')) || null,
    userProfile: JSON.parse(localStorage.getItem('user_profile')) || null,
    
    // File Management
    currentFolder: CONFIG.drive.rootFolderId,
    folderStack: [],
    folderTree: [],
    fileList: [],
    selectedFiles: new Set(),
    searchQuery: '',
    sortBy: 'name',
    sortOrder: 'asc',
    
    // Upload System
    uploadQueue: [],
    activeUploads: 0,
    uploadProgress: new Map(),
    
    // UI State
    settings: {
        theme: localStorage.getItem('theme') || 'cyber',
        view: localStorage.getItem('view') || 'grid',
        driveMode: localStorage.getItem('drive_mode') || 'vault',
        autoSync: localStorage.getItem('auto_sync') !== 'false',
        offlineMode: localStorage.getItem('offline_mode') === 'true'
    },
    
    // Storage Info
    storageInfo: {
        total: 0,
        used: 0,
        free: 0,
        percentage: 0
    },
    
    // Databases
    db: null, // IndexedDB
    firebaseApp: null,
    firebaseDB: null,
    
    // Network
    isOnline: navigator.onLine,
    syncInterval: null
};

// ==================== INDEXEDDB CACHE ====================
class CacheDB {
    constructor() {
        this.db = null;
        this.init();
    }
    
    async init() {
        return new Promise((resolve, reject) => {
            const request = indexedDB.open('VaultCache', 2);
            
            request.onerror = () => {
                console.error('IndexedDB failed');
                reject(request.error);
            };
            
            request.onsuccess = (event) => {
                this.db = event.target.result;
                resolve(this.db);
            };
            
            request.onupgradeneeded = (event) => {
                const db = event.target.result;
                
                // Files cache
                if (!db.objectStoreNames.contains('files')) {
                    const store = db.createObjectStore('files', { keyPath: 'id' });
                    store.createIndex('folderId', 'folderId');
                    store.createIndex('timestamp', 'timestamp');
                    store.createIndex('type', 'type');
                }
                
                // Thumbnails cache
                if (!db.objectStoreNames.contains('thumbnails')) {
                    const store = db.createObjectStore('thumbnails', { keyPath: 'fileId' });
                    store.createIndex('timestamp', 'timestamp');
                }
                
                // Metadata cache
                if (!db.objectStoreNames.contains('metadata')) {
                    db.createObjectStore('metadata', { keyPath: 'key' });
                }
            };
        });
    }
    
    async getFiles(folderId) {
        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction(['files'], 'readonly');
            const store = transaction.objectStore('files');
            const index = store.index('folderId');
            const request = index.getAll(folderId);
            
            request.onsuccess = () => resolve(request.result || []);
            request.onerror = () => reject(request.error);
        });
    }
    
    async saveFiles(folderId, files) {
        const transaction = this.db.transaction(['files'], 'readwrite');
        const store = transaction.objectStore('files');
        
        // Remove old files from this folder
        const index = store.index('folderId');
        const oldFiles = await new Promise(resolve => {
            const request = index.getAll(folderId);
            request.onsuccess = () => resolve(request.result);
        });
        
        oldFiles.forEach(file => store.delete(file.id));
        
        // Save new files
        const timestamp = Date.now();
        files.forEach(file => {
            store.put({
                ...file,
                folderId,
                timestamp,
                cached: true
            });
        });
        
        // Update metadata
        const metaTransaction = this.db.transaction(['metadata'], 'readwrite');
        const metaStore = metaTransaction.objectStore('metadata');
        metaStore.put({
            key: `folder_${folderId}_updated`,
            value: timestamp
        });
    }
    
    async getThumbnail(fileId) {
        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction(['thumbnails'], 'readonly');
            const store = transaction.objectStore('thumbnails');
            const request = store.get(fileId);
            
            request.onsuccess = () => resolve(request.result);
            request.onerror = () => reject(request.error);
        });
    }
    
    async saveThumbnail(fileId, thumbnailBlob) {
        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction(['thumbnails'], 'readwrite');
            const store = transaction.objectStore('thumbnails');
            
            // Clean old thumbnails if limit exceeded
            this.cleanupThumbnails();
            
            const record = {
                fileId,
                thumbnail: thumbnailBlob,
                timestamp: Date.now()
            };
            
            const request = store.put(record);
            request.onsuccess = () => resolve();
            request.onerror = () => reject(request.error);
        });
    }
    
    async cleanupThumbnails() {
        const transaction = this.db.transaction(['thumbnails'], 'readwrite');
        const store = transaction.objectStore('thumbnails');
        const index = store.index('timestamp');
        const request = index.getAll();
        
        request.onsuccess = () => {
            const thumbnails = request.result;
            if (thumbnails.length > 100) { // Keep last 100 thumbnails
                const toDelete = thumbnails.slice(0, thumbnails.length - 100);
                toDelete.forEach(thumb => store.delete(thumb.fileId));
            }
        };
    }
}

// ==================== UTILITIES ====================
const utils = {
    // Security
    async hashPin(pin) {
        const encoder = new TextEncoder();
        const data = encoder.encode(pin + 'vault_salt');
        const hashBuffer = await crypto.subtle.digest('SHA-256', data);
        const hashArray = Array.from(new Uint8Array(hashBuffer));
        return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
    },
    
    async verifyPin(pin, storedHash) {
        const hash = await this.hashPin(pin);
        return hash === storedHash;
    },
    
    // Formatting
    formatFileSize(bytes) {
        if (!bytes || bytes === 0) return '0 Bytes';
        const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
        const i = Math.floor(Math.log(bytes) / Math.log(1024));
        return parseFloat((bytes / Math.pow(1024, i)).toFixed(2)) + ' ' + sizes[i];
    },
    
    formatDate(dateString) {
        try {
            const date = new Date(dateString);
            return new Intl.DateTimeFormat('bn-BD', {
                year: 'numeric',
                month: 'short',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
            }).format(date);
        } catch {
            return '-';
        }
    },
    
    getFileIcon(file) {
        const isFolder = file.mimeType === 'application/vnd.google-apps.folder';
        if (isFolder) return '📁';
        
        const mime = file.mimeType;
        const ext = file.name.split('.').pop().toLowerCase();
        
        const iconMap = {
            // Images
            'image/': '🖼️',
            // Videos
            'video/': '🎬',
            // Audio
            'audio/': '🎵',
            // Documents
            'application/pdf': '📕',
            'application/msword': '📝',
            'application/vnd.openxmlformats-officedocument.wordprocessingml.document': '📝',
            'application/vnd.ms-excel': '📊',
            'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': '📊',
            // Text
            'text/': '📄',
            // Archives
            'application/zip': '🗜️',
            'application/x-rar-compressed': '🗜️',
            'application/x-7z-compressed': '🗜️'
        };
        
        for (const [key, icon] of Object.entries(iconMap)) {
            if (mime.startsWith(key)) return icon;
        }
        
        return '📄';
    },
    
    // Thumbnail Generation
    async generateThumbnail(file, maxSize = 200) {
        return new Promise((resolve, reject) => {
            if (!file.type.startsWith('image/')) {
                resolve(null);
                return;
            }
            
            const reader = new FileReader();
            reader.onload = (e) => {
                const img = new Image();
                img.onload = () => {
                    const canvas = document.createElement('canvas');
                    let width = img.width;
                    let height = img.height;
                    
                    if (width > height) {
                        if (width > maxSize) {
                            height *= maxSize / width;
                            width = maxSize;
                        }
                    } else {
                        if (height > maxSize) {
                            width *= maxSize / height;
                            height = maxSize;
                        }
                    }
                    
                    canvas.width = width;
                    canvas.height = height;
                    
                    const ctx = canvas.getContext('2d');
                    ctx.drawImage(img, 0, 0, width, height);
                    
                    canvas.toBlob(resolve, 'image/jpeg', 0.7);
                };
                img.src = e.target.result;
            };
            reader.readAsDataURL(file);
        });
    },
    
    // Toast System
    showToast(message, type = 'info', duration = 4000) {
        const container = document.getElementById('toastContainer');
        if (!container) return;
        
        const toastId = 'toast-' + Date.now();
        const toast = document.createElement('div');
        toast.id = toastId;
        toast.className = `toast toast-${type}`;
        toast.innerHTML = `
            <div class="toast-content">
                <div class="toast-icon">${type === 'success' ? '✅' : type === 'error' ? '❌' : 'ℹ️'}</div>
                <div class="toast-message">${message}</div>
            </div>
            <button class="toast-close" onclick="document.getElementById('${toastId}').remove()">×</button>
        `;
        
        container.appendChild(toast);
        
        setTimeout(() => {
            const element = document.getElementById(toastId);
            if (element) element.remove();
        }, duration);
    },
    
    // Error Handling
    async handleError(error, context) {
        console.error(`[${context}]`, error);
        
        let message = 'একটি সমস্যা হয়েছে';
        
        if (error.status === 401) {
            message = 'অনুমতি শেষ হয়েছে। আবার লগইন করুন।';
            authManager.lockVault();
        } else if (error.status === 403) {
            message = 'এই কাজের জন্য অনুমতি নেই।';
        } else if (error.status === 429) {
            message = 'বেশি রিকুয়েস্ট পাঠানো হয়েছে। কিছুক্ষণ পরে চেষ্টা করুন।';
        } else if (error.message?.includes('network') || error.message?.includes('fetch')) {
            message = 'নেটওয়ার্ক সমস্যা। ইন্টারনেট চেক করুন।';
        } else if (error.message?.includes('quota')) {
            message = 'স্টোরেজ ফুল। কিছু ফাইল মুছুন।';
        }
        
        this.showToast(message, 'error');
        
        // Log to Firebase
        if (state.firebaseDB) {
            try {
                await firebase.database(state.firebaseDB).ref('errors').push({
                    context,
                    message: error.message,
                    timestamp: Date.now(),
                    user: state.userProfile?.email || 'unknown'
                });
            } catch (logError) {
                console.error('Error logging failed:', logError);
            }
        }
    }
};

// ==================== AUTH MANAGER ====================
const authManager = {
    currentPin: '',
    
    init() {
        console.log('🔐 Auth Manager Initializing');
        
        // Load saved state
        this.loadSession();
        
        // Setup listeners
        this.setupListeners();
        
        // Check OAuth redirect
        this.checkOAuthRedirect();
        
        // Initialize Firebase
        this.initFirebase();
        
        // Update UI
        this.updateAuthUI();
        
        // Start session monitor
        this.startSessionMonitor();
    },
    
    setupListeners() {
        // PIN keypad
        document.querySelectorAll('.pin-key[data-key]').forEach(btn => {
            btn.onclick = () => {
                if (this.currentPin.length < 4) {
                    this.currentPin += btn.dataset.key;
                    this.updatePinDisplay();
                    if (this.currentPin.length === 4) {
                        setTimeout(() => this.validatePin(), 300);
                    }
                }
            };
        });
        
        // PIN clear
        document.querySelector('.pin-key[data-action="clear"]').onclick = () => {
            this.currentPin = '';
            this.updatePinDisplay();
            document.getElementById('pinError').style.display = 'none';
        };
        
        // PIN enter
        document.getElementById('pinEnter').onclick = () => this.validatePin();
        
        // Google auth button
        document.getElementById('authBtn').onclick = () => {
            state.authStatus === 'google_connected' 
                ? this.googleSignOut() 
                : this.googleSignIn();
        };
        
        // Keyboard for PIN
        document.addEventListener('keydown', (e) => {
            if (state.authStatus === 'locked' && state.pinHash) {
                if (e.key >= '0' && e.key <= '9') {
                    this.currentPin = (this.currentPin + e.key).slice(0, 4);
                    this.updatePinDisplay();
                    if (this.currentPin.length === 4) {
                        setTimeout(() => this.validatePin(), 300);
                    }
                } else if (e.key === 'Backspace') {
                    this.currentPin = this.currentPin.slice(0, -1);
                    this.updatePinDisplay();
                } else if (e.key === 'Enter') {
                    this.validatePin();
                }
            }
        });
    },
    
    updatePinDisplay() {
        const dots = document.querySelectorAll('.pin-dot');
        dots.forEach((dot, i) => {
            dot.classList.toggle('filled', i < this.currentPin.length);
        });
        
        const textEl = document.getElementById('pinDisplayText');
        if (textEl) {
            if (this.currentPin.length === 0) {
                textEl.textContent = '4 ডিজিট PIN দিন';
            } else if (this.currentPin.length === 4) {
                textEl.textContent = 'Enter চাপুন';
            } else {
                textEl.textContent = '•'.repeat(this.currentPin.length);
            }
        }
    },
    
    async validatePin() {
        // Check lockout
        if (state.lockoutUntil && Date.now() < state.lockoutUntil) {
            const minutes = Math.ceil((state.lockoutUntil - Date.now()) / 60000);
            this.showPinError(`লক করা আছে। ${minutes} মিনিট পরে চেষ্টা করুন।`);
            return;
        }
        
        // Check attempts
        if (state.pinAttempts >= CONFIG.security.maxAttempts) {
            state.lockoutUntil = Date.now() + (CONFIG.security.lockoutMinutes * 60000);
            localStorage.setItem('lockout_until', state.lockoutUntil);
            this.showPinError(`বেশি চেষ্টা। ${CONFIG.security.lockoutMinutes} মিনিট লক।`);
            return;
        }
        
        try {
            if (!state.pinHash) {
                // First time setup
                const hash = await utils.hashPin(this.currentPin);
                localStorage.setItem('vault_pin_hash', hash);
                state.pinHash = hash;
                this.unlockVault();
                utils.showToast('PIN সেট করা হয়েছে ✅', 'success');
            } else {
                // Verify PIN
                state.pinAttempts++;
                localStorage.setItem('pin_attempts', state.pinAttempts);
                
                const isValid = await utils.verifyPin(this.currentPin, state.pinHash);
                
                if (isValid) {
                    state.pinAttempts = 0;
                    state.lockoutUntil = null;
                    localStorage.removeItem('pin_attempts');
                    localStorage.removeItem('lockout_until');
                    this.unlockVault();
                } else {
                    const attemptsLeft = CONFIG.security.maxAttempts - state.pinAttempts;
                    this.showPinError(`ভুল PIN। ${attemptsLeft} বার চেষ্টা বাকি।`);
                    this.currentPin = '';
                    this.updatePinDisplay();
                    
                    // Haptic feedback
                    if (navigator.vibrate) navigator.vibrate([100, 50, 100]);
                }
            }
        } catch (error) {
            utils.handleError(error, 'PIN Validation');
        }
    },
    
    showPinError(message) {
        const errorEl = document.getElementById('pinError');
        if (errorEl) {
            errorEl.textContent = message;
            errorEl.style.display = 'block';
        }
    },
    
    unlockVault() {
        state.authStatus = 'unlocked';
        state.sessionStart = Date.now();
        localStorage.setItem('session_start', state.sessionStart);
        
        // Update UI
        document.getElementById('pinGate').style.display = 'none';
        document.getElementById('appContainer').style.display = 'flex';
        document.getElementById('sidebar').classList.add('active');
        
        // Initialize systems
        driveManager.init();
        uploadManager.init();
        settingsManager.init();
        
        utils.showToast('VAULT আনলক করা হয়েছে ✅', 'success');
    },
    
    lockVault() {
        state.authStatus = 'locked';
        state.accessToken = null;
        state.userProfile = null;
        this.currentPin = '';
        
        localStorage.removeItem('drive_access_token');
        localStorage.removeItem('token_expiry');
        localStorage.removeItem('user_profile');
        
        document.getElementById('pinGate').style.display = 'flex';
        document.getElementById('appContainer').style.display = 'none';
        this.updatePinDisplay();
        this.updateAuthUI();
        
        utils.showToast('VAULT লক করা হয়েছে 🔒', 'info');
    },
    
    async googleSignIn() {
        try {
            const params = new URLSearchParams({
                client_id: CONFIG.googleOAuth.clientId,
                redirect_uri: CONFIG.googleOAuth.redirectURI,
                response_type: 'token',
                scope: CONFIG.googleOAuth.scope,
                include_granted_scopes: 'true',
                state: 'google_drive_' + Date.now(),
                prompt: 'consent'
            });
            
            window.location.href = CONFIG.googleOAuth.authEndpoint + '?' + params;
        } catch (error) {
            utils.handleError(error, 'Google Sign In');
        }
    },
    
    checkOAuthRedirect() {
        const hash = window.location.hash.substring(1);
        const params = new URLSearchParams(hash);
        
        if (params.has('access_token')) {
            const accessToken = params.get('access_token');
            const expiresIn = parseInt(params.get('expires_in')) || 3600;
            
            state.accessToken = accessToken;
            state.tokenExpiry = Date.now() + (expiresIn * 1000);
            state.authStatus = 'google_connected';
            
            localStorage.setItem('drive_access_token', accessToken);
            localStorage.setItem('token_expiry', state.tokenExpiry);
            
            // Clear hash from URL
            history.replaceState(null, '', window.location.pathname);
            
            // Get user info
            this.fetchUserInfo();
            
            // Initialize drive
            driveManager.init();
        }
    },
    
    async fetchUserInfo() {
        try {
            const response = await fetch('https://www.googleapis.com/oauth2/v1/userinfo?alt=json', {
                headers: { Authorization: `Bearer ${state.accessToken}` }
            });
            
            if (!response.ok) throw new Error('User info failed');
            
            const data = await response.json();
            state.userProfile = {
                name: data.name,
                email: data.email,
                picture: data.picture,
                id: data.id
            };
            
            localStorage.setItem('user_profile', JSON.stringify(state.userProfile));
            this.updateAuthUI();
            
            utils.showToast(`স্বাগতম, ${data.name}!`, 'success');
        } catch (error) {
            console.warn('User info fetch failed, continuing with token');
        }
    },
    
    googleSignOut() {
        if (confirm('গুগল ড্রাইভ থেকে লগআউট করবেন?')) {
            state.accessToken = null;
            state.userProfile = null;
            state.authStatus = 'unlocked';
            
            localStorage.removeItem('drive_access_token');
            localStorage.removeItem('token_expiry');
            localStorage.removeItem('user_profile');
            
            // Revoke token
            if (state.accessToken) {
                fetch(`https://oauth2.googleapis.com/revoke?token=${state.accessToken}`, {
                    method: 'POST'
                }).catch(() => {});
            }
            
            this.updateAuthUI();
            fileBrowser.clear();
            
            utils.showToast('গুগল ড্রাইভ থেকে ডিস্কানেক্ট করা হয়েছে', 'info');
        }
    },
    
    updateAuthUI() {
        const authBtn = document.getElementById('authBtn');
        const userName = document.getElementById('userName');
        const userAvatar = document.getElementById('userAvatar');
        
        if (!authBtn || !userName) return;
        
        if (state.authStatus === 'google_connected' && state.userProfile) {
            authBtn.textContent = 'লগআউট';
            authBtn.style.background = 'var(--color-danger)';
            userName.textContent = state.userProfile.name;
            
            if (state.userProfile.picture) {
                userAvatar.style.backgroundImage = `url('${state.userProfile.picture}')`;
                userAvatar.textContent = '';
            }
        } else {
            authBtn.textContent = 'গুগল সংযোগ';
            authBtn.style.background = 'var(--color-accent)';
            userName.textContent = 'সংযুক্ত নেই';
            userAvatar.style.backgroundImage = '';
            userAvatar.textContent = '👤';
        }
    },
    
    async initFirebase() {
        try {
            state.firebaseApp = firebase.initializeApp(CONFIG.firebase);
            state.firebaseDB = firebase.database(state.firebaseApp);
            console.log('Firebase initialized');
        } catch (error) {
            console.warn('Firebase init failed:', error);
        }
    },
    
    loadSession() {
        // Check session expiry
        if (state.sessionStart) {
            const hours = (Date.now() - state.sessionStart) / (1000 * 60 * 60);
            if (hours > CONFIG.security.sessionHours) {
                this.lockVault();
                return;
            }
        }
        
        // Auto unlock if session valid
        if (state.pinHash && state.sessionStart) {
            const hours = (Date.now() - state.sessionStart) / (1000 * 60 * 60);
            if (hours < CONFIG.security.sessionHours) {
                this.unlockVault();
            }
        }
    },
    
    startSessionMonitor() {
        setInterval(() => {
            if (state.sessionStart) {
                const hours = (Date.now() - state.sessionStart) / (1000 * 60 * 60);
                if (hours > CONFIG.security.sessionHours) {
                    utils.showToast('সেশন শেষ হয়েছে। আবার লগইন করুন।', 'warning');
                    this.lockVault();
                }
            }
        }, 60000); // Check every minute
    }
};

// ==================== DRIVE MANAGER ====================
const driveManager = {
    cacheDB: null,
    
    async init() {
        console.log('🚀 Drive Manager Initializing');
        
        // Initialize cache
        this.cacheDB = new CacheDB();
        await this.cacheDB.init();
        
        // Check token validity
        if (state.accessToken) {
            await this.validateToken();
        }
        
        // Load storage info
        if (state.authStatus === 'google_connected') {
            await this.loadStorageInfo();
            await this.loadFolderContents(state.currentFolder);
            this.startTokenRefresh();
        }
        
        // Setup network listeners
        this.setupNetworkListeners();
    },
    
    async validateToken() {
        try {
            const response = await fetch(CONFIG.googleOAuth.tokenInfoEndpoint + `?access_token=${state.accessToken}`);
            if (!response.ok) throw new Error('Token invalid');
        } catch (error) {
            console.warn('Token validation failed:', error);
            authManager.googleSignOut();
        }
    },
    
    startTokenRefresh() {
        // Refresh token 10 minutes before expiry
        setInterval(async () => {
            if (state.tokenExpiry && Date.now() > state.tokenExpiry - 600000) {
                try {
                    // Use silent refresh
                    const iframe = document.createElement('iframe');
                    iframe.style.display = 'none';
                    iframe.src = `https://accounts.google.com/o/oauth2/auth?client_id=${CONFIG.googleOAuth.clientId}&redirect_uri=${CONFIG.googleOAuth.redirectURI}&response_type=token&scope=${CONFIG.googleOAuth.scope}&prompt=none`;
                    
                    document.body.appendChild(iframe);
                    setTimeout(() => iframe.remove(), 5000);
                } catch (error) {
                    console.warn('Token refresh failed:', error);
                }
            }
        }, 60000); // Check every minute
    },
    
    async loadStorageInfo() {
        try {
            const response = await fetch(`${CONFIG.drive.aboutEndpoint}?fields=storageQuota`, {
                headers: { Authorization: `Bearer ${state.accessToken}` }
            });
            
            if (!response.ok) throw new Error('Storage info failed');
            
            const data = await response.json();
            const quota = data.storageQuota;
            
            state.storageInfo = {
                total: parseInt(quota.limit) || 0,
                used: parseInt(quota.usage) || 0,
                free: parseInt(quota.limit) - parseInt(quota.usage),
                percentage: quota.limit ? (quota.usage / quota.limit) * 100 : 0
            };
            
            this.updateStorageUI();
        } catch (error) {
            utils.handleError(error, 'Load Storage Info');
        }
    },
    
    updateStorageUI() {
        const bar = document.getElementById('storageBar');
        const text = document.getElementById('storageText');
        
        if (bar && text) {
            const percentage = state.storageInfo.percentage;
            bar.style.width = `${percentage}%`;
            
            if (percentage > 90) {
                bar.style.background = 'var(--color-danger)';
            } else if (percentage > 75) {
                bar.style.background = 'var(--color-warning)';
            }
            
            text.textContent = `${utils.formatFileSize(state.storageInfo.used)} / ${utils.formatFileSize(state.storageInfo.total)}`;
        }
    },
    
    async loadFolderContents(folderId, forceRefresh = false) {
        try {
            state.currentFolder = folderId;
            
            // Try cache first
            if (!forceRefresh && state.settings.offlineMode) {
                const cached = await this.cacheDB.getFiles(folderId);
                if (cached.length > 0) {
                    state.fileList = cached;
                    fileBrowser.render();
                    utils.showToast('ক্যাশেড ফাইল লোড করা হয়েছে', 'info');
                    return;
                }
            }
            
            // Load from Drive
            if (!state.accessToken) {
                throw new Error('No access token');
            }
            
            const url = new URL('https://www.googleapis.com/drive/v3/files');
            url.searchParams.append('q', `'${folderId}' in parents and trashed=false`);
            url.searchParams.append('fields', 'files(id,name,mimeType,size,modifiedTime,createdTime,thumbnailLink,webViewLink,iconLink)');
            url.searchParams.append('orderBy', 'folder,name');
            url.searchParams.append('pageSize', '100');
            
            const response = await fetch(url, {
                headers: { Authorization: `Bearer ${state.accessToken}` }
            });
            
            if (!response.ok) throw new Error('Folder load failed');
            
            const data = await response.json();
            state.fileList = data.files || [];
            
            // Cache the results
            await this.cacheDB.saveFiles(folderId, state.fileList);
            
            // Update UI
            fileBrowser.render();
            this.updateFolderPath();
            
            // Load thumbnails in background
            this.prefetchThumbnails(state.fileList);
            
        } catch (error) {
            utils.handleError(error, 'Load Folder');
            state.fileList = [];
            fileBrowser.render();
        }
    },
    
    async prefetchThumbnails(files) {
        for (const file of files) {
            if (file.thumbnailLink && !file.mimeType.startsWith('application/vnd.google-apps')) {
                try {
                    const response = await fetch(file.thumbnailLink);
                    const blob = await response.blob();
                    await this.cacheDB.saveThumbnail(file.id, blob);
                } catch (error) {
                    // Silent fail for thumbnails
                }
            }
        }
    },
    
    async getThumbnail(file) {
        // Try cache first
        const cached = await this.cacheDB.getThumbnail(file.id);
        if (cached?.thumbnail) {
            return URL.createObjectURL(cached.thumbnail);
        }
        
        // Use Google thumbnail
        if (file.thumbnailLink) {
            return file.thumbnailLink + '&w=200&h=200';
        }
        
        // Use media proxy
        return `${CONFIG.mediaProxies.readOnly}?id=${file.id}&size=200`;
    },
    
    updateFolderPath() {
        const pathEl = document.getElementById('folderPath');
        if (pathEl) {
            if (state.currentFolder === CONFIG.drive.rootFolderId) {
                pathEl.textContent = '/VAULT';
            } else {
                pathEl.textContent = '/.../Current Folder';
            }
        }
    },
    
    setupNetworkListeners() {
        window.addEventListener('online', () => {
            state.isOnline = true;
            utils.showToast('অনলাইন ✅', 'success');
            
            if (state.authStatus === 'google_connected') {
                this.loadFolderContents(state.currentFolder, true);
            }
        });
        
        window.addEventListener('offline', () => {
            state.isOnline = false;
            utils.showToast('অফলাইন মোড', 'warning');
        });
    },
    
    // Large File Chunk Upload System
    async uploadFile(file, folderId = state.currentFolder, onProgress) {
        return new Promise(async (resolve, reject) => {
            try {
                // Validate file size
                if (file.size > CONFIG.drive.maxFileSize) {
                    throw new Error(`ফাইল বেশি বড়। সর্বোচ্চ ${utils.formatFileSize(CONFIG.drive.maxFileSize)}`);
                }
                
                // Check storage space
                if (file.size > state.storageInfo.free) {
                    throw new Error('স্টোরেজ ফুল। জায়গা খালি করুন।');
                }
                
                // For small files, use simple upload
                if (file.size <= CONFIG.drive.chunkSize) {
                    const uploadedFile = await this.simpleUpload(file, folderId, onProgress);
                    resolve(uploadedFile);
                    return;
                }
                
                // Large file - use chunked upload
                const uploadedFile = await this.chunkedUpload(file, folderId, onProgress);
                resolve(uploadedFile);
                
            } catch (error) {
                reject(error);
            }
        });
    },
    
    async simpleUpload(file, folderId, onProgress) {
        const metadata = {
            name: file.name,
            parents: [folderId]
        };
        
        const form = new FormData();
        form.append('metadata', new Blob([JSON.stringify(metadata)], { type: 'application/json' }));
        form.append('file', file);
        
        const xhr = new XMLHttpRequest();
        
        return new Promise((resolve, reject) => {
            xhr.upload.addEventListener('progress', (e) => {
                if (e.lengthComputable && onProgress) {
                    onProgress(Math.round((e.loaded / e.total) * 100));
                }
            });
            
            xhr.onload = () => {
                if (xhr.status >= 200 && xhr.status < 300) {
                    try {
                        const result = JSON.parse(xhr.responseText);
                        resolve(result);
                    } catch (e) {
                        reject(new Error('Parse error'));
                    }
                } else {
                    reject(new Error(`Upload failed: ${xhr.status}`));
                }
            };
            
            xhr.onerror = () => reject(new Error('Network error'));
            
            xhr.open('POST', `${CONFIG.drive.uploadEndpoint}?uploadType=multipart`);
            xhr.setRequestHeader('Authorization', `Bearer ${state.accessToken}`);
            xhr.send(form);
        });
    },
    
    async chunkedUpload(file, folderId, onProgress) {
        console.log(`Starting chunked upload: ${file.name} (${utils.formatFileSize(file.size)})`);
        
        const metadata = {
            name: file.name,
            parents: [folderId]
        };
        
        // Step 1: Initiate resumable session
        const initResponse = await fetch(`${CONFIG.drive.uploadEndpoint}?uploadType=resumable`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${state.accessToken}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(metadata)
        });
        
        if (!initResponse.ok) {
            throw new Error('Session initiation failed');
        }
        
        const sessionUri = initResponse.headers.get('Location');
        if (!sessionUri) {
            throw new Error('No session URI received');
        }
        
        // Step 2: Upload chunks
        const chunkSize = CONFIG.drive.chunkSize;
        const totalChunks = Math.ceil(file.size / chunkSize);
        let uploadedBytes = 0;
        
        for (let chunkIndex = 0; chunkIndex < totalChunks; chunkIndex++) {
            const start = chunkIndex * chunkSize;
            const end = Math.min(start + chunkSize, file.size);
            const chunk = file.slice(start, end);
            
            const response = await fetch(sessionUri, {
                method: 'PUT',
                headers: {
                    'Content-Range': `bytes ${start}-${end-1}/${file.size}`,
                    'Content-Type': 'application/octet-stream'
                },
                body: chunk
            });
            
            if (response.status === 308) {
                // Continue uploading
                const range = response.headers.get('Range');
                if (range) {
                    uploadedBytes = parseInt(range.split('-')[1]) + 1;
                }
            } else if (response.ok) {
                // Upload complete
                const result = await response.json();
                
                // Update storage info
                await this.loadStorageInfo();
                
                // Refresh file list
                await this.loadFolderContents(folderId);
                
                return result;
            } else {
                throw new Error(`Chunk upload failed: ${response.status}`);
            }
            
            // Update progress
            uploadedBytes = end;
            if (onProgress) {
                onProgress(Math.round((uploadedBytes / file.size) * 100));
            }
        }
        
        throw new Error('Upload incomplete');
    },
    
    async createFolder(name, parentId = state.currentFolder) {
        try {
            const metadata = {
                name: name.trim(),
                mimeType: 'application/vnd.google-apps.folder',
                parents: [parentId]
            };
            
            const response = await fetch('https://www.googleapis.com/drive/v3/files', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${state.accessToken}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(metadata)
            });
            
            if (!response.ok) throw new Error('Create folder failed');
            
            const folder = await response.json();
            
            // Refresh view
            await this.loadFolderContents(state.currentFolder);
            
            utils.showToast(`ফোল্ডার তৈরি হয়েছে: ${name}`, 'success');
            return folder;
            
        } catch (error) {
            utils.handleError(error, 'Create Folder');
            throw error;
        }
    },
    
    async deleteFile(fileId) {
        try {
            const response = await fetch(`https://www.googleapis.com/drive/v3/files/${fileId}`, {
                method: 'DELETE',
                headers: { Authorization: `Bearer ${state.accessToken}` }
            });
            
            if (!response.ok && response.status !== 204) {
                throw new Error('Delete failed');
            }
            
            // Remove from cache
            const transaction = this.cacheDB.db.transaction(['files'], 'readwrite');
            const store = transaction.objectStore('files');
            store.delete(fileId);
            
            // Refresh
            await this.loadFolderContents(state.currentFolder);
            await this.loadStorageInfo();
            
            utils.showToast('ফাইল ডিলিট করা হয়েছে', 'success');
            
        } catch (error) {
            utils.handleError(error, 'Delete File');
            throw error;
        }
    },
    
    getDownloadUrl(fileId) {
        return `https://www.googleapis.com/drive/v3/files/${fileId}?alt=media`;
    },
    
    getPreviewUrl(file) {
        if (file.mimeType.startsWith('image/') || file.mimeType.startsWith('video/')) {
            return `${CONFIG.mediaProxies.readOnly}?id=${file.id}&mime=${encodeURIComponent(file.mimeType)}`;
        }
        return file.webViewLink || this.getDownloadUrl(file.id);
    }
};

// ==================== UPLOAD MANAGER ====================
const uploadManager = {
    queue: [],
    activeUploads: 0,
    
    init() {
        console.log('📤 Upload Manager Initializing');
        
        // Setup file input
        const fileInput = document.getElementById('fileInput');
        fileInput.onchange = (e) => {
            if (e.target.files.length > 0) {
                this.addToQueue(Array.from(e.target.files));
            }
        };
        
        // Upload buttons
        document.getElementById('btnUpload').onclick = () => fileInput.click();
        document.getElementById('btnFirstUpload').onclick = () => fileInput.click();
        
        // Upload dock controls
        document.getElementById('uploadClose').onclick = () => {
            document.getElementById('uploadDock').classList.remove('visible');
        };
        
        document.getElementById('cancelAllUploads').onclick = () => {
            if (this.queue.length > 0 && confirm('সব আপলোড বাতিল করবেন?')) {
                this.queue = [];
                this.updateUI();
            }
        };
        
        // Start queue processor
        this.processQueue();
    },
    
    addToQueue(files) {
        files.forEach(file => {
            this.queue.push({
                id: utils.generateId(),
                file: file,
                status: 'pending',
                progress: 0,
                error: null,
                addedAt: Date.now()
            });
        });
        
        this.updateUI();
        document.getElementById('uploadDock').classList.add('visible');
        
        utils.showToast(`${files.length} ফাইল যোগ করা হয়েছে`, 'info');
    },
    
    async processQueue() {
        // Check every second for pending uploads
        setInterval(async () => {
            if (this.activeUploads >= CONFIG.app.maxConcurrentUploads) return;
            
            const pendingItem = this.queue.find(item => item.status === 'pending');
            if (!pendingItem) return;
            
            this.activeUploads++;
            pendingItem.status = 'uploading';
            this.updateUI();
            
            try {
                await driveManager.uploadFile(pendingItem.file, state.currentFolder, (progress) => {
                    pendingItem.progress = progress;
                    this.updateUI();
                });
                
                pendingItem.status = 'completed';
                pendingItem.progress = 100;
                
            } catch (error) {
                pendingItem.status = 'error';
                pendingItem.error = error.message;
                utils.handleError(error, 'Upload');
            }
            
            this.activeUploads--;
            this.updateUI();
            
            // Remove completed items after delay
            setTimeout(() => {
                this.queue = this.queue.filter(item => item.status !== 'completed');
                this.updateUI();
            }, 5000);
            
        }, 1000);
    },
    
    updateUI() {
        const listEl = document.getElementById('uploadList');
        const statsEl = document.getElementById('uploadStats');
        const dockEl = document.getElementById('uploadDock');
        
        if (!listEl || !statsEl || !dockEl) return;
        
        // Update stats
        const pending = this.queue.filter(i => i.status === 'pending').length;
        const uploading = this.queue.filter(i => i.status === 'uploading').length;
        const completed = this.queue.filter(i => i.status === 'completed').length;
        const errors = this.queue.filter(i => i.status === 'error').length;
        
        statsEl.textContent = `${pending} অপেক্ষা • ${uploading} আপলোড • ${completed} সম্পূর্ণ • ${errors} ত্রুটি`;
        
        // Update list
        listEl.innerHTML = '';
        
        if (this.queue.length === 0) {
            dockEl.classList.remove('visible');
            return;
        }
        
        this.queue.forEach(item => {
            const div = document.createElement('div');
            div.className = 'upload-item';
            div.innerHTML = `
                <div class="upload-header">
                    <div class="upload-name" title="${item.file.name}">${item.file.name}</div>
                    <div class="upload-status ${item.status}">${item.status}</div>
                </div>
                <div class="upload-progress">
                    <div class="upload-bar" style="width: ${item.progress}%"></div>
                </div>
                <div class="upload-meta">
                    <span>${utils.formatFileSize(item.file.size)}</span>
                    ${item.error ? `<span class="upload-error">${item.error}</span>` : ''}
                </div>
            `;
            listEl.appendChild(div);
        });
        
        dockEl.classList.add('visible');
    }
};

// ==================== FILE BROWSER ====================
const fileBrowser = {
    async render() {
        const grid = document.getElementById('fileGrid');
        const empty = document.getElementById('emptyState');
        
        if (!grid || !empty) return;
        
        // Clear selection
        state.selectedFiles.clear();
        
        // Filter files based on search
        let files = state.fileList;
        if (state.searchQuery) {
            const query = state.searchQuery.toLowerCase();
            files = files.filter(file => 
                file.name.toLowerCase().includes(query)
            );
        }
        
        // Sort files
        files.sort((a, b) => {
            let aVal, bVal;
            
            switch (state.sortBy) {
                case 'name':
                    aVal = a.name.toLowerCase();
                    bVal = b.name.toLowerCase();
                    return state.sortOrder === 'asc' ? aVal.localeCompare(bVal) : bVal.localeCompare(aVal);
                    
                case 'size':
                    aVal = a.size || 0;
                    bVal = b.size || 0;
                    return state.sortOrder === 'asc' ? aVal - bVal : bVal - aVal;
                    
                case 'date':
                    aVal = new Date(a.modifiedTime || a.createdTime);
                    bVal = new Date(b.modifiedTime || b.createdTime);
                    return state.sortOrder === 'asc' ? aVal - bVal : bVal - aVal;
                    
                default:
                    return 0;
            }
        });
        
        // Update count
        document.getElementById('fileCount').textContent = `${files.length} আইটেম`;
        
        // Show empty state or files
        if (files.length === 0) {
            grid.innerHTML = '';
            empty.style.display = 'block';
            return;
        }
        
        empty.style.display = 'none';
        grid.innerHTML = '';
        
        // Render each file
        for (const file of files) {
            const item = await this.createFileItem(file);
            grid.appendChild(item);
        }
    },
    
    async createFileItem(file) {
        const div = document.createElement('div');
        div.className = 'file-item';
        div.dataset.id = file.id;
        
        const isFolder = file.mimeType === 'application/vnd.google-apps.folder';
        const icon = utils.getFileIcon(file);
        
        // Get thumbnail URL
        let thumbnailUrl = '';
        if (!isFolder && file.mimeType.startsWith('image/')) {
            try {
                thumbnailUrl = await driveManager.getThumbnail(file);
            } catch (error) {
                // Use icon if thumbnail fails
            }
        }
        
        div.innerHTML = `
            <div class="file-icon">${icon}</div>
            ${thumbnailUrl ? `<img class="file-thumb" src="${thumbnailUrl}" alt="${file.name}" loading="lazy">` : ''}
            <div class="file-info">
                <div class="file-name" title="${file.name}">${file.name}</div>
                <div class="file-meta">
                    ${isFolder ? 'ফোল্ডার' : utils.formatFileSize(file.size)} • 
                    ${utils.formatDate(file.modifiedTime)}
                </div>
            </div>
            <div class="file-checkbox">
                <input type="checkbox" class="file-select">
            </div>
        `;
        
        // Event listeners
        div.onclick = (e) => {
            if (!e.target.classList.contains('file-select')) {
                this.handleFileClick(e, file);
            }
        };
        
        div.ondblclick = () => {
            if (isFolder) {
                driveManager.loadFolderContents(file.id);
            } else {
                fileViewer.open(file);
            }
        };
        
        div.oncontextmenu = (e) => {
            e.preventDefault();
            this.showContextMenu(e, file);
        };
        
        const checkbox = div.querySelector('.file-select');
        checkbox.onclick = (e) => {
            e.stopPropagation();
            if (checkbox.checked) {
                state.selectedFiles.add(file.id);
            } else {
                state.selectedFiles.delete(file.id);
            }
            this.updateSelectionUI();
        };
        
        return div;
    },
    
    handleFileClick(e, file) {
        const isFolder = file.mimeType === 'application/vnd.google-apps.folder';
        const checkbox = e.currentTarget.querySelector('.file-select');
        
        if (e.ctrlKey || e.metaKey) {
            // Toggle selection
            checkbox.checked = !checkbox.checked;
            if (checkbox.checked) {
                state.selectedFiles.add(file.id);
            } else {
                state.selectedFiles.delete(file.id);
            }
        } else if (e.shiftKey && state.selectedFiles.size > 0) {
            // Range selection
            // Implementation needed
        } else {
            // Single selection
            if (isFolder) {
                driveManager.loadFolderContents(file.id);
            } else {
                document.querySelectorAll('.file-select').forEach(cb => cb.checked = false);
                state.selectedFiles.clear();
                checkbox.checked = true;
                state.selectedFiles.add(file.id);
                fileViewer.open(file);
            }
        }
        
        this.updateSelectionUI();
    },
    
    updateSelectionUI() {
        document.querySelectorAll('.file-item').forEach(item => {
            const fileId = item.dataset.id;
            const checkbox = item.querySelector('.file-select');
            checkbox.checked = state.selectedFiles.has(fileId);
            item.classList.toggle('selected', state.selectedFiles.has(fileId));
        });
        
        // Update toolbar buttons
        const deselectBtn = document.getElementById('btnDeselectAll');
        if (deselectBtn) {
            deselectBtn.disabled = state.selectedFiles.size === 0;
        }
    },
    
    showContextMenu(e, file) {
        // Create context menu
        const menu = document.getElementById('contextMenu');
        menu.style.left = e.pageX + 'px';
        menu.style.top = e.pageY + 'px';
        menu.classList.add('visible');
        
        // Setup menu items
        const items = {
            open: () => {
                if (file.mimeType === 'application/vnd.google-apps.folder') {
                    driveManager.loadFolderContents(file.id);
                } else {
                    fileViewer.open(file);
                }
            },
            download: () => {
                window.open(driveManager.getDownloadUrl(file.id), '_blank');
            },
            rename: async () => {
                const newName = prompt('নতুন নাম:', file.name);
                if (newName && newName !== file.name) {
                    try {
                        await fetch(`https://www.googleapis.com/drive/v3/files/${file.id}`, {
                            method: 'PATCH',
                            headers: {
                                'Authorization': `Bearer ${state.accessToken}`,
                                'Content-Type': 'application/json'
                            },
                            body: JSON.stringify({ name: newName })
                        });
                        
                        driveManager.loadFolderContents(state.currentFolder);
                        utils.showToast('নাম পরিবর্তন করা হয়েছে', 'success');
                    } catch (error) {
                        utils.handleError(error, 'Rename');
                    }
                }
            },
            share: () => {
                if (file.webViewLink) {
                    navigator.clipboard.writeText(file.webViewLink)
                        .then(() => utils.showToast('লিংক কপি করা হয়েছে', 'success'))
                        .catch(() => window.open(file.webViewLink, '_blank'));
                }
            },
            delete: async () => {
                if (confirm(`"${file.name}" ডিলিট করবেন?`)) {
                    await driveManager.deleteFile(file.id);
                }
            }
        };
        
        // Attach click handlers
        menu.querySelectorAll('.context-item').forEach(item => {
            const action = item.dataset.action;
            item.onclick = () => {
                if (items[action]) items[action]();
                menu.classList.remove('visible');
            };
        });
        
        // Close menu on outside click
        const closeMenu = () => {
            menu.classList.remove('visible');
            document.removeEventListener('click', closeMenu);
        };
        
        setTimeout(() => document.addEventListener('click', closeMenu), 100);
    },
    
    clear() {
        state.fileList = [];
        state.selectedFiles.clear();
        this.render();
    }
};

// ==================== FILE VIEWER ====================
const fileViewer = {
    currentFile: null,
    
    async open(file) {
        this.currentFile = file;
        
        const modal = document.getElementById('mediaModal');
        const body = document.getElementById('modalBody');
        
        if (!modal || !body) return;
        
        // Set file info
        document.getElementById('fileName').textContent = file.name;
        document.getElementById('fileSize').textContent = utils.formatFileSize(file.size);
        document.getElementById('fileModified').textContent = utils.formatDate(file.modifiedTime);
        
        // Show loading
        body.innerHTML = '<div class="loading">লোড হচ্ছে...</div>';
        modal.classList.add('visible');
        
        try {
            const mime = file.mimeType;
            const ext = file.name.split('.').pop().toLowerCase();
            
            if (mime.startsWith('image/')) {
                await this.showImage(file);
            } else if (mime.startsWith('video/')) {
                await this.showVideo(file);
            } else if (mime.startsWith('audio/')) {
                await this.showAudio(file);
            } else if (mime === 'application/pdf') {
                await this.showPDF(file);
            } else if (ext === 'txt' || mime === 'text/plain') {
                await this.showText(file);
            } else {
                this.showUnsupported(file);
            }
        } catch (error) {
            this.showError(file, error);
        }
    },
    
    async showImage(file) {
        const body = document.getElementById('modalBody');
        const img = document.createElement('img');
        
        img.src = driveManager.getPreviewUrl(file);
        img.alt = file.name;
        img.style.maxWidth = '90%';
        img.style.maxHeight = '70vh';
        img.style.borderRadius = '8px';
        
        body.innerHTML = '';
        body.appendChild(img);
    },
    
    async showVideo(file) {
        const body = document.getElementById('modalBody');
        const video = document.createElement('video');
        
        video.src = driveManager.getPreviewUrl(file);
        video.controls = true;
        video.style.maxWidth = '90%';
        video.style.maxHeight = '70vh';
        
        body.innerHTML = '';
        body.appendChild(video);
        
        // Initialize Plyr if available
        if (typeof Plyr !== 'undefined') {
            new Plyr(video);
        }
    },
    
    async showAudio(file) {
        const body = document.getElementById('modalBody');
        const audio = document.createElement('audio');
        
        audio.src = driveManager.getPreviewUrl(file);
        audio.controls = true;
        audio.style.width = '90%';
        
        body.innerHTML = '';
        body.appendChild(audio);
    },
    
    async showPDF(file) {
        const body = document.getElementById('modalBody');
        
        body.innerHTML = `
            <div class="pdf-viewer">
                <div class="pdf-icon">📕</div>
                <h3>${file.name}</h3>
                <p>PDF ডকুমেন্ট</p>
                <button class="btn-primary" onclick="window.open('${file.webViewLink || driveManager.getDownloadUrl(file.id)}', '_blank')">
                    গুগল ড্রাইভে খুলুন
                </button>
            </div>
        `;
    },
    
    async showText(file) {
        try {
            const response = await fetch(driveManager.getPreviewUrl(file));
            const text = await response.text();
            
            const pre = document.createElement('pre');
            pre.textContent = text;
            pre.style.cssText = `
                white-space: pre-wrap;
                padding: 20px;
                background: var(--color-bg-tertiary);
                border-radius: 8px;
                max-height: 60vh;
                overflow: auto;
                width: 90%;
                margin: 0 auto;
            `;
            
            document.getElementById('modalBody').innerHTML = '';
            document.getElementById('modalBody').appendChild(pre);
        } catch (error) {
            throw error;
        }
    },
    
    showUnsupported(file) {
        document.getElementById('modalBody').innerHTML = `
            <div class="unsupported">
                <div class="unsupported-icon">📄</div>
                <h3>${file.name}</h3>
                <p>এই ফাইলটি প্রিভিউ করা যাবে না</p>
                <button class="btn-primary" onclick="window.open('${driveManager.getDownloadUrl(file.id)}', '_blank')">
                    ডাউনলোড করুন
                </button>
            </div>
        `;
    },
    
    showError(file, error) {
        document.getElementById('modalBody').innerHTML = `
            <div class="error-viewer">
                <div class="error-icon">❌</div>
                <h3>প্রিভিউ ব্যর্থ</h3>
                <p>"${file.name}" লোড করা যায়নি</p>
                <p class="error-message">${error.message}</p>
                <button class="btn-primary" onclick="window.open('${driveManager.getDownloadUrl(file.id)}', '_blank')">
                    ডাউনলোড করুন
                </button>
            </div>
        `;
    },
    
    close() {
        const modal = document.getElementById('mediaModal');
        if (modal) {
            modal.classList.remove('visible');
            setTimeout(() => {
                document.getElementById('modalBody').innerHTML = '';
            }, 300);
        }
    }
};

// ==================== SETTINGS MANAGER ====================
const settingsManager = {
    init() {
        this.loadSettings();
        this.setupListeners();
    },
    
    loadSettings() {
        // Load theme
        document.body.dataset.theme = state.settings.theme;
        document.body.dataset.view = state.settings.view;
        
        // Update UI
        this.updateViewUI();
        this.updateThemeUI();
    },
    
    setupListeners() {
        // View toggle
        document.getElementById('btnViewToggle').onclick = () => {
            state.settings.view = state.settings.view === 'grid' ? 'list' : 'grid';
            document.body.dataset.view = state.settings.view;
            localStorage.setItem('view', state.settings.view);
            this.updateViewUI();
            fileBrowser.render();
        };
        
        // Theme toggle
        document.getElementById('themeToggle').onclick = () => {
            const themes = ['cyber', 'dark', 'light'];
            const currentIndex = themes.indexOf(state.settings.theme);
            state.settings.theme = themes[(currentIndex + 1) % themes.length];
            document.body.dataset.theme = state.settings.theme;
            localStorage.setItem('theme', state.settings.theme);
            this.updateThemeUI();
        };
        
        // Search
        const searchInput = document.getElementById('searchInput');
        if (searchInput) {
            const debouncedSearch = utils.debounce((query) => {
                state.searchQuery = query;
                fileBrowser.render();
            }, 300);
            
            searchInput.oninput = (e) => debouncedSearch(e.target.value);
        }
        
        // Sort
        document.getElementById('sortSelect').onchange = (e) => {
            const [sortBy, order] = e.target.value.split('_');
            state.sortBy = sortBy;
            state.sortOrder = order;
            fileBrowser.render();
        };
        
        // Create folder
        document.getElementById('btnCreateFolder').onclick = async () => {
            const name = prompt('ফোল্ডারের নাম দিন:');
            if (name && name.trim()) {
                await driveManager.createFolder(name.trim());
            }
        };
        
        // Select all
        document.getElementById('btnSelectAll').onclick = () => {
            state.selectedFiles = new Set(state.fileList.map(f => f.id));
            fileBrowser.updateSelectionUI();
        };
        
        // Deselect all
        document.getElementById('btnDeselectAll').onclick = () => {
            state.selectedFiles.clear();
            fileBrowser.updateSelectionUI();
        };
        
        // Navigation
        document.getElementById('menuToggle').onclick = () => {
            document.getElementById('sidebar').classList.toggle('active');
        };
        
        document.getElementById('navHome').onclick = () => {
            driveManager.loadFolderContents(CONFIG.drive.rootFolderId);
        };
        
        document.getElementById('navRefresh').onclick = () => {
            driveManager.loadFolderContents(state.currentFolder, true);
            utils.showToast('রিফ্রেশ করা হয়েছে', 'info');
        };
    },
    
    updateViewUI() {
        const viewIcon = document.getElementById('viewIcon');
        const viewText = document.getElementById('viewText');
        
        if (viewIcon && viewText) {
            if (state.settings.view === 'grid') {
                viewIcon.textContent = '◻️';
                viewText.textContent = 'গ্রিড ভিউ';
            } else {
                viewIcon.textContent = '📋';
                viewText.textContent = 'লিস্ট ভিউ';
            }
        }
    },
    
    updateThemeUI() {
        const themeIcon = document.getElementById('themeIcon');
        const themeText = document.getElementById('themeText');
        
        if (themeIcon && themeText) {
            themeIcon.textContent = state.settings.theme === 'cyber' ? '🌌' : 
                                  state.settings.theme === 'dark' ? '🌙' : '☀️';
            themeText.textContent = state.settings.theme === 'cyber' ? 'সাইবার' :
                                  state.settings.theme === 'dark' ? 'ডার্ক' : 'লাইট';
        }
    }
};

// ==================== INITIALIZATION ====================
async function initVaultOS() {
    console.log('🚀 VAULT OS v4.0 - Initializing');
    
    try {
        // Initialize auth
        await authManager.init();
        
        // Initialize settings
        settingsManager.init();
        
        // Setup global keyboard shortcuts
        document.addEventListener('keydown', (e) => {
            // Escape closes modals
            if (e.key === 'Escape') {
                fileViewer.close();
                document.getElementById('contextMenu').classList.remove('visible');
                if (window.innerWidth < 768) {
                    document.getElementById('sidebar').classList.remove('active');
                }
            }
            
            // Ctrl+A selects all files
            if ((e.ctrlKey || e.metaKey) && e.key === 'a') {
                e.preventDefault();
                if (state.fileList.length > 0) {
                    state.selectedFiles = new Set(state.fileList.map(f => f.id));
                    fileBrowser.updateSelectionUI();
                }
            }
            
            // F5 refresh
            if (e.key === 'F5') {
                e.preventDefault();
                driveManager.loadFolderContents(state.currentFolder, true);
            }
            
            // Delete selected files
            if (e.key === 'Delete' && state.selectedFiles.size > 0) {
                e.preventDefault();
                if (confirm(`${state.selectedFiles.size} ফাইল ডিলিট করবেন?`)) {
                    state.selectedFiles.forEach(async id => {
                        try {
                            await driveManager.deleteFile(id);
                        } catch (error) {
                            utils.handleError(error, 'Delete Selected');
                        }
                    });
                    state.selectedFiles.clear();
                }
            }
        });
        
        // Handle window resize
        let resizeTimer;
        window.addEventListener('resize', () => {
            clearTimeout(resizeTimer);
            resizeTimer = setTimeout(() => {
                if (window.innerWidth >= 768) {
                    document.getElementById('sidebar').classList.remove('active');
                }
            }, 250);
        });
        
        console.log('✅ VAULT OS v4.0 Ready');
        
    } catch (error) {
        console.error('Initialization failed:', error);
        utils.showToast('অ্যাপ শুরু করতে সমস্যা', 'error');
    }
}

// Start the app
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initVaultOS);
} else {
    initVaultOS();
}