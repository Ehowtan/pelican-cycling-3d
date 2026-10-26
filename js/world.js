/**
 * Pelican Cycling 3D - Coastal World & Environment Engine
 * Manages:
 * - Infinite scrolling coastal highway & scenery recycling
 * - Procedural ocean waves & reflections
 * - Day / Sunset / Cyber Night lighting atmospheres
 * - Particle effects (Sea spray, speed lines, catch splashes)
 */

class WorldManager {
  constructor(scene) {
    this.scene = scene;
    this.speed = 18; // Default cycling speed (m/s)
    this.distanceTraveled = 0;
    this.currentMode = 'day';

    // Scenery pools
    this.roadSegments = [];
    this.guardrails = [];
    this.sceneryProps = []; // Trees, rocks, signs
    this.clouds = [];
    this.particles = [];

    this.roadWidth = 6.0;
    this.segmentLength = 30;
    this.numSegments = 6;

    this.initLights();
    this.initRoadAndTerrain();
    this.initOcean();
    this.initClouds();
    this.initParticleSystems();
    this.setAtmosphere('day');
  }

  // ---------------------------------------------
  // 1. LIGHTING & ENVIRONMENT
  // ---------------------------------------------
  initLights() {
    this.hemiLight = new THREE.HemisphereLight(0xffffff, 0x444444, 0.7);
    this.hemiLight.position.set(0, 50, 0);
    this.scene.add(this.hemiLight);

    this.sunLight = new THREE.DirectionalLight(0xfffaed, 1.2);
    this.sunLight.position.set(25, 45, 30);
    this.sunLight.castShadow = true;
    this.sunLight.shadow.mapSize.width = 2048;
    this.sunLight.shadow.mapSize.height = 2048;
    this.sunLight.shadow.camera.near = 0.5;
    this.sunLight.shadow.camera.far = 150;
    const d = 25;
    this.sunLight.shadow.camera.left = -d;
    this.sunLight.shadow.camera.right = d;
    this.sunLight.shadow.camera.top = d;
    this.sunLight.shadow.camera.bottom = -d;
    this.scene.add(this.sunLight);

    this.ambientLight = new THREE.AmbientLight(0xddeeff, 0.4);
    this.scene.add(this.ambientLight);

    // Fog for coastal depth
    this.scene.fog = new THREE.FogExp2(0xcce2ff, 0.009);
  }

  setAtmosphere(mode) {
    this.currentMode = mode;
    if (mode === 'day') {
      this.scene.background = new THREE.Color(0x87ceeb);
      this.scene.fog.color.setHex(0xbde0fe);
      this.scene.fog.density = 0.007;

      this.hemiLight.color.setHex(0xffffff);
      this.hemiLight.groundColor.setHex(0x3d7068);
      this.hemiLight.intensity = 0.75;

      this.sunLight.color.setHex(0xfffaed);
      this.sunLight.intensity = 1.3;
      this.sunLight.position.set(30, 45, 25);

      this.ambientLight.color.setHex(0xe0f2fe);
      this.ambientLight.intensity = 0.45;

      if (this.oceanMat) {
        this.oceanMat.color.setHex(0x0077b6);
        this.oceanMat.roughness = 0.15;
      }
    } else if (mode === 'sunset') {
      this.scene.background = new THREE.Color(0xfb8500);
      this.scene.fog.color.setHex(0xffb703);
      this.scene.fog.density = 0.009;

      this.hemiLight.color.setHex(0xffb703);
      this.hemiLight.groundColor.setHex(0x5c2c16);
      this.hemiLight.intensity = 0.65;

      this.sunLight.color.setHex(0xff5400);
      this.sunLight.intensity = 1.6;
      this.sunLight.position.set(40, 20, 20);

      this.ambientLight.color.setHex(0x9d4edd);
      this.ambientLight.intensity = 0.4;

      if (this.oceanMat) {
        this.oceanMat.color.setHex(0xd00000);
        this.oceanMat.roughness = 0.2;
      }
    } else if (mode === 'cyber') {
      this.scene.background = new THREE.Color(0x050518);
      this.scene.fog.color.setHex(0x0a0c27);
      this.scene.fog.density = 0.012;

      this.hemiLight.color.setHex(0x7209b7);
      this.hemiLight.groundColor.setHex(0x03045e);
      this.hemiLight.intensity = 0.4;

      this.sunLight.color.setHex(0x4cc9f0);
      this.sunLight.intensity = 0.9;
      this.sunLight.position.set(20, 35, 10);

      this.ambientLight.color.setHex(0x3a0ca3);
      this.ambientLight.intensity = 0.5;

      if (this.oceanMat) {
        this.oceanMat.color.setHex(0x03045e);
        this.oceanMat.roughness = 0.08;
      }
    }
  }

  // ---------------------------------------------
  // 2. ROADWAY & RECYCLED CHUNKS
  // ---------------------------------------------
  initRoadAndTerrain() {
    this.roadMat = new THREE.MeshStandardMaterial({
      color: 0x333338,
      roughness: 0.85,
      metalness: 0.1
    });

    this.shoulderMat = new THREE.MeshStandardMaterial({
      color: 0xd4a373, // Sandy shoulder
      roughness: 0.95
    });

    this.lineWhiteMat = new THREE.MeshBasicMaterial({ color: 0xffffff });
    this.lineYellowMat = new THREE.MeshBasicMaterial({ color: 0xffb703 });

    this.guardrailMat = new THREE.MeshStandardMaterial({
      color: 0xd8e2dc,
      metalness: 0.8,
      roughness: 0.25
    });

    // Create segments
    for (let i = 0; i < this.numSegments; i++) {
      const zOffset = (i - 1) * this.segmentLength;
      const segment = this.createRoadSegment(zOffset);
      this.roadSegments.push(segment);
      this.scene.add(segment);
    }

    // Add persistent lighthouse on the coastal promontory
    const lh = ModelBuilder.createLighthouse();
    this.lighthouse = lh.lighthouse;
    this.lighthouseBeam = lh.beam;
    this.lighthouse.position.set(28, 4, 60);
    this.scene.add(this.lighthouse);
  }

  createRoadSegment(z) {
    const group = new THREE.Group();
    group.position.z = z;

    // Asphalt road surface
    const roadGeo = new THREE.PlaneGeometry(this.roadWidth, this.segmentLength);
    const roadMesh = new THREE.Mesh(roadGeo, this.roadMat);
    roadMesh.rotation.x = -Math.PI / 2;
    roadMesh.receiveShadow = true;
    group.add(roadMesh);

    // Sandy road shoulder (Left side towards ocean)
    const shoulderGeo = new THREE.PlaneGeometry(3.5, this.segmentLength);
    const shoulderMesh = new THREE.Mesh(shoulderGeo, this.shoulderMat);
    shoulderMesh.rotation.x = -Math.PI / 2;
    shoulderMesh.position.set(-this.roadWidth * 0.5 - 1.75, -0.05, 0);
    shoulderMesh.receiveShadow = true;
    group.add(shoulderMesh);

    // Land hillside (Right side)
    const hillGeo = new THREE.PlaneGeometry(12, this.segmentLength, 4, 4);
    const pos = hillGeo.attributes.position;
    for (let j = 0; j < pos.count; j++) {
      const x = pos.getX(j);
      pos.setZ(j, Math.max(0, (x + 6) * 0.6) + Math.random() * 0.3);
    }
    hillGeo.computeVertexNormals();
    const hillMat = new THREE.MeshStandardMaterial({ color: 0x588157, roughness: 0.9 });
    const hillMesh = new THREE.Mesh(hillGeo, hillMat);
    hillMesh.rotation.x = -Math.PI / 2;
    hillMesh.position.set(this.roadWidth * 0.5 + 6, 0.02, 0);
    hillMesh.receiveShadow = true;
    group.add(hillMesh);

    // White dashed center line
    const numDashes = 5;
    const dashLength = 2.5;
    for (let d = 0; d < numDashes; d++) {
      const dashGeo = new THREE.PlaneGeometry(0.18, dashLength);
      const dash = new THREE.Mesh(dashGeo, this.lineWhiteMat);
      dash.rotation.x = -Math.PI / 2;
      dash.position.set(0, 0.005, -this.segmentLength / 2 + d * (this.segmentLength / numDashes) + 1.5);
      group.add(dash);
    }

    // Solid Yellow Shoulder Lines
    [-this.roadWidth * 0.48, this.roadWidth * 0.48].forEach(x => {
      const lineGeo = new THREE.PlaneGeometry(0.16, this.segmentLength);
      const line = new THREE.Mesh(lineGeo, this.lineYellowMat);
      line.rotation.x = -Math.PI / 2;
      line.position.set(x, 0.005, 0);
      group.add(line);
    });

    // Guardrail on ocean side
    const railX = -this.roadWidth * 0.5 - 0.3;
    const railBeamGeo = new THREE.BoxGeometry(0.12, 0.25, this.segmentLength);
    const railBeam = new THREE.Mesh(railBeamGeo, this.guardrailMat);
    railBeam.position.set(railX, 0.75, 0);
    group.add(railBeam);

    // Guardrail posts
    for (let p = 0; p < 6; p++) {
      const postGeo = new THREE.CylinderGeometry(0.04, 0.04, 0.85, 8);
      const post = new THREE.Mesh(postGeo, this.guardrailMat);
      post.position.set(railX, 0.42, -this.segmentLength / 2 + p * (this.segmentLength / 6));
      group.add(post);
    }

    // Populate Props (Palm trees, boulders, road signs)
    if (Math.random() > 0.3) {
      const palm = ModelBuilder.createPalmTree();
      palm.position.set(this.roadWidth * 0.5 + 2.5 + Math.random() * 3, 0, (Math.random() - 0.5) * this.segmentLength * 0.8);
      palm.rotation.y = Math.random() * Math.PI * 2;
      group.add(palm);
    }

    if (Math.random() > 0.6) {
      const sign = ModelBuilder.createRoadSign();
      sign.position.set(-this.roadWidth * 0.5 - 1.2, 0, (Math.random() - 0.5) * this.segmentLength * 0.7);
      sign.rotation.y = Math.PI * 0.15;
      group.add(sign);
    }

    // Coastal rocks near ocean
    if (Math.random() > 0.4) {
      const rockGeo = new THREE.DodecahedronGeometry(0.8 + Math.random() * 0.9, 1);
      const rockMat = new THREE.MeshStandardMaterial({ color: 0x4a4e69, roughness: 0.9 });
      const rock = new THREE.Mesh(rockGeo, rockMat);
      rock.position.set(-this.roadWidth * 0.5 - 4 - Math.random() * 3, -0.2, (Math.random() - 0.5) * this.segmentLength * 0.8);
      rock.rotation.set(Math.random(), Math.random(), Math.random());
      group.add(rock);
    }

    return group;
  }

  // ---------------------------------------------
  // 3. DYNAMIC OCEAN WITH PROCEDURAL WAVES
  // ---------------------------------------------
  initOcean() {
    this.oceanGeo = new THREE.PlaneGeometry(160, 240, 60, 80);
    this.oceanMat = new THREE.MeshStandardMaterial({
      color: 0x0077b6,
      roughness: 0.15,
      metalness: 0.4,
      transparent: true,
      opacity: 0.92
    });

    this.ocean = new THREE.Mesh(this.oceanGeo, this.oceanMat);
    this.ocean.rotation.x = -Math.PI / 2;
    this.ocean.position.set(-65, -0.6, 40);
    this.ocean.receiveShadow = true;
    this.scene.add(this.ocean);

    // Save initial vertex positions for wave calculations
    this.wavePosAttr = this.oceanGeo.attributes.position;
    this.waveOriginalZ = new Float32Array(this.wavePosAttr.count);
    for (let i = 0; i < this.wavePosAttr.count; i++) {
      this.waveOriginalZ[i] = this.wavePosAttr.getZ(i);
    }
  }

  updateOceanWaves(time) {
    const pos = this.wavePosAttr;
    const orig = this.waveOriginalZ;
    for (let i = 0; i < pos.count; i++) {
      const u = pos.getX(i);
      const v = pos.getY(i);
      // Multi-octave wave equation
      const wave =
        Math.sin(u * 0.08 + time * 2.2) * 0.45 +
        Math.cos(v * 0.06 + time * 1.6) * 0.35 +
        Math.sin((u + v) * 0.12 + time * 3.0) * 0.2;
      pos.setZ(i, orig[i] + wave);
    }
    pos.needsUpdate = true;
    this.oceanGeo.computeVertexNormals();
  }

  // ---------------------------------------------
  // 4. CLOUDS & SKY
  // ---------------------------------------------
  initClouds() {
    const cloudMat = new THREE.MeshStandardMaterial({
      color: 0xffffff,
      roughness: 0.95,
      transparent: true,
      opacity: 0.85
    });

    for (let i = 0; i < 16; i++) {
      const cGroup = new THREE.Group();
      const numPuffs = 4 + Math.floor(Math.random() * 4);
      for (let p = 0; p < numPuffs; p++) {
        const puffGeo = new THREE.DodecahedronGeometry(2.5 + Math.random() * 2.5, 1);
        const puff = new THREE.Mesh(puffGeo, cloudMat);
        puff.position.set((p - numPuffs / 2) * 2.5, (Math.random() - 0.5) * 1.5, (Math.random() - 0.5) * 2);
        cGroup.add(puff);
      }
      cGroup.position.set(
        (Math.random() - 0.5) * 180,
        25 + Math.random() * 20,
        -40 + Math.random() * 200
      );
      this.clouds.push(cGroup);
      this.scene.add(cGroup);
    }
  }

  // ---------------------------------------------
  // 5. PARTICLE SYSTEMS (Speed Lines, Water Splash)
  // ---------------------------------------------
  initParticleSystems() {
    // 1. Sea Spray / Coastal Mist Particles
    const mistCount = 200;
    const mistGeo = new THREE.BufferGeometry();
    const mistPositions = new Float32Array(mistCount * 3);
    for (let i = 0; i < mistCount * 3; i += 3) {
      mistPositions[i] = -8 - Math.random() * 20; // Near shoreline
      mistPositions[i + 1] = 0.2 + Math.random() * 3.5;
      mistPositions[i + 2] = -20 + Math.random() * 120;
    }
    mistGeo.setAttribute('position', new THREE.BufferAttribute(mistPositions, 3));
    const mistMat = new THREE.PointsMaterial({
      color: 0xffffff,
      size: 0.45,
      transparent: true,
      opacity: 0.4
    });
    this.mistPoints = new THREE.Points(mistGeo, mistMat);
    this.scene.add(this.mistPoints);

    // 2. Sprint Speed Lines
    const speedLineCount = 60;
    const speedGeo = new THREE.BufferGeometry();
    const speedPositions = new Float32Array(speedLineCount * 6);
    speedGeo.setAttribute('position', new THREE.BufferAttribute(speedPositions, 3));
    const speedMat = new THREE.LineBasicMaterial({
      color: 0xffffff,
      transparent: true,
      opacity: 0.0
    });
    this.speedLines = new THREE.LineSegments(speedGeo, speedMat);
    this.scene.add(this.speedLines);
  }

  spawnCatchSplash(pos, isGolden = false) {
    const count = isGolden ? 32 : 18;
    const splashMat = new THREE.MeshBasicMaterial({
      color: isGolden ? 0xffea00 : 0x00f5d4,
      transparent: true,
      opacity: 0.9
    });

    for (let i = 0; i < count; i++) {
      const geo = new THREE.SphereGeometry(0.06 + Math.random() * 0.06, 6, 6);
      const mesh = new THREE.Mesh(geo, splashMat);
      mesh.position.copy(pos);

      const angle = Math.random() * Math.PI * 2;
      const speed = 2.5 + Math.random() * 4.5;
      const vel = new THREE.Vector3(
        Math.cos(angle) * speed * 0.8,
        3.5 + Math.random() * 4.0,
        Math.sin(angle) * speed * 0.8 - 4
      );

      this.particles.push({
        mesh,
        vel,
        life: 0.8,
        maxLife: 0.8
      });
      this.scene.add(mesh);
    }
  }

  updateParticles(dt) {
    for (let i = this.particles.length - 1; i >= 0; i--) {
      const p = this.particles[i];
      p.life -= dt;
      if (p.life <= 0) {
        this.scene.remove(p.mesh);
        p.mesh.geometry.dispose();
        this.particles.splice(i, 1);
        continue;
      }
      p.vel.y -= 15.0 * dt; // Gravity
      p.mesh.position.addScaledVector(p.vel, dt);
      p.mesh.scale.setScalar(p.life / p.maxLife);
    }

    // Scroll mist along road
    const mistPos = this.mistPoints.geometry.attributes.position;
    for (let i = 2; i < mistPos.count * 3; i += 3) {
      mistPos.array[i] -= this.speed * dt;
      if (mistPos.array[i] < -25) {
        mistPos.array[i] += 140;
      }
    }
    mistPos.needsUpdate = true;
  }

  // ---------------------------------------------
  // 6. MAIN UPDATE LOOP
  // ---------------------------------------------
  update(dt, speedRatio = 1.0, time = 0) {
    const currentSpeed = this.speed * speedRatio;
    const moveDist = currentSpeed * dt;
    this.distanceTraveled += moveDist;

    // Scroll and recycle road chunks
    const totalSpan = this.segmentLength * this.numSegments;
    const recycleThreshold = -35;

    for (let i = 0; i < this.roadSegments.length; i++) {
      const seg = this.roadSegments[i];
      seg.position.z -= moveDist;

      if (seg.position.z < recycleThreshold) {
        seg.position.z += totalSpan;
      }
    }

    // Rotate lighthouse beam
    if (this.lighthouseBeam) {
      this.lighthouseBeam.rotation.z += dt * 1.2;
    }

    // Update ocean waves
    this.updateOceanWaves(time);

    // Update particles
    this.updateParticles(dt);

    // Drift clouds
    this.clouds.forEach(cloud => {
      cloud.position.z -= (currentSpeed * 0.2 + 1.2) * dt;
      if (cloud.position.z < -60) {
        cloud.position.z += 260;
        cloud.position.x = (Math.random() - 0.5) * 180;
      }
    });

    // Speed lines opacity when sprinting
    if (this.speedLines) {
      const targetOpacity = speedRatio > 1.3 ? 0.65 : 0.0;
      this.speedLines.material.opacity += (targetOpacity - this.speedLines.material.opacity) * dt * 8;
    }
  }
}

window.WorldManager = WorldManager;
