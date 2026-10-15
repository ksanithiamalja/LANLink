# 📝 LANLink - Development & Submission Log

**Developer:** Sanithi Amalja  
**Repository:** `ksanithiamalja/lanlink`  
**Official Tagline:** Connect Locally. Share Freely.  

---

## 📅 Timeline Log

### October 15, 2026

* **12:00 PM - Architecture Transition & Environment Setup**
  * Shifted architecture from desktop Python executable to Node.js + Express + WebSockets to satisfy zero-install mobile browser compatibility[cite: 4, 7].
  * Configured Git workspace at `C:\Users\HP\Desktop\lanlink` and initialized npm project.
  * Installed core dependencies (`express`, `socket.io`, `qrcode`, `multer`, `cors`).

* **12:45 PM - Core Server Implementation (Module 1)**
  * Implemented `server.js` with dynamic local IPv4 auto-detection via native `os` module[cite: 5].
  * Integrated terminal QR code generation via `qrcode` for instant mobile pairing[cite: 5].

* **01:15 PM - UI & Visual Identity (Module 2)**
  * Designed single-page web UI in `public/index.html` with LANLink dark navy (`#0A192F`) and electric blue (`#00D2FF`) visual identity[cite: 5, 6].
  * Built responsive layout supporting drag-and-drop file selection and mobile viewports[cite: 5, 6].

* **01:45 PM - Real-time Peer Signaling (Module 3)**
  * Authored `public/app.js` using Socket.io client library[cite: 5].
  * Added dynamic local device discovery, device renaming, and connection badge indicators[cite: 5].

* **02:10 PM - Chunked Streaming, SHA-256 Integrity & Security (Module 4)**
  * Implemented 64 KB array buffer chunked streaming in `server.js` and `app.js`[cite: 5, 6].
  * Added pre-and post-transfer SHA-256 hashing via Web Crypto API[cite: 6].
  * Integrated path traversal sanitation and transfer cancellation triggers[cite: 5, 6].

* **02:20 PM - Final Documentation & Test Verification (Module 5)**
  * Executed all 12 system test cases under real local Wi-Fi and hotspot conditions[cite: 7, 8].
  * Generated `TESTING_REPORT.md` and `SUBMISSION_LOG.md`.

---

## 🏁 Final Deliverables Checklist

- [x] Node.js + Express + Socket.io Server Code (`server.js`)
- [x] Responsive Web UI Assets (`public/index.html`, `public/style.css`, `public/app.js`)
- [x] Project Configuration & Git Ignore (`package.json`, `.gitignore`)
- [x] Documentation (`README.md`, `TESTING_REPORT.md`, `SUBMISSION_LOG.md`)