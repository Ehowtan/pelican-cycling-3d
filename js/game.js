/**
 * Pelican Cycling 3D - Gameplay & Catch Mechanics
 * Controls:
 * - Pelican Steering, Pedaling, and Leaning
 * - Dynamic Red Scarf procedural vertex fluttering
 * - Beak Snapping & Fish Catching Collision Detection
 * - Fish Spawning & Jumping Physics
 * - Score, Combo, and Speed Management
 */

class GameManager {
  constructor(scene, world, pelicanData) {
    this.scene = scene;
    this.world = world;
    this.p = pelicanData;

    // Lanes: Left, Center, Right
    this.lanes = [-1.7, 0, 1.7];
    this.targetLaneX = 0;
    this.currentX = 0;
    this.leanAngle = 0;

    // Movement & Speed
    this.baseSpeed = 16.0; // km/h scaled
    this.speedMultiplier = 1.0;
    this.isBoosting = false;
    this.isBraking = false;

    // Catching Action
    this.isCatching = false;
    this.catchTimer = 0;
    this.catchDuration = 0.35;
    this.swallowTimer = 0;

    // Score & Stats
    this.fishCaught = 0;
    this.score = 0;
    this.combo = 1;
    this.comboTimer = 0;
    this.maxComboTimer = 4.0; // 4 seconds to keep combo alive

    // Active Fish pool
    this.activeFish = [];
    this.fishSpawnTimer = 0;
    this.fishSpawnInterval = 1.6; // Seconds between fish spawns

    // Floating text notifications
    this.popupContainer = document.getElementById('popups');
  }

  // ---------------------------------------------
  // 1. INPUT HANDLING
  // ---------------------------------------------
  steerLeft() {
    const currentIdx = this.getClosestLaneIndex();
    if (currentIdx > 0) {
      this.targetLaneX = this.lanes[currentIdx - 1];
    }
  }

  steerRight() {
    const currentIdx = this.getClosestLaneIndex();
    if (currentIdx < this.lanes.length - 1) {
      this.targetLaneX = this.lanes[currentIdx + 1];
    }
  }

  setTargetX(normalizedX) {
    // Smooth analog control from mouse/touch (-1 to +1)
    const clamped = Math.max(-1, Math.min(1, normalizedX));
    this.targetLaneX = clamped * 2.1;
  }

  getClosestLaneIndex() {
    let closest = 1;
    let minDist = 999;
    this.lanes.forEach((x, idx) => {
      const d = Math.abs(this.currentX - x);
      if (d < minDist) {
        minDist = d;
        closest = idx;
      }
    });
    return closest;
  }

  triggerCatch() {
    if (this.isCatching) return;
    this.isCatching = true;
    this.catchTimer = this.catchDuration;
  }

  ringBell() {
    window.soundEngine.playBell();
    this.showPopup('🔔 DING DING!', '#ffd166');

    // Ringing bell startles fish to jump higher!
    this.activeFish.forEach(f => {
      if (f.mesh.position.z > 0 && f.mesh.position.z < 35) {
        f.jumpVelocity = Math.max(f.jumpVelocity, 7.5);
      }
    });
  }

  setBoost(boosting) {
    if (boosting && !this.isBoosting) {
      window.soundEngine.playBoostWhoosh();
      this.showPopup('⚡ SPRINT BOOST!', '#06d6a0');
    }
    this.isBoosting = boosting;
  }

  setBrake(braking) {
    this.isBraking = braking;
  }

  // ---------------------------------------------
  // 2. FISH SPAWNING & LEAPING PHYSICS
  // ---------------------------------------------
  spawnFish() {
    const isGolden = Math.random() < 0.18;
    const fishData = ModelBuilder.createFish(isGolden);
    const mesh = fishData.fishGroup;

    // Choose target lane
    const laneIdx = Math.floor(Math.random() * this.lanes.length);
    const targetX = this.lanes[laneIdx];

    // Start slightly from ocean side or high arc
    const startX = targetX - 1.2 + Math.random() * 2.4;
    mesh.position.set(startX, 0.4 + Math.random() * 0.8, 65 + Math.random() * 15);
    this.scene.add(mesh);

    this.activeFish.push({
      mesh,
      tailFin: fishData.tailFin,
      isGolden,
      targetX,
      yPos: mesh.position.y,
      jumpVelocity: 5.5 + Math.random() * 3.5,
      swimPhase: Math.random() * Math.PI * 2,
      caught: false
    });
  }

  updateFish(dt, currentSpeed) {
    this.fishSpawnTimer += dt;
    if (this.fishSpawnTimer >= this.fishSpawnInterval) {
      this.fishSpawnTimer = 0;
      this.spawnFish();
      // Increase spawn rate slightly over distance
      this.fishSpawnInterval = Math.max(0.9, 1.6 - (this.fishCaught * 0.015));
    }

    const pelicanBeakPos = new THREE.Vector3(
      this.currentX,
      1.15,
      0.95 // Tip of the pelican bill
    );

    for (let i = this.activeFish.length - 1; i >= 0; i--) {
      const f = this.activeFish[i];

      // Move toward pelican along Z
      f.mesh.position.z -= currentSpeed * dt;

      // Parabolic jump animation
      f.swimPhase += dt * 8.0;
      f.jumpVelocity -= 9.8 * dt;
      f.mesh.position.y += f.jumpVelocity * dt;

      // Water surface bounce if it hits the ground
      if (f.mesh.position.y < 0.35) {
        f.mesh.position.y = 0.35;
        f.jumpVelocity = 4.0 + Math.random() * 2.0; // Rebound
      }

      // Wiggle tail fin
      if (f.tailFin) {
        f.tailFin.rotation.z = Math.sin(f.swimPhase) * 0.45;
      }

      // Subtle wobble
      f.mesh.rotation.y = Math.sin(f.swimPhase * 0.5) * 0.25;
      f.mesh.rotation.x = Math.atan2(f.jumpVelocity, currentSpeed * 0.5) * 0.5;

      // Catch Detection!
      if (!f.caught) {
        const dist = f.mesh.position.distanceTo(pelicanBeakPos);
        const catchThreshold = this.isCatching ? 1.65 : 0.95; // Bigger catch hitbox when snapping beak!

        if (dist < catchThreshold) {
          this.catchFishSuccess(f, i);
          continue;
        }
      }

      // Despawn behind camera
      if (f.mesh.position.z < -15) {
        this.scene.remove(f.mesh);
        this.activeFish.splice(i, 1);
        // Break combo if fish was missed
        if (!f.caught && this.combo > 1) {
          this.combo = 1;
          this.updateHUD();
        }
      }
    }
  }

  // ---------------------------------------------
  // 3. SUCCESSFUL FISH CATCH!
  // ---------------------------------------------
  catchFishSuccess(fish, index) {
    fish.caught = true;
    this.fishCaught++;

    // Combo system
    this.comboTimer = this.maxComboTimer;
    const basePts = fish.isGolden ? 300 : 100;
    const earnedPts = basePts * this.combo;
    this.score += earnedPts;

    // SFX
    window.soundEngine.playCatchFish(fish.isGolden);

    // Particle splash
    this.world.spawnCatchSplash(fish.mesh.position, fish.isGolden);

    // Pelican Gullet Swallow Reaction!
    this.swallowTimer = 0.55;

    // Floating text
    const label = fish.isGolden
      ? `🌟 GOLDEN TUNA! +${earnedPts}`
      : `🐟 CATCH! +${earnedPts}`;
    this.showPopup(label, fish.isGolden ? '#ffd166' : '#00f5d4');

    if (this.combo >= 2) {
      this.showPopup(`🔥 COMBO x${this.combo}!`, '#ff006e');
    }

    this.combo++;

    // Remove fish mesh
    this.scene.remove(fish.mesh);
    this.activeFish.splice(index, 1);

    this.updateHUD();
  }

  showPopup(text, color = '#ffffff') {
    if (!this.popupContainer) return;
    const el = document.createElement('div');
    el.className = 'game-popup';
    el.style.color = color;
    el.textContent = text;
    this.popupContainer.appendChild(el);

    setTimeout(() => {
      if (el.parentNode) {
        el.parentNode.removeChild(el);
      }
    }, 1100);
  }

  updateHUD() {
    const elFish = document.getElementById('fish-count');
    const elScore = document.getElementById('score-count');
    const elSpeed = document.getElementById('speed-val');
    const elDist = document.getElementById('dist-val');
    const elCombo = document.getElementById('combo-badge');

    if (elFish) elFish.textContent = this.fishCaught;
    if (elScore) elScore.textContent = this.score;
    if (elSpeed) {
      const displaySpeed = Math.round(this.baseSpeed * this.speedMultiplier * 2.2);
      elSpeed.textContent = displaySpeed;
    }
    if (elDist) {
      elDist.textContent = (this.world.distanceTraveled / 1000).toFixed(2);
    }
    if (elCombo) {
      if (this.combo > 2) {
        elCombo.style.display = 'inline-flex';
        elCombo.textContent = `COMBO x${this.combo - 1}`;
      } else {
        elCombo.style.display = 'none';
      }
    }
  }

  // ---------------------------------------------
  // 4. MAIN PELICAN ANIMATION & PROCEDURAL PHYSICS
  // ---------------------------------------------
  update(dt, time) {
    // 1. Calculate current speed
    let targetMultiplier = 1.0;
    if (this.isBoosting) targetMultiplier = 1.65;
    if (this.isBraking) targetMultiplier = 0.55;
    this.speedMultiplier += (targetMultiplier - this.speedMultiplier) * dt * 4.0;
    const effectiveSpeed = this.baseSpeed * this.speedMultiplier;

    // 2. Smooth Steering & Bike Leaning
    const steerSpeed = 6.5;
    this.currentX += (this.targetLaneX - this.currentX) * dt * steerSpeed;
    this.p.root.position.x = this.currentX;

    const targetLean = (this.currentX - this.targetLaneX) * 0.18;
    this.leanAngle += (targetLean - this.leanAngle) * dt * 8.0;
    this.p.root.rotation.z = this.leanAngle;
    this.p.root.rotation.y = -this.leanAngle * 0.4;

    // 3. Wheels & Cranks Rotation
    const wheelCircumference = Math.PI * 2 * 0.58;
    const rotationStep = (effectiveSpeed * dt) / 0.58;
    this.p.frontWheel.rotation.x += rotationStep;
    this.p.rearWheel.rotation.x += rotationStep;
    this.p.crankGroup.rotation.x += rotationStep;

    // Pedaling sound tick
    window.soundEngine.playPedalTick(this.speedMultiplier);

    // 4. Pelican Legs IK Animation (Feet follow pedals)
    const pedalAngle = this.p.crankGroup.rotation.x;
    const crankR = 0.2;
    // Right leg
    const rPedalY = Math.cos(pedalAngle) * crankR;
    const rPedalZ = Math.sin(pedalAngle) * crankR;
    this.p.rightLeg.thigh.rotation.x = Math.PI * 0.25 + rPedalZ * 0.8;
    this.p.rightLeg.shinGroup.rotation.x = -Math.PI * 0.35 + rPedalY * 0.9;

    // Left leg (180 deg offset)
    const lPedalY = Math.cos(pedalAngle + Math.PI) * crankR;
    const lPedalZ = Math.sin(pedalAngle + Math.PI) * crankR;
    this.p.leftLeg.thigh.rotation.x = Math.PI * 0.25 + lPedalZ * 0.8;
    this.p.leftLeg.shinGroup.rotation.x = -Math.PI * 0.35 + lPedalY * 0.9;

    // 5. Pelican Head Bobbing
    this.p.headGroup.position.y = 0.38 + Math.sin(pedalAngle * 2) * 0.025;
    this.p.bodyGroup.position.y = 0.9 + Math.cos(pedalAngle * 2) * 0.015;

    // 6. Beak Snapping / Catch Animation
    if (this.isCatching) {
      this.catchTimer -= dt;
      const progress = 1 - (this.catchTimer / this.catchDuration);
      if (progress < 0.5) {
        // Snap open wide!
        const openPhase = progress * 2;
        this.p.lowerJawGroup.rotation.x = THREE.MathUtils.lerp(0, Math.PI * 0.38, openPhase);
        this.p.pouchMesh.scale.y = THREE.MathUtils.lerp(1.3, 2.2, openPhase);
        this.p.headGroup.position.z = THREE.MathUtils.lerp(0.22, 0.42, openPhase); // Lunge forward!
      } else {
        // Snap shut!
        const closePhase = (progress - 0.5) * 2;
        this.p.lowerJawGroup.rotation.x = THREE.MathUtils.lerp(Math.PI * 0.38, 0, closePhase);
        this.p.pouchMesh.scale.y = THREE.MathUtils.lerp(2.2, 1.3, closePhase);
        this.p.headGroup.position.z = THREE.MathUtils.lerp(0.42, 0.22, closePhase);
      }

      if (this.catchTimer <= 0) {
        this.isCatching = false;
        this.p.lowerJawGroup.rotation.x = 0;
        this.p.headGroup.position.z = 0.22;
      }
    }

    // 7. Throat Pouch Bulge & Wiggle when digesting fish!
    if (this.swallowTimer > 0) {
      this.swallowTimer -= dt;
      const bulge = Math.sin(this.swallowTimer * 20) * 0.35 + 1.25;
      this.p.pouchMesh.scale.set(0.7 * bulge, 1.3 * bulge, 1.6);
    } else if (!this.isCatching) {
      this.p.pouchMesh.scale.set(0.7, 1.3, 1.6);
    }

    // 8. PROCEDURAL RED SCARF FLUTTERING (Vertex Cloth Wave!)
    this.animateScarfTail(this.p.scarfTail1, time, effectiveSpeed, 1.0);
    this.animateScarfTail(this.p.scarfTail2, time + 0.3, effectiveSpeed, 0.85);

    // 9. Update Active Fish
    this.updateFish(dt, effectiveSpeed);

    // 10. Update Combo Timer
    if (this.combo > 1) {
      this.comboTimer -= dt;
      if (this.comboTimer <= 0) {
        this.combo = 1;
        this.updateHUD();
      }
    }

    // 11. Refresh HUD stats
    this.updateHUD();

    return effectiveSpeed;
  }

  animateScarfTail(mesh, time, speed, seed) {
    if (!mesh || !mesh.geometry) return;
    const pos = mesh.geometry.attributes.position;
    const windSpeed = (speed * 0.8 + 8.0) * seed;

    for (let i = 0; i < pos.count; i++) {
      const y = pos.getY(i); // Along length of scarf tail
      const lengthFactor = Math.abs(y + 0.5) / 1.0; // Higher displacement towards the tip!

      // Fluid sine wave traveling backwards
      const waveZ = Math.sin(time * windSpeed + y * 9.0) * 0.12 * lengthFactor;
      const waveX = Math.cos(time * (windSpeed * 0.7) + y * 6.0) * 0.08 * lengthFactor;

      pos.setZ(i, waveZ);
      pos.setX(i, (mesh.geometry.parameters.width ? pos.getX(i) : 0) + waveX * 0.3);
    }
    pos.needsUpdate = true;
    mesh.geometry.computeVertexNormals();
  }
}

window.GameManager = GameManager;
