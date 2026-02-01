// simple-debug.js
// =========================================
// SIMPLE BUT POWERFUL DEBUG CONSOLE
// No Errors Guaranteed!
// =========================================

(function() {
    'use strict';
    
    console.log('🐛 Simple Debug Console loading...');
    
    // 1. FIRST - Create the floating button (ALWAYS VISIBLE)
    function createDebugButton() {
        try {
            const button = document.createElement('button');
            button.id = 'simple-debug-btn';
            button.innerHTML = '🐛';
            button.title = 'Debug Console';
            
            // Force visible with highest priority
            Object.assign(button.style, {
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
                zIndex: '9999999',
                boxShadow: '0 6px 25px rgba(255, 64, 129, 0.5)',
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                transition: 'all 0.3s ease'
            });
            
            // Add hover effect
            button.addEventListener('mouseenter', () => {
                button.style.transform = 'scale(1.2)';
            });
            
            button.addEventListener('mouseleave', () => {
                button.style.transform = 'scale(1)';
            });
            
            // Simple click handler
            button.addEventListener('click', showDebugConsole);
            
            document.body.appendChild(button);
            console.log('✅ Debug button created');
            
        } catch (error) {
            console.error('Failed to create debug button:', error);
        }
    }
    
    // 2. Create SIMPLE debug console
    function createDebugConsole() {
        try {
            const consoleDiv = document.createElement('div');
            consoleDiv.id = 'simple-debug-console';
            
            Object.assign(consoleDiv.style, {
                position: 'fixed',
                bottom: '90px',
                right: '20px',
                width: '90%',
                maxWidth: '500px',
                height: '60vh',
                background: 'rgba(20, 20, 30, 0.98)',
                backdropFilter: 'blur(20px)',
                border: '2px solid #FF4081',
                borderRadius: '15px',
                zIndex: '9999998',
                fontFamily: 'monospace',
                color: 'white',
                display: 'none',
                flexDirection: 'column',
                boxShadow: '0 15px 50px rgba(0,0,0,0.7)',
                overflow: 'hidden'
            });
            
            // Simple HTML
            consoleDiv.innerHTML = `
                <div style="
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    padding: 15px;
                    background: rgba(40, 40, 50, 0.95);
                    border-bottom: 1px solid rgba(255,255,255,0.1);
                ">
                    <div style="display: flex; align-items: center; gap: 10px;">
                        <span style="font-size: 20px;">🐛</span>
                        <span style="font-weight: bold; color: #FF4081;">Simple Debug</span>
                    </div>
                    <div style="display: flex; gap: 10px;">
                        <button id="debug-clear" style="
                            background: rgba(255,100,100,0.2);
                            color: #ff6464;
                            border: 1px solid rgba(255,100,100,0.3);
                            width: 40px;
                            height: 40px;
                            border-radius: 50%;
                            cursor: pointer;
                            display: flex;
                            justify-content: center;
                            align-items: center;
                        ">🗑️</button>
                        <button id="debug-close" style="
                            background: rgba(255,255,255,0.1);
                            color: white;
                            border: none;
                            width: 40px;
                            height: 40px;
                            border-radius: 50%;
                            cursor: pointer;
                            font-size: 20px;
                        ">✕</button>
                    </div>
                </div>
                
                <div style="
                    flex: 1;
                    overflow-y: auto;
                    padding: 15px;
                    font-size: 12px;
                    line-height: 1.4;
                " id="debug-logs"></div>
                
                <div style="
                    padding: 15px;
                    background: rgba(30,30,40,0.95);
                    border-top: 1px solid rgba(255,255,255,0.1);
                    display: flex;
                    gap: 10px;
                ">
                    <button id="copy-ai" style="
                        flex: 1;
                        padding: 10px;
                        background: linear-gradient(135deg, #2196F3, #1976D2);
                        color: white;
                        border: none;
                        border-radius: 8px;
                        cursor: pointer;
                        font-weight: bold;
                        display: flex;
                        align-items: center;
                        justify-content: center;
                        gap: 8px;
                    ">
                        <span>🤖</span>
                        <span>Copy for AI</span>
                    </button>
                    <button id="test-api" style="
                        padding: 10px 20px;
                        background: linear-gradient(135deg, #4CAF50, #388E3C);
                        color: white;
                        border: none;
                        border-radius: 8px;
                        cursor: pointer;
                        font-weight: bold;
                    ">🔌 Test API</button>
                </div>
            `;
            
            document.body.appendChild(consoleDiv);
            
            // Add event listeners
            document.getElementById('debug-close').addEventListener('click', hideDebugConsole);
            document.getElementById('debug-clear').addEventListener('click', clearDebugLogs);
            document.getElementById('copy-ai').addEventListener('click', copyForAI);
            document.getElementById('test-api').addEventListener('click', testAPIConnection);
            
            console.log('✅ Debug console created');
            
        } catch (error) {
            console.error('Failed to create debug console:', error);
        }
    }
    
    // 3. Show/Hide console
    function showDebugConsole() {
        try {
            const consoleDiv = document.getElementById('simple-debug-console');
            if (consoleDiv) {
                consoleDiv.style.display = 'flex';
                consoleDiv.style.animation = 'slideIn 0.3s ease';
            }
        } catch (error) {
            console.error('Failed to show console:', error);
        }
    }
    
    function hideDebugConsole() {
        try {
            const consoleDiv = document.getElementById('simple-debug-console');
            if (consoleDiv) {
                consoleDiv.style.display = 'none';
            }
        } catch (error) {
            console.error('Failed to hide console:', error);
        }
    }
    
    // 4. Log collection
    const debugLogs = [];
    
    // Override console methods
    function hookConsole() {
        try {
            const originalLog = console.log;
            const originalError = console.error;
            const originalWarn = console.warn;
            
            console.log = function(...args) {
                originalLog.apply(console, args);
                addLog('log', args);
            };
            
            console.error = function(...args) {
                originalError.apply(console, args);
                addLog('error', args);
            };
            
            console.warn = function(...args) {
                originalWarn.apply(console, args);
                addLog('warn', args);
            };
            
            // Capture global errors
            window.addEventListener('error', (e) => {
                addLog('error', [`UNHANDLED: ${e.message} at ${e.filename}:${e.lineno}`]);
            });
            
            console.log('✅ Console hooked');
            
        } catch (error) {
            console.error('Failed to hook console:', error);
        }
    }
    
    function addLog(type, args) {
        try {
            const timestamp = new Date().toLocaleTimeString();
            const message = args.map(arg => 
                typeof arg === 'object' ? JSON.stringify(arg) : String(arg)
            ).join(' ');
            
            debugLogs.push({ type, timestamp, message });
            
            // Update UI if console is visible
            updateLogDisplay();
            
        } catch (error) {
            console.error('Failed to add log:', error);
        }
    }
    
    function updateLogDisplay() {
        try {
            const logsDiv = document.getElementById('debug-logs');
            if (!logsDiv) return;
            
            // Show last 50 logs
            const recentLogs = debugLogs.slice(-50);
            
            logsDiv.innerHTML = recentLogs.map(log => `
                <div style="
                    padding: 8px 12px;
                    margin: 4px 0;
                    border-radius: 6px;
                    border-left: 4px solid ${getLogColor(log.type)};
                    background: rgba(255,255,255,0.03);
                    font-size: 11px;
                ">
                    <span style="color: #888; font-size: 10px;">${log.timestamp}</span>
                    <span style="
                        display: inline-block;
                        padding: 2px 6px;
                        border-radius: 4px;
                        background: ${getLogBgColor(log.type)};
                        color: white;
                        font-size: 9px;
                        margin: 0 8px;
                        text-transform: uppercase;
                    ">${log.type}</span>
                    <span>${log.message}</span>
                </div>
            `).join('');
            
            // Auto scroll to bottom
            logsDiv.scrollTop = logsDiv.scrollHeight;
            
        } catch (error) {
            console.error('Failed to update log display:', error);
        }
    }
    
    function getLogColor(type) {
        const colors = {
            log: '#2196F3',
            error: '#FF5252',
            warn: '#FFC107',
            info: '#4CAF50'
        };
        return colors[type] || '#2196F3';
    }
    
    function getLogBgColor(type) {
        const colors = {
            log: 'rgba(33, 150, 243, 0.3)',
            error: 'rgba(255, 82, 82, 0.3)',
            warn: 'rgba(255, 193, 7, 0.3)',
            info: 'rgba(76, 175, 80, 0.3)'
        };
        return colors[type] || 'rgba(33, 150, 243, 0.3)';
    }
    
    // 5. Clear logs
    function clearDebugLogs() {
        try {
            debugLogs.length = 0;
            const logsDiv = document.getElementById('debug-logs');
            if (logsDiv) {
                logsDiv.innerHTML = '<div style="padding: 20px; text-align: center; color: #888;">Logs cleared</div>';
            }
            console.log('🗑️ Logs cleared');
        } catch (error) {
            console.error('Failed to clear logs:', error);
        }
    }
    
    // 6. Copy for AI
    function copyForAI() {
        try {
            const data = {
                url: window.location.href,
                userAgent: navigator.userAgent,
                timestamp: new Date().toISOString(),
                logs: debugLogs.slice(-100),
                localStorage: Object.keys(localStorage).length,
                errors: debugLogs.filter(log => log.type === 'error').length
            };
            
            const text = `=== DEBUG REPORT ===
URL: ${data.url}
Time: ${data.timestamp}
Errors: ${data.errors}

RECENT ERRORS:
${debugLogs.filter(log => log.type === 'error').slice(-10).map((log, i) => `${i+1}. ${log.message}`).join('\n')}

FULL LOGS (last 100):
${debugLogs.slice(-100).map(log => `[${log.timestamp}] ${log.type}: ${log.message}`).join('\n')}

=== END REPORT ===`;
            
            navigator.clipboard.writeText(text)
                .then(() => {
                    console.log('✅ Copied to clipboard for AI');
                    alert('✅ Debug data copied! Paste to ChatGPT/Claude.');
                })
                .catch(err => {
                    // Fallback
                    const textarea = document.createElement('textarea');
                    textarea.value = text;
                    document.body.appendChild(textarea);
                    textarea.select();
                    document.execCommand('copy');
                    document.body.removeChild(textarea);
                    alert('✅ Copied (fallback method)!');
                });
                
        } catch (error) {
            console.error('Failed to copy for AI:', error);
            alert('❌ Failed to copy. Check console.');
        }
    }
    
    // 7. Test API connection
    async function testAPIConnection() {
        try {
            console.log('🔌 Testing API connection...');
            
            if (typeof Auth === 'undefined') {
                console.error('❌ Auth not available');
                alert('Auth not loaded');
                return;
            }
            
            const token = Auth.getAccessToken();
            if (!token) {
                console.error('❌ No access token');
                alert('No access token');
                return;
            }
            
            const response = await fetch('https://www.googleapis.com/drive/v3/files?pageSize=1', {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            
            if (response.ok) {
                console.log('✅ API connection successful');
                alert('✅ API connection successful!');
            } else {
                console.error('❌ API failed:', response.status);
                alert(`❌ API failed: ${response.status}`);
            }
            
        } catch (error) {
            console.error('❌ API test error:', error);
            alert(`❌ Error: ${error.message}`);
        }
    }
    
    // 8. Initialize everything
    function init() {
        try {
            console.log('🐛 Initializing Simple Debug...');
            
            // Create button first
            createDebugButton();
            
            // Create console
            createDebugConsole();
            
            // Hook into console
            hookConsole();
            
            // Add CSS animation
            const style = document.createElement('style');
            style.textContent = `
                @keyframes slideIn {
                    from {
                        opacity: 0;
                        transform: translateY(20px);
                    }
                    to {
                        opacity: 1;
                        transform: translateY(0);
                    }
                }
                
                #simple-debug-btn:hover {
                    transform: scale(1.2) !important;
                    box-shadow: 0 10px 30px rgba(255, 64, 129, 0.7) !important;
                }
            `;
            document.head.appendChild(style);
            
            console.log('✅ Simple Debug initialized successfully!');
            console.log('💡 Click the 🐛 button to open debug console');
            
        } catch (error) {
            console.error('❌ Failed to initialize debug:', error);
        }
    }
    
    // Start when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        setTimeout(init, 100);
    }
    
})();