// Image Editor JavaScript
let currentImage = null;
let imageHistory = [];
let historyIndex = -1;
let isDrawing = false;
let isErasing = false;
let currentTool = '';
let originalImageData = null;

const originalCanvas = document.getElementById('originalCanvas');
const originalCtx = originalCanvas.getContext('2d');
const processedCanvas = document.getElementById('processedCanvas');
const processedCtx = processedCanvas.getContext('2d');

const fileInput = document.getElementById('fileInput');
const originalArea = document.getElementById('originalArea');
const processedArea = document.getElementById('processedArea');
const controlsPanel = document.getElementById('controlsPanel');
const thumbnailGrid = document.getElementById('thumbnailGrid');
const historyPanel = document.getElementById('historyPanel');
const historyList = document.getElementById('historyList');

// Color palettes for drawing
const colors = ['#000000', '#FF0000', '#00FF00', '#0000FF', '#FFFF00', '#FF00FF', '#00FFFF', '#FFA500', '#800080'];
let selectedColor = '#000000';
let brushSize = 5;

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    initializeEventListeners();
    loadThumbnails();
});

function initializeEventListeners() {
    document.getElementById('uploadBtn').addEventListener('click', () => fileInput.click());
    document.getElementById('saveBtn').addEventListener('click', saveImage);
    document.getElementById('undoBtn').addEventListener('click', undo);
    document.getElementById('historyToggleBtn').addEventListener('click', toggleHistoryPanel);
    document.getElementById('closeHistoryBtn').addEventListener('click', toggleHistoryPanel);
    fileInput.addEventListener('change', handleFileUpload);
    
    // Tool buttons
    document.querySelectorAll('.tool-btn').forEach(btn => {
        btn.addEventListener('click', handleToolClick);
    });
    
    // Canvas events for drawing
    processedCanvas.addEventListener('mousedown', startDrawing);
    processedCanvas.addEventListener('mousemove', draw);
    processedCanvas.addEventListener('mouseup', stopDrawing);
    processedCanvas.addEventListener('mouseout', stopDrawing);
}

function handleFileUpload(event) {
    const file = event.target.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = (e) => {
            const img = new Image();
            img.onload = () => {
                currentImage = img;
                
                // Set original canvas
                originalCanvas.width = img.width;
                originalCanvas.height = img.height;
                originalCtx.drawImage(img, 0, 0);
                
                // Set processed canvas to same
                processedCanvas.width = img.width;
                processedCanvas.height = img.height;
                processedCtx.drawImage(img, 0, 0);
                
                saveToHistory();
                updatePreview();
                
                // Add placeholder to show image
                if (originalArea.querySelector('.placeholder')) {
                    originalArea.querySelector('.placeholder').style.display = 'none';
                }
                if (processedArea.querySelector('.placeholder')) {
                    processedArea.querySelector('.placeholder').style.display = 'none';
                }
                thumbnailGrid.insertBefore(createThumbnail(originalCanvas.toDataURL()), thumbnailGrid.firstChild);
            };
            img.src = e.target.result;
        };
        reader.readAsDataURL(file);
    }
}

function updatePreview() {
    // Keep both canvases visible
    if (originalArea.querySelector('.placeholder')) {
        originalArea.querySelector('.placeholder').style.display = 'none';
    }
    if (processedArea.querySelector('.placeholder')) {
        processedArea.querySelector('.placeholder').style.display = 'none';
    }
}

function handleToolClick(event) {
    const tool = event.currentTarget.dataset.action;
    currentTool = tool;
    
    // Remove active state from all buttons
    document.querySelectorAll('.tool-btn').forEach(btn => btn.classList.remove('active'));
    event.currentTarget.classList.add('active');
    
    switch(tool) {
        case 'crop':
            showNotification('Crop tool activated. Click and drag to select area.');
            showControlsPanel('Crop');
            break;
        case 'rotate':
            rotateImage(90);
            break;
        case 'blur':
            showControlsPanel('Blur');
            break;
        case 'sharpen':
            showControlsPanel('Sharpen');
            break;
        case 'brightness':
            showControlsPanel('Brightness');
            break;
        case 'contrast':
            showControlsPanel('Contrast');
            break;
        case 'grayscale':
            applyGrayscale();
            break;
        case 'edge-detection':
            applyEdgeDetection();
            break;
        case 'filter':
            applyRandomFilter();
            break;
        case 'draw':
            activateDrawMode();
            break;
        case 'erase':
            activateEraseMode();
            break;
    }
}

function showControlsPanel(toolName) {
    controlsPanel.style.display = 'block';
    controlsPanel.innerHTML = `
        <h4><i class="fas fa-sliders-h"></i> ${toolName} Controls</h4>
        <div class="control-group">
            <div class="scale-container">
                <span class="scale-label">Intensity:</span>
                <input type="range" id="intensitySlider" min="0" max="100" value="50">
                <span class="value-display" id="intensityValue">50%</span>
            </div>
        </div>
    `;
    
    document.getElementById('intensitySlider').addEventListener('input', handleIntensityChange);
}

function hideControlsPanel() {
    controlsPanel.style.display = 'none';
}

function handleIntensityChange() {
    const value = document.getElementById('intensitySlider').value;
    document.getElementById('intensityValue').textContent = value + '%';
    
    if (currentTool) {
        applyToolWithIntensity(currentTool, value / 100);
    }
}

function applyToolWithIntensity(tool, intensity) {
    // Copy original to processed first for real-time preview
    processedCtx.clearRect(0, 0, processedCanvas.width, processedCanvas.height);
    processedCtx.drawImage(originalCanvas, 0, 0);
    
    const imageData = processedCtx.getImageData(0, 0, processedCanvas.width, processedCanvas.height);
    const data = imageData.data;
    
    for (let i = 0; i < data.length; i += 4) {
        const r = data[i];
        const g = data[i + 1];
        const b = data[i + 2];
        
        switch(tool) {
            case 'blur':
                // Simple blur approximation
                if (i > 0 && i < data.length - 4) {
                    data[i] = (data[i] + data[i - 4]) / 2;
                    data[i + 1] = (data[i + 1] + data[i - 3]) / 2;
                    data[i + 2] = (data[i + 2] + data[i - 2]) / 2;
                }
                break;
            case 'brightness':
                data[i] = Math.min(255, r + (intensity * 100) - 50);
                data[i + 1] = Math.min(255, g + (intensity * 100) - 50);
                data[i + 2] = Math.min(255, b + (intensity * 100) - 50);
                break;
            case 'contrast':
                const factor = (259 * (intensity * 200 + 255)) / (255 * (259 - intensity * 200));
                data[i] = Math.min(255, Math.max(0, factor * (r - 128) + 128));
                data[i + 1] = Math.min(255, Math.max(0, factor * (g - 128) + 128));
                data[i + 2] = Math.min(255, Math.max(0, factor * (b - 128) + 128));
                break;
            case 'sharpen':
                // Simple sharpen approximation
                const sharpen = 1.5 * intensity;
                data[i] = Math.min(255, Math.max(0, r * sharpen));
                data[i + 1] = Math.min(255, Math.max(0, g * sharpen));
                data[i + 2] = Math.min(255, Math.max(0, b * sharpen));
                break;
        }
    }
    
    processedCtx.putImageData(imageData, 0, 0);
}

function rotateImage(degrees) {
    // Copy original to processed first
    processedCtx.clearRect(0, 0, processedCanvas.width, processedCanvas.height);
    processedCtx.drawImage(originalCanvas, 0, 0);
    
    const newCanvas = document.createElement('canvas');
    const newCtx = newCanvas.getContext('2d');
    
    if (degrees === 90 || degrees === -90) {
        newCanvas.width = processedCanvas.height;
        newCanvas.height = processedCanvas.width;
    } else {
        newCanvas.width = processedCanvas.width;
        newCanvas.height = processedCanvas.height;
    }
    
    newCtx.translate(newCanvas.width / 2, newCanvas.height / 2);
    newCtx.rotate((degrees * Math.PI) / 180);
    newCtx.drawImage(processedCanvas, -processedCanvas.width / 2, -processedCanvas.height / 2);
    
    processedCanvas.width = newCanvas.width;
    processedCanvas.height = newCanvas.height;
    processedCtx.drawImage(newCanvas, 0, 0);
    
    // Update original to match
    originalCanvas.width = processedCanvas.width;
    originalCanvas.height = processedCanvas.height;
    originalCtx.drawImage(newCanvas, 0, 0);
    
    addHistoryEntry('Image Rotated');
    updatePreview();
}

function applyGrayscale() {
    // Copy original to processed first
    processedCtx.clearRect(0, 0, processedCanvas.width, processedCanvas.height);
    processedCtx.drawImage(originalCanvas, 0, 0);
    
    const imageData = processedCtx.getImageData(0, 0, processedCanvas.width, processedCanvas.height);
    const data = imageData.data;
    
    for (let i = 0; i < data.length; i += 4) {
        const gray = data[i] * 0.299 + data[i + 1] * 0.587 + data[i + 2] * 0.114;
        data[i] = gray;
        data[i + 1] = gray;
        data[i + 2] = gray;
    }
    
    processedCtx.putImageData(imageData, 0, 0);
    addHistoryEntry('Grayscale Applied');
    updatePreview();
}

function applyEdgeDetection() {
    // Copy original to processed first
    processedCtx.clearRect(0, 0, processedCanvas.width, processedCanvas.height);
    processedCtx.drawImage(originalCanvas, 0, 0);
    
    const imageData = processedCtx.getImageData(0, 0, processedCanvas.width, processedCanvas.height);
    const grayData = new Uint8ClampedArray(imageData.data.length);
    
    // Convert to grayscale first
    for (let i = 0; i < imageData.data.length; i += 4) {
        const gray = imageData.data[i] * 0.299 + imageData.data[i + 1] * 0.587 + imageData.data[i + 2] * 0.114;
        grayData[i] = gray;
        grayData[i + 1] = gray;
        grayData[i + 2] = gray;
        grayData[i + 3] = imageData.data[i + 3];
    }
    
    // Apply Sobel edge detection
    for (let y = 1; y < processedCanvas.height - 1; y++) {
        for (let x = 1; x < processedCanvas.width - 1; x++) {
            const idx = (y * processedCanvas.width + x) * 4;
            
            const gx = -grayData[((y-1) * processedCanvas.width + (x-1)) * 4] - 2*grayData[((y-1) * processedCanvas.width + x) * 4] - grayData[((y-1) * processedCanvas.width + (x+1)) * 4] +
                      grayData[((y+1) * processedCanvas.width + (x-1)) * 4] + 2*grayData[((y+1) * processedCanvas.width + x) * 4] + grayData[((y+1) * processedCanvas.width + (x+1)) * 4];
            
            const gy = -grayData[((y-1) * processedCanvas.width + (x-1)) * 4] - 2*grayData[(y * processedCanvas.width + (x-1)) * 4] - grayData[((y+1) * processedCanvas.width + (x-1)) * 4] +
                      grayData[((y-1) * processedCanvas.width + (x+1)) * 4] + 2*grayData[(y * processedCanvas.width + (x+1)) * 4] + grayData[((y+1) * processedCanvas.width + (x+1)) * 4];
            
            const magnitude = Math.sqrt(gx * gx + gy * gy);
            const edge = Math.min(255, magnitude * 2);
            
            imageData.data[idx] = edge;
            imageData.data[idx + 1] = edge;
            imageData.data[idx + 2] = edge;
        }
    }
    
    processedCtx.putImageData(imageData, 0, 0);
    addHistoryEntry('Edge Detection Applied');
    updatePreview();
}

function applyRandomFilter() {
    // Copy original to processed first
    processedCtx.clearRect(0, 0, processedCanvas.width, processedCanvas.height);
    processedCtx.drawImage(originalCanvas, 0, 0);
    
    const imageData = processedCtx.getImageData(0, 0, processedCanvas.width, processedCanvas.height);
    const data = imageData.data;
    
    const filters = [
        { name: 'Vintage', r: 1.1, g: 0.9, b: 0.8 },
        { name: 'Cool', r: 0.8, g: 0.9, b: 1.1 },
        { name: 'Warm', r: 1.2, g: 1.1, b: 0.9 },
        { name: 'High Contrast', r: 1.3, g: 1.3, b: 1.3 }
    ];
    
    const filter = filters[Math.floor(Math.random() * filters.length)];
    
    for (let i = 0; i < data.length; i += 4) {
        data[i] = Math.min(255, data[i] * filter.r);
        data[i + 1] = Math.min(255, data[i + 1] * filter.g);
        data[i + 2] = Math.min(255, data[i + 2] * filter.b);
    }
    
    processedCtx.putImageData(imageData, 0, 0);
    addHistoryEntry('Filter Applied');
    updatePreview();
}

function activateDrawMode() {
    showNotification('Draw mode activated. Click and drag to draw.');
    createColorPicker();
}

function activateEraseMode() {
    showNotification('Eraser mode activated. Click and drag to erase.');
    showControlsPanel('Eraser');
    // Create eraser controls
    const existing = document.getElementById('eraserControls');
    if (!existing) {
        const controls = document.createElement('div');
        controls.id = 'eraserControls';
        controls.innerHTML = `
            <div class="control-group">
                <div class="scale-container">
                    <span class="scale-label">Eraser Size:</span>
                    <input type="range" id="eraserSlider" min="5" max="50" value="20">
                    <span class="value-display" id="eraserValue">20px</span>
                </div>
            </div>
        `;
        controlsPanel.appendChild(controls);
        
        document.getElementById('eraserSlider').addEventListener('input', (e) => {
            brushSize = parseInt(e.target.value);
            document.getElementById('eraserValue').textContent = brushSize + 'px';
        });
    }
}

function createColorPicker() {
    // Remove existing color picker if any
    const existing = document.getElementById('colorPicker');
    if (existing) existing.remove();
    
    const picker = document.createElement('div');
    picker.id = 'colorPicker';
    picker.className = 'color-picker-panel';
    
    colors.forEach((color, index) => {
        const swatch = document.createElement('div');
        swatch.className = 'color-swatch' + (color === selectedColor ? ' active' : '');
        swatch.style.background = color;
        swatch.addEventListener('click', () => {
            selectedColor = color;
            document.querySelectorAll('.color-swatch').forEach(s => s.classList.remove('active'));
            swatch.classList.add('active');
        });
        picker.appendChild(swatch);
    });
    
    const controlsPanel = document.querySelector('.controls-panel');
    if (controlsPanel) {
        controlsPanel.style.display = 'block';
        controlsPanel.innerHTML = '<h4>Brush Size</h4>';
        const slider = document.createElement('input');
        slider.type = 'range';
        slider.min = 1;
        slider.max = 20;
        slider.value = brushSize;
        slider.oninput = (e) => brushSize = parseInt(e.target.value);
        controlsPanel.appendChild(slider);
        controlsPanel.appendChild(slider.nextSibling || document.createElement('br'));
        controlsPanel.appendChild(picker);
    }
}

function startDrawing(e) {
    if (currentTool === 'draw' || currentTool === 'erase') {
        isDrawing = true;
        isErasing = (currentTool === 'erase');
        const rect = processedCanvas.getBoundingClientRect();
        processedCtx.beginPath();
        processedCtx.moveTo(e.clientX - rect.left, e.clientY - rect.top);
    }
}

function draw(e) {
    if (!isDrawing) return;
    
    const rect = processedCanvas.getBoundingClientRect();
    
    if (isErasing) {
        // Erase mode - use destination-out composite
        processedCtx.save();
        processedCtx.globalCompositeOperation = 'destination-out';
        processedCtx.lineTo(e.clientX - rect.left, e.clientY - rect.top);
        processedCtx.lineWidth = brushSize;
        processedCtx.lineCap = 'round';
        processedCtx.lineJoin = 'round';
        processedCtx.stroke();
        processedCtx.restore();
    } else {
        // Draw mode
        processedCtx.lineTo(e.clientX - rect.left, e.clientY - rect.top);
        processedCtx.strokeStyle = selectedColor;
        processedCtx.lineWidth = brushSize;
        processedCtx.lineCap = 'round';
        processedCtx.lineJoin = 'round';
        processedCtx.stroke();
    }
}

function stopDrawing() {
    if (isDrawing && (currentTool === 'draw' || currentTool === 'erase')) {
        // Drawing/Erasing is already on processed canvas
    }
    isDrawing = false;
    isErasing = false;
}

function saveToHistory() {
    imageHistory.push(processedCanvas.toDataURL());
    historyIndex = imageHistory.length - 1;
    
    if (imageHistory.length > 20) {
        imageHistory.shift();
    }
}

function undo() {
    if (historyIndex > 0) {
        historyIndex--;
        const img = new Image();
        img.onload = () => {
            processedCtx.clearRect(0, 0, processedCanvas.width, processedCanvas.height);
            processedCtx.drawImage(img, 0, 0);
            updatePreview();
        };
        img.src = imageHistory[historyIndex];
        addHistoryEntry('Undo Action');
    }
}

function saveImage() {
    if (!currentImage) {
        showNotification('No image to save');
        return;
    }
    
    const link = document.createElement('a');
    link.download = 'edited-image.png';
    link.href = processedCanvas.toDataURL();
    link.click();
    
    showNotification('Image saved successfully!');
}

function toggleHistoryPanel() {
    historyPanel.classList.toggle('hidden');
}

function addHistoryEntry(action) {
    const historyItem = document.createElement('div');
    historyItem.className = 'history-item';
    
    const icon = getIconForAction(action);
    const timestamp = new Date().toLocaleTimeString();
    
    historyItem.innerHTML = `
        <i class="${icon}"></i>
        <span>${action}</span>
        <small>${timestamp}</small>
    `;
    
    historyList.insertBefore(historyItem, historyList.firstChild);
    
    if (historyList.children.length > 10) {
        historyList.removeChild(historyList.lastChild);
    }
}

function getIconForAction(action) {
    const icons = {
        'Brightness Adjusted': 'fas fa-sun',
        'Image Rotated': 'fas fa-redo',
        'Filter Applied': 'fas fa-filter',
        'Grayscale Applied': 'fas fa-circle-notch',
        'Edge Detection Applied': 'fas fa-border-all',
        'Undo Action': 'fas fa-undo'
    };
    return icons[action] || 'fas fa-check';
}

function createThumbnail(dataUrl) {
    const item = document.createElement('div');
    item.className = 'thumbnail-item';
    
    const img = document.createElement('img');
    img.src = dataUrl;
    
    const deleteBtn = document.createElement('button');
    deleteBtn.className = 'thumbnail-delete';
    deleteBtn.innerHTML = '<i class="fas fa-times"></i>';
    deleteBtn.title = 'Delete this image';
    deleteBtn.onclick = (e) => {
        e.stopPropagation();
        item.remove();
        showNotification('Image deleted');
    };
    
    img.onclick = () => {
        const fullImg = new Image();
        fullImg.onload = () => {
            currentImage = fullImg;
            originalCanvas.width = fullImg.width;
            originalCanvas.height = fullImg.height;
            originalCtx.drawImage(fullImg, 0, 0);
            
            processedCanvas.width = fullImg.width;
            processedCanvas.height = fullImg.height;
            processedCtx.drawImage(fullImg, 0, 0);
            
            updatePreview();
        };
        fullImg.src = dataUrl;
    };
    
    item.appendChild(img);
    item.appendChild(deleteBtn);
    return item;
}

function loadThumbnails() {
    // Load from localStorage
    const saved = localStorage.getItem('thumbnails');
    if (saved) {
        const thumbnails = JSON.parse(saved);
        thumbnails.forEach(url => {
            thumbnailGrid.appendChild(createThumbnail(url));
        });
    }
}

function showNotification(message) {
    // Simple notification
    const notification = document.createElement('div');
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: #4a90e2;
        color: white;
        padding: 15px 25px;
        border-radius: 10px;
        box-shadow: 0 4px 15px rgba(0,0,0,0.2);
        z-index: 1000;
        animation: slideIn 0.3s ease;
    `;
    notification.textContent = message;
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.style.animation = 'slideOut 0.3s ease';
        setTimeout(() => notification.remove(), 300);
    }, 3000);
}

// Add CSS animations
const style = document.createElement('style');
style.textContent = `
    @keyframes slideIn {
        from { transform: translateX(400px); opacity: 0; }
        to { transform: translateX(0); opacity: 1; }
    }
    @keyframes slideOut {
        from { transform: translateX(0); opacity: 1; }
        to { transform: translateX(400px); opacity: 0; }
    }
    .history-panel.hidden { display: none; }
`;
document.head.appendChild(style);

