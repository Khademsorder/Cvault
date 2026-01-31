/* =========================================
   VAULT OS ULTIMATE - CONFIGURATION
   All Firebase, Google Drive, App Settings
   ========================================= */

// Firebase Configuration
const FIREBASE_CONFIG = {
    apiKey: "AIzaSyB3Iy1MIbfmJ7h5rv9NlsT23ysedCwUZt4",
    authDomain: "encrypted-vault-4683d.firebaseapp.com",
    databaseURL: "https://encrypted-vault-4683d-default-rtdb.firebaseio.com",
    projectId: "encrypted-vault-4683d",
    storageBucket: "encrypted-vault-4683d.firebasestorage.app",
    messagingSenderId: "851257263743",
    appId: "1:851257263743:web:e0d16606bd06f692f5e14a"
};

// Google Drive Configuration
const GOOGLE_CONFIG = {
    // OAuth 2.0 Configuration
    clientId: "318681315152-65e9kofptt4c3bk3kmlj9gmksnasu347.apps.googleusercontent.com",
    apiKey: "AIzaSyB3Iy1MIbfmJ7h5rv9NlsT23ysedCwUZt4",
    
    // Drive API Scopes
    scopes: [
        'https://www.googleapis.com/auth/drive.file',
        'https://www.googleapis.com/auth/drive.readonly',
        'https://www.googleapis.com/auth/drive.metadata.readonly',
        'https://www.googleapis.com/auth/userinfo.profile',
        'https://www.googleapis.com/auth/drive.install'
    ].join(' '),
    
    // Discovery Docs
    discoveryDocs: [
        'https://www.googleapis.com/discovery/v1/apis/drive/v3/rest'
    ],
    
    // Root Folder ID
    rootFolderId: "1zIyinAqjQv96QBSuanFS2F0USaG66GPn",
    
    // App Script URL (for advanced operations)
    scriptUrl: "https://script.google.com/macros/s/AKfycbxItLlQHW0NEhhgGedLOxQQFPIdVEqYlGILa2Pd6Rei_kGzpSm67l5mAO3oIJhKvdzEjQ/exec"
};

// App Configuration
const APP_CONFIG = {
    // App Information
    name: "Vault OS Ultimate",
    version: "2.0.0",
    developer: "Vault Team",
    
    // Security
    defaultPin: "1171",
    pinLength: 4,
    sessionTimeout: 24 * 60 * 60 * 1000, // 24 hours
    maxLoginAttempts: 5,
    
    // File Operations
    maxUploadSize: 10 * 1024 * 1024 * 1024, // 10GB
    allowedFileTypes: [
        // Images
        'image/jpeg', 'image/png', 'image/gif', 'image/webp', 'image/bmp', 'image/svg+xml', 'image/tiff',
        // Videos
        'video/mp4', 'video/webm', 'video/ogg', 'video/avi', 'video/mov', 'video/wmv', 'video/flv', 'video/mkv',
        // Audio
        'audio/mpeg', 'audio/wav', 'audio/ogg', 'audio/midi', 'audio/x-midi', 'audio/aac', 'audio/flac',
        // Documents
        'application/pdf', 'application/msword', 
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'application/vnd.ms-excel',
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'application/vnd.ms-powerpoint',
        'application/vnd.openxmlformats-officedocument.presentationml.presentation',
        'text/plain', 'text/html', 'text/css', 'text/javascript',
        // Archives
        'application/zip', 'application/x-rar-compressed', 'application/x-7z-compressed',
        'application/x-tar', 'application/gzip',
        // Other
        'application/json', 'application/xml', 'application/epub+zip'
    ],
    
    // UI Settings
    defaultView: "grid",
    itemsPerPage: 100,
    thumbnailSize: 200,
    
    // Cache Settings
    cacheEnabled: true,
    cacheDuration: 24 * 60 * 60 * 1000, // 24 hours
    
    // Sync Settings
    autoSync: true,
    syncInterval: 30000, // 30 seconds
    syncOnStartup: true,
    
    // Media Settings
    videoPlayer: {
        enabled: true,
        controls: ['play', 'progress', 'current-time', 'mute', 'volume', 'fullscreen', 'quality'],
        quality: 'auto',
        autoplay: false
    },
    
    imageViewer: {
        enabled: true,
        zoom: true,
        rotation: true,
        filters: true,
        fullscreen: true
    },
    
    pdfViewer: {
        enabled: true,
        defaultZoom: 'page-width',
        showToolbar: true
    },
    
    zipViewer: {
        enabled: true,
        extract: true,
        preview: true
    }
};

// Feature Toggles
const FEATURE_FLAGS = {
    pinAuthentication: true,
    googleOAuth: true,
    uploadFiles: true,
    uploadFolders: true,
    createFolders: true,
    deleteFiles: true,
    moveFiles: true,
    renameFiles: true,
    upgradedVideoPlayer: true,
    upgradedImageViewer: true,
    upgradedPDFViewer: true,
    upgradedZIPViewer: true,
    realtimeSync: true,
    backgroundSync: true,
    darkMode: true,
    animations: true,
    notifications: true
};

// API Endpoints
const API_ENDPOINTS = {
    // Google Drive API
    drive: {
        files: 'https://www.googleapis.com/drive/v3/files',
        upload: 'https://www.googleapis.com/upload/drive/v3/files',
        about: 'https://www.googleapis.com/drive/v3/about',
        changes: 'https://www.googleapis.com/drive/v3/changes'
    },
    
    // Google OAuth
    oauth: {
        auth: 'https://accounts.google.com/o/oauth2/v2/auth',
        token: 'https://oauth2.googleapis.com/token',
        revoke: 'https://oauth2.googleapis.com/revoke',
        userinfo: 'https://www.googleapis.com/oauth2/v3/userinfo'
    },
    
    // Firebase
    firebase: {
        auth: `https://identitytoolkit.googleapis.com/v1/accounts:signInWithIdp?key=${FIREBASE_CONFIG.apiKey}`,
        firestore: `https://firestore.googleapis.com/v1/projects/${FIREBASE_CONFIG.projectId}/databases/(default)/documents`
    },
    
    // Custom App Script
    appScript: GOOGLE_CONFIG.scriptUrl
};

// Local Storage Keys
const STORAGE_KEYS = {
    userSession: 'vault_user_session',
    userProfile: 'vault_user_profile',
    accessToken: 'vault_access_token',
    refreshToken: 'vault_refresh_token',
    pinHash: 'vault_pin_hash',
    appSettings: 'vault_app_settings',
    viewerSettings: 'vault_viewer_settings',
    uiSettings: 'vault_ui_settings',
    fileCache: 'vault_file_cache',
    thumbnailCache: 'vault_thumbnail_cache',
    storageCache: 'vault_storage_cache',
    lastSync: 'vault_last_sync',
    lastFolder: 'vault_last_folder',
    searchHistory: 'vault_search_history'
};

// Error Messages
const ERROR_MESSAGES = {
    invalidPin: 'Invalid PIN. Please try again.',
    pinLocked: 'Too many failed attempts. Please wait 5 minutes.',
    sessionExpired: 'Your session has expired. Please login again.',
    googleAuthFailed: 'Google authentication failed. Please try again.',
    driveNotConnected: 'Google Drive is not connected.',
    driveAccessDenied: 'Access to Google Drive was denied.',
    driveQuotaExceeded: 'Google Drive storage quota exceeded.',
    driveRateLimit: 'Too many requests. Please wait a moment.',
    uploadFailed: 'File upload failed. Please try again.',
    deleteFailed: 'Failed to delete file. Please try again.',
    fileNotFound: 'File not found.',
    fileTooLarge: 'File is too large.',
    invalidFileType: 'File type is not supported.',
    networkError: 'Network error. Please check your connection.',
    unknownError: 'An unknown error occurred. Please try again.'
};

// Success Messages
const SUCCESS_MESSAGES = {
    pinChanged: 'PIN changed successfully.',
    loginSuccess: 'Login successful.',
    logoutSuccess: 'Logged out successfully.',
    uploadSuccess: 'File uploaded successfully.',
    deleteSuccess: 'File deleted successfully.',
    folderCreated: 'Folder created successfully.',
    filesSynced: 'Files synced successfully.',
    settingsSaved: 'Settings saved successfully.',
    driveConnected: 'Google Drive connected successfully.',
    syncComplete: 'Sync completed successfully.'
};

// Color Themes
const THEMES = {
    cyber: {
        primary: '#00f3ff',
        secondary: '#7000ff',
        accent: '#ff0055',
        background: '#050505',
        surface: '#0a0a0a',
        text: '#ffffff',
        muted: '#888888'
    },
    dark: {
        primary: '#4285f4',
        secondary: '#34a853',
        accent: '#ea4335',
        background: '#121212',
        surface: '#1e1e1e',
        text: '#e0e0e0',
        muted: '#757575'
    },
    light: {
        primary: '#1a73e8',
        secondary: '#188038',
        accent: '#d93025',
        background: '#ffffff',
        surface: '#f8f9fa',
        text: '#202124',
        muted: '#5f6368'
    }
};

// Export Configuration
const VAULT_CONFIG = {
    firebase: FIREBASE_CONFIG,
    google: GOOGLE_CONFIG,
    app: APP_CONFIG,
    features: FEATURE_FLAGS,
    api: API_ENDPOINTS,
    storage: STORAGE_KEYS,
    errors: ERROR_MESSAGES,
    success: SUCCESS_MESSAGES,
    themes: THEMES,
    
    // Helper Methods
    getApiUrl: function(endpoint, params = {}) {
        let url = API_ENDPOINTS.drive[endpoint] || endpoint;
        if (Object.keys(params).length > 0) {
            url += '?' + new URLSearchParams(params).toString();
        }
        return url;
    },
    
    getOAuthUrl: function(redirectUri, state = '') {
        const params = {
            client_id: GOOGLE_CONFIG.clientId,
            redirect_uri: redirectUri,
            response_type: 'token',
            scope: GOOGLE_CONFIG.scopes,
            include_granted_scopes: 'true',
            state: state,
            prompt: 'consent'
        };
        return API_ENDPOINTS.oauth.auth + '?' + new URLSearchParams(params).toString();
    },
    
    validateFileType: function(mimeType) {
        return APP_CONFIG.allowedFileTypes.includes(mimeType);
    },
    
    formatFileSize: function(bytes) {
        if (bytes === 0 || !bytes) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    },
    
    getThemeColors: function(themeName = 'cyber') {
        return THEMES[themeName] || THEMES.cyber;
    },
    
    // Version Check
    isCompatible: function(version) {
        const current = APP_CONFIG.version.split('.').map(Number);
        const required = version.split('.').map(Number);
        
        for (let i = 0; i < Math.max(current.length, required.length); i++) {
            const cur = current[i] || 0;
            const req = required[i] || 0;
            if (cur > req) return true;
            if (cur < req) return false;
        }
        return true;
    }
};

// Make config globally available
window.VAULT_CONFIG = VAULT_CONFIG;

// Log configuration loaded
console.log(`✅ Vault OS Config v${APP_CONFIG.version} loaded`);

