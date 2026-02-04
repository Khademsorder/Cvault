/**
 * VAULT OS v5.0 - PRODUCTION KERNEL
 * PART 1: CONFIGURATION & STATE
 * Status: High-Fidelity (Full Config)
 */

// =========================================================
// 1. MASTER CONFIGURATION (Strict Adherence)
// =========================================================
const CONFIG = {
    // ================ APP IDENTITY ================
    app: {
        name: "VAULT OS",
        version: "5.0.0",
        description: "Secure Drive Manager",
        author: "VAULT Team",
        year: "2026",
        repository: "https://github.com/khademsorder/Cvault"
    },
    
    // ================ GOOGLE OAUTH CONFIG ================
    googleOAuth: {
        clientId: "318681315152-65e9kofptt4c3bk3kmlj9gmksnasu347.apps.googleusercontent.com",
        scope: [
            "https://www.googleapis.com/auth/drive.file",
            "https://www.googleapis.com/auth/drive.readonly",
            "https://www.googleapis.com/auth/drive.metadata.readonly",
            "https://www.googleapis.com/auth/drive.install",
            "profile",
            "email"
        ].join(" "),
        authEndpoint: "https://accounts.google.com/o/oauth2/v2/auth",
        tokenEndpoint: "https://oauth2.googleapis.com/token",
        tokenInfoEndpoint: "https://oauth2.googleapis.com/tokeninfo",
        revokeEndpoint: "https://oauth2.googleapis.com/revoke",
        userInfoEndpoint: "https://www.googleapis.com/oauth2/v1/userinfo",
        redirectURI: window.location.origin + window.location.pathname,
        responseType: "token",
        includeGrantedScopes: "true",
        prompt: "consent",
        accessType: "offline",
        redirectURIs: [
            "https://khademsorder.github.io/Cvault/",
            "https://khademsorder.github.io/Cvault/prime.html",
            "https://encrypted-vault-4683d.web.app",
            "https://encrypted-vault-4683d.firebaseapp.com",
            "http://localhost:5500",
            "http://localhost:3000",
            "http://localhost"
        ]
    },
    
    // ================ GOOGLE DRIVE API ================
    drive: {
        apiVersion: "v3",
        rootFolderId: "root",
        apiBase: "https://www.googleapis.com/drive/v3",
        uploadEndpoint: "https://www.googleapis.com/upload/drive/v3/files",
        aboutEndpoint: "https://www.googleapis.com/drive/v3/about",
        changesEndpoint: "https://www.googleapis.com/drive/v3/changes",
        chunkSize: 5 * 1024 * 1024,           // 5MB
        maxFileSize: 10 * 1024 * 1024 * 1024, // 10GB
        maxUploadRetries: 3,
        uploadTimeout: 300000,
        defaultFields: "files(id,name,mimeType,size,modifiedTime,createdTime,thumbnailLink,webViewLink,iconLink,parents,trashed,starred,shared,capabilities,webContentLink)",
        pageSize: 100,
        orderBy: "folder,name,modifiedTime desc"
    },
    
    // ================ FIREBASE CONFIG ================
    firebase: {
        apiKey: "AIzaSyB3Iy1MIbfmJ7h5rv9NlsT23ysedCwUZt4",
        authDomain: "encrypted-vault-4683d.firebaseapp.com",
        databaseURL: "https://encrypted-vault-4683d-default-rtdb.firebaseio.com",
        projectId: "encrypted-vault-4683d",
        storageBucket: "encrypted-vault-4683d.appspot.com",
        messagingSenderId: "851257263743",
        appId: "1:851257263743:web:e0d16606bd06f692f5e14a",
        measurementId: "G-XXXXXXXXXX",
        urls: {
            authDomain: "encrypted-vault-4683d.firebaseapp.com",
            webApp: "https://encrypted-vault-4683d.web.app",
            database: "https://encrypted-vault-4683d-default-rtdb.firebaseio.com",
            storage: "https://encrypted-vault-4683d.appspot.com",
            firestore: "https://firestore.googleapis.com/v1/projects/encrypted-vault-4683d/databases/(default)/documents"
        }
    },
    
    // ================ MEDIA PROXY SERVERS ================
    mediaProxies: {
        readOnly: "https://script.google.com/macros/s/AKfycby2hqAq0JePMbnjEbwwcPBFjS14lvS3pM2Z1PPgY4OraTcpvTmZFPKQr9CQ4vba4Xk7/exec",
        fullAccess: "https://script.google.com/macros/s/AKfycbxQF58gDxHBATrBvliuMc_SdP7PEiuN6fiHdzVKG7_K5FIrj3V2m8imWgPXTjmVqfnN/exec",
        params: {
            id: "{fileId}",
            mime: "{mimeType}",
            size: "{thumbnailSize}",
            download: "{true/false}"
        }
    },
    
    // ================ SECURITY CONFIG ================
    security: {
        pinLength: 4,
        pinSalt: "vault_os_secure_salt_v5",
        pinHashAlgorithm: "SHA-256",
        maxPinAttempts: 5,
        lockoutMinutes: 5,
        sessionHours: 24,
        sessionCheckInterval: 60000,
        tokenRefreshMinutes: 45,
        tokenCheckInterval: 300000,
        encryptLocalStorage: false,
        clearOnLock: true
    },
    
    // ================ APP SETTINGS ================
    settings: {
        defaultTheme: "cyber",
        defaultView: "grid",
        themes: ["cyber", "dark", "light"],
        views: ["grid", "list"],
        maxConcurrentUploads: 2,
        uploadQueueSize: 10,
        resumeUploads: true,
        chunkUploads: true,
        thumbnailSize: 200,
        cacheTTL: 24 * 60 * 60 * 1000,
        offlineCacheLimit: 100 * 1024 * 1024,
        maxCachedFiles: 1000,
        maxCachedThumbnails: 500,
        lazyLoadThreshold: 50,
        debounceSearch: 300,
        throttleScroll: 100,
        onlineOnly: true,
        retryAttempts: 3,
        retryDelay: 2000,
        confirmDelete: true,
        confirmOverwrite: true,
        maxFilenameLength: 255
    },
    
    // ================ FILE TYPE MAPPINGS ================
    fileTypes: {
        images: ['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'image/bmp', 'image/svg+xml', 'image/tiff'],
        videos: ['video/mp4', 'video/webm', 'video/ogg', 'video/quicktime', 'video/x-msvideo', 'video/x-matroska', 'video/3gpp'],
        audio: ['audio/mpeg', 'audio/ogg', 'audio/wav', 'audio/webm', 'audio/aac', 'audio/flac', 'audio/x-m4a'],
        documents: [
            'application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
            'application/vnd.ms-excel', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
            'application/vnd.ms-powerpoint', 'application/vnd.openxmlformats-officedocument.presentationml.presentation',
            'application/vnd.oasis.opendocument.text', 'text/plain', 'text/html', 'text/css', 'text/javascript',
            'application/json', 'application/xml'
        ],
        archives: ['application/zip', 'application/x-rar-compressed', 'application/x-7z-compressed', 'application/x-tar', 'application/gzip'],
        code: ['text/x-python', 'text/x-java', 'text/x-c', 'text/x-c++', 'text/x-php', 'text/x-ruby', 'text/x-go', 'text/x-swift', 'application/x-typescript']
    },
    
    // ================ ERROR MESSAGES ================
    errors: {
        network: "Network error. Please check your internet connection.",
        timeout: "Request timeout. Please try again.",
        quota: "Storage quota exceeded. Please free up space.",
        rateLimit: "Too many requests. Please wait and try again.",
        authExpired: "Session expired. Please login again.",
        authInvalid: "Invalid authentication. Please reconnect.",
        authRevoked: "Access revoked. Please re-authorize.",
        fileNotFound: "File not found.",
        fileTooLarge: "File too large. Maximum size is 10GB.",
        uploadFailed: "Upload failed. Please try again.",
        deleteFailed: "Delete failed. Please try again.",
        pinInvalid: "Invalid PIN. Please try again.",
        pinLocked: "Too many attempts. Try again in 5 minutes.",
        storageFull: "Local storage full. Please clear cache.",
        unknown: "An unknown error occurred.",
        offline: "You are offline. Please connect to the internet."
    },
    
    // ================ SUCCESS MESSAGES ================
    success: {
        pinSet: "PIN set successfully.",
        unlocked: "Vault unlocked successfully.",
        locked: "Vault locked successfully.",
        connected: "Connected to Google Drive.",
        disconnected: "Disconnected from Google Drive.",
        uploaded: "File uploaded successfully.",
        deleted: "File deleted successfully.",
        folderCreated: "Folder created successfully.",
        copied: "File copied successfully.",
        moved: "File moved successfully.",
        renamed: "File renamed successfully."
    }
};

// Security: Freeze config to prevent runtime tampering
Object.freeze(CONFIG);

// =========================================================
// 2. STATE MANAGEMENT (Reactive Store)
// =========================================================
const State = {
    // Auth State
    isAuthenticated: false,
    token: null,
    user: null,
    tokenExpiry: 0,
    
    // Drive State
    files: [],
    folders: [],
    currentFolder: CONFIG.drive.rootFolderId,
    parents: [], // Breadcrumb history
    driveMode: 'my', // 'my' | 'vault' | 'starred' | 'trash'
    viewMode: CONFIG.settings.defaultView,
    
    // Operations State
    clipboard: { type: null, items: [] }, // { type: 'copy'|'move', items: [files] }
    uploadQueue: [],
    activeDownloads: [],
    
    // User Settings (Persisted)
    settings: JSON.parse(localStorage.getItem('vault_settings')) || {
        theme: CONFIG.settings.defaultTheme,
        useProxy: true, // Master switch for media proxy
        showThumbnails: true,
        biometric: false,
        pin: localStorage.getItem('vault_pin') // Stored PIN hash (simulated)
    },
    
    // Runtime Flags
    isOffline: !navigator.onLine,
    isDragging: false,
    searchActive: false
};

// Debug Logger
const Logger = {
    log: (msg, data) => { if(CONFIG.debug.enabled) console.log(`[VAULT] ${msg}`, data || ''); },
    error: (msg, err) => { console.error(`[ERROR] ${msg}`, err || ''); }
};
// =========================================================
// 3. DOM ELEMENT CACHE (Performance Optimization)
// =========================================================
/* We cache elements to avoid repetitive DOM querying */
const DOM = {
    // System Layers
    layers: {
        boot: document.getElementById('boot-layer'),
        auth: document.getElementById('auth-layer'),
        app: document.getElementById('app-layer')
    },

    // Main Containers
    grid: document.getElementById('file-manager'),
    breadcrumbs: document.getElementById('path-display'),
    
    // Interactive Elements
    fab: {
        wrapper: document.querySelector('.fab-wrapper'),
        mainBtn: document.querySelector('.fab-main'),
        menu: document.getElementById('fab-menu'),
        icon: document.getElementById('fab-icon'),
        items: document.querySelectorAll('.fab-item') // For staggered animation
    },
    
    sidebar: {
        el: document.getElementById('app-sidebar'),
        overlay: document.getElementById('sidebar-overlay'),
        email: document.getElementById('side-user-email'),
        navItems: document.querySelectorAll('.nav-item')
    },
    
    search: {
        layer: document.getElementById('search-overlay'),
        input: document.getElementById('search-input'),
        results: document.getElementById('search-results'),
        closeBtn: document.querySelector('.close-search')
    },
    
    // Auth Elements
    auth: {
        pinDisplay: document.getElementById('pin-display'),
        pinDots: document.querySelectorAll('.dot'),
        msg: document.getElementById('auth-msg')
    },

    // Header & Profile
    header: {
        bar: document.querySelector('.status-bar'),
        userAvatar: document.getElementById('user-avatar'),
        userName: document.getElementById('user-name'),
        userEmail: document.getElementById('user-email')
    },

    // Widgets
    storage: {
        bar: document.getElementById('storage-bar'),
        text: document.getElementById('storage-text'),
        used: document.getElementById('storage-used'),
        total: document.getElementById('storage-total')
    },

    // Modals & Trays
    settingsModal: document.getElementById('settings-modal'),
    uploadTray: {
        panel: document.getElementById('upload-panel'),
        list: document.getElementById('upload-list'),
        toggleBtn: document.querySelector('.tray-header button')
    },
    toastArea: document.getElementById('toast-area'),
    contextMenu: document.getElementById('ctx-menu')
};

// =========================================================
// 4. UI CONTROLLER (Visual Logic)
// =========================================================
const UI = {
    // --- Initialization ---
    init: () => {
        // 1. Initialize Firebase (Check existence first)
        if (typeof firebase !== 'undefined' && firebase.apps.length === 0) {
            try {
                firebase.initializeApp(CONFIG.firebase);
                Logger.log("Firebase initialized");
            } catch (e) {
                Logger.error("Firebase Init Failed", e);
            }
        }

        // 2. Apply Saved Theme
        UI.applyTheme(State.settings.theme);

        // 3. Inject Dynamic Header Buttons (Menu & Search) if missing
        UI.injectHeaderControls();

        // 4. Bind Global Event Listeners (Keyboard, Click Outside)
        UI.bindGlobalEvents();

        Logger.log("UI Controller Initialized");
    },

    injectHeaderControls: () => {
        const headerLeft = document.querySelector('.header-left');
        const systemControls = document.querySelector('.system-controls');

        // Menu Button
        if (headerLeft && !document.querySelector('.menu-btn')) {
            const btn = document.createElement('button');
            btn.className = 'icon-btn menu-btn';
            btn.innerHTML = '<i class="fa-solid fa-bars"></i>';
            btn.style.marginRight = '15px';
            btn.onclick = UI.toggleSidebar;
            headerLeft.prepend(btn);
        }

        // Search Button
        if (systemControls && !document.querySelector('.search-btn')) {
            const btn = document.createElement('button');
            btn.className = 'icon-btn search-btn';
            btn.innerHTML = '<i class="fa-solid fa-magnifying-glass"></i>';
            btn.onclick = UI.toggleSearch;
            systemControls.prepend(btn);
        }
    },

    bindGlobalEvents: () => {
        // Close Sidebar/Modals on outside click
        document.addEventListener('click', (e) => {
            // Context Menu Close
            if (DOM.contextMenu.style.display === 'block' && !DOM.contextMenu.contains(e.target)) {
                DOM.contextMenu.style.display = 'none';
            }
            // Sidebar Close (handled by overlay click in HTML, but backup logic here)
            if (DOM.sidebar.el.classList.contains('active') && 
                !DOM.sidebar.el.contains(e.target) && 
                !e.target.closest('.menu-btn')) {
                // UI.toggleSidebar(); // Optional: Strict close
            }
        });

        // Escape Key Handler
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                if (DOM.search.layer.classList.contains('active')) UI.toggleSearch();
                else if (DOM.contextMenu.style.display === 'block') DOM.contextMenu.style.display = 'none';
                else if (!DOM.settingsModal.classList.contains('hidden')) UI.toggleSettings();
                else if (DOM.sidebar.el.classList.contains('active')) UI.toggleSidebar();
            }
        });
    },

    // --- Sidebar Logic ---
    toggleSidebar: () => {
        const isActive = DOM.sidebar.el.classList.contains('active');
        
        if (isActive) {
            // Close
            DOM.sidebar.el.classList.remove('active');
            DOM.sidebar.overlay.classList.remove('active');
            setTimeout(() => DOM.sidebar.overlay.classList.add('hidden'), 300); // Wait for transition
        } else {
            // Open
            DOM.sidebar.overlay.classList.remove('hidden');
            // Force reflow
            void DOM.sidebar.overlay.offsetWidth;
            DOM.sidebar.overlay.classList.add('active');
            DOM.sidebar.el.classList.add('active');
        }
        UI.vibrate();
    },

    // --- FAB Logic (Staggered Animation) ---
    toggleFab: () => {
        const menu = DOM.fab.menu;
        const icon = DOM.fab.icon;
        const isOpen = menu.style.display === 'flex';

        if (isOpen) {
            // Close Animation
            menu.style.opacity = '0';
            menu.style.transform = 'translateY(20px) scale(0.9)';
            icon.classList.remove('fa-rotate-45');
            setTimeout(() => menu.style.display = 'none', 200);
        } else {
            // Open Animation
            menu.style.display = 'flex';
            void menu.offsetWidth; // Trigger reflow
            menu.style.opacity = '1';
            menu.style.transform = 'translateY(0) scale(1)';
            icon.classList.add('fa-rotate-45');
        }
        UI.vibrate();
    },

    // --- Search Logic ---
    toggleSearch: () => {
        const layer = DOM.search.layer;
        const input = DOM.search.input;
        
        if (layer.classList.contains('hidden')) {
            // Open
            layer.classList.remove('hidden');
            requestAnimationFrame(() => {
                layer.classList.add('active');
                input.focus();
            });
            State.searchActive = true;
        } else {
            // Close
            layer.classList.remove('active');
            setTimeout(() => {
                layer.classList.add('hidden');
                input.value = ''; // Clear input
                DOM.search.results.innerHTML = ''; // Clear results
            }, 300);
            State.searchActive = false;
        }
        UI.vibrate();
    },

    toggleSettings: () => {
        const modal = DOM.settingsModal;
        if (modal.classList.contains('hidden')) {
            modal.classList.remove('hidden');
            // Sync UI with State
            const themeSelect = document.getElementById('theme-selector');
            const proxyCheck = document.getElementById('proxy-toggle');
            if(themeSelect) themeSelect.value = State.settings.theme;
            if(proxyCheck) proxyCheck.checked = State.settings.useProxy;
        } else {
            modal.classList.add('hidden');
        }
        UI.vibrate();
    },

    // --- Theme Engine ---
    applyTheme: (themeName) => {
        if (!CONFIG.settings.themes.includes(themeName)) return;
        
        document.documentElement.setAttribute('data-theme', themeName);
        State.settings.theme = themeName;
        localStorage.setItem('vault_settings', JSON.stringify(State.settings));
        
        // Update Metadata color for mobile browsers
        const metaThemeColor = document.querySelector('meta[name="theme-color"]');
        if (metaThemeColor) {
            metaThemeColor.setAttribute('content', themeName === 'light' ? '#f5f5f7' : '#050505');
        }
    },

    // --- Feedback Systems ---
    vibrate: (pattern = 20) => {
        if (navigator.vibrate) navigator.vibrate(pattern);
    },

    toast: (msg, type = 'info') => {
        const el = document.createElement('div');
        el.className = 'toast';
        
        // Icon Selection
        let icon = '<i class="fa-solid fa-circle-info"></i>';
        if (type === 'success') {
            el.style.border = '1px solid var(--success)';
            icon = '<i class="fa-solid fa-circle-check" style="color:var(--success)"></i>';
        } else if (type === 'error') {
            el.style.border = '1px solid var(--danger)';
            icon = '<i class="fa-solid fa-triangle-exclamation" style="color:var(--danger)"></i>';
        }

        el.innerHTML = `${icon} <span>${msg}</span>`;
        DOM.toastArea.appendChild(el);
        
        // Haptic for error
        if (type === 'error') UI.vibrate([50, 50, 50]);

        // Auto remove
        setTimeout(() => {
            el.style.opacity = '0';
            el.style.transform = 'translateY(20px)';
            setTimeout(() => el.remove(), 300);
        }, 3000);
    },

    // --- Loading State ---
    showBootLoader: (show) => {
        if (show) {
            DOM.layers.boot.classList.remove('hidden');
            DOM.layers.boot.style.opacity = '1';
        } else {
            DOM.layers.boot.style.opacity = '0';
            setTimeout(() => DOM.layers.boot.classList.add('hidden'), 500);
        }
    }
};
// =========================================================
// 5. AUTHENTICATION MODULE (Security & Identity)
// =========================================================
const Auth = {
    buffer: "", // Stores typed PIN digits temporary

    // --- System Boot & Session Check ---
    init: () => {
        // 1. Boot Animation Handling
        setTimeout(() => {
            if (DOM.layers.boot) {
                DOM.layers.boot.style.opacity = '0';
                setTimeout(() => DOM.layers.boot.classList.add('hidden'), 500);
            }
            
            // 2. Session Recovery
            const session = JSON.parse(sessionStorage.getItem('vault_session'));
            if (session && session.expiry > Date.now()) {
                State.token = session.token;
                State.user = session.user;
                State.isAuthenticated = true;
                
                // Load User Data to UI
                Auth.loadUserUI();
                
                // Check if Token needs refresh (if < 45 mins remaining)
                const timeUntilExpiry = session.expiry - Date.now();
                if (timeUntilExpiry < (CONFIG.security.tokenRefreshMinutes * 60 * 1000)) {
                    Logger.log("Token expiring soon, refreshing...");
                    Auth.signIn(true); // Silent Refresh
                } else {
                    Drive.list(State.currentFolder);
                }
            } else {
                // No valid session -> Show PIN Screen
                DOM.layers.auth.classList.remove('hidden');
                Logger.log("System Locked. Waiting for PIN.");
            }
        }, 2000); // 2s Artificial Boot Delay for UX
    },

    // --- PIN Entry Logic ---
    typePin: (num) => {
        if (Auth.buffer.length < CONFIG.security.pinLength) {
            Auth.buffer += num;
            Auth.updatePinUI();
            UI.vibrate(10); // Haptic
            
            // Auto Verify when length reached
            if (Auth.buffer.length === CONFIG.security.pinLength) {
                setTimeout(Auth.verifyPin, 100);
            }
        }
    },

    updatePinUI: () => {
        DOM.auth.pinDots.forEach((dot, index) => {
            if (index < Auth.buffer.length) dot.classList.add('active');
            else dot.classList.remove('active');
        });
    },

    clearPin: () => {
        Auth.buffer = "";
        Auth.updatePinUI();
        DOM.auth.msg.innerText = "System Locked";
        DOM.auth.msg.style.color = "var(--text-sec)";
        DOM.auth.pinDots.forEach(d => d.classList.remove('error'));
    },

    verifyPin: () => {
        // In production, compare with hashed PIN. 
        // Default fallback: "1234"
        const savedPin = State.settings.pin || "1234";
        
        if (Auth.buffer === savedPin) {
            // Success
            DOM.auth.msg.innerText = CONFIG.success.unlocked;
            DOM.auth.msg.style.color = "var(--success)";
            UI.vibrate([50, 50]);
            
            setTimeout(() => {
                if (!State.token) {
                    Auth.signIn(); // Trigger Google Login
                } else {
                    Auth.unlock();
                }
            }, 500);
        } else {
            // Failure
            DOM.auth.pinDots.forEach(d => d.classList.add('error'));
            DOM.auth.msg.innerText = CONFIG.errors.pinInvalid;
            DOM.auth.msg.style.color = "var(--danger)";
            UI.vibrate([100, 50, 100]);
            setTimeout(Auth.clearPin, 800);
        }
    },

    // --- Google OAuth 2.0 Integration ---
    signIn: (silent = false) => {
        if (typeof google === 'undefined') {
            UI.toast(CONFIG.errors.network, "error");
            return;
        }

        const client = google.accounts.oauth2.initTokenClient({
            client_id: CONFIG.googleOAuth.clientId,
            scope: CONFIG.googleOAuth.scope,
            callback: (response) => {
                if (response.access_token) {
                    State.token = response.access_token;
                    
                    if (!silent) {
                        Auth.fetchUserInfo();
                    } else {
                        Logger.log("Token Refreshed Silently");
                        // Update session storage with new time
                        Auth.updateSessionStorage();
                    }
                } else {
                    UI.toast(CONFIG.errors.authInvalid, "error");
                }
            },
        });
        
        // Silent refresh avoids popup if consent already given
        if (silent) {
            client.requestAccessToken({ prompt: '' });
        } else {
            client.requestAccessToken();
        }
    },

    fetchUserInfo: async () => {
        try {
            const res = await fetch(CONFIG.googleOAuth.userInfoEndpoint, {
                headers: { 'Authorization': `Bearer ${State.token}` }
            });
            
            if (!res.ok) throw new Error('User info fetch failed');
            
            const user = await res.json();
            State.user = user;
            State.isAuthenticated = true;
            
            Auth.updateSessionStorage();
            Auth.loadUserUI();
            Auth.unlock();
            
            UI.toast(`Welcome back, ${user.given_name || 'User'}`);
        } catch (e) {
            Logger.error("Auth Error", e);
            UI.toast(CONFIG.errors.authInvalid, "error");
        }
    },

    updateSessionStorage: () => {
        if (!State.user || !State.token) return;
        const expiryTime = Date.now() + (CONFIG.security.sessionHours * 60 * 60 * 1000);
        
        sessionStorage.setItem('vault_session', JSON.stringify({
            token: State.token,
            user: State.user,
            expiry: expiryTime
        }));
    },

    loadUserUI: () => {
        if (!State.user) return;
        
        // Update DOM elements using Cache
        if (DOM.header.userName) DOM.header.userName.innerText = State.user.name;
        if (DOM.header.userEmail) DOM.header.userEmail.innerText = State.user.email;
        if (DOM.sidebar.email) DOM.sidebar.email.innerText = State.user.email;
        if (DOM.header.userAvatar) DOM.header.userAvatar.src = State.user.picture;
    },

    unlock: () => {
        DOM.layers.auth.classList.add('hidden');
        DOM.layers.app.classList.remove('hidden');
        // Initial Drive Load
        Drive.list(CONFIG.drive.rootFolderId);
    },

    logout: () => {
        if (CONFIG.security.clearOnLock) {
            sessionStorage.removeItem('vault_session');
        }
        // Google Revoke (Optional security step)
        if (State.token) {
            // google.accounts.oauth2.revoke(State.token, () => { console.log('Revoked'); });
        }
        location.reload();
    }
};

// =========================================================
// 6. DRIVE ENGINE (File System Management)
// =========================================================
const Drive = {
    // --- API Indexing ---
    list: async (folderId) => {
        State.currentFolder = folderId;
        
        // 1. Set Loading State (Skeleton UI)
        DOM.grid.innerHTML = '';
        Drive.renderSkeleton(12); 
        Drive.updateBreadcrumbs(folderId);

        // 2. Build Query based on Drive Mode
        let query = "";
        
        if (State.driveMode === 'my') {
            query = `'${folderId}' in parents and trashed = false`;
        } else if (State.driveMode === 'starred') {
            query = `starred = true and trashed = false`;
        } else if (State.driveMode === 'trash') {
            query = `trashed = true`;
        } else if (State.driveMode === 'vault') {
            // Shared drive logic (requires 'driveId' in params)
            UI.toast("Shared Vault: Demo Mode (Root)", "info");
            query = `'${CONFIG.drive.rootFolderId}' in parents and trashed = false`; 
        }

        // 3. Construct API URL
        const params = new URLSearchParams({
            q: query,
            fields: CONFIG.drive.defaultFields,
            pageSize: CONFIG.drive.pageSize,
            orderBy: CONFIG.drive.orderBy,
            supportsAllDrives: true,
            includeItemsFromAllDrives: true
        });

        const url = `${CONFIG.drive.apiBase}/files?${params.toString()}`;

        try {
            const res = await fetch(url, {
                headers: { 'Authorization': `Bearer ${State.token}` }
            });
            
            // Handle 401 (Expired Token)
            if (res.status === 401) {
                Logger.log("401 Unauthorized -> Refreshing");
                Auth.signIn(true); 
                return;
            }
            
            if (!res.ok) throw new Error(`Drive API Error: ${res.status}`);

            const data = await res.json();
            State.files = data.files || [];
            
            // 4. Render Data
            Drive.render(State.files);
            Drive.getQuota();

        } catch (e) {
            Logger.error("Listing Failed", e);
            DOM.grid.innerHTML = `
                <div class="empty-state" style="grid-column:1/-1; text-align:center; padding:50px; opacity:0.5;">
                    <i class="fa-solid fa-triangle-exclamation" style="font-size:40px; margin-bottom:10px; color:var(--danger)"></i>
                    <div>${CONFIG.errors.network}</div>
                </div>`;
            UI.toast(CONFIG.errors.network, "error");
        }
    },

    // --- High Fidelity Rendering ---
    render: (files) => {
        DOM.grid.innerHTML = ''; // Remove skeleton

        if (files.length === 0) {
            const icon = State.driveMode === 'trash' ? CONFIG.icons.trash : CONFIG.icons.folder;
            DOM.grid.innerHTML = `
                <div class="empty-state" style="grid-column:1/-1; text-align:center; padding:60px 20px; color:var(--text-sec);">
                    <div style="font-size:50px; margin-bottom:15px; opacity:0.3;">${icon}</div>
                    <div>Nothing to see here</div>
                </div>`;
            return;
        }

        files.forEach(file => {
            const el = document.createElement('div');
            el.className = 'file-card';
            
            // 1. Thumbnail Generation
            let thumbHTML = '';
            
            if (file.mimeType.includes('folder')) {
                thumbHTML = `<div class="thumb-wrapper" style="background:rgba(255,204,0,0.1); color:#ffcc00">${CONFIG.icons.folder}</div>`;
            } else if (file.thumbnailLink && State.settings.showThumbnails) {
                // Upgrade thumbnail quality (s220 -> s400)
                const hqThumb = file.thumbnailLink.replace('s220', 's400');
                // Apply Proxy if enabled in settings
                const src = State.settings.useProxy ? hqThumb : hqThumb; 
                
                thumbHTML = `
                    <div class="thumb-wrapper">
                        <img src="${src}" class="thumb-img" referrerpolicy="no-referrer" loading="lazy" 
                             onerror="this.parentElement.innerHTML='${CONFIG.icons.default}'">
                    </div>`;
            } else {
                // Fallback Icons based on Mime
                let icon = CONFIG.icons.default;
                if (CONFIG.fileTypes.images.some(t => file.mimeType.includes(t))) icon = CONFIG.icons.image;
                else if (CONFIG.fileTypes.videos.some(t => file.mimeType.includes(t))) icon = CONFIG.icons.video;
                else if (CONFIG.fileTypes.audio.some(t => file.mimeType.includes(t))) icon = CONFIG.icons.audio;
                else if (CONFIG.fileTypes.code.some(t => file.mimeType.includes(t))) icon = CONFIG.icons.code;
                else if (file.mimeType.includes('pdf')) icon = CONFIG.icons.pdf;
                
                thumbHTML = `<div class="thumb-wrapper">${icon}</div>`;
            }

            // 2. Metadata
            const sizeStr = file.mimeType.includes('folder') ? 'Folder' : Drive.formatBytes(file.size);
            
            // 3. Assemble Card
            el.innerHTML = `
                ${thumbHTML}
                <div class="file-info">
                    <div class="file-name" title="${file.name}">${file.name}</div>
                    <div class="file-meta">${sizeStr}</div>
                </div>
            `;

            // 4. Attach Events (Touch/Click/Context)
            Drive.attachFileEvents(el, file);
            DOM.grid.appendChild(el);
        });
    },

    attachFileEvents: (el, file) => {
        // Single Click / Tap
        el.onclick = () => {
            if (file.mimeType === 'application/vnd.google-apps.folder') {
                State.parents.push({id: State.currentFolder, name: 'Back'}); 
                Drive.list(file.id);
            } else {
                // If Ops module exists, call preview
                if (window.Ops) Ops.preview(file);
            }
        };

        // Right Click / Long Press
        el.oncontextmenu = (e) => {
            e.preventDefault();
            if (window.Ops) Ops.openContext(e, file);
        };
    },

    // --- Utilities ---
    renderSkeleton: (count) => {
        for(let i=0; i<count; i++) {
            const skel = document.createElement('div');
            skel.className = 'file-card loading';
            skel.innerHTML = `
                <div class="thumb-wrapper"></div>
                <div class="file-info" style="width:80%">
                    <div class="file-name" style="height:10px; background:var(--surface-2); border-radius:4px; margin-bottom:5px;"></div>
                </div>`;
            DOM.grid.appendChild(skel);
        }
    },

    formatBytes: (bytes, decimals = 1) => {
        if (!bytes) return '0 B';
        const k = 1024;
        const dm = decimals < 0 ? 0 : decimals;
        const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
    },

    updateBreadcrumbs: (currentId) => {
        const bread = DOM.breadcrumbs;
        if (currentId === CONFIG.drive.rootFolderId) {
            State.parents = [];
            bread.innerHTML = `<span class="crumb active" onclick="Drive.list('${CONFIG.drive.rootFolderId}')"><i class="fa-solid fa-hdd"></i> Root</span>`;
        } else {
            bread.innerHTML = `
                <span class="crumb" onclick="Drive.navigateUp()"><i class="fa-solid fa-arrow-left"></i> Back</span>
                <span class="crumb active">/${currentId.substr(0, 6)}...</span>
            `;
        }
    },

    navigateUp: () => {
        if (State.parents.length > 0) {
            const prev = State.parents.pop();
            Drive.list(prev.id);
        } else {
            Drive.list(CONFIG.drive.rootFolderId);
        }
    },
    
    getQuota: async () => {
        try {
            const res = await fetch(`${CONFIG.drive.aboutEndpoint}?fields=storageQuota`, {
                headers: { 'Authorization': `Bearer ${State.token}` }
            });
            const data = await res.json();
            const used = parseInt(data.storageQuota.usage);
            const limit = parseInt(data.storageQuota.limit);
            
            // Update UI
            const percent = ((used / limit) * 100).toFixed(1);
            if (DOM.storage.bar) DOM.storage.bar.style.width = `${percent}%`;
            if (DOM.storage.text) DOM.storage.text.innerText = `${percent}%`;
            if (DOM.storage.used) DOM.storage.used.innerText = Drive.formatBytes(used);
            if (DOM.storage.total) DOM.storage.total.innerText = Drive.formatBytes(limit);
            
            // Warning Colors
            if (percent > 80) DOM.storage.bar.style.background = 'var(--warning)';
            if (percent > 90) DOM.storage.bar.style.background = 'var(--danger)';
            
        } catch(e) {
            Logger.error("Quota Fetch Error", e);
        }
    },

    switchMode: (mode) => {
        State.driveMode = mode;
        
        // Visual Feedback on Sidebar
        if (DOM.sidebar.navItems) {
            DOM.sidebar.navItems.forEach(btn => btn.classList.remove('active'));
            const activeBtn = document.getElementById(`nav-${mode}`);
            if (activeBtn) activeBtn.classList.add('active');
        }
        
        Drive.list(CONFIG.drive.rootFolderId);
        UI.toast(`Switched to ${mode.toUpperCase()} Mode`);
    }
};
// =========================================================
// 7. TRANSFER ENGINE (Resumable Uploads)
// =========================================================
const Transfer = {
    // --- File Handling Entry Point ---
    handleFiles: async (fileList) => {
        const files = Array.from(fileList);
        if (files.length === 0) return;

        // Show Tray
        if (DOM.uploadTray.panel) {
            DOM.uploadTray.panel.classList.remove('hidden');
        }
        
        // Process Queue
        for (const file of files) {
            // Validate Size
            if (file.size > CONFIG.drive.maxFileSize) {
                UI.toast(`${CONFIG.errors.fileTooLarge}: ${file.name}`, 'error');
                continue;
            }
            
            // Add to Queue & Start
            State.uploadQueue.push(file);
            await Transfer.uploadFile(file);
        }
    },

    // --- Core Resumable Upload Logic ---
    uploadFile: async (file) => {
        // 1. Create UI Element in Tray
        const itemID = 'up-' + Date.now() + Math.floor(Math.random() * 1000);
        const item = document.createElement('div');
        item.className = 'upload-item'; // CSS class from Part 7
        item.id = itemID;
        item.innerHTML = `
            <div style="display:flex; justify-content:space-between; margin-bottom:4px; font-size:11px;">
                <span style="font-weight:bold; max-width:180px; overflow:hidden; text-overflow:ellipsis; white-space:nowrap;">
                    ${file.name}
                </span>
                <span class="status">0%</span>
            </div>
            <div style="height:4px; background:rgba(255,255,255,0.1); border-radius:2px; overflow:hidden;">
                <div class="bar" style="width:0%; height:100%; background:var(--primary); transition:width 0.2s;"></div>
            </div>
            <div style="height:1px; background:rgba(255,255,255,0.05); margin-top:8px;"></div>
        `;
        
        if (DOM.uploadTray.list) {
            DOM.uploadTray.list.prepend(item);
        }

        try {
            // 2. Prepare Metadata
            const metadata = {
                name: file.name,
                mimeType: file.type || 'application/octet-stream',
                parents: [State.currentFolder]
            };

            // 3. Initiate Session (POST)
            const sessionUrl = `${CONFIG.drive.uploadEndpoint}?uploadType=resumable`;
            const sessionRes = await fetch(sessionUrl, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${State.token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(metadata)
            });

            if (!sessionRes.ok) throw new Error('Failed to create upload session');
            
            // Get Upload URL from Headers
            const uploadUrl = sessionRes.headers.get('Location');
            
            // 4. Chunk Upload Loop (PUT)
            const chunkSize = CONFIG.drive.chunkSize;
            let offset = 0;
            let retries = 0;

            while (offset < file.size) {
                const chunk = file.slice(offset, offset + chunkSize);
                const end = Math.min(offset + chunkSize, file.size);
                
                try {
                    const res = await fetch(uploadUrl, {
                        method: 'PUT',
                        headers: {
                            'Content-Range': `bytes ${offset}-${end - 1}/${file.size}`
                        },
                        body: chunk
                    });

                    // 308 = Resume Incomplete (Chunk Success), 200/201 = Final Success
                    if (res.status === 308 || res.status === 200 || res.status === 201) {
                        // Update Progress
                        offset = end;
                        const percent = Math.round((offset / file.size) * 100);
                        
                        // UI Update
                        const el = document.getElementById(itemID);
                        if (el) {
                            el.querySelector('.bar').style.width = `${percent}%`;
                            el.querySelector('.status').innerText = `${percent}%`;
                        }

                        // Complete
                        if (res.status === 200 || res.status === 201) {
                            if (el) {
                                el.querySelector('.status').innerHTML = '<i class="fa-solid fa-check" style="color:var(--success)"></i>';
                                el.querySelector('.bar').style.background = 'var(--success)';
                            }
                            UI.toast(`${CONFIG.success.uploaded}: ${file.name}`, 'success');
                            Drive.list(State.currentFolder); // Refresh Grid
                            break;
                        }
                    } else {
                        throw new Error(`Upload Error: ${res.status}`);
                    }
                } catch (chunkErr) {
                    // Retry Logic
                    if (retries < CONFIG.drive.maxUploadRetries) {
                        retries++;
                        Logger.log(`Retrying chunk... (${retries})`);
                        await new Promise(r => setTimeout(r, 1000 * retries)); // Exponential backoff
                    } else {
                        throw chunkErr;
                    }
                }
            }
        } catch (e) {
            Logger.error("Upload Failed", e);
            const el = document.getElementById(itemID);
            if (el) {
                el.querySelector('.status').innerText = 'Failed';
                el.querySelector('.bar').style.background = 'var(--danger)';
            }
            UI.toast(CONFIG.errors.uploadFailed, 'error');
        }
    }
};

// =========================================================
// 8. OPERATIONS MODULE (Context Menu Actions)
// =========================================================
const Ops = {
    activeFile: null, // Stores the file currently right-clicked

    // --- Context Menu Trigger ---
    openContext: (e, file) => {
        Ops.activeFile = file;
        const menu = DOM.contextMenu;
        
        // Prevent default browser menu
        e.preventDefault();
        e.stopPropagation();

        // Calculate Position (Smart Boundary Detection)
        let x = e.pageX || e.touches[0].pageX;
        let y = e.pageY || e.touches[0].pageY;
        
        const winW = window.innerWidth;
        const winH = window.innerHeight;
        const menuW = 200; // Approx width
        const menuH = 250; // Approx height

        if (x + menuW > winW) x = winW - menuW - 10;
        if (y + menuH > winH) y = winH - menuH - 10;

        // Apply Styles
        menu.style.left = `${x}px`;
        menu.style.top = `${y}px`;
        menu.style.display = 'block';
        
        // Haptic Feedback
        UI.vibrate(15);
    },

    // --- Action: Preview ---
    preview: (file = Ops.activeFile) => {
        if (!file) return;
        
        // If folder, navigate into it
        if (file.mimeType.includes('folder')) {
            State.parents.push({ id: State.currentFolder, name: 'Back' });
            Drive.list(file.id);
        } 
        // If file, try opening webLink
        else if (file.webViewLink) {
            window.open(file.webViewLink, '_blank');
        } 
        else {
            UI.toast(CONFIG.errors.unknown, "error");
        }
        
        // Hide menu
        DOM.contextMenu.style.display = 'none';
    },

    // --- Action: Download (Smart Proxy) ---
    download: async () => {
        const file = Ops.activeFile;
        if (!file) return;
        
        DOM.contextMenu.style.display = 'none';
        UI.toast("Preparing download...", "info");

        // Attempt 1: Direct Download (Native)
        // Works if token is valid and CORS is allowed (rare for media)
        const directUrl = `${CONFIG.drive.apiBase}/files/${file.id}?alt=media`;
        
        try {
            const res = await fetch(directUrl, {
                headers: { 'Authorization': `Bearer ${State.token}` }
            });
            
            if (!res.ok) throw new Error('CORS blocked or Network Error');
            
            const blob = await res.blob();
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = file.name;
            document.body.appendChild(a);
            a.click();
            a.remove();
            window.URL.revokeObjectURL(url);
            
            UI.toast("Download started", "success");
            
        } catch (e) {
            // Attempt 2: Proxy Fallback (If enabled in Settings)
            if (State.settings.useProxy) {
                Logger.log("Direct download failed. Switching to Proxy.");
                UI.toast("Using secure proxy...", "warning");
                
                // Construct Proxy URL from Config
                // Template: .../exec?id={fileId}&download=true
                let proxyUrl = CONFIG.mediaProxies.fullAccess
                    .replace('{fileId}', file.id)
                    .replace('{true/false}', 'true');
                
                // Fallback construction if replace failed
                if (!proxyUrl.includes('?')) {
                    proxyUrl = `${CONFIG.mediaProxies.fullAccess}?id=${file.id}&download=true`;
                }
                
                window.open(proxyUrl, '_blank');
            } else {
                UI.toast(CONFIG.errors.network, "error");
            }
        }
    },

    // --- Action: Delete ---
    delete: async () => {
        const file = Ops.activeFile;
        if (!file) return;
        
        DOM.contextMenu.style.display = 'none';

        if (CONFIG.settings.confirmDelete && !confirm(`Delete "${file.name}"?`)) return;

        try {
            // Optimistic UI Update (Fade out card immediately)
            const card = Array.from(document.querySelectorAll('.file-name'))
                .find(el => el.innerText === file.name)
                ?.closest('.file-card');
            
            if (card) card.style.opacity = '0.3';

            await fetch(`${CONFIG.drive.apiBase}/files/${file.id}`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${State.token}` }
            });
            
            UI.toast(CONFIG.success.deleted, "success");
            Drive.list(State.currentFolder); // Refresh
            
        } catch (e) {
            UI.toast(CONFIG.errors.deleteFailed, "error");
            if (card) card.style.opacity = '1'; // Revert
        }
    },

    // --- Action: Share ---
    share: async () => {
        const file = Ops.activeFile;
        if (!file) return;
        DOM.contextMenu.style.display = 'none';

        if (navigator.share && file.webViewLink) {
            try {
                await navigator.share({
                    title: file.name,
                    text: 'Shared via Vault OS',
                    url: file.webViewLink
                });
            } catch (e) { /* Share cancelled */ }
        } else {
            await navigator.clipboard.writeText(file.webViewLink);
            UI.toast(CONFIG.success.copied, "success");
        }
    },

    // --- Action: Copy/Move (Clipboard Logic) ---
    copy: () => { Ops.addToClipboard('copy'); },
    move: () => { Ops.addToClipboard('move'); },

    addToClipboard: (type) => {
        if (!Ops.activeFile) return;
        DOM.contextMenu.style.display = 'none';
        
        State.clipboard = { type: type, items: [Ops.activeFile] };
        UI.toast(type === 'copy' ? "Copied to clipboard" : "Cut for move", "info");
        
        // Show Paste Button in FAB
        Ops.showPasteButton();
    },

    showPasteButton: () => {
        // Dynamic Paste Button Injection
        const menu = DOM.fab.menu;
        const existingBtn = document.getElementById('fab-paste-btn');
        if (existingBtn) existingBtn.remove();

        const item = document.createElement('div');
        item.className = 'fab-item';
        item.id = 'fab-paste-btn';
        item.innerHTML = `
            <span class="label" style="background:var(--primary); color:#000; font-weight:bold;">PASTE HERE</span>
            <button style="background:var(--primary); color:#000;"><i class="fa-solid fa-paste"></i></button>
        `;
        item.onclick = Ops.paste;
        
        menu.prepend(item);
        
        // Auto open FAB to show option
        if (menu.style.display !== 'flex') UI.toggleFab();
    },

    // --- Action: Paste ---
    paste: async () => {
        if (!State.clipboard.items.length) return;
        
        const file = State.clipboard.items[0]; // Single file support for now
        const folderId = State.currentFolder;
        const type = State.clipboard.type;
        
        // Remove Paste Button
        document.getElementById('fab-paste-btn').remove();
        UI.toggleFab(); // Close menu
        UI.toast("Processing...", "info");

        try {
            if (type === 'copy') {
                // Copy API
                await fetch(`${CONFIG.drive.apiBase}/files/${file.id}/copy`, {
                    method: 'POST',
                    headers: { 
                        'Authorization': `Bearer ${State.token}`,
                        'Content-Type': 'application/json' 
                    },
                    body: JSON.stringify({ parents: [folderId], name: file.name })
                });
                UI.toast(CONFIG.success.copied, "success");
            } else {
                // Move API (Patch parents)
                const prevParents = file.parents ? file.parents.join(',') : '';
                const url = `${CONFIG.drive.apiBase}/files/${file.id}?addParents=${folderId}&removeParents=${prevParents}`;
                
                await fetch(url, {
                    method: 'PATCH',
                    headers: { 'Authorization': `Bearer ${State.token}` }
                });
                UI.toast(CONFIG.success.moved, "success");
            }
            Drive.list(folderId); // Refresh
        } catch (e) {
            Logger.error("Paste Failed", e);
            UI.toast(CONFIG.errors.unknown, "error");
        }
        
        // Clear Clipboard
        State.clipboard = { type: null, items: [] };
    }
};
// =========================================================
// 9. SEARCH ENGINE (Real-time Query System)
// =========================================================
const Search = {
    debounceTimer: null,

    // --- Input Handler (Debounced) ---
    handleInput: (term) => {
        // Clear previous timer to prevent too many API calls
        clearTimeout(Search.debounceTimer);
        
        // Wait for user to stop typing (e.g., 300ms)
        Search.debounceTimer = setTimeout(() => {
            Search.query(term);
        }, CONFIG.settings.debounceSearch);
    },

    // --- Execute Search ---
    query: async (term) => {
        const resultsContainer = DOM.search.results;
        
        // Minimum 3 chars required
        if (!term || term.length < 3) {
            resultsContainer.innerHTML = '';
            return;
        }
        
        // Show Loading State
        resultsContainer.innerHTML = `
            <div style="padding:20px; text-align:center; color:var(--text-sec); font-size:12px;">
                <i class="fa-solid fa-circle-notch fa-spin"></i> Searching "${term}"...
            </div>`;
        
        // Construct Query: Name contains term AND Not Trashed
        const q = `name contains '${term}' and trashed = false`;
        
        // Only fetch necessary fields for search results
        const searchFields = "files(id,name,mimeType,thumbnailLink,parents,webViewLink)";
        const url = `${CONFIG.drive.apiBase}/files?q=${encodeURIComponent(q)}&fields=${searchFields}&pageSize=10`;
        
        try {
            const res = await fetch(url, {
                headers: { 'Authorization': `Bearer ${State.token}` }
            });
            
            if (!res.ok) throw new Error('Search API Error');
            
            const data = await res.json();
            Search.renderResults(data.files || []);
            
        } catch (e) {
            Logger.error("Search Failed", e);
            resultsContainer.innerHTML = `
                <div style="color:var(--danger); padding:15px; text-align:center; font-size:12px;">
                    ${CONFIG.errors.network}
                </div>`;
        }
    },

    // --- Render Results ---
    renderResults: (files) => {
        const container = DOM.search.results;
        container.innerHTML = '';

        if (files.length === 0) {
            container.innerHTML = `
                <div style="padding:15px; text-align:center; opacity:0.6; font-size:12px;">
                    No results found
                </div>`;
            return;
        }

        files.forEach(file => {
            const item = document.createElement('div');
            item.className = 'nav-item'; // Reuse sidebar item styling
            item.style.borderBottom = '1px solid rgba(255,255,255,0.05)';
            item.style.borderRadius = '0';
            item.style.margin = '0';
            
            // Icon Logic
            let icon = '<i class="fa-solid fa-file"></i>';
            if(file.mimeType.includes('folder')) icon = '<i class="fa-solid fa-folder" style="color:#ffcc00"></i>';
            else if(file.mimeType.includes('image')) icon = '<i class="fa-solid fa-file-image" style="color:var(--primary)"></i>';
            else if(file.mimeType.includes('pdf')) icon = '<i class="fa-solid fa-file-pdf" style="color:var(--danger)"></i>';

            item.innerHTML = `${icon} <span style="font-size:13px; white-space:nowrap; overflow:hidden; text-overflow:ellipsis;">${file.name}</span>`;
            
            // Interaction
            item.onclick = () => {
                if (file.mimeType.includes('folder')) {
                    State.parents.push({id: State.currentFolder, name: 'Search Result'});
                    Drive.list(file.id);
                } else {
                    Ops.preview(file);
                }
                UI.toggleSearch(); // Close search overlay
            };
            
            container.appendChild(item);
        });
    }
};
// =========================================================
// 10. SYSTEM EVENTS (Drag-Drop, Shortcuts, Init)
// =========================================================

// --- 1. Global Drag & Drop Handler ---
// Prevent default browser behavior (opening file in tab)
const dragEvents = ['dragenter', 'dragover', 'dragleave', 'drop'];
dragEvents.forEach(eventName => {
    document.body.addEventListener(eventName, preventDefaults, false);
});

function preventDefaults(e) {
    e.preventDefault();
    e.stopPropagation();
}

// Visual Feedback (Overlay)
document.body.addEventListener('dragenter', () => {
    if (!State.isDragging) {
        document.body.classList.add('drag-active');
        State.isDragging = true;
    }
});

document.body.addEventListener('dragleave', (e) => {
    // Only remove if leaving the window boundary
    if (e.clientX <= 0 || e.clientY <= 0 || e.clientX >= window.innerWidth || e.clientY >= window.innerHeight) {
        document.body.classList.remove('drag-active');
        State.isDragging = false;
    }
});

document.body.addEventListener('drop', (e) => {
    document.body.classList.remove('drag-active');
    State.isDragging = false;
    
    const dt = e.dataTransfer;
    const files = dt.files;
    
    if (files.length > 0) {
        UI.toast(`Queued ${files.length} files for upload`, 'info');
        Transfer.handleFiles(files);
    }
});

// --- 2. Keyboard Shortcuts ---
document.addEventListener('keydown', (e) => {
    // ESC - Close All Overlays
    if (e.key === 'Escape') {
        // Priority: Search > Context Menu > Modals > Sidebar
        if (DOM.search.layer.classList.contains('active')) {
            UI.toggleSearch();
        } 
        else if (DOM.contextMenu.style.display === 'block') {
            DOM.contextMenu.style.display = 'none';
        }
        else if (!DOM.settingsModal.classList.contains('hidden')) {
            UI.toggleSettings();
        }
        else if (DOM.sidebar.el.classList.contains('active')) {
            UI.toggleSidebar();
        }
    }

    // Ctrl + V (Paste)
    if ((e.ctrlKey || e.metaKey) && e.key === 'v') {
        // Only if not typing in an input
        if (document.activeElement.tagName !== 'INPUT') {
            if (State.clipboard.items.length > 0) {
                e.preventDefault();
                Ops.paste();
            }
        }
    }

    // Delete Key
    if (e.key === 'Delete') {
        if (Ops.activeFile && document.activeElement.tagName !== 'INPUT') {
            Ops.delete();
        }
    }
});

// --- 3. Search Input Binding ---
if (DOM.search.input) {
    DOM.search.input.addEventListener('input', (e) => {
        Search.handleInput(e.target.value);
    });
    
    // Enter key immediate search
    DOM.search.input.addEventListener('keyup', (e) => {
        if (e.key === 'Enter') {
            clearTimeout(Search.debounceTimer);
            Search.query(e.target.value);
        }
    });
}

// --- 4. Window Resize Handling (Mobile/Desktop switch) ---
window.addEventListener('resize', () => {
    // If resized to desktop, ensure sidebar overlay is hidden
    if (window.innerWidth > 768) {
        DOM.sidebar.overlay.classList.add('hidden');
        DOM.sidebar.el.classList.remove('active');
    }
});

// =========================================================
// 11. KERNEL BOOT
// =========================================================
window.onload = () => {
    Logger.log("System Booting...");
    
    // Initialize UI Components
    UI.init();
    
    // Start Authentication Sequence
    Auth.init();
    
    // Debug Info
    if (CONFIG.debug.enabled) {
        console.log(`%c ${CONFIG.app.name} v${CONFIG.app.version} Online `, "background: #00f3ff; color: #000; font-weight: bold; padding: 5px; border-radius: 3px;");
    }
};

/* End of Master Script */

