/**
 * APP.JS - Main Application Orchestration for Vault OS
 * Handles module initialization, event handling, background services, 
 * error handling, and PWA support
 * Complete rebuild with modern architecture
 */

class VaultApp {
    constructor() {
        // Core modules
        this.config = null;
        this.auth = null;
        this.drive = null;
        this.media = null;
        this.ui = null;
        
        // App state
        this.state = {
            initialized: false,
            online: navigator.onLine,
            processing: false,
            backgroundTasks: 0,
            errors: [],
            warnings: [],
            lastSync: null,
            lastBackup: null
        };
        
        // Background services
        this.services = {
            sync: null,
            backup: null,
            cleanup: null,
            healthCheck: null
        };
        
        // Event system
        this.events = {};
        
        // Error tracking
        this.errorTracker = [];
        
        // PWA support
        this.isPWA = false;
        this.deferredPrompt = null;
        
        // Initialize app
        this.init();
    }

    /**
     * Initialize the application
     */
    async init() {
        try {
            console.log('🔐 Vault OS Ultimate - Initializing...');
            
            // Load configuration first
            await this.loadConfig();
            
            // Initialize modules in sequence
            await this.initModules();
            
            // Set up event system
            this.setupEventSystem();
            
            // Set up global error handling
            this.setupErrorHandling();
            
            // Set up background services
            this.setupBackgroundServices();
            
            // Set up PWA features
            this.setupPWA();
            
            // Set up event listeners
            this.setupEventListeners();
            
            // Start app
            await this.startApp();
            
            // Mark as initialized
            this.state.initialized = true;
            
            console.log('✅ Vault OS initialized successfully');
            this.ui?.showToast('Vault OS ready!', 'success');
            
        } catch (error) {
            console.error('❌ App initialization failed:', error);
            this.handleFatalError(error);
        }
    }

    /**
     * Load configuration
     */
    async loadConfig() {
        try {
            // Check if config is already loaded
            if (window.VAULT_CONFIG) {
                this.config = window.VAULT_CONFIG;
                console.log('📋 Config loaded from global');
                return;
            }
            
            // Try to load config from localStorage as fallback
            const savedConfig = localStorage.getItem('vault_config');
            if (savedConfig) {
                this.config = JSON.parse(savedConfig);
                console.log('📋 Config loaded from storage');
            } else {
                throw new Error('Configuration not found');
            }
        } catch (error) {
            console.error('Failed to load config:', error);
            throw new Error('Configuration failed to load. Please refresh.');
        }
    }

    /**
     * Initialize all modules
     */
    async initModules() {
        console.log('🔄 Initializing modules...');
        
        // Initialize UI Manager first (needed for loading states)
        if (typeof UIManager !== 'undefined') {
            this.ui = window.uiManager || new UIManager();
            window.uiManager = this.ui;
            console.log('✅ UI Manager initialized');
        } else {
            console.warn('⚠️ UI Manager not found, skipping...');
        }
        
        // Show loading state
        this.ui?.showLoading('Initializing modules...');
        
        // Initialize Auth Manager
        if (typeof AuthManager !== 'undefined') {
            // Check if already initialized
            if (!window.Auth) {
                this.auth = new AuthManager();
                window.Auth = this.auth;
            } else {
                this.auth = window.Auth;
            }
            console.log('✅ Auth Manager initialized');
        } else {
            throw new Error('Auth module not found');
        }
        
        // Initialize Drive Manager
        if (typeof DriveManager !== 'undefined') {
            if (!window.driveManager) {
                this.drive = new DriveManager();
                window.driveManager = this.drive;
            } else {
                this.drive = window.driveManager;
            }
            console.log('✅ Drive Manager initialized');
        } else {
            console.warn('⚠️ Drive Manager not found, skipping...');
        }
        
        // Initialize Media Viewer
        if (typeof MediaViewer !== 'undefined') {
            if (!window.mediaViewerInstance) {
                this.media = new MediaViewer();
                window.mediaViewerInstance = this.media;
            } else {
                this.media = window.mediaViewerInstance;
            }
            console.log('✅ Media Viewer initialized');
        } else {
            console.warn('⚠️ Media Viewer not found, skipping...');
        }
        
        console.log('🎉 All modules initialized successfully');
    }

    /**
     * Set up event system
     */
    setupEventSystem() {
        console.log('🔌 Setting up event system...');
        
        // Define core events
        this.events = {
            // App lifecycle
            'app:ready': [],
            'app:sleep': [],
            'app:wake': [],
            'app:error': [],
            
            // Authentication
            'auth:login': [],
            'auth:logout': [],
            'auth:session-expired': [],
            
            // Drive operations
            'drive:sync-start': [],
            'drive:sync-complete': [],
            'drive:sync-error': [],
            'drive:upload-start': [],
            'drive:upload-complete': [],
            'drive:upload-error': [],
            'drive:download-start': [],
            'drive:download-complete': [],
            'drive:download-error': [],
            
            // File operations
            'file:created': [],
            'file:updated': [],
            'file:deleted': [],
            'file:selected': [],
            'file:deselected': [],
            
            // UI events
            'ui:theme-changed': [],
            'ui:view-changed': [],
            'ui:modal-opened': [],
            'ui:modal-closed': [],
            
            // Network events
            'network:online': [],
            'network:offline': [],
            
            // Storage events
            'storage:updated': [],
            'storage:low': [],
            'storage:full': []
        };
    }

    /**
     * Set up global error handling
     */
    setupErrorHandling() {
        console.log('🛡️ Setting up error handling...');
        
        // Global error handler
        window.onerror = (message, source, lineno, colno, error) => {
            this.handleError(error || new Error(message), {
                source: source,
                lineno: lineno,
                colno: colno,
                type: 'global'
            });
            return true; // Prevent default error handling
        };
        
        // Unhandled promise rejection handler
        window.onunhandledrejection = (event) => {
            this.handleError(event.reason, {
                type: 'unhandled-rejection',
                promise: event.promise
            });
        };
        
        // Vue/React error boundary simulation
        if (window.Vue) {
            Vue.config.errorHandler = (error, vm, info) => {
                this.handleError(error, {
                    component: vm?.$options?.name,
                    info: info,
                    type: 'vue'
                });
            };
        }
    }

    /**
     * Set up background services
     */
    setupBackgroundServices() {
        console.log('⚙️ Setting up background services...');
        
        // Sync service
        this.services.sync = {
            interval: null,
            lastRun: null,
            enabled: this.config?.app?.sync?.autoSync || true,
            intervalMs: this.config?.app?.sync?.syncInterval || 30000
        };
        
        // Backup service (settings backup)
        this.services.backup = {
            interval: null,
            lastRun: null,
            enabled: true,
            intervalMs: 24 * 60 * 60 * 1000 // 24 hours
        };
        
        // Cleanup service
        this.services.cleanup = {
            interval: null,
            lastRun: null,
            enabled: true,
            intervalMs: 60 * 60 * 1000 // 1 hour
        };
        
        // Health check service
        this.services.healthCheck = {
            interval: null,
            lastRun: null,
            enabled: true,
            intervalMs: 5 * 60 * 1000 // 5 minutes
        };
        
        // Start services if enabled
        this.startBackgroundServices();
    }

    /**
     * Start background services
     */
    startBackgroundServices() {
        // Auto-sync service
        if (this.services.sync.enabled && this.drive) {
            this.services.sync.interval = setInterval(() => {
                this.runBackgroundSync();
            }, this.services.sync.intervalMs);
            
            console.log('✅ Auto-sync service started');
        }
        
        // Backup service
        if (this.services.backup.enabled) {
            this.services.backup.interval = setInterval(() => {
                this.backupSettings();
            }, this.services.backup.intervalMs);
            
            console.log('✅ Backup service started');
        }
        
        // Cleanup service
        if (this.services.cleanup.enabled) {
            this.services.cleanup.interval = setInterval(() => {
                this.cleanupTempFiles();
            }, this.services.cleanup.intervalMs);
            
            console.log('✅ Cleanup service started');
        }
        
        // Health check service
        if (this.services.healthCheck.enabled) {
            this.services.healthCheck.interval = setInterval(() => {
                this.runHealthCheck();
            }, this.services.healthCheck.intervalMs);
            
            console.log('✅ Health check service started');
        }
    }

    /**
     * Set up PWA features
     */
    setupPWA() {
        console.log('📱 Setting up PWA features...');
        
        // Check if running as PWA
        this.isPWA = window.matchMedia('(display-mode: standalone)').matches || 
                    window.navigator.standalone ||
                    document.referrer.includes('android-app://');
        
        // Listen for before install prompt
        window.addEventListener('beforeinstallprompt', (e) => {
            e.preventDefault();
            this.deferredPrompt = e;
            console.log('📲 PWA install prompt available');
            
            // Show install button if not already installed
            if (!this.isPWA) {
                this.showInstallPrompt();
            }
        });
        
        // Listen for app installed
        window.addEventListener('appinstalled', () => {
            console.log('✅ PWA installed successfully');
            this.isPWA = true;
            this.deferredPrompt = null;
            this.ui?.showToast('App installed successfully!', 'success');
        });
        
        // Register service worker
        this.registerServiceWorker();
        
        // Set up offline detection
        window.addEventListener('online', () => this.handleOnline());
        window.addEventListener('offline', () => this.handleOffline());
    }

    /**
     * Register service worker
     */
    async registerServiceWorker() {
        if ('serviceWorker' in navigator) {
            try {
                const registration = await navigator.serviceWorker.register('/service-worker.js');
                console.log('✅ Service Worker registered:', registration);
                
                // Check for updates
                registration.addEventListener('updatefound', () => {
                    const newWorker = registration.installing;
                    console.log('🔄 Service Worker update found');
                    
                    newWorker.addEventListener('statechange', () => {
                        if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                            this.showUpdatePrompt();
                        }
                    });
                });
                
            } catch (error) {
                console.error('❌ Service Worker registration failed:', error);
            }
        }
    }

    /**
     * Set up event listeners
     */
    setupEventListeners() {
        console.log('🎧 Setting up event listeners...');
        
        // Global click handler for data attributes
        document.addEventListener('click', (e) => {
            // Handle data-action attributes
            const actionElement = e.target.closest('[data-action]');
            if (actionElement) {
                const action = actionElement.dataset.action;
                this.handleAction(action, actionElement);
            }
            
            // Handle data-route attributes
            const routeElement = e.target.closest('[data-route]');
            if (routeElement) {
                const route = routeElement.dataset.route;
                this.navigateTo(route);
            }
        });
        
        // Global keyboard shortcuts
        document.addEventListener('keydown', (e) => this.handleKeyboardShortcuts(e));
        
        // Visibility change (tab switching)
        document.addEventListener('visibilitychange', () => this.handleVisibilityChange());
        
        // Page load/unload
        window.addEventListener('load', () => this.handlePageLoad());
        window.addEventListener('beforeunload', (e) => this.handleBeforeUnload(e));
        
        // File upload handling
        const uploadInput = document.getElementById('upload-input');
        if (uploadInput) {
            uploadInput.addEventListener('change', (e) => this.handleFileUpload(e));
        }
        
        // Drag and drop
        this.setupDragAndDrop();
    }

    /**
     * Start the application
     */
    async startApp() {
        console.log('🚀 Starting application...');
        
        // Hide loading screen
        this.ui?.hideLoading();
        
        // Check authentication state
        if (this.auth?.isLoggedIn()) {
            // User is logged in, show main interface
            this.showAppInterface();
            
            // Load initial data
            await this.loadInitialData();
            
            // Trigger app ready event
            this.triggerEvent('app:ready');
            
        } else {
            // Show authentication screen
            this.showAuthScreen();
        }
        
        // Update app state
        this.updateAppState();
    }

    /**
     * Show authentication screen
     */
    showAuthScreen() {
        console.log('🔐 Showing authentication screen');
        
        // Hide app interface
        document.getElementById('app-interface')?.classList.add('hidden');
        
        // Show PIN screen
        document.getElementById('pin-screen')?.classList.remove('hidden');
        
        // Reset PIN buffer
        if (this.auth) {
            this.auth.clearPinBuffer();
        }
    }

    /**
     * Show main app interface
     */
    showAppInterface() {
        console.log('🖥️ Showing app interface');
        
        // Hide auth screens
        document.getElementById('pin-screen')?.classList.add('hidden');
        document.getElementById('drive-connect-modal')?.classList.add('hidden');
        
        // Show app interface
        const appInterface = document.getElementById('app-interface');
        if (appInterface) {
            appInterface.classList.remove('hidden');
        }
        
        // Update UI elements
        this.updateAppUI();
    }

    /**
     * Load initial data
     */
    async loadInitialData() {
        console.log('📥 Loading initial data...');
        
        try {
            // Show loading indicator
            this.ui?.showLoading('Loading your files...');
            
            // Load files from current folder
            if (this.drive) {
                await this.drive.loadFiles();
                this.state.lastSync = Date.now();
            }
            
            // Load storage info
            if (this.auth) {
                await this.auth.refreshStorageInfo();
            }
            
            // Update UI
            this.updateAppUI();
            
            // Hide loading
            this.ui?.hideLoading();
            
            console.log('✅ Initial data loaded');
            
        } catch (error) {
            console.error('❌ Failed to load initial data:', error);
            this.ui?.hideLoading();
            this.ui?.showToast('Failed to load files', 'error');
        }
    }

    /**
     * Update app UI
     */
    updateAppUI() {
        // Update user info
        if (this.auth?.user) {
            const userAvatar = document.getElementById('user-avatar');
            const userName = document.getElementById('user-name');
            const userEmail = document.getElementById('user-email');
            
            if (userAvatar && this.auth.user.picture) {
                userAvatar.src = this.auth.user.picture;
                userAvatar.alt = this.auth.user.name;
            }
            
            if (userName) {
                userName.textContent = this.auth.user.name;
            }
            
            if (userEmail) {
                userEmail.textContent = this.auth.user.email;
            }
        }
        
        // Update storage info
        if (this.auth?.storageInfo) {
            const storageUsed = document.getElementById('storage-used');
            const storageTotal = document.getElementById('storage-total');
            const storagePercent = document.getElementById('storage-percent');
            const storageBar = document.getElementById('storage-bar');
            
            if (storageUsed && this.auth.storageInfo) {
                const usedGB = (this.auth.storageInfo.used / (1024 * 1024 * 1024)).toFixed(2);
                storageUsed.textContent = `${usedGB} GB`;
            }
            
            if (storageTotal && this.auth.storageInfo) {
                if (this.auth.storageInfo.isUnlimited) {
                    storageTotal.textContent = 'Unlimited';
                } else {
                    const totalGB = (this.auth.storageInfo.total / (1024 * 1024 * 1024)).toFixed(2);
                    storageTotal.textContent = `${totalGB} GB`;
                }
            }
            
            if (storagePercent && storageBar && this.auth.storageInfo) {
                const percent = Math.min(this.auth.storageInfo.percentage, 100);
                storagePercent.textContent = `${percent.toFixed(1)}%`;
                storageBar.style.width = `${percent}%`;
                
                // Color coding
                if (percent > 90) {
                    storageBar.style.backgroundColor = '#ff4757';
                } else if (percent > 75) {
                    storageBar.style.backgroundColor = '#ffa502';
                } else if (percent > 50) {
                    storageBar.style.backgroundColor = '#ffdd59';
                }
            }
        }
        
        // Update sync status
        const syncIndicator = document.getElementById('sync-indicator');
        if (syncIndicator) {
            if (this.drive?.isSyncing) {
                syncIndicator.classList.add('syncing');
                syncIndicator.title = 'Syncing...';
            } else {
                syncIndicator.classList.remove('syncing');
                syncIndicator.title = 'Up to date';
            }
        }
        
        // Update online status
        const onlineIndicator = document.getElementById('online-indicator');
        if (onlineIndicator) {
            if (this.state.online) {
                onlineIndicator.classList.add('online');
                onlineIndicator.title = 'Online';
            } else {
                onlineIndicator.classList.remove('online');
                onlineIndicator.title = 'Offline';
            }
        }
    }

    /**
     * Update app state
     */
    updateAppState() {
        // Update state object
        this.state.online = navigator.onLine;
        this.state.processing = this.state.backgroundTasks > 0;
        
        // Update UI based on state
        this.updateAppUI();
    }

    /**
     * ==================== EVENT HANDLING ====================
     */

    /**
     * Trigger an event
     */
    triggerEvent(eventName, data = {}) {
        if (!this.events[eventName]) {
            console.warn(`Event ${eventName} not registered`);
            return;
        }
        
        console.log(`🔔 Triggering event: ${eventName}`, data);
        
        // Call all registered callbacks
        this.events[eventName].forEach(callback => {
            try {
                callback(data);
            } catch (error) {
                console.error(`Error in event handler for ${eventName}:`, error);
            }
        });
    }

    /**
     * Subscribe to an event
     */
    on(eventName, callback) {
        if (!this.events[eventName]) {
            this.events[eventName] = [];
        }
        
        this.events[eventName].push(callback);
        
        // Return unsubscribe function
        return () => {
            const index = this.events[eventName].indexOf(callback);
            if (index > -1) {
                this.events[eventName].splice(index, 1);
            }
        };
    }

    /**
     * Handle action from data-action attribute
     */
    handleAction(action, element) {
        console.log(`🎯 Handling action: ${action}`);
        
        switch (action) {
            case 'upload':
                this.handleUploadAction();
                break;
                
            case 'create-folder':
                this.handleCreateFolder();
                break;
                
            case 'refresh':
                this.handleRefresh();
                break;
                
            case 'sync':
                this.handleSync();
                break;
                
            case 'search':
                this.handleSearch();
                break;
                
            case 'select-all':
                this.handleSelectAll();
                break;
                
            case 'deselect-all':
                this.handleDeselectAll();
                break;
                
            case 'delete-selected':
                this.handleDeleteSelected();
                break;
                
            case 'download-selected':
                this.handleDownloadSelected();
                break;
                
            case 'share-selected':
                this.handleShareSelected();
                break;
                
            case 'settings':
                this.handleSettings();
                break;
                
            case 'help':
                this.handleHelp();
                break;
                
            case 'about':
                this.handleAbout();
                break;
                
            case 'install':
                this.handleInstall();
                break;
                
            case 'feedback':
                this.handleFeedback();
                break;
                
            default:
                console.warn(`Unknown action: ${action}`);
        }
    }

    /**
     * Handle keyboard shortcuts
     */
    handleKeyboardShortcuts(event) {
        // Ignore if typing in input
        if (event.target.tagName === 'INPUT' || 
            event.target.tagName === 'TEXTAREA' ||
            event.target.isContentEditable) {
            return;
        }
        
        // Check for modifier keys
        const ctrl = event.ctrlKey || event.metaKey;
        const shift = event.shiftKey;
        const alt = event.altKey;
        
        // Define shortcuts
        switch (true) {
            // Navigation
            case event.key === 'Escape':
                event.preventDefault();
                this.handleEscape();
                break;
                
            case event.key === 'ArrowUp':
                if (ctrl) {
                    event.preventDefault();
                    this.navigateUp();
                }
                break;
                
            case event.key === 'ArrowDown':
                // Already handled by browser
                break;
                
            case event.key === 'Backspace':
                if (ctrl) {
                    event.preventDefault();
                    this.navigateUp();
                }
                break;
                
            // File operations
            case ctrl && event.key === 'u':
                event.preventDefault();
                this.handleUploadAction();
                break;
                
            case ctrl && event.key === 'n':
                event.preventDefault();
                this.handleCreateFolder();
                break;
                
            case ctrl && event.key === 'f':
                event.preventDefault();
                this.handleSearch();
                break;
                
            case ctrl && event.key === 'r':
                event.preventDefault();
                this.handleRefresh();
                break;
                
            case ctrl && event.key === 's':
                event.preventDefault();
                this.handleSync();
                break;
                
            case ctrl && event.key === 'a':
                event.preventDefault();
                this.handleSelectAll();
                break;
                
            case event.key === 'Delete':
                event.preventDefault();
                this.handleDeleteSelected();
                break;
                
            case ctrl && event.key === 'd':
                event.preventDefault();
                this.handleDownloadSelected();
                break;
                
            // Application
            case ctrl && shift && event.key === 'I':
                event.preventDefault();
                this.toggleDebugPanel();
                break;
                
            case ctrl && event.key === ',':
                event.preventDefault();
                this.handleSettings();
                break;
                
            case ctrl && event.key === 'h':
                event.preventDefault();
                this.handleHelp();
                break;
                
            case ctrl && event.key === '/':
                event.preventDefault();
                this.showKeyboardShortcuts();
                break;
        }
    }

    /**
     * Handle file upload
     */
    async handleFileUpload(event) {
        const files = event.target.files;
        if (!files.length) return;
        
        console.log(`📤 Uploading ${files.length} file(s)`);
        
        try {
            // Show upload progress
            this.ui?.showLoading(`Uploading ${files.length} file(s)...`);
            
            // Upload each file
            for (let i = 0; i < files.length; i++) {
                const file = files[i];
                
                // Validate file type
                if (this.config && !this.config.validateFileType(file.type)) {
                    this.ui?.showToast(`Skipped ${file.name}: Unsupported file type`, 'warning');
                    continue;
                }
                
                // Validate file size
                const maxSize = this.config?.app?.fileOperations?.maxUploadSize || 10 * 1024 * 1024 * 1024;
                if (file.size > maxSize) {
                    this.ui?.showToast(`Skipped ${file.name}: File too large`, 'error');
                    continue;
                }
                
                // Upload file
                if (this.drive) {
                    await this.drive.uploadFile(file);
                    
                    // Update progress
                    const progress = Math.round(((i + 1) / files.length) * 100);
                    this.ui?.showLoading(`Uploading... ${progress}% (${i + 1}/${files.length})`);
                }
            }
            
            // Complete
            this.ui?.hideLoading();
            this.ui?.showToast(`${files.length} file(s) uploaded successfully`, 'success');
            
            // Clear file input
            event.target.value = '';
            
        } catch (error) {
            console.error('Upload failed:', error);
            this.ui?.hideLoading();
            this.ui?.showToast('Upload failed', 'error');
        }
    }

    /**
     * Handle upload action
     */
    handleUploadAction() {
        const uploadInput = document.getElementById('upload-input');
        if (uploadInput) {
            uploadInput.click();
        }
    }

    /**
     * Handle create folder
     */
    async handleCreateFolder() {
        const folderName = await this.ui?.showPrompt({
            title: 'Create New Folder',
            message: 'Enter folder name:',
            defaultValue: 'New Folder',
            placeholder: 'Folder name'
        });
        
        if (folderName && this.drive) {
            try {
                await this.drive.createFolder(folderName);
                this.ui?.showToast(`Folder "${folderName}" created`, 'success');
            } catch (error) {
                console.error('Create folder failed:', error);
                this.ui?.showToast('Failed to create folder', 'error');
            }
        }
    }

    /**
     * Handle refresh
     */
    async handleRefresh() {
        console.log('🔄 Refreshing...');
        
        try {
            if (this.drive) {
                await this.drive.sync(true); // Force sync
                this.ui?.showToast('Refreshed successfully', 'success');
            }
        } catch (error) {
            console.error('Refresh failed:', error);
            this.ui?.showToast('Refresh failed', 'error');
        }
    }

    /**
     * Handle sync
     */
    async handleSync() {
        console.log('🔄 Manual sync requested');
        
        try {
            if (this.drive) {
                await this.drive.sync();
                this.ui?.showToast('Sync completed', 'success');
            }
        } catch (error) {
            console.error('Sync failed:', error);
            this.ui?.showToast('Sync failed', 'error');
        }
    }

    /**
     * Handle search
     */
    handleSearch() {
        const searchInput = document.getElementById('search-input');
        if (searchInput) {
            searchInput.focus();
            searchInput.select();
        }
    }

    /**
     * Handle select all
     */
    handleSelectAll() {
        console.log('✅ Select all');
        // Implementation depends on your file selection logic
        document.querySelectorAll('.file-item').forEach(item => {
            item.classList.add('selected');
        });
    }

    /**
     * Handle deselect all
     */
    handleDeselectAll() {
        console.log('❌ Deselect all');
        document.querySelectorAll('.file-item.selected').forEach(item => {
            item.classList.remove('selected');
        });
    }

    /**
     * Handle delete selected
     */
    async handleDeleteSelected() {
        const selectedItems = document.querySelectorAll('.file-item.selected');
        if (selectedItems.length === 0) {
            this.ui?.showToast('No files selected', 'warning');
            return;
        }
        
        const confirmed = await this.ui?.showConfirm({
            title: 'Delete Files',
            message: `Are you sure you want to delete ${selectedItems.length} item(s)? This action cannot be undone.`,
            okText: 'Delete',
            cancelText: 'Cancel'
        });
        
        if (confirmed && this.drive) {
            try {
                this.ui?.showLoading(`Deleting ${selectedItems.length} item(s)...`);
                
                for (const item of selectedItems) {
                    const fileId = item.dataset.id;
                    const fileName = item.querySelector('.file-name')?.textContent || 'Unknown';
                    
                    await this.drive.deleteFile(fileId, fileName);
                }
                
                this.ui?.hideLoading();
                this.ui?.showToast(`${selectedItems.length} item(s) deleted`, 'success');
                
            } catch (error) {
                console.error('Delete failed:', error);
                this.ui?.hideLoading();
                this.ui?.showToast('Delete failed', 'error');
            }
        }
    }

    /**
     * Handle download selected
     */
    async handleDownloadSelected() {
        const selectedItems = document.querySelectorAll('.file-item.selected:not([data-type="folder"])');
        if (selectedItems.length === 0) {
            this.ui?.showToast('No files selected for download', 'warning');
            return;
        }
        
        if (selectedItems.length > 5) {
            const confirmed = await this.ui?.showConfirm({
                title: 'Multiple Downloads',
                message: `You're about to download ${selectedItems.length} files. This may take a while. Continue?`,
                okText: 'Download All',
                cancelText: 'Cancel'
            });
            
            if (!confirmed) return;
        }
        
        try {
            this.ui?.showLoading(`Downloading ${selectedItems.length} file(s)...`);
            
            if (this.drive) {
                for (const item of selectedItems) {
                    const fileId = item.dataset.id;
                    const fileName = item.querySelector('.file-name')?.textContent || 'Unknown';
                    
                    await this.drive.downloadFile(fileId, fileName);
                }
            }
            
            this.ui?.hideLoading();
            this.ui?.showToast(`${selectedItems.length} file(s) downloaded`, 'success');
            
        } catch (error) {
            console.error('Download failed:', error);
            this.ui?.hideLoading();
            this.ui?.showToast('Download failed', 'error');
        }
    }

    /**
     * Handle share selected
     */
    handleShareSelected() {
        const selectedItems = document.querySelectorAll('.file-item.selected:not([data-type="folder"])');
        if (selectedItems.length === 0) {
            this.ui?.showToast('No files selected to share', 'warning');
            return;
        }
        
        if (selectedItems.length === 1) {
            const item = selectedItems[0];
            const fileId = item.dataset.id;
            const fileName = item.querySelector('.file-name')?.textContent || 'Unknown';
            
            this.shareFile(fileId, fileName);
        } else {
            this.ui?.showToast('Multi-file sharing coming soon!', 'info');
        }
    }

    /**
     * Handle settings
     */
    handleSettings() {
        this.ui?.showSettingsModal();
    }

    /**
     * Handle help
     */
    handleHelp() {
        window.open('https://github.com/KhademsOrder/Cvault/wiki', '_blank');
    }

    /**
     * Handle about
     */
    handleAbout() {
        const version = this.config?.app?.version || '3.0.0';
        const message = `
Vault OS Ultimate v${version}

A secure Google Drive client with advanced features:
• End-to-end encryption (coming soon)
• Media viewing and editing
• Cross-platform sync
• Offline access

Developed with ❤️ by the Vault Team
        `.trim();
        
        this.ui?.showAlert(message, 'About Vault OS');
    }

    /**
     * Handle install (PWA)
     */
    handleInstall() {
        if (this.deferredPrompt) {
            this.deferredPrompt.prompt();
            
            this.deferredPrompt.userChoice.then((choiceResult) => {
                if (choiceResult.outcome === 'accepted') {
                    console.log('User accepted install');
                } else {
                    console.log('User dismissed install');
                }
                this.deferredPrompt = null;
            });
        } else {
            this.ui?.showToast('App is already installed or not available', 'info');
        }
    }

    /**
     * Handle feedback
     */
    handleFeedback() {
        const email = 'support@vaultos.com';
        const subject = 'Vault OS Feedback';
        const body = `\n\n---\nVersion: ${this.config?.app?.version || '3.0.0'}\nBrowser: ${navigator.userAgent}`;
        
        window.open(`mailto:${email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`, '_blank');
    }

    /**
     * Handle escape key
     */
    handleEscape() {
        // Close modals
        this.ui?.closeAllModals();
        
        // Clear search
        const searchInput = document.getElementById('search-input');
        if (searchInput && searchInput.value) {
            searchInput.value = '';
            if (this.drive) {
                this.drive.loadFiles();
            }
        }
        
        // Deselect all
        this.handleDeselectAll();
    }

    /**
     * Navigate up one folder level
     */
    navigateUp() {
        if (this.drive) {
            this.drive.navigateUp();
        }
    }

    /**
     * Navigate to route
     */
    navigateTo(route) {
        console.log(`📍 Navigating to: ${route}`);
        
        switch (route) {
            case 'home':
                if (this.drive) {
                    this.drive.navigateToFolder('root', 'My Drive');
                }
                break;
                
            case 'recent':
                this.ui?.showToast('Recent files view coming soon!', 'info');
                break;
                
            case 'starred':
                this.ui?.showToast('Starred files view coming soon!', 'info');
                break;
                
            case 'trash':
                this.ui?.showToast('Trash view coming soon!', 'info');
                break;
                
            case 'settings':
                this.handleSettings();
                break;
                
            case 'help':
                this.handleHelp();
                break;
                
            case 'logout':
                if (this.auth) {
                    this.auth.logout();
                }
                break;
        }
    }

    /**
     * ==================== BACKGROUND SERVICES ====================
     */

    /**
     * Run background sync
     */
    async runBackgroundSync() {
        if (!this.drive || !this.state.online || this.drive.isSyncing) {
            return;
        }
        
        try {
            console.log('🔄 Running background sync');
            this.state.backgroundTasks++;
            
            // Trigger sync event
            this.triggerEvent('drive:sync-start');
            
            await this.drive.sync();
            this.state.lastSync = Date.now();
            
            // Trigger completion event
            this.triggerEvent('drive:sync-complete', {
                timestamp: this.state.lastSync
            });
            
        } catch (error) {
            console.error('Background sync failed:', error);
            this.triggerEvent('drive:sync-error', { error });
        } finally {
            this.state.backgroundTasks--;
            this.updateAppState();
        }
    }

    /**
     * Backup settings
     */
    backupSettings() {
        try {
            console.log('💾 Backing up settings');
            
            // Get all settings
            const settings = {
                ui: localStorage.getItem('vault_ui_settings'),
                theme: localStorage.getItem('vault_theme_settings'),
                app: localStorage.getItem('vault_app_settings_v3'),
                timestamp: Date.now()
            };
            
            // Save to backup storage
            localStorage.setItem('vault_settings_backup', JSON.stringify(settings));
            this.state.lastBackup = Date.now();
            
            console.log('✅ Settings backed up');
            
        } catch (error) {
            console.error('Settings backup failed:', error);
        }
    }

    /**
     * Cleanup temporary files
     */
    cleanupTempFiles() {
        try {
            console.log('🧹 Cleaning up temporary files');
            
            // Clear old cache entries
            const now = Date.now();
            const cacheKeys = Object.keys(localStorage).filter(key => 
                key.startsWith('vault_cache_') || key.startsWith('temp_')
            );
            
            let cleaned = 0;
            cacheKeys.forEach(key => {
                try {
                    const item = JSON.parse(localStorage.getItem(key));
                    if (item && item.timestamp && (now - item.timestamp) > 24 * 60 * 60 * 1000) {
                        localStorage.removeItem(key);
                        cleaned++;
                    }
                } catch (e) {
                    // Invalid JSON, remove it
                    localStorage.removeItem(key);
                    cleaned++;
                }
            });
            
            if (cleaned > 0) {
                console.log(`✅ Cleaned up ${cleaned} temporary files`);
            }
            
        } catch (error) {
            console.error('Cleanup failed:', error);
        }
    }

    /**
     * Run health check
     */
    runHealthCheck() {
        try {
            console.log('❤️ Running health check');
            
            const health = {
                timestamp: Date.now(),
                online: this.state.online,
                auth: !!this.auth?.isLoggedIn(),
                drive: !!this.drive,
                storage: navigator.storage ? true : false,
                serviceWorker: 'serviceWorker' in navigator,
                errors: this.errorTracker.length,
                warnings: this.state.warnings.length,
                localStorage: this.checkLocalStorage()
            };
            
            // Log health status
            console.log('Health check:', health);
            
            // Trigger event
            this.triggerEvent('app:health-check', health);
            
            // Handle issues
            if (!health.localStorage.available) {
                this.handleStorageFull();
            }
            
        } catch (error) {
            console.error('Health check failed:', error);
        }
    }

    /**
     * Check localStorage status
     */
    checkLocalStorage() {
        try {
            const testKey = 'vault_test_' + Date.now();
            localStorage.setItem(testKey, 'test');
            localStorage.removeItem(testKey);
            
            // Check available space
            let total = 0;
            for (let key in localStorage) {
                if (localStorage.hasOwnProperty(key)) {
                    total += localStorage[key].length * 2; // Approximate bytes
                }
            }
            
            return {
                available: true,
                used: total,
                limit: 5 * 1024 * 1024 // 5MB typical limit
            };
            
        } catch (error) {
            return {
                available: false,
                error: error.message
            };
        }
    }

    /**
     * ==================== PWA FEATURES ====================
     */

    /**
     * Show install prompt
     */
    showInstallPrompt() {
        const installBtn = document.getElementById('install-btn');
        if (installBtn) {
            installBtn.classList.remove('hidden');
            installBtn.addEventListener('click', () => this.handleInstall());
        }
    }

    /**
     * Show update prompt
     */
    showUpdatePrompt() {
        this.ui?.showConfirm({
            title: 'Update Available',
            message: 'A new version of Vault OS is available. Update now?',
            okText: 'Update',
            cancelText: 'Later'
        }).then(update => {
            if (update && 'serviceWorker' in navigator) {
                navigator.serviceWorker.ready.then(registration => {
                    registration.update();
                    window.location.reload();
                });
            }
        });
    }

    /**
     * Handle online status
     */
    handleOnline() {
        console.log('🌐 App is online');
        this.state.online = true;
        this.updateAppState();
        this.triggerEvent('network:online');
        
        // Show notification
        this.ui?.showToast('Back online', 'success');
        
        // Sync if needed
        if (this.drive && !this.drive.isSyncing) {
            setTimeout(() => this.drive.sync(), 1000);
        }
    }

    /**
     * Handle offline status
     */
    handleOffline() {
        console.log('📴 App is offline');
        this.state.online = false;
        this.updateAppState();
        this.triggerEvent('network:offline');
        
        // Show notification
        this.ui?.showToast('You are offline', 'warning');
    }

    /**
     * ==================== ERROR HANDLING ====================
     */

    /**
     * Handle error
     */
    handleError(error, context = {}) {
        console.error('❌ Error occurred:', error, context);
        
        // Add to error tracker
        const errorEntry = {
            timestamp: Date.now(),
            error: error.message || error.toString(),
            stack: error.stack,
            context: context,
            url: window.location.href
        };
        
        this.errorTracker.push(errorEntry);
        
        // Keep only last 100 errors
        if (this.errorTracker.length > 100) {
            this.errorTracker.shift();
        }
        
        // Trigger error event
        this.triggerEvent('app:error', errorEntry);
        
        // Show error to user (if not in background)
        if (!context.background) {
            this.ui?.showToast(`Error: ${error.message || 'Unknown error'}`, 'error');
        }
        
        // Log to server if online
        if (this.state.online) {
            this.logErrorToServer(errorEntry);
        }
    }

    /**
     * Handle fatal error
     */
    handleFatalError(error) {
        console.error('💀 Fatal error:', error);
        
        // Show error screen
        document.body.innerHTML = `
            <div class="error-screen">
                <div class="error-content">
                    <h1>😞 Something went wrong</h1>
                    <p>Vault OS encountered a critical error and cannot continue.</p>
                    <pre>${error.message || 'Unknown error'}</pre>
                    <div class="error-actions">
                        <button id="reload-btn" class="btn btn-primary">Reload App</button>
                        <button id="reset-btn" class="btn btn-secondary">Reset App</button>
                    </div>
                </div>
            </div>
        `;
        
        // Add event listeners
        document.getElementById('reload-btn')?.addEventListener('click', () => {
            window.location.reload();
        });
        
        document.getElementById('reset-btn')?.addEventListener('click', async () => {
            if (confirm('This will clear all local data. Are you sure?')) {
                localStorage.clear();
                window.location.reload();
            }
        });
    }

    /**
     * Log error to server
     */
    async logErrorToServer(errorEntry) {
        // This is a placeholder for server error logging
        // In production, you would send this to your error tracking service
        console.log('Logging error to server:', errorEntry);
    }

    /**
     * Handle storage full
     */
    handleStorageFull() {
        console.warn('Storage is full or unavailable');
        this.ui?.showToast('Local storage is full. Some features may not work.', 'warning');
    }

    /**
     * ==================== UTILITY METHODS ====================
     */

    /**
     * Set up drag and drop
     */
    setupDragAndDrop() {
        const dropZone = document.getElementById('drop-zone');
        if (!dropZone) return;
        
        // Create drop zone if it doesn't exist
        if (!dropZone) {
            const dz = document.createElement('div');
            dz.id = 'drop-zone';
            dz.className = 'drop-zone hidden';
            dz.innerHTML = '<div class="drop-message">📤 Drop files here to upload</div>';
            document.body.appendChild(dropZone);
        }
        
        // Drag enter
        document.addEventListener('dragenter', (e) => {
            if (e.dataTransfer.types.includes('Files')) {
                dropZone.classList.remove('hidden');
                e.preventDefault();
            }
        });
        
        // Drag over
        document.addEventListener('dragover', (e) => {
            if (e.dataTransfer.types.includes('Files')) {
                dropZone.classList.add('drag-over');
                e.preventDefault();
            }
        });
        
        // Drag leave
        dropZone.addEventListener('dragleave', () => {
            dropZone.classList.remove('drag-over');
        });
        
        // Drop
        dropZone.addEventListener('drop', (e) => {
            e.preventDefault();
            dropZone.classList.remove('drag-over', 'hidden');
            
            const files = e.dataTransfer.files;
            if (files.length > 0) {
                this.handleFileUpload({ target: { files } });
            }
        });
    }

    /**
     * Handle page load
     */
    handlePageLoad() {
        console.log('📄 Page loaded');
        
        // Update online status
        this.state.online = navigator.onLine;
        this.updateAppState();
        
        // Trigger app loaded event
        this.triggerEvent('app:loaded');
    }

    /**
     * Handle before unload
     */
    handleBeforeUnload(event) {
        if (this.state.processing) {
            // Warn user if there are background tasks
            event.preventDefault();
            event.returnValue = 'There are operations in progress. Are you sure you want to leave?';
            return event.returnValue;
        }
    }

    /**
     * Handle visibility change
     */
    handleVisibilityChange() {
        if (document.hidden) {
            console.log('😴 App went to background');
            this.triggerEvent('app:sleep');
        } else {
            console.log('👀 App came to foreground');
            this.triggerEvent('app:wake');
            
            // Refresh data if been away for a while
            if (this.state.lastSync && (Date.now() - this.state.lastSync) > 5 * 60 * 1000) {
                this.handleRefresh();
            }
        }
    }

    /**
     * Share file
     */
    async shareFile(fileId, fileName) {
        try {
            if (navigator.share) {
                // Use Web Share API
                await navigator.share({
                    title: fileName,
                    text: 'Check out this file from Vault OS',
                    url: window.location.origin + '/share/' + fileId
                });
            } else {
                // Fallback: copy link to clipboard
                const shareUrl = window.location.origin + '/share/' + fileId;
                await navigator.clipboard.writeText(shareUrl);
                this.ui?.showToast('Link copied to clipboard', 'success');
            }
        } catch (error) {
            console.error('Share failed:', error);
            this.ui?.showToast('Share failed', 'error');
        }
    }

    /**
     * Toggle debug panel
     */
    toggleDebugPanel() {
        const debugToggle = document.getElementById('debug-toggle');
        if (debugToggle) {
            debugToggle.checked = !debugToggle.checked;
            debugToggle.dispatchEvent(new Event('change'));
        }
    }

    /**
     * Show keyboard shortcuts
     */
    showKeyboardShortcuts() {
        const shortcuts = [
            ['Ctrl + N', 'Create new folder'],
            ['Ctrl + U', 'Upload files'],
            ['Ctrl + F', 'Search files'],
            ['Ctrl + R', 'Refresh'],
            ['Ctrl + S', 'Sync now'],
            ['Ctrl + A', 'Select all'],
            ['Delete', 'Delete selected'],
            ['Ctrl + D', 'Download selected'],
            ['Ctrl + ,', 'Settings'],
            ['Ctrl + H', 'Help'],
            ['Ctrl + /', 'Show shortcuts'],
            ['Esc', 'Cancel/close'],
            ['Backspace', 'Go up one folder']
        ];
        
        let html = '<h3>Keyboard Shortcuts</h3><table class="shortcuts-table">';
        shortcuts.forEach(([key, action]) => {
            html += `<tr><td><kbd>${key}</kbd></td><td>${action}</td></tr>`;
        });
        html += '</table>';
        
        this.ui?.showAlert(html, 'Keyboard Shortcuts');
    }

    /**
     * Get app statistics
     */
    getStats() {
        return {
            errors: this.errorTracker.length,
            warnings: this.state.warnings.length,
            lastSync: this.state.lastSync,
            lastBackup: this.state.lastBackup,
            backgroundTasks: this.state.backgroundTasks,
            online: this.state.online,
            initialized: this.state.initialized,
            isPWA: this.isPWA
        };
    }

    /**
     * Export app data
     */
    exportData() {
        const data = {
            config: this.config,
            settings: this.settings,
            stats: this.getStats(),
            errors: this.errorTracker,
            timestamp: Date.now()
        };
        
        const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `vault-backup-${Date.now()}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        
        this.ui?.showToast('Data exported successfully', 'success');
    }

    /**
     * Import app data
     */
    async importData(file) {
        try {
            const text = await file.text();
            const data = JSON.parse(text);
            
            // Validate data
            if (!data.timestamp || !data.config) {
                throw new Error('Invalid backup file');
            }
            
            // Confirm import
            const confirmed = await this.ui?.showConfirm({
                title: 'Import Data',
                message: 'This will overwrite your current settings. Continue?',
                okText: 'Import',
                cancelText: 'Cancel'
            });
            
            if (confirmed) {
                // Apply settings
                if (data.settings) {
                    localStorage.setItem('vault_ui_settings', JSON.stringify(data.settings));
                }
                
                // Reload app
                window.location.reload();
            }
            
        } catch (error) {
            console.error('Import failed:', error);
            this.ui?.showToast('Failed to import data', 'error');
        }
    }
}

// Create and export global instance
window.VaultApp = VaultApp;

// Auto-initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    window.app = new VaultApp();
});

// Export for module systems
if (typeof module !== 'undefined' && module.exports) {
    module.exports = VaultApp;
}

console.log('APP.JS loaded successfully');

