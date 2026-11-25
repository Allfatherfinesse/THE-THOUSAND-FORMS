import * as THREE from './vendor/three.module.js';
import { buildSanctuary } from './sanctuary.js';
import { createFighterMotion, updateFighterMotion } from './fighter-motion.js';
import { batchFighter } from './rig-batches.js';

// Procedural, asset-free presentation for the browser combat experiment.
const TAU = Math.PI * 2;
const STYLE_COLORS = [0xe4b970, 0x9ddbd6, 0xbcb0ed];
const clamp = (x, lo, hi) => Math.max(lo, Math.min(hi, x));
const ease = x => { x = clamp(x, 0, 1); return x * x * (3 - 2 * x); };

export function createRenderer(canvas) {
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: false, powerPreference: 'high-performance' });
  let renderScale = 1, slowTime = 0, fastTime = 0;
  function fitResolution() {
    const native = Math.min(window.devicePixelRatio || 1, 1.75, Math.sqrt(2400000 / (width * height)));
    renderer.setPixelRatio(native * renderScale);
  }
  // The HUD stays at device resolution. Only the 3D canvas scales under sustained load.
  function trackFrameTime(seconds) {
    if (seconds <= 0 || seconds > 1) { slowTime = fastTime = 0; return; }
    slowTime = seconds > .026 ? slowTime + seconds : Math.max(0, slowTime - seconds * 2);
    fastTime = seconds < .0185 ? fastTime + seconds : 0;
    if ((slowTime >= 1.6 && renderScale > .65) || (fastTime >= 6 && renderScale < 1)) {
      renderScale = clamp(renderScale + (slowTime >= 1.6 ? -.15 : .1), .65, 1);
      slowTime = fastTime = 0;
      fitResolution();
    }
  }
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.26;
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  const scene = new THREE.Scene();
  scene.background = new THREE.Color(0x15202d);
  scene.fog = new THREE.FogExp2(0x263a4a, 0.026);
  const camera = new THREE.PerspectiveCamera(58, 1, .08, 110);
  const cameraTarget = new THREE.Vector3(0, 1.15, 2.25);
  const framedTarget = cameraTarget.clone();
  const nearView = new THREE.Vector3();
  const enemyView = new THREE.Vector3();
  const followAnchor = new THREE.Vector3(0, 1.1, 3);
  const desiredCameraPosition = new THREE.Vector3();
  const desiredCameraTarget = new THREE.Vector3();
  const actualAnchor = new THREE.Vector3();
  const viewDirection = new THREE.Vector3();
  const collisionDirection = new THREE.Vector3();
  const collisionPoint = new THREE.Vector3();
  const collisionRay = new THREE.Ray();
  const cameraObstacles = [];
  let cameraYaw = Math.PI, freeYaw = Math.PI, cameraPitch = .34, freePitch = .34;
  let cameraReady = false, cameraLocked = true, cameraObstructed = false;
  camera.position.set(.65, 2.9, 8.1);
  camera.lookAt(cameraTarget);
  const geometryCache = new Map();
  const ownedMaterials = new Set();
  const staticInstances = [];
  const flames = [];
  const fighters = {};
  let width = 1, height = 1, lastMode = null, previousResult = null;

  function geometry(key, create) {
    if (!geometryCache.has(key)) geometryCache.set(key, create());
    return geometryCache.get(key);
  }
  function material(color, extra = {}) {
    const value = new THREE.MeshStandardMaterial({ color, roughness: .85, metalness: .06, ...extra });
    ownedMaterials.add(value);
    return value;
  }
  function basic(color, extra = {}) {
    const value = new THREE.MeshBasicMaterial({ color, ...extra });
    ownedMaterials.add(value);
    return value;
  }
  function mesh(parent, geo, mat, position = [0, 0, 0], scale = [1, 1, 1], shadows = true) {
    const item = new THREE.Mesh(geo, mat);
    item.position.set(...position);
    item.scale.set(...scale);
    item.castShadow = shadows;
    item.receiveShadow = shadows;
    parent.add(item);
    return item;
  }
  const box = geometry('box', () => new THREE.BoxGeometry(1, 1, 1));
  const cylinder = geometry('cylinder', () => new THREE.CylinderGeometry(1, 1, 1, 12));
  const tapered = geometry('tapered', () => new THREE.CylinderGeometry(.85, 1, 1, 10));
  const sphere = geometry('sphere', () => new THREE.SphereGeometry(1, 12, 9));
  const octa = geometry('octa', () => new THREE.IcosahedronGeometry(1, 0));
  const stone = [0x4a4b4b, 0x555450, 0x484e50, 0x50534f, 0x454849, 0x595650].map(c => material(c));
  const edgeStone = material(0x363e42);
  const blackStone = material(0x202a30);
  const brass = material(0xb89a62, { roughness: .54, metalness: .48 });
  const inscription = material(0x9d865b, { roughness: .7, metalness: .22 });
  const flameCore = basic(0xffe5a3);
  const flameOuter = basic(0xed7333, { transparent: true, opacity: .62, depthWrite: false, blending: THREE.AdditiveBlending });

  let seed = 4817;
  function random() { seed = (seed * 16807) % 2147483647; return (seed - 1) / 2147483646; }
  function ring(parent, radius, thickness, mat, y = .035, segments = 96) {
    const item = mesh(parent, geometry(`ring:${radius}:${thickness}:${segments}`, () => new THREE.TorusGeometry(radius, thickness, 5, segments)), mat, [0, y, 0], [1, 1, 1], false);
    item.rotation.x = Math.PI / 2;
    return item;
  }
  function tileGeometry(inner, outer, count) {
    return geometry(`tile:${inner}:${outer}:${count}`, () => {
      const gap = .012;
      const angle = TAU / count;
      const shape = new THREE.Shape();
      shape.absarc(0, 0, outer, gap, angle - gap, false);
      shape.lineTo(Math.cos(angle - gap) * inner, Math.sin(angle - gap) * inner);
      shape.absarc(0, 0, inner, angle - gap, gap, true);
      shape.closePath();
      const geo = new THREE.ExtrudeGeometry(shape, { depth: .075, bevelEnabled: false, curveSegments: 3 });
      geo.rotateX(-Math.PI / 2);
      return geo;
    });
  }

  scene.add(new THREE.HemisphereLight(0xa9bfd6, 0x4c3e30, 1.85));
  const moonLight = new THREE.DirectionalLight(0xb9d1ea, 2.45);
  moonLight.position.set(-8, 16, -12);
  moonLight.castShadow = true;
  moonLight.shadow.mapSize.set(1024, 1024);
  Object.assign(moonLight.shadow.camera, { left: -14, right: 14, top: 14, bottom: -14, near: .5, far: 48 });
  moonLight.shadow.bias = -.0008;
  moonLight.shadow.normalBias = .035;
  scene.add(moonLight);
  const warmFill = new THREE.DirectionalLight(0xe6bd8b, .88);
  warmFill.position.set(7, 5, 10);
  scene.add(warmFill);

  // The floor is an inlaid stone disc, with individually varied radial pavers.
  mesh(scene, geometry('land', () => new THREE.CylinderGeometry(20, 22, .6, 64)), material(0x161f25), [0, -.7, 0], [1, 1, 1]);
  mesh(scene, geometry('foundation', () => new THREE.CylinderGeometry(9.75, 10.15, .58, 96)), edgeStone, [0, -.32, 0]);
  mesh(scene, geometry('floor', () => new THREE.CylinderGeometry(9.25, 9.25, .16, 96)), blackStone, [0, -.09, 0]);
  [[1.7, 3.28, 24], [3.34, 5.1, 32], [5.16, 6.86, 40], [6.92, 8.7, 48]].forEach(([inner, outer, count], index) => {
    const geo = tileGeometry(inner, outer, count);
    for (let i = 0; i < count; i++) {
      const item = mesh(scene, geo, stone[Math.floor(random() * stone.length)], [0, -.05 + random() * .014, 0]);
      item.rotation.y = i * TAU / count + (index % 2 ? .075 : 0);
      item.castShadow = false;
    }
  });
  mesh(scene, geometry('centerdisc', () => new THREE.CylinderGeometry(1.64, 1.64, .08, 64)), stone[3], [0, -.007, 0]);
  [1.7, 3.3, 5.12, 6.9, 8.74, 9.13].forEach((radius, i) => ring(scene, radius, i === 5 ? .035 : .014, i > 3 ? brass : inscription));
  ring(scene, .82, .016, inscription, .045, 64);
  ring(scene, 1.48, .018, brass, .045, 64);
  for (let i = 0; i < 8; i++) {
    const petal = new THREE.Group();
    petal.rotation.y = i * TAU / 8;
    const diamond = mesh(petal, box, inscription, [0, .042, .95], [.018, .008, .85], false);
    diamond.rotation.y = .32;
    const second = mesh(petal, box, inscription, [0, .042, .95], [.018, .008, .85], false);
    second.rotation.y = -.32;
    scene.add(petal);
  }
  for (let i = 0; i < 24; i++) {
    const mark = new THREE.Group();
    const angle = i * TAU / 24;
    mark.position.set(Math.sin(angle) * 7.82, .046, Math.cos(angle) * 7.82);
    mark.rotation.y = angle;
    mesh(mark, box, inscription, [0, 0, 0], [.025, .008, .32], false);
    mesh(mark, box, inscription, [.085, 0, -.04], [.18, .008, .022], false);
    mesh(mark, box, inscription, [-.07, 0, .09], [.13, .008, .022], false);
    if (i % 2 === 0) mesh(mark, box, inscription, [.08, 0, .13], [.02, .008, .12], false);
    scene.add(mark);
  }
  for (let i = 0; i < 48; i++) {
    const angle = TAU * i / 48;
    const item = mesh(scene, box, i % 3 ? edgeStone : stone[1], [Math.sin(angle) * 9.27, .09, Math.cos(angle) * 9.27], [1.17, .23, .48]);
    item.rotation.y = angle;
  }
  // A handful of hairline cracks gives the regular stonework an older silhouette.
  const crackPoints = [];
  for (let i = 0; i < 30; i++) {
    const a = random() * TAU, r = 2 + random() * 6.4;
    const x = Math.sin(a) * r, z = Math.cos(a) * r;
    crackPoints.push(x, .041, z, x + .15 + random() * .25, .041, z + .08 + random() * .24);
  }
  const crackGeometry = geometry('cracks', () => new THREE.BufferGeometry().setAttribute('position', new THREE.Float32BufferAttribute(crackPoints, 3)));
  const crackMat = new THREE.LineBasicMaterial({ color: 0x242b2e, transparent: true, opacity: .75 });
  ownedMaterials.add(crackMat);
  scene.add(new THREE.LineSegments(crackGeometry, crackMat));

  const { moonHalo } = buildSanctuary({
    scene, geometry, material, basic, mesh, terrainMaterials: stone,
  });

  function brazier(x, z, phase) {
    const group = new THREE.Group();
    group.position.set(x, 0, z);
    mesh(group, cylinder, edgeStone, [0, .16, 0], [.44, .32, .44]);
    mesh(group, cylinder, blackStone, [0, .63, 0], [.16, .8, .16]);
    mesh(group, geometry('bowl', () => new THREE.CylinderGeometry(.36, .22, .25, 10)), brass, [0, 1.03, 0]);
    const outer = mesh(group, octa, flameOuter, [0, 1.43, 0], [.23, .52, .23], false);
    const inner = mesh(group, octa, flameCore, [.015, 1.34, 0], [.12, .3, .12], false);
    const light = new THREE.PointLight(0xffa351, 8.5, 7, 2);
    light.position.set(0, 1.6, 0);
    group.add(light);
    flames.push({ outer, inner, light, phase, x, z });
    scene.add(group);
  }
  brazier(-7.8, -5.3, .5); brazier(7.8, -5.3, 2.3);
  brazier(-6.5, 7.2, 4.5); brazier(6.5, 7.2, 7.1);

  const dustCount = 100;
  const dustPositions = new Float32Array(dustCount * 3);
  const dustBase = [];
  for (let i = 0; i < dustCount; i++) {
    const a = random() * TAU, r = 2 + random() * 11;
    dustBase.push({ x: Math.sin(a) * r, z: Math.cos(a) * r, y: random() * 5.5, speed: .12 + random() * .25, phase: random() * TAU });
  }
  const dustGeo = geometry('dust', () => new THREE.BufferGeometry().setAttribute('position', new THREE.BufferAttribute(dustPositions, 3)));
  const dustMat = new THREE.PointsMaterial({ color: 0xd2ac72, size: .025, transparent: true, opacity: .52, depthWrite: false, blending: THREE.AdditiveBlending });
  ownedMaterials.add(dustMat);
  scene.add(new THREE.Points(dustGeo, dustMat));

  // Batch static architecture by shared geometry/material. Decorative tilework
  // should not cost a draw call per stone, inscription or pillar segment.
  scene.updateMatrixWorld(true);
  const animatedFlames = new Set(flames.flatMap(flame => [flame.outer, flame.inner]));
  const staticBatches = new Map();
  scene.traverse(item => {
    if (!item.isMesh || animatedFlames.has(item) || item.userData.noStaticBatch) return;
    // Retain conservative collision volumes before meshes become instances.
    // Floor decoration and distant scenery are not camera obstructions.
    item.geometry.computeBoundingBox();
    const bounds = item.geometry.boundingBox.clone().applyMatrix4(item.matrixWorld);
    const center = bounds.getCenter(new THREE.Vector3());
    if (!item.userData.noCameraCollision && bounds.max.y > .65 && bounds.min.y < 7 && Math.hypot(center.x, center.z) < 16) {
      if (item.userData.cameraCollisionBoxes) {
        for (const segment of item.userData.cameraCollisionBoxes) {
          cameraObstacles.push(segment.clone().applyMatrix4(item.matrixWorld).expandByScalar(.24));
        }
      } else cameraObstacles.push(bounds.expandByScalar(.24));
    }
    const key = `${item.geometry.uuid}:${item.material.uuid}:${item.castShadow}:${item.receiveShadow}`;
    if (!staticBatches.has(key)) staticBatches.set(key, []);
    staticBatches.get(key).push(item);
  });
  for (const batch of staticBatches.values()) {
    if (batch.length < 2) continue;
    const original = batch[0];
    const instances = new THREE.InstancedMesh(original.geometry, original.material, batch.length);
    instances.castShadow = original.castShadow;
    instances.receiveShadow = original.receiveShadow;
    batch.forEach((item, i) => {
      instances.setMatrixAt(i, item.matrixWorld);
      item.removeFromParent();
    });
    instances.instanceMatrix.needsUpdate = true;
    instances.computeBoundingSphere();
    scene.add(instances);
    staticInstances.push(instances);
  }

  function limb(parent, x, y, z, upperLength, lowerLength, skinMat, clothMat, wrapMat, leg = false) {
    const pivot = new THREE.Group();
    pivot.position.set(x, y, z);
    parent.add(pivot);
    const muscle = geometry('fighter-muscle', () => new THREE.LatheGeometry([
      new THREE.Vector2(0, -.5), new THREE.Vector2(.65, -.47),
      new THREE.Vector2(.94, -.27), new THREE.Vector2(1, .08),
      new THREE.Vector2(.75, .43), new THREE.Vector2(0, .5),
    ], 10));
    mesh(pivot, muscle, clothMat, [0, -upperLength / 2, 0], [leg ? .126 : .088, upperLength, leg ? .118 : .082]);
    const joint = new THREE.Group();
    joint.position.y = -upperLength;
    pivot.add(joint);
    mesh(joint, muscle, leg ? clothMat : skinMat, [0, -lowerLength / 2, 0], [leg ? .091 : .067, lowerLength, leg ? .093 : .067]);
    // Broad wrapped cuffs read at gameplay distance; a few raised seams imply layers.
    mesh(joint, tapered, wrapMat, [0, -lowerLength * .66, 0], [leg ? .098 : .075, lowerLength * .54, leg ? .098 : .075]);
    for (const offset of [-.06, .035]) {
      const seam = mesh(joint, cylinder, clothMat, [0, -lowerLength * .66 + offset, 0], [leg ? .100 : .077, .012, leg ? .100 : .077]);
      seam.rotation.z = .08;
    }
    const foot = new THREE.Group();
    foot.position.y = -lowerLength;
    joint.add(foot);
    if (leg) {
      mesh(foot, sphere, clothMat, [0, .007, .07], [.089, .065, .155]);
      mesh(foot, box, wrapMat, [0, -.028, .08], [.17, .025, .27]);
    } else {
      mesh(foot, sphere, skinMat, [0, -.025, .013], [.067, .084, .067]);
      mesh(foot, box, wrapMat, [0, -.004, .055], [.10, .09, .025]);
    }
    return { pivot, joint, foot };
  }

  function createFighter(id) {
    const enemy = id === 'enemy';
    const root = new THREE.Group();
    const skin = material(enemy ? 0xa08a77 : 0xb58d69, { roughness: .72, metalness: 0 });
    const cloth = material(enemy ? 0x41333c : 0x294348, { roughness: .96, metalness: 0 });
    const clothLight = material(enemy ? 0x63595b : 0x56635e, { roughness: .98, metalness: 0 });
    const trousers = material(enemy ? 0x28282e : 0x253337, { roughness: .94, metalness: 0 });
    const wrap = material(enemy ? 0xb0a18a : 0xc9bba0, { roughness: 1, metalness: 0 });
    const armor = material(enemy ? 0x615a49 : 0x5b655d, { roughness: .55, metalness: .55 });
    const trim = material(enemy ? 0xb59a67 : 0xa58a52, { roughness: .55, metalness: .62 });
    const belt = material(enemy ? 0x924e3d : STYLE_COLORS[0], { roughness: .88, metalness: .12 });
    const hair = material(enemy ? 0x9d9c90 : 0x171e21, { roughness: .9 });
    const eyes = basic(enemy ? 0xdca36a : 0x272b29);
    const panelShape = geometry('fighter-tattered-panel', () => {
      const shape = new THREE.Shape();
      shape.moveTo(-.5, 0); shape.lineTo(.5, 0); shape.lineTo(.43, -.83);
      shape.lineTo(.23, -.96); shape.lineTo(.13, -.84); shape.lineTo(-.08, -1);
      shape.lineTo(-.22, -.89); shape.lineTo(-.43, -.96); shape.closePath();
      const result = new THREE.ExtrudeGeometry(shape, { depth: .014, bevelEnabled: false });
      result.translate(0, 0, -.007);
      return result;
    });
    const clothPanel = (parent, mat, x, y, z, panelWidth, panelLength) => {
      const hinge = new THREE.Group();
      hinge.position.set(x, y, z); parent.add(hinge);
      mesh(hinge, panelShape, mat, [0, 0, 0], [panelWidth, panelLength, 1]);
      return hinge;
    };
    const body = new THREE.Group();
    body.position.y = 1.05;
    root.add(body);
    const torso = geometry('fighter-torso', () => new THREE.LatheGeometry([
      new THREE.Vector2(0, -.21), new THREE.Vector2(.20, -.2), new THREE.Vector2(.225, -.08),
      new THREE.Vector2(.29, .14), new THREE.Vector2(.315, .28),
      new THREE.Vector2(.20, .39), new THREE.Vector2(0, .40),
    ], 12));
    mesh(body, torso, cloth, [0, 0, 0], [1, 1, .62]);
    const lapelLeft = mesh(body, box, wrap, [-.065, .16, .175], [.06, .48, .026]);
    lapelLeft.rotation.z = -.37;
    const lapelRight = mesh(body, box, clothLight, [.075, .16, .185], [.10, .47, .032]);
    lapelRight.rotation.z = .32;
    // Split ceremonial layers and a carved back seal give the rear silhouette detail.
    clothPanel(body, clothLight, 0, .32, -.18, .52, .54);
    const backSeal = mesh(body, geometry('fighter-seal', () => new THREE.TorusGeometry(.074, .008, 5, 20)), trim, [0, .14, -.202], [1, 1.15, 1]);
    mesh(body, box, trim, [0, .14, -.208], [.012, .13, .012]);
    mesh(body, box, trim, [0, .14, -.208], [.11, .012, .012]);
    mesh(body, cylinder, skin, [0, .445, 0], [.072, .12, .072]);
    mesh(body, tapered, clothLight, [0, .39, -.035], [.135, .13, .13]);
    const necklace = mesh(body, geometry('fighter-cord', () => new THREE.TorusGeometry(.115, .012, 5, 20, Math.PI)), trim, [0, .34, .163], [1, 1, 1]);
    necklace.rotation.z = Math.PI;
    mesh(body, octa, trim, [0, .2, .205], [.027, .055, .017]);
    const head = new THREE.Group();
    head.position.set(0, .59, 0);
    body.add(head);
    mesh(head, sphere, skin, [0, .024, 0], [.131, .175, .127]);
    mesh(head, sphere, skin, [0, -.064, .025], [.105, .09, .105]);
    mesh(head, sphere, hair, [0, .105, -.033], [.137, .12, .125]);
    mesh(head, sphere, hair, [0, .205, -.058], [.057, .06, .06]);
    mesh(head, cylinder, trim, [0, .192, -.058], [.058, .015, .061]);
    mesh(head, box, enemy ? armor : cloth, [0, .074, .112], [.235, .032, .027]);
    for (const sign of [-1, 1]) {
      mesh(head, sphere, skin, [sign * .13, .015, -.005], [.022, .045, .024]);
      mesh(head, box, eyes, [sign * .052, .05, .127], [.026, .009, .009], false);
    }
    mesh(head, octa, enemy ? armor : skin, [0, .012, .13], [.026, .048, .033]);
    if (enemy) mesh(head, tapered, hair, [0, -.1, .055], [.075, .16, .065]);
    mesh(root, tapered, trousers, [0, .87, 0], [.235, .22, .17]);
    mesh(root, cylinder, belt, [0, .96, 0], [.245, .075, .188]);
    mesh(root, box, trim, [0, .96, .195], [.105, .085, .028]);
    const sash = clothPanel(root, enemy ? wrap : belt, -.11, .93, .176, .14, .53);
    const sash2 = clothPanel(root, clothLight, .11, .93, .175, .10, .44);
    const coatLeft = clothPanel(root, cloth, -.12, .94, -.16, .24, .56);
    const coatRight = clothPanel(root, clothLight, .12, .94, -.16, .22, .50);
    const leftArm = limb(body, -.315, .33, 0, .29, .29, skin, cloth, wrap);
    const rightArm = limb(body, .315, .33, 0, .29, .29, skin, cloth, wrap);
    const leftLeg = limb(root, -.15, .87, 0, .37, .38, skin, trousers, wrap, true);
    const rightLeg = limb(root, .15, .87, 0, .37, .38, skin, trousers, wrap, true);
    // Unequal shoulder protection keeps the unarmed silhouette readable from behind.
    mesh(leftArm.pivot, sphere, armor, [0, -.04, -.008], [.127, .12, .13]);
    mesh(leftArm.pivot, box, trim, [0, -.09, -.126], [.15, .025, .018]);
    mesh(rightArm.pivot, geometryCache.get('fighter-muscle'), clothLight, [0, -.12, 0], [.098, .23, .09]);
    for (const arm of [leftArm, rightArm]) {
      mesh(arm.joint, box, armor, [0, -.16, -.065], [.09, .15, .027]);
      mesh(arm.joint, box, trim, [0, -.16, -.083], [.015, .115, .01]);
    }
    const mantle = new THREE.Group();
    [-1, 1].forEach(sign => {
      const shoulder = mesh(mantle, tapered, armor, [sign * .28, .38, -.045], [.17, .15, .22]);
      shoulder.rotation.z = sign * .45;
      const spike = mesh(mantle, octa, trim, [sign * .32, .51, -.08], [.045, .19, .055]);
      spike.rotation.z = sign * -.4;
    });
    mesh(mantle, tapered, armor, [0, .39, -.105], [.18, .25, .14]);
    body.add(mantle);
    mantle.visible = false;
    scene.add(root);
    const footprint = new THREE.Group();
    const footMat = basic(enemy ? 0xca7653 : STYLE_COLORS[0], { transparent: true, opacity: .65, depthWrite: false });
    ring(footprint, .49, .012, footMat, .052, 48);
    ring(footprint, .55, .006, footMat, .052, 48);
    const direction = mesh(footprint, geometry('direction', () => new THREE.ConeGeometry(.065, .15, 3)), footMat, [0, .05, .68], [1, 1, 1], false);
    direction.rotation.x = Math.PI / 2;
    scene.add(footprint);
    const shadow = mesh(scene, geometry('shadow', () => new THREE.CircleGeometry(.48, 32)), basic(0x080b0e, { transparent: true, opacity: .3, depthWrite: false }), [0, .04, 0], [1, 1, 1], false);
    shadow.rotation.x = -Math.PI / 2;
    const indicator = new THREE.Group();
    const indicatorBack = mesh(indicator, geometry('healthback', () => new THREE.PlaneGeometry(.85, .052)), basic(0x0b1015, { transparent: true, opacity: .8, depthTest: false }), [0, 0, 0], [1, 1, 1], false);
    const healthFill = mesh(indicator, geometry('healthfill', () => new THREE.PlaneGeometry(.81, .025)), basic(enemy ? 0xdf956a : 0xc5cfae, { depthTest: false }), [0, 0, .002], [1, 1, 1], false);
    indicatorBack.renderOrder = 5;
    healthFill.renderOrder = 6;
    scene.add(indicator);
    const conePositions = new Float32Array(40 * 9);
    const coneGeo = new THREE.BufferGeometry();
    coneGeo.setAttribute('position', new THREE.BufferAttribute(conePositions, 3));
    geometryCache.set(`${id}:cone`, coneGeo);
    const coneMat = basic(enemy ? 0xeaad64 : 0xd7dbb9, { transparent: true, opacity: .15, side: THREE.DoubleSide, depthWrite: false });
    const cone = mesh(scene, coneGeo, coneMat, [0, .063, 0], [1, 1, 1], false);
    const arcPositions = new Float32Array(43 * 3);
    const arcGeo = new THREE.BufferGeometry();
    arcGeo.setAttribute('position', new THREE.BufferAttribute(arcPositions, 3));
    geometryCache.set(`${id}:arc`, arcGeo);
    const arcMat = new THREE.LineBasicMaterial({ color: enemy ? 0xffc579 : 0xf4e9cb, transparent: true, opacity: .7, depthWrite: false });
    ownedMaterials.add(arcMat);
    const arc = new THREE.Line(arcGeo, arcMat);
    arc.position.y = .075;
    scene.add(arc);
    return { root, body, head, leftArm, rightArm, leftLeg, rightLeg, sash, sash2, coatLeft, coatRight,
      belt, skin, cloth, armor, footMat, footprint, shadow, indicator, healthFill, cone, coneGeo, coneMat,
      conePositions, arc, arcGeo, arcMat, arcPositions, mantle, motion: createFighterMotion(),
      walkPhase: 0 };
  }
  fighters.player = createFighter('player');
  fighters.enemy = createFighter('enemy');
  const rigBatches = Object.values(fighters).map(fighter => batchFighter(scene, fighter.root));

  const particleCount = 180;
  const particlePositions = new Float32Array(particleCount * 3).fill(-99);
  const particleColors = new Float32Array(particleCount * 3);
  const particleState = Array.from({ length: particleCount }, () => ({ life: 0, duration: 1, vx: 0, vy: 0, vz: 0, r: 1, g: 1, b: 1 }));
  const particleGeo = geometry('particles', () => new THREE.BufferGeometry()
    .setAttribute('position', new THREE.BufferAttribute(particlePositions, 3))
    .setAttribute('color', new THREE.BufferAttribute(particleColors, 3)));
  const particleMat = new THREE.PointsMaterial({ size: .065, vertexColors: true, transparent: true, opacity: .95, depthWrite: false, blending: THREE.AdditiveBlending });
  ownedMaterials.add(particleMat);
  const impactSparks = new THREE.Points(particleGeo, particleMat);
  impactSparks.frustumCulled = false;
  scene.add(impactSparks);
  const waves = Array.from({ length: 8 }, () => {
    const mat = basic(0xffd896, { transparent: true, opacity: 0, depthWrite: false });
    const item = ring(scene, 1, .018, mat, .08, 64);
    item.visible = false;
    return { item, mat, life: 0, duration: .5, radius: 1 };
  });
  let particleCursor = 0, waveCursor = 0;

  function burst(event) {
    if (!event || !Number.isFinite(event.x) || !Number.isFinite(event.z)) return;
    const type = event.type;
    if (!['hit', 'block', 'deflect', 'break', 'style', 'phase', 'win', 'evade', 'strike'].includes(type)) return;
    const heavy = event.kind === 'heavy' || event.kind === 'hybrid' || event.damage >= 20;
    const actor = fighters[event.actor];
    const impactYaw = actor ? actor.root.rotation.y : 0;
    const color = new THREE.Color(type === 'deflect' ? 0xd8f6ff : type === 'style' ? STYLE_COLORS[event.style ?? 0] : type === 'break' || type === 'phase' ? 0xe97a4e : 0xffce84);
    const count = type === 'strike' ? 0 : type === 'evade' ? 5 : type === 'deflect' || type === 'break' ? 28 : type === 'win' ? 48 : heavy ? 20 : 9;
    for (let n = 0; n < count; n++) {
      const i = particleCursor++ % particleCount;
      const p = particleState[i];
      const a = type === 'hit' ? impactYaw + (random() - .5) * 2.6 : random() * TAU;
      const speed = (heavy ? 1.4 : .7) + random() * 2.5;
      p.life = p.duration = .22 + random() * .42;
      p.vx = Math.sin(a) * speed; p.vz = Math.cos(a) * speed; p.vy = 1.2 + random() * 2.2;
      p.r = color.r; p.g = color.g; p.b = color.b;
      const contact = type === 'hit' ? -.28 : 0;
      particlePositions[i * 3] = event.x + Math.sin(impactYaw) * contact;
      particlePositions[i * 3 + 1] = type === 'style' || type === 'evade' ? .1 : .8 + random() * .35;
      particlePositions[i * 3 + 2] = event.z + Math.cos(impactYaw) * contact;
    }
    if (['deflect', 'break', 'style', 'phase', 'win'].includes(type)) {
      const wave = waves[waveCursor++ % waves.length];
      wave.life = wave.duration = type === 'phase' || type === 'win' ? .8 : .4;
      wave.radius = type === 'phase' || type === 'win' ? 3.8 : 1.35;
      wave.item.position.set(event.x, .09, event.z);
      wave.mat.color.copy(color);
      wave.item.visible = true;
    }
  }

  function updateTelegraph(rig, fighter, enemy) {
    const state = String(fighter.state || 'idle').toLowerCase();
    const attack = fighter.attack;
    const show = attack && (state === 'windup' || state === 'active') && (enemy || state === 'active');
    rig.cone.visible = rig.arc.visible = !!show;
    if (!show) return;
    const radius = attack.range || 1.7;
    const arc = clamp(attack.arc || 1.4, .1, TAU);
    if (rig.tellRadius !== radius || rig.tellArc !== arc) {
      rig.tellRadius = radius;
      rig.tellArc = arc;
      for (let i = 0; i < 40; i++) {
        const a = -arc / 2 + arc * i / 40;
        const b = -arc / 2 + arc * (i + 1) / 40;
        const k = i * 9;
        rig.conePositions[k] = 0; rig.conePositions[k + 1] = 0; rig.conePositions[k + 2] = 0;
        rig.conePositions[k + 3] = Math.sin(a) * radius; rig.conePositions[k + 4] = 0; rig.conePositions[k + 5] = Math.cos(a) * radius;
        rig.conePositions[k + 6] = Math.sin(b) * radius; rig.conePositions[k + 7] = 0; rig.conePositions[k + 8] = Math.cos(b) * radius;
      }
      rig.arcPositions[0] = 0; rig.arcPositions[1] = 0; rig.arcPositions[2] = 0;
      for (let i = 0; i <= 40; i++) {
        const a = -arc / 2 + arc * i / 40;
        rig.arcPositions[(i + 1) * 3] = Math.sin(a) * radius;
        rig.arcPositions[(i + 1) * 3 + 1] = 0;
        rig.arcPositions[(i + 1) * 3 + 2] = Math.cos(a) * radius;
      }
      rig.arcPositions[126] = rig.arcPositions[127] = rig.arcPositions[128] = 0;
      rig.coneGeo.attributes.position.needsUpdate = true;
      rig.arcGeo.attributes.position.needsUpdate = true;
      rig.coneGeo.computeBoundingSphere();
      rig.arcGeo.computeBoundingSphere();
    }
    rig.cone.position.set(fighter.x, .063, fighter.z);
    rig.arc.position.set(fighter.x, .078, fighter.z);
    rig.cone.rotation.y = rig.arc.rotation.y = fighter.yaw || 0;
    const progress = clamp((fighter.stateTime || 0) / (fighter.stateDuration || attack.windup || 1), 0, 1);
    rig.coneMat.opacity = enemy ? state === 'active' ? .27 : .075 + .14 * progress : .1;
    rig.arcMat.opacity = state === 'active' ? .95 : .35 + .55 * progress;
    rig.coneMat.color.setHex(state === 'active' ? enemy ? 0xec804b : 0xe6dcc0 : attack.sweep ? 0xd57e68 : 0xe9ad64);
  }

  function updateFighter(rig, f, dt, elapsed, enemy, mode) {
    if (!f) { rig.root.visible = rig.footprint.visible = rig.shadow.visible = rig.indicator.visible = false; return; }
    rig.root.visible = rig.footprint.visible = rig.shadow.visible = true;
    const state = String(f.state || 'idle').toLowerCase();
    const style = clamp(f.style || 0, 0, 2);
    const targetScale = enemy && mode === 'boss' ? 1.15 : 1;
    rig.root.scale.setScalar(targetScale);
    rig.mantle.visible = enemy && mode === 'boss';
    rig.belt.color.setHex(enemy ? mode === 'boss' ? 0xa8543c : 0x81918d : STYLE_COLORS[style]);
    rig.footMat.color.setHex(f.invulnerable ? 0xe0f4e8 : enemy ? 0xdd8968 : STYLE_COLORS[style]);
    const p = updateFighterMotion(rig.motion, f, dt, elapsed, enemy);
    const time = rig.motion.stanceTime;
    const speed = rig.motion.speed;
    rig.walkPhase = rig.motion.phase;
    const forwardX = Math.sin(f.yaw || 0), forwardZ = Math.cos(f.yaw || 0);
    rig.root.position.set(f.x + forwardX * p.lean + forwardZ * p.sway, p.rootY,
      f.z + forwardZ * p.lean - forwardX * p.sway);
    rig.root.rotation.set(0, f.yaw || 0, p.fall);
    rig.body.rotation.set(p.bx, p.by, p.bz);
    rig.head.rotation.set(p.hx, p.hy, p.hz);
    rig.leftArm.pivot.rotation.set(p.la, p.lay, p.laz);
    rig.rightArm.pivot.rotation.set(p.ra, p.ray, p.raz);
    rig.leftArm.joint.rotation.x = p.le; rig.rightArm.joint.rotation.x = p.re;
    rig.leftLeg.pivot.rotation.set(p.ll, 0, p.llz);
    rig.rightLeg.pivot.rotation.set(p.rl, 0, p.rlz);
    rig.leftLeg.joint.rotation.x = p.lk; rig.rightLeg.joint.rotation.x = p.rk;
    rig.leftLeg.foot.rotation.x = p.lf; rig.rightLeg.foot.rotation.x = p.rf;
    // Inertial cloth is bounded and deterministic; there is no per-frame mesh work.
    rig.sash.rotation.set(Math.sin(time * 3.2 + rig.walkPhase) * .035 - speed * .025,
      p.by * .10, -.12 + Math.sin(rig.walkPhase) * Math.min(speed, 4) * .014);
    rig.sash2.rotation.set(-Math.sin(time * 2.8 + rig.walkPhase) * .03 - speed * .018,
      -p.by * .08, .12 - Math.sin(rig.walkPhase) * Math.min(speed, 4) * .012);
    rig.coatLeft.rotation.set(.045 + speed * .032 + Math.max(0, p.ll) * .18,
      p.by * .12, -.035 + p.bz * .2);
    rig.coatRight.rotation.set(.035 + speed * .028 + Math.max(0, p.rl) * .18,
      -p.by * .1, .035 + p.bz * .2);
    rig.cloth.emissive.setRGB(rig.motion.impact * .12, rig.motion.impact * .035, rig.motion.impact * .015);
    rig.skin.emissive.setRGB(rig.motion.impact * .055, rig.motion.impact * .018, 0);
    rig.footprint.position.set(f.x, 0, f.z);
    rig.footprint.rotation.y = f.yaw || 0;
    rig.footMat.opacity = state === 'dead' ? .2 : .65;
    rig.shadow.position.set(f.x, .04, f.z);
    rig.indicator.visible = f.health > 0 && (enemy || f.health < f.maxHealth);
    rig.indicator.position.set(f.x, targetScale * 2.15, f.z);
    rig.indicator.quaternion.copy(camera.quaternion);
    const fraction = clamp(f.health / (f.maxHealth || 100), 0, 1);
    rig.healthFill.scale.x = Math.max(.001, fraction);
    rig.healthFill.position.x = -(1 - fraction) * .405;
    updateTelegraph(rig, f, enemy);
  }

  function resetCamera(game) {
    const player = game?.player;
    if (!player) return;
    const enemy = game.enemy;
    const dx = enemy ? enemy.x - player.x : 0;
    const dz = enemy ? enemy.z - player.z : 0;
    cameraYaw = freeYaw = Math.hypot(dx, dz) > .1 ? Math.atan2(dx, dz) : (player.yaw ?? Math.PI);
    cameraPitch = freePitch = .34;
    cameraLocked = true;
    cameraReady = true;
    followAnchor.set(player.x, 1.1, player.z);
    updateCamera(game, 0, true, true);
  }

  function orbit(dx, dy) {
    if (!Number.isFinite(dx) || !Number.isFinite(dy)) return;
    freeYaw -= dx * .004;
    freeYaw = Math.atan2(Math.sin(freeYaw), Math.cos(freeYaw));
    freePitch = clamp(freePitch + dy * .003, -.08, .62);
  }

  function resolveCameraObstruction(origin) {
    collisionDirection.subVectors(camera.position, origin);
    const desiredDistance = collisionDirection.length();
    if (desiredDistance < .001) return;
    collisionDirection.multiplyScalar(1 / desiredDistance);
    collisionRay.set(origin, collisionDirection);
    let safeDistance = desiredDistance;
    for (const bounds of cameraObstacles) {
      if (!collisionRay.intersectBox(bounds, collisionPoint)) continue;
      const distance = collisionPoint.distanceTo(origin);
      if (distance < safeDistance) safeDistance = Math.max(.12, distance - .035);
    }
    cameraObstructed = safeDistance < desiredDistance - .001;
    if (cameraObstructed) camera.position.copy(origin).addScaledVector(collisionDirection, safeDistance);
    camera.position.y = Math.max(.38, camera.position.y);
  }

  function updateCamera(game, dt, locked, snap = false) {
    const player = game.player;
    if (!player) return;
    if (!cameraReady) { resetCamera(game); return; }
    const enemy = game.enemy;
    cameraLocked = !!locked && !!enemy;
    const lookBlend = snap ? 1 : 1 - Math.exp(-dt * 9);
    const followBlend = snap ? 1 : 1 - Math.exp(-dt * 14);
    const positionBlend = snap ? 1 : 1 - Math.exp(-dt * 12);
    actualAnchor.set(player.x, 1.1, player.z);
    followAnchor.lerp(actualAnchor, followBlend);
    let desiredYaw = freeYaw;
    let desiredPitch = freePitch;
    let enemyDistance = 0;
    if (cameraLocked) {
      const dx = enemy.x - player.x, dz = enemy.z - player.z;
      enemyDistance = Math.hypot(dx, dz);
      // Avoid an abrupt half-turn if the fighters briefly overlap during evasion.
      desiredYaw = enemyDistance > .65 ? Math.atan2(dx, dz) : cameraYaw;
      desiredPitch = .34;
    }
    const yawDifference = Math.atan2(Math.sin(desiredYaw - cameraYaw), Math.cos(desiredYaw - cameraYaw));
    cameraYaw += yawDifference * lookBlend;
    cameraYaw = Math.atan2(Math.sin(cameraYaw), Math.cos(cameraYaw));
    cameraPitch += (desiredPitch - cameraPitch) * lookBlend;
    if (cameraLocked) { freeYaw = cameraYaw; freePitch = cameraPitch; }
    const forwardX = Math.sin(cameraYaw), forwardZ = Math.cos(cameraYaw);
    const rightX = -forwardZ, rightZ = forwardX;
    const portrait = camera.aspect < .85;
    const boom = portrait ? 5.1 : 4.6;
    // As the fighters close, move to the side so the opponent's hands remain visible.
    const closeRange = cameraLocked ? 1 - clamp((enemyDistance - 1) / 4, 0, 1) : 0;
    const shoulder = (portrait ? 1.05 : 1.45) + closeRange * .60;
    const ahead = cameraLocked ? Math.min(.75, enemyDistance * .32) : .45;
    const horizontal = Math.cos(cameraPitch) * boom;
    desiredCameraPosition.set(
      followAnchor.x - forwardX * horizontal + rightX * shoulder,
      followAnchor.y + Math.sin(cameraPitch) * boom,
      followAnchor.z - forwardZ * horizontal + rightZ * shoulder,
    );
    desiredCameraTarget.set(
      followAnchor.x + forwardX * ahead + rightX * shoulder * .3,
      followAnchor.y + .05,
      followAnchor.z + forwardZ * ahead + rightZ * shoulder * .3,
    );
    if (snap) {
      camera.position.copy(desiredCameraPosition);
      cameraTarget.copy(desiredCameraTarget);
    } else {
      camera.position.lerp(desiredCameraPosition, positionBlend);
      cameraTarget.lerp(desiredCameraTarget, followBlend);
    }
    // Pull in immediately at a wall; normal position smoothing eases back out.
    resolveCameraObstruction(actualAnchor);
    framedTarget.copy(cameraTarget);
    // Near a pillar, the shoulder offset takes up more of the narrow view.
    // Aim halfway between the fighters' sight lines as the follow arm retracts.
    const armLength = actualAnchor.distanceTo(camera.position);
    const closeWallBlend = 1 - ease((armLength - 1.8) / 2.2);
    if (closeWallBlend > 0) {
      nearView.subVectors(actualAnchor, camera.position).normalize();
      if (cameraLocked) {
        enemyView.set(enemy.x, 1.1, enemy.z).sub(camera.position).normalize();
        nearView.add(enemyView).normalize();
      }
      nearView.multiplyScalar(Math.max(.5, camera.position.distanceTo(cameraTarget))).add(camera.position);
      framedTarget.lerp(nearView, closeWallBlend);
    }
    camera.lookAt(framedTarget);
    camera.updateMatrixWorld(true);
    moonHalo.quaternion.copy(camera.quaternion);
  }

  function movementBasis() {
    camera.getWorldDirection(viewDirection);
    const horizontalLength = Math.hypot(viewDirection.x, viewDirection.z);
    const x = horizontalLength > .0001 ? viewDirection.x / horizontalLength : Math.sin(cameraYaw);
    const z = horizontalLength > .0001 ? viewDirection.z / horizontalLength : Math.cos(cameraYaw);
    return { forward: { x, z }, right: { x: -z, z: x } };
  }

  function cameraSnapshot(game) {
    camera.updateMatrixWorld(true);
    const plain = value => ({ x: value.x, y: value.y, z: value.z });
    const project = (fighter, y) => fighter
      ? plain(new THREE.Vector3(fighter.x, y, fighter.z).project(camera)) : null;
    const enemyHeight = game?.mode === 'boss' ? 2.16 : 1.88;
    return {
      type: 'perspective', perspective: camera.isPerspectiveCamera, fov: camera.fov,
      aspect: camera.aspect, locked: cameraLocked, obstructed: cameraObstructed,
      position: plain(camera.position), target: plain(framedTarget),
      player: project(game?.player, 1), enemy: project(game?.enemy, enemyHeight * .52),
      playerBounds: { feet: project(game?.player, .03), head: project(game?.player, 1.88) },
      enemyBounds: { feet: project(game?.enemy, .03), head: project(game?.enemy, enemyHeight) },
    };
  }

  function resize() {
    const rect = canvas.getBoundingClientRect();
    width = Math.max(1, rect.width); height = Math.max(1, rect.height);
    fitResolution();
    renderer.setSize(width, height, false);
    camera.aspect = width / height;
    camera.fov = camera.aspect < .85 ? 66 : camera.aspect < 1.2 ? 62 : 58;
    camera.updateProjectionMatrix();
  }

  function render(game, dt = 1 / 60, elapsed = 0, locked = true) {
    dt = clamp(dt || 0, 0, .1);
    elapsed = Number.isFinite(elapsed) ? elapsed : game.elapsed || 0;
    if (lastMode !== game.mode || (previousResult && previousResult !== 'playing' && game.result === 'playing')) {
      lastMode = game.mode;
      resetCamera(game);
    }
    previousResult = game.result;
    // Leave the left side of the menu for the encounter selector. Combat is centered.
    const menuOffset = !game.presentationPlaying && camera.aspect > 1.25 ? -Math.min(10, camera.aspect * 5) : 0;
    if (camera.filmOffset !== menuOffset) {
      camera.filmOffset = menuOffset;
      camera.updateProjectionMatrix();
    }
    updateCamera(game, dt, locked);
    updateFighter(fighters.player, game.player, dt, elapsed, false, game.mode);
    updateFighter(fighters.enemy, game.enemy, dt, elapsed, true, game.mode);
    for (const batch of rigBatches) batch.sync();
    flames.forEach(flame => {
      const pulse = 1 + Math.sin(elapsed * 8.5 + flame.phase) * .12 + Math.sin(elapsed * 17 + flame.phase) * .05;
      flame.outer.scale.set(.23 * (2 - pulse), .52 * pulse, .23 * (2 - pulse));
      flame.outer.rotation.y = elapsed * .6 + flame.phase;
      flame.inner.scale.y = .3 * pulse;
      flame.light.intensity = 8.5 * pulse;
    });
    for (let i = 0; i < dustCount; i++) {
      const d = dustBase[i];
      dustPositions[i * 3] = d.x + Math.sin(elapsed * .25 + d.phase) * .28;
      dustPositions[i * 3 + 1] = (d.y + elapsed * d.speed) % 5.5;
      dustPositions[i * 3 + 2] = d.z + Math.cos(elapsed * .2 + d.phase) * .15;
    }
    dustGeo.attributes.position.needsUpdate = true;
    for (let i = 0; i < particleCount; i++) {
      const p = particleState[i];
      if (p.life <= 0) { particlePositions[i * 3 + 1] = -99; continue; }
      p.life -= dt; p.vy -= dt * 5;
      particlePositions[i * 3] += p.vx * dt;
      particlePositions[i * 3 + 1] += p.vy * dt;
      particlePositions[i * 3 + 2] += p.vz * dt;
      const fade = Math.max(0, p.life / p.duration);
      particleColors[i * 3] = p.r * fade;
      particleColors[i * 3 + 1] = p.g * fade;
      particleColors[i * 3 + 2] = p.b * fade;
    }
    particleGeo.attributes.position.needsUpdate = true;
    particleGeo.attributes.color.needsUpdate = true;

    for (const wave of waves) {
      if (wave.life <= 0) { wave.item.visible = false; continue; }
      wave.life -= dt;
      const p = 1 - wave.life / wave.duration;
      wave.item.scale.setScalar(.25 + p * wave.radius);
      wave.mat.opacity = (1 - p) * .7;
    }
    renderer.render(scene, camera);
  }

  function dispose() {
    for (const batch of rigBatches) batch.dispose();
    staticInstances.forEach(item => item.dispose());
    geometryCache.forEach(geo => geo.dispose());
    ownedMaterials.forEach(mat => mat.dispose());
    moonLight.shadow.map?.dispose();
    moonLight.shadow.mapPass?.dispose();
    renderer.dispose();
  }
  resize();
  const stats = () => ({ renderScale, pixelRatio: renderer.getPixelRatio(), calls: renderer.info.render.calls, triangles: renderer.info.render.triangles, geometries: renderer.info.memory.geometries, staticBatches: staticInstances.length });
  return { render, resize, burst, dispose, stats, resetCamera, orbit, movementBasis, cameraSnapshot, trackFrameTime };
}
