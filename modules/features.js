/**
 * VAULT_FEATURES.JS - Features Management Module
 * Handles feature listing, status, and user feature requests
 * Version: 3.0.0
 */

const vault_features = (function() {
    // Private variables with vault_ prefix
    const vault_featuresList = {
        security: [
            {
                id: 'pin_auth',
                name: 'PIN Authentication',
                description: 'Secure 4-digit PIN protection for app access',
                icon: '🔐',
                status: 'active',
                enabled: true,
                since: 'v1.0.0'
            },
            {
                id: 'google_oauth',
                name: 'Google OAuth 2.0',
                description: 'Secure login with Google account',
                icon: '👤',
                status: 'active',
                enabled: true,
                since: 'v2.0.0'
            },
            {
                id: 'admin_access',
                name: 'Admin Access Control',
                description: 'Separate admin PIN for advanced controls',
                icon: '🛡️',
                status: 'active',
                enabled: true,
                since: 'v2.5.0'
            },
            {
                id: 'session_management',
                name: 'Session Management',
                description: 'Automatic session timeout and renewal',
                icon: '⏱️',
                status: 'active',
                enabled: true,
                since: 'v2.0.0'
            },
            {
                id: 'biometric_auth',
                name: 'Biometric Authentication',
                description: 'Fingerprint/Face ID support for mobile',
                icon: '👆',
                status: 'coming',
                enabled: false,
                since: 'v3.5.0'
            }
        ],
        
        file_operations: [
            {
                id: 'upload_files',
                name: 'File Upload',
                description: 'Upload single or multiple files to Google Drive',
                icon: '📤',
                status: 'active',
                enabled: true,
                since: 'v1.0.0'
            },
            {
                id: 'upload_folders',
                name: 'Folder Upload',
                description: 'Upload entire folders with structure intact',
                icon: '📁',
                status: 'active',
                enabled: true,
                since: 'v2.0.0'
            },
            {
                id: 'create_folders',
                name: 'Create Folders',
                description: 'Create new folders directly in Google Drive',
                icon: '🆕',
                status: 'active',
                enabled: true,
                since: 'v1.0.0'
            },
            {
                id: 'delete_files',
                name: 'Delete Files',
                description: 'Permanently delete files and folders',
                icon: '🗑️',
                status: 'active',
                enabled: true,
                since: 'v1.0.0'
            },
            {
                id: 'move_files',
                name: 'Move Files',
                description: 'Drag and drop files between folders',
                icon: '↔️',
                status: 'active',
                enabled: true,
                since: 'v2.0.0'
            },
            {
                id: 'rename_files',
                name: 'Rename Files',
                description: 'Rename files and folders',
                icon: '📝',
                status: 'active',
                enabled: true,
                since: 'v1.0.0'
            },
            {
                id: 'copy_files',
                name: 'Copy Files',
                description: 'Duplicate files within Google Drive',
                icon: '📋',
                status: 'active',
                enabled: true,
                since: 'v2.0.0'
            },
            {
                id: 'share_files',
                name: 'Share Files',
                description: 'Generate shareable links for files',
                icon: '🔗',
                status: 'active',
                enabled: true,
                since: 'v2.0.0'
            },
            {
                id: 'bulk_operations',
                name: 'Bulk Operations',
                description: 'Select multiple files for batch actions',
                icon: '📦',
                status: 'active',
                enabled: true,
                since: 'v2.5.0'
            }
        ],
        
        media: [
            {
                id: 'image_viewer',
                name: 'Image Viewer',
                description: 'Advanced image viewer with zoom and filters',
                icon: '🖼️',
                status: 'active',
                enabled: true,
                since: 'v2.0.0'
            },
            {
                id: 'video_player',
                name: 'Video Player',
                description: 'Built-in video player with controls',
                icon: '🎬',
                status: 'active',
                enabled: true,
                since: 'v2.0.0'
            },
            {
                id: 'pdf_viewer',
                name: 'PDF Viewer',
                description: 'PDF reader with page navigation',
                icon: '📕',
                status: 'active',
                enabled: true,
                since: 'v2.0.0'
            },
            {
                id: 'zip_viewer',
                name: 'ZIP Viewer',
                description: 'Extract and preview ZIP archives',
                icon: '📦',
                status: 'active',
                enabled: true,
                since: 'v2.0.0'
            },
            {
                id: 'audio_player',
                name: 'Audio Player',
                description: 'Music and audio file player',
                icon: '🎵',
                status: 'active',
                enabled: true,
                since: 'v2.5.0'
            },
            {
                id: 'document_viewer',
                name: 'Document Viewer',
                description: 'Preview Office documents',
                icon: '📄',
                status: 'coming',
                enabled: false,
                since: 'v3.5.0'
            }
        ],
        
        sync: [
            {
                id: 'realtime_sync',
                name: 'Real-time Sync',
                description: 'Automatic sync with Google Drive',
                icon: '🔄',
                status: 'active',
                enabled: true,
                since: 'v2.0.0'
            },
            {
                id: 'background_sync',
                name: 'Background Sync',
                description: 'Sync files in the background',
                icon: '⚙️',
                status: 'active',
                enabled: true,
                since: 'v2.5.0'
            },
            {
                id: 'offline_mode',
                name: 'Offline Mode',
                description: 'Access cached files without internet',
                icon: '📴',
                status: 'active',
                enabled: true,
                since: 'v3.0.0'
            },
            {
                id: 'conflict_detection',
                name: 'Conflict Detection',
                description: 'Detect and resolve file conflicts',
                icon: '⚠️',
                status: 'active',
                enabled: true,
                since: 'v2.5.0'
            },
            {
                id: 'selective_sync',
                name: 'Selective Sync',
                description: 'Choose which folders to sync',
                icon: '✅',
                status: 'coming',
                enabled: false,
                since: 'v3.5.0'
            }
        ],
        
        ui: [
            {
                id: 'dark_mode',
                name: 'Dark Mode',
                description: 'Multiple themes including dark mode',
                icon: '🌙',
                status: 'active',
                enabled: true,
                since: 'v2.0.0'
            },
            {
                id: 'theme_switcher',
                name: 'Theme Switcher',
                description: 'Switch between 5 different themes',
                icon: '🎨',
                status: 'active',
                enabled: true,
                since: 'v3.0.0'
            },
            {
                id: 'animations',
                name: 'Smooth Animations',
                description: 'Beautiful UI animations and transitions',
                icon: '✨',
                status: 'active',
                enabled: true,
                since: 'v2.0.0'
            },
            {
                id: 'notifications',
                name: 'Notifications',
                description: 'Toast notifications for all actions',
                icon: '🔔',
                status: 'active',
                enabled: true,
                since: 'v2.0.0'
            },
            {
                id: 'keyboard_shortcuts',
                name: 'Keyboard Shortcuts',
                description: 'Keyboard shortcuts for power users',
                icon: '⌨️',
                status: 'active',
                enabled: true,
                since: 'v2.5.0'
            },
            {
                id: 'context_menu',
                name: 'Context Menu',
                description: 'Right-click context menu for files',
                icon: '🖱️',
                status: 'active',
                enabled: true,
                since: 'v2.0.0'
            },
            {
                id: 'drag_drop',
                name: 'Drag & Drop',
                description: 'Drag and drop file management',
                icon: '👆',
                status: 'active',
                enabled: true,
                since: 'v2.0.0'
            },
            {
                id: 'search_filter',
                name: 'Search & Filter',
                description: 'Advanced search and filtering',
                icon: '🔍',
                status: 'active',
                enabled: true,
                since: 'v1.0.0'
            }
        ],
        
        advanced: [
            {
                id: 'favorites',
                name: 'Favorites',
                description: 'Mark files as favorites for quick access',
                icon: '⭐',
                status: 'active',
                enabled: true,
                since: 'v2.5.0'
            },
            {
                id: 'recent_files',
                name: 'Recent Files',
                description: 'Quick access to recently opened files',
                icon: '🕒',
                status: 'active',
                enabled: true,
                since: 'v2.0.0'
            },
            {
                id: 'trash',
                name: 'Trash/Recycle Bin',
                description: 'Recover deleted files from trash',
                icon: '🗑️',
                status: 'active',
                enabled: true,
                since: 'v2.5.0'
            },
            {
                id: 'version_history',
                name: 'Version History',
                description: 'View and restore previous file versions',
                icon: '📜',
                status: 'coming',
                enabled: false,
                since: 'v4.0.0'
            },
            {
                id: 'file_comments',
                name: 'File Comments',
                description: 'Add comments and notes to files',
                icon: '💬',
                status: 'coming',
                enabled: false,
                since: 'v4.0.0'
            },
            {
                id: 'file_tags',
                name: 'File Tagging',
                description: 'Tag files for better organization',
                icon: '🏷️',
                status: 'coming',
                enabled: false,
                since: 'v4.0.0'
            },
            {
                id: 'ai_features',
                name: 'AI Features',
                description: 'AI-powered file organization and search',
                icon: '🧠',
                status: 'planned',
                enabled: false,
                since: 'v5.0.0'
            },
            {
                id: 'collaboration',
                name: 'Collaboration',
                description: 'Real-time file collaboration',
                icon: '👥',
                status: 'planned',
                enabled: false,
                since: 'v5.0.0'
            }
        ]
    };
    
    // Private methods
    const vault_getStatusClass = (status) => {
        switch(status) {
            case 'active': return 'status-active';
            case 'coming': return 'status-coming';
            case 'planned': return 'status-planned';
            default: return 'status-active';
        }
    };
    
    const vault_getStatusText = (status) => {
        switch(status) {
            case 'active': return 'Active';
            case 'coming': return 'Coming Soon';
            case 'planned': return 'Planned';
            default: return status;
        }
    };
    
    const vault_renderFeatureCard = (feature) => {
        return `
            <div class="feature-card" data-feature-id="${feature.id}">
                <div class="feature-icon">${feature.icon}</div>
                <h3>${feature.name}</h3>
                <p>${feature.description}</p>
                <div class="feature-meta">
                    <span class="feature-status ${vault_getStatusClass(feature.status)}">
                        ${vault_getStatusText(feature.status)}
                    </span>
                    <span class="feature-version">Since ${feature.since}</span>
                </div>
                ${feature.enabled ? 
                    '<div class="feature-toggle"><span class="toggle-on">● Enabled</span></div>' : 
                    '<div class="feature-toggle"><span class="toggle-off">○ Disabled</span></div>'
                }
            </div>
        `;
    };
    
    const vault_updateStats = () => {
        let activeCount = 0;
        let comingCount = 0;
        let plannedCount = 0;
        
        // Count features by status
        Object.values(vault_featuresList).forEach(category => {
            category.forEach(feature => {
                if (feature.status === 'active') activeCount++;
                if (feature.status === 'coming') comingCount++;
                if (feature.status === 'planned') plannedCount++;
            });
        });
        
        // Update DOM
        document.getElementById('active-features').textContent = activeCount;
        document.getElementById('coming-soon').textContent = comingCount;
        document.getElementById('planned-features').textContent = plannedCount;
    };
    
    const vault_renderFeatures = () => {
        // Render security features
        const securityGrid = document.getElementById('security-features');
        if (securityGrid) {
            securityGrid.innerHTML = vault_featuresList.security
                .map(feature => vault_renderFeatureCard(feature))
                .join('');
        }
        
        // Render file features
        const fileGrid = document.getElementById('file-features');
        if (fileGrid) {
            fileGrid.innerHTML = vault_featuresList.file_operations
                .map(feature => vault_renderFeatureCard(feature))
                .join('');
        }
        
        // Render media features
        const mediaGrid = document.getElementById('media-features');
        if (mediaGrid) {
            mediaGrid.innerHTML = vault_featuresList.media
                .map(feature => vault_renderFeatureCard(feature))
                .join('');
        }
        
        // Render sync features
        const syncGrid = document.getElementById('sync-features');
        if (syncGrid) {
            syncGrid.innerHTML = vault_featuresList.sync
                .map(feature => vault_renderFeatureCard(feature))
                .join('');
        }
        
        // Render UI features
        const uiGrid = document.getElementById('ui-features');
        if (uiGrid) {
            uiGrid.innerHTML = vault_featuresList.ui
                .map(feature => vault_renderFeatureCard(feature))
                .join('');
        }
        
        // Render advanced features
        const advancedGrid = document.getElementById('advanced-features');
        if (advancedGrid) {
            advancedGrid.innerHTML = vault_featuresList.advanced
                .map(feature => vault_renderFeatureCard(feature))
                .join('');
        }
    };
    
    const vault_updateLastUpdated = () => {
        const lastUpdated = document.getElementById('last-updated');
        if (lastUpdated) {
            const now = new Date();
            lastUpdated.textContent = now.toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'long',
                day: 'numeric'
            });
        }
    };
    
    const vault_setupEventListeners = () => {
        // Feature card click events
        document.querySelectorAll('.feature-card').forEach(card => {
            card.addEventListener('click', () => {
                const featureId = card.dataset.featureId;
                vault_showFeatureDetails(featureId);
            });
        });
    };
    
    const vault_showFeatureDetails = (featureId) => {
        // Find the feature
        let foundFeature = null;
        Object.values(vault_featuresList).forEach(category => {
            category.forEach(feature => {
                if (feature.id === featureId) {
                    foundFeature = feature;
                }
            });
        });
        
        if (!foundFeature) return;
        
        // Create modal or show details
        const details = `
            <div class="feature-details-modal">
                <h2>${foundFeature.name} ${foundFeature.icon}</h2>
                <p><strong>Status:</strong> <span class="${vault_getStatusClass(foundFeature.status)}">
                    ${vault_getStatusText(foundFeature.status)}</span></p>
                <p><strong>Description:</strong> ${foundFeature.description}</p>
                <p><strong>Available Since:</strong> ${foundFeature.since}</p>
                <p><strong>Currently:</strong> ${foundFeature.enabled ? 'Enabled ✅' : 'Disabled ❌'}</p>
                ${foundFeature.status === 'coming' ? 
                    '<p class="coming-soon-note">This feature is scheduled for release in the next update.</p>' : ''}
                ${foundFeature.status === 'planned' ? 
                    '<p class="planned-note">This feature is in our roadmap for future development.</p>' : ''}
            </div>
        `;
        
        // Simple alert for now (can be replaced with modal)
        alert(
            `${foundFeature.name}\n\n` +
            `Description: ${foundFeature.description}\n` +
            `Status: ${vault_getStatusText(foundFeature.status)}\n` +
            `Available Since: ${foundFeature.since}\n` +
            `Currently: ${foundFeature.enabled ? 'Enabled' : 'Disabled'}`
        );
    };
    
    // Public API
    return {
        init: function() {
            console.log('🔧 Vault Features Module Initializing...');
            
            // Update stats
            vault_updateStats();
            
            // Render features
            vault_renderFeatures();
            
            // Update last updated date
            vault_updateLastUpdated();
            
            // Setup event listeners
            vault_setupEventListeners();
            
            console.log('✅ Vault Features Module Initialized');
        },
        
        getFeatureStatus: function(featureId) {
            let foundFeature = null;
            Object.values(vault_featuresList).forEach(category => {
                category.forEach(feature => {
                    if (feature.id === featureId) {
                        foundFeature = feature;
                    }
                });
            });
            
            return foundFeature ? {
                enabled: foundFeature.enabled,
                status: foundFeature.status
            } : null;
        },
        
        getAllFeatures: function() {
            return vault_featuresList;
        },
        
        getActiveFeaturesCount: function() {
            let count = 0;
            Object.values(vault_featuresList).forEach(category => {
                category.forEach(feature => {
                    if (feature.status === 'active' && feature.enabled) {
                        count++;
                    }
                });
            });
            return count;
        },
        
        enableFeature: function(featureId) {
            let found = false;
            Object.values(vault_featuresList).forEach(category => {
                category.forEach(feature => {
                    if (feature.id === featureId) {
                        feature.enabled = true;
                        found = true;
                    }
                });
            });
            
            if (found) {
                // Re-render features
                vault_renderFeatures();
                vault_setupEventListeners();
                return true;
            }
            return false;
        },
        
        disableFeature: function(featureId) {
            let found = false;
            Object.values(vault_featuresList).forEach(category => {
                category.forEach(feature => {
                    if (feature.id === featureId) {
                        feature.enabled = false;
                        found = true;
                    }
                });
            });
            
            if (found) {
                // Re-render features
                vault_renderFeatures();
                vault_setupEventListeners();
                return true;
            }
            return false;
        },
        
        getUserFeatures: function() {
            // Returns only active and enabled features
            const userFeatures = [];
            Object.values(vault_featuresList).forEach(category => {
                category.forEach(feature => {
                    if (feature.status === 'active' && feature.enabled) {
                        userFeatures.push({
                            id: feature.id,
                            name: feature.name,
                            icon: feature.icon
                        });
                    }
                });
            });
            return userFeatures;
        }
    };
})();

// Make available globally
window.vault_features = vault_features;

// Auto-initialize if on features page
if (window.location.pathname.includes('features.html')) {
    document.addEventListener('DOMContentLoaded', () => {
        vault_features.init();
    });
}

