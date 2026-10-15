// Initialize Socket.io connection
const socket = io();

// DOM Elements
const deviceNameInput = document.getElementById('device-name');
const saveDeviceBtn = document.getElementById('save-device-btn');
const statusText = document.getElementById('status-text');
const peerListContainer = document.getElementById('peer-list');
const targetPeerSelect = document.getElementById('target-peer-select');
const dropZone = document.getElementById('drop-zone');
const fileInput = document.getElementById('file-input');
const fileInfo = document.getElementById('file-info');
const selectedFileName = document.getElementById('selected-file-name');
const selectedFileSize = document.getElementById('selected-file-size');
const clearFileBtn = document.getElementById('clear-file-btn');
const sendBtn = document.getElementById('send-btn');
const toast = document.getElementById('toast');

// State Variables
let selectedFile = null;
let activePeers = [];
let localDeviceName = localStorage.getItem('lanlink_device_name') || generateDefaultDeviceName();

// Initialize UI State
deviceNameInput.value = localDeviceName;

// Helper: Generate default device name based on OS/Browser
function generateDefaultDeviceName() {
    const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
    const platform = isMobile ? 'Mobile' : 'Laptop/PC';
    const randomId = Math.floor(1000 + Math.random() * 9000);
    return `${platform}-${randomId}`;
}

// Register device with WebSocket server
function registerDevice() {
    socket.emit('register_device', {
        name: localDeviceName,
        userAgent: navigator.userAgent
    });
}

// Save Custom Device Name
saveDeviceBtn.addEventListener('click', () => {
    const newName = deviceNameInput.value.trim();
    if (newName) {
        localDeviceName = newName;
        localStorage.setItem('lanlink_device_name', localDeviceName);
        registerDevice();
        showToast('Device name updated!');
    }
});

// Socket Event Handlers
socket.on('connect', () => {
    statusText.textContent = 'Connected to LANLink Server';
    registerDevice();
});

socket.on('disconnect', () => {
    statusText.textContent = 'Disconnected from Server';
});

// Real-time Peer List Update
socket.on('update_peer_list', (peers) => {
    // Filter out our own device
    activePeers = peers.filter(peer => peer.id !== socket.id);
    renderPeerList();
    renderTargetSelect();
});

// Render Discovered Devices
function renderPeerList() {
    if (activePeers.length === 0) {
        peerListContainer.innerHTML = '<div class="empty-peers"><i class="fa-solid fa-spinner fa-spin"></i> Scanning for nearby LANLink devices...</div>';
        return;
    }

    peerListContainer.innerHTML = '';
    activePeers.forEach(peer => {
        const peerItem = document.createElement('div');
        peerItem.className = 'peer-item';
        peerItem.innerHTML = `
            <div class="peer-info">
                <i class="fa-solid ${peer.name.toLowerCase().includes('mobile') || peer.name.toLowerCase().includes('phone') ? 'fa-mobile-screen' : 'fa-laptop'} header-icon"></i>
                <div>
                    <div class="peer-name">${escapeHtml(peer.name)}</div>
                    <div class="peer-ip">Active Peer</div>
                </div>
            </div>
            <span class="status-badge"><span class="status-dot online"></span> Ready</span>
        `;
        peerListContainer.appendChild(peerItem);
    });
}

// Render Select Dropdown for Sending Files
function renderTargetSelect() {
    targetPeerSelect.innerHTML = '<option value="">Select Target Device...</option>';
    
    activePeers.forEach(peer => {
        const option = document.createElement('option');
        option.value = peer.id;
        option.textContent = peer.name;
        targetPeerSelect.appendChild(option);
    });

    updateSendButtonState();
}

// File Picker & Drag and Drop Setup
dropZone.addEventListener('click', () => fileInput.click());

dropZone.addEventListener('dragover', (e) => {
    e.preventDefault();
    dropZone.classList.add('dragover');
});

dropZone.addEventListener('dragleave', () => {
    dropZone.classList.remove('dragover');
});

dropZone.addEventListener('drop', (e) => {
    e.preventDefault();
    dropZone.classList.remove('dragover');
    if (e.dataTransfer.files.length > 0) {
        handleFileSelect(e.dataTransfer.files[0]);
    }
});

fileInput.addEventListener('change', (e) => {
    if (e.target.files.length > 0) {
        handleFileSelect(e.target.files[0]);
    }
});

function handleFileSelect(file) {
    selectedFile = file;
    selectedFileName.textContent = file.name;
    selectedFileSize.textContent = `(${formatBytes(file.size)})`;
    fileInfo.style.display = 'flex';
    updateSendButtonState();
}

clearFileBtn.addEventListener('click', () => {
    selectedFile = null;
    fileInput.value = '';
    fileInfo.style.display = 'none';
    updateSendButtonState();
});

targetPeerSelect.addEventListener('change', updateSendButtonState);

function updateSendButtonState() {
    sendBtn.disabled = !(selectedFile && targetPeerSelect.value);
}

// Utility Functions
function formatBytes(bytes) {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

function showToast(message) {
    toast.textContent = message;
    toast.style.display = 'block';
    setTimeout(() => {
        toast.style.display = 'none';
    }, 3000);
}

function escapeHtml(str) {
    return str.replace(/[&<>"']/g, (m) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[m]));
}