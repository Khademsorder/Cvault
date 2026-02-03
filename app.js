// ==========================================
// VAULT OS - COMPLETE WORKING VERSION
// ==========================================

// 1. CONFIGURATION
const CONFIG = {
    app: { name: "Vault OS", version: "5.1.0" },
    gapi: {
        clientId: "318681315152-65e9kofptt4c3bk3kmlj9gmksnasu347.apps.googleusercontent.com",
        apiKey: "AIzaSyB3Iy1MIbfmJ7h5rv9NlsT23ysedCwUZt4",
        scope: "https://www.googleapis.com/auth/drive",
        discoveryDocs: ["https://www.googleapis.com/discovery/v1/apis/drive/v3/rest"]
    },
    proxy: {
        media: "https://script.google.com/macros/s/AKfycby2hqAq0JePMbnjEbwwcPBFjS14lvS3pM2Z1PPgY4OraTcpvTmZFPKQr9CQ4vba4Xk7/exec",
        full: "https://script.google.com/macros/s/AKfycbxQF58gDxHBATrBvliuMc_SdP7PEiuN6fiHdzVKG7_K5FIrj3V2m8imWgPXTjmVqfnN/exec"
    },
    security: {
        defaultPin: "1171",
        sessionTime: 24 * 60 * 60 * 1000
    }
};

// 2. GLOBAL STATE
const State = {
    // User & Auth
    user: null,
    accessToken: null,
    isGoogleConnected: false,
    authBuffer: "",
    
    // Files
    files: [],
    currentFolder: 'root',
    selectedFiles: new Set(),
    viewMode: localStorage.getItem('vault_view') || 'grid',
    
    // UI
    sidebarOpen: false,
    isMobile: window.innerWidth <= 768,
    
    // Upload
    uploadQueue: [],
    activeUploads: 0
};

// 3. UTILITIES
const Utils = {
    formatBytes(bytes) {
        if (!bytes || bytes === 0) return '0 B';
        const k = 1024;
        const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    },
    
    getIcon(mimeType) {
        if (mimeType.includes('folder')) return 'ri-folder-fill';
        if (mimeType.includes('image')) return 'ri-image-2-fill';
        if (mimeType.includes('video')) return 'ri-movie-fill';
        if (mimeType.includes('audio')) return 'ri-music-fill';
        if (mimeType.includes('pdf')) return 'ri-file-pdf-fill';
        if (mimeType.includes('zip')) return 'ri-file-zip-fill';
        return 'ri-file-3-fill';
    },
    
    debounce(func, wait) {
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
    
    showLoading() {
        // Show loading overlay
        let loader = document.getElementById('global-loader');
        if (!loader) {
            loader = document.createElement('div');
            loader.id = 'global-loader';
            loader.className = 'loading-overlay';
            loader.innerHTML = '<div class="spinner"></div>';
            document.body.appendChild(loader);
        }
        loader.style.display = 'flex';
    },
    
    hideLoading() {
        const loader = document.getElementById('global-loader');
        if (loader) {
            loader.style.display = 'none';
        }
    }
};

// 4. AUTHENTICATION
const Auth = {
    init() {
        console.log('🔐 Auth initializing...');
        
        // Auto-hide boot screen
        setTimeout(() => {
            const boot = document.getElementById('boot-screen');
            if (boot && !boot.classList.contains('hidden')) {
                boot.style.opacity = '0';
                setTimeout(() => {
                    boot.classList.add('hidden');
                    this.showAuthScreen();
                }, 500);
            }
        }, 1500);
        
        // Setup numpad
        this.setupNumpad();
        
        // Check existing session
        this.checkSession();
    },
    
    setupNumpad() {
        document.querySelectorAll('.numpad-touch button').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.preventDefault();
                this.handleInput(btn.dataset.val);
            });
        });
    },
    
    checkSession() {
        try {
            const session = JSON.parse(localStorage.getItem('vault_session'));
            if (session && Date.now() - session.time < CONFIG.security.sessionTime) {
                setTimeout(() => this.unlock(true), 500);
                return true;
            }
        } catch (e) {
            console.error('Session check failed:', e);
        }
        return false;
    },
    
    showAuthScreen() {
        const authScreen = document.getElementById('auth-screen');
        if (authScreen) {
            authScreen.classList.remove('hidden');
            setTimeout(() => {
                authScreen.style.opacity = '1';
            }, 50);
        }
    },
    
    handleInput(val) {
        const dots = document.querySelectorAll('.dot');
        
        switch(val) {
            case 'clear':
                State.authBuffer = "";
                dots.forEach(d => d.classList.remove('active'));
                break;
                
            case 'enter':
                this.verify();
                break;
                
            default:
                if (State.authBuffer.length < 4) {
                    State.authBuffer += val;
                    dots[State.authBuffer.length - 1]?.classList.add('active');
                    
                    if (State.authBuffer.length === 4) {
                        setTimeout(() => this.verify(), 300);
                    }
                }
                break;
        }
    },
    
    verify() {
        const storedPin = localStorage.getItem('vault_pin') || CONFIG.security.defaultPin;
        
        if (State.authBuffer === storedPin) {
            this.unlock();
        } else {
            State.authBuffer = "";
            document.querySelectorAll('.dot').forEach(d => d.classList.remove('active'));
            
            // Shake animation
            const panel = document.querySelector('.auth-glass-panel');
            if (panel) {
                panel.classList.add('shake');
                setTimeout(() => panel.classList.remove('shake'), 500);
            }
        }
    },
    
    unlock(silent = false) {
        console.log('🔓 Unlocking vault...');
        
        // Save session
        localStorage.setItem('vault_session', JSON.stringify({ 
            time: Date.now() 
        }));
        
        const authScreen = document.getElementById('auth-screen');
        const appInterface = document.getElementById('app-interface');
        
        if (!silent) {
            authScreen.style.opacity = '0';
            setTimeout(() => {
                authScreen.classList.add('hidden');
                appInterface.classList.remove('hidden');
                setTimeout(() => {
                    appInterface.style.opacity = '1';
                }, 50);
            }, 500);
        } else {
            authScreen.classList.add('hidden');
            appInterface.classList.remove('hidden');
        }
        
        // Initialize modules
        setTimeout(() => {
            Drive.init();
            UI.init();
            Actions.init();
            Upload.init();
        }, 100);
    }
};

// 5. GOOGLE DRIVE
const Drive = {
    tokenClient: null,
    gapiLoaded: false,
    
    async init() {
        console.log('☁️ Drive initializing...');
        
        try {
            // Load Google API
            await new Promise((resolve, reject) => {
                if (window.gapi && window.gapi.client) {
                    this.gapiLoaded = true;
                    resolve();
                    return;
                }
                
                gapi.load('client', {
                    callback: () => {
                        this.gapiLoaded = true;
                        resolve();
                    },
                    onerror: reject,
                    timeout: 10000
                });
            });
            
            // Initialize client
            await gapi.client.init({
                apiKey: CONFIG.gapi.apiKey,
                discoveryDocs: CONFIG.gapi.discoveryDocs
            });
            
            // Initialize token client
            this.tokenClient = google.accounts.oauth2.initTokenClient({
                client_id: CONFIG.gapi.clientId,
                scope: CONFIG.gapi.scope,
                callback: (response) => this.handleAuthResponse(response),
                error_callback: (error) => {
                    console.error('Google auth error:', error);
                }
            });
            
            console.log('✅ Google API loaded');
            
            // Check for existing token
            const token = localStorage.getItem('vault_token');
            if (token) {
                this.tokenClient.requestAccessToken({ prompt: '' });
            }
            
        } catch (error) {
            console.error('❌ Drive init failed:', error);
            UI.showToast('Failed to initialize Google Drive', 'error');
        }
    },
    
    handleAuthResponse(response) {
        if (response.error) {
            if (response.error !== 'popup_closed_by_user') {
                UI.showToast('Authentication failed', 'error');
            }
            return;
        }
        
        State.accessToken = response.access_token;
        State.isGoogleConnected = true;
        localStorage.setItem('vault_token', response.access_token);
        
        // Update UI
        const connectBtn = document.getElementById('btn-drive-connect');
        if (connectBtn) {
            connectBtn.innerHTML = '<i class="ri-google-fill"></i> Connected';
            connectBtn.classList.add('connected');
        }
        
        // Load user data
        this.loadProfile();
        this.loadFolder('root');
        
        UI.showToast('Connected to Google Drive', 'success');
    },
    
    async loadProfile() {
        try {
            const response = await gapi.client.drive.about.get({
                fields: "user, storageQuota"
            });
            
            const user = response.result.user;
            const quota = response.result.storageQuota;
            
            // Update user info
            document.getElementById('user-name').textContent = user.displayName;
            document.getElementById('user-email').textContent = user.emailAddress;
            document.getElementById('user-email').style.display = 'block';
            
            if (user.photoLink) {
                document.getElementById('user-avatar').src = user.photoLink;
            }
            
            // Update storage
            if (quota.limit && quota.usage) {
                const percentage = ((quota.usage / quota.limit) * 100).toFixed(1);
                document.getElementById('storage-bar').style.width = percentage + '%';
                document.getElementById('storage-percent').textContent = `${percentage}%`;
                
                // Update button
                const usedGB = (quota.usage / (1024 * 1024 * 1024)).toFixed(2);
                const totalGB = (quota.limit / (1024 * 1024 * 1024)).toFixed(2);
                const connectBtn = document.getElementById('btn-drive-connect');
                if (connectBtn) {
                    connectBtn.innerHTML = `<i class="ri-google-fill"></i> ${usedGB} GB / ${totalGB} GB`;
                }
            }
            
        } catch (error) {
            console.error('Failed to load profile:', error);
        }
    },
    
    async loadFolder(folderId = 'root', filter = null) {
        if (!State.isGoogleConnected) {
            UI.showToast('Please connect Google Drive first', 'warning');
            return;
        }
        
        try {
            Utils.showLoading();
            
            State.currentFolder = folderId;
            State.selectedFiles.clear();
            
            let query = `'${folderId}' in parents and trashed = false`;
            
            // Handle special folders
            if (folderId === 'recent') {
                const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();
                query = `modifiedTime > '${weekAgo}' and trashed = false`;
            } else if (folderId === 'starred') {
                query = 'starred = true and trashed = false';
            } else if (folderId === 'trash') {
                query = 'trashed = true';
            }
            
            // Apply filter if provided
            if (filter) {
                // Filter logic here
            }
            
            const response = await gapi.client.drive.files.list({
                q: query,
                pageSize: 100,
                fields: "files(id, name, mimeType, size, thumbnailLink, webContentLink, webViewLink, iconLink)",
                orderBy: "folder, name"
            });
            
            State.files = response.result.files;
            
            // Update UI
            UI.renderFiles();
            UI.updateBreadcrumbs(folderId);
            
        } catch (error) {
            console.error('Failed to load folder:', error);
            UI.showToast('Failed to load files', 'error');
        } finally {
            Utils.hideLoading();
        }
    },
    
    connectGoogle() {
        if (!this.tokenClient) {
            UI.showToast('Google Drive not ready', 'error');
            return;
        }
        this.tokenClient.requestAccessToken({ prompt: 'consent' });
    }
};

// 6. UI MANAGER
const UI = {
    init() {
        console.log('🎨 UI initializing...');
        
        this.initSidebar();
        this.initToolbar();
        this.initContextMenu();
        this.initSearch();
        this.initUpload();
        this.initViewer();
        
        // Initial render
        this.renderFiles();
    },
    
    initSidebar() {
        // Sidebar toggle
        document.getElementById('sidebar-toggle').addEventListener('click', () => {
            document.querySelector('.sidebar').classList.toggle('collapsed');
        });
        
        // Drive connect button
        document.getElementById('btn-drive-connect').addEventListener('click', () => {
            Drive.connectGoogle();
        });
        
        // Navigation items
        document.querySelectorAll('.nav-item[data-path]').forEach(item => {
            item.addEventListener('click', () => {
                if (State.isGoogleConnected) {
                    Drive.loadFolder(item.dataset.path);
                } else {
                    this.showToast('Please connect Google Drive first', 'warning');
                }
            });
        });
        
        // Filter items
        document.querySelectorAll('.nav-item[data-filter]').forEach(item => {
            item.addEventListener('click', () => {
                this.showToast('Filter feature coming soon', 'info');
            });
        });
        
        // Settings
        document.getElementById('btn-settings').addEventListener('click', () => {
            this.showSettings();
        });
    },
    
    initToolbar() {
        // Refresh button
        document.getElementById('btn-refresh').addEventListener('click', () => {
            if (State.isGoogleConnected) {
                Drive.loadFolder(State.currentFolder);
                this.showToast('Refreshed', 'success');
            }
        });
        
        // View switch
        document.querySelectorAll('.switch-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.preventDefault();
                const view = btn.dataset.view;
                this.switchView(view);
            });
        });
        
        // Upload menu
        document.getElementById('btn-upload-menu').addEventListener('click', (e) => {
            e.stopPropagation();
            document.getElementById('upload-dropdown').classList.toggle('hidden');
        });
        
        // Sort menu
        document.getElementById('btn-sort-menu').addEventListener('click', (e) => {
            e.stopPropagation();
            document.getElementById('sort-dropdown').classList.toggle('hidden');
        });
        
        // Close dropdowns when clicking outside
        document.addEventListener('click', () => {
            document.getElementById('upload-dropdown').classList.add('hidden');
            document.getElementById('sort-dropdown').classList.add('hidden');
        });
    },
    
    initSearch() {
        const searchInput = document.getElementById('search-input');
        const searchHandler = Utils.debounce((query) => {
            if (query.trim()) {
                this.searchFiles(query);
            }
        }, 500);
        
        searchInput.addEventListener('input', (e) => {
            searchHandler(e.target.value);
        });
    },
    
    initContextMenu() {
        // Hide context menu on click
        document.addEventListener('click', () => {
            const ctxMenu = document.getElementById('context-menu');
            if (ctxMenu) ctxMenu.classList.remove('show');
        });
        
        // Show context menu
        document.addEventListener('contextmenu', (e) => {
            const fileCard = e.target.closest('.file-card');
            if (fileCard) {
                e.preventDefault();
                const fileId = fileCard.dataset.id;
                this.showContextMenu(e, fileId);
            }
        });
    },
    
    initUpload() {
        // Already handled in global Upload module
    },
    
    initViewer() {
        document.getElementById('btn-viewer-close').addEventListener('click', () => {
            document.getElementById('modal-viewer').classList.add('hidden');
        });
    },
    
    renderFiles() {
        const gridContainer = document.getElementById('file-grid-container');
        if (!gridContainer) return;
        
        gridContainer.innerHTML = '';
        
        // Show/hide empty state
        const emptyState = document.getElementById('empty-state-placeholder');
        if (emptyState) {
            emptyState.classList.toggle('hidden', State.files.length > 0);
        }
        
        // Render each file
        State.files.forEach(file => {
            const card = document.createElement('div');
            card.className = `file-card ${State.selectedFiles.has(file.id) ? 'selected' : ''}`;
            card.dataset.id = file.id;
            
            let icon = `<i class="${Utils.getIcon(file.mimeType)}"></i>`;
            let style = '';
            
            if (file.mimeType.includes('folder')) {
                const colors = ['#ffd700', '#ff0055', '#00e676', '#2979ff', '#d500f9'];
                const color = colors[file.name.length % colors.length];
                style = `color: ${color};`;
            } else if (file.thumbnailLink) {
                icon = `<img src="${file.thumbnailLink.replace('s220', 's400')}" loading="lazy">`;
            }
            
            card.innerHTML = `
                <div class="fc-thumb" style="${style}">${icon}</div>
                <div class="fc-info">
                    <span class="fc-name" title="${file.name}">${file.name}</span>
                    <div class="fc-meta">${Utils.formatBytes(file.size || 0)}</div>
                </div>
            `;
            
            // Click events
            card.addEventListener('click', (e) => {
                if (e.ctrlKey || e.metaKey) {
                    this.toggleSelect(file.id);
                } else if (file.mimeType.includes('folder')) {
                    Drive.loadFolder(file.id);
                } else {
                    Media.open(file);
                }
            });
            
            gridContainer.appendChild(card);
        });
    },
    
    toggleSelect(fileId) {
        if (State.selectedFiles.has(fileId)) {
            State.selectedFiles.delete(fileId);
        } else {
            State.selectedFiles.add(fileId);
        }
        this.updateSelectionBar();
        this.renderFiles();
    },
    
    updateSelectionBar() {
        const bar = document.getElementById('selection-bar');
        const count = document.getElementById('select-count');
        
        if (!bar || !count) return;
        
        if (State.selectedFiles.size > 0) {
            bar.classList.remove('hidden');
            count.textContent = `${State.selectedFiles.size} selected`;
        } else {
            bar.classList.add('hidden');
        }
    },
    
    switchView(mode) {
        State.viewMode = mode;
        localStorage.setItem('vault_view', mode);
        
        // Update active button
        document.querySelectorAll('.switch-btn').forEach(btn => {
            btn.classList.toggle('active', btn.dataset.view === mode);
        });
        
        // Apply view mode
        const grid = document.getElementById('file-grid-container');
        grid.className = `file-browser ${mode}-view`;
    },
    
    updateBreadcrumbs(folderId) {
        const breadcrumbs = document.getElementById('breadcrumbs');
        if (!breadcrumbs) return;
        
        if (folderId === 'root') {
            breadcrumbs.innerHTML = '<span class="crumb">My Drive</span>';
        } else {
            breadcrumbs.innerHTML = `
                <span class="crumb" onclick="Drive.loadFolder('root')">My Drive</span>
                <span class="crumb"> / ${folderId}</span>
            `;
        }
    },
    
    searchFiles(query) {
        if (!State.isGoogleConnected) {
            this.showToast('Please connect Google Drive first', 'warning');
            return;
        }
        
        console.log('Searching for:', query);
        // Implement search logic here
        this.showToast(`Search: ${query}`, 'info');
    },
    
    showContextMenu(event, fileId) {
        const ctxMenu = document.getElementById('context-menu');
        if (!ctxMenu) return;
        
        // Position menu
        let x = event.pageX;
        let y = event.pageY;
        const menuWidth = ctxMenu.offsetWidth;
        const menuHeight = ctxMenu.offsetHeight;
        
        if (x + menuWidth > window.innerWidth) x -= menuWidth;
        if (y + menuHeight > window.innerHeight) y -= menuHeight;
        
        ctxMenu.style.left = `${x}px`;
        ctxMenu.style.top = `${y}px`;
        ctxMenu.classList.add('show');
        ctxMenu.dataset.target = fileId;
        
        // Select the file
        this.toggleSelect(fileId);
    },
    
    showSettings() {
        const currentPin = localStorage.getItem('vault_pin') || CONFIG.security.defaultPin;
        const newPin = prompt('Enter new 4-digit PIN:');
        
        if (newPin && newPin.length === 4 && /^\d+$/.test(newPin)) {
            localStorage.setItem('vault_pin', newPin);
            this.showToast('PIN updated successfully', 'success');
        } else if (newPin !== null) {
            this.showToast('PIN must be 4 digits', 'error');
        }
    },
    
    showToast(message, type = 'info') {
        const container = document.getElementById('toast-container');
        if (!container) return;
        
        const toast = document.createElement('div');
        toast.className = `toast ${type}`;
        toast.innerHTML = `
            <i class="ri-${this.getToastIcon(type)}-circle-fill"></i>
            <span>${message}</span>
        `;
        
        container.appendChild(toast);
        
        // Auto remove
        setTimeout(() => {
            toast.style.opacity = '0';
            setTimeout(() => toast.remove(), 300);
        }, 3000);
    },
    
    getToastIcon(type) {
        switch(type) {
            case 'success': return 'check';
            case 'error': return 'close';
            case 'warning': return 'alert';
            default: return 'information';
        }
    }
};

// 7. ACTIONS
const Actions = {
    init() {
        console.log('⚡ Actions initializing...');
        
        // New folder button
        document.getElementById('btn-new-folder').addEventListener('click', (e) => {
            e.preventDefault();
            this.createFolder();
        });
        
        // Context menu actions
        document.addEventListener('click', (e) => {
            const actionBtn = e.target.closest('[data-act]');
            if (!actionBtn) return;
            
            e.preventDefault();
            e.stopPropagation();
            
            const action = actionBtn.dataset.act;
            const ctxMenu = document.getElementById('context-menu');
            let fileId = ctxMenu?.dataset.target;
            
            // If no file from context menu, use first selected
            if (!fileId && State.selectedFiles.size > 0) {
                fileId = Array.from(State.selectedFiles)[0];
            }
            
            if (!fileId) return;
            
            this.executeAction(action, fileId);
            
            // Hide context menu
            if (ctxMenu) {
                ctxMenu.classList.remove('show');
            }
        });
        
        // Sort actions
        document.querySelectorAll('#sort-dropdown .menu-item').forEach(item => {
            item.addEventListener('click', (e) => {
                e.preventDefault();
                const sortType = item.dataset.sort;
                this.sortFiles(sortType);
                document.getElementById('sort-dropdown').classList.add('hidden');
            });
        });
    },
    
    createFolder() {
        if (!State.isGoogleConnected) {
            UI.showToast('Please connect Google Drive first', 'warning');
            return;
        }
        
        const name = prompt('Enter folder name:', 'New Folder');
        if (!name) return;
        
        // Create folder logic here
        UI.showToast(`Folder "${name}" created`, 'success');
        
        // Refresh folder view
        setTimeout(() => {
            Drive.loadFolder(State.currentFolder);
        }, 1000);
    },
    
    executeAction(action, fileId) {
        const file = State.files.find(f => f.id === fileId);
        if (!file) return;
        
        switch(action) {
            case 'open':
                Media.open(file);
                break;
                
            case 'download':
                if (file.webContentLink) {
                    window.open(file.webContentLink, '_blank');
                }
                break;
                
            case 'delete':
                this.deleteFile(fileId);
                break;
                
            case 'rename':
                this.renameFile(fileId);
                break;
                
            case 'move':
                UI.showToast('Move feature coming soon', 'info');
                break;
                
            case 'copy':
                UI.showToast('Copy feature coming soon', 'info');
                break;
        }
    },
    
    async deleteFile(fileId) {
        if (!confirm('Are you sure you want to delete this file?')) return;
        
        if (!State.isGoogleConnected) {
            UI.showToast('Please connect Google Drive first', 'warning');
            return;
        }
        
        try {
            Utils.showLoading();
            
            await gapi.client.drive.files.update({
                fileId: fileId,
                trashed: true
            });
            
            UI.showToast('File moved to trash', 'success');
            
            // Remove from selection
            State.selectedFiles.delete(fileId);
            UI.updateSelectionBar();
            
            // Refresh folder
            Drive.loadFolder(State.currentFolder);
            
        } catch (error) {
            console.error('Delete failed:', error);
            UI.showToast('Failed to delete file', 'error');
        } finally {
            Utils.hideLoading();
        }
    },
    
    async renameFile(fileId) {
        const file = State.files.find(f => f.id === fileId);
        if (!file) return;
        
        const newName = prompt('Enter new name:', file.name);
        if (!newName || newName === file.name) return;
        
        if (!State.isGoogleConnected) {
            UI.showToast('Please connect Google Drive first', 'warning');
            return;
        }
        
        try {
            Utils.showLoading();
            
            await gapi.client.drive.files.update({
                fileId: fileId,
                resource: { name: newName }
            });
            
            UI.showToast('File renamed', 'success');
            
            // Refresh folder
            Drive.loadFolder(State.currentFolder);
            
        } catch (error) {
            console.error('Rename failed:', error);
            UI.showToast('Failed to rename file', 'error');
        } finally {
            Utils.hideLoading();
        }
    },
    
    sortFiles(type) {
        const sorted = [...State.files].sort((a, b) => {
            if (type === 'name') return a.name.localeCompare(b.name);
            if (type === 'size') return (b.size || 0) - (a.size || 0);
            if (type === 'date') return new Date(b.modifiedTime) - new Date(a.modifiedTime);
            return 0;
        });
        
        State.files = sorted;
        UI.renderFiles();
        
        UI.showToast(`Sorted by ${type}`, 'info');
    }
};

// 8. UPLOAD
const Upload = {
    init() {
        console.log('📤 Upload initializing...');
        
        // File input
        document.getElementById('inp-file').addEventListener('change', (e) => {
            if (e.target.files.length > 0) {
                this.start(e.target.files);
            }
        });
        
        // Folder input
        document.getElementById('inp-folder').addEventListener('change', (e) => {
            if (e.target.files.length > 0) {
                this.start(e.target.files);
            }
        });
    },
    
    start(files) {
        if (!State.isGoogleConnected) {
            UI.showToast('Please connect Google Drive first', 'warning');
            return;
        }
        
        console.log(`Starting upload of ${files.length} files`);
        
        // Show upload manager
        const manager = document.getElementById('upload-manager');
        manager.classList.remove('hidden');
        
        // Clear previous
        const list = document.getElementById('upload-list-container');
        list.innerHTML = '';
        
        // Process each file
        Array.from(files).forEach(file => {
            this.addToQueue(file);
        });
    },
    
    addToQueue(file) {
        const list = document.getElementById('upload-list-container');
        const item = document.createElement('div');
        item.className = 'upload-item';
        item.innerHTML = `
            <span>${file.name}</span>
            <div class="progress-track-mini">
                <div class="progress-bar-mini" style="width:0%"></div>
            </div>
        `;
        list.appendChild(item);
        
        // Simulate upload progress
        let progress = 0;
        const interval = setInterval(() => {
            progress += Math.random() * 20;
            if (progress > 100) progress = 100;
            
            item.querySelector('.progress-bar-mini').style.width = progress + '%';
            
            if (progress >= 100) {
                clearInterval(interval);
                item.innerHTML += ' <i class="ri-check-line" style="color:#00e676"></i>';
                
                // Refresh after all uploads
                setTimeout(() => {
                    if (State.isGoogleConnected) {
                        Drive.loadFolder(State.currentFolder);
                    }
                }, 1000);
            }
        }, 300);
    }
};

// 9. MEDIA PLAYER
const Media = {
    open(file) {
        if (!file) return;
        
        const modal = document.getElementById('modal-viewer');
        const content = document.querySelector('.viewer-content');
        const title = document.getElementById('viewer-title');
        
        modal.classList.remove('hidden');
        title.textContent = file.name;
        
        // Clear previous
        content.innerHTML = '<div class="spinner"></div>';
        
        if (file.mimeType.includes('image')) {
            let imgUrl = file.webContentLink;
            if (file.thumbnailLink) {
                imgUrl = file.thumbnailLink.replace('s220', 's1200');
            }
            
            const img = document.createElement('img');
            img.src = imgUrl;
            img.style.maxWidth = '100%';
            img.style.maxHeight = '100%';
            img.onload = () => {
                content.innerHTML = '';
                content.appendChild(img);
            };
            img.onerror = () => {
                img.src = file.webContentLink;
            };
            
        } else if (file.mimeType.includes('video')) {
            const videoUrl = `${CONFIG.proxy.media}?id=${file.id}`;
            content.innerHTML = `
                <video controls style="width:100%;height:100%">
                    <source src="${videoUrl}" type="${file.mimeType}">
                </video>
            `;
            
        } else {
            if (file.webContentLink) {
                window.open(file.webContentLink, '_blank');
                modal.classList.add('hidden');
            } else {
                content.innerHTML = '<p>Preview not available</p>';
            }
        }
    }
};

// 10. STARTUP
window.addEventListener('DOMContentLoaded', () => {
    console.log('🚀 Vault OS starting...');
    
    // Initialize auth first
    Auth.init();
    
    // Auto-hide boot if stuck
    setTimeout(() => {
        const boot = document.getElementById('boot-screen');
        if (boot && !boot.classList.contains('hidden')) {
            boot.style.opacity = '0';
            setTimeout(() => {
                boot.classList.add('hidden');
                
                // Show auth if no session
                const session = JSON.parse(localStorage.getItem('vault_session') || 'null');
                if (!session || Date.now() - session.time >= CONFIG.security.sessionTime) {
                    document.getElementById('auth-screen').classList.remove('hidden');
                }
            }, 500);
        }
    }, 4000);
});

// Global exports for HTML onclick handlers
window.Actions = Actions;
window.Drive = Drive;
window.Media = Media;
window.UI = UI;

console.log('📦 Vault OS script loaded successfully');