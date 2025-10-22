// State
let clickCount = 0;
let startTime = Date.now();
let timerInterval;

// DOM Elements
const greeting = document.getElementById('greeting');
const nameInput = document.getElementById('nameInput');
const greetBtn = document.getElementById('greetBtn');
const resetBtn = document.getElementById('resetBtn');
const themeBtn = document.getElementById('themeBtn');
const clickCountEl = document.getElementById('clickCount');
const visitTimeEl = document.getElementById('visitTime');
const fileInput = document.getElementById('fileInput');
const uploadArea = document.getElementById('uploadArea');
const uploadedFileDiv = document.getElementById('uploadedFile');

// Load saved theme
const savedTheme = localStorage.getItem('theme');
if (savedTheme === 'dark') {
    document.body.classList.add('dark-mode');
    themeBtn.textContent = '☀️ Light Mode';
}

// Greet function
function greet() {
    const name = nameInput.value.trim();
    
    if (name) {
        greeting.textContent = `Hello, ${name}! 👋`;
        nameInput.value = '';
    } else {
        greeting.textContent = 'Hello World! 🌍';
    }
    
    // Increment click count
    clickCount++;
    clickCountEl.textContent = clickCount;
    
    // Animation
    greeting.style.transform = 'scale(1.1)';
    setTimeout(() => {
        greeting.style.transform = 'scale(1)';
    }, 200);
}

// Reset function
function reset() {
    clickCount = 0;
    clickCountEl.textContent = '0';
    greeting.textContent = 'Hello World!';
    nameInput.value = '';
    startTime = Date.now();
}

// Theme toggle
function toggleTheme() {
    document.body.classList.toggle('dark-mode');
    
    if (document.body.classList.contains('dark-mode')) {
        themeBtn.textContent = '☀️ Light Mode';
        localStorage.setItem('theme', 'dark');
    } else {
        themeBtn.textContent = '🌙 Dark Mode';
        localStorage.setItem('theme', 'light');
    }
}

// Update timer
function updateTimer() {
    const elapsed = Math.floor((Date.now() - startTime) / 1000);
    const minutes = Math.floor(elapsed / 60);
    const seconds = elapsed % 60;
    
    if (minutes > 0) {
        visitTimeEl.textContent = `${minutes}m ${seconds}s`;
    } else {
        visitTimeEl.textContent = `${seconds}s`;
    }
}

// Event Listeners
greetBtn.addEventListener('click', greet);
resetBtn.addEventListener('click', reset);
themeBtn.addEventListener('click', toggleTheme);

nameInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        greet();
    }
});

// Start timer
timerInterval = setInterval(updateTimer, 1000);

// File upload handling
const progressContainer = document.getElementById('progressContainer');
const progressFill = document.getElementById('progressFill');
const progressText = document.getElementById('progressText');
const progressPercent = document.getElementById('progressPercent');
let currentFile = null; // Store current file for download

fileInput.addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (file) {
        uploadFile(file);
    }
});

function uploadFile(file) {
    // Show progress bar
    progressContainer.style.display = 'block';
    uploadedFileDiv.innerHTML = '';
    progressFill.style.width = '0%';
    progressPercent.textContent = '0%';
    progressText.textContent = 'Uploading...';
    
    // Simulate upload progress
    let progress = 0;
    const interval = setInterval(() => {
        progress += Math.random() * 15;
        
        if (progress >= 100) {
            progress = 100;
            clearInterval(interval);
            
            // Upload complete
            progressFill.style.width = '100%';
            progressPercent.textContent = '100%';
            progressText.textContent = 'Upload complete!';
            
            setTimeout(() => {
                progressContainer.style.display = 'none';
                parseAndDisplayFile(file);
            }, 500);
        } else {
            progressFill.style.width = progress + '%';
            progressPercent.textContent = Math.round(progress) + '%';
        }
    }, 200);
}

async function parseAndDisplayFile(file) {
    const fileExtension = file.name.split('.').pop().toLowerCase();
    let previewData = null;
    
    try {
        if (fileExtension === 'csv') {
            // Parse CSV
            const text = await file.text();
            previewData = parseCSV(text);
        } else if (['xlsx', 'xls'].includes(fileExtension)) {
            // Parse Excel
            const arrayBuffer = await file.arrayBuffer();
            const workbook = XLSX.read(arrayBuffer, { type: 'array' });
            const firstSheetName = workbook.SheetNames[0];
            const worksheet = workbook.Sheets[firstSheetName];
            const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
            previewData = jsonData.slice(0, 3);
        }
    } catch (error) {
        console.error('Error parsing file:', error);
    }
    
    displayUploadedFile(file, previewData);
}

function parseCSV(text) {
    const lines = text.split('\n').filter(line => line.trim());
    const rows = lines.slice(0, 3).map(line => {
        // Simple CSV parsing (handles basic cases)
        return line.split(',').map(cell => cell.trim());
    });
    return rows;
}

function displayUploadedFile(file, previewData) {
    currentFile = file; // Store file for download
    const fileSize = formatFileSize(file.size);
    const fileExtension = file.name.split('.').pop().toLowerCase();
    
    let fileIcon = '📄';
    if (fileExtension === 'csv') fileIcon = '📊';
    else if (['xlsx', 'xls'].includes(fileExtension)) fileIcon = '📈';
    
    let previewHTML = '';
    if (previewData && previewData.length > 0) {
        previewHTML = `
            <div class="data-preview">
                <div class="preview-title">Data Preview (First 3 rows)</div>
                <div class="preview-table-container">
                    <table class="preview-table">
                        ${previewData.map((row, index) => `
                            <tr class="${index === 0 ? 'header-row' : ''}">
                                ${row.map(cell => `<td>${cell || ''}</td>`).join('')}
                            </tr>
                        `).join('')}
                    </table>
                </div>
            </div>
        `;
    }
    
    uploadedFileDiv.innerHTML = `
        ${previewHTML}
        <div class="file-item">
            <span class="file-icon">${fileIcon}</span>
            <div class="file-info">
                <span class="file-name">${file.name}</span>
                <span class="file-size">${fileSize}</span>
            </div>
            <div class="file-actions">
                <button class="file-download" onclick="downloadFile()">⬇️</button>
                <button class="file-remove" onclick="removeFile()">×</button>
            </div>
        </div>
    `;
}

function formatFileSize(bytes) {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
}

function downloadFile() {
    if (!currentFile) return;
    
    // Create a temporary URL for the file
    const url = URL.createObjectURL(currentFile);
    
    // Create a temporary link element
    const link = document.createElement('a');
    link.href = url;
    link.download = currentFile.name;
    
    // Trigger download
    document.body.appendChild(link);
    link.click();
    
    // Clean up
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
}

function removeFile() {
    uploadedFileDiv.innerHTML = '';
    fileInput.value = '';
    currentFile = null;
}

// Welcome message
console.log('👋 Welcome to the Hello World App!');
console.log('💡 Try entering your name and clicking the button!');

