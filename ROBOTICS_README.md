# 🤖 ROBOTIX // Advanced Robotics & Cybernetics Engineering Platform

> A futuristic, 3D animated single-page web platform dedicated to teaching autonomous robotics, kinematics, sensor fusion, actuators, and digital electronics to engineering students.

---

## 🚀 Live Demo & Quickstart

The entire platform runs purely on the client side using CDN-hosted libraries (**Three.js**, **GSAP**, **ScrollTrigger**, **Lenis**, and **Canvas Confetti**). **Zero build steps, package installations, or backend servers are required.**

### Method 1: VS Code Live Server (Recommended)
1. Open this repository folder in **VS Code**:
   ```powershell
   code .
   ```
2. In the VS Code File Explorer, right-click [`index.html`](./index.html).
3. Select **"Open with Live Server"** (or press `Alt + L, Alt + O` / click **"Go Live"** in the bottom status bar).
4. The site will launch automatically at `http://127.0.0.1:5500/index.html`.

### Method 2: Instant Python HTTP Server
Run from your terminal:
```powershell
python -m http.server 3000
```
Open **[http://localhost:3000](http://localhost:3000)** in any modern browser (Chrome, Edge, Firefox, Safari).

### Method 3: Direct File Opening
Double-click [`index.html`](./index.html) to open directly in your web browser.

---

## 🌐 Deploying to GitHub Pages in 2 Minutes

Deploying this site globally for free on **GitHub Pages** takes less than two minutes:

1. **Create a GitHub Repository**:
   - Go to [github.com/new](https://github.com/new).
   - Name your repository (e.g. `robotix-learning-platform`).
   - Leave it public and click **Create repository**.

2. **Push Code to GitHub**:
   ```bash
   git init
   git add index.html style.css script.js ROBOTICS_README.md
   git commit -m "feat: initial commit of ROBOTIX 3D educational platform"
   git branch -M main
   git remote add origin https://github.com/<YOUR-USERNAME>/<YOUR-REPO-NAME>.git
   git push -u origin main
   ```

3. **Enable GitHub Pages**:
   - Go to your repository on GitHub &rarr; **Settings** tab.
   - On the left sidebar, click **Pages** (under *Code and automation*).
   - Under **Build and deployment**:
     - **Source**: Select `Deploy from a branch`.
     - **Branch**: Select `main` and folder `/ (root)`.
     - Click **Save**.
   - Your site will be live within ~60 seconds at:
     ```
     https://<YOUR-USERNAME>.github.io/<YOUR-REPO-NAME>/
     ```

---

## 🛠 Tech Stack & Architecture

- **Core**: Vanilla HTML5, Modern CSS3 (Custom Properties & Glassmorphism), Vanilla ES6+ JavaScript.
- **3D Graphics & WebGL**: [Three.js r128](https://threejs.org/) for the procedural 6-DOF robotic arm, metallic lighting shaders, and orbital dust particle field.
- **Scroll & Kinetic Motion**: [GSAP 3](https://greensock.com/gsap/) + [ScrollTrigger](https://greensock.com/scrolltrigger/) for smooth micro-animations.
- **Smooth Physics Scrolling**: [Lenis](https://github.com/darkroomengineering/lenis).
- **Procedural Audio**: Web Audio API oscillator synthesis generating futuristic sci-fi clicks, beeps, and servo hums without external MP3 audio assets.
- **Confetti Engine**: [Canvas Confetti](https://www.npmjs.com/package/canvas-confetti) for celebratory quiz scoring.

---

## 🏛 The 9 Curriculum Modules

1. **Foundations of Robotics**:
   - The three core pillars: Mechanical Embodiment, Electrical Subsystems, and Computational Intelligence.
   - The **Sense-Plan-Act** cybernetic feedback paradigm.
   - Historical chronology from Karel Čapek's 1920 *R.U.R.* to modern embodied AI humanoids.

2. **Robot Anatomy & Subsystem CAD**:
   - Interactive 3D visualizer inspecting: Sensors (The Senses), Actuators (The Muscles), Controller (The Brain), Power Supply (The Energy), and End Effectors (The Hands).

3. **Robot Taxonomies (3D Tilt & Flip Cards)**:
   - Industrial Articulated Arms, Mobile AMRs & AGVs, Humanoid Robotics, Surgical Tele-Robots, Drones & UAVs, and Swarm Robotics.
   - Interactive 3D mouse tilt and flip functionality revealing technical control parameters.

4. **Hardware Simulator Lab**:
   - **HC-SR04 Ultrasonic Echo Simulator**: Real-time acoustic wave propagation, obstacle distance slider, and time-of-flight ($\Delta t$) computation.
   - **DC Motor & Optical Encoder**: Real-time RPM adjustment, bidirectional rotation (CW/CCW), and slotted disc pulse tick counting.
   - **Servo Horn & PWM Pulse-Width**: 0°–180° rotation linked to 1.00 ms – 2.00 ms pulse width modulation.

5. **Kinematics & Linkage Lab**:
   - Real-time 2-link planar manipulator rendering on canvas.
   - **Forward Kinematics**: $x = L_1 \cos(\theta_1) + L_2 \cos(\theta_1 + \theta_2)$, $y = L_1 \sin(\theta_1) + L_2 \sin(\theta_1 + \theta_2)$.
   - **Interactive Inverse Kinematics (IK)**: Drag the end-effector anywhere in the workspace to automatically calculate joint angles via the Law of Cosines.
   - Trajectory trace recording and preset positions.

6. **Digital Electronics & PWM**:
   - **Interactive Logic Gate Tester**: AND, OR, NOT, NAND, NOR, XOR with live voltage switches (0V/5V), output LED indicator, and dynamic truth table.
   - **Oscilloscope PWM Simulator**: Square-wave oscilloscope canvas, duty cycle slider, average voltage computation ($V_{\text{avg}} = V_{\text{bus}} \cdot D$), and connected virtual LED load.

7. **Transformative Applications**:
   - Horizontal scroll gallery of Gigafactory automation, micro-surgical teleoperation, Mars rovers, autonomous agriculture, and general-purpose humanoids.

8. **Engineering Assessment Quiz**:
   - 5 rigorous multiple-choice questions testing kinematics, sensors, PWM, and CAN bus protocols with animated instant feedback, scorecard, and confetti reward.

9. **Curriculum Resources & Cheatsheet**:
   - Recommended academic textbooks (*Modern Robotics* by Lynch & Park, *Probabilistic Robotics* by Thrun).
   - One-click copyable formula cheatsheet.

---

## ⚡ Performance & Accessibility

- **60 FPS Performance**: Optimized WebGL vertex count, particle budgets, dynamic pixel ratio clamping (`Math.min(window.devicePixelRatio, 2)`), and `requestAnimationFrame`.
- **Responsive**: Adapts gracefully across 4K displays, laptops, tablets, and smartphones.
- **Accessibility**: Semantic HTML5 headings, ARIA labels, keyboard focus indicators, and `prefers-reduced-motion` compliance.

---

**ROBOTIX LAB** &copy; 2026. An Open Educational Resource for Robotics Engineers.
