import * as THREE from './vendor/three.module.js';
import { buildSanctuary } from './sanctuary.js';
import { hangStandards } from './standards.js';
import { createFighterMotion, updateFighterMotion } from './fighter-motion.js';
import { createFighterArt } from './fighter-art.js';
import { batchFighter } from './rig-batches.js';

// Third-person presentation for the browser combat experiment.
const TAU = Math.PI * 2;
const STYLE_COLORS = [0xe4b970, 0x9ddbd6, 0xbcb0ed];
const clamp = (x, lo, hi) => Math.max(lo, Math.min(hi, x));
const ease = x => { x = clamp(x, 0, 1); return x * x * (3 - 2 * x); };
const renderState = game => typeof game?.getRenderState === 'function' ? game.getRenderState() : game;

export function createRenderer(canvas, horizonUrl = './art/storm-horizon.jpg') {
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: false, powerPreference: 'high-performance' });
  let renderScale = 1, slowTime = 0, fastTime = 0, heavyFrames = 0;
  function fitResolution() {
    const native = Math.min(window.devicePixelRatio || 1, 1.75, Math.sqrt(2400000 / (width * height)));
    renderer.setPixelRatio(native * renderScale);
  }
  // The HUD stays at device resolution. Only the 3D canvas scales under sustained load.
  function trackFrameTime(seconds) {
    if (seconds <= 0) return;
    const sampled = Math.min(.25, seconds);
    slowTime = seconds > .026 ? slowTime + sampled : Math.max(0, slowTime - sampled * 2);
    fastTime = seconds < .0185 ? fastTime + seconds : 0;
    heavyFrames = seconds > .075 ? heavyFrames + 1 : 0;
    const overloaded = heavyFrames >= 3 || slowTime >= 1.4;
    if ((overloaded && renderScale > .55) || (fastTime >= 6 && renderScale < 1)) {
      renderScale = clamp(renderScale + (overloaded ? -.15 : .1), .55, 1);
      slowTime = fastTime = heavyFrames = 0;
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
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  let baseFov = 58;
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
  const stone = [0x77817f, 0x7d7c73, 0x727e84, 0x798078, 0x6c7576, 0x888273].map(c => material(c));
  const edgeStone = material(0x363e42);
  const blackStone = material(0x202a30);
  const brass = material(0xb89a62, { roughness: .54, metalness: .48 });
  const inscription = material(0x9d865b, { roughness: .7, metalness: .22 });
  const charcoal = material(0x201714, { roughness: .96, metalness: 0, emissive: 0x8f2008, emissiveIntensity: .2 });
  const emberCoal = material(0x4c2212, { roughness: .88, metalness: 0, emissive: 0xe45413, emissiveIntensity: .65 });
  const glowCanvas = document.createElement('canvas');
  glowCanvas.width = glowCanvas.height = 128;
  const glowContext = glowCanvas.getContext('2d');
  const glowGradient = glowContext.createRadialGradient(64, 64, 0, 64, 64, 64);
  glowGradient.addColorStop(0, 'rgba(255,207,128,.62)');
  glowGradient.addColorStop(.22, 'rgba(249,129,43,.25)');
  glowGradient.addColorStop(.65, 'rgba(201,76,17,.04)');
  glowGradient.addColorStop(1, 'rgba(156,48,8,0)');
  glowContext.fillStyle = glowGradient; glowContext.fillRect(0, 0, 128, 128);
  const glowTexture = new THREE.CanvasTexture(glowCanvas); glowTexture.colorSpace = THREE.SRGBColorSpace;
  const flameGlow = new THREE.SpriteMaterial({ map: glowTexture, transparent: true, opacity: .8, depthWrite: false, blending: THREE.AdditiveBlending, toneMapped: false });
  ownedMaterials.add(flameGlow);
  flameGlow.addEventListener('dispose', () => glowTexture.dispose());
  function flameMaterial(phase) {
    const mat = new THREE.ShaderMaterial({
      uniforms: { time: { value: 0 }, phase: { value: phase } },
      transparent: true, depthWrite: false, side: THREE.DoubleSide, toneMapped: false,
      vertexShader: `varying vec2 vUv;
        uniform float time; uniform float phase;
        void main() {
          vUv = uv; vec3 p = position;
          p.x += sin(time * 4.7 + uv.y * 10.0 + phase) * uv.y * uv.y * .085;
          gl_Position = projectionMatrix * modelViewMatrix * vec4(p, 1.0);
        }`,
      fragmentShader: `varying vec2 vUv;
        uniform float time; uniform float phase;
        float hash(vec2 p) { return fract(sin(dot(p, vec2(127.1,311.7))) * 43758.5453); }
        float noise(vec2 p) {
          vec2 i=floor(p), f=fract(p); f=f*f*(3.0-2.0*f);
          return mix(mix(hash(i),hash(i+vec2(1.,0.)),f.x),mix(hash(i+vec2(0.,1.)),hash(i+vec2(1.,1.)),f.x),f.y);
        }
        void main() {
          float t = time + phase, y = vUv.y;
          float turbulence = noise(vec2(vUv.x * 5.0, y * 5.0 - t * 2.8));
          float curl = sin(y * 11.0 - t * 5.0) * .06 * y;
          float x = abs(vUv.x - .5 + curl + (turbulence - .5) * .09);
          float width = .31 * pow(max(0., 1.0-y), .8) + .018;
          float body = 1.0 - smoothstep(width * .35, width, x);
          float tip = 1.0 - smoothstep(.65, 1.0, y + turbulence * .2);
          float alpha = body * tip * smoothstep(.0,.075,y);
          float core = (1.0-smoothstep(.02,.14,x)) * (1.0-smoothstep(.18,.6,y));
          vec3 color = mix(vec3(1.2,.16,.012), vec3(1.8,.68,.12), body * (1.0-y*.7));
          color = mix(color, vec3(2.2,1.6,.72), core);
          gl_FragColor = vec4(color, alpha * .91);
          #include <colorspace_fragment>
        }`,
    });
    ownedMaterials.add(mat); return mat;
  }

  let seed = 4817;
  function random() { seed = (seed * 16807) % 2147483647; return (seed - 1) / 2147483646; }
  function ring(parent, radius, thickness, mat, y = .035, segments = 96) {
    const item = mesh(parent, geometry(`ring:${radius}:${thickness}:${segments}`, () => new THREE.TorusGeometry(radius, thickness, 5, segments)), mat, [0, y, 0], [1, 1, 1], false);
    item.rotation.x = Math.PI / 2;
    return item;
  }
  function tileGeometry(inner, outer, count) {
    return geometry(`tile:${inner}:${outer}:${count}`, () => {
      const gap = .0018;
      const angle = TAU / count;
      const shape = new THREE.Shape();
      shape.absarc(0, 0, outer, gap, angle - gap, false);
      shape.lineTo(Math.cos(angle - gap) * inner, Math.sin(angle - gap) * inner);
      shape.absarc(0, 0, inner, angle - gap, gap, true);
      shape.closePath();
      const geo = new THREE.ExtrudeGeometry(shape, { depth: .075, bevelEnabled: true, bevelSegments: 1, bevelSize: .004, bevelThickness: .004, steps: 1, curveSegments: 3 });
      geo.rotateX(-Math.PI / 2);
      return geo;
    });
  }

  scene.add(new THREE.HemisphereLight(0xadc4d8, 0x34352f, 1.35));
  const moonLight = new THREE.DirectionalLight(0xc2d2e1, 2.7);
  moonLight.position.set(-8, 16, -12);
  moonLight.castShadow = true;
  moonLight.shadow.mapSize.set(1024, 1024);
  Object.assign(moonLight.shadow.camera, { left: -14, right: 14, top: 14, bottom: -14, near: .5, far: 48 });
  moonLight.shadow.bias = -.0008;
  moonLight.shadow.normalBias = .035;
  scene.add(moonLight);
  const warmFill = new THREE.DirectionalLight(0xdac8ad, .5);
  warmFill.position.set(7, 5, 10);
  scene.add(warmFill);

  // The floor is an inlaid stone disc, with individually varied radial pavers.
  mesh(scene, geometry('land', () => new THREE.CylinderGeometry(20, 22, .6, 64)), material(0x161f25), [0, -.7, 0], [1, 1, 1]);
  mesh(scene, geometry('foundation', () => new THREE.CylinderGeometry(9.75, 10.15, .58, 96)), edgeStone, [0, -.32, 0]);
  mesh(scene, geometry('floor', () => new THREE.CylinderGeometry(9.25, 9.25, .16, 96)), blackStone, [0, -.09, 0]);
  [[1.7, 3.32, 24], [3.34, 5.14, 32], [5.16, 6.9, 40], [6.92, 8.7, 48], [8.76, 9.11, 48]].forEach(([inner, outer, count], index) => {
    const geo = tileGeometry(inner, outer, count);
    for (let i = 0; i < count; i++) {
      const item = mesh(scene, geo, stone[Math.floor(random() * stone.length)], [0, -.05 + random() * .008, 0]);
      item.rotation.y = i * TAU / count + (index % 2 ? .075 : 0);
      item.castShadow = false;
    }
  });
  mesh(scene, geometry('centerdisc', () => new THREE.CylinderGeometry(1.68, 1.68, .08, 64)), stone[3], [0, -.007, 0]);
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

  const { moonHalo, skyReady } = buildSanctuary({
    horizonUrl,
    // Reserve glossy image-based reflection for damp slabs and reflective metal.
    // The much larger matte surfaces already receive skylight from the hemisphere.
    reflectSky(lightMap) {
      for (const mat of ownedMaterials) {
        if (!mat.isMeshStandardMaterial || (mat.metalness < .28 && !stone.includes(mat))) continue;
        mat.envMap = lightMap;
        mat.envMapIntensity = .34;
        mat.needsUpdate = true;
      }
    },
    scene, geometry, material, basic, mesh, terrainMaterials: stone,
  });

  const bannerWind = hangStandards({ scene, geometry, material, mesh });

  function brazier(x, z, phase) {
    const group = new THREE.Group();
    group.position.set(x, 0, z);
    mesh(group, cylinder, edgeStone, [0, .16, 0], [.44, .32, .44]);
    mesh(group, cylinder, blackStone, [0, .63, 0], [.16, .8, .16]);
    mesh(group, geometry('bowl', () => new THREE.LatheGeometry([
      new THREE.Vector2(.14,-.13), new THREE.Vector2(.23,-.09), new THREE.Vector2(.34,.08),
      new THREE.Vector2(.37,.13), new THREE.Vector2(.33,.13), new THREE.Vector2(.29,.06),
      new THREE.Vector2(.19,-.065), new THREE.Vector2(.14,-.07),
    ], 16)), brass, [0, 1.03, 0]);
    for (let i = 0; i < 3; i++) {
      const log = mesh(group, cylinder, charcoal, [(i - 1) * .07, 1.08 + (i % 2) * .045, 0], [.055, .5, .055]);
      log.rotation.z = Math.PI / 2; log.rotation.y = i * 1.1;
    }
    for (let i = 0; i < 7; i++) {
      const angle = i * TAU / 7;
      mesh(group, octa, emberCoal, [Math.sin(angle) * .19, 1.10, Math.cos(angle) * .19], [.065, .035, .065], false);
    }
    const outer = mesh(group, geometry('practical-flame', () => new THREE.PlaneGeometry(1, 1, 4, 12)), flameMaterial(phase), [0, 1.58, 0], [.72, 1.08, 1], false);
    outer.userData.noStaticBatch = true; outer.userData.noCameraCollision = true;
    const inner = new THREE.Sprite(flameGlow);
    inner.position.set(0, 1.4, 0); inner.scale.set(1.25, 1.5, 1); group.add(inner);
    const light = new THREE.PointLight(0xffa051, 22, 8, 2);
    light.position.set(0, 1.48, 0);
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

  const fighterArt = createFighterArt(geometry, material);
  const contactData = new Uint8Array(64 * 64 * 4);
  for (let y = 0; y < 64; y++) for (let x = 0; x < 64; x++) {
    const distance = Math.hypot((x - 31.5) / 31.5, (y - 31.5) / 31.5);
    const i = (y * 64 + x) * 4;
    contactData[i] = contactData[i + 1] = contactData[i + 2] = 255;
    contactData[i + 3] = Math.round(210 * Math.exp(-distance * distance * 4) * (1 - ease(distance)));
  }
  const contactMap = new THREE.DataTexture(contactData, 64, 64);
  contactMap.magFilter = contactMap.minFilter = THREE.LinearFilter;
  contactMap.needsUpdate = true;
  let contactUsers = 0;
  function limb(parent, x, y, z, upperLength, lowerLength, skinMat, clothMat, wrapMat, leatherMat, leg = false) {
    const pivot = new THREE.Group();
    pivot.position.set(x, y, z);
    parent.add(pivot);
    mesh(pivot, leg ? fighterArt.thigh : fighterArt.upperArm, leg ? clothMat : skinMat,
      [0, -upperLength / 2, 0], [leg ? .115 : .080, upperLength, leg ? .108 : .078]);
    if (!leg) {
      // A short fitted sleeve ends above the biceps, exposing the arm profile.
      mesh(pivot, fighterArt.upperArm, clothMat, [0, -.045, 0], [.087, .17, .085]);
    }
    const joint = new THREE.Group();
    joint.position.y = -upperLength;
    pivot.add(joint);
    mesh(joint, sphere, leg ? clothMat : skinMat, [0, -.002, .008],
      [leg ? .066 : .046, leg ? .054 : .046, leg ? .063 : .044]);
    mesh(joint, leg ? fighterArt.calf : fighterArt.forearm, leg ? clothMat : skinMat,
      [0, -lowerLength / 2, 0], [leg ? .078 : .067, lowerLength, leg ? .076 : .065]);
    mesh(joint, leg ? fighterArt.calf : fighterArt.forearm, wrapMat,
      [0, -lowerLength * .61, 0], [leg ? .081 : .063, lowerLength * .70, leg ? .080 : .064]);
    for (let i = 0; i < 4; i++) {
      const width = leg ? .063 - i * .005 : .055 - i * .004;
      const seam = mesh(joint, cylinder, wrapMat, [0, -lowerLength * (.43 + i * .13), 0], [width, .009, width]);
      seam.rotation.z = .12;
    }
    const foot = new THREE.Group();
    foot.position.y = -lowerLength;
    joint.add(foot);
    if (leg) {
      mesh(foot, sphere, leatherMat, [0, .005, .058], [.074, .053, .139]);
      mesh(foot, sphere, leatherMat, [0, -.023, .064], [.076, .022, .143]);
      mesh(foot, sphere, wrapMat, [0, .039, .014], [.063, .024, .056]);
      for (const offset of [-.019, .010, .039]) {
        const lace = mesh(foot, box, leatherMat, [0, .055, offset], [.083, .008, .009]);
        lace.rotation.y = offset < 0 ? -.18 : .18;
      }
    } else {
      mesh(foot, fighterArt.hand, skinMat);
      // Four curled fingers, a separate thumb and the wrist wrap replace the mitten.
      for (let i = 0; i < 4; i++) {
        const knuckle = mesh(foot, sphere, skinMat, [(i - 1.5) * .024, -.071 + Math.abs(i - 1.5) * .005, .040], [.014, .028, .015]);
        knuckle.rotation.z = (i - 1.5) * -.045;
      }
      const thumb = mesh(foot, sphere, skinMat, [x < 0 ? .047 : -.047, -.037, .033], [.023, .037, .025]);
      thumb.rotation.z = x < 0 ? .48 : -.48;
      mesh(foot, cylinder, wrapMat, [0, .006, 0], [.035, .044, .030]);
    }
    return { pivot, joint, foot };
  }

  function createFighter(id) {
    const enemy = id === 'enemy';
    const root = new THREE.Group();
    const skin = fighterArt.finish(enemy ? 0xad9481 : 0xae8261, 'skin');
    const cloth = fighterArt.finish(enemy ? 0x493b3f : 0x304b4e, 'cloth', { side: THREE.DoubleSide });
    const clothLight = fighterArt.finish(enemy ? 0x72685d : 0x68726a, 'cloth', { side: THREE.DoubleSide });
    const trousers = fighterArt.finish(enemy ? 0x333033 : 0x303b3c, 'cloth');
    const wrap = fighterArt.finish(enemy ? 0xb6a488 : 0xbdb296, 'wrap', { side: THREE.DoubleSide });
    const leather = fighterArt.finish(enemy ? 0x493b32 : 0x3c3830, 'leather');
    const armor = fighterArt.finish(enemy ? 0x66685e : 0x65706a, 'metal');
    const trim = fighterArt.finish(enemy ? 0xa48b5b : 0x9c875e, 'metal', { roughness: .61 });
    const belt = fighterArt.finish(enemy ? 0x7f4d3c : 0xa08b60, 'cloth', { side: THREE.DoubleSide });
    const hair = fighterArt.finish(enemy ? 0x68685e : 0x252725, 'leather', { roughness: 1 });
    const eyes = material(0x35312c, { roughness: .8, metalness: 0 });
    const skinShadow = material(enemy ? 0x786052 : 0x79563f, { roughness: .92, metalness: 0 });
    const clothPanel = (parent, mat, x, y, z, panelWidth, panelLength, front = false) => {
      const hinge = new THREE.Group();
      hinge.position.set(x, y, z); parent.add(hinge);
      mesh(hinge, front ? fighterArt.frontPanel : fighterArt.panel, mat, [0, 0, 0], [panelWidth, panelLength, panelWidth]);
      return hinge;
    };
    const body = new THREE.Group();
    body.position.y = 1.05;
    root.add(body);
    mesh(body, fighterArt.torso, cloth);
    const lapelLeft = clothPanel(body, wrap, -.11, .36, .151, .067, .49, true);
    lapelLeft.rotation.z = -.39;
    const lapelRight = clothPanel(body, clothLight, .09, .36, .165, .092, .48, true);
    lapelRight.rotation.z = .36;
    // A close drape follows the shoulder blades; straps and stitched seams read from behind.
    clothPanel(body, clothLight, 0, .285, -.169, .405, .43);
    const backStrap = mesh(body, box, leather, [-.025, .10, -.205], [.047, .50, .013]);
    backStrap.rotation.z = -.51;
    for (const sign of [-1, 1]) {
      const seam = mesh(body, box, wrap, [sign * .15, .065, -.194], [.006, .35, .007]);
      seam.rotation.z = sign * -.10;
    }
    mesh(body, geometry('fighter-seal', () => new THREE.TorusGeometry(.047, .005, 5, 24)), trim, [.052, .116, -.222], [1, 1.13, 1]);
    mesh(body, box, trim, [.052, .116, -.224], [.006, .072, .008]);
    mesh(body, box, trim, [.052, .116, -.224], [.056, .006, .008]);
    mesh(body, fighterArt.forearm, skin, [0, .442, -.009], [.081, .134, .071]);
    mesh(body, tapered, clothLight, [0, .385, -.026], [.124, .094, .116]);
    const necklace = mesh(body, geometry('fighter-cord', () => new THREE.TorusGeometry(.105, .006, 5, 20, Math.PI)), leather, [0, .322, .177], [1, 1, 1]);
    necklace.rotation.z = Math.PI;
    mesh(body, octa, trim, [0, .205, .194], [.019, .033, .009]);
    const head = new THREE.Group();
    head.position.set(0, .597, .002);
    body.add(head);
    mesh(head, fighterArt.head, skin);
    mesh(head, fighterArt.hair, hair, [0, .002, -.004]);
    const tiedHair = mesh(head, sphere, hair, [0, .087, -.112], [.052, .044, .058]);
    tiedHair.rotation.x = -.38;
    mesh(head, cylinder, leather, [0, .080, -.113], [.053, .012, .048]);
    for (const sign of [-1, 1]) {
      mesh(head, sphere, skin, [sign * .108, -.001, -.008], [.018, .034, .019]);
      mesh(head, sphere, skinShadow, [sign * .119, -.003, .002], [.006, .020, .010]);
      mesh(head, sphere, skinShadow, [sign * .043, .020, .091], [.025, .009, .008]);
      mesh(head, sphere, eyes, [sign * .043, .021, .098], [.013, .0045, .005], false);
      const brow = mesh(head, sphere, hair, [sign * .043, .037, .101], [.027, .005, .006]);
      brow.rotation.z = sign * -.12;
    }
    mesh(head, fighterArt.nose, skin, [0, -.005, .089]);
    mesh(head, sphere, skinShadow, [0, -.065, .090], [.027, .003, .003]);
    mesh(head, sphere, skin, [0, -.072, .090], [.024, .005, .005]);
    if (enemy) mesh(head, fighterArt.beard, hair, [0, -.001, .003]);
    mesh(root, tapered, trousers, [0, .87, 0], [.235, .22, .17]);
    mesh(root, cylinder, leather, [0, .958, 0], [.237, .085, .179]);
    mesh(root, cylinder, belt, [0, .965, 0], [.241, .037, .183]);
    mesh(root, box, trim, [0, .96, .186], [.069, .055, .018]);
    mesh(root, box, leather, [0, .96, .198], [.043, .032, .008]);
    const sash = clothPanel(root, enemy ? wrap : belt, -.095, .93, .170, .105, .49, true);
    const sash2 = clothPanel(root, clothLight, .08, .93, .172, .082, .40, true);
    const coatLeft = clothPanel(root, cloth, -.115, .94, -.164, .215, .50);
    const coatRight = clothPanel(root, clothLight, .115, .94, -.166, .198, .46);
    const leftArm = limb(body, -.292, .31, 0, .29, .285, skin, cloth, wrap, leather);
    const rightArm = limb(body, .292, .31, 0, .29, .285, skin, cloth, wrap, leather);
    const leftLeg = limb(root, -.137, .865, 0, .39, .39, skin, trousers, wrap, leather, true);
    const rightLeg = limb(root, .137, .865, 0, .39, .39, skin, trousers, wrap, leather, true);
    mesh(leftArm.pivot, fighterArt.pauldron, armor, [0, -.015, -.006], [.125, .22, .129]);
    mesh(leftArm.pivot, fighterArt.pauldron, trim, [0, -.060, -.005], [.127, .075, .132]);
    mesh(rightArm.pivot, fighterArt.upperArm, clothLight, [0, -.05, -.002], [.090, .17, .088]);
    for (const arm of [leftArm, rightArm]) {
      mesh(arm.joint, fighterArt.pauldron, leather, [0, -.139, -.002], [.058, .19, .058]);
      mesh(arm.joint, box, armor, [0, -.132, -.055], [.065, .126, .013]);
      mesh(arm.joint, box, trim, [0, -.132, -.065], [.007, .096, .005]);
      for (const sign of [-1, 1]) mesh(arm.joint, sphere, trim, [sign * .023, -.094, -.064], [.005, .005, .004]);
    }
    const mantle = new THREE.Group();
    [-1, 1].forEach(sign => {
      const shoulder = mesh(mantle, fighterArt.pauldron, armor, [sign * .26, .34, -.025], [.148, .25, .163]);
      shoulder.rotation.z = sign * -.27;
      const rim = mesh(mantle, fighterArt.pauldron, trim, [sign * .28, .285, -.028], [.151, .065, .166]);
      rim.rotation.z = sign * -.27;
      const fin = mesh(mantle, octa, armor, [sign * .26, .443, -.055], [.025, .115, .066]);
      fin.rotation.z = sign * -.25;
    });
    mesh(mantle, fighterArt.pauldron, leather, [0, .32, -.09], [.16, .25, .12]);
    body.add(mantle);
    mantle.visible = false;
    scene.add(root);
    const footprint = new THREE.Group();
    const footMat = basic(enemy ? 0xca7653 : STYLE_COLORS[0], { transparent: true, opacity: .18, depthWrite: false });
    const markerArc = geometry('fighter-marker-arc', () => new THREE.TorusGeometry(.46, .005, 4, 20, Math.PI * .26));
    for (const sign of [-1, 1]) {
      const marker = mesh(footprint, markerArc, footMat, [0, .052, 0], [1, 1, 1], false);
      marker.rotation.set(Math.PI / 2, 0, sign > 0 ? -.41 : Math.PI - .41);
    }
    const direction = mesh(footprint, geometry('direction', () => new THREE.ConeGeometry(.035, .075, 3)), footMat, [0, .05, .53], [1, 1, 1], false);
    direction.rotation.x = Math.PI / 2;
    scene.add(footprint);
    const contactMaterial = basic(0x06090c, { map: contactMap, transparent: true, opacity: .48, depthWrite: false });
    contactUsers++;
    contactMaterial.addEventListener('dispose', () => { if (--contactUsers === 0) contactMap.dispose(); });
    const shadow = mesh(scene, geometry('fighter-contact-shadow', () => new THREE.PlaneGeometry(1.12, .92)), contactMaterial, [0, .04, 0], [1, 1, 1], false);
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

  function updateFighter(rig, f, dt, elapsed, enemy, mode, playing) {
    if (!f) { rig.root.visible = rig.footprint.visible = rig.shadow.visible = rig.indicator.visible = false; return; }
    rig.root.visible = rig.footprint.visible = rig.shadow.visible = true;
    const state = String(f.state || 'idle').toLowerCase();
    const style = clamp(f.style || 0, 0, 2);
    const targetScale = enemy && mode === 'boss' ? 1.15 : 1;
    rig.root.scale.setScalar(targetScale);
    rig.mantle.visible = enemy && mode === 'boss';
    rig.belt.color.setHex(enemy ? mode === 'boss' ? 0x8d5440 : 0x6e7770 : STYLE_COLORS[style]);
    if (!enemy) rig.belt.color.multiplyScalar(.62);
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
    rig.footMat.opacity = state === 'dead' ? 0 : f.invulnerable ? .38 : enemy ? .13 : .19;
    rig.shadow.position.set(f.x, .04, f.z);
    rig.indicator.visible = playing && f.health > 0 && (enemy || f.health < f.maxHealth);
    rig.indicator.position.set(f.x, targetScale * 2.15, f.z);
    rig.indicator.quaternion.copy(camera.quaternion);
    const fraction = clamp(f.health / (f.maxHealth || 100), 0, 1);
    rig.healthFill.scale.x = Math.max(.001, fraction);
    rig.healthFill.position.x = -(1 - fraction) * .405;
    updateTelegraph(rig, f, enemy);
  }

  function resetCamera(game) {
    game = renderState(game);
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
    game = renderState(game);
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
    baseFov = camera.aspect < .85 ? 66 : camera.aspect < 1.2 ? 62 : 58;
    camera.fov = baseFov;
    camera.updateProjectionMatrix();
  }

  function render(game, dt = 1 / 60, elapsed = 0, locked = true) {
    dt = clamp(dt || 0, 0, .1);
    elapsed = Number.isFinite(elapsed) ? elapsed : game.elapsed || 0;
    const view = renderState(game);
    if (lastMode !== game.mode || (previousResult && previousResult !== 'playing' && game.result === 'playing')) {
      lastMode = game.mode;
      resetCamera(view);
    }
    previousResult = game.result;
    // Leave the left side of the menu for the encounter selector. Combat is centered.
    const menuOffset = !game.presentationPlaying && camera.aspect > 1.25 ? -Math.min(10, camera.aspect * 5) : 0;
    const effort = game.presentationPlaying && !reducedMotion.matches ? (game.player.sprintBlend || 0) : 0;
    const desiredFov = baseFov + 3.8 * effort;
    const fovDelta = desiredFov - camera.fov;
    if (camera.filmOffset !== menuOffset || Math.abs(fovDelta) > .001) {
      camera.fov += Math.abs(fovDelta) < .012 ? fovDelta : fovDelta * (1 - Math.exp(-7 * dt));
      camera.filmOffset = menuOffset;
      camera.updateProjectionMatrix();
    }
    updateCamera(view, dt, locked);
    updateFighter(fighters.player, view.player, dt, elapsed, false, view.mode, view.presentationPlaying);
    updateFighter(fighters.enemy, view.enemy, dt, elapsed, true, view.mode, view.presentationPlaying);
    for (const batch of rigBatches) batch.sync();
    flames.forEach(flame => {
      const pulse = 1 + Math.sin(elapsed * 11.7 + flame.phase) * .045
        + Math.sin(elapsed * 17.9 + flame.phase) * .025 + Math.sin(elapsed * 4.1 + flame.phase) * .045;
      flame.outer.scale.set(.72, 1.08 * pulse, 1);
      flame.outer.rotation.y = Math.atan2(camera.position.x - flame.x, camera.position.z - flame.z);
      flame.outer.material.uniforms.time.value = elapsed;
      flame.inner.scale.set(1.25 * pulse, 1.5 * pulse, 1);
      flame.light.intensity = 22 * pulse;
    });
    for (let i = 0; i < dustCount; i++) {
      const d = dustBase[i];
      dustPositions[i * 3] = d.x + Math.sin(elapsed * .25 + d.phase) * .28;
      dustPositions[i * 3 + 1] = (d.y + elapsed * d.speed) % 5.5;
      dustPositions[i * 3 + 2] = d.z + Math.cos(elapsed * .2 + d.phase) * .15;
    }
    bannerWind.value = reducedMotion.matches ? 0 : elapsed;
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
    if (skyReady()) renderer.render(scene, camera);
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
  const footstepBeat = id => Math.floor(fighters[id].motion.phase / Math.PI);
  return { render, resize, burst, dispose, stats, resetCamera, orbit, movementBasis, cameraSnapshot, trackFrameTime, footstepBeat };
}
