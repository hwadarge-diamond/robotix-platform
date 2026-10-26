/**
 * ROBOTIX // ADVANCED ROBOTICS & CYBERNETICS ENGINEERING PLATFORM
 * Core Application Engine
 * Integrates Three.js 3D WebGL scenes, GSAP animations, Kinematics Solver,
 * Sensor/Actuator simulators, Logic Gate circuits, and interactive quiz.
 */

document.addEventListener('DOMContentLoaded', () => {
  'use strict';

  /* ==========================================================================
     01. AUDIO SYNTHESIZER (Web Audio API)
     Procedurally generates futuristic sci-fi UI beeps, clicks, and servo hums
     without external MP3 dependencies.
     ========================================================================== */
  let audioCtx = null;
  let sfxEnabled = false;

  function initAudio() {
    if (!audioCtx) {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      if (AudioContext) {
        audioCtx = new AudioContext();
      }
    }
    if (audioCtx && audioCtx.state === 'suspended') {
      audioCtx.resume();
    }
  }

  function playTone(freq, type = 'sine', duration = 0.08, gainVal = 0.04) {
    if (!sfxEnabled || !audioCtx) return;
    try {
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      osc.type = type;
      osc.frequency.setValueAtTime(freq, audioCtx.currentTime);
      gain.gain.setValueAtTime(gainVal, audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.0001, audioCtx.currentTime + duration);
      osc.connect(gain);
      gain.connect(audioCtx.destination);
      osc.start();
      osc.stop(audioCtx.currentTime + duration);
    } catch (e) {
      // Audio autoplay policy fallback
    }
  }

  const audioToggleBtn = document.getElementById('audio-toggle-btn');
  const audioIconOn = document.getElementById('audio-icon-on');
  const audioIconOff = document.getElementById('audio-icon-off');
  const audioLabel = audioToggleBtn?.querySelector('.audio-label');

  audioToggleBtn?.addEventListener('click', () => {
    initAudio();
    sfxEnabled = !sfxEnabled;
    if (sfxEnabled) {
      audioIconOn?.classList.remove('hidden');
      audioIconOff?.classList.add('hidden');
      if (audioLabel) audioLabel.textContent = 'SFX: ON';
      playTone(880, 'sine', 0.1, 0.06);
    } else {
      audioIconOn?.classList.add('hidden');
      audioIconOff?.classList.remove('hidden');
      if (audioLabel) audioLabel.textContent = 'SFX: OFF';
    }
  });

  /* ==========================================================================
     02. PRELOADER & INITIALIZATION
     ========================================================================== */
  const preloader = document.getElementById('preloader');
  const preloaderBar = document.getElementById('preloader-bar');
  const preloaderPct = document.getElementById('preloader-pct');
  const preloaderLogs = document.getElementById('preloader-logs');
  const logSteps = [
    '> Initializing Quantum Actuator Bus...',
    '> Loading 6-DOF Inverse Kinematics Solver...',
    '> Compiling Three.js WebGL Shader Pipelines...',
    '> Calibrating Closed-Loop PID Telemetry...',
    '> Robotics Neural Subsystems Online.'
  ];

  let progress = 0;
  const loadInterval = setInterval(() => {
    progress += Math.floor(Math.random() * 14) + 6;
    if (progress > 100) progress = 100;
    
    if (preloaderBar) preloaderBar.style.width = progress + '%';
    if (preloaderPct) preloaderPct.textContent = progress + '%';

    const logIndex = Math.min(Math.floor((progress / 100) * logSteps.length), logSteps.length - 1);
    if (preloaderLogs) preloaderLogs.innerHTML = `<div>${logSteps[logIndex]}</div>`;

    if (progress >= 100) {
      clearInterval(loadInterval);
      setTimeout(() => {
        preloader?.classList.add('fade-out');
        document.body.classList.remove('overflow-hidden');
      }, 350);
    }
  }, 40);

  /* ==========================================================================
     03. SMOOTH SCROLLING (Lenis) & PROGRESS BAR
     ========================================================================== */
  let lenis = null;
  if (typeof Lenis !== 'undefined') {
    lenis = new Lenis({
      duration: 1.2,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      smoothWheel: true
    });

    function raf(time) {
      lenis.raf(time);
      requestAnimationFrame(raf);
    }
    requestAnimationFrame(raf);
  }

  // Scroll Progress Bar & Nav styling
  const scrollProgress = document.getElementById('scroll-progress');
  const mainNav = document.getElementById('main-nav');
  const navItems = document.querySelectorAll('.nav-item');
  const sections = document.querySelectorAll('section');

  window.addEventListener('scroll', () => {
    const scrollY = window.scrollY;
    const docHeight = document.documentElement.scrollHeight - window.innerHeight;
    const pct = docHeight > 0 ? (scrollY / docHeight) * 100 : 0;
    
    if (scrollProgress) {
      scrollProgress.style.width = `${pct}%`;
    }

    if (scrollY > 50) {
      mainNav?.classList.add('scrolled');
    } else {
      mainNav?.classList.remove('scrolled');
    }

    // Active Nav Highlight
    let currentSectionId = '';
    sections.forEach((sec) => {
      const top = sec.offsetTop - 120;
      const height = sec.offsetHeight;
      if (scrollY >= top && scrollY < top + height) {
        currentSectionId = sec.getAttribute('id');
      }
    });

    navItems.forEach((link) => {
      link.classList.remove('active');
      if (link.getAttribute('href') === `#${currentSectionId}`) {
        link.classList.add('active');
      }
    });
  }, { passive: true });

  /* ==========================================================================
     04. CUSTOM GLOWING CYBER CURSOR
     ========================================================================== */
  const cursorDot = document.getElementById('cursor-dot');
  const cursorRing = document.getElementById('cursor-ring');
  let mouseX = window.innerWidth / 2;
  let mouseY = window.innerHeight / 2;
  let ringX = mouseX;
  let ringY = mouseY;

  window.addEventListener('mousemove', (e) => {
    mouseX = e.clientX;
    mouseY = e.clientY;
    if (cursorDot) {
      cursorDot.style.left = `${mouseX}px`;
      cursorDot.style.top = `${mouseY}px`;
    }
  });

  function renderCursor() {
    ringX += (mouseX - ringX) * 0.18;
    ringY += (mouseY - ringY) * 0.18;
    if (cursorRing) {
      cursorRing.style.left = `${ringX}px`;
      cursorRing.style.top = `${ringY}px`;
    }
    requestAnimationFrame(renderCursor);
  }
  renderCursor();

  // Hover states on interactive elements
  const interactiveElements = document.querySelectorAll('a, button, input, .tilt-card, .glass-panel');
  interactiveElements.forEach((el) => {
    el.addEventListener('mouseenter', () => {
      cursorRing?.classList.add('active');
      playTone(1200, 'sine', 0.03, 0.015);
    });
    el.addEventListener('mouseleave', () => {
      cursorRing?.classList.remove('active');
    });
  });

  /* ==========================================================================
     05. THEME TOGGLE & MOBILE NAVIGATION
     ========================================================================== */
  const themeToggleBtn = document.getElementById('theme-toggle-btn');
  const themeModeText = themeToggleBtn?.querySelector('.theme-mode-text');

  themeToggleBtn?.addEventListener('click', () => {
    document.documentElement.classList.toggle('matrix-theme');
    const isMatrix = document.documentElement.classList.contains('matrix-theme');
    if (themeModeText) {
      themeModeText.textContent = isMatrix ? 'MATRIX' : 'CYBER';
    }
    playTone(isMatrix ? 600 : 750, 'triangle', 0.08, 0.04);
  });

  const mobileToggle = document.getElementById('mobile-menu-toggle');
  const mobileDrawer = document.getElementById('mobile-drawer');
  const mobileNavItems = document.querySelectorAll('.mobile-nav-item');

  mobileToggle?.addEventListener('click', () => {
    mobileToggle.classList.toggle('open');
    mobileDrawer?.classList.toggle('open');
  });

  mobileNavItems.forEach((item) => {
    item.addEventListener('click', () => {
      mobileToggle?.classList.remove('open');
      mobileDrawer?.classList.remove('open');
    });
  });

  /* ==========================================================================
     06. THREE.JS HERO 3D SCENE: ARTICULATED ROBOTIC ARM
     Builds a high-precision 6-DOF procedural robotic arm with metallic materials,
     joint servos, hydraulic cylinders, and volumetric orbital particles.
     ========================================================================== */
  const heroCanvas = document.getElementById('hero-canvas');
  if (heroCanvas && typeof THREE !== 'undefined') {
    const scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2(0x0a0e17, 0.035);

    const camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.1, 100);
    camera.position.set(2.6, 2.0, 4.4);
    camera.lookAt(0, 1.1, 0);

    const renderer = new THREE.WebGLRenderer({
      canvas: heroCanvas,
      alpha: true,
      antialias: true,
      powerPreference: 'high-performance'
    });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;

    // Lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
    scene.add(ambientLight);

    const cyanPoint = new THREE.PointLight(0x00e5ff, 3.2, 10);
    cyanPoint.position.set(-2, 3, 2);
    scene.add(cyanPoint);

    const purplePoint = new THREE.PointLight(0x7c4dff, 2.8, 10);
    purplePoint.position.set(3, 2, -1);
    scene.add(purplePoint);

    const dirLight = new THREE.DirectionalLight(0xffffff, 1.2);
    dirLight.position.set(3, 5, 4);
    dirLight.castShadow = true;
    scene.add(dirLight);

    // Procedural Robotic Arm Hierarchy
    const robotArmGroup = new THREE.Group();
    robotArmGroup.position.set(0.6, -0.2, 0);
    scene.add(robotArmGroup);

    // Materials
    const metalMat = new THREE.MeshStandardMaterial({
      color: 0x1e293b,
      metalness: 0.85,
      roughness: 0.25
    });

    const darkAlloyMat = new THREE.MeshStandardMaterial({
      color: 0x0f172a,
      metalness: 0.95,
      roughness: 0.2
    });

    const cyanGlowMat = new THREE.MeshStandardMaterial({
      color: 0x00e5ff,
      emissive: 0x00e5ff,
      emissiveIntensity: 0.8,
      roughness: 0.1
    });

    const purpleGlowMat = new THREE.MeshStandardMaterial({
      color: 0x7c4dff,
      emissive: 0x7c4dff,
      emissiveIntensity: 0.8,
      roughness: 0.1
    });

    // 1. Pedestal Base
    const baseGeo = new THREE.CylinderGeometry(0.7, 0.85, 0.25, 32);
    const baseMesh = new THREE.Mesh(baseGeo, darkAlloyMat);
    baseMesh.castShadow = true;
    baseMesh.receiveShadow = true;
    robotArmGroup.add(baseMesh);

    // Glowing base accent ring
    const baseRingGeo = new THREE.TorusGeometry(0.78, 0.02, 16, 64);
    const baseRing = new THREE.Mesh(baseRingGeo, cyanGlowMat);
    baseRing.rotation.x = Math.PI / 2;
    baseRing.position.y = 0.08;
    robotArmGroup.add(baseRing);

    // 2. Turret Joint (Yaw Rotation)
    const turretGeo = new THREE.CylinderGeometry(0.5, 0.55, 0.35, 32);
    const turret = new THREE.Mesh(turretGeo, metalMat);
    turret.position.y = 0.28;
    turret.castShadow = true;
    robotArmGroup.add(turret);

    // 3. Shoulder Hinge Joint
    const shoulderGroup = new THREE.Group();
    shoulderGroup.position.set(0, 0.48, 0);
    robotArmGroup.add(shoulderGroup);

    const shoulderJointGeo = new THREE.CylinderGeometry(0.24, 0.24, 0.6, 24);
    const shoulderJoint = new THREE.Mesh(shoulderJointGeo, darkAlloyMat);
    shoulderJoint.rotation.z = Math.PI / 2;
    shoulderGroup.add(shoulderJoint);

    // Shoulder glow rings
    const shoulderRingL = new THREE.Mesh(new THREE.TorusGeometry(0.25, 0.02, 16, 32), cyanGlowMat);
    shoulderRingL.position.x = -0.31;
    shoulderRingL.rotation.y = Math.PI / 2;
    shoulderGroup.add(shoulderRingL);

    const shoulderRingR = new THREE.Mesh(new THREE.TorusGeometry(0.25, 0.02, 16, 32), purpleGlowMat);
    shoulderRingR.position.x = 0.31;
    shoulderRingR.rotation.y = Math.PI / 2;
    shoulderGroup.add(shoulderRingR);

    // 4. Lower Arm Link (L1)
    const lowerArmGroup = new THREE.Group();
    shoulderGroup.add(lowerArmGroup);

    const lowerArmGeo = new THREE.BoxGeometry(0.2, 1.2, 0.25);
    const lowerArmMesh = new THREE.Mesh(lowerArmGeo, metalMat);
    lowerArmMesh.position.y = 0.6;
    lowerArmMesh.castShadow = true;
    lowerArmGroup.add(lowerArmMesh);

    // Hydraulic cylinders
    const pistonGeo = new THREE.CylinderGeometry(0.04, 0.04, 0.8, 16);
    const pistonL = new THREE.Mesh(pistonGeo, darkAlloyMat);
    pistonL.position.set(-0.16, 0.5, 0);
    lowerArmGroup.add(pistonL);

    const pistonR = new THREE.Mesh(pistonGeo, darkAlloyMat);
    pistonR.position.set(0.16, 0.5, 0);
    lowerArmGroup.add(pistonR);

    // 5. Elbow Joint
    const elbowGroup = new THREE.Group();
    elbowGroup.position.set(0, 1.2, 0);
    lowerArmGroup.add(elbowGroup);

    const elbowJointGeo = new THREE.CylinderGeometry(0.18, 0.18, 0.45, 24);
    const elbowJoint = new THREE.Mesh(elbowJointGeo, darkAlloyMat);
    elbowJoint.rotation.z = Math.PI / 2;
    elbowGroup.add(elbowJoint);

    const elbowRing = new THREE.Mesh(new THREE.TorusGeometry(0.19, 0.015, 16, 32), cyanGlowMat);
    elbowRing.rotation.y = Math.PI / 2;
    elbowGroup.add(elbowRing);

    // 6. Forearm Link (L2)
    const foreArmGroup = new THREE.Group();
    elbowGroup.add(foreArmGroup);

    const foreArmGeo = new THREE.BoxGeometry(0.16, 0.95, 0.18);
    const foreArmMesh = new THREE.Mesh(foreArmGeo, metalMat);
    foreArmMesh.position.y = 0.48;
    foreArmMesh.castShadow = true;
    foreArmGroup.add(foreArmMesh);

    // 7. Wrist Assembly
    const wristGroup = new THREE.Group();
    wristGroup.position.set(0, 0.95, 0);
    foreArmGroup.add(wristGroup);

    const wristBallGeo = new THREE.SphereGeometry(0.14, 20, 20);
    const wristBall = new THREE.Mesh(wristBallGeo, darkAlloyMat);
    wristGroup.add(wristBall);

    // 8. End Effector Gripper
    const gripperBaseGeo = new THREE.CylinderGeometry(0.12, 0.14, 0.12, 24);
    const gripperBase = new THREE.Mesh(gripperBaseGeo, cyanGlowMat);
    gripperBase.position.y = 0.12;
    wristGroup.add(gripperBase);

    // Gripper Claws (Dual-finger)
    const fingerGeo = new THREE.BoxGeometry(0.04, 0.24, 0.06);
    const fingerL = new THREE.Mesh(fingerGeo, darkAlloyMat);
    fingerL.position.set(-0.08, 0.24, 0);
    fingerL.rotation.z = -0.15;
    wristGroup.add(fingerL);

    const fingerR = new THREE.Mesh(fingerGeo, darkAlloyMat);
    fingerR.position.set(0.08, 0.24, 0);
    fingerR.rotation.z = 0.15;
    wristGroup.add(fingerR);

    // Laser pointer beam from gripper
    const beamGeo = new THREE.CylinderGeometry(0.005, 0.005, 1.2, 8);
    const beamMat = new THREE.MeshBasicMaterial({
      color: 0x00e5ff,
      transparent: true,
      opacity: 0.6
    });
    const laserBeam = new THREE.Mesh(beamGeo, beamMat);
    laserBeam.position.y = 0.8;
    wristGroup.add(laserBeam);

    // Floating Particles
    const particleCount = window.innerWidth < 768 ? 100 : 250;
    const particlesGeo = new THREE.BufferGeometry();
    const particlePos = new Float32Array(particleCount * 3);

    for (let i = 0; i < particleCount * 3; i += 3) {
      particlePos[i] = (Math.random() - 0.5) * 8;
      particlePos[i + 1] = Math.random() * 5;
      particlePos[i + 2] = (Math.random() - 0.5) * 8;
    }
    particlesGeo.setAttribute('position', new THREE.BufferAttribute(particlePos, 3));

    const particlesMat = new THREE.PointsMaterial({
      color: 0x00e5ff,
      size: 0.035,
      transparent: true,
      opacity: 0.65,
      blending: THREE.AdditiveBlending
    });
    const particleSystem = new THREE.Points(particlesGeo, particlesMat);
    scene.add(particleSystem);

    // Responsive Canvas Resize
    window.addEventListener('resize', () => {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
    });

    // Mouse Tracking Interpolation
    let targetYaw = 0;
    let targetPitch = 0;
    window.addEventListener('mousemove', (e) => {
      const normX = (e.clientX / window.innerWidth) * 2 - 1;
      const normY = -(e.clientY / window.innerHeight) * 2 + 1;
      targetYaw = normX * 0.45;
      targetPitch = normY * 0.25;
    }, { passive: true });

    // Animation Loop
    let clock = new THREE.Clock();
    function animateHero() {
      requestAnimationFrame(animateHero);
      const time = clock.getElapsedTime();

      // Idle breathing harmonics
      const idleWave = Math.sin(time * 1.5) * 0.08;
      const idleWave2 = Math.cos(time * 1.2) * 0.06;

      // Smooth joint tracking
      robotArmGroup.rotation.y += (targetYaw + idleWave - robotArmGroup.rotation.y) * 0.05;
      lowerArmGroup.rotation.z += (-0.35 + targetPitch * 0.4 + idleWave2 - lowerArmGroup.rotation.z) * 0.05;
      elbowGroup.rotation.z += (0.75 - targetPitch * 0.3 - idleWave - elbowGroup.rotation.z) * 0.05;
      wristGroup.rotation.z += (-0.4 + idleWave2 - wristGroup.rotation.z) * 0.05;

      // Particle subtle swirl
      particleSystem.rotation.y = time * 0.04;

      renderer.render(scene, camera);
    }
    animateHero();
  }

  /* ==========================================================================
     07. SECTION 2: 3D SUBSYSTEM CAD VIEWER
     Interactive 3D model highlighting the 5 core components of a robot.
     ========================================================================== */
  const subCanvas = document.getElementById('subsystem-canvas');
  if (subCanvas && typeof THREE !== 'undefined') {
    const subScene = new THREE.Scene();
    const subCam = new THREE.PerspectiveCamera(45, subCanvas.clientWidth / subCanvas.clientHeight, 0.1, 100);
    subCam.position.set(0, 1.2, 3.2);

    const subRenderer = new THREE.WebGLRenderer({
      canvas: subCanvas,
      alpha: true,
      antialias: true
    });
    subRenderer.setSize(subCanvas.clientWidth, subCanvas.clientHeight);
    subRenderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

    const ambLight = new THREE.AmbientLight(0xffffff, 0.8);
    subScene.add(ambLight);

    const cyanSpot = new THREE.PointLight(0x00e5ff, 2.5, 8);
    cyanSpot.position.set(2, 2, 2);
    subScene.add(cyanSpot);

    const purpleSpot = new THREE.PointLight(0x7c4dff, 2.0, 8);
    purpleSpot.position.set(-2, 1, 1);
    subScene.add(purpleSpot);

    // Create 3D Robot Torso Model
    const robotBodyGroup = new THREE.Group();
    subScene.add(robotBodyGroup);

    const defaultMat = new THREE.MeshStandardMaterial({
      color: 0x1e293b,
      metalness: 0.8,
      roughness: 0.3
    });

    // 1. Controller / Central Core (Brain)
    const controllerMesh = new THREE.Mesh(
      new THREE.BoxGeometry(0.5, 0.6, 0.4),
      defaultMat.clone()
    );
    controllerMesh.position.set(0, 0.8, 0);
    robotBodyGroup.add(controllerMesh);

    // 2. Power Supply / Battery Pack
    const batteryMesh = new THREE.Mesh(
      new THREE.BoxGeometry(0.7, 0.4, 0.45),
      defaultMat.clone()
    );
    batteryMesh.position.set(0, 0.25, 0);
    robotBodyGroup.add(batteryMesh);

    // 3. Sensors / LiDAR Head (Vision)
    const sensorMesh = new THREE.Mesh(
      new THREE.CylinderGeometry(0.18, 0.22, 0.25, 24),
      defaultMat.clone()
    );
    sensorMesh.position.set(0, 1.3, 0);
    robotBodyGroup.add(sensorMesh);

    // 4. Actuators / Joint Servos
    const actuatorMeshL = new THREE.Mesh(
      new THREE.CylinderGeometry(0.15, 0.15, 0.3, 20),
      defaultMat.clone()
    );
    actuatorMeshL.rotation.z = Math.PI / 2;
    actuatorMeshL.position.set(-0.4, 0.9, 0);
    robotBodyGroup.add(actuatorMeshL);

    const actuatorMeshR = new THREE.Mesh(
      new THREE.CylinderGeometry(0.15, 0.15, 0.3, 20),
      defaultMat.clone()
    );
    actuatorMeshR.rotation.z = Math.PI / 2;
    actuatorMeshR.position.set(0.4, 0.9, 0);
    robotBodyGroup.add(actuatorMeshR);

    // 5. End Effector / Arm Manipulator
    const armEffector = new THREE.Mesh(
      new THREE.BoxGeometry(0.15, 0.7, 0.15),
      defaultMat.clone()
    );
    armEffector.position.set(0.55, 0.45, 0.2);
    armEffector.rotation.z = -0.3;
    robotBodyGroup.add(armEffector);

    const partMeshes = {
      sensors: [sensorMesh],
      actuators: [actuatorMeshL, actuatorMeshR],
      controller: [controllerMesh],
      power: [batteryMesh],
      effector: [armEffector]
    };

    function highlightPart(partKey) {
      // Reset all parts
      Object.keys(partMeshes).forEach((key) => {
        partMeshes[key].forEach((m) => {
          m.material.color.set(0x1e293b);
          m.material.emissive?.set(0x000000);
        });
      });

      // Highlight active part with vibrant neon
      if (partMeshes[partKey]) {
        partMeshes[partKey].forEach((m) => {
          m.material.color.set(0x00e5ff);
          m.material.emissive?.set(0x00e5ff);
          m.material.emissiveIntensity = 0.6;
        });
      }
    }
    highlightPart('sensors');

    // Subsystem Data Dossier
    const componentData = {
      sensors: {
        tag: 'ACTIVE: SENSORS',
        name: 'Sensors: The Senses',
        desc: 'Sensory transducers measure environmental metrics and internal kinesthetic state, converting physical stimuli into calibrated digital signals.',
        hw: 'LiDAR, Stereo Cameras, 9-DOF IMU, Ultrasonic',
        bus: 'I2C, SPI, CAN-FD, GigE Vision',
        freq: '100 Hz – 1000 Hz',
        metric: 'Signal-to-Noise Ratio & Spatial Precision',
        principle: 'Sensor fusion combines high-frequency IMU rates with absolute visual/LiDAR frames via Extended Kalman Filters (EKF) to prevent navigational drift.'
      },
      actuators: {
        tag: 'ACTIVE: ACTUATORS',
        name: 'Actuators: The Muscles',
        desc: 'Electro-mechanical energy converters that produce controlled rotational and linear displacement to deliver joint torque and mechanical force.',
        hw: 'Brushless DC Motors (BLDC), Steppers, Servos, Harmonics',
        bus: 'PWM, CANopen, EtherCAT, RS-485',
        freq: '1 kHz – 20 kHz PWM Driver Frequency',
        metric: 'Torque Density (Nm/kg) & Backlash (<1 arcmin)',
        principle: 'Field-Oriented Control (FOC) mathematically decouples magnetic flux and torque vectors, enabling whisper-quiet, high-efficiency motor control.'
      },
      controller: {
        tag: 'ACTIVE: CONTROLLER',
        name: 'Controller: The Brain',
        desc: 'Embedded compute units executing the real-time Sense-Plan-Act control loop, running low-latency microsecond control alongside high-level planning.',
        hw: 'STM32F7 / Jetson Orin / Raspberry Pi 5 / FPGA',
        bus: 'PCIe, USB 3.2, CAN, Ethernet',
        freq: '1 kHz Real-time Loop / 2.0+ GHz Planning',
        metric: 'Worst-Case Execution Time (WCET) & Latency',
        principle: 'Microcontrollers run deterministic RTOS loops (FreeRTOS) for motor safety, while multicore SBCs execute SLAM and neural policies in ROS 2.'
      },
      power: {
        tag: 'ACTIVE: POWER SUPPLY',
        name: 'Power System: The Energy',
        desc: 'Electrochemical storage and active power conversion delivering high burst currents to motors and regulated, noise-filtered rails to logic sensors.',
        hw: '6S–12S LiPo / LiFePO4, BMS, Buck/Boost DC-DC Converters',
        bus: 'SMBus, I2C, CAN Battery Telemetry',
        freq: 'Constant DC Delivery with <50 mV ripple',
        metric: 'Energy Density (Wh/kg) & Continuous C-Rating',
        principle: 'Independent power planes with opto-isolation and LC filtering isolate motor inductive voltage spikes (flyback) from delicate microprocessor logic.'
      },
      effector: {
        tag: 'ACTIVE: END EFFECTOR',
        name: 'End Effector: The Hands',
        desc: 'The tool interface mounted at the manipulator wrist designed to directly grasp, machine, inspect, weld, or manipulate real-world physical objects.',
        hw: 'Parallel 2-Jaw Grippers, Vacuum Suction, Welding Torch',
        bus: 'IO-Link, Digital GPIO, Modbus RTU',
        freq: '20 ms Gripper Actuation Time',
        metric: 'Payload Capacity & Gripping Force Control (N)',
        principle: 'Tactile resistive arrays and current sensing enable compliant gripping, preventing fragile payloads (eggs, glassware) from crushing.'
      }
    };

    // Hotspot button interaction
    const hotspotBtns = document.querySelectorAll('.hotspot-btn');
    const compTag = document.getElementById('active-component-tag');
    const compName = document.getElementById('comp-name');
    const compDesc = document.getElementById('comp-desc');
    const compHw = document.getElementById('comp-hw');
    const compBus = document.getElementById('comp-bus');
    const compFreq = document.getElementById('comp-freq');
    const compMetric = document.getElementById('comp-metric');
    const compPrinciple = document.getElementById('comp-principle');

    hotspotBtns.forEach((btn) => {
      btn.addEventListener('click', () => {
        hotspotBtns.forEach((b) => b.classList.remove('active'));
        btn.classList.add('active');

        const part = btn.getAttribute('data-part');
        highlightPart(part);
        playTone(950, 'sine', 0.06, 0.03);

        const data = componentData[part];
        if (data) {
          if (compTag) compTag.textContent = data.tag;
          if (compName) compName.textContent = data.name;
          if (compDesc) compDesc.textContent = data.desc;
          if (compHw) compHw.textContent = data.hw;
          if (compBus) compBus.textContent = data.bus;
          if (compFreq) compFreq.textContent = data.freq;
          if (compMetric) compMetric.textContent = data.metric;
          if (compPrinciple) compPrinciple.textContent = data.principle;
        }
      });
    });

    // Subsystem Animate Loop
    let subClock = new THREE.Clock();
    function animateSubsystem() {
      requestAnimationFrame(animateSubsystem);
      const t = subClock.getElapsedTime();
      robotBodyGroup.rotation.y = Math.sin(t * 0.8) * 0.5;
      robotBodyGroup.position.y = Math.sin(t * 1.5) * 0.05;
      subRenderer.render(subScene, subCam);
    }
    animateSubsystem();

    window.addEventListener('resize', () => {
      if (subCanvas.clientWidth > 0 && subCanvas.clientHeight > 0) {
        subCam.aspect = subCanvas.clientWidth / subCanvas.clientHeight;
        subCam.updateProjectionMatrix();
        subRenderer.setSize(subCanvas.clientWidth, subCanvas.clientHeight);
      }
    });
  }

  /* ==========================================================================
     08. SECTION 3: 3D PERSPECTIVE TILT CARDS
     Calculates 3D rotation angles based on cursor offset and handles card flip.
     ========================================================================== */
  const tiltCards = document.querySelectorAll('.tilt-card');
  tiltCards.forEach((card) => {
    card.addEventListener('mousemove', (e) => {
      if (card.classList.contains('flipped')) return;
      const rect = card.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      const centerX = rect.width / 2;
      const centerY = rect.height / 2;

      const rotX = -((y - centerY) / centerY) * 12;
      const rotY = ((x - centerX) / centerX) * 12;

      const inner = card.querySelector('.card-inner');
      if (inner) {
        inner.style.transform = `rotateX(${rotX}deg) rotateY(${rotY}deg)`;
      }
    });

    card.addEventListener('mouseleave', () => {
      const inner = card.querySelector('.card-inner');
      if (inner && !card.classList.contains('flipped')) {
        inner.style.transform = 'rotateX(0deg) rotateY(0deg)';
      }
    });

    card.addEventListener('click', () => {
      card.classList.toggle('flipped');
      playTone(1100, 'triangle', 0.06, 0.03);
    });
  });

  /* ==========================================================================
     09. SECTION 4: SENSORS & ACTUATORS INTERACTIVE DEMOS
     ========================================================================== */

  // --- Demo 1: Ultrasonic HC-SR04 Radar Simulator ---
  const sonarCanvas = document.getElementById('ultrasonic-canvas');
  const sonarSlider = document.getElementById('sonar-slider');
  const sonarDistVal = document.getElementById('sonar-dist-val');
  const sonarTimeVal = document.getElementById('sonar-time-val');
  const sonarStatusVal = document.getElementById('sonar-status-val');

  if (sonarCanvas) {
    const ctx = sonarCanvas.getContext('2d');
    sonarCanvas.width = sonarCanvas.clientWidth || 360;
    sonarCanvas.height = sonarCanvas.clientHeight || 200;

    let obstacleDist = 120; // in cm
    let wavePulse = 0;

    sonarSlider?.addEventListener('input', (e) => {
      obstacleDist = parseInt(e.target.value, 10);
      if (sonarDistVal) sonarDistVal.textContent = `${obstacleDist} cm`;

      // Speed of sound = 343 m/s = 0.0343 cm/us
      // Round trip time = (2 * d) / 0.0343
      const tof = Math.round((2 * obstacleDist) / 0.0343);
      if (sonarTimeVal) sonarTimeVal.textContent = `${tof} µs`;

      if (sonarStatusVal) {
        if (obstacleDist < 30) {
          sonarStatusVal.textContent = 'COLLISION HAZARD!';
          sonarStatusVal.className = 'text-red font-bold';
        } else if (obstacleDist < 80) {
          sonarStatusVal.textContent = 'PROXIMITY WARNING';
          sonarStatusVal.className = 'text-amber font-bold';
        } else {
          sonarStatusVal.textContent = 'SAFE CORRIDOR';
          sonarStatusVal.className = 'text-green';
        }
      }
    });

    function drawSonar() {
      ctx.clearRect(0, 0, sonarCanvas.width, sonarCanvas.height);

      const w = sonarCanvas.width;
      const h = sonarCanvas.height;
      const midY = h / 2;

      // 1. Draw HC-SR04 Transducer on the Left
      ctx.fillStyle = '#1e293b';
      ctx.strokeStyle = '#00e5ff';
      ctx.lineWidth = 2;
      ctx.fillRect(15, midY - 35, 40, 70);
      ctx.strokeRect(15, midY - 35, 40, 70);

      // Dual ultrasound cylinders (Trigger & Echo)
      ctx.fillStyle = '#0f172a';
      ctx.beginPath();
      ctx.arc(35, midY - 18, 14, 0, Math.PI * 2);
      ctx.arc(35, midY + 18, 14, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();

      // 2. Obstacle Barrier on the Right
      const maxDistCm = 300;
      const obstacleX = 65 + (obstacleDist / maxDistCm) * (w - 110);
      ctx.fillStyle = obstacleDist < 40 ? '#ef4444' : '#7c4dff';
      ctx.shadowColor = obstacleDist < 40 ? '#ef4444' : '#7c4dff';
      ctx.shadowBlur = 10;
      ctx.fillRect(obstacleX, 20, 16, h - 40);
      ctx.shadowBlur = 0;

      // 3. Emitted Ultrasound Waves
      wavePulse = (wavePulse + 3) % (obstacleX - 55);
      ctx.strokeStyle = 'rgba(0, 229, 255, 0.7)';
      ctx.lineWidth = 2;
      for (let offset = 0; offset < 3; offset++) {
        const radius = wavePulse - offset * 18;
        if (radius > 0 && radius < obstacleX - 55) {
          ctx.beginPath();
          ctx.arc(55, midY, radius, -Math.PI / 4, Math.PI / 4);
          ctx.stroke();
        }
      }

      // 4. Returning Reflected Wave
      ctx.strokeStyle = 'rgba(255, 0, 127, 0.6)';
      const returnRadius = (obstacleX - 55) - (wavePulse % (obstacleX - 55));
      if (returnRadius > 0) {
        ctx.beginPath();
        ctx.arc(obstacleX, midY, returnRadius, (3 * Math.PI) / 4, (5 * Math.PI) / 4);
        ctx.stroke();
      }

      requestAnimationFrame(drawSonar);
    }
    drawSonar();
  }

  // --- Demo 2: DC Motor Rotation & Optical Encoder ---
  const motorCanvas = document.getElementById('motor-canvas');
  const motorSlider = document.getElementById('motor-slider');
  const motorRpmVal = document.getElementById('motor-rpm-val');
  const motorDirBtn = document.getElementById('motor-dir-btn');
  const encoderTicksVal = document.getElementById('encoder-ticks-val');

  if (motorCanvas) {
    const ctx = motorCanvas.getContext('2d');
    motorCanvas.width = motorCanvas.clientWidth || 360;
    motorCanvas.height = motorCanvas.clientHeight || 200;

    let targetRpm = 1500;
    let motorAngle = 0;
    let direction = 1; // 1 = CW, -1 = CCW
    let encoderTicks = 0;

    motorSlider?.addEventListener('input', (e) => {
      targetRpm = parseInt(e.target.value, 10);
      if (motorRpmVal) motorRpmVal.textContent = `${targetRpm} RPM`;
    });

    motorDirBtn?.addEventListener('click', () => {
      direction *= -1;
      motorDirBtn.textContent = direction === 1 ? 'DIR: CLOCKWISE' : 'DIR: COUNTER-CW';
      playTone(700, 'square', 0.05, 0.02);
    });

    function drawMotor() {
      ctx.clearRect(0, 0, motorCanvas.width, motorCanvas.height);
      const cx = motorCanvas.width / 2;
      const cy = motorCanvas.height / 2;

      // Update rotation
      const deltaAngle = (targetRpm / 60) * (Math.PI * 2) * 0.016 * direction;
      motorAngle += deltaAngle;
      if (targetRpm > 0) {
        encoderTicks += Math.abs(Math.round(deltaAngle * 10));
        if (encoderTicksVal) encoderTicksVal.textContent = encoderTicks;
      }

      // Motor Stator Housing
      ctx.strokeStyle = '#334155';
      ctx.lineWidth = 8;
      ctx.beginPath();
      ctx.arc(cx, cy, 65, 0, Math.PI * 2);
      ctx.stroke();

      // Slotted Encoder Disc
      ctx.save();
      ctx.translate(cx, cy);
      ctx.rotate(motorAngle);

      ctx.fillStyle = '#0f172a';
      ctx.beginPath();
      ctx.arc(0, 0, 55, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = '#7c4dff';
      ctx.lineWidth = 2;
      ctx.stroke();

      // Encoder Optical Slits
      const slits = 16;
      ctx.fillStyle = '#00e5ff';
      for (let i = 0; i < slits; i++) {
        ctx.rotate((Math.PI * 2) / slits);
        ctx.fillRect(36, -3, 14, 6);
      }

      // Center Shaft
      ctx.fillStyle = '#f8fafc';
      ctx.beginPath();
      ctx.arc(0, 0, 14, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();

      // Optical Interrupter Sensor (Top Right)
      ctx.fillStyle = '#ef4444';
      ctx.shadowColor = '#ef4444';
      ctx.shadowBlur = 8;
      ctx.fillRect(cx + 34, cy - 65, 8, 14);
      ctx.shadowBlur = 0;

      requestAnimationFrame(drawMotor);
    }
    drawMotor();
  }

  // --- Demo 3: Servo Motor Position & PWM Pulse-Width ---
  const servoCanvas = document.getElementById('servo-canvas');
  const servoSlider = document.getElementById('servo-slider');
  const servoAngleVal = document.getElementById('servo-angle-val');
  const servoPulseVal = document.getElementById('servo-pulse-val');
  const servoDutyVal = document.getElementById('servo-duty-val');

  if (servoCanvas) {
    const ctx = servoCanvas.getContext('2d');
    servoCanvas.width = servoCanvas.clientWidth || 360;
    servoCanvas.height = servoCanvas.clientHeight || 200;

    let targetAngle = 90; // degrees (0 to 180)
    let currentAngle = 90;

    servoSlider?.addEventListener('input', (e) => {
      targetAngle = parseInt(e.target.value, 10);
      if (servoAngleVal) servoAngleVal.textContent = `${targetAngle}°`;

      // 0 deg = 1.0 ms, 180 deg = 2.0 ms in a 20 ms period
      const pulseMs = 1.0 + (targetAngle / 180.0);
      const dutyPct = (pulseMs / 20.0) * 100;

      if (servoPulseVal) servoPulseVal.textContent = `${pulseMs.toFixed(2)} ms`;
      if (servoDutyVal) servoDutyVal.textContent = `${dutyPct.toFixed(2)}%`;
      playTone(500 + targetAngle * 3, 'triangle', 0.03, 0.015);
    });

    function drawServo() {
      ctx.clearRect(0, 0, servoCanvas.width, servoCanvas.height);
      const cx = servoCanvas.width / 2;
      const cy = servoCanvas.height - 35;

      // Smooth mechanical servo tracking
      currentAngle += (targetAngle - currentAngle) * 0.15;

      // Servo Case
      ctx.fillStyle = '#1e293b';
      ctx.strokeStyle = '#00e5ff';
      ctx.lineWidth = 2;
      ctx.fillRect(cx - 60, cy - 30, 120, 60);
      ctx.strokeRect(cx - 60, cy - 30, 120, 60);

      // Degree Protractor Arc
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.15)';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.arc(cx, cy, 90, Math.PI, 0);
      ctx.stroke();

      // Rotating Servo Horn
      ctx.save();
      ctx.translate(cx, cy);
      // Map 0-180 degrees to -PI to 0
      const rad = Math.PI - (currentAngle * Math.PI) / 180;
      ctx.rotate(-rad);

      ctx.fillStyle = '#00e5ff';
      ctx.shadowColor = '#00e5ff';
      ctx.shadowBlur = 12;
      ctx.beginPath();
      ctx.moveTo(-10, 0);
      ctx.lineTo(0, -85);
      ctx.lineTo(10, 0);
      ctx.closePath();
      ctx.fill();
      ctx.shadowBlur = 0;

      // Horn pivot hub
      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.arc(0, 0, 16, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();

      requestAnimationFrame(drawServo);
    }
    drawServo();
  }

  /* ==========================================================================
     10. SECTION 5: KINEMATICS & LINKAGE LAB (Forward & Inverse Kinematics)
     Interactive 2-Link Planar Manipulator with Live Drag Inverse Kinematics
     ========================================================================== */
  const kinCanvas = document.getElementById('kinematics-canvas');
  const theta1Slider = document.getElementById('theta1-slider');
  const theta2Slider = document.getElementById('theta2-slider');
  const l1Slider = document.getElementById('l1-slider');
  const l2Slider = document.getElementById('l2-slider');
  const theta1Val = document.getElementById('theta1-val');
  const theta2Val = document.getElementById('theta2-val');
  const l1Val = document.getElementById('l1-val');
  const l2Val = document.getElementById('l2-val');
  const eeCoords = document.getElementById('ee-coords');
  const traceToggle = document.getElementById('trace-toggle');
  const clearTraceBtn = document.getElementById('clear-trace-btn');
  const presetBtns = document.querySelectorAll('.preset-btn');

  if (kinCanvas) {
    const ctx = kinCanvas.getContext('2d');
    function resizeKinCanvas() {
      kinCanvas.width = kinCanvas.clientWidth;
      kinCanvas.height = kinCanvas.clientHeight;
    }
    resizeKinCanvas();
    window.addEventListener('resize', resizeKinCanvas);

    let theta1 = 45; // deg
    let theta2 = 45; // deg
    let l1 = 120; // mm / px scale
    let l2 = 100;
    let trajectory = [];
    let isDragging = false;

    function updateKinematicsLabels() {
      if (theta1Val) theta1Val.textContent = `${Math.round(theta1)}°`;
      if (theta2Val) theta2Val.textContent = `${Math.round(theta2)}°`;
      if (l1Val) l1Val.textContent = `${l1} mm`;
      if (l2Val) l2Val.textContent = `${l2} mm`;

      if (theta1Slider) theta1Slider.value = theta1;
      if (theta2Slider) theta2Slider.value = theta2;
    }

    theta1Slider?.addEventListener('input', (e) => {
      theta1 = parseFloat(e.target.value);
      updateKinematicsLabels();
    });

    theta2Slider?.addEventListener('input', (e) => {
      theta2 = parseFloat(e.target.value);
      updateKinematicsLabels();
    });

    l1Slider?.addEventListener('input', (e) => {
      l1 = parseFloat(e.target.value);
      updateKinematicsLabels();
    });

    l2Slider?.addEventListener('input', (e) => {
      l2 = parseFloat(e.target.value);
      updateKinematicsLabels();
    });

    clearTraceBtn?.addEventListener('click', () => {
      trajectory = [];
    });

    presetBtns.forEach((btn) => {
      btn.addEventListener('click', () => {
        theta1 = parseFloat(btn.getAttribute('data-t1'));
        theta2 = parseFloat(btn.getAttribute('data-t2'));
        updateKinematicsLabels();
        playTone(900, 'sine', 0.05, 0.02);
      });
    });

    // Inverse Kinematics Solver (Law of Cosines)
    function solveIK(targetX, targetY) {
      const dist = Math.sqrt(targetX * targetX + targetY * targetY);
      const maxReach = l1 + l2 - 1;
      const minReach = Math.abs(l1 - l2) + 1;

      // Clamp to reachable workspace boundary
      let clampedX = targetX;
      let clampedY = targetY;
      if (dist > maxReach) {
        clampedX = (targetX / dist) * maxReach;
        clampedY = (targetY / dist) * maxReach;
      } else if (dist < minReach) {
        clampedX = (targetX / dist) * minReach;
        clampedY = (targetY / dist) * minReach;
      }

      const r = Math.sqrt(clampedX * clampedX + clampedY * clampedY);

      // Law of Cosines for elbow joint theta2
      const cosTheta2 = (r * r - l1 * l1 - l2 * l2) / (2 * l1 * l2);
      const clampedCos = Math.max(-1, Math.min(1, cosTheta2));
      const theta2Rad = Math.acos(clampedCos);

      // Shoulder joint theta1
      const alpha = Math.atan2(clampedY, clampedX);
      const beta = Math.atan2(l2 * Math.sin(theta2Rad), l1 + l2 * Math.cos(theta2Rad));
      const theta1Rad = alpha - beta;

      theta1 = (theta1Rad * 180) / Math.PI;
      theta2 = (theta2Rad * 180) / Math.PI;
      updateKinematicsLabels();
    }

    // Mouse / Touch Dragging on Kinematics Viewport
    kinCanvas.addEventListener('mousedown', (e) => {
      isDragging = true;
      handleDrag(e);
    });

    window.addEventListener('mousemove', (e) => {
      if (isDragging) handleDrag(e);
    });

    window.addEventListener('mouseup', () => {
      isDragging = false;
    });

    function handleDrag(e) {
      const rect = kinCanvas.getBoundingClientRect();
      const mouseCanvasX = e.clientX - rect.left;
      const mouseCanvasY = e.clientY - rect.top;

      const baseX = kinCanvas.width / 2;
      const baseY = kinCanvas.height - 60;

      // Transform canvas coordinates to Cartesian robot frame
      const robotX = mouseCanvasX - baseX;
      const robotY = baseY - mouseCanvasY; // Invert Y
      solveIK(robotX, robotY);
    }

    function drawKinematics() {
      ctx.clearRect(0, 0, kinCanvas.width, kinCanvas.height);

      const baseX = kinCanvas.width / 2;
      const baseY = kinCanvas.height - 60;

      // Forward Kinematics Coordinates
      const t1Rad = (theta1 * Math.PI) / 180;
      const t2Rad = (theta2 * Math.PI) / 180;

      const joint1X = baseX + l1 * Math.cos(t1Rad);
      const joint1Y = baseY - l1 * Math.sin(t1Rad);

      const eeX = joint1X + l2 * Math.cos(t1Rad + t2Rad);
      const eeY = joint1Y - l2 * Math.sin(t1Rad + t2Rad);

      if (eeCoords) {
        const cartX = Math.round(eeX - baseX);
        const cartY = Math.round(baseY - eeY);
        eeCoords.textContent = `(${cartX}, ${cartY})`;
      }

      // Record Trajectory
      if (traceToggle?.checked) {
        trajectory.push({ x: eeX, y: eeY });
        if (trajectory.length > 300) trajectory.shift();
      }

      // Draw Workspace Reachable Limit Circle
      ctx.strokeStyle = 'rgba(0, 229, 255, 0.1)';
      ctx.lineWidth = 1;
      ctx.setLineDash([4, 6]);
      ctx.beginPath();
      ctx.arc(baseX, baseY, l1 + l2, 0, Math.PI * 2);
      ctx.stroke();
      ctx.setLineDash([]);

      // Draw Trajectory Trace
      if (trajectory.length > 1) {
        ctx.strokeStyle = '#00e5ff';
        ctx.shadowColor = '#00e5ff';
        ctx.shadowBlur = 8;
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(trajectory[0].x, trajectory[0].y);
        for (let i = 1; i < trajectory.length; i++) {
          ctx.lineTo(trajectory[i].x, trajectory[i].y);
        }
        ctx.stroke();
        ctx.shadowBlur = 0;
      }

      // 1. Draw Base Pedestal
      ctx.fillStyle = '#0f172a';
      ctx.strokeStyle = '#334155';
      ctx.lineWidth = 3;
      ctx.fillRect(baseX - 40, baseY, 80, 25);
      ctx.strokeRect(baseX - 40, baseY, 80, 25);

      // 2. Link 1 (Shoulder to Elbow)
      ctx.strokeStyle = '#38bdf8';
      ctx.lineWidth = 10;
      ctx.lineCap = 'round';
      ctx.beginPath();
      ctx.moveTo(baseX, baseY);
      ctx.lineTo(joint1X, joint1Y);
      ctx.stroke();

      // 3. Link 2 (Elbow to End Effector)
      ctx.strokeStyle = '#a855f7';
      ctx.lineWidth = 8;
      ctx.beginPath();
      ctx.moveTo(joint1X, joint1Y);
      ctx.lineTo(eeX, eeY);
      ctx.stroke();

      // 4. Joint Circles
      // Base Joint
      ctx.fillStyle = '#00e5ff';
      ctx.beginPath();
      ctx.arc(baseX, baseY, 10, 0, Math.PI * 2);
      ctx.fill();

      // Elbow Joint
      ctx.fillStyle = '#7c4dff';
      ctx.beginPath();
      ctx.arc(joint1X, joint1Y, 8, 0, Math.PI * 2);
      ctx.fill();

      // End Effector Gripper Pin
      ctx.fillStyle = '#ffffff';
      ctx.shadowColor = '#00e5ff';
      ctx.shadowBlur = 12;
      ctx.beginPath();
      ctx.arc(eeX, eeY, 8, 0, Math.PI * 2);
      ctx.fill();
      ctx.shadowBlur = 0;

      requestAnimationFrame(drawKinematics);
    }
    drawKinematics();
  }

  /* ==========================================================================
     11. SECTION 6: DIGITAL ELECTRONICS & PWM SIMULATOR
     ========================================================================== */
  // --- Logic Gate Simulator ---
  let activeGate = 'AND';
  let inputA = 0;
  let inputB = 0;

  const gateBtns = document.querySelectorAll('.gate-btn');
  const switchA = document.getElementById('switch-a');
  const switchB = document.getElementById('switch-b');
  const switchBWrap = document.getElementById('switch-b-wrap');
  const voltA = document.getElementById('volt-a');
  const voltB = document.getElementById('volt-b');
  const gateIconText = document.getElementById('gate-icon-text');
  const gateBoolean = document.getElementById('gate-boolean');
  const logicLed = document.getElementById('logic-led');
  const logicOutVal = document.getElementById('logic-out-val');
  const truthTableBody = document.getElementById('truth-table-body');

  const gateData = {
    AND: { expr: 'Y = A · B', eval: (a, b) => (a && b ? 1 : 0), singleInput: false },
    OR: { expr: 'Y = A + B', eval: (a, b) => (a || b ? 1 : 0), singleInput: false },
    NOT: { expr: 'Y = Ā', eval: (a) => (a ? 0 : 1), singleInput: true },
    NAND: { expr: 'Y = (A · B)̄', eval: (a, b) => (!(a && b) ? 1 : 0), singleInput: false },
    NOR: { expr: 'Y = (A + B)̄', eval: (a, b) => (!(a || b) ? 1 : 0), singleInput: false },
    XOR: { expr: 'Y = A ⊕ B', eval: (a, b) => (a !== b ? 1 : 0), singleInput: false }
  };

  function updateLogicCircuit() {
    const info = gateData[activeGate];
    if (switchBWrap) {
      switchBWrap.style.display = info.singleInput ? 'none' : 'flex';
    }

    if (gateIconText) gateIconText.textContent = activeGate;
    if (gateBoolean) gateBoolean.textContent = info.expr;

    const output = info.eval(inputA, inputB);
    if (logicLed) {
      if (output === 1) {
        logicLed.classList.add('on');
      } else {
        logicLed.classList.remove('on');
      }
    }

    if (logicOutVal) {
      logicOutVal.textContent = output === 1 ? 'OUT: 1 (HIGH // 5.0V)' : 'OUT: 0 (LOW // 0.0V)';
      logicOutVal.className = output === 1 ? 'font-mono text-xs mt-2 text-cyan font-bold' : 'font-mono text-xs mt-2 text-slate-400';
    }

    // Render Truth Table
    if (truthTableBody) {
      truthTableBody.innerHTML = '';
      const combinations = info.singleInput
        ? [{ a: 0, b: '-' }, { a: 1, b: '-' }]
        : [
            { a: 0, b: 0 },
            { a: 0, b: 1 },
            { a: 1, b: 0 },
            { a: 1, b: 1 }
          ];

      combinations.forEach((c) => {
        const out = info.eval(c.a, c.b === '-' ? 0 : c.b);
        const isActiveRow = (c.a === inputA) && (info.singleInput || c.b === inputB);
        const tr = document.createElement('tr');
        if (isActiveRow) tr.classList.add('active-row');
        tr.innerHTML = `
          <td>${c.a}</td>
          <td>${c.b}</td>
          <td>${out}</td>
        `;
        truthTableBody.appendChild(tr);
      });
    }
  }

  gateBtns.forEach((btn) => {
    btn.addEventListener('click', () => {
      gateBtns.forEach((b) => b.classList.remove('active'));
      btn.classList.add('active');
      activeGate = btn.getAttribute('data-gate');
      playTone(850, 'sine', 0.05, 0.02);
      updateLogicCircuit();
    });
  });

  switchA?.addEventListener('click', () => {
    inputA = inputA === 0 ? 1 : 0;
    switchA.textContent = `IN A: ${inputA}`;
    switchA.classList.toggle('active', inputA === 1);
    if (voltA) voltA.textContent = inputA === 1 ? '5.0 V (HIGH)' : '0.0 V (LOW)';
    playTone(inputA === 1 ? 1000 : 400, 'square', 0.04, 0.02);
    updateLogicCircuit();
  });

  switchB?.addEventListener('click', () => {
    inputB = inputB === 0 ? 1 : 0;
    switchB.textContent = `IN B: ${inputB}`;
    switchB.classList.toggle('active', inputB === 1);
    if (voltB) voltB.textContent = inputB === 1 ? '5.0 V (HIGH)' : '0.0 V (LOW)';
    playTone(inputB === 1 ? 1000 : 400, 'square', 0.04, 0.02);
    updateLogicCircuit();
  });

  updateLogicCircuit();

  // --- PWM Duty Cycle Oscilloscope ---
  const pwmCanvas = document.getElementById('pwm-canvas');
  const pwmSlider = document.getElementById('pwm-duty-slider');
  const pwmDutyLabel = document.getElementById('pwm-duty-label');
  const pwmVoltVal = document.getElementById('pwm-volt-val');
  const pwmLedGlow = document.getElementById('pwm-led-glow');

  if (pwmCanvas) {
    const ctx = pwmCanvas.getContext('2d');
    pwmCanvas.width = pwmCanvas.clientWidth || 380;
    pwmCanvas.height = pwmCanvas.clientHeight || 180;

    let dutyCycle = 50; // percentage (0 - 100)
    let waveOffset = 0;

    pwmSlider?.addEventListener('input', (e) => {
      dutyCycle = parseInt(e.target.value, 10);
      if (pwmDutyLabel) pwmDutyLabel.textContent = `${dutyCycle}%`;

      const vAvg = (12.0 * (dutyCycle / 100.0)).toFixed(2);
      if (pwmVoltVal) pwmVoltVal.textContent = `${vAvg} V`;

      if (pwmLedGlow) {
        pwmLedGlow.style.opacity = Math.max(0.1, dutyCycle / 100);
        pwmLedGlow.style.boxShadow = `0 0 ${dutyCycle * 0.3}px #00e5ff`;
      }
    });

    function drawPWM() {
      ctx.clearRect(0, 0, pwmCanvas.width, pwmCanvas.height);

      const w = pwmCanvas.width;
      const h = pwmCanvas.height;
      const topY = 40;
      const bottomY = h - 40;
      const periodWidth = 120; // px per cycle
      const highWidth = (dutyCycle / 100) * periodWidth;

      // Draw Grid Lines
      ctx.strokeStyle = '#0f172a';
      ctx.lineWidth = 1;
      for (let x = 0; x < w; x += 30) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, h);
        ctx.stroke();
      }
      for (let y = 0; y < h; y += 30) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(w, y);
        ctx.stroke();
      }

      // Draw Waveform
      waveOffset = (waveOffset + 2) % periodWidth;

      ctx.strokeStyle = '#00e5ff';
      ctx.shadowColor = '#00e5ff';
      ctx.shadowBlur = 8;
      ctx.lineWidth = 3;
      ctx.beginPath();

      let startX = -periodWidth + waveOffset;
      while (startX < w + periodWidth) {
        // High level
        ctx.moveTo(startX, bottomY);
        ctx.lineTo(startX, topY);
        ctx.lineTo(startX + highWidth, topY);
        // Low level
        ctx.lineTo(startX + highWidth, bottomY);
        ctx.lineTo(startX + periodWidth, bottomY);
        startX += periodWidth;
      }
      ctx.stroke();
      ctx.shadowBlur = 0;

      requestAnimationFrame(drawPWM);
    }
    drawPWM();
  }

  /* ==========================================================================
     12. SECTION 7: APPLICATIONS HORIZONTAL GALLERY
     ========================================================================== */
  const galleryTrack = document.getElementById('gallery-track');
  const galleryPrev = document.getElementById('gallery-prev-btn');
  const galleryNext = document.getElementById('gallery-next-btn');

  galleryPrev?.addEventListener('click', () => {
    galleryTrack?.scrollBy({ left: -380, behavior: 'smooth' });
    playTone(700, 'sine', 0.04, 0.02);
  });

  galleryNext?.addEventListener('click', () => {
    galleryTrack?.scrollBy({ left: 380, behavior: 'smooth' });
    playTone(700, 'sine', 0.04, 0.02);
  });

  /* ==========================================================================
     13. SECTION 8: ROBOTICS QUIZ (5 MCQs with Explanations & Confetti)
     ========================================================================== */
  const quizData = [
    {
      question: 'What is the primary role of the "Sense-Plan-Act" cycle in robotics?',
      options: [
        'A structural design method for CAD modeling.',
        'The foundational computational feedback loop that guides autonomous interaction.',
        'A manufacturing protocol for industrial painting robots.',
        'An encryption handshake standard used in CAN bus controllers.'
      ],
      correct: 1,
      explanation: 'Sense-Plan-Act defines cybernetic autonomy: perceive the environment via sensors, deliberate trajectory/inverse kinematics, and execute actions via motor actuators.'
    },
    {
      question: 'In a 2-joint planar arm, which formula calculates joint angles from a known end-effector coordinate (x, y)?',
      options: [
        'Direct Forward Trigonometric Integration',
        'Inverse Kinematics via the Law of Cosines',
        'Fourier Transform Frequency Analysis',
        'Bernoulli Fluid Flow Synthesis'
      ],
      correct: 1,
      explanation: 'Inverse Kinematics (IK) employs trigonometric identity and the Law of Cosines to solve the joint angles required to reach a specific target (x, y).'
    },
    {
      question: 'What is the typical PWM pulse duration for a standard hobby servo in its neutral (90°) position?',
      options: [
        '0.50 ms',
        '1.50 ms',
        '5.00 ms',
        '20.00 ms'
      ],
      correct: 1,
      explanation: 'Standard hobby servos expect a 50 Hz PWM carrier (20 ms period) where 1.0 ms maps to 0°, 1.5 ms maps to neutral 90°, and 2.0 ms maps to 180°.'
    },
    {
      question: 'Why is CAN (Controller Area Network) bus widely adopted in industrial and automotive robotics?',
      options: [
        'It requires fiber-optic lasers for multi-gigabit streaming.',
        'Differential signaling provides exceptional noise immunity in harsh electromagnetic environments.',
        'It eliminates the need for microcontroller firmware.',
        'It delivers wireless power transfer to end-effectors.'
      ],
      correct: 1,
      explanation: 'CAN bus uses differential pair wiring (CAN_H and CAN_L), rejecting common-mode electrical noise generated by high-power electric motors.'
    },
    {
      question: 'How does LiDAR (Light Detection and Ranging) construct a 3D point cloud of an obstacle field?',
      options: [
        'By measuring the Time-of-Flight (ToF) of emitted laser pulses bounced off surfaces.',
        'By measuring the gravitational eddy currents of nearby materials.',
        'By detecting passive ambient infrared thermal heat.',
        'By modulating radio frequencies inside coaxial cables.'
      ],
      correct: 0,
      explanation: 'LiDAR pulses thousands of infrared laser beams per second, timing the nanosecond round-trip flight to triangulate millimeter-accurate 3D point clouds.'
    }
  ];

  let currentQuestionIdx = 0;
  let quizScore = 0;

  const quizQuestionText = document.getElementById('quiz-question-text');
  const quizOptionsContainer = document.getElementById('quiz-options-container');
  const quizCounter = document.getElementById('quiz-counter');
  const quizScoreLive = document.getElementById('quiz-score-live');
  const quizProgressBar = document.getElementById('quiz-progress-bar');
  const quizExplanation = document.getElementById('quiz-explanation');
  const quizExplStatus = document.getElementById('quiz-expl-status');
  const quizExplText = document.getElementById('quiz-expl-text');
  const quizNextBtn = document.getElementById('quiz-next-btn');
  const quizCardContent = document.getElementById('quiz-card-content');
  const quizResultsCard = document.getElementById('quiz-results-card');
  const quizFinalScoreVal = document.getElementById('quiz-final-score-val');
  const quizRetakeBtn = document.getElementById('quiz-retake-btn');

  function renderQuizQuestion() {
    if (currentQuestionIdx >= quizData.length) {
      showQuizResults();
      return;
    }

    const q = quizData[currentQuestionIdx];
    if (quizQuestionText) quizQuestionText.textContent = q.question;
    if (quizCounter) quizCounter.textContent = `QUESTION 0${currentQuestionIdx + 1} OF 05`;
    if (quizScoreLive) quizScoreLive.textContent = `SCORE: ${quizScore} / 5`;
    if (quizProgressBar) quizProgressBar.style.width = `${((currentQuestionIdx + 1) / 5) * 100}%`;

    quizExplanation?.classList.add('hidden');
    quizNextBtn?.classList.add('hidden');

    if (quizOptionsContainer) {
      quizOptionsContainer.innerHTML = '';
      const letters = ['A', 'B', 'C', 'D'];
      q.options.forEach((opt, idx) => {
        const btn = document.createElement('button');
        btn.className = 'quiz-option-btn';
        btn.innerHTML = `
          <span class="option-badge">${letters[idx]}</span>
          <span>${opt}</span>
        `;

        btn.addEventListener('click', () => {
          handleQuizAnswer(idx, q.correct);
        });

        quizOptionsContainer.appendChild(btn);
      });
    }
  }

  function handleQuizAnswer(selectedIdx, correctIdx) {
    const optionBtns = quizOptionsContainer?.querySelectorAll('.quiz-option-btn');
    optionBtns?.forEach((btn, idx) => {
      btn.disabled = true;
      if (idx === correctIdx) {
        btn.classList.add('correct');
      } else if (idx === selectedIdx) {
        btn.classList.add('incorrect');
      }
    });

    const isCorrect = selectedIdx === correctIdx;
    if (isCorrect) {
      quizScore++;
      if (quizScoreLive) quizScoreLive.textContent = `SCORE: ${quizScore} / 5`;
      playTone(1050, 'sine', 0.12, 0.05);
    } else {
      playTone(280, 'sawtooth', 0.15, 0.04);
    }

    if (quizExplanation && quizExplStatus && quizExplText) {
      quizExplStatus.textContent = isCorrect ? 'CORRECT' : 'INCORRECT';
      quizExplStatus.className = isCorrect ? 'font-mono text-xs font-bold text-green mb-1' : 'font-mono text-xs font-bold text-red mb-1';
      quizExplText.textContent = quizData[currentQuestionIdx].explanation;
      quizExplanation.classList.remove('hidden');
    }

    quizNextBtn?.classList.remove('hidden');
  }

  quizNextBtn?.addEventListener('click', () => {
    currentQuestionIdx++;
    renderQuizQuestion();
  });

  function showQuizResults() {
    quizCardContent?.classList.add('hidden');
    quizResultsCard?.classList.remove('hidden');

    if (quizFinalScoreVal) quizFinalScoreVal.textContent = `${quizScore} / 5`;

    if (typeof confetti === 'function' && quizScore >= 3) {
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#00e5ff', '#7c4dff', '#10b981']
      });
    }
  }

  quizRetakeBtn?.addEventListener('click', () => {
    currentQuestionIdx = 0;
    quizScore = 0;
    quizResultsCard?.classList.add('hidden');
    quizCardContent?.classList.remove('hidden');
    renderQuizQuestion();
  });

  renderQuizQuestion();

  /* ==========================================================================
     14. SECTION 9: FORMULA CHEATSHEET CLIPBOARD COPY
     ========================================================================== */
  const copyCheatsheetBtn = document.getElementById('copy-cheatsheet-btn');
  const copyBtnText = document.getElementById('copy-btn-text');

  copyCheatsheetBtn?.addEventListener('click', () => {
    const textToCopy = `ROBOTIX FORMULA CHEATSHEET
=============================================
1. PWM Average Voltage:
   V_avg = V_bus * (Duty% / 100)

2. Acoustic Time-of-Flight Distance:
   d = (343 m/s * Delta_t) / 2

3. Forward Kinematics (Planar 2-DOF):
   x = L1 * cos(theta1) + L2 * cos(theta1 + theta2)
   y = L1 * sin(theta1) + L2 * sin(theta1 + theta2)

4. Inverse Kinematics (Law of Cosines):
   cos(theta2) = (x^2 + y^2 - L1^2 - L2^2) / (2 * L1 * L2)

5. PID Controller:
   u(t) = Kp*e(t) + Ki*Integral(e(t) dt) + Kd*(de(t)/dt)
=============================================`;

    navigator.clipboard.writeText(textToCopy).then(() => {
      if (copyBtnText) copyBtnText.textContent = 'COPIED TO CLIPBOARD!';
      playTone(1300, 'sine', 0.08, 0.04);
      setTimeout(() => {
        if (copyBtnText) copyBtnText.textContent = 'COPY FORMULAS';
      }, 2500);
    }).catch(() => {
      if (copyBtnText) copyBtnText.textContent = 'PRESS CTRL+C';
    });
  });

});
