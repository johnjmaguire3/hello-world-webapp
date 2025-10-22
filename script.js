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

// Welcome message
console.log('👋 Welcome to the Hello World App!');
console.log('💡 Try entering your name and clicking the button!');

