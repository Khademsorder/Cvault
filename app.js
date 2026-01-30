// 1. GLOBAL AUTHORIZATION CONFIG (এইগুলো সবার উপরে থাকবে)
const CLIENT_ID = '318681315152-65e9kofptt4c3bk3kmlj9gmksnasu347.apps.googleusercontent.com';
const API_KEY = 'AIzaSyDa9xQWqxE71j3ZaI7NI_0hGztmLcx4USo';
const DISCOVERY_DOCS = ["https://www.googleapis.com/discovery/v1/apis/drive/v3/rest"];
const SCOPES = "https://www.googleapis.com/auth/drive.file";

// 2. APP CONFIGURATION OBJECT
const CONFIG = {
  // Firebase Configuration
  firebase: {
    apiKey: "AIzaSyB3Iy1MIBfmJ7h5rv9N1sT23ysedCwUZt4", // আপনার আগের কোড থেকে নেওয়া
    authDomain: "encrypted-vault-4683d.firebaseapp.com",
    projectId: "encrypted-vault-4683d",
    storageBucket: "encrypted-vault-4683d.appspot.com",
    messagingSenderId: "851257263743",
    appId: "1:851257263743:web:e0d16606bd06f692f5e14a"
  },
  
  // App Settings
  app: {
    rootFolder: "1zIyinAqjQv96QBSuanFS2F0USaG66GPn", // আপনার ভল্ট ফোল্ডার আইডি
    pin: "1171",
    sessionDuration: 24 * 60 * 60 * 1000 // 24 Hours
  }
};

// Global State
const state = {
    tokenClient: null,
    accessToken: null,
    currentUser: null,
    files: [],
    folders: [],
    currentFolderId: CONFIG.app.rootFolder,
    folderStack: [], // For Back Button
    viewMode: localStorage.getItem('vault_view') || 'grid',
    selectedFiles: new Set(),
    searchTerm: "",
    nextPageToken: null,
    isLoading: false,
    db: null // Firebase DB
};

// 2. AUTHENTICATION SYSTEM (Login & PIN)
const Auth = {
    init: async function() {
        console.log("Auth System Initializing...");
        
        // Initialize Firebase
        try {
            if (!firebase.apps.length) {
                firebase.initializeApp(CONFIG.firebase);
            }
            state.db = firebase.firestore();
        } catch (e) {
            console.warn("Offline Mode: Firebase not available", e);
        }

        // Initialize Google OAuth2 (The Fix)
        // We use initTokenClient instead of the old GSI library for Drive permissions
        state.tokenClient = google.accounts.oauth2.initTokenClient({
            client_id: CONFIG.google.clientId,
            scope: CONFIG.google.scope,
            callback: (response) => {
                if (response.error !== undefined) {
                    throw (response);
                }
                this.handleAuthSuccess(response);
            },
        });

        // Check for existing session
        this.checkSession();
    },

    // Trigger Google Login
    login: function() {
        // Request Access Token
        state.tokenClient.requestAccessToken({prompt: 'consent'});
    },

    // Handle Successful Google Auth
    handleAuthSuccess: async function(response) {
        state.accessToken = response.access_token;
        
        // Save minimal session info
        const session = {
            token: state.accessToken,
            expiry: Date.now() + (response.expires_in * 1000)
        };
        localStorage.setItem('vault_auth', JSON.stringify(session));

        // Fetch User Profile
        await this.fetchUserProfile();
        
        // Show PIN Screen (Security Layer)
        UI.showScreen('auth-screen'); 
        UI.toast("Google Connected! Enter PIN.");
    },

    // Fetch User Profile Data
    fetchUserProfile: async function() {
        try {
            const res = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
                headers: { 'Authorization': `Bearer ${state.accessToken}` }
            });
            const data = await res.json();
            state.currentUser = data;
            
            // Update Header UI
            document.getElementById('user-avatar').src = data.picture;
            document.getElementById('user-name').textContent = data.name;
            document.getElementById('user-email').textContent = data.email;
        } catch (e) {
            console.error("Profile Fetch Error", e);
        }
    },

    // Check Local Session
    checkSession: async function() {
        const savedAuth = JSON.parse(localStorage.getItem('vault_auth'));
        const savedPinSession = JSON.parse(localStorage.getItem('vault_session'));
        
        // 1. Check Google Token
        if (savedAuth && Date.now() < savedAuth.expiry) {
            state.accessToken = savedAuth.token;
            await this.fetchUserProfile();
            
            // 2. Check PIN Session (24h validity)
            if (savedPinSession && Date.now() < savedPinSession.validUntil) {
                // Both valid -> Go straight to App
                UI.showScreen('app-interface');
                Drive.loadFiles();
                UI.startSessionTimer(savedPinSession.validUntil);
            } else {
                // Token valid but PIN needed
                UI.showScreen('auth-screen');
            }
        } else {
            // Nothing valid -> Show Login
            UI.showScreen('auth-screen');
        }
    },

    // PIN Verification Logic
    verifyPin: async function(enteredPin) {
        let correctPin = CONFIG.app.pin; // Default

        // Try to fetch real PIN from Firebase if online
        if (state.db) {
            try {
                const doc = await state.db.collection('settings').doc('security').get();
                if (doc.exists) {
                    correctPin = doc.data().pin || correctPin;
                }
            } catch (e) {
                console.log("Using cached/default PIN");
            }
        }

        if (enteredPin === correctPin) {
            // Success
            const validUntil = Date.now() + CONFIG.app.sessionDuration;
            localStorage.setItem('vault_session', JSON.stringify({
                validUntil: validUntil
            }));
            
            UI.showScreen('app-interface');
            UI.startSessionTimer(validUntil);
            Drive.loadFiles(); // Start loading files
            return true;
        } else {
            return false;
        }
    },

    logout: function() {
        if(confirm("Logout and clear all data?")) {
            localStorage.clear();
            location.reload();
        }
    }
};

/* End of Part 1 */
/* =========================================
   PART 2: DRIVE API SYSTEM (Load, Search, Upload)
   ========================================= */

const Drive = {
    // 1. FETCH FILES (With Pagination & Search)
    loadFiles: async function(pageToken = null, isSearch = false) {
        if (!state.accessToken) return;
        
        state.isLoading = true;
        UI.showLoader(true);

        // Build Query (Server Side Search)
        let query = "trashed = false";
        
        if (state.searchTerm) {
            // Fix: Server-side search logic
            query += ` and name contains '${state.searchTerm}'`;
        } else {
            // Default: Show current folder content
            query += ` and '${state.currentFolderId}' in parents`;
        }

        const params = new URLSearchParams({
            q: query,
            fields: "nextPageToken, files(id, name, mimeType, size, modifiedTime, thumbnailLink, iconLink, webContentLink, webViewLink, parents)",
            pageSize: 50, // Load 50 at a time
            orderBy: "folder, modifiedTime desc",
            key: CONFIG.firebase.apiKey // Optional if using OAuth, but good for quota
        });

        if (pageToken) params.append('pageToken', pageToken);

        try {
            const response = await fetch(`https://www.googleapis.com/drive/v3/files?${params}`, {
                headers: { 'Authorization': `Bearer ${state.accessToken}` }
            });
            
            const data = await response.json();

            if (data.error) throw data.error;

            // Handle Pagination
            state.nextPageToken = data.nextPageToken || null;

            // Update State
            if (pageToken) {
                // Append if loading more
                state.files = [...state.files, ...data.files];
            } else {
                // Refresh if new load
                state.files = data.files || [];
            }

            // Render
            UI.renderFiles(state.files);
            UI.updateBreadcrumbs();
            
            // Empty State Check
            if (state.files.length === 0) {
                UI.showEmptyState(true);
            } else {
                UI.showEmptyState(false);
            }

        } catch (e) {
            console.error("Drive Load Error:", e);
            UI.toast("Failed to load files", "error");
        } finally {
            state.isLoading = false;
            UI.showLoader(false);
        }
    },

    // 2. SEARCH HANDLER
    search: function(term) {
        state.searchTerm = term;
        // Reset to root if search is cleared, else search global
        this.loadFiles(null, !!term);
    },

    // 3. UPLOAD FILE (Multipart)
    uploadFile: async function(file) {
        const metadata = {
            name: file.name,
            mimeType: file.type,
            parents: [state.currentFolderId]
        };

        const form = new FormData();
        form.append('metadata', new Blob([JSON.stringify(metadata)], { type: 'application/json' }));
        form.append('file', file);

        try {
            UI.toast(`Uploading: ${file.name}...`);
            UI.showUploadProgress(true); // Show progress bar

            const xhr = new XMLHttpRequest();
            xhr.open('POST', 'https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart');
            xhr.setRequestHeader('Authorization', `Bearer ${state.accessToken}`);
            
            // Progress Event
            xhr.upload.onprogress = (e) => {
                if (e.lengthComputable) {
                    const percent = (e.loaded / e.total) * 100;
     // 1. GLOBAL AUTHORIZATION CONFIG (এইগুলো সবার উপরে থাকবে)
const CLIENT_ID = '318681315152-65e9kofptt4c3bk3kmlj9gmksnasu347.apps.googleusercontent.com';
const API_KEY = 'AIzaSyDa9xQWqxE71j3ZaI7NI_0hGztmLcx4USo';
const DISCOVERY_DOCS = ["https://www.googleapis.com/discovery/v1/apis/drive/v3/rest"];
const SCOPES = "https://www.googleapis.com/auth/drive.file";

// 2. APP CONFIGURATION OBJECT
const CONFIG = {
  // Firebase Configuration
  firebase: {
    apiKey: "AIzaSyB3Iy1MIBfmJ7h5rv9N1sT23ysedCwUZt4", // আপনার আগের কোড থেকে নেওয়া
    authDomain: "encrypted-vault-4683d.firebaseapp.com",
    projectId: "encrypted-vault-4683d",
    storageBucket: "encrypted-vault-4683d.appspot.com",
    messagingSenderId: "851257263743",
    appId: "1:851257263743:web:e0d16606bd06f692f5e14a"
  },
  
  // App Settings
  app: {
    rootFolder: "1zIyinAqjQv96QBSuanFS2F0USaG66GPn", // আপনার ভল্ট ফোল্ডার আইডি
    pin: "1171",
    sessionDuration: 24 * 60 * 60 * 1000 // 24 Hours
  }
};               UI.updateUploadProgress(percent);
                }
            };

            xhr.onload = () => {
                if (xhr.status === 200) {
                    UI.toast("Upload Complete", "success");
                    UI.showUploadProgress(false);
                    this.loadFiles(); // Refresh
                } else {
                    throw new Error("Upload failed");
                }
            };

            xhr.send(form);

        } catch (e) {
            UI.toast("Upload Failed", "error");
            UI.showUploadProgress(false);
        }
    },

    // 4. CREATE FOLDER
    createFolder: async function(name) {
        if (!name) return;
        const metadata = {
            name: name,
            mimeType: 'application/vnd.google-apps.folder',
            parents: [state.currentFolderId]
        };

        try {
            await fetch('https://www.googleapis.com/drive/v3/files', {
                method: 'POST',
                headers: { 
                    'Authorization': `Bearer ${state.accessToken}`,
                    'Content-Type': 'application/json' 
                },
                body: JSON.stringify(metadata)
            });
            UI.toast("Folder Created");
            this.loadFiles();
        } catch (e) {
            UI.toast("Error creating folder", "error");
        }
    },

    // 5. DELETE FILES (Batch or Single)
    deleteFiles: async function(ids) {
        if (!confirm(`Delete ${ids.length} item(s)?`)) return;

        let successCount = 0;
        for (const id of ids) {
            try {
                await fetch(`https://www.googleapis.com/drive/v3/files/${id}`, {
                    method: 'DELETE',
                    headers: { 'Authorization': `Bearer ${state.accessToken}` }
                });
                successCount++;
            } catch (e) {
                console.error("Delete error", id);
            }
        }
        UI.toast(`Deleted ${successCount} items`);
        UI.clearSelection();
        this.loadFiles();
    },

    // 6. DOWNLOAD (Fix: Direct Link to avoid Memory Crash)
    downloadFile: function(file) {
        if (file.webContentLink) {
            // Open in new window triggers native download manager
            window.open(file.webContentLink, '_blank');
        } else {
            UI.toast("Download link not available", "error");
        }
    }
};

/* End of Part 2 */
/* =========================================
   PART 3: UI INTERACTION & NAVIGATION (Final)
   ========================================= */

const UI = {
    // 1. RENDER FILES (Grid/List)
    renderFiles: function(files) {
        const grid = document.getElementById('file-grid');
        
        // Don't clear if appending (pagination), clear if fresh load
        if (!state.nextPageToken || state.files.length <= 50) {
            grid.innerHTML = ''; 
        }

        files.forEach(file => {
            const isFolder = file.mimeType === 'application/vnd.google-apps.folder';
            const iconClass = this.getFileIcon(file.mimeType);
            const card = document.createElement('div');
            
            card.className = `file-card ${state.viewMode === 'list' ? 'list-mode' : ''}`;
            card.dataset.id = file.id;

            // HTML Structure
            card.innerHTML = `
                <div class="file-thumb">
                    ${file.thumbnailLink && !isFolder 
                        ? `<img src="${file.thumbnailLink}" loading="lazy" referrerpolicy="no-referrer">` 
                        : `<i class="fas ${iconClass}"></i>`
                    }
                </div>
                <div class="file-info">
                    <div class="file-name">${file.name}</div>
                    <div class="file-meta">
                        ${isFolder ? 'Folder' : this.formatSize(file.size)}
                    </div>
                </div>
            `;

            // Events
            this.attachCardEvents(card, file);
            grid.appendChild(card);
        });
    },

    // 2. EVENT BINDING (Click, Long Press)
    attachCardEvents: function(card, file) {
        let pressTimer;

        // Click (Navigation or Preview)
        card.addEventListener('click', () => {
            if (state.selectedFiles.size > 0) {
                // Selection Mode
                this.toggleSelection(card, file.id);
            } else {
                // Normal Action
                if (file.mimeType === 'application/vnd.google-apps.folder') {
                    Navigation.openFolder(file.id, file.name);
                } else {
                    Drive.downloadFile(file); // Or open Preview
                }
            }
        });

        // Long Press (Context Menu / Selection)
        card.addEventListener('touchstart', () => {
            pressTimer = setTimeout(() => {
                this.toggleSelection(card, file.id);
                navigator.vibrate(50); // Haptic feedback
            }, 500);
        });

        card.addEventListener('touchend', () => clearTimeout(pressTimer));
        
        // Right Click (PC)
        card.addEventListener('contextmenu', (e) => {
            e.preventDefault();
            this.showContextMenu(e, file);
        });
    },

    // 3. NAVIGATION LOGIC (Back Button Fix)
    updateBreadcrumbs: function() {
        const container = document.getElementById('breadcrumbs');
        let html = `<span class="crumb ${state.currentFolderId === CONFIG.app.rootFolder ? 'active' : ''}" onclick="Navigation.goHome()">Home</span>`;
        
        state.folderStack.forEach((folder, index) => {
            html += `<span class="crumb-separator"><i class="fas fa-chevron-right"></i></span>`;
            html += `<span class="crumb" onclick="Navigation.goToIndex(${index})">${folder.name}</span>`;
        });
        
        container.innerHTML = html;
    },

    // 4. UTILITIES
    getFileIcon: function(mime) {
        if (mime.includes('folder')) return 'fa-folder icon-folder';
        if (mime.includes('image')) return 'fa-file-image icon-image';
        if (mime.includes('video')) return 'fa-file-video icon-video';
        if (mime.includes('pdf')) return 'fa-file-pdf icon-pdf';
        if (mime.includes('zip') || mime.includes('compressed')) return 'fa-file-archive icon-zip';
        return 'fa-file icon-doc';
    },

    formatSize: function(bytes) {
        if (!bytes) return '';
        const sizes = ['B', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(1024));
        return `${(bytes / Math.pow(1024, i)).toFixed(1)} ${sizes[i]}`;
    },

    toggleSelection: function(card, id) {
        if (state.selectedFiles.has(id)) {
            state.selectedFiles.delete(id);
            card.classList.remove('selected');
        } else {
            state.selectedFiles.add(id);
            card.classList.add('selected');
        }
        
        // Show/Hide Batch Bar
        const batchBar = document.getElementById('batch-bar');
        if (state.selectedFiles.size > 0) {
            batchBar.classList.add('active');
            document.getElementById('selected-count').textContent = `${state.selectedFiles.size} selected`;
        } else {
            batchBar.classList.remove('active');
        }
    },

    clearSelection: function() {
        state.selectedFiles.clear();
        document.querySelectorAll('.file-card.selected').forEach(el => el.classList.remove('selected'));
        document.getElementById('batch-bar').classList.remove('active');
    },

    showScreen: function(screenId) {
        document.querySelectorAll('.screen-layer').forEach(el => el.classList.add('hidden'));
        const screen = document.getElementById(screenId);
        if (screen) {
            screen.classList.remove('hidden');
            if(screenId === 'app-interface') screen.style.display = 'flex'; // Fix flex layout
        }
    },

    toast: function(msg, type = 'info') {
        const toast = document.createElement('div');
        toast.className = 'toast';
        toast.style.borderLeft = `4px solid ${type === 'error' ? 'var(--danger)' : 'var(--success)'}`;
        toast.innerHTML = `<i class="fas fa-${type === 'error' ? 'exclamation-circle' : 'check-circle'}"></i> ${msg}`;
        document.body.appendChild(toast);
        setTimeout(() => toast.remove(), 3000);
    },

    showLoader: function(show) {
        const loader = document.getElementById('main-loader');
        if(loader) loader.style.display = show ? 'block' : 'none';
    },

    showEmptyState: function(show) {
        const empty = document.getElementById('empty-state');
        if(empty) empty.style.display = show ? 'flex' : 'none';
    },
    
    showUploadProgress: function(show) {
        const widget = document.getElementById('upload-widget');
        if(widget) widget.classList.toggle('hidden', !show);
    },
    
    updateUploadProgress: function(percent) {
        const fill = document.querySelector('.progress-fill');
        if(fill) fill.style.width = `${percent}%`;
    },

    startSessionTimer: function(validUntil) {
        const el = document.getElementById('session-timer');
        if (!el) return;

        setInterval(() => {
            const now = Date.now();
            const left = validUntil - now;
            if (left <= 0) {
                location.reload(); // Expired
            } else {
                const hrs = Math.floor(left / 3600000);
                const mins = Math.floor((left % 3600000) / 60000);
                el.textContent = `${hrs}h ${mins}m`;
            }
        }, 60000);
    },

    // Setup Global Listeners
    setupEventListeners: function() {
        // Infinite Scroll
        const main = document.getElementById('main-content');
        main.addEventListener('scroll', () => {
            if (main.scrollTop + main.clientHeight >= main.scrollHeight - 50) {
                if (state.nextPageToken && !state.isLoading) {
                    Drive.loadFiles(state.nextPageToken);
                }
            }
        });

        // Search Input
        const searchInput = document.getElementById('search-input');
        let debounce;
        searchInput.addEventListener('input', (e) => {
            clearTimeout(debounce);
            debounce = setTimeout(() => {
                Drive.search(e.target.value);
            }, 500);
        });

        // File Upload
        const fileInput = document.getElementById('file-upload');
        fileInput.addEventListener('change', (e) => {
            if(e.target.files.length) {
                Array.from(e.target.files).forEach(file => Drive.uploadFile(file));
            }
        });

        // Popstate (Back Button)
        window.onpopstate = (event) => {
            if (event.state && event.state.folderId) {
                Navigation.handleBack(event.state.folderId);
            }
        };
    }
};

// 5. NAVIGATION CONTROLLER
const Navigation = {
    openFolder: function(folderId, folderName) {
        // Push State Logic
        state.folderStack.push({ id: state.currentFolderId, name: this.getCurrentFolderName() });
        state.currentFolderId = folderId;
        
        // Update Browser History
        history.pushState({ folderId: folderId }, folderName, `#${folderId}`);
        
        Drive.loadFiles();
    },

    getCurrentFolderName: function() {
        // Helper to find name (simplified)
        return "Folder"; // Ideally fetch from API or stack
    },

    goHome: function() {
        state.currentFolderId = CONFIG.app.rootFolder;
        state.folderStack = [];
        history.pushState({ folderId: CONFIG.app.rootFolder }, "Home", "#root");
        Drive.loadFiles();
    },
    
    handleBack: function(folderId) {
        state.currentFolderId = folderId;
        // Pop from internal stack if needed
        state.folderStack.pop(); 
        Drive.loadFiles();
    }
};

// =========================================
// INITIALIZATION
// =========================================
document.addEventListener('DOMContentLoaded', () => {
    // 1. Setup UI Listeners
    UI.setupEventListeners();
    
    // 2. Initialize Auth
    Auth.init();
    
    // 3. PWA Install Logic
    let deferredPrompt;
    window.addEventListener('beforeinstallprompt', (e) => {
        e.preventDefault();
        deferredPrompt = e;
        const btn = document.getElementById('install-btn');
        if(btn) {
            btn.classList.remove('hidden');
            btn.addEventListener('click', () => {
                deferredPrompt.prompt();
                btn.classList.add('hidden');
            });
        }
    });
});

/* End of app.js */


