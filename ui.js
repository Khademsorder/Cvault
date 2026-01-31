/* =========================================
   VAULT OS - UI MODULE (Ultimate Fixed Version)
   Contains fixes for FAB, Sync, Navigation, and Layout
   ========================================= */

class UIManager {
    constructor() {
        // Core State
        this.currentTab = 'home';
        this.sidebarOpen = false;
        this.fabMenuOpen = false;
        this.isMobile = window.innerWidth < 1024;
        
        // Settings State (Load from Storage)
        this.settings = {
            autoSync: localStorage.getItem('vault_auto_sync') !== 'false', // Default true
            darkMode: localStorage.getItem('vault_dark_mode') !== 'false', // Default true
            viewMode: localStorage.getItem('vault_view_mode') || 'grid'
        };

        // Initialize UI
        this.init();
    }

    /* =========================================
       1. INITIALIZATION & LIFECYCLE
       ========================================= */
    init() {
        console.log('🖥️ UI Manager Initializing...');
        
        // 1. Setup Interactions
        this.setupEventListeners();
        
        // 2. Apply Saved Preferences
        this.applyAllSettings();
        
        // 3. Setup Browser Navigation (Back Button Fix)
        this.setupNavigationHandling();
        
        // 4. Update Profile Info
        this.updateAuthUI();
        
        // 5. Watch for Screen Resize
        window.addEventListener('resize', () => this.handleResize());
    }

    /* =========================================
       2. EVENT LISTENERS (The Control Center)
       ========================================= */
    setupEventListeners() {
        // --- A. Main Navigation (Sidebar) ---
        document.getElementById('menu-toggle')?.addEventListener('click', (e) => {
            e.stopPropagation();
            this.toggleSidebar();
        });

        // Close sidebar when clicking outside on mobile
        document.addEventListener('click', (e) => {
            if (this.isMobile && this.sidebarOpen && 
                !e.target.closest('.sidebar') && 
                !e.target.closest('#menu-toggle')) {
                this.closeSidebar();
            }
        });

        // Tab Switching Logic
        document.querySelectorAll('.menu-item[data-tab], .nav-item[data-tab]').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.preventDefault();
                if (this.isMobile) this.closeSidebar();
                this.switchTab(e.currentTarget.dataset.tab);
            });
        });

        // --- B. Floating Action Button (FAB) - FIXED ---
        document.getElementById('fab-main')?.addEventListener('click', (e) => {
            e.stopPropagation();
            this.toggleFabMenu();
        });

        // Close FAB when clicking anywhere else
        document.addEventListener('click', (e) => {
            if (!e.target.closest('.fab-container')) this.closeFabMenu();
        });

        // 🟢 Upload Triggers (The Main Fix)
        document.getElementById('upload-file-btn')?.addEventListener('click', () => {
            document.getElementById('file-input')?.click();
            this.closeFabMenu();
        });

        document.getElementById('upload-folder-btn')?.addEventListener('click', () => {
            document.getElementById('folder-input')?.click();
            this.closeFabMenu();
        });

        document.getElementById('create-folder-btn')?.addEventListener('click', () => {
            // Safe prompt call
            setTimeout(() => {
                const name = prompt("Enter Folder Name:");
                if (name && window.Drive) window.Drive.createFolder(name);
            }, 100);
            this.closeFabMenu();
        });

        document.getElementById('create-note-btn')?.addEventListener('click', () => {
            this.showToast('Note feature coming soon!', 'info');
            this.closeFabMenu();
        });

        // --- C. Settings & Toggles ---
        
        // Auto Sync Toggle (Real-time)
        document.getElementById('auto-sync')?.addEventListener('change', (e) => {
            this.settings.autoSync = e.target.checked;
            this.toggleSyncWidget(e.target.checked);
            this.saveSettingsToStorage(); // Auto save
        });

        // Dark Mode Toggle
        document.getElementById('dark-mode')?.addEventListener('change', (e) => {
            this.settings.darkMode = e.target.checked;
            this.applyTheme();
            this.saveSettingsToStorage(); // Auto save
        });

        // Open Settings Modal
        document.querySelectorAll('#tab-settings, #account-settings, #manage-drive').forEach(btn => {
            btn.addEventListener('click', () => this.openSettingsModal());
        });

        // Manual Save Button (Optional now since we auto-save, but good to keep)
        document.getElementById('save-settings')?.addEventListener('click', () => {
            this.saveSettingsToStorage();
            this.showToast('Settings Saved', 'success');
            document.getElementById('settings-modal')?.classList.add('hidden');
        });

        // Drive Connection UI
        document.getElementById('drive-status-toggle')?.addEventListener('click', (e) => {
            e.stopPropagation();
            document.getElementById('drive-status-dropdown')?.classList.toggle('hidden');
        });
        
        document.getElementById('reconnect-drive')?.addEventListener('click', () => {
            document.getElementById('drive-connect-modal')?.classList.remove('hidden');
            document.getElementById('drive-status-dropdown')?.classList.add('hidden');
        });

        // --- D. View Controls & Search ---
        document.getElementById('view-grid')?.addEventListener('click', () => this.switchView('grid'));
        document.getElementById('view-list')?.addEventListener('click', () => this.switchView('list'));

        // Search Clear Fix
        document.getElementById('clear-search')?.addEventListener('click', () => {
            const input = document.getElementById('search-input');
            if (input) {
                input.value = '';
                // Dispatch event so Drive.js detects the change
                input.dispatchEvent(new Event('input')); 
            }
        });

        // --- E. Modal Management ---
        document.querySelectorAll('.btn-close').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const modal = e.target.closest('.modal');
                if (modal) modal.classList.add('hidden');
            });
        });

        // Gallery Filters
        document.querySelectorAll('.category-card').forEach(card => {
            card.addEventListener('click', () => this.filterGallery(card.dataset.type));
        });
    }

    /* =========================================
       3. NAVIGATION & BROWSER HISTORY (New Fix)
       ========================================= */
    setupNavigationHandling() {
        // Handle Browser Back Button
        window.onpopstate = (event) => {
            if (event.state) {
                // Restore Tab
                if (event.state.tab && event.state.tab !== this.currentTab) {
                    this.switchTab(event.state.tab, false); // false = don't push state again
                }
                // Restore Folder
                if (event.state.folderId && window.Drive) {
                    window.Drive.loadFiles(event.state.folderId);
                }
            } else {
                // Default back to home root
                this.switchTab('home', false);
                if (window.Drive) window.Drive.loadFiles('root');
            }
        };
    }

    switchTab(tabId, pushState = true) {
        this.currentTab = tabId;
        
        // 1. Update Visuals
        document.querySelectorAll('.menu-item, .nav-item').forEach(el => {
            el.classList.toggle('active', el.dataset.tab === tabId);
        });

        // 2. Hide All Sections
        ['file-container', 'gallery-categories', 'settings-content', 'empty-state'].forEach(id => {
            document.getElementById(id)?.classList.add('hidden');
        });
        document.getElementById('settings-modal')?.classList.add('hidden');

        // 3. Show Specific Section
        if (tabId === 'settings') {
            this.openSettingsModal();
            return;
        }

        // Show File Container
        document.getElementById('file-container')?.classList.remove('hidden');
        const breadcrumbs = document.getElementById('breadcrumbs');

        if (tabId === 'gallery') {
            document.getElementById('gallery-categories')?.classList.remove('hidden');
            breadcrumbs?.classList.add('hidden');
        } else {
            breadcrumbs?.classList.remove('hidden');
        }

        // 4. Trigger Data Load
        if (window.Drive) {
            const folderId = (tabId === 'home') ? 'root' : tabId;
            window.Drive.loadFiles(folderId);
        }

        // 5. Update Browser History
        if (pushState) {
            history.pushState({ tab: tabId, folderId: 'root' }, '', `#${tabId}`);
        }
    }

    /* =========================================
       4. SETTINGS & APPEARANCE LOGIC
       ========================================= */
    applyAllSettings() {
        // Theme
        this.applyTheme();
        
        // View Mode
        this.switchView(this.settings.viewMode);
        
        // Sync Status
        this.toggleSyncWidget(this.settings.autoSync);
        
        // Update Modal Inputs (Sync visuals with reality)
        const syncCheck = document.getElementById('auto-sync');
        if (syncCheck) syncCheck.checked = this.settings.autoSync;
        
        const darkCheck = document.getElementById('dark-mode');
        if (darkCheck) darkCheck.checked = this.settings.darkMode;
    }

    applyTheme() {
        if (this.settings.darkMode) {
            document.body.classList.remove('light-mode');
        } else {
            document.body.classList.add('light-mode');
        }
    }

    toggleSyncWidget(show) {
        const widget = document.getElementById('sync-status-widget');
        if (show) widget?.classList.remove('hidden');
        else widget?.classList.add('hidden');
    }

    saveSettingsToStorage() {
        localStorage.setItem('vault_auto_sync', this.settings.autoSync);
        localStorage.setItem('vault_dark_mode', this.settings.darkMode);
        localStorage.setItem('vault_view_mode', this.settings.viewMode);
    }

    openSettingsModal() {
        document.getElementById('settings-modal')?.classList.remove('hidden');
        this.applyAllSettings(); // Ensure UI matches state
    }

    /* =========================================
       5. COMPONENT HELPERS
       ========================================= */
    toggleSidebar() {
        this.sidebarOpen = !this.sidebarOpen;
        const sidebar = document.getElementById('sidebar');
        const icon = document.querySelector('#menu-toggle i');
        
        if (this.sidebarOpen) {
            sidebar?.classList.add('active');
            if(icon) icon.className = 'fas fa-times';
        } else {
            sidebar?.classList.remove('active');
            if(icon) icon.className = 'fas fa-bars';
        }
    }

    closeSidebar() {
        this.sidebarOpen = false;
        document.getElementById('sidebar')?.classList.remove('active');
        const icon = document.querySelector('#menu-toggle i');
        if(icon) icon.className = 'fas fa-bars';
    }

    toggleFabMenu() {
        this.fabMenuOpen = !this.fabMenuOpen;
        const menu = document.getElementById('fab-menu');
        const icon = document.getElementById('fab-icon');
        
        menu?.classList.toggle('hidden', !this.fabMenuOpen);
        
        if(icon) {
            icon.className = this.fabMenuOpen ? 'fas fa-times' : 'fas fa-plus';
            icon.style.transform = this.fabMenuOpen ? 'rotate(90deg)' : 'rotate(0deg)';
        }
    }

    closeFabMenu() {
        this.fabMenuOpen = false;
        document.getElementById('fab-menu')?.classList.add('hidden');
        const icon = document.getElementById('fab-icon');
        if(icon) {
            icon.className = 'fas fa-plus';
            icon.style.transform = 'rotate(0deg)';
        }
    }

    switchView(mode) {
        this.settings.viewMode = mode;
        this.saveSettingsToStorage();

        // Button States
        document.getElementById('view-grid')?.classList.toggle('active', mode === 'grid');
        document.getElementById('view-list')?.classList.toggle('active', mode === 'list');
        
        // Container States
        const grid = document.getElementById('file-grid');
        const list = document.getElementById('file-list');
        
        if (mode === 'grid') {
            grid?.classList.remove('hidden'); list?.classList.add('hidden');
        } else {
            list?.classList.remove('hidden'); grid?.classList.add('hidden');
        }
        
        // Re-render Drive files to adjust layout
        if (window.Drive) window.Drive.renderFiles();
    }

    handleResize() {
        const wasMobile = this.isMobile;
        this.isMobile = window.innerWidth < 1024;
        if (wasMobile && !this.isMobile) this.closeSidebar();
    }

    filterGallery(type) {
        document.querySelectorAll('.category-card').forEach(c => c.classList.remove('active'));
        document.querySelector(`.category-card[data-type="${type}"]`)?.classList.add('active');
        if (window.Drive) window.Drive.filterFiles(type);
    }

    /* =========================================
       6. UTILITIES & COMPATIBILITY LAYER
       (Essential for preventing crashes)
       ========================================= */
    showToast(message, type = 'info') {
        const container = document.getElementById('toast-container');
        if (!container) return;

        const toast = document.createElement('div');
        toast.className = `toast ${type}`;
        
        let icon = 'info-circle';
        if (type === 'success') icon = 'check-circle';
        if (type === 'error') icon = 'exclamation-circle';

        toast.innerHTML = `
            <i class="fas fa-${icon}"></i>
            <span>${message}</span>
            <button class="toast-close"><i class="fas fa-times"></i></button>
        `;

        container.appendChild(toast);

        // Animation
        setTimeout(() => toast.classList.add('show'), 10);

        // Auto remove
        setTimeout(() => {
            toast.style.opacity = '0';
            setTimeout(() => toast.remove(), 300);
        }, 3000);
        
        toast.querySelector('.toast-close').addEventListener('click', () => toast.remove());
    }

    // Aliases for external modules
    showSuccess(message) { this.showToast(message, 'success'); }
    showError(message) { this.showToast(message, 'error'); }
    getCurrentTab() { return this.currentTab; }
    getCurrentView() { return this.settings.viewMode; }
    isModalOpen() { return !!document.querySelector('.modal:not(.hidden)'); }
    refreshUI() { this.switchTab(this.currentTab); this.updateAuthUI(); }
    
    updateAuthUI() {
        if (window.Auth?.user?.photoURL) {
            const img = document.getElementById('user-avatar');
            if(img) img.src = window.Auth.user.photoURL;
        }
    }

    showLoading(isLoading) {
        const loader = document.getElementById('loading-state');
        if (isLoading) loader?.classList.remove('hidden');
        else loader?.classList.add('hidden');
    }
}

// Initialize Global Instance
window.UI = new UIManager();
console.log('✅ UI Module Loaded (Ultimate Version)');
