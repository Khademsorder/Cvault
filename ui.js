/* =========================================
   VAULT OS - UI MODULE
   Interface Components & Navigation
   ========================================= */

class UIManager {
    constructor() {
        this.currentTab = 'home';
        this.sidebarOpen = false;
        this.fabMenuOpen = false;
        this.modalOpen = false;
        this.isMobile = this.checkMobile();
        this.currentView = 'grid';
        this.selectedCategory = 'all';
        this.theme = 'cyber';
        
        // Initialize
        this.init();
    }
    
    init() {
        // Detect mobile
        this.detectMobile();
        
        // Setup event listeners
        this.setupEventListeners();
        
        // Apply saved settings
        this.applySettings();
        
        // Apply saved theme
        this.applyTheme();
        
        // Initialize components
        this.initComponents();
        
        // Update UI based on authentication
        this.updateAuthUI();
    }
    
    setupEventListeners() {
        // Menu toggle
        document.getElementById('menu-toggle')?.addEventListener('click', () => {
            this.toggleSidebar();
        });
        
        // Tab navigation - Desktop
        document.querySelectorAll('.menu-item[data-tab]').forEach(element => {
            element.addEventListener('click', (e) => {
                e.preventDefault();
                const tab = e.currentTarget.dataset.tab;
                this.switchTab(tab);
            });
        });
        
        // Tab navigation - Mobile
        document.querySelectorAll('.nav-item[data-tab]').forEach(element => {
            element.addEventListener('click', (e) => {
                e.preventDefault();
                const tab = e.currentTarget.dataset.tab;
                this.switchTab(tab);
            });
        });
        
        // FAB menu
        document.getElementById('fab-main')?.addEventListener('click', () => {
            this.toggleFabMenu();
        });
        
        // Close FAB menu when clicking outside
        document.addEventListener('click', (e) => {
            if (!e.target.closest('.fab-container')) {
                this.closeFabMenu();
            }
        });
        
        // FAB menu items
        document.getElementById('upload-file-btn')?.addEventListener('click', () => {
            this.triggerFileUpload();
            this.closeFabMenu();
        });
        
        document.getElementById('upload-folder-btn')?.addEventListener('click', () => {
            this.triggerFolderUpload();
            this.closeFabMenu();
        });
        
        document.getElementById('create-folder-btn')?.addEventListener('click', () => {
            this.createFolder();
            this.closeFabMenu();
        });
        
        document.getElementById('create-note-btn')?.addEventListener('click', () => {
            this.createNote();
            this.closeFabMenu();
        });
        
        // Modal close buttons
        document.querySelectorAll('.btn-close').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const modal = e.target.closest('.modal');
                this.closeModal(modal);
            });
        });
        
        // Escape key to close modals
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                this.closeAllModals();
                this.closeFabMenu();
                this.closeSidebar();
            }
        });
        
        // Settings tabs
        document.querySelectorAll('.settings-tab').forEach(tab => {
            tab.addEventListener('click', () => {
                this.switchSettingsTab(tab.dataset.tab);
            });
        });
        
        // Save settings
        document.getElementById('save-settings')?.addEventListener('click', () => {
            this.saveSettings();
        });
        
        // Reset settings
        document.getElementById('reset-settings')?.addEventListener('click', () => {
            this.resetSettings();
        });
        
        // Change PIN
        document.getElementById('change-pin-btn')?.addEventListener('click', () => {
            this.showPinChangeModal();
        });
        
        // Cancel PIN change
        document.getElementById('cancel-pin-change')?.addEventListener('click', () => {
            this.closePinChangeModal();
        });
        
        // Save PIN change
        document.getElementById('save-pin-change')?.addEventListener('click', () => {
            this.savePinChange();
        });
        
        // Gallery categories
        document.querySelectorAll('.category-card').forEach(card => {
            card.addEventListener('click', () => {
                this.filterGallery(card.dataset.type);
            });
        });
        
        // Manage drive from settings
        document.getElementById('manage-drive-settings')?.addEventListener('click', () => {
            this.showDriveConnectionModal();
        });
        
        // Connect drive from header
        document.getElementById('drive-status-toggle')?.addEventListener('click', (e) => {
            e.stopPropagation();
            this.toggleDriveStatusDropdown();
        });
        
        // Close drive dropdown when clicking outside
        document.addEventListener('click', (e) => {
            if (!e.target.closest('.drive-status-container')) {
                this.hideDriveStatusDropdown();
            }
        });
        
        // Reconnect drive
        document.getElementById('reconnect-drive')?.addEventListener('click', () => {
            this.showDriveConnectionModal();
            this.hideDriveStatusDropdown();
        });
        
        // Manage drive
        document.getElementById('manage-drive')?.addEventListener('click', () => {
            this.showSettingsModal();
            this.hideDriveStatusDropdown();
        });
        
        // View toggle buttons
        document.getElementById('view-grid')?.addEventListener('click', () => {
            this.switchView('grid');
        });
        
        document.getElementById('view-list')?.addEventListener('click', () => {
            this.switchView('list');
        });
        
        // Sort and filter
        document.getElementById('sort-select')?.addEventListener('change', (e) => {
            this.handleSortChange(e.target.value);
        });
        
        document.getElementById('filter-select')?.addEventListener('change', (e) => {
            this.handleFilterChange(e.target.value);
        });
        
        // Upgrade storage
        document.getElementById('upgrade-storage')?.addEventListener('click', () => {
            this.showUpgradeModal();
        });
        
        // Window resize for responsive design
        window.addEventListener('resize', () => {
            this.handleResize();
        });
        
        // Close sidebar on mobile when clicking outside
        document.addEventListener('click', (e) => {
            if (this.isMobile && this.sidebarOpen) {
                if (!e.target.closest('.sidebar') && !e.target.closest('#menu-toggle')) {
                    this.closeSidebar();
                }
            }
        });
    }
    
    initComponents() {
        // Initialize dark mode if enabled
        this.initDarkMode();
        
        // Initialize view based on saved preference
        this.initView();
        
        // Initialize sort and filter
        this.initSortFilter();
    }
    
    switchTab(tab) {
        // Update current tab
        this.currentTab = tab;
        
        // Update UI
        this.updateTabUI();
        
        // Load appropriate content
        this.loadTabContent(tab);
        
        // Close sidebar on mobile
        if (this.isMobile) {
            this.closeSidebar();
        }
    }
    
    updateTabUI() {
        // Update sidebar menu (desktop)
        document.querySelectorAll('.menu-item').forEach(item => {
            item.classList.toggle('active', item.dataset.tab === this.currentTab);
        });
        
        // Update bottom navigation (mobile)
        document.querySelectorAll('.nav-item').forEach(item => {
            item.classList.toggle('active', item.dataset.tab === this.currentTab);
        });
        
        // Update main content header
        this.updateMainContentHeader();
        
        // Show/hide appropriate sections
        this.updateMainContent();
    }
    
    updateMainContentHeader() {
        const breadcrumbs = document.getElementById('breadcrumbs');
        const viewControls = document.querySelector('.view-controls');
        const galleryCategories = document.getElementById('gallery-categories');
        
        if (!breadcrumbs || !viewControls) return;
        
        switch (this.currentTab) {
            case 'home':
                breadcrumbs.classList.remove('hidden');
                viewControls.classList.remove('hidden');
                if (galleryCategories) galleryCategories.classList.add('hidden');
                break;
                
            case 'recent':
                breadcrumbs.classList.add('hidden');
                viewControls.classList.remove('hidden');
                if (galleryCategories) galleryCategories.classList.add('hidden');
                break;
                
            case 'gallery':
                breadcrumbs.classList.add('hidden');
                viewControls.classList.add('hidden');
                if (galleryCategories) galleryCategories.classList.remove('hidden');
                break;
                
            case 'shared':
                breadcrumbs.classList.remove('hidden');
                viewControls.classList.remove('hidden');
                if (galleryCategories) galleryCategories.classList.add('hidden');
                break;
                
            case 'trash':
                breadcrumbs.classList.remove('hidden');
                viewControls.classList.remove('hidden');
                if (galleryCategories) galleryCategories.classList.add('hidden');
                break;
                
            case 'settings':
                breadcrumbs.classList.add('hidden');
                viewControls.classList.add('hidden');
                if (galleryCategories) galleryCategories.classList.add('hidden');
                break;
        }
    }
    
    updateMainContent() {
        // Hide all tab-specific content
        this.hideAllTabContent();
        
        // Show content for current tab
        switch (this.currentTab) {
            case 'home':
            case 'recent':
            case 'shared':
            case 'trash':
                this.showFileBrowser();
                break;
            case 'gallery':
                this.showGallery();
                break;
            case 'settings':
                this.showSettings();
                break;
        }
    }
    
    hideAllTabContent() {
        // Hide all tab-specific containers
        const containers = [
            'file-container',
            'gallery-categories',
            'settings-content'
        ];
        
        containers.forEach(id => {
            const element = document.getElementById(id);
            if (element) element.classList.add('hidden');
        });
    }
    
    showFileBrowser() {
        const fileContainer = document.querySelector('.file-container');
        if (fileContainer) {
            fileContainer.classList.remove('hidden');
        }
        
        // Load files for current tab
        this.loadFilesForTab();
    }
    
    showGallery() {
        const galleryCategories = document.getElementById('gallery-categories');
        const fileContainer = document.querySelector('.file-container');
        
        if (galleryCategories) galleryCategories.classList.remove('hidden');
        if (fileContainer) fileContainer.classList.remove('hidden');
        
        // Load gallery files
        this.loadGalleryFiles();
    }
    
    showSettings() {
        this.openSettingsModal();
    }
    
    loadTabContent(tab) {
        switch (tab) {
            case 'home':
                this.loadHomeFiles();
                break;
            case 'recent':
                this.loadRecentFiles();
                break;
            case 'gallery':
                this.loadGalleryFiles();
                break;
            case 'shared':
                this.loadSharedFiles();
                break;
            case 'trash':
                this.loadTrashFiles();
                break;
        }
    }
    
    async loadHomeFiles() {
        if (window.Drive) {
            await Drive.loadFiles();
        } else {
            this.showError('Drive module not loaded');
        }
    }
    
    async loadRecentFiles() {
        try {
            if (!window.Drive) {
                this.showError('Drive module not loaded');
                return;
            }
            
            // Get all files and sort by modification date
            const files = Drive.getFiles();
            const recentFiles = [...files]
                .sort((a, b) => b.modified - a.modified)
                .slice(0, 50); // Show last 50 files
            
            // Update display
            this.displayFiles(recentFiles, 'Recent Files');
            
        } catch (error) {
            console.error('Load recent files error:', error);
            this.showError('Failed to load recent files');
        }
    }
    
    async loadGalleryFiles() {
        try {
            if (!window.Drive) {
                this.showError('Drive module not loaded');
                return;
            }
            
            // Get all files
            const files = Drive.getFiles();
            
            // Filter by type for each category
            const imageFiles = files.filter(f => f.type === 'image');
            const videoFiles = files.filter(f => f.type === 'video');
            const audioFiles = files.filter(f => f.type === 'audio');
            const documentFiles = files.filter(f => f.type === 'document');
            
            // Update category counts
            this.updateGalleryCounts({
                image: imageFiles.length,
                video: videoFiles.length,
                audio: audioFiles.length,
                document: documentFiles.length
            });
            
            // Show all files initially or filtered by selected category
            if (this.selectedCategory === 'all') {
                this.displayFiles(files, 'Gallery');
            } else {
                const filtered = files.filter(file => file.type === this.selectedCategory);
                this.displayFiles(filtered, this.getCategoryName(this.selectedCategory));
            }
            
        } catch (error) {
            console.error('Load gallery files error:', error);
            this.showError('Failed to load gallery files');
        }
    }
    
    async loadSharedFiles() {
        try {
            if (!window.Drive) {
                this.showError('Drive module not loaded');
                return;
            }
            
            // Get shared files
            const files = Drive.getFiles();
            const sharedFiles = files.filter(f => f.shared);
            
            // Update badge count
            this.updateBadge('shared-count', sharedFiles.length);
            
            // Display files
            this.displayFiles(sharedFiles, 'Shared Files');
            
        } catch (error) {
            console.error('Load shared files error:', error);
            this.showError('Failed to load shared files');
        }
    }
    
    async loadTrashFiles() {
        try {
            // Note: Google Drive API doesn't have a trash endpoint in v3
            // We'll show empty state for now
            this.showEmptyState('trash');
            
            // Update badge count (for demo, use 0)
            this.updateBadge('trash-count', 0);
            
        } catch (error) {
            console.error('Load trash files error:', error);
            this.showError('Failed to load trash files');
        }
    }
    
    loadFilesForTab() {
        switch (this.currentTab) {
            case 'home':
                this.loadHomeFiles();
                break;
            case 'recent':
                this.loadRecentFiles();
                break;
            case 'shared':
                this.loadSharedFiles();
                break;
            case 'trash':
                this.loadTrashFiles();
                break;
        }
    }
    
    displayFiles(files, title = '') {
        if (!window.Drive) return;
        
        if (files.length === 0) {
            this.showEmptyState('empty');
            return;
        }
        
        // Update Drive's files array temporarily
        const originalFiles = Drive.files;
        Drive.files = files;
        
        // Render files
        Drive.renderFiles();
        
        // Restore original files
        Drive.files = originalFiles;
        
        // Update title if provided
        if (title) {
            document.getElementById('current-crumb').textContent = title;
        }
    }
    
    updateGalleryCounts(counts) {
        document.getElementById('image-count').textContent = `${counts.image} file${counts.image !== 1 ? 's' : ''}`;
        document.getElementById('video-count').textContent = `${counts.video} file${counts.video !== 1 ? 's' : ''}`;
        document.getElementById('audio-count').textContent = `${counts.audio} file${counts.audio !== 1 ? 's' : ''}`;
        document.getElementById('doc-count').textContent = `${counts.document} file${counts.document !== 1 ? 's' : ''}`;
    }
    
    getCategoryName(type) {
        const names = {
            'image': 'Photos',
            'video': 'Videos',
            'audio': 'Audio',
            'document': 'Documents',
            'all': 'All Files'
        };
        return names[type] || type;
    }
    
    updateBadge(elementId, count) {
        const element = document.getElementById(elementId);
        if (element) {
            if (count > 0) {
                element.textContent = count;
                element.classList.remove('hidden');
            } else {
                element.classList.add('hidden');
            }
        }
    }
    
    filterGallery(type) {
        // Update active category
        document.querySelectorAll('.category-card').forEach(card => {
            card.classList.toggle('active', card.dataset.type === type);
        });
        
        this.selectedCategory = type;
        
        // Load filtered files
        this.loadGalleryFiles();
    }
    
    toggleSidebar() {
        this.sidebarOpen = !this.sidebarOpen;
        const sidebar = document.getElementById('sidebar');
        
        if (sidebar) {
            sidebar.classList.toggle('active', this.sidebarOpen);
        }
        
        // Update menu icon
        const menuIcon = document.querySelector('#menu-toggle i');
        if (menuIcon) {
            menuIcon.className = this.sidebarOpen ? 'fas fa-times' : 'fas fa-bars';
        }
    }
    
    closeSidebar() {
        this.sidebarOpen = false;
        const sidebar = document.getElementById('sidebar');
        
        if (sidebar) {
            sidebar.classList.remove('active');
        }
        
        // Update menu icon
        const menuIcon = document.querySelector('#menu-toggle i');
        if (menuIcon) {
            menuIcon.className = 'fas fa-bars';
        }
    }
    
    toggleFabMenu() {
        this.fabMenuOpen = !this.fabMenuOpen;
        const fabMenu = document.getElementById('fab-menu');
        const fabIcon = document.getElementById('fab-icon');
        
        if (fabMenu && fabIcon) {
            fabMenu.classList.toggle('hidden', !this.fabMenuOpen);
            
            if (this.fabMenuOpen) {
                fabIcon.className = 'fas fa-times';
                fabIcon.style.transform = 'rotate(90deg)';
            } else {
                fabIcon.className = 'fas fa-plus';
                fabIcon.style.transform = 'rotate(0deg)';
            }
        }
    }
    
    closeFabMenu() {
        this.fabMenuOpen = false;
        const fabMenu = document.getElementById('fab-menu');
        const fabIcon = document.getElementById('fab-icon');
        
        if (fabMenu) fabMenu.classList.add('hidden');
        if (fabIcon) {
            fabIcon.className = 'fas fa-plus';
            fabIcon.style.transform = 'rotate(0deg)';
        }
    }
    
    openSettingsModal() {
        this.modalOpen = true;
        const modal = document.getElementById('settings-modal');
        
        if (modal) {
            modal.classList.remove('hidden');
            this.loadSettingsIntoUI();
        }
    }
    
    closeSettingsModal() {
        this.modalOpen = false;
        const modal = document.getElementById('settings-modal');
        
        if (modal) {
            modal.classList.add('hidden');
        }
    }
    
    showPinChangeModal() {
        const modal = document.getElementById('pin-change-modal');
        
        if (modal) {
            modal.classList.remove('hidden');
            
            // Clear inputs
            document.getElementById('current-pin-input').value = '';
            document.getElementById('new-pin-input').value = '';
            document.getElementById('confirm-pin-input').value = '';
            
            // Hide error
            document.getElementById('pin-change-error').classList.add('hidden');
            
            // Focus on current PIN input
            setTimeout(() => {
                document.getElementById('current-pin-input').focus();
            }, 100);
        }
    }
    
    closePinChangeModal() {
        const modal = document.getElementById('pin-change-modal');
        if (modal) {
            modal.classList.add('hidden');
        }
    }
    
    async savePinChange() {
        const currentPin = document.getElementById('current-pin-input').value;
        const newPin = document.getElementById('new-pin-input').value;
        const confirmPin = document.getElementById('confirm-pin-input').value;
        const errorElement = document.getElementById('pin-change-error');
        
        // Validate
        if (newPin.length !== 4 || !/^\d+$/.test(newPin)) {
            errorElement.textContent = 'PIN must be 4 digits';
            errorElement.classList.remove('hidden');
            return;
        }
        
        if (newPin !== confirmPin) {
            errorElement.textContent = 'PINs do not match';
            errorElement.classList.remove('hidden');
            return;
        }
        
        try {
            // Change PIN
            await Auth.changePin(currentPin, newPin, confirmPin);
            
            // Close modal
            this.closePinChangeModal();
            
            // Show success
            this.showSuccess('PIN changed successfully');
            
        } catch (error) {
            errorElement.textContent = error.message || 'Failed to change PIN';
            errorElement.classList.remove('hidden');
        }
    }
    
    showDriveConnectionModal() {
        const modal = document.getElementById('drive-connect-modal');
        if (modal) {
            modal.classList.remove('hidden');
        }
    }
    
    toggleDriveStatusDropdown() {
        const dropdown = document.getElementById('drive-status-dropdown');
        if (dropdown) {
            dropdown.classList.toggle('hidden');
        }
    }
    
    hideDriveStatusDropdown() {
        const dropdown = document.getElementById('drive-status-dropdown');
        if (dropdown) {
            dropdown.classList.add('hidden');
        }
    }
    
    loadSettingsIntoUI() {
        try {
            // Load saved settings
            const settings = this.getSavedSettings();
            
            // General settings
            if (settings.darkMode !== undefined) {
                document.getElementById('dark-mode').checked = settings.darkMode;
            }
            
            if (settings.defaultView) {
                document.getElementById('default-view').value = settings.defaultView;
            }
            
            // Viewer settings
            if (settings.upgradedVideo !== undefined) {
                document.getElementById('upgraded-video').checked = settings.upgradedVideo;
            }
            
            if (settings.upgradedImage !== undefined) {
                document.getElementById('upgraded-image').checked = settings.upgradedImage;
            }
            
            if (settings.upgradedPDF !== undefined) {
                document.getElementById('upgraded-pdf').checked = settings.upgradedPDF;
            }
            
            if (settings.upgradedZIP !== undefined) {
                document.getElementById('upgraded-zip').checked = settings.upgradedZIP;
            }
            
            // Sync settings
            if (settings.autoSync !== undefined) {
                document.getElementById('auto-sync').checked = settings.autoSync;
            }
            
            if (settings.mobileSync !== undefined) {
                document.getElementById('mobile-sync').checked = settings.mobileSync;
            }
            
            if (settings.lowPowerSync !== undefined) {
                document.getElementById('low-power-sync').checked = settings.lowPowerSync;
            }
            
            // Security settings
            if (settings.autoLockTime) {
                document.getElementById('auto-lock-time').value = settings.autoLockTime;
            }
            
            // Theme settings
            if (settings.theme) {
                this.theme = settings.theme;
            }
            
            // Update drive connection status
            this.updateDriveStatusInSettings();
            
        } catch (error) {
            console.error('Load settings error:', error);
        }
    }
    
    updateDriveStatusInSettings() {
        const statusText = document.getElementById('drive-connection-status-text');
        if (statusText && Auth.user) {
            const storageInfo = Auth.getStorageInfo();
            const usedGB = storageInfo ? (storageInfo.used / (1024 * 1024 * 1024)).toFixed(2) : '0';
            statusText.textContent = `Connected as ${Auth.user.email} (${usedGB}GB used)`;
        } else if (statusText) {
            statusText.textContent = 'Disconnected';
        }
    }
    
    async saveSettings() {
        try {
            // Collect settings from UI
            const settings = {
                // General
                darkMode: document.getElementById('dark-mode').checked,
                defaultView: document.getElementById('default-view').value,
                
                // Viewer
                upgradedVideo: document.getElementById('upgraded-video').checked,
                upgradedImage: document.getElementById('upgraded-image').checked,
                upgradedPDF: document.getElementById('upgraded-pdf').checked,
                upgradedZIP: document.getElementById('upgraded-zip').checked,
                
                // Sync
                autoSync: document.getElementById('auto-sync').checked,
                mobileSync: document.getElementById('mobile-sync').checked,
                lowPowerSync: document.getElementById('low-power-sync').checked,
                
                // Security
                autoLockTime: document.getElementById('auto-lock-time').value,
                
                // Theme
                theme: this.theme
            };
            
            // Save settings
            this.saveSettingsToStorage(settings);
            
            // Apply settings
            this.applySettings();
            
            // Update UI
            this.updateUIFromSettings(settings);
            
            // Show success
            this.showSuccess('Settings saved successfully');
            
            // Close modal after delay
            setTimeout(() => {
                this.closeSettingsModal();
            }, 1000);
            
        } catch (error) {
            console.error('Save settings error:', error);
            this.showError('Failed to save settings');
        }
    }
    
    updateUIFromSettings(settings) {
        // Update view if changed
        if (settings.defaultView && settings.defaultView !== this.currentView) {
            this.switchView(settings.defaultView);
        }
        
        // Update dark mode
        if (settings.darkMode !== undefined) {
            if (settings.darkMode) {
                document.body.classList.add('dark-mode');
            } else {
                document.body.classList.remove('dark-mode');
            }
        }
        
        // Update theme
        if (settings.theme && settings.theme !== this.theme) {
            this.theme = settings.theme;
            this.applyTheme();
        }
    }
    
    resetSettings() {
        if (confirm('Reset all settings to default?')) {
            try {
                // Clear settings
                localStorage.removeItem(VAULT_CONFIG.storage.appSettings);
                localStorage.removeItem(VAULT_CONFIG.storage.viewerSettings);
                localStorage.removeItem(VAULT_CONFIG.storage.uiSettings);
                
                // Reload settings into UI
                this.loadSettingsIntoUI();
                
                // Apply default settings
                this.applySettings();
                
                // Update UI
                this.updateUIFromSettings(this.getSavedSettings());
                
                this.showSuccess('Settings reset to default');
                
            } catch (error) {
                console.error('Reset settings error:', error);
                this.showError('Failed to reset settings');
            }
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
        
        // Default settings
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
    
    saveSettingsToStorage(settings) {
        try {
            localStorage.setItem(VAULT_CONFIG.storage.appSettings, JSON.stringify(settings));
            
            // Save viewer settings separately
            const viewerSettings = {
                upgradedVideo: settings.upgradedVideo,
                upgradedImage: settings.upgradedImage,
                upgradedPDF: settings.upgradedPDF,
                upgradedZIP: settings.upgradedZIP
            };
            
            localStorage.setItem(VAULT_CONFIG.storage.viewerSettings, JSON.stringify(viewerSettings));
            
        } catch (error) {
            console.error('Save settings to storage error:', error);
            throw error;
        }
    }
    
    applySettings() {
        const settings = this.getSavedSettings();
        
        // Apply dark mode
        if (settings.darkMode) {
            document.body.classList.add('dark-mode');
        } else {
            document.body.classList.remove('dark-mode');
        }
        
        // Apply default view
        if (settings.defaultView === 'list') {
            this.switchView('list');
        } else {
            this.switchView('grid');
        }
        
        // Apply theme
        this.applyTheme(settings.theme);
        
        // Update current view
        this.currentView = settings.defaultView || 'grid';
    }
    
    applyTheme(themeName = null) {
        const theme = themeName || this.theme;
        const colors = VAULT_CONFIG.getThemeColors(theme);
        
        // Update CSS variables
        document.documentElement.style.setProperty('--primary', colors.primary);
        document.documentElement.style.setProperty('--secondary', colors.secondary);
        document.documentElement.style.setProperty('--accent', colors.accent);
        document.documentElement.style.setProperty('--background', colors.background);
        document.documentElement.style.setProperty('--surface', colors.surface);
        document.documentElement.style.setProperty('--text', colors.text);
        document.documentElement.style.setProperty('--muted', colors.muted);
        
        // Calculate variations
        const hex = colors.primary.replace('#', '');
        if (hex.length === 6) {
            const r = parseInt(hex.substr(0, 2), 16);
            const g = parseInt(hex.substr(2, 2), 16);
            const b = parseInt(hex.substr(4, 2), 16);
            
            const lightColor = `rgb(${Math.min(r + 40, 255)}, ${Math.min(g + 40, 255)}, ${Math.min(b + 40, 255)})`;
            const darkColor = `rgb(${Math.max(r - 40, 0)}, ${Math.max(g - 40, 0)}, ${Math.max(b - 40, 0)})`;
            const glowColor = `rgba(${r}, ${g}, ${b}, 0.15)`;
            
            document.documentElement.style.setProperty('--primary-light', lightColor);
            document.documentElement.style.setProperty('--primary-dark', darkColor);
            document.documentElement.style.setProperty('--primary-glow', glowColor);
        }
        
        this.theme = theme;
    }
    
    initDarkMode() {
        // Check if dark mode preference exists
        const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
        const settings = this.getSavedSettings();
        
        // Apply dark mode based on settings or system preference
        if (settings.darkMode === undefined && prefersDark) {
            document.body.classList.add('dark-mode');
        }
    }
    
    initView() {
        const settings = this.getSavedSettings();
        const view = settings.defaultView || 'grid';
        
        this.switchView(view);
    }
    
    initSortFilter() {
        const settings = this.getSavedSettings();
        
        // Set default sort
        const sortSelect = document.getElementById('sort-select');
        if (sortSelect) {
            sortSelect.value = settings.defaultSort || 'date_desc';
        }
        
        // Set default filter
        const filterSelect = document.getElementById('filter-select');
        if (filterSelect) {
            filterSelect.value = settings.defaultFilter || 'all';
        }
    }
    
    switchView(view) {
        // Update current view
        this.currentView = view;
        
        // Update active button
        document.querySelectorAll('.view-btn').forEach(btn => {
            btn.classList.toggle('active', btn.dataset.view === view);
        });
        
        // Show/hide containers
        const grid = document.getElementById('file-grid');
        const list = document.getElementById('file-list');
        
        if (view === 'grid') {
            grid?.classList.add('active');
            list?.classList.add('hidden');
        } else {
            grid?.classList.remove('active');
            list?.classList.remove('hidden');
        }
        
        // Update file display if Drive is loaded
        if (window.Drive) {
            Drive.switchView(view);
        }
    }
    
    switchSettingsTab(tab) {
        // Update active tab
        document.querySelectorAll('.settings-tab').forEach(tabEl => {
            tabEl.classList.toggle('active', tabEl.dataset.tab === tab);
        });
        
        // Show active panel
        document.querySelectorAll('.settings-panel').forEach(panel => {
            panel.classList.toggle('active', panel.id === `${tab}-panel`);
        });
    }
    
    handleSortChange(value) {
        if (window.Drive) {
            Drive.sortFiles(value);
        }
        
        // Save sort preference
        const settings = this.getSavedSettings();
        settings.defaultSort = value;
        this.saveSettingsToStorage(settings);
    }
    
    handleFilterChange(value) {
        if (window.Drive) {
            Drive.filterFiles(value);
        }
        
        // Save filter preference
        const settings = this.getSavedSettings();
        settings.defaultFilter = value;
        this.saveSettingsToStorage(settings);
    }
    
    triggerFileUpload() {
        document.getElementById('file-input').click();
    }
    
    triggerFolderUpload() {
        document.getElementById('folder-input').click();
    }
    
    async createFolder() {
        if (window.Drive) {
            await Drive.createFolder();
        }
    }
    
    createNote() {
        // Create a new text file
        const fileName = prompt('Enter note name:', 'New Note.txt');
        if (!fileName) return;
        
        // This would create a file in Google Drive
        // For now, just show a message
        this.showError('Note creation not implemented yet. Please use Google Drive directly.');
    }
    
    showEmptyState(type) {
        const emptyState = document.getElementById('empty-state');
        const emptyTitle = document.getElementById('empty-title');
        const emptyMessage = document.getElementById('empty-message');
        const emptyActions = document.querySelector('.empty-actions');
        
        if (!emptyState || !emptyTitle || !emptyMessage) return;
        
        switch (type) {
            case 'trash':
                emptyTitle.textContent = 'Trash is Empty';
                emptyMessage.textContent = 'Deleted files will appear here';
                if (emptyActions) emptyActions.classList.add('hidden');
                break;
            case 'disconnected':
                emptyTitle.textContent = 'Google Drive Disconnected';
                emptyMessage.textContent = 'Connect your Google Drive to access files';
                if (emptyActions) emptyActions.classList.remove('hidden');
                break;
            case 'empty':
                emptyTitle.textContent = 'No Files Found';
                emptyMessage.textContent = 'Upload your first file or create a folder';
                if (emptyActions) emptyActions.classList.remove('hidden');
                break;
            case 'search':
                emptyTitle.textContent = 'No Results Found';
                emptyMessage.textContent = 'Try a different search term';
                if (emptyActions) emptyActions.classList.add('hidden');
                break;
            case 'error':
                emptyTitle.textContent = 'Error Loading Files';
                emptyMessage.textContent = 'Please check your connection and try again';
                if (emptyActions) emptyActions.classList.remove('hidden');
                break;
        }
        
        emptyState.classList.remove('hidden');
    }
    
    closeModal(modal) {
        if (modal) {
            modal.classList.add('hidden');
            this.modalOpen = false;
            document.body.style.overflow = '';
        }
    }
    
    closeAllModals() {
        document.querySelectorAll('.modal').forEach(modal => {
            modal.classList.add('hidden');
        });
        this.modalOpen = false;
        document.body.style.overflow = '';
    }
    
    showUpgradeModal() {
        // Create upgrade modal
        const modal = document.createElement('div');
        modal.className = 'modal';
        modal.id = 'upgrade-modal';
        modal.innerHTML = `
            <div class="modal-content upgrade-modal">
                <div class="modal-header">
                    <h3><i class="fas fa-rocket"></i> Upgrade Storage</h3>
                    <button class="btn-close"><i class="fas fa-times"></i></button>
                </div>
                <div class="modal-body">
                    <div class="upgrade-options">
                        <div class="upgrade-option">
                            <h4>Basic</h4>
                            <p class="price">Free</p>
                            <ul>
                                <li>15GB Storage</li>
                                <li>Basic Support</li>
                                <li>Standard Sync</li>
                            </ul>
                            <button class="btn-secondary">Current Plan</button>
                        </div>
                        <div class="upgrade-option featured">
                            <h4>Pro</h4>
                            <p class="price">$9.99/month</p>
                            <ul>
                                <li>100GB Storage</li>
                                <li>Priority Support</li>
                                <li>Advanced Sync</li>
                                <li>Enhanced Security</li>
                            </ul>
                            <button class="btn-primary">Upgrade to Pro</button>
                        </div>
                        <div class="upgrade-option">
                            <h4>Ultimate</h4>
                            <p class="price">$19.99/month</p>
                            <ul>
                                <li>2TB Storage</li>
                                <li>24/7 Support</li>
                                <li>Real-time Sync</li>
                                <li>Enterprise Security</li>
                            </ul>
                            <button class="btn-secondary">Upgrade to Ultimate</button>
                        </div>
                    </div>
                </div>
            </div>
        `;
        
        document.body.appendChild(modal);
        
        // Add event listeners
        modal.querySelector('.btn-close').addEventListener('click', () => {
            modal.remove();
        });
        
        modal.querySelectorAll('.upgrade-option button').forEach(btn => {
            btn.addEventListener('click', () => {
                this.showSuccess('Upgrade feature coming soon!');
                modal.remove();
            });
        });
        
        // Show modal
        modal.classList.remove('hidden');
        this.modalOpen = true;
    }
    
    checkMobile() {
        return window.innerWidth <= 768;
    }
    
    detectMobile() {
        this.isMobile = this.checkMobile();
        
        // Update UI for mobile
        if (this.isMobile) {
            document.body.classList.add('mobile');
            this.closeSidebar();
        } else {
            document.body.classList.remove('mobile');
        }
    }
    
    handleResize() {
        const wasMobile = this.isMobile;
        this.detectMobile();
        
        // If switching between mobile and desktop
        if (wasMobile !== this.isMobile) {
            // Close sidebar when switching to mobile
            if (this.isMobile) {
                this.closeSidebar();
            }
        }
    }
    
    updateAuthUI() {
        // Update user info if logged in
        if (Auth.isLoggedIn() && Auth.user) {
            this.updateUserUI();
            this.updateStorageUI();
        }
    }
    
    updateUserUI() {
        if (Auth.user) {
            // Update avatar
            const avatar = document.getElementById('user-avatar');
            if (avatar) {
                avatar.src = Auth.user.picture || this.generateDefaultAvatar(Auth.user.name);
                avatar.alt = Auth.user.name;
            }
        }
    }
    
    updateStorageUI() {
        const storageInfo = Auth.getStorageInfo();
        if (!storageInfo) return;
        
        const usedGB = (storageInfo.used / (1024 * 1024 * 1024)).toFixed(2);
        const totalGB = storageInfo.total > 0 
            ? (storageInfo.total / (1024 * 1024 * 1024)).toFixed(2)
            : 'Unlimited';
        
        const percent = storageInfo.percentage || 0;
        
        // Update sidebar storage
        const storageText = document.getElementById('sidebar-storage-text');
        if (storageText) {
            if (totalGB === 'Unlimited') {
                storageText.textContent = `${usedGB}GB used (Unlimited)`;
            } else {
                storageText.textContent = `${usedGB}GB of ${totalGB}GB used`;
            }
        }
        
        // Update storage progress bar
        const storageFill = document.getElementById('sidebar-storage-fill');
        if (storageFill) {
            if (totalGB === 'Unlimited') {
                storageFill.style.width = '10%';
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
    }
    
    generateDefaultAvatar(name) {
        const colors = ['#00f3ff', '#7000ff', '#ff0055', '#00ff9d', '#ffdd59'];
        const color = colors[name.length % colors.length];
        const initials = name.split(' ').map(n => n[0]).join('').toUpperCase().substring(0, 2);
        
        return `data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><circle cx="50" cy="50" r="45" fill="${color}"/><text x="50" y="65" text-anchor="middle" font-size="40" fill="white" font-family="Arial">${initials}</text></svg>`;
    }
    
    showError(message) {
        const toast = document.createElement('div');
        toast.className = 'toast error';
        toast.innerHTML = `
            <i class="fas fa-exclamation-circle"></i>
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
    
    showSuccess(message) {
        const toast = document.createElement('div');
        toast.className = 'toast success';
        toast.innerHTML = `
            <i class="fas fa-check-circle"></i>
            <span>${message}</span>
            <button class="toast-close"><i class="fas fa-times"></i></button>
        `;
        
        const container = document.getElementById('toast-container');
        if (container) {
            container.appendChild(toast);
            
            // Auto remove after 3 seconds
            setTimeout(() => {
                if (toast.parentNode) {
                    toast.style.opacity = '0';
                    setTimeout(() => toast.remove(), 300);
                }
            }, 3000);
            
            // Close button
            toast.querySelector('.toast-close').addEventListener('click', () => {
                toast.style.opacity = '0';
                setTimeout(() => toast.remove(), 300);
            });
        }
    }
    
    // Public methods
    getCurrentTab() {
        return this.currentTab;
    }
    
    getCurrentView() {
        return this.currentView;
    }
    
    refreshUI() {
        this.updateTabUI();
        this.loadTabContent(this.currentTab);
        this.updateAuthUI();
    }
    
    isModalOpen() {
        return this.modalOpen;
    }
}

// Create global UI instance
window.UI = new UIManager();

