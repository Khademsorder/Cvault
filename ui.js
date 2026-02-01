/**
 * UI.JS - User Interface Management Module for Vault OS
 * Handles theme switching, view toggling, modal management, toast notifications,
 * settings management, and responsive design handling
 * Complete rebuild with modern UI patterns
 */

class UIManager {
    constructor() {
        this.currentTheme = 'cyber';
        this.currentView = 'grid'; // 'grid' or 'list'
        this.isDarkMode = false;
        this.modalStack = [];
        this.toastContainer = null;
        this.settings = this.loadSettings();
        this.isMobile = this.checkMobile();
        this.isTouch = this.checkTouch();
        this.sidebarOpen = !this.isMobile; // Desktop: open by default, Mobile: closed
        
        // Initialize
        this.init();
    }

    /**
     * Initialize UI Manager
     */
    init() {
        try {
            // Create toast container if it doesn't exist
            this.createToastContainer();
            
            // Load saved theme
            this.loadTheme();
            
            // Load saved view preference
            this.loadViewPreference();
            
            // Set up event listeners
            this.setupEventListeners();
            
            // Apply responsive classes
            this.applyResponsiveClasses();
            
            // Initialize modals
            this.initModals();
            
            // Initialize settings
            this.initSettings();
            
            console.log('UI: Initialized successfully');
        } catch (error) {
            console.error('UI: Initialization failed:', error);
        }
    }

    /**
     * Create toast container
     */
    createToastContainer() {
        if (!document.getElementById('toast-container')) {
            this.toastContainer = document.createElement('div');
            this.toastContainer.id = 'toast-container';
            this.toastContainer.className = 'toast-container';
            document.body.appendChild(this.toastContainer);
        } else {
            this.toastContainer = document.getElementById('toast-container');
        }
    }

    /**
     * Set up event listeners
     */
    setupEventListeners() {
        // Window resize for responsive design
        window.addEventListener('resize', () => this.handleResize());
        
        // Click outside modals to close
        document.addEventListener('click', (e) => this.handleOutsideClick(e));
        
        // Escape key to close modals
        document.addEventListener('keydown', (e) => this.handleEscapeKey(e));
        
        // Theme toggle button
        const themeToggle = document.getElementById('theme-toggle');
        if (themeToggle) {
            themeToggle.addEventListener('click', () => this.toggleTheme());
        }
        
        // View toggle buttons
        const gridViewBtn = document.getElementById('view-grid');
        const listViewBtn = document.getElementById('view-list');
        if (gridViewBtn) {
            gridViewBtn.addEventListener('click', () => this.switchView('grid'));
        }
        if (listViewBtn) {
            listViewBtn.addEventListener('click', () => this.switchView('list'));
        }
        
        // Settings button
        const settingsBtn = document.getElementById('settings-btn');
        if (settingsBtn) {
            settingsBtn.addEventListener('click', () => this.showSettingsModal());
        }
        
        // Close settings modal
        const closeSettingsBtn = document.getElementById('close-settings');
        if (closeSettingsBtn) {
            closeSettingsBtn.addEventListener('click', () => this.hideSettingsModal());
        }
        
        // Save settings
        const saveSettingsBtn = document.getElementById('save-settings');
        if (saveSettingsBtn) {
            saveSettingsBtn.addEventListener('click', () => this.saveSettings());
        }
        
        // Reset settings
        const resetSettingsBtn = document.getElementById('reset-settings');
        if (resetSettingsBtn) {
            resetSettingsBtn.addEventListener('click', () => this.resetSettings());
        }
        
        // Sidebar toggle
        const sidebarToggle = document.getElementById('sidebar-toggle');
        if (sidebarToggle) {
            sidebarToggle.addEventListener('click', () => this.toggleSidebar());
        }
        
        // Dark mode toggle
        const darkModeToggle = document.getElementById('dark-mode-toggle');
        if (darkModeToggle) {
            darkModeToggle.addEventListener('change', (e) => this.toggleDarkMode(e.target.checked));
        }
        
        // Auto-sync toggle
        const autoSyncToggle = document.getElementById('auto-sync-toggle');
        if (autoSyncToggle) {
            autoSyncToggle.addEventListener('change', (e) => this.toggleAutoSync(e.target.checked));
        }
        
        // Theme selector
        const themeSelector = document.getElementById('theme-selector');
        if (themeSelector) {
            themeSelector.addEventListener('change', (e) => this.changeTheme(e.target.value));
        }
        
        // Items per page selector
        const itemsPerPage = document.getElementById('items-per-page');
        if (itemsPerPage) {
            itemsPerPage.addEventListener('change', (e) => this.changeItemsPerPage(e.target.value));
        }
        
        // Thumbnail size selector
        const thumbnailSize = document.getElementById('thumbnail-size');
        if (thumbnailSize) {
            thumbnailSize.addEventListener('change', (e) => this.changeThumbnailSize(e.target.value));
        }
        
        // Clear cache button
        const clearCacheBtn = document.getElementById('clear-cache-btn');
        if (clearCacheBtn) {
            clearCacheBtn.addEventListener('click', () => this.clearCache());
        }
        
        // Debug panel toggle
        const debugToggle = document.getElementById('debug-toggle');
        if (debugToggle) {
            debugToggle.addEventListener('change', (e) => this.toggleDebugPanel(e.target.checked));
        }
    }

    /**
     * Initialize modals
     */
    initModals() {
        // Close all modals on init
        document.querySelectorAll('.modal').forEach(modal => {
            modal.classList.add('hidden');
        });
    }

    /**
     * Initialize settings
     */
    initSettings() {
        // Load settings into UI
        this.loadSettingsToUI();
    }

    /**
     * Handle window resize
     */
    handleResize() {
        this.isMobile = this.checkMobile();
        this.applyResponsiveClasses();
        
        // Auto-close sidebar on mobile when resizing to mobile
        if (this.isMobile && this.sidebarOpen) {
            this.closeSidebar();
        }
    }

    /**
     * Handle clicks outside of modals
     */
    handleOutsideClick(event) {
        // Close modal if clicking outside
        this.modalStack.forEach(modal => {
            if (modal && !modal.contains(event.target) && 
                !event.target.closest('[data-modal]') &&
                !event.target.closest('[data-modal]')) {
                this.closeModal(modal);
            }
        });
        
        // Close dropdowns
        document.querySelectorAll('.dropdown.open').forEach(dropdown => {
            if (!dropdown.contains(event.target) && !event.target.closest('.dropdown-toggle')) {
                dropdown.classList.remove('open');
            }
        });
    }

    /**
     * Handle escape key press
     */
    handleEscapeKey(event) {
        if (event.key === 'Escape') {
            // Close topmost modal
            if (this.modalStack.length > 0) {
                const modal = this.modalStack[this.modalStack.length - 1];
                this.closeModal(modal);
                event.preventDefault();
            }
            
            // Close all dropdowns
            document.querySelectorAll('.dropdown.open').forEach(dropdown => {
                dropdown.classList.remove('open');
            });
        }
    }

    /**
     * Check if device is mobile
     */
    checkMobile() {
        return window.innerWidth <= 768;
    }

    /**
     * Check if device supports touch
     */
    checkTouch() {
        return 'ontouchstart' in window || navigator.maxTouchPoints > 0;
    }

    /**
     * Apply responsive CSS classes
     */
    applyResponsiveClasses() {
        const body = document.body;
        
        // Remove existing responsive classes
        body.classList.remove('mobile', 'tablet', 'desktop', 'touch', 'no-touch');
        
        // Add appropriate classes
        if (this.isMobile) {
            body.classList.add('mobile');
        } else if (window.innerWidth <= 1024) {
            body.classList.add('tablet');
        } else {
            body.classList.add('desktop');
        }
        
        if (this.isTouch) {
            body.classList.add('touch');
        } else {
            body.classList.add('no-touch');
        }
        
        // Update sidebar state
        if (this.isMobile && this.sidebarOpen) {
            this.closeSidebar();
        }
    }

    /**
     * ==================== THEME MANAGEMENT ====================
     */

    /**
     * Load theme from storage
     */
    loadTheme() {
        try {
            const savedTheme = localStorage.getItem('vault_theme');
            if (savedTheme && window.VAULT_CONFIG && window.VAULT_CONFIG.themes[savedTheme]) {
                this.currentTheme = savedTheme;
                this.applyTheme(this.currentTheme);
            } else {
                this.applyTheme('cyber');
            }
        } catch (error) {
            console.error('UI: Failed to load theme:', error);
            this.applyTheme('cyber');
        }
    }

    /**
     * Apply theme to the app
     */
    applyTheme(themeName) {
        try {
            if (!window.VAULT_CONFIG || !window.VAULT_CONFIG.themes[themeName]) {
                themeName = 'cyber';
            }
            
            this.currentTheme = themeName;
            
            // Use VAULT_CONFIG's applyTheme method if available
            if (window.VAULT_CONFIG && window.VAULT_CONFIG.applyTheme) {
                window.VAULT_CONFIG.applyTheme(themeName);
            } else {
                // Fallback theme application
                this.applyThemeFallback(themeName);
            }
            
            // Update theme selector if it exists
            const themeSelector = document.getElementById('theme-selector');
            if (themeSelector) {
                themeSelector.value = themeName;
            }
            
            // Update theme toggle button icon
            this.updateThemeToggleButton();
            
            // Save theme preference
            localStorage.setItem('vault_theme', themeName);
            
            console.log(`UI: Theme changed to ${themeName}`);
            
        } catch (error) {
            console.error('UI: Failed to apply theme:', error);
        }
    }

    /**
     * Fallback theme application
     */
    applyThemeFallback(themeName) {
        const theme = window.VAULT_CONFIG?.themes[themeName] || window.VAULT_CONFIG?.themes.cyber;
        const colors = theme.colors;
        
        const root = document.documentElement;
        Object.entries(colors).forEach(([key, value]) => {
            root.style.setProperty(`--${key}`, value);
        });
        
        root.setAttribute('data-theme', themeName);
    }

    /**
     * Toggle between light/dark themes
     */
    toggleTheme() {
        const themes = ['cyber', 'dark', 'light', 'midnight', 'amoled'];
        const currentIndex = themes.indexOf(this.currentTheme);
        const nextIndex = (currentIndex + 1) % themes.length;
        this.applyTheme(themes[nextIndex]);
    }

    /**
     * Change theme from selector
     */
    changeTheme(themeName) {
        this.applyTheme(themeName);
    }

    /**
     * Update theme toggle button
     */
    updateThemeToggleButton() {
        const themeToggle = document.getElementById('theme-toggle');
        if (themeToggle) {
            const icons = {
                cyber: '🌌',
                dark: '🌙',
                light: '☀️',
                midnight: '🌠',
                amoled: '⚫'
            };
            themeToggle.innerHTML = icons[this.currentTheme] || '🎨';
            themeToggle.title = `Theme: ${this.currentTheme}`;
        }
    }

    /**
     * ==================== VIEW MANAGEMENT ====================
     */

    /**
     * Load view preference from storage
     */
    loadViewPreference() {
        try {
            const savedView = localStorage.getItem('vault_view');
            if (savedView === 'grid' || savedView === 'list') {
                this.currentView = savedView;
                this.applyView(this.currentView);
            }
        } catch (error) {
            console.error('UI: Failed to load view preference:', error);
        }
    }

    /**
     * Switch between grid and list view
     */
    switchView(viewType) {
        if (viewType !== 'grid' && viewType !== 'list') {
            return;
        }
        
        this.currentView = viewType;
        this.applyView(viewType);
        
        // Save preference
        localStorage.setItem('vault_view', viewType);
        
        // Update active button states
        this.updateViewButtons();
        
        console.log(`UI: View changed to ${viewType}`);
    }

    /**
     * Apply view to file list
     */
    applyView(viewType) {
        const fileList = document.getElementById('file-list');
        if (fileList) {
            fileList.classList.remove('grid-view', 'list-view');
            fileList.classList.add(`${viewType}-view`);
        }
        
        // Update view-specific classes
        document.body.classList.remove('grid-mode', 'list-mode');
        document.body.classList.add(`${viewType}-mode`);
    }

    /**
     * Update view toggle buttons
     */
    updateViewButtons() {
        const gridBtn = document.getElementById('view-grid');
        const listBtn = document.getElementById('view-list');
        
        if (gridBtn) {
            gridBtn.classList.toggle('active', this.currentView === 'grid');
        }
        if (listBtn) {
            listBtn.classList.toggle('active', this.currentView === 'list');
        }
    }

    /**
     * ==================== MODAL MANAGEMENT ====================
     */

    /**
     * Show modal
     */
    showModal(modalId, options = {}) {
        const modal = document.getElementById(modalId);
        if (!modal) {
            console.warn(`UI: Modal ${modalId} not found`);
            return null;
        }
        
        // Close any open modals if not stacking
        if (!options.stack) {
            this.closeAllModals();
        }
        
        // Show the modal
        modal.classList.remove('hidden');
        
        // Add to stack
        this.modalStack.push(modal);
        
        // Prevent body scrolling
        document.body.style.overflow = 'hidden';
        
        // Focus on first focusable element
        if (options.autoFocus !== false) {
            setTimeout(() => {
                const focusable = modal.querySelector('button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])');
                if (focusable) {
                    focusable.focus();
                }
            }, 100);
        }
        
        // Add backdrop if specified
        if (options.backdrop !== false) {
            this.createBackdrop();
        }
        
        // Call onShow callback
        if (options.onShow && typeof options.onShow === 'function') {
            options.onShow();
        }
        
        console.log(`UI: Modal ${modalId} shown`);
        return modal;
    }

    /**
     * Close modal
     */
    closeModal(modalElement) {
        if (!modalElement) return;
        
        // Hide modal
        modalElement.classList.add('hidden');
        
        // Remove from stack
        const index = this.modalStack.indexOf(modalElement);
        if (index > -1) {
            this.modalStack.splice(index, 1);
        }
        
        // Remove backdrop if no modals left
        if (this.modalStack.length === 0) {
            this.removeBackdrop();
            document.body.style.overflow = '';
        }
        
        console.log('UI: Modal closed');
    }

    /**
     * Close modal by ID
     */
    closeModalById(modalId) {
        const modal = document.getElementById(modalId);
        if (modal) {
            this.closeModal(modal);
        }
    }

    /**
     * Close all modals
     */
    closeAllModals() {
        while (this.modalStack.length > 0) {
            const modal = this.modalStack.pop();
            modal.classList.add('hidden');
        }
        
        this.removeBackdrop();
        document.body.style.overflow = '';
        
        console.log('UI: All modals closed');
    }

    /**
     * Create modal backdrop
     */
    createBackdrop() {
        let backdrop = document.querySelector('.modal-backdrop');
        if (!backdrop) {
            backdrop = document.createElement('div');
            backdrop.className = 'modal-backdrop';
            backdrop.addEventListener('click', () => this.closeAllModals());
            document.body.appendChild(backdrop);
        }
        backdrop.classList.add('active');
    }

    /**
     * Remove modal backdrop
     */
    removeBackdrop() {
        const backdrop = document.querySelector('.modal-backdrop');
        if (backdrop) {
            backdrop.classList.remove('active');
            setTimeout(() => {
                if (!backdrop.classList.contains('active')) {
                    backdrop.remove();
                }
            }, 300);
        }
    }

    /**
     * Show confirmation modal
     */
    showConfirm(options) {
        return new Promise((resolve) => {
            const modalId = 'confirm-modal';
            let modal = document.getElementById(modalId);
            
            if (!modal) {
                modal = document.createElement('div');
                modal.id = modalId;
                modal.className = 'modal confirm-modal';
                modal.innerHTML = `
                    <div class="modal-content">
                        <div class="modal-header">
                            <h3 id="confirm-title">Confirm</h3>
                            <button class="modal-close" data-close>&times;</button>
                        </div>
                        <div class="modal-body">
                            <p id="confirm-message">Are you sure?</p>
                        </div>
                        <div class="modal-footer">
                            <button id="confirm-cancel" class="btn btn-secondary">Cancel</button>
                            <button id="confirm-ok" class="btn btn-primary">OK</button>
                        </div>
                    </div>
                `;
                document.body.appendChild(modal);
                
                // Add event listeners
                modal.querySelector('[data-close]').addEventListener('click', () => {
                    this.closeModal(modal);
                    resolve(false);
                });
                
                modal.querySelector('#confirm-cancel').addEventListener('click', () => {
                    this.closeModal(modal);
                    resolve(false);
                });
                
                modal.querySelector('#confirm-ok').addEventListener('click', () => {
                    this.closeModal(modal);
                    resolve(true);
                });
            }
            
            // Set content
            document.getElementById('confirm-title').textContent = options.title || 'Confirm';
            document.getElementById('confirm-message').textContent = options.message || 'Are you sure?';
            
            // Customize buttons
            if (options.okText) {
                document.getElementById('confirm-ok').textContent = options.okText;
            }
            if (options.cancelText) {
                document.getElementById('confirm-cancel').textContent = options.cancelText;
            }
            
            // Show modal
            this.showModal(modalId, { backdrop: true });
        });
    }

    /**
     * Show alert modal
     */
    showAlert(message, title = 'Alert') {
        return new Promise((resolve) => {
            const modalId = 'alert-modal';
            let modal = document.getElementById(modalId);
            
            if (!modal) {
                modal = document.createElement('div');
                modal.id = modalId;
                modal.className = 'modal alert-modal';
                modal.innerHTML = `
                    <div class="modal-content">
                        <div class="modal-header">
                            <h3 id="alert-title">Alert</h3>
                            <button class="modal-close" data-close>&times;</button>
                        </div>
                        <div class="modal-body">
                            <p id="alert-message"></p>
                        </div>
                        <div class="modal-footer">
                            <button id="alert-ok" class="btn btn-primary">OK</button>
                        </div>
                    </div>
                `;
                document.body.appendChild(modal);
                
                // Add event listeners
                modal.querySelector('[data-close]').addEventListener('click', () => {
                    this.closeModal(modal);
                    resolve();
                });
                
                modal.querySelector('#alert-ok').addEventListener('click', () => {
                    this.closeModal(modal);
                    resolve();
                });
            }
            
            // Set content
            document.getElementById('alert-title').textContent = title;
            document.getElementById('alert-message').textContent = message;
            
            // Show modal
            this.showModal(modalId, { backdrop: true });
        });
    }

    /**
     * Show prompt modal
     */
    showPrompt(options) {
        return new Promise((resolve) => {
            const modalId = 'prompt-modal';
            let modal = document.getElementById(modalId);
            
            if (!modal) {
                modal = document.createElement('div');
                modal.id = modalId;
                modal.className = 'modal prompt-modal';
                modal.innerHTML = `
                    <div class="modal-content">
                        <div class="modal-header">
                            <h3 id="prompt-title">Prompt</h3>
                            <button class="modal-close" data-close>&times;</button>
                        </div>
                        <div class="modal-body">
                            <label id="prompt-message"></label>
                            <input type="text" id="prompt-input" class="form-input" placeholder="Enter value...">
                        </div>
                        <div class="modal-footer">
                            <button id="prompt-cancel" class="btn btn-secondary">Cancel</button>
                            <button id="prompt-ok" class="btn btn-primary">OK</button>
                        </div>
                    </div>
                `;
                document.body.appendChild(modal);
                
                // Add event listeners
                const handleClose = (value = null) => {
                    this.closeModal(modal);
                    resolve(value);
                };
                
                modal.querySelector('[data-close]').addEventListener('click', () => handleClose(null));
                modal.querySelector('#prompt-cancel').addEventListener('click', () => handleClose(null));
                modal.querySelector('#prompt-ok').addEventListener('click', () => {
                    const value = document.getElementById('prompt-input').value;
                    handleClose(value);
                });
                
                // Enter key support
                modal.querySelector('#prompt-input').addEventListener('keypress', (e) => {
                    if (e.key === 'Enter') {
                        const value = document.getElementById('prompt-input').value;
                        handleClose(value);
                    }
                });
            }
            
            // Set content
            document.getElementById('prompt-title').textContent = options.title || 'Prompt';
            document.getElementById('prompt-message').textContent = options.message || 'Enter value:';
            document.getElementById('prompt-input').value = options.defaultValue || '';
            document.getElementById('prompt-input').placeholder = options.placeholder || 'Enter value...';
            
            // Focus on input
            setTimeout(() => {
                document.getElementById('prompt-input').focus();
                document.getElementById('prompt-input').select();
            }, 100);
            
            // Show modal
            this.showModal(modalId, { backdrop: true });
        });
    }

    /**
     * ==================== TOAST NOTIFICATIONS ====================
     */

    /**
     * Show toast notification
     */
    showToast(message, type = 'info', duration = 5000) {
        if (!this.toastContainer) {
            this.createToastContainer();
        }
        
        const toast = document.createElement('div');
        toast.className = `toast toast-${type}`;
        toast.setAttribute('role', 'alert');
        
        // Set icon based on type
        const icons = {
            success: '✅',
            error: '❌',
            warning: '⚠️',
            info: 'ℹ️'
        };
        
        toast.innerHTML = `
            <div class="toast-icon">${icons[type] || icons.info}</div>
            <div class="toast-content">
                <div class="toast-message">${this.escapeHtml(message)}</div>
            </div>
            <button class="toast-close" aria-label="Close">×</button>
        `;
        
        // Add to container
        this.toastContainer.appendChild(toast);
        
        // Force reflow for animation
        toast.offsetHeight;
        toast.classList.add('show');
        
        // Auto remove after duration
        const autoRemove = setTimeout(() => {
            this.removeToast(toast);
        }, duration);
        
        // Close button
        const closeBtn = toast.querySelector('.toast-close');
        closeBtn.addEventListener('click', () => {
            clearTimeout(autoRemove);
            this.removeToast(toast);
        });
        
        // Hover pause
        toast.addEventListener('mouseenter', () => {
            clearTimeout(autoRemove);
        });
        
        toast.addEventListener('mouseleave', () => {
            setTimeout(() => {
                this.removeToast(toast);
            }, duration);
        });
        
        // Play notification sound for important toasts
        if (type === 'error' || type === 'success') {
            this.playNotificationSound(type);
        }
        
        console.log(`UI: Toast shown [${type}]: ${message}`);
        return toast;
    }

    /**
     * Remove toast
     */
    removeToast(toast) {
        toast.classList.remove('show');
        toast.classList.add('hide');
        
        setTimeout(() => {
            if (toast.parentNode) {
                toast.parentNode.removeChild(toast);
            }
        }, 300);
    }

    /**
     * Clear all toasts
     */
    clearAllToasts() {
        if (this.toastContainer) {
            this.toastContainer.innerHTML = '';
        }
    }

    /**
     * Play notification sound
     */
    playNotificationSound(type) {
        try {
            // Create audio context
            const audioContext = new (window.AudioContext || window.webkitAudioContext)();
            
            // Create oscillator
            const oscillator = audioContext.createOscillator();
            const gainNode = audioContext.createGain();
            
            // Configure based on type
            let frequency = 800;
            let duration = 0.1;
            
            switch (type) {
                case 'success':
                    frequency = 1000;
                    break;
                case 'error':
                    frequency = 400;
                    break;
                case 'warning':
                    frequency = 600;
                    break;
                case 'info':
                    frequency = 800;
                    break;
            }
            
            oscillator.connect(gainNode);
            gainNode.connect(audioContext.destination);
            
            oscillator.frequency.setValueAtTime(frequency, audioContext.currentTime);
            oscillator.type = 'sine';
            
            gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
            gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + duration);
            
            oscillator.start(audioContext.currentTime);
            oscillator.stop(audioContext.currentTime + duration);
            
        } catch (error) {
            console.warn('UI: Could not play notification sound:', error);
        }
    }

    /**
     * ==================== SETTINGS MANAGEMENT ====================
     */

    /**
     * Load settings from storage
     */
    loadSettings() {
        try {
            const saved = localStorage.getItem('vault_ui_settings');
            if (saved) {
                return JSON.parse(saved);
            }
        } catch (error) {
            console.error('UI: Failed to load settings:', error);
        }
        
        // Default settings
        return {
            theme: 'cyber',
            view: 'grid',
            darkMode: false,
            autoSync: true,
            itemsPerPage: 50,
            thumbnailSize: 200,
            animations: true,
            confirmDeletions: true,
            showHiddenFiles: false,
            debugMode: false
        };
    }

    /**
     * Save settings to storage
     */
    saveSettings() {
        try {
            // Get values from form
            const settings = {
                theme: document.getElementById('theme-selector')?.value || this.settings.theme,
                view: this.settings.view,
                darkMode: document.getElementById('dark-mode-toggle')?.checked || false,
                autoSync: document.getElementById('auto-sync-toggle')?.checked || true,
                itemsPerPage: parseInt(document.getElementById('items-per-page')?.value || 50),
                thumbnailSize: parseInt(document.getElementById('thumbnail-size')?.value || 200),
                animations: document.getElementById('animations-toggle')?.checked || true,
                confirmDeletions: document.getElementById('confirm-deletions-toggle')?.checked || true,
                showHiddenFiles: document.getElementById('show-hidden-files-toggle')?.checked || false,
                debugMode: document.getElementById('debug-toggle')?.checked || false
            };
            
            // Save to storage
            localStorage.setItem('vault_ui_settings', JSON.stringify(settings));
            this.settings = settings;
            
            // Apply changes
            this.applySettings(settings);
            
            // Show success message
            this.showToast('Settings saved successfully', 'success');
            
            // Close settings modal
            this.hideSettingsModal();
            
            console.log('UI: Settings saved', settings);
            
        } catch (error) {
            console.error('UI: Failed to save settings:', error);
            this.showToast('Failed to save settings', 'error');
        }
    }

    /**
     * Load settings into UI
     */
    loadSettingsToUI() {
        try {
            // Theme selector
            const themeSelector = document.getElementById('theme-selector');
            if (themeSelector) {
                themeSelector.value = this.settings.theme;
            }
            
            // Dark mode toggle
            const darkModeToggle = document.getElementById('dark-mode-toggle');
            if (darkModeToggle) {
                darkModeToggle.checked = this.settings.darkMode;
            }
            
            // Auto-sync toggle
            const autoSyncToggle = document.getElementById('auto-sync-toggle');
            if (autoSyncToggle) {
                autoSyncToggle.checked = this.settings.autoSync;
            }
            
            // Items per page
            const itemsPerPage = document.getElementById('items-per-page');
            if (itemsPerPage) {
                itemsPerPage.value = this.settings.itemsPerPage;
            }
            
            // Thumbnail size
            const thumbnailSize = document.getElementById('thumbnail-size');
            if (thumbnailSize) {
                thumbnailSize.value = this.settings.thumbnailSize;
            }
            
            // Animations toggle
            const animationsToggle = document.getElementById('animations-toggle');
            if (animationsToggle) {
                animationsToggle.checked = this.settings.animations;
            }
            
            // Confirm deletions toggle
            const confirmDeletionsToggle = document.getElementById('confirm-deletions-toggle');
            if (confirmDeletionsToggle) {
                confirmDeletionsToggle.checked = this.settings.confirmDeletions;
            }
            
            // Show hidden files toggle
            const showHiddenFilesToggle = document.getElementById('show-hidden-files-toggle');
            if (showHiddenFilesToggle) {
                showHiddenFilesToggle.checked = this.settings.showHiddenFiles;
            }
            
            // Debug toggle
            const debugToggle = document.getElementById('debug-toggle');
            if (debugToggle) {
                debugToggle.checked = this.settings.debugMode;
            }
            
        } catch (error) {
            console.error('UI: Failed to load settings to UI:', error);
        }
    }

    /**
     * Apply settings
     */
    applySettings(settings) {
        // Apply theme
        if (settings.theme && settings.theme !== this.currentTheme) {
            this.applyTheme(settings.theme);
        }
        
        // Apply view
        if (settings.view && settings.view !== this.currentView) {
            this.switchView(settings.view);
        }
        
        // Apply dark mode
        if (settings.darkMode !== undefined) {
            this.toggleDarkMode(settings.darkMode);
        }
        
        // Apply auto-sync
        if (settings.autoSync !== undefined) {
            this.toggleAutoSync(settings.autoSync);
        }
        
        // Apply animations
        if (settings.animations !== undefined) {
            this.toggleAnimations(settings.animations);
        }
        
        // Apply debug mode
        if (settings.debugMode !== undefined) {
            this.toggleDebugPanel(settings.debugMode);
        }
    }

    /**
     * Reset settings to defaults
     */
    resetSettings() {
        if (confirm('Are you sure you want to reset all settings to defaults?')) {
            // Clear settings
            localStorage.removeItem('vault_ui_settings');
            localStorage.removeItem('vault_theme');
            localStorage.removeItem('vault_view');
            
            // Reset to defaults
            this.settings = {
                theme: 'cyber',
                view: 'grid',
                darkMode: false,
                autoSync: true,
                itemsPerPage: 50,
                thumbnailSize: 200,
                animations: true,
                confirmDeletions: true,
                showHiddenFiles: false,
                debugMode: false
            };
            
            // Apply defaults
            this.applyTheme('cyber');
            this.switchView('grid');
            this.loadSettingsToUI();
            
            // Show success message
            this.showToast('Settings reset to defaults', 'success');
            
            console.log('UI: Settings reset to defaults');
        }
    }

    /**
     * Show settings modal
     */
    showSettingsModal() {
        // Load current settings into UI
        this.loadSettingsToUI();
        
        // Show modal
        this.showModal('settings-modal', { backdrop: true });
    }

    /**
     * Hide settings modal
     */
    hideSettingsModal() {
        this.closeModalById('settings-modal');
    }

    /**
     * Toggle dark mode
     */
    toggleDarkMode(enabled) {
        this.isDarkMode = enabled;
        document.body.classList.toggle('dark-mode', enabled);
        
        // Save to settings
        this.settings.darkMode = enabled;
        this.saveSettingsToStorage();
        
        console.log(`UI: Dark mode ${enabled ? 'enabled' : 'disabled'}`);
    }

    /**
     * Toggle auto-sync
     */
    toggleAutoSync(enabled) {
        if (window.driveManager) {
            if (enabled) {
                window.driveManager.startAutoSync();
            } else {
                window.driveManager.stopAutoSync();
            }
        }
        
        // Save to settings
        this.settings.autoSync = enabled;
        this.saveSettingsToStorage();
        
        console.log(`UI: Auto-sync ${enabled ? 'enabled' : 'disabled'}`);
    }

    /**
     * Toggle animations
     */
    toggleAnimations(enabled) {
        document.body.classList.toggle('no-animations', !enabled);
        
        // Save to settings
        this.settings.animations = enabled;
        this.saveSettingsToStorage();
        
        console.log(`UI: Animations ${enabled ? 'enabled' : 'disabled'}`);
    }

    /**
     * Change items per page
     */
    changeItemsPerPage(value) {
        const items = parseInt(value);
        if (!isNaN(items) && items > 0) {
            this.settings.itemsPerPage = items;
            this.saveSettingsToStorage();
            
            // Notify drive manager if available
            if (window.driveManager && window.driveManager.PAGE_SIZE !== items) {
                window.driveManager.PAGE_SIZE = items;
            }
            
            console.log(`UI: Items per page changed to ${items}`);
        }
    }

    /**
     * Change thumbnail size
     */
    changeThumbnailSize(value) {
        const size = parseInt(value);
        if (!isNaN(size) && size > 0) {
            this.settings.thumbnailSize = size;
            this.saveSettingsToStorage();
            
            // Update CSS variable
            document.documentElement.style.setProperty('--thumbnail-size', `${size}px`);
            
            console.log(`UI: Thumbnail size changed to ${size}px`);
        }
    }

    /**
     * Save settings to storage
     */
    saveSettingsToStorage() {
        try {
            localStorage.setItem('vault_ui_settings', JSON.stringify(this.settings));
        } catch (error) {
            console.error('UI: Failed to save settings to storage:', error);
        }
    }

    /**
     * ==================== SIDEBAR MANAGEMENT ====================
     */

    /**
     * Toggle sidebar
     */
    toggleSidebar() {
        if (this.sidebarOpen) {
            this.closeSidebar();
        } else {
            this.openSidebar();
        }
    }

    /**
     * Open sidebar
     */
    openSidebar() {
        document.body.classList.add('sidebar-open');
        this.sidebarOpen = true;
        
        // Update toggle button
        const toggleBtn = document.getElementById('sidebar-toggle');
        if (toggleBtn) {
            toggleBtn.innerHTML = '◀';
            toggleBtn.title = 'Close sidebar';
        }
    }

    /**
     * Close sidebar
     */
    closeSidebar() {
        document.body.classList.remove('sidebar-open');
        this.sidebarOpen = false;
        
        // Update toggle button
        const toggleBtn = document.getElementById('sidebar-toggle');
        if (toggleBtn) {
            toggleBtn.innerHTML = '▶';
            toggleBtn.title = 'Open sidebar';
        }
    }

    /**
     * ==================== CACHE MANAGEMENT ====================
     */

    /**
     * Clear cache
     */
    async clearCache() {
        if (confirm('Clear all cache? This will remove temporary files and settings.')) {
            try {
                // Clear drive cache if available
                if (window.driveManager && window.driveManager.clearCache) {
                    window.driveManager.clearCache();
                }
                
                // Clear various caches
                const cacheKeys = [
                    'vault_file_cache_v3',
                    'vault_thumbnail_cache_v3',
                    'vault_metadata_cache_v3',
                    'vault_storage_cache_v3',
                    'vault_debug_logs_v3',
                    'vault_error_logs_v3'
                ];
                
                cacheKeys.forEach(key => {
                    localStorage.removeItem(key);
                });
                
                // Clear service worker cache
                if ('caches' in window) {
                    const cacheNames = await caches.keys();
                    await Promise.all(
                        cacheNames.map(cacheName => caches.delete(cacheName))
                    );
                }
                
                // Show success
                this.showToast('Cache cleared successfully', 'success');
                
                console.log('UI: Cache cleared');
                
            } catch (error) {
                console.error('UI: Failed to clear cache:', error);
                this.showToast('Failed to clear cache', 'error');
            }
        }
    }

    /**
     * ==================== DEBUG PANEL ====================
     */

    /**
     * Toggle debug panel
     */
    toggleDebugPanel(enabled) {
        const debugPanel = document.getElementById('debug-panel');
        if (debugPanel) {
            if (enabled) {
                debugPanel.classList.remove('hidden');
                this.updateDebugInfo();
                // Start periodic updates
                this.debugInterval = setInterval(() => this.updateDebugInfo(), 5000);
            } else {
                debugPanel.classList.add('hidden');
                // Stop periodic updates
                if (this.debugInterval) {
                    clearInterval(this.debugInterval);
                    this.debugInterval = null;
                }
            }
        }
        
        // Save to settings
        this.settings.debugMode = enabled;
        this.saveSettingsToStorage();
        
        console.log(`UI: Debug panel ${enabled ? 'enabled' : 'disabled'}`);
    }

    /**
     * Update debug information
     */
    updateDebugInfo() {
        const debugPanel = document.getElementById('debug-panel');
        if (!debugPanel) return;
        
        try {
            // Get system info
            const info = {
                userAgent: navigator.userAgent.substring(0, 50) + '...',
                online: navigator.onLine,
                memory: performance.memory ? 
                    `${Math.round(performance.memory.usedJSHeapSize / 1048576)}MB / ${Math.round(performance.memory.totalJSHeapSize / 1048576)}MB` : 
                    'N/A',
                cookies: navigator.cookieEnabled,
                language: navigator.language,
                platform: navigator.platform,
                cores: navigator.hardwareConcurrency || 'N/A',
                theme: this.currentTheme,
                view: this.currentView,
                mobile: this.isMobile,
                touch: this.isTouch
            };
            
            // Update debug content
            let debugHTML = '<h4>System Information</h4><ul>';
            Object.entries(info).forEach(([key, value]) => {
                debugHTML += `<li><strong>${key}:</strong> ${value}</li>`;
            });
            debugHTML += '</ul>';
            
            // Add app-specific info
            if (window.driveManager) {
                debugHTML += `
                    <h4>Drive Information</h4>
                    <ul>
                        <li><strong>Files loaded:</strong> ${window.driveManager.files?.length || 0}</li>
                        <li><strong>Folders loaded:</strong> ${window.driveManager.folders?.length || 0}</li>
                        <li><strong>Current folder:</strong> ${window.driveManager.currentFolder}</li>
                        <li><strong>Auto-sync:</strong> ${window.driveManager.syncInterval ? 'Enabled' : 'Disabled'}</li>
                    </ul>
                `;
            }
            
            debugPanel.innerHTML = debugHTML;
            
        } catch (error) {
            debugPanel.innerHTML = '<p>Error loading debug info</p>';
        }
    }

    /**
     * ==================== UTILITY METHODS ====================
     */

    /**
     * Escape HTML to prevent XSS
     */
    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    /**
     * Show loading overlay
     */
    showLoading(message = 'Loading...') {
        let overlay = document.getElementById('loading-overlay');
        
        if (!overlay) {
            overlay = document.createElement('div');
            overlay.id = 'loading-overlay';
            overlay.className = 'loading-overlay';
            overlay.innerHTML = `
                <div class="loading-spinner"></div>
                <div class="loading-message">${this.escapeHtml(message)}</div>
            `;
            document.body.appendChild(overlay);
        } else {
            overlay.classList.remove('hidden');
            overlay.querySelector('.loading-message').textContent = message;
        }
        
        return overlay;
    }

    /**
     * Hide loading overlay
     */
    hideLoading() {
        const overlay = document.getElementById('loading-overlay');
        if (overlay) {
            overlay.classList.add('hidden');
        }
    }

    /**
     * Update breadcrumb navigation
     */
    updateBreadcrumb(path, folderId) {
        const breadcrumb = document.getElementById('breadcrumb');
        if (!breadcrumb) return;
        
        // Create breadcrumb HTML
        let html = '<a href="#" data-folder="root" class="breadcrumb-item">My Drive</a>';
        
        if (path && Array.isArray(path)) {
            path.forEach((item, index) => {
                html += `<span class="breadcrumb-separator">/</span>`;
                if (index === path.length - 1) {
                    html += `<span class="breadcrumb-item active">${this.escapeHtml(item.name)}</span>`;
                } else {
                    html += `<a href="#" data-folder="${item.id}" class="breadcrumb-item">${this.escapeHtml(item.name)}</a>`;
                }
            });
        }
        
        breadcrumb.innerHTML = html;
        
        // Add click handlers
        breadcrumb.querySelectorAll('a[data-folder]').forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                const folderId = link.dataset.folder;
                if (window.driveManager && folderId) {
                    window.driveManager.navigateToFolder(folderId, link.textContent);
                }
            });
        });
    }

    /**
     * Update file list in UI
     */
    updateFileList(data) {
        const fileList = document.getElementById('file-list');
        if (!fileList) return;
        
        const { files, folders, currentFolder } = data;
        const allItems = [...folders, ...files];
        
        if (allItems.length === 0) {
            fileList.innerHTML = `
                <div class="empty-state">
                    <div class="empty-icon">📁</div>
                    <h3>No files found</h3>
                    <p>This folder is empty</p>
                    <button id="upload-empty-btn" class="btn btn-primary">Upload Files</button>
                </div>
            `;
            
            // Add upload button handler
            document.getElementById('upload-empty-btn')?.addEventListener('click', () => {
                document.getElementById('upload-input')?.click();
            });
            
            return;
        }
        
        // Generate file list HTML based on current view
        let html = '';
        
        if (this.currentView === 'grid') {
            html = '<div class="grid-container">';
            allItems.forEach(item => {
                html += this.createGridItem(item);
            });
            html += '</div>';
        } else {
            html = '<div class="list-container"><table><thead><tr><th>Name</th><th>Size</th><th>Modified</th><th>Type</th><th>Actions</th></tr></thead><tbody>';
            allItems.forEach(item => {
                html += this.createListItem(item);
            });
            html += '</tbody></table></div>';
        }
        
        fileList.innerHTML = html;
        
        // Add event listeners to items
        this.addFileItemListeners();
    }

    /**
     * Create grid item HTML
     */
    createGridItem(item) {
        const icon = item.isFolder ? '📁' : this.getFileIcon(item.mimeType);
        const date = new Date(item.modified).toLocaleDateString();
        
        return `
            <div class="file-item grid-item" data-id="${item.id}" data-type="${item.isFolder ? 'folder' : 'file'}">
                <div class="file-icon">${icon}</div>
                <div class="file-name" title="${this.escapeHtml(item.name)}">${this.escapeHtml(item.name)}</div>
                <div class="file-meta">
                    <span class="file-size">${item.size}</span>
                    <span class="file-date">${date}</span>
                </div>
                <div class="file-actions">
                    <button class="btn-icon btn-download" title="Download" ${item.isFolder ? 'disabled' : ''}>
                        ⤓
                    </button>
                    <button class="btn-icon btn-delete" title="Delete">
                        🗑️
                    </button>
                </div>
            </div>
        `;
    }

    /**
     * Create list item HTML
     */
    createListItem(item) {
        const icon = item.isFolder ? '📁' : this.getFileIcon(item.mimeType);
        const date = new Date(item.modified).toLocaleDateString();
        const type = item.isFolder ? 'Folder' : this.getFileType(item.mimeType);
        
        return `
            <tr class="file-item list-item" data-id="${item.id}" data-type="${item.isFolder ? 'folder' : 'file'}">
                <td>
                    <span class="file-icon">${icon}</span>
                    <span class="file-name" title="${this.escapeHtml(item.name)}">${this.escapeHtml(item.name)}</span>
                </td>
                <td class="file-size">${item.size}</td>
                <td class="file-date">${date}</td>
                <td class="file-type">${type}</td>
                <td class="file-actions">
                    <button class="btn-icon btn-open" title="Open">
                        👁️
                    </button>
                    <button class="btn-icon btn-download" title="Download" ${item.isFolder ? 'disabled' : ''}>
                        ⤓
                    </button>
                    <button class="btn-icon btn-delete" title="Delete">
                        🗑️
                    </button>
                </td>
            </tr>
        `;
    }

    /**
     * Get file icon based on MIME type
     */
    getFileIcon(mimeType) {
        if (!mimeType) return '📄';
        
        if (mimeType.includes('image')) return '🖼️';
        if (mimeType.includes('video')) return '🎬';
        if (mimeType.includes('audio')) return '🎵';
        if (mimeType.includes('pdf')) return '📕';
        if (mimeType.includes('zip') || mimeType.includes('rar')) return '📦';
        if (mimeType.includes('document') || mimeType.includes('word')) return '📝';
        if (mimeType.includes('sheet') || mimeType.includes('excel')) return '📊';
        
        return '📄';
    }

    /**
     * Get file type from MIME type
     */
    getFileType(mimeType) {
        if (!mimeType) return 'File';
        
        if (mimeType.includes('image')) return 'Image';
        if (mimeType.includes('video')) return 'Video';
        if (mimeType.includes('audio')) return 'Audio';
        if (mimeType.includes('pdf')) return 'PDF';
        if (mimeType.includes('zip')) return 'ZIP';
        if (mimeType.includes('rar')) return 'RAR';
        if (mimeType.includes('document') || mimeType.includes('word')) return 'Document';
        if (mimeType.includes('sheet') || mimeType.includes('excel')) return 'Spreadsheet';
        
        return 'File';
    }

    /**
     * Add event listeners to file items
     */
    addFileItemListeners() {
        document.querySelectorAll('.file-item').forEach(item => {
            const fileId = item.dataset.id;
            const fileType = item.dataset.type;
            const fileName = item.querySelector('.file-name')?.textContent || '';
            
            // Open/click handler
            item.addEventListener('click', (e) => {
                if (!e.target.closest('.file-actions')) {
                    if (fileType === 'folder') {
                        if (window.driveManager) {
                            window.driveManager.navigateToFolder(fileId, fileName);
                        }
                    } else {
                        // Open file in media viewer
                        if (window.openMediaViewer) {
                            // Find the file data
                            const fileData = this.findFileData(fileId);
                            if (fileData) {
                                window.openMediaViewer(fileData);
                            }
                        }
                    }
                }
            });
            
            // Download button
            const downloadBtn = item.querySelector('.btn-download');
            if (downloadBtn) {
                downloadBtn.addEventListener('click', (e) => {
                    e.stopPropagation();
                    if (fileType !== 'folder' && window.driveManager) {
                        window.driveManager.downloadFile(fileId, fileName);
                    }
                });
            }
            
            // Delete button
            const deleteBtn = item.querySelector('.btn-delete');
            if (deleteBtn) {
                deleteBtn.addEventListener('click', (e) => {
                    e.stopPropagation();
                    this.showConfirm({
                        title: 'Delete File',
                        message: `Are you sure you want to delete "${fileName}"?`,
                        okText: 'Delete',
                        cancelText: 'Cancel'
                    }).then(confirmed => {
                        if (confirmed && window.driveManager) {
                            window.driveManager.deleteFile(fileId, fileName);
                        }
                    });
                });
            }
        });
    }

    /**
     * Find file data by ID
     */
    findFileData(fileId) {
        // This is a helper method - actual implementation would search in driveManager
        if (window.driveManager) {
            const allFiles = [...(window.driveManager.files || []), ...(window.driveManager.folders || [])];
            return allFiles.find(file => file.id === fileId);
        }
        return null;
    }

    /**
     * Update storage info in UI
     */
    updateStorageInfo(info) {
        const storageText = document.getElementById('storage-text');
        const storageBar = document.getElementById('storage-bar');
        
        if (!info || !storageText || !storageBar) return;
        
        const usedGB = (info.used / (1024 * 1024 * 1024)).toFixed(2);
        const totalGB = info.isUnlimited ? 'Unlimited' : (info.total / (1024 * 1024 * 1024)).toFixed(2);
        const percent = info.percentage || 0;
        
        // Update text
        if (info.isUnlimited) {
            storageText.textContent = `${usedGB}GB used (Unlimited)`;
        } else {
            storageText.textContent = `${usedGB}GB of ${totalGB}GB used`;
        }
        
        // Update progress bar
        storageBar.style.width = `${Math.min(percent, 100)}%`;
        
        // Color based on usage
        if (percent > 90) {
            storageBar.style.backgroundColor = 'var(--error)';
        } else if (percent > 75) {
            storageBar.style.backgroundColor = 'var(--warning)';
        } else if (percent > 50) {
            storageBar.style.backgroundColor = 'var(--accent)';
        } else {
            storageBar.style.backgroundColor = 'var(--primary)';
        }
    }

    /**
     * Update sync status in UI
     */
    updateSyncStatus(syncing) {
        const syncIndicator = document.getElementById('sync-indicator');
        if (syncIndicator) {
            if (syncing) {
                syncIndicator.classList.add('syncing');
                syncIndicator.title = 'Syncing...';
            } else {
                syncIndicator.classList.remove('syncing');
                syncIndicator.title = 'Up to date';
            }
        }
    }

    /**
     * Apply filter to file list
     */
    applyFilter(filterType) {
        const fileItems = document.querySelectorAll('.file-item');
        fileItems.forEach(item => {
            const itemType = item.dataset.type;
            const mimeType = item.dataset.mimeType || '';
            
            let show = true;
            
            switch (filterType) {
                case 'images':
                    show = mimeType.includes('image');
                    break;
                case 'videos':
                    show = mimeType.includes('video');
                    break;
                case 'documents':
                    show = mimeType.includes('document') || mimeType.includes('pdf') || 
                           mimeType.includes('word') || mimeType.includes('sheet');
                    break;
                case 'folders':
                    show = itemType === 'folder';
                    break;
                case 'all':
                default:
                    show = true;
            }
            
            item.style.display = show ? '' : 'none';
        });
    }
}

// Export as global variable
window.UIManager = UIManager;

// Create global UI functions
window.showToast = function(message, type = 'info') {
    if (window.uiManager) {
        window.uiManager.showToast(message, type);
    } else {
        console.log(`${type.toUpperCase()}: ${message}`);
    }
};

window.showConfirm = function(options) {
    if (window.uiManager) {
        return window.uiManager.showConfirm(options);
    } else {
        return Promise.resolve(confirm(options.message || 'Are you sure?'));
    }
};

window.showAlert = function(message, title) {
    if (window.uiManager) {
        return window.uiManager.showAlert(message, title);
    } else {
        alert(message);
        return Promise.resolve();
    }
};

window.showLoading = function(message) {
    if (window.uiManager) {
        return window.uiManager.showLoading(message);
    }
};

window.hideLoading = function() {
    if (window.uiManager) {
        window.uiManager.hideLoading();
    }
};

// Auto-initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    window.uiManager = new UIManager();
});

console.log('UI.JS loaded successfully');

