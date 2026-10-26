/**
 * Pelican Cycling 3D - Procedural 3D Models
 * Features:
 * - Stylized Pelican with cycling posture
 * - Helmet (aerodynamic vents & racing stripes)
 * - Sunglasses (glossy reflective sport shades)
 * - Dynamic Red Scarf with procedural cloth wave physics
 * - Detailed road bicycle with spinning spoke wheels & pedaling cranks
 * - Catchable jumping fish & scenery props
 */

class ModelBuilder {
  static createPelicanAndBike() {
    const root = new THREE.Group();
    root.name = 'PelicanBicycleRoot';

    // ---------------------------------------------
    // 1. MATERIALS
    // ---------------------------------------------
    const matFeathers = new THREE.MeshStandardMaterial({
      color: 0xf4f6f8,
      roughness: 0.65,
      metalness: 0.05
    });
    const matFeatherTips = new THREE.MeshStandardMaterial({
      color: 0x4a5568,
      roughness: 0.7,
      metalness: 0.1
    });
    const matBeakUpper = new THREE.MeshStandardMaterial({
      color: 0xffb703,
      roughness: 0.35,
      metalness: 0.1
    });
    const matBeakHook = new THREE.MeshStandardMaterial({
      color: 0xfb8500,
      roughness: 0.3,
      metalness: 0.15
    });
    const matPouch = new THREE.MeshStandardMaterial({
      color: 0xffa07a,
      roughness: 0.45,
      metalness: 0.05,
      side: THREE.DoubleSide
    });
    const matLegs = new THREE.MeshStandardMaterial({
      color: 0xfb8500,
      roughness: 0.5,
      metalness: 0.1
    });

    // Helmet & Sunglasses Materials
    const matHelmet = new THREE.MeshStandardMaterial({
      color: 0x06d6a0, // Electric turquoise
      roughness: 0.25,
      metalness: 0.4
    });
    const matHelmetStripe = new THREE.MeshStandardMaterial({
      color: 0xffd166, // Neon yellow racing stripe
      roughness: 0.2,
      metalness: 0.3
    });
    const matHelmetVent = new THREE.MeshStandardMaterial({
      color: 0x1a202c,
      roughness: 0.8
    });
    const matSunglassesLens = new THREE.MeshStandardMaterial({
      color: 0x111827,
      roughness: 0.05,
      metalness: 0.95
    });
    const matSunglassesFrame = new THREE.MeshStandardMaterial({
      color: 0x222222,
      roughness: 0.3,
      metalness: 0.5
    });

    // Red Scarf Material
    const matScarf = new THREE.MeshStandardMaterial({
      color: 0xe63946, // Vivid Crimson Red
      roughness: 0.5,
      metalness: 0.1,
      side: THREE.DoubleSide
    });

    // Bicycle Materials
    const matBikeFrame = new THREE.MeshStandardMaterial({
      color: 0x2a9d8f, // Vintage Seafoam Teal
      roughness: 0.3,
      metalness: 0.75
    });
    const matChrome = new THREE.MeshStandardMaterial({
      color: 0xedf2f7,
      roughness: 0.15,
      metalness: 0.95
    });
    const matRubber = new THREE.MeshStandardMaterial({
      color: 0x262626,
      roughness: 0.9,
      metalness: 0.05
    });
    const matLeather = new THREE.MeshStandardMaterial({
      color: 0x78350f,
      roughness: 0.6,
      metalness: 0.1
    });
    const matBasket = new THREE.MeshStandardMaterial({
      color: 0xd4a373,
      roughness: 0.8,
      metalness: 0.05
    });
    const matTailLight = new THREE.MeshStandardMaterial({
      color: 0xff1e00,
      emissive: 0xff1e00,
      emissiveIntensity: 0.8,
      roughness: 0.2
    });
    const matHeadLight = new THREE.MeshStandardMaterial({
      color: 0xfff3b0,
      emissive: 0xfff3b0,
      emissiveIntensity: 0.6,
      roughness: 0.2
    });

    // ---------------------------------------------
    // 2. BICYCLE ASSEMBLY
    // ---------------------------------------------
    const bike = new THREE.Group();
    bike.name = 'Bicycle';

    // Wheel Geometry
    const wheelRadius = 0.58;
    const tireRadius = 0.045;

    const createWheel = () => {
      const wGroup = new THREE.Group();
      // Rubber tire
      const tireGeo = new THREE.TorusGeometry(wheelRadius, tireRadius, 14, 36);
      const tire = new THREE.Mesh(tireGeo, matRubber);
      tire.rotation.y = Math.PI / 2;
      wGroup.add(tire);

      // Metal rim
      const rimGeo = new THREE.TorusGeometry(wheelRadius - tireRadius * 0.7, 0.02, 10, 36);
      const rim = new THREE.Mesh(rimGeo, matChrome);
      rim.rotation.y = Math.PI / 2;
      wGroup.add(rim);

      // Hub
      const hubGeo = new THREE.CylinderGeometry(0.04, 0.04, 0.14, 12);
      const hub = new THREE.Mesh(hubGeo, matChrome);
      hub.rotation.z = Math.PI / 2;
      wGroup.add(hub);

      // Spokes (16 chrome spokes)
      const spokeGeo = new THREE.CylinderGeometry(0.004, 0.004, (wheelRadius - tireRadius) * 2, 4);
      for (let i = 0; i < 8; i++) {
        const spoke = new THREE.Mesh(spokeGeo, matChrome);
        spoke.rotation.x = (i * Math.PI) / 8;
        wGroup.add(spoke);
      }
      return wGroup;
    };

    const wheelBase = 1.35;
    const frontWheel = createWheel();
    frontWheel.position.set(0, wheelRadius, wheelBase * 0.55);
    bike.add(frontWheel);

    const rearWheel = createWheel();
    rearWheel.position.set(0, wheelRadius, -wheelBase * 0.55);
    bike.add(rearWheel);

    // Bike Frame Tubes
    const frameGroup = new THREE.Group();

    // Helper for frame tube between two points
    const addTube = (p1, p2, radius = 0.025, mat = matBikeFrame) => {
      const v1 = new THREE.Vector3(...p1);
      const v2 = new THREE.Vector3(...p2);
      const dist = v1.distanceTo(v2);
      const geo = new THREE.CylinderGeometry(radius, radius, dist, 12);
      const mesh = new THREE.Mesh(geo, mat);

      const mid = v1.clone().add(v2).multiplyScalar(0.5);
      mesh.position.copy(mid);
      mesh.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), v2.clone().sub(v1).normalize());
      frameGroup.add(mesh);
      return mesh;
    };

    const bbPos = [0, wheelRadius * 0.65, -0.05]; // Bottom bracket
    const seatClusterPos = [0, wheelRadius + 0.52, -0.28];
    const headTubeTopPos = [0, wheelRadius + 0.68, 0.5];
    const headTubeBottomPos = [0, wheelRadius + 0.42, 0.58];
    const rearHubPos = [0, wheelRadius, -wheelBase * 0.55];
    const frontHubPos = [0, wheelRadius, wheelBase * 0.55];

    // Main triangle
    addTube(bbPos, seatClusterPos); // Seat tube
    addTube(seatClusterPos, headTubeTopPos); // Top tube
    addTube(bbPos, headTubeBottomPos); // Down tube
    addTube(headTubeBottomPos, headTubeTopPos, 0.032); // Head tube

    // Rear triangle (stays)
    addTube([0.06, rearHubPos[1], rearHubPos[2]], seatClusterPos, 0.016);
    addTube([-0.06, rearHubPos[1], rearHubPos[2]], seatClusterPos, 0.016);
    addTube([0.06, rearHubPos[1], rearHubPos[2]], bbPos, 0.016);
    addTube([-0.06, rearHubPos[1], rearHubPos[2]], bbPos, 0.016);

    // Front fork
    const forkGroup = new THREE.Group();
    addTube([0.06, frontHubPos[1], frontHubPos[2]], headTubeBottomPos, 0.018, matChrome);
    addTube([-0.06, frontHubPos[1], frontHubPos[2]], headTubeBottomPos, 0.018, matChrome);

    // Handlebars & Stem
    const stemPos = [0, headTubeTopPos[1] + 0.06, headTubeTopPos[2]];
    addTube(headTubeTopPos, stemPos, 0.02, matChrome);

    const barGeo = new THREE.CylinderGeometry(0.016, 0.016, 0.72, 12);
    const handlebars = new THREE.Mesh(barGeo, matChrome);
    handlebars.rotation.z = Math.PI / 2;
    handlebars.position.set(0, stemPos[1] + 0.04, stemPos[2] + 0.05);
    frameGroup.add(handlebars);

    // Rubber Grips
    [-0.32, 0.32].forEach(x => {
      const gripGeo = new THREE.CylinderGeometry(0.022, 0.022, 0.12, 12);
      const grip = new THREE.Mesh(gripGeo, matRubber);
      grip.rotation.z = Math.PI / 2;
      grip.position.set(x, stemPos[1] + 0.04, stemPos[2] + 0.05);
      frameGroup.add(grip);
    });

    // Bell on handlebar
    const bellGroup = new THREE.Group();
    const bellDomeGeo = new THREE.SphereGeometry(0.035, 12, 10, 0, Math.PI * 2, 0, Math.PI * 0.55);
    const bellDome = new THREE.Mesh(bellDomeGeo, new THREE.MeshStandardMaterial({ color: 0xffd700, metalness: 0.9, roughness: 0.2 }));
    bellGroup.add(bellDome);
    bellGroup.position.set(-0.18, stemPos[1] + 0.07, stemPos[2] + 0.06);
    frameGroup.add(bellGroup);

    // Saddle / Leather Seat
    const saddleGroup = new THREE.Group();
    const saddleGeo = new THREE.CylinderGeometry(0.08, 0.14, 0.28, 12);
    const saddle = new THREE.Mesh(saddleGeo, matLeather);
    saddle.rotation.x = Math.PI / 2;
    saddle.scale.set(1.1, 0.45, 1.2);
    saddleGroup.add(saddle);
    saddleGroup.position.set(0, seatClusterPos[1] + 0.14, seatClusterPos[2] - 0.03);
    frameGroup.add(saddleGroup);

    // Front Headlamp
    const lampGeo = new THREE.CylinderGeometry(0.05, 0.06, 0.1, 14);
    const lamp = new THREE.Mesh(lampGeo, matChrome);
    lamp.rotation.x = Math.PI / 2;
    lamp.position.set(0, headTubeTopPos[1] - 0.05, headTubeTopPos[2] + 0.12);
    const lampLensGeo = new THREE.CircleGeometry(0.058, 14);
    const lampLens = new THREE.Mesh(lampLensGeo, matHeadLight);
    lampLens.position.set(0, 0.051, 0);
    lampLens.rotation.x = -Math.PI / 2;
    lamp.add(lampLens);
    frameGroup.add(lamp);

    // Front Wicker Basket (for fresh fish!)
    const basketGeo = new THREE.BoxGeometry(0.38, 0.22, 0.28);
    const basket = new THREE.Mesh(basketGeo, matBasket);
    basket.position.set(0, headTubeTopPos[1] + 0.06, headTubeTopPos[2] + 0.22);
    frameGroup.add(basket);

    // Rear Blinking Tail Light
    const tailLightGeo = new THREE.BoxGeometry(0.06, 0.04, 0.03);
    const tailLight = new THREE.Mesh(tailLightGeo, matTailLight);
    tailLight.position.set(0, seatClusterPos[1] + 0.02, rearHubPos[2] + 0.1);
    frameGroup.add(tailLight);

    bike.add(frameGroup);

    // Bottom Bracket & Cranks (Animated!)
    const crankGroup = new THREE.Group();
    crankGroup.position.set(bbPos[0], bbPos[1], bbPos[2]);

    // Chainring
    const chainringGeo = new THREE.CylinderGeometry(0.12, 0.12, 0.015, 18);
    const chainring = new THREE.Mesh(chainringGeo, matChrome);
    chainring.rotation.z = Math.PI / 2;
    chainring.position.x = 0.06;
    crankGroup.add(chainring);

    // Left and Right Crank Arms & Pedals
    const crankArmLength = 0.2;
    const createCrankSide = (side = 1) => {
      const sideGroup = new THREE.Group();
      // Arm
      const armGeo = new THREE.BoxGeometry(0.02, crankArmLength, 0.03);
      const arm = new THREE.Mesh(armGeo, matChrome);
      arm.position.set(side * 0.08, crankArmLength * 0.5, 0);
      sideGroup.add(arm);

      // Pedal
      const pedalGeo = new THREE.BoxGeometry(0.09, 0.025, 0.07);
      const pedal = new THREE.Mesh(pedalGeo, matRubber);
      pedal.position.set(side * 0.14, crankArmLength, 0);
      sideGroup.add(pedal);

      return { sideGroup, pedal };
    };

    const rightCrank = createCrankSide(1);
    const leftCrank = createCrankSide(-1);
    leftCrank.sideGroup.rotation.x = Math.PI; // 180 deg opposite

    crankGroup.add(rightCrank.sideGroup);
    crankGroup.add(leftCrank.sideGroup);
    bike.add(crankGroup);

    root.add(bike);

    // ---------------------------------------------
    // 3. THE PELICAN (鹈鹕)
    // ---------------------------------------------
    const pelican = new THREE.Group();
    pelican.name = 'Pelican';

    // Body (Aerodynamic cycling posture leaning forward)
    const bodyGroup = new THREE.Group();
    bodyGroup.position.set(0, seatClusterPos[1] + 0.38, seatClusterPos[2] + 0.12);

    const bodyGeo = new THREE.SphereGeometry(0.38, 18, 16);
    bodyGeo.scale(0.85, 1.1, 1.45); // Tapered bird torso
    const bodyMesh = new THREE.Mesh(bodyGeo, matFeathers);
    bodyMesh.rotation.x = Math.PI * 0.22; // Lean forward over handlebars
    bodyGroup.add(bodyMesh);

    // Tail Feathers
    const tailGeo = new THREE.ConeGeometry(0.18, 0.35, 6);
    const tailMesh = new THREE.Mesh(tailGeo, matFeatherTips);
    tailMesh.position.set(0, -0.05, -0.52);
    tailMesh.rotation.x = -Math.PI * 0.45;
    bodyGroup.add(tailMesh);

    // Neck (Articulated S-curve)
    const neckBase = new THREE.Group();
    neckBase.position.set(0, 0.28, 0.35);

    const neckGeo = new THREE.CylinderGeometry(0.12, 0.16, 0.45, 14);
    const neckMesh = new THREE.Mesh(neckGeo, matFeathers);
    neckMesh.position.set(0, 0.18, 0.08);
    neckMesh.rotation.x = -Math.PI * 0.25;
    neckBase.add(neckMesh);

    // Pelican Head
    const headGroup = new THREE.Group();
    headGroup.position.set(0, 0.38, 0.22);

    const headGeo = new THREE.SphereGeometry(0.22, 16, 14);
    headGeo.scale(0.9, 0.95, 1.15);
    const headMesh = new THREE.Mesh(headGeo, matFeathers);
    headGroup.add(headMesh);

    // ---------------------------------------------
    // 4. SIGNATURE PELICAN BILL & EXPANDABLE POUCH
    // ---------------------------------------------
    const beakRoot = new THREE.Group();
    beakRoot.position.set(0, -0.02, 0.2);

    // Upper Beak (Streamlined yellow/orange taper with curved tip)
    const upperBeakGeo = new THREE.ConeGeometry(0.14, 0.82, 12);
    upperBeakGeo.scale(1.0, 0.35, 1.0); // Flattened wide beak
    const upperBeak = new THREE.Mesh(upperBeakGeo, matBeakUpper);
    upperBeak.rotation.x = Math.PI / 2;
    upperBeak.position.set(0, 0.04, 0.4);
    beakRoot.add(upperBeak);

    // Upper Beak Hook Tip
    const hookGeo = new THREE.SphereGeometry(0.045, 10, 8);
    hookGeo.scale(0.7, 1.2, 0.8);
    const hook = new THREE.Mesh(hookGeo, matBeakHook);
    hook.position.set(0, 0.02, 0.81);
    beakRoot.add(hook);

    // Lower Beak & Elastic Throat Pouch (GULLET - JAW PIVOT)
    const lowerJawGroup = new THREE.Group();
    lowerJawGroup.position.set(0, -0.05, 0.02);

    const lowerBeakGeo = new THREE.ConeGeometry(0.13, 0.8, 12);
    lowerBeakGeo.scale(0.95, 0.25, 1.0);
    const lowerBeak = new THREE.Mesh(lowerBeakGeo, matBeakUpper);
    lowerBeak.rotation.x = Math.PI / 2;
    lowerBeak.position.set(0, 0, 0.38);
    lowerJawGroup.add(lowerBeak);

    // The iconic expandable throat pouch (Peach-colored gullet)
    const pouchGeo = new THREE.SphereGeometry(0.24, 14, 12, 0, Math.PI * 2, 0, Math.PI * 0.7);
    pouchGeo.scale(0.7, 1.3, 1.6);
    const pouchMesh = new THREE.Mesh(pouchGeo, matPouch);
    pouchMesh.position.set(0, -0.16, 0.32);
    pouchMesh.rotation.x = Math.PI * 0.15;
    lowerJawGroup.add(pouchMesh);

    beakRoot.add(lowerJawGroup);
    headGroup.add(beakRoot);

    // ---------------------------------------------
    // 5. HELMET (头盔) - As explicitly requested!
    // ---------------------------------------------
    const helmetGroup = new THREE.Group();
    helmetGroup.position.set(0, 0.12, -0.02);

    // Aero cycling shell
    const helmetShellGeo = new THREE.SphereGeometry(0.26, 16, 14, 0, Math.PI * 2, 0, Math.PI * 0.58);
    helmetShellGeo.scale(0.95, 0.9, 1.35); // Teardrop aero shape
    const helmetShell = new THREE.Mesh(helmetShellGeo, matHelmet);
    helmetGroup.add(helmetShell);

    // Aerodynamic Rear Fin / Spoiler
    const aeroFinGeo = new THREE.ConeGeometry(0.12, 0.28, 8);
    aeroFinGeo.scale(0.6, 1.0, 1.4);
    const aeroFin = new THREE.Mesh(aeroFinGeo, matHelmet);
    aeroFin.rotation.x = -Math.PI * 0.48;
    aeroFin.position.set(0, 0.05, -0.32);
    helmetGroup.add(aeroFin);

    // Center Racing Stripe (Neon Yellow)
    const stripeGeo = new THREE.TorusGeometry(0.262, 0.02, 8, 24, Math.PI * 0.6);
    const stripe = new THREE.Mesh(stripeGeo, matHelmetStripe);
    stripe.rotation.y = Math.PI / 2;
    stripe.rotation.x = Math.PI * 0.2;
    helmetGroup.add(stripe);

    // Air Vents (Stylized aerodynamic cutouts)
    [-0.1, 0.1].forEach(x => {
      const ventGeo = new THREE.BoxGeometry(0.045, 0.025, 0.16);
      const vent = new THREE.Mesh(ventGeo, matHelmetVent);
      vent.position.set(x, 0.14, 0.04);
      vent.rotation.x = 0.25;
      helmetGroup.add(vent);
    });

    // Helmet Chin Strap
    const strapGeo = new THREE.TorusGeometry(0.23, 0.008, 6, 18, Math.PI);
    const strap = new THREE.Mesh(strapGeo, matRubber);
    strap.position.set(0, -0.08, 0.02);
    strap.rotation.z = Math.PI;
    helmetGroup.add(strap);

    headGroup.add(helmetGroup);

    // ---------------------------------------------
    // 6. SUNGLASSES (墨镜) - As explicitly requested!
    // ---------------------------------------------
    const shadesGroup = new THREE.Group();
    shadesGroup.position.set(0, 0.03, 0.18);

    // Modern Curved Sports Visor / Lenses
    const lensGeo = new THREE.CylinderGeometry(0.24, 0.24, 0.085, 18, 1, true, -Math.PI * 0.35, Math.PI * 0.7);
    const lenses = new THREE.Mesh(lensGeo, matSunglassesLens);
    lenses.rotation.x = Math.PI / 2;
    shadesGroup.add(lenses);

    // Sunglasses Upper Rim Frame
    const frameGeo = new THREE.TorusGeometry(0.242, 0.014, 8, 24, Math.PI * 0.72);
    const frame = new THREE.Mesh(frameGeo, matSunglassesFrame);
    frame.position.set(0, 0.04, 0);
    frame.rotation.z = -Math.PI * 0.86;
    shadesGroup.add(frame);

    // Sunglasses Temples (Sides)
    [-0.21, 0.21].forEach(x => {
      const armGeo = new THREE.BoxGeometry(0.015, 0.018, 0.24);
      const arm = new THREE.Mesh(armGeo, matSunglassesFrame);
      arm.position.set(x, 0.02, -0.11);
      shadesGroup.add(arm);
    });

    headGroup.add(shadesGroup);
    neckBase.add(headGroup);
    bodyGroup.add(neckBase);

    // ---------------------------------------------
    // 7. RED SCARF (脖子系红围巾) - Dynamic Procedural Wave!
    // ---------------------------------------------
    const scarfGroup = new THREE.Group();
    scarfGroup.position.set(0, 0.24, 0.32);

    // Scarf Neck Ring / Wrap
    const scarfRingGeo = new THREE.TorusGeometry(0.2, 0.065, 12, 24);
    const scarfRing = new THREE.Mesh(scarfRingGeo, matScarf);
    scarfRing.rotation.x = Math.PI * 0.38;
    scarfGroup.add(scarfRing);

    // Scarf Knot
    const knotGeo = new THREE.SphereGeometry(0.08, 10, 10);
    knotGeo.scale(1.2, 0.9, 0.8);
    const knot = new THREE.Mesh(knotGeo, matScarf);
    knot.position.set(0.12, -0.06, -0.08);
    scarfGroup.add(knot);

    // Fluttering Scarf Tails (High subdivision grid for fluid vertex animation)
    const scarfTailGeo1 = new THREE.PlaneGeometry(0.18, 0.95, 10, 28);
    const scarfTail1 = new THREE.Mesh(scarfTailGeo1, matScarf);
    scarfTail1.position.set(0.14, -0.05, -0.48);
    scarfTail1.rotation.set(-Math.PI * 0.42, 0.2, 0);
    scarfGroup.add(scarfTail1);

    const scarfTailGeo2 = new THREE.PlaneGeometry(0.15, 0.8, 8, 24);
    const scarfTail2 = new THREE.Mesh(scarfTailGeo2, matScarf);
    scarfTail2.position.set(0.08, -0.1, -0.42);
    scarfTail2.rotation.set(-Math.PI * 0.48, -0.15, 0.1);
    scarfGroup.add(scarfTail2);

    bodyGroup.add(scarfGroup);

    // ---------------------------------------------
    // 8. WINGS (Gripping Handlebars!)
    // ---------------------------------------------
    const createWing = (side = 1) => {
      const wGroup = new THREE.Group();
      wGroup.position.set(side * 0.26, 0.08, 0.1);

      // Upper Wing / Arm
      const upperGeo = new THREE.CylinderGeometry(0.09, 0.07, 0.45, 10);
      const upperWing = new THREE.Mesh(upperGeo, matFeathers);
      upperWing.position.set(side * 0.08, -0.12, 0.18);
      upperWing.rotation.set(Math.PI * 0.35, 0, side * -0.4);
      wGroup.add(upperWing);

      // Forearm / Primary Feathers wrapped onto handlebar grips
      const forearmGeo = new THREE.CylinderGeometry(0.07, 0.05, 0.42, 10);
      const forearm = new THREE.Mesh(forearmGeo, matFeatherTips);
      forearm.position.set(side * 0.12, -0.28, 0.42);
      forearm.rotation.set(Math.PI * 0.45, 0, side * -0.15);
      wGroup.add(forearm);

      return wGroup;
    };

    const rightWing = createWing(1);
    const leftWing = createWing(-1);
    bodyGroup.add(rightWing);
    bodyGroup.add(leftWing);

    // ---------------------------------------------
    // 9. LEGS & WEBBED FEET (Connected to pedals)
    // ---------------------------------------------
    const createLeg = (side = 1) => {
      const lGroup = new THREE.Group();
      lGroup.position.set(side * 0.16, -0.18, -0.05);

      // Thigh
      const thighGeo = new THREE.CylinderGeometry(0.055, 0.045, 0.32, 8);
      const thigh = new THREE.Mesh(thighGeo, matLegs);
      thigh.position.set(0, -0.12, 0);
      thigh.rotation.x = Math.PI * 0.2;
      lGroup.add(thigh);

      // Shin
      const shinGroup = new THREE.Group();
      shinGroup.position.set(0, -0.25, 0.06);
      const shinGeo = new THREE.CylinderGeometry(0.04, 0.035, 0.32, 8);
      const shin = new THREE.Mesh(shinGeo, matLegs);
      shin.position.set(0, -0.12, -0.02);
      shinGroup.add(shin);

      // Webbed Foot
      const footGeo = new THREE.BoxGeometry(0.12, 0.02, 0.22);
      const foot = new THREE.Mesh(footGeo, matLegs);
      foot.position.set(0, -0.26, 0.06);
      shinGroup.add(foot);

      lGroup.add(shinGroup);
      return { lGroup, thigh, shinGroup, foot };
    };

    const rightLeg = createLeg(1);
    const leftLeg = createLeg(-1);
    bodyGroup.add(rightLeg.lGroup);
    bodyGroup.add(leftLeg.lGroup);

    pelican.add(bodyGroup);
    root.add(pelican);

    // Return references for animation loop
    return {
      root,
      bike,
      frontWheel,
      rearWheel,
      crankGroup,
      rightCrank,
      leftCrank,
      pelican,
      bodyGroup,
      neckBase,
      headGroup,
      lowerJawGroup,
      pouchMesh,
      scarfTail1,
      scarfTail2,
      rightLeg,
      leftLeg
    };
  }

  // ---------------------------------------------
  // 10. JUMPING FISH (抓鱼对象)
  // ---------------------------------------------
  static createFish(isGolden = false) {
    const fishGroup = new THREE.Group();
    fishGroup.name = isGolden ? 'GoldenFish' : 'SilverFish';

    const baseColor = isGolden ? 0xffd700 : 0x48cae4;
    const bellyColor = isGolden ? 0xffea00 : 0xade8f4;

    const matFishBody = new THREE.MeshStandardMaterial({
      color: baseColor,
      roughness: 0.2,
      metalness: isGolden ? 0.8 : 0.4
    });
    const matFin = new THREE.MeshStandardMaterial({
      color: bellyColor,
      roughness: 0.3,
      metalness: 0.2,
      transparent: true,
      opacity: 0.85,
      side: THREE.DoubleSide
    });

    // Fish Body (Torpedo / Streamlined)
    const bodyGeo = new THREE.SphereGeometry(0.18, 12, 10);
    bodyGeo.scale(0.55, 0.85, 2.2);
    const body = new THREE.Mesh(bodyGeo, matFishBody);
    fishGroup.add(body);

    // Tail Fin
    const tailFinGeo = new THREE.ConeGeometry(0.18, 0.26, 4);
    tailFinGeo.scale(0.2, 1.2, 0.8);
    const tailFin = new THREE.Mesh(tailFinGeo, matFin);
    tailFin.position.set(0, 0, -0.42);
    tailFin.rotation.x = -Math.PI / 2;
    fishGroup.add(tailFin);

    // Dorsal Fin
    const dorsalGeo = new THREE.PlaneGeometry(0.22, 0.12);
    const dorsal = new THREE.Mesh(dorsalGeo, matFin);
    dorsal.position.set(0, 0.16, 0);
    dorsal.rotation.y = Math.PI / 2;
    fishGroup.add(dorsal);

    // Pectoral Fins (Gliding wings of flying fish!)
    [-0.14, 0.14].forEach(x => {
      const pFinGeo = new THREE.PlaneGeometry(0.35, 0.16);
      const pFin = new THREE.Mesh(pFinGeo, matFin);
      pFin.position.set(x, 0, 0.05);
      pFin.rotation.set(0.1, 0, (x > 0 ? 1 : -1) * 0.4);
      fishGroup.add(pFin);
    });

    // Big Cartoon Eyes
    [-0.07, 0.07].forEach(x => {
      const eyeGeo = new THREE.SphereGeometry(0.04, 8, 8);
      const eyeMat = new THREE.MeshBasicMaterial({ color: 0xffffff });
      const eye = new THREE.Mesh(eyeGeo, eyeMat);
      eye.position.set(x, 0.06, 0.26);

      const pupilGeo = new THREE.SphereGeometry(0.02, 6, 6);
      const pupilMat = new THREE.MeshBasicMaterial({ color: 0x000000 });
      const pupil = new THREE.Mesh(pupilGeo, pupilMat);
      pupil.position.set(0, 0, 0.025);
      eye.add(pupil);

      fishGroup.add(eye);
    });

    // Sparkle Particle Light for Golden Fish
    if (isGolden) {
      const sparkLight = new THREE.PointLight(0xffe066, 1.5, 4);
      fishGroup.add(sparkLight);
    }

    fishGroup.scale.set(1.4, 1.4, 1.4);
    return { fishGroup, tailFin, isGolden };
  }

  // ---------------------------------------------
  // 11. COASTAL SCENERY PROPS
  // ---------------------------------------------
  static createPalmTree() {
    const palm = new THREE.Group();
    palm.name = 'PalmTree';

    const matTrunk = new THREE.MeshStandardMaterial({ color: 0x8d6e63, roughness: 0.9 });
    const matFrond = new THREE.MeshStandardMaterial({ color: 0x2e7d32, roughness: 0.6, side: THREE.DoubleSide });

    // Curved Trunk with 5 segments
    let currentY = 0;
    let currentX = 0;
    const trunkSegments = 6;
    for (let i = 0; i < trunkSegments; i++) {
      const h = 0.8;
      const segGeo = new THREE.CylinderGeometry(0.22 - i * 0.02, 0.25 - i * 0.02, h, 8);
      const seg = new THREE.Mesh(segGeo, matTrunk);
      seg.position.set(currentX, currentY + h / 2, 0);
      seg.rotation.z = -0.06 * i;
      palm.add(seg);
      currentY += h * 0.95;
      currentX += 0.08 * (i + 1);
    }

    // Fronds / Palm Leaves
    const topPos = new THREE.Vector3(currentX, currentY, 0);
    const frondCount = 7;
    for (let i = 0; i < frondCount; i++) {
      const angle = (i * Math.PI * 2) / frondCount;
      const frondGeo = new THREE.PlaneGeometry(0.65, 2.2, 4, 8);

      // Curve the leaf vertices
      const pos = frondGeo.attributes.position;
      for (let j = 0; j < pos.count; j++) {
        const y = pos.getY(j);
        pos.setZ(j, -Math.pow((y + 1.1) / 2.2, 2) * 0.45);
      }
      frondGeo.computeVertexNormals();

      const frond = new THREE.Mesh(frondGeo, matFrond);
      frond.position.copy(topPos);
      frond.rotation.y = angle;
      frond.rotation.x = Math.PI * 0.35;
      palm.add(frond);
    }

    palm.scale.set(1.6, 1.6, 1.6);
    return palm;
  }

  static createLighthouse() {
    const lighthouse = new THREE.Group();
    lighthouse.name = 'Lighthouse';

    const matWhite = new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.4 });
    const matRed = new THREE.MeshStandardMaterial({ color: 0xd90429, roughness: 0.4 });
    const matGlass = new THREE.MeshStandardMaterial({ color: 0xfff3b0, emissive: 0xffd166, emissiveIntensity: 0.9 });

    // Alternating red and white sections
    const heights = [2.0, 1.8, 1.8, 1.8];
    let yAcc = 0;
    heights.forEach((h, idx) => {
      const rBottom = 1.4 - idx * 0.18;
      const rTop = rBottom - 0.18;
      const geo = new THREE.CylinderGeometry(rTop, rBottom, h, 14);
      const mat = idx % 2 === 0 ? matWhite : matRed;
      const mesh = new THREE.Mesh(geo, mat);
      mesh.position.y = yAcc + h / 2;
      lighthouse.add(mesh);
      yAcc += h;
    });

    // Lantern Room Gallery
    const galleryGeo = new THREE.CylinderGeometry(0.95, 0.95, 0.2, 14);
    const gallery = new THREE.Mesh(galleryGeo, new THREE.MeshStandardMaterial({ color: 0x222222 }));
    gallery.position.y = yAcc + 0.1;
    lighthouse.add(gallery);

    // Glowing Lantern Glass
    const glassGeo = new THREE.CylinderGeometry(0.65, 0.65, 0.9, 12);
    const glass = new THREE.Mesh(glassGeo, matGlass);
    glass.position.y = yAcc + 0.65;
    lighthouse.add(glass);

    // Lantern Roof Dome
    const domeGeo = new THREE.SphereGeometry(0.7, 12, 10, 0, Math.PI * 2, 0, Math.PI * 0.5);
    const dome = new THREE.Mesh(domeGeo, matRed);
    dome.position.y = yAcc + 1.1;
    lighthouse.add(dome);

    // Rotating Light Beam
    const beamGeo = new THREE.ConeGeometry(4.5, 30, 16, 1, true);
    const beamMat = new THREE.MeshBasicMaterial({
      color: 0xfff9a6,
      transparent: true,
      opacity: 0.25,
      side: THREE.DoubleSide
    });
    const beam = new THREE.Mesh(beamGeo, beamMat);
    beam.rotation.x = Math.PI / 2;
    beam.position.set(0, yAcc + 0.65, 15);
    lighthouse.add(beam);

    lighthouse.scale.set(1.5, 1.5, 1.5);
    return { lighthouse, beam };
  }

  static createRoadSign(textType = 'fish') {
    const signGroup = new THREE.Group();
    const matPole = new THREE.MeshStandardMaterial({ color: 0x888888, metalness: 0.8, roughness: 0.3 });
    const matYellow = new THREE.MeshStandardMaterial({ color: 0xffd166, roughness: 0.4 });

    // Pole
    const poleGeo = new THREE.CylinderGeometry(0.04, 0.04, 2.2, 8);
    const pole = new THREE.Mesh(poleGeo, matPole);
    pole.position.y = 1.1;
    signGroup.add(pole);

    // Diamond Warning Sign
    const signGeo = new THREE.BoxGeometry(0.75, 0.75, 0.03);
    const sign = new THREE.Mesh(signGeo, matYellow);
    sign.position.set(0, 1.85, 0.04);
    sign.rotation.z = Math.PI / 4; // Diamond orientation
    signGroup.add(sign);

    return signGroup;
  }
}

window.ModelBuilder = ModelBuilder;
