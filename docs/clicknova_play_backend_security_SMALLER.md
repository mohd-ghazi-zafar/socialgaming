# ClickNova Play - Backend & Security Summary

## 1. Core Backend Responsibilities
* **Authoritative Engine:** Single source of truth for game rules, dice rolls, and state validation. Rejects all invalid or client-tampered moves.
* **WebSocket Management:** Handles real-time room sync via Redis pub/sub at sub-50ms intervals.
* **Matchmaking & State:** Pools players by ELO/stakes and persists user ledger data to PostgreSQL.
* **Communication Routing:** Text via WebSockets (`Socket.io`), Voice via peer-to-peer/SFU WebRTC pipelines.

## 2. Private Rooms & RBAC
* **Secure Access:** 5-10 player tables protected by unique Redis room codes and PINs.
* **Role-Based Access Control:**
  * **Host:** Can start matches, kick users, and modify room settings.
  * **Active Player:** Full game actions, text chat, and voice transmit permissions.
  * **Spectator:** Read-only board and listening access.

## 3. Anti-Cheat & Security Measures
* **Zero-Trust Architecture:** Clients never calculate game outcomes; cryptographic randomness (`crypto.getRandomValues`) runs server-side.
* **Data Masking:** Hidden states (e.g., opponent tiles) are never sent to the client prematurely to block memory inspection.
* **Rate Limiting & Flooding Control:** Redis token buckets throttle event bursts and drop spamming socket connections.
* **Behavioral Heuristics:** Detects bot automation and inhumanly consistent move intervals.
* **Hardware Fingerprinting:** Bans persistent device tokens alongside IPs to stop repeat offenders.