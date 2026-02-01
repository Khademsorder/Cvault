// debug.js - FINAL ULTIMATE VERSION (V5)
// Features: Force Visible Button + Expert Tools (Network, Inspector, Storage)
// =========================================

(function() {
    'use strict';

    // 1. Initialize on Load
    if (document.readyState === 'complete') {
        initDebug();
    } else {
        window.addEventListener('load', initDebug);
    }

    const debugState = {
        logs: [],
        isInspectorActive: false
    };

    function initDebug() {
        console.log('🚀 Final Debugger V5 Loaded');
        createUI();
        overrideConsole();
        interceptNetwork();
        setupGlobalErrors();
    }

    // =========================================
    // 1. FORCE VISIBLE UI (From V4 Fix)
    // =========================================
    function createUI() {
        // Remove old instances
        if(document.getElementById('dbg-root')) document.getElementById('dbg-root').remove();

        // Root Container
        const root = document.createElement('div');
        root.id = 'dbg-root';
        document.documentElement.appendChild(root);

        // A. Floating Button (High Visibility)
        const btn = document.createElement('div');
        btn.innerHTML = '🐛';
        btn.style.cssText = `
            position: fixed !important;
            top: 15px !important;
            right: 15px !important;
            width: 45px !important;
            height: 45px !important;
            background: #111 !important;
            color: #00e676 !important;
            border: 2px solid #00e676 !important;
            border-radius: 50% !important;
            font-size: 24px !important;
            display: flex !important;
            align-items: center !important;
            justify-content: center !important;
            z-index: 2147483647 !important;
            cursor: pointer !important;
            box-shadow: 0 0 15px rgba(0,255,0,0.4) !important;
        `;
        btn.onclick = toggleWindow;
        root.appendChild(btn);

        // B. Console Window (Expert Features)
        const win = document.createElement('div');
        win.id = 'dbg-win';
        win.style.cssText = `
            position: fixed !important;
            top: 70px !important;
            left: 5% !important;
            width: 90% !important;
            height: 60vh !important;
            background: rgba(10,10,10,0.98) !important;
            border: 1px solid #333 !important;
            border-radius: 8px !important;
            z-index: 2147483646 !important;
            display: none;
            flex-direction: column !important;
            font-family: monospace !important;
            box-shadow: 0 10px 40px rgba(0,0,0,0.9) !important;
        `;

        win.innerHTML = `
            <div style="padding:10px; background:#1a1a1a; border-bottom:1px solid #333; display:flex; justify-content:space-between; align-items:center;">
                <span style="color:#00e676; font-weight:bold;">🛠️ Expert Debug</span>
                <div style="display:flex; gap:5px;">
                    <button id="btn-inspect" onclick="window.toggleInspector()" style="background:#333; color:#fff; border:1px solid #555; border-radius:4px; padding:3px 8px; font-size:10px;">🕵️ Inspect</button>
                    <button onclick="window.copyLogs()" style="background:#2979ff; color:#fff; border:none; border-radius:4px; padding:3px 8px; font-size:10px;">📋 Copy AI</button>
                    <button onclick="window.toggleWindow()" style="background:#d32f2f; color:#fff; border:none; border-radius:4px; padding:3px 8px; font-size:10px;">✕</button>
                </div>
            </div>

            <div style="display:flex; background:#000; border-bottom:1px solid #333;">
                <button onclick="window.switchTab('console')" id="tab-console" style="flex:1; padding:8px; background:none; border:none; color:#00e676; border-bottom:2px solid #00e676;">Log</button>
                <button onclick="window.switchTab('network')" id="tab-network" style="flex:1; padding:8px; background:none; border:none; color:#888;">Net</button>
                <button onclick="window.switchTab('storage')" id="tab-storage" style="flex:1; padding:8px; background:none; border:none; color:#888;">Store</button>
            </div>

            <div id="view-console" style="flex:1; overflow-y:auto; padding:10px; color:#fff; font-size:11px;"></div>
            <div id="view-network" style="flex:1; overflow-y:auto; padding:10px; color:#fff; font-size:11px; display:none;"></div>
            <div id="view-storage" style="flex:1; overflow-y:auto; padding:10px; color:#fff; font-size:11px; display:none;"></div>

            <div style="padding:8px; border-top:1px solid #333; background:#111;">
                <input id="dbg-input" placeholder="> Run JS Code..." style="width:100%; background:transparent; border:none; color:#00e676; font-family:monospace; outline:none;">
            </div>
        `;
        root.appendChild(win);

        // Global Handlers
        window.toggleWindow = () => {
            const w = document.getElementById('dbg-win');
            w.style.display = w.style.display === 'none' ? 'flex' : 'none';
        };

        window.switchTab = (tab) => {
            ['console','network','storage'].forEach(t => {
                document.getElementById(`view-${t}`).style.display = 'none';
                document.getElementById(`tab-${t}`).style.color = '#888';
                document.getElementById(`tab-${t}`).style.borderBottom = 'none';
            });
            document.getElementById(`view-${tab}`).style.display = 'block';
            document.getElementById(`tab-${tab}`).style.color = '#00e676';
            document.getElementById(`tab-${tab}`).style.borderBottom = '2px solid #00e676';
            if(tab === 'storage') updateStorage();
        };

        window.copyLogs = () => {
            const txt = debugState.logs.map(l => `[${l.time}] ${l.type}: ${l.msg}`).join('\n');
            navigator.clipboard.writeText(txt).then(() => alert('✅ Copied logs for AI!'));
        };

        window.toggleInspector = () => {
            debugState.isInspectorActive = !debugState.isInspectorActive;
            const btn = document.getElementById('btn-inspect');
            if(debugState.isInspectorActive) {
                btn.style.background = '#00e676';
                window.toggleWindow(); // Hide console to see screen
                document.addEventListener('click', inspectHandler, true);
            } else {
                btn.style.background = '#333';
                document.removeEventListener('click', inspectHandler, true);
            }
        };

        // Input Handler
        document.getElementById('dbg-input').addEventListener('keydown', (e) => {
            if(e.key === 'Enter') {
                console.log(`> ${e.target.value}`);
                try { console.log(eval(e.target.value)); } catch(err) { console.error(err.message); }
                e.target.value = '';
            }
        });
    }

    // =========================================
    // 2. CORE FEATURES
    // =========================================
    
    // A. Inspector Logic
    function inspectHandler(e) {
        e.preventDefault();
        e.stopPropagation();
        const el = e.target;
        console.log(`🔍 INSPECT: <${el.tagName.toLowerCase()}> Class: ".${el.className}" ID: "#${el.id}"`);
        
        // Visual Feedback
        const oldOutline = el.style.outline;
        el.style.outline = '3px solid #ff5252';
        setTimeout(() => el.style.outline = oldOutline, 1500);
        
        window.toggleInspector(); // Turn off
        window.toggleWindow(); // Show console again
    }

    // B. Console Override (With Stack Trace)
    function overrideConsole() {
        const methods = ['log', 'error', 'warn', 'info'];
        methods.forEach(m => {
            const old = console[m];
            console[m] = (...args) => {
                old.apply(console, args);
                addLog(m, args);
            };
        });
    }

    function addLog(type, args) {
        const time = new Date().toLocaleTimeString().split(' ')[0];
        const msg = args.map(a => typeof a === 'object' ? JSON.stringify(a) : String(a)).join(' ');
        debugState.logs.push({time, type, msg});

        const row = document.createElement('div');
        const color = type === 'error' ? '#ff5252' : (type === 'warn' ? '#ffab40' : '#fff');
        row.style.cssText = `border-bottom:1px solid #222; padding:3px 0; color:${color}; word-break:break-all;`;
        row.innerHTML = `<span style="color:#666; font-size:9px;">${time}</span> ${msg}`;
        
        const view = document.getElementById('view-console');
        if(view) {
            view.appendChild(row);
            view.scrollTop = view.scrollHeight;
        }
    }

    // C. Network Monitor
    function interceptNetwork() {
        const originalFetch = window.fetch;
        window.fetch = async (...args) => {
            const url = args[0].toString().split('?')[0].split('/').pop(); // Short URL
            addNetLog('⏳', url, '#ffab40');
            try {
                const res = await originalFetch(...args);
                addNetLog(res.status, url, res.ok ? '#00e676' : '#ff5252');
                return res;
            } catch(e) {
                addNetLog('ERR', url, '#ff5252');
                throw e;
            }
        };
    }

    function addNetLog(status, url, color) {
        const div = document.createElement('div');
        div.style.cssText = `display:flex; justify-content:space-between; border-bottom:1px solid #222; padding:4px 0;`;
        div.innerHTML = `<span style="color:${color}; font-weight:bold;">${status}</span> <span style="color:#aaa;">${url}</span>`;
        const view = document.getElementById('view-network');
        if(view) view.appendChild(div);
    }

    // D. Storage Viewer
    function updateStorage() {
        const view = document.getElementById('view-storage');
        view.innerHTML = '';
        if(localStorage.length === 0) {
            view.innerHTML = '<i style="color:#666">LocalStorage Empty</i>';
            return;
        }
        for(let i=0; i<localStorage.length; i++) {
            const k = localStorage.key(i);
            const v = localStorage.getItem(k);
            view.innerHTML += `<div style="border-bottom:1px solid #333; padding:4px 0;"><b style="color:#be93f9">${k}:</b> <span style="color:#f1fa8c">${v.substring(0,30)}</span></div>`;
        }
    }

    // E. Error Trapping
    function setupGlobalErrors() {
        window.onerror = (msg, url, line) => {
            console.error(`💥 CRASH: ${msg} (${line})`);
        };
    }

})();
