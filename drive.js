/**
 * DRIVE.JS - Google Drive Integration Module
 * Handles all Google Drive operations for Vault OS
 * Complete rebuild with enhanced error handling and performance
 */

class DriveManager {
    constructor() {
        this.apiBase = 'https://www.googleapis.com/drive/v3';
        this.uploadBase = 'https://www.googleapis.com/upload/drive/v3';
        this.currentFolder = 'root';
        this.files = [];
        this.folders = [];
        this.cache = new Map();
        this.syncInterval = null;
        this.isSyncing = false;
        this.storageInfo = {
            used: 0,
            total: 0,
            percentage: 0
        };
        
        // Constants
        this.PAGE_SIZE = 50;
        this.CACHE_DURATION = 5 * 60 * 1000; // 5 minutes
        this.SYNC_INTERVAL = 30 * 1000; // 30 seconds
        
        // Initialize
        this.init();
    }

    /**
     * Initialize Drive Manager
     */
    async init() {
        try {
            // Check authentication
            if (!await this.checkAuth()) {
                console.warn('Drive: Not authenticated, waiting for auth...');
                return;
            }

            // Load initial data
            await this.loadStorageInfo();
            await this.loadFiles();
            
            // Start auto-sync if enabled
            if (localStorage.getItem('autoSync') === 'true') {
                this.startAutoSync();
            }

            console.log('Drive: Initialized successfully');
        } catch (error) {
            console.error('Drive: Initialization failed:', error);
            this.showError('Failed to initialize Google Drive');
        }
    }

    /**
     * Check if user is authenticated
     */
    async checkAuth() {
        try {
            const token = localStorage.getItem('googleAccessToken');
            const expiry = localStorage.getItem('googleTokenExpiry');
            
            if (!token) return false;
            
            // Check if token is expired
            if (expiry && Date.now() > parseInt(expiry)) {
                console.log('Drive: Token expired, refreshing...');
                await this.refreshToken();
                return true;
            }
            
            return true;
        } catch (error) {
            console.error('Drive: Auth check failed:', error);
            return false;
        }
    }

    /**
     * Refresh Google access token
     */
    async refreshToken() {
        try {
            const refreshToken = localStorage.getItem('googleRefreshToken');
            if (!refreshToken) {
                throw new Error('No refresh token available');
            }

            const response = await fetch('/api/refresh-token', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ refreshToken })
            });

            if (!response.ok) {
                throw new Error('Token refresh failed');
            }

            const data = await response.json();
            
            // Store new tokens
            localStorage.setItem('googleAccessToken', data.access_token);
            localStorage.setItem('googleTokenExpiry', 
                (Date.now() + (data.expires_in * 1000)).toString());
            
            console.log('Drive: Token refreshed successfully');
            return true;
        } catch (error) {
            console.error('Drive: Token refresh failed:', error);
            // Trigger re-authentication
            this.triggerReauth();
            return false;
        }
    }

    /**
     * Load files from current folder
     */
    async loadFiles(query = '', pageToken = '') {
        try {
            if (!await this.checkAuth()) {
                throw new Error('Not authenticated');
            }

            const token = localStorage.getItem('googleAccessToken');
            let url = `${this.apiBase}/files?pageSize=${this.PAGE_SIZE}`;
            
            // Build query
            let q = `'${this.currentFolder}' in parents and trashed = false`;
            if (query) {
                q += ` and name contains '${query}'`;
            }
            url += `&q=${encodeURIComponent(q)}`;
            
            // Add page token for pagination
            if (pageToken) {
                url += `&pageToken=${pageToken}`;
            }

            // Request fields
            url += '&fields=files(id,name,mimeType,size,modifiedTime,createdTime,webContentLink,thumbnailLink,iconLink,parents),nextPageToken';

            const response = await fetch(url, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Accept': 'application/json'
                }
            });

            if (!response.ok) {
                if (response.status === 401) {
                    await this.refreshToken();
                    return this.loadFiles(query, pageToken);
                }
                throw new Error(`API error: ${response.status}`);
            }

            const data = await response.json();
            
            // Process files
            if (pageToken) {
                // Append for pagination
                this.files = [...this.files, ...this.processFiles(data.files)];
            } else {
                // Replace for new query
                this.files = this.processFiles(data.files);
            }

            // Cache the results
            const cacheKey = `files_${this.currentFolder}_${query}_${pageToken}`;
            this.cache.set(cacheKey, {
                data: this.files,
                timestamp: Date.now()
            });

            // Separate folders and files
            this.separateFoldersAndFiles();

            // Trigger UI update
            this.triggerUpdate();
            
            return {
                files: this.files,
                folders: this.folders,
                nextPageToken: data.nextPageToken
            };
        } catch (error) {
            console.error('Drive: Failed to load files:', error);
            this.showError(`Failed to load files: ${error.message}`);
            throw error;
        }
    }

    /**
     * Process raw file data from API
     */
    processFiles(files) {
        return files.map(file => ({
            id: file.id,
            name: file.name,
            type: file.mimeType,
            size: file.size ? this.formatSize(file.size) : 'Unknown',
            rawSize: file.size || 0,
            modified: new Date(file.modifiedTime).toLocaleString(),
            created: new Date(file.createdTime).toLocaleString(),
            isFolder: file.mimeType === 'application/vnd.google-apps.folder',
            icon: file.iconLink,
            thumbnail: file.thumbnailLink,
            downloadUrl: file.webContentLink,
            parents: file.parents || [],
            mimeType: file.mimeType
        }));
    }

    /**
     * Separate folders and files
     */
    separateFoldersAndFiles() {
        this.folders = this.files.filter(file => file.isFolder);
        this.files = this.files.filter(file => !file.isFolder);
    }

    /**
     * Upload file to Drive
     */
    async uploadFile(file, folderId = null) {
        try {
            if (!await this.checkAuth()) {
                throw new Error('Not authenticated');
            }

            const token = localStorage.getItem('googleAccessToken');
            const metadata = {
                name: file.name,
                parents: [folderId || this.currentFolder]
            };

            const form = new FormData();
            form.append('metadata', new Blob([JSON.stringify(metadata)], { type: 'application/json' }));
            form.append('file', file);

            const response = await fetch(`${this.uploadBase}/files?uploadType=multipart`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`
                },
                body: form
            });

            if (!response.ok) {
                if (response.status === 401) {
                    await this.refreshToken();
                    return this.uploadFile(file, folderId);
                }
                throw new Error(`Upload failed: ${response.status}`);
            }

            const uploadedFile = await response.json();
            
            // Clear cache for this folder
            this.clearFolderCache();
            
            // Update storage info
            await this.loadStorageInfo();
            
            // Trigger UI update
            this.triggerUpdate();
            
            console.log('Drive: File uploaded successfully:', uploadedFile.name);
            this.showSuccess(`${file.name} uploaded successfully`);
            
            return this.processFiles([uploadedFile])[0];
        } catch (error) {
            console.error('Drive: Upload failed:', error);
            this.showError(`Upload failed: ${error.message}`);
            throw error;
        }
    }

    /**
     * Download file from Drive
     */
    async downloadFile(fileId, fileName) {
        try {
            if (!await this.checkAuth()) {
                throw new Error('Not authenticated');
            }

            const token = localStorage.getItem('googleAccessToken');
            
            // Get download URL
            const response = await fetch(`${this.apiBase}/files/${fileId}?alt=media`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (!response.ok) {
                if (response.status === 401) {
                    await this.refreshToken();
                    return this.downloadFile(fileId, fileName);
                }
                throw new Error(`Download failed: ${response.status}`);
            }

            // Create blob and download
            const blob = await response.blob();
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = fileName;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            window.URL.revokeObjectURL(url);

            console.log('Drive: File downloaded:', fileName);
            this.showSuccess(`${fileName} downloaded successfully`);
            
            return true;
        } catch (error) {
            console.error('Drive: Download failed:', error);
            this.showError(`Download failed: ${error.message}`);
            throw error;
        }
    }

    /**
     * Delete file/folder from Drive
     */
    async deleteFile(fileId, fileName) {
        try {
            if (!await this.checkAuth()) {
                throw new Error('Not authenticated');
            }

            const token = localStorage.getItem('googleAccessToken');
            const response = await fetch(`${this.apiBase}/files/${fileId}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (!response.ok && response.status !== 204) {
                if (response.status === 401) {
                    await this.refreshToken();
                    return this.deleteFile(fileId, fileName);
                }
                throw new Error(`Delete failed: ${response.status}`);
            }

            // Remove from local arrays
            this.files = this.files.filter(file => file.id !== fileId);
            this.folders = this.folders.filter(folder => folder.id !== fileId);
            
            // Clear cache
            this.clearFolderCache();
            
            // Update storage info
            await this.loadStorageInfo();
            
            // Trigger UI update
            this.triggerUpdate();
            
            console.log('Drive: File deleted:', fileName);
            this.showSuccess(`${fileName} deleted successfully`);
            
            return true;
        } catch (error) {
            console.error('Drive: Delete failed:', error);
            this.showError(`Delete failed: ${error.message}`);
            throw error;
        }
    }

    /**
     * Create new folder
     */
    async createFolder(folderName, parentId = null) {
        try {
            if (!await this.checkAuth()) {
                throw new Error('Not authenticated');
            }

            const token = localStorage.getItem('googleAccessToken');
            const metadata = {
                name: folderName,
                mimeType: 'application/vnd.google-apps.folder',
                parents: [parentId || this.currentFolder]
            };

            const response = await fetch(`${this.apiBase}/files`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(metadata)
            });

            if (!response.ok) {
                if (response.status === 401) {
                    await this.refreshToken();
                    return this.createFolder(folderName, parentId);
                }
                throw new Error(`Folder creation failed: ${response.status}`);
            }

            const folder = await response.json();
            
            // Clear cache
            this.clearFolderCache();
            
            // Trigger UI update
            this.triggerUpdate();
            
            console.log('Drive: Folder created:', folderName);
            this.showSuccess(`Folder "${folderName}" created successfully`);
            
            return this.processFiles([folder])[0];
        } catch (error) {
            console.error('Drive: Folder creation failed:', error);
            this.showError(`Failed to create folder: ${error.message}`);
            throw error;
        }
    }

    /**
     * Navigate to folder
     */
    navigateToFolder(folderId, folderName = '') {
        this.currentFolder = folderId;
        
        // Update breadcrumb in UI
        if (window.updateBreadcrumb) {
            window.updateBreadcrumb(folderName, folderId);
        }
        
        // Load files in new folder
        this.loadFiles();
        
        console.log('Drive: Navigated to folder:', folderName || folderId);
    }

    /**
     * Navigate up one level
     */
    async navigateUp() {
        try {
            if (this.currentFolder === 'root') {
                this.showInfo('Already at root folder');
                return;
            }

            // Get current folder's parents
            const token = localStorage.getItem('googleAccessToken');
            const response = await fetch(`${this.apiBase}/files/${this.currentFolder}?fields=parents`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (!response.ok) {
                throw new Error('Failed to get parent folder');
            }

            const data = await response.json();
            const parentId = data.parents ? data.parents[0] : 'root';
            
            this.navigateToFolder(parentId, '..');
        } catch (error) {
            console.error('Drive: Navigation failed:', error);
            this.showError('Failed to navigate up');
        }
    }

    /**
     * Search files by name
     */
    async searchFiles(query) {
        try {
            if (!query.trim()) {
                await this.loadFiles();
                return;
            }

            await this.loadFiles(query);
            console.log('Drive: Search completed for:', query);
        } catch (error) {
            console.error('Drive: Search failed:', error);
            this.showError(`Search failed: ${error.message}`);
        }
    }

    /**
     * Sort files by criteria
     */
    sortFiles(criteria, order = 'asc') {
        const sortFunctions = {
            name: (a, b) => a.name.localeCompare(b.name),
            size: (a, b) => a.rawSize - b.rawSize,
            modified: (a, b) => new Date(a.modified) - new Date(b.modified),
            type: (a, b) => a.type.localeCompare(b.type)
        };

        if (sortFunctions[criteria]) {
            this.files.sort(sortFunctions[criteria]);
            this.folders.sort(sortFunctions[criteria]);
            
            if (order === 'desc') {
                this.files.reverse();
                this.folders.reverse();
            }

            // Trigger UI update
            this.triggerUpdate();
            
            console.log('Drive: Files sorted by:', criteria, order);
        }
    }

    /**
     * Filter files by type
     */
    filterFiles(type) {
        // This method would typically return filtered results
        // For now, we'll just trigger a UI update with filter applied
        if (window.applyFilter) {
            window.applyFilter(type);
        }
        console.log('Drive: Filter applied:', type);
    }

    /**
     * Load storage information
     */
    async loadStorageInfo() {
        try {
            if (!await this.checkAuth()) {
                return;
            }

            const token = localStorage.getItem('googleAccessToken');
            const response = await fetch(`${this.apiBase}/about?fields=storageQuota`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (!response.ok) {
                if (response.status === 401) {
                    await this.refreshToken();
                    return this.loadStorageInfo();
                }
                return;
            }

            const data = await response.json();
            const quota = data.storageQuota;
            
            this.storageInfo = {
                used: quota.usage ? parseInt(quota.usage) : 0,
                total: quota.limit ? parseInt(quota.limit) : 0,
                percentage: quota.limit ? (quota.usage / quota.limit) * 100 : 0
            };

            // Update UI
            if (window.updateStorageInfo) {
                window.updateStorageInfo(this.storageInfo);
            }

            console.log('Drive: Storage info loaded');
        } catch (error) {
            console.error('Drive: Failed to load storage info:', error);
        }
    }

    /**
     * Sync files (manual or auto)
     */
    async sync(force = false) {
        if (this.isSyncing && !force) {
            console.log('Drive: Sync already in progress');
            return;
        }

        this.isSyncing = true;
        
        try {
            // Update sync status in UI
            if (window.updateSyncStatus) {
                window.updateSyncStatus(true);
            }

            // Clear cache
            this.clearCache();
            
            // Reload files and storage info
            await Promise.all([
                this.loadFiles(),
                this.loadStorageInfo()
            ]);

            console.log('Drive: Sync completed successfully');
            this.showSuccess('Sync completed successfully');
        } catch (error) {
            console.error('Drive: Sync failed:', error);
            this.showError(`Sync failed: ${error.message}`);
        } finally {
            this.isSyncing = false;
            
            // Update sync status in UI
            if (window.updateSyncStatus) {
                window.updateSyncStatus(false);
            }
        }
    }

    /**
     * Start auto-sync
     */
    startAutoSync() {
        if (this.syncInterval) {
            clearInterval(this.syncInterval);
        }

        this.syncInterval = setInterval(() => {
            this.sync();
        }, this.SYNC_INTERVAL);

        console.log('Drive: Auto-sync started');
    }

    /**
     * Stop auto-sync
     */
    stopAutoSync() {
        if (this.syncInterval) {
            clearInterval(this.syncInterval);
            this.syncInterval = null;
        }

        console.log('Drive: Auto-sync stopped');
    }

    /**
     * Clear cache for current folder
     */
    clearFolderCache() {
        const keys = Array.from(this.cache.keys()).filter(key => 
            key.startsWith(`files_${this.currentFolder}`)
        );
        
        keys.forEach(key => this.cache.delete(key));
        console.log('Drive: Folder cache cleared');
    }

    /**
     * Clear all cache
     */
    clearCache() {
        this.cache.clear();
        console.log('Drive: All cache cleared');
    }

    /**
     * Format file size
     */
    formatSize(bytes) {
        if (bytes === 0) return '0 Bytes';
        
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    }

    /**
     * Trigger UI update
     */
    triggerUpdate() {
        if (window.updateFileList) {
            window.updateFileList({
                files: this.files,
                folders: this.folders,
                currentFolder: this.currentFolder
            });
        }
    }

    /**
     * Trigger re-authentication
     */
    triggerReauth() {
        if (window.triggerReauthentication) {
            window.triggerReauthentication();
        } else {
            this.showError('Session expired. Please login again.');
            setTimeout(() => {
                window.location.href = '/auth.html';
            }, 3000);
        }
    }

    /**
     * Show error message
     */
    showError(message) {
        if (window.showToast) {
            window.showToast(message, 'error');
        } else {
            console.error('Drive Error:', message);
            alert(`Error: ${message}`);
        }
    }

    /**
     * Show success message
     */
    showSuccess(message) {
        if (window.showToast) {
            window.showToast(message, 'success');
        } else {
            console.log('Drive Success:', message);
        }
    }

    /**
     * Show info message
     */
    showInfo(message) {
        if (window.showToast) {
            window.showToast(message, 'info');
        } else {
            console.log('Drive Info:', message);
        }
    }

    /**
     * Get file icon based on type
     */
    getFileIcon(mimeType) {
        const iconMap = {
            // Documents
            'application/pdf': '📄',
            'application/msword': '📝',
            'application/vnd.openxmlformats-officedocument.wordprocessingml.document': '📝',
            'text/plain': '📃',
            'text/html': '🌐',
            
            // Spreadsheets
            'application/vnd.ms-excel': '📊',
            'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': '📊',
            
            // Presentations
            'application/vnd.ms-powerpoint': '📽️',
            'application/vnd.openxmlformats-officedocument.presentationml.presentation': '📽️',
            
            // Images
            'image/jpeg': '🖼️',
            'image/png': '🖼️',
            'image/gif': '🖼️',
            'image/webp': '🖼️',
            'image/svg+xml': '🖼️',
            
            // Videos
            'video/mp4': '🎬',
            'video/webm': '🎬',
            'video/ogg': '🎬',
            
            // Audio
            'audio/mpeg': '🎵',
            'audio/ogg': '🎵',
            'audio/wav': '🎵',
            
            // Archives
            'application/zip': '📦',
            'application/x-rar-compressed': '📦',
            'application/x-tar': '📦',
            'application/gzip': '📦',
            
            // Folders
            'application/vnd.google-apps.folder': '📁'
        };

        return iconMap[mimeType] || '📄';
    }

    /**
     * Get file info by ID
     */
    async getFileInfo(fileId) {
        try {
            const token = localStorage.getItem('googleAccessToken');
            const response = await fetch(`${this.apiBase}/files/${fileId}?fields=id,name,mimeType,size,modifiedTime,createdTime,webContentLink,thumbnailLink,iconLink,parents`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (!response.ok) {
                throw new Error('Failed to get file info');
            }

            const file = await response.json();
            return this.processFiles([file])[0];
        } catch (error) {
            console.error('Drive: Failed to get file info:', error);
            throw error;
        }
    }

    /**
     * Rename file/folder
     */
    async renameFile(fileId, newName) {
        try {
            const token = localStorage.getItem('googleAccessToken');
            const metadata = {
                name: newName
            };

            const response = await fetch(`${this.apiBase}/files/${fileId}`, {
                method: 'PATCH',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(metadata)
            });

            if (!response.ok) {
                throw new Error('Failed to rename file');
            }

            const file = await response.json();
            
            // Update local arrays
            const fileIndex = this.files.findIndex(f => f.id === fileId);
            if (fileIndex !== -1) {
                this.files[fileIndex].name = newName;
            }
            
            const folderIndex = this.folders.findIndex(f => f.id === fileId);
            if (folderIndex !== -1) {
                this.folders[folderIndex].name = newName;
            }
            
            // Clear cache
            this.clearFolderCache();
            
            // Trigger UI update
            this.triggerUpdate();
            
            console.log('Drive: File renamed to:', newName);
            this.showSuccess(`Renamed to "${newName}" successfully`);
            
            return true;
        } catch (error) {
            console.error('Drive: Rename failed:', error);
            this.showError(`Rename failed: ${error.message}`);
            throw error;
        }
    }

    /**
     * Move file to another folder
     */
    async moveFile(fileId, newFolderId) {
        try {
            const token = localStorage.getItem('googleAccessToken');
            
            // First get current parents
            const fileInfo = await this.getFileInfo(fileId);
            const previousParents = fileInfo.parents.join(',');
            
            // Move file
            const response = await fetch(`${this.apiBase}/files/${fileId}?removeParents=${previousParents}&addParents=${newFolderId}`, {
                method: 'PATCH',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });

            if (!response.ok) {
                throw new Error('Failed to move file');
            }

            // Remove from current view
            this.files = this.files.filter(f => f.id !== fileId);
            this.folders = this.folders.filter(f => f.id !== fileId);
            
            // Clear cache
            this.clearFolderCache();
            
            // Trigger UI update
            this.triggerUpdate();
            
            console.log('Drive: File moved to folder:', newFolderId);
            this.showSuccess('File moved successfully');
            
            return true;
        } catch (error) {
            console.error('Drive: Move failed:', error);
            this.showError(`Move failed: ${error.message}`);
            throw error;
        }
    }

    /**
     * Get breadcrumb path
     */
    async getBreadcrumbPath() {
        if (this.currentFolder === 'root') {
            return [{ id: 'root', name: 'My Drive' }];
        }

        const path = [];
        let currentId = this.currentFolder;
        
        while (currentId !== 'root') {
            try {
                const fileInfo = await this.getFileInfo(currentId);
                path.unshift({ id: currentId, name: fileInfo.name });
                currentId = fileInfo.parents[0] || 'root';
            } catch (error) {
                break;
            }
        }
        
        path.unshift({ id: 'root', name: 'My Drive' });
        return path;
    }
}

// Export as global variable
window.DriveManager = DriveManager;

// Auto-initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    window.driveManager = new DriveManager();
});

console.log('DRIVE.JS loaded successfully');

