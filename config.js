/* =========================================
   VAULT OS ULTIMATE - CONFIGURATION
   Complete Firebase + Google Drive Configuration
   Version: 3.0.0 - Production Ready
   ========================================= */

// ==================== FIREBASE CONFIGURATION ====================
const FIREBASE_CONFIG = {
    apiKey: "AIzaSyB3Iy1MIbfmJ7h5rv9NlsT23ysedCwUZt4",
    authDomain: "encrypted-vault-4683d.firebaseapp.com",
    databaseURL: "https://encrypted-vault-4683d-default-rtdb.firebaseio.com",
    projectId: "encrypted-vault-4683d",
    storageBucket: "encrypted-vault-4683d.firebasestorage.app",
    messagingSenderId: "851257263743",
    appId: "1:851257263743:web:e0d16606bd06f692f5e14a",
    
    // Trusted Domains for OAuth (Important for Security)
    trustedDomains: [
        'https://khademsorder.github.io',
        'https://khademsorder.github.io/Cvault',
        'http://localhost:5500',
        'http://127.0.0.1:5500',
        'http://localhost:8080',
        window.location.origin
    ]
};

// ==================== GOOGLE DRIVE CONFIGURATION ====================
const GOOGLE_CONFIG = {
    // OAuth 2.0 Client ID
    clientId: "318681315152-65e9kofptt4c3bk3kmlj9gmksnasu347.apps.googleusercontent.com",
    apiKey: "AIzaSyB3Iy1MIbfmJ7h5rv9NlsT23ysedCwUZt4",
    
    // Complete Scopes for Full Access
    scopes: [
        'https://www.googleapis.com/auth/drive',           // Full Drive access
        'https://www.googleapis.com/auth/drive.file',      // Create and edit files
        'https://www.googleapis.com/auth/drive.readonly',  // View files
        'https://www.googleapis.com/auth/drive.metadata',  // View metadata
        'https://www.googleapis.com/auth/drive.appdata',   // App-specific data
        'https://www.googleapis.com/auth/drive.scripts',   // Drive scripts
        'https://www.googleapis.com/auth/userinfo.profile', // User profile
        'https://www.googleapis.com/auth/userinfo.email',   // User email
        'https://www.googleapis.com/auth/drive.photos.readonly' // Photos
    ].join(' '),
    
    // Discovery Docs
    discoveryDocs: [
        'https://www.googleapis.com/discovery/v1/apis/drive/v3/rest',
        'https://www.googleapis.com/discovery/v1/apis/oauth2/v2/rest'
    ],
    
    // Root Folder ID
    rootFolderId: "1zIyinAqjQv96QBSuanFS2F0USaG66GPn",
    
    // Media Proxy URLs
    mediaProxy: "https://script.google.com/macros/s/AKfycbxuLPLWzAA8DathQonYo1S3x0kscG2tray0HidaN2vJuz66aQ4_swuKR-ZpE_ZtbkkWbQ/exec",
    fullAccessProxy: "https://script.google.com/macros/s/AKfycbxItLlQHW0NEhhgGedLOxQQFPIdVEqYlGILa2Pd6Rei_kGzpSm67l5mAO3oIJhKvdzEjQ/exec",
    
    // OAuth Configuration
    oauthConfig: {
        responseType: 'token',
        includeGrantedScopes: true,
        prompt: 'consent',
        accessType: 'offline',
        approvalPrompt: 'force'
    }
};

// ==================== APP CONFIGURATION ====================
const APP_CONFIG = {
    // App Information
    name: "Vault OS Ultimate",
    version: "3.0.0",
    developer: "Vault Team",
    repository: "https://github.com/KhademsOrder/Cvault",
    supportEmail: "support@vaultos.com",
    
    // Security Configuration
    security: {
        defaultPin: "1171",
        pinLength: 4,
        sessionTimeout: 24 * 60 * 60 * 1000, // 24 hours
        maxLoginAttempts: 5,
        lockoutTime: 5 * 60 * 1000, // 5 minutes
        autoLock: true,
        autoLockTime: 15 * 60 * 1000, // 15 minutes
        encryption: false // Set to true for end-to-end encryption
    },
    
    // File Operations
    fileOperations: {
        maxUploadSize: 10 * 1024 * 1024 * 1024, // 10GB
        maxUploadFiles: 100,
        maxFolderDepth: 10,
        chunkSize: 5 * 1024 * 1024, // 5MB chunks for large files
        retryAttempts: 3,
        retryDelay: 2000
    },
    
    // Allowed File Types (MIME Types)
    allowedFileTypes: [
        // Images
        'image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp', 
        'image/bmp', 'image/svg+xml', 'image/tiff', 'image/ico', 'image/x-icon',
        
        // Videos
        'video/mp4', 'video/webm', 'video/ogg', 'video/avi', 'video/mov', 
        'video/wmv', 'video/flv', 'video/mkv', 'video/3gpp', 'video/quicktime',
        
        // Audio
        'audio/mpeg', 'audio/mp3', 'audio/wav', 'audio/ogg', 'audio/midi', 
        'audio/x-midi', 'audio/aac', 'audio/flac', 'audio/x-wav', 'audio/webm',
        
        // Documents
        'application/pdf', 'application/msword', 
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'application/vnd.ms-excel',
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'application/vnd.ms-powerpoint',
        'application/vnd.openxmlformats-officedocument.presentationml.presentation',
        'text/plain', 'text/html', 'text/css', 'text/javascript', 'text/markdown',
        
        // Archives
        'application/zip', 'application/x-rar-compressed', 'application/x-7z-compressed',
        'application/x-tar', 'application/gzip', 'application/x-gzip',
        
        // Code & Development
        'application/json', 'application/xml', 'application/javascript',
        'text/x-python', 'text/x-java', 'text/x-c', 'text/x-c++', 'text/x-php',
        
        // Other
        'application/epub+zip', 'application/rtf', 'application/x-latex',
        'font/ttf', 'font/otf', 'font/woff', 'font/woff2'
    ],
    
    // UI Configuration
    ui: {
        defaultView: "grid",
        itemsPerPage: 50,
        thumbnailSize: 200,
        previewSize: 800,
        animations: true,
        transitionSpeed: 300,
        tooltips: true,
        confirmations: true
    },
    
    // Cache Configuration
    cache: {
        enabled: true,
        duration: 24 * 60 * 60 * 1000, // 24 hours
        maxCacheSize: 100 * 1024 * 1024, // 100MB
        offlineSupport: true,
        precacheThumbnails: true
    },
    
    // Sync Configuration
    sync: {
        autoSync: true,
        syncInterval: 30000, // 30 seconds
        syncOnStartup: true,
        syncOnConnection: true,
        backgroundSync: true,
        mobileSync: false,
        lowPowerSync: false,
        conflictResolution: 'server' // 'server', 'client', 'newer'
    },
    
    // Media Player Configuration
    media: {
        video: {
            enabled: true,
            controls: true,
            autoplay: false,
            loop: false,
            muted: false,
            defaultQuality: '720p',
            supportedQualities: ['144p', '240p', '360p', '480p', '720p', '1080p', '1440p', '2160p']
        },
        image: {
            enabled: true,
            zoom: true,
            rotation: true,
            filters: true,
            fullscreen: true,
            slideshow: true,
            slideshowInterval: 3000
        },
        pdf: {
            enabled: true,
            defaultZoom: 'page-width',
            showToolbar: true,
            showThumbnails: true
        },
        zip: {
            enabled: true,
            extract: true,
            preview: true,
            maxExtractSize: 100 * 1024 * 1024 // 100MB
        }
    },
    
    // Performance Configuration
    performance: {
        lazyLoading: true,
        debounceTime: 300,
        throttleTime: 100,
        maxConcurrentUploads: 3,
        maxConcurrentDownloads: 2
    },
    
    // Debug Configuration
    debug: {
        enabled: true,
        logLevel: 'verbose', // 'none', 'error', 'warn', 'info', 'debug', 'verbose'
        logToConsole: true,
        logToStorage: true,
        maxLogEntries: 1000,
        performanceMonitoring: true
    }
};

// ==================== FEATURE FLAGS ====================
const FEATURE_FLAGS = {
    // Authentication
    pinAuthentication: true,
    googleOAuth: true,
    adminAccess: true,
    biometricAuth: false, // Future feature
    
    // File Operations
    uploadFiles: true,
    uploadFolders: true,
    createFolders: true,
    deleteFiles: true,
    moveFiles: true,
    renameFiles: true,
    copyFiles: true,
    shareFiles: true,
    downloadFiles: true,
    bulkOperations: true,
    
    // Media Viewers
    upgradedVideoPlayer: true,
    upgradedImageViewer: true,
    upgradedPDFViewer: true,
    upgradedZIPViewer: true,
    audioPlayer: true,
    documentViewer: true,
    
    // Sync Features
    realtimeSync: true,
    backgroundSync: true,
    offlineMode: true,
    conflictDetection: true,
    
    // UI Features
    darkMode: true,
    themeSwitcher: true,
    animations: true,
    notifications: true,
    keyboardShortcuts: true,
    contextMenu: true,
    dragAndDrop: true,
    search: true,
    filters: true,
    sorting: true,
    
    // Advanced Features
    favorites: true,
    recentFiles: true,
    trash: true,
    versionHistory: false, // Future feature
    fileComments: false,   // Future feature
    fileTags: false,       // Future feature
    aiFeatures: false      // Future feature
};

// ==================== API ENDPOINTS ====================
const API_ENDPOINTS = {
    // Google Drive API
    drive: {
        files: 'https://www.googleapis.com/drive/v3/files',
        upload: 'https://www.googleapis.com/upload/drive/v3/files',
        about: 'https://www.googleapis.com/drive/v3/about',
        changes: 'https://www.googleapis.com/drive/v3/changes',
        permissions: 'https://www.googleapis.com/drive/v3/permissions',
        revisions: 'https://www.googleapis.com/drive/v3/revisions',
        comments: 'https://www.googleapis.com/drive/v3/comments',
        replies: 'https://www.googleapis.com/drive/v3/replies'
    },
    
    // Google OAuth
    oauth: {
        auth: 'https://accounts.google.com/o/oauth2/v2/auth',
        token: 'https://oauth2.googleapis.com/token',
        revoke: 'https://oauth2.googleapis.com/revoke',
        userinfo: 'https://www.googleapis.com/oauth2/v3/userinfo',
        tokeninfo: 'https://oauth2.googleapis.com/tokeninfo'
    },
    
    // Firebase API
    firebase: {
        auth: `https://identitytoolkit.googleapis.com/v1/accounts:signInWithIdp?key=${FIREBASE_CONFIG.apiKey}`,
        authSignUp: `https://identitytoolkit.googleapis.com/v1/accounts:signUp?key=${FIREBASE_CONFIG.apiKey}`,
        authSignIn: `https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=${FIREBASE_CONFIG.apiKey}`,
        authToken: `https://securetoken.googleapis.com/v1/token?key=${FIREBASE_CONFIG.apiKey}`,
        firestore: `https://firestore.googleapis.com/v1/projects/${FIREBASE_CONFIG.projectId}/databases/(default)/documents`,
        storage: `https://firebasestorage.googleapis.com/v0/b/${FIREBASE_CONFIG.storageBucket}/o`
    },
    
    // App Script Proxies
    proxy: {
        media: GOOGLE_CONFIG.mediaProxy,
        fullAccess: GOOGLE_CONFIG.fullAccessProxy,
        upload: `${GOOGLE_CONFIG.fullAccessProxy}?action=upload`,
        download: `${GOOGLE_CONFIG.fullAccessProxy}?action=download`,
        thumbnail: `${GOOGLE_CONFIG.mediaProxy}?action=thumbnail`
    },
    
    // External Services
    external: {
        virusTotal: 'https://www.virustotal.com/api/v3/files',
        imageCompression: 'https://api.tinify.com/shrink',
        pdfConversion: 'https://v2.convertapi.com/convert/pdf/to/jpg'
    }
};

// ==================== STORAGE KEYS ====================
const STORAGE_KEYS = {
    // Authentication & Session
    userSession: 'vault_user_session_v3',
    userProfile: 'vault_user_profile_v3',
    accessToken: 'vault_access_token_v3',
    refreshToken: 'vault_refresh_token_v3',
    idToken: 'vault_id_token_v3',
    firebaseUser: 'vault_firebase_user_v3',
    
    // PIN & Security
    pinHash: 'vault_pin_hash_v3',
    adminPin: 'vault_admin_pin_v3',
    biometricData: 'vault_biometric_data_v3',
    securitySettings: 'vault_security_settings_v3',
    
    // App Settings
    appSettings: 'vault_app_settings_v3',
    viewerSettings: 'vault_viewer_settings_v3',
    themeSettings: 'vault_theme_settings_v3',
    uiSettings: 'vault_ui_settings_v3',
    syncSettings: 'vault_sync_settings_v3',
    
    // Cache Data
    fileCache: 'vault_file_cache_v3',
    thumbnailCache: 'vault_thumbnail_cache_v3',
    storageCache: 'vault_storage_cache_v3',
    metadataCache: 'vault_metadata_cache_v3',
    
    // App State
    lastSync: 'vault_last_sync_v3',
    currentFolder: 'vault_current_folder_v3',
    selectedFiles: 'vault_selected_files_v3',
    viewState: 'vault_view_state_v3',
    navigationHistory: 'vault_navigation_history_v3',
    
    // User Data
    favorites: 'vault_favorites_v3',
    recentFiles: 'vault_recent_files_v3',
    searchHistory: 'vault_search_history_v3',
    uploadHistory: 'vault_upload_history_v3',
    downloadHistory: 'vault_download_history_v3',
    
    // Debug & Analytics
    debugLogs: 'vault_debug_logs_v3',
    errorLogs: 'vault_error_logs_v3',
    analytics: 'vault_analytics_v3',
    performanceLogs: 'vault_performance_logs_v3',
    
    // Misc
    firstRun: 'vault_first_run_v3',
    appVersion: 'vault_app_version_v3',
    installationId: 'vault_installation_id_v3'
};

// ==================== ERROR MESSAGES ====================
const ERROR_MESSAGES = {
    // Authentication Errors
    auth: {
        invalidPin: 'Invalid PIN. Please try again.',
        pinLocked: 'Too many failed attempts. Please wait 5 minutes.',
        sessionExpired: 'Your session has expired. Please login again.',
        googleAuthFailed: 'Google authentication failed. Please try again.',
        firebaseAuthFailed: 'Firebase authentication failed.',
        biometricFailed: 'Biometric authentication failed.',
        noInternet: 'No internet connection. Please check your network.'
    },
    
    // Drive Errors
    drive: {
        notConnected: 'Google Drive is not connected.',
        accessDenied: 'Access to Google Drive was denied.',
        quotaExceeded: 'Google Drive storage quota exceeded.',
        rateLimit: 'Too many requests. Please wait a moment.',
        apiError: 'Google Drive API error occurred.',
        fileNotFound: 'File not found in Google Drive.',
        folderNotFound: 'Folder not found.',
        invalidRequest: 'Invalid request to Google Drive.'
    },
    
    // File Operation Errors
    file: {
        uploadFailed: 'File upload failed. Please try again.',
        deleteFailed: 'Failed to delete file. Please try again.',
        moveFailed: 'Failed to move file. Please try again.',
        renameFailed: 'Failed to rename file. Please try again.',
        copyFailed: 'Failed to copy file. Please try again.',
        downloadFailed: 'File download failed. Please try again.',
        shareFailed: 'Failed to share file.',
        invalidFileType: 'File type is not supported.',
        fileTooLarge: 'File is too large. Maximum size is 10GB.',
        fileNameTooLong: 'File name is too long.',
        invalidFileName: 'File name contains invalid characters.',
        duplicateFile: 'A file with this name already exists.',
        readOnly: 'File is read-only and cannot be modified.'
    },
    
    // Network Errors
    network: {
        connectionLost: 'Connection lost. Please check your network.',
        timeout: 'Request timeout. Please try again.',
        serverError: 'Server error occurred. Please try again later.',
        proxyError: 'Proxy server error. Please try again.',
        corsError: 'Cross-origin request blocked. Please check configuration.'
    },
    
    // Media Viewer Errors
    media: {
        loadFailed: 'Failed to load media file.',
        unsupportedFormat: 'Unsupported media format.',
        corruptFile: 'File appears to be corrupt or incomplete.',
        decryptionFailed: 'Failed to decrypt file.',
        playbackError: 'Media playback error occurred.'
    },
    
    // General Errors
    general: {
        unknownError: 'An unknown error occurred. Please try again.',
        invalidOperation: 'Invalid operation.',
        insufficientPermissions: 'Insufficient permissions to perform this action.',
        storageFull: 'Local storage is full. Please free up space.',
        memoryError: 'Insufficient memory to perform this operation.',
        notImplemented: 'This feature is not yet implemented.'
    }
};

// ==================== SUCCESS MESSAGES ====================
const SUCCESS_MESSAGES = {
    // Authentication
    auth: {
        pinChanged: 'PIN changed successfully.',
        loginSuccess: 'Login successful.',
        logoutSuccess: 'Logged out successfully.',
        biometricEnabled: 'Biometric authentication enabled.',
        sessionRestored: 'Session restored successfully.'
    },
    
    // Drive Operations
    drive: {
        connected: 'Google Drive connected successfully.',
        disconnected: 'Google Drive disconnected successfully.',
        syncComplete: 'Sync completed successfully.',
        storageUpdated: 'Storage information updated.'
    },
    
    // File Operations
    file: {
        uploadSuccess: 'File uploaded successfully.',
        deleteSuccess: 'File deleted successfully.',
        moveSuccess: 'File moved successfully.',
        renameSuccess: 'File renamed successfully.',
        copySuccess: 'File copied successfully.',
        downloadSuccess: 'File downloaded successfully.',
        shareSuccess: 'File shared successfully.',
        folderCreated: 'Folder created successfully.',
        filesSelected: 'Files selected.',
        selectionCleared: 'Selection cleared.'
    },
    
    // Media Operations
    media: {
        opened: 'File opened successfully.',
        saved: 'File saved successfully.',
        edited: 'File edited successfully.',
        converted: 'File converted successfully.',
        compressed: 'File compressed successfully.'
    },
    
    // Settings
    settings: {
        saved: 'Settings saved successfully.',
        reset: 'Settings reset to defaults.',
        themeApplied: 'Theme applied successfully.',
        backupCreated: 'Backup created successfully.',
        restoreComplete: 'Restore completed successfully.'
    },
    
    // General
    general: {
        operationComplete: 'Operation completed successfully.',
        cacheCleared: 'Cache cleared successfully.',
        updateAvailable: 'Update available.',
        welcome: 'Welcome to Vault OS Ultimate!'
    }
};

// ==================== COLOR THEMES ====================
const THEMES = {
    cyber: {
        name: 'Cyber',
        description: 'Futuristic cyberpunk theme with neon colors',
        colors: {
            primary: '#00f3ff',
            primaryDark: '#00c4cc',
            primaryLight: '#33f5ff',
            secondary: '#7000ff',
            secondaryDark: '#5600cc',
            secondaryLight: '#8a33ff',
            accent: '#ff0055',
            accentDark: '#cc0044',
            accentLight: '#ff3377',
            background: '#050505',
            surface: '#0a0a0a',
            surfaceLight: '#1a1a1a',
            surfaceDark: '#000000',
            text: '#ffffff',
            textSecondary: '#cccccc',
            textMuted: '#888888',
            textDisabled: '#555555',
            border: '#222222',
            divider: '#333333',
            success: '#00ff9d',
            warning: '#ffdd59',
            error: '#ff4757',
            info: '#00a8ff',
            shadow: 'rgba(0, 243, 255, 0.1)'
        }
    },
    
    dark: {
        name: 'Dark',
        description: 'Professional dark theme for productivity',
        colors: {
            primary: '#4285f4',
            primaryDark: '#3367d6',
            primaryLight: '#5d9df6',
            secondary: '#34a853',
            secondaryDark: '#2d9249',
            secondaryLight: '#5dba77',
            accent: '#ea4335',
            accentDark: '#d23c2f',
            accentLight: '#ee685d',
            background: '#121212',
            surface: '#1e1e1e',
            surfaceLight: '#2d2d2d',
            surfaceDark: '#0a0a0a',
            text: '#e0e0e0',
            textSecondary: '#b0b0b0',
            textMuted: '#757575',
            textDisabled: '#555555',
            border: '#333333',
            divider: '#444444',
            success: '#00c853',
            warning: '#ff9800',
            error: '#f44336',
            info: '#2196f3',
            shadow: 'rgba(0, 0, 0, 0.3)'
        }
    },
    
    light: {
        name: 'Light',
        description: 'Clean light theme for daytime use',
        colors: {
            primary: '#1a73e8',
            primaryDark: '#0d5ec2',
            primaryLight: '#4d8fec',
            secondary: '#188038',
            secondaryDark: '#13692f',
            secondaryLight: '#4d9c65',
            accent: '#d93025',
            accentDark: '#b3261e',
            accentLight: '#e25a52',
            background: '#ffffff',
            surface: '#f8f9fa',
            surfaceLight: '#ffffff',
            surfaceDark: '#e8eaed',
            text: '#202124',
            textSecondary: '#5f6368',
            textMuted: '#80868b',
            textDisabled: '#bdc1c6',
            border: '#dadce0',
            divider: '#e8eaed',
            success: '#0d904f',
            warning: '#e37400',
            error: '#c5221f',
            info: '#1a73e8',
            shadow: 'rgba(60, 64, 67, 0.15)'
        }
    },
    
    midnight: {
        name: 'Midnight',
        description: 'Deep purple theme for night owls',
        colors: {
            primary: '#8a2be2',
            primaryDark: '#6a1cb8',
            primaryLight: '#a556e7',
            secondary: '#00ced1',
            secondaryDark: '#00a5a8',
            secondaryLight: '#33d8da',
            accent: '#ff69b4',
            accentDark: '#e055a2',
            accentLight: '#ff87c3',
            background: '#0a0a1a',
            surface: '#1a1a2e',
            surfaceLight: '#2a2a3e',
            surfaceDark: '#00000a',
            text: '#e6e6fa',
            textSecondary: '#c9c9e6',
            textMuted: '#9370db',
            textDisabled: '#6a5acd',
            border: '#2e2e4a',
            divider: '#3e3e5a',
            success: '#7cfc00',
            warning: '#ffd700',
            error: '#ff4500',
            info: '#00bfff',
            shadow: 'rgba(138, 43, 226, 0.2)'
        }
    },
    
    amoled: {
        name: 'AMOLED',
        description: 'True black theme for AMOLED displays',
        colors: {
            primary: '#00ff88',
            primaryDark: '#00cc6d',
            primaryLight: '#33ff9f',
            secondary: '#ff0088',
            secondaryDark: '#cc006d',
            secondaryLight: '#ff33a0',
            accent: '#0088ff',
            accentDark: '#006dcc',
            accentLight: '#33a0ff',
            background: '#000000',
            surface: '#111111',
            surfaceLight: '#222222',
            surfaceDark: '#000000',
            text: '#ffffff',
            textSecondary: '#bbbbbb',
            textMuted: '#888888',
            textDisabled: '#444444',
            border: '#222222',
            divider: '#333333',
            success: '#00ff88',
            warning: '#ffaa00',
            error: '#ff4444',
            info: '#00aaff',
            shadow: 'rgba(0, 255, 136, 0.1)'
        }
    }
};

// ==================== VAULT CONFIGURATION ====================
const VAULT_CONFIG = {
    // Configuration References
    firebase: FIREBASE_CONFIG,
    google: GOOGLE_CONFIG,
    app: APP_CONFIG,
    features: FEATURE_FLAGS,
    api: API_ENDPOINTS,
    storage: STORAGE_KEYS,
    errors: ERROR_MESSAGES,
    success: SUCCESS_MESSAGES,
    themes: THEMES,
    
    // ==================== HELPER METHODS ====================
    
    /**
     * Get API URL with parameters
     * @param {string} endpoint - API endpoint
     * @param {Object} params - Query parameters
     * @returns {string} Complete API URL
     */
    getApiUrl(endpoint, params = {}) {
        let url = API_ENDPOINTS.drive[endpoint];
        if (!url) {
            console.warn(`Endpoint '${endpoint}' not found in API endpoints`);
            return endpoint;
        }
        
        if (Object.keys(params).length > 0) {
            const queryString = Object.keys(params)
                .map(key => `${encodeURIComponent(key)}=${encodeURIComponent(params[key])}`)
                .join('&');
            url += '?' + queryString;
        }
        
        return url;
    },
    
    /**
     * Get OAuth URL with proper redirect URI
     * @param {string} redirectUri - Custom redirect URI (optional)
     * @param {string} state - State parameter for security
     * @returns {string} OAuth URL
     */
    getOAuthUrl(redirectUri = null, state = null) {
        // Determine correct redirect URI
        let finalRedirectUri = redirectUri || window.location.origin + window.location.pathname;
        
        // Fix for GitHub Pages
        if (window.location.hostname.includes('github.io')) {
            finalRedirectUri = 'https://khademsorder.github.io/Cvault/';
        }
        
        // Fix for local development
        if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
            finalRedirectUri = window.location.origin + '/';
        }
        
        // Validate redirect URI
        if (!FIREBASE_CONFIG.trustedDomains.includes(finalRedirectUri)) {
            console.warn(`Redirect URI ${finalRedirectUri} not in trusted domains`);
        }
        
        const params = {
            client_id: GOOGLE_CONFIG.clientId,
            redirect_uri: finalRedirectUri,
            response_type: GOOGLE_CONFIG.oauthConfig.responseType,
            scope: GOOGLE_CONFIG.scopes,
            include_granted_scopes: GOOGLE_CONFIG.oauthConfig.includeGrantedScopes.toString(),
            prompt: GOOGLE_CONFIG.oauthConfig.prompt,
            access_type: GOOGLE_CONFIG.oauthConfig.accessType,
            state: state || Math.random().toString(36).substring(7)
        };
        
        return API_ENDPOINTS.oauth.auth + '?' + new URLSearchParams(params).toString();
    },
    
    /**
     * Validate file type
     * @param {string} mimeType - File MIME type
     * @returns {boolean} True if allowed
     */
    validateFileType(mimeType) {
        if (!mimeType) return false;
        return APP_CONFIG.allowedFileTypes.includes(mimeType.toLowerCase());
    },
    
    /**
     * Format file size to human readable format
     * @param {number} bytes - File size in bytes
     * @returns {string} Formatted size
     */
    formatFileSize(bytes) {
        if (bytes === 0 || !bytes) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        const formatted = parseFloat((bytes / Math.pow(k, i)).toFixed(2));
        return `${formatted} ${sizes[i]}`;
    },
    
    /**
     * Format date to relative time or readable format
     * @param {Date|string|number} date - Date to format
     * @param {boolean} relative - Use relative time (e.g., "2 hours ago")
     * @returns {string} Formatted date
     */
    formatDate(date, relative = true) {
        if (!date) return 'Unknown';
        
        const d = new Date(date);
        if (isNaN(d.getTime())) return 'Invalid date';
        
        if (relative) {
            const now = new Date();
            const diff = now - d;
            const diffSeconds = Math.floor(diff / 1000);
            const diffMinutes = Math.floor(diff / (1000 * 60));
            const diffHours = Math.floor(diff / (1000 * 60 * 60));
            const diffDays = Math.floor(diff / (1000 * 60 * 60 * 24));
            const diffWeeks = Math.floor(diffDays / 7);
            const diffMonths = Math.floor(diffDays / 30);
            const diffYears = Math.floor(diffDays / 365);
            
            if (diffSeconds < 60) return 'Just now';
            if (diffMinutes < 60) return `${diffMinutes}m ago`;
            if (diffHours < 24) return `${diffHours}h ago`;
            if (diffDays === 1) return 'Yesterday';
            if (diffDays < 7) return `${diffDays}d ago`;
            if (diffWeeks < 4) return `${diffWeeks}w ago`;
            if (diffMonths < 12) return `${diffMonths}mo ago`;
            return `${diffYears}y ago`;
        }
        
        // Absolute date format
        const options = {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        };
        
        return d.toLocaleDateString('en-US', options);
    },
    
    /**
     * Get theme colors
     * @param {string} themeName - Theme name
     * @returns {Object} Theme colors
     */
    getThemeColors(themeName = 'cyber') {
        return THEMES[themeName]?.colors || THEMES.cyber.colors;
    },
    
    /**
     * Apply theme to document
     * @param {string} themeName - Theme name
     */
    applyTheme(themeName = 'cyber') {
        const theme = THEMES[themeName] || THEMES.cyber;
        const colors = theme.colors;
        
        // Set CSS custom properties
        const root = document.documentElement;
        Object.entries(colors).forEach(([key, value]) => {
            root.style.setProperty(`--${key}`, value);
        });
        
        // Set theme attribute for CSS selectors
        root.setAttribute('data-theme', themeName);
        
        // Save to storage
        try {
            localStorage.setItem(STORAGE_KEYS.themeSettings, JSON.stringify({
                name: themeName,
                appliedAt: Date.now()
            }));
        } catch (error) {
            this.error('Failed to save theme:', error);
        }
        
        this.log(`Theme '${theme.name}' applied`, null, 'success');
    },
    
    /**
     * Get current theme from storage
     * @returns {string} Theme name
     */
    getCurrentTheme() {
        try {
            const saved = localStorage.getItem(STORAGE_KEYS.themeSettings);
            if (saved) {
                const settings = JSON.parse(saved);
                return settings.name || 'cyber';
            }
        } catch (error) {
            this.error('Failed to get theme:', error);
        }
        return 'cyber';
    },
    
    /**
     * Get file icon based on MIME type
     * @param {string} mimeType - File MIME type
     * @param {boolean} isFolder - Is folder flag
     * @returns {string} FontAwesome icon class
     */
    getFileIcon(mimeType, isFolder = false) {
        if (isFolder) return 'fas fa-folder';
        
        const type = mimeType?.toLowerCase() || '';
        
        if (type.includes('image')) return 'fas fa-image';
        if (type.includes('video')) return 'fas fa-video';
        if (type.includes('audio')) return 'fas fa-music';
        if (type.includes('pdf')) return 'fas fa-file-pdf';
        if (type.includes('zip') || type.includes('compressed') || type.includes('rar')) return 'fas fa-file-archive';
        if (type.includes('document') || type.includes('word') || type.includes('text')) return 'fas fa-file-word';
        if (type.includes('sheet') || type.includes('excel')) return 'fas fa-file-excel';
        if (type.includes('presentation') || type.includes('powerpoint')) return 'fas fa-file-powerpoint';
        if (type.includes('json') || type.includes('javascript') || type.includes('code')) return 'fas fa-file-code';
        
        return 'fas fa-file';
    },
    
    /**
     * Get file type label
     * @param {string} mimeType - File MIME type
     * @param {boolean} isFolder - Is folder flag
     * @returns {string} File type label
     */
    getFileTypeLabel(mimeType, isFolder = false) {
        if (isFolder) return 'Folder';
        
        const type = mimeType?.toLowerCase() || '';
        
        if (type.includes('image')) return 'Image';
        if (type.includes('video')) return 'Video';
        if (type.includes('audio')) return 'Audio';
        if (type.includes('pdf')) return 'PDF Document';
        if (type.includes('zip')) return 'ZIP Archive';
        if (type.includes('rar')) return 'RAR Archive';
        if (type.includes('document') || type.includes('word')) return 'Word Document';
        if (type.includes('sheet') || type.includes('excel')) return 'Excel Spreadsheet';
        if (type.includes('presentation') || type.includes('powerpoint')) return 'PowerPoint';
        if (type.includes('text')) return 'Text Document';
        if (type.includes('json')) return 'JSON File';
        if (type.includes('javascript')) return 'JavaScript';
        
        return 'File';
    },
    
    /**
     * Truncate text with ellipsis
     * @param {string} text - Text to truncate
     * @param {number} maxLength - Maximum length
     * @returns {string} Truncated text
     */
    truncateText(text, maxLength = 50) {
        if (!text || text.length <= maxLength) return text;
        return text.substring(0, maxLength - 3) + '...';
    },
    
    /**
     * Debounce function
     * @param {Function} func - Function to debounce
     * @param {number} wait - Wait time in ms
     * @returns {Function} Debounced function
     */
    debounce(func, wait = 300) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    },
    
    /**
     * Throttle function
     * @param {Function} func - Function to throttle
     * @param {number} limit - Time limit in ms
     * @returns {Function} Throttled function
     */
    throttle(func, limit = 100) {
        let inThrottle;
        return function() {
            const args = arguments;
            const context = this;
            if (!inThrottle) {
                func.apply(context, args);
                inThrottle = true;
                setTimeout(() => inThrottle = false, limit);
            }
        };
    },
    
    // ==================== DEBUG & LOGGING ====================
    
    /**
     * Log message with timestamp
     * @param {string} message - Log message
     * @param {any} data - Additional data
     * @param {string} level - Log level
     */
    log(message, data = null, level = 'info') {
        if (!APP_CONFIG.debug.enabled) return;
        
        const timestamp = new Date().toISOString();
        const logEntry = {
            timestamp,
            level,
            message,
            data,
            source: 'config',
            url: window.location.href
        };
        
        // Console logging
        if (APP_CONFIG.debug.logToConsole) {
            const prefix = `[${timestamp.split('T')[1].split('.')[0]}]`;
            
            switch(level) {
                case 'error':
                    console.error(`${prefix} ❌ ${message}`, data || '');
                    break;
                case 'warn':
                    console.warn(`${prefix} ⚠️ ${message}`, data || '');
                    break;
                case 'success':
                    console.log(`${prefix} ✅ ${message}`, data || '');
                    break;
                case 'debug':
                    if (APP_CONFIG.debug.logLevel === 'debug' || APP_CONFIG.debug.logLevel === 'verbose') {
                        console.debug(`${prefix} 🔍 ${message}`, data || '');
                    }
                    break;
                case 'verbose':
                    if (APP_CONFIG.debug.logLevel === 'verbose') {
                        console.log(`${prefix} 📝 ${message}`, data || '');
                    }
                    break;
                default:
                    console.log(`${prefix} ℹ️ ${message}`, data || '');
            }
        }
        
        // Storage logging
        if (APP_CONFIG.debug.logToStorage) {
            this.storeLog(logEntry);
        }
    },
    
    /**
     * Store log entry
     * @param {Object} logEntry - Log entry object
     */
    storeLog(logEntry) {
        try {
            const logs = JSON.parse(localStorage.getItem(STORAGE_KEYS.debugLogs) || '[]');
            logs.push(logEntry);
            
            // Keep only last N logs
            if (logs.length > APP_CONFIG.debug.maxLogEntries) {
                logs.splice(0, logs.length - APP_CONFIG.debug.maxLogEntries);
            }
            
            localStorage.setItem(STORAGE_KEYS.debugLogs, JSON.stringify(logs));
        } catch (error) {
            console.error('Failed to store log:', error);
        }
    },
    
    /**
     * Get debug logs
     * @returns {Array} Log entries
     */
    getDebugLogs() {
        try {
            return JSON.parse(localStorage.getItem(STORAGE_KEYS.debugLogs) || '[]');
        } catch {
            return [];
        }
    },
    
    /**
     * Clear debug logs
     */
    clearDebugLogs() {
        localStorage.removeItem(STORAGE_KEYS.debugLogs);
    },
    
    /**
     * Get error logs
     * @returns {Array} Error log entries
     */
    getErrorLogs() {
        try {
            return JSON.parse(localStorage.getItem(STORAGE_KEYS.errorLogs) || '[]');
        } catch {
            return [];
        }
    },
    
    /**
     * Log error
     * @param {string} message - Error message
     * @param {any} error - Error object
     */
    error(message, error = null) {
        this.log(message, error, 'error');
        
        // Store in error logs
        try {
            const errorLogs = JSON.parse(localStorage.getItem(STORAGE_KEYS.errorLogs) || '[]');
            errorLogs.push({
                timestamp: new Date().toISOString(),
                message,
                error: error?.toString(),
                stack: error?.stack,
                url: window.location.href,
                userAgent: navigator.userAgent
            });
            
            if (errorLogs.length > 100) {
                errorLogs.splice(0, errorLogs.length - 100);
            }
            
            localStorage.setItem(STORAGE_KEYS.errorLogs, JSON.stringify(errorLogs));
        } catch (e) {
            console.error('Failed to store error log:', e);
        }
    },
    
    /**
     * Success log shortcut
     * @param {string} message - Success message
     * @param {any} data - Additional data
     */
    success(message, data = null) {
        this.log(message, data, 'success');
    },
    
    /**
     * Warning log shortcut
     * @param {string} message - Warning message
     * @param {any} data - Additional data
     */
    warn(message, data = null) {
        this.log(message, data, 'warn');
    },
    
    /**
     * Debug log shortcut
     * @param {string} message - Debug message
     * @param {any} data - Additional data
     */
    debug(message, data = null) {
        this.log(message, data, 'debug');
    },
    
    // ==================== UTILITY METHODS ====================
    
    /**
     * Generate unique ID
     * @returns {string} Unique ID
     */
    generateId() {
        return 'vault_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
    },
    
    /**
     * Check if online
     * @returns {boolean} Online status
     */
    isOnline() {
        return navigator.onLine;
    },
    
    /**
     * Check if mobile device
     * @returns {boolean} Mobile status
     */
    isMobile() {
        return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
    },
    
    /**
     * Check if touch device
     * @returns {boolean} Touch device status
     */
    isTouchDevice() {
        return 'ontouchstart' in window || navigator.maxTouchPoints > 0;
    },
    
    /**
     * Get browser info
     * @returns {Object} Browser information
     */
    getBrowserInfo() {
        const ua = navigator.userAgent;
        let browser = 'Unknown';
        let version = 'Unknown';
        
        if (ua.includes('Chrome') && !ua.includes('Edg')) {
            browser = 'Chrome';
            version = ua.match(/Chrome\/(\d+)/)?.[1] || 'Unknown';
        } else if (ua.includes('Firefox')) {
            browser = 'Firefox';
            version = ua.match(/Firefox\/(\d+)/)?.[1] || 'Unknown';
        } else if (ua.includes('Safari') && !ua.includes('Chrome')) {
            browser = 'Safari';
            version = ua.match(/Version\/(\d+)/)?.[1] || 'Unknown';
        } else if (ua.includes('Edg')) {
            browser = 'Edge';
            version = ua.match(/Edg\/(\d+)/)?.[1] || 'Unknown';
        }
        
        return { browser, version, userAgent: ua };
    },
    
    /**
     * Copy text to clipboard
     * @param {string} text - Text to copy
     * @returns {Promise<boolean>} Success status
     */
    async copyToClipboard(text) {
        try {
            await navigator.clipboard.writeText(text);
            return true;
        } catch (error) {
            // Fallback method
            try {
                const textArea = document.createElement('textarea');
                textArea.value = text;
                textArea.style.position = 'fixed';
                textArea.style.left = '-999999px';
                textArea.style.top = '-999999px';
                document.body.appendChild(textArea);
                textArea.focus();
                textArea.select();
                document.execCommand('copy');
                document.body.removeChild(textArea);
                return true;
            } catch (fallbackError) {
                this.error('Failed to copy to clipboard:', fallbackError);
                return false;
            }
        }
    },
    
    /**
     * Download file
     * @param {string} data - File data
     * @param {string} filename - File name
     * @param {string} type - MIME type
     */
    downloadFile(data, filename, type = 'application/octet-stream') {
        try {
            const blob = new Blob([data], { type });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = filename;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
            return true;
        } catch (error) {
            this.error('Failed to download file:', error);
            return false;
        }
    },
    
    /**
     * Get query parameter
     * @param {string} name - Parameter name
     * @returns {string|null} Parameter value
     */
    getQueryParam(name) {
        const urlParams = new URLSearchParams(window.location.search);
        return urlParams.get(name);
    },
    
    /**
     * Set query parameter
     * @param {string} name - Parameter name
     * @param {string} value - Parameter value
     */
    setQueryParam(name, value) {
        const url = new URL(window.location);
        url.searchParams.set(name, value);
        window.history.replaceState(null, '', url);
    },
    
    /**
     * Remove query parameter
     * @param {string} name - Parameter name
     */
    removeQueryParam(name) {
        const url = new URL(window.location);
        url.searchParams.delete(name);
        window.history.replaceState(null, '', url);
    },
    
    /**
     * Get hash parameter
     * @param {string} name - Parameter name
     * @returns {string|null} Parameter value
     */
    getHashParam(name) {
        const hash = window.location.hash.substring(1);
        const params = new URLSearchParams(hash);
        return params.get(name);
    },
    
    /**
     * Clear hash parameters
     */
    clearHashParams() {
        window.location.hash = '';
    },
    
    /**
     * Validate email
     * @param {string} email - Email address
     * @returns {boolean} Valid status
     */
    validateEmail(email) {
        const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return re.test(email);
    },
    
    /**
     * Validate URL
     * @param {string} url - URL to validate
     * @returns {boolean} Valid status
     */
    validateUrl(url) {
        try {
            new URL(url);
            return true;
        } catch {
            return false;
        }
    },
    
    /**
     * Sleep/pause execution
     * @param {number} ms - Milliseconds to sleep
     * @returns {Promise} Promise that resolves after ms
     */
    sleep(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    },
    
    /**
     * Retry function with exponential backoff
     * @param {Function} fn - Function to retry
     * @param {number} retries - Number of retries
     * @param {number} delay - Initial delay in ms
     * @returns {Promise} Result of function
     */
    async retry(fn, retries = 3, delay = 1000) {
        try {
            return await fn();
        } catch (error) {
            if (retries <= 0) throw error;
            await this.sleep(delay);
            return this.retry(fn, retries - 1, delay * 2);
        }
    },
    
    /**
     * Check if object is empty
     * @param {Object} obj - Object to check
     * @returns {boolean} Empty status
     */
    isEmpty(obj) {
        return Object.keys(obj).length === 0;
    },
    
    /**
     * Deep clone object
     * @param {Object} obj - Object to clone
     * @returns {Object} Cloned object
     */
    deepClone(obj) {
        return JSON.parse(JSON.stringify(obj));
    },
    
    /**
     * Merge objects deeply
     * @param {Object} target - Target object
     * @param {Object} source - Source object
     * @returns {Object} Merged object
     */
    deepMerge(target, source) {
        const output = Object.assign({}, target);
        
        if (this.isObject(target) && this.isObject(source)) {
            Object.keys(source).forEach(key => {
                if (this.isObject(source[key])) {
                    if (!(key in target)) {
                        Object.assign(output, { [key]: source[key] });
                    } else {
                        output[key] = this.deepMerge(target[key], source[key]);
                    }
                } else {
                    Object.assign(output, { [key]: source[key] });
                }
            });
        }
        
        return output;
    },
    
    /**
     * Check if value is object
     * @param {any} item - Value to check
     * @returns {boolean} Object status
     */
    isObject(item) {
        return item && typeof item === 'object' && !Array.isArray(item);
    },
    
    /**
     * Get current timestamp
     * @returns {number} Timestamp in ms
     */
    getTimestamp() {
        return Date.now();
    },
    
    /**
     * Format timestamp to ISO string
     * @param {number} timestamp - Timestamp in ms
     * @returns {string} ISO string
     */
    formatTimestamp(timestamp) {
        return new Date(timestamp).toISOString();
    },
    
    /**
     * Get time difference in human readable format
     * @param {number} start - Start timestamp
     * @param {number} end - End timestamp
     * @returns {string} Time difference
     */
    getTimeDifference(start, end = Date.now()) {
        const diff = end - start;
        const seconds = Math.floor(diff / 1000);
        const minutes = Math.floor(seconds / 60);
        const hours = Math.floor(minutes / 60);
        
        if (seconds < 60) return `${seconds}s`;
        if (minutes < 60) return `${minutes}m ${seconds % 60}s`;
        return `${hours}h ${minutes % 60}m`;
    },
    
    /**
     * Initialize performance monitoring
     */
    initPerformanceMonitoring() {
        if (!APP_CONFIG.debug.performanceMonitoring) return;
        
        if ('performance' in window) {
            const marks = [];
            const measures = [];
            
            const observer = new PerformanceObserver((list) => {
                list.getEntries().forEach(entry => {
                    if (entry.entryType === 'mark') {
                        marks.push(entry);
                    } else if (entry.entryType === 'measure') {
                        measures.push(entry);
                    } else if (entry.entryType === 'longtask' && entry.duration > 50) {
                        this.warn('Long task detected:', entry);
                    }
                });
            });
            
            observer.observe({ entryTypes: ['mark', 'measure', 'longtask', 'paint'] });
            
            // Store in performance logs
            window.addEventListener('load', () => {
                const loadTime = performance.timing.loadEventEnd - performance.timing.navigationStart;
                const perfLog = {
                    timestamp: this.getTimestamp(),
                    loadTime,
                    marks: marks.length,
                    measures: measures.length,
                    memory: performance.memory
                };
                
                try {
                    const logs = JSON.parse(localStorage.getItem(STORAGE_KEYS.performanceLogs) || '[]');
                    logs.push(perfLog);
                    if (logs.length > 100) logs.shift();
                    localStorage.setItem(STORAGE_KEYS.performanceLogs, JSON.stringify(logs));
                } catch (error) {
                    this.error('Failed to store performance log:', error);
                }
            });
        }
    },
    
    /**
     * Get performance metrics
     * @returns {Object} Performance metrics
     */
    getPerformanceMetrics() {
        try {
            return JSON.parse(localStorage.getItem(STORAGE_KEYS.performanceLogs) || '[]');
        } catch {
            return [];
        }
    },
    
    /**
     * Clear performance logs
     */
    clearPerformanceLogs() {
        localStorage.removeItem(STORAGE_KEYS.performanceLogs);
    }
};

// ==================== INITIALIZATION ====================

// Make config globally available
window.VAULT_CONFIG = VAULT_CONFIG;

// Apply saved theme on load
document.addEventListener('DOMContentLoaded', () => {
    try {
        const savedTheme = VAULT_CONFIG.getCurrentTheme();
        VAULT_CONFIG.applyTheme(savedTheme);
        
        // Initialize performance monitoring
        VAULT_CONFIG.initPerformanceMonitoring();
        
        // Log initialization
        VAULT_CONFIG.success(`Vault OS Config v${APP_CONFIG.version} loaded`, {
            theme: savedTheme,
            debug: APP_CONFIG.debug.enabled,
            features: Object.keys(FEATURE_FLAGS).filter(key => FEATURE_FLAGS[key]).length
        });
        
    } catch (error) {
        console.error('Config initialization error:', error);
    }
});

// Export for module systems
if (typeof module !== 'undefined' && module.exports) {
    module.exports = VAULT_CONFIG;
}

// Version check
console.log(`%c🔐 Vault OS Ultimate v${APP_CONFIG.version}`, 
    'color: #00f3ff; font-size: 16px; font-weight: bold; background: #050505; padding: 10px; border-radius: 5px;');
console.log(`%c🚀 Powered by Google Drive & Firebase`, 
    'color: #7000ff; font-size: 12px; background: #0a0a0a; padding: 5px; border-radius: 3px;');
console.log(`%c⚠️ Authorized use only. Do not share sensitive data.`, 
    'color: #ff0055; font-size: 10px; background: #0a0a0a; padding: 3px; border-radius: 2px;');

