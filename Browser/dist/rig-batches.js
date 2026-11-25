import * as THREE from './vendor/three.module.js';

// Share each draw of repeated armor, wraps and limbs across a fighter's moving joints.
// The original bones retain ownership of the poses and the mesh materials.
export function batchFighter(scene, root) {
  const partsByType = new Map();
  root.traverse(part => {
    if (!part.isMesh || part.material.transparent) return;
    const key = `${part.geometry.uuid}/${part.material.uuid}/${part.castShadow}/${part.receiveShadow}`;
    if (!partsByType.has(key)) partsByType.set(key, []);
    partsByType.get(key).push(part);
  });
  const batches = [];
  for (const parts of partsByType.values()) {
    if (parts.length < 2) continue;
    const first = parts[0];
    const mesh = new THREE.InstancedMesh(first.geometry, first.material, parts.length);
    mesh.castShadow = first.castShadow;
    mesh.receiveShadow = first.receiveShadow;
    mesh.frustumCulled = false;
    mesh.instanceMatrix.setUsage(THREE.DynamicDrawUsage);
    // Render the instance copy. Keep the source transforms in the joint hierarchy.
    for (const part of parts) part.layers.disableAll();
    scene.add(mesh);
    batches.push({ mesh, parts });
  }
  function shown(part) {
    for (let node = part; node; node = node.parent) if (!node.visible) return false;
    return true;
  }
  return {
    sync() {
      root.updateWorldMatrix(true, true);
      for (const {mesh, parts} of batches) {
        let count = 0;
        for (const part of parts) if (shown(part)) mesh.setMatrixAt(count++, part.matrixWorld);
        mesh.count = count;
        mesh.instanceMatrix.needsUpdate = true;
      }
    },
    dispose() { for (const {mesh} of batches) mesh.dispose(); },
  };
}
