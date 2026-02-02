/**
 * 🔐 VAULT OS - GOLD MASTER (v5.1)
 * Status: Production Ready
 * Features: Auth, Proxy Media, Recursive Upload, Folder Picker, Safe Actions.
 */

// ==========================================
// 1. CONFIGURATION
// ==========================================
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
        if (mime.includes('folder')) return 'ri-folder-fill';
        if (mime.includes('image')) return 'ri-image-2-fill';
        if (mime.includes('video')) return 'ri-movie-fill';
        if (mime.includes('audio')) return 'ri-music-fill';
        if (mime.includes('pdf')) return 'ri-file-pdf-fill';
        if (mime.includes('zip')) return 'ri-file-zip-fill';
        if (mime.includes('text') || mime.includes('json')) return 'ri-code-s-slash-line';
        return 'ri-file-3-fill';
    },
    getFolderColor: (name) => ['#ffd700', '#ff0055', '#00e676', '#2979ff', '#d500f9'][name.length % 5]
};

// ==========================================
// 3. AUTHENTICATION
// ==========================================
const Auth = {
    buffer: "",
    init: () => {
        const session = JSON.parse(localStorage.getItem('vault_session'));
        if (session && (Date.now() - session.time < CONFIG.security.sessionTime)) {
            Auth.unlock(true);
        } else {
            document.getElementById('auth-screen').classList.remove('hidden');
        }
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
        if (Auth.buffer === (localStorage.getItem('vault_pin') || CONFIG.security.defaultPin)) {
            Auth.unlock();
        } else {
            Auth.buffer = "";
            document.querySelector('.auth-glass-panel').animate([{ transform: 'translateX(-10px)' }, { transform: 'translateX(0)' }], { duration: 200 });
            document.querySelectorAll('.dot').forEach(d => d.classList.remove('active'));
        }
    },
    unlock: (silent = false) => {
        localStorage.setItem('vault_session', JSON.stringify({ time: Date.now() }));
        const auth = document.getElementById('auth-screen');
        const boot = document.getElementById('boot-screen');
        
        if (!silent) {
            auth.style.opacity = '0';
            setTimeout(() => auth.classList.add('hidden'), 500);
            if (boot) { boot.style.opacity = '0'; setTimeout(() => boot.remove(), 500); }
        } else {
            auth.classList.add('hidden');
            if (boot) boot.remove();
        }
        Drive.init();
    }
};

// ==========================================
// 4. DRIVE API
// ==========================================
const Drive = {
    tokenClient: null,
    init: async () => {
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
            if (localStorage.getItem('vault_token')) Drive.login();
        } catch (e) { console.error("Init Error", e); }
    },
    login: () => Drive.tokenClient.requestAccessToken({ prompt: '' }),
    handleAuth: (resp) => {
        if (resp.error) return;
        State.accessToken = resp.access_token;
        localStorage.setItem('vault_token', 'active');
        Drive.loadProfile();
        Drive.loadFolder('root');
        setInterval(() => Drive.tokenClient.requestAccessToken({ prompt: '' }), 45 * 60 * 1000); // Auto Refresh
    },
    loadProfile: async () => {
        const res = await gapi.client.drive.about.get({ fields: "user, storageQuota" });
        const u = res.result.user;
        document.getElementById('user-name').innerText = u.displayName;
        document.getElementById('user-email').innerText = u.emailAddress;
        document.getElementById('user-avatar').src = u.photoLink;
        document.querySelector('.user-status-ring').classList.add('online');
        const pct = ((res.result.storageQuota.usage / res.result.storageQuota.limit) * 100).toFixed(1);
        document.getElementById('storage-bar').style.width = pct + "%";
        document.getElementById('storage-percent').innerText = pct + "%";
    },
    loadFolder: async (folderId) => {
        // UI.toggleLoader(true); // Uncomment if loader exists
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
        } catch (e) { console.error(e); }
    }
};

// ==========================================
// 5. UI MANAGER
// ==========================================
const UI = {
    dom: { grid: document.getElementById('file-grid-container'), ctxMenu: document.getElementById('context-menu') },
    init: () => {
        document.addEventListener('click', () => {
            document.querySelectorAll('.dropdown-menu').forEach(el => el.classList.add('hidden'));
            UI.dom.ctxMenu.classList.add('hidden');
        });
        document.querySelectorAll('.switch-btn').forEach(btn => btn.onclick = () => UI.switchView(btn.dataset.view));
        document.addEventListener('contextmenu', UI.handleContextMenu);
    },
    render: (files) => {
        UI.dom.grid.innerHTML = "";
        document.getElementById('empty-state-placeholder').classList.toggle('hidden', files.length > 0);
        
        files.forEach(file => {
            const card = document.createElement('div');
            card.className = `file-card ${State.selection.has(file.id) ? 'selected' : ''}`;
            card.dataset.id = file.id;
            
            let iconHtml = `<i class="${Utils.getIcon(file.mimeType)}"></i>`;
            let style = "";
            if (file.mimeType.includes('folder')) {
                const color = Utils.getFolderColor(file.name);
                style = `color: ${color}; text-shadow: 0 0 15px ${color}55;`;
            } else if (file.thumbnailLink) {
                iconHtml = `<img src="${file.thumbnailLink.replace('s220', 's400')}" loading="lazy">`;
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
        if(State.selection.size > 0) {
            bar.classList.remove('hidden');
            document.getElementById('select-count').innerText = `${State.selection.size} selected`;
        } else {
            bar.classList.add('hidden');
        }
    },
    switchView: (mode) => {
        State.viewMode = mode;
        UI.dom.grid.className = `file-browser ${mode}-view`;
    },
    handleContextMenu: (e) => {
        e.preventDefault();
        const card = e.target.closest('.file-card');
        if (card) {
            UI.toggleSelect(card.dataset.id);
            UI.dom.ctxMenu.dataset.target = card.dataset.id;
            
            let x = e.pageX, y = e.pageY;
            if (x + 200 > window.innerWidth) x -= 200;
            if (y + 300 > window.innerHeight) y -= 300;
            
            UI.dom.ctxMenu.style.left = `${x}px`;
            UI.dom.ctxMenu.style.top = `${y}px`;
            UI.dom.ctxMenu.classList.remove('hidden');
        }
    },
    updateBreadcrumbs: (id) => {
        const bc = document.getElementById('breadcrumbs');
        bc.innerHTML = id === 'root' ? '<span class="crumb">My Drive</span>' : 
            '<span class="crumb" onclick="Drive.loadFolder(\'root\')">My Drive</span> <span class="crumb"> / Subfolder</span>';
    },
    showToast: (msg, type='info') => {
        const t = document.createElement('div');
        t.className = `toast ${type}`; t.innerText = msg;
        document.getElementById('toast-container').appendChild(t);
        setTimeout(() => t.remove(), 3000);
    }
};

// ==========================================
// 6. ACTION ENGINE (Actions & Sort)
// ==========================================
const Actions = {
    init: () => {
        const handlers = {
            'download': (id) => {
                const f = State.files.find(x => x.id === id);
                if (f.mimeType.includes('folder')) {
                    if(confirm('Download folder as ZIP? (Google default)')) window.open(f.webContentLink);
                } else window.open(f.webContentLink);
            },
            'delete': async (id) => {
                if(!confirm('Delete?')) return;
                await gapi.client.drive.files.update({ fileId: id, trashed: true });
                UI.showToast('Deleted', 'error');
                Drive.loadFolder(State.currentFolder);
            },
            'rename': async (id) => {
                const f = State.files.find(x => x.id === id);
                const n = prompt("Rename:", f.name);
                if(n) {
                    await gapi.client.drive.files.update({ fileId: id, resource: { name: n } });
                    Drive.loadFolder(State.currentFolder);
                }
            },
            'move': (id) => FolderPicker.open('move', id),
            'copy': (id) => FolderPicker.open('copy', id)
        };
        
        document.body.addEventListener('click', (e) => {
            const btn = e.target.closest('[data-act]');
            if(btn) {
                let id = UI.dom.ctxMenu.dataset.target;
                if(!id && State.selection.size > 0) id = [...State.selection][0];
                if(id && handlers[btn.dataset.act]) {
                    handlers[btn.dataset.act](id);
                    UI.dom.ctxMenu.classList.add('hidden');
                }
            }
        });
        
        // Sorting
        document.getElementById('btn-sort-menu').onclick = (e) => {
            e.stopPropagation(); document.getElementById('sort-dropdown').classList.toggle('hidden');
        };
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
    }
};

// ==========================================
// 7. FOLDER PICKER (Move/Copy)
// ==========================================
const FolderPicker = {
    mode: null, sourceId: null, targetId: null,
    open: (mode, id) => {
        FolderPicker.mode = mode; FolderPicker.sourceId = id;
        const el = document.getElementById('modal-picker-wrapper');
        el.innerHTML = `<div class="modal-overlay"><div class="modal-window"><div class="modal-top-bar">Select Target <button onclick="this.closest('.modal-overlay').remove()">X</button></div><div id="picker-list" style="height:300px;overflow:auto;padding:10px;"></div><div class="modal-footer"><button class="primary-btn" id="fp-confirm">Confirm</button></div></div></div>`;
        FolderPicker.load('root');
        document.getElementById('fp-confirm').onclick = FolderPicker.exec;
    },
    load: async (pid) => {
        const list = document.getElementById('picker-list');
        list.innerHTML = "";
        if(pid !== 'root') {
            const up = document.createElement('div'); up.className="picker-item"; up.innerHTML="⬆ Go Up";
            up.onclick = () => FolderPicker.load('root'); list.appendChild(up);
        }
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
    },
    exec: async () => {
        document.getElementById('modal-picker-wrapper').innerHTML = "";
        UI.showToast("Processing...", "info");
        try {
            if(FolderPicker.mode === 'move') {
                await gapi.client.drive.files.update({ fileId: FolderPicker.sourceId, addParents: FolderPicker.targetId });
            } else {
                await gapi.client.drive.files.copy({ fileId: FolderPicker.sourceId, parents: [FolderPicker.targetId] });
            }
            UI.showToast("Success!", "success");
            Drive.loadFolder(State.currentFolder);
        } catch(e) { console.error(e); }
    }
};

// ==========================================
// 8. ADVANCED UPLOAD ENGINE (Recursive)
// ==========================================
const Upload = {
    queue: [], active: 0, cache: {},
    init: () => {
        document.getElementById('btn-upload-menu').onclick = (e) => { e.stopPropagation(); document.getElementById('upload-dropdown').classList.toggle('hidden'); };
        document.getElementById('act-upload-file').onclick = () => document.getElementById('inp-file').click();
        document.getElementById('act-upload-folder').onclick = () => document.getElementById('inp-folder').click();
        
        document.getElementById('inp-file').onchange = (e) => Upload.start(e.target.files);
        document.getElementById('inp-folder').onchange = (e) => Upload.start(e.target.files);
    },
    start: async (files) => {
        document.getElementById('upload-dropdown').classList.add('hidden');
        document.getElementById('upload-manager').classList.remove('hidden');
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
            
            const q = `mimeType = 'application/vnd.google-apps.folder' and name = '${part}' and '${current}' in parents and trashed = false`;
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
        }
        return current;
    },
    addToQueue: (file, pid) => {
        const item = document.createElement('div'); item.className = 'upload-item';
        item.innerHTML = `<span>${file.name}</span> <div class="progress-track-mini"><div class="progress-bar-mini" style="width:0%"></div></div>`;
        document.getElementById('upload-list-container').appendChild(item);
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
        modal.classList.remove('hidden');
        const c = document.querySelector('.viewer-content');
        const url = `${CONFIG.proxy.media}?id=${file.id}`;
        
        if (file.mimeType.includes('video')) c.innerHTML = `<video src="${url}" controls style="width:100%;height:100%"></video>`;
        else if (file.mimeType.includes('image')) c.innerHTML = `<img src="${file.thumbnailLink.replace('s220','s1600')}" style="max-height:100%">`;
        else window.open(file.webContentLink);
    }
};

// ==========================================
// 10. BOOT
// ==========================================
window.onload = () => {
    Auth.init(); UI.init(); Actions.init(); Upload.init();
    document.getElementById('btn-viewer-close').onclick = () => {
        document.getElementById('modal-viewer').classList.add('hidden');
        document.querySelector('.viewer-content').innerHTML = "";
    };
};


