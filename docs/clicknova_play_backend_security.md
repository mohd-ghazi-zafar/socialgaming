# ClickNova Play - Backend Architecture & Security Blueprint

This document outlines the authoritative backend design, room management, Role-Based Access Control (RBAC), and multi-tier anti-cheat countermeasures for **ClickNova Play** (Ludo, Chess, Jackaroo, Domino with live audio and text chat).

---

## 1. Core Backend Responsibilities

### Authoritative Game State Engine
* **Single Source of Truth:** The backend computes all game logic, dice rolls, tile drops, and win conditions in isolated server-side memory spaces per room.
* **Move Validation:** Clients only send intentions (e.g., "move piece X to Y"). The server validates legality. If illegal, the move is rejected, overriding any tampered client states.

### WebSocket Room & Socket Management
* **Real-Time Sync:** Maintains persistent, bi-directional Secure WebSocket (`WSS`) connections mapped to specific game table IDs using Redis pub/sub.
* **State Deltas:** Broadcasts lightweight state updates to all connected players at sub-50ms intervals.

### Matchmaking & Session Service
* **Queue Management:** Pools incoming players based on game mode, stake tiers, and ELO ratings.
* **Graceful Disconnects:** Manages unexpected player drops with a 30-second reconnection grace period before triggering an automatic match forfeit.

### Communication Routing
* **Text Chat:** Routes instant messages through the Socket.io pub/sub pipeline.
* **Voice Chat (WebRTC):** Coordinates SDP offers, answers, and ICE candidates via signaling servers while keeping heavy audio streams peer-to-peer or routed through an SFU.

---

## 2. Private Rooms & Role-Based Access Control (RBAC)

### Secure Room Provisioning
* **Randomized Tokens:** Table creation generates cryptographically secure room codes stored in Redis with strict capacity caps (5–10 players).
* **PIN Protection:** Optional 4-digit PIN checks during the WebSocket handshake to prevent unauthorized guest entry.

### Role Hierarchy
* **Host (Table Creator):** Full administrative powers to start the match, kick disruptive participants, or change room rules.
* **Active Player:** Granted permissions to execute game moves, send text chat, and transmit audio via WebRTC.
* **Spectator / Watcher:** Read-only access to board states and listening channels with write permissions disabled to prevent ghosting or tampering.

---

## 3. Anti-Cheat & Security Countermeasures

### Zero-Trust Architecture
* Clients are never trusted with game outcomes. Dice rolls and random draws use cryptographically secure random number generators (`crypto.getRandomValues`) executed exclusively server-side.

### Data Masking & Fog of War
* Hidden states (such as opponent hands in Domino or card games) are never sent to a client's local memory prematurely, neutralizing memory-inspection tools.

### Rate Limiting & Packet Flooding Defense
* Redis token buckets enforce strict rate limits per user session, instantly throttling and dropping socket connections that spam move requests.

### Behavioral & Heuristic Bot Detection
* Telemetry engines analyze player input intervals. Accounts exhibiting inhumanly consistent reaction times or optimal algorithmic move patterns are automatically flagged.

### Hardware Fingerprinting & Banning
* Enforcement goes beyond simple IP blocking by capturing persistent device tokens and hardware IDs to permanently lock out repeat offenders and script-kiddies.