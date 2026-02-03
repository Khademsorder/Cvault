// ==================== VAULT OS v5.0 - MASTER CONFIGURATION ====================
/* SECURITY NOTE: NEVER COMMIT REAL CREDENTIALS TO GIT! 
   Use environment variables in production */

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
        // Client ID for Web Application
        clientId: "318681315152-65e9kofptt4c3bk3kmlj9gmksnasu347.apps.googleusercontent.com",
        
        // OAuth Scopes (Minimum required permissions)
        scope: [
            "https://www.googleapis.com/auth/drive.file",           // Create/modify files
            "https://www.googleapis.com/auth/drive.readonly",       // Read files
            "https://www.googleapis.com/auth/drive.metadata.readonly", // Read metadata
            "https://www.googleapis.com/auth/drive.install",        // App installation
            "profile",                                              // Basic profile
            "email"                                                 // Email address
        ].join(" "),
        
        // OAuth Endpoints
        authEndpoint: "https://accounts.google.com/o/oauth2/v2/auth",
        tokenEndpoint: "https://oauth2.googleapis.com/token",
        tokenInfoEndpoint: "https://oauth2.googleapis.com/tokeninfo",
        revokeEndpoint: "https://oauth2.googleapis.com/revoke",
        userInfoEndpoint: "https://www.googleapis.com/oauth2/v1/userinfo",
        
        // Redirect URI (MUST match Google Cloud Console)
        redirectURI: window.location.origin + window.location.pathname,
        
        // Response Type
        responseType: "token", // Implicit grant for SPAs
        
        // Auto parameters
        includeGrantedScopes: "true",
        prompt: "consent",
        accessType: "offline",
        
        // All possible redirect URIs
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
        // API Version
        apiVersion: "v3",
        
        // Root Folder (Use 'root' for entire drive or specific folder ID)
        rootFolderId: "root", // Using root for full access
        
        // API Endpoints
        apiBase: "https://www.googleapis.com/drive/v3",
        uploadEndpoint: "https://www.googleapis.com/upload/drive/v3/files",
        aboutEndpoint: "https://www.googleapis.com/drive/v3/about",
        changesEndpoint: "https://www.googleapis.com/drive/v3/changes",
        
        // File Operations
        chunkSize: 5 * 1024 * 1024,           // 5MB chunks for resumable upload
        maxFileSize: 10 * 1024 * 1024 * 1024, // 10GB max file size
        maxUploadRetries: 3,                  // Retry failed uploads
        uploadTimeout: 300000,                // 5 minutes timeout
        
        // Query Parameters
        defaultFields: "files(id,name,mimeType,size,modifiedTime,createdTime,thumbnailLink,webViewLink,iconLink,parents,trashed,starred,shared,capabilities)",
        pageSize: 100,                        // Files per request
        orderBy: "folder,name,modifiedTime desc"
    },
    
    // ================ FIREBASE CONFIG ================
    firebase: {
        // Firebase Project: encrypted-vault-4683d
        apiKey: "AIzaSyB3Iy1MIbfmJ7h5rv9NlsT23ysedCwUZt4",
        authDomain: "encrypted-vault-4683d.firebaseapp.com",
        databaseURL: "https://encrypted-vault-4683d-default-rtdb.firebaseio.com",
        projectId: "encrypted-vault-4683d",
        storageBucket: "encrypted-vault-4683d.appspot.com",
        messagingSenderId: "851257263743",
        appId: "1:851257263743:web:e0d16606bd06f692f5e14a",
        measurementId: "G-XXXXXXXXXX", // Optional analytics
        
        // All Firebase URLs for this project
        urls: {
            authDomain: "encrypted-vault-4683d.firebaseapp.com",
            webApp: "https://encrypted-vault-4683d.web.app",
            database: "https://encrypted-vault-4683d-default-rtdb.firebaseio.com",
            storage: "https://encrypted-vault-4683d.appspot.com",
            firestore: "https://firestore.googleapis.com/v1/projects/encrypted-vault-4683d/databases/(default)/documents"
        }
        
        // Database Rules (for reference):
        // {
        //   "rules": {
        //     ".read": "auth != null",
        //     ".write": "auth != null",
        //     "errors": {
        //       ".indexOn": ["timestamp", "user"]
        //     },
        //     "analytics": {
        //       ".indexOn": ["date", "action"]
        //     }
        //   }
        // }
    },
    
    // ================ MEDIA PROXY SERVERS ================
    mediaProxies: {
        // Read-only proxy (for previews)
        readOnly: "https://script.google.com/macros/s/AKfycby2hqAq0JePMbnjEbwwcPBFjS14lvS3pM2Z1PPgY4OraTcpvTmZFPKQr9CQ4vba4Xk7/exec",
        
        // Full access proxy (for downloads)
        fullAccess: "https://script.google.com/macros/s/AKfycbxQF58gDxHBATrBvliuMc_SdP7PEiuN6fiHdzVKG7_K5FIrj3V2m8imWgPXTjmVqfnN/exec",
        
        // Proxy parameters
        params: {
            id: "{fileId}",
            mime: "{mimeType}",
            size: "{thumbnailSize}",
            download: "{true/false}"
        }
    },
    
    // ================ SECURITY CONFIG ================
    security: {
        // PIN Configuration
        pinLength: 4,
        pinSalt: "vault_os_secure_salt_v5", // Static salt for PIN hashing
        pinHashAlgorithm: "SHA-256",
        
        // Attempt Limits
        maxPinAttempts: 5,
        lockoutMinutes: 5,
        
        // Session Management
        sessionHours: 24,           // Auto logout after 24 hours
        sessionCheckInterval: 60000, // Check every minute
        
        // Token Management
        tokenRefreshMinutes: 45,    // Refresh 45 minutes before expiry
        tokenCheckInterval: 300000, // Check every 5 minutes
        
        // Storage Security
        encryptLocalStorage: false, // Not implemented yet
        clearOnLock: true           // Clear sensitive data on lock
    },
    
    // ================ APP SETTINGS ================
    settings: {
        // UI Settings
        defaultTheme: "cyber",
        defaultView: "grid",
        themes: ["cyber", "dark", "light"],
        views: ["grid", "list"],
        
        // Upload Settings
        maxConcurrentUploads: 2,
        uploadQueueSize: 10,
        resumeUploads: true,
        chunkUploads: true,
        
        // Cache Settings
        thumbnailSize: 200,
        cacheTTL: 24 * 60 * 60 * 1000, // 24 hours
        offlineCacheLimit: 100 * 1024 * 1024, // 100MB
        maxCachedFiles: 1000,
        maxCachedThumbnails: 500,
        
        // Performance
        lazyLoadThreshold: 50,      // Load 50 files at a time
        debounceSearch: 300,        // 300ms search delay
        throttleScroll: 100,        // 100ms scroll throttle
        
        // Network
        onlineOnly: true,           // Require internet connection
        retryAttempts: 3,
        retryDelay: 2000,           // 2 seconds between retries
        
        // File Operations
        confirmDelete: true,
        confirmOverwrite: true,
        maxFilenameLength: 255,
        
        // Deployment Environments
        environments: {
            github: {
                baseUrl: "https://khademsorder.github.io/Cvault/",
                mainPage: "https://khademsorder.github.io/Cvault/prime.html",
                isProduction: true
            },
            firebase: {
                baseUrl: "https://encrypted-vault-4683d.web.app/",
                altUrl: "https://encrypted-vault-4683d.firebaseapp.com/",
                isProduction: true
            },
            local: {
                ports: [5500, 3000, 8080],
                urls: [
                    "http://localhost:5500",
                    "http://localhost:3000",
                    "http://localhost:8080",
                    "http://localhost",
                    "http://127.0.0.1:5500",
                    "http://127.0.0.1:3000",
                    "http://127.0.0.1:8080",
                    "http://127.0.0.1"
                ],
                isProduction: false
            }
        }
    },
    
    // ================ FILE TYPE MAPPINGS ================
    fileTypes: {
        // MIME Type categories
        images: [
            'image/jpeg', 'image/png', 'image/gif', 'image/webp', 
            'image/bmp', 'image/svg+xml', 'image/tiff'
        ],
        videos: [
            'video/mp4', 'video/webm', 'video/ogg', 'video/quicktime',
            'video/x-msvideo', 'video/x-matroska', 'video/3gpp'
        ],
        audio: [
            'audio/mpeg', 'audio/ogg', 'audio/wav', 'audio/webm',
            'audio/aac', 'audio/flac', 'audio/x-m4a'
        ],
        documents: [
            'application/pdf',
            'application/msword',
            'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
            'application/vnd.ms-excel',
            'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
            'application/vnd.ms-powerpoint',
            'application/vnd.openxmlformats-officedocument.presentationml.presentation',
            'application/vnd.oasis.opendocument.text',
            'text/plain', 'text/html', 'text/css', 'text/javascript',
            'application/json', 'application/xml'
        ],
        archives: [
            'application/zip', 'application/x-rar-compressed',
            'application/x-7z-compressed', 'application/x-tar',
            'application/gzip'
        ],
        code: [
            'text/x-python', 'text/x-java', 'text/x-c', 'text/x-c++',
            'text/x-php', 'text/x-ruby', 'text/x-go', 'text/x-swift',
            'application/x-typescript'
        ]
    },
    
    // ================ ICON MAPPINGS ================
    icons: {
        // Folder
        folder: "📁",
        
        // File types
        image: "🖼️",
        video: "🎬",
        audio: "🎵",
        pdf: "📕",
        document: "📝",
        spreadsheet: "📊",
        presentation: "📽️",
        archive: "🗜️",
        code: "💻",
        text: "📄",
        unknown: "📄",
        
        // UI Icons (using Unicode)
        lock: "🔒",
        unlock: "🔓",
        upload: "📤",
        download: "📥",
        refresh: "🔄",
        search: "🔍",
        menu: "☰",
        close: "✕",
        check: "✓",
        warning: "⚠️",
        error: "❌",
        info: "ℹ️",
        star: "⭐",
        trash: "🗑️",
        share: "🔗",
        copy: "📋",
        move: "📁",
        rename: "✏️",
        settings: "⚙️",
        user: "👤",
        home: "🏠",
        recent: "🕒",
        theme: "🎨",
        view: "◻️",
        sort: "⇅",
        filter: "⚡"
    },
    
    // ================ ERROR MESSAGES ================
    errors: {
        // Network errors
        network: "Network error. Please check your internet connection.",
        timeout: "Request timeout. Please try again.",
        quota: "Storage quota exceeded. Please free up space.",
        rateLimit: "Too many requests. Please wait and try again.",
        
        // Authentication errors
        authExpired: "Session expired. Please login again.",
        authInvalid: "Invalid authentication. Please reconnect.",
        authRevoked: "Access revoked. Please re-authorize.",
        
        // File errors
        fileNotFound: "File not found.",
        fileTooLarge: "File too large. Maximum size is 10GB.",
        uploadFailed: "Upload failed. Please try again.",
        deleteFailed: "Delete failed. Please try again.",
        
        // Local errors
        pinInvalid: "Invalid PIN. Please try again.",
        pinLocked: "Too many attempts. Try again in 5 minutes.",
        storageFull: "Local storage full. Please clear cache.",
        
        // General errors
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
    },
    
    // ================ INDEXEDDB CONFIG ================
    indexedDB: {
        name: "VaultCache",
        version: 2,
        stores: {
            files: {
                name: "files",
                keyPath: "id",
                indexes: [
                    { name: "folderId", keyPath: "folderId" },
                    { name: "timestamp", keyPath: "timestamp" },
                    { name: "type", keyPath: "type" },
                    { name: "name", keyPath: "name" }
                ]
            },
            thumbnails: {
                name: "thumbnails",
                keyPath: "fileId",
                indexes: [
                    { name: "timestamp", keyPath: "timestamp" },
                    { name: "size", keyPath: "size" }
                ]
            },
            metadata: {
                name: "metadata",
                keyPath: "key"
            },
            uploads: {
                name: "uploads",
                keyPath: "id",
                indexes: [
                    { name: "status", keyPath: "status" },
                    { name: "timestamp", keyPath: "timestamp" }
                ]
            }
        },
        limits: {
            maxFiles: 10000,
            maxThumbnails: 1000,
            maxCacheSize: 500 * 1024 * 1024 // 500MB
        }
    },
    
    // ================ CDN URLs ================
    cdn: {
        // Fonts & Icons
        boxicons: "https://cdn.jsdelivr.net/npm/boxicons@2.1.4/css/boxicons.min.css",
        fontAwesome: "https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css",
        unicons: "https://cdn.jsdelivr.net/npm/@iconscout/unicons@4.0.8/css/line.css",
        
        // Media Libraries
        plyr: {
            css: "https://cdn.plyr.io/3.7.8/plyr.css",
            js: "https://cdn.plyr.io/3.7.8/plyr.polyfilled.js"
        },
        pdfjs: "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.min.js",
        marked: "https://cdn.jsdelivr.net/npm/marked/marked.min.js",
        prism: {
            css: "https://cdnjs.cloudflare.com/ajax/libs/prism/1.29.0/themes/prism-tomorrow.min.css",
            js: "https://cdnjs.cloudflare.com/ajax/libs/prism/1.29.0/components/prism-core.min.js",
            autoloader: "https://cdnjs.cloudflare.com/ajax/libs/prism/1.29.0/plugins/autoloader/prism-autoloader.min.js"
        },
        howler: "https://cdnjs.cloudflare.com/ajax/libs/howler/2.2.4/howler.min.js",
        jszip: "https://cdnjs.cloudflare.com/ajax/libs/jszip/3.10.1/jszip.min.js",
        
        // Firebase
        firebase: {
            app: "https://www.gstatic.com/firebasejs/9.22.0/firebase-app-compat.js",
            database: "https://www.gstatic.com/firebasejs/9.22.0/firebase-database-compat.js",
            analytics: "https://www.gstatic.com/firebasejs/9.22.0/firebase-analytics-compat.js"
        },
        
        // Google Identity
        gsi: "https://accounts.google.com/gsi/client",
        
        // Debugging Tools
        eruda: "https://cdn.jsdelivr.net/npm/eruda"
    },
    
    // ================ DOMAIN WHITELIST ================
    trustedDomains: [
        // Google APIs
        "https://www.googleapis.com",
        "https://accounts.google.com",
        "https://oauth2.googleapis.com",
        "https://*.googleusercontent.com",
        "https://*.ggpht.com",
        "https://lh3.googleusercontent.com",
        "https://*.googleapis.com",
        "https://*.google.com",
        
        // Firebase Services
        "https://firestore.googleapis.com",
        "https://*.firebaseio.com",
        "https://*.firebasestorage.app",
        "https://*.firebaseapp.com",
        "https://*.web.app",
        
        // Google Apps Script
        "https://script.google.com",
        
        // CDNs
        "https://cdn.jsdelivr.net",
        "https://cdnjs.cloudflare.com",
        "https://www.gstatic.com",
        
        // Firebase Project: encrypted-vault-4683d
        "https://encrypted-vault-4683d.firebaseapp.com",
        "https://encrypted-vault-4683d.web.app",
        "https://encrypted-vault-4683d-default-rtdb.firebaseio.com",
        "https://encrypted-vault-4683d.appspot.com",
        
        // GitHub Pages
        "https://khademsorder.github.io",
        "https://khademsorder.github.io/Cvault",
        "https://khademsorder.github.io/Cvault/",
        "https://khademsorder.github.io/Cvault/prime.html",
        "https://khademsorder.github.io/Cvault/index.html",
        
        // Local Development
        "http://localhost",
        "http://localhost:5500",
        "http://localhost:3000",
        "http://localhost:8080",
        "http://127.0.0.1",
        "http://127.0.0.1:5500",
        "http://127.0.0.1:3000",
        "http://127.0.0.1:8080",
        
        // Current domain (dynamic)
        window.location.origin,
        
        // Wildcards for subdomains
        "https://*.github.io",
        "https://*.firebaseapp.com",
        "https://*.web.app"
    ],
    
    // ================ CSP DIRECTIVES ================
    csp: {
        defaultSrc: ["'self'"],
        scriptSrc: [
            "'self'",
            "'unsafe-inline'", // Required for inline scripts
            "'unsafe-eval'",   // Required for some libraries
            "https://cdn.jsdelivr.net",
            "https://cdnjs.cloudflare.com",
            "https://accounts.google.com",
            "https://www.gstatic.com",
            "https://apis.google.com",
            "https://www.googleapis.com",
            "https://khademsorder.github.io",
            "https://encrypted-vault-4683d.firebaseapp.com",
            "https://encrypted-vault-4683d.web.app"
        ],
        styleSrc: [
            "'self'",
            "'unsafe-inline'", // Required for inline styles
            "https://cdn.jsdelivr.net",
            "https://cdnjs.cloudflare.com",
            "https://fonts.googleapis.com"
        ],
        fontSrc: [
            "'self'",
            "https://cdn.jsdelivr.net",
            "https://cdnjs.cloudflare.com",
            "https://fonts.gstatic.com",
            "data:" // For data URLs
        ],
        imgSrc: [
            "'self'",
            "data:", // For data URLs
            "blob:", // For blob URLs
            "https://*.googleusercontent.com",
            "https://*.ggpht.com",
            "https://lh3.googleusercontent.com",
            "https://*.googleapis.com",
            "https://khademsorder.github.io",
            "https://encrypted-vault-4683d.firebaseapp.com",
            "https://encrypted-vault-4683d.web.app"
        ],
        connectSrc: [
            "'self'",
            "https://*.googleapis.com",
            "https://*.google.com",
            "https://firestore.googleapis.com",
            "https://*.firebaseio.com",
            "https://oauth2.googleapis.com",
            "https://www.googleapis.com",
            "https://encrypted-vault-4683d-default-rtdb.firebaseio.com",
            "https://encrypted-vault-4683d.firebaseapp.com",
            "https://encrypted-vault-4683d.web.app",
            "https://khademsorder.github.io",
            "wss://*.firebaseio.com" // For Firebase WebSocket
        ],
        mediaSrc: [
            "'self'",
            "blob:", // For media blobs
            "https://*.googlevideo.com",
            "https://*.googleusercontent.com",
            "https://*.googleapis.com"
        ],
        frameSrc: [
            "https://accounts.google.com",
            "https://khademsorder.github.io",
            "https://encrypted-vault-4683d.firebaseapp.com",
            "https://encrypted-vault-4683d.web.app"
        ],
        workerSrc: [
            "'self'",
            "blob:" // For service workers
        ],
        childSrc: [
            "'self'",
            "https://accounts.google.com",
            "https://khademsorder.github.io",
            "https://encrypted-vault-4683d.firebaseapp.com",
            "https://encrypted-vault-4683d.web.app"
        ]
    },
    
    // ================ ENVIRONMENT DETECTION ================
    environment: {
        // Host detection
        isLocalhost: window.location.hostname === "localhost" || 
                    window.location.hostname === "127.0.0.1",
        isGithubPages: window.location.hostname.includes("github.io"),
        isFirebase: window.location.hostname.includes("firebaseapp.com") || 
                   window.location.hostname.includes("web.app"),
        
        // Protocol detection
        isHTTPS: window.location.protocol === "https:",
        
        // Device detection
        isMobile: /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent),
        isIOS: /iPhone|iPad|iPod/i.test(navigator.userAgent),
        isAndroid: /Android/i.test(navigator.userAgent),
        isChrome: /Chrome/.test(navigator.userAgent) && /Google Inc/.test(navigator.vendor),
        isFirefox: /Firefox/.test(navigator.userAgent),
        isSafari: /Safari/.test(navigator.userAgent) && !/Chrome/.test(navigator.userAgent),
        
        // Deployment environment
        currentEnvironment: (() => {
            const hostname = window.location.hostname;
            if (hostname.includes("github.io")) return "github";
            if (hostname.includes("firebaseapp.com") || hostname.includes("web.app")) return "firebase";
            if (hostname === "localhost" || hostname === "127.0.0.1") return "local";
            return "unknown";
        })(),
        
        // Screen info
        screenWidth: window.screen.width,
        screenHeight: window.screen.height,
        pixelRatio: window.devicePixelRatio || 1,
        
        // Browser capabilities
        supportsIndexedDB: !!window.indexedDB,
        supportsServiceWorker: 'serviceWorker' in navigator,
        supportsWebGL: (() => {
            try {
                return !!window.WebGLRenderingContext && 
                       !!document.createElement('canvas').getContext('webgl');
            } catch (e) {
                return false;
            }
        })(),
        supportsWebP: (() => {
            const elem = document.createElement('canvas');
            if (elem.getContext && elem.getContext('2d')) {
                return elem.toDataURL('image/webp').indexOf('data:image/webp') === 0;
            }
            return false;
        })(),
        supportsLocalStorage: (() => {
            try {
                return 'localStorage' in window && window.localStorage !== null;
            } catch (e) {
                return false;
            }
        })()
    },
    
    // ================ DEBUG SETTINGS ================
    debug: {
        enabled: window.location.hostname === "localhost" || 
                window.location.hostname === "127.0.0.1" ||
                window.location.search.includes("debug=true"),
        
        // Log levels
        logLevel: "info", // debug, info, warn, error, silent
        
        // Features
        logNetwork: true,
        logErrors: true,
        logPerformance: true,
        logAuth: true,
        logCache: true,
        logEnvironment: true,
        
        // Mock data for testing
        useMockData: false,
        mockDelay: 500 // Simulate network delay in ms
    },
    
    // ================ PERFORMANCE OPTIMIZATIONS ================
    performance: {
        // Image optimization
        imageQuality: 0.8, // 0-1
        thumbnailQuality: 0.6,
        maxImageDimension: 4096,
        
        // Memory management
        maxDOMElements: 1000, // Virtual scrolling threshold
        cleanupInterval: 30000, // Cleanup every 30 seconds
        maxObjectURLs: 50, // Maximum blob URLs to keep
        
        // Network optimization
        requestTimeout: 30000, // 30 seconds
        cacheFirst: false, // Network-first by default
        prefetchThumbnails: true,
        prefetchCount: 20,
        
        // Environment-specific optimizations
        optimizations: {
            github: { cacheTTL: 3600000 }, // 1 hour cache for GitHub Pages
            firebase: { cacheTTL: 1800000 }, // 30 minutes cache for Firebase
            local: { cacheTTL: 0 } // No cache for local development
        }
    },
    
    // ================ LOCALIZATION ================
    localization: {
        defaultLanguage: "bn",
        languages: {
            bn: {
                name: "বাংলা",
                dir: "ltr"
            },
            en: {
                name: "English",
                dir: "ltr"
            }
        },
        strings: {
            // Will be loaded dynamically
        }
    },
    
    // ================ VERSION CONTROL ================
    version: {
        major: 5,
        minor: 0,
        patch: 0,
        build: Date.now(),
        compatibleWith: "4.0.0+",
        migrationRequired: false,
        
        // Environment-specific versions
        environmentVersions: {
            github: "5.0.0-github",
            firebase: "5.0.0-firebase",
            local: "5.0.0-local"
        }
    },
    
    // ================ URL CONFIGURATIONS ================
    urls: {
        // All valid deployment URLs
        production: [
            "https://khademsorder.github.io/Cvault/",
            "https://khademsorder.github.io/Cvault/prime.html",
            "https://encrypted-vault-4683d.web.app/",
            "https://encrypted-vault-4683d.firebaseapp.com/"
        ],
        development: [
            "http://localhost:5500",
            "http://localhost:3000",
            "http://localhost:8080",
            "http://localhost",
            "http://127.0.0.1:5500",
            "http://127.0.0.1:3000",
            "http://127.0.0.1:8080",
            "http://127.0.0.1"
        ],
        
        // OAuth redirect URLs (must match Google Cloud Console)
        oauthRedirect: [
            "https://khademsorder.github.io/Cvault/",
            "https://khademsorder.github.io/Cvault/prime.html",
            "https://encrypted-vault-4683d.web.app",
            "https://encrypted-vault-4683d.firebaseapp.com",
            "http://localhost:5500",
            "http://localhost:3000",
            "http://localhost"
        ],
        
        // API endpoints
        api: {
            google: "https://www.googleapis.com",
            firebase: "https://encrypted-vault-4683d-default-rtdb.firebaseio.com",
            github: "https://api.github.com/repos/khademsorder/Cvault"
        }
    }
};

// Freeze configuration to prevent modifications
Object.freeze(CONFIG);

// Export for module systems
if (typeof module !== 'undefined' && module.exports) {
    module.exports = CONFIG;
}
// ============================================
// VAULT OS v5.0 - MAIN APPLICATION
// Part 2/5: Core Framework & State Management
// ============================================

// Strict mode for error prevention
'use strict';

// Check if CONFIG is loaded
if (typeof CONFIG === 'undefined') {
    throw new Error('CONFIG not found. Make sure config.js is loaded before app.js');
}

// ================ MAIN APP OBJECT ================
const VaultOS = (function() {
    // Private variables
    let appState = {
        initialized: false,
        unlocked: false,
        pinHash: null,
        pinAttempts: 0,
        lockoutUntil: null,
        currentView: 'drive',
        currentDrive: 'user',
        selectedFiles: [],
        selectionMode: false,
        uploadQueue: [],
        uploadInProgress: false,
        searchQuery: '',
        sortBy: 'name_asc',
        viewMode: 'grid',
        theme: 'cyber',
        settings: {},
        sessionStart: null,
        tokenExpiry: null,
        lastActivity: Date.now(),
        autoLockTimeout: null,
        currentFolder: 'root',
        breadcrumb: ['My Drive'],
        isLoading: false
    };

    // Google API state
    let googleAuth = null;
    let googleUser = null;
    let googleToken = null;
    let tokenRefreshTimer = null;
    let sessionTimer = null;
    let activityMonitor = null;

    // DOM Elements cache
    const elements = {};

    // IndexedDB instance
    let db = null;

    // File cache
    let fileCache = new Map();
    let thumbnailCache = new Map();

    // Current file list
    let currentFiles = [];
    let currentFolders = [];

    // ================ INITIALIZATION ================
    function init() {
        console.log('🚀 Vault OS v5.0 Initializing...');
        
        try {
            // Validate environment
            validateEnvironment();
            
            // Cache DOM elements
            cacheElements();
            
            // Initialize IndexedDB
            initIndexedDB().catch(err => {
                console.warn('IndexedDB init failed:', err);
                showToast('warning', 'Storage Warning', 'Local cache disabled');
            });
            
            // Load settings from localStorage
            loadSettings();
            
            // Setup event listeners
            setupEventListeners();
            
            // Check for existing session
            checkExistingSession();
            
            // Setup activity monitor
            setupActivityMonitor();
            
            // Setup error handling
            setupErrorHandling();
            
            // Setup audio feedback
            setupAudio();
            
            // Update UI state
            updateUIState();
            
            // Setup drag and drop
            setupDragAndDrop();
            
            // Hide loading screen after 1.5 seconds
            setTimeout(() => {
                hideLoadingScreen();
                
                // Check if PIN is set
                const savedPin = localStorage.getItem('vault_pin_hash');
                if (savedPin) {
                    showPinScreen();
                } else {
                    // First time setup - set PIN
                    setupFirstTimePin();
                }
                
                appState.initialized = true;
                console.log('✅ Vault OS Initialized Successfully');
                
                // Show welcome toast
                showToast('success', 'Vault OS v5.0', 'Secure environment initialized');
                
                // Load mock data for initial display (will be replaced with real data)
                loadInitialData();
                
            }, 1500);
            
        } catch (error) {
            console.error('❌ Initialization failed:', error);
            showToast('error', 'Initialization Error', error.message);
            
            // Show error state
            const loadingScreen = document.getElementById('loadingScreen');
            if (loadingScreen) {
                loadingScreen.querySelector('.loading-text').textContent = 
                    `Error: ${error.message}. Please refresh.`;
            }
        }
    }

    // ================ ENVIRONMENT VALIDATION ================
    function validateEnvironment() {
        console.log('🔍 Validating environment...');
        
        const env = CONFIG.environment;
        
        // Check if running on trusted domain
        const currentOrigin = window.location.origin;
        const isTrusted = CONFIG.trustedDomains.some(domain => {
            if (domain.includes('*')) {
                const regex = new RegExp('^' + domain.replace('*.', '.*\.') + '$');
                return regex.test(currentOrigin);
            }
            return domain === currentOrigin;
        });
        
        if (!isTrusted) {
            console.warn(`Running on untrusted domain: ${currentOrigin}`);
            showToast('warning', 'Security Warning', 'Running on untrusted domain');
        }
        
        // Check for HTTPS in production
        if (env.isProduction && !env.isHTTPS) {
            console.warn('Not running on HTTPS in production environment');
        }
        
        // Check browser capabilities
        if (!env.supportsIndexedDB) {
            console.warn('IndexedDB not supported, caching disabled');
        }
        
        if (!env.supportsLocalStorage) {
            throw new Error('LocalStorage not supported. Please enable cookies.');
        }
        
        console.log('✅ Environment validation passed');
    }

    // ================ DOM ELEMENT CACHING ================
    function cacheElements() {
        console.log('🔍 Caching DOM elements...');
        
        // Loading & PIN screens
        elements.loadingScreen = document.getElementById('loadingScreen');
        elements.pinScreen = document.getElementById('pinScreen');
        elements.pinInput = document.querySelector('.pin-input');
        elements.pinDots = document.querySelectorAll('.pin-dot');
        elements.pinError = document.getElementById('pinError');
        elements.attemptCount = document.getElementById('attemptCount');
        elements.pinTimeout = document.getElementById('pinTimeout');
        
        // Main app container
        elements.appContainer = document.querySelector('.app-container');
        
        // Navigation
        elements.menuToggle = document.getElementById('menuToggle');
        elements.sidebar = document.getElementById('sidebar');
        elements.sidebarClose = document.getElementById('sidebarClose');
        elements.topNav = document.querySelector('.top-nav');
        
        // Drive tabs
        elements.driveTabs = document.getElementById('driveTabs');
        elements.copyToVaultBtn = document.getElementById('copyToVaultBtn');
        
        // Search
        elements.searchInput = document.getElementById('searchInput');
        elements.searchClear = document.getElementById('searchClear');
        
        // User profile
        elements.userProfile = document.getElementById('userProfile');
        elements.userAvatar = document.getElementById('userAvatar');
        elements.userName = document.getElementById('userName');
        elements.userEmail = document.getElementById('userEmail');
        elements.profilePic = document.getElementById('profilePic');
        
        // Sidebar menu items
        elements.googleConnectBtn = document.getElementById('googleConnectBtn');
        elements.reconnectBtn = document.getElementById('reconnectBtn');
        elements.settingsBtn = document.getElementById('settingsBtn');
        elements.storageInfoBtn = document.getElementById('storageInfoBtn');
        elements.createFolderBtn = document.getElementById('createFolderBtn');
        elements.fileInfoBtn = document.getElementById('fileInfoBtn');
        elements.logoutBtn = document.getElementById('logoutBtn');
        
        // Content area
        elements.gridView = document.getElementById('gridView');
        elements.listView = document.getElementById('listView');
        elements.contentArea = document.getElementById('contentArea');
        elements.breadcrumbPath = document.getElementById('breadcrumbPath');
        elements.tableBody = document.getElementById('tableBody');
        
        // File actions
        elements.selectAllBtn = document.getElementById('selectAllBtn');
        elements.shareBtn = document.getElementById('shareBtn');
        elements.downloadBtn = document.getElementById('downloadBtn');
        elements.copyBtn = document.getElementById('copyBtn');
        elements.moveBtn = document.getElementById('moveBtn');
        elements.deleteBtn = document.getElementById('deleteBtn');
        
        // Selection bar
        elements.fileActionsBar = document.getElementById('fileActionsBar');
        elements.selectedCount = document.getElementById('selectedCount');
        elements.actionCancel = document.getElementById('actionCancel');
        
        // View controls
        elements.viewToggle = document.getElementById('viewToggle');
        elements.sortSelect = document.getElementById('sortSelect');
        elements.viewSwitchBtns = document.querySelectorAll('.view-switch-btn');
        
        // Upload
        elements.uploadBtn = document.getElementById('uploadBtn');
        elements.uploadModal = document.getElementById('uploadModal');
        elements.fileInput = document.getElementById('fileInput');
        elements.folderInput = document.getElementById('folderInput');
        elements.uploadQueue = document.getElementById('uploadQueue');
        elements.queueItems = document.getElementById('queueItems');
        elements.queueToggle = document.getElementById('queueToggle');
        
        // Status bar
        elements.folderCount = document.getElementById('folderCount');
        elements.fileCount = document.getElementById('fileCount');
        elements.totalSize = document.getElementById('totalSize');
        elements.connectionStatus = document.getElementById('connectionStatus');
        elements.syncStatus = document.getElementById('syncStatus');
        elements.tokenStatus = document.getElementById('tokenStatus');
        elements.sessionTimer = document.getElementById('sessionTimer');
        
        // Storage info
        elements.storageUsed = document.getElementById('storageUsed');
        elements.storageTotal = document.getElementById('storageTotal');
        elements.storageFill = document.querySelector('.storage-fill');
        elements.storageMiniFill = document.querySelector('.storage-mini-fill');
        elements.storagePercent = document.querySelector('.storage-percent');
        
        // Context menu
        elements.contextMenu = document.getElementById('contextMenu');
        
        // Modals
        elements.modalOverlay = document.getElementById('modalOverlay');
        elements.googleConnectModal = document.getElementById('googleConnectModal');
        elements.settingsModal = document.getElementById('settingsModal');
        elements.storageInfoModal = document.getElementById('storageInfoModal');
        elements.fileInfoModal = document.getElementById('fileInfoModal');
        elements.shareModal = document.getElementById('shareModal');
        elements.moveCopyModal = document.getElementById('moveCopyModal');
        elements.previewModal = document.getElementById('previewModal');
        
        // Modal close buttons
        elements.modalCloses = document.querySelectorAll('.modal-close');
        
        // Toast container
        elements.toastContainer = document.getElementById('toastContainer');
        
        // Audio elements
        elements.clickSound = document.getElementById('clickSound');
        elements.successSound = document.getElementById('successSound');
        elements.errorSound = document.getElementById('errorSound');
        elements.lockSound = document.getElementById('lockSound');
        elements.unlockSound = document.getElementById('unlockSound');
        
        console.log('✅ DOM elements cached');
    }

    // ================ INDEXEDDB INITIALIZATION ================
    function initIndexedDB() {
        return new Promise((resolve, reject) => {
            if (!window.indexedDB) {
                console.warn('IndexedDB not supported, using localStorage fallback');
                resolve(false);
                return;
            }
            
            const request = indexedDB.open(CONFIG.indexedDB.name, CONFIG.indexedDB.version);
            
            request.onerror = (event) => {
                console.error('IndexedDB error:', event.target.error);
                reject(event.target.error);
            };
            
            request.onsuccess = (event) => {
                db = event.target.result;
                console.log('✅ IndexedDB initialized');
                
                // Set up error handling
                db.onerror = (event) => {
                    console.error('Database error:', event.target.error);
                };
                
                // Set up version change handler
                db.onversionchange = () => {
                    db.close();
                    console.log('Database version changed. Please reload the page.');
                };
                
                resolve(true);
            };
            
            request.onupgradeneeded = (event) => {
                const db = event.target.result;
                console.log('IndexedDB upgrade needed:', event.oldVersion, '→', event.newVersion);
                
                // Create object stores
                Object.keys(CONFIG.indexedDB.stores).forEach(storeName => {
                    const storeConfig = CONFIG.indexedDB.stores[storeName];
                    
                    if (!db.objectStoreNames.contains(storeName)) {
                        const store = db.createObjectStore(storeName, {
                            keyPath: storeConfig.keyPath
                        });
                        
                        // Create indexes
                        if (storeConfig.indexes) {
                            storeConfig.indexes.forEach(index => {
                                try {
                                    store.createIndex(index.name, index.keyPath, { unique: false });
                                } catch (e) {
                                    console.warn(`Failed to create index ${index.name}:`, e);
                                }
                            });
                        }
                    }
                });
            };
            
            request.onblocked = () => {
                console.warn('IndexedDB blocked. Please close other tabs with Vault OS.');
                showToast('warning', 'Database Blocked', 'Please close other Vault OS tabs');
            };
        });
    }

    // ================ SETTINGS MANAGEMENT ================
    function loadSettings() {
        try {
            const savedSettings = localStorage.getItem('vault_settings');
            if (savedSettings) {
                appState.settings = JSON.parse(savedSettings);
                console.log('✅ Settings loaded from localStorage');
            } else {
                // Default settings
                appState.settings = {
                    theme: 'cyber',
                    defaultView: 'grid',
                    confirmDelete: true,
                    confirmOverwrite: true,
                    showThumbnails: true,
                    autoLock: true,
                    sessionTimeout: 24,
                    tokenRefresh: 45,
                    chunkUpload: true,
                    onlineOnly: true,
                    chunkSize: 5,
                    parallelUploads: 2,
                    cacheLimit: 500,
                    thumbnailCache: 200,
                    lazyLoading: true,
                    prefetchThumbnails: true,
                    imageViewer: true,
                    pdfViewer: true,
                    videoViewer: true,
                    audioViewer: true,
                    textViewer: true,
                    codeViewer: true,
                    archiveViewer: true
                };
                saveSettings();
            }
            
            // Apply theme
            applyTheme(appState.settings.theme);
            
            // Apply view mode
            appState.viewMode = appState.settings.defaultView;
            updateViewMode();
            
        } catch (error) {
            console.error('Error loading settings:', error);
            showToast('error', 'Settings Error', 'Failed to load settings');
        }
    }

    function saveSettings() {
        try {
            localStorage.setItem('vault_settings', JSON.stringify(appState.settings));
            console.log('✅ Settings saved');
        } catch (error) {
            console.error('Error saving settings:', error);
            showToast('error', 'Settings Error', 'Failed to save settings');
        }
    }

    // ================ EVENT LISTENERS SETUP ================
    function setupEventListeners() {
        console.log('🎯 Setting up event listeners...');
        
        // Window events
        window.addEventListener('resize', debounce(handleResize, 250));
        window.addEventListener('online', updateConnectionStatus);
        window.addEventListener('offline', updateConnectionStatus);
        window.addEventListener('beforeunload', handleBeforeUnload);
        window.addEventListener('keydown', handleKeydown);
        window.addEventListener('click', handleGlobalClick);
        window.addEventListener('blur', () => {
            appState.lastActivity = Date.now();
        });
        
        // PIN screen events
        document.querySelectorAll('.pin-key').forEach(key => {
            key.addEventListener('click', handlePinKeyClick);
        });
        
        // Navigation events
        elements.menuToggle.addEventListener('click', toggleSidebar);
        elements.sidebarClose.addEventListener('click', toggleSidebar);
        elements.userProfile.addEventListener('click', toggleUserMenu);
        elements.logoutBtn.addEventListener('click', lockVault);
        
        // Sidebar menu items
        document.querySelectorAll('.menu-item[data-view]').forEach(item => {
            item.addEventListener('click', handleMenuClick);
        });
        
        // Drive tabs
        document.querySelectorAll('.drive-tab').forEach(tab => {
            tab.addEventListener('click', handleDriveTabClick);
        });
        
        // Search events
        elements.searchInput.addEventListener('input', debounce(handleSearch, 300));
        elements.searchClear.addEventListener('click', clearSearch);
        
        // Upload events
        elements.uploadBtn.addEventListener('click', showUploadModal);
        elements.fileInput.addEventListener('change', handleFileSelect);
        elements.folderInput.addEventListener('change', handleFolderSelect);
        
        // Modal events
        elements.modalCloses.forEach(btn => {
            btn.addEventListener('click', closeAllModals);
        });
        elements.modalOverlay.addEventListener('click', closeAllModals);
        
        // Google connect
        elements.googleConnectBtn.addEventListener('click', showGoogleConnectModal);
        
        // Settings
        elements.settingsBtn.addEventListener('click', showSettingsModal);
        
        // Storage info
        elements.storageInfoBtn.addEventListener('click', showStorageInfoModal);
        
        // File operations
        elements.selectAllBtn.addEventListener('click', toggleSelectAll);
        elements.shareBtn.addEventListener('click', showShareModal);
        elements.downloadBtn.addEventListener('click', downloadSelected);
        elements.copyBtn.addEventListener('click', showCopyModal);
        elements.moveBtn.addEventListener('click', showMoveModal);
        elements.deleteBtn.addEventListener('click', deleteSelected);
        
        // Selection actions
        elements.actionCancel.addEventListener('click', cancelSelection);
        
        // View controls
        elements.viewToggle.addEventListener('click', toggleViewMode);
        elements.sortSelect.addEventListener('change', handleSortChange);
        elements.viewSwitchBtns.forEach(btn => {
            btn.addEventListener('click', handleViewSwitch);
        });
        
        // Context menu
        document.addEventListener('contextmenu', handleContextMenu);
        document.addEventListener('click', hideContextMenu);
        
        // Queue toggle
        elements.queueToggle.addEventListener('click', toggleUploadQueue);
        
        // Breadcrumb events
        elements.breadcrumbPath.addEventListener('click', handleBreadcrumbClick);
        
        console.log('✅ Event listeners setup complete');
    }

    // ================ SESSION MANAGEMENT ================
    function checkExistingSession() {
        const sessionData = localStorage.getItem('vault_session');
        
        if (sessionData) {
            try {
                const session = JSON.parse(sessionData);
                const now = Date.now();
                
                // Check if session is still valid (24 hours)
                if (session.expiry > now) {
                    appState.sessionStart = session.start;
                    appState.tokenExpiry = session.expiry;
                    
                    // Check if we have a valid Google token
                    const savedToken = localStorage.getItem('google_token');
                    if (savedToken) {
                        const token = JSON.parse(savedToken);
                        if (token.expiry > now) {
                            googleToken = token;
                            startSessionTimer();
                            startTokenRefreshTimer();
                            updateConnectionStatus(true);
                            
                            // Load user info
                            const savedUser = localStorage.getItem('google_user');
                            if (savedUser) {
                                googleUser = JSON.parse(savedUser);
                                updateUserInfo(googleUser);
                            }
                        }
                    }
                } else {
                    // Session expired, clear it
                    clearSession();
                }
            } catch (error) {
                console.error('Error parsing session data:', error);
                clearSession();
            }
        }
    }

    function startSession() {
        const now = Date.now();
        const expiry = now + (CONFIG.security.sessionHours * 60 * 60 * 1000);
        
        appState.sessionStart = now;
        appState.tokenExpiry = expiry;
        
        const sessionData = {
            start: now,
            expiry: expiry
        };
        
        try {
            localStorage.setItem('vault_session', JSON.stringify(sessionData));
        } catch (error) {
            console.error('Failed to save session:', error);
            showToast('error', 'Storage Error', 'Failed to save session data');
        }
        
        startSessionTimer();
        startTokenRefreshTimer();
        
        console.log('✅ Session started');
    }

    function clearSession() {
        try {
            localStorage.removeItem('vault_session');
            localStorage.removeItem('google_token');
            localStorage.removeItem('google_user');
        } catch (error) {
            console.error('Failed to clear session:', error);
        }
        
        appState.sessionStart = null;
        appState.tokenExpiry = null;
        
        if (sessionTimer) {
            clearInterval(sessionTimer);
            sessionTimer = null;
        }
        
        if (tokenRefreshTimer) {
            clearInterval(tokenRefreshTimer);
            tokenRefreshTimer = null;
        }
        
        updateConnectionStatus(false);
        console.log('✅ Session cleared');
    }

    function startSessionTimer() {
        if (sessionTimer) clearInterval(sessionTimer);
        
        sessionTimer = setInterval(() => {
            if (!appState.sessionStart) return;
            
            const now = Date.now();
            const elapsed = now - appState.sessionStart;
            const total = CONFIG.security.sessionHours * 60 * 60 * 1000;
            const remaining = total - elapsed;
            
            if (remaining <= 0) {
                // Session expired
                showToast('warning', 'Session Expired', 'Your session has ended');
                lockVault();
                return;
            }
            
            // Update timer display
            updateSessionTimer(remaining);
            
            // Check for inactivity
            const inactiveTime = now - appState.lastActivity;
            const autoLockMinutes = 5; // 5 minutes of inactivity
            
            if (appState.settings.autoLock && inactiveTime > autoLockMinutes * 60 * 1000) {
                showToast('info', 'Auto Lock', 'Vault locked due to inactivity');
                lockVault();
            }
            
        }, 1000);
    }

    function startTokenRefreshTimer() {
        if (tokenRefreshTimer) clearInterval(tokenRefreshTimer);
        
        tokenRefreshTimer = setInterval(() => {
            if (!googleToken || !googleToken.expiry) return;
            
            const now = Date.now();
            const timeUntilExpiry = googleToken.expiry - now;
            const refreshThreshold = CONFIG.security.tokenRefreshMinutes * 60 * 1000;
            
            if (timeUntilExpiry < refreshThreshold) {
                refreshGoogleToken().catch(err => {
                    console.error('Token refresh failed:', err);
                    showToast('error', 'Token Refresh Failed', 'Please reconnect to Google Drive');
                });
            }
        }, 300000); // Check every 5 minutes
    }

    // ================ ACTIVITY MONITOR ================
    function setupActivityMonitor() {
        // Track user activity
        const activityEvents = ['mousedown', 'mousemove', 'keydown', 'scroll', 'touchstart'];
        
        activityEvents.forEach(event => {
            window.addEventListener(event, () => {
                appState.lastActivity = Date.now();
            }, { passive: true });
        });
        
        console.log('✅ Activity monitor setup');
    }

    // ================ ERROR HANDLING ================
    function setupErrorHandling() {
        // Global error handler
        window.addEventListener('error', (event) => {
            console.error('Global error:', event.error);
            logError('global', event.error);
        });
        
        // Unhandled promise rejection
        window.addEventListener('unhandledrejection', (event) => {
            console.error('Unhandled promise rejection:', event.reason);
            logError('promise', event.reason);
        });
        
        console.log('✅ Error handling setup');
    }

    function logError(type, error) {
        const errorData = {
            type: type,
            message: error.message || String(error),
            stack: error.stack,
            timestamp: new Date().toISOString(),
            user: googleUser ? googleUser.email : 'anonymous',
            url: window.location.href
        };
        
        // Save to IndexedDB
        if (db) {
            try {
                const transaction = db.transaction(['errors'], 'readwrite');
                const store = transaction.objectStore('errors');
                store.add(errorData);
            } catch (e) {
                console.error('Failed to log error to IndexedDB:', e);
            }
        }
        
        // Show toast for user-facing errors
        if (!error.silent) {
            showToast('error', 'Error', error.message || 'An error occurred');
        }
    }

    // ================ AUDIO FEEDBACK ================
    function setupAudio() {
        // Create audio context for better sound control
        try {
            if (window.AudioContext || window.webkitAudioContext) {
                const AudioContext = window.AudioContext || window.webkitAudioContext;
                const audioContext = new AudioContext();
                
                // Create oscillator for click sound
                function createClickSound() {
                    if (audioContext.state === 'suspended') {
                        audioContext.resume();
                    }
                    
                    const oscillator = audioContext.createOscillator();
                    const gainNode = audioContext.createGain();
                    
                    oscillator.connect(gainNode);
                    gainNode.connect(audioContext.destination);
                    
                    oscillator.frequency.setValueAtTime(800, audioContext.currentTime);
                    oscillator.frequency.exponentialRampToValueAtTime(400, audioContext.currentTime + 0.1);
                    
                    gainNode.gain.setValueAtTime(0.1, audioContext.currentTime);
                    gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.1);
                    
                    oscillator.start();
                    oscillator.stop(audioContext.currentTime + 0.1);
                }
                
                // Replace click sound with Web Audio API version
                document.addEventListener('click', (event) => {
                    if (event.target.matches('button, .clickable, [role="button"]')) {
                        createClickSound();
                    }
                });
            }
        } catch (error) {
            console.warn('Web Audio API not available, using fallback sounds');
        }
    }

    function playSound(soundType) {
        try {
            const sound = elements[soundType + 'Sound'];
            if (sound) {
                sound.currentTime = 0;
                sound.play().catch(e => {
                    if (CONFIG.debug.enabled) {
                        console.warn('Sound play failed:', e);
                    }
                });
            }
        } catch (error) {
            if (CONFIG.debug.enabled) {
                console.warn('Sound play error:', error);
            }
        }
    }

    // ================ UI STATE MANAGEMENT ================
    function updateUIState() {
        // Update connection status
        updateConnectionStatus();
        
        // Update storage info
        updateStorageInfo();
        
        // Update user info if logged in
        if (googleUser) {
            updateUserInfo(googleUser);
        }
        
        // Update session timer
        if (appState.sessionStart) {
            updateSessionTimer();
        }
        
        // Update button states
        updateButtonStates();
    }

    function updateConnectionStatus(connected = false) {
        const isOnline = navigator.onLine;
        const isGoogleConnected = connected || googleToken !== null;
        
        let statusText = '';
        let statusIcon = '';
        let statusClass = '';
        
        if (!isOnline) {
            statusText = 'Offline';
            statusIcon = 'bx-wifi-off';
            statusClass = 'offline';
        } else if (!isGoogleConnected) {
            statusText = 'No Google Connection';
            statusIcon = 'bx-cloud-off';
            statusClass = 'disconnected';
        } else {
            statusText = 'Connected';
            statusIcon = 'bx-wifi';
            statusClass = 'connected';
        }
        
        // Update status bar
        if (elements.connectionStatus) {
            elements.connectionStatus.innerHTML = `<i class='bx ${statusIcon}'></i><span>${statusText}</span>`;
            elements.connectionStatus.className = `status-item ${statusClass}`;
        }
        
        // Update sidebar status
        if (elements.connectStatus) {
            elements.connectStatus.textContent = statusText;
            elements.connectStatus.className = `menu-status ${statusClass}`;
        }
        
        // Update token status
        if (elements.tokenStatus) {
            if (isGoogleConnected && googleToken) {
                const expiryTime = googleToken.expiry;
                const now = Date.now();
                const minutesLeft = Math.max(0, Math.floor((expiryTime - now) / 60000));
                
                elements.tokenStatus.innerHTML = `<i class='bx bx-shield'></i><span>Token: ${minutesLeft}m</span>`;
                
                if (minutesLeft < 10) {
                    elements.tokenStatus.classList.add('warning');
                } else {
                    elements.tokenStatus.classList.remove('warning');
                }
            } else {
                elements.tokenStatus.innerHTML = `<i class='bx bx-shield-x'></i><span>Token: None</span>`;
            }
        }
        
        // Update sync status
        if (elements.syncStatus) {
            if (isGoogleConnected) {
                elements.syncStatus.innerHTML = `<i class='bx bx-check'></i><span>Synced</span>`;
                elements.syncStatus.classList.remove('syncing');
            } else {
                elements.syncStatus.innerHTML = `<i class='bx bx-time'></i><span>Last sync: Never</span>`;
            }
        }
    }

    function updateStorageInfo() {
        // This will be populated with real data from Google Drive
        const used = '0 GB';
        const total = '15 GB';
        const percent = 0;
        
        if (elements.storageUsed) elements.storageUsed.textContent = used;
        if (elements.storageTotal) elements.storageTotal.textContent = total;
        if (elements.storagePercent) elements.storagePercent.textContent = '0%';
        if (elements.storageFill) elements.storageFill.style.width = '0%';
        if (elements.storageMiniFill) elements.storageMiniFill.style.width = '0%';
    }

    function updateSessionTimer(remainingMs) {
        if (!elements.sessionTimer) return;
        
        const hours = Math.floor(remainingMs / 3600000);
        const minutes = Math.floor((remainingMs % 3600000) / 60000);
        const seconds = Math.floor((remainingMs % 60000) / 1000);
        
        const timeString = `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
        elements.sessionTimer.textContent = timeString;
    }

    function updateUserInfo(user) {
        if (elements.userName) {
            elements.userName.textContent = user.name || 'Google User';
        }
        
        if (elements.userEmail) {
            elements.userEmail.textContent = user.email || 'user@example.com';
        }
        
        if (elements.userAvatar) {
            if (user.picture) {
                elements.userAvatar.innerHTML = `<img src="${user.picture}" alt="${user.name}" onerror="this.style.display='none';this.parentElement.innerHTML='<i class=\"bx bx-user\"></i>'" />`;
                elements.userAvatar.classList.add('has-image');
            } else {
                elements.userAvatar.innerHTML = '<i class="bx bx-user"></i>';
                elements.userAvatar.classList.remove('has-image');
            }
        }
        
        if (elements.profilePic) {
            if (user.picture) {
                elements.profilePic.innerHTML = `<img src="${user.picture}" alt="${user.name}" onerror="this.style.display='none';this.parentElement.innerHTML='<i class=\"bx bx-user\"></i>'" />`;
                elements.profilePic.classList.add('has-image');
            } else {
                elements.profilePic.innerHTML = '<i class="bx bx-user"></i>';
                elements.profilePic.classList.remove('has-image');
            }
        }
    }

    function updateButtonStates() {
        const hasSelection = appState.selectedFiles.length > 0;
        
        // Update action buttons
        if (elements.shareBtn) {
            elements.shareBtn.disabled = !hasSelection;
        }
        if (elements.downloadBtn) {
            elements.downloadBtn.disabled = !hasSelection;
        }
        if (elements.copyBtn) {
            elements.copyBtn.disabled = !hasSelection;
        }
        if (elements.moveBtn) {
            elements.moveBtn.disabled = !hasSelection;
        }
        if (elements.deleteBtn) {
            elements.deleteBtn.disabled = !hasSelection;
        }
        
        // Update selection bar
        if (elements.fileActionsBar) {
            if (hasSelection) {
                elements.fileActionsBar.style.display = 'flex';
                if (elements.selectedCount) {
                    elements.selectedCount.textContent = appState.selectedFiles.length;
                }
            } else {
                elements.fileActionsBar.style.display = 'none';
            }
        }
        
        // Update select all button icon
        if (elements.selectAllBtn) {
            if (appState.selectedFiles.length === currentFiles.length && currentFiles.length > 0) {
                elements.selectAllBtn.innerHTML = '<i class="bx bx-checkbox-checked"></i>';
            } else {
                elements.selectAllBtn.innerHTML = '<i class="bx bx-checkbox"></i>';
            }
        }
    }

    // ================ PIN MANAGEMENT ================
    function setupFirstTimePin() {
        showToast('info', 'First Time Setup', 'Please set a 4-digit PIN for security');
        
        // Show PIN setup modal (simplified - using same PIN screen)
        setTimeout(() => {
            showPinScreen();
            showToast('info', 'Set PIN', 'Enter a new 4-digit PIN');
        }, 1000);
    }

    function handlePinKeyClick(event) {
        const key = event.currentTarget.dataset.key;
        const currentPin = elements.pinInput.textContent || '';
        
        playSound('click');
        
        if (key === 'clear') {
            clearPinInput();
        } else if (key === 'submit') {
            handlePinSubmit(currentPin);
        } else if (currentPin.length < 4) {
            updatePinInput(currentPin + key);
        }
    }

    function updatePinInput(pin) {
        if (!elements.pinInput) return;
        
        elements.pinInput.textContent = pin;
        
        // Update dots
        if (elements.pinDots) {
            elements.pinDots.forEach((dot, index) => {
                if (index < pin.length) {
                    dot.classList.add('filled');
                } else {
                    dot.classList.remove('filled');
                }
            });
        }
        
        // Auto-submit when 4 digits entered
        if (pin.length === 4) {
            setTimeout(() => handlePinSubmit(pin), 300);
        }
    }

    function clearPinInput() {
        if (!elements.pinInput || !elements.pinDots) return;
        
        elements.pinInput.textContent = '';
        elements.pinDots.forEach(dot => dot.classList.remove('filled'));
        
        if (elements.pinError) {
            elements.pinError.textContent = '';
            elements.pinError.classList.remove('show');
        }
    }

    function handlePinSubmit(pin) {
        // Check if PIN is being set for first time
        const savedPin = localStorage.getItem('vault_pin_hash');
        
        if (!savedPin) {
            // First time setup - save PIN
            const pinHash = hashPin(pin);
            try {
                localStorage.setItem('vault_pin_hash', pinHash);
                appState.pinHash = pinHash;
                
                showToast('success', 'PIN Set', 'PIN saved successfully');
                hidePinScreen();
                unlockVault();
                return;
            } catch (error) {
                showPinError('Failed to save PIN. Storage may be full.');
                return;
            }
        }
        
        // Verify existing PIN
        if (appState.lockoutUntil && Date.now() < appState.lockoutUntil) {
            const minutesLeft = Math.ceil((appState.lockoutUntil - Date.now()) / 60000);
            showPinError(`Too many attempts. Try again in ${minutesLeft} minutes.`);
            return;
        }
        
        const pinHash = hashPin(pin);
        
        if (pinHash === savedPin) {
            // Successful unlock
            appState.pinAttempts = 0;
            appState.lockoutUntil = null;
            clearPinInput();
            hidePinScreen();
            unlockVault();
            playSound('unlock');
        } else {
            // Failed attempt
            appState.pinAttempts++;
            
            if (appState.pinAttempts >= CONFIG.security.maxPinAttempts) {
                // Lockout
                appState.lockoutUntil = Date.now() + (CONFIG.security.lockoutMinutes * 60000);
                showPinError(`Too many attempts. Locked for ${CONFIG.security.lockoutMinutes} minutes.`);
                showPinLockout();
            } else {
                const remaining = CONFIG.security.maxPinAttempts - appState.pinAttempts;
                showPinError(`Incorrect PIN. ${remaining} attempt${remaining !== 1 ? 's' : ''} remaining.`);
            }
            
            clearPinInput();
            playSound('error');
        }
        
        updatePinAttempts();
    }

    function hashPin(pin) {
        // Simple hash for demonstration
        // In production, use a proper cryptographic hash with salt
        let hash = 0;
        for (let i = 0; i < pin.length; i++) {
            const char = pin.charCodeAt(i);
            hash = ((hash << 5) - hash) + char;
            hash = hash & hash;
        }
        return (hash + CONFIG.security.pinSalt).toString(16);
    }

    function showPinError(message) {
        if (!elements.pinError) return;
        
        elements.pinError.textContent = message;
        elements.pinError.classList.add('show');
        
        // Auto hide after 3 seconds
        setTimeout(() => {
            if (elements.pinError) {
                elements.pinError.classList.remove('show');
            }
        }, 3000);
    }

    function showPinLockout() {
        if (!elements.pinTimeout) return;
        
        elements.pinTimeout.style.display = 'flex';
        const minutes = CONFIG.security.lockoutMinutes;
        const timeoutMinutes = elements.pinTimeout.querySelector('#timeoutMinutes');
        if (timeoutMinutes) {
            timeoutMinutes.textContent = minutes;
        }
        
        // Update countdown
        let secondsLeft = minutes * 60;
        const countdown = setInterval(() => {
            secondsLeft--;
            
            if (secondsLeft <= 0) {
                clearInterval(countdown);
                if (elements.pinTimeout) {
                    elements.pinTimeout.style.display = 'none';
                }
                appState.lockoutUntil = null;
                return;
            }
            
            const mins = Math.floor(secondsLeft / 60);
            if (timeoutMinutes) {
                timeoutMinutes.textContent = mins;
            }
        }, 1000);
    }

    function updatePinAttempts() {
        if (elements.attemptCount) {
            elements.attemptCount.textContent = `${appState.pinAttempts}/${CONFIG.security.maxPinAttempts}`;
        }
    }

    // ================ SCREEN MANAGEMENT ================
    function showLoadingScreen() {
        if (elements.loadingScreen) {
            elements.loadingScreen.classList.add('active');
        }
    }

    function hideLoadingScreen() {
        if (elements.loadingScreen) {
            elements.loadingScreen.classList.remove('active');
            setTimeout(() => {
                elements.loadingScreen.style.display = 'none';
            }, 500);
        }
    }

    function showPinScreen() {
        if (elements.pinScreen) {
            elements.pinScreen.classList.add('active');
            clearPinInput();
            updatePinAttempts();
            
            if (appState.lockoutUntil) {
                showPinLockout();
            }
        }
    }

    function hidePinScreen() {
        if (elements.pinScreen) {
            elements.pinScreen.classList.remove('active');
        }
    }

    function showAppContainer() {
        if (elements.appContainer) {
            elements.appContainer.style.display = 'flex';
            setTimeout(() => {
                elements.appContainer.style.opacity = '1';
            }, 10);
        }
    }

    function hideAppContainer() {
        if (elements.appContainer) {
            elements.appContainer.style.opacity = '0';
            setTimeout(() => {
                elements.appContainer.style.display = 'none';
            }, 300);
        }
    }

    function unlockVault() {
        appState.unlocked = true;
        hidePinScreen();
        showAppContainer();
        startSession();
        showToast('success', 'Vault Unlocked', 'Secure access granted');
        
        // Try to auto-connect Google if token exists
        const savedToken = localStorage.getItem('google_token');
        if (savedToken) {
            try {
                const token = JSON.parse(savedToken);
                if (token.expiry > Date.now()) {
                    googleToken = token;
                    loadGoogleUserInfo().catch(err => {
                        console.error('Failed to load user info:', err);
                    });
                    updateConnectionStatus(true);
                }
            } catch (error) {
                console.error('Error loading saved token:', error);
            }
        }
    }

    function lockVault() {
        appState.unlocked = false;
        
        // Clear sensitive data from memory
        googleToken = null;
        googleUser = null;
        appState.selectedFiles = [];
        appState.selectionMode = false;
        
        // Hide app, show PIN screen
        hideAppContainer();
        showPinScreen();
        
        // Stop timers
        if (sessionTimer) {
            clearInterval(sessionTimer);
            sessionTimer = null;
        }
        
        if (tokenRefreshTimer) {
            clearInterval(tokenRefreshTimer);
            tokenRefreshTimer = null;
        }
        
        playSound('lock');
        showToast('info', 'Vault Locked', 'All sensitive data secured');
    }

    // ================ SIDEBAR MANAGEMENT ================
    function toggleSidebar() {
        if (!elements.sidebar || !elements.menuToggle) return;
        
        elements.sidebar.classList.toggle('active');
        playSound('click');
        
        // Update menu toggle icon
        if (elements.sidebar.classList.contains('active')) {
            elements.menuToggle.innerHTML = '<i class="bx bx-x"></i>';
        } else {
            elements.menuToggle.innerHTML = '<i class="bx bx-menu"></i>';
        }
    }

    function toggleUserMenu() {
        // TODO: Implement user menu dropdown
        playSound('click');
        showToast('info', 'User Menu', 'User menu will be implemented');
    }

    // ================ VIEW MANAGEMENT ================
    function updateViewMode() {
        if (!elements.gridView || !elements.listView || !elements.viewToggle) return;
        
        if (appState.viewMode === 'grid') {
            elements.gridView.style.display = 'grid';
            elements.listView.style.display = 'none';
            elements.viewToggle.innerHTML = '<i class="bx bx-list-ul"></i>';
            
            // Update view switch buttons
            if (elements.viewSwitchBtns) {
                elements.viewSwitchBtns.forEach(btn => {
                    if (btn.dataset.view === 'grid') {
                        btn.classList.add('active');
                    } else {
                        btn.classList.remove('active');
                    }
                });
            }
        } else {
            elements.gridView.style.display = 'none';
            elements.listView.style.display = 'block';
            elements.viewToggle.innerHTML = '<i class="bx bx-grid-alt"></i>';
            
            // Update view switch buttons
            if (elements.viewSwitchBtns) {
                elements.viewSwitchBtns.forEach(btn => {
                    if (btn.dataset.view === 'list') {
                        btn.classList.add('active');
                    } else {
                        btn.classList.remove('active');
                    }
                });
            }
        }
    }

    function toggleViewMode() {
        appState.viewMode = appState.viewMode === 'grid' ? 'list' : 'grid';
        updateViewMode();
        appState.settings.defaultView = appState.viewMode;
        saveSettings();
        playSound('click');
    }

    function handleViewSwitch(event) {
        const view = event.currentTarget.dataset.view;
        if (view && view !== appState.viewMode) {
            appState.viewMode = view;
            updateViewMode();
            appState.settings.defaultView = appState.viewMode;
            saveSettings();
            playSound('click');
        }
    }

    // ================ THEME MANAGEMENT ================
    function applyTheme(theme) {
        if (!CONFIG.settings.themes.includes(theme)) {
            theme = 'cyber';
        }
        
        document.documentElement.setAttribute('data-theme', theme);
        appState.theme = theme;
        appState.settings.theme = theme;
        
        // Update theme select if in settings modal
        const themeSelect = document.getElementById('themeSelect');
        if (themeSelect) {
            themeSelect.value = theme;
        }
    }

    // ================ TOAST NOTIFICATIONS ================
    function showToast(type, title, message, duration = 5000) {
        if (!elements.toastContainer) return null;
        
        const toast = document.createElement('div');
        toast.className = `toast ${type}`;
        toast.innerHTML = `
            <div class="toast-icon">
                <i class='bx bx-${getToastIcon(type)}'></i>
            </div>
            <div class="toast-content">
                <div class="toast-title">${title}</div>
                <div class="toast-message">${message}</div>
            </div>
            <button class="toast-close">
                <i class='bx bx-x'></i>
            </button>
        `;
        
        elements.toastContainer.appendChild(toast);
        
        // Play sound
        if (type === 'success') playSound('success');
        if (type === 'error') playSound('error');
        
        // Auto remove
        const removeTimer = setTimeout(() => {
            removeToast(toast);
        }, duration);
        
        // Close button
        const closeBtn = toast.querySelector('.toast-close');
        closeBtn.addEventListener('click', () => {
            clearTimeout(removeTimer);
            removeToast(toast);
        });
        
        return toast;
    }

    function getToastIcon(type) {
        const icons = {
            success: 'check-circle',
            error: 'error-circle',
            warning: 'error',
            info: 'info-circle'
        };
        return icons[type] || 'info-circle';
    }

    function removeToast(toast) {
        if (!toast || !toast.parentNode) return;
        
        toast.classList.add('hiding');
        setTimeout(() => {
            if (toast.parentNode) {
                toast.parentNode.removeChild(toast);
            }
        }, 300);
    }

    // ================ EVENT HANDLERS ================
    function handleResize() {
        // Handle responsive adjustments
        if (window.innerWidth < 768) {
            // Mobile view adjustments
            if (elements.sidebar && elements.sidebar.classList.contains('active')) {
                elements.sidebar.classList.remove('active');
                if (elements.menuToggle) {
                    elements.menuToggle.innerHTML = '<i class="bx bx-menu"></i>';
                }
            }
        }
    }

    function handleKeydown(event) {
        // Escape key closes modals and context menu
        if (event.key === 'Escape') {
            closeAllModals();
            hideContextMenu();
            
            // Also cancel selection mode
            if (appState.selectionMode) {
                cancelSelection();
            }
        }
        
        // Ctrl/Cmd + F focuses search
        if ((event.ctrlKey || event.metaKey) && event.key === 'f') {
            event.preventDefault();
            if (elements.searchInput) {
                elements.searchInput.focus();
            }
        }
        
        // Ctrl/Cmd + A selects all files
        if ((event.ctrlKey || event.metaKey) && event.key === 'a') {
            event.preventDefault();
            if (appState.unlocked && currentFiles.length > 0) {
                toggleSelectAll();
            }
        }
        
        // Delete key deletes selected files
        if (event.key === 'Delete' && appState.selectedFiles.length > 0) {
            event.preventDefault();
            deleteSelected();
        }
    }

    function handleGlobalClick(event) {
        // Update last activity
        appState.lastActivity = Date.now();
        
        // Hide context menu if clicking outside
        if (elements.contextMenu && elements.contextMenu.classList.contains('active')) {
            if (!event.target.closest('.context-menu') && !event.target.closest('.file-action-btn')) {
                hideContextMenu();
            }
        }
    }

    function handleBeforeUnload(event) {
        // Warn about unsaved uploads
        if (appState.uploadQueue.some(upload => upload.status === 'uploading')) {
            event.preventDefault();
            event.returnValue = 'You have uploads in progress. Are you sure you want to leave?';
            return event.returnValue;
        }
        
        // Save state before leaving
        try {
            localStorage.setItem('vault_last_state', JSON.stringify({
                view: appState.currentView,
                folder: appState.currentFolder,
                search: appState.searchQuery,
                sort: appState.sortBy,
                timestamp: Date.now()
            }));
        } catch (error) {
            console.warn('Failed to save state:', error);
        }
    }

    // ================ UTILITY FUNCTIONS ================
    function debounce(func, wait) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    }

    function throttle(func, limit) {
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
    }

    function formatFileSize(bytes) {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    }

    function formatDate(dateString) {
        const date = new Date(dateString);
        const now = new Date();
        const diffMs = now - date;
        const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
        
        if (diffDays === 0) {
            return 'Today ' + date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        } else if (diffDays === 1) {
            return 'Yesterday ' + date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        } else if (diffDays < 7) {
            return date.toLocaleDateString([], { weekday: 'short' }) + ' ' + 
                   date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        } else {
            return date.toLocaleDateString([], { year: 'numeric', month: 'short', day: 'numeric' });
        }
    }

    function getFileIcon(mimeType, name = '') {
        if (mimeType === 'application/vnd.google-apps.folder') {
            return '📁';
        }
        
        if (CONFIG.fileTypes.images.includes(mimeType)) {
            return '🖼️';
        }
        
        if (CONFIG.fileTypes.videos.includes(mimeType)) {
            return '🎬';
        }
        
        if (CONFIG.fileTypes.audio.includes(mimeType)) {
            return '🎵';
        }
        
        if (CONFIG.fileTypes.documents.includes(mimeType)) {
            if (mimeType === 'application/pdf') return '📕';
            if (mimeType.includes('word')) return '📝';
            if (mimeType.includes('excel')) return '📊';
            if (mimeType.includes('powerpoint')) return '📽️';
            return '📄';
        }
        
        if (CONFIG.fileTypes.archives.includes(mimeType)) {
            return '🗜️';
        }
        
        if (CONFIG.fileTypes.code.includes(mimeType)) {
            return '💻';
        }
        
        // Check by file extension
        const ext = name.split('.').pop().toLowerCase();
        if (['txt', 'md', 'rtf'].includes(ext)) return '📄';
        if (['js', 'ts', 'py', 'java', 'cpp', 'c', 'php', 'html', 'css', 'json', 'xml'].includes(ext)) return '💻';
        
        return '📄';
    }

    function getFileType(mimeType) {
        if (mimeType === 'application/vnd.google-apps.folder') {
            return 'folder';
        }
        
        for (const [type, mimes] of Object.entries(CONFIG.fileTypes)) {
            if (mimes.includes(mimeType)) {
                return type;
            }
        }
        
        return 'unknown';
    }

    // ================ DRAG AND DROP ================
    function setupDragAndDrop() {
        // Prevent default drag behaviors
        ['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
            document.addEventListener(eventName, preventDefaults, false);
        });
        
        function preventDefaults(e) {
            e.preventDefault();
            e.stopPropagation();
        }
        
        // Highlight drop zone when file is dragged over
        ['dragenter', 'dragover'].forEach(eventName => {
            document.addEventListener(eventName, highlight, false);
        });
        
        ['dragleave', 'drop'].forEach(eventName => {
            document.addEventListener(eventName, unhighlight, false);
        });
        
        function highlight(e) {
            if (appState.unlocked) {
                document.body.classList.add('drag-over');
            }
        }
        
        function unhighlight(e) {
            document.body.classList.remove('drag-over');
        }
        
        // Handle dropped files
        document.addEventListener('drop', handleDrop, false);
        
        function handleDrop(e) {
            if (!appState.unlocked) return;
            
            const dt = e.dataTransfer;
            const files = dt.files;
            
            if (files.length > 0) {
                showUploadModal();
                // Files will be processed in upload modal
            }
        }
    }

    // ================ INITIAL DATA LOADING ================
    function loadInitialData() {
        // Show empty state initially
        showEmptyState();
        
        // Try to load from cache
        loadFromCache().then(hasCache => {
            if (hasCache) {
                showToast('info', 'Cache Loaded', 'Loaded files from local cache');
            }
        }).catch(err => {
            console.warn('Cache load failed:', err);
        });
    }

    function showEmptyState() {
        const emptyStateHTML = `
            <div class="empty-state">
                <div class="empty-icon">
                    <i class='bx bx-cloud-off'></i>
                </div>
                <h3>Drive Empty</h3>
                <p>Connect to Google Drive or upload files to get started</p>
                <div class="empty-actions">
                    <button class="connect-btn" id="connectEmptyBtn">
                        <i class='bx bx-plug'></i>
                        Connect Google Drive
                    </button>
                    <button class="upload-btn-empty" id="uploadEmptyBtn">
                        <i class='bx bx-cloud-upload'></i>
                        Upload Files
                    </button>
                </div>
            </div>
        `;
        
        if (elements.gridView) {
            elements.gridView.innerHTML = emptyStateHTML;
        }
        
        if (elements.tableBody) {
            elements.tableBody.innerHTML = '';
        }
        
        // Add event listeners to empty state buttons
        setTimeout(() => {
            const connectEmptyBtn = document.getElementById('connectEmptyBtn');
            const uploadEmptyBtn = document.getElementById('uploadEmptyBtn');
            
            if (connectEmptyBtn) {
                connectEmptyBtn.addEventListener('click', showGoogleConnectModal);
            }
            
            if (uploadEmptyBtn) {
                uploadEmptyBtn.addEventListener('click', showUploadModal);
            }
        }, 100);
    }

    async function loadFromCache() {
        if (!db) return false;
        
        try {
            const transaction = db.transaction(['files'], 'readonly');
            const store = transaction.objectStore('files');
            const request = store.getAll();
            
            return new Promise((resolve, reject) => {
                request.onsuccess = (event) => {
                    const files = event.target.result;
                    if (files && files.length > 0) {
                        // Sort by timestamp descending (newest first)
                        files.sort((a, b) => b.timestamp - a.timestamp);
                        
                        // Display files
                        displayFiles(files);
                        resolve(true);
                    } else {
                        resolve(false);
                    }
                };
                
                request.onerror = reject;
            });
        } catch (error) {
            console.warn('Cache load error:', error);
            return false;
        }
    }

    function displayFiles(files) {
        currentFiles = files;
        
        // Update counts
        updateFileCounts();
        
        // Clear current display
        if (elements.gridView) {
            elements.gridView.innerHTML = '';
        }
        
        if (elements.tableBody) {
            elements.tableBody.innerHTML = '';
        }
        
        // Sort files
        const sortedFiles = sortFiles([...files]);
        
        // Display based on view mode
        if (appState.viewMode === 'grid') {
            displayGridFiles(sortedFiles);
        } else {
            displayListFiles(sortedFiles);
        }
    }

    function displayGridFiles(files) {
        if (!elements.gridView) return;
        
        files.forEach(file => {
            const fileCard = createFileCard(file);
            elements.gridView.appendChild(fileCard);
        });
        
        // If no files, show empty state
        if (files.length === 0) {
            showEmptyState();
        }
    }

    function displayListFiles(files) {
        if (!elements.tableBody) return;
        
        files.forEach(file => {
            const tableRow = createTableRow(file);
            elements.tableBody.appendChild(tableRow);
        });
        
        // If no files, show empty state
        if (files.length === 0) {
            showEmptyState();
        }
    }

    function createFileCard(file) {
        const div = document.createElement('div');
        div.className = 'file-card';
        div.dataset.id = file.id;
        div.dataset.type = file.type;
        
        const icon = getFileIcon(file.mimeType, file.name);
        const size = file.size ? formatFileSize(file.size) : '--';
        const date = file.modifiedTime ? formatDate(file.modifiedTime) : '--';
        
        div.innerHTML = `
            <div class="file-checkbox"></div>
            <div class="file-icon ${getFileType(file.mimeType)}">
                ${icon}
            </div>
            <div class="file-info">
                <div class="file-name" title="${file.name}">${file.name}</div>
                <div class="file-meta">
                    <span class="file-size">${size}</span>
                    <span class="file-date">${date}</span>
                </div>
            </div>
            <div class="file-actions">
                <button class="file-action-btn" title="More options">
                    <i class='bx bx-dots-vertical-rounded'></i>
                </button>
            </div>
        `;
        
        // Add click handlers
        div.addEventListener('click', (e) => {
            if (!e.target.closest('.file-checkbox') && !e.target.closest('.file-action-btn')) {
                if (appState.selectionMode) {
                    toggleFileSelection(file.id);
                } else {
                    if (file.type === 'folder') {
                        navigateToFolder(file.id, file.name);
                    } else {
                        showFilePreview(file);
                    }
                }
            }
        });
        
        // Add context menu handler
        div.addEventListener('contextmenu', (e) => {
            e.preventDefault();
            showContextMenu(e, file);
        });
        
        // Add checkbox handler
        const checkbox = div.querySelector('.file-checkbox');
        checkbox.addEventListener('click', (e) => {
            e.stopPropagation();
            toggleFileSelection(file.id);
        });
        
        // Add action button handler
        const actionBtn = div.querySelector('.file-action-btn');
        actionBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            showContextMenu(e, file);
        });
        
        return div;
    }

    function createTableRow(file) {
        const tr = document.createElement('div');
        tr.className = 'table-row';
        tr.dataset.id = file.id;
        tr.dataset.type = file.type;
        
        const icon = getFileIcon(file.mimeType, file.name);
        const size = file.size ? formatFileSize(file.size) : '--';
        const date = file.modifiedTime ? formatDate(file.modifiedTime) : '--';
        const type = getFileType(file.mimeType);
        
        tr.innerHTML = `
            <div class="table-col name">
                <div class="row-checkbox"></div>
                <div class="row-icon ${type}">
                    ${icon}
                </div>
                <span class="row-name" title="${file.name}">${file.name}</span>
            </div>
            <div class="table-col type">
                <span class="row-type">${type}</span>
            </div>
            <div class="table-col size">
                <span class="row-size">${size}</span>
            </div>
            <div class="table-col modified">
                <span class="row-modified">${date}</span>
            </div>
            <div class="table-col actions">
                <div class="row-actions">
                    <button class="row-action-btn" title="More options">
                        <i class='bx bx-dots-vertical-rounded'></i>
                    </button>
                </div>
            </div>
        `;
        
        // Add click handlers
        tr.addEventListener('click', (e) => {
            if (!e.target.closest('.row-checkbox') && !e.target.closest('.row-action-btn')) {
                if (appState.selectionMode) {
                    toggleFileSelection(file.id);
                } else {
                    if (file.type === 'folder') {
                        navigateToFolder(file.id, file.name);
                    } else {
                        showFilePreview(file);
                    }
                }
            }
        });
        
        // Add context menu handler
        tr.addEventListener('contextmenu', (e) => {
            e.preventDefault();
            showContextMenu(e, file);
        });
        
        // Add checkbox handler
        const checkbox = tr.querySelector('.row-checkbox');
        checkbox.addEventListener('click', (e) => {
            e.stopPropagation();
            toggleFileSelection(file.id);
        });
        
        // Add action button handler
        const actionBtn = tr.querySelector('.row-action-btn');
        actionBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            showContextMenu(e, file);
        });
        
        return tr;
    }

    function sortFiles(files) {
        const [field, order] = appState.sortBy.split('_');
        
        return files.sort((a, b) => {
            let comparison = 0;
            
            switch (field) {
                case 'name':
                    comparison = a.name.localeCompare(b.name);
                    break;
                case 'date':
                    comparison = new Date(a.modifiedTime || a.createdTime) - 
                                 new Date(b.modifiedTime || b.createdTime);
                    break;
                case 'size':
                    comparison = (a.size || 0) - (b.size || 0);
                    break;
                case 'type':
                    comparison = getFileType(a.mimeType).localeCompare(getFileType(b.mimeType));
                    break;
            }
            
            return order === 'desc' ? -comparison : comparison;
        });
    }

    function updateFileCounts() {
        const folders = currentFiles.filter(f => f.type === 'folder').length;
        const files = currentFiles.length - folders;
        const totalSize = currentFiles.reduce((sum, file) => sum + (file.size || 0), 0);
        
        if (elements.folderCount) {
            elements.folderCount.textContent = folders;
        }
        
        if (elements.fileCount) {
            elements.fileCount.textContent = files;
        }
        
        if (elements.totalSize) {
            elements.totalSize.textContent = formatFileSize(totalSize);
        }
    }

    // ================ FILE SELECTION ================
    function toggleSelectAll() {
        if (appState.selectedFiles.length === currentFiles.length) {
            // Deselect all
            appState.selectedFiles = [];
        } else {
            // Select all
            appState.selectedFiles = currentFiles.map(f => f.id);
        }
        
        updateSelectionUI();
        updateButtonStates();
        playSound('click');
    }

    function toggleFileSelection(fileId) {
        const index = appState.selectedFiles.indexOf(fileId);
        
        if (index === -1) {
            appState.selectedFiles.push(fileId);
        } else {
            appState.selectedFiles.splice(index, 1);
        }
        
        // Enable selection mode if any file is selected
        appState.selectionMode = appState.selectedFiles.length > 0;
        
        updateSelectionUI();
        updateButtonStates();
        playSound('click');
    }

    function updateSelectionUI() {
        // Update file cards
        document.querySelectorAll('.file-card, .table-row').forEach(element => {
            const fileId = element.dataset.id;
            const checkbox = element.querySelector('.file-checkbox, .row-checkbox');
            
            if (appState.selectedFiles.includes(fileId)) {
                element.classList.add('selected');
                if (checkbox) {
                    checkbox.classList.add('checked');
                }
            } else {
                element.classList.remove('selected');
                if (checkbox) {
                    checkbox.classList.remove('checked');
                }
            }
            
            // Show/hide checkboxes based on selection mode
            if (checkbox) {
                if (appState.selectionMode || appState.selectedFiles.length > 0) {
                    checkbox.style.display = 'flex';
                } else {
                    checkbox.style.display = 'none';
                }
            }
        });
    }

    function cancelSelection() {
        appState.selectedFiles = [];
        appState.selectionMode = false;
        updateSelectionUI();
        updateButtonStates();
        playSound('click');
    }

    // ================ CONTEXT MENU ================
    function showContextMenu(event, file) {
        if (!elements.contextMenu) return;
        
        event.preventDefault();
        
        // Position the context menu
        const x = event.clientX;
        const y = event.clientY;
        
        elements.contextMenu.style.left = x + 'px';
        elements.contextMenu.style.top = y + 'px';
        elements.contextMenu.classList.add('active');
        
        // Store current file for context menu actions
        elements.contextMenu.dataset.fileId = file.id;
        elements.contextMenu.dataset.fileName = file.name;
        elements.contextMenu.dataset.fileType = file.type;
        
        // Update context menu items based on file type
        updateContextMenuItems(file);
        
        playSound('click');
    }

    function updateContextMenuItems(file) {
        if (!elements.contextMenu) return;
        
        const items = elements.contextMenu.querySelectorAll('.context-item');
        
        items.forEach(item => {
            const action = item.dataset.action;
            
            // Enable/disable items based on file type
            switch (action) {
                case 'preview':
                    item.disabled = file.type === 'folder';
                    break;
                case 'star':
                    // TODO: Check if file is already starred
                    break;
                case 'delete':
                    item.classList.toggle('danger', true);
                    break;
            }
        });
    }

    function hideContextMenu() {
        if (elements.contextMenu) {
            elements.contextMenu.classList.remove('active');
        }
    }

    // ================ NAVIGATION ================
    function handleMenuClick(event) {
        event.preventDefault();
        const view = event.currentTarget.dataset.view;
        
        if (view && view !== appState.currentView) {
            appState.currentView = view;
            
            // Update active menu item
            document.querySelectorAll('.menu-item').forEach(item => {
                if (item.dataset.view === view) {
                    item.classList.add('active');
                } else {
                    item.classList.remove('active');
                }
            });
            
            // Load view data
            loadViewData(view);
            playSound('click');
        }
    }

    function handleDriveTabClick(event) {
        const drive = event.currentTarget.dataset.drive;
        
        if (drive && drive !== appState.currentDrive) {
            appState.currentDrive = drive;
            
            // Update active tab
            document.querySelectorAll('.drive-tab').forEach(tab => {
                if (tab.dataset.drive === drive) {
                    tab.classList.add('active');
                } else {
                    tab.classList.remove('active');
                }
            });
            
            // Load drive data
            loadDriveData(drive);
            playSound('click');
        }
    }

    function navigateToFolder(folderId, folderName) {
        appState.currentFolder = folderId;
        appState.breadcrumb.push(folderName);
        
        updateBreadcrumb();
        
        // TODO: Load folder contents
        showToast('info', 'Navigation', `Opening folder: ${folderName}`);
    }

    function updateBreadcrumb() {
        if (!elements.breadcrumbPath) return;
        
        elements.breadcrumbPath.innerHTML = '';
        
        appState.breadcrumb.forEach((item, index) => {
            const isLast = index === appState.breadcrumb.length - 1;
            
            const button = document.createElement('button');
            button.className = `breadcrumb-item ${index === 0 ? 'home' : ''} ${isLast ? 'active' : ''}`;
            
            if (index === 0) {
                button.innerHTML = '<i class="bx bx-home"></i>';
                button.addEventListener('click', () => {
                    navigateToRoot();
                });
            } else {
                button.textContent = item;
                button.addEventListener('click', () => {
                    // TODO: Navigate to this breadcrumb level
                    const newBreadcrumb = appState.breadcrumb.slice(0, index + 1);
                    appState.breadcrumb = newBreadcrumb;
                    updateBreadcrumb();
                });
            }
            
            elements.breadcrumbPath.appendChild(button);
            
            if (!isLast) {
                const separator = document.createElement('span');
                separator.className = 'breadcrumb-separator';
                separator.textContent = '/';
                elements.breadcrumbPath.appendChild(separator);
            }
        });
    }

    function navigateToRoot() {
        appState.currentFolder = 'root';
        appState.breadcrumb = ['My Drive'];
        updateBreadcrumb();
        
        // TODO: Load root folder contents
        showToast('info', 'Navigation', 'Returned to root folder');
    }

    function handleBreadcrumbClick(event) {
        if (event.target.classList.contains('breadcrumb-item')) {
            playSound('click');
        }
    }

    // ================ SEARCH ================
    function handleSearch(event) {
        const query = event.target.value.trim();
        appState.searchQuery = query;
        
        if (query) {
            // Show clear button
            if (elements.searchClear) {
                elements.searchClear.classList.add('visible');
            }
            
            // TODO: Implement search
            showToast('info', 'Search', `Searching for: ${query}`);
        } else {
            clearSearch();
        }
    }

    function clearSearch() {
        if (elements.searchInput) {
            elements.searchInput.value = '';
        }
        
        if (elements.searchClear) {
            elements.searchClear.classList.remove('visible');
        }
        
        appState.searchQuery = '';
        
        // TODO: Clear search results
        showToast('info', 'Search Cleared', 'Showing all files');
    }

    // ================ SORTING ================
    function handleSortChange(event) {
        appState.sortBy = event.target.value;
        
        // Re-sort and display files
        if (currentFiles.length > 0) {
            const sortedFiles = sortFiles([...currentFiles]);
            
            if (appState.viewMode === 'grid') {
                displayGridFiles(sortedFiles);
            } else {
                displayListFiles(sortedFiles);
            }
        }
        
        playSound('click');
    }

    // ================ MODAL MANAGEMENT ================
    function showModal(modalId) {
        const modal = document.getElementById(modalId);
        if (modal) {
            closeAllModals();
            modal.classList.add('active');
            elements.modalOverlay.classList.add('active');
            document.body.style.overflow = 'hidden';
            playSound('click');
        }
    }

    function closeAllModals() {
        document.querySelectorAll('.modal').forEach(modal => {
            modal.classList.remove('active');
        });
        
        if (elements.modalOverlay) {
            elements.modalOverlay.classList.remove('active');
        }
        
        document.body.style.overflow = '';
        playSound('click');
    }

    function showGoogleConnectModal() {
        showModal('googleConnectModal');
    }

    function showSettingsModal() {
        showModal('settingsModal');
        // TODO: Populate settings
    }

    function showStorageInfoModal() {
        showModal('storageInfoModal');
        // TODO: Load storage info
    }

    function showUploadModal() {
        showModal('uploadModal');
    }

    function showShareModal() {
        if (appState.selectedFiles.length === 0) return;
        showModal('shareModal');
        // TODO: Populate share modal
    }

    function showCopyModal() {
        if (appState.selectedFiles.length === 0) return;
        showModal('moveCopyModal');
        // TODO: Set up for copy
    }

    function showMoveModal() {
        if (appState.selectedFiles.length === 0) return;
        showModal('moveCopyModal');
        // TODO: Set up for move
    }

    function showFilePreview(file) {
        showModal('previewModal');
        // TODO: Load file preview
    }

    // ================ FILE OPERATIONS (STUBS) ================
    function downloadSelected() {
        if (appState.selectedFiles.length === 0) return;
        
        showToast('info', 'Download', `Preparing ${appState.selectedFiles.length} file(s) for download`);
        // TODO: Implement download
    }

    function deleteSelected() {
        if (appState.selectedFiles.length === 0) return;
        
        if (appState.settings.confirmDelete) {
            const confirm = window.confirm(`Are you sure you want to delete ${appState.selectedFiles.length} selected item(s)?`);
            if (!confirm) return;
        }
        
        showToast('info', 'Delete', `Deleting ${appState.selectedFiles.length} file(s)`);
        // TODO: Implement delete
        cancelSelection();
    }

    function handleFileSelect(event) {
        const files = Array.from(event.target.files);
        if (files.length > 0) {
            showToast('info', 'Files Selected', `${files.length} file(s) ready for upload`);
            // TODO: Process files for upload
        }
    }

    function handleFolderSelect(event) {
        const files = Array.from(event.target.files);
        if (files.length > 0) {
            showToast('info', 'Folder Selected', `Folder with ${files.length} file(s) ready for upload`);
            // TODO: Process folder for upload
        }
    }

    function toggleUploadQueue() {
        if (elements.uploadQueue) {
            elements.uploadQueue.classList.toggle('active');
            const icon = elements.queueToggle.querySelector('i');
            if (icon) {
                icon.classList.toggle('bx-chevron-up');
                icon.classList.toggle('bx-chevron-down');
            }
            playSound('click');
        }
    }

    // ================ LOAD VIEW DATA ================
    function loadViewData(view) {
        switch (view) {
            case 'drive':
                // TODO: Load drive files
                break;
            case 'recent':
                // TODO: Load recent files
                break;
            case 'starred':
                // TODO: Load starred files
                break;
            case 'trash':
                // TODO: Load trash files
                break;
            case 'images':
            case 'videos':
            case 'documents':
            case 'audio':
            case 'archives':
            case 'code':
                // TODO: Load filtered files by type
                break;
        }
    }

    function loadDriveData(drive) {
        switch (drive) {
            case 'user':
                // TODO: Load user drive
                break;
            case 'vault':
                // TODO: Load vault drive
                break;
        }
    }

    // ================ GOOGLE INTEGRATION (STUBS) ================
    async function loadGoogleUserInfo() {
        // TODO: Implement Google user info loading
        return Promise.resolve();
    }

    async function refreshGoogleToken() {
        // TODO: Implement token refresh
        return Promise.resolve();
    }

    // ================ PUBLIC API ================
    return {
        // Initialization
        init: init,
        
        // State getters
        getState: () => ({ ...appState }),
        getUser: () => googleUser ? { ...googleUser } : null,
        getToken: () => googleToken ? { ...googleToken } : null,
        
        // PIN management
        setPin: (pin) => {
            const pinHash = hashPin(pin);
            localStorage.setItem('vault_pin_hash', pinHash);
            appState.pinHash = pinHash;
            return true;
        },
        
        // Session management
        startSession: startSession,
        clearSession: clearSession,
        lockVault: lockVault,
        
        // UI controls
        showToast: showToast,
        playSound: playSound,
        
        // Settings
        saveSettings: saveSettings,
        getSettings: () => ({ ...appState.settings }),
        
        // File operations
        uploadFiles: () => console.log('Upload files - to be implemented'),
        downloadFile: () => console.log('Download file - to be implemented'),
        deleteFile: () => console.log('Delete file - to be implemented'),
        
        // Google Drive integration
        connectGoogle: () => console.log('Connect Google - to be implemented'),
        disconnectGoogle: () => console.log('Disconnect Google - to be implemented'),
        
        // Debug
        debug: () => {
            console.log('=== VAULT OS DEBUG INFO ===');
            console.log('App State:', appState);
            console.log('Google User:', googleUser);
            console.log('Google Token:', googleToken);
            console.log('IndexedDB:', db ? 'Connected' : 'Not connected');
            console.log('Session Timer:', sessionTimer ? 'Running' : 'Stopped');
            console.log('Token Refresh Timer:', tokenRefreshTimer ? 'Running' : 'Stopped');
            console.log('Current Files:', currentFiles.length);
            console.log('Selected Files:', appState.selectedFiles.length);
            console.log('File Cache Size:', fileCache.size);
            console.log('===========================');
        }
    };
})();

// ================ INITIALIZE APP ================
document.addEventListener('DOMContentLoaded', () => {
    // Ensure CONFIG is available
    if (typeof CONFIG === 'undefined') {
        console.error('❌ CONFIG not found. Make sure config.js is loaded.');
        const loadingScreen = document.getElementById('loadingScreen');
        if (loadingScreen) {
            loadingScreen.innerHTML = `
                <div class="loading-content">
                    <div class="loading-logo">
                        <div class="vault-icon">❌</div>
                        <h1>CONFIG ERROR</h1>
                        <p>Configuration file not found</p>
                    </div>
                </div>
            `;
        }
        return;
    }
    
    // Start the app
    try {
        VaultOS.init();
    } catch (error) {
        console.error('Failed to initialize Vault OS:', error);
        const loadingScreen = document.getElementById('loadingScreen');
        if (loadingScreen) {
            loadingScreen.innerHTML = `
                <div class="loading-content">
                    <div class="loading-logo">
                        <div class="vault-icon">❌</div>
                        <h1>INIT ERROR</h1>
                        <p>${error.message}</p>
                        <button onclick="location.reload()" style="margin-top: 20px; padding: 10px 20px; background: #ff3366; border: none; color: white; border-radius: 5px; cursor: pointer;">
                            Reload Page
                        </button>
                    </div>
                </div>
            `;
        }
    }
    
    // Make VaultOS available globally for debugging
    if (CONFIG.debug.enabled) {
        window.VaultOS = VaultOS;
        console.log('🔧 Debug mode enabled - VaultOS is available globally');
    }
});

// ================ ERROR BOUNDARY ================
window.addEventListener('error', (event) => {
    console.error('Global error caught:', event.error);
    
    // Show error to user if app is initialized
    if (typeof VaultOS !== 'undefined' && VaultOS.showToast) {
        VaultOS.showToast('error', 'Application Error', 
            'An unexpected error occurred. Please refresh the page.');
    }
});

// ============================================
// VAULT OS v5.0 - GOOGLE DRIVE INTEGRATION
// Part 3/5: OAuth2 Authentication & API Integration
// ============================================

// Continue from previous VaultOS object
(function() {
    'use strict';

    // ================ GOOGLE API STATE ================
    let gapiLoaded = false;
    let gapiClientInitialized = false;
    let googleAuthInstance = null;
    let driveAPI = null;
    
    // Token management
    let tokenRefreshInProgress = false;
    let lastTokenRefresh = 0;
    
    // API request queue for rate limiting
    let apiRequestQueue = [];
    let apiRequestInProgress = false;
    const MAX_RETRIES = 3;
    const RETRY_DELAY = 1000;

    // ================ GOOGLE API LOADER ================
    function loadGoogleAPI() {
        return new Promise((resolve, reject) => {
            if (gapiLoaded && gapiClientInitialized) {
                resolve();
                return;
            }
            
            // Check if gapi is already loading
            if (window.gapi && window.gapi.load) {
                initializeGAPI().then(resolve).catch(reject);
                return;
            }
            
            // Load Google API script
            const script = document.createElement('script');
            script.src = 'https://apis.google.com/js/api.js';
            script.async = true;
            script.defer = true;
            
            script.onload = () => {
                console.log('✅ Google API script loaded');
                gapiLoaded = true;
                initializeGAPI().then(resolve).catch(reject);
            };
            
            script.onerror = () => {
                const error = new Error('Failed to load Google API');
                console.error('❌ Google API load failed');
                reject(error);
            };
            
            document.head.appendChild(script);
        });
    }

    function initializeGAPI() {
        return new Promise((resolve, reject) => {
            if (!gapiLoaded) {
                reject(new Error('Google API not loaded'));
                return;
            }
            
            gapi.load('client:auth2', {
                callback: () => {
                    console.log('🔧 Initializing Google API client...');
                    
                    // Initialize the client with API key and OAuth 2.0 client ID
                    gapi.client.init({
                        apiKey: CONFIG.firebase.apiKey,
                        clientId: CONFIG.googleOAuth.clientId,
                        discoveryDocs: [
                            'https://www.googleapis.com/discovery/v1/apis/drive/v3/rest',
                            'https://people.googleapis.com/$discovery/rest?version=v1'
                        ],
                        scope: CONFIG.googleOAuth.scope
                    }).then(() => {
                        console.log('✅ Google API client initialized');
                        gapiClientInitialized = true;
                        
                        // Get auth instance
                        googleAuthInstance = gapi.auth2.getAuthInstance();
                        
                        // Listen for auth changes
                        googleAuthInstance.isSignedIn.listen(handleAuthChange);
                        
                        // Check if already signed in
                        if (googleAuthInstance.isSignedIn.get()) {
                            console.log('🔄 Already signed in to Google');
                            handleAuthChange(true);
                        }
                        
                        resolve();
                    }).catch(error => {
                        console.error('❌ Google API client initialization failed:', error);
                        reject(error);
                    });
                },
                onerror: () => {
                    reject(new Error('Failed to load Google client library'));
                },
                timeout: 30000 // 30 second timeout
            });
        });
    }

    // ================ AUTHENTICATION HANDLERS ================
    function handleAuthChange(isSignedIn) {
        console.log('🔄 Auth state changed:', isSignedIn);
        
        if (isSignedIn) {
            const googleUser = googleAuthInstance.currentUser.get();
            const authResponse = googleUser.getAuthResponse(true);
            
            // Update token
            updateGoogleToken(authResponse);
            
            // Get user info
            loadGoogleUserProfile(googleUser);
            
            // Update UI
            updateConnectionStatus(true);
            
            // Load drive data
            loadDriveContents();
            
            showToast('success', 'Google Connected', 'Successfully connected to Google Drive');
        } else {
            // User signed out
            clearGoogleAuth();
            updateConnectionStatus(false);
            
            // Show empty state
            showEmptyState();
            
            showToast('info', 'Signed Out', 'Disconnected from Google Drive');
        }
    }

    function updateGoogleToken(authResponse) {
        const now = Date.now();
        const expiryTime = now + (authResponse.expires_in * 1000);
        
        googleToken = {
            access_token: authResponse.access_token,
            token_type: authResponse.token_type,
            expires_in: authResponse.expires_in,
            expiry: expiryTime,
            scope: authResponse.scope,
            issued_at: now
        };
        
        // Save to localStorage
        try {
            localStorage.setItem('google_token', JSON.stringify(googleToken));
            console.log('✅ Google token saved');
        } catch (error) {
            console.error('Failed to save Google token:', error);
        }
        
        // Start token refresh timer
        startTokenRefreshTimer();
    }

    async function loadGoogleUserProfile(googleUser) {
        try {
            const profile = googleUser.getBasicProfile();
            const authResponse = googleUser.getAuthResponse(true);
            
            googleUser = {
                id: profile.getId(),
                name: profile.getName(),
                email: profile.getEmail(),
                imageUrl: profile.getImageUrl(),
                token: authResponse.access_token,
                scopes: authResponse.scope
            };
            
            // Save user info
            try {
                localStorage.setItem('google_user', JSON.stringify(googleUser));
            } catch (error) {
                console.warn('Failed to save user info:', error);
            }
            
            // Update UI
            updateUserInfo(googleUser);
            
            // Get additional user info from People API
            try {
                await loadAdditionalUserInfo();
            } catch (error) {
                console.warn('Failed to load additional user info:', error);
            }
            
            console.log('✅ Google user profile loaded');
            return googleUser;
        } catch (error) {
            console.error('Failed to load Google user profile:', error);
            throw error;
        }
    }

    async function loadAdditionalUserInfo() {
        if (!gapi.client.people) {
            console.warn('People API not available');
            return;
        }
        
        try {
            const response = await gapi.client.people.people.get({
                resourceName: 'people/me',
                personFields: 'photos,metadata'
            });
            
            if (response.result && response.result.photos && response.result.photos.length > 0) {
                // Update with better quality photo if available
                const highResPhoto = response.result.photos.find(p => p.metadata && p.metadata.primary);
                if (highResPhoto && highResPhoto.url) {
                    googleUser.imageUrl = highResPhoto.url;
                    updateUserInfo(googleUser);
                }
            }
        } catch (error) {
            // People API errors are non-critical
            console.debug('People API error (non-critical):', error.message);
        }
    }

    function clearGoogleAuth() {
        googleToken = null;
        googleUser = null;
        
        // Clear from localStorage
        try {
            localStorage.removeItem('google_token');
            localStorage.removeItem('google_user');
        } catch (error) {
            console.error('Failed to clear auth data:', error);
        }
        
        // Stop token refresh timer
        if (tokenRefreshTimer) {
            clearInterval(tokenRefreshTimer);
            tokenRefreshTimer = null;
        }
    }

    // ================ TOKEN MANAGEMENT ================
    async function refreshGoogleToken() {
        if (tokenRefreshInProgress) {
            console.log('Token refresh already in progress');
            return;
        }
        
        if (!googleAuthInstance) {
            console.error('Cannot refresh token: Google auth not initialized');
            return;
        }
        
        const now = Date.now();
        if (now - lastTokenRefresh < 60000) { // 1 minute cooldown
            console.log('Token refresh on cooldown');
            return;
        }
        
        tokenRefreshInProgress = true;
        lastTokenRefresh = now;
        
        try {
            console.log('🔄 Refreshing Google token...');
            
            const googleUser = googleAuthInstance.currentUser.get();
            const authResponse = await googleUser.reloadAuthResponse();
            
            updateGoogleToken(authResponse);
            
            console.log('✅ Google token refreshed successfully');
            showToast('success', 'Token Refreshed', 'Authentication token has been refreshed');
            
        } catch (error) {
            console.error('❌ Failed to refresh Google token:', error);
            
            // If refresh fails, try to sign in again
            if (error.error === 'invalid_grant' || error.status === 401) {
                showToast('warning', 'Session Expired', 'Please sign in again');
                signOutGoogle();
            } else {
                showToast('error', 'Token Refresh Failed', 'Please check your connection');
            }
            
        } finally {
            tokenRefreshInProgress = false;
        }
    }

    // ================ AUTHENTICATION METHODS ================
    async function signInGoogle() {
        if (!googleAuthInstance) {
            await loadGoogleAPI();
        }
        
        try {
            showLoadingState('Connecting to Google...');
            
            // Check if already signed in
            if (googleAuthInstance.isSignedIn.get()) {
                console.log('Already signed in');
                return googleAuthInstance.currentUser.get();
            }
            
            // Sign in with Google
            const googleUser = await googleAuthInstance.signIn({
                prompt: 'select_account',
                ux_mode: 'popup'
            });
            
            console.log('✅ Signed in to Google successfully');
            return googleUser;
            
        } catch (error) {
            console.error('❌ Google sign in failed:', error);
            
            // Handle specific errors
            if (error.error === 'popup_closed_by_user') {
                showToast('info', 'Sign In Cancelled', 'You cancelled the sign in process');
            } else if (error.error === 'access_denied') {
                showToast('error', 'Access Denied', 'Please grant the required permissions');
            } else {
                showToast('error', 'Sign In Failed', error.error || 'Unable to sign in to Google');
            }
            
            hideLoadingState();
            throw error;
        }
    }

    async function signOutGoogle() {
        if (!googleAuthInstance) {
            console.warn('Google auth not initialized');
            return;
        }
        
        try {
            await googleAuthInstance.signOut();
            console.log('✅ Signed out from Google');
            clearGoogleAuth();
            updateConnectionStatus(false);
            showToast('info', 'Signed Out', 'Disconnected from Google Drive');
        } catch (error) {
            console.error('❌ Google sign out failed:', error);
            showToast('error', 'Sign Out Failed', 'Unable to sign out from Google');
            throw error;
        }
    }

    function revokeGoogleAccess() {
        if (!googleAuthInstance) {
            console.warn('Google auth not initialized');
            return Promise.resolve();
        }
        
        return new Promise((resolve, reject) => {
            const xhr = new XMLHttpRequest();
            xhr.open('GET', `${CONFIG.googleOAuth.revokeEndpoint}?token=${googleToken.access_token}`);
            xhr.onload = () => {
                if (xhr.status === 200) {
                    console.log('✅ Google access revoked');
                    clearGoogleAuth();
                    resolve();
                } else {
                    console.error('❌ Failed to revoke Google access:', xhr.status);
                    reject(new Error('Failed to revoke access'));
                }
            };
            xhr.onerror = () => {
                console.error('❌ Network error while revoking access');
                reject(new Error('Network error'));
            };
            xhr.send();
        });
    }

    // ================ API REQUEST MANAGEMENT ================
    function makeAPIRequest(requestFn, retryCount = 0) {
        return new Promise((resolve, reject) => {
            // Add to queue
            apiRequestQueue.push({
                requestFn,
                resolve,
                reject,
                retryCount
            });
            
            // Process queue if not already processing
            if (!apiRequestInProgress) {
                processAPIQueue();
            }
        });
    }

    async function processAPIQueue() {
        if (apiRequestQueue.length === 0 || apiRequestInProgress) {
            return;
        }
        
        apiRequestInProgress = true;
        const request = apiRequestQueue.shift();
        
        try {
            // Check if we have a valid token
            if (!googleToken || Date.now() >= googleToken.expiry - 60000) { // 1 minute buffer
                await refreshGoogleToken();
            }
            
            // Execute the request
            const result = await request.requestFn();
            request.resolve(result);
            
        } catch (error) {
            console.error('API request failed:', error);
            
            // Check if we should retry
            if (request.retryCount < MAX_RETRIES && isRetryableError(error)) {
                console.log(`Retrying request (${request.retryCount + 1}/${MAX_RETRIES})...`);
                
                // Exponential backoff
                const delay = RETRY_DELAY * Math.pow(2, request.retryCount);
                
                setTimeout(() => {
                    apiRequestQueue.unshift({
                        ...request,
                        retryCount: request.retryCount + 1
                    });
                }, delay);
                
            } else {
                // Max retries reached or non-retryable error
                request.reject(error);
                
                // Show user-friendly error
                showAPIError(error);
            }
            
        } finally {
            apiRequestInProgress = false;
            
            // Process next request
            setTimeout(processAPIQueue, 100); // Small delay between requests
        }
    }

    function isRetryableError(error) {
        // Network errors, rate limits, and server errors are retryable
        if (!error.status) return true; // Network error
        if (error.status === 429) return true; // Rate limit
        if (error.status >= 500) return true; // Server error
        if (error.status === 401) {
            // 401 might be retryable if token refresh helps
            return true;
        }
        return false;
    }

    function showAPIError(error) {
        let title = 'API Error';
        let message = CONFIG.errors.unknown;
        
        if (error.status === 401) {
            title = 'Authentication Error';
            message = CONFIG.errors.authExpired;
        } else if (error.status === 403) {
            title = 'Permission Denied';
            message = 'You do not have permission to perform this action';
        } else if (error.status === 404) {
            title = 'Not Found';
            message = CONFIG.errors.fileNotFound;
        } else if (error.status === 429) {
            title = 'Too Many Requests';
            message = CONFIG.errors.rateLimit;
        } else if (error.status >= 500) {
            title = 'Server Error';
            message = 'Google Drive service is temporarily unavailable';
        } else if (!navigator.onLine) {
            title = 'Network Error';
            message = CONFIG.errors.offline;
        }
        
        showToast('error', title, message);
    }

    // ================ GOOGLE DRIVE API METHODS ================
    
    // Get drive storage quota
    async function getDriveQuota() {
        return makeAPIRequest(async () => {
            const response = await gapi.client.drive.about.get({
                fields: 'storageQuota'
            });
            
            return response.result.storageQuota;
        });
    }
    
    // List files in a folder
    async function listFiles(folderId = 'root', pageToken = null) {
        return makeAPIRequest(async () => {
            const query = [];
            
            // Base query
            query.push(`'${folderId}' in parents`);
            query.push('trashed = false');
            
            // If in a specific view
            if (appState.currentView !== 'drive') {
                switch (appState.currentView) {
                    case 'recent':
                        // Modified in last 30 days
                        const thirtyDaysAgo = new Date();
                        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
                        query.push(`modifiedTime > '${thirtyDaysAgo.toISOString()}'`);
                        break;
                    case 'starred':
                        query.push('starred = true');
                        break;
                    case 'trash':
                        query.push('trashed = true');
                        break;
                    case 'images':
                        query.push(`mimeType contains 'image/'`);
                        break;
                    case 'videos':
                        query.push(`mimeType contains 'video/'`);
                        break;
                    case 'documents':
                        query.push(`(mimeType contains 'application/' or mimeType contains 'text/')`);
                        query.push(`mimeType != 'application/vnd.google-apps.folder'`);
                        break;
                    case 'audio':
                        query.push(`mimeType contains 'audio/'`);
                        break;
                    case 'archives':
                        const archiveMimes = CONFIG.fileTypes.archives.join("','");
                        query.push(`mimeType in ('${archiveMimes}')`);
                        break;
                    case 'code':
                        const codeMimes = CONFIG.fileTypes.code.join("','");
                        query.push(`mimeType in ('${codeMimes}')`);
                        break;
                }
            }
            
            // Search query
            if (appState.searchQuery) {
                query.push(`name contains '${appState.searchQuery}'`);
            }
            
            const request = {
                q: query.join(' and '),
                pageSize: CONFIG.drive.pageSize,
                fields: `nextPageToken, ${CONFIG.drive.defaultFields}`,
                orderBy: CONFIG.drive.orderBy,
                supportsAllDrives: true,
                includeItemsFromAllDrives: true
            };
            
            if (pageToken) {
                request.pageToken = pageToken;
            }
            
            console.log('📁 Listing files with query:', request.q);
            const response = await gapi.client.drive.files.list(request);
            
            return {
                files: response.result.files || [],
                nextPageToken: response.result.nextPageToken
            };
        });
    }
    
    // Get file metadata
    async function getFileMetadata(fileId) {
        return makeAPIRequest(async () => {
            const response = await gapi.client.drive.files.get({
                fileId: fileId,
                fields: CONFIG.drive.defaultFields,
                supportsAllDrives: true
            });
            
            return response.result;
        });
    }
    
    // Create folder
    async function createFolder(folderName, parentId = 'root') {
        return makeAPIRequest(async () => {
            const fileMetadata = {
                name: folderName,
                mimeType: 'application/vnd.google-apps.folder',
                parents: [parentId]
            };
            
            const response = await gapi.client.drive.files.create({
                resource: fileMetadata,
                fields: CONFIG.drive.defaultFields
            });
            
            return response.result;
        });
    }
    
    // Delete file/folder
    async function deleteFile(fileId) {
        return makeAPIRequest(async () => {
            await gapi.client.drive.files.delete({
                fileId: fileId,
                supportsAllDrives: true
            });
            
            return { success: true, fileId };
        });
    }
    
    // Move file/folder
    async function moveFile(fileId, newParentId, removeParentId = null) {
        return makeAPIRequest(async () => {
            // First, get current parents
            const file = await gapi.client.drive.files.get({
                fileId: fileId,
                fields: 'parents',
                supportsAllDrives: true
            });
            
            const previousParents = file.result.parents.join(',');
            
            // Move file
            const response = await gapi.client.drive.files.update({
                fileId: fileId,
                addParents: newParentId,
                removeParents: removeParentId || previousParents,
                fields: CONFIG.drive.defaultFields,
                supportsAllDrives: true
            });
            
            return response.result;
        });
    }
    
    // Copy file
    async function copyFile(fileId, newName = null, newParentId = null) {
        return makeAPIRequest(async () => {
            const fileMetadata = {};
            
            if (newName) {
                fileMetadata.name = newName;
            }
            
            if (newParentId) {
                fileMetadata.parents = [newParentId];
            }
            
            const response = await gapi.client.drive.files.copy({
                fileId: fileId,
                resource: fileMetadata,
                fields: CONFIG.drive.defaultFields,
                supportsAllDrives: true
            });
            
            return response.result;
        });
    }
    
    // Rename file/folder
    async function renameFile(fileId, newName) {
        return makeAPIRequest(async () => {
            const response = await gapi.client.drive.files.update({
                fileId: fileId,
                resource: { name: newName },
                fields: CONFIG.drive.defaultFields,
                supportsAllDrives: true
            });
            
            return response.result;
        });
    }
    
    // Star/unstar file
    async function toggleStar(fileId, starred = true) {
        return makeAPIRequest(async () => {
            const response = await gapi.client.drive.files.update({
                fileId: fileId,
                resource: { starred: starred },
                fields: CONFIG.drive.defaultFields,
                supportsAllDrives: true
            });
            
            return response.result;
        });
    }
    
    // Share file
    async function shareFile(fileId, role = 'reader', type = 'anyone') {
        return makeAPIRequest(async () => {
            const permission = {
                type: type,
                role: role
            };
            
            const response = await gapi.client.drive.permissions.create({
                fileId: fileId,
                resource: permission,
                fields: 'id',
                supportsAllDrives: true
            });
            
            return response.result;
        });
    }
    
    // Get file permissions
    async function getFilePermissions(fileId) {
        return makeAPIRequest(async () => {
            const response = await gapi.client.drive.permissions.list({
                fileId: fileId,
                fields: 'permissions(id,type,role,emailAddress,displayName)',
                supportsAllDrives: true
            });
            
            return response.result.permissions || [];
        });
    }
    
    // Generate download URL
    function getDownloadUrl(fileId, mimeType = null) {
        if (mimeType && mimeType.includes('google-apps')) {
            // Google Docs files need to be exported
            const exportType = getExportType(mimeType);
            return `${CONFIG.drive.apiBase}/files/${fileId}/export?mimeType=${exportType}`;
        } else {
            return `${CONFIG.drive.apiBase}/files/${fileId}?alt=media`;
        }
    }
    
    function getExportType(mimeType) {
        const exportMap = {
            'application/vnd.google-apps.document': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
            'application/vnd.google-apps.spreadsheet': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
            'application/vnd.google-apps.presentation': 'application/vnd.openxmlformats-officedocument.presentationml.presentation',
            'application/vnd.google-apps.drawing': 'image/png',
            'application/vnd.google-apps.script': 'application/vnd.google-apps.script+json'
        };
        
        return exportMap[mimeType] || 'application/pdf';
    }
    
    // Get file thumbnail
    function getThumbnailUrl(fileId, size = CONFIG.settings.thumbnailSize) {
        if (CONFIG.mediaProxies.readOnly) {
            return `${CONFIG.mediaProxies.readOnly}?id=${fileId}&size=${size}`;
        }
        
        // Fallback to Google's thumbnail
        return `https://drive.google.com/thumbnail?id=${fileId}&sz=${size}`;
    }

    // ================ UPLOAD MANAGEMENT ================
    
    // Upload file with resumable upload support
    async function uploadFile(file, folderId = 'root', onProgress = null) {
        return new Promise((resolve, reject) => {
            const uploadId = `upload_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
            
            // Create upload queue item
            const uploadItem = {
                id: uploadId,
                file: file,
                name: file.name,
                size: file.size,
                type: file.type,
                status: 'pending',
                progress: 0,
                uploadedBytes: 0,
                startTime: Date.now(),
                folderId: folderId
            };
            
            addToUploadQueue(uploadItem);
            
            // Start upload
            startFileUpload(uploadItem, onProgress)
                .then(result => {
                    uploadItem.status = 'completed';
                    uploadItem.progress = 100;
                    updateUploadQueueItem(uploadItem);
                    
                    // Cache the uploaded file
                    cacheFile(result);
                    
                    resolve(result);
                })
                .catch(error => {
                    uploadItem.status = 'error';
                    uploadItem.error = error.message;
                    updateUploadQueueItem(uploadItem);
                    
                    reject(error);
                });
        });
    }
    
    async function startFileUpload(uploadItem, onProgress) {
        const metadata = {
            name: uploadItem.file.name,
            mimeType: uploadItem.file.type,
            parents: [uploadItem.folderId]
        };
        
        // Use resumable upload for large files
        if (uploadItem.file.size > CONFIG.drive.chunkSize && appState.settings.chunkUpload) {
            return uploadResumable(uploadItem, metadata, onProgress);
        } else {
            return uploadSimple(uploadItem, metadata, onProgress);
        }
    }
    
    async function uploadSimple(uploadItem, metadata, onProgress) {
        return makeAPIRequest(async () => {
            uploadItem.status = 'uploading';
            updateUploadQueueItem(uploadItem);
            
            const form = new FormData();
            form.append('metadata', new Blob([JSON.stringify(metadata)], { type: 'application/json' }));
            form.append('file', uploadItem.file);
            
            const xhr = new XMLHttpRequest();
            
            // Track upload progress
            xhr.upload.onprogress = (event) => {
                if (event.lengthComputable) {
                    uploadItem.progress = Math.round((event.loaded / event.total) * 100);
                    uploadItem.uploadedBytes = event.loaded;
                    updateUploadQueueItem(uploadItem);
                    
                    if (onProgress) {
                        onProgress(uploadItem.progress);
                    }
                }
            };
            
            return new Promise((resolve, reject) => {
                xhr.onload = () => {
                    if (xhr.status === 200) {
                        const response = JSON.parse(xhr.responseText);
                        resolve(response);
                    } else {
                        reject(new Error(`Upload failed: ${xhr.status} ${xhr.statusText}`));
                    }
                };
                
                xhr.onerror = () => {
                    reject(new Error('Network error during upload'));
                };
                
                xhr.open('POST', CONFIG.drive.uploadEndpoint);
                xhr.setRequestHeader('Authorization', `Bearer ${googleToken.access_token}`);
                xhr.send(form);
            });
        });
    }
    
    async function uploadResumable(uploadItem, metadata, onProgress) {
        return makeAPIRequest(async () => {
            uploadItem.status = 'uploading';
            updateUploadQueueItem(uploadItem);
            
            // Step 1: Start resumable upload session
            const sessionResponse = await fetch(CONFIG.drive.uploadEndpoint + '?uploadType=resumable', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${googleToken.access_token}`,
                    'Content-Type': 'application/json; charset=UTF-8',
                    'X-Upload-Content-Type': uploadItem.file.type,
                    'X-Upload-Content-Length': uploadItem.file.size.toString()
                },
                body: JSON.stringify(metadata)
            });
            
            if (!sessionResponse.ok) {
                throw new Error(`Failed to start upload session: ${sessionResponse.status}`);
            }
            
            const uploadUrl = sessionResponse.headers.get('Location');
            
            // Step 2: Upload in chunks
            const chunkSize = CONFIG.drive.chunkSize;
            let offset = 0;
            
            while (offset < uploadItem.file.size) {
                const chunk = uploadItem.file.slice(offset, offset + chunkSize);
                const chunkEnd = Math.min(offset + chunkSize - 1, uploadItem.file.size - 1);
                
                const chunkResponse = await fetch(uploadUrl, {
                    method: 'PUT',
                    headers: {
                        'Content-Type': uploadItem.file.type,
                        'Content-Length': chunk.size.toString(),
                        'Content-Range': `bytes ${offset}-${chunkEnd}/${uploadItem.file.size}`
                    },
                    body: chunk
                });
                
                if (!chunkResponse.ok && chunkResponse.status !== 308) {
                    throw new Error(`Upload failed at offset ${offset}: ${chunkResponse.status}`);
                }
                
                offset += chunkSize;
                uploadItem.progress = Math.round((offset / uploadItem.file.size) * 100);
                uploadItem.uploadedBytes = offset;
                updateUploadQueueItem(uploadItem);
                
                if (onProgress) {
                    onProgress(uploadItem.progress);
                }
                
                // Handle 308 Resume Incomplete
                if (chunkResponse.status === 308) {
                    const range = chunkResponse.headers.get('Range');
                    if (range) {
                        const lastByte = parseInt(range.split('-')[1]);
                        offset = lastByte + 1;
                    }
                }
                
                // Small delay between chunks
                await new Promise(resolve => setTimeout(resolve, 100));
            }
            
            // Step 3: Get final response
            const finalResponse = await fetch(uploadUrl, {
                method: 'PUT',
                headers: {
                    'Content-Type': uploadItem.file.type,
                    'Content-Length': '0',
                    'Content-Range': `bytes */${uploadItem.file.size}`
                }
            });
            
            if (!finalResponse.ok) {
                throw new Error(`Final upload failed: ${finalResponse.status}`);
            }
            
            const result = await finalResponse.json();
            return result;
        });
    }

    // ================ UPLOAD QUEUE MANAGEMENT ================
    function addToUploadQueue(uploadItem) {
        appState.uploadQueue.push(uploadItem);
        updateUploadQueueDisplay();
        
        // Show upload queue if not visible
        if (elements.uploadQueue) {
            elements.uploadQueue.classList.add('active');
        }
    }
    
    function updateUploadQueueItem(uploadItem) {
        const index = appState.uploadQueue.findIndex(item => item.id === uploadItem.id);
        if (index !== -1) {
            appState.uploadQueue[index] = { ...appState.uploadQueue[index], ...uploadItem };
            updateUploadQueueDisplay();
        }
    }
    
    function updateUploadQueueDisplay() {
        if (!elements.queueItems) return;
        
        elements.queueItems.innerHTML = '';
        
        appState.uploadQueue.forEach(item => {
            const queueItem = document.createElement('div');
            queueItem.className = `queue-item ${item.status}`;
            queueItem.dataset.id = item.id;
            
            const icon = getFileIcon(item.type, item.name);
            const progress = item.progress || 0;
            const statusText = getUploadStatusText(item.status);
            
            queueItem.innerHTML = `
                <div class="queue-item-icon">
                    ${icon}
                </div>
                <div class="queue-item-info">
                    <div class="queue-item-name" title="${item.name}">${item.name}</div>
                    <div class="queue-item-details">
                        <span>${formatFileSize(item.uploadedBytes)} / ${formatFileSize(item.size)}</span>
                        <span class="queue-item-status ${item.status}">${statusText}</span>
                    </div>
                    <div class="queue-progress">
                        <div class="queue-progress-bar" style="width: ${progress}%"></div>
                    </div>
                </div>
                <div class="queue-item-actions">
                    ${item.status === 'uploading' ? `
                        <button class="queue-item-btn pause-btn" title="Pause">
                            <i class='bx bx-pause'></i>
                        </button>
                    ` : item.status === 'paused' ? `
                        <button class="queue-item-btn resume-btn" title="Resume">
                            <i class='bx bx-play'></i>
                        </button>
                    ` : ''}
                    <button class="queue-item-btn cancel-btn" title="Cancel">
                        <i class='bx bx-x'></i>
                    </button>
                </div>
            `;
            
            elements.queueItems.appendChild(queueItem);
            
            // Add event listeners
            const pauseBtn = queueItem.querySelector('.pause-btn');
            const resumeBtn = queueItem.querySelector('.resume-btn');
            const cancelBtn = queueItem.querySelector('.cancel-btn');
            
            if (pauseBtn) {
                pauseBtn.addEventListener('click', () => pauseUpload(item.id));
            }
            
            if (resumeBtn) {
                resumeBtn.addEventListener('click', () => resumeUpload(item.id));
            }
            
            if (cancelBtn) {
                cancelBtn.addEventListener('click', () => cancelUpload(item.id));
            }
        });
        
        // Update queue stats
        updateQueueStats();
    }
    
    function getUploadStatusText(status) {
        const statusMap = {
            'pending': 'Pending',
            'uploading': 'Uploading',
            'paused': 'Paused',
            'completed': 'Completed',
            'error': 'Error'
        };
        
        return statusMap[status] || 'Unknown';
    }
    
    function updateQueueStats() {
        const total = appState.uploadQueue.length;
        const completed = appState.uploadQueue.filter(item => item.status === 'completed').length;
        const uploading = appState.uploadQueue.filter(item => item.status === 'uploading').length;
        const errors = appState.uploadQueue.filter(item => item.status === 'error').length;
        
        // Update queue header
        const queueCount = document.querySelector('.queue-count');
        if (queueCount) {
            queueCount.textContent = `(${total})`;
        }
        
        // Update stats
        const totalSize = appState.uploadQueue.reduce((sum, item) => sum + item.size, 0);
        const uploadedSize = appState.uploadQueue.reduce((sum, item) => sum + item.uploadedBytes, 0);
        const overallProgress = totalSize > 0 ? Math.round((uploadedSize / totalSize) * 100) : 0;
        
        // Update queue stats elements if they exist
        const queueTime = document.getElementById('queueTime');
        const queueSpeed = document.getElementById('queueSpeed');
        const queueProgress = document.getElementById('queueProgress');
        
        if (queueProgress) {
            queueProgress.textContent = `${overallProgress}%`;
        }
    }
    
    function pauseUpload(uploadId) {
        // TODO: Implement pause functionality
        showToast('info', 'Upload Paused', 'Upload pause will be implemented');
    }
    
    function resumeUpload(uploadId) {
        // TODO: Implement resume functionality
        showToast('info', 'Upload Resumed', 'Upload resume will be implemented');
    }
    
    function cancelUpload(uploadId) {
        const index = appState.uploadQueue.findIndex(item => item.id === uploadId);
        if (index !== -1) {
            appState.uploadQueue.splice(index, 1);
            updateUploadQueueDisplay();
            showToast('info', 'Upload Cancelled', 'Upload has been cancelled');
        }
    }
    
    function clearCompletedUploads() {
        appState.uploadQueue = appState.uploadQueue.filter(item => item.status !== 'completed');
        updateUploadQueueDisplay();
    }

    // ================ CACHE MANAGEMENT ================
    async function cacheFile(file) {
        if (!db) return;
        
        try {
            const fileData = {
                id: file.id,
                name: file.name,
                mimeType: file.mimeType,
                size: parseInt(file.size) || 0,
                modifiedTime: file.modifiedTime,
                createdTime: file.createdTime,
                type: getFileType(file.mimeType),
                timestamp: Date.now()
            };
            
            const transaction = db.transaction(['files'], 'readwrite');
            const store = transaction.objectStore('files');
            await store.put(fileData);
            
            // Update cache map
            fileCache.set(file.id, fileData);
            
        } catch (error) {
            console.warn('Failed to cache file:', error);
        }
    }
    
    async function cacheThumbnail(fileId, thumbnailUrl) {
        if (!db) return;
        
        try {
            // Convert thumbnail URL to blob
            const response = await fetch(thumbnailUrl);
            const blob = await response.blob();
            
            const thumbnailData = {
                fileId: fileId,
                blob: blob,
                timestamp: Date.now(),
                size: blob.size
            };
            
            const transaction = db.transaction(['thumbnails'], 'readwrite');
            const store = transaction.objectStore('thumbnails');
            await store.put(thumbnailData);
            
            // Update cache map
            thumbnailCache.set(fileId, thumbnailData);
            
        } catch (error) {
            console.warn('Failed to cache thumbnail:', error);
        }
    }
    
    async function getCachedThumbnail(fileId) {
        if (!db) return null;
        
        // Check memory cache first
        if (thumbnailCache.has(fileId)) {
            return thumbnailCache.get(fileId);
        }
        
        try {
            const transaction = db.transaction(['thumbnails'], 'readonly');
            const store = transaction.objectStore('thumbnails');
            const request = store.get(fileId);
            
            return new Promise((resolve, reject) => {
                request.onsuccess = (event) => {
                    const result = event.target.result;
                    if (result) {
                        thumbnailCache.set(fileId, result);
                        resolve(result);
                    } else {
                        resolve(null);
                    }
                };
                request.onerror = reject;
            });
            
        } catch (error) {
            console.warn('Failed to get cached thumbnail:', error);
            return null;
        }
    }
    
    function clearOldCache() {
        if (!db) return;
        
        const oneWeekAgo = Date.now() - (7 * 24 * 60 * 60 * 1000);
        
        try {
            // Clear old files
            const filesTransaction = db.transaction(['files'], 'readwrite');
            const filesStore = filesTransaction.objectStore('files');
            const filesIndex = filesStore.index('timestamp');
            
            const filesRange = IDBKeyRange.upperBound(oneWeekAgo);
            const filesRequest = filesIndex.openCursor(filesRange);
            
            filesRequest.onsuccess = (event) => {
                const cursor = event.target.result;
                if (cursor) {
                    filesStore.delete(cursor.primaryKey);
                    cursor.continue();
                }
            };
            
            // Clear old thumbnails
            const thumbTransaction = db.transaction(['thumbnails'], 'readwrite');
            const thumbStore = thumbTransaction.objectStore('thumbnails');
            const thumbIndex = thumbStore.index('timestamp');
            
            const thumbRange = IDBKeyRange.upperBound(oneWeekAgo);
            const thumbRequest = thumbIndex.openCursor(thumbRange);
            
            thumbRequest.onsuccess = (event) => {
                const cursor = event.target.result;
                if (cursor) {
                    thumbStore.delete(cursor.primaryKey);
                    cursor.continue();
                }
            };
            
        } catch (error) {
            console.warn('Failed to clear old cache:', error);
        }
    }

    // ================ DRIVE DATA LOADING ================
    async function loadDriveContents() {
        if (!googleToken) {
            showToast('warning', 'Not Connected', 'Please connect to Google Drive first');
            return;
        }
        
        try {
            showLoadingState('Loading files...');
            
            // Get storage quota
            const quota = await getDriveQuota();
            updateStorageQuota(quota);
            
            // Load files
            const result = await listFiles(appState.currentFolder);
            const files = result.files;
            
            // Process and display files
            const processedFiles = files.map(file => ({
                id: file.id,
                name: file.name,
                mimeType: file.mimeType,
                size: parseInt(file.size) || 0,
                modifiedTime: file.modifiedTime,
                createdTime: file.createdTime,
                thumbnailLink: file.thumbnailLink,
                webViewLink: file.webViewLink,
                iconLink: file.iconLink,
                type: getFileType(file.mimeType),
                capabilities: file.capabilities
            }));
            
            // Cache files
            processedFiles.forEach(cacheFile);
            
            // Display files
            displayFiles(processedFiles);
            
            // Load thumbnails in background
            loadThumbnails(processedFiles);
            
            hideLoadingState();
            showToast('success', 'Files Loaded', `Loaded ${files.length} file(s)`);
            
        } catch (error) {
            console.error('Failed to load drive contents:', error);
            hideLoadingState();
            
            // Try to load from cache
            const hasCache = await loadFromCache();
            if (!hasCache) {
                showEmptyState();
            }
            
            showAPIError(error);
        }
    }
    
    function updateStorageQuota(quota) {
        if (!quota) return;
        
        const used = parseInt(quota.usage) || 0;
        const total = parseInt(quota.limit) || 15 * 1024 * 1024 * 1024; // Default 15GB
        
        const usedGB = (used / (1024 * 1024 * 1024)).toFixed(2);
        const totalGB = (total / (1024 * 1024 * 1024)).toFixed(2);
        const percent = total > 0 ? Math.round((used / total) * 100) : 0;
        
        // Update storage info
        if (elements.storageUsed) {
            elements.storageUsed.textContent = `${usedGB} GB`;
        }
        
        if (elements.storageTotal) {
            elements.storageTotal.textContent = `${totalGB} GB`;
        }
        
        if (elements.storagePercent) {
            elements.storagePercent.textContent = `${percent}%`;
        }
        
        if (elements.storageFill) {
            elements.storageFill.style.width = `${percent}%`;
        }
        
        if (elements.storageMiniFill) {
            elements.storageMiniFill.style.width = `${percent}%`;
        }
    }
    
    async function loadThumbnails(files) {
        // Limit to image files for performance
        const imageFiles = files.filter(file => 
            file.type === 'image' && file.thumbnailLink
        ).slice(0, 20); // Load first 20 thumbnails
        
        for (const file of imageFiles) {
            try {
                // Check cache first
                const cached = await getCachedThumbnail(file.id);
                
                if (cached) {
                    // Use cached thumbnail
                    updateFileThumbnail(file.id, cached.blob);
                } else {
                    // Load and cache new thumbnail
                    const thumbnailUrl = getThumbnailUrl(file.id, CONFIG.settings.thumbnailSize);
                    await cacheThumbnail(file.id, thumbnailUrl);
                    
                    // Get from cache after saving
                    const newCached = await getCachedThumbnail(file.id);
                    if (newCached) {
                        updateFileThumbnail(file.id, newCached.blob);
                    }
                }
            } catch (error) {
                // Thumbnail loading errors are non-critical
                console.debug('Thumbnail load failed:', error.message);
            }
        }
    }
    
    function updateFileThumbnail(fileId, blob) {
        const url = URL.createObjectURL(blob);
        
        // Update grid view
        const gridItem = elements.gridView.querySelector(`[data-id="${fileId}"]`);
        if (gridItem) {
            const icon = gridItem.querySelector('.file-icon');
            if (icon) {
                icon.innerHTML = `<img src="${url}" alt="thumbnail" class="thumbnail" />`;
                icon.classList.add('has-thumbnail');
            }
        }
        
        // Update list view
        const listItem = elements.tableBody.querySelector(`[data-id="${fileId}"]`);
        if (listItem) {
            const icon = listItem.querySelector('.row-icon');
            if (icon) {
                icon.innerHTML = `<img src="${url}" alt="thumbnail" class="thumbnail" />`;
                icon.classList.add('has-thumbnail');
            }
        }
    }

    // ================ LOADING STATE ================
    function showLoadingState(message = 'Loading...') {
        appState.isLoading = true;
        
        // Show loading overlay
        const loadingOverlay = document.createElement('div');
        loadingOverlay.className = 'loading-overlay';
        loadingOverlay.innerHTML = `
            <div class="loading-spinner">
                <div class="spinner"></div>
                <div class="loading-message">${message}</div>
            </div>
        `;
        
        loadingOverlay.id = 'loadingOverlay';
        document.body.appendChild(loadingOverlay);
        
        // Disable interactions
        document.body.style.pointerEvents = 'none';
    }
    
    function hideLoadingState() {
        appState.isLoading = false;
        
        // Remove loading overlay
        const loadingOverlay = document.getElementById('loadingOverlay');
        if (loadingOverlay) {
            loadingOverlay.remove();
        }
        
        // Enable interactions
        document.body.style.pointerEvents = '';
    }

    // ================ INTEGRATE WITH EXISTING VAULTOS ================
    // Extend the existing VaultOS object with Google Drive methods
    
    // Store original methods
    const originalConnectGoogle = VaultOS.connectGoogle;
    const originalDisconnectGoogle = VaultOS.disconnectGoogle;
    const originalUploadFiles = VaultOS.uploadFiles;
    const originalDownloadFile = VaultOS.downloadFile;
    const originalDeleteFile = VaultOS.deleteFile;
    
    // Override with new implementations
    VaultOS.connectGoogle = async function() {
        try {
            await loadGoogleAPI();
            const user = await signInGoogle();
            return user;
        } catch (error) {
            throw error;
        }
    };
    
    VaultOS.disconnectGoogle = async function() {
        try {
            await signOutGoogle();
            return true;
        } catch (error) {
            throw error;
        }
    };
    
    VaultOS.uploadFiles = async function(files, folderId = 'root') {
        if (!files || files.length === 0) {
            throw new Error('No files selected');
        }
        
        if (!googleToken) {
            throw new Error('Not connected to Google Drive');
        }
        
        const uploadPromises = files.map(file => uploadFile(file, folderId));
        return Promise.all(uploadPromises);
    };
    
    VaultOS.downloadFile = async function(fileId) {
        if (!googleToken) {
            throw new Error('Not connected to Google Drive');
        }
        
        try {
            const file = await getFileMetadata(fileId);
            const downloadUrl = getDownloadUrl(fileId, file.mimeType);
            
            // Create download link
            const link = document.createElement('a');
            link.href = downloadUrl;
            link.setAttribute('download', file.name);
            link.setAttribute('target', '_blank');
            
            // Add authorization header
            link.setAttribute('Authorization', `Bearer ${googleToken.access_token}`);
            
            // Trigger download
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            
            return file;
        } catch (error) {
            throw error;
        }
    };
    
    VaultOS.deleteFile = async function(fileId) {
        if (!googleToken) {
            throw new Error('Not connected to Google Drive');
        }
        
        try {
            await deleteFile(fileId);
            
            // Remove from cache
            fileCache.delete(fileId);
            thumbnailCache.delete(fileId);
            
            // Remove from display
            const elementsToRemove = document.querySelectorAll(`[data-id="${fileId}"]`);
            elementsToRemove.forEach(el => el.remove());
            
            return true;
        } catch (error) {
            throw error;
        }
    };
    
    // Add new methods to VaultOS
    VaultOS.getDriveQuota = getDriveQuota;
    VaultOS.listFiles = listFiles;
    VaultOS.createFolder = createFolder;
    VaultOS.moveFile = moveFile;
    VaultOS.copyFile = copyFile;
    VaultOS.renameFile = renameFile;
    VaultOS.toggleStar = toggleStar;
    VaultOS.shareFile = shareFile;
    VaultOS.getFilePermissions = getFilePermissions;
    VaultOS.refreshGoogleToken = refreshGoogleToken;
    VaultOS.revokeGoogleAccess = revokeGoogleAccess;
    VaultOS.loadDriveContents = loadDriveContents;
    VaultOS.clearCache = clearOldCache;
    
    // Update the UI methods to use Google Drive
    const originalShowGoogleConnectModal = showGoogleConnectModal;
    
    async function enhancedShowGoogleConnectModal() {
        if (googleToken) {
            // Already connected, show info
            showToast('info', 'Already Connected', 'You are already connected to Google Drive');
            return;
        }
        
        try {
            await VaultOS.connectGoogle();
        } catch (error) {
            // Error already handled in signInGoogle
        }
    }
    
    // Replace the modal show with direct connection
    showGoogleConnectModal = enhancedShowGoogleConnectModal;

    // ================ INITIALIZE GOOGLE API ON APP START ================
    // Load Google API in background when app starts
    setTimeout(() => {
        if (appState.unlocked) {
            loadGoogleAPI().catch(error => {
                console.debug('Background Google API load failed:', error.message);
            });
        }
    }, 3000);

})();

// ================ ADDITIONAL STYLES FOR GOOGLE INTEGRATION ================
// Add to existing CSS or create new style block
const googleIntegrationStyles = `
.loading-overlay {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: rgba(10, 10, 20, 0.9);
    backdrop-filter: blur(10px);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 10000;
}

.loading-spinner {
    text-align: center;
    color: var(--text-primary);
}

.loading-spinner .spinner {
    width: 50px;
    height: 50px;
    border: 3px solid var(--border-color);
    border-top-color: var(--primary);
    border-radius: 50%;
    animation: spin 1s linear infinite;
    margin: 0 auto 20px;
}

.loading-message {
    font-size: 1rem;
    font-weight: 500;
}

.file-icon.has-thumbnail {
    background: transparent !important;
    padding: 0;
    overflow: hidden;
}

.file-icon.has-thumbnail img,
.row-icon.has-thumbnail img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    border-radius: inherit;
}

.queue-item {
    transition: all 0.3s ease;
}

.queue-item.uploading {
    border-left: 3px solid var(--primary);
}

.queue-item.paused {
    border-left: 3px solid var(--warning);
}

.queue-item.completed {
    border-left: 3px solid var(--success);
}

.queue-item.error {
    border-left: 3px solid var(--error);
}

.queue-progress-bar {
    transition: width 0.3s ease;
}

@keyframes spin {
    from { transform: rotate(0deg); }
    to { transform: rotate(360deg); }
}
`;

// Add styles to document
if (document.head) {
    const style = document.createElement('style');
    style.textContent = googleIntegrationStyles;
    document.head.appendChild(style);
}

// ============================================
// VAULT OS v5.0 - ADVANCED FILE OPERATIONS
// Part 4/5: File Preview, Sharing, Batch Operations & Settings
// ============================================

(function() {
    'use strict';

    // ================ FILE PREVIEW SYSTEM ================
    let currentPreviewIndex = 0;
    let previewFiles = [];
    let mediaPlayer = null;
    let pdfViewer = null;
    let fullscreenEnabled = false;

    // Initialize media players on modal open
    function initializePreviewSystem() {
        // Initialize Plyr for video/audio
        if (window.Plyr) {
            mediaPlayer = new Plyr('#previewPlayer', {
                controls: ['play', 'progress', 'current-time', 'mute', 'volume', 'fullscreen'],
                settings: ['quality', 'speed']
            });
        }
        
        // Initialize PDF.js if available
        if (window.pdfjsLib) {
            pdfjsLib.GlobalWorkerOptions.workerSrc = 
                'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';
        }
    }

    // Show file preview
    async function showFilePreview(file) {
        if (!file) {
            showToast('error', 'Preview Error', 'No file selected');
            return;
        }

        // Get all files for navigation
        previewFiles = currentFiles.filter(f => f.type !== 'folder');
        currentPreviewIndex = previewFiles.findIndex(f => f.id === file.id);
        
        if (currentPreviewIndex === -1) {
            previewFiles = [file];
            currentPreviewIndex = 0;
        }

        // Show preview modal
        showModal('previewModal');
        
        // Load preview content
        await loadPreviewContent(file);
        
        // Update navigation info
        updatePreviewNavigation();
        
        // Add keyboard navigation
        document.addEventListener('keydown', handlePreviewKeyboard);
    }

    async function loadPreviewContent(file) {
        const previewContent = document.getElementById('previewContent');
        if (!previewContent) return;

        // Show loading state
        previewContent.innerHTML = `
            <div class="preview-loading">
                <i class='bx bx-loader-circle bx-spin'></i>
                <p>Loading preview...</p>
            </div>
        `;

        try {
            // Check file size before loading
            if (file.size > 100 * 1024 * 1024) { // 100MB limit
                throw new Error('File too large for preview');
            }

            // Get file type
            const fileType = getFileType(file.mimeType);
            
            // Load based on file type
            switch (fileType) {
                case 'image':
                    await loadImagePreview(file);
                    break;
                case 'video':
                    await loadVideoPreview(file);
                    break;
                case 'audio':
                    await loadAudioPreview(file);
                    break;
                case 'pdf':
                    await loadPDFPreview(file);
                    break;
                case 'document':
                    await loadDocumentPreview(file);
                    break;
                case 'text':
                case 'code':
                    await loadTextPreview(file);
                    break;
                default:
                    showUnsupportedPreview(file);
            }
        } catch (error) {
            console.error('Preview load failed:', error);
            previewContent.innerHTML = `
                <div class="preview-error">
                    <i class='bx bx-error-circle'></i>
                    <h3>Preview Unavailable</h3>
                    <p>${error.message || 'Unable to load preview'}</p>
                    <button class="btn secondary" onclick="VaultOS.downloadFile('${file.id}')">
                        <i class='bx bx-download'></i> Download Instead
                    </button>
                </div>
            `;
        }

        // Update file info
        updatePreviewFileInfo(file);
    }

    async function loadImagePreview(file) {
        if (!appState.settings.imageViewer) {
            showToast('warning', 'Viewer Disabled', 'Image viewer is disabled in settings');
            return;
        }

        const previewContent = document.getElementById('previewContent');
        const imageUrl = await getFileUrl(file.id, file.mimeType);
        
        previewContent.innerHTML = `
            <div class="preview-image-container">
                <img src="${imageUrl}" alt="${file.name}" class="preview-image" 
                     onload="this.classList.add('loaded')"
                     onerror="this.src='data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgdmlld0JveD0iMCAwIDIwMCAyMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSIyMDAiIGhlaWdodD0iMjAwIiBmaWxsPSIjMjUyNTQyIi8+CjxwYXRoIGQ9Ik01MCA3MEw5MCAxMTBMMTUwIDUwIiBzdHJva2U9IiMwMEQ0RkYiIHN0cm9rZS13aWR0aD0iOCIvPgo8L3N2Zz4K'" />
                <div class="image-zoom-controls">
                    <button class="zoom-btn" onclick="zoomImage(0.5)"><i class='bx bx-zoom-out'></i></button>
                    <button class="zoom-btn" onclick="zoomImage(1)"><i class='bx bx-reset'></i></button>
                    <button class="zoom-btn" onclick="zoomImage(2)"><i class='bx bx-zoom-in'></i></button>
                </div>
            </div>
        `;
    }

    async function loadVideoPreview(file) {
        if (!appState.settings.videoViewer) {
            showToast('warning', 'Viewer Disabled', 'Video viewer is disabled in settings');
            return;
        }

        const videoUrl = await getFileUrl(file.id, file.mimeType);
        const previewContent = document.getElementById('previewContent');
        
        previewContent.innerHTML = `
            <div class="preview-video-container">
                <video id="previewPlayer" class="preview-video" controls crossorigin playsinline>
                    <source src="${videoUrl}" type="${file.mimeType}">
                    Your browser does not support the video tag.
                </video>
            </div>
        `;

        // Initialize Plyr player
        if (window.Plyr) {
            if (mediaPlayer) {
                mediaPlayer.destroy();
            }
            mediaPlayer = new Plyr('#previewPlayer', {
                controls: ['play', 'progress', 'current-time', 'mute', 'volume', 'fullscreen'],
                settings: ['quality', 'speed']
            });
        }
    }

    async function loadAudioPreview(file) {
        if (!appState.settings.audioViewer) {
            showToast('warning', 'Viewer Disabled', 'Audio viewer is disabled in settings');
            return;
        }

        const audioUrl = await getFileUrl(file.id, file.mimeType);
        const previewContent = document.getElementById('previewContent');
        
        previewContent.innerHTML = `
            <div class="preview-audio-container">
                <audio id="previewPlayer" class="preview-audio" controls crossorigin>
                    <source src="${audioUrl}" type="${file.mimeType}">
                    Your browser does not support the audio tag.
                </audio>
            </div>
        `;

        // Initialize Plyr player
        if (window.Plyr) {
            if (mediaPlayer) {
                mediaPlayer.destroy();
            }
            mediaPlayer = new Plyr('#previewPlayer', {
                controls: ['play', 'progress', 'current-time', 'mute', 'volume']
            });
        }
    }

    async function loadPDFPreview(file) {
        if (!appState.settings.pdfViewer || !window.pdfjsLib) {
            showToast('warning', 'Viewer Disabled', 'PDF viewer is disabled or not available');
            return;
        }

        const pdfUrl = await getFileUrl(file.id, file.mimeType);
        const previewContent = document.getElementById('previewContent');
        
        previewContent.innerHTML = `
            <div class="preview-pdf-container">
                <canvas id="pdfCanvas"></canvas>
                <div class="pdf-controls">
                    <button class="pdf-btn" id="prevPage"><i class='bx bx-chevron-left'></i></button>
                    <span id="pageInfo">Page: <span id="currentPage">1</span> of <span id="totalPages">1</span></span>
                    <button class="pdf-btn" id="nextPage"><i class='bx bx-chevron-right'></i></button>
                </div>
            </div>
        `;

        try {
            // Load PDF document
            const loadingTask = pdfjsLib.getDocument({
                url: pdfUrl,
                withCredentials: true
            });
            
            const pdf = await loadingTask.promise;
            const totalPages = pdf.numPages;
            
            // Update page info
            document.getElementById('totalPages').textContent = totalPages;
            
            // Load first page
            let currentPage = 1;
            await renderPDFPage(pdf, currentPage);
            
            // Setup navigation
            document.getElementById('prevPage').addEventListener('click', async () => {
                if (currentPage > 1) {
                    currentPage--;
                    await renderPDFPage(pdf, currentPage);
                    updatePDFPageInfo(currentPage, totalPages);
                }
            });
            
            document.getElementById('nextPage').addEventListener('click', async () => {
                if (currentPage < totalPages) {
                    currentPage++;
                    await renderPDFPage(pdf, currentPage);
                    updatePDFPageInfo(currentPage, totalPages);
                }
            });
            
        } catch (error) {
            console.error('PDF load failed:', error);
            previewContent.innerHTML = `
                <div class="preview-error">
                    <i class='bx bx-error-circle'></i>
                    <h3>PDF Preview Failed</h3>
                    <p>${error.message}</p>
                </div>
            `;
        }
    }

    async function renderPDFPage(pdf, pageNum) {
        const page = await pdf.getPage(pageNum);
        const canvas = document.getElementById('pdfCanvas');
        const context = canvas.getContext('2d');
        
        // Set canvas size
        const viewport = page.getViewport({ scale: 1.5 });
        canvas.height = viewport.height;
        canvas.width = viewport.width;
        
        // Render PDF page
        const renderContext = {
            canvasContext: context,
            viewport: viewport
        };
        
        await page.render(renderContext).promise;
    }

    async function loadTextPreview(file) {
        if (!appState.settings.textViewer) {
            showToast('warning', 'Viewer Disabled', 'Text viewer is disabled in settings');
            return;
        }

        try {
            const textUrl = await getFileUrl(file.id, file.mimeType);
            const response = await fetch(textUrl, {
                headers: {
                    'Authorization': `Bearer ${googleToken.access_token}`
                }
            });
            
            if (!response.ok) throw new Error('Failed to load file');
            
            const text = await response.text();
            const previewContent = document.getElementById('previewContent');
            const isCode = file.mimeType.includes('code') || 
                          ['.js', '.ts', '.py', '.java', '.cpp', '.c', '.php', '.html', '.css', '.json', '.xml']
                          .some(ext => file.name.toLowerCase().endsWith(ext));
            
            if (isCode && appState.settings.codeViewer && window.Prism) {
                // Code syntax highlighting
                const language = getCodeLanguage(file.name);
                previewContent.innerHTML = `
                    <div class="preview-code-container">
                        <pre><code class="language-${language}">${escapeHtml(text)}</code></pre>
                    </div>
                `;
                
                // Apply syntax highlighting
                Prism.highlightAll();
            } else {
                // Plain text
                previewContent.innerHTML = `
                    <div class="preview-text-container">
                        <pre class="preview-text">${escapeHtml(text.substring(0, 100000))}</pre>
                    </div>
                `;
            }
        } catch (error) {
            console.error('Text preview failed:', error);
            throw error;
        }
    }

    async function loadDocumentPreview(file) {
        // For Google Docs, Sheets, Slides - use embedded viewer
        if (file.mimeType.includes('google-apps')) {
            const previewContent = document.getElementById('previewContent');
            const embedUrl = file.webViewLink.replace('/edit', '/preview');
            
            previewContent.innerHTML = `
                <div class="preview-doc-container">
                    <iframe src="${embedUrl}" 
                            class="preview-doc" 
                            frameborder="0" 
                            allowfullscreen>
                    </iframe>
                </div>
            `;
        } else {
            // For other documents, try to load as text or fallback
            await loadTextPreview(file);
        }
    }

    function showUnsupportedPreview(file) {
        const previewContent = document.getElementById('previewContent');
        const icon = getFileIcon(file.mimeType, file.name);
        
        previewContent.innerHTML = `
            <div class="preview-unsupported">
                <div class="unsupported-icon">${icon}</div>
                <h3>Preview Not Available</h3>
                <p>This file type cannot be previewed directly.</p>
                <div class="unsupported-actions">
                    <button class="btn primary" onclick="VaultOS.downloadFile('${file.id}')">
                        <i class='bx bx-download'></i> Download File
                    </button>
                    <button class="btn secondary" onclick="showFileInfo('${file.id}')">
                        <i class='bx bx-info-circle'></i> File Info
                    </button>
                </div>
            </div>
        `;
    }

    // Utility functions for preview
    function escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    function getCodeLanguage(filename) {
        const ext = filename.split('.').pop().toLowerCase();
        const languageMap = {
            'js': 'javascript',
            'ts': 'typescript',
            'py': 'python',
            'java': 'java',
            'cpp': 'cpp',
            'c': 'c',
            'php': 'php',
            'html': 'html',
            'css': 'css',
            'json': 'json',
            'xml': 'xml',
            'md': 'markdown',
            'sql': 'sql',
            'sh': 'bash',
            'rb': 'ruby',
            'go': 'go',
            'rs': 'rust',
            'swift': 'swift',
            'kt': 'kotlin'
        };
        return languageMap[ext] || 'text';
    }

    async function getFileUrl(fileId, mimeType) {
        if (mimeType.includes('google-apps')) {
            // Export Google Docs files
            const exportType = getExportType(mimeType);
            return `${CONFIG.drive.apiBase}/files/${fileId}/export?mimeType=${exportType}`;
        } else {
            // Direct download URL
            return `${CONFIG.drive.apiBase}/files/${fileId}?alt=media`;
        }
    }

    function updatePreviewFileInfo(file) {
        const fileName = document.getElementById('previewFileName');
        const fileSize = document.getElementById('previewFileSize');
        
        if (fileName) fileName.textContent = file.name;
        if (fileSize) fileSize.textContent = formatFileSize(file.size);
        
        // Update modal title
        const previewTitle = document.getElementById('previewTitle');
        if (previewTitle) previewTitle.textContent = file.name;
    }

    function updatePreviewNavigation() {
        const currentIndex = document.getElementById('currentFileIndex');
        const totalCount = document.getElementById('totalFilesCount');
        
        if (currentIndex) currentIndex.textContent = currentPreviewIndex + 1;
        if (totalCount) totalCount.textContent = previewFiles.length;
        
        // Update button states
        const prevBtn = document.getElementById('prevFileBtn');
        const nextBtn = document.getElementById('nextFileBtn');
        
        if (prevBtn) prevBtn.disabled = currentPreviewIndex === 0;
        if (nextBtn) nextBtn.disabled = currentPreviewIndex === previewFiles.length - 1;
    }

    function handlePreviewKeyboard(event) {
        if (!document.getElementById('previewModal').classList.contains('active')) {
            return;
        }
        
        switch (event.key) {
            case 'ArrowLeft':
                if (currentPreviewIndex > 0) {
                    navigatePreview(-1);
                }
                break;
            case 'ArrowRight':
                if (currentPreviewIndex < previewFiles.length - 1) {
                    navigatePreview(1);
                }
                break;
            case 'Escape':
                if (fullscreenEnabled) {
                    exitFullscreen();
                } else {
                    closeAllModals();
                }
                break;
            case 'f':
            case 'F':
                if (event.ctrlKey || event.metaKey) {
                    toggleFullscreen();
                }
                break;
        }
    }

    async function navigatePreview(direction) {
        const newIndex = currentPreviewIndex + direction;
        if (newIndex >= 0 && newIndex < previewFiles.length) {
            currentPreviewIndex = newIndex;
            const file = previewFiles[currentPreviewIndex];
            await loadPreviewContent(file);
            updatePreviewNavigation();
        }
    }

    function toggleFullscreen() {
        const previewModal = document.getElementById('previewModal');
        const fullscreenBtn = document.getElementById('fullscreenBtn');
        
        if (!fullscreenEnabled) {
            previewModal.requestFullscreen?.() || 
            previewModal.webkitRequestFullscreen?.() || 
            previewModal.mozRequestFullScreen?.() || 
            previewModal.msRequestFullscreen?.();
            
            document.body.classList.add('fullscreen');
            fullscreenEnabled = true;
            
            if (fullscreenBtn) {
                fullscreenBtn.innerHTML = '<i class="bx bx-exit-fullscreen"></i>';
            }
        } else {
            document.exitFullscreen?.() || 
            document.webkitExitFullscreen?.() || 
            document.mozCancelFullScreen?.() || 
            document.msExitFullscreen?.();
            
            document.body.classList.remove('fullscreen');
            fullscreenEnabled = false;
            
            if (fullscreenBtn) {
                fullscreenBtn.innerHTML = '<i class="bx bx-fullscreen"></i>';
            }
        }
    }

    function exitFullscreen() {
        if (fullscreenEnabled) {
            toggleFullscreen();
        }
    }

    // ================ FILE SHARING SYSTEM ================
    async function showShareModal() {
        if (appState.selectedFiles.length === 0) {
            showToast('warning', 'No Selection', 'Please select files to share');
            return;
        }

        // For now, only support single file sharing
        const fileId = appState.selectedFiles[0];
        const file = currentFiles.find(f => f.id === fileId);
        
        if (!file) {
            showToast('error', 'File Not Found', 'Selected file not found');
            return;
        }

        showModal('shareModal');
        
        // Load file info
        document.getElementById('shareFileName').textContent = file.name;
        
        // Generate shareable link
        await generateShareLink(fileId);
    }

    async function generateShareLink(fileId) {
        try {
            // Create public permission
            await shareFile(fileId, 'reader', 'anyone');
            
            // Get file metadata to get webViewLink
            const file = await getFileMetadata(fileId);
            const shareLink = file.webViewLink;
            
            // Update share link input
            const shareLinkInput = document.getElementById('shareLink');
            if (shareLinkInput) {
                shareLinkInput.value = shareLink;
                
                // Add copy button functionality
                document.getElementById('copyShareLinkBtn').addEventListener('click', () => {
                    copyToClipboard(shareLink);
                    showToast('success', 'Link Copied', 'Share link copied to clipboard');
                });
            }
            
            showToast('success', 'Share Link Generated', 'Public link created successfully');
            
        } catch (error) {
            console.error('Share link generation failed:', error);
            showToast('error', 'Sharing Failed', 'Unable to create share link');
        }
    }

    async function manageFilePermissions(fileId) {
        try {
            const permissions = await getFilePermissions(fileId);
            
            // Show permissions management modal
            showPermissionsModal(permissions, fileId);
            
        } catch (error) {
            console.error('Failed to get permissions:', error);
            showToast('error', 'Permissions Error', 'Unable to load file permissions');
        }
    }

    // ================ BATCH OPERATIONS ================
    async function batchDeleteFiles() {
        if (appState.selectedFiles.length === 0) {
            showToast('warning', 'No Selection', 'Please select files to delete');
            return;
        }

        if (appState.settings.confirmDelete) {
            const confirm = await showConfirmationDialog(
                'Delete Files',
                `Are you sure you want to delete ${appState.selectedFiles.length} selected item(s)?`,
                'This action cannot be undone.'
            );
            
            if (!confirm) return;
        }

        try {
            showLoadingState(`Deleting ${appState.selectedFiles.length} file(s)...`);
            
            const deletePromises = appState.selectedFiles.map(fileId => 
                deleteFile(fileId).catch(error => {
                    console.error(`Failed to delete ${fileId}:`, error);
                    return { error: true, fileId, message: error.message };
                })
            );
            
            const results = await Promise.all(deletePromises);
            
            // Check for errors
            const errors = results.filter(r => r.error);
            if (errors.length > 0) {
                showToast('warning', 'Partial Success', 
                    `Deleted ${results.length - errors.length} files, ${errors.length} failed`);
            } else {
                showToast('success', 'Files Deleted', 
                    `Successfully deleted ${results.length} file(s)`);
            }
            
            // Refresh file list
            await loadDriveContents();
            
            // Clear selection
            cancelSelection();
            
        } catch (error) {
            console.error('Batch delete failed:', error);
            showToast('error', 'Delete Failed', 'Unable to delete files');
        } finally {
            hideLoadingState();
        }
    }

    async function batchMoveFiles(targetFolderId) {
        if (appState.selectedFiles.length === 0) {
            showToast('warning', 'No Selection', 'Please select files to move');
            return;
        }

        try {
            showLoadingState(`Moving ${appState.selectedFiles.length} file(s)...`);
            
            const movePromises = appState.selectedFiles.map(fileId => 
                moveFile(fileId, targetFolderId).catch(error => {
                    console.error(`Failed to move ${fileId}:`, error);
                    return { error: true, fileId, message: error.message };
                })
            );
            
            const results = await Promise.all(movePromises);
            
            // Check for errors
            const errors = results.filter(r => r.error);
            if (errors.length > 0) {
                showToast('warning', 'Partial Success', 
                    `Moved ${results.length - errors.length} files, ${errors.length} failed`);
            } else {
                showToast('success', 'Files Moved', 
                    `Successfully moved ${results.length} file(s)`);
            }
            
            // Refresh file list
            await loadDriveContents();
            
            // Clear selection
            cancelSelection();
            
        } catch (error) {
            console.error('Batch move failed:', error);
            showToast('error', 'Move Failed', 'Unable to move files');
        } finally {
            hideLoadingState();
        }
    }

    async function batchCopyFiles(targetFolderId) {
        if (appState.selectedFiles.length === 0) {
            showToast('warning', 'No Selection', 'Please select files to copy');
            return;
        }

        try {
            showLoadingState(`Copying ${appState.selectedFiles.length} file(s)...`);
            
            const copyPromises = appState.selectedFiles.map(fileId => 
                copyFile(fileId, null, targetFolderId).catch(error => {
                    console.error(`Failed to copy ${fileId}:`, error);
                    return { error: true, fileId, message: error.message };
                })
            );
            
            const results = await Promise.all(copyPromises);
            
            // Check for errors
            const errors = results.filter(r => r.error);
            if (errors.length > 0) {
                showToast('warning', 'Partial Success', 
                    `Copied ${results.length - errors.length} files, ${errors.length} failed`);
            } else {
                showToast('success', 'Files Copied', 
                    `Successfully copied ${results.length} file(s)`);
            }
            
            // Refresh file list
            await loadDriveContents();
            
            // Clear selection
            cancelSelection();
            
        } catch (error) {
            console.error('Batch copy failed:', error);
            showToast('error', 'Copy Failed', 'Unable to copy files');
        } finally {
            hideLoadingState();
        }
    }

    async function batchDownloadFiles() {
        if (appState.selectedFiles.length === 0) {
            showToast('warning', 'No Selection', 'Please select files to download');
            return;
        }

        // Limit batch downloads
        if (appState.selectedFiles.length > 10) {
            showToast('warning', 'Too Many Files', 
                'Please select 10 or fewer files for batch download');
            return;
        }

        try {
            showLoadingState(`Preparing ${appState.selectedFiles.length} file(s) for download...`);
            
            // Create zip file for multiple files
            if (appState.selectedFiles.length > 1 && window.JSZip) {
                await createAndDownloadZip();
            } else {
                // Download single file
                const fileId = appState.selectedFiles[0];
                await VaultOS.downloadFile(fileId);
            }
            
            showToast('success', 'Download Started', 'Your download has started');
            
        } catch (error) {
            console.error('Batch download failed:', error);
            showToast('error', 'Download Failed', 'Unable to download files');
        } finally {
            hideLoadingState();
        }
    }

    async function createAndDownloadZip() {
        const zip = new JSZip();
        
        // Add each file to zip
        for (const fileId of appState.selectedFiles) {
            const file = currentFiles.find(f => f.id === fileId);
            if (!file) continue;
            
            try {
                const fileUrl = getDownloadUrl(fileId, file.mimeType);
                const response = await fetch(fileUrl, {
                    headers: {
                        'Authorization': `Bearer ${googleToken.access_token}`
                    }
                });
                
                if (response.ok) {
                    const blob = await response.blob();
                    zip.file(file.name, blob);
                }
            } catch (error) {
                console.error(`Failed to add ${file.name} to zip:`, error);
            }
        }
        
        // Generate and download zip
        const zipBlob = await zip.generateAsync({ type: 'blob' });
        const zipUrl = URL.createObjectURL(zipBlob);
        
        const link = document.createElement('a');
        link.href = zipUrl;
        link.download = `vault-download-${new Date().toISOString().split('T')[0]}.zip`;
        link.click();
        
        // Clean up
        setTimeout(() => URL.revokeObjectURL(zipUrl), 1000);
    }

    // ================ FILE INFO MODAL ================
    async function showFileInfo(fileId = null) {
        const targetFileId = fileId || (appState.selectedFiles.length > 0 ? appState.selectedFiles[0] : null);
        
        if (!targetFileId) {
            showToast('warning', 'No Selection', 'Please select a file to view info');
            return;
        }

        try {
            showLoadingState('Loading file information...');
            
            const file = await getFileMetadata(targetFileId);
            const permissions = await getFilePermissions(targetFileId);
            
            populateFileInfoModal(file, permissions);
            showModal('fileInfoModal');
            
        } catch (error) {
            console.error('Failed to load file info:', error);
            showToast('error', 'Info Load Failed', 'Unable to load file information');
        } finally {
            hideLoadingState();
        }
    }

    function populateFileInfoModal(file, permissions) {
        // Basic info
        document.getElementById('infoFileName').textContent = file.name;
        document.getElementById('infoFileType').textContent = getFileType(file.mimeType);
        document.getElementById('infoFileId').textContent = file.id;
        document.getElementById('infoFileSize').textContent = formatFileSize(file.size);
        document.getElementById('infoCreated').textContent = formatDate(file.createdTime);
        document.getElementById('infoModified').textContent = formatDate(file.modifiedTime);
        document.getElementById('infoMimeType').textContent = file.mimeType;
        document.getElementById('infoLocation').textContent = file.parents ? 'In Drive' : 'Root';
        
        // Permissions
        const capabilities = file.capabilities || {};
        document.getElementById('infoReadable').style.color = capabilities.canRead ? 'var(--success)' : 'var(--error)';
        document.getElementById('infoWritable').style.color = capabilities.canEdit ? 'var(--success)' : 'var(--error)';
        document.getElementById('infoSharable').style.color = capabilities.canShare ? 'var(--success)' : 'var(--error)';
        document.getElementById('infoTrashable').style.color = capabilities.canTrash ? 'var(--success)' : 'var(--error)';
        
        // Advanced info
        document.getElementById('infoChecksum').textContent = file.md5Checksum || 'Not available';
        document.getElementById('infoVersion').textContent = file.version || '1';
        document.getElementById('infoViewCount').textContent = file.viewedByMeTime ? 'Viewed' : 'Never viewed';
        
        // File icon
        const fileIcon = document.getElementById('infoFileIcon');
        if (fileIcon) {
            fileIcon.innerHTML = getFileIcon(file.mimeType, file.name);
            fileIcon.className = `file-icon ${getFileType(file.mimeType)}`;
        }
        
        // Button actions
        document.getElementById('copyFileLinkBtn').onclick = () => {
            copyToClipboard(file.webViewLink);
            showToast('success', 'Link Copied', 'File link copied to clipboard');
        };
        
        document.getElementById('openFileBtn').onclick = () => {
            window.open(file.webViewLink, '_blank');
        };
    }

    // ================ SETTINGS MANAGEMENT ================
    function showSettingsModal() {
        showModal('settingsModal');
        populateSettings();
    }

    function populateSettings() {
        // Theme
        const themeSelect = document.getElementById('themeSelect');
        if (themeSelect) {
            themeSelect.value = appState.settings.theme;
            themeSelect.onchange = (e) => {
                applyTheme(e.target.value);
            };
        }
        
        // Default View
        const viewSelect = document.getElementById('viewSelect');
        if (viewSelect) {
            viewSelect.value = appState.settings.defaultView;
            viewSelect.onchange = (e) => {
                appState.settings.defaultView = e.target.value;
                appState.viewMode = e.target.value;
                updateViewMode();
            };
        }
        
        // Confirmations
        document.getElementById('confirmDelete').checked = appState.settings.confirmDelete;
        document.getElementById('confirmOverwrite').checked = appState.settings.confirmOverwrite;
        document.getElementById('showThumbnails').checked = appState.settings.showThumbnails;
        
        // Security
        document.getElementById('autoLock').checked = appState.settings.autoLock;
        document.getElementById('sessionTimeout').value = appState.settings.sessionTimeout;
        document.getElementById('tokenRefresh').value = appState.settings.tokenRefresh;
        
        // File Viewers
        document.getElementById('imageViewer').checked = appState.settings.imageViewer;
        document.getElementById('pdfViewer').checked = appState.settings.pdfViewer;
        document.getElementById('videoViewer').checked = appState.settings.videoViewer;
        document.getElementById('audioViewer').checked = appState.settings.audioViewer;
        document.getElementById('textViewer').checked = appState.settings.textViewer;
        document.getElementById('codeViewer').checked = appState.settings.codeViewer;
        document.getElementById('archiveViewer').checked = appState.settings.archiveViewer;
        
        // Performance
        document.getElementById('chunkUpload').checked = appState.settings.chunkUpload;
        document.getElementById('onlineOnly').checked = appState.settings.onlineOnly;
        document.getElementById('chunkSize').value = appState.settings.chunkSize;
        document.getElementById('parallelUploads').value = appState.settings.parallelUploads;
        document.getElementById('cacheLimit').value = appState.settings.cacheLimit;
        document.getElementById('thumbnailCache').value = appState.settings.thumbnailCache;
        document.getElementById('lazyLoading').checked = appState.settings.lazyLoading;
        document.getElementById('prefetchThumbnails').checked = appState.settings.prefetchThumbnails;
        
        // PIN Change
        document.getElementById('newPin').oninput = (e) => {
            const pin = e.target.value;
            if (pin.length === 4 && /^\d+$/.test(pin)) {
                document.getElementById('changePinBtn').disabled = false;
            } else {
                document.getElementById('changePinBtn').disabled = true;
            }
        };
        
        document.getElementById('changePinBtn').onclick = () => {
            const newPin = document.getElementById('newPin').value;
            if (newPin.length === 4) {
                VaultOS.setPin(newPin);
                showToast('success', 'PIN Changed', 'Your PIN has been updated successfully');
                document.getElementById('newPin').value = '';
                document.getElementById('changePinBtn').disabled = true;
            }
        };
        
        // Clear Cache
        document.getElementById('clearCacheBtn').onclick = async () => {
            const confirm = await showConfirmationDialog(
                'Clear Cache',
                'Are you sure you want to clear all cached data?',
                'This will remove all locally stored thumbnails and file metadata.'
            );
            
            if (confirm) {
                await clearCache();
                showToast('success', 'Cache Cleared', 'All cached data has been removed');
            }
        };
        
        // Reset Settings
        document.getElementById('clearAllDataBtn').onclick = async () => {
            const confirm = await showConfirmationDialog(
                'Reset All Settings',
                'Are you sure you want to reset all settings?',
                'This will restore all settings to their default values.'
            );
            
            if (confirm) {
                resetSettings();
                showToast('success', 'Settings Reset', 'All settings have been reset to defaults');
                populateSettings(); // Refresh UI
            }
        };
    }

    async function saveSettings() {
        // Collect all settings from UI
        appState.settings = {
            theme: document.getElementById('themeSelect').value,
            defaultView: document.getElementById('viewSelect').value,
            confirmDelete: document.getElementById('confirmDelete').checked,
            confirmOverwrite: document.getElementById('confirmOverwrite').checked,
            showThumbnails: document.getElementById('showThumbnails').checked,
            autoLock: document.getElementById('autoLock').checked,
            sessionTimeout: parseInt(document.getElementById('sessionTimeout').value),
            tokenRefresh: parseInt(document.getElementById('tokenRefresh').value),
            imageViewer: document.getElementById('imageViewer').checked,
            pdfViewer: document.getElementById('pdfViewer').checked,
            videoViewer: document.getElementById('videoViewer').checked,
            audioViewer: document.getElementById('audioViewer').checked,
            textViewer: document.getElementById('textViewer').checked,
            codeViewer: document.getElementById('codeViewer').checked,
            archiveViewer: document.getElementById('archiveViewer').checked,
            chunkUpload: document.getElementById('chunkUpload').checked,
            onlineOnly: document.getElementById('onlineOnly').checked,
            chunkSize: parseInt(document.getElementById('chunkSize').value),
            parallelUploads: parseInt(document.getElementById('parallelUploads').value),
            cacheLimit: parseInt(document.getElementById('cacheLimit').value),
            thumbnailCache: parseInt(document.getElementById('thumbnailCache').value),
            lazyLoading: document.getElementById('lazyLoading').checked,
            prefetchThumbnails: document.getElementById('prefetchThumbnails').checked
        };
        
        // Apply theme if changed
        applyTheme(appState.settings.theme);
        
        // Apply view mode if changed
        if (appState.viewMode !== appState.settings.defaultView) {
            appState.viewMode = appState.settings.defaultView;
            updateViewMode();
        }
        
        // Save to localStorage
        saveSettings();
        
        // Update session timer
        if (sessionTimer) {
            clearInterval(sessionTimer);
            startSessionTimer();
        }
        
        showToast('success', 'Settings Saved', 'Your preferences have been saved');
        closeAllModals();
    }

    function resetSettings() {
        // Reset to defaults
        appState.settings = {
            theme: 'cyber',
            defaultView: 'grid',
            confirmDelete: true,
            confirmOverwrite: true,
            showThumbnails: true,
            autoLock: true,
            sessionTimeout: 24,
            tokenRefresh: 45,
            chunkUpload: true,
            onlineOnly: true,
            chunkSize: 5,
            parallelUploads: 2,
            cacheLimit: 500,
            thumbnailCache: 200,
            lazyLoading: true,
            prefetchThumbnails: true,
            imageViewer: true,
            pdfViewer: true,
            videoViewer: true,
            audioViewer: true,
            textViewer: true,
            codeViewer: true,
            archiveViewer: true
        };
        
        // Apply defaults
        applyTheme(appState.settings.theme);
        appState.viewMode = appState.settings.defaultView;
        updateViewMode();
        
        // Save
        saveSettings();
    }

    async function clearCache() {
        if (db) {
            try {
                // Clear all object stores
                const storeNames = ['files', 'thumbnails', 'metadata', 'uploads', 'errors'];
                
                for (const storeName of storeNames) {
                    const transaction = db.transaction([storeName], 'readwrite');
                    const store = transaction.objectStore(storeName);
                    await store.clear();
                }
                
                // Clear memory caches
                fileCache.clear();
                thumbnailCache.clear();
                
                // Clear localStorage cache items
                localStorage.removeItem('vault_last_state');
                
                console.log('✅ Cache cleared successfully');
                
            } catch (error) {
                console.error('Failed to clear cache:', error);
                throw error;
            }
        }
    }

    // ================ UTILITY FUNCTIONS ================
    function copyToClipboard(text) {
        navigator.clipboard.writeText(text).catch(() => {
            // Fallback for older browsers
            const textarea = document.createElement('textarea');
            textarea.value = text;
            document.body.appendChild(textarea);
            textarea.select();
            document.execCommand('copy');
            document.body.removeChild(textarea);
        });
    }

    async function showConfirmationDialog(title, message, details = '') {
        return new Promise((resolve) => {
            const dialog = document.createElement('div');
            dialog.className = 'confirmation-dialog';
            dialog.innerHTML = `
                <div class="dialog-overlay"></div>
                <div class="dialog-content">
                    <div class="dialog-header">
                        <h3>${title}</h3>
                        <button class="dialog-close">&times;</button>
                    </div>
                    <div class="dialog-body">
                        <p>${message}</p>
                        ${details ? `<p class="dialog-details">${details}</p>` : ''}
                    </div>
                    <div class="dialog-footer">
                        <button class="btn secondary cancel-btn">Cancel</button>
                        <button class="btn primary confirm-btn">Confirm</button>
                    </div>
                </div>
            `;
            
            document.body.appendChild(dialog);
            
            // Add event listeners
            const closeBtn = dialog.querySelector('.dialog-close');
            const cancelBtn = dialog.querySelector('.cancel-btn');
            const confirmBtn = dialog.querySelector('.confirm-btn');
            
            const closeDialog = (result) => {
                dialog.remove();
                resolve(result);
            };
            
            closeBtn.onclick = () => closeDialog(false);
            cancelBtn.onclick = () => closeDialog(false);
            confirmBtn.onclick = () => closeDialog(true);
            
            // Close on overlay click
            dialog.querySelector('.dialog-overlay').onclick = () => closeDialog(false);
            
            // Close on Escape key
            const handleEscape = (e) => {
                if (e.key === 'Escape') closeDialog(false);
            };
            document.addEventListener('keydown', handleEscape);
            
            // Cleanup
            dialog._cleanup = () => {
                document.removeEventListener('keydown', handleEscape);
            };
        });
    }

    // ================ INTEGRATE WITH EXISTING VAULTOS ================
    // Extend VaultOS with new methods
    
    // File Preview
    VaultOS.showFilePreview = showFilePreview;
    VaultOS.initializePreviewSystem = initializePreviewSystem;
    
    // File Info
    VaultOS.showFileInfo = showFileInfo;
    
    // Sharing
    VaultOS.showShareModal = showShareModal;
    VaultOS.manageFilePermissions = manageFilePermissions;
    
    // Batch Operations
    VaultOS.batchDeleteFiles = batchDeleteFiles;
    VaultOS.batchMoveFiles = batchMoveFiles;
    VaultOS.batchCopyFiles = batchCopyFiles;
    VaultOS.batchDownloadFiles = batchDownloadFiles;
    
    // Settings
    VaultOS.showSettingsModal = showSettingsModal;
    VaultOS.saveSettings = saveSettings;
    VaultOS.resetSettings = resetSettings;
    VaultOS.clearCache = clearCache;
    
    // Utilities
    VaultOS.copyToClipboard = copyToClipboard;
    VaultOS.showConfirmationDialog = showConfirmationDialog;

    // ================ UPDATE EXISTING EVENT HANDLERS ================
    // Override deleteSelected to use batch operations
    const originalDeleteSelected = deleteSelected;
    deleteSelected = async function() {
        await VaultOS.batchDeleteFiles();
    };
    
    // Update upload modal to handle settings
    const originalShowUploadModal = showUploadModal;
    showUploadModal = function() {
        originalShowUploadModal();
        
        // Update upload options based on settings
        const chunkUpload = document.getElementById('chunkUpload');
        const onlineOnly = document.getElementById('onlineOnly');
        
        if (chunkUpload) chunkUpload.checked = appState.settings.chunkUpload;
        if (onlineOnly) onlineOnly.checked = appState.settings.onlineOnly;
    };
    
    // Update settings save button
    document.addEventListener('DOMContentLoaded', () => {
        const saveSettingsBtn = document.getElementById('saveSettings');
        if (saveSettingsBtn) {
            saveSettingsBtn.onclick = saveSettings;
        }
        
        // Initialize preview system
        initializePreviewSystem();
        
        // Add navigation buttons functionality
        const prevFileBtn = document.getElementById('prevFileBtn');
        const nextFileBtn = document.getElementById('nextFileBtn');
        const fullscreenBtn = document.getElementById('fullscreenBtn');
        const downloadPreviewBtn = document.getElementById('downloadPreviewBtn');
        
        if (prevFileBtn) prevFileBtn.onclick = () => navigatePreview(-1);
        if (nextFileBtn) nextFileBtn.onclick = () => navigatePreview(1);
        if (fullscreenBtn) fullscreenBtn.onclick = toggleFullscreen;
        if (downloadPreviewBtn) {
            downloadPreviewBtn.onclick = () => {
                if (previewFiles[currentPreviewIndex]) {
                    VaultOS.downloadFile(previewFiles[currentPreviewIndex].id);
                }
            };
        }
    });

})();

// ================ ADDITIONAL STYLES FOR ADVANCED FEATURES ================
const advancedFeaturesStyles = `
/* Preview Modal Styles */
.preview-loading,
.preview-error,
.preview-unsupported {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    height: 100%;
    text-align: center;
    padding: 40px;
}

.preview-loading i {
    font-size: 3rem;
    color: var(--primary);
    margin-bottom: 20px;
}

.preview-error i,
.preview-unsupported .unsupported-icon {
    font-size: 4rem;
    color: var(--error);
    margin-bottom: 20px;
}

.preview-unsupported .unsupported-icon {
    color: var(--primary);
}

.preview-error h3,
.preview-unsupported h3 {
    margin-bottom: 10px;
    color: var(--text-primary);
}

.preview-error p,
.preview-unsupported p {
    color: var(--text-secondary);
    margin-bottom: 30px;
}

.preview-image-container {
    position: relative;
    width: 100%;
    height: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
}

.preview-image {
    max-width: 100%;
    max-height: 100%;
    object-fit: contain;
    transition: transform 0.3s ease;
}

.image-zoom-controls {
    position: absolute;
    bottom: 20px;
    right: 20px;
    display: flex;
    gap: 10px;
    background: var(--glass-bg);
    backdrop-filter: var(--glass-blur);
    border: 1px solid var(--glass-border);
    border-radius: var(--border-radius);
    padding: 10px;
}

.zoom-btn {
    width: 36px;
    height: 36px;
    border-radius: var(--border-radius-sm);
    background: var(--bg-surface);
    border: 1px solid var(--border-color);
    color: var(--text-primary);
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    transition: all var(--transition-fast);
}

.zoom-btn:hover {
    border-color: var(--primary);
    background: var(--primary);
    color: white;
}

.preview-video-container,
.preview-audio-container {
    width: 100%;
    max-width: 800px;
    margin: 0 auto;
}

.preview-pdf-container {
    width: 100%;
    height: 100%;
    display: flex;
    flex-direction: column;
}

#pdfCanvas {
    flex: 1;
    background: white;
    border-radius: var(--border-radius);
    box-shadow: var(--shadow-md);
}

.pdf-controls {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 20px;
    padding: 20px;
    background: var(--glass-bg);
    backdrop-filter: var(--glass-blur);
    border-top: 1px solid var(--glass-border);
}

.pdf-btn {
    width: 40px;
    height: 40px;
    border-radius: var(--border-radius);
    background: var(--bg-surface);
    border: 1px solid var(--border-color);
    color: var(--text-primary);
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    transition: all var(--transition-fast);
}

.pdf-btn:hover:not(:disabled) {
    border-color: var(--primary);
    background: var(--primary);
    color: white;
}

.pdf-btn:disabled {
    opacity: 0.5;
    cursor: not-allowed;
}

#pageInfo {
    color: var(--text-primary);
    font-weight: 500;
    min-width: 120px;
    text-align: center;
}

.preview-code-container,
.preview-text-container {
    width: 100%;
    height: 100%;
    overflow: auto;
    background: var(--bg-tertiary);
    border-radius: var(--border-radius);
}

.preview-code-container pre,
.preview-text-container pre {
    margin: 0;
    padding: 20px;
    font-family: var(--font-mono);
    font-size: 0.9rem;
    line-height: 1.5;
    white-space: pre-wrap;
    word-wrap: break-word;
}

.preview-doc-container {
    width: 100%;
    height: 100%;
}

.preview-doc {
    width: 100%;
    height: 100%;
    border: none;
    border-radius: var(--border-radius);
}

/* Confirmation Dialog */
.confirmation-dialog {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    z-index: 10001;
}

.dialog-overlay {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: rgba(0, 0, 0, 0.7);
    backdrop-filter: blur(4px);
}

.dialog-content {
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    background: var(--bg-modal);
    backdrop-filter: var(--glass-blur);
    border: 1px solid var(--glass-border);
    border-radius: var(--border-radius-lg);
    width: 90%;
    max-width: 500px;
    box-shadow: var(--shadow-lg);
}

.dialog-header {
    padding: var(--space-lg);
    border-bottom: 1px solid var(--border-color);
    display: flex;
    align-items: center;
    justify-content: space-between;
}

.dialog-header h3 {
    margin: 0;
    color: var(--text-primary);
    font-size: 1.2rem;
}

.dialog-close {
    background: none;
    border: none;
    color: var(--text-tertiary);
    font-size: 1.5rem;
    cursor: pointer;
    padding: 0;
    width: 30px;
    height: 30px;
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: var(--border-radius-sm);
    transition: all var(--transition-fast);
}

.dialog-close:hover {
    background: var(--bg-surface);
    color: var(--text-primary);
}

.dialog-body {
    padding: var(--space-lg);
}

.dialog-body p {
    margin: 0 0 var(--space-md) 0;
    color: var(--text-primary);
    line-height: 1.6;
}

.dialog-details {
    font-size: 0.9rem;
    color: var(--text-secondary);
    margin-top: var(--space-md);
    padding: var(--space-md);
    background: var(--bg-tertiary);
    border-radius: var(--border-radius);
    border: 1px solid var(--border-color);
}

.dialog-footer {
    padding: var(--space-lg);
    border-top: 1px solid var(--border-color);
    display: flex;
    justify-content: flex-end;
    gap: var(--space-md);
}

/* Settings Modal Enhancements */
.settings-modal .modal-body {
    max-height: 60vh;
    overflow-y: auto;
}

.setting-group {
    animation: var(--fade-in);
}

.setting-group + .setting-group {
    margin-top: var(--space-xl);
}

.setting-item {
    margin-bottom: var(--space-lg);
}

.setting-item:last-child {
    margin-bottom: 0;
}

.setting-item label {
    display: flex;
    justify-content: space-between;
    align-items: center;
    width: 100%;
    cursor: pointer;
}

.setting-item input[type="checkbox"] {
    width: 18px;
    height: 18px;
    cursor: pointer;
}

.setting-item select,
.setting-item input[type="number"],
.setting-item input[type="text"],
.setting-item input[type="password"] {
    width: 100%;
    max-width: 200px;
}

.pin-change {
    display: flex;
    gap: var(--space-sm);
    align-items: center;
}

.pin-change input {
    flex: 1;
}

.pin-change button {
    flex-shrink: 0;
}

/* Batch Operation Feedback */
.batch-progress {
    position: fixed;
    bottom: 20px;
    right: 20px;
    background: var(--glass-bg);
    backdrop-filter: var(--glass-blur);
    border: 1px solid var(--glass-border);
    border-radius: var(--border-radius);
    padding: var(--space-md);
    box-shadow: var(--shadow-lg);
    z-index: 1000;
    max-width: 300px;
}

.batch-progress-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: var(--space-sm);
}

.batch-progress-title {
    font-weight: 600;
    color: var(--text-primary);
    font-size: 0.95rem;
}

.batch-progress-count {
    color: var(--text-secondary);
    font-size: 0.85rem;
}

.batch-progress-bar {
    height: 4px;
    background: var(--bg-surface);
    border-radius: 2px;
    overflow: hidden;
    margin-bottom: var(--space-sm);
}

.batch-progress-fill {
    height: 100%;
    background: var(--gradient-primary);
    border-radius: 2px;
    width: 0%;
    transition: width 0.3s ease;
}

.batch-progress-details {
    font-size: 0.85rem;
    color: var(--text-secondary);
    display: flex;
    justify-content: space-between;
}

/* Responsive Adjustments */
@media (max-width: 767px) {
    .preview-modal {
        width: 100%;
        height: 100vh;
        border-radius: 0;
    }
    
    .image-zoom-controls {
        bottom: 10px;
        right: 10px;
        padding: 5px;
    }
    
    .zoom-btn {
        width: 32px;
        height: 32px;
    }
    
    .dialog-content {
        width: 95%;
        max-width: none;
    }
    
    .setting-item select,
    .setting-item input[type="number"],
    .setting-item input[type="text"],
    .setting-item input[type="password"] {
        max-width: 100%;
    }
}

/* Animation for file operations */
@keyframes fileOperation {
    0% {
        opacity: 0;
        transform: scale(0.9);
    }
    100% {
        opacity: 1;
        transform: scale(1);
    }
}

.file-card.new,
.table-row.new {
    animation: fileOperation 0.3s ease-out;
}

/* Selection enhancement */
.file-card.selected,
.table-row.selected {
    animation: pulseGlow 2s infinite;
}

@keyframes pulseGlow {
    0%, 100% {
        box-shadow: 0 0 0 0 rgba(0, 212, 255, 0.4);
    }
    50% {
        box-shadow: 0 0 0 4px rgba(0, 212, 255, 0);
    }
}
`;

// Add styles to document
if (document.head) {
    const style = document.createElement('style');
    style.textContent = advancedFeaturesStyles;
    document.head.appendChild(style);
}


// ============================================
// VAULT OS v5.0 - FINAL POLISH & OPTIMIZATION
// Part 5/5: Offline Support, Debug Tools & Final Testing
// ============================================

(function() {
    'use strict';

    // ================ OFFLINE SUPPORT ================
    let offlineQueue = [];
    let syncInProgress = false;
    let networkStatus = navigator.onLine;
    let offlineMode = false;

    function setupOfflineSupport() {
        // Monitor network status
        window.addEventListener('online', () => {
            networkStatus = true;
            offlineMode = false;
            updateConnectionStatus(true);
            processOfflineQueue();
            showToast('success', 'Back Online', 'Connection restored');
        });

        window.addEventListener('offline', () => {
            networkStatus = false;
            offlineMode = true;
            updateConnectionStatus(false);
            
            if (appState.settings.onlineOnly) {
                showToast('error', 'Offline', 'Online-only mode enabled. Some features disabled.');
            } else {
                showToast('warning', 'Offline', 'Working in offline mode');
            }
        });

        // Initialize offline queue from localStorage
        loadOfflineQueue();

        // Setup offline indicator
        updateOfflineIndicator();

        console.log('✅ Offline support initialized');
    }

    function loadOfflineQueue() {
        try {
            const savedQueue = localStorage.getItem('vault_offline_queue');
            if (savedQueue) {
                offlineQueue = JSON.parse(savedQueue);
                console.log(`📦 Loaded ${offlineQueue.length} items from offline queue`);
                
                // Clean old items (older than 7 days)
                const sevenDaysAgo = Date.now() - (7 * 24 * 60 * 60 * 1000);
                offlineQueue = offlineQueue.filter(item => item.timestamp > sevenDaysAgo);
                saveOfflineQueue();
            }
        } catch (error) {
            console.error('Failed to load offline queue:', error);
            offlineQueue = [];
        }
    }

    function saveOfflineQueue() {
        try {
            localStorage.setItem('vault_offline_queue', JSON.stringify(offlineQueue));
        } catch (error) {
            console.error('Failed to save offline queue:', error);
        }
    }

    function addToOfflineQueue(operation, data) {
        if (appState.settings.onlineOnly) {
            showToast('error', 'Offline Mode', 'Cannot queue action. Online-only mode is enabled.');
            return null;
        }

        const queueItem = {
            id: `offline_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
            operation: operation,
            data: data,
            timestamp: Date.now(),
            attempts: 0,
            maxAttempts: 3,
            status: 'pending'
        };

        offlineQueue.push(queueItem);
        saveOfflineQueue();

        showToast('info', 'Queued Offline', 'Action will sync when online');
        updateOfflineIndicator();

        return queueItem.id;
    }

    async function processOfflineQueue() {
        if (syncInProgress || offlineQueue.length === 0 || !networkStatus || !googleToken) {
            return;
        }

        syncInProgress = true;
        const syncIndicator = showSyncStatus('Syncing offline actions...');

        try {
            // Process queue items
            for (let i = 0; i < offlineQueue.length; i++) {
                const item = offlineQueue[i];
                
                if (item.status === 'completed' || item.attempts >= item.maxAttempts) {
                    continue;
                }

                try {
                    syncIndicator.update(`${i + 1}/${offlineQueue.length}: ${getOperationName(item.operation)}`);
                    
                    // Execute the operation
                    const result = await executeOfflineOperation(item);
                    
                    // Mark as completed
                    item.status = 'completed';
                    item.result = result;
                    item.completedAt = Date.now();
                    
                    saveOfflineQueue();
                    
                    console.log(`✅ Offline operation completed: ${item.operation}`);
                    
                } catch (error) {
                    console.error(`❌ Offline operation failed: ${item.operation}`, error);
                    item.attempts++;
                    item.lastError = error.message;
                    item.lastAttempt = Date.now();
                    
                    saveOfflineQueue();
                    
                    if (item.attempts >= item.maxAttempts) {
                        showToast('error', 'Sync Failed', 
                            `Failed to sync ${getOperationName(item.operation)} after ${item.maxAttempts} attempts`);
                    }
                }
                
                // Small delay between operations
                await new Promise(resolve => setTimeout(resolve, 500));
            }

            // Clean completed items
            offlineQueue = offlineQueue.filter(item => item.status !== 'completed');
            saveOfflineQueue();
            
            updateOfflineIndicator();
            
            if (offlineQueue.length === 0) {
                showToast('success', 'Sync Complete', 'All offline actions synchronized');
            }

        } catch (error) {
            console.error('Offline queue processing failed:', error);
            showToast('error', 'Sync Error', 'Failed to process offline queue');
        } finally {
            syncInProgress = false;
            if (syncIndicator) syncIndicator.remove();
        }
    }

    async function executeOfflineOperation(item) {
        switch (item.operation) {
            case 'upload':
                return await VaultOS.uploadFiles([item.data.file], item.data.folderId);
            case 'createFolder':
                return await VaultOS.createFolder(item.data.name, item.data.parentId);
            case 'delete':
                return await VaultOS.deleteFile(item.data.fileId);
            case 'rename':
                return await VaultOS.renameFile(item.data.fileId, item.data.newName);
            case 'move':
                return await VaultOS.moveFile(item.data.fileId, item.data.targetFolderId);
            case 'copy':
                return await VaultOS.copyFile(item.data.fileId, item.data.newName, item.data.targetFolderId);
            default:
                throw new Error(`Unknown operation: ${item.operation}`);
        }
    }

    function getOperationName(operation) {
        const names = {
            'upload': 'Upload',
            'createFolder': 'Create Folder',
            'delete': 'Delete',
            'rename': 'Rename',
            'move': 'Move',
            'copy': 'Copy'
        };
        return names[operation] || operation;
    }

    function updateOfflineIndicator() {
        const indicator = document.getElementById('offlineIndicator');
        if (!indicator) return;

        if (offlineQueue.length > 0) {
            indicator.style.display = 'flex';
            indicator.innerHTML = `<i class='bx bx-time'></i><span>${offlineQueue.length} pending</span>`;
        } else {
            indicator.style.display = 'none';
        }
    }

    function showSyncStatus(message) {
        const statusElement = document.createElement('div');
        statusElement.className = 'sync-status';
        statusElement.innerHTML = `
            <div class="sync-status-content">
                <div class="sync-spinner">
                    <i class='bx bx-loader-circle bx-spin'></i>
                </div>
                <div class="sync-message">${message}</div>
                <div class="sync-details"></div>
            </div>
        `;

        document.body.appendChild(statusElement);

        return {
            update: (details) => {
                const detailsEl = statusElement.querySelector('.sync-details');
                if (detailsEl) detailsEl.textContent = details;
            },
            remove: () => {
                if (statusElement.parentNode) {
                    statusElement.parentNode.removeChild(statusElement);
                }
            }
        };
    }

    // ================ DEBUG TOOLS (ERUDA) ================
    function setupDebugTools() {
        // Only enable in development or when debug flag is present
        if (CONFIG.debug.enabled || window.location.search.includes('debug=true')) {
            loadEruda().then(() => {
                console.log('🔧 Debug tools enabled');
                
                // Add custom debug commands
                setupDebugCommands();
                
                // Show debug panel toggle
                showDebugToggle();
            }).catch(error => {
                console.warn('Debug tools failed to load:', error);
            });
        }
    }

    async function loadEruda() {
        return new Promise((resolve, reject) => {
            if (window.eruda) {
                eruda.init();
                resolve();
                return;
            }

            const script = document.createElement('script');
            script.src = CONFIG.cdn.eruda;
            script.onload = () => {
                eruda.init();
                customizeEruda();
                resolve();
            };
            script.onerror = reject;
            document.head.appendChild(script);
        });
    }

    function customizeEruda() {
        // Custom console commands
        const erudaConsole = eruda.get('console');
        
        // Add custom commands
        erudaConsole.config.set('displayUnenumerable', true);
        erudaConsole.config.set('displayGetterVal', true);
        
        // Add custom filters
        erudaConsole.config.set('filter', {
            showVaultInfo: true,
            showNetwork: true,
            showErrors: true
        });
    }

    function setupDebugCommands() {
        // Add VaultOS to global scope for debugging
        window.VaultOS = VaultOS;
        
        // Add debug commands
        window.debug = {
            // Show app state
            state: () => {
                console.log('=== VAULT OS DEBUG STATE ===');
                console.log('App State:', VaultOS.getState());
                console.log('Google User:', VaultOS.getUser());
                console.log('Google Token:', VaultOS.getToken());
                console.log('Settings:', VaultOS.getSettings());
                console.log('Offline Queue:', offlineQueue);
                console.log('Network Status:', networkStatus);
                console.log('File Cache Size:', fileCache.size);
                console.log('===========================');
            },
            
            // Clear all data
            clearAll: () => {
                if (confirm('Clear ALL data including cache, settings, and offline queue?')) {
                    localStorage.clear();
                    if (db) {
                        const transaction = db.transaction(db.objectStoreNames, 'readwrite');
                        for (let store of db.objectStoreNames) {
                            transaction.objectStore(store).clear();
                        }
                    }
                    fileCache.clear();
                    thumbnailCache.clear();
                    offlineQueue = [];
                    location.reload();
                }
            },
            
            // Simulate network offline
            toggleNetwork: () => {
                networkStatus = !networkStatus;
                updateConnectionStatus(networkStatus);
                console.log('Network status toggled:', networkStatus);
            },
            
            // Force token refresh
            refreshToken: () => {
                VaultOS.refreshGoogleToken();
            },
            
            // Load mock data
            loadMock: () => {
                loadMockData();
            },
            
            // Test upload
            testUpload: () => {
                // Create a test file
                const content = 'Test file content for debugging';
                const blob = new Blob([content], { type: 'text/plain' });
                const file = new File([blob], 'test-debug.txt', { type: 'text/plain' });
                
                VaultOS.uploadFiles([file], 'root').then(() => {
                    console.log('Test upload successful');
                }).catch(console.error);
            },
            
            // Performance test
            perfTest: async () => {
                const start = performance.now();
                
                // Test 100 file renders
                const mockFiles = Array.from({ length: 100 }, (_, i) => ({
                    id: `test_${i}`,
                    name: `Test File ${i}.txt`,
                    mimeType: 'text/plain',
                    size: 1024 * i,
                    modifiedTime: new Date().toISOString(),
                    type: 'text'
                }));
                
                displayFiles(mockFiles);
                
                const end = performance.now();
                console.log(`Render 100 files: ${(end - start).toFixed(2)}ms`);
            }
        };
    }

    function showDebugToggle() {
        const toggle = document.createElement('div');
        toggle.id = 'debugToggle';
        toggle.innerHTML = '<i class="bx bx-bug"></i>';
        toggle.title = 'Debug Tools';
        
        toggle.style.cssText = `
            position: fixed;
            bottom: 20px;
            left: 20px;
            width: 40px;
            height: 40px;
            background: var(--primary);
            color: white;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            cursor: pointer;
            z-index: 9999;
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
            font-size: 20px;
            transition: all 0.3s ease;
        `;
        
        toggle.addEventListener('click', () => {
            eruda.show();
        });
        
        document.body.appendChild(toggle);
    }

    // ================ PERFORMANCE OPTIMIZATIONS ================
    function setupPerformanceOptimizations() {
        // Image lazy loading
        setupLazyLoading();
        
        // Virtual scrolling for large lists
        setupVirtualScrolling();
        
        // Memory management
        setupMemoryManagement();
        
        // Cache optimization
        setupCacheOptimization();
        
        console.log('✅ Performance optimizations initialized');
    }

    function setupLazyLoading() {
        if (!appState.settings.lazyLoading) return;
        
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const img = entry.target;
                    const fileId = img.dataset.fileId;
                    
                    if (fileId && !img.src) {
                        loadThumbnailLazy(img, fileId);
                    }
                    
                    observer.unobserve(img);
                }
            });
        }, {
            rootMargin: '100px',
            threshold: 0.1
        });
        
        // Apply to existing images
        document.querySelectorAll('img[data-file-id]').forEach(img => {
            observer.observe(img);
        });
        
        // Watch for new images
        const imageObserver = new MutationObserver((mutations) => {
            mutations.forEach(mutation => {
                mutation.addedNodes.forEach(node => {
                    if (node.nodeType === 1) {
                        const images = node.querySelectorAll ? 
                            node.querySelectorAll('img[data-file-id]') : [];
                        images.forEach(img => observer.observe(img));
                    }
                });
            });
        });
        
        imageObserver.observe(document.body, {
            childList: true,
            subtree: true
        });
    }

    async function loadThumbnailLazy(img, fileId) {
        try {
            const cached = await getCachedThumbnail(fileId);
            if (cached) {
                const url = URL.createObjectURL(cached.blob);
                img.src = url;
                img.onload = () => URL.revokeObjectURL(url);
            } else if (googleToken && networkStatus) {
                const thumbnailUrl = getThumbnailUrl(fileId, CONFIG.settings.thumbnailSize);
                img.src = thumbnailUrl;
                // Cache in background
                cacheThumbnail(fileId, thumbnailUrl);
            }
        } catch (error) {
            console.debug('Lazy load failed:', error);
        }
    }

    function setupVirtualScrolling() {
        if (currentFiles.length < CONFIG.performance.maxDOMElements) return;
        
        // Implement virtual scrolling for large lists
        let visibleStart = 0;
        let visibleEnd = 50; // Show 50 items at a time
        
        function updateVisibleItems() {
            const visibleFiles = currentFiles.slice(visibleStart, visibleEnd);
            displayFiles(visibleFiles);
        }
        
        // Listen to scroll events
        elements.contentArea?.addEventListener('scroll', () => {
            const scrollTop = elements.contentArea.scrollTop;
            const itemHeight = 60; // Approximate height of each item
            
            visibleStart = Math.floor(scrollTop / itemHeight);
            visibleEnd = visibleStart + Math.ceil(elements.contentArea.clientHeight / itemHeight) + 10; // Buffer
            
            updateVisibleItems();
        });
        
        // Initial render
        updateVisibleItems();
    }

    function setupMemoryManagement() {
        // Clean up object URLs periodically
        setInterval(() => {
            const maxAge = 5 * 60 * 1000; // 5 minutes
            const now = Date.now();
            
            // Track and revoke old URLs
            if (window.objectURLs) {
                window.objectURLs = window.objectURLs.filter(urlInfo => {
                    if (now - urlInfo.created > maxAge) {
                        URL.revokeObjectURL(urlInfo.url);
                        return false;
                    }
                    return true;
                });
            }
        }, 60000); // Check every minute
        
        // Setup object URL tracking
        const originalCreateObjectURL = URL.createObjectURL;
        const originalRevokeObjectURL = URL.revokeObjectURL;
        
        URL.createObjectURL = function(blob) {
            const url = originalCreateObjectURL.call(this, blob);
            
            if (!window.objectURLs) window.objectURLs = [];
            window.objectURLs.push({
                url: url,
                created: Date.now(),
                size: blob.size || 0
            });
            
            // Clean up if too many URLs
            if (window.objectURLs.length > CONFIG.performance.maxObjectURLs) {
                const oldest = window.objectURLs.shift();
                URL.revokeObjectURL(oldest.url);
            }
            
            return url;
        };
        
        URL.revokeObjectURL = function(url) {
            if (window.objectURLs) {
                window.objectURLs = window.objectURLs.filter(info => info.url !== url);
            }
            originalRevokeObjectURL.call(this, url);
        };
    }

    function setupCacheOptimization() {
        // Clean old cache periodically
        setInterval(() => {
            clearOldCache();
        }, 30 * 60 * 1000); // Every 30 minutes
        
        // Monitor cache size
        if (db) {
            setInterval(async () => {
                try {
                    const transaction = db.transaction(['files', 'thumbnails'], 'readonly');
                    const filesStore = transaction.objectStore('files');
                    const thumbStore = transaction.objectStore('thumbnails');
                    
                    const filesCount = await countStore(filesStore);
                    const thumbsCount = await countStore(thumbStore);
                    
                    // If cache is too large, clear oldest items
                    if (filesCount > CONFIG.indexedDB.limits.maxFiles) {
                        clearOldestCacheItems('files', filesCount - CONFIG.indexedDB.limits.maxFiles);
                    }
                    
                    if (thumbsCount > CONFIG.indexedDB.limits.maxThumbnails) {
                        clearOldestCacheItems('thumbnails', thumbsCount - CONFIG.indexedDB.limits.maxThumbnails);
                    }
                    
                } catch (error) {
                    console.debug('Cache monitoring failed:', error);
                }
            }, 5 * 60 * 1000); // Every 5 minutes
        }
    }

    async function countStore(store) {
        return new Promise((resolve, reject) => {
            const countRequest = store.count();
            countRequest.onsuccess = () => resolve(countRequest.result);
            countRequest.onerror = reject;
        });
    }

    async function clearOldestCacheItems(storeName, countToRemove) {
        try {
            const transaction = db.transaction([storeName], 'readwrite');
            const store = transaction.objectStore(storeName);
            const index = store.index('timestamp');
            
            const request = index.openCursor();
            let removed = 0;
            
            request.onsuccess = (event) => {
                const cursor = event.target.result;
                if (cursor && removed < countToRemove) {
                    store.delete(cursor.primaryKey);
                    removed++;
                    cursor.continue();
                }
            };
            
        } catch (error) {
            console.debug('Failed to clear old cache items:', error);
        }
    }

    // ================ ERROR REPORTING & ANALYTICS ================
    function setupErrorReporting() {
        // Global error handler
        window.addEventListener('error', (event) => {
            logErrorToFirebase({
                type: 'window_error',
                message: event.message,
                filename: event.filename,
                lineno: event.lineno,
                colno: event.colno,
                error: event.error?.toString(),
                stack: event.error?.stack,
                timestamp: new Date().toISOString(),
                url: window.location.href,
                user: googleUser?.email || 'anonymous'
            });
        });
        
        // Unhandled promise rejections
        window.addEventListener('unhandledrejection', (event) => {
            logErrorToFirebase({
                type: 'unhandled_rejection',
                reason: event.reason?.toString(),
                stack: event.reason?.stack,
                timestamp: new Date().toISOString(),
                url: window.location.href,
                user: googleUser?.email || 'anonymous'
            });
        });
        
        // User action tracking (optional)
        if (appState.settings.analytics) {
            setupUserAnalytics();
        }
        
        console.log('✅ Error reporting initialized');
    }

    async function logErrorToFirebase(errorData) {
        if (!CONFIG.firebase.databaseURL.includes('firebaseio.com')) {
            return; // Only log to production Firebase
        }
        
        try {
            // Use fetch to log to Firebase Realtime Database
            const response = await fetch(`${CONFIG.firebase.databaseURL}/errors.json`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(errorData)
            });
            
            if (!response.ok) {
                console.debug('Failed to log error to Firebase');
            }
        } catch (error) {
            console.debug('Error logging failed:', error);
        }
    }

    function setupUserAnalytics() {
        // Track page views
        trackEvent('page_view', {
            page: window.location.pathname,
            referrer: document.referrer
        });
        
        // Track file operations
        const originalFunctions = {
            uploadFiles: VaultOS.uploadFiles,
            deleteFile: VaultOS.deleteFile,
            createFolder: VaultOS.createFolder
        };
        
        // Wrap with analytics
        VaultOS.uploadFiles = async function(...args) {
            trackEvent('file_upload', { count: args[0]?.length || 0 });
            return originalFunctions.uploadFiles.apply(this, args);
        };
        
        VaultOS.deleteFile = async function(...args) {
            trackEvent('file_delete', { fileId: args[0] });
            return originalFunctions.deleteFile.apply(this, args);
        };
        
        VaultOS.createFolder = async function(...args) {
            trackEvent('folder_create', { name: args[0] });
            return originalFunctions.createFolder.apply(this, args);
        };
    }

    function trackEvent(eventName, eventData = {}) {
        const event = {
            name: eventName,
            data: eventData,
            timestamp: new Date().toISOString(),
            user: googleUser?.email || 'anonymous',
            session: appState.sessionStart,
            environment: CONFIG.environment.currentEnvironment
        };
        
        // Log to Firebase if available
        if (CONFIG.firebase.databaseURL.includes('firebaseio.com')) {
            fetch(`${CONFIG.firebase.databaseURL}/analytics/${Date.now()}.json`, {
                method: 'PUT',
                body: JSON.stringify(event)
            }).catch(() => {
                // Silently fail
            });
        }
        
        // Log to console in debug mode
        if (CONFIG.debug.enabled) {
            console.log(`📊 Analytics: ${eventName}`, eventData);
        }
    }

    // ================ FINAL INITIALIZATION ================
    function finalInitialization() {
        console.log('🚀 VAULT OS v5.0 - Final Initialization');
        
        // Setup offline support
        setupOfflineSupport();
        
        // Setup performance optimizations
        setupPerformanceOptimizations();
        
        // Setup error reporting
        setupErrorReporting();
        
        // Setup debug tools
        setupDebugTools();
        
        // Check for updates
        checkForUpdates();
        
        // Start background tasks
        startBackgroundTasks();
        
        // Final UI polish
        applyFinalUIPolish();
        
        console.log('✅ VAULT OS v5.0 - Ready for Production');
        showToast('success', 'VAULT OS v5.0', 'All systems operational', 3000);
    }

    function checkForUpdates() {
        // Check for config updates
        const lastConfigVersion = localStorage.getItem('vault_config_version');
        const currentVersion = `${CONFIG.version.major}.${CONFIG.version.minor}.${CONFIG.version.patch}`;
        
        if (lastConfigVersion !== currentVersion) {
            console.log(`🔄 Config updated: ${lastConfigVersion} → ${currentVersion}`);
            
            // Perform migrations if needed
            performMigrations(lastConfigVersion, currentVersion);
            
            localStorage.setItem('vault_config_version', currentVersion);
        }
        
        // Check for GitHub updates
        if (CONFIG.environment.isGithubPages) {
            checkGitHubUpdates();
        }
    }

    function performMigrations(oldVersion, newVersion) {
        console.log(`Performing migration from ${oldVersion} to ${newVersion}`);
        
        // Migration logic here
        if (!oldVersion) {
            // First install
            localStorage.setItem('vault_first_install', new Date().toISOString());
        }
        
        // Example: Migrate settings structure
        const oldSettings = localStorage.getItem('vault_settings');
        if (oldSettings) {
            try {
                const settings = JSON.parse(oldSettings);
                
                // Add new settings if missing
                const defaultSettings = {
                    theme: 'cyber',
                    defaultView: 'grid',
                    confirmDelete: true,
                    confirmOverwrite: true,
                    showThumbnails: true,
                    autoLock: true,
                    sessionTimeout: 24,
                    tokenRefresh: 45,
                    chunkUpload: true,
                    onlineOnly: true,
                    chunkSize: 5,
                    parallelUploads: 2,
                    cacheLimit: 500,
                    thumbnailCache: 200,
                    lazyLoading: true,
                    prefetchThumbnails: true,
                    imageViewer: true,
                    pdfViewer: true,
                    videoViewer: true,
                    audioViewer: true,
                    textViewer: true,
                    codeViewer: true,
                    archiveViewer: true,
                    analytics: false
                };
                
                // Merge with defaults
                const migratedSettings = { ...defaultSettings, ...settings };
                localStorage.setItem('vault_settings', JSON.stringify(migratedSettings));
                
                console.log('✅ Settings migrated');
            } catch (error) {
                console.error('Migration failed:', error);
            }
        }
    }

    async function checkGitHubUpdates() {
        try {
            const response = await fetch('https://api.github.com/repos/khademsorder/Cvault/commits?per_page=1');
            if (response.ok) {
                const commits = await response.json();
                const latestCommit = commits[0];
                const lastKnownCommit = localStorage.getItem('vault_last_commit');
                
                if (lastKnownCommit !== latestCommit.sha) {
                    localStorage.setItem('vault_last_commit', latestCommit.sha);
                    
                    // Show update notification if not first visit
                    if (lastKnownCommit) {
                        showUpdateNotification();
                    }
                }
            }
        } catch (error) {
            console.debug('GitHub update check failed:', error);
        }
    }

    function showUpdateNotification() {
        const notification = document.createElement('div');
        notification.className = 'update-notification';
        notification.innerHTML = `
            <div class="update-content">
                <div class="update-icon">
                    <i class='bx bx-cloud-download'></i>
                </div>
                <div class="update-text">
                    <div class="update-title">Update Available</div>
                    <div class="update-message">A new version is available</div>
                </div>
                <div class="update-actions">
                    <button class="btn secondary update-later">Later</button>
                    <button class="btn primary update-now">Update Now</button>
                </div>
            </div>
        `;
        
        document.body.appendChild(notification);
        
        // Add event listeners
        notification.querySelector('.update-later').addEventListener('click', () => {
            notification.remove();
        });
        
        notification.querySelector('.update-now').addEventListener('click', () => {
            location.reload();
        });
        
        // Auto-remove after 30 seconds
        setTimeout(() => {
            if (notification.parentNode) {
                notification.remove();
            }
        }, 30000);
    }

    function startBackgroundTasks() {
        // Auto-sync every 5 minutes
        setInterval(() => {
            if (networkStatus && googleToken) {
                processOfflineQueue();
            }
        }, 5 * 60 * 1000);
        
        // Auto-cleanup every hour
        setInterval(() => {
            clearOldCache();
        }, 60 * 60 * 1000);
        
        // Memory monitoring
        setInterval(() => {
            if (performance.memory) {
                const usedMB = performance.memory.usedJSHeapSize / 1024 / 1024;
                if (usedMB > 500) { // 500MB threshold
                    console.warn(`High memory usage: ${usedMB.toFixed(2)}MB`);
                    // Trigger garbage collection if needed
                    if (window.gc) window.gc();
                }
            }
        }, 10000);
    }

    function applyFinalUIPolish() {
        // Add subtle animations
        document.querySelectorAll('.file-card, .menu-item, .btn').forEach(el => {
            el.style.transition = 'all var(--transition-fast)';
        });
        
        // Add hover effects
        const style = document.createElement('style');
        style.textContent = `
            .file-card:hover, .table-row:hover {
                transform: translateY(-2px);
                box-shadow: var(--shadow-lg);
            }
            
            .btn:hover {
                transform: translateY(-1px);
            }
            
            .menu-item:hover {
                background: var(--bg-surface);
                padding-left: var(--space-lg);
            }
            
            /* Smooth scrolling */
            .app-container, .modal-body {
                scroll-behavior: smooth;
            }
            
            /* Focus styles */
            *:focus {
                outline: 2px solid var(--primary);
                outline-offset: 2px;
            }
            
            /* Loading animations */
            @keyframes fadeIn {
                from { opacity: 0; transform: translateY(10px); }
                to { opacity: 1; transform: translateY(0); }
            }
            
            .file-card, .table-row {
                animation: fadeIn 0.3s ease-out;
            }
        `;
        
        document.head.appendChild(style);
        
        // Add keyboard shortcuts help
        document.addEventListener('keydown', (e) => {
            if (e.ctrlKey && e.shiftKey && e.key === '/') {
                showKeyboardShortcuts();
            }
        });
    }

    function showKeyboardShortcuts() {
        const shortcuts = [
            { key: 'Ctrl/Cmd + F', action: 'Search files' },
            { key: 'Ctrl/Cmd + A', action: 'Select all files' },
            { key: 'Delete', action: 'Delete selected files' },
            { key: 'Esc', action: 'Close modals/cancel selection' },
            { key: 'Arrow Keys', action: 'Navigate previews' },
            { key: 'Ctrl/Cmd + S', action: 'Save settings' },
            { key: 'Ctrl/Cmd + U', action: 'Upload files' },
            { key: 'Ctrl/Cmd + Shift + /', action: 'Show this help' }
        ];
        
        let html = '<div class="shortcuts-modal"><h3>Keyboard Shortcuts</h3><ul>';
        shortcuts.forEach(shortcut => {
            html += `<li><kbd>${shortcut.key}</kbd><span>${shortcut.action}</span></li>`;
        });
        html += '</ul></div>';
        
        const modal = document.createElement('div');
        modal.className = 'modal active';
        modal.innerHTML = `
            <div class="modal-overlay active"></div>
            <div class="modal-content" style="max-width: 500px">
                <div class="modal-header">
                    <h2>Keyboard Shortcuts</h2>
                    <button class="modal-close">&times;</button>
                </div>
                <div class="modal-body">
                    ${html}
                </div>
            </div>
        `;
        
        document.body.appendChild(modal);
        
        modal.querySelector('.modal-overlay').addEventListener('click', () => modal.remove());
        modal.querySelector('.modal-close').addEventListener('click', () => modal.remove());
    }

    // ================ MOCK DATA FOR TESTING ================
    function loadMockData() {
        if (!CONFIG.debug.useMockData) return;
        
        console.log('📁 Loading mock data...');
        
        const mockFiles = [
            {
                id: 'mock_1',
                name: 'Sample Document.docx',
                mimeType: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
                size: 1024 * 512,
                modifiedTime: new Date(Date.now() - 3600000).toISOString(),
                createdTime: new Date(Date.now() - 86400000).toISOString(),
                type: 'document'
            },
            {
                id: 'mock_2',
                name: 'Vacation Photo.jpg',
                mimeType: 'image/jpeg',
                size: 1024 * 2048,
                modifiedTime: new Date(Date.now() - 7200000).toISOString(),
                createdTime: new Date(Date.now() - 172800000).toISOString(),
                type: 'image'
            },
            {
                id: 'mock_3',
                name: 'Project Presentation.pptx',
                mimeType: 'application/vnd.openxmlformats-officedocument.presentationml.presentation',
                size: 1024 * 1024,
                modifiedTime: new Date(Date.now() - 10800000).toISOString(),
                createdTime: new Date(Date.now() - 259200000).toISOString(),
                type: 'document'
            },
            {
                id: 'mock_4',
                name: 'Meeting Notes.txt',
                mimeType: 'text/plain',
                size: 1024 * 5,
                modifiedTime: new Date(Date.now() - 1800000).toISOString(),
                createdTime: new Date(Date.now() - 43200000).toISOString(),
                type: 'text'
            },
            {
                id: 'mock_5',
                name: 'Project Files',
                mimeType: 'application/vnd.google-apps.folder',
                size: 0,
                modifiedTime: new Date(Date.now() - 14400000).toISOString(),
                createdTime: new Date(Date.now() - 345600000).toISOString(),
                type: 'folder'
            }
        ];
        
        displayFiles(mockFiles);
        showToast('info', 'Mock Data', 'Loaded sample files for testing');
    }

    // ================ INTEGRATE WITH VAULTOS ================
    // Add new methods to VaultOS
    VaultOS.setupOfflineSupport = setupOfflineSupport;
    VaultOS.processOfflineQueue = processOfflineQueue;
    VaultOS.addToOfflineQueue = addToOfflineQueue;
    VaultOS.getOfflineQueue = () => offlineQueue;
    VaultOS.clearOfflineQueue = () => {
        offlineQueue = [];
        saveOfflineQueue();
        updateOfflineIndicator();
    };
    
    VaultOS.enableDebug = () => {
        CONFIG.debug.enabled = true;
        setupDebugTools();
    };
    
    VaultOS.disableDebug = () => {
        CONFIG.debug.enabled = false;
        if (window.eruda) {
            eruda.destroy();
        }
        const toggle = document.getElementById('debugToggle');
        if (toggle) toggle.remove();
    };
    
    VaultOS.trackEvent = trackEvent;
    VaultOS.loadMockData = loadMockData;
    VaultOS.finalInitialization = finalInitialization;

    // ================ START FINAL INIT ================
    // Run after DOM is loaded and initial app is ready
    document.addEventListener('DOMContentLoaded', () => {
        setTimeout(() => {
            if (typeof VaultOS !== 'undefined' && VaultOS.init) {
                finalInitialization();
            }
        }, 2000); // Wait for main app to initialize
    });

})();

// ================ FINAL STYLES ================
const finalStyles = `
/* Offline Indicator */
#offlineIndicator {
    position: fixed;
    bottom: 20px;
    right: 20px;
    background: var(--warning);
    color: white;
    padding: 8px 16px;
    border-radius: var(--border-radius);
    display: flex;
    align-items: center;
    gap: 8px;
    font-size: 0.9rem;
    font-weight: 500;
    z-index: 1000;
    box-shadow: var(--shadow-md);
    animation: slideUp 0.3s ease-out;
}

#offlineIndicator i {
    font-size: 1.1rem;
}

/* Sync Status */
.sync-status {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    background: var(--glass-bg);
    backdrop-filter: var(--glass-blur);
    border-bottom: 1px solid var(--glass-border);
    z-index: 10000;
    padding: 12px var(--space-lg);
    display: flex;
    align-items: center;
    justify-content: center;
    animation: slideDown 0.3s ease-out;
}

.sync-status-content {
    display: flex;
    align-items: center;
    gap: var(--space-md);
    max-width: 600px;
    width: 100%;
}

.sync-spinner {
    color: var(--primary);
    font-size: 1.2rem;
}

.sync-message {
    flex: 1;
    color: var(--text-primary);
    font-weight: 500;
}

.sync-details {
    color: var(--text-secondary);
    font-size: 0.9rem;
}

/* Update Notification */
.update-notification {
    position: fixed;
    top: 20px;
    right: 20px;
    background: var(--glass-bg);
    backdrop-filter: var(--glass-blur);
    border: 1px solid var(--glass-border);
    border-radius: var(--border-radius);
    box-shadow: var(--shadow-lg);
    z-index: 10000;
    max-width: 400px;
    animation: slideInRight 0.3s ease-out;
}

.update-content {
    display: flex;
    align-items: center;
    padding: var(--space-md);
    gap: var(--space-md);
}

.update-icon {
    color: var(--primary);
    font-size: 1.5rem;
}

.update-text {
    flex: 1;
}

.update-title {
    font-weight: 600;
    color: var(--text-primary);
    margin-bottom: 4px;
}

.update-message {
    color: var(--text-secondary);
    font-size: 0.9rem;
}

.update-actions {
    display: flex;
    gap: var(--space-sm);
    flex-shrink: 0;
}

/* Keyboard Shortcuts */
.shortcuts-modal ul {
    list-style: none;
    padding: 0;
    margin: 0;
}

.shortcuts-modal li {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: var(--space-sm) 0;
    border-bottom: 1px solid var(--border-color);
}

.shortcuts-modal li:last-child {
    border-bottom: none;
}

.shortcuts-modal kbd {
    background: var(--bg-tertiary);
    border: 1px solid var(--border-color);
    border-radius: var(--border-radius-sm);
    padding: 4px 8px;
    font-family: var(--font-mono);
    font-size: 0.9rem;
    color: var(--text-primary);
    min-width: 120px;
}

.shortcuts-modal span {
    color: var(--text-secondary);
    text-align: right;
}

/* Animations */
@keyframes slideUp {
    from {
        transform: translateY(100%);
        opacity: 0;
    }
    to {
        transform: translateY(0);
        opacity: 1;
    }
}

@keyframes slideDown {
    from {
        transform: translateY(-100%);
        opacity: 0;
    }
    to {
        transform: translateY(0);
        opacity: 1;
    }
}

@keyframes slideInRight {
    from {
        transform: translateX(100%);
        opacity: 0;
    }
    to {
        transform: translateX(0);
        opacity: 1;
    }
}

/* Performance Optimizations */
@media (prefers-reduced-motion: reduce) {
    * {
        animation-duration: 0.01ms !important;
        animation-iteration-count: 1 !important;
        transition-duration: 0.01ms !important;
    }
}

/* Print Styles */
@media print {
    .app-container {
        display: none;
    }
    
    .print-header {
        display: block;
        text-align: center;
        margin-bottom: 20px;
    }
}

/* High Contrast Mode */
@media (prefers-contrast: high) {
    :root {
        --border-color: #000000;
        --glass-border: #000000;
        --text-primary: #000000;
        --text-secondary: #333333;
    }
    
    .glass {
        background: white !important;
        border: 2px solid black !important;
    }
}

/* Reduced Motion */
@media (prefers-reduced-motion: reduce) {
    .loading-spinner,
    .sync-spinner,
    .vault-icon,
    .pin-dot {
        animation: none !important;
    }
    
    .file-card,
    .table-row,
    .toast,
    .modal {
        transition: none !important;
        animation: none !important;
    }
}

/* Touch Device Optimizations */
@media (hover: none) and (pointer: coarse) {
    .file-card,
    .menu-item,
    .btn {
        min-height: 44px;
        min-width: 44px;
    }
    
    .pin-key {
        width: 60px;
        height: 60px;
        font-size: 1.2rem;
    }
    
    .context-menu {
        min-width: 200px;
    }
    
    .context-item {
        padding: 16px;
    }
}

/* Dark Mode Adjustments */
@media (prefers-color-scheme: dark) {
    :root[data-theme="cyber"] {
        --bg-primary: #0a0a14;
        --bg-secondary: #151520;
        --text-primary: #ffffff;
        --text-secondary: #b0b0c0;
    }
}

/* Loading State Improvements */
.loading-state {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    height: 200px;
    gap: var(--space-md);
}

.loading-state i {
    font-size: 2rem;
    color: var(--primary);
    animation: spin 1s linear infinite;
}

.loading-state p {
    color: var(--text-secondary);
}

/* Empty State Improvements */
.empty-state {
    text-align: center;
    padding: var(--space-xl);
    animation: fadeIn 0.5s ease-out;
}

.empty-icon {
    font-size: 4rem;
    color: var(--text-tertiary);
    margin-bottom: var(--space-md);
    opacity: 0.5;
}

.empty-state h3 {
    color: var(--text-primary);
    margin-bottom: var(--space-sm);
}

.empty-state p {
    color: var(--text-secondary);
    margin-bottom: var(--space-lg);
    max-width: 400px;
    margin-left: auto;
    margin-right: auto;
}

.empty-actions {
    display: flex;
    gap: var(--space-md);
    justify-content: center;
    flex-wrap: wrap;
}

/* Final Responsive Adjustments */
@media (max-width: 480px) {
    .modal-content {
        width: 95%;
        margin: 10px;
    }
    
    .settings-modal .modal-body {
        max-height: 70vh;
    }
    
    .update-notification {
        left: 10px;
        right: 10px;
        max-width: none;
    }
    
    .empty-actions {
        flex-direction: column;
        align-items: center;
    }
    
    .empty-actions button {
        width: 100%;
        max-width: 300px;
    }
}

/* Accessibility Improvements */
.sr-only {
    position: absolute;
    width: 1px;
    height: 1px;
    padding: 0;
    margin: -1px;
    overflow: hidden;
    clip: rect(0, 0, 0, 0);
    white-space: nowrap;
    border: 0;
}

/* Focus visible for keyboard navigation */
:focus-visible {
    outline: 3px solid var(--primary);
    outline-offset: 2px;
    border-radius: var(--border-radius-sm);
}

/* Skip to main content */
.skip-to-content {
    position: absolute;
    top: -40px;
    left: 0;
    background: var(--primary);
    color: white;
    padding: 8px 16px;
    border-radius: var(--border-radius);
    z-index: 10001;
    text-decoration: none;
}

.skip-to-content:focus {
    top: 10px;
}
`;

// Add final styles to document
if (document.head) {
    const style = document.createElement('style');
    style.textContent = finalStyles;
    document.head.appendChild(style);
}

// ================ FINAL EXPORT AND READY STATE ================
console.log('🚀 VAULT OS v5.0 - Complete Application Loaded');

// Make sure everything is properly initialized
window.addEventListener('load', () => {
    console.log('✅ Window loaded - VAULT OS is ready');
    
    // Show welcome message
    setTimeout(() => {
        if (document.getElementById('appContainer') && typeof VaultOS !== 'undefined') {
            console.log('🎉 VAULT OS v5.0 - Fully Operational');
            
            // Track successful load
            if (typeof VaultOS.trackEvent === 'function') {
                VaultOS.trackEvent('app_loaded', {
                    version: CONFIG.version,
                    environment: CONFIG.environment.currentEnvironment,
                    loadTime: performance.now()
                });
            }
        }
    }, 1000);
});

// Handle page visibility changes
document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'visible') {
        console.log('🔄 Page became visible');
        // Refresh data if needed
        if (googleToken && networkStatus) {
            processOfflineQueue();
        }
    }
});

// ================ FINAL ERROR BOUNDARY ================
// Catch any remaining errors
window.onerror = function(message, source, lineno, colno, error) {
    console.error('Uncaught error:', { message, source, lineno, colno, error });
    
    // Try to log to Firebase
    if (CONFIG.firebase.databaseURL.includes('firebaseio.com')) {
        fetch(`${CONFIG.firebase.databaseURL}/critical_errors.json`, {
            method: 'POST',
            body: JSON.stringify({
                message,
                source,
                lineno,
                colno,
                error: error?.toString(),
                timestamp: new Date().toISOString(),
                url: window.location.href
            })
        }).catch(() => {
            // Ignore logging errors
        });
    }
    
    // Show user-friendly error
    if (typeof showToast === 'function') {
        showToast('error', 'Application Error', 
            'A critical error occurred. Please refresh the page.');
    }
    
    return false;
};

// ============================================
// VAULT OS v5.0 - APPLICATION COMPLETE
// ============================================


