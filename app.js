/**
 * 🔐 VAULT OS - FINAL STABLE KERNEL
 * Version: 5.2 (Boot Fix + Recursive Upload)
 */

// ==========================================
// 1. CONFIGURATION
// ==========================================
const CONFIG = {
    app: { name: "Vault OS", version: "5.2.0" },
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
        sessionTime: 15 * 60 * 1000 // 15 Mins
    }
};

// ==========================================
// 2. STATE & UTILS
// ==========================================
const State = {
    accessToken: null,
    user: null,
    files: [],
    currentFolder: 'root',
    selection: new Set(),
    viewMode: localStorage.getItem('vault_view') || 'grid',
    uploadQueue: []
};

const Utils = {
    formatBytes: (bytes, decimals = 2) => {
        if (!+bytes) return '0 B';
        const k = 1024;
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return `${parseFloat((bytes / Math.pow(k, i)).toFixed(decimals))} ${['B', 'KB', 'MB', 'GB', 'TB'][i]}`;
    },
    getIcon: (mime) => {
        if (!mime) return 'ri-file-line';
        if (mime.includes('folder')) return 'ri-folder-fill';
        if (mime.includes('image')) return 'ri-image-2-fill';
        if (mime.includes('video')) return 'ri-movie-fill';
        if (mime.includes('audio')) return 'ri-music-fill';
        if (mime.includes('pdf')) return 'ri-file-pdf-fill';
        if (mime.includes('zip')) return 'ri-file-zip-fill';
        if (mime.includes('text') || mime.includes('json') || mime.includes('javascript')) return 'ri-code-s-slash-line';
        return 'ri-file-3-fill';
    },
    getFolderColor: (name) => ['#ffd700', '#ff0055', '#00e676', '#2979ff', '#d500f9'][(name || "").length % 5]
};

// ==========================================
// 3. AUTHENTICATION
// ==========================================
const Auth = {
    buffer: "",
    init: () => {
        // Check Session
        try {
            const session = JSON.parse(localStorage.getItem('vault_session'));
            if (session && (Date.now() - session.time < CONFIG.security.sessionTime)) {
                Auth.unlock(true);
            } else {
                document.getElementById('auth-screen').classList.remove('hidden');
            }
        } catch (e) {
            document.getElementById('auth-screen').classList.remove('hidden');
        }

        // Setup Buttons
        document.querySelectorAll('.numpad-touch button').forEach(btn => {
            btn.onclick = () => Auth.handleInput(btn.dataset.val);
        });
    },
    handleInput: (val) => {
        if (val === 'clear') Auth.buffer = "";
        else if (val === 'enter') Auth.verify();
        else if (Auth.buffer.length < 4) Auth.buffer += val;
        
        document.querySelectorAll('.dot').forEach((d, i) => d.classList.toggle('active', i < Auth.buffer.length));
        if (Auth.buffer.length === 4) setTimeout(Auth.verify, 300);
    },
    verify: () => {
        const savedPin = localStorage.getItem('vault_pin') || CONFIG.security.defaultPin;
        if (Auth.buffer === savedPin) {
            Auth.unlock();
        } else {
            Auth.buffer = "";
            const panel = document.querySelector('.auth-glass-panel');
            if(panel) panel.animate([{ transform: 'translateX(-10px)' }, { transform: 'translateX(0)' }], { duration: 200 });
            document.querySelectorAll('.dot').forEach(d => d.classList.remove('active'));
        }
    },
    unlock: (silent = false) => {
        localStorage.setItem('vault_session', JSON.stringify({ time: Date.now() }));
        const auth = document.getElementById('auth-screen');
        const boot = document.getElementById('boot-screen');
        
        if (!silent) {
            if(auth) {
                auth.style.opacity = '0';
                setTimeout(() => auth.classList.add('hidden'), 500);
            }
            // Explicit Removal of Boot Screen
            if (boot) { 
                boot.style.opacity = '0'; 
                setTimeout(() => boot.remove(), 500); 
            }
        } else {
            if(auth) auth.classList.add('hidden');
            if (boot) boot.remove();
        }
        
        // Start Drive
        setTimeout(() => Drive.init(), 100);
    }
};

// ==========================================
// 4. DRIVE API
// ==========================================
const Drive = {
    tokenClient: null,
    init: async () => {
        if(typeof gapi === 'undefined' || typeof google === 'undefined') {
            console.error("Google Scripts not loaded. Check Internet.");
            UI.showToast("Connection Failed. Check Internet.", "error");
            return;
        }

        try {
            await Promise.all([
                new Promise(r => gapi.load('client', r)),
                new Promise(r => google.accounts.oauth2.initTokenClient({
                    client_id: CONFIG.gapi.clientId,
                    scope: CONFIG.gapi.scope,
                    callback: (resp) => Drive.handleAuth(resp)
                }, r))
            ]);
            await gapi.client.init({ apiKey: CONFIG.gapi.apiKey, discoveryDocs: CONFIG.gapi.discoveryDocs });
            
            Drive.tokenClient = google.accounts.oauth2.initTokenClient({
                client_id: CONFIG.gapi.clientId,
                scope: CONFIG.gapi.scope,
                callback: (resp) => Drive.handleAuth(resp)
            });
            
            // Auto Login Check
            if (localStorage.getItem('vault_token')) Drive.login();

        } catch (e) { console.error("Drive Init Error", e); }
    },
    login: () => {
        if(Drive.tokenClient) Drive.tokenClient.requestAccessToken({ prompt: '' });
    },
    handleAuth: (resp) => {
        if (resp.error) return;
        State.accessToken = resp.access_token;
        localStorage.setItem('vault_token', 'active');
        Drive.loadProfile();
        Drive.loadFolder('root');
        
        // Refresh Token Loop
        setInterval(() => {
            if(Drive.tokenClient) Drive.tokenClient.requestAccessToken({ prompt: '' });
        }, 45 * 60 * 1000); 
    },
    loadProfile: async () => {
        try {
            const res = await gapi.client.drive.about.get({ fields: "user, storageQuota" });
            const u = res.result.user;
            document.getElementById('user-name').innerText = u.displayName;
            // document.getElementById('user-email').innerText = u.emailAddress; // Optional
            document.getElementById('user-avatar').src = u.photoLink;
            document.querySelector('.user-status-ring').classList.add('online');
            
            if(res.result.storageQuota) {
                const pct = ((res.result.storageQuota.usage / res.result.storageQuota.limit) * 100).toFixed(1);
                document.getElementById('storage-bar').style.width = pct + "%";
                document.getElementById('storage-percent').innerText = pct + "%";
            }
        } catch(e) { console.warn("Profile load error", e); }
    },
    loadFolder: async (folderId) => {
        State.currentFolder = folderId;
        const q = `'${folderId}' in parents and trashed = false`;
        try {
            const res = await gapi.client.drive.files.list({
                q, pageSize: 100,
                fields: "files(id, name, mimeType, size, thumbnailLink, webContentLink, webViewLink, iconLink)",
                orderBy: "folder, name"
            });
            State.files = res.result.files;
            UI.render(State.files);
            UI.updateBreadcrumbs(folderId);
        } catch (e) { 
            console.error("Load Folder Error", e); 
            // If token expired, try login again
            if(e.status === 401) Drive.login();
        }
    }
};

// ==========================================
// 5. UI MANAGER
// ==========================================
const UI = {
    dom: { grid: document.getElementById('file-grid-container'), ctxMenu: document.getElementById('context-menu') },
    init: () => {
        // Global Click listener to close menus
        document.addEventListener('click', (e) => {
            if(!e.target.closest('.dropdown-trigger') && !e.target.closest('.dropdown-menu')) {
                 document.querySelectorAll('.dropdown-menu').forEach(el => el.classList.add('hidden'));
            }
            if(UI.dom.ctxMenu) UI.dom.ctxMenu.classList.add('hidden');
        });

        // View Toggles
        document.querySelectorAll('.switch-btn').forEach(btn => btn.onclick = () => UI.switchView(btn.dataset.view));
        
        // Context Menu
        document.addEventListener('contextmenu', UI.handleContextMenu);
    },
    render: (files) => {
        if(!UI.dom.grid) return;
        UI.dom.grid.innerHTML = "";
        
        const emptyState = document.getElementById('empty-state-placeholder');
        if(emptyState) emptyState.classList.toggle('hidden', files && files.length > 0);
        
        if(!files) return;

        files.forEach(file => {
            const card = document.createElement('div');
            card.className = `file-card ${State.selection.has(file.id) ? 'selected' : ''}`;
            card.dataset.id = file.id;
            
            let iconHtml = `<i class="${Utils.getIcon(file.mimeType)}"></i>`;
            let style = "";
            if (file.mimeType && file.mimeType.includes('folder')) {
                const color = Utils.getFolderColor(file.name);
                style = `color: ${color}; text-shadow: 0 0 15px ${color}55;`;
            } else if (file.thumbnailLink) {
                iconHtml = `<img src="${file.thumbnailLink.replace('s220', 's400')}" loading="lazy" style="width:100%;height:100%;object-fit:cover;border-radius:8px;">`;
            }

            card.innerHTML = `<div class="fc-thumb" style="${style}">${iconHtml}</div>
                              <div class="fc-info"><span class="fc-name">${file.name}</span><div class="fc-meta">${Utils.formatBytes(file.size)}</div></div>`;
            
            card.onclick = (e) => {
                e.stopPropagation();
                if (e.ctrlKey) UI.toggleSelect(file.id);
                else if (file.mimeType.includes('folder')) Drive.loadFolder(file.id);
                else Media.open(file);
            };
            UI.dom.grid.appendChild(card);
        });
    },
    toggleSelect: (id) => {
        State.selection.has(id) ? State.selection.delete(id) : State.selection.add(id);
        UI.render(State.files);
        const bar = document.getElementById('selection-bar');
        if(bar) {
            if(State.selection.size > 0) {
                bar.classList.remove('hidden');
                const count = document.getElementById('select-count');
                if(count) count.innerText = `${State.selection.size} selected`;
            } else {
                bar.classList.add('hidden');
            }
        }
    },
    switchView: (mode) => {
        State.viewMode = mode;
        if(UI.dom.grid) UI.dom.grid.className = `file-browser ${mode}-view`;
        document.querySelectorAll('.switch-btn').forEach(b => b.classList.toggle('active', b.dataset.view === mode));
    },
    handleContextMenu: (e) => {
        e.preventDefault();
        const card = e.target.closest('.file-card');
        const menu = UI.dom.ctxMenu;
        if (card && menu) {
            UI.toggleSelect(card.dataset.id);
            menu.dataset.target = card.dataset.id;
            
            let x = e.pageX, y = e.pageY;
            // Boundary Check
            if (x + 200 > window.innerWidth) x -= 200;
            if (y + 300 > window.innerHeight) y -= 300;
            
            menu.style.left = `${x}px`;
            menu.style.top = `${y}px`;
            menu.classList.remove('hidden');
        }
    },
    updateBreadcrumbs: (id) => {
        const bc = document.getElementById('breadcrumbs');
        if(bc) {
            bc.innerHTML = id === 'root' ? '<span class="crumb">My Drive</span>' : 
            '<span class="crumb" onclick="Drive.loadFolder(\'root\')" style="cursor:pointer">My Drive</span> <span class="crumb"> / Subfolder</span>';
        }
    },
    showToast: (msg, type='info') => {
        const container = document.getElementById('toast-container');
        if(!container) return;
        const t = document.createElement('div');
        t.className = `toast ${type}`; t.innerText = msg;
        container.appendChild(t);
        setTimeout(() => t.remove(), 3000);
    }
};

// ==========================================
// 6. ACTION ENGINE
// ==========================================
const Actions = {
    init: () => {
        // Dropdown Toggles
        const sortBtn = document.getElementById('btn-sort-menu');
        if(sortBtn) sortBtn.onclick = (e) => { 
            e.stopPropagation(); 
            document.getElementById('sort-dropdown').classList.toggle('hidden'); 
        };

        const upBtn = document.getElementById('btn-upload-menu');
        if(upBtn) upBtn.onclick = (e) => {
            e.stopPropagation();
            document.getElementById('upload-dropdown').classList.toggle('hidden');
        };

        // Handlers
        const handlers = {
            'download': (id) => {
                const f = State.files.find(x => x.id === id);
                if(f) window.open(f.webContentLink);
            },
            'delete': async (id) => {
                if(!confirm('Move to trash?')) return;
                await gapi.client.drive.files.update({ fileId: id, trashed: true });
                UI.showToast('Item deleted', 'error');
                Drive.loadFolder(State.currentFolder);
            },
            'rename': async (id) => {
                const f = State.files.find(x => x.id === id);
                const n = prompt("Rename:", f ? f.name : "");
                if(n) {
                    await gapi.client.drive.files.update({ fileId: id, resource: { name: n } });
                    Drive.loadFolder(State.currentFolder);
                }
            },
            'move': (id) => FolderPicker.open('move', id),
            'copy': (id) => FolderPicker.open('copy', id)
        };
        
        // Listener for Action Buttons
        document.body.addEventListener('click', (e) => {
            const btn = e.target.closest('[data-act]');
            if(btn) {
                let id = UI.dom.ctxMenu ? UI.dom.ctxMenu.dataset.target : null;
                if(!id && State.selection.size > 0) id = [...State.selection][0];
                if(id && handlers[btn.dataset.act]) {
                    handlers[btn.dataset.act](id);
                    if(UI.dom.ctxMenu) UI.dom.ctxMenu.classList.add('hidden');
                }
            }
        });

        // Sorting Logic
        document.querySelectorAll('#sort-dropdown .menu-item').forEach(i => {
            i.onclick = () => {
                const type = i.dataset.sort;
                const files = [...State.files].sort((a,b) => {
                    if(type === 'name') return a.name.localeCompare(b.name);
                    if(type === 'size') return (parseInt(b.size)||0) - (parseInt(a.size)||0);
                    return 0;
                });
                UI.render(files);
                document.getElementById('sort-dropdown').classList.add('hidden');
            }
        });
        
        // Sidebar Mobile Toggle
        const sideToggle = document.getElementById('sidebar-toggle');
        const sideClose = document.getElementById('mobile-close-sidebar');
        const sidebar = document.querySelector('.sidebar');
        if(sideToggle && sidebar) sideToggle.onclick = () => sidebar.classList.add('open');
        if(sideClose && sidebar) sideClose.onclick = () => sidebar.classList.remove('open');
        
        // Connect Button
        const connBtn = document.getElementById('btn-drive-connect');
        if(connBtn) connBtn.onclick = () => Drive.login();
    },
    createFolder: async () => {
        const name = prompt("Folder Name:");
        if(!name) return;
        try {
            await gapi.client.drive.files.create({
                resource: { name: name, mimeType: 'application/vnd.google-apps.folder', parents: [State.currentFolder] },
                fields: 'id'
            });
            Drive.loadFolder(State.currentFolder);
        } catch(e) { console.error(e); }
    }
};

// ==========================================
// 7. FOLDER PICKER
// ==========================================
const FolderPicker = {
    mode: null, sourceId: null, targetId: null,
    open: (mode, id) => {
        FolderPicker.mode = mode; FolderPicker.sourceId = id;
        const el = document.getElementById('modal-picker-wrapper');
        if(!el) return;
        
        el.innerHTML = `
            <div class="modal-overlay">
                <div class="modal-window">
                    <div class="modal-top-bar">Select Target <button onclick="this.closest('.modal-overlay').remove()" style="color:white">✕</button></div>
                    <div id="picker-list" style="height:300px;overflow:auto;padding:10px;">Loading...</div>
                    <div class="modal-footer"><button class="action-chip primary" id="fp-confirm">Confirm Here</button></div>
                </div>
            </div>`;
        FolderPicker.load('root');
        setTimeout(() => {
            const btn = document.getElementById('fp-confirm');
            if(btn) btn.onclick = FolderPicker.exec;
        }, 100);
    },
    load: async (pid) => {
        const list = document.getElementById('picker-list');
        if(!list) return;
        list.innerHTML = "";
        
        if(pid !== 'root') {
            const up = document.createElement('div'); up.className="picker-item"; up.innerHTML="⬆ Go Up";
            up.onclick = () => FolderPicker.load('root'); list.appendChild(up);
        }
        
        try {
            const res = await gapi.client.drive.files.list({
                q: `'${pid}' in parents and mimeType = 'application/vnd.google-apps.folder' and trashed = false`,
                fields: 'files(id, name)'
            });
            res.result.files.forEach(f => {
                const d = document.createElement('div'); d.className="picker-item"; d.innerHTML=`📁 ${f.name}`;
                d.onclick = () => { FolderPicker.targetId = f.id; FolderPicker.load(f.id); };
                list.appendChild(d);
            });
            FolderPicker.targetId = pid;
        } catch(e) { list.innerHTML = "Error loading folders"; }
    },
    exec: async () => {
        const wrapper = document.getElementById('modal-picker-wrapper');
        if(wrapper) wrapper.innerHTML = ""; // Close modal
        UI.showToast("Processing...", "info");
        try {
            if(FolderPicker.mode === 'move') {
                // For move, we need to know current parent. Simplified here to add new parent.
                await gapi.client.drive.files.update({ fileId: FolderPicker.sourceId, addParents: FolderPicker.targetId });
            } else {
                await gapi.client.drive.files.copy({ fileId: FolderPicker.sourceId, parents: [FolderPicker.targetId] });
            }
            UI.showToast("Success!", "success");
            Drive.loadFolder(State.currentFolder);
        } catch(e) { console.error(e); UI.showToast("Operation Failed", "error"); }
    }
};

// ==========================================
// 8. UPLOAD ENGINE (Recursive)
// ==========================================
const Upload = {
    queue: [], active: 0, cache: {},
    init: () => {
        const fInput = document.getElementById('inp-file');
        const dInput = document.getElementById('inp-folder');
        const actFile = document.getElementById('act-upload-file');
        const actFolder = document.getElementById('act-upload-folder');
        
        if(actFile && fInput) actFile.onclick = () => fInput.click();
        if(actFolder && dInput) actFolder.onclick = () => dInput.click();
        
        if(fInput) fInput.onchange = (e) => Upload.start(e.target.files);
        if(dInput) dInput.onchange = (e) => Upload.start(e.target.files);
    },
    start: async (files) => {
        const drop = document.getElementById('upload-dropdown');
        if(drop) drop.classList.add('hidden');
        const dock = document.getElementById('upload-manager');
        if(dock) dock.classList.remove('hidden');
        
        Upload.cache = {};
        for (const file of Array.from(files)) {
            let parentId = State.currentFolder;
            if (file.webkitRelativePath) {
                const parts = file.webkitRelativePath.split('/');
                parts.pop();
                if (parts.length > 0) parentId = await Upload.ensurePath(parts, State.currentFolder);
            }
            Upload.addToQueue(file, parentId);
        }
    },
    ensurePath: async (parts, root) => {
        let current = root;
        let pathStr = "";
        for (const part of parts) {
            pathStr += "/" + part;
            if (Upload.cache[pathStr]) { current = Upload.cache[pathStr]; continue; }
            
            try {
                const q = `mimeType = 'application/vnd.google-apps.folder' and name = '${part.replace(/'/g, "\\'")}' and '${current}' in parents and trashed = false`;
                const res = await gapi.client.drive.files.list({ q, fields: 'files(id)' });
                
                if (res.result.files.length > 0) {
                    current = res.result.files[0].id;
                } else {
                    const newF = await gapi.client.drive.files.create({
                        resource: { name: part, mimeType: 'application/vnd.google-apps.folder', parents: [current] }, fields: 'id'
                    });
                    current = newF.result.id;
                }
                Upload.cache[pathStr] = current;
            } catch(e) { console.error("Path Error", e); }
        }
        return current;
    },
    addToQueue: (file, pid) => {
        const list = document.getElementById('upload-list-container');
        if(!list) return;
        const item = document.createElement('div'); item.className = 'upload-item';
        item.innerHTML = `<span>${file.name}</span> <div class="progress-track-mini"><div class="progress-bar-mini" style="width:0%"></div></div>`;
        list.appendChild(item);
        Upload.queue.push({ file, pid, ui: item });
        Upload.next();
    },
    next: () => {
        if (Upload.active >= 3 || Upload.queue.length === 0) return;
        const task = Upload.queue.shift();
        Upload.active++;
        
        const meta = { name: task.file.name, parents: [task.pid] };
        const form = new FormData();
        form.append('metadata', new Blob([JSON.stringify(meta)], { type: 'application/json' }));
        form.append('file', task.file);
        
        const xhr = new XMLHttpRequest();
        xhr.open('POST', 'https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart');
        xhr.setRequestHeader('Authorization', 'Bearer ' + State.accessToken);
        xhr.upload.onprogress = (e) => {
            if(e.lengthComputable) task.ui.querySelector('.progress-bar-mini').style.width = ((e.loaded/e.total)*100)+'%';
        };
        xhr.onload = () => {
            Upload.active--;
            task.ui.innerHTML += ' <i class="ri-check-line" style="color:#00e676"></i>';
            Upload.next();
            if(Upload.active===0 && Upload.queue.length===0) Drive.loadFolder(State.currentFolder);
        };
        xhr.send(form);
    }
};

// ==========================================
// 9. MEDIA PLAYER
// ==========================================
const Media = {
    open: (file) => {
        const modal = document.getElementById('modal-viewer');
        if(!modal) return;
        modal.classList.remove('hidden');
        
        const c = document.querySelector('.viewer-content');
        if(!c) return;
        c.innerHTML = '<div class="spinner"></div>';
        
        const url = `${CONFIG.proxy.media}?id=${file.id}`;
        
        document.getElementById('viewer-title').innerText = file.name;
        
        if (file.mimeType.includes('video')) {
            c.innerHTML = `<video src="${url}" controls style="width:100%;height:100%" autoplay></video>`;
        } else if (file.mimeType.includes('image')) {
            c.innerHTML = `<img src="${file.thumbnailLink.replace('s220','s1600')}" style="max-height:100%">`;
        } else if (file.mimeType.includes('audio')) {
             c.innerHTML = `<audio src="${url}" controls style="width:80%"></audio>`;
        } else {
             c.innerHTML = `<div style="text-align:center;color:#fff">Preview not available.<br><br><a href="${file.webContentLink}" class="action-chip primary" target="_blank">Download File</a></div>`;
        }
    }
};

// ==========================================
// 10. SYSTEM BOOT (SAFE MODE)
// ==========================================
window.onload = () => {
    console.log("🚀 Vault OS Booting...");
    try {
        Auth.init();
        UI.init();
        Actions.init();
        Upload.init();
        
        const vClose = document.getElementById('btn-viewer-close');
        if(vClose) vClose.onclick = () => {
            document.getElementById('modal-viewer').classList.add('hidden');
            const vc = document.querySelector('.viewer-content');
            if(vc) vc.innerHTML = "";
        };

    } catch(e) {
        console.error("Boot Error", e);
    }

    // 🛡️ SAFETY VALVE: Force remove boot screen after 3 seconds
    // This ensures that even if script errors out, the user isn't stuck.
    setTimeout(() => {
        const boot = document.getElementById('boot-screen');
        if (boot) {
            boot.style.transition = "opacity 0.5s";
            boot.style.opacity = '0';
            setTimeout(() => boot.remove(), 500);
            console.log("✅ Boot Screen removed by Safety Protocol");
        }
    }, 3000);
};
