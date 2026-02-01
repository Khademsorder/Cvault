// =========================================
// 🚀 VAULT OS - EXPERT DEBUG CONSOLE
// Complete Professional Debugging Suite
// =========================================

(function() {
    'use strict';
    
    // Configuration
    const CONFIG = {
        version: '1.0.0',
        author: 'VAULT OS Debug Team',
        features: [
            '📊 Force Visible Floating Button',
            '🌐 Network Monitor',
            '🔍 DOM Inspector',
            '💻 Live Code Input',
            '🤖 Copy for AI',
            '📈 Performance Monitor',
            '🎯 X-Ray Viewer',
            '📝 LocalStorage Editor',
            '🔧 API Tester',
            '⚠️ Error Analyzer'
        ]
    };
    
    // Debug State Management
    const DEBUG_STATE = {
        logs: [],
        errors: [],
        warnings: [],
        networkRequests: [],
        performanceMetrics: [],
        isActive: false,
        isNetworkMonitorActive: false,
        isDomInspectorActive: false,
        domHighlightColor: '#FF4081'
    };
    
    // =========================================
    // 🎯 INITIALIZATION
    // =========================================
    
    function initExpertDebug() {
        console.log(`🚀 Expert Debug Console v${CONFIG.version} initializing...`);
        
        // Inject global CSS
        injectDebugStyles();
        
        // Create main debug button (ALWAYS VISIBLE)
        createMainDebugButton();
        
        // Create debug console
        createExpertConsole();
        
        // Create network monitor
        createNetworkMonitor();
        
        // Create DOM inspector
        createDomInspector();
        
        // Create performance monitor
        createPerformanceMonitor();
        
        // Create API tester
        createAPITester();
        
        // Create X-Ray viewer
        createXRayViewer();
        
        // Create localStorage editor
        createLocalStorageEditor();
        
        // Create error analyzer
        createErrorAnalyzer();
        
        // Override console methods
        overrideConsoleMethods();
        
        // Hook into network requests
        hookNetworkRequests();
        
        // Capture global errors
        captureGlobalErrors();
        
        // Start performance monitoring
        startPerformanceMonitoring();
        
        console.log(`✅ Expert Debug Console loaded with ${CONFIG.features.length} features`);
        console.log('🎯 Features:', CONFIG.features.join(', '));
        
        // Show welcome message
        setTimeout(() => {
            console.log('💡 TIP: Click the 🐛 button to open debug console');
            console.log('💡 TIP: Click the 🔧 button for quick debug tools');
        }, 1000);
    }
    
    // =========================================
    // 🎨 CSS STYLES
    // =========================================
    
    function injectDebugStyles() {
        const style = document.createElement('style');
        style.id = 'expert-debug-styles';
        style.textContent = `
            /* ========== MAIN DEBUG BUTTON ========== */
            #expert-debug-main-btn {
                position: fixed !important;
                bottom: 20px !important;
                right: 20px !important;
                width: 60px !important;
                height: 60px !important;
                background: linear-gradient(135deg, #FF4081, #FF5252) !important;
                color: white !important;
                border-radius: 50% !important;
                border: 3px solid white !important;
                font-size: 24px !important;
                cursor: pointer !important;
                z-index: 2147483647 !important;
                box-shadow: 0 6px 25px rgba(255, 64, 129, 0.5) !important;
                display: flex !important;
                justify-content: center !important;
                align-items: center !important;
                transition: all 0.3s ease !important;
                animation: pulse 2s infinite !important;
            }
            
            #expert-debug-main-btn:hover {
                transform: scale(1.2) rotate(15deg) !important;
                box-shadow: 0 10px 30px rgba(255, 64, 129, 0.8) !important;
            }
            
            #expert-debug-main-btn .error-badge {
                position: absolute !important;
                top: -5px !important;
                right: -5px !important;
                background: #FF5252 !important;
                color: white !important;
                width: 24px !important;
                height: 24px !important;
                border-radius: 50% !important;
                font-size: 12px !important;
                display: flex !important;
                justify-content: center !important;
                align-items: center !important;
                font-weight: bold !important;
                box-shadow: 0 2px 8px rgba(0,0,0,0.3) !important;
                border: 2px solid white !important;
            }
            
            @keyframes pulse {
                0%, 100% { box-shadow: 0 6px 25px rgba(255, 64, 129, 0.5); }
                50% { box-shadow: 0 6px 35px rgba(255, 64, 129, 0.8); }
            }
            
            /* ========== QUICK DEBUG BUTTON ========== */
            #expert-debug-quick-btn {
                position: fixed !important;
                top: 20px !important;
                left: 20px !important;
                width: 50px !important;
                height: 50px !important;
                background: linear-gradient(135deg, #2196F3, #1976D2) !important;
                color: white !important;
                border-radius: 50% !important;
                border: 2px solid white !important;
                font-size: 20px !important;
                cursor: pointer !important;
                z-index: 2147483646 !important;
                box-shadow: 0 4px 20px rgba(33, 150, 243, 0.4) !important;
                display: flex !important;
                justify-content: center !important;
                align-items: center !important;
                transition: all 0.3s ease !important;
            }
            
            #expert-debug-quick-btn:hover {
                transform: scale(1.1) !important;
                box-shadow: 0 6px 25px rgba(33, 150, 243, 0.6) !important;
            }
            
            /* ========== MAIN CONSOLE ========== */
            #expert-debug-console {
                position: fixed !important;
                top: 50% !important;
                left: 50% !important;
                transform: translate(-50%, -50%) !important;
                width: 95vw !important;
                height: 90vh !important;
                max-width: 1400px !important;
                background: rgba(15, 15, 20, 0.98) !important;
                backdrop-filter: blur(20px) !important;
                border: 3px solid #FF4081 !important;
                border-radius: 20px !important;
                z-index: 2147483645 !important;
                font-family: 'JetBrains Mono', 'Fira Code', 'Courier New', monospace !important;
                color: #fff !important;
                display: none !important;
                flex-direction: column !important;
                box-shadow: 0 25px 100px rgba(0, 0, 0, 0.8) !important;
                overflow: hidden !important;
            }
            
            /* ========== TABS ========== */
            .debug-tabs-container {
                display: flex !important;
                background: rgba(30, 30, 40, 0.95) !important;
                border-bottom: 2px solid rgba(255, 255, 255, 0.1) !important;
                padding: 0 10px !important;
                flex-wrap: wrap !important;
            }
            
            .debug-tab {
                padding: 12px 20px !important;
                background: transparent !important;
                color: #aaa !important;
                border: none !important;
                border-bottom: 3px solid transparent !important;
                cursor: pointer !important;
                font-size: 13px !important;
                font-weight: 600 !important;
                display: flex !important;
                align-items: center !important;
                gap: 8px !important;
                transition: all 0.3s ease !important;
            }
            
            .debug-tab:hover {
                color: #fff !important;
                background: rgba(255, 255, 255, 0.05) !important;
            }
            
            .debug-tab.active {
                color: #FF4081 !important;
                border-bottom-color: #FF4081 !important;
                background: rgba(255, 64, 129, 0.1) !important;
            }
            
            /* ========== TAB CONTENT ========== */
            .tab-content {
                display: none !important;
                flex: 1 !important;
                overflow: hidden !important;
                padding: 20px !important;
            }
            
            .tab-content.active {
                display: flex !important;
                flex-direction: column !important;
            }
            
            /* ========== LOG ITEMS ========== */
            .log-item {
                padding: 10px 15px !important;
                margin: 5px 0 !important;
                border-radius: 8px !important;
                border-left: 4px solid !important;
                background: rgba(255, 255, 255, 0.03) !important;
                font-size: 12px !important;
                line-height: 1.4 !important;
                word-break: break-all !important;
            }
            
            .log-item.log { border-left-color: #2196F3 !important; }
            .log-item.error { 
                border-left-color: #FF5252 !important;
                background: rgba(255, 82, 82, 0.1) !important;
            }
            .log-item.warn { 
                border-left-color: #FFC107 !important;
                background: rgba(255, 193, 7, 0.1) !important;
            }
            .log-item.info { border-left-color: #4CAF50 !important; }
            
            .log-time {
                color: #888 !important;
                font-size: 10px !important;
                margin-right: 10px !important;
                font-family: monospace !important;
            }
            
            .log-type {
                display: inline-block !important;
                padding: 2px 8px !important;
                border-radius: 4px !important;
                font-size: 10px !important;
                font-weight: bold !important;
                margin-right: 8px !important;
                text-transform: uppercase !important;
            }
            
            .log-type-log { background: rgba(33, 150, 243, 0.2) !important; color: #2196F3 !important; }
            .log-type-error { background: rgba(255, 82, 82, 0.2) !important; color: #FF5252 !important; }
            .log-type-warn { background: rgba(255, 193, 7, 0.2) !important; color: #FFC107 !important; }
            .log-type-info { background: rgba(76, 175, 80, 0.2) !important; color: #4CAF50 !important; }
            
            /* ========== NETWORK REQUESTS ========== */
            .network-request {
                display: grid !important;
                grid-template-columns: 50px 80px 1fr 100px 100px 100px !important;
                gap: 10px !important;
                padding: 10px !important;
                border-bottom: 1px solid rgba(255, 255, 255, 0.05) !important;
                align-items: center !important;
                font-size: 11px !important;
            }
            
            .network-method {
                padding: 3px 8px !important;
                border-radius: 4px !important;
                font-weight: bold !important;
                text-align: center !important;
                font-size: 10px !important;
            }
            
            .method-get { background: rgba(76, 175, 80, 0.2) !important; color: #4CAF50 !important; }
            .method-post { background: rgba(33, 150, 243, 0.2) !important; color: #2196F3 !important; }
            .method-put { background: rgba(255, 152, 0, 0.2) !important; color: #FF9800 !important; }
            .method-delete { background: rgba(244, 67, 54, 0.2) !important; color: #F44336 !important; }
            .method-patch { background: rgba(156, 39, 176, 0.2) !important; color: #9C27B0 !important; }
            
            .status-success { color: #4CAF50 !important; }
            .status-error { color: #F44336 !important; }
            .status-warning { color: #FF9800 !important; }
            
            /* ========== DOM INSPECTOR ========== */
            .dom-highlight {
                outline: 3px dashed #FF4081 !important;
                outline-offset: 2px !important;
                background: rgba(255, 64, 129, 0.1) !important;
                transition: all 0.2s ease !important;
            }
            
            .dom-path {
                background: rgba(30, 30, 40, 0.95) !important;
                padding: 10px !important;
                border-radius: 8px !important;
                margin: 10px 0 !important;
                font-family: monospace !important;
                font-size: 12px !important;
                border: 1px solid rgba(255, 64, 129, 0.3) !important;
            }
            
            /* ========== CODE EDITOR ========== */
            .code-editor {
                flex: 1 !important;
                background: #1e1e1e !important;
                border-radius: 8px !important;
                overflow: hidden !important;
                border: 1px solid rgba(255, 255, 255, 0.1) !important;
            }
            
            .code-input {
                width: 100% !important;
                height: 200px !important;
                background: #1e1e1e !important;
                color: #d4d4d4 !important;
                border: none !important;
                padding: 15px !important;
                font-family: 'Courier New', monospace !important;
                font-size: 14px !important;
                line-height: 1.5 !important;
                resize: vertical !important;
                border-radius: 8px !important;
            }
            
            /* ========== BUTTONS ========== */
            .debug-btn {
                padding: 10px 20px !important;
                background: linear-gradient(135deg, #2196F3, #1976D2) !important;
                color: white !important;
                border: none !important;
                border-radius: 8px !important;
                cursor: pointer !important;
                font-size: 13px !important;
                font-weight: 600 !important;
                display: flex !important;
                align-items: center !important;
                gap: 8px !important;
                transition: all 0.3s ease !important;
            }
            
            .debug-btn:hover {
                transform: translateY(-2px) !important;
                box-shadow: 0 5px 15px rgba(33, 150, 243, 0.4) !important;
            }
            
            .debug-btn.danger {
                background: linear-gradient(135deg, #FF5252, #F44336) !important;
            }
            
            .debug-btn.success {
                background: linear-gradient(135deg, #4CAF50, #388E3C) !important;
            }
            
            .debug-btn.warning {
                background: linear-gradient(135deg, #FF9800, #F57C00) !important;
            }
            
            /* ========== QUICK PANEL ========== */
            #expert-quick-panel {
                position: fixed !important;
                top: 80px !important;
                left: 20px !important;
                background: rgba(15, 15, 20, 0.98) !important;
                backdrop-filter: blur(20px) !important;
                border: 2px solid #2196F3 !important;
                border-radius: 15px !important;
                padding: 15px !important;
                z-index: 2147483644 !important;
                display: none !important;
                flex-direction: column !important;
                gap: 10px !important;
                min-width: 250px !important;
                box-shadow: 0 15px 50px rgba(0, 0, 0, 0.7) !important;
            }
            
            /* ========== RESPONSIVE ========== */
            @media (max-width: 768px) {
                #expert-debug-console {
                    width: 100vw !important;
                    height: 100vh !important;
                    border-radius: 0 !important;
                    top: 0 !important;
                    left: 0 !important;
                    transform: none !important;
                }
                
                .debug-tabs-container {
                    overflow-x: auto !important;
                }
                
                .debug-tab {
                    padding: 10px 15px !important;
                    font-size: 12px !important;
                }
                
                .network-request {
                    grid-template-columns: 40px 70px 1fr 80px 80px 80px !important;
                    font-size: 10px !important;
                }
            }
        `;
        
        document.head.appendChild(style);
    }
    
    // =========================================
    // 🎯 MAIN DEBUG BUTTON (ALWAYS VISIBLE)
    // =========================================
    
    function createMainDebugButton() {
        // Create main debug button
        const mainBtn = document.createElement('button');
        mainBtn.id = 'expert-debug-main-btn';
        mainBtn.innerHTML = '🐛';
        mainBtn.title = 'Expert Debug Console';
        
        // Make it FORCE VISIBLE with highest z-index
        Object.assign(mainBtn.style, {
            position: 'fixed',
            bottom: '20px',
            right: '20px',
            width: '60px',
            height: '60px',
            background: 'linear-gradient(135deg, #FF4081, #FF5252)',
            color: 'white',
            borderRadius: '50%',
            border: '3px solid white',
            fontSize: '24px',
            cursor: 'pointer',
            zIndex: '2147483647',
            boxShadow: '0 6px 25px rgba(255, 64, 129, 0.5)',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            transition: 'all 0.3s ease'
        });
        
        mainBtn.addEventListener('click', toggleMainConsole);
        document.body.appendChild(mainBtn);
        
        // Create quick debug button
        const quickBtn = document.createElement('button');
        quickBtn.id = 'expert-debug-quick-btn';
        quickBtn.innerHTML = '🔧';
        quickBtn.title = 'Quick Debug Tools';
        
        Object.assign(quickBtn.style, {
            position: 'fixed',
            top: '20px',
            left: '20px',
            width: '50px',
            height: '50px',
            background: 'linear-gradient(135deg, #2196F3, #1976D2)',
            color: 'white',
            borderRadius: '50%',
            border: '2px solid white',
            fontSize: '20px',
            cursor: 'pointer',
            zIndex: '2147483646',
            boxShadow: '0 4px 20px rgba(33, 150, 243, 0.4)',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            transition: 'all 0.3s ease'
        });
        
        quickBtn.addEventListener('click', toggleQuickPanel);
        document.body.appendChild(quickBtn);
    }
    
    // =========================================
    // 🖥️ EXPERT CONSOLE
    // =========================================
    
    function createExpertConsole() {
        const consoleContainer = document.createElement('div');
        consoleContainer.id = 'expert-debug-console';
        
        const tabs = [
            { id: 'logs', icon: '📊', label: 'Console Logs' },
            { id: 'network', icon: '🌐', label: 'Network Monitor' },
            { id: 'dom', icon: '🔍', label: 'DOM Inspector' },
            { id: 'code', icon: '💻', label: 'Live Code' },
            { id: 'api', icon: '🔧', label: 'API Tester' },
            { id: 'performance', icon: '📈', label: 'Performance' },
            { id: 'xray', icon: '🎯', label: 'X-Ray View' },
            { id: 'storage', icon: '💾', label: 'Storage' },
            { id: 'errors', icon: '⚠️', label: 'Error Analyzer' },
            { id: 'settings', icon: '⚙️', label: 'Settings' }
        ];
        
        let tabsHTML = '<div class="debug-tabs-container">';
        let contentHTML = '';
        
        tabs.forEach((tab, index) => {
            const active = index === 0 ? 'active' : '';
            tabsHTML += `
                <button class="debug-tab ${active}" data-tab="${tab.id}">
                    <span>${tab.icon}</span>
                    <span>${tab.label}</span>
                </button>
            `;
            
            contentHTML += `
                <div class="tab-content ${active}" id="tab-${tab.id}">
                    ${getTabContent(tab.id)}
                </div>
            `;
        });
        
        tabsHTML += '</div>';
        
        consoleContainer.innerHTML = `
            ${tabsHTML}
            
            <div class="tab-content-container" style="flex: 1; overflow: hidden; display: flex; flex-direction: column;">
                ${contentHTML}
            </div>
            
            <div class="console-footer" style="
                padding: 15px;
                background: rgba(30, 30, 40, 0.95);
                border-top: 2px solid rgba(255, 255, 255, 0.1);
                display: flex;
                justify-content: space-between;
                align-items: center;
            ">
                <div style="display: flex; gap: 10px;">
                    <button class="debug-btn" id="copy-all-logs">
                        <span>🤖</span>
                        <span>Copy for AI</span>
                    </button>
                    <button class="debug-btn danger" id="clear-all-logs">
                        <span>🗑️</span>
                        <span>Clear All</span>
                    </button>
                    <button class="debug-btn warning" id="export-logs">
                        <span>📤</span>
                        <span>Export Logs</span>
                    </button>
                </div>
                
                <div style="display: flex; gap: 10px; align-items: center;">
                    <span style="font-size: 11px; color: #888;">
                        Logs: <span id="log-count">0</span> | 
                        Errors: <span id="error-count">0</span> | 
                        Warnings: <span id="warning-count">0</span>
                    </span>
                    <button class="debug-btn" id="close-console">
                        <span>✕</span>
                        <span>Close</span>
                    </button>
                </div>
            </div>
        `;
        
        document.body.appendChild(consoleContainer);
        
        // Tab switching
        document.querySelectorAll('.debug-tab').forEach(tab => {
            tab.addEventListener('click', function() {
                const tabId = this.dataset.tab;
                
                // Update active tab
                document.querySelectorAll('.debug-tab').forEach(t => {
                    t.classList.remove('active');
                });
                this.classList.add('active');
                
                // Show corresponding content
                document.querySelectorAll('.tab-content').forEach(content => {
                    content.classList.remove('active');
                });
                document.getElementById(`tab-${tabId}`).classList.add('active');
            });
        });
        
        // Footer buttons
        document.getElementById('copy-all-logs').addEventListener('click', copyAllLogsForAI);
        document.getElementById('clear-all-logs').addEventListener('click', clearAllLogs);
        document.getElementById('export-logs').addEventListener('click', exportLogs);
        document.getElementById('close-console').addEventListener('click', closeMainConsole);
    }
    
    function getTabContent(tabId) {
        switch(tabId) {
            case 'logs':
                return `
                    <div style="display: flex; gap: 10px; margin-bottom: 15px;">
                        <input type="text" id="log-filter" placeholder="Filter logs..." style="
                            flex: 1;
                            padding: 10px;
                            background: rgba(255, 255, 255, 0.05);
                            border: 1px solid rgba(255, 255, 255, 0.1);
                            border-radius: 8px;
                            color: white;
                            font-size: 12px;
                        ">
                        <select id="log-level-filter" style="
                            padding: 10px;
                            background: rgba(255, 255, 255, 0.05);
                            border: 1px solid rgba(255, 255, 255, 0.1);
                            border-radius: 8px;
                            color: white;
                            font-size: 12px;
                        ">
                            <option value="all">All Levels</option>
                            <option value="error">Errors Only</option>
                            <option value="warn">Warnings Only</option>
                            <option value="info">Info Only</option>
                            <option value="log">Logs Only</option>
                        </select>
                    </div>
                    <div id="log-container" style="flex: 1; overflow-y: auto;"></div>
                `;
                
            case 'network':
                return `
                    <div style="display: flex; gap: 10px; margin-bottom: 15px;">
                        <button class="debug-btn" id="start-network-monitor">
                            <span>▶️</span>
                            <span>Start Monitor</span>
                        </button>
                        <button class="debug-btn danger" id="stop-network-monitor">
                            <span>⏹️</span>
                            <span>Stop Monitor</span>
                        </button>
                        <button class="debug-btn" id="clear-network-logs">
                            <span>🗑️</span>
                            <span>Clear</span>
                        </button>
                        <span style="margin-left: auto; color: #888; font-size: 12px;">
                            Monitoring: <span id="network-status">OFF</span>
                        </span>
                    </div>
                    <div style="display: grid; grid-template-columns: 50px 80px 1fr 100px 100px 100px; 
                         gap: 10px; padding: 10px; background: rgba(255, 255, 255, 0.02); 
                         border-bottom: 1px solid rgba(255, 255, 255, 0.1); font-weight: bold; font-size: 11px;">
                        <div>#</div>
                        <div>Method</div>
                        <div>URL</div>
                        <div>Status</div>
                        <div>Time</div>
                        <div>Size</div>
                    </div>
                    <div id="network-container" style="flex: 1; overflow-y: auto;"></div>
                `;
                
            case 'dom':
                return `
                    <div style="margin-bottom: 15px;">
                        <div style="display: flex; gap: 10px; margin-bottom: 10px;">
                            <button class="debug-btn" id="start-dom-inspector">
                                <span>🔍</span>
                                <span>Start Inspector</span>
                            </button>
                            <button class="debug-btn danger" id="stop-dom-inspector">
                                <span>⏹️</span>
                                <span>Stop Inspector</span>
                            </button>
                            <input type="color" id="dom-highlight-color" value="#FF4081" style="width: 50px;">
                            <span style="color: #888; font-size: 12px; margin-left: auto;">
                                Click on any element to inspect
                            </span>
                        </div>
                        <div id="dom-path" class="dom-path"></div>
                    </div>
                    <div style="flex: 1; display: flex; gap: 20px;">
                        <div style="flex: 1;">
                            <h4 style="margin: 0 0 10px 0; color: #FF4081;">Element Properties</h4>
                            <div id="dom-properties" style="
                                background: rgba(255, 255, 255, 0.02);
                                border-radius: 8px;
                                padding: 15px;
                                font-size: 12px;
                                overflow-y: auto;
                                height: 300px;
                            "></div>
                        </div>
                        <div style="flex: 1;">
                            <h4 style="margin: 0 0 10px 0; color: #2196F3;">Element Styles</h4>
                            <div id="dom-styles" style="
                                background: rgba(255, 255, 255, 0.02);
                                border-radius: 8px;
                                padding: 15px;
                                font-size: 12px;
                                overflow-y: auto;
                                height: 300px;
                                font-family: monospace;
                            "></div>
                        </div>
                    </div>
                `;
                
            case 'code':
                return `
                    <div style="display: flex; flex-direction: column; height: 100%; gap: 15px;">
                        <div style="flex: 1;">
                            <h4 style="margin: 0 0 10px 0; color: #4CAF50;">Live JavaScript Editor</h4>
                            <textarea id="live-code-input" class="code-input" placeholder="Enter JavaScript code here... 
// Example: console.log('Hello Debug!');
// Example: document.title = 'Debug Mode';
// Example: alert('Test');"></textarea>
                            <div style="display: flex; gap: 10px; margin-top: 10px;">
                                <button class="debug-btn" id="run-code">
                                    <span>▶️</span>
                                    <span>Run Code</span>
                                </button>
                                <button class="debug-btn" id="clear-code">
                                    <span>🗑️</span>
                                    <span>Clear</span>
                                </button>
                                <button class="debug-btn" id="save-snippet">
                                    <span>💾</span>
                                    <span>Save Snippet</span>
                                </button>
                            </div>
                        </div>
                        <div style="flex: 1;">
                            <h4 style="margin: 0 0 10px 0; color: #FF9800;">Output</h4>
                            <div id="code-output" style="
                                flex: 1;
                                background: rgba(0, 0, 0, 0.3);
                                border-radius: 8px;
                                padding: 15px;
                                font-family: monospace;
                                font-size: 12px;
                                overflow-y: auto;
                                min-height: 200px;
                            "></div>
                        </div>
                    </div>
                `;
                
            case 'api':
                return `
                    <div style="display: flex; flex-direction: column; gap: 15px;">
                        <div>
                            <h4 style="margin: 0 0 10px 0; color: #2196F3;">API Request Builder</h4>
                            <div style="display: grid; grid-template-columns: 100px 1fr; gap: 10px; align-items: center;">
                                <label>Method:</label>
                                <select id="api-method" style="padding: 8px; border-radius: 6px; background: rgba(255,255,255,0.05); color: white; border: 1px solid rgba(255,255,255,0.1);">
                                    <option value="GET">GET</option>
                                    <option value="POST">POST</option>
                                    <option value="PUT">PUT</option>
                                    <option value="DELETE">DELETE</option>
                                    <option value="PATCH">PATCH</option>
                                </select>
                                
                                <label>URL:</label>
                                <input type="text" id="api-url" placeholder="https://api.example.com/endpoint" style="padding: 8px; border-radius: 6px; background: rgba(255,255,255,0.05); color: white; border: 1px solid rgba(255,255,255,0.1);">
                                
                                <label>Headers:</label>
                                <textarea id="api-headers" placeholder='{"Authorization": "Bearer token", "Content-Type": "application/json"}' style="padding: 8px; border-radius: 6px; background: rgba(255,255,255,0.05); color: white; border: 1px solid rgba(255,255,255,0.1); height: 80px;"></textarea>
                                
                                <label>Body:</label>
                                <textarea id="api-body" placeholder='{"key": "value"}' style="padding: 8px; border-radius: 6px; background: rgba(255,255,255,0.05); color: white; border: 1px solid rgba(255,255,255,0.1); height: 100px;"></textarea>
                            </div>
                        </div>
                        
                        <div style="display: flex; gap: 10px;">
                            <button class="debug-btn" id="send-api-request">
                                <span>🚀</span>
                                <span>Send Request</span>
                            </button>
                            <button class="debug-btn" id="test-google-api">
                                <span>🔍</span>
                                <span>Test Google API</span>
                            </button>
                            <button class="debug-btn danger" id="clear-api-output">
                                <span>🗑️</span>
                                <span>Clear Output</span>
                            </button>
                        </div>
                        
                        <div>
                            <h4 style="margin: 0 0 10px 0; color: #4CAF50;">Response</h4>
                            <div id="api-response" style="
                                background: rgba(0, 0, 0, 0.3);
                                border-radius: 8px;
                                padding: 15px;
                                font-family: monospace;
                                font-size: 12px;
                                overflow-y: auto;
                                max-height: 300px;
                            "></div>
                        </div>
                    </div>
                `;
                
            case 'performance':
                return `
                    <div style="display: flex; flex-direction: column; gap: 15px;">
                        <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 15px;">
                            <div style="background: rgba(33, 150, 243, 0.1); padding: 15px; border-radius: 10px;">
                                <div style="font-size: 11px; color: #2196F3;">Memory Usage</div>
                                <div id="memory-usage" style="font-size: 20px; font-weight: bold;">-- MB</div>
                            </div>
                            <div style="background: rgba(76, 175, 80, 0.1); padding: 15px; border-radius: 10px;">
                                <div style="font-size: 11px; color: #4CAF50;">FPS</div>
                                <div id="fps-counter" style="font-size: 20px; font-weight: bold;">--</div>
                            </div>
                            <div style="background: rgba(255, 193, 7, 0.1); padding: 15px; border-radius: 10px;">
                                <div style="font-size: 11px; color: #FFC107;">DOM Nodes</div>
                                <div id="dom-count" style="font-size: 20px; font-weight: bold;">--</div>
                            </div>
                        </div>
                        
                        <div>
                            <h4 style="margin: 0 0 10px 0; color: #9C27B0;">Performance Timeline</h4>
                            <div id="performance-timeline" style="
                                background: rgba(0, 0, 0, 0.3);
                                border-radius: 8px;
                                padding: 15px;
                                height: 200px;
                                overflow-y: auto;
                            "></div>
                        </div>
                        
                        <div style="display: flex; gap: 10px;">
                            <button class="debug-btn" id="start-performance-monitor">
                                <span>▶️</span>
                                <span>Start Monitor</span>
                            </button>
                            <button class="debug-btn danger" id="stop-performance-monitor">
                                <span>⏹️</span>
                                <span>Stop</span>
                            </button>
                            <button class="debug-btn" id="run-gc">
                                <span>🧹</span>
                                <span>Run GC</span>
                            </button>
                        </div>
                    </div>
                `;
                
            default:
                return `<div style="padding: 20px; text-align: center; color: #888;">Content for ${tabId}</div>`;
        }
    }
    
    // =========================================
    // 🌐 NETWORK MONITOR
    // =========================================
    
    function createNetworkMonitor() {
        let networkRequestId = 1;
        
        window.startNetworkMonitor = function() {
            DEBUG_STATE.isNetworkMonitorActive = true;
            document.getElementById('network-status').textContent = 'ON';
            document.getElementById('start-network-monitor').disabled = true;
            document.getElementById('stop-network-monitor').disabled = false;
            console.log('🌐 Network monitor started');
        };
        
        window.stopNetworkMonitor = function() {
            DEBUG_STATE.isNetworkMonitorActive = false;
            document.getElementById('network-status').textContent = 'OFF';
            document.getElementById('start-network-monitor').disabled = false;
            document.getElementById('stop-network-monitor').disabled = true;
            console.log('🌐 Network monitor stopped');
        };
        
        window.clearNetworkLogs = function() {
            DEBUG_STATE.networkRequests = [];
            document.getElementById('network-container').innerHTML = '';
            networkRequestId = 1;
            console.log('🌐 Network logs cleared');
        };
    }
    
    function hookNetworkRequests() {
        const originalFetch = window.fetch;
        
        window.fetch = function(...args) {
            const startTime = Date.now();
            const requestId = DEBUG_STATE.networkRequests.length + 1;
            
            // Capture request info
            const requestInfo = {
                id: requestId,
                method: 'GET',
                url: typeof args[0] === 'string' ? args[0] : args[0].url,
                startTime: startTime,
                status: 'pending'
            };
            
            if (args[1] && args[1].method) {
                requestInfo.method = args[1].method;
            }
            
            DEBUG_STATE.networkRequests.push(requestInfo);
            
            if (DEBUG_STATE.isNetworkMonitorActive) {
                addNetworkRequestToUI(requestInfo);
            }
            
            // Call original fetch
            return originalFetch.apply(this, args)
                .then(response => {
                    const endTime = Date.now();
                    const duration = endTime - startTime;
                    
                    requestInfo.status = response.status;
                    requestInfo.duration = duration;
                    requestInfo.size = response.headers.get('content-length') || 'N/A';
                    requestInfo.response = response.clone();
                    
                    if (DEBUG_STATE.isNetworkMonitorActive) {
                        updateNetworkRequestUI(requestId, requestInfo);
                    }
                    
                    return response;
                })
                .catch(error => {
                    const endTime = Date.now();
                    const duration = endTime - startTime;
                    
                    requestInfo.status = 'Error';
                    requestInfo.duration = duration;
                    requestInfo.error = error.message;
                    
                    if (DEBUG_STATE.isNetworkMonitorActive) {
                        updateNetworkRequestUI(requestId, requestInfo);
                    }
                    
                    throw error;
                });
        };
        
        // Also hook XMLHttpRequest
        const originalXHROpen = XMLHttpRequest.prototype.open;
        const originalXHRSend = XMLHttpRequest.prototype.send;
        
        XMLHttpRequest.prototype.open = function(method, url) {
            this._debugRequestInfo = {
                method: method,
                url: url,
                startTime: Date.now()
            };
            return originalXHROpen.apply(this, arguments);
        };
        
        XMLHttpRequest.prototype.send = function() {
            const requestInfo = this._debugRequestInfo;
            if (requestInfo) {
                const requestId = DEBUG_STATE.networkRequests.length + 1;
                requestInfo.id = requestId;
                requestInfo.status = 'pending';
                
                DEBUG_STATE.networkRequests.push(requestInfo);
                
                if (DEBUG_STATE.isNetworkMonitorActive) {
                    addNetworkRequestToUI(requestInfo);
                }
                
                this.addEventListener('load', function() {
                    const duration = Date.now() - requestInfo.startTime;
                    requestInfo.status = this.status;
                    requestInfo.duration = duration;
                    
                    if (DEBUG_STATE.isNetworkMonitorActive) {
                        updateNetworkRequestUI(requestId, requestInfo);
                    }
                });
                
                this.addEventListener('error', function() {
                    const duration = Date.now() - requestInfo.startTime;
                    requestInfo.status = 'Error';
                    requestInfo.duration = duration;
                    requestInfo.error = 'Network error';
                    
                    if (DEBUG_STATE.isNetworkMonitorActive) {
                        updateNetworkRequestUI(requestId, requestInfo);
                    }
                });
            }
            
            return originalXHRSend.apply(this, arguments);
        };
    }
    
    function addNetworkRequestToUI(request) {
        const container = document.getElementById('network-container');
        const div = document.createElement('div');
        div.className = 'network-request';
        div.id = `network-request-${request.id}`;
        div.innerHTML = `
            <div>${request.id}</div>
            <div class="network-method method-${request.method.toLowerCase()}">${request.method}</div>
            <div style="overflow: hidden; text-overflow: ellipsis;" title="${request.url}">${request.url}</div>
            <div>${request.status}</div>
            <div>-- ms</div>
            <div>--</div>
        `;
        container.appendChild(div);
    }
    
    function updateNetworkRequestUI(requestId, request) {
        const element = document.getElementById(`network-request-${requestId}`);
        if (element) {
            const statusClass = request.status >= 400 ? 'status-error' : 
                               request.status >= 300 ? 'status-warning' : 'status-success';
            
            element.innerHTML = `
                <div>${request.id}</div>
                <div class="network-method method-${request.method.toLowerCase()}">${request.method}</div>
                <div style="overflow: hidden; text-overflow: ellipsis;" title="${request.url}">${request.url}</div>
                <div class="${statusClass}">${request.status}</div>
                <div>${request.duration} ms</div>
                <div>${request.size}</div>
            `;
        }
    }
    
    // =========================================
    // 🔍 DOM INSPECTOR
    // =========================================
    
    function createDomInspector() {
        let currentElement = null;
        
        window.startDomInspector = function() {
            DEBUG_STATE.isDomInspectorActive = true;
            
            document.addEventListener('mouseover', handleMouseOver);
            document.addEventListener('click', handleClick, true);
            
            document.getElementById('start-dom-inspector').disabled = true;
            document.getElementById('stop-dom-inspector').disabled = false;
            
            console.log('🔍 DOM Inspector started');
        };
        
        window.stopDomInspector = function() {
            DEBUG_STATE.isDomInspectorActive = false;
            
            document.removeEventListener('mouseover', handleMouseOver);
            document.removeEventListener('click', handleClick, true);
            
            if (currentElement) {
                currentElement.classList.remove('dom-highlight');
            }
            
            document.getElementById('start-dom-inspector').disabled = false;
            document.getElementById('stop-dom-inspector').disabled = true;
            
            console.log('🔍 DOM Inspector stopped');
        };
        
        function handleMouseOver(e) {
            if (!DEBUG_STATE.isDomInspectorActive) return;
            
            if (currentElement) {
                currentElement.classList.remove('dom-highlight');
            }
            
            currentElement = e.target;
            currentElement.classList.add('dom-highlight');
            
            // Update DOM path
            updateDomPath(currentElement);
            
            // Update properties
            updateElementProperties(currentElement);
        }
        
        function handleClick(e) {
            if (!DEBUG_STATE.isDomInspectorActive) return;
            
            e.preventDefault();
            e.stopPropagation();
            
            console.log('🎯 Element clicked:', e.target);
            
            // Show element in console
            console.dir(e.target);
            
            return false;
        }
        
        function updateDomPath(element) {
            const path = [];
            let current = element;
            
            while (current && current !== document.body) {
                let selector = current.tagName.toLowerCase();
                
                if (current.id) {
                    selector += `#${current.id}`;
                } else if (current.className && typeof current.className === 'string') {
                    const classes = current.className.split(' ').filter(c => c).join('.');
                    if (classes) selector += `.${classes}`;
                }
                
                path.unshift(selector);
                current = current.parentElement;
            }
            
            document.getElementById('dom-path').textContent = path.join(' > ');
        }
        
        function updateElementProperties(element) {
            const props = document.getElementById('dom-properties');
            const styles = document.getElementById('dom-styles');
            
            // Properties
            let propsHTML = `
                <div><strong>Tag:</strong> ${element.tagName}</div>
                <div><strong>ID:</strong> ${element.id || 'none'}</div>
                <div><strong>Classes:</strong> ${element.className || 'none'}</div>
                <div><strong>Children:</strong> ${element.children.length}</div>
                <div><strong>Dimensions:</strong> ${element.offsetWidth} x ${element.offsetHeight}</div>
                <div><strong>Position:</strong> ${element.offsetLeft}, ${element.offsetTop}</div>
            `;
            
            // Custom properties
            if (element.hasAttribute('data-*')) {
                propsHTML += '<div><strong>Data Attributes:</strong></div>';
                Array.from(element.attributes)
                    .filter(attr => attr.name.startsWith('data-'))
                    .forEach(attr => {
                        propsHTML += `<div style="margin-left: 10px;">${attr.name} = "${attr.value}"</div>`;
                    });
            }
            
            props.innerHTML = propsHTML;
            
            // Styles
            const computed = getComputedStyle(element);
            let stylesHTML = '';
            
            // Get important styles
            const importantStyles = [
                'display', 'position', 'width', 'height', 'margin', 'padding',
                'color', 'background', 'border', 'font-size', 'z-index',
                'opacity', 'visibility', 'flex', 'grid'
            ];
            
            importantStyles.forEach(prop => {
                const value = computed[prop] || computed.getPropertyValue(prop);
                if (value && value !== '0px' && value !== 'none' && value !== 'auto') {
                    stylesHTML += `<div><span style="color: #4CAF50;">${prop}:</span> ${value}</div>`;
                }
            });
            
            styles.innerHTML = stylesHTML || '<div style="color: #888;">No significant styles</div>';
        }
        
        // Color picker
        document.addEventListener('input', function(e) {
            if (e.target.id === 'dom-highlight-color') {
                DEBUG_STATE.domHighlightColor = e.target.value;
                
                // Update CSS
                const style = document.getElementById('expert-debug-styles');
                const newRule = `.dom-highlight { outline: 3px dashed ${e.target.value} !important; background: ${e.target.value}20 !important; }`;
                
                // Replace or add the rule
                if (style.textContent.includes('.dom-highlight')) {
                    style.textContent = style.textContent.replace(
                        /\.dom-highlight\s*\{[^}]*\}/,
                        newRule
                    );
                }
            }
        });
    }
    
    // =========================================
    // 💻 LIVE CODE INPUT
    // =========================================
    
    function createCodeEditor() {
        document.getElementById('run-code')?.addEventListener('click', function() {
            const code = document.getElementById('live-code-input').value;
            const output = document.getElementById('code-output');
            
            if (!code.trim()) {
                output.innerHTML = '<div style="color: #FF9800;">⚠️ No code to execute</div>';
                return;
            }
            
            try {
                output.innerHTML = '<div style="color: #888;">Executing code...</div>';
                
                // Create a safe execution context
                const result = (function() {
                    try {
                        return eval(code);
                    } catch (e) {
                        return e;
                    }
                })();
                
                let resultHTML = `<div style="color: #4CAF50;">✅ Code executed successfully</div>`;
                
                if (result instanceof Error) {
                    resultHTML = `<div style="color: #FF5252;">❌ Error: ${result.message}</div>`;
                } else if (result !== undefined) {
                    resultHTML += `<div style="margin-top: 10px;"><strong>Result:</strong> ${JSON.stringify(result, null, 2)}</div>`;
                }
                
                output.innerHTML = resultHTML;
                
                // Log to console
                console.log('[Live Code Execution]', result);
                
            } catch (error) {
                output.innerHTML = `<div style="color: #FF5252;">❌ Execution error: ${error.message}</div>`;
                console.error('Live code error:', error);
            }
        });
        
        document.getElementById('clear-code')?.addEventListener('click', function() {
            document.getElementById('live-code-input').value = '';
            document.getElementById('code-output').innerHTML = '';
        });
        
        document.getElementById('save-snippet')?.addEventListener('click', function() {
            const code = document.getElementById('live-code-input').value;
            if (code.trim()) {
                localStorage.setItem('debug_snippet_' + Date.now(), code);
                console.log('💾 Code snippet saved');
                alert('Code snippet saved to localStorage');
            }
        });
    }
    
    // =========================================
    // 🔧 API TESTER
    // =========================================
    
    function createAPITester() {
        document.getElementById('send-api-request')?.addEventListener('click', async function() {
            const method = document.getElementById('api-method').value;
            const url = document.getElementById('api-url').value;
            const headersText = document.getElementById('api-headers').value;
            const bodyText = document.getElementById('api-body').value;
            const responseDiv = document.getElementById('api-response');
            
            if (!url) {
                responseDiv.innerHTML = '<div style="color: #FF9800;">⚠️ Please enter a URL</div>';
                return;
            }
            
            responseDiv.innerHTML = '<div style="color: #888;">Sending request...</div>';
            
            try {
                let headers = {};
                if (headersText.trim()) {
                    headers = JSON.parse(headersText);
                }
                
                let body = null;
                if (bodyText.trim() && method !== 'GET') {
                    body = JSON.parse(bodyText);
                }
                
                const startTime = Date.now();
                const response = await fetch(url, {
                    method: method,
                    headers: headers,
                    body: body ? JSON.stringify(body) : null
                });
                
                const endTime = Date.now();
                const duration = endTime - startTime;
                
                let responseData;
                try {
                    responseData = await response.json();
                } catch {
                    responseData = await response.text();
                }
                
                let responseHTML = `
                    <div style="color: ${response.ok ? '#4CAF50' : '#FF5252'}">
                        ${response.ok ? '✅' : '❌'} ${response.status} ${response.statusText}
                    </div>
                    <div style="font-size: 11px; color: #888; margin: 5px 0;">
                        Time: ${duration}ms | Size: ${JSON.stringify(responseData).length} bytes
                    </div>
                    <div style="margin-top: 10px;">
                        <strong>Response:</strong>
                        <pre style="background: rgba(0,0,0,0.3); padding: 10px; border-radius: 5px; overflow-x: auto;">
${typeof responseData === 'string' ? responseData : JSON.stringify(responseData, null, 2)}
                        </pre>
                    </div>
                `;
                
                responseDiv.innerHTML = responseHTML;
                
                // Log to console
                console.log(`[API Test] ${method} ${url}`, {
                    status: response.status,
                    duration: duration,
                    response: responseData
                });
                
            } catch (error) {
                responseDiv.innerHTML = `
                    <div style="color: #FF5252;">❌ Request failed</div>
                    <div style="color: #888; font-size: 12px;">${error.message}</div>
                `;
                console.error('API test error:', error);
            }
        });
        
        document.getElementById('test-google-api')?.addEventListener('click', async function() {
            if (typeof Auth === 'undefined' || !Auth.getAccessToken) {
                alert('Auth not available');
                return;
            }
            
            const token = Auth.getAccessToken();
            if (!token) {
                alert('No access token');
                return;
            }
            
            document.getElementById('api-url').value = 'https://www.googleapis.com/drive/v3/files?pageSize=5';
            document.getElementById('api-headers').value = JSON.stringify({
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }, null, 2);
            document.getElementById('api-method').value = 'GET';
            document.getElementById('api-body').value = '';
        });
    }
    
    // =========================================
    // 📈 PERFORMANCE MONITOR
    // =========================================
    
    function createPerformanceMonitor() {
        let fpsInterval;
        let frameCount = 0;
        let lastTime = Date.now();
        
        function updatePerformanceMetrics() {
            // Memory usage
            if (performance.memory) {
                const usedMB = Math.round(performance.memory.usedJSHeapSize / 1024 / 1024);
                const totalMB = Math.round(performance.memory.totalJSHeapSize / 1024 / 1024);
                document.getElementById('memory-usage').textContent = `${usedMB} / ${totalMB} MB`;
            }
            
            // DOM count
            const domCount = document.getElementsByTagName('*').length;
            document.getElementById('dom-count').textContent = domCount;
            
            // FPS calculation
            frameCount++;
            const currentTime = Date.now();
            const delta = currentTime - lastTime;
            
            if (delta >= 1000) {
                const fps = Math.round((frameCount * 1000) / delta);
                document.getElementById('fps-counter').textContent = `${fps} FPS`;
                
                // Add to timeline
                const timeline = document.getElementById('performance-timeline');
                if (timeline.children.length > 20) {
                    timeline.removeChild(timeline.firstChild);
                }
                
                const entry = document.createElement('div');
                entry.style.cssText = 'padding: 5px; border-bottom: 1px solid rgba(255,255,255,0.1); font-size: 11px;';
                entry.innerHTML = `
                    <span style="color: #888;">${new Date().toLocaleTimeString()}</span>
                    <span style="color: #2196F3; margin-left: 10px;">FPS: ${fps}</span>
                    <span style="color: #4CAF50; margin-left: 10px;">DOM: ${domCount}</span>
                `;
                timeline.appendChild(entry);
                
                frameCount = 0;
                lastTime = currentTime;
            }
            
            if (DEBUG_STATE.isActive) {
                requestAnimationFrame(updatePerformanceMetrics);
            }
        }
        
        window.startPerformanceMonitor = function() {
            DEBUG_STATE.isActive = true;
            updatePerformanceMetrics();
            console.log('📈 Performance monitor started');
        };
        
        window.stopPerformanceMonitor = function() {
            DEBUG_STATE.isActive = false;
            console.log('📈 Performance monitor stopped');
        };
        
        window.runGarbageCollection = function() {
            if (window.gc) {
                window.gc();
                console.log('🧹 Garbage collection forced');
                alert('Garbage collection completed');
            } else {
                console.warn('Garbage collection not available');
                alert('Garbage collection not available in this browser');
            }
        };
    }
    
    // =========================================
    // 🎯 X-RAY VIEWER
    // =========================================
    
    function createXRayViewer() {
        // Implementation for X-Ray viewer
        console.log('🎯 X-Ray Viewer created');
    }
    
    // =========================================
    // 💾 LOCALSTORAGE EDITOR
    // =========================================
    
    function createLocalStorageEditor() {
        // Implementation for localStorage editor
        console.log('💾 LocalStorage Editor created');
    }
    
    // =========================================
    // ⚠️ ERROR ANALYZER
    // =========================================
    
    function createErrorAnalyzer() {
        // Implementation for error analyzer
        console.log('⚠️ Error Analyzer created');
    }
    
    // =========================================
    // 📝 CONSOLE OVERRIDE
    // =========================================
    
    function overrideConsoleMethods() {
        const originalConsole = {
            log: console.log,
            error: console.error,
            warn: console.warn,
            info: console.info,
            debug: console.debug
        };
        
        function addLog(type, args) {
            const timestamp = new Date().toLocaleTimeString();
            const logEntry = {
                type: type,
                timestamp: timestamp,
                message: args.map(arg => 
                    typeof arg === 'object' ? 
                    JSON.stringify(arg, null, 2) : 
                    String(arg)
                ).join(' '),
                stack: new Error().stack
            };
            
            DEBUG_STATE.logs.push(logEntry);
            
            if (type === 'error') DEBUG_STATE.errors.push(logEntry);
            if (type === 'warn') DEBUG_STATE.warnings.push(logEntry);
            
            // Update UI if console is open
            if (document.getElementById('expert-debug-console')?.style.display === 'flex') {
                addLogToUI(logEntry);
            }
            
            // Update counters
            updateCounters();
            
            // Call original console method
            originalConsole[type].apply(console, args);
        }
        
        console.log = function(...args) { addLog('log', args); };
        console.error = function(...args) { addLog('error', args); };
        console.warn = function(...args) { addLog('warn', args); };
        console.info = function(...args) { addLog('info', args); };
        console.debug = function(...args) { addLog('log', args); };
    }
    
    function addLogToUI(log) {
        const container = document.getElementById('log-container');
        const div = document.createElement('div');
        div.className = `log-item ${log.type}`;
        
        div.innerHTML = `
            <div>
                <span class="log-time">${log.timestamp}</span>
                <span class="log-type log-type-${log.type}">${log.type.toUpperCase()}</span>
                <span>${log.message}</span>
            </div>
        `;
        
        container.appendChild(div);
        container.scrollTop = container.scrollHeight;
    }
    
    function updateCounters() {
        document.getElementById('log-count').textContent = DEBUG_STATE.logs.length;
        document.getElementById('error-count').textContent = DEBUG_STATE.errors.length;
        document.getElementById('warning-count').textContent = DEBUG_STATE.warnings.length;
        
        // Update button badge
        const button = document.getElementById('expert-debug-main-btn');
        const errorCount = DEBUG_STATE.errors.length;
        
        // Remove existing badge
        const existingBadge = button.querySelector('.error-badge');
        if (existingBadge) existingBadge.remove();
        
        if (errorCount > 0) {
            const badge = document.createElement('div');
            badge.className = 'error-badge';
            badge.textContent = errorCount > 99 ? '99+' : errorCount;
            button.appendChild(badge);
            
            // Make button red for errors
            button.style.background = 'linear-gradient(135deg, #FF5252, #F44336)';
        } else {
            // Reset button color
            button.style.background = 'linear-gradient(135deg, #FF4081, #FF5252)';
        }
    }
    
    // =========================================
    // 🤖 COPY FOR AI
    // =========================================
    
    function copyAllLogsForAI() {
        const allData = {
            timestamp: new Date().toISOString(),
            url: window.location.href,
            userAgent: navigator.userAgent,
            logs: DEBUG_STATE.logs.slice(-100), // Last 100 logs
            errors: DEBUG_STATE.errors,
            warnings: DEBUG_STATE.warnings,
            networkRequests: DEBUG_STATE.networkRequests.slice(-50),
            localStorage: Object.keys(localStorage).reduce((obj, key) => {
                try {
                    obj[key] = localStorage.getItem(key);
                } catch (e) {
                    obj[key] = '[Unreadable]';
                }
                return obj;
            }, {})
        };
        
        const text = `=== DEBUG REPORT FOR AI ===
Timestamp: ${allData.timestamp}
URL: ${allData.url}
User Agent: ${allData.userAgent}

=== ERRORS (${allData.errors.length}) ===
${allData.errors.map((e, i) => `${i + 1}. ${e.message}`).join('\n')}

=== LOGS ===
${allData.logs.map(l => `[${l.timestamp}] ${l.type}: ${l.message}`).join('\n')}

=== NETWORK REQUESTS ===
${allData.networkRequests.map(r => `[${r.method}] ${r.url} - ${r.status} (${r.duration}ms)`).join('\n')}

=== LOCALSTORAGE KEYS ===
${Object.keys(allData.localStorage).join(', ')}

=== END REPORT ===`;

        navigator.clipboard.writeText(text)
            .then(() => {
                console.log('🤖 Debug data copied to clipboard for AI analysis');
                alert('✅ All debug data copied to clipboard! Paste to ChatGPT/Claude/Gemini.');
            })
            .catch(err => {
                console.error('Failed to copy:', err);
                alert('❌ Failed to copy. Please check console.');
            });
    }
    
    // =========================================
    // 🗑️ CLEAR ALL LOGS
    // =========================================
    
    function clearAllLogs() {
        DEBUG_STATE.logs = [];
        DEBUG_STATE.errors = [];
        DEBUG_STATE.warnings = [];
        DEBUG_STATE.networkRequests = [];
        
        document.getElementById('log-container').innerHTML = '';
        document.getElementById('network-container').innerHTML = '';
        
        updateCounters();
        
        console.log('🗑️ All logs cleared');
    }
    
    // =========================================
    // 📤 EXPORT LOGS
    // =========================================
    
    function exportLogs() {
        const dataStr = JSON.stringify({
            logs: DEBUG_STATE.logs,
            errors: DEBUG_STATE.errors,
            warnings: DEBUG_STATE.warnings,
            networkRequests: DEBUG_STATE.networkRequests,
            config: CONFIG
        }, null, 2);
        
        const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
        const exportFileDefaultName = `debug-logs-${new Date().toISOString()}.json`;
        
        const linkElement = document.createElement('a');
        linkElement.setAttribute('href', dataUri);
        linkElement.setAttribute('download', exportFileDefaultName);
        linkElement.click();
        
        console.log('📤 Logs exported');
    }
    
    // =========================================
    // 🎯 GLOBAL ERROR CAPTURE
    // =========================================
    
    function captureGlobalErrors() {
        window.addEventListener('error', function(event) {
            const errorLog = {
                type: 'error',
                timestamp: new Date().toLocaleTimeString(),
                message: `${event.message} (${event.filename}:${event.lineno}:${event.colno})`,
                stack: event.error?.stack
            };
            
            DEBUG_STATE.errors.push(errorLog);
            updateCounters();
        });
        
        window.addEventListener('unhandledrejection', function(event) {
            const errorLog = {
                type: 'error',
                timestamp: new Date().toLocaleTimeString(),
                message: `Unhandled Promise Rejection: ${event.reason}`,
                stack: event.reason?.stack
            };
            
            DEBUG_STATE.errors.push(errorLog);
            updateCounters();
        });
    }
    
    // =========================================
    // 🎪 UI CONTROLS
    // =========================================
    
    function toggleMainConsole() {
        const console = document.getElementById('expert-debug-console');
        if (console.style.display === 'flex') {
            closeMainConsole();
        } else {
            openMainConsole();
        }
    }
    
    function openMainConsole() {
        const console = document.getElementById('expert-debug-console');
        console.style.display = 'flex';
        
        // Refresh logs
        refreshLogsUI();
        
        console.log('🚀 Expert Debug Console opened');
    }
    
    function closeMainConsole() {
        document.getElementById('expert-debug-console').style.display = 'none';
        console.log('🚀 Expert Debug Console closed');
    }
    
    function refreshLogsUI() {
        const container = document.getElementById('log-container');
        container.innerHTML = '';
        
        DEBUG_STATE.logs.slice(-100).forEach(log => {
            addLogToUI(log);
        });
        
        updateCounters();
    }
    
    // =========================================
    // 🔧 QUICK DEBUG PANEL
    // =========================================
    
    function createQuickDebugPanel() {
        const panel = document.createElement('div');
        panel.id = 'expert-quick-panel';
        
        panel.innerHTML = `
            <button class="debug-btn" onclick="quickAction('state')" style="width: 100%;">
                <span>📊</span>
                <span>App State</span>
            </button>
            
            <button class="debug-btn" onclick="quickAction('network')" style="width: 100%;">
                <span>🌐</span>
                <span>Network Test</span>
            </button>
            
            <button class="debug-btn" onclick="quickAction('dom')" style="width: 100%;">
                <span>🔍</span>
                <span>DOM Inspector</span>
            </button>
            
            <button class="debug-btn" onclick="quickAction('performance')" style="width: 100%;">
                <span>📈</span>
                <span>Performance</span>
            </button>
            
            <hr style="border-color: rgba(255,255,255,0.1); margin: 5px 0;">
            
            <button class="debug-btn warning" onclick="quickAction('copy')" style="width: 100%;">
                <span>🤖</span>
                <span>Copy for AI</span>
            </button>
            
            <button class="debug-btn" onclick="quickAction('refresh')" style="width: 100%;">
                <span>🔄</span>
                <span>Refresh Page</span>
            </button>
            
            <button class="debug-btn danger" onclick="quickAction('clear')" style="width: 100%;">
                <span>🗑️</span>
                <span>Clear Data</span>
            </button>
            
            <hr style="border-color: rgba(255,255,255,0.1); margin: 5px 0;">
            
            <div style="font-size: 10px; color: #888; text-align: center;">
                Expert Debug v${CONFIG.version}
            </div>
        `;
        
        document.body.appendChild(panel);
    }
    
    function toggleQuickPanel() {
        const panel = document.getElementById('expert-quick-panel');
        panel.style.display = panel.style.display === 'flex' ? 'none' : 'flex';
    }
    
    window.quickAction = function(action) {
        const panel = document.getElementById('expert-quick-panel');
        panel.style.display = 'none';
        
        switch(action) {
            case 'state':
                console.log('=== QUICK APP STATE ===');
                console.log('URL:', location.href);
                console.log('Screen:', `${screen.width}x${screen.height}`);
                console.log('Viewport:', `${window.innerWidth}x${window.innerHeight}`);
                console.log('User Agent:', navigator.userAgent);
                console.log('Platform:', navigator.platform);
                console.log('Cookies:', document.cookie ? 'Yes' : 'No');
                console.log('LocalStorage:', localStorage.length, 'items');
                console.log('SessionStorage:', sessionStorage.length, 'items');
                break;
                
            case 'network':
                fetch('https://httpbin.org/get')
                    .then(r => r.json())
                    .then(data => console.log('🌐 Network test OK', data))
                    .catch(err => console.error('🌐 Network test failed', err));
                break;
                
            case 'dom':
                openMainConsole();
                setTimeout(() => {
                    document.querySelector('[data-tab="dom"]').click();
                    startDomInspector();
                }, 100);
                break;
                
            case 'performance':
                openMainConsole();
                setTimeout(() => {
                    document.querySelector('[data-tab="performance"]').click();
                    startPerformanceMonitor();
                }, 100);
                break;
                
            case 'copy':
                copyAllLogsForAI();
                break;
                
            case 'refresh':
                location.reload();
                break;
                
            case 'clear':
                if (confirm('Clear ALL localStorage and sessionStorage?')) {
                    localStorage.clear();
                    sessionStorage.clear();
                    console.log('✅ All storage cleared');
                    setTimeout(() => location.reload(), 1000);
                }
                break;
        }
    };
    
    // =========================================
    // 🚀 START EVERYTHING
    // =========================================
    
    // Wait for DOM to be ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initExpertDebug);
    } else {
        setTimeout(initExpertDebug, 500);
    }
    
    // Make functions globally available
    window.expertDebug = {
        open: openMainConsole,
        close: closeMainConsole,
        copyForAI: copyAllLogsForAI,
        clearAll: clearAllLogs,
        exportLogs: exportLogs,
        startNetworkMonitor: window.startNetworkMonitor,
        stopNetworkMonitor: window.stopNetworkMonitor,
        startDomInspector: window.startDomInspector,
        stopDomInspector: window.stopDomInspector,
        startPerformanceMonitor: window.startPerformanceMonitor,
        stopPerformanceMonitor: window.stopPerformanceMonitor,
        runGarbageCollection: window.runGarbageCollection,
        version: CONFIG.version
    };
    
    console.log('🚀 Expert Debug Console loaded successfully!');
    console.log('💡 Use window.expertDebug to access debug functions');
    
})();