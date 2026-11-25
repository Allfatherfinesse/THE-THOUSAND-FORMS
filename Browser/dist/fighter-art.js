import * as THREE from './vendor/three.module.js';

// Small original meshes and deterministic surface maps, shared by the two rigs.
// Profiles are elliptical cross-sections, not stacks of primitive body parts.
export function createFighterArt(geometry, material) {
  function profile(name, rows, segments = 20, sculpt) {
    return geometry(`fighter:${name}`, () => {
      const positions = [], uv = [], indices = [];
      for (let row = 0; row < rows.length; row++) {
        const [y, width, front, back = front, center = 0] = rows[row];
        for (let part = 0; part <= segments; part++) {
          const theta = part / segments * Math.PI * 2;
          let x = Math.sin(theta) * width;
          let z = Math.cos(theta) * (Math.cos(theta) >= 0 ? front : back) + center;
          if (sculpt) [x, z] = sculpt(x, y, z, theta);
          positions.push(x, y, z);
          uv.push(part / segments, row / (rows.length - 1));
          if (row < rows.length - 1 && part < segments) {
            const a = row * (segments + 1) + part, b = a + segments + 1;
            indices.push(a, a + 1, b, a + 1, b + 1, b);
          }
        }
      }
      const result = new THREE.BufferGeometry();
      result.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
      result.setAttribute('uv', new THREE.Float32BufferAttribute(uv, 2));
      result.setIndex(indices); result.computeVertexNormals();
      return result;
    });
  }

  const head = profile('adult-head', [
    [-.139, .014, .044, .035, .020], [-.128, .044, .072, .051, .010],
    [-.108, .070, .079, .066], [-.082, .086, .085, .082],
    [-.055, .093, .088, .094], [-.027, .104, .090, .103],
    [.001, .110, .092, .110], [.023, .107, .080, .113],
    [.043, .108, .103, .114], [.066, .107, .102, .112],
    [.095, .099, .093, .106], [.120, .081, .076, .089],
    [.141, .049, .045, .056], [.150, .003, .003, .005],
  ], 28, (x, y, z, theta) => {
    const front = Math.max(0, Math.cos(theta));
    // Cheekbones, recessed orbits and a narrower muzzle create a human profile.
    if (y > -.04 && y < .04) z += .011 * Math.sin(theta * 2) ** 2 * front;
    if (y < -.065) x *= 1 - .10 * front;
    return [x, z];
  });
  const nose = profile('nose', [
    [-.033, .010, .008, .003], [-.022, .019, .017, .004],
    [-.010, .015, .031, .004], [.015, .009, .021, .003],
    [.044, .007, .004, .002],
  ], 12);
  const hair = profile('hair-cap', [
    [-.025, .098, .038, .105, -.019], [.032, .113, .093, .117],
    [.075, .108, .103, .115], [.116, .087, .084, .097],
    [.144, .055, .054, .066], [.156, .003, .003, .005],
  ], 24, (x, y, z, theta) => {
    // Front hairline rises clear of the brow; a small combed ridge catches light.
    if (Math.cos(theta) > 0 && y < .075) z -= (.075 - y) * .72;
    z += Math.sin(theta * 9) * .0015;
    return [x, z];
  });
  const beard = profile('short-beard', [
    [-.142, .017, .043, .002, .023], [-.128, .044, .063, .002, .014],
    [-.106, .064, .077, .002, .009], [-.081, .076, .074, .002, .008],
    [-.064, .063, .066, .002, .019],
  ], 20);
  const upperArm = profile('upper-arm', [
    [-.5, .55, .54], [-.40, .72, .62], [-.20, .91, .79, .73],
    [.07, 1, .83, .88], [.31, .92, .81], [.46, .63, .61], [.5, .18, .2],
  ], 14);
  const forearm = profile('forearm', [
    [-.5, .49, .48], [-.37, .57, .52], [-.12, .70, .65],
    [.14, .88, .87], [.35, .91, .83], [.5, .65, .63],
  ], 14);
  const thigh = profile('thigh', [
    [-.5, .59, .61], [-.36, .70, .70], [-.09, .87, .88],
    [.15, 1, 1.03], [.38, 1.04, .96], [.5, .83, .82],
  ], 16);
  const calf = profile('calf', [
    [-.5, .46, .49], [-.30, .57, .59], [-.02, .80, .76, 1.03],
    [.21, 1, .84, 1.10], [.39, .83, .83], [.5, .69, .74],
  ], 16);
  const hand = profile('closed-hand', [
    [-.105, .024, .031, .029], [-.092, .045, .043, .035],
    [-.067, .052, .045, .038], [-.035, .045, .034, .032],
    [-.005, .033, .026, .026], [.018, .027, .024, .023],
  ], 16);
  const torso = profile('tailored-torso', [
    [-.21, .192, .133, .139], [-.14, .213, .148, .148],
    [-.035, .225, .153, .153], [.09, .255, .167, .164],
    [.20, .282, .176, .168], [.29, .291, .145, .153],
    [.35, .235, .122, .139], [.40, .120, .092, .102],
  ], 24, (x, y, z, theta) => {
    const front = Math.max(0, Math.cos(theta));
    z += Math.sin(theta * 3 + y * 9) * .003;
    if (y > .08 && y < .29) z += Math.sin(Math.abs(theta) * 2) ** 2 * front * .009;
    return [x, z];
  });
  const panel = geometry('fighter:draped-panel', () => {
    const positions = [], uv = [], indices = [], columns = 10, rows = 10;
    for (let y = 0; y <= rows; y++) for (let x = 0; x <= columns; x++) {
      const u = x / columns, v = y / rows;
      const hem = v === 1 ? .018 * Math.sin(u * 37) + .018 * Math.cos(u * 19) : 0;
      const width = 1 - v * .20;
      positions.push((u - .5) * width, -v + hem,
        -.10 * Math.sin(u * Math.PI) + Math.sin(u * Math.PI * 6 + v * .8) * (.012 + v * .027));
      uv.push(u, v);
      if (x < columns && y < rows) {
        const a = y * (columns + 1) + x, b = a + columns + 1;
        indices.push(a, a + 1, b, a + 1, b + 1, b);
      }
    }
    const result = new THREE.BufferGeometry();
    result.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
    result.setAttribute('uv', new THREE.Float32BufferAttribute(uv, 2));
    result.setIndex(indices); result.computeVertexNormals();
    return result;
  });
  const frontPanel = geometry('fighter:draped-panel-front', () => {
    const result = panel.clone();
    result.scale(1, 1, -1);
    const indices = result.index.array;
    for (let i = 0; i < indices.length; i += 3) {
      const swap = indices[i + 1]; indices[i + 1] = indices[i + 2]; indices[i + 2] = swap;
    }
    result.computeVertexNormals();
    return result;
  });
  const pauldron = profile('forged-pauldron', [
    [-.37, .84, .82], [-.31, 1.05, .98], [-.14, 1.06, 1],
    [.10, .94, .92], [.31, .64, .67], [.40, .16, .19],
  ], 16);

  const surfaces = new Map();
  function surface(kind) {
    if (surfaces.has(kind)) return surfaces.get(kind);
    const size = 128, data = new Uint8Array(size * size * 4), relief = new Uint8Array(data.length);
    let seed = 29173;
    const noise = () => { seed = (seed * 16807) % 2147483647; return seed / 2147483647; };
    for (let y = 0; y < size; y++) for (let x = 0; x < size; x++) {
      const n = noise(), grain = noise();
      let value, bump;
      if (kind === 'cloth' || kind === 'wrap') {
        const weave = (x % 4 < 2 ? 1 : -1) * (y % 4 < 2 ? 1 : -1);
        value = 225 + n * 20 + weave * 4;
        bump = 111 + weave * 26 + grain * 30;
        if (kind === 'wrap' && y % 23 < 2) { value -= 17; bump -= 22; }
      } else if (kind === 'metal') {
        const scratched = n > .975 || (y % 31 === 0 && x % 19 < 11);
        value = 224 + grain * 24 - (scratched ? 26 : 0);
        bump = 124 + grain * 10 - (scratched ? 22 : 0);
      } else if (kind === 'skin') {
        value = 239 + grain * 16; bump = 121 + n * 13;
      } else {
        value = 210 + n * 36 - (grain > .94 ? 24 : 0);
        bump = 109 + n * 32 + (grain > .94 ? -22 : 0);
      }
      const i = (y * size + x) * 4;
      data[i] = data[i + 1] = data[i + 2] = value; data[i + 3] = 255;
      relief[i] = relief[i + 1] = relief[i + 2] = bump; relief[i + 3] = 255;
    }
    const map = new THREE.DataTexture(data, size, size);
    map.colorSpace = THREE.SRGBColorSpace;
    const bumpMap = new THREE.DataTexture(relief, size, size);
    for (const texture of [map, bumpMap]) {
      texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
      texture.repeat.set(kind === 'skin' ? 1 : 3, kind === 'skin' ? 1 : 3);
      texture.magFilter = THREE.LinearFilter; texture.minFilter = THREE.LinearMipmapLinearFilter;
      texture.generateMipmaps = true; texture.needsUpdate = true;
    }
    const result = { map, bumpMap, users: 0 };
    surfaces.set(kind, result); return result;
  }
  function finish(color, kind, extra = {}) {
    const maps = surface(kind); maps.users++;
    const result = material(color, {
      roughness: kind === 'metal' ? .52 : kind === 'skin' ? .74 : .96,
      metalness: kind === 'metal' ? .68 : 0,
      map: maps.map, bumpMap: maps.bumpMap, bumpScale: kind === 'metal' ? .0015 : kind === 'skin' ? .0007 : .003,
      ...extra,
    });
    // The renderer already owns materials. Release maps with the final material.
    result.addEventListener('dispose', () => {
      if (--maps.users === 0) { maps.map.dispose(); maps.bumpMap.dispose(); }
    });
    return result;
  }
  return { head, nose, hair, beard, upperArm, forearm, thigh, calf, hand, torso, panel, frontPanel, pauldron, finish };
}
