/**
 * MEDIA.JS - Media Viewer Module for Vault OS
 * Handles viewing and manipulation of images, videos, PDFs, and ZIP files
 * Complete rebuild with advanced features and proxy integration
 */

class MediaViewer {
    constructor() {
        this.currentMedia = null;
        this.mediaList = [];
        this.currentIndex = 0;
        this.isFullscreen = false;
        this.viewerMode = 'image'; // 'image', 'video', 'pdf', 'zip'
        this.settings = {
            zoomLevel: 1,
            rotation: 0,
            brightness: 100,
            contrast: 100,
            saturation: 100,
            autoPlay: true,
            loop: true,
            volume: 0.8
        };
        
        // Initialize components
        this.initComponents();
        this.bindEvents();
        this.loadSettings();
        
        console.log('MediaViewer: Initialized');
    }

    /**
     * Initialize DOM components
     */
    initComponents() {
        // Create media viewer container
        this.container = document.createElement('div');
        this.container.className = 'media-viewer hidden';
        this.container.innerHTML = `
            <div class="media-overlay"></div>
            <div class="media-container">
                <!-- Header -->
                <div class="media-header">
                    <div class="media-info">
                        <span class="media-filename">File Name</span>
                        <span class="media-counter">1/10</span>
                    </div>
                    <div class="media-controls">
                        <button class="btn-icon" id="media-prev" title="Previous (←)">
                            <i>◀</i>
                        </button>
                        <button class="btn-icon" id="media-next" title="Next (→)">
                            <i>▶</i>
                        </button>
                        <button class="btn-icon" id="media-zoom-in" title="Zoom In (+)">
                            <i>⊕</i>
                        </button>
                        <button class="btn-icon" id="media-zoom-out" title="Zoom Out (-)">
                            <i>⊖</i>
                        </button>
                        <button class="btn-icon" id="media-rotate" title="Rotate (R)">
                            <i>↻</i>
                        </button>
                        <button class="btn-icon" id="media-fullscreen" title="Fullscreen (F)">
                            <i>⛶</i>
                        </button>
                        <button class="btn-icon" id="media-download" title="Download">
                            <i>⤓</i>
                        </button>
                        <button class="btn-icon" id="media-close" title="Close (ESC)">
                            <i>×</i>
                        </button>
                    </div>
                </div>

                <!-- Media Content Area -->
                <div class="media-content">
                    <div class="image-viewer hidden">
                        <img id="media-image" alt="Image">
                        <div class="image-controls">
                            <div class="slider-group">
                                <label>Brightness</label>
                                <input type="range" id="brightness-slider" min="0" max="200" value="100">
                            </div>
                            <div class="slider-group">
                                <label>Contrast</label>
                                <input type="range" id="contrast-slider" min="0" max="200" value="100">
                            </div>
                            <div class="slider-group">
                                <label>Saturation</label>
                                <input type="range" id="saturation-slider" min="0" max="200" value="100">
                            </div>
                        </div>
                    </div>

                    <div class="video-viewer hidden">
                        <video id="media-video" controls>
                            Your browser does not support the video tag.
                        </video>
                        <div class="video-controls">
                            <button class="btn-small" id="video-play">Play/Pause</button>
                            <button class="btn-small" id="video-loop">Loop: ON</button>
                            <button class="btn-small" id="video-mute">Mute</button>
                            <div class="volume-control">
                                <label>Volume</label>
                                <input type="range" id="volume-slider" min="0" max="100" value="80">
                            </div>
                        </div>
                    </div>

                    <div class="pdf-viewer hidden">
                        <div class="pdf-toolbar">
                            <button class="btn-small" id="pdf-prev">Previous Page</button>
                            <span class="pdf-page-info">Page: <span id="pdf-current">1</span> of <span id="pdf-total">1</span></span>
                            <button class="btn-small" id="pdf-next">Next Page</button>
                            <input type="number" id="pdf-page-input" min="1" value="1" style="width: 60px;">
                            <button class="btn-small" id="pdf-go">Go</button>
                            <span class="pdf-zoom">Zoom: <span id="pdf-zoom-level">100%</span></span>
                            <button class="btn-small" id="pdf-zoom-in">+</button>
                            <button class="btn-small" id="pdf-zoom-out">-</button>
                            <button class="btn-small" id="pdf-download-pdf">Download PDF</button>
                        </div>
                        <div class="pdf-container">
                            <canvas id="pdf-canvas"></canvas>
                        </div>
                        <div class="pdf-thumbnails">
                            <!-- Thumbnails will be generated here -->
                        </div>
                    </div>

                    <div class="zip-viewer hidden">
                        <div class="zip-header">
                            <h3>Archive Contents</h3>
                            <button class="btn-small" id="zip-extract-all">Extract All</button>
                        </div>
                        <div class="zip-file-list">
                            <table>
                                <thead>
                                    <tr>
                                        <th>Name</th>
                                        <th>Size</th>
                                        <th>Type</th>
                                        <th>Actions</th>
                                    </tr>
                                </thead>
                                <tbody id="zip-contents">
                                    <!-- ZIP contents will be loaded here -->
                                </tbody>
                            </table>
                        </div>
                        <div class="zip-preview">
                            <div class="preview-header">
                                <h4>Preview</h4>
                            </div>
                            <div class="preview-content" id="zip-preview-content">
                                Select a file to preview
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Footer -->
                <div class="media-footer">
                    <div class="media-properties">
                        <span class="prop" id="prop-size">Size: --</span>
                        <span class="prop" id="prop-type">Type: --</span>
                        <span class="prop" id="prop-dimensions">Dimensions: --</span>
                        <span class="prop" id="prop-modified">Modified: --</span>
                    </div>
                    <div class="media-actions">
                        <button class="btn-small" id="media-share">Share</button>
                        <button class="btn-small" id="media-info">Info</button>
                        <button class="btn-small" id="media-delete">Delete</button>
                    </div>
                </div>
            </div>
        `;
        
        document.body.appendChild(this.container);
        
        // Store references to elements
        this.elements = {
            imageViewer: this.container.querySelector('.image-viewer'),
            videoViewer: this.container.querySelector('.video-viewer'),
            pdfViewer: this.container.querySelector('.pdf-viewer'),
            zipViewer: this.container.querySelector('.zip-viewer'),
            mediaImage: this.container.querySelector('#media-image'),
            mediaVideo: this.container.querySelector('#media-video'),
            pdfCanvas: this.container.querySelector('#pdf-canvas'),
            pdfCurrent: this.container.querySelector('#pdf-current'),
            pdfTotal: this.container.querySelector('#pdf-total'),
            pdfPageInput: this.container.querySelector('#pdf-page-input'),
            zipContents: this.container.querySelector('#zip-contents'),
            zipPreview: this.container.querySelector('#zip-preview-content'),
            filename: this.container.querySelector('.media-filename'),
            counter: this.container.querySelector('.media-counter'),
            properties: {
                size: this.container.querySelector('#prop-size'),
                type: this.container.querySelector('#prop-type'),
                dimensions: this.container.querySelector('#prop-dimensions'),
                modified: this.container.querySelector('#prop-modified')
            }
        };
    }

    /**
     * Bind event listeners
     */
    bindEvents() {
        // Navigation
        this.container.querySelector('#media-prev').addEventListener('click', () => this.prev());
        this.container.querySelector('#media-next').addEventListener('click', () => this.next());
        this.container.querySelector('#media-close').addEventListener('click', () => this.close());
        
        // Zoom controls
        this.container.querySelector('#media-zoom-in').addEventListener('click', () => this.zoomIn());
        this.container.querySelector('#media-zoom-out').addEventListener('click', () => this.zoomOut());
        this.container.querySelector('#media-rotate').addEventListener('click', () => this.rotate());
        this.container.querySelector('#media-fullscreen').addEventListener('click', () => this.toggleFullscreen());
        this.container.querySelector('#media-download').addEventListener('click', () => this.downloadCurrent());
        
        // Image controls
        this.container.querySelector('#brightness-slider').addEventListener('input', (e) => this.adjustBrightness(e.target.value));
        this.container.querySelector('#contrast-slider').addEventListener('input', (e) => this.adjustContrast(e.target.value));
        this.container.querySelector('#saturation-slider').addEventListener('input', (e) => this.adjustSaturation(e.target.value));
        
        // Video controls
        this.container.querySelector('#video-play').addEventListener('click', () => this.togglePlayPause());
        this.container.querySelector('#video-loop').addEventListener('click', () => this.toggleLoop());
        this.container.querySelector('#video-mute').addEventListener('click', () => this.toggleMute());
        this.container.querySelector('#volume-slider').addEventListener('input', (e) => this.adjustVolume(e.target.value));
        
        // PDF controls
        this.container.querySelector('#pdf-prev').addEventListener('click', () => this.prevPage());
        this.container.querySelector('#pdf-next').addEventListener('click', () => this.nextPage());
        this.container.querySelector('#pdf-go').addEventListener('click', () => this.goToPage());
        this.container.querySelector('#pdf-zoom-in').addEventListener('click', () => this.pdfZoomIn());
        this.container.querySelector('#pdf-zoom-out').addEventListener('click', () => this.pdfZoomOut());
        this.container.querySelector('#pdf-download-pdf').addEventListener('click', () => this.downloadPDF());
        
        // ZIP controls
        this.container.querySelector('#zip-extract-all').addEventListener('click', () => this.extractAll());
        
        // Action buttons
        this.container.querySelector('#media-share').addEventListener('click', () => this.shareMedia());
        this.container.querySelector('#media-info').addEventListener('click', () => this.showInfo());
        this.container.querySelector('#media-delete').addEventListener('click', () => this.deleteMedia());
        
        // Keyboard shortcuts
        document.addEventListener('keydown', (e) => this.handleKeydown(e));
        
        // Fullscreen change
        document.addEventListener('fullscreenchange', () => this.handleFullscreenChange());
        document.addEventListener('webkitfullscreenchange', () => this.handleFullscreenChange());
        document.addEventListener('mozfullscreenchange', () => this.handleFullscreenChange());
        document.addEventListener('MSFullscreenChange', () => this.handleFullscreenChange());
    }

    /**
     * Load saved settings
     */
    loadSettings() {
        const saved = localStorage.getItem('mediaViewerSettings');
        if (saved) {
            this.settings = { ...this.settings, ...JSON.parse(saved) };
            this.applySettings();
        }
    }

    /**
     * Save settings
     */
    saveSettings() {
        localStorage.setItem('mediaViewerSettings', JSON.stringify(this.settings));
    }

    /**
     * Apply current settings
     */
    applySettings() {
        // Apply to image viewer
        if (this.elements.mediaImage) {
            this.elements.mediaImage.style.filter = `
                brightness(${this.settings.brightness}%)
                contrast(${this.settings.contrast}%)
                saturate(${this.settings.saturation}%)
            `;
        }
        
        // Apply to video
        if (this.elements.mediaVideo) {
            this.elements.mediaVideo.loop = this.settings.loop;
            this.elements.mediaVideo.volume = this.settings.volume / 100;
            this.elements.mediaVideo.autoplay = this.settings.autoPlay;
        }
        
        // Update sliders
        this.container.querySelector('#brightness-slider').value = this.settings.brightness;
        this.container.querySelector('#contrast-slider').value = this.settings.contrast;
        this.container.querySelector('#saturation-slider').value = this.settings.saturation;
        this.container.querySelector('#volume-slider').value = this.settings.volume * 100;
        
        // Update button states
        this.container.querySelector('#video-loop').textContent = 
            `Loop: ${this.settings.loop ? 'ON' : 'OFF'}`;
    }

    /**
     * Open media viewer
     */
    async open(file, files = []) {
        try {
            this.currentMedia = file;
            this.mediaList = files.length > 0 ? files : [file];
            this.currentIndex = this.mediaList.findIndex(f => f.id === file.id);
            
            // Show viewer
            this.container.classList.remove('hidden');
            document.body.style.overflow = 'hidden';
            
            // Load the media
            await this.loadMedia(file);
            
            // Update UI
            this.updateUI();
            
            console.log(`MediaViewer: Opened ${file.name}`);
        } catch (error) {
            console.error('MediaViewer: Failed to open media:', error);
            this.showError(`Failed to open ${file.name}`);
        }
    }

    /**
     * Load media based on type
     */
    async loadMedia(file) {
        // Reset all viewers
        this.hideAllViewers();
        
        // Get authenticated URL via proxy
        const mediaUrl = await this.getMediaUrl(file);
        
        // Determine media type
        const type = this.getMediaType(file.mimeType || file.type);
        this.viewerMode = type;
        
        switch (type) {
            case 'image':
                await this.loadImage(mediaUrl, file);
                break;
            case 'video':
                await this.loadVideo(mediaUrl, file);
                break;
            case 'pdf':
                await this.loadPDF(mediaUrl, file);
                break;
            case 'zip':
                await this.loadZIP(mediaUrl, file);
                break;
            default:
                throw new Error(`Unsupported media type: ${file.mimeType}`);
        }
        
        // Update properties
        this.updateProperties(file);
    }

    /**
     * Get media URL with authentication
     */
    async getMediaUrl(file) {
        try {
            const token = localStorage.getItem('googleAccessToken');
            if (!token) {
                throw new Error('Not authenticated');
            }
            
            // Use proxy for authenticated access
            const proxyType = file.mimeType?.startsWith('video/') ? 'media' : 'full';
            const proxyUrl = window.CONFIG?.PROXY_URLS?.[proxyType] || '/api/proxy';
            
            const encodedUrl = encodeURIComponent(`https://www.googleapis.com/drive/v3/files/${file.id}?alt=media`);
            const encodedToken = encodeURIComponent(token);
            
            return `${proxyUrl}?url=${encodedUrl}&token=${encodedToken}`;
        } catch (error) {
            console.error('MediaViewer: Failed to get media URL:', error);
            throw error;
        }
    }

    /**
     * Determine media type from MIME type
     */
    getMediaType(mimeType) {
        if (!mimeType) return 'unknown';
        
        if (mimeType.startsWith('image/')) return 'image';
        if (mimeType.startsWith('video/')) return 'video';
        if (mimeType === 'application/pdf') return 'pdf';
        if (mimeType === 'application/zip' || 
            mimeType === 'application/x-rar-compressed' ||
            mimeType === 'application/x-tar' ||
            mimeType === 'application/gzip') return 'zip';
        
        return 'unknown';
    }

    /**
     * Load image file
     */
    async loadImage(url, file) {
        this.elements.imageViewer.classList.remove('hidden');
        
        return new Promise((resolve, reject) => {
            this.elements.mediaImage.onload = () => {
                this.resetImageTransform();
                this.applySettings();
                resolve();
            };
            
            this.elements.mediaImage.onerror = reject;
            this.elements.mediaImage.src = url;
            this.elements.mediaImage.alt = file.name;
        });
    }

    /**
     * Load video file
     */
    async loadVideo(url, file) {
        this.elements.videoViewer.classList.remove('hidden');
        
        this.elements.mediaVideo.src = url;
        this.elements.mediaVideo.dataset.filename = file.name;
        
        // Apply settings
        this.applySettings();
        
        // Auto-play if enabled
        if (this.settings.autoPlay) {
            try {
                await this.elements.mediaVideo.play();
            } catch (error) {
                console.warn('MediaViewer: Autoplay prevented:', error);
            }
        }
    }

    /**
     * Load PDF file
     */
    async loadPDF(url, file) {
        this.elements.pdfViewer.classList.remove('hidden');
        
        try {
            // Initialize PDF.js if available
            if (typeof pdfjsLib === 'undefined') {
                await this.loadPDFJS();
            }
            
            // Load PDF document
            const loadingTask = pdfjsLib.getDocument(url);
            this.pdfDocument = await loadingTask.promise;
            this.pdfPage = 1;
            this.pdfZoom = 1.0;
            
            // Render first page
            await this.renderPDFPage();
            
            // Generate thumbnails
            await this.generatePDFThumbnails();
            
        } catch (error) {
            console.error('MediaViewer: Failed to load PDF:', error);
            this.showError('Failed to load PDF. Make sure PDF.js is loaded.');
        }
    }

    /**
     * Load PDF.js library
     */
    async loadPDFJS() {
        return new Promise((resolve, reject) => {
            if (typeof pdfjsLib !== 'undefined') {
                resolve();
                return;
            }
            
            const script = document.createElement('script');
            script.src = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.min.js';
            script.onload = resolve;
            script.onerror = reject;
            document.head.appendChild(script);
        });
    }

    /**
     * Render current PDF page
     */
    async renderPDFPage() {
        if (!this.pdfDocument) return;
        
        try {
            const page = await this.pdfDocument.getPage(this.pdfPage);
            const viewport = page.getViewport({ scale: this.pdfZoom });
            const canvas = this.elements.pdfCanvas;
            const context = canvas.getContext('2d');
            
            // Set canvas dimensions
            canvas.height = viewport.height;
            canvas.width = viewport.width;
            
            // Render PDF page
            const renderContext = {
                canvasContext: context,
                viewport: viewport
            };
            
            await page.render(renderContext).promise;
            
            // Update page info
            this.elements.pdfCurrent.textContent = this.pdfPage;
            this.elements.pdfTotal.textContent = this.pdfDocument.numPages;
            this.elements.pdfPageInput.value = this.pdfPage;
            
            // Update zoom display
            document.getElementById('pdf-zoom-level').textContent = 
                `${Math.round(this.pdfZoom * 100)}%`;
                
        } catch (error) {
            console.error('MediaViewer: Failed to render PDF page:', error);
        }
    }

    /**
     * Generate PDF thumbnails
     */
    async generatePDFThumbnails() {
        if (!this.pdfDocument || this.pdfDocument.numPages > 50) {
            return; // Don't generate thumbnails for large PDFs
        }
        
        const container = this.container.querySelector('.pdf-thumbnails');
        container.innerHTML = '';
        
        for (let i = 1; i <= Math.min(this.pdfDocument.numPages, 20); i++) {
            const thumb = document.createElement('div');
            thumb.className = `pdf-thumb ${i === this.pdfPage ? 'active' : ''}`;
            thumb.textContent = i;
            thumb.addEventListener('click', () => {
                this.pdfPage = i;
                this.renderPDFPage();
                this.updateThumbnailSelection();
            });
            container.appendChild(thumb);
        }
    }

    /**
     * Update thumbnail selection
     */
    updateThumbnailSelection() {
        const thumbs = this.container.querySelectorAll('.pdf-thumb');
        thumbs.forEach((thumb, index) => {
            thumb.classList.toggle('active', index + 1 === this.pdfPage);
        });
    }

    /**
     * Load ZIP file
     */
    async loadZIP(url, file) {
        this.elements.zipViewer.classList.remove('hidden');
        
        try {
            // Load JSZip if available
            if (typeof JSZip === 'undefined') {
                await this.loadJSZip();
            }
            
            // Fetch and parse ZIP
            const response = await fetch(url);
            const arrayBuffer = await response.arrayBuffer();
            this.zipFile = await JSZip.loadAsync(arrayBuffer);
            
            // Display contents
            await this.displayZipContents();
            
        } catch (error) {
            console.error('MediaViewer: Failed to load ZIP:', error);
            this.showError('Failed to load ZIP archive');
        }
    }

    /**
     * Load JSZip library
     */
    async loadJSZip() {
        return new Promise((resolve, reject) => {
            if (typeof JSZip !== 'undefined') {
                resolve();
                return;
            }
            
            const script = document.createElement('script');
            script.src = 'https://cdnjs.cloudflare.com/ajax/libs/jszip/3.10.1/jszip.min.js';
            script.onload = resolve;
            script.onerror = reject;
            document.head.appendChild(script);
        });
    }

    /**
     * Display ZIP file contents
     */
    async displayZipContents() {
        if (!this.zipFile) return;
        
        const tbody = this.elements.zipContents;
        tbody.innerHTML = '';
        
        let index = 0;
        for (const [filename, file] of Object.entries(this.zipFile.files)) {
            const row = document.createElement('tr');
            row.dataset.index = index++;
            
            // Skip directory entries
            if (file.dir) continue;
            
            // Filename
            const nameCell = document.createElement('td');
            nameCell.textContent = filename;
            nameCell.title = filename;
            
            // Size
            const sizeCell = document.createElement('td');
            sizeCell.textContent = this.formatSize(file._data.uncompressedSize || 0);
            
            // Type
            const typeCell = document.createElement('td');
            const ext = filename.split('.').pop().toLowerCase();
            typeCell.textContent = ext;
            
            // Actions
            const actionCell = document.createElement('td');
            const previewBtn = document.createElement('button');
            previewBtn.className = 'btn-tiny';
            previewBtn.textContent = 'Preview';
            previewBtn.addEventListener('click', () => this.previewZipFile(filename));
            
            const extractBtn = document.createElement('button');
            extractBtn.className = 'btn-tiny';
            extractBtn.textContent = 'Extract';
            extractBtn.addEventListener('click', () => this.extractZipFile(filename));
            
            actionCell.appendChild(previewBtn);
            actionCell.appendChild(extractBtn);
            
            row.appendChild(nameCell);
            row.appendChild(sizeCell);
            row.appendChild(typeCell);
            row.appendChild(actionCell);
            tbody.appendChild(row);
        }
    }

    /**
     * Preview a file from ZIP archive
     */
    async previewZipFile(filename) {
        if (!this.zipFile) return;
        
        const file = this.zipFile.files[filename];
        if (!file || file.dir) return;
        
        try {
            const content = await file.async('blob');
            const url = URL.createObjectURL(content);
            const mimeType = this.getMimeTypeFromFilename(filename);
            
            if (mimeType.startsWith('image/')) {
                this.elements.zipPreview.innerHTML = `<img src="${url}" alt="${filename}" style="max-width: 100%;">`;
            } else if (mimeType.startsWith('text/')) {
                const text = await file.async('text');
                this.elements.zipPreview.innerHTML = `<pre>${this.escapeHtml(text)}</pre>`;
            } else {
                this.elements.zipPreview.innerHTML = `
                    <div class="preview-info">
                        <p><strong>${filename}</strong></p>
                        <p>Type: ${mimeType}</p>
                        <p>Size: ${this.formatSize(file._data.uncompressedSize)}</p>
                        <p><a href="${url}" download="${filename}">Download this file</a></p>
                    </div>
                `;
            }
            
            // Clean up URL after preview
            setTimeout(() => URL.revokeObjectURL(url), 1000);
            
        } catch (error) {
            console.error('MediaViewer: Failed to preview ZIP file:', error);
            this.elements.zipPreview.innerHTML = '<p>Failed to preview file</p>';
        }
    }

    /**
     * Extract a file from ZIP archive
     */
    async extractZipFile(filename) {
        if (!this.zipFile) return;
        
        const file = this.zipFile.files[filename];
        if (!file || file.dir) return;
        
        try {
            const content = await file.async('blob');
            const url = URL.createObjectURL(content);
            const a = document.createElement('a');
            a.href = url;
            a.download = filename;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            
            // Clean up
            setTimeout(() => URL.revokeObjectURL(url), 1000);
            
            this.showSuccess(`Extracted: ${filename}`);
            
        } catch (error) {
            console.error('MediaViewer: Failed to extract file:', error);
            this.showError(`Failed to extract ${filename}`);
        }
    }

    /**
     * Extract all files from ZIP archive
     */
    async extractAll() {
        if (!this.zipFile || !window.JSZip) {
            this.showError('JSZip not available');
            return;
        }
        
        try {
            // Create a ZIP file containing all extracted files
            const zip = new JSZip();
            
            for (const [filename, file] of Object.entries(this.zipFile.files)) {
                if (!file.dir) {
                    const content = await file.async('uint8array');
                    zip.file(filename, content);
                }
            }
            
            // Generate and download the new ZIP
            const content = await zip.generateAsync({ type: 'blob' });
            const url = URL.createObjectURL(content);
            const a = document.createElement('a');
            a.href = url;
            a.download = `extracted-${this.currentMedia.name}`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            
            // Clean up
            setTimeout(() => URL.revokeObjectURL(url), 1000);
            
            this.showSuccess('All files extracted successfully');
            
        } catch (error) {
            console.error('MediaViewer: Failed to extract all files:', error);
            this.showError('Failed to extract all files');
        }
    }

    /**
     * Hide all viewers
     */
    hideAllViewers() {
        this.elements.imageViewer.classList.add('hidden');
        this.elements.videoViewer.classList.add('hidden');
        this.elements.pdfViewer.classList.add('hidden');
        this.elements.zipViewer.classList.add('hidden');
    }

    /**
     * Reset image transformations
     */
    resetImageTransform() {
        this.settings.zoomLevel = 1;
        this.settings.rotation = 0;
        this.settings.brightness = 100;
        this.settings.contrast = 100;
        this.settings.saturation = 100;
        
        if (this.elements.mediaImage) {
            this.elements.mediaImage.style.transform = 'scale(1) rotate(0deg)';
            this.elements.mediaImage.style.filter = 'none';
        }
        
        this.applySettings();
    }

    /**
     * Update UI elements
     */
    updateUI() {
        if (!this.currentMedia) return;
        
        // Update filename and counter
        this.elements.filename.textContent = this.currentMedia.name;
        this.elements.counter.textContent = `${this.currentIndex + 1}/${this.mediaList.length}`;
        
        // Update properties
        this.updateProperties(this.currentMedia);
    }

    /**
     * Update file properties display
     */
    updateProperties(file) {
        this.elements.properties.size.textContent = `Size: ${file.size || '--'}`;
        this.elements.properties.type.textContent = `Type: ${file.mimeType || file.type || '--'}`;
        this.elements.properties.modified.textContent = `Modified: ${file.modified || '--'}`;
        
        // Get dimensions for images
        if (this.viewerMode === 'image' && this.elements.mediaImage.naturalWidth) {
            this.elements.properties.dimensions.textContent = 
                `Dimensions: ${this.elements.mediaImage.naturalWidth}×${this.elements.mediaImage.naturalHeight}`;
        } else {
            this.elements.properties.dimensions.textContent = 'Dimensions: --';
        }
    }

    /**
     * Navigate to previous media
     */
    async prev() {
        if (this.mediaList.length <= 1) return;
        
        this.currentIndex = (this.currentIndex - 1 + this.mediaList.length) % this.mediaList.length;
        this.currentMedia = this.mediaList[this.currentIndex];
        
        await this.loadMedia(this.currentMedia);
        this.updateUI();
    }

    /**
     * Navigate to next media
     */
    async next() {
        if (this.mediaList.length <= 1) return;
        
        this.currentIndex = (this.currentIndex + 1) % this.mediaList.length;
        this.currentMedia = this.mediaList[this.currentIndex];
        
        await this.loadMedia(this.currentMedia);
        this.updateUI();
    }

    /**
     * Zoom in
     */
    zoomIn() {
        if (this.viewerMode === 'image') {
            this.settings.zoomLevel = Math.min(this.settings.zoomLevel + 0.25, 5);
            this.elements.mediaImage.style.transform = 
                `scale(${this.settings.zoomLevel}) rotate(${this.settings.rotation}deg)`;
        } else if (this.viewerMode === 'pdf') {
            this.pdfZoom += 0.25;
            this.renderPDFPage();
        }
    }

    /**
     * Zoom out
     */
    zoomOut() {
        if (this.viewerMode === 'image') {
            this.settings.zoomLevel = Math.max(this.settings.zoomLevel - 0.25, 0.1);
            this.elements.mediaImage.style.transform = 
                `scale(${this.settings.zoomLevel}) rotate(${this.settings.rotation}deg)`;
        } else if (this.viewerMode === 'pdf') {
            this.pdfZoom = Math.max(this.pdfZoom - 0.25, 0.25);
            this.renderPDFPage();
        }
    }

    /**
     * Rotate image
     */
    rotate() {
        if (this.viewerMode !== 'image') return;
        
        this.settings.rotation = (this.settings.rotation + 90) % 360;
        this.elements.mediaImage.style.transform = 
            `scale(${this.settings.zoomLevel}) rotate(${this.settings.rotation}deg)`;
    }

    /**
     * Adjust brightness
     */
    adjustBrightness(value) {
        this.settings.brightness = parseInt(value);
        this.applySettings();
    }

    /**
     * Adjust contrast
     */
    adjustContrast(value) {
        this.settings.contrast = parseInt(value);
        this.applySettings();
    }

    /**
     * Adjust saturation
     */
    adjustSaturation(value) {
        this.settings.saturation = parseInt(value);
        this.applySettings();
    }

    /**
     * Toggle video play/pause
     */
    togglePlayPause() {
        if (!this.elements.mediaVideo) return;
        
        if (this.elements.mediaVideo.paused) {
            this.elements.mediaVideo.play();
        } else {
            this.elements.mediaVideo.pause();
        }
    }

    /**
     * Toggle video loop
     */
    toggleLoop() {
        this.settings.loop = !this.settings.loop;
        this.applySettings();
        this.saveSettings();
    }

    /**
     * Toggle video mute
     */
    toggleMute() {
        if (!this.elements.mediaVideo) return;
        
        this.elements.mediaVideo.muted = !this.elements.mediaVideo.muted;
        const btn = this.container.querySelector('#video-mute');
        btn.textContent = this.elements.mediaVideo.muted ? 'Unmute' : 'Mute';
    }

    /**
     * Adjust video volume
     */
    adjustVolume(value) {
        this.settings.volume = parseInt(value) / 100;
        this.applySettings();
        this.saveSettings();
    }

    /**
     * Previous PDF page
     */
    prevPage() {
        if (this.pdfPage > 1) {
            this.pdfPage--;
            this.renderPDFPage();
        }
    }

    /**
     * Next PDF page
     */
    nextPage() {
        if (this.pdfDocument && this.pdfPage < this.pdfDocument.numPages) {
            this.pdfPage++;
            this.renderPDFPage();
        }
    }

    /**
     * Go to specific PDF page
     */
    goToPage() {
        const pageNum = parseInt(this.elements.pdfPageInput.value);
        if (pageNum >= 1 && pageNum <= this.pdfDocument.numPages) {
            this.pdfPage = pageNum;
            this.renderPDFPage();
        }
    }

    /**
     * PDF zoom in
     */
    pdfZoomIn() {
        this.pdfZoom += 0.25;
        this.renderPDFPage();
    }

    /**
     * PDF zoom out
     */
    pdfZoomOut() {
        this.pdfZoom = Math.max(this.pdfZoom - 0.25, 0.25);
        this.renderPDFPage();
    }

    /**
     * Toggle fullscreen
     */
    toggleFullscreen() {
        if (!this.isFullscreen) {
            this.enterFullscreen();
        } else {
            this.exitFullscreen();
        }
    }

    /**
     * Enter fullscreen mode
     */
    enterFullscreen() {
        const elem = this.container.querySelector('.media-container');
        
        if (elem.requestFullscreen) {
            elem.requestFullscreen();
        } else if (elem.webkitRequestFullscreen) {
            elem.webkitRequestFullscreen();
        } else if (elem.mozRequestFullScreen) {
            elem.mozRequestFullScreen();
        } else if (elem.msRequestFullscreen) {
            elem.msRequestFullscreen();
        }
    }

    /**
     * Exit fullscreen mode
     */
    exitFullscreen() {
        if (document.exitFullscreen) {
            document.exitFullscreen();
        } else if (document.webkitExitFullscreen) {
            document.webkitExitFullscreen();
        } else if (document.mozCancelFullScreen) {
            document.mozCancelFullScreen();
        } else if (document.msExitFullscreen) {
            document.msExitFullscreen();
        }
    }

    /**
     * Handle fullscreen change
     */
    handleFullscreenChange() {
        this.isFullscreen = !!(
            document.fullscreenElement ||
            document.webkitFullscreenElement ||
            document.mozFullScreenElement ||
            document.msFullscreenElement
        );
        
        const btn = this.container.querySelector('#media-fullscreen');
        btn.innerHTML = this.isFullscreen ? '<i>⛶</i>' : '<i>⛶</i>';
        btn.title = this.isFullscreen ? 'Exit Fullscreen (F)' : 'Fullscreen (F)';
    }

    /**
     * Download current media
     */
    async downloadCurrent() {
        if (!this.currentMedia) return;
        
        try {
            // Use DriveManager if available
            if (window.driveManager && window.driveManager.downloadFile) {
                await window.driveManager.downloadFile(
                    this.currentMedia.id,
                    this.currentMedia.name
                );
            } else {
                // Fallback to direct download
                const url = await this.getMediaUrl(this.currentMedia);
                const a = document.createElement('a');
                a.href = url;
                a.download = this.currentMedia.name;
                document.body.appendChild(a);
                a.click();
                document.body.removeChild(a);
            }
        } catch (error) {
            console.error('MediaViewer: Download failed:', error);
            this.showError('Download failed');
        }
    }

    /**
     * Download PDF
     */
    async downloadPDF() {
        if (!this.currentMedia) return;
        await this.downloadCurrent();
    }

    /**
     * Share media
     */
    async shareMedia() {
        if (!this.currentMedia) return;
        
        try {
            const url = await this.getMediaUrl(this.currentMedia);
            
            if (navigator.share) {
                await navigator.share({
                    title: this.currentMedia.name,
                    text: 'Check out this file from Vault OS',
                    url: url
                });
            } else {
                // Fallback: copy to clipboard
                await navigator.clipboard.writeText(url);
                this.showSuccess('Link copied to clipboard');
            }
        } catch (error) {
            console.error('MediaViewer: Share failed:', error);
            this.showError('Share failed');
        }
    }

    /**
     * Show file info
     */
    showInfo() {
        if (!this.currentMedia) return;
        
        const info = `
            <strong>${this.currentMedia.name}</strong><br>
            Type: ${this.currentMedia.mimeType || this.currentMedia.type || 'Unknown'}<br>
            Size: ${this.currentMedia.size || 'Unknown'}<br>
            Modified: ${this.currentMedia.modified || 'Unknown'}<br>
            ID: ${this.currentMedia.id || 'N/A'}
        `;
        
        alert(info); // Replace with modal in production
    }

    /**
     * Delete current media
     */
    async deleteMedia() {
        if (!this.currentMedia) return;
        
        if (!confirm(`Delete "${this.currentMedia.name}"? This action cannot be undone.`)) {
            return;
        }
        
        try {
            if (window.driveManager && window.driveManager.deleteFile) {
                await window.driveManager.deleteFile(
                    this.currentMedia.id,
                    this.currentMedia.name
                );
                this.close();
            } else {
                throw new Error('DriveManager not available');
            }
        } catch (error) {
            console.error('MediaViewer: Delete failed:', error);
            this.showError('Delete failed');
        }
    }

    /**
     * Close media viewer
     */
    close() {
        this.container.classList.add('hidden');
        document.body.style.overflow = '';
        
        // Clean up
        if (this.elements.mediaVideo) {
            this.elements.mediaVideo.pause();
            this.elements.mediaVideo.src = '';
        }
        
        if (this.elements.mediaImage) {
            this.elements.mediaImage.src = '';
        }
        
        // Clear PDF
        if (this.pdfDocument) {
            this.pdfDocument.destroy();
            this.pdfDocument = null;
        }
        
        // Clear ZIP
        this.zipFile = null;
        
        this.currentMedia = null;
        this.mediaList = [];
        this.currentIndex = 0;
        
        console.log('MediaViewer: Closed');
    }

    /**
     * Handle keyboard shortcuts
     */
    handleKeydown(e) {
        if (this.container.classList.contains('hidden')) return;
        
        switch (e.key) {
            case 'Escape':
                e.preventDefault();
                if (this.isFullscreen) {
                    this.exitFullscreen();
                } else {
                    this.close();
                }
                break;
            case 'ArrowLeft':
                e.preventDefault();
                this.prev();
                break;
            case 'ArrowRight':
                e.preventDefault();
                this.next();
                break;
            case '+':
            case '=':
                e.preventDefault();
                this.zoomIn();
                break;
            case '-':
                e.preventDefault();
                this.zoomOut();
                break;
            case 'r':
            case 'R':
                e.preventDefault();
                this.rotate();
                break;
            case 'f':
            case 'F':
                e.preventDefault();
                this.toggleFullscreen();
                break;
            case ' ':
                if (this.viewerMode === 'video') {
                    e.preventDefault();
                    this.togglePlayPause();
                }
                break;
        }
    }

    /**
     * Utility: Format file size
     */
    formatSize(bytes) {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    }

    /**
     * Utility: Get MIME type from filename
     */
    getMimeTypeFromFilename(filename) {
        const ext = filename.split('.').pop().toLowerCase();
        const mimeTypes = {
            'jpg': 'image/jpeg',
            'jpeg': 'image/jpeg',
            'png': 'image/png',
            'gif': 'image/gif',
            'webp': 'image/webp',
            'txt': 'text/plain',
            'pdf': 'application/pdf',
            'zip': 'application/zip',
            'mp4': 'video/mp4',
            'webm': 'video/webm',
            'mp3': 'audio/mpeg'
        };
        return mimeTypes[ext] || 'application/octet-stream';
    }

    /**
     * Utility: Escape HTML
     */
    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    /**
     * Show error message
     */
    showError(message) {
        if (window.showToast) {
            window.showToast(message, 'error');
        } else {
            alert(`Error: ${message}`);
        }
    }

    /**
     * Show success message
     */
    showSuccess(message) {
        if (window.showToast) {
            window.showToast(message, 'success');
        } else {
            console.log('Success:', message);
        }
    }
}

// Export as global function
window.MediaViewer = MediaViewer;
window.openMediaViewer = async function(file, files = []) {
    if (!window.mediaViewerInstance) {
        window.mediaViewerInstance = new MediaViewer();
    }
    await window.mediaViewerInstance.open(file, files);
};

// Auto-initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    window.mediaViewerInstance = new MediaViewer();
});

console.log('MEDIA.JS loaded successfully');

