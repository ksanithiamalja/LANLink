# 🧪 LANLink - System Architecture & Testing Report

**Project Name:** LANLink  
**Tagline:** Connect Locally. Share Freely.  
**Submission Date:** 16 October 2026  

---
## 📐 1. System Architecture Diagram

```
+-----------------------------------------------------------------------------------+
|                                 LOCAL AREA NETWORK                                |
|                                                                                   |
|  +------------------------------+                  +---------------------------+  
|  |     Sender Client (Web)      |                  |   Receiver Client (Web)   |  
|  |   (Laptop / Mobile Browser)  |                  | (Laptop / Mobile Browser) |  
|  +--------------+---------------+                  +-------------+-------------+  
|                 |                                                ^                |
|                 | 1. Select File & Target                        |                |
|                 | 2. Compute SHA-256 Hash                        |                |
|                 v                                                |                |
|   +---------------------------+                    +-------------+-------------+  
|   |    FileReader Stream      |                    |    ArrayBuffer Reassembly |  
|   |    (64 KB Chunking)       |                    |    (Blob Generation)      |  
|   +-------------+-------------+                    +-------------+-------------+  
|                 |                                                ^                |
|                 | WebSocket Binary Payload                       | Download Prompt|
|                 v                                                |                |
|  +-----------------------------------------------------------------------------+  
|  |                           Node.js Express Server                            |  
|  |                             (Port 3000 Router)                              |  
|  |                                                                             |  
|  |  +--------------------------+                 +--------------------------+  
|  |  |   Socket.io Relay Hub    |                 |   Native OS IPv4 Resolver  |  
|  |  |  (maxHttpBufferSize: 1e8)|                 |   (QRCode Terminal Display)  |  
|  |  +------------+-------------+                 +-------------+------------+  
|  |               |                                             |               |  
|  +---------------+---------------------------------------------+---------------+  
|                  |                                             |                  |
|                  +---------------------[LAN]-------------------+                  |
+-----------------------------------------------------------------------------------+
```

---

## 📑 2. Detailed Test Cases & Execution Results

| Test ID | Test Category | Description & Test Procedure | Expected Result | Result | Status |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **TC-01** | Device Connection | Connect laptop & mobile phone to same Wi-Fi; scan QR code | Phone loads UI without app installation | Success | **PASS** |
| **TC-02** | Device Disconnection | Close browser tab on phone | Server updates active peer list dynamically across clients | Success | **PASS** |
| **TC-03** | Image/Video Transfer | Send `.png` and `.mp4` files between devices | Files received intact and playable | Success | **PASS** |
| **TC-04** | Document/Archive | Share `.pdf` documents and `.zip` archives | Clean transfer without binary corruption | Success | **PASS** |
| **TC-05** | Large File Transfer | Stream a 500 MB video file via 64 KB chunks | Low memory footprint; smooth progress tracking | Success | **PASS** |
| **TC-06** | Cross-Platform | Transfer files between Windows PC and iOS/Android phone | Seamless cross-platform transfer | Success | **PASS** |
| **TC-07** | Simultaneous Transfers | Initiate transfer while another client is connected | WebSocket isolates and routes peer traffic correctly | Success | **PASS** |
| **TC-08** | Transfer Cancellation | Click "Cancel Transfer" mid-stream | Transfer halts immediately on both ends | Success | **PASS** |
| **TC-09** | Connection Loss | Disconnect Wi-Fi during an active file transfer | Error toast alerts user gracefully; no crash | Success | **PASS** |
| **TC-10** | Path Traversal Security | Send file containing relative directory names (`../`) | Filename sanitized via `path.basename()` | Success | **PASS** |
| **TC-11** | Integrity Verification | Compute SHA-256 hash pre-and post-transfer | Checksums match identically on receiver | Success | **PASS** |
| **TC-12** | Pure Offline Mode | Disconnect Wi-Fi router from WAN / Internet | App functions at high speed locally | Success | **PASS** |

---

## 🔒 3. Security & Vulnerability Protections

1. **Path Traversal Shield:** Filenames are stripped of path modifiers using Node.js `path.basename()` on server ingress.
2. **SHA-256 Data Integrity:** Binary streams are verified using `crypto.subtle.digest('SHA-256')` prior to download triggering[cite: 6].
3. **Explicit Pairing Confirmation:** Recipients must confirm incoming file transfer requests before streaminh begins[cites:6].