/**
 * ROBOTIX ACADEMY // CREAM LIGHT EDITION
 * Core Interactive & 3D WebGL Script
 * Powers 3D Robotic Structures, Interactive Simulators, Kinematics, Circuits, and Quiz
 */

document.addEventListener('DOMContentLoaded', () => {
  'use strict';

  /* ==========================================================================
     01. SHARED NAVIGATION & MOBILE DRAWER
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
     02. THREE.JS 3D ROBOTIC STRUCTURE (HOME PAGE HERO)
     A pristine ceramic-white & brushed-titanium articulated robotic manipulator
     with warm champagne-gold accent rings and ambient shadows.
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
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;

    // Warm Studio Lighting
    const hemiLight = new THREE.HemisphereLight(0xffffff, 0xf4efe6, 1.1);
    scene.add(hemiLight);

    const dirLight = new THREE.DirectionalLight(0xfff8ed, 1.4);
    dirLight.position.set(4, 7, 5);
    dirLight.castShadow = true;
    dirLight.shadow.mapSize.width = 1024;
    dirLight.shadow.mapSize.height = 1024;
    scene.add(dirLight);

    const amberFillLight = new THREE.PointLight(0xd97706, 1.5, 8);
    amberFillLight.position.set(-3, 2, 2);
    scene.add(amberFillLight);

    const rimLight = new THREE.PointLight(0x0284c7, 1.2, 8);
    rimLight.position.set(2, 3, -3);
    scene.add(rimLight);

    // Robot Arm Group
    const armRoot = new THREE.Group();
    armRoot.position.set(0.2, 0.1, 0);
    scene.add(armRoot);

    // Elegant Materials
    const ceramicWhiteMat = new THREE.MeshStandardMaterial({
      color: 0xfdfdfd,
      roughness: 0.25,
      metalness: 0.1
    });

    const brushedTitaniumMat = new THREE.MeshStandardMaterial({
      color: 0x475569,
      roughness: 0.35,
      metalness: 0.8
    });

    const champagneGoldMat = new THREE.MeshStandardMaterial({
      color: 0xc27803,
      roughness: 0.2,
      metalness: 0.85
    });

    // Pedestal
    const baseCyl = new THREE.Mesh(
      new THREE.CylinderGeometry(0.75, 0.85, 0.2, 32),
      ceramicWhiteMat
    );
    baseCyl.receiveShadow = true;
    armRoot.add(baseCyl);

    const baseRing = new THREE.Mesh(
      new THREE.TorusGeometry(0.76, 0.02, 16, 48),
      champagneGoldMat
    );
    baseRing.rotation.x = Math.PI / 2;
    baseRing.position.y = 0.08;
    armRoot.add(baseRing);

    // Turret (Yaw)
    const turret = new THREE.Mesh(
      new THREE.CylinderGeometry(0.5, 0.55, 0.3, 32),
      brushedTitaniumMat
    );
    turret.position.y = 0.24;
    turret.castShadow = true;
    armRoot.add(turret);

    // Shoulder
    const shoulderGroup = new THREE.Group();
    shoulderGroup.position.set(0, 0.42, 0);
    armRoot.add(shoulderGroup);

    const shoulderJoint = new THREE.Mesh(
      new THREE.CylinderGeometry(0.22, 0.22, 0.6, 24),
      ceramicWhiteMat
    );
    shoulderJoint.rotation.z = Math.PI / 2;
    shoulderJoint.castShadow = true;
    shoulderGroup.add(shoulderJoint);

    const goldCapL = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.12, 0.62, 20), champagneGoldMat);
    goldCapL.rotation.z = Math.PI / 2;
    shoulderGroup.add(goldCapL);

    // Lower Arm Link (L1)
    const lowerArmGroup = new THREE.Group();
    shoulderGroup.add(lowerArmGroup);

    const lowerArmMesh = new THREE.Mesh(
      new THREE.BoxGeometry(0.2, 1.25, 0.25),
      ceramicWhiteMat
    );
    lowerArmMesh.position.y = 0.62;
    lowerArmMesh.castShadow = true;
    lowerArmGroup.add(lowerArmMesh);

    // Dual Hydraulic Struts
    const strutGeo = new THREE.CylinderGeometry(0.035, 0.035, 0.9, 16);
    const strutL = new THREE.Mesh(strutGeo, brushedTitaniumMat);
    strutL.position.set(-0.16, 0.55, 0);
    lowerArmGroup.add(strutL);

    const strutR = new THREE.Mesh(strutGeo, brushedTitaniumMat);
    strutR.position.set(0.16, 0.55, 0);
    lowerArmGroup.add(strutR);

    // Elbow
    const elbowGroup = new THREE.Group();
    elbowGroup.position.set(0, 1.25, 0);
    lowerArmGroup.add(elbowGroup);

    const elbowJoint = new THREE.Mesh(
      new THREE.CylinderGeometry(0.18, 0.18, 0.45, 24),
      brushedTitaniumMat
    );
    elbowJoint.rotation.z = Math.PI / 2;
    elbowJoint.castShadow = true;
    elbowGroup.add(elbowJoint);

    // Forearm Link (L2)
    const foreArmGroup = new THREE.Group();
    elbowGroup.add(foreArmGroup);

    const foreArmMesh = new THREE.Mesh(
      new THREE.BoxGeometry(0.16, 0.95, 0.18),
      ceramicWhiteMat
    );
    foreArmMesh.position.y = 0.48;
    foreArmMesh.castShadow = true;
    foreArmGroup.add(foreArmMesh);

    // Wrist & Gripper
    const wristGroup = new THREE.Group();
    wristGroup.position.set(0, 0.95, 0);
    foreArmGroup.add(wristGroup);

    const wristBall = new THREE.Mesh(new THREE.SphereGeometry(0.13, 20, 20), brushedTitaniumMat);
    wristGroup.add(wristBall);

    const clawBase = new THREE.Mesh(new THREE.CylinderGeometry(0.1, 0.12, 0.1, 24), champagneGoldMat);
    clawBase.position.y = 0.1;
    wristGroup.add(clawBase);

    const fingerGeo = new THREE.BoxGeometry(0.04, 0.22, 0.05);
    const fingerL = new THREE.Mesh(fingerGeo, ceramicWhiteMat);
    fingerL.position.set(-0.07, 0.22, 0);
    fingerL.rotation.z = -0.12;
    wristGroup.add(fingerL);

    const fingerR = new THREE.Mesh(fingerGeo, ceramicWhiteMat);
    fingerR.position.set(0.07, 0.22, 0);
    fingerR.rotation.z = 0.12;
    wristGroup.add(fingerR);

    // Smooth Cursor Tracking & Interactive Toolbar Controls
    let targetYaw = 0;
    let targetPitch = 0;
    let speedMult = 1.0;
    let isWireframe = false;
    let isGripping = false;
    let currentThemeIdx = 0;
    const themePalettes = [
      { name: 'GOLD', color: 0xc27803 },
      { name: 'AZURE', color: 0x0284c7 },
      { name: 'TITANIUM', color: 0x334155 }
    ];

    const wireframeBtn = document.getElementById('hero-wireframe-btn');
    const speedBtn = document.getElementById('hero-speed-btn');
    const clawBtn = document.getElementById('hero-claw-btn');
    const themeBtn = document.getElementById('hero-theme-btn');

    wireframeBtn?.addEventListener('click', () => {
      isWireframe = !isWireframe;
      ceramicWhiteMat.wireframe = isWireframe;
      brushedTitaniumMat.wireframe = isWireframe;
      champagneGoldMat.wireframe = isWireframe;
      wireframeBtn.querySelector('span').textContent = isWireframe ? 'MESH: WIREFRAME' : 'MESH: SHADED';
      wireframeBtn.classList.toggle('active', isWireframe);
    });

    speedBtn?.addEventListener('click', () => {
      if (speedMult === 1.0) {
        speedMult = 2.0;
        speedBtn.querySelector('span').textContent = 'SPEED: 2X';
      } else if (speedMult === 2.0) {
        speedMult = 0.5;
        speedBtn.querySelector('span').textContent = 'SPEED: 0.5X';
      } else {
        speedMult = 1.0;
        speedBtn.querySelector('span').textContent = 'SPEED: 1X';
      }
    });

    clawBtn?.addEventListener('click', () => {
      isGripping = !isGripping;
      clawBtn.querySelector('span').textContent = isGripping ? 'CLAW: RELEASE' : 'CLAW: GRIP';
      clawBtn.classList.toggle('active', isGripping);
    });

    themeBtn?.addEventListener('click', () => {
      currentThemeIdx = (currentThemeIdx + 1) % themePalettes.length;
      const cur = themePalettes[currentThemeIdx];
      champagneGoldMat.color.setHex(cur.color);
      amberFillLight.color.setHex(cur.color);
      themeBtn.querySelector('span').textContent = `COLOR: ${cur.name}`;
    });

    window.addEventListener('mousemove', (e) => {
      const normX = (e.clientX / window.innerWidth) * 2 - 1;
      const normY = -(e.clientY / window.innerHeight) * 2 + 1;
      targetYaw = normX * 0.4;
      targetPitch = normY * 0.25;
    }, { passive: true });

    let clock = new THREE.Clock();
    function animateHeroArm() {
      requestAnimationFrame(animateHeroArm);
      const time = clock.getElapsedTime() * speedMult;

      // Gentle organic idle breathing
      const breath = Math.sin(time * 1.4) * 0.06;
      armRoot.rotation.y += (targetYaw + breath - armRoot.rotation.y) * 0.05;
      lowerArmGroup.rotation.z += (-0.3 + targetPitch * 0.3 + breath - lowerArmGroup.rotation.z) * 0.05;
      elbowGroup.rotation.z += (0.65 - targetPitch * 0.2 - breath - elbowGroup.rotation.z) * 0.05;
      wristGroup.rotation.z += (-0.3 + breath - wristGroup.rotation.z) * 0.05;

      // Claw grip interpolation
      const targetFingerRot = isGripping ? 0.02 : 0.12;
      fingerL.rotation.z += (-targetFingerRot - fingerL.rotation.z) * 0.1;
      fingerR.rotation.z += (targetFingerRot - fingerR.rotation.z) * 0.1;

      renderer.render(scene, camera);
    }
    animateHeroArm();

    window.addEventListener('resize', () => {
      if (heroCanvas.clientWidth > 0 && heroCanvas.clientHeight > 0) {
        camera.aspect = heroCanvas.clientWidth / heroCanvas.clientHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(heroCanvas.clientWidth, heroCanvas.clientHeight);
      }
    });
  }

  /* ==========================================================================
     03. THREE.JS 3D STRUCTURE EXPLORER (COMPONENTS PAGE)
     ========================================================================== */
  const structCanvas = document.getElementById('structure-canvas');
  if (structCanvas && typeof THREE !== 'undefined') {
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(45, structCanvas.clientWidth / structCanvas.clientHeight, 0.1, 100);
    camera.position.set(0, 1.2, 3.4);

    const renderer = new THREE.WebGLRenderer({
      canvas: structCanvas,
      alpha: true,
      antialias: true
    });
    renderer.setSize(structCanvas.clientWidth, structCanvas.clientHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

    const ambLight = new THREE.AmbientLight(0xffffff, 0.9);
    scene.add(ambLight);

    const dirLight = new THREE.DirectionalLight(0xfff5eb, 1.3);
    dirLight.position.set(3, 4, 3);
    scene.add(dirLight);

    const goldPoint = new THREE.PointLight(0xd97706, 2.0, 8);
    goldPoint.position.set(-2, 1, 2);
    scene.add(goldPoint);

    const robotGroup = new THREE.Group();
    scene.add(robotGroup);

    const defaultMat = new THREE.MeshStandardMaterial({
      color: 0xf8fafc,
      roughness: 0.3,
      metalness: 0.15
    });

    const highlightMat = new THREE.MeshStandardMaterial({
      color: 0xc27803,
      roughness: 0.2,
      metalness: 0.6
    });

    // 1. Controller / Central Core (Brain)
    const coreMesh = new THREE.Mesh(new THREE.BoxGeometry(0.5, 0.6, 0.38), defaultMat.clone());
    coreMesh.position.set(0, 0.8, 0);
    robotGroup.add(coreMesh);

    // 2. Power Supply / Battery
    const powerMesh = new THREE.Mesh(new THREE.BoxGeometry(0.68, 0.38, 0.42), defaultMat.clone());
    powerMesh.position.set(0, 0.25, 0);
    robotGroup.add(powerMesh);

    // 3. Sensors / LiDAR Head
    const sensorMesh = new THREE.Mesh(new THREE.CylinderGeometry(0.18, 0.22, 0.28, 24), defaultMat.clone());
    sensorMesh.position.set(0, 1.32, 0);
    robotGroup.add(sensorMesh);

    // 4. Actuators / Joint Servos
    const actMeshL = new THREE.Mesh(new THREE.CylinderGeometry(0.14, 0.14, 0.28, 20), defaultMat.clone());
    actMeshL.rotation.z = Math.PI / 2;
    actMeshL.position.set(-0.38, 0.9, 0);
    robotGroup.add(actMeshL);

    const actMeshR = new THREE.Mesh(new THREE.CylinderGeometry(0.14, 0.14, 0.28, 20), defaultMat.clone());
    actMeshR.rotation.z = Math.PI / 2;
    actMeshR.position.set(0.38, 0.9, 0);
    robotGroup.add(actMeshR);

    // 5. End Effector Manipulator
    const armMesh = new THREE.Mesh(new THREE.BoxGeometry(0.14, 0.65, 0.14), defaultMat.clone());
    armMesh.position.set(0.55, 0.45, 0.15);
    armMesh.rotation.z = -0.3;
    robotGroup.add(armMesh);

    const partsMap = {
      sensors: [sensorMesh],
      actuators: [actMeshL, actMeshR],
      controller: [coreMesh],
      power: [powerMesh],
      effector: [armMesh]
    };

    function highlightPart(partKey) {
      Object.keys(partsMap).forEach((k) => {
        partsMap[k].forEach((m) => {
          m.material.color.set(0xf8fafc);
        });
      });
      if (partsMap[partKey]) {
        partsMap[partKey].forEach((m) => {
          m.material.color.set(0xc27803);
        });
      }
    }
    highlightPart('sensors');

    // Dossier Details Data
    const componentDetails = {
      sensors: {
        title: 'Sensors: The Senses of the Machine',
        desc: 'Sensory transducers measure environment metrics and internal joint positions, transforming optical and acoustic stimuli into digital readings.',
        hw: 'Solid-State LiDAR, Stereo Optical Cameras, 9-DOF IMU, Ultrasonic',
        bus: 'I2C, SPI, CAN-FD, GigE Vision',
        freq: '100 Hz – 1000 Hz',
        metric: 'Millimeter precision & sub-5ms latency'
      },
      actuators: {
        title: 'Actuators: The Muscles & Motors',
        desc: 'Electro-mechanical motors and gear trains converting electrical current into controlled rotational torque and linear force.',
        hw: 'Brushless DC Motors (BLDC), Stepper Motors, Harmonic Drives',
        bus: 'PWM, CANopen, EtherCAT, RS-485',
        freq: '1 kHz – 20 kHz PWM Driver Rate',
        metric: 'Torque Density (Nm/kg) & Zero Backlash'
      },
      controller: {
        title: 'Controller: The Computational Brain',
        desc: 'Microcontrollers and Single Board Computers running deterministic Real-Time Operating Systems (RTOS) and ROS 2 navigation pipelines.',
        hw: 'STM32F7 / Jetson Orin / Raspberry Pi 5 / FPGA',
        bus: 'PCIe, USB 3.2, CAN, Ethernet',
        freq: '1 kHz Real-time Control / 2.0+ GHz Planning',
        metric: 'Deterministic execution & fault tolerance'
      },
      power: {
        title: 'Power System: Clean Energy Storage',
        desc: 'High-current rechargeable cells and intelligent switching regulators supplying noise-free power to computers and burst current to motors.',
        hw: '6S–12S LiFePO4 / LiPo Batteries, BMS, Buck/Boost DC-DC Converters',
        bus: 'SMBus, I2C, CAN Battery Telemetry',
        freq: 'Continuous DC delivery with <50 mV ripple',
        metric: 'High C-discharge rate & thermal safety'
      },
      effector: {
        title: 'End Effector: The Hands & Tools',
        desc: 'Specialized tooling attached to the robot wrist for gripping, welding, drilling, or delicate micro-manipulation of objects.',
        hw: 'Parallel 2-Jaw Grippers, Vacuum Suction Cups, Laser Scalpel',
        bus: 'IO-Link, Digital GPIO, Modbus RTU',
        freq: '25 ms mechanical actuation response',
        metric: 'Clamping force control & payload ratio'
      }
    };

    const partBtns = document.querySelectorAll('.part-btn');
    const compTitle = document.getElementById('comp-detail-title');
    const compDesc = document.getElementById('comp-detail-desc');
    const compHw = document.getElementById('comp-spec-hw');
    const compBus = document.getElementById('comp-spec-bus');
    const compFreq = document.getElementById('comp-spec-freq');
    const compMetric = document.getElementById('comp-spec-metric');

    partBtns.forEach((btn) => {
      btn.addEventListener('click', () => {
        partBtns.forEach((b) => b.classList.remove('active'));
        btn.classList.add('active');

        const part = btn.getAttribute('data-part');
        highlightPart(part);

        const data = componentDetails[part];
        if (data) {
          if (compTitle) compTitle.textContent = data.title;
          if (compDesc) compDesc.textContent = data.desc;
          if (compHw) compHw.textContent = data.hw;
          if (compBus) compBus.textContent = data.bus;
          if (compFreq) compFreq.textContent = data.freq;
          if (compMetric) compMetric.textContent = data.metric;
        }
      });
    });

    let sClock = new THREE.Clock();
    function animateStruct() {
      requestAnimationFrame(animateStruct);
      const t = sClock.getElapsedTime();
      robotGroup.rotation.y = Math.sin(t * 0.7) * 0.45;
      robotGroup.position.y = Math.sin(t * 1.2) * 0.04;
      renderer.render(scene, camera);
    }
    animateStruct();

    window.addEventListener('resize', () => {
      if (structCanvas.clientWidth > 0 && structCanvas.clientHeight > 0) {
        camera.aspect = structCanvas.clientWidth / structCanvas.clientHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(structCanvas.clientWidth, structCanvas.clientHeight);
      }
    });
  }

  /* ==========================================================================
     04. SIMULATORS LAB (simulators.html)
     ========================================================================== */

  // --- Ultrasonic HC-SR04 Wave Radar ---
  const sonarCanvas = document.getElementById('sim-sonar-canvas');
  const sonarSlider = document.getElementById('sim-sonar-slider');
  const sonarDistVal = document.getElementById('sim-sonar-dist');
  const sonarTimeVal = document.getElementById('sim-sonar-time');

  if (sonarCanvas) {
    const ctx = sonarCanvas.getContext('2d');
    sonarCanvas.width = sonarCanvas.clientWidth || 360;
    sonarCanvas.height = sonarCanvas.clientHeight || 220;

    let obstacleDist = 120;
    let wavePulse = 0;

    sonarSlider?.addEventListener('input', (e) => {
      obstacleDist = parseInt(e.target.value, 10);
      if (sonarDistVal) sonarDistVal.textContent = `${obstacleDist} cm`;
      const tof = Math.round((2 * obstacleDist) / 0.0343);
      if (sonarTimeVal) sonarTimeVal.textContent = `${tof} µs`;
    });

    function drawSonar() {
      ctx.clearRect(0, 0, sonarCanvas.width, sonarCanvas.height);
      const w = sonarCanvas.width;
      const h = sonarCanvas.height;
      const midY = h / 2;

      // Draw Sensor Transducer
      ctx.fillStyle = '#ffffff';
      ctx.strokeStyle = '#c27803';
      ctx.lineWidth = 2;
      ctx.fillRect(15, midY - 35, 45, 70);
      ctx.strokeRect(15, midY - 35, 45, 70);

      ctx.fillStyle = '#f4efe6';
      ctx.beginPath();
      ctx.arc(37, midY - 18, 14, 0, Math.PI * 2);
      ctx.arc(37, midY + 18, 14, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();

      // Draw Obstacle
      const maxDist = 300;
      const obstacleX = 70 + (obstacleDist / maxDist) * (w - 110);
      ctx.fillStyle = obstacleDist < 40 ? '#dc2626' : '#c27803';
      ctx.fillRect(obstacleX, 20, 16, h - 40);

      // Sound Wave Arcs
      wavePulse = (wavePulse + 3) % (obstacleX - 60);
      ctx.strokeStyle = 'rgba(194, 120, 3, 0.7)';
      ctx.lineWidth = 2;
      for (let i = 0; i < 3; i++) {
        const r = wavePulse - i * 16;
        if (r > 0 && r < obstacleX - 60) {
          ctx.beginPath();
          ctx.arc(60, midY, r, -Math.PI / 4, Math.PI / 4);
          ctx.stroke();
        }
      }

      requestAnimationFrame(drawSonar);
    }
    drawSonar();
  }

  // --- DC Motor & Optical Encoder ---
  const motorCanvas = document.getElementById('sim-motor-canvas');
  const motorSlider = document.getElementById('sim-motor-slider');
  const motorRpmVal = document.getElementById('sim-motor-rpm');
  const motorDirBtn = document.getElementById('sim-motor-dir');
  const motorTicksVal = document.getElementById('sim-motor-ticks');

  if (motorCanvas) {
    const ctx = motorCanvas.getContext('2d');
    motorCanvas.width = motorCanvas.clientWidth || 360;
    motorCanvas.height = motorCanvas.clientHeight || 220;

    let targetRpm = 1500;
    let motorAngle = 0;
    let direction = 1;
    let ticks = 0;

    motorSlider?.addEventListener('input', (e) => {
      targetRpm = parseInt(e.target.value, 10);
      if (motorRpmVal) motorRpmVal.textContent = `${targetRpm} RPM`;
    });

    motorDirBtn?.addEventListener('click', () => {
      direction *= -1;
      motorDirBtn.textContent = direction === 1 ? 'DIR: CLOCKWISE' : 'DIR: COUNTER-CW';
    });

    function drawMotor() {
      ctx.clearRect(0, 0, motorCanvas.width, motorCanvas.height);
      const cx = motorCanvas.width / 2;
      const cy = motorCanvas.height / 2;

      const delta = (targetRpm / 60) * (Math.PI * 2) * 0.016 * direction;
      motorAngle += delta;
      if (targetRpm > 0) {
        ticks += Math.abs(Math.round(delta * 12));
        if (motorTicksVal) motorTicksVal.textContent = ticks;
      }

      // Outer Ring
      ctx.strokeStyle = '#e2d8ca';
      ctx.lineWidth = 10;
      ctx.beginPath();
      ctx.arc(cx, cy, 70, 0, Math.PI * 2);
      ctx.stroke();

      // Slotted Encoder Disc
      ctx.save();
      ctx.translate(cx, cy);
      ctx.rotate(motorAngle);

      ctx.fillStyle = '#ffffff';
      ctx.strokeStyle = '#c27803';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(0, 0, 58, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();

      // Optical Slits
      const slits = 16;
      ctx.fillStyle = '#18181b';
      for (let i = 0; i < slits; i++) {
        ctx.rotate((Math.PI * 2) / slits);
        ctx.fillRect(40, -3, 14, 6);
      }

      ctx.fillStyle = '#c27803';
      ctx.beginPath();
      ctx.arc(0, 0, 14, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();

      requestAnimationFrame(drawMotor);
    }
    drawMotor();
  }

  // --- Servo Motor Horn ---
  const servoCanvas = document.getElementById('sim-servo-canvas');
  const servoSlider = document.getElementById('sim-servo-slider');
  const servoAngleVal = document.getElementById('sim-servo-angle');
  const servoPulseVal = document.getElementById('sim-servo-pulse');

  if (servoCanvas) {
    const ctx = servoCanvas.getContext('2d');
    servoCanvas.width = servoCanvas.clientWidth || 360;
    servoCanvas.height = servoCanvas.clientHeight || 220;

    let targetAngle = 90;
    let currentAngle = 90;

    servoSlider?.addEventListener('input', (e) => {
      targetAngle = parseInt(e.target.value, 10);
      if (servoAngleVal) servoAngleVal.textContent = `${targetAngle}°`;
      const pulse = 1.0 + (targetAngle / 180.0);
      if (servoPulseVal) servoPulseVal.textContent = `${pulse.toFixed(2)} ms`;
    });

    function drawServo() {
      ctx.clearRect(0, 0, servoCanvas.width, servoCanvas.height);
      const cx = servoCanvas.width / 2;
      const cy = servoCanvas.height - 40;

      currentAngle += (targetAngle - currentAngle) * 0.15;

      // Base Housing
      ctx.fillStyle = '#ffffff';
      ctx.strokeStyle = '#e2d8ca';
      ctx.lineWidth = 2;
      ctx.fillRect(cx - 65, cy - 35, 130, 70);
      ctx.strokeRect(cx - 65, cy - 35, 130, 70);

      // Arc
      ctx.strokeStyle = '#e2d8ca';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.arc(cx, cy, 95, Math.PI, 0);
      ctx.stroke();

      // Rotating Horn
      ctx.save();
      ctx.translate(cx, cy);
      const rad = Math.PI - (currentAngle * Math.PI) / 180;
      ctx.rotate(-rad);

      ctx.fillStyle = '#c27803';
      ctx.beginPath();
      ctx.moveTo(-10, 0);
      ctx.lineTo(0, -90);
      ctx.lineTo(10, 0);
      ctx.closePath();
      ctx.fill();

      ctx.fillStyle = '#18181b';
      ctx.beginPath();
      ctx.arc(0, 0, 16, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();

      requestAnimationFrame(drawServo);
    }
    drawServo();
  }

  // --- 2-Link Planar Kinematics Arm ---
  const kinCanvas = document.getElementById('kinematics-interactive-canvas');
  const theta1Slider = document.getElementById('kin-t1-slider');
  const theta2Slider = document.getElementById('kin-t2-slider');
  const theta1Val = document.getElementById('kin-t1-val');
  const theta2Val = document.getElementById('kin-t2-val');
  const kinCoords = document.getElementById('kin-coords-val');

  if (kinCanvas) {
    const ctx = kinCanvas.getContext('2d');
    function resizeKin() {
      kinCanvas.width = kinCanvas.clientWidth;
      kinCanvas.height = kinCanvas.clientHeight;
    }
    resizeKin();
    window.addEventListener('resize', resizeKin);

    let t1 = 45;
    let t2 = 45;
    const l1 = 130;
    const l2 = 110;
    let isDragging = false;

    function updateKinSliders() {
      if (theta1Val) theta1Val.textContent = `${Math.round(t1)}°`;
      if (theta2Val) theta2Val.textContent = `${Math.round(t2)}°`;
      if (theta1Slider) theta1Slider.value = t1;
      if (theta2Slider) theta2Slider.value = t2;
    }

    theta1Slider?.addEventListener('input', (e) => {
      t1 = parseFloat(e.target.value);
      updateKinSliders();
    });

    theta2Slider?.addEventListener('input', (e) => {
      t2 = parseFloat(e.target.value);
      updateKinSliders();
    });

    function solveIK(tx, ty) {
      const dist = Math.sqrt(tx * tx + ty * ty);
      const maxR = l1 + l2 - 1;
      const minR = Math.abs(l1 - l2) + 1;

      let cx = tx;
      let cy = ty;
      if (dist > maxR) {
        cx = (tx / dist) * maxR;
        cy = (ty / dist) * maxR;
      } else if (dist < minR) {
        cx = (tx / dist) * minR;
        cy = (ty / dist) * minR;
      }

      const r = Math.sqrt(cx * cx + cy * cy);
      const cosT2 = (r * r - l1 * l1 - l2 * l2) / (2 * l1 * l2);
      const clamped = Math.max(-1, Math.min(1, cosT2));
      const t2Rad = Math.acos(clamped);

      const alpha = Math.atan2(cy, cx);
      const beta = Math.atan2(l2 * Math.sin(t2Rad), l1 + l2 * Math.cos(t2Rad));
      const t1Rad = alpha - beta;

      t1 = (t1Rad * 180) / Math.PI;
      t2 = (t2Rad * 180) / Math.PI;
      updateKinSliders();
    }

    kinCanvas.addEventListener('mousedown', (e) => {
      isDragging = true;
      handleKinDrag(e);
    });

    window.addEventListener('mousemove', (e) => {
      if (isDragging) handleKinDrag(e);
    });

    window.addEventListener('mouseup', () => {
      isDragging = false;
    });

    function handleKinDrag(e) {
      const rect = kinCanvas.getBoundingClientRect();
      const mouseX = e.clientX - rect.left;
      const mouseY = e.clientY - rect.top;
      const baseX = kinCanvas.width / 2;
      const baseY = kinCanvas.height - 60;
      solveIK(mouseX - baseX, baseY - mouseY);
    }

    function drawKin() {
      ctx.clearRect(0, 0, kinCanvas.width, kinCanvas.height);
      const baseX = kinCanvas.width / 2;
      const baseY = kinCanvas.height - 60;

      const t1Rad = (t1 * Math.PI) / 180;
      const t2Rad = (t2 * Math.PI) / 180;

      const j1X = baseX + l1 * Math.cos(t1Rad);
      const j1Y = baseY - l1 * Math.sin(t1Rad);

      const eeX = j1X + l2 * Math.cos(t1Rad + t2Rad);
      const eeY = j1Y - l2 * Math.sin(t1Rad + t2Rad);

      if (kinCoords) {
        kinCoords.textContent = `(${Math.round(eeX - baseX)}, ${Math.round(baseY - eeY)})`;
      }

      // Reachable boundary
      ctx.strokeStyle = 'rgba(194, 120, 3, 0.15)';
      ctx.setLineDash([4, 6]);
      ctx.beginPath();
      ctx.arc(baseX, baseY, l1 + l2, 0, Math.PI * 2);
      ctx.stroke();
      ctx.setLineDash([]);

      // Base
      ctx.fillStyle = '#18181b';
      ctx.fillRect(baseX - 40, baseY, 80, 24);

      // Links
      ctx.strokeStyle = '#c27803';
      ctx.lineWidth = 10;
      ctx.lineCap = 'round';
      ctx.beginPath();
      ctx.moveTo(baseX, baseY);
      ctx.lineTo(j1X, j1Y);
      ctx.stroke();

      ctx.strokeStyle = '#0284c7';
      ctx.lineWidth = 8;
      ctx.beginPath();
      ctx.moveTo(j1X, j1Y);
      ctx.lineTo(eeX, eeY);
      ctx.stroke();

      // Joints
      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.arc(baseX, baseY, 8, 0, Math.PI * 2);
      ctx.fill();

      ctx.beginPath();
      ctx.arc(j1X, j1Y, 8, 0, Math.PI * 2);
      ctx.fill();

      // End Effector
      ctx.fillStyle = '#dc2626';
      ctx.beginPath();
      ctx.arc(eeX, eeY, 10, 0, Math.PI * 2);
      ctx.fill();

      requestAnimationFrame(drawKin);
    }
    drawKin();
  }

  /* ==========================================================================
     05. DIGITAL ELECTRONICS LAB (electronics.html)
     ========================================================================== */
  const gateTabs = document.querySelectorAll('.gate-tab-btn');
  const switchA = document.getElementById('gate-switch-a');
  const switchB = document.getElementById('gate-switch-b');
  const switchBWrap = document.getElementById('gate-switch-b-wrap');
  const gateLed = document.getElementById('gate-led');
  const gateFormula = document.getElementById('gate-formula');
  const gateTableBody = document.getElementById('gate-table-body');

  let activeGate = 'AND';
  let inA = 0;
  let inB = 0;

  const gatesDef = {
    AND: { formula: 'Y = A · B', eval: (a, b) => (a && b ? 1 : 0), single: false },
    OR: { formula: 'Y = A + B', eval: (a, b) => (a || b ? 1 : 0), single: false },
    NOT: { formula: 'Y = Ā', eval: (a) => (a ? 0 : 1), single: true },
    NAND: { formula: 'Y = (A · B)̄', eval: (a, b) => (!(a && b) ? 1 : 0), single: false },
    NOR: { formula: 'Y = (A + B)̄', eval: (a, b) => (!(a || b) ? 1 : 0), single: false },
    XOR: { formula: 'Y = A ⊕ B', eval: (a, b) => (a !== b ? 1 : 0), single: false }
  };

  function updateLogic() {
    const cur = gatesDef[activeGate];
    if (!cur) return;

    if (switchBWrap) switchBWrap.style.display = cur.single ? 'none' : 'block';
    if (gateFormula) gateFormula.textContent = cur.formula;

    const out = cur.eval(inA, inB);
    if (gateLed) {
      if (out === 1) {
        gateLed.classList.add('on');
      } else {
        gateLed.classList.remove('on');
      }
    }

    if (gateTableBody) {
      gateTableBody.innerHTML = '';
      const rows = cur.single
        ? [{ a: 0, b: '-' }, { a: 1, b: '-' }]
        : [{ a: 0, b: 0 }, { a: 0, b: 1 }, { a: 1, b: 0 }, { a: 1, b: 1 }];

      rows.forEach((r) => {
        const val = cur.eval(r.a, r.b === '-' ? 0 : r.b);
        const isActive = r.a === inA && (cur.single || r.b === inB);
        const tr = document.createElement('tr');
        if (isActive) tr.classList.add('active-row');
        tr.innerHTML = `<td>${r.a}</td><td>${r.b}</td><td>${val}</td>`;
        gateTableBody.appendChild(tr);
      });
    }
  }

  gateTabs.forEach((tab) => {
    tab.addEventListener('click', () => {
      gateTabs.forEach((t) => t.classList.remove('active'));
      tab.classList.add('active');
      activeGate = tab.getAttribute('data-gate');
      updateLogic();
    });
  });

  switchA?.addEventListener('click', () => {
    inA = inA === 0 ? 1 : 0;
    switchA.textContent = `INPUT A: ${inA}`;
    switchA.classList.toggle('active', inA === 1);
    updateLogic();
  });

  switchB?.addEventListener('click', () => {
    inB = inB === 0 ? 1 : 0;
    switchB.textContent = `INPUT B: ${inB}`;
    switchB.classList.toggle('active', inB === 1);
    updateLogic();
  });

  updateLogic();

  // PWM Oscilloscope
  const pwmCanvas = document.getElementById('pwm-scope-canvas');
  const pwmSlider = document.getElementById('pwm-duty-slider');
  const pwmDutyLabel = document.getElementById('pwm-duty-label');
  const pwmVoltLabel = document.getElementById('pwm-volt-label');

  if (pwmCanvas) {
    const ctx = pwmCanvas.getContext('2d');
    pwmCanvas.width = pwmCanvas.clientWidth || 380;
    pwmCanvas.height = pwmCanvas.clientHeight || 180;

    let duty = 50;
    let offset = 0;

    pwmSlider?.addEventListener('input', (e) => {
      duty = parseInt(e.target.value, 10);
      if (pwmDutyLabel) pwmDutyLabel.textContent = `${duty}%`;
      const v = (12.0 * (duty / 100.0)).toFixed(2);
      if (pwmVoltLabel) pwmVoltLabel.textContent = `${v} V`;
    });

    function drawPWM() {
      ctx.clearRect(0, 0, pwmCanvas.width, pwmCanvas.height);
      const w = pwmCanvas.width;
      const h = pwmCanvas.height;
      const topY = 35;
      const botY = h - 35;
      const period = 120;
      const highW = (duty / 100) * period;

      // Subtle grid
      ctx.strokeStyle = '#f1ece1';
      ctx.lineWidth = 1;
      for (let x = 0; x < w; x += 30) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, h);
        ctx.stroke();
      }

      offset = (offset + 2) % period;

      ctx.strokeStyle = '#c27803';
      ctx.lineWidth = 3;
      ctx.beginPath();

      let x = -period + offset;
      while (x < w + period) {
        ctx.moveTo(x, botY);
        ctx.lineTo(x, topY);
        ctx.lineTo(x + highW, topY);
        ctx.lineTo(x + highW, botY);
        ctx.lineTo(x + period, botY);
        x += period;
      }
      ctx.stroke();

      requestAnimationFrame(drawPWM);
    }
    drawPWM();
  }

  /* ==========================================================================
     05-B. H-BRIDGE TRANSISTOR MOTOR DRIVER SIMULATOR
     ========================================================================== */
  const hbCanvas = document.getElementById('hbridge-canvas');
  const hbBtns = document.querySelectorAll('.hbridge-mode-btn');
  const hbQ1 = document.getElementById('hb-q1-state');
  const hbQ2 = document.getElementById('hb-q2-state');
  const hbQ3 = document.getElementById('hb-q3-state');
  const hbQ4 = document.getElementById('hb-q4-state');
  const hbDesc = document.getElementById('hb-desc-text');

  if (hbCanvas) {
    const ctx = hbCanvas.getContext('2d');
    hbCanvas.width = hbCanvas.clientWidth || 400;
    hbCanvas.height = hbCanvas.clientHeight || 260;

    let hbMode = 'fwd'; // fwd, rev, brake, coast
    let currentAnimOffset = 0;

    const hbStates = {
      fwd: {
        q1: true, q2: false, q3: false, q4: true,
        desc: '<strong>Forward Mode:</strong> High-side switch Q1 and low-side switch Q4 are closed. Current flows from +12V through the motor armature from Left to Right, spinning the motor clockwise.'
      },
      rev: {
        q1: false, q2: true, q3: true, q4: false,
        desc: '<strong>Reverse Mode:</strong> High-side switch Q3 and low-side switch Q2 are closed. Current flows from +12V through the motor from Right to Left, reversing motor torque and rotation.'
      },
      brake: {
        q1: false, q2: true, q3: false, q4: true,
        desc: '<strong>Dynamic Braking:</strong> Low-side switches Q2 and Q4 are closed, shorting the motor terminals to Ground. The motor acts as a generator, dissipating kinetic energy as magnetic counter-torque.'
      },
      coast: {
        q1: false, q2: false, q3: false, q4: false,
        desc: '<strong>Coast Mode (High-Z):</strong> All four MOSFET switches are open. No current flows, allowing the motor rotor to freewheel with zero electrical resistance.'
      }
    };

    function updateHBridgeUI() {
      const s = hbStates[hbMode];
      if (hbQ1) { hbQ1.textContent = s.q1 ? 'ON (CLOSED)' : 'OFF (OPEN)'; hbQ1.className = s.q1 ? 'font-bold text-green' : 'font-bold text-red'; }
      if (hbQ2) { hbQ2.textContent = s.q2 ? 'ON (CLOSED)' : 'OFF (OPEN)'; hbQ2.className = s.q2 ? 'font-bold text-green' : 'font-bold text-red'; }
      if (hbQ3) { hbQ3.textContent = s.q3 ? 'ON (CLOSED)' : 'OFF (OPEN)'; hbQ3.className = s.q3 ? 'font-bold text-green' : 'font-bold text-red'; }
      if (hbQ4) { hbQ4.textContent = s.q4 ? 'ON (CLOSED)' : 'OFF (OPEN)'; hbQ4.className = s.q4 ? 'font-bold text-green' : 'font-bold text-red'; }
      if (hbDesc) hbDesc.innerHTML = s.desc;
    }

    hbBtns.forEach((btn) => {
      btn.addEventListener('click', () => {
        hbBtns.forEach((b) => b.classList.remove('active'));
        btn.classList.add('active');
        hbMode = btn.getAttribute('data-hbridge');
        updateHBridgeUI();
      });
    });

    function drawHBridge() {
      ctx.clearRect(0, 0, hbCanvas.width, hbCanvas.height);
      const w = hbCanvas.width;
      const h = hbCanvas.height;
      const midX = w / 2;
      const midY = h / 2;

      // Draw Power Rails
      ctx.strokeStyle = '#c27803';
      ctx.lineWidth = 3;
      // Top Rail +12V
      ctx.beginPath();
      ctx.moveTo(40, 25);
      ctx.lineTo(w - 40, 25);
      ctx.stroke();

      ctx.fillStyle = '#c27803';
      ctx.font = 'bold 11px sans-serif';
      ctx.fillText('+12V VCC', 40, 18);

      // Bottom Rail GND
      ctx.strokeStyle = '#18181b';
      ctx.beginPath();
      ctx.moveTo(40, h - 25);
      ctx.lineTo(w - 40, h - 25);
      ctx.stroke();
      ctx.fillStyle = '#18181b';
      ctx.fillText('GND (0V)', 40, h - 12);

      // Branch Lines
      const leftX = midX - 90;
      const rightX = midX + 90;

      ctx.strokeStyle = '#94a3b8';
      ctx.lineWidth = 2;
      ctx.beginPath();
      // Left leg
      ctx.moveTo(leftX, 25); ctx.lineTo(leftX, h - 25);
      // Right leg
      ctx.moveTo(rightX, 25); ctx.lineTo(rightX, h - 25);
      // Motor Bridge Crossbar
      ctx.moveTo(leftX, midY); ctx.lineTo(rightX, midY);
      ctx.stroke();

      // Draw Central Motor Symbol
      ctx.fillStyle = '#ffffff';
      ctx.strokeStyle = '#18181b';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(midX, midY, 26, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();

      ctx.fillStyle = '#c27803';
      ctx.font = 'bold 16px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('M', midX, midY + 6);
      ctx.textAlign = 'start';

      // Draw 4 Transistor Switches (Q1, Q2, Q3, Q4)
      const st = hbStates[hbMode];
      function drawMOSFET(x, y, label, isOn) {
        ctx.fillStyle = isOn ? '#10b981' : '#ef4444';
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(x, y, 14, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();

        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 9px sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText(label, x, y + 3);
        ctx.textAlign = 'start';
      }

      drawMOSFET(leftX, 65, 'Q1', st.q1);
      drawMOSFET(leftX, h - 65, 'Q2', st.q2);
      drawMOSFET(rightX, 65, 'Q3', st.q3);
      drawMOSFET(rightX, h - 65, 'Q4', st.q4);

      // Current Flow Animation Dots
      currentAnimOffset = (currentAnimOffset + 2) % 30;
      ctx.fillStyle = '#0284c7';

      if (hbMode === 'fwd') {
        // Draw current from +12V -> Q1 -> Motor (L->R) -> Q4 -> GND
        const dotX = leftX + (currentAnimOffset / 30) * (rightX - leftX);
        ctx.beginPath();
        ctx.arc(dotX, midY, 4, 0, Math.PI * 2);
        ctx.fill();
      } else if (hbMode === 'rev') {
        // Current from +12V -> Q3 -> Motor (R->L) -> Q2 -> GND
        const dotX = rightX - (currentAnimOffset / 30) * (rightX - leftX);
        ctx.beginPath();
        ctx.arc(dotX, midY, 4, 0, Math.PI * 2);
        ctx.fill();
      }

      requestAnimationFrame(drawHBridge);
    }
    drawHBridge();
  }

  /* ==========================================================================
     05-C. ADC QUANTIZATION & BIT RESOLUTION SIMULATOR
     ========================================================================== */
  const adcCanvas = document.getElementById('adc-canvas');
  const adcSlider = document.getElementById('adc-voltage-slider');
  const adcBitBtns = document.querySelectorAll('.adc-bit-btn');
  const adcVoltsVal = document.getElementById('adc-volts-val');
  const adcBinaryReg = document.getElementById('adc-binary-reg');
  const adcDecVal = document.getElementById('adc-dec-val');
  const adcLSBVal = document.getElementById('adc-lsb-val');

  if (adcCanvas) {
    const ctx = adcCanvas.getContext('2d');
    adcCanvas.width = adcCanvas.clientWidth || 380;
    adcCanvas.height = adcCanvas.clientHeight || 220;

    let adcBits = 8;
    let inputVoltage = 1.65; // V
    const vRef = 3.30;

    function updateADC() {
      const maxCounts = Math.pow(2, adcBits) - 1;
      const digitalCount = Math.min(maxCounts, Math.max(0, Math.round((inputVoltage / vRef) * maxCounts)));
      const lsbMv = (vRef / maxCounts) * 1000;

      if (adcVoltsVal) adcVoltsVal.textContent = `${inputVoltage.toFixed(2)} V`;
      if (adcDecVal) adcDecVal.textContent = digitalCount;
      if (adcLSBVal) adcLSBVal.textContent = `${lsbMv.toFixed(2)} mV`;

      const binStr = digitalCount.toString(2).padStart(adcBits, '0');
      if (adcBinaryReg) adcBinaryReg.textContent = `0b${binStr}`;
    }

    adcSlider?.addEventListener('input', (e) => {
      inputVoltage = parseInt(e.target.value, 10) / 100.0;
      updateADC();
    });

    adcBitBtns.forEach((btn) => {
      btn.addEventListener('click', () => {
        adcBitBtns.forEach((b) => b.classList.remove('active'));
        btn.classList.add('active');
        adcBits = parseInt(btn.getAttribute('data-bits'), 10);
        updateADC();
      });
    });

    function drawADC() {
      ctx.clearRect(0, 0, adcCanvas.width, adcCanvas.height);
      const w = adcCanvas.width;
      const h = adcCanvas.height;
      const pad = 35;

      // Draw Grid Axes
      ctx.strokeStyle = '#e2d8ca';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(pad, pad); ctx.lineTo(pad, h - pad);
      ctx.lineTo(w - pad, h - pad);
      ctx.stroke();

      // Axis labels
      ctx.fillStyle = '#71717a';
      ctx.font = '10px monospace';
      ctx.fillText('3.3V', 5, pad + 10);
      ctx.fillText('0.0V', 5, h - pad);
      ctx.fillText('Time (t)', w - 45, h - pad + 15);

      // Draw Continuous Analog Sine Wave
      ctx.strokeStyle = 'rgba(2, 132, 199, 0.4)';
      ctx.lineWidth = 2;
      ctx.beginPath();
      for (let x = pad; x <= w - pad; x++) {
        const norm = (x - pad) / (w - 2 * pad);
        const yVal = Math.sin(norm * Math.PI * 2) * 0.4 + 0.5; // 0 to 1
        const canvasY = (h - pad) - yVal * (h - 2 * pad);
        if (x === pad) ctx.moveTo(x, canvasY);
        else ctx.lineTo(x, canvasY);
      }
      ctx.stroke();

      // Draw Quantized Staircase Steps
      const levels = Math.min(32, Math.pow(2, adcBits)); // cap visual steps
      ctx.strokeStyle = '#c27803';
      ctx.lineWidth = 2;
      ctx.beginPath();
      for (let x = pad; x <= w - pad; x += 6) {
        const norm = (x - pad) / (w - 2 * pad);
        const yVal = Math.sin(norm * Math.PI * 2) * 0.4 + 0.5;
        const qVal = Math.round(yVal * (levels - 1)) / (levels - 1);
        const canvasY = (h - pad) - qVal * (h - 2 * pad);
        if (x === pad) ctx.moveTo(x, canvasY);
        else ctx.lineTo(x, canvasY);
      }
      ctx.stroke();

      // Highlight Current Voltage Input Line
      const curY = (h - pad) - (inputVoltage / vRef) * (h - 2 * pad);
      ctx.strokeStyle = '#ef4444';
      ctx.setLineDash([4, 4]);
      ctx.beginPath();
      ctx.moveTo(pad, curY);
      ctx.lineTo(w - pad, curY);
      ctx.stroke();
      ctx.setLineDash([]);

      requestAnimationFrame(drawADC);
    }
    drawADC();
    updateADC();
  }

  /* ==========================================================================
     05-D. QUADRATURE OPTICAL ENCODER 2-BIT STATE MACHINE
     ========================================================================== */
  const quadCanvas = document.getElementById('quadrature-canvas');
  const quadDirBtn = document.getElementById('quad-dir-toggle-btn');
  const qState00 = document.getElementById('qstate-00');
  const qState01 = document.getElementById('qstate-01');
  const qState11 = document.getElementById('qstate-11');
  const qState10 = document.getElementById('qstate-10');

  if (quadCanvas) {
    const ctx = quadCanvas.getContext('2d');
    quadCanvas.width = quadCanvas.clientWidth || 360;
    quadCanvas.height = quadCanvas.clientHeight || 200;

    let isCW = true;
    let phaseOffset = 0;

    quadDirBtn?.addEventListener('click', () => {
      isCW = !isCW;
      quadDirBtn.textContent = isCW ? 'DIRECTION: CW (A LEADS B)' : 'DIRECTION: CCW (B LEADS A)';
    });

    function drawQuadrature() {
      ctx.clearRect(0, 0, quadCanvas.width, quadCanvas.height);
      const w = quadCanvas.width;
      const h = quadCanvas.height;
      const period = 80;

      phaseOffset += isCW ? 1.5 : -1.5;
      if (phaseOffset > period * 10) phaseOffset = 0;

      // Channel A (Top)
      ctx.fillStyle = '#c27803';
      ctx.font = 'bold 11px monospace';
      ctx.fillText('CHANNEL A', 15, 35);

      ctx.strokeStyle = '#c27803';
      ctx.lineWidth = 2.5;
      ctx.beginPath();
      for (let x = 0; x < w; x++) {
        const sample = Math.floor((x + phaseOffset) / (period / 2)) % 2;
        const y = sample === 1 ? 45 : 85;
        if (x === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      ctx.stroke();

      // Channel B (Bottom, 90° Phase Shifted)
      ctx.fillStyle = '#0284c7';
      ctx.fillText('CHANNEL B (90° SHIFT)', 15, 125);

      const shift = period / 4; // 90 degrees
      ctx.strokeStyle = '#0284c7';
      ctx.beginPath();
      for (let x = 0; x < w; x++) {
        const sample = Math.floor((x + phaseOffset + shift) / (period / 2)) % 2;
        const y = sample === 1 ? 135 : 175;
        if (x === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      ctx.stroke();

      // Determine active state at sample center
      const centerX = w / 2;
      const curA = Math.floor((centerX + phaseOffset) / (period / 2)) % 2;
      const curB = Math.floor((centerX + phaseOffset + shift) / (period / 2)) % 2;
      const code = `${curA}${curB}`;

      // Update State Machine Circles
      [qState00, qState01, qState11, qState10].forEach(el => el?.classList.remove('active'));
      if (code === '00') qState00?.classList.add('active');
      else if (code === '01') qState01?.classList.add('active');
      else if (code === '11') qState11?.classList.add('active');
      else if (code === '10') qState10?.classList.add('active');

      requestAnimationFrame(drawQuadrature);
    }
    drawQuadrature();
  }

  /* ==========================================================================
     05-E. DIGITAL BUS WAVEFORM ANALYZER (CAN, SPI, I2C, UART)
     ========================================================================== */
  const busCanvas = document.getElementById('bus-scope-canvas');
  const busBtns = document.querySelectorAll('.bus-tab-btn');
  const busTitle = document.getElementById('bus-title-text');
  const busDesc = document.getElementById('bus-desc-text');

  if (busCanvas) {
    const ctx = busCanvas.getContext('2d');
    busCanvas.width = busCanvas.clientWidth || 400;
    busCanvas.height = busCanvas.clientHeight || 240;

    let activeBus = 'can';
    let busOffset = 0;

    const busInfo = {
      can: {
        title: 'CAN Bus (Controller Area Network)',
        desc: 'Differential two-wire bus (CAN_High and CAN_Low). When dominant (0), CAN_H rises to 3.5V and CAN_L drops to 1.5V (2.0V differential). When recessive (1), both stay at 2.5V (0V differential). Eliminates electromagnetic interference from motor windings.'
      },
      spi: {
        title: 'SPI (Serial Peripheral Interface - 4 Wire)',
        desc: 'High-speed synchronous serial bus with Master Out Slave In (MOSI), Master In Slave Out (MISO), Serial Clock (SCK), and Chip Select (CS active-low). Operates up to 50+ MHz for streaming IMU and sensor data.'
      },
      i2c: {
        title: 'I2C (Inter-Integrated Circuit - 2 Wire)',
        desc: 'Open-drain synchronous bus using Serial Data (SDA) and Serial Clock (SCL) with pull-up resistors. Supports 7-bit hardware addressing, allowing up to 127 sensor modules to share just 2 microcontroller pins.'
      },
      uart: {
        title: 'UART (Universal Asynchronous Receiver-Transmitter)',
        desc: 'Point-to-point asynchronous packet protocol with configurable baud rates (e.g. 115200 bps). Each byte is framed by a Start Bit (LOW), 8 Data Bits (LSB first), optional Parity, and a Stop Bit (HIGH).'
      }
    };

    busBtns.forEach((btn) => {
      btn.addEventListener('click', () => {
        busBtns.forEach((b) => b.classList.remove('active'));
        btn.classList.add('active');
        activeBus = btn.getAttribute('data-bus');

        const info = busInfo[activeBus];
        if (info) {
          if (busTitle) busTitle.textContent = info.title;
          if (busDesc) busDesc.textContent = info.desc;
        }
      });
    });

    function drawBusScope() {
      ctx.clearRect(0, 0, busCanvas.width, busCanvas.height);
      const w = busCanvas.width;
      const h = busCanvas.height;

      busOffset = (busOffset + 2) % 160;

      ctx.font = 'bold 10px monospace';

      if (activeBus === 'can') {
        // CAN_H & CAN_L
        ctx.fillStyle = '#c27803'; ctx.fillText('CAN_HIGH (3.5V / 2.5V)', 15, 30);
        ctx.fillStyle = '#0284c7'; ctx.fillText('CAN_LOW  (1.5V / 2.5V)', 15, 100);
        ctx.fillStyle = '#10b981'; ctx.fillText('DIFFERENTIAL (CAN_H - CAN_L)', 15, 175);

        // CAN_H line
        ctx.strokeStyle = '#c27803'; ctx.lineWidth = 2; ctx.beginPath();
        for (let x = 0; x < w; x++) {
          const bit = Math.floor((x + busOffset) / 25) % 2;
          const y = bit === 0 ? 45 : 60; // 3.5V dominant vs 2.5V recessive
          if (x === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
        }
        ctx.stroke();

        // CAN_L line (mirror)
        ctx.strokeStyle = '#0284c7'; ctx.beginPath();
        for (let x = 0; x < w; x++) {
          const bit = Math.floor((x + busOffset) / 25) % 2;
          const y = bit === 0 ? 135 : 120; // 1.5V dominant vs 2.5V recessive
          if (x === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
        }
        ctx.stroke();

        // Differential
        ctx.strokeStyle = '#10b981'; ctx.beginPath();
        for (let x = 0; x < w; x++) {
          const bit = Math.floor((x + busOffset) / 25) % 2;
          const y = bit === 0 ? 195 : 220;
          if (x === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
        }
        ctx.stroke();
      } else if (activeBus === 'spi') {
        // SCK & MOSI & CS
        ctx.fillStyle = '#71717a'; ctx.fillText('CS (CHIP SELECT)', 15, 30);
        ctx.fillStyle = '#c27803'; ctx.fillText('SCK (CLOCK 10 MHz)', 15, 95);
        ctx.fillStyle = '#0284c7'; ctx.fillText('MOSI (SERIAL DATA)', 15, 165);

        // CS active low
        ctx.strokeStyle = '#71717a'; ctx.lineWidth = 2; ctx.beginPath();
        ctx.moveTo(0, 50); ctx.lineTo(w, 50); ctx.stroke();

        // Clock
        ctx.strokeStyle = '#c27803'; ctx.beginPath();
        for (let x = 0; x < w; x++) {
          const bit = Math.floor((x + busOffset) / 10) % 2;
          const y = bit === 1 ? 105 : 130;
          if (x === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
        }
        ctx.stroke();

        // MOSI
        ctx.strokeStyle = '#0284c7'; ctx.beginPath();
        for (let x = 0; x < w; x++) {
          const bit = Math.floor((x + busOffset) / 20) % 2;
          const y = bit === 1 ? 175 : 205;
          if (x === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
        }
        ctx.stroke();
      } else {
        // I2C or UART
        ctx.fillStyle = '#c27803'; ctx.fillText(activeBus === 'i2c' ? 'SCL (CLOCK)' : 'TX DATA LINE', 15, 40);
        ctx.fillStyle = '#0284c7'; ctx.fillText(activeBus === 'i2c' ? 'SDA (OPEN-DRAIN DATA)' : 'RX LINE', 15, 130);

        ctx.strokeStyle = '#c27803'; ctx.lineWidth = 2; ctx.beginPath();
        for (let x = 0; x < w; x++) {
          const bit = Math.floor((x + busOffset) / 15) % 2;
          const y = bit === 1 ? 55 : 85;
          if (x === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
        }
        ctx.stroke();

        ctx.strokeStyle = '#0284c7'; ctx.beginPath();
        for (let x = 0; x < w; x++) {
          const bit = Math.floor((x + busOffset) / 25) % 2;
          const y = bit === 1 ? 145 : 180;
          if (x === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
        }
        ctx.stroke();
      }

      requestAnimationFrame(drawBusScope);
    }
    drawBusScope();
  }

  /* ==========================================================================
     05-F. ROBOTIC E-STOP DUAL-CHANNEL SAFETY INTERLOCK
     ========================================================================== */
  const estopBtn = document.getElementById('estop-btn');
  const curtainBtn = document.getElementById('curtain-btn');
  const deadmanBtn = document.getElementById('deadman-btn');
  const relayStatus = document.getElementById('safety-relay-status');
  const relayLed = document.getElementById('safety-relay-led');

  let sEstop = true;
  let sCurtain = true;
  let sDeadman = true;

  function updateSafetyRelay() {
    const isSafe = sEstop && sCurtain && sDeadman;
    if (relayStatus) {
      relayStatus.textContent = isSafe ? 'ARMED // MOTORS ENABLED' : 'TRIPPED // MOTORS CUT (SAFE)';
      relayStatus.className = isSafe ? 'font-orbitron text-base font-bold text-green' : 'font-orbitron text-base font-bold text-red';
    }
    if (relayLed) {
      relayLed.className = isSafe ? 'w-7 h-7 rounded-full bg-emerald-500 shadow-md' : 'w-7 h-7 rounded-full bg-red-500 shadow-md animate-pulse';
    }
  }

  estopBtn?.addEventListener('click', () => {
    sEstop = !sEstop;
    estopBtn.textContent = sEstop ? 'HEALTHY (1)' : 'PRESSED (0)';
    estopBtn.className = sEstop ? 'px-3 py-1 bg-green-100 text-green-800 rounded font-mono font-bold text-xs' : 'px-3 py-1 bg-red-100 text-red-800 rounded font-mono font-bold text-xs';
    updateSafetyRelay();
  });

  curtainBtn?.addEventListener('click', () => {
    sCurtain = !sCurtain;
    curtainBtn.textContent = sCurtain ? 'CLEAR (1)' : 'BLOCKED (0)';
    curtainBtn.className = sCurtain ? 'px-3 py-1 bg-green-100 text-green-800 rounded font-mono font-bold text-xs' : 'px-3 py-1 bg-red-100 text-red-800 rounded font-mono font-bold text-xs';
    updateSafetyRelay();
  });

  deadmanBtn?.addEventListener('click', () => {
    sDeadman = !sDeadman;
    deadmanBtn.textContent = sDeadman ? 'ENGAGED (1)' : 'RELEASED (0)';
    deadmanBtn.className = sDeadman ? 'px-3 py-1 bg-green-100 text-green-800 rounded font-mono font-bold text-xs' : 'px-3 py-1 bg-red-100 text-red-800 rounded font-mono font-bold text-xs';
    updateSafetyRelay();
  });

  /* ==========================================================================
     06. QUIZ MODULE (quiz.html)
     ========================================================================== */
  const quizData = [
    {
      q: 'What is the primary objective of the "Sense-Plan-Act" cycle in robotics?',
      opts: [
        'A structural analysis method for 3D printing filaments.',
        'The foundational closed-loop feedback pipeline for autonomous interaction.',
        'A cryptographic handshake algorithm used on CAN buses.',
        'A manufacturing protocol for industrial painting robots.'
      ],
      ans: 1,
      expl: 'Sense-Plan-Act forms the core feedback cycle: perceive environment through sensors, solve trajectory/inverse kinematics, and execute actions via motor actuators.'
    },
    {
      q: 'In a 2-joint planar robotic arm, what technique calculates joint angles from a target coordinate (x, y)?',
      opts: [
        'Fourier Transform Frequency Analysis',
        'Inverse Kinematics via the Law of Cosines',
        'Direct Integration of Euler Angles',
        'Bernoulli Fluid Flow Synthesis'
      ],
      ans: 1,
      expl: 'Inverse Kinematics (IK) employs the Law of Cosines to calculate the required shoulder and elbow angles needed to reach a specific coordinate (x, y).'
    },
    {
      q: 'What is the standard PWM pulse duration for a hobby servo motor at neutral (90°)?',
      opts: [
        '0.50 ms',
        '1.50 ms',
        '5.00 ms',
        '20.00 ms'
      ],
      ans: 1,
      expl: 'In a 50 Hz PWM period (20 ms), standard hobby servos map 1.0 ms to 0°, 1.5 ms to neutral 90°, and 2.0 ms to 180°.'
    },
    {
      q: 'Why is CAN (Controller Area Network) bus widely adopted in industrial robotics?',
      opts: [
        'It requires fiber-optic laser transceivers.',
        'Differential signaling provides exceptional immunity against electromagnetic noise.',
        'It eliminates the need for microcontroller firmware.',
        'It delivers wireless inductive power to end-effectors.'
      ],
      ans: 1,
      expl: 'CAN bus uses differential pair wiring (CAN_H / CAN_L), rejecting common-mode electrical noise generated by high-power electric motors.'
    },
    {
      q: 'How does LiDAR generate a 3D point cloud of an obstacle field?',
      opts: [
        'By measuring the Time-of-Flight (ToF) of pulsed laser beams reflected off surfaces.',
        'By measuring gravitational anomalies in nearby objects.',
        'By capturing ambient infrared thermal heat.',
        'By modulating radio frequencies inside coaxial cables.'
      ],
      ans: 0,
      expl: 'LiDAR pulses thousands of infrared laser beams per second, timing the nanosecond flight duration to triangulate millimeter-accurate 3D point clouds.'
    }
  ];

  let qIdx = 0;
  let qScore = 0;

  const qText = document.getElementById('quiz-q-text');
  const qOpts = document.getElementById('quiz-options-list');
  const qProg = document.getElementById('quiz-progress-text');
  const qBar = document.getElementById('quiz-progress-bar');
  const qExpl = document.getElementById('quiz-expl-box');
  const qNext = document.getElementById('quiz-next-btn');
  const qCard = document.getElementById('quiz-card-wrap');
  const qResults = document.getElementById('quiz-results-wrap');
  const qFinalScore = document.getElementById('quiz-final-score-val');
  const qRetake = document.getElementById('quiz-retake-btn');

  function loadQuestion() {
    if (qIdx >= quizData.length) {
      qCard?.classList.add('hidden');
      qResults?.classList.remove('hidden');
      if (qFinalScore) qFinalScore.textContent = `${qScore} / 5`;
      if (typeof confetti === 'function' && qScore >= 3) {
        confetti({
          particleCount: 80,
          spread: 60,
          origin: { y: 0.6 },
          colors: ['#c27803', '#0284c7', '#059669']
        });
      }
      return;
    }

    const cur = quizData[qIdx];
    if (qText) qText.textContent = cur.q;
    if (qProg) qProg.textContent = `QUESTION 0${qIdx + 1} OF 05`;
    if (qBar) qBar.style.width = `${((qIdx + 1) / 5) * 100}%`;

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
          const all = qOpts.querySelectorAll('.quiz-option-cream');
          all.forEach((b, i) => {
            b.disabled = true;
            if (i === cur.ans) b.classList.add('correct');
            else if (i === idx) b.classList.add('incorrect');
          });

          if (idx === cur.ans) {
            qScore++;
          }

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
    qIdx++;
    loadQuestion();
  });

  qRetake?.addEventListener('click', () => {
    qIdx = 0;
    qScore = 0;
    qResults?.classList.add('hidden');
    qCard?.classList.remove('hidden');
    loadQuestion();
  });

  if (qText) {
    loadQuestion();
  }

});
