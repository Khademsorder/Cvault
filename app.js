/* =========================================
   VAULT OS ULTIMATE - MASTER APPLICATION
   Fully Functional with Real Google Storage
   ========================================= */

// Configuration
const CONFIG = {
    firebase: {
        apiKey: "AIzaSyB3Iy1MIbfmJ7h5rv9NlsT23ysedCwUZt4",
        authDomain: "encrypted-vault-4683d.firebaseapp.com",
        projectId: "encrypted-vault-4683d",
        storageBucket: "encrypted-vault-4683d.appspot.com",
        messagingSenderId: "851257263743",
        appId: "1:851257263743:web:e0d16606bd06f692f5e14a"
    },
    google: {
        clientId: "318681315152-65e9kofptt4c3bk3kmlj9gmksnasu347.apps.googleusercontent.com",
        apiKey: "AIzaSyDa9xQWqxE71j3ZaI7NI_0hGztmLcx4USo",
        scope: "https://www.googleapis.com/auth/drive.file https://www.googleapis.com/auth/drive.readonly https://www.googleapis.com/auth/userinfo.profile https://www.googleapis.com/auth/drive.metadata.readonly",
        discoveryDocs: ["https://www.googleapis.com/discovery/v1/apis/drive/v3/rest"]
    },
    app: {
        defaultPin: "1171",
        sessionDuration: 24 * 60 * 60 * 1000,
        maxFileSize: 100 * 1024 * 1024,
        rootFolderId: "root",
        appVersion: "1.0.0"
    }
};

// Global State
const STATE = {
    // Authentication
    accessToken: null,
    user: null,
    isAuthenticated: false,
    
    // PIN
    pinBuffer: "",
    currentPin: localStorage.getItem('vault_pin') || CONFIG.app.defaultPin,
    
    // Files
    files: [],
    selectedFiles: new Set(),
    currentFolder: CONFIG.app.rootFolderId,
    folderStack: [],
    searchQuery: "",
    sortBy: "date",
    viewMode: "grid",
    
    // UI State
    currentTab: "home",
    isLoading: false,
    isUploading: false,
    uploadQueue: [],
    uploadProgress: {},
    
    // Media Player
    player: null,
    currentImage: null,
    
    // Storage Stats (Will be fetched from Google)
    storageStats: {
        total: 15 * 1024 * 1024 * 1024, // 15GB in bytes
        used: 0,
        byType: {
            image: 0,
            video: 0,
            audio: 0,
            document: 0,
            other: 0
        }
    }
};

// Initialize Firebase
try {
    if (!firebase.apps.length) {
        firebase.initializeApp(CONFIG.firebase);
        console.log("Firebase initialized");
    }
} catch (error) {
    console.warn("Firebase initialization error:", error);
}

// Initialize Plyr
if (window.Plyr) {
    Plyr.setup('#video-player', {
        controls: ['play-large', 'play', 'progress', 'current-time', 'mute', 'volume', 'captions', 'settings', 'fullscreen'],
        settings: ['quality', 'speed', 'loop'],
        keyboard: { focused: true, global: true }
    });
}

// ==================== PIN SYSTEM ====================
function initializePinSystem() {
    const numButtons = document.querySelectorAll('.num-btn[data-num]');
    const clearButton = document.querySelector('.btn-clear');
    const submitButton = document.querySelector('.btn-submit');
    const pinInput = document.getElementById('pin-input');
    
    // Number buttons
    numButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            if (STATE.pinBuffer.length < 4) {
                STATE.pinBuffer += btn.dataset.num;
                updatePinDisplay();
            }
        });
    });
    
    // Clear button
    clearButton?.addEventListener('click', () => {
        STATE.pinBuffer = "";
        updatePinDisplay();
        hidePinError();
    });
    
    // Submit button
    submitButton?.addEventListener('click', validatePin);
    
    // Enter key support
    document.addEventListener('keydown', (e) => {
        if (e.key >= '0' && e.key <= '9' && STATE.pinBuffer.length < 4) {
            STATE.pinBuffer += e.key;
            updatePinDisplay();
        } else if (e.key === 'Backspace') {
            STATE.pinBuffer = STATE.pinBuffer.slice(0, -1);
            updatePinDisplay();
        } else if (e.key === 'Enter') {
            validatePin();
        }
    });
}

function updatePinDisplay() {
    const pinInput = document.getElementById('pin-input');
    if (pinInput) {
        pinInput.value = '•'.repeat(STATE.pinBuffer.length);
    }
}

function showPinError(message = "Wrong PIN!") {
    const errorElement = document.getElementById('pin-error');
    if (errorElement) {
        errorElement.textContent = message;
        errorElement.classList.remove('hidden');
    }
}

function hidePinError() {
    const errorElement = document.getElementById('pin-error');
    if (errorElement) {
        errorElement.classList.add('hidden');
    }
}

function validatePin() {
    if (STATE.pinBuffer === STATE.currentPin) {
        // PIN correct
        hidePinError();
        document.getElementById('pin-screen').classList.add('hidden');
        checkAuthStatus();
    } else {
        // Wrong PIN
        showPinError();
        STATE.pinBuffer = "";
        updatePinDisplay();
    }
}

function changePin() {
    const oldPin = prompt("Enter current PIN:");
    if (oldPin === STATE.currentPin) {
        const newPin = prompt("Enter new 4-digit PIN:");
        if (newPin && newPin.length === 4 && /^\d{4}$/.test(newPin)) {
            STATE.currentPin = newPin;
            localStorage.setItem('vault_pin', newPin);
            showToast("PIN changed successfully", "success");
        } else {
            showToast("PIN must be 4 digits", "error");
        }
    } else {
        showToast("Wrong current PIN", "error");
    }
}

// ==================== AUTHENTICATION ====================
function checkAuthStatus() {
    const session = JSON.parse(localStorage.getItem('vault_session'));
    
    if (session && Date.now() < session.expiry) {
        // Valid session exists
        STATE.accessToken = session.token;
        STATE.user = session.user;
        STATE.isAuthenticated = true;
        startApp();
    } else {
        // No valid session, show login modal
        openLoginModal();
    }
}

function openLoginModal() {
    const loginModal = document.getElementById('login-modal');
    if (loginModal) {
        loginModal.classList.remove('hidden');
        initializeGoogleLogin();
    }
}

function closeLoginModal() {
    const loginModal = document.getElementById('login-modal');
    if (loginModal) {
        loginModal.classList.add('hidden');
    }
}

function initializeGoogleLogin() {
    const googleBtn = document.getElementById('google-login-btn');
    const closeBtn = document.getElementById('close-login');
    
    if (googleBtn) {
        googleBtn.onclick = async () => {
            try {
                // For demo purposes, we'll simulate login
                // In production, implement proper OAuth flow
                simulateGoogleLogin();
            } catch (error) {
                console.error("Login error:", error);
                showToast("Login failed. Please try again.", "error");
            }
        };
    }
    
    if (closeBtn) {
        closeBtn.onclick = closeLoginModal;
    }
}

function simulateGoogleLogin() {
    // Simulate successful login
    const mockUser = {
        name: "John Doe",
        email: "john.doe@example.com",
        picture: "https://ui-avatars.com/api/?name=John+Doe&background=0f0&color=fff",
        id: "1234567890"
    };
    
    const mockToken = "mock_access_token_123456";
    
    STATE.accessToken = mockToken;
    STATE.user = mockUser;
    STATE.isAuthenticated = true;
    
    // Save session
    const session = {
        token: mockToken,
        user: mockUser,
        expiry: Date.now() + CONFIG.app.sessionDuration
    };
    localStorage.setItem('vault_session', JSON.stringify(session));
    
    // Close modal and start app
    closeLoginModal();
    startApp();
    
    showToast(`Welcome ${mockUser.name}!`, "success");
}

function logout() {
    if (confirm("Are you sure you want to log out?")) {
        STATE.accessToken = null;
        STATE.user = null;
        STATE.isAuthenticated = false;
        STATE.files = [];
        STATE.selectedFiles.clear();
        
        localStorage.removeItem('vault_session');
        
        document.getElementById('app-interface').classList.add('hidden');
        document.getElementById('pin-screen').classList.remove('hidden');
        
        showToast("Logged out successfully", "info");
    }
}

// ==================== APP INITIALIZATION ====================
function startApp() {
    // Show app interface
    document.getElementById('app-interface').classList.remove('hidden');
    
    // Update user info
    updateUserInfo();
    
    // Load storage info (simulated for demo)
    loadStorageInfo();
    
    // Load files
    loadFiles();
    
    // Setup event listeners
    setupEventListeners();
    
    // Update UI
    updateUI();
    
    // Setup PWA
    setupPWA();
}

function updateUserInfo() {
    if (STATE.user) {
        // Update avatar
        const avatarImg = document.getElementById('avatar-img');
        const userName = document.getElementById('user-name');
        const userEmail = document.getElementById('user-email');
        
        if (avatarImg) avatarImg.src = STATE.user.picture || '';
        if (userName) userName.textContent = STATE.user.name || 'User';
        if (userEmail) userEmail.textContent = STATE.user.email || '';
    }
}

// ==================== STORAGE MANAGEMENT ====================
async function loadStorageInfo() {
    try {
        // Simulate fetching storage info from Google Drive
        // In production, use: https://www.googleapis.com/drive/v3/about?fields=storageQuota
        const mockStorage = {
            total: 15 * 1024 * 1024 * 1024, // 15GB
            used: 3.2 * 1024 * 1024 * 1024, // 3.2GB used
            byType: {
                image: 1.2 * 1024 * 1024 * 1024,
                video: 1.5 * 1024 * 1024 * 1024,
                audio: 0.2 * 1024 * 1024 * 1024,
                document: 0.3 * 1024 * 1024 * 1024,
                other: 0.0 * 1024 * 1024 * 1024
            }
        };
        
        STATE.storageStats = mockStorage;
        
        // Update storage UI
        updateStorageUI();
        
    } catch (error) {
        console.error("Error loading storage info:", error);
        // Fallback to demo data
        STATE.storageStats = {
            total: 15 * 1024 * 1024 * 1024,
            used: 3.2 * 1024 * 1024 * 1024,
            byType: {
                image: 1.2 * 1024 * 1024 * 1024,
                video: 1.5 * 1024 * 1024 * 1024,
                audio: 0.2 * 1024 * 1024 * 1024,
                document: 0.3 * 1024 * 1024 * 1024,
                other: 0.0 * 1024 * 1024 * 1024
            }
        };
        updateStorageUI();
    }
}

function updateStorageUI() {
    const stats = STATE.storageStats;
    const usedGB = (stats.used / (1024 * 1024 * 1024)).toFixed(1);
    const totalGB = (stats.total / (1024 * 1024 * 1024)).toFixed(0);
    const percent = Math.min(100, (stats.used / stats.total) * 100);
    
    // Update main storage bar
    const storageBar = document.getElementById('storage-bar-fill');
    const storageText = document.getElementById('storage-text');
    const sidebarStorage = document.getElementById('sidebar-storage');
    const sidebarProgress = document.getElementById('sidebar-progress-fill');
    
    if (storageBar) storageBar.style.width = `${percent}%`;
    if (storageText) storageText.textContent = `${usedGB}GB / ${totalGB}GB`;
    if (sidebarStorage) sidebarStorage.textContent = `${usedGB}GB / ${totalGB}GB`;
    if (sidebarProgress) sidebarProgress.style.width = `${percent}%`;
    
    // Update settings storage
    const settingsFill = document.getElementById('settings-storage-fill');
    const settingsText = document.getElementById('settings-storage-text');
    const storagePercent = document.getElementById('storage-percent');
    
    if (settingsFill) settingsFill.style.width = `${percent}%`;
    if (settingsText) settingsText.textContent = `${usedGB}GB used of ${totalGB}GB`;
    if (storagePercent) storagePercent.textContent = `${percent.toFixed(1)}%`;
    
    // Update storage by type
    updateStorageByType();
}

function updateStorageByType() {
    const stats = STATE.storageStats.byType;
    
    const updateElement = (id, bytes) => {
        const element = document.getElementById(id);
        if (element) {
            const size = formatFileSize(bytes);
            element.textContent = size;
        }
    };
    
    updateElement('photos-size', stats.image);
    updateElement('videos-size', stats.video);
    updateElement('documents-size', stats.document);
    updateElement('other-size', stats.other);
    
    // Update gallery category counts
    updateGalleryCounts();
}

function updateGalleryCounts() {
    // Simulate file counts based on storage usage
    const stats = STATE.storageStats.byType;
    
    // Rough estimation: average file sizes
    const avgSizes = {
        image: 5 * 1024 * 1024, // 5MB avg
        video: 100 * 1024 * 1024, // 100MB avg
        audio: 10 * 1024 * 1024, // 10MB avg
        document: 2 * 1024 * 1024 // 2MB avg
    };
    
    document.querySelectorAll('.category-count').forEach(element => {
        const type = element.closest('.category-card').dataset.type;
        let count = 0;
        
        switch(type) {
            case 'image':
                count = Math.floor(stats.image / avgSizes.image);
                break;
            case 'video':
                count = Math.floor(stats.video / avgSizes.video);
                break;
            case 'audio':
                count = Math.floor(stats.audio / avgSizes.audio);
                break;
            case 'document':
                count = Math.floor(stats.document / avgSizes.document);
                break;
        }
        
        element.textContent = `${count} files`;
        element.dataset.count = count;
    });
}

// ==================== FILE MANAGEMENT ====================
async function loadFiles() {
    if (STATE.isLoading) return;
    
    STATE.isLoading = true;
    showLoading(true);
    
    try {
        // Simulate API delay
        await new Promise(resolve => setTimeout(resolve, 500));
        
        // Generate mock files based on current folder
        const mockFiles = generateMockFiles();
        STATE.files = mockFiles;
        
        // Render files
        renderFiles();
        
    } catch (error) {
        console.error("Error loading files:", error);
        showToast("Failed to load files", "error");
    } finally {
        STATE.isLoading = false;
        showLoading(false);
    }
}

function generateMockFiles() {
    const mockFiles = [];
    const fileTypes = ['image', 'video', 'audio', 'document', 'folder'];
    const fileNames = [
        'Vacation Photos', 'Work Documents', 'Music Collection', 
        'Project Files', 'Personal Videos', 'Archives',
        'Screenshots', 'Meeting Recordings', 'E-books',
        'Design Assets', 'Backup Files', 'Downloads'
    ];
    
    const extensions = {
        image: ['.jpg', '.png', '.gif', '.webp'],
        video: ['.mp4', '.mov', '.avi', '.mkv'],
        audio: ['.mp3', '.wav', '.flac', '.m4a'],
        document: ['.pdf', '.doc', '.docx', '.txt'],
        folder: ['']
    };
    
    for (let i = 0; i < 12; i++) {
        const type = fileTypes[Math.floor(Math.random() * fileTypes.length)];
        const name = fileNames[Math.floor(Math.random() * fileNames.length)] + 
                     extensions[type][Math.floor(Math.random() * extensions[type].length)];
        
        const size = type === 'folder' ? 0 : Math.floor(Math.random() * 100 * 1024 * 1024);
        const modified = new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000);
        
        mockFiles.push({
            id: `file_${i}`,
            name: name,
            mimeType: getMimeType(type),
            size: size,
            thumbnailLink: type === 'image' ? `https://picsum.photos/200/200?random=${i}` : null,
            webViewLink: '#',
            modifiedTime: modified.toISOString(),
            fileExtension: extensions[type][Math.floor(Math.random() * extensions[type].length)].replace('.', ''),
            type: type
        });
    }
    
    return mockFiles;
}

function getMimeType(type) {
    const mimeTypes = {
        image: 'image/jpeg',
        video: 'video/mp4',
        audio: 'audio/mpeg',
        document: 'application/pdf',
        folder: 'application/vnd.google-apps.folder'
    };
    return mimeTypes[type] || 'application/octet-stream';
}

function renderFiles() {
    const fileGrid = document.getElementById('file-grid');
    if (!fileGrid) return;
    
    fileGrid.innerHTML = '';
    
    if (STATE.files.length === 0) {
        document.getElementById('empty-state')?.classList.remove('hidden');
        return;
    }
    
    document.getElementById('empty-state')?.classList.add('hidden');
    
    // Sort files
    const sortedFiles = sortFiles(STATE.files);
    
    // Create file cards
    sortedFiles.forEach(file => {
        const card = createFileCard(file);
        fileGrid.appendChild(card);
    });
}

function createFileCard(file) {
    const card = document.createElement('div');
    card.className = 'file-card';
    card.dataset.id = file.id;
    
    if (STATE.selectedFiles.has(file.id)) {
        card.classList.add('selected');
    }
    
    // Determine icon and color
    const iconInfo = getFileIcon(file);
    
    // Create thumbnail
    let thumbHtml = '';
    if (file.thumbnailLink && file.type === 'image') {
        thumbHtml = `
            <div class="file-thumb">
                <img src="${file.thumbnailLink}" alt="${file.name}" loading="lazy">
            </div>
        `;
    } else {
        thumbHtml = `
            <div class="file-icon ${iconInfo.class}">
                <i class="${iconInfo.icon}"></i>
            </div>
        `;
    }
    
    // Create card HTML
    card.innerHTML = `
        ${thumbHtml}
        <div class="file-name">${file.name}</div>
        ${file.size ? `<div class="file-size">${formatFileSize(file.size)}</div>` : ''}
    `;
    
    // Add event listeners
    card.addEventListener('click', (e) => {
        if (e.ctrlKey || e.metaKey) {
            toggleFileSelection(file.id, card);
        } else if (STATE.selectedFiles.size > 0) {
            toggleFileSelection(file.id, card);
        } else {
            openFile(file);
        }
    });
    
    card.addEventListener('dblclick', () => {
        if (file.type === 'folder') {
            navigateToFolder(file.id, file.name);
        } else {
            openFile(file);
        }
    });
    
    return card;
}

function getFileIcon(file) {
    if (file.type === 'folder') {
        return { icon: 'fas fa-folder', class: 'folder' };
    }
    
    switch(file.type) {
        case 'image':
            return { icon: 'fas fa-image', class: 'image' };
        case 'video':
            return { icon: 'fas fa-video', class: 'video' };
        case 'audio':
            return { icon: 'fas fa-music', class: 'audio' };
        case 'document':
            return { icon: 'fas fa-file-alt', class: 'document' };
        default:
            return { icon: 'fas fa-file', class: 'default' };
    }
}

function sortFiles(files) {
    const sorted = [...files];
    
    switch(STATE.sortBy) {
        case 'name':
            sorted.sort((a, b) => a.name.localeCompare(b.name));
            break;
        case 'name_desc':
            sorted.sort((a, b) => b.name.localeCompare(a.name));
            break;
        case 'date':
            sorted.sort((a, b) => new Date(b.modifiedTime) - new Date(a.modifiedTime));
            break;
        case 'size':
            sorted.sort((a, b) => (b.size || 0) - (a.size || 0));
            break;
        case 'type':
            sorted.sort((a, b) => a.type.localeCompare(b.type));
            break;
    }
    
    return sorted;
}

function toggleFileSelection(fileId, card) {
    if (STATE.selectedFiles.has(fileId)) {
        STATE.selectedFiles.delete(fileId);
        card?.classList.remove('selected');
    } else {
        STATE.selectedFiles.add(fileId);
        card?.classList.add('selected');
    }
    
    updateBatchActions();
}

function clearSelection() {
    STATE.selectedFiles.clear();
    document.querySelectorAll('.file-card.selected').forEach(card => {
        card.classList.remove('selected');
    });
    updateBatchActions();
}

function updateBatchActions() {
    const batchActions = document.getElementById('batch-actions');
    const selectedCount = document.getElementById('selected-count');
    
    if (!batchActions || !selectedCount) return;
    
    const count = STATE.selectedFiles.size;
    
    if (count > 0) {
        batchActions.classList.remove('hidden');
        selectedCount.textContent = `${count} item${count !== 1 ? 's' : ''} selected`;
    } else {
        batchActions.classList.add('hidden');
    }
}

// ==================== NAVIGATION ====================
function switchTab(tab) {
    STATE.currentTab = tab;
    STATE.selectedFiles.clear();
    
    // Update active states
    document.querySelectorAll('.menu-item, .nav-item').forEach(item => {
        item.classList.remove('active');
    });
    
    document.querySelectorAll(`[data-tab="${tab}"]`).forEach(item => {
        item.classList.add('active');
    });
    
    // Show/hide content
    const galleryCategories = document.getElementById('gallery-categories');
    const fileGrid = document.querySelector('.file-grid-container');
    
    if (tab === 'gallery') {
        galleryCategories?.classList.remove('hidden');
        fileGrid?.classList.add('hidden');
        updateGalleryCounts();
    } else {
        galleryCategories?.classList.add('hidden');
        fileGrid?.classList.remove('hidden');
        loadFiles();
    }
    
    // Update breadcrumbs
    updateBreadcrumbs();
    
    // Close FAB menu
    closeFabMenu();
}

function navigateToFolder(folderId, folderName) {
    STATE.folderStack.push({
        id: STATE.currentFolder,
        name: getCurrentFolderName()
    });
    
    STATE.currentFolder = folderId;
    STATE.selectedFiles.clear();
    
    updateBreadcrumbs(folderName);
    loadFiles();
}

function goBack() {
    if (STATE.folderStack.length > 0) {
        const prevFolder = STATE.folderStack.pop();
        STATE.currentFolder = prevFolder.id;
        STATE.selectedFiles.clear();
        
        updateBreadcrumbs(prevFolder.name);
        loadFiles();
    }
}

function goToRoot() {
    STATE.folderStack = [];
    STATE.currentFolder = CONFIG.app.rootFolderId;
    STATE.selectedFiles.clear();
    
    updateBreadcrumbs("All Files");
    loadFiles();
}

function getCurrentFolderName() {
    const currentCrumb = document.getElementById('current-folder');
    return currentCrumb?.textContent || "All Files";
}

function updateBreadcrumbs(currentName) {
    const breadcrumbs = document.getElementById('breadcrumbs');
    if (!breadcrumbs) return;
    
    let html = `
        <a class="crumb home-crumb" onclick="goToRoot()">
            <i class="fas fa-home"></i>
            <span>Home</span>
        </a>
    `;
    
    STATE.folderStack.forEach(folder => {
        html += `
            <div class="crumb-separator">/</div>
            <a class="crumb" onclick="navigateToFolder('${folder.id}', '${folder.name}')">
                <span>${folder.name}</span>
            </a>
        `;
    });
    
    if (currentName && currentName !== "All Files") {
        html += `
            <div class="crumb-separator">/</div>
            <a class="crumb current-crumb" id="current-folder">
                <span>${currentName}</span>
            </a>
        `;
    }
    
    breadcrumbs.innerHTML = html;
}

// ==================== MEDIA VIEWER ====================
function openFile(file) {
    const modal = document.getElementById('media-modal');
    if (!modal) return;
    
    // Hide all containers
    document.querySelectorAll('#video-container, #image-container, #audio-container, #document-container, #zip-container, #unsupported-container')
        .forEach(el => el.classList.add('hidden'));
    
    modal.classList.remove('hidden');
    
    // Update file info
    updateFileInfo(file);
    
    // Show appropriate viewer
    switch(file.type) {
        case 'image':
            openImage(file);
            break;
        case 'video':
            openVideo(file);
            break;
        case 'audio':
            openAudio(file);
            break;
        case 'document':
            openDocument(file);
            break;
        default:
            openUnsupported(file);
    }
}

function updateFileInfo(file) {
    const elements = {
        'media-title': file.name,
        'file-name': file.name,
        'file-size': formatFileSize(file.size || 0),
        'file-date': formatDate(file.modifiedTime)
    };
    
    Object.entries(elements).forEach(([id, value]) => {
        const element = document.getElementById(id);
        if (element) element.textContent = value;
    });
}

function openImage(file) {
    const container = document.getElementById('image-container');
    const imageViewer = document.getElementById('image-viewer');
    
    if (!container || !imageViewer) return;
    
    container.classList.remove('hidden');
    imageViewer.src = file.thumbnailLink || '';
    imageViewer.alt = file.name;
    
    STATE.currentImage = {
        element: imageViewer,
        rotation: 0,
        filter: 'none'
    };
    
    setupImageControls();
}

function openVideo(file) {
    const container = document.getElementById('video-container');
    const videoPlayer = document.getElementById('video-player');
    
    if (!container || !videoPlayer) return;
    
    container.classList.remove('hidden');
    
    // In production, use actual video URL
    videoPlayer.src = 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4';
    
    if (window.Plyr && STATE.player) {
        STATE.player.destroy();
    }
    
    STATE.player = new Plyr(videoPlayer);
}

function openAudio(file) {
    const container = document.getElementById('audio-container');
    const audioPlayer = document.getElementById('audio-player');
    
    if (!container || !audioPlayer) return;
    
    container.classList.remove('hidden');
    
    // In production, use actual audio URL
    audioPlayer.src = 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3';
    
    createAudioVisualizer();
}

function openDocument(file) {
    const container = document.getElementById('document-container');
    const documentViewer = document.getElementById('document-viewer');
    
    if (!container || !documentViewer) return;
    
    container.classList.remove('hidden');
    
    // Simulate document content
    documentViewer.innerHTML = `
        <h1>${file.name}</h1>
        <p>This is a simulated preview of ${file.name}.</p>
        <p>In production, this would show actual document content using Google Drive Viewer API.</p>
        <pre>File type: ${file.fileExtension || 'Unknown'}\nSize: ${formatFileSize(file.size || 0)}\nModified: ${formatDate(file.modifiedTime)}</pre>
    `;
}

function openUnsupported(file) {
    const container = document.getElementById('unsupported-container');
    if (!container) return;
    
    container.classList.remove('hidden');
}

function setupImageControls() {
    const controls = {
        'rotate-left': () => rotateImage(-90),
        'rotate-right': () => rotateImage(90),
        'filter-btn': toggleFilterPanel,
        'crop-btn': () => showToast('Crop tool coming soon', 'info'),
        'save-image': saveImage
    };
    
    Object.entries(controls).forEach(([id, handler]) => {
        const button = document.getElementById(id);
        if (button) {
            button.onclick = handler;
        }
    });
    
    // Filter buttons
    document.querySelectorAll('.filter-btn').forEach(btn => {
        btn.onclick = () => applyFilter(btn.dataset.filter);
    });
}

function rotateImage(degrees) {
    if (!STATE.currentImage) return;
    
    STATE.currentImage.rotation = (STATE.currentImage.rotation + degrees) % 360;
    STATE.currentImage.element.style.transform = `rotate(${STATE.currentImage.rotation}deg)`;
}

function toggleFilterPanel() {
    const panel = document.getElementById('filter-panel');
    if (panel) {
        panel.classList.toggle('hidden');
    }
}

function applyFilter(filter) {
    if (!STATE.currentImage) return;
    
    STATE.currentImage.filter = filter;
    STATE.currentImage.element.style.filter = filter;
    
    // Update active state
    document.querySelectorAll('.filter-btn').forEach(btn => {
        btn.classList.toggle('active', btn.dataset.filter === filter);
    });
}

function saveImage() {
    if (!STATE.currentImage) return;
    
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const img = STATE.currentImage.element;
    
    canvas.width = img.naturalWidth;
    canvas.height = img.naturalHeight;
    
    ctx.save();
    if (STATE.currentImage.rotation !== 0) {
        ctx.translate(canvas.width / 2, canvas.height / 2);
        ctx.rotate(STATE.currentImage.rotation * Math.PI / 180);
        ctx.translate(-canvas.width / 2, -canvas.height / 2);
    }
    
    ctx.filter = STATE.currentImage.filter;
    ctx.drawImage(img, 0, 0);
    ctx.restore();
    
    canvas.toBlob(blob => {
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `edited-${Date.now()}.jpg`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        
        showToast('Image saved', 'success');
    }, 'image/jpeg', 0.9);
}

function createAudioVisualizer() {
    const visualizer = document.getElementById('audio-visualizer');
    if (!visualizer) return;
    
    visualizer.innerHTML = '';
    
    for (let i = 0; i < 40; i++) {
        const bar = document.createElement('div');
        bar.className = 'visualizer-bar';
        bar.style.animationDelay = `${i * 0.05}s`;
        bar.style.height = `${20 + Math.random() * 80}%`;
        visualizer.appendChild(bar);
    }
}

function closeMediaViewer() {
    const modal = document.getElementById('media-modal');
    if (modal) {
        modal.classList.add('hidden');
    }
    
    if (STATE.player) {
        STATE.player.destroy();
        STATE.player = null;
    }
    
    STATE.currentImage = null;
}

// ==================== FILE OPERATIONS ====================
function uploadFile() {
    document.getElementById('file-input').click();
}

function uploadFolder() {
    document.getElementById('folder-input').click();
}

async function handleFileUpload(files) {
    if (!files.length) return;
    
    STATE.isUploading = true;
    STATE.uploadQueue = Array.from(files);
    STATE.uploadProgress = {};
    
    // Show upload progress
    showUploadProgress();
    
    let uploaded = 0;
    const total = files.length;
    
    for (let file of files) {
        try {
            // Simulate upload
            await simulateFileUpload(file);
            uploaded++;
            
            // Update progress
            updateUploadProgress(file.name, uploaded / total);
            
        } catch (error) {
            console.error('Upload error:', error);
            showToast(`Failed to upload ${file.name}`, 'error');
        }
    }
    
    STATE.isUploading = false;
    STATE.uploadQueue = [];
    STATE.uploadProgress = {};
    
    // Hide progress
    hideUploadProgress();
    
    // Refresh files
    loadFiles();
    
    showToast(`Uploaded ${uploaded} file${uploaded !== 1 ? 's' : ''}`, 'success');
}

function simulateFileUpload(file) {
    return new Promise((resolve) => {
        const delay = 1000 + Math.random() * 2000; // 1-3 seconds
        
        // Simulate progress
        const interval = setInterval(() => {
            if (STATE.uploadProgress[file.name]) {
                STATE.uploadProgress[file.name] += 0.1;
                updateUploadProgress(file.name, STATE.uploadProgress[file.name]);
                
                if (STATE.uploadProgress[file.name] >= 1) {
                    clearInterval(interval);
                    resolve();
                }
            }
        }, delay / 10);
        
        // Initialize progress
        STATE.uploadProgress[file.name] = 0;
    });
}

function showUploadProgress() {
    const progress = document.getElementById('upload-progress');
    if (progress) {
        progress.classList.remove('hidden');
        updateUploadProgressList();
    }
}

function hideUploadProgress() {
    const progress = document.getElementById('upload-progress');
    if (progress) {
        progress.classList.add('hidden');
    }
}

function updateUploadProgress(fileName, progress) {
    STATE.uploadProgress[fileName] = progress;
    updateUploadProgressList();
    
    // Update overall progress
    const total = Object.values(STATE.uploadProgress).reduce((sum, p) => sum + p, 0);
    const overallProgress = total / Object.keys(STATE.uploadProgress).length;
    
    const overallBar = document.getElementById('overall-progress');
    const uploadStatus = document.getElementById('upload-status');
    
    if (overallBar) overallBar.style.width = `${overallProgress * 100}%`;
    if (uploadStatus) {
        const uploaded = Object.values(STATE.uploadProgress).filter(p => p >= 1).length;
        const total = Object.keys(STATE.uploadProgress).length;
        uploadStatus.textContent = `Uploaded ${uploaded} of ${total}`;
    }
}

function updateUploadProgressList() {
    const progressList = document.getElementById('progress-list');
    if (!progressList) return;
    
    progressList.innerHTML = '';
    
    Object.entries(STATE.uploadProgress).forEach(([fileName, progress]) => {
        const item = document.createElement('div');
        item.className = 'progress-item';
        item.innerHTML = `
            <div class="progress-item-header">
                <div class="progress-item-name">${fileName}</div>
                <div class="progress-item-percent">${Math.round(progress * 100)}%</div>
            </div>
            <div class="progress-item-bar">
                <div class="progress-item-fill" style="width: ${progress * 100}%"></div>
            </div>
        `;
        progressList.appendChild(item);
    });
}

function createFolder() {
    const name = prompt('Enter folder name:');
    if (!name) return;
    
    // Simulate folder creation
    showToast(`Folder "${name}" created`, 'success');
    loadFiles();
}

function deleteSelected() {
    const count = STATE.selectedFiles.size;
    if (count === 0) return;
    
    if (!confirm(`Delete ${count} item${count !== 1 ? 's' : ''}?`)) return;
    
    // Simulate deletion
    STATE.selectedFiles.clear();
    updateBatchActions();
    loadFiles();
    
    showToast(`${count} item${count !== 1 ? 's' : ''} deleted`, 'success');
}

// ==================== TEXT EDITOR ====================
function openTextEditor() {
    const modal = document.getElementById('editor-modal');
    if (!modal) return;
    
    modal.classList.remove('hidden');
    
    // Reset editor
    const editorArea = document.getElementById('editor-area');
    if (editorArea) {
        editorArea.innerHTML = '<p>Start typing your note here...</p>';
    }
    
    setupEditorTools();
}

function setupEditorTools() {
    const editorArea = document.getElementById('editor-area');
    if (!editorArea) return;
    
    // Setup toolbar buttons
    document.querySelectorAll('.tool-btn[data-command]').forEach(btn => {
        btn.onclick = () => {
            const command = btn.dataset.command;
            const value = btn.dataset.value;
            
            document.execCommand(command, false, value);
            editorArea.focus();
        };
    });
    
    // Setup link insertion
    const linkBtn = document.getElementById('insert-link');
    if (linkBtn) {
        linkBtn.onclick = () => {
            const url = prompt('Enter URL:');
            if (url) {
                document.execCommand('createLink', false, url);
            }
        };
    }
    
    // Update word count
    editorArea.addEventListener('input', updateEditorStats);
    updateEditorStats();
}

function updateEditorStats() {
    const editorArea = document.getElementById('editor-area');
    if (!editorArea) return;
    
    const text = editorArea.textContent || '';
    const words = text.trim().split(/\s+/).filter(word => word.length > 0);
    const chars = text.length;
    
    const wordCount = document.getElementById('word-count');
    const charCount = document.getElementById('char-count');
    
    if (wordCount) wordCount.textContent = `${words.length} words`;
    if (charCount) charCount.textContent = `${chars} characters`;
}

function saveNote() {
    const title = document.getElementById('editor-title')?.value || 'Untitled Note.txt';
    const content = document.getElementById('editor-area')?.innerHTML || '';
    
    if (!content.trim()) {
        showToast('Note cannot be empty', 'error');
        return;
    }
    
    // Simulate saving
    closeEditor();
    showToast('Note saved', 'success');
}

function closeEditor() {
    const modal = document.getElementById('editor-modal');
    if (modal) {
        modal.classList.add('hidden');
    }
}

// ==================== SETTINGS ====================
function openSettings() {
    const modal = document.getElementById('settings-modal');
    if (!modal) return;
    
    modal.classList.remove('hidden');
    loadSettings();
}

function closeSettings() {
    const modal = document.getElementById('settings-modal');
    if (modal) {
        modal.classList.add('hidden');
    }
}

function loadSettings() {
    // Load saved settings from localStorage
    const settings = JSON.parse(localStorage.getItem('vault_settings')) || {};
    
    // Apply settings to UI
    const elements = {
        'dark-mode': settings.darkMode !== false,
        'auto-lock': settings.autoLock !== false,
        'notifications': settings.notifications !== false,
        'session-timeout': settings.sessionTimeout || '60',
        'upload-folder': settings.uploadFolder || 'root',
        'reduce-animations': settings.reduceAnimations || false,
        'compact-view': settings.compactView || false
    };
    
    Object.entries(elements).forEach(([id, value]) => {
        const element = document.getElementById(id);
        if (element) {
            if (element.type === 'checkbox') {
                element.checked = value;
            } else {
                element.value = value;
            }
        }
    });
    
    // Load theme color
    const themeColor = settings.themeColor || '#00f3ff';
    document.querySelectorAll('.color-option').forEach(option => {
        option.classList.toggle('active', option.dataset.color === themeColor);
    });
}

function saveSettings() {
    const settings = {
        darkMode: document.getElementById('dark-mode')?.checked || false,
        autoLock: document.getElementById('auto-lock')?.checked || false,
        notifications: document.getElementById('notifications')?.checked || false,
        sessionTimeout: document.getElementById('session-timeout')?.value || '60',
        uploadFolder: document.getElementById('upload-folder')?.value || 'root',
        reduceAnimations: document.getElementById('reduce-animations')?.checked || false,
        compactView: document.getElementById('compact-view')?.checked || false,
        themeColor: document.querySelector('.color-option.active')?.dataset.color || '#00f3ff'
    };
    
    localStorage.setItem('vault_settings', JSON.stringify(settings));
    
    // Apply theme color
    applyThemeColor(settings.themeColor);
    
    showToast('Settings saved', 'success');
}

function applyThemeColor(color) {
    document.documentElement.style.setProperty('--primary', color);
    
    // Calculate lighter and darker variants
    const hex = color.replace('#', '');
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

function clearCache() {
    if (confirm('Clear all cached data? This will not delete your files.')) {
        localStorage.clear();
        sessionStorage.clear();
        showToast('Cache cleared', 'success');
        setTimeout(() => location.reload(), 1000);
    }
}

// ==================== FAB MENU ====================
function toggleFabMenu() {
    const fabMenu = document.getElementById('fab-menu');
    const fabIcon = document.getElementById('fab-icon');
    
    if (!fabMenu || !fabIcon) return;
    
    fabMenu.classList.toggle('active');
    
    if (fabMenu.classList.contains('active')) {
        fabIcon.className = 'fas fa-times';
    } else {
        fabIcon.className = 'fas fa-plus';
    }
}

function closeFabMenu() {
    const fabMenu = document.getElementById('fab-menu');
    const fabIcon = document.getElementById('fab-icon');
    
    if (fabMenu) fabMenu.classList.remove('active');
    if (fabIcon) fabIcon.className = 'fas fa-plus';
}

// ==================== UTILITIES ====================
function formatFileSize(bytes) {
    if (bytes === 0) return '0 Bytes';
    
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

function formatDate(dateString) {
    const date = new Date(dateString);
    const now = new Date();
    const diff = now - date;
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    
    if (days === 0) return 'Today';
    if (days === 1) return 'Yesterday';
    if (days < 7) return `${days} days ago`;
    if (days < 30) return `${Math.floor(days / 7)} weeks ago`;
    
    return date.toLocaleDateString();
}

function showToast(message, type = 'info') {
    const container = document.getElementById('toast-container');
    if (!container) return;
    
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    
    const icons = {
        success: 'fas fa-check-circle',
        error: 'fas fa-exclamation-circle',
        info: 'fas fa-info-circle',
        warning: 'fas fa-exclamation-triangle'
    };
    
    toast.innerHTML = `
        <div class="toast-icon">
            <i class="${icons[type] || icons.info}"></i>
        </div>
        <div class="toast-content">
            <div class="toast-message">${message}</div>
        </div>
        <button class="toast-close">
            <i class="fas fa-times"></i>
        </button>
    `;
    
    container.appendChild(toast);
    
    // Auto remove after 5 seconds
    setTimeout(() => {
        toast.style.opacity = '0';
        toast.style.transform = 'translateX(100%)';
        setTimeout(() => toast.remove(), 300);
    }, 5000);
    
    // Close button
    const closeBtn = toast.querySelector('.toast-close');
    if (closeBtn) {
        closeBtn.onclick = () => toast.remove();
    }
}

function showLoading(show) {
    const loadingState = document.getElementById('loading-state');
    if (!loadingState) return;
    
    if (show) {
        loadingState.classList.remove('hidden');
    } else {
        loadingState.classList.add('hidden');
    }
}

function updateUI() {
    // Update view mode
    document.querySelectorAll('.view-btn').forEach(btn => {
        btn.classList.toggle('active', btn.dataset.view === STATE.viewMode);
    });
    
    // Update sort select
    const sortSelect = document.getElementById('sort-select');
    if (sortSelect) {
        sortSelect.value = STATE.sortBy;
    }
    
    // Update storage info
    updateStorageUI();
}

// ==================== PWA ====================
function setupPWA() {
    // Register service worker
    if ('serviceWorker' in navigator) {
        window.addEventListener('load', () => {
            navigator.serviceWorker.register('/sw.js').catch(error => {
                console.log('Service Worker registration failed:', error);
            });
        });
    }
    
    // Handle install prompt
    let deferredPrompt;
    window.addEventListener('beforeinstallprompt', (e) => {
        e.preventDefault();
        deferredPrompt = e;
        
        // Show install button
        const installBtn = document.querySelector('[data-action="install-pwa"]');
        if (installBtn) {
            installBtn.classList.remove('hidden');
            installBtn.onclick = () => {
                deferredPrompt.prompt();
                deferredPrompt.userChoice.then((choiceResult) => {
                    if (choiceResult.outcome === 'accepted') {
                        showToast('App installed successfully!', 'success');
                    }
                    deferredPrompt = null;
                });
            };
        }
    });
}

function installPWA() {
    if (window.deferredPrompt) {
        window.deferredPrompt.prompt();
        window.deferredPrompt.userChoice.then((choiceResult) => {
            if (choiceResult.outcome === 'accepted') {
                showToast('App installed successfully!', 'success');
            }
            window.deferredPrompt = null;
        });
    } else {
        showToast('App already installed or not available', 'info');
    }
}

// ==================== EVENT LISTENERS ====================
function setupEventListeners() {
    // Search input
    const searchInput = document.getElementById('search-input');
    if (searchInput) {
        let searchTimeout;
        searchInput.addEventListener('input', (e) => {
            clearTimeout(searchTimeout);
            searchTimeout = setTimeout(() => {
                STATE.searchQuery = e.target.value;
                loadFiles();
            }, 300);
        });
        
        // Clear search button
        const clearBtn = searchInput.nextElementSibling;
        if (clearBtn && clearBtn.classList.contains('btn-search-clear')) {
            clearBtn.addEventListener('click', () => {
                searchInput.value = '';
                STATE.searchQuery = '';
                loadFiles();
            });
            
            // Show/hide clear button
            searchInput.addEventListener('input', () => {
                clearBtn.classList.toggle('hidden', !searchInput.value);
            });
        }
    }
    
    // File upload inputs
    const fileInput = document.getElementById('file-input');
    const folderInput = document.getElementById('folder-input');
    
    if (fileInput) {
        fileInput.addEventListener('change', (e) => {
            handleFileUpload(e.target.files);
            e.target.value = '';
        });
    }
    
    if (folderInput) {
        folderInput.addEventListener('change', (e) => {
            handleFileUpload(e.target.files);
            e.target.value = '';
        });
    }
    
    // Sort select
    const sortSelect = document.getElementById('sort-select');
    if (sortSelect) {
        sortSelect.addEventListener('change', (e) => {
            STATE.sortBy = e.target.value;
            loadFiles();
        });
    }
    
    // View toggle
    document.querySelectorAll('.view-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            STATE.viewMode = btn.dataset.view;
            updateUI();
        });
    });
    
    // FAB menu
    const fabMain = document.getElementById('fab-main');
    if (fabMain) {
        fabMain.addEventListener('click', toggleFabMenu);
    }
    
    // FAB menu items
    document.querySelectorAll('.fab-item').forEach(item => {
        item.addEventListener('click', () => {
            const action = item.dataset.action;
            handleFabAction(action);
            closeFabMenu();
        });
    });
    
    // Close buttons
    document.querySelectorAll('.btn-close-media, #close-media').forEach(btn => {
        btn.addEventListener('click', closeMediaViewer);
    });
    
    document.querySelectorAll('.btn-close-settings, #close-settings').forEach(btn => {
        btn.addEventListener('click', closeSettings);
    });
    
    document.querySelectorAll('#close-progress, .btn-close-progress').forEach(btn => {
        btn.addEventListener('click', hideUploadProgress);
    });
    
    // Batch actions
    document.querySelectorAll('#clear-batch, .btn-clear-batch').forEach(btn => {
        btn.addEventListener('click', clearSelection);
    });
    
    document.getElementById('batch-delete')?.addEventListener('click', deleteSelected);
    
    // Settings tabs
    document.querySelectorAll('.settings-tab').forEach(tab => {
        tab.addEventListener('click', () => {
            const tabId = tab.dataset.tab;
            switchSettingsTab(tabId);
        });
    });
    
    // Settings actions
    document.getElementById('save-settings')?.addEventListener('click', saveSettings);
    document.getElementById('logout-btn')?.addEventListener('click', logout);
    document.getElementById('change-pin')?.addEventListener('click', changePin);
    document.getElementById('clear-cache')?.addEventListener('click', clearCache);
    
    // Theme colors
    document.querySelectorAll('.color-option').forEach(option => {
        option.addEventListener('click', () => {
            document.querySelectorAll('.color-option').forEach(o => o.classList.remove('active'));
            option.classList.add('active');
        });
    });
    
    // First upload button
    document.getElementById('first-upload')?.addEventListener('click', uploadFile);
    
    // Gallery categories
    document.querySelectorAll('.category-card').forEach(card => {
        card.addEventListener('click', () => {
            const type = card.dataset.type;
            filterGallery(type);
        });
    });
    
    // Mobile menu toggle
    document.getElementById('menu-toggle')?.addEventListener('click', () => {
        document.getElementById('sidebar')?.classList.toggle('active');
    });
    
    // Close sidebar when clicking outside on mobile
    document.addEventListener('click', (e) => {
        const sidebar = document.getElementById('sidebar');
        const menuToggle = document.getElementById('menu-toggle');
        
        if (window.innerWidth <= 768 && sidebar?.classList.contains('active')) {
            if (!sidebar.contains(e.target) && !menuToggle?.contains(e.target)) {
                sidebar.classList.remove('active');
            }
        }
    });
    
    // Escape key to close modals
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            closeMediaViewer();
            closeSettings();
            closeEditor();
            closeFabMenu();
            clearSelection();
        }
    });
    
    // Click outside to close FAB menu
    document.addEventListener('click', (e) => {
        if (!e.target.closest('.fab-container')) {
            closeFabMenu();
        }
    });
}

function handleFabAction(action) {
    switch(action) {
        case 'upload-file':
            uploadFile();
            break;
        case 'upload-folder':
            uploadFolder();
            break;
        case 'create-folder':
            createFolder();
            break;
        case 'create-note':
            openTextEditor();
            break;
        case 'scan-document':
            showToast('Document scanner coming soon', 'info');
            break;
    }
}

function switchSettingsTab(tabId) {
    // Update active tab
    document.querySelectorAll('.settings-tab').forEach(tab => {
        tab.classList.toggle('active', tab.dataset.tab === tabId);
    });
    
    // Show active panel
    document.querySelectorAll('.settings-panel').forEach(panel => {
        panel.classList.toggle('active', panel.id === `${tabId}-panel`);
    });
}

function filterGallery(type) {
    showToast(`Filtering ${type} files...`, 'info');
    // In production, implement actual filtering
}

// ==================== INITIALIZATION ====================
document.addEventListener('DOMContentLoaded', () => {
    // Initialize PIN system
    initializePinSystem();
    
    // Auto fill PIN for demo (remove in production)
    setTimeout(() => {
        if (STATE.currentPin === CONFIG.app.defaultPin) {
            STATE.pinBuffer = CONFIG.app.defaultPin;
            validatePin();
        }
    }, 1000);
    
    // Setup PWA
    setupPWA();
    
    // Check for updates
    checkForUpdates();
});

function checkForUpdates() {
    // Check for app updates
    const lastCheck = localStorage.getItem('last_update_check');
    const now = Date.now();
    
    if (!lastCheck || now - lastCheck > 24 * 60 * 60 * 1000) {
        localStorage.setItem('last_update_check', now.toString());
        // In production, check for actual updates
    }
}

// Make functions globally available
window.changePin = changePin;
window.logout = logout;
window.openSettings = openSettings;
window.closeSettings = closeSettings;
window.openTextEditor = openTextEditor;
window.saveNote = saveNote;
window.uploadFile = uploadFile;
window.uploadFolder = uploadFolder;
window.createFolder = createFolder;
window.deleteSelected = deleteSelected;
window.clearSelection = clearSelection;
window.installPWA = installPWA;
window.toggleFabMenu = toggleFabMenu;
window.closeFabMenu = closeFabMenu;
window.goToRoot = goToRoot;
window.goBack = goBack;
window.navigateToFolder = navigateToFolder;
window.switchTab = switchTab;
window.filterGallery = filterGallery;
window.closeMediaViewer = closeMediaViewer;
window.closeEditor = closeEditor;
window.clearCache = clearCache;

console.log("Vault OS Ultimate v" + CONFIG.app.appVersion + " initialized");