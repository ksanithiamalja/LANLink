const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const os = require('os');
const path = require('path');
const QRCode = require('qrcode');
const cors = require('cors');

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
    cors: { origin: '*' }
});

const PORT = 3000;

app.use(cors());
app.use(express.static(path.join(__dirname, 'public')));

// Auto-detect local IPv4 address
function getLocalIP() {
    const interfaces = os.networkInterfaces();
    for (const name in interfaces) {
        for (const net of interfaces[name]) {
            if (net.family === 'IPv4' && !net.internal) {
                return net.address;
            }
        }
    }
    return '127.0.0.1';
}

const localIP = getLocalIP();
const serverUrl = `http://${localIP}:${PORT}`;

let activePeers = {};

io.on('connection', (socket) => {
    console.log(`Device connected: ${socket.id}`);

    socket.on('register_device', (deviceInfo) => {
        activePeers[socket.id] = {
            id: socket.id,
            name: deviceInfo.name || 'Unknown Device',
            type: deviceInfo.type || 'Mobile/Desktop',
            ip: socket.handshake.address
        };
        io.emit('update_peer_list', Object.values(activePeers));
    });

    socket.on('send_chunk', (data) => {
        socket.to(data.targetId).emit('receive_chunk', data);
    });

    socket.on('disconnect', () => {
        delete activePeers[socket.id];
        io.emit('update_peer_list', Object.values(activePeers));
        console.log(`Device disconnected: ${socket.id}`);
    });
});

server.listen(PORT, '0.0.0.0', () => {
    console.log('\n==================================================');
    console.log('  🚀 LANLink - Connect Locally. Share Freely.');
    console.log('==================================================');
    console.log(` Local Server:   http://localhost:${PORT}`);
    console.log(` LAN Access URL: ${serverUrl}`);
    console.log('==================================================');
    console.log(' Scan this QR code with your phone camera:\n');

    QRCode.toString(serverUrl, { type: 'terminal', small: true }, (err, qr) => {
        if (!err) console.log(qr);
        console.log('==================================================\n');
    });
});