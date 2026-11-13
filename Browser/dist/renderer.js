import * as THREE from './vendor/three.module.js';

// Procedural, asset-free presentation for the browser combat experiment.
const TAU = Math.PI * 2;
const STYLE_COLORS = [0xe4b970, 0x9ddbd6, 0xbcb0ed];
const clamp = (x, lo, hi) => Math.max(lo, Math.min(hi, x));
const ease = x => { x = clamp(x, 0, 1); return x * x * (3 - 2 * x); };

export function createRenderer(canvas) {
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: false, powerPreference: 'high-performance' });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.26;
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  const scene = new THREE.Scene();
  scene.background = new THREE.Color(0x0b121a);
  scene.fog = new THREE.FogExp2(0x0b121a, 0.019);
  const camera = new THREE.OrthographicCamera(-16, 16, 11, -11, .1, 110);
  camera.position.set(12, 16, 14);
  camera.lookAt(0, .25, 0);
  const raycaster = new THREE.Raycaster();
  const pointer = new THREE.Vector2();
  const groundPlane = new THREE.Plane(new THREE.Vector3(0, 1, 0), 0);
  const groundPoint = new THREE.Vector3();
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
  const wood = material(0x272a29);
  const deepWood = material(0x182024);
  const emberMaterial = basic(0xffbc66, { transparent: true, opacity: .85 });
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

  scene.add(new THREE.HemisphereLight(0xa7c2d3, 0x49392a, 1.95));
  const moonLight = new THREE.DirectionalLight(0xb6d5ee, 2.35);
  moonLight.position.set(-8, 16, -12);
  moonLight.castShadow = true;
  moonLight.shadow.mapSize.set(1024, 1024);
  Object.assign(moonLight.shadow.camera, { left: -14, right: 14, top: 14, bottom: -14, near: .5, far: 48 });
  moonLight.shadow.bias = -.0008;
  moonLight.shadow.normalBias = .035;
  scene.add(moonLight);
  const warmFill = new THREE.DirectionalLight(0xe6b67d, .95);
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

  function pillar(x, z, h, angle = 0, damaged = false) {
    const group = new THREE.Group();
    group.position.set(x, 0, z);
    group.rotation.y = angle;
    mesh(group, box, stone[1], [0, .15, 0], [.95, .3, .95]);
    mesh(group, box, edgeStone, [0, .38, 0], [.72, .18, .72]);
    const count = Math.ceil(h / .62);
    for (let j = 0; j < count; j++) {
      const shaft = mesh(group, tapered, stone[j % stone.length], [0, .53 + j * .58, 0], [.3, .58, .3]);
      shaft.rotation.y = j * .04;
      if (damaged && j === count - 1) shaft.rotation.z = .12;
    }
    if (!damaged) {
      const top = .52 + count * .58;
      mesh(group, box, edgeStone, [0, top, 0], [.7, .18, .7]);
      mesh(group, box, stone[1], [0, top + .15, 0], [.9, .18, .9]);
      mesh(group, box, brass, [0, top + .27, 0], [.73, .06, .73]);
    }
    scene.add(group);
    return group;
  }
  [-1.08, -.63, -.23, .22, .68, 1.12, 1.68, 2.55].forEach((angle, i) => {
    pillar(Math.sin(angle) * 10.25, -Math.cos(angle) * 10.25, i % 3 === 0 ? 2.1 : 3.4, angle, i % 3 === 0);
  });
  for (let i = 0; i < 18; i++) {
    const a = random() * TAU, r = 10.3 + random() * 1.8;
    const rubble = mesh(scene, box, stone[i % stone.length], [Math.sin(a) * r, -.1 + random() * .16, Math.cos(a) * r], [.25 + random() * .6, .22 + random() * .35, .25 + random() * .5]);
    rubble.rotation.set(random() * .3, random() * TAU, random() * .4);
  }
  // Broken ceremonial gate and a quiet, layered monastery silhouette.
  const gate = new THREE.Group();
  gate.position.set(0, 0, -10.8);
  [-3.0, 3.0].forEach(x => {
    mesh(gate, box, edgeStone, [x, 2.3, 0], [.8, 4.6, .85]);
    mesh(gate, box, brass, [x, 1.0, .01], [.84, .08, .9]);
    mesh(gate, box, brass, [x, 4.25, .01], [.84, .09, .9]);
    mesh(gate, box, stone[2], [x, .2, 0], [1.25, .4, 1.25]);
  });
  mesh(gate, box, stone[2], [0, 4.64, 0], [7.1, .68, 1.12]);
  mesh(gate, box, brass, [0, 4.98, .08], [7.45, .06, 1.3]);
  mesh(gate, box, deepWood, [0, 5.18, 0], [8.1, .3, 1.7]);
  [-1, 1].forEach(sign => {
    const tip = mesh(gate, box, deepWood, [sign * 4.1, 5.35, 0], [1.0, .24, 1.7]);
    tip.rotation.z = sign * .25;
  });
  mesh(gate, box, blackStone, [0, 4.6, .59], [2.0, .44, .08]);
  for (let i = 0; i < 4; i++) {
    mesh(gate, box, brass, [-.57 + i * .38, 4.63, .644], [.045, .22, .015], false);
  }
  scene.add(gate);
  const silhouette = material(0x111d26, { roughness: 1 });
  const temple = new THREE.Group();
  temple.position.set(-.8, 0, -20);
  [0, 1, 2].forEach(level => {
    const y = 1.4 + level * 2.05;
    mesh(temple, box, silhouette, [0, y, 0], [7.5 - level * 1.8, 1.85, 3.6 - level * .5], false);
    mesh(temple, box, deepWood, [0, y + 1.02, 0], [10.2 - level * 2.1, .3, 5.0 - level * .7], false);
    for (const sign of [-1, 1]) {
      const tip = mesh(temple, box, deepWood, [sign * (4.8 - level * 1.0), y + 1.14, 0], [1.2, .24, 5.0 - level * .7], false);
      tip.rotation.z = sign * .27;
    }
  });
  mesh(temple, cylinder, brass, [0, 7.3, 0], [.07, 1.2, .07], false);
  scene.add(temple);
  const mountainGeo = geometry('mountain', () => new THREE.ConeGeometry(1, 1, 5));
  for (let i = 0; i < 17; i++) {
    const a = Math.PI * (.52 + i * .062);
    const m = mesh(scene, mountainGeo, silhouette, [Math.cos(a) * 27, 2.5 + random() * 2, -18 - random() * 12], [5 + random() * 7, 8 + random() * 13, 4 + random() * 7], false);
    m.rotation.y = random() * TAU;
  }
  const moon = mesh(scene, sphere, basic(0xd2d8c5), [-8, 11, -26], [1.45, 1.45, 1.45], false);
  const moonHalo = mesh(scene, geometry('moonhalo', () => new THREE.RingGeometry(1.6, 1.64, 96)), basic(0x829293, { transparent: true, opacity: .2, side: THREE.DoubleSide }), [-8, 11, -26], [1, 1, 1], false);
  moonHalo.quaternion.copy(camera.quaternion);

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
    if (!item.isMesh || animatedFlames.has(item)) return;
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
    mesh(pivot, tapered, clothMat, [0, -upperLength / 2, 0], [leg ? .135 : .087, upperLength, leg ? .135 : .087]);
    const joint = new THREE.Group();
    joint.position.y = -upperLength;
    pivot.add(joint);
    mesh(joint, tapered, leg ? clothMat : skinMat, [0, -lowerLength / 2, 0], [leg ? .105 : .071, lowerLength, leg ? .105 : .071]);
    for (let j = 0; j < 3; j++) {
      mesh(joint, cylinder, wrapMat, [0, -lowerLength + .045 + j * .035, 0], [leg ? .109 : .079, .026, leg ? .109 : .079]);
    }
    if (leg) mesh(joint, box, clothMat, [0, -lowerLength + .005, .07], [.19, .105, .32]);
    else mesh(joint, sphere, skinMat, [0, -lowerLength - .027, .025], [.088, .095, .09]);
    return { pivot, joint };
  }

  function createFighter(id) {
    const enemy = id === 'enemy';
    const root = new THREE.Group();
    const skin = material(enemy ? 0xa98a75 : 0xc69b72, { roughness: .78 });
    const cloth = material(enemy ? 0x51414c : 0x36535b);
    const trousers = material(enemy ? 0x38343e : 0x30434a);
    const wrap = material(enemy ? 0x999588 : 0xe5d5b8, { roughness: 1 });
    const belt = material(enemy ? 0x924e3d : STYLE_COLORS[0]);
    const hair = material(enemy ? 0xa9aaa3 : 0x202727);
    const eyes = basic(enemy ? 0xe9a563 : 0xe6d7b2);
    const body = new THREE.Group();
    body.position.y = 1.05;
    root.add(body);
    mesh(body, tapered, cloth, [0, .13, 0], [.285, .55, .195]);
    const lapelLeft = mesh(body, box, wrap, [-.115, .16, .17], [.065, .48, .028]);
    lapelLeft.rotation.z = -.18;
    const lapelRight = mesh(body, box, cloth, [.105, .13, .18], [.12, .5, .035]);
    lapelRight.rotation.z = .2;
    mesh(body, cylinder, skin, [0, .45, 0], [.085, .13, .085]);
    const head = new THREE.Group();
    head.position.set(0, .59, 0);
    body.add(head);
    mesh(head, sphere, skin, [0, .025, 0], [.165, .205, .154]);
    mesh(head, sphere, hair, [0, .102, -.04], [.173, .145, .148]);
    mesh(head, sphere, hair, [0, .235, -.055], [.08, .078, .075]);
    mesh(head, box, cloth, [0, .055, .142], [.285, .055, .04]);
    [-.07, .07].forEach(x => mesh(head, box, eyes, [x, .058, .164], [.042, .012, .008], false));
    mesh(root, tapered, trousers, [0, .87, 0], [.255, .22, .185]);
    mesh(root, cylinder, belt, [0, .96, 0], [.265, .095, .2]);
    const sash = mesh(root, box, belt, [-.13, .69, .17], [.13, .49, .035]);
    sash.rotation.z = -.14;
    const sash2 = mesh(root, box, belt, [.095, .72, .17], [.09, .4, .03]);
    sash2.rotation.z = .16;
    const leftArm = limb(body, -.31, .34, 0, .29, .29, skin, cloth, wrap);
    const rightArm = limb(body, .31, .34, 0, .29, .29, skin, cloth, wrap);
    const leftLeg = limb(root, -.15, .87, 0, .37, .38, skin, trousers, wrap, true);
    const rightLeg = limb(root, .15, .87, 0, .37, .38, skin, trousers, wrap, true);
    const mantle = new THREE.Group();
    [-1, 1].forEach(sign => {
      const shoulder = mesh(mantle, tapered, blackStone, [sign * .28, .38, -.045], [.14, .16, .21]);
      shoulder.rotation.z = sign * .45;
      const spike = mesh(mantle, octa, brass, [sign * .3, .52, -.08], [.055, .24, .06]);
      spike.rotation.z = sign * -.4;
    });
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
    return { root, body, head, leftArm, rightArm, leftLeg, rightLeg, sash, sash2, belt, footMat, footprint, shadow, indicator, healthFill, cone, coneGeo, coneMat, conePositions, arc, arcGeo, arcMat, arcPositions, mantle, lastX: null, lastZ: null, walkPhase: 0, attackIndex: 0, oldState: null, modeScale: 1 };
  }
  fighters.player = createFighter('player');
  fighters.enemy = createFighter('enemy');

  const particleCount = 180;
  const particlePositions = new Float32Array(particleCount * 3).fill(-99);
  const particleColors = new Float32Array(particleCount * 3);
  const particleState = Array.from({ length: particleCount }, () => ({ life: 0, duration: 1, vx: 0, vy: 0, vz: 0, r: 1, g: 1, b: 1 }));
  const particleGeo = geometry('particles', () => new THREE.BufferGeometry()
    .setAttribute('position', new THREE.BufferAttribute(particlePositions, 3))
    .setAttribute('color', new THREE.BufferAttribute(particleColors, 3)));
  const particleMat = new THREE.PointsMaterial({ size: .065, vertexColors: true, transparent: true, opacity: .95, depthWrite: false, blending: THREE.AdditiveBlending });
  ownedMaterials.add(particleMat);
  scene.add(new THREE.Points(particleGeo, particleMat));
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
    const color = new THREE.Color(type === 'deflect' ? 0xd8f6ff : type === 'style' ? STYLE_COLORS[event.style ?? 0] : type === 'break' || type === 'phase' ? 0xe97a4e : 0xffce84);
    const count = type === 'strike' || type === 'evade' ? 5 : type === 'deflect' || type === 'break' ? 28 : type === 'win' ? 48 : 14;
    for (let n = 0; n < count; n++) {
      const i = particleCursor++ % particleCount;
      const p = particleState[i];
      const a = random() * TAU;
      const speed = .8 + random() * 2.8;
      p.life = p.duration = .22 + random() * .42;
      p.vx = Math.sin(a) * speed; p.vz = Math.cos(a) * speed; p.vy = 1.2 + random() * 2.2;
      p.r = color.r; p.g = color.g; p.b = color.b;
      particlePositions[i * 3] = event.x;
      particlePositions[i * 3 + 1] = type === 'style' || type === 'evade' ? .1 : .8 + random() * .35;
      particlePositions[i * 3 + 2] = event.z;
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
    rig.modeScale = targetScale;
    rig.root.scale.setScalar(targetScale);
    rig.mantle.visible = enemy && mode === 'boss';
    rig.belt.color.setHex(enemy ? mode === 'boss' ? 0xa8543c : 0x81918d : STYLE_COLORS[style]);
    rig.footMat.color.setHex(f.invulnerable ? 0xe0f4e8 : enemy ? 0xdd8968 : STYLE_COLORS[style]);
    const dx = rig.lastX == null ? 0 : f.x - rig.lastX;
    const dz = rig.lastZ == null ? 0 : f.z - rig.lastZ;
    const speed = dt > 0 ? Math.min(Math.hypot(dx, dz) / dt, 8) : 0;
    rig.lastX = f.x; rig.lastZ = f.z;
    rig.walkPhase += Math.min(speed, 5) * dt * 5.2;
    if (state === 'windup' && rig.oldState !== state) rig.attackIndex++;
    rig.oldState = state;
    const moving = state === 'idle' && speed > .15;
    const gait = Math.sin(rig.walkPhase);
    const p = { la: .16, ra: .18, laz: .15, raz: -.15, le: -1.5, re: -1.45, ll: -.10, rl: .10, llz: .06, rlz: -.06, lk: .12, rk: .12, bx: 0, by: 0, bz: 0, rootY: 0, lean: 0, fall: 0 };
    if (style === 1) { p.la = -.3; p.ra = -.05; p.le = -1.3; p.re = -1.7; p.by = -.12; }
    if (style === 2) { p.la = .25; p.ra = -.15; p.le = -1.25; p.re = -1.4; p.ll = -.25; p.rl = .19; p.by = -.22; p.laz = .25; }
    if (moving) {
      p.ll = gait * .55; p.rl = -gait * .55;
      p.lk = .16 + Math.max(0, -gait) * .55;
      p.rk = .16 + Math.max(0, gait) * .55;
      p.la += -gait * .15; p.ra += gait * .15;
      p.rootY = Math.abs(Math.cos(rig.walkPhase)) * .035;
      p.bx = .07;
    }
    if (['windup', 'active', 'recovery'].includes(state) && f.attack) {
      const attack = f.attack;
      const windup = state === 'windup' ? ease((f.stateTime || 0) / (f.stateDuration || attack.windup || .2)) : 1;
      const recovery = state === 'recovery' ? 1 - ease((f.stateTime || 0) / (f.stateDuration || attack.recovery || .3)) : 1;
      const strike = state === 'windup' ? 0 : recovery;
      const load = windup * recovery;
      const attackStyle = attack.style ?? style;
      const heavy = attack.kind !== 'light';
      p.by = -.3 * load + .65 * strike;
      p.bx = .08 * strike;
      if (attackStyle === 2 || attack.sweep) {
        p.rl = -1.0 * load - .50 * strike;
        p.rk = 1.45 * load - 1.35 * strike;
        p.rlz = heavy ? -.65 * strike : -.07;
        p.bx = -.22 * load;
        p.la = -.3; p.ra = .5; p.laz = .5 * load; p.raz = -.6 * load;
        p.le = -.7; p.re = -.8;
        p.by = heavy ? -.7 * load + 1.3 * strike : -.13;
        p.lk = .22;
        p.rootY = .05 * strike;
      } else if (attackStyle === 0 && heavy) {
        p.rl = -.25 - .95 * strike;
        p.rk = .35 + 1.55 * load;
        p.la = -.5 * load; p.ra = -.65 * load;
        p.le = -1.6 + .7 * strike; p.re = -1.6 + .7 * strike;
        p.bx = -.1 + .2 * strike;
        p.rootY = .04 * strike;
      } else {
        const left = attackStyle === 1 && rig.attackIndex % 2 === 0;
        const shoulder = .25 * load - 1.8 * strike;
        const elbow = -1.65 * load + 1.58 * strike;
        if (left) { p.la = shoulder; p.le = elbow; p.laz = -.06; }
        else { p.ra = shoulder; p.re = elbow; p.raz = .06; }
        if (attackStyle === 1 && heavy) { p.la = shoulder; p.le = elbow; p.laz = .02; }
        p.ll = -.26 * strike; p.rl = .22 * strike;
        p.lean = .08 * strike;
      }
    }
    if (state === 'guard' || state === 'guarding') {
      p.la = p.ra = -.45; p.le = p.re = -1.95;
      p.laz = -.17; p.raz = .17; p.bx = .06; p.lk = p.rk = .22;
    }
    if (state === 'evade' || state === 'evading') {
      p.rootY = -.26; p.bx = .48;
      p.ll = -.55; p.rl = -.9; p.lk = 1.25; p.rk = 1.45;
      p.la = -.7; p.ra = -.8; p.le = p.re = -.7;
    }
    if (state === 'switch' || state === 'switching') {
      const q = ease((f.stateTime || 0) / (f.stateDuration || .22));
      p.by = Math.sin(q * Math.PI) * .55;
      p.la = -.7; p.ra = -.7; p.le = -1.35; p.re = -1.35;
    }
    if (state === 'stun' || state === 'hitstun') {
      p.bx = -.25; p.bz = Math.sin(elapsed * 30) * .055; p.la = .3; p.ra = .4; p.le = -.5; p.re = -.4;
      p.rootY = -.055;
    }
    if (state === 'broken' || state === 'posturebroken') {
      p.rootY = -.35; p.bx = .48; p.ll = p.rl = -.6; p.lk = p.rk = 1.4;
      p.la = .15; p.ra = .2; p.le = p.re = -.3;
    }
    if (state === 'dead') { p.fall = 1.45; p.rootY = .12; p.la = -.6; p.ra = .3; p.le = -.2; p.re = -.3; p.ll = .2; p.rl = -.3; p.lk = .3; p.rk = .4; }
    const blend = 1 - Math.exp(-dt * (state === 'active' ? 40 : 19));
    const damp = (obj, key, value) => { obj[key] += (value - obj[key]) * blend; };
    const breathe = state === 'idle' ? Math.sin(elapsed * 2.5 + (enemy ? 1.5 : 0)) * .009 : 0;
    rig.root.position.set(f.x + Math.sin(f.yaw || 0) * p.lean, p.rootY + breathe, f.z + Math.cos(f.yaw || 0) * p.lean);
    rig.root.rotation.y = f.yaw || 0;
    damp(rig.root.rotation, 'z', p.fall);
    damp(rig.body.rotation, 'x', p.bx); damp(rig.body.rotation, 'y', p.by); damp(rig.body.rotation, 'z', p.bz);
    damp(rig.leftArm.pivot.rotation, 'x', p.la); damp(rig.rightArm.pivot.rotation, 'x', p.ra);
    damp(rig.leftArm.pivot.rotation, 'z', p.laz); damp(rig.rightArm.pivot.rotation, 'z', p.raz);
    damp(rig.leftArm.joint.rotation, 'x', p.le); damp(rig.rightArm.joint.rotation, 'x', p.re);
    damp(rig.leftLeg.pivot.rotation, 'x', p.ll); damp(rig.rightLeg.pivot.rotation, 'x', p.rl);
    damp(rig.leftLeg.pivot.rotation, 'z', p.llz); damp(rig.rightLeg.pivot.rotation, 'z', p.rlz);
    damp(rig.leftLeg.joint.rotation, 'x', p.lk); damp(rig.rightLeg.joint.rotation, 'x', p.rk);
    rig.sash.rotation.x = Math.sin(elapsed * 4 + rig.walkPhase) * (.04 + speed * .035);
    rig.sash2.rotation.x = -Math.sin(elapsed * 3.4 + rig.walkPhase) * (.035 + speed * .03);
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

  function resize() {
    const rect = canvas.getBoundingClientRect();
    width = Math.max(1, rect.width); height = Math.max(1, rect.height);
    renderer.setSize(width, height, false);
    const aspect = width / height;
    const half = aspect < 1.05 ? 12.1 / aspect : 11.5;
    camera.left = -half * aspect; camera.right = half * aspect;
    camera.top = half; camera.bottom = -half;
    camera.updateProjectionMatrix();
  }

  function render(game, dt = 1 / 60, elapsed = 0) {
    dt = clamp(dt || 0, 0, .1);
    elapsed = Number.isFinite(elapsed) ? elapsed : game.elapsed || 0;
    if (lastMode !== game.mode || (previousResult && previousResult !== 'playing' && game.result === 'playing')) {
      for (const rig of Object.values(fighters)) { rig.lastX = null; rig.lastZ = null; rig.root.rotation.z = 0; }
      lastMode = game.mode;
    }
    previousResult = game.result;
    const targetZoom = game.presentationPlaying ? 1.14 : 1;
    const zoomBlend = 1 - Math.exp(-Math.max(dt, .008) * 5);
    if (Math.abs(camera.zoom - targetZoom) > .0001) {
      camera.zoom += (targetZoom - camera.zoom) * zoomBlend;
      camera.updateProjectionMatrix();
    }
    updateFighter(fighters.player, game.player, dt, elapsed, false, game.mode);
    updateFighter(fighters.enemy, game.enemy, dt, elapsed, true, game.mode);
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
    particleGeo.boundingSphere = null;
    for (const wave of waves) {
      if (wave.life <= 0) { wave.item.visible = false; continue; }
      wave.life -= dt;
      const p = 1 - wave.life / wave.duration;
      wave.item.scale.setScalar(.25 + p * wave.radius);
      wave.mat.opacity = (1 - p) * .7;
    }
    renderer.render(scene, camera);
  }

  function projectPointer(clientX, clientY) {
    const rect = canvas.getBoundingClientRect();
    if (!rect.width || !rect.height) return null;
    pointer.set((clientX - rect.left) / rect.width * 2 - 1, -(clientY - rect.top) / rect.height * 2 + 1);
    raycaster.setFromCamera(pointer, camera);
    const result = raycaster.ray.intersectPlane(groundPlane, groundPoint);
    return result ? { x: result.x, z: result.z } : null;
  }

  function dispose() {
    staticInstances.forEach(item => item.dispose());
    geometryCache.forEach(geo => geo.dispose());
    ownedMaterials.forEach(mat => mat.dispose());
    moonLight.shadow.map?.dispose();
    moonLight.shadow.mapPass?.dispose();
    renderer.dispose();
  }
  resize();
  const stats = () => ({ calls: renderer.info.render.calls, triangles: renderer.info.render.triangles, geometries: renderer.info.memory.geometries, staticBatches: staticInstances.length });
  return { render, resize, projectPointer, burst, dispose, stats };
}
