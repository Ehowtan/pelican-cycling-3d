/**
 * Pelican Cycling 3D - Main Application Entry
 * Orchestrates Scene, Cameras, Input Listeners, and Game Loop
 */

class PelicanApp {
  constructor() {
    this.container = document.getElementById('canvas-container');
    this.clock = new THREE.Clock();
    this.cameraMode = 'chase'; // 'chase', 'pov', 'side', 'orbit'

    this.initThree();
    this.initSceneObjects();
    this.initCameras();
    this.initControls();
    this.initUI();

    this.animate = this.animate.bind(this);
    requestAnimationFrame(this.animate);
  }

  // ---------------------------------------------
  // 1. THREE.JS INITIALIZATION
  // ---------------------------------------------
  initThree() {
    this.scene = new THREE.Scene();

    this.renderer = new THREE.WebGLRenderer({
      antialias: true,
      powerPreference: 'high-performance'
    });
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 1.15;
    this.renderer.outputEncoding = THREE.sRGBEncoding;

    this.container.appendChild(this.renderer.domElement);

    window.addEventListener('resize', () => this.onWindowResize(), false);
  }

  // ---------------------------------------------
  // 2. SCENE OBJECTS
  // ---------------------------------------------
  initSceneObjects() {
    // 1. World & Ocean
    this.world = new WorldManager(this.scene);

    // 2. Pelican & Bicycle
    this.pelicanData = ModelBuilder.createPelicanAndBike();
    this.scene.add(this.pelicanData.root);

    // 3. Gameplay Manager
    this.game = new GameManager(this.scene, this.world, this.pelicanData);
  }

  // ---------------------------------------------
  // 3. CAMERAS & ORBIT CONTROLS
  // ---------------------------------------------
  initCameras() {
    this.camera = new THREE.PerspectiveCamera(
      55,
      window.innerWidth / window.innerHeight,
      0.1,
      400
    );

    // OrbitControls for Free Camera mode
    if (window.THREE && THREE.OrbitControls) {
      this.orbitControls = new THREE.OrbitControls(this.camera, this.renderer.domElement);
      this.orbitControls.enableDamping = true;
      this.orbitControls.dampingFactor = 0.05;
      this.orbitControls.maxPolarAngle = Math.PI * 0.48; // Don't go below ground
      this.orbitControls.minDistance = 2.0;
      this.orbitControls.maxDistance = 45.0;
      this.orbitControls.enabled = false;
    }

    this.updateCameraPlacement(0);
  }

  setCameraMode(mode) {
    this.cameraMode = mode;
    if (this.orbitControls) {
      if (mode === 'orbit') {
        this.orbitControls.enabled = true;
        this.orbitControls.target.set(this.pelicanData.root.position.x, 1.2, 0);
        this.camera.position.set(this.pelicanData.root.position.x + 3.5, 2.5, -4.5);
      } else {
        this.orbitControls.enabled = false;
      }
    }
  }

  updateCameraPlacement(dt) {
    const px = this.pelicanData.root.position.x;

    if (this.cameraMode === 'chase') {
      // Third person follow behind bike
      const targetPos = new THREE.Vector3(px * 0.65, 2.6, -4.6);
      const lookAtPos = new THREE.Vector3(px, 1.4, 3.8);

      if (dt > 0) {
        this.camera.position.lerp(targetPos, dt * 7.0);
      } else {
        this.camera.position.copy(targetPos);
      }
      this.camera.lookAt(lookAtPos);
    } else if (this.cameraMode === 'pov') {
      // First person from behind sunglasses!
      this.camera.position.set(px, 1.72, 0.42);
      this.camera.lookAt(px, 1.45, 15);
    } else if (this.cameraMode === 'side') {
      // Cinematic low-angle tracking side shot
      this.camera.position.set(px - 3.8, 1.1, 0.8);
      this.camera.lookAt(px, 1.2, 1.5);
    } else if (this.cameraMode === 'orbit') {
      if (this.orbitControls) {
        this.orbitControls.target.set(px, 1.2, 0);
        this.orbitControls.update();
      }
    }
  }

  // ---------------------------------------------
  // 4. INPUT LISTENERS
  // ---------------------------------------------
  initControls() {
    // Keyboard listeners
    window.addEventListener('keydown', (e) => {
      // Resume audio context on first interaction
      window.soundEngine.resume();

      switch (e.code) {
        case 'KeyA':
        case 'ArrowLeft':
          this.game.steerLeft();
          break;
        case 'KeyD':
        case 'ArrowRight':
          this.game.steerRight();
          break;
        case 'KeyW':
        case 'ArrowUp':
        case 'ShiftLeft':
        case 'ShiftRight':
          this.game.setBoost(true);
          break;
        case 'KeyS':
        case 'ArrowDown':
          this.game.setBrake(true);
          break;
        case 'Space':
          e.preventDefault();
          this.game.triggerCatch();
          break;
        case 'KeyB':
          this.game.ringBell();
          break;
        case 'KeyC':
          this.cycleCamera();
          break;
        case 'KeyM':
          this.toggleMusic();
          break;
      }
    });

    window.addEventListener('keyup', (e) => {
      switch (e.code) {
        case 'KeyW':
        case 'ArrowUp':
        case 'ShiftLeft':
        case 'ShiftRight':
          this.game.setBoost(false);
          break;
        case 'KeyS':
        case 'ArrowDown':
          this.game.setBrake(false);
          break;
      }
    });

    // Mouse / Touch Steering & Catch
    let isDragging = false;
    const handlePointerMove = (clientX) => {
      if (this.cameraMode === 'orbit') return;
      const normalizedX = (clientX / window.innerWidth) * 2 - 1;
      this.game.setTargetX(normalizedX);
    };

    window.addEventListener('pointerdown', (e) => {
      // Ignore clicks on UI elements
      if (e.target.closest('.hud-overlay') || e.target.closest('.touch-btn')) return;
      window.soundEngine.resume();
      isDragging = true;
      handlePointerMove(e.clientX);
      this.game.triggerCatch(); // Clicking snaps the beak!
    });

    window.addEventListener('pointermove', (e) => {
      if (isDragging) {
        handlePointerMove(e.clientX);
      }
    });

    window.addEventListener('pointerup', () => {
      isDragging = false;
    });

    // Touch events for mobile steering
    window.addEventListener('touchmove', (e) => {
      if (e.touches.length > 0 && this.cameraMode !== 'orbit') {
        const touch = e.touches[0];
        if (!touch.target.closest('.hud-overlay') && !touch.target.closest('.touch-btn')) {
          handlePointerMove(touch.clientX);
        }
      }
    }, { passive: true });
  }

  cycleCamera() {
    const modes = ['chase', 'pov', 'side', 'orbit'];
    const nextIdx = (modes.indexOf(this.cameraMode) + 1) % modes.length;
    this.setCameraMode(modes[nextIdx]);

    const btn = document.getElementById('btn-cam');
    if (btn) {
      const labels = {
        chase: '📷 追随视角',
        pov: '😎 墨镜第一人称',
        side: '🎬 电影侧拍',
        orbit: '🌐 360°自由航拍'
      };
      btn.textContent = labels[modes[nextIdx]];
    }
  }

  toggleMusic() {
    const playing = window.soundEngine.toggleMusic();
    const btn = document.getElementById('btn-music');
    if (btn) {
      btn.textContent = playing ? '🎵 音乐: 开' : '🎵 音乐: 关';
      btn.classList.toggle('active', playing);
    }
  }

  // ---------------------------------------------
  // 5. UI BINDINGS
  // ---------------------------------------------
  initUI() {
    // Camera Button
    const btnCam = document.getElementById('btn-cam');
    if (btnCam) {
      btnCam.addEventListener('click', () => this.cycleCamera());
    }

    // Music Button
    const btnMusic = document.getElementById('btn-music');
    if (btnMusic) {
      btnMusic.addEventListener('click', () => this.toggleMusic());
    }

    // Sound / Mute Button
    const btnMute = document.getElementById('btn-sound');
    if (btnMute) {
      btnMute.addEventListener('click', () => {
        const soundOn = window.soundEngine.toggleMute();
        btnMute.textContent = soundOn ? '🔊 音效: 开' : '🔇 音效: 静音';
        btnMute.classList.toggle('active', soundOn);
      });
    }

    // Atmosphere Buttons (Day, Sunset, Cyber)
    ['day', 'sunset', 'cyber'].forEach(mode => {
      const btn = document.getElementById(`btn-${mode}`);
      if (btn) {
        btn.addEventListener('click', () => {
          this.world.setAtmosphere(mode);
          document.querySelectorAll('.theme-btn').forEach(b => b.classList.remove('active'));
          btn.classList.add('active');
        });
      }
    });

    // Touch Buttons for Mobile
    const btnTouchCatch = document.getElementById('touch-catch');
    if (btnTouchCatch) {
      btnTouchCatch.addEventListener('pointerdown', (e) => {
        e.stopPropagation();
        window.soundEngine.resume();
        this.game.triggerCatch();
      });
    }

    const btnTouchBell = document.getElementById('touch-bell');
    if (btnTouchBell) {
      btnTouchBell.addEventListener('pointerdown', (e) => {
        e.stopPropagation();
        this.game.ringBell();
      });
    }

    const btnTouchBoost = document.getElementById('touch-boost');
    if (btnTouchBoost) {
      btnTouchBoost.addEventListener('pointerdown', (e) => {
        e.stopPropagation();
        this.game.setBoost(true);
      });
      btnTouchBoost.addEventListener('pointerup', (e) => {
        e.stopPropagation();
        this.game.setBoost(false);
      });
      btnTouchBoost.addEventListener('pointercancel', (e) => {
        e.stopPropagation();
        this.game.setBoost(false);
      });
    }

    const btnTouchLeft = document.getElementById('touch-left');
    if (btnTouchLeft) {
      btnTouchLeft.addEventListener('pointerdown', (e) => {
        e.stopPropagation();
        this.game.steerLeft();
      });
    }

    const btnTouchRight = document.getElementById('touch-right');
    if (btnTouchRight) {
      btnTouchRight.addEventListener('pointerdown', (e) => {
        e.stopPropagation();
        this.game.steerRight();
      });
    }

    // Fullscreen Button
    const btnFullscreen = document.getElementById('btn-fullscreen');
    if (btnFullscreen) {
      btnFullscreen.addEventListener('click', () => {
        if (!document.fullscreenElement) {
          document.documentElement.requestFullscreen().catch(() => {});
          btnFullscreen.textContent = '⤓ 退出全屏';
        } else {
          document.exitFullscreen().catch(() => {});
          btnFullscreen.textContent = '⤢ 全屏体验';
        }
      });
    }

    // Help Dialog Trigger
    const btnHelp = document.getElementById('btn-help');
    const helpModal = document.getElementById('help-modal');
    const btnCloseHelp = document.getElementById('btn-close-help');
    if (btnHelp && helpModal) {
      btnHelp.addEventListener('click', () => {
        helpModal.classList.add('visible');
      });
    }
    if (btnCloseHelp && helpModal) {
      btnCloseHelp.addEventListener('click', () => {
        helpModal.classList.remove('visible');
      });
    }
  }

  onWindowResize() {
    this.camera.aspect = window.innerWidth / window.innerHeight;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(window.innerWidth, window.innerHeight);
  }

  // ---------------------------------------------
  // 6. ANIMATION & RENDER LOOP
  // ---------------------------------------------
  animate() {
    requestAnimationFrame(this.animate);

    const dt = Math.min(this.clock.getDelta(), 0.1);
    const elapsedTime = this.clock.getElapsedTime();

    // Update Game Logic & Pelican
    const currentSpeed = this.game.update(dt, elapsedTime);

    // Update World & Ocean Waves
    this.world.update(dt, this.game.speedMultiplier, elapsedTime);

    // Update Dynamic Camera
    this.updateCameraPlacement(dt);

    // Render Scene
    this.renderer.render(this.scene, this.camera);
  }
}

// Start app once DOM is ready
window.addEventListener('DOMContentLoaded', () => {
  window.pelicanApp = new PelicanApp();
});
