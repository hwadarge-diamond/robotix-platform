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

    // Smooth Cursor Tracking
    let targetYaw = 0;
    let targetPitch = 0;

    window.addEventListener('mousemove', (e) => {
      const normX = (e.clientX / window.innerWidth) * 2 - 1;
      const normY = -(e.clientY / window.innerHeight) * 2 + 1;
      targetYaw = normX * 0.4;
      targetPitch = normY * 0.25;
    }, { passive: true });

    let clock = new THREE.Clock();
    function animateHeroArm() {
      requestAnimationFrame(animateHeroArm);
      const time = clock.getElapsedTime();

      // Gentle organic idle breathing
      const breath = Math.sin(time * 1.4) * 0.06;
      armRoot.rotation.y += (targetYaw + breath - armRoot.rotation.y) * 0.05;
      lowerArmGroup.rotation.z += (-0.3 + targetPitch * 0.3 + breath - lowerArmGroup.rotation.z) * 0.05;
      elbowGroup.rotation.z += (0.65 - targetPitch * 0.2 - breath - elbowGroup.rotation.z) * 0.05;
      wristGroup.rotation.z += (-0.3 + breath - wristGroup.rotation.z) * 0.05;

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
