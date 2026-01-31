/* =========================================
   VAULT OS - GOOGLE DRIVE MODULE
   File Operations & Real Storage Management
   ========================================= */

class DriveManager {
    constructor() {
        this.files = [];
        this.folders = [];
        this.currentFolder = VAULT_CONFIG.google.rootFolderId;
        this.folderStack = [];
        this.selectedFiles = new Set();
        this.isSyncing = false;
        this.syncInterval = null;
        this.uploadQueue = [];
        this.isUploading = false;
        this.fileCache = new Map();
        this.storageRefreshInterval = null;
        this.realStorageInfo = null;
        
        // Initialize
        this.init();
    }
    
    init() {
        // Load cached files
        this.loadCachedFiles();
        
        // Load real storage info if available
        this.loadRealStorageInfo();
        
        // Setup event listeners
        this.setupEventListeners();
        
        // Start storage refresh if authenticated
        if (Auth.isLoggedIn()) {
            this.startStorageRefresh();
        }
    }
    
    setupEventListeners() {
        // Search input
        document.getElementById('search-input')?.addEventListener('input', (e) => {
            this.handleSearch(e.target.value);
        });
        
        // Clear search
        document.getElementById('clear-search')?.addEventListener('click', () => {
            this.clearSearch();
        });
        
        // Sort select
        document.getElementById('sort-select')?.addEventListener('change', (e) => {
            this.sortFiles(e.target.value);
        });
        
        // Filter select
        document.getElementById('filter-select')?.addEventListener('change', (e) => {
            this.filterFiles(e.target.value);
        });
        
        // View toggle
        document.getElementById('view-grid')?.addEventListener('click', () => {
            this.switchView('grid');
        });
        
        document.getElementById('view-list')?.addEventListener('click', () => {
            this.switchView('list');
        });
        
        // Upload buttons
        document.getElementById('upload-file-btn')?.addEventListener('click', () => {
            this.triggerFileUpload();
        });
        
        document.getElementById('upload-folder-btn')?.addEventListener('click', () => {
            this.triggerFolderUpload();
        });
        
        // Create folder
        document.getElementById('create-folder-btn')?.addEventListener('click', () => {
            this.createFolder();
        });
        
        document.getElementById('create-note-btn')?.addEventListener('click', () => {
            this.createNote();
        });
        
        // File input change
        document.getElementById('file-input')?.addEventListener('change', (e) => {
            this.handleFileUpload(e.target.files);
        });
        
        document.getElementById('folder-input')?.addEventListener('change', (e) => {
            this.handleFolderUpload(e.target.files);
        });
        
        // Batch actions
        document.getElementById('batch-download')?.addEventListener('click', () => {
            this.downloadSelected();
        });
        
        document.getElementById('batch-share')?.addEventListener('click', () => {
            this.shareSelected();
        });
        
        document.getElementById('batch-move')?.addEventListener('click', () => {
            this.moveSelected();
        });
        
        document.getElementById('batch-delete')?.addEventListener('click', () => {
            this.deleteSelected();
        });
        
        document.getElementById('clear-selection')?.addEventListener('click', () => {
            this.clearSelection();
        });
        
        // Upload first file button
        document.getElementById('upload-first-file')?.addEventListener('click', () => {
            this.triggerFileUpload();
        });
        
        // Drive status dropdown
        document.getElementById('drive-status-toggle')?.addEventListener('click', (e) => {
            e.stopPropagation();
            this.toggleDriveStatusDropdown();
        });
        
        document.getElementById('reconnect-drive')?.addEventListener('click', () => {
            this.reconnectDrive();
        });
        
        document.getElementById('manage-drive')?.addEventListener('click', () => {
            this.manageDriveSettings();
        });
        
        // Breadcrumbs
        document.addEventListener('click', (e) => {
            if (e.target.closest('.home-crumb')) {
                e.preventDefault();
                this.goToRoot();
            } else if (e.target.closest('.folder-crumb')) {
                e.preventDefault();
                const crumb = e.target.closest('.folder-crumb');
                const folderId = crumb.dataset.id;
                const folderName = crumb.textContent;
                this.navigateToFolder(folderId, folderName);
            }
        });
    }
    
    async loadFiles(folderId = null) {
        try {
            // Show loading
            this.showLoading(true);
            
            // Clear existing files
            this.files = [];
            
            // Set current folder
            if (folderId) {
                this.currentFolder = folderId;
                this.folderStack.push({
                    id: this.currentFolder,
                    name: this.getCurrentFolderName()
                });
            } else {
                this.currentFolder = VAULT_CONFIG.google.rootFolderId;
                this.folderStack = [];
            }
            
            // Update breadcrumbs
            this.updateBreadcrumbs();
            
            // Check authentication
            if (!Auth.hasDriveAccess()) {
                this.showEmptyState('disconnected');
                return;
            }
            
            // Load from cache first for quick display
            const cachedFiles = this.getCachedFiles();
            if (cachedFiles.length > 0) {
                this.files = cachedFiles;
                this.renderFiles();
            }
            
            // Fetch from Google Drive
            const driveFiles = await this.fetchDriveFiles();
            
            if (driveFiles.length === 0) {
                this.showEmptyState('empty');
                return;
            }
            
            // Process files
            this.files = this.processFiles(driveFiles);
            
            // Cache files
            this.cacheFiles(this.files);
            
            // Update counts
            this.updateFileCounts();
            this.updateCategoryCounts();
            
            // Render files
            this.renderFiles();
            
            // Update storage info
            await this.refreshStorageInfo();
            
            // Hide loading
            this.showLoading(false);
            
        } catch (error) {
            console.error('Load files error:', error);
            this.showEmptyState('error');
            this.showLoading(false);
        }
    }
    
    async fetchDriveFiles() {
        try {
            const token = Auth.getAccessToken();
            if (!token) {
                throw new Error('No access token');
            }
            
            // Build query
            let query = "trashed = false";
            
            if (this.currentFolder === VAULT_CONFIG.google.rootFolderId) {
                query += ` and '${this.currentFolder}' in parents`;
            } else {
                query += ` and '${this.currentFolder}' in parents`;
            }
            
            // Build parameters with more fields for better processing
            const params = {
                q: query,
                fields: 'files(id, name, mimeType, size, modifiedTime, createdTime, thumbnailLink, webContentLink, webViewLink, fileExtension, parents, iconLink, shared, starred, explicitlyTrashed, capabilities, originalFilename, fullFileExtension, md5Checksum, headRevisionId, owners, lastModifyingUser, properties)',
                pageSize: 1000,
                orderBy: 'modifiedTime desc',
                supportsAllDrives: true,
                includeItemsFromAllDrives: true
            };
            
            // Make API request
            const response = await fetch(VAULT_CONFIG.getApiUrl('files', params), {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Accept': 'application/json'
                }
            });
            
            if (!response.ok) {
                throw new Error(`API error: ${response.status}`);
            }
            
            const data = await response.json();
            return data.files || [];
            
        } catch (error) {
            console.error('Fetch drive files error:', error);
            throw error;
        }
    }
    
    processFiles(files) {
        return files.map(file => {
            const type = this.getFileType(file.mimeType);
            const size = file.size ? parseInt(file.size) : 0;
            
            return {
                id: file.id,
                name: file.name,
                type: type,
                mimeType: file.mimeType,
                size: size,
                formattedSize: size > 0 ? VAULT_CONFIG.formatFileSize(size) : '0 Bytes',
                modified: new Date(file.modifiedTime),
                created: new Date(file.createdTime),
                formattedDate: this.formatDate(new Date(file.modifiedTime)),
                thumbnail: file.thumbnailLink || file.iconLink || '',
                webContentLink: file.webContentLink || '',
                webViewLink: file.webViewLink || '',
                extension: file.fileExtension || this.getFileExtension(file.name),
                isFolder: file.mimeType === 'application/vnd.google-apps.folder',
                parents: file.parents || [],
                shared: file.shared || false,
                starred: file.starred || false,
                trashed: file.explicitlyTrashed || false,
                capabilities: file.capabilities || {},
                owner: file.owners ? file.owners[0] : null,
                md5: file.md5Checksum || '',
                revisionId: file.headRevisionId || '',
                properties: file.properties || {}
            };
        });
    }
    
    getFileType(mimeType) {
        if (mimeType.includes('folder')) return 'folder';
        if (mimeType.includes('image')) return 'image';
        if (mimeType.includes('video')) return 'video';
        if (mimeType.includes('audio')) return 'audio';
        if (mimeType.includes('pdf')) return 'pdf';
        if (mimeType.includes('zip') || mimeType.includes('compressed') || mimeType.includes('rar') || mimeType.includes('7z')) return 'archive';
        if (mimeType.includes('document') || mimeType.includes('text') || mimeType.includes('msword') || mimeType.includes('spreadsheet') || mimeType.includes('presentation')) return 'document';
        if (mimeType.includes('json') || mimeType.includes('xml') || mimeType.includes('javascript') || mimeType.includes('css') || mimeType.includes('html')) return 'code';
        return 'other';
    }
    
    getFileExtension(filename) {
        const parts = filename.split('.');
        return parts.length > 1 ? parts.pop().toLowerCase() : '';
    }
    
    formatDate(date) {
        const now = new Date();
        const diff = now - date;
        const diffMinutes = Math.floor(diff / (1000 * 60));
        const diffHours = Math.floor(diff / (1000 * 60 * 60));
        const diffDays = Math.floor(diff / (1000 * 60 * 60 * 24));
        
        if (diffMinutes < 1) return 'Just now';
        if (diffMinutes < 60) return `${diffMinutes}m ago`;
        if (diffHours < 24) return `${diffHours}h ago`;
        if (diffDays === 1) return 'Yesterday';
        if (diffDays < 7) return `${diffDays}d ago`;
        if (diffDays < 30) return `${Math.floor(diffDays / 7)}w ago`;
        if (diffDays < 365) return date.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
        return date.toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' });
    }
    
    renderFiles() {
        // Clear existing
        this.clearFileContainers();
        
        if (this.files.length === 0) {
            this.showEmptyState('empty');
            return;
        }
        
        // Get current view
        const view = document.querySelector('.view-btn.active')?.dataset.view || 'grid';
        
        if (view === 'grid') {
            this.renderGridView();
        } else {
            this.renderListView();
        }
        
        // Update selection
        this.updateSelection();
    }
    
    renderGridView() {
        const grid = document.getElementById('file-grid');
        if (!grid) return;
        
        this.files.forEach(file => {
            const card = this.createGridCard(file);
            grid.appendChild(card);
        });
    }
    
    createGridCard(file) {
        const card = document.createElement('div');
        card.className = 'file-card';
        card.dataset.id = file.id;
        
        if (this.selectedFiles.has(file.id)) {
            card.classList.add('selected');
        }
        
        // Get icon
        const icon = this.getFileIcon(file);
        
        // Create thumbnail or icon
        let previewHtml = '';
        if (file.thumbnail && file.type === 'image') {
            previewHtml = `
                <div class="file-thumb">
                    <img src="${file.thumbnail.replace('=s220', '=s400')}" 
                         alt="${file.name}"
                         loading="lazy"
                         onerror="this.style.display='none'; this.parentElement.innerHTML='<i class=\'${icon}\'></i>';">
                </div>
            `;
        } else {
            previewHtml = `
                <div class="file-icon">
                    <i class="${icon}"></i>
                </div>
            `;
        }
        
        // Build card HTML
        card.innerHTML = `
            <div class="file-preview">
                ${previewHtml}
                ${file.shared ? '<div class="file-badge shared" title="Shared"><i class="fas fa-share-alt"></i></div>' : ''}
                ${file.starred ? '<div class="file-badge starred" title="Starred"><i class="fas fa-star"></i></div>' : ''}
                ${file.isFolder ? '<div class="file-badge folder" title="Folder"><i class="fas fa-folder"></i></div>' : ''}
            </div>
            <div class="file-info">
                <div class="file-name" title="${file.name}">
                    ${this.truncateText(file.name, 25)}
                </div>
                <div class="file-details">
                    <span class="file-size">${file.formattedSize}</span>
                    <span class="file-date">${file.formattedDate}</span>
                </div>
            </div>
            <div class="file-checkbox">
                <input type="checkbox" class="file-select" ${this.selectedFiles.has(file.id) ? 'checked' : ''}>
            </div>
        `;
        
        // Add event listeners
        card.addEventListener('click', (e) => {
            if (e.target.type === 'checkbox') {
                this.toggleFileSelection(file.id);
                return;
            }
            
            if (e.ctrlKey || e.metaKey) {
                this.toggleFileSelection(file.id);
            } else if (this.selectedFiles.size > 0) {
                this.toggleFileSelection(file.id);
            } else {
                if (file.isFolder) {
                    this.navigateToFolder(file.id, file.name);
                } else {
                    this.openFile(file);
                }
            }
        });
        
        card.addEventListener('dblclick', () => {
            if (file.isFolder) {
                this.navigateToFolder(file.id, file.name);
            } else {
                this.openFile(file);
            }
        });
        
        // Context menu
        card.addEventListener('contextmenu', (e) => {
            e.preventDefault();
            this.showContextMenu(e, file);
        });
        
        // Checkbox event
        const checkbox = card.querySelector('.file-select');
        if (checkbox) {
            checkbox.addEventListener('click', (e) => {
                e.stopPropagation();
                this.toggleFileSelection(file.id);
            });
        }
        
        return card;
    }
    
    renderListView() {
        const listBody = document.getElementById('list-body');
        if (!listBody) return;
        
        this.files.forEach(file => {
            const row = this.createListRow(file);
            listBody.appendChild(row);
        });
    }
    
    createListRow(file) {
        const row = document.createElement('div');
        row.className = 'list-row';
        row.dataset.id = file.id;
        
        if (this.selectedFiles.has(file.id)) {
            row.classList.add('selected');
        }
        
        // Get icon
        const icon = this.getFileIcon(file);
        
        row.innerHTML = `
            <div class="list-col name">
                <input type="checkbox" class="file-select" ${this.selectedFiles.has(file.id) ? 'checked' : ''}>
                <i class="${icon}"></i>
                <span class="file-name" title="${file.name}">${file.name}</span>
                ${file.shared ? '<i class="fas fa-share-alt shared-icon" title="Shared"></i>' : ''}
                ${file.starred ? '<i class="fas fa-star starred-icon" title="Starred"></i>' : ''}
            </div>
            <div class="list-col type">
                ${this.getFileTypeLabel(file.type)}
            </div>
            <div class="list-col size">
                ${file.formattedSize}
            </div>
            <div class="list-col modified">
                ${file.formattedDate}
            </div>
            <div class="list-col actions">
                <button class="btn-action" data-action="preview" title="Preview">
                    <i class="fas fa-eye"></i>
                </button>
                <button class="btn-action" data-action="download" title="Download">
                    <i class="fas fa-download"></i>
                </button>
                <button class="btn-action" data-action="more" title="More actions">
                    <i class="fas fa-ellipsis-v"></i>
                </button>
            </div>
        `;
        
        // Add event listeners
        row.addEventListener('click', (e) => {
            if (e.target.type === 'checkbox' || e.target.closest('.btn-action')) {
                return;
            }
            
            if (e.ctrlKey || e.metaKey) {
                this.toggleFileSelection(file.id);
            } else if (this.selectedFiles.size > 0) {
                this.toggleFileSelection(file.id);
            } else {
                this.openFile(file);
            }
        });
        
        // Checkbox event
        const checkbox = row.querySelector('.file-select');
        if (checkbox) {
            checkbox.addEventListener('click', (e) => {
                e.stopPropagation();
                this.toggleFileSelection(file.id);
            });
        }
        
        // Action buttons
        row.querySelector('[data-action="preview"]').addEventListener('click', (e) => {
            e.stopPropagation();
            this.openFile(file);
        });
        
        row.querySelector('[data-action="download"]').addEventListener('click', (e) => {
            e.stopPropagation();
            this.downloadFile(file);
        });
        
        row.querySelector('[data-action="more"]').addEventListener('click', (e) => {
            e.stopPropagation();
            this.showFileActions(e, file);
        });
        
        return row;
    }
    
    getFileIcon(file) {
        const icons = {
            folder: 'fas fa-folder',
            image: 'fas fa-image',
            video: 'fas fa-video',
            audio: 'fas fa-music',
            pdf: 'fas fa-file-pdf',
            archive: 'fas fa-file-archive',
            document: 'fas fa-file-alt',
            code: 'fas fa-file-code',
            other: 'fas fa-file'
        };
        
        return icons[file.type] || icons.other;
    }
    
    getFileTypeLabel(type) {
        const labels = {
            folder: 'Folder',
            image: 'Image',
            video: 'Video',
            audio: 'Audio',
            pdf: 'PDF',
            archive: 'Archive',
            document: 'Document',
            code: 'Code',
            other: 'File'
        };
        
        return labels[type] || labels.other;
    }
    
    truncateText(text, maxLength) {
        if (text.length <= maxLength) return text;
        return text.substring(0, maxLength - 3) + '...';
    }
    
    openFile(file) {
        // Check viewer settings
        const settings = this.getViewerSettings();
        
        // Determine which viewer to use
        if (file.type === 'video' && settings.upgradedVideo) {
            MediaViewer.openVideo(file);
        } else if (file.type === 'image' && settings.upgradedImage) {
            MediaViewer.openImage(file);
        } else if (file.type === 'pdf' && settings.upgradedPDF) {
            MediaViewer.openPDF(file);
        } else if (file.type === 'archive' && settings.upgradedZIP) {
            MediaViewer.openZIP(file);
        } else {
            // Use default Google Drive viewer
            this.openInDrive(file);
        }
    }
    
    openInDrive(file) {
        if (file.webViewLink) {
            window.open(file.webViewLink, '_blank');
        } else if (file.webContentLink) {
            window.open(file.webContentLink, '_blank');
        } else {
            this.showError('Cannot open file');
        }
    }
    
    async downloadFile(file) {
        try {
            if (!Auth.hasDriveAccess()) {
                throw new Error('Not authenticated');
            }
            
            this.showProgress(`Downloading ${file.name}...`);
            
            // Get download URL with authorization
            const token = Auth.getAccessToken();
            const url = `${VAULT_CONFIG.api.drive.files}/${file.id}?alt=media`;
            
            // Fetch the file
            const response = await fetch(url, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            
            if (!response.ok) {
                throw new Error(`Download failed: ${response.status}`);
            }
            
            const blob = await response.blob();
            
            // Create download link
            const downloadUrl = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = downloadUrl;
            a.download = file.name;
            document.body.appendChild(a);
            a.click();
            
            // Cleanup
            window.URL.revokeObjectURL(downloadUrl);
            document.body.removeChild(a);
            
            this.hideProgress();
            this.showSuccess(`Downloaded ${file.name}`);
            
        } catch (error) {
            console.error('Download error:', error);
            this.showError('Download failed');
            this.hideProgress();
        }
    }
    
    async downloadSelected() {
        if (this.selectedFiles.size === 0) return;
        
        if (this.selectedFiles.size === 1) {
            const fileId = Array.from(this.selectedFiles)[0];
            const file = this.files.find(f => f.id === fileId);
            if (file) {
                await this.downloadFile(file);
            }
        } else {
            await this.downloadAsZip();
        }
    }
    
    async downloadAsZip() {
        try {
            this.showProgress('Creating ZIP archive...');
            
            const zip = new JSZip();
            const token = Auth.getAccessToken();
            
            // Add each selected file to zip
            const selectedFiles = Array.from(this.selectedFiles).map(id => 
                this.files.find(f => f.id === id)
            ).filter(file => file && !file.isFolder);
            
            let completed = 0;
            
            for (const file of selectedFiles) {
                const response = await fetch(`${VAULT_CONFIG.api.drive.files}/${file.id}?alt=media`, {
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                });
                
                if (response.ok) {
                    const blob = await response.blob();
                    zip.file(file.name, blob);
                }
                
                completed++;
                this.updateProgress(`Adding files... (${completed}/${selectedFiles.length})`, 
                    (completed / selectedFiles.length) * 100);
            }
            
            // Generate zip file
            const content = await zip.generateAsync({ 
                type: 'blob',
                compression: 'DEFLATE',
                compressionOptions: { level: 6 }
            });
            
            // Download
            saveAs(content, `vault-files-${Date.now()}.zip`);
            
            this.hideProgress();
            this.showSuccess(`ZIP with ${selectedFiles.length} files created successfully`);
            
        } catch (error) {
            console.error('ZIP creation error:', error);
            this.showError('Failed to create ZIP');
            this.hideProgress();
        }
    }
    
    toggleFileSelection(fileId) {
        if (this.selectedFiles.has(fileId)) {
            this.selectedFiles.delete(fileId);
        } else {
            this.selectedFiles.add(fileId);
        }
        
        this.updateSelection();
    }
    
    updateSelection() {
        // Update UI for selected files
        document.querySelectorAll('.file-card, .list-row').forEach(element => {
            const fileId = element.dataset.id;
            if (this.selectedFiles.has(fileId)) {
                element.classList.add('selected');
                const checkbox = element.querySelector('.file-select');
                if (checkbox) checkbox.checked = true;
            } else {
                element.classList.remove('selected');
                const checkbox = element.querySelector('.file-select');
                if (checkbox) checkbox.checked = false;
            }
        });
        
        // Update batch actions bar
        const count = this.selectedFiles.size;
        const batchBar = document.getElementById('batch-actions');
        const selectedCount = document.getElementById('selected-count');
        
        if (count > 0) {
            batchBar?.classList.remove('hidden');
            if (selectedCount) selectedCount.textContent = `${count} item${count !== 1 ? 's' : ''} selected`;
        } else {
            batchBar?.classList.add('hidden');
        }
    }
    
    clearSelection() {
        this.selectedFiles.clear();
        this.updateSelection();
    }
    
    async deleteSelected() {
        if (this.selectedFiles.size === 0) return;
        
        const count = this.selectedFiles.size;
        const confirmMessage = `Are you sure you want to delete ${count} item${count !== 1 ? 's' : ''}?`;
        
        if (!confirm(confirmMessage)) return;
        
        try {
            this.showProgress(`Deleting ${count} item${count !== 1 ? 's' : ''}...`);
            
            const token = Auth.getAccessToken();
            const promises = [];
            
            for (const fileId of this.selectedFiles) {
                const promise = fetch(`${VAULT_CONFIG.api.drive.files}/${fileId}`, {
                    method: 'DELETE',
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                });
                promises.push(promise);
            }
            
            await Promise.all(promises);
            
            // Clear selection
            this.clearSelection();
            
            // Refresh files
            await this.loadFiles();
            
            // Refresh storage info
            await this.refreshStorageInfo();
            
            this.hideProgress();
            this.showSuccess(`${count} item${count !== 1 ? 's' : ''} deleted successfully`);
            
        } catch (error) {
            console.error('Delete error:', error);
            this.showError('Delete failed');
            this.hideProgress();
        }
    }
    
    navigateToFolder(folderId, folderName) {
        this.folderStack.push({
            id: this.currentFolder,
            name: this.getCurrentFolderName()
        });
        
        this.currentFolder = folderId;
        this.selectedFiles.clear();
        
        this.updateBreadcrumbs(folderName);
        this.loadFiles(folderId);
    }
    
    goBack() {
        if (this.folderStack.length > 0) {
            const prevFolder = this.folderStack.pop();
            this.currentFolder = prevFolder.id;
            this.selectedFiles.clear();
            
            this.updateBreadcrumbs(prevFolder.name);
            this.loadFiles(prevFolder.id);
        }
    }
    
    goToRoot() {
        this.folderStack = [];
        this.currentFolder = VAULT_CONFIG.google.rootFolderId;
        this.selectedFiles.clear();
        
        this.updateBreadcrumbs("All Files");
        this.loadFiles();
    }
    
    getCurrentFolderName() {
        const currentCrumb = document.getElementById('current-crumb');
        return currentCrumb?.textContent || "All Files";
    }
    
    updateBreadcrumbs(currentName = null) {
        const breadcrumbs = document.getElementById('breadcrumbs');
        if (!breadcrumbs) return;
        
        let html = `
            <a class="crumb home-crumb" id="home-crumb">
                <i class="fas fa-home"></i>
                <span>Home</span>
            </a>
        `;
        
        // Add folder breadcrumbs
        this.folderStack.forEach(folder => {
            html += `
                <div class="crumb-separator">/</div>
                <a class="crumb folder-crumb" data-id="${folder.id}">
                    <span>${folder.name}</span>
                </a>
            `;
        });
        
        // Add current folder
        if (currentName && currentName !== "All Files") {
            html += `
                <div class="crumb-separator">/</div>
                <span class="crumb current-crumb" id="current-crumb">
                    ${currentName}
                </span>
            `;
        } else {
            html += `
                <div class="crumb-separator">/</div>
                <span class="crumb current-crumb" id="current-crumb">
                    All Files
                </span>
            `;
        }
        
        breadcrumbs.innerHTML = html;
    }
    
    async createFolder() {
        const folderName = prompt('Enter folder name:');
        if (!folderName || folderName.trim() === '') return;
        
        try {
            const token = Auth.getAccessToken();
            if (!token) throw new Error('Not authenticated');
            
            const metadata = {
                name: folderName.trim(),
                mimeType: 'application/vnd.google-apps.folder',
                parents: [this.currentFolder]
            };
            
            const response = await fetch(VAULT_CONFIG.api.drive.files, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(metadata)
            });
            
            if (!response.ok) {
                throw new Error('Failed to create folder');
            }
            
            // Refresh files
            await this.loadFiles();
            
            // Refresh storage info
            await this.refreshStorageInfo();
            
            this.showSuccess(`Folder "${folderName}" created`);
            
        } catch (error) {
            console.error('Create folder error:', error);
            this.showError('Failed to create folder');
        }
    }
    
    createNote() {
        // This would create a Google Docs file
        // For now, just show a message
        this.showError('Note creation not implemented yet. Please use Google Drive directly.');
    }
    
    triggerFileUpload() {
        document.getElementById('file-input').click();
    }
    
    triggerFolderUpload() {
        document.getElementById('folder-input').click();
    }
    
    async handleFileUpload(fileList) {
        if (!fileList || fileList.length === 0) return;
        
        try {
            // Show upload progress
            this.showUploadProgress(fileList);
            
            const token = Auth.getAccessToken();
            if (!token) throw new Error('Not authenticated');
            
            // Check storage space
            const storageInfo = await this.refreshStorageInfo();
            const totalSize = Array.from(fileList).reduce((sum, file) => sum + file.size, 0);
            
            if (storageInfo && storageInfo.free < totalSize) {
                throw new Error('Not enough storage space');
            }
            
            // Upload each file
            const uploadPromises = [];
            const uploadedFiles = [];
            
            for (let i = 0; i < fileList.length; i++) {
                const file = fileList[i];
                
                // Check file type
                if (!VAULT_CONFIG.validateFileType(file.type)) {
                    this.updateUploadItemStatus(i, 'error', `Unsupported file type: ${file.type}`);
                    continue;
                }
                
                // Check file size
                if (file.size > VAULT_CONFIG.app.maxUploadSize) {
                    this.updateUploadItemStatus(i, 'error', `File too large: ${VAULT_CONFIG.formatFileSize(file.size)}`);
                    continue;
                }
                
                const uploadPromise = this.uploadFileWithProgress(file, i, fileList.length)
                    .then(result => {
                        uploadedFiles.push(result);
                        this.updateUploadItemStatus(i, 'success');
                    })
                    .catch(error => {
                        console.error(`Upload failed for ${file.name}:`, error);
                        this.updateUploadItemStatus(i, 'error', error.message);
                    });
                
                uploadPromises.push(uploadPromise);
            }
            
            // Wait for all uploads to complete
            await Promise.all(uploadPromises);
            
            // Refresh files
            if (uploadedFiles.length > 0) {
                await this.loadFiles();
                await this.refreshStorageInfo();
            }
            
            // Close progress after delay
            setTimeout(() => {
                this.hideUploadProgress();
            }, 3000);
            
            if (uploadedFiles.length > 0) {
                this.showSuccess(`${uploadedFiles.length} file${uploadedFiles.length !== 1 ? 's' : ''} uploaded successfully`);
            }
            
        } catch (error) {
            console.error('Upload error:', error);
            this.showError('Upload failed: ' + error.message);
            this.hideUploadProgress();
        }
    }
    
    async uploadFileWithProgress(file, index, total) {
        return new Promise(async (resolve, reject) => {
            try {
                const token = Auth.getAccessToken();
                
                // Create metadata
                const metadata = {
                    name: file.name,
                    parents: [this.currentFolder]
                };
                
                // Create form data
                const formData = new FormData();
                formData.append('metadata', new Blob([JSON.stringify(metadata)], {
                    type: 'application/json'
                }));
                formData.append('file', file);
                
                // Upload to Google Drive with progress tracking
                const xhr = new XMLHttpRequest();
                
                xhr.upload.addEventListener('progress', (e) => {
                    if (e.lengthComputable) {
                        const percent = Math.round((e.loaded / e.total) * 100);
                        this.updateUploadItemProgress(index, percent);
                    }
                });
                
                xhr.addEventListener('load', () => {
                    if (xhr.status >= 200 && xhr.status < 300) {
                        const response = JSON.parse(xhr.responseText);
                        resolve(response);
                    } else {
                        reject(new Error(`Upload failed: ${xhr.status}`));
                    }
                });
                
                xhr.addEventListener('error', () => {
                    reject(new Error('Network error during upload'));
                });
                
                xhr.open('POST', `${VAULT_CONFIG.api.upload}?uploadType=multipart`);
                xhr.setRequestHeader('Authorization', `Bearer ${token}`);
                xhr.send(formData);
                
            } catch (error) {
                reject(error);
            }
        });
    }
    
    async handleFolderUpload(fileList) {
        // For simplicity, just upload all files
        // In a full implementation, you'd preserve folder structure
        await this.handleFileUpload(fileList);
    }
    
    showUploadProgress(fileList) {
        const modal = document.getElementById('upload-progress-modal');
        const progressList = document.getElementById('upload-progress-list');
        
        if (!modal || !progressList) return;
        
        // Clear existing
        progressList.innerHTML = '';
        
        // Add each file to progress list
        Array.from(fileList).forEach((file, index) => {
            const item = document.createElement('div');
            item.className = 'progress-item';
            item.dataset.index = index;
            item.innerHTML = `
                <div class="progress-item-header">
                    <div class="file-info">
                        <i class="fas fa-file"></i>
                        <div class="file-name">${file.name}</div>
                    </div>
                    <div class="progress-status">
                        <span class="status-text">Pending</span>
                        <span class="progress-percent">0%</span>
                    </div>
                </div>
                <div class="progress-bar">
                    <div class="progress-fill" style="width: 0%"></div>
                </div>
                <div class="file-size">${VAULT_CONFIG.formatFileSize(file.size)}</div>
            `;
            progressList.appendChild(item);
        });
        
        // Show modal
        modal.classList.remove('hidden');
        
        // Update overall progress
        this.updateOverallProgress(0, fileList.length, 'Starting upload...');
    }
    
    updateUploadItemProgress(index, percent) {
        const item = document.querySelector(`.progress-item[data-index="${index}"]`);
        if (!item) return;
        
        const progressFill = item.querySelector('.progress-fill');
        const progressPercent = item.querySelector('.progress-percent');
        const statusText = item.querySelector('.status-text');
        
        if (progressFill) progressFill.style.width = `${percent}%`;
        if (progressPercent) progressPercent.textContent = `${percent}%`;
        if (statusText) statusText.textContent = percent === 100 ? 'Complete' : 'Uploading';
    }
    
    updateUploadItemStatus(index, status, errorMessage = '') {
        const item = document.querySelector(`.progress-item[data-index="${index}"]`);
        if (!item) return;
        
        const statusText = item.querySelector('.status-text');
        const progressPercent = item.querySelector('.progress-percent');
        
        if (status === 'success') {
            item.classList.add('success');
            if (statusText) statusText.textContent = 'Complete';
            if (progressPercent) progressPercent.textContent = '100%';
        } else if (status === 'error') {
            item.classList.add('error');
            if (statusText) statusText.textContent = `Error: ${errorMessage}`;
            if (progressPercent) progressPercent.textContent = 'Failed';
        }
    }
    
    updateOverallProgress(current, total, status) {
        const percent = total > 0 ? Math.round((current / total) * 100) : 0;
        const overallProgress = document.getElementById('overall-progress');
        const uploadStatus = document.getElementById('upload-status');
        
        if (overallProgress) {
            overallProgress.style.width = `${percent}%`;
        }
        
        if (uploadStatus) {
            uploadStatus.textContent = status;
        }
    }
    
    hideUploadProgress() {
        const modal = document.getElementById('upload-progress-modal');
        if (modal) {
            modal.classList.add('hidden');
        }
    }
    
    handleSearch(query) {
        const clearBtn = document.getElementById('clear-search');
        
        if (query.trim() === '') {
            this.clearSearch();
            return;
        }
        
        // Show clear button
        if (clearBtn) {
            clearBtn.classList.remove('hidden');
        }
        
        // Filter files
        const searchTerm = query.toLowerCase();
        const filtered = this.files.filter(file => 
            file.name.toLowerCase().includes(searchTerm) ||
            (file.extension && file.extension.toLowerCase().includes(searchTerm)) ||
            (file.type && file.type.toLowerCase().includes(searchTerm))
        );
        
        // Update display
        this.displayFilteredFiles(filtered);
    }
    
    clearSearch() {
        const searchInput = document.getElementById('search-input');
        const clearBtn = document.getElementById('clear-search');
        
        if (searchInput) {
            searchInput.value = '';
        }
        
        if (clearBtn) {
            clearBtn.classList.add('hidden');
        }
        
        // Show all files
        this.displayFilteredFiles(this.files);
    }
    
    displayFilteredFiles(files) {
        if (files.length === 0) {
            this.showEmptyState('search');
            return;
        }
        
        // Hide empty state
        this.hideEmptyState();
        
        // Get current view
        const view = document.querySelector('.view-btn.active')?.dataset.view || 'grid';
        
        // Clear containers
        this.clearFileContainers();
        
        // Render filtered files
        if (view === 'grid') {
            const grid = document.getElementById('file-grid');
            files.forEach(file => {
                const card = this.createGridCard(file);
                grid.appendChild(card);
            });
        } else {
            const listBody = document.getElementById('list-body');
            files.forEach(file => {
                const row = this.createListRow(file);
                listBody.appendChild(row);
            });
        }
    }
    
    sortFiles(criteria) {
        let sorted = [...this.files];
        
        switch (criteria) {
            case 'name_asc':
                sorted.sort((a, b) => a.name.localeCompare(b.name));
                break;
            case 'name_desc':
                sorted.sort((a, b) => b.name.localeCompare(a.name));
                break;
            case 'date_desc':
                sorted.sort((a, b) => b.modified - a.modified);
                break;
            case 'date_asc':
                sorted.sort((a, b) => a.modified - b.modified);
                break;
            case 'size_desc':
                sorted.sort((a, b) => b.size - a.size);
                break;
            case 'size_asc':
                sorted.sort((a, b) => a.size - b.size);
                break;
            case 'type':
                sorted.sort((a, b) => a.type.localeCompare(b.type));
                break;
        }
        
        this.files = sorted;
        this.renderFiles();
    }
    
    filterFiles(type) {
        if (type === 'all') {
            this.renderFiles();
            return;
        }
        
        const filtered = this.files.filter(file => {
            if (type === 'folders') return file.isFolder;
            if (type === 'images') return file.type === 'image';
            if (type === 'videos') return file.type === 'video';
            if (type === 'audio') return file.type === 'audio';
            if (type === 'documents') return file.type === 'document';
            return file.type === type;
        });
        
        this.displayFilteredFiles(filtered);
    }
    
    switchView(view) {
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
            this.renderGridView();
        } else {
            grid?.classList.remove('active');
            list?.classList.remove('hidden');
            this.renderListView();
        }
    }
    
    showEmptyState(type) {
        this.hideLoading();
        this.hideFileContainers();
        
        const emptyState = document.getElementById('empty-state');
        const emptyTitle = document.getElementById('empty-title');
        const emptyMessage = document.getElementById('empty-message');
        
        if (!emptyState || !emptyTitle || !emptyMessage) return;
        
        switch (type) {
            case 'disconnected':
                emptyTitle.textContent = 'Google Drive Disconnected';
                emptyMessage.textContent = 'Connect your Google Drive to access files';
                break;
            case 'empty':
                emptyTitle.textContent = 'No Files Found';
                emptyMessage.textContent = this.currentFolder === VAULT_CONFIG.google.rootFolderId 
                    ? 'Upload your first file or create a folder' 
                    : 'This folder is empty';
                break;
            case 'search':
                emptyTitle.textContent = 'No Results Found';
                emptyMessage.textContent = 'Try a different search term';
                break;
            case 'error':
                emptyTitle.textContent = 'Error Loading Files';
                emptyMessage.textContent = 'Please check your connection and try again';
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
    
    showLoading(show) {
        const loadingState = document.getElementById('loading-state');
        if (!loadingState) return;
        
        if (show) {
            this.hideFileContainers();
            this.hideEmptyState();
            loadingState.classList.remove('hidden');
        } else {
            loadingState.classList.add('hidden');
        }
    }
    
    hideLoading() {
        const loadingState = document.getElementById('loading-state');
        if (loadingState) {
            loadingState.classList.add('hidden');
        }
    }
    
    clearFileContainers() {
        const grid = document.getElementById('file-grid');
        const listBody = document.getElementById('list-body');
        
        if (grid) grid.innerHTML = '';
        if (listBody) listBody.innerHTML = '';
    }
    
    hideFileContainers() {
        const grid = document.getElementById('file-grid');
        const list = document.getElementById('file-list');
        
        if (grid) grid.classList.remove('active');
        if (list) list.classList.add('hidden');
    }
    
    updateFileCounts() {
        const counts = {
            image: 0,
            video: 0,
            audio: 0,
            document: 0,
            folder: 0,
            other: 0
        };
        
        this.files.forEach(file => {
            if (counts.hasOwnProperty(file.type)) {
                counts[file.type]++;
            } else if (file.isFolder) {
                counts.folder++;
            } else {
                counts.other++;
            }
        });
        
        // Update sidebar counts if needed
        return counts;
    }
    
    updateCategoryCounts() {
        const counts = this.updateFileCounts();
        
        // Update gallery counts
        document.getElementById('image-count').textContent = `${counts.image} file${counts.image !== 1 ? 's' : ''}`;
        document.getElementById('video-count').textContent = `${counts.video} file${counts.video !== 1 ? 's' : ''}`;
        document.getElementById('audio-count').textContent = `${counts.audio} file${counts.audio !== 1 ? 's' : ''}`;
        document.getElementById('doc-count').textContent = `${counts.document} file${counts.document !== 1 ? 's' : ''}`;
    }
    
    cacheFiles(files) {
        try {
            const cache = {
                timestamp: Date.now(),
                files: files,
                folderId: this.currentFolder
            };
            
            localStorage.setItem(VAULT_CONFIG.storage.fileCache, JSON.stringify(cache));
            
        } catch (error) {
            console.error('Cache files error:', error);
        }
    }
    
    getCachedFiles() {
        try {
            const cacheJson = localStorage.getItem(VAULT_CONFIG.storage.fileCache);
            
            if (cacheJson) {
                const cache = JSON.parse(cacheJson);
                
                // Check if cache is still valid (1 hour) and for the same folder
                if (Date.now() - cache.timestamp < 60 * 60 * 1000 && 
                    cache.folderId === this.currentFolder) {
                    return cache.files || [];
                }
            }
            
        } catch (error) {
            console.error('Get cached files error:', error);
        }
        
        return [];
    }
    
    loadCachedFiles() {
        this.files = this.getCachedFiles();
        
        if (this.files.length > 0) {
            this.renderFiles();
            this.updateFileCounts();
            this.updateCategoryCounts();
        }
    }
    
    async loadRealStorageInfo() {
        try {
            const cacheJson = localStorage.getItem(VAULT_CONFIG.storage.storageCache);
            
            if (cacheJson) {
                const cache = JSON.parse(cacheJson);
                
                // Check if cache is still valid (5 minutes)
                if (Date.now() - cache.timestamp < 5 * 60 * 1000) {
                    this.realStorageInfo = cache;
                    this.updateStorageUI();
                    return this.realStorageInfo;
                }
            }
            
            // Refresh from API
            return await this.refreshStorageInfo();
            
        } catch (error) {
            console.error('Load real storage info error:', error);
            return null;
        }
    }
    
    async refreshStorageInfo() {
        try {
            if (!Auth.hasDriveAccess()) {
                return null;
            }
            
            const token = Auth.getAccessToken();
            const response = await fetch(`${VAULT_CONFIG.api.drive.about}?fields=storageQuota`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            
            if (!response.ok) {
                throw new Error('Failed to get storage info');
            }
            
            const data = await response.json();
            
            this.realStorageInfo = {
                total: parseInt(data.storageQuota.limit) || 0,
                used: parseInt(data.storageQuota.usage) || 0,
                usedInDrive: parseInt(data.storageQuota.usageInDrive) || 0,
                usedInTrash: parseInt(data.storageQuota.usageInTrash) || 0,
                free: parseInt(data.storageQuota.limit) - parseInt(data.storageQuota.usage),
                percentage: parseInt(data.storageQuota.limit) > 0 
                    ? (parseInt(data.storageQuota.usage) / parseInt(data.storageQuota.limit)) * 100 
                    : 0,
                isUnlimited: parseInt(data.storageQuota.limit) === 0,
                timestamp: Date.now()
            };
            
            // Cache the storage info
            localStorage.setItem(VAULT_CONFIG.storage.storageCache, JSON.stringify(this.realStorageInfo));
            
            // Update UI
            this.updateStorageUI();
            
            return this.realStorageInfo;
            
        } catch (error) {
            console.error('Refresh storage info error:', error);
            return null;
        }
    }
    
    updateStorageUI() {
        if (!this.realStorageInfo) return;
        
        const usedGB = (this.realStorageInfo.used / (1024 * 1024 * 1024)).toFixed(2);
        const totalGB = this.realStorageInfo.total > 0 
            ? (this.realStorageInfo.total / (1024 * 1024 * 1024)).toFixed(2)
            : 'Unlimited';
        
        const percent = this.realStorageInfo.percentage;
        
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
                storageFill.style.opacity = '0.7';
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
                storageFill.style.opacity = '1';
            }
        }
        
        // Update dropdown file count
        const fileCount = document.getElementById('dropdown-file-count');
        if (fileCount) {
            fileCount.textContent = `${this.files.length} file${this.files.length !== 1 ? 's' : ''}`;
        }
        
        // Update dropdown last sync
        const lastSync = document.getElementById('dropdown-last-sync');
        if (lastSync) {
            const lastSyncTime = localStorage.getItem(VAULT_CONFIG.storage.lastSync);
            if (lastSyncTime) {
                const timeDiff = Date.now() - parseInt(lastSyncTime);
                const minutes = Math.floor(timeDiff / (1000 * 60));
                if (minutes < 1) lastSync.textContent = 'Just now';
                else if (minutes < 60) lastSync.textContent = `${minutes}m ago`;
                else lastSync.textContent = `${Math.floor(minutes / 60)}h ago`;
            } else {
                lastSync.textContent = 'Never';
            }
        }
    }
    
    startStorageRefresh() {
        // Clear existing interval
        if (this.storageRefreshInterval) {
            clearInterval(this.storageRefreshInterval);
        }
        
        // Refresh storage every 5 minutes
        this.storageRefreshInterval = setInterval(() => {
            this.refreshStorageInfo();
        }, 5 * 60 * 1000);
    }
    
    startAutoSync() {
        if (!VAULT_CONFIG.app.autoSync) return;
        
        // Clear existing interval
        if (this.syncInterval) {
            clearInterval(this.syncInterval);
        }
        
        // Start new interval
        this.syncInterval = setInterval(() => {
            this.syncFiles();
        }, VAULT_CONFIG.app.syncInterval);
        
        // Initial sync
        this.syncFiles();
    }
    
    stopAutoSync() {
        if (this.syncInterval) {
            clearInterval(this.syncInterval);
            this.syncInterval = null;
        }
        
        if (this.storageRefreshInterval) {
            clearInterval(this.storageRefreshInterval);
            this.storageRefreshInterval = null;
        }
    }
    
    async syncFiles() {
        if (this.isSyncing || !Auth.hasDriveAccess()) return;
        
        this.isSyncing = true;
        
        try {
            // Update sync status
            this.updateSyncStatus('syncing');
            
            // Fetch latest files
            const driveFiles = await this.fetchDriveFiles();
            const processedFiles = this.processFiles(driveFiles);
            
            // Update cache
            this.cacheFiles(processedFiles);
            
            // If we're in the same folder, update display
            if (this.currentFolder === VAULT_CONFIG.google.rootFolderId) {
                this.files = processedFiles;
                this.renderFiles();
                this.updateFileCounts();
                this.updateCategoryCounts();
            }
            
            // Update storage info
            await this.refreshStorageInfo();
            
            // Update sync status
            this.updateSyncStatus('synced');
            
            // Update last sync time
            localStorage.setItem(VAULT_CONFIG.storage.lastSync, Date.now().toString());
            
        } catch (error) {
            console.error('Sync error:', error);
            this.updateSyncStatus('error');
        } finally {
            this.isSyncing = false;
        }
    }
    
    updateSyncStatus(status) {
        const syncWidget = document.getElementById('sync-status-widget');
        const syncText = document.getElementById('sync-text');
        const syncTime = document.getElementById('sync-time');
        const syncIcon = syncWidget?.querySelector('.sync-icon i');
        
        if (!syncWidget || !syncText || !syncTime) return;
        
        switch (status) {
            case 'syncing':
                syncText.textContent = 'Syncing...';
                syncTime.textContent = '';
                syncWidget.classList.add('syncing');
                if (syncIcon) {
                    syncIcon.className = 'fas fa-sync-alt fa-spin';
                }
                break;
            case 'synced':
                syncText.textContent = 'Synced';
                syncTime.textContent = 'Just now';
                syncWidget.classList.remove('syncing');
                if (syncIcon) {
                    syncIcon.className = 'fas fa-sync-alt';
                }
                break;
            case 'error':
                syncText.textContent = 'Sync error';
                syncTime.textContent = '';
                syncWidget.classList.add('error');
                if (syncIcon) {
                    syncIcon.className = 'fas fa-exclamation-circle';
                }
                break;
        }
    }
    
    getViewerSettings() {
        try {
            const settingsJson = localStorage.getItem(VAULT_CONFIG.storage.viewerSettings);
            
            if (settingsJson) {
                return JSON.parse(settingsJson);
            }
            
        } catch (error) {
            console.error('Get viewer settings error:', error);
        }
        
        // Default settings
        return {
            upgradedVideo: true,
            upgradedImage: true,
            upgradedPDF: true,
            upgradedZIP: true
        };
    }
    
    showContextMenu(event, file) {
        // TODO: Implement context menu
        console.log('Context menu for:', file.name);
    }
    
    showFileActions(event, file) {
        // TODO: Implement file actions menu
        console.log('Actions for:', file.name);
    }
    
    showProgress(message) {
        // Create a simple progress notification
        const toast = document.createElement('div');
        toast.className = 'toast info';
        toast.innerHTML = `
            <i class="fas fa-spinner fa-spin"></i>
            <span>${message}</span>
        `;
        toast.id = 'progress-toast';
        
        const container = document.getElementById('toast-container');
        if (container) {
            // Remove existing progress toast
            const existing = document.getElementById('progress-toast');
            if (existing) existing.remove();
            
            container.appendChild(toast);
        }
    }
    
    updateProgress(message, percent) {
        const toast = document.getElementById('progress-toast');
        if (toast) {
            const span = toast.querySelector('span');
            if (span) span.textContent = message;
        }
    }
    
    hideProgress() {
        const toast = document.getElementById('progress-toast');
        if (toast) {
            toast.style.opacity = '0';
            setTimeout(() => toast.remove(), 300);
        }
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
    
    toggleDriveStatusDropdown() {
        const dropdown = document.getElementById('drive-status-dropdown');
        if (dropdown) {
            dropdown.classList.toggle('hidden');
        }
    }
    
    reconnectDrive() {
        document.getElementById('drive-connect-modal').classList.remove('hidden');
    }
    
    manageDriveSettings() {
        document.getElementById('settings-modal').classList.remove('hidden');
        document.getElementById('drive-status-dropdown')?.classList.add('hidden');
    }
    
    shareSelected() {
        if (this.selectedFiles.size === 0) return;
        this.showError('Sharing not implemented yet. Please use Google Drive directly.');
    }
    
    moveSelected() {
        if (this.selectedFiles.size === 0) return;
        this.showError('Moving files not implemented yet. Please use Google Drive directly.');
    }
    
    // Public methods
    getFiles() {
        return this.files;
    }
    
    getCurrentFolder() {
        return this.currentFolder;
    }
    
    getSelectedFiles() {
        return Array.from(this.selectedFiles);
    }
    
    refresh() {
        this.loadFiles(this.currentFolder);
    }
    
    getRealStorageInfo() {
        return this.realStorageInfo;
    }
}

// Create global Drive instance
window.Drive = new DriveManager();

