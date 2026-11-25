import * as THREE from './vendor/three.module.js';

// Original courtyard geometry and materials. The bundled panorama provides sky light.
export function buildSanctuary({ scene, horizonUrl, reflectSky, geometry, material, basic, mesh, terrainMaterials = [] }) {
  const TAU = Math.PI * 2;
  let seed = 80631;
  const random = () => { seed = (seed * 16807) % 2147483647; return (seed - 1) / 2147483646; };
  const textures = [];
  function canvasTexture(size, draw, color = true) {
    const canvas = document.createElement('canvas');
    canvas.width = canvas.height = size;
    draw(canvas.getContext('2d'), size);
    const texture = new THREE.CanvasTexture(canvas);
    texture.colorSpace = color ? THREE.SRGBColorSpace : THREE.NoColorSpace;
    texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
    texture.anisotropy = 2;
    textures.push(texture);
    return texture;
  }

  const masonryMap = canvasTexture(512, (ctx, size) => {
    ctx.fillStyle = '#343b40'; ctx.fillRect(0, 0, size, size);
    const rows = 8, cols = 4, h = size / rows, w = size / cols;
    for (let row = 0; row < rows; row++) {
      for (let col = -1; col <= cols; col++) {
        const x = col * w + (row % 2) * w * .5, y = row * h;
        const gray = 114 + Math.floor(random() * 29);
        ctx.fillStyle = `rgb(${gray + 4},${gray + 4},${gray})`;
        ctx.fillRect(x + 2, y + 2, w - 4, h - 4);
        ctx.fillStyle = 'rgba(221,215,194,.23)'; ctx.fillRect(x + 3, y + 3, w - 6, 2);
        ctx.fillStyle = 'rgba(18,25,30,.4)'; ctx.fillRect(x + 3, y + h - 6, w - 6, 3);
        for (let j = 0; j < 12; j++) {
          const px = x + random() * w, py = y + random() * h;
          ctx.fillStyle = random() > .65 ? 'rgba(33,49,42,.23)' : 'rgba(24,31,34,.13)';
          ctx.fillRect(px, py, 1 + random() * 12, 1 + random() * 4);
        }
        if (random() > .66) {
          ctx.beginPath(); ctx.moveTo(x + w * .2, y + 2);
          ctx.lineTo(x + w * .35, y + h * .25); ctx.lineTo(x + w * .3, y + h * .47);
          ctx.strokeStyle = 'rgba(34,43,47,.45)'; ctx.lineWidth = .8; ctx.stroke();
        }
      }
    }
    for (let i = 0; i < 12000; i++) {
      const g = Math.floor(70 + random() * 140);
      ctx.fillStyle = `rgba(${g},${g},${g},.12)`;
      ctx.fillRect(random() * size, random() * size, 1, 1);
    }
  });
  const masonryBump = canvasTexture(512, (ctx, size) => {
    ctx.fillStyle = '#383838'; ctx.fillRect(0, 0, size, size);
    for (let row = 0; row < 8; row++) {
      for (let col = -1; col <= 4; col++) {
        const x = col * 128 + (row % 2) * 64, y = row * 64;
        ctx.fillStyle = '#b9b9b9'; ctx.fillRect(x + 3, y + 3, 122, 58);
        ctx.fillStyle = '#dedede'; ctx.fillRect(x + 5, y + 5, 118, 2);
      }
    }
    for (let i = 0; i < 9000; i++) {
      ctx.fillStyle = random() > .5 ? 'rgba(255,255,255,.12)' : 'rgba(0,0,0,.12)';
      ctx.fillRect(random() * size, random() * size, 1, 1);
    }
  }, false);
  // Correlated albedo, surface relief and roughness keep damp patches physically
  // consistent: darker stone, flatter microstructure and a sharper reflection.
  const surfaceSize = 512;
  const surfaceHeight = new Float32Array(surfaceSize * surfaceSize);
  const surfaceAlbedo = new Uint8Array(surfaceSize * surfaceSize * 4);
  const surfaceRoughness = new Uint8Array(surfaceSize * surfaceSize * 4);
  const noiseGrids = [3, 9, 27, 81].map(frequency => ({ frequency, data: Float32Array.from({ length: frequency * frequency }, random) }));
  const smooth = value => value * value * (3 - 2 * value);
  function noise(u, v, octave) {
    const { frequency, data } = noiseGrids[octave];
    const x = u * frequency, y = v * frequency;
    const ix = Math.floor(x), iy = Math.floor(y), fx = smooth(x - ix), fy = smooth(y - iy);
    const at = (xx, yy) => data[((yy + frequency) % frequency) * frequency + ((xx + frequency) % frequency)];
    const top = at(ix, iy) * (1 - fx) + at(ix + 1, iy) * fx;
    const bottom = at(ix, iy + 1) * (1 - fx) + at(ix + 1, iy + 1) * fx;
    return top * (1 - fy) + bottom * fy;
  }
  function dataTexture(data, color = false) {
    const texture = new THREE.DataTexture(data, surfaceSize, surfaceSize, THREE.RGBAFormat);
    texture.colorSpace = color ? THREE.SRGBColorSpace : THREE.NoColorSpace;
    texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
    texture.magFilter = THREE.LinearFilter; texture.minFilter = THREE.LinearMipmapLinearFilter;
    texture.generateMipmaps = true; texture.anisotropy = 4; texture.needsUpdate = true;
    texture.repeat.set(.45, .45); textures.push(texture);
    return texture;
  }
  function normalMap(height, strength = 8) {
    const data = new Uint8Array(surfaceSize * surfaceSize * 4);
    const sample = (x, y) => height[((y + surfaceSize) % surfaceSize) * surfaceSize + ((x + surfaceSize) % surfaceSize)];
    for (let y = 0; y < surfaceSize; y++) for (let x = 0; x < surfaceSize; x++) {
      const dx = (sample(x - 1, y) - sample(x + 1, y)) * strength;
      const dy = (sample(x, y - 1) - sample(x, y + 1)) * strength;
      const length = Math.hypot(dx, dy, 1), index = (y * surfaceSize + x) * 4;
      data[index] = (dx / length * .5 + .5) * 255;
      data[index + 1] = (dy / length * .5 + .5) * 255;
      data[index + 2] = (1 / length * .5 + .5) * 255; data[index + 3] = 255;
    }
    return dataTexture(data);
  }
  for (let y = 0; y < surfaceSize; y++) for (let x = 0; x < surfaceSize; x++) {
    const u = x / surfaceSize, v = y / surfaceSize;
    const broad = noise(u, v, 0), medium = noise(u, v, 1), grain = noise(u, v, 2), grit = noise(u, v, 3);
    const damp = smooth(Math.max(0, Math.min(1, (broad * .65 + medium * .35 - .40) / .25)));
    const vein = Math.pow(Math.max(0, Math.sin((u * 5 + v * 2 + medium * .32) * TAU)), 20);
    const gritHeight = (grit - .5) * .028 + (grain - .5) * .07;
    surfaceHeight[y * surfaceSize + x] = .5 + (medium - .5) * .18 + gritHeight * (1 - damp * .72) - vein * .019;
    const base = (179 + broad * 40 + (grain - .5) * 31 + (grit - .5) * 18 - vein * 14) * (1 - damp * .34);
    const index = (y * surfaceSize + x) * 4;
    surfaceAlbedo[index] = base * .985; surfaceAlbedo[index + 1] = base; surfaceAlbedo[index + 2] = base * .985;
    surfaceAlbedo[index + 3] = 255;
    const roughness = 221 - damp * 166 + (grain - .5) * 14;
    surfaceRoughness[index] = surfaceRoughness[index + 1] = surfaceRoughness[index + 2] = roughness;
    surfaceRoughness[index + 3] = 255;
  }
  const floorMap = dataTexture(surfaceAlbedo, true);
  const floorNormal = normalMap(surfaceHeight, 10);
  const floorRoughness = dataTexture(surfaceRoughness);
  for (const mat of terrainMaterials) {
    mat.map = floorMap; mat.normalMap = floorNormal; mat.normalScale.set(.72, .72);
    mat.bumpMap = null; mat.roughnessMap = floorRoughness; mat.roughness = .88;
    mat.metalness = .025; mat.envMapIntensity = .5; mat.needsUpdate = true;
  }

  const wallHeight = new Float32Array(surfaceSize * surfaceSize);
  const wallPixels = masonryBump.image.getContext('2d').getImageData(0, 0, surfaceSize, surfaceSize).data;
  for (let y = 0; y < surfaceSize; y++) for (let x = 0; x < surfaceSize; x++) {
    wallHeight[y * surfaceSize + x] = wallPixels[((surfaceSize - 1 - y) * surfaceSize + x) * 4] / 255;
  }
  const wallNormal = normalMap(wallHeight, 2.5); wallNormal.repeat.set(1, 1);

  const stone = material(0xadb0a8, { map: masonryMap, normalMap: wallNormal, normalScale: new THREE.Vector2(.55, .55), roughness: .88, metalness: .025 });
  const paleStone = material(0xc2c0b1, { map: masonryMap, normalMap: wallNormal, normalScale: new THREE.Vector2(.45, .45), roughness: .83, metalness: .025 });
  const darkStone = material(0x859194, { map: masonryMap, normalMap: wallNormal, normalScale: new THREE.Vector2(.55, .55), roughness: .9, metalness: .015 });
  const deepStone = material(0x74838d, { map: masonryMap, roughness: 1, metalness: 0 });
  const distantStone = material(0x536d83, { roughness: 1, metalness: 0 });
  const bronze = material(0xb49c67, { roughness: .62, metalness: .5 });
  const black = material(0x14232c, { roughness: 1, metalness: 0 });
  const warmGlass = basic(0xd6a667, { fog: true, transparent: true, opacity: .73 });
  const coolGlass = basic(0x779baa, { fog: true, transparent: true, opacity: .46 });
  const archMaterials = new Map();
  const archJoints = [];
  stone.addEventListener('dispose', () => textures.forEach(texture => texture.dispose()));
  const box = geometry('sanctuary:box', () => new THREE.BoxGeometry(1, 1, 1));
  const octagon = geometry('sanctuary:octagon', () => new THREE.CylinderGeometry(1, 1, 1, 8));
  const shaft = geometry('sanctuary:shaft', () => new THREE.CylinderGeometry(.83, 1, 1, 10));
  const spire = geometry('sanctuary:spire', () => new THREE.ConeGeometry(1, 1, 8));
  const sphere = geometry('sanctuary:sphere', () => new THREE.SphereGeometry(1, 32, 20));
  const decoration = item => { item.userData.noCameraCollision = true; return item; };

  // A continuous lower terrace grounds the distant ruins. The combat disc sits
  // above it; no decorative collision or playable arena radius changes here.
  const terraceMap = floorMap.clone(); terraceMap.repeat.set(34, 34); terraceMap.needsUpdate = true;
  textures.push(terraceMap);
  const terrace = decoration(mesh(scene, geometry('sanctuary:terrace', () => new THREE.CircleGeometry(52, 96)), material(0x59656c, { map: terraceMap, roughness: 1, metalness: 0 }), [0, -.06, 0], [1, 1, 1], false));
  terrace.rotation.x = -Math.PI / 2;
  terrace.receiveShadow = true;

  const skyCanvas = document.createElement('canvas');
  skyCanvas.width = 1024; skyCanvas.height = 512;
  const skyContext = skyCanvas.getContext('2d');
  const skyGradient = skyContext.createLinearGradient(0, 0, 0, 512);
  skyGradient.addColorStop(0, '#080f1c'); skyGradient.addColorStop(.26, '#132435');
  skyGradient.addColorStop(.41, '#2b3d4d'); skyGradient.addColorStop(.475, '#514b49');
  skyGradient.addColorStop(.515, '#655247'); skyGradient.addColorStop(.59, '#293a44');
  skyGradient.addColorStop(1, '#111c27');
  skyContext.fillStyle = skyGradient; skyContext.fillRect(0, 0, 1024, 512);
  for (let i = 0; i < 100; i++) {
    const x = random() * 1024, y = 105 + random() * 160;
    const radius = 25 + random() * 70;
    const copies = [0];
    if (x < radius) copies.push(1024);
    if (x + radius > 1024) copies.push(-1024);
    for (const offset of copies) {
      const cloud = skyContext.createRadialGradient(x + offset, y, 0, x + offset, y, radius);
      cloud.addColorStop(0, i % 3 ? 'rgba(87,111,126,.055)' : 'rgba(5,16,27,.065)');
      cloud.addColorStop(1, 'rgba(18,31,44,0)');
      skyContext.fillStyle = cloud;
      skyContext.fillRect(x + offset - radius, y - radius, radius * 2, radius * 2);
    }
  }
  // Periodic ridge functions meet exactly at the equirectangular seam. Two
  // subdued layers sit behind the modeled towers without adding geometry.
  for (let layer = 0; layer < 2; layer++) {
    const baseline = layer ? 267 : 254;
    const phase = layer ? 1.35 : .35;
    skyContext.beginPath();
    for (let i = 0; i <= 160; i++) {
      const a = i / 160 * TAU;
      const ridge = 7 + Math.sin(a * 3 + phase) * 5
        + Math.sin(a * 7 + phase) * 3 + Math.abs(Math.sin(a * 17 + phase)) * 7;
      const x = i / 160 * 1024, y = baseline - ridge;
      if (!i) skyContext.moveTo(x, y); else skyContext.lineTo(x, y);
    }
    skyContext.lineTo(1024, 512); skyContext.lineTo(0, 512); skyContext.closePath();
    skyContext.fillStyle = layer ? 'rgba(22,36,48,.54)' : 'rgba(35,51,64,.46)';
    skyContext.fill();
  }
  for (let i = 0; i < 190; i++) {
    skyContext.fillStyle = `rgba(188,206,215,${.12 + random() * .38})`;
    skyContext.fillRect(random() * 1024, 24 + random() * 178, random() > .93 ? 1.5 : .7, .7);
  }
  const skyTexture = new THREE.CanvasTexture(skyCanvas);
  skyTexture.colorSpace = THREE.SRGBColorSpace;
  skyTexture.mapping = THREE.EquirectangularReflectionMapping;
  const releaseFallback = () => skyTexture.dispose();
  stone.addEventListener('dispose', releaseFallback);
  scene.background = skyTexture;
  let disposed = false, skyReady = false;
  stone.addEventListener('dispose', () => { disposed = true; });
  new THREE.TextureLoader().load(horizonUrl, sky => {
    if (disposed) { sky.dispose(); return; }
    sky.colorSpace = THREE.SRGBColorSpace;
    sky.mapping = THREE.EquirectangularReflectionMapping;
    textures.push(sky);
    scene.background = sky;
    stone.removeEventListener('dispose', releaseFallback);
    releaseFallback();
    scene.backgroundIntensity = .86;
    // Broad reflections only need the low spatial frequencies of the sky.
    const lightCanvas = document.createElement('canvas');
    lightCanvas.width = 256; lightCanvas.height = 128;
    lightCanvas.getContext('2d').drawImage(sky.image, 0, 0, 256, 128);
    const lightMap = new THREE.CanvasTexture(lightCanvas);
    lightMap.colorSpace = THREE.SRGBColorSpace;
    lightMap.mapping = THREE.EquirectangularReflectionMapping;
    textures.push(lightMap);
    reflectSky(lightMap);
    skyReady = true;
  }, undefined, () => { skyReady = true; });

  function pointedPoint(u, halfWidth, spring, rise) {
    const alpha = (1 - Math.abs(u)) * Math.PI / 3;
    return new THREE.Vector2(Math.sign(u) * (2 * halfWidth * Math.cos(alpha) - halfWidth), spring + 2 * rise / Math.sqrt(3) * Math.sin(alpha));
  }
  function archGeometry(halfWidth, spring, rise, thickness, depth, start = -1, end = 1) {
    const key = `sanctuary:arch:${halfWidth}:${spring}:${rise}:${thickness}:${depth}:${start}:${end}`;
    return geometry(key, () => {
      const shape = new THREE.Shape();
      const steps = Math.ceil(28 * (end - start) / 2);
      for (let i = 0; i <= steps; i++) {
        const p = pointedPoint(start + (end - start) * i / steps, halfWidth, spring, rise);
        if (!i) shape.moveTo(p.x, p.y); else shape.lineTo(p.x, p.y);
      }
      for (let i = steps; i >= 0; i--) {
        const p = pointedPoint(start + (end - start) * i / steps, halfWidth + thickness, spring, rise + thickness);
        shape.lineTo(p.x, p.y);
      }
      shape.closePath();
      const result = new THREE.ExtrudeGeometry(shape, { depth, bevelEnabled: true, bevelSegments: 1, steps: 1, bevelSize: .025, bevelThickness: .025 });
      result.translate(0, 0, -depth / 2);
      // Segment volumes retain the open doorway for camera collision.
      result.userData.cameraBoxes = [];
      for (let i = 0; i < steps; i += 2) {
        const bounds = new THREE.Box3();
        for (let j = i; j <= Math.min(i + 2, steps); j++) {
          const u = start + (end - start) * j / steps;
          for (const [w, r] of [[halfWidth, rise], [halfWidth + thickness, rise + thickness]]) {
            const p = pointedPoint(u, w, spring, r);
            bounds.expandByPoint(new THREE.Vector3(p.x, p.y, -depth / 2));
            bounds.expandByPoint(new THREE.Vector3(p.x, p.y, depth / 2));
          }
        }
        result.userData.cameraBoxes.push(bounds);
      }
      return result;
    });
  }
  function arch(parent, width, spring, rise, thickness, depth, mat, start = -1, end = 1, z = 0) {
    const geo = archGeometry(width, spring, rise, thickness, depth, start, end);
    let archMaterial = mat;
    if (mat !== bronze && mat !== distantStone) {
      if (!archMaterials.has(mat)) archMaterials.set(mat, material(mat.color.clone().multiplyScalar(.72), {
        map: floorMap, normalMap: floorNormal, normalScale: new THREE.Vector2(.55, .55),
        roughnessMap: floorRoughness, roughness: .96, metalness: .015,
      }));
      archMaterial = archMaterials.get(mat);
    }
    const item = mesh(parent, geo, archMaterial, [0, 0, z]);
    item.userData.cameraCollisionBoxes = geo.userData.cameraBoxes;
    if (thickness > .12 && mat !== distantStone) archJoints.push({ item, width, spring, rise, thickness, depth, start, end });
    return item;
  }
  function column(parent, x, z, height, radius = .34, damaged = false) {
    mesh(parent, box, darkStone, [x, .18, z], [radius * 3, .36, radius * 3]);
    mesh(parent, octagon, paleStone, [x, .47, z], [radius * 1.3, .22, radius * 1.3]);
    const segments = Math.ceil((height - .7) / .62);
    const step = (height - .7) / segments;
    for (let i = 0; i < segments; i++) {
      const segment = mesh(parent, shaft, i % 3 ? stone : paleStone, [x, .64 + step * (i + .5), z], [radius, step - .017, radius]);
      if (damaged && i === segments - 1) segment.rotation.z = .12;
    }
    if (!damaged) {
      mesh(parent, octagon, paleStone, [x, height + .03, z], [radius * 1.28, .22, radius * 1.28]);
      mesh(parent, box, darkStone, [x, height + .22, z], [radius * 2.9, .19, radius * 2.9]);
    }
  }
  function windowPane(parent, x, y, z, width, height, glow = false) {
    const spring = height * .55, rise = height * .45;
    const paneGeometry = geometry(`sanctuary:window:${width}:${height}`, () => {
      const shape = new THREE.Shape();
      shape.moveTo(-width, 0); shape.lineTo(-width, spring);
      for (let i = 0; i <= 24; i++) {
        const p = pointedPoint(-1 + i / 12, width, spring, rise);
        shape.lineTo(p.x, p.y);
      }
      shape.lineTo(width, 0); shape.closePath();
      return new THREE.ShapeGeometry(shape);
    });
    const group = new THREE.Group(); group.position.set(x, y, z); parent.add(group);
    decoration(mesh(group, paneGeometry, black, [0, 0, 0], [1, 1, 1], false));
    const rim = arch(group, width, spring, rise, .09, .09, paleStone, -1, 1, .035);
    decoration(rim);
    for (const sign of [-1, 1]) decoration(mesh(group, box, paleStone, [sign * (width + .04), spring / 2, .035], [.09, spring, .09]));
    if (glow) {
      const pane = decoration(mesh(group, paneGeometry, glow === 'cool' ? coolGlass : warmGlass, [0, .03, .012], [.72, .93, 1], false));
      pane.renderOrder = 1;
    }
    decoration(mesh(group, box, darkStone, [0, height * .4, .08], [.045, height * .78, .04], false));
    decoration(mesh(group, box, darkStone, [0, height * .43, .08], [width * 1.85, .06, .04], false));
  }
  function roseWindow(parent, radius, y, z, mat = bronze) {
    const circle = geometry(`sanctuary:rose:${radius}`, () => new THREE.TorusGeometry(radius, .055, 6, 48));
    decoration(mesh(parent, circle, mat, [0, y, z], [1, 1, 1], false));
    const petalGeometry = geometry(`sanctuary:petal:${radius}`, () => {
      const curve = new THREE.EllipseCurve(0, radius * .36, radius * .18, radius * .35, 0, TAU, false, 0);
      const points = curve.getPoints(18).map(p => new THREE.Vector3(p.x, p.y, 0));
      return new THREE.TubeGeometry(new THREE.CatmullRomCurve3(points, true), 24, .027, 4, true);
    });
    for (let i = 0; i < 8; i++) {
      const petal = decoration(mesh(parent, petalGeometry, mat, [0, y, z], [1, 1, 1], false));
      petal.rotation.z = i * TAU / 8;
    }
    decoration(mesh(parent, geometry(`sanctuary:rosecore:${radius}`, () => new THREE.TorusGeometry(radius * .19, .035, 5, 24)), mat, [0, y, z], [1, 1, 1], false));
  }

  function tower(x, z, height, scale = 1, distant = false, broken = false) {
    const group = new THREE.Group(); group.position.set(x, -.05, z); group.scale.setScalar(scale);
    group.rotation.y = Math.atan2(-x, -z);
    const mat = distant ? distantStone : stone;
    mesh(group, box, distant ? distantStone : darkStone, [0, .3, 0], [2.25, .6, 2.25]);
    const bodyHeight = distant ? height * .62 : height;
    mesh(group, octagon, mat, [0, bodyHeight / 2 + .5, 0], [.91, bodyHeight, .91]);
    if (distant) {
      // Setbacks and an open belfry break the old featureless tower silhouette.
      mesh(group, octagon, distantStone, [0, bodyHeight + .62, 0], [1.02, .22, 1.02]);
      const belfry = new THREE.Group(); belfry.position.y = bodyHeight + .76;
      arch(belfry, .55, .8, 1.0, .2, .6, distantStone);
      for (const sign of [-1, 1]) mesh(belfry, box, distantStone, [sign * .65, .4, 0], [.2, .8, .6]);
      group.add(belfry);
      for (const sign of [-1, 1]) mesh(group, box, distantStone, [sign * .75, bodyHeight * .38, .33], [.17, bodyHeight * .76, .2]);
      height = bodyHeight + 2.2;
    }
    if (!distant) {
      for (const xx of [-.8, .8]) {
        for (const zz of [-.8, .8]) {
          mesh(group, box, darkStone, [xx, height * .35, zz], [.33, height * .7, .33]);
          mesh(group, spire, paleStone, [xx, height * .72 + .2, zz], [.27, 1.1, .27]);
        }
      }
      [2.5, 5.5, height - .25].filter(y => y < height).forEach(y => mesh(group, octagon, paleStone, [0, y, 0], [1.03, .18, 1.03]));
      windowPane(group, 0, 2.5, .924, .32, 2.7, 'warm');
      if (height > 8) windowPane(group, 0, 6.15, .924, .25, 1.9, 'cool');
    }
    mesh(group, octagon, distant ? distantStone : paleStone, [0, height + .58, 0], [1.12, .34, 1.12]);
    if (!broken) {
      mesh(group, spire, distant ? distantStone : darkStone, [0, height + 2.65, 0], [1.14, 3.9, 1.14]);
      decoration(mesh(group, shaft, bronze, [0, height + 4.8, 0], [.045, .85, .045], false));
    } else {
      for (let i = 0; i < 6; i++) {
        const a = i * TAU / 6;
        const shard = mesh(group, box, mat, [Math.sin(a) * .7, height + .85 + random() * .55, Math.cos(a) * .7], [.35, .5 + random() * .7, .32]);
        shard.rotation.z = (random() - .5) * .3;
      }
    }
    scene.add(group);
    return group;
  }

  // Main gate: the eclipse sits in the open lancet, rather than on a solid wall.
  const gate = new THREE.Group(); gate.position.set(0, 0, -13.7);
  const gateWidth = 2.65, spring = 3.05, rise = 4.65;
  arch(gate, gateWidth, spring, rise, .6, 1.25, stone);
  arch(gate, gateWidth + .67, spring, rise + .66, .16, .45, paleStone, -1, 1, .57);
  arch(gate, gateWidth - .08, spring, rise - .12, .075, .13, bronze, -1, 1, .68);
  for (const sign of [-1, 1]) {
    mesh(gate, box, stone, [sign * 2.95, spring / 2, 0], [.61, spring, 1.25]);
    column(gate, sign * 3.48, .14, 5.4, .34);
    column(gate, sign * 2.62, .68, spring - .15, .105);
    mesh(gate, box, darkStone, [sign * 3.24, .2, .1], [1.8, .4, 1.8]);
    mesh(gate, spire, darkStone, [sign * 3.48, 6.35, .14], [.5, 1.65, .5]);
    decoration(mesh(gate, shaft, bronze, [sign * 3.48, 7.3, .14], [.035, .6, .035], false));
    // Flying-buttress fragments make the gate read as part of a larger ruin.
    const buttress = mesh(gate, box, darkStone, [sign * 4.24, 2.5, -.8], [.55, 4.7, 1.3]);
    buttress.rotation.z = sign * -.22;
    windowPane(gate, sign * 4.1, .8, .5, .42, 2.5, false);
  }
  scene.add(gate);
  tower(-5.5, -17.2, 8.6, 1.05, false, false);
  tower(5.9, -17.8, 9.5, 1.0, false, true);

  // Open arcades at every bearing preserve a convincing third-person orbit.
  const arcadeAngles = [Math.PI / 3, 2 * Math.PI / 3, Math.PI, 4 * Math.PI / 3, 5 * Math.PI / 3];
  arcadeAngles.forEach((angle, i) => {
    const group = new THREE.Group();
    group.position.set(Math.sin(angle) * 13.4, 0, -Math.cos(angle) * 13.4);
    group.rotation.y = -angle;
    const broken = i === 1 || i === 4;
    arch(group, 2.2, 2.75, 3.65, .44, .8, i % 2 ? darkStone : stone, -1, broken ? .27 : 1);
    if (!broken) arch(group, 2.15, 2.75, 3.56, .065, .12, paleStone, -1, 1, .47);
    for (const sign of [-1, 1]) {
      column(group, sign * 2.43, 0, broken && sign > 0 ? 2.1 : 2.7, .29, broken && sign > 0);
      mesh(group, box, darkStone, [sign * 2.9, 1.1, -.2], [.55, 2.2, 1.0]);
    }
    if (i === 2) {
      roseWindow(group, .75, 5.05, .48, paleStone);
      decoration(mesh(group, geometry('sanctuary:roseglass', () => new THREE.CircleGeometry(.73, 48)), coolGlass, [0, 5.05, .45], [1, 1, 1], false));
    }
    scene.add(group);
  });

  // Layered skyline: slim intact spires, broken crowns, and low abbey remnants.
  for (let i = 0; i < 13; i++) {
    const angle = (i + .35) * TAU / 13;
    const radius = 24 + random() * 10;
    const height = 7 + random() * 8;
    tower(Math.sin(angle) * radius, -Math.cos(angle) * radius, height, .7 + random() * .65, true, i % 4 === 0);
  }
  for (let i = 0; i < 16; i++) {
    const angle = i * TAU / 16 + .1;
    const radius = 17.6 + random() * 1.6;
    const remnant = new THREE.Group();
    remnant.position.set(Math.sin(angle) * radius, -.055, -Math.cos(angle) * radius);
    remnant.rotation.y = -angle;
    for (let row = 0; row < 3; row++) {
      for (let col = 0; col < 5; col++) {
        if (row === 2 && random() > .58) continue;
        const stoneBlock = mesh(remnant, box, (row + col) % 3 ? deepStone : darkStone,
          [(col - 2) * .72 + (row % 2) * .15, .18 + row * .35, 0], [.7, .335, .64]);
        if (row === 2) stoneBlock.rotation.z = (random() - .5) * .08;
      }
    }
    if (i % 4 === 0) {
      const brokenWindow = new THREE.Group(); brokenWindow.position.set(-1.1, 0, -.25);
      arch(brokenWindow, .72, 1.85, 1.5, .22, .55, deepStone, -1, .35);
      column(brokenWindow, -.83, 0, 1.85, .16);
      column(brokenWindow, .83, 0, 1.25, .16, true);
      remnant.add(brokenWindow);
    }
    scene.add(remnant);
  }
  for (let i = 0; i < 34; i++) {
    const a = random() * TAU, r = 10.7 + random() * 2.4;
    const rubble = mesh(scene, box, i % 2 ? darkStone : stone, [Math.sin(a) * r, .03 + random() * .13, Math.cos(a) * r], [.25 + random() * .75, .16 + random() * .45, .3 + random() * .6]);
    rubble.rotation.set(random() * .24, random() * TAU, random() * .4);
  }
  // A low altar and processional stones add depth beyond the hero doorway.
  mesh(scene, box, darkStone, [0, .3, -23], [3.7, .6, 2.2]);
  mesh(scene, box, paleStone, [0, .71, -23], [3.0, .24, 1.7]);
  mesh(scene, octagon, black, [0, 1.4, -23], [.55, 1.2, .55]);
  for (let i = 0; i < 7; i++) mesh(scene, box, deepStone, [0, -.03, -15.2 - i * .9], [2.9, .09, .72]);

  const medallionMap = canvasTexture(1024, (ctx, size) => {
    ctx.clearRect(0, 0, size, size);
    ctx.translate(size / 2, size / 2);
    const radius = size * .465;
    ctx.strokeStyle = 'rgba(191,157,94,.83)';
    for (const factor of [1, .975, .89, .86, .69, .65, .28]) {
      ctx.beginPath(); ctx.arc(0, 0, radius * factor, 0, TAU);
      ctx.lineWidth = factor === 1 ? 4 : 2; ctx.stroke();
    }
    for (let i = 0; i < 48; i++) {
      ctx.save(); ctx.rotate(i * TAU / 48);
      ctx.lineWidth = 2; ctx.beginPath();
      ctx.moveTo(-5, -radius * .925); ctx.lineTo(5, -radius * .925);
      ctx.moveTo(0, -radius * .91); ctx.lineTo(0, -radius * .95);
      if (i % 3 === 0) { ctx.moveTo(-7, -radius * .95); ctx.lineTo(0, -radius * .93); ctx.lineTo(7, -radius * .95); }
      ctx.stroke(); ctx.restore();
    }
    for (let i = 0; i < 12; i++) {
      ctx.save(); ctx.rotate(i * TAU / 12);
      ctx.beginPath(); ctx.moveTo(0, -radius * .3);
      ctx.bezierCurveTo(-radius * .2, -radius * .48, -radius * .13, -radius * .64, 0, -radius * .82);
      ctx.bezierCurveTo(radius * .13, -radius * .64, radius * .2, -radius * .48, 0, -radius * .3);
      ctx.lineWidth = 2.5; ctx.stroke(); ctx.restore();
    }
    ctx.fillStyle = 'rgba(168,129,69,.32)';
    for (let i = 0; i < 8; i++) {
      ctx.save(); ctx.rotate(i * TAU / 8);
      ctx.beginPath(); ctx.moveTo(0, -radius * .25); ctx.lineTo(-12, -18); ctx.lineTo(0, 0); ctx.lineTo(12, -18); ctx.closePath(); ctx.fill(); ctx.stroke(); ctx.restore();
    }
    ctx.globalCompositeOperation = 'destination-out';
    for (let i = 0; i < 400; i++) {
      ctx.fillStyle = `rgba(0,0,0,${random() * .7})`;
      ctx.fillRect((random() - .5) * size, (random() - .5) * size, 2 + random() * 7, 1 + random() * 3);
    }
  });
  const medallion = decoration(mesh(scene, geometry('sanctuary:medallion', () => new THREE.PlaneGeometry(4.9, 4.9)), basic(0xffffff, { map: medallionMap, transparent: true, opacity: .72, depthWrite: false, polygonOffset: true, polygonOffsetFactor: -1 }), [0, .057, 0], [1, 1, 1], false));
  medallion.rotation.x = -Math.PI / 2;

  // The muted eclipse is a geometric celestial focal point, not a light source
  // that could obscure combat telegraphs with expensive bloom.
  const moonHalo = new THREE.Group(); moonHalo.position.set(0, 7.6, -31.5);
  const coronaMap = canvasTexture(256, (ctx, size) => {
    const gradient = ctx.createRadialGradient(size / 2, size / 2, size * .18, size / 2, size / 2, size / 2);
    gradient.addColorStop(0, 'rgba(225,197,136,0)');
    gradient.addColorStop(.25, 'rgba(225,197,136,.21)');
    gradient.addColorStop(.55, 'rgba(165,190,193,.065)');
    gradient.addColorStop(1, 'rgba(128,160,180,0)');
    ctx.fillStyle = gradient; ctx.fillRect(0, 0, size, size);
  });
  const aura = mesh(moonHalo, geometry('sanctuary:corona', () => new THREE.PlaneGeometry(11, 11)), basic(0xffffff, { map: coronaMap, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, fog: false, side: THREE.DoubleSide }), [0, 0, -.3], [1, 1, 1], false);
  aura.renderOrder = -1;
  mesh(moonHalo, sphere, basic(0xd5c8a3, { fog: false }), [0, 0, 0], [1.86, 1.86, .34], false);
  mesh(moonHalo, sphere, basic(0x17232d, { fog: false }), [.18, .12, .26], [1.77, 1.77, .34], false);
  const haloMat = basic(0xaaa583, { transparent: true, opacity: .65, fog: false, side: THREE.DoubleSide, depthWrite: false });
  for (const radius of [2.12, 2.6, 2.68]) {
    mesh(moonHalo, geometry(`sanctuary:halo:${radius}`, () => new THREE.TorusGeometry(radius, radius === 2.6 ? .017 : .009, 4, 128)), haloMat, [0, 0, -.1], [1, 1, 1], false);
  }
  const marks = [];
  for (let i = 0; i < 32; i++) {
    const a = i * TAU / 32;
    const r1 = i % 4 ? 2.65 : 2.52, r2 = i % 4 ? 2.74 : 2.88;
    marks.push(Math.sin(a) * r1, Math.cos(a) * r1, -.1, Math.sin(a) * r2, Math.cos(a) * r2, -.1);
  }
  // A single thin mesh contains all astronomical graduation marks.
  const markGeometry = geometry('sanctuary:astralmarks', () => {
    const positions = [];
    for (let i = 0; i < marks.length; i += 6) {
      const ax = marks[i], ay = marks[i + 1], bx = marks[i + 3], by = marks[i + 4];
      const length = Math.hypot(bx - ax, by - ay), dx = -(by - ay) / length * .008, dy = (bx - ax) / length * .008;
      positions.push(ax + dx, ay + dy, -.1, ax - dx, ay - dy, -.1, bx + dx, by + dy, -.1, ax - dx, ay - dy, -.1, bx - dx, by - dy, -.1, bx + dx, by + dy, -.1);
    }
    return new THREE.BufferGeometry().setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
  });
  mesh(moonHalo, markGeometry, haloMat, [0, 0, 0], [1, 1, 1], false);
  moonHalo.traverse(item => { item.userData.noStaticBatch = true; item.userData.noCameraCollision = true; });
  scene.add(moonHalo);

  // Radial voussoir joints replace the implausible horizontal brick grid on
  // curved arches. All shallow joints share one lightweight draw call.
  scene.updateMatrixWorld(true);
  const jointPositions = [];
  for (const joint of archJoints) {
    const count = Math.max(4, Math.ceil((joint.end - joint.start) * 7));
    for (let i = 1; i < count; i++) {
      const u = joint.start + (joint.end - joint.start) * i / count;
      if (Math.abs(u) < .035) continue;
      const a = pointedPoint(u, joint.width, joint.spring, joint.rise);
      const b = pointedPoint(u, joint.width + joint.thickness, joint.spring, joint.rise + joint.thickness);
      const length = a.distanceTo(b);
      const dx = -(b.y - a.y) / length * .006, dy = (b.x - a.x) / length * .006;
      const points = [[a.x + dx, a.y + dy], [a.x - dx, a.y - dy], [b.x + dx, b.y + dy], [b.x - dx, b.y - dy]]
        .map(([x, y]) => new THREE.Vector3(x, y, joint.depth / 2 + .032).applyMatrix4(joint.item.matrixWorld));
      for (const index of [0, 1, 2, 1, 3, 2]) jointPositions.push(points[index].x, points[index].y, points[index].z);
    }
  }
  const jointGeometry = geometry('sanctuary:radial-joints', () => new THREE.BufferGeometry().setAttribute('position', new THREE.Float32BufferAttribute(jointPositions, 3)));
  decoration(mesh(scene, jointGeometry, basic(0x313a36, { transparent: true, opacity: .58, depthWrite: false, side: THREE.DoubleSide }), [0, 0, 0], [1, 1, 1], false));
  return { moonHalo, skyReady: () => skyReady };
}
