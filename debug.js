// === SUPER DEBUG.js ===
// Save as debug.js and include in your app

class SuperDebug {
    constructor() {
        this.logs = [];
        this.maxLogs = 500;
        this.startTime = Date.now();
        this.init();
    }
    
    init() {
        console.log('🚀 SuperDebug Activated');
        
        // 1. HOOK EVERYTHING
        this.hookConsole();
        this.hookErrors();
        this.hookNetwork();
        this.hookStorage();
        this.hookMediaViewer();
        this.createUI();
        
        // Auto-diagnose
        setTimeout(() => this.autoDiagnose(), 2000);
    }
    
    hookConsole() {
        const methods = ['log', 'error', 'warn', 'info', 'debug'];
        methods.forEach(method => {
            const original = console[method];
            console[method] = (...args) => {
                // Store log
                this.logs.push({
                    type: method,
                    args,
                    time: Date.now() - this.startTime,
                    stack: new Error().stack
                });
                
                // Keep limited
                if (this.logs.length > this.maxLogs) this.logs.shift();
                
                // Call original
                original.apply(console, args);
                
                // Update UI
                this.updateUI();
            };
        });
    }
    
    hookErrors() {
        // Global error handler
        window.addEventListener('error', (e) => {
            this.logs.push({
                type: 'GLOBAL_ERROR',
                args: [e.message, `at ${e.filename}:${e.lineno}`],
                time: Date.now() - this.startTime,
                fatal: true
            });
            
            // Auto-fix common errors
            this.autoFixError(e);
        });
        
        // Promise errors
        window.addEventListener('unhandledrejection', (e) => {
            this.logs.push({
                type: 'PROMISE_ERROR',
                args: [e.reason],
                time: Date.now() - this.startTime
            });
        });
    }
    
    hookNetwork() {
        // Hook Fetch
        const originalFetch = window.fetch;
        window.fetch = async (...args) => {
            const url = args[0];
            const method = args[1]?.method || 'GET';
            const start = Date.now();
            
            this.logs.push({
                type: 'NETWORK_REQUEST',
                args: [`🌐 ${method} ${url}`, args[1]?.body],
                time: Date.now() - this.startTime
            });
            
            try {
                const response = await originalFetch.apply(this, args);
                const duration = Date.now() - start;
                
                this.logs.push({
                    type: 'NETWORK_RESPONSE',
                    args: [`✅ ${url} → ${response.status} (${duration}ms)`],
                    time: Date.now() - this.startTime
                });
                
                return response;
            } catch (error) {
                this.logs.push({
                    type: 'NETWORK_ERROR',
                    args: [`❌ ${url} → ${error.message}`],
                    time: Date.now() - this.startTime
                });
                throw error;
            }
        };
        
        // Hook XHR
        const originalXHR = window.XMLHttpRequest.prototype.open;
        window.XMLHttpRequest.prototype.open = function(method, url) {
            this._debugData = { method, url, start: Date.now() };
            return originalXHR.apply(this, arguments);
        };
        
        window.XMLHttpRequest.prototype.send = function(data) {
            this.addEventListener('load', () => {
                const duration = Date.now() - this._debugData.start;
                this.logs.push({
                    type: 'XHR_RESPONSE',
                    args: [`📡 ${this._debugData.method} ${this._debugData.url} → ${this.status} (${duration}ms)`],
                    time: Date.now() - this.startTime
                });
            });
            
            this.addEventListener('error', (e) => {
                this.logs.push({
                    type: 'XHR_ERROR',
                    args: [`💥 ${this._debugData.method} ${this._debugData.url} → ${e.type}`],
                    time: Date.now() - this.startTime
                });
            });
            
            return XMLHttpRequest.prototype.send.apply(this, [data]);
        };
    }
    
    hookMediaViewer() {
        // Monitor MediaViewer loading
        let checkCount = 0;
        const checkInterval = setInterval(() => {
            checkCount++;
            
            if (window.MediaViewer) {
                this.logs.push({
                    type: 'MEDIAVIEWER_LOADED',
                    args: ['✅ MediaViewer loaded after', checkCount * 100 + 'ms'],
                    time: Date.now() - this.startTime
                });
                
                // Check methods
                const methods = Object.getOwnPropertyNames(MediaViewer);
                this.logs.push({
                    type: 'MEDIAVIEWER_METHODS',
                    args: ['🔧 Methods:', methods.join(', ')],
                    time: Date.now() - this.startTime
                });
                
                // Fix if openImage missing
                if (typeof MediaViewer.openImage !== 'function') {
                    this.fixMediaViewer();
                }
                
                clearInterval(checkInterval);
            }
            
            if (checkCount > 50) { // 5 seconds
                this.logs.push({
                    type: 'MEDIAVIEWER_TIMEOUT',
                    args: ['❌ MediaViewer never loaded!'],
                    time: Date.now() - this.startTime,
                    fatal: true
                });
                clearInterval(checkInterval);
                
                // Create emergency MediaViewer
                this.createEmergencyMediaViewer();
            }
        }, 100);
        
        // Hook MediaViewer calls
        const originalOpenImage = MediaViewer?.openImage;
        if (MediaViewer && originalOpenImage) {
            MediaViewer.openImage = function(...args) {
                this.logs.push({
                    type: 'MEDIAVIEWER_CALL',
                    args: ['🖼️ openImage called with:', args[0]],
                    time: Date.now() - this.startTime
                });
                
                try {
                    return originalOpenImage.apply(MediaViewer, args);
                } catch (error) {
                    this.logs.push({
                        type: 'MEDIAVIEWER_ERROR',
                        args: ['💥 openImage failed:', error.message],
                        time: Date.now() - this.startTime
                    });
                    
                    // Fallback
                    window.open(args[0], '_blank');
                    return null;
                }
            };
        }
    }
    
    fixMediaViewer() {
        console.log('🔧 Attempting to fix MediaViewer...');
        
        // Method 1: Check for alternative method names
        const methods = Object.getOwnPropertyNames(MediaViewer);
        const possibleNames = ['open', 'show', 'view', 'display', 'openImage', 'showImage'];
        
        for (const name of possibleNames) {
            if (typeof MediaViewer[name] === 'function') {
                MediaViewer.openImage = MediaViewer[name];
                this.logs.push({
                    type: 'MEDIAVIEWER_FIXED',
                    args: [`✅ Fixed! Using ${name} instead of openImage`],
                    time: Date.now() - this.startTime
                });
                return;
            }
        }
        
        // Method 2: Create openImage method
        MediaViewer.openImage = function(url) {
            console.log('🖼️ [FALLBACK] Opening image:', url);
            
            // Try multiple ways to open
            try {
                // Method A: Simple image viewer
                const win = window.open('', '_blank');
                win.document.write(`
                    <html>
                    <head><title>Image Viewer</title></head>
                    <body style="margin:0;background:#000;">
                        <img src="${url}" style="max-width:100%;height:auto;">
                    </body>
                    </html>
                `);
            } catch (e) {
                // Method B: Data URL
                fetch(url)
                    .then(r => r.blob())
                    .then(blob => {
                        const reader = new FileReader();
                        reader.onload = () => {
                            const img = new Image();
                            img.src = reader.result;
                            img.style = 'position:fixed;top:0;left:0;width:100%;height:100%;object-fit:contain;';
                            document.body.appendChild(img);
                        };
                        reader.readAsDataURL(blob);
                    });
            }
        };
        
        this.logs.push({
            type: 'MEDIAVIEWER_CREATED',
            args: ['✅ Created fallback openImage method'],
            time: Date.now() - this.startTime
        });
    }
    
    createEmergencyMediaViewer() {
        window.MediaViewer = window.MediaViewer || {};
        window.MediaViewer.openImage = function(url) {
            alert(`Opening: ${url}\n\nThis is emergency viewer.`);
            window.open(url, '_blank');
        };
        
        this.logs.push({
            type: 'EMERGENCY_VIEWER',
            args: ['⚠️ Created emergency MediaViewer'],
            time: Date.now() - this.startTime
        });
    }
    
    autoDiagnose() {
        console.log('🔍 Running auto-diagnosis...');
        
        const issues = [];
        
        // Check 1: MediaViewer
        if (!window.MediaViewer) {
            issues.push('❌ MediaViewer not loaded');
        } else if (typeof MediaViewer.openImage !== 'function') {
            issues.push('❌ MediaViewer.openImage is not a function');
        }
        
        // Check 2: Script loading order
        const scripts = Array.from(document.scripts);
        const driveIndex = scripts.findIndex(s => s.src.includes('drive.js'));
        const mediaIndex = scripts.findIndex(s => s.src && 
            (s.src.includes('media') || s.src.includes('MediaViewer')));
        
        if (mediaIndex > -1 && driveIndex > -1 && mediaIndex > driveIndex) {
            issues.push('⚠️ MediaViewer loads AFTER drive.js (wrong order)');
        }
        
        // Check 3: Network status
        if (!navigator.onLine) {
            issues.push('⚠️ App is offline');
        }
        
        // Log diagnosis
        if (issues.length > 0) {
            this.logs.push({
                type: 'DIAGNOSIS',
                args: ['🏥 Issues found:', ...issues],
                time: Date.now() - this.startTime
            });
            
            // Show in UI
            this.showNotification(`Found ${issues.length} issues`);
        } else {
            this.logs.push({
                type: 'DIAGNOSIS',
                args: ['✅ All systems OK'],
                time: Date.now() - this.startTime
            });
        }
    }
    
    autoFixError(error) {
        const msg = error.message.toLowerCase();
        
        // Fix MediaViewer.openImage error
        if (msg.includes('mediaviewer.openimage') || 
            msg.includes('is not a function') && 
            msg.includes('drive.js:608')) {
            
            console.log('🛠️ Auto-fixing MediaViewer error...');
            
            // Immediate fix
            const code = `
                if (!window.MediaViewer) window.MediaViewer = {};
                if (typeof window.MediaViewer.openImage !== 'function') {
                    window.MediaViewer.openImage = function(url) {
                        console.log('Auto-fixed: Opening', url);
                        window.open(url, '_blank');
                    };
                }
            `;
            
            try {
                eval(code);
                this.showNotification('✅ Fixed MediaViewer automatically!');
            } catch (e) {
                console.error('Auto-fix failed:', e);
            }
        }
    }
    
    createUI() {
        // Create debug panel
        const panel = document.createElement('div');
        panel.id = 'superDebugPanel';
        panel.style = `
            position: fixed;
            bottom: 10px;
            right: 10px;
            background: rgba(0,0,0,0.9);
            color: white;
            padding: 10px;
            border-radius: 10px;
            max-width: 400px;
            max-height: 300px;
            overflow-y: auto;
            font-family: monospace;
            font-size: 12px;
            z-index: 999999;
            border: 2px solid #00ff00;
            display: none;
        `;
        
        panel.innerHTML = `
            <div style="display:flex;justify-content:space-between;margin-bottom:5px;">
                <strong style="color:#00ff00;">🐛 SuperDebug</strong>
                <button onclick="document.getElementById('superDebugPanel').style.display='none'" 
                        style="background:red;color:white;border:none;padding:2px 8px;">X</button>
            </div>
            <div id="debugLogs"></div>
            <div style="margin-top:10px;border-top:1px solid #333;padding-top:5px;">
                <button onclick="window.superDebug.exportLogs()" style="font-size:10px;padding:3px;">Export Logs</button>
                <button onclick="window.superDebug.clearLogs()" style="font-size:10px;padding:3px;">Clear</button>
                <button onclick="window.superDebug.runTests()" style="font-size:10px;padding:3px;">Test All</button>
            </div>
        `;
        
        document.body.appendChild(panel);
        
        // Create toggle button
        const toggle = document.createElement('button');
        toggle.id = 'debugToggle';
        toggle.style = `
            position: fixed;
            bottom: 10px;
            right: 10px;
            background: #00ff00;
            color: black;
            border: none;
            border-radius: 50%;
            width: 50px;
            height: 50px;
            font-size: 20px;
            cursor: pointer;
            z-index: 999999;
            box-shadow: 0 2px 10px rgba(0,255,0,0.5);
        `;
        toggle.innerHTML = '🐛';
        toggle.title = 'Debug Panel';
        toggle.onclick = () => {
            panel.style.display = panel.style.display === 'none' ? 'block' : 'none';
        };
        
        document.body.appendChild(toggle);
    }
    
    updateUI() {
        const logDiv = document.getElementById('debugLogs');
        if (!logDiv) return;
        
        // Show last 10 logs
        const lastLogs = this.logs.slice(-10);
        logDiv.innerHTML = lastLogs.map(log => `
            <div style="color:${
                log.type.includes('ERROR') ? '#ff5555' : 
                log.type.includes('NETWORK') ? '#55aaff' : 
                '#aaaaaa'
            }; margin: 2px 0; border-left: 3px solid ${
                log.fatal ? 'red' : 'gray'
            }; padding-left: 5px;">
                <small>[${log.time}ms]</small> ${log.args.join(' ')}
            </div>
        `).join('');
        
        logDiv.scrollTop = logDiv.scrollHeight;
    }
    
    showNotification(text) {
        const notif = document.createElement('div');
        notif.style = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: #333;
            color: white;
            padding: 10px 20px;
            border-radius: 5px;
            z-index: 999999;
            animation: fadeIn 0.3s;
        `;
        notif.textContent = text;
        document.body.appendChild(notif);
        
        setTimeout(() => notif.remove(), 3000);
    }
    
    exportLogs() {
        const data = JSON.stringify(this.logs, null, 2);
        const blob = new Blob([data], {type: 'application/json'});
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `debug_logs_${Date.now()}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    }
    
    clearLogs() {
        this.logs = [];
        this.updateUI();
    }
    
    runTests() {
        console.log('🧪 Running diagnostic tests...');
        
        // Test 1: MediaViewer
        this.testMediaViewer();
        
        // Test 2: Network
        this.testNetwork();
        
        // Test 3: Storage
        this.testStorage();
        
        this.showNotification('Tests completed! Check console.');
    }
    
    testMediaViewer() {
        console.log('🧪 Testing MediaViewer...');
        
        if (!window.MediaViewer) {
            console.error('❌ MediaViewer not found');
            return;
        }
        
        console.log('✅ MediaViewer exists');
        console.log('📋 Methods:', Object.keys(MediaViewer));
        
        // Test openImage
        if (typeof MediaViewer.openImage === 'function') {
            console.log('✅ openImage is a function');
            
            // Test with dummy image
            setTimeout(() => {
                try {
                    MediaViewer.openImage('https://via.placeholder.com/100');
                    console.log('✅ MediaViewer test passed');
                } catch (e) {
                    console.error('❌ MediaViewer test failed:', e);
                }
            }, 1000);
        } else {
            console.error('❌ openImage is not a function');
        }
    }
    
    testNetwork() {
        console.log('🧪 Testing network...');
        
        // Test fetch
        fetch('https://httpbin.org/get')
            .then(() => console.log('✅ Network connectivity OK'))
            .catch(() => console.error('❌ Network connectivity failed'));
    }
    
    testStorage() {
        console.log('🧪 Testing storage...');
        
        try {
            localStorage.setItem('debug_test', Date.now());
            localStorage.removeItem('debug_test');
            console.log('✅ LocalStorage OK');
        } catch (e) {
            console.error('❌ LocalStorage failed:', e);
        }
    }
}

// Auto-start when included
if (typeof window !== 'undefined') {
    window.superDebug = new SuperDebug();
    
    // Make it globally available
    window.fixMediaViewer = function() {
        window.superDebug.fixMediaViewer();
    };
    
    window.getDebugReport = function() {
        return JSON.stringify(window.superDebug.logs, null, 2);
    };
}

// Export for module systems
if (typeof module !== 'undefined' && module.exports) {
    module.exports = SuperDebug;
}