/**
 * VAULT_STORAGE.JS - Storage Management Module
 * Handles real-time Google Drive storage information
 * Version: 3.0.0
 */

const vault_storage = (function() {
    // Private variables
    let vault_currentStorage = null;
    let vault_storageInterval = null;
    let vault_fileBreakdown = [];
    
    // Private methods
    const vault_fetchStorageInfo = async () => {
        try {
            const token = localStorage.getItem('vault_access_token_v3');
            if (!token) {
                throw new Error('Not authenticated');
            }
            
            // Fetch from Google Drive API
            const response = await fetch('https://www.googleapis.com/drive/v3/about?fields=storageQuota', {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Accept': 'application/json'
                }
            });
            
            if (!response.ok) {
                if (response.status === 401) {
                    // Token expired, try to refresh
                    await vault_refreshToken();
                    return vault_fetchStorageInfo();
                }
                throw new Error(`API error: ${response.status}`);
            }
            
            const data = await response.json();
            const quota = data.storageQuota;
            
            return {
                total: parseInt(quota.limit) || 0,
                used: parseInt(quota.usage) || 0,
                free: quota.limit ? parseInt(quota.limit) - parseInt(quota.usage) : 0,
                percentage: quota.limit ? (quota.usage / quota.limit) * 100 : 0,
                isUnlimited: !quota.limit || quota.limit === '0',
                lastUpdated: Date.now()
            };
            
        } catch (error) {
            console.error('Storage fetch error:', error);
            throw error;
        }
    };
    
    const vault_refreshToken = async () => {
        // This function would handle token refresh
        // For now, we'll reload the page to trigger re-auth
        window.location.reload();
    };
    
    const vault_formatBytes = (bytes, decimals = 2) => {
        if (bytes === 0) return '0 Bytes';
        
        const k = 1024;
        const dm = decimals < 0 ? 0 : decimals;
        const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
        
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        
        return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
    };
    
    const vault_formatGB = (bytes) => {
        const gb = bytes / (1024 * 1024 * 1024);
        return gb.toFixed(2) + ' GB';
    };
    
    const vault_updateStorageUI = (storageInfo) => {
        if (!storageInfo) return;
        
        // Update overview cards
        document.getElementById('used-storage').textContent = 
            vault_formatGB(storageInfo.used);
        document.getElementById('free-storage').textContent = 
            vault_formatGB(storageInfo.free);
        document.getElementById('total-storage').textContent = 
            storageInfo.isUnlimited ? 'Unlimited' : vault_formatGB(storageInfo.total);
        document.getElementById('usage-percentage').textContent = 
            storageInfo.percentage.toFixed(1) + '%';
        
        // Update progress bar
        const progressBar = document.getElementById('storage-progress-bar');
        const progressUsed = document.getElementById('progress-used');
        const progressTotal = document.getElementById('progress-total');
        
        if (progressBar) {
            const percentage = Math.min(storageInfo.percentage, 100);
            progressBar.style.width = `${percentage}%`;
            
            // Color coding
            if (percentage > 90) {
                progressBar.style.background = 'linear-gradient(90deg, #ff4757, #ff6b81)';
            } else if (percentage > 75) {
                progressBar.style.background = 'linear-gradient(90deg, #ffa502, #ffb142)';
            } else if (percentage > 50) {
                progressBar.style.background = 'linear-gradient(90deg, #ffdd59, #ffeb8e)';
            } else {
                progressBar.style.background = 'linear-gradient(90deg, var(--primary), var(--secondary))';
            }
        }
        
        if (progressUsed) {
            progressUsed.textContent = `${vault_formatGB(storageInfo.used)} used`;
        }
        
        if (progressTotal) {
            progressTotal.textContent = storageInfo.isUnlimited ? 
                'Unlimited' : `${vault_formatGB(storageInfo.total)} total`;
        }
        
        // Update last updated time
        const lastUpdatedEl = document.getElementById('last-updated-time');
        if (lastUpdatedEl) {
            lastUpdatedEl.textContent = new Date().toLocaleTimeString();
        }
        
        // Update account type
        const accountTypeEl = document.getElementById('account-type');
        if (accountTypeEl) {
            accountTypeEl.textContent = storageInfo.isUnlimited ? 
                'Google Workspace' : 'Google Drive Free';
        }
    };
    
    const vault_analyzeFileTypes = async () => {
        try {
            const token = localStorage.getItem('vault_access_token_v3');
            if (!token) return [];
            
            // Fetch files with MIME types
            const response = await fetch(
                'https://www.googleapis.com/drive/v3/files?fields=files(mimeType,size)&pageSize=1000',
                {
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Accept': 'application/json'
                    }
                }
            );
            
            if (!response.ok) return [];
            
            const data = await response.json();
            const files = data.files || [];
            
            // Categorize by MIME type
            const categories = {
                'Images': { size: 0, count: 0, mimeTypes: ['image/'] },
                'Videos': { size: 0, count: 0, mimeTypes: ['video/'] },
                'Documents': { size: 0, count: 0, mimeTypes: ['application/pdf', 'text/', 'application/msword', 'application/vnd.openxmlformats'] },
                'Archives': { size: 0, count: 0, mimeTypes: ['application/zip', 'application/x-rar', 'application/x-7z'] },
                'Audio': { size: 0, count: 0, mimeTypes: ['audio/'] },
                'Others': { size: 0, count: 0, mimeTypes: [] }
            };
            
            files.forEach(file => {
                const mimeType = file.mimeType || '';
                const size = parseInt(file.size) || 0;
                
                let categorized = false;
                
                for (const [category, info] of Object.entries(categories)) {
                    if (category === 'Others') continue;
                    
                    for (const mimePrefix of info.mimeTypes) {
                        if (mimeType.startsWith(mimePrefix)) {
                            info.size += size;
                            info.count++;
                            categorized = true;
                            break;
                        }
                    }
                    if (categorized) break;
                }
                
                if (!categorized) {
                    categories.Others.size += size;
                    categories.Others.count++;
                }
            });
            
            // Convert to array and sort by size
            const breakdown = Object.entries(categories)
                .filter(([_, info]) => info.size > 0)
                .map(([name, info]) => ({
                    name,
                    size: info.size,
                    count: info.count,
                    percentage: vault_currentStorage ? 
                        (info.size / vault_currentStorage.used) * 100 : 0
                }))
                .sort((a, b) => b.size - a.size);
            
            return breakdown;
            
        } catch (error) {
            console.error('File analysis error:', error);
            return [];
        }
    };
    
    const vault_updateFileBreakdown = (breakdown) => {
        const listEl = document.getElementById('file-type-breakdown');
        if (!listEl) return;
        
        listEl.innerHTML = '';
        
        breakdown.forEach(item => {
            const li = document.createElement('li');
            li.className = 'file-type-item';
            li.innerHTML = `
                <span>${item.name} (${item.count})</span>
                <span>${vault_formatBytes(item.size)} (${item.percentage.toFixed(1)}%)</span>
            `;
            listEl.appendChild(li);
        });
        
        // Update counts
        const filesCount = breakdown.reduce((sum, item) => sum + item.count, 0);
        const foldersCount = 0; // Would need separate API call for folders
        
        document.getElementById('files-count').textContent = filesCount;
        document.getElementById('folders-count').textContent = foldersCount;
    };
    
    const vault_showLoading = (show) => {
        const loadingEl = document.getElementById('loading-storage');
        const detailsGrid = document.getElementById('storage-details-grid');
        const errorEl = document.getElementById('error-storage');
        
        if (loadingEl) {
            loadingEl.style.display = show ? 'block' : 'none';
        }
        if (detailsGrid) {
            detailsGrid.style.display = show ? 'none' : 'grid';
        }
        if (errorEl) {
            errorEl.classList.add('hidden');
        }
    };
    
    const vault_showError = (message) => {
        const errorEl = document.getElementById('error-storage');
        if (errorEl) {
            errorEl.textContent = message;
            errorEl.classList.remove('hidden');
        }
        vault_showLoading(false);
    };
    
    const vault_clearLocalCache = () => {
        // Clear vault-specific cache
        const keys = Object.keys(localStorage).filter(key => 
            key.startsWith('vault_') || 
            key.startsWith('drive_') ||
            key.includes('cache')
        );
        
        keys.forEach(key => {
            localStorage.removeItem(key);
        });
        
        // Clear IndexedDB if available
        if (window.indexedDB) {
            indexedDB.databases().then(databases => {
                databases.forEach(db => {
                    if (db.name.includes('vault') || db.name.includes('drive')) {
                        indexedDB.deleteDatabase(db.name);
                    }
                });
            });
        }
        
        // Clear service worker cache
        if ('caches' in window) {
            caches.keys().then(cacheNames => {
                cacheNames.forEach(cacheName => {
                    if (cacheName.includes('vault')) {
                        caches.delete(cacheName);
                    }
                });
            });
        }
        
        alert('Local cache cleared successfully!');
    };
    
    const vault_exportStats = () => {
        if (!vault_currentStorage) {
            alert('No storage data available');
            return;
        }
        
        const stats = {
            timestamp: new Date().toISOString(),
            storage: vault_currentStorage,
            fileBreakdown: vault_fileBreakdown,
            user: JSON.parse(localStorage.getItem('vault_user_profile_v3') || '{}')
        };
        
        const dataStr = JSON.stringify(stats, null, 2);
        const dataBlob = new Blob([dataStr], { type: 'application/json' });
        
        const url = URL.createObjectURL(dataBlob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `vault-storage-stats-${Date.now()}.json`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
    };
    
    // Public API
    return {
        initStoragePage: async function() {
            console.log('💾 Vault Storage Page Initializing...');
            
            // Show loading
            vault_showLoading(true);
            
            try {
                // Fetch initial storage info
                vault_currentStorage = await vault_fetchStorageInfo();
                vault_updateStorageUI(vault_currentStorage);
                
                // Analyze file types
                vault_fileBreakdown = await vault_analyzeFileTypes();
                vault_updateFileBreakdown(vault_fileBreakdown);
                
                // Hide loading
                vault_showLoading(false);
                
                // Setup event listeners
                this.setupEventListeners();
                
                // Start auto-refresh (every 60 seconds)
                this.startAutoRefresh(60000);
                
                console.log('✅ Vault Storage Page Initialized');
                
            } catch (error) {
                console.error('Storage page init error:', error);
                vault_showError('Failed to load storage information. Please check your connection.');
            }
        },
        
        setupEventListeners: function() {
            // Refresh button
            const refreshBtn = document.getElementById('refresh-storage');
            if (refreshBtn) {
                refreshBtn.addEventListener('click', async () => {
                    refreshBtn.disabled = true;
                    refreshBtn.textContent = '🔄 Refreshing...';
                    
                    try {
                        vault_currentStorage = await vault_fetchStorageInfo();
                        vault_updateStorageUI(vault_currentStorage);
                        
                        vault_fileBreakdown = await vault_analyzeFileTypes();
                        vault_updateFileBreakdown(vault_fileBreakdown);
                        
                        refreshBtn.textContent = '✅ Refreshed!';
                    } catch (error) {
                        refreshBtn.textContent = '❌ Failed';
                        vault_showError('Refresh failed: ' + error.message);
                    } finally {
                        setTimeout(() => {
                            refreshBtn.disabled = false;
                            refreshBtn.textContent = '🔄 Refresh Storage Info';
                        }, 2000);
                    }
                });
            }
            
            // Clear cache button
            const clearCacheBtn = document.getElementById('clear-cache-btn');
            if (clearCacheBtn) {
                clearCacheBtn.addEventListener('click', () => {
                    if (confirm('Clear all local cache? This will remove temporary files.')) {
                        vault_clearLocalCache();
                    }
                });
            }
            
            // Action buttons
            const exportBtn = document.getElementById('export-stats');
            if (exportBtn) {
                exportBtn.addEventListener('click', vault_exportStats);
            }
            
            const cleanupBtn = document.getElementById('cleanup-large-files');
            if (cleanupBtn) {
                cleanupBtn.addEventListener('click', () => {
                    alert('Large file cleanup feature coming soon!');
                });
            }
            
            const viewTrashBtn = document.getElementById('view-trash');
            if (viewTrashBtn) {
                viewTrashBtn.addEventListener('click', () => {
                    alert('Trash view feature coming soon!');
                });
            }
        },
        
        startAutoRefresh: function(interval = 60000) {
            if (vault_storageInterval) {
                clearInterval(vault_storageInterval);
            }
            
            vault_storageInterval = setInterval(async () => {
                try {
                    vault_currentStorage = await vault_fetchStorageInfo();
                    vault_updateStorageUI(vault_currentStorage);
                } catch (error) {
                    console.error('Auto-refresh error:', error);
                }
            }, interval);
        },
        
        stopAutoRefresh: function() {
            if (vault_storageInterval) {
                clearInterval(vault_storageInterval);
                vault_storageInterval = null;
            }
        },
        
        getCurrentStorage: function() {
            return vault_currentStorage;
        },
        
        getFileBreakdown: function() {
            return vault_fileBreakdown;
        },
        
        refreshStorage: async function() {
            try {
                vault_currentStorage = await vault_fetchStorageInfo();
                return vault_currentStorage;
            } catch (error) {
                console.error('Storage refresh error:', error);
                throw error;
            }
        }
    };
})();

// Make available globally
window.vault_storage = vault_storage;

// Auto-initialize if on storage page
if (window.location.pathname.includes('storage.html')) {
    document.addEventListener('DOMContentLoaded', () => {
        vault_storage.initStoragePage();
    });
}

