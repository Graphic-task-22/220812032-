import * as THREE from 'three';

export default function createHouse({
  baseColor = 0xadd8e6,
  roofColor = 0x4682b4,
  baseSize = [40,20,40],
  roofHeight = 16,
  roofRadius = 36,
  
} = {}) {
  const group = new THREE.Group();

  // 主体
  const base = new THREE.Mesh(
    new THREE.BoxGeometry(...baseSize), 
    new THREE.MeshLambertMaterial({ color: baseColor })
  );
  base.position.y = baseSize[1] / 2;
  group.add(base);

  // 屋顶
  const roof = new THREE.Mesh(
    new THREE.ConeGeometry(roofRadius, roofHeight, 4),
    new THREE.MeshLambertMaterial({ color: roofColor })
  );
  roof.position.y = baseSize[1] + roofHeight / 2;
  roof.rotation.y = Math.PI / 4;
  group.add(roof);

  // 门窗
  const door = new THREE.Mesh(
    new THREE.BoxGeometry(4, 6, 0.5),
    new THREE.MeshLambertMaterial({ color: 0x654321 })
  );
  door.position.set(0, 3, baseSize[2] / 2 + 0.25);
  group.add(door);

  const winMaterial = new THREE.MeshLambertMaterial({ color: 0x87ceeb, transparent: true, opacity: 0.5 });
  const window1 = new THREE.Mesh(new THREE.BoxGeometry(3, 3, 0.2), winMaterial);
  window1.position.set(-6, 6, baseSize[2] / 2 + 0.25);
  const window2 = window1.clone();
  window2.position.x = 6;
  group.add(window1, window2);

  return group;
}