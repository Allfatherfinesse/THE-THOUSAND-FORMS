import * as THREE from './vendor/three.module.js';

export function hangStandards({ scene, geometry, material, mesh }) {
  const canvas = document.createElement('canvas');
  canvas.width = 192;
  canvas.height = 512;
  const ctx = canvas.getContext('2d');
  const dye = ctx.createLinearGradient(0, 0, 0, 512);
  dye.addColorStop(0, '#7e323b');
  dye.addColorStop(.55, '#842f39');
  dye.addColorStop(1, '#46363d');
  ctx.fillStyle = dye;
  ctx.fillRect(0, 0, 192, 512);
  ctx.strokeStyle = '#b09a6c';
  ctx.lineWidth = 2;
  ctx.strokeRect(10, -4, 172, 464);
  ctx.lineWidth = 1;
  ctx.strokeRect(14, -4, 164, 459);

  // The worn standard carries the same seal as the courtyard gate.
  ctx.save();
  ctx.translate(96, 156);
  ctx.scale(1.75, 1.75);
  ctx.lineWidth = 2.5;
  ctx.beginPath();
  for (let i = 0; i <= 6; i++) {
    const a = i * Math.PI / 3;
    const x = 26 * Math.sin(a), y = -33 * Math.cos(a);
    if (i === 0) ctx.moveTo(x, y);
    else ctx.lineTo(x, y);
  }
  for (const x of [-10, 0, 10]) {
    const h = x ? 17 : 25;
    ctx.moveTo(x, -h); ctx.lineTo(x, h);
  }
  for (const y of [-10, 0, 10]) {
    const w = y ? 16 : 20;
    ctx.moveTo(-w, y); ctx.lineTo(w, y);
  }
  ctx.stroke();
  ctx.restore();
  let seed = 72381;
  const random = () => { seed = (seed * 16807) % 2147483647; return seed / 2147483647; };
  for (let i = 0; i < 5000; i++) {
    ctx.fillStyle = i % 3 ? 'rgba(29,18,20,.15)' : 'rgba(207,170,143,.16)';
    ctx.fillRect(random() * 192, random() * 512, .5 + random() * 2, 1 + random() * 5);
  }
  ctx.globalCompositeOperation = 'destination-out';
  ctx.fillStyle = '#000';
  for (let i = 0; i < 35; i++) {
    const x = random() * 192, y = 300 + random() * 212;
    ctx.beginPath(); ctx.ellipse(x, y, .6 + random() * 1.4, 2 + random() * 6, -.15, 0, Math.PI * 2); ctx.fill();
  }
  const map = new THREE.CanvasTexture(canvas);
  map.colorSpace = THREE.SRGBColorSpace;
  const cloth = material(0xffeddd, { map, roughness: 1, metalness: 0, side: THREE.DoubleSide, alphaTest: .48 });
  cloth.addEventListener('dispose', () => map.dispose());
  const time = { value: 0 };
  cloth.onBeforeCompile = shader => {
    shader.uniforms.windTime = time;
    shader.vertexShader = 'uniform float windTime;\n' + shader.vertexShader.replace('#include <begin_vertex>', `
      #include <begin_vertex>
      float loose = 1.0 - uv.y;
      float gust = sin(2.6 * loose + windTime * 1.1 + position.x);
      transformed.z += loose * loose * (.15 * gust + .055 * sin(11.0 * uv.x + 3.0 * loose - 1.8 * windTime));
      transformed.x += .06 * loose * gust;
    `);
  };
  const iron = material(0x776854, { roughness: .7, metalness: .58 });
  const rod = geometry('standard:rod', () => new THREE.CylinderGeometry(.035, .035, 1.65, 8));
  const top = geometry('standard:cloth', () => {
    const sheet = new THREE.PlaneGeometry(1.42, 3.65, 24, 16);
    const positions = sheet.attributes.position;
    const uv = sheet.attributes.uv;
    for (let i = 0; i < positions.count; i++) {
      const u = uv.getX(i), v = uv.getY(i), loose = 1 - v;
      const tear = .37 * Math.abs(2 * u - 1) + .17 * Math.sin(u * 25) ** 2 + .1 * Math.cos(u * 47);
      const split = Math.max(0, 1 - Math.abs(u - .29) * 18) * .64;
      positions.setXYZ(i, positions.getX(i), positions.getY(i) - 1.825 + (tear + split) * loose ** 6,
        (.062 + .12 * loose) * Math.sin(u * 17 + loose * 1.5) + .09 * loose * Math.sin(5 * loose));
    }
    sheet.computeVertexNormals();
    return sheet;
  });
  function hang(x, y, z, yaw, scale) {
    const mount = new THREE.Group();
    mount.position.set(x, y, z);
    mount.rotation.y = yaw;
    mount.scale.setScalar(scale);
    scene.add(mount);
    const bar = mesh(mount, rod, iron, [0, .025, 0], [1, 1, 1], false);
    bar.rotation.z = Math.PI / 2;
    const banner = mesh(mount, top, cloth, [0, 0, .04], [1, 1, 1], false);
    banner.receiveShadow = true;
    bar.userData.noCameraCollision = banner.userData.noCameraCollision = true;
  }
  hang(-4.05, 5.45, -12.8, .08, 1.03);
  hang(4.05, 5.45, -12.8, -.08, 1.03);
  hang(-12.18, 3.7, 4.9, 1.98, .8);
  hang(12.15, 3.7, -4.9, -1.13, .8);
  return time;
}
