# Product Requirement Document (PRD)
## MLBB TOP — Tactical Telemetry

---

## 1. Executive Summary
**MLBB TOP (Tactical Telemetry)** is a single-page web application designed for players of *Mobile Legends: Bang Bang (MLBB)*. It serves as a tactical assistant and hero encyclopedia, providing real-time team draft simulations, tier list analysis, detailed hero builds and skills, an interactive trivia quiz, and personal user profile tracking.

The application is built with a mobile-first design, optimized to mimic a native smartphone interface, with support for high-contrast accessibility and dark-mode styling.

---

## 2. Product Architecture & Stack
* **Frontend:** Vanilla HTML5, CSS3, JavaScript (ES6+).
* **Styling & Design System:**
  * Custom CSS variables (`--bg`, `--panel`, `--blue`, `--amber`, `--green`, `--red`).
  * High-Contrast accessibility mode (`body.hc`).
  * Fonts: *Space Grotesk* (Headers/Brand) & *JetBrains Mono* (Code, metrics, UI labels).
  * Responsive mobile-frame UI (max-width `390px` or centered container on desktop viewports `≥430px`).
* **Data Storage:** In-memory dataset arrays (`HD`, `HX`) with local user state persistence in JS variables.

---

## 3. Core Features & Functional Requirements

### 3.1. Navigation & Screen Management
* **Top App Bar (`.top`):**
  * **Back Button (`#back`):** Returns to previous screen or closes active modals.
  * **Brand Title:** Displays app title and dynamic screen subtitle.
  * **Action/Settings Button (`#act`):** Opens global options or filter panels.
* **Bottom Navigation Bar (`nav`):**
  * Persistent 5-tab dynamic navigation across main application modules:
    1. Draft / Tactical
    2. Tier List
    3. Heroes Database
    4. Quiz / Leaderboard
    5. User Profile

---

### 3.2. Dynamic Draft Simulator (`v-draft`)
* **Objective:** Assist players during hero selection (Draft Pick phase) to maximize win rates and team synergy.
* **Components & Capabilities:**
  * **Ally vs. Enemy Slots:** 5 slots for Blue Team (Ally) and 5 slots for Red Team (Enemy).
  * **Win Rate Calculation Badge:** Displays dynamic estimated team win percentage based on selected match-ups.
  * **Hero Picker Drawer/Sheet (`#sheet`):** Bottom modal for selecting heroes with integrated search bar (`#q`) and clear/remove slot functionality.
  * **Recommended Hero Suggestions (`.rec`):** Algorithmic top recommendation based on counter-picks (`vs`) and synergy (`mate`).
  * **Alternative Picks (`.alts`):** Secondary hero suggestions with situational rationale.
  * **Metrics Panel (`.mets`):** Visual indicators for team composition strengths (e.g., CC, Burst, Sustain).

---

### 3.3. Meta Tier List (`v-tier`)
* **Objective:** Provide up-to-date hero rankings based on current competitive meta.
* **Tiers Supported:** `SS` (S-Plus / Overpowered), `S` (Strong), `A` (Viable), `B` (Situational).
* **Filtering & Sorting (`.chips`, `.seg`):**
  * Filter by Role (Tank, Fighter, Assassin, Mage, Marksman, Support).
  * Filter by Lane (Gold Lane, EXP Lane, Mid Lane, Jungling, Roam).
  * Sort by Win Rate (WR), Pick Rate (PR), or Ban Rate (BR).

---

### 3.4. Heroes Database & Detail View (`v-heroes`, `v-hero`)
* **Hero Search & List (`v-heroes`):**
  * Instant search and lane filter chips.
  * Grid/List view toggles showing hero avatar, tier tag, primary role, and primary lane.
* **Hero Deep-Dive Profile (`v-hero`):**
  * **Header:** Hero name, title, specialty tags, damage type (Physical/Magic), attack range (Melee/Ranged).
  * **Base Stats Matrix:** Radar/Metrics for Durability, Offense, Skill Effects, and Difficulty.
  * **Skills Overview (`.ab`):** Detailed breakdown of passive and active abilities (Cooldowns, Mana cost, Skill type tags, and descriptions).
  * **Recommended Builds (`.bd`):** Equipment build paths, Emblem setups with talent attributes, and recommended Battle Spells.
  * **Matchup Radar (`.mu`):**
    * **Strong Against (Counters):** Heroes this champion counters.
    * **Weak Against (Countered By):** Threat heroes.
    * **Best Teammates (Synergies):** Complementary heroes.

---

### 3.5. Tactical Quiz & Academy (`v-quiz`)
* **Objective:** Test and improve game knowledge through interactive trivia.
* **Key Components:**
  * **Rank Progress / Trophy Road:** Displays current knowledge tier/rank badge and unlockable milestone rewards.
  * **Quiz Card (`.qcard`):**
    * Scenario/question display with optional quotes or skill context.
    * Multiple-choice options (`A`, `B`, `C`, `D`).
    * Real-time visual feedback (Green highlight for correct, Red for incorrect).
    * Educational explanation tip (`.tip`) post-answer.
  * **Leaderboard (`.lb`):** Local/Global player rankings.

---

### 3.6. User Profile & Settings (`v-profile`)
* **User Stats Summary:**
  * Customizable player nickname input (`.nick`).
  * Win Rate, Matches Played, and Quiz Score indicators.
* **App Preferences (`.set`):**
  * High Contrast Toggle (`.tg`): Switches CSS variables to high contrast theme (`body.hc`).
  * Sound / Haptics Toggles.

---

## 4. UI/UX Specifications
* **Theme:** Dark Cyber-Tactical (Deep Dark Blue `#0E121A`, Electric Blue `#5B8CFF`, Amber Gold `#F5B342`).
* **Design Pattern:** Mobile App Simulation (Optimized for iOS Safe Area and Android navigation bars using `env(safe-area-inset-top)` and `env(safe-area-inset-bottom)`).
* **Micro-Interactions:** Subtle hover states, glow borders (`box-shadow`), custom pill indicators, and custom radio options.

---

## 5. Non-Functional Requirements
* **Performance:** Single static file (`.html`), zero external heavy JavaScript framework dependencies, lightweight DOM rendering.
* **Accessibility:** Native focus outlines (`:focus-visible`), readable contrast ratios, explicit ARIA labels on button controls.
* **Responsiveness:** Fluid grid layout for screen widths ranging from `320px` up to desktop monitors.