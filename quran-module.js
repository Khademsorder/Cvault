/**
 * Quran & Hadith Module (Cloud + Offline)
 * Handles API fetching, IndexedDB offline storage, and auto-embed generation for AI references.
 */

const IslamicModule = (function () {
  const DB_NAME = 'IslamicKnowledgeCoreStore';
  let dbInstance = null;

  // Initialize IndexedDB specifically for full Surahs/Hadiths
  async function initDB() {
    return new Promise((resolve, reject) => {
      const req = indexedDB.open(DB_NAME, 1);
      req.onupgradeneeded = e => {
        const db = e.target.result;
        if (!db.objectStoreNames.contains('surahs')) db.createObjectStore('surahs', { keyPath: 'id' });
        if (!db.objectStoreNames.contains('ayat')) db.createObjectStore('ayat', { keyPath: 'key' }); // key: surah_ayah
        if (!db.objectStoreNames.contains('hadith')) db.createObjectStore('hadith', { keyPath: 'key' }); // key: book_number
      };
      req.onsuccess = e => { dbInstance = e.target.result; resolve(dbInstance); };
      req.onerror = e => reject(e);
    });
  }

  // Helper for IndexedDB transactions
  async function getFromDB(storeName, key) {
    if (!dbInstance) await initDB();
    return new Promise(resolve => {
      const tx = dbInstance.transaction(storeName, 'readonly');
      const req = tx.objectStore(storeName).get(key);
      req.onsuccess = () => resolve(req.result);
      req.onerror = () => resolve(null);
    });
  }

  async function saveToDB(storeName, data) {
    if (!dbInstance) await initDB();
    const tx = dbInstance.transaction(storeName, 'readwrite');
    tx.objectStore(storeName).put(data);
  }

  // --- QURAN API ---
  const QuranAPI = {
    // Get a specific ayah (Arabic, Translation, Transliteration, Audio)
    getAyah: async (surah, ayah) => {
      const dbKey = `${surah}_${ayah}`;
      const cached = await getFromDB('ayat', dbKey);
      if (cached) return cached.data;

      try {
        // Fetch Arabic + Audio (Alafasy), English/Bangla Translation (e.g., bn.bengali)
        // api.alquran.cloud/v1/ayah/2:255/editions/quran-uthmani,bn.bengali,ar.alafasy
        const url = `https://api.alquran.cloud/v1/ayah/${surah}:${ayah}/editions/quran-uthmani,bn.bengali,ar.alafasy`;
        const res = await fetch(url);
        const json = await res.json();
        
        if (json.code !== 200) throw new Error("Ayah not found");

        const data = {
          surah: surah,
          ayah: ayah,
          surahName: json.data[0].surah.name,
          surahEnName: json.data[0].surah.englishName,
          arabic: json.data[0].text,
          bangla: json.data[1].text,
          audio: json.data[2].audio
        };

        await saveToDB('ayat', { key: dbKey, data: data });
        return data;
      } catch (e) {
        console.error("Error fetching Ayah:", e);
        return null;
      }
    },

    // Get a full Surah
    getSurah: async (surahId) => {
      const cached = await getFromDB('surahs', surahId);
      if (cached && cached.isComplete) return cached.data;

      try {
        const url = `https://api.alquran.cloud/v1/surah/${surahId}/editions/quran-uthmani,bn.bengali,ar.alafasy`;
        const res = await fetch(url);
        const json = await res.json();
        
        if (json.code !== 200) throw new Error("Surah not found");
        
        const data = {
          id: surahId,
          name: json.data[0].name,
          englishName: json.data[0].englishName,
          englishNameTranslation: json.data[0].englishNameTranslation,
          revelationType: json.data[0].revelationType,
          ayahs: []
        };

        const numAyahs = json.data[0].ayahs.length;
        for (let i = 0; i < numAyahs; i++) {
          data.ayahs.push({
            numberInSurah: json.data[0].ayahs[i].numberInSurah,
            arabic: json.data[0].ayahs[i].text,
            bangla: json.data[1].ayahs[i].text,
            audio: json.data[2].ayahs[i].audio
          });
        }

        await saveToDB('surahs', { id: surahId, data: data, isComplete: true });
        return data;
      } catch (e) {
        console.error("Error fetching full Surah:", e);
        return null;
      }
    },
    
    // Get list of all Surahs (lightweight)
    getMetadata: async () => {
      const cached = await getFromDB('surahs', 'metadata');
      if (cached) return cached.data;

      try {
         const res = await fetch('https://api.alquran.cloud/v1/surah');
         const json = await res.json();
         if (json.code === 200) {
            await saveToDB('surahs', { id: 'metadata', data: json.data });
            return json.data;
         }
         return [];
      } catch(e) {
         console.error("Error fetching metadata", e);
         return [];
      }
    }
  };


  // --- HADITH API ---
  // Using fawazahmed0 API (has bengali) or similar reliable open source
  const HadithAPI = {
    getHadith: async (book, number) => {
       // book names: bukhari, muslim, nasai, abudawud, tirmidhi, ibnmajah
       const dbKey = `${book}_${number}`;
       const cached = await getFromDB('hadith', dbKey);
       if (cached) return cached.data;

       try {
           // Mapping common Bengali names to API book keys
           let apiBook = 'bukhari';
           book = book.toLowerCase();
           if (book.includes('bukhari') || book.includes('বুখারী')) apiBook = 'bukhari';
           else if (book.includes('muslim') || book.includes('মুসলিম')) apiBook = 'muslim';
           else if (book.includes('abudawud') || book.includes('আবু দাউদ')) apiBook = 'abudawud';
           else if (book.includes('tirmidhi') || book.includes('তিরমিযী')) apiBook = 'tirmidhi';
           else if (book.includes('nasai') || book.includes('নাসাঈ')) apiBook = 'nasai';
           else if (book.includes('majah') || book.includes('মাজাহ')) apiBook = 'ibnmajah';

           // Using jsdelivr fawazahmed0 hadith API (Bengali translation available)
           const url = `https://cdn.jsdelivr.net/gh/fawazahmed0/hadith-api@1/editions/ben-${apiBook}/${number}.json`;
           const res = await fetch(url);
           if (!res.ok) throw new Error("Hadith not found");
           const json = await res.json();

           const data = {
               book: apiBook,
               number: number,
               bangla: json.hadiths[0].text,
               grade: json.hadiths[0].grades.length > 0 ? json.hadiths[0].grades[0].grade : "Not specified",
               arabic: null // Usually this API splits languages. For fallback Arabic we need another call, skipping for now to keep it fast, or we could just use Bangla + TTS.
           };

           await saveToDB('hadith', { key: dbKey, data: data });
           return data;

       } catch (e) {
           console.error("Error fetching Hadith:", e);
           return null;
       }
    }
  };


  // --- UI RENDERER (Embed Cards) ---
  const UIRenderer = {
      // Audio state management
      currentAudio: null,
      
      playAudio: (url, btnElement) => {
         if (UIRenderer.currentAudio) {
             UIRenderer.currentAudio.pause();
             const oldBtns = document.querySelectorAll('.audio-playing');
             oldBtns.forEach(btn => {
                 btn.classList.remove('audio-playing');
                 btn.innerHTML = '<span class="material-symbols-rounded">play_circle</span> প্লে';
             });
         }
         
         if (url) {
             UIRenderer.currentAudio = new Audio(url);
             UIRenderer.currentAudio.play();
             if (btnElement) {
                btnElement.classList.add('audio-playing');
                btnElement.innerHTML = '<span class="material-symbols-rounded">pause_circle</span> প্লে হচ্ছে';
             }
             
             UIRenderer.currentAudio.onended = () => {
                 if (btnElement) {
                    btnElement.classList.remove('audio-playing');
                    btnElement.innerHTML = '<span class="material-symbols-rounded">play_circle</span> প্লে';
                 }
             };
         }
      },
      
      playTTS: (text, btnElement) => {
          if (window.Logic && window.Logic.isSpeaking) {
              window.Logic.stopSpeak();
              if(btnElement) btnElement.innerHTML = '<span class="material-symbols-rounded">record_voice_over</span> শুনুন';
              return;
          }
          
           if (typeof responsiveVoice !== 'undefined') {
              if (window.Logic) window.Logic.isSpeaking = true;
              if (btnElement) btnElement.innerHTML = '<span class="material-symbols-rounded">stop_circle</span> থামুন';
              responsiveVoice.speak(text, "Bengali Female", {
                rate: 0.9,
                onend: () => {
                   if (window.Logic) window.Logic.isSpeaking = false;
                   if (btnElement) btnElement.innerHTML = '<span class="material-symbols-rounded">record_voice_over</span> শুনুন';
                }
              });
            } else if ('speechSynthesis' in window) {
              if (window.Logic) window.Logic.isSpeaking = true;
              if (btnElement) btnElement.innerHTML = '<span class="material-symbols-rounded">stop_circle</span> থামুন';
              const utterance = new SpeechSynthesisUtterance(text);
              utterance.lang = 'bn-BD';
              utterance.rate = 0.9;
              utterance.onend = () => {
                   if (window.Logic) window.Logic.isSpeaking = false;
                   if (btnElement) btnElement.innerHTML = '<span class="material-symbols-rounded">record_voice_over</span> শুনুন';
              };
              window.speechSynthesis.speak(utterance);
            }
      },

      buildQuranCard: (ayahData, originalRefText) => {
          const id = 'quran_' + Math.random().toString(36).substr(2, 9);
          return `
          <div class="islamic-embed-card" id="${id}">
              <div class="embed-header">
                 <span class="material-symbols-rounded" style="color:var(--accent-primary);">menu_book</span>
                 <span>${originalRefText} (${ayahData.surahEnName})</span>
              </div>
              <div class="embed-body">
                 <div class="arabic-text" style="font-size:28px; border:none; background:transparent; padding:0; margin-bottom:12px;">
                    ${ayahData.arabic} ۝
                 </div>
                 <div style="font-size:16px; color:var(--text-secondary); line-height:1.6; padding-left:12px; border-left:3px solid var(--accent-primary);">
                    ${ayahData.bangla}
                 </div>
              </div>
              <div class="embed-footer">
                  <button class="embed-btn" onclick="IslamicModule.UI.playAudio('${ayahData.audio}', this)">
                      <span class="material-symbols-rounded">play_circle</span> প্লে
                  </button>
                  <button class="embed-btn" onclick="navigator.clipboard.writeText('${ayahData.arabic}\\n\\n${ayahData.bangla}')">
                      <span class="material-symbols-rounded">content_copy</span> কপি
                  </button>
              </div>
          </div>`;
      },

      buildHadithCard: (hadithData, originalRefText) => {
          const id = 'hadith_' + Math.random().toString(36).substr(2, 9);
          // Escaping quotes for JS inline call
          const safeText = hadithData.bangla.replace(/'/g, "\\'").replace(/"/g, '&quot;');
          return `
          <div class="islamic-embed-card" style="border-left-color: #f59e0b;" id="${id}">
              <div class="embed-header">
                 <span class="material-symbols-rounded" style="color:#f59e0b;">library_books</span>
                 <span>${originalRefText}</span>
                 <span style="margin-left:auto; font-size:12px; background:#fef3c7; color:#b45309; padding:2px 8px; border-radius:12px;">${hadithData.grade}</span>
              </div>
              <div class="embed-body">
                 <div style="font-size:16px; color:var(--text-primary); line-height:1.6; padding:12px; background:var(--bg-main); border-radius:12px;">
                    ${hadithData.bangla}
                 </div>
              </div>
              <div class="embed-footer">
                  <button class="embed-btn" onclick="IslamicModule.UI.playTTS('${safeText}', this)">
                      <span class="material-symbols-rounded">record_voice_over</span> শুনুন
                  </button>
                  <button class="embed-btn" onclick="navigator.clipboard.writeText('${safeText}')">
                      <span class="material-symbols-rounded">content_copy</span> কপি
                  </button>
              </div>
          </div>`;
      }
  };

  // --- REGEX REFERENCE MATCHER ---
  // Transforms text like "সূরা বাকারা ২:২৫৫" or "সহীহ বুখারী, হাদিস নং ৩" into HTML placeholders
  // and asynchronously fetches data to replace placeholders with rich cards.
  const AutoMatcher = {
      processText: async (text, containerElement) => {
          // 1. Regex for Quran: e.g. "সূরা বাকারা ২:২৫৫", "কুরআন ২:২৫৫", "Ayah 2:255"
          // Matches (SurahName/Quran) (up to 3 words) (Number):(Number)
          const quranRegex = /(?:সূরা|সুরা|কুরআন|surah)[^\d]*?(\d+)\s*[:|ঃ]\s*(\d+)/gi;
          
          // 2. Regex for Hadith: e.g. "সহীহ বুখারী, হাদিস নং ৩", "Bukhari 3", "মুসলিম হাদিস ৩"
          const hadithRegex = /(বুখারী|মুসলিম|আবু দাউদ|তিরমিযী|নাসাঈ|মাজাহ|bukhari|muslim|dawud|tirmidhi|nasai|majah)[^\d]*?(\d+)/gi;

          let modifiedText = text;
          const fetchPromises = [];

          // Match Quran
          let match;
          while ((match = quranRegex.exec(text)) !== null) {
              const fullMatch = match[0];
              const surah = match[1];
              const ayah = match[2];
              const placeholderId = 'q_placeholder_' + Math.random().toString(36).substr(2, 9);
              
              modifiedText = modifiedText.replace(fullMatch, `<div id="${placeholderId}" class="loading-embed">লোড হচ্ছে: ${fullMatch}...</div>`);
              
              fetchPromises.push({
                  type: 'quran',
                  placeholder: placeholderId,
                  surah: surah,
                  ayah: ayah,
                  originalText: fullMatch
              });
          }

          // Match Hadith
          while ((match = hadithRegex.exec(text)) !== null) {
              const fullMatch = match[0];
              const book = match[1];
              const hadithNum = match[2];
              const placeholderId = 'h_placeholder_' + Math.random().toString(36).substr(2, 9);
              
              // Prevent overlapping matches if AI generated something weird
              if (!modifiedText.includes(fullMatch)) continue;

              modifiedText = modifiedText.replace(fullMatch, `<div id="${placeholderId}" class="loading-embed">লোড হচ্ছে: ${fullMatch}...</div>`);
              
              fetchPromises.push({
                  type: 'hadith',
                  placeholder: placeholderId,
                  book: book,
                  number: hadithNum,
                  originalText: fullMatch
              });
          }

          // Inject initial text with placeholders into DOM
          containerElement.innerHTML = modifiedText;

          // Asynchronously resolve all matched references
          for (let req of fetchPromises) {
              try {
                  const el = document.getElementById(req.placeholder);
                  if (!el) continue;

                  if (req.type === 'quran') {
                      const data = await QuranAPI.getAyah(req.surah, req.ayah);
                      if (data) {
                          el.outerHTML = UIRenderer.buildQuranCard(data, req.originalText);
                      } else {
                          el.outerHTML = `<b>${req.originalText}</b> (তথ্য পাওয়া যায়নি)`;
                      }
                  } else if (req.type === 'hadith') {
                      const data = await HadithAPI.getHadith(req.book, req.number);
                      if (data) {
                          el.outerHTML = UIRenderer.buildHadithCard(data, req.originalText);
                      } else {
                          el.outerHTML = `<b>${req.originalText}</b> (তথ্য পাওয়া যায়নি)`;
                      }
                  }
              } catch (e) {
                  console.error("Match replace error", e);
                  const el = document.getElementById(req.placeholder);
                  if (el) el.outerHTML = `<b>${req.originalText}</b>`;
              }
          }
      },
      
      // We need to append some CSS styles dynamically for the embed cards to main app
      injectStyles: () => {
         if (document.getElementById('islamic-embed-styles')) return;
         const style = document.createElement('style');
         style.id = 'islamic-embed-styles';
         style.innerHTML = `
            .islamic-embed-card {
                background: var(--bg-surface, #ffffff);
                border: 1px solid var(--border-color, #e5e7eb);
                border-left: 5px solid var(--accent-primary, #0b5e42);
                border-radius: 16px;
                margin: 20px 0;
                overflow: hidden;
                box-shadow: 0 4px 12px rgba(0,0,0,0.05);
                font-family: inherit;
            }
            .islamic-embed-card .embed-header {
                display: flex;
                align-items: center;
                gap: 8px;
                padding: 12px 16px;
                background: rgba(0,0,0,0.02);
                border-bottom: 1px solid var(--border-color, #e5e7eb);
                font-weight: bold;
                font-size: 14px;
            }
            .islamic-embed-card .embed-body {
                padding: 16px;
            }
            .islamic-embed-card .embed-footer {
                display: flex;
                gap: 8px;
                padding: 10px 16px;
                background: rgba(0,0,0,0.01);
                border-top: 1px dashed var(--border-color, #e5e7eb);
            }
            .embed-btn {
                background: transparent;
                border: 1px solid var(--border-color, #e5e7eb);
                padding: 6px 12px;
                border-radius: 20px;
                cursor: pointer;
                display:flex;
                align-items:center;
                gap:6px;
                font-weight:600;
                font-size:13px;
                color: var(--text-primary, #1f2937);
                transition: all 0.2s;
            }
            .embed-btn:hover {
                background: var(--bg-main, #f3f4f6);
            }
            .audio-playing {
                background: #ecfdf5 !important;
                border-color: #10b981 !important;
                color: #047857 !important;
            }
            .loading-embed {
                display: inline-block;
                padding: 4px 12px;
                background: var(--mag-3-bg, #e3f2fd);
                color: var(--mag-3-border, #64b5f6);
                border-radius: 20px;
                font-size: 14px;
                animation: pulse 1.5s infinite;
            }
            @keyframes pulse {
                0% { opacity: 0.6; }
                50% { opacity: 1; }
                100% { opacity: 0.6; }
            }
         `;
         document.head.appendChild(style);
      }
  };

  return {
      init: async () => {
          await initDB();
          AutoMatcher.injectStyles();
      },
      Quran: QuranAPI,
      Hadith: HadithAPI,
      UI: UIRenderer,
      AutoMatcher: AutoMatcher
  };

})();
