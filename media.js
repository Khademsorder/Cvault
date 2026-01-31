/* =========================================
   VAULT OS - MEDIA VIEWER MODULE
   Advanced Video, Image, PDF, ZIP Viewers
   ========================================= */

class MediaViewer {
    constructor() {
        this.currentFile = null;
        this.player = null;
        this.pdfDocument = null;
        this.currentPage = 1;
        this.totalPages = 1;
        this.pdfScale = 1.5;
        this.imageRotation = 0;
        this.imageScale = 1.0;
        this.imageFilters = {
            brightness: 100,
            contrast: 100,
            saturation: 100,
            hue: 0
        };
        this.zipArchive = null;
        this.isFullscreen = false;
        this.originalBodyOverflow = '';
        
        // Initialize
        this.init();
    }
    
    init() {
        // Setup event listeners
        this.setupEventListeners();
        
        // Initialize Plyr video player
        this.initPlyr();
        
        // Initialize PDF.js
        this.initPDFJS();
    }
    
    setupEventListeners() {
        // Close media viewer
        document.getElementById('close-media')?.addEventListener('click', () => {
            this.close();
        });
        
        // Download media
        document.getElementById('download-media')?.addEventListener('click', () => {
            this.downloadCurrentFile();
        });
        
        // Share media
        document.getElementById('share-media')?.addEventListener('click', () => {
            this.shareCurrentFile();
        });
        
        // Delete media
        document.getElementById('delete-media')?.addEventListener('click', () => {
            this.deleteCurrentFile();
        });
        
        // Video controls
        document.getElementById('rotate-video')?.addEventListener('click', () => {
            this.rotateVideo();
        });
        
        document.getElementById('fullscreen-video')?.addEventListener('click', () => {
            this.toggleFullscreen('video');
        });
        
        document.getElementById('quality-select')?.addEventListener('click', () => {
            this.showQualitySelector();
        });
        
        // Image controls
        document.getElementById('rotate-left')?.addEventListener('click', () => {
            this.rotateImage(-90);
        });
        
        document.getElementById('rotate-right')?.addEventListener('click', () => {
            this.rotateImage(90);
        });
        
        document.getElementById('zoom-in')?.addEventListener('click', () => {
            this.zoomImage(1.2);
        });
        
        document.getElementById('zoom-out')?.addEventListener('click', () => {
            this.zoomImage(0.8);
        });
        
        document.getElementById('fullscreen-image')?.addEventListener('click', () => {
            this.toggleFullscreen('image');
        });
        
        document.getElementById('save-image')?.addEventListener('click', () => {
            this.saveImage();
        });
        
        // Add image filter controls
        this.setupImageFilterControls();
        
        // PDF controls
        document.getElementById('prev-page')?.addEventListener('click', () => {
            this.prevPage();
        });
        
        document.getElementById('next-page')?.addEventListener('click', () => {
            this.nextPage();
        });
        
        document.getElementById('page-slider')?.addEventListener('input', (e) => {
            this.goToPage(parseInt(e.target.value));
        });
        
        document.getElementById('zoom-in-pdf')?.addEventListener('click', () => {
            this.zoomPDF(1.2);
        });
        
        document.getElementById('zoom-out-pdf')?.addEventListener('click', () => {
            this.zoomPDF(0.8);
        });
        
        document.getElementById('fullscreen-pdf')?.addEventListener('click', () => {
            this.toggleFullscreen('pdf');
        });
        
        // ZIP controls
        document.getElementById('extract-all')?.addEventListener('click', () => {
            this.extractAll();
        });
        
        // Open in Drive
        document.getElementById('open-in-drive')?.addEventListener('click', () => {
            this.openInDrive();
        });
        
        // Escape key to close viewer
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                if (this.isFullscreen) {
                    this.exitFullscreen();
                } else {
                    this.close();
                }
            }
            
            // Navigation shortcuts
            if (this.isOpen()) {
                switch (e.key) {
                    case 'ArrowLeft':
                        if (this.currentFile?.type === 'pdf') this.prevPage();
                        break;
                    case 'ArrowRight':
                        if (this.currentFile?.type === 'pdf') this.nextPage();
                        break;
                    case '+':
                    case '=':
                        if (e.ctrlKey) {
                            e.preventDefault();
                            if (this.currentFile?.type === 'image') this.zoomImage(1.2);
                            else if (this.currentFile?.type === 'pdf') this.zoomPDF(1.2);
                        }
                        break;
                    case '-':
                        if (e.ctrlKey) {
                            e.preventDefault();
                            if (this.currentFile?.type === 'image') this.zoomImage(0.8);
                            else if (this.currentFile?.type === 'pdf') this.zoomPDF(0.8);
                        }
                        break;
                    case 'r':
                    case 'R':
                        if (e.ctrlKey) {
                            e.preventDefault();
                            if (this.currentFile?.type === 'image') this.resetImageTransformations();
                        }
                        break;
                }
            }
        });
        
        // Fullscreen change listener
        document.addEventListener('fullscreenchange', () => {
            this.isFullscreen = !!document.fullscreenElement;
        });
    }
    
    setupImageFilterControls() {
        // Create filter controls panel
        const imageContainer = document.getElementById('image-container');
        if (!imageContainer) return;
        
        const filterPanel = document.createElement('div');
        filterPanel.className = 'filter-panel hidden';
        filterPanel.id = 'filter-panel';
        filterPanel.innerHTML = `
            <div class="filter-header">
                <h5>Image Filters</h5>
                <button class="btn-close-filter">
                    <i class="fas fa-times"></i>
                </button>
            </div>
            <div class="filter-controls">
                <div class="filter-control">
                    <label>Brightness</label>
                    <input type="range" id="brightness-slider" min="0" max="200" value="100">
                    <span id="brightness-value">100%</span>
                </div>
                <div class="filter-control">
                    <label>Contrast</label>
                    <input type="range" id="contrast-slider" min="0" max="200" value="100">
                    <span id="contrast-value">100%</span>
                </div>
                <div class="filter-control">
                    <label>Saturation</label>
                    <input type="range" id="saturation-slider" min="0" max="200" value="100">
                    <span id="saturation-value">100%</span>
                </div>
                <div class="filter-control">
                    <label>Hue</label>
                    <input type="range" id="hue-slider" min="-180" max="180" value="0">
                    <span id="hue-value">0°</span>
                </div>
                <button class="btn-reset-filters" id="reset-filters">
                    <i class="fas fa-redo"></i> Reset Filters
                </button>
            </div>
        `;
        
        imageContainer.appendChild(filterPanel);
        
        // Filter control events
        document.getElementById('brightness-slider')?.addEventListener('input', (e) => {
            this.imageFilters.brightness = parseInt(e.target.value);
            this.updateImageFilters();
            document.getElementById('brightness-value').textContent = `${e.target.value}%`;
        });
        
        document.getElementById('contrast-slider')?.addEventListener('input', (e) => {
            this.imageFilters.contrast = parseInt(e.target.value);
            this.updateImageFilters();
            document.getElementById('contrast-value').textContent = `${e.target.value}%`;
        });
        
        document.getElementById('saturation-slider')?.addEventListener('input', (e) => {
            this.imageFilters.saturation = parseInt(e.target.value);
            this.updateImageFilters();
            document.getElementById('saturation-value').textContent = `${e.target.value}%`;
        });
        
        document.getElementById('hue-slider')?.addEventListener('input', (e) => {
            this.imageFilters.hue = parseInt(e.target.value);
            this.updateImageFilters();
            document.getElementById('hue-value').textContent = `${e.target.value}°`;
        });
        
        document.getElementById('reset-filters')?.addEventListener('click', () => {
            this.resetImageFilters();
        });
        
        document.querySelector('.btn-close-filter')?.addEventListener('click', () => {
            filterPanel.classList.add('hidden');
        });
        
        // Add filter button to image controls
        const filterBtn = document.createElement('button');
        filterBtn.className = 'btn-control';
        filterBtn.id = 'toggle-filters';
        filterBtn.innerHTML = '<i class="fas fa-sliders-h"></i>';
        filterBtn.title = 'Filters';
        document.querySelector('.image-controls').appendChild(filterBtn);
        
        filterBtn.addEventListener('click', () => {
            filterPanel.classList.toggle('hidden');
        });
    }
    
    initPlyr() {
        // Initialize Plyr for video playback
        const videoElement = document.getElementById('video-player');
        if (videoElement && window.Plyr) {
            this.player = new Plyr(videoElement, {
                controls: ['play-large', 'play', 'progress', 'current-time', 'mute', 'volume', 'captions', 'settings', 'fullscreen'],
                settings: ['quality', 'speed'],
                quality: {
                    default: 720,
                    options: [4320, 2880, 2160, 1440, 1080, 720, 576, 480, 360, 240]
                },
                speed: {
                    selected: 1,
                    options: [0.5, 0.75, 1, 1.25, 1.5, 2]
                },
                keyboard: { focused: true, global: true },
                tooltips: { controls: true },
                captions: { active: true, language: 'auto', update: true }
            });
            
            // Handle quality change
            this.player.on('qualitychange', (quality) => {
                console.log('Quality changed to:', quality);
            });
            
            // Handle speed change
            this.player.on('ratechange', (speed) => {
                console.log('Speed changed to:', speed);
            });
        }
    }
    
    initPDFJS() {
        // PDF.js is loaded via CDN
        // We'll use the global pdfjsLib object
        if (typeof pdfjsLib !== 'undefined') {
            pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';
        }
    }
    
    async openVideo(file) {
        try {
            this.currentFile = file;
            
            // Hide all containers
            this.hideAllContainers();
            
            // Show video container
            const container = document.getElementById('video-container');
            container.classList.remove('hidden');
            
            // Show modal
            this.openModal();
            
            // Update file info
            this.updateFileInfo(file);
            
            // Get video URL
            const videoUrl = await this.getFileUrl(file.id);
            
            // Initialize player
            this.initVideoPlayer(videoUrl);
            
            // Update title
            document.getElementById('media-title').textContent = file.name;
            
        } catch (error) {
            console.error('Open video error:', error);
            this.showError('Failed to load video');
        }
    }
    
    async openImage(file) {
        try {
            this.currentFile = file;
            
            // Hide all containers
            this.hideAllContainers();
            
            // Show image container
            const container = document.getElementById('image-container');
            container.classList.remove('hidden');
            
            // Show modal
            this.openModal();
            
            // Update file info
            this.updateFileInfo(file);
            
            // Get image URL
            const imageUrl = await this.getFileUrl(file.id);
            
            // Load image
            await this.loadImage(imageUrl);
            
            // Reset transformations
            this.resetImageTransformations();
            this.resetImageFilters();
            
            // Update title
            document.getElementById('media-title').textContent = file.name;
            
        } catch (error) {
            console.error('Open image error:', error);
            this.showError('Failed to load image');
        }
    }
    
    async openPDF(file) {
        try {
            this.currentFile = file;
            
            // Hide all containers
            this.hideAllContainers();
            
            // Show PDF container
            const container = document.getElementById('pdf-container');
            container.classList.remove('hidden');
            
            // Show modal
            this.openModal();
            
            // Update file info
            this.updateFileInfo(file);
            
            // Get PDF URL
            const pdfUrl = await this.getFileUrl(file.id);
            
            // Load PDF
            await this.loadPDF(pdfUrl);
            
            // Update title
            document.getElementById('media-title').textContent = file.name;
            
        } catch (error) {
            console.error('Open PDF error:', error);
            this.showError('Failed to load PDF');
        }
    }
    
    async openZIP(file) {
        try {
            this.currentFile = file;
            
            // Hide all containers
            this.hideAllContainers();
            
            // Show ZIP container
            const container = document.getElementById('zip-container');
            container.classList.remove('hidden');
            
            // Show modal
            this.openModal();
            
            // Update file info
            this.updateFileInfo(file);
            
            // Load ZIP contents
            await this.loadZIPContents(file.id);
            
            // Update title
            document.getElementById('media-title').textContent = file.name;
            
        } catch (error) {
            console.error('Open ZIP error:', error);
            this.showError('Failed to load ZIP file');
        }
    }
    
    async openDefault(file) {
        this.currentFile = file;
        
        // Hide all containers
        this.hideAllContainers();
        
        // Show default container
        const container = document.getElementById('default-container');
        container.classList.remove('hidden');
        
        // Show modal
        this.openModal();
        
        // Update file info
        this.updateFileInfo(file);
        
        // Update title
        document.getElementById('media-title').textContent = file.name;
    }
    
    hideAllContainers() {
        const containers = [
            'video-container',
            'image-container',
            'pdf-container',
            'zip-container',
            'default-container'
        ];
        
        containers.forEach(id => {
            const container = document.getElementById(id);
            if (container) {
                container.classList.add('hidden');
            }
        });
        
        // Also hide filter panel
        document.getElementById('filter-panel')?.classList.add('hidden');
    }
    
    openModal() {
        const modal = document.getElementById('media-modal');
        if (modal) {
            modal.classList.remove('hidden');
            document.body.style.overflow = 'hidden';
        }
    }
    
    updateFileInfo(file) {
        document.getElementById('file-name').textContent = file.name;
        document.getElementById('file-size').textContent = file.formattedSize;
        document.getElementById('file-date').textContent = file.formattedDate;
        
        // Set appropriate title
        let typeLabel = '';
        switch(file.type) {
            case 'image': typeLabel = 'Image'; break;
            case 'video': typeLabel = 'Video'; break;
            case 'pdf': typeLabel = 'PDF'; break;
            case 'archive': typeLabel = 'ZIP Archive'; break;
            default: typeLabel = 'File';
        }
    }
    
    async getFileUrl(fileId) {
        try {
            const token = Auth.getAccessToken();
            
            // For images and videos, we might want to use webContentLink for better compatibility
            const response = await fetch(`${VAULT_CONFIG.api.drive.files}/${fileId}?fields=webContentLink,webViewLink`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            
            if (!response.ok) {
                throw new Error('Failed to get file URL');
            }
            
            const data = await response.json();
            
            // Use webContentLink for direct download, or fallback to alt=media
            return data.webContentLink || `${VAULT_CONFIG.api.drive.files}/${fileId}?alt=media`;
            
        } catch (error) {
            console.error('Get file URL error:', error);
            // Fallback to direct download URL
            return `${VAULT_CONFIG.api.drive.files}/${fileId}?alt=media`;
        }
    }
    
    initVideoPlayer(videoUrl) {
        // Destroy existing player
        if (this.player) {
            this.player.destroy();
        }
        
        // Get video element
        const videoElement = document.getElementById('video-player');
        if (!videoElement) return;
        
        // Set source
        videoElement.src = videoUrl;
        
        // Reinitialize Plyr
        this.player = new Plyr(videoElement, {
            controls: ['play-large', 'play', 'progress', 'current-time', 'mute', 'volume', 'captions', 'settings', 'fullscreen'],
            settings: ['quality', 'speed'],
            quality: {
                default: 720,
                options: [4320, 2880, 2160, 1440, 1080, 720, 576, 480, 360, 240]
            },
            speed: {
                selected: 1,
                options: [0.5, 0.75, 1, 1.25, 1.5, 2]
            }
        });
        
        // Load player
        videoElement.load();
    }
    
    rotateVideo() {
        const videoElement = document.getElementById('video-player');
        if (!videoElement) return;
        
        const currentRotation = parseInt(videoElement.style.transform.replace('rotate(', '').replace('deg)', '')) || 0;
        const newRotation = (currentRotation + 90) % 360;
        
        videoElement.style.transform = `rotate(${newRotation}deg)`;
        videoElement.style.transformOrigin = 'center center';
    }
    
    showQualitySelector() {
        // Plyr already has quality selector in settings
        // Just trigger the settings menu
        if (this.player && this.player.elements.settings) {
            this.player.elements.settings.click();
        }
    }
    
    async loadImage(imageUrl) {
        const imageElement = document.getElementById('image-viewer');
        if (!imageElement) return;
        
        // Show loading indicator
        imageElement.style.opacity = '0.5';
        
        // Load image
        imageElement.src = imageUrl;
        
        // Wait for image to load
        await new Promise((resolve, reject) => {
            imageElement.onload = resolve;
            imageElement.onerror = reject;
        });
        
        // Reset opacity
        imageElement.style.opacity = '1';
        
        // Reset transformations
        imageElement.style.transform = `scale(${this.imageScale}) rotate(${this.imageRotation}deg)`;
        this.updateImageFilters();
    }
    
    rotateImage(degrees) {
        const imageElement = document.getElementById('image-viewer');
        if (!imageElement) return;
        
        this.imageRotation = (this.imageRotation + degrees) % 360;
        imageElement.style.transform = `scale(${this.imageScale}) rotate(${this.imageRotation}deg)`;
    }
    
    zoomImage(factor) {
        const imageElement = document.getElementById('image-viewer');
        if (!imageElement) return;
        
        this.imageScale *= factor;
        
        // Limit zoom
        if (this.imageScale < 0.1) this.imageScale = 0.1;
        if (this.imageScale > 10) this.imageScale = 10;
        
        imageElement.style.transform = `scale(${this.imageScale}) rotate(${this.imageRotation}deg)`;
    }
    
    updateImageFilters() {
        const imageElement = document.getElementById('image-viewer');
        if (!imageElement) return;
        
        const filter = `
            brightness(${this.imageFilters.brightness}%) 
            contrast(${this.imageFilters.contrast}%) 
            saturate(${this.imageFilters.saturation}%) 
            hue-rotate(${this.imageFilters.hue}deg)
        `;
        
        imageElement.style.filter = filter;
    }
    
    resetImageTransformations() {
        const imageElement = document.getElementById('image-viewer');
        if (!imageElement) return;
        
        this.imageRotation = 0;
        this.imageScale = 1.0;
        imageElement.style.transform = 'scale(1) rotate(0deg)';
        imageElement.style.transformOrigin = 'center center';
    }
    
    resetImageFilters() {
        this.imageFilters = {
            brightness: 100,
            contrast: 100,
            saturation: 100,
            hue: 0
        };
        
        // Update sliders
        const brightnessSlider = document.getElementById('brightness-slider');
        const contrastSlider = document.getElementById('contrast-slider');
        const saturationSlider = document.getElementById('saturation-slider');
        const hueSlider = document.getElementById('hue-slider');
        
        if (brightnessSlider) brightnessSlider.value = '100';
        if (contrastSlider) contrastSlider.value = '100';
        if (saturationSlider) saturationSlider.value = '100';
        if (hueSlider) hueSlider.value = '0';
        
        // Update labels
        document.getElementById('brightness-value').textContent = '100%';
        document.getElementById('contrast-value').textContent = '100%';
        document.getElementById('saturation-value').textContent = '100%';
        document.getElementById('hue-value').textContent = '0°';
        
        // Apply filters
        this.updateImageFilters();
    }
    
    async saveImage() {
        try {
            const imageElement = document.getElementById('image-viewer');
            if (!imageElement) return;
            
            // Create canvas
            const canvas = document.createElement('canvas');
            const ctx = canvas.getContext('2d');
            
            // Set canvas dimensions to image natural dimensions
            canvas.width = imageElement.naturalWidth;
            canvas.height = imageElement.naturalHeight;
            
            // Clear canvas
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            
            // Apply rotation
            if (this.imageRotation !== 0) {
                ctx.save();
                ctx.translate(canvas.width / 2, canvas.height / 2);
                ctx.rotate(this.imageRotation * Math.PI / 180);
                ctx.translate(-canvas.width / 2, -canvas.height / 2);
            }
            
            // Draw image
            ctx.drawImage(imageElement, 0, 0, canvas.width, canvas.height);
            
            if (this.imageRotation !== 0) {
                ctx.restore();
            }
            
            // Apply filters using CSS filter to canvas
            // Note: This is a simplified approach. For production, you might want to implement
            // proper canvas filter operations or use a library.
            canvas.style.filter = imageElement.style.filter;
            
            // Convert to blob and download
            canvas.toBlob((blob) => {
                const url = URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = `edited-${this.currentFile.name}`;
                document.body.appendChild(a);
                a.click();
                document.body.removeChild(a);
                URL.revokeObjectURL(url);
                
                this.showSuccess('Image saved successfully');
            }, 'image/jpeg', 0.95);
            
        } catch (error) {
            console.error('Save image error:', error);
            this.showError('Failed to save image');
        }
    }
    
    async loadPDF(pdfUrl) {
        try {
            // Check if PDF.js is available
            if (typeof pdfjsLib === 'undefined') {
                throw new Error('PDF.js not loaded');
            }
            
            // Get canvas
            const canvas = document.getElementById('pdf-canvas');
            if (!canvas) return;
            
            // Show loading
            canvas.style.opacity = '0.5';
            
            // Load PDF document
            const loadingTask = pdfjsLib.getDocument({
                url: pdfUrl,
                withCredentials: true,
                httpHeaders: {
                    'Authorization': `Bearer ${Auth.getAccessToken()}`
                }
            });
            
            this.pdfDocument = await loadingTask.promise;
            this.totalPages = this.pdfDocument.numPages;
            this.currentPage = 1;
            
            // Update UI
            this.updatePDFUI();
            
            // Render first page
            await this.renderPDFPage();
            
            // Reset opacity
            canvas.style.opacity = '1';
            
        } catch (error) {
            console.error('Load PDF error:', error);
            this.showError('Failed to load PDF');
        }
    }
    
    async renderPDFPage() {
        try {
            if (!this.pdfDocument) return;
            
            const canvas = document.getElementById('pdf-canvas');
            const ctx = canvas.getContext('2d');
            
            // Get page
            const page = await this.pdfDocument.getPage(this.currentPage);
            
            // Calculate viewport
            const viewport = page.getViewport({ scale: this.pdfScale });
            
            // Set canvas dimensions
            canvas.width = viewport.width;
            canvas.height = viewport.height;
            
            // Render page
            const renderContext = {
                canvasContext: ctx,
                viewport: viewport
            };
            
            await page.render(renderContext).promise;
            
            // Update UI
            this.updatePDFUI();
            
        } catch (error) {
            console.error('Render PDF page error:', error);
            this.showError('Failed to render PDF page');
        }
    }
    
    updatePDFUI() {
        // Update page info
        document.getElementById('current-page').textContent = this.currentPage;
        document.getElementById('total-pages').textContent = this.totalPages;
        
        // Update slider
        const slider = document.getElementById('page-slider');
        if (slider) {
            slider.max = this.totalPages;
            slider.value = this.currentPage;
        }
    }
    
    async prevPage() {
        if (this.currentPage > 1) {
            this.currentPage--;
            await this.renderPDFPage();
        }
    }
    
    async nextPage() {
        if (this.currentPage < this.totalPages) {
            this.currentPage++;
            await this.renderPDFPage();
        }
    }
    
    async goToPage(page) {
        if (page >= 1 && page <= this.totalPages) {
            this.currentPage = page;
            await this.renderPDFPage();
        }
    }
    
    zoomPDF(factor) {
        this.pdfScale *= factor;
        
        // Limit zoom
        if (this.pdfScale < 0.5) this.pdfScale = 0.5;
        if (this.pdfScale > 5) this.pdfScale = 5;
        
        this.renderPDFPage();
    }
    
    async loadZIPContents(fileId) {
        try {
            const token = Auth.getAccessToken();
            
            // Get ZIP file
            const response = await fetch(`${VAULT_CONFIG.api.drive.files}/${fileId}?alt=media`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            
            if (!response.ok) {
                throw new Error('Failed to load ZIP file');
            }
            
            const blob = await response.blob();
            
            // Load with JSZip
            this.zipArchive = await JSZip.loadAsync(blob);
            
            // Display contents
            this.displayZIPContents();
            
        } catch (error) {
            console.error('Load ZIP contents error:', error);
            this.showError('Failed to load ZIP contents');
        }
    }
    
    displayZIPContents() {
        const zipList = document.getElementById('zip-list');
        if (!zipList || !this.zipArchive) return;
        
        // Clear existing
        zipList.innerHTML = '';
        
        let fileCount = 0;
        let folderCount = 0;
        let totalSize = 0;
        
        // Add each file/folder
        this.zipArchive.forEach((relativePath, zipEntry) => {
            const item = document.createElement('div');
            item.className = 'zip-item';
            
            const isFolder = zipEntry.dir;
            const icon = isFolder ? 'fas fa-folder' : 'fas fa-file';
            const size = isFolder ? '' : `(${VAULT_CONFIG.formatFileSize(zipEntry._data.uncompressedSize)})`;
            
            if (isFolder) folderCount++;
            else {
                fileCount++;
                totalSize += zipEntry._data.uncompressedSize;
            }
            
            item.innerHTML = `
                <div class="zip-item-info">
                    <i class="${icon}"></i>
                    <span class="zip-item-name">${relativePath}</span>
                    <span class="zip-item-size">${size}</span>
                </div>
                ${!isFolder ? `
                    <button class="btn-extract" data-path="${relativePath}">
                        <i class="fas fa-download"></i>
                        Extract
                    </button>
                ` : ''}
            `;
            
            zipList.appendChild(item);
            
            // Add extract event listener
            if (!isFolder) {
                item.querySelector('.btn-extract').addEventListener('click', async (e) => {
                    e.stopPropagation();
                    await this.extractFile(relativePath);
                });
            }
        });
        
        // Update header with counts
        const zipHeader = document.querySelector('.zip-header h4');
        if (zipHeader) {
            zipHeader.textContent = `ZIP Archive Contents (${fileCount} files, ${folderCount} folders)`;
        }
    }
    
    async extractFile(path) {
        try {
            if (!this.zipArchive) return;
            
            const file = this.zipArchive.file(path);
            if (!file) {
                throw new Error('File not found in archive');
            }
            
            const blob = await file.async('blob');
            saveAs(blob, path.split('/').pop());
            
            this.showSuccess(`Extracted: ${path}`);
            
        } catch (error) {
            console.error('Extract file error:', error);
            this.showError('Failed to extract file');
        }
    }
    
    async extractAll() {
        try {
            if (!this.zipArchive) return;
            
            this.showProgress('Extracting all files...');
            
            // Create a new ZIP for all files
            const zip = new JSZip();
            
            // Add all files to new ZIP
            this.zipArchive.forEach((relativePath, zipEntry) => {
                if (!zipEntry.dir) {
                    zip.file(relativePath, zipEntry.async('blob'));
                }
            });
            
            // Generate and download
            const content = await zip.generateAsync({ type: 'blob' });
            saveAs(content, `${this.currentFile.name.replace('.zip', '')}-extracted.zip`);
            
            this.hideProgress();
            this.showSuccess('All files extracted successfully');
            
        } catch (error) {
            console.error('Extract all error:', error);
            this.showError('Failed to extract files');
            this.hideProgress();
        }
    }
    
    openInDrive() {
        if (this.currentFile?.webViewLink) {
            window.open(this.currentFile.webViewLink, '_blank');
        } else if (this.currentFile?.webContentLink) {
            window.open(this.currentFile.webContentLink, '_blank');
        } else {
            this.showError('Cannot open in Drive');
        }
    }
    
    async downloadCurrentFile() {
        if (!this.currentFile) return;
        
        try {
            await Drive.downloadFile(this.currentFile);
        } catch (error) {
            console.error('Download current file error:', error);
            this.showError('Download failed');
        }
    }
    
    shareCurrentFile() {
        if (!this.currentFile) return;
        
        // Create share URL
        let shareUrl = this.currentFile.webViewLink || this.currentFile.webContentLink;
        
        if (!shareUrl && this.currentFile.id) {
            // Construct a shareable link
            shareUrl = `https://drive.google.com/file/d/${this.currentFile.id}/view`;
        }
        
        if (shareUrl) {
            // Copy to clipboard
            navigator.clipboard.writeText(shareUrl)
                .then(() => {
                    this.showSuccess('Link copied to clipboard');
                })
                .catch(() => {
                    // Fallback: show URL in prompt
                    prompt('Share this link:', shareUrl);
                });
        } else {
            this.showError('Cannot generate share link');
        }
    }
    
    deleteCurrentFile() {
        if (!this.currentFile) return;
        
        if (confirm(`Are you sure you want to delete "${this.currentFile.name}"?`)) {
            Drive.deleteSelected()
                .then(() => {
                    this.close();
                })
                .catch(error => {
                    console.error('Delete error:', error);
                    this.showError('Failed to delete file');
                });
        }
    }
    
    toggleFullscreen(type) {
        const element = document.getElementById(`${type}-container`);
        
        if (!document.fullscreenElement) {
            this.enterFullscreen(element);
        } else {
            this.exitFullscreen();
        }
    }
    
    enterFullscreen(element) {
        if (element.requestFullscreen) {
            element.requestFullscreen();
        } else if (element.mozRequestFullScreen) { // Firefox
            element.mozRequestFullScreen();
        } else if (element.webkitRequestFullscreen) { // Chrome, Safari, Opera
            element.webkitRequestFullscreen();
        } else if (element.msRequestFullscreen) { // IE/Edge
            element.msRequestFullscreen();
        }
        
        this.isFullscreen = true;
        this.originalBodyOverflow = document.body.style.overflow;
        document.body.style.overflow = 'hidden';
    }
    
    exitFullscreen() {
        if (document.exitFullscreen) {
            document.exitFullscreen();
        } else if (document.mozCancelFullScreen) {
            document.mozCancelFullScreen();
        } else if (document.webkitExitFullscreen) {
            document.webkitExitFullscreen();
        } else if (document.msExitFullscreen) {
            document.msExitFullscreen();
        }
        
        this.isFullscreen = false;
        document.body.style.overflow = this.originalBodyOverflow;
    }
    
    close() {
        // Hide modal
        const modal = document.getElementById('media-modal');
        if (modal) {
            modal.classList.add('hidden');
            document.body.style.overflow = '';
        }
        
        // Exit fullscreen if active
        if (this.isFullscreen) {
            this.exitFullscreen();
        }
        
        // Clean up
        this.cleanup();
    }
    
    cleanup() {
        // Destroy video player
        if (this.player) {
            this.player.destroy();
            this.player = null;
        }
        
        // Clear PDF
        this.pdfDocument = null;
        this.currentPage = 1;
        this.totalPages = 1;
        this.pdfScale = 1.5;
        
        // Clear image
        this.imageRotation = 0;
        this.imageScale = 1.0;
        this.resetImageFilters();
        
        // Clear ZIP
        this.zipArchive = null;
        
        // Clear current file
        this.currentFile = null;
        
        // Clear video source
        const videoElement = document.getElementById('video-player');
        if (videoElement) {
            videoElement.src = '';
            videoElement.style.transform = '';
        }
        
        // Clear image source
        const imageElement = document.getElementById('image-viewer');
        if (imageElement) {
            imageElement.src = '';
            imageElement.style.transform = '';
            imageElement.style.filter = '';
        }
        
        // Clear canvas
        const canvas = document.getElementById('pdf-canvas');
        if (canvas) {
            const ctx = canvas.getContext('2d');
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            canvas.width = 0;
            canvas.height = 0;
        }
        
        // Clear ZIP list
        const zipList = document.getElementById('zip-list');
        if (zipList) {
            zipList.innerHTML = '';
        }
        
        // Hide filter panel
        document.getElementById('filter-panel')?.classList.add('hidden');
    }
    
    showProgress(message) {
        const toast = document.createElement('div');
        toast.className = 'toast info';
        toast.innerHTML = `
            <i class="fas fa-spinner fa-spin"></i>
            <span>${message}</span>
        `;
        toast.id = 'media-progress-toast';
        
        const container = document.getElementById('toast-container');
        if (container) {
            // Remove existing progress toast
            const existing = document.getElementById('media-progress-toast');
            if (existing) existing.remove();
            
            container.appendChild(toast);
        }
    }
    
    hideProgress() {
        const toast = document.getElementById('media-progress-toast');
        if (toast) {
            toast.style.opacity = '0';
            setTimeout(() => toast.remove(), 300);
        }
    }
    
    showError(message) {
        const toast = document.createElement('div');
        toast.className = 'toast error';
        toast.innerHTML = `
            <i class="fas fa-exclamation-circle"></i>
            <span>${message}</span>
            <button class="toast-close"><i class="fas fa-times"></i></button>
        `;
        
        const container = document.getElementById('toast-container');
        if (container) {
            container.appendChild(toast);
            
            // Auto remove after 5 seconds
            setTimeout(() => {
                if (toast.parentNode) {
                    toast.style.opacity = '0';
                    setTimeout(() => toast.remove(), 300);
                }
            }, 5000);
            
            // Close button
            toast.querySelector('.toast-close').addEventListener('click', () => {
                toast.style.opacity = '0';
                setTimeout(() => toast.remove(), 300);
            });
        }
    }
    
    showSuccess(message) {
        const toast = document.createElement('div');
        toast.className = 'toast success';
        toast.innerHTML = `
            <i class="fas fa-check-circle"></i>
            <span>${message}</span>
            <button class="toast-close"><i class="fas fa-times"></i></button>
        `;
        
        const container = document.getElementById('toast-container');
        if (container) {
            container.appendChild(toast);
            
            // Auto remove after 3 seconds
            setTimeout(() => {
                if (toast.parentNode) {
                    toast.style.opacity = '0';
                    setTimeout(() => toast.remove(), 300);
                }
            }, 3000);
            
            // Close button
            toast.querySelector('.toast-close').addEventListener('click', () => {
                toast.style.opacity = '0';
                setTimeout(() => toast.remove(), 300);
            });
        }
    }
    
    // Public methods
    getCurrentFile() {
        return this.currentFile;
    }
    
    isOpen() {
        const modal = document.getElementById('media-modal');
        return modal && !modal.classList.contains('hidden');
    }
}

// Create global MediaViewer instance
window.MediaViewer = new MediaViewer();

