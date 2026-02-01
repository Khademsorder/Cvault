// debug.js - ULTIMATE EXPERT EDITION (V3.0)
// =========================================
// Features: Stack Trace, Network, Live Input, Storage, DOM Inspector, AI Export
// =========================================

(function() {
    'use strict';
    
    // Auto-init
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initDebugTools);
    } else {
        setTimeout(initDebugTools, 1000);
    }
    
    const debugState = {
        isConsoleVisible: false,
        isInspectorActive: false,
        logs: []
    };
    
    function initDebugTools() {
        console.log('🚀 Ultimate Debug Tools V3.0 Loaded');
        createUI();
        overrideConsole();
        interceptNetworkRequests();
        initGlobalErrorHandlers();
    }
    
    // =========================================
    // 1. UI ARCHITECTURE
    // =========================================
    function createUI() {
        // A. Floating Button
        const btn = document.createElement('div');
        btn.id = 'dbg-btn';
        btn.innerHTML = '🐛';
        btn.style.cssText = `position:fixed; bottom:20px; right:20px; width:50px; height:50px; background:#111; color:#fff; border:2px solid #00e676; border-radius:50%; font-size:24px; display:flex; align-items:center; justify-content:center; z-index:999999; box-shadow:0 4px 15px rgba(0,0,0,0.6); cursor:pointer; transition:transform 0.2s;`;
        btn.onclick = toggleConsole;
        document.body.appendChild(btn);

        // B. Main Console Window
        const win = document.createElement('div');
        win.id = 'dbg-win';
        win.style.cssText = `position:fixed; bottom:80px; right:20px; width:90%; max-width:450px; height:60vh; background:rgba(10,10,10,0.98); border:1px solid #333; border-radius:12px; z-index:999998; display:none; flex-direction:column; font-family:'Courier New', monospace; color:#fff; box-shadow:0 10px 40px rgba(0,0,0,0.9); backdrop-filter:blur(5px);`;
        
        win.innerHTML = `
            <div style="padding:10px; background:#1a1a1a; border-bottom:1px solid #333; display:flex; justify-content:space-between; align-items:center;">
                <span style="color:#00e676; font-weight:bold; font-size:14px;">⚡ DevTools</span>
                <div style="display:flex; gap:5px;">
                    <button id="btn-inspect" onclick="toggleInspector()" style="background:#333; color:#fff; border:1px solid #555; padding:4px 8px; border-radius:4px; font-size:11px;">🕵️ Inspect</button>
                    <button onclick="copyAllLogs()" style="background:#2979ff; color:#fff; border:none; padding:4px 8px; border-radius:4px; font-size:11px;">📋 Copy for AI</button>
                    <button onclick="closeConsole()" style="background:#d32f2f; color:#fff; border:none; padding:4px 8px; border-radius:4px; font-size:11px;">✕</button>
                </div>
            </div>
            
            <div style="display:flex; background:#000; border-bottom:1px solid #333;">
                <button onclick="showTab('console')" id="tab-console" class="dbg-tab" style="flex:1; padding:10px; background:none; border:none; color:#00e676; border-bottom:2px solid #00e676;">Console</button>
                <button onclick="showTab('network')" id="tab-network" class="dbg-tab" style="flex:1; padding:10px; background:none; border:none; color:#888;">Network</button>
                <button onclick="showTab('system')" id="tab-system" class="dbg-tab" style="flex:1; padding:10px; background:none; border:none; color:#888;">System</button>
            </div>

            <div id="view-console" class="dbg-view" style="flex:1; overflow-y:auto; padding:10px; font-size:12px;"></div>
            <div id="view-network" class="dbg-view" style="flex:1; overflow-y:auto; padding:10px; font-size:12px; display:none;"></div>
            <div id="view-system" class="dbg-view" style="flex:1; overflow-y:auto; padding:10px; font-size:12px; display:none;"></div>

            <div style="padding:8px; border-top:1px solid #333; background:#1a1a1a; display:flex;">
                <span style="color:#00e676; margin-right:8px;">></span>
                <input id="dbg-cmd" type="text" placeholder="Run JS Code..." style="flex:1; background:transparent; border:none; color:#fff; outline:none; font-family:monospace;">
            </div>
        `;
        document.body.appendChild(win);

        // Input Listener
        document.getElementById('dbg-cmd').addEventListener('keydown', function(e) {
            if(e.key === 'Enter') { execCmd(this.value); this.value = ''; }
        });

        // Global functions for HTML onclick
        window.toggleConsole = () => {
            const el = document.getElementById('dbg-win');
            debugState.isConsoleVisible = !debugState.isConsoleVisible;
            el.style.display = debugState.isConsoleVisible ? 'flex' : 'none';
            if(debugState.isConsoleVisible) refreshSystemTab();
        };
        window.closeConsole = () => {
             document.getElementById('dbg-win').style.display = 'none';
             debugState.isConsoleVisible = false;
        };
        window.showTab = (name) => {
            ['console','network','system'].forEach(t => {
                document.getElementById(`view-${t}`).style.display = 'none';
                document.getElementById(`tab-${t}`).style.style = 'flex:1; padding:10px; background:none; border:none; color:#888;';
            });
            document.getElementById(`view-${name}`).style.display = 'block';
            const tab = document.getElementById(`tab-${name}`);
            tab.style.color = '#00e676';
            tab.style.borderBottom = '2px solid #00e676';
        };
        
        // Inspector & Export
        window.toggleInspector = initInspectorMode;
        window.copyAllLogs = () => {
            const text = debugState.logs.map(l => `[${l.time}] ${l.type.toUpperCase()}: ${l.msg}`).join('\n');
            navigator.clipboard.writeText(text).then(() => alert('✅ Logs Copied! Paste to AI now.'));
        };
    }

    // =========================================
    // 2. CONSOLE & ERROR HANDLING
    // =========================================
    function overrideConsole() {
        const methods = ['log', 'error', 'warn', 'info'];
        methods.forEach(method => {
            const original = console[method];
            console[method] = (...args) => {
                original.apply(console, args);
                logToUI(method, args);
            };
        });
    }
    
    function initGlobalErrorHandlers() {
        window.onerror = (msg, url, line) => {
            console.error(`CRASH: ${msg}`, `(${url.split('/').pop()}:${line})`);
        };
        window.onunhandledrejection = (e) => {
            console.error(`PROMISE FAIL: ${e.reason}`);
        };
    }

    function logToUI(type, args) {
        const time = new Date().toLocaleTimeString('en-US', {hour12:false});
        // Convert args to clean string
        const msg = args.map(a => {
            if(a instanceof HTMLElement) return `<${a.tagName.toLowerCase()} class="${a.className}">`;
            if(typeof a === 'object') return JSON.stringify(a);
            return String(a);
        }).join(' ');

        // Save to memory
        debugState.logs.push({time, type, msg});

        // Render
        const color = type === 'error' ? '#ff5252' : (type === 'warn' ? '#ffab40' : '#fff');
        const row = document.createElement('div');
        row.style.cssText = `border-bottom:1px solid #222; padding:4px 0; color:${color}; word-break:break-all;`;
        row.innerHTML = `<span style="color:#555; font-size:10px; margin-right:5px;">${time}</span>${msg}`;
        
        const container = document.getElementById('view-console');
        if(container) {
            container.appendChild(row);
            container.scrollTop = container.scrollHeight;
        }
        
        if(type === 'error') document.getElementById('dbg-btn').style.borderColor = '#ff5252';
    }

    // =========================================
    // 3. DOM INSPECTOR (New Feature)
    // =========================================
    function initInspectorMode() {
        debugState.isInspectorActive = !debugState.isInspectorActive;
        const btn = document.getElementById('btn-inspect');
        
        if(debugState.isInspectorActive) {
            btn.style.background = '#00e676';
            btn.innerText = 'Tap Element';
            closeConsole();
            
            // Add global click listener
            document.body.addEventListener('click', inspectorHandler, true);
        } else {
            btn.style.background = '#333';
            btn.innerText = '🕵️ Inspect';
            document.body.removeEventListener('click', inspectorHandler, true);
        }
    }
    
    function inspectorHandler(e) {
        e.preventDefault();
        e.stopPropagation();
        
        const el = e.target;
        const rect = el.getBoundingClientRect();
        
        // Log details
        console.log('--- INSPECTED ELEMENT ---');
        console.log('Tag:', el.tagName);
        console.log('Classes:', el.className);
        console.log('Size:', `${Math.round(rect.width)}px x ${Math.round(rect.height)}px`);
        console.log('Content:', el.innerText.substring(0, 20) + '...');
        
        // Highlight effect
        const prevOutline = el.style.outline;
        el.style.outline = '2px solid #ff5252';
        setTimeout(() => el.style.outline = prevOutline, 1000);
        
        // Disable inspector
        initInspectorMode(); 
        toggleConsole(); // Re-open console
    }

    // =========================================
    // 4. NETWORK & SYSTEM
    // =========================================
    function interceptNetworkRequests() {
        const origFetch = window.fetch;
        window.fetch = async (...args) => {
            const url = args[0].toString().split('?')[0]; // Clean URL
            logNet('⏳', url, '#ffab40');
            try {
                const res = await origFetch(...args);
                logNet(res.status, url, res.ok ? '#00e676' : '#ff5252');
                return res;
            } catch (err) {
                logNet('ERR', url, '#ff5252');
                throw err;
            }
        };
    }

    function logNet(status, url, color) {
        const div = document.createElement('div');
        div.style.cssText = `padding:5px 0; border-bottom:1px solid #222; display:flex; justify-content:space-between;`;
        div.innerHTML = `<span style="color:${color}; font-weight:bold;">${status}</span><span style="color:#aaa; font-size:11px; margin-left:10px;">${url.substring(url.length-25)}</span>`;
        document.getElementById('view-network').appendChild(div);
    }

    function refreshSystemTab() {
        const info = {
            'Screen': `${window.innerWidth} x ${window.innerHeight}`,
            'User Agent': navigator.userAgent,
            'Platform': navigator.platform,
            'Language': navigator.language,
            'Memory': navigator.deviceMemory ? `${navigator.deviceMemory} GB` : 'N/A',
            'Cores': navigator.hardwareConcurrency || 'N/A'
        };
        
        let html = '';
        for(let key in info) {
            html += `<div style="padding:5px; border-bottom:1px solid #222;"><b style="color:#00e676;">${key}:</b> <span style="color:#fff;">${info[key]}</span></div>`;
        }
        document.getElementById('view-system').innerHTML = html;
    }

    function execCmd(val) {
        try {
            console.log(`> ${val}`);
            console.log(eval(val));
        } catch(e) {
            console.error(e.message);
        }
    }

})();
