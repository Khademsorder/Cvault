// debug.js
// =========================================
// VAULT OS - MOBILE DEBUG CONSOLE
// Simple floating button debug system
// =========================================

(function() {
    'use strict';
    
    // Wait for DOM to be ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initDebugTools);
    } else {
        setTimeout(initDebugTools, 1000);
    }
    
    function initDebugTools() {
        console.log('🔧 Initializing debug tools...');
        
        // Create debug button
        createDebugButton();
        
        // Create debug console
        createDebugConsole();
        
        // Create quick debug panel
        createQuickDebugPanel();
        
        // Override console methods
        overrideConsole();
        
        console.log('✅ Debug tools initialized');
    }
    
    // =========================================
    // DEBUG FLOATING BUTTON
    // =========================================
    function createDebugButton() {
        const debugBtn = document.createElement('button');
        debugBtn.id = 'debug-floating-btn';
        debugBtn.innerHTML = '🐛';
        debugBtn.title = 'Debug Console';
        
        debugBtn.style.cssText = `
            position: fixed;
            bottom: 20px;
            right: 20px;
            width: 50px;
            height: 50px;
            background: linear-gradient(135deg, #4a90e2, #357ae8);
            color: white;
            border-radius: 50%;
            border: none;
            font-size: 22px;
            cursor: pointer;
            z-index: 999999;
            box-shadow: 0 4px 15px rgba(74, 144, 226, 0.4);
            display: flex;
            justify-content: center;
            align-items: center;
            transition: all 0.3s ease;
        `;
        
        debugBtn.addEventListener('click', toggleDebugConsole);
        
        // Hover effects
        debugBtn.addEventListener('mouseenter', () => {
            debugBtn.style.transform = 'scale(1.1)';
            debugBtn.style.boxShadow = '0 6px 20px rgba(74, 144, 226, 0.6)';
        });
        
        debugBtn.addEventListener('mouseleave', () => {
            debugBtn.style.transform = 'scale(1)';
            debugBtn.style.boxShadow = '0 4px 15px rgba(74, 144, 226, 0.4)';
        });
        
        document.body.appendChild(debugBtn);
    }
    
    // =========================================
    // DEBUG CONSOLE UI
    // =========================================
    function createDebugConsole() {
        const consoleContainer = document.createElement('div');
        consoleContainer.id = 'debug-console';
        consoleContainer.style.cssText = `
            position: fixed;
            bottom: 80px;
            right: 20px;
            width: 90%;
            max-width: 400px;
            height: 60vh;
            background: rgba(20, 20, 20, 0.98);
            backdrop-filter: blur(20px);
            border: 2px solid #4a90e2;
            border-radius: 15px;
            z-index: 999998;
            font-family: 'Courier New', monospace;
            font-size: 12px;
            color: #fff;
            display: none;
            flex-direction: column;
            box-shadow: 0 10px 40px rgba(0, 0, 0, 0.7);
            overflow: hidden;
        `;
        
        // Console header
        consoleContainer.innerHTML = `
            <div class="debug-header" style="
                display: flex;
                justify-content: space-between;
                align-items: center;
                padding: 12px 15px;
                background: rgba(40, 40, 40, 0.95);
                border-bottom: 1px solid rgba(255, 255, 255, 0.1);
            ">
                <div style="display: flex; align-items: center;">
                    <span style="margin-right: 8px;">🐛</span>
                    <span style="color: #4a90e2; font-weight: bold;">Debug Console</span>
                </div>
                <div style="display: flex; gap: 8px;">
                    <button id="debug-clear" title="Clear Console" style="
                        background: rgba(255, 100, 100, 0.2);
                        color: #ff6464;
                        border: 1px solid rgba(255, 100, 100, 0.3);
                        width: 30px;
                        height: 30px;
                        border-radius: 50%;
                        font-size: 14px;
                        cursor: pointer;
                        display: flex;
                        justify-content: center;
                        align-items: center;
                    ">🗑️</button>
                    <button id="debug-close" title="Close Console" style="
                        background: rgba(255, 255, 255, 0.1);
                        color: #fff;
                        border: none;
                        width: 30px;
                        height: 30px;
                        border-radius: 50%;
                        font-size: 16px;
                        cursor: pointer;
                        display: flex;
                        justify-content: center;
                        align-items: center;
                    ">✕</button>
                </div>
            </div>
            
            <div class="debug-tabs" style="
                display: flex;
                background: rgba(30, 30, 30, 0.9);
                border-bottom: 1px solid rgba(255, 255, 255, 0.1);
            ">
                <button data-tab="all" style="
                    flex: 1;
                    background: transparent;
                    color: #4a90e2;
                    border: none;
                    padding: 8px;
                    font-size: 11px;
                    cursor: pointer;
                    border-bottom: 2px solid #4a90e2;
                ">📋 All</button>
                <button data-tab="logs" style="
                    flex: 1;
                    background: transparent;
                    color: #aaa;
                    border: none;
                    padding: 8px;
                    font-size: 11px;
                    cursor: pointer;
                    border-bottom: 2px solid transparent;
                ">📝 Logs</button>
                <button data-tab="errors" style="
                    flex: 1;
                    background: transparent;
                    color: #aaa;
                    border: none;
                    padding: 8px;
                    font-size: 11px;
                    cursor: pointer;
                    border-bottom: 2px solid transparent;
                ">❌ Errors</button>
                <button data-tab="warnings" style="
                    flex: 1;
                    background: transparent;
                    color: #aaa;
                    border: none;
                    padding: 8px;
                    font-size: 11px;
                    cursor: pointer;
                    border-bottom: 2px solid transparent;
                ">⚠️ Warnings</button>
            </div>
            
            <div id="debug-console-body" style="
                flex: 1;
                overflow-y: auto;
                padding: 10px;
                font-size: 11px;
                line-height: 1.4;
            "></div>
        `;
        
        document.body.appendChild(consoleContainer);
        
        // Add event listeners
        document.getElementById('debug-close').addEventListener('click', hideDebugConsole);
        document.getElementById('debug-clear').addEventListener('click', clearDebugConsole);
        
        // Tab switching
        document.querySelectorAll('.debug-tabs button').forEach(btn => {
            btn.addEventListener('click', function() {
                // Update active tab
                document.querySelectorAll('.debug-tabs button').forEach(b => {
                    b.style.color = '#aaa';
                    b.style.borderBottomColor = 'transparent';
                });
                
                this.style.color = '#4a90e2';
                this.style.borderBottomColor = '#4a90e2';
                
                // Filter logs
                filterDebugLogs(this.dataset.tab);
            });
        });
        
        // Add debug styles
        const debugStyles = document.createElement('style');
        debugStyles.textContent = `
            .debug-log-item {
                padding: 6px 0;
                border-bottom: 1px solid rgba(255, 255, 255, 0.05);
                word-break: break-word;
            }
            
            .debug-log-item.log { color: #fff; }
            .debug-log-item.error { color: #ff6464; }
            .debug-log-item.warn { color: #ffc107; }
            .debug-log-item.info { color: #4a90e2; }
            
            .debug-log-time {
                color: #888;
                font-size: 9px;
                margin-right: 8px;
            }
            
            .debug-log-type {
                display: inline-block;
                padding: 1px 5px;
                border-radius: 3px;
                font-size: 9px;
                font-weight: bold;
                margin-right: 6px;
            }
            
            .log-type-log { background: rgba(255, 255, 255, 0.1); }
            .log-type-error { background: rgba(255, 100, 100, 0.2); }
            .log-type-warn { background: rgba(255, 193, 7, 0.2); }
            .log-type-info { background: rgba(74, 144, 226, 0.2); }
        `;
        document.head.appendChild(debugStyles);
    }
    
    // =========================================
    // QUICK DEBUG PANEL
    // =========================================
    function createQuickDebugPanel() {
        const panel = document.createElement('div');
        panel.id = 'quick-debug-panel';
        panel.style.cssText = `
            position: fixed;
            top: 10px;
            left: 10px;
            background: rgba(20, 20, 20, 0.95);
            border: 1px solid #4a90e2;
            border-radius: 10px;
            padding: 12px;
            z-index: 99997;
            display: none;
            flex-direction: column;
            gap: 8px;
            min-width: 220px;
            backdrop-filter: blur(10px);
            box-shadow: 0 5px 20px rgba(0,0,0,0.5);
        `;
        
        panel.innerHTML = `
            <div style="color: #4a90e2; font-weight: bold; margin-bottom: 5px; font-size: 12px; display: flex; align-items: center; gap: 5px;">
                <span>🔧</span>
                <span>Quick Debug Tools</span>
            </div>
            
            <button class="debug-action-btn" data-action="state">
                <span>📊</span>
                <span>Show App State</span>
            </button>
            
            <button class="debug-action-btn" data-action="api">
                <span>🔌</span>
                <span>Test API</span>
            </button>
            
            <button class="debug-action-btn" data-action="network">
                <span>📡</span>
                <span>Network Status</span>
            </button>
            
            <button class="debug-action-btn" data-action="upload">
                <span>📤</span>
                <span>Test Upload</span>
            </button>
            
            <hr style="border-color: rgba(255,255,255,0.1); margin: 5px 0;">
            
            <button class="debug-action-btn primary" data-action="console">
                <span>🐛</span>
                <span>Open Console</span>
            </button>
            
            <button class="debug-action-btn" data-action="refresh">
                <span>🔄</span>
                <span>Refresh Page</span>
            </button>
            
            <button class="debug-action-btn danger" data-action="clear">
                <span>🗑️</span>
                <span>Clear Data</span>
            </button>
        `;
        
        document.body.appendChild(panel);
        
        // Create toggle button
        const toggleBtn = document.createElement('button');
        toggleBtn.id = 'debug-panel-toggle';
        toggleBtn.innerHTML = '🔧';
        toggleBtn.title = 'Debug Tools';
        toggleBtn.style.cssText = `
            position: fixed;
            top: 10px;
            left: 10px;
            width: 40px;
            height: 40px;
            background: linear-gradient(135deg, #4a90e2, #357ae8);
            color: white;
            border-radius: 50%;
            border: none;
            font-size: 18px;
            cursor: pointer;
            z-index: 99996;
            box-shadow: 0 3px 10px rgba(74, 144, 226, 0.5);
            display: flex;
            justify-content: center;
            align-items: center;
            transition: all 0.3s ease;
        `;
        
        toggleBtn.addEventListener('click', function(e) {
            e.stopPropagation();
            panel.style.display = panel.style.display === 'flex' ? 'none' : 'flex';
        });
        
        document.body.appendChild(toggleBtn);
        
        // Add button styles
        const btnStyles = document.createElement('style');
        btnStyles.textContent = `
            .debug-action-btn {
                background: rgba(255, 255, 255, 0.07);
                color: white;
                border: 1px solid rgba(255, 255, 255, 0.1);
                padding: 8px 12px;
                border-radius: 6px;
                font-size: 12px;
                cursor: pointer;
                display: flex;
                align-items: center;
                gap: 8px;
                text-align: left;
                transition: all 0.3s ease;
            }
            
            .debug-action-btn:hover {
                background: rgba(255, 255, 255, 0.12);
                transform: translateX(3px);
                border-color: rgba(74, 144, 226, 0.3);
            }
            
            .debug-action-btn.primary {
                background: rgba(74, 144, 226, 0.2);
                border-color: rgba(74, 144, 226, 0.4);
            }
            
            .debug-action-btn.danger {
                background: rgba(255, 100, 100, 0.15);
                border-color: rgba(255, 100, 100, 0.3);
            }
            
            .debug-action-btn span:first-child {
                font-size: 14px;
                min-width: 20px;
            }
        `;
        document.head.appendChild(btnStyles);
        
        // Add event listeners to action buttons
        panel.querySelectorAll('.debug-action-btn').forEach(btn => {
            btn.addEventListener('click', function() {
                const action = this.dataset.action;
                handleDebugAction(action);
                panel.style.display = 'none';
            });
        });
        
        // Close panel when clicking outside
        document.addEventListener('click', function(e) {
            if (!panel.contains(e.target) && !toggleBtn.contains(e.target)) {
                panel.style.display = 'none';
            }
        });
    }
    
    // =========================================
    // DEBUG FUNCTIONS
    // =========================================
    const debugState = {
        logs: [],
        errors: [],
        warnings: [],
        isConsoleVisible: false
    };
    
    function toggleDebugConsole() {
        const console = document.getElementById('debug-console');
        const button = document.getElementById('debug-floating-btn');
        
        if (debugState.isConsoleVisible) {
            console.style.display = 'none';
            button.style.background = 'linear-gradient(135deg, #4a90e2, #357ae8)';
        } else {
            console.style.display = 'flex';
            button.style.transform = 'scale(1.1)';
            button.style.background = 'linear-gradient(135deg, #ff6464, #ff3333)';
            refreshDebugConsole();
        }
        
        debugState.isConsoleVisible = !debugState.isConsoleVisible;
    }
    
    function hideDebugConsole() {
        document.getElementById('debug-console').style.display = 'none';
        document.getElementById('debug-floating-btn').style.background = 'linear-gradient(135deg, #4a90e2, #357ae8)';
        debugState.isConsoleVisible = false;
    }
    
    function clearDebugConsole() {
        document.getElementById('debug-console-body').innerHTML = 
            '<div style="color: #888; padding: 20px; text-align: center;">Console cleared. New logs will appear here.</div>';
        
        debugState.logs = [];
        debugState.errors = [];
        debugState.warnings = [];
        
        console.log('Console cleared');
        updateDebugButton();
    }
    
    function refreshDebugConsole() {
        const consoleBody = document.getElementById('debug-console-body');
        if (!consoleBody) return;
        
        consoleBody.innerHTML = '';
        
        const logsToShow = debugState.logs.slice(-100);
        
        if (logsToShow.length === 0) {
            consoleBody.innerHTML = '<div style="color: #888; padding: 20px; text-align: center;">No logs yet.</div>';
            return;
        }
        
        logsToShow.forEach(log => {
            addLogToConsole(log);
        });
    }
    
    function filterDebugLogs(type) {
        const consoleBody = document.getElementById('debug-console-body');
        const items = consoleBody.querySelectorAll('.debug-log-item');
        
        items.forEach(item => {
            if (type === 'all') {
                item.style.display = 'block';
            } else {
                item.style.display = item.dataset.type === type ? 'block' : 'none';
            }
        });
    }
    
    function addLogToConsole(log) {
        const consoleBody = document.getElementById('debug-console-body');
        if (!consoleBody) return;
        
        const logItem = document.createElement('div');
        logItem.className = `debug-log-item ${log.type}`;
        logItem.dataset.type = log.type;
        
        const typeMap = {
            'log': 'LOG',
            'error': 'ERROR',
            'warn': 'WARN',
            'info': 'INFO'
        };
        
        logItem.innerHTML = `
            <div>
                <span class="debug-log-time">${log.timestamp}</span>
                <span class="debug-log-type log-type-${log.type}">${typeMap[log.type]}</span>
                <span>${log.text}</span>
            </div>
        `;
        
        consoleBody.appendChild(logItem);
        consoleBody.scrollTop = consoleBody.scrollHeight;
    }
    
    function updateDebugButton() {
        const button = document.getElementById('debug-floating-btn');
        if (!button) return;
        
        const errorCount = debugState.errors.length;
        const warnCount = debugState.warnings.length;
        
        // Remove existing badge
        const existingBadge = button.querySelector('.error-badge');
        if (existingBadge) existingBadge.remove();
        
        if (errorCount > 0 || warnCount > 0) {
            const badge = document.createElement('div');
            badge.className = 'error-badge';
            badge.innerHTML = errorCount > 0 ? '❌' : '⚠️';
            badge.style.cssText = `
                position: absolute;
                top: -5px;
                right: -5px;
                background: ${errorCount > 0 ? '#ff3333' : '#ffc107'};
                color: white;
                width: 20px;
                height: 20px;
                border-radius: 50%;
                font-size: 10px;
                display: flex;
                justify-content: center;
                align-items: center;
                box-shadow: 0 2px 5px rgba(0,0,0,0.3);
            `;
            
            button.appendChild(badge);
            
            if (errorCount > 0) {
                button.style.background = 'linear-gradient(135deg, #ff6464, #ff3333)';
            } else {
                button.style.background = 'linear-gradient(135deg, #ffc107, #ff9800)';
            }
        } else {
            button.style.background = 'linear-gradient(135deg, #4a90e2, #357ae8)';
        }
    }
    
    // =========================================
    // CONSOLE OVERRIDE
    // =========================================
    function overrideConsole() {
        const originalLog = console.log;
        const originalError = console.error;
        const originalWarn = console.warn;
        const originalInfo = console.info;
        
        console.log = function(...args) {
            originalLog.apply(console, args);
            addDebugLog('log', args);
        };
        
        console.error = function(...args) {
            originalError.apply(console, args);
            addDebugLog('error', args);
        };
        
        console.warn = function(...args) {
            originalWarn.apply(console, args);
            addDebugLog('warn', args);
        };
        
        console.info = function(...args) {
            originalInfo.apply(console, args);
            addDebugLog('info', args);
        };
        
        // Capture unhandled errors
        window.addEventListener('error', (event) => {
            addDebugLog('error', [
                `UNHANDLED ERROR: ${event.message}`,
                `File: ${event.filename}`,
                `Line: ${event.lineno}:${event.colno}`
            ]);
        });
        
        window.addEventListener('unhandledrejection', (event) => {
            addDebugLog('error', [
                'UNHANDLED PROMISE REJECTION:',
                event.reason
            ]);
        });
    }
    
    function addDebugLog(type, args) {
        const timestamp = new Date().toLocaleTimeString();
        const logEntry = {
            type: type,
            timestamp: timestamp,
            text: formatLogArgs(args)
        };
        
        debugState.logs.push(logEntry);
        if (type === 'error') debugState.errors.push(logEntry);
        if (type === 'warn') debugState.warnings.push(logEntry);
        
        if (debugState.isConsoleVisible) {
            addLogToConsole(logEntry);
        }
        
        updateDebugButton();
    }
    
    function formatLogArgs(args) {
        return args.map(arg => {
            if (typeof arg === 'object') {
                try {
                    if (arg instanceof Error) {
                        return arg.toString();
                    }
                    return JSON.stringify(arg, null, 2);
                } catch (e) {
                    return String(arg);
                }
            }
            return String(arg);
        }).join(' ');
    }
    
    // =========================================
    // DEBUG ACTIONS HANDLER
    // =========================================
    function handleDebugAction(action) {
        switch(action) {
            case 'state':
                showAppState();
                break;
                
            case 'api':
                testAPIConnection();
                break;
                
            case 'network':
                showNetworkStatus();
                break;
                
            case 'upload':
                testFileUpload();
                break;
                
            case 'console':
                toggleDebugConsole();
                break;
                
            case 'refresh':
                location.reload();
                break;
                
            case 'clear':
                if (confirm('Clear all local data?')) {
                    localStorage.clear();
                    sessionStorage.clear();
                    console.log('✅ All local data cleared');
                    location.reload();
                }
                break;
        }
    }
    
    function showAppState() {
        console.log('=== APP STATE ===');
        console.log('URL:', window.location.href);
        console.log('Auth:', typeof Auth !== 'undefined' ? '✅ Loaded' : '❌ Not loaded');
        console.log('Drive:', typeof Drive !== 'undefined' ? '✅ Loaded' : '❌ Not loaded');
        console.log('Access Token:', typeof Auth !== 'undefined' ? 
            (Auth.getAccessToken ? '✅ Present' : '❌ No getAccessToken method') : 
            '❌ N/A');
    }
    
    async function testAPIConnection() {
        try {
            console.log('🔌 Testing API connection...');
            
            if (typeof Auth === 'undefined' || !Auth.getAccessToken) {
                console.error('❌ Auth not available');
                return;
            }
            
            const token = Auth.getAccessToken();
            if (!token) {
                console.error('❌ No access token');
                return;
            }
            
            const response = await fetch('https://www.googleapis.com/drive/v3/files?pageSize=1', {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            
            if (response.ok) {
                console.log('✅ API connection successful');
            } else {
                console.error('❌ API connection failed:', response.status);
            }
        } catch (error) {
            console.error('❌ API test error:', error);
        }
    }
    
    function showNetworkStatus() {
        console.log('=== NETWORK STATUS ===');
        console.log('Online:', navigator.onLine ? '✅ Yes' : '❌ No');
        console.log('Connection Type:', navigator.connection ? navigator.connection.effectiveType : 'N/A');
    }
    
    function testFileUpload() {
        console.log('📤 Testing file upload...');
        
        // Create test file
        const testContent = 'Debug test file - ' + new Date().toISOString();
        const testFile = new File([testContent], 'debug-test.txt', { 
            type: 'text/plain'
        });
        
        console.log('Test file created:', testFile.name);
        
        // Try to upload via FabManager if exists
        if (typeof FabManager !== 'undefined') {
            FabManager.handleFileSelection([testFile]);
            console.log('✅ Upload started');
        } else {
            console.error('❌ FabManager not found');
        }
    }
})();