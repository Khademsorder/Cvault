'use strict';

// ============================================================================
// GLOBAL CONFIG (Hard-coded, NEVER editable from UI)
// ============================================================================

const CONFIG = {
  google: {
    clientId: "318681315152-65e9kofptt4c3bk3kmlj9gmksnasu347.apps.googleusercontent.com",
    apiKey: "AIzaSyB3Iy1MIbfmJ7h5rv9NlsT23ysedCwUZt4",
    scopes: [
      "https://www.googleapis.com/auth/drive",
      "https://www.googleapis.com/auth/drive.metadata",
      "https://www.googleapis.com/auth/userinfo.profile"
    ]
  },

  vault: {
    rootFolderId: "1zIyinAqjQv96QBSuanFS2F0USaG66GPn"
  },

  proxy: {
    mediaRead: "https://script.google.com/macros/s/AKfycby2hqAq0JePMbnjEbwwcPBFjS14lvS3pM2Z1PPgY4OraTcpvTmZFPKQr9CQ4vba4Xk7/exec",
    fullAccess: "https://script.google.com/macros/s/AKfycbxQF58gDxHBATrBvliuMc_SdP7PEiuN6fiHdzVKG7_K5FIrj3V2m8imWgPXTjmVqfnN/exec"
  },

  session: {
    lifetimeMs: 86400000
  },

  settings: {
    mediaViewer: {
      image: true,
      video: true,
      audio: true,
      pdf: true,
      markdown: true,
      code: true,
      zipPreview: false
    }
  },

  performance: {
    gpuAcceleration: true,
    virtualScroll: true,
    lazyDecode: true,
    idleCallback: true,
    rafBatching: true
  },

  limits: {
    apiPerMinute: 300,
    uploadChunkSize: 8388608,
    retryLimit: 3
  }
};

// ============================================================================
// GLOBAL STATE MODEL (SINGLE SOURCE OF TRUTH)
// ============================================================================

const STATE = {
  auth: {
    accessToken: null,
    tokenExpire: null,
    userProfile: {
      email: null,
      name: null
    }
  },

  ui: {
    theme: "light",
    currentScreen: "lock",
    isLocked: true,
    isLoading: false,
    toastQueue: []
  },

  drive: {
    mode: "user",
    currentFolderId: null,
    breadcrumb: [],
    fileCache: [],
    selectedFiles: [],
    sortMode: "name",
    searchQuery: ""
  },

  jobs: {
    uploadQueue: [],
    copyQueue: [],
    moveQueue: [],
    retryQueue: []
  },

  system: {
    onlineStatus: true,
    lastSnapshot: null,
    apiCallCount: 0,
    quotaWarning: false
  },

  admin: {
    isAdmin: false,
    readOnly: false,
    activityLog: []
  }
};

// ============================================================================
// PIN SYSTEM
// ============================================================================

const PIN_STATE = {
  attempts: 0,
  lastAttempt: 0,
  cooldown: false,
  hash: null
};

function initPinSystem() {
  PIN_STATE.hash = localStorage.getItem('dream_pin_hash');
  if (!PIN_STATE.hash) {
    showToast('Set PIN to 000000 for first login', 'info');
    PIN_STATE.hash = btoa('000000');
    localStorage.setItem('dream_pin_hash', PIN_STATE.hash);
  }
}

function verifyPin(pin) {
  if (PIN_STATE.cooldown) {
    const now = Date.now();
    if (now - PIN_STATE.lastAttempt < 30000) {
      return { valid: false, cooldown: true };
    }
    PIN_STATE.cooldown = false;
  }

  const hash = btoa(pin);
  const isValid = hash === PIN_STATE.hash;

  if (!isValid) {
    PIN_STATE.attempts++;
    PIN_STATE.lastAttempt = Date.now();
    
    if (PIN_STATE.attempts >= 5) {
      PIN_STATE.cooldown = true;
      showToast('Too many attempts. Locked for 30 seconds.', 'error');
      return { valid: false, cooldown: true };
    }
    
    showToast(`Wrong PIN. ${5 - PIN_STATE.attempts} attempts left.`, 'error');
    return { valid: false, cooldown: false };
  }

  PIN_STATE.attempts = 0;
  return { valid: true, cooldown: false };
}

function updatePinUI() {
  const pinInput = document.getElementById('pinInput');
  const pinDots = document.querySelectorAll('.pin-dot');
  const errorEl = document.getElementById('pinError');
  const cooldownEl = document.getElementById('pinCooldown');
  
  const value = pinInput.value;
  
  pinDots.forEach((dot, index) => {
    dot.classList.toggle('active', index < value.length);
  });
  
  if (PIN_STATE.cooldown) {
    const remaining = Math.ceil((30000 - (Date.now() - PIN_STATE.lastAttempt)) / 1000);
    cooldownEl.textContent = `Try again in ${remaining}s`;
    errorEl.textContent = '';
  } else {
    cooldownEl.textContent = '';
  }
}

// ============================================================================
// GOOGLE OAUTH
// ============================================================================

let tokenClient;

function initGoogleOAuth() {
  tokenClient = google.accounts.oauth2.initTokenClient({
    client_id: CONFIG.google.clientId,
    scope: CONFIG.google.scopes.join(' '),
    callback: (response) => {
      if (response.error) {
        logError('OAuth Error', response);
        showToast('Authentication failed', 'error');
        return;
      }
      
      STATE.auth.accessToken = response.access_token;
      STATE.auth.tokenExpire = Date.now() + (response.expires_in * 1000);
      
      logActivity('User authenticated via OAuth');
      fetchUserProfile();
    },
    error_callback: (error) => {
      logError('OAuth Error', error);
      showToast('Authentication error', 'error');
    }
  });
}

function requestGoogleAuth() {
  if (!tokenClient) {
    showToast('OAuth not initialized', 'error');
    return;
  }
  
  tokenClient.requestAccessToken({ prompt: 'consent' });
}

function fetchUserProfile() {
  if (!STATE.auth.accessToken) return;
  
  STATE.ui.isLoading = true;
  renderUI();
  
  fetch('https://www.googleapis.com/oauth2/v1/userinfo', {
    headers: {
      'Authorization': `Bearer ${STATE.auth.accessToken}`
    }
  })
  .then(response => response.json())
  .then(data => {
    STATE.auth.userProfile = {
      email: data.email,
      name: data.name || data.email
    };
    
    detectAdmin(data.email);
    initDriveEngine();
    saveSessionSnapshot();
    
    STATE.ui.currentScreen = 'main';
    STATE.ui.isLocked = false;
    STATE.ui.isLoading = false;
    
    renderUI();
    showToast(`Welcome ${data.name || data.email}`, 'success');
    
    logActivity(`User logged in: ${data.email}`);
  })
  .catch(error => {
    logError('Profile Fetch Error', error);
    showToast('Failed to load profile', 'error');
    STATE.ui.isLoading = false;
    renderUI();
  });
}

function detectAdmin(email) {
  const adminEmails = [
    'admin@example.com'
  ];
  
  STATE.admin.isAdmin = adminEmails.includes(email);
  
  if (STATE.admin.isAdmin) {
    document.querySelectorAll('.admin-only').forEach(el => {
      el.classList.remove('hidden');
    });
    logActivity('Admin privileges granted');
  }
}

// ============================================================================
// DRIVE ENGINE
// ============================================================================

function initDriveEngine() {
  if (!STATE.auth.accessToken) return;
  
  STATE.drive.currentFolderId = STATE.drive.mode === 'vault' 
    ? CONFIG.vault.rootFolderId 
    : 'root';
  
  loadFolderContents(STATE.drive.currentFolderId);
}

async function loadFolderContents(folderId) {
  if (!STATE.auth.accessToken) return;
  
  STATE.ui.isLoading = true;
  renderUI();
  
  const query = `'${folderId}' in parents and trashed = false`;
  const url = `https://www.googleapis.com/drive/v3/files?q=${encodeURIComponent(query)}&fields=files(id,name,mimeType,size,modifiedTime,thumbnailLink),nextPageToken`;
  
  try {
    const response = await fetch(url, {
      headers: {
        'Authorization': `Bearer ${STATE.auth.accessToken}`,
        'Content-Type': 'application/json'
      }
    });
    
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    
    const data = await response.json();
    STATE.drive.fileCache = data.files || [];
    STATE.system.apiCallCount++;
    
    updateBreadcrumb(folderId);
    renderFileGrid();
    
    logActivity(`Loaded folder: ${folderId}`);
  } catch (error) {
    logError('Drive Load Error', error);
    showToast('Failed to load folder', 'error');
  } finally {
    STATE.ui.isLoading = false;
    renderUI();
  }
}

function updateBreadcrumb(folderId) {
  STATE.drive.breadcrumb = [{ id: folderId, name: folderId === 'root' ? 'My Drive' : 'Current' }];
  renderBreadcrumb();
}

function renderBreadcrumb() {
  const container = document.getElementById('breadcrumb');
  if (!container) return;
  
  container.innerHTML = STATE.drive.breadcrumb
    .map(item => `<span class="crumb">${item.name}</span>`)
    .join('<span class="separator">›</span>');
}

// ============================================================================
// FILE RENDERING
// ============================================================================

function renderFileGrid() {
  const container = document.getElementById('fileGrid');
  const emptyState = document.getElementById('emptyState');
  
  if (!container) return;
  
  let files = [...STATE.drive.fileCache];
  
  // Apply search
  if (STATE.drive.searchQuery) {
    const query = STATE.drive.searchQuery.toLowerCase();
    files = files.filter(file => 
      file.name.toLowerCase().includes(query)
    );
  }
  
  // Apply sort
  files.sort((a, b) => {
    switch (STATE.drive.sortMode) {
      case 'name-desc':
        return b.name.localeCompare(a.name);
      case 'modified':
        return new Date(b.modifiedTime) - new Date(a.modifiedTime);
      case 'size':
        return (b.size || 0) - (a.size || 0);
      case 'type':
        return a.mimeType.localeCompare(b.mimeType);
      default: // name
        return a.name.localeCompare(b.name);
    }
  });
  
  if (files.length === 0) {
    container.innerHTML = '';
    emptyState.classList.remove('hidden');
    return;
  }
  
  emptyState.classList.add('hidden');
  container.innerHTML = files.map(file => createFileElement(file)).join('');
  
  attachFileEvents();
}

function createFileElement(file) {
  const isSelected = STATE.drive.selectedFiles.some(f => f.id === file.id);
  const icon = getFileIcon(file.mimeType, file.name);
  const size = file.size ? formatFileSize(file.size) : '—';
  const date = file.modifiedTime ? new Date(file.modifiedTime).toLocaleDateString() : '';
  
  return `
    <div class="file-item ${isSelected ? 'selected' : ''}" data-id="${file.id}">
      <div class="file-checkbox ${isSelected ? 'checked' : ''}" data-id="${file.id}"></div>
      <div class="file-icon">${icon}</div>
      <div class="file-name" title="${file.name}">${file.name}</div>
      <div class="file-meta">
        <div>${size}</div>
        <div>${date}</div>
      </div>
    </div>
  `;
}

function getFileIcon(mimeType, fileName) {
  if (mimeType.includes('folder')) {
    return `<svg viewBox="0 0 24 24" fill="currentColor">
      <path d="M10 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V8c0-1.1-.9-2-2-2h-8l-2-2z"/>
    </svg>`;
  }
  
  if (mimeType.includes('image')) {
    return `<svg viewBox="0 0 24 24" fill="currentColor">
      <path d="M21 19V5c0-1.1-.9-2-2-2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2zM8.5 13.5l2.5 3.01L14.5 12l4.5 6H5l3.5-4.5z"/>
    </svg>`;
  }
  
  if (mimeType.includes('video')) {
    return `<svg viewBox="0 0 24 24" fill="currentColor">
      <path d="M4 6.47L5.76 10H20v8H4V6.47M22 4h-4l2 4h-3l-2-4h-2l2 4h-3l-2-4H8l2 4H7L5 4H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V4z"/>
    </svg>`;
  }
  
  if (mimeType.includes('audio')) {
    return `<svg viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 3v10.55c-.59-.34-1.27-.55-2-.55-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4V7h4V3h-6z"/>
    </svg>`;
  }
  
  if (mimeType.includes('pdf')) {
    return `<svg viewBox="0 0 24 24" fill="currentColor">
      <path d="M20 2H8c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm-8.5 7.5c0 .83-.67 1.5-1.5 1.5H9v2H7.5V7H10c.83 0 1.5.67 1.5 1.5v1zm5 2c0 .83-.67 1.5-1.5 1.5h-2.5V7H15c.83 0 1.5.67 1.5 1.5v3zm4-3H19v1h1.5V11H19v2h-1.5V7h3v1.5zM9 9.5h1v-1H9v1zM4 6H2v14c0 1.1.9 2 2 2h14v-2H4V6zm10 5.5h1v-3h-1v3z"/>
    </svg>`;
  }
  
  return `<svg viewBox="0 0 24 24" fill="currentColor">
    <path d="M6 2c-1.1 0-1.99.9-1.99 2L4 20c0 1.1.89 2 1.99 2H18c1.1 0 2-.9 2-2V8l-6-6H6zm7 7V3.5L18.5 9H13z"/>
  </svg>`;
}

function formatFileSize(bytes) {
  if (!bytes) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
}

// ============================================================================
// SMART OPEN
// ============================================================================

function openFile(file) {
  if (!STATE.auth.accessToken) return;
  
  if (file.mimeType.includes('folder')) {
    STATE.drive.currentFolderId = file.id;
    loadFolderContents(file.id);
    return;
  }
  
  if (CONFIG.settings.mediaViewer.image && file.mimeType.includes('image')) {
    openImageViewer(file);
  } else if (CONFIG.settings.mediaViewer.video && file.mimeType.includes('video')) {
    openVideoViewer(file);
  } else if (CONFIG.settings.mediaViewer.audio && file.mimeType.includes('audio')) {
    openAudioViewer(file);
  } else if (CONFIG.settings.mediaViewer.pdf && file.mimeType.includes('pdf')) {
    openPDFViewer(file);
  } else {
    openGooglePreview(file);
  }
}

function openImageViewer(file) {
  const viewer = document.getElementById('mediaViewer');
  const content = document.getElementById('viewerContent');
  const title = document.getElementById('viewerTitle');
  
  if (!viewer || !content) return;
  
  const url = `${CONFIG.proxy.mediaRead}?id=${file.id}&token=${STATE.auth.accessToken}`;
  
  content.innerHTML = `<img src="${url}" alt="${file.name}">`;
  title.textContent = file.name;
  
  viewer.classList.remove('hidden');
  logActivity(`Opened image: ${file.name}`);
}

function openVideoViewer(file) {
  const viewer = document.getElementById('mediaViewer');
  const content = document.getElementById('viewerContent');
  const title = document.getElementById('viewerTitle');
  
  if (!viewer || !content) return;
  
  const url = `${CONFIG.proxy.mediaRead}?id=${file.id}&token=${STATE.auth.accessToken}`;
  
  content.innerHTML = `
    <video id="plyrVideo" controls crossorigin>
      <source src="${url}" type="${file.mimeType}">
    </video>
  `;
  
  title.textContent = file.name;
  viewer.classList.remove('hidden');
  
  if (window.Plyr) {
    new Plyr('#plyrVideo');
  }
  
  logActivity(`Opened video: ${file.name}`);
}

function openGooglePreview(file) {
  const url = `https://drive.google.com/file/d/${file.id}/preview`;
  window.open(url, '_blank');
  logActivity(`Opened preview: ${file.name}`);
}

// ============================================================================
// UPLOAD ENGINE
// ============================================================================

function addToUploadQueue(files, folderId = STATE.drive.currentFolderId) {
  if (STATE.admin.readOnly) {
    showToast('Read-only mode enabled', 'warning');
    return;
  }
  
  for (const file of files) {
    STATE.jobs.uploadQueue.push({
      id: generateId(),
      file: file,
      folderId: folderId,
      status: 'pending',
      progress: 0,
      uploaded: 0,
      chunks: []
    });
  }
  
  renderUploadQueue();
  processUploadQueue();
  logActivity(`Added ${files.length} files to upload queue`);
}

function generateId() {
  return Date.now().toString(36) + Math.random().toString(36).substr(2);
}

function processUploadQueue() {
  if (!STATE.system.onlineStatus) return;
  
  const pending = STATE.jobs.uploadQueue.filter(job => job.status === 'pending');
  if (pending.length === 0) return;
  
  const job = pending[0];
  job.status = 'uploading';
  renderUploadQueue();
  
  uploadFileChunks(job);
}

async function uploadFileChunks(job) {
  const chunkSize = CONFIG.limits.uploadChunkSize;
  const totalChunks = Math.ceil(job.file.size / chunkSize);
  
  for (let i = 0; i < totalChunks; i++) {
    if (job.status !== 'uploading') break;
    
    const start = i * chunkSize;
    const end = Math.min(start + chunkSize, job.file.size);
    const chunk = job.file.slice(start, end);
    
    try {
      await uploadChunk(job, chunk, i, totalChunks);
      job.uploaded = end;
      job.progress = Math.round((end / job.file.size) * 100);
      renderUploadQueue();
    } catch (error) {
      logError('Chunk Upload Error', error);
      job.status = 'error';
      job.error = error.message;
      renderUploadQueue();
      break;
    }
  }
  
  if (job.status === 'uploading') {
    job.status = 'completed';
    showToast(`Uploaded: ${job.file.name}`, 'success');
    loadFolderContents(STATE.drive.currentFolderId);
    logActivity(`Upload completed: ${job.file.name}`);
  }
}

async function uploadChunk(job, chunk, chunkIndex, totalChunks) {
  const formData = new FormData();
  formData.append('id', job.id);
  formData.append('file', chunk);
  formData.append('name', job.file.name);
  formData.append('folderId', job.folderId);
  formData.append('chunkIndex', chunkIndex);
  formData.append('totalChunks', totalChunks);
  formData.append('mimeType', job.file.type);
  formData.append('token', STATE.auth.accessToken);
  
  const response = await fetch(CONFIG.proxy.fullAccess, {
    method: 'POST',
    body: formData
  });
  
  if (!response.ok) {
    throw new Error(`Upload failed: ${response.status}`);
  }
  
  STATE.system.apiCallCount++;
}

// ============================================================================
// UI RENDERING (FROM STATE ONLY)
// ============================================================================

function renderUI() {
  // Theme
  document.body.className = STATE.ui.theme;
  
  // Screens
  document.getElementById('pinScreen').classList.toggle('hidden', STATE.ui.currentScreen !== 'lock');
  document.getElementById('mainScreen').classList.toggle('hidden', STATE.ui.currentScreen !== 'main');
  
  // Loading
  document.getElementById('loadingOverlay').classList.toggle('hidden', !STATE.ui.isLoading);
  
  // Network
  const statusEl = document.getElementById('networkStatus');
  if (statusEl) {
    const indicator = statusEl.querySelector('.status-indicator');
    indicator.className = `status-indicator ${STATE.system.onlineStatus ? 'online' : 'offline'}`;
  }
  
  // User
  const avatar = document.getElementById('userAvatar');
  const name = document.getElementById('userName');
  const email = document.getElementById('userEmail');
  
  if (avatar && STATE.auth.userProfile.name) {
    avatar.textContent = STATE.auth.userProfile.name.charAt(0).toUpperCase();
  }
  if (name) name.textContent = STATE.auth.userProfile.name || 'User';
  if (email) email.textContent = STATE.auth.userProfile.email || 'user@example.com';
  
  // Mode
  const modeBtn = document.getElementById('modeToggle');
  if (modeBtn) {
    modeBtn.textContent = STATE.drive.mode === 'user' ? 'Switch to Vault' : 'Switch to User';
  }
  
  // Admin
  document.querySelectorAll('.admin-only').forEach(el => {
    el.classList.toggle('hidden', !STATE.admin.isAdmin);
  });
}

function renderUploadQueue() {
  const container = document.getElementById('uploadList');
  const badge = document.getElementById('uploadBadge');
  
  if (!container) return;
  
  const active = STATE.jobs.uploadQueue.filter(job => job.status !== 'completed');
  badge.textContent = active.length;
  
  container.innerHTML = active.map(job => `
    <div class="upload-item">
      <div>${job.file.name}</div>
      <div class="upload-progress">
        <div class="upload-progress-fill" style="width: ${job.progress}%"></div>
      </div>
      <div>${job.progress}%</div>
    </div>
  `).join('');
}

// ============================================================================
// EVENT HANDLERS
// ============================================================================

function attachFileEvents() {
  document.querySelectorAll('.file-item').forEach(item => {
    item.addEventListener('click', (e) => {
      if (e.target.classList.contains('file-checkbox')) {
        handleFileSelect(e.target.dataset.id);
      } else {
        const fileId = item.dataset.id;
        const file = STATE.drive.fileCache.find(f => f.id === fileId);
        if (file) openFile(file);
      }
    });
  });
  
  document.querySelectorAll('.file-checkbox').forEach(checkbox => {
    checkbox.addEventListener('click', (e) => {
      e.stopPropagation();
      handleFileSelect(e.target.dataset.id);
    });
  });
}

function handleFileSelect(fileId) {
  const index = STATE.drive.selectedFiles.findIndex(f => f.id === fileId);
  
  if (index === -1) {
    const file = STATE.drive.fileCache.find(f => f.id === fileId);
    if (file) STATE.drive.selectedFiles.push(file);
  } else {
    STATE.drive.selectedFiles.splice(index, 1);
  }
  
  renderFileGrid();
  updateSelectionUI();
}

function updateSelectionUI() {
  const actions = document.getElementById('selectionActions');
  const deselectBtn = document.getElementById('deselectAll');
  const selectBtn = document.getElementById('selectAll');
  
  if (STATE.drive.selectedFiles.length > 0) {
    actions?.classList.remove('hidden');
    deselectBtn?.classList.remove('hidden');
    selectBtn?.classList.add('hidden');
  } else {
    actions?.classList.add('hidden');
    deselectBtn?.classList.add('hidden');
    selectBtn?.classList.remove('hidden');
  }
}

// ============================================================================
// SESSION MANAGEMENT
// ============================================================================

function saveSessionSnapshot() {
  const snapshot = {
    folderId: STATE.drive.currentFolderId,
    selectedFiles: STATE.drive.selectedFiles.map(f => f.id),
    timestamp: Date.now()
  };
  
  STATE.system.lastSnapshot = snapshot;
  localStorage.setItem('dream_session', JSON.stringify(snapshot));
}

function restoreSessionSnapshot() {
  const saved = localStorage.getItem('dream_session');
  if (!saved) return;
  
  try {
    const snapshot = JSON.parse(saved);
    if (Date.now() - snapshot.timestamp > CONFIG.session.lifetimeMs) {
      localStorage.removeItem('dream_session');
      return;
    }
    
    STATE.system.lastSnapshot = snapshot;
  } catch (e) {
    logError('Session Restore Error', e);
  }
}

// ============================================================================
// NETWORK AWARENESS
// ============================================================================

function initNetworkDetection() {
  STATE.system.onlineStatus = navigator.onLine;
  
  window.addEventListener('online', () => {
    STATE.system.onlineStatus = true;
    renderUI();
    processUploadQueue();
    showToast('Back online', 'success');
    logActivity('Network restored');
  });
  
  window.addEventListener('offline', () => {
    STATE.system.onlineStatus = false;
    renderUI();
    showToast('You are offline', 'warning');
    logActivity('Network lost');
  });
}

// ============================================================================
// ERROR HANDLING & LOGGING
// ============================================================================

function logError(type, error) {
  const entry = {
    timestamp: new Date().toISOString(),
    type: type,
    error: error?.message || String(error),
    stack: error?.stack
  };
  
  STATE.admin.activityLog.unshift(entry);
  
  if (STATE.admin.activityLog.length > 1000) {
    STATE.admin.activityLog.pop();
  }
}

function logActivity(message) {
  const entry = {
    timestamp: new Date().toISOString(),
    message: message
  };
  
  STATE.admin.activityLog.unshift(entry);
  
  if (STATE.admin.activityLog.length > 1000) {
    STATE.admin.activityLog.pop();
  }
}

function showToast(message, type = 'info') {
  const container = document.getElementById('toastContainer');
  if (!container) return;
  
  const toast = document.createElement('div');
  toast.className = `toast ${type}`;
  toast.innerHTML = `
    <div>${getToastIcon(type)}</div>
    <div>${message}</div>
  `;
  
  container.appendChild(toast);
  
  setTimeout(() => {
    toast.style.animation = 'slideOut 0.3s';
    setTimeout(() => toast.remove(), 300);
  }, 5000);
}

function getToastIcon(type) {
  switch (type) {
    case 'success': return '✓';
    case 'error': return '✗';
    case 'warning': return '⚠';
    default: return 'ℹ';
  }
}

// ============================================================================
// INITIALIZATION
// ============================================================================

function init() {
  // Apply theme first
  const savedTheme = localStorage.getItem('dream_theme');
  STATE.ui.theme = savedTheme || 'light';
  
  // Init systems
  initPinSystem();
  initNetworkDetection();
  restoreSessionSnapshot();
  initGoogleOAuth();
  
  // Attach event listeners
  attachEventListeners();
  
  // Render initial UI
  renderUI();
  
  logActivity('Dream Vault OS initialized');
}

function attachEventListeners() {
  // PIN System
  const pinInput = document.getElementById('pinInput');
  const pinSubmit = document.getElementById('pinSubmit');
  
  if (pinInput) {
    pinInput.addEventListener('input', updatePinUI);
    pinInput.addEventListener('keypress', (e) => {
      if (e.key === 'Enter') pinSubmit.click();
    });
  }
  
  if (pinSubmit) {
    pinSubmit.addEventListener('click', () => {
      const pin = pinInput.value;
      if (pin.length !== 6) {
        showToast('PIN must be 6 digits', 'error');
        return;
      }
      
      const result = verifyPin(pin);
      if (result.valid) {
        STATE.ui.currentScreen = 'main';
        renderUI();
        requestGoogleAuth();
      } else if (result.cooldown) {
        updatePinUI();
      }
    });
  }
  
  // Theme Toggle
  const themeBtn = document.getElementById('themeToggle');
  if (themeBtn) {
    themeBtn.addEventListener('click', () => {
      const themes = ['light', 'dark', 'amoled'];
      const currentIndex = themes.indexOf(STATE.ui.theme);
      STATE.ui.theme = themes[(currentIndex + 1) % themes.length];
      
      localStorage.setItem('dream_theme', STATE.ui.theme);
      renderUI();
      logActivity(`Theme changed to ${STATE.ui.theme}`);
    });
  }
  
  // Search
  const searchInput = document.getElementById('searchInput');
  if (searchInput) {
    searchInput.addEventListener('input', (e) => {
      STATE.drive.searchQuery = e.target.value;
      renderFileGrid();
    });
  }
  
  // Sort
  const sortSelect = document.getElementById('sortSelect');
  if (sortSelect) {
    sortSelect.addEventListener('change', (e) => {
      STATE.drive.sortMode = e.target.value;
      renderFileGrid();
    });
  }
  
  // Upload
  const uploadBtn = document.getElementById('uploadBtn');
  if (uploadBtn) {
    uploadBtn.addEventListener('click', () => {
      const input = document.createElement('input');
      input.type = 'file';
      input.multiple = true;
      input.onchange = (e) => {
        addToUploadQueue(Array.from(e.target.files));
      };
      input.click();
    });
  }
  
  // Selection
  document.getElementById('selectAll')?.addEventListener('click', () => {
    STATE.drive.selectedFiles = [...STATE.drive.fileCache];
    renderFileGrid();
    updateSelectionUI();
  });
  
  document.getElementById('deselectAll')?.addEventListener('click', () => {
    STATE.drive.selectedFiles = [];
    renderFileGrid();
    updateSelectionUI();
  });
  
  // Lock/Logout
  document.getElementById('lockApp')?.addEventListener('click', () => {
    STATE.ui.currentScreen = 'lock';
    STATE.ui.isLocked = true;
    renderUI();
    logActivity('App manually locked');
  });
  
  document.getElementById('logout')?.addEventListener('click', () => {
    STATE.auth.accessToken = null;
    STATE.auth.userProfile = { email: null, name: null };
    STATE.ui.currentScreen = 'lock';
    STATE.ui.isLocked = true;
    STATE.drive.selectedFiles = [];
    renderUI();
    
    google.accounts.oauth2.revoke(STATE.auth.accessToken);
    logActivity('User logged out');
  });
  
  // Mode Toggle
  document.getElementById('modeToggle')?.addEventListener('click', () => {
    STATE.drive.mode = STATE.drive.mode === 'user' ? 'vault' : 'user';
    initDriveEngine();
    renderUI();
    logActivity(`Switched to ${STATE.drive.mode} mode`);
  });
  
  // Admin Panel
  document.getElementById('adminPanel')?.addEventListener('click', () => {
    document.getElementById('adminModal').classList.remove('hidden');
    renderAdminPanel();
  });
  
  document.getElementById('closeAdminModal')?.addEventListener('click', () => {
    document.getElementById('adminModal').classList.add('hidden');
  });
  
  // Close buttons
  document.getElementById('closeViewer')?.addEventListener('click', () => {
    document.getElementById('mediaViewer').classList.add('hidden');
  });
  
  document.getElementById('closeUploadPanel')?.addEventListener('click', () => {
    document.getElementById('uploadPanel').classList.add('hidden');
  });
}

function renderAdminPanel() {
  const logContainer = document.getElementById('activityLog');
  const apiCount = document.getElementById('apiCallCount');
  const onlineStatus = document.getElementById('onlineStatus');
  const toggleReadOnly = document.getElementById('toggleReadOnly');
  
  if (logContainer) {
    logContainer.innerHTML = STATE.admin.activityLog
      .slice(0, 50)
      .map(entry => `<div>[${new Date(entry.timestamp).toLocaleTimeString()}] ${entry.message || entry.type}</div>`)
      .join('');
  }
  
  if (apiCount) apiCount.textContent = STATE.system.apiCallCount;
  if (onlineStatus) onlineStatus.textContent = STATE.system.onlineStatus ? 'Yes' : 'No';
  
  if (toggleReadOnly) {
    toggleReadOnly.textContent = STATE.admin.readOnly ? 'Disable' : 'Enable';
    toggleReadOnly.addEventListener('click', () => {
      STATE.admin.readOnly = !STATE.admin.readOnly;
      toggleReadOnly.textContent = STATE.admin.readOnly ? 'Disable' : 'Enable';
      showToast(`Read-only mode ${STATE.admin.readOnly ? 'enabled' : 'disabled'}`, 'warning');
      logActivity(`Read-only mode ${STATE.admin.readOnly ? 'enabled' : 'disabled'}`);
    });
  }
}

// ============================================================================
// START APPLICATION
// ============================================================================

document.addEventListener('DOMContentLoaded', init);