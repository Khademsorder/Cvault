// === SUPER DEBUG.js === 
// Save as debug.js and include in your app

// WAIT for page to load COMPLETELY
function initSuperDebug() {
    // Check if already loaded
    if (window.superDebug) {
        console.log('✅ SuperDebug already loaded');
        return;
    }
    
    class SuperDebug {
        constructor() {
            this.logs = [];
            this.maxLogs = 200; // Reduced for phone
            this.startTime = Date.now();
            
            console.log('🚀 SuperDebug Activated');
            
            // Start after a small delay
            setTimeout(() => this.init(), 100);
        }
        
        init() {
            try {
                // 1. HOOK EVERYTHING
                this.hookConsole();
                this.hookErrors();
                this.hookNetwork();
                this.hookMediaViewer();
                
                // Create UI after DOM is ready
                if (document.body) {
                    this.createUI();
                } else {
                    document.addEventListener('DOMContentLoaded', () => this.createUI());
                }
                
                // Auto-diagnose after everything loads
                setTimeout(() => this.autoDiagnose(), 3000);
                
            } catch (error) {
                console.error('❌ SuperDebug init failed:', error);
            }
        }
        
        hookConsole() {
            try {
                const methods = ['log', 'error', 'warn', 'info'];
                methods.forEach(method => {
                    if (!console[method]) return;
                    
                    const original = console[method];
                    console[method] = (...args) => {
                        // Store log
                        this.logs.push({
                            type: method.toUpperCase(),
                            args: args.map(a => 
                                typeof a === 'object' ? JSON.stringify(a).substring(0, 100) : String(a)
                            ),
                            time: Date.now() - this.startTime
                        });
                        
                        // Keep limited
                        if (this.logs.length > this.maxLogs) this.logs.shift();
                        
                        // Call original
                        try {
                            original.apply(console, args);
                        } catch (e) {}
                        
                        // Update UI
                        this.updateUI();
                    };
                });
            } catch (error) {
                console.error('Hook console failed:', error);
            }
        }
        
        hookErrors() {
            try {
                // Global error handler
                window.addEventListener('error', (e) => {
                    this.logs.push({
                        type: 'GLOBAL_ERROR',
                        args: [e.message, `at ${e.filename}:${e.lineno}`],
                        time: Date.now() - this.startTime
                    });
                    
                    // Auto-fix common errors
                    this.autoFixError(e);
                    this.updateUI();
                });
                
                // Promise errors
                window.addEventListener('unhandledrejection', (e) => {
                    this.logs.push({
                        type: 'PROMISE_ERROR',
                        args: [String(e.reason)],
                        time: Date.now() - this.startTime
                    });
                    this.updateUI();
                });
            } catch (error) {
                console.error('Hook errors failed:', error);
            }
        }
        
        hookNetwork() {
            try {
                // Hook Fetch if available
                if (window.fetch) {
                    const originalFetch = window.fetch;
                    window.fetch = async (...args) => {
                        const url = args[0] || '';
                        const method = args[1]?.method || 'GET';
                        
                        this.logs.push({
                            type: 'NETWORK',
                            args: [`🌐 ${method} ${url}`],
                            time: Date.now() - this.startTime
                        });
                        this.updateUI();
                        
                        try {
                            const response = await originalFetch.apply(this, args);
                            
                            this.logs.push({
                                type: 'NETWORK',
                                args: [`✅ ${url} → ${response.status}`],
                                time: Date.now() - this.startTime
                            });
                            this.updateUI();
                            
                            return response;
                        } catch (error) {
                            this.logs.push({
                                type: 'ERROR',
                                args: [`❌ ${url} → ${error.message}`],
                                time: Date.now() - this.startTime
                            });
                            this.updateUI();
                            throw error;
                        }
                    };
                }
            } catch (error) {
                console.error('Hook network failed:', error);
            }
        }
        
        hookMediaViewer() {
            try {
                // Check if MediaViewer already exists
                if (window.MediaViewer) {
                    this.checkAndFixMediaViewer();
                } else {
                    // Wait for MediaViewer to load
                    let attempts = 0;
                    const checkInterval = setInterval(() => {
                        attempts++;
                        
                        if (window.MediaViewer) {
                            this.checkAndFixMediaViewer();
                            clearInterval(checkInterval);
                        }
                        
                        if (attempts > 30) { // 3 seconds
                            clearInterval(checkInterval);
                            this.logs.push({
                                type: 'WARN',
                                args: ['⚠️ MediaViewer not found after 3s'],
                                time: Date.now() - this.startTime
                            });
                            this.createEmergencyMediaViewer();
                        }
                    }, 100);
                }
            } catch (error) {
                console.error('Hook MediaViewer failed:', error);
            }
        }
        
        checkAndFixMediaViewer() {
            this.logs.push({
                type: 'INFO',
                args: ['✅ MediaViewer loaded'],
                time: Date.now() - this.startTime
            });
            
            // Check methods
            const methods = Object.keys(window.MediaViewer);
            this.logs.push({
                type: 'INFO',
                args: ['🔧 Methods:', methods.join(', ')],
                time: Date.now() - this.startTime
            });
            
            // Fix openImage if missing
            if (typeof window.MediaViewer.openImage !== 'function') {
                this.fixMediaViewer();
            }
        }
        
        fixMediaViewer() {
            console.log('🔧 Fixing MediaViewer...');
            
            // Try to find alternative method
            const methods = Object.keys(window.MediaViewer);
            const altMethods = methods.filter(m => 
                m.includes('open') || m.includes('show') || m.includes('image')
            );
            
            if (altMethods.length > 0) {
                // Use existing method
                window.MediaViewer.openImage = window.MediaViewer[altMethods[0]];
                this.logs.push({
                    type: 'SUCCESS',
                    args: [`✅ Using ${altMethods[0]} as openImage`],
                    time: Date.now() - this.startTime
                });
            } else {
                // Create new method
                window.MediaViewer.openImage = function(url) {
                    console.log('🖼️ [FALLBACK] Opening:', url);
                    try {
                        window.open(url, '_blank');
                    } catch (e) {
                        // If popup blocked, show in page
                        const img = document.createElement('img');
                        img.src = url;
                        img.style.cssText = `
                            position: fixed;
                            top: 50%;
                            left: 50%;
                            transform: translate(-50%, -50%);
                            max-width: 90%;
                            max-height: 90%;
                            z-index: 99999;
                            background: white;
                            padding: 10px;
                            box-shadow: 0 0 20px rgba(0,0,0,0.5);
                        `;
                        img.onclick = () => img.remove();
                        document.body.appendChild(img);
                    }
                };
                
                this.logs.push({
                    type: 'SUCCESS',
                    args: ['✅ Created fallback openImage'],
                    time: Date.now() - this.startTime
                });
            }
            
            this.updateUI();
            this.showNotification('MediaViewer fixed!');
        }
        
        createEmergencyMediaViewer() {
            window.MediaViewer = window.MediaViewer || {};
            window.MediaViewer.openImage = function(url) {
                alert(`Opening: ${url}\n(Using emergency viewer)`);
                window.open(url, '_blank');
            };
            
            this.logs.push({
                type: 'WARN',
                args: ['⚠️ Created emergency MediaViewer'],
                time: Date.now() - this.startTime
            });
        }
        
        autoDiagnose() {
            console.log('🔍 Auto-diagnosing...');
            
            const issues = [];
            
            // Check MediaViewer
            if (!window.MediaViewer) {
                issues.push('MediaViewer missing');
            } else if (typeof window.MediaViewer.openImage !== 'function') {
                issues.push('openImage not a function');
            }
            
            // Check network
            if (!navigator.onLine) {
                issues.push('Offline');
            }
            
            if (issues.length > 0) {
                this.logs.push({
                    type: 'DIAGNOSIS',
                    args: ['🏥 Issues:', ...issues],
                    time: Date.now() - this.startTime
                });
                this.showNotification(`Found ${issues.length} issues`);
            } else {
                this.logs.push({
                    type: 'DIAGNOSIS',
                    args: ['✅ All good'],
                    time: Date.now() - this.startTime
                });
            }
            
            this.updateUI();
        }
        
        autoFixError(error) {
            const msg = String(error.message).toLowerCase();
            
            if (msg.includes('mediaviewer') && msg.includes('openimage')) {
                console.log('🛠️ Auto-fixing MediaViewer...');
                this.fixMediaViewer();
            }
        }
        
        createUI() {
            try {
                // Remove if already exists
                const oldPanel = document.getElementById('superDebugPanel');
                const oldToggle = document.getElementById('debugToggle');
                if (oldPanel) oldPanel.remove();
                if (oldToggle) oldToggle.remove();
                
                // Create panel
                const panel = document.createElement('div');
                panel.id = 'superDebugPanel';
                panel.style.cssText = `
                    position: fixed;
                    bottom: 60px;
                    right: 10px;
                    background: rgba(0,0,0,0.95);
                    color: #0f0;
                    padding: 10px;
                    border-radius: 8px;
                    width: 300px;
                    max-height: 200px;
                    overflow-y: auto;
                    font-family: monospace;
                    font-size: 11px;
                    z-index: 99999;
                    border: 1px solid #0f0;
                    display: none;
                    box-shadow: 0 0 10px #0f0;
                `;
                
                panel.innerHTML = `
                    <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:5px;">
                        <strong>🐛 Debug</strong>
                        <button onclick="this.parentElement.parentElement.style.display='none'" 
                                style="background:red;color:white;border:none;padding:2px 8px;border-radius:3px;font-size:10px;">
                            X
                        </button>
                    </div>
                    <div id="debugLogs" style="max-height:150px;overflow-y:auto;"></div>
                    <div style="margin-top:8px;padding-top:5px;border-top:1px solid #333;display:flex;gap:5px;">
                        <button onclick="window.superDebug.exportLogs()" style="flex:1;padding:3px;font-size:9px;">Save</button>
                        <button onclick="window.superDebug.clearLogs()" style="flex:1;padding:3px;font-size:9px;">Clear</button>
                        <button onclick="window.superDebug.fixMediaViewer()" style="flex:1;padding:3px;font-size:9px;background:#0a0;">Fix</button>
                    </div>
                `;
                
                document.body.appendChild(panel);
                
                // Create toggle button
                const toggle = document.createElement('button');
                toggle.id = 'debugToggle';
                toggle.style.cssText = `
                    position: fixed;
                    bottom: 10px;
                    right: 10px;
                    background: linear-gradient(45deg, #0a0, #0f0);
                    color: black;
                    border: none;
                    border-radius: 50%;
                    width: 40px;
                    height: 40px;
                    font-size: 18px;
                    cursor: pointer;
                    z-index: 99999;
                    box-shadow: 0 2px 10px #0f0;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                `;
                toggle.innerHTML = '🐛';
                toggle.title = 'Debug Panel';
                toggle.onclick = () => {
                    panel.style.display = panel.style.display === 'none' ? 'block' : 'none';
                };
                
                document.body.appendChild(toggle);
                
                // Initial update
                this.updateUI();
                
            } catch (error) {
                console.error('Create UI failed:', error);
            }
        }
        
        updateUI() {
            try {
                const logDiv = document.getElementById('debugLogs');
                if (!logDiv) return;
                
                // Show last 8 logs
                const lastLogs = this.logs.slice(-8);
                logDiv.innerHTML = lastLogs.map(log => `
                    <div style="
                        color: ${log.type.includes('ERROR') ? '#f55' : 
                                log.type.includes('SUCCESS') ? '#0f0' : 
                                log.type.includes('WARN') ? '#ff0' : '#aaa'};
                        margin: 2px 0;
                        padding: 2px;
                        border-bottom: 1px solid #333;
                        word-break: break-all;
                    ">
                        <small>[${Math.floor(log.time/1000)}s]</small> ${log.args.join(' ')}
                    </div>
                `).join('');
                
                logDiv.scrollTop = logDiv.scrollHeight;
            } catch (error) {
                // Silent fail
            }
        }
        
        showNotification(text) {
            try {
                const notif = document.createElement('div');
                notif.style.cssText = `
                    position: fixed;
                    top: 20px;
                    right: 20px;
                    background: rgba(0,100,0,0.9);
                    color: white;
                    padding: 10px 15px;
                    border-radius: 5px;
                    z-index: 99999;
                    animation: fadeIn 0.3s;
                    font-family: sans-serif;
                    font-size: 14px;
                    border-left: 4px solid #0f0;
                `;
                notif.textContent = text;
                document.body.appendChild(notif);
                
                setTimeout(() => {
                    if (notif.parentNode) {
                        notif.style.opacity = '0';
                        notif.style.transition = 'opacity 0.5s';
                        setTimeout(() => {
                            if (notif.parentNode) notif.remove();
                        }, 500);
                    }
                }, 2000);
            } catch (error) {
                // Silent fail
            }
        }
        
        exportLogs() {
            try {
                const data = JSON.stringify({
                    app: 'Cvault Debug Report',
                    time: new Date().toISOString(),
                    url: window.location.href,
                    userAgent: navigator.userAgent,
                    logs: this.logs
                }, null, 2);
                
                const blob = new Blob([data], {type: 'application/json'});
                const url = URL.createObjectURL(blob);
                
                // Create download link
                const a = document.createElement('a');
                a.href = url;
                a.download = `cvault_debug_${Date.now()}.json`;
                document.body.appendChild(a);
                a.click();
                
                // Cleanup
                setTimeout(() => {
                    document.body.removeChild(a);
                    URL.revokeObjectURL(url);
                }, 100);
                
                this.showNotification('Logs saved!');
            } catch (error) {
                this.showNotification('Save failed');
            }
        }
        
        clearLogs() {
            this.logs = [];
            this.updateUI();
            this.showNotification('Logs cleared');
        }
    }
    
    // Initialize
    window.superDebug = new SuperDebug();
    
    // Global helper functions
    window.fixMediaViewer = () => window.superDebug?.fixMediaViewer();
    window.getDebugLogs = () => window.superDebug?.logs || [];
    
    console.log('✅ SuperDebug loaded successfully');
}

// Load in different ways based on page state
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initSuperDebug);
} else {
    // Already loaded
    setTimeout(initSuperDebug, 100);
}

// Also expose for manual call
window.initSuperDebug = initSuperDebug;