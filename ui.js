/* =========================================
   VAULT OS - UI MODULE (COMPLETED)
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
        this.selectedFiles = new Set();
        this.historyStack = ['home'];
        this.breadcrumbHistory = [];
        this.contextMenu = null;
        this.activeContextMenu = null;
        
        // Initialize
        this.init();
    }
    
    init() {
        this.detectMobile();
        this.setupEventListeners();
        this.applySettings();
        this.applyTheme();
        this.initComponents();
        this.updateAuthUI();
        this.initHistory();
    }
    
    setupEventListeners() {
        // Menu toggle
        document.getElementById('menu-toggle')?.addEventListener('click', () => {
            this.toggleSidebar();
        });
        
        // Tab navigation
        document.querySelectorAll('.menu-item[data-tab]').forEach(element => {
            element.addEventListener('click', (e) => {
                e.preventDefault();
                const tab = e.currentTarget.dataset.tab;
                this.switchTab(tab);
            });
        });
        
        document.querySelectorAll('.nav-item[data-tab]').forEach(element => {
            element.addEventListener('click', (e) => {
                e.preventDefault();
                const tab = e.currentTarget.dataset.tab;
                this.switchTab(tab);
            });
        });
        
        // FAB menu
        document.getElementById('fab-main')?.addEventListener('click', (e) => {
            e.stopPropagation();
            this.toggleFabMenu();
        });
        
        document.addEventListener('click', (e) => {
            if (!e.target.closest('.fab-container') && !e.target.closest('#fab-main')) {
                this.closeFabMenu();
            }
            if (!e.target.closest('.context-menu') && !e.target.closest('.more-btn')) {
                this.closeAllContextMenus();
            }
        });
        
        // FAB menu items
        document.getElementById('upload-file-btn')?.addEventListener('click', (e) => {
            e.stopPropagation();
            this.triggerFileUpload();
            this.closeFabMenu();
        });
        
        document.getElementById('upload-folder-btn')?.addEventListener('click', (e) => {
            e.stopPropagation();
            this.triggerFolderUpload();
            this.closeFabMenu();
        });
        
        document.getElementById('create-folder-btn')?.addEventListener('click', (e) => {
            e.stopPropagation();
            this.createFolder();
            this.closeFabMenu();
        });
        
        document.getElementById('create-note-btn')?.addEventListener('click', (e) => {
            e.stopPropagation();
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
        
        // Escape key
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                this.closeAllModals();
                this.closeFabMenu();
                this.closeSidebar();
                this.hideDriveStatusDropdown();
                this.closeAllContextMenus();
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
        
        document.getElementById('cancel-pin-change')?.addEventListener('click', () => {
            this.closePinChangeModal();
        });
        
        document.getElementById('save-pin-change')?.addEventListener('click', () => {
            this.savePinChange();
        });
        
        // Gallery categories
        document.querySelectorAll('.category-card').forEach(card => {
            card.addEventListener('click', () => {
                this.filterGallery(card.dataset.type);
            });
        });
        
        // Drive management
        document.getElementById('manage-drive-settings')?.addEventListener('click', () => {
            this.showDriveConnectionModal();
        });
        
        document.getElementById('drive-status-toggle')?.addEventListener('click', (e) => {
            e.stopPropagation();
            this.toggleDriveStatusDropdown();
        });
        
        document.addEventListener('click', (e) => {
            if (!e.target.closest('.drive-status-container')) {
                this.hideDriveStatusDropdown();
            }
        });
        
        document.getElementById('reconnect-drive')?.addEventListener('click', () => {
            this.showDriveConnectionModal();
            this.hideDriveStatusDropdown();
        });
        
        document.getElementById('manage-drive')?.addEventListener('click', () => {
            this.showSettingsModal();
            this.hideDriveStatusDropdown();
        });
        
        // View toggle
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
        
        // Sync now button
        document.getElementById('sync-now-btn')?.addEventListener('click', () => {
            this.handleSyncNow();
        });
        
        // Theme selector
        document.getElementById('theme-select')?.addEventListener('change', (e) => {
            this.changeTheme(e.target.value);
        });
        
        // Back button
        document.getElementById('back-btn')?.addEventListener('click', () => {
            this.goBack();
        });
        
        // File actions
        document.getElementById('share-file-btn')?.addEventListener('click', () => {
            this.handleShareFile();
        });
        
        document.getElementById('move-file-btn')?.addEventListener('click', () => {
            this.handleMoveFile();
        });
        
        document.getElementById('download-file-btn')?.addEventListener('click', () => {
            this.handleDownloadFile();
        });
        
        document.getElementById('delete-file-btn')?.addEventListener('click', () => {
            this.handleDeleteFile();
        });
        
        // Bulk actions
        document.getElementById('select-all-btn')?.addEventListener('click', () => {
            this.selectAllFiles();
        });
        
        document.getElementById('clear-selection-btn')?.addEventListener('click', () => {
            this.clearSelection();
        });
        
        // File upload
        document.getElementById('file-input')?.addEventListener('change', (e) => {
            this.handleFileUpload(e.target.files);
        });
        
        document.getElementById('folder-input')?.addEventListener('change', (e) => {
            this.handleFolderUpload(e.target.files);
        });
        
        // Window resize
        window.addEventListener('resize', () => {
            this.handleResize();
        });
        
        // Close sidebar on mobile
        document.addEventListener('click', (e) => {
            if (this.isMobile && this.sidebarOpen) {
                if (!e.target.closest('.sidebar') && !e.target.closest('#menu-toggle')) {
                    this.closeSidebar();
                }
            }
        });
        
        // Browser history
        window.addEventListener('popstate', (e) => {
            if (e.state && e.state.tab) {
                this.switchTab(e.state.tab, false);
            }
        });
        
        // File click handlers
        document.addEventListener('click', (e) => {
            // File selection
            if (e.target.closest('.file-item') || e.target.closest('.grid-item')) {
                const fileItem = e.target.closest('.file-item') || e.target.closest('.grid-item');
                if (fileItem) {
                    const fileId = fileItem.dataset.id;
                    if (fileId && !e.target.closest('.more-btn') && !e.target.closest('.context-menu')) {
                        this.toggleFileSelection(fileId);
                    }
                }
            }
            
            // 3-dot menu
            if (e.target.closest('.more-btn')) {
                e.preventDefault();
                e.stopPropagation();
                const btn = e.target.closest('.more-btn');
                const fileId = btn.dataset.fileId;
                const fileItem = btn.closest('.file-item') || btn.closest('.grid-item');
                if (fileId && fileItem) {
                    this.showContextMenu(btn, fileId, fileItem);
                }
            }
            
            // Context menu actions
            if (e.target.closest('.context-menu-action')) {
                e.preventDefault();
                e.stopPropagation();
                const actionBtn = e.target.closest('.context-menu-action');
                const action = actionBtn.dataset.action;
                const fileId = actionBtn.dataset.fileId;
                if (action && fileId) {
                    this.handleFileAction(action, fileId);
                    this.closeAllContextMenus();
                }
            }
        });
        
        // Keyboard shortcuts
        document.addEventListener('keydown', (e) => {
            if (e.ctrlKey && e.key === 'a') {
                e.preventDefault();
                this.selectAllFiles();
            }
            if (e.key === 'Escape') {
                this.clearSelection();
                this.closeAllContextMenus();
            }
            if (e.key === 'Delete' && this.selectedFiles.size > 0) {
                this.handleDeleteFile();
            }
        });
    }
    
    initComponents() {
        this.initDarkMode();
        this.initView();
        this.initSortFilter();
        this.initBreadcrumbs();
    }
    
    initHistory() {
        window.history.replaceState({ tab: 'home' }, '', '#home');
    }
    
    initBreadcrumbs() {
        const homeCrumb = document.getElementById('home-crumb');
        if (homeCrumb) {
            homeCrumb.addEventListener('click', (e) => {
                e.preventDefault();
                this.switchTab('home');
            });
        }
    }
    
    switchTab(tab, pushState = true) {
        if (this.currentTab === tab) return;
        
        this.currentTab = tab;
        
        if (pushState) {
            this.historyStack.push(tab);
            window.history.pushState({ tab: tab }, '', `#${tab}`);
        }
        
        this.updateTabUI();
        this.loadTabContent(tab);
        
        if (this.isMobile) {
            this.closeSidebar();
        }
        
        this.clearSelection();
        document.title = `${this.getTabTitle(tab)} - Vault OS`;
    }
    
    getTabTitle(tab) {
        const titles = {
            'home': 'Home',
            'recent': 'Recent',
            'gallery': 'Gallery',
            'shared': 'Shared',
            'trash': 'Trash',
            'settings': 'Settings'
        };
        return titles[tab] || tab;
    }
    
    updateTabUI() {
        document.querySelectorAll('.menu-item').forEach(item => {
            item.classList.toggle('active', item.dataset.tab === this.currentTab);
        });
        
        document.querySelectorAll('.nav-item').forEach(item => {
            item.classList.toggle('active', item.dataset.tab === this.currentTab);
        });
        
        this.updateMainContentHeader();
        this.updateMainContent();
        this.updateActionButtons();
    }
    
    updateMainContentHeader() {
        const breadcrumbs = document.getElementById('breadcrumbs');
        const viewControls = document.querySelector('.view-controls');
        const galleryCategories = document.getElementById('gallery-categories');
        const actionButtons = document.querySelector('.action-buttons');
        
        if (!breadcrumbs || !viewControls) return;
        
        switch (this.currentTab) {
            case 'home':
                breadcrumbs.classList.remove('hidden');
                viewControls.classList.remove('hidden');
                if (galleryCategories) galleryCategories.classList.add('hidden');
                if (actionButtons) actionButtons.classList.remove('hidden');
                break;
            case 'recent':
                breadcrumbs.classList.add('hidden');
                viewControls.classList.remove('hidden');
                if (galleryCategories) galleryCategories.classList.add('hidden');
                if (actionButtons) actionButtons.classList.remove('hidden');
                break;
            case 'gallery':
                breadcrumbs.classList.add('hidden');
                viewControls.classList.add('hidden');
                if (galleryCategories) galleryCategories.classList.remove('hidden');
                if (actionButtons) actionButtons.classList.remove('hidden');
                break;
            case 'shared':
                breadcrumbs.classList.remove('hidden');
                viewControls.classList.remove('hidden');
                if (galleryCategories) galleryCategories.classList.add('hidden');
                if (actionButtons) actionButtons.classList.remove('hidden');
                break;
            case 'trash':
                breadcrumbs.classList.remove('hidden');
                viewControls.classList.remove('hidden');
                if (galleryCategories) galleryCategories.classList.add('hidden');
                if (actionButtons) actionButtons.classList.remove('hidden');
                break;
            case 'settings':
                breadcrumbs.classList.add('hidden');
                viewControls.classList.add('hidden');
                if (galleryCategories) galleryCategories.classList.add('hidden');
                if (actionButtons) actionButtons.classList.add('hidden');
                break;
        }
    }
    
    updateMainContent() {
        this.hideAllTabContent();
        
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
        ['file-container', 'gallery-categories', 'settings-content'].forEach(id => {
            const element = document.getElementById(id);
            if (element) element.classList.add('hidden');
        });
    }
    
    showFileBrowser() {
        const fileContainer = document.querySelector('.file-container');
        if (fileContainer) {
            fileContainer.classList.remove('hidden');
        }
        this.loadFilesForTab();
    }
    
    showGallery() {
        const galleryCategories = document.getElementById('gallery-categories');
        const fileContainer = document.querySelector('.file-container');
        
        if (galleryCategories) galleryCategories.classList.remove('hidden');
        if (fileContainer) fileContainer.classList.remove('hidden');
        
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
            
            const files = Drive.getFiles();
            const recentFiles = [...files]
                .sort((a, b) => b.modified - a.modified)
                .slice(0, 50);
            
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
            
            const files = Drive.getFiles();
            const imageFiles = files.filter(f => f.type === 'image');
            const videoFiles = files.filter(f => f.type === 'video');
            const audioFiles = files.filter(f => f.type === 'audio');
            const documentFiles = files.filter(f => f.type === 'document');
            
            this.updateGalleryCounts({
                image: imageFiles.length,
                video: videoFiles.length,
                audio: audioFiles.length,
                document: documentFiles.length
            });
            
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
            
            const files = Drive.getFiles();
            const sharedFiles = files.filter(f => f.shared);
            
            this.updateBadge('shared-count', sharedFiles.length);
            this.displayFiles(sharedFiles, 'Shared Files');
            
        } catch (error) {
            console.error('Load shared files error:', error);
            this.showError('Failed to load shared files');
        }
    }
    
    async loadTrashFiles() {
        try {
            this.showEmptyState('trash');
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
        
        this.hideEmptyState();
        const originalFiles = Drive.files;
        Drive.files = files;
        Drive.renderFiles();
        
        if (this.currentView === 'list') {
            this.addContextMenuButtons();
        }
        
        Drive.files = originalFiles;
        
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
                element.textContent = count > 99 ? '99+' : count;
                element.classList.remove('hidden');
            } else {
                element.classList.add('hidden');
            }
        }
    }
    
    filterGallery(type) {
        document.querySelectorAll('.category-card').forEach(card => {
            card.classList.toggle('active', card.dataset.type === type);
        });
        
        this.selectedCategory = type;
        this.loadGalleryFiles();
    }
    
    toggleSidebar() {
        this.sidebarOpen = !this.sidebarOpen;
        const sidebar = document.getElementById('sidebar');
        
        if (sidebar) {
            sidebar.classList.toggle('active', this.sidebarOpen);
        }
        
        const menuIcon = document.querySelector('#menu-toggle i');
        if (menuIcon) {
            menuIcon.className = this.sidebarOpen ? 'fas fa-times' : 'fas fa-bars';
        }
        
        if (this.isMobile) {
            document.body.style.overflow = this.sidebarOpen ? 'hidden' : '';
        }
    }
    
    closeSidebar() {
        this.sidebarOpen = false;
        const sidebar = document.getElementById('sidebar');
        
        if (sidebar) {
            sidebar.classList.remove('active');
        }
        
        const menuIcon = document.querySelector('#menu-toggle i');
        if (menuIcon) {
            menuIcon.className = 'fas fa-bars';
        }
        
        document.body.style.overflow = '';
    }
    
    toggleFabMenu() {
        this.fabMenuOpen = !this.fabMenuOpen;
        const fabMenu = document.getElementById('fab-menu');
        const fabIcon = document.getElementById('fab-icon');
        
        if (fabMenu && fabIcon) {
            if (this.fabMenuOpen) {
                fabMenu.classList.remove('hidden');
                fabMenu.style.opacity = '0';
                fabMenu.style.transform = 'translateY(20px)';
                
                setTimeout(() => {
                    fabMenu.style.opacity = '1';
                    fabMenu.style.transform = 'translateY(0)';
                }, 10);
                
                fabIcon.className = 'fas fa-times';
                fabIcon.style.transform = 'rotate(90deg)';
            } else {
                fabMenu.style.opacity = '0';
                fabMenu.style.transform = 'translateY(20px)';
                
                setTimeout(() => {
                    fabMenu.classList.add('hidden');
                }, 300);
                
                fabIcon.className = 'fas fa-plus';
                fabIcon.style.transform = 'rotate(0deg)';
            }
        }
    }
    
    closeFabMenu() {
        if (!this.fabMenuOpen) return;
        
        this.fabMenuOpen = false;
        const fabMenu = document.getElementById('fab-menu');
        const fabIcon = document.getElementById('fab-icon');
        
        if (fabMenu) {
            fabMenu.style.opacity = '0';
            fabMenu.style.transform = 'translateY(20px)';
            
            setTimeout(() => {
                fabMenu.classList.add('hidden');
            }, 300);
        }
        
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
            document.body.style.overflow = 'hidden';
            this.loadSettingsIntoUI();
        }
    }
    
    closeSettingsModal() {
        this.modalOpen = false;
        const modal = document.getElementById('settings-modal');
        
        if (modal) {
            modal.classList.add('hidden');
            document.body.style.overflow = '';
        }
    }
    
    showPinChangeModal() {
        const modal = document.getElementById('pin-change-modal');
        
        if (modal) {
            modal.classList.remove('hidden');
            document.body.style.overflow = 'hidden';
            
            document.getElementById('current-pin-input').value = '';
            document.getElementById('new-pin-input').value = '';
            document.getElementById('confirm-pin-input').value = '';
            
            document.getElementById('pin-change-error').classList.add('hidden');
            
            setTimeout(() => {
                document.getElementById('current-pin-input').focus();
            }, 100);
        }
    }
    
    closePinChangeModal() {
        const modal = document.getElementById('pin-change-modal');
        if (modal) {
            modal.classList.add('hidden');
            document.body.style.overflow = '';
        }
    }
    
    async savePinChange() {
        const currentPin = document.getElementById('current-pin-input').value;
        const newPin = document.getElementById('new-pin-input').value;
        const confirmPin = document.getElementById('confirm-pin-input').value;
        const errorElement = document.getElementById('pin-change-error');
        
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
            await Auth.changePin(currentPin, newPin, confirmPin);
            this.closePinChangeModal();
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
            document.body.style.overflow = 'hidden';
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
            const settings = this.getSavedSettings();
            
            if (settings.darkMode !== undefined) {
                document.getElementById('dark-mode').checked = settings.darkMode;
            }
            
            if (settings.defaultView) {
                document.getElementById('default-view').value = settings.defaultView;
            }
            
            if (settings.theme) {
                const themeSelect = document.getElementById('theme-select');
                if (themeSelect) {
                    themeSelect.value = settings.theme;
                }
                this.theme = settings.theme;
            }
            
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
            
            if (settings.autoSync !== undefined) {
                document.getElementById('auto-sync').checked = settings.autoSync;
            }
            
            if (settings.mobileSync !== undefined) {
                document.getElementById('mobile-sync').checked = settings.mobileSync;
            }
            
            if (settings.lowPowerSync !== undefined) {
                document.getElementById('low-power-sync').checked = settings.lowPowerSync;
            }
            
            if (settings.autoLockTime) {
                document.getElementById('auto-lock-time').value = settings.autoLockTime;
            }
            
            this.updateSyncButtonState(settings.autoSync);
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
    
    updateSyncButtonState(autoSyncEnabled) {
        const syncBtn = document.getElementById('sync-now-btn');
        if (syncBtn) {
            if (!autoSyncEnabled) {
                syncBtn.disabled = true;
                syncBtn.title = 'Auto sync is disabled. Enable it in settings first.';
                syncBtn.classList.add('disabled');
            } else {
                syncBtn.disabled = false;
                syncBtn.title = 'Sync now with Google Drive';
                syncBtn.classList.remove('disabled');
            }
        }
    }
    
    async saveSettings() {
        try {
            const settings = {
                darkMode: document.getElementById('dark-mode').checked,
                defaultView: document.getElementById('default-view').value,
                upgradedVideo: document.getElementById('upgraded-video').checked,
                upgradedImage: document.getElementById('upgraded-image').checked,
                upgradedPDF: document.getElementById('upgraded-pdf').checked,
                upgradedZIP: document.getElementById('upgraded-zip').checked,
                autoSync: document.getElementById('auto-sync').checked,
                mobileSync: document.getElementById('mobile-sync').checked,
                lowPowerSync: document.getElementById('low-power-sync').checked,
                autoLockTime: document.getElementById('auto-lock-time').value,
                theme: document.getElementById('theme-select') ? 
                       document.getElementById('theme-select').value : 
                       this.theme
            };
            
            this.saveSettingsToStorage(settings);
            this.applySettings();
            this.updateUIFromSettings(settings);
            this.showSuccess('Settings saved successfully');
            
            setTimeout(() => {
                this.closeSettingsModal();
            }, 1000);
            
        } catch (error) {
            console.error('Save settings error:', error);
            this.showError('Failed to save settings');
        }
    }
    
    updateUIFromSettings(settings) {
        if (settings.defaultView && settings.defaultView !== this.currentView) {
            this.switchView(settings.defaultView);
        }
        
        if (settings.darkMode !== undefined) {
            if (settings.darkMode) {
                document.body.classList.add('dark-mode');
            } else {
                document.body.classList.remove('dark-mode');
            }
        }
        
        if (settings.theme && settings.theme !== this.theme) {
            this.theme = settings.theme;
            this.applyTheme();
        }
        
        this.updateSyncButtonState(settings.autoSync);
    }
    
    resetSettings() {
        if (confirm('Reset all settings to default?')) {
            try {
                localStorage.removeItem(VAULT_CONFIG.storage.appSettings);
                localStorage.removeItem(VAULT_CONFIG.storage.viewerSettings);
                localStorage.removeItem(VAULT_CONFIG.storage.uiSettings);
                
                this.loadSettingsIntoUI();
                this.applySettings();
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
        
        if (settings.darkMode) {
            document.body.classList.add('dark-mode');
        } else {
            document.body.classList.remove('dark-mode');
        }
        
        if (settings.defaultView === 'list') {
            this.switchView('list');
        } else {
            this.switchView('grid');
        }
        
        this.applyTheme(settings.theme);
        this.currentView = settings.defaultView || 'grid';
        this.updateSyncButtonState(settings.autoSync);
    }
    
    applyTheme(themeName = null) {
        const theme = themeName || this.theme;
        const colors = VAULT_CONFIG.getThemeColors(theme);
        
        if (!colors) {
            console.warn(`Theme "${theme}" not found, using default`);
            return;
        }
        
        document.documentElement.style.setProperty('--primary', colors.primary);
        document.documentElement.style.setProperty('--secondary', colors.secondary);
        document.documentElement.style.setProperty('--accent', colors.accent);
        document.documentElement.style.setProperty('--background', colors.background);
        document.documentElement.style.setProperty('--surface', colors.surface);
        document.documentElement.style.setProperty('--text', colors.text);
        document.documentElement.style.setProperty('--muted', colors.muted);
        
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
    
    changeTheme(themeName) {
        this.theme = themeName;
        this.applyTheme(themeName);
        
        const settings = this.getSavedSettings();
        settings.theme = themeName;
        this.saveSettingsToStorage(settings);
        
        this.showSuccess(`Theme changed to ${themeName}`);
    }
    
    initDarkMode() {
        const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
        const settings = this.getSavedSettings();
        
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
        
        const sortSelect = document.getElementById('sort-select');
        if (sortSelect) {
            sortSelect.value = settings.defaultSort || 'date_desc';
        }
        
        const filterSelect = document.getElementById('filter-select');
        if (filterSelect) {
            filterSelect.value = settings.defaultFilter || 'all';
        }
    }
    
    switchView(view) {
        this.currentView = view;
        
        document.querySelectorAll('.view-btn').forEach(btn => {
            btn.classList.toggle('active', btn.dataset.view === view);
        });
        
        const grid = document.getElementById('file-grid');
        const list = document.getElementById('file-list');
        
        if (view === 'grid') {
            grid?.classList.remove('hidden');
            list?.classList.add('hidden');
        } else {
            grid?.classList.add('hidden');
            list?.classList.remove('hidden');
        }
        
        if (window.Drive) {
            Drive.switchView(view);
        }
        
        this.closeAllContextMenus();
        
        const settings = this.getSavedSettings();
        settings.defaultView = view;
        this.saveSettingsToStorage(settings);
    }
    
    switchSettingsTab(tab) {
        document.querySelectorAll('.settings-tab').forEach(tabEl => {
            tabEl.classList.toggle('active', tabEl.dataset.tab === tab);
        });
        
        document.querySelectorAll('.settings-panel').forEach(panel => {
            panel.classList.toggle('active', panel.id === `${tab}-panel`);
        });
    }
    
    handleSortChange(value) {
        if (window.Drive) {
            Drive.sortFiles(value);
        }
        
        const settings = this.getSavedSettings();
        settings.defaultSort = value;
        this.saveSettingsToStorage(settings);
    }
    
    handleFilterChange(value) {
        if (window.Drive) {
            Drive.filterFiles(value);
        }
        
        const settings = this.getSavedSettings();
        settings.defaultFilter = value;
        this.saveSettingsToStorage(settings);
    }
    
    async handleSyncNow() {
        const settings = this.getSavedSettings();
        
        if (!settings.autoSync) {
            this.showError('Auto sync is disabled. Enable it in settings first.');
            return;
        }
        
        if (window.Drive) {
            try {
                this.showSuccess('Syncing with Google Drive...');
                await Drive.syncNow();
                this.showSuccess('Sync completed successfully');
                this.refreshUI();
            } catch (error) {
                this.showError('Sync failed: ' + error.message);
            }
        } else {
            this.showError('Drive module not loaded');
        }
    }
    
    triggerFileUpload() {
        document.getElementById('file-input').click();
    }
    
    triggerFolderUpload() {
        document.getElementById('folder-input').click();
    }
    
    async handleFileUpload(files) {
        if (!window.Drive) {
            this.showError('Drive module not loaded');
            return;
        }
        
        if (files.length === 0) return;
        
        try {
            this.showSuccess(`Uploading ${files.length} file(s)...`);
            await Drive.uploadFiles(files);
            this.showSuccess('Upload completed');
            this.refreshUI();
        } catch (error) {
            this.showError('Upload failed: ' + error.message);
        }
    }
    
    async handleFolderUpload(files) {
        if (!window.Drive) {
            this.showError('Drive module not loaded');
            return;
        }
        
        if (files.length === 0) return;
        
        try {
            this.showSuccess(`Uploading folder with ${files.length} file(s)...`);
            await Drive.uploadFolder(files);
            this.showSuccess('Folder upload completed');
            this.refreshUI();
        } catch (error) {
            this.showError('Folder upload failed: ' + error.message);
        }
    }
    
    async createFolder() {
        if (window.Drive) {
            try {
                await Drive.createFolder();
                this.refreshUI();
            } catch (error) {
                this.showError('Failed to create folder: ' + error.message);
            }
        }
    }
    
    createNote() {
        if (!window.Drive) {
            this.showError('Drive module not loaded');
            return;
        }
        
        const fileName = prompt('Enter note name:', 'New Note.txt');
        if (!fileName) return;
        
        const content = prompt('Enter note content:', '');
        
        try {
            Drive.createNote(fileName, content);
            this.showSuccess('Note created successfully');
            this.refreshUI();
        } catch (error) {
            this.showError('Failed to create note: ' + error.message);
        }
    }
    
    showContextMenu(button, fileId, fileItem) {
        this.closeAllContextMenus();
        
        const file = window.Drive ? Drive.getFileById(fileId) : null;
        if (!file) return;
        
        this.contextMenu = document.createElement('div');
        this.contextMenu.className = 'context-menu';
        this.contextMenu.dataset.fileId = fileId;
        
        const rect = button.getBoundingClientRect();
        this.contextMenu.style.position = 'fixed';
        this.contextMenu.style.top = `${rect.bottom + 5}px`;
        this.contextMenu.style.right = `${window.innerWidth - rect.right}px`;
        this.contextMenu.style.zIndex = '1000';
        
        const menuItems = this.getContextMenuItems(file);
        
        this.contextMenu.innerHTML = `
            <div class="context-menu-content">
                ${menuItems.map(item => item.action === 'divider' ? 
                    '<div class="context-menu-divider"></div>' : 
                    `<button class="context-menu-action" data-action="${item.action}" data-file-id="${fileId}">
                        <i class="${item.icon}"></i>
                        <span>${item.label}</span>
                    </button>`
                ).join('')}
            </div>
        `;
        
        document.body.appendChild(this.contextMenu);
        this.activeContextMenu = this.contextMenu;
        
        this.contextMenu.style.opacity = '0';
        this.contextMenu.style.transform = 'translateY(-10px)';
        
        setTimeout(() => {
            this.contextMenu.style.opacity = '1';
            this.contextMenu.style.transform = 'translateY(0)';
            this.contextMenu.style.transition = 'all 0.2s ease';
        }, 10);
    }
    
    getContextMenuItems(file) {
        const items = [];
        
        items.push({ action: 'preview', icon: 'fas fa-eye', label: 'Preview' });
        items.push({ action: 'download', icon: 'fas fa-download', label: 'Download' });
        items.push({ action: 'share', icon: 'fas fa-share-alt', label: 'Share' });
        items.push({ action: 'rename', icon: 'fas fa-edit', label: 'Rename' });
        
        if (file.type !== 'folder' || file.id !== 'root') {
            items.push({ action: 'move', icon: 'fas fa-folder', label: 'Move to' });
        }
        
        items.push({ action: 'copy', icon: 'fas fa-copy', label: 'Make a copy' });
        
        if (!file.starred) {
            items.push({ action: 'star', icon: 'far fa-star', label: 'Add to starred' });
        } else {
            items.push({ action: 'unstar', icon: 'fas fa-star', label: 'Remove from starred' });
        }
        
        items.push({ action: 'divider', icon: '', label: '' });
        items.push({ action: 'info', icon: 'fas fa-info-circle', label: 'Properties' });
        items.push({ action: 'divider', icon: '', label: '' });
        items.push({ action: 'delete', icon: 'fas fa-trash-alt', label: 'Move to trash', danger: true });
        
        return items;
    }
    
    closeAllContextMenus() {
        document.querySelectorAll('.context-menu').forEach(menu => {
            menu.style.opacity = '0';
            menu.style.transform = 'translateY(-10px)';
            
            setTimeout(() => {
                if (menu.parentNode) {
                    menu.remove();
                }
            }, 200);
        });
        
        this.activeContextMenu = null;
    }
    
    async handleFileAction(action, fileId) {
        if (!window.Drive || !fileId) return;
        
        const file = Drive.getFileById(fileId);
        if (!file) return;
        
        switch (action) {
            case 'preview':
                Drive.previewFile(fileId);
                break;
                
            case 'download':
                try {
                    await Drive.downloadFile(fileId);
                    this.showSuccess(`Downloaded "${file.name}"`);
                } catch (error) {
                    this.showError('Download failed: ' + error.message);
                }
                break;
                
            case 'share':
                try {
                    const shareLink = await Drive.shareFile(fileId);
                    if (navigator.clipboard) {
                        await navigator.clipboard.writeText(shareLink);
                        this.showSuccess('Share link copied to clipboard');
                    } else {
                        prompt('Share link:', shareLink);
                    }
                } catch (error) {
                    this.showError('Share failed: ' + error.message);
                }
                break;
                
            case 'rename':
                const newName = prompt('Enter new name:', file.name);
                if (newName && newName !== file.name) {
                    try {
                        await Drive.renameFile(fileId, newName);
                        this.showSuccess('File renamed successfully');
                        this.refreshUI();
                    } catch (error) {
                        this.showError('Rename failed: ' + error.message);
                    }
                }
                break;
                
            case 'move':
                const destination = prompt('Enter destination folder ID or path:', 'root');
                if (destination) {
                    try {
                        await Drive.moveFile(fileId, destination);
                        this.showSuccess('File moved successfully');
                        this.refreshUI();
                    } catch (error) {
                        this.showError('Move failed: ' + error.message);
                    }
                }
                break;
                
            case 'copy':
                try {
                    await Drive.copyFile(fileId);
                    this.showSuccess('File copied successfully');
                    this.refreshUI();
                } catch (error) {
                    this.showError('Copy failed: ' + error.message);
                }
                break;
                
            case 'star':
                try {
                    await Drive.starFile(fileId, true);
                    this.showSuccess('Added to starred');
                    this.refreshUI();
                } catch (error) {
                    this.showError('Failed to star file: ' + error.message);
                }
                break;
                
            case 'unstar':
                try {
                    await Drive.starFile(fileId, false);
                    this.showSuccess('Removed from starred');
                    this.refreshUI();
                } catch (error) {
                    this.showError('Failed to unstar file: ' + error.message);
                }
                break;
                
            case 'info':
                this.showFileInfo(file);
                break;
                
            case 'delete':
                if (confirm(`Move "${file.name}" to trash?`)) {
                    try {
                        await Drive.deleteFile(fileId);
                        this.showSuccess('File moved to trash');
                        this.refreshUI();
                    } catch (error) {
                        this.showError('Delete failed: ' + error.message);
                    }
                }
                break;
        }
    }
    
    showFileInfo(file) {
        const modal = document.createElement('div');
        modal.className = 'modal';
        modal.id = 'file-info-modal';
        modal.innerHTML = `
            <div class="modal-content" style="max-width: 500px;">
                <div class="modal-header">
                    <h3><i class="fas fa-info-circle"></i> File Properties</h3>
                    <button class="btn-close"><i class="fas fa-times"></i></button>
                </div>
                <div class="modal-body">
                    <div class="file-info">
                        <div class="file-info-icon">
                            <i class="${this.getFileIcon(file.type)} fa-3x"></i>
                        </div>
                        <div class="file-info-details">
                            <h4>${file.name}</h4>
                            <div class="info-grid">
                                <div class="info-row">
                                    <span class="info-label">Type:</span>
                                    <span class="info-value">${file.type || 'File'}</span>
                                </div>
                                <div class="info-row">
                                    <span class="info-label">Size:</span>
                                    <span class="info-value">${this.formatFileSize(file.size)}</span>
                                </div>
                                <div class="info-row">
                                    <span class="info-label">Modified:</span>
                                    <span class="info-value">${new Date(file.modified).toLocaleString()}</span>
                                </div>
                                <div class="info-row">
                                    <span class="info-label">Created:</span>
                                    <span class="info-value">${new Date(file.created).toLocaleString()}</span>
                                </div>
                                ${file.owner ? `
                                <div class="info-row">
                                    <span class="info-label">Owner:</span>
                                    <span class="info-value">${file.owner}</span>
                                </div>
                                ` : ''}
                                ${file.shared ? `
                                <div class="info-row">
                                    <span class="info-label">Shared:</span>
                                    <span class="info-value">Yes</span>
                                </div>
                                ` : ''}
                                ${file.starred ? `
                                <div class="info-row">
                                    <span class="info-label">Starred:</span>
                                    <span class="info-value">Yes</span>
                                </div>
                                ` : ''}
                            </div>
                        </div>
                    </div>
                </div>
                <div class="modal-footer">
                    <button class="btn-secondary" id="close-info">Close</button>
                </div>
            </div>
        `;
        
        document.body.appendChild(modal);
        
        modal.querySelector('.btn-close').addEventListener('click', () => {
            modal.remove();
        });
        
        modal.querySelector('#close-info').addEventListener('click', () => {
            modal.remove();
        });
        
        modal.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                modal.remove();
            }
        });
        
        modal.classList.remove('hidden');
        this.modalOpen = true;
        document.body.style.overflow = 'hidden';
    }
    
    getFileIcon(fileType) {
        const icons = {
            'folder': 'fas fa-folder',
            'image': 'fas fa-image',
            'video': 'fas fa-video',
            'audio': 'fas fa-music',
            'document': 'fas fa-file-alt',
            'pdf': 'fas fa-file-pdf',
            'zip': 'fas fa-file-archive',
            'text': 'fas fa-file-alt',
            'code': 'fas fa-file-code',
            'spreadsheet': 'fas fa-file-excel',
            'presentation': 'fas fa-file-powerpoint'
        };
        
        return icons[fileType] || 'fas fa-file';
    }
    
    formatFileSize(bytes) {
        if (bytes === 0) return '0 Bytes';
        
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    }
    
    toggleFileSelection(fileId) {
        if (this.selectedFiles.has(fileId)) {
            this.selectedFiles.delete(fileId);
        } else {
            this.selectedFiles.add(fileId);
        }
        
        this.updateFileSelectionUI();
        this.updateActionButtons();
    }
    
    updateFileSelectionUI() {
        document.querySelectorAll('.file-item, .grid-item').forEach(item => {
            const fileId = item.dataset.id;
            if (fileId) {
                if (this.selectedFiles.has(fileId)) {
                    item.classList.add('selected');
                } else {
                    item.classList.remove('selected');
                }
            }
        });
        
        const selectionCounter = document.getElementById('selection-counter');
        if (selectionCounter) {
            if (this.selectedFiles.size > 0) {
                selectionCounter.textContent = `${this.selectedFiles.size} selected`;
                selectionCounter.classList.remove('hidden');
            } else {
                selectionCounter.classList.add('hidden');
            }
        }
    }
    
    addContextMenuButtons() {
        document.querySelectorAll('.file-item').forEach(item => {
            const fileId = item.dataset.id;
            if (fileId && !item.querySelector('.more-btn')) {
                const moreBtn = document.createElement('button');
                moreBtn.className = 'more-btn';
                moreBtn.dataset.fileId = fileId;
                moreBtn.innerHTML = '<i class="fas fa-ellipsis-v"></i>';
                moreBtn.title = 'More actions';
                
                const actionsCell = item.querySelector('.file-actions') || 
                                   item.querySelector('.actions') ||
                                   item.querySelector('td:last-child');
                
                if (actionsCell) {
                    actionsCell.appendChild(moreBtn);
                }
            }
        });
    }
    
    selectAllFiles() {
        if (!window.Drive) return;
        
        const files = Drive.getFiles();
        this.selectedFiles.clear();
        
        files.forEach(file => {
            this.selectedFiles.add(file.id);
        });
        
        this.updateFileSelectionUI();
        this.updateActionButtons();
    }
    
    clearSelection() {
        this.selectedFiles.clear();
        this.updateFileSelectionUI();
        this.updateActionButtons();
    }
    
    updateActionButtons() {
        const hasSelection = this.selectedFiles.size > 0;
        const singleSelection = this.selectedFiles.size === 1;
        
        const shareBtn = document.getElementById('share-file-btn');
        const moveBtn = document.getElementById('move-file-btn');
        const downloadBtn = document.getElementById('download-file-btn');
        const deleteBtn = document.getElementById('delete-file-btn');
        
        if (shareBtn) {
            shareBtn.disabled = !hasSelection;
            shareBtn.title = singleSelection ? 'Share selected file' : 'Share selected files';
        }
        
        if (moveBtn) {
            moveBtn.disabled = !hasSelection;
            moveBtn.title = hasSelection ? 'Move selected files' : 'Select files to move';
        }
        
        if (downloadBtn) {
            downloadBtn.disabled = !hasSelection;
            downloadBtn.title = hasSelection ? 'Download selected files' : 'Select files to download';
        }
        
        if (deleteBtn) {
            deleteBtn.disabled = !hasSelection;
            deleteBtn.title = hasSelection ? 'Delete selected files' : 'Select files to delete';
        }
    }
    
    async handleShareFile() {
        if (this.selectedFiles.size === 0) {
            this.showError('Please select files to share');
            return;
        }
        
        if (!window.Drive) {
            this.showError('Drive module not loaded');
            return;
        }
        
        try {
            const fileIds = Array.from(this.selectedFiles);
            const shareLinks = await Drive.shareFiles(fileIds);
            
            if (shareLinks.length === 1) {
                const shareLink = shareLinks[0];
                if (navigator.clipboard) {
                    await navigator.clipboard.writeText(shareLink);
                    this.showSuccess('Share link copied to clipboard');
                } else {
                    prompt('Share link:', shareLink);
                }
            } else {
                const shareText = shareLinks.join('\n\n');
                if (navigator.clipboard) {
                    await navigator.clipboard.writeText(shareText);
                    this.showSuccess(`${shareLinks.length} links copied to clipboard`);
                } else {
                    alert(`Share links:\n\n${shareText}`);
                }
            }
            
            this.clearSelection();
            
        } catch (error) {
            this.showError('Failed to share files: ' + error.message);
        }
    }
    
    async handleMoveFile() {
        if (this.selectedFiles.size === 0) {
            this.showError('Please select files to move');
            return;
        }
        
        if (!window.Drive) {
            this.showError('Drive module not loaded');
            return;
        }
        
        const destination = prompt('Enter destination folder ID or name:', 'root');
        if (!destination) return;
        
        try {
            const fileIds = Array.from(this.selectedFiles);
            await Drive.moveFiles(fileIds, destination);
            this.showSuccess(`Moved ${fileIds.length} file(s) successfully`);
            this.refreshUI();
            this.clearSelection();
        } catch (error) {
            this.showError('Failed to move files: ' + error.message);
        }
    }
    
    async handleDownloadFile() {
        if (this.selectedFiles.size === 0) {
            this.showError('Please select files to download');
            return;
        }
        
        if (!window.Drive) {
            this.showError('Drive module not loaded');
            return;
        }
        
        try {
            const fileIds = Array.from(this.selectedFiles);
            await Drive.downloadFiles(fileIds);
            this.showSuccess(`Downloaded ${fileIds.length} file(s)`);
            this.clearSelection();
        } catch (error) {
            this.showError('Download failed: ' + error.message);
        }
    }
    
    async handleDeleteFile() {
        if (this.selectedFiles.size === 0) {
            this.showError('Please select files to delete');
            return;
        }
        
        if (!confirm(`Move ${this.selectedFiles.size} selected file(s) to trash?`)) {
            return;
        }
        
        if (!window.Drive) {
            this.showError('Drive module not loaded');
            return;
        }
        
        try {
            const fileIds = Array.from(this.selectedFiles);
            await Drive.deleteFiles(fileIds);
            this.showSuccess(`Moved ${fileIds.length} file(s) to trash`);
            this.refreshUI();
            this.clearSelection();
        } catch (error) {
            this.showError('Delete failed: ' + error.message);
        }
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
    
    hideEmptyState() {
        const emptyState = document.getElementById('empty-state');
        if (emptyState) {
            emptyState.classList.add('hidden');
        }
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
        
        modal.querySelector('.btn-close').addEventListener('click', () => {
            modal.remove();
        });
        
        modal.querySelectorAll('.upgrade-option button').forEach(btn => {
            btn.addEventListener('click', () => {
                this.showSuccess('Upgrade feature coming soon!');
                modal.remove();
            });
        });
        
        modal.classList.remove('hidden');
        this.modalOpen = true;
        document.body.style.overflow = 'hidden';
    }
    
    checkMobile() {
        return window.innerWidth <= 768;
    }
    
    detectMobile() {
        this.isMobile = this.checkMobile();
        
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
        
        if (wasMobile !== this.isMobile) {
            if (this.isMobile) {
                this.closeSidebar();
            }
        }
    }
    
    goBack() {
        if (this.historyStack.length > 1) {
            window.history.back();
        } else {
            this.switchTab('home');
        }
    }
    
    updateAuthUI() {
        if (Auth.isLoggedIn() && Auth.user) {
            this.updateUserUI();
            this.updateStorageUI();
        }
    }
    
    updateUserUI() {
        if (Auth.user) {
            const avatar = document.getElementById('user-avatar');
            if (avatar) {
                avatar.src = Auth.user.picture || this.generateDefaultAvatar(Auth.user.name);
                avatar.alt = Auth.user.name;
            }
            
            const userName = document.getElementById('user-name');
            if (userName) {
                userName.textContent = Auth.user.name;
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
        
        const storageText = document.getElementById('sidebar-storage-text');
        if (storageText) {
            if (totalGB === 'Unlimited') {
                storageText.textContent = `${usedGB}GB used (Unlimited)`;
            } else {
                storageText.textContent = `${usedGB}GB of ${totalGB}GB used`;
            }
        }
        
        const storageFill = document.getElementById('sidebar-storage-fill');
        if (storageFill) {
            if (totalGB === 'Unlimited') {
                storageFill.style.width = '10%';
                storageFill.style.backgroundColor = '#00ff9d';
            } else {
                storageFill.style.width = `${percent}%`;
                
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
            
            setTimeout(() => {
                if (toast.parentNode) {
                    toast.style.opacity = '0';
                    setTimeout(() => toast.remove(), 300);
                }
            }, 5000);
            
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
            
            setTimeout(() => {
                if (toast.parentNode) {
                    toast.style.opacity = '0';
                    setTimeout(() => toast.remove(), 300);
                }
            }, 3000);
            
            toast.querySelector('.toast-close').addEventListener('click', () => {
                toast.style.opacity = '0';
                setTimeout(() => toast.remove(), 300);
            });
        }
    }
    
    showInfo(message) {
        const toast = document.createElement('div');
        toast.className = 'toast info';
        toast.innerHTML = `
            <i class="fas fa-info-circle"></i>
            <span>${message}</span>
            <button class="toast-close"><i class="fas fa-times"></i></button>
        `;
        
        const container = document.getElementById('toast-container');
        if (container) {
            container.appendChild(toast);
            
            setTimeout(() => {
                if (toast.parentNode) {
                    toast.style.opacity = '0';
                    setTimeout(() => toast.remove(), 300);
                }
            }, 4000);
            
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
    
    getSelectedFiles() {
        return Array.from(this.selectedFiles);
    }
    
    refreshUI() {
        this.updateTabUI();
        this.loadTabContent(this.currentTab);
        this.updateAuthUI();
        this.clearSelection();
    }
    
    isModalOpen() {
        return this.modalOpen;
    }
    
    openFolder(folderId, folderName) {
        this.breadcrumbHistory.push({ id: folderId, name: folderName });
        this.updateBreadcrumbs();
        
        if (window.Drive) {
            Drive.openFolder(folderId);
        }
    }
    
    updateBreadcrumbs() {
        const breadcrumbs = document.getElementById('breadcrumbs');
        if (!breadcrumbs) return;
        
        const existingCrumbs = breadcrumbs.querySelectorAll('.breadcrumb:not(.home)');
        existingCrumbs.forEach(crumb => crumb.remove());
        
        this.breadcrumbHistory.forEach((folder, index) => {
            const crumb = document.createElement('span');
            crumb.className = 'breadcrumb';
            crumb.textContent = folder.name;
            crumb.dataset.folderId = folder.id;
            
            crumb.addEventListener('click', () => {
                this.navigateToFolder(folder.id, index);
            });
            
            if (index < this.breadcrumbHistory.length - 1) {
                const separator = document.createElement('span');
                separator.className = 'breadcrumb-separator';
                separator.innerHTML = '<i class="fas fa-chevron-right"></i>';
                breadcrumbs.appendChild(separator);
            }
            
            breadcrumbs.appendChild(crumb);
        });
    }
    
    navigateToFolder(folderId, index) {
        this.breadcrumbHistory = this.breadcrumbHistory.slice(0, index + 1);
        this.updateBreadcrumbs();
        
        if (window.Drive) {
            Drive.openFolder(folderId);
        }
    }
}

// Create global UI instance
window.UI = new UIManager();
