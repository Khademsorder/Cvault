/* =========================================
   VAULT OS ULTIMATE - UPGRADED APP.JS
   (Features: Media Player, Zip View, Editor)
   ========================================= */

// -----------------------------------------
// 1. CONFIGURATION & STATE
// -----------------------------------------
const CONFIG = {
    // Firebase Config (Database)
    firebase: {
        apiKey: "AIzaSyB3Iy1MIbfmJ7h5rv9NlsT23ysedCwUZt4",
        authDomain: "encrypted-vault-4683d.firebaseapp.com",
        projectId: "encrypted-vault-4683d",
        storageBucket: "encrypted-vault-4683d.appspot.com",
        messagingSenderId: "851257263743",
        appId: "1:851257263743:web:e0d16606bd06f692f5e14a"
    },
    // Google Drive Config (Storage)
    google: {
        apiKey: "AIzaSyDa9xQWqxE71j3ZaI7NI_0hGztmLcx4USo", 
        clientId: "318681315152-65e9kofptt4c3bk3kmlj9gmksnasu347.apps.googleusercontent.com",
        // Added extra scopes for file reading
        scope: "https://www.googleapis.com/auth/drive.file https://www.googleapis.com/auth/drive.readonly https://www.googleapis.com/auth/userinfo.profile",
        discoveryDocs: ["https://www.googleapis.com/discovery/v1/apis/drive/v3/rest"]
    },
    app: {
        rootFolder: "1zIyinAqjQv96QBSuanFS2F0USaG66GPn", // Your Vault Folder ID
        pin: "1171", // Default PIN
        sessionDuration: 24 * 60 * 60 * 1000 
    }
};

// Global State
const state = {
    tokenClient: null,
    accessToken: null,
    currentUser: null,
    files: [],
    currentFolderId: CONFIG.app.rootFolder,
    folderStack: [],
    viewMode: localStorage.getItem('vault_view') || 'grid',
    selectedFiles: new Set(),
    searchTerm: "",
    nextPageToken: null,
    isLoading: false,
    db: null,
    debounce: null,
    currentZip: null // To store opened zip content
};

// -----------------------------------------
// 2. AUTHENTICATION SYSTEM
// -----------------------------------------
const Auth = {
    init: async function() {
        console.log("Auth Initializing...");
        
        try {
            if (typeof firebase !== 'undefined' && !firebase.apps.length) {
                firebase.initializeApp(CONFIG.firebase);
                state.db = firebase.firestore();
            }
        } catch (e) { console.warn("Firebase Error:", e); }

        if(typeof google !== 'undefined' && google.accounts) {
            state.tokenClient = google.accounts.oauth2.initTokenClient({
                client_id: CONFIG.google.clientId,
                scope: CONFIG.google.scope,
                callback: (response) => {
                    if (response.error) { console.error("Auth Error:", response); return; }
                    this.handleAuthSuccess(response);
                },
            });
        }
        this.checkSession();
    },

    login: function() { state.tokenClient.requestAccessToken({prompt: 'consent'}); },

    handleAuthSuccess: async function(response) {
        state.accessToken = response.access_token;
        const session = { token: state.accessToken, expiry: Date.now() + (response.expires_in * 1000) };
        localStorage.setItem('vault_auth', JSON.stringify(session));
        await this.fetchUserProfile();
        UI.showScreen('auth-screen'); 
        UI.toast("Google Connected! Enter PIN.");
    },

    fetchUserProfile: async function() {
        try {
            const res = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
                headers: { 'Authorization': `Bearer ${state.accessToken}` }
            });
            const data = await res.json();
            state.currentUser = data;
            const avatar = document.getElementById('user-avatar');
            if(avatar) avatar.src = data.picture;
            const name = document.getElementById('user-name');
            if(name) name.textContent = data.name;
        } catch (e) { console.error("Profile Error", e); }
    },

    checkSession: async function() {
        const savedAuth = JSON.parse(localStorage.getItem('vault_auth'));
        const savedPinSession = JSON.parse(localStorage.getItem('vault_session'));
        
        if (savedAuth && Date.now() < savedAuth.expiry) {
            state.accessToken = savedAuth.token;
            await this.fetchUserProfile();
            
            if (savedPinSession && Date.now() < savedPinSession.validUntil) {
                UI.showScreen('app-interface');
                Drive.loadFiles();
                UI.startSessionTimer(savedPinSession.validUntil);
            } else { UI.showScreen('auth-screen'); }
        } else { UI.showScreen('auth-screen'); }
    },

    verifyPin: async function(enteredPin) {
        if (enteredPin === CONFIG.app.pin) {
            const validUntil = Date.now() + CONFIG.app.sessionDuration;
            localStorage.setItem('vault_session', JSON.stringify({ validUntil: validUntil }));
            UI.showScreen('app-interface');
            UI.startSessionTimer(validUntil);
            Drive.loadFiles();
            return true;
        }
        return false;
    },

    logout: function() {
        if(confirm("Logout?")) { localStorage.clear(); location.reload(); }
    }
};

// -----------------------------------------
// 3. DRIVE API SYSTEM
// -----------------------------------------
const Drive = {
    loadFiles: async function(pageToken = null, isSearch = false) {
        if (!state.accessToken) return;
        state.isLoading = true;
        UI.showLoader(true);

        let query = "trashed = false";
        if (state.searchTerm) query += ` and name contains '${state.searchTerm}'`;
        else query += ` and '${state.currentFolderId}' in parents`;

        const params = new URLSearchParams({
            q: query,
            fields: "nextPageToken, files(id, name, mimeType, size, modifiedTime, thumbnailLink, iconLink, webContentLink, parents)",
            pageSize: 50,
            orderBy: "folder, modifiedTime desc",
            key: CONFIG.google.apiKey 
        });
        if (pageToken) params.append('pageToken', pageToken);

        try {
            const response = await fetch(`https://www.googleapis.com/drive/v3/files?${params}`, {
                headers: { 'Authorization': `Bearer ${state.accessToken}` }
            });
            const data = await response.json();
            if (data.error) throw data.error;

            state.nextPageToken = data.nextPageToken || null;
            state.files = pageToken ? [...state.files, ...data.files] : (data.files || []);

            UI.renderFiles(state.files);
            UI.updateBreadcrumbs();
            UI.showEmptyState(state.files.length === 0);
        } catch (e) {
            console.error("Load Error:", e);
            UI.toast("Failed to load files", "error");
        } finally {
            state.isLoading = false;
            UI.showLoader(false);
        }
    },

    search: function(term) {
        state.searchTerm = term;
        this.loadFiles(null, !!term);
    },

    uploadFile: async function(file) {
        const metadata = { name: file.name, mimeType: file.type, parents: [state.currentFolderId] };
        const form = new FormData();
        form.append('metadata', new Blob([JSON.stringify(metadata)], { type: 'application/json' }));
        form.append('file', file);

        try {
            UI.toast(`Uploading: ${file.name}...`);
            UI.showUploadProgress(true);
            const xhr = new XMLHttpRequest();
            xhr.open('POST', 'https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart');
            xhr.setRequestHeader('Authorization', `Bearer ${state.accessToken}`);
            
            xhr.upload.onprogress = (e) => {
                if (e.lengthComputable) UI.updateUploadProgress((e.loaded / e.total) * 100);
            };
            xhr.onload = () => {
                if (xhr.status === 200) { UI.toast("Upload Success"); this.loadFiles(); } 
                else { UI.toast("Upload Failed", "error"); }
                UI.showUploadProgress(false);
            };
            xhr.send(form);
        } catch (e) { UI.toast("Error", "error"); UI.showUploadProgress(false); }
    },

    createFolder: async function(name) {
        if (!name) return;
        const metadata = { name: name, mimeType: 'application/vnd.google-apps.folder', parents: [state.currentFolderId] };
        try {
            await fetch('https://www.googleapis.com/drive/v3/files', {
                method: 'POST',
                headers: { 'Authorization': `Bearer ${state.accessToken}`, 'Content-Type': 'application/json' },
                body: JSON.stringify(metadata)
            });
            UI.toast("Folder Created");
            this.loadFiles();
        } catch (e) { UI.toast("Error", "error"); }
    },

    deleteFiles: async function(ids) {
        if (!confirm(`Delete ${ids.length} item(s)?`)) return;
        for (const id of ids) {
            try {
                await fetch(`https://www.googleapis.com/drive/v3/files/${id}`, {
                    method: 'DELETE',
                    headers: { 'Authorization': `Bearer ${state.accessToken}` }
                });
            } catch (e) { console.error(e); }
        }
        UI.toast("Files Deleted");
        UI.clearSelection();
        this.loadFiles();
    }
};
// -----------------------------------------
// 4. ADVANCED MEDIA VIEWER & BATCH
// -----------------------------------------
const Viewer = {
    plyrInstance: null,

    open: async function(file) {
        const modal = document.getElementById('media-modal');
        const token = state.accessToken;
        
        // Clear previous views
        document.querySelectorAll('.media-view').forEach(el => el.classList.add('hidden'));
        if(modal) modal.classList.remove('hidden');

        // --- A. VIDEO PLAYER (Netflix Style) ---
        if (file.mimeType.includes('video')) {
            const container = document.getElementById('video-container');
            container.classList.remove('hidden');
            
            // Streaming URL with Auth
            const videoUrl = `https://www.googleapis.com/drive/v3/files/${file.id}?alt=media&access_token=${token}`;
            const playerEl = document.getElementById('player');
            playerEl.src = videoUrl;

            // Init Plyr
            if (this.plyrInstance) this.plyrInstance.destroy();
            this.plyrInstance = new Plyr('#player', {
                controls: ['play-large', 'play', 'progress', 'current-time', 'mute', 'volume', 'captions', 'settings', 'pip', 'fullscreen'],
            });

            // SRT Subtitle Upload Handler
            const subInput = document.getElementById('subtitle-upload');
            if(subInput) {
                subInput.onchange = (e) => {
                    const srtFile = e.target.files[0];
                    if(srtFile) {
                        const track = document.createElement('track');
                        track.kind = 'captions';
                        track.label = 'Custom';
                        track.srclang = 'en';
                        track.src = URL.createObjectURL(srtFile);
                        track.default = true;
                        playerEl.appendChild(track);
                        UI.toast("Subtitle loaded");
                    }
                };
            }

        // --- B. IMAGE VIEWER & EDITOR ---
        } else if (file.mimeType.includes('image')) {
            const container = document.getElementById('image-container');
            container.classList.remove('hidden');
            UI.showLoader(true);
            try {
                const response = await fetch(`https://www.googleapis.com/drive/v3/files/${file.id}?alt=media`, {
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                const blob = await response.blob();
                document.getElementById('image-view').src = URL.createObjectURL(blob);
            } catch(e) { console.error(e); } 
            finally { UI.showLoader(false); }

        // --- C. ZIP VIEWER ---
        } else if (file.mimeType.includes('zip') || file.mimeType.includes('compressed')) {
            const container = document.getElementById('generic-container');
            container.classList.remove('hidden');
            document.getElementById('file-title').innerText = "Opening Zip...";
            document.getElementById('file-content-list').innerHTML = 'Downloading Zip...';

            try {
                const response = await fetch(`https://www.googleapis.com/drive/v3/files/${file.id}?alt=media`, {
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                const blob = await response.blob();
                const zip = new JSZip();
                const contents = await zip.loadAsync(blob);
                state.currentZip = contents;
                
                let listHtml = '';
                document.getElementById('file-title').innerText = file.name;
                Object.keys(contents.files).forEach(filename => {
                    if(!contents.files[filename].dir) {
                        listHtml += `
                        <div class="zip-item">
                            <span>${filename}</span>
                            <button class="zip-dl-btn" onclick="Viewer.downloadFromZip('${filename}')">Get</button>
                        </div>`;
                    }
                });
                document.getElementById('file-content-list').innerHTML = listHtml;
            } catch (e) {
                document.getElementById('file-content-list').innerHTML = "Failed to open Zip.";
            }

        // --- D. DEFAULT (PDF/Office) ---
        } else {
            Viewer.close();
            window.open(file.webContentLink, '_blank');
        }
    },

    downloadFromZip: async function(filename) {
        if(state.currentZip) {
            const content = await state.currentZip.file(filename).async("blob");
            saveAs(content, filename);
        }
    },

    rotate: function(deg) {
        const img = document.getElementById('image-view');
        const currentDeg = parseInt(img.dataset.rotate || 0) + deg;
        img.style.transform = `rotate(${currentDeg}deg)`;
        img.dataset.rotate = currentDeg;
    },

    filter: function(val) { document.getElementById('image-view').style.filter = val; },
    
    resetImage: function() {
        const img = document.getElementById('image-view');
        img.style.transform = 'none'; img.style.filter = 'none'; img.dataset.rotate = 0;
    },

    close: function() {
        const modal = document.getElementById('media-modal');
        if(modal) modal.classList.add('hidden');
        if (this.plyrInstance) this.plyrInstance.stop();
    }
};

const Batch = {
    downloadSelected: async function() {
        const selectedIds = Array.from(state.selectedFiles);
        if(selectedIds.length === 0) return;

        UI.toast(`Zipping ${selectedIds.length} files...`);
        UI.showLoader(true);
        const zip = new JSZip();
        
        try {
            for (let id of selectedIds) {
                const fileInfo = state.files.find(f => f.id === id);
                const name = fileInfo ? fileInfo.name : id;
                const response = await fetch(`https://www.googleapis.com/drive/v3/files/${id}?alt=media`, {
                    headers: { 'Authorization': `Bearer ${state.accessToken}` }
                });
                zip.file(name, await response.blob());
            }
            const content = await zip.generateAsync({type:"blob"});
            saveAs(content, "Vault_Batch.zip");
            UI.toast("Download Started!");
            UI.clearSelection();
        } catch (e) {
            UI.toast("Zip Error", "error");
        } finally {
            UI.showLoader(false);
        }
    }
};
// -----------------------------------------
// 5. UI INTERACTION
// -----------------------------------------
const UI = {
    renderFiles: function(files) {
        const grid = document.getElementById('file-grid');
        if (!grid) return;
        if (!state.nextPageToken || state.files.length <= 50) grid.innerHTML = ''; 

        files.forEach(file => {
            const isFolder = file.mimeType === 'application/vnd.google-apps.folder';
            const card = document.createElement('div');
            card.className = `file-card ${state.viewMode === 'list' ? 'list-mode' : ''}`;
            card.dataset.id = file.id;

            card.innerHTML = `
                <div class="file-thumb">
                    ${file.thumbnailLink && !isFolder 
                        ? `<img src="${file.thumbnailLink}" loading="lazy" referrerpolicy="no-referrer">` 
                        : `<i class="fas ${this.getFileIcon(file.mimeType)}"></i>`
                    }
                </div>
                <div class="file-info"><div class="file-name">${file.name}</div></div>
            `;
            this.attachCardEvents(card, file);
            grid.appendChild(card);
        });
    },

    attachCardEvents: function(card, file) {
        let pressTimer;
        // SINGLE CLICK -> OPEN VIEWER
        card.addEventListener('click', () => {
            if (state.selectedFiles.size > 0) this.toggleSelection(card, file.id);
            else {
                if (file.mimeType === 'application/vnd.google-apps.folder') Navigation.openFolder(file.id, file.name);
                else Viewer.open(file); // CALLS THE NEW VIEWER
            }
        });
        // LONG PRESS -> SELECT
        card.addEventListener('touchstart', () => {
            pressTimer = setTimeout(() => {
                this.toggleSelection(card, file.id);
                if(navigator.vibrate) navigator.vibrate(50);
            }, 500);
        });
        card.addEventListener('touchend', () => clearTimeout(pressTimer));
    },

    toggleSelection: function(card, id) {
        if (state.selectedFiles.has(id)) {
            state.selectedFiles.delete(id);
            card.classList.remove('selected');
        } else {
            state.selectedFiles.add(id);
            card.classList.add('selected');
        }
        const batchBar = document.getElementById('batch-bar');
        if(batchBar) {
            batchBar.classList.toggle('active', state.selectedFiles.size > 0);
            const count = document.getElementById('selected-count');
            if(count) count.textContent = `${state.selectedFiles.size} selected`;
        }
    },

    clearSelection: function() {
        state.selectedFiles.clear();
        document.querySelectorAll('.file-card.selected').forEach(el => el.classList.remove('selected'));
        const batchBar = document.getElementById('batch-bar');
        if(batchBar) batchBar.classList.remove('active');
    },

    updateBreadcrumbs: function() {
        const container = document.getElementById('breadcrumbs');
        if(!container) return;
        let html = `<span class="crumb ${state.currentFolderId === CONFIG.app.rootFolder ? 'active' : ''}" onclick="Navigation.goHome()">Home</span>`;
        state.folderStack.forEach((folder, index) => {
            html += `<span class="crumb-separator">/</span>`;
            html += `<span class="crumb" onclick="Navigation.goToIndex(${index})">${folder.name || 'Folder'}</span>`;
        });
        container.innerHTML = html;
    },

    getFileIcon: function(mime) {
        if (mime.includes('folder')) return 'fa-folder';
        if (mime.includes('image')) return 'fa-file-image';
        if (mime.includes('video')) return 'fa-file-video';
        if (mime.includes('pdf')) return 'fa-file-pdf';
        if (mime.includes('zip') || mime.includes('compressed')) return 'fa-file-archive';
        return 'fa-file';
    },

    showScreen: function(screenId) {
        document.querySelectorAll('.screen-layer').forEach(el => el.classList.add('hidden'));
        const screen = document.getElementById(screenId);
        if (screen) {
            screen.classList.remove('hidden');
            if(screenId === 'app-interface') screen.style.display = 'flex';
        }
    },

    toast: function(msg, type = 'info') {
        const toast = document.createElement('div');
        toast.className = 'toast';
        toast.innerText = msg;
        toast.style.background = type === 'error' ? 'red' : '#333';
        toast.style.color = '#fff';
        toast.style.padding = '10px 20px';
        toast.style.position = 'fixed';
        toast.style.bottom = '20px';
        toast.style.left = '50%';
        toast.style.transform = 'translateX(-50%)';
        toast.style.borderRadius = '5px';
        toast.style.zIndex = '9999';
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
            const left = validUntil - Date.now();
            if (left <= 0) location.reload();
            else el.textContent = `${Math.floor(left / 60000)}m`;
        }, 60000);
    },

    setupEventListeners: function() {
        const searchInput = document.getElementById('search-input');
        if(searchInput) {
            searchInput.addEventListener('input', (e) => {
                clearTimeout(state.debounce);
                state.debounce = setTimeout(() => Drive.search(e.target.value), 500);
            });
        }
        const fileInput = document.getElementById('file-upload');
        if(fileInput) {
            fileInput.addEventListener('change', (e) => {
                if(e.target.files.length) Array.from(e.target.files).forEach(file => Drive.uploadFile(file));
            });
        }
    }
};

// -----------------------------------------
// 6. NAVIGATION & INIT
// -----------------------------------------
const Navigation = {
    openFolder: function(folderId, folderName) {
        state.folderStack.push({ id: state.currentFolderId, name: document.getElementById('breadcrumbs').lastElementChild?.textContent || 'Home' });
        state.currentFolderId = folderId;
        Drive.loadFiles();
    },
    goHome: function() {
        state.currentFolderId = CONFIG.app.rootFolder;
        state.folderStack = [];
        Drive.loadFiles();
    },
    goToIndex: function(index) {
        const target = state.folderStack[index];
        if(target) {
            state.currentFolderId = target.id;
            state.folderStack = state.folderStack.slice(0, index);
            Drive.loadFiles();
        }
    },
    handleBack: function() {
        if (state.folderStack.length > 0) {
            const previous = state.folderStack.pop();
            state.currentFolderId = previous.id;
            Drive.loadFiles();
        } else { this.goHome(); }
    }
};

document.addEventListener('DOMContentLoaded', () => {
    UI.setupEventListeners();
    Auth.init();
});
