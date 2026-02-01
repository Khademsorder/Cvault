// debug.js - FORCE VISIBLE & FLOATING BUTTON
// ===========================================
(function() {
    'use strict';

    // 1. কোড রান হচ্ছে কিনা বোঝার জন্য কনসোলে মেসেজ
    console.log('🐞 Debugger Starting...');

    // পেজ লোড হলেই বাটন তৈরি হবে
    window.addEventListener('load', function() {
        createFloatingButton();
        createConsoleWindow();
        overrideConsole();
    });

    // =========================================
    // ১. ভাসমান বাটন (Floating Button) - FORCE MODE
    // =========================================
    function createFloatingButton() {
        // আগের কোনো বাটন থাকলে রিমুভ করা হবে
        const oldBtn = document.getElementById('my-debug-btn');
        if (oldBtn) oldBtn.remove();

        const btn = document.createElement('div');
        btn.id = 'my-debug-btn';
        btn.innerHTML = '🐛'; // আইকন
        
        // বাটন স্টাইল (যাতে সবকিছুর উপরে থাকে)
        btn.style.cssText = `
            position: fixed !important;
            top: 20px !important;       /* নিচে না, উপরে দেওয়া হলো */
            right: 20px !important;     /* ডান পাশে */
            width: 50px !important;
            height: 50px !important;
            background: #000 !important;
            color: #0f0 !important;
            border: 2px solid #0f0 !important;
            border-radius: 50% !important;
            font-size: 28px !important;
            display: flex !important;
            align-items: center !important;
            justify-content: center !important;
            z-index: 2147483647 !important; /* সর্বোচ্চ লেয়ার */
            cursor: pointer !important;
            box-shadow: 0 0 15px rgba(0, 255, 0, 0.8) !important;
            user-select: none !important;
            -webkit-tap-highlight-color: transparent !important;
        `;

        // বাটন টিপলে কনসোল খুলবে/বন্ধ হবে
        btn.onclick = function() {
            const win = document.getElementById('my-debug-win');
            if (win.style.display === 'none') {
                win.style.display = 'flex';
                btn.style.background = '#222'; // Active color
            } else {
                win.style.display = 'none';
                btn.style.background = '#000'; // Normal color
            }
        };

        document.documentElement.appendChild(btn); // body-তে না দিয়ে সরাসরি HTML-এ দেওয়া হলো
        console.log('✅ Button Created');
    }

    // =========================================
    // ২. কনসোল উইন্ডো (Console Window)
    // =========================================
    function createConsoleWindow() {
        const win = document.createElement('div');
        win.id = 'my-debug-win';
        
        win.style.cssText = `
            position: fixed !important;
            top: 80px !important;
            left: 5% !important;
            width: 90% !important;
            height: 50vh !important;
            background: rgba(10, 10, 10, 0.98) !important;
            border: 1px solid #333 !important;
            border-radius: 8px !important;
            z-index: 2147483646 !important;
            display: none; /* শুরুতে বন্ধ থাকবে */
            flex-direction: column !important;
            box-shadow: 0 10px 30px rgba(0,0,0,0.8) !important;
            font-family: monospace !important;
        `;

        win.innerHTML = `
            <div style="padding:10px; background:#222; border-bottom:1px solid #444; display:flex; justify-content:space-between; align-items:center;">
                <span style="color:#0f0; font-weight:bold;">📟 Debug Console</span>
                <div>
                    <button onclick="copyLogs()" style="background:#007bff; color:white; border:none; padding:5px 10px; border-radius:4px; margin-right:5px;">📋 Copy for AI</button>
                    <button onclick="document.getElementById('my-debug-win').style.display='none'" style="background:#d32f2f; color:white; border:none; padding:5px 10px; border-radius:4px;">✕</button>
                </div>
            </div>

            <div id="debug-log-area" style="flex:1; overflow-y:scroll; padding:10px; color:#fff; font-size:12px;">
                <div style="color:#888;">System ready...</div>
            </div>

            <div style="padding:10px; border-top:1px solid #444; background:#111;">
                <input id="debug-cmd-input" type="text" placeholder="> Write JS Code & Hit Enter..." style="width:100%; background:transparent; border:none; color:#0f0; outline:none; font-family:monospace;">
            </div>
        `;

        document.documentElement.appendChild(win);

        // Copy Function for AI
        window.copyLogs = function() {
            const logs = document.getElementById('debug-log-area').innerText;
            navigator.clipboard.writeText(logs).then(() => alert('Logs copied! Now paste to AI.'));
        };

        // Command Input Handler
        document.getElementById('debug-cmd-input').addEventListener('keydown', function(e) {
            if (e.key === 'Enter') {
                const code = this.value;
                console.log('> ' + code); // Log command
                try {
                    const result = eval(code); // Run Code
                    console.log('< ' + result);
                } catch (err) {
                    console.error('Error: ' + err.message);
                }
                this.value = '';
            }
        });
    }

    // =========================================
    // ৩. কনসোল ক্যাপচার (Console Override)
    // =========================================
    function overrideConsole() {
        const logArea = document.getElementById('debug-log-area');
        const oldLog = console.log;
        const oldErr = console.error;

        function printToScreen(msg, color) {
            if (!logArea) return;
            const div = document.createElement('div');
            div.style.cssText = `padding: 4px 0; border-bottom: 1px solid #333; color: ${color}; word-wrap: break-word;`;
            div.innerText = msg;
            logArea.appendChild(div);
            logArea.scrollTop = logArea.scrollHeight; // Auto scroll
        }

        console.log = function(...args) {
            oldLog.apply(console, args);
            printToScreen('✔ ' + args.join(' '), '#fff');
        };

        console.error = function(...args) {
            oldErr.apply(console, args);
            printToScreen('✘ ' + args.join(' '), '#ff5252');
            // এরর হলে বাটন লাল হবে
            const btn = document.getElementById('my-debug-btn');
            if(btn) btn.style.borderColor = 'red';
        };
        
        // Window Error Handler
        window.onerror = function(msg, url, line) {
            console.error(`Crash: ${msg} (Line: ${line})`);
        };
    }

})();
