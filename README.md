# 🚀 LANLink - Connect Locally. Share Freely.

**LANLink** is an offline, zero-cloud local file-sharing web application that enables seamless, high-speed file transfers between laptops and mobile phones via modern web browsers over a shared Local Area Network (LAN).

---

## ✨ Features

* **Zero Cloud & Completely Offline:** Transmit files directly across your local Wi-Fi network or mobile hotspot without third-party servers or internet access.
* **Instant Device Discovery:** Automatic local peer detection using WebSockets with terminal-rendered QR codes for instant mobile pairing.
* **Mobile-First Touch Compatibility:** Native file picker compatibility supporting photo library and file manager prompts across Android Chrome and iOS Safari.
* **Chunked Binary Streaming:** High-performance 64 KB array buffer chunking via client-side `FileReader` streams with real-time progress, speed (KB/s), and ETA calculations.
* **Integrity & Security:** Automatic SHA-256 cryptographic checksum verification and strict server-side filename sanitization (`path.basename()`).

---

## 🛠️ Technology Stack

* **Backend:** Node.js, Express, Socket.io
* **Frontend:** HTML5, Modern CSS3 (Dark Navy `#0A192F` & Electric Blue `#00D2FF` theme), Vanilla JavaScript (ES6+)
* **Utilities:** `qrcode` (Terminal QR Generation), Web Crypto API (SHA-256 Checksums)

---

## 🚀 Quick Start Guide

### Prerequisites
* [Node.js](https://nodejs.org/) installed on your host machine.
* Both your host machine (laptop) and client devices (mobile phones/tablets) must be connected to the **same Wi-Fi network or mobile hotspot**.

### Installation & Execution

1. **Clone the Repository:**
   ```bash
   git clone [https://github.com/ksanithiamalja/lanlink.git](https://github.com/ksanithiamalja/lanlink.git)
   cd lanlink


1. **Install Dependencies:**
    ```bash
    npm install


 2. **Start the Application:**
    ```bash
    node server.js

 3.  **Connect Devices:**
   *   Host Machine: Access` http://localhost:3000`in your web browser.

   *  Mobile / Peer Devices: Scan the QR code displayed in your terminal, or enter the printed LAN URL `(e.g., http://192.168.x.x:3000)` into your browser.


 ## 📁 Project Structure
```
 lanlink/
├── public/
│   ├── index.html      # Mobile-first web interface
│   ├── style.css       # Responsive dark navy theme
│   └── app.js          # WebSocket signaling & chunked streaming logic
├── server.js           # Node.js Express server & Socket.io relay
├── package.json        # Dependencies and scripts
├── TESTING_REPORT.md   # Architecture diagram and testing matrix
└── README.md           # Project documentation
```

##🔒 Security & Privacy

* Sanitized Filenames: Filenames are stripped of path structures via path.basename() to eliminate path traversal vulnerabilities.

* Checksum Verification: Files are hashed using SHA-256 prior to delivery to guarantee byte-for-byte stream integrity.

* Memory Safety: Buffer payloads on the server are constrained (`maxHttpBufferSize: 1e8`) to prevent heap exhaustion attacks.

##📄 License & Deliverables

*Project Name: LANLink

*Tagline: Connect Locally. Share Freely.

*Submission Date: October 16, 2026

*Repository: `ksanithiamalja/lanlink`


