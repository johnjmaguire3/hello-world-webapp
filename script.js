// ====================================
// CONSTANTS
// ====================================
const ANIMATION_DURATION = 200;
const PROGRESS_INTERVAL = 200;
const PROGRESS_INCREMENT_MAX = 15;
const PREVIEW_ROW_COUNT = 3;
const UPLOAD_COMPLETE_DELAY = 500;
const TIMER_UPDATE_INTERVAL = 1000;

const FILE_ICONS = {
    csv: '📊',
    xlsx: '📈',
    xls: '📈',
    default: '📄'
};

const STORAGE_KEYS = {
    theme: 'theme'
};

// ====================================
// STATE MANAGEMENT
// ====================================
const state = {
    clickCount: 0,
    startTime: Date.now(),
    timerInterval: null,
    currentFile: null
};

// ====================================
// DOM ELEMENTS
// ====================================
const elements = {
    // Greeting section
    greeting: document.getElementById('greeting'),
    nameInput: document.getElementById('nameInput'),
    greetBtn: document.getElementById('greetBtn'),
    
    // Stats section
    clickCountEl: document.getElementById('clickCount'),
    visitTimeEl: document.getElementById('visitTime'),
    
    // Actions
    resetBtn: document.getElementById('resetBtn'),
    themeBtn: document.getElementById('themeBtn'),
    
    // File upload
    fileInput: document.getElementById('fileInput'),
    uploadArea: document.getElementById('uploadArea'),
    uploadedFileDiv: document.getElementById('uploadedFile'),
    progressContainer: document.getElementById('progressContainer'),
    progressFill: document.getElementById('progressFill'),
    progressText: document.getElementById('progressText'),
    progressPercent: document.getElementById('progressPercent')
};

// ====================================
// UTILITY FUNCTIONS
// ====================================
const utils = {
    /**
     * Format bytes to human-readable file size
     */
    formatFileSize(bytes) {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return `${Math.round(bytes / Math.pow(k, i) * 100) / 100} ${sizes[i]}`;
    },

    /**
     * Get file extension from filename
     */
    getFileExtension(filename) {
        return filename.split('.').pop().toLowerCase();
    },

    /**
     * Get appropriate icon for file type
     */
    getFileIcon(extension) {
        return FILE_ICONS[extension] || FILE_ICONS.default;
    },

    /**
     * Escape HTML to prevent XSS
     */
    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    },

    /**
     * Animate element with scale effect
     */
    animateScale(element, scale = 1.1, duration = ANIMATION_DURATION) {
        element.style.transform = `scale(${scale})`;
    setTimeout(() => {
            element.style.transform = 'scale(1)';
        }, duration);
    }
};

// ====================================
// GREETING MODULE
// ====================================
const greetingModule = {
    greet() {
        const name = elements.nameInput.value.trim();
        
        if (name) {
            elements.greeting.textContent = `Hello, ${name}! 👋`;
            elements.nameInput.value = '';
        } else {
            elements.greeting.textContent = 'Hello World! 🌍';
        }
        
        // Update stats
        state.clickCount++;
        elements.clickCountEl.textContent = state.clickCount;
        
        // Animate greeting
        utils.animateScale(elements.greeting);
    },

    reset() {
        state.clickCount = 0;
        elements.clickCountEl.textContent = '0';
        elements.greeting.textContent = 'Hello World!';
        elements.nameInput.value = '';
        state.startTime = Date.now();
    }
};

// ====================================
// THEME MODULE
// ====================================
const themeModule = {
    init() {
        const savedTheme = localStorage.getItem(STORAGE_KEYS.theme);
        if (savedTheme === 'dark') {
            document.body.classList.add('dark-mode');
        }
    },

    toggle() {
        document.body.classList.toggle('dark-mode');
        const isDark = document.body.classList.contains('dark-mode');
        localStorage.setItem(STORAGE_KEYS.theme, isDark ? 'dark' : 'light');
    }
};

// ====================================
// TIMER MODULE
// ====================================
const timerModule = {
    start() {
        state.timerInterval = setInterval(() => {
            this.update();
        }, TIMER_UPDATE_INTERVAL);
    },

    update() {
        const elapsed = Math.floor((Date.now() - state.startTime) / 1000);
    const minutes = Math.floor(elapsed / 60);
    const seconds = elapsed % 60;
    
        elements.visitTimeEl.textContent = minutes > 0 
            ? `${minutes}m ${seconds}s` 
            : `${seconds}s`;
    },

    stop() {
        if (state.timerInterval) {
            clearInterval(state.timerInterval);
        }
    }
};

// ====================================
// FILE PARSER MODULE
// ====================================
const fileParserModule = {
    /**
     * Parse CSV text into array of rows
     */
    parseCSV(text) {
        const lines = text.split('\n').filter(line => line.trim());
        return lines.slice(0, PREVIEW_ROW_COUNT).map(line => 
            line.split(',').map(cell => cell.trim())
        );
    },

    /**
     * Parse Excel file into array of rows
     */
    async parseExcel(arrayBuffer) {
        const workbook = XLSX.read(arrayBuffer, { type: 'array' });
        const firstSheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[firstSheetName];
        const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
        return jsonData.slice(0, PREVIEW_ROW_COUNT);
    },

    /**
     * Parse file based on extension
     */
    async parse(file) {
        const extension = utils.getFileExtension(file.name);
        
        try {
            if (extension === 'csv') {
                const text = await file.text();
                return this.parseCSV(text);
            } else if (['xlsx', 'xls'].includes(extension)) {
                const arrayBuffer = await file.arrayBuffer();
                return await this.parseExcel(arrayBuffer);
            }
        } catch (error) {
            console.error('Error parsing file:', error);
            return null;
        }
        
        return null;
    }
};

// ====================================
// FILE UPLOAD MODULE
// ====================================
const fileUploadModule = {
    /**
     * Simulate upload progress
     */
    simulateUpload(file) {
        this.showProgress();
        let progress = 0;
        
        const interval = setInterval(() => {
            progress += Math.random() * PROGRESS_INCREMENT_MAX;
            
            if (progress >= 100) {
                progress = 100;
                clearInterval(interval);
                this.completeUpload(file);
            } else {
                this.updateProgress(progress);
            }
        }, PROGRESS_INTERVAL);
    },

    /**
     * Show and initialize progress bar
     */
    showProgress() {
        elements.uploadedFileDiv.innerHTML = '';
        elements.progressContainer.style.display = 'block';
        elements.progressFill.style.width = '0%';
        elements.progressPercent.textContent = '0%';
        elements.progressText.textContent = 'Uploading...';
    },

    /**
     * Update progress bar
     */
    updateProgress(progress) {
        elements.progressFill.style.width = `${progress}%`;
        elements.progressPercent.textContent = `${Math.round(progress)}%`;
    },

    /**
     * Complete upload and display file
     */
    async completeUpload(file) {
        elements.progressFill.style.width = '100%';
        elements.progressPercent.textContent = '100%';
        elements.progressText.textContent = 'Upload complete!';
        
        setTimeout(async () => {
            elements.progressContainer.style.display = 'none';
            const previewData = await fileParserModule.parse(file);
            this.displayFile(file, previewData);
        }, UPLOAD_COMPLETE_DELAY);
    },

    /**
     * Generate preview table HTML
     */
    generatePreviewHTML(previewData) {
        if (!previewData || previewData.length === 0) return '';
        
        const rows = previewData.map((row, index) => {
            const cells = row.map(cell => 
                `<td>${utils.escapeHtml(cell || '')}</td>`
            ).join('');
            const rowClass = index === 0 ? 'header-row' : '';
            return `<tr class="${rowClass}">${cells}</tr>`;
        }).join('');
        
        return `
            <div class="data-preview">
                <div class="preview-title">Data Preview (First 3 rows)</div>
                <div class="preview-table-container">
                    <table class="preview-table">${rows}</table>
                </div>
            </div>
        `;
    },

    /**
     * Display uploaded file with preview
     */
    displayFile(file, previewData) {
        state.currentFile = file;
        const fileSize = utils.formatFileSize(file.size);
        const extension = utils.getFileExtension(file.name);
        const fileIcon = utils.getFileIcon(extension);
        const previewHTML = this.generatePreviewHTML(previewData);
        
        elements.uploadedFileDiv.innerHTML = `
            ${previewHTML}
            <div class="file-item">
                <span class="file-icon">${fileIcon}</span>
                <div class="file-info">
                    <span class="file-name">${utils.escapeHtml(file.name)}</span>
                    <span class="file-size">${fileSize}</span>
                </div>
                <div class="file-actions">
                    <button class="file-download" onclick="fileUploadModule.download()">⬇️</button>
                    <button class="file-remove" onclick="fileUploadModule.remove()">×</button>
                </div>
            </div>
        `;
    },

    /**
     * Download current file
     */
    download() {
        if (!state.currentFile) return;
        
        const url = URL.createObjectURL(state.currentFile);
        const link = document.createElement('a');
        link.href = url;
        link.download = state.currentFile.name;
        
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
    },

    /**
     * Remove uploaded file
     */
    remove() {
        elements.uploadedFileDiv.innerHTML = '';
        elements.fileInput.value = '';
        state.currentFile = null;
    }
};

// ====================================
// EVENT LISTENERS
// ====================================
const initEventListeners = () => {
    // Greeting events
    elements.greetBtn.addEventListener('click', () => greetingModule.greet());
    elements.nameInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') greetingModule.greet();
    });
    
    // Action events
    elements.resetBtn.addEventListener('click', () => greetingModule.reset());
    elements.themeBtn.addEventListener('click', () => themeModule.toggle());
    
    // File upload events
    elements.fileInput.addEventListener('change', (e) => {
        const file = e.target.files[0];
        if (file) fileUploadModule.simulateUpload(file);
    });
};

// ====================================
// INITIALIZATION
// ====================================
const init = () => {
    themeModule.init();
    timerModule.start();
    initEventListeners();
    
    console.log('👋 Welcome to the Interactive Web App!');
console.log('💡 Try entering your name and clicking the button!');
};

// Start application
init();
