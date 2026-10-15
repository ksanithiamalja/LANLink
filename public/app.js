// Connect with Socket.io
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

// Progress Card Elements
const progressCard = document.getElementById('progress-card');
const progressTitle = document.getElementById('progress-title');
const progressBarFill = document.getElementById('progress-bar-fill');
const progressPercentage = document.getElementById('progress-percentage');
const transferSpeed = document.getElementById('transfer-speed');
const transferEta = document.getElementById('transfer-eta');
const cancelBtn = document.getElementById('cancel-btn');

// State Variables
let selectedFile = null;
let activePeers = [];
let localDeviceName = localStorage.getItem('lanlink_device_name') || generateDefaultDeviceName();

// Transfer Control Variables
const CHUNK_SIZE = 64 * 1024; // 64 KB chunks
let currentTransfer = null;
let incomingFileBuffer = [];
let receivedBytes = 0;
let transferStartTime = 0;

// Set default device name
deviceNameInput.value = localDeviceName;

function generateDefaultDeviceName() {
    const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
    const platform = isMobile ? 'Mobile' : 'Laptop';
    const randomId = Math.floor(1000 + Math.random() * 9000);
    return `${platform}-${randomId}`;
}

function registerDevice() {
    socket.emit('register_device', {
        name: localDeviceName,
        type: /Android|webOS|iPhone|iPad|iPod/i.test(navigator.userAgent) ? 'Mobile' : 'Laptop'
    });
}

saveDeviceBtn.addEventListener('click', () => {
    const newName = deviceNameInput.value.trim();
    if (newName) {
        localDeviceName = newName;
        localStorage.setItem('lanlink_device_name', localDeviceName);
        registerDevice();
        showToast('Device name saved!');
    }
});

// Socket Events
socket.on('connect', () => {
    statusText.textContent = 'Connected to LANLink Server';
    registerDevice();
});

socket.on('disconnect', () => {
    statusText.textContent = 'Disconnected from Server';
});

socket.on('update_peer_list', (peers) => {
    activePeers = peers.filter(peer => peer.id !== socket.id);
    renderPeerList();
    renderTargetSelect();
});

function renderPeerList() {
    if (activePeers.length === 0) {
        peerListContainer.innerHTML = '<div class="empty-peers"><i class="fa-solid fa-spinner fa-spin"></i> Scanning for nearby devices...</div>';
        return;
    }

    peerListContainer.innerHTML = '';
    activePeers.forEach(peer => {
        const peerItem = document.createElement('div');
        peerItem.className = 'peer-item';
        peerItem.innerHTML = `
            <div class="peer-info">
                <i class="fa-solid ${peer.type === 'Mobile' ? 'fa-mobile-screen' : 'fa-laptop'} header-icon"></i>
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

// Drag & Drop Event Handlers
dropZone.addEventListener('dragover', (e) => {
    e.preventDefault();
    dropZone.classList.add('dragover');
});

dropZone.addEventListener('dragleave', () => dropZone.classList.remove('dragover'));

dropZone.addEventListener('drop', (e) => {
    e.preventDefault();
    dropZone.classList.remove('dragover');
    if (e.dataTransfer.files.length > 0) handleFileSelect(e.dataTransfer.files[0]);
});

// File Selection Handler (Handles both tap and file picker change)
fileInput.addEventListener('change', (e) => {
    if (e.target.files.length > 0) handleFileSelect(e.target.files[0]);
});

function handleFileSelect(file) {
    selectedFile = file;
    selectedFileName.textContent = file.name;
    selectedFileSize.textContent = `(${formatBytes(file.size)})`;
    fileInfo.style.display = 'flex';
    updateSendButtonState();
}

clearFileBtn.addEventListener('click', (e) => {
    e.preventDefault();
    selectedFile = null;
    fileInput.value = '';
    fileInfo.style.display = 'none';
    updateSendButtonState();
});

targetPeerSelect.addEventListener('change', updateSendButtonState);

function updateSendButtonState() {
    sendBtn.disabled = !(selectedFile && targetPeerSelect.value);
}

// SHA-256 Checksum Calculation
async function calculateSHA256(file) {
    const arrayBuffer = await file.arrayBuffer();
    const hashBuffer = await crypto.subtle.digest('SHA-256', arrayBuffer);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

// Send File Request
sendBtn.addEventListener('click', async () => {
    if (!selectedFile || !targetPeerSelect.value) return;

    const targetId = targetPeerSelect.value;
    showToast('Preparing file...');

    let checksum = '';
    try {
        checksum = await calculateSHA256(selectedFile);
    } catch (e) {
        checksum = 'checksum-skipped';
    }

    currentTransfer = {
        role: 'sender',
        targetId: targetId,
        file: selectedFile,
        checksum: checksum,
        isCancelled: false
    };

    socket.emit('request_transfer', {
        targetId: targetId,
        filename: selectedFile.name,
        filesize: selectedFile.size,
        filetype: selectedFile.type,
        checksum: checksum
    });
});

// Handle Receiver Incoming Request
socket.on('incoming_transfer_request', (data) => {
    const accept = confirm(`Incoming File from ${data.senderName}:\n\nFilename: ${data.filename}\nSize: ${formatBytes(data.filesize)}\n\nDo you want to accept?`);

    if (accept) {
        currentTransfer = {
            role: 'receiver',
            senderId: data.senderId,
            filename: data.filename,
            filesize: data.filesize,
            filetype: data.filetype,
            checksum: data.checksum,
            isCancelled: false
        };

        incomingFileBuffer = [];
        receivedBytes = 0;
        transferStartTime = Date.now();

        socket.emit('accept_transfer', { senderId: data.senderId });
        showProgressUI('Receiving File...');
    } else {
        socket.emit('reject_transfer', { senderId: data.senderId });
    }
});

// Transfer Accepted -> Start Chunk Streaming
socket.on('transfer_accepted', (data) => {
    if (!currentTransfer || currentTransfer.isCancelled) return;
    showProgressUI('Sending File...');
    transferStartTime = Date.now();
    streamChunks();
});

socket.on('transfer_rejected', (data) => {
    hideProgressUI();
    alert(`Transfer Rejected: ${data.reason}`);
    currentTransfer = null;
});

// Stream Chunks (FileReader for Mobile & Desktop compatibility)
async function streamChunks() {
    const file = currentTransfer.file;
    let offset = 0;

    while (offset < file.size) {
        if (!currentTransfer || currentTransfer.isCancelled) break;

        const slice = file.slice(offset, offset + CHUNK_SIZE);
        
        const buffer = await new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = () => resolve(reader.result);
            reader.onerror = reject;
            reader.readAsArrayBuffer(slice);
        });

        const isLast = (offset + CHUNK_SIZE) >= file.size;

        socket.emit('send_chunk', {
            targetId: currentTransfer.targetId,
            chunk: buffer,
            offset: offset,
            isLast: isLast
        });

        offset += CHUNK_SIZE;
        updateProgressUI(Math.min(offset, file.size), file.size);

        await new Promise(resolve => setTimeout(resolve, 10));
    }

    if (currentTransfer && !currentTransfer.isCancelled) {
        showToast('Transfer completed!');
        setTimeout(hideProgressUI, 2000);
    }
}

// Buffer Received Chunks
socket.on('receive_chunk', async (data) => {
    if (!currentTransfer || currentTransfer.isCancelled) return;

    incomingFileBuffer.push(data.chunk);
    receivedBytes += data.chunk.byteLength;

    updateProgressUI(receivedBytes, currentTransfer.filesize);

    if (data.isLast) {
        showToast('Saving file...');
        const blob = new Blob(incomingFileBuffer, { type: currentTransfer.filetype || 'application/octet-stream' });
        triggerFileDownload(blob, currentTransfer.filename);
        showToast('File downloaded successfully!');
        setTimeout(hideProgressUI, 2000);
        currentTransfer = null;
    }
});

// Trigger Download
function triggerFileDownload(blob, filename) {
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `received_${filename}`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
}

// Cancel Handling
cancelBtn.addEventListener('click', () => {
    if (currentTransfer) {
        currentTransfer.isCancelled = true;
        const targetId = currentTransfer.role === 'sender' ? currentTransfer.targetId : currentTransfer.senderId;
        socket.emit('cancel_transfer', { targetId: targetId });
        hideProgressUI();
        showToast('Transfer cancelled.');
        currentTransfer = null;
    }
});

socket.on('transfer_cancelled', (data) => {
    if (currentTransfer) currentTransfer.isCancelled = true;
    hideProgressUI();
    alert(data.reason);
    currentTransfer = null;
});

// UI Helpers
function showProgressUI(title) {
    progressTitle.textContent = title;
    progressCard.style.display = 'block';
    progressBarFill.style.width = '0%';
    progressPercentage.textContent = '0%';
    transferSpeed.textContent = '0 KB/s';
    transferEta.textContent = 'ETA: --';
}

function hideProgressUI() {
    progressCard.style.display = 'none';
}

function updateProgressUI(current, total) {
    const percentage = Math.min(Math.round((current / total) * 100), 100);
    progressBarFill.style.width = `${percentage}%`;
    progressPercentage.textContent = `${percentage}%`;

    const elapsedTime = (Date.now() - transferStartTime) / 1000;
    if (elapsedTime > 0) {
        const speedBytesPerSec = current / elapsedTime;
        transferSpeed.textContent = formatBytes(speedBytesPerSec) + '/s';

        const remainingBytes = total - current;
        const etaSeconds = Math.round(remainingBytes / speedBytesPerSec);
        transferEta.textContent = `ETA: ${isFinite(etaSeconds) ? etaSeconds + 's' : '--'}`;
    }
}

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
    setTimeout(() => { toast.style.display = 'none'; }, 3000);
}

function escapeHtml(str) {
    return str.replace(/[&<>"']/g, (m) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[m]));
}