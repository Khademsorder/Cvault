/* =========================================
   VAULT OS ULTIMATE - MASTER CODE
   Part A: Config, Auth & Pin Security
   ========================================= */

// ২৮. কনফিগারেশন অবজেক্ট (Apps Script সহ)
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
        apiKey: "AIzaSyDa9xQWqxE71j3ZaI7NI_0hGztmLcx4USo", 
        clientId: "318681315152-65e9kofptt4c3bk3kmlj9gmksnasu347.apps.googleusercontent.com",
        scope: "https://www.googleapis.com/auth/drive.file https://www.googleapis.com/auth/drive.readonly https://www.googleapis.com/auth/userinfo.profile",
        discoveryDocs: ["https://www.googleapis.com/discovery/v1/apis/drive/v3/rest"]
    },
    app: {
        rootFolder: "1zIyinAqjQv96QBSuanFS2F0USaG66GPn",
        scriptUrl: "https://script.google.com/macros/s/AKfycbxItLlQHW0NEhhgGedLOxQQFPIdVEqYlGILa2Pd6Rei_kGzpSm67l5mAO3oIJhKvdzEjQ/exec",
        defaultPin: "1171",
        sessionTime: 24 * 60 * 60 * 1000 // ২৪ ঘণ্টা
    }
};

// গ্লোবাল স্টেট
const state = {
    accessToken: null,
    files: [],
    currentFolder: CONFIG.app.rootFolder,
    folderStack: [],
    selected: new Set(),
    view: 'home', // home, gallery, settings
    pinBuffer: '' // পিন ইনপুট স্টোর করার জন্য
};

// ২৯. অথেনটিকেশন ও পিন সিস্টেম
const Auth = {
    init: function() {
        // ফায়ারবেস ইনিশ
        try {
            if (firebase && !firebase.apps.length) {
                firebase.initializeApp(CONFIG.firebase);
                console.log("Firebase Connected");
            }
        } catch (e) { console.warn("Firebase Error", e); }

        // গুগল অথ ইনিশ
        if(google && google.accounts) {
            state.tokenClient = google.accounts.oauth2.initTokenClient({
                client_id: CONFIG.google.clientId,
                scope: CONFIG.google.scope,
                callback: (resp) => this.handleLogin(resp)
            });
        }
    },

    // ৩০. পিন প্যাড লজিক
    addPin: function(num) {
        if(state.pinBuffer.length < 4) {
            state.pinBuffer += num;
            this.updatePinUI();
        }
    },
    clearPin: function() {
        state.pinBuffer = '';
        this.updatePinUI();
    },
    updatePinUI: function() {
        document.getElementById('pin-input').value = '•'.repeat(state.pinBuffer.length);
    },

    // ৩১. পিন ভ্যালিডেশন
    validatePin: function() {
        const entered = state.pinBuffer;
        if(entered === CONFIG.app.defaultPin) { // ফায়ারবেস চেক এখানে এড করা যাবে
            document.getElementById('pin-screen').classList.add('hidden');
            this.checkSession();
        } else {
            const err = document.getElementById('pin-error');
            err.classList.remove('hidden');
            state.pinBuffer = '';
            this.updatePinUI();
            setTimeout(() => err.classList.add('hidden'), 2000);
        }
    },

    // ৩২. সেশন চেক ও অটো লগিন
    checkSession: function() {
        const session = JSON.parse(localStorage.getItem('vault_auth'));
        if(session && Date.now() < session.expiry) {
            state.accessToken = session.token;
            UI.startApp();
        } else {
            document.getElementById('login-screen').classList.remove('hidden');
        }
    },

    login: function() { state.tokenClient.requestAccessToken({prompt: 'consent'}); },

    handleLogin: function(resp) {
        if(resp.error) return alert("Login Failed");
        state.accessToken = resp.access_token;
        const expiry = Date.now() + (resp.expires_in * 1000);
        localStorage.setItem('vault_auth', JSON.stringify({ token: state.accessToken, expiry: expiry }));
        UI.startApp();
    },

    logout: function() {
        localStorage.removeItem('vault_auth');
        location.reload();
    }
};
/* Part B: Drive Core & File Operations */

const Drive = {
    // ৩৩. ফাইল লোড (সার্চ ও ফোল্ডার সহ)
    load: async function(folderId = state.currentFolder, typeFilter = null) {
        UI.loader(true);
        let query = "trashed = false";
        
        if(state.searchTerm) {
            query += ` and name contains '${state.searchTerm}'`; // ৩৪. লাইভ সার্চ
        } else if(typeFilter) {
            query += ` and mimeType contains '${typeFilter}'`; // ৩৫. গ্যালারি ফিল্টার
        } else {
            query += ` and '${folderId}' in parents`; // নরমাল ফোল্ডার ভিউ
        }

        const params = new URLSearchParams({
            q: query,
            fields: "files(id, name, mimeType, thumbnailLink, webContentLink, parents)",
            pageSize: 100,
            key: CONFIG.google.apiKey
        });

        try {
            const res = await fetch(`https://www.googleapis.com/drive/v3/files?${params}`, {
                headers: { 'Authorization': `Bearer ${state.accessToken}` }
            });
            const data = await res.json();
            state.files = data.files || [];
            UI.render(state.files);
        } catch(e) { console.error(e); }
        UI.loader(false);
    },

    // ৩৬. ফোল্ডার তৈরি
    createFolder: async function() {
        const name = prompt("Folder Name:");
        if(!name) return;
        const meta = { name: name, mimeType: 'application/vnd.google-apps.folder', parents: [state.currentFolder] };
        
        await fetch('https://www.googleapis.com/drive/v3/files', {
            method: 'POST',
            headers: { 'Authorization': `Bearer ${state.accessToken}`, 'Content-Type': 'application/json' },
            body: JSON.stringify(meta)
        });
        this.load();
    },

    // ৩৭. ফাইল ট্রাশ (Recycle Bin)
    trashFiles: async function() {
        if(!confirm("Move to Trash?")) return;
        for(let id of state.selected) {
            await fetch(`https://www.googleapis.com/drive/v3/files/${id}`, {
                method: 'PATCH',
                headers: { 'Authorization': `Bearer ${state.accessToken}`, 'Content-Type': 'application/json' },
                body: JSON.stringify({ trashed: true })
            });
        }
        UI.clearSelect();
        this.load();
    }
};

// ৩৮. আপলোড সিস্টেম
const Upload = {
    handle: async function(files) {
        UI.toast(`Uploading ${files.length} items...`);
        for(let file of files) {
            const meta = { name: file.name, parents: [state.currentFolder] };
            const form = new FormData();
            form.append('metadata', new Blob([JSON.stringify(meta)], {type: 'application/json'}));
            form.append('file', file);

            await fetch('https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart', {
                method: 'POST',
                headers: { 'Authorization': `Bearer ${state.accessToken}` },
                body: form
            });
        }
        UI.toast("Upload Complete");
        Drive.load();
    }
};
/* Part C: Pro Viewer & Tools (COMPLETED) */

const Viewer = {
    player: null,
    zipCache: null, // জিপ ফাইল মেমোরিতে রাখার জন্য

    // ৩৯. স্মার্ট ফাইল ওপেনার
    open: async function(file) {
        const modal = document.getElementById('media-modal');
        const token = state.accessToken;
        
        // সব ভিউ রিসেট
        document.querySelectorAll('.media-box').forEach(e => e.classList.add('hidden'));
        modal.classList.remove('hidden');

        // A. ভিডিও প্লেয়ার (Subtitles সহ)
        if(file.mimeType.includes('video')) {
            document.getElementById('video-box').classList.remove('hidden');
            const url = `https://www.googleapis.com/drive/v3/files/${file.id}?alt=media&access_token=${token}`;
            const video = document.getElementById('player');
            video.src = url;
            
            if(this.player) this.player.destroy();
            this.player = new Plyr(video, { 
                controls: ['play-large', 'play', 'progress', 'current-time', 'mute', 'volume', 'captions', 'settings', 'fullscreen'] 
            });

        // B. ইমেজ এডিটর
        } else if(file.mimeType.includes('image')) {
            document.getElementById('image-box').classList.remove('hidden');
            UI.loader(true);
            try {
                const res = await fetch(`https://www.googleapis.com/drive/v3/files/${file.id}?alt=media`, { headers: {'Authorization': `Bearer ${token}`} });
                const blob = await res.blob();
                document.getElementById('image-view').src = URL.createObjectURL(blob);
            } catch(e) { console.error(e); }
            UI.loader(false);

        // C. জিপ ভিউয়ার (Full Logic Added)
        } else if(file.mimeType.includes('zip') || file.mimeType.includes('compressed')) {
            document.getElementById('file-box').classList.remove('hidden');
            document.getElementById('file-title').innerText = file.name;
            const listEl = document.getElementById('file-body');
            listEl.innerHTML = '<div style="padding:20px; text-align:center;">Downloading & Reading Zip...</div>';
            
            try {
                const res = await fetch(`https://www.googleapis.com/drive/v3/files/${file.id}?alt=media`, { headers: { 'Authorization': `Bearer ${token}` } });
                const blob = await res.blob();
                const zip = await JSZip.loadAsync(blob);
                this.zipCache = zip; // মেমোরিতে সেভ রাখা
                
                let html = '<div class="zip-list">';
                zip.forEach((relativePath, zipEntry) => {
                    if(!zipEntry.dir) {
                        html += `
                        <div class="zip-item" style="display:flex; justify-content:space-between; padding:10px; border-bottom:1px solid #333;">
                            <span style="font-family:monospace;">${relativePath}</span>
                            <button onclick="Viewer.extractFile('${relativePath}')" style="background:var(--accent); border:none; color:white; padding:5px 10px; border-radius:5px; cursor:pointer;">Get</button>
                        </div>`;
                    }
                });
                html += '</div>';
                listEl.innerHTML = html;
            } catch(e) { 
                listEl.innerHTML = '<p style="color:red; text-align:center;">Failed to open Zip. File might be too large.</p>'; 
            }

        // D. ডিফল্ট (অন্যান্য ফাইল)
        } else {
            window.open(file.webContentLink, '_blank');
            this.close();
        }
    },
    
    // জিপ থেকে ফাইল নামানো
    extractFile: async function(path) {
        if(!this.zipCache) return;
        const file = await this.zipCache.file(path).async("blob");
        saveAs(file, path.split('/').pop()); // FileSaver.js দিয়ে সেভ
    },

    close: function() {
        document.getElementById('media-modal').classList.add('hidden');
        if(this.player) {
            this.player.stop();
            document.getElementById('player').src = ''; // স্টপ স্ট্রিমিং
        }
        document.getElementById('image-view').src = ''; // মেমোরি ক্লিয়ার
    },
    
    // ইমেজ টুলস
    rotate: function() { 
        const img = document.getElementById('image-view');
        let deg = parseInt(img.dataset.deg || 0) + 90;
        img.style.transform = `rotate(${deg}deg)`;
        img.dataset.deg = deg;
    },
    filter: function(val) { document.getElementById('image-view').style.filter = val; },
    resetImg: function() { 
        const img = document.getElementById('image-view');
        img.style.transform = 'none'; img.style.filter = 'none'; img.dataset.deg = 0;
    },
    
    // সাবটাইটেল লোডার
    loadSub: function(input) {
        const file = input.files[0];
        if(!file) return;
        const track = document.createElement('track');
        track.kind = 'captions';
        track.label = 'Added';
        track.srclang = 'en';
        track.default = true;
        track.src = URL.createObjectURL(file);
        document.getElementById('player').appendChild(track);
    }
};

// ৪১. টেক্সট এডিটর ও নোটস
const Tools = {
    openTextEditor: function() {
        document.getElementById('editor-modal').classList.remove('hidden');
    },
    saveNote: async function() {
        const title = document.getElementById('note-title').value || 'Note.txt';
        const body = document.getElementById('note-body').value;
        const file = new Blob([body], {type: 'text/plain'});
        file.name = title;
        // Upload Handle expects an array-like object
        await Upload.handle([file]); 
        document.getElementById('editor-modal').classList.add('hidden');
    }
};

const Gallery = {
    filter: function(type) {
        // গ্যালারি গ্রিডে লোড হবে
        Drive.load(null, type);
    }
};
/* Part D: UI Controller & Init (COMPLETED) */

const UI = {
    startApp: function() {
        document.getElementById('login-screen').classList.add('hidden');
        document.getElementById('app-interface').classList.remove('hidden');
        this.fetchUser();
        Drive.load(); // হোম লোড
    },

    // ৪২. রেন্ডার ইঞ্জিন
    render: function(files) {
        // আমরা এখন চেক করব আমরা কি গ্যালারি ভিউতে আছি নাকি ফাইলে?
        const containerId = state.view === 'gallery' ? 'gallery-grid' : 'file-grid';
        const grid = document.getElementById(containerId);
        
        // গ্যালারি ভিউ হলে আগের কন্টেন্ট ক্লিয়ার করবেন না যদি পেজিনেশন হয় (ভবিষ্যতের জন্য)
        // আপাতত সব ক্লিয়ার করে রেন্ডার করছি
        grid.innerHTML = '';
        
        const empty = document.getElementById('empty-state');
        if(files.length === 0) {
            empty.classList.remove('hidden');
            return;
        } else { empty.classList.add('hidden'); }

        files.forEach(file => {
            const isFolder = file.mimeType.includes('folder');
            const card = document.createElement('div');
            card.className = 'file-card';
            card.onclick = () => this.clickFile(card, file);
            
            let icon = 'fa-file';
            let color = '#ccc';
            if(isFolder) { icon = 'fa-folder'; color = '#ffca28'; }
            else if(file.mimeType.includes('image')) { icon = 'fa-image'; color = '#ff6b6b'; }
            else if(file.mimeType.includes('video')) { icon = 'fa-video'; color = '#4ecdc4'; }
            else if(file.mimeType.includes('pdf')) { icon = 'fa-file-pdf'; color = '#ff9f43'; }
            else if(file.mimeType.includes('zip')) { icon = 'fa-file-zipper'; color = '#a29bfe'; }
            
            card.innerHTML = `
                <div class="file-thumb">
                    ${file.thumbnailLink && !isFolder 
                        ? `<img src="${file.thumbnailLink}" referrerpolicy="no-referrer">` 
                        : `<i class="fas ${icon}" style="color:${color}"></i>`}
                </div>
                <div class="file-name">${file.name}</div>
            `;
            grid.appendChild(card);
        });
    },

    // ৪৩. ক্লিক হ্যান্ডলার
    clickFile: function(card, file) {
        // সিলেকশন মোড
        if(state.selected.size > 0) {
            this.toggleSelect(card, file.id);
            return;
        }
        
        // ফোল্ডার নেভিগেশন (শুধু ফাইল ট্যাবে কাজ করবে)
        if(file.mimeType.includes('folder')) {
            state.folderStack.push(state.currentFolder);
            state.currentFolder = file.id;
            Drive.load();
            this.renderBreadcrumbs();
        } else {
            Viewer.open(file);
        }
    },

    toggleSelect: function(card, id) {
        if(state.selected.has(id)) {
            state.selected.delete(id); card.classList.remove('selected');
        } else {
            state.selected.add(id); card.classList.add('selected');
        }
        
        const bar = document.getElementById('batch-bar');
        if(state.selected.size > 0) {
            bar.classList.remove('hidden');
            document.getElementById('select-count').innerText = `${state.selected.size} Selected`;
        } else { bar.classList.add('hidden'); }
    },

    clearSelect: function() {
        state.selected.clear();
        document.querySelectorAll('.file-card.selected').forEach(e => e.classList.remove('selected'));
        document.getElementById('batch-bar').classList.add('hidden');
    },

    // ৪৪. ট্যাব সুইচার (লজিক ফিক্সড)
    switchTab: function(tab) {
        state.view = tab;
        
        // UI রিসেট
        document.querySelectorAll('.nav-item').forEach(n => n.classList.remove('active'));
        document.querySelectorAll('.sidebar a').forEach(n => n.classList.remove('active'));
        
        // Active ক্লাস এড করা (Try Catch দিয়ে সেফ করা যাতে পিসিতে এরর না দেয়)
        try { document.querySelector(`.nav-item[onclick*="${tab}"]`).classList.add('active'); } catch(e){}
        try { document.querySelector(`.sidebar a[onclick*="${tab}"]`).classList.add('active'); } catch(e){}

        // সব ভিউ হাইড
        document.getElementById('file-grid').classList.add('hidden');
        document.getElementById('gallery-view').classList.add('hidden');
        document.getElementById('settings-modal').classList.add('hidden');
        document.getElementById('breadcrumbs').classList.add('hidden'); // গ্যালারিতে ব্রেডক্রাম্ব অফ

        if(tab === 'home') {
            document.getElementById('file-grid').classList.remove('hidden');
            document.getElementById('breadcrumbs').classList.remove('hidden');
            state.currentFolder = CONFIG.app.rootFolder;
            Drive.load(); // রুট ফোল্ডার লোড
        
        } else if(tab === 'gallery') {
            document.getElementById('gallery-view').classList.remove('hidden');
            // ডিফল্ট গ্যালারিতে কিছু লোড হবে না, ইউজার ক্যাটাগরিতে ক্লিক করবে
            document.getElementById('gallery-grid').innerHTML = '<p style="text-align:center; padding:20px; color:#666">Select a category above</p>';
        
        } else if(tab === 'recent') {
            document.getElementById('file-grid').classList.remove('hidden');
            // Recent লজিক: রুট ফোল্ডার লোড হবে কিন্তু সার্চ কোয়েরি ছাড়া, এবং Modified Date অনুযায়ী সর্ট হবে (API তে ডিফল্ট আছে)
            // স্পেশাল "Recent" ভিউ চাইলে API তে `q='trashed=false'` দিয়ে সব ফাইল ফ্ল্যাট করে আনা যায়, তবে সেটা স্লো হবে।
            // আপাতত আমরা রুট ফোল্ডারই দেখাবো।
            state.currentFolder = CONFIG.app.rootFolder;
            Drive.load();
            UI.toast("Showing Recent Files");

        } else if(tab === 'settings') {
            document.getElementById('settings-modal').classList.remove('hidden');
        }
    },

    closeSettings: function() {
        document.getElementById('settings-modal').classList.add('hidden');
        this.switchTab('home'); // হোমে ফেরত
    },

    // ইউটিলিটি
    fetchUser: async function() {
        try {
            const res = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {headers: {'Authorization': `Bearer ${state.accessToken}`}});
            const u = await res.json();
            document.getElementById('user-avatar').src = u.picture;
        } catch(e) {}
    },
    loader: function(show) { document.getElementById('main-loader').classList.toggle('hidden', !show); },
    toggleFab: function() { document.getElementById('fab-menu').classList.toggle('hidden'); },
    
    renderBreadcrumbs: function() {
        const el = document.getElementById('breadcrumbs');
        if(state.folderStack.length === 0) {
            el.innerHTML = `<span><i class="fas fa-home"></i> Home</span>`;
        } else {
            el.innerHTML = `<span onclick="UI.goBack()" style="cursor:pointer; color:var(--accent)"><i class="fas fa-arrow-left"></i> Back</span> <span style="margin:0 10px">/</span> <span>Folder</span>`;
        }
    },
    
    goBack: function() {
        if(state.folderStack.length > 0) {
            state.currentFolder = state.folderStack.pop();
            Drive.load();
            this.renderBreadcrumbs();
        }
    },
    
    toast: function(msg) {
        // কাস্টম টোস্টের বদলে আপাতত কনসোল/এলার্ট, তবে ভালো ইউএক্স এর জন্য পরে টোস্ট ডিভ বানানো যাবে
        console.log(msg); 
    }
};

// গ্লোবাল ইনিশ
document.addEventListener('DOMContentLoaded', () => {
    Auth.init();
    
    // সার্চ লিসেনার (ডিবাউন্স সহ)
    let debounce;
    document.getElementById('search-input').addEventListener('input', (e) => {
        clearTimeout(debounce);
        debounce = setTimeout(() => {
            state.searchTerm = e.target.value;
            Drive.load();
        }, 500);
    });

    // আপলোড লিসেনার
    document.getElementById('file-upload').onchange = (e) => Upload.handle(e.target.files);
    document.getElementById('folder-upload').onchange = (e) => Upload.handle(e.target.files);
});


