/**
 * ROBOTIX ACADEMY // COMPLETE INTERACTIVE & 3D CYBERNETICS SCRIPT
 * Features:
 * - 3D Articulated Arm with IntersectionObserver (Sleep on off-screen)
 * - PID Control Simulator with Live Response Scope & Transient Metrics
 * - 3-Joint Planar Kinematics with D-H Parameters & Workspace Envelope
 * - Grid Path Planning (A* & Dijkstra) with Interactive Obstacles
 * - 16-Question Randomized Certification Exam with Domain Breakdown & Review
 * - Command Palette (Ctrl+K) Instant Search
 * - Dark Mode / Light Mode with localStorage Persistence
 * - User Learning Pathway Progress Tracker
 * - Hover Glossary Tooltips & Code Copying
 * - PWA Service Worker Registration
 */

document.addEventListener('DOMContentLoaded', () => {
  'use strict';

  /* ==========================================================================
     01. THEME SWITCHER (DARK / LIGHT CREAM)
     ========================================================================== */
  const themeToggleBtn = document.getElementById('theme-toggle-btn');
  const savedTheme = localStorage.getItem('robotix_theme') || 'light';

  function applyTheme(theme) {
    if (theme === 'dark') {
      document.body.classList.add('theme-dark');
      document.querySelector('.theme-icon-light')?.classList.add('hidden');
      document.querySelector('.theme-icon-dark')?.classList.remove('hidden');
    } else {
      document.body.classList.remove('theme-dark');
      document.querySelector('.theme-icon-light')?.classList.remove('hidden');
      document.querySelector('.theme-icon-dark')?.classList.add('hidden');
    }
    localStorage.setItem('robotix_theme', theme);
  }

  applyTheme(savedTheme);

  themeToggleBtn?.addEventListener('click', () => {
    const isDark = document.body.classList.contains('theme-dark');
    applyTheme(isDark ? 'light' : 'dark');
  });

  /* ==========================================================================
     02. USER LEARNING PROGRESS TRACKER (LOCALSTORAGE)
     ========================================================================== */
  const currentPath = window.location.pathname.split('/').pop() || 'index.html';
  const chapterKeys = {
    'index.html': 'home',
    'components.html': 'components',
    'types.html': 'types',
    'electronics.html': 'electronics',
    'simulators.html': 'simulators',
    'programming.html': 'programming',
    'applications.html': 'applications',
    'quiz.html': 'quiz'
  };

  let progress = JSON.parse(localStorage.getItem('robotix_progress') || '{}');
  if (chapterKeys[currentPath]) {
    progress[chapterKeys[currentPath]] = true;
    localStorage.setItem('robotix_progress', JSON.stringify(progress));
  }

  function updateProgressUI() {
    const totalChapters = 8;
    const completedCount = Object.keys(progress).length;
    const pct = Math.round((completedCount / totalChapters) * 100);

    const fill = document.getElementById('progress-bar-fill');
    const text = document.getElementById('progress-text-val');
    if (fill) fill.style.width = `${pct}%`;
    if (text) text.textContent = `${pct}%`;

    // Highlight completed pathway cards on index.html
    document.querySelectorAll('.pathway-step-card').forEach((card) => {
      const ch = card.getAttribute('data-chapter');
      if (ch && progress[ch]) {
        card.classList.add('completed');
      }
    });
  }

  updateProgressUI();

  /* ==========================================================================
     03. SHARED NAVIGATION & MOBILE DRAWER
     ========================================================================== */
  const mobileToggle = document.getElementById('mobile-menu-toggle');
  const mobileDrawer = document.getElementById('mobile-drawer');

  mobileToggle?.addEventListener('click', () => {
    mobileDrawer?.classList.toggle('open');
  });

  window.addEventListener('scroll', () => {
    const navbar = document.querySelector('.navbar-fixed');
    if (navbar) {
      if (window.scrollY > 20) {
        navbar.classList.add('scrolled');
      } else {
        navbar.classList.remove('scrolled');
      }
    }
  }, { passive: true });

  /* ==========================================================================
     04. THREE.JS 3D ROBOTIC HERO (SLEEPS WHEN OFF-SCREEN VIA INTERSECTIONOBSERVER)
     ========================================================================== */
  const heroCanvas = document.getElementById('hero-3d-canvas');
  if (heroCanvas && typeof THREE !== 'undefined') {
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(45, heroCanvas.clientWidth / heroCanvas.clientHeight, 0.1, 100);
    camera.position.set(2.4, 2.2, 3.8);
    camera.lookAt(0, 1.0, 0);

    const renderer = new THREE.WebGLRenderer({
      canvas: heroCanvas,
      alpha: true,
      antialias: true
    });
    renderer.setSize(heroCanvas.clientWidth, heroCanvas.clientHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.8));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;

    const hemiLight = new THREE.HemisphereLight(0xffffff, 0xf4efe6, 1.1);
    scene.add(hemiLight);

    const dirLight = new THREE.DirectionalLight(0xfff8ed, 1.4);
    dirLight.position.set(4, 7, 5);
    dirLight.castShadow = true;
    scene.add(dirLight);

    const amberFillLight = new THREE.PointLight(0xd97706, 1.5, 8);
    amberFillLight.position.set(-3, 2, 2);
    scene.add(amberFillLight);

    // Robot Arm Group
    const armRoot = new THREE.Group();
    armRoot.position.set(0.2, 0.1, 0);
    scene.add(armRoot);

    const ceramicWhiteMat = new THREE.MeshStandardMaterial({ color: 0xfdfdfd, roughness: 0.25, metalness: 0.1 });
    const brushedTitaniumMat = new THREE.MeshStandardMaterial({ color: 0x475569, roughness: 0.35, metalness: 0.8 });
    const champagneGoldMat = new THREE.MeshStandardMaterial({ color: 0xc27803, roughness: 0.2, metalness: 0.85 });

    // Base
    const baseCyl = new THREE.Mesh(new THREE.CylinderGeometry(0.75, 0.85, 0.2, 32), ceramicWhiteMat);
    baseCyl.receiveShadow = true;
    armRoot.add(baseCyl);

    const baseRing = new THREE.Mesh(new THREE.TorusGeometry(0.76, 0.02, 16, 48), champagneGoldMat);
    baseRing.rotation.x = Math.PI / 2;
    baseRing.position.y = 0.08;
    armRoot.add(baseRing);

    // Turret
    const turret = new THREE.Mesh(new THREE.CylinderGeometry(0.5, 0.55, 0.3, 32), brushedTitaniumMat);
    turret.position.y = 0.24;
    armRoot.add(turret);

    // Shoulder
    const shoulderGroup = new THREE.Group();
    shoulderGroup.position.set(0, 0.42, 0);
    armRoot.add(shoulderGroup);

    const shoulderJoint = new THREE.Mesh(new THREE.CylinderGeometry(0.22, 0.22, 0.6, 24), ceramicWhiteMat);
    shoulderJoint.rotation.z = Math.PI / 2;
    shoulderGroup.add(shoulderJoint);

    // Lower Arm (L1)
    const lowerArmGroup = new THREE.Group();
    shoulderGroup.add(lowerArmGroup);

    const lowerArmMesh = new THREE.Mesh(new THREE.BoxGeometry(0.2, 1.25, 0.25), ceramicWhiteMat);
    lowerArmMesh.position.y = 0.62;
    lowerArmMesh.castShadow = true;
    lowerArmGroup.add(lowerArmMesh);

    // Elbow
    const elbowGroup = new THREE.Group();
    elbowGroup.position.set(0, 1.25, 0);
    lowerArmGroup.add(elbowGroup);

    const elbowJoint = new THREE.Mesh(new THREE.CylinderGeometry(0.18, 0.18, 0.45, 24), brushedTitaniumMat);
    elbowJoint.rotation.z = Math.PI / 2;
    elbowGroup.add(elbowJoint);

    // Forearm (L2)
    const foreArmGroup = new THREE.Group();
    elbowGroup.add(foreArmGroup);

    const foreArmMesh = new THREE.Mesh(new THREE.BoxGeometry(0.16, 0.95, 0.18), ceramicWhiteMat);
    foreArmMesh.position.y = 0.48;
    foreArmMesh.castShadow = true;
    foreArmGroup.add(foreArmMesh);

    // Wrist & Claw
    const wristGroup = new THREE.Group();
    wristGroup.position.set(0, 0.95, 0);
    foreArmGroup.add(wristGroup);

    const clawBase = new THREE.Mesh(new THREE.CylinderGeometry(0.1, 0.12, 0.1, 24), champagneGoldMat);
    clawBase.position.y = 0.1;
    wristGroup.add(clawBase);

    const fingerGeo = new THREE.BoxGeometry(0.04, 0.22, 0.05);
    const fingerL = new THREE.Mesh(fingerGeo, ceramicWhiteMat);
    fingerL.position.set(-0.07, 0.22, 0);
    wristGroup.add(fingerL);

    const fingerR = new THREE.Mesh(fingerGeo, ceramicWhiteMat);
    fingerR.position.set(0.07, 0.22, 0);
    wristGroup.add(fingerR);

    // Interactive Toolbar state
    let isWireframe = false;
    let animSpeed = 1.0;
    let isClawGripped = true;
    let colorPaletteIdx = 0;
    const palettes = [
      { name: 'GOLD', color: 0xc27803 },
      { name: 'AZURE', color: 0x0284c7 },
      { name: 'EMERALD', color: 0x059669 }
    ];

    document.getElementById('hero-wireframe-btn')?.addEventListener('click', (e) => {
      isWireframe = !isWireframe;
      ceramicWhiteMat.wireframe = isWireframe;
      brushedTitaniumMat.wireframe = isWireframe;
      champagneGoldMat.wireframe = isWireframe;
      e.currentTarget.querySelector('span').textContent = isWireframe ? 'MESH: WIREFRAME' : 'MESH: SHADED';
    });

    document.getElementById('hero-speed-btn')?.addEventListener('click', (e) => {
      animSpeed = animSpeed === 1.0 ? 2.2 : 1.0;
      e.currentTarget.querySelector('span').textContent = `SPEED: ${animSpeed === 1.0 ? '1X' : '2.2X'}`;
    });

    document.getElementById('hero-claw-btn')?.addEventListener('click', (e) => {
      isClawGripped = !isClawGripped;
      fingerL.position.x = isClawGripped ? -0.07 : -0.13;
      fingerR.position.x = isClawGripped ? 0.07 : 0.13;
      e.currentTarget.querySelector('span').textContent = isClawGripped ? 'CLAW: GRIP' : 'CLAW: OPEN';
    });

    document.getElementById('hero-theme-btn')?.addEventListener('click', (e) => {
      colorPaletteIdx = (colorPaletteIdx + 1) % palettes.length;
      champagneGoldMat.color.setHex(palettes[colorPaletteIdx].color);
      e.currentTarget.querySelector('span').textContent = `COLOR: ${palettes[colorPaletteIdx].name}`;
    });

    // Mouse drag interaction
    let isDraggingHero = false;
    let prevMouseX = 0;
    let prevMouseY = 0;

    heroCanvas.addEventListener('mousedown', (e) => {
      isDraggingHero = true;
      prevMouseX = e.clientX;
      prevMouseY = e.clientY;
    });

    window.addEventListener('mouseup', () => { isDraggingHero = false; });
    window.addEventListener('mousemove', (e) => {
      if (!isDraggingHero) return;
      const dx = e.clientX - prevMouseX;
      const dy = e.clientY - prevMouseY;
      armRoot.rotation.y += dx * 0.008;
      turret.rotation.y += dx * 0.005;
      prevMouseX = e.clientX;
      prevMouseY = e.clientY;
    });

    // Three.js IntersectionObserver Sleeping
    let isRenderingHero = true;
    const heroObserver = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        isRenderingHero = entry.isIntersecting;
      });
    }, { threshold: 0.05 });
    heroObserver.observe(heroCanvas);

    document.addEventListener('visibilitychange', () => {
      isRenderingHero = !document.hidden;
    });

    let clock = 0;
    function animateHero() {
      requestAnimationFrame(animateHero);
      if (!isRenderingHero) return;

      clock += 0.02 * animSpeed;
      if (!isDraggingHero) {
        armRoot.rotation.y = Math.sin(clock * 0.5) * 0.3;
        turret.rotation.y = Math.cos(clock * 0.4) * 0.4;
      }
      shoulderGroup.rotation.z = Math.sin(clock * 0.7) * 0.28 - 0.2;
      elbowGroup.rotation.z = Math.cos(clock * 0.9) * 0.45 + 0.4;
      wristGroup.rotation.x = Math.sin(clock * 1.2) * 0.35;

      renderer.render(scene, camera);
    }
    animateHero();
  }

  /* ==========================================================================
     05. PID CLOSED-LOOP CONTROLLER SIMULATOR (simulators.html)
     ========================================================================== */
  const pidCanvas = document.getElementById('pid-scope-canvas');
  if (pidCanvas) {
    const ctx = pidCanvas.getContext('2d');
    function resizePID() {
      pidCanvas.width = pidCanvas.clientWidth || 450;
      pidCanvas.height = pidCanvas.clientHeight || 320;
    }
    resizePID();
    window.addEventListener('resize', resizePID);

    // PID Parameters
    let kp = 3.2;
    let ki = 1.1;
    let kd = 0.65;
    let setpoint = 75.0;
    let currentY = 0.0;
    let velocity = 0.0;
    let integral = 0.0;
    let prevError = 0.0;
    let disturbance = 0.0;

    // History buffer for graphing
    const history = [];
    const maxHistory = 180;
    for (let i = 0; i < maxHistory; i++) {
      history.push({ sp: setpoint, pv: 0.0 });
    }

    // Sliders
    const kpSlider = document.getElementById('pid-kp-slider');
    const kiSlider = document.getElementById('pid-ki-slider');
    const kdSlider = document.getElementById('pid-kd-slider');
    const spSlider = document.getElementById('pid-sp-slider');
    const kpVal = document.getElementById('pid-kp-val');
    const kiVal = document.getElementById('pid-ki-val');
    const kdVal = document.getElementById('pid-kd-val');
    const spVal = document.getElementById('pid-sp-val');

    function updatePIDSliderDisplays() {
      if (kpVal) kpVal.textContent = kp.toFixed(2);
      if (kiVal) kiVal.textContent = ki.toFixed(2);
      if (kdVal) kdVal.textContent = kd.toFixed(2);
      if (spVal) spVal.textContent = setpoint.toFixed(1);
    }

    kpSlider?.addEventListener('input', (e) => { kp = parseFloat(e.target.value) / 10.0; updatePIDSliderDisplays(); });
    kiSlider?.addEventListener('input', (e) => { ki = parseFloat(e.target.value) / 10.0; updatePIDSliderDisplays(); });
    kdSlider?.addEventListener('input', (e) => { kd = parseFloat(e.target.value) / 20.0; updatePIDSliderDisplays(); });
    spSlider?.addEventListener('input', (e) => { setpoint = parseFloat(e.target.value); updatePIDSliderDisplays(); });

    // Presets
    document.querySelectorAll('.pid-preset-btn').forEach((btn) => {
      btn.addEventListener('click', () => {
        document.querySelectorAll('.pid-preset-btn').forEach((b) => b.classList.remove('active'));
        btn.classList.add('active');
        const mode = btn.getAttribute('data-pid');
        if (mode === 'under') {
          kp = 7.5; ki = 0.4; kd = 0.08;
          if (kpSlider) kpSlider.value = 75;
          if (kiSlider) kiSlider.value = 4;
          if (kdSlider) kdSlider.value = 2;
        } else if (mode === 'ideal') {
          kp = 3.2; ki = 1.1; kd = 0.65;
          if (kpSlider) kpSlider.value = 32;
          if (kiSlider) kiSlider.value = 11;
          if (kdSlider) kdSlider.value = 13;
        } else if (mode === 'over') {
          kp = 1.5; ki = 0.2; kd = 1.4;
          if (kpSlider) kpSlider.value = 15;
          if (kiSlider) kiSlider.value = 2;
          if (kdSlider) kdSlider.value = 28;
        } else if (mode === 'windup') {
          kp = 2.0; ki = 4.5; kd = 0.05;
          if (kpSlider) kpSlider.value = 20;
          if (kiSlider) kiSlider.value = 45;
          if (kdSlider) kdSlider.value = 1;
        }
        updatePIDSliderDisplays();
      });
    });

    // Disturbance & Reset
    document.getElementById('pid-disturbance-btn')?.addEventListener('click', () => {
      disturbance = 35.0; // Injects an impulse step
    });

    document.getElementById('pid-reset-btn')?.addEventListener('click', () => {
      currentY = 0.0;
      velocity = 0.0;
      integral = 0.0;
      prevError = 0.0;
      disturbance = 0.0;
      history.forEach((h) => { h.pv = 0.0; });
    });

    // Simulation Loop
    const dt = 0.035;
    let stepCount = 0;
    let peakPv = 0;

    function stepPID() {
      const error = setpoint - currentY;
      integral += error * dt;
      // Clamping
      integral = Math.max(-50, Math.min(50, integral));
      const derivative = (error - prevError) / dt;
      prevError = error;

      // PID Output force
      const u = kp * error + ki * integral + kd * derivative + disturbance;
      disturbance *= 0.85; // Decay impulse disturbance

      // Physics model: mass-damper-spring system (m=1.0, b=0.8)
      const acceleration = (u - 1.2 * velocity) / 1.0;
      velocity += acceleration * dt;
      currentY += velocity * dt;

      history.shift();
      history.push({ sp: setpoint, pv: currentY });

      // Calculate Transient Metrics
      stepCount++;
      if (currentY > peakPv) peakPv = currentY;
      const overshootPct = Math.max(0, ((peakPv - setpoint) / (setpoint || 1)) * 100);
      const ess = Math.abs(error);

      if (stepCount % 12 === 0) {
        const ovEl = document.getElementById('pid-metric-overshoot');
        const essEl = document.getElementById('pid-metric-ess');
        if (ovEl) ovEl.textContent = `${overshootPct.toFixed(1)} %`;
        if (essEl) essEl.textContent = `${(ess / setpoint * 100).toFixed(2)} %`;
      }
    }

    function drawPID() {
      ctx.clearRect(0, 0, pidCanvas.width, pidCanvas.height);
      const w = pidCanvas.width;
      const h = pidCanvas.height;
      const pad = 36;

      // Draw Grid Lines
      ctx.strokeStyle = '#ede5da';
      ctx.lineWidth = 1;
      for (let y = pad; y < h - pad; y += 40) {
        ctx.beginPath();
        ctx.moveTo(pad, y);
        ctx.lineTo(w - pad, y);
        ctx.stroke();
      }

      // Draw Setpoint Target (Amber Dashed)
      const spY = (h - pad) - (setpoint / 120.0) * (h - 2 * pad);
      ctx.strokeStyle = '#c27803';
      ctx.lineWidth = 2;
      ctx.setLineDash([6, 6]);
      ctx.beginPath();
      ctx.moveTo(pad, spY);
      ctx.lineTo(w - pad, spY);
      ctx.stroke();
      ctx.setLineDash([]);

      // Draw PV Trajectory (Cyan Solid Line)
      ctx.strokeStyle = '#0284c7';
      ctx.lineWidth = 2.5;
      ctx.beginPath();
      for (let i = 0; i < history.length; i++) {
        const x = pad + (i / (history.length - 1)) * (w - 2 * pad);
        const y = (h - pad) - (history[i].pv / 120.0) * (h - 2 * pad);
        if (i === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      ctx.stroke();

      // Legend
      ctx.fillStyle = '#c27803';
      ctx.font = '10px monospace';
      ctx.fillText(`SETPOINT: ${setpoint.toFixed(1)}`, pad + 6, spY - 6);
      ctx.fillStyle = '#0284c7';
      ctx.fillText(`ACTUAL PV: ${currentY.toFixed(1)}`, w - pad - 110, pad + 15);

      stepPID();
      requestAnimationFrame(drawPID);
    }
    drawPID();
  }

  /* ==========================================================================
     06. 3-JOINT PLANAR KINEMATICS, D-H TABLE & WORKSPACE (simulators.html)
     ========================================================================== */
  const kinCanvas = document.getElementById('kinematics-interactive-canvas');
  if (kinCanvas) {
    const ctx = kinCanvas.getContext('2d');
    function resizeKin() {
      kinCanvas.width = kinCanvas.clientWidth || 450;
      kinCanvas.height = kinCanvas.clientHeight || 340;
    }
    resizeKin();
    window.addEventListener('resize', resizeKin);

    // 3 Link lengths
    const L1 = 110;
    const L2 = 90;
    const L3 = 60;
    const Rmax = L1 + L2 + L3; // 260 mm

    let t1 = 40;  // degrees
    let t2 = 50;  // degrees
    let t3 = -30; // degrees
    let showWorkspace = true;
    let isDraggingArm = false;

    const t1Slider = document.getElementById('kin-t1-slider');
    const t2Slider = document.getElementById('kin-t2-slider');
    const t3Slider = document.getElementById('kin-t3-slider');
    const t1Val = document.getElementById('kin-t1-val');
    const t2Val = document.getElementById('kin-t2-val');
    const t3Val = document.getElementById('kin-t3-val');
    const coordsVal = document.getElementById('kin-coords-val');
    const dhT1 = document.getElementById('dh-t1-cell');
    const dhT2 = document.getElementById('dh-t2-cell');
    const dhT3 = document.getElementById('dh-t3-cell');

    function updateKinUI() {
      if (t1Val) t1Val.textContent = `${Math.round(t1)}°`;
      if (t2Val) t2Val.textContent = `${Math.round(t2)}°`;
      if (t3Val) t3Val.textContent = `${Math.round(t3)}°`;
      if (t1Slider) t1Slider.value = t1;
      if (t2Slider) t2Slider.value = t2;
      if (t3Slider) t3Slider.value = t3;
      if (dhT1) dhT1.textContent = `${Math.round(t1)}°`;
      if (dhT2) dhT2.textContent = `${Math.round(t2)}°`;
      if (dhT3) dhT3.textContent = `${Math.round(t3)}°`;

      const r1 = (t1 * Math.PI) / 180;
      const r2 = ((t1 + t2) * Math.PI) / 180;
      const r3 = ((t1 + t2 + t3) * Math.PI) / 180;
      const x = L1 * Math.cos(r1) + L2 * Math.cos(r2) + L3 * Math.cos(r3);
      const y = L1 * Math.sin(r1) + L2 * Math.sin(r2) + L3 * Math.sin(r3);
      if (coordsVal) coordsVal.textContent = `(X: ${x.toFixed(1)}, Y: ${y.toFixed(1)} mm)`;
    }

    t1Slider?.addEventListener('input', (e) => { t1 = parseFloat(e.target.value); updateKinUI(); });
    t2Slider?.addEventListener('input', (e) => { t2 = parseFloat(e.target.value); updateKinUI(); });
    t3Slider?.addEventListener('input', (e) => { t3 = parseFloat(e.target.value); updateKinUI(); });

    // Workspace Envelope toggle
    const wsBtn = document.getElementById('kin-toggle-workspace');
    wsBtn?.addEventListener('click', () => {
      showWorkspace = !showWorkspace;
      wsBtn.textContent = showWorkspace ? 'Workspace Envelope: ON' : 'Workspace Envelope: OFF';
    });

    document.getElementById('kin-reset-arm')?.addEventListener('click', () => {
      t1 = 40; t2 = 50; t3 = -30;
      updateKinUI();
    });

    // Cyclic Coordinate Descent (CCD) Numerical Inverse Kinematics
    function solve3LinkIK(tx, ty) {
      const targetDist = Math.hypot(tx, ty);
      let cx = tx;
      let cy = ty;
      if (targetDist > Rmax) {
        cx = (tx / targetDist) * (Rmax - 1);
        cy = (ty / targetDist) * (Rmax - 1);
      }

      let rad1 = (t1 * Math.PI) / 180;
      let rad2 = (t2 * Math.PI) / 180;
      let rad3 = (t3 * Math.PI) / 180;

      // Iterative CCD passes
      for (let iter = 0; iter < 12; iter++) {
        // Joint 3 adjustment
        let j1x = L1 * Math.cos(rad1);
        let j1y = L1 * Math.sin(rad1);
        let j2x = j1x + L2 * Math.cos(rad1 + rad2);
        let j2y = j1y + L2 * Math.sin(rad1 + rad2);
        let eex = j2x + L3 * Math.cos(rad1 + rad2 + rad3);
        let eey = j2y + L3 * Math.sin(rad1 + rad2 + rad3);

        let vEE = Math.atan2(eey - j2y, eex - j2x);
        let vT = Math.atan2(cy - j2y, cx - j2x);
        rad3 += (vT - vEE) * 0.45;

        // Joint 2 adjustment
        eex = j2x + L3 * Math.cos(rad1 + rad2 + rad3);
        eey = j2y + L3 * Math.sin(rad1 + rad2 + rad3);
        vEE = Math.atan2(eey - j1y, eex - j1x);
        vT = Math.atan2(cy - j1y, cx - j1x);
        rad2 += (vT - vEE) * 0.45;

        // Joint 1 adjustment
        j2x = j1x + L2 * Math.cos(rad1 + rad2);
        j2y = j1y + L2 * Math.sin(rad1 + rad2);
        eex = j2x + L3 * Math.cos(rad1 + rad2 + rad3);
        eey = j2y + L3 * Math.sin(rad1 + rad2 + rad3);
        vEE = Math.atan2(eey, eex);
        vT = Math.atan2(cy, cx);
        rad1 += (vT - vEE) * 0.45;
      }

      t1 = (rad1 * 180) / Math.PI;
      t2 = (rad2 * 180) / Math.PI;
      t3 = (rad3 * 180) / Math.PI;
      // Normalize
      t1 = ((t1 + 180) % 360) - 180;
      t2 = Math.max(-150, Math.min(150, t2));
      t3 = Math.max(-150, Math.min(150, t3));
      updateKinUI();
    }

    kinCanvas.addEventListener('mousedown', (e) => {
      isDraggingArm = true;
      handleCanvasIK(e);
    });
    window.addEventListener('mouseup', () => { isDraggingArm = false; });
    kinCanvas.addEventListener('mousemove', (e) => {
      if (isDraggingArm) handleCanvasIK(e);
    });

    function handleCanvasIK(e) {
      const rect = kinCanvas.getBoundingClientRect();
      const originX = 55;
      const originY = kinCanvas.height - 50;
      const mouseX = e.clientX - rect.left;
      const mouseY = e.clientY - rect.top;
      const targetX = (mouseX - originX) * 0.9;
      const targetY = (originY - mouseY) * 0.9;
      solve3LinkIK(targetX, targetY);
    }

    function drawKinematics() {
      ctx.clearRect(0, 0, kinCanvas.width, kinCanvas.height);
      const originX = 55;
      const originY = kinCanvas.height - 50;

      // Draw Workspace Reach Cloud
      if (showWorkspace) {
        ctx.fillStyle = 'rgba(194, 120, 3, 0.08)';
        ctx.strokeStyle = 'rgba(194, 120, 3, 0.3)';
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.arc(originX, originY, Rmax * 0.9, -Math.PI / 2, Math.PI / 2);
        ctx.fill();
        ctx.stroke();

        ctx.fillStyle = '#c27803';
        ctx.font = '10px monospace';
        ctx.fillText(`REACHABLE ENVELOPE (Ω = ${Rmax} mm)`, originX + 15, originY - Rmax * 0.85);
      }

      // Base Pedestal
      ctx.fillStyle = '#475569';
      ctx.fillRect(originX - 25, originY, 50, 20);

      // Forward Kinematics Coordinates
      const r1 = (t1 * Math.PI) / 180;
      const r2 = ((t1 + t2) * Math.PI) / 180;
      const r3 = ((t1 + t2 + t3) * Math.PI) / 180;

      const scale = 0.9;
      const p1x = originX + L1 * Math.cos(r1) * scale;
      const p1y = originY - L1 * Math.sin(r1) * scale;

      const p2x = p1x + L2 * Math.cos(r2) * scale;
      const p2y = p1y - L2 * Math.sin(r2) * scale;

      const p3x = p2x + L3 * Math.cos(r3) * scale;
      const p3y = p2y - L3 * Math.sin(r3) * scale;

      // Link 1 (Base to Shoulder)
      ctx.strokeStyle = '#c27803';
      ctx.lineWidth = 9;
      ctx.lineCap = 'round';
      ctx.beginPath();
      ctx.moveTo(originX, originY);
      ctx.lineTo(p1x, p1y);
      ctx.stroke();

      // Link 2 (Shoulder to Elbow)
      ctx.strokeStyle = '#0284c7';
      ctx.lineWidth = 7;
      ctx.beginPath();
      ctx.moveTo(p1x, p1y);
      ctx.lineTo(p2x, p2y);
      ctx.stroke();

      // Link 3 (Forearm to Wrist)
      ctx.strokeStyle = '#059669';
      ctx.lineWidth = 5;
      ctx.beginPath();
      ctx.moveTo(p2x, p2y);
      ctx.lineTo(p3x, p3y);
      ctx.stroke();

      // Draw Joint Hubs
      [ [originX, originY], [p1x, p1y], [p2x, p2y] ].forEach(([jx, jy]) => {
        ctx.fillStyle = '#ffffff';
        ctx.strokeStyle = '#1e293b';
        ctx.lineWidth = 2.5;
        ctx.beginPath();
        ctx.arc(jx, jy, 6, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();
      });

      // End-Effector Gripper Pin
      ctx.fillStyle = '#ef4444';
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(p3x, p3y, 7, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();

      requestAnimationFrame(drawKinematics);
    }
    drawKinematics();
    updateKinUI();
  }

  /* ==========================================================================
     07. AUTONOMOUS PATH PLANNING (A* & DIJKSTRA) ON GRID (simulators.html)
     ========================================================================== */
  const plannerCanvas = document.getElementById('planner-grid-canvas');
  if (plannerCanvas) {
    const ctx = plannerCanvas.getContext('2d');
    const cols = 24;
    const rows = 14;
    let cellSize = 25;

    function resizePlanner() {
      plannerCanvas.width = plannerCanvas.clientWidth || 600;
      plannerCanvas.height = plannerCanvas.clientHeight || 360;
      cellSize = Math.floor(plannerCanvas.width / cols);
    }
    resizePlanner();
    window.addEventListener('resize', resizePlanner);

    // Grid states: 0: free, 1: wall
    let grid = Array.from({ length: cols }, () => Array(rows).fill(0));
    let startNode = { x: 2, y: 7 };
    let goalNode = { x: 21, y: 7 };
    let exploredNodes = [];
    let finalPath = [];

    // Maze Generator
    function generateMaze() {
      grid = Array.from({ length: cols }, () => Array(rows).fill(0));
      for (let x = 0; x < cols; x++) {
        for (let y = 0; y < rows; y++) {
          if (Math.random() < 0.28 && !(x === startNode.x && y === startNode.y) && !(x === goalNode.x && y === goalNode.y)) {
            grid[x][y] = 1;
          }
        }
      }
      exploredNodes = [];
      finalPath = [];
      drawGrid();
    }

    document.getElementById('planner-maze-btn')?.addEventListener('click', generateMaze);
    document.getElementById('planner-clear-btn')?.addEventListener('click', () => {
      grid = Array.from({ length: cols }, () => Array(rows).fill(0));
      exploredNodes = [];
      finalPath = [];
      drawGrid();
    });

    // Mouse Painting Walls
    let isDrawingWall = false;
    plannerCanvas.addEventListener('mousedown', (e) => {
      isDrawingWall = true;
      toggleWallAtEvent(e);
    });
    window.addEventListener('mouseup', () => { isDrawingWall = false; });
    plannerCanvas.addEventListener('mousemove', (e) => {
      if (isDrawingWall) toggleWallAtEvent(e);
    });

    function toggleWallAtEvent(e) {
      const rect = plannerCanvas.getBoundingClientRect();
      const x = Math.floor((e.clientX - rect.left) / cellSize);
      const y = Math.floor((e.clientY - rect.top) / cellSize);
      if (x >= 0 && x < cols && y >= 0 && y < rows) {
        if (!(x === startNode.x && y === startNode.y) && !(x === goalNode.x && y === goalNode.y)) {
          grid[x][y] = 1;
          drawGrid();
        }
      }
    }

    // A* / Dijkstra Search Engine
    function runPathSearch() {
      const isAStar = document.getElementById('planner-algo-select')?.value === 'astar';
      const openSet = [{ ...startNode, g: 0, f: isAStar ? Math.hypot(startNode.x - goalNode.x, startNode.y - goalNode.y) : 0 }];
      const cameFrom = new Map();
      const gScore = Array.from({ length: cols }, () => Array(rows).fill(Infinity));
      gScore[startNode.x][startNode.y] = 0;

      exploredNodes = [];
      finalPath = [];
      const startTime = performance.now();

      const timer = setInterval(() => {
        if (openSet.length === 0) {
          clearInterval(timer);
          alert('No traversable path found! Clear some walls.');
          return;
        }

        // Sort by f-score
        openSet.sort((a, b) => a.f - b.f);
        const current = openSet.shift();
        exploredNodes.push({ x: current.x, y: current.y });

        // Goal Check
        if (current.x === goalNode.x && current.y === goalNode.y) {
          clearInterval(timer);
          // Reconstruct path
          let currKey = `${goalNode.x},${goalNode.y}`;
          while (cameFrom.has(currKey)) {
            const node = cameFrom.get(currKey);
            finalPath.unshift(node);
            currKey = `${node.x},${node.y}`;
          }
          finalPath.push(goalNode);

          const duration = (performance.now() - startTime).toFixed(1);
          document.getElementById('planner-nodes-val').textContent = exploredNodes.length;
          document.getElementById('planner-length-val').textContent = `${finalPath.length} steps`;
          document.getElementById('planner-time-val').textContent = `${duration} ms`;
          drawGrid();
          return;
        }

        // Neighbors (4-connected orthogonal)
        const dirs = [ [0, 1], [0, -1], [1, 0], [-1, 0] ];
        dirs.forEach(([dx, dy]) => {
          const nx = current.x + dx;
          const ny = current.y + dy;
          if (nx >= 0 && nx < cols && ny >= 0 && ny < rows && grid[nx][ny] === 0) {
            const tentG = gScore[current.x][current.y] + 1;
            if (tentG < gScore[nx][ny]) {
              cameFrom.set(`${nx},${ny}`, current);
              gScore[nx][ny] = tentG;
              const h = isAStar ? Math.hypot(nx - goalNode.x, ny - goalNode.y) : 0;
              const f = tentG + h;
              if (!openSet.some(n => n.x === nx && n.y === ny)) {
                openSet.push({ x: nx, y: ny, g: tentG, f });
              }
            }
          }
        });

        drawGrid();
      }, 15);
    }

    document.getElementById('planner-run-btn')?.addEventListener('click', runPathSearch);

    function drawGrid() {
      ctx.clearRect(0, 0, plannerCanvas.width, plannerCanvas.height);

      for (let x = 0; x < cols; x++) {
        for (let y = 0; y < rows; y++) {
          const px = x * cellSize;
          const py = y * cellSize;

          // Background cell
          if (grid[x][y] === 1) {
            ctx.fillStyle = '#292524'; // Wall
          } else {
            ctx.fillStyle = '#ffffff';
          }
          ctx.fillRect(px, py, cellSize, cellSize);

          ctx.strokeStyle = '#ede5da';
          ctx.lineWidth = 0.5;
          ctx.strokeRect(px, py, cellSize, cellSize);
        }
      }

      // Draw Explored Wavefront
      ctx.fillStyle = 'rgba(2, 132, 199, 0.25)';
      exploredNodes.forEach((n) => {
        ctx.fillRect(n.x * cellSize, n.y * cellSize, cellSize, cellSize);
      });

      // Draw Final Shortest Path Line
      if (finalPath.length > 1) {
        ctx.strokeStyle = '#059669';
        ctx.lineWidth = 3.5;
        ctx.beginPath();
        finalPath.forEach((p, idx) => {
          const cx = p.x * cellSize + cellSize / 2;
          const cy = p.y * cellSize + cellSize / 2;
          if (idx === 0) ctx.moveTo(cx, cy);
          else ctx.lineTo(cx, cy);
        });
        ctx.stroke();
      }

      // Draw Start & Goal Icons
      ctx.fillStyle = '#059669';
      ctx.beginPath();
      ctx.arc(startNode.x * cellSize + cellSize / 2, startNode.y * cellSize + cellSize / 2, cellSize / 2.6, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = '#dc2626';
      ctx.beginPath();
      ctx.arc(goalNode.x * cellSize + cellSize / 2, goalNode.y * cellSize + cellSize / 2, cellSize / 2.6, 0, Math.PI * 2);
      ctx.fill();
    }

    generateMaze();
  }

  /* ==========================================================================
     08. 16-QUESTION COMPREHENSIVE CERTIFICATION EXAM (quiz.html)
     ========================================================================== */
  const fullExamPool = [
    // --- Topic 1: Kinematics & D-H Parameters ---
    {
      category: 'KINEMATICS',
      q: 'In Denavit-Hartenberg (D-H) kinematics convention, what does the parameter "ai" represent?',
      opts: [
        'The link offset distance along the Zi-1 axis.',
        'The link length distance along the Xi axis perpendicular to Zi and Zi-1.',
        'The twist angle between joint axes about the Xi-1 axis.',
        'The angular velocity of the end-effector frame.'
      ],
      ans: 1,
      expl: 'By D-H definition, link length ai is the perpendicular distance along the common normal Xi from joint axis Zi-1 to Zi.'
    },
    {
      category: 'KINEMATICS',
      q: 'What occurs mathematically at a robotic manipulator kinematic singularity?',
      opts: [
        'The motor driver MOSFETs experience a shoot-through condition.',
        'The Jacobian matrix det(J) = 0, causing loss of instantaneous DOF and infinite joint velocities.',
        'The PID controller integral windup saturates the power supply.',
        'The optical encoder switches from Gray code to binary code.'
      ],
      ans: 1,
      expl: 'At singularities, the manipulator Jacobian loses full rank, preventing motion in one or more Cartesian directions and demanding infinite joint speed to follow a path.'
    },
    {
      category: 'KINEMATICS',
      q: 'How many Degrees of Freedom (DOF) are required for an articulated robotic arm to achieve arbitrary 3D position and spatial orientation?',
      opts: [
        '3 DOF (3 Translations only)',
        '4 DOF (SCARA topology)',
        '6 DOF (3 Translations + 3 Rotations: Yaw, Pitch, Roll)',
        '8 DOF (Dual-arm minimum)'
      ],
      ans: 2,
      expl: 'A rigid body in 3D operational space possesses 6 independent DOFs: 3 translational (X, Y, Z) and 3 rotational (Yaw, Pitch, Roll).'
    },

    // --- Topic 2: Digital Electronics & Motor Drivers ---
    {
      category: 'ELECTRONICS',
      q: 'In an H-Bridge motor driver, what dangerous fault occurs if High-Side Q1 and Low-Side Q2 are switched ON simultaneously?',
      opts: [
        'Dynamic regenerative motor braking.',
        'Shoot-through short-circuit from VCC directly to GND, causing thermal destruction.',
        'Encoder pulse multiplication by 4X.',
        'ADC quantization noise.'
      ],
      ans: 1,
      expl: 'Simultaneously turning on both transistors in the same bridge leg connects VCC directly to GND with near-zero impedance, causing catastrophic current spikes.'
    },
    {
      category: 'ELECTRONICS',
      q: 'A 10-bit Successive Approximation Register (SAR) ADC with Vref = 3.30V measures an input voltage of 1.65V. What binary output register is generated?',
      opts: [
        '0b0100000000 (Decimal 256)',
        '0b1000000000 (Decimal 512)',
        '0b1111111111 (Decimal 1023)',
        '0b0000100000 (Decimal 32)'
      ],
      ans: 1,
      expl: '1.65V is exactly half of 3.30V. For 10-bit ADC (2^10 = 1024 levels), half-scale is 512, which in binary is 0b1000000000.'
    },
    {
      category: 'ELECTRONICS',
      q: 'Why do optical quadrature encoders output 2-bit Gray code signals rather than standard binary code?',
      opts: [
        'Gray code transitions exactly one bit per step, eliminating transition glitch race conditions.',
        'Gray code uses lower supply voltage than TTL binary logic.',
        'Gray code requires only a single phototransistor wire.',
        'Gray code doubles the physical disc diameter.'
      ],
      ans: 0,
      expl: 'In Gray code (00 -> 01 -> 11 -> 10), only a single bit changes between adjacent states, preventing intermediate false codes from asynchronous sensor timing.'
    },

    // --- Topic 3: Control Theory & PID ---
    {
      category: 'CONTROL',
      q: 'What is the physical function of the Derivative term (Kd) in a closed-loop joint position controller?',
      opts: [
        'Eliminates steady-state error caused by gravity droop.',
        'Anticipates future error trends and applies damping against resonant overshoot.',
        'Increases low-frequency loop gain to accelerate sluggish response.',
        'Inverts motor rotational polarity during emergency stops.'
      ],
      ans: 1,
      expl: 'The derivative term responds to the rate of error change (de/dt), providing dynamic damping that opposes rapid movement and suppresses overshoot.'
    },
    {
      category: 'CONTROL',
      q: 'What engineering issue arises when a robot joint encounters a physical obstacle while the PID Integral (Ki) term continues accumulating?',
      opts: [
        'Derivative kick causing immediate motor shutdown.',
        'Integrator windup, causing massive overshoot when the obstacle is eventually released.',
        'Quadrature phase inversion.',
        'UART frame parity collision.'
      ],
      ans: 1,
      expl: 'Integrator windup accumulates massive error sums during actuator saturation or stall. Once released, the huge stored integral causes severe violent overshoot.'
    },
    {
      category: 'CONTROL',
      q: 'In a second-order feedback actuator model, what damping ratio (ζ) produces critically damped motion without oscillatory overshoot?',
      opts: [
        'ζ = 0 (Undamped harmonic oscillator)',
        'ζ < 1.0 (Underdamped)',
        'ζ = 1.0 (Critically damped - fastest return to setpoint without overshoot)',
        'ζ = 5.0 (Heavily overdamped sluggish motion)'
      ],
      ans: 2,
      expl: 'At ζ = 1.0, the closed-loop system is critically damped, returning to the target setpoint in the minimum possible duration without crossing the line.'
    },

    // --- Topic 4: Sensors & Perception ---
    {
      category: 'SENSORS',
      q: 'An HC-SR04 ultrasonic sensor records a round-trip echo flight duration of 5830 µs. Assuming sound speed v = 343 m/s, what is the obstacle distance?',
      opts: [
        '50 cm',
        '100 cm (1.00 meter)',
        '200 cm',
        '20 cm'
      ],
      ans: 1,
      expl: 'd = (v * t) / 2 = (343 m/s * 0.00583 s) / 2 = 2.00 / 2 = 1.00 m (100 cm).'
    },
    {
      category: 'SENSORS',
      q: 'How does LiDAR differ from ultrasonic sonar in robotic spatial mapping?',
      opts: [
        'LiDAR uses electromagnetic light pulses (nanosecond ToF), achieving millimeter angular resolution over 100+ meters.',
        'LiDAR requires a physical acoustic diaphragm that vibrates at 40 kHz.',
        'LiDAR is affected by air temperature sound velocity variations.',
        'Sonar can measure distances at the speed of light.'
      ],
      ans: 0,
      expl: 'LiDAR uses focused laser beams travelling at c = 300,000 km/s, providing pinpoint 3D angular point clouds compared to divergent acoustic sonar cones.'
    },
    {
      category: 'SENSORS',
      q: 'What sensor fusion algorithm combines high-frequency IMU gyro rate integration with low-frequency magnetometer and accelerometer gravity references?',
      opts: [
        'Extended Kalman Filter (EKF) or Madgwick Filter',
        'A* Shortest Path Graph Algorithm',
        'Successive Approximation Register (SAR)',
        'Denavit-Hartenberg Homogeneous Transformation'
      ],
      ans: 0,
      expl: 'EKF and Madgwick orientation filters fuse fast gyro integrations with drift-free gravity and magnetic field vectors to eliminate cumulative heading drift.'
    },

    // --- Topic 5: Autonomous Software, Navigation & ROS 2 ---
    {
      category: 'SOFTWARE & ROS',
      q: 'In ROS 2 Humble, what message type and standard topic name are used to send linear and angular velocity commands to an autonomous mobile robot (AMR)?',
      opts: [
        'sensor_msgs/LaserScan on /scan',
        'geometry_msgs/Twist on /cmd_vel',
        'nav_msgs/Odometry on /odom',
        'std_msgs/Header on /tf'
      ],
      ans: 1,
      expl: 'geometry_msgs/Twist (containing linear.x, linear.y, angular.z velocities) published to the topic /cmd_vel is the universal ROS motor base interface.'
    },
    {
      category: 'SOFTWARE & ROS',
      q: 'What is the primary computational benefit of the A* algorithm over Dijkstra search in robotic grid path planning?',
      opts: [
        'A* eliminates the need for an environmental obstacle map.',
        'A* uses a goal-directed heuristic h(n) (e.g. Euclidean distance) to prune the search frontier toward the target.',
        'A* requires floating-point hardware interrupts on microcontrollers.',
        'Dijkstra only works on tree topologies.'
      ],
      ans: 1,
      expl: 'A* evaluates f(n) = g(n) + h(n), focusing node exploration directly toward the goal rather than expanding uniformly in all directions like Dijkstra.'
    },
    {
      category: 'SOFTWARE & ROS',
      q: 'In an XML Unified Robot Description Format (URDF) file, which tag specifies mechanical limits such as max rotation angle and maximum allowable actuator torque?',
      opts: [
        '<visual><geometry>',
        '<limit lower="..." upper="..." effort="..." velocity="..."/>',
        '<material name="cream"/>',
        '<parent link="base_link"/>'
      ],
      ans: 1,
      expl: 'The <limit> tag specifies physical joint constraints: lower/upper rotational boundaries (radians), peak effort (Nm torque), and max velocity (rad/s).'
    },
    {
      category: 'SOFTWARE & ROS',
      q: 'What is the Zero Moment Point (ZMP) criterion used in humanoid bipedal walking controllers?',
      opts: [
        'The joint position where torque motors draw zero electric current.',
        'The ground contact point where total horizontal inertial and gravitational moments cancel out to prevent tipping.',
        'The waypoint where an AMR switches from A* to Dijkstra navigation.',
        'The neutral angle of a PWM servo horn (1.50 ms pulse).'
      ],
      ans: 1,
      expl: 'For stable walking without tipping, the ZMP must strictly remain within the convex hull of the robot ground support polygon.'
    }
  ];

  const qText = document.getElementById('quiz-q-text');
  const qOpts = document.getElementById('quiz-options-list');
  const qProg = document.getElementById('quiz-progress-text');
  const qTopicBadge = document.getElementById('quiz-topic-badge');
  const qBar = document.getElementById('quiz-progress-bar');
  const qExpl = document.getElementById('quiz-expl-box');
  const qNext = document.getElementById('quiz-next-btn');
  const qCard = document.getElementById('quiz-card-wrap');
  const qResults = document.getElementById('quiz-results-wrap');
  const qFinalScore = document.getElementById('quiz-final-score-val');
  const qRetake = document.getElementById('quiz-retake-btn');
  const qReviewBtn = document.getElementById('quiz-review-btn');
  const qReviewSection = document.getElementById('quiz-review-section');
  const qReviewList = document.getElementById('quiz-review-list');
  const qTopicBreakdown = document.getElementById('quiz-topic-breakdown');

  // Shuffle questions each attempt
  let activeExamQuestions = [];
  let userAnswers = [];
  let examIdx = 0;
  let examScore = 0;

  function initQuiz() {
    activeExamQuestions = [...fullExamPool].sort(() => Math.random() - 0.5);
    userAnswers = [];
    examIdx = 0;
    examScore = 0;
    qResults?.classList.add('hidden');
    qReviewSection?.classList.add('hidden');
    qCard?.classList.remove('hidden');
    loadExamQuestion();
  }

  function loadExamQuestion() {
    if (examIdx >= activeExamQuestions.length) {
      // Show Final Results
      qCard?.classList.add('hidden');
      qResults?.classList.remove('hidden');

      const total = activeExamQuestions.length;
      const pct = Math.round((examScore / total) * 100);
      if (qFinalScore) qFinalScore.textContent = `${examScore} / ${total} (${pct}%)`;

      // Save Best Score
      const best = parseInt(localStorage.getItem('robotix_quiz_best') || '0', 10);
      if (examScore > best) {
        localStorage.setItem('robotix_quiz_best', examScore);
      }

      // Topic Breakdown
      const topics = {};
      activeExamQuestions.forEach((q, i) => {
        if (!topics[q.category]) topics[q.category] = { correct: 0, total: 0 };
        topics[q.category].total++;
        if (userAnswers[i] && userAnswers[i].isCorrect) {
          topics[q.category].correct++;
        }
      });

      if (qTopicBreakdown) {
        qTopicBreakdown.innerHTML = '';
        Object.keys(topics).forEach((cat) => {
          const t = topics[cat];
          const div = document.createElement('div');
          div.className = 'quiz-topic-item';
          div.innerHTML = `<span>${cat}</span><span class="font-bold text-amber">${t.correct} / ${t.total} (${Math.round(t.correct / t.total * 100)}%)</span>`;
          qTopicBreakdown.appendChild(div);
        });
      }

      // Confetti celebration if passed (>= 70%)
      if (typeof confetti === 'function' && pct >= 70) {
        confetti({
          particleCount: 120,
          spread: 80,
          origin: { y: 0.6 },
          colors: ['#c27803', '#0284c7', '#059669', '#f59e0b']
        });
      }
      return;
    }

    const cur = activeExamQuestions[examIdx];
    if (qText) qText.textContent = cur.q;
    if (qTopicBadge) qTopicBadge.textContent = cur.category;
    if (qProg) qProg.textContent = `QUESTION ${(examIdx + 1).toString().padStart(2, '0')} OF ${activeExamQuestions.length}`;
    if (qBar) qBar.style.width = `${((examIdx + 1) / activeExamQuestions.length) * 100}%`;

    qExpl?.classList.add('hidden');
    qNext?.classList.add('hidden');

    if (qOpts) {
      qOpts.innerHTML = '';
      const letters = ['A', 'B', 'C', 'D'];
      cur.opts.forEach((opt, idx) => {
        const btn = document.createElement('button');
        btn.className = 'quiz-option-cream';
        btn.innerHTML = `<strong>${letters[idx]}.</strong> <span>${opt}</span>`;
        btn.addEventListener('click', () => {
          const isCorrect = idx === cur.ans;
          userAnswers[examIdx] = {
            question: cur.q,
            category: cur.category,
            chosenIdx: idx,
            correctIdx: cur.ans,
            isCorrect: isCorrect,
            expl: cur.expl,
            options: cur.opts
          };

          const all = qOpts.querySelectorAll('.quiz-option-cream');
          all.forEach((b, i) => {
            b.disabled = true;
            if (i === cur.ans) b.classList.add('correct');
            else if (i === idx) b.classList.add('incorrect');
          });

          if (isCorrect) examScore++;

          if (qExpl) {
            qExpl.textContent = cur.expl;
            qExpl.classList.remove('hidden');
          }
          qNext?.classList.remove('hidden');
        });
        qOpts.appendChild(btn);
      });
    }
  }

  qNext?.addEventListener('click', () => {
    examIdx++;
    loadExamQuestion();
  });

  qRetake?.addEventListener('click', initQuiz);

  // Review Wrong Answers Screen
  qReviewBtn?.addEventListener('click', () => {
    if (!qReviewSection || !qReviewList) return;
    qReviewSection.classList.toggle('hidden');
    qReviewList.innerHTML = '';

    userAnswers.forEach((ans, idx) => {
      const card = document.createElement('div');
      card.className = `review-card ${ans.isCorrect ? 'correct' : 'incorrect'}`;
      card.innerHTML = `
        <div class="flex justify-between items-center text-xs font-mono mb-2">
          <span class="font-bold text-heading">Q${idx + 1} [${ans.category}]</span>
          <span class="font-bold ${ans.isCorrect ? 'text-green-700' : 'text-red-700'}">${ans.isCorrect ? 'CORRECT (1/1)' : 'INCORRECT (0/1)'}</span>
        </div>
        <p class="text-xs text-heading font-medium mb-3">${ans.question}</p>
        <div class="text-xs space-y-1 mb-2 font-mono">
          <div class="${ans.isCorrect ? 'text-green-800' : 'text-red-700'}"><strong>Your Answer:</strong> ${ans.options[ans.chosenIdx]}</div>
          ${!ans.isCorrect ? `<div class="text-green-800"><strong>Correct Answer:</strong> ${ans.options[ans.correctIdx]}</div>` : ''}
        </div>
        <p class="text-[11px] text-muted italic mt-2">${ans.expl}</p>
      `;
      qReviewList.appendChild(card);
    });
  });

  if (qText) {
    initQuiz();
  }

  /* ==========================================================================
     09. GLOBAL COMMAND PALETTE (CTRL+K) MODAL SEARCH
     ========================================================================== */
  const cmdBackdrop = document.getElementById('cmd-palette-modal');
  const cmdInput = document.getElementById('cmd-search-input');
  const cmdResults = document.getElementById('cmd-search-results');
  const cmdOpenBtns = document.querySelectorAll('.cmd-open-btn');

  const searchIndex = [
    { title: 'Robot Anatomy & CAD Explorer', cat: 'CHAPTER 01', url: 'components.html' },
    { title: 'Robot Classifications & Humanoids', cat: 'CHAPTER 02', url: 'types.html' },
    { title: 'Digital Electronics & MOSFET H-Bridge', cat: 'CHAPTER 03', url: 'electronics.html' },
    { title: 'ADC Quantization & Successive Approximation', cat: 'CHAPTER 03', url: 'electronics.html' },
    { title: 'Optical Quadrature Encoder 2-Bit Gray Code', cat: 'CHAPTER 03', url: 'electronics.html' },
    { title: 'CAN Bus & SPI Bus Waveform Analyzer', cat: 'CHAPTER 03', url: 'electronics.html' },
    { title: 'Category 4 E-Stop Safety Interlocks', cat: 'CHAPTER 03', url: 'electronics.html' },
    { title: 'PID Closed-Loop Controller Simulator', cat: 'SIMULATOR', url: 'simulators.html#sim-pid-section' },
    { title: '3-Joint D-H Kinematics & Workspace', cat: 'SIMULATOR', url: 'simulators.html#sim-kinematics-section' },
    { title: 'A* & Dijkstra Grid Path Planning', cat: 'SIMULATOR', url: 'simulators.html#sim-path-section' },
    { title: 'Ultrasonic Sonar Rangefinder (HC-SR04)', cat: 'SIMULATOR', url: 'simulators.html' },
    { title: 'Arduino C++ Encoder ISR & PWM Code', cat: 'CODE', url: 'programming.html' },
    { title: 'Python Discrete PID Controller Class', cat: 'CODE', url: 'programming.html' },
    { title: 'ROS 2 Humble /cmd_vel Twist Node', cat: 'CODE', url: 'programming.html' },
    { title: 'URDF XML Robot Model Architecture', cat: 'CODE', url: 'programming.html' },
    { title: 'Engineering Glossary of Robotics Terms', cat: 'GLOSSARY', url: 'programming.html#glossary-section' },
    { title: 'Real-World Applications: EV Gigafactories', cat: 'CHAPTER 07', url: 'applications.html' },
    { title: 'Surgical Teleoperation & da Vinci Systems', cat: 'CHAPTER 07', url: 'applications.html' },
    { title: 'Planetary Mars Rovers (Curiosity, Perseverance)', cat: 'CHAPTER 07', url: 'applications.html' },
    { title: '16-Question Certification Assessment Exam', cat: 'EXAM', url: 'quiz.html' },
    { title: 'Sources, Citations & Academic Credits', cat: 'REFERENCES', url: 'credits.html' }
  ];

  function openPalette() {
    if (!cmdBackdrop) return;
    cmdBackdrop.classList.add('open');
    if (cmdInput) {
      cmdInput.value = '';
      cmdInput.focus();
      renderSearchResults('');
    }
  }

  function closePalette() {
    cmdBackdrop?.classList.remove('open');
  }

  cmdOpenBtns.forEach(btn => btn.addEventListener('click', openPalette));

  window.addEventListener('keydown', (e) => {
    if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
      e.preventDefault();
      if (cmdBackdrop?.classList.contains('open')) closePalette();
      else openPalette();
    }
    if (e.key === 'Escape') closePalette();
  });

  cmdBackdrop?.addEventListener('click', (e) => {
    if (e.target === cmdBackdrop) closePalette();
  });

  function renderSearchResults(query) {
    if (!cmdResults) return;
    const cleanQ = query.trim().toLowerCase();
    const matches = cleanQ === '' ? searchIndex.slice(0, 8) : searchIndex.filter(item =>
      item.title.toLowerCase().includes(cleanQ) || item.cat.toLowerCase().includes(cleanQ)
    );

    cmdResults.innerHTML = '';
    if (matches.length === 0) {
      cmdResults.innerHTML = '<div class="p-4 text-center text-xs text-muted font-mono">No matching kinematics, circuits, or terms found.</div>';
      return;
    }

    matches.forEach((item) => {
      const a = document.createElement('a');
      a.href = item.url;
      a.className = 'cmd-result-item';
      a.innerHTML = `
        <span class="text-sm font-medium">${item.title}</span>
        <span class="cmd-result-cat">${item.cat}</span>
      `;
      cmdResults.appendChild(a);
    });
  }

  cmdInput?.addEventListener('input', (e) => {
    renderSearchResults(e.target.value);
  });

  /* ==========================================================================
     10. INTERACTIVE GLOSSARY TOOLTIPS
     ========================================================================== */
  const tooltipBubble = document.getElementById('glossary-tooltip-bubble');
  const tooltipGlossaryMap = {
    'dof': { title: 'DOF (Degrees of Freedom)', desc: 'The number of independent spatial coordinates needed to describe robot pose in 3D space (up to 6 DOF).' },
    'zmp': { title: 'ZMP (Zero Moment Point)', desc: 'Ground coordinate where the net horizontal moment of inertial forces and gravity equals zero, preventing bipedal tipping.' },
    'slam': { title: 'SLAM', desc: 'Simultaneous Localization and Mapping: building an environmental map while computing the robot pose in real time.' },
    'pid': { title: 'PID Control', desc: 'Proportional-Integral-Derivative feedback algorithm calculating corrective actuator voltage from error trajectory.' },
    'pwm': { title: 'PWM (Pulse Width Modulation)', desc: 'Rapidly switching power transistors ON/OFF with variable duty cycles to modulate average DC motor voltage.' },
    'lidar': { title: 'LiDAR', desc: 'Light Detection and Ranging: measuring laser Time-of-Flight (ToF) to produce dense 3D point cloud maps.' },
    'imu': { title: 'IMU', desc: 'Inertial Measurement Unit: 3-axis gyro and 3-axis accelerometer sensor array estimating orientation and acceleration.' },
    'can': { title: 'CAN Bus', desc: 'Differential two-wire serial protocol (ISO 11898) engineered for high noise immunity in motor actuators.' },
    'dh': { title: 'D-H Parameters', desc: 'Denavit-Hartenberg: 4-parameter convention (a, alpha, d, theta) mapping homogeneous joint coordinates.' }
  };

  document.querySelectorAll('.tooltip-term').forEach((el) => {
    el.addEventListener('mouseenter', (e) => {
      const termKey = (el.getAttribute('data-term') || '').toLowerCase();
      const def = tooltipGlossaryMap[termKey];
      if (def && tooltipBubble) {
        tooltipBubble.innerHTML = `<h5>${def.title}</h5><p>${def.desc}</p>`;
        tooltipBubble.classList.add('visible');

        const rect = el.getBoundingClientRect();
        tooltipBubble.style.top = `${rect.bottom + 8}px`;
        tooltipBubble.style.left = `${Math.min(window.innerWidth - 300, Math.max(16, rect.left - 20))}px`;
      }
    });

    el.addEventListener('mouseleave', () => {
      tooltipBubble?.classList.remove('visible');
    });
  });

  /* ==========================================================================
     11. CODE COPY TO CLIPBOARD BUTTONS (programming.html)
     ========================================================================== */
  document.querySelectorAll('.code-copy-btn').forEach((btn) => {
    btn.addEventListener('click', () => {
      const targetId = btn.getAttribute('data-target');
      const codeEl = document.getElementById(targetId);
      if (codeEl) {
        navigator.clipboard.writeText(codeEl.textContent || '').then(() => {
          const original = btn.textContent;
          btn.textContent = '✓ Copied!';
          btn.style.background = '#059669';
          setTimeout(() => {
            btn.textContent = original;
            btn.style.background = '';
          }, 2000);
        });
      }
    });
  });

  /* ==========================================================================
     12. GLOSSARY INLINE FILTER (programming.html)
     ========================================================================== */
  const glossInput = document.getElementById('glossary-filter-input');
  glossInput?.addEventListener('input', (e) => {
    const q = e.target.value.toLowerCase().trim();
    document.querySelectorAll('.glossary-entry').forEach((entry) => {
      const text = entry.getAttribute('data-term') || '';
      entry.style.display = text.includes(q) ? 'block' : 'none';
    });
  });

  /* ==========================================================================
     13. PWA SERVICE WORKER REGISTRATION (OFFLINE CACHING)
     ========================================================================== */
  if ('serviceWorker' in navigator && window.location.protocol.startsWith('http')) {
    navigator.serviceWorker.register('sw.js').catch(() => {});
  }

});
